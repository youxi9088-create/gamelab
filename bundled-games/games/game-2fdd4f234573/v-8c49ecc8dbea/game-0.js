(() => {
  // game.js
  var TRANSLATIONS = {
    en: {
      play: "PLAY",
      boost: "BOOST",
      respawn: "RESPAWN",
      cracked: "TUSKED!",
      score: "Score",
      best: "Best",
      stage: "STAGE",
      you: "You",
      loading: "Loading...",
      ready: "Ready!",
      hintMouseAim: "\u{1F5B1}\uFE0F Mouse to aim \u2022 W to swim",
      hintClickBoost: "Click or Space to boost",
      hintRam: "\u{1F984} Tusk the body to kill",
      hintDragLabel: "Drag to swim",
      hintBoostLabel: "Hold to boost",
      speedBoost: "\u2B50 SPEED BOOST",
      energy: "ENERGY!",
      speedBoostText: "SPEED BOOST!",
      alphaHuntTitle: "ALPHA HUNT",
      alphaHuntSurvive60: "SURVIVE FOR 60s",
      alphaHuntSurvive: "SURVIVE",
      alphaHuntComplete: "SURVIVED!",
      alphaHuntFailed: "FAILED!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "HUNT IN",
      tagline: "SWIM \u2022 TUSK \u2022 EVOLVE",
      newBest: "NEW RECORD!",
      kills: "Kills",
      total: "Lifetime total",
      record: "Record",
      musicLabel: "Music",
      sfxLabel: "SFX",
      regionEntering: "ENTERING",
      regionComplete: "COMPLETED",
      regionPause: "REGION DISCOVERED",
      settingsTitle: "SETTINGS",
      settingsSwap: "Swap Joystick",
      settingsResume: "\u25B6 RESUME",
      goldenBoost: "GOLDEN BOOST UNLOCKED",
      tapToContinue: "TAP TO CONTINUE",
      immune: "IMMUNE!",
      current: "CURRENT"
    },
    pt: {
      play: "JOGAR",
      boost: "IMPULSO",
      respawn: "RENASCER",
      cracked: "PERFURADO!",
      score: "Pontos",
      best: "Melhor",
      stage: "EST\xC1GIO",
      you: "Voc\xEA",
      loading: "Carregando...",
      ready: "Pronto!",
      hintMouseAim: "\u{1F5B1}\uFE0F Mouse para mirar \u2022 W para nadar",
      hintClickBoost: "Clique ou Espa\xE7o para impulso",
      hintRam: "\u{1F984} Presa no corpo para matar",
      hintDragLabel: "Arraste para nadar",
      hintBoostLabel: "Segure para impulso",
      speedBoost: "\u2B50 VELOCIDADE",
      energy: "ENERGIA!",
      speedBoostText: "VELOCIDADE!",
      alphaHuntTitle: "CA\xC7ADA AO ALFA",
      alphaHuntSurvive60: "SOBREVIVA POR 60s",
      alphaHuntSurvive: "SOBREVIVA",
      alphaHuntComplete: "SOBREVIVEU!",
      alphaHuntFailed: "FALHOU!",
      alphaLabel: "ALFA",
      alphaHuntIn: "CA\xC7ADA EM",
      tagline: "NADE \u2022 PERFURE \u2022 EVOLUA",
      newBest: "NOVO RECORDE!",
      kills: "Abates",
      total: "Total acumulado",
      record: "Recorde",
      musicLabel: "M\xFAsica",
      sfxLabel: "Efeitos",
      regionEntering: "ENTRANDO EM",
      regionComplete: "CONCLU\xCDDO",
      regionPause: "REGI\xC3O DESCOBERTA",
      settingsTitle: "CONFIGURA\xC7\xD5ES",
      settingsSwap: "Inverter Joystick",
      settingsResume: "\u25B6 CONTINUAR",
      goldenBoost: "BOOST DOURADO DESBLOQUEADO",
      tapToContinue: "TOQUE PARA CONTINUAR",
      immune: "IMUNE!",
      current: "ATUAL"
    },
    es: {
      play: "JUGAR",
      boost: "IMPULSO",
      respawn: "RENACER",
      cracked: "\xA1ENSARTADO!",
      score: "Puntos",
      best: "Mejor",
      stage: "ETAPA",
      you: "T\xFA",
      loading: "Cargando...",
      ready: "\xA1Listo!",
      hintMouseAim: "\u{1F5B1}\uFE0F Rat\xF3n para apuntar \u2022 W para nadar",
      hintClickBoost: "Clic o Espacio para impulso",
      hintRam: "\u{1F984} Clava el colmillo en el cuerpo para matar",
      hintDragLabel: "Arrastra para nadar",
      hintBoostLabel: "Mant\xE9n para impulso",
      speedBoost: "\u2B50 VELOCIDAD",
      energy: "\xA1ENERG\xCDA!",
      speedBoostText: "\xA1VELOCIDAD!",
      alphaHuntTitle: "CAZA ALFA",
      alphaHuntSurvive60: "SOBREVIVE 60s",
      alphaHuntSurvive: "SOBREVIVE",
      alphaHuntComplete: "\xA1SOBREVIVISTE!",
      alphaHuntFailed: "\xA1FALLASTE!",
      alphaLabel: "ALFA",
      alphaHuntIn: "CAZA EN",
      tagline: "NADAR \u2022 EMBESTIR \u2022 EVOLUCIONAR",
      newBest: "\xA1NUEVO R\xC9CORD!",
      kills: "Bajas",
      total: "Total acumulado",
      record: "R\xE9cord",
      musicLabel: "M\xFAsica",
      sfxLabel: "Efectos",
      regionEntering: "ENTRANDO A",
      regionComplete: "COMPLETADO",
      regionPause: "REGI\xD3N DESCUBIERTA",
      settingsTitle: "AJUSTES",
      settingsSwap: "Cambiar Joystick",
      settingsResume: "\u25B6 CONTINUAR",
      goldenBoost: "BOOST DORADO DESBLOQUEADO",
      tapToContinue: "TOCA PARA CONTINUAR",
      immune: "\xA1INMUNE!",
      current: "ACTUAL"
    },
    fr: {
      play: "JOUER",
      boost: "\xC9LAN",
      respawn: "R\xC9APPARA\xCETRE",
      cracked: "EMBROCH\xC9!",
      score: "Score",
      best: "Meilleur",
      stage: "\xC9TAPE",
      you: "Vous",
      loading: "Chargement...",
      ready: "Pr\xEAt!",
      hintMouseAim: "\u{1F5B1}\uFE0F Souris pour viser \u2022 W pour nager",
      hintClickBoost: "Clic ou Espace pour l'\xE9lan",
      hintRam: "\u{1F984} D\xE9fense dans le corps pour tuer",
      hintDragLabel: "Glissez pour nager",
      hintBoostLabel: "Maintenez l'\xE9lan",
      speedBoost: "\u2B50 VITESSE",
      energy: "\xC9NERGIE!",
      speedBoostText: "VITESSE!",
      alphaHuntTitle: "CHASSE ALPHA",
      alphaHuntSurvive60: "SURVIVEZ 60s",
      alphaHuntSurvive: "SURVIVEZ",
      alphaHuntComplete: "SURV\xC9CU !",
      alphaHuntFailed: "\xC9CHOU\xC9 !",
      alphaLabel: "ALPHA",
      alphaHuntIn: "CHASSE DANS",
      tagline: "NAGER \u2022 TRANSPERCER \u2022 \xC9VOLUER",
      newBest: "NOUVEAU RECORD!",
      kills: "\xC9liminations",
      total: "Total \xE0 vie",
      record: "Record",
      musicLabel: "Musique",
      sfxLabel: "Effets",
      regionEntering: "ENTR\xC9E DANS",
      regionComplete: "TERMIN\xC9",
      regionPause: "R\xC9GION D\xC9COUVERTE",
      settingsTitle: "PARAM\xC8TRES",
      settingsSwap: "Inverser Joystick",
      settingsResume: "\u25B6 CONTINUER",
      goldenBoost: "BOOST DOR\xC9 D\xC9BLOQU\xC9",
      tapToContinue: "TOUCHEZ POUR CONTINUER",
      immune: "IMMUNIS\xC9 !",
      current: "ACTUEL"
    },
    de: {
      play: "SPIELEN",
      boost: "SCHUB",
      respawn: "NEUSTART",
      cracked: "AUFGESPIESST!",
      score: "Punkte",
      best: "Beste",
      stage: "STUFE",
      you: "Du",
      loading: "Laden...",
      ready: "Bereit!",
      hintMouseAim: "\u{1F5B1}\uFE0F Maus zum Zielen \u2022 W zum Schwimmen",
      hintClickBoost: "Klick oder Leertaste f\xFCr Schub",
      hintRam: "\u{1F984} Sto\xDFzahn in den K\xF6rper stechen zum T\xF6ten",
      hintDragLabel: "Ziehen zum Schwimmen",
      hintBoostLabel: "Halten f\xFCr Schub",
      speedBoost: "\u2B50 GESCHWINDIGKEIT",
      energy: "ENERGIE!",
      speedBoostText: "GESCHWINDIGKEIT!",
      alphaHuntTitle: "ALPHA-JAGD",
      alphaHuntSurvive60: "\xDCBERLEBE 60s",
      alphaHuntSurvive: "\xDCBERLEBE",
      alphaHuntComplete: "\xDCBERLEBT!",
      alphaHuntFailed: "GESCHEITERT!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "JAGD IN",
      tagline: "SCHWIMMEN \u2022 STECHEN \u2022 ENTWICKELN",
      newBest: "NEUER REKORD!",
      kills: "Kills",
      total: "Gesamtsumme",
      record: "Rekord",
      musicLabel: "Musik",
      sfxLabel: "Effekte",
      regionEntering: "EINTRITT IN",
      regionComplete: "ABGESCHLOSSEN",
      regionPause: "REGION ENTDECKT",
      settingsTitle: "EINSTELLUNGEN",
      settingsSwap: "Joystick tauschen",
      settingsResume: "\u25B6 FORTSETZEN",
      goldenBoost: "GOLDENER SCHUB ENTSPERRT",
      tapToContinue: "TIPPEN ZUM FORTSETZEN",
      immune: "IMMUN!",
      current: "AKTUELL"
    },
    ja: {
      play: "\u30D7\u30EC\u30A4",
      boost: "\u30B9\u30D1\u30FC\u30C8",
      respawn: "\u30EA\u30B9\u30DD\u30FC\u30F3",
      cracked: "\u6483\u7834\uFF01",
      score: "\u30B9\u30B3\u30A2",
      best: "\u30D9\u30B9\u30C8",
      stage: "\u30B9\u30C6\u30FC\u30B8",
      you: "\u3042\u306A\u305F",
      loading: "\u8AAD\u307F\u8FBC\u307F\u4E2D...",
      ready: "\u6E96\u5099\u5B8C\u4E86\uFF01",
      hintMouseAim: "\u{1F5B1}\uFE0F \u30DE\u30A6\u30B9\u3067\u7167\u6E96 \u2022 W\u3067\u6CF3\u3050",
      hintClickBoost: "\u30AF\u30EA\u30C3\u30AF\u307E\u305F\u306F\u30B9\u30DA\u30FC\u30B9\u3067\u30B9\u30D1\u30FC\u30C8",
      hintRam: "\u{1F984} \u7259\u3067\u4F53\u3092\u7A81\u3044\u3066\u5012\u305B",
      hintDragLabel: "\u30C9\u30E9\u30C3\u30B0\u3067\u79FB\u52D5",
      hintBoostLabel: "\u9577\u62BC\u3057\u3067\u30B9\u30D1\u30FC\u30C8",
      speedBoost: "\u2B50 \u30B9\u30D4\u30FC\u30C9",
      energy: "\u30A8\u30CD\u30EB\u30AE\u30FC\uFF01",
      speedBoostText: "\u30B9\u30D4\u30FC\u30C9\u30A2\u30C3\u30D7\uFF01",
      alphaHuntTitle: "\u30A2\u30EB\u30D5\u30A1\u30CF\u30F3\u30C8",
      alphaHuntSurvive60: "60\u79D2\u751F\u304D\u6B8B\u308C",
      alphaHuntSurvive: "\u751F\u304D\u6B8B\u308C",
      alphaHuntComplete: "\u751F\u9084\uFF01",
      alphaHuntFailed: "\u5931\u6557\uFF01",
      alphaLabel: "ALPHA",
      alphaHuntIn: "\u958B\u59CB\u307E\u3067",
      tagline: "\u6CF3\u3050 \u2022 \u7A81\u304F \u2022 \u9032\u5316",
      newBest: "\u65B0\u8A18\u9332\uFF01",
      kills: "\u30AD\u30EB\u6570",
      total: "\u7D2F\u8A08\u30B9\u30B3\u30A2",
      record: "\u8A18\u9332",
      musicLabel: "\u97F3\u697D",
      sfxLabel: "\u52B9\u679C\u97F3",
      regionEntering: "\u9032\u5165\u4E2D\uFF1A",
      regionComplete: "\u5B8C\u4E86",
      regionPause: "\u30A8\u30EA\u30A2\u767A\u898B",
      settingsTitle: "\u8A2D\u5B9A",
      settingsSwap: "\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u5207\u66FF",
      settingsResume: "\u25B6 \u518D\u958B",
      goldenBoost: "\u30B4\u30FC\u30EB\u30C7\u30F3\u30B9\u30D1\u30FC\u30C8\u89E3\u653E",
      tapToContinue: "\u30BF\u30C3\u30D7\u3057\u3066\u7D9A\u884C",
      immune: "\u7121\u52B9\uFF01",
      current: "\u73FE\u5728"
    },
    ko: {
      play: "\uD50C\uB808\uC774",
      boost: "\uC9C8\uC8FC",
      respawn: "\uBD80\uD65C",
      cracked: "\uACA9\uD30C!",
      score: "\uC810\uC218",
      best: "\uCD5C\uACE0",
      stage: "\uB2E8\uACC4",
      you: "\uB098",
      loading: "\uB85C\uB529 \uC911...",
      ready: "\uC900\uBE44 \uC644\uB8CC!",
      hintMouseAim: "\u{1F5B1}\uFE0F \uB9C8\uC6B0\uC2A4\uB85C \uC870\uC900 \u2022 W\uB85C \uD5E4\uC5C4",
      hintClickBoost: "\uD074\uB9AD \uB610\uB294 \uC2A4\uD398\uC774\uC2A4\uB85C \uC9C8\uC8FC",
      hintRam: "\u{1F984} \uC5C4\uB2C8\uB85C \uBAB8\uD1B5\uC744 \uCC14\uB7EC \uC8FD\uC5EC\uB77C",
      hintDragLabel: "\uB4DC\uB798\uADF8\uB85C \uC774\uB3D9",
      hintBoostLabel: "\uAE38\uAC8C \uB20C\uB7EC \uC9C8\uC8FC",
      speedBoost: "\u2B50 \uC18D\uB3C4 \uC99D\uAC00",
      energy: "\uC5D0\uB108\uC9C0!",
      speedBoostText: "\uC18D\uB3C4 \uC99D\uAC00!",
      alphaHuntTitle: "\uC54C\uD30C \uC0AC\uB0E5",
      alphaHuntSurvive60: "60\uCD08 \uC0DD\uC874",
      alphaHuntSurvive: "\uC0DD\uC874",
      alphaHuntComplete: "\uC0DD\uC874!",
      alphaHuntFailed: "\uC2E4\uD328!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "\uC0AC\uB0E5\uAE4C\uC9C0",
      tagline: "\uD5E4\uC5C4 \u2022 \uAD00\uD1B5 \u2022 \uC9C4\uD654",
      newBest: "\uC2E0\uAE30\uB85D!",
      kills: "\uCC98\uCE58",
      total: "\uB204\uC801 \uC810\uC218",
      record: "\uAE30\uB85D",
      musicLabel: "\uC74C\uC545",
      sfxLabel: "\uD6A8\uACFC\uC74C",
      regionEntering: "\uC9C4\uC785 \uC911:",
      regionComplete: "\uC644\uB8CC",
      regionPause: "\uC9C0\uC5ED \uBC1C\uACAC",
      settingsTitle: "\uC124\uC815",
      settingsSwap: "\uC870\uC774\uC2A4\uD2F1 \uAD50\uCCB4",
      settingsResume: "\u25B6 \uACC4\uC18D",
      goldenBoost: "\uD669\uAE08 \uC9C8\uC8FC \uC7A0\uAE08 \uD574\uC81C",
      tapToContinue: "\uD0ED\uD558\uC5EC \uACC4\uC18D",
      immune: "\uBA74\uC5ED!",
      current: "\uD604\uC7AC"
    },
    zh: {
      play: "\u5F00\u59CB",
      boost: "\u51B2\u523A",
      respawn: "\u91CD\u751F",
      cracked: "\u88AB\u523A\u7A7F\uFF01",
      score: "\u5206\u6570",
      best: "\u6700\u4F73",
      stage: "\u9636\u6BB5",
      you: "\u4F60",
      loading: "\u52A0\u8F7D\u4E2D...",
      ready: "\u51C6\u5907\u5C31\u7EEA\uFF01",
      hintMouseAim: "\u{1F5B1}\uFE0F \u9F20\u6807\u7784\u51C6 \u2022 W\u6E38\u52A8",
      hintClickBoost: "\u70B9\u51FB\u6216\u7A7A\u683C\u952E\u51B2\u523A",
      hintRam: "\u{1F984} \u7528\u957F\u7259\u523A\u7A7F\u8EAB\u4F53\u6765\u51FB\u6740",
      hintDragLabel: "\u62D6\u52A8\u6E38\u52A8",
      hintBoostLabel: "\u6309\u4F4F\u51B2\u523A",
      speedBoost: "\u2B50 \u901F\u5EA6\u63D0\u5347",
      energy: "\u80FD\u91CF\uFF01",
      speedBoostText: "\u901F\u5EA6\u63D0\u5347\uFF01",
      alphaHuntTitle: "\u730E\u6740\u9996\u9886",
      alphaHuntSurvive60: "\u5B58\u6D3B60\u79D2",
      alphaHuntSurvive: "\u5B58\u6D3B",
      alphaHuntComplete: "\u5B58\u6D3B\uFF01",
      alphaHuntFailed: "\u5931\u8D25\uFF01",
      alphaLabel: "ALPHA",
      alphaHuntIn: "\u72E9\u730E\u5012\u8BA1\u65F6",
      tagline: "\u7545\u6E38 \u2022 \u523A\u7A7F \u2022 \u8FDB\u5316",
      newBest: "\u65B0\u7EAA\u5F55\uFF01",
      kills: "\u51FB\u6740",
      total: "\u7D2F\u8BA1\u603B\u5206",
      record: "\u8BB0\u5F55",
      musicLabel: "\u97F3\u4E50",
      sfxLabel: "\u97F3\u6548",
      regionEntering: "\u8FDB\u5165",
      regionComplete: "\u5B8C\u6210",
      regionPause: "\u533A\u57DF\u53D1\u73B0",
      settingsTitle: "\u8BBE\u7F6E",
      settingsSwap: "\u5207\u6362\u6447\u6746",
      settingsResume: "\u25B6 \u7EE7\u7EED",
      goldenBoost: "\u91D1\u8272\u51B2\u523A\u5DF2\u89E3\u9501",
      tapToContinue: "\u70B9\u51FB\u7EE7\u7EED",
      immune: "\u514D\u75AB\uFF01",
      current: "\u5F53\u524D"
    },
    ar: {
      play: "\u0627\u0644\u0639\u0628",
      boost: "\u0627\u0646\u0637\u0644\u0627\u0642",
      respawn: "\u0639\u0648\u062F\u0629",
      cracked: "\u0637\u064F\u0639\u0646\u062A!",
      score: "\u0627\u0644\u0646\u0642\u0627\u0637",
      best: "\u0627\u0644\u0623\u0641\u0636\u0644",
      stage: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629",
      you: "\u0623\u0646\u062A",
      loading: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644...",
      ready: "\u062C\u0627\u0647\u0632!",
      hintMouseAim: "\u{1F5B1}\uFE0F \u0627\u0644\u0645\u0627\u0648\u0633 \u0644\u0644\u062A\u0635\u0648\u064A\u0628 \u2022 W \u0644\u0644\u0633\u0628\u0627\u062D\u0629",
      hintClickBoost: "\u0627\u0646\u0642\u0631 \u0623\u0648 \u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0644\u0644\u0627\u0646\u0637\u0644\u0627\u0642",
      hintRam: "\u{1F984} \u0627\u0637\u0639\u0646 \u0627\u0644\u062C\u0633\u0645 \u0628\u0627\u0644\u0646\u0627\u0628 \u0644\u062A\u0642\u062A\u0644",
      hintDragLabel: "\u0627\u0633\u062D\u0628 \u0644\u0644\u0633\u0628\u0627\u062D\u0629",
      hintBoostLabel: "\u0627\u0636\u063A\u0637 \u0645\u0637\u0648\u0644\u0627\u064B \u0644\u0644\u0627\u0646\u0637\u0644\u0627\u0642",
      speedBoost: "\u2B50 \u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u0633\u0631\u0639\u0629",
      energy: "\u0637\u0627\u0642\u0629!",
      speedBoostText: "\u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u0633\u0631\u0639\u0629!",
      alphaHuntTitle: "\u0635\u064A\u062F \u0623\u0644\u0641\u0627",
      alphaHuntSurvive60: "\u0627\u0646\u062C\u064F 60 \u062B\u0627\u0646\u064A\u0629",
      alphaHuntSurvive: "\u0627\u0646\u062C\u064F",
      alphaHuntComplete: "\u0646\u062C\u0648\u062A!",
      alphaHuntFailed: "\u0641\u0634\u0644\u062A!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "\u0635\u064A\u062F \u062E\u0644\u0627\u0644",
      tagline: "\u0627\u0633\u0628\u062D \u2022 \u0627\u0637\u0639\u0646 \u2022 \u062A\u0637\u0648\u0631",
      newBest: "\u0631\u0642\u0645 \u0642\u064A\u0627\u0633\u064A \u062C\u062F\u064A\u062F!",
      kills: "\u0627\u0644\u0642\u062A\u0644\u0649",
      total: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0643\u0644\u064A",
      record: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u0627\u0633\u064A",
      musicLabel: "\u0645\u0648\u0633\u064A\u0642\u0649",
      sfxLabel: "\u0645\u0624\u062B\u0631\u0627\u062A",
      regionEntering: "\u062F\u062E\u0648\u0644",
      regionComplete: "\u0645\u0643\u062A\u0645\u0644",
      regionPause: "\u0645\u0646\u0637\u0642\u0629 \u0645\u0643\u062A\u0634\u0641\u0629",
      settingsTitle: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A",
      settingsSwap: "\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u062C\u0648\u0633\u062A\u064A\u0643",
      settingsResume: "\u25B6 \u0627\u0633\u062A\u0645\u0631\u0627\u0631",
      goldenBoost: "\u062A\u0645 \u0641\u062A\u062D \u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642 \u0627\u0644\u0630\u0647\u0628\u064A",
      tapToContinue: "\u0627\u0646\u0642\u0631 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629",
      immune: "\u0645\u062D\u0635\u0646!",
      current: "\u0627\u0644\u062D\u0627\u0644\u064A"
    },
    bn: {
      play: "\u0996\u09C7\u09B2\u09C1\u09A8",
      boost: "\u099D\u099F\u0995\u09BE",
      respawn: "\u09AA\u09C1\u09A8\u09B0\u09CD\u099C\u09A8\u09CD\u09AE",
      cracked: "\u09AC\u09BF\u09A6\u09CD\u09A7!",
      score: "\u09B8\u09CD\u0995\u09CB\u09B0",
      best: "\u09B8\u09C7\u09B0\u09BE",
      stage: "\u09A7\u09BE\u09AA",
      you: "\u0986\u09AA\u09A8\u09BF",
      loading: "\u09B2\u09CB\u09A1 \u09B9\u099A\u09CD\u099B\u09C7...",
      ready: "\u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4!",
      hintMouseAim: "\u{1F5B1}\uFE0F \u09AE\u09BE\u0989\u09B8\u09C7 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF \u2022 W \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B8\u09BE\u0981\u09A4\u09BE\u09B0",
      hintClickBoost: "\u0995\u09CD\u09B2\u09BF\u0995 \u09AC\u09BE \u09B8\u09CD\u09AA\u09C7\u09B8 \u09A6\u09BF\u09AF\u09BC\u09C7 \u099D\u099F\u0995\u09BE",
      hintRam: "\u{1F984} \u09A6\u09BE\u0981\u09A4 \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B6\u09B0\u09C0\u09B0 \u09AD\u09C7\u09A6 \u0995\u09B0\u09C7 \u09AE\u09BE\u09B0\u09CB",
      hintDragLabel: "\u099F\u09C7\u09A8\u09C7 \u09B8\u09BE\u0981\u09A4\u09BE\u09B0",
      hintBoostLabel: "\u099A\u09C7\u09AA\u09C7 \u09A7\u09B0\u09C7 \u099D\u099F\u0995\u09BE",
      speedBoost: "\u2B50 \u0997\u09A4\u09BF \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF",
      energy: "\u09B6\u0995\u09CD\u09A4\u09BF!",
      speedBoostText: "\u0997\u09A4\u09BF \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF!",
      alphaHuntTitle: "\u0986\u09B2\u09AB\u09BE \u09B6\u09BF\u0995\u09BE\u09B0",
      alphaHuntSurvive60: "60 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u09AC\u09C7\u0981\u099A\u09C7 \u09A5\u09BE\u0995\u09C1\u09A8",
      alphaHuntSurvive: "\u09AC\u09C7\u0981\u099A\u09C7 \u09A5\u09BE\u0995\u09C1\u09A8",
      alphaHuntComplete: "\u09AC\u09C7\u0981\u099A\u09C7 \u0997\u09C7\u09B2\u09C7\u09A8!",
      alphaHuntFailed: "\u09AC\u09CD\u09AF\u09B0\u09CD\u09A5!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "\u09B6\u09BF\u0995\u09BE\u09B0 \u09B6\u09C1\u09B0\u09C1",
      tagline: "\u09B6\u09BF\u0995\u09BE\u09B0 \u2022 \u09AC\u09BF\u09A6\u09CD\u09A7 \u2022 \u09AC\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8",
      newBest: "\u09A8\u09A4\u09C1\u09A8 \u09B0\u09C7\u0995\u09B0\u09CD\u09A1!",
      kills: "\u09B9\u09A4\u09CD\u09AF\u09BE",
      total: "\u099C\u09C0\u09AC\u09A8\u09AC\u09CD\u09AF\u09BE\u09AA\u09C0 \u09AE\u09CB\u099F",
      record: "\u09B0\u09C7\u0995\u09B0\u09CD\u09A1",
      musicLabel: "\u09B8\u0999\u09CD\u0997\u09C0\u09A4",
      sfxLabel: "\u09B8\u09BE\u0989\u09A8\u09CD\u09A1",
      regionEntering: "\u09AA\u09CD\u09B0\u09AC\u09C7\u09B6 \u0995\u09B0\u099B\u09C7",
      regionComplete: "\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8",
      regionPause: "\u0985\u099E\u09CD\u099A\u09B2 \u0986\u09AC\u09BF\u09B7\u09CD\u0995\u09C3\u09A4",
      settingsTitle: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8",
      settingsSwap: "\u099C\u09AF\u09BC\u09B8\u09CD\u099F\u09BF\u0995 \u09AC\u09A6\u09B2\u09BE\u09A8",
      settingsResume: "\u25B6 \u099A\u09BE\u09B2\u09BF\u09AF\u09BC\u09C7 \u09AF\u09BE\u09A8",
      goldenBoost: "\u09B8\u09CB\u09A8\u09BE\u09B2\u09C0 \u09AC\u09C1\u09B8\u09CD\u099F \u0986\u09A8\u09B2\u0995 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7",
      tapToContinue: "\u099A\u09BE\u09B2\u09BF\u09AF\u09BC\u09C7 \u09AF\u09C7\u09A4\u09C7 \u099F\u09CD\u09AF\u09BE\u09AA \u0995\u09B0\u09C1\u09A8",
      immune: "\u0985\u09A8\u09BE\u0995\u09CD\u09B0\u09AE\u09CD\u09AF!",
      current: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8"
    },
    id: {
      play: "MAIN",
      boost: "DORONGAN",
      respawn: "LAHIR LAGI",
      cracked: "TERTUSUK!",
      score: "Skor",
      best: "Terbaik",
      stage: "TAHAP",
      you: "Kamu",
      loading: "Memuat...",
      ready: "Siap!",
      hintMouseAim: "\u{1F5B1}\uFE0F Mouse untuk membidik \u2022 W untuk berenang",
      hintClickBoost: "Klik atau Spasi untuk dorongan",
      hintRam: "\u{1F984} Tusuk tubuh lawan dengan gading",
      hintDragLabel: "Seret untuk berenang",
      hintBoostLabel: "Tahan untuk dorongan",
      speedBoost: "\u2B50 KECEPATAN",
      energy: "ENERGI!",
      speedBoostText: "KECEPATAN!",
      alphaHuntTitle: "PERBURUAN ALFA",
      alphaHuntSurvive60: "BERTAHAN 60 DETIK",
      alphaHuntSurvive: "BERTAHAN",
      alphaHuntComplete: "SELAMAT!",
      alphaHuntFailed: "GAGAL!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "BERBURU DALAM",
      tagline: "RENANG \u2022 TUSUK \u2022 BERKEMBANG",
      newBest: "REKOR BARU!",
      kills: "Membunuh",
      total: "Total seumur hidup",
      record: "Rekor",
      musicLabel: "Musik",
      sfxLabel: "Efek",
      regionEntering: "MEMASUKI",
      regionComplete: "SELESAI",
      regionPause: "WILAYAH DITEMUKAN",
      settingsTitle: "PENGATURAN",
      settingsSwap: "Tukar Joystick",
      settingsResume: "\u25B6 LANJUTKAN",
      goldenBoost: "DORONGAN EMAS DIBUKA",
      tapToContinue: "KETUK UNTUK MELANJUTKAN",
      immune: "KEBAL!",
      current: "SAAT INI"
    },
    tr: {
      play: "OYNA",
      boost: "HAMLE",
      respawn: "YEN\u0130DEN DO\u011E",
      cracked: "DEL\u0130ND\u0130!",
      score: "Puan",
      best: "En \u0130yi",
      stage: "A\u015EAMA",
      you: "Sen",
      loading: "Y\xFCkleniyor...",
      ready: "Haz\u0131r!",
      hintMouseAim: "\u{1F5B1}\uFE0F Fare ile ni\u015Fan \u2022 W ile y\xFCz",
      hintClickBoost: "T\u0131kla veya Bo\u015Fluk i\xE7in hamle",
      hintRam: "\u{1F984} G\xF6vdeye di\u015Fini sapla, \xF6ld\xFCr",
      hintDragLabel: "S\xFCr\xFCkle hareket et",
      hintBoostLabel: "Bas\u0131l\u0131 tut hamle",
      speedBoost: "\u2B50 HIZ ARTI\u015EI",
      energy: "ENERJ\u0130!",
      speedBoostText: "HIZ ARTI\u015EI!",
      alphaHuntTitle: "ALFA AVI",
      alphaHuntSurvive60: "60 SAN\u0130YE HAYATTA KAL",
      alphaHuntSurvive: "HAYATTA KAL",
      alphaHuntComplete: "HAYATTA KALDIN!",
      alphaHuntFailed: "BA\u015EARISIZ!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "AVA",
      tagline: "Y\xDCZ \u2022 SAPLA \u2022 EVR\u0130M",
      newBest: "YEN\u0130 REKOR!",
      kills: "\xD6ld\xFCrme",
      total: "\xD6m\xFCr boyu toplam",
      record: "Rekor",
      musicLabel: "M\xFCzik",
      sfxLabel: "Efekt",
      regionEntering: "G\u0130R\u0130L\u0130YOR:",
      regionComplete: "TAMAMLANDI",
      regionPause: "B\xD6LGE KE\u015EFED\u0130LD\u0130",
      settingsTitle: "AYARLAR",
      settingsSwap: "Joystick De\u011Fi\u015Ftir",
      settingsResume: "\u25B6 DEVAM ET",
      goldenBoost: "ALTIN HAMLE A\xC7ILDI",
      tapToContinue: "DEVAM ETMEK \u0130\xC7\u0130N DOKUN",
      immune: "BA\u011EI\u015EIK!",
      current: "MEVCUT"
    },
    hi: {
      play: "\u0916\u0947\u0932\u0947\u0902",
      boost: "\u0935\u0947\u0917",
      respawn: "\u092A\u0941\u0928\u0930\u094D\u091C\u0928\u094D\u092E",
      cracked: "\u092C\u093F\u0902\u0927 \u0917\u090F!",
      score: "\u0938\u094D\u0915\u094B\u0930",
      best: "\u0938\u0930\u094D\u0935\u0936\u094D\u0930\u0947\u0937\u094D\u0920",
      stage: "\u091A\u0930\u0923",
      you: "\u0906\u092A",
      loading: "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      ready: "\u0924\u0948\u092F\u093E\u0930!",
      hintMouseAim: "\u{1F5B1}\uFE0F \u092E\u093E\u0909\u0938 \u0938\u0947 \u0928\u093F\u0936\u093E\u0928\u093E \u2022 W \u0938\u0947 \u0924\u0948\u0930\u0947\u0902",
      hintClickBoost: "\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0938\u094D\u092A\u0947\u0938 \u0938\u0947 \u0935\u0947\u0917",
      hintRam: "\u{1F984} \u0926\u093E\u0901\u0924 \u0938\u0947 \u0936\u0930\u0940\u0930 \u092A\u0930 \u0935\u093E\u0930 \u0915\u0930\u0915\u0947 \u092E\u093E\u0930\u094B",
      hintDragLabel: "\u0916\u0940\u0902\u091A\u0915\u0930 \u0924\u0948\u0930\u0947\u0902",
      hintBoostLabel: "\u0926\u092C\u093E\u090F \u0930\u0916\u0947\u0902 \u0935\u0947\u0917",
      speedBoost: "\u2B50 \u0938\u094D\u092A\u0940\u0921 \u092C\u0942\u0938\u094D\u091F",
      energy: "\u090A\u0930\u094D\u091C\u093E!",
      speedBoostText: "\u0938\u094D\u092A\u0940\u0921 \u092C\u0942\u0938\u094D\u091F!",
      alphaHuntTitle: "\u0905\u0932\u094D\u092B\u093E \u0936\u093F\u0915\u093E\u0930",
      alphaHuntSurvive60: "60 \u0938\u0947\u0915\u0902\u0921 \u091C\u0940\u0935\u093F\u0924 \u0930\u0939\u0947\u0902",
      alphaHuntSurvive: "\u091C\u0940\u0935\u093F\u0924 \u0930\u0939\u0947\u0902",
      alphaHuntComplete: "\u092C\u091A \u0917\u090F!",
      alphaHuntFailed: "\u0935\u093F\u092B\u0932!",
      alphaLabel: "ALPHA",
      alphaHuntIn: "\u0936\u093F\u0915\u093E\u0930 \u092E\u0947\u0902",
      tagline: "\u0936\u093F\u0915\u093E\u0930 \u2022 \u092D\u0947\u0926\u094B \u2022 \u0935\u093F\u0915\u093E\u0938",
      newBest: "\u0928\u092F\u093E \u0930\u093F\u0915\u0949\u0930\u094D\u0921!",
      kills: "\u092E\u093E\u0930\u0924\u093E \u0939\u0948",
      total: "\u0906\u091C\u0940\u0935\u0928 \u0915\u0941\u0932",
      record: "\u0930\u093F\u0915\u0949\u0930\u094D\u0921",
      musicLabel: "\u0938\u0902\u0917\u0940\u0924",
      sfxLabel: "\u092A\u094D\u0930\u092D\u093E\u0935",
      regionEntering: "\u092A\u094D\u0930\u0935\u0947\u0936 \u0915\u0930 \u0930\u0939\u093E \u0939\u0948:",
      regionComplete: "\u092A\u0942\u0930\u094D\u0923",
      regionPause: "\u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0916\u094B\u091C\u093E",
      settingsTitle: "\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938",
      settingsSwap: "\u091C\u0949\u092F\u0938\u094D\u091F\u093F\u0915 \u092C\u0926\u0932\u0947\u0902",
      settingsResume: "\u25B6 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902",
      goldenBoost: "\u0917\u094B\u0932\u094D\u0921\u0928 \u092C\u0942\u0938\u094D\u091F \u0905\u0928\u0932\u0949\u0915 \u0939\u0941\u0906",
      tapToContinue: "\u091C\u093E\u0930\u0940 \u0930\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091F\u0948\u092A \u0915\u0930\u0947\u0902",
      immune: "\u092A\u094D\u0930\u0924\u093F\u0930\u0915\u094D\u0937\u093F\u0924!",
      current: "\u0935\u0930\u094D\u0924\u092E\u093E\u0928"
    }
  };
  var currentLang = "en";
  function detectLanguage() {
    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    const code = nav.split("-")[0];
    if (TRANSLATIONS[code])
      return code;
    if (nav.startsWith("pt"))
      return "pt";
    if (nav.startsWith("zh"))
      return "zh";
    if (nav.startsWith("ar"))
      return "ar";
    if (nav.startsWith("bn"))
      return "bn";
    if (nav.startsWith("id"))
      return "id";
    if (nav.startsWith("tr"))
      return "tr";
    if (nav.startsWith("hi"))
      return "hi";
    return "en";
  }
  function t(key) {
    const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return lang[key] || TRANSLATIONS.en[key] || key;
  }
  var CANVAS_WIDTH = 720;
  var CANVAS_HEIGHT = 1280;
  var CAMERA_FOLLOW_RATE = 8.36;
  var SAFE_SPAWN_DISTANCE = 300;
  var AI_PROFILE_TUNING = Object.freeze({
    casual: Object.freeze({
      turnSpeed: 3,
      speedMult: 0.86,
      thinkMult: 1.45,
      dangerRadius: 190,
      dangerThreshold: 0.22,
      reactionMin: 0.7,
      reactionMax: 1.1,
      fleeChance: 0.55,
      fleeBoostChance: 0.015,
      botBoostChance: 0.01,
      predatorChance: 0.34,
      sharkBoostChance: 0.16
    }),
    opportunist: Object.freeze({
      turnSpeed: 4.2,
      speedMult: 0.92,
      thinkMult: 1.15,
      dangerRadius: 250,
      dangerThreshold: 0.19,
      reactionMin: 0.4,
      reactionMax: 0.7,
      fleeChance: 0.7,
      fleeBoostChance: 0.1,
      botBoostChance: 0.05,
      predatorChance: 0.54,
      sharkBoostChance: 0.24
    }),
    aggressive: Object.freeze({
      turnSpeed: 5.8,
      speedMult: 0.98,
      thinkMult: 1,
      dangerRadius: 300,
      dangerThreshold: 0.2,
      reactionMin: 0.28,
      reactionMax: 0.5,
      fleeChance: 0.35,
      fleeBoostChance: 0.1,
      botBoostChance: 0.09,
      predatorChance: 0.72,
      sharkBoostChance: 0.2
    })
  });
  var DEATH_DISPLAY_TIME = 5e3;
  var DEATH_DISPLAY_TIME_NEW_BEST = 5e3;
  var SUPER_ORB_DECAY_TIME = 16e3;
  var MAX_SUPER_ORBS = 72;
  var MAX_PARTICLES = 120;
  function particleBudget() {
    return perfQuality === 2 ? MAX_PARTICLES : perfQuality === 1 ? 96 : 64;
  }
  var LOOT_SPAWN_DURATION = 0.34;
  var LOOT_COLLECT_DELAY = 0.3;
  var MIN_DT = 1 / 240;
  var MAX_DT = 0.1;
  var TWO_PI = Math.PI * 2;
  var MINIMAP_UPDATE_INTERVAL = 0.1;
  var LEADERBOARD_UPDATE_INTERVAL = 0.5;
  var SPEED_BUFF_DURATION = 4;
  var SPEED_BUFF_MULTIPLIER = 1.34;
  var ATLAS_MAX_SCORE = 3e4;
  var ATLAS_SAVE_VERSION = 4;
  var ATLAS_THEMES = [
    {
      id: "open-waters",
      threshold: 0,
      // Expedition I: 0-999
      names: { en: "Cradle of the Tides", pt: "Ber\xE7o das Mar\xE9s", es: "Cuna de las Mareas", fr: "Berceau des Mar\xE9es", de: "Wiege der Gezeiten", ja: "\u6F6E\u306E\u63FA\u308A\u304B\u3054", ko: "\uC870\uB958\uC758 \uC694\uB78C", zh: "\u6F6E\u6C50\u6447\u7BEE", ar: "\u0645\u0647\u062F \u0627\u0644\u0645\u062F \u0648\u0627\u0644\u062C\u0632\u0631", id: "Buaian Pasang Surut", tr: "Gelgitlerin Be\u015Fi\u011Fi", hi: "\u0932\u0939\u0930\u094B\u0902 \u0915\u093E \u092A\u093E\u0932\u0928\u093E", bn: "\u099C\u09CB\u09AF\u09BC\u09BE\u09B0\u09C7\u09B0 \u09A6\u09CB\u09B2\u09A8\u09BE" },
      waterColor: "#7DD4CC",
      textureAlpha: 0.52,
      mirrorWrap: false,
      backgroundIds: ["ocean_background_open_waters", "ocean_background_deep_blue"],
      planktonIds: ["collectible_plankton_open_waters", "collectible_plankton"],
      decorSlots: [
        ["decor_coral_rocks"],
        ["decor_ocean_rocks"],
        ["decor_seagrass"],
        ["decor_shells"]
      ],
      fishVariants: [0, 4]
      // sardinha + palhaço
    },
    {
      id: "coral-gardens",
      threshold: 1e3,
      // Expedition I: 1000-2999
      names: { en: "Emerald Forest", pt: "Floresta Esmeralda", es: "Bosque Esmeralda", fr: "For\xEAt \xC9meraude", de: "Smaragdwald", ja: "\u30A8\u30E1\u30E9\u30EB\u30C9\u306E\u68EE", ko: "\uC5D0\uBA54\uB784\uB4DC \uC232", zh: "\u7FE1\u7FE0\u68EE\u6797", ar: "\u063A\u0627\u0628\u0629 \u0627\u0644\u0632\u0645\u0631\u062F", id: "Hutan Zamrud", tr: "Z\xFCmr\xFCt Orman\u0131", hi: "\u092A\u0928\u094D\u0928\u093E \u0935\u0928", bn: "\u09AA\u09BE\u09A8\u09CD\u09A8\u09BE \u09AC\u09A8" },
      waterColor: "#4A9E98",
      textureAlpha: 0.58,
      mirrorWrap: true,
      backgroundIds: ["ocean_background_coral_gardens", "ocean_background_open_waters", "ocean_background_deep_blue"],
      planktonIds: ["collectible_plankton_coral_gardens", "collectible_plankton_open_waters", "collectible_plankton"],
      decorSlots: [
        ["decor_anemone"],
        ["decor_kelp_patch"],
        ["decor_seagrass"],
        ["decor_ocean_rocks"]
      ],
      fishVariants: [0, 2]
      // sardinha + água-viva
    },
    {
      id: "sunken-route",
      threshold: 3e3,
      // Expedition I: 3000-5999
      names: { en: "Sharkwreck", pt: "Naufr\xE1gio dos Tubar\xF5es", es: "Naufragio de Tiburones", fr: "\xC9pave aux Requins", de: "Hai-Wrack", ja: "\u30B5\u30E1\u306E\u96E3\u7834\u8239", ko: "\uC0C1\uC5B4 \uB09C\uD30C\uC120", zh: "\u9CA8\u9C7C\u6C89\u8239", ar: "\u062D\u0637\u0627\u0645 \u0627\u0644\u0642\u0631\u0648\u0634", id: "Bangkai Hiu", tr: "K\xF6pekbal\u0131\u011F\u0131 Enkaz\u0131", hi: "\u0936\u093E\u0930\u094D\u0915 \u0915\u093E \u092E\u0932\u092C\u093E", bn: "\u09B9\u09BE\u0999\u09CD\u0997\u09B0 \u09A7\u09CD\u09AC\u0982\u09B8\u09BE\u09AC\u09B6\u09C7\u09B7" },
      waterColor: "#5A8A9A",
      textureAlpha: 0.64,
      mirrorWrap: true,
      backgroundIds: ["ocean_background_sunken_route", "ocean_background_coral_gardens", "ocean_background_open_waters", "ocean_background_deep_blue"],
      planktonIds: ["collectible_plankton_sunken_route", "collectible_plankton_coral_gardens", "collectible_plankton"],
      decorSlots: [
        ["decor_ship_barrel"],
        ["decor_kelp_patch"],
        ["decor_whale_skeleton"],
        ["decor_ocean_rocks"]
      ],
      decorMaxCounts: { decor_whale_skeleton: 1 },
      fishVariants: [0, 4]
      // sardinha + palhaço
    },
    {
      id: "twilight-abyss",
      threshold: 6e3,
      // Expedition I: 6000-9999
      names: { en: "Kraken's Throne", pt: "Trono do Kraken", es: "Trono del Kraken", fr: "Tr\xF4ne du Kraken", de: "Krakenthron", ja: "\u30AF\u30E9\u30FC\u30B1\u30F3\u306E\u7389\u5EA7", ko: "\uD06C\uB77C\uCF04\uC758 \uC655\uC88C", zh: "\u514B\u62C9\u80AF\u738B\u5EA7", ar: "\u0639\u0631\u0634 \u0627\u0644\u0643\u0631\u0627\u0643\u0646", id: "Takhta Kraken", tr: "Kraken'in Taht\u0131", hi: "\u0915\u094D\u0930\u0948\u0915\u0947\u0928 \u0915\u093E \u0938\u093F\u0902\u0939\u093E\u0938\u0928", bn: "\u0995\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09C7\u09A8\u09C7\u09B0 \u09B8\u09BF\u0982\u09B9\u09BE\u09B8\u09A8" },
      waterColor: "#2A5A7A",
      textureAlpha: 0.42,
      mirrorWrap: false,
      backgroundIds: ["ocean_background_deep_blue", "ocean_background_sunken_route", "ocean_background_open_waters"],
      planktonIds: ["collectible_plankton_abyssal_bloom", "collectible_plankton_sunken_route", "collectible_plankton"],
      decorSlots: [
        ["decor_ocean_rocks"],
        ["decor_bioluminescent_coral"],
        ["decor_anemone"],
        ["decor_kelp_patch"]
      ],
      decorCount: 36,
      decorMaxCounts: { decor_bioluminescent_coral: 10, decor_anemone: 5 },
      fishVariants: [3, 2]
      // anglerfish + jellyfish
    }
  ];
  var activeAtlasTheme = ATLAS_THEMES[0];
  var _atlasThemeLoadNonce = 0;
  var _atlasCheckTimer = 0;
  var _persistenceSaveTimer = 20;
  var atlasCommittedRunMass = 0;
  var atlasCycleScore = 0;
  var atlasExpedition = 1;
  var atlasCompletions = 0;
  var _pendingNewExpedition = false;
  function getExpeditionThresholds(expedition) {
    if (expedition <= 1)
      return [0, 1e3, 3e3, 6e3, 1e4];
    return [0, 3e3, 6e3, 9e3, 12e3];
  }
  function getExpeditionMaxScore(expedition) {
    if (expedition === void 0)
      expedition = atlasExpedition;
    return expedition <= 1 ? 1e4 : 12e3;
  }
  function remapAtlasScoreBetweenCurves(score, oldThresholds, newThresholds) {
    const safeScore = Math.max(0, Number(score) || 0);
    let seaIndex = 0;
    for (let i = 1; i < oldThresholds.length; i++) {
      if (safeScore >= oldThresholds[i])
        seaIndex = i;
      else
        break;
    }
    if (seaIndex >= oldThresholds.length - 1)
      return newThresholds[newThresholds.length - 1];
    const oldStart = oldThresholds[seaIndex];
    const oldEnd = oldThresholds[seaIndex + 1];
    const localProgress = clamp((safeScore - oldStart) / Math.max(1, oldEnd - oldStart), 0, 1);
    const newStart = newThresholds[seaIndex];
    const newEnd = newThresholds[seaIndex + 1];
    return Math.round(newStart + (newEnd - newStart) * localProgress);
  }
  function applyAtlasDelta(delta) {
    if (delta <= 0)
      return;
    totalScoreAccum += delta;
    const thresholds = getExpeditionThresholds(atlasExpedition);
    const currentIdx = Math.max(0, ATLAS_THEMES.findIndex((t2) => t2.id === activeAtlasTheme.id));
    const seaCeiling = thresholds[Math.min(currentIdx + 1, thresholds.length - 1)];
    atlasCycleScore = Math.min(atlasCycleScore + delta, seaCeiling);
  }
  function atlasLocale() {
    return currentLang;
  }
  function atlasText(key) {
    const copy = {
      en: {
        title: "OCEAN ATLAS",
        discovered: "OCEAN DISCOVERED",
        newRegion: "NEW REGION DISCOVERED",
        newSea: "NEW SEA DISCOVERED",
        king: "KING OF THE SEAS",
        progress: "discovered",
        next: "Next region",
        complete: "Every region has been charted.",
        expedition: "OCEAN",
        keepExploring: "Explore through real runs. No gameplay bonuses.",
        seaOf: "SEA {n} OF {t}",
        finalReward: "FINAL REWARD",
        expeditionLabel: "EXPEDITION {n}",
        expeditionComplete: "EXPEDITION COMPLETE"
      },
      pt: {
        title: "ATLAS DO OCEANO",
        discovered: "OCEANO DESCOBERTO",
        newRegion: "NOVA REGI\xC3O DESCOBERTA",
        newSea: "NOVO MAR DESCOBERTO",
        king: "REI DOS MARES",
        progress: "descoberto",
        next: "Pr\xF3xima regi\xE3o",
        complete: "Todas as regi\xF5es foram mapeadas.",
        expedition: "OCEANO",
        keepExploring: "Descubra em partidas reais. Sem b\xF4nus de poder.",
        seaOf: "MAR {n} DE {t}",
        finalReward: "RECOMPENSA FINAL",
        expeditionLabel: "EXPEDI\xC7\xC3O {n}",
        expeditionComplete: "EXPEDI\xC7\xC3O CONCLU\xCDDA"
      },
      es: {
        title: "ATLAS OCE\xC1NICO",
        discovered: "OC\xC9ANO DESCUBIERTO",
        newRegion: "NUEVA REGI\xD3N",
        newSea: "NUEVO MAR DESCUBIERTO",
        king: "REY DE LOS MARES",
        progress: "descubierto",
        next: "Siguiente regi\xF3n",
        complete: "Todas las regiones cartografiadas.",
        expedition: "OC\xC9ANO",
        keepExploring: "Explora en partidas reales. Sin bonus.",
        seaOf: "MAR {n} DE {t}",
        finalReward: "RECOMPENSA FINAL",
        expeditionLabel: "EXPEDICI\xD3N {n}",
        expeditionComplete: "EXPEDICI\xD3N COMPLETADA"
      },
      fr: {
        title: "ATLAS OC\xC9AN",
        discovered: "OC\xC9AN D\xC9COUVERT",
        newRegion: "NOUVELLE R\xC9GION",
        newSea: "NOUVELLE MER D\xC9COUVERTE",
        king: "ROI DES MERS",
        progress: "d\xE9couvert",
        next: "Prochaine r\xE9gion",
        complete: "Toutes les r\xE9gions cartographi\xE9es.",
        expedition: "OC\xC9AN",
        keepExploring: "Explorez en parties r\xE9elles. Pas de bonus.",
        seaOf: "MER {n} SUR {t}",
        finalReward: "R\xC9COMPENSE FINALE",
        expeditionLabel: "EXP\xC9DITION {n}",
        expeditionComplete: "EXP\xC9DITION TERMIN\xC9E"
      },
      de: {
        title: "OZEAN-ATLAS",
        discovered: "OZEAN ENTDECKT",
        newRegion: "NEUE REGION",
        newSea: "NEUES MEER ENTDECKT",
        king: "K\xD6NIG DER MEERE",
        progress: "entdeckt",
        next: "N\xE4chste Region",
        complete: "Alle Regionen kartiert.",
        expedition: "OZEAN",
        keepExploring: "Entdecke in echten Spielen. Keine Boni.",
        seaOf: "MEER {n} VON {t}",
        finalReward: "ENDBELOHNUNG",
        expeditionLabel: "EXPEDITION {n}",
        expeditionComplete: "EXPEDITION ABGESCHLOSSEN"
      },
      ja: {
        title: "\u6D77\u6D0B\u30A2\u30C8\u30E9\u30B9",
        discovered: "\u6D77\u6D0B\u767A\u898B",
        newRegion: "\u65B0\u30A8\u30EA\u30A2\u767A\u898B",
        newSea: "\u65B0\u3057\u3044\u6D77\u3092\u767A\u898B",
        king: "\u6D77\u306E\u738B",
        progress: "\u767A\u898B\u6E08\u307F",
        next: "\u6B21\u306E\u30A8\u30EA\u30A2",
        complete: "\u5168\u30A8\u30EA\u30A2\u63A2\u7D22\u5B8C\u4E86\u3002",
        expedition: "\u6D77\u6D0B",
        keepExploring: "\u5B9F\u969B\u306E\u30D7\u30EC\u30A4\u3067\u767A\u898B\u3002\u30DC\u30FC\u30CA\u30B9\u306A\u3057\u3002",
        seaOf: "\u6D77\u57DF {n}/{t}",
        finalReward: "\u6700\u7D42\u5831\u916C",
        expeditionLabel: "\u9060\u5F81 {n}",
        expeditionComplete: "\u9060\u5F81\u5B8C\u4E86"
      },
      ko: {
        title: "\uD574\uC591 \uC9C0\uB3C4",
        discovered: "\uD574\uC591 \uBC1C\uACAC",
        newRegion: "\uC0C8 \uC9C0\uC5ED \uBC1C\uACAC",
        newSea: "\uC0C8\uB85C\uC6B4 \uBC14\uB2E4 \uBC1C\uACAC",
        king: "\uBC14\uB2E4\uC758 \uC655",
        progress: "\uBC1C\uACAC\uB428",
        next: "\uB2E4\uC74C \uC9C0\uC5ED",
        complete: "\uBAA8\uB4E0 \uC9C0\uC5ED \uD0D0\uC0AC \uC644\uB8CC.",
        expedition: "\uD574\uC591",
        keepExploring: "\uC2E4\uC81C \uD50C\uB808\uC774\uB85C \uBC1C\uACAC. \uBCF4\uB108\uC2A4 \uC5C6\uC74C.",
        seaOf: "\uBC14\uB2E4 {n}/{t}",
        finalReward: "\uCD5C\uC885 \uBCF4\uC0C1",
        expeditionLabel: "\uD0D0\uD5D8 {n}",
        expeditionComplete: "\uD0D0\uD5D8 \uC644\uB8CC"
      },
      zh: {
        title: "\u6D77\u6D0B\u56FE\u9274",
        discovered: "\u6D77\u6D0B\u5DF2\u53D1\u73B0",
        newRegion: "\u65B0\u533A\u57DF\u53D1\u73B0",
        newSea: "\u53D1\u73B0\u65B0\u6D77\u57DF",
        king: "\u6D77\u6D0B\u4E4B\u738B",
        progress: "\u5DF2\u53D1\u73B0",
        next: "\u4E0B\u4E00\u533A\u57DF",
        complete: "\u6240\u6709\u533A\u57DF\u5DF2\u63A2\u7D22\u3002",
        expedition: "\u6D77\u6D0B",
        keepExploring: "\u5728\u6E38\u620F\u4E2D\u63A2\u7D22\u3002\u65E0\u52A0\u6210\u5956\u52B1\u3002",
        seaOf: "\u6D77\u57DF {n}/{t}",
        finalReward: "\u6700\u7EC8\u5956\u52B1",
        expeditionLabel: "\u8FDC\u5F81 {n}",
        expeditionComplete: "\u8FDC\u5F81\u5B8C\u6210"
      },
      ar: {
        title: "\u0623\u0637\u0644\u0633 \u0627\u0644\u0645\u062D\u064A\u0637",
        discovered: "\u062A\u0645 \u0627\u0644\u0627\u0643\u062A\u0634\u0627\u0641",
        newRegion: "\u0645\u0646\u0637\u0642\u0629 \u062C\u062F\u064A\u062F\u0629",
        newSea: "\u0628\u062D\u0631 \u062C\u062F\u064A\u062F \u0645\u0643\u062A\u0634\u0641",
        king: "\u0645\u0644\u0643 \u0627\u0644\u0628\u062D\u0627\u0631",
        progress: "\u0645\u0643\u062A\u0634\u0641",
        next: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629",
        complete: "\u062A\u0645 \u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0643\u0644 \u0627\u0644\u0645\u0646\u0627\u0637\u0642.",
        expedition: "\u0627\u0644\u0645\u062D\u064A\u0637",
        keepExploring: "\u0627\u0643\u062A\u0634\u0641 \u0645\u0646 \u062E\u0644\u0627\u0644 \u0627\u0644\u0644\u0639\u0628. \u0628\u062F\u0648\u0646 \u0645\u0643\u0627\u0641\u0622\u062A.",
        seaOf: "\u0627\u0644\u0628\u062D\u0631 {n} \u0645\u0646 {t}",
        finalReward: "\u0627\u0644\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629",
        expeditionLabel: "\u0631\u062D\u0644\u0629 {n}",
        expeditionComplete: "\u0627\u0643\u062A\u0645\u0644\u062A \u0627\u0644\u0631\u062D\u0644\u0629"
      },
      id: {
        title: "ATLAS LAUT",
        discovered: "LAUTAN DITEMUKAN",
        newRegion: "WILAYAH BARU",
        newSea: "LAUT BARU DITEMUKAN",
        king: "RAJA LAUTAN",
        progress: "ditemukan",
        next: "Wilayah berikut",
        complete: "Semua wilayah dipetakan.",
        expedition: "LAUTAN",
        keepExploring: "Jelajahi lewat bermain. Tanpa bonus.",
        seaOf: "LAUT {n} DARI {t}",
        finalReward: "HADIAH AKHIR",
        expeditionLabel: "EKSPEDISI {n}",
        expeditionComplete: "EKSPEDISI SELESAI"
      },
      tr: {
        title: "OKYANUS ATLASI",
        discovered: "OKYANUS KE\u015EFED\u0130LD\u0130",
        newRegion: "YEN\u0130 B\xD6LGE",
        newSea: "YEN\u0130 DEN\u0130Z KE\u015EFED\u0130LD\u0130",
        king: "DEN\u0130ZLER\u0130N KRALI",
        progress: "ke\u015Ffedildi",
        next: "Sonraki b\xF6lge",
        complete: "T\xFCm b\xF6lgeler haritaland\u0131.",
        expedition: "OKYANUS",
        keepExploring: "Ger\xE7ek oyunlarla ke\u015Ffet. Bonus yok.",
        seaOf: "DEN\u0130Z {n}/{t}",
        finalReward: "F\u0130NAL \xD6D\xDCL\xDC",
        expeditionLabel: "KE\u015E\u0130F {n}",
        expeditionComplete: "KE\u015E\u0130F TAMAMLANDI"
      },
      hi: {
        title: "\u0938\u093E\u0917\u0930 \u090F\u091F\u0932\u0938",
        discovered: "\u0938\u093E\u0917\u0930 \u0916\u094B\u091C\u093E",
        newRegion: "\u0928\u092F\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930",
        newSea: "\u0928\u092F\u093E \u0938\u092E\u0941\u0926\u094D\u0930 \u0916\u094B\u091C\u093E",
        king: "\u0938\u092E\u0941\u0926\u094D\u0930 \u0915\u093E \u0930\u093E\u091C\u093E",
        progress: "\u0916\u094B\u091C\u093E \u0917\u092F\u093E",
        next: "\u0905\u0917\u0932\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930",
        complete: "\u0938\u092D\u0940 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u092E\u0948\u092A \u0939\u094B \u0917\u090F\u0964",
        expedition: "\u092E\u0939\u093E\u0938\u093E\u0917\u0930",
        keepExploring: "\u0916\u0947\u0932\u0915\u0930 \u0916\u094B\u091C\u0947\u0902\u0964 \u0915\u094B\u0908 \u092C\u094B\u0928\u0938 \u0928\u0939\u0940\u0902\u0964",
        seaOf: "\u0938\u092E\u0941\u0926\u094D\u0930 {n}/{t}",
        finalReward: "\u0905\u0902\u0924\u093F\u092E \u092A\u0941\u0930\u0938\u094D\u0915\u093E\u0930",
        expeditionLabel: "\u0905\u092D\u093F\u092F\u093E\u0928 {n}",
        expeditionComplete: "\u0905\u092D\u093F\u092F\u093E\u0928 \u092A\u0942\u0930\u094D\u0923"
      },
      bn: {
        title: "\u09B8\u09BE\u0997\u09B0 \u0985\u09CD\u09AF\u09BE\u099F\u09B2\u09BE\u09B8",
        discovered: "\u09B8\u09BE\u0997\u09B0 \u0986\u09AC\u09BF\u09B7\u09CD\u0995\u09C3\u09A4",
        newRegion: "\u09A8\u09A4\u09C1\u09A8 \u0985\u099E\u09CD\u099A\u09B2",
        newSea: "\u09A8\u09A4\u09C1\u09A8 \u09B8\u09BE\u0997\u09B0 \u0986\u09AC\u09BF\u09B7\u09CD\u0995\u09C3\u09A4",
        king: "\u09B8\u09BE\u0997\u09B0\u09C7\u09B0 \u09B0\u09BE\u099C\u09BE",
        progress: "\u0986\u09AC\u09BF\u09B7\u09CD\u0995\u09C3\u09A4",
        next: "\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u0985\u099E\u09CD\u099A\u09B2",
        complete: "\u09B8\u09AC \u0985\u099E\u09CD\u099A\u09B2 \u0985\u09A8\u09CD\u09AC\u09C7\u09B7\u09BF\u09A4\u0964",
        expedition: "\u09B8\u09AE\u09C1\u09A6\u09CD\u09B0",
        keepExploring: "\u0996\u09C7\u09B2\u09C7 \u0986\u09AC\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 \u0995\u09CB\u09A8\u09CB \u09AC\u09CB\u09A8\u09BE\u09B8 \u09A8\u09C7\u0987\u0964",
        seaOf: "\u09B8\u09BE\u0997\u09B0 {n}/{t}",
        finalReward: "\u099A\u09C2\u09A1\u09BC\u09BE\u09A8\u09CD\u09A4 \u09AA\u09C1\u09B0\u09B8\u09CD\u0995\u09BE\u09B0",
        expeditionLabel: "\u0985\u09AD\u09BF\u09AF\u09BE\u09A8 {n}",
        expeditionComplete: "\u0985\u09AD\u09BF\u09AF\u09BE\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8"
      }
    };
    const lang = copy[currentLang] || copy.en;
    return lang[key] || copy.en[key] || key;
  }
  function getAtlasSeaLabel(theme = activeAtlasTheme) {
    const seaWords = {
      en: "SEA",
      pt: "MAR",
      es: "MAR",
      fr: "MER",
      de: "MEER",
      ja: "\u6D77\u57DF",
      ko: "\uBC14\uB2E4",
      zh: "\u6D77\u57DF",
      ar: "\u0627\u0644\u0628\u062D\u0631",
      id: "LAUT",
      tr: "DEN\u0130Z",
      hi: "\u0938\u092E\u0941\u0926\u094D\u0930",
      bn: "\u09B8\u09BE\u0997\u09B0"
    };
    const index = Math.max(0, ATLAS_THEMES.findIndex((candidate) => candidate.id === theme.id));
    return `${seaWords[currentLang] || seaWords.en} ${index + 1}`;
  }
  function getAtlasLiveScore() {
    let score = atlasCycleScore;
    if (playerNarwhal && !playerNarwhal.dying && !isPlayerDead) {
      score += Math.max(0, playerNarwhal.mass - atlasCommittedRunMass);
    }
    const thresholds = getExpeditionThresholds(atlasExpedition);
    const currentIdx = Math.max(0, ATLAS_THEMES.findIndex((t2) => t2.id === activeAtlasTheme.id));
    const seaCeiling = thresholds[Math.min(currentIdx + 1, thresholds.length - 1)];
    return Math.min(score, seaCeiling);
  }
  function commitCurrentRunToAtlas() {
    if (!playerNarwhal || playerNarwhal.dying || isPlayerDead)
      return 0;
    if (_seaCeremonyState !== "idle")
      return 0;
    const delta = Math.max(0, playerNarwhal.mass - atlasCommittedRunMass);
    if (delta <= 0)
      return 0;
    applyAtlasDelta(delta);
    atlasCommittedRunMass = playerNarwhal.mass;
    return delta;
  }
  function getAtlasThemeForScore(score) {
    if (score === void 0)
      score = getAtlasLiveScore();
    const thresholds = getExpeditionThresholds(atlasExpedition);
    let themeIndex = 0;
    for (let i = 1; i < ATLAS_THEMES.length; i++) {
      if (score >= thresholds[i])
        themeIndex = i;
      else
        break;
    }
    return ATLAS_THEMES[themeIndex];
  }
  function getAtlasRegionPercent(score = getAtlasLiveScore(), theme = getAtlasThemeForScore(score)) {
    const thresholds = getExpeditionThresholds(atlasExpedition);
    const index = Math.max(0, ATLAS_THEMES.findIndex((candidate) => candidate.id === theme.id));
    const start = thresholds[index];
    const end = thresholds[Math.min(index + 1, thresholds.length - 1)];
    if (score >= end)
      return 100;
    if (score <= start)
      return 0;
    const rounded = Math.round(clamp((score - start) / (end - start), 0, 1) * 100);
    return Math.max(1, Math.min(99, rounded));
  }
  function getAtlasPercent() {
    return getAtlasRegionPercent();
  }
  function getAtlasThemeName(theme = activeAtlasTheme) {
    return theme.names[atlasLocale()] || theme.names.en;
  }
  function getAtlasWaterColor() {
    return activeAtlasTheme && activeAtlasTheme.waterColor || window.gameConfig.visual.backgroundColor;
  }
  function setActiveAtlasTheme(theme, shouldLoad = true, force = false, skipTransition = false) {
    if (!theme)
      return;
    if (!force && activeAtlasTheme && activeAtlasTheme.id === theme.id) {
      updateAtlasUI();
      return;
    }
    const previousTheme = activeAtlasTheme;
    activeAtlasTheme = theme;
    backgroundPattern = null;
    decoFishTintedSprites = {};
    if (decoFishList.length > 0)
      initDecoFish();
    if (shouldLoad && assetsLoaded)
      loadActiveAtlasThemeVisuals();
    initOrcaPredator();
    initKrakenPresence();
    initWreckPresence();
    syncBackgroundMusicForTheme();
    updateAtlasUI();
    if (!skipTransition && previousTheme && previousTheme.id !== theme.id && gameStarted && !isPlayerDead) {
      showRegionTransition(theme, previousTheme);
    }
  }
  var DECO_SCHOOL_COUNT_HIGH = 34;
  var DECO_SCHOOL_COUNT_MED = 22;
  var DECO_SCHOOL_COUNT_LOW = 12;
  var DECO_FISH_PER_SCHOOL_MIN = 5;
  var DECO_FISH_PER_SCHOOL_MAX = 18;
  var DECO_FISH_OPACITY = 0.28;
  var DECO_FISH_DRIFT = 10;
  var DECO_FISH_FLINCH_RADIUS = 95;
  var DECO_FISH_FLINCH_DURATION = 0.7;
  var DECO_FISH_FLINCH_SPEED = 90;
  var DECO_FISH_LEASH = 180;
  var BOID_SEPARATION_DIST = 55;
  var BOID_NEIGHBOR_RADIUS = 110;
  var BOID_SEPARATION_WEIGHT = 160;
  var BOID_ALIGNMENT_WEIGHT = 2;
  var BOID_COHESION_WEIGHT = 10;
  var BOID_ANCHOR_WEIGHT = 0.15;
  var BOID_MAX_SPEED = 42;
  var BOID_MIN_SPEED = 10;
  var BOID_MAX_FORCE = 160;
  var BOID_TURN_RATE = 8;
  var TURTLE_COUNT_HIGH = 11;
  var TURTLE_COUNT_MED = 7;
  var TURTLE_COUNT_LOW = 4;
  var TURTLE_SPEED = 36;
  var TURTLE_FLINCH_RADIUS = 280;
  var TURTLE_FLINCH_SPEED = 160;
  var TURTLE_FLINCH_DURATION = 1.2;
  var TURTLE_TURN_SPEED = 1.2;
  var TURTLE_CHANGE_DIR_MIN = 5;
  var TURTLE_CHANGE_DIR_MAX = 10;
  var TURTLE_DRAW_SIZE = 58;
  var TURTLE_OPACITY = 0.45;
  var BUBBLE_FIELD_COUNT = 4;
  var BUBBLE_FIELD_RADIUS = 150;
  var BUBBLE_FIELD_MIN_DIST = 600;
  var BUBBLE_FIELD_REGEN_MULT = 3;
  var BUBBLE_FIELD_PARTICLE_COUNT = 64;
  var BUBBLE_FIELD_GLOW_ALPHA = 0.11;
  var ORCA_ENABLED_THEMES = ["sunken-route", "twilight-abyss"];
  var ORCA_PATROL_SPEED = 105;
  var ORCA_CHARGE_DURATION = 2.5;
  var ORCA_BODY_RADIUS = 110;
  var ORCA_VISUAL_LENGTH = 650;
  var ORCA_BODY_HALF_LENGTH = 210;
  var ORCA_BODY_HALF_WIDTH = 82;
  var ORCA_HEAD_OFFSET = 235;
  var ORCA_HEAD_RADIUS = 64;
  var ORCA_SPRITE_ROTATION = 0;
  var ORCA_WARN_PULSE_RATE = 8;
  var ORCA_SAFE_SPAWN_DISTANCE = 900;
  var ORCA_SPAWN_GRACE = 2;
  var ORCA_HORN_COOLDOWN = 0.8;
  var ORCA_SEA_TUNING = [
    { scale: 1, patrolSpeed: 110, chargeSpeed: 405, detectRadius: 460, warnDuration: 1.35, chargeDuration: 2, cooldown: 3.8, bodyStun: 0.62, bounceForce: 540, turnSpeed: 3.9, chargeTurn: 5 },
    { scale: 1, patrolSpeed: 110, chargeSpeed: 405, detectRadius: 460, warnDuration: 1.35, chargeDuration: 2, cooldown: 3.8, bodyStun: 0.62, bounceForce: 540, turnSpeed: 3.9, chargeTurn: 5 },
    { scale: 1, patrolSpeed: 110, chargeSpeed: 405, detectRadius: 460, warnDuration: 1.35, chargeDuration: 2, cooldown: 3.8, bodyStun: 0.62, bounceForce: 540, turnSpeed: 3.9, chargeTurn: 5 },
    { scale: 1.1, patrolSpeed: 110, chargeSpeed: 405, detectRadius: 460, warnDuration: 1.35, chargeDuration: 2, cooldown: 3.8, bodyStun: 0.62, bounceForce: 540, turnSpeed: 3.9, chargeTurn: 5 }
  ];
  var KRAKEN_ENABLED_THEME = "twilight-abyss";
  var KRAKEN_DRAW_SIZE = 680;
  var KRAKEN_OPACITY_MIN = 0.14;
  var KRAKEN_OPACITY_MAX = 0.22;
  var KRAKEN_SPEED = 8;
  var KRAKEN_TURN_SPEED = 0.15;
  var KRAKEN_DIR_CHANGE_MIN = 8;
  var KRAKEN_DIR_CHANGE_MAX = 16;
  var KRAKEN_EYE_OFF_MIN = 14;
  var KRAKEN_EYE_OFF_MAX = 26;
  var WRECK_ENABLED_THEME = "sunken-route";
  var WRECK_DRAW_SIZE = 620;
  var WRECK_OPACITY_MIN = 0.18;
  var WRECK_OPACITY_MAX = 0.26;
  var WRECK_SPEED = 4;
  var WRECK_TURN_SPEED = 0.06;
  var WRECK_DIR_CHANGE_MIN = 12;
  var WRECK_DIR_CHANGE_MAX = 24;
  var VICTIM_BODY_HIT_FACTOR = 0.94;
  var TIER_HORN_REACH_MULTIPLIERS = [
    1,
    1,
    1.02,
    1.04,
    1.06,
    1.08,
    1.1,
    1.13,
    1.16,
    1.2,
    1.24,
    1.28,
    1.32,
    1.36,
    1.42,
    1.48,
    1.54,
    1.58,
    1.62,
    1.66
  ];
  function getTierHornReachMult(tier) {
    const idx = clamp(tier, 1, 20) - 1;
    return TIER_HORN_REACH_MULTIPLIERS[idx];
  }
  var CLASH_FACING_THRESHOLD = -0.5;
  var KNOCKBACK_DRAG_BASE = 4;
  var KNOCKBACK_DRAG_QUAD = 0.012;
  var STUN_TURN_FACTOR = 0.12;
  var STUN_THRUST_FACTOR = 0.25;
  var SPRITE_REF_ASPECT = 0.62;
  var SPRITE_AREA_EXP = 0.5;
  var GLIDE_ENABLED = true;
  var GLIDE_DECAY = 0.01;
  var GLIDE_CUTOFF = 12;
  var TIER_THRESHOLDS = [
    0,
    15,
    35,
    65,
    100,
    150,
    225,
    300,
    400,
    525,
    650,
    850,
    1075,
    1350,
    1675,
    2050,
    2500,
    3e3,
    3550,
    4200
  ];
  var MAX_TIER_MASS = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
  var ARENA_W = 3400;
  var ARENA_H = 3400;
  function refreshArenaCache() {
    const arena = window.gameConfig && window.gameConfig.arena;
    if (arena) {
      ARENA_W = arena.width;
      ARENA_H = arena.height;
    }
  }
  var _camModX = 0;
  var _camModY = 0;
  var playerRankCache = 1;
  var perfQuality = 2;
  var _perfAccumTime = 0;
  var _perfFrames = 0;
  var _perfLowStreak = 0;
  var _perfHighStreak = 0;
  function selectInitialPerfQuality() {
    const memory = Number(navigator.deviceMemory) || 0;
    const cores = Number(navigator.hardwareConcurrency) || 0;
    const coarsePointer = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    if (memory > 0 && memory <= 2 || coarsePointer && cores > 0 && cores <= 4)
      return 0;
    if (coarsePointer || memory > 0 && memory <= 4 || cores > 0 && cores <= 6)
      return 1;
    return 2;
  }
  function applyPerfQuality() {
    const caps = [1, 1.25, 1.5];
    applyCanvasDPR(caps[perfQuality]);
  }
  function updatePerfGovernor(rawDt) {
    if (!gameStarted || matchTimer < 8)
      return;
    if (rawDt > 0.15)
      return;
    _perfAccumTime += rawDt;
    _perfFrames++;
    if (_perfAccumTime < 1)
      return;
    const avgFps = _perfFrames / _perfAccumTime;
    _perfAccumTime = 0;
    _perfFrames = 0;
    if (avgFps < 42) {
      _perfLowStreak++;
      _perfHighStreak = 0;
      if (_perfLowStreak >= 3 && perfQuality > 0) {
        perfQuality--;
        _perfLowStreak = 0;
        applyPerfQuality();
        if (typeof lib !== "undefined" && lib.log)
          lib.log("Perf: quality down to " + perfQuality + " (fps " + avgFps.toFixed(0) + ")");
      }
    } else if (avgFps > 55) {
      _perfHighStreak++;
      _perfLowStreak = 0;
      if (_perfHighStreak >= 6 && perfQuality < 2) {
        perfQuality++;
        _perfHighStreak = 0;
        applyPerfQuality();
        if (typeof lib !== "undefined" && lib.log)
          lib.log("Perf: quality up to " + perfQuality + " (fps " + avgFps.toFixed(0) + ")");
      }
    } else {
      _perfLowStreak = 0;
      _perfHighStreak = 0;
    }
  }
  var TIER_COLORS = [
    "#B8E6E0",
    "#5FC0F0",
    "#F7DC8A",
    "#9B4FD0",
    "#C89A5B",
    "#2E8B7A",
    "#C4283C",
    "#5FA8C4",
    "#F0559A",
    "#3A6FD8",
    "#EDE4D0",
    "#B4623A",
    "#2FE0E8",
    "#9BF03A",
    "#A8E4F5",
    "#A874E0",
    "#F0621C",
    "#3FE8A8",
    "#C86BF0",
    "#F0C838"
  ];
  var AI_NAME_POOL = [
    // Thematic ocean / narwhal handles (max 12 chars each)
    "FinDash",
    "DeepBlue",
    "HornTip",
    "ReefHunter",
    "TuskLord",
    "Abyssal",
    "KrillEater",
    "BlubberX",
    "PodByte",
    "TideKing",
    "IceBreaker",
    "FloeBack",
    "SpearFin",
    "KelpRunner",
    "NarwhalMax",
    "TuskFury",
    "HydroClad",
    "Cetacean",
    "BaleenX",
    "Fluke",
    "Calfling",
    "PierceR",
    "BrineKing",
    "VenomBarb",
    "CoralBack",
    "AnchorGnaw",
    "SiltRider",
    "ShoalCrush",
    "BubbleRam",
    "PlanktonX",
    "BrineByte",
    "TrenchWalk",
    "PodBreaker",
    "SquidFang",
    "GulperEel",
    "LarvaFin",
    "MoltMorph",
    "CavernFin",
    "BoulderCod",
    "ShellDrift",
    "InkDrip",
    "NestDiver",
    "NetCutter",
    "SpumeRage",
    "AbyssLord",
    "GlowJelly",
    "Sprattling",
    "DriftRider",
    "MedusaFang",
    "TuskKing",
    "HydroShell",
    "AmberFin",
    "CoralClaw",
    "ReefBiter",
    // Player-style handles (max 12 chars each)
    "Kr4ken",
    "Zephyr",
    "Onyxx",
    "V3nom",
    "Blitz",
    "Rekt",
    "NoMercy",
    "Clutch",
    "Rampant",
    "Null",
    "GG_EZ",
    "Tryhard",
    "Phantom",
    "GrindSet",
    "Chad99",
    "Driller",
    "TopFrag",
    "Predator",
    "Smasher",
    "L33t",
    "Dominate",
    "Vortex",
    "StayMad",
    "Devourer",
    "Aggro",
    "Crunch",
    "HardCarry",
    "Yikes",
    "SweatLord"
  ];
  var activeAINames = [];
  function shuffleAINames() {
    const pool = AI_NAME_POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    const needed = Math.min(window.gameConfig.ai.count || 16, pool.length);
    activeAINames = pool.slice(0, needed);
  }
  var aiProfiles = [];
  var matchTimer = 0;
  var recentPlayerKills = [];
  var lastKillCleanTime = 0;
  var ddaDifficulty = "medium";
  var ddaPlayerDeaths = [];
  var ddaLifeStart = 0;
  var ddaKillsThisLife = 0;
  var ddaLastTransition = 0;
  var ddaDominanceTimer = 0;
  var ddaStruggleTimer = 0;
  var earlyCalm = 1;
  function computeEarlyCalm() {
    if (!playerNarwhal || alphaHuntState === "active")
      return 0;
    const tier = playerNarwhal.tier;
    const tierFade = tier <= 6 ? 1 : Math.max(0, 1 - (tier - 6) / 3);
    const timeFade = matchTimer <= 30 ? 1 : Math.max(0, 1 - (matchTimer - 30) / 30);
    return Math.max(tierFade, timeFade);
  }
  function getDDAModifiers() {
    const tierProgress = playerNarwhal ? (playerNarwhal.tier - 1) / 19 : 0;
    const tierReaction = 1 - tierProgress * 0.1;
    const tierAim = 1 - tierProgress * 0.08;
    const tierChase = 1 + tierProgress * 0.12;
    const tierBoost = 1 + tierProgress * 0.1;
    switch (ddaDifficulty) {
      case "easy":
        return {
          thinkMult: 1.7 * tierReaction,
          // Bots think slower (reaction)
          detectionMult: 0.72,
          // Shorter detection (pursuit)
          aggroMult: 0.3,
          // Less likely to target player (give-up)
          boostMult: 0.15 * tierBoost,
          // Rarely boost offensively
          aimNoise: 0.38 * tierAim,
          // Much less accurate (precision)
          maxChasersMod: -1,
          // One fewer chaser (pursuit)
          chaseDurationMult: 0.5 * tierChase
          // Give up sooner (give-up)
        };
      case "hard":
        return {
          thinkMult: 0.85 * tierReaction,
          // Bots think faster (reaction)
          detectionMult: 1.15,
          // Longer detection (pursuit)
          aggroMult: 1.25,
          // More likely to target player (give-up)
          boostMult: 1.3 * tierBoost,
          // Aggressive boost usage
          aimNoise: 0.12 * tierAim,
          // Very accurate (precision)
          maxChasersMod: 0,
          // No extra chaser — hard via skill not numbers
          chaseDurationMult: 1.2 * tierChase
          // Chase longer (give-up)
        };
      default:
        return {
          thinkMult: 1.15 * tierReaction,
          detectionMult: 0.95,
          aggroMult: 0.85,
          boostMult: 0.8 * tierBoost,
          aimNoise: 0.2 * tierAim,
          maxChasersMod: 0,
          chaseDurationMult: 0.9 * tierChase
        };
    }
  }
  function updateDynamicDifficulty(dt) {
    if (!gameStarted || isPlayerDead)
      return;
    if (alphaHuntState === "active")
      return;
    const basePref = window.gameConfig.ai.difficulty;
    const easyBias = basePref === "Easy" ? 0.6 : basePref === "Hard" ? 1.5 : 1;
    const hardBias = basePref === "Hard" ? 0.6 : basePref === "Easy" ? 1.5 : 1;
    const cutoff = matchTimer - 60;
    let write = 0;
    for (let i = 0; i < ddaPlayerDeaths.length; i++) {
      if (ddaPlayerDeaths[i] >= cutoff)
        ddaPlayerDeaths[write++] = ddaPlayerDeaths[i];
    }
    ddaPlayerDeaths.length = write;
    const lifeTime = matchTimer - ddaLifeStart;
    const recentDeaths60 = ddaPlayerDeaths.length;
    let recentDeaths30 = 0;
    const cutoff30 = matchTimer - 30;
    for (let i = 0; i < ddaPlayerDeaths.length; i++) {
      if (ddaPlayerDeaths[i] >= cutoff30)
        recentDeaths30++;
    }
    const isStruggling = recentDeaths60 >= 2 || recentDeaths30 >= 2 && lifeTime < 15;
    const playerRank = playerRankCache;
    const isDominating = lifeTime >= 25 && ddaKillsThisLife >= 2 || lifeTime >= 40 && playerNarwhal.tier >= 10 && (ddaKillsThisLife >= 1 || playerRank <= 3);
    if (isDominating) {
      ddaDominanceTimer += dt;
      ddaStruggleTimer = 0;
    } else if (isStruggling) {
      ddaStruggleTimer += dt;
      ddaDominanceTimer = 0;
    } else {
      ddaDominanceTimer = Math.max(0, ddaDominanceTimer - dt * 0.4);
      ddaStruggleTimer = Math.max(0, ddaStruggleTimer - dt * 0.4);
    }
    if (matchTimer - ddaLastTransition < 15)
      return;
    const prevDifficulty = ddaDifficulty;
    const pTierDDA = playerNarwhal ? playerNarwhal.tier : 1;
    let recentDeaths45 = 0;
    const cutoff45 = matchTimer - 45;
    for (let i = 0; i < ddaPlayerDeaths.length; i++) {
      if (ddaPlayerDeaths[i] >= cutoff45)
        recentDeaths45++;
    }
    if (ddaDifficulty === "medium") {
      if (recentDeaths60 >= 2 || ddaStruggleTimer >= 3 * easyBias) {
        ddaDifficulty = "easy";
      } else if (pTierDDA >= 15 && lifeTime >= 60 && playerRankCache <= 3 && ddaKillsThisLife >= 3 && earlyCalm <= 0 && ddaDominanceTimer >= 10 * hardBias) {
        ddaDifficulty = "hard";
      }
    } else if (ddaDifficulty === "easy") {
      if (pTierDDA >= 10 && lifeTime >= 45 && (playerRankCache <= 3 || ddaKillsThisLife >= 3) && ddaDominanceTimer >= 6 * hardBias) {
        ddaDifficulty = "medium";
      }
    } else if (ddaDifficulty === "hard") {
      if (recentDeaths45 >= 2 || ddaStruggleTimer >= 2 * easyBias) {
        ddaDifficulty = "medium";
      }
      if (pTierDDA < 15) {
        ddaDifficulty = "medium";
      }
    }
    if (ddaDifficulty !== prevDifficulty) {
      ddaLastTransition = matchTimer;
      ddaDominanceTimer = 0;
      ddaStruggleTimer = 0;
      if (typeof lib !== "undefined" && lib.log) {
        lib.log("DDA: difficulty changed to " + ddaDifficulty);
      }
    }
  }
  function ddaRecordDeath() {
    ddaPlayerDeaths.push(matchTimer);
    ddaKillsThisLife = 0;
    ddaLifeStart = matchTimer;
  }
  function ddaRecordKill() {
    ddaKillsThisLife++;
  }
  function ddaRecordRespawn() {
    ddaLifeStart = matchTimer;
    ddaKillsThisLife = 0;
  }
  function cleanRecentKills() {
    const cutoff = matchTimer - 20;
    let write = 0;
    for (let i = 0; i < recentPlayerKills.length; i++) {
      if (recentPlayerKills[i] >= cutoff) {
        recentPlayerKills[write++] = recentPlayerKills[i];
      }
    }
    recentPlayerKills.length = write;
    lastKillCleanTime = matchTimer;
  }
  function assignAIProfiles() {
    const count = Math.max(1, window.gameConfig.ai.count || 16);
    const nAggressive = count >= 8 ? Math.max(1, Math.round(count * 0.07)) : 0;
    const remainingAfterAggressive = count - nAggressive;
    const nOpportunist = count >= 4 ? Math.min(remainingAfterAggressive, Math.max(1, Math.round(count * 0.25))) : count >= 2 ? 1 : 0;
    const pool = [];
    for (let i = 0; i < count - nAggressive - nOpportunist; i++)
      pool.push("casual");
    for (let i = 0; i < nOpportunist; i++)
      pool.push("opportunist");
    for (let i = 0; i < nAggressive; i++)
      pool.push("aggressive");
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }
    aiProfiles = pool;
  }
  function getPlayerPressureLevel() {
    if (!playerNarwhal || playerNarwhal.dying || isPlayerDead)
      return 0;
    let pressure = 0;
    if (playerRankCache <= 3)
      pressure += 0.33;
    if (playerNarwhal.tier >= 15)
      pressure += 0.33;
    if (recentPlayerKills.length >= 3)
      pressure += 0.34;
    return Math.min(pressure, 1);
  }
  function countBotsChasingPlayer() {
    let count = 0;
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot = aiNarwhals[i];
      if (bot && !bot.dying && bot._aiChasingPlayer)
        count++;
    }
    return count;
  }
  function countBotsBoostingAtPlayer() {
    let count = 0;
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot = aiNarwhals[i];
      if (bot && !bot.dying && bot._aiBoostAtPlayer)
        count++;
    }
    return count;
  }
  function getTerritorialHuntRange() {
    const seaIndex = activeAtlasTheme ? Math.max(0, ATLAS_THEMES.findIndex((theme) => theme.id === activeAtlasTheme.id)) : 0;
    return seaIndex >= 2 ? 340 : 300;
  }
  function countTerritorialHuntersOnPlayer(exceptBot) {
    let count = 0;
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot = aiNarwhals[i];
      if (!bot || bot === exceptBot || bot.dying)
        continue;
      if (bot._aiTerritorialHunt && bot._aiChasingPlayer)
        count++;
    }
    return count;
  }
  function countOtherVisibleBotsBoosting(exceptBot) {
    let count = 0;
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot = aiNarwhals[i];
      if (!bot || bot === exceptBot || bot.dying)
        continue;
      if ((bot.boosting || bot.aiBoostIntent) && isInView(bot.x, bot.y, 80))
        count++;
    }
    return count;
  }
  var ENCOUNTER_NEAR_RADIUS = 650;
  var ENCOUNTER_LONELY_DELAY = 4;
  var ENCOUNTER_ROUTE_MAX_TIME = 4;
  var ENCOUNTER_COOLDOWN_MIN = 5;
  var ENCOUNTER_COOLDOWN_MAX = 7;
  var ENCOUNTER_WAYPOINT_MIN = 400;
  var ENCOUNTER_WAYPOINT_MAX = 650;
  var ENCOUNTER_CHECK_INTERVAL = 0.5;
  var ENCOUNTER_PICK_MIN_DIST = 700;
  var ENCOUNTER_PICK_MAX_DIST = 1500;
  var ENCOUNTER_ARRIVE_DIST = 150;
  var encounterRoutedBot = null;
  var encounterRouteTimeLeft = 0;
  var encounterRouteCooldown = 0;
  var encounterLonelyTimer = 0;
  var encounterCheckTimer = ENCOUNTER_CHECK_INTERVAL;
  function clearEncounterRoute(startCooldown = true) {
    if (encounterRoutedBot)
      encounterRoutedBot._aiEncounterWaypoint = null;
    encounterRoutedBot = null;
    encounterRouteTimeLeft = 0;
    encounterLonelyTimer = 0;
    if (startCooldown) {
      encounterRouteCooldown = randRange(ENCOUNTER_COOLDOWN_MIN, ENCOUNTER_COOLDOWN_MAX);
    }
  }
  function resetEncounterRouting() {
    encounterRoutedBot = null;
    encounterRouteTimeLeft = 0;
    encounterRouteCooldown = 0;
    encounterLonelyTimer = 0;
    encounterCheckTimer = ENCOUNTER_CHECK_INTERVAL;
  }
  function pickEncounterRouteBot() {
    let best = null;
    let bestDist2 = Infinity;
    const minDist2 = ENCOUNTER_PICK_MIN_DIST * ENCOUNTER_PICK_MIN_DIST;
    const maxDist2 = ENCOUNTER_PICK_MAX_DIST * ENCOUNTER_PICK_MAX_DIST;
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot = aiNarwhals[i];
      if (!bot || bot.dying)
        continue;
      if (bot._alphaHunter || bot._aiChasingPlayer || bot._aiEvadingShark)
        continue;
      if (bot._aiEncounterWaypoint || bot._aiHasPreyTarget || bot._aiDangerSource)
        continue;
      if (bot.spawnProtection > 0)
        continue;
      const d2 = distanceSq(bot.x, bot.y, playerNarwhal.x, playerNarwhal.y);
      if (d2 < minDist2 || d2 > maxDist2)
        continue;
      if (isInView(bot.x, bot.y, 140))
        continue;
      if (d2 < bestDist2) {
        bestDist2 = d2;
        best = bot;
      }
    }
    return best;
  }
  function updateEncounterRouting(dt) {
    if (encounterRouteCooldown > 0)
      encounterRouteCooldown -= dt;
    if (encounterRoutedBot) {
      encounterRouteTimeLeft -= dt;
      const bot2 = encounterRoutedBot;
      let cancel = false;
      if (!bot2 || bot2.dying || encounterRouteTimeLeft <= 0)
        cancel = true;
      else if (bot2._aiChasingPlayer || bot2._aiEvadingShark || bot2._alphaHunter)
        cancel = true;
      else if (bot2._aiDangerSource || bot2._aiHasPreyTarget)
        cancel = true;
      else if (!playerNarwhal || playerNarwhal.dying || isPlayerDead)
        cancel = true;
      else {
        const d2 = distanceSq(bot2.x, bot2.y, playerNarwhal.x, playerNarwhal.y);
        if (d2 <= ENCOUNTER_NEAR_RADIUS * ENCOUNTER_NEAR_RADIUS)
          cancel = true;
      }
      if (cancel)
        clearEncounterRoute();
    }
    encounterCheckTimer -= dt;
    if (encounterCheckTimer > 0)
      return;
    encounterCheckTimer = ENCOUNTER_CHECK_INTERVAL;
    if (!gameStarted || !playerNarwhal || playerNarwhal.dying || isPlayerDead || alphaHuntState === "active") {
      encounterLonelyTimer = 0;
      return;
    }
    const nearR2 = ENCOUNTER_NEAR_RADIUS * ENCOUNTER_NEAR_RADIUS;
    let hasNeighbour = false;
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot2 = aiNarwhals[i];
      if (!bot2 || bot2.dying)
        continue;
      if (distanceSq(bot2.x, bot2.y, playerNarwhal.x, playerNarwhal.y) <= nearR2) {
        hasNeighbour = true;
        break;
      }
    }
    if (hasNeighbour) {
      encounterLonelyTimer = 0;
      return;
    }
    encounterLonelyTimer += ENCOUNTER_CHECK_INTERVAL;
    if (encounterRoutedBot || encounterRouteCooldown > 0)
      return;
    if (encounterLonelyTimer < ENCOUNTER_LONELY_DELAY)
      return;
    const bot = pickEncounterRouteBot();
    if (!bot)
      return;
    const arena = window.gameConfig.arena;
    const towardBot = Math.atan2(
      wrappedDelta(bot.y, playerNarwhal.y, arena.height),
      wrappedDelta(bot.x, playerNarwhal.x, arena.width)
    );
    const side = Math.random() < 0.5 ? -1 : 1;
    const angle = towardBot + side * randRange(0.55, 1.15);
    const dist = randRange(ENCOUNTER_WAYPOINT_MIN, ENCOUNTER_WAYPOINT_MAX);
    bot._aiEncounterWaypoint = {
      x: wrapCoordinate(playerNarwhal.x + Math.cos(angle) * dist, arena.width),
      y: wrapCoordinate(playerNarwhal.y + Math.sin(angle) * dist, arena.height)
    };
    encounterRoutedBot = bot;
    encounterRouteTimeLeft = ENCOUNTER_ROUTE_MAX_TIME;
    encounterLonelyTimer = 0;
    bot._aiHasPreyTarget = false;
    bot._aiDangerSource = null;
    bot.aiThinkTimer = Math.min(bot.aiThinkTimer, 0.12);
  }
  var canvas = null;
  var ctx = null;
  var gameMode = "play";
  var lastTime = 0;
  var animationFrameId = null;
  var inputHandlersReady = false;
  var debugHitboxes = false;
  var playerNarwhal = null;
  var aiNarwhals = [];
  var aiRespawnTimers = [];
  var aiRespawnMass = [];
  var orbs = [];
  var superOrbs = [];
  var particles = [];
  var floatingTexts = [];
  var deathRipples = [];
  var camera = { x: 0, y: 0, zoom: 1 };
  var viewBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  var screenShake = 0;
  var hitStopTimer = 0;
  var isPlayerDead = false;
  var deathTimer = 0;
  var runKills = 0;
  var bestMass = 0;
  var totalKills = 0;
  var totalScoreAccum = 0;
  var gamesPlayed = 0;
  var kingOfSeasUnlocked = false;
  var sharkImmuneHintShown = false;
  var kingCelebrationPause = 0;
  var evolutionBanner = null;
  var gameStarted = false;
  var pendingRespawnMass = 0;
  var mousePos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
  var keys = {};
  var mouseBoostHeld = false;
  var boostButtonHeld = false;
  var isTouchDevice = false;
  var joystick = {
    active: false,
    touchId: null,
    baseX: 0,
    baseY: 0,
    knobX: 0,
    knobY: 0,
    angle: 0,
    magnitude: 0
  };
  var audioContext = null;
  var audioBuffers = {};
  var pendingAudioData = {};
  var soundEnabled = true;
  var musicVolume = 1;
  var sfxVolume = 1;
  var sfxGainNode = null;
  var backgroundMusicSource = null;
  var backgroundMusicGain = null;
  var activeMusicAssetId = null;
  var requestedMusicAssetId = null;
  var deepMusicLoadRequested = false;
  var soundPanelOpen = false;
  var backgroundTexture = null;
  var backgroundPattern = null;
  var narwhalSprites = new Array(21).fill(null);
  var decorImages = {};
  var collectibleSprites = {};
  var lootTintSprites = {};
  var decorPlacements = [];
  var _decorSpriteCache = {};
  var assetsLoaded = false;
  var orbPreRendered = {};
  var minimapCanvas = null;
  var minimapCtx = null;
  var minimapRefreshTimer = 0;
  var vignetteCanvas = null;
  var decoFishAnchors = [];
  var decoFishList = [];
  var decoFishTintedSprites = {};
  var decoFishActiveCount = 0;
  var turtleList = [];
  var foregroundShapes = [];
  var bubbleFields = [];
  var orcaPredator = null;
  var orcaSprite = null;
  var orcaSpriteOpen = null;
  var orcaWarningActive = false;
  var krakenPresence = null;
  var krakenSprite = null;
  var wreckPresence = null;
  var wreckSprite = null;
  var leaderboardEl = null;
  var massValueEl = null;
  var tierValueEl = null;
  var boostFillEl = null;
  var boostButtonEl = null;
  var deathOverlay = null;
  var finalMassEl = null;
  var deathRunKillsEl = null;
  var deathBestMassEl = null;
  var respawnBtn = null;
  var joystickContainer = null;
  var joystickBase = null;
  var joystickKnob = null;
  var evolutionBannerEl = null;
  var evolutionTierEl = null;
  var evolutionNameEl = null;
  var controlsHintEl = null;
  var _controlsHintHtml = "";
  var _controlsHintVisible = false;
  var powerupStatusEl = null;
  var powerupTimeEl = null;
  var alphaHuntEl = null;
  var alphaHuntLabelEl = null;
  var alphaHuntFillEl = null;
  var alphaHuntResultEl = null;
  var alphaHuntBonusEl = null;
  var alphaHuntResultTimer = 0;
  var alphaGoldParticles = [];
  var alphaFailDeathDelay = 0;
  var alphaScoreAnim = null;
  var alphaAnnounceEl = null;
  var alphaAnnounceTitleEl = null;
  var alphaAnnounceSubEl = null;
  var alphaAnnounceTimer = 0;
  var alphaHuntStartSoundNode = null;
  var alphaHuntWinSoundNode = null;
  var seaProgressButtonEl = null;
  var seaProgressFillEl = null;
  var seaProgressLabelEl = null;
  var seaProgressPercentEl = null;
  var _seaProgressSig = "";
  var _seaProgressGlowTimer = 0;
  var _seaProgressLastPercent = -1;
  var _seaProgressBlinkTimer = 0;
  var _seaProgressBlinkPrev = null;
  var _seaCeremonyState = "idle";
  var _seaCeremonyTimer = 0;
  var _seaCeremonyPrevTheme = null;
  var _seaCeremonyNextTheme = null;
  var _seaCeremonyOverflowPct = 0;
  var _seaCeremonyIsFinal = false;
  var _seaCeremonyMidDone = false;
  var _seaCeremonyTriggered = false;
  var atlasToggleEl = null;
  var atlasPanelEl = null;
  var atlasPercentEl = null;
  var atlasProgressFillEl = null;
  var atlasCurrentEl = null;
  var atlasStagesEl = null;
  var atlasCelebrationEl = null;
  var regionTransitionEl = null;
  var regionTransitionActive = false;
  var deathAtlasEl = null;
  function updateAtlasUI() {
    const percent = getAtlasPercent();
    const currentTheme = getAtlasThemeForScore();
    const currentSeaLabel = getAtlasSeaLabel(currentTheme);
    const liveScore = getAtlasLiveScore();
    const expMax = getExpeditionMaxScore();
    const isComplete = liveScore >= expMax && atlasCycleScore >= expMax;
    if (atlasToggleEl) {
      atlasToggleEl.setAttribute("aria-label", `${currentSeaLabel}: ${percent}%`);
      atlasToggleEl.title = `${currentSeaLabel} \u2014 ${getAtlasThemeName(currentTheme)} \u2014 ${percent}%`;
      const value = atlasToggleEl.querySelector(".atlas-toggle-value");
      if (value)
        value.textContent = percent + "%";
      atlasToggleEl.classList.toggle("complete", isComplete);
      const fill = document.getElementById("atlas-toggle-fill");
      if (fill)
        fill.style.width = percent + "%";
    }
    const currentIndex = Math.max(0, ATLAS_THEMES.findIndex((t2) => t2.id === currentTheme.id));
    const panelKicker = document.querySelector(".atlas-panel-kicker");
    const expeditionLabel = atlasText("expeditionLabel").replace("{n}", toRoman(atlasExpedition));
    if (panelKicker)
      panelKicker.textContent = expeditionLabel;
    if (atlasPercentEl)
      atlasPercentEl.textContent = isComplete ? "100%" : percent + "%";
    if (atlasProgressFillEl)
      atlasProgressFillEl.style.width = percent + "%";
    if (atlasCurrentEl)
      atlasCurrentEl.innerHTML = "";
    if (atlasStagesEl) {
      const locale = currentLang || "en";
      const thresholds = getExpeditionThresholds(atlasExpedition);
      const badgeText = t("current");
      let stagesHtml = "";
      for (let index = 0; index < ATLAS_THEMES.length; index++) {
        const theme = ATLAS_THEMES[index];
        const active = currentTheme.id === theme.id && !isComplete;
        const nextThreshold = thresholds[Math.min(index + 1, thresholds.length - 1)];
        const regionComplete = liveScore >= nextThreshold;
        const stageTitle = `${getAtlasSeaLabel(theme)} \xB7 ${getAtlasThemeName(theme)}`;
        if (active) {
          stagesHtml += `<div class="atlas-stage current">
                    <span class="atlas-stage-marker">\u{1F9ED}</span>
                    <span class="atlas-stage-copy"><strong>${stageTitle}</strong><small><span class="atlas-badge-current">${badgeText}</span> ${percent}%</small></span>
                </div>`;
        } else if (regionComplete) {
          stagesHtml += `<div class="atlas-stage completed">
                    <span class="atlas-stage-marker">&#10003;</span>
                    <span class="atlas-stage-copy"><strong>${stageTitle}</strong></span>
                </div>`;
        } else {
          const pts = thresholds[index].toLocaleString(locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : void 0);
          stagesHtml += `<div class="atlas-stage locked">
                    <span class="atlas-stage-marker">\u{1F512}</span>
                    <span class="atlas-stage-copy"><strong>${stageTitle}</strong><small>${pts} pts</small></span>
                </div>`;
        }
      }
      const kingLabel = atlasCompletions > 1 ? `${atlasText("king")} \xD7${atlasCompletions}` : atlasCompletions === 1 ? atlasText("king") : atlasText("finalReward");
      const ptsFormatted = expMax.toLocaleString(locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : void 0);
      if (atlasCompletions >= 1) {
        stagesHtml += `<div class="atlas-stage king unlocked">
                <span class="atlas-stage-marker">\u{1F451}</span>
                <span class="atlas-stage-copy"><strong>${kingLabel}</strong></span>
            </div>`;
      } else {
        stagesHtml += `<div class="atlas-stage king locked">
                <span class="atlas-stage-marker crown-muted">\u{1F451}</span>
                <span class="atlas-stage-copy"><strong>${kingLabel}</strong><small>${ptsFormatted} pts</small></span>
            </div>`;
      }
      atlasStagesEl.innerHTML = stagesHtml;
    }
    if (deathAtlasEl) {
      deathAtlasEl.textContent = `${currentSeaLabel}: ${percent}%`;
    }
    const deathAtlasBtnPct = document.getElementById("death-atlas-btn-pct");
    if (deathAtlasBtnPct)
      deathAtlasBtnPct.textContent = percent + "%";
    const deathAtlasBarFill = document.getElementById("death-atlas-bar-fill");
    if (deathAtlasBarFill)
      deathAtlasBarFill.style.width = percent + "%";
    const atlasNoteEl = document.getElementById("atlas-note");
    if (atlasNoteEl)
      atlasNoteEl.textContent = atlasText("keepExploring");
  }
  function toRoman(num) {
    if (num <= 0 || num > 50)
      return String(num);
    const vals = [10, 9, 5, 4, 1];
    const syms = ["X", "IX", "V", "IV", "I"];
    let result = "";
    for (let i = 0; i < vals.length; i++) {
      while (num >= vals[i]) {
        result += syms[i];
        num -= vals[i];
      }
    }
    return result;
  }
  var atlasPanelPaused = false;
  function setAtlasPanelOpen(open) {
    if (!atlasPanelEl)
      return;
    atlasPanelEl.classList.toggle("hidden", !open);
    atlasPanelEl.setAttribute("aria-hidden", open ? "false" : "true");
    atlasPanelPaused = open;
    updateAtlasUI();
  }
  function updateSeaProgressButton(dt) {
    if (!seaProgressButtonEl)
      return;
    if (_seaCeremonyState !== "idle") {
      return;
    }
    if (_seaProgressBlinkTimer > 0) {
      _seaProgressBlinkTimer -= dt || 0.016;
      if (seaProgressFillEl)
        seaProgressFillEl.style.width = "100%";
      if (seaProgressPercentEl)
        seaProgressPercentEl.textContent = "100%";
      return;
    }
    const liveScore = getAtlasLiveScore();
    const isComplete = liveScore >= getExpeditionMaxScore();
    const currentTheme = activeAtlasTheme;
    const rawPercent = isComplete ? 100 : getAtlasRegionPercent(liveScore, currentTheme);
    const percent = Math.min(100, rawPercent);
    const seaIndex = Math.max(0, ATLAS_THEMES.findIndex((t2) => t2.id === currentTheme.id));
    const label = isComplete ? atlasText("king") : getAtlasSeaLabel(currentTheme);
    const sig = `${seaIndex}|${percent}|${isComplete}|${currentLang}`;
    if (sig === _seaProgressSig) {
      if (_seaProgressGlowTimer > 0) {
        _seaProgressGlowTimer -= dt || 0.016;
        if (_seaProgressGlowTimer <= 0)
          seaProgressButtonEl.classList.remove("glow");
      }
      return;
    }
    _seaProgressSig = sig;
    if (percent > _seaProgressLastPercent && _seaProgressLastPercent >= 0) {
      seaProgressButtonEl.classList.add("glow");
      _seaProgressGlowTimer = 0.8;
    }
    _seaProgressLastPercent = percent;
    if (seaProgressLabelEl)
      seaProgressLabelEl.textContent = label;
    if (seaProgressPercentEl)
      seaProgressPercentEl.textContent = percent + "%";
    if (seaProgressFillEl)
      seaProgressFillEl.style.width = percent + "%";
    const classes = seaProgressButtonEl.classList;
    classes.remove("sea-1", "sea-2", "sea-3", "sea-4", "complete");
    if (isComplete) {
      classes.add("complete");
    } else {
      classes.add("sea-" + (seaIndex + 1));
    }
    seaProgressButtonEl.setAttribute("aria-label", `Ocean Atlas, ${label}, ${percent} percent. Open Atlas.`);
  }
  function dismissCelebration() {
    const overlay = document.getElementById("king-celebration");
    if (overlay) {
      overlay.classList.remove("show");
      window.setTimeout(() => overlay.classList.add("hidden"), 350);
    }
    kingCelebrationPause = 0;
    if (_pendingNewExpedition) {
      _pendingNewExpedition = false;
      startNextExpedition();
    }
  }
  function showKingOfSeasCelebration() {
    const overlay = document.getElementById("king-celebration");
    if (!overlay)
      return;
    const rewardText = t("goldenBoost");
    const continueText = t("tapToContinue");
    overlay.innerHTML = `
        <div class="king-crown">\u{1F451}</div>
        <div class="king-title">${atlasText("king")}</div>
        <div class="king-subtitle">100% ${atlasText("title")}</div>
        <div class="king-reward">${rewardText}</div>
        <div class="king-continue">${continueText}</div>
    `;
    overlay.classList.remove("hidden");
    overlay.classList.remove("show");
    void overlay.offsetWidth;
    overlay.classList.add("show");
    kingCelebrationPause = 5;
    const dismissReadyAt = performance.now() + 1500;
    overlay.onclick = (event) => {
      event.stopPropagation();
      if (performance.now() < dismissReadyAt)
        return;
      dismissCelebration();
    };
    overlay.onpointerdown = (event) => event.stopPropagation();
    playSound("alpha_hunt_win_sound", 0.9) || playSound("evolve_sound", 0.85) || playTone(880, 0.3, 0.05, "triangle");
    setTimeout(() => playTone(1100, 0.2, 0.035, "triangle"), 300);
    setTimeout(() => playTone(1320, 0.25, 0.04, "triangle"), 600);
    setTimeout(() => playTone(990, 0.18, 0.03, "triangle"), 1e3);
    setTimeout(() => playTone(1320, 0.22, 0.04, "triangle"), 1400);
    screenShake = Math.max(screenShake, 12);
    window.setTimeout(() => {
      if (overlay && overlay.classList.contains("show")) {
        dismissCelebration();
      }
    }, 5e3);
    for (const k in _nameplateCache)
      delete _nameplateCache[k];
    _nameplateCacheCount = 0;
  }
  function showExpeditionCompleteCelebration() {
    const overlay = document.getElementById("king-celebration");
    if (!overlay)
      return;
    const countLabel = `${atlasText("king")} \xD7${atlasCompletions}`;
    const completeText = atlasText("expeditionComplete");
    const continueText = t("tapToContinue");
    overlay.innerHTML = `
        <div class="king-crown">\u{1F451}</div>
        <div class="king-title">${completeText}</div>
        <div class="king-subtitle">${countLabel}</div>
        <div class="king-continue">${continueText}</div>
    `;
    overlay.classList.remove("hidden");
    overlay.classList.remove("show");
    void overlay.offsetWidth;
    overlay.classList.add("show");
    kingCelebrationPause = 3.5;
    const dismissReadyAt = performance.now() + 1200;
    overlay.onclick = (event) => {
      event.stopPropagation();
      if (performance.now() < dismissReadyAt)
        return;
      dismissCelebration();
    };
    overlay.onpointerdown = (event) => event.stopPropagation();
    playSound("alpha_hunt_win_sound", 0.72) || playSound("evolve_sound", 0.75) || playTone(780, 0.22, 0.04, "triangle");
    setTimeout(() => playTone(960, 0.16, 0.03, "triangle"), 300);
    screenShake = Math.max(screenShake, 8);
    window.setTimeout(() => {
      if (overlay && overlay.classList.contains("show")) {
        dismissCelebration();
      }
    }, 3500);
  }
  function startNextExpedition() {
    atlasExpedition++;
    atlasCycleScore = 0;
    _pendingNewExpedition = false;
    _seaCeremonyTriggered = false;
    setActiveAtlasTheme(ATLAS_THEMES[0], true, true, true);
    _seaProgressSig = "";
    if (seaProgressButtonEl) {
      const classes = seaProgressButtonEl.classList;
      classes.remove("sea-1", "sea-2", "sea-3", "sea-4", "complete");
      classes.add("sea-1");
    }
    if (seaProgressLabelEl)
      seaProgressLabelEl.textContent = getAtlasSeaLabel(ATLAS_THEMES[0]);
    if (seaProgressPercentEl)
      seaProgressPercentEl.textContent = "0%";
    if (seaProgressFillEl)
      seaProgressFillEl.style.width = "0%";
    updateAtlasUI();
    for (const k in _nameplateCache)
      delete _nameplateCache[k];
    _nameplateCacheCount = 0;
    commitCurrentRunToAtlas();
    saveProgressIfNeeded();
    submitTotalScoreIfNeeded();
  }
  var regionTransitionPause = 0;
  function showRegionTransition(theme, previousTheme, duration = 4) {
    if (!regionTransitionEl)
      return;
    const prevName = previousTheme ? `${getAtlasSeaLabel(previousTheme)} \xB7 ${getAtlasThemeName(previousTheme)}` : "";
    const nextName = `${getAtlasSeaLabel(theme)} \xB7 ${getAtlasThemeName(theme)}`;
    regionTransitionEl.innerHTML = `
        <div class="region-transition-complete">
            <div class="region-transition-check">\u2713</div>
            <div class="region-transition-prev-name">${prevName}</div>
            <div class="region-transition-complete-label">${t("regionComplete")}</div>
        </div>
        <div class="region-transition-divider"></div>
        <div class="region-transition-next">
            <div class="region-transition-entering-label">${t("regionEntering")}</div>
            <div class="region-transition-next-name">${nextName}</div>
        </div>
    `;
    regionTransitionEl.classList.remove("show");
    void regionTransitionEl.offsetWidth;
    regionTransitionEl.classList.add("show");
    regionTransitionActive = true;
    regionTransitionPause = duration;
    _seaProgressBlinkTimer = Math.min(duration, 1.2);
    _seaProgressBlinkPrev = previousTheme;
    if (seaProgressButtonEl) {
      seaProgressButtonEl.classList.add("complete-blink");
      setTimeout(() => seaProgressButtonEl && seaProgressButtonEl.classList.remove("complete-blink"), Math.min(duration * 1e3, 1200));
    }
    playSound("evolve_sound", 0.6) || playTone(480, 0.14, 0.025, "triangle");
    setTimeout(() => playTone(640, 0.12, 0.02, "triangle"), 300);
    setTimeout(() => playTone(780, 0.14, 0.025, "triangle"), 600);
    window.setTimeout(() => {
      regionTransitionEl && regionTransitionEl.classList.remove("show");
      regionTransitionActive = false;
    }, duration * 1e3);
  }
  function startSeaCompletionCeremony(prevTheme, nextTheme, isFinal) {
    if (_seaCeremonyState !== "idle")
      return;
    _seaCeremonyPrevTheme = prevTheme;
    _seaCeremonyNextTheme = nextTheme;
    _seaCeremonyIsFinal = isFinal;
    _seaCeremonyMidDone = false;
    _seaCeremonyTriggered = true;
    commitCurrentRunToAtlas();
    saveProgressIfNeeded();
    submitTotalScoreIfNeeded();
    if (isFinal) {
      _seaCeremonyState = "celebrating";
      _seaCeremonyTimer = 1.2;
      _seaCeremonyOverflowPct = 100;
      regionTransitionPause = 1.2;
      if (seaProgressFillEl)
        seaProgressFillEl.style.width = "100%";
      if (seaProgressLabelEl)
        seaProgressLabelEl.textContent = getAtlasSeaLabel(prevTheme);
      if (seaProgressPercentEl)
        seaProgressPercentEl.textContent = t("regionComplete");
      if (seaProgressButtonEl) {
        seaProgressButtonEl.classList.remove("sea-completing", "sea-completing-final");
        void seaProgressButtonEl.offsetWidth;
        seaProgressButtonEl.classList.add("sea-completing", "sea-completing-final");
      }
      playTone(520, 0.12, 0.028, "triangle");
      setTimeout(() => playTone(660, 0.12, 0.028, "triangle"), 250);
      setTimeout(() => playTone(820, 0.14, 0.032, "triangle"), 500);
      return;
    }
    _seaCeremonyState = "celebrating";
    _seaCeremonyTimer = 0.8;
    _seaCeremonyOverflowPct = 0;
    regionTransitionPause = 4.6;
    const seaLabel = getAtlasSeaLabel(prevTheme);
    if (seaProgressFillEl)
      seaProgressFillEl.style.width = "100%";
    if (seaProgressLabelEl)
      seaProgressLabelEl.textContent = seaLabel;
    if (seaProgressPercentEl)
      seaProgressPercentEl.textContent = t("regionComplete");
    if (seaProgressButtonEl) {
      seaProgressButtonEl.classList.remove("sea-completing", "sea-completing-final");
      void seaProgressButtonEl.offsetWidth;
      seaProgressButtonEl.classList.add("sea-completing");
    }
    playTone(520, 0.12, 0.028, "triangle");
    setTimeout(() => playTone(660, 0.12, 0.028, "triangle"), 280);
  }
  function updateSeaCompletionSequence(dt) {
    if (_seaCeremonyState === "idle")
      return;
    _seaCeremonyTimer -= dt;
    if (_seaCeremonyIsFinal) {
      if (_seaCeremonyState === "celebrating" && _seaCeremonyTimer <= 0) {
        const isFirstCompletion = atlasCompletions === 0;
        atlasCompletions++;
        kingOfSeasUnlocked = true;
        saveProgressIfNeeded();
        submitTotalScoreIfNeeded();
        if (seaProgressButtonEl) {
          seaProgressButtonEl.classList.remove("sea-completing", "sea-completing-final");
          seaProgressButtonEl.classList.add("complete");
          seaProgressButtonEl.classList.remove("sea-1", "sea-2", "sea-3", "sea-4");
        }
        if (seaProgressLabelEl)
          seaProgressLabelEl.textContent = atlasText("king");
        if (seaProgressPercentEl)
          seaProgressPercentEl.textContent = "100%";
        if (seaProgressFillEl)
          seaProgressFillEl.style.width = "100%";
        _seaProgressSig = "";
        _pendingNewExpedition = true;
        _seaCeremonyState = "idle";
        _seaCeremonyTimer = 0;
        if (isFirstCompletion) {
          showKingOfSeasCelebration();
        } else {
          showExpeditionCompleteCelebration();
        }
      }
      return;
    }
    switch (_seaCeremonyState) {
      case "celebrating":
        if (_seaCeremonyTimer <= 0) {
          _seaCeremonyState = "darkening";
          _seaCeremonyTimer = 0.7;
          if (regionTransitionEl) {
            const seaLabel = getAtlasSeaLabel(_seaCeremonyNextTheme);
            const themeName = getAtlasThemeName(_seaCeremonyNextTheme);
            regionTransitionEl.innerHTML = `
                        <div class="ceremony-text-block">
                            <div class="ceremony-line-1">${atlasText("newSea")}</div>
                            <div class="ceremony-line-2">${seaLabel}</div>
                            <div class="ceremony-line-3">${themeName}</div>
                        </div>
                    `;
            regionTransitionEl.classList.remove("show", "ceremony-transition", "ceremony-fade-out");
            regionTransitionEl.style.opacity = "0";
            regionTransitionEl.style.transition = "opacity 700ms ease";
            regionTransitionEl.style.pointerEvents = "auto";
            requestAnimationFrame(() => {
              if (regionTransitionEl)
                regionTransitionEl.style.opacity = "1";
            });
            regionTransitionActive = true;
          }
          playSound("evolve_sound", 0.55) || playTone(580, 0.12, 0.022, "triangle");
        }
        break;
      case "darkening":
        if (_seaCeremonyTimer <= 0) {
          _seaCeremonyState = "overlay";
          _seaCeremonyTimer = 2;
          _seaCeremonyMidDone = false;
        }
        break;
      case "overlay":
        if (!_seaCeremonyMidDone && _seaCeremonyTimer <= 1) {
          _seaCeremonyMidDone = true;
          if (playerNarwhal)
            atlasCommittedRunMass = playerNarwhal.mass;
          setActiveAtlasTheme(_seaCeremonyNextTheme, true, false, true);
          saveProgressIfNeeded();
          submitTotalScoreIfNeeded();
          if (seaProgressButtonEl) {
            seaProgressButtonEl.classList.remove("sea-completing", "sea-completing-final");
          }
        }
        if (_seaCeremonyTimer <= 0) {
          _seaCeremonyState = "reveal";
          _seaCeremonyTimer = 1;
          _seaProgressSig = "";
          const nextIndex = Math.max(0, ATLAS_THEMES.findIndex((th) => th.id === _seaCeremonyNextTheme.id));
          if (seaProgressLabelEl)
            seaProgressLabelEl.textContent = getAtlasSeaLabel(_seaCeremonyNextTheme);
          if (seaProgressPercentEl)
            seaProgressPercentEl.textContent = "0%";
          if (seaProgressFillEl)
            seaProgressFillEl.style.width = "0%";
          if (seaProgressButtonEl) {
            const classes = seaProgressButtonEl.classList;
            classes.remove("sea-1", "sea-2", "sea-3", "sea-4", "complete");
            classes.add("sea-" + (nextIndex + 1));
          }
          if (regionTransitionEl) {
            regionTransitionEl.style.transition = "opacity 1000ms ease";
            regionTransitionEl.style.opacity = "0";
          }
        }
        break;
      case "reveal":
        if (_seaCeremonyTimer <= 0) {
          _seaCeremonyState = "idle";
          _seaCeremonyTimer = 0;
          _seaCeremonyTriggered = false;
          _seaProgressSig = "";
          regionTransitionPause = 0;
          regionTransitionActive = false;
          if (regionTransitionEl) {
            regionTransitionEl.style.opacity = "";
            regionTransitionEl.style.transition = "";
            regionTransitionEl.style.pointerEvents = "";
            regionTransitionEl.innerHTML = "";
          }
          if (playerNarwhal && !playerNarwhal.dying) {
            playerNarwhal.spawnProtection = Math.max(playerNarwhal.spawnProtection, 2);
          }
          updateAtlasUI();
        }
        break;
    }
  }
  var evolutionQueue = [];
  var evolutionQueueDelay = 0;
  var alphaHuntState = "inactive";
  var alphaHuntTimer = 0;
  var alphaCount = 0;
  var alphaHuntHunters = [];
  var alphaHuntRotateTimer = 0;
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function lerp(a, b, t2) {
    return a + (b - a) * t2;
  }
  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }
  function positiveMod(value, size) {
    return (value % size + size) % size;
  }
  function wrappedDelta(target, origin, size) {
    let delta = target - origin;
    if (delta > size * 0.5)
      delta -= size;
    else if (delta < -size * 0.5)
      delta += size;
    return delta;
  }
  function wrapCoordinate(value, size) {
    return positiveMod(value, size);
  }
  function distanceSq(ax, ay, bx, by) {
    const dx = wrappedDelta(ax, bx, ARENA_W);
    const dy = wrappedDelta(ay, by, ARENA_H);
    return dx * dx + dy * dy;
  }
  function nearestWrappedCoordinate(value, reference, size) {
    const referenceMod = positiveMod(reference, size);
    return reference + wrappedDelta(value, referenceMod, size);
  }
  function getRenderPosition(x, y) {
    const arena = window.gameConfig.arena;
    return {
      x: nearestWrappedCoordinate(x, camera.x, arena.width),
      y: nearestWrappedCoordinate(y, camera.y, arena.height)
    };
  }
  function normalizeAngle(angle) {
    while (angle > Math.PI)
      angle -= TWO_PI;
    while (angle < -Math.PI)
      angle += TWO_PI;
    return angle;
  }
  function shortestAngleDiff(target, current) {
    return normalizeAngle(target - current);
  }
  function hexToRgb(hex) {
    const clean = String(hex || "#FFFFFF").replace("#", "");
    const normalized = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.padEnd(6, "F").slice(0, 6);
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }
  function shadeColor(hex, amount) {
    const rgb = hexToRgb(hex);
    return `rgb(${clamp(rgb.r + amount, 0, 255)}, ${clamp(rgb.g + amount, 0, 255)}, ${clamp(rgb.b + amount, 0, 255)})`;
  }
  function rgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  function roundRectPath(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }
  function pointSegmentDistance(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const lengthSq = abx * abx + aby * aby;
    if (lengthSq <= 1e-4)
      return Math.hypot(px - ax, py - ay);
    const t2 = clamp(((px - ax) * abx + (py - ay) * aby) / lengthSq, 0, 1);
    const qx = ax + abx * t2;
    const qy = ay + aby * t2;
    return Math.hypot(px - qx, py - qy);
  }
  function segmentSegmentDistance(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
    return Math.min(
      pointSegmentDistance(a1x, a1y, b1x, b1y, b2x, b2y),
      pointSegmentDistance(a2x, a2y, b1x, b1y, b2x, b2y),
      pointSegmentDistance(b1x, b1y, a1x, a1y, a2x, a2y),
      pointSegmentDistance(b2x, b2y, a1x, a1y, a2x, a2y)
    );
  }
  function getTierForMass(mass) {
    let tier = 1;
    for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
      if (mass >= TIER_THRESHOLDS[i])
        tier = i + 1;
      else
        break;
    }
    return tier;
  }
  var _narwhalListCache = [];
  function getAllNarwhals() {
    _narwhalListCache.length = 0;
    if (playerNarwhal && !playerNarwhal.dying)
      _narwhalListCache.push(playerNarwhal);
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const narwhal = aiNarwhals[i];
      if (narwhal && !narwhal.dying)
        _narwhalListCache.push(narwhal);
    }
    return _narwhalListCache;
  }
  function isInView(x, y, margin = 100) {
    const px = camera.x + wrappedDelta(x, _camModX, ARENA_W);
    const py = camera.y + wrappedDelta(y, _camModY, ARENA_H);
    return px >= viewBounds.minX - margin && px <= viewBounds.maxX + margin && py >= viewBounds.minY - margin && py <= viewBounds.maxY + margin;
  }
  function ensureRuntimeConfig() {
    const c = window.gameConfig = window.gameConfig || {};
    c.arena = c.arena || { width: 3400, height: 3400 };
    c.narwhal = c.narwhal || {
      playerColor: "#4BC9E0",
      initialMass: 5,
      speed: 200,
      baseRadius: 26,
      turnSpeed: 18
    };
    c.orbs = c.orbs || {
      count: 180,
      size: 13,
      colors: ["#7FF0C0"]
    };
    c.collectibles = c.collectibles || {
      coralCount: 9,
      starfishCount: 3,
      coralValue: 4,
      starfishDuration: SPEED_BUFF_DURATION
    };
    c.ai = c.ai || {
      count: 16,
      colors: ["#F0783E", "#3E91D0", "#8D57B5", "#E0A62D", "#35A57B", "#C34E48", "#516FC2", "#8B7040"],
      difficulty: "Easy"
    };
    c.boost = c.boost || {
      multiplier: 2.1,
      energyMax: 100,
      drainPerSecond: 20,
      regenPerSecond: 33,
      regenDelay: 0.55,
      emptyLockout: 0.55
    };
    c.combat = c.combat || {
      hornLength: 42,
      hornWidth: 18,
      spawnProtection: 2
    };
    c.visual = c.visual || {
      backgroundColor: "#7DD4CC",
      gridVisible: false,
      cameraZoom: 1,
      decorCount: 62,
      decorOpacity: 0.25,
      spriteScale: 1.08,
      spriteRotation: 1.5708,
      musicVolume: 0.16
    };
    if (typeof c.arena.width !== "number")
      c.arena.width = 3400;
    if (typeof c.arena.height !== "number")
      c.arena.height = 3400;
    if (typeof c.orbs.count !== "number")
      c.orbs.count = 180;
    if (!Array.isArray(c.orbs.colors) || !c.orbs.colors.length)
      c.orbs.colors = ["#FFD84A"];
    if (typeof c.collectibles.coralCount !== "number")
      c.collectibles.coralCount = 9;
    if (typeof c.collectibles.starfishCount !== "number")
      c.collectibles.starfishCount = 3;
    if (typeof c.collectibles.coralValue !== "number")
      c.collectibles.coralValue = 4;
    if (typeof c.collectibles.starfishDuration !== "number")
      c.collectibles.starfishDuration = SPEED_BUFF_DURATION;
    if (typeof c.ai.count !== "number")
      c.ai.count = 16;
    if (typeof c.visual.decorCount !== "number")
      c.visual.decorCount = 62;
    if (typeof c.visual.decorOpacity !== "number")
      c.visual.decorOpacity = 0.25;
    if (typeof c.visual.spriteScale !== "number")
      c.visual.spriteScale = 1.08;
    if (typeof c.visual.spriteRotation !== "number")
      c.visual.spriteRotation = 1.5708;
    if (typeof c.visual.musicVolume !== "number")
      c.visual.musicVolume = 0.16;
    refreshArenaCache();
  }
  function applyCanvasDPR(cap = 1.5) {
    const dpr = Math.min(window.devicePixelRatio || 1, cap);
    const newWidth = Math.round(CANVAS_WIDTH * dpr);
    if (canvas.width !== newWidth) {
      canvas.width = newWidth;
      canvas.height = Math.round(CANVAS_HEIGHT * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function initAudio() {
    if (audioContext)
      return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      backgroundMusicGain = audioContext.createGain();
      backgroundMusicGain.gain.value = 0;
      backgroundMusicGain.connect(audioContext.destination);
      sfxGainNode = audioContext.createGain();
      sfxGainNode.gain.value = sfxVolume;
      sfxGainNode.connect(audioContext.destination);
    } catch (error) {
      if (typeof lib !== "undefined" && lib.log)
        lib.log("Audio unavailable: " + error.message);
    }
  }
  async function loadAudioRaw(assetId) {
    if (typeof lib === "undefined" || !lib.getAsset)
      return;
    const asset = lib.getAsset(assetId);
    if (!asset || asset.type !== "audio" || !asset.url)
      return;
    try {
      const response = await fetch(asset.url);
      const buffer = await response.arrayBuffer();
      if (audioContext) {
        audioBuffers[assetId] = await audioContext.decodeAudioData(buffer);
        if ((assetId === "background_music" || assetId === "background_music_deep") && gameStarted && soundEnabled) {
          syncBackgroundMusicForTheme();
        }
      } else {
        pendingAudioData[assetId] = buffer;
      }
    } catch (error) {
      if (lib.log)
        lib.log("Failed to fetch audio " + assetId + ": " + error.message);
    }
  }
  async function decodeAllPendingAudio() {
    if (!audioContext)
      return;
    const ids = Object.keys(pendingAudioData);
    for (const id of ids) {
      if (audioBuffers[id]) {
        delete pendingAudioData[id];
        continue;
      }
      try {
        const buffer = await audioContext.decodeAudioData(pendingAudioData[id].slice(0));
        audioBuffers[id] = buffer;
        delete pendingAudioData[id];
      } catch (e) {
        if (typeof lib !== "undefined" && lib.log)
          lib.log("Failed to decode audio " + id);
      }
    }
  }
  function playSound(assetId, volume = 1, loop = false) {
    if (!soundEnabled || !audioContext || !audioBuffers[assetId])
      return null;
    if (loop && musicVolume <= 0)
      return null;
    if (!loop && sfxVolume <= 0)
      return null;
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {
      });
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    source.buffer = audioBuffers[assetId];
    source.loop = loop;
    gain.gain.value = volume;
    source.connect(gain);
    if (loop && backgroundMusicGain) {
      gain.connect(backgroundMusicGain);
    } else if (sfxGainNode) {
      gain.connect(sfxGainNode);
    } else {
      gain.connect(audioContext.destination);
    }
    try {
      source.start();
    } catch (e) {
    }
    return { source, gain };
  }
  function playTone(frequency, duration, volume = 0.035, type = "sine") {
    if (!soundEnabled || !audioContext || sfxVolume <= 0)
      return;
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {
      });
    try {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-4, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(sfxGainNode || audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) {
    }
  }
  function getDesiredMusicAssetId() {
    const deepAct = activeAtlasTheme && (activeAtlasTheme.id === "sunken-route" || activeAtlasTheme.id === "twilight-abyss");
    return deepAct ? "background_music_deep" : "background_music";
  }
  function requestDeepMusicIfNeeded() {
    if (deepMusicLoadRequested || audioBuffers.background_music_deep || pendingAudioData.background_music_deep)
      return;
    deepMusicLoadRequested = true;
    loadAudioRaw("background_music_deep");
  }
  function stopBackgroundMusic(fadeSeconds = 0.8) {
    const current = backgroundMusicSource;
    backgroundMusicSource = null;
    activeMusicAssetId = null;
    if (!current)
      return;
    try {
      const now = audioContext ? audioContext.currentTime : 0;
      if (current.gain && current.gain.gain && audioContext) {
        current.gain.gain.cancelScheduledValues(now);
        current.gain.gain.setValueAtTime(Math.max(1e-4, current.gain.gain.value || 1), now);
        current.gain.gain.exponentialRampToValueAtTime(1e-4, now + fadeSeconds);
      }
      window.setTimeout(() => {
        try {
          current.source.stop();
        } catch (_) {
        }
      }, Math.ceil(fadeSeconds * 1e3) + 40);
    } catch (_) {
      try {
        current.source.stop();
      } catch (_2) {
      }
    }
  }
  function playBackgroundMusic(assetId = null) {
    const desired = assetId || getDesiredMusicAssetId();
    requestedMusicAssetId = desired;
    if (desired === "background_music_deep")
      requestDeepMusicIfNeeded();
    const playableId = audioBuffers[desired] ? desired : "background_music";
    if (backgroundMusicSource && activeMusicAssetId === playableId)
      return;
    if (!audioBuffers[playableId])
      return;
    if (backgroundMusicSource)
      stopBackgroundMusic(0.75);
    const result = playSound(playableId, 1, true);
    if (!result)
      return;
    backgroundMusicSource = result;
    activeMusicAssetId = playableId;
    if (backgroundMusicGain && audioContext) {
      const configMax = clamp(window.gameConfig.visual.musicVolume || 0.17, 0, 0.35);
      const target = configMax * musicVolume;
      backgroundMusicGain.gain.cancelScheduledValues(audioContext.currentTime);
      backgroundMusicGain.gain.setValueAtTime(1e-3, audioContext.currentTime);
      backgroundMusicGain.gain.exponentialRampToValueAtTime(Math.max(1e-3, target), audioContext.currentTime + 1.25);
    }
  }
  function syncBackgroundMusicForTheme() {
    if (!gameStarted || !soundEnabled || musicVolume <= 0)
      return;
    playBackgroundMusic(getDesiredMusicAssetId());
  }
  async function loadImageAsset(assetId) {
    if (typeof lib === "undefined" || !lib.getAsset)
      return null;
    const asset = lib.getAsset(assetId);
    if (!asset || !asset.url)
      return null;
    const image = new Image();
    image.src = asset.url;
    return new Promise((resolve) => {
      let isDone = false;
      const done = () => {
        if (isDone)
          return;
        isDone = true;
        resolve(image.complete && image.naturalWidth > 0 ? image : null);
      };
      image.onload = done;
      image.onerror = done;
      setTimeout(() => {
        if (!isDone) {
          isDone = true;
          resolve(null);
        }
      }, 1e4);
    });
  }
  async function loadFirstAvailableImage(assetIds) {
    for (const assetId of assetIds || []) {
      const image = await loadImageAsset(assetId);
      if (image)
        return { assetId, image };
    }
    return null;
  }
  async function loadActiveAtlasThemeVisuals() {
    const theme = activeAtlasTheme || ATLAS_THEMES[0];
    const loadNonce = ++_atlasThemeLoadNonce;
    const [backgroundResult, planktonResult, decorResults] = await Promise.all([
      loadFirstAvailableImage(theme.backgroundIds),
      loadFirstAvailableImage(theme.planktonIds),
      Promise.all(theme.decorSlots.map((slot) => loadFirstAvailableImage(slot)))
    ]);
    if (loadNonce !== _atlasThemeLoadNonce || theme !== activeAtlasTheme)
      return;
    if (backgroundResult && backgroundResult.image) {
      backgroundTexture = backgroundResult.image;
      backgroundPattern = null;
    }
    if (planktonResult && planktonResult.image) {
      collectibleSprites.collectible_plankton = planktonResult.image;
      buildOrbPreRenderCache();
    }
    const nextDecorImages = {};
    for (const result of decorResults) {
      if (result && result.image)
        nextDecorImages[result.assetId] = result.image;
    }
    if (Object.keys(nextDecorImages).length > 0) {
      decorImages = nextDecorImages;
      buildDecorPlacements();
    }
  }
  function getNarwhalSprite(tier) {
    const t2 = clamp(Math.round(tier), 1, 20);
    if (narwhalSprites[t2])
      return narwhalSprites[t2];
    for (let d = 1; d < 20; d++) {
      if (t2 - d >= 1 && narwhalSprites[t2 - d])
        return narwhalSprites[t2 - d];
      if (t2 + d <= 20 && narwhalSprites[t2 + d])
        return narwhalSprites[t2 + d];
    }
    return null;
  }
  function buildLootTintSprites() {
    lootTintSprites = {};
    const definitions = [
      ["single", collectibleSprites.loot_tusk_shard]
    ];
    for (const [key, image] of definitions) {
      if (!image || !image.complete || image.naturalWidth <= 0)
        continue;
      const maxSide = 256;
      const ratio = image.naturalWidth / image.naturalHeight;
      const width = ratio >= 1 ? maxSide : Math.round(maxSide * ratio);
      const height = ratio >= 1 ? Math.round(maxSide / ratio) : maxSide;
      const tinted = document.createElement("canvas");
      tinted.width = Math.max(1, width);
      tinted.height = Math.max(1, height);
      const tc = tinted.getContext("2d");
      tc.drawImage(image, 0, 0, tinted.width, tinted.height);
      tc.globalCompositeOperation = "source-atop";
      tc.fillStyle = "#E03C3C";
      tc.fillRect(0, 0, tinted.width, tinted.height);
      tc.globalCompositeOperation = "source-over";
      lootTintSprites[key] = tinted;
    }
  }
  function updateLoadingProgress(loaded, total) {
    const fill = document.getElementById("start-loading-fill");
    const status = document.getElementById("start-status");
    if (fill)
      fill.style.width = Math.round(loaded / total * 100) + "%";
    if (status)
      status.textContent = `${t("loading")} ${loaded}/${total}`;
  }
  function finishLoading() {
    const fill = document.getElementById("start-loading-fill");
    const status = document.getElementById("start-status");
    const btn = document.getElementById("start-play-btn");
    if (fill)
      fill.style.width = "100%";
    if (status)
      status.textContent = t("ready");
    if (btn)
      btn.disabled = false;
  }
  var _assetsLoadPromise = null;
  function loadAssets() {
    if (_assetsLoadPromise)
      return _assetsLoadPromise;
    _assetsLoadPromise = (async () => {
      if (assetsLoaded) {
        finishLoading();
        return;
      }
      const CRITICAL_MAX_TIER = 20;
      const criticalCollectibleIds = ["collectible_plankton", "collectible_plankton_a", "collectible_plankton_c", "collectible_coral", "collectible_starfish", "loot_tusk_shard", "decor_sea_turtle", "decor_anglerfish", "decor_clownfish"];
      const totalCritical = 1 + CRITICAL_MAX_TIER + criticalCollectibleIds.length;
      let loaded = 0;
      const tick = () => {
        loaded++;
        updateLoadingProgress(loaded, totalCritical);
      };
      const background = await loadFirstAvailableImage(activeAtlasTheme.backgroundIds) || await loadFirstAvailableImage(["background_texture"]);
      if (background && background.image)
        backgroundTexture = background.image;
      tick();
      const spriteJobs = [];
      for (let tier = 1; tier <= CRITICAL_MAX_TIER; tier++) {
        const padded = String(tier).padStart(2, "0");
        spriteJobs.push((async () => {
          const image = await loadImageAsset(`narwhal_tier_${padded}_v2`);
          if (image)
            narwhalSprites[tier] = image;
          tick();
        })());
      }
      for (const id of criticalCollectibleIds) {
        spriteJobs.push(loadImageAsset(id).then((image) => {
          if (image)
            collectibleSprites[id] = image;
          tick();
        }));
      }
      await Promise.all(spriteJobs);
      buildLootTintSprites();
      assetsLoaded = true;
      buildOrbPreRenderCache();
      finishLoading();
      for (let tier = CRITICAL_MAX_TIER + 1; tier <= 20; tier++) {
        const padded = String(tier).padStart(2, "0");
        loadImageAsset(`narwhal_tier_${padded}_v2`).then((image) => {
          if (image)
            narwhalSprites[tier] = image;
        });
      }
      const audioIds = [
        "background_music",
        "orb_collect_sound",
        "death_sound",
        "respawn_sound",
        "boost_sound",
        "hit_sound",
        "kill_sound",
        "evolve_sound"
      ];
      loadActiveAtlasThemeVisuals();
      loadImageAsset("leader_crown").then((image) => {
        if (image)
          collectibleSprites._leaderCrown = image;
      });
      loadImageAsset("shark_predator_closed").then((image) => {
        if (image)
          orcaSprite = image;
      });
      loadImageAsset("shark_predator_open").then((image) => {
        if (image)
          orcaSpriteOpen = image;
      });
      loadImageAsset("decor_kraken_presence").then((image) => {
        if (image)
          krakenSprite = image;
      });
      loadImageAsset("decor_sunken_wreck").then((image) => {
        if (image)
          wreckSprite = image;
      });
      for (const id of audioIds) {
        loadAudioRaw(id);
      }
      loadAudioRaw("alpha_hunt_start_sound");
      loadAudioRaw("alpha_hunt_win_sound");
      loadAudioRaw("orca_warning_sound");
    })();
    return _assetsLoadPromise;
  }
  function buildOrbPreRenderCache() {
    const baseSize = window.gameConfig.orbs.size;
    const kinds = ["common", "coral", "starfish", "loot", "loot_cluster"];
    const colorMap = { common: "#7FF0C0", coral: "#FF8A6B", starfish: "#FFB84A", loot: "#E8E4D8", loot_cluster: "#E8E4D8" };
    const blurMap = { common: 7, coral: 12, starfish: 12, loot: 12, loot_cluster: 12 };
    const sizeMultMap = { common: 2.15, coral: 2.65, starfish: 3.8, loot: 2.85, loot_cluster: 2.85 };
    for (const kind of kinds) {
      const blur = blurMap[kind];
      const drawSize = baseSize * sizeMultMap[kind];
      const padding = blur * 2 + 4;
      const canvasSize = Math.ceil(drawSize + padding * 2);
      const offCanvas = document.createElement("canvas");
      offCanvas.width = canvasSize;
      offCanvas.height = canvasSize;
      const oc = offCanvas.getContext("2d");
      const cx = canvasSize / 2;
      const cy = canvasSize / 2;
      const color = colorMap[kind];
      oc.shadowColor = color;
      oc.shadowBlur = blur;
      let sprite = null;
      if (kind === "common")
        sprite = collectibleSprites.collectible_plankton;
      else if (kind === "coral")
        sprite = collectibleSprites.collectible_coral;
      else if (kind === "starfish")
        sprite = collectibleSprites.collectible_starfish;
      else if (kind === "loot_cluster")
        sprite = collectibleSprites.loot_tusk_shard;
      else if (kind === "loot")
        sprite = collectibleSprites.loot_tusk_shard;
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        oc.drawImage(sprite, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
        if (kind === "common") {
          oc.shadowBlur = 0;
          oc.globalAlpha = 0.85;
          oc.fillStyle = "#ffffff";
          oc.beginPath();
          oc.arc(cx, cy, drawSize * 0.35 / 2, 0, TWO_PI);
          oc.fill();
          oc.globalAlpha = 1;
        }
      } else if (kind === "loot" || kind === "loot_cluster") {
        const s = baseSize;
        oc.save();
        oc.translate(cx, cy);
        oc.fillStyle = "#B84335";
        oc.strokeStyle = "#6C251E";
        oc.lineWidth = 1.5;
        oc.beginPath();
        oc.moveTo(-s * 0.85, -s * 0.15);
        oc.quadraticCurveTo(-s * 0.28, -s * 0.95, s * 0.55, -s * 0.52);
        oc.quadraticCurveTo(s * 1.02, s * 0.05, s * 0.3, s * 0.78);
        oc.quadraticCurveTo(-s * 0.48, s * 0.88, -s * 0.85, -s * 0.15);
        oc.fill();
        oc.stroke();
        oc.fillStyle = "rgba(255,205,120,0.62)";
        oc.beginPath();
        oc.ellipse(-s * 0.22, -s * 0.2, s * 0.23, s * 0.14, -0.5, 0, TWO_PI);
        oc.fill();
        oc.restore();
      } else if (kind === "starfish") {
        const s = baseSize;
        oc.save();
        oc.translate(cx, cy);
        oc.rotate(-Math.PI / 2);
        oc.fillStyle = "#F0913A";
        oc.beginPath();
        for (let p = 0; p < 10; p++) {
          const r = p % 2 === 0 ? s * 1.05 : s * 0.44;
          const a = p / 10 * TWO_PI;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0)
            oc.moveTo(px, py);
          else
            oc.lineTo(px, py);
        }
        oc.closePath();
        oc.fill();
        oc.fillStyle = "rgba(255, 226, 160, 0.75)";
        oc.beginPath();
        oc.arc(0, 0, s * 0.26, 0, TWO_PI);
        oc.fill();
        oc.restore();
      } else {
        oc.fillStyle = color;
        oc.beginPath();
        oc.arc(cx, cy, baseSize, 0, TWO_PI);
        oc.fill();
        oc.fillStyle = "rgba(255,255,255,0.66)";
        oc.beginPath();
        oc.arc(cx - baseSize * 0.28, cy - baseSize * 0.32, baseSize * 0.25, 0, TWO_PI);
        oc.fill();
      }
      orbPreRendered[kind] = { canvas: offCanvas, halfSize: canvasSize / 2, baseDrawSize: drawSize };
    }
  }
  function spawnParticles(x, y, color, count = 10, speed = 110, size = 3, lifetime = 0.55, shape = "dot") {
    const available = particleBudget() - particles.length;
    if (available <= 0)
      return;
    const actual = count < available ? count : available;
    const arenaW = window.gameConfig.arena.width;
    const arenaH = window.gameConfig.arena.height;
    const baseX = wrapCoordinate(x, arenaW);
    const baseY = wrapCoordinate(y, arenaH);
    for (let i = 0; i < actual; i++) {
      const angle = Math.random() * TWO_PI;
      const velocity = speed * randRange(0.35, 1);
      particles.push({
        x: baseX,
        y: baseY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: size * randRange(0.65, 1.25),
        color,
        life: lifetime * randRange(0.7, 1.2),
        maxLife: lifetime,
        drag: randRange(2.2, 4.2),
        shape,
        rotation: Math.random() * TWO_PI,
        spin: randRange(-6, 6)
      });
    }
  }
  function addFloatingText(x, y, text, color = "#FFFFFF", size = 18) {
    floatingTexts.push({
      x: wrapCoordinate(x, window.gameConfig.arena.width),
      y: wrapCoordinate(y, window.gameConfig.arena.height),
      text,
      color,
      size,
      life: 0.85,
      maxLife: 0.85,
      vy: -42
    });
  }
  function updateEffects(dt) {
    let rLen = deathRipples.length;
    for (let i = 0; i < rLen; i++) {
      const r = deathRipples[i];
      r.elapsed += dt;
      if (r.elapsed >= r.duration) {
        deathRipples[i] = deathRipples[--rLen];
        i--;
      }
    }
    deathRipples.length = rLen;
    const arenaW = window.gameConfig.arena.width;
    const arenaH = window.gameConfig.arena.height;
    let len = particles.length;
    for (let i = 0; i < len; i++) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles[i] = particles[--len];
        i--;
        continue;
      }
      const drag = 1 - p.drag * dt;
      if (drag > 0) {
        p.vx *= drag;
        p.vy *= drag;
      } else {
        p.vx = 0;
        p.vy = 0;
      }
      p.x = wrapCoordinate(p.x + p.vx * dt, arenaW);
      p.y = wrapCoordinate(p.y + p.vy * dt, arenaH);
      p.rotation += p.spin * dt;
    }
    particles.length = len;
    let tLen = floatingTexts.length;
    for (let i = 0; i < tLen; i++) {
      const text = floatingTexts[i];
      text.life -= dt;
      if (text.life <= 0) {
        floatingTexts[i] = floatingTexts[--tLen];
        i--;
        continue;
      }
      text.y = wrapCoordinate(text.y + text.vy * dt, arenaH);
    }
    floatingTexts.length = tLen;
    if (evolutionBanner) {
      evolutionBanner.timer -= dt;
      if (evolutionBanner.timer <= 0)
        evolutionBanner = null;
    }
    screenShake = Math.max(0, screenShake - dt * 28);
  }
  function drawEffects(context) {
    const arena = window.gameConfig.arena;
    const vMinX = viewBounds.minX - 40;
    const vMaxX = viewBounds.maxX + 40;
    const vMinY = viewBounds.minY - 40;
    const vMaxY = viewBounds.maxY + 40;
    const camModX = positiveMod(camera.x, arena.width);
    const camModY = positiveMod(camera.y, arena.height);
    const visible = [];
    for (let i = 0, len = particles.length; i < len; i++) {
      const p = particles[i];
      const px = camera.x + wrappedDelta(p.x, camModX, arena.width);
      const py = camera.y + wrappedDelta(p.y, camModY, arena.height);
      if (px < vMinX || px > vMaxX || py < vMinY || py > vMaxY)
        continue;
      p._rx = px;
      p._ry = py;
      visible.push(p);
    }
    visible.sort((a, b) => a.color < b.color ? -1 : a.color > b.color ? 1 : 0);
    let currentColor = "";
    for (let i = 0, len = visible.length; i < len; i++) {
      const p = visible[i];
      const px = p._rx;
      const py = p._ry;
      const alpha = p.life / p.maxLife;
      if (p.color !== currentColor) {
        currentColor = p.color;
        context.fillStyle = currentColor;
      }
      if (p.shape === "shard") {
        context.save();
        context.translate(px, py);
        context.rotate(p.rotation);
        context.globalAlpha = alpha;
        context.beginPath();
        context.ellipse(0, 0, p.size * 1.45, p.size * 0.55, 0, 0, TWO_PI);
        context.fill();
        context.restore();
      } else if (p.shape === "blood_cloud") {
        const growFactor = 1 + (1 - alpha) * 1.6;
        const cloudAlpha = alpha * alpha;
        context.globalAlpha = cloudAlpha;
        context.beginPath();
        context.ellipse(px, py, p.size * 1.3 * growFactor, p.size * 0.72 * growFactor, 0, 0, TWO_PI);
        context.fill();
      } else if (p.shape === "splash") {
        context.globalAlpha = alpha;
        context.beginPath();
        context.ellipse(px, py, p.size * 1.3, p.size * 0.72, 0, 0, TWO_PI);
        context.fill();
      } else {
        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(px, py, p.size * (0.45 + alpha * 0.55), 0, TWO_PI);
        context.fill();
      }
    }
    context.globalAlpha = 1;
    for (let i = 0, len = deathRipples.length; i < len; i++) {
      const r = deathRipples[i];
      if (r.elapsed < r.delay)
        continue;
      const t2 = (r.elapsed - r.delay) / (r.duration - r.delay);
      if (t2 < 0 || t2 > 1)
        continue;
      const rx = camera.x + wrappedDelta(r.x, camModX, arena.width);
      const ry = camera.y + wrappedDelta(r.y, camModY, arena.height);
      if (rx < vMinX - 200 || rx > vMaxX + 200 || ry < vMinY - 200 || ry > vMaxY + 200)
        continue;
      const radius = r.startRadius + (r.endRadius - r.startRadius) * t2;
      const alpha = 0.22 * (1 - t2);
      context.beginPath();
      context.arc(rx, ry, radius, 0, TWO_PI);
      context.strokeStyle = `rgba(210, 245, 255, ${alpha})`;
      context.lineWidth = r.lineWidth * (1 - t2 * 0.5);
      context.stroke();
    }
    const tvMinY = viewBounds.minY - 80;
    const tvMaxY = viewBounds.maxY + 80;
    const tvMinX = viewBounds.minX - 80;
    const tvMaxX = viewBounds.maxX + 80;
    for (let i = 0, len = floatingTexts.length; i < len; i++) {
      const text = floatingTexts[i];
      const tx = camera.x + wrappedDelta(text.x, camModX, arena.width);
      const ty = camera.y + wrappedDelta(text.y, camModY, arena.height);
      if (tx < tvMinX || tx > tvMaxX || ty < tvMinY || ty > tvMaxY)
        continue;
      const alpha = text.life / text.maxLife;
      context.save();
      context.globalAlpha = alpha;
      context.textAlign = "center";
      context.font = `800 ${text.size}px Orbitron, sans-serif`;
      context.lineWidth = 5;
      context.strokeStyle = "rgba(0,0,0,0.55)";
      context.strokeText(text.text, tx, ty);
      context.fillStyle = text.color;
      context.fillText(text.text, tx, ty);
      context.restore();
    }
  }
  var Orb = class {
    constructor(x, y, kind = "common", value = 1, size = null, vx = 0, vy = 0) {
      this.x = wrapCoordinate(x, window.gameConfig.arena.width);
      this.y = wrapCoordinate(y, window.gameConfig.arena.height);
      this.vx = vx;
      this.vy = vy;
      this.kind = kind;
      this.isSuper = kind === "loot";
      this.value = Math.max(1, Math.round(value));
      this.size = size || window.gameConfig.orbs.size;
      this.phase = Math.random() * TWO_PI;
      this.spin = this.isSuper ? 0 : randRange(-0.2, 0.2);
      this.rotation = this.isSuper ? randRange(-0.2, 0.2) : randRange(-0.1, 0.1);
      this.variant = 0;
      this.age = 0;
      this.lifetime = this.isSuper ? SUPER_ORB_DECAY_TIME / 1e3 : Infinity;
      this.collectDelay = this.isSuper ? LOOT_COLLECT_DELAY : 0;
      this.pileTier = 1;
      this.lootPieceIndex = 0;
      this.lootPieceCount = 1;
    }
    getColor() {
      if (this.kind === "coral")
        return "#FF8A6B";
      if (this.kind === "energy")
        return "#52DDF4";
      if (this.kind === "starfish")
        return "#FFB84A";
      if (this.kind === "loot")
        return "#E8E4D8";
      return "#7FF0C0";
    }
    getSprite() {
      if (this.kind === "common")
        return collectibleSprites.collectible_plankton || null;
      if (this.kind === "coral")
        return collectibleSprites.collectible_coral || null;
      if (this.kind === "energy")
        return collectibleSprites.collectible_bubble || null;
      if (this.kind === "starfish")
        return collectibleSprites.collectible_starfish || null;
      if (this.kind === "loot") {
        return collectibleSprites.loot_tusk_shard || null;
      }
      return null;
    }
    update(dt) {
      if (this.vx !== 0 || this.vy !== 0) {
        this.x = wrapCoordinate(this.x + this.vx * dt, window.gameConfig.arena.width);
        this.y = wrapCoordinate(this.y + this.vy * dt, window.gameConfig.arena.height);
        const drag = Math.max(0, 1 - (this.isSuper ? 11.5 : 6) * dt);
        this.vx *= drag;
        this.vy *= drag;
        if (Math.abs(this.vx) < 0.8 && Math.abs(this.vy) < 0.8) {
          this.vx = 0;
          this.vy = 0;
        }
      }
      this.phase += dt * (this.isSuper ? 2 : 2.35);
      this.rotation += this.spin * dt;
      this.age += dt;
      return !this.isSuper || this.age < this.lifetime;
    }
    drawLootPiece(context) {
      let spawnScale = 1;
      if (this.age < LOOT_SPAWN_DURATION) {
        const t2 = clamp(this.age / LOOT_SPAWN_DURATION, 0, 1);
        if (t2 < 0.72) {
          const u = t2 / 0.72;
          spawnScale = lerp(0.16, 1.13, 1 - Math.pow(1 - u, 3));
        } else {
          spawnScale = lerp(1.13, 1, (t2 - 0.72) / 0.28);
        }
      }
      const lootOffset = this.lootPieceIndex * 0.7;
      const bob = Math.sin(this.phase * 0.92 + lootOffset) * 2.4;
      const tilt = Math.sin(this.phase * 0.63 + lootOffset) * 0.03;
      const subtlePulse = 1 + Math.sin(this.phase + lootOffset) * 0.03;
      const diameter = this.size * spawnScale * subtlePulse;
      const finalFade = clamp((this.lifetime - this.age) / 1.2, 0, 1);
      const sprite = this.getSprite();
      const redTint = lootTintSprites.single;
      context.save();
      context.translate(this.x, this.y + bob);
      context.rotate(this.rotation + tilt);
      context.globalAlpha = finalFade;
      context.save();
      context.scale(1, 0.78);
      context.fillStyle = "rgba(2, 26, 52, 0.20)";
      context.beginPath();
      context.ellipse(0, diameter * 0.14, diameter * 0.38, diameter * 0.24, 0, 0, TWO_PI);
      context.fill();
      context.restore();
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        const aspect = sprite.naturalWidth / sprite.naturalHeight;
        const drawWidth = diameter;
        const drawHeight = diameter / aspect;
        const tierColor = TIER_COLORS[this.pileTier - 1] || "#DD7259";
        context.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        const tintAlpha = clamp(1 - this.age / 0.28, 0, 1) * 0.9;
        if (redTint && tintAlpha > 0) {
          context.globalAlpha = finalFade * tintAlpha;
          context.drawImage(redTint, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
      } else {
        const tierColor = TIER_COLORS[this.pileTier - 1] || "#DD7259";
        context.fillStyle = this.age < 0.28 ? "#E03C3C" : tierColor;
        context.beginPath();
        context.ellipse(0, 0, diameter * 0.44, diameter * 0.34, 0, 0, TWO_PI);
        context.fill();
      }
      context.restore();
    }
    draw(context) {
      if (this.kind === "loot") {
        this.drawLootPiece(context);
        return;
      }
      let popScale = 1;
      if (this.age < 0.34) {
        const t2 = this.age / 0.34;
        const c1 = 1.70158;
        const c3 = c1 + 1;
        popScale = 1 + c3 * Math.pow(t2 - 1, 3) + c1 * Math.pow(t2 - 1, 2);
      }
      const bob = Math.sin(this.phase * 0.92) * (this.kind === "common" ? 2 : 2.6);
      const tilt = Math.sin(this.phase * 0.63) * 0.025;
      const pulseAmount = this.kind === "common" ? 0.025 : 0.04;
      const pulse = 1 + Math.sin(this.phase * 0.78) * pulseAmount;
      const scale = pulse * Math.max(0, popScale);
      const cached = orbPreRendered[this.kind];
      if (cached) {
        const drawHalf = cached.halfSize * scale;
        context.save();
        context.translate(this.x, this.y + bob);
        context.rotate(this.rotation + tilt);
        context.drawImage(cached.canvas, -drawHalf, -drawHalf, drawHalf * 2, drawHalf * 2);
        context.restore();
      } else {
        const size = this.size * scale;
        context.save();
        context.translate(this.x, this.y + bob);
        context.fillStyle = this.getColor();
        context.beginPath();
        context.arc(0, 0, size, 0, TWO_PI);
        context.fill();
        context.restore();
      }
    }
  };
  var Narwhal = class {
    constructor(x, y, color, isPlayer = false, mass = 5, name = "RIVAL") {
      const config = window.gameConfig;
      this.x = x;
      this.y = y;
      this.angle = Math.random() * TWO_PI;
      this.targetAngle = this.angle;
      this.color = color;
      this.isPlayer = isPlayer;
      this.name = name;
      this.mass = Math.max(1, Math.round(mass));
      this.tier = getTierForMass(this.mass);
      this.scale = 1;
      this.bodyRadius = config.narwhal.baseRadius;
      this.hornLength = config.combat.hornLength;
      this.hornWidth = config.combat.hornWidth;
      this.baseSpeed = config.narwhal.speed;
      this.turnSpeed = config.narwhal.turnSpeed;
      if (isPlayer) {
        this.boostEnergyMax = config.boost.energyMax;
        this.boostRegenRate = config.boost.regenPerSecond;
        this.boostRegenDelayTime = config.boost.regenDelay;
      } else {
        this.boostEnergyMax = 62.5;
        this.boostRegenRate = 12.5;
        this.boostRegenDelayTime = 0.6;
      }
      this.boostEnergy = this.boostEnergyMax;
      this.boosting = false;
      this.moveIntent = !isPlayer;
      this.speedBuffTimer = 0;
      this.boostRegenDelay = 0;
      this.boostLockout = 0;
      this.wasBoosting = false;
      this.spawnProtection = config.combat.spawnProtection;
      this.combatLock = 0;
      this.stunTimer = 0;
      this.stunImmunity = 0;
      this.stunFadeTimer = 0;
      this.knockbackVx = 0;
      this.knockbackVy = 0;
      this.evolveFlash = 0;
      this.dying = false;
      this.deathAlpha = 1;
      this.deathScale = 1;
      this.deathSpin = randRange(-4.5, 4.5);
      this.kills = 0;
      this.isLeader = false;
      this.visualPhase = Math.random() * TWO_PI;
      this.swimPhase = Math.random() * TWO_PI;
      this.swimAmp = 1;
      this.glideSpeed = 0;
      this.aiThinkTimer = randRange(0.05, 0.28);
      this.aiWanderTimer = 0;
      this.aiWanderAngle = this.angle;
      this.aiBoostIntent = false;
      this.aiTarget = null;
      const basePuffCount = isPlayer ? 6 : 3;
      const tierBonus = isPlayer ? Math.floor((mass > 0 ? getTierForMass(mass) - 1 : 0) * 0.5) : 0;
      const puffCount = Math.min(basePuffCount + tierBonus, isPlayer ? 15 : 12);
      this.boostPuffs = Array.from({ length: puffCount }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        grow: 0,
        life: 0,
        maxLife: 0
      }));
      this.boostPuffCursor = 0;
      this.boostPuffTimer = 0;
      this.boostFlash = 0;
      this.updateDerivedStats();
    }
    updateDerivedStats() {
      const physicalMass = Math.min(this.mass, MAX_TIER_MASS);
      this.tier = getTierForMass(physicalMass);
      this.scale = clamp(1 + (this.tier - 1) * (2.25 / 19), 1, 3.25);
      this.bodyRadius = window.gameConfig.narwhal.baseRadius * this.scale;
      const tierHornBonus = (this.tier - 1) * 0.65;
      this.hornLength = (window.gameConfig.combat.hornLength + tierHornBonus) * (0.82 + this.scale * 0.18);
      this.hornWidth = window.gameConfig.combat.hornWidth * (0.78 + this.scale * 0.22);
      if (this.isPlayer && this.boostPuffs) {
        const targetPuffs = Math.min(6 + Math.floor((this.tier - 1) * 0.5), 15);
        while (this.boostPuffs.length < targetPuffs) {
          this.boostPuffs.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, radius: 0, grow: 0, life: 0, maxLife: 0 });
        }
      }
    }
    addMass(amount) {
      if (this.dying || amount <= 0)
        return;
      const oldTier = this.tier;
      this.mass += Math.max(1, Math.round(amount));
      this.updateDerivedStats();
      if (this.tier > oldTier) {
        this.evolveFlash = 1;
        if (this.isPlayer) {
          evolutionQueue.length = 0;
          evolutionQueue.push(this.tier);
          const isMilestone = [2, 5, 10, 15, 20].includes(this.tier);
          screenShake = Math.max(screenShake, isMilestone ? 8 : 4);
          playSound("evolve_sound", isMilestone ? 0.75 : 0.35) || playTone(620, isMilestone ? 0.16 : 0.1, 0.03, "triangle");
        }
      }
    }
    getForward() {
      return { x: Math.cos(this.angle), y: Math.sin(this.angle) };
    }
    getHornSegment() {
      const forward = this.getForward();
      const startDistance = this.bodyRadius * 0.44;
      const reachMult = getTierHornReachMult(this.tier);
      const endDistance = (this.bodyRadius * 0.95 + this.hornLength) * reachMult;
      return {
        ax: this.x + forward.x * startDistance,
        ay: this.y + forward.y * startDistance,
        bx: this.x + forward.x * endDistance,
        by: this.y + forward.y * endDistance
      };
    }
    setBoostIntent(intent) {
      this.boosting = Boolean(intent) && this.boostEnergy > 0 && this.boostLockout <= 0 && !this.dying;
    }
    updateBoost(dt) {
      const boostConfig = window.gameConfig.boost;
      if (this.boostLockout > 0)
        this.boostLockout = Math.max(0, this.boostLockout - dt);
      if (this.boosting && this.boostLockout <= 0) {
        this.boostEnergy -= boostConfig.drainPerSecond * dt;
        this.boostRegenDelay = this.boostRegenDelayTime;
        if (this.boostEnergy <= 0) {
          this.boostEnergy = 0;
          this.boosting = false;
          this.boostLockout = boostConfig.emptyLockout;
        }
      } else {
        this.boosting = false;
        this.boostRegenDelay = Math.max(0, this.boostRegenDelay - dt);
        if (this.boostRegenDelay <= 0 && this.boostLockout <= 0) {
          this.boostEnergy = Math.min(this.boostEnergyMax, this.boostEnergy + this.boostRegenRate * dt);
        }
      }
      if (this.boosting && !this.wasBoosting) {
        this.boostFlash = 1;
        if (this.isPlayer && !this._boostHeldDepleted) {
          playSound("boost_sound", 0.24) || playTone(150, 0.11, 0.025, "sawtooth");
        }
      }
      this.wasBoosting = this.boosting;
      if (this.boostFlash > 0)
        this.boostFlash = Math.max(0, this.boostFlash - dt * 4.5);
    }
    update(dt) {
      this.visualPhase += dt * (this.boosting ? 8 : 3);
      if (this.combatLock > 0)
        this.combatLock = Math.max(0, this.combatLock - dt);
      if (this.spawnProtection > 0)
        this.spawnProtection = Math.max(0, this.spawnProtection - dt);
      if (this.speedBuffTimer > 0)
        this.speedBuffTimer = Math.max(0, this.speedBuffTimer - dt);
      if (this.evolveFlash > 0)
        this.evolveFlash = Math.max(0, this.evolveFlash - dt * 1.45);
      if (this.stunTimer > 0) {
        const prevStun = this.stunTimer;
        this.stunTimer = Math.max(0, this.stunTimer - dt);
        if (this.stunTimer <= 0 && prevStun > 0) {
          this.stunImmunity = 0.45;
          this.stunFadeTimer = 0.15;
        }
      }
      if (this.stunImmunity > 0)
        this.stunImmunity = Math.max(0, this.stunImmunity - dt);
      if (this.stunFadeTimer > 0)
        this.stunFadeTimer = Math.max(0, this.stunFadeTimer - dt);
      if (this.knockbackVx !== 0 || this.knockbackVy !== 0) {
        this.x += this.knockbackVx * dt;
        this.y += this.knockbackVy * dt;
        const kbSpeed = Math.hypot(this.knockbackVx, this.knockbackVy);
        const dragRate = KNOCKBACK_DRAG_BASE + KNOCKBACK_DRAG_QUAD * kbSpeed;
        const drag = Math.max(0, 1 - dragRate * dt);
        this.knockbackVx *= drag;
        this.knockbackVy *= drag;
        if (Math.abs(this.knockbackVx) < 2 && Math.abs(this.knockbackVy) < 2) {
          this.knockbackVx = 0;
          this.knockbackVy = 0;
        }
        this.applyArenaBounds();
      }
      if (this.dying) {
        this.deathAlpha -= dt * 1.8;
        this.deathScale += dt * 1.8;
        this.angle += this.deathSpin * dt;
        return this.deathAlpha > 0;
      }
      const isStunned = this.stunTimer > 0;
      if (isStunned) {
        this.boosting = false;
      }
      this.updateBoost(dt);
      const angleDiff = shortestAngleDiff(this.targetAngle, this.angle);
      const sizeTurnPenalty = this.isPlayer ? 1 : 0.985 + (this.scale - 1) * 0.06;
      const boostTurnPenalty = this.boosting ? this.isPlayer ? 0.95 : 0.78 : 1;
      const stunTurnPenalty = isStunned ? STUN_TURN_FACTOR : 1;
      let controllerTurnSpeed = this.turnSpeed;
      let controllerSpeedMult = 1;
      if (!this.isPlayer) {
        const profile = this._aiProfile || "casual";
        const tuning = AI_PROFILE_TUNING[profile] || AI_PROFILE_TUNING.casual;
        controllerTurnSpeed = tuning.turnSpeed;
        controllerSpeedMult = tuning.speedMult;
        if (this._alphaHunter && alphaHuntState === "active") {
          controllerTurnSpeed = alphaCount <= 0 ? 4.6 : alphaCount === 1 ? 5.2 : 5.8;
          controllerSpeedMult = alphaCount <= 0 ? 0.94 : alphaCount === 1 ? 0.97 : 1;
        }
      }
      const maxTurn = controllerTurnSpeed / sizeTurnPenalty * boostTurnPenalty * stunTurnPenalty * dt;
      this.angle += clamp(angleDiff, -maxTurn, maxTurn);
      const shouldMove = this.isPlayer ? this.moveIntent || this.boosting : true;
      if (shouldMove) {
        const massSpeedPenalty = clamp(1 - (this.scale - 1) * 0.06, 0.9, 1);
        const boostMultiplier = this.boosting ? window.gameConfig.boost.multiplier : 1;
        const pickupMultiplier = this.speedBuffTimer > 0 ? SPEED_BUFF_MULTIPLIER : 1;
        const stunThrustPenalty = isStunned ? STUN_THRUST_FACTOR : 1;
        const speed = this.baseSpeed * controllerSpeedMult * massSpeedPenalty * boostMultiplier * pickupMultiplier * stunThrustPenalty;
        this.glideSpeed = speed;
        this.x += Math.cos(this.angle) * speed * dt;
        this.y += Math.sin(this.angle) * speed * dt;
        this.applyArenaBounds();
      } else if (GLIDE_ENABLED && this.glideSpeed > GLIDE_CUTOFF) {
        this.glideSpeed *= Math.pow(GLIDE_DECAY, dt);
        this.x += Math.cos(this.angle) * this.glideSpeed * dt;
        this.y += Math.sin(this.angle) * this.glideSpeed * dt;
        this.applyArenaBounds();
      } else {
        this.glideSpeed = 0;
      }
      this.swimPhase += dt * (this.boosting ? 13.5 : 7.4);
      if (this.swimPhase > TWO_PI * 1024)
        this.swimPhase -= TWO_PI * 1024;
      const swimTarget = shouldMove ? 1 : this.glideSpeed > GLIDE_CUTOFF ? 0.55 : 0.3;
      this.swimAmp += (swimTarget - this.swimAmp) * Math.min(1, dt * 6);
      this.updateBoostPuffs(dt);
      return true;
    }
    updateBoostPuffs(dt) {
      const arena = window.gameConfig.arena;
      for (const puff2 of this.boostPuffs) {
        if (!puff2.active)
          continue;
        puff2.life -= dt;
        if (puff2.life <= 0) {
          puff2.active = false;
          continue;
        }
        puff2.x = wrapCoordinate(puff2.x + puff2.vx * dt, arena.width);
        puff2.y = wrapCoordinate(puff2.y + puff2.vy * dt, arena.height);
        puff2.radius += puff2.grow * dt;
      }
      if (this.isPlayer && !this.boosting && !this.dying && this.moveIntent) {
        this.boostPuffTimer -= dt;
        if (this.boostPuffTimer <= 0) {
          this.boostPuffTimer += 0.13;
          const puff2 = this.boostPuffs[this.boostPuffCursor];
          this.boostPuffCursor = (this.boostPuffCursor + 1) % this.boostPuffs.length;
          const fx2 = Math.cos(this.angle);
          const fy2 = Math.sin(this.angle);
          const rx2 = -fy2;
          const ry2 = fx2;
          const side2 = randRange(-0.12, 0.12) * this.bodyRadius;
          const back2 = this.bodyRadius * randRange(2.05, 2.3);
          puff2.active = true;
          puff2.x = wrapCoordinate(this.x - fx2 * back2 + rx2 * side2, arena.width);
          puff2.y = wrapCoordinate(this.y - fy2 * back2 + ry2 * side2, arena.height);
          const driftSpeed2 = randRange(16, 32);
          puff2.vx = -fx2 * driftSpeed2 + randRange(-4, 4);
          puff2.vy = -fy2 * driftSpeed2 + randRange(-4, 4);
          puff2.radius = this.bodyRadius * randRange(0.07, 0.12);
          puff2.grow = this.bodyRadius * randRange(0.14, 0.24);
          puff2.maxLife = randRange(0.42, 0.62);
          puff2.life = puff2.maxLife;
        }
        return;
      }
      if (!this.boosting || this.dying) {
        this.boostPuffTimer = Math.min(this.boostPuffTimer, 0);
        return;
      }
      this.boostPuffTimer -= dt;
      const tierScale = this.isPlayer ? 1 + (this.tier - 1) * 0.065 : 1;
      const baseInterval = this.isPlayer ? 0.065 : 0.13;
      const interval = baseInterval / tierScale;
      if (this.boostPuffTimer > 0)
        return;
      this.boostPuffTimer += interval;
      const puff = this.boostPuffs[this.boostPuffCursor];
      this.boostPuffCursor = (this.boostPuffCursor + 1) % this.boostPuffs.length;
      const fx = Math.cos(this.angle);
      const fy = Math.sin(this.angle);
      const rx = -fy;
      const ry = fx;
      const sideSpread = (0.18 + (this.tier - 1) * 8e-3) * this.bodyRadius;
      const side = randRange(-sideSpread, sideSpread);
      const back = this.bodyRadius * randRange(2.05, 2.3);
      puff.active = true;
      puff.x = wrapCoordinate(this.x - fx * back + rx * side, arena.width);
      puff.y = wrapCoordinate(this.y - fy * back + ry * side, arena.height);
      const driftSpeed = randRange(28, 52) * tierScale;
      const lateralDrift = randRange(-8, 8);
      puff.vx = -fx * driftSpeed + rx * lateralDrift;
      puff.vy = -fy * driftSpeed + ry * lateralDrift;
      const sizeScale = 1 + (this.tier - 1) * 0.025;
      const kingScale = 1;
      puff.radius = this.isPlayer ? this.bodyRadius * randRange(0.07, 0.12) * sizeScale * kingScale : this.bodyRadius * randRange(0.04, 0.07);
      puff.grow = this.isPlayer ? this.bodyRadius * randRange(0.17, 0.29) * sizeScale * kingScale : this.bodyRadius * randRange(0.08, 0.14);
      const lifeScale = 1 + (this.tier - 1) * 0.02;
      const kingLifeScale = 1;
      puff.maxLife = (this.isPlayer ? randRange(0.25, 0.38) : randRange(0.18, 0.26)) * lifeScale * kingLifeScale;
      puff.life = puff.maxLife;
    }
    drawBoostPuffs(context) {
      const arena = window.gameConfig.arena;
      const refX = positiveMod(this.x, arena.width);
      const refY = positiveMod(this.y, arena.height);
      context.save();
      for (const puff of this.boostPuffs) {
        if (!puff.active || puff.life <= 0)
          continue;
        const px = this.x + wrappedDelta(puff.x, refX, arena.width);
        const py = this.y + wrappedDelta(puff.y, refY, arena.height);
        const life = clamp(puff.life / puff.maxLife, 0, 1);
        const tierAlpha = 1 + (this.tier - 1) * 0.015;
        const alpha = life * life * (this.isPlayer ? 0.74 : 0.2) * tierAlpha;
        const r = puff.radius * (1 + (1 - life) * 0.85);
        const isGoldenBoost = this.isPlayer && kingOfSeasUnlocked;
        const goldenScale = isGoldenBoost ? 1.45 : 1;
        const rScaled = r * goldenScale;
        context.globalAlpha = alpha * (isGoldenBoost ? 0.7 : 0.55);
        context.fillStyle = isGoldenBoost ? "rgba(255, 220, 80, 1)" : this.isPlayer ? "rgba(232, 246, 255, 1)" : "rgba(210, 228, 245, 1)";
        context.beginPath();
        context.arc(px, py, rScaled, 0, TWO_PI);
        context.fill();
        context.globalAlpha = alpha;
        context.strokeStyle = isGoldenBoost ? "rgba(255, 240, 160, 1)" : "rgba(255, 255, 255, 1)";
        context.lineWidth = Math.max(0.8, rScaled * 0.22);
        context.beginPath();
        context.arc(px, py, rScaled * 0.88, 0, TWO_PI);
        context.stroke();
      }
      context.globalAlpha = 1;
      context.restore();
    }
    applyArenaBounds() {
      const arena = window.gameConfig.arena;
      this.x = wrapCoordinate(this.x, arena.width);
      this.y = wrapCoordinate(this.y, arena.height);
    }
    getTierColor() {
      if (this.isPlayer && this.tier <= 3)
        return this.color;
      return TIER_COLORS[this.tier - 1] || this.color;
    }
    draw(context) {
      let alpha = this.dying ? clamp(this.deathAlpha, 0, 1) : 1;
      if (this.spawnProtection > 0) {
        alpha *= 0.35 + 0.65 * (Math.sin(this.visualPhase * 15) * 0.5 + 0.5);
      }
      const deathScale = this.dying ? this.deathScale : 1;
      const color = this.getTierColor();
      const pulse = 1 + Math.sin(this.visualPhase) * 0.012;
      const evolvePulse = this.evolveFlash > 0 ? 1 + this.evolveFlash * 0.25 : 1;
      const sprite = getNarwhalSprite(this.tier);
      if (this.isPlayer || perfQuality > 0)
        this.drawBoostPuffs(context);
      if (alpha <= 0)
        return;
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      const boostStretchX = this.boosting ? 1.025 : 1;
      const boostStretchY = this.boosting ? 0.99 : 1;
      context.scale(deathScale * pulse * evolvePulse * boostStretchX, deathScale * pulse * evolvePulse * boostStretchY);
      context.globalAlpha = alpha;
      context.save();
      context.rotate(-this.angle);
      const haloR = this.bodyRadius * 1.3;
      context.scale(1.22, 1.08);
      const haloGrad = context.createRadialGradient(0, 0, haloR * 0.15, 0, 0, haloR);
      haloGrad.addColorStop(0, "rgba(2, 25, 55, 0.20)");
      haloGrad.addColorStop(0.55, "rgba(2, 25, 55, 0.12)");
      haloGrad.addColorStop(1, "rgba(2, 25, 55, 0)");
      context.fillStyle = haloGrad;
      if (perfQuality > 0) {
        context.shadowColor = "rgba(2, 20, 50, 0.14)";
        context.shadowBlur = this.bodyRadius * 0.35;
      }
      context.beginPath();
      context.arc(0, 0, haloR, 0, TWO_PI);
      context.fill();
      context.restore();
      if (this.evolveFlash > 0) {
        const progress = 1 - this.evolveFlash;
        const tierColor = TIER_COLORS[this.tier - 1] || "#FFE052";
        context.save();
        context.rotate(-this.angle);
        for (let ring = 0; ring < 2; ring++) {
          const radius = this.bodyRadius * (1.25 + progress * (1.35 + ring * 0.42));
          context.globalAlpha = this.evolveFlash * (ring === 0 ? 0.78 : 0.46);
          context.strokeStyle = ring === 0 ? tierColor : "#BFF7FF";
          context.lineWidth = Math.max(2, this.bodyRadius * (ring === 0 ? 0.07 : 0.045));
          context.beginPath();
          context.arc(0, 0, radius, progress * 1.6 + ring, progress * 1.6 + ring + Math.PI * (1.45 + ring * 0.18));
          context.stroke();
        }
        context.globalAlpha = this.evolveFlash * 0.72;
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * TWO_PI + progress * 3.2;
          const radius = this.bodyRadius * (1.42 + progress * 1.18);
          context.fillStyle = i % 2 === 0 ? tierColor : "#FFF2A8";
          context.beginPath();
          context.arc(Math.cos(a) * radius, Math.sin(a) * radius, Math.max(2.2, this.bodyRadius * 0.055), 0, TWO_PI);
          context.fill();
        }
        context.restore();
      }
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        const visualScale = window.gameConfig.visual.spriteScale || 1;
        const tierProgress = (this.tier - 1) / 19;
        const aspect = sprite.naturalWidth / sprite.naturalHeight;
        const areaFix = Math.pow(SPRITE_REF_ASPECT / aspect, SPRITE_AREA_EXP);
        const targetHeight = this.bodyRadius * lerp(4.55, 4.42, tierProgress) * visualScale * areaFix;
        const drawWidth = targetHeight * aspect;
        const drawHeight = targetHeight;
        context.save();
        if (perfQuality > 0 && this.isPlayer && (this.boosting || this.boostFlash > 0)) {
          const flashAlpha = this.boostFlash * 0.65;
          const steadyAlpha = this.boosting ? 0.36 : 0;
          const totalAlpha = Math.min(0.9, flashAlpha + steadyAlpha);
          context.shadowColor = `rgba(220, 235, 255, ${totalAlpha})`;
          context.shadowBlur = Math.min(14, this.bodyRadius * 0.42);
        } else if (perfQuality > 0 && this.isPlayer && kingOfSeasUnlocked) {
          const goldPulse = 0.35 + Math.sin(this.visualPhase * 1.8) * 0.12;
          context.shadowColor = `rgba(255, 210, 60, ${goldPulse})`;
          context.shadowBlur = Math.min(16, this.bodyRadius * 0.45);
        } else if (perfQuality > 0 && this.isPlayer && this.tier >= 15) {
          context.shadowColor = color;
          context.shadowBlur = Math.min(8, this.bodyRadius * 0.22);
        } else if (perfQuality > 0 && this.isPlayer) {
          context.shadowColor = "rgba(140, 220, 240, 0.28)";
          context.shadowBlur = Math.min(6, this.bodyRadius * 0.18);
        }
        if (perfQuality > 0 && !this.isPlayer && this._aiChasingPlayer && this.boosting) {
          context.shadowColor = "rgba(255, 60, 80, 0.45)";
          context.shadowBlur = Math.min(10, this.bodyRadius * 0.3);
        }
        const swimScale = 1 - Math.min(0.45, (this.tier - 1) * 0.018);
        const swimSway = Math.sin(this.swimPhase) * 0.075 * this.swimAmp * swimScale;
        const swimSquash = 1 + Math.cos(this.swimPhase * 2) * 0.03 * this.swimAmp * swimScale;
        const pivot = this.bodyRadius * 0.3;
        context.translate(pivot, 0);
        context.rotate(swimSway);
        context.translate(-pivot, 0);
        context.rotate(window.gameConfig.visual.spriteRotation || 0);
        context.scale(swimSquash, 1);
        context.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        if (this.isPlayer && (this.boosting || this.boostFlash > 0.15)) {
          const bloomAlpha = (this.boosting ? 0.13 : 0) + this.boostFlash * 0.2;
          context.globalAlpha = Math.min(0.28, bloomAlpha);
          context.shadowBlur = 0;
          context.globalCompositeOperation = "lighter";
          context.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          context.globalCompositeOperation = "source-over";
          context.globalAlpha = alpha;
        }
        context.restore();
      } else {
        const hornBaseX = this.bodyRadius * 0.38;
        const hornTipX = this.bodyRadius * 0.95 + this.hornLength;
        const hornHalf = this.hornWidth * 0.5;
        context.fillStyle = shadeColor(color, -32);
        context.strokeStyle = shadeColor(color, -82);
        context.lineWidth = Math.max(1.5, this.bodyRadius * 0.06);
        context.beginPath();
        context.moveTo(hornBaseX, -hornHalf * 0.55);
        context.quadraticCurveTo(hornTipX * 0.72, -hornHalf * 0.22, hornTipX, 0);
        context.quadraticCurveTo(hornTipX * 0.72, hornHalf * 0.22, hornBaseX, hornHalf * 0.55);
        context.closePath();
        context.fill();
        context.stroke();
        const sideHornLen = this.hornLength * 0.52;
        const sideBaseX = this.bodyRadius * 0.32;
        const sideTipX = sideBaseX + sideHornLen;
        const sideSpread = this.hornWidth * 0.72;
        const sideWidth = this.hornWidth * 0.28;
        context.beginPath();
        context.moveTo(sideBaseX, -sideSpread + sideWidth);
        context.quadraticCurveTo(sideTipX * 0.7, -sideSpread * 0.82, sideTipX, -sideSpread * 0.55);
        context.quadraticCurveTo(sideTipX * 0.7, -sideSpread * 0.62 - sideWidth, sideBaseX, -sideSpread - sideWidth);
        context.closePath();
        context.fill();
        context.stroke();
        context.beginPath();
        context.moveTo(sideBaseX, sideSpread - sideWidth);
        context.quadraticCurveTo(sideTipX * 0.7, sideSpread * 0.82, sideTipX, sideSpread * 0.55);
        context.quadraticCurveTo(sideTipX * 0.7, sideSpread * 0.62 + sideWidth, sideBaseX, sideSpread + sideWidth);
        context.closePath();
        context.fill();
        context.stroke();
        const shellGradient = context.createRadialGradient(
          -this.bodyRadius * 0.36,
          -this.bodyRadius * 0.34,
          0,
          -this.bodyRadius * 0.1,
          0,
          this.bodyRadius * 1.35
        );
        shellGradient.addColorStop(0, shadeColor(color, 65));
        shellGradient.addColorStop(0.5, color);
        shellGradient.addColorStop(1, shadeColor(color, -62));
        context.fillStyle = shellGradient;
        context.beginPath();
        context.ellipse(-this.bodyRadius * 0.18, 0, this.bodyRadius * 1.02, this.bodyRadius * 0.76, 0, 0, TWO_PI);
        context.fill();
        context.stroke();
        context.fillStyle = shadeColor(color, -18);
        context.beginPath();
        context.ellipse(this.bodyRadius * 0.55, 0, this.bodyRadius * 0.56, this.bodyRadius * 0.54, 0, 0, TWO_PI);
        context.fill();
        context.stroke();
      }
      if ((this.stunTimer > 0 || this.stunFadeTimer > 0) && !this.dying) {
        context.save();
        const stunAlpha = this.stunTimer > 0 ? 1 : clamp(this.stunFadeTimer / 0.15, 0, 1);
        context.globalAlpha = stunAlpha * alpha;
        const starCount = 5;
        const orbitRadius = this.bodyRadius * 1.4;
        for (let i = 0; i < starCount; i++) {
          const a = i / starCount * TWO_PI + this.visualPhase * 5;
          const sx = Math.cos(a) * orbitRadius;
          const sy = Math.sin(a) * orbitRadius * 0.5 - this.bodyRadius * 0.6;
          context.fillStyle = i % 2 === 0 ? "#FFE052" : "#FFFFFF";
          context.shadowColor = "#FFB800";
          context.shadowBlur = 4;
          context.font = `bold ${14 + Math.sin(this.visualPhase * 8 + i) * 3}px sans-serif`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("\u2726", sx, sy);
        }
        context.restore();
      }
      context.restore();
    }
  };
  function getSafeSpawnLocation(extraDistance = 0) {
    const arena = window.gameConfig.arena;
    const minDistance = SAFE_SPAWN_DISTANCE + extraDistance;
    const narwhals = getAllNarwhals();
    for (let attempt = 0; attempt < 140; attempt++) {
      const x = Math.random() * arena.width;
      const y = Math.random() * arena.height;
      let safe = true;
      for (const narwhal of narwhals) {
        if (distanceSq(x, y, narwhal.x, narwhal.y) < minDistance * minDistance) {
          safe = false;
          break;
        }
      }
      if (safe && orcaPredator) {
        if (distanceSq(x, y, orcaPredator.x, orcaPredator.y) < (minDistance + 400) * (minDistance + 400)) {
          safe = false;
        }
      }
      if (safe)
        return { x, y };
    }
    return { x: arena.width * 0.5, y: arena.height * 0.5 };
  }
  var AI_RESPAWN_MIN_PLAYER_DIST = 900;
  var AI_RESPAWN_MIN_SHARK_DIST = 1e3;
  var AI_RESPAWN_MIN_BOT_DIST = 260;
  var AI_RESPAWN_SAMPLES = 80;
  var AI_RESPAWN_DELAY_MIN = 0.8;
  var AI_RESPAWN_DELAY_MAX = 1.2;
  var AI_RESPAWN_PROTECTION = 0.4;
  function getAIRespawnLocation(excludeBot = null) {
    const arena = window.gameConfig.arena;
    const refAlive = playerNarwhal && !playerNarwhal.dying && !isPlayerDead;
    const refX = refAlive ? playerNarwhal.x : camera.x;
    const refY = refAlive ? playerNarwhal.y : camera.y;
    let best = null;
    let bestScore = -Infinity;
    for (let attempt = 0; attempt < AI_RESPAWN_SAMPLES; attempt++) {
      const x = Math.random() * arena.width;
      const y = Math.random() * arena.height;
      const playerDist = Math.sqrt(distanceSq(x, y, refX, refY));
      const sharkDist = orcaPredator ? Math.sqrt(distanceSq(x, y, orcaPredator.x, orcaPredator.y)) : Infinity;
      let botDist = Infinity;
      for (let i = 0, len = aiNarwhals.length; i < len; i++) {
        const bot = aiNarwhals[i];
        if (!bot || bot === excludeBot || bot.dying)
          continue;
        const d = Math.sqrt(distanceSq(x, y, bot.x, bot.y));
        if (d < botDist)
          botDist = d;
      }
      if (playerDist >= AI_RESPAWN_MIN_PLAYER_DIST && sharkDist >= AI_RESPAWN_MIN_SHARK_DIST && botDist >= AI_RESPAWN_MIN_BOT_DIST) {
        return { x, y };
      }
      const score = Math.min(playerDist, AI_RESPAWN_MIN_PLAYER_DIST * 2) * 1e4 + Math.min(sharkDist, AI_RESPAWN_MIN_SHARK_DIST * 2) * 100 + Math.min(botDist, AI_RESPAWN_MIN_BOT_DIST * 2);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    return best || { x: Math.random() * arena.width, y: Math.random() * arena.height };
  }
  function spawnOrb(kind = "common") {
    const config = window.gameConfig;
    let x = Math.random() * config.arena.width;
    let y = Math.random() * config.arena.height;
    let value = 1;
    let size = config.orbs.size;
    if (kind === "coral") {
      value = config.collectibles.coralValue;
      size *= 1.15;
    } else if (kind === "energy") {
      size *= 1.08;
    } else if (kind === "starfish") {
      size *= 1.85;
    }
    const orb = new Orb(x, y, kind, value, size);
    orbs.push(orb);
  }
  function createPlayer(startMass = null) {
    const config = window.gameConfig;
    const spawn = getSafeSpawnLocation(80);
    const mass = startMass == null ? config.narwhal.initialMass : Math.max(config.narwhal.initialMass, Math.floor(startMass));
    return new Narwhal(
      spawn.x,
      spawn.y,
      config.narwhal.playerColor,
      true,
      mass,
      "YOU"
    );
  }
  function createAI(index, respawning = false, previousMass = null) {
    const config = window.gameConfig;
    const spawn = respawning ? getAIRespawnLocation(aiNarwhals[index] || null) : getSafeSpawnLocation(0);
    const color = config.ai.colors[index % config.ai.colors.length];
    let mass;
    if (!respawning) {
      const count = Math.max(1, config.ai.count || 16);
      const f = index / count;
      if (f < 0.15)
        mass = Math.round(randRange(1300, 2200));
      else if (f < 0.36)
        mass = Math.round(randRange(650, 1300));
      else if (f < 0.65)
        mass = Math.round(randRange(180, 650));
      else
        mass = Math.round(randRange(5, 180));
    } else {
      const retained = previousMass == null ? 5 : Math.round(previousMass * randRange(0.45, 0.55));
      mass = clamp(retained, 5, 1500);
      if (playerNarwhal && !playerNarwhal.dying && !isPlayerDead) {
        const pPhys = Math.min(playerNarwhal.mass, MAX_TIER_MASS);
        if (pPhys >= TIER_THRESHOLDS[13]) {
          const rivalMin = Math.round(pPhys * 0.52);
          const rivalMax = Math.round(pPhys * 0.78);
          let competitiveCount = 0;
          for (let i = 0; i < aiNarwhals.length; i++) {
            const b = aiNarwhals[i];
            if (b && !b.dying && b.mass >= rivalMin)
              competitiveCount++;
          }
          if (competitiveCount < 2) {
            const scaledMass = Math.min(2600, Math.round(randRange(rivalMin, rivalMax)));
            mass = Math.max(mass, scaledMass);
          }
        }
      }
    }
    const name = activeAINames[index] || AI_NAME_POOL[index % AI_NAME_POOL.length];
    const narwhal = new Narwhal(spawn.x, spawn.y, color, false, mass, name);
    narwhal.spawnProtection = respawning ? AI_RESPAWN_PROTECTION : randRange(0.2, 0.35);
    return narwhal;
  }
  function seededUnit(index, salt = 0) {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }
  var DECOR_TYPE_CONFIG = {
    // === ORGANIC / PLANTS (high frequency, subtle, varied depth) ===
    decor_seagrass: { weight: 10, baseSize: 100, depthRange: [0.05, 0.65], alphaRange: [0.06, 0.16], tintRange: [0.22, 0.04] },
    decor_shells: { weight: 8, baseSize: 90, depthRange: [0, 0.5], alphaRange: [0.05, 0.13], tintRange: [0.25, 0.06] },
    decor_kelp_patch: { weight: 9, baseSize: 135, depthRange: [0.1, 0.72], alphaRange: [0.07, 0.18], tintRange: [0.18, 0.02] },
    decor_anemone: { weight: 8, baseSize: 138, depthRange: [0.2, 0.78], alphaRange: [0.09, 0.21], tintRange: [0.14, 0.02] },
    // === ROCKS (medium-high frequency, slightly more visible) ===
    decor_coral_rocks: { weight: 7, baseSize: 130, depthRange: [0.2, 0.8], alphaRange: [0.09, 0.22], tintRange: [0.14, 0] },
    decor_ocean_rocks: { weight: 7, baseSize: 125, depthRange: [0.15, 0.78], alphaRange: [0.08, 0.2], tintRange: [0.16, 0] },
    // === RARE STRUCTURES (low frequency, prominent, near surface, hard-capped) ===
    decor_ship_barrel: { weight: 3, baseSize: 130, depthRange: [0.45, 0.88], alphaRange: [0.13, 0.25], tintRange: [0.08, 0], maxCount: 4 },
    decor_sunken_wreck: { weight: 1.5, baseSize: 180, depthRange: [0.55, 0.95], alphaRange: [0.16, 0.28], tintRange: [0.06, 0], maxCount: 5 },
    decor_whale_skeleton: { weight: 1, baseSize: 190, depthRange: [0.6, 0.95], alphaRange: [0.15, 0.26], tintRange: [0.06, 0], maxCount: 2 },
    decor_bioluminescent_coral: { weight: 2.5, baseSize: 155, depthRange: [0.5, 0.92], alphaRange: [0.18, 0.32], tintRange: [0.03, 0], maxCount: 4 }
  };
  var DECOR_DEFAULT_CONFIG = { weight: 5, baseSize: 120, depthRange: [0.1, 0.8], alphaRange: [0.07, 0.2], tintRange: [0.2, 0] };
  function buildDecorPlacements() {
    decorPlacements = [];
    const ids = Object.keys(decorImages);
    if (!ids.length)
      return;
    const arena = window.gameConfig.arena;
    const themeDecorCount = activeAtlasTheme && activeAtlasTheme.decorCount;
    const totalTarget = clamp(Math.round(themeDecorCount != null ? themeDecorCount : window.gameConfig.visual.decorCount || 62), 0, 120);
    let totalWeight = 0;
    const pool = [];
    for (const id of ids) {
      const cfg = DECOR_TYPE_CONFIG[id] || DECOR_DEFAULT_CONFIG;
      totalWeight += cfg.weight;
      pool.push({ id, cfg, weight: cfg.weight });
    }
    if (totalWeight <= 0)
      return;
    let placed = 0;
    const assignments = [];
    const placedPerType = {};
    for (const entry of pool) {
      const themeMax = activeAtlasTheme && activeAtlasTheme.decorMaxCounts ? activeAtlasTheme.decorMaxCounts[entry.id] : void 0;
      const maxAllowed = Number.isFinite(themeMax) ? themeMax : entry.cfg.maxCount || Infinity;
      const count = Math.min(maxAllowed, Math.round(entry.weight / totalWeight * totalTarget));
      placedPerType[entry.id] = 0;
      for (let i = 0; i < count && placed < totalTarget; i++) {
        assignments.push(entry);
        placedPerType[entry.id]++;
        placed++;
      }
    }
    pool.sort((a, b) => b.weight - a.weight);
    let fillIdx = 0;
    let fillAttempts = 0;
    while (placed < totalTarget && fillAttempts < pool.length * 2) {
      const candidate = pool[fillIdx % pool.length];
      const themeMax = activeAtlasTheme && activeAtlasTheme.decorMaxCounts ? activeAtlasTheme.decorMaxCounts[candidate.id] : void 0;
      const maxAllowed = Number.isFinite(themeMax) ? themeMax : candidate.cfg.maxCount || Infinity;
      if ((placedPerType[candidate.id] || 0) < maxAllowed) {
        assignments.push(candidate);
        placedPerType[candidate.id] = (placedPerType[candidate.id] || 0) + 1;
        placed++;
        fillAttempts = 0;
      } else {
        fillAttempts++;
      }
      fillIdx++;
    }
    for (let i = 0; i < assignments.length; i++) {
      const { id, cfg } = assignments[i];
      const rawDepth = seededUnit(i, 11);
      const depth = lerp(cfg.depthRange[0], cfg.depthRange[1], rawDepth);
      const depthT = (depth - cfg.depthRange[0]) / Math.max(0.01, cfg.depthRange[1] - cfg.depthRange[0]);
      const alpha = lerp(cfg.alphaRange[0], cfg.alphaRange[1], depthT);
      const depthTint = lerp(cfg.tintRange[0], cfg.tintRange[1], depthT);
      const depthScale = lerp(0.72, 1.15, depthT);
      const size = cfg.baseSize * (0.72 + seededUnit(i, 7) * 0.58) * depthScale;
      const item = {
        id,
        x: seededUnit(i, 3) * arena.width,
        y: seededUnit(i, 4) * arena.height,
        size,
        rotation: seededUnit(i, 8) * TWO_PI,
        alpha,
        flip: seededUnit(i, 10) > 0.5 ? -1 : 1,
        depth,
        depthTint
      };
      item._tintBucket = Math.round(depthTint * 20);
      decorPlacements.push(item);
    }
    decorPlacements.sort((a, b) => a.depth - b.depth);
    _decorSpriteCache = {};
    const DECOR_MAX_PX = 256;
    for (let d = 0; d < decorPlacements.length; d++) {
      const item = decorPlacements[d];
      const cacheKey = item.id + "|" + item._tintBucket;
      if (_decorSpriteCache[cacheKey])
        continue;
      const image = decorImages[item.id];
      if (!image || !image.complete || image.naturalWidth <= 0)
        continue;
      const srcW = image.naturalWidth;
      const srcH = image.naturalHeight;
      const scale = Math.min(1, DECOR_MAX_PX / Math.max(srcW, srcH));
      const cw = Math.max(1, Math.round(srcW * scale));
      const ch = Math.max(1, Math.round(srcH * scale));
      const off = document.createElement("canvas");
      off.width = cw;
      off.height = ch;
      const oc = off.getContext("2d");
      oc.drawImage(image, 0, 0, cw, ch);
      const tintAlpha = item._tintBucket / 20;
      if (tintAlpha > 0.01) {
        oc.globalCompositeOperation = "source-atop";
        oc.globalAlpha = tintAlpha;
        oc.fillStyle = "#0a3468";
        oc.fillRect(0, 0, cw, ch);
        oc.globalCompositeOperation = "source-over";
        oc.globalAlpha = 1;
      }
      _decorSpriteCache[cacheKey] = off;
    }
  }
  function getDecoSchoolCount() {
    if (perfQuality >= 2)
      return DECO_SCHOOL_COUNT_HIGH;
    if (perfQuality >= 1)
      return DECO_SCHOOL_COUNT_MED;
    return DECO_SCHOOL_COUNT_LOW;
  }
  function _getDecoFishCount(schoolCount) {
    const sizes = window._decoSchoolSizes;
    if (!sizes)
      return 0;
    let total = 0;
    const n = Math.min(schoolCount, sizes.length);
    for (let i = 0; i < n; i++)
      total += sizes[i];
    return Math.min(total, decoFishList.length);
  }
  function initDecoFish() {
    decoFishAnchors = [];
    decoFishList = [];
    decoFishActiveCount = getDecoSchoolCount();
    for (let i = 0; i < DECO_SCHOOL_COUNT_HIGH; i++) {
      const schoolAngle = Math.random() * TWO_PI;
      decoFishAnchors.push({
        x: Math.random() * ARENA_W,
        y: Math.random() * ARENA_H,
        angle: schoolAngle,
        changeTimer: randRange(4, 8)
      });
    }
    const themeFishVariants = activeAtlasTheme && activeAtlasTheme.fishVariants || [0];
    const _schoolSizes = [];
    for (let s = 0; s < DECO_SCHOOL_COUNT_HIGH; s++) {
      _schoolSizes.push(DECO_FISH_PER_SCHOOL_MIN + Math.floor(Math.random() * (DECO_FISH_PER_SCHOOL_MAX - DECO_FISH_PER_SCHOOL_MIN + 1)));
    }
    window._decoSchoolSizes = _schoolSizes;
    for (let s = 0; s < DECO_SCHOOL_COUNT_HIGH; s++) {
      const anchor = decoFishAnchors[s];
      const schoolSize = _schoolSizes[s];
      const schoolHeading = anchor.angle;
      const schoolSpeed = randRange(BOID_MIN_SPEED, BOID_MAX_SPEED * 0.6);
      for (let f = 0; f < schoolSize; f++) {
        let variant = themeFishVariants[0];
        if (themeFishVariants.length > 1 && Math.random() > 0.8) {
          variant = themeFishVariants[1 + Math.floor(Math.random() * (themeFishVariants.length - 1))];
        }
        const along = randRange(-DECO_FISH_LEASH * 0.7, DECO_FISH_LEASH * 0.7);
        const perp = randRange(-DECO_FISH_LEASH * 0.35, DECO_FISH_LEASH * 0.35);
        const cx = Math.cos(schoolHeading);
        const cy = Math.sin(schoolHeading);
        const spawnX = anchor.x + cx * along - cy * perp;
        const spawnY = anchor.y + cy * along + cx * perp;
        const fishAngle = schoolHeading + randRange(-0.35, 0.35);
        const fishSpeed = schoolSpeed * randRange(0.7, 1.3);
        decoFishList.push({
          x: wrapCoordinate(spawnX, ARENA_W),
          y: wrapCoordinate(spawnY, ARENA_H),
          vx: Math.cos(fishAngle) * fishSpeed,
          vy: Math.sin(fishAngle) * fishSpeed,
          schoolIndex: s,
          variant,
          sizeScale: randRange(0.95, 1.4),
          phase: Math.random() * TWO_PI,
          rotation: fishAngle,
          flinchTimer: 0
        });
      }
    }
  }
  function updateDecoFish(dt) {
    decoFishActiveCount = getDecoSchoolCount();
    const maxFish = _getDecoFishCount(decoFishActiveCount);
    const arenaW = ARENA_W;
    const arenaH = ARENA_H;
    const flinchR2 = DECO_FISH_FLINCH_RADIUS * DECO_FISH_FLINCH_RADIUS;
    const sepDist2 = BOID_SEPARATION_DIST * BOID_SEPARATION_DIST;
    const neighborR2 = BOID_NEIGHBOR_RADIUS * BOID_NEIGHBOR_RADIUS;
    const leash2 = DECO_FISH_LEASH * DECO_FISH_LEASH;
    for (let i = 0; i < decoFishActiveCount; i++) {
      const a = decoFishAnchors[i];
      a.changeTimer -= dt;
      if (a.changeTimer <= 0) {
        a.angle += randRange(-1.2, 1.2);
        a.changeTimer = randRange(4, 8);
      }
      a.x = wrapCoordinate(a.x + Math.cos(a.angle) * DECO_FISH_DRIFT * dt, arenaW);
      a.y = wrapCoordinate(a.y + Math.sin(a.angle) * DECO_FISH_DRIFT * dt, arenaH);
    }
    const schoolSizes = window._decoSchoolSizes;
    if (!schoolSizes)
      return;
    let _schoolStarts = window._decoSchoolStarts;
    if (!_schoolStarts || _schoolStarts.length !== schoolSizes.length) {
      _schoolStarts = new Array(schoolSizes.length);
      let offset = 0;
      for (let s = 0; s < schoolSizes.length; s++) {
        _schoolStarts[s] = offset;
        offset += schoolSizes[s];
      }
      window._decoSchoolStarts = _schoolStarts;
    }
    for (let i = 0; i < maxFish; i++) {
      const fish = decoFishList[i];
      fish.phase += dt * 2.35;
      if (fish.flinchTimer > 0) {
        fish.flinchTimer -= dt;
        fish.x = wrapCoordinate(fish.x + fish.vx * dt, arenaW);
        fish.y = wrapCoordinate(fish.y + fish.vy * dt, arenaH);
        const fDrag = Math.max(0, 1 - 3 * dt);
        fish.vx *= fDrag;
        fish.vy *= fDrag;
        if (fish.vx * fish.vx + fish.vy * fish.vy > 1) {
          const target = Math.atan2(fish.vy, fish.vx);
          fish.rotation += shortestAngleDiff(target, fish.rotation) * Math.min(1, dt * 12);
        }
        continue;
      }
      let flinched = false;
      if (playerNarwhal && !playerNarwhal.dying) {
        let dx = fish.x - playerNarwhal.x;
        if (dx > arenaW * 0.5)
          dx -= arenaW;
        else if (dx < -arenaW * 0.5)
          dx += arenaW;
        if (dx <= DECO_FISH_FLINCH_RADIUS && dx >= -DECO_FISH_FLINCH_RADIUS) {
          let dy = fish.y - playerNarwhal.y;
          if (dy > arenaH * 0.5)
            dy -= arenaH;
          else if (dy < -arenaH * 0.5)
            dy += arenaH;
          if (dy <= DECO_FISH_FLINCH_RADIUS && dy >= -DECO_FISH_FLINCH_RADIUS) {
            const d2 = dx * dx + dy * dy;
            if (d2 < flinchR2 && d2 > 1) {
              const awayDist = Math.sqrt(d2);
              fish.vx = dx / awayDist * DECO_FISH_FLINCH_SPEED;
              fish.vy = dy / awayDist * DECO_FISH_FLINCH_SPEED;
              fish.flinchTimer = DECO_FISH_FLINCH_DURATION;
              fish.rotation = Math.atan2(fish.vy, fish.vx);
              flinched = true;
            }
          }
        }
      }
      if (!flinched) {
        for (let n = 0, nLen = aiNarwhals.length; n < nLen; n++) {
          const narwhal = aiNarwhals[n];
          if (!narwhal || narwhal.dying)
            continue;
          let dx = fish.x - narwhal.x;
          if (dx > arenaW * 0.5)
            dx -= arenaW;
          else if (dx < -arenaW * 0.5)
            dx += arenaW;
          if (dx > DECO_FISH_FLINCH_RADIUS || dx < -DECO_FISH_FLINCH_RADIUS)
            continue;
          let dy = fish.y - narwhal.y;
          if (dy > arenaH * 0.5)
            dy -= arenaH;
          else if (dy < -arenaH * 0.5)
            dy += arenaH;
          if (dy > DECO_FISH_FLINCH_RADIUS || dy < -DECO_FISH_FLINCH_RADIUS)
            continue;
          const d2 = dx * dx + dy * dy;
          if (d2 < flinchR2 && d2 > 1) {
            const awayDist = Math.sqrt(d2);
            fish.vx = dx / awayDist * DECO_FISH_FLINCH_SPEED;
            fish.vy = dy / awayDist * DECO_FISH_FLINCH_SPEED;
            fish.flinchTimer = DECO_FISH_FLINCH_DURATION;
            fish.rotation = Math.atan2(fish.vy, fish.vx);
            flinched = true;
            break;
          }
        }
      }
      if (flinched)
        continue;
      const schoolIdx = fish.schoolIndex;
      if (schoolIdx >= decoFishActiveCount)
        continue;
      const anchor = decoFishAnchors[schoolIdx];
      const schoolStart = _schoolStarts[schoolIdx];
      const schoolSize = schoolSizes[schoolIdx];
      const schoolEnd = Math.min(schoolStart + schoolSize, maxFish);
      const isJellyfish = fish.variant === 2;
      const isAnglerfish = fish.variant === 3;
      const isLoose = isJellyfish || fish.variant === 1 || isAnglerfish;
      const flockMult = isJellyfish ? 0.12 : isAnglerfish ? 0.08 : isLoose ? 0.3 : 1;
      const looseLeash = isAnglerfish ? DECO_FISH_LEASH * 2.8 : isLoose ? DECO_FISH_LEASH * 1.8 : DECO_FISH_LEASH;
      const looseLeash2 = looseLeash * looseLeash;
      let sepX = 0, sepY = 0, sepCount = 0;
      let alignVx = 0, alignVy = 0, alignCount = 0;
      let cohX = 0, cohY = 0, cohCount = 0;
      for (let j = schoolStart; j < schoolEnd; j++) {
        if (j === i)
          continue;
        const other = decoFishList[j];
        if (other.flinchTimer > 0)
          continue;
        const dx = wrappedDelta(other.x, fish.x, arenaW);
        const dy = wrappedDelta(other.y, fish.y, arenaH);
        const d2 = dx * dx + dy * dy;
        if (d2 < 1)
          continue;
        if (d2 < sepDist2) {
          const dist = Math.sqrt(d2);
          const weight = 1 - dist / BOID_SEPARATION_DIST;
          sepX -= dx / dist * weight;
          sepY -= dy / dist * weight;
          sepCount++;
        }
        if (d2 < neighborR2) {
          alignVx += other.vx;
          alignVy += other.vy;
          alignCount++;
          cohX += dx;
          cohY += dy;
          cohCount++;
        }
      }
      let steerX = 0, steerY = 0;
      if (sepCount > 0) {
        steerX += sepX / sepCount * BOID_SEPARATION_WEIGHT * flockMult;
        steerY += sepY / sepCount * BOID_SEPARATION_WEIGHT * flockMult;
      }
      if (alignCount > 0) {
        const avgVx = alignVx / alignCount;
        const avgVy = alignVy / alignCount;
        steerX += (avgVx - fish.vx) * BOID_ALIGNMENT_WEIGHT * flockMult;
        steerY += (avgVy - fish.vy) * BOID_ALIGNMENT_WEIGHT * flockMult;
      }
      if (cohCount > 0) {
        const centerDx = cohX / cohCount;
        const centerDy = cohY / cohCount;
        const centerDist = Math.hypot(centerDx, centerDy);
        if (centerDist > 3) {
          steerX += centerDx / centerDist * BOID_COHESION_WEIGHT * flockMult;
          steerY += centerDy / centerDist * BOID_COHESION_WEIGHT * flockMult;
        }
      }
      const anchorDx = wrappedDelta(anchor.x, fish.x, arenaW);
      const anchorDy = wrappedDelta(anchor.y, fish.y, arenaH);
      const anchorDist2 = anchorDx * anchorDx + anchorDy * anchorDy;
      const anchorDist = Math.sqrt(anchorDist2);
      if (anchorDist2 > looseLeash2) {
        const urgency = clamp((anchorDist - looseLeash) / (looseLeash * 0.5), 0, 1);
        const pullStrength = BOID_MAX_FORCE * (0.5 + urgency * 0.5);
        steerX = anchorDx / anchorDist * pullStrength;
        steerY = anchorDy / anchorDist * pullStrength;
      } else if (anchorDist > 2) {
        const pull = BOID_ANCHOR_WEIGHT * (anchorDist / looseLeash);
        steerX += anchorDx / anchorDist * pull * BOID_MAX_FORCE;
        steerY += anchorDy / anchorDist * pull * BOID_MAX_FORCE;
      }
      const forceMag = Math.hypot(steerX, steerY);
      if (forceMag > BOID_MAX_FORCE) {
        const scale = BOID_MAX_FORCE / forceMag;
        steerX *= scale;
        steerY *= scale;
      }
      fish.vx += steerX * dt;
      fish.vy += steerY * dt;
      const maxSpd = isJellyfish ? BOID_MAX_SPEED * 0.28 : isAnglerfish ? BOID_MAX_SPEED * 0.38 : isLoose ? BOID_MAX_SPEED * 0.55 : BOID_MAX_SPEED;
      const minSpd = isJellyfish ? BOID_MIN_SPEED * 0.3 : isAnglerfish ? BOID_MIN_SPEED * 0.35 : isLoose ? BOID_MIN_SPEED * 0.5 : BOID_MIN_SPEED;
      let speed = Math.hypot(fish.vx, fish.vy);
      if (speed > maxSpd) {
        fish.vx = fish.vx / speed * maxSpd;
        fish.vy = fish.vy / speed * maxSpd;
        speed = maxSpd;
      } else if (speed < minSpd && speed > 0.01) {
        fish.vx = fish.vx / speed * minSpd;
        fish.vy = fish.vy / speed * minSpd;
        speed = minSpd;
      } else if (speed <= 0.01) {
        const nudgeAngle = anchor.angle + randRange(-0.5, 0.5);
        fish.vx = Math.cos(nudgeAngle) * minSpd;
        fish.vy = Math.sin(nudgeAngle) * minSpd;
        speed = minSpd;
      }
      fish.x = wrapCoordinate(fish.x + fish.vx * dt, arenaW);
      fish.y = wrapCoordinate(fish.y + fish.vy * dt, arenaH);
      if (speed > 1 && !isJellyfish) {
        const targetRot = Math.atan2(fish.vy, fish.vx);
        fish.rotation += shortestAngleDiff(targetRot, fish.rotation) * Math.min(1, dt * BOID_TURN_RATE);
      }
    }
  }
  function buildDecoFishTintedSprites() {
    decoFishTintedSprites = {};
    const waterColor = window.gameConfig.visual.backgroundColor || "#12557F";
    const sources = {
      0: collectibleSprites.collectible_plankton_a,
      1: collectibleSprites.decor_sea_turtle,
      2: collectibleSprites.collectible_plankton_c,
      3: collectibleSprites.decor_anglerfish,
      4: collectibleSprites.decor_clownfish
    };
    const tintAlphaMap = { 0: 0.45, 1: 0.45, 2: 0.45, 3: 0.12, 4: 0.45 };
    for (const key in sources) {
      const sprite = sources[key];
      if (!sprite || !sprite.complete || sprite.naturalWidth <= 0)
        continue;
      const w = sprite.naturalWidth;
      const h = sprite.naturalHeight;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const oc = off.getContext("2d");
      oc.drawImage(sprite, 0, 0, w, h);
      oc.globalCompositeOperation = "source-atop";
      oc.globalAlpha = tintAlphaMap[key] !== void 0 ? tintAlphaMap[key] : 0.45;
      oc.fillStyle = waterColor;
      oc.fillRect(0, 0, w, h);
      decoFishTintedSprites[key] = off;
    }
  }
  function drawDecoFish() {
    const maxFish = _getDecoFishCount(decoFishActiveCount);
    if (maxFish <= 0)
      return;
    if (!decoFishTintedSprites[0] && !decoFishTintedSprites[2]) {
      buildDecoFishTintedSprites();
      if (!decoFishTintedSprites[0] && !decoFishTintedSprites[2])
        return;
    }
    const fishDrawSize = window.gameConfig.orbs.size * 2.15;
    ctx.save();
    for (let i = 0; i < maxFish; i++) {
      const fish = decoFishList[i];
      const rx = camera.x + wrappedDelta(fish.x, _camModX, ARENA_W);
      const ry = camera.y + wrappedDelta(fish.y, _camModY, ARENA_H);
      if (rx < viewBounds.minX - 60 || rx > viewBounds.maxX + 60 || ry < viewBounds.minY - 60 || ry > viewBounds.maxY + 60)
        continue;
      const sprite = decoFishTintedSprites[fish.variant] || decoFishTintedSprites[0] || decoFishTintedSprites[2] || decoFishTintedSprites[1] || decoFishTintedSprites[3];
      if (!sprite)
        continue;
      const variantAlpha = fish.variant === 2 ? DECO_FISH_OPACITY * 0.55 : fish.variant === 1 ? DECO_FISH_OPACITY * 0.7 : fish.variant === 3 ? DECO_FISH_OPACITY * 1.15 : DECO_FISH_OPACITY;
      ctx.globalAlpha = variantAlpha;
      const w = sprite.width;
      const h = sprite.height;
      const aspect = w / h;
      const variantSize = fish.variant === 1 ? fishDrawSize * 2 : fish.variant === 2 ? fishDrawSize * 1.45 : fish.variant === 3 ? fishDrawSize * 1.75 : fish.variant === 4 ? fishDrawSize * 1.15 : fishDrawSize;
      const fishSize = variantSize * (fish.sizeScale || 1);
      const drawW = fishSize;
      const drawH = fishSize / aspect;
      ctx.save();
      ctx.translate(rx, ry);
      if (fish.variant === 2) {
        const bob = Math.sin(fish.phase * 0.7) * 6;
        const pulse = 1 + Math.sin(fish.phase * 1.2) * 0.12;
        ctx.translate(0, bob);
        ctx.scale(pulse * 0.92, 1 / (pulse * 0.92));
      } else if (fish.variant === 3) {
        ctx.rotate(fish.rotation);
        const undulate = Math.sin(fish.phase * 0.55) * 0.06;
        ctx.rotate(undulate);
        const lureBob = Math.sin(fish.phase * 0.8) * 3.5;
        ctx.translate(0, lureBob);
      } else {
        ctx.rotate(fish.rotation);
      }
      ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function getTurtleCount() {
    if (activeAtlasTheme && activeAtlasTheme.id === "open-waters")
      return 0;
    if (activeAtlasTheme && activeAtlasTheme.id === "coral-gardens") {
      if (perfQuality >= 2)
        return 18;
      if (perfQuality >= 1)
        return 12;
      return 7;
    }
    if (perfQuality >= 2)
      return TURTLE_COUNT_HIGH;
    if (perfQuality >= 1)
      return TURTLE_COUNT_MED;
    return TURTLE_COUNT_LOW;
  }
  function initTurtles() {
    turtleList = [];
    const count = TURTLE_COUNT_HIGH * 2;
    for (let i = 0; i < count; i++) {
      const sizeScale = randRange(0.55, 1.45);
      turtleList.push({
        x: Math.random() * ARENA_W,
        y: Math.random() * ARENA_H,
        angle: Math.random() * TWO_PI,
        targetAngle: Math.random() * TWO_PI,
        speed: TURTLE_SPEED * randRange(0.7, 1.3) * (1.15 - sizeScale * 0.25),
        sizeScale,
        changeTimer: randRange(TURTLE_CHANGE_DIR_MIN, TURTLE_CHANGE_DIR_MAX),
        flinchTimer: 0,
        flinchVx: 0,
        flinchVy: 0,
        swimPhase: Math.random() * TWO_PI
      });
    }
  }
  function updateTurtles(dt) {
    const count = Math.min(getTurtleCount(), turtleList.length);
    if (count === 0)
      return;
    const flinchR2 = TURTLE_FLINCH_RADIUS * TURTLE_FLINCH_RADIUS;
    for (let i = 0; i < count; i++) {
      const turtle = turtleList[i];
      turtle.swimPhase += dt * 4.5;
      if (turtle.flinchTimer > 0) {
        turtle.flinchTimer -= dt;
        turtle.x = wrapCoordinate(turtle.x + turtle.flinchVx * dt, ARENA_W);
        turtle.y = wrapCoordinate(turtle.y + turtle.flinchVy * dt, ARENA_H);
        const drag = Math.max(0, 1 - 2.5 * dt);
        turtle.flinchVx *= drag;
        turtle.flinchVy *= drag;
        if (turtle.flinchVx * turtle.flinchVx + turtle.flinchVy * turtle.flinchVy > 1) {
          turtle.angle = Math.atan2(turtle.flinchVy, turtle.flinchVx);
        }
        continue;
      }
      let flinched = false;
      if (playerNarwhal && !playerNarwhal.dying) {
        const d2 = distanceSq(turtle.x, turtle.y, playerNarwhal.x, playerNarwhal.y);
        if (d2 < flinchR2 && d2 > 1) {
          const awayX = wrappedDelta(turtle.x, playerNarwhal.x, ARENA_W);
          const awayY = wrappedDelta(turtle.y, playerNarwhal.y, ARENA_H);
          const dist = Math.hypot(awayX, awayY) || 1;
          turtle.flinchVx = awayX / dist * TURTLE_FLINCH_SPEED;
          turtle.flinchVy = awayY / dist * TURTLE_FLINCH_SPEED;
          turtle.flinchTimer = TURTLE_FLINCH_DURATION;
          flinched = true;
        }
      }
      if (!flinched) {
        for (let n = 0, nLen = aiNarwhals.length; n < nLen; n++) {
          const narwhal = aiNarwhals[n];
          if (!narwhal || narwhal.dying)
            continue;
          const d2 = distanceSq(turtle.x, turtle.y, narwhal.x, narwhal.y);
          if (d2 < flinchR2 && d2 > 1) {
            const awayX = wrappedDelta(turtle.x, narwhal.x, ARENA_W);
            const awayY = wrappedDelta(turtle.y, narwhal.y, ARENA_H);
            const dist = Math.hypot(awayX, awayY) || 1;
            turtle.flinchVx = awayX / dist * TURTLE_FLINCH_SPEED;
            turtle.flinchVy = awayY / dist * TURTLE_FLINCH_SPEED;
            turtle.flinchTimer = TURTLE_FLINCH_DURATION;
            flinched = true;
            break;
          }
        }
      }
      if (flinched)
        continue;
      turtle.changeTimer -= dt;
      if (turtle.changeTimer <= 0) {
        turtle.targetAngle = normalizeAngle(turtle.angle + randRange(-2, 2));
        turtle.changeTimer = randRange(TURTLE_CHANGE_DIR_MIN, TURTLE_CHANGE_DIR_MAX);
      }
      const diff = shortestAngleDiff(turtle.targetAngle, turtle.angle);
      turtle.angle += clamp(diff, -TURTLE_TURN_SPEED * dt, TURTLE_TURN_SPEED * dt);
      turtle.x = wrapCoordinate(turtle.x + Math.cos(turtle.angle) * turtle.speed * dt, ARENA_W);
      turtle.y = wrapCoordinate(turtle.y + Math.sin(turtle.angle) * turtle.speed * dt, ARENA_H);
    }
  }
  function drawTurtles() {
    const sprite = collectibleSprites.decor_sea_turtle;
    if (!sprite || !sprite.complete || sprite.naturalWidth <= 0)
      return;
    const count = Math.min(getTurtleCount(), turtleList.length);
    if (count === 0)
      return;
    const aspect = sprite.naturalWidth / sprite.naturalHeight;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const turtle = turtleList[i];
      const tSize = TURTLE_DRAW_SIZE * (turtle.sizeScale || 1);
      const drawW = tSize;
      const drawH = tSize / aspect;
      const rx = camera.x + wrappedDelta(turtle.x, _camModX, ARENA_W);
      const ry = camera.y + wrappedDelta(turtle.y, _camModY, ARENA_H);
      if (rx < viewBounds.minX - 70 || rx > viewBounds.maxX + 70 || ry < viewBounds.minY - 70 || ry > viewBounds.maxY + 70)
        continue;
      const bob = Math.sin(turtle.swimPhase) * 4.5;
      const tilt = Math.sin(turtle.swimPhase * 0.8) * 0.15;
      const strokePhase = turtle.swimPhase * 1.5;
      const rawStroke = Math.sin(strokePhase);
      const flipperSquash = 1 + (rawStroke > 0 ? rawStroke * 0.1 : rawStroke * 0.05);
      const yawSway = Math.sin(turtle.swimPhase * 0.6) * 0.15;
      ctx.globalAlpha = TURTLE_OPACITY;
      ctx.save();
      ctx.translate(rx, ry + bob);
      ctx.rotate(turtle.angle + tilt + yawSway);
      ctx.rotate(window.gameConfig.visual.spriteRotation || 1.5708);
      ctx.scale(flipperSquash, 1 / flipperSquash);
      ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function drawDecorations() {
    const step = perfQuality === 0 ? 2 : 1;
    for (let d = 0; d < decorPlacements.length; d += step) {
      const item = decorPlacements[d];
      if (!isInView(item.x, item.y, item.size))
        continue;
      const cacheKey = item.id + "|" + item._tintBucket;
      const image = _decorSpriteCache[cacheKey] || decorImages[item.id];
      if (!image || image.tagName !== "CANVAS" && (!image.complete || image.naturalWidth <= 0))
        continue;
      const pos = getRenderPosition(item.x, item.y);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(item.rotation);
      ctx.scale(item.flip, 1);
      ctx.globalAlpha = item.alpha;
      ctx.drawImage(image, -item.size / 2, -item.size / 2, item.size, item.size);
      ctx.restore();
    }
  }
  var FOREGROUND_COUNT = 7;
  var FOREGROUND_DRIFT_SPEED = 10;
  function initForegroundShapes() {
    foregroundShapes = [];
    for (let i = 0; i < FOREGROUND_COUNT; i++) {
      foregroundShapes.push({
        x: Math.random() * ARENA_W,
        y: Math.random() * ARENA_H,
        radius: randRange(120, 260),
        alpha: randRange(0.05, 0.08),
        angle: Math.random() * TWO_PI,
        driftSpeed: FOREGROUND_DRIFT_SPEED * randRange(0.6, 1.4),
        changeTimer: randRange(4, 8)
      });
    }
  }
  function initBubbleFields() {
    bubbleFields = [];
    for (let i = 0; i < BUBBLE_FIELD_COUNT; i++) {
      let x, y, valid = false;
      for (let attempt = 0; attempt < 300; attempt++) {
        x = Math.random() * ARENA_W;
        y = Math.random() * ARENA_H;
        valid = true;
        for (let j = 0; j < bubbleFields.length; j++) {
          if (distanceSq(x, y, bubbleFields[j].x, bubbleFields[j].y) < BUBBLE_FIELD_MIN_DIST * BUBBLE_FIELD_MIN_DIST) {
            valid = false;
            break;
          }
        }
        if (valid)
          break;
      }
      if (!valid) {
        const angle = i / BUBBLE_FIELD_COUNT * TWO_PI;
        x = ARENA_W * 0.5 + Math.cos(angle) * ARENA_W * 0.3;
        y = ARENA_H * 0.5 + Math.sin(angle) * ARENA_H * 0.3;
      }
      const bubbles = [];
      for (let b = 0; b < BUBBLE_FIELD_PARTICLE_COUNT; b++) {
        bubbles.push(createFieldBubble(true));
      }
      bubbleFields.push({ x, y, bubbles });
    }
  }
  function createFieldBubble(randomAge) {
    const angle = Math.random() * TWO_PI;
    const spawnDist = Math.random() * 30;
    const isLarge = Math.random() < 0.3;
    const speed = isLarge ? randRange(35, 55) : randRange(70, 120);
    const radius = isLarge ? randRange(5.5, 10) : randRange(2, 4.5);
    const grow = isLarge ? randRange(1.2, 2.2) : randRange(0.6, 1.4);
    const life = isLarge ? randRange(2, 3.2) : randRange(1.4, 2.6);
    return {
      ox: Math.cos(angle) * spawnDist,
      oy: Math.sin(angle) * spawnDist,
      vx: Math.cos(angle) * speed * randRange(0.2, 0.5),
      vy: -speed + Math.sin(angle) * speed * 0.3,
      // mostly upward with spread
      radius,
      grow,
      life: randomAge ? Math.random() * life : life,
      maxLife: life
    };
  }
  function updateBubbleFields(dt) {
    for (let f = 0; f < bubbleFields.length; f++) {
      const field = bubbleFields[f];
      for (let b = 0; b < field.bubbles.length; b++) {
        const bub = field.bubbles[b];
        bub.life -= dt;
        const dist = Math.hypot(bub.ox, bub.oy);
        if (bub.life <= 0 || dist > BUBBLE_FIELD_RADIUS) {
          field.bubbles[b] = createFieldBubble(false);
          continue;
        }
        bub.ox += bub.vx * dt;
        bub.oy += bub.vy * dt;
        bub.radius += bub.grow * dt;
      }
    }
  }
  function drawBubbleFields() {
    for (let f = 0; f < bubbleFields.length; f++) {
      const field = bubbleFields[f];
      if (!isInView(field.x, field.y, BUBBLE_FIELD_RADIUS + 20))
        continue;
      const fx = camera.x + wrappedDelta(field.x, _camModX, ARENA_W);
      const fy = camera.y + wrappedDelta(field.y, _camModY, ARENA_H);
      if (fx < viewBounds.minX - BUBBLE_FIELD_RADIUS - 20 || fx > viewBounds.maxX + BUBBLE_FIELD_RADIUS + 20 || fy < viewBounds.minY - BUBBLE_FIELD_RADIUS - 20 || fy > viewBounds.maxY + BUBBLE_FIELD_RADIUS + 20)
        continue;
      const ringPulse = 0.1 + Math.sin(fx * 0.01 + fy * 0.01 + performance.now() * 2e-3) * 0.04;
      ctx.save();
      ctx.strokeStyle = `rgba(180, 240, 255, ${ringPulse})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(fx, fy, BUBBLE_FIELD_RADIUS, 0, TWO_PI);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = BUBBLE_FIELD_GLOW_ALPHA;
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, BUBBLE_FIELD_RADIUS);
      grad.addColorStop(0, "rgba(80, 220, 240, 1)");
      grad.addColorStop(0.6, "rgba(60, 200, 230, 0.4)");
      grad.addColorStop(1, "rgba(40, 180, 220, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, BUBBLE_FIELD_RADIUS, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
      for (let b = 0; b < field.bubbles.length; b++) {
        const bub = field.bubbles[b];
        const bx = fx + bub.ox;
        const by = fy + bub.oy;
        if (bx < viewBounds.minX - 10 || bx > viewBounds.maxX + 10 || by < viewBounds.minY - 10 || by > viewBounds.maxY + 10)
          continue;
        const lifeRatio = clamp(bub.life / bub.maxLife, 0, 1);
        const dist = Math.hypot(bub.ox, bub.oy);
        const edgeFade = clamp(1 - dist / BUBBLE_FIELD_RADIUS, 0, 1);
        const alpha = lifeRatio * edgeFade * 0.65;
        const r = bub.radius;
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = "rgba(180, 235, 250, 1)";
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, TWO_PI);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.lineWidth = Math.max(0.7, r * 0.22);
        ctx.beginPath();
        ctx.arc(bx, by, r * 0.85, 0, TWO_PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  function applyBubbleFieldBonus(dt) {
    if (bubbleFields.length === 0)
      return;
    const narwhals = getAllNarwhals();
    const fieldR2 = BUBBLE_FIELD_RADIUS * BUBBLE_FIELD_RADIUS;
    for (let n = 0; n < narwhals.length; n++) {
      const narwhal = narwhals[n];
      let inField = false;
      for (let f = 0; f < bubbleFields.length; f++) {
        if (distanceSq(narwhal.x, narwhal.y, bubbleFields[f].x, bubbleFields[f].y) <= fieldR2) {
          inField = true;
          break;
        }
      }
      if (inField && !narwhal._wasInBubbleField) {
        const instantGrant = narwhal.boostEnergyMax * 0.5;
        narwhal.boostEnergy = Math.min(narwhal.boostEnergyMax, narwhal.boostEnergy + instantGrant);
        narwhal.boostLockout = 0;
        narwhal.boostRegenDelay = 0;
        if (narwhal.isPlayer) {
          updateHUD();
        }
      }
      narwhal._wasInBubbleField = inField;
      if (!inField)
        continue;
      if (narwhal.boosting || narwhal.boostRegenDelay > 0 || narwhal.boostLockout > 0)
        continue;
      if (narwhal.boostEnergy >= narwhal.boostEnergyMax)
        continue;
      const extraRegen = narwhal.boostRegenRate * (BUBBLE_FIELD_REGEN_MULT - 1) * dt;
      narwhal.boostEnergy = Math.min(narwhal.boostEnergyMax, narwhal.boostEnergy + extraRegen);
    }
  }
  function getOrcaSeaIndex() {
    return Math.max(0, ATLAS_THEMES.findIndex((theme) => activeAtlasTheme && theme.id === activeAtlasTheme.id));
  }
  function applyOrcaSeaTuning(orca, resetForNewSea = false) {
    if (!orca)
      return;
    const seaIndex = getOrcaSeaIndex();
    const tuning = ORCA_SEA_TUNING[seaIndex] || ORCA_SEA_TUNING[0];
    const changedSea = orca.seaIndex !== seaIndex;
    orca.seaIndex = seaIndex;
    orca.visualScale = tuning.scale;
    orca.visualLength = ORCA_VISUAL_LENGTH * tuning.scale;
    orca.bodyRadius = ORCA_BODY_RADIUS * tuning.scale;
    orca.bodyHalfLength = ORCA_BODY_HALF_LENGTH * tuning.scale;
    orca.bodyHalfWidth = ORCA_BODY_HALF_WIDTH * tuning.scale;
    orca.headOffset = ORCA_HEAD_OFFSET * tuning.scale;
    orca.headRadius = ORCA_HEAD_RADIUS * tuning.scale;
    orca.patrolSpeed = tuning.patrolSpeed;
    orca.chargeSpeed = tuning.chargeSpeed;
    orca.detectRadius = tuning.detectRadius;
    orca.warnDuration = tuning.warnDuration;
    orca.chargeDuration = tuning.chargeDuration || ORCA_CHARGE_DURATION;
    orca.cooldownDuration = tuning.cooldown;
    orca.bodyStun = tuning.bodyStun;
    orca.bounceForce = tuning.bounceForce;
    orca.turnSpeed = tuning.turnSpeed;
    orca.chargeTurn = tuning.chargeTurn;
    orca.glideSpeed = tuning.patrolSpeed;
    if (changedSea || resetForNewSea) {
      orca.state = "patrol";
      orca.stateTimer = 0;
      orca.target = null;
      orca.eyeGlow = 0;
      orca.chargeTrail.length = 0;
      orca.spawnGrace = ORCA_SPAWN_GRACE;
      orca.playerTargetSafeUntil = matchTimer + ORCA_SPAWN_GRACE;
    }
  }
  function createOrcaPredator() {
    const arena = window.gameConfig.arena;
    const angle = Math.random() * TWO_PI;
    let spawnX = Math.random() * arena.width;
    let spawnY = Math.random() * arena.height;
    if (playerNarwhal) {
      for (let attempt = 0; attempt < 24; attempt++) {
        const candidateX = Math.random() * arena.width;
        const candidateY = Math.random() * arena.height;
        spawnX = candidateX;
        spawnY = candidateY;
        if (distanceSq(candidateX, candidateY, playerNarwhal.x, playerNarwhal.y) >= ORCA_SAFE_SPAWN_DISTANCE * ORCA_SAFE_SPAWN_DISTANCE)
          break;
      }
    }
    const orca = {
      x: spawnX,
      y: spawnY,
      angle,
      targetAngle: angle,
      state: "patrol",
      // 'patrol' | 'warning' | 'charging' | 'cooldown'
      stateTimer: 0,
      patrolChangeTimer: randRange(1.5, 3.5),
      target: null,
      // narwhal being hunted
      visualPhase: 0,
      eyeGlow: 0,
      // 0..1 intensity of red eye glow
      chargeTrail: [],
      // position history for visual trail
      swimPhase: Math.random() * TWO_PI,
      swimAmp: 1,
      // Narwhal-style continuous swimming state
      moveIntent: true,
      glideSpeed: ORCA_PATROL_SPEED,
      wanderAngle: angle,
      wanderTimer: randRange(2, 4),
      spawnGrace: ORCA_SPAWN_GRACE,
      seaIndex: -1,
      playerTargetSafeUntil: 0
    };
    applyOrcaSeaTuning(orca, true);
    return orca;
  }
  function initOrcaPredator() {
    if (activeAtlasTheme && ORCA_ENABLED_THEMES.includes(activeAtlasTheme.id)) {
      if (!orcaPredator) {
        orcaPredator = createOrcaPredator();
      } else {
        applyOrcaSeaTuning(orcaPredator);
      }
    } else {
      orcaPredator = null;
    }
    orcaWarningActive = false;
  }
  function getOrcaHeadPosition(orca) {
    const headOffset = orca.headOffset || ORCA_HEAD_OFFSET;
    return {
      x: wrapCoordinate(orca.x + Math.cos(orca.angle) * headOffset, ARENA_W),
      y: wrapCoordinate(orca.y + Math.sin(orca.angle) * headOffset, ARENA_H)
    };
  }
  function orcaHeadHitsNarwhal(orca, narwhal) {
    if (!narwhal || narwhal.dying || narwhal.spawnProtection > 0)
      return false;
    const head = getOrcaHeadPosition(orca);
    const dx = wrappedDelta(narwhal.x, head.x, ARENA_W);
    const dy = wrappedDelta(narwhal.y, head.y, ARENA_H);
    const hitRadius = (orca.headRadius || ORCA_HEAD_RADIUS) + narwhal.bodyRadius * 0.72;
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }
  function orcaBodyTouchesNarwhal(orca, narwhal) {
    if (!narwhal || narwhal.dying || narwhal.spawnProtection > 0)
      return false;
    const dx = wrappedDelta(narwhal.x, orca.x, ARENA_W);
    const dy = wrappedDelta(narwhal.y, orca.y, ARENA_H);
    const cosA = Math.cos(orca.angle);
    const sinA = Math.sin(orca.angle);
    const localX = dx * cosA + dy * sinA;
    const localY = -dx * sinA + dy * cosA;
    const halfLength = (orca.bodyHalfLength || ORCA_BODY_HALF_LENGTH) + narwhal.bodyRadius * 0.72;
    const halfWidth = (orca.bodyHalfWidth || ORCA_BODY_HALF_WIDTH) + narwhal.bodyRadius * 0.82;
    const normalized = localX * localX / (halfLength * halfLength) + localY * localY / (halfWidth * halfWidth);
    return normalized <= 1;
  }
  function orcaHornTouchesNarwhal(orca, narwhal) {
    if (!narwhal || narwhal.dying || narwhal.spawnProtection > 0)
      return false;
    const horn = getHornSegmentAt(narwhal, narwhal.x, narwhal.y);
    const cosA = Math.cos(orca.angle);
    const sinA = Math.sin(orca.angle);
    const toLocal = (x, y) => {
      const dx = wrappedDelta(x, orca.x, ARENA_W);
      const dy = wrappedDelta(y, orca.y, ARENA_H);
      return {
        x: (dx * cosA + dy * sinA) / ((orca.bodyHalfLength || ORCA_BODY_HALF_LENGTH) + narwhal.hornWidth),
        y: (-dx * sinA + dy * cosA) / ((orca.bodyHalfWidth || ORCA_BODY_HALF_WIDTH) + narwhal.hornWidth)
      };
    };
    const a = toLocal(horn.ax, horn.ay);
    const b = toLocal(horn.bx, horn.by);
    return pointSegmentDistance(0, 0, a.x, a.y, b.x, b.y) <= 1;
  }
  function updateOrcaPredator(dt) {
    if (!orcaPredator)
      return;
    const orca = orcaPredator;
    orca.visualPhase += dt * 3;
    orca.stateTimer += dt;
    orca.spawnGrace = Math.max(0, (orca.spawnGrace || 0) - dt);
    const isMovingFast = orca.state === "charging";
    const isPatrolling = orca.state === "patrol" || orca.state === "cooldown";
    orca.swimPhase += dt * (isMovingFast ? 8.5 : isPatrolling ? 4.8 : 3.6);
    if (orca.swimPhase > TWO_PI * 1024)
      orca.swimPhase -= TWO_PI * 1024;
    const swimTarget = orca.state === "cooldown" ? 0.55 : 1;
    orca.swimAmp += (swimTarget - orca.swimAmp) * Math.min(1, dt * 6);
    const arena = window.gameConfig.arena;
    const narwhals = getAllNarwhals();
    switch (orca.state) {
      case "patrol": {
        orca.wanderTimer -= dt;
        if (orca.wanderTimer <= 0) {
          orca.wanderAngle = normalizeAngle(orca.angle + randRange(-0.9, 0.9));
          orca.wanderTimer = randRange(1.5, 3.5);
        }
        orca.targetAngle = orca.wanderAngle;
        const diff = shortestAngleDiff(orca.targetAngle, orca.angle);
        orca.angle += clamp(diff, -orca.turnSpeed * dt, orca.turnSpeed * dt);
        orca.x = wrapCoordinate(orca.x + Math.cos(orca.angle) * orca.patrolSpeed * dt, arena.width);
        orca.y = wrapCoordinate(orca.y + Math.sin(orca.angle) * orca.patrolSpeed * dt, arena.height);
        orca.eyeGlow = Math.max(0, orca.eyeGlow - dt * 2);
        let closest = null;
        let closestDist = Infinity;
        for (let i = 0; i < narwhals.length; i++) {
          const n = narwhals[i];
          if (n.spawnProtection > 0)
            continue;
          if (n.isPlayer) {
            if (matchTimer < (orca.playerTargetSafeUntil || 0))
              continue;
            if (!isInView(orca.x, orca.y, orca.visualLength * 0.5))
              continue;
          }
          const d2 = distanceSq(orca.x, orca.y, n.x, n.y);
          if (d2 < orca.detectRadius * orca.detectRadius && d2 < closestDist) {
            closestDist = d2;
            closest = n;
          }
        }
        if (closest && orca.spawnGrace <= 0) {
          orca.state = "warning";
          orca.stateTimer = 0;
          orca.target = closest;
          orca.eyeGlow = 0.3;
          if (isInView(orca.x, orca.y, orca.visualLength * 0.6)) {
            playSound("orca_warning_sound", 0.72) || playTone(65, 1.2, 0.06, "sawtooth");
          }
        }
        break;
      }
      case "warning": {
        orca.eyeGlow = Math.min(1, orca.eyeGlow + dt * 1.5);
        if (orca.target && !orca.target.dying) {
          const tdx = wrappedDelta(orca.target.x, orca.x, arena.width);
          const tdy = wrappedDelta(orca.target.y, orca.y, arena.height);
          orca.targetAngle = Math.atan2(tdy, tdx);
          const diff = shortestAngleDiff(orca.targetAngle, orca.angle);
          orca.angle += clamp(diff, -orca.turnSpeed * 1.5 * dt, orca.turnSpeed * 1.5 * dt);
        }
        orca.x = wrapCoordinate(orca.x + Math.cos(orca.angle) * orca.patrolSpeed * 0.55 * dt, arena.width);
        orca.y = wrapCoordinate(orca.y + Math.sin(orca.angle) * orca.patrolSpeed * 0.55 * dt, arena.height);
        if (!orca.target || orca.target.dying) {
          orca.state = "cooldown";
          orca.stateTimer = 0;
          orca.target = null;
          break;
        }
        const d2 = distanceSq(orca.x, orca.y, orca.target.x, orca.target.y);
        if (d2 > orca.detectRadius * 1.5 * (orca.detectRadius * 1.5)) {
          orca.state = "cooldown";
          orca.stateTimer = 0;
          orca.target = null;
          break;
        }
        if (orca.stateTimer >= orca.warnDuration) {
          orca.state = "charging";
          orca.stateTimer = 0;
          orca.chargeTrail = [];
          screenShake = Math.max(screenShake, 4);
        }
        orcaWarningActive = orca.target && orca.target.isPlayer;
        break;
      }
      case "charging": {
        orca.eyeGlow = 1;
        if (!orca.target || orca.target.dying) {
          orca.state = "cooldown";
          orca.stateTimer = 0;
          orca.target = null;
          orcaWarningActive = false;
          break;
        }
        const tdx = wrappedDelta(orca.target.x, orca.x, arena.width);
        const tdy = wrappedDelta(orca.target.y, orca.y, arena.height);
        const targetAngle = Math.atan2(tdy, tdx);
        const diff = shortestAngleDiff(targetAngle, orca.angle);
        orca.angle += clamp(diff, -orca.chargeTurn * dt, orca.chargeTurn * dt);
        orca.x = wrapCoordinate(orca.x + Math.cos(orca.angle) * orca.chargeSpeed * dt, arena.width);
        orca.y = wrapCoordinate(orca.y + Math.sin(orca.angle) * orca.chargeSpeed * dt, arena.height);
        orca.chargeTrail.push({ x: orca.x, y: orca.y, age: 0 });
        if (orca.chargeTrail.length > 12)
          orca.chargeTrail.shift();
        let headVictim = null;
        let headVictimDist = Infinity;
        const head = getOrcaHeadPosition(orca);
        for (let i = 0; i < narwhals.length; i++) {
          const candidate = narwhals[i];
          if (candidate.isPlayer && matchTimer < (orca.playerTargetSafeUntil || 0))
            continue;
          if (!orcaHeadHitsNarwhal(orca, candidate))
            continue;
          const dx = wrappedDelta(candidate.x, head.x, arena.width);
          const dy = wrappedDelta(candidate.y, head.y, arena.height);
          const d2 = dx * dx + dy * dy;
          if (d2 < headVictimDist) {
            headVictimDist = d2;
            headVictim = candidate;
          }
        }
        if (headVictim) {
          orcaKillNarwhal(headVictim);
          orca.state = "cooldown";
          orca.stateTimer = 0;
          orca.target = null;
          orcaWarningActive = false;
          break;
        }
        if (orca.stateTimer >= orca.chargeDuration) {
          orca.state = "cooldown";
          orca.stateTimer = 0;
          orca.target = null;
          orcaWarningActive = false;
        }
        orcaWarningActive = orca.target && orca.target.isPlayer;
        break;
      }
      case "cooldown": {
        orca.eyeGlow = Math.max(0, orca.eyeGlow - dt * 0.8);
        orca.wanderTimer -= dt;
        if (orca.wanderTimer <= 0) {
          orca.wanderAngle = normalizeAngle(orca.angle + randRange(-0.6, 0.6));
          orca.wanderTimer = randRange(1.5, 3);
        }
        const cdDiff = shortestAngleDiff(orca.wanderAngle, orca.angle);
        orca.angle += clamp(cdDiff, -orca.turnSpeed * 0.7 * dt, orca.turnSpeed * 0.7 * dt);
        orca.x = wrapCoordinate(orca.x + Math.cos(orca.angle) * orca.patrolSpeed * 0.7 * dt, arena.width);
        orca.y = wrapCoordinate(orca.y + Math.sin(orca.angle) * orca.patrolSpeed * 0.7 * dt, arena.height);
        orcaWarningActive = false;
        if (orca.stateTimer >= orca.cooldownDuration) {
          orca.state = "patrol";
          orca.stateTimer = 0;
          orca.wanderTimer = randRange(1.5, 3.5);
        }
        break;
      }
    }
    for (let i = orca.chargeTrail.length - 1; i >= 0; i--) {
      orca.chargeTrail[i].age += dt;
      if (orca.chargeTrail[i].age > 0.6) {
        orca.chargeTrail.splice(i, 1);
      }
    }
    const _sharkSpriteReady = orcaSprite && orcaSprite.complete && orcaSprite.naturalWidth > 0 || orcaSpriteOpen && orcaSpriteOpen.complete && orcaSpriteOpen.naturalWidth > 0;
    for (let i = 0; i < narwhals.length; i++) {
      const n = narwhals[i];
      if (n.isPlayer && !_sharkSpriteReady)
        continue;
      if (n.isPlayer && matchTimer < (orca.playerTargetSafeUntil || 0))
        continue;
      if (n.spawnProtection > 0)
        continue;
      const dx = wrappedDelta(n.x, orca.x, arena.width);
      const dy = wrappedDelta(n.y, orca.y, arena.height);
      const collisionCull = orca.visualLength + n.bodyRadius * 2;
      if (dx * dx + dy * dy > collisionCull * collisionCull)
        continue;
      const bodyTouch = orcaBodyTouchesNarwhal(orca, n);
      const hornTouch = !bodyTouch && orcaHornTouchesNarwhal(orca, n);
      if (!bodyTouch && !hornTouch)
        continue;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      if (bodyTouch) {
        n.knockbackVx = nx * orca.bounceForce;
        n.knockbackVy = ny * orca.bounceForce;
        if (!n._orcaStunUntil || matchTimer >= n._orcaStunUntil) {
          n.stunTimer = Math.max(n.stunTimer, orca.bodyStun);
          n._orcaStunUntil = matchTimer + Math.max(0.45, orca.bodyStun + 0.1);
        }
        n.x = wrapCoordinate(n.x + nx * 12, arena.width);
        n.y = wrapCoordinate(n.y + ny * 12, arena.height);
      } else {
        const recoilForce = orca.bounceForce * 0.3;
        n.knockbackVx = nx * recoilForce;
        n.knockbackVy = ny * recoilForce;
        if (!n._orcaHornUntil || matchTimer >= n._orcaHornUntil) {
          n._orcaHornUntil = matchTimer + ORCA_HORN_COOLDOWN;
          n.boostEnergy = Math.max(0, n.boostEnergy * 0.82);
          const horn = getHornSegmentAt(n, n.x, n.y);
          spawnParticles(horn.bx, horn.by, "#9FE9FF", 8, 135, 2.3, 0.35);
          if (isInView(n.x, n.y, 80) && (!orca._lastHornSoundTime || matchTimer - orca._lastHornSoundTime > 0.9)) {
            orca._lastHornSoundTime = matchTimer;
            playSound("hit_sound", 0.58) || playTone(145, 0.1, 0.025, "square");
          }
          if (n.isPlayer && !sharkImmuneHintShown) {
            const immuneText = t("immune");
            addFloatingText(horn.bx, horn.by, immuneText, "#9FE9FF", 23);
            sharkImmuneHintShown = true;
          }
        }
        n.x = wrapCoordinate(n.x + nx * 7, arena.width);
        n.y = wrapCoordinate(n.y + ny * 7, arena.height);
      }
    }
  }
  function orcaKillNarwhal(victim) {
    if (!victim || victim.dying)
      return;
    victim.dying = true;
    victim.boosting = false;
    victim.deathAlpha = 0;
    victim.deathScale = 1;
    spawnDeathLoot(victim, null);
    const visible = victim.isPlayer || isInView(victim.x, victim.y, 150);
    const arena = window.gameConfig.arena;
    if (visible) {
      const orca = orcaPredator;
      const burstAngle = orca ? Math.atan2(wrappedDelta(victim.y, orca.y, arena.height), wrappedDelta(victim.x, orca.x, arena.width)) : Math.random() * TWO_PI;
      const splatR = clamp(victim.bodyRadius * 1.1, 28, 72);
      const victimSpeed = victim.baseSpeed * (victim.boosting ? window.gameConfig.boost.multiplier : 1);
      const driftVx = Math.cos(victim.angle) * victimSpeed * 0.3;
      const driftVy = Math.sin(victim.angle) * victimSpeed * 0.3;
      if (particles.length < particleBudget()) {
        particles.push({
          x: victim.x,
          y: victim.y,
          vx: driftVx,
          vy: driftVy,
          size: splatR,
          color: "rgba(160, 28, 28, 0.82)",
          life: 1.4,
          maxLife: 1.4,
          drag: 1.8,
          shape: "blood_cloud",
          rotation: burstAngle,
          spin: 0
        });
      }
      const radialSpeed = clamp(victim.bodyRadius * 3.8, 140, 310);
      const radialSize = clamp(victim.bodyRadius * 0.62, 14, 40);
      for (let i = 0; i < 3; i++) {
        if (particles.length >= particleBudget())
          break;
        const arcOffset = (i / 2 - 0.5) * (Math.PI * 2 / 3) + randRange(-0.18, 0.18);
        const a = burstAngle + arcOffset;
        const spd = radialSpeed * randRange(0.72, 1.28);
        particles.push({
          x: victim.x,
          y: victim.y,
          vx: Math.cos(a) * spd + driftVx * 0.5,
          vy: Math.sin(a) * spd + driftVy * 0.5,
          size: radialSize * randRange(0.8, 1.2),
          color: "#A02020",
          life: 0.55,
          maxLife: 0.55,
          drag: 3.8,
          shape: "splash",
          rotation: a,
          spin: randRange(-2, 2)
        });
      }
      const tierColor = victim.getTierColor();
      if (particles.length < particleBudget()) {
        const a = burstAngle + randRange(-0.3, 0.3);
        const spd = radialSpeed * randRange(0.55, 0.9);
        particles.push({
          x: victim.x,
          y: victim.y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          size: clamp(victim.bodyRadius * 0.52, 12, 34) * randRange(0.85, 1.15),
          color: tierColor,
          life: 0.62,
          maxLife: 0.62,
          drag: 3.2,
          shape: "shard",
          rotation: a,
          spin: randRange(-5, 5)
        });
      }
      screenShake = Math.max(screenShake, 14);
      hitStopTimer = Math.max(hitStopTimer, 0.08);
    }
    const rippleX = wrapCoordinate(victim.x, arena.width);
    const rippleY = wrapCoordinate(victim.y, arena.height);
    const br = victim.bodyRadius;
    deathRipples.push(
      { x: rippleX, y: rippleY, startRadius: br * 0.8, endRadius: br * 5, duration: 1.1, delay: 0, elapsed: 0, lineWidth: 3.2 },
      { x: rippleX, y: rippleY, startRadius: br * 0.8, endRadius: br * 5, duration: 1.1, delay: 0.1, elapsed: 0, lineWidth: 2 }
    );
    if (victim.isPlayer) {
      killPlayer();
    } else if (visible) {
      playSound("kill_sound", 0.65) || playSound("death_sound", 0.55) || playTone(80, 0.25, 0.04, "sawtooth");
    }
  }
  function drawOrcaPredator() {
    if (!orcaPredator)
      return;
    const orca = orcaPredator;
    const cullRadius = orca.visualLength * 1.2;
    if (!isInView(orca.x, orca.y, cullRadius))
      return;
    const rx = camera.x + wrappedDelta(orca.x, _camModX, ARENA_W);
    const ry = camera.y + wrappedDelta(orca.y, _camModY, ARENA_H);
    if (rx < viewBounds.minX - cullRadius || rx > viewBounds.maxX + cullRadius || ry < viewBounds.minY - cullRadius || ry > viewBounds.maxY + cullRadius)
      return;
    const arena = window.gameConfig.arena;
    if (orca.state === "warning" || orca.state === "charging") {
      const pulsePhase = orca.visualPhase * ORCA_WARN_PULSE_RATE * 0.6;
      const breathe = Math.sin(pulsePhase) * 0.5 + 0.5;
      const pulseAlpha = breathe * 0.22 * orca.eyeGlow;
      const innerR = orca.bodyRadius * 1.6 + breathe * 40 * orca.visualScale;
      const outerR = innerR + 18 + breathe * 12;
      ctx.save();
      ctx.globalAlpha = pulseAlpha * 0.55;
      ctx.strokeStyle = "rgba(255, 80, 60, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, outerR, 0, TWO_PI);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.strokeStyle = "rgba(255, 120, 80, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rx, ry, innerR, 0, TWO_PI);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = orca.eyeGlow * 0.06;
      const dangerGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, orca.bodyRadius * 2.5);
      dangerGrad.addColorStop(0, "rgba(255, 60, 40, 1)");
      dangerGrad.addColorStop(1, "rgba(255, 60, 40, 0)");
      ctx.fillStyle = dangerGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, orca.bodyRadius * 2.5, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(orca.angle);
    const facingLeft = Math.abs(orca.angle) > Math.PI * 0.5;
    if (facingLeft)
      ctx.scale(1, -1);
    ctx.save();
    const haloR = orca.bodyRadius * 1.3;
    ctx.scale(1.22, 1.08);
    const haloGrad = ctx.createRadialGradient(0, 8, haloR * 0.15, 0, 8, haloR);
    haloGrad.addColorStop(0, "rgba(2, 25, 55, 0.20)");
    haloGrad.addColorStop(0.55, "rgba(2, 25, 55, 0.12)");
    haloGrad.addColorStop(1, "rgba(2, 25, 55, 0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 8, haloR, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
    const swimSway = Math.sin(orca.swimPhase) * 0.034 * orca.swimAmp;
    const swimSquash = 1 + Math.cos(orca.swimPhase * 2) * 0.018 * orca.swimAmp;
    const pivot = orca.bodyRadius * 0.3;
    ctx.translate(pivot, 0);
    ctx.rotate(swimSway);
    ctx.translate(-pivot, 0);
    ctx.rotate(ORCA_SPRITE_ROTATION);
    ctx.scale(1, swimSquash);
    const isAttacking = orca.state === "warning" || orca.state === "charging";
    const activeSharkSprite = isAttacking && orcaSpriteOpen && orcaSpriteOpen.complete && orcaSpriteOpen.naturalWidth > 0 ? orcaSpriteOpen : orcaSprite;
    if (activeSharkSprite && activeSharkSprite.complete && activeSharkSprite.naturalWidth > 0) {
      const aspect = activeSharkSprite.naturalWidth / activeSharkSprite.naturalHeight;
      const drawW = orca.visualLength;
      const drawH = drawW / aspect;
      if (orca.eyeGlow > 0.1 && perfQuality > 0) {
        const glowIntensity = orca.eyeGlow * 0.35;
        ctx.shadowColor = `rgba(255, 80, 40, ${glowIntensity})`;
        ctx.shadowBlur = 12 + orca.eyeGlow * 8;
      }
      ctx.drawImage(activeSharkSprite, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      const bodyW = orca.bodyHalfLength * 2;
      const bodyH = orca.bodyHalfWidth * 2;
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW / 2, bodyH / 2, 0, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "#e8e8e8";
      ctx.beginPath();
      ctx.ellipse(0, bodyH * 0.08, bodyW * 0.32, bodyH * 0.28, 0, 0, TWO_PI);
      ctx.fill();
      if (orca.eyeGlow > 0.1) {
        ctx.fillStyle = `rgba(255, 20, 20, ${orca.eyeGlow})`;
        ctx.beginPath();
        ctx.arc(bodyW * 0.15, -bodyH * 0.12, 5, 0, TWO_PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bodyW * 0.15, bodyH * 0.12, 5, 0, TWO_PI);
        ctx.fill();
      }
    }
    ctx.restore();
    if (orca.state === "warning" || orca.state === "charging") {
      const iconY = ry - orca.bodyRadius * 1.9;
      const breathe = Math.sin(orca.visualPhase * 3) * 0.5 + 0.5;
      ctx.save();
      ctx.globalAlpha = 0.5 + breathe * 0.25;
      ctx.font = `bold 24px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 100, 60, 0.95)";
      if (perfQuality > 0) {
        ctx.shadowColor = "rgba(255, 80, 40, 0.5)";
        ctx.shadowBlur = 8;
      }
      ctx.fillText("\u26A0", rx, iconY);
      ctx.restore();
    }
  }
  function drawOrcaWarningVignette() {
    if (!orcaWarningActive || !orcaPredator)
      return;
    const orca = orcaPredator;
    const intensity = orca.state === "charging" ? 0.16 : 0.07;
    const pulse = Math.sin(orca.visualPhase * 3.5) * 0.5 + 0.5;
    const alpha = intensity * (0.7 + pulse * 0.3);
    ctx.save();
    const grad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.38,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT * 0.76
    );
    grad.addColorStop(0, "rgba(255, 0, 0, 0)");
    grad.addColorStop(0.75, "rgba(255, 0, 0, 0)");
    grad.addColorStop(1, `rgba(120, 10, 0, ${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
  function drawSharkDangerIndicator() {
    if (!orcaPredator)
      return;
    const orca = orcaPredator;
    if (orca.state !== "warning" && orca.state !== "charging")
      return;
    if (!orca.target || !orca.target.isPlayer)
      return;
    const rx = camera.x + wrappedDelta(orca.x, _camModX, ARENA_W);
    const ry = camera.y + wrappedDelta(orca.y, _camModY, ARENA_H);
    const cullR = orca.visualLength * 0.45;
    if (rx >= viewBounds.minX - cullR && rx <= viewBounds.maxX + cullR && ry >= viewBounds.minY - cullR && ry <= viewBounds.maxY + cullR) {
      return;
    }
    const screenCX = CANVAS_WIDTH / 2;
    const screenCY = CANVAS_HEIGHT / 2;
    const sharkSX = (rx - camera.x) * camera.zoom + screenCX;
    const sharkSY = (ry - camera.y) * camera.zoom + screenCY;
    const dirX = sharkSX - screenCX;
    const dirY = sharkSY - screenCY;
    const dirDist = Math.hypot(dirX, dirY) || 1;
    const ndx = dirX / dirDist;
    const ndy = dirY / dirDist;
    const margin = 52;
    const halfW = screenCX - margin;
    const halfH = screenCY - margin;
    let t2 = 1e6;
    if (Math.abs(ndx) > 1e-3)
      t2 = Math.min(t2, halfW / Math.abs(ndx));
    if (Math.abs(ndy) > 1e-3)
      t2 = Math.min(t2, halfH / Math.abs(ndy));
    const ix = screenCX + ndx * t2;
    const iy = screenCY + ndy * t2;
    const angle = Math.atan2(ndy, ndx);
    const pulse = Math.sin(performance.now() * 7e-3) * 0.5 + 0.5;
    const alpha = 0.72 + pulse * 0.28;
    const size = 16 + pulse * 3;
    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ff2020";
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.55, -size * 0.52);
    ctx.lineTo(-size * 0.25, 0);
    ctx.lineTo(-size * 0.55, size * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.rotate(-angle);
    ctx.globalAlpha = alpha * 0.95;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 0, 0);
    ctx.restore();
  }
  function drawOrcaOnMinimap(m, sx, sy) {
    if (!orcaPredator)
      return;
    const arena = window.gameConfig.arena;
    const ox = positiveMod(orcaPredator.x, arena.width) * sx;
    const oy = positiveMod(orcaPredator.y, arena.height) * sy;
    const isHunting = orcaPredator.state === "warning" || orcaPredator.state === "charging";
    const baseRadius = 6.5 + orcaPredator.visualScale * 6.5;
    const radius = isHunting ? baseRadius + Math.sin(orcaPredator.visualPhase * 6) * 2 : baseRadius;
    m.fillStyle = isHunting ? "#ff1a1a" : "#cc0000";
    m.beginPath();
    m.arc(ox, oy, radius, 0, TWO_PI);
    m.fill();
    if (isHunting) {
      m.strokeStyle = "#ff4444";
      m.lineWidth = 1.5;
      m.beginPath();
      m.arc(ox, oy, radius, 0, TWO_PI);
      m.stroke();
    }
    if (isHunting) {
      m.strokeStyle = "rgba(255, 32, 32, 0.4)";
      m.lineWidth = 1;
      m.beginPath();
      m.arc(ox, oy, orcaPredator.detectRadius * sx, 0, TWO_PI);
      m.stroke();
    }
  }
  function createKrakenPresence() {
    const arena = window.gameConfig.arena;
    const angle = Math.random() * TWO_PI;
    const revealAngle = Math.random() * TWO_PI;
    const revealDistance = randRange(820, 1200);
    const spawnX = playerNarwhal ? wrapCoordinate(playerNarwhal.x + Math.cos(revealAngle) * revealDistance, arena.width) : Math.random() * arena.width;
    const spawnY = playerNarwhal ? wrapCoordinate(playerNarwhal.y + Math.sin(revealAngle) * revealDistance, arena.height) : Math.random() * arena.height;
    return {
      x: spawnX,
      y: spawnY,
      angle,
      targetAngle: angle,
      changeTimer: randRange(KRAKEN_DIR_CHANGE_MIN, KRAKEN_DIR_CHANGE_MAX),
      opacity: randRange(KRAKEN_OPACITY_MIN, KRAKEN_OPACITY_MAX),
      eyeGlow: 0,
      // 0..1 intensity
      eyeTimer: randRange(KRAKEN_EYE_OFF_MIN, KRAKEN_EYE_OFF_MAX),
      // countdown to next glow
      eyeState: "off",
      // 'off' | 'on'
      visualPhase: Math.random() * TWO_PI
    };
  }
  function initKrakenPresence() {
    if (activeAtlasTheme && activeAtlasTheme.id === KRAKEN_ENABLED_THEME) {
      if (!krakenPresence) {
        krakenPresence = createKrakenPresence();
      }
    } else {
      krakenPresence = null;
    }
  }
  function updateKrakenPresence(dt) {
    if (!krakenPresence)
      return;
    const k = krakenPresence;
    const arena = window.gameConfig.arena;
    k.visualPhase += dt * 1.2;
    k.changeTimer -= dt;
    if (k.changeTimer <= 0) {
      k.targetAngle = normalizeAngle(k.angle + randRange(-0.8, 0.8));
      k.changeTimer = randRange(KRAKEN_DIR_CHANGE_MIN, KRAKEN_DIR_CHANGE_MAX);
    }
    const diff = shortestAngleDiff(k.targetAngle, k.angle);
    k.angle += clamp(diff, -KRAKEN_TURN_SPEED * dt, KRAKEN_TURN_SPEED * dt);
    const swayX = Math.sin(k.visualPhase * 0.35) * 3.5;
    const swayY = Math.cos(k.visualPhase * 0.25) * 2.8;
    k.x = wrapCoordinate(k.x + Math.cos(k.angle) * KRAKEN_SPEED * dt + swayX * dt, arena.width);
    k.y = wrapCoordinate(k.y + Math.sin(k.angle) * KRAKEN_SPEED * dt + swayY * dt, arena.height);
    k.eyeGlow = 0;
  }
  function drawKrakenPresence() {
    if (!krakenPresence || !krakenSprite || !krakenSprite.complete || krakenSprite.naturalWidth <= 0)
      return;
    const k = krakenPresence;
    const cullR = KRAKEN_DRAW_SIZE * 0.7;
    if (!isInView(k.x, k.y, cullR))
      return;
    const rx = camera.x + wrappedDelta(k.x, _camModX, ARENA_W);
    const ry = camera.y + wrappedDelta(k.y, _camModY, ARENA_H);
    if (rx < viewBounds.minX - cullR || rx > viewBounds.maxX + cullR || ry < viewBounds.minY - cullR || ry > viewBounds.maxY + cullR)
      return;
    const aspect = krakenSprite.naturalWidth / krakenSprite.naturalHeight;
    const drawW = KRAKEN_DRAW_SIZE;
    const drawH = KRAKEN_DRAW_SIZE / aspect;
    const breathe = 1 + Math.sin(k.visualPhase * 0.4) * 0.015;
    ctx.save();
    ctx.translate(rx, ry);
    const visualAngle = clamp(normalizeAngle(k.angle - Math.PI / 2), -0.5236, 0.5236);
    ctx.rotate(visualAngle);
    ctx.scale(breathe, breathe);
    ctx.globalAlpha = k.opacity;
    if (perfQuality > 0) {
      ctx.shadowColor = "rgba(2, 12, 30, 0.45)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 18;
    }
    if (perfQuality > 0) {
      ctx.filter = "blur(3px)";
    }
    ctx.drawImage(krakenSprite, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.filter = "none";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (k.eyeGlow > 0.01) {
      const eyeR = drawW * 0.05;
      const glowAlpha = k.eyeGlow * 0.55;
      const eyes = [
        { x: -drawW * 0.075, y: drawH * 0.075 },
        { x: drawW * 0.075, y: drawH * 0.075 }
      ];
      for (const eye of eyes) {
        ctx.globalAlpha = k.opacity * glowAlpha;
        const eyeGrad = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, eyeR * 2.1);
        eyeGrad.addColorStop(0, "rgba(175, 150, 255, 1)");
        eyeGrad.addColorStop(0.35, "rgba(105, 80, 225, 0.62)");
        eyeGrad.addColorStop(1, "rgba(40, 20, 140, 0)");
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, eyeR * 2.1, 0, TWO_PI);
        ctx.fill();
        ctx.globalAlpha = k.opacity * glowAlpha * 0.82;
        ctx.fillStyle = "rgba(200, 185, 255, 1)";
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, eyeR * 0.28, 0, TWO_PI);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  function createWreckPresence() {
    const arena = window.gameConfig.arena;
    const angle = Math.random() * TWO_PI;
    const revealAngle = Math.random() * TWO_PI;
    const revealDistance = randRange(820, 1200);
    const spawnX = playerNarwhal ? wrapCoordinate(playerNarwhal.x + Math.cos(revealAngle) * revealDistance, arena.width) : Math.random() * arena.width;
    const spawnY = playerNarwhal ? wrapCoordinate(playerNarwhal.y + Math.sin(revealAngle) * revealDistance, arena.height) : Math.random() * arena.height;
    return {
      x: spawnX,
      y: spawnY,
      angle,
      targetAngle: angle,
      changeTimer: randRange(WRECK_DIR_CHANGE_MIN, WRECK_DIR_CHANGE_MAX),
      opacity: randRange(WRECK_OPACITY_MIN, WRECK_OPACITY_MAX),
      visualPhase: Math.random() * TWO_PI
    };
  }
  function initWreckPresence() {
    if (activeAtlasTheme && activeAtlasTheme.id === WRECK_ENABLED_THEME) {
      if (!wreckPresence) {
        wreckPresence = createWreckPresence();
      }
    } else {
      wreckPresence = null;
    }
  }
  function updateWreckPresence(dt) {
    if (!wreckPresence)
      return;
    const w = wreckPresence;
    const arena = window.gameConfig.arena;
    w.visualPhase += dt * 0.8;
    w.changeTimer -= dt;
    if (w.changeTimer <= 0) {
      w.targetAngle = normalizeAngle(w.angle + randRange(-0.4, 0.4));
      w.changeTimer = randRange(WRECK_DIR_CHANGE_MIN, WRECK_DIR_CHANGE_MAX);
    }
    const diff = shortestAngleDiff(w.targetAngle, w.angle);
    w.angle += clamp(diff, -WRECK_TURN_SPEED * dt, WRECK_TURN_SPEED * dt);
    w.x = wrapCoordinate(w.x + Math.cos(w.angle) * WRECK_SPEED * dt, arena.width);
    w.y = wrapCoordinate(w.y + Math.sin(w.angle) * WRECK_SPEED * dt, arena.height);
  }
  function drawWreckPresence() {
    if (!wreckPresence || !wreckSprite || !wreckSprite.complete || wreckSprite.naturalWidth <= 0)
      return;
    const w = wreckPresence;
    const cullR = WRECK_DRAW_SIZE * 0.7;
    if (!isInView(w.x, w.y, cullR))
      return;
    const rx = camera.x + wrappedDelta(w.x, _camModX, ARENA_W);
    const ry = camera.y + wrappedDelta(w.y, _camModY, ARENA_H);
    if (rx < viewBounds.minX - cullR || rx > viewBounds.maxX + cullR || ry < viewBounds.minY - cullR || ry > viewBounds.maxY + cullR)
      return;
    const aspect = wreckSprite.naturalWidth / wreckSprite.naturalHeight;
    const drawW = WRECK_DRAW_SIZE;
    const drawH = WRECK_DRAW_SIZE / aspect;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.globalAlpha = w.opacity;
    if (perfQuality > 0) {
      ctx.shadowColor = "rgba(2, 12, 30, 0.40)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 14;
    }
    if (perfQuality > 0) {
      ctx.filter = "blur(2px)";
    }
    ctx.drawImage(wreckSprite, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.filter = "none";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();
  }
  function initGame() {
    ensureRuntimeConfig();
    playerNarwhal = null;
    aiNarwhals = [];
    aiRespawnTimers = [];
    aiRespawnMass = [];
    orbs = [];
    superOrbs = [];
    orcaPredator = null;
    orcaWarningActive = false;
    krakenPresence = null;
    wreckPresence = null;
    particles = [];
    floatingTexts = [];
    isPlayerDead = false;
    deathTimer = 0;
    runKills = 0;
    sharkImmuneHintShown = false;
    _atlasCheckTimer = 0;
    _persistenceSaveTimer = 20;
    atlasCommittedRunMass = 0;
    _seaCeremonyState = "idle";
    _seaCeremonyTimer = 0;
    _seaCeremonyTriggered = false;
    _pendingNewExpedition = false;
    kingCelebrationPause = 0;
    const kingOverlay = document.getElementById("king-celebration");
    if (kingOverlay) {
      kingOverlay.classList.remove("show");
      kingOverlay.classList.add("hidden");
    }
    evolutionQueue = [];
    evolutionQueueDelay = 0;
    gameStarted = gameMode === "edit";
    shuffleAINames();
    assignAIProfiles();
    matchTimer = 0;
    recentPlayerKills = [];
    earlyCalm = 1;
    resetEncounterRouting();
    const configDiff = (window.gameConfig.ai.difficulty || "medium").toLowerCase();
    ddaDifficulty = configDiff === "easy" || configDiff === "hard" ? configDiff : "medium";
    ddaPlayerDeaths = [];
    ddaLifeStart = 0;
    ddaKillsThisLife = 0;
    ddaLastTransition = 0;
    ddaDominanceTimer = 0;
    ddaStruggleTimer = 0;
    alphaHuntState = "inactive";
    alphaHuntTimer = 0;
    alphaCount = 0;
    alphaHuntHunters = [];
    alphaHuntRotateTimer = 0;
    alphaAnnounceTimer = 0;
    alphaGoldParticles = [];
    alphaHuntResultTimer = 0;
    alphaFailDeathDelay = 0;
    alphaScoreAnim = null;
    pendingRespawnMass = window.gameConfig.narwhal.initialMass;
    mouseBoostHeld = false;
    boostButtonHeld = false;
    hitStopTimer = 0;
    screenShake = 0;
    backgroundPattern = null;
    playerNarwhal = createPlayer();
    atlasCommittedRunMass = playerNarwhal.mass;
    for (let i = 0; i < window.gameConfig.ai.count; i++)
      aiNarwhals.push(createAI(i));
    aiRespawnTimers = new Array(aiNarwhals.length).fill(0);
    aiRespawnMass = new Array(aiNarwhals.length).fill(0);
    initDecoFish();
    initTurtles();
    initForegroundShapes();
    initBubbleFields();
    initOrcaPredator();
    initKrakenPresence();
    initWreckPresence();
    for (let i = 0; i < window.gameConfig.orbs.count; i++)
      spawnOrb("common");
    for (let i = 0; i < window.gameConfig.collectibles.coralCount; i++)
      spawnOrb("coral");
    for (let i = 0; i < window.gameConfig.collectibles.starfishCount; i++)
      spawnOrb("starfish");
    buildDecorPlacements();
    camera.x = playerNarwhal.x;
    camera.y = playerNarwhal.y;
    camera.zoom = window.gameConfig.visual.cameraZoom;
    minimapRefreshTimer = 0;
    if (deathOverlay)
      deathOverlay.classList.add("hidden");
    setActiveAtlasTheme(getAtlasThemeForScore(atlasCycleScore));
    updateLeaderFlags();
    updateHUD();
    updateAtlasUI();
    updateLeaderboard();
    refreshMinimapCache();
  }
  var _audioInitPromise = null;
  function resumeAudio() {
    if (_audioInitPromise)
      return _audioInitPromise;
    _audioInitPromise = (async () => {
      if (!audioContext) {
        initAudio();
      }
      if (audioContext && audioContext.state === "suspended") {
        await audioContext.resume().catch(() => {
        });
      }
      if (Object.keys(pendingAudioData).length > 0) {
        await decodeAllPendingAudio();
      }
    })();
    return _audioInitPromise;
  }
  var settingsPaused = false;
  function openSettingsOverlay() {
    const overlay = document.getElementById("settings-overlay");
    if (!overlay)
      return;
    overlay.classList.remove("hidden");
    settingsPaused = true;
    soundPanelOpen = true;
    const isSwapped = document.body.classList.contains("controls-swapped");
    const swapBtn = document.getElementById("settings-swap-btn");
    const swapStatus = document.getElementById("settings-swap-status");
    if (swapBtn)
      swapBtn.classList.toggle("active-swap", isSwapped);
    if (swapStatus)
      swapStatus.textContent = isSwapped ? "ON" : "OFF";
    const atlasPct = document.getElementById("settings-atlas-pct");
    if (atlasPct)
      atlasPct.textContent = getAtlasPercent() + "%";
  }
  function closeSettingsOverlay() {
    const overlay = document.getElementById("settings-overlay");
    if (!overlay)
      return;
    overlay.classList.add("hidden");
    settingsPaused = false;
    soundPanelOpen = false;
  }
  function toggleSoundPanel() {
    if (soundPanelOpen) {
      closeSettingsOverlay();
    } else {
      openSettingsOverlay();
    }
  }
  function setMusicVolume(value) {
    musicVolume = clamp(value, 0, 1);
    soundEnabled = musicVolume > 0 || sfxVolume > 0;
    if (backgroundMusicGain && audioContext) {
      const configMax = clamp(window.gameConfig.visual.musicVolume || 0.17, 0, 0.35);
      const target = configMax * musicVolume;
      backgroundMusicGain.gain.cancelScheduledValues(audioContext.currentTime);
      backgroundMusicGain.gain.setValueAtTime(Math.max(1e-4, target), audioContext.currentTime);
    }
    updateSoundIcon();
  }
  function setSfxVolume(value) {
    sfxVolume = clamp(value, 0, 1);
    soundEnabled = musicVolume > 0 || sfxVolume > 0;
    if (sfxGainNode && audioContext) {
      sfxGainNode.gain.cancelScheduledValues(audioContext.currentTime);
      sfxGainNode.gain.setValueAtTime(sfxVolume, audioContext.currentTime);
    }
    updateSoundIcon();
  }
  function updateSoundIcon() {
  }
  async function startGameFromInput() {
    if (gameMode !== "play" || gameStarted)
      return;
    gameStarted = true;
    if (playerNarwhal)
      playerNarwhal.spawnProtection = 2;
    await resumeAudio();
    playBackgroundMusic();
    if (controlsHintEl)
      controlsHintEl.classList.remove("visible");
    const gameWorld = document.getElementById("game-world");
    if (gameWorld)
      gameWorld.classList.remove("tutorial-active");
  }
  function setupInputHandlers() {
    if (inputHandlersReady)
      return;
    inputHandlersReady = true;
    isTouchDevice = typeof lib !== "undefined" && lib.shouldUseTouchControls ? lib.shouldUseTouchControls() : "ontouchstart" in window || navigator.maxTouchPoints > 0;
    document.body.classList.toggle("touch-mode", isTouchDevice);
    if (isTouchDevice && joystickContainer) {
      joystickContainer.classList.remove("hidden");
    }
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", (event) => {
      if (event.button !== 0)
        return;
      resumeAudio();
      startGameFromInput();
      mouseBoostHeld = true;
    });
    window.addEventListener("mouseup", () => {
      mouseBoostHeld = false;
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    if (boostButtonEl) {
      const startBoost = (event) => {
        event.preventDefault();
        event.stopPropagation();
        resumeAudio();
        startGameFromInput();
        boostButtonHeld = true;
        boostButtonEl.classList.add("active");
        const bHint = document.getElementById("boost-hint");
        if (bHint && !bHint.classList.contains("hint-used"))
          bHint.classList.add("hint-used");
      };
      const stopBoost = (event) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        boostButtonHeld = false;
        boostButtonEl.classList.remove("active");
      };
      boostButtonEl.addEventListener("pointerdown", startBoost);
      boostButtonEl.addEventListener("pointerup", stopBoost);
      boostButtonEl.addEventListener("pointercancel", stopBoost);
      boostButtonEl.addEventListener("pointerleave", stopBoost);
    }
    window.addEventListener("blur", () => {
      keys = {};
      mouseBoostHeld = false;
      boostButtonHeld = false;
      joystick.active = false;
      joystick.touchId = null;
      joystick.magnitude = 0;
      if (playerNarwhal)
        playerNarwhal.moveIntent = false;
      if (joystickKnob) {
        joystickKnob.style.transform = "translate(-50%, -50%)";
      }
      if (boostButtonEl)
        boostButtonEl.classList.remove("active");
    });
  }
  function getCanvasViewport() {
    const rect = canvas.getBoundingClientRect();
    const targetAspect = 9 / 16;
    const rectAspect = rect.width / rect.height;
    let viewWidth, viewHeight, offsetX, offsetY;
    if (rectAspect > targetAspect) {
      viewHeight = rect.height;
      viewWidth = rect.height * targetAspect;
      offsetX = (rect.width - viewWidth) / 2;
      offsetY = 0;
    } else {
      viewWidth = rect.width;
      viewHeight = rect.width / targetAspect;
      offsetX = 0;
      offsetY = (rect.height - viewHeight) / 2;
    }
    return { viewWidth, viewHeight, offsetX, offsetY, rect };
  }
  function handleMouseMove(event) {
    const { viewWidth, viewHeight, offsetX, offsetY, rect } = getCanvasViewport();
    mousePos.x = (event.clientX - rect.left - offsetX) * (CANVAS_WIDTH / viewWidth);
    mousePos.y = (event.clientY - rect.top - offsetY) * (CANVAS_HEIGHT / viewHeight);
  }
  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    keys[key] = true;
    if ([" ", "w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
      startGameFromInput();
    }
    if (key === " ") {
      resumeAudio();
    }
    if (key === "h" && gameMode === "edit") {
      debugHitboxes = !debugHitboxes;
    }
  }
  function handleKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
  }
  function handleTouchStart(event) {
    event.preventDefault();
    resumeAudio();
    startGameFromInput();
    if (joystick.active)
      return;
    const rect = canvas.getBoundingClientRect();
    const touch = event.changedTouches[0];
    if (!touch)
      return;
    const vp = getCanvasViewport();
    const localY = (touch.clientY - vp.rect.top - vp.offsetY) / vp.viewHeight * CANVAS_HEIGHT;
    const localX = (touch.clientX - vp.rect.left - vp.offsetX) / vp.viewWidth * CANVAS_WIDTH;
    if (localY < 210)
      return;
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    joystick.active = true;
    joystick.touchId = touch.identifier;
    joystick.baseX = touchX;
    joystick.baseY = touchY;
    joystick.magnitude = 0;
    if (joystickKnob) {
      joystickKnob.style.transform = "translate(-50%, -50%)";
    }
  }
  function handleTouchMove(event) {
    event.preventDefault();
    if (!joystick.active)
      return;
    const rect = canvas.getBoundingClientRect();
    let touch = null;
    for (const candidate of event.touches) {
      if (candidate.identifier === joystick.touchId) {
        touch = candidate;
        break;
      }
    }
    if (!touch)
      return;
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    const dx = touchX - joystick.baseX;
    const dy = touchY - joystick.baseY;
    const dist = Math.hypot(dx, dy);
    const deadZone = 8;
    const fullControlDist = 40;
    const maxKnobRadius = 60;
    if (dist > deadZone) {
      joystick.angle = Math.atan2(dy, dx);
      joystick.magnitude = clamp((dist - deadZone) / fullControlDist, 0, 1);
      const jHint = document.getElementById("joystick-hint");
      if (jHint && !jHint.classList.contains("hint-used"))
        jHint.classList.add("hint-used");
      const knobDist = Math.min(dist, maxKnobRadius);
      const ratio = knobDist / dist;
      const knobDx = dx * ratio;
      const knobDy = dy * ratio;
      if (joystickKnob) {
        joystickKnob.style.transform = `translate(calc(-50% + ${knobDx}px), calc(-50% + ${knobDy}px))`;
      }
    } else {
      joystick.magnitude = 0;
      if (joystickKnob) {
        joystickKnob.style.transform = "translate(-50%, -50%)";
      }
    }
  }
  function handleTouchEnd(event) {
    event.preventDefault();
    if (!joystick.active)
      return;
    let stillActive = false;
    for (const touch of event.touches) {
      if (touch.identifier === joystick.touchId) {
        stillActive = true;
        break;
      }
    }
    if (!stillActive) {
      joystick.active = false;
      joystick.touchId = null;
      joystick.magnitude = 0;
      if (playerNarwhal)
        playerNarwhal.moveIntent = false;
      if (joystickKnob) {
        joystickKnob.style.transform = "translate(-50%, -50%)";
      }
    }
  }
  function updatePlayerInput() {
    if (!playerNarwhal || playerNarwhal.dying || isPlayerDead)
      return;
    let moveIntent = false;
    if (isTouchDevice) {
      if (joystick.active && joystick.magnitude > 0) {
        playerNarwhal.targetAngle = joystick.angle;
        moveIntent = true;
      }
    } else {
      const arena = window.gameConfig.arena;
      const cameraModX = positiveMod(camera.x, arena.width);
      const cameraModY = positiveMod(camera.y, arena.height);
      const mouseWorldX = cameraModX + (mousePos.x - CANVAS_WIDTH / 2) / camera.zoom;
      const mouseWorldY = cameraModY + (mousePos.y - CANVAS_HEIGHT / 2) / camera.zoom;
      const mouseDx = wrappedDelta(mouseWorldX, playerNarwhal.x, arena.width);
      const mouseDy = wrappedDelta(mouseWorldY, playerNarwhal.y, arena.height);
      if (mouseDx * mouseDx + mouseDy * mouseDy > 36) {
        playerNarwhal.targetAngle = Math.atan2(mouseDy, mouseDx);
      }
      moveIntent = Boolean(keys.w || keys.arrowup);
      let keyX = 0;
      let keyY = 0;
      if (keys.s || keys.arrowdown)
        keyY += 1;
      if (keys.a || keys.arrowleft)
        keyX -= 1;
      if (keys.d || keys.arrowright)
        keyX += 1;
      if (keyX !== 0 || keyY !== 0) {
        playerNarwhal.targetAngle = Math.atan2(keyY, keyX);
        moveIntent = true;
      }
    }
    const wantsBoost = isTouchDevice ? boostButtonHeld : mouseBoostHeld || keys[" "] === true;
    if (!wantsBoost) {
      playerNarwhal._boostHeldDepleted = false;
    } else if (playerNarwhal.boostEnergy <= 0 || playerNarwhal.boostLockout > 0) {
      playerNarwhal._boostHeldDepleted = true;
    }
    playerNarwhal.moveIntent = moveIntent || wantsBoost;
    playerNarwhal.setBoostIntent(wantsBoost);
  }
  function updateAI(narwhal, dt) {
    if (!narwhal || narwhal.dying)
      return;
    narwhal.moveIntent = true;
    if (narwhal._aiProfile === void 0) {
      const idx = aiNarwhals.indexOf(narwhal);
      narwhal._aiProfile = idx >= 0 && idx < aiProfiles.length ? aiProfiles[idx] : "casual";
      narwhal._aiChasingPlayer = false;
      narwhal._aiChaseTimer = 0;
      narwhal._aiMaxChase = randRange(0.8, 1.2);
      narwhal._aiTerritorialHunt = false;
      narwhal._aiBoostAtPlayer = false;
      narwhal._aiBoostBurst = 0;
      narwhal._aiBoostCooldown = 0;
      narwhal._aiEcoBoostCooldown = randRange(0.5, 2);
      narwhal._aiDangerSource = null;
      narwhal._aiDangerReadyAt = 0;
      narwhal._aiOffscreen = false;
      narwhal._aiEncounterWaypoint = null;
      narwhal._aiHasPreyTarget = false;
    }
    if (playerNarwhal && !playerNarwhal.dying) {
      const d2 = distanceSq(narwhal.x, narwhal.y, playerNarwhal.x, playerNarwhal.y);
      narwhal._aiOffscreen = d2 > 81e4;
    } else {
      narwhal._aiOffscreen = false;
    }
    if (narwhal._aiOffscreen && !narwhal._alphaHunter && !narwhal._aiChasingPlayer && !narwhal._aiEncounterWaypoint) {
      narwhal.aiThinkTimer -= dt;
      if (narwhal.aiThinkTimer > 0) {
        narwhal.setBoostIntent(narwhal.aiBoostIntent);
        return;
      }
      narwhal.aiThinkTimer = randRange(0.55, 1);
    }
    if (narwhal._aiBoostCooldown > 0)
      narwhal._aiBoostCooldown -= dt;
    if (narwhal._aiEcoBoostCooldown > 0)
      narwhal._aiEcoBoostCooldown -= dt;
    if (narwhal._aiChasingPlayer) {
      narwhal._aiChaseTimer += dt;
      if (narwhal._aiChaseTimer >= narwhal._aiMaxChase) {
        narwhal._aiChasingPlayer = false;
        narwhal._aiChaseTimer = 0;
        narwhal._aiTerritorialHunt = false;
        narwhal._aiMaxChase = randRange(0.8, 1.2);
        narwhal.aiBoostIntent = false;
        narwhal._aiBoostAtPlayer = false;
        narwhal._aiBoostBurst = 0;
      }
    }
    if (narwhal._aiBoostBurst > 0) {
      narwhal._aiBoostBurst -= dt;
      narwhal.aiBoostIntent = true;
      if (narwhal._aiBoostBurst <= 0) {
        narwhal._aiBoostAtPlayer = false;
        narwhal._aiBoostBurst = 0;
        narwhal.aiBoostIntent = false;
      }
    }
    if (narwhal.aiBoostIntent && narwhal._aiBoostAtPlayer && narwhal.boostEnergy < 15) {
      narwhal.aiBoostIntent = false;
      narwhal._aiBoostAtPlayer = false;
      narwhal._aiBoostBurst = 0;
    }
    narwhal.aiThinkTimer -= dt;
    if (narwhal.aiThinkTimer > 0) {
      narwhal.setBoostIntent(narwhal.aiBoostIntent);
      return;
    }
    const _dda = getDDAModifiers();
    const profile = narwhal._aiProfile;
    const profileTuning = AI_PROFILE_TUNING[profile] || AI_PROFILE_TUNING.casual;
    narwhal._aiEvadingShark = false;
    const profileThinkMult = profileTuning.thinkMult;
    narwhal.aiThinkTimer = randRange(0.25, 0.55) * _dda.thinkMult * profileThinkMult * (1 + 0.5 * earlyCalm);
    const arena = window.gameConfig.arena;
    const pressure = getPlayerPressureLevel();
    let detectionRange, playerAggroChance, botAggroChance, boostOffenseChance;
    switch (profile) {
      case "casual":
        detectionRange = 280 * _dda.detectionMult;
        playerAggroChance = (0.02 + pressure * 0.02) * _dda.aggroMult;
        botAggroChance = 0.18;
        boostOffenseChance = 5e-3 * _dda.boostMult;
        break;
      case "opportunist":
        detectionRange = 440 * _dda.detectionMult;
        playerAggroChance = (0.07 + pressure * 0.04) * _dda.aggroMult;
        botAggroChance = 0.3;
        boostOffenseChance = 0.03 * _dda.boostMult;
        break;
      default:
        detectionRange = 540 * _dda.detectionMult;
        playerAggroChance = (0.35 + pressure * 0.1) * _dda.aggroMult;
        botAggroChance = 0.48;
        boostOffenseChance = 0.1 * _dda.boostMult;
        break;
    }
    if (earlyCalm > 0) {
      playerAggroChance *= 1 - 0.85 * earlyCalm;
      boostOffenseChance *= 1 - earlyCalm;
    }
    const chasersOnPlayer = countBotsChasingPlayer();
    const boostersOnPlayer = countBotsBoostingAtPlayer();
    let maxChasers;
    if (alphaHuntState === "active") {
      maxChasers = 2;
    } else {
      const pTier = playerNarwhal ? playerNarwhal.tier : 1;
      if (pTier <= 10) {
        maxChasers = 0;
        if (playerRankCache <= 3 && ddaKillsThisLife >= 3)
          maxChasers = 1;
      } else if (pTier <= 15) {
        maxChasers = 1;
      } else {
        maxChasers = 1;
      }
    }
    if (alphaHuntState !== "active") {
      if (_dda.maxChasersMod > 0 || maxChasers > 1) {
        maxChasers = Math.max(0, maxChasers + _dda.maxChasersMod);
      }
      if (earlyCalm > 0.6)
        maxChasers = 0;
    }
    if (alphaHuntState === "active" && playerNarwhal && !playerNarwhal.dying && !isPlayerDead) {
      const isDesignatedHunter = narwhal._alphaHunter;
      const arena2 = window.gameConfig.arena;
      const tdx = wrappedDelta(playerNarwhal.x, narwhal.x, arena2.width);
      const tdy = wrappedDelta(playerNarwhal.y, narwhal.y, arena2.height);
      const dist = Math.hypot(tdx, tdy);
      const directAngle = Math.atan2(tdy, tdx);
      const pSpd = playerNarwhal.baseSpeed * (playerNarwhal.boosting ? window.gameConfig.boost.multiplier : 1);
      if (orcaPredator && orcaPredator.target === narwhal && (orcaPredator.state === "warning" || orcaPredator.state === "charging")) {
        const sharkAwayX = wrappedDelta(narwhal.x, orcaPredator.x, arena2.width);
        const sharkAwayY = wrappedDelta(narwhal.y, orcaPredator.y, arena2.height);
        narwhal.targetAngle = Math.atan2(sharkAwayY, sharkAwayX) + randRange(-0.32, 0.32);
        narwhal.aiBoostIntent = narwhal.boostEnergy > 22 && Math.random() < profileTuning.sharkBoostChance;
        narwhal._aiEvadingShark = true;
        narwhal._aiChasingPlayer = false;
        narwhal._aiTerritorialHunt = false;
        narwhal._aiBoostAtPlayer = false;
        narwhal._aiBoostBurst = 0;
        narwhal.setBoostIntent(narwhal.aiBoostIntent);
        narwhal.aiThinkTimer = randRange(0.3, 0.55);
        return;
      }
      if (isDesignatedHunter) {
        let predMin, predMax, aimError, thinkMin, thinkMax, boostDist, boostEnergyReq, boostAlignReq;
        if (alphaCount <= 0) {
          predMin = 0.04;
          predMax = 0.1;
          aimError = 0.38;
          thinkMin = 0.32;
          thinkMax = 0.55;
          boostDist = 180;
          boostEnergyReq = 50;
          boostAlignReq = 0.28;
        } else if (alphaCount === 1) {
          predMin = 0.08;
          predMax = 0.16;
          aimError = 0.24;
          thinkMin = 0.22;
          thinkMax = 0.4;
          boostDist = 240;
          boostEnergyReq = 35;
          boostAlignReq = 0.35;
        } else {
          predMin = 0.1;
          predMax = 0.22;
          aimError = 0.14;
          thinkMin = 0.14;
          thinkMax = 0.28;
          boostDist = 300;
          boostEnergyReq = 25;
          boostAlignReq = 0.42;
        }
        const predTime = randRange(predMin, predMax);
        const predX = playerNarwhal.x + Math.cos(playerNarwhal.angle) * pSpd * predTime;
        const predY = playerNarwhal.y + Math.sin(playerNarwhal.angle) * pSpd * predTime;
        const pdx = wrappedDelta(predX, narwhal.x, arena2.width);
        const pdy = wrappedDelta(predY, narwhal.y, arena2.height);
        narwhal.targetAngle = Math.atan2(pdy, pdx) + randRange(-aimError, aimError);
        narwhal.aiBoostIntent = false;
        const alignment = Math.abs(shortestAngleDiff(directAngle, narwhal.angle));
        if (dist < boostDist && dist > 80 && narwhal.boostEnergy > boostEnergyReq && alignment < boostAlignReq) {
          if (countBotsBoostingAtPlayer() < 1) {
            narwhal.aiBoostIntent = true;
          }
        }
        narwhal._aiChasingPlayer = true;
        narwhal._aiChaseTimer = 0;
        narwhal._aiMaxChase = 999;
        narwhal._aiBoostAtPlayer = narwhal.aiBoostIntent;
        narwhal.setBoostIntent(narwhal.aiBoostIntent);
        narwhal.aiThinkTimer = randRange(thinkMin, thinkMax);
      } else {
        const flankerRange = alphaCount === 0 ? 180 : 350;
        if (dist > flankerRange) {
        } else {
          const botIdx = aiNarwhals.indexOf(narwhal);
          const flankSpread = alphaCount >= 2 ? 0.45 : 0.7;
          const flankAimNoise = alphaCount >= 2 ? 0.28 : 0.45;
          const flankOffset = (botIdx % 7 - 3) / 3 * flankSpread;
          narwhal.targetAngle = Math.atan2(tdy, tdx) + flankOffset + randRange(-flankAimNoise, flankAimNoise);
          narwhal.aiBoostIntent = false;
          const flankBoostChance = alphaCount >= 2 ? 0.15 : 0.06;
          const flankBoostDist = alphaCount >= 2 ? 180 : 120;
          if (dist < flankBoostDist && narwhal.boostEnergy > 50 && Math.random() < flankBoostChance) {
            if (countBotsBoostingAtPlayer() < 1) {
              narwhal.aiBoostIntent = true;
            }
          }
          const alphaMaxChasers = alphaCount === 0 ? 1 : 2;
          if (countBotsChasingPlayer() < alphaMaxChasers) {
            narwhal._aiChasingPlayer = true;
            narwhal._aiChaseTimer = 0;
          } else {
            narwhal._aiChasingPlayer = false;
          }
          narwhal._aiBoostAtPlayer = narwhal.aiBoostIntent;
          narwhal.setBoostIntent(narwhal.aiBoostIntent);
          narwhal.aiThinkTimer = alphaCount >= 2 ? randRange(0.3, 0.55) : randRange(0.45, 0.75);
          return;
        }
      }
      if (isDesignatedHunter)
        return;
    }
    const canChasePlayer = narwhal._aiChasingPlayer || chasersOnPlayer < maxChasers;
    const canBoostAtPlayer = narwhal._aiBoostAtPlayer || boostersOnPlayer < 1;
    const others = getAllNarwhals();
    let danger = null;
    let dangerScore = 0;
    let dangerIsShark = false;
    for (let i = 0, len = others.length; i < len; i++) {
      const other = others[i];
      if (other === narwhal)
        continue;
      if (other.isPlayer && narwhal.tier >= other.tier + 2)
        continue;
      const dx = wrappedDelta(narwhal.x, other.x, arena.width);
      const dy = wrappedDelta(narwhal.y, other.y, arena.height);
      const dist = Math.hypot(dx, dy);
      const dangerRadius = profileTuning.dangerRadius;
      if (dist > dangerRadius || dist < 1)
        continue;
      const towardUs = Math.cos(other.angle) * (dx / dist) + Math.sin(other.angle) * (dy / dist);
      const threat = towardUs * (1 - dist / dangerRadius) * (other.boosting ? 2 : 1) * (other.tier > narwhal.tier ? 1.4 : 0.85);
      if (threat > dangerScore) {
        dangerScore = threat;
        danger = other;
      }
    }
    if (orcaPredator) {
      const sharkDx = wrappedDelta(narwhal.x, orcaPredator.x, arena.width);
      const sharkDy = wrappedDelta(narwhal.y, orcaPredator.y, arena.height);
      const sharkDist = Math.hypot(sharkDx, sharkDy);
      const sharkState = orcaPredator.state;
      const sharkAwarenessRadius = sharkState === "charging" ? 620 : sharkState === "warning" ? 520 : 340;
      if (sharkDist > 1 && sharkDist < sharkAwarenessRadius) {
        const stateWeight = sharkState === "charging" ? 3.2 : sharkState === "warning" ? 2.2 : 1.05;
        const huntedBonus = orcaPredator.target === narwhal ? 0.85 : 0;
        const sharkThreat = (1 - sharkDist / sharkAwarenessRadius) * stateWeight + huntedBonus;
        if (sharkThreat > dangerScore) {
          danger = orcaPredator;
          dangerScore = sharkThreat;
          dangerIsShark = true;
        }
      }
    }
    narwhal.aiBoostIntent = false;
    narwhal.aiTarget = null;
    narwhal._aiEvadingShark = false;
    const beginnerAssistActive = profile === "casual" && narwhal.tier <= 10 && playerNarwhal && playerNarwhal.tier <= 12;
    let beginnerAssistStrength = 0;
    if (beginnerAssistActive) {
      const timeFade = matchTimer < 60 ? 1 : Math.max(0, 1 - (matchTimer - 60) / 60);
      const tierFade = playerNarwhal.tier <= 7 ? 1 : Math.max(0, 1 - (playerNarwhal.tier - 7) / 4);
      beginnerAssistStrength = Math.max(0, Math.min(timeFade, tierFade));
    }
    let isFleeing = false;
    if (danger && dangerScore > profileTuning.dangerThreshold) {
      if (narwhal._aiDangerSource !== danger) {
        narwhal._aiDangerSource = danger;
        const assistDelay = danger.isPlayer ? beginnerAssistStrength * 0.35 : 0;
        const reactionScale = dangerIsShark ? 0.68 : 1;
        const reactionDelay = randRange(profileTuning.reactionMin, profileTuning.reactionMax) * reactionScale + assistDelay;
        narwhal._aiDangerReadyAt = matchTimer + reactionDelay;
        narwhal.aiThinkTimer = Math.max(narwhal.aiThinkTimer, reactionDelay);
      } else if (matchTimer >= narwhal._aiDangerReadyAt) {
        if (dangerIsShark) {
          const sharkState = orcaPredator ? orcaPredator.state : "patrol";
          const sharkFleeChance = sharkState === "charging" ? 0.94 : sharkState === "warning" ? 0.78 : 0.46;
          isFleeing = Math.random() < sharkFleeChance;
        } else {
          const assistFleeMult = danger.isPlayer ? 1 - beginnerAssistStrength * 0.4 : 1;
          isFleeing = Math.random() < profileTuning.fleeChance * assistFleeMult;
        }
      }
    } else {
      narwhal._aiDangerSource = null;
      narwhal._aiDangerReadyAt = 0;
    }
    if (isFleeing) {
      const awayX = wrappedDelta(narwhal.x, danger.x, arena.width);
      const awayY = wrappedDelta(narwhal.y, danger.y, arena.height);
      narwhal.targetAngle = Math.atan2(awayY, awayX) + randRange(-0.48, 0.48);
      const dangerIsPlayer = Boolean(danger.isPlayer);
      const casualNoBoost = !dangerIsShark && dangerIsPlayer && profile === "casual" && playerNarwhal && playerNarwhal.tier <= 10;
      let fleeBoostChance;
      if (dangerIsShark) {
        const sharkIsAttacking = orcaPredator && (orcaPredator.state === "warning" || orcaPredator.state === "charging");
        const sharkIsHuntingUs = sharkIsAttacking && orcaPredator.target === narwhal;
        fleeBoostChance = sharkIsHuntingUs ? profileTuning.sharkBoostChance : orcaPredator && orcaPredator.state === "charging" ? 0.07 : 0;
        narwhal._aiEvadingShark = true;
      } else {
        fleeBoostChance = casualNoBoost ? 0 : profileTuning.fleeBoostChance * _dda.boostMult * (dangerIsPlayer ? 1 - 0.55 * beginnerAssistStrength : 1);
      }
      narwhal.aiBoostIntent = narwhal.boostEnergy > 18 && Math.random() < fleeBoostChance;
      narwhal._aiChasingPlayer = false;
      narwhal._aiChaseTimer = 0;
      narwhal._aiTerritorialHunt = false;
      narwhal._aiBoostAtPlayer = false;
      narwhal._aiBoostBurst = 0;
      narwhal._aiHasPreyTarget = false;
    } else {
      let target = null;
      let targetScore = -Infinity;
      let targetIsPlayer = false;
      for (let i = 0, len = others.length; i < len; i++) {
        const other = others[i];
        if (other === narwhal || other.spawnProtection > 0 || other.dying)
          continue;
        const dx = wrappedDelta(other.x, narwhal.x, arena.width);
        const dy = wrappedDelta(other.y, narwhal.y, arena.height);
        const dist = Math.hypot(dx, dy);
        if (dist > detectionRange * 1.1)
          continue;
        const tierAdvantage = narwhal.tier - other.tier;
        if (tierAdvantage < -1)
          continue;
        const isPlayerTarget = other.isPlayer;
        const territorialRange = getTerritorialHuntRange();
        const territorialPredator = isPlayerTarget && tierAdvantage >= 0 && tierAdvantage <= 2 && dist <= territorialRange;
        if (isPlayerTarget && profile === "opportunist" && tierAdvantage < 2 && !territorialPredator)
          continue;
        let aggroChance = isPlayerTarget ? playerAggroChance : botAggroChance;
        if (territorialPredator) {
          const calmPredatorMult = earlyCalm > 0.6 ? 0.35 : 1;
          aggroChance = Math.max(aggroChance, profileTuning.predatorChance * calmPredatorMult);
        }
        if (isPlayerTarget && earlyCalm <= 0 && ddaDifficulty !== "easy" && tierAdvantage >= 2) {
          aggroChance = Math.min(0.6, aggroChance * (1 + 0.15 * Math.min(tierAdvantage, 4)));
        }
        if (Math.random() > aggroChance)
          continue;
        const territorialSlotAvailable = territorialPredator && chasersOnPlayer < 1 && (narwhal._aiTerritorialHunt || countTerritorialHuntersOnPlayer(narwhal) < 1);
        if (isPlayerTarget && !canChasePlayer && !territorialSlotAvailable)
          continue;
        if (isPlayerTarget && dist < 400) {
          const pf = other.getForward();
          const toBotX = wrappedDelta(narwhal.x, other.x, arena.width);
          const toBotY = wrappedDelta(narwhal.y, other.y, arena.height);
          const toBotDist = Math.hypot(toBotX, toBotY) || 1;
          const facing = pf.x * (toBotX / toBotDist) + pf.y * (toBotY / toBotDist);
          if (facing > 0.45 && tierAdvantage < 3)
            continue;
        }
        const desiredAngle = Math.atan2(dy, dx);
        const turnNeeded = Math.abs(shortestAngleDiff(desiredAngle, narwhal.angle));
        if (isPlayerTarget && turnNeeded > 1.6)
          continue;
        const otherFwd = other.getForward();
        const attackDirX = dx / (dist || 1);
        const attackDirY = dy / (dist || 1);
        const approachDot = otherFwd.x * attackDirX + otherFwd.y * attackDirY;
        const posBonus = approachDot < -0.2 ? 1.4 : approachDot < 0.3 ? 1 : 0.5;
        const preyScore = (tierAdvantage + 2) * 140 + (1 - dist / detectionRange) * 240 + posBonus * 70;
        if (preyScore > targetScore) {
          const predTime = randRange(0.06, 0.14);
          const spd = other.baseSpeed * (other.boosting ? window.gameConfig.boost.multiplier : 1);
          target = {
            x: wrapCoordinate(other.x + Math.cos(other.angle) * spd * predTime, arena.width),
            y: wrapCoordinate(other.y + Math.sin(other.angle) * spd * predTime, arena.height),
            prey: other,
            dist,
            territorial: territorialPredator,
            score: preyScore
          };
          targetScore = preyScore;
          targetIsPlayer = isPlayerTarget;
        }
      }
      for (let i = 0, len = superOrbs.length; i < len; i++) {
        const orb = superOrbs[i];
        const dist = Math.sqrt(distanceSq(narwhal.x, narwhal.y, orb.x, orb.y));
        if (dist > detectionRange * 1.3)
          continue;
        const score = 600 * orb.value / (dist + 55);
        if (score > targetScore) {
          target = { x: orb.x, y: orb.y, score };
          targetScore = score;
          targetIsPlayer = false;
        }
      }
      for (let i = 0, len = orbs.length; i < len; i++) {
        const orb = orbs[i];
        const dist = Math.sqrt(distanceSq(narwhal.x, narwhal.y, orb.x, orb.y));
        if (dist > detectionRange * 0.9)
          continue;
        let desirability = 1;
        if (orb.kind === "coral")
          desirability = 3.8;
        else if (orb.kind === "energy" && narwhal.boostEnergy < 55)
          desirability = 3.2;
        else if (orb.kind === "starfish" && narwhal.speedBuffTimer <= 0)
          desirability = 2.8;
        const score = desirability * 115 / (dist + 26);
        if (score > targetScore) {
          target = { x: orb.x, y: orb.y, score };
          targetScore = score;
          targetIsPlayer = false;
        }
      }
      const routeWaypoint = narwhal._aiEncounterWaypoint;
      if (routeWaypoint && (!target || !target.prey)) {
        narwhal.aiTarget = null;
        narwhal._aiChasingPlayer = false;
        narwhal._aiChaseTimer = 0;
        narwhal._aiTerritorialHunt = false;
        narwhal._aiBoostAtPlayer = false;
        narwhal._aiBoostBurst = 0;
        narwhal._aiHasPreyTarget = false;
        const wdx = wrappedDelta(routeWaypoint.x, narwhal.x, arena.width);
        const wdy = wrappedDelta(routeWaypoint.y, narwhal.y, arena.height);
        if (wdx * wdx + wdy * wdy <= ENCOUNTER_ARRIVE_DIST * ENCOUNTER_ARRIVE_DIST) {
          narwhal._aiEncounterWaypoint = null;
          if (encounterRoutedBot === narwhal)
            clearEncounterRoute();
          narwhal.aiWanderAngle = normalizeAngle(narwhal.angle + randRange(-0.6, 0.6));
          narwhal._aiNextWanderAt = matchTimer + randRange(2.5, 4);
          narwhal.targetAngle = narwhal.aiWanderAngle;
        } else {
          narwhal.targetAngle = Math.atan2(wdy, wdx) + randRange(-0.2, 0.2);
          narwhal._aiNextWanderAt = 0;
        }
        narwhal.aiBoostIntent = false;
        narwhal.setBoostIntent(false);
        return;
      }
      if (target) {
        narwhal.aiTarget = target;
        narwhal._aiHasPreyTarget = !!target.prey;
        if (target.prey)
          narwhal._aiEncounterWaypoint = null;
        const tdx = wrappedDelta(target.x, narwhal.x, arena.width);
        const tdy = wrappedDelta(target.y, narwhal.y, arena.height);
        const profileAimExtra = profile === "casual" ? 0.2 : 0;
        const aimNoise = _dda.aimNoise + earlyCalm * 0.22 + profileAimExtra;
        narwhal.targetAngle = Math.atan2(tdy, tdx) + randRange(-aimNoise, aimNoise);
        if (targetIsPlayer && target.prey) {
          if (!narwhal._aiChasingPlayer) {
            narwhal._aiChasingPlayer = true;
            narwhal._aiChaseTimer = 0;
            narwhal._aiTerritorialHunt = !!target.territorial;
            narwhal._aiMaxChase = target.territorial ? randRange(0.7, 1) : randRange(0.8, 1.2) * _dda.chaseDurationMult;
          }
          if (target.dist > detectionRange * 1.2) {
            narwhal._aiChasingPlayer = false;
            narwhal._aiChaseTimer = 0;
            narwhal._aiTerritorialHunt = false;
            narwhal._aiBoostAtPlayer = false;
            narwhal._aiBoostBurst = 0;
          }
          if (profile !== "casual" && canBoostAtPlayer && narwhal._aiBoostBurst <= 0 && !narwhal._aiBoostAtPlayer && narwhal._aiBoostCooldown <= 0) {
            const alignment = Math.abs(shortestAngleDiff(Math.atan2(tdy, tdx), narwhal.angle));
            const territorialBoostMult = target.territorial ? 0.35 : 1;
            if (alignment < 0.36 && target.dist < 280 && target.dist > 100 && narwhal.boostEnergy > 30 && Math.random() < boostOffenseChance * territorialBoostMult) {
              narwhal._aiBoostAtPlayer = true;
              narwhal._aiBoostBurst = Math.random() < 0.15 ? randRange(1.1, 1.5) : randRange(0.5, 1.1);
              narwhal.aiBoostIntent = true;
              narwhal._aiBoostCooldown = randRange(3, 5);
            }
          }
          if (narwhal._aiBoostBurst > 0)
            narwhal.aiBoostIntent = true;
        } else {
          narwhal._aiChasingPlayer = false;
          narwhal._aiChaseTimer = 0;
          narwhal._aiTerritorialHunt = false;
          narwhal._aiBoostAtPlayer = false;
          narwhal._aiBoostBurst = 0;
          narwhal._aiHasPreyTarget = !!target.prey;
          if (target.prey && !target.prey.isPlayer) {
            const alignment = Math.abs(shortestAngleDiff(Math.atan2(tdy, tdx), narwhal.angle));
            if (alignment < 0.42 && target.dist < 320 && target.dist > 80 && narwhal.boostEnergy > 22 && narwhal._aiEcoBoostCooldown <= 0 && countOtherVisibleBotsBoosting(narwhal) < 1 && Math.random() < profileTuning.botBoostChance) {
              narwhal.aiBoostIntent = true;
              narwhal.aiThinkTimer = randRange(0.3, 0.6);
              narwhal._aiEcoBoostCooldown = randRange(2.5, 4.5);
            }
          }
        }
      } else {
        narwhal._aiChasingPlayer = false;
        narwhal._aiChaseTimer = 0;
        narwhal._aiTerritorialHunt = false;
        narwhal._aiBoostAtPlayer = false;
        narwhal._aiBoostBurst = 0;
        narwhal._aiHasPreyTarget = false;
        if (!narwhal._aiNextWanderAt || matchTimer >= narwhal._aiNextWanderAt) {
          narwhal._aiNextWanderAt = matchTimer + randRange(2.5, 4);
          narwhal.aiWanderAngle = normalizeAngle(narwhal.angle + randRange(-0.75, 0.75));
        }
        narwhal.targetAngle = narwhal.aiWanderAngle;
      }
    }
    if (narwhal.aiBoostIntent && !narwhal._aiEvadingShark && earlyCalm > 0 && Math.random() < earlyCalm) {
      narwhal.aiBoostIntent = false;
      narwhal._aiBoostAtPlayer = false;
      narwhal._aiBoostBurst = 0;
    }
    if (alphaHuntState !== "active" && narwhal.aiBoostIntent && !narwhal.boosting && isInView(narwhal.x, narwhal.y, 80) && countOtherVisibleBotsBoosting(narwhal) >= 1) {
      narwhal.aiBoostIntent = false;
      narwhal._aiBoostAtPlayer = false;
      narwhal._aiBoostBurst = 0;
    }
    narwhal.setBoostIntent(narwhal.aiBoostIntent);
  }
  function applyCollectible(collector, orb) {
    const config = window.gameConfig;
    if (orb.kind === "loot") {
      collector.addMass(orb.value);
    } else if (orb.kind === "coral") {
      collector.addMass(config.collectibles.coralValue);
    } else if (orb.kind === "energy") {
      collector.boostEnergy = Math.min(collector.boostEnergyMax || config.boost.energyMax, collector.boostEnergy + (config.collectibles.energyRestore || 42));
      collector.boostLockout = 0;
      collector.boostRegenDelay = 0;
    } else if (orb.kind === "starfish") {
      collector.speedBuffTimer = Math.max(collector.speedBuffTimer, config.collectibles.starfishDuration);
      if (collector.isPlayer) {
        addFloatingText(orb.x, orb.y - 12, t("speedBoostText"), "#FFC85A", 26);
      }
    } else {
      collector.addMass(1);
    }
    if (collector.isPlayer) {
      if (orb.kind === "energy") {
        addFloatingText(orb.x, orb.y - 8, t("energy"), "#52DDF4", 18);
      } else if (orb.kind === "coral") {
        addFloatingText(orb.x, orb.y - 8, "+" + config.collectibles.coralValue, "#FFC4AE", 17);
      }
      playSound("orb_collect_sound", orb.kind === "common" ? 0.34 : orb.kind === "loot" ? 0.28 : 0.52) || playTone(orb.kind === "energy" ? 560 : 360, 0.06, 0.016, "triangle");
      updateHUD();
    }
  }
  var MAGNET_RADIUS_MULT = 2.55;
  var MAGNET_STRENGTH = 2.92;
  function collectOrbs() {
    const narwhals = getAllNarwhals();
    const arena = window.gameConfig.arena;
    const arenaW = arena.width;
    const arenaH = arena.height;
    let sLen = superOrbs.length;
    for (let i = 0; i < sLen; i++) {
      const piece = superOrbs[i];
      if (piece.age < piece.collectDelay)
        continue;
      let collector = null;
      for (const narwhal of narwhals) {
        const pickup = narwhal.bodyRadius * 0.58 + piece.size * 0.18 + 5;
        const magnetRange = pickup * MAGNET_RADIUS_MULT;
        const d2 = distanceSq(narwhal.x, narwhal.y, piece.x, piece.y);
        if (d2 > magnetRange * magnetRange)
          continue;
        if (d2 <= pickup * pickup) {
          collector = narwhal;
          break;
        }
        const dist = Math.sqrt(d2);
        const tPull = 1 - (dist - pickup) / (magnetRange - pickup);
        const pull = tPull * MAGNET_STRENGTH;
        const dx = wrappedDelta(narwhal.x, piece.x, arenaW);
        const dy = wrappedDelta(narwhal.y, piece.y, arenaH);
        piece.x = wrapCoordinate(piece.x + dx / dist * pull, arenaW);
        piece.y = wrapCoordinate(piece.y + dy / dist * pull, arenaH);
      }
      if (!collector)
        continue;
      applyCollectible(collector, piece);
      if (isInView(piece.x, piece.y, 70)) {
        spawnParticles(piece.x, piece.y, "#E8E4D8", collector.isPlayer ? 2 : 1, 34, 2, 0.22, "splash");
      }
      superOrbs[i] = superOrbs[--sLen];
      i--;
    }
    superOrbs.length = sLen;
    for (let i = orbs.length - 1; i >= 0; i--) {
      const orb = orbs[i];
      let collector = null;
      for (const narwhal of narwhals) {
        const pickup = narwhal.bodyRadius * 0.58 + orb.size + 5;
        const magnetRange = pickup * MAGNET_RADIUS_MULT;
        const d2 = distanceSq(narwhal.x, narwhal.y, orb.x, orb.y);
        if (d2 > magnetRange * magnetRange)
          continue;
        if (d2 <= pickup * pickup) {
          collector = narwhal;
          break;
        }
        const dist = Math.sqrt(d2);
        const t2 = 1 - (dist - pickup) / (magnetRange - pickup);
        const pull = t2 * MAGNET_STRENGTH;
        const dx = wrappedDelta(narwhal.x, orb.x, arenaW);
        const dy = wrappedDelta(narwhal.y, orb.y, arenaH);
        orb.x = wrapCoordinate(orb.x + dx / dist * pull, arenaW);
        orb.y = wrapCoordinate(orb.y + dy / dist * pull, arenaH);
      }
      if (!collector)
        continue;
      const kind = orb.kind;
      applyCollectible(collector, orb);
      const last = orbs.pop();
      if (i < orbs.length)
        orbs[i] = last;
      spawnOrb(kind);
      if (isInView(orb.x, orb.y, 40)) {
        spawnParticles(orb.x, orb.y, orb.getColor(), collector.isPlayer ? 3 : 1, 46, 1.7, 0.24);
      }
    }
  }
  function updateOrbs(dt) {
    for (let i = 0, len = orbs.length; i < len; i++)
      orbs[i].update(dt);
    let sLen = superOrbs.length;
    for (let i = 0; i < sLen; i++) {
      if (!superOrbs[i].update(dt)) {
        superOrbs[i] = superOrbs[--sLen];
        i--;
      }
    }
    superOrbs.length = sLen;
    collectOrbs();
  }
  function getHornSegmentAt(narwhal, x, y) {
    const forwardX = Math.cos(narwhal.angle);
    const forwardY = Math.sin(narwhal.angle);
    const startDistance = narwhal.bodyRadius * 0.44;
    const reachMult = getTierHornReachMult(narwhal.tier);
    const endDistance = (narwhal.bodyRadius * 0.95 + narwhal.hornLength) * reachMult;
    return {
      ax: x + forwardX * startDistance,
      ay: y + forwardY * startDistance,
      bx: x + forwardX * endDistance,
      by: y + forwardY * endDistance
    };
  }
  function getLocalPair(a, b) {
    const arena = window.gameConfig.arena;
    return {
      ax: a.x,
      ay: a.y,
      bx: a.x + wrappedDelta(b.x, a.x, arena.width),
      by: a.y + wrappedDelta(b.y, a.y, arena.height)
    };
  }
  function hornsClash(a, b) {
    const local = getLocalPair(a, b);
    const ah = getHornSegmentAt(a, local.ax, local.ay);
    const bh = getHornSegmentAt(b, local.bx, local.by);
    const forwardA = a.getForward();
    const forwardB = b.getForward();
    const facing = forwardA.x * forwardB.x + forwardA.y * forwardB.y;
    if (facing > CLASH_FACING_THRESHOLD)
      return false;
    const ahMidX = (ah.ax + ah.bx) * 0.5;
    const ahMidY = (ah.ay + ah.by) * 0.5;
    const bhMidX = (bh.ax + bh.bx) * 0.5;
    const bhMidY = (bh.ay + bh.by) * 0.5;
    const distance = segmentSegmentDistance(ahMidX, ahMidY, ah.bx, ah.by, bhMidX, bhMidY, bh.bx, bh.by);
    return distance <= (a.hornWidth + b.hornWidth) * 0.54;
  }
  function hornHitsBody(attacker, victim) {
    if (attacker.spawnProtection > 0 || victim.spawnProtection > 0)
      return false;
    const local = getLocalPair(attacker, victim);
    const horn = getHornSegmentAt(attacker, local.ax, local.ay);
    const distance = pointSegmentDistance(local.bx, local.by, horn.ax, horn.ay, horn.bx, horn.by);
    if (distance > victim.bodyRadius * VICTIM_BODY_HIT_FACTOR + attacker.hornWidth * 0.42)
      return false;
    const forward = attacker.getForward();
    const toVictimX = local.bx - local.ax;
    const toVictimY = local.by - local.ay;
    const length = Math.hypot(toVictimX, toVictimY) || 1;
    const dot = forward.x * (toVictimX / length) + forward.y * (toVictimY / length);
    return dot > 0.22;
  }
  function bounceNarwhals(a, b, strength = 1) {
    const arena = window.gameConfig.arena;
    let dx = wrappedDelta(b.x, a.x, arena.width);
    let dy = wrappedDelta(b.y, a.y, arena.height);
    let dist = Math.hypot(dx, dy);
    if (dist < 1e-3) {
      dx = Math.cos(Math.random() * TWO_PI);
      dy = Math.sin(Math.random() * TWO_PI);
      dist = 1;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = Math.max(0, a.bodyRadius + b.bodyRadius - dist);
    const massTotal = Math.max(2, a.mass + b.mass);
    const aShare = b.mass / massTotal;
    const bShare = a.mass / massTotal;
    const push = (overlap + 14) * strength;
    a.x = wrapCoordinate(a.x - nx * push * aShare, arena.width);
    a.y = wrapCoordinate(a.y - ny * push * aShare, arena.height);
    b.x = wrapCoordinate(b.x + nx * push * bShare, arena.width);
    b.y = wrapCoordinate(b.y + ny * push * bShare, arena.height);
    a.angle = normalizeAngle(a.angle + (Math.random() < 0.5 ? -1 : 1) * 0.22 * strength);
    b.angle = normalizeAngle(b.angle + (Math.random() < 0.5 ? -1 : 1) * 0.22 * strength);
    a.targetAngle = a.angle;
    b.targetAngle = b.angle;
  }
  function resolveFrontalClash(a, b) {
    if (a.spawnProtection > 0 || b.spawnProtection > 0) {
      bounceNarwhals(a, b, 1.05);
      a.combatLock = 0.18;
      b.combatLock = 0.18;
      return;
    }
    if (a.tier !== b.tier) {
      const bigger = a.tier > b.tier ? a : b;
      const smaller = bigger === a ? b : a;
      killNarwhal(smaller, bigger);
      return;
    }
    const arena = window.gameConfig.arena;
    let dx = wrappedDelta(b.x, a.x, arena.width);
    let dy = wrappedDelta(b.y, a.y, arena.height);
    let dist = Math.hypot(dx, dy);
    if (dist < 0.01) {
      dx = 1;
      dy = 0;
      dist = 1;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    const tierDiff = Math.abs(a.tier - b.tier);
    const aVulnerable = a.stunTimer <= 0 && a.stunImmunity <= 0;
    const bVulnerable = b.stunTimer <= 0 && b.stunImmunity <= 0;
    if (tierDiff === 0) {
      const knockbackForce = (300 + a.tier * 10) * 0.85;
      a.knockbackVx = -nx * knockbackForce;
      a.knockbackVy = -ny * knockbackForce;
      b.knockbackVx = nx * knockbackForce;
      b.knockbackVy = ny * knockbackForce;
      if (aVulnerable) {
        a.boosting = false;
        a.boostRegenDelay = a.boostRegenDelayTime;
        a.stunTimer = 0.25;
      }
      if (bVulnerable) {
        b.boosting = false;
        b.boostRegenDelay = b.boostRegenDelayTime;
        b.stunTimer = 0.25;
      }
    }
    a.combatLock = 0.3;
    b.combatLock = 0.3;
    const clashVisible = a.isPlayer || b.isPlayer || isInView(a.x, a.y, 120) || isInView(b.x, b.y, 120);
    if (clashVisible) {
      const local = getLocalPair(a, b);
      const midX = wrapCoordinate((local.ax + local.bx) * 0.5, arena.width);
      const midY = wrapCoordinate((local.ay + local.by) * 0.5, arena.height);
      spawnParticles(midX, midY, "#FFFFFF", 8, 220, 3.8, 0.32);
      spawnParticles(midX, midY, "#DCE8FF", 5, 160, 2.8, 0.28);
      const ringCount = Math.min(12, particleBudget() - particles.length);
      const ringSpeed = 240 + tierDiff * 22;
      for (let i = 0; i < ringCount; i++) {
        const angle = i / ringCount * TWO_PI;
        if (particles.length >= particleBudget())
          break;
        particles.push({
          x: wrapCoordinate(midX, arena.width),
          y: wrapCoordinate(midY, arena.height),
          vx: Math.cos(angle) * ringSpeed,
          vy: Math.sin(angle) * ringSpeed,
          size: 3.2 + tierDiff * 0.2,
          color: "#E8F4FF",
          life: 0.28,
          maxLife: 0.28,
          drag: 6,
          shape: "dot",
          rotation: 0,
          spin: 0
        });
      }
      screenShake = Math.max(screenShake, 4);
      hitStopTimer = Math.max(hitStopTimer, 0.03);
      playSound("hit_sound", 0.55) || playTone(160, 0.08, 0.03, "square");
    }
    if (a.isPlayer || b.isPlayer)
      updateHUD();
  }
  function resolveNarwhalCombat(a, b) {
    if (!a || !b || a.dying || b.dying || a.combatLock > 0 || b.combatLock > 0)
      return;
    const d2 = distanceSq(a.x, a.y, b.x, b.y);
    if (!gameStarted && (a.isPlayer || b.isPlayer)) {
      const touchDist = a.bodyRadius + b.bodyRadius;
      if (d2 < touchDist * touchDist)
        bounceNarwhals(a, b, 0.72);
      return;
    }
    const aReach = getTierHornReachMult(a.tier);
    const bReach = getTierHornReachMult(b.tier);
    const interactionRadius = a.bodyRadius + b.bodyRadius + a.hornLength * aReach + b.hornLength * bReach + 18;
    if (d2 > interactionRadius * interactionRadius)
      return;
    const centerDist = Math.sqrt(d2);
    const aHits = hornHitsBody(a, b);
    const bHits = hornHitsBody(b, a);
    if (aHits && bHits) {
      resolveFrontalClash(a, b);
      return;
    }
    if (aHits) {
      killNarwhal(b, a);
      return;
    }
    if (bHits) {
      killNarwhal(a, b);
      return;
    }
    if (hornsClash(a, b)) {
      resolveFrontalClash(a, b);
      return;
    }
    if (centerDist < a.bodyRadius + b.bodyRadius) {
      bounceNarwhals(a, b, 0.78);
      a.combatLock = 0.09;
      b.combatLock = 0.09;
    }
  }
  function resolveAllCombat() {
    const narwhals = getAllNarwhals();
    for (let i = 0; i < narwhals.length; i++) {
      for (let j = i + 1; j < narwhals.length; j++) {
        resolveNarwhalCombat(narwhals[i], narwhals[j]);
      }
    }
  }
  function calculateKillReward(victim, attacker) {
    const victimCap = victim.mass * 0.65;
    if (!attacker || attacker.dying)
      return Math.max(1, Math.round(Math.min(victimCap, 80)));
    const attackerCap = Math.max(10, attacker.mass * 0.5);
    let tierJumpCap = Infinity;
    const targetTier = attacker.tier + 1;
    if (targetTier <= 20) {
      const blockedIndex = targetTier;
      if (blockedIndex < TIER_THRESHOLDS.length) {
        tierJumpCap = TIER_THRESHOLDS[blockedIndex] - attacker.mass;
      }
    }
    let reward = Math.max(1, Math.round(Math.min(victimCap, attackerCap, tierJumpCap)));
    const playerScore = playerNarwhal && !playerNarwhal.dying ? playerNarwhal.mass : 0;
    if (playerScore >= MAX_TIER_MASS + 3e3)
      reward = Math.min(reward, 120);
    else if (playerScore >= MAX_TIER_MASS + 1500)
      reward = Math.min(reward, 150);
    else if (playerScore >= MAX_TIER_MASS)
      reward = Math.min(reward, 180);
    else
      reward = Math.min(reward, 200);
    return reward;
  }
  function spawnDeathLoot(victim, attacker) {
    const available = MAX_SUPER_ORBS - superOrbs.length;
    if (available <= 0)
      return;
    const reward = calculateKillReward(victim, attacker);
    let pieceCount = victim.tier <= 5 ? 3 : victim.tier <= 10 ? 4 : victim.tier <= 15 ? 5 : 6;
    pieceCount = Math.min(pieceCount, available, Math.max(1, reward));
    const pieceSize = victim.tier <= 5 ? 52 : victim.tier <= 10 ? 60 : victim.tier <= 15 ? 68 : 76;
    const spread = victim.tier <= 5 ? 26 : victim.tier <= 10 ? 32 : victim.tier <= 15 ? 38 : 46;
    const layouts = {
      1: [[0, 0]],
      2: [[-0.25, 0.12], [0.25, -0.12]],
      3: [[0, -0.22], [-0.28, 0.18], [0.28, 0.18]],
      4: [[-0.22, -0.2], [0.22, -0.2], [-0.18, 0.22], [0.18, 0.22]],
      5: [[0, 0], [-0.3, -0.22], [0.3, -0.22], [-0.24, 0.26], [0.24, 0.26]],
      6: [[-0.24, -0.28], [0.24, -0.28], [-0.32, 0.04], [0.32, 0.04], [-0.2, 0.3], [0.2, 0.3]]
    };
    const layout = layouts[pieceCount] || layouts[6];
    const pileAngle = Math.random() * TWO_PI;
    const cosA = Math.cos(pileAngle);
    const sinA = Math.sin(pileAngle);
    const baseValue = Math.floor(reward / pieceCount);
    let remainder = reward - baseValue * pieceCount;
    for (let i = 0; i < pieceCount; i++) {
      const [lx, ly] = layout[i];
      const localX = lx * spread;
      const localY = ly * spread;
      const ox = localX * cosA - localY * sinA;
      const oy = localX * sinA + localY * cosA;
      const radial = Math.hypot(ox, oy) || 1;
      const value = Math.max(1, baseValue + (remainder-- > 0 ? 1 : 0));
      const piece = new Orb(
        wrapCoordinate(victim.x + ox, window.gameConfig.arena.width),
        wrapCoordinate(victim.y + oy, window.gameConfig.arena.height),
        "loot",
        value,
        pieceSize * randRange(0.92, 1.08),
        ox / radial * randRange(18, 36),
        oy / radial * randRange(18, 36)
      );
      piece.pileTier = victim.tier;
      piece.lootPieceIndex = i;
      piece.lootPieceCount = pieceCount;
      piece.rotation = pileAngle + randRange(-0.24, 0.24);
      superOrbs.push(piece);
    }
  }
  function killNarwhal(victim, attacker) {
    if (!victim || victim.dying || victim.spawnProtection > 0)
      return;
    victim.dying = true;
    victim.boosting = false;
    victim.deathAlpha = 0;
    victim.deathScale = 1;
    spawnDeathLoot(victim, attacker);
    const visible = victim.isPlayer || attacker && attacker.isPlayer || isInView(victim.x, victim.y, 120);
    if (visible) {
      const arena = window.gameConfig.arena;
      let impactX = victim.x;
      let impactY = victim.y;
      let burstAngle = Math.random() * TWO_PI;
      if (attacker) {
        const dx = wrappedDelta(victim.x, attacker.x, arena.width);
        const dy = wrappedDelta(victim.y, attacker.y, arena.height);
        const dist = Math.hypot(dx, dy) || 1;
        burstAngle = Math.atan2(dy, dx);
        const impactDist = victim.bodyRadius * 0.55;
        impactX = wrapCoordinate(victim.x - dx / dist * impactDist, arena.width);
        impactY = wrapCoordinate(victim.y - dy / dist * impactDist, arena.height);
      }
      const splatR = clamp(victim.bodyRadius * 1.1, 28, 72);
      const victimSpeed = victim.baseSpeed * (victim.boosting ? window.gameConfig.boost.multiplier : 1);
      const driftVx = Math.cos(victim.angle) * victimSpeed * 0.3;
      const driftVy = Math.sin(victim.angle) * victimSpeed * 0.3;
      if (particles.length < particleBudget()) {
        particles.push({
          x: victim.x,
          y: victim.y,
          vx: driftVx,
          vy: driftVy,
          size: splatR,
          color: "rgba(160, 28, 28, 0.82)",
          life: 1.4,
          maxLife: 1.4,
          drag: 1.8,
          shape: "blood_cloud",
          rotation: burstAngle,
          spin: 0
        });
      }
      const radialCount = 3;
      const radialSize = clamp(victim.bodyRadius * 0.62, 14, 40);
      const radialSpeed = clamp(victim.bodyRadius * 3.8, 140, 310);
      for (let i = 0; i < radialCount; i++) {
        if (particles.length >= particleBudget())
          break;
        const arcOffset = (i / (radialCount - 1) - 0.5) * (Math.PI * 2 / 3) + randRange(-0.18, 0.18);
        const a = burstAngle + arcOffset;
        const spd = radialSpeed * randRange(0.72, 1.28);
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(a) * spd + driftVx * 0.5,
          vy: Math.sin(a) * spd + driftVy * 0.5,
          size: radialSize * randRange(0.8, 1.2),
          color: "#A02020",
          life: 0.55,
          maxLife: 0.55,
          drag: 3.8,
          shape: "splash",
          rotation: a,
          spin: randRange(-2, 2)
        });
      }
      const shardSize = clamp(victim.bodyRadius * 0.52, 12, 34);
      const tierColor = victim.getTierColor();
      if (particles.length < particleBudget()) {
        const a = burstAngle + randRange(-0.3, 0.3);
        const spd = radialSpeed * randRange(0.55, 0.9);
        particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          size: shardSize * randRange(0.85, 1.15),
          color: tierColor,
          life: 0.62,
          maxLife: 0.62,
          drag: 3.2,
          shape: "shard",
          rotation: a,
          spin: randRange(-5, 5)
        });
      }
      screenShake = Math.max(screenShake, victim.isPlayer ? 10 : victim.tier >= 10 ? 8 : 6);
      hitStopTimer = Math.max(hitStopTimer, 0.055);
    }
    const rippleX = wrapCoordinate(victim.x, window.gameConfig.arena.width);
    const rippleY = wrapCoordinate(victim.y, window.gameConfig.arena.height);
    const br = victim.bodyRadius;
    deathRipples.push(
      { x: rippleX, y: rippleY, startRadius: br * 0.6, endRadius: br * 4, duration: 0.9, delay: 0, elapsed: 0, lineWidth: 2.8 },
      { x: rippleX, y: rippleY, startRadius: br * 0.6, endRadius: br * 4, duration: 0.9, delay: 0.08, elapsed: 0, lineWidth: 1.6 }
    );
    if (attacker && !attacker.dying && attacker !== victim) {
      attacker.kills++;
      if (attacker.isPlayer) {
        runKills++;
        ddaRecordKill();
        recentPlayerKills.push(matchTimer);
        cleanRecentKills();
        playSound("kill_sound", 0.78) || playTone(230, 0.14, 0.05, "sawtooth");
      }
    }
    if (victim.isPlayer) {
      killPlayer();
    } else if (visible) {
      playSound("hit_sound", 0.48) || playTone(180, 0.075, 0.027, "square");
    }
  }
  var lastSubmittedTotal = 0;
  var lastSavedBest = 0;
  var lastSavedKills = 0;
  var lastSavedTotalScore = 0;
  var _lastSavedGamesPlayed = 0;
  var _lastSavedExpedition = 1;
  var _lastSavedCompletions = 0;
  var _submitInFlight = false;
  var _submitQueued = false;
  var _saveInFlight = false;
  var _saveQueued = false;
  var _lastSavedKingOfSeas = false;
  function syncCurrentBestScore() {
    if (playerNarwhal && Number.isFinite(playerNarwhal.mass)) {
      bestMass = Math.max(bestMass, playerNarwhal.mass);
    }
  }
  function submitTotalScoreIfNeeded() {
    if (gameMode !== "play" || typeof lib === "undefined" || !lib.addPlayerScoreToLeaderboard)
      return;
    const scoreToSubmit = Math.floor(totalScoreAccum);
    if (scoreToSubmit <= lastSubmittedTotal)
      return;
    if (_submitInFlight) {
      _submitQueued = true;
      return;
    }
    _submitInFlight = true;
    lib.addPlayerScoreToLeaderboard(scoreToSubmit, 10).then(() => {
      lastSubmittedTotal = Math.max(lastSubmittedTotal, scoreToSubmit);
    }).catch(() => {
    }).finally(() => {
      _submitInFlight = false;
      if (_submitQueued) {
        _submitQueued = false;
        submitTotalScoreIfNeeded();
      }
    });
  }
  function saveProgressIfNeeded() {
    if (gameMode !== "play" || typeof lib === "undefined" || !lib.saveUserGameState)
      return;
    syncCurrentBestScore();
    const currentKills = totalKills + runKills;
    if (bestMass <= lastSavedBest && currentKills <= lastSavedKills && totalScoreAccum <= lastSavedTotalScore && gamesPlayed === _lastSavedGamesPlayed && kingOfSeasUnlocked === _lastSavedKingOfSeas && atlasExpedition === _lastSavedExpedition && atlasCompletions === _lastSavedCompletions)
      return;
    if (_saveInFlight) {
      _saveQueued = true;
      return;
    }
    const massToSave = bestMass;
    const killsToSave = currentKills;
    const totalToSave = totalScoreAccum;
    const gamesToSave = gamesPlayed;
    const kingOfSeasToSave = kingOfSeasUnlocked;
    const cycleScoreToSave = atlasCycleScore;
    const expeditionToSave = atlasExpedition;
    const completionsToSave = atlasCompletions;
    _saveInFlight = true;
    lib.saveUserGameState({
      atlasVersion: ATLAS_SAVE_VERSION,
      bestMass: massToSave,
      totalKills: killsToSave,
      totalScore: totalToSave,
      gamesPlayed: gamesToSave,
      kingOfSeas: kingOfSeasToSave,
      atlasCycleScore: cycleScoreToSave,
      atlasExpedition: expeditionToSave,
      atlasCompletions: completionsToSave
    }).then(() => {
      lastSavedBest = Math.max(lastSavedBest, massToSave);
      lastSavedKills = Math.max(lastSavedKills, killsToSave);
      lastSavedTotalScore = Math.max(lastSavedTotalScore, totalToSave);
      _lastSavedGamesPlayed = gamesToSave;
      _lastSavedKingOfSeas = kingOfSeasToSave;
      _lastSavedExpedition = expeditionToSave;
      _lastSavedCompletions = completionsToSave;
    }).catch(() => {
    }).finally(() => {
      _saveInFlight = false;
      if (_saveQueued) {
        _saveQueued = false;
        saveProgressIfNeeded();
      }
    });
  }
  async function loadPersistentProgress() {
    if (gameMode !== "play" || typeof lib === "undefined" || !lib.getUserGameState)
      return;
    try {
      const savedState = await Promise.race([
        lib.getUserGameState(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("timeout")), 8e3);
        })
      ]);
      if (savedState && savedState.state) {
        const state = savedState.state;
        bestMass = state.bestMass || 0;
        totalKills = state.totalKills || 0;
        totalScoreAccum = state.totalScore || 0;
        gamesPlayed = state.gamesPlayed || 0;
        const savedAtlasVersion = Number(state.atlasVersion) || 1;
        if (savedAtlasVersion >= 4) {
          atlasCycleScore = state.atlasCycleScore || 0;
          atlasExpedition = state.atlasExpedition || 1;
          atlasCompletions = state.atlasCompletions || 0;
          kingOfSeasUnlocked = state.kingOfSeas === true || atlasCompletions >= 1;
        } else if (savedAtlasVersion === 3) {
          atlasExpedition = state.atlasExpedition || 1;
          atlasCompletions = state.atlasCompletions || 0;
          kingOfSeasUnlocked = state.kingOfSeas === true || atlasCompletions >= 1;
          const oldCurve = atlasExpedition <= 1 ? [0, 2e3, 4e3, 8e3, 16e3] : [0, 4e3, 8e3, 16e3, 32e3];
          atlasCycleScore = remapAtlasScoreBetweenCurves(
            state.atlasCycleScore || 0,
            oldCurve,
            getExpeditionThresholds(atlasExpedition)
          );
        } else {
          kingOfSeasUnlocked = totalScoreAccum >= ATLAS_MAX_SCORE || savedAtlasVersion >= 2 && state.kingOfSeas === true;
          if (kingOfSeasUnlocked) {
            atlasCompletions = 1;
            atlasExpedition = 2;
            atlasCycleScore = 0;
          } else {
            atlasExpedition = 1;
            atlasCompletions = 0;
            const oldMax = 3e4;
            const newMax = getExpeditionMaxScore(1);
            atlasCycleScore = Math.min(newMax, Math.round(totalScoreAccum / oldMax * newMax));
          }
        }
        if (lib.log)
          lib.log(`Loaded progress: Best ${bestMass}, Total ${totalScoreAccum}, Exp ${atlasExpedition}, Cycle ${atlasCycleScore}, Completions ${atlasCompletions}`);
      } else if (lib.log) {
        lib.log("No saved progress found, starting fresh");
      }
    } catch (error) {
      if (lib.log)
        lib.log(`Failed to load progress: ${error.message}`);
    }
    setActiveAtlasTheme(getAtlasThemeForScore(atlasCycleScore), false);
    lastSubmittedTotal = 0;
    lastSavedBest = bestMass;
    lastSavedKills = totalKills;
    lastSavedTotalScore = totalScoreAccum;
    _lastSavedGamesPlayed = gamesPlayed;
    _lastSavedKingOfSeas = kingOfSeasUnlocked;
    _lastSavedExpedition = atlasExpedition;
    _lastSavedCompletions = atlasCompletions;
  }
  function killPlayer() {
    if (isPlayerDead || !playerNarwhal)
      return;
    isPlayerDead = true;
    ddaRecordDeath();
    pendingRespawnMass = Math.max(
      window.gameConfig.narwhal.initialMass,
      Math.floor(playerNarwhal.mass * 0.5)
    );
    const prevBest = bestMass;
    const isNewBest = prevBest > 0 && playerNarwhal.mass > prevBest;
    bestMass = Math.max(bestMass, playerNarwhal.mass);
    const deathDelta = Math.max(0, playerNarwhal.mass - atlasCommittedRunMass);
    applyAtlasDelta(deathDelta);
    atlasCommittedRunMass = playerNarwhal.mass;
    gamesPlayed++;
    _atlasCheckTimer = 0;
    updateAtlasUI();
    if (alphaHuntState === "active") {
      endAlphaHunt(false);
      alphaFailDeathDelay = 1;
      deathTimer = (isNewBest ? DEATH_DISPLAY_TIME_NEW_BEST : DEATH_DISPLAY_TIME) + 1e3;
    } else if (alphaHuntState === "charging") {
      alphaHuntState = "inactive";
      alphaHuntTimer = 0;
      deathTimer = isNewBest ? DEATH_DISPLAY_TIME_NEW_BEST : DEATH_DISPLAY_TIME;
    } else if (alphaHuntState === "cooldown") {
      deathTimer = isNewBest ? DEATH_DISPLAY_TIME_NEW_BEST : DEATH_DISPLAY_TIME;
    } else {
      deathTimer = isNewBest ? DEATH_DISPLAY_TIME_NEW_BEST : DEATH_DISPLAY_TIME;
    }
    alphaCount = 0;
    alphaHuntHunters = [];
    for (const bot of aiNarwhals) {
      if (bot)
        bot._alphaHunter = false;
    }
    submitTotalScoreIfNeeded();
    saveProgressIfNeeded();
    if (finalMassEl)
      finalMassEl.textContent = playerNarwhal.mass;
    if (deathBestMassEl)
      deathBestMassEl.textContent = bestMass;
    if (deathRunKillsEl)
      deathRunKillsEl.textContent = runKills;
    const deathTotalEl = document.getElementById("death-total-score");
    if (deathTotalEl)
      deathTotalEl.textContent = totalScoreAccum;
    const deathTitleEl = document.getElementById("death-title");
    if (deathTitleEl) {
      deathTitleEl.textContent = isNewBest ? t("newBest") : t("cracked");
      deathTitleEl.classList.toggle("new-best", isNewBest);
    }
    const deathContentEl = document.getElementById("death-content");
    if (deathContentEl)
      deathContentEl.classList.toggle("new-best", isNewBest);
    if (alphaFailDeathDelay <= 0) {
      if (deathOverlay)
        deathOverlay.classList.remove("hidden");
    }
    stopAlphaHuntSounds();
    playSound("death_sound", 0.72) || playTone(95, 0.34, 0.05, "sawtooth");
  }
  function stopAlphaHuntSounds() {
    try {
      if (alphaHuntStartSoundNode && alphaHuntStartSoundNode.source) {
        alphaHuntStartSoundNode.source.stop();
      }
    } catch (_) {
    }
    try {
      if (alphaHuntWinSoundNode && alphaHuntWinSoundNode.source) {
        alphaHuntWinSoundNode.source.stop();
      }
    } catch (_) {
    }
    alphaHuntStartSoundNode = null;
    alphaHuntWinSoundNode = null;
  }
  function respawnPlayer() {
    stopAlphaHuntSounds();
    totalKills += runKills;
    alphaScoreAnim = null;
    alphaGoldParticles = [];
    alphaHuntResultTimer = 0;
    alphaFailDeathDelay = 0;
    alphaAnnounceTimer = 0;
    if (alphaHuntBonusEl)
      alphaHuntBonusEl.classList.remove("show");
    if (alphaHuntEl)
      alphaHuntEl.classList.remove("hunt-celebrate", "hunt-urgent", "hunt-start");
    if (alphaHuntResultEl) {
      alphaHuntResultEl.classList.remove("show");
      alphaHuntResultEl.className = "";
    }
    if (alphaAnnounceEl)
      alphaAnnounceEl.classList.remove("show");
    if (alphaHuntState !== "inactive" && alphaHuntState !== "cooldown") {
      alphaHuntState = "inactive";
      alphaHuntTimer = 0;
    }
    playerNarwhal = createPlayer(pendingRespawnMass);
    atlasCommittedRunMass = playerNarwhal.mass;
    pendingRespawnMass = window.gameConfig.narwhal.initialMass;
    isPlayerDead = false;
    runKills = 0;
    sharkImmuneHintShown = false;
    ddaRecordRespawn();
    mouseBoostHeld = false;
    boostButtonHeld = false;
    camera.x = playerNarwhal.x;
    camera.y = playerNarwhal.y;
    minimapRefreshTimer = 0;
    if (deathOverlay)
      deathOverlay.classList.add("hidden");
    playSound("respawn_sound", 0.55) || playTone(520, 0.12, 0.03, "triangle");
    updateHUD();
  }
  function respawnAI(index, previousMass = null) {
    const previousName = aiNarwhals[index] ? aiNarwhals[index].name : null;
    const previousProfile = aiNarwhals[index] ? aiNarwhals[index]._aiProfile : void 0;
    aiNarwhals[index] = createAI(index, true, previousMass);
    if (previousName)
      aiNarwhals[index].name = previousName;
    if (previousProfile !== void 0)
      aiNarwhals[index]._aiProfile = previousProfile;
    aiRespawnTimers[index] = 0;
    aiRespawnMass[index] = 0;
  }
  function scheduleAIRespawn(index, previousMass) {
    if (encounterRoutedBot && encounterRoutedBot === aiNarwhals[index])
      clearEncounterRoute();
    aiRespawnMass[index] = previousMass;
    aiRespawnTimers[index] = randRange(AI_RESPAWN_DELAY_MIN, AI_RESPAWN_DELAY_MAX);
    const bot = aiNarwhals[index];
    if (bot) {
      bot.dying = true;
      bot.deathAlpha = 0;
      bot.boosting = false;
      bot.aiBoostIntent = false;
      bot._aiChasingPlayer = false;
      bot._aiTerritorialHunt = false;
      bot._aiBoostAtPlayer = false;
      bot._aiBoostBurst = 0;
      bot._alphaHunter = false;
      bot._aiEncounterWaypoint = null;
      if (bot.boostPuffs) {
        for (let p = 0; p < bot.boostPuffs.length; p++) {
          bot.boostPuffs[p].active = false;
          bot.boostPuffs[p].life = 0;
        }
      }
    }
  }
  function updateAINarwhals(dt) {
    updateEncounterRouting(dt);
    for (let i = 0; i < aiNarwhals.length; i++) {
      if (aiRespawnTimers[i] > 0) {
        aiRespawnTimers[i] -= dt;
        if (aiRespawnTimers[i] <= 0)
          respawnAI(i, aiRespawnMass[i]);
        continue;
      }
      const narwhal = aiNarwhals[i];
      if (!narwhal)
        continue;
      updateAI(narwhal, dt);
      const alive = narwhal.update(dt);
      if (!alive)
        scheduleAIRespawn(i, narwhal.mass);
    }
  }
  function updateCamera(dt = 1 / 60) {
    if (!playerNarwhal)
      return;
    const config = window.gameConfig;
    const arena = config.arena;
    const cameraModX = positiveMod(camera.x, arena.width);
    const cameraModY = positiveMod(camera.y, arena.height);
    const follow = 1 - Math.exp(-CAMERA_FOLLOW_RATE * clamp(dt, 0, 0.05));
    camera.x += wrappedDelta(playerNarwhal.x, cameraModX, arena.width) * follow;
    camera.y += wrappedDelta(playerNarwhal.y, cameraModY, arena.height) * follow;
    const targetZoom = clamp(config.visual.cameraZoom || 1, 0.96, 1.06);
    camera.zoom = targetZoom;
  }
  function computeViewBounds() {
    const width = CANVAS_WIDTH / camera.zoom;
    const height = CANVAS_HEIGHT / camera.zoom;
    viewBounds.minX = camera.x - width / 2;
    viewBounds.maxX = camera.x + width / 2;
    viewBounds.minY = camera.y - height / 2;
    viewBounds.maxY = camera.y + height / 2;
    _camModX = positiveMod(camera.x, ARENA_W);
    _camModY = positiveMod(camera.y, ARENA_H);
  }
  function updateLeaderFlags() {
    const narwhals = getAllNarwhals();
    let leader = null;
    let rank = 1;
    const playerMass = playerNarwhal && !playerNarwhal.dying ? playerNarwhal.mass : -1;
    for (const narwhal of narwhals) {
      narwhal.isLeader = false;
      if (!leader || narwhal.mass > leader.mass)
        leader = narwhal;
      if (!narwhal.isPlayer && narwhal.mass > playerMass)
        rank++;
    }
    playerRankCache = rank;
    if (alphaHuntState === "active" && playerNarwhal && !playerNarwhal.dying) {
      playerNarwhal.isLeader = true;
    } else if (leader) {
      leader.isLeader = true;
    }
  }
  var _hudMassText = null;
  var _hudMassFont = null;
  var _hudBoostWidth = null;
  var _hudBoostLocked = null;
  var _hudBoostFull = null;
  var _hudBtnDepleted = null;
  var _hudTierCleared = false;
  var _hudAlphaCountText = null;
  var _hudAlphaTimerText = null;
  function updateHUD() {
    if (!playerNarwhal)
      return;
    if (massValueEl) {
      let displayMass;
      if (alphaScoreAnim) {
        if (alphaScoreAnim.startDelay > 0) {
          displayMass = alphaScoreAnim.from;
        } else {
          const progress = clamp(alphaScoreAnim.elapsed / alphaScoreAnim.duration, 0, 1);
          const eased = progress * progress * (3 - 2 * progress);
          displayMass = Math.round(lerp(alphaScoreAnim.from, alphaScoreAnim.to, eased));
        }
      } else {
        displayMass = playerNarwhal.mass;
      }
      if (displayMass !== _hudMassText) {
        _hudMassText = displayMass;
        massValueEl.textContent = displayMass;
        const digits = String(displayMass).length;
        const font = digits >= 7 ? "14px" : digits >= 6 ? "17px" : digits >= 5 ? "20px" : "24px";
        if (font !== _hudMassFont) {
          _hudMassFont = font;
          massValueEl.style.fontSize = font;
        }
      }
    }
    if (tierValueEl && !_hudTierCleared) {
      _hudTierCleared = true;
      tierValueEl.textContent = "";
      tierValueEl.style.display = "none";
    }
    if (boostFillEl) {
      const max = playerNarwhal.boostEnergyMax || window.gameConfig.boost.energyMax;
      const percent = clamp(playerNarwhal.boostEnergy / max, 0, 1) * 100;
      const width = (Math.round(percent * 2) / 2).toFixed(1) + "%";
      if (width !== _hudBoostWidth) {
        _hudBoostWidth = width;
        boostFillEl.style.width = width;
      }
      const locked = playerNarwhal.boostLockout > 0;
      if (locked !== _hudBoostLocked) {
        _hudBoostLocked = locked;
        boostFillEl.classList.toggle("locked", locked);
      }
      const full = percent >= 99.5 && !locked;
      if (full !== _hudBoostFull) {
        _hudBoostFull = full;
        boostFillEl.classList.toggle("full", full);
      }
      const regenHint = !locked && !full && !playerNarwhal.boosting && playerNarwhal.boostRegenDelay <= 0 && percent < 99;
      const boostTrackEl = boostFillEl.parentElement;
      boostFillEl.classList.toggle("regen-hint", regenHint);
      if (boostTrackEl)
        boostTrackEl.classList.toggle("regen-hint", regenHint);
    }
    if (boostButtonEl) {
      const depleted = playerNarwhal.boostEnergy <= 0 || playerNarwhal.boostLockout > 0;
      if (depleted !== _hudBtnDepleted) {
        _hudBtnDepleted = depleted;
        boostButtonEl.classList.toggle("depleted", depleted);
      }
    }
    if (controlsHintEl) {
      const shouldShow = !gameStarted && !isPlayerDead && gameMode === "play";
      if (shouldShow !== _controlsHintVisible) {
        controlsHintEl.classList.toggle("visible", shouldShow);
        _controlsHintVisible = shouldShow;
        const gameWorld = document.getElementById("game-world");
        if (gameWorld)
          gameWorld.classList.toggle("tutorial-active", shouldShow);
      }
      if (shouldShow) {
        const html = isTouchDevice ? `<div class="hint-line">${t("hintRam")}</div>` : `<div class="hint-line">${t("hintMouseAim")}</div><div class="hint-line">${t("hintClickBoost")}</div><div class="hint-line">${t("hintRam")}</div>`;
        if (html !== _controlsHintHtml) {
          controlsHintEl.innerHTML = html;
          _controlsHintHtml = html;
        }
      }
    }
    if (powerupStatusEl && powerupTimeEl) {
      const active = playerNarwhal.speedBuffTimer > 0;
      powerupStatusEl.classList.toggle("visible", active);
      if (active && powerupStatusEl.querySelector("span")) {
        powerupStatusEl.querySelector("span").textContent = t("speedBoost");
      }
      powerupTimeEl.textContent = active ? Math.ceil(playerNarwhal.speedBuffTimer) + "s" : "";
    }
    if (alphaHuntEl && alphaHuntLabelEl) {
      const isActive = alphaHuntState === "active";
      const isCharging = alphaHuntState === "charging";
      const showHud = isActive || isCharging;
      alphaHuntEl.classList.toggle("visible", showHud);
      alphaHuntEl.classList.toggle("active-hunt", isActive);
      alphaHuntEl.classList.toggle("charging", isCharging);
      if (showHud) {
        const countLabel = alphaCount > 0 ? t("alphaLabel") + " \xD7" + alphaCount : t("alphaLabel");
        let labelText = "";
        let fillPercent = 0;
        if (isCharging) {
          const remaining = Math.ceil(Math.max(0, 10 - alphaHuntTimer));
          labelText = countLabel + " \xB7 " + t("alphaHuntIn") + " " + remaining + "s";
          fillPercent = clamp(alphaHuntTimer / 10, 0, 1) * 100;
          alphaHuntEl.classList.remove("hunt-urgent");
        } else if (isActive) {
          const duration = 30;
          const secs = Math.ceil(Math.max(0, alphaHuntTimer));
          labelText = countLabel + " \xB7 " + t("alphaHuntSurvive") + " " + secs + "s";
          fillPercent = clamp(alphaHuntTimer / duration, 0, 1) * 100;
          alphaHuntEl.classList.toggle("hunt-urgent", alphaHuntTimer <= 5);
        }
        if (labelText !== _hudAlphaTimerText) {
          _hudAlphaTimerText = labelText;
          alphaHuntLabelEl.textContent = labelText;
        }
        if (alphaHuntFillEl) {
          const fw = fillPercent.toFixed(1) + "%";
          if (fw !== _hudAlphaCountText) {
            _hudAlphaCountText = fw;
            alphaHuntFillEl.style.width = fw;
          }
        }
      } else {
        alphaHuntEl.classList.remove("hunt-urgent", "hunt-start", "active-hunt", "charging");
      }
    }
    updateSeaProgressButton();
  }
  var _leaderboardSig = "";
  function updateLeaderboard() {
    if (!leaderboardEl)
      return;
    const entries = getAllNarwhals().map((narwhal) => ({
      name: narwhal.isPlayer ? t("you") : narwhal.name,
      mass: narwhal.mass,
      isPlayer: narwhal.isPlayer
    }));
    entries.sort((a, b) => b.mass - a.mass);
    if (alphaHuntState === "active") {
      const playerIdx = entries.findIndex((e) => e.isPlayer);
      if (playerIdx > 0) {
        const [playerEntry] = entries.splice(playerIdx, 1);
        entries.unshift(playerEntry);
      }
    }
    const top3 = entries.slice(0, 3);
    const playerInTop3 = top3.some((e) => e.isPlayer);
    let pinnedEntry = null;
    let pinnedRank = 0;
    if (!playerInTop3) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isPlayer) {
          pinnedEntry = entries[i];
          pinnedRank = i + 1;
          break;
        }
      }
    }
    let sig = "";
    for (let i = 0; i < top3.length; i++)
      sig += top3[i].name + "|" + top3[i].mass + ";";
    if (pinnedEntry)
      sig += "P" + pinnedRank + "|" + pinnedEntry.mass + ";";
    if (sig === _leaderboardSig)
      return;
    _leaderboardSig = sig;
    leaderboardEl.innerHTML = "";
    top3.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "leaderboard-entry" + (entry.isPlayer ? " player" : "");
      const safeName = String(entry.name).replace(/[<>&]/g, "");
      row.innerHTML = `
            <span class="leaderboard-rank">${index + 1}.</span>
            <span class="leaderboard-name">${safeName}</span>
            <span class="leaderboard-mass">${entry.mass}</span>
        `;
      leaderboardEl.appendChild(row);
    });
    if (pinnedEntry) {
      const divider = document.createElement("div");
      divider.className = "leaderboard-divider";
      leaderboardEl.appendChild(divider);
      const row = document.createElement("div");
      row.className = "leaderboard-entry player pinned";
      const safeName = String(pinnedEntry.name).replace(/[<>&]/g, "");
      row.innerHTML = `
            <span class="leaderboard-rank">${pinnedRank}.</span>
            <span class="leaderboard-name">${safeName}</span>
            <span class="leaderboard-mass">${pinnedEntry.mass}</span>
        `;
      leaderboardEl.appendChild(row);
    }
  }
  function showEvolution(tier) {
    evolutionBanner = { tier, timer: 1.05, maxTimer: 1.05 };
    if (evolutionTierEl)
      evolutionTierEl.textContent = t("stage") + " " + tier + "!";
    if (evolutionNameEl) {
      evolutionNameEl.textContent = "";
      evolutionNameEl.style.display = "none";
    }
    if (evolutionBannerEl) {
      evolutionBannerEl.classList.remove("show");
      void evolutionBannerEl.offsetWidth;
      evolutionBannerEl.classList.add("show");
      window.setTimeout(() => evolutionBannerEl && evolutionBannerEl.classList.remove("show"), 1e3);
    }
  }
  function updateEvolutionQueue(dt) {
    if (evolutionQueue.length === 0)
      return;
    if (evolutionBanner)
      return;
    evolutionQueueDelay -= dt;
    if (evolutionQueueDelay > 0)
      return;
    const nextTier = evolutionQueue.shift();
    showEvolution(nextTier);
    evolutionQueueDelay = 0.12;
  }
  function buildBackgroundPattern() {
    if (!backgroundTexture || !backgroundTexture.complete || backgroundTexture.naturalWidth <= 0)
      return null;
    const tile = document.createElement("canvas");
    tile.width = backgroundTexture.naturalWidth;
    tile.height = backgroundTexture.naturalHeight;
    const tc = tile.getContext("2d");
    tc.fillStyle = getAtlasWaterColor();
    tc.fillRect(0, 0, tile.width, tile.height);
    tc.globalAlpha = activeAtlasTheme && typeof activeAtlasTheme.textureAlpha === "number" ? activeAtlasTheme.textureAlpha : 0.76;
    if (activeAtlasTheme && activeAtlasTheme.mirrorWrap) {
      const halfW = tile.width / 2;
      const halfH = tile.height / 2;
      const drawQuarter = (x, y, flipX, flipY) => {
        tc.save();
        tc.translate(x + (flipX ? halfW : 0), y + (flipY ? halfH : 0));
        tc.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        tc.drawImage(backgroundTexture, 0, 0, halfW, halfH);
        tc.restore();
      };
      drawQuarter(0, 0, false, false);
      drawQuarter(halfW, 0, true, false);
      drawQuarter(0, halfH, false, true);
      drawQuarter(halfW, halfH, true, true);
    } else {
      tc.drawImage(backgroundTexture, 0, 0);
    }
    return ctx.createPattern(tile, "repeat");
  }
  function drawBackground() {
    const config = window.gameConfig;
    const margin = 200;
    const x = viewBounds.minX - margin;
    const y = viewBounds.minY - margin;
    const width = viewBounds.maxX - viewBounds.minX + margin * 2;
    const height = viewBounds.maxY - viewBounds.minY + margin * 2;
    if (!backgroundPattern)
      backgroundPattern = buildBackgroundPattern();
    if (backgroundPattern) {
      const parallaxX = camera.x * 0.1;
      const parallaxY = camera.y * 0.1;
      ctx.save();
      ctx.translate(parallaxX, parallaxY);
      ctx.fillStyle = backgroundPattern;
      ctx.fillRect(x - parallaxX, y - parallaxY, width, height);
      ctx.restore();
    } else {
      ctx.fillStyle = getAtlasWaterColor();
      ctx.fillRect(x, y, width, height);
    }
  }
  var _nameplateCache = {};
  var _nameplateCacheCount = 0;
  var NAMEPLATE_FONT = 17;
  var NAMEPLATE_H = 36;
  var NAMEPLATE_PAD = 4;
  function buildNameplate(narwhal) {
    const fontSize = NAMEPLATE_FONT;
    const height = NAMEPLATE_H;
    const tierText = String(narwhal.tier);
    const name = narwhal.isPlayer ? t("you") : narwhal.name;
    const scale = 2;
    const off = document.createElement("canvas");
    const oc = off.getContext("2d");
    oc.font = `900 ${fontSize + 1}px Orbitron, sans-serif`;
    const tierWidth = oc.measureText(tierText).width;
    oc.font = `800 ${fontSize}px Inter, sans-serif`;
    const nameWidth = oc.measureText(name).width;
    const tierBoxWidth = Math.max(36, tierWidth + 20);
    const nameBoxWidth = Math.max(56, nameWidth + 28);
    const totalWidth = tierBoxWidth + nameBoxWidth + 2;
    const drawW = totalWidth + NAMEPLATE_PAD * 2;
    const drawH = height + NAMEPLATE_PAD * 2;
    off.width = Math.ceil(drawW * scale);
    off.height = Math.ceil(drawH * scale);
    oc.setTransform(scale, 0, 0, scale, NAMEPLATE_PAD * scale, NAMEPLATE_PAD * scale);
    roundRectPath(oc, 0, 0, totalWidth, height, 9);
    oc.fillStyle = narwhal.isPlayer ? kingOfSeasUnlocked ? "rgba(48, 32, 4, 0.97)" : "rgba(2,68,46,0.97)" : "rgba(4,20,34,0.96)";
    oc.fill();
    oc.strokeStyle = narwhal.isPlayer ? kingOfSeasUnlocked ? "#ffd84a" : "#0aef8a" : rgba(narwhal.getTierColor(), 0.85);
    oc.lineWidth = narwhal.isPlayer ? kingOfSeasUnlocked ? 2.8 : 2.2 : 1.6;
    oc.stroke();
    roundRectPath(oc, 0, 0, tierBoxWidth + 2, height, 9);
    oc.fillStyle = narwhal.isPlayer ? kingOfSeasUnlocked ? "#c8940a" : "#09c472" : rgba(narwhal.getTierColor(), 0.95);
    oc.fill();
    oc.textBaseline = "middle";
    oc.textAlign = "center";
    oc.font = `900 ${fontSize + 1}px Orbitron, sans-serif`;
    oc.lineWidth = 4;
    oc.strokeStyle = "rgba(0,0,0,0.80)";
    oc.strokeText(tierText, tierBoxWidth / 2 + 1, height / 2 + 0.5);
    oc.fillStyle = "#ffffff";
    oc.fillText(tierText, tierBoxWidth / 2 + 1, height / 2 + 0.5);
    oc.font = `800 ${fontSize}px Inter, sans-serif`;
    oc.lineWidth = 3.5;
    oc.strokeStyle = "rgba(0,0,0,0.75)";
    oc.strokeText(name, tierBoxWidth + 2 + nameBoxWidth / 2, height / 2 + 0.5);
    oc.fillStyle = "#ffffff";
    oc.fillText(name, tierBoxWidth + 2 + nameBoxWidth / 2, height / 2 + 0.5);
    return { canvas: off, w: drawW, h: drawH };
  }
  function getNameplate(narwhal) {
    const key = (narwhal.isPlayer ? "p" + (kingOfSeasUnlocked ? "K" : "") : narwhal.name) + "|" + narwhal.tier;
    let plate = _nameplateCache[key];
    if (!plate) {
      if (_nameplateCacheCount > 80) {
        for (const k in _nameplateCache)
          delete _nameplateCache[k];
        _nameplateCacheCount = 0;
      }
      plate = buildNameplate(narwhal);
      _nameplateCache[key] = plate;
      _nameplateCacheCount++;
    }
    return plate;
  }
  function drawNameplates() {
    const narwhals = getAllNarwhals();
    for (const narwhal of narwhals) {
      if (!isInView(narwhal.x, narwhal.y, 100))
        continue;
      if (narwhal.isPlayer && regionTransitionActive)
        continue;
      const d2 = playerNarwhal ? distanceSq(playerNarwhal.x, playerNarwhal.y, narwhal.x, narwhal.y) : 0;
      if (!narwhal.isPlayer && d2 > 690 * 690 && !narwhal.isLeader)
        continue;
      const pos = getRenderPosition(narwhal.x, narwhal.y);
      const top = pos.y - narwhal.bodyRadius * 3.1 - NAMEPLATE_H;
      const plate = getNameplate(narwhal);
      ctx.drawImage(plate.canvas, pos.x - plate.w / 2, top - NAMEPLATE_PAD, plate.w, plate.h);
      if (narwhal.isLeader) {
        const crownSize = 44;
        const crownX = pos.x;
        const crownY = top - crownSize * 0.64;
        const crownImg = collectibleSprites._leaderCrown;
        if (crownImg && crownImg.complete && crownImg.naturalWidth > 0) {
          const aspect = crownImg.naturalWidth / crownImg.naturalHeight;
          const w = crownSize * aspect;
          const h = crownSize;
          ctx.drawImage(crownImg, crownX - w / 2, crownY - h / 2, w, h);
        } else {
          ctx.save();
          ctx.translate(crownX, crownY);
          ctx.strokeStyle = "rgba(0,0,0,0.85)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-14, 8);
          ctx.lineTo(-11, -9);
          ctx.lineTo(-2, 2);
          ctx.lineTo(5, -12);
          ctx.lineTo(12, 2);
          ctx.lineTo(17, -8);
          ctx.lineTo(14, 8);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = "#FFE040";
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }
  function refreshMinimapCache() {
    const arena = window.gameConfig.arena;
    const width = 174;
    const height = 174;
    if (!minimapCanvas) {
      minimapCanvas = document.createElement("canvas");
      minimapCanvas.width = width;
      minimapCanvas.height = height;
      minimapCtx = minimapCanvas.getContext("2d");
    }
    const m = minimapCtx;
    const waterRgb = hexToRgb(getAtlasWaterColor());
    m.fillStyle = `rgb(${Math.round(waterRgb.r * 0.22)}, ${Math.round(waterRgb.g * 0.28)}, ${Math.round(waterRgb.b * 0.36)})`;
    m.fillRect(0, 0, width, height);
    const sx = width / arena.width;
    const sy = height / arena.height;
    m.strokeStyle = "rgba(255,255,255,0.06)";
    m.lineWidth = 1;
    m.beginPath();
    m.moveTo(width / 2, 0);
    m.lineTo(width / 2, height);
    m.moveTo(0, height / 2);
    m.lineTo(width, height / 2);
    m.stroke();
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const narwhal = aiNarwhals[i];
      if (!narwhal || narwhal.dying)
        continue;
      const bx = positiveMod(narwhal.x, arena.width) * sx;
      const by = positiveMod(narwhal.y, arena.height) * sy;
      const r = 2.2 + narwhal.tier * 0.32;
      const col = narwhal.isLeader ? "#FFD700" : narwhal.getTierColor();
      m.fillStyle = "rgba(0,0,0,0.45)";
      m.beginPath();
      m.arc(bx, by, r + 1, 0, TWO_PI);
      m.fill();
      m.fillStyle = col;
      m.beginPath();
      m.arc(bx, by, r, 0, TWO_PI);
      m.fill();
      if (narwhal.isLeader) {
        m.strokeStyle = "#FFE566";
        m.lineWidth = 1.2;
        m.beginPath();
        m.arc(bx, by, r + 1.5, 0, TWO_PI);
        m.stroke();
      }
    }
    if (playerNarwhal && !playerNarwhal.dying) {
      const px = positiveMod(playerNarwhal.x, arena.width) * sx;
      const py = positiveMod(playerNarwhal.y, arena.height) * sy;
      const arrowSize = 8;
      m.fillStyle = "rgba(9, 228, 136, 0.18)";
      m.beginPath();
      m.arc(px, py, arrowSize + 4, 0, TWO_PI);
      m.fill();
      m.save();
      m.translate(px, py);
      m.rotate(playerNarwhal.angle);
      m.strokeStyle = "#ffffff";
      m.lineWidth = 2.5;
      m.lineJoin = "round";
      m.beginPath();
      m.moveTo(arrowSize, 0);
      m.lineTo(-arrowSize * 0.65, -arrowSize * 0.65);
      m.lineTo(-arrowSize * 0.28, 0);
      m.lineTo(-arrowSize * 0.65, arrowSize * 0.65);
      m.closePath();
      m.stroke();
      m.fillStyle = kingOfSeasUnlocked ? "#FFD84A" : "#09E488";
      m.fill();
      m.restore();
    }
    drawOrcaOnMinimap(m, sx, sy);
  }
  function drawMinimap() {
    const width = 174;
    const height = 174;
    const x = 12;
    const y = 12;
    if (!minimapCanvas)
      refreshMinimapCache();
    ctx.save();
    roundRectPath(ctx, x - 3, y - 3, width + 6, height + 6, 13);
    ctx.fillStyle = "rgba(4,27,41,0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(130,210,181,0.32)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    roundRectPath(ctx, x, y, width, height, 10);
    ctx.clip();
    ctx.drawImage(minimapCanvas, x, y, width, height);
    ctx.restore();
  }
  function drawBoostSpeedLines() {
  }
  function buildVignetteCache() {
    vignetteCanvas = document.createElement("canvas");
    vignetteCanvas.width = CANVAS_WIDTH;
    vignetteCanvas.height = CANVAS_HEIGHT;
    const vc = vignetteCanvas.getContext("2d");
    const gradient = vc.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT * 0.45,
      CANVAS_WIDTH * 0.28,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT * 0.47,
      CANVAS_HEIGHT * 0.74
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.65, "rgba(4,22,48,0.018)");
    gradient.addColorStop(0.85, "rgba(4,22,48,0.06)");
    gradient.addColorStop(1, "rgba(2,14,36,0.18)");
    vc.fillStyle = gradient;
    vc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const vertGrad = vc.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    vertGrad.addColorStop(0, "rgba(180,235,255,0.07)");
    vertGrad.addColorStop(0.4, "rgba(120,200,240,0.02)");
    vertGrad.addColorStop(0.7, "rgba(0,0,0,0)");
    vertGrad.addColorStop(1, "rgba(0,16,38,0.12)");
    vc.fillStyle = vertGrad;
    vc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  function drawScreenVignette() {
    if (!vignetteCanvas)
      buildVignetteCache();
    ctx.drawImage(vignetteCanvas, 0, 0);
  }
  function drawWrappedOne(obj, margin) {
    if (!obj)
      return;
    const rx = camera.x + wrappedDelta(obj.x, _camModX, ARENA_W);
    const ry = camera.y + wrappedDelta(obj.y, _camModY, ARENA_H);
    if (rx < viewBounds.minX - margin || rx > viewBounds.maxX + margin || ry < viewBounds.minY - margin || ry > viewBounds.maxY + margin)
      return;
    const ox = obj.x;
    const oy = obj.y;
    obj.x = rx;
    obj.y = ry;
    try {
      obj.draw(ctx);
    } finally {
      obj.x = ox;
      obj.y = oy;
    }
  }
  function drawWrappedList(list, margin) {
    for (let i = 0, len = list.length; i < len; i++) {
      drawWrappedOne(list[i], margin);
    }
  }
  function render() {
    if (!ctx)
      return;
    computeViewBounds();
    const dpr = canvas.width / CANVAS_WIDTH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!backgroundPattern) {
      ctx.fillStyle = window.gameConfig.visual.backgroundColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    if (screenShake > 0.1) {
      ctx.translate(randRange(-screenShake, screenShake), randRange(-screenShake, screenShake));
    }
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
    drawBackground();
    drawDecorations();
    drawKrakenPresence();
    drawWreckPresence();
    drawDecoFish();
    drawTurtles();
    drawBubbleFields();
    drawWrappedList(orbs, 45);
    drawWrappedList(superOrbs, 55);
    for (let i = 0, len = aiNarwhals.length; i < len; i++) {
      const bot = aiNarwhals[i];
      if (!bot)
        continue;
      const rx = camera.x + wrappedDelta(bot.x, _camModX, ARENA_W);
      const ry = camera.y + wrappedDelta(bot.y, _camModY, ARENA_H);
      if (rx < viewBounds.minX - 280 || rx > viewBounds.maxX + 280 || ry < viewBounds.minY - 280 || ry > viewBounds.maxY + 280)
        continue;
      let distAlpha = 1;
      if (playerNarwhal && !bot.dying) {
        const d2 = distanceSq(playerNarwhal.x, playerNarwhal.y, bot.x, bot.y);
        const fadeStart = 420;
        const fadeEnd = 780;
        if (d2 > fadeStart * fadeStart) {
          const d = Math.sqrt(d2);
          distAlpha = clamp(1 - (d - fadeStart) / (fadeEnd - fadeStart) * 0.45, 0.55, 1);
        }
      }
      const ox = bot.x;
      const oy = bot.y;
      bot.x = rx;
      bot.y = ry;
      if (distAlpha < 0.99)
        ctx.globalAlpha = distAlpha;
      bot.draw(ctx);
      if (distAlpha < 0.99)
        ctx.globalAlpha = 1;
      bot.x = ox;
      bot.y = oy;
    }
    if (playerNarwhal)
      drawWrappedOne(playerNarwhal, 280);
    drawOrcaPredator();
    drawNameplates();
    drawEffects(ctx);
    if (debugHitboxes && gameMode === "edit") {
      const allN = getAllNarwhals();
      for (let i = 0; i < allN.length; i++) {
        const n = allN[i];
        if (!isInView(n.x, n.y, 200))
          continue;
        const pos = getRenderPosition(n.x, n.y);
        const horn = getHornSegmentAt(n, pos.x, pos.y);
        ctx.strokeStyle = "#FFE040";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(horn.ax, horn.ay);
        ctx.lineTo(horn.bx, horn.by);
        ctx.stroke();
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.arc(horn.bx, horn.by, 4, 0, TWO_PI);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 60, 60, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, n.bodyRadius * VICTIM_BODY_HIT_FACTOR, 0, TWO_PI);
        ctx.stroke();
      }
      if (orcaPredator) {
        const orca = orcaPredator;
        if (isInView(orca.x, orca.y, orca.visualLength)) {
          const oPos = getRenderPosition(orca.x, orca.y);
          ctx.save();
          ctx.translate(oPos.x, oPos.y);
          ctx.rotate(orca.angle);
          ctx.strokeStyle = "rgba(0, 255, 255, 0.80)";
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 5]);
          ctx.beginPath();
          ctx.ellipse(0, 0, orca.bodyHalfLength, orca.bodyHalfWidth, 0, 0, TWO_PI);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = orca.state === "charging" ? "rgba(255, 0, 0, 0.95)" : "rgba(255, 0, 0, 0.45)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(orca.headOffset, 0, orca.headRadius, 0, TWO_PI);
          ctx.stroke();
          ctx.fillStyle = orca.state === "charging" ? "#ff0000" : "#ff6666";
          ctx.beginPath();
          ctx.arc(orca.headOffset, 0, 4, 0, TWO_PI);
          ctx.fill();
          ctx.fillStyle = "#00ffff";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("BODY (stun)", 0, -orca.bodyHalfWidth - 10);
          ctx.fillStyle = "#ff4444";
          ctx.fillText("HEAD (kill)", orca.headOffset, -orca.headRadius - 10);
          ctx.restore();
        }
      }
    }
    ctx.restore();
    if (perfQuality > 0)
      drawScreenVignette();
    drawOrcaWarningVignette();
    drawSharkDangerIndicator();
    drawBoostSpeedLines();
    drawGoldParticles();
    drawMinimap();
  }
  function pickAlphaHunters() {
    const maxHunters = alphaCount === 0 ? 1 : 2;
    alphaHuntHunters = [];
    const candidates = [];
    const fallbackCandidates = [];
    for (let i = 0; i < aiNarwhals.length; i++) {
      const bot = aiNarwhals[i];
      if (!bot || bot.dying)
        continue;
      if (bot.tier >= 5) {
        candidates.push(i);
      } else {
        fallbackCandidates.push(i);
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = tmp;
    }
    alphaHuntHunters = candidates.slice(0, Math.min(maxHunters, candidates.length));
    if (alphaHuntHunters.length < maxHunters && fallbackCandidates.length > 0) {
      for (let i = fallbackCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = fallbackCandidates[i];
        fallbackCandidates[i] = fallbackCandidates[j];
        fallbackCandidates[j] = tmp;
      }
      const needed = maxHunters - alphaHuntHunters.length;
      for (let i = 0; i < Math.min(needed, fallbackCandidates.length); i++) {
        alphaHuntHunters.push(fallbackCandidates[i]);
      }
    }
    alphaHuntRotateTimer = randRange(5, 8);
  }
  function showAlphaResult(type) {
    if (!alphaHuntResultEl)
      return;
    alphaHuntResultEl.className = type;
    if (type === "complete") {
      alphaHuntResultEl.innerHTML = '<div class="result-title">' + t("alphaHuntComplete") + "</div>";
      alphaHuntResultTimer = 2;
    } else {
      alphaHuntResultEl.innerHTML = '<div class="result-title">' + t("alphaHuntFailed") + "</div>";
      alphaHuntResultTimer = 1;
    }
    void alphaHuntResultEl.offsetWidth;
    alphaHuntResultEl.classList.add("show");
  }
  function spawnGoldParticlesToScore() {
    const count = 8 + Math.floor(Math.random() * 5);
    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT / 2 - (playerNarwhal ? playerNarwhal.bodyRadius * 3.5 * camera.zoom : 120);
    const targetX = CANVAS_WIDTH / 2;
    const targetY = CANVAS_HEIGHT - 98;
    for (let i = 0; i < count; i++) {
      alphaGoldParticles.push({
        x: startX + randRange(-20, 20),
        y: startY + randRange(-15, 10),
        targetX: targetX + randRange(-15, 15),
        targetY: targetY + randRange(-5, 5),
        progress: 0,
        speed: 1 / randRange(0.8, 1),
        // completes in 0.8-1.0s
        size: randRange(4, 7),
        delay: i * 0.02
      });
    }
  }
  function updateGoldParticles(dt) {
    if (alphaHuntResultTimer > 0) {
      alphaHuntResultTimer -= dt;
      if (alphaHuntResultTimer <= 0 && alphaHuntResultEl) {
        alphaHuntResultEl.className = "";
        alphaHuntResultEl.classList.remove("show");
      }
    }
    if (alphaFailDeathDelay > 0) {
      alphaFailDeathDelay -= dt;
      if (alphaFailDeathDelay <= 0) {
        alphaFailDeathDelay = 0;
        if (deathOverlay)
          deathOverlay.classList.remove("hidden");
      }
    }
    if (alphaScoreAnim) {
      if (alphaScoreAnim.startDelay > 0) {
        alphaScoreAnim.startDelay -= dt;
      } else {
        alphaScoreAnim.elapsed += dt;
        if (alphaScoreAnim.elapsed >= alphaScoreAnim.duration) {
          alphaScoreAnim = null;
          if (massValueEl)
            massValueEl.textContent = playerNarwhal ? playerNarwhal.mass : "";
          const pill = document.getElementById("mass-pill");
          if (pill) {
            pill.classList.remove("score-pop");
            void pill.offsetWidth;
            pill.classList.add("score-pop");
          }
        }
      }
    }
    for (let i = alphaGoldParticles.length - 1; i >= 0; i--) {
      const p = alphaGoldParticles[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.progress += p.speed * dt;
      if (p.progress >= 1) {
        alphaGoldParticles.splice(i, 1);
      }
    }
  }
  function drawGoldParticles() {
    if (alphaGoldParticles.length === 0)
      return;
    ctx.save();
    for (const p of alphaGoldParticles) {
      if (p.delay > 0)
        continue;
      const t2 = p.progress;
      const ease = t2 < 0.5 ? 2 * t2 * t2 : 1 - Math.pow(-2 * t2 + 2, 2) / 2;
      const x = lerp(p.x, p.targetX, ease);
      const y = lerp(p.y, p.targetY, ease) - Math.sin(t2 * Math.PI) * 40;
      const alpha = t2 < 0.8 ? 1 : (1 - t2) / 0.2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#FFD84A";
      ctx.shadowColor = "#FFD84A";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, p.size * (1 - t2 * 0.4), 0, TWO_PI);
      ctx.fill();
    }
    ctx.restore();
  }
  function endAlphaHunt(survived) {
    if (survived) {
      alphaCount++;
      const oldMass = playerNarwhal.mass;
      playerNarwhal.mass += 1e3;
      playerNarwhal.updateDerivedStats();
      bestMass = Math.max(bestMass, playerNarwhal.mass);
      commitCurrentRunToAtlas();
      submitTotalScoreIfNeeded();
      saveProgressIfNeeded();
      alphaScoreAnim = { from: oldMass, to: playerNarwhal.mass, startDelay: 0.15, duration: 0.85, elapsed: 0 };
      showAlphaResult("complete");
      spawnGoldParticlesToScore();
      screenShake = Math.max(screenShake, 6);
      alphaHuntWinSoundNode = playSound("alpha_hunt_win_sound", 0.78) || playSound("evolve_sound", 0.8) || playTone(780, 0.18, 0.04, "triangle");
      if (alphaHuntBonusEl) {
        alphaHuntBonusEl.textContent = "+1000";
        alphaHuntBonusEl.classList.remove("show");
        void alphaHuntBonusEl.offsetWidth;
        alphaHuntBonusEl.classList.add("show");
      }
      if (alphaHuntEl) {
        alphaHuntEl.classList.remove("hunt-celebrate");
        void alphaHuntEl.offsetWidth;
        alphaHuntEl.classList.add("hunt-celebrate");
      }
      setTimeout(() => {
        if (alphaHuntBonusEl)
          alphaHuntBonusEl.classList.remove("show");
        if (alphaHuntEl)
          alphaHuntEl.classList.remove("hunt-celebrate");
      }, 2500);
      alphaHuntState = "cooldown";
      alphaHuntTimer = 45;
    } else {
      showAlphaResult("failed");
      alphaCount = 0;
      alphaHuntState = "inactive";
      alphaHuntTimer = 0;
    }
    alphaHuntHunters = [];
    for (const bot of aiNarwhals) {
      if (bot)
        bot._alphaHunter = false;
    }
    updateHUD();
  }
  function updateAlphaHunt(dt) {
    if (!playerNarwhal || playerNarwhal.dying || isPlayerDead) {
      if (alphaHuntState === "charging") {
        alphaHuntState = "inactive";
        alphaHuntTimer = 0;
      }
      return;
    }
    if (alphaAnnounceTimer > 0) {
      alphaAnnounceTimer -= dt;
      if (alphaAnnounceTimer <= 0 && alphaAnnounceEl) {
        alphaAnnounceEl.classList.remove("show");
      }
    }
    if (alphaHuntState === "inactive") {
      const physicalMass = Math.min(playerNarwhal.mass, MAX_TIER_MASS);
      const tier = getTierForMass(physicalMass);
      if (tier >= 20 && playerNarwhal.isLeader) {
        alphaHuntState = "charging";
        alphaHuntTimer = 0;
      }
    } else if (alphaHuntState === "charging") {
      const physicalMass = Math.min(playerNarwhal.mass, MAX_TIER_MASS);
      const tier = getTierForMass(physicalMass);
      if (tier < 20 || !playerNarwhal.isLeader) {
        alphaHuntState = "inactive";
        alphaHuntTimer = 0;
        return;
      }
      alphaHuntTimer += dt;
      if (alphaHuntTimer >= 10) {
        alphaHuntState = "active";
        const duration = 30;
        alphaHuntTimer = duration;
        pickAlphaHunters();
        if (alphaAnnounceEl && alphaAnnounceTitleEl && alphaAnnounceSubEl) {
          alphaAnnounceTitleEl.textContent = t("alphaHuntTitle");
          alphaAnnounceSubEl.textContent = "";
          alphaAnnounceEl.classList.remove("show");
          void alphaAnnounceEl.offsetWidth;
          alphaAnnounceEl.classList.add("show");
          alphaAnnounceTimer = 1.5;
        }
        alphaHuntStartSoundNode = playSound("alpha_hunt_start_sound", 0.7) || playSound("kill_sound", 0.65);
        if (!alphaHuntStartSoundNode)
          playTone(320, 0.16, 0.04, "sawtooth");
        if (alphaHuntEl) {
          alphaHuntEl.classList.remove("hunt-start");
          void alphaHuntEl.offsetWidth;
          alphaHuntEl.classList.add("hunt-start");
        }
        screenShake = Math.max(screenShake, 8);
      }
    } else if (alphaHuntState === "active") {
      alphaHuntTimer -= dt;
      alphaHuntRotateTimer -= dt;
      if (alphaHuntRotateTimer <= 0) {
        pickAlphaHunters();
      }
      for (const bot of aiNarwhals) {
        if (bot)
          bot._alphaHunter = false;
      }
      for (const idx of alphaHuntHunters) {
        if (aiNarwhals[idx] && !aiNarwhals[idx].dying) {
          aiNarwhals[idx]._alphaHunter = true;
        }
      }
      if (alphaHuntTimer <= 0) {
        endAlphaHunt(true);
      }
    } else if (alphaHuntState === "cooldown") {
      alphaHuntTimer -= dt;
      if (alphaHuntTimer <= 0) {
        alphaHuntState = "inactive";
        alphaHuntTimer = 0;
      }
    }
  }
  function updateGame(dt, timestamp) {
    if (!gameStarted) {
      updatePlayerInput();
      if (playerNarwhal) {
        playerNarwhal.moveIntent = false;
        playerNarwhal.update(dt);
        playerNarwhal.spawnProtection = gameStarted ? Math.max(playerNarwhal.spawnProtection, 2) : 0;
      }
      updateAINarwhals(dt);
      updateOrbs(dt);
      updateDecoFish(dt);
      updateTurtles(dt);
      updateBubbleFields(dt);
      applyBubbleFieldBonus(dt);
      updateOrcaPredator(dt);
      updateKrakenPresence(dt);
      updateWreckPresence(dt);
      resolveAllCombat();
      updateEffects(dt);
      updateEvolutionQueue(dt);
      updateCamera(dt);
      updateLeaderFlags();
      updateHUD();
      minimapRefreshTimer -= dt;
      if (minimapRefreshTimer <= 0) {
        minimapRefreshTimer = MINIMAP_UPDATE_INTERVAL;
        refreshMinimapCache();
      }
      if (Math.floor(timestamp / (LEADERBOARD_UPDATE_INTERVAL * 1e3)) !== Math.floor((timestamp - dt * 1e3) / (LEADERBOARD_UPDATE_INTERVAL * 1e3))) {
        updateLeaderboard();
      }
      return;
    }
    matchTimer += dt;
    if (kingCelebrationPause > 0) {
      kingCelebrationPause -= dt;
      if (kingCelebrationPause <= 0) {
        dismissCelebration();
      }
      if (kingCelebrationPause > 0) {
        updateEffects(dt);
        updateCamera(dt);
        updateHUD();
        minimapRefreshTimer -= dt;
        if (minimapRefreshTimer <= 0) {
          minimapRefreshTimer = MINIMAP_UPDATE_INTERVAL;
          refreshMinimapCache();
        }
        return;
      }
    }
    if (regionTransitionPause > 0 || _seaCeremonyState !== "idle") {
      if (regionTransitionPause > 0)
        regionTransitionPause -= dt;
      if (_seaCeremonyState !== "idle") {
        updateSeaCompletionSequence(dt);
      }
      if (regionTransitionPause <= 0 && _seaCeremonyState === "idle" && playerNarwhal && !playerNarwhal.dying) {
      }
      if (regionTransitionPause > 0 || _seaCeremonyState !== "idle") {
        updateEffects(dt);
        updateCamera(dt);
        updateHUD();
        minimapRefreshTimer -= dt;
        if (minimapRefreshTimer <= 0) {
          minimapRefreshTimer = MINIMAP_UPDATE_INTERVAL;
          refreshMinimapCache();
        }
        return;
      }
    }
    _atlasCheckTimer -= dt;
    if (_atlasCheckTimer <= 0) {
      _atlasCheckTimer = 1.5;
      const liveScore = getAtlasLiveScore();
      const expeditionMax = getExpeditionMaxScore();
      const shouldBeTheme = getAtlasThemeForScore(liveScore);
      if (liveScore >= expeditionMax && _seaCeremonyState === "idle" && !_seaCeremonyTriggered && !_pendingNewExpedition) {
        startSeaCompletionCeremony(activeAtlasTheme, null, true);
      } else if (shouldBeTheme.id !== activeAtlasTheme.id && _seaCeremonyState === "idle" && !_seaCeremonyTriggered && !_pendingNewExpedition) {
        const isFinal = false;
        startSeaCompletionCeremony(activeAtlasTheme, shouldBeTheme, isFinal);
      } else if (shouldBeTheme.id === activeAtlasTheme.id) {
        updateAtlasUI();
        if (!_pendingNewExpedition && _seaCeremonyState === "idle") {
          _seaCeremonyTriggered = false;
        }
      }
    }
    _persistenceSaveTimer -= dt;
    if (_persistenceSaveTimer <= 0) {
      _persistenceSaveTimer = 20;
      if (commitCurrentRunToAtlas() > 0) {
        saveProgressIfNeeded();
        submitTotalScoreIfNeeded();
      }
    }
    earlyCalm = computeEarlyCalm();
    updateDynamicDifficulty(dt);
    if (matchTimer - lastKillCleanTime >= 1) {
      cleanRecentKills();
    }
    if (isPlayerDead) {
      deathTimer -= dt * 1e3;
      if (deathTimer <= 0 && (!atlasPanelEl || atlasPanelEl.classList.contains("hidden")))
        respawnPlayer();
    }
    updatePlayerInput();
    if (playerNarwhal)
      playerNarwhal.update(dt);
    updateAINarwhals(dt);
    updateOrbs(dt);
    updateDecoFish(dt);
    updateTurtles(dt);
    updateBubbleFields(dt);
    applyBubbleFieldBonus(dt);
    updateOrcaPredator(dt);
    updateKrakenPresence(dt);
    updateWreckPresence(dt);
    resolveAllCombat();
    updateEffects(dt);
    updateEvolutionQueue(dt);
    updateCamera(dt);
    updateLeaderFlags();
    updateAlphaHunt(dt);
    updateGoldParticles(dt);
    updateHUD();
    minimapRefreshTimer -= dt;
    if (minimapRefreshTimer <= 0) {
      minimapRefreshTimer = MINIMAP_UPDATE_INTERVAL;
      refreshMinimapCache();
    }
    if (Math.floor(timestamp / (LEADERBOARD_UPDATE_INTERVAL * 1e3)) !== Math.floor((timestamp - dt * 1e3) / (LEADERBOARD_UPDATE_INTERVAL * 1e3))) {
      updateLeaderboard();
    }
  }
  function gameLoop(timestamp) {
    const rawDt = (timestamp - lastTime) / 1e3;
    lastTime = timestamp;
    const dt = clamp(rawDt || MIN_DT, MIN_DT, MAX_DT);
    refreshArenaCache();
    updatePerfGovernor(rawDt > 0 ? rawDt : dt);
    if (gameMode === "play") {
      if (settingsPaused || atlasPanelPaused) {
      } else if (hitStopTimer > 0) {
        hitStopTimer = Math.max(0, hitStopTimer - dt);
        updateEffects(dt * 0.35);
      } else {
        updateGame(dt, timestamp);
      }
    }
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
  }
  function editLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1e3;
    lastTime = timestamp;
    dt = clamp(dt || MIN_DT, MIN_DT, MAX_DT);
    refreshArenaCache();
    for (const orb of orbs)
      orb.update(dt);
    for (const orb of superOrbs)
      orb.update(dt);
    updateDecoFish(dt);
    updateTurtles(dt);
    updateBubbleFields(dt);
    if (orcaPredator)
      orcaPredator.visualPhase += dt * 3;
    updateKrakenPresence(dt);
    updateWreckPresence(dt);
    if (playerNarwhal)
      playerNarwhal.visualPhase += dt * 3;
    for (const narwhal of aiNarwhals)
      narwhal.visualPhase += dt * 3;
    updateEffects(dt);
    updateLeaderFlags();
    updateHUD();
    minimapRefreshTimer -= dt;
    if (minimapRefreshTimer <= 0) {
      minimapRefreshTimer = MINIMAP_UPDATE_INTERVAL;
      refreshMinimapCache();
    }
    render();
    if (Math.floor(timestamp / 500) !== Math.floor((timestamp - dt * 1e3) / 500))
      updateLeaderboard();
    animationFrameId = requestAnimationFrame(editLoop);
  }
  function applyTranslationsToDOM() {
    const btn = document.getElementById("start-play-btn");
    if (btn)
      btn.textContent = t("play");
    const status = document.getElementById("start-status");
    if (status && status.textContent.includes("Load"))
      status.textContent = t("loading");
    const deathTitle = document.getElementById("death-title");
    if (deathTitle)
      deathTitle.textContent = t("cracked");
    const respawn = document.getElementById("respawn-btn");
    if (respawn)
      respawn.textContent = t("respawn");
    const labels = document.querySelectorAll(".death-stat-label");
    if (labels.length >= 2) {
      labels[0].textContent = t("score");
      labels[1].textContent = t("kills");
    }
    const recordLabel = document.getElementById("death-record-label");
    if (recordLabel)
      recordLabel.textContent = t("record") + ":";
    const totalLabel = document.getElementById("death-total-label");
    if (totalLabel)
      totalLabel.textContent = t("total") + ":";
    const taglineEl = document.getElementById("start-tagline");
    if (taglineEl)
      taglineEl.textContent = t("tagline");
    const jHintLabel = document.querySelector("#joystick-hint .hint-label");
    if (jHintLabel)
      jHintLabel.textContent = t("hintDragLabel");
    const bHintLabel = document.querySelector("#boost-hint .hint-label");
    if (bHintLabel)
      bHintLabel.textContent = t("hintBoostLabel");
    const soundLabels = document.querySelectorAll(".settings-row-label");
    if (soundLabels.length >= 2) {
      soundLabels[0].textContent = t("musicLabel");
      soundLabels[1].textContent = t("sfxLabel");
    }
    const settingsTitle = document.querySelector(".settings-title");
    if (settingsTitle)
      settingsTitle.textContent = "\u2699\uFE0F " + (t("settingsTitle") || "SETTINGS");
    const settingsSwapText = document.querySelector("#settings-swap-btn .settings-action-text");
    if (settingsSwapText)
      settingsSwapText.textContent = t("settingsSwap") || "Swap Joystick";
    const settingsCloseText = document.getElementById("settings-close-btn");
    if (settingsCloseText)
      settingsCloseText.textContent = t("settingsResume") || "\u25B6 RESUME";
    const settingsAtlasText = document.querySelector("#settings-atlas-btn .settings-action-text");
    if (settingsAtlasText)
      settingsAtlasText.textContent = atlasText("title");
    const deathAtlasText = document.querySelector("#death-atlas-btn .death-atlas-btn-text");
    if (deathAtlasText)
      deathAtlasText.textContent = atlasText("title");
  }
  async function run(mode) {
    if (typeof lib !== "undefined" && lib.log)
      lib.log("Narwhal.io run(): " + mode);
    if (animationFrameId)
      cancelAnimationFrame(animationFrameId);
    gameMode = mode;
    currentLang = detectLanguage();
    ensureRuntimeConfig();
    canvas = document.getElementById("game-canvas");
    if (!canvas)
      throw new Error("Missing #game-canvas");
    ctx = canvas.getContext("2d");
    perfQuality = selectInitialPerfQuality();
    applyPerfQuality();
    leaderboardEl = document.getElementById("leaderboard-entries");
    massValueEl = document.getElementById("mass-value");
    tierValueEl = document.getElementById("tier-value");
    boostFillEl = document.getElementById("boost-fill");
    boostButtonEl = document.getElementById("boost-button");
    deathOverlay = document.getElementById("death-overlay");
    finalMassEl = document.getElementById("final-mass");
    deathRunKillsEl = document.getElementById("death-run-kills");
    deathBestMassEl = document.getElementById("death-best-mass");
    respawnBtn = document.getElementById("respawn-btn");
    if (respawnBtn && !respawnBtn.dataset.bound) {
      respawnBtn.dataset.bound = "true";
      respawnBtn.addEventListener("click", () => {
        if (isPlayerDead && (!atlasPanelEl || atlasPanelEl.classList.contains("hidden")))
          respawnPlayer();
      });
    }
    joystickContainer = document.getElementById("joystick-container");
    joystickBase = document.getElementById("joystick-base");
    joystickKnob = document.getElementById("joystick-knob");
    evolutionBannerEl = document.getElementById("evolution-banner");
    evolutionTierEl = document.getElementById("evolution-tier");
    evolutionNameEl = document.getElementById("evolution-name");
    controlsHintEl = document.getElementById("controls-hint");
    powerupStatusEl = document.getElementById("powerup-status");
    powerupTimeEl = document.getElementById("powerup-time");
    alphaHuntEl = document.getElementById("alpha-hunt-status");
    alphaHuntLabelEl = document.getElementById("alpha-hunt-label");
    alphaHuntFillEl = document.getElementById("alpha-hunt-fill");
    alphaHuntResultEl = document.getElementById("alpha-hunt-result");
    alphaHuntBonusEl = document.getElementById("alpha-hunt-bonus");
    alphaAnnounceEl = document.getElementById("alpha-hunt-announce");
    alphaAnnounceTitleEl = document.getElementById("alpha-announce-title");
    alphaAnnounceSubEl = document.getElementById("alpha-announce-sub");
    atlasToggleEl = document.getElementById("atlas-toggle");
    seaProgressButtonEl = document.getElementById("sea-progress-button");
    seaProgressFillEl = document.getElementById("sea-progress-fill");
    seaProgressLabelEl = document.getElementById("sea-progress-label");
    seaProgressPercentEl = document.getElementById("sea-progress-percent");
    atlasPanelEl = document.getElementById("atlas-panel");
    atlasPercentEl = document.getElementById("atlas-percent");
    atlasProgressFillEl = document.getElementById("atlas-progress-fill");
    atlasCurrentEl = document.getElementById("atlas-current");
    atlasStagesEl = document.getElementById("atlas-stages");
    atlasCelebrationEl = document.getElementById("atlas-celebration");
    regionTransitionEl = document.getElementById("region-transition");
    deathAtlasEl = document.getElementById("death-atlas-line");
    applyTranslationsToDOM();
    if (typeof lib !== "undefined" && lib.showGameParameters) {
      lib.showGameParameters({
        name: "Narwhal.io Settings",
        params: {
          "Arena Width": {
            key: "gameConfig.arena.width",
            type: "slider",
            min: 2600,
            max: 5200,
            step: 100,
            onChange: (value) => {
              window.gameConfig.arena.width = value;
              if (gameMode === "edit")
                initGame();
            }
          },
          "Arena Height": {
            key: "gameConfig.arena.height",
            type: "slider",
            min: 2600,
            max: 5200,
            step: 100,
            onChange: (value) => {
              window.gameConfig.arena.height = value;
              if (gameMode === "edit")
                initGame();
            }
          },
          "Player Color": {
            key: "gameConfig.narwhal.playerColor",
            type: "color",
            onChange: (value) => {
              window.gameConfig.narwhal.playerColor = value;
              if (playerNarwhal)
                playerNarwhal.color = value;
            }
          },
          "Starting Mass": {
            key: "gameConfig.narwhal.initialMass",
            type: "slider",
            min: 1,
            max: 16,
            step: 1,
            onChange: (value) => {
              window.gameConfig.narwhal.initialMass = value;
              if (gameMode === "edit")
                initGame();
            }
          },
          "Base Speed": {
            key: "gameConfig.narwhal.speed",
            type: "slider",
            min: 130,
            max: 260,
            step: 5,
            onChange: (value) => {
              window.gameConfig.narwhal.speed = value;
              if (playerNarwhal)
                playerNarwhal.baseSpeed = value;
              for (const narwhal of aiNarwhals)
                narwhal.baseSpeed = value;
            }
          },
          "Turn Speed": {
            key: "gameConfig.narwhal.turnSpeed",
            type: "slider",
            min: 4,
            max: 30,
            step: 0.1,
            onChange: (value) => {
              window.gameConfig.narwhal.turnSpeed = value;
              if (playerNarwhal)
                playerNarwhal.turnSpeed = value;
              for (const narwhal of aiNarwhals)
                narwhal.turnSpeed = value;
            }
          },
          "Food Count": {
            key: "gameConfig.orbs.count",
            type: "slider",
            min: 80,
            max: 220,
            step: 5,
            onChange: (value) => {
              window.gameConfig.orbs.count = value;
              if (gameMode === "edit")
                initGame();
            }
          },
          "Rival Narwhals": {
            key: "gameConfig.ai.count",
            type: "slider",
            min: 6,
            max: 30,
            step: 1,
            onChange: (value) => {
              window.gameConfig.ai.count = value;
              if (gameMode === "edit")
                initGame();
            }
          },
          "AI Base Difficulty": {
            key: "gameConfig.ai.difficulty",
            type: "dropdown",
            options: [
              { label: "Easy (adaptive)", value: "Easy" },
              { label: "Medium (adaptive)", value: "Medium" },
              { label: "Hard (adaptive)", value: "Hard" }
            ],
            onChange: (value) => {
              window.gameConfig.ai.difficulty = value;
            }
          },
          "Boost Speed": {
            key: "gameConfig.boost.multiplier",
            type: "slider",
            min: 1.5,
            max: 3.2,
            step: 0.05,
            onChange: (value) => {
              window.gameConfig.boost.multiplier = value;
            }
          },
          "Boost Duration": {
            key: "gameConfig.boost.drainPerSecond",
            type: "slider",
            min: 20,
            max: 90,
            step: 1,
            onChange: (value) => {
              window.gameConfig.boost.drainPerSecond = value;
            }
          },
          "Tusk Length": {
            key: "gameConfig.combat.hornLength",
            type: "slider",
            min: 20,
            max: 62,
            step: 1,
            onChange: (value) => {
              window.gameConfig.combat.hornLength = value;
              if (playerNarwhal)
                playerNarwhal.updateDerivedStats();
              for (const narwhal of aiNarwhals)
                narwhal.updateDerivedStats();
            }
          },
          "Water Color": {
            key: "gameConfig.visual.backgroundColor",
            type: "color",
            onChange: (value) => {
              window.gameConfig.visual.backgroundColor = value;
              backgroundPattern = null;
              decoFishTintedSprites = {};
            }
          },
          "Show Grid": {
            key: "gameConfig.visual.gridVisible",
            type: "checkbox",
            onChange: (value) => {
              window.gameConfig.visual.gridVisible = value;
            }
          },
          "Camera Zoom": {
            key: "gameConfig.visual.cameraZoom",
            type: "slider",
            min: 0.96,
            max: 1.06,
            step: 0.01,
            onChange: (value) => {
              window.gameConfig.visual.cameraZoom = value;
            }
          }
        }
      });
    }
    await loadPersistentProgress();
    submitTotalScoreIfNeeded();
    await loadAssets();
    updateAtlasUI();
    if (!window._narwhalPersistenceListenersAdded) {
      window._narwhalPersistenceListenersAdded = true;
      window.addEventListener("pagehide", () => {
        commitCurrentRunToAtlas();
        submitTotalScoreIfNeeded();
        saveProgressIfNeeded();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          commitCurrentRunToAtlas();
          submitTotalScoreIfNeeded();
          saveProgressIfNeeded();
        }
      });
    }
    const soundToggleBtn = document.getElementById("sound-toggle");
    if (soundToggleBtn && !soundToggleBtn.dataset.bound) {
      soundToggleBtn.dataset.bound = "true";
      soundToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        resumeAudio();
        toggleSoundPanel();
      });
      soundToggleBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const musicSlider = document.getElementById("music-volume-slider");
    const sfxSlider = document.getElementById("sfx-volume-slider");
    const settingsCard = document.getElementById("settings-card");
    if (musicSlider && !musicSlider.dataset.bound) {
      musicSlider.dataset.bound = "true";
      musicSlider.value = Math.round(musicVolume * 100);
      musicSlider.addEventListener("input", (e) => {
        e.stopPropagation();
        resumeAudio();
        const val = parseInt(e.target.value);
        setMusicVolume(val / 100);
        const label = document.getElementById("music-vol-val");
        if (label)
          label.textContent = val;
        if (!backgroundMusicSource && musicVolume > 0)
          playBackgroundMusic();
      });
      musicSlider.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    if (sfxSlider && !sfxSlider.dataset.bound) {
      sfxSlider.dataset.bound = "true";
      sfxSlider.value = Math.round(sfxVolume * 100);
      sfxSlider.addEventListener("input", (e) => {
        e.stopPropagation();
        resumeAudio();
        const val = parseInt(e.target.value);
        setSfxVolume(val / 100);
        const label = document.getElementById("sfx-vol-val");
        if (label)
          label.textContent = val;
      });
      sfxSlider.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    if (settingsCard && !settingsCard.dataset.bound) {
      settingsCard.dataset.bound = "true";
      settingsCard.addEventListener("pointerdown", (e) => e.stopPropagation());
      settingsCard.addEventListener("click", (e) => e.stopPropagation());
    }
    const settingsCloseBtn = document.getElementById("settings-close-btn");
    if (settingsCloseBtn && !settingsCloseBtn.dataset.bound) {
      settingsCloseBtn.dataset.bound = "true";
      settingsCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeSettingsOverlay();
      });
      settingsCloseBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const settingsBackdrop = document.getElementById("settings-backdrop");
    if (settingsBackdrop && !settingsBackdrop.dataset.bound) {
      settingsBackdrop.dataset.bound = "true";
      settingsBackdrop.addEventListener("click", (e) => {
        e.stopPropagation();
        closeSettingsOverlay();
      });
    }
    const settingsSwapBtn = document.getElementById("settings-swap-btn");
    if (settingsSwapBtn && !settingsSwapBtn.dataset.bound) {
      settingsSwapBtn.dataset.bound = "true";
      settingsSwapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.body.classList.toggle("controls-swapped");
        const isSwapped = document.body.classList.contains("controls-swapped");
        settingsSwapBtn.classList.toggle("active-swap", isSwapped);
        const swapStatus = document.getElementById("settings-swap-status");
        if (swapStatus)
          swapStatus.textContent = isSwapped ? "ON" : "OFF";
      });
      settingsSwapBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const settingsAtlasBtn = document.getElementById("settings-atlas-btn");
    if (settingsAtlasBtn && !settingsAtlasBtn.dataset.bound) {
      settingsAtlasBtn.dataset.bound = "true";
      settingsAtlasBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeSettingsOverlay();
        setAtlasPanelOpen(true);
      });
      settingsAtlasBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    if (!canvas.dataset.soundPanelBound) {
      canvas.dataset.soundPanelBound = "true";
      canvas.addEventListener("pointerdown", () => {
        if (soundPanelOpen)
          closeSettingsOverlay();
      }, { once: false });
    }
    if (atlasToggleEl && !atlasToggleEl.dataset.bound) {
      atlasToggleEl.dataset.bound = "true";
      atlasToggleEl.addEventListener("click", (e) => {
        e.stopPropagation();
        setAtlasPanelOpen(!atlasPanelEl || atlasPanelEl.classList.contains("hidden"));
      });
      atlasToggleEl.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    if (seaProgressButtonEl && !seaProgressButtonEl.dataset.bound) {
      seaProgressButtonEl.dataset.bound = "true";
      seaProgressButtonEl.addEventListener("click", (e) => {
        e.stopPropagation();
        setAtlasPanelOpen(true);
      });
      seaProgressButtonEl.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const atlasCloseBtn = document.getElementById("atlas-close");
    if (atlasCloseBtn && !atlasCloseBtn.dataset.bound) {
      atlasCloseBtn.dataset.bound = "true";
      atlasCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setAtlasPanelOpen(false);
      });
      atlasCloseBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const deathAtlasBtn = document.getElementById("death-atlas-btn");
    if (deathAtlasBtn && !deathAtlasBtn.dataset.bound) {
      deathAtlasBtn.dataset.bound = "true";
      deathAtlasBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setAtlasPanelOpen(true);
      });
      deathAtlasBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const atlasBackdrop = document.getElementById("atlas-panel-backdrop");
    if (atlasBackdrop && !atlasBackdrop.dataset.bound) {
      atlasBackdrop.dataset.bound = "true";
      atlasBackdrop.addEventListener("click", (e) => {
        e.stopPropagation();
        setAtlasPanelOpen(false);
      });
    }
    const swapBtn = document.getElementById("swap-controls");
    if (swapBtn && !swapBtn.dataset.bound) {
      swapBtn.dataset.bound = "true";
      swapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.body.classList.toggle("controls-swapped");
      });
      swapBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    }
    const startButton = document.getElementById("start-play-btn");
    if (startButton && !startButton.dataset.bound) {
      startButton.dataset.bound = "true";
      startButton.addEventListener("click", () => {
        resumeAudio();
        const startScreen = document.getElementById("start-screen");
        const gameWorld = document.getElementById("game-world");
        if (startScreen)
          startScreen.classList.add("hidden");
        if (gameWorld)
          gameWorld.classList.remove("hidden");
        if (window._narwhalStartGame)
          window._narwhalStartGame();
      });
    }
    if (mode === "edit") {
      const startScreen = document.getElementById("start-screen");
      const gameWorld = document.getElementById("game-world");
      if (startScreen)
        startScreen.classList.add("hidden");
      if (gameWorld)
        gameWorld.classList.remove("hidden");
      setupInputHandlers();
      initGame();
      lastTime = performance.now();
      if (animationFrameId)
        cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(editLoop);
    } else {
      window._narwhalStartGame = function() {
        setupInputHandlers();
        initGame();
        lastTime = performance.now();
        if (animationFrameId)
          cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      const startScreen = document.getElementById("start-screen");
      if (startScreen && startScreen.classList.contains("hidden")) {
        window._narwhalStartGame();
      }
    }
  }
  if (typeof window !== "undefined")
    window.run = run;
})();
