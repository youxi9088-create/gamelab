const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const nav = [
  ["overview", "◈", "总览看板"],
  ["candidates", "▧", "候选游戏"],
  ["library", "▦", "小游戏库"],
  ["batches", "▣", "批次管理"],
  ["jobs", "⌘", "任务中心"],
  ["reviews", "☑", "验收中心"],
  ["tools", "⌁", "工具接入"],
  ["settings", "⚙", "来源与规则"],
];
let page = location.hash.slice(1) || "overview",
  demo = localStorage.getItem("replica-demo") === "true",
  state = {},
  query = "",
  filter = "",
  csrf = "",
  selected = new Set();
const statusMap = {
  candidate: "待选品",
  draft: "草稿",
  blocked: "需人工处理",
  attention: "需要关注",
  discovered: "待选品",
  queued: "等待执行",
  running: "执行中",
  paused: "已暂停",
  failed: "执行失败",
  review: "待验收",
  approved: "已验收",
  published: "已发布",
  rejected: "已退回",
  completed: "已完成",
  success: "成功",
  pending: "等待执行",
  enabled: "已启用",
  disabled: "已停用",
};
const badge = (s) =>
  `<span class="badge ${["published", "approved", "completed", "success"].includes(s) ? "green" : ["failed", "rejected"].includes(s) ? "red" : s === "review" ? "yellow" : ["paused", "queued", "pending"].includes(s) ? "gray" : ""}">${esc(statusMap[s] || s)}</span>`;
const date = (v) =>
  v
    ? new Date(v).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const safeUrl = (v) => {
  try {
    const u = new URL(v, location.origin);
    return ["https:", "http:"].includes(u.protocol) ? u.href : "#";
  } catch {
    return "#";
  }
};
const cover = (c) => safeUrl(c?.cover || "/assets/placeholder.svg");
const empty = (title, desc, action = "") =>
  `<div class="empty"><div class="empty-symbol">◇</div><strong>${title}</strong><p>${desc}</p>${action}</div>`;
const cBy = (id) =>
  (state.candidates || []).find((c) => c.id === id) || {
    title: id || "未关联游戏",
  };
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 3200);
}
async function api(path, body) {
  const r = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || d.message || "请求失败");
  return d;
}
async function load() {
  try {
    csrf = (await api("/api/session")).csrf;
    if (demo) {
      state = await api("/api/demo");
    } else {
      state = await api("/api/state");
    }
    render();
  } catch (e) {
    state = {};
    render();
    toast("无法连接平台：" + e.message);
  }
}
function shell() {
  return `<aside class="sidebar"><div class="brand"><div class="brandmark">✦</div><div>AI 游戏中心<small>REPLICA STUDIO</small></div></div>${nav.map(([id, icon, title], i) => `${[0, 1, 3, 6].includes(i) ? `<div class="navlabel">${{ 0: "工作空间", 1: "游戏资产", 3: "生产管理", 6: "平台管理" }[i]}</div>` : ""}<button class="navbtn ${page === id ? "active" : ""}" data-nav="${id}"><span class="icon">${icon}</span><span>${title}</span></button>`).join("")}<div class="sidebar-bottom"><span class="online"></span>${demo ? "演示工作空间" : "本地工作空间"}<br><span class="muted">统一采集 · 重建 · 发布</span></div></aside><main class="main"><header class="topbar"><div class="breadcrumb">工作空间 <b>/ ${nav.find((n) => n[0] === page)?.[2] || "总览看板"}</b></div><div class="topright"><input class="search" id="global-search" placeholder="搜索游戏、任务…" aria-label="搜索游戏、任务"><button class="smallbtn" data-action="mode">${demo ? "◉ 演示模式" : "○ 实时数据"}</button><button class="textbtn" data-action="refresh">↻ 刷新</button><div class="avatar">AD</div></div></header><div class="content">${demo ? '<div class="demo-banner"><span>◇ 演示工作空间 · 数据与游戏插画仅用于交互设计演示</span><span>不代表已采集或复刻</span></div>' : ""}<div id="page"></div></div></main>`;
}
function render() {
  if (!nav.some((n) => n[0] === page)) page = "overview";
  $("#app").innerHTML = shell();
  $("#page").innerHTML = {
    overview,
    candidates,
    library,
    batches,
    jobs,
    reviews,
    tools: toolPage,
    settings,
  }[page]();
  bind();
}
function head(title, desc, buttons = "") {
  return `<div class="pagehead"><div><div class="eyebrow">REPLICA WORKSPACE</div><h1>${title}</h1><p>${desc}</p></div><div class="actions">${buttons}</div></div>`;
}
function card(c, lib = false) {
  const v = (state.versions || []).find(
    (v) =>
      v.candidate_id === c.id && ["approved", "published"].includes(v.status),
  );
  return `<article class="gamecard"><div class="cover" data-detail="${esc(c.id)}"><img src="${esc(lib ? cover(v) : cover(c))}" alt="${esc(c.title)}${demo ? " · 演示插画" : " · 游戏预览"}" loading="lazy"><div class="cover-badge">${badge(lib ? v.status : c.status || "discovered")}<span class="badge">${esc(c.engine || "待识别")}</span></div>${demo ? '<span class="demo-img">DEMO · CONCEPT ART</span>' : ""}</div><div class="gamebody"><h3>${esc(c.title)}</h3><div class="gamemeta">${esc(c.category || "未分类")} <span>·</span> ${esc(c.source || "手动提交")}</div><div class="gamefoot"><span>${lib ? "版本 " + esc(v?.commit?.slice(0, 7) || "待关联") : date(c.created_at)}</span><div class="actions">${lib ? `<button class="smallbtn" data-play="${esc(v?.id || "")}">▷ 试玩</button>` : `<button class="smallbtn ${selected.has(c.id) ? "primary" : ""}" data-select="${esc(c.id)}">${selected.has(c.id) ? "✓ 已选择" : "+ 选择"}</button>`}<button class="textbtn" data-detail="${esc(c.id)}">详情 ↗</button></div></div></div></article>`;
}
function overview() {
  const cs = state.candidates || [],
    js = state.jobs || [],
    vs = state.versions || [];
  const m = state.metrics || {};
  const stats = [
    ["成功获取", m.acquired ?? cs.length, "款", "候选与资源完成汇总", "▧"],
    [
      "REA 恢复成功",
      m.recovered ??
        js.filter((j) => j.route === "A" && j.status === "completed").length,
      "款",
      "可维护工程已通过初检",
      "⌘",
    ],
    [
      "AI 复刻完成",
      m.reconstructed ??
        js.filter((j) => j.route === "B" && j.status === "completed").length,
      "款",
      "核心功能已完成自动检查",
      "✦",
    ],
    [
      "新增入库",
      m.imported ?? vs.filter((v) => v.status === "published").length,
      "款",
      "首次通过验收并入库，发布另计",
      "↗",
    ],
  ];
  return (
    head(
      "让每个创意，成为可玩的游戏",
      "统一汇总游戏来源，追踪重建进度，管理每一个可交付版本。",
      `<button data-nav="tools">⌁ 接入工具</button><button class="primary" data-action="new-batch">＋ 创建批次</button>`,
    ) +
    `<div class="stats">${stats.map(([t, n, u, f, i]) => `<div class="stat"><div class="stat-icon">${i}</div><div class="stat-label">${t} <span class="tiny muted">/ 今日</span></div><div class="stat-value">${n}<small>${u}</small></div><div class="stat-foot">${f}</div></div>`).join("")}</div><div class="grid2"><section class="panel"><div class="panelhead"><h2>获取与入库趋势 <small>近 7 天</small></h2><div class="legend"><span><i class="dot"></i>成功获取</span><span><i class="dot gray"></i>新增入库</span></div></div>${trendChart(m.trend)}</section><section class="panel"><div class="panelhead"><h2>执行工具</h2><button class="textbtn" data-nav="tools">管理接入 ↗</button></div>${
      (state.tools || [])
        .slice(0, 4)
        .map(
          (t) =>
            `<div class="healthrow"><div class="row-left"><div class="tool-avatar">⌘</div><div><h3>${esc(t.name)}</h3><p class="tiny muted">${esc((t.capabilities || []).join(" · "))}</p></div></div>${badge(!t.enabled ? "disabled" : (demo ? t.last_seen : t.online) ? "在线" : "未连接")}</div>`,
        )
        .join("") || empty("等待工具接入", "注册采集、REA 或 AI 执行工具")
    }</section></div><section class="panel" style="margin-bottom:26px"><div class="panelhead"><h2>正在进行 <small>${js.filter((j) => j.status === "running").length} 个任务执行中</small></h2><button class="textbtn" data-nav="jobs">查看全部 →</button></div>${jobTable(js.filter((j) => ["running", "failed"].includes(j.status)).slice(0, 3))}</section><div class="panelhead"><h2>最新游戏 <small>从发现到发布，每一步可追溯</small></h2><button class="textbtn" data-nav="candidates">浏览候选 →</button></div><div class="cards">${
      cs
        .slice(0, 4)
        .map((c) => card(c))
        .join("") ||
      empty(
        "开始建立你的游戏库",
        "接入采集工具，或手动提交第一款候选游戏",
        '<button class="primary" data-action="new-candidate">＋ 添加候选</button>',
      )
    }</div>`
  );
}
function filters() {
  return `<div class="filters"><input id="filter-query" placeholder="搜索游戏名称、来源…" value="${esc(query)}"><select id="filter-category"><option value="">全部类型</option>${[...new Set((state.candidates || []).map((c) => c.category).filter(Boolean))].map((c) => `<option ${filter === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select><span class="muted tiny">${demo ? "演示素材 · 非实际游戏截图" : "来源记录统一汇总，保留完整追溯"}</span></div>`;
}
function filtered(cs) {
  return cs.filter(
    (c) =>
      (!query ||
        `${c.title} ${c.source}`.toLowerCase().includes(query.toLowerCase())) &&
      (!filter || c.category === filter),
  );
}
function candidates() {
  return (
    head(
      "发现值得重建的游戏",
      "多个来源，一个候选池。先看玩法，再决定下一步。",
      `<button data-action="new-candidate">＋ 添加候选</button><button class="primary" data-action="new-batch">创建批次${selected.size ? " · " + selected.size : ""}</button>`,
    ) +
    filters() +
    `<div class="cards">${
      filtered(state.candidates || [])
        .map((c) => card(c))
        .join("") ||
      empty("没有匹配的候选游戏", "调整筛选条件，或通过统一接口提交新游戏。")
    }</div>`
  );
}
function library() {
  let ids = new Set(
    (state.versions || [])
      .filter((v) => ["approved", "published"].includes(v.status))
      .map((v) => v.candidate_id),
  );
  return (
    head("小游戏库", "已验收、可发布、可追溯。浏览和试玩独立于生产工具。") +
    filters() +
    `<div class="cards">${
      filtered((state.candidates || []).filter((c) => ids.has(c.id)))
        .map((c) => card(c, true))
        .join("") ||
      empty(
        "还没有已入库游戏",
        "版本通过验收入库后即可预览，发布状态独立管理。",
        '<button data-nav="reviews">前往验收中心</button>',
      )
    }</div>`
  );
}
function batches() {
  return (
    head(
      "批次管理",
      "让一组游戏有共同目标，也让每个结果有独立记录。",
      '<button class="primary" data-action="new-batch">＋ 创建批次</button>',
    ) +
    `<div class="panel">${(state.batches || []).length ? `<div class="table-wrap"><table class="table"><thead><tr><th>批次名称</th><th>游戏数量</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${state.batches.map((b) => `<tr><td><b>${esc(b.name)}</b><br><small>${esc(b.id)}</small></td><td>${b.candidate_ids.length} 款</td><td>${badge(b.status)}</td><td>${date(b.created_at)}</td><td>${["draft", "queued", "running", "paused"].includes(b.status) ? `<button class="smallbtn" data-batch="${esc(b.id)}" data-op="${b.status === "running" ? "pause" : b.status === "paused" ? "resume" : "start"}">${b.status === "running" ? "暂停调度" : b.status === "paused" ? "恢复调度" : "启动批次"}</button>` : '<span class="muted tiny">请在任务中心处理</span>'}</td></tr>`).join("")}</tbody></table></div>` : empty("建立第一个处理批次", "先在候选池选择游戏，再统一派发处理任务。")}</div>`
  );
}
function jobTable(list) {
  return list.length
    ? `<div class="table-wrap"><table class="table"><thead><tr><th>游戏 / 任务</th><th>当前阶段</th><th>处理路径</th><th>执行状态</th><th>进度</th><th>操作</th></tr></thead><tbody>${list.map((j) => `<tr><td><b>${esc(cBy(j.candidate_id).title)}</b><br><small>${esc(j.id)}</small></td><td>${esc({ rea: "REA 分析", reconstruct: "AI 复刻" }[j.stage] || j.stage || "等待分析")}</td><td><span class="badge ${j.route === "A" ? "green" : ""}">${j.route === "A" ? "A · 代码整理" : j.route === "B" ? "B · AI 复刻" : "待 REA 分流"}</span></td><td>${badge(j.status)}</td><td><small>${j.progress || 0}%</small><div class="progress"><span style="width:${Math.max(0, Math.min(100, j.progress || 0))}%"></span></div></td><td><button class="textbtn" data-job="${esc(j.id)}">详情 →</button>${["failed", "blocked"].includes(j.status) ? `<button class="smallbtn" data-retry="${esc(j.id)}">重试</button>` : ""}</td></tr>`).join("")}</tbody></table></div>`
    : empty("暂无任务记录", "从批次管理启动任务，执行工具将领取并回传进度。");
}
function jobs() {
  return (
    head("任务中心", "REA 优先分析，按证据分流；每个工具、每轮尝试都有记录。") +
    `<div class="notice">采集 → REA 分析 → A 代码整理 / B AI 复刻 → 测试 → 验收。工具异常与游戏不可恢复分别记录。</div><div class="panel">${jobTable((state.jobs || []).filter((j) => !query || cBy(j.candidate_id).title.includes(query) || j.id.includes(query)))}</div>`
  );
}
function reviews() {
  const vs = (state.versions || []).filter((v) =>
    ["review", "approved", "rejected"].includes(v.status),
  );
  return (
    head("验收中心", "看画面，也看玩法。通过检查后再发布到小游戏库。") +
    `<div class="cards">${
      vs
        .map((v) => {
          const c = cBy(v.candidate_id);
          return `<article class="gamecard"><div class="cover" data-review="${esc(v.id)}"><img src="${esc(cover(v))}" alt="${esc(c.title)}"><div class="cover-badge">${badge(v.status)}</div>${demo ? '<span class="demo-img">DEMO · CONCEPT ART</span>' : ""}</div><div class="gamebody"><h3>${esc(c.title)}</h3><p class="tiny muted">版本 ${esc(v.commit?.slice(0, 7) || "待关联")} · ${date(v.created_at)}</p><div class="gamefoot"><span>对比 · 试玩 · 功能检查</span><button class="smallbtn primary" data-review="${esc(v.id)}">开始验收</button></div></div></article>`;
        })
        .join("") ||
      empty(
        "当前没有待验收版本",
        "执行工具提交可运行版本后，进入这里进行人工验收。",
      )
    }</div>`
  );
}
function toolPage() {
  return (
    head(
      "工具接入",
      "统一协议，多种执行方式。工具独立运行，平台统一汇总。",
      '<button class="primary" data-action="new-tool">＋ 注册工具</button>',
    ) +
    `<div class="notice">工具可主动提交候选，也可按能力领取任务。接入凭证仅在创建时显示，请妥善保存。</div><div class="toolgrid">${(state.tools || []).map((t) => `<section class="panel"><div class="panelhead"><div class="tool-avatar">⌘</div>${badge(!t.enabled ? "disabled" : (demo ? t.last_seen : t.online) ? "在线" : "未连接")}</div><h2>${esc(t.name)}</h2><p class="tiny muted" style="margin-top:8px">${esc(t.id)}</p><p style="margin:16px 0">${(t.capabilities || []).map((c) => `<span class="badge">${esc(c)}</span>`).join(" ")}</p><div class="kv"><span>最近心跳</span><span>${date(t.last_seen)}</span></div><div class="modalfooter"><button class="smallbtn" data-tool="${esc(t.id)}">${t.enabled ? "停止派发" : "启用派发"}</button></div></section>`).join("") || empty("暂无接入工具", "注册工具后获取专属凭证，连接采集器和执行器。")}</div><section class="panel" style="margin-top:22px"><div class="panelhead"><h2>统一接入协议</h2><a href="/api/docs" target="_blank" rel="noopener">完整接口文档 ↗</a></div><div class="code">注册工具 → 获取令牌 → 心跳上报 → 提交候选 / 领取任务<br>执行过程 → 回传进度与日志 → 上传产物 → 提交结果<br><br>所有产物关联任务与版本；重复提交不重复入库。</div></section>`
  );
}
function settings() {
  const s = state.settings || {};
  return (
    head("来源与规则", "把处理规范写进平台，把执行细节留给工具。") +
    `<div class="setting-grid"><section class="panel"><div class="panelhead"><h2>处理预算</h2></div><form id="settings-form"><label>最大并发任务</label><input name="concurrency" type="number" min="1" max="8" value="${s.concurrency || 2}"><label>REA 尝试上限（分钟）</label><input name="rea_minutes" type="number" min="1" value="${s.rea_minutes || 45}"><label>AI 复刻上限（分钟）</label><input name="reconstruct_minutes" type="number" min="1" value="${s.reconstruct_minutes || 180}"><label>自动修复轮数</label><input name="repair_rounds" type="number" min="1" max="5" value="${s.repair_rounds ?? 3}"><div class="modalfooter"><button class="primary">保存规则</button></div></form></section><section class="panel"><div class="panelhead"><h2>采集来源</h2><button class="textbtn" data-action="new-source">＋ 添加来源</button></div>${(state.sources || []).map((s) => `<div class="healthrow"><div><h3>${esc(s.name)}</h3><a class="tiny" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a></div><button class="smallbtn" data-source="${esc(s.id)}">${s.enabled ? "已启用" : "已停用"}</button></div>`).join("") || '<p class="muted">尚未配置来源</p>'}</section><section class="panel"><div class="panelhead"><h2>统一源码仓库</h2></div><p class="muted">所有游戏统一保存，平台代码与游戏代码分离。</p><div class="code" style="margin-top:18px">game-library/<br>  games/{game-id}/<br>    src/ · public/ · game.json · README.md<br>  shared/<br>  tooling/</div><div class="kv"><span>仓库状态</span><span>${esc(state.repository?.status || "由服务端配置")}</span></div><div class="kv"><span>迁移方式</span><span>保留提交历史，同步到公司 Git</span></div></section><section class="panel"><div class="panelhead"><h2>发布要求</h2></div>${["工程可构建，核心功能通过测试", "人工确认玩法、画面和资源使用条件", "版本绑定源码提交与运行产物", "预览版本和发布版本独立管理"].map((t) => `<p style="margin:15px 0;color:#a3acc3">✓ ${t}</p>`).join("")}</section></div>`
  );
}
function modal(title, body, wide = false) {
  $("#overlay").innerHTML =
    `<div class="modal-backdrop"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modalheader"><h2>${esc(title)}</h2><button class="close" aria-label="关闭">×</button></div>${body}<div class="error" id="modal-error"></div></section></div>`;
  $(".close").onclick = closeModal;
  $(".modal-backdrop").onclick = (e) => {
    if (e.target === $(".modal-backdrop")) closeModal();
  };
  bind();
  $(".modal input")?.focus();
}
function closeModal() {
  $("#overlay").innerHTML = "";
}
async function mutate(path, body, demoFn) {
  try {
    if (demo) {
      demoFn?.();
      render();
      toast("演示操作已完成 · 未写入真实数据");
    } else {
      await api(path, body);
      await load();
      toast("操作已完成");
    }
    closeModal();
  } catch (e) {
    if ($("#modal-error")) $("#modal-error").textContent = e.message;
    else toast(e.message);
  }
}
function detail(id) {
  const c = cBy(id),
    vs = (state.versions || []).filter((v) => v.candidate_id === id);
  modal(
    c.title,
    `<div class="tabs"><button class="tab active" data-dtab="preview">游戏预览</button><button class="tab" data-dtab="source">来源信息</button><button class="tab" data-dtab="code">代码与版本</button><button class="tab" data-dtab="tasks">处理记录</button></div><div id="detail-body"></div>`,
    true,
  );
  const panes = {
    preview: `<div class="detail-grid"><div><img class="detail-cover" src="${esc(cover(c))}" alt="游戏预览"><div class="screenshot-strip">${screenshotItems(
      c,
    )
      .map(
        (u, i) =>
          `<button data-gallery="${esc(c.id)}" data-index="${i}" aria-label="查看截图 ${i + 1}"><img src="${esc(u)}" alt="游戏截图 ${i + 1}"></button>`,
      )
      .join(
        "",
      )}</div><p class="tiny muted">${demo ? "演示插画 · 非实际采集截图" : "来源预览图片"}</p></div><div><h3>玩法简介</h3><p class="muted" style="margin:14px 0">${esc(c.description || "等待分析工具提交玩法说明。")}</p><div class="kv"><span>游戏类型</span><span>${esc(c.category || "待分类")}</span></div><div class="kv"><span>引擎</span><span>${esc(c.engine || "待识别")}</span></div><div class="kv"><span>状态</span>${badge(c.status)}</div><div class="modalfooter"><button class="smallbtn" data-edit="${esc(c.id)}">编辑资料</button><a href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">打开来源试玩 ↗</a></div></div></div>`,
    source: `<div class="kv"><span>来源平台</span><span>${esc(c.source)}</span></div><div class="kv"><span>原始地址</span><a href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">查看来源 ↗</a></div><div class="kv"><span>首次汇总</span><span>${date(c.created_at)}</span></div><div class="kv"><span>使用条件</span><span>${esc(c.rights || "待确认")}</span></div>`,
    code: `<div class="code">games/${esc(c.id)}/</div>${
      vs
        .map(
          (v) =>
            `<div class="healthrow"><div><b>${esc(v.commit || "尚未提交")}</b><p class="tiny muted">${date(v.created_at)}</p><div class="screenshot-strip">${screenshotItems(
              v,
            )
              .map(
                (u, i) =>
                  `<button data-vgallery="${esc(v.id)}" data-index="${i}" aria-label="产出截图 ${i + 1}"><img src="${esc(u)}" alt="产出截图"></button>`,
              )
              .join(
                "",
              )}</div></div>${badge(v.status)}<button class="smallbtn" data-play="${esc(v.id)}">预览版本</button>${!demo ? `<a class="tiny" href="/api/versions/${esc(v.id)}/download">下载源码</a>` : ""}${v.status === "published" ? `<button class="smallbtn" data-unpublish="${esc(v.id)}">下架版本</button>` : ""}</div>`,
        )
        .join("") ||
      empty("暂无代码版本", "执行工具提交产物并完成版本登记后可查看。")
    }`,
    tasks: jobTable((state.jobs || []).filter((j) => j.candidate_id === id)),
  };
  function set(t) {
    $("#detail-body").innerHTML = panes[t];
    document
      .querySelectorAll("[data-dtab]")
      .forEach((b) => b.classList.toggle("active", b.dataset.dtab === t));
    bind();
  }
  set("preview");
  document
    .querySelectorAll("[data-dtab]")
    .forEach((b) => (b.onclick = () => set(b.dataset.dtab)));
}
function jobDetail(id) {
  const j = (state.jobs || []).find((j) => j.id === id);
  modal(
    cBy(j.candidate_id).title + " · 处理记录",
    `<div class="kv"><span>任务编号</span><span>${esc(j.id)}</span></div><div class="kv"><span>执行工具</span><span>${esc(j.tool_id || "等待领取")}</span></div><div class="kv"><span>当前状态</span>${badge(j.status)}</div><div class="kv"><span>分流原因</span><span>${esc(j.reason || "等待 REA 分析结果")}</span></div><div style="margin-top:26px">${
      (state.events || [])
        .filter((e) => e.job_id === id)
        .map(
          (e) =>
            `<div class="step"><h3>${esc(e.stage || "运行事件")}</h3><p>${esc(e.message)}</p><p>${date(e.created_at)}</p></div>`,
        )
        .join("") || '<p class="muted">暂无执行日志，等待工具上报。</p>'
    }</div>`,
  );
}
function play(id) {
  const v = (state.versions || []).find((v) => v.id === id);
  if (!v) return toast("尚无可运行版本");
  const u = safeUrl(v.preview_url);
  modal(
    cBy(v.candidate_id).title + " · 版本试玩",
    demo
      ? '<div class="notice">这是交互设计演示，没有实际游戏运行包。真实版本将由独立试玩服务加载。</div>' +
          `<img class="detail-cover" src="${esc(cover(cBy(v.candidate_id)))}" alt="演示插画">`
      : u === "#" || !v.preview_url
        ? empty("运行包尚未部署", "请先完成构建并配置独立试玩地址。")
        : `<iframe sandbox="allow-scripts" referrerpolicy="no-referrer" src="${esc(u)}" title="游戏试玩"></iframe><p class="tiny muted">隔离运行 · ${esc(v.commit || v.id)}</p>`,
    true,
  );
}
function review(id) {
  const v = (state.versions || []).find((v) => v.id === id),
    c = cBy(v.candidate_id);
  modal(
    c.title + " · 对比验收",
    `<div class="preview-pair"><div><h3>来源游戏</h3><img src="${esc(cover(c))}" alt="来源预览"><p class="tiny muted">${demo ? "演示插画" : "来源截图"}</p><a href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">打开原站试玩 ↗</a></div><div><h3>产出版本 ${badge(v.status)}</h3><img src="${esc(cover(v))}" alt="产出版本截图"><p class="tiny muted">${demo ? "演示插画，非复刻成果" : v.cover ? "该版本运行截图" : "该版本尚未提供运行截图"}</p><button class="smallbtn" data-play="${esc(v.id)}">▷ 打开产出试玩</button></div></div><div class="code" style="margin-top:20px">${esc(typeof v.report === "string" ? v.report : JSON.stringify(v.report || { message: "待提交自动检测报告" }, null, 2))}</div><form id="review-form"><label class="checkrow"><input type="checkbox" name="gameplay" required>核心玩法、计分或胜负、重开符合规格</label><label class="checkrow"><input type="checkbox" name="visual" required>画面可用且无阻断运行错误</label><label class="checkrow"><input type="checkbox" name="rights" required>代码与素材来源及使用条件已确认</label><label>验收意见 / 退回原因</label><textarea name="reason" placeholder="记录需要修复的问题…"></textarea><div class="modalfooter"><button type="button" id="reject-version">退回修复</button><button type="submit" class="primary">${v.status === "approved" ? "发布到小游戏库" : "通过验收"}</button></div></form>`,
    true,
  );
  $("#review-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      op = v.status === "approved" ? "publish" : "approve";
    mutate(
      `/api/versions/${id}/${op}`,
      {
        reason: f.get("reason"),
        checks: { gameplay: true, visual: true, rights: true },
      },
      () => (v.status = op === "publish" ? "published" : "approved"),
    );
  };
  $("#reject-version").onclick = () => {
    const reason = $("#review-form textarea").value.trim();
    if (!reason)
      return ($("#modal-error").textContent =
        "请填写退回原因，便于执行工具修复。");
    mutate(
      `/api/versions/${id}/reject`,
      { reason },
      () => (v.status = "rejected"),
    );
  };
}
function formDialog(type) {
  let title, html;
  if (type === "new-candidate") {
    title = "添加候选游戏";
    html = `<label>游戏名称</label><input name="title" required><label>来源 URL</label><input name="url" type="url" required placeholder="https://"><div class="formgrid"><div><label>来源平台</label><input name="source" required></div><div><label>游戏类型</label><input name="category" placeholder="益智 / 动作 / 经营"></div></div><label>玩法说明</label><textarea name="description"></textarea><label>代码和素材使用条件</label><select name="rights"><option value="unknown">待确认</option><option value="owned">自有代码与素材</option><option value="licensed">已获授权</option><option value="open">开源许可已核对</option></select>`;
  } else if (type === "new-batch") {
    title = "创建处理批次";
    html = `<label>批次名称</label><input name="name" required placeholder="例如：首批 Web 游戏验证"><label>选择候选游戏</label><div style="max-height:260px;overflow:auto">${(state.candidates || []).map((c) => `<label class="checkrow"><input type="checkbox" name="candidate_ids" value="${esc(c.id)}" ${selected.has(c.id) ? "checked" : ""}>${esc(c.title)} <span class="muted tiny">${esc(c.source)}</span></label>`).join("") || '<p class="muted">请先添加候选游戏。</p>'}</div>`;
  } else if (type === "new-tool") {
    title = "注册执行工具";
    html =
      '<label>工具名称</label><input name="name" required placeholder="例如：REA Worker 01"><label>能力（英文逗号分隔）</label><input name="capabilities" required placeholder="collect, rea, reconstruct"><p class="tiny muted" style="margin-top:14px">凭证仅显示一次。工具通过 Bearer Token 调用执行接口。</p>';
  } else {
    title = "添加采集来源";
    html =
      '<label>来源名称</label><input name="name" required><label>来源网址</label><input name="url" type="url" required placeholder="https://">';
  }
  modal(
    title,
    `<form id="dialog-form">${html}<div class="modalfooter"><button type="button" id="cancel-form">取消</button><button class="primary">确认创建</button></div></form>`,
  );
  $("#cancel-form").onclick = closeModal;
  $("#dialog-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      body = Object.fromEntries(f);
    const collection = {
      "new-candidate": "candidates",
      "new-batch": "batches",
      "new-tool": "tools",
      "new-source": "sources",
    }[type];
    if (type === "new-batch") {
      body.candidate_ids = f.getAll("candidate_ids");
      if (!body.candidate_ids.length)
        return ($("#modal-error").textContent = "至少选择一款游戏。");
    }
    if (type === "new-tool")
      body.capabilities = body.capabilities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (type === "new-tool" && !demo) {
      try {
        const r = await api("/api/tools", body);
        await load();
        modal(
          "工具注册成功",
          `<p class="muted">请立即保存令牌，关闭后不再显示。</p><div class="code token" style="margin-top:15px">${esc(r.token)}</div>`,
        );
      } catch (e) {
        $("#modal-error").textContent = e.message;
      }
      return;
    }
    mutate("/api/" + collection, body, () => {
      state[collection] ??= [];
      state[collection].unshift({
        ...body,
        id: "demo-" + Date.now(),
        created_at: new Date().toISOString(),
        status: type === "new-batch" ? "queued" : "discovered",
        enabled: true,
      });
    });
  };
}
function bind() {
  document
    .querySelectorAll("[data-vgallery]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          gallery(b.dataset.vgallery, Number(b.dataset.index), true)),
    );
  document
    .querySelectorAll("[data-gallery]")
    .forEach(
      (b) =>
        (b.onclick = () => gallery(b.dataset.gallery, Number(b.dataset.index))),
    );
  document
    .querySelectorAll("[data-edit]")
    .forEach((b) => (b.onclick = () => editCandidate(b.dataset.edit)));
  document.querySelectorAll("[data-nav]").forEach(
    (b) =>
      (b.onclick = () => {
        page = b.dataset.nav;
        query = "";
        filter = "";
        location.hash = page;
        render();
      }),
  );
  document
    .querySelectorAll("[data-detail]")
    .forEach((b) => (b.onclick = () => detail(b.dataset.detail)));
  document
    .querySelectorAll("[data-job]")
    .forEach((b) => (b.onclick = () => jobDetail(b.dataset.job)));
  document
    .querySelectorAll("[data-play]")
    .forEach((b) => (b.onclick = () => play(b.dataset.play)));
  document
    .querySelectorAll("[data-review]")
    .forEach((b) => (b.onclick = () => review(b.dataset.review)));
  document.querySelectorAll("[data-select]").forEach(
    (b) =>
      (b.onclick = () => {
        selected.has(b.dataset.select)
          ? selected.delete(b.dataset.select)
          : selected.add(b.dataset.select);
        render();
      }),
  );
  document.querySelectorAll("[data-action]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.action;
        if (a === "mode") {
          demo = !demo;
          localStorage.setItem("replica-demo", demo);
          selected.clear();
          load();
        } else if (a === "refresh") load();
        else formDialog(a);
      }),
  );
  document.querySelectorAll("[data-batch]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/batches/${b.dataset.batch}/${b.dataset.op}`, {}, () => {
          const t = state.batches.find((t) => t.id === b.dataset.batch);
          t.status = b.dataset.op === "pause" ? "paused" : "running";
          if (b.dataset.op === "start") {
            state.jobs ??= [];
            t.candidate_ids.forEach((id, i) => {
              if (
                !state.jobs.some(
                  (j) => j.batch_id === t.id && j.candidate_id === id,
                )
              )
                state.jobs.unshift({
                  id: "demo-job-" + Date.now() + "-" + i,
                  candidate_id: id,
                  batch_id: t.id,
                  stage: "rea",
                  status: "queued",
                  route: null,
                  progress: 0,
                  attempt: 0,
                  created_at: new Date().toISOString(),
                });
            });
          }
        })),
  );
  document.querySelectorAll("[data-retry]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/jobs/${b.dataset.retry}/retry`, {}, () => {
          const j = state.jobs.find((j) => j.id === b.dataset.retry);
          j.status = "queued";
          j.progress = 0;
        })),
  );
  document.querySelectorAll("[data-tool]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/tools/${b.dataset.tool}/toggle`, {}, () => {
          const t = state.tools.find((t) => t.id === b.dataset.tool);
          t.enabled = !t.enabled;
        })),
  );
  document.querySelectorAll("[data-source]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/sources/${b.dataset.source}/toggle`, {}, () => {
          const t = state.sources.find((t) => t.id === b.dataset.source);
          t.enabled = !t.enabled;
        })),
  );
  document
    .querySelectorAll("[data-unpublish]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          mutate(
            `/api/versions/${b.dataset.unpublish}/unpublish`,
            {},
            () =>
              (state.versions.find((v) => v.id === b.dataset.unpublish).status =
                "approved"),
          )),
    );
  if ($("#filter-query"))
    $("#filter-query").oninput = (e) => {
      query = e.target.value;
      const pos = e.target.selectionStart;
      $("#page").innerHTML = page === "library" ? library() : candidates();
      bind();
      $("#filter-query").focus();
      $("#filter-query").setSelectionRange(pos, pos);
    };
  if ($("#filter-category"))
    $("#filter-category").onchange = (e) => {
      filter = e.target.value;
      render();
    };
  if ($("#global-search"))
    $("#global-search").onkeydown = (e) => {
      if (e.key === "Enter") {
        query = e.target.value;
        page = "candidates";
        render();
      }
    };
  if ($("#settings-form"))
    $("#settings-form").onsubmit = (e) => {
      e.preventDefault();
      const body = Object.fromEntries(
        [...new FormData(e.target)].map(([k, v]) => [k, Number(v)]),
      );
      mutate("/api/settings", body, () => Object.assign(state.settings, body));
    };
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
window.addEventListener("hashchange", () => {
  const n = location.hash.slice(1);
  if (n !== page) {
    page = n;
    render();
  }
});
load();

function trendChart(rows) {
  if (demo)
    rows = [3, 5, 4, 8, 6, 9, 12].map((n, i) => ({
      date: "10/" + (7 + i),
      acquired: n,
      imported: Math.floor(n / 3),
    }));
  if (!rows?.length) return empty("暂无趋势数据", "正式运行后展示每日真实产出");
  const max = Math.max(1, ...rows.flatMap((r) => [r.acquired, r.imported]));
  return `<div class="chart">${rows.map((r) => `<div class="chart-col"><div class="bar" style="height:${(r.acquired / max) * 90}%" title="获取 ${r.acquired} 款"></div><div class="bar second" style="height:${(r.imported / max) * 90}%" title="入库 ${r.imported} 款"></div><span class="chart-label">${esc(r.date.slice(-5))}</span></div>`).join("")}</div>`;
}
function editCandidate(id) {
  const c = cBy(id);
  modal(
    "编辑游戏资料",
    `<form id="edit-candidate"><label>分类</label><input name="category" value="${esc(c.category)}"><label>代码与素材使用条件</label><select name="rights">${[
      ["unknown", "待确认"],
      ["owned", "自有"],
      ["licensed", "已授权"],
      ["open", "开源许可已核对"],
    ]
      .map(
        ([v, t]) =>
          `<option value="${v}" ${c.rights === v ? "selected" : ""}>${t}</option>`,
      )
      .join(
        "",
      )}</select><label>本地源码目录（执行器可读取的位置）</label><input name="source_path" value="${esc(c.source_path)}"><label>玩法说明</label><textarea name="description">${esc(c.description)}</textarea><label>试玩观察记录</label><textarea name="observations">${esc(typeof c.observations === "object" ? JSON.stringify(c.observations, null, 2) : c.observations)}</textarea><div class="modalfooter"><button class="primary">保存资料</button></div></form>`,
  );
  $("#edit-candidate").onsubmit = (e) => {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.target));
    mutate(`/api/candidates/${id}/update`, b, () => Object.assign(c, b));
  };
}

function screenshotItems(c) {
  return [
    c.cover,
    ...(Array.isArray(c.screenshots) ? c.screenshots : []).map((x) =>
      typeof x === "string" ? x : x.url || x.src,
    ),
  ]
    .filter(Boolean)
    .map(safeUrl)
    .filter((u) => u !== "#");
}
function gallery(id, index = 0, isVersion = false) {
  const c = isVersion
      ? (state.versions || []).find((v) => v.id === id)
      : cBy(id),
    images = screenshotItems(c);
  modal(
    c.title + " · 截图 " + (index + 1) + " / " + images.length,
    `<img style="width:100%;max-height:65vh;object-fit:contain" src="${esc(images[index])}" alt="游戏截图 ${index + 1}"><div class="modalfooter"><button id="gallery-prev" ${index === 0 ? "disabled" : ""}>← 上一张</button><button id="gallery-return">返回详情</button><button id="gallery-next" ${index === images.length - 1 ? "disabled" : ""}>下一张 →</button></div>`,
    true,
  );
  $("#gallery-prev").onclick = () => gallery(id, index - 1, isVersion);
  $("#gallery-next").onclick = () => gallery(id, index + 1, isVersion);
  $("#gallery-return").onclick = () => detail(isVersion ? c.candidate_id : id);
}

setInterval(async () => {
  if (
    demo ||
    document.hidden ||
    $("#overlay").children.length ||
    page === "settings" ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
  )
    return;
  try {
    state = await api("/api/state");
    render();
  } catch {}
}, 10000);
