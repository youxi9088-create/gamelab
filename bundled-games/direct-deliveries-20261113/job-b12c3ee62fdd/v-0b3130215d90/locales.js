export const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
];

const ENGLISH = {
    gameMenu: 'Controls',
    languageLabel: 'Choose language',
    soundOptions: 'Sound options',
    music: 'Music',
    clashes: 'Clashes',
    backgroundMusicLabel: 'Toggle background music',
    clashSoundsLabel: 'Toggle battle clash sounds',
    introCopy: 'A logical strategy game.',
    enterGame: 'Enter the realm',
    introHint: 'Tap to begin',
    learn: 'How to play',
    close: 'Close',
    tutorialTitle: 'Chess made simple',
    tutorialIntro: 'A quick beginner guide. You play one piece, then your opponent takes a turn.',
    goalTitle: '1. Your goal',
    goalText: 'Trap the enemy king so it cannot escape attack. This is checkmate, and you win.',
    turnsTitle: '2. Take turns',
    turnsText: 'Tap one of your pieces. Green squares show where it can move. Tap a green square to move.',
    piecesTitle: '3. How pieces move',
    piecesIntro: 'Pieces cannot jump over other pieces, except the knight.',
    pawn: 'Pawn',
    pawnRule: 'Moves forward 1 square; your first pawn may instead move 2. Captures diagonally.',
    pawnOpportunityTitle: 'A shared first-pawn choice',
    pawnOpportunityIntro: 'Each side gets one two-square chance: only its first pawn to move may take it. If that pawn moves 1 square, the chance is gone.',
    pawnLeapTitle: 'Take the two-square leap',
    pawnLeapText: 'Example: your first pawn advances 2 squares. The chance is spent; every later pawn advances 1 square at a time.',
    pawnSingleTitle: 'Choose one square',
    pawnSingleText: 'Example: your first pawn advances 1 square. Your second and every later pawn can then advance only 1 square at a time.',
    knight: 'Knight',
    knightRule: 'Moves in an L shape and can jump over pieces.',
    bishop: 'Bishop',
    bishopRule: 'Moves diagonally any number of clear squares.',
    rook: 'Rook',
    rookRule: 'Moves straight any number of clear squares.',
    queen: 'Queen',
    queenRule: 'Moves straight or diagonally any number of clear squares.',
    king: 'King',
    kingRule: 'Moves 1 square in any direction. Keep it safe!',
    capturesTitle: '4. Captures and safety',
    captureText: 'Capture a piece by moving onto its square. The king is never captured.',
    checkTitle: 'Check',
    checkText: 'Your king is under attack. Escape, block the attack, or take the attacking piece.',
    winTitle: 'How the game ends',
    checkmateText: 'Checkmate means the king cannot escape: you win. Checkmate against you means you lose.',
    stalemateText: 'If a player has no legal move but is not in check, the game is a stalemate, also known as a draw.',
    chooseSide: 'Choose your side',
    resetGame: 'Restart',
    backToSetup: 'Back to setup',
    moveControl: 'Drag to move this control; use arrow keys to reposition',
    boardDisplay: 'Board display settings',
    colorBlindMode: 'Color-blind-friendly colors',
    boardSize: 'Board size',
    arrangeBoard: 'Move board',
    arrangeBoardHint: 'Drag the board to place it. With the button focused, use the arrow keys to nudge it.',
    resetBoardView: 'Reset board view',
    yes: 'Yes',
    no: 'No',
    pickerCopy: 'Choose White or Black to begin. The computer plays the other side.',
    skillLabel: 'Opponent skill',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    skillCopyBeginner: 'Beginner — relaxed play with simple, unpredictable moves.',
    skillCopyIntermediate: 'Intermediate — a balanced opponent that spots simple tactics.',
    skillCopyAdvanced: 'Advanced — looks ahead and values safer positions.',
    clockLabel: 'Game clock',
    clockCopy: 'Choose a time control, or play without a clock.',
    untimed: 'Untimed',
    fiveMin: '5 min + 3 sec',
    tenMin: '10 min + 5 sec',
    playWhite: 'Play as White',
    playBlack: 'Play as Black',
    claimDraw: 'Claim draw',
    promotionTitle: 'Choose your promotion',
    queen: 'Queen',
    rook: 'Rook',
    bishop: 'Bishop',
    white: 'White',
    black: 'Black',
    chooseToBegin: 'Choose White or Black to begin',
    yourMove: 'Your move',
    opponentThinking: 'Your opponent is thinking…',
    checkYourMove: 'Check! Your move',
    checkOpponent: 'Check! Your opponent must respond',
    choosePromotion: 'Choose a promotion piece',
    checkmate: 'Checkmate',
    checkmateWin: 'Checkmate, you win.',
    checkmateLoss: 'Computer checkmate, try again.',
    stalemate: 'Stalemate — the game is a draw.',
    draw: 'Draw',
    drawInsufficient: 'Draw — not enough pieces to checkmate.',
    drawFivefold: 'Draw — the same position occurred five times.',
    drawSeventyFive: 'Draw — the seventy-five-move rule.',
    drawClaimed: 'Draw claimed — the game is a draw.',
    timeExpiredTitle: 'Time expired',
    timeExpired: '{loser} ran out of time. {winner} wins on time.',
    playAgainCopy: '{message} Play again?',
    drawThreefold: 'threefold repetition',
    drawFiftyMove: 'the fifty-move rule',
    battleLog: 'Battle log',
    battleLogOption: 'Show battle log',
    activeSide: 'To move',
    checkStatus: 'King status',
    inCheck: 'IN CHECK',
    kingSafe: 'King safe',
    checkAlertYourKing: 'Your king is in check!',
    checkAlertWhiteKing: 'White king is in check!',
    checkAlertBlackKing: 'Black king is in check!',
    recentMoves: 'Recent moves',
    capturedPieces: 'Captured pieces',
    whiteCaptured: 'White captured',
    blackCaptured: 'Black captured',
    noMoves: 'No moves yet',
    noCaptures: 'None',
};

const TRANSLATIONS = {
    en: ENGLISH,
    es: {
        languageLabel: 'Elegir idioma', introCopy: 'Un juego de estrategia lógica.', enterGame: 'Entrar al reino', introHint: 'Toca para comenzar', learn: 'Cómo jugar', close: 'Cerrar',
        tutorialTitle: 'Ajedrez sencillo', tutorialIntro: 'Una guía rápida para principiantes. Mueves una pieza y luego juega tu oponente.', goalTitle: '1. Tu objetivo', goalText: 'Acorralar al rey enemigo para que no pueda escapar del ataque. Eso es jaque mate y ganas.', turnsTitle: '2. Por turnos', turnsText: 'Toca una pieza tuya. Las casillas verdes muestran sus movimientos. Toca una casilla verde para mover.', piecesTitle: '3. Cómo se mueven las piezas', piecesIntro: 'Las piezas no saltan sobre otras, excepto el caballo.', pawn: 'Peón', pawnRule: 'Avanza 1 casilla; solo el primer peón que mueves puede avanzar 2. Captura en diagonal.', knight: 'Caballo', knightRule: 'Se mueve en forma de L y puede saltar piezas.', bishop: 'Alfil', bishopRule: 'Se mueve en diagonal por casillas libres.', rook: 'Torre', rookRule: 'Se mueve en línea recta por casillas libres.', queen: 'Dama', queenRule: 'Se mueve en línea recta o diagonal por casillas libres.', king: 'Rey', kingRule: 'Se mueve 1 casilla en cualquier dirección. ¡Protégelo!', capturesTitle: '4. Capturas y seguridad', captureText: 'Captura al caer en la casilla de una pieza rival. El rey nunca se captura.', checkTitle: 'Jaque', checkText: 'Tu rey está bajo ataque. Escapa, bloquea el ataque o captura la pieza atacante.', winTitle: 'Cómo termina la partida', checkmateText: 'Jaque mate: el rey no puede escapar y ganas. Si te dan jaque mate, pierdes.', stalemateText: 'Si un jugador no tiene movimientos legales pero no está en jaque, eso es un ahogado, también conocido como tablas.',
        chooseSide: 'Elige tu bando', yes: 'Sí', no: 'No', pickerCopy: 'Elige blancas o negras. El ordenador jugará con el otro bando.', skillLabel: 'Nivel del rival', beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', skillCopyBeginner: 'Principiante — juega sin presión con movimientos sencillos e impredecibles.', skillCopyIntermediate: 'Intermedio — un rival equilibrado que detecta tácticas sencillas.', skillCopyAdvanced: 'Avanzado — piensa varios movimientos y busca posiciones seguras.', clockLabel: 'Reloj de partida', clockCopy: 'Elige un límite de tiempo o juega sin reloj.', untimed: 'Sin reloj', fiveMin: '5 min + 3 s', tenMin: '10 min + 5 s', playWhite: 'Jugar con blancas', playBlack: 'Jugar con negras', claimDraw: 'Reclamar tablas', promotionTitle: 'Elige la promoción', white: 'Blancas', black: 'Negras', chooseToBegin: 'Elige blancas o negras para empezar', yourMove: 'Tu turno', opponentThinking: 'Tu rival está pensando…', checkYourMove: '¡Jaque! Tu turno', checkOpponent: '¡Jaque! Tu rival debe responder', choosePromotion: 'Elige una pieza para la promoción', checkmate: 'Jaque mate', checkmateWin: '¡Jaque mate: has ganado!', checkmateLoss: 'Jaque mate: gana tu rival.', stalemate: 'Ahogado: la partida termina en tablas.', draw: 'Tablas', drawInsufficient: 'Tablas: no hay piezas suficientes para dar jaque mate.', drawFivefold: 'Tablas: la misma posición se repitió cinco veces.', drawSeventyFive: 'Tablas por la regla de los setenta y cinco movimientos.', drawClaimed: 'Tablas reclamadas: la partida termina en empate.', timeExpiredTitle: 'Se acabó el tiempo', timeExpired: 'Se acabó el tiempo de {loser}. Gana {winner} por tiempo.', playAgainCopy: '{message} ¿Quieres jugar otra vez?', drawThreefold: 'repetición triple', drawFiftyMove: 'la regla de los cincuenta movimientos',
    },
    fr: {
        languageLabel: 'Choisir la langue', introCopy: 'Un jeu de stratégie logique.', enterGame: 'Entrer dans le royaume', introHint: 'Touchez pour commencer', learn: 'Comment jouer', close: 'Fermer',
        tutorialTitle: 'Les échecs, simplement', tutorialIntro: 'Un guide rapide pour débuter. Vous jouez une pièce, puis votre adversaire joue.', goalTitle: '1. Votre objectif', goalText: 'Piégez le roi adverse afin qu’il ne puisse plus échapper à l’attaque. C’est échec et mat : vous gagnez.', turnsTitle: '2. Jouez chacun votre tour', turnsText: 'Touchez une pièce. Les cases vertes montrent ses déplacements. Touchez une case verte pour jouer.', piecesTitle: '3. Déplacement des pièces', piecesIntro: 'Les pièces ne sautent pas par-dessus les autres, sauf le cavalier.', pawn: 'Pion', pawnRule: 'Avance d’une case ; seul le premier pion déplacé peut avancer de deux cases. Prend en diagonale.', knight: 'Cavalier', knightRule: 'Se déplace en L et peut sauter par-dessus les pièces.', bishop: 'Fou', bishopRule: 'Se déplace en diagonale sur autant de cases libres que possible.', rook: 'Tour', rookRule: 'Se déplace en ligne droite sur autant de cases libres que possible.', queen: 'Dame', queenRule: 'Se déplace en ligne droite ou en diagonale sur les cases libres.', king: 'Roi', kingRule: 'Se déplace d’une case dans toutes les directions. Protégez-le !', capturesTitle: '4. Prises et sécurité', captureText: 'Prenez une pièce en arrivant sur sa case. Le roi n’est jamais capturé.', checkTitle: 'Échec', checkText: 'Votre roi est attaqué. Éloignez-le, bloquez l’attaque ou prenez la pièce adverse.', winTitle: 'Fin de la partie', checkmateText: 'Échec et mat : le roi ne peut pas s’échapper, vous gagnez. Si vous êtes mat, vous perdez.', stalemateText: 'Si un joueur n’a aucun coup légal sans être en échec, c’est un pat, aussi appelé partie nulle.',
        chooseSide: 'Choisissez votre camp', yes: 'Oui', no: 'Non', pickerCopy: 'Choisissez les Blancs ou les Noirs. L’ordinateur jouera l’autre camp.', skillLabel: 'Niveau de l’adversaire', beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', skillCopyBeginner: 'Débutant — une partie détendue et des coups simples et imprévisibles.', skillCopyIntermediate: 'Intermédiaire — un adversaire équilibré qui repère les tactiques simples.', skillCopyAdvanced: 'Avancé — anticipe plusieurs coups et privilégie les positions sûres.', clockLabel: 'Pendule', clockCopy: 'Choisissez une durée ou jouez sans pendule.', untimed: 'Sans limite', fiveMin: '5 min + 3 s', tenMin: '10 min + 5 s', playWhite: 'Jouer les Blancs', playBlack: 'Jouer les Noirs', claimDraw: 'Réclamer la nulle', promotionTitle: 'Choisissez la promotion', white: 'Blancs', black: 'Noirs', chooseToBegin: 'Choisissez votre camp pour commencer', yourMove: 'À vous de jouer', opponentThinking: 'Votre adversaire réfléchit…', checkYourMove: 'Échec ! À vous de jouer', checkOpponent: 'Échec ! Votre adversaire doit répondre', choosePromotion: 'Choisissez une pièce pour la promotion', checkmate: 'Échec et mat', checkmateWin: 'Échec et mat — vous gagnez !', checkmateLoss: 'Échec et mat — votre adversaire gagne.', stalemate: 'Pat : la partie est nulle.', draw: 'Partie nulle', drawInsufficient: 'Nulle — matériel insuffisant pour mater.', drawFivefold: 'Nulle — la même position est apparue cinq fois.', drawSeventyFive: 'Nulle — règle des soixante-quinze coups.', drawClaimed: 'Nulle réclamée — la partie est terminée.', timeExpiredTitle: 'Temps écoulé', timeExpired: '{loser} n’a plus de temps. {winner} gagne au temps.', playAgainCopy: '{message} Voulez-vous rejouer ?', drawThreefold: 'répétition triple', drawFiftyMove: 'règle des cinquante coups',
    },
    de: {
        languageLabel: 'Sprache wählen', introCopy: 'Ein logisches Strategiespiel.', enterGame: 'Ins Reich eintreten', introHint: 'Tippe, um zu beginnen', learn: 'Spielanleitung', close: 'Schließen',
        tutorialTitle: 'Schach ganz einfach', tutorialIntro: 'Eine kurze Anleitung für Einsteiger. Du ziehst eine Figur, dann ist dein Gegner dran.', goalTitle: '1. Dein Ziel', goalText: 'Setze den gegnerischen König so fest, dass er dem Angriff nicht entkommen kann. Das ist Schachmatt – du gewinnst.', turnsTitle: '2. Abwechselnd ziehen', turnsText: 'Tippe eine eigene Figur an. Grüne Felder zeigen mögliche Züge. Tippe ein grünes Feld zum Ziehen.', piecesTitle: '3. So ziehen die Figuren', piecesIntro: 'Figuren können nicht über andere springen – außer dem Springer.', pawn: 'Bauer', pawnRule: 'Zieht 1 Feld vor; nur dein erster gezogener Bauer darf 2 Felder ziehen. Schlägt diagonal.', knight: 'Springer', knightRule: 'Zieht in L-Form und kann über Figuren springen.', bishop: 'Läufer', bishopRule: 'Zieht beliebig weit diagonal über freie Felder.', rook: 'Turm', rookRule: 'Zieht beliebig weit gerade über freie Felder.', queen: 'Dame', queenRule: 'Zieht beliebig weit gerade oder diagonal über freie Felder.', king: 'König', kingRule: 'Zieht 1 Feld in jede Richtung. Schütze ihn!', capturesTitle: '4. Schlagen und Sicherheit', captureText: 'Schlage eine Figur, indem du auf ihr Feld ziehst. Der König wird nie geschlagen.', checkTitle: 'Schach', checkText: 'Dein König wird angegriffen. Zieh ihn weg, blockiere den Angriff oder schlage die angreifende Figur.', winTitle: 'Spielende', checkmateText: 'Schachmatt: Der König kann nicht entkommen, du gewinnst. Bei deinem Schachmatt verlierst du.', stalemateText: 'Hat ein Spieler keinen erlaubten Zug und steht nicht im Schach, endet die Partie mit Patt, auch Remis genannt.',
        chooseSide: 'Wähle deine Seite', yes: 'Ja', no: 'Nein', pickerCopy: 'Wähle Weiß oder Schwarz. Der Computer spielt die andere Seite.', skillLabel: 'Stärke des Gegners', beginner: 'Einsteiger', intermediate: 'Mittel', advanced: 'Fortgeschritten', skillCopyBeginner: 'Einsteiger — entspanntes Spiel mit einfachen, unvorhersehbaren Zügen.', skillCopyIntermediate: 'Mittel — ein ausgeglichener Gegner, der einfache Taktiken erkennt.', skillCopyAdvanced: 'Fortgeschritten — plant voraus und bevorzugt sichere Stellungen.', clockLabel: 'Schachuhr', clockCopy: 'Wähle eine Bedenkzeit oder spiele ohne Uhr.', untimed: 'Ohne Uhr', fiveMin: '5 Min. + 3 Sek.', tenMin: '10 Min. + 5 Sek.', playWhite: 'Weiß spielen', playBlack: 'Schwarz spielen', claimDraw: 'Remis beanspruchen', promotionTitle: 'Umwandlungsfigur wählen', white: 'Weiß', black: 'Schwarz', chooseToBegin: 'Wähle Weiß oder Schwarz, um zu beginnen', yourMove: 'Du bist am Zug', opponentThinking: 'Dein Gegner überlegt…', checkYourMove: 'Schach! Du bist am Zug', checkOpponent: 'Schach! Dein Gegner muss reagieren', choosePromotion: 'Wähle eine Umwandlungsfigur', checkmate: 'Schachmatt', checkmateWin: 'Schachmatt — du gewinnst!', checkmateLoss: 'Schachmatt — dein Gegner gewinnt.', stalemate: 'Patt — die Partie endet remis.', draw: 'Remis', drawInsufficient: 'Remis — zu wenig Material für ein Schachmatt.', drawFivefold: 'Remis — dieselbe Stellung kam fünfmal vor.', drawSeventyFive: 'Remis — die Fünfundsiebzig-Züge-Regel.', drawClaimed: 'Remis beansprucht — die Partie ist beendet.', timeExpiredTitle: 'Zeit abgelaufen', timeExpired: '{loser} hat keine Zeit mehr. {winner} gewinnt auf Zeit.', playAgainCopy: '{message} Noch einmal spielen?', drawThreefold: 'dreifache Stellungswiederholung', drawFiftyMove: 'Fünfzig-Züge-Regel',
    },
    pt: {
        languageLabel: 'Escolher idioma', introCopy: 'Um jogo de estratégia lógica.', enterGame: 'Entrar no reino', introHint: 'Toque para começar', learn: 'Como jogar', close: 'Fechar',
        tutorialTitle: 'Xadrez sem complicação', tutorialIntro: 'Um guia rápido para iniciantes. Você move uma peça e depois seu oponente joga.', goalTitle: '1. Seu objetivo', goalText: 'Prenda o rei adversário para que ele não consiga escapar do ataque. Isso é xeque-mate, e você vence.', turnsTitle: '2. Jogue em turnos', turnsText: 'Toque em uma peça sua. As casas verdes mostram os movimentos possíveis. Toque em uma casa verde para mover.', piecesTitle: '3. Como as peças se movem', piecesIntro: 'As peças não saltam sobre outras, exceto o cavalo.', pawn: 'Peão', pawnRule: 'Avança 1 casa; só o primeiro peão movido pode avançar 2. Captura na diagonal.', knight: 'Cavalo', knightRule: 'Move em L e pode saltar sobre peças.', bishop: 'Bispo', bishopRule: 'Move na diagonal por casas livres.', rook: 'Torre', rookRule: 'Move em linha reta por casas livres.', queen: 'Rainha', queenRule: 'Move em linha reta ou diagonal por casas livres.', king: 'Rei', kingRule: 'Move 1 casa em qualquer direção. Proteja-o!', capturesTitle: '4. Capturas e segurança', captureText: 'Capture uma peça ao mover para a casa dela. O rei nunca é capturado.', checkTitle: 'Xeque', checkText: 'Seu rei está sob ataque. Fuja, bloqueie o ataque ou capture a peça atacante.', winTitle: 'Fim de jogo', checkmateText: 'Xeque-mate: o rei não pode escapar e você vence. Se você levar xeque-mate, perde.', stalemateText: 'Se um jogador não puder fazer nenhum lance legal e não estiver em xeque, ocorre um afogamento, também conhecido como empate.',
        chooseSide: 'Escolha seu lado', yes: 'Sim', no: 'Não', pickerCopy: 'Escolha brancas ou pretas. O computador jogará com o outro lado.', skillLabel: 'Nível do oponente', beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado', skillCopyBeginner: 'Iniciante — jogo tranquilo com lances simples e imprevisíveis.', skillCopyIntermediate: 'Intermediário — um oponente equilibrado que percebe táticas simples.', skillCopyAdvanced: 'Avançado — pensa adiante e prefere posições seguras.', clockLabel: 'Relógio', clockCopy: 'Escolha um limite de tempo ou jogue sem relógio.', untimed: 'Sem tempo', fiveMin: '5 min + 3 s', tenMin: '10 min + 5 s', playWhite: 'Jogar de brancas', playBlack: 'Jogar de pretas', claimDraw: 'Reivindicar empate', promotionTitle: 'Escolha a promoção', white: 'Brancas', black: 'Pretas', chooseToBegin: 'Escolha brancas ou pretas para começar', yourMove: 'Sua vez', opponentThinking: 'Seu oponente está pensando…', checkYourMove: 'Xeque! Sua vez', checkOpponent: 'Xeque! Seu oponente precisa responder', choosePromotion: 'Escolha uma peça para a promoção', checkmate: 'Xeque-mate', checkmateWin: 'Xeque-mate — você venceu!', checkmateLoss: 'Xeque-mate — seu oponente venceu.', stalemate: 'Afogamento — a partida termina empatada.', draw: 'Empate', drawInsufficient: 'Empate — peças insuficientes para dar xeque-mate.', drawFivefold: 'Empate — a mesma posição ocorreu cinco vezes.', drawSeventyFive: 'Empate — regra dos setenta e cinco lances.', drawClaimed: 'Empate reivindicado — a partida terminou.', timeExpiredTitle: 'Tempo esgotado', timeExpired: 'O tempo de {loser} acabou. {winner} vence pelo tempo.', playAgainCopy: '{message} Jogar novamente?', drawThreefold: 'repetição tripla', drawFiftyMove: 'regra dos cinquenta lances',
    },
    it: {
        languageLabel: 'Scegli lingua', introCopy: 'Un gioco di strategia logica.', enterGame: 'Entra nel regno', introHint: 'Tocca per iniziare', learn: 'Come si gioca', close: 'Chiudi',
        tutorialTitle: 'Scacchi semplici', tutorialIntro: 'Una guida rapida per principianti. Muovi un pezzo, poi tocca all’avversario.', goalTitle: '1. Il tuo obiettivo', goalText: 'Intrappola il re avversario, così non potrà sfuggire all’attacco. È scacco matto: hai vinto.', turnsTitle: '2. A turni', turnsText: 'Tocca un tuo pezzo. Le caselle verdi mostrano le mosse disponibili. Tocca una casella verde per muovere.', piecesTitle: '3. Come si muovono i pezzi', piecesIntro: 'I pezzi non possono saltare sopra gli altri, tranne il cavallo.', pawn: 'Pedone', pawnRule: 'Avanza di 1 casella; solo il primo pedone mosso può avanzare di 2. Cattura in diagonale.', knight: 'Cavallo', knightRule: 'Si muove a L e può saltare sopra gli altri pezzi.', bishop: 'Alfiere', bishopRule: 'Si muove in diagonale sulle caselle libere.', rook: 'Torre', rookRule: 'Si muove in linea retta sulle caselle libere.', queen: 'Regina', queenRule: 'Si muove in linea retta o in diagonale sulle caselle libere.', king: 'Re', kingRule: 'Si muove di 1 casella in ogni direzione. Proteggilo!', capturesTitle: '4. Catture e sicurezza', captureText: 'Cattura un pezzo muovendo sulla sua casella. Il re non viene mai catturato.', checkTitle: 'Scacco', checkText: 'Il tuo re è sotto attacco. Spostalo, blocca l’attacco o cattura il pezzo che attacca.', winTitle: 'Fine della partita', checkmateText: 'Scacco matto: il re non può fuggire e vinci. Se subisci scacco matto, perdi.', stalemateText: 'Se un giocatore non ha mosse legali e non è sotto scacco, la partita è uno stallo, detto anche patta.',
        chooseSide: 'Scegli il tuo lato', yes: 'Sì', no: 'No', pickerCopy: 'Scegli il Bianco o il Nero. Il computer giocherà l’altro lato.', skillLabel: 'Livello avversario', beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzato', skillCopyBeginner: 'Principiante — partita tranquilla con mosse semplici e imprevedibili.', skillCopyIntermediate: 'Intermedio — un avversario equilibrato che nota tattiche semplici.', skillCopyAdvanced: 'Avanzato — pianifica in anticipo e preferisce posizioni sicure.', clockLabel: 'Orologio', clockCopy: 'Scegli un limite di tempo oppure gioca senza orologio.', untimed: 'Senza tempo', fiveMin: '5 min + 3 s', tenMin: '10 min + 5 s', playWhite: 'Gioca col Bianco', playBlack: 'Gioca col Nero', claimDraw: 'Richiedi patta', promotionTitle: 'Scegli la promozione', white: 'Bianco', black: 'Nero', chooseToBegin: 'Scegli Bianco o Nero per iniziare', yourMove: 'Tocca a te', opponentThinking: 'Il tuo avversario sta pensando…', checkYourMove: 'Scacco! Tocca a te', checkOpponent: 'Scacco! L’avversario deve rispondere', choosePromotion: 'Scegli un pezzo per la promozione', checkmate: 'Scacco matto', checkmateWin: 'Scacco matto — hai vinto!', checkmateLoss: 'Scacco matto — vince il tuo avversario.', stalemate: 'Stallo — la partita è patta.', draw: 'Patta', drawInsufficient: 'Patta — pezzi insufficienti per dare scacco matto.', drawFivefold: 'Patta — la stessa posizione si è ripetuta cinque volte.', drawSeventyFive: 'Patta — regola delle settantacinque mosse.', drawClaimed: 'Patta richiesta — la partita è terminata.', timeExpiredTitle: 'Tempo scaduto', timeExpired: 'Il tempo di {loser} è scaduto. {winner} vince per tempo.', playAgainCopy: '{message} Vuoi giocare ancora?', drawThreefold: 'ripetizione tripla', drawFiftyMove: 'regola delle cinquanta mosse',
    },
    ja: {
        languageLabel: '言語を選択', introCopy: '論理的な戦略ゲーム。', enterGame: 'ゲームを始める', introHint: 'タップして始めよう', learn: '遊び方', close: '閉じる',
        tutorialTitle: 'かんたんチェス入門', tutorialIntro: '初心者向けの短いガイドです。自分の駒を動かしたら、相手の番です。', goalTitle: '1. 目的', goalText: '相手のキングを逃げられない状態にします。これがチェックメイトで、あなたの勝ちです。', turnsTitle: '2. 交互に動かす', turnsText: '自分の駒をタップします。緑のマスが移動先です。緑のマスをタップして動かしましょう。', piecesTitle: '3. 駒の動き方', piecesIntro: 'ナイト以外の駒は、ほかの駒を飛び越せません。', pawn: 'ポーン', pawnRule: '前へ1マス。最初に動かすポーンだけ2マス進めます。斜めに取ります。', knight: 'ナイト', knightRule: 'L字に動き、ほかの駒を飛び越せます。', bishop: 'ビショップ', bishopRule: '空いているマスを斜めに進みます。', rook: 'ルーク', rookRule: '空いているマスを縦横に進みます。', queen: 'クイーン', queenRule: '空いているマスを縦横または斜めに進みます。', king: 'キング', kingRule: 'どの方向にも1マス進みます。守りましょう！', capturesTitle: '4. 駒を取る・キングを守る', captureText: '相手の駒がいるマスへ動くと取れます。キングは取られません。', checkTitle: 'チェック', checkText: 'キングが攻撃されています。逃げる、攻撃を防ぐ、攻撃している駒を取る方法があります。', winTitle: '勝敗の決まり方', checkmateText: 'チェックメイトはキングが逃げられない状態です。あなたが勝ちます。自分が受けると負けです。', stalemateText: 'チェックされていないのに合法手がない状態をステイルメイトといい、引き分けとも呼ばれます。',
        chooseSide: '色を選ぶ', yes: 'はい', no: 'いいえ', pickerCopy: '白か黒を選んでください。コンピューターは反対の色で対戦します。', skillLabel: '相手の強さ', beginner: '初級', intermediate: '中級', advanced: '上級', skillCopyBeginner: '初級 — ゆっくり遊べる、シンプルで予測しにくい手を指します。', skillCopyIntermediate: '中級 — 基本的な戦術に気づく、バランスのよい相手です。', skillCopyAdvanced: '上級 — 先を読み、安全な局面を重視します。', clockLabel: '対局時計', clockCopy: '持ち時間を選ぶか、時計なしで遊びましょう。', untimed: '時計なし', fiveMin: '5分 + 3秒', tenMin: '10分 + 5秒', playWhite: '白で遊ぶ', playBlack: '黒で遊ぶ', claimDraw: '引き分けを申請', promotionTitle: '成る駒を選択', white: '白', black: '黒', chooseToBegin: '白か黒を選んで始めましょう', yourMove: 'あなたの番', opponentThinking: '相手が考えています…', checkYourMove: 'チェック！あなたの番です', checkOpponent: 'チェック！相手は応手が必要です', choosePromotion: '成る駒を選んでください', checkmate: 'チェックメイト', checkmateWin: 'チェックメイト — あなたの勝ち！', checkmateLoss: 'チェックメイト — 相手の勝ちです。', stalemate: 'ステイルメイト — 引き分けです。', draw: '引き分け', drawInsufficient: '引き分け — チェックメイトに必要な駒がありません。', drawFivefold: '引き分け — 同じ局面が5回現れました。', drawSeventyFive: '引き分け — 75手ルールです。', drawClaimed: '引き分けが成立しました。', timeExpiredTitle: '時間切れ', timeExpired: '{loser}の時間切れです。{winner}の勝ちです。', playAgainCopy: '{message} もう一度プレイしますか？', drawThreefold: '同一局面の3回反復', drawFiftyMove: '50手ルール',
    },
};

const RESET_BUTTON_TRANSLATIONS = {
    es: { resetGame: 'Reiniciar', backToSetup: 'Volver a la configuración', moveControl: 'Arrastra para mover este control; usa las flechas para recolocarlo' },
    fr: { resetGame: 'Recommencer', backToSetup: 'Retour aux réglages', moveControl: 'Faites glisser pour déplacer ce contrôle ; utilisez les flèches pour le repositionner' },
    de: { resetGame: 'Neustart', backToSetup: 'Zurück zur Auswahl', moveControl: 'Zum Verschieben ziehen oder mit den Pfeiltasten neu positionieren' },
    pt: { resetGame: 'Reiniciar', backToSetup: 'Voltar à configuração', moveControl: 'Arraste para mover este controle; use as setas para reposicioná-lo' },
    it: { resetGame: 'Ricomincia', backToSetup: 'Torna alle impostazioni', moveControl: 'Trascina per spostare il controllo; usa le frecce per riposizionarlo' },
    ja: { resetGame: '最初から', backToSetup: '設定に戻る', moveControl: 'ドラッグまたは矢印キーで位置を変更' },
};

const CHECKMATE_TRANSLATIONS = {
    en: {
        checkmateWin: 'Checkmate, you win.',
        checkmateLoss: 'Computer checkmate, try again.',
    },
    es: {
        checkmateWin: 'Jaque mate, has ganado.',
        checkmateLoss: 'Jaque mate: el ordenador ganó. Inténtalo de nuevo.',
    },
    fr: {
        checkmateWin: 'Échec et mat, vous avez gagné.',
        checkmateLoss: 'Échec et mat : l’ordinateur a gagné. Réessayez.',
    },
    de: {
        checkmateWin: 'Schachmatt, du hast gewonnen.',
        checkmateLoss: 'Schachmatt, der Computer hat gewonnen. Versuch es noch einmal.',
    },
    pt: {
        checkmateWin: 'Xeque-mate, você venceu.',
        checkmateLoss: 'Xeque-mate, o computador venceu. Tente novamente.',
    },
    it: {
        checkmateWin: 'Scacco matto, hai vinto.',
        checkmateLoss: 'Scacco matto, il computer ha vinto. Riprova.',
    },
    ja: {
        checkmateWin: 'チェックメイト、あなたの勝ちです。',
        checkmateLoss: 'チェックメイト、コンピューターの勝ちです。もう一度挑戦してください。',
    },
};

const EXTRA_TRANSLATIONS = {
    es: { languageLabel: 'Elegir idioma', battleLogOption: 'Mostrar registro de batalla', battleLog: 'Registro de batalla', activeSide: 'Juega', checkStatus: 'Estado del rey', inCheck: 'EN JAQUE', kingSafe: 'Rey a salvo', recentMoves: 'Movimientos recientes', capturedPieces: 'Piezas capturadas', whiteCaptured: 'Capturas blancas', blackCaptured: 'Capturas negras', noMoves: 'Aún no hay movimientos', noCaptures: 'Ninguna', white: 'Blancas', black: 'Negras', pawnOpportunityTitle: 'La oportunidad compartida del primer peón', pawnOpportunityIntro: 'Cada bando tiene una oportunidad de avanzar 2 casillas: solo puede aprovecharla su primer peón en moverse. Si avanza 1 casilla, la oportunidad se pierde.', pawnLeapTitle: 'Aprovecha el salto de 2', pawnLeapText: 'Ejemplo: tu primer peón avanza 2 casillas. La oportunidad se agota; los demás peones avanzan de 1 en 1.', pawnSingleTitle: 'Elige una casilla', pawnSingleText: 'Ejemplo: tu primer peón avanza 1 casilla. El segundo y todos los siguientes solo podrán avanzar de 1 en 1.' },
    fr: { languageLabel: 'Choisir la langue', battleLogOption: 'Afficher le journal de bataille', battleLog: 'Journal de bataille', activeSide: 'À jouer', checkStatus: 'État du roi', inCheck: 'EN ÉCHEC', kingSafe: 'Roi en sécurité', recentMoves: 'Coups récents', capturedPieces: 'Pièces capturées', whiteCaptured: 'Pertes blanches', blackCaptured: 'Pertes noires', noMoves: 'Aucun coup pour le moment', noCaptures: 'Aucune', white: 'Blancs', black: 'Noirs', pawnOpportunityTitle: 'Le choix partagé du premier pion', pawnOpportunityIntro: 'Chaque camp a une seule occasion d’avancer de deux cases : seul son premier pion à jouer peut le faire. S’il avance d’une case, l’occasion est perdue.', pawnLeapTitle: 'Tentez le saut de deux cases', pawnLeapText: 'Exemple : votre premier pion avance de deux cases. L’occasion est utilisée ; tous les autres pions avancent d’une case à la fois.', pawnSingleTitle: 'Choisir une case', pawnSingleText: 'Exemple : votre premier pion avance d’une case. Le deuxième et tous les suivants ne pourront avancer que d’une case à la fois.' },
    de: { languageLabel: 'Sprache wählen', battleLogOption: 'Kampfprotokoll anzeigen', battleLog: 'Kampfprotokoll', activeSide: 'Am Zug', checkStatus: 'Königsstatus', inCheck: 'IM SCHACH', kingSafe: 'König sicher', recentMoves: 'Letzte Züge', capturedPieces: 'Geschlagene Figuren', whiteCaptured: 'Verluste Weiß', blackCaptured: 'Verluste Schwarz', noMoves: 'Noch keine Züge', noCaptures: 'Keine', white: 'Weiß', black: 'Schwarz', pawnOpportunityTitle: 'Die gemeinsame Chance des ersten Bauern', pawnOpportunityIntro: 'Jede Seite hat eine einzige Chance auf zwei Felder: Nur ihr erster ziehender Bauer kann sie nutzen. Zieht er ein Feld, ist die Chance vertan.', pawnLeapTitle: 'Den Doppelschritt nutzen', pawnLeapText: 'Beispiel: Dein erster Bauer zieht zwei Felder. Die Chance ist verbraucht; alle weiteren Bauern ziehen jeweils nur ein Feld.', pawnSingleTitle: 'Nur ein Feld wählen', pawnSingleText: 'Beispiel: Dein erster Bauer zieht ein Feld. Dein zweiter und alle weiteren Bauern dürfen dann nur jeweils ein Feld ziehen.' },
    pt: { languageLabel: 'Escolher idioma', battleLogOption: 'Mostrar registro da batalha', battleLog: 'Registro da batalha', activeSide: 'A jogar', checkStatus: 'Estado do rei', inCheck: 'EM XEQUE', kingSafe: 'Rei seguro', recentMoves: 'Lances recentes', capturedPieces: 'Peças capturadas', whiteCaptured: 'Perdas brancas', blackCaptured: 'Perdas pretas', noMoves: 'Ainda sem lances', noCaptures: 'Nenhuma', white: 'Brancas', black: 'Pretas', pawnOpportunityTitle: 'Uma chance compartilhada para o primeiro peão', pawnOpportunityIntro: 'Cada lado tem uma chance de avançar duas casas: só o primeiro peão a se mover pode usá-la. Se ele avançar uma casa, a chance acaba.', pawnLeapTitle: 'Avance duas casas', pawnLeapText: 'Exemplo: seu primeiro peão avança duas casas. A chance acaba; todos os outros avançam uma casa por vez.', pawnSingleTitle: 'Escolha uma casa', pawnSingleText: 'Exemplo: seu primeiro peão avança uma casa. O segundo e todos os seguintes só poderão avançar uma casa por vez.' },
    it: { languageLabel: 'Scegli lingua', battleLogOption: 'Mostra il diario di battaglia', battleLog: 'Diario di battaglia', activeSide: 'Tocca a', checkStatus: 'Stato del re', inCheck: 'SOTTO SCACCO', kingSafe: 'Re al sicuro', recentMoves: 'Mosse recenti', capturedPieces: 'Pezzi catturati', whiteCaptured: 'Perdite bianche', blackCaptured: 'Perdite nere', noMoves: 'Ancora nessuna mossa', noCaptures: 'Nessuna', white: 'Bianchi', black: 'Neri', pawnOpportunityTitle: 'Una scelta condivisa per il primo pedone', pawnOpportunityIntro: 'Ogni lato ha una sola occasione per avanzare di due caselle: può farlo solo il primo pedone mosso. Se avanza di una casella, l’occasione è persa.', pawnLeapTitle: 'Sfrutta il salto di due caselle', pawnLeapText: 'Esempio: il primo pedone avanza di due caselle. L’occasione è consumata; tutti gli altri pedoni avanzano di una casella alla volta.', pawnSingleTitle: 'Scegli una casella', pawnSingleText: 'Esempio: il primo pedone avanza di una casella. Il secondo e tutti gli altri potranno avanzare solo di una casella alla volta.' },
    ja: { languageLabel: '言語を選択', battleLogOption: '対局記録を表示', battleLog: '対局の記録', activeSide: '手番', checkStatus: 'キングの状態', inCheck: 'チェック中', kingSafe: '安全', recentMoves: '最近の指し手', capturedPieces: '取られた駒', whiteCaptured: '白の損失', blackCaptured: '黒の損失', noMoves: 'まだ指し手はありません', noCaptures: 'なし', white: '白', black: '黒', pawnOpportunityTitle: '最初のポーンだけの共有チャンス', pawnOpportunityIntro: '白黒それぞれ、最初に動かすポーンだけが2マス進めます。そのポーンが1マス進むと、2マス進むチャンスはなくなります。', pawnLeapTitle: '2マス進めるチャンスを使う', pawnLeapText: '例：最初のポーンを2マス進めます。チャンスを使い切るため、ほかのポーンはすべて1マスずつ進みます。', pawnSingleTitle: '1マスを選ぶ', pawnSingleText: '例：最初のポーンを1マス進めます。2番目以降のポーンも、すべて1マスずつしか進めません。' },
    zh: { languageLabel: '选择语言', battleLog: '对战记录', activeSide: '轮到', checkStatus: '王的状态', inCheck: '正在被将军', kingSafe: '王安全', recentMoves: '最近的走棋', capturedPieces: '被吃掉的棋子', whiteCaptured: '白方损失', blackCaptured: '黑方损失', noMoves: '尚无走棋', noCaptures: '无', white: '白方', black: '黑方' },
    hi: { languageLabel: 'भाषा चुनें', battleLog: 'युद्ध लॉग', activeSide: 'चाल', checkStatus: 'राजा की स्थिति', inCheck: 'शह', kingSafe: 'राजा सुरक्षित', recentMoves: 'हाल की चालें', capturedPieces: 'मारे गए मोहरे', whiteCaptured: 'सफेद के नुकसान', blackCaptured: 'काले के नुकसान', noMoves: 'अभी कोई चाल नहीं', noCaptures: 'कोई नहीं', white: 'सफेद', black: 'काला' },
    ar: { languageLabel: 'اختر اللغة', battleLog: 'سجل المعركة', activeSide: 'الدور على', checkStatus: 'حالة الملك', inCheck: 'كش', kingSafe: 'الملك بأمان', recentMoves: 'الحركات الأخيرة', capturedPieces: 'القطع المأسورة', whiteCaptured: 'خسائر الأبيض', blackCaptured: 'خسائر الأسود', noMoves: 'لا توجد حركات بعد', noCaptures: 'لا شيء', white: 'الأبيض', black: 'الأسود' },
    bn: { languageLabel: 'ভাষা নির্বাচন করুন', battleLog: 'যুদ্ধের নথি', activeSide: 'চাল দেবেন', checkStatus: 'রাজার অবস্থা', inCheck: 'চেক', kingSafe: 'রাজা নিরাপদ', recentMoves: 'সাম্প্রতিক চাল', capturedPieces: 'ধরা পড়া ঘুঁটি', whiteCaptured: 'সাদার ক্ষতি', blackCaptured: 'কালোর ক্ষতি', noMoves: 'এখনও কোনো চাল নেই', noCaptures: 'কিছু নেই', white: 'সাদা', black: 'কালো' },
    ru: { languageLabel: 'Выбрать язык', battleLog: 'Журнал сражения', activeSide: 'Ход', checkStatus: 'Состояние короля', inCheck: 'ШАХ', kingSafe: 'Король в безопасности', recentMoves: 'Последние ходы', capturedPieces: 'Сбитые фигуры', whiteCaptured: 'Потери белых', blackCaptured: 'Потери чёрных', noMoves: 'Ходов пока нет', noCaptures: 'Нет', white: 'Белые', black: 'Чёрные' },
    id: { languageLabel: 'Pilih bahasa', battleLog: 'Catatan pertempuran', activeSide: 'Giliran', checkStatus: 'Status raja', inCheck: 'SKAK', kingSafe: 'Raja aman', recentMoves: 'Langkah terbaru', capturedPieces: 'Bidak tertangkap', whiteCaptured: 'Korban putih', blackCaptured: 'Korban hitam', noMoves: 'Belum ada langkah', noCaptures: 'Tidak ada', white: 'Putih', black: 'Hitam' },
    ur: { languageLabel: 'زبان منتخب کریں', battleLog: 'جنگ کا ریکارڈ', activeSide: 'چال', checkStatus: 'بادشاہ کی حالت', inCheck: 'شہ مات کا خطرہ', kingSafe: 'بادشاہ محفوظ', recentMoves: 'حالیہ چالیں', capturedPieces: 'گرفتار مہرے', whiteCaptured: 'سفید کا نقصان', blackCaptured: 'سیاہ کا نقصان', noMoves: 'ابھی کوئی چال نہیں', noCaptures: 'کوئی نہیں', white: 'سفید', black: 'سیاہ' },
    tr: { languageLabel: 'Dil seçin', battleLog: 'Savaş günlüğü', activeSide: 'Sıra', checkStatus: 'Şahın durumu', inCheck: 'ŞAH', kingSafe: 'Şah güvende', recentMoves: 'Son hamleler', capturedPieces: 'Alınan taşlar', whiteCaptured: 'Beyaz kayıpları', blackCaptured: 'Siyah kayıpları', noMoves: 'Henüz hamle yok', noCaptures: 'Yok', white: 'Beyaz', black: 'Siyah' },
    ko: { languageLabel: '언어 선택', battleLog: '대국 기록', activeSide: '차례', checkStatus: '킹 상태', inCheck: '체크', kingSafe: '킹 안전', recentMoves: '최근 수', capturedPieces: '잡힌 기물', whiteCaptured: '백의 손실', blackCaptured: '흑의 손실', noMoves: '아직 둔 수가 없습니다', noCaptures: '없음', white: '백', black: '흑' },
    vi: { languageLabel: 'Chọn ngôn ngữ', battleLog: 'Nhật ký trận đấu', activeSide: 'Lượt đi', checkStatus: 'Trạng thái vua', inCheck: 'CHIẾU', kingSafe: 'Vua an toàn', recentMoves: 'Nước đi gần đây', capturedPieces: 'Quân bị bắt', whiteCaptured: 'Quân trắng mất', blackCaptured: 'Quân đen mất', noMoves: 'Chưa có nước đi', noCaptures: 'Không có', white: 'Trắng', black: 'Đen' },
    tl: { languageLabel: 'Pumili ng wika', battleLog: 'Tala ng labanan', activeSide: 'Sunod na gagalaw', checkStatus: 'Kalagayan ng hari', inCheck: 'NAKA-TSEK', kingSafe: 'Ligtas ang hari', recentMoves: 'Mga huling galaw', capturedPieces: 'Mga piyesang nakuha', whiteCaptured: 'Nawala sa puti', blackCaptured: 'Nawala sa itim', noMoves: 'Wala pang galaw', noCaptures: 'Wala', white: 'Puti', black: 'Itim' },
    nl: { languageLabel: 'Kies een taal', battleLog: 'Gevechtslogboek', activeSide: 'Aan zet', checkStatus: 'Koningsstatus', inCheck: 'SCHAAK', kingSafe: 'Koning veilig', recentMoves: 'Recente zetten', capturedPieces: 'Geslagen stukken', whiteCaptured: 'Verlies wit', blackCaptured: 'Verlies zwart', noMoves: 'Nog geen zetten', noCaptures: 'Geen', white: 'Wit', black: 'Zwart' },
    sw: { languageLabel: 'Chagua lugha', battleLog: 'Rekodi ya pambano', activeSide: 'Zamu ya', checkStatus: 'Hali ya mfalme', inCheck: 'SHAKI', kingSafe: 'Mfalme yuko salama', recentMoves: 'Hatua za hivi karibuni', capturedPieces: 'Vikapu vilivyokamatwa', whiteCaptured: 'Hasara za weupe', blackCaptured: 'Hasara za weusi', noMoves: 'Hakuna hatua bado', noCaptures: 'Hakuna', white: 'Weupe', black: 'Weusi' },
    mi: { languageLabel: 'Kōwhiria te reo', battleLog: 'Rārangi pakanga', activeSide: 'Kei te neke', checkStatus: 'Te āhua o te kīngi', inCheck: 'Kua whakaekea', kingSafe: 'Kei te haumaru', recentMoves: 'Ngā nekehanga tata', capturedPieces: 'Ngā mongamonga kua mau', whiteCaptured: 'Ngā mate o Mā', blackCaptured: 'Ngā mate o Pango', noMoves: 'Kāore anō kia neke', noCaptures: 'Kāore he mea', white: 'Mā', black: 'Pango' },
    sm: { languageLabel: 'Filifili le gagana', battleLog: 'Faamaumauga o le taua', activeSide: 'Le isi e minoi', checkStatus: 'Tulaga o le tupu', inCheck: 'SIKI', kingSafe: 'Saogalemu le tupu', recentMoves: 'Gaioiga lata mai', capturedPieces: 'Fasi ua maua', whiteCaptured: 'Toilalo o le paʻepaʻe', blackCaptured: 'Toilalo o le uliuli', noMoves: 'E leai ni gaioiga', noCaptures: 'Leai', white: 'Paʻepaʻe', black: 'Uliuli' },
    haw: { languageLabel: 'Koho i ka ʻōlelo', battleLog: 'Moʻolelo kaua', activeSide: 'Ka mea e neʻe', checkStatus: 'Ke kūlana o ke aliʻi', inCheck: 'NĀNĀ', kingSafe: 'Palekana ke aliʻi', recentMoves: 'Nā neʻe hou', capturedPieces: 'Nā ʻāpana i hopu ʻia', whiteCaptured: 'Nā lilo o ke keʻokeʻo', blackCaptured: 'Nā lilo o ka ʻeleʻele', noMoves: 'ʻAʻohe neʻe i kēia manawa', noCaptures: 'ʻAʻohe', white: 'Keʻokeʻo', black: 'ʻEleʻele' },
    pa: { languageLabel: 'ਭਾਸ਼ਾ ਚੁਣੋ', battleLog: 'ਲੜਾਈ ਦਾ ਰਿਕਾਰਡ', activeSide: 'ਚਾਲ', checkStatus: 'ਰਾਜੇ ਦੀ ਹਾਲਤ', inCheck: 'ਸ਼ਹ', kingSafe: 'ਰਾਜਾ ਸੁਰੱਖਿਅਤ', recentMoves: 'ਹਾਲੀਆ ਚਾਲਾਂ', capturedPieces: 'ਫੜੇ ਗਏ ਮੋਹਰੇ', whiteCaptured: 'ਚਿੱਟੇ ਦੇ ਨੁਕਸਾਨ', blackCaptured: 'ਕਾਲੇ ਦੇ ਨੁਕਸਾਨ', noMoves: 'ਹਾਲੇ ਕੋਈ ਚਾਲ ਨਹੀਂ', noCaptures: 'ਕੋਈ ਨਹੀਂ', white: 'ਚਿੱਟਾ', black: 'ਕਾਲਾ' },
    ta: { languageLabel: 'மொழியைத் தேர்ந்தெடுக்கவும்', battleLog: 'ஆட்டப் பதிவு', activeSide: 'முறை', checkStatus: 'அரசரின் நிலை', inCheck: 'செக்', kingSafe: 'அரசர் பாதுகாப்பாக உள்ளார்', recentMoves: 'சமீபத்திய நகர்வுகள்', capturedPieces: 'பிடிக்கப்பட்ட காய்கள்', whiteCaptured: 'வெள்ளையின் இழப்புகள்', blackCaptured: 'கருப்பின் இழப்புகள்', noMoves: 'இன்னும் நகர்வுகள் இல்லை', noCaptures: 'எதுவுமில்லை', white: 'வெள்ளை', black: 'கருப்பு' },
    te: { languageLabel: 'భాషను ఎంచుకోండి', battleLog: 'ఆట రికార్డు', activeSide: 'వంతు', checkStatus: 'రాజు స్థితి', inCheck: 'చెక్', kingSafe: 'రాజు సురక్షితం', recentMoves: 'ఇటీవలి ఎత్తులు', capturedPieces: 'పట్టుబడిన పావులు', whiteCaptured: 'తెలుపు నష్టాలు', blackCaptured: 'నలుపు నష్టాలు', noMoves: 'ఇంకా ఎత్తులు లేవు', noCaptures: 'ఏమీ లేవు', white: 'తెలుపు', black: 'నలుపు' },
    mr: { languageLabel: 'भाषा निवडा', battleLog: 'खेळाची नोंद', activeSide: 'चाल', checkStatus: 'राजाची स्थिती', inCheck: 'शह', kingSafe: 'राजा सुरक्षित', recentMoves: 'अलीकडील चाली', capturedPieces: 'पकडलेले मोहरे', whiteCaptured: 'पांढऱ्याचे नुकसान', blackCaptured: 'काळ्याचे नुकसान', noMoves: 'अजून चाल नाही', noCaptures: 'काही नाही', white: 'पांढरा', black: 'काळा' },
    fa: { languageLabel: 'انتخاب زبان', battleLog: 'گزارش نبرد', activeSide: 'نوبت', checkStatus: 'وضعیت شاه', inCheck: 'کیش', kingSafe: 'شاه در امان است', recentMoves: 'حرکت‌های اخیر', capturedPieces: 'مهره‌های گرفته‌شده', whiteCaptured: 'تلفات سفید', blackCaptured: 'تلفات سیاه', noMoves: 'هنوز حرکتی نیست', noCaptures: 'هیچ‌کدام', white: 'سفید', black: 'سیاه' },
    pl: { languageLabel: 'Wybierz język', battleLog: 'Dziennik bitwy', activeSide: 'Ruch', checkStatus: 'Stan króla', inCheck: 'SZACH', kingSafe: 'Król bezpieczny', recentMoves: 'Ostatnie ruchy', capturedPieces: 'Zbite figury', whiteCaptured: 'Straty białych', blackCaptured: 'Straty czarnych', noMoves: 'Brak ruchów', noCaptures: 'Brak', white: 'Białe', black: 'Czarne' },
    th: { languageLabel: 'เลือกภาษา', battleLog: 'บันทึกการต่อสู้', activeSide: 'ตาเดิน', checkStatus: 'สถานะของคิง', inCheck: 'รุกฆาต', kingSafe: 'คิงปลอดภัย', recentMoves: 'ตาเดินล่าสุด', capturedPieces: 'หมากที่ถูกกิน', whiteCaptured: 'หมากฝ่ายขาวที่เสีย', blackCaptured: 'หมากฝ่ายดำที่เสีย', noMoves: 'ยังไม่มีการเดิน', noCaptures: 'ไม่มี', white: 'ขาว', black: 'ดำ' },
    ms: { languageLabel: 'Pilih bahasa', battleLog: 'Rekod pertempuran', activeSide: 'Giliran', checkStatus: 'Status raja', inCheck: 'SKAK', kingSafe: 'Raja selamat', recentMoves: 'Gerakan terkini', capturedPieces: 'Buah yang ditangkap', whiteCaptured: 'Kehilangan putih', blackCaptured: 'Kehilangan hitam', noMoves: 'Belum ada gerakan', noCaptures: 'Tiada', white: 'Putih', black: 'Hitam' },
};

const CHECK_ALERT_TRANSLATIONS = {
    es: { checkAlertYourKing: '¡Tu rey está en jaque!', checkAlertWhiteKing: '¡El rey blanco está en jaque!', checkAlertBlackKing: '¡El rey negro está en jaque!' },
    fr: { checkAlertYourKing: 'Votre roi est en échec !', checkAlertWhiteKing: 'Le roi blanc est en échec !', checkAlertBlackKing: 'Le roi noir est en échec !' },
    de: { checkAlertYourKing: 'Dein König steht im Schach!', checkAlertWhiteKing: 'Der weiße König steht im Schach!', checkAlertBlackKing: 'Der schwarze König steht im Schach!' },
    pt: { checkAlertYourKing: 'Seu rei está em xeque!', checkAlertWhiteKing: 'O rei branco está em xeque!', checkAlertBlackKing: 'O rei preto está em xeque!' },
    it: { checkAlertYourKing: 'Il tuo re è sotto scacco!', checkAlertWhiteKing: 'Il re bianco è sotto scacco!', checkAlertBlackKing: 'Il re nero è sotto scacco!' },
    ja: { checkAlertYourKing: 'あなたのキングがチェックされています！', checkAlertWhiteKing: '白のキングがチェックされています！', checkAlertBlackKing: '黒のキングがチェックされています！' },
};

const SOUND_TRANSLATIONS = {
    es: { gameMenu: 'Controles', soundOptions: 'Opciones de sonido', music: 'Música', clashes: 'Choques', backgroundMusicLabel: 'Activar o desactivar la música de fondo', clashSoundsLabel: 'Activar o desactivar los sonidos de choque de batalla' },
    fr: { gameMenu: 'Commandes', soundOptions: 'Options audio', music: 'Musique', clashes: 'Chocs', backgroundMusicLabel: 'Activer ou désactiver la musique de fond', clashSoundsLabel: 'Activer ou désactiver les sons de choc des combats' },
    de: { gameMenu: 'Steuerung', soundOptions: 'Toneinstellungen', music: 'Musik', clashes: 'Kämpfe', backgroundMusicLabel: 'Hintergrundmusik ein- oder ausschalten', clashSoundsLabel: 'Kampfgeräusche ein- oder ausschalten' },
    pt: { gameMenu: 'Controlos', soundOptions: 'Opções de som', music: 'Música', clashes: 'Choques', backgroundMusicLabel: 'Ativar ou desativar a música de fundo', clashSoundsLabel: 'Ativar ou desativar os sons de choque da batalha' },
    it: { gameMenu: 'Comandi', soundOptions: 'Opzioni audio', music: 'Musica', clashes: 'Scontri', backgroundMusicLabel: 'Attiva o disattiva la musica di sottofondo', clashSoundsLabel: 'Attiva o disattiva i suoni degli scontri' },
    ja: { gameMenu: '設定', soundOptions: 'サウンド設定', music: '音楽', clashes: '効果音', backgroundMusicLabel: 'BGMのオン・オフ', clashSoundsLabel: '戦闘の衝突音のオン・オフ' },
};

const BOARD_LAYOUT_TRANSLATIONS = {
    es: { boardDisplay: 'Ajustes del tablero', colorBlindMode: 'Colores aptos para daltonismo', boardSize: 'Tamaño del tablero', arrangeBoard: 'Mover tablero', arrangeBoardHint: 'Arrastra el tablero para colocarlo. Con el botón enfocado, usa las flechas para ajustarlo.', resetBoardView: 'Restablecer vista del tablero' },
    fr: { boardDisplay: 'Réglages du plateau', colorBlindMode: 'Couleurs adaptées au daltonisme', boardSize: 'Taille du plateau', arrangeBoard: 'Déplacer le plateau', arrangeBoardHint: 'Faites glisser le plateau pour le placer. Bouton sélectionné : utilisez les flèches pour le déplacer.', resetBoardView: 'Réinitialiser la vue du plateau' },
    de: { boardDisplay: 'Bretteinstellungen', colorBlindMode: 'Farben für Farbenblindheit', boardSize: 'Brettgröße', arrangeBoard: 'Brett verschieben', arrangeBoardHint: 'Ziehe das Brett an die gewünschte Stelle. Mit fokussierter Schaltfläche kannst du es per Pfeiltasten verschieben.', resetBoardView: 'Brettansicht zurücksetzen' },
    pt: { boardDisplay: 'Ajustes do tabuleiro', colorBlindMode: 'Cores acessíveis para daltonismo', boardSize: 'Tamanho do tabuleiro', arrangeBoard: 'Mover tabuleiro', arrangeBoardHint: 'Arraste o tabuleiro para posicioná-lo. Com o botão em foco, use as setas para ajustar.', resetBoardView: 'Repor vista do tabuleiro' },
    it: { boardDisplay: 'Impostazioni scacchiera', colorBlindMode: 'Colori adatti al daltonismo', boardSize: 'Dimensione scacchiera', arrangeBoard: 'Sposta scacchiera', arrangeBoardHint: 'Trascina la scacchiera per posizionarla. Con il pulsante selezionato, usa le frecce per spostarla.', resetBoardView: 'Ripristina vista scacchiera' },
    ja: { boardDisplay: '盤面表示設定', colorBlindMode: '色覚サポート配色', boardSize: '盤面サイズ', arrangeBoard: '盤面を移動', arrangeBoardHint: '盤面をドラッグして配置します。ボタンにフォーカスした状態で矢印キーを押すと微調整できます。', resetBoardView: '盤面表示をリセット' },
};

const CHECK_STATUS_TRANSLATIONS = {
    en: {
        checkYourMove: 'Check! Your king is under attack. Your move',
        checkOpponent: "Check! Your opponent's king is under attack. They must respond",
    },
    es: {
        checkYourMove: '¡Jaque! Tu rey está bajo ataque. Tu turno',
        checkOpponent: '¡Jaque! El rey de tu rival está bajo ataque. Debe responder',
    },
    fr: {
        checkYourMove: 'Échec ! Votre roi est attaqué. À vous de jouer',
        checkOpponent: 'Échec ! Le roi adverse est attaqué. Votre adversaire doit répondre',
    },
    de: {
        checkYourMove: 'Schach! Dein König wird angegriffen. Du bist am Zug',
        checkOpponent: 'Schach! Der König deines Gegners wird angegriffen. Dein Gegner muss reagieren',
    },
    pt: {
        checkYourMove: 'Xeque! Seu rei está sob ataque. Sua vez',
        checkOpponent: 'Xeque! O rei adversário está sob ataque. Seu oponente precisa responder',
    },
    it: {
        checkYourMove: 'Scacco! Il tuo re è sotto attacco. Tocca a te',
        checkOpponent: 'Scacco! Il re avversario è sotto attacco. L’avversario deve rispondere',
    },
    ja: {
        checkYourMove: 'チェック！あなたのキングが攻撃されています。あなたの番です',
        checkOpponent: 'チェック！相手のキングが攻撃されています。相手は応手が必要です',
    },
};

export function translate(language, key, values = {}) {
    const dictionary = {
        ...(EXTRA_TRANSLATIONS[language] || {}),
        ...(CASTLING_TRANSLATIONS[language] || {}),
        ...(HISTORY_TRANSLATIONS[language] || {}),
        ...(SOUND_TRANSLATIONS[language] || {}),
        ...(BOARD_LAYOUT_TRANSLATIONS[language] || {}),
        ...(CHECK_ALERT_TRANSLATIONS[language] || {}),
        ...(TRANSLATIONS[language] || {}),
        ...(RESET_BUTTON_TRANSLATIONS[language] || {}),
        ...(CHECKMATE_TRANSLATIONS[language] || {}),
        ...(CHECK_STATUS_TRANSLATIONS[language] || {}),
    };
    const template = dictionary[key] ?? ENGLISH[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
}

const CASTLING_TRANSLATIONS = {
    en: {
        castlingTitle: 'Castling',
        castlingText: 'Move the king two squares toward a rook, then move the rook to the square the king crossed.',
        castlingRules: 'You can castle only if the king and rook have not moved, no pieces are between them, and the king is not in check, crosses no attacked square, and ends safe.',
    },
    es: {
        castlingTitle: 'Enroque',
        castlingText: 'Mueve el rey dos casillas hacia una torre y coloca la torre en la casilla que cruzó el rey.',
        castlingRules: 'Solo puedes enrocar si el rey y la torre no se han movido, no hay piezas entre ellos y el rey no está en jaque, no cruza una casilla atacada ni termina en jaque.',
    },
    fr: {
        castlingTitle: 'Le roque',
        castlingText: 'Avancez le roi de deux cases vers une tour, puis placez la tour sur la case traversée par le roi.',
        castlingRules: 'Le roque est possible si le roi et la tour n’ont pas bougé, qu’aucune pièce ne les sépare et que le roi n’est pas en échec, ne traverse aucune case attaquée et ne termine pas en échec.',
    },
    de: {
        castlingTitle: 'Rochade',
        castlingText: 'Ziehe den König zwei Felder zum Turm; der Turm kommt auf das Feld, das der König überquert hat.',
        castlingRules: 'Rochieren darfst du nur, wenn König und Turm noch nicht gezogen haben, keine Figuren dazwischenstehen und der König nicht im Schach steht, über ein angegriffenes Feld zieht oder im Schach landet.',
    },
    pt: {
        castlingTitle: 'Roque',
        castlingText: 'Mova o rei duas casas em direção a uma torre; depois, coloque a torre na casa que o rei atravessou.',
        castlingRules: 'Só pode rocar se o rei e a torre ainda não se moveram, não houver peças entre eles e o rei não estiver em xeque, não passar por uma casa atacada nem terminar em xeque.',
    },
    it: {
        castlingTitle: 'Arrocco',
        castlingText: 'Muovi il re di due caselle verso una torre, poi sposta la torre nella casella attraversata dal re.',
        castlingRules: 'Puoi arroccare solo se il re e la torre non si sono mossi, non ci sono pezzi tra loro e il re non è sotto scacco, non attraversa case attaccate e non finisce sotto scacco.',
    },
    ja: {
        castlingTitle: 'キャスリング',
        castlingText: 'キングをルークの方へ2マス動かし、ルークをキングが通ったマスへ移します。',
        castlingRules: 'キングとルークが未移動で、間に駒がなく、キングがチェック中でなく、攻撃されたマスを通らず、移動後もチェックされない場合に限り、キャスリングできます。',
    },
};

const HISTORY_TRANSLATIONS = {
    en: {
        historyTitle: 'A brief history',
        historyText: 'Chess is thought to have begun in India around the 6th century as a game called chaturanga, then spread through Persia to Europe. By the late 15th century, European rules had changed dramatically: the queen gained much of its modern power, the bishop acquired its modern long-range diagonal move, and special moves such as castling and en passant took shape. Stalemate also took shape as a recognized outcome during this period, with its status as a draw standardized in the 19th century. Shared rules define legal moves and goals so everyone plays by the same fair standards.',
        historyRuleText: 'White always moves first, following the standard 19th-century chess rules.',
    },
    es: {
        historyTitle: 'Breve historia',
        historyText: 'Se cree que el ajedrez nació en la India hacia el siglo VI como un juego llamado chaturanga y llegó a Europa a través de Persia. Hacia finales del siglo XV, las reglas europeas cambiaron mucho: la dama adquirió gran parte de su poder actual, el alfil obtuvo su actual movimiento diagonal de largo alcance y tomaron forma jugadas especiales como el enroque y la captura al paso. En esa época también se fue definiendo el ahogado como resultado de la partida; su reconocimiento como tablas se estandarizó en el siglo XIX. Las reglas definen los movimientos y el objetivo para que todos jueguen en igualdad de condiciones.',
        historyRuleText: 'Las blancas siempre hacen la primera jugada, según las reglas estándar del ajedrez del siglo XIX.',
    },
    fr: {
        historyTitle: 'Un peu d’histoire',
        historyText: 'On pense que les échecs sont nés en Inde au VIe siècle sous le nom de chaturanga, puis ont gagné l’Europe via la Perse. À la fin du XVe siècle, les règles européennes évoluent fortement : la dame acquiert une grande partie de sa puissance actuelle, le fou adopte son déplacement diagonal à longue portée actuel, et le roque ainsi que la prise en passant prennent forme. Le pat se précise également comme issue de la partie à cette époque, avant d’être standardisé comme partie nulle au XIXe siècle. Des règles communes définissent les coups et le but pour que tous jouent équitablement.',
        historyRuleText: 'Les Blancs jouent toujours le premier coup, selon les règles standard des échecs du XIXe siècle.',
    },
    de: {
        historyTitle: 'Kurze Schachgeschichte',
        historyText: 'Schach entstand vermutlich im 6. Jahrhundert in Indien als Chaturanga und gelangte über Persien nach Europa. Gegen Ende des 15. Jahrhunderts veränderten sich die europäischen Schachregeln stark: Die Dame erhielt einen Großteil ihrer heutigen Zugkraft, der Läufer seinen heutigen weitreichenden Diagonalzug, und Sonderzüge wie Rochade und en passant entwickelten sich. Auch das Patt entwickelte sich in dieser Zeit zu einem anerkannten Partieausgang; im 19. Jahrhundert wurde es als Remis standardisiert. Gemeinsame Regeln legen erlaubte Züge und das Ziel fest, damit alle fair spielen.',
        historyRuleText: 'Weiß macht immer den ersten Zug, gemäß den standardmäßigen Schachregeln des 19. Jahrhunderts.',
    },
    pt: {
        historyTitle: 'Um pouco de história',
        historyText: 'Acredita-se que o xadrez surgiu na Índia, por volta do século VI, como chaturanga, e chegou à Europa pela Pérsia. No final do século XV, as regras europeias mudaram bastante: a dama ganhou grande parte de seu poder atual, o bispo passou a mover-se por longas diagonais como hoje, e movimentos especiais como o roque e a captura en passant tomaram forma. O afogamento também começou a se definir como resultado nessa época, e seu reconhecimento como empate foi padronizado no século XIX. Regras comuns definem os movimentos e o objetivo para que todos joguem de forma justa.',
        historyRuleText: 'As brancas sempre fazem o primeiro lance, segundo as regras padrão do xadrez do século XIX.',
    },
    it: {
        historyTitle: 'Breve storia',
        historyText: 'Si pensa che gli scacchi siano nati in India nel VI secolo come chaturanga e siano arrivati in Europa passando per la Persia. Verso la fine del XV secolo, le regole europee cambiarono molto: la regina acquisì gran parte del suo potere attuale, l’alfiere ottenne il suo attuale movimento diagonale a lunga distanza e presero forma mosse speciali come l’arrocco e la presa en passant. Anche lo stallo si affermò come esito della partita in questo periodo, e nel XIX secolo fu standardizzato come patta. Regole condivise definiscono mosse e obiettivo, così tutti giocano in modo equo.',
        historyRuleText: 'Il Bianco muove sempre per primo, secondo le regole standard degli scacchi del XIX secolo.',
    },
    ja: {
        historyTitle: 'チェスの歴史',
        historyText: 'チェスは6世紀ごろのインドで「チャトランガ」として生まれ、ペルシャを経てヨーロッパへ広まったと考えられています。15世紀後半、ヨーロッパのチェスのルールは大きく変化しました。クイーンは現在のような強力な動きを得て、ビショップは現在のように遠くまで斜めに動けるようになり、キャスリングやアンパッサンなどの特殊な手も形づくられていきました。この時代にはステイルメイトも対局の結果として形づくられ、19世紀に引き分けとして標準化されました。ルールは駒の動きと勝利条件を定め、誰もが同じ条件で公平に遊べるようにします。',
        historyRuleText: '19世紀の標準的なチェスのルールに従い、白が必ず先に指します。',
    },
};
