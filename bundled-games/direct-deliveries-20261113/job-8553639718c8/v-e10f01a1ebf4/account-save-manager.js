const GUEST_SAVE_KEY = 'pocketwild-opening-v1';
const DEVICE_SAVE_KEY = 'pocketwild-device-save-v1';
const ACCOUNT_SAVE_PREFIX = 'pocketwild-account-save-v1:';
const ACCOUNT_BACKUP_PREFIX = 'pocketwild-account-conflict-v1:';
const LOCAL_BACKUP_SUFFIX = ':backup';
const MALFORMED_BACKUP_PREFIX = 'pocketwild-malformed-save-v1:';
const FIREBASE_VERSION = '11.10.0';
const RESTORE_TIMEOUT_MS = 7000;
const META_FIELDS = new Set(['saveVersion', 'revision', 'lastUpdated', 'lastSynced', 'playerId', 'userId']);
let appCheckDiagnosticCaptured = false;
let firebaseRuntimeDiagnosticCaptured = false;
function redactAppCheckDiagnosticText(value, siteKey = '') {
  let text;
  try {
    text = String(value ?? '').slice(0, 1200);
  } catch {
    text = '[unavailable]';
  }
  if (siteKey) text = text.split(siteKey).join('[REDACTED]');
  return text.replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [REDACTED]').replace(/(["']?[A-Za-z0-9_-]*(?:access[_-]?token|id[_-]?token|refresh[_-]?token|recaptcha[_-]?token|token|password|authorization|cookie|(?:x-goog-)?api[_-]?key|site[_-]?key|secret[_-]?key|key)["']?\s*[:=]\s*["']?)[^"'\s,;}&]+/gi, '$1[REDACTED]').replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[REDACTED]').replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[REDACTED]').replace(/\b[A-Za-z0-9_-]{100,}\b/g, '[REDACTED]');
}
function diagnosticPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null ? value : null;
  } catch {
    return null;
  }
}
function parseDiagnosticObject(value) {
  const object = diagnosticPlainObject(value);
  if (object) return object;
  if (typeof value !== 'string' || value.length > 12000) return null;
  try {
    return diagnosticPlainObject(JSON.parse(value));
  } catch {
    return null;
  }
}
function extractSafeAppCheckServerError(sdkError, siteKey) {
  try {
    const chain = [];
    let current = sdkError;
    for (let depth = 0; current && depth < 4; depth += 1) {
      chain.push(current);
      current = current.cause;
    }
    let httpStatus = null;
    for (const error of chain) {
      const customData = diagnosticPlainObject(error?.customData);
      const status = Number(customData?.httpStatus ?? customData?.statusCode);
      if (Number.isInteger(status) && status >= 100 && status <= 599) httpStatus = status;
      const candidates = [customData?.response, customData?.serverResponse, customData?.error, error?.serverResponse, error?.response, customData];
      for (const value of candidates) {
        const response = parseDiagnosticObject(value);
        if (!response) continue;
        const body = diagnosticPlainObject(response.error) || response;
        const details = Array.isArray(body.details) ? body.details : Array.isArray(body.errors) ? body.errors : [];
        const hasSafeFields = ['code', 'status', 'message'].some(key => body[key] !== undefined) || details.length > 0;
        if (!hasSafeFields) continue;
        const safe = {};
        if (Number.isInteger(Number(response.httpStatus)) && Number(response.httpStatus) >= 100 && Number(response.httpStatus) <= 599) {
          httpStatus = Number(response.httpStatus);
        }
        for (const key of ['code', 'status', 'message']) {
          if (body[key] !== undefined && ['string', 'number'].includes(typeof body[key])) {
            safe[key] = typeof body[key] === 'string' ? redactAppCheckDiagnosticText(body[key], siteKey).slice(0, 500) : body[key];
          }
        }
        if (details.length) {
          safe.details = details.slice(0, 4).map(detail => {
            const item = diagnosticPlainObject(detail);
            if (!item) return null;
            const safeDetail = {};
            for (const key of ['@type', 'reason', 'domain', 'message', 'description']) {
              if (typeof item[key] === 'string') {
                safeDetail[key] = redactAppCheckDiagnosticText(item[key], siteKey).slice(0, 240);
              }
            }
            return Object.keys(safeDetail).length ? safeDetail : null;
          }).filter(Boolean);
        }
        if (httpStatus !== null) safe.httpStatus = httpStatus;
        return safe;
      }
    }
    return httpStatus === null ? null : {
      httpStatus
    };
  } catch {
    return null;
  }
}
function isAppCheckExchangeRequest(input) {
  try {
    const requestUrl = typeof input === 'string' ? input : input?.url;
    const url = new URL(requestUrl, globalThis.location?.href || 'https://invalid.local');
    return url.hostname.toLowerCase() === 'firebaseappcheck.googleapis.com' && /:exchangeRecaptchaEnterpriseToken$/.test(url.pathname);
  } catch {
    return false;
  }
}
function beginAppCheckResponseCapture() {
  const originalFetch = globalThis.fetch;
  if (typeof originalFetch !== 'function') return {
    read: async () => null,
    stop() {}
  };
  let active = true;
  let captured = null;
  let responseBodyPromise = Promise.resolve(null);
  const wrappedFetch = function (...args) {
    const shouldCapture = active && !captured && isAppCheckExchangeRequest(args[0]);
    const result = Reflect.apply(originalFetch, this || globalThis, args);
    if (!shouldCapture) return result;
    return Promise.resolve(result).then(response => {
      if (response && typeof response.clone === 'function') {
        captured = {
          httpStatus: Number(response.status) || null,
          body: null
        };
        try {
          responseBodyPromise = Promise.resolve(response.clone().json()).then(body => {
            captured.body = body;
            return captured;
          }).catch(() => captured);
        } catch {
          responseBodyPromise = Promise.resolve(captured);
        }
      }
      return response;
    });
  };
  let installed = false;
  try {
    globalThis.fetch = wrappedFetch;
    installed = globalThis.fetch === wrappedFetch;
  } catch {
    // If fetch cannot be observed, the SDK error fields are still inspected below.
  }
  return {
    async read() {
      if (!captured) return null;
      let timeoutId;
      await Promise.race([responseBodyPromise, new Promise(resolve => {
        timeoutId = setTimeout(resolve, 350);
      })]);
      if (timeoutId) clearTimeout(timeoutId);
      return captured;
    },
    stop() {
      active = false;
      try {
        if (installed && globalThis.fetch === wrappedFetch) globalThis.fetch = originalFetch;
      } catch {
        // Diagnostic cleanup must not affect token acquisition or local play.
      }
    }
  };
}
function appCheckDiagnostic(sdkError, siteKey, capturedResponse = null) {
  let sdkCode = 'unknown';
  let sdkMessage = 'No SDK error message was exposed.';
  try {
    sdkCode = sdkError?.code || sdkCode;
  } catch {/* Keep safe fallback. */}
  try {
    sdkMessage = sdkError?.message || sdkMessage;
  } catch {/* Keep safe fallback. */}
  let serverResponse = null;
  if (capturedResponse) {
    const responseError = {
      customData: {
        httpStatus: capturedResponse.httpStatus,
        serverResponse: capturedResponse.body
      }
    };
    serverResponse = extractSafeAppCheckServerError(responseError, siteKey);
    if (!serverResponse && capturedResponse.httpStatus) serverResponse = {
      httpStatus: capturedResponse.httpStatus
    };
  }
  if (!serverResponse) serverResponse = extractSafeAppCheckServerError(sdkError, siteKey);
  return {
    sdkError: {
      code: redactAppCheckDiagnosticText(sdkCode, siteKey).slice(0, 160),
      message: redactAppCheckDiagnosticText(sdkMessage, siteKey)
    },
    serverResponse
  };
}
function accountSaveKey(userId) {
  return `${ACCOUNT_SAVE_PREFIX}${userId}`;
}
function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
function withoutMeta(gameSave) {
  const result = {};
  for (const [key, value] of Object.entries(gameSave || {})) {
    if (!META_FIELDS.has(key)) result[key] = value;
  }
  return cloneJson(result);
}
function isPocketwildGameSave(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && ['world', 'playerName', 'avatar', 'petId', 'stage', 'completed'].some(key => Object.hasOwn(value, key)));
}
function normalizeLocalSave(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  let game;
  try {
    game = withoutMeta(value);
  } catch {
    return null;
  }
  if (!isPocketwildGameSave(game)) return null;
  return {
    game,
    saveVersion: Math.max(1, Math.floor(Number(value.saveVersion) || 1)),
    revision: Math.max(0, Math.floor(Number(value.revision) || 0)),
    lastUpdated: Math.max(0, Math.floor(Number(value.lastUpdated) || 0)),
    lastSynced: Math.max(0, Math.floor(Number(value.lastSynced) || 0)),
    playerId: typeof value.playerId === 'string' ? value.playerId : null
  };
}
function normalizeCloudSave(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  // Accept the former { data: gameSave } envelope when reading existing cloud
  // records, while new players/{uid} documents keep the game state top-level.
  const payload = value.data && typeof value.data === 'object' && !Array.isArray(value.data) ? value.data : value;
  let game;
  try {
    game = withoutMeta(payload);
  } catch {
    return null;
  }
  if (!isPocketwildGameSave(game)) return null;
  return {
    game,
    saveVersion: Math.max(1, Math.floor(Number(value.saveVersion) || 1)),
    revision: Math.max(0, Math.floor(Number(value.revision) || 0)),
    lastUpdated: Math.max(0, Math.floor(Number(value.lastUpdated) || 0)),
    lastSynced: Math.max(0, Math.floor(Number(value.lastSynced) || 0))
  };
}
function sameGame(left, right) {
  return JSON.stringify(left || null) === JSON.stringify(right || null);
}
function newestAccountRecord(local, cloud) {
  if (!local) return cloud;
  if (!cloud) return local;
  if (local.lastUpdated !== cloud.lastUpdated) return local.lastUpdated > cloud.lastUpdated ? local : cloud;
  if (local.revision !== cloud.revision) return local.revision > cloud.revision ? local : cloud;
  return local;
}
function localEnvelope(record, userId, lastSynced = record?.lastSynced || 0) {
  if (!record) return null;
  return {
    ...cloneJson(record.game),
    saveVersion: 1,
    revision: Math.max(0, Math.floor(Number(record.revision) || 0)),
    lastUpdated: Math.max(0, Math.floor(Number(record.lastUpdated) || 0)),
    lastSynced: Math.max(0, Math.floor(Number(lastSynced) || 0)),
    playerId: userId || null
  };
}
function cloudEnvelope(record, userId) {
  return {
    ...cloneJson(record.game),
    saveVersion: 1,
    revision: Math.max(0, Math.floor(Number(record.revision) || 0)),
    lastUpdated: Math.max(0, Math.floor(Number(record.lastUpdated) || 0)),
    lastSynced: Math.max(0, Math.floor(Number(record.lastSynced) || 0)),
    userId
  };
}
function publicUser(user) {
  return user ? {
    uid: user.uid,
    email: user.email || ''
  } : null;
}
function isTransientCloudConnectivityError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return ['unavailable', 'auth/network-request-failed', 'network-request-failed', 'pocketwild/restore-timeout'].includes(code) || /client is offline|failed to fetch|network request failed/i.test(message);
}
function isFirestorePermissionDenied(error) {
  return String(error?.code || '') === 'permission-denied';
}
function safeFirestoreDiagnosticMessage(error, userId) {
  let message = 'No Firestore error message was exposed.';
  try {
    message = String(error?.message ?? message).slice(0, 500);
  } catch {/* Keep safe fallback. */}
  if (userId) message = message.split(userId).join('[UID]');
  return message.replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [REDACTED]').replace(/(["']?[A-Za-z0-9_-]*(?:access[_-]?token|id[_-]?token|refresh[_-]?token|token|password|authorization|cookie|(?:x-goog-)?api[_-]?key|site[_-]?key|secret[_-]?key)["']?\s*[:=]\s*["']?)[^"'\s,;}&]+/gi, '$1[REDACTED]').replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]').replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[REDACTED]').replace(/\b[A-Za-z0-9_-]{100,}\b/g, '[REDACTED]');
}
function safeSaveDiagnosticError(error, userId = '') {
  let code = 'unknown';
  try {
    code = String(error?.code || code).slice(0, 120);
  } catch {/* Keep safe fallback. */}
  return {
    code: safeFirestoreDiagnosticMessage({
      message: code
    }, userId),
    message: safeFirestoreDiagnosticMessage(error, userId)
  };
}
function logFirestoreSaveReadFailure(error, path, userId, authUidMatchesDocumentId) {
  try {
    let code = 'unknown';
    try {
      code = String(error?.code || code).slice(0, 120);
    } catch {/* Keep safe fallback. */}
    // Cloud restore failures are recoverable: the local/account cache remains usable.
    // Keep actionable permission details visible without reporting them as uncaught errors.
    console.warn('[Pocketwild Firestore save diagnostic]', {
      operation: 'get',
      path,
      code,
      authUidMatchesDocumentId: Boolean(authUidMatchesDocumentId),
      message: safeFirestoreDiagnosticMessage(error, userId)
    });
  } catch {
    // Diagnostics must never interrupt account restore or local-save recovery.
  }
}
function withRestoreTimeout(operation, message = 'Pocketwild account restore took too long.') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(message);
      error.code = 'pocketwild/restore-timeout';
      reject(error);
    }, RESTORE_TIMEOUT_MS);
  });
  return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
}
function authMessage(error) {
  const code = error?.code || '';
  const messages = {
    unavailable: 'Pocketwild couldn’t reach the cloud save. Your local world is safe; check your connection and try again.',
    'permission-denied': 'Firestore denied access to this account save. Your local world is safe. Check the active Firebase rules and App Check configuration; no cloud data was changed.',
    'pocketwild/restore-timeout': 'Account restore is taking too long. Your local world is safe, so you can keep playing and try again later.',
    'auth/email-already-in-use': 'That email already has a Pocketwild account. Try logging in instead.',
    'auth/invalid-email': 'Please check the email address and try again.',
    'auth/weak-password': 'Choose a longer password (at least 6 characters).',
    'auth/invalid-credential': 'That email and password did not match. Please try again.',
    'auth/user-not-found': 'We couldn’t find an account with that email. You can create one instead.',
    'auth/wrong-password': 'That email and password did not match. Please try again.',
    'auth/too-many-requests': 'There have been a few tries. Please wait a little and try again.',
    'auth/network-request-failed': 'Pocketwild couldn’t reach the account service. Your local save is safe; check your connection and try again.',
    'auth/operation-not-allowed': 'Email and password sign-in has not been enabled for this Firebase project yet.',
    'auth/unauthorized-domain': 'This game’s domain has not been added to the Firebase project’s authorized domains.',
    'auth/app-check-token-is-invalid': 'Pocketwild could not verify this sign-in from this browser. Please reload and try again; if it continues, the game’s App Check provider or hosting-domain setup needs attention. Your local save is safe.',
    'auth/app-check-token-is-missing': 'Pocketwild did not receive a sign-in verification token. Please reload and try again; if it continues, the game’s App Check setup needs attention. Your local save is safe.',
    'pocketwild/app-check-not-configured': 'Account sign-in protection is not configured for this Pocketwild build. Your local save is safe; please continue as a guest or contact the game administrator.',
    'pocketwild/app-check-debug-not-allowed': 'App Check debug mode is restricted to local development. Your local save is safe.',
    'pocketwild/app-check-already-initialized': 'Pocketwild found a second App Check setup on this page. Remove the duplicate setup and reload; your local save is safe.',
    'pocketwild/app-check-token-unavailable': 'Pocketwild could not obtain a sign-in verification token. Check the App Check provider and this hosting domain, then try again. Your local save is safe.'
  };
  return messages[code] || error?.message || 'That didn’t work just now. Your local progress is still safe.';
}
/**
 * Provider-neutral save coordinator. Firebase is deliberately confined to the
 * provider above; gameplay only hands this manager a whole player-save object.
 */
export class PlayerSaveManager {
  constructor({
    config = null,
    debounceMs = 650
  } = {}) {
    this.config = null;
    this.configured = false;
    this.provider = null;
    this.debounceMs = debounceMs;
    this.user = null;
    this.pending = null;
    this.cloudReady = false;
    this.lastError = '';
    this.writeTimer = 0;
    this.pendingWrite = null;
    this.cloudWriteInFlight = false;
    this.lastUpdated = 0;
    this.revision = 0;
    this.lastSynced = 0;
    this.localConflictRevision = 0;
    this.onConflict = null;
    this.diagnostics = {
      events: [],
      lastLocalSuccessAt: null,
      lastLocalFailureAt: null,
      lastCloudReadSuccessAt: null,
      lastCloudReadFailureAt: null,
      lastCloudWriteSuccessAt: null,
      lastCloudWriteFailureAt: null,
      localSave: {
        at: null,
        result: 'not-observed',
        target: '',
        primaryWritten: null,
        deviceSnapshotWritten: null,
        code: '',
        message: ''
      },
      cloudRead: {
        at: null,
        result: 'not-observed',
        path: '',
        code: '',
        message: ''
      },
      cloudWrite: {
        at: null,
        result: 'not-observed',
        path: '',
        code: '',
        message: ''
      },
      lastCloudConflict: {
        at: null,
        result: 'not-observed',
        resolution: ''
      },
      auth: {
        at: null,
        signedIn: false,
        uidMatchesExpected: null,
        source: ''
      },
      appCheck: {
        at: null,
        result: 'not-requested',
        errorCode: null,
        message: ''
      }
    };
    if (this.provider) this.provider.onDiagnostic = (event, details) => this.recordDiagnostic(event, details);
  }
  recordDiagnostic(event, details = {}) {
    const entry = {
      at: Date.now(),
      event,
      ...details
    };
    this.diagnostics.events.push(entry);
    if (this.diagnostics.events.length > 60) this.diagnostics.events.splice(0, this.diagnostics.events.length - 60);
    if (event === 'local-save-completed') {
      this.diagnostics.lastLocalSuccessAt = entry.at;
      this.diagnostics.localSave = {
        at: entry.at,
        result: 'saved',
        target: details.target || '',
        primaryWritten: Boolean(details.primaryWritten),
        deviceSnapshotWritten: Boolean(details.deviceSnapshotWritten),
        code: '',
        message: ''
      };
    }
    if (event === 'local-save-failed') {
      this.diagnostics.lastLocalFailureAt = entry.at;
      this.diagnostics.localSave = {
        at: entry.at,
        result: 'failed',
        target: details.target || '',
        primaryWritten: Boolean(details.primaryWritten),
        deviceSnapshotWritten: Boolean(details.deviceSnapshotWritten),
        code: details.code || 'unknown',
        message: details.message || ''
      };
    }
    if (event === 'cloud-save-read-completed') {
      this.diagnostics.lastCloudReadSuccessAt = entry.at;
      this.diagnostics.cloudRead = {
        at: entry.at,
        result: details.result || 'completed',
        path: details.path || '',
        code: '',
        message: ''
      };
      if (Number.isFinite(details.lastSynced) && details.lastSynced > 0) {
        this.lastSynced = Math.max(this.lastSynced, details.lastSynced);
      }
    }
    if (event === 'cloud-save-read-failed') {
      this.diagnostics.lastCloudReadFailureAt = entry.at;
      this.diagnostics.cloudRead = {
        at: entry.at,
        result: 'failed',
        path: details.path || '',
        code: details.code || 'unknown',
        message: details.message || ''
      };
    }
    if (event === 'cloud-save-write-completed') {
      this.diagnostics.cloudWrite = {
        at: entry.at,
        result: details.result || 'completed',
        path: details.path || '',
        code: '',
        message: ''
      };
      if (details.result === 'committed') {
        this.diagnostics.lastCloudWriteSuccessAt = Number(details.lastSynced) || entry.at;
      }
    }
    if (event === 'cloud-save-write-failed') {
      this.diagnostics.lastCloudWriteFailureAt = entry.at;
      this.diagnostics.cloudWrite = {
        at: entry.at,
        result: 'failed',
        path: details.path || '',
        code: details.code || 'unknown',
        message: details.message || ''
      };
    }
    if (event === 'auth-ready' || event === 'auth-ready-failed') {
      this.diagnostics.auth = {
        at: entry.at,
        signedIn: Boolean(details.signedIn),
        uidMatchesExpected: typeof details.uidMatchesExpected === 'boolean' ? details.uidMatchesExpected : null,
        source: details.source || ''
      };
    }
    if (event === 'app-check-token-completed') {
      this.diagnostics.appCheck = {
        at: entry.at,
        result: details.acquired ? 'acquired' : 'missing',
        errorCode: null,
        message: ''
      };
    }
    if (event === 'app-check-token-failed') {
      this.diagnostics.appCheck = {
        at: entry.at,
        result: 'failed',
        errorCode: details.code || 'unknown',
        message: details.message || ''
      };
    }
    const accountRestoreConflict = event === 'save-conflict-detected' && details.source === 'account-restore';
    if (accountRestoreConflict || event === 'cloud-save-conflict-detected' || event === 'cloud-save-conflict-resolved') {
      this.diagnostics.lastCloudConflict = {
        at: entry.at,
        result: accountRestoreConflict ? details.resolution === 'local-save-selected' ? 'restore-local-selected' : 'restore-cloud-selected' : details.result || (event === 'cloud-save-conflict-detected' ? 'detected' : 'resolved'),
        resolution: details.resolution || ''
      };
    }
    const level = /failed|conflict|migration-detected/.test(event) ? 'warn' : 'info';
    try {
      console[level]('[Pocketwild save diagnostic]', entry);
    } catch {/* Diagnostics must never interrupt saves. */}
  }
  getStatus() {
    return {
      configured: this.configured,
      user: this.user,
      pendingUser: this.pending?.user || null,
      pendingCloudExists: Boolean(this.pending?.cloud),
      pendingAccountExists: Boolean(this.pending?.cloud || this.pending?.accountLocal),
      pendingGuestExists: Boolean(this.pending?.guest),
      pendingSource: this.pending?.source || '',
      cloudReady: this.cloudReady,
      cloudWriteQueued: Boolean(this.pendingWrite),
      cloudWriteInFlight: this.cloudWriteInFlight,
      lastError: this.lastError,
      isGuest: !this.user,
      diagnostics: {
        ...this.diagnostics,
        events: this.diagnostics.events.map(entry => ({
          ...entry
        })),
        localSave: {
          ...this.diagnostics.localSave
        },
        cloudRead: {
          ...this.diagnostics.cloudRead
        },
        cloudWrite: {
          ...this.diagnostics.cloudWrite
        },
        lastCloudConflict: {
          ...this.diagnostics.lastCloudConflict
        },
        auth: {
          ...this.diagnostics.auth
        },
        appCheck: {
          ...this.diagnostics.appCheck
        }
      }
    };
  }
  readLocalSlot(key) {
    let raw = null;
    try {
      raw = localStorage.getItem(key);
      if (!raw) return {
        record: null,
        raw: null
      };
      const parsed = JSON.parse(raw);
      const record = normalizeLocalSave(parsed);
      if (!record && parsed !== null) this.archiveMalformedSave(key, raw);
      return {
        record,
        raw
      };
    } catch (error) {
      if (raw) this.archiveMalformedSave(key, raw);
      if (error instanceof SyntaxError) console.warn('[Pocketwild save] A malformed local save was preserved for recovery.', error);
      return {
        record: null,
        raw
      };
    }
  }
  archiveMalformedSave(key, raw) {
    try {
      const archivedKey = `${MALFORMED_BACKUP_PREFIX}${encodeURIComponent(key)}:${Date.now()}`;
      if (!localStorage.getItem(archivedKey)) localStorage.setItem(archivedKey, raw);
    } catch (error) {
      console.warn('[Pocketwild save] Could not make a recovery copy of malformed local data.', error);
    }
  }
  readLocal(key) {
    const primary = this.readLocalSlot(key).record;
    const backup = this.readLocalSlot(`${key}${LOCAL_BACKUP_SUFFIX}`).record;
    if (!primary) return backup;
    if (!backup) return primary;
    if (backup.lastUpdated > primary.lastUpdated) return backup;
    if (backup.lastUpdated === primary.lastUpdated && backup.revision > primary.revision) return backup;
    return primary;
  }
  readCurrentLocalSave() {
    const userId = this.user?.uid || null;
    if (!userId) return this.readOfflineSave();
    const accountRecord = this.readAccountLocal(userId);
    const device = this.readLocal(DEVICE_SAVE_KEY);
    const deviceRecord = device?.playerId === userId ? device : null;
    const record = newestAccountRecord(accountRecord, deviceRecord);
    return record ? localEnvelope(record, userId, record.lastSynced) : null;
  }
  readGuestSave() {
    const record = this.readLocal(GUEST_SAVE_KEY);
    return record ? localEnvelope(record, null, record.lastSynced) : null;
  }
  readOfflineSave() {
    let record = newestAccountRecord(this.readLocal(GUEST_SAVE_KEY), this.readLocal(DEVICE_SAVE_KEY));
    try {
      const accountKeys = [];
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(ACCOUNT_SAVE_PREFIX) && !key.endsWith(LOCAL_BACKUP_SUFFIX)) accountKeys.push(key);
      }
      for (const key of accountKeys) {
        const userId = key.slice(ACCOUNT_SAVE_PREFIX.length);
        const accountRecord = this.readAccountLocal(userId);
        record = newestAccountRecord(record, accountRecord);
      }
    } catch (error) {
      console.warn('[Pocketwild save] Could not inspect cached account saves for offline recovery.', error);
    }
    return record ? localEnvelope(record, null, record.lastSynced) : null;
  }
  readAccountLocal(userId) {
    const key = accountSaveKey(userId);
    const record = this.readLocal(key);
    if (!record || record.playerId === userId) return record;
    try {
      const raw = localStorage.getItem(key);
      if (raw) localStorage.setItem(`${ACCOUNT_BACKUP_PREFIX}unmatched:${Date.now()}`, raw);
    } catch (error) {
      console.warn('[Pocketwild save] An account-local cache did not match the signed-in player and could not be archived.', error);
    }
    console.warn('[Pocketwild save isolation] Ignoring a local cache that does not belong to the signed-in account.');
    return null;
  }
  writeLocalRecord(key, record, userId = null, {
    allowSameGameMetadataCorrection = false,
    replaceMismatchedIdentity = false
  } = {}) {
    if (!record) return false;
    const current = this.readLocal(key);
    const sameIdentity = current?.playerId === (userId || null);
    const correctingSameGame = allowSameGameMetadataCorrection && sameIdentity && sameGame(current.game, record.game);
    const replacingArchivedIdentity = replaceMismatchedIdentity && current && !sameIdentity;
    if (current && current.lastUpdated > record.lastUpdated && !correctingSameGame && !replacingArchivedIdentity) {
      this.lastError = 'A newer local Pocketwild save was kept safely. Reload the game before continuing on this tab.';
      return false;
    }
    try {
      const belongsToSamePlayer = userId ? current?.playerId === userId : !current?.playerId;
      if (current && belongsToSamePlayer && (current.lastUpdated < record.lastUpdated || !sameGame(current.game, record.game))) {
        localStorage.setItem(`${key}${LOCAL_BACKUP_SUFFIX}`, JSON.stringify(localEnvelope(current, userId, current.lastSynced)));
      }
      localStorage.setItem(key, JSON.stringify(localEnvelope(record, userId, record.lastSynced)));
      return true;
    } catch (error) {
      this.lastError = 'This browser could not write the local save. Your current game is still open; keep this tab available and check storage space.';
      console.warn('[Pocketwild save] Local save write failed.', error);
      return false;
    }
  }
  writeDeviceSnapshot(record, userId = null) {
    if (!record?.game) return false;
    const current = this.readLocal(DEVICE_SAVE_KEY);
    const identityChanged = Boolean(current && current.playerId !== (userId || null));
    if (identityChanged) {
      try {
        const archiveKey = `${DEVICE_SAVE_KEY}:archive:${Date.now()}:${current.revision}`;
        localStorage.setItem(archiveKey, JSON.stringify(localEnvelope(current, current.playerId, current.lastSynced)));
      } catch (error) {
        console.warn('[Pocketwild save] Could not archive the previous device snapshot.', error);
      }
    }
    // A snapshot is only another copy of this save: keep the save's real
    // ordering metadata so opening the game cannot make unchanged progress look newer.
    const snapshot = {
      game: cloneJson(record.game),
      saveVersion: 1,
      revision: Math.max(0, Math.floor(Number(record.revision) || 0)),
      lastUpdated: Math.max(0, Math.floor(Number(record.lastUpdated) || 0)),
      lastSynced: Math.max(0, Math.floor(Number(record.lastSynced) || 0))
    };
    return this.writeLocalRecord(DEVICE_SAVE_KEY, snapshot, userId, {
      allowSameGameMetadataCorrection: current?.playerId === (userId || null) && sameGame(current.game, snapshot.game),
      replaceMismatchedIdentity: identityChanged
    });
  }
  archiveLocalConflict(userId, record) {
    if (!record) return;
    const key = `${ACCOUNT_BACKUP_PREFIX}${userId}:${Date.now()}:${record.revision}`;
    this.writeLocalRecord(key, record, userId);
  }
  makeRecord(game, {
    revision = this.revision,
    lastUpdated = this.lastUpdated,
    lastSynced = this.lastSynced
  } = {}) {
    return {
      game: withoutMeta(game),
      saveVersion: 1,
      revision: Math.max(0, Math.floor(Number(revision) || 0)),
      lastUpdated: Math.max(0, Math.floor(Number(lastUpdated) || 0)),
      lastSynced: Math.max(0, Math.floor(Number(lastSynced) || 0))
    };
  }
  async activate(user, record, {
    cloudSynced = true,
    cloudReady = true
  } = {}) {
    this.user = user;
    this.pending = null;
    this.cloudReady = cloudReady;
    this.lastError = cloudReady ? '' : record?.cloudPathError || 'The account save is available locally, but cloud sync is paused until its save path can be verified.';
    if (!record) {
      this.lastUpdated = 0;
      this.revision = 0;
      this.lastSynced = 0;
      return null;
    }
    const now = Date.now();
    this.lastUpdated = record.lastUpdated;
    this.revision = record.revision;
    this.lastSynced = cloudSynced && cloudReady ? now : record.lastSynced;
    const active = localEnvelope(record, user.uid, this.lastSynced);
    const activeRecord = {
      ...record,
      lastSynced: this.lastSynced
    };
    this.writeLocalRecord(accountSaveKey(user.uid), activeRecord, user.uid);
    this.writeDeviceSnapshot(activeRecord, user.uid);
    return active;
  }
  async chooseLatestForAccount(user, localRecord, cloudRecord) {
    if (cloudRecord?.cloudPathReady === false) {
      const selected = newestAccountRecord(localRecord, cloudRecord);
      const different = Boolean(localRecord && !sameGame(localRecord.game, cloudRecord.game));
      if (different) {
        this.recordDiagnostic('save-conflict-detected', {
          source: 'account-restore',
          resolution: selected === localRecord ? 'local-save-selected' : 'cloud-save-selected',
          localLastUpdated: localRecord.lastUpdated,
          cloudLastUpdated: cloudRecord.lastUpdated,
          cloudPathReady: false
        });
      }
      if (different && selected === cloudRecord) this.archiveLocalConflict(user.uid, localRecord);
      return await this.activate(user, selected, {
        cloudSynced: false,
        cloudReady: false
      });
    }
    if (localRecord && cloudRecord) {
      const different = !sameGame(localRecord.game, cloudRecord.game);
      if (different) {
        console.warn('[Pocketwild save conflict] Local and cloud saves differ; comparing their lastUpdated timestamps. The older copy is retained as a local backup.');
      }
      if (localRecord.lastUpdated > cloudRecord.lastUpdated) {
        const result = await withRestoreTimeout(this.provider.writePlayerSave(user.uid, localRecord, {
          archiveExisting: true
        }));
        if (result?.written) {
          const verified = await withRestoreTimeout(this.provider.readPlayerSave(user.uid));
          const selected = verified || result.record;
          if (different) {
            this.recordDiagnostic('save-conflict-detected', {
              source: 'account-restore',
              resolution: sameGame(selected.game, localRecord.game) ? 'local-save-selected' : 'cloud-save-selected',
              localLastUpdated: localRecord.lastUpdated,
              cloudLastUpdated: cloudRecord.lastUpdated,
              cloudPathReady: true
            });
          }
          return await this.activate(user, selected);
        }
        this.archiveLocalConflict(user.uid, localRecord);
        const selected = result?.newerSave || cloudRecord;
        if (different) {
          this.recordDiagnostic('save-conflict-detected', {
            source: 'account-restore',
            resolution: 'cloud-save-selected',
            localLastUpdated: localRecord.lastUpdated,
            cloudLastUpdated: cloudRecord.lastUpdated,
            cloudPathReady: true
          });
        }
        return await this.activate(user, selected);
      }
      if (different) {
        this.archiveLocalConflict(user.uid, localRecord);
        this.recordDiagnostic('save-conflict-detected', {
          source: 'account-restore',
          resolution: 'cloud-save-selected',
          localLastUpdated: localRecord.lastUpdated,
          cloudLastUpdated: cloudRecord.lastUpdated,
          cloudPathReady: true
        });
      }
      return await this.activate(user, cloudRecord);
    }
    if (cloudRecord) return await this.activate(user, cloudRecord);
    if (localRecord) {
      const result = await this.provider.writePlayerSave(user.uid, localRecord, {
        archiveExisting: true
      });
      if (result?.written) {
        const verified = await withRestoreTimeout(this.provider.readPlayerSave(user.uid));
        return await this.activate(user, verified || result.record);
      }
      return await this.activate(user, result?.newerSave || null);
    }
    return await this.activate(user, null);
  }
  async initialize() {
    const deviceRecord = this.readLocal(DEVICE_SAVE_KEY);
    const offlineSave = this.readOfflineSave();
    const offlineRecord = offlineSave ? normalizeLocalSave(offlineSave) : null;
    if (offlineRecord) {
      this.lastUpdated = offlineRecord.lastUpdated;
      this.revision = offlineRecord.revision;
      this.lastSynced = offlineRecord.lastSynced;
      this.recordDiagnostic('local-save-observed', {
        source: 'startup-cache',
        found: true,
        revision: offlineRecord.revision,
        lastUpdated: offlineRecord.lastUpdated
      });
    } else {
      this.recordDiagnostic('local-save-observed', {
        source: 'startup-cache',
        found: false
      });
    }
    if (!this.configured) {
      this.recordDiagnostic('auth-ready', {
        signedIn: false,
        uidMatchesExpected: null,
        source: 'firebase-not-configured'
      });
      return {
        save: offlineSave,
        user: null,
        configured: false,
        pending: false
      };
    }
  }
  persistLocal(gameSave) {
    const liveConflict = this.user && this.pending?.source === 'live-conflict' && this.pending.user.uid === this.user.uid;
    const key = liveConflict ? `${ACCOUNT_BACKUP_PREFIX}${this.user.uid}:unsynced` : this.user ? accountSaveKey(this.user.uid) : GUEST_SAVE_KEY;
    const target = liveConflict ? 'account-conflict-copy' : this.user ? 'account-cache' : 'guest-cache';
    this.recordDiagnostic('local-save-requested', {
      storage: 'localStorage',
      target
    });
    const previous = this.readLocal(key);
    const candidateGame = this.makeRecord(gameSave).game;
    if (!liveConflict && previous && previous.revision > this.revision && previous.lastUpdated > this.lastUpdated) {
      if (sameGame(previous.game, candidateGame)) {
        this.lastUpdated = previous.lastUpdated;
        this.revision = previous.revision;
        this.lastSynced = Math.max(this.lastSynced, previous.lastSynced);
      } else {
        this.lastError = 'A newer save from another Pocketwild tab was kept safely. Reload to continue from that copy; this tab has not replaced it.';
        if (this.localConflictRevision !== previous.revision) {
          const conflictKey = `${ACCOUNT_BACKUP_PREFIX}local-conflict:${encodeURIComponent(key)}:${Date.now()}:${this.revision}`;
          this.writeLocalRecord(conflictKey, this.makeRecord(candidateGame, {
            revision: Math.max(1, this.revision + 1),
            lastUpdated: Date.now(),
            lastSynced: this.lastSynced
          }), this.user?.uid || null);
          this.localConflictRevision = previous.revision;
          this.recordDiagnostic('save-conflict-detected', {
            source: 'local-cache',
            resolution: 'newer-local-copy-preserved'
          });
          console.warn('[Pocketwild save conflict] A newer local device save was kept; stale tab data was preserved separately.');
        }
        return localEnvelope(previous, this.user?.uid || null, previous.lastSynced);
      }
    }
    const now = Date.now();
    const revision = Math.max(this.revision, previous?.revision || 0) + 1;
    const record = this.makeRecord(candidateGame, {
      revision,
      lastUpdated: liveConflict ? this.pending.cloud.lastUpdated : Math.max(now, this.lastUpdated + 1, previous?.lastUpdated ? previous.lastUpdated + 1 : 0),
      lastSynced: this.lastSynced
    });
    const stored = localEnvelope(record, this.user?.uid || null, this.lastSynced);
    const written = this.writeLocalRecord(key, record, this.user?.uid || null);
    if (written) {
      this.lastUpdated = record.lastUpdated;
      this.revision = record.revision;
      this.localConflictRevision = 0;
      this.lastError = this.cloudReady || !this.user ? '' : this.lastError;
      const deviceWritten = this.writeDeviceSnapshot(record, this.user?.uid || null);
      this.recordDiagnostic('local-save-completed', {
        storage: 'localStorage',
        target,
        primaryWritten: true,
        deviceSnapshotWritten: deviceWritten,
        revision: record.revision,
        lastUpdated: record.lastUpdated
      });
      if (liveConflict) this.pending.guest = stored;else if (this.user && this.cloudReady) this.queueCloudWrite(record);
      return stored;
    }
    const safelyStored = this.readLocal(key);
    if (safelyStored && safelyStored.lastUpdated > record.lastUpdated) {
      const deviceWritten = this.writeDeviceSnapshot(safelyStored, this.user?.uid || null);
      this.recordDiagnostic('save-conflict-detected', {
        source: 'local-cache',
        resolution: 'newer-local-copy-preserved',
        deviceSnapshotWritten: deviceWritten
      });
      return localEnvelope(safelyStored, this.user?.uid || null, safelyStored.lastSynced);
    }
    const deviceWritten = this.writeDeviceSnapshot(record, this.user?.uid || null);
    this.recordDiagnostic(deviceWritten ? 'local-save-completed' : 'local-save-failed', {
      storage: 'localStorage',
      target: deviceWritten ? 'device-snapshot-fallback' : target,
      primaryWritten: false,
      deviceSnapshotWritten: deviceWritten,
      revision: record.revision,
      lastUpdated: record.lastUpdated,
      ...(deviceWritten ? {} : {
        code: 'local-storage-write-failed',
        message: 'Neither the primary save slot nor its device snapshot could be written.'
      })
    });
    if (this.user && this.cloudReady && !liveConflict) this.queueCloudWrite(record);
    return stored;
  }
  adoptExternalSave(envelope) {
    if (!this.user || !this.cloudReady || envelope?.userId !== this.user.uid) {
      throw new Error('The market save does not match the signed-in cloud account.');
    }
    const record = normalizeCloudSave(envelope);
    if (!record) throw new Error('The updated market save could not be checked.');
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = 0;
    this.pendingWrite = null;
    this.lastUpdated = record.lastUpdated;
    this.revision = record.revision;
    this.lastSynced = record.lastSynced;
    this.lastError = '';
    const activeRecord = {
      ...record,
      lastSynced: record.lastSynced
    };
    this.writeLocalRecord(accountSaveKey(this.user.uid), activeRecord, this.user.uid);
    this.writeDeviceSnapshot(activeRecord, this.user.uid);
    return localEnvelope(record, this.user.uid, record.lastSynced);
  }
  queueCloudWrite(record) {
    const coalesced = Boolean(this.pendingWrite);
    const queuedAt = Date.now();
    this.pendingWrite = {
      userId: this.user.uid,
      record,
      queuedAt
    };
    this.recordDiagnostic('cloud-save-write-queued', {
      path: '/players/{uid}',
      debounceMs: this.debounceMs,
      coalesced
    });
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      this.writeTimer = 0;
      this.flush().catch(error => {
        this.lastError = authMessage(error);
        console.warn('[Pocketwild cloud save] Save sync failed; the local account copy is safe.', error);
      });
    }, this.debounceMs);
  }
  async flush() {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = 0;
    }
    const queued = this.pendingWrite;
    if (!queued) return false;
    if (!this.user || queued.userId !== this.user.uid || !this.cloudReady) {
      this.recordDiagnostic('cloud-save-write-deferred', {
        path: '/players/{uid}',
        reason: !this.user ? 'no-active-account' : queued.userId !== this.user.uid ? 'account-session-changed' : 'cloud-not-ready'
      });
      return false;
    }
    this.pendingWrite = null;
    this.recordDiagnostic('cloud-save-write-dequeued', {
      path: '/players/{uid}',
      queueAgeMs: Math.max(0, Date.now() - (queued.queuedAt || Date.now()))
    });
    this.cloudWriteInFlight = true;
    let result;
    try {
      result = await this.provider.writePlayerSave(queued.userId, queued.record, {
        archiveExisting: true
      });
    } finally {
      this.cloudWriteInFlight = false;
    }
    if (!result?.written) {
      const newer = result?.newerSave;
      this.recordDiagnostic('cloud-save-conflict-detected', {
        path: '/players/{uid}',
        result: 'newer-cloud-save-preserved',
        resolution: newer ? 'awaiting-user-choice' : 'local-copy-archived'
      });
      console.warn('[Pocketwild save conflict] Cloud save is newer than this device; the cloud copy was kept and both versions are available for an explicit choice.');
      this.archiveLocalConflict(queued.userId, queued.record);
      if (newer) {
        this.pending = {
          user: this.user,
          cloud: newer,
          guest: localEnvelope(queued.record, queued.userId, queued.record.lastSynced),
          source: 'live-conflict'
        };
        this.cloudReady = false;
        this.lastError = 'A newer Pocketwild save was found in the cloud. Choose which version to keep.';
        this.onConflict?.({
          cloud: newer,
          device: this.pending.guest
        });
      }
      return false;
    }
    this.lastUpdated = result.record.lastUpdated;
    this.revision = result.record.revision;
    this.lastSynced = result.record.lastSynced;
    const current = this.readLocal(accountSaveKey(queued.userId));
    if (current && current.lastUpdated <= queued.record.lastUpdated) {
      this.writeLocalRecord(accountSaveKey(queued.userId), {
        ...queued.record,
        ...result.record,
        game: current.game
      }, queued.userId);
    }
    this.lastError = '';
    return true;
  }
  async completeLogin(email, password) {
    throw new Error("Cloud accounts and cloud migration are retired in this local edition. Your device save is unchanged.");
  }
  async createAccount(email, password) {
    throw new Error("Cloud accounts and cloud migration are retired in this local edition. Your device save is unchanged.");
  }
  async chooseAccountSave() {
    throw new Error("Cloud accounts and cloud migration are retired in this local edition. Your device save is unchanged.");
  }
  async chooseDeviceSave() {
    throw new Error("Cloud accounts and cloud migration are retired in this local edition. Your device save is unchanged.");
  }
  async sendPasswordReset(email) {
    throw new Error("Cloud accounts and cloud migration are retired in this local edition. Your device save is unchanged.");
  }
  async logout() {
    if (this.user && this.cloudReady) {
      try {
        await this.flush();
      } catch (error) {
        this.lastError = authMessage(error);
        console.warn('[Pocketwild cloud save] Logout continued with the safe local copy after cloud sync failed.', error);
      }
    }
    if (this.pendingWrite) {
      this.recordDiagnostic('cloud-save-write-deferred', {
        path: '/players/{uid}',
        reason: 'logout-kept-local-copy'
      });
    }
    if (this.provider) await this.provider.logout();
    this.user = null;
    this.pending = null;
    this.cloudReady = false;
    this.lastUpdated = 0;
    this.revision = 0;
    this.lastSynced = 0;
    this.pendingWrite = null;
    this.recordDiagnostic('auth-ready', {
      signedIn: false,
      uidMatchesExpected: null,
      source: 'logout'
    });
    const guest = this.readGuestSave();
    return guest;
  }
  async cancelPendingAuth() {
    if (!this.pending) return this.readGuestSave();
    const hadCloudSave = Boolean(this.pending.cloud || this.pending.source === 'live-conflict');
    await this.provider.logout();
    this.pending = null;
    this.user = null;
    this.cloudReady = false;
    this.recordDiagnostic('auth-ready', {
      signedIn: false,
      uidMatchesExpected: null,
      source: 'continued-as-guest'
    });
    if (hadCloudSave) {
      this.recordDiagnostic('cloud-save-conflict-resolved', {
        path: '/players/{uid}',
        result: 'guest-world-kept',
        resolution: 'continued-as-guest'
      });
    } else {
      this.recordDiagnostic('account-save-choice-resolved', {
        result: 'guest-world-kept'
      });
    }
    return this.readGuestSave();
  }
}
export { authMessage };