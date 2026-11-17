var TEXT_GAMEOVER  = "%s WINS";
var TEXT_DRAW      = "DRAW";
var TEXT_DIFFICULTY = "DIFFICULTY";
var TEXT_STALL     = "STALL";
var TEXT_NOMOVES   = "%s CAN'T MOVE";
var TEXT_HELP1     = "FLIP YOUR OPPONENT'S PIECES BY TRAPPING THEM BETWEEN TWO OF YOUR OWN.";
var TEXT_HELP2     = "YOUR AIM IS TO OWN MORE PIECES THAN YOUR OPPONENT WHEN THE GAME IS OVER.";
var TEXT_PLAYER = "Player";
var TEXT_AI = "AI";
var TEXT_BLACK     = "Black";
var TEXT_WHITE     = "White";

/////
var TEXT_LOCAL_PLAY = "PLAY LOCAL";
var TEXT_LOCAL_PLAY_EXPL = "ON THE SAME DEVICE";
var TEXT_MULTIPLAYER = "MULTIPLAYER";
var TEXT_MULTIPLAYER_EXPL = "PLAY ONLINE";
var TEXT_TRAINING = "TRAINING";
var TEXT_TRAINING_EXPL = "PLAY AGAINST AI";
var TEXT_BEGINNER = "BEGINNER";
var TEXT_AMATEUR = "AMATEUR";
var TEXT_PRO = "PROFESSIONAL";


function refreshLanguage(){
	if(s_iCurLang === LANG_AR){
        s_oCanvas.setAttribute('dir','rtl');
    }else{
        s_oCanvas.setAttribute('dir','ltr');
    }
	
	refreshLanguage_multiplayer();
	
	switch(s_iCurLang){
        case LANG_EN:{
            //ENGLISH
			TEXT_GAMEOVER = "%s WINS";
			TEXT_DRAW = "DRAW";
			TEXT_DIFFICULTY = "DIFFICULTY";
			TEXT_STALL = "STALL";
			TEXT_NOMOVES = "%s CAN'T MOVE";
			TEXT_HELP1 = "FLIP YOUR OPPONENT'S PIECES BY TRAPPING THEM BETWEEN TWO OF YOUR OWN.";
			TEXT_HELP2 = "YOUR AIM IS TO OWN MORE PIECES THAN YOUR OPPONENT WHEN THE GAME IS OVER.";
			TEXT_PLAYER = "Player";
			TEXT_AI = "AI";
			TEXT_BLACK = "Black";
			TEXT_WHITE = "White";
			TEXT_LOCAL_PLAY = "PLAY LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "ON THE SAME DEVICE";
			TEXT_MULTIPLAYER = "MULTIPLAYER";
			TEXT_MULTIPLAYER_EXPL = "PLAY ONLINE";
			TEXT_TRAINING = "TRAINING";
			TEXT_TRAINING_EXPL = "PLAY AGAINST AI";
			TEXT_BEGINNER = "BEGINNER";
			TEXT_AMATEUR = "AMATEUR";
			TEXT_PRO = "PROFESSIONAL";

			break;
		}
		case LANG_ES:{
			//SPANISH
			TEXT_GAMEOVER = "%s GANA";
			TEXT_DRAW = "EMPATE";
			TEXT_DIFFICULTY = "DIFICULTAD";
			TEXT_STALL = "BLOQUEO";
			TEXT_NOMOVES = "%s NO PUEDE MOVERSE";
			TEXT_HELP1 = "DA LA VUELTA A LAS PIEZAS DE TU OPONENTE ATRAPÁNDOLAS ENTRE LAS TUYAS.";
			TEXT_HELP2 = "TU OBJETIVO ES TENER MÁS PIEZAS QUE TU OPONENTE AL FINAL DEL JUEGO.";
			TEXT_PLAYER = "Jugador";
			TEXT_AI = "IA";
			TEXT_BLACK = "Negro";
			TEXT_WHITE = "Blanco";
			TEXT_LOCAL_PLAY = "JUGAR LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "EN EL MISMO DISPOSITIVO";
			TEXT_MULTIPLAYER = "MULTIJUGADOR";
			TEXT_MULTIPLAYER_EXPL = "JUGAR EN LÍNEA";
			TEXT_TRAINING = "ENTRENAMIENTO";
			TEXT_TRAINING_EXPL = "JUGAR CONTRA IA";
			TEXT_BEGINNER = "PRINCIPIANTE";
			TEXT_AMATEUR = "AMATEUR";
			TEXT_PRO = "PROFESIONAL";
			
			break;
        }
		case LANG_FR:{
			//FRENCH
			TEXT_GAMEOVER = "%s GAGNE";
			TEXT_DRAW = "ÉGALITÉ";
			TEXT_DIFFICULTY = "DIFFICULTÉ";
			TEXT_STALL = "BLOQUÉ";
			TEXT_NOMOVES = "%s NE PEUT PAS BOUGER";
			TEXT_HELP1 = "RETROURNEZ LES PIÈCES DE VOTRE ADVERSAIRE EN LES PRENANT EN SANDWICH ENTRE LES VÔTRES.";
			TEXT_HELP2 = "VOTRE OBJECTIF EST D'AVOIR PLUS DE PIÈCES QUE VOTRE ADVERSAIRE À LA FIN DE LA PARTIE.";
			TEXT_PLAYER = "Joueur";
			TEXT_AI = "IA";
			TEXT_BLACK = "Noir";
			TEXT_WHITE = "Blanc";
			TEXT_LOCAL_PLAY = "JOUER EN LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "SUR LE MÊME APPAREIL";
			TEXT_MULTIPLAYER = "MULTIJOUEUR";
			TEXT_MULTIPLAYER_EXPL = "JOUER EN LIGNE";
			TEXT_TRAINING = "ENTRAÎNEMENT";
			TEXT_TRAINING_EXPL = "JOUER CONTRE L'IA";
			TEXT_BEGINNER = "DÉBUTANT";
			TEXT_AMATEUR = "AMATEUR";
			TEXT_PRO = "PROFESSIONNEL";

			break;
		}
		case LANG_DE:{
			//GERMAN
			TEXT_GAMEOVER = "%s GEWINNT";
			TEXT_DRAW = "UNENTSCHIEDEN";
			TEXT_DIFFICULTY = "SCHWIERIGKEIT";
			TEXT_STALL = "BLOCKIERT";
			TEXT_NOMOVES = "%s KANN NICHT ZIEHEN";
			TEXT_HELP1 = "DREHE DIE STEINE DEINES GEGNERS UM, INDEM DU SIE ZWISCHEN DEINE EINFÄNGST.";
			TEXT_HELP2 = "ZIEL IST ES, AM ENDE MEHR STEINE ALS DER GEGNER ZU HABEN.";
			TEXT_PLAYER = "Spieler";
			TEXT_AI = "KI";
			TEXT_BLACK = "Schwarz";
			TEXT_WHITE = "Weiß";
			TEXT_LOCAL_PLAY = "LOKAL SPIELEN";
			TEXT_LOCAL_PLAY_EXPL = "AUF DEM GLEICHEN GERÄT";
			TEXT_MULTIPLAYER = "MEHRSPIELER";
			TEXT_MULTIPLAYER_EXPL = "ONLINE SPIELEN";
			TEXT_TRAINING = "TRAINING";
			TEXT_TRAINING_EXPL = "GEGEN DIE KI SPIELEN";
			TEXT_BEGINNER = "ANFÄNGER";
			TEXT_AMATEUR = "AMATEUR";
			TEXT_PRO = "PROFI";

			break;
        }
        case LANG_PT:{
			//PORTUGUESE
			TEXT_GAMEOVER = "%s VENCE";
			TEXT_DRAW = "EMPATE";
			TEXT_DIFFICULTY = "DIFICULDADE";
			TEXT_STALL = "IMPASSE";
			TEXT_NOMOVES = "%s NÃO PODE MOVER";
			TEXT_HELP1 = "VIRE AS PEÇAS DO ADVERSÁRIO PRENDENDO-AS ENTRE DUAS SUAS.";
			TEXT_HELP2 = "SEU OBJETIVO É TER MAIS PEÇAS QUE SEU OPONENTE NO FINAL DO JOGO.";
			TEXT_PLAYER = "Jogador";
			TEXT_AI = "IA";
			TEXT_BLACK = "Preto";
			TEXT_WHITE = "Branco";
			TEXT_LOCAL_PLAY = "JOGAR LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "NO MESMO DISPOSITIVO";
			TEXT_MULTIPLAYER = "MULTIJOGADOR";
			TEXT_MULTIPLAYER_EXPL = "JOGAR ONLINE";
			TEXT_TRAINING = "TREINAMENTO";
			TEXT_TRAINING_EXPL = "JOGAR CONTRA IA";
			TEXT_BEGINNER = "INICIANTE";
			TEXT_AMATEUR = "AMADOR";
			TEXT_PRO = "PROFISSIONAL";

			break;
        }
        case LANG_IT:{
			//ITALIAN
			TEXT_GAMEOVER = "%s VINCE";
			TEXT_DRAW = "PAREGGIO";
			TEXT_DIFFICULTY = "DIFFICOLTÀ";
			TEXT_STALL = "STALLO";
			TEXT_NOMOVES = "%s NON PUÒ MUOVERSI";
			TEXT_HELP1 = "GIRA I PEZZI DELL'AVVERSARIO INTRAPPOLANDOLI TRA DUE DEI TUOI.";
			TEXT_HELP2 = "IL TUO OBIETTIVO È AVERE PIÙ PEZZI DELL'AVVERSARIO ALLA FINE DEL GIOCO.";
			TEXT_PLAYER = "Giocatore";
			TEXT_AI = "IA";
			TEXT_BLACK = "Nero";
			TEXT_WHITE = "Bianco";
			TEXT_LOCAL_PLAY = "GIOCO LOCALE";
			TEXT_LOCAL_PLAY_EXPL = "SULLO STESSO DISPOSITIVO";
			TEXT_MULTIPLAYER = "MULTIGIOCATORE";
			TEXT_MULTIPLAYER_EXPL = "GIOCA ONLINE";
			TEXT_TRAINING = "ALLENAMENTO";
			TEXT_TRAINING_EXPL = "GIOCA CONTRO L'IA";
			TEXT_BEGINNER = "PRINCIPIANTE";
			TEXT_AMATEUR = "AMATORE";
			TEXT_PRO = "PROFESSIONISTA";

			break;
		}
		case LANG_RU:{
			//RUSSIAN
			TEXT_GAMEOVER = "%s ПОБЕЖДАЕТ";
			TEXT_DRAW = "НИЧЬЯ";
			TEXT_DIFFICULTY = "СЛОЖНОСТЬ";
			TEXT_STALL = "ЗАСТОЙ";
			TEXT_NOMOVES = "%s НЕ МОЖЕТ ХОДИТЬ";
			TEXT_HELP1 = "ПЕРЕВОРАЧИВАЙТЕ ФИШКИ СОПЕРНИКА, ЗАЖИМАЯ ИХ МЕЖДУ СВОИМИ.";
			TEXT_HELP2 = "ЦЕЛЬ — ИМЕТЬ БОЛЬШЕ ФИШЕК, ЧЕМ У СОПЕРНИКА К КОНЦУ ИГРЫ.";
			TEXT_PLAYER = "Игрок";
			TEXT_AI = "ИИ";
			TEXT_BLACK = "Чёрный";
			TEXT_WHITE = "Белый";
			TEXT_LOCAL_PLAY = "ИГРАТЬ ЛОКАЛЬНО";
			TEXT_LOCAL_PLAY_EXPL = "НА ОДНОМ УСТРОЙСТВЕ";
			TEXT_MULTIPLAYER = "МУЛЬТИПЛЕЕР";
			TEXT_MULTIPLAYER_EXPL = "ИГРАТЬ ОНЛАЙН";
			TEXT_TRAINING = "ТРЕНИРОВКА";
			TEXT_TRAINING_EXPL = "ИГРАТЬ ПРОТИВ ИИ";
			TEXT_BEGINNER = "НОВИЧОК";
			TEXT_AMATEUR = "ЛЮБИТЕЛЬ";
			TEXT_PRO = "ПРОФЕССИОНАЛ";

			break;
		}
		case LANG_TR:{
			//TURKISH
			TEXT_GAMEOVER = "%s KAZANDI";
			TEXT_DRAW = "BERABERE";
			TEXT_DIFFICULTY = "ZORLUK";
			TEXT_STALL = "ÇIKIŞ YOK";
			TEXT_NOMOVES = "%s HAREKET EDEMEZ";
			TEXT_HELP1 = "RAKİBİN TAŞLARINI KENDİ TAŞLARIN ARASINDA SIKIŞTIRARAK ÇEVİR.";
			TEXT_HELP2 = "OYUN BİTTİĞİNDE RAKİBİNDEN DAHA FAZLA TAŞA SAHİP OLMAN GEREKİR.";
			TEXT_PLAYER = "Oyuncu";
			TEXT_AI = "Yapay Zeka";
			TEXT_BLACK = "Siyah";
			TEXT_WHITE = "Beyaz";
			TEXT_LOCAL_PLAY = "YEREL OYNA";
			TEXT_LOCAL_PLAY_EXPL = "AYNI CİHAZDA";
			TEXT_MULTIPLAYER = "ÇOK OYUNCULU";
			TEXT_MULTIPLAYER_EXPL = "ÇEVRİMİÇİ OYNA";
			TEXT_TRAINING = "EĞİTİM";
			TEXT_TRAINING_EXPL = "YAPAY ZEKA İLE OYNA";
			TEXT_BEGINNER = "BAŞLANGIÇ";
			TEXT_AMATEUR = "AMATÖR";
			TEXT_PRO = "PROFESYONEL";

			break;
		}
		case LANG_AR:{
			//ARABIAN
			TEXT_GAMEOVER = "‏%s يفوز";
			TEXT_DRAW = "تعادل";
			TEXT_DIFFICULTY = "الصعوبة";
			TEXT_STALL = "جمود";
			TEXT_NOMOVES = "‏%s لا يمكنه التحرك";
			TEXT_HELP1 = "اقلب قطع خصمك بمحاصرتها بين قطعتين من قطعك.";
			TEXT_HELP2 = "هدفك هو امتلاك عدد قطع أكثر من خصمك عند انتهاء اللعبة.";
			TEXT_PLAYER = "لاعب";
			TEXT_AI = "الذكاء الاصطناعي";
			TEXT_BLACK = "أسود";
			TEXT_WHITE = "أبيض";
			TEXT_LOCAL_PLAY = "اللعب المحلي";
			TEXT_LOCAL_PLAY_EXPL = "على نفس الجهاز";
			TEXT_MULTIPLAYER = "متعدد اللاعبين";
			TEXT_MULTIPLAYER_EXPL = "اللعب عبر الإنترنت";
			TEXT_TRAINING = "تدريب";
			TEXT_TRAINING_EXPL = "اللعب ضد الذكاء الاصطناعي";
			TEXT_BEGINNER = "مبتدئ";
			TEXT_AMATEUR = "هاوٍ";
			TEXT_PRO = "محترف";
	
			break;
		}
		case LANG_HI:{
			//HINDI 
			TEXT_GAMEOVER = "%s जीतता है";
			TEXT_DRAW = "ड्रा";
			TEXT_DIFFICULTY = "कठिनाई";
			TEXT_STALL = "गतिरोध";
			TEXT_NOMOVES = "%s चल नहीं सकता";
			TEXT_HELP1 = "अपने दो टुकड़ों के बीच विरोधी के टुकड़े फंसा कर उन्हें पलटें।";
			TEXT_HELP2 = "खेल समाप्त होने पर आपके पास विरोधी से अधिक टुकड़े होने चाहिए।";
			TEXT_PLAYER = "खिलाड़ी";
			TEXT_AI = "एआई";
			TEXT_BLACK = "काला";
			TEXT_WHITE = "सफेद";
			TEXT_LOCAL_PLAY = "स्थानीय खेल";
			TEXT_LOCAL_PLAY_EXPL = "एक ही डिवाइस पर";
			TEXT_MULTIPLAYER = "मल्टीप्लेयर";
			TEXT_MULTIPLAYER_EXPL = "ऑनलाइन खेलें";
			TEXT_TRAINING = "प्रशिक्षण";
			TEXT_TRAINING_EXPL = "एआई के खिलाफ खेलें";
			TEXT_BEGINNER = "शुरुआती";
			TEXT_AMATEUR = "शौकिया";
			TEXT_PRO = "पेशेवर";


			break;
		}
		case LANG_ID:{
			//INDONESIAN
			TEXT_GAMEOVER = "%s MENANG";
			TEXT_DRAW = "SERIES";
			TEXT_DIFFICULTY = "TINGKAT KESULITAN";
			TEXT_STALL = "MACET";
			TEXT_NOMOVES = "%s TIDAK BISA BERGERAK";
			TEXT_HELP1 = "BALIKKAN BIDAK LAWAN DENGAN MENJEPITNYA DI ANTARA DUA BIDAK ANDA.";
			TEXT_HELP2 = "TUJUAN ANDA ADALAH MEMILIKI LEBIH BANYAK BIDAK DARIPADA LAWAN SAAT PERMAINAN SELESAI.";
			TEXT_PLAYER = "Pemain";
			TEXT_AI = "AI";
			TEXT_BLACK = "Hitam";
			TEXT_WHITE = "Putih";
			TEXT_LOCAL_PLAY = "MAIN LOKAL";
			TEXT_LOCAL_PLAY_EXPL = "DI PERANGKAT YANG SAMA";
			TEXT_MULTIPLAYER = "MULTIPEMAIN";
			TEXT_MULTIPLAYER_EXPL = "MAIN ONLINE";
			TEXT_TRAINING = "LATIHAN";
			TEXT_TRAINING_EXPL = "MAIN LAWAN AI";
			TEXT_BEGINNER = "PEMULA";
			TEXT_AMATEUR = "AMATIR";
			TEXT_PRO = "PROFESIONAL";


			break;
		}
		case LANG_JA:{
			//JAPANESE
			TEXT_GAMEOVER = "%s の勝ち";
			TEXT_DRAW = "引き分け";
			TEXT_DIFFICULTY = "難易度";
			TEXT_STALL = "停滞";
			TEXT_NOMOVES = "%s は動けない";
			TEXT_HELP1 = "自分の2つの駒で相手の駒を挟んで裏返そう。";
			TEXT_HELP2 = "ゲーム終了時に相手より多くの駒を持っていることが目標です。";
			TEXT_PLAYER = "プレイヤー";
			TEXT_AI = "AI";
			TEXT_BLACK = "黒";
			TEXT_WHITE = "白";
			TEXT_LOCAL_PLAY = "ローカルプレイ";
			TEXT_LOCAL_PLAY_EXPL = "同じデバイスで";
			TEXT_MULTIPLAYER = "マルチプレイヤー";
			TEXT_MULTIPLAYER_EXPL = "オンラインでプレイ";
			TEXT_TRAINING = "トレーニング";
			TEXT_TRAINING_EXPL = "AIと対戦";
			TEXT_BEGINNER = "初心者";
			TEXT_AMATEUR = "アマチュア";
			TEXT_PRO = "プロ";

			
			break;
		}
		case LANG_ZH:{
			//CHINESE
			TEXT_GAMEOVER = "%s 获胜";
			TEXT_DRAW = "平局";
			TEXT_DIFFICULTY = "难度";
			TEXT_STALL = "僵局";
			TEXT_NOMOVES = "%s 无法移动";
			TEXT_HELP1 = "通过将对方的棋子夹在你的两个棋子之间来翻转它们。";
			TEXT_HELP2 = "你的目标是在游戏结束时拥有比对手更多的棋子。";
			TEXT_PLAYER = "玩家";
			TEXT_AI = "人工智能";
			TEXT_BLACK = "黑色";
			TEXT_WHITE = "白色";
			TEXT_LOCAL_PLAY = "本地游戏";
			TEXT_LOCAL_PLAY_EXPL = "在同一设备上";
			TEXT_MULTIPLAYER = "多人游戏";
			TEXT_MULTIPLAYER_EXPL = "在线游戏";
			TEXT_TRAINING = "训练";
			TEXT_TRAINING_EXPL = "对抗AI";
			TEXT_BEGINNER = "初学者";
			TEXT_AMATEUR = "业余";
			TEXT_PRO = "专业";

			break;
		}
	}
	
}

