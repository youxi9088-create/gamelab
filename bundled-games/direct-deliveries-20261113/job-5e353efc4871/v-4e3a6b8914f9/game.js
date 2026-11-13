function retirePanelControls(html) {
  const content = document.createElement('template');
  content.innerHTML = html;
  for (const node of content.content.querySelectorAll('[data-unlock],[data-star],[data-pumpkin],[data-tab="online"],#bPickFriend,#bOnlineCta,#bSecond,#bDouble,#bDrawStar,[data-top=online],#sPlayOnline,button.onl,button.frb')) node.remove();
  return content.innerHTML;
}
var e = Object.create,
  t = Object.defineProperty,
  n = Object.getOwnPropertyDescriptor,
  r = Object.getOwnPropertyNames,
  i = Object.getPrototypeOf,
  a = Object.prototype.hasOwnProperty,
  o = (e, t, n) => () => {
    if (n) throw n[0];
    try {
      return e && (t = e(e = 0)), t;
    } catch (e) {
      throw n = [e], e;
    }
  },
  s = (e, t) => () => (t || (e((t = {
    exports: {}
  }).exports, t), e = null), t.exports),
  c = (e, i, o, s) => {
    if (i && typeof i == `object` || typeof i == `function`) for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
      get: (e => i[e]).bind(null, d),
      enumerable: !(s = n(i, d)) || s.enumerable
    });
    return e;
  },
  l = (n, r, o) => (o = n == null ? {} : e(i(n)), c(r || !n || !n.__esModule || !a.call(n, `default`) ? t(o, `default`, {
    value: n,
    enumerable: !0
  }) : o, n));
(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver(e => {
    for (let t of e) if (t.type === `childList`) for (let e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, {
    childList: !0,
    subtree: !0
  });
  function t(e) {
    let t = {};
    return e.integrity && (t.integrity = e.integrity), e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy), t.credentials = e.crossOrigin === `use-credentials` ? `include` : e.crossOrigin === `anonymous` ? `omit` : `same-origin`, t;
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var u = (e, t = `0 0 24 24`) => `<svg class="ic" viewBox="${t}" aria-hidden="true">${e}</svg>`,
  d = {
    pumpkin: u(`<ellipse cx="7.6" cy="14" rx="5.4" ry="7" fill="#e85d0c"/><ellipse cx="16.4" cy="14" rx="5.4" ry="7" fill="#e85d0c"/><ellipse cx="12" cy="14" rx="5.6" ry="7.4" fill="#ff8a1f"/><path d="M12 6.8q.4-3 2.6-4" stroke="#3dffb0" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7.6 12.4l1.8-2.6 1.8 2.6zM12.8 12.4l1.8-2.6 1.8 2.6zM7.4 16q4.6 3 9.2 0l-1.4.5-1.1 1-1.2-1-1.2 1-1.1-1z" fill="#fff27a"/>`),
    video: u(`<rect x="2.5" y="5" width="14" height="14" rx="3" fill="currentColor"/><path d="M17 10.2 21.5 7.5v9L17 13.8z" fill="currentColor"/><path d="M8 9.2v5.6l4.6-2.8z" fill="#1a0b3a"/>`),
    menu: u(`<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/>`),
    soundOn: u(`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>`),
    soundOff: u(`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`),
    trophy: u(`<path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v3H8v-3h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3zm0 4H6v1a2 2 0 0 0 1 1.7V7zm10 0v2.7A2 2 0 0 0 18 8V7h-1z" fill="currentColor"/>`),
    chev: u(`<path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
    grid: u(`<rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/>`),
    dice: u(`<rect x="3" y="3" width="18" height="18" rx="4.5" fill="currentColor"/><g fill="#10052b"><circle cx="8" cy="8" r="1.8"/><circle cx="16" cy="8" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="8" cy="16" r="1.8"/><circle cx="16" cy="16" r="1.8"/></g>`),
    check: u(`<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    share: u(`<circle cx="18" cy="5" r="2.6" fill="currentColor"/><circle cx="6" cy="12" r="2.6" fill="currentColor"/><circle cx="18" cy="19" r="2.6" fill="currentColor"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3" stroke="currentColor" stroke-width="2.2" fill="none"/>`),
    star: u(`<path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z" fill="currentColor"/>`),
    bot: u(`<rect x="4" y="7" width="16" height="12" rx="4" fill="currentColor"/><circle cx="9" cy="13" r="1.8" fill="#1a0b3a"/><circle cx="15" cy="13" r="1.8" fill="#1a0b3a"/><path d="M12 7V3.5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="3" r="1.6" fill="currentColor"/>`),
    two: u(`<circle cx="8" cy="8" r="3.4" fill="currentColor"/><circle cx="16.5" cy="8" r="3.4" fill="currentColor"/><path d="M2 20c0-4 2.8-6.5 6-6.5s6 2.5 6 6.5zM12 20c.2-2.8-.6-4.6-1.6-5.8 1.6-.9 3.6-1 6.1-.7 3 .6 5.5 2.8 5.5 6.5z" fill="currentColor"/>`),
    flame: u(`<path d="M12 2.5c1 3.6 5.8 5.8 5.8 11.2A5.8 5.8 0 0 1 6.2 13.7c0-2.6 1.3-4.2 2.6-5.3.1 1.8.9 3 2 3.4-.6-3.4.2-6.6 1.2-9.3z" fill="currentColor"/>`),
    close: u(`<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>`),
    globe: u(`<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" fill="none" stroke="currentColor" stroke-width="2.3"/>`),
    people: u(`<circle cx="9" cy="8" r="3.5" fill="currentColor"/><circle cx="17" cy="9" r="2.8" fill="currentColor"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" fill="currentColor"/><path d="M15.5 14.4c3.4-.4 6 1.7 6 5.1h-4.4" fill="currentColor"/>`),
    hash: u(`<path d="M9 3 7 21M17 3l-2 18M4 8.5h17M3 15.5h17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>`),
    palette: u(`<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.3-1.1-1.6-1.1-2.7 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" fill="currentColor"/><circle cx="7.5" cy="11" r="1.5" fill="#1a0b3a"/><circle cx="10" cy="7" r="1.5" fill="#1a0b3a"/><circle cx="15" cy="7" r="1.5" fill="#1a0b3a"/>`),
    help: u(`<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M9.3 9.4a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2.9-1.2 1.8v.4" stroke="#1a0b3a" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.3" fill="#1a0b3a"/>`),
    undo: u(`<path d="M9 14 4 9l5-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 9H14a5.5 5.5 0 0 1 0 11h-3.5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    stats: u(`<rect x="3.5" y="12" width="4.4" height="8.5" rx="1.3" fill="currentColor"/><rect x="9.8" y="6.5" width="4.4" height="14" rx="1.3" fill="currentColor"/><rect x="16.1" y="3" width="4.4" height="17.5" rx="1.3" fill="currentColor"/>`),
    bulb: u(`<path d="M12 2.8a6.6 6.6 0 0 0-3.9 11.9c.7.5 1.1 1.3 1.1 2.1v.6h5.6v-.6c0-.8.4-1.6 1.1-2.1A6.6 6.6 0 0 0 12 2.8z" fill="currentColor"/><rect x="9.2" y="18.6" width="5.6" height="2.6" rx="1.2" fill="currentColor"/>`),
    swap: u(`<path d="M7 8h12l-3.5-3.5M17 16H5l3.5 3.5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    lock: u(`<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" stroke-width="2.4" fill="none"/>`),
    hand: u(`<path d="M9 21c-1.5-1.7-4.3-5-4.9-6-.7-1.1.5-2.4 1.6-1.6l2.3 1.8V4.6c0-1 .7-1.6 1.5-1.6s1.5.6 1.5 1.6v6.1c0-.9.7-1.5 1.5-1.5s1.5.6 1.5 1.5v.6c0-.9.7-1.5 1.5-1.5s1.5.6 1.5 1.5v.9c0-.9.7-1.4 1.4-1.4.8 0 1.5.6 1.5 1.5V16c0 2.4-1 3.8-2 5z" fill="#fff" stroke="#1a0b3a" stroke-width="1.2" stroke-linejoin="round"/>`)
  },
  f = `mode.classic|mode.infinity|mode.four|mode.five|modeInfo.infinity|opp.bot|opp.two|level.easy|level.medium|level.hard|you|bot|p1|p2|draws|turn.you|turn.bot|hint.tap|res.win|res.lose|res.draw|res.drawLong|res.pwin|cheer.1|cheer.2|cheer.3|cheer.4|cheer.5|next|second|secondSub|close|unlock|use|using|newSkin|test.video|test.note|mode|level|stats|statsSub|won|lost|drawn|winRate|bestStreak|streakNow|newBest|streakKept|saveStreak|leaveT|leaveB|leaveYes|leaveNo|streakTip|total|undo|mode.six|hint|playAs|playAsNext|changeStyle|style|pieces|backgrounds|newBg|nextUnlock|ev.title|ev.until|ev.tag|newTag|ev.got|unlocked|moreN|double|doubled|evReward|kNewBg|kNewPieces|useNow|drawStar|gotStar|drawStars|allUnlocked|oppLabel|language|on.thisDevice|on.thisDeviceSub|on.online|on.onlineSub|on.title|on.quick|on.quickSub|on.friend|on.friendSub|on.join|on.finding|on.nobody|on.keep|on.bot|on.code|on.share|on.copy|on.copied|on.waitFriend|on.joinT|on.joinSub|on.joinBtn|on.badCode|on.connecting|on.theirTurn|on.again|on.someoneElse|on.waitAgain|on.wantsAgain|on.left|on.leave|on.error|on.ctaD|on.botNow|on.versus|on.youLose|on.timeUp|on.oppGone|on.ready|on.newPlayer|on.statsSub|on.statsEmpty|on.leaveT|on.leaveSub|on.stay|on.bar|on.found|on.foundSub|on.playNow|on.stopped|on.noAnswer|on.timeout|on.barShort|on.waitHint|on.notNow|on.changeMode|on.random|on.now|on.ruleInf|on.ruleK|on.shareBtn|on.shareText|on.local|mode.more|on.friendShort|inv.botWait|inv.botWaitShort|inv.here|inv.hereSub|inv.left|inv.sent|inv.shareAgain|inv.joining|inv.keepOpen|inv.ended|inv.ready|inv.back|inv.warnT|inv.warnB|inv.warnKeep|inv.warnGo|inv.full|on.codeHint|bd.tab|bd.modes|bd.ach|bd.events|bd.limited|bd.yours|bd.select|bd.remove|bd.back|bd.replace|bd.intro|bd.introSub|bd.show|bd.max|bd.t.bronze|bd.t.silver|bd.t.gold|bd.t.plat|bd.t.dia|bd.t.master|bd.t.gm|bd.t.legend|bd.streak|bd.bot|bd.friends|bd.halloween|bd.speed|bd.days|bd.allround|bd.v.speed|bd.v.days|bd.v.allround|bd.how.speed|bd.how.days|bd.how.allround|bd.v.mode|bd.v.streak|bd.v.bot|bd.v.friends|bd.how.mode|bd.how.streak|bd.how.bot|bd.how.friends|bd.how.event|on.perModeNew`,
  p = {
    en: `Classic|Infinity|4×4|5×5|3 marks each. Your oldest one vanishes!|vs Bot|2 Players|Easy|Medium|Hard|You|Bot|Player 1|Player 2|Draws|Your turn!|Bot is thinking…|Tap a square!|You win!|Bot wins!|Draw!|Too even! It’s a draw.|{name} wins!|Awesome!|Epic move!|Unstoppable!|Genius!|So close!|Next round|Second chance|Take back your last move|Close|Unlock now|Use|In use|New skin unlocked!|Test video|A video plays here on Poki ({n})|Mode|Level|Stats|Your games vs the bot|Won|Lost|Draw|Win %|Best streak|Win streak|New best!|Streak kept|Save your streak|Are you sure?|Starting a new game ends your win streak.|New game|Keep playing|{n}-win streak|Total|Undo|6×6|Hint|Play as|You switch at the start of the next round.|Change style|Style|Pieces|Backgrounds|New background!|Next|Halloween event|Until Nov 1|Event|NEW|All event rewards collected!|Unlocked!|{n} more|Double reward|Doubled!|Halloween event reward|New background|New pieces|Use it now|Get a star|Star added!|Get {n} stars|Everything unlocked!|Play against|Language|On this device|Take turns on one screen|Online|Play someone, or invite a friend|Play online|Quick match|Play a random player|Play with a friend|Get a link to share|Join with a code|Finding an opponent…|No players found right now|Keep searching|Play the bot|Your game code|Send the link or code to a friend|Copy invite link|Link copied!|Waiting for your friend…|Join a friend|Type the code your friend sent you|Join|Game not found|Connecting…|Their turn…|Play again|Play someone else|Waiting for {name}…|{name} wants a rematch!|{name} left the game|Leave|Connection problem. Try again.|Play online|No players found, playing the bot|vs {name}|You lose!|Time's up! A random move was played.|{name} left. Back to the bot.|Get ready!|New player|Your online quick matches|No online games yet|Leave the match?|This counts as a loss.|Keep playing|Finding a player…|Player found!|{name} wants to play|Play now|Search stopped|{name} didn't answer. Still searching…|No player found, search stopped|Searching…|Play the bot while you wait!|Not now|Change mode|Random|Now|Only your last 3 marks stay!|{k} in a row wins!|Share invite|Play Tic Tac Toe with me!|Local|More|Play friends|Play the bot while you wait|Bot while you wait|Your friend is here!|{name} joined your game|Your friend left|Invite sent!|Share again|Joining your friend's game|Keep this page open|Your friend's game has ended|Your game is ready!|Invite them back|Close your invite?|Your friend can't join anymore if you play online now.|Keep waiting|Play online anyway|This game is already full|4 letters/numbers|Badges|Online modes|Achievements|Events|Limited|Your badges|Select|Unselect|Back|Replace which?|Badges!|You already earned these|Show my badges|Top tier!|Bronze|Silver|Gold|Platinum|Diamond|Master|Grandmaster|Legend|Win streak|Bot slayer|Friends|Halloween|Speed|Daily streak|All-rounder|{n} fast wins|best {n} days in a row|{n} wins in every mode|Win an online match fast: under 1 s per move|Play {n} days in a row|Win an online match in every mode|{n} wins|best {n}|{n} Hard wins|{n} games|Win an online quick match in {mode}|Win {n} online matches in a row|Beat the bot on Hard|Play a game with a friend|Halloween event 2026|Per-mode stats count from this update on`,
    de: `Klassisch|Unendlich|4×4|5×5|Je 3 Zeichen. Dein ältestes verschwindet!|vs Bot|2 Spieler|Leicht|Mittel|Schwer|Du|Bot|Spieler 1|Spieler 2|Remis|Du bist dran!|Bot denkt nach…|Tippe auf ein Feld!|Gewonnen!|Bot gewinnt!|Unentschieden!|Zu ausgeglichen! Unentschieden.|{name} gewinnt!|Super!|Epischer Zug!|Unaufhaltsam!|Genial!|Knapp!|Nächste Runde|Zweite Chance|Letzten Zug zurücknehmen|Schließen|Jetzt freischalten|Wählen|Aktiv|Neuer Skin!|Testvideo|Auf Poki läuft hier ein Video ({n})|Modus|Stufe|Statistik|Deine Spiele gegen den Bot|Siege|Niederl.|Remis|Sieg %|Beste Serie|Siegesserie|Neuer Rekord!|Serie bleibt|Serie retten|Bist du sicher?|Ein neues Spiel beendet deine Siegesserie.|Neues Spiel|Weiterspielen|{n} Siege in Folge|Gesamt|Zurück|6×6|Tipp|Spiele als|Du wechselst zu Beginn der nächsten Runde.|Stil ändern|Stil|Figuren|Hintergründe|Neuer Hintergrund!|Als Nächstes|Halloween-Event|Bis 1. Nov.|Event|NEU|Alle Event-Belohnungen gesammelt!|Freigeschaltet!|Noch {n}|Belohnung verdoppeln|Verdoppelt!|Belohnung aus dem Halloween-Event|Neuer Hintergrund|Neue Figuren|Jetzt nutzen|Stern holen|Stern erhalten!|{n} Sterne holen|Alles freigeschaltet!|Spiele gegen|Sprache|Auf diesem Gerät|Abwechselnd auf einem Bildschirm|Online|Spiel gegen jemanden oder lade Freunde ein|Online spielen|Schnelles Spiel|Gegen zufällige Spieler|Mit Freunden spielen|Hol dir einen Link zum Teilen|Mit Code beitreten|Gegner wird gesucht…|Gerade keine Spieler gefunden|Weiter suchen|Gegen den Bot|Dein Spielcode|Schick den Link oder Code an Freunde|Einladung kopieren|Link kopiert!|Warte auf deinen Freund…|Freund beitreten|Gib den Code deines Freundes ein|Beitreten|Spiel nicht gefunden|Verbinden…|Gegner ist dran…|Nochmal|Gegen jemand anderen|Warte auf {name}…|{name} will eine Revanche!|{name} hat das Spiel verlassen|Verlassen|Verbindungsproblem. Versuch es nochmal.|Online spielen|Keine Spieler gefunden, du spielst gegen den Bot|vs {name}|Du verlierst!|Zeit abgelaufen! Ein zufälliger Zug wurde gespielt.|{name} ist weg. Zurück zum Bot.|Mach dich bereit!|Neu|Deine Online-Schnellspiele|Noch keine Online-Spiele|Spiel verlassen?|Das zählt als Niederlage.|Weiterspielen|Spieler wird gesucht…|Spieler gefunden!|{name} will spielen|Jetzt spielen|Suche beendet|{name} hat nicht reagiert. Wir suchen weiter…|Kein Spieler gefunden, Suche beendet|Suche…|Spiel gegen den Bot, während du wartest!|Nicht jetzt|Modus wechseln|Zufall|Jetzt|Nur deine letzten 3 Zeichen bleiben!|{k} in einer Reihe gewinnt!|Einladung teilen|Spiel Tic Tac Toe mit mir!|Zu zweit|Weitere|Mit Freunden|Spiel gegen den Bot, während du wartest|Bot beim Warten|Dein Freund ist da!|{name} ist deinem Spiel beigetreten|Dein Freund ist weg|Einladung gesendet!|Nochmal teilen|Zum Spiel deines Freundes|Lass diese Seite offen|Das Spiel deines Freundes ist vorbei|Dein Spiel ist bereit!|Erneut einladen|Einladung schließen?|Dein Freund kann nicht mehr beitreten, wenn du jetzt online spielst.|Weiter warten|Trotzdem online spielen|Dieses Spiel ist schon voll|4 Buchstaben/Ziffern|Abzeichen|Online-Modi|Erfolge|Events|Limitiert|Deine Abzeichen|Wählen|Abwählen|Zurück|Welches ersetzen?|Abzeichen!|Die hast du schon verdient|Meine Abzeichen|Höchste Stufe!|Bronze|Silber|Gold|Platin|Diamant|Meister|Großmeister|Legende|Siegesserie|Bot-Bezwinger|Freunde|Halloween|Tempo|Tagesserie|Allrounder|{n} schnelle Siege|beste {n} Tage in Folge|{n} Siege in jedem Modus|Gewinne ein Online-Spiel schnell: unter 1 s pro Zug|Spiele {n} Tage in Folge|Gewinne ein Online-Spiel in jedem Modus|{n} Siege|beste {n}|{n} Siege auf Schwer|{n} Spiele|Gewinne ein Online-Schnellspiel in {mode}|Gewinne {n} Online-Spiele am Stück|Besiege den Bot auf Schwer|Spiele mit einem Freund|Halloween-Event 2026|Pro Modus wird ab diesem Update gezählt`,
    es: `Clásico|Infinito|4×4|5×5|3 fichas cada uno. ¡La más antigua desaparece!|vs Bot|2 jugadores|Fácil|Medio|Difícil|Tú|Bot|Jugador 1|Jugador 2|Empates|¡Tu turno!|El bot piensa…|¡Toca una casilla!|¡Ganaste!|¡Gana el bot!|¡Empate!|¡Muy igualado! Empate.|¡{name} gana!|¡Increíble!|¡Jugada épica!|¡Imparable!|¡Genial!|¡Casi!|Siguiente ronda|Segunda oportunidad|Deshaz tu última jugada|Cerrar|Desbloquear|Usar|En uso|¡Nuevo skin!|Vídeo de prueba|Aquí se ve un vídeo en Poki ({n})|Modo|Nivel|Estadísticas|Tus partidas contra el bot|Ganadas|Perdidas|Empates|% victorias|Mejor racha|Racha de victorias|¡Nuevo récord!|Racha intacta|Salva tu racha|¿Seguro?|Empezar otra partida termina tu racha.|Nueva partida|Seguir jugando|Racha de {n} victorias|Total|Deshacer|6×6|Pista|Jugar con|Cambias al empezar la siguiente ronda.|Cambiar estilo|Estilo|Fichas|Fondos|¡Nuevo fondo!|Siguiente|Evento de Halloween|Hasta el 1 nov.|Evento|NUEVO|¡Tienes todos los premios del evento!|¡Desbloqueado!|Faltan {n}|Duplicar premio|¡Duplicado!|Premio del evento de Halloween|Nuevo fondo|Fichas nuevas|Usar ahora|Consigue una estrella|¡Estrella añadida!|Consigue {n} estrellas|¡Todo desbloqueado!|Jugar contra|Idioma|En este dispositivo|Por turnos en una pantalla|En línea|Juega contra alguien o invita a un amigo|Jugar en línea|Partida rápida|Contra un jugador al azar|Jugar con un amigo|Consigue un enlace para compartir|Unirse con un código|Buscando rival…|No hay jugadores ahora mismo|Seguir buscando|Jugar contra el bot|Tu código de partida|Envía el enlace o el código a un amigo|Copiar invitación|¡Enlace copiado!|Esperando a tu amigo…|Unirse a un amigo|Escribe el código que te envió tu amigo|Unirse|Partida no encontrada|Conectando…|Su turno…|Jugar otra vez|Jugar contra otra persona|Esperando a {name}…|¡{name} quiere la revancha!|{name} abandonó la partida|Salir|Problema de conexión. Inténtalo de nuevo.|Jugar en línea|No hay jugadores, juegas contra el bot|vs {name}|¡Pierdes!|¡Se acabó el tiempo! Se jugó un movimiento al azar.|{name} se fue. Vuelves al bot.|¡Prepárate!|Nuevo|Tus partidas rápidas en línea|Aún no hay partidas en línea|¿Salir de la partida?|Cuenta como derrota.|Seguir jugando|Buscando jugador…|¡Jugador encontrado!|{name} quiere jugar|Jugar ahora|Búsqueda detenida|{name} no respondió. Seguimos buscando…|No se encontró jugador, búsqueda detenida|Buscando…|¡Juega contra el bot mientras esperas!|Ahora no|Cambiar modo|Aleatorio|Ahora|¡Solo quedan tus 3 últimas marcas!|¡{k} en línea gana!|Compartir invitación|¡Juega al tres en raya conmigo!|Local|Más|Con amigos|Juega contra el bot mientras esperas|Bot mientras esperas|¡Tu amigo está aquí!|{name} se unió a tu partida|Tu amigo se fue|¡Invitación enviada!|Compartir otra vez|Entrando a la partida de tu amigo|Mantén esta página abierta|La partida de tu amigo terminó|¡Tu partida está lista!|Invítalo otra vez|¿Cerrar tu invitación?|Tu amigo ya no podrá unirse si juegas online ahora.|Seguir esperando|Jugar online igualmente|Esta partida ya está llena|4 letras/números|Insignias|Modos online|Logros|Eventos|Limitada|Tus insignias|Elegir|Deseleccionar|Volver|¿Cuál reemplazar?|¡Insignias!|Ya ganaste estas|Ver mis insignias|¡Nivel máximo!|Bronce|Plata|Oro|Platino|Diamante|Maestro|Gran maestro|Leyenda|Racha|Cazabots|Amigos|Halloween|Velocidad|Racha diaria|Todoterreno|{n} victorias rápidas|mejor: {n} días seguidos|{n} victorias en cada modo|Gana rápido una partida online: menos de 1 s por jugada|Juega {n} días seguidos|Gana una partida online en cada modo|{n} victorias|mejor {n}|{n} victorias en Difícil|{n} partidas|Gana una partida rápida online en {mode}|Gana {n} partidas online seguidas|Vence al bot en Difícil|Juega una partida con un amigo|Evento de Halloween 2026|Las estadísticas por modo cuentan desde esta actualización`,
    fr: `Classique|Infini|4×4|5×5|3 pions chacun. Le plus ancien disparaît !|vs Robot|2 joueurs|Facile|Moyen|Difficile|Toi|Robot|Joueur 1|Joueur 2|Nuls|À toi !|Le robot réfléchit…|Touche une case !|Gagné !|Le robot gagne !|Match nul !|Trop serré ! Match nul.|{name} gagne !|Génial !|Coup épique !|Inarrêtable !|Quel génie !|Presque !|Manche suivante|Seconde chance|Annule ton dernier coup|Fermer|Débloquer|Choisir|Choisi|Nouveau skin !|Vidéo test|Une vidéo passe ici sur Poki ({n})|Mode|Niveau|Statistiques|Tes parties contre le robot|Gagnées|Perdues|Nuls|% victoires|Meilleure série|Série de victoires|Nouveau record !|Série conservée|Sauve ta série|Tu es sûr ?|Une nouvelle partie met fin à ta série.|Nouvelle partie|Continuer|{n} victoires d’affilée|Total|Annuler|6×6|Indice|Jouer avec|Le changement se fait à la prochaine manche.|Changer de style|Style|Pions|Fonds|Nouveau fond !|Prochain|Événement Halloween|Jusqu’au 1er nov.|Événement|NOUVEAU|Toutes les récompenses obtenues !|Débloqué !|Encore {n}|Doubler la récompense|Doublé !|Récompense de l’événement Halloween|Nouveau fond|Nouveaux pions|L’utiliser|Gagner une étoile|Étoile ajoutée !|Gagner {n} étoiles|Tout est débloqué !|Jouer contre|Langue|Sur cet appareil|Chacun son tour sur un écran|En ligne|Joue contre quelqu'un ou invite un ami|Jouer en ligne|Partie rapide|Contre un joueur au hasard|Jouer avec un ami|Obtiens un lien à partager|Rejoindre avec un code|Recherche d’un adversaire…|Aucun joueur trouvé pour le moment|Continuer à chercher|Jouer contre le robot|Ton code de partie|Envoie le lien ou le code à un ami|Copier l'invitation|Lien copié !|En attente de ton ami…|Rejoindre un ami|Tape le code envoyé par ton ami|Rejoindre|Partie introuvable|Connexion…|À son tour…|Rejouer|Jouer contre quelqu'un d'autre|En attente de {name}…|{name} veut une revanche !|{name} a quitté la partie|Quitter|Problème de connexion. Réessaie.|Jouer en ligne|Aucun joueur trouvé, tu joues contre le robot|vs {name}|Tu as perdu !|Temps écoulé ! Un coup au hasard a été joué.|{name} est parti. Retour au robot.|Prépare-toi !|Nouveau|Tes parties rapides en ligne|Pas encore de partie en ligne|Quitter la partie ?|Ça compte comme une défaite.|Continuer|Recherche d’un joueur…|Joueur trouvé !|{name} veut jouer|Jouer|Recherche arrêtée|{name} n’a pas répondu. On cherche encore…|Aucun joueur trouvé, recherche arrêtée|Recherche…|Joue contre le robot en attendant !|Pas maintenant|Changer de mode|Au hasard|Actuel|Seules tes 3 dernières marques restent !|{k} alignés pour gagner !|Partager l'invitation|Joue au morpion avec moi !|À deux|Plus|Entre amis|Joue contre le bot en attendant|Bot en attendant|Ton ami est là !|{name} a rejoint ta partie|Ton ami est parti|Invitation envoyée !|Partager à nouveau|Tu rejoins la partie de ton ami|Garde cette page ouverte|La partie de ton ami est terminée|Ta partie est prête !|Réinvite-le|Fermer ton invitation ?|Ton ami ne pourra plus te rejoindre si tu joues en ligne maintenant.|Continuer d'attendre|Jouer en ligne quand même|Cette partie est déjà complète|4 lettres/chiffres|Badges|Modes en ligne|Succès|Événements|Limité|Tes badges|Choisir|Désélectionner|Retour|Remplacer lequel ?|Des badges !|Tu as déjà gagné ceux-ci|Voir mes badges|Niveau max !|Bronze|Argent|Or|Platine|Diamant|Maître|Grand maître|Légende|Série de victoires|Chasseur de bots|Amis|Halloween|Vitesse|Série de jours|Polyvalent|{n} victoires rapides|record : {n} jours d'affilée|{n} victoires dans chaque mode|Gagne vite une partie en ligne : moins de 1 s par coup|Joue {n} jours d'affilée|Gagne une partie en ligne dans chaque mode|{n} victoires|record {n}|{n} victoires en Difficile|{n} parties|Gagne une partie rapide en ligne en {mode}|Gagne {n} parties en ligne d’affilée|Bats le bot en Difficile|Joue une partie avec un ami|Événement Halloween 2026|Les stats par mode comptent depuis cette mise à jour`,
    id: `Klasik|Infinity|4×4|5×5|Masing-masing 3 tanda. Yang paling lama hilang!|vs Bot|2 Pemain|Mudah|Sedang|Sulit|Kamu|Bot|Pemain 1|Pemain 2|Seri|Giliranmu!|Bot sedang berpikir…|Ketuk satu kotak!|Kamu menang!|Bot menang!|Seri!|Terlalu imbang! Hasilnya seri.|{name} menang!|Keren!|Langkah hebat!|Tak terhentikan!|Jenius!|Nyaris!|Ronde berikutnya|Kesempatan kedua|Batalkan langkah terakhirmu|Tutup|Buka sekarang|Pakai|Dipakai|Skin baru terbuka!|Video uji|Video diputar di sini di Poki ({n})|Mode|Level|Statistik|Permainanmu melawan bot|Menang|Kalah|Seri|% Menang|Rekor beruntun|Menang beruntun|Rekor baru!|Beruntun aman|Selamatkan beruntunmu|Yakin?|Memulai permainan baru mengakhiri kemenangan beruntunmu.|Permainan baru|Terus main|{n} menang beruntun|Total|Mundur|6×6|Bantuan|Main sebagai|Berganti di awal ronde berikutnya.|Ganti gaya|Gaya|Bidak|Latar|Latar baru!|Berikutnya|Event Halloween|Sampai 1 Nov|Event|BARU|Semua hadiah event terkumpul!|Terbuka!|{n} lagi|Hadiah ganda|Dilipatgandakan!|Hadiah event Halloween|Latar baru|Bidak baru|Pakai sekarang|Dapatkan bintang|Bintang ditambahkan!|Dapatkan {n} bintang|Semua sudah terbuka!|Lawan|Bahasa|Di perangkat ini|Bergantian di satu layar|Online|Lawan seseorang, atau ajak teman|Main online|Main cepat|Lawan pemain acak|Main dengan teman|Dapatkan link untuk dibagikan|Gabung dengan kode|Mencari lawan…|Belum ada pemain saat ini|Terus cari|Lawan bot|Kode permainanmu|Kirim link atau kode ke teman|Salin link undangan|Link disalin!|Menunggu temanmu…|Gabung ke teman|Ketik kode dari temanmu|Gabung|Permainan tidak ditemukan|Menghubungkan…|Giliran lawan…|Main lagi|Lawan orang lain|Menunggu {name}…|{name} minta tanding ulang!|{name} keluar dari permainan|Keluar|Masalah koneksi. Coba lagi.|Main online|Tidak ada pemain, lawan bot|vs {name}|Kamu kalah!|Waktu habis! Langkah acak dimainkan.|{name} keluar. Kembali ke bot.|Bersiap!|Pemain baru|Main cepat online kamu|Belum ada permainan online|Keluar dari pertandingan?|Ini dihitung kalah.|Terus main|Mencari pemain…|Pemain ditemukan!|{name} ingin main|Main sekarang|Pencarian dihentikan|{name} tidak menjawab. Masih mencari…|Tidak ada pemain, pencarian dihentikan|Mencari…|Lawan bot sambil menunggu!|Nanti saja|Ganti mode|Acak|Sekarang|Hanya 3 tanda terakhirmu yang tetap!|{k} sejajar menang!|Bagikan undangan|Ayo main Tic Tac Toe denganku!|Lokal|Lainnya|Dengan teman|Lawan bot sambil menunggu|Bot sambil tunggu|Temanmu sudah datang!|{name} bergabung ke permainanmu|Temanmu sudah pergi|Undangan terkirim!|Bagikan lagi|Bergabung ke game temanmu|Biarkan halaman ini terbuka|Game temanmu sudah berakhir|Game kamu sudah siap!|Undang lagi|Tutup undanganmu?|Temanmu tidak bisa bergabung lagi jika kamu main online sekarang.|Tetap menunggu|Tetap main online|Permainan ini sudah penuh|4 huruf/angka|Lencana|Mode online|Pencapaian|Event|Terbatas|Lencanamu|Pilih|Batal pilih|Kembali|Ganti yang mana?|Lencana!|Kamu sudah mendapatkan ini|Lihat lencanaku|Tingkat tertinggi!|Perunggu|Perak|Emas|Platinum|Berlian|Master|Grandmaster|Legenda|Kemenangan beruntun|Penakluk bot|Teman|Halloween|Kecepatan|Runtutan harian|Serba bisa|{n} kemenangan cepat|terbaik {n} hari berturut-turut|{n} kemenangan di tiap mode|Menangkan pertandingan online dengan cepat: di bawah 1 dtk per langkah|Main {n} hari berturut-turut|Menangkan pertandingan online di tiap mode|{n} menang|terbaik {n}|{n} menang di Sulit|{n} game|Menangkan main cepat online di {mode}|Menangkan {n} pertandingan online berturut-turut|Kalahkan bot di Sulit|Main bersama teman|Event Halloween 2026|Statistik per mode dihitung sejak update ini`,
    it: `Classico|Infinito|4×4|5×5|3 segni a testa. Il più vecchio sparisce!|vs Bot|2 giocatori|Facile|Medio|Difficile|Tu|Bot|Giocatore 1|Giocatore 2|Pareggi|Tocca a te!|Il bot pensa…|Tocca una casella!|Hai vinto!|Vince il bot!|Pareggio!|Troppo equilibrato! Pareggio.|{name} vince!|Fantastico!|Mossa epica!|Inarrestabile!|Geniale!|Quasi!|Prossimo round|Seconda chance|Annulla la tua ultima mossa|Chiudi|Sblocca ora|Usa|In uso|Nuova skin!|Video di prova|Su Poki qui parte un video ({n})|Modalità|Livello|Statistiche|Le tue partite contro il bot|Vinte|Perse|Pari|% vittorie|Serie migliore|Serie di vittorie|Nuovo record!|Serie salva|Salva la serie|Sei sicuro?|Una nuova partita interrompe la tua serie.|Nuova partita|Continua|{n} vittorie di fila|Totale|Annulla|6×6|Aiuto|Gioca con|Cambi all’inizio del prossimo round.|Cambia stile|Stile|Pedine|Sfondi|Nuovo sfondo!|Prossimo|Evento di Halloween|Fino al 1 nov.|Evento|NUOVO|Hai tutti i premi dell’evento!|Sbloccato!|Ancora {n}|Raddoppia premio|Raddoppiato!|Premio dell’evento di Halloween|Nuovo sfondo|Nuove pedine|Usalo ora|Prendi una stella|Stella aggiunta!|Prendi {n} stelle|Tutto sbloccato!|Gioca contro|Lingua|Su questo dispositivo|A turno sullo stesso schermo|Online|Gioca contro qualcuno o invita un amico|Gioca online|Partita veloce|Contro un giocatore a caso|Gioca con un amico|Ottieni un link da condividere|Entra con un codice|Cerco un avversario…|Nessun giocatore trovato ora|Continua a cercare|Gioca contro il bot|Il tuo codice partita|Manda il link o il codice a un amico|Copia invito|Link copiato!|In attesa del tuo amico…|Unisciti a un amico|Scrivi il codice del tuo amico|Entra|Partita non trovata|Connessione…|Tocca a lui…|Gioca ancora|Gioca con qualcun altro|In attesa di {name}…|{name} vuole la rivincita!|{name} ha lasciato la partita|Esci|Problema di connessione. Riprova.|Gioca online|Nessun giocatore trovato, giochi contro il bot|vs {name}|Hai perso!|Tempo scaduto! È stata giocata una mossa a caso.|{name} è uscito. Torni al bot.|Preparati!|Nuovo|Le tue partite rapide online|Ancora nessuna partita online|Lasciare la partita?|Conta come una sconfitta.|Continua a giocare|Ricerca giocatore…|Giocatore trovato!|{name} vuole giocare|Gioca ora|Ricerca interrotta|{name} non ha risposto. Continuiamo a cercare…|Nessun giocatore trovato, ricerca interrotta|Ricerca…|Gioca col bot mentre aspetti!|Non ora|Cambia modalità|Casuale|Ora|Restano solo i tuoi ultimi 3 segni!|{k} in fila vince!|Condividi invito|Gioca a tris con me!|Locale|Altro|Con amici|Gioca contro il bot mentre aspetti|Bot mentre aspetti|Il tuo amico è qui!|{name} è entrato nella tua partita|Il tuo amico se n'è andato|Invito inviato!|Condividi di nuovo|Entri nella partita del tuo amico|Tieni aperta questa pagina|La partita del tuo amico è finita|La tua partita è pronta!|Invitalo di nuovo|Chiudere l'invito?|Il tuo amico non potrà più unirsi se giochi online adesso.|Continua ad aspettare|Gioca online comunque|Questa partita è già piena|4 lettere/numeri|Medaglie|Modalità online|Traguardi|Eventi|Limitata|Le tue medaglie|Scegli|Deseleziona|Indietro|Quale sostituire?|Medaglie!|Le hai già guadagnate|Le mie medaglie|Livello massimo!|Bronzo|Argento|Oro|Platino|Diamante|Maestro|Gran maestro|Leggenda|Serie di vittorie|Ammazza-bot|Amici|Halloween|Velocità|Serie giornaliera|Tuttofare|{n} vittorie rapide|record: {n} giorni di fila|{n} vittorie in ogni modalità|Vinci in fretta una partita online: meno di 1 s a mossa|Gioca {n} giorni di fila|Vinci una partita online in ogni modalità|{n} vittorie|record {n}|{n} vittorie a Difficile|{n} partite|Vinci una partita veloce online in {mode}|Vinci {n} partite online di fila|Batti il bot a Difficile|Gioca una partita con un amico|Evento di Halloween 2026|Le statistiche per modalità contano da questo aggiornamento`,
    ja: `クラシック|無限|4×4|5×5|マークは3つまで。一番古いのが消える！|CPU対戦|2人で|初級|中級|上級|あなた|CPU|プレイヤー1|プレイヤー2|引き分け|あなたの番！|CPUが考え中…|マスをタップ！|あなたの勝ち！|CPUの勝ち！|引き分け！|互角！引き分けです。|{name}の勝ち！|すごい！|神の一手！|止まらない！|天才！|惜しい！|次のラウンド|セカンドチャンス|最後の一手を取り消す|閉じる|今すぐ解放|使う|使用中|新しいスキンを解放！|テスト動画|Pokiではここで動画が流れます（{n}）|モード|レベル|戦績|CPUとの対戦成績|勝ち|負け|引き分け|勝率|最高連勝|連勝|新記録！|連勝キープ|連勝を守る|本当にいいですか？|新しいゲームを始めると連勝が終わります。|新しいゲーム|続ける|{n}連勝|合計|戻す|6×6|ヒント|使うマーク|次のラウンドから切り替わります。|スタイル変更|スタイル|マーク|背景|新しい背景！|次|ハロウィンイベント|11月1日まで|イベント|NEW|イベントのごほうびをすべてゲット！|解放！|あと{n}|ごほうび2倍|2倍になった！|ハロウィンイベントのごほうび|新しい背景|新しいマーク|今すぐ使う|星をもらう|星をゲット！|星を{n}個もらう|すべて解放済み！|対戦相手|言語|この端末で|1つの画面で交代で遊ぶ|オンライン|誰かと対戦、または友達を招待|オンライン対戦|クイック対戦|ランダムな相手と対戦|友達と遊ぶ|共有用リンクをもらう|コードで参加|対戦相手を探しています…|今はプレイヤーが見つかりません|探し続ける|CPUと遊ぶ|あなたのゲームコード|リンクかコードを友達に送ろう|招待リンクをコピー|リンクをコピーしました！|友達を待っています…|友達のゲームに参加|友達から届いたコードを入力|参加|ゲームが見つかりません|接続中…|相手の番…|もう一度|別の人と対戦|{name}を待っています…|{name}が再戦したがっています！|{name}が退出しました|退出|接続エラー。もう一度試してね。|オンライン対戦|相手が見つからないのでCPUと対戦|vs {name}|あなたの負け！|時間切れ！ランダムに置きました。|{name}が退出。CPU対戦に戻ります。|準備はいい？|新しいプレイヤー|オンラインのクイック対戦|まだオンライン対戦がありません|対戦を抜けますか？|負けになります。|続ける|プレイヤーを探し中…|プレイヤーが見つかった！|{name}が対戦したがっています|今すぐ対戦|検索を停止しました|{name}から応答なし。探し続けます…|相手が見つからず、検索を停止しました|検索中…|待つ間はCPUと遊ぼう！|あとで|モード変更|ランダム|今|残るのは最後の3つだけ！|{k}つ並べたら勝ち！|招待を共有|一緒にマルバツゲームしよう！|ローカル|その他|友達と|待っている間にボットと対戦|待つ間にボット|友だちが来ました！|{name}さんが参加しました|友だちは退出しました|招待を送りました！|もう一度共有|友だちのゲームに参加中|このページを開いたままにしてね|友だちのゲームは終了しました|ゲームの準備ができました！|もう一度招待|招待を閉じますか？|今オンラインで遊ぶと、友だちは参加できなくなります。|待ち続ける|それでもオンラインで遊ぶ|このゲームはすでに満員です|英数字4文字|バッジ|オンラインモード|実績|イベント|限定|あなたのバッジ|選ぶ|選択解除|戻る|どれと入れ替える？|バッジ！|もう獲得しています|バッジを見る|最高ランク！|ブロンズ|シルバー|ゴールド|プラチナ|ダイヤ|マスター|グランドマスター|レジェンド|連勝|ボットハンター|フレンド|ハロウィン|スピード|連続プレイ|オールラウンダー|スピード勝利 {n}回|最高 {n}日連続|全モードで{n}勝|オンライン対戦に素早く勝つ：1手1秒未満|{n}日連続で遊ぶ|全モードでオンライン対戦に勝つ|{n}勝|最高 {n}|むずかしいで{n}勝|{n}ゲーム|{mode}でオンラインのクイック対戦に勝つ|オンラインで{n}連勝する|むずかしいのボットに勝つ|フレンドと1ゲーム遊ぶ|ハロウィンイベント 2026|モード別の記録はこのアップデートから`,
    nl: `Klassiek|Oneindig|4×4|5×5|3 tekens per speler. Je oudste verdwijnt!|vs Bot|2 spelers|Makkelijk|Gemiddeld|Moeilijk|Jij|Bot|Speler 1|Speler 2|Gelijk|Jouw beurt!|Bot denkt na…|Tik op een vakje!|Gewonnen!|Bot wint!|Gelijkspel!|Te gelijk! Het is gelijkspel.|{name} wint!|Geweldig!|Epische zet!|Niet te stoppen!|Genie!|Bijna!|Volgende ronde|Tweede kans|Neem je laatste zet terug|Sluiten|Nu ontgrendelen|Kies|In gebruik|Nieuwe skin!|Testvideo|Op Poki speelt hier een video ({n})|Modus|Niveau|Statistieken|Jouw potjes tegen de bot|Gewonnen|Verloren|Gelijk|Win %|Beste reeks|Winreeks|Nieuw record!|Reeks blijft staan|Red je reeks|Weet je het zeker?|Een nieuw potje beëindigt je winreeks.|Nieuw potje|Verder spelen|{n} keer op rij gewonnen|Totaal|Terug|6×6|Tip|Speel als|Je wisselt bij het begin van de volgende ronde.|Stijl wijzigen|Stijl|Stukken|Achtergronden|Nieuwe achtergrond!|Volgende|Halloween-event|Tot 1 nov|Event|NIEUW|Alle eventbeloningen verzameld!|Vrijgespeeld!|Nog {n}|Dubbele beloning|Verdubbeld!|Beloning van het Halloween-event|Nieuwe achtergrond|Nieuwe stukken|Nu gebruiken|Pak een ster|Ster erbij!|Pak {n} sterren|Alles vrijgespeeld!|Speel tegen|Taal|Op dit apparaat|Om de beurt op één scherm|Online|Speel tegen iemand of nodig een vriend uit|Online spelen|Snel spel|Speel tegen een willekeurige speler|Speel met een vriend|Krijg een link om te delen|Meedoen met een code|Tegenstander zoeken…|Nu geen spelers gevonden|Blijf zoeken|Speel tegen de bot|Jouw spelcode|Stuur de link of code naar een vriend|Kopieer uitnodiging|Link gekopieerd!|Wachten op je vriend…|Speel met een vriend|Typ de code van je vriend|Meedoen|Spel niet gevonden|Verbinden…|Hun beurt…|Nog een keer|Speel tegen iemand anders|Wachten op {name}…|{name} wil een revanche!|{name} heeft het spel verlaten|Verlaten|Verbindingsprobleem. Probeer opnieuw.|Online spelen|Geen spelers gevonden, je speelt tegen de bot|vs {name}|Je verliest!|Tijd is op! Er is een willekeurige zet gedaan.|{name} is weg. Terug naar de bot.|Maak je klaar!|Nieuwe speler|Jouw snelle online potjes|Nog geen online potjes|Wedstrijd verlaten?|Dit telt als verlies.|Verder spelen|Speler zoeken…|Speler gevonden!|{name} wil spelen|Nu spelen|Zoeken gestopt|{name} reageerde niet. We zoeken verder…|Geen speler gevonden, zoeken gestopt|Zoeken…|Speel tegen de bot terwijl je wacht!|Nu niet|Andere modus|Willekeurig|Nu|Alleen je laatste 3 tekens blijven!|{k} op een rij wint!|Uitnodiging delen|Speel boter-kaas-en-eieren met me!|Samen|Meer|Met vrienden|Speel tegen de bot terwijl je wacht|Bot terwijl je wacht|Je vriend is er!|{name} doet mee met je spel|Je vriend is weg|Uitnodiging verstuurd!|Opnieuw delen|Naar het spel van je vriend|Houd deze pagina open|Het spel van je vriend is afgelopen|Je spel is klaar!|Nodig opnieuw uit|Je uitnodiging sluiten?|Je vriend kan niet meer meedoen als je nu online speelt.|Blijf wachten|Toch online spelen|Dit spel is al vol|4 letters/cijfers|Badges|Online modi|Prestaties|Events|Beperkt|Jouw badges|Kiezen|Deselecteren|Terug|Welke vervangen?|Badges!|Deze heb je al verdiend|Bekijk mijn badges|Hoogste niveau!|Brons|Zilver|Goud|Platina|Diamant|Meester|Grootmeester|Legende|Winreeks|Botverslaander|Vrienden|Halloween|Snelheid|Dagreeks|Allrounder|{n} snelle winsten|beste {n} dagen op rij|{n} winsten in elke modus|Win snel een online potje: onder 1 s per zet|Speel {n} dagen op rij|Win een online potje in elke modus|{n} gewonnen|beste {n}|{n} keer gewonnen op Moeilijk|{n} potjes|Win een online snelle match in {mode}|Win {n} online matches op rij|Versla de bot op Moeilijk|Speel een potje met een vriend|Halloween-event 2026|Per modus geteld vanaf deze update`,
    pl: `Klasyczny|Bez końca|4×4|5×5|Po 3 znaki. Najstarszy znika!|vs Bot|2 graczy|Łatwy|Średni|Trudny|Ty|Bot|Gracz 1|Gracz 2|Remisy|Twój ruch!|Bot myśli…|Dotknij pola!|Wygrana!|Bot wygrywa!|Remis!|Zbyt wyrównane! Remis.|{name} wygrywa!|Super!|Epicki ruch!|Nie do zatrzymania!|Geniusz!|Prawie!|Następna runda|Druga szansa|Cofnij swój ostatni ruch|Zamknij|Odblokuj|Wybierz|Wybrana|Nowa skórka!|Film testowy|Na Poki tu leci film ({n})|Tryb|Poziom|Statystyki|Twoje gry z botem|Wygrane|Przegrane|Remisy|% wygranych|Najlepsza seria|Seria wygranych|Nowy rekord!|Seria trwa|Uratuj serię|Na pewno?|Nowa gra zakończy twoją serię.|Nowa gra|Graj dalej|{n} wygranych z rzędu|Razem|Cofnij|6×6|Podpowiedź|Graj jako|Zmiana nastąpi w następnej rundzie.|Zmień styl|Styl|Pionki|Tła|Nowe tło!|Następne|Event Halloween|Do 1 lis.|Event|NOWE|Masz wszystkie nagrody z eventu!|Odblokowane!|Jeszcze {n}|Podwój nagrodę|Podwojone!|Nagroda z eventu Halloween|Nowe tło|Nowe pionki|Użyj teraz|Zdobądź gwiazdkę|Gwiazdka dodana!|Zdobądź gwiazdki ({n})|Wszystko odblokowane!|Graj przeciwko|Język|Na tym urządzeniu|Na zmianę na jednym ekranie|Online|Zagraj z kimś lub zaproś znajomego|Graj online|Szybka gra|Z losowym graczem|Graj ze znajomym|Otrzymaj link do udostępnienia|Dołącz kodem|Szukam przeciwnika…|Teraz nie ma graczy|Szukaj dalej|Graj z botem|Twój kod gry|Wyślij link lub kod znajomemu|Kopiuj zaproszenie|Link skopiowany!|Czekam na znajomego…|Dołącz do znajomego|Wpisz kod od znajomego|Dołącz|Nie znaleziono gry|Łączenie…|Jego ruch…|Zagraj jeszcze raz|Zagraj z kimś innym|Czekam na {name}…|{name} chce rewanżu!|{name} opuścił grę|Wyjdź|Problem z połączeniem. Spróbuj ponownie.|Graj online|Nie ma graczy, grasz z botem|vs {name}|Przegrywasz!|Czas minął! Wykonano losowy ruch.|{name} wyszedł. Wracasz do bota.|Przygotuj się!|Nowy gracz|Twoje szybkie mecze online|Brak gier online|Opuścić mecz?|To liczy się jako porażka.|Graj dalej|Szukam gracza…|Znaleziono gracza!|{name} chce zagrać|Graj teraz|Wyszukiwanie zatrzymane|{name} nie odpowiedział. Szukamy dalej…|Nie znaleziono gracza, wyszukiwanie zatrzymane|Szukam…|Graj z botem, kiedy czekasz!|Nie teraz|Zmień tryb|Losowo|Teraz|Zostają tylko 3 ostatnie znaki!|{k} w rzędzie wygrywa!|Udostępnij zaproszenie|Zagraj ze mną w kółko i krzyżyk!|Lokalnie|Więcej|Ze znajomymi|Graj z botem, czekając|Bot, gdy czekasz|Twój znajomy już jest!|{name} dołącza do gry|Twój znajomy wyszedł|Zaproszenie wysłane!|Udostępnij ponownie|Dołączasz do gry znajomego|Nie zamykaj tej strony|Gra znajomego się zakończyła|Twoja gra jest gotowa!|Zaproś ponownie|Zamknąć zaproszenie?|Twój znajomy nie dołączy, jeśli teraz zagrasz online.|Czekaj dalej|Mimo to graj online|Ta gra jest już pełna|4 litery/cyfry|Odznaki|Tryby online|Osiągnięcia|Wydarzenia|Limitowana|Twoje odznaki|Wybierz|Odznacz|Wróć|Którą zastąpić?|Odznaki!|Te już zdobyłeś|Pokaż moje odznaki|Najwyższy poziom!|Brąz|Srebro|Złoto|Platyna|Diament|Mistrz|Arcymistrz|Legenda|Seria zwycięstw|Pogromca botów|Znajomi|Halloween|Szybkość|Seria dni|Wszechstronny|{n} szybkich wygranych|rekord: {n} dni z rzędu|{n} wygranych w każdym trybie|Wygraj szybko mecz online: poniżej 1 s na ruch|Graj {n} dni z rzędu|Wygraj mecz online w każdym trybie|{n} wygranych|rekord {n}|{n} wygranych na Trudnym|{n} gier|Wygraj szybki mecz online w {mode}|Wygraj {n} meczów online z rzędu|Pokonaj bota na Trudnym|Zagraj z przyjacielem|Wydarzenie Halloween 2026|Statystyki trybów liczone od tej aktualizacji`,
    pt: `Clássico|Infinito|4×4|5×5|3 marcas cada. A mais antiga some!|vs Robô|2 jogadores|Fácil|Médio|Difícil|Você|Robô|Jogador 1|Jogador 2|Empates|Sua vez!|O robô está pensando…|Toque num quadrado!|Você venceu!|O robô venceu!|Empate!|Muito equilibrado! Empate.|{name} venceu!|Incrível!|Jogada épica!|Imparável!|Gênio!|Quase!|Próxima rodada|Segunda chance|Desfaça sua última jogada|Fechar|Desbloquear|Usar|Em uso|Skin nova!|Vídeo de teste|Um vídeo passa aqui no Poki ({n})|Modo|Nível|Estatísticas|Suas partidas contra o robô|Vitórias|Derrotas|Empates|% vitórias|Melhor sequência|Sequência de vitórias|Novo recorde!|Sequência mantida|Salve sua sequência|Tem certeza?|Começar outra partida encerra sua sequência.|Nova partida|Continuar|{n} vitórias seguidas|Total|Desfazer|6×6|Dica|Jogar com|Você troca no início da próxima rodada.|Mudar estilo|Estilo|Peças|Fundos|Fundo novo!|Próximo|Evento de Halloween|Até 1 nov.|Evento|NOVO|Você pegou todos os prêmios do evento!|Desbloqueado!|Faltam {n}|Dobrar prêmio|Dobrado!|Prêmio do evento de Halloween|Fundo novo|Peças novas|Usar agora|Ganhe uma estrela|Estrela ganha!|Ganhe {n} estrelas|Tudo desbloqueado!|Jogar contra|Idioma|Neste aparelho|Revezem numa tela|Online|Jogue contra alguém ou convide um amigo|Jogar online|Partida rápida|Contra um jogador aleatório|Jogar com um amigo|Receba um link para compartilhar|Entrar com um código|Procurando adversário…|Nenhum jogador encontrado agora|Continuar procurando|Jogar contra o robô|Seu código de jogo|Envie o link ou o código a um amigo|Copiar convite|Link copiado!|Esperando seu amigo…|Entrar no jogo de um amigo|Digite o código que seu amigo enviou|Entrar|Jogo não encontrado|Conectando…|Vez dele…|Jogar de novo|Jogar com outra pessoa|Esperando {name}…|{name} quer revanche!|{name} saiu do jogo|Sair|Problema de conexão. Tente de novo.|Jogar online|Nenhum jogador encontrado, você joga contra o robô|vs {name}|Você perdeu!|Tempo esgotado! Uma jogada aleatória foi feita.|{name} saiu. De volta ao robô.|Prepare-se!|Novato|Suas partidas rápidas online|Nenhuma partida online ainda|Sair da partida?|Isso conta como derrota.|Continuar jogando|Procurando jogador…|Jogador encontrado!|{name} quer jogar|Jogar agora|Busca parada|{name} não respondeu. Continuamos procurando…|Nenhum jogador encontrado, busca parada|Buscando…|Jogue contra o robô enquanto espera!|Agora não|Mudar modo|Aleatório|Agora|Só suas 3 últimas marcas ficam!|{k} em linha vence!|Compartilhar convite|Jogue jogo da velha comigo!|Local|Mais|Com amigos|Jogue contra o bot enquanto espera|Bot enquanto espera|Seu amigo chegou!|{name} entrou no seu jogo|Seu amigo saiu|Convite enviado!|Compartilhar de novo|Entrando no jogo do seu amigo|Mantenha esta página aberta|O jogo do seu amigo terminou|Seu jogo está pronto!|Convidar de novo|Fechar seu convite?|Seu amigo não poderá mais entrar se você jogar online agora.|Continuar esperando|Jogar online mesmo assim|Esta partida já está cheia|4 letras/números|Insígnias|Modos online|Conquistas|Eventos|Limitada|Suas insígnias|Escolher|Desmarcar|Voltar|Substituir qual?|Insígnias!|Você já ganhou estas|Ver minhas insígnias|Nível máximo!|Bronze|Prata|Ouro|Platina|Diamante|Mestre|Grão-mestre|Lenda|Sequência|Caçador de bots|Amigos|Halloween|Velocidade|Sequência diária|Versátil|{n} vitórias rápidas|melhor: {n} dias seguidos|{n} vitórias em cada modo|Vença rápido uma partida online: menos de 1 s por jogada|Jogue {n} dias seguidos|Vença uma partida online em cada modo|{n} vitórias|melhor {n}|{n} vitórias no Difícil|{n} partidas|Vença uma partida rápida online em {mode}|Vença {n} partidas online seguidas|Vença o bot no Difícil|Jogue uma partida com um amigo|Evento de Halloween 2026|As estatísticas por modo contam a partir desta atualização`,
    th: `คลาสสิก|อินฟินิตี้|4×4|5×5|คนละ 3 ตัว ตัวเก่าสุดจะหายไป!|สู้บอท|2 คน|ง่าย|กลาง|ยาก|คุณ|บอท|ผู้เล่น 1|ผู้เล่น 2|เสมอ|ตาคุณแล้ว!|บอทกำลังคิด…|แตะช่องหนึ่งช่อง!|คุณชนะ!|บอทชนะ!|เสมอ!|สูสีเกินไป! เสมอกัน|{name} ชนะ!|สุดยอด!|ตาเด็ด!|หยุดไม่อยู่!|อัจฉริยะ!|เกือบแล้ว!|รอบต่อไป|โอกาสที่สอง|ย้อนตาสุดท้ายของคุณ|ปิด|ปลดล็อกเลย|ใช้|กำลังใช้|ปลดล็อกสกินใหม่!|วิดีโอทดสอบ|บน Poki จะมีวิดีโอเล่นตรงนี้ ({n})|โหมด|ระดับ|สถิติ|เกมของคุณกับบอท|ชนะ|แพ้|เสมอ|% ชนะ|ชนะติดกันสูงสุด|ชนะติดกัน|สถิติใหม่!|รักษาสถิติไว้ได้|รักษาการชนะติดกัน|แน่ใจไหม?|เริ่มเกมใหม่จะทำให้การชนะติดกันจบลง|เกมใหม่|เล่นต่อ|ชนะติดกัน {n} ครั้ง|รวม|ย้อน|6×6|คำใบ้|เล่นเป็น|จะเปลี่ยนเมื่อเริ่มรอบถัดไป|เปลี่ยนสไตล์|สไตล์|ตัวหมาก|พื้นหลัง|พื้นหลังใหม่!|ถัดไป|อีเวนต์ฮาโลวีน|ถึง 1 พ.ย.|อีเวนต์|ใหม่|เก็บรางวัลอีเวนต์ครบแล้ว!|ปลดล็อกแล้ว!|อีก {n}|รางวัลสองเท่า|เพิ่มเป็นสองเท่า!|รางวัลอีเวนต์ฮาโลวีน|พื้นหลังใหม่|ตัวหมากใหม่|ใช้เลย|รับดาว|ได้ดาวแล้ว!|รับ {n} ดาว|ปลดล็อกครบแล้ว!|เล่นกับ|ภาษา|บนเครื่องนี้|ผลัดกันเล่นบนจอเดียว|ออนไลน์|เล่นกับคนอื่น หรือชวนเพื่อน|เล่นออนไลน์|จับคู่ด่วน|เล่นกับผู้เล่นสุ่ม|เล่นกับเพื่อน|รับลิงก์ไปแชร์|เข้าร่วมด้วยรหัส|กำลังหาคู่แข่ง…|ตอนนี้ยังไม่มีผู้เล่น|หาต่อ|เล่นกับบอท|รหัสเกมของคุณ|ส่งลิงก์หรือรหัสให้เพื่อน|คัดลอกลิงก์เชิญ|คัดลอกลิงก์แล้ว!|กำลังรอเพื่อน…|เข้าร่วมกับเพื่อน|พิมพ์รหัสที่เพื่อนส่งมา|เข้าร่วม|ไม่พบเกม|กำลังเชื่อมต่อ…|ตาของอีกฝ่าย…|เล่นอีกครั้ง|เล่นกับคนอื่น|กำลังรอ {name}…|{name} ขอแข่งอีกรอบ!|{name} ออกจากเกมแล้ว|ออก|การเชื่อมต่อมีปัญหา ลองใหม่อีกครั้ง|เล่นออนไลน์|ไม่พบผู้เล่น เล่นกับบอทแทน|พบกับ {name}|คุณแพ้!|หมดเวลา! ระบบเดินให้แบบสุ่ม|{name} ออกไปแล้ว กลับไปเล่นกับบอท|เตรียมตัว!|ผู้เล่นใหม่|การจับคู่ด่วนออนไลน์ของคุณ|ยังไม่มีเกมออนไลน์|ออกจากแมตช์ไหม?|จะนับว่าแพ้|เล่นต่อ|กำลังหาผู้เล่น…|เจอผู้เล่นแล้ว!|{name} อยากเล่นด้วย|เล่นเลย|หยุดค้นหาแล้ว|{name} ไม่ตอบ กำลังหาต่อ…|ไม่พบผู้เล่น หยุดค้นหาแล้ว|กำลังหา…|เล่นกับบอทระหว่างรอ!|ไว้ทีหลัง|เปลี่ยนโหมด|สุ่ม|ตอนนี้|เหลือแค่ 3 ตัวล่าสุดของคุณ!|เรียง {k} ตัวชนะ!|แชร์คำเชิญ|มาเล่น OX กับฉันสิ!|เครื่องเดียว|เพิ่มเติม|กับเพื่อน|เล่นกับบอทระหว่างรอ|เล่นบอทระหว่างรอ|เพื่อนของคุณมาแล้ว!|{name} เข้าร่วมเกมของคุณ|เพื่อนของคุณออกไปแล้ว|ส่งคำเชิญแล้ว!|แชร์อีกครั้ง|กำลังเข้าเกมของเพื่อน|เปิดหน้านี้ไว้นะ|เกมของเพื่อนจบแล้ว|เกมของคุณพร้อมแล้ว!|ชวนอีกครั้ง|ปิดคำเชิญใช่ไหม?|เพื่อนของคุณจะเข้าร่วมไม่ได้อีก ถ้าคุณเล่นออนไลน์ตอนนี้|รอต่อ|เล่นออนไลน์เลย|เกมนี้เต็มแล้ว|ตัวอักษร/ตัวเลข 4 ตัว|เหรียญตรา|โหมดออนไลน์|ความสำเร็จ|อีเวนต์|จำนวนจำกัด|เหรียญตราของคุณ|เลือก|ยกเลิกเลือก|กลับ|แทนที่อันไหน?|เหรียญตรา!|คุณได้รับสิ่งเหล่านี้แล้ว|ดูเหรียญตราของฉัน|ระดับสูงสุด!|ทองแดง|เงิน|ทอง|แพลทินัม|เพชร|มาสเตอร์|แกรนด์มาสเตอร์|ตำนาน|ชนะติดต่อกัน|นักล่าบอท|เพื่อน|ฮาโลวีน|ความเร็ว|เล่นต่อเนื่องรายวัน|รอบด้าน|ชนะเร็ว {n} ครั้ง|สูงสุด {n} วันติดต่อกัน|ชนะ {n} ครั้งในทุกโหมด|ชนะเกมออนไลน์อย่างรวดเร็ว: ไม่ถึง 1 วินาทีต่อตา|เล่น {n} วันติดต่อกัน|ชนะเกมออนไลน์ในทุกโหมด|ชนะ {n}|ดีที่สุด {n}|ชนะระดับยาก {n}|{n} เกม|ชนะแข่งด่วนออนไลน์ใน {mode}|ชนะออนไลน์ติดต่อกัน {n} ครั้ง|ชนะบอทระดับยาก|เล่นกับเพื่อนหนึ่งเกม|อีเวนต์ฮาโลวีน 2026|สถิติแยกโหมดนับตั้งแต่อัปเดตนี้`,
    tr: `Klasik|Sonsuz|4×4|5×5|Herkese 3 işaret. En eskisi kaybolur!|Bota karşı|2 oyuncu|Kolay|Orta|Zor|Sen|Bot|Oyuncu 1|Oyuncu 2|Berabere|Sıra sende!|Bot düşünüyor…|Bir kareye dokun!|Kazandın!|Bot kazandı!|Berabere!|Çok denk! Berabere.|{name} kazandı!|Harika!|Efsane hamle!|Durdurulamaz!|Dâhice!|Az kaldı!|Sonraki tur|İkinci şans|Son hamleni geri al|Kapat|Şimdi aç|Seç|Seçili|Yeni görünüm!|Test videosu|Poki’de burada video oynar ({n})|Mod|Seviye|İstatistik|Bota karşı oyunların|Galibiyet|Yenilgi|Beraberlik|Kazanma %|En iyi seri|Galibiyet serisi|Yeni rekor!|Seri devam|Serini kurtar|Emin misin?|Yeni oyun başlatmak serini bitirir.|Yeni oyun|Oynamaya devam|Üst üste {n} galibiyet|Toplam|Geri al|6×6|İpucu|Şununla oyna|Bir sonraki turun başında değişir.|Stili değiştir|Stil|Taşlar|Arka planlar|Yeni arka plan!|Sıradaki|Cadılar Bayramı etkinliği|1 Kasım’a kadar|Etkinlik|YENİ|Tüm etkinlik ödülleri toplandı!|Açıldı!|{n} daha|Ödülü ikiye katla|İkiye katlandı!|Cadılar Bayramı ödülü|Yeni arka plan|Yeni taşlar|Hemen kullan|Yıldız kazan|Yıldız eklendi!|{n} yıldız kazan|Her şey açıldı!|Rakip|Dil|Bu cihazda|Tek ekranda sırayla|Çevrimiçi|Biriyle oyna ya da arkadaşını davet et|Çevrimiçi oyna|Hızlı maç|Rastgele bir oyuncuyla|Arkadaşınla oyna|Paylaşmak için bağlantı al|Kodla katıl|Rakip aranıyor…|Şu an oyuncu bulunamadı|Aramaya devam et|Bota karşı oyna|Oyun kodun|Bağlantıyı veya kodu arkadaşına gönder|Daveti kopyala|Bağlantı kopyalandı!|Arkadaşın bekleniyor…|Arkadaşına katıl|Arkadaşının gönderdiği kodu yaz|Katıl|Oyun bulunamadı|Bağlanıyor…|Onun sırası…|Tekrar oyna|Başka biriyle oyna|{name} bekleniyor…|{name} rövanş istiyor!|{name} oyundan ayrıldı|Ayrıl|Bağlantı sorunu. Tekrar dene.|Çevrimiçi oyna|Oyuncu bulunamadı, bota karşı oynuyorsun|vs {name}|Kaybettin!|Süre doldu! Rastgele bir hamle yapıldı.|{name} ayrıldı. Bota dönülüyor.|Hazır ol!|Yeni oyuncu|Hızlı çevrim içi maçların|Henüz çevrim içi maç yok|Maçtan çıkılsın mı?|Bu bir yenilgi sayılır.|Oynamaya devam et|Oyuncu aranıyor…|Oyuncu bulundu!|{name} oynamak istiyor|Şimdi oyna|Arama durduruldu|{name} yanıt vermedi. Aramaya devam…|Oyuncu bulunamadı, arama durduruldu|Aranıyor…|Beklerken botla oyna!|Şimdi değil|Mod değiştir|Rastgele|Şimdi|Sadece son 3 işaretin kalır!|{k} sıra kazanır!|Daveti paylaş|Benimle XOX oyna!|Yerel|Diğer|Arkadaşla|Beklerken botla oyna|Beklerken bot|Arkadaşın geldi!|{name} oyununa katıldı|Arkadaşın ayrıldı|Davet gönderildi!|Tekrar paylaş|Arkadaşının oyununa katılıyorsun|Bu sayfayı açık tut|Arkadaşının oyunu bitti|Oyunun hazır!|Tekrar davet et|Davetin kapatılsın mı?|Şimdi online oynarsan arkadaşın artık katılamaz.|Beklemeye devam et|Yine de online oyna|Bu oyun zaten dolu|4 harf/rakam|Rozetler|Online modlar|Başarılar|Etkinlikler|Sınırlı|Rozetlerin|Seç|Seçimi kaldır|Geri|Hangisi değişsin?|Rozetler!|Bunları zaten kazandın|Rozetlerimi göster|En üst seviye!|Bronz|Gümüş|Altın|Platin|Elmas|Usta|Büyük Usta|Efsane|Galibiyet serisi|Bot avcısı|Arkadaşlar|Cadılar Bayramı|Hız|Günlük seri|Her şeyde usta|{n} hızlı galibiyet|en iyi: art arda {n} gün|her modda {n} galibiyet|Online bir maçı hızlı kazan: hamle başına 1 sn'den az|Art arda {n} gün oyna|Her modda bir online maç kazan|{n} galibiyet|en iyi {n}|Zor’da {n} galibiyet|{n} oyun|{mode} modunda online hızlı maç kazan|Üst üste {n} online maç kazan|Botu Zor’da yen|Bir arkadaşınla oyna|Cadılar Bayramı etkinliği 2026|Mod istatistikleri bu güncellemeden itibaren sayılır`,
    vi: `Cổ điển|Vô tận|4×4|5×5|Mỗi người 3 quân. Quân cũ nhất sẽ biến mất!|Đấu máy|2 người|Dễ|Vừa|Khó|Bạn|Máy|Người 1|Người 2|Hòa|Đến lượt bạn!|Máy đang nghĩ…|Chạm vào một ô!|Bạn thắng!|Máy thắng!|Hòa!|Quá cân sức! Hòa nhé.|{name} thắng!|Tuyệt vời!|Nước đi đỉnh!|Không thể cản!|Thiên tài!|Suýt nữa!|Ván tiếp|Cơ hội thứ hai|Rút lại nước đi cuối|Đóng|Mở khóa ngay|Dùng|Đang dùng|Mở khóa giao diện mới!|Video thử|Video sẽ phát ở đây trên Poki ({n})|Chế độ|Cấp độ|Thống kê|Các ván của bạn với máy|Thắng|Thua|Hòa|% thắng|Chuỗi thắng dài nhất|Chuỗi thắng|Kỷ lục mới!|Giữ được chuỗi|Giữ chuỗi thắng|Bạn chắc chứ?|Bắt đầu ván mới sẽ mất chuỗi thắng của bạn.|Ván mới|Chơi tiếp|Chuỗi {n} trận thắng|Tổng|Đi lại|6×6|Gợi ý|Chơi quân|Sẽ đổi khi bắt đầu ván tiếp.|Đổi phong cách|Phong cách|Quân cờ|Hình nền|Hình nền mới!|Tiếp theo|Sự kiện Halloween|Đến 1/11|Sự kiện|MỚI|Đã nhận hết phần thưởng sự kiện!|Đã mở khóa!|Còn {n}|Thưởng gấp đôi|Đã nhân đôi!|Thưởng sự kiện Halloween|Hình nền mới|Quân cờ mới|Dùng ngay|Nhận 1 sao|Đã thêm sao!|Nhận {n} sao|Đã mở khóa tất cả!|Đối thủ|Ngôn ngữ|Trên máy này|Thay phiên trên một màn hình|Trực tuyến|Đấu với người khác hoặc mời bạn bè|Chơi trực tuyến|Đấu nhanh|Đấu người ngẫu nhiên|Chơi với bạn|Lấy link để chia sẻ|Vào bằng mã|Đang tìm đối thủ…|Hiện chưa có người chơi|Tiếp tục tìm|Đấu với máy|Mã ván của bạn|Gửi link hoặc mã cho bạn bè|Sao chép link mời|Đã sao chép link!|Đang chờ bạn của bạn…|Vào chơi cùng bạn|Nhập mã bạn bè gửi cho bạn|Vào|Không tìm thấy ván|Đang kết nối…|Lượt đối thủ…|Chơi lại|Đấu người khác|Đang chờ {name}…|{name} muốn đấu lại!|{name} đã rời ván|Rời đi|Lỗi kết nối. Hãy thử lại.|Chơi trực tuyến|Không tìm thấy ai, đấu với máy|đấu {name}|Bạn thua!|Hết giờ! Đã đi một nước ngẫu nhiên.|{name} đã rời đi. Quay lại đấu máy.|Chuẩn bị!|Người chơi mới|Các trận ghép nhanh của bạn|Chưa có ván trực tuyến nào|Rời trận?|Sẽ tính là thua.|Chơi tiếp|Đang tìm người chơi…|Đã tìm thấy người chơi!|{name} muốn chơi|Chơi ngay|Đã dừng tìm|{name} không trả lời. Vẫn đang tìm…|Không tìm thấy ai, đã dừng tìm|Đang tìm…|Đấu máy trong lúc chờ nhé!|Để sau|Đổi chế độ|Ngẫu nhiên|Bây giờ|Chỉ 3 quân cuối của bạn được giữ lại!|{k} quân liền hàng là thắng!|Chia sẻ lời mời|Chơi Tic Tac Toe (cờ X-O) với mình nhé!|Chơi chung máy|Thêm|Chơi với bạn|Đấu với máy trong lúc chờ|Đấu máy khi chờ|Bạn của bạn đã đến!|{name} đã vào ván của bạn|Bạn của bạn đã rời đi|Đã gửi lời mời!|Chia sẻ lại|Đang vào trận của bạn bè|Giữ trang này mở nhé|Trận của bạn bè đã kết thúc|Trận của bạn đã sẵn sàng!|Mời lại|Đóng lời mời?|Bạn của bạn sẽ không thể tham gia nếu bạn chơi online bây giờ.|Tiếp tục chờ|Vẫn chơi online|Trận này đã đủ người|4 chữ/số|Huy hiệu|Chế độ online|Thành tích|Sự kiện|Giới hạn|Huy hiệu của bạn|Chọn|Bỏ chọn|Quay lại|Thay cái nào?|Huy hiệu!|Bạn đã đạt được những cái này|Xem huy hiệu của tôi|Cấp cao nhất!|Đồng|Bạc|Vàng|Bạch kim|Kim cương|Cao thủ|Đại cao thủ|Huyền thoại|Chuỗi thắng|Kẻ diệt bot|Bạn bè|Halloween|Tốc độ|Chuỗi ngày|Toàn năng|{n} trận thắng nhanh|kỷ lục {n} ngày liên tiếp|{n} trận thắng ở mọi chế độ|Thắng nhanh một trận online: dưới 1 giây mỗi nước|Chơi {n} ngày liên tiếp|Thắng một trận online ở mọi chế độ|{n} trận thắng|tốt nhất {n}|{n} trận thắng mức Khó|{n} trận|Thắng một trận nhanh online ở {mode}|Thắng {n} trận online liên tiếp|Đánh bại bot mức Khó|Chơi một trận với bạn|Sự kiện Halloween 2026|Thống kê theo chế độ được tính từ bản cập nhật này`,
    zh: `经典|无限|4×4|5×5|每人只有3个棋子，最早的会消失！|对战电脑|双人|简单|中等|困难|你|电脑|玩家1|玩家2|平局|轮到你了！|电脑思考中…|点一个格子！|你赢了！|电脑赢了！|平局！|势均力敌！平局。|{name}赢了！|太棒了！|神之一手！|势不可挡！|天才！|好险！|下一局|再来一次机会|撤回你的上一步|关闭|立即解锁|使用|使用中|解锁新皮肤！|测试视频|在Poki上这里会播放视频（{n}）|模式|难度|统计|你对战电脑的战绩|胜|负|平|胜率|最高连胜|连胜|新纪录！|连胜保住了|保住连胜|确定吗？|开始新游戏会中断你的连胜。|新游戏|继续玩|{n}连胜|总计|悔棋|6×6|提示|执子|下一局开始时切换。|更换风格|风格|棋子|背景|新背景！|下一个|万圣节活动|截至11月1日|活动|新|活动奖励已全部领取！|已解锁！|还差{n}个|双倍奖励|已翻倍！|万圣节活动奖励|新背景|新棋子|立即使用|领取一颗星|获得一颗星！|领取{n}颗星|全部已解锁！|对手|语言|同一设备|在一个屏幕上轮流下|在线|和别人对战，或邀请好友|在线对战|快速匹配|随机匹配一位玩家|和好友玩|获取分享链接|输入代码加入|正在寻找对手…|暂时没有找到玩家|继续寻找|和电脑玩|你的游戏代码|把链接或代码发给好友|复制邀请链接|链接已复制！|正在等待好友…|加入好友|输入好友发给你的代码|加入|找不到游戏|连接中…|对方回合…|再玩一次|换个对手|正在等待{name}…|{name}想再来一局！|{name}离开了游戏|离开|连接出错，请重试。|在线对战|没有找到玩家，改为对战电脑|对战 {name}|你输了！|时间到！已随机落子。|{name}离开了，回到电脑对战。|准备！|新玩家|你的在线快速匹配战绩|还没有在线对局|离开对局？|这会算作输。|继续玩|正在寻找玩家…|找到玩家了！|{name}想和你玩|开始对战|已停止寻找|{name}没有回应，继续寻找…|没有找到玩家，已停止寻找|寻找中…|等待时先和电脑玩吧！|以后再说|切换模式|随机|现在|只保留你最后3个棋子！|{k}子连线获胜！|分享邀请|来和我玩井字棋吧！|本地|更多|好友对战|等待时和机器人玩|等待时玩机器人|你的好友来了！|{name} 加入了你的游戏|你的好友已离开|邀请已发送！|再次分享|正在加入好友的游戏|请保持此页面打开|好友的游戏已结束|你的游戏已准备好！|再次邀请|关闭邀请？|如果你现在在线游玩，你的朋友将无法再加入。|继续等待|仍然在线游玩|这局游戏已满|4 位字母/数字|徽章|在线模式|成就|活动|限定|我的徽章|选择|取消选择|返回|替换哪一个？|徽章！|你已经获得了这些|查看我的徽章|最高等级！|青铜|白银|黄金|铂金|钻石|大师|宗师|传奇|连胜|机器人克星|好友|万圣节|速度|连续天数|全能王|{n} 次快速胜利|最长连续 {n} 天|每个模式 {n} 胜|快速赢下一局在线对战：每步不到 1 秒|连续 {n} 天游玩|在每个模式中赢下一局在线对战|{n} 胜|最佳 {n}|困难模式 {n} 胜|{n} 局|在{mode}中赢得一场在线快速对战|在线连胜 {n} 场|在困难模式击败机器人|和好友玩一局|2026 万圣节活动|按模式统计从本次更新开始`
  },
  m = f.split(`|`),
  h = {};
for (let [e, t] of Object.entries(p)) {
  let n = t.split(`|`);
  h[e] = Object.fromEntries(m.map((e, t) => [e, n[t]]));
}
var g = h.en,
  _ = g,
  v = ``,
  y = () => document.documentElement.lang || `en`,
  ee = () => !!v;
function te(e) {
  v = e;
  try {
    localStorage.setItem(`ttt-neon:lang`, e);
  } catch {}
}
function ne() {
  try {
    v = v || localStorage.getItem(`ttt-neon:lang`) || ``;
  } catch {}
  if (v === `zh-tw` && (v = `zh`), v && h[v]) return v;
  let e = [new URLSearchParams(location.search).get(`lang`) || ``, ...(navigator.languages?.length ? navigator.languages : [navigator.language || `en`])].map(e => e.toLowerCase());
  for (let t of e) {
    if (t.startsWith(`zh`)) return `zh`;
    if (t === `in` || t.startsWith(`in-`)) return `id`;
    let e = t.split(`-`)[0];
    if (h[e]) return e;
  }
  return `en`;
}
function re(e) {
  _ = h[e] ?? g, document.documentElement.lang = e;
}
function b(e, t) {
  let n = _[e] ?? g[e] ?? e;
  return t ? n.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e) : n;
}
var ie = h;
function oe() {
  return new Promise(e => {
    let t = document.createElement(`div`);
    t.id = `rv-test`;
    let n = 2,
      r = () => t.innerHTML = `<div>${d.video}<b>${b(`test.video`)}</b><small>${b(`test.note`, {
        n
      })}</small></div>`;
    r(), document.getElementById(`app`)?.appendChild(t);
    let i = setInterval(() => {
      if (n--, n > 0) return r();
      clearInterval(i), t.remove(), e(!0);
    }, 1e3);
  });
}
function se(e, t) {
  return new Promise((n, r) => {
    let i = setTimeout(() => r(Error(`timeout`)), t);
    e.then(e => (clearTimeout(i), n(e)), e => (clearTimeout(i), r(e)));
  });
}
var S = new class {
    constructor() {
      this.ctx = null, this.master = null, this.noise = null, this.enabled = !0, this.ducked = !1;
    }
    setEnabled(e) {
      this.enabled = e, this.applyGain();
    }
    setDucked(e) {
      this.ducked = e, this.applyGain(), this.ctx && (e ? this.ctx.suspend().catch(() => {}) : this.ctx.resume().catch(() => {}));
    }
    unlock() {
      if (this.ctx) this.ctx.state === `suspended` && !this.ducked && this.ctx.resume().catch(() => {});else try {
        let e = window.AudioContext || window.webkitAudioContext;
        this.ctx = new e(), this.master = this.ctx.createGain(), this.master.connect(this.ctx.destination);
        let t = Math.floor(this.ctx.sampleRate * .6);
        this.noise = this.ctx.createBuffer(1, t, this.ctx.sampleRate);
        let n = this.noise.getChannelData(0);
        for (let e = 0; e < t; e++) n[e] = Math.random() * 2 - 1;
        this.applyGain();
      } catch {
        this.ctx = null;
      }
    }
    applyGain() {
      this.master && (this.master.gain.value = this.enabled && !this.ducked ? .5 : 0);
    }
    get ok() {
      return !!this.ctx && this.enabled && !this.ducked && this.ctx.state === `running`;
    }
    tone(e, t, n, r, i, a) {
      let o = this.ctx,
        s = o.createOscillator(),
        c = o.createGain();
      s.type = i, s.frequency.setValueAtTime(t, e), s.frequency.exponentialRampToValueAtTime(Math.max(20, n), e + r), c.gain.setValueAtTime(1e-4, e), c.gain.exponentialRampToValueAtTime(a, e + .012), c.gain.exponentialRampToValueAtTime(1e-4, e + r), s.connect(c).connect(this.master), s.start(e), s.stop(e + r + .02);
    }
    hiss(e, t, n, r) {
      let i = this.ctx,
        a = i.createBufferSource();
      a.buffer = this.noise;
      let o = i.createBiquadFilter();
      o.type = `bandpass`, o.frequency.setValueAtTime(n, e), o.frequency.exponentialRampToValueAtTime(n * 3, e + t), o.Q.value = 1.2;
      let s = i.createGain();
      s.gain.setValueAtTime(1e-4, e), s.gain.exponentialRampToValueAtTime(r, e + .03), s.gain.exponentialRampToValueAtTime(1e-4, e + t), a.connect(o).connect(s).connect(this.master), a.start(e), a.stop(e + t + .02);
    }
    place(e) {
      if (!this.ok) return;
      let t = this.ctx.currentTime;
      e === 1 ? (this.tone(t, 520, 1040, .11, `square`, .12), this.tone(t + .04, 780, 1560, .08, `triangle`, .1)) : (this.tone(t, 880, 440, .14, `sine`, .22), this.tone(t + .03, 660, 330, .12, `triangle`, .1));
    }
    vanish() {
      this.ok && this.hiss(this.ctx.currentTime, .32, 500, .25);
    }
    count(e = !1) {
      if (!this.ok) return;
      let t = this.ctx.currentTime;
      e ? this.tone(t, 1320, 1760, .22, `square`, .1) : this.tone(t, 660, 660, .12, `triangle`, .14);
    }
    found() {
      if (!this.ok) return;
      let e = this.ctx.currentTime;
      [660, 880, 1320].forEach((t, n) => this.tone(e + n * .1, t, t * 1.02, .16, `triangle`, .16));
    }
    click() {
      this.ok && this.tone(this.ctx.currentTime, 1200, 900, .05, `triangle`, .1);
    }
    win() {
      if (!this.ok) return;
      let e = this.ctx.currentTime;
      [523, 659, 784, 1047, 1319].forEach((t, n) => this.tone(e + n * .09, t, t * 1.01, .22, `square`, .09)), this.tone(e + .45, 1568, 2093, .45, `triangle`, .14), this.hiss(e + .4, .5, 2e3, .12);
    }
    lose() {
      if (!this.ok) return;
      let e = this.ctx.currentTime;
      [392, 330, 262].forEach((t, n) => this.tone(e + n * .16, t, t * .9, .24, `sawtooth`, .06));
    }
    draw() {
      if (!this.ok) return;
      let e = this.ctx.currentTime;
      this.tone(e, 440, 440, .16, `triangle`, .14), this.tone(e + .16, 440, 392, .22, `triangle`, .14);
    }
    unlockFanfare() {
      if (!this.ok) return;
      let e = this.ctx.currentTime;
      [784, 988, 1175, 1568].forEach((t, n) => this.tone(e + n * .07, t, t, .3, `triangle`, .12)), this.hiss(e, .6, 3e3, .1);
    }
  }(),
  ce = `ttt-neon:`;
function le(e, t) {
  try {
    let n = localStorage.getItem(ce + e);
    if (n == null) return t;
    let r = JSON.parse(n);
    return typeof t == `object` && t && !Array.isArray(t) ? {
      ...t,
      ...r
    } : r;
  } catch {
    return t;
  }
}
function ue(e, t) {
  try {
    localStorage.setItem(ce + e, JSON.stringify(t));
  } catch {}
}
var C = (e, t, n, r, i = ``) => `<path class="ln" pathLength="1" d="M${e} ${t}L${n} ${r}" ${i}/>`,
  w = (e, t = ``) => `<path class="ln" pathLength="1" d="M50 ${50 - e}a${e} ${e} 0 1 1 -0.01 0" ${t}/>`,
  de = () => C(22, 22, 78, 78) + C(78, 22, 22, 78),
  fe = () => w(29);
function pe(e) {
  return e.map(([e, t]) => `<rect class="px" x="${14 + e * 12}" y="${14 + t * 12}" width="12" height="12" rx="1.5"/>`).join(``);
}
var me = [];
for (let e = 0; e < 6; e++) me.push([e, e], [5 - e, e]);
var he = [[1, 0], [2, 0], [3, 0], [4, 0], [0, 1], [5, 1], [0, 2], [5, 2], [0, 3], [5, 3], [0, 4], [5, 4], [1, 5], [2, 5], [3, 5], [4, 5]],
  T = [{
    id: `neon`,
    name: `Neon`,
    x: `#ff2bd6`,
    o: `#1ff4ff`,
    stars: 0,
    drawX: de,
    drawO: fe
  }, {
    id: `toxic`,
    name: `Toxic`,
    x: `#9dff1f`,
    o: `#c45cff`,
    stars: 3,
    drawX: () => {
      let e = [[24, 24, 1], [76, 76, -1], [76, 24, 1], [24, 76, -1]].map(([e, t]) => {
        let n = 5.2,
          r = e < 50 == t < 50 ? 1 : -1;
        return `<circle class="bone" cx="${e + n}" cy="${t - n * r}" r="7.5"/><circle class="bone" cx="${e - n}" cy="${t + n * r}" r="7.5"/>`;
      }).join(``);
      return C(27, 27, 73, 73, `style="stroke-width:10"`) + C(73, 27, 27, 73, `style="stroke-width:10"`) + e;
    },
    drawO: () => `<path class="ln" pathLength="1" d="M31 62A25 25 0 1 1 69 62L65 66V77H35V66Z" style="stroke-width:8"/><ellipse class="bone" cx="40" cy="47" rx="7.5" ry="8.5"/><ellipse class="bone" cx="60" cy="47" rx="7.5" ry="8.5"/><path class="bone" d="M50 56l4.5 7h-9z"/><path class="ln thin" pathLength="1" d="M44 69V77M50 69V77M56 69V77" style="stroke-width:3.5;opacity:1"/>`
  }, {
    id: `space`,
    name: `Space`,
    x: `#ffe14d`,
    o: `#5c8bff`,
    stars: 12,
    drawX: () => `<path class="bone" d="M50 50L18 18L50 40L82 18L60 50L82 82L50 60L18 82L40 50Z" style="stroke:var(--c);stroke-width:4;stroke-linejoin:round"/>`,
    drawO: () => w(21) + `<ellipse class="thin" cx="50" cy="50" rx="38" ry="11" transform="rotate(-22 50 50)" style="opacity:1"/>`
  }, {
    id: `glitch`,
    name: `Glitch`,
    x: `#ff2bd6`,
    o: `#1ff4ff`,
    stars: 18,
    drawX: () => `<path d="M22 24L74 76M74 24L22 76" style="stroke:#1ff4ff;opacity:.85"/><path d="M26 24L78 76M78 24L26 76" style="stroke:#ff2bd6;opacity:.85"/>` + C(24, 24, 76, 76, `style="stroke:#fff;stroke-width:5"`) + C(76, 24, 24, 76, `style="stroke:#fff;stroke-width:5"`) + `<rect x="56" y="34" width="22" height="4" style="fill:#fff;stroke:none"/><rect class="bone" x="18" y="62" width="16" height="3"/>`,
    drawO: () => `<circle cx="47" cy="50" r="28" style="stroke:#ff2bd6;opacity:.85"/><circle cx="53" cy="50" r="28" style="stroke:#1ff4ff;opacity:.85"/><path class="ln" pathLength="1" d="M50 22a28 28 0 1 1 -0.01 0" style="stroke:#fff;stroke-width:5"/><rect x="62" y="28" width="20" height="4" style="fill:#fff;stroke:none"/><rect class="bone" x="20" y="66" width="14" height="3"/>`
  }, {
    id: `sunset`,
    name: `Sunset`,
    x: `#ff3d6e`,
    o: `#ffd23a`,
    stars: 33,
    drawX: () => C(24, 24, 76, 76, `stroke-linecap="square"`) + C(76, 24, 24, 76, `stroke-linecap="square"`),
    drawO: () => `<path class="ln" pathLength="1" d="M50 18L82 50L50 82L18 50Z" stroke-linejoin="round"/>`
  }, {
    id: `web`,
    name: `Web`,
    x: `#ff4f9a`,
    o: `#ece8ff`,
    stars: 42,
    event: `halloween`,
    drawX: () => `<path class="ln thin" pathLength="1" d="M44 44L32 32L22 20M56 44L68 32L78 20M44 56L32 68L22 80M56 56L68 68L78 80" style="stroke-width:6;opacity:1"/><path class="thin" d="M44 48L30 44L22 36M56 48L70 44L78 36M44 53L30 58L24 66M56 53L70 58L76 66" style="stroke-width:3.5;opacity:1"/><circle class="bone" cx="50" cy="54" r="10"/><circle class="bone" cx="50" cy="41" r="7"/><circle class="eye" cx="47.5" cy="40" r="1.6"/><circle class="eye" cx="52.5" cy="40" r="1.6"/>`,
    drawO: () => w(30) + `<circle class="thin" cx="50" cy="50" r="20" style="stroke-width:3;opacity:1"/><circle class="thin" cx="50" cy="50" r="10" style="stroke-width:3;opacity:1"/><path class="thin" d="${Array.from({
      length: 8
    }, (e, t) => {
      let n = t / 8 * Math.PI * 2;
      return `M50 50L${(50 + Math.cos(n) * 30).toFixed(1)} ${(50 + Math.sin(n) * 30).toFixed(1)}`;
    }).join(``)}" style="stroke-width:3;opacity:1"/>`
  }, {
    id: `graffiti`,
    name: `Graffiti`,
    x: `#ff3d6e`,
    o: `#9dff1f`,
    stars: 52,
    drawX: () => `<path d="M24 24L76 76M76 24L24 76" style="stroke-width:24;opacity:.18"/>` + C(24, 24, 76, 76) + C(76, 24, 24, 76) + `<path class="thin" d="M34 34v14M62 38v20M30 70v10M70 70v8" style="opacity:1"/><circle class="bone" cx="34" cy="50" r="3"/><circle class="bone" cx="62" cy="60" r="3"/><circle class="bone" cx="30" cy="82" r="2.6"/><circle class="bone" cx="70" cy="80" r="2.6"/>`,
    drawO: () => `<circle cx="50" cy="50" r="27" style="stroke-width:24;opacity:.18"/>` + w(27) + `<path class="thin" d="M30 68v12M58 77v9M74 60v10" style="opacity:1"/><circle class="bone" cx="30" cy="82" r="3"/><circle class="bone" cx="58" cy="88" r="2.6"/><circle class="bone" cx="74" cy="72" r="2.6"/>`
  }, {
    id: `pixel`,
    name: `Pixel`,
    x: `#ff3df0`,
    o: `#3dfcff`,
    stars: 75,
    drawX: () => pe(me),
    drawO: () => pe(he)
  }, {
    id: `love`,
    name: `Love`,
    x: `#ffd1e8`,
    o: `#ff3d7f`,
    stars: 102,
    drawX: () => C(26, 26, 74, 74) + C(74, 26, 26, 74) + `<path class="bone" d="M80 80l-14-3 11-11z" style="stroke:var(--c);stroke-width:3;stroke-linejoin:round"/><path class="bone" d="M20 80l14-3-11-11z" style="stroke:var(--c);stroke-width:3;stroke-linejoin:round"/><path class="thin" d="M22 30l8-8M30 34l8-8M78 30l-8-8M70 34l-8-8" style="opacity:1"/>`,
    drawO: () => `<path class="ln" pathLength="1" d="M50 78C26 62 20 50 20 38c0-10 8-17 17-17 6 0 11 3 13 8 2-5 7-8 13-8 9 0 17 7 17 17 0 12-6 24-30 40z"/>`
  }, {
    id: `batpumpkin`,
    name: `Bat & Pumpkin`,
    x: `#b36bff`,
    o: `#ff8a1f`,
    stars: 117,
    event: `halloween`,
    drawX: () => `<g transform="translate(50 50) scale(1.35) translate(-50 -44)"><path class="bone" d="M50 44C44 34 32 28 14 32c7 6 7 13 3 20 9-3 16-1 20 6 4-6 9-8 13-4 4-4 9-2 13 4 4-7 11-9 20-6-4-7-4-14 3-20-18-4-30 2-36 12z"/><path class="bone" d="M45 42l2-8 3 5 3-5 2 8z"/><circle class="eye" cx="47.5" cy="45" r="1.4"/><circle class="eye" cx="52.5" cy="45" r="1.4"/></g>`,
    drawO: () => `<ellipse class="ln" pathLength="1" cx="50" cy="56" rx="31" ry="25" style="stroke-width:9"/><path class="thin" d="M50 31q-8 13 0 50M50 31q8 13 0 50" style="stroke-width:4;opacity:1"/><path d="M50 31q0-9 7-12" style="stroke-width:7"/><path class="bone" d="M34 50l7-8 7 8zM52 50l7-8 7 8zM36 62q14 10 28 0l-5 6-4-4-5 5-5-5-4 4z"/>`
  }, {
    id: `bolt`,
    name: `Bolt`,
    x: `#fff23a`,
    o: `#a35cff`,
    stars: 134,
    drawX: () => `<path class="ln" pathLength="1" d="M22 22L44 44L38 50L56 62L78 78" stroke-linejoin="round"/><path class="ln" pathLength="1" d="M78 22L56 44L62 50L44 62L22 78" stroke-linejoin="round"/>`,
    drawO: () => w(29, `stroke-dasharray="0.06 0.035"`)
  }, {
    id: `fireice`,
    name: `Fire & Ice`,
    x: `#ff5a1f`,
    o: `#7fdcff`,
    stars: 174,
    drawX: () => de() + `<g class="inner">${C(30, 30, 70, 70)}${C(70, 30, 30, 70)}</g>`,
    drawO: () => w(29) + `<g class="inner">${w(29)}</g><path class="ln thin" pathLength="1" d="M50 30V70M30 50H70M36 36L64 64M64 36L36 64"/>`
  }, {
    id: `galaxy`,
    name: `Galaxy`,
    x: `#d07bff`,
    o: `#5c8bff`,
    stars: 222,
    drawX: () => de() + [[22, 22], [78, 78], [78, 22], [22, 78]].map(([e, t]) => `<path class="spark" d="M${e} ${t - 9}L${e + 2.5} ${t - 2.5}L${e + 9} ${t}L${e + 2.5} ${t + 2.5}L${e} ${t + 9}L${e - 2.5} ${t + 2.5}L${e - 9} ${t}L${e - 2.5} ${t - 2.5}Z"/>`).join(``),
    drawO: () => w(27) + `<g class="orbit"><circle cx="50" cy="12" r="6" class="dot"/></g>`
  }, {
    id: `rainbow`,
    name: `Rainbow`,
    x: `#ff4fd8`,
    o: `#4fffd2`,
    stars: 250,
    drawX: de,
    drawO: fe
  }, {
    id: `gold`,
    name: `Gold`,
    x: `#ffd35a`,
    o: `#e9eef7`,
    stars: 315,
    drawX: () => de() + `<g class="inner">${C(22, 22, 78, 78)}${C(78, 22, 22, 78)}</g>`,
    drawO: () => w(29) + `<g class="inner">${w(29)}</g>`
  }],
  ge = e => T.find(t => t.id === e) ?? T[0],
  _e = [`#ff3d3d`, `#ff8a1f`, `#ffe14d`, `#3dff6b`, `#1ff4ff`, `#3d7dff`, `#b36bff`],
  ve = `#f2f0ff`;
function E(e, t, n = ``, r) {
  let i = r ?? (t === 1 ? e.x : e.o),
    a = t === 1 ? e.drawX() : e.drawO();
  return `<svg class="mk mk-${t === 1 ? `x` : `o`} sk-${e.id} ${n}" viewBox="-25 -25 150 150" style="--c:${i}" aria-hidden="true"><g class="mkg"><g class="glw"><rect x="-25" y="-25" width="150" height="150" style="fill:#000;fill-opacity:0;stroke:none"/>${a}</g></g></svg>`;
}
var ye = e => e === `easy` ? 1 : e === `medium` ? 2 : 3;
function be(e) {
  return e.vsBot && e.outcome === `win` ? ye(e.level) : 0;
}
var xe = [{
    id: `bg-synthwave`,
    name: `Synthwave`,
    stars: 0
  }, {
    id: `bg-city`,
    name: `Neon City`,
    stars: 7
  }, {
    id: `bg-palms`,
    name: `Palm Beach`,
    stars: 25
  }, {
    id: `bg-spooky`,
    name: `Spooky`,
    stars: 63,
    event: `halloween`
  }, {
    id: `bg-ocean`,
    name: `Deep Sea`,
    stars: 88
  }, {
    id: `bg-halloween`,
    name: `Halloween`,
    stars: 153,
    event: `halloween`
  }, {
    id: `bg-pyramids`,
    name: `Pyramids`,
    stars: 197
  }, {
    id: `bg-cosmos`,
    name: `Cosmos`,
    stars: 281
  }],
  Se = `bg-synthwave`,
  D = e => e.startsWith(`bg-`),
  Ce = [...T.map(e => ({
    kind: `skin`,
    id: e.id,
    name: e.name,
    stars: e.stars
  })), ...xe.map(e => ({
    kind: `bg`,
    id: e.id,
    name: e.name,
    stars: e.stars
  }))].filter(e => e.stars > 0).sort((e, t) => e.stars - t.stars);
function we(e) {
  return Ce.find(t => !e.includes(t.id)) ?? null;
}
function Te(e) {
  return [...T.map(e => ({
    id: e.id,
    stars: e.stars
  })), ...xe].filter(t => t.stars <= e).map(e => e.id);
}
var O = {
  id: `halloween`,
  ends: new Date(2026, 10, 2, 0, 0, 0),
  rewards: [{
    id: `bg-spooky`,
    pumpkins: 3
  }, {
    id: `web`,
    pumpkins: 7
  }, {
    id: `bg-halloween`,
    pumpkins: 12
  }, {
    id: `batpumpkin`,
    pumpkins: 18
  }]
};
function Ee(e = new Date()) {
  return e < O.ends;
}
function De(e) {
  return O.rewards.filter(t => t.pumpkins <= e).map(e => e.id);
}
var k = le(`profile`, {
  v: 1,
  stars: 0,
  owned: [`neon`],
  skin: `neon`,
  sound: !0,
  mode: `classic`,
  vsBot: !0,
  level: `easy`,
  stats: {},
  played: 0,
  wins: 0,
  seenInfinity: !1,
  firstMoveDone: !1,
  seenSkins: [`neon`, `bg-synthwave`],
  playAs: 1,
  bg: `bg-synthwave`,
  pumpkins: 0,
  pumpkinVideoDay: ``,
  seenEvent: !1,
  onlineWins: 0,
  online: {
    w: 0,
    l: 0,
    d: 0,
    cur: 0,
    best: 0
  },
  nudgeAt: 4,
  nudgeKind: `online`,
  bw: {},
  fg: 0,
  pins: null,
  bseen: {},
  bintro: !1,
  ostats: {},
  ds: {
    last: ``,
    cur: 0,
    best: 0
  },
  fw: 0
});
Array.isArray(k.owned) || (k.owned = [`neon`]), k.playAs !== 1 && k.playAs !== 2 && (k.playAs = 1), (!k.stats || typeof k.stats != `object`) && (k.stats = {}), typeof k.mode == `string` && k.mode === `vanish` && (k.mode = `infinity`), Array.isArray(k.seenSkins) || (k.seenSkins = [`neon`]), typeof k.pumpkins != `number` && (k.pumpkins = 0), typeof k.pumpkinVideoDay != `string` && (k.pumpkinVideoDay = ``), typeof k.seenEvent != `boolean` && (k.seenEvent = !1), (typeof k.onlineWins != `number` || k.onlineWins < 0) && (k.onlineWins = 0), (!k.online || typeof k.online.w != `number`) && (k.online = {
  w: 0,
  l: 0,
  d: 0,
  cur: 0,
  best: 0
}), k.online.w < k.onlineWins && (k.online.w = k.onlineWins), typeof k.nudgeAt != `number` && (k.nudgeAt = 4), k.nudgeKind !== `online` && k.nudgeKind !== `mode` && (k.nudgeKind = `online`), (!k.bw || typeof k.bw != `object`) && (k.bw = {}), !k.bintro && !Object.keys(k.bw).length && k.onlineWins > 0 && (k.bw = {
  classic: k.onlineWins
}), (typeof k.fg != `number` || k.fg < 0) && (k.fg = 0), k.pins !== null && !Array.isArray(k.pins) && (k.pins = null), (!k.bseen || typeof k.bseen != `object`) && (k.bseen = {}), typeof k.bintro != `boolean` && (k.bintro = !1), (!k.ostats || typeof k.ostats != `object`) && (k.ostats = {}), !Object.keys(k.ostats).length && k.online.w + k.online.l + k.online.d > 0 && (k.ostats = {
  classic: {
    ...k.online
  }
}), (!k.ds || typeof k.ds.cur != `number` || typeof k.ds.best != `number` || typeof k.ds.last != `string`) && (k.ds = {
  last: ``,
  cur: 0,
  best: 0
}), (typeof k.fw != `number` || k.fw < 0) && (k.fw = 0), k.owned.includes(`bg-synthwave`) || k.owned.push(Se), k.seenSkins.includes(`bg-synthwave`) || k.seenSkins.push(Se), xe.some(e => e.id === k.bg) || (k.bg = Se);
for (let e of Te(k.stars)) k.owned.includes(e) || k.owned.push(e);
function A() {
  ue(`profile`, k);
}
function Oe(e) {
  if (e <= 0) return [];
  k.stars += e;
  let t = Te(k.stars).filter(e => !k.owned.includes(e));
  return k.owned.push(...t), A(), t;
}
var ke = (e, t) => `${e}-${t}`;
function Ae(e, t) {
  var n;
  let r = ke(e, t);
  return (n = k.stats)[r] ?? (n[r] = {
    w: 0,
    l: 0,
    d: 0,
    cur: 0,
    best: 0
  });
}
function je(e) {
  if (e <= 0 || !Ee()) return [];
  k.pumpkins += e;
  let t = De(k.pumpkins).filter(e => !k.owned.includes(e));
  return k.owned.push(...t), A(), t;
}
var Me = () => {
    let e = new Date();
    return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}`;
  },
  Ne = () => window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches,
  Pe = new class {
    constructor() {
      this.layer = null, this.ps = [], this.raf = 0, this.last = 0, this.pending = [];
    }
    attach(e) {
      this.host = e.parentElement, e.remove(), document.addEventListener(`visibilitychange`, () => {
        document.hidden && this.dispose();
      });
    }
    ensure() {
      if (this.layer) return !0;
      let e = document.createElement(`div`);
      return e.id = `fx`, e.setAttribute(`aria-hidden`, `true`), this.host.appendChild(e), this.layer = e, !0;
    }
    dispose() {
      this.raf && cancelAnimationFrame(this.raf), this.raf = 0, this.ps = [], this.layer?.remove(), this.layer = null;
    }
    resize() {}
    origin() {
      return this.host.getBoundingClientRect();
    }
    sparks(e, t, n, r = 14) {
      Ne() && (r = Math.min(r, 4));
      let i = this.origin();
      for (let a = 0; a < r; a++) {
        let r = Math.random() * Math.PI * 2,
          a = 90 + Math.random() * 220;
        this.add({
          x: e - i.left,
          y: t - i.top,
          vx: Math.cos(r) * a,
          vy: Math.sin(r) * a,
          life: 0,
          max: .35 + Math.random() * .3,
          size: 2 + Math.random() * 2.5,
          color: n,
          kind: 0,
          rot: 0,
          vr: 0
        });
      }
      this.run();
    }
    confetti(e) {
      let t = this.origin(),
        n = Ne() ? 30 : 120;
      for (let r = 0; r < n; r++) {
        let n = r % 3,
          i,
          a,
          o,
          s;
        n === 0 ? (i = Math.random() * t.width, a = -20 - Math.random() * 120, o = (Math.random() - .5) * 80, s = 80 + Math.random() * 160) : (i = n === 1 ? -10 : t.width + 10, a = t.height * (.55 + Math.random() * .25), o = (n === 1 ? 1 : -1) * (250 + Math.random() * 350), s = -(450 + Math.random() * 400)), this.add({
          x: i,
          y: a,
          vx: o,
          vy: s,
          life: 0,
          max: 2.2 + Math.random() * 1.4,
          size: 6 + Math.random() * 6,
          color: e[r % e.length],
          kind: 1,
          rot: Math.random() * 6,
          vr: (Math.random() - .5) * 14
        });
      }
      this.run();
    }
    add(e) {
      this.pending.push(e);
    }
    run() {
      if (document.hidden || !this.ensure()) {
        this.pending = [];
        return;
      }
      for (let e of this.pending) {
        let t = document.createElement(`i`);
        t.className = e.kind === 0 ? `fxs` : `fxc`, t.style.background = e.color, e.kind === 0 ? (t.style.width = t.style.height = `${e.size * 2}px`, t.style.boxShadow = `0 0 ${e.size * 2}px ${e.color}`) : (t.style.width = `${e.size}px`, t.style.height = `${e.size * .6}px`), this.layer.appendChild(t), this.ps.push({
          ...e,
          el: t
        });
      }
      if (this.pending = [], this.raf) return;
      this.last = performance.now();
      let e = t => {
        let n = Math.min(.05, (t - this.last) / 1e3);
        this.last = t, this.tick(n), this.ps.length ? this.raf = requestAnimationFrame(e) : this.dispose();
      };
      this.raf = requestAnimationFrame(e);
    }
    tick(e) {
      let t = [];
      for (let n of this.ps) {
        if (n.life += e, n.life >= n.max) {
          n.el.remove();
          continue;
        }
        n.kind === 0 ? (n.vx *= .9, n.vy *= .9) : (n.vy += 700 * e, n.vx *= .99, n.vy = Math.min(n.vy, 260), n.rot += n.vr * e), n.x += n.vx * e, n.y += n.vy * e;
        let r = 1 - n.life / n.max;
        n.el.style.opacity = String(n.kind === 0 ? r : Math.min(1, r * 3)), n.el.style.transform = n.kind === 0 ? `translate(${n.x}px, ${n.y}px) translate(-50%, -50%) scale(${.5 + r * .5})` : `translate(${n.x}px, ${n.y}px) translate(-50%, -50%) rotate(${n.rot}rad) scaleY(${1 + Math.abs(Math.sin(n.rot)) * .7})`, t.push(n);
      }
      this.ps = t;
    }
  }();
function Fe() {
  let e = window.visualViewport,
    t = document.documentElement;
  return {
    w: Math.min(window.innerWidth || 9999, t.clientWidth || 9999, e ? Math.round(e.width * e.scale) : 9999),
    h: Math.min(window.innerHeight || 9999, t.clientHeight || 9999, e ? Math.round(e.height * e.scale) : 9999)
  };
}
function Ie() {
  let {
      w: e,
      h: t
    } = Fe(),
    n = document.getElementById(`app`);
  n.style.setProperty(`--vw`, `${e}px`), n.style.setProperty(`--vh`, `${t}px`);
  let r = e > t * 1.15,
    i = document.body.classList;
  i.toggle(`land`, r), i.toggle(`touch`, matchMedia(`(pointer: coarse)`).matches), i.toggle(`short`, !r && t < 700), i.toggle(`narrow`, e < 360), i.toggle(`lowland`, r && t < 460), i.toggle(`xlow`, r && t < 330), i.toggle(`big`, r ? t >= 860 && e >= 1300 : e >= 600 && t >= 900), ze(), Re(r && t < 460, t), He(), Pe.resize(), Le.forEach(e => e());
}
var Le = [];
function Re(e, t) {
  let n = document.body.classList,
    r = document.querySelector(`.ctrl`),
    i = document.getElementById(`app`);
  n.remove(`mcol`);
  for (let e of [`--mch`, `--lt`, `--lb`, `--ls`]) i.style.removeProperty(e);
  if (r && (r.style.paddingBottom = r.style.justifyContent = ``), i.style.removeProperty(`--ict`), !e || !r) return;
  n.add(`mcol`);
  let a = document.getElementById(`board`).getBoundingClientRect(),
    o = () => document.getElementById(`bStats`).getBoundingClientRect();
  a.top > o().top && i.style.setProperty(`--ict`, `${Math.round(a.top)}px`), r.style.justifyContent = `flex-end`, r.style.paddingBottom = `${Math.max(0, r.getBoundingClientRect().bottom - a.bottom)}px`;
  let s = () => [`modes`, `opp`, `levels`].map(e => document.getElementById(e)).filter(e => !!e && e.offsetParent !== null),
    c = () => Math.max(...s().map(e => e.getBoundingClientRect().bottom)),
    l = () => document.getElementById(`modes`).getBoundingClientRect().top,
    u = () => c() <= Math.min(a.bottom, t - 6) + .5 && l() >= o().bottom + 8;
  if (!u()) {
    n.remove(`mcol`), r.style.paddingBottom = r.style.justifyContent = ``, i.style.removeProperty(`--ict`);
    return;
  }
  for (let e = 32; e < 50; e++) if (i.style.setProperty(`--mch`, `${e + 1}px`), !u()) {
    i.style.setProperty(`--mch`, `${e}px`);
    break;
  }
  let d = i.getBoundingClientRect(),
    f = getComputedStyle(i);
  i.style.setProperty(`--lt`, `${Math.max(0, Math.round(a.top - d.top - parseFloat(f.paddingTop)))}px`), i.style.setProperty(`--lb`, `${Math.max(0, Math.round(d.bottom - parseFloat(f.paddingBottom) - a.bottom))}px`);
  let p = e => document.querySelector(e).getBoundingClientRect(),
    m = () => {
      let e = p(`header.top`),
        t = p(`.score`),
        n = p(`.status`);
      return e.top >= a.top - 1 && n.bottom <= a.bottom + 1 && e.bottom + 10 <= t.top && t.bottom + 10 <= n.top;
    };
  for (let e = 1; e < 1.4; e += .05) if (i.style.setProperty(`--ls`, (e + .05).toFixed(2)), !m()) {
    i.style.setProperty(`--ls`, e.toFixed(2));
    break;
  }
}
function ze() {
  let e = document.getElementById(`app`);
  document.getElementById(`stage`);
  let {
      w: t,
      h: n
    } = Fe(),
    r;
  if (document.body.classList.contains(`land`)) {
    let i = getComputedStyle(e),
      a = parseFloat(i.paddingTop) + parseFloat(i.paddingBottom),
      o = parseFloat(i.paddingLeft) + parseFloat(i.paddingRight),
      s = document.body.classList.contains(`lowland`),
      c = n - a - 4,
      l = s ? 1 : Math.max(1, Math.min(2.4, n / 600, (t - o - 40 - Math.min(c, 1400)) / 400));
    e.style.setProperty(`--ui`, l.toFixed(3));
    let u = s ? 12 : 20,
      d = e => {
        let r = s ? t < 700 ? 140 : 160 : Math.round(200 * e);
        return Math.min(n - a - 4, t - o - 2 * r - 2 * u, 1400);
      };
    if (r = d(l), !s) {
      let t = [`.top`, `.score`, `.status`].map(e => document.querySelector(e)),
        i = parseFloat(getComputedStyle(e).rowGap) || 0,
        o = () => t.reduce((e, t) => {
          let n = getComputedStyle(t);
          return e + t.getBoundingClientRect().height + (parseFloat(n.marginTop) + parseFloat(n.marginBottom)) * l;
        }, 0) + 2 * i + 10 * l,
        s = () => n - a - 4 > r + 24 ? r : n - a,
        c = t => {
          l = t, e.style.setProperty(`--ui`, l.toFixed(3)), r = d(l);
        },
        u = l,
        f = t => e.style.setProperty(`--tg`, t.toFixed(3));
      e.style.setProperty(`--fx`, `0`), f(0), c(u);
      let p = o(),
        m = 40 * l;
      if (p > s()) {
        m = 4, f(1);
        let e = o();
        if (e <= s()) f((p - s()) / Math.max(1, p - e));else for (let e = 0; e < 4; e++) {
          let e = o();
          if (e <= s() + .5) break;
          c(Math.max(.6, l * s() / e));
        }
      }
      {
        let t = s(),
          n = o();
        if (n + m < t) {
          e.style.setProperty(`--fx`, `1`);
          let r = o();
          e.style.setProperty(`--fx`, Math.max(0, Math.min(1, (t - m - n) / Math.max(1, r - n))).toFixed(3));
        }
      }
    }
  } else {
    let i = document.body.classList,
      a = getComputedStyle(e),
      o = parseFloat(a.paddingTop) + parseFloat(a.paddingBottom),
      s = parseFloat(a.paddingLeft) + parseFloat(a.paddingRight),
      c = [`.top`, `.score`, `.status`, `.ctrl`].map(e => document.querySelector(e)),
      l = () => {
        let e = c.reduce((e, t) => e + t.getBoundingClientRect().height, 0),
          r = n - o - e - 24 - 4;
        return {
          avail: r,
          board: Math.min(t - s - 4, r)
        };
      };
    i.remove(`roomy`);
    let u = l();
    if (u.avail - u.board > 110 && t >= 380 && !i.contains(`big`) && (i.add(`roomy`), u = l(), u.avail - u.board < 20 && (i.remove(`roomy`), u = l())), e.style.setProperty(`--gx`, `0`), u = l(), i.contains(`big`)) {
      let r = 1.35;
      e.style.setProperty(`--bz`, String(r));
      for (let i = 1.4; i <= 1.81 && (e.style.setProperty(`--bz`, i.toFixed(2)), !(l().board < n * .6 || (t - s) / i < 400)); i += .05) r = i;
      e.style.setProperty(`--bz`, r.toFixed(2)), u = l();
    }
    let d = u.avail - u.board;
    if (d > 48) {
      e.style.setProperty(`--gx`, `1`);
      let t = l(),
        n = Math.max(0, Math.min(1.6, (d - 40) / Math.max(1, d - (t.avail - t.board))));
      e.style.setProperty(`--gx`, n.toFixed(3)), u = l();
    }
    r = u.board;
    let f = Math.max(0, u.avail - Math.min(u.board, 760));
    e.style.setProperty(`--pg`, `${Math.round(Math.min(22, 6 + f / 6))}px`);
  }
  r = Math.max(150, Math.min(Math.floor(r), document.body.classList.contains(`land`) ? 1400 : 760)), e.style.setProperty(`--bs`, `${r}px`), e.style.setProperty(`--padY`, `${Math.max(10, Math.floor((n - r) / 2))}px`);
}
function Be() {
  let e = 0,
    t = () => {
      clearTimeout(e), e = window.setTimeout(Ie, 60);
    };
  window.addEventListener(`resize`, t), window.visualViewport?.addEventListener(`resize`, t), window.addEventListener(`orientationchange`, () => setTimeout(Ie, 250));
}
function Ve() {
  let e = performance.now();
  return new Promise(t => {
    let n = () => {
      let {
        w: r,
        h: i
      } = Fe();
      r >= 120 && i >= 120 || performance.now() - e > 3e3 ? t() : requestAnimationFrame(n);
    };
    n();
  });
}
function He() {
  let e = e => [...document.querySelectorAll(e)],
    t = [...e(`.pl .pn`).map(e => [e, e, 13]), ...e(`.modes .chip:not(.more) > span`).map(e => [e, e.parentElement, 10]), ...e(`.seg button > span`).map(e => [e, e.parentElement, 11]), ...e(`.status .undo > span`).map(e => [e, e.parentElement, 11]), ...e(`#status, #sub`).map(e => [e, e, 11])],
    n = document.getElementById(`status`);
  n && (n.classList.remove(`wrap2`), n.parentElement.style.minHeight = ``), t.forEach(([e, t]) => {
    e.style.fontSize = ``, t.classList.remove(`noic`);
  }), n && n.classList.contains(`two`) && n.textContent && n.scrollWidth > n.clientWidth + 1 && (n.parentElement.style.minHeight = `${n.offsetHeight}px`, n.classList.add(`wrap2`));
  let r = document.querySelector(`.lg-t`),
    i = document.querySelector(`.top-r`);
  if (r && i && !document.body.classList.contains(`land`)) {
    r.style.fontSize = ``;
    let e = parseFloat(getComputedStyle(r).fontSize),
      t = () => r.getBoundingClientRect().right <= i.getBoundingClientRect().left - 6;
    for (; !t() && e > 12;) r.style.fontSize = `${--e}px`;
    let n = document.body.classList.contains(`big`) ? 30 : 26;
    for (; t() && e < n;) r.style.fontSize = `${++e}px`;
    t() || (r.style.fontSize = `${--e}px`);
  }
  for (let [e, n, r] of t) {
    if (!e.textContent || e.offsetParent === null || e.classList.contains(`wrap2`)) continue;
    let t = parseFloat(getComputedStyle(e).fontSize),
      i = () => {
        if (n === e) return e.scrollWidth <= e.clientWidth;
        let t = getComputedStyle(n),
          r = n.getBoundingClientRect(),
          i = e.getBoundingClientRect(),
          a = r.width / Math.max(1, n.offsetWidth);
        return i.left >= r.left + parseFloat(t.paddingLeft) * a - 1 && i.right <= r.right - parseFloat(t.paddingRight) * a + 1;
      };
    for (; !i() && t > r;) --t, e.style.fontSize = `${t}px`;
    if (!i() && n !== e && n.querySelector(`.ic`) && !n.classList.contains(`more`)) {
      n.classList.add(`noic`);
      for (let t = parseFloat(getComputedStyle(e).fontSize); !i() && t > 9; t--) e.style.fontSize = `${t - 1}px`;
    }
  }
  for (let t of e(`.modes .chip.more`)) {
    t.classList.remove(`nolab`, `nochev`);
    let n = t.querySelector(`span`),
      r = t.querySelector(`.ic`);
    if (!n || !r || t.offsetParent === null) continue;
    n.style.fontSize = ``;
    let i = t.getBoundingClientRect().width / Math.max(1, t.offsetWidth),
      a = getComputedStyle(t),
      o = t.clientWidth - parseFloat(a.paddingLeft) - parseFloat(a.paddingRight),
      s = () => n.scrollWidth + (t.classList.contains(`nochev`) ? 0 : r.getBoundingClientRect().width / i + 4) <= o,
      c = e(`.modes .chip:not(.more) > span`)[0],
      l = parseFloat(c ? getComputedStyle(c).fontSize : getComputedStyle(n).fontSize),
      u = Math.max(12, Math.floor(l * .85)),
      d = Math.min(parseFloat(getComputedStyle(n).fontSize), l);
    for (n.style.fontSize = `${d}px`; !s() && d > u;) n.style.fontSize = `${--d}px`;
    if (!s()) {
      if (t.classList.contains(`sel`)) for (t.classList.add(`nochev`); !s() && d > 10;) n.style.fontSize = `${--d}px`;else t.classList.add(`nolab`);
    }
  }
  Ue();
}
function Ue() {
  if (document.body.classList.contains(`land`)) return;
  let e = document.getElementById(`status`),
    t = document.getElementById(`bHint`),
    n = document.getElementById(`bUndo`);
  if (!e || !t || !n || !e.textContent || e.offsetParent === null) return;
  let r = () => {
      let r = e.parentElement.getBoundingClientRect(),
        i = t.getBoundingClientRect(),
        a = n.getBoundingClientRect();
      return (t.offsetParent === null || r.left >= i.right + 4) && (n.offsetParent === null || r.right <= a.left - 4);
    },
    i = parseFloat(getComputedStyle(e).fontSize);
  for (; !r() && i > 13;) e.style.fontSize = `${--i}px`;
}
var We = 0;
function Ge() {
  cancelAnimationFrame(We), We = requestAnimationFrame(He);
}
var j = e => e === 1 ? 2 : 1,
  Ke = {
    classic: {
      id: `classic`,
      size: 3,
      k: 3
    },
    infinity: {
      id: `infinity`,
      size: 3,
      k: 3,
      keep: 3,
      maxMoves: 40
    },
    four: {
      id: `four`,
      size: 4,
      k: 4
    },
    five: {
      id: `five`,
      size: 5,
      k: 4
    },
    six: {
      id: `six`,
      size: 6,
      k: 4
    }
  },
  M = [`classic`, `infinity`, `four`, `five`, `six`],
  qe = new Map();
function Je(e, t) {
  let n = `${e}:${t}`,
    r = qe.get(n);
  if (r) return r;
  let i = [],
    a = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let n = 0; n < e; n++) for (let r = 0; r < e; r++) for (let [o, s] of a) {
    let a = n + o * (t - 1),
      c = r + s * (t - 1);
    if (a < 0 || a >= e || c < 0 || c >= e) continue;
    let l = [];
    for (let i = 0; i < t; i++) l.push((n + o * i) * e + (r + s * i));
    i.push(l);
  }
  return qe.set(n, i), i;
}
var Ye = new Map();
function Xe(e, t) {
  let n = `${e}:${t}`,
    r = Ye.get(n);
  if (r) return r;
  let i = Array.from({
    length: e * e
  }, () => []);
  for (let n of Je(e, t)) for (let e of n) i[e].push(n);
  return Ye.set(n, i), i;
}
function Ze(e, t = 1) {
  return {
    mode: e,
    cells: Array(e.size * e.size).fill(0),
    queue: [[], [], []],
    turn: t,
    moves: 0,
    result: 0,
    line: null,
    vanished: -1,
    last: -1
  };
}
function Qe(e) {
  if (e.result) return [];
  let t = [];
  for (let n = 0; n < e.cells.length; n++) e.cells[n] === 0 && t.push(n);
  return t;
}
function $e(e, t) {
  let n = e.mode.keep;
  if (!n) return -1;
  let r = e.queue[t];
  return r.length >= n ? r[0] : -1;
}
function N(e, t) {
  if (e.result || e.cells[t] !== 0) throw Error(`illegal move ${t}`);
  let n = e.turn,
    r = e.cells.slice(),
    i = [e.queue[0], e.queue[1].slice(), e.queue[2].slice()];
  r[t] = n, i[n].push(t);
  let a = -1;
  e.mode.keep && i[n].length > e.mode.keep && (a = i[n].shift(), r[a] = 0);
  let o = e.moves + 1,
    s = 0,
    c = null;
  for (let i of Xe(e.mode.size, e.mode.k)[t]) if (i.every(e => r[e] === n)) {
    s = n, c = i;
    break;
  }
  return s || (!e.mode.keep && o >= r.length || e.mode.maxMoves && o >= e.mode.maxMoves) && (s = 3), {
    mode: e.mode,
    cells: r,
    queue: i,
    turn: j(n),
    moves: o,
    result: s,
    line: c,
    vanished: a,
    last: t
  };
}
function et(e, t) {
  if (e.result) return [];
  let n = e.turn === t ? e : {
      ...e,
      turn: t
    },
    r = [];
  for (let e of Qe(n)) N(n, e).result === t && r.push(e);
  return r;
}
var tt = [`easy`, `medium`, `hard`],
  P = (e, t) => e[Math.floor(t() * e.length)],
  nt = {
    easy: {
      takeWin: .7,
      block: .25,
      smart: 0
    },
    medium: {
      takeWin: .75,
      block: .75,
      smart: .1
    },
    hard: {
      takeWin: 1,
      block: .9,
      smart: .6
    }
  },
  rt = {
    easy: {
      takeWin: .85,
      block: .45,
      smart: .1
    },
    medium: {
      takeWin: .87,
      block: .56,
      smart: .14
    },
    hard: {
      takeWin: 1,
      block: .7,
      smart: .25
    }
  };
function it(e, t, n = Math.random, r = !1) {
  let i = Qe(e);
  if (i.length === 0) return -1;
  if (i.length === 1) return i[0];
  if (r) return bt(e, i, n);
  let a = e.turn,
    o = et(e, a),
    s = et(e, j(a));
  if (e.mode.size === 3) {
    let r = (e.mode.keep ? rt : nt)[t];
    return o.length && n() < r.takeWin ? P(o, n) : s.length && n() < r.block ? P(s, n) : n() < r.smart ? ft(e, e.mode.keep ? 7 : 9, n) : P(t === `easy` ? ot(e, i, n) : i, n);
  }
  if (t === `easy`) return o.length && n() < .6 ? P(o, n) : s.length && n() < .35 ? P(s, n) : P(ot(e, i, n), n);
  let c = at[e.mode.size]?.[t];
  return c ? o.length && n() < c.takeWin ? P(o, n) : s.length && n() < c.block ? P(s, n) : n() < c.loose ? P(ot(e, i, n), n) : st(e, c.search, n) : o.length ? P(o, n) : st(e, t, n);
}
var at = {
  4: {
    medium: {
      takeWin: 1,
      block: .4,
      loose: .8,
      search: `medium`
    },
    hard: {
      takeWin: 1,
      block: .8,
      loose: .4,
      search: `hard`
    }
  },
  5: {
    medium: {
      takeWin: 1,
      block: .4,
      loose: .9,
      search: `medium`
    },
    hard: {
      takeWin: 1,
      block: .8,
      loose: .35,
      search: `hard`
    }
  },
  6: {
    medium: {
      takeWin: 1,
      block: .6,
      loose: .7,
      search: `medium`
    },
    hard: {
      takeWin: 1,
      block: 1,
      loose: 0,
      search: `hard`
    }
  }
};
function ot(e, t, n) {
  let r = e.mode.size,
    i = (r - 1) / 2,
    a = t.filter(e => Math.abs(e / r | 0) - i <= 1 && Math.abs(e % r - i) <= 1);
  return a.length && n() < .5 ? a : t;
}
function st(e, t, n) {
  return e.mode.size === 3 ? ft(e, t === `hard` ? e.mode.keep ? 7 : 9 : e.mode.keep ? 4 : 3, n) : yt(e, t, n);
}
var ct = 1e3;
function lt(e, t) {
  return e.mode.keep ? `${e.queue[1].join(``)}|${e.queue[2].join(``)}|${e.turn}|${t}` : `${e.cells.join(``)}|${t}`;
}
function ut(e, t, n, r) {
  if (e.result === 3) return 0;
  if (e.result) return -(ct - r);
  if (t === 0) return 0;
  let i = lt(e, t),
    a = n.get(i);
  if (a !== void 0) return a > 0 ? a - r : a < 0 ? a + r : 0;
  let o = -1 / 0;
  for (let i of Qe(e)) {
    let a = -ut(N(e, i), t - 1, n, r + 1);
    if (a > o && (o = a), o >= ct - r - 1) break;
  }
  return n.set(i, o > 0 ? o + r : o < 0 ? o - r : 0), o;
}
function dt(e, t) {
  let n = new Map(),
    r = new Map();
  for (let i of Qe(e)) r.set(i, 0 - ut(N(e, i), t - 1, n, 1) || 0);
  return r;
}
function ft(e, t, n) {
  let r = dt(e, t),
    i = -1 / 0;
  for (let e of r.values()) i = Math.max(i, e);
  return P([...r].filter(([, e]) => e === i).map(([e]) => e), n);
}
var pt = [0, 1, 6, 40, 400, 5e3];
function mt(e, t, n, r) {
  let i = 0,
    a = j(r);
  for (let o of Je(t, n)) {
    let t = 0,
      n = 0;
    for (let i of o) {
      let o = e[i];
      o === r ? t++ : o === a && n++;
    }
    t && !n ? i += pt[t] : n && !t && (i -= pt[n] * 1.2);
  }
  return i;
}
function ht(e) {
  let t = e.mode.size,
    n = Qe(e);
  if (e.moves === 0) return n;
  let r = n.filter(n => {
    let r = n / t | 0,
      i = n % t;
    for (let n = -1; n <= 1; n++) for (let a = -1; a <= 1; a++) {
      let o = r + n,
        s = i + a;
      if (o >= 0 && o < t && s >= 0 && s < t && e.cells[o * t + s]) return !0;
    }
    return !1;
  });
  return r.length ? r : n;
}
var gt = class extends Error {};
function _t(e, t, n, r, i, a, o) {
  if (e.result === 3) return 0;
  if (e.result) return -(1e5 - i);
  if (t === 0) return mt(e.cells, e.mode.size, e.mode.k, e.turn);
  if (!(++o.n & 1023) && performance.now() > a) throw new gt();
  let s = vt(e, ht(e));
  for (let c of s) {
    let s = -_t(N(e, c), t - 1, -r, -n, i + 1, a, o);
    if (s > n && (n = s), n >= r) break;
  }
  return n;
}
function vt(e, t) {
  let n = e.turn,
    r = t.map(t => {
      let r = N(e, t);
      return {
        m: t,
        v: r.result === n ? 1e9 : mt(r.cells, e.mode.size, e.mode.k, n)
      };
    });
  return r.sort((e, t) => t.v - e.v), r.map(e => e.m);
}
function yt(e, t, n) {
  let r = e.turn,
    i = et(e, j(r));
  if (i.length === 1 && t === `hard`) return i[0];
  let a = t === `hard` ? e.mode.size === 4 ? 6 : e.mode.size === 5 ? 4 : 3 : 2,
    o = t === `hard` ? 350 : 120,
    s = performance.now() + o,
    c = vt(e, ht(e)),
    l = c[0],
    u = t === `hard` ? 1 : 25;
  for (let t = 1; t <= a; t++) try {
    let r = {
        n: 0
      },
      i = -1 / 0,
      a = [];
    for (let n of c) {
      let o = -_t(N(e, n), t - 1, -1 / 0, -i + u + 1, 1, s, r);
      a.push({
        m: n,
        v: o
      }), o > i && (i = o);
    }
    if (a.sort((e, t) => t.v - e.v), l = P(a.filter(e => e.v >= a[0].v - u).map(e => e.m), n), c = a.map(e => e.m), a[0].v > 5e4) break;
  } catch (e) {
    if (e instanceof gt) break;
    throw e;
  }
  return l;
}
function bt(e, t, n = Math.random) {
  let r = e.turn,
    i = j(r),
    a = e.mode.keep ? 6 : 9,
    o = new Map(),
    s = new Map(),
    c = -1 / 0;
  for (let n of t) {
    let t = xt(N(e, n), r, a - 1, o);
    s.set(n, t), c = Math.max(c, t);
  }
  let l = t[0],
    u = -1 / 0;
  for (let a of t) {
    if (s.get(a) < c) continue;
    let t = N(e, a),
      o = et(t, i).length,
      d = et(t, r).length,
      f = o * 1e3 - d * 100 - (t.result === 3 ? 50 : 0) + n();
    f > u && (u = f, l = a);
  }
  return l;
}
function xt(e, t, n, r) {
  if (e.result === t) return -1;
  if (e.result === 3) return 0;
  if (e.result) return 1;
  if (n === 0) return 0;
  let i = e.mode.keep ? `${e.queue[1].join(``)}|${e.queue[2].join(``)}|${e.turn}|${n}` : `${e.cells.join(``)}|${n}`,
    a = r.get(i);
  if (a !== void 0) return a;
  let o = e.turn === t ? -1 / 0 : 1 / 0;
  for (let i of Qe(e)) {
    let a = xt(N(e, i), t, n - 1, r);
    o = e.turn === t ? Math.max(o, a) : Math.min(o, a);
  }
  return r.set(i, o), o;
}
var St = 3,
  F = () => (St = St * 16807 % 2147483647) / 2147483647,
  I = e => Math.round(e * 10) / 10,
  Ct = (e, t, n, r = `#fff`) => {
    St = 11;
    let i = ``;
    for (let a = 0; a < t; a++) i += `<circle cx="${I(F() * e)}" cy="${I(F() * n)}" r="${I(.6 + F() * 1.6)}" fill="${r}" opacity="${I(.35 + F() * .6)}"/>`;
    return i;
  },
  wt = `<defs>
  <filter id="g1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="g2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="g3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
</defs>`,
  Tt = (e, t, n, r, i) => {
    let a = ``;
    for (let r = 0; r < 6; r++) a += `<rect x="${I(e - n)}" y="${I(t + n * (.1 + r * .16))}" width="${I(2 * n)}" height="${I(n * (.025 + r * .018))}" fill="#000"/>`;
    return `<defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r}"/><stop offset="1" stop-color="${i}"/></linearGradient>
    <mask id="sm"><rect x="-9999" y="-9999" width="99999" height="99999" fill="#fff"/>${a}</mask></defs>
    <circle cx="${I(e)}" cy="${I(t)}" r="${I(n * 1.25)}" fill="${i}" opacity=".35" filter="url(#g3)"/>
    <circle cx="${I(e)}" cy="${I(t)}" r="${I(n)}" fill="url(#sun)" mask="url(#sm)"/>`;
  },
  Et = (e, t, n, r, i, a) => {
    let o = r ? -1 : 1,
      s = t => I(e + t * o * n),
      c = e => I(t - e * n),
      l = `M${s(0)} ${c(0)} C${s(10)} ${c(80)} ${s(-5)} ${c(160)} ${s(25)} ${c(230)}`,
      u = [e + 25 * o * n, t - 230 * n],
      d = [[-90, -30], [-70, 15], [-30, 40], [30, 45], [80, 20], [100, -25], [55, -60], [-45, -65]].map(([e, t]) => {
        let r = u[0] + e * o * n,
          a = u[1] - t * n,
          s = u[0] + e * .5 * o * n,
          c = u[1] - (t + 35) * n;
        return `<path d="M${I(u[0])} ${I(u[1])} Q${I(s)} ${I(c)} ${I(r)} ${I(a)}" stroke="${i}" stroke-width="${I(7 * n)}" fill="none" stroke-linecap="round" filter="url(#g1)"/>`;
      }).join(``);
    return `<path d="${l}" stroke="${a}" stroke-width="${I(16 * n)}" fill="none" stroke-linecap="round"/><path d="${l}" stroke="${i}" stroke-width="${I(3 * n)}" fill="none" stroke-linecap="round" filter="url(#g1)" opacity=".9"/>${d}`;
  },
  Dt = (e, t, n = 600) => Math.min(e, t) / n * (t > e ? 1 : .55),
  Ot = (e, t, n, r, i) => `<circle cx="${I(e)}" cy="${I(t)}" r="${I(n * 1.6)}" fill="${i}" opacity=".35" filter="url(#g3)"/><circle cx="${I(e)}" cy="${I(t)}" r="${I(n)}" fill="${r}"/>`,
  L = (e, t, n, r, i = ``) => `<g transform="translate(${I(e)} ${I(t)}) scale(${n})" ${i}>${r}</g>`,
  kt = (e, t, n, r, i) => `<g transform="translate(${I(e)} ${I(t)}) scale(${i ? -n : n} ${n})" stroke="${r}" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#g1)"><path d="M0 0C4 -40 -6 -90 4 -150M2 -70L-34 -104L-52 -150M-34 -104L-14 -138M4 -112L38 -146L48 -186M38 -146L66 -160M4 -150L-6 -180"/></g>`,
  At = (e, t, n, r = .85) => L(e, t, n, `<path d="M-22 30V-4a22 22 0 0 1 44 0V30l-7 -6l-7 6l-8 -6l-7 6l-8 -6Z" fill="#e9fff6" stroke="#3dffb0" stroke-width="2"/><ellipse cx="-8" cy="-2" rx="3.5" ry="5" fill="#062018"/><ellipse cx="8" cy="-2" rx="3.5" ry="5" fill="#062018"/><ellipse cx="0" cy="10" rx="4" ry="3" fill="#062018"/>`, `opacity="${r}" filter="url(#g1)"`),
  jt = (e, t, n, r) => L(e, t, n, `<path d="M-20 0V-40a20 20 0 0 1 40 0V0Z" fill="#081a1c" stroke="${r}" stroke-width="2.5"/><path d="M-9 -38H9M0 -46V-22" stroke="${r}" stroke-width="2.5" opacity=".7"/>`, `filter="url(#g1)"`),
  Mt = (e, t, n, r) => L(e, t, n, `<path d="M-5 0V-36H-16V-46H-5V-58H5V-46H16V-36H5V0Z" fill="#081a1c" stroke="${r}" stroke-width="2.5"/>`, `filter="url(#g1)"`),
  Nt = (e, t, n, r) => L(e, t, n, `<path d="M0 0C-6 -8 -16 -10 -26 -6C-20 -4 -20 0 -22 4C-16 2 -12 3 -10 7C-7 3 -3 2 0 4C3 2 7 3 10 7C12 3 16 2 22 4C20 0 20 -4 26 -6C16 -10 6 -8 0 0Z" fill="#05010c" stroke="${r}" stroke-width="1"/>`),
  Pt = (e, t, n) => L(e, t, n, `<ellipse cx="0" cy="-26" rx="44" ry="34" fill="#ff7a1a" opacity=".45" filter="url(#g3)"/>
    <ellipse cx="-18" cy="-24" rx="18" ry="24" fill="#e85d0c"/><ellipse cx="18" cy="-24" rx="18" ry="24" fill="#e85d0c"/><ellipse cx="0" cy="-24" rx="20" ry="25" fill="#ff8a1f"/>
    <path d="M0 -48q2 -10 8 -14" stroke="#3dffb0" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#fff27a" filter="url(#g1)"><path d="M-16 -32l6 -9l6 9Z M4 -32l6 -9l6 9Z"/><path d="M-18 -16q18 12 36 0l-5 -2l-4 4l-5 -4l-4 4l-5 -4l-4 4l-4 -4Z"/></g>`),
  R = {
    vw: 390,
    vh: 844
  },
  Ft = {
    "bg-synthwave": {
      id: `bg-synthwave`,
      sky: [`#2a0f5e`, `#0a0420`],
      g1: `#ff2bd6`,
      g2: `#1f8bff`,
      grid: [`rgba(255,43,214,.9)`, `rgba(31,244,255,.8)`],
      line: `#b79cff`,
      scene: () => ``,
      thumb: {
        ...R,
        crop: [59, 640, 272, 204]
      }
    },
    "bg-city": {
      id: `bg-city`,
      sky: [`#1a1060`, `#060318`],
      g1: `#ff2b8a`,
      g2: `#1ff4ff`,
      grid: [`rgba(255,43,138,.85)`, `rgba(31,244,255,.75)`],
      line: `#ff9ad0`,
      scene: (e, t, n) => {
        St = 5;
        let r = ``,
          i = -10;
        for (; i < e + 10;) {
          let a = 30 + F() * 55,
            o = t * (.06 + F() * .2) * (t > e ? 1 : .45),
            s = F() < .5 ? `#ff2bd6` : `#1ff4ff`;
          r += `<rect x="${I(i)}" y="${I(n - o)}" width="${I(a)}" height="${I(o)}" fill="#0c0626" stroke="${s}" stroke-width="1.5" opacity=".95"/>`;
          for (let e = n - o + 8; e < n - 8; e += 12) for (let t = i + 6; t < i + a - 8; t += 11) F() < .35 && (r += `<rect x="${I(t)}" y="${I(e)}" width="5" height="6" fill="${F() < .5 ? `#ffd23a` : s}" opacity=".85"/>`);
          i += a + 4;
        }
        return Ct(e, 40, n * .6) + `<ellipse cx="${e / 2}" cy="${n}" rx="${e * .6}" ry="${t * .12}" fill="#ff2b8a" opacity=".35" filter="url(#g3)"/><g filter="url(#g1)">${r}</g>`;
      },
      thumb: {
        ...R,
        crop: [0, 470, 390, 292]
      }
    },
    "bg-palms": {
      id: `bg-palms`,
      sky: [`#7a1a8a`, `#1a0838`],
      g1: `#ff4fb0`,
      g2: `#ffb23d`,
      grid: [`rgba(31,244,255,.85)`, `rgba(31,200,255,.6)`],
      line: `#9ff6ff`,
      noFloor: !0,
      scene: (e, t, n) => {
        let r = t > e,
          i = n - t * (r ? .02 : .05),
          a = r ? e / 2 : e * .9,
          o = Math.min(e, t) * (r ? .3 : .16),
          s = ``;
        for (let e = 0; e < 10; e++) {
          let t = o * .9 - e * o * .06;
          s += `<rect x="${I(a - t)}" y="${I(i + 6 + e * 7)}" width="${I(2 * t)}" height="${I(2 + e * .3)}" rx="2" fill="#ffb0e0" opacity="${I(.75 - e * .06)}"/>`;
        }
        let c = (e, t, n) => `<ellipse cx="${I(e)}" cy="${I(i + 3)}" rx="${I(60 * t)}" ry="${I(9 * t)}" fill="#140628" stroke="#ffd56b" stroke-width="2" filter="url(#g1)"/>` + Et(e - 12 * t * (n ? -1 : 1), i + 2, t * .3, n, `#3dffb0`, `#120628`) + Et(e + 16 * t * (n ? -1 : 1), i + 2, t * .22, !n, `#1ff4ff`, `#120628`);
        return Ct(e, 30, i * .5) + Tt(a, i, o, `#fff07a`, `#ff3d8f`) + `<rect x="0" y="${I(i)}" width="${e}" height="${I(t - i)}" fill="#0a1648"/><rect x="0" y="${I(i)}" width="${e}" height="2" fill="#1ff4ff" filter="url(#g1)"/>` + s + (r ? c(e * .17, 1, !1) + c(e * .84, .85, !0) : c(e * .8, 1.1, !1));
      },
      thumb: {
        ...R,
        crop: [0, 552, 390, 292]
      }
    },
    "bg-spooky": {
      id: `bg-spooky`,
      sky: [`#0c3a34`, `#020a0a`],
      g1: `#3dffb0`,
      g2: `#8a3dff`,
      grid: [`rgba(61,255,176,.75)`, `rgba(150,90,255,.6)`],
      line: `#9dffd0`,
      scene: (e, t, n, r) => {
        let i = Dt(e, t),
          a = Math.min(e, t) * .085,
          o = ``;
        return [.06, .17, .3, .42, .56, .7, .82, .94].forEach((t, r) => {
          o += (r % 3 == 1 ? Mt : jt)(e * t, n + 2, I(i * (.75 + r * 37 % 5 * .12)), r % 2 ? `#3dffb0` : `#b36bff`);
        }), Ct(e, 60, n * .7, `#c8ffe9`) + Ot(r.x, r.y, a, `#d8ffe8`, `#3dffb0`) + `<circle cx="${I(r.x - a * .3)}" cy="${I(r.y - a * .2)}" r="${I(a * .18)}" fill="#a9e8c8"/><circle cx="${I(r.x + a * .35)}" cy="${I(r.y + a * .3)}" r="${I(a * .12)}" fill="#a9e8c8"/>` + Nt(r.x - e * .14, r.y - t * .02, I(i * 1.7), `#3dffb0`) + Nt(r.x - e * .05, r.y + t * .05, I(i * 1.2), `#3dffb0`) + kt(e * .02, n, i * 1.2, `#8a3dff`, !1) + kt(e * .99, n, i, `#3dffb0`, !0) + At(e * .2, t * (t > e ? .8 : .72), I(i * 1.1)) + At(e * .86, t * (t > e ? .79 : .7), I(i * .8), .6) + o + `<ellipse cx="${e * .5}" cy="${n + 4}" rx="${e * .75}" ry="${t * .035}" fill="#3dffb0" opacity=".22" filter="url(#g2)"/>`;
      },
      thumb: {
        ...R,
        crop: [0, 585, 260, 195]
      }
    },
    "bg-halloween": {
      id: `bg-halloween`,
      sky: [`#4a0d52`, `#120414`],
      g1: `#ff7a1a`,
      g2: `#b336ff`,
      grid: [`rgba(255,122,26,.9)`, `rgba(180,60,255,.7)`],
      line: `#ffb36b`,
      scene: (e, t, n, r) => {
        let i = Dt(e, t),
          a = Math.min(e, t) * .11,
          o = e => e * Math.PI / 180,
          s = `<g stroke="#e9d6ff" stroke-width="1.2" fill="none" opacity=".5">${[0, 18, 36, 54, 72, 90].map(e => `<path d="M0 0L${I(Math.cos(o(e)) * 120 * i)} ${I(Math.sin(o(e)) * 120 * i)}"/>`).join(``)}${[40, 70, 100].map(e => `<path d="M${I(e * i)} 0${[18, 36, 54, 72, 90].map(t => `Q${I(Math.cos(o(t - 9)) * e * .8 * i)} ${I(Math.sin(o(t - 9)) * e * .8 * i)} ${I(Math.cos(o(t)) * e * i)} ${I(Math.sin(o(t)) * e * i)}`).join(``)}"/>`).join(``)}</g>`,
          c = t > e ? e * .5 : e * .9,
          l = t * (t > e ? .3 : .5),
          u = `<path d="M${I(c)} 0V${I(l)}" stroke="#e9d6ff" stroke-width="1" opacity=".6"/>` + L(c, l, I(i * 1.4), `<path d="M-6 -2l-12 -8l-6 6M-6 2l-14 2l-6 8M6 -2l12 -8l6 6M6 2l14 2l6 8M-4 5l-8 10M4 5l8 10" stroke="#b336ff" stroke-width="2.4" fill="none"/><ellipse rx="8" ry="9" fill="#14051c" stroke="#b336ff" stroke-width="2"/><circle cx="-3" cy="-2" r="1.6" fill="#ff7a1a"/><circle cx="3" cy="-2" r="1.6" fill="#ff7a1a"/>`, `filter="url(#g1)"`),
          d = ``,
          f = Math.ceil(e / (26 * i)) + 1;
        for (let e = 0; e < f; e++) d += `<path d="M${I(e * 26 * i)} ${I(n)}V${I(n - 36 * i)}l${I(5 * i)} ${I(-8 * i)}l${I(5 * i)} ${I(8 * i)}V${I(n)}Z"/>`;
        return Ct(e, 50, n * .7) + Ot(r.x, r.y, a, `#ffb347`, `#ff7a1a`) + `<circle cx="${I(r.x + a * .3)}" cy="${I(r.y - a * .25)}" r="${I(a * .2)}" fill="#f29a30"/>` + Nt(r.x - e * .16, r.y - t * .03, I(i * 1.8), `#b336ff`) + Nt(r.x - e * .06, r.y + t * .06, I(i * 1.3), `#b336ff`) + Nt(e * .14, t * .2, I(i * 1.4), `#b336ff`) + s + u + `<g stroke="#ff7a1a" stroke-width="2" fill="#140418" opacity=".9" filter="url(#g1)">${d}<rect x="0" y="${I(n - 26 * i)}" width="${e}" height="${I(4 * i)}"/></g>` + Pt(e * .12, n + 6, I(i * 1.25)) + Pt(e * .3, n + 8, I(i * .8)) + Pt(e * .72, n + 8, I(i * .9)) + Pt(e * .9, n + 6, I(i * 1.35));
      },
      thumb: {
        ...R,
        crop: [0, 590, 260, 195]
      }
    },
    "bg-ocean": {
      id: `bg-ocean`,
      sky: [`#04306a`, `#020a24`],
      g1: `#1ff4ff`,
      g2: `#3d5cff`,
      grid: [`rgba(31,244,255,.5)`, `rgba(61,120,255,.5)`],
      line: `#8fe9ff`,
      noFloor: !0,
      scene: (e, t, n, r) => {
        St = 9;
        let i = ``;
        for (let n = 0; n < 6; n++) {
          let r = e * (.1 + n * .17);
          i += `<path d="M${I(r)} 0 L${I(r + e * .07)} 0 L${I(r + e * .2)} ${I(t * .75)} L${I(r - e * .02)} ${I(t * .75)}Z" fill="#9ff6ff" opacity=".07"/>`;
        }
        let a = ``;
        for (let n = 0; n < 28; n++) a += `<circle cx="${I(F() * e)}" cy="${I(F() * t)}" r="${I(2 + F() * 7)}" fill="none" stroke="#bff8ff" stroke-width="1.3" opacity="${I(.3 + F() * .5)}"/>`;
        let o = (e, n, r) => `<path d="M${I(e)} ${t} C${I(e - 18)} ${I(t - n * .3)} ${I(e + 18)} ${I(t - n * .6)} ${I(e)} ${I(t - n)}" stroke="${r}" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#g1)"/>`,
          s = (e, t, n, r) => L(e, t, I(n), `<path d="M-20 0a20 18 0 0 1 40 0q-5 5 -10 0q-5 5 -10 0q-5 5 -10 0q-5 5 -10 0z" fill="${r}" opacity=".85"/><path d="M-12 4q-4 14 2 26M0 4q4 16 -2 30M12 4q-3 14 3 24" stroke="${r}" stroke-width="2.5" fill="none"/>`, `filter="url(#g1)"`);
        return i + a + s(r.x, r.y, Math.min(e, t) / 330, `#ff6bd8`) + s(e * .12, t * .8, Math.min(e, t) / 480, `#b36bff`) + o(e * .04, t * .22, `#3dffb0`) + o(e * .1, t * .14, `#1ff4ff`) + o(e * .93, t * .2, `#3dffb0`) + o(e * .98, t * .12, `#ff6bd8`);
      },
      thumb: {
        vw: 480,
        vh: 360,
        crop: [0, 0, 480, 360]
      }
    },
    "bg-pyramids": {
      id: `bg-pyramids`,
      sky: [`#3a0f5a`, `#0e0420`],
      g1: `#ffb23d`,
      g2: `#ff2bd6`,
      grid: [`rgba(255,178,61,.85)`, `rgba(255,90,200,.6)`],
      line: `#ffd58a`,
      noFloor: !0,
      scene: (e, t, n, r) => {
        let i = t > e,
          a = (e, t, r) => `<g filter="url(#g1)"><path d="M${I(e - t / 2)} ${n} L${I(e)} ${I(n - r)} L${I(e + t * .08)} ${n}Z" fill="#3a1450"/><path d="M${I(e)} ${I(n - r)} L${I(e + t / 2)} ${n} L${I(e + t * .08)} ${n}Z" fill="#1c0830"/><path d="M${I(e - t / 2)} ${n} L${I(e)} ${I(n - r)} L${I(e + t / 2)} ${n}" stroke="#ffd56b" stroke-width="2.5" fill="none"/><path d="M${I(e)} ${I(n - r)} L${I(e + t * .08)} ${n}" stroke="#ff9a3d" stroke-width="1.5" opacity=".8"/></g>`,
          o = (n, r, i, a) => `<path d="M-10 ${I(n)} Q${I(e * .2)} ${I(n - r)} ${I(e * .4)} ${I(n)} T${I(e * .8)} ${I(n)} T${I(e + 40)} ${I(n - r * .3)} V${t + 5} H-10Z" fill="${i}" stroke="${a}" stroke-width="2" filter="url(#g1)"/>`,
          s = t * (i ? .085 : .15),
          c = i ? [[.16, .3, .8], [.5, .42, 1], [.86, .26, .7]] : [[.07, .16, .75], [.19, .2, 1], [.84, .18, .9], [.96, .12, .6]];
        return Ct(e, 110, n * .85) + Ot(r.x, r.y, Math.min(e, t) * .07, `#fff3c4`, `#ffb23d`) + Tt(e / 2, n, Math.min(e, t) * (i ? .26 : .2), `#ffe66b`, `#ff4f8a`) + c.map(([t, n, r]) => a(e * t, e * n, s * r)).join(``) + o(n + t * .025, t * .02, `#24092e`, `#ff5ac8`) + o(n + t * .07, t * .025, `#170520`, `#ffb23d`);
      },
      thumb: {
        ...R,
        crop: [0, 520, 390, 292]
      }
    },
    "bg-cosmos": {
      id: `bg-cosmos`,
      sky: [`#120a3a`, `#02010a`],
      g1: `#8a3dff`,
      g2: `#1f8bff`,
      grid: [`rgba(140,90,255,.6)`, `rgba(60,140,255,.5)`],
      line: `#c8b5ff`,
      noFloor: !0,
      scene: (e, t, n, r) => {
        let i = Math.min(e, t) * .09;
        return `<ellipse cx="${I(e * .7)}" cy="${I(t * .35)}" rx="${I(e * .5)}" ry="${I(t * .18)}" fill="#ff2bd6" opacity=".22" filter="url(#g3)" transform="rotate(-20 ${I(e * .7)} ${I(t * .35)})"/>
        <ellipse cx="${I(e * .3)}" cy="${I(t * .7)}" rx="${I(e * .45)}" ry="${I(t * .14)}" fill="#1ff4ff" opacity=".18" filter="url(#g3)"/>` + Ct(e, 220, t) + `<g transform="translate(${I(r.x)} ${I(r.y)})"><circle r="${I(i)}" fill="#ff8a3d"/><circle r="${I(i)}" fill="#7a1fd6" opacity=".45"/><ellipse rx="${I(i * 1.9)}" ry="${I(i * .45)}" fill="none" stroke="#ffd56b" stroke-width="${I(i * .12)}" transform="rotate(-18)" filter="url(#g1)"/></g><circle cx="${I(e * .12)}" cy="${I(t * .86)}" r="${I(i * .55)}" fill="#3dffb0" opacity=".85" filter="url(#g1)"/>`;
      },
      thumb: {
        vw: 640,
        vh: 480,
        crop: [260, 0, 380, 285]
      }
    }
  },
  It = e => Ft[e] ?? Ft[`bg-synthwave`],
  Lt = (e, t) => Math.round(t * (t > e ? .845 : .9)),
  Rt = (e, t) => t > e ? {
    x: e * .84,
    y: t * .27
  } : {
    x: e * .86,
    y: t * .17
  },
  zt = 0,
  Bt = e => {
    let t = `b${++zt}-`;
    return e.replace(/id="([^"]+)"/g, `id="${t}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${t}$1)`);
  };
function Vt(e) {
  let t = It(e),
    n = document.querySelector(`.bg`);
  if (!n) return;
  let r = n.clientWidth || innerWidth,
    i = n.clientHeight || innerHeight,
    a = document.documentElement.style;
  n.querySelector(`.theme`)?.remove();
  let o = n.querySelector(`.floor-wrap`),
    s = n.querySelector(`.floor-lines`),
    c = n.querySelector(`.g1`),
    l = n.querySelector(`.g2`);
  if (t.id === `bg-synthwave`) {
    for (let e of [n, o, s, c, l]) e.removeAttribute(`style`);
    a.removeProperty(`--gl`), a.removeProperty(`--glg`), a.removeProperty(`--bd`);
    return;
  }
  let u = Lt(r, i);
  n.style.background = `linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} 75%)`, c.style.background = `radial-gradient(circle, ${t.g1} 0%, transparent 65%)`, l.style.background = `radial-gradient(circle, ${t.g2} 0%, transparent 65%)`, o.style.display = t.noFloor ? `none` : ``, o.style.height = `${i - u}px`, o.style.zIndex = `2`, s.style.backgroundImage = `linear-gradient(to right, ${t.grid[0]} 2px, transparent 2px), linear-gradient(to bottom, ${t.grid[1]} 2px, transparent 2px)`, n.insertAdjacentHTML(`beforeend`, `<svg class="theme" width="${r}" height="${i}" viewBox="0 0 ${r} ${i}" aria-hidden="true">${Bt(wt + t.scene(r, i, u, Rt(r, i)))}</svg>`), a.setProperty(`--gl`, t.line), a.setProperty(`--glg`, t.g1), a.setProperty(`--bd`, t.line);
}
function Ht(e, t = `bgth`) {
  let n = It(e),
    {
      vw: r,
      vh: i,
      crop: a
    } = n.thumb,
    o = Lt(r, i),
    s = ``;
  if (!n.noFloor) {
    let e = r / 2;
    for (let t = -10; t <= 10; t++) s += `<path d="M${I(e + t * r / 10 * .12)} ${o} L${I(e + t * r / 4)} ${i}" stroke="${n.grid[0]}" stroke-width="2"/>`;
    for (let e = 1; e <= 6; e++) {
      let t = o + (i - o) * (e / 6) ** 1.8;
      s += `<path d="M0 ${I(t)}H${r}" stroke="${n.grid[1]}" stroke-width="2"/>`;
    }
    s = `<g opacity=".55">${s}</g>`;
  }
  let c = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${n.sky[0]}"/><stop offset=".75" stop-color="${n.sky[1]}"/><stop offset="1" stop-color="${n.sky[1]}"/></linearGradient></defs><rect width="${r}" height="${i}" fill="url(#sky)"/><circle cx="0" cy="${i * .1}" r="${r * .6}" fill="${n.g1}" opacity=".25" filter="url(#g3)"/><circle cx="${r}" cy="${i}" r="${r * .6}" fill="${n.g2}" opacity=".25" filter="url(#g3)"/>` + n.scene(r, i, o, Rt(r, i)) + s;
  return `<svg class="${t}" viewBox="${a.join(` `)}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${Bt(wt + c)}</svg>`;
}
var Ut = [],
  Wt = (...e) => e.join(`|`).match(/\d+/g)?.length ?? 0;
function z(e, t, n) {
  if (Wt(e, t, n) > 2) {
    console.warn(`[measure] dropped, more than 2 numbers:`, e, t, n);
    return;
  }
  let r = /[^A-Za-z0-9 \-_:.+|]/g;
  r.test(e + t + n) && (console.warn(`[measure] characters replaced:`, e, t, n), e = e.replace(r, `_`), t = t.replace(r, `_`), n = n.replace(r, `_`));
  Ut.push(`${e}/${t}/${n}`), Ut.length > 200 && Ut.shift();
}
typeof window < `u` && (window.__measured = () => Ut.slice());
var Gt = [{
    id: `en`,
    name: `English`
  }, {
    id: `es`,
    name: `Español`
  }, {
    id: `pt`,
    name: `Português`
  }, {
    id: `fr`,
    name: `Français`
  }, {
    id: `de`,
    name: `Deutsch`
  }, {
    id: `id`,
    name: `Indonesia`
  }, {
    id: `it`,
    name: `Italiano`
  }, {
    id: `nl`,
    name: `Nederlands`
  }, {
    id: `tr`,
    name: `Türkçe`
  }, {
    id: `pl`,
    name: `Polski`
  }, {
    id: `zh`,
    name: `中文`
  }, {
    id: `ja`,
    name: `日本語`
  }, {
    id: `th`,
    name: `ไทย`
  }, {
    id: `vi`,
    name: `Tiếng Việt`
  }],
  Kt = e => `<rect width="30" height="20" fill="#f4efff"/><text x="15" y="15.2" text-anchor="middle" font-size="13.5" font-weight="700" fill="#3a1f7a" font-family="'PingFang SC','Microsoft YaHei','Noto Sans CJK SC',sans-serif">${e}</text>`,
  qt = (e, t, n) => `<rect width="30" height="7" fill="${e}"/><rect y="7" width="30" height="6" fill="${t}"/><rect y="13" width="30" height="7" fill="${n}"/>`,
  Jt = (e, t, n) => `<rect width="10" height="20" fill="${e}"/><rect x="10" width="10" height="20" fill="${t}"/><rect x="20" width="10" height="20" fill="${n}"/>`;
function Yt() {
  let e = `<rect width="30" height="20" fill="#fff"/>`;
  for (let t = 0; t < 7; t++) e += `<rect y="${t * 20 / 6.5}" width="30" height="${20 / 13}" fill="#c8323c"/>`;
  e += `<rect width="13" height="10.8" fill="#2f3f8f"/>`;
  for (let t = 0; t < 4; t++) for (let n = 0; n < 5; n++) e += `<circle cx="${1.6 + n * 2.5 + t % 2 * 1.2}" cy="${1.6 + t * 2.5}" r="0.55" fill="#fff"/>`;
  return e;
}
var Xt = {
  en: Yt,
  es: () => `<rect width="30" height="20" fill="#c8323c"/><rect y="5" width="30" height="10" fill="#f7c843"/>`,
  pt: () => `<rect width="30" height="20" fill="#2f9e48"/><path d="M15 2.5 27 10 15 17.5 3 10Z" fill="#f7d22e"/><circle cx="15" cy="10" r="4.4" fill="#1f3f8f"/><path d="M10.8 9.2q4.2-1.4 8.4 1" stroke="#fff" stroke-width=".8" fill="none"/>`,
  fr: () => Jt(`#2448a8`, `#fff`, `#dd3b40`),
  de: () => qt(`#1b1b1b`, `#d42a20`, `#f7c843`),
  it: () => Jt(`#2f9a50`, `#fff`, `#cf3a3c`),
  nl: () => qt(`#ae2b2f`, `#fff`, `#26468f`),
  tr: () => `<rect width="30" height="20" fill="#d6262f"/><circle cx="11.5" cy="10" r="5" fill="#fff"/><circle cx="12.8" cy="10" r="4" fill="#d6262f"/><path d="m18.6 10 3.6-1.2-2.2 3.1v-3.8l2.2 3.1Z" fill="#fff"/>`,
  id: () => `<rect width="30" height="20" fill="#fff"/><rect width="30" height="10" fill="#d22b3c"/>`,
  zh: () => Kt(`中`),
  ja: () => `<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.6" fill="#c8323c"/>`,
  th: () => `<rect width="30" height="20" fill="#d22b3c"/><rect y="3.3" width="30" height="13.4" fill="#fff"/><rect y="6.7" width="30" height="6.6" fill="#2f3f8f"/>`,
  vi: () => `<rect width="30" height="20" fill="#d6262f"/><path d="M15 4.6l1.5 4.6h4.8l-3.9 2.8 1.5 4.6-3.9-2.8-3.9 2.8 1.5-4.6-3.9-2.8h4.8z" fill="#f7d22e"/>`,
  pl: () => `<rect width="30" height="20" fill="#fff"/><rect y="10" width="30" height="10" fill="#d22b3c"/>`
};
function Zt(e, t = `flag`) {
  return `<svg class="${t}" viewBox="0 0 30 20" aria-hidden="true"><defs><clipPath id="fc-${e}"><rect width="30" height="20" rx="3"/></clipPath></defs><g clip-path="url(#fc-${e})">${(Xt[e] ?? Xt.en)()}</g><rect width="30" height="20" rx="3" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".6"/></svg>`;
}
var B = `0.14.10`,
  Qt = `modulepreload`,
  $t = function (e, t) {
    return new URL(e, t).href;
  },
  en = {},
  tn = function (e) {
    return e.pathname.endsWith(`.css`);
  },
  nn = function (e, t, n) {
    if (t in e) return e[t];
    let r = n();
    if (!r) {
      e[t] = void 0;
      return;
    }
    let i = r.then(() => {
      e[t] = void 0;
    }, n => {
      throw e[t] = void 0, n;
    });
    return e[t] = i, i;
  },
  rn = function (e, t, n) {
    let r = Promise.resolve();
    if (t && t.length > 0) {
      let e,
        i = document.querySelector(`meta[property=csp-nonce]`),
        a = i?.nonce || i?.getAttribute(`nonce`);
      function o(e) {
        return Promise.all(e.map(e => Promise.resolve(e).then(e => ({
          status: `fulfilled`,
          value: e
        }), e => ({
          status: `rejected`,
          reason: e
        }))));
      }
      function s(e) {
        return import.meta.resolve ? new URL(import.meta.resolve(e)) : new URL(e, import.meta.url);
      }
      r = o(t.map(t => {
        t = $t(t, n);
        let r = s(t),
          i = tn(r);
        return nn(en, r.href, () => {
          if (e === void 0) {
            e = {
              all: new Set(),
              styles: new Set()
            };
            let t = document.getElementsByTagName(`link`);
            for (let n = t.length - 1; n >= 0; n--) {
              let r = t[n];
              e.all.add(r.href), r.rel === `stylesheet` && e.styles.add(r.href);
            }
          }
          if ((i ? e.styles : e.all).has(r.href)) return;
          let t = document.createElement(`link`);
          if (t.rel = i ? `stylesheet` : Qt, i || (t.as = `script`), t.crossOrigin = ``, t.href = r.href, a && t.setAttribute(`nonce`, a), document.head.appendChild(t), i) return new Promise((e, n) => {
            t.addEventListener(`load`, e), t.addEventListener(`error`, () => n(Error(`Unable to preload CSS for ${r}`)));
          });
        });
      }).filter(e => e !== void 0));
    }
    function i(e) {
      let t = new Event(`vite:preloadError`, {
        cancelable: !0
      });
      if (t.payload = e, window.dispatchEvent(t), !t.defaultPrevented) throw e;
    }
    return r.then(t => {
      for (let e of t || []) e.status === `rejected` && i(e.reason);
      return e().catch(i);
    });
  };
function an(e) {
  "@babel/helpers - typeof";

  return an = typeof Symbol == `function` && typeof Symbol.iterator == `symbol` ? function (e) {
    return typeof e;
  } : function (e) {
    return e && typeof Symbol == `function` && e.constructor === Symbol && e !== Symbol.prototype ? `symbol` : typeof e;
  }, an(e);
}
var on = o(() => {});
function sn(e, t) {
  if (an(e) != `object` || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t || `default`);
    if (an(r) != `object`) return r;
    throw TypeError(`@@toPrimitive must return a primitive value.`);
  }
  return (t === `string` ? String : Number)(e);
}
var cn = o(() => {
  on();
});
function ln(e) {
  var t = sn(e, `string`);
  return an(t) == `symbol` ? t : t + ``;
}
var un = o(() => {
  on(), cn();
});
function V(e, t, n) {
  return (t = ln(t)) in e ? Object.defineProperty(e, t, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = n, e;
}
var dn = o(() => {
    un();
  }),
  fn = s((e, t) => {
    var n = Object.prototype.hasOwnProperty,
      r = `~`;
    function i() {}
    Object.create && (i.prototype = Object.create(null), new i().__proto__ || (r = !1));
    function a(e, t, n) {
      this.fn = e, this.context = t, this.once = n || !1;
    }
    function o(e, t, n, i, o) {
      if (typeof n != `function`) throw TypeError(`The listener must be a function`);
      var s = new a(n, i || e, o),
        c = r ? r + t : t;
      return e._events[c] ? e._events[c].fn ? e._events[c] = [e._events[c], s] : e._events[c].push(s) : (e._events[c] = s, e._eventsCount++), e;
    }
    function s(e, t) {
      --e._eventsCount === 0 ? e._events = new i() : delete e._events[t];
    }
    function c() {
      this._events = new i(), this._eventsCount = 0;
    }
    c.prototype.eventNames = function () {
      var e = [],
        t,
        i;
      if (this._eventsCount === 0) return e;
      for (i in t = this._events) n.call(t, i) && e.push(r ? i.slice(1) : i);
      return Object.getOwnPropertySymbols ? e.concat(Object.getOwnPropertySymbols(t)) : e;
    }, c.prototype.listeners = function (e) {
      var t = r ? r + e : e,
        n = this._events[t];
      if (!n) return [];
      if (n.fn) return [n.fn];
      for (var i = 0, a = n.length, o = Array(a); i < a; i++) o[i] = n[i].fn;
      return o;
    }, c.prototype.listenerCount = function (e) {
      var t = r ? r + e : e,
        n = this._events[t];
      return n ? n.fn ? 1 : n.length : 0;
    }, c.prototype.emit = function (e, t, n, i, a, o) {
      var s = r ? r + e : e;
      if (!this._events[s]) return !1;
      var c = this._events[s],
        l = arguments.length,
        u,
        d;
      if (c.fn) {
        switch (c.once && this.removeListener(e, c.fn, void 0, !0), l) {
          case 1:
            return c.fn.call(c.context), !0;
          case 2:
            return c.fn.call(c.context, t), !0;
          case 3:
            return c.fn.call(c.context, t, n), !0;
          case 4:
            return c.fn.call(c.context, t, n, i), !0;
          case 5:
            return c.fn.call(c.context, t, n, i, a), !0;
          case 6:
            return c.fn.call(c.context, t, n, i, a, o), !0;
        }
        for (d = 1, u = Array(l - 1); d < l; d++) u[d - 1] = arguments[d];
        c.fn.apply(c.context, u);
      } else {
        var f = c.length,
          p;
        for (d = 0; d < f; d++) switch (c[d].once && this.removeListener(e, c[d].fn, void 0, !0), l) {
          case 1:
            c[d].fn.call(c[d].context);
            break;
          case 2:
            c[d].fn.call(c[d].context, t);
            break;
          case 3:
            c[d].fn.call(c[d].context, t, n);
            break;
          case 4:
            c[d].fn.call(c[d].context, t, n, i);
            break;
          default:
            if (!u) for (p = 1, u = Array(l - 1); p < l; p++) u[p - 1] = arguments[p];
            c[d].fn.apply(c[d].context, u);
        }
      }
      return !0;
    }, c.prototype.on = function (e, t, n) {
      return o(this, e, t, n, !1);
    }, c.prototype.once = function (e, t, n) {
      return o(this, e, t, n, !0);
    }, c.prototype.removeListener = function (e, t, n, i) {
      var a = r ? r + e : e;
      if (!this._events[a]) return this;
      if (!t) return s(this, a), this;
      var o = this._events[a];
      if (o.fn) o.fn === t && (!i || o.once) && (!n || o.context === n) && s(this, a);else {
        for (var c = 0, l = [], u = o.length; c < u; c++) (o[c].fn !== t || i && !o[c].once || n && o[c].context !== n) && l.push(o[c]);
        l.length ? this._events[a] = l.length === 1 ? l[0] : l : s(this, a);
      }
      return this;
    }, c.prototype.removeAllListeners = function (e) {
      var t;
      return e ? (t = r ? r + e : e, this._events[t] && s(this, t)) : (this._events = new i(), this._eventsCount = 0), this;
    }, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = r, c.EventEmitter = c, t !== void 0 && (t.exports = c);
  }),
  H = `ttt-q2`,
  mn = `cc778328-1846-4549-97c7-276cced0e651`;
function hn(e) {
  return e ? e.code === `reconnect-failed` || e.type === `socket-error` && /giving up/i.test(String(e.message || ``)) : !1;
}
function gn(e) {
  let t = e,
    n = t?.type === `socket-error` ? `socket` : t?.code || t?.type || (t?.message ? `msg-` + t.message : `other`);
  return String(n).toLowerCase().replace(/[^a-z-]+/g, `-`).replace(/^-+|-+$/g, ``).slice(0, 28) || `other`;
}
function vn() {
  let e = new BroadcastChannel(`ttt-local-net`),
    t = Math.random().toString(36).slice(2, 10),
    n = null,
    r = null,
    i = null,
    a = !1,
    o = !0,
    s = ``,
    c = ``,
    l = 0,
    u = ``,
    d = !1,
    f = new Map(),
    p = () => ({
      code: n,
      public: o,
      playerCount: r ? 2 : 1,
      maxPlayers: 2,
      hasPassword: !1,
      createdAt: s,
      customData: l ? {
        kind: c,
        m: l,
        ...(u ? {
          mode: u
        } : {})
      } : {
        kind: c
      },
      host: t
    }),
    m = () => n && a && e.postMessage(o ? {
      k: `lobby`,
      info: p()
    } : {
      k: `gone`,
      code: n
    }),
    h = {
      id: t,
      ready: async () => {
        e.postMessage({
          k: `who`
        }), await new Promise(e => setTimeout(e, 150));
      },
      list: async () => {
        if (globalThis.__netFail) throw Error(`signaling socket closed`);
        if (d) return [];
        f.clear(), e.postMessage({
          k: `who`
        }), await new Promise(e => setTimeout(e, 150));
        let t = n && a && o ? [p()] : [];
        return [...f.values(), ...t].filter(e => e.playerCount < 2);
      },
      listQuick: async () => h.list(),
      listAllQuick: async () => h.listAll(``),
      listAll: async () => {
        if (d) return [];
        f.clear(), e.postMessage({
          k: `who`
        }), await new Promise(e => setTimeout(e, 150));
        let t = n && a && o ? [p()] : [];
        return [...f.values(), ...t];
      },
      create: async e => (n = Math.random().toString(36).slice(2, 6).toUpperCase(), a = !0, o = e.public, c = e.kind, l = 0, u = ``, s = new Date().toISOString().slice(0, 19) + `Z`, globalThis.__oldLobby && (s = new Date(Date.now() - 3e5).toISOString().slice(0, 19) + `Z`), m(), n),
      join: async i => (e.postMessage({
        k: `join`,
        code: i.toUpperCase(),
        from: t
      }), h.lastJoinErr = ``, new Promise(o => {
        let s = setTimeout(() => (h.lastJoinErr = `lobby-not-found`, o(!1)), 1500),
          c = l => {
            if (l.data.k === `welcome` && l.data.to === t) {
              if (clearTimeout(s), e.removeEventListener(`message`, c), n = i.toUpperCase(), a = !1, h.joinCount = typeof l.data.count == `number` ? l.data.count : 2, l.data.dead) return void o(!0);
              r = l.data.from, h.onPeer(r), o(!0);
            }
          };
        e.addEventListener(`message`, c);
      })),
      quickJoin: async (e, t) => {
        if (globalThis.__noQuickJoin) throw Error(`unknown packet type`);
        if (globalThis.__hangQuickJoin) return new Promise(() => {});
        let n = (await h.list()).filter(t => (!e || e.includes(String(t.customData?.kind))) && !t.customData?.m).sort((e, t) => e.createdAt < t.createdAt ? -1 : 1);
        for (let e of n) if (await h.join(e.code)) return {
          info: {
            ...e,
            playerCount: 2
          },
          created: !1
        };
        return {
          info: {
            code: await h.create({
              public: !0,
              kind: t
            }),
            public: !0,
            playerCount: 1,
            maxPlayers: 2,
            hasPassword: !1,
            createdAt: s,
            customData: {
              kind: t
            }
          },
          created: !0
        };
      },
      inLobby: async e => {
        if (globalThis.__noCounts) throw Error(`unknown packet type`);
        return globalThis.__hangCounts ? new Promise(() => {}) : (await h.listAll(``)).filter(t => !e.kind || t.customData?.kind === e.kind).reduce((e, t) => e + t.playerCount, 0);
      },
      hide: async () => {
        a ? (o = !1, m()) : r && e.postMessage({
          k: `hide`,
          to: r
        });
      },
      markMatched: async (t, n) => {
        a ? (l = Date.now(), u = n || ``, m()) : r && e.postMessage({
          k: `mark`,
          to: r,
          mode: n
        });
      },
      leave: async () => {
        r && e.postMessage({
          k: `bye`,
          to: r,
          from: t
        }), n && a && globalThis.__ghostLobby ? i = n : n && a && e.postMessage({
          k: `gone`,
          code: n
        }), n = null, r = null, a = !1;
      },
      close: () => {
        h.leave(), d = !0, i || e.close();
      },
      send: n => r && e.postMessage({
        k: `msg`,
        to: r,
        from: t,
        d: n
      }),
      onPeer: () => {},
      onPeerLeft: () => {},
      onMessage: () => {},
      onFail: () => {}
    };
  return e.onmessage = o => {
    let s = o.data;
    if (s.k === `who` && m(), s.k === `lobby` && s.info.host !== t && f.set(s.info.code, s.info), s.k === `gone` && f.delete(s.code), s.k === `join` && i && s.code === i) return void e.postMessage({
      k: `welcome`,
      to: s.from,
      from: t,
      dead: !0,
      count: 1
    });
    if (s.k === `join` && s.code === n && a && !r && globalThis.__deaf) return void e.postMessage({
      k: `welcome`,
      to: s.from,
      from: t,
      dead: !0,
      count: 2
    });
    if (s.k === `join` && s.code === n && a && !r) {
      if (r = s.from, globalThis.__deadHost) return void e.postMessage({
        k: `welcome`,
        to: s.from,
        from: t,
        dead: !0
      });
      e.postMessage({
        k: `welcome`,
        to: s.from,
        from: t
      }), m(), h.onPeer(r);
    }
    s.k === `hide` && s.to === t && h.hide(), s.k === `mark` && s.to === t && h.markMatched(c, s.mode), s.k === `msg` && s.to === t && h.onMessage(s.d), s.k === `bye` && s.to === t && s.from === r && (r = null, m(), h.onPeerLeft(s.from));
  }, h.diag = () => r ? `no-channel` : `no-peer`, h.lobbyAgeMs = () => null, addEventListener(`beforeunload`, () => h.leave()), h;
}
var U = [`bronze`, `silver`, `gold`, `plat`, `dia`, `master`, `gm`, `legend`],
  yn = [1, 5, 10, 50, 100, 250, 500, 1e3],
  bn = [3, 5, 10, 20, 30, 50, 75, 100],
  xn = [2, 3, 7, 14, 30, 60, 100, 365],
  Sn = 1e3,
  Cn = () => M.reduce((e, t) => e + (k.stats[`${t}-hard`]?.w ?? 0), 0),
  W = [...M.map(e => ({
    id: `m:` + e,
    kind: `mode`,
    mode: e,
    steps: yn,
    value: () => k.bw[e] ?? 0
  })), {
    id: `a:streak`,
    kind: `streak`,
    steps: bn,
    value: () => k.online.best
  }, {
    id: `a:bot`,
    kind: `bot`,
    steps: yn,
    value: Cn
  }, {
    id: `a:friends`,
    kind: `friends`,
    steps: yn,
    value: () => k.fg
  }, {
    id: `a:speed`,
    kind: `speed`,
    steps: yn,
    value: () => k.fw
  }, {
    id: `a:days`,
    kind: `days`,
    steps: xn,
    value: () => k.ds.best
  }, {
    id: `a:allround`,
    kind: `allround`,
    steps: yn,
    value: () => Math.min(...M.map(e => k.bw[e] ?? 0))
  }];
function wn(e) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}`;
}
function Tn(e = new Date()) {
  let t = wn(e),
    n = k.ds;
  if (n.last === t) return;
  let r = new Date(e);
  r.setDate(r.getDate() - 1), n.cur = n.last === wn(r) ? n.cur + 1 : 1, n.last = t, n.best = Math.max(n.best, n.cur);
}
var G = [{
    id: `e:halloween2026`,
    year: 2026,
    has: () => k.pumpkins >= 18
  }],
  K = e => W.find(t => t.id === e);
function En(e, t) {
  let n = -1;
  return t.forEach((t, r) => e >= t && (n = r)), n;
}
var q = e => En(e.value(), e.steps);
function Dn() {
  let e = W.map(e => ({
    id: e.id,
    tier: q(e)
  })).filter(e => e.tier >= 0);
  for (let t of G) t.has() && e.push({
    id: t.id,
    tier: 0
  });
  return e;
}
var On = e => Dn().some(t => t.id === e),
  kn = e => e.id.startsWith(`e:`) ? 3.5 : e.tier;
function J() {
  let e = Dn();
  return k.pins ? k.pins.filter(t => e.some(e => e.id === t)).slice(0, 3) : e.slice().sort((e, t) => kn(t) - kn(e)).slice(0, 3).map(e => e.id);
}
function An(e, t) {
  if (!On(e)) return !1;
  let n = J().filter(t => t !== e);
  if (t === void 0) {
    if (n.length >= 3) return !1;
    n.push(e);
  } else n.splice(Math.max(0, Math.min(t, n.length)), +(t < n.length), e);
  return k.pins = n.slice(0, 3), A(), !0;
}
function jn(e) {
  k.pins = J().filter(t => t !== e), A();
}
function Mn(e) {
  if (e.startsWith(`e:`)) return e;
  let t = K(e);
  return t ? `${e}:${q(t)}` : e;
}
var Nn = () => J().map(Mn);
function Pn(e) {
  if (!Array.isArray(e)) return null;
  let t = [];
  for (let n of e.slice(0, 3)) if (!(typeof n != `string` || n.length > 24)) {
    if (G.some(e => e.id === n)) t.push({
      id: n,
      tier: 0
    });else {
      let e = /^([am]:[a-z]+):(\d)$/.exec(n);
      e && K(e[1]) && +e[2] < U.length && t.push({
        id: e[1],
        tier: +e[2]
      });
    }
  }
  return t;
}
var Fn = () => J().map(e => ({
    id: e,
    tier: e.startsWith(`e:`) ? 0 : q(K(e))
  })),
  In = () => Object.fromEntries([...W.map(e => [e.id, q(e)]), ...G.map(e => [e.id, e.has() ? 0 : -1])]),
  Ln = () => Object.fromEntries(W.map(e => [e.id, e.value()]));
function Rn(e) {
  let t = e.startsWith(`e:`) ? G.find(t => t.id === e)?.has() ? 0 : -1 : q(K(e));
  return t >= 0 && t > (k.bseen[e] ?? -1);
}
var zn = () => Dn().some(e => Rn(e.id));
function Bn(e) {
  for (let t of Dn()) (!e || t.id === e) && (k.bseen[t.id] = t.tier);
  A();
}
function Vn(e, t, n) {
  let r = In(),
    i = [`a:allround`, n, ...W.map(e => e.id), ...G.map(e => e.id)].filter(Boolean).find(t => (r[t] ?? -1) > (e[t] ?? -1));
  if (i) return {
    id: i,
    up: !0
  };
  if (!n) return null;
  let a = K(n);
  return !a || a.value() === t[n] || q(a) >= a.steps.length - 1 ? null : {
    id: n,
    up: !1
  };
}
var Hn = `ttt-classic-v2`,
  Y = e => e === `classic` ? Hn : `ttt-${e}-v2`,
  Un = [...M, `random`].map(e => Y(e)),
  Wn = e => [...M, `random`].find(t => Y(t) === e) ?? null;
function Gn(e, t, n, r, i) {
  let a = e => M.includes(e);
  if (n === void 0) return `classic`;
  if (e !== `random` && n !== `random`) return i ? e : a(n) ? n : e;
  if (e !== `random`) return e;
  if (n !== `random`) return a(n) ? n : `classic`;
  let o = i ? t : r;
  return a(o) ? o : `classic`;
}
var qn = null,
  Jn = null,
  Yn = null;
async function Xn(e = ``, t) {
  if (Yn && Date.now() - Yn.at < 55e3) return Yn.c;
  try {
    if (!qn) {
      let e = ++Zn;
      qn = (async () => {
        let t = /[?&]net=local\b/.test(location.search) ? vn() : await _n();
        if (e !== Zn) throw t.close(), Error(`stopped`);
        return Jn = t, await t.ready(), t;
      })();
    }
    let n = await qn;
    if (er && n.inLobby && !Qn) try {
      let r = await Promise.race([Promise.all([n.inLobby({
          q: H
        }), ...M.map(e => n.inLobby({
          q: H,
          kind: Y(e)
        }))]), new Promise((e, t) => setTimeout(() => t(Error(`timeout`)), 5e3))]),
        i = r[0],
        a = Object.fromEntries(M.map((e, t) => [e, r[t + 1]]));
      if (e && t) {
        i = Math.max(0, i - t.n);
        let e = Wn(t.kind);
        e && e !== `random` && (a[e] = Math.max(0, a[e] - t.n));
      }
      return Yn = {
        at: Date.now(),
        c: {
          total: i,
          per: a
        }
      }, z(`online`, `counts`, `server`), {
        total: i,
        per: a
      };
    } catch (e) {
      Qn = !0, z(`online`, `counts`, String(e?.message) === `timeout` ? `timeout` : `fallback`);
    }
    let r = [await n.listAllQuick()],
      i = Object.fromEntries(M.map(e => [e, 0])),
      a = 0,
      o = new Set();
    for (let t of r.flat()) {
      if (o.has(t.code)) continue;
      o.add(t.code);
      let n = Wn(String(t.customData?.kind));
      if (n && t.public && !t.hasPassword && t.code !== e) {
        if (t.playerCount >= 2) {
          let e = M.includes(t.customData?.mode) ? t.customData.mode : n === `random` ? `classic` : n;
          i[e] += 2, a += 2;
        } else t.playerCount === 1 && !t.customData?.m && ir(t) && (n !== `random` && (i[n] += 1), a += 1);
      }
    }
    return Yn = {
      at: Date.now(),
      c: {
        total: a,
        per: i
      }
    }, {
      total: a,
      per: i
    };
  } catch {
    return tr(), null;
  }
}
var Zn = 0,
  Qn = !1,
  $n = typeof window < `u` && !!window.__serverMatch,
  er = typeof window < `u` && !!window.__serverCounts;
function tr() {
  Zn++, Jn?.close(), Jn = null, qn = null;
}
function nr(e) {
  return e < 1e3 ? `under-1s` : e < 2e3 ? `1-2s` : e < 3e3 ? `2-3s` : e < 5e3 ? `3-5s` : e < 7e3 ? `5-7s` : e < 1e4 ? `7-10s` : `over-10s`;
}
function rr(e) {
  let t = String(e.createdAt || ``),
    n = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : t + `Z`);
  return n ? Date.now() - n : 0;
}
function ir(e) {
  let t = String(e.createdAt || ``),
    n = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : t + `Z`);
  return !n || Date.now() - n < 24e4;
}
function ar(e) {
  let t = {
      0: [`O`],
      O: [`0`],
      1: [`I`, `L`],
      I: [`1`, `L`],
      L: [`1`, `I`]
    },
    n = [``];
  for (let r of e) {
    let e = [r, ...(t[r] || [])];
    n = n.flatMap(t => e.map(e => t + e)), n.length > 64 && (n = n.slice(0, 64));
  }
  return n.slice(0, 8);
}
var or = [`Neon`, `Pixel`, `Turbo`, `Cosmic`, `Laser`, `Rocket`, `Lucky`, `Swift`, `Glow`, `Retro`, `Hyper`, `Mega`],
  sr = [`Fox`, `Owl`, `Tiger`, `Panda`, `Shark`, `Koala`, `Wolf`, `Otter`, `Falcon`, `Lynx`, `Gecko`, `Dragon`],
  cr = () => or[Math.random() * or.length | 0] + sr[Math.random() * sr.length | 0] + (Math.random() * 90 + 10 | 0),
  lr = {
    bronze: [`#ffc08a`, `#e08a4a`, `#7a3d14`],
    silver: [`#ffffff`, `#cfd8e3`, `#6f7d90`],
    gold: [`#fff4b8`, `#ffd23a`, `#b77700`],
    plat: [`#eafffb`, `#7ff0e2`, `#1f9c90`],
    dia: [`#e6f6ff`, `#6fc6ff`, `#2a49e8`],
    master: [`#f5dcff`, `#c47bff`, `#6a1fc9`],
    gm: [`#ffd6de`, `#ff5577`, `#a30b33`],
    legend: [`#ffffff`, `#ffe066`, `#ff2bd6`]
  },
  ur = e => e < 0 ? `rgba(255,255,255,.5)` : lr[U[e]][1],
  dr = e => {
    let t = U[Math.max(0, Math.min(e, U.length - 1))];
    return t === `legend` ? `linear-gradient(90deg,#ff2bd6,#ffd23a,#3dffb0,#1ff4ff)` : `linear-gradient(90deg,${lr[t][2]},${lr[t][1]})`;
  },
  fr = {
    speed: `<rect x="11" y="1.6" width="4" height="3" rx="1" fill="currentColor"/><circle cx="13" cy="13.4" r="8.6" fill="currentColor"/><path d="M13 8.4v5l3.4 2.3" stroke="#13072f" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M.8 10h3M0 14h3.2M.8 18h3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>`,
    days: `<rect x="2.6" y="4.6" width="18.8" height="17" rx="3.2" fill="currentColor"/><path d="M2.6 10.2h18.8" stroke="#13072f" stroke-width="1.6"/><path d="M7.6 2.4v4.4M16.4 2.4v4.4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="7.6" cy="7.6" r="1.1" fill="#13072f"/><circle cx="16.4" cy="7.6" r="1.1" fill="#13072f"/><path d="M7.8 15.6l2.8 2.8 5.4-5.4" stroke="#13072f" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    allround: `<rect x="2.5" y="2.5" width="8.6" height="8.6" rx="2.2" fill="currentColor"/><rect x="12.9" y="2.5" width="8.6" height="8.6" rx="2.2" fill="currentColor"/><rect x="2.5" y="12.9" width="8.6" height="8.6" rx="2.2" fill="currentColor"/><rect x="12.9" y="12.9" width="8.6" height="8.6" rx="2.2" fill="currentColor"/><path d="M5 5l3.6 3.6M8.6 5L5 8.6M15.4 15.4l3.6 3.6M19 15.4l-3.6 3.6" stroke="#13072f" stroke-width="1.8" stroke-linecap="round"/><circle cx="17.2" cy="6.8" r="2" fill="none" stroke="#13072f" stroke-width="1.7"/><circle cx="6.8" cy="17.2" r="2" fill="none" stroke="#13072f" stroke-width="1.7"/>`,
    streak: `<path d="M12 2.5c1 3.6 5.8 5.8 5.8 11.2A5.8 5.8 0 0 1 6.2 13.7c0-2.6 1.3-4.2 2.6-5.3.1 1.8.9 3 2 3.4-.6-3.4.2-6.6 1.2-9.3z" fill="currentColor"/>`,
    bot: `<rect x="4" y="7" width="16" height="12" rx="4" fill="currentColor"/><circle cx="9" cy="13" r="1.8" fill="#13072f"/><circle cx="15" cy="13" r="1.8" fill="#13072f"/><path d="M12 7V3.5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="3" r="1.6" fill="currentColor"/>`,
    friends: `<circle cx="9" cy="8" r="3.5" fill="currentColor"/><circle cx="17" cy="9" r="2.8" fill="currentColor"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" fill="currentColor"/><path d="M15.5 14.4c3.4-.4 6 1.7 6 5.1h-4.4" fill="currentColor"/>`,
    pumpkin: `<ellipse cx="7.6" cy="14" rx="5.4" ry="7" fill="#e85d0c"/><ellipse cx="16.4" cy="14" rx="5.4" ry="7" fill="#e85d0c"/><ellipse cx="12" cy="14" rx="5.6" ry="7.4" fill="#ff8a1f"/><path d="M12 6.8q.4-3 2.6-4" stroke="#3dffb0" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7.6 12.4l1.8-2.6 1.8 2.6zM12.8 12.4l1.8-2.6 1.8 2.6zM7.4 16q4.6 3 9.2 0l-1.4.5-1.1 1-1.2-1-1.2 1-1.1-1z" fill="#fff27a"/>`
  },
  pr = (e, t) => `<g transform="translate(30.8 36.8) scale(1.6)" style="color:${t}">${fr[e]}</g>`;
function mr(e, t) {
  let n = e.startsWith(`m:`) ? e.slice(2) : ``;
  if (n === `classic`) return `<path d="M42 40v32M58 40v32M34 48h32M34 64h32" stroke="${t}" stroke-width="4.5" stroke-linecap="round"/>`;
  if (n === `infinity`) return `<text x="50" y="66" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="40" fill="${t}">∞</text>`;
  if (n) {
    let e = {
      four: 4,
      five: 5,
      six: 6
    }[n] ?? 3;
    return `<text x="50" y="63" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="21" fill="${t}">${e}×${e}</text>`;
  }
  return e.startsWith(`e:`) ? pr(`pumpkin`, t) : pr(e.slice(2), t);
}
var hr = `50,4 92,28 92,80 50,104 8,80 8,28`,
  gr = `50,20 78,36 78,72 50,88 22,72 22,36`,
  _r = (e, t, n, r) => `<path d="M${e} ${t - n}Q${e} ${t} ${e + n} ${t}Q${e} ${t} ${e} ${t + n}Q${e} ${t} ${e - n} ${t}Q${e} ${t} ${e} ${t - n}Z" fill="${r}"/>`,
  vr = 0;
function yr(e, t, n, r = !1) {
  let i = Math.round(n * 128 / 112),
    a = e => `<svg class="bdg ${e}" viewBox="-6 -10 112 128" width="${n}" height="${i}" aria-hidden="true">`;
  if (e.startsWith(`e:`)) {
    let n = G.find(t => t.id === e);
    if (t < 0) return `${a(`locked`)}<polygon points="${hr}" fill="rgba(255,255,255,.05)" stroke="rgba(255,138,31,.45)" stroke-width="3" stroke-dasharray="7 6"/><g opacity=".35">${pr(`pumpkin`, `#fff`)}</g></svg>`;
    let i = `bg` + ++vr;
    return `${a(`t-event` + (r ? ` anim` : ``))}<defs><linearGradient id="${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb35c"/><stop offset=".5" stop-color="#ff7a1a"/><stop offset="1" stop-color="#6a1fc9"/></linearGradient></defs>
<path d="M14 30 L2 18 L18 20 Z M86 30 L98 18 L82 20 Z" fill="#6a1fc9"/><polygon points="${hr}" fill="url(#${i})" stroke="#ffd29a" stroke-width="3" stroke-linejoin="round"/><polygon points="${gr}" fill="#13072f" opacity=".95" stroke="#ffd29a" stroke-width="1.5"/>${pr(`pumpkin`, `#fff`)}
<path d="M14 92 L86 92 L80 106 L86 118 L14 118 L20 106 Z" fill="#6a1fc9" stroke="#ffd29a" stroke-width="2" stroke-linejoin="round"/><text x="50" y="110" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="#ffd29a">${n?.year ?? ``}</text></svg>`;
  }
  if (t < 0) return `${a(`locked`)}<polygon points="${hr}" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-dasharray="7 6"/>${mr(e, `rgba(255,255,255,.3)`)}</svg>`;
  let o = U[Math.min(t, U.length - 1)],
    [s, c, l] = lr[o],
    u = `bg` + ++vr,
    d = o === `legend` ? `<linearGradient id="${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2bd6"/><stop offset=".25" stop-color="#ffd23a"/><stop offset=".5" stop-color="#3dffb0"/><stop offset=".75" stop-color="#1ff4ff"/><stop offset="1" stop-color="#8a6bff"/></linearGradient>` : `<linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${l}"/></linearGradient>`,
    f = ``;
  t >= 4 && (f += _r(10, 12, 7, s) + _r(93, 92, 6, s)), t >= 5 && (f += `<path d="M2 40 Q-6 66 14 92" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M98 40 Q106 66 86 92" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`), t >= 6 && (f += `<path d="M30 6 L36 -8 L44 2 L50 -10 L56 2 L64 -8 L70 6 Z" fill="url(#${u})" stroke="${s}" stroke-width="2" stroke-linejoin="round"/>`);
  let p = t >= 2 ? `<path d="M22 22 L40 12 L30 70 L16 76 Z" fill="#fff" opacity=".22"/>` : ``;
  return `${a(`t-` + o + (r ? ` anim` : ``))}<defs>${d}</defs>${f}<polygon points="${hr}" fill="url(#${u})" stroke="${s}" stroke-width="3" stroke-linejoin="round"/>${p}<polygon points="${gr}" fill="#13072f" opacity=".95" stroke="${s}" stroke-width="1.5" stroke-linejoin="round"/>${mr(e, o === `legend` ? `#fff` : s)}</svg>`;
}
var br = (e, t, n = !1) => yr(e.id, e.tier, t, n);
function X(e, t, n = !1) {
  let r = K(e);
  return yr(e, r ? q(r) : G.find(t => t.id === e)?.has() ? 0 : -1, t, n);
}
function Z(e) {
  return e.startsWith(`m:`) ? b(`mode.` + e.slice(2)) : e.startsWith(`e:`) ? b(`bd.halloween`) : b(`bd.` + e.slice(2));
}
var Q = e => e < 0 ? `` : b(`bd.t.` + U[e]),
  xr = [`classic`, `infinity`, `five`, `six`],
  Sr = 380,
  Cr = 3,
  $ = e => document.getElementById(e),
  wr = e => new Promise(t => setTimeout(t, e)),
  Tr = e => e.replace(/[&<>"']/g, e => `&#${e.charCodeAt(0)};`),
  Er = new class {
    constructor() {
      this.history = [], this.first = 1, this.score = {
        1: 0,
        2: 0,
        d: 0
      }, this.busy = !1, this.secondUsed = !1, this.roundTouched = !1, this.endSnap = null, this.botTimer = 0, this.token = 0, this.cells = [], this.handTimer = 0, this.rounds = 0, this.side = k.playAs, this.onlineMode = `classic`, this.online = null, this.onlineCta = ``, this.oppTimer = 0, this.oppLeft = !1, this.run = null, this.runHow = ``, this.interacted = !1, this.paint = new Map(), this.paintStep = 0, this.hintCell = -1, this.undoPending = !1, this.bPill = null, this.bPillFrom = null, this.bPillAnim = !1, this.rvIds = [], this.rvSeen = new Set(), this.rvGains = {
        earned: 0,
        pumpkin: 0
      }, this.resultDoubled = !1, this.secondPending = !1, this.styleTab = `pieces`, this.styleGridH = 0, this.styleGridKey = ``, this.lookId = 0, this.lookTimer = 0, this.lookBucket = ``, this.pending = null, this.searchTimer = 0, this.searching = !1, this.searchStoppedHidden = !1, this.hiddenAt = 0, this.searchEnd = 0, this.searchSrc = ``, this.bgTick = 0, this.foundTimers = [], this.foundFor = null, this.searchWant = `classic`, this.searchRetryTimes = [], this.inviteMode = null, this.inviteBg = null, this.inviteSes = null, this.inviteT0 = 0, this.fromInvite = !1, this.inviteRounds = 0, this.inviteSteps = new Set(), this.inviteStarted = !1, this.inviteDone = !1, this.joinT0 = 0, this.preMatchOn = !1, this.preTimers = [], this.moveTick = 0, this.thinkMs = 0, this.thinkN = 0, this.myTurnAt = 0, this.reshowOnlineResult = null, this.statsTab = `bot`, this.statsH = 0, this.statsProbe = !1, this.ostatsTab = `stats`, this.toastTimer = 0;
    }
    shape(e) {
      return e === 1 ? this.side : this.side === 1 ? 2 : 1;
    }
    colOf(e) {
      return this.shape(e) === 1 ? this.skin.x : this.skin.o;
    }
    get mode() {
      return this.online ? Ke[this.onlineMode] : Ke[k.mode];
    }
    get skin() {
      return ge(k.skin);
    }
    get vsBot() {
      return k.vsBot && !this.online;
    }
    name(e) {
      return this.online ? e === 1 ? b(`you`) : this.online.oppName || `…` : this.vsBot ? b(e === 1 ? `you` : `bot`) : b(e === 1 ? `p1` : `p2`);
    }
    init() {
      k.vsBot || (k.vsBot = true, A());
      $('bSkins').innerHTML = d.palette + '<span class="sl"></span>';
      $('bHelp').innerHTML = d.dice;
      $('bStats').innerHTML = d.stats;
      $('pl1').classList.add('tap');
      $('pl1').setAttribute('role', 'button');
      $('bLang').onclick = () => {
        S.click();
        this.showLang();
      };
      $('pl1').onclick = () => {
        S.click();
        this.showPlayAs();
      };
      $('bStats').onclick = () => {
        S.click();
        this.showStats();
      };
      $('bSkins').onclick = () => {
        S.click();
        this.styleTab = 'pieces';
        this.showSkins();
      };
      $('bHelp').onclick = () => {
        S.click();
        this.showModePick('native');
      };
      $('bSound').onclick = () => {
        k.sound = !k.sound;
        S.setEnabled(k.sound);
        A();
        this.renderSoundBtn();
        S.click();
      };
      this.renderTexts();
      this.renderSoundBtn();
      this.renderControls();
      this.applySkin();
      this.applyBg();
      document.addEventListener('visibilitychange', () => S.setDucked(document.hidden));
      this.openGame(false);
    }
    renderTexts() {
      Ge();
      $('pl1').setAttribute('aria-label', b('playAs'));
      $('drLabel').textContent = b('draws');
      $('bLang').innerHTML = Zt(y());
      $('bSkins').querySelector('.sl').textContent = b('style');
      $('bLang').setAttribute('aria-label', b('language'));
    }
    showLang() {
      let e = !!document.querySelector(`#overlay .result`),
        t = y(),
        n = Gt.map(e => `<button class="lg${e.id === t ? ` cur` : ``}" data-lang="${e.id}">${Zt(e.id)}<span>${e.name}</span>${e.id === t ? `<i class="ok">✓</i>` : ``}</button>`).join(``);
      this.openOverlay(`<div class="card panel langp" style="--c:var(--cyan)"><button class="x" id="bClose" aria-label="${b(`close`)}">${d.close}</button><h2>${b(`language`)}</h2><div class="lgs">${n}</div></div>`), document.querySelector(`.langp .lg.cur`)?.scrollIntoView({
        block: `nearest`
      });
      let r = () => e && this.s.result ? this.reopenResultAsNext() : this.closeOverlay();
      $(`bClose`).onclick = () => (S.click(), r()), document.querySelectorAll(`#overlay [data-lang]`).forEach(e => {
        e.onclick = () => {
          S.click();
          let t = e.dataset.lang,
            n = y();
          z(`language-switch`, n === t ? `${t}-same` : `${n}-${t}`, ee() ? `chosen` : `auto`), te(t), re(t), z(`language`, t, `select`), this.renderTexts(), this.renderControls(), this.renderScore(), this.s.result || this.renderStatus(!1), r();
        };
      }), z(`language`, `panel`, `visible`);
    }
    renderSoundBtn() {
      $(`bSound`).innerHTML = k.sound ? d.soundOn : d.soundOff;
    }
    applySkin() {
      let e = this.skin;
      document.documentElement.style.setProperty(`--c1`, this.colOf(1)), document.documentElement.style.setProperty(`--c2`, this.colOf(2)), $(`pl1`).querySelector(`.pm`).innerHTML = E(e, this.shape(1));
      let t = e.id === `rainbow` && this.vsBot;
      $(`pl2`).querySelector(`.pm`).innerHTML = E(e, this.shape(2), t ? `steady` : ``, t ? ve : void 0);
      let n = $(`bSkins`);
      n.classList.toggle(`on-new`, this.hasNew());
      let r = this.eventOpen();
      n.classList.toggle(`evb`, r), r && !n.querySelector(`.bdg`) && n.insertAdjacentHTML(`beforeend`, `<span class="bdg">${d.pumpkin}</span>`), r || n.querySelector(`.bdg`)?.remove();
    }
    hasNew(e) {
      return e === `badge` ? zn() : k.owned.some(t => !k.seenSkins.includes(t) && (!e || e === `bg` === D(t))) || !e && zn();
    }
    applyBg() {
      Vt(k.bg);
    }
    preview(e, t = ``) {
      if (D(e)) return Ht(e);
      let n = ge(e);
      return E(n, 1, t) + E(n, 2, t);
    }
    renderControls() {
      for (let [e, t] of [[`modes`, `mode`], [`opp`, `oppLabel`], [`levels`, `level`]]) {
        let n = $(e),
          r = n.previousElementSibling;
        (!r || !r.classList.contains(`clab`)) && (r = document.createElement(`div`), r.className = `clab`, r.dataset.for = e, n.before(r)), r.textContent = b(t), r.classList.toggle(`hidden`, e === `levels` && !this.vsBot);
      }
      let e = $(`modes`);
      e.innerHTML = ``;
      let t = this.online ? this.onlineMode : k.mode;
      for (let t of xr) {
        let n = document.createElement(`button`),
          r = t === `infinity` && !k.seenInfinity;
        n.className = `chip` + ((this.online ? t === this.onlineMode : k.mode === t) ? ` sel` : ``) + (r ? ` has-new` : ``), n.dataset.mode = t, n.innerHTML = `<span>${b(`mode.` + t)}</span>${r ? `<i class="ntag">${b(`newTag`)}</i>` : ``}`, n.onclick = () => this.changeConfig({
          mode: t
        }), e.appendChild(n);
      }
      let n = document.createElement(`button`),
        r = !xr.includes(t);
      n.className = `chip more` + (r ? ` sel` : ``), n.dataset.mode = `more`, n.innerHTML = `<span>${b(r ? `mode.` + t : `mode.more`)}</span>${d.chev}`, n.onclick = () => (S.click(), z(`mode-pick`, `more`, `click`), this.showModePick(`more`)), e.appendChild(n), Ge();
      let i = $(`opp`);
      i.innerHTML = ``;
      for (let e of [!0, !1]) {
        let t = document.createElement(`button`);
        t.className = (this.online ? !e : k.vsBot === e) ? `sel` : ``, t.dataset.opp = e ? `bot` : `two`, t.innerHTML = `${e ? d.bot : d.two}<span>${b(e ? `opp.bot` : `opp.two`)}</span>`, t.onclick = () => e ? this.changeConfig({
          vsBot: e
        }) : this.showTwoChoice(), e || void 0, i.appendChild(t);
      }
      let a = $(`levels`);
      a.innerHTML = ``, a.classList.toggle(`hidden`, !this.vsBot);
      for (let e of tt) {
        let t = document.createElement(`button`);
        t.className = k.level === e ? `sel` : ``, t.dataset.level = e, t.textContent = b(`level.` + e), t.onclick = () => this.changeConfig({
          level: e
        }), a.appendChild(t);
      }
    }
    async changeConfig(e) {
      if (false) return;
      if (this.online) {
        if (e.mode === this.onlineMode && e.vsBot === void 0 && e.level === void 0) return;
        if (this.online.started && !this.s.result && !this.oppLeft && !e.confirmed) return void 0;
        void 0, e.mode && (k.mode = e.mode), e.vsBot !== void 0 && (k.vsBot = e.vsBot), e.level && (k.level = e.level), A(), this.renderControls(), z(`config`, this.gameKey(), `select`), this.startRun();
        let t = !!this.s?.result;
        return t && z(`break`, `after-match`, `leave-online`), this.openGame(t);
      }
      if ((e.mode ?? k.mode) === k.mode && (e.vsBot ?? k.vsBot) === k.vsBot && (e.level ?? k.level) === k.level) return;
      S.click();
      let t = this.roundTouched && !this.s.result,
        n = !!this.s?.result;
      n && z(`break`, `after-match`, `switch`), this.saveGame(), e.mode && (k.mode = e.mode), e.vsBot !== void 0 && (k.vsBot = e.vsBot), e.level && (k.level = e.level), A(), this.renderControls(), z(`config`, this.gameKey(), `select`), this.startRun(), await this.openGame(t || n);
    }
    startRun() {
      let e = this.runHow || `other`;
      this.runHow = ``, this.run = this.online ? null : {
        key: this.gameKey(),
        tag: `${e}-${k.mode}`,
        n: 0
      };
    }
    countRun() {
      if (this.online) return;
      let e = this.gameKey();
      this.run || (this.run = {
        key: e,
        tag: `start-${k.mode}`,
        n: 0
      }), this.run.key === e && (this.run.n++, [1, 3, 5, 10].includes(this.run.n) && z(`pick-run`, this.run.tag, `r` + this.run.n));
    }
    gameKey() {
      return this.online ? `${this.onlineMode}-online` : `${k.mode}-${k.vsBot ? k.level : `two`}`;
    }
    saveGame() {
      if (!this.s || this.online) return;
      let e = le(`games`, {}),
        t = {
          score: {
            ...this.score
          },
          first: this.first
        };
      !this.s.result && this.s.moves > 0 && (t.round = {
        s: this.s,
        history: this.history,
        secondUsed: this.secondUsed,
        roundTouched: this.roundTouched,
        side: this.side,
        paint: [...this.paint],
        paintStep: this.paintStep
      }), e[this.gameKey()] = t, ue(`games`, e);
    }
    async openGame(e) {
      let t = le(`games`, {})[this.gameKey()];
      this.score = t?.score ? {
        ...t.score
      } : {
        1: 0,
        2: 0,
        d: 0
      }, this.first = t?.first ?? 1;
      let n = t?.round;
      if (!n || n.s.mode.id !== k.mode) return this.newRound(e);
      this.token++, clearTimeout(this.botTimer), this.closeOverlay(), e && (this.busy = !0, await void 0), this.busy = !1;
      let r = e => ({
        ...e,
        mode: Ke[e.mode.id]
      });
      this.s = r(n.s), this.history = n.history.map(r), this.secondUsed = n.secondUsed, this.roundTouched = n.roundTouched, this.endSnap = null, this.hintCell = -1, this.side = n.side, this.paint = new Map(n.paint), this.paintStep = n.paintStep, this.applySkin(), this.buildBoard(), this.cells.forEach((e, t) => this.drawCell(t, !1)), this.markDimmed(), this.renderScore(), this.renderStatus(!1), z(`round`, this.gameKey(), `resume`), this.botTurn() && this.scheduleBot(), this.syncGameplay();
    }
    async newRound(e) {
      this.token++, clearTimeout(this.botTimer), this.closeOverlay(), this.busy = !0, e && (await void 0), this.busy = !1, this.hintCell = -1, this.side !== k.playAs && (this.side = k.playAs, this.applySkin()), k.bintro || setTimeout(() => this.maybeBadgeIntro(), 700), this.paint.clear(), this.paintStep = 0, this.s = Ze(this.mode, this.first), this.history = [], this.secondUsed = !1, this.roundTouched = !1, this.endSnap = null, this.rounds++, this.buildBoard(), this.renderScore(), this.renderStatus(!0), z(`round`, this.gameKey(), `start`), this.mode.keep && !k.seenInfinity && (k.seenInfinity = !0, this.renderControls(), A(), this.toast(b(`modeInfo.infinity`), 3200)), this.saveGame(), this.botTurn() ? this.scheduleBot() : this.armHand();
    }
    botTurn() {
      return this.vsBot && this.s.turn === 2 && !this.s.result;
    }
    syncGameplay() {}
    buildBoard() {
      let e = this.mode.size,
        t = $(`board`);
      t.innerHTML = ``, t.className = `board live` + (e >= 4 ? ` small` : ``), t.style.setProperty(`--n`, String(e));
      for (let n = 1; n < e; n++) {
        let r = 3.5 + 93 * n / e,
          i = document.createElement(`div`);
        i.className = `gl`, i.style.cssText = `left:calc(${r}% - 2px);top:5.5%;bottom:5.5%;width:4px`;
        let a = document.createElement(`div`);
        a.className = `gl`, a.style.cssText = `top:calc(${r}% - 2px);left:5.5%;right:5.5%;height:4px`, t.append(i, a);
      }
      this.cells = [];
      for (let n = 0; n < e * e; n++) {
        let r = document.createElement(`button`);
        r.className = `cell free`, r.dataset.i = String(n), r.setAttribute(`aria-label`, `${(n / e | 0) + 1}-${n % e + 1}`), r.addEventListener(`pointerdown`, e => {
          e.preventDefault(), this.tap(n);
        }), r.addEventListener(`pointerenter`, e => {
          e.pointerType !== `mouse` || this.s.cells[n] || this.s.result || this.busy || this.botTurn() || this.online && this.s.turn !== 1 || r.querySelector(`.mk`) || r.insertAdjacentHTML(`beforeend`, E(this.skin, this.shape(this.s.turn), `ghost`));
        }), r.addEventListener(`pointerleave`, () => r.querySelector(`.mk.ghost:not(.hint)`)?.remove()), t.appendChild(r), this.cells.push(r);
      }
    }
    tap(e) {
      if (S.unlock(), !(false || this.busy || this.s.result || this.botTurn() || $(`overlay`).classList.contains(`on`)) && !(this.online && this.s.turn !== 1) && !this.preMatchOn) {
        if (this.s.cells[e] !== 0) {
          let t = this.cells[e];
          t.classList.remove(`nope`), t.offsetWidth, t.classList.add(`nope`);
        } else this.move(e);
      }
    }
    move(e) {
      this.clearHint(), document.querySelectorAll(`#board .mk.ghost`).forEach(e => e.remove());
      let t = this.s.turn;
      this.online && t === 1 && (this.online.move(e, this.s.moves), this.myTurnAt && (this.thinkMs += Date.now() - this.myTurnAt, this.thinkN++, this.myTurnAt = 0)), this.history.push(this.s), this.s = N(this.s, e), !this.roundTouched && !(this.vsBot && t === 2) && (this.roundTouched = !0, k.firstMoveDone || (k.firstMoveDone = !0, A(), z(`onboarding`, `first-move`, `complete`))), this.hideHand(), this.syncGameplay(), S.place(t), this.paint.delete(e), this.drawCell(e, !0);
      let n = this.cells[e];
      n.classList.remove(`ping`), n.offsetWidth, n.classList.add(`ping`);
      let r = n.getBoundingClientRect();
      if (Pe.sparks(r.left + r.width / 2, r.top + r.height / 2, this.paintOf(e) ?? this.colOf(t), this.mode.size === 3 ? 14 : 9), this.s.vanished >= 0) {
        let e = this.s.vanished,
          t = this.cells[e].querySelector(`.mk`);
        S.vanish(), t && (t.classList.remove(`dimmed`), t.classList.add(`gone`)), setTimeout(() => {
          this.s.cells[e] === 0 && this.drawCell(e, !1);
        }, 380);
      }
      if (this.markDimmed(), this.s.result) return void this.endRound();
      this.saveGame(), this.renderStatus(!1), this.botTurn() && this.scheduleBot(), void 0;
    }
    drawCell(e, t) {
      let n = this.cells[e],
        r = this.s.cells[e];
      n.classList.toggle(`free`, r === 0), n.querySelector(`.mk`)?.remove(), r && n.insertAdjacentHTML(`beforeend`, E(this.skin, this.shape(r), t ? `new` : ``, this.paintOf(e)));
    }
    paintOf(e) {
      if (this.skin.id === `rainbow`) return this.vsBot && this.s.cells[e] === 2 ? ve : (this.paint.has(e) || this.paint.set(e, this.paintStep++), _e[this.paint.get(e) % _e.length]);
    }
    markDimmed() {
      for (let e of this.cells) e.querySelector(`.mk.dimmed`)?.classList.remove(`dimmed`);
      if (!this.mode.keep || this.s.result) return;
      let e = $e(this.s, this.s.turn);
      e >= 0 && this.cells[e].querySelector(`.mk`)?.classList.add(`dimmed`);
    }
    friendly() {
      if (!this.vsBot || k.level !== `easy` || k.mode !== `classic` && k.mode !== `infinity`) return !1;
      let e = k.stats[`${k.mode}-easy`];
      return !e || e.w + e.l + e.d < Cr;
    }
    scheduleBot() {
      this.busy = !0, this.renderUndo();
      let e = this.token,
        t = Sr + Math.random() * 300;
      this.botTimer = window.setTimeout(() => {
        if (e !== this.token) return;
        if (false) return void (this.botTimer = window.setTimeout(() => this.scheduleBot(), 300));
        let t = it(this.s, k.level, Math.random, this.friendly());
        this.busy = !1, t >= 0 && this.move(t);
      }, t);
    }
    renderStatus(e) {
      let t = $(`status`),
        n = $(`sub`),
        r = this.s.turn,
        i;
      i = this.online ? b(r === 1 ? `turn.you` : `on.theirTurn`) : this.vsBot ? b(r === 1 ? `turn.you` : `turn.bot`) : this.name(r), t.textContent = i, t.classList.toggle(`two`, (this.vsBot || !!this.online) && r === 2), t.style.setProperty(`--sc`, r === 1 ? `var(--c1)` : `var(--c2)`), $(`board`).style.setProperty(`--sc`, r === 1 ? `var(--c1)` : `var(--c2)`), t.classList.remove(`pop`), t.offsetWidth, t.classList.add(`pop`), n.textContent = ``, Ge(), $(`pl1`).classList.toggle(`on`, r === 1), $(`pl2`).classList.toggle(`on`, r === 2), this.renderUndo();
    }
    canUndo() {
      return false;
    }
    renderUndo() {}
    canHint() {
      return false;
    }
    clearHint() {
      if (this.hintCell < 0) return;
      let e = this.cells[this.hintCell];
      e?.classList.remove(`hinted`), e?.querySelector(`.mk.hint`)?.remove(), this.hintCell = -1;
    }
    renderScore(e) {
      $(`pl1`).querySelector(`.pn`).textContent = this.name(1), $(`pl2`).querySelector(`.pn`).textContent = this.name(2), this.renderCardBadges(), Ge();
      let t = $(`pl1`).querySelector(`.ps`),
        n = $(`pl2`).querySelector(`.ps`);
      t.textContent = String(this.score[1]), n.textContent = String(this.score[2]), $(`sDraw`).textContent = String(this.score.d);
      let r = e === 1 ? t : e === 2 ? n : e === `d` ? $(`sDraw`) : null;
      r && (r.classList.remove(`bump`), r.offsetWidth, r.classList.add(`bump`));
      let i = $(`streak`),
        a = Ae(k.mode, k.level).cur;
      i.classList.toggle(`on`, this.vsBot && a >= 1), i.innerHTML = `${d.flame}<span>${a}</span>`, i.setAttribute(`aria-label`, b(`streakTip`, {
        n: a
      })), i.onclick = () => this.toast(b(`streakTip`, {
        n: a
      }), 2e3);
    }
    renderCardBadges() {
      let e = (e, t) => {
        let n = $(e);
        n.querySelector(`.pbd`)?.remove(), n.classList.toggle(`hasb`, !!t?.length), t?.length && n.insertAdjacentHTML(`beforeend`, `<span class="pbd" aria-hidden="true">${t.map(e => br(e, 22)).join(``)}</span>`);
      };
      e(`pl1`, !this.online && !this.vsBot ? null : Fn()), e(`pl2`, this.online ? this.online.oppBadges : null);
    }
    badgeTier(e) {
      let t = K(e);
      return t ? q(t) : G.find(t => t.id === e)?.has() ? 0 : -1;
    }
    badgePillFinal(e) {
      let t = this.bPill,
        n = this.badgeTier(t.id);
      if (t.up) {
        let r = t.id.startsWith(`e:`),
          i = r ? `#ffb35c` : ur(n),
          a = e ? `button` : `div`;
        return `<${a} class="bpill up" id="bPill" style="--tc:${i}">${X(t.id, 26)}<em>${b(`newTag`)}</em><b>${r ? Z(t.id) : Q(n)}</b><small>${r ? b(`bd.limited`) : Z(t.id)}</small></${a}>`;
      }
      let r = K(t.id),
        i = r.value(),
        a = n < 0 ? 0 : r.steps[n],
        o = r.steps[n + 1],
        s = Math.max(4, Math.min(100, (i - a) / Math.max(1, o - a) * 100));
      return `<div class="bpill" id="bPill">${X(t.id, 26)}<span class="bb"><i style="width:${s.toFixed(1)}%;background:${dr(n + 1)}"></i></span><small>${i} / ${o}</small></div>`;
    }
    badgePill(e) {
      let t = this.bPill;
      if (!t) return ``;
      let n = K(t.id);
      if (!this.bPillAnim || !n || this.bPillFrom === null) return this.badgePillFinal(e);
      let r = this.badgeTier(t.id),
        i = t.up ? r : r + 1,
        a = i <= 0 ? 0 : n.steps[i - 1],
        o = n.steps[i],
        s = n.value(),
        c = e => Math.max(4, Math.min(100, (e - a) / Math.max(1, o - a) * 100)),
        l = Math.max(a, Math.min(this.bPillFrom, s)),
        u = Math.max(2, Math.min(c(l), c(s) - 14));
      return `<div class="bpill" id="bPill" data-to="${c(s).toFixed(1)}" data-v="${Math.min(s, o)} / ${o}">${yr(t.id, i - 1, 26)}<span class="bb"><i style="width:${u.toFixed(1)}%;background:${dr(i)}"></i></span><small>${l} / ${o}</small></div>`;
    }
    wireBadgePill(e, t = !0) {
      let n = () => {
          let t = document.getElementById(`bPill`);
          if (t && t.tagName === `BUTTON` && this.bPill) {
            let n = this.bPill.id;
            t.onclick = () => (S.click(), z(`badge`, `pill`, `click`), this.showBadge(n, e));
          }
        },
        r = document.getElementById(`bPill`);
      if (!this.bPill || !r) return;
      if (!this.bPillAnim || !r.dataset.to) {
        this.bPillAnim = !1, n(), this.bPill.up && setTimeout(() => S.unlockFanfare(), 350);
        return;
      }
      this.bPillAnim = !1;
      let i = this.bPill.up,
        a = r.querySelector(`.bb i`);
      setTimeout(() => {
        r.isConnected && (r.classList.add(`go`), a.style.width = `${r.dataset.to}%`);
      }, 650), setTimeout(() => {
        if (r.isConnected) {
          if (r.querySelector(`small`).textContent = r.dataset.v, r.classList.add(`done`), !i) return n();
          setTimeout(() => {
            r.isConnected && this.bPill && (r.outerHTML = this.badgePillFinal(t), S.unlockFanfare(), n());
          }, 450);
        }
      }, 1550);
    }
    showBadge(e, t) {
      let n = K(e),
        r = G.find(t => t.id === e),
        i = this.badgeTier(e),
        a = i >= 0,
        o = r ? `#ffb35c` : ur(i),
        s = ``,
        c = ``,
        l = ``;
      if (n) {
        let t = n.value(),
          r = `${b(`bd.v.` + n.kind, {
            n: t
          })}${n.kind === `mode` || n.kind === `speed` || n.kind === `allround` ? `<i class="dglobe" aria-label="${b(`on.online`)}">${d.globe}</i>` : ``}`;
        s = a ? `${Z(e)} · ${r}` : r;
        let o = n.steps[i + 1];
        if (o !== void 0) {
          let e = i < 0 ? 0 : n.steps[i];
          c = `<div class="dbar"><i style="width:${Math.max(0, Math.min(100, (t - e) / Math.max(1, o - e) * 100)).toFixed(1)}%;background:${dr(i + 1)}"></i></div><div class="dn">${t} / ${o} → ${Q(i + 1)}</div>`;
        } else c = `<div class="dn">${b(`bd.max`)}</div>`;
        let u = document.body.classList.contains(`land`) ? 36 : 30;
        l = `<div class="dlad">${n.steps.map((t, n) => `<div class="${n === i ? `cur` : ``}">${yr(e, n <= i ? n : -1, u)}<span>${t}</span></div>`).join(``)}</div>`;
      } else r && (s = a ? `${r.year} · ${b(`bd.limited`)}` : b(`bd.how.event`));
      let u = a ? r ? Z(e) : Q(i) : Z(e),
        f = !a && n ? `<div class="dhow">${b(`bd.how.` + n.kind, {
          mode: n.mode ? b(`mode.` + n.mode) : ``,
          n: n.steps[0]
        })}</div>` : ``,
        p = J().includes(e),
        m = a ? `<button class="btn${p ? ` ghost2` : ``}" id="bBdSel">${b(p ? `bd.remove` : `bd.select`)}</button>` : ``;
      this.openOverlay(`<div class="card panel bdet" style="--c:${a ? o : `var(--line)`}"><button class="x" id="bClose" aria-label="${b(`close`)}">${d.close}</button>
      <div class="dbig">${X(e, 120, !0)}</div><h2 style="${a ? `color:${o}` : ``}">${u}</h2><div class="dsub">${s}</div>${f}${c}${l}
      <div class="dbtns"><button class="btn ghost2" id="bBdBack">${b(`bd.back`)}</button>${m}</div></div>`), this.fitOverlay(), a && Rn(e) && Bn(e);
      let h = () => (S.click(), t());
      $(`bClose`).onclick = h, $(`bBdBack`).onclick = h;
      let g = document.getElementById(`bBdSel`);
      g && (g.onclick = () => {
        if (S.click(), p) jn(e), z(`badge`, `unpin`, e);else if (An(e)) z(`badge`, `pin`, e);else return this.showReplace(e, t);
        this.renderCardBadges(), t();
      }), z(`badge`, `detail`, e);
    }
    showReplace(e, t) {
      let n = J().map((e, t) => `<button class="s3" data-slot="${t}">${X(e, 62)}<span>${t + 1}</span></button>`).join(``);
      this.openOverlay(`<div class="card panel bdet" style="--c:var(--cyan)"><div class="dbig sm">${X(e, 84)}</div><h2>${b(`bd.replace`)}</h2><div class="slots3">${n}</div>
      <div class="dbtns"><button class="btn ghost2" id="bBdBack">${b(`bd.back`)}</button></div></div>`), this.fitOverlay(), $(`bBdBack`).onclick = () => (S.click(), this.showBadge(e, t)), document.querySelectorAll(`#overlay [data-slot]`).forEach(n => {
        n.onclick = () => {
          S.click(), An(e, +n.dataset.slot), z(`badge`, `pin`, e), this.renderCardBadges(), t();
        };
      });
    }
    badgeTiles() {
      let e = J(),
        t = t => {
          let n = this.badgeTier(t),
            r = t.startsWith(`e:`),
            i = e.indexOf(t),
            a = n < 0 || r ? Z(t) : Q(n),
            o = n < 0 ? K(t) ? `0 / ${K(t).steps[0]}` : b(`bd.limited`) : r ? `<span class="lim">${b(`bd.limited`)}</span>` : Z(t);
          return `<button class="bi${r && n >= 0 ? ` ev` : ``}${i >= 0 ? ` pinned` : ``}" data-bd="${t}">${Rn(t) ? `<span class="newtag">${b(`newTag`)}</span>` : ``}${i >= 0 ? `<i class="slot">${i + 1}</i>` : ``}${X(t, 46)}<b style="${n >= 0 ? `color:${r ? `#ffb35c` : ur(n)}` : ``}">${a}</b><span>${o}</span></button>`;
        },
        n = W.filter(e => e.kind === `mode`).map(e => t(e.id)).join(``),
        r = W.filter(e => e.kind !== `mode`).map(e => t(e.id)).join(``),
        i = G.map(e => t(e.id)).join(``);
      return `<h3>${b(`bd.modes`)}</h3><div class="bgx">${n}</div><h3>${b(`bd.ach`)}</h3><div class="bgx">${r}</div><h3>${b(`bd.events`)}</h3><div class="bgx">${i}</div>`;
    }
    maybeBadgeIntro() {
      if (k.bintro || $(`overlay`).classList.contains(`on`) || this.online || this.searching || this.pending || this.preMatchOn) return !1;
      k.bintro = !0;
      let e = Dn();
      if (!e.length) return Bn(), !1;
      let t = e.slice().sort((e, t) => (t.id.startsWith(`e:`) ? 3.5 : t.tier) - (e.id.startsWith(`e:`) ? 3.5 : e.tier)).slice(0, 3);
      return this.openOverlay(`<div class="card panel bintro" style="--c:var(--gold)"><button class="x" id="bClose" aria-label="${b(`close`)}">${d.close}</button><h2>${b(`bd.intro`)}</h2><div class="ssub">${b(`bd.introSub`)}</div>
      <div class="bwg">${t.map(e => {
        let t = e.id.startsWith(`e:`);
        return `<div>${X(e.id, 56)}<b style="color:${t ? `#ffb35c` : ur(e.tier)}">${t ? Z(e.id) : Q(e.tier)}</b><span>${t ? G.find(t => t.id === e.id).year : Z(e.id)}</span></div>`;
      }).join(``)}</div><button class="btn pulse" id="bBdShow">${b(`bd.show`)}</button></div>`), this.fitOverlay(), A(), $(`bClose`).onclick = () => (S.click(), Bn(), this.closeOverlay()), $(`bBdShow`).onclick = () => {
        S.click(), this.styleTab = `badges`, this.showSkins();
      }, z(`badge`, `intro`, String(e.length)), !0;
    }
    async endRound() {
      this.busy = !0;
      let e = this.token,
        t = this.s,
        n = $(`board`);
      n.classList.remove(`live`), $(`pl1`).classList.remove(`on`), $(`pl2`).classList.remove(`on`), $(`sub`).textContent = ``, this.syncGameplay(), this.renderUndo(), this.endSnap = {
        score: {
          ...this.score
        },
        stat: {
          ...Ae(k.mode, k.level)
        }
      };
      let r = In(),
        i = Ln(),
        a = t.result === 3 ? 0 : t.result,
        o = a === 0 ? `draw` : !this.vsBot && !this.online || a === 1 ? `win` : `lose`;
      if (clearTimeout(this.oppTimer), clearInterval(this.moveTick), this.online && void 0, a ? this.score[a]++ : this.score.d++, k.played++, this.fromInvite && (this.inviteRounds++, [1, 3, 10, 25].includes(this.inviteRounds) && z(`invite`, `rounds` + this.inviteRounds, `reached`)), this.vsBot) {
        let e = Ae(k.mode, k.level);
        o === `win` ? (k.wins++, e.w++, e.cur++, e.best = Math.max(e.best, e.cur)) : o === `lose` ? (e.l++, e.cur = 0) : e.d++;
      }
      if (A(), this.renderScore(a || `d`), this.saveGame(), z(`round`, this.gameKey(), o === `draw` ? `draw` : o === `win` ? `complete` : `fail`), this.countRun(), a && t.line) {
        let e = this.colOf(a);
        n.classList.add(`done`);
        for (let e of t.line) this.cells[e].classList.add(`win`);
        this.drawWinLine(t.line, e), $(`status`).textContent = this.online ? b(a === 1 ? `res.win` : `on.youLose`) : this.vsBot ? b(a === 1 ? `res.win` : `res.lose`) : b(`res.pwin`, {
          name: this.name(a)
        }), $(`status`).style.setProperty(`--sc`, e), o === `win` ? (S.win(), await wr(250), this.flash(), Pe.confetti([this.skin.x, this.skin.o, `#ffd23a`, `#ffffff`, `#3dffb0`])) : (S.lose(), n.classList.add(`shake`));
      } else a ? ($(`status`).textContent = b(`res.win`), S.win()) : (n.classList.add(`draw`), S.draw(), $(`status`).textContent = b(`res.draw`));
      if (await wr(a ? 900 : 1e3), e !== this.token) return;
      let s = !!this.online?.ranked;
      s && o === `win` && k.onlineWins++, s && o === `win` && (k.bw[this.onlineMode] = (k.bw[this.onlineMode] ?? 0) + 1), this.online && !s && k.fg++, s && void 0, Tn();
      let c = !1;
      s && o === `win` && t.line && this.thinkN >= 3 && (c = this.thinkMs / this.thinkN < Sn, c && k.fw++);
      let l = s && o === `win` ? c ? `a:speed` : `m:` + this.onlineMode : this.online && !s ? `a:friends` : this.vsBot && o === `win` && k.level === `hard` ? `a:bot` : null;
      this.bPill = Vn(r, i, l), this.bPillFrom = this.bPill ? i[this.bPill.id] ?? null : null, this.bPillAnim = !!this.bPill, this.bPill?.up && z(`badge`, `up`, this.bPill.id + `:` + (K(this.bPill.id) ? q(K(this.bPill.id)) : 0)), A(), this.renderScore(), this.online && !s && !this.inviteDone && (void 0, this.inviteDone = !0), s && o === `lose` && this.online && this.online.oppWins !== null && this.online.oppWins++;
      let u = s ? o === `win` ? 2 : 0 : be({
          vsBot: this.vsBot,
          level: k.level,
          outcome: o
        }),
        d = k.stars,
        f = Oe(u),
        p = (this.vsBot || s) && o === `win` && this.eventOpen() ? 1 : 0,
        m = k.pumpkins;
      if (p && f.push(...je(p).filter(e => !f.includes(e))), this.online) return void 0;
      this.showResult(o, a, u, d, f, p, m);
    }
    drawWinLine(e, t) {
      let n = this.mode.size,
        r = e[0],
        i = e[e.length - 1],
        a = e => {
          let t = 3.5;
          return [t + 93 * (e % n + .5) / n, t + 93 * ((e / n | 0) + .5) / n];
        },
        [o, s] = a(r),
        [c, l] = a(i),
        u = c - o,
        d = l - s,
        f = Math.hypot(u, d),
        p = 30 / n / f;
      o -= u * p, s -= d * p, c += u * p, l += d * p;
      let m = n === 3 ? 3.2 : 2.4;
      $(`board`).insertAdjacentHTML(`beforeend`, `<svg class="winline" viewBox="0 0 100 100" preserveAspectRatio="none" style="--c:${t}"><line class="halo" pathLength="1" x1="${o}" y1="${s}" x2="${c}" y2="${l}" stroke-width="${m * 2.2}"/><line pathLength="1" x1="${o}" y1="${s}" x2="${c}" y2="${l}" stroke-width="${m}"/></svg>`);
    }
    flash() {
      let e = $(`flash`);
      e.classList.remove(`go`), e.offsetWidth, e.classList.add(`go`);
    }
    showResult(e, t, n, r, i, a = 0, o = k.pumpkins) {
      let s = this.skin,
        c;
      c = e === `draw` ? this.s.mode.maxMoves && this.s.moves >= this.s.mode.maxMoves ? b(`res.drawLong`) : b(`res.draw`) : this.vsBot ? b(e === `win` ? `res.win` : `res.lose`) : b(`res.pwin`, {
        name: this.name(t)
      });
      let l = t ? this.colOf(t) : `#b9a9ff`,
        u = e === `win` && this.vsBot ? b(`cheer.` + (1 + Math.floor(Math.random() * 4))) : e === `lose` ? b(`cheer.5`) : ``,
        f = this.vsBot && e !== `lose` ? this.rewardBox({
          earned: n,
          pumpkin: a,
          starsBefore: r,
          pumpBefore: o,
          fresh: i,
          canDouble: false,
          drawOffer: false
        }) : null,
        p = false,
        m = ``,
        h = this.endSnap?.stat.cur ?? 0;
      if (this.vsBot) {
        let t = Ae(k.mode, k.level);
        e === `win` ? m = `<div class="strk">${d.flame}<span>${b(`streakNow`)}</span><b class="n">${t.cur}</b>${t.cur >= 2 && t.cur === t.best ? `<em>${b(`newBest`)}</em>` : ``}</div>` : e === `lose` && h > 0 ? m = `<div class="strk lost">${d.flame}<span>${b(`streakNow`)}</span><b class="n">${h}</b><i>→</i><b class="n zero">0</b></div>` : e === `draw` && t.cur > 0 && (m = `<div class="strk">${d.flame}<span>${b(`streakKept`)}</span><b class="n">${t.cur}</b></div>`);
      }
      let g = b(h > 0 ? `saveStreak` : `second`),
        _ = ``;
      let v = `<div class="card result" style="--c:${l}">
      <button class="x" id="bResX" aria-label="${b(`next`)}">${d.close}</button>
      <div class="rc-a">
      <div class="res-mk${t ? `` : ` pair`}">${t ? E(s, this.shape(t), `new`) : E(s, 1, `new`) + E(s, 2, `new`)}</div>
      <div class="res-t ${e}">${c}</div>
      ${u ? `<div class="res-s">${u}</div>` : ``}
      ${m || this.bPill ? `<div class="meta">${m}${this.badgePill(!0)}</div>` : ``}
      </div>
      <div class="rc-b">
      ${f ? f.html : ``}
      <div class="btns">
        ${p ? `<button class="btn rv" id="bSecond"><span class="l1">${d.video}${g}</span><small>${b(`secondSub`)}</small></button>` : ``}
        <button class="btn pulse" id="bNext">${b(`next`)}</button>
        ${_ === `online` ? `<button class="btn onl" id="bOnlineCta">${d.globe}<span></span></button>` : ``}
        ${_ === `mode` ? `<button class="btn cmode" id="bModeNudge">${d.grid}<span>${b(`on.changeMode`)}</span></button>` : ``}
      </div>
      </div>
    </div>`;
      this.openOverlay(v), void 0, this.fitRewardLabels(), this.wireBadgePill(() => this.reopenResultAsNext());
      let y = document.getElementById(`bModeNudge`);
      y && (y.onclick = () => (S.click(), z(`nudge`, `mode`, `click`), this.showModePick(`nudge`))), this.resultDoubled = !1, f && this.playRewards(f.unlocks, {
        earned: n,
        pumpkin: a
      });
      let ee = () => {
        S.click(), this.first = j(this.first), this.newRound(!0);
      };
      $(`bNext`).onclick = ee, $(`bResX`).onclick = ee;
      let te = document.getElementById(`bSecond`);
      te && (te.onclick = () => this.secondChance()), z(`result`, e, `visible`), p && z(`second-chance`, h > 0 ? `streak` : `no-streak`, `visible`);
    }
    rewardBox(e) {
      let t = k.owned.filter(t => !e.fresh.includes(t)),
        n = e => D(e) ? xe.find(t => t.id === e).name : ge(e).name,
        r = e => `<div class="rwth${D(e) ? `` : ` pair`}">${this.preview(e)}</div>`,
        i = (e, t, i, a, o, s, c) => `<div class="rwrow ${e}${s >= 1 ? ` full` : ``}" data-id="${a}"><div class="rwgain${i ? `` : ` none`}">${t}${i ? `<span>+${i}</span>` : ``}</div><div class="rwmid"><div class="rwlbl"><span><i class="rwk">${b(`nextUnlock`)}:</i><b>${n(a)}</b></span><span>${s >= 1 ? b(`unlocked`) : c}</span></div><div class="rwbar"><i style="width:${(o * 100).toFixed(1)}%" data-to="${(Math.min(1, s) * 100).toFixed(1)}"></i></div></div>${r(a)}</div>`,
        a = ``,
        o = null,
        s = e.drawOffer ? ye(k.level) : e.earned,
        c = !1,
        l = Ce.find(e => !t.includes(e.id));
      if (l && (e.earned > 0 || e.drawOffer)) {
        let t = Ce.filter(t => t.stars < l.stars && t.stars <= e.starsBefore).reduce((e, t) => Math.max(e, t.stars), 0),
          n = Math.max(1, l.stars - t),
          r = Math.max(0, Math.min(1, (e.starsBefore - t) / n)),
          u = e.fresh.includes(l.id),
          f = u ? 1 : Math.max(0, Math.min(.97, (k.stars - t) / n));
        a += i(``, d.star, e.earned, l.id, r, f, `${b(`moreN`, {
          n: Math.max(0, l.stars - k.stars)
        })} ${d.star}`), u ? o = l.id : s > 0 && l.stars - k.stars <= s && (c = !0);
      }
      if (Ee() && e.pumpkin > 0) {
        let n = O.rewards.findIndex(e => !t.includes(e.id));
        if (n >= 0) {
          let t = O.rewards[n],
            r = n > 0 ? O.rewards[n - 1].pumpkins : 0,
            s = Math.max(1, t.pumpkins - r),
            l = Math.max(0, Math.min(1, (e.pumpBefore - r) / s)),
            u = e.fresh.includes(t.id),
            f = u ? 1 : Math.max(0, Math.min(.97, (k.pumpkins - r) / s));
          a += i(`ev`, d.pumpkin, e.pumpkin, t.id, l, f, `${b(`moreN`, {
            n: Math.max(0, t.pumpkins - k.pumpkins)
          })} ${d.pumpkin}`), u && !o ? o = t.id : !u && t.pumpkins - k.pumpkins <= e.pumpkin && (c = !0);
        }
      }
      !o && e.fresh.length && (o = e.fresh[e.fresh.length - 1]);
      let u = o ? [o, ...e.fresh.filter(e => e !== o)] : [];
      if (!a) return {
        html: ``,
        unlock: o,
        unlocks: u
      };
      let f = e.doubled ? `<div class="rwx2 done">${e.doneText ?? b(`doubled`)}</div>` : o ? `` : e.drawOffer ? `<button class="rwx2" id="bDrawStar">${d.video}${c ? b(`unlock`) : s === 1 ? b(`drawStar`) : b(`drawStars`, {
        n: s
      })}</button>` : e.canDouble ? `<button class="rwx2" id="bDouble" data-kind="${c ? `unlock-now` : `double`}">${d.video}${b(c ? `unlock` : `double`)}</button>` : ``;
      return {
        html: `<div class="rwbox">${a}${f}</div>`,
        unlock: o,
        unlocks: u
      };
    }
    playRewards(e, t) {
      let n = document.querySelector(`#overlay .rwbox`);
      if (!n) return;
      this.rvGains = t, requestAnimationFrame(() => requestAnimationFrame(() => n.querySelectorAll(`.rwbar i`).forEach(e => e.style.width = e.dataset.to + `%`)));
      let r = document.getElementById(`bDouble`);
      r && (r.onclick = () => this.doubleRewards(t, r.dataset.kind === `unlock-now` ? `unlock-now` : `double`));
      let i = document.getElementById(`bDrawStar`);
      if (i && (i.onclick = () => this.doubleRewards({
        earned: ye(k.level),
        pumpkin: 0
      }, `draw-star`)), !e.length) return;
      let a = document.getElementById(`bNext`) ?? document.getElementById(`bAgain`) ?? document.getElementById(`bElse`);
      a.classList.add(`wait`), setTimeout(() => {
        n.isConnected && (a.classList.remove(`wait`), S.unlockFanfare(), this.rvIds = e, this.rvSeen = new Set(), this.showReveal(0));
      }, 2200);
    }
    showReveal(e) {
      let t = document.querySelector(`#overlay .rwbox, #overlay .rvl`);
      if (!t) return;
      t.closest(`.card`).classList.add(`reveal`), this.rvSeen.add(e), t.outerHTML = this.revealBox(this.rvIds[e], e, this.rvIds.length), this.rvSeen.has(-1 - e) || (this.rvSeen.add(-1 - e), z(`reveal`, D(this.rvIds[e]) ? `background` : `pieces`, `visible`));
      let n = document.querySelector(`#overlay .rvl`);
      n.querySelector(`[data-rvx]`).onclick = () => (S.click(), z(`reveal`, `close`, `click`), this.backToProgress()), n.querySelectorAll(`[data-rvgo]`).forEach(t => t.onclick = () => (S.click(), z(`reveal`, `arrow`, `click`), this.showReveal(e + +t.dataset.rvgo)));
      let r = n.querySelector(`.usebtn`);
      r && (r.onclick = () => {
        S.click(), z(`reveal`, `use`, `click`), this.useItem(this.rvIds[e], `reveal`), r.textContent = `${b(`using`)} ✓`, r.classList.add(`done`), r.setAttribute(`disabled`, ``), setTimeout(() => {
          if (!r.isConnected) return;
          let e = this.rvIds.findIndex((e, t) => !this.rvSeen.has(t));
          e >= 0 ? this.showReveal(e) : this.backToProgress();
        }, 550);
      }), this.fitOverlay();
    }
    backToProgress() {
      let e = document.querySelector(`#overlay .rvl`);
      if (!e) return;
      e.closest(`.card`).classList.remove(`reveal`);
      let t = this.rvGains;
      e.outerHTML = this.rewardBox({
        earned: t.earned,
        pumpkin: t.pumpkin,
        starsBefore: k.stars,
        pumpBefore: k.pumpkins,
        fresh: [],
        canDouble: false,
        doubled: this.resultDoubled
      }).html || ``;
      let n = document.querySelector(`#overlay .rwbox`);
      if (n) {
        n.classList.add(`back`), n.querySelectorAll(`.rwbar i`).forEach(e => e.style.width = e.dataset.to + `%`);
        let e = document.getElementById(`bDouble`);
        e && (e.onclick = () => this.doubleRewards(t, e.dataset.kind === `unlock-now` ? `unlock-now` : `double`));
      }
      this.fitOverlay();
    }
    revealBox(e, t = 0, n = 1) {
      let r = D(e),
        i = r ? k.bg === e : k.skin === e,
        a = r ? xe.find(t => t.id === e).name : ge(e).name,
        o = O.rewards.find(t => t.id === e),
        s = o && Ee() && k.pumpkins >= o.pumpkins ? `<div class="via">${b(`evReward`)}</div>` : ``,
        c = r ? `<div class="big">${Ht(e)}</div>` : `<div class="bigp">${this.preview(e, `new`)}</div>`,
        l = i ? `` : `<button class="mini use usebtn">${b(`useNow`)}</button>`,
        u = n > 1 ? `${t > 0 ? `<button class="rvarr l" data-rvgo="-1" aria-label="previous">‹</button>` : ``}${t < n - 1 ? `<button class="rvarr r" data-rvgo="1" aria-label="next">›</button>` : ``}<div class="rvdots">${Array.from({
          length: n
        }, (e, n) => `<i class="${n === t ? `on` : ``}"></i>`).join(``)}</div>` : ``;
      return `<div class="rvl"><div class="rays"></div><button class="rvx" data-rvx aria-label="${b(`close`)}">${d.close}</button><div class="k">${b(r ? `kNewBg` : `kNewPieces`)}</div><div class="nm">${a}</div>${c}${s}${l}${u}</div>`;
    }
    newItemBox(e, t) {
      let n = D(e),
        r = n ? k.bg === e : k.skin === e,
        i = t && !r ? `<button class="mini use" ${n ? `data-usebg` : `data-use`}="${e}">${b(`use`)}</button>` : ``;
      return `<div class="newskin"><div class="nt">${b(n ? `newBg` : `newSkin`)}</div><div class="pv">${this.preview(e, `new`)}</div>${i}</div>`;
    }
    useItem(e, t = `menu`) {
      z(`style-use`, t, D(e) ? `background` : `pieces`), D(e) ? (k.bg = e, A(), this.applyBg(), z(`background`, e, `select`)) : (k.skin = e, A(), this.applySkin(), this.redrawMarks(), z(`skin`, e, `select`));
    }
    wireSkinButtons(e) {
      document.querySelectorAll('#overlay [data-use], #overlay [data-usebg]').forEach(button => {
        button.onclick = () => {
          S.click();
          this.useItem(button.dataset.use ?? button.dataset.usebg);
          if (e) e();else {
            button.textContent = b('using');
            button.disabled = true;
          }
        };
      });
    }
    redrawMarks() {
      if (this.cells.forEach((e, t) => this.drawCell(t, !1)), this.s.line) for (let e of this.s.line) this.cells[e].classList.add(`win`);
      this.markDimmed();
    }
    openOverlay(e) {
      e = retirePanelControls(e);
      let t = $(`overlay`),
        n = e => e ? [...e.classList].find(e => e !== `card` && e !== `panel`) ?? `` : ``,
        r = t.classList.contains(`on`) ? n(t.firstElementChild) : ``;
      t.innerHTML = e, r && [`stats`, `mpick`, `skinsp`].includes(r) && n(t.firstElementChild) === r && (t.firstElementChild.style.animation = `none`), t.onclick = e => {
        if (e.target !== t) return;
        let n = t.querySelector(`.card.panel #bClose`);
        n && n.click();
      }, t.classList.add(`on`), this.fitOverlay(), this.syncGameplay();
    }
    fitOverlay() {
      let e = $(`overlay`),
        t = e.firstElementChild;
      if (!t || !e.classList.contains(`on`)) return;
      t.style.zoom = `1`;
      let n = getComputedStyle(e),
        r = e.clientHeight - parseFloat(n.paddingTop) - parseFloat(n.paddingBottom),
        i = e.clientWidth - parseFloat(n.paddingLeft) - parseFloat(n.paddingRight),
        a = Math.min(1, r / t.offsetHeight, i / t.offsetWidth);
      t.style.zoom = a < 1 ? String(Math.floor(a * 1e3) / 1e3) : `1`;
    }
    closeOverlay() {
      let e = $(`overlay`);
      e.classList.remove(`on`), e.innerHTML = ``, this.lookTimer && (this.lookId++, clearInterval(this.lookTimer), this.lookTimer = 0, tr()), this.s && this.syncGameplay();
    }
    eventOpen() {
      return Ee() && !O.rewards.every(e => k.owned.includes(e.id));
    }
    eventStrip(e) {
      let t = O.rewards[O.rewards.length - 1].pumpkins,
        n = Math.min(1, k.pumpkins / t),
        r = O.rewards.map(e => {
          let t = k.owned.includes(e.id),
            n = D(e.id) ? Ht(e.id) : E(ge(e.id), 1);
          return `<div class="evn${t ? ` got` : ``}"><div class="ico">${n}</div><span>${t ? `✓` : `${d.pumpkin}${e.pumpkins}`}</span></div>`;
        }).join(``),
        i = O.rewards.every(e => k.owned.includes(e.id)),
        a = e && !i && k.pumpkinVideoDay !== Me() ? `<button class="mini pv1" data-pumpkin aria-label="+1">${d.video}+1${d.pumpkin}</button>` : ``;
      return `<div class="evt"><div class="evh">${d.pumpkin}<div class="evt2"><b>${b(`ev.title`)}</b><small>${b(`ev.until`)}</small></div><span class="cnt">${d.pumpkin}${k.pumpkins}</span>${a}</div>
      ${i ? `<div class="evh"><small>${b(`ev.got`)}</small></div>` : `<div class="evtrack"><i class="fill" style="width:calc((100% - 36px) * ${n.toFixed(3)})"></i>${r}</div>`}</div>`;
    }
    sizeStyleGrid() {
      let e = document.querySelector(`#overlay .skins`),
        t = document.querySelector(`#overlay .skinsp`);
      if (!e || !t) return;
      t.style.zoom = `1`;
      let n = `${innerWidth}x${innerHeight}`;
      if (this.styleGridKey !== n || !this.styleGridH) {
        let r = null;
        this.styleTab !== `pieces` && (r = document.createElement(`div`), r.className = `sk`, r.style.visibility = `hidden`, r.innerHTML = `<div class="nm">X</div><div class="pv">${E(T[0], 1)}${E(T[0], 2)}</div><span class="st">X</span>`, e.appendChild(r));
        let i = r ?? e.querySelector(`.sk`),
          a = parseFloat(getComputedStyle(e).rowGap) || 0,
          o = i.offsetHeight;
        r?.remove();
        let s = $(`overlay`).clientHeight - 24,
          c = 2.5,
          l = e => o * e + a * Math.floor(e) + 10;
        e.style.height = `${l(c)}px`;
        let u = document.body.classList.contains(`land`) ? 20 : 60;
        for (; c > 1.5 && t.offsetHeight > s - u;) --c, e.style.height = `${l(c)}px`;
        this.styleGridH = l(c), this.styleGridKey = n;
      }
      e.style.height = `${this.styleGridH}px`, this.fitOverlay();
    }
    starRow(e) {
      return '<div class="wal"><div class="wg">' + d.star + k.stars + '</div><div class="wm">' + (e ? b('nextUnlock') + ': ' + e.name + ' (' + Math.max(0, e.stars - k.stars) + ')' : b('allUnlocked')) + '</div></div>';
    }
    showSkins(e, t = !1) {
      document.querySelector(`#overlay .result`) && (e = e ?? (() => this.reopenResultAsNext()));
      let n = we(k.owned),
        r = Ee(),
        i = this.styleTab,
        a = k.seenSkins.slice(),
        o = (e, t, n, i, a, o) => {
          if (i) return `<span class="st">${b(`using`)}</span>`;
          if (a) return `<button class="mini use" ${o}="${e}">${b(`use`)}</button>`;
          if (r && n) {
            let t = O.rewards.find(t => t.id === e);
            return `<span class="st ev">${d.pumpkin}${t.pumpkins}</span>`;
          }
          return `<span class="st">${d.lock}${d.star}${t}</span>`;
        },
        s = (e, t, n) => t && !a.includes(e) ? `<span class="newtag">${b(`newTag`)}</span>` : !t && r && n ? `<span class="newtag evt">${b(`ev.tag`)}</span>` : ``,
        c;
      if (c = i === `badges` ? this.badgeTiles() : i === `pieces` ? T.map(e => {
        let t = k.owned.includes(e.id),
          r = k.skin === e.id,
          i = !!n && n.id === e.id;
        return `<div class="sk${r ? ` cur` : ``}${t ? `` : ` locked`}${i ? ` nx` : ``}">${s(e.id, t, e.event)}<div class="nm">${e.name}</div><div class="pv">${E(e, 1)}${E(e, 2)}</div>${o(e.id, e.stars, e.event, r, t, `data-use`)}</div>`;
      }).join(``) : xe.map(e => {
        let t = k.owned.includes(e.id),
          i = k.bg === e.id,
          a = !!n && n.id === e.id;
        return `<div class="sk${i ? ` cur` : ``}${t ? `` : ` locked`}${a || r && e.event ? ` nx` : ``}">${s(e.id, t, e.event)}<div class="nm">${e.name}</div>${Ht(e.id)}${o(e.id, e.stars, e.event, i, t, `data-usebg`)}</div>`;
      }).join(``), i !== `badges`) for (let e of k.owned) i === `bgs` === D(e) && !k.seenSkins.includes(e) && k.seenSkins.push(e);
      A();
      let l = O.rewards.every(e => k.owned.includes(e.id)),
        u = e => this.hasNew(e) ? `<i class="nd"></i>` : ``,
        f = `<div class="tabsx" role="tablist"><button role="tab" id="tPieces" class="${i === `pieces` ? `sel` : ``}" aria-selected="${i === `pieces`}">${b(`pieces`)}${i === `pieces` ? `` : u(`skin`)}</button><button role="tab" id="tBgs" class="${i === `bgs` ? `sel` : ``}" aria-selected="${i === `bgs`}">${b(`backgrounds`)}${i === `bgs` ? `` : u(`bg`)}</button><button role="tab" id="tBadges" class="${i === `badges` ? `sel` : ``}" aria-selected="${i === `badges`}">${b(`bd.tab`)}${i === `badges` ? `` : u(`badge`)}</button></div>`;
      this.openOverlay(`<div class="card panel skinsp" style="--c:var(--pink)"><button class="x" id="bClose" aria-label="${b(`close`)}">${d.close}</button><h2>${b(`style`)}</h2>${r && !l ? this.eventStrip(!0) : ``}${this.starRow(n)}${f}<div class="skins${i === `bgs` ? ` bgs` : i === `badges` ? ` bdgs` : ``}">${c}</div></div>`), t && ($(`overlay`).firstElementChild.style.animation = `none`), A(), this.applySkin();
      let p = () => {
        S.click(), e ? e() : this.closeOverlay();
      };
      $(`bClose`).onclick = p, $(`tPieces`).onclick = () => {
        this.styleTab !== `pieces` && (S.click(), this.styleTab = `pieces`, this.showSkins(e, !0));
      }, $(`tBgs`).onclick = () => {
        this.styleTab !== `bgs` && (S.click(), this.styleTab = `bgs`, this.showSkins(e, !0));
      }, $(`tBadges`).onclick = () => {
        this.styleTab !== `badges` && (S.click(), this.styleTab = `badges`, this.showSkins(e, !0));
      }, document.querySelectorAll(`#overlay [data-bd]`).forEach(t => {
        t.onclick = () => (S.click(), this.showBadge(t.dataset.bd, () => this.showSkins(e, !0)));
      }), i === `badges` && Bn(), this.wireSkinButtons(() => this.showSkins(e, !0)), document.querySelectorAll(`#overlay .sk`).forEach(e => {
        let t = e.querySelector(`[data-use], [data-usebg]`);
        t && (e.onclick = e => {
          e.target !== t && t.click();
        });
      }), this.sizeStyleGrid(), z(`skins`, i, `visible`);
    }
    showModePick(e, t = {}) {
      this.openOverlay('<div class="card panel mpick"><button class="x" id="bClose">' + d.close + '</button><h2>' + b('mode') + '</h2><div class="modes">' + M.map(mode => '<button class="chip" data-local-mode="' + mode + '">' + b('mode.' + mode) + '</button>').join('') + '</div></div>');
      $('bClose').onclick = () => this.closeOverlay();
      document.querySelectorAll('[data-local-mode]').forEach(button => button.onclick = () => {
        this.closeOverlay();
        this.changeConfig({
          mode: button.dataset.localMode
        });
      });
    }
    rollMode(e, t) {
      let n = document.querySelector(`.mpick`);
      if (!n) return t(e);
      n.classList.add(`rolling`), n.querySelector(`#bClose`).style.visibility = `hidden`;
      let r = [...n.querySelectorAll(`.mgrid [data-m]:not(.rnd)`)],
        i = r.findIndex(t => t.dataset.m === e),
        a = Math.random() * r.length | 0,
        o = 2 * r.length + (i - a + r.length) % r.length,
        s = 0,
        c = this.token,
        l = () => {
          if (!document.body.contains(n) || c !== this.token) return;
          if (r.forEach(e => e.classList.remove(`lit`)), a = (a + 1) % r.length, s++, r[a].classList.add(`lit`), S.click(), s < o) {
            let e = s / o;
            setTimeout(l, 80 + 340 * e * e);
            return;
          }
          r[a].classList.add(`won`), S.count(!0);
          let e = r[a].dataset.m,
            i = Ke[e],
            u = i.keep ? b(`on.ruleInf`) : b(`on.ruleK`, {
              k: i.k
            });
          n.querySelector(`h2`).innerHTML = `${b(`mode.` + e)}!`, n.querySelector(`.mgrid`).insertAdjacentHTML(`afterend`, `<p class="mrule">${u}</p>`), this.fitOverlay(), setTimeout(() => document.body.contains(n) && t(e), 1600);
        };
      l();
    }
    fitRewardLabels() {
      requestAnimationFrame(() => document.querySelectorAll(`#overlay .rwlbl > span:first-child`).forEach(e => {
        e.classList.remove(`nok`), e.scrollWidth > e.clientWidth + 1 && e.classList.add(`nok`);
      }));
    }
    reopenResultAsNext() {
      if (!this.s.result) return this.closeOverlay();
      this.openOverlay(`<div class="card result"><button class="x" id="bResX" aria-label="${b(`next`)}">${d.close}</button><div class="res-mk">${E(this.skin, this.shape(1), `new`)}</div><div class="btns"><button class="btn pulse" id="bNext">${b(`next`)}</button></div></div>`);
      let e = () => {
        S.click(), this.first = j(this.first), this.newRound(!0);
      };
      $(`bNext`).onclick = e, $(`bResX`).onclick = e;
    }
    showPlayAs() {
      if (false) return;
      let e = !!document.querySelector(`#overlay .result`) && !!this.s?.result,
        t = this.roundTouched && !this.s.result,
        n = this.skin,
        r = e => `<button class="pa${k.playAs === e ? ` sel` : ``}" data-shape="${e}" aria-label="${b(`playAs`)} ${e === 1 ? `X` : `O`}">${E(n, e)}<span>${e === 1 ? `X` : `O`}</span></button>`;
      this.openOverlay(`<div class="card panel playas" style="--c:var(--c1)"><button class="x" id="bClose" aria-label="${b(`close`)}">${d.close}</button><h2>${b(`playAs`)}</h2><div class="pas">${r(1)}${r(2)}</div>${t ? `<p class="cbody small">${b(`playAsNext`)}</p>` : ``}<button class="pabd" id="bPaBadges"><span class="pal">${b(`bd.yours`)}</span><span class="pab">${[0, 1, 2].map(e => J()[e] ? X(J()[e], 40) : `<i class="bslot"></i>`).join(``)}</span><span class="pach">${d.chev}</span>${zn() ? `<i class="nd"></i>` : ``}</button><button class="pastyle${this.hasNew() ? ` isnew` : ``}" id="bPaStyle">${d.palette}<span>${b(`changeStyle`)}</span></button></div>`);
      let i = () => e ? this.reopenResultAsNext() : this.closeOverlay();
      $(`bClose`).onclick = () => (S.click(), i()), $(`bPaBadges`).onclick = () => {
        S.click(), z(`badge`, `play-as`, `click`), this.styleTab = `badges`, this.showSkins(e ? () => this.reopenResultAsNext() : void 0);
      }, $(`bPaStyle`).onclick = () => {
        S.click(), z(`skins`, `play-as`, `click`), this.styleTab = this.hasNew(`bg`) && !this.hasNew(`skin`) ? `bgs` : `pieces`, this.showSkins(e ? () => this.reopenResultAsNext() : void 0);
      }, document.querySelectorAll(`#overlay [data-shape]`).forEach(e => {
        e.onclick = () => {
          S.click();
          let n = +e.dataset.shape,
            r = k.playAs !== n;
          k.playAs = n, A(), r && z(`play-as`, n === 1 ? `x` : `o`, `select`), r && !t && !this.s.result && (this.side = n, this.applySkin(), this.redrawMarks(), this.renderStatus(!this.roundTouched)), i();
        };
      });
    }
    showTwoChoice() {
      this.changeConfig({
        vsBot: false
      });
    }
    armHand() {
      clearTimeout(this.handTimer), !k.firstMoveDone && (this.handTimer = window.setTimeout(() => {
        if (this.roundTouched || this.botTurn() || this.preMatchOn || this.online && this.s.turn !== 1 || $(`overlay`).classList.contains(`on`)) return;
        let e = this.mode.size,
          t = e * e / 2 | 0,
          n = this.cells[t],
          r = $(`stage`).getBoundingClientRect(),
          i = n.getBoundingClientRect(),
          a = document.createElement(`div`);
        a.className = `hand`, a.innerHTML = d.hand, a.style.left = `${i.left - r.left + i.width / 2}px`, a.style.top = `${i.top - r.top + i.height / 2}px`, $(`stage`).appendChild(a), $(`status`).textContent = b(`hint.tap`), Ge(), z(`onboarding`, `hand`, `visible`);
      }, 1500));
    }
    hideHand() {
      clearTimeout(this.handTimer), document.querySelectorAll(`.hand`).forEach(e => e.remove());
    }
    confirmLeave() {
      return new Promise(e => {
        let t = Ae(k.mode, k.level).cur;
        this.openOverlay(`<div class="card panel confirm" style="--c:#ffb21f"><div class="strk big">${d.flame}<b class="n">${t}</b></div><h2>${b(`leaveT`)}</h2><p class="cbody">${b(`leaveB`)}</p><div class="btns"><button class="btn" id="bStay">${b(`leaveNo`)}</button><button class="btn ghost" id="bLeave">${b(`leaveYes`)}</button></div></div>`), $(`bStay`).onclick = () => (S.click(), this.closeOverlay(), e(!1)), $(`bLeave`).onclick = () => (this.closeOverlay(), e(!0));
      });
    }
    showStats(e = k.level, t = this.statsTab) {
      t = 'bot';
      t === `online` && !this.statsH && (this.statsProbe = !0, this.showStats(e, `bot`), this.statsProbe = !1), this.statsTab = t;
      let n = !!document.querySelector(`#overlay .result`) && !!this.s?.result,
        r = `<div class="stop" id="sTop"><button data-top="bot" class="${t === `bot` ? `sel` : ``}">${d.bot}${b(`opp.bot`)}</button><button data-top="online" class="${t === `online` ? `sel` : ``}">${d.globe}${b(`on.online`)}</button></div>`,
        i;
      if (t === `online`) {
        let e = k.online,
          t = e.w + e.l + e.d,
          n = this.ostatsTab,
          r = `<div class="seg tabs osub" id="sOsub"><button data-os="stats" class="${n === `stats` ? `sel` : ``}">${b(`stats`)}</button><button data-os="badges" class="${n === `badges` ? `sel` : ``}">${b(`bd.tab`)}</button></div>`,
          a;
        if (n === `stats`) {
          let n = M.map(e => {
              let t = k.ostats[e] ?? {
                  w: 0,
                  l: 0,
                  d: 0,
                  cur: 0,
                  best: 0
                },
                n = t.w + t.l + t.d,
                r = n ? Math.round(t.w / n * 100) : 0;
              return `<div class="srow"><div class="sm">${b(`mode.` + e)}</div>
          <div class="sbar onl"><i style="width:${r}%"></i><span>${n ? r + `%` : `–`}</span></div>
          <div class="snum"><b>${t.w}</b><b>${t.l}</b><b>${t.d}</b></div>
          <div class="sbest">${d.flame}${t.best}</div></div>`;
            }).join(``),
            r = M.reduce((e, t) => e + ((k.ostats[t]?.w ?? 0) + (k.ostats[t]?.l ?? 0) + (k.ostats[t]?.d ?? 0)), 0);
          a = t ? `<div class="shead"><span></span><span>${b(`winRate`)}</span><span class="snum"><i>${b(`won`)}</i><i>${b(`lost`)}</i><i>${b(`drawn`)}</i></span><span title="${b(`bestStreak`)}">${d.flame}</span></div>
        ${n}
        <div class="stot">${b(`total`)}: <b>${e.w}</b> ${b(`won`).toLowerCase()} · <b>${Math.round(e.w / t * 100)}%</b></div>
        ${r < t ? `<p class="cbody dim small onote">${b(`on.perModeNew`)}</p>` : ``}` : `<p class="cbody dim">${b(`on.statsEmpty`)}</p><button class="btn onl" id="sPlayOnline">${d.globe}${b(`on.title`)}</button>`;
        } else a = `<div class="brk">${W.filter(e => e.kind === `mode`).map(e => {
          let t = q(e),
            n = e.value(),
            r = e.steps[t + 1],
            i = t < 0 ? 0 : e.steps[t],
            a = r === void 0 ? 100 : Math.max(3, (n - i) / Math.max(1, r - i) * 100);
          return `<button class="brow" data-bd="${e.id}">${X(e.id, 42)}<span class="bmid"><span class="btop"><b>${Z(e.id)}</b><b style="color:${ur(t)}">${t < 0 ? `–` : Q(t)}</b></span><span class="bbar"><i style="width:${a.toFixed(1)}%;background:${dr(r === void 0 ? t : t + 1)}"></i></span><span class="bn">${r === void 0 ? n : `${n} / ${r} → ${Q(t + 1)}`}</span></span></button>`;
        }).join(``)}</div>`;
        i = `${r}<div class="oview ${n}">${a}</div>`;
      } else {
        let t = tt.map(t => `<button class="lv-${t}${t === e ? ` sel` : ``}" data-tab="${t}">${b(`level.` + t)}</button>`).join(``),
          n = 0,
          r = 0,
          a = 0,
          o = M.map(t => {
            let i = k.stats[`${t}-${e}`] ?? {
                w: 0,
                l: 0,
                d: 0,
                cur: 0,
                best: 0
              },
              o = i.w + i.l + i.d;
            n += i.w, r += i.l, a += i.d;
            let s = o ? Math.round(i.w / o * 100) : 0;
            return `<div class="srow"><div class="sm">${b(`mode.` + t)}</div>
          <div class="sbar lv-${e}"><i style="width:${s}%"></i><span>${o ? s + `%` : `–`}</span></div>
          <div class="snum"><b>${i.w}</b><b>${i.l}</b><b>${i.d}</b></div>
          <div class="sbest">${d.flame}${i.best}</div></div>`;
          }).join(``),
          s = n + r + a;
        i = `<div class="seg tabs" id="sTabs">${t}</div>
        <div class="shead"><span></span><span>${b(`winRate`)}</span><span class="snum"><i>${b(`won`)}</i><i>${b(`lost`)}</i><i>${b(`drawn`)}</i></span><span title="${b(`bestStreak`)}">${d.flame}</span></div>
        ${o}
        <div class="stot">${b(`total`)}: <b>${n}</b> ${b(`won`).toLowerCase()} · <b>${s ? Math.round(n / s * 100) : 0}%</b></div>`;
      }
      this.openOverlay(`<div class="card panel stats" style="--c:var(--cyan)"><button class="x" id="bClose" aria-label="${b(`close`)}">${d.close}</button>
      <h2>${b(`stats`)}</h2><div class="ssub">${b(t === `online` ? `on.statsSub` : `statsSub`)}</div>
      ${r}${i}
      <div class="ver">v${B}</div>
    </div>`);
      let a = document.querySelector(`#overlay .card.stats`);
      t === `bot` ? this.statsH = a.offsetHeight : this.statsH && (a.style.height = `${this.statsH}px`), document.querySelectorAll(`#sOsub [data-os]`).forEach(t => t.onclick = () => {
        t.dataset.os !== this.ostatsTab && (S.click(), this.ostatsTab = t.dataset.os, z(`stats`, `online-` + this.ostatsTab, `click`), this.showStats(e, `online`));
      }), this.fitOverlay(), document.querySelectorAll(`#sTabs [data-tab]`).forEach(e => e.onclick = () => (S.click(), this.showStats(e.dataset.tab, `bot`))), document.querySelectorAll(`#sTop [data-top]`).forEach(t => t.onclick = () => {
        S.click(), z(`stats`, t.dataset.top, `click`), this.showStats(e, t.dataset.top);
      }), document.querySelectorAll(`#overlay .brow[data-bd]`).forEach(t => {
        t.onclick = () => (S.click(), this.showBadge(t.dataset.bd, () => this.showStats(e, `online`)));
      });
      let o = document.getElementById(`sPlayOnline`);
      o && (o.onclick = () => {
        S.click(), z(`stats`, `play-online`, `click`), this.closeOverlay(), void 0;
      }), $(`bClose`).onclick = () => {
        S.click(), n ? this.reopenResultAsNext() : this.closeOverlay();
      }, this.statsProbe || z(`stats`, t === `online` ? `online` : `panel`, `visible`);
    }
    toast(e, t = 2200) {
      let n = $(`toast`);
      n.textContent = e, n.classList.add(`on`), clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => n.classList.remove(`on`), t);
    }
  }();
document.body.insertAdjacentHTML(`afterbegin`, `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffd35a"/><stop offset="1" stop-color="#e09a1f"/></linearGradient><filter id="mkGlow" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="n"/><feMerge result="m"><feMergeNode in="n"/><feMergeNode in="SourceGraphic"/></feMerge><feGaussianBlur in="m" stdDeviation="5.5" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="m"/></feMerge></filter></defs></svg>`);
async function Dr() {
  re(ne()), window.addEventListener(`keydown`, e => {
    [`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, ` `].includes(e.key) && e.preventDefault();
  }), document.addEventListener(`contextmenu`, e => e.preventDefault()), Or();
  let e = () => S.unlock();
  window.addEventListener(`pointerdown`, e, {
    capture: !0
  }), window.addEventListener(`keydown`, e, {
    capture: !0
  });
  let t = void 0;
  await Ve(), Ie(), Be(), Pe.attach(document.getElementById(`fx`)), S.setEnabled(k.sound), await Promise.race([document.fonts?.ready, new Promise(e => setTimeout(e, 1200))]), await t, Er.init(), void 0, Le.push(() => document.querySelector(`#overlay .skinsp`) ? Er.sizeStyleGrid() : Er.fitOverlay()), Le.push(() => Er.applyBg()), Ie(), void 0, document.getElementById(`boot`).classList.add(`out`), setTimeout(() => document.getElementById(`boot`)?.remove(), 400), z(`boot`, k.played ? `returning` : `new`, `load`);
  let [n, r, i] = B.split(`.`).map(e => parseInt(e, 10) || 0);
  z(`version`, `v${n}${String(r).padStart(2, `0`)}${String(i).padStart(2, `0`)}`, `load`), z(`language`, document.documentElement.lang || `en`, `load`), z(`sound`, k.sound ? `on` : `off`, `load`), window.__ttt = {
    game: Er,
    profile: k,
    version: B,
    fx: Pe
  };
}
Dr();
function Or() {
  let e = null;
  document.addEventListener(`touchstart`, t => {
    let n = t.touches[0];
    if (!n || t.touches.length > 1) return;
    let r = t.target,
      i = !!r.closest?.(`#board`),
      a = n.clientX < 28 || n.clientX > window.innerWidth - 28;
    if (!i && !a) return;
    t.preventDefault();
    let o = i ? null : r.closest?.(`button, a, label, [role="button"]`);
    e = o ? {
      el: o,
      x: n.clientX,
      y: n.clientY
    } : null;
  }, {
    passive: !1,
    capture: !0
  }), document.addEventListener(`touchend`, t => {
    let n = e;
    e = null;
    let r = t.changedTouches[0];
    n && r && Math.hypot(r.clientX - n.x, r.clientY - n.y) < 12 && n.el.click();
  }, {
    capture: !0
  }), window.addEventListener(`wheel`, e => {
    e.preventDefault();
    let t = e.target.closest?.(`#overlay .skins, #overlay .oview, #overlay .lgs`);
    t && (t.scrollTop += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY);
  }, {
    passive: !1
  }), kr();
}
function kr() {
  let e = null;
  document.addEventListener(`pointerdown`, t => {
    if (t.pointerType === `mouse` && t.button !== 0) return;
    let n = t.target.closest?.(`#overlay .skins, #overlay .oview, #overlay .lgs`);
    n && n.scrollHeight > n.clientHeight && (e = {
      el: n,
      y: t.clientY,
      top: n.scrollTop,
      moved: !1
    });
  }), document.addEventListener(`pointermove`, t => {
    if (!e) return;
    let n = t.clientY - e.y;
    Math.abs(n) > 6 && (e.moved = !0), e.moved && (e.el.scrollTop = e.top - n);
  }), document.addEventListener(`pointercancel`, () => e = null), document.addEventListener(`pointerup`, () => {
    if (e?.moved) {
      let e = e => (e.stopPropagation(), e.preventDefault());
      document.addEventListener(`click`, e, {
        capture: !0,
        once: !0
      }), setTimeout(() => document.removeEventListener(`click`, e, {
        capture: !0
      }), 0);
    }
    e = null;
  });
}