// Centralized localization. To add a language (e.g. Traditional Chinese 'zh-Hant'),
// add an entry to LANGS and a full dictionary to STRINGS; missing keys fall back to English.

export const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'zh', label: '简体中文' },
];

const STRINGS = {
    en: {
        title1: 'TAXI SORT', title2: 'CITY RUSH',
        daily: '📅 Daily', skins: '🚕 Skins', settings: '⚙ Settings', play: 'Play Level {n}', back: 'Back',
        skinsTitle: 'Taxi Skins', missionsTitle: 'Daily Missions', missionsSub: 'New missions every day',
        claimed: 'Claimed', equipped: 'Equipped', equip: 'Equip',
        cleared: 'City Cleared! 🎉', double: '2x Coins', next: 'Next Level', cityMap: 'City Map', continue: 'Continue',
        jammed: 'Jammed!', timeUp: "Time's Up!", jamText: 'The waiting area is full of unmatched taxis.',
        timeText: 'The passengers got tired of waiting.', revive: 'Revive', retry: 'Retry',
        ad: 'AD', adPlaceholder: 'REWARDED AD PLACEHOLDER', adReward: 'Reward: {r}', adClose: 'Close (no reward)',
        undo: 'Undo', slot: '+1 Slot', adUndo: 'Undo last move', adSlot: '+1 waiting slot',
        toastFull: 'Waiting area full!', toastWait: 'Wait for the cars to park', toastUndone: 'Move undone',
        toastSlot: '+1 waiting slot!', toastRevived: 'Revived! Keep sorting!',
        combo: '🔥 Combo x{n}! +{c}🪙', miniDone: '⭐ Mini goal! +{c}🪙', dailyDone: '📅 Daily mission done: {m}',
        tut1: 'Tap a free taxi to send it out!', tut2: 'Buses carry 6 passengers!', tut3: 'Watch out for the cones!',
        tut4: '? cars show their color once their way out is clear', tutVip: '👑 VIPs pay 3x if you pick them up fast!',
        levelLabel: '{d} · Level {n}', waiting: '🧍 {n} waiting · ⏱ {t}s',
        stats: '{taps} taps · {blocked} blocked · {time}s left · {spare} free slots',
        coinsEarned: '+{n} coins earned', newBadge: ' (new badge +{n})', coins2x: '+{n} coins earned (2x!)',
        miniGoal: 'Clear {n} {c} in a row', miniLabel: 'Mini: {text}',
        goal_taps: 'Clear in {n} taps or fewer', goal_noextra: 'No extra slot or revive', goal_time: 'Finish with {n}s+ left',
        goal_spare: 'Always keep 1 slot free', goal_noblock: 'Zero blocked taps',
        m_taxis: 'Send off {n} vehicles', m_wins: 'Clear {n} levels', m_combos: 'Hit {n} combos (x3+)',
        m_buses: 'Fill {n} buses', m_gold: 'Get a 3-badge win', m_minis: 'Complete {n} mini goals',
        c0: 'Yellow', c1: 'Red', c2: 'Blue', c3: 'Green', c4: 'Purple', c5: 'Orange', c6: 'Pink', c7: 'Cyan',
        d0: 'Downtown', d1: 'Harbor', d2: 'Old Town', d3: 'Airport', d4: 'Tech Park', d5: 'Skyline',
        s_classic: 'Classic', s_checker: 'Checker', s_retro: 'Retro Top', s_neon: 'Neon Glow', s_gold: 'Gold VIP',
        language: 'Language', sound: 'Sound', on: 'On', off: 'Off',
        vipWaiting: '👑 A VIP wants a {c} ride. Hurry!', vipDone: '👑 VIP delivered! 3x coins +{n}🪙',
        vipMissed: 'The VIP got impatient. No bonus.', vipHud: '👑 {t}s',
        bonusNode: 'Bonus', bonusLabel: '🎁 Bonus Rush', bonusTut: '60 seconds: deliver as many passengers as you can!',
        bonusResult: 'Bonus Rush Over! 🎁', bonusText: '{p} passengers delivered', bonusPax: '🧍 {p} delivered · ⏱ {t}s',
        newBoard: 'A new lot is rolling in!',
        chNode: 'Challenge', chLabel: '🏆 Challenge · Level {n}', chTut: 'Only {s} slots. Plan your moves carefully!',
        chWin: 'Challenge Complete! 🏆', chReward: 'Challenge reward +{n}🪙',
    },
    tr: {
        title1: 'TAKSİ SIRALA', title2: 'ŞEHİR TELAŞI',
        daily: '📅 Günlük', skins: '🚕 Görünümler', settings: '⚙ Ayarlar', play: '{n}. Bölümü Oyna', back: 'Geri',
        skinsTitle: 'Taksi Görünümleri', missionsTitle: 'Günlük Görevler', missionsSub: 'Her gün yeni görevler',
        claimed: 'Alındı', equipped: 'Takılı', equip: 'Kullan',
        cleared: 'Şehir Temizlendi! 🎉', double: '2x Altın', next: 'Sonraki Bölüm', cityMap: 'Şehir Haritası', continue: 'Devam',
        jammed: 'Tıkandı!', timeUp: 'Süre Doldu!', jamText: 'Bekleme alanı eşleşmeyen taksilerle doldu.',
        timeText: 'Yolcular beklemekten sıkıldı.', revive: 'Devam Et', retry: 'Tekrar Dene',
        ad: 'REKLAM', adPlaceholder: 'ÖDÜLLÜ REKLAM (YER TUTUCU)', adReward: 'Ödül: {r}', adClose: 'Kapat (ödül yok)',
        undo: 'Geri Al', slot: '+1 Alan', adUndo: 'Son hamleyi geri al', adSlot: '+1 bekleme alanı',
        toastFull: 'Bekleme alanı dolu!', toastWait: 'Araçların park etmesini bekle', toastUndone: 'Hamle geri alındı',
        toastSlot: '+1 bekleme alanı!', toastRevived: 'Yeniden başladın! Sıralamaya devam!',
        combo: '🔥 Kombo x{n}! +{c}🪙', miniDone: '⭐ Mini hedef! +{c}🪙', dailyDone: '📅 Günlük görev tamam: {m}',
        tut1: 'Önü açık bir taksiye dokun, yola çıksın!', tut2: 'Otobüsler 6 yolcu taşır!', tut3: 'Dubalara dikkat!',
        tut4: '? araçlar, yolları açılınca rengini gösterir', tutVip: '👑 VIP yolcuyu hızlı alırsan 3 kat altın kazanırsın!',
        levelLabel: '{d} · {n}. Bölüm', waiting: '🧍 {n} bekliyor · ⏱ {t} sn',
        stats: '{taps} dokunuş · {blocked} engel · {time} sn kaldı · {spare} boş alan',
        coinsEarned: '+{n} altın kazandın', newBadge: ' (yeni rozet +{n})', coins2x: '+{n} altın kazandın (2x!)',
        miniGoal: 'Art arda {n} {c} taksi gönder', miniLabel: 'Mini: {text}',
        goal_taps: 'En fazla {n} dokunuşla bitir', goal_noextra: 'Ek alan veya devam kullanma', goal_time: 'En az {n} sn kala bitir',
        goal_spare: 'Her zaman 1 alanı boş tut', goal_noblock: 'Hiç engelli dokunuş yapma',
        m_taxis: '{n} araç gönder', m_wins: '{n} bölüm bitir', m_combos: '{n} kombo yap (x3+)',
        m_buses: '{n} otobüs doldur', m_gold: '3 rozetle kazan', m_minis: '{n} mini hedef tamamla',
        c0: 'sarı', c1: 'kırmızı', c2: 'mavi', c3: 'yeşil', c4: 'mor', c5: 'turuncu', c6: 'pembe', c7: 'turkuaz',
        d0: 'Şehir Merkezi', d1: 'Liman', d2: 'Eski Şehir', d3: 'Havalimanı', d4: 'Teknopark', d5: 'Gökdelenler',
        s_classic: 'Klasik', s_checker: 'Damalı', s_retro: 'Retro Tavan', s_neon: 'Neon Işıltı', s_gold: 'Altın VIP',
        language: 'Dil', sound: 'Ses', on: 'Açık', off: 'Kapalı',
        vipWaiting: '👑 VIP yolcu {c} taksi istiyor. Acele et!', vipDone: '👑 VIP teslim edildi! 3x altın +{n}🪙',
        vipMissed: 'VIP yolcunun sabrı tükendi. Bonus yok.', vipHud: '👑 {t} sn',
        bonusNode: 'Bonus', bonusLabel: '🎁 Bonus Koşusu', bonusTut: '60 saniye: olabildiğince çok yolcu taşı!',
        bonusResult: 'Bonus Koşusu Bitti! 🎁', bonusText: '{p} yolcu taşındı', bonusPax: '🧍 {p} taşındı · ⏱ {t} sn',
        newBoard: 'Yeni otopark geliyor!',
        chNode: 'Meydan Okuma', chLabel: '🏆 Meydan Okuma · {n}. Bölüm', chTut: 'Sadece {s} alan var. Hamlelerini iyi planla!',
        chWin: 'Meydan Okuma Tamam! 🏆', chReward: 'Meydan okuma ödülü +{n}🪙',
    },
    de: {
        title1: 'TAXI SORT', title2: 'STADT-RUSH',
        daily: '📅 Täglich', skins: '🚕 Designs', settings: '⚙ Einstellungen', play: 'Level {n} spielen', back: 'Zurück',
        skinsTitle: 'Taxi-Designs', missionsTitle: 'Tagesmissionen', missionsSub: 'Jeden Tag neue Missionen',
        claimed: 'Abgeholt', equipped: 'Aktiv', equip: 'Wählen',
        cleared: 'Stadt geräumt! 🎉', double: '2x Münzen', next: 'Nächstes Level', cityMap: 'Stadtkarte', continue: 'Weiter',
        jammed: 'Verstopft!', timeUp: 'Zeit abgelaufen!', jamText: 'Der Wartebereich ist voller unpassender Taxis.',
        timeText: 'Die Fahrgäste hatten keine Geduld mehr.', revive: 'Wiederbeleben', retry: 'Nochmal',
        ad: 'WERBUNG', adPlaceholder: 'PLATZHALTER FÜR BELOHNUNGSWERBUNG', adReward: 'Belohnung: {r}', adClose: 'Schließen (keine Belohnung)',
        undo: 'Rückgängig', slot: '+1 Platz', adUndo: 'Letzten Zug rückgängig', adSlot: '+1 Warteplatz',
        toastFull: 'Wartebereich voll!', toastWait: 'Warte, bis die Autos geparkt haben', toastUndone: 'Zug rückgängig gemacht',
        toastSlot: '+1 Warteplatz!', toastRevived: 'Wiederbelebt! Weiter sortieren!',
        combo: '🔥 Combo x{n}! +{c}🪙', miniDone: '⭐ Mini-Ziel! +{c}🪙', dailyDone: '📅 Tagesmission erfüllt: {m}',
        tut1: 'Tippe auf ein freies Taxi, um es loszuschicken!', tut2: 'Busse fassen 6 Fahrgäste!', tut3: 'Achtung, Leitkegel!',
        tut4: '?-Autos zeigen ihre Farbe, sobald ihr Weg frei ist', tutVip: '👑 VIPs zahlen das Dreifache, wenn du sie schnell abholst!',
        levelLabel: '{d} · Level {n}', waiting: '🧍 {n} warten · ⏱ {t} s',
        stats: '{taps} Tipps · {blocked} blockiert · {time} s übrig · {spare} freie Plätze',
        coinsEarned: '+{n} Münzen verdient', newBadge: ' (neues Abzeichen +{n})', coins2x: '+{n} Münzen verdient (2x!)',
        miniGoal: '{n} {c} Taxis nacheinander losschicken', miniLabel: 'Mini: {text}',
        goal_taps: 'Mit höchstens {n} Tipps schaffen', goal_noextra: 'Ohne Extraplatz oder Wiederbelebung', goal_time: 'Mit {n}+ s Restzeit beenden',
        goal_spare: 'Immer 1 Platz frei lassen', goal_noblock: 'Kein einziger blockierter Tipp',
        m_taxis: '{n} Fahrzeuge losschicken', m_wins: '{n} Level schaffen', m_combos: '{n} Combos schaffen (x3+)',
        m_buses: '{n} Busse füllen', m_gold: 'Mit 3 Abzeichen gewinnen', m_minis: '{n} Mini-Ziele erfüllen',
        c0: 'gelbe', c1: 'rote', c2: 'blaue', c3: 'grüne', c4: 'lila', c5: 'orange', c6: 'rosa', c7: 'türkise',
        d0: 'Innenstadt', d1: 'Hafen', d2: 'Altstadt', d3: 'Flughafen', d4: 'Technologiepark', d5: 'Skyline',
        s_classic: 'Klassisch', s_checker: 'Karomuster', s_retro: 'Retro-Dach', s_neon: 'Neonglühen', s_gold: 'Gold-VIP',
        language: 'Sprache', sound: 'Ton', on: 'An', off: 'Aus',
        vipWaiting: '👑 Ein VIP wartet auf {c} Taxis. Beeil dich!', vipDone: '👑 VIP abgeliefert! 3x Münzen +{n}🪙',
        vipMissed: 'Der VIP wurde ungeduldig. Kein Bonus.', vipHud: '👑 {t} s',
        bonusNode: 'Bonus', bonusLabel: '🎁 Bonus-Rush', bonusTut: '60 Sekunden: Befördere so viele Fahrgäste wie möglich!',
        bonusResult: 'Bonus-Rush vorbei! 🎁', bonusText: '{p} Fahrgäste befördert', bonusPax: '🧍 {p} befördert · ⏱ {t} s',
        newBoard: 'Ein neuer Parkplatz rollt an!',
        chNode: 'Herausforderung', chLabel: '🏆 Herausforderung · Level {n}', chTut: 'Nur {s} Plätze. Plane deine Züge genau!',
        chWin: 'Herausforderung geschafft! 🏆', chReward: 'Herausforderungsbonus +{n}🪙',
    },
    es: {
        title1: 'TAXI SORT', title2: 'CIUDAD A TOPE',
        daily: '📅 Diario', skins: '🚕 Aspectos', settings: '⚙ Ajustes', play: 'Jugar nivel {n}', back: 'Volver',
        skinsTitle: 'Aspectos de taxi', missionsTitle: 'Misiones diarias', missionsSub: 'Nuevas misiones cada día',
        claimed: 'Reclamado', equipped: 'Equipado', equip: 'Equipar',
        cleared: '¡Ciudad despejada! 🎉', double: 'Monedas x2', next: 'Siguiente nivel', cityMap: 'Mapa de la ciudad', continue: 'Continuar',
        jammed: '¡Atasco!', timeUp: '¡Se acabó el tiempo!', jamText: 'La zona de espera está llena de taxis sin pasajeros.',
        timeText: 'Los pasajeros se cansaron de esperar.', revive: 'Revivir', retry: 'Reintentar',
        ad: 'ANUNCIO', adPlaceholder: 'ANUNCIO CON RECOMPENSA (MARCADOR)', adReward: 'Recompensa: {r}', adClose: 'Cerrar (sin recompensa)',
        undo: 'Deshacer', slot: '+1 plaza', adUndo: 'Deshacer el último movimiento', adSlot: '+1 plaza de espera',
        toastFull: '¡Zona de espera llena!', toastWait: 'Espera a que aparquen los coches', toastUndone: 'Movimiento deshecho',
        toastSlot: '¡+1 plaza de espera!', toastRevived: '¡Has revivido! ¡Sigue ordenando!',
        combo: '🔥 ¡Combo x{n}! +{c}🪙', miniDone: '⭐ ¡Minimeta! +{c}🪙', dailyDone: '📅 Misión diaria completada: {m}',
        tut1: '¡Toca un taxi libre para que salga!', tut2: '¡Los autobuses llevan 6 pasajeros!', tut3: '¡Cuidado con los conos!',
        tut4: 'Los coches ? muestran su color cuando tienen la salida libre', tutVip: '👑 ¡Los VIP pagan el triple si los recoges rápido!',
        levelLabel: '{d} · Nivel {n}', waiting: '🧍 {n} esperando · ⏱ {t} s',
        stats: '{taps} toques · {blocked} bloqueados · {time} s restantes · {spare} plazas libres',
        coinsEarned: '+{n} monedas ganadas', newBadge: ' (nueva insignia +{n})', coins2x: '+{n} monedas ganadas (¡x2!)',
        miniGoal: 'Despacha {n} taxis {c} seguidos', miniLabel: 'Mini: {text}',
        goal_taps: 'Termina en {n} toques o menos', goal_noextra: 'Sin plaza extra ni revivir', goal_time: 'Termina con {n} s o más',
        goal_spare: 'Mantén siempre 1 plaza libre', goal_noblock: 'Ningún toque bloqueado',
        m_taxis: 'Despacha {n} vehículos', m_wins: 'Supera {n} niveles', m_combos: 'Consigue {n} combos (x3+)',
        m_buses: 'Llena {n} autobuses', m_gold: 'Gana con 3 insignias', m_minis: 'Completa {n} minimetas',
        c0: 'amarillos', c1: 'rojos', c2: 'azules', c3: 'verdes', c4: 'morados', c5: 'naranjas', c6: 'rosas', c7: 'turquesa',
        d0: 'Centro', d1: 'Puerto', d2: 'Casco Antiguo', d3: 'Aeropuerto', d4: 'Parque Tecnológico', d5: 'Rascacielos',
        s_classic: 'Clásico', s_checker: 'Ajedrezado', s_retro: 'Techo retro', s_neon: 'Brillo neón', s_gold: 'VIP dorado',
        language: 'Idioma', sound: 'Sonido', on: 'Sí', off: 'No',
        vipWaiting: '👑 Un VIP espera los taxis {c}. ¡Rápido!', vipDone: '👑 ¡VIP entregado! Monedas x3 +{n}🪙',
        vipMissed: 'El VIP perdió la paciencia. Sin bonificación.', vipHud: '👑 {t} s',
        bonusNode: 'Bonus', bonusLabel: '🎁 Carrera bonus', bonusTut: '60 segundos: ¡lleva a todos los pasajeros que puedas!',
        bonusResult: '¡Fin de la carrera bonus! 🎁', bonusText: '{p} pasajeros transportados', bonusPax: '🧍 {p} transportados · ⏱ {t} s',
        newBoard: '¡Llega un nuevo aparcamiento!',
        chNode: 'Desafío', chLabel: '🏆 Desafío · Nivel {n}', chTut: 'Solo {s} plazas. ¡Planea bien tus movimientos!',
        chWin: '¡Desafío superado! 🏆', chReward: 'Premio del desafío +{n}🪙',
    },
    fr: {
        title1: 'TAXI SORT', title2: 'RUSH EN VILLE',
        daily: '📅 Quotidien', skins: '🚕 Apparences', settings: '⚙ Paramètres', play: 'Jouer au niveau {n}', back: 'Retour',
        skinsTitle: 'Apparences de taxi', missionsTitle: 'Missions du jour', missionsSub: 'De nouvelles missions chaque jour',
        claimed: 'Récupéré', equipped: 'Équipé', equip: 'Équiper',
        cleared: 'Ville dégagée ! 🎉', double: 'Pièces x2', next: 'Niveau suivant', cityMap: 'Carte de la ville', continue: 'Continuer',
        jammed: 'Embouteillage !', timeUp: 'Temps écoulé !', jamText: "La zone d'attente est pleine de taxis sans passagers.",
        timeText: "Les passagers en ont eu assez d'attendre.", revive: 'Revivre', retry: 'Réessayer',
        ad: 'PUB', adPlaceholder: 'PUB RÉCOMPENSÉE (EMPLACEMENT)', adReward: 'Récompense : {r}', adClose: 'Fermer (sans récompense)',
        undo: 'Annuler', slot: '+1 place', adUndo: 'Annuler le dernier coup', adSlot: "+1 place d'attente",
        toastFull: "Zone d'attente pleine !", toastWait: 'Attends que les voitures se garent', toastUndone: 'Coup annulé',
        toastSlot: "+1 place d'attente !", toastRevived: 'De retour ! Continue à trier !',
        combo: '🔥 Combo x{n} ! +{c}🪙', miniDone: '⭐ Mini-objectif ! +{c}🪙', dailyDone: '📅 Mission du jour réussie : {m}',
        tut1: 'Touche un taxi libre pour le faire sortir !', tut2: 'Les bus transportent 6 passagers !', tut3: 'Attention aux cônes !',
        tut4: 'Les voitures ? révèlent leur couleur quand leur sortie est libre', tutVip: '👑 Les VIP paient le triple si tu les prends vite !',
        levelLabel: '{d} · Niveau {n}', waiting: '🧍 {n} en attente · ⏱ {t} s',
        stats: '{taps} touches · {blocked} bloquées · {time} s restantes · {spare} places libres',
        coinsEarned: '+{n} pièces gagnées', newBadge: ' (nouveau badge +{n})', coins2x: '+{n} pièces gagnées (x2 !)',
        miniGoal: 'Envoie {n} taxis {c} d\'affilée', miniLabel: 'Mini : {text}',
        goal_taps: 'Finir en {n} touches maximum', goal_noextra: 'Sans place en plus ni relance', goal_time: 'Finir avec {n} s ou plus',
        goal_spare: 'Toujours garder 1 place libre', goal_noblock: 'Aucune touche bloquée',
        m_taxis: 'Envoie {n} véhicules', m_wins: 'Termine {n} niveaux', m_combos: 'Réussis {n} combos (x3+)',
        m_buses: 'Remplis {n} bus', m_gold: 'Gagne avec 3 badges', m_minis: 'Réussis {n} mini-objectifs',
        c0: 'jaunes', c1: 'rouges', c2: 'bleus', c3: 'verts', c4: 'violets', c5: 'orange', c6: 'roses', c7: 'turquoise',
        d0: 'Centre-ville', d1: 'Port', d2: 'Vieille Ville', d3: 'Aéroport', d4: 'Technopole', d5: 'Gratte-ciel',
        s_classic: 'Classique', s_checker: 'Damier', s_retro: 'Toit rétro', s_neon: 'Néon', s_gold: 'VIP doré',
        language: 'Langue', sound: 'Son', on: 'Activé', off: 'Désactivé',
        vipWaiting: '👑 Un VIP attend les taxis {c}. Vite !', vipDone: '👑 VIP déposé ! Pièces x3 +{n}🪙',
        vipMissed: "Le VIP s'est impatienté. Pas de bonus.", vipHud: '👑 {t} s',
        bonusNode: 'Bonus', bonusLabel: '🎁 Rush bonus', bonusTut: '60 secondes : transporte un maximum de passagers !',
        bonusResult: 'Rush bonus terminé ! 🎁', bonusText: '{p} passagers transportés', bonusPax: '🧍 {p} transportés · ⏱ {t} s',
        newBoard: 'Un nouveau parking arrive !',
        chNode: 'Défi', chLabel: '🏆 Défi · Niveau {n}', chTut: 'Seulement {s} places. Planifie bien tes coups !',
        chWin: 'Défi réussi ! 🏆', chReward: 'Récompense du défi +{n}🪙',
    },
    zh: {
        title1: '出租车大调度', title2: '城市极速',
        daily: '📅 每日任务', skins: '🚕 车辆皮肤', settings: '⚙ 设置', play: '开始第 {n} 关', back: '返回',
        skinsTitle: '出租车皮肤', missionsTitle: '每日任务', missionsSub: '每天都有新任务',
        claimed: '已领取', equipped: '使用中', equip: '使用',
        cleared: '全城畅通！🎉', double: '金币翻倍', next: '下一关', cityMap: '城市地图', continue: '继续',
        jammed: '堵死了！', timeUp: '时间到！', jamText: '候车区停满了接不到乘客的出租车。',
        timeText: '乘客们等得不耐烦了。', revive: '复活', retry: '重试',
        ad: '广告', adPlaceholder: '激励广告（占位）', adReward: '奖励：{r}', adClose: '关闭（不领奖励）',
        undo: '撤销', slot: '+1 车位', adUndo: '撤销上一步', adSlot: '增加 1 个候车位',
        toastFull: '候车区已满！', toastWait: '等车辆停好再操作', toastUndone: '已撤销上一步',
        toastSlot: '候车位 +1！', toastRevived: '复活成功！继续调度吧！',
        combo: '🔥 {n} 连击！+{c}🪙', miniDone: '⭐ 小目标达成！+{c}🪙', dailyDone: '📅 每日任务完成：{m}',
        tut1: '点击前方畅通的出租车，让它驶出停车场！', tut2: '巴士能坐 6 名乘客！', tut3: '小心路障！',
        tut4: '“?”车辆在出路畅通后才会显示颜色', tutVip: '👑 快速接走 VIP 乘客可获得 3 倍金币！',
        levelLabel: '{d} · 第 {n} 关', waiting: '🧍 {n} 人候车 · ⏱ {t} 秒',
        stats: '点击 {taps} 次 · 受阻 {blocked} 次 · 剩余 {time} 秒 · 空闲车位 {spare} 个',
        coinsEarned: '获得 {n} 金币', newBadge: '（新徽章 +{n}）', coins2x: '获得 {n} 金币（翻倍！）',
        miniGoal: '连续送走 {n} 辆{c}出租车', miniLabel: '小目标：{text}',
        goal_taps: '点击不超过 {n} 次', goal_noextra: '不加车位、不复活', goal_time: '剩余时间不少于 {n} 秒',
        goal_spare: '始终留出 1 个空车位', goal_noblock: '一次都不点到受阻车辆',
        m_taxis: '送走 {n} 辆车', m_wins: '通过 {n} 个关卡', m_combos: '打出 {n} 次 3 连击以上',
        m_buses: '坐满 {n} 辆巴士', m_gold: '以 3 枚徽章通关', m_minis: '完成 {n} 个小目标',
        c0: '黄色', c1: '红色', c2: '蓝色', c3: '绿色', c4: '紫色', c5: '橙色', c6: '粉色', c7: '青色',
        d0: '市中心', d1: '海港', d2: '老城区', d3: '机场', d4: '科技园', d5: '天际线',
        s_classic: '经典', s_checker: '棋盘格', s_retro: '复古车顶', s_neon: '霓虹光', s_gold: '黄金贵宾',
        language: '语言', sound: '声音', on: '开', off: '关',
        vipWaiting: '👑 VIP 乘客要坐{c}出租车，快！', vipDone: '👑 VIP 已送达！3 倍金币 +{n}🪙',
        vipMissed: 'VIP 乘客等不及了，没有奖励。', vipHud: '👑 {t} 秒',
        bonusNode: '奖励关', bonusLabel: '🎁 奖励冲刺', bonusTut: '60 秒内，尽可能多地运送乘客！',
        bonusResult: '奖励冲刺结束！🎁', bonusText: '共运送 {p} 名乘客', bonusPax: '🧍 已运送 {p} 人 · ⏱ {t} 秒',
        newBoard: '新的停车场来了！',
        chNode: '挑战关', chLabel: '🏆 挑战 · 第 {n} 关', chTut: '只有 {s} 个车位，想清楚再出车！',
        chWin: '挑战成功！🏆', chReward: '挑战奖励 +{n}🪙',
    },
};

// Additional strings for 1000-level progression (merged into each language).
const EXTRA = {
    en: {
        d6: 'Stadium', d7: 'University', d8: 'Market', d9: 'Beach',
        milestoneStart: '🌟 Milestone level {n}! A big reward awaits.', milestoneWin: '🌟 Milestone {n} Cleared!',
        milestoneReward: 'Milestone reward +{n}🪙', finalWin: '🏁 You mastered all 1000 levels!',
        replay: 'Replay Level {n}', rushTut: '⚡ Rush level: a tougher lot!', tutPlanter: '🌳 Planters block cars too!',
        newDistrict: '🏙 New district: {d}',
    },
    tr: {
        d6: 'Stadyum', d7: 'Üniversite', d8: 'Çarşı', d9: 'Sahil',
        milestoneStart: '🌟 {n}. seviye bir dönüm noktası! Büyük ödül seni bekliyor.', milestoneWin: '🌟 {n}. Seviye Dönüm Noktası Geçildi!',
        milestoneReward: 'Dönüm noktası ödülü +{n}🪙', finalWin: '🏁 1000 seviyenin hepsini bitirdin!',
        replay: '{n}. Bölümü Tekrar Oyna', rushTut: '⚡ Zorlu bölüm: otopark daha karışık!', tutPlanter: '🌳 Saksılar da araçların yolunu keser!',
        newDistrict: '🏙 Yeni bölge: {d}',
    },
    de: {
        d6: 'Stadion', d7: 'Universität', d8: 'Markt', d9: 'Strand',
        milestoneStart: '🌟 Meilenstein-Level {n}! Eine große Belohnung wartet.', milestoneWin: '🌟 Meilenstein {n} geschafft!',
        milestoneReward: 'Meilenstein-Bonus +{n}🪙', finalWin: '🏁 Du hast alle 1000 Level gemeistert!',
        replay: 'Level {n} wiederholen', rushTut: '⚡ Rush-Level: ein kniffligerer Parkplatz!', tutPlanter: '🌳 Pflanzkübel blockieren auch Autos!',
        newDistrict: '🏙 Neuer Bezirk: {d}',
    },
    es: {
        d6: 'Estadio', d7: 'Universidad', d8: 'Mercado', d9: 'Playa',
        milestoneStart: '🌟 ¡Nivel hito {n}! Te espera una gran recompensa.', milestoneWin: '🌟 ¡Hito {n} superado!',
        milestoneReward: 'Premio de hito +{n}🪙', finalWin: '🏁 ¡Has superado los 1000 niveles!',
        replay: 'Repetir nivel {n}', rushTut: '⚡ Nivel intenso: ¡un aparcamiento más difícil!', tutPlanter: '🌳 ¡Las jardineras también bloquean coches!',
        newDistrict: '🏙 Nuevo distrito: {d}',
    },
    fr: {
        d6: 'Stade', d7: 'Université', d8: 'Marché', d9: 'Plage',
        milestoneStart: "🌟 Niveau étape {n} ! Une grosse récompense t'attend.", milestoneWin: '🌟 Étape {n} franchie !',
        milestoneReward: "Récompense d'étape +{n}🪙", finalWin: '🏁 Tu as terminé les 1000 niveaux !',
        replay: 'Rejouer le niveau {n}', rushTut: '⚡ Niveau intense : un parking plus corsé !', tutPlanter: '🌳 Les jardinières bloquent aussi les voitures !',
        newDistrict: '🏙 Nouveau quartier : {d}',
    },
    zh: {
        d6: '体育场', d7: '大学城', d8: '市集', d9: '海滨',
        milestoneStart: '🌟 第 {n} 关里程碑！丰厚奖励等着你。', milestoneWin: '🌟 第 {n} 关里程碑达成！',
        milestoneReward: '里程碑奖励 +{n}🪙', finalWin: '🏁 你已通关全部 1000 关！',
        replay: '重玩第 {n} 关', rushTut: '⚡ 冲刺关：停车场更难了！', tutPlanter: '🌳 花坛也会挡住车辆！',
        newDistrict: '🏙 新街区：{d}',
    },
};
for (const k in EXTRA) Object.assign(STRINGS[k], EXTRA[k]);

// Compact quest panel strings
const PANEL = {
    en: { gpTitle: 'Bonus Quest', gpMini: '{c} taxi {s}/{n}', gp_taps: 'Max {n} taps', gp_noextra: 'No extra slot', gp_time: '{n}s left', gp_spare: 'Keep 1 slot free', gp_noblock: 'No blocked taps', gpInfo: 'Details', gpMiniLong: 'Mini goal: {text} (+{b}🪙)', gpGoalLong: 'Optional goal: {text}' },
    tr: { gpTitle: 'Bonus Görev', gpMini: '{c} taksi {s}/{n}', gp_taps: 'En fazla {n} dokunuş', gp_noextra: 'Ek alan kullanma', gp_time: '{n} sn kala bitir', gp_spare: '1 alanı boş tut', gp_noblock: 'Engelli dokunuş yapma', gpInfo: 'Ayrıntılar', gpMiniLong: 'Mini hedef: {text} (+{b}🪙)', gpGoalLong: 'İsteğe bağlı hedef: {text}' },
    de: { gpTitle: 'Bonus-Aufgabe', gpMini: '{c} Taxi {s}/{n}', gp_taps: 'Max. {n} Tipps', gp_noextra: 'Kein Extra-Platz', gp_time: '{n} s übrig', gp_spare: '1 Platz frei', gp_noblock: 'Kein blockierter Tipp', gpInfo: 'Details', gpMiniLong: 'Mini-Ziel: {text} (+{b}🪙)', gpGoalLong: 'Optionales Ziel: {text}' },
    es: { gpTitle: 'Misión bonus', gpMini: 'Taxi {c} {s}/{n}', gp_taps: 'Máx. {n} toques', gp_noextra: 'Sin plaza extra', gp_time: '{n} s restantes', gp_spare: 'Deja 1 plaza libre', gp_noblock: 'Sin toques bloqueados', gpInfo: 'Detalles', gpMiniLong: 'Mini objetivo: {text} (+{b}🪙)', gpGoalLong: 'Objetivo opcional: {text}' },
    fr: { gpTitle: 'Quête bonus', gpMini: 'Taxi {c} {s}/{n}', gp_taps: '{n} touches max', gp_noextra: 'Pas de place bonus', gp_time: '{n} s restantes', gp_spare: 'Garde 1 place libre', gp_noblock: 'Aucune touche bloquée', gpInfo: 'Détails', gpMiniLong: 'Mini objectif : {text} (+{b}🪙)', gpGoalLong: 'Objectif facultatif : {text}' },
    zh: { gpTitle: '奖励任务', gpMini: '{c}出租车 {s}/{n}', gp_taps: '最多 {n} 次点击', gp_noextra: '不用额外车位', gp_time: '剩余 {n} 秒', gp_spare: '保留 1 个空位', gp_noblock: '不要误点', gpInfo: '详情', gpMiniLong: '小目标：{text}（+{b}🪙）', gpGoalLong: '可选目标：{text}' },
};
for (const k in PANEL) if (STRINGS[k]) Object.assign(STRINGS[k], PANEL[k]);

let current = 'en';

export function detectLanguage() {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (const raw of list) {
        const tag = String(raw).toLowerCase();
        if (tag.startsWith('zh')) {
            // Only Simplified Chinese is supported for now; Traditional variants fall back to English.
            if (/hant|-tw|-hk|-mo/.test(tag)) continue;
            return 'zh';
        }
        const base = tag.split('-')[0];
        if (STRINGS[base]) return base;
    }
    return 'en';
}

export function setLang(code) {
    current = STRINGS[code] ? code : 'en';
    document.documentElement.lang = current === 'zh' ? 'zh-Hans' : current;
}

export function getLang() {
    return current;
}

export function t(key, params = {}) {
    let s = (STRINGS[current] && STRINGS[current][key]) ?? STRINGS.en[key] ?? key;
    for (const k in params) s = s.split('{' + k + '}').join(params[k]);
    return s;
}

// Apply translations to static DOM: elements with data-i18n get textContent;
// elements with class "ad" get a localized AD tag.
export function applyStaticI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('.btn.ad').forEach(el => {
        el.dataset.ad = t('ad');
    });
}
