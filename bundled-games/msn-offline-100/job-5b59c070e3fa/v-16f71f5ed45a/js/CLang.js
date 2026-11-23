var TEXT_SCORE = "TOTAL SCORE";
var TEXT_BONUS_TIME = "BONUS TIME";
var TEXT_BONUS_WIN = "BONUS WIN";
var TEXT_YOU_LOSE = "YOU LOSE";
var TEXT_CONGRATS = "CONGRATULATIONS";
var TEXT_WINS = "%s WINS!";
var TEXT_TIE = "IT'S A TIE!!";
var TEXT_YELLOW = "YELLOW";
var TEXT_RED = "RED";
var TEXT_AI = "AI";

var TEXT_LOCAL_PLAY = "PLAY LOCAL";
var TEXT_LOCAL_PLAY_EXPL = "ON THE SAME DEVICE";
var TEXT_MULTIPLAYER = "MULTIPLAYER";
var TEXT_MULTIPLAYER_EXPL = "PLAY ONLINE";
var TEXT_TRAINING = "TRAINING";
var TEXT_TRAINING_EXPL = "PLAY AGAINST AI";


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
			TEXT_SCORE = "TOTAL SCORE";
			TEXT_BONUS_TIME = "BONUS TIME";
			TEXT_BONUS_WIN = "BONUS WIN";
			TEXT_YOU_LOSE = "YOU LOSE";
			TEXT_CONGRATS = "CONGRATULATIONS";
			TEXT_WINS = "%s WINS!";
			TEXT_TIE = "IT'S A TIE!!";
			TEXT_YELLOW = "YELLOW";
			TEXT_RED = "RED";
			TEXT_AI = "AI";
			
			TEXT_LOCAL_PLAY = "PLAY LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "ON THE SAME DEVICE";
			TEXT_MULTIPLAYER = "MULTIPLAYER";
			TEXT_MULTIPLAYER_EXPL = "PLAY ONLINE";
			TEXT_TRAINING = "TRAINING";
			TEXT_TRAINING_EXPL = "PLAY AGAINST AI";
			
			break;
		}
		case LANG_ES:{
			//SPANISH
			TEXT_SCORE = "PUNTUACIÓN TOTAL";
			TEXT_BONUS_TIME = "TIEMPO EXTRA";
			TEXT_BONUS_WIN = "PREMIO EXTRA";
			TEXT_YOU_LOSE = "HAS PERDIDO";
			TEXT_CONGRATS = "¡FELICITACIONES!";
			TEXT_WINS = "¡%s GANA!";
			TEXT_TIE = "¡EMPATE!!";
			TEXT_YELLOW = "AMARILLO";
			TEXT_RED = "ROJO";
			TEXT_AI = "AI";
			
			TEXT_LOCAL_PLAY = "JUGAR LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "EN EL MISMO DISPOSITIVO";
			TEXT_MULTIPLAYER = "MULTIJUGADOR";
			TEXT_MULTIPLAYER_EXPL = "JUGAR EN LÍNEA";
			TEXT_TRAINING = "ENTRENAMIENTO";
			TEXT_TRAINING_EXPL = "JUGAR CONTRA LA AI";
			
			break;
        }
		case LANG_FR:{
			//FRENCH
			TEXT_SCORE = "SCORE TOTAL";
			TEXT_BONUS_TIME = "TEMPS BONUS";
			TEXT_BONUS_WIN = "GAIN BONUS";
			TEXT_YOU_LOSE = "VOUS AVEZ PERDU";
			TEXT_CONGRATS = "FÉLICITATIONS";
			TEXT_WINS = "%s GAGNE !";
			TEXT_TIE = "ÉGALITÉ !!";
			TEXT_YELLOW = "JAUNE";
			TEXT_RED = "ROUGE";
			TEXT_AI = "AI";
			
			TEXT_LOCAL_PLAY = "JOUER EN LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "SUR LE MÊME APPAREIL";
			TEXT_MULTIPLAYER = "MULTIJOUEUR";
			TEXT_MULTIPLAYER_EXPL = "JOUER EN LIGNE";
			TEXT_TRAINING = "ENTRAÎNEMENT";
			TEXT_TRAINING_EXPL = "JOUER CONTRE L'AI";

			break;
		}
		case LANG_DE:{
			//GERMAN	
			TEXT_SCORE = "GESAMTPUNKTZAHL";
			TEXT_BONUS_TIME = "BONUSZEIT";
			TEXT_BONUS_WIN = "BONUSGEWINN";
			TEXT_YOU_LOSE = "DU VERLIERST";
			TEXT_CONGRATS = "GLÜCKWUNSCH";
			TEXT_WINS = "%s GEWINNT!";
			TEXT_TIE = "UNENTSCHIEDEN!!";
			TEXT_YELLOW = "GELB";
			TEXT_RED = "ROT";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "LOKAL SPIELEN";
			TEXT_LOCAL_PLAY_EXPL = "AUF DEM GLEICHEN GERÄT";
			TEXT_MULTIPLAYER = "MEHRSPIELER";
			TEXT_MULTIPLAYER_EXPL = "ONLINE SPIELEN";
			TEXT_TRAINING = "TRAINING";
			TEXT_TRAINING_EXPL = "GEGEN DIE AI SPIELEN";
			
			break;
        }
        case LANG_PT:{
			//PORTUGUESE
			TEXT_SCORE = "PONTUAÇÃO TOTAL";
			TEXT_BONUS_TIME = "TEMPO BÔNUS";
			TEXT_BONUS_WIN = "PRÊMIO BÔNUS";
			TEXT_YOU_LOSE = "VOCÊ PERDEU";
			TEXT_CONGRATS = "PARABÉNS";
			TEXT_WINS = "%s VENCE!";
			TEXT_TIE = "EMPATE!!";
			TEXT_YELLOW = "AMARELO";
			TEXT_RED = "VERMELHO";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "JOGAR LOCAL";
			TEXT_LOCAL_PLAY_EXPL = "NO MESMO DISPOSITIVO";
			TEXT_MULTIPLAYER = "MULTIJOGADOR";
			TEXT_MULTIPLAYER_EXPL = "JOGAR ONLINE";
			TEXT_TRAINING = "TREINAMENTO";
			TEXT_TRAINING_EXPL = "JOGAR CONTRA A AI";
			
			
			break;
        }
        case LANG_IT:{
			//ITALIAN
			TEXT_SCORE = "PUNTEGGIO TOTALE";
			TEXT_BONUS_TIME = "TEMPO BONUS";
			TEXT_BONUS_WIN = "VINCITA BONUS";
			TEXT_YOU_LOSE = "HAI PERSO";
			TEXT_CONGRATS = "CONGRATULAZIONI";
			TEXT_WINS = "%s VINCE!";
			TEXT_TIE = "PAREGGIO!!";
			TEXT_YELLOW = "GIALLO";
			TEXT_RED = "ROSSO";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "GIOCO LOCALE";
			TEXT_LOCAL_PLAY_EXPL = "SULLO STESSO DISPOSITIVO";
			TEXT_MULTIPLAYER = "MULTIGIOCATORE";
			TEXT_MULTIPLAYER_EXPL = "GIOCA ONLINE";
			TEXT_TRAINING = "ALLENAMENTO";
			TEXT_TRAINING_EXPL = "GIOCA CONTRO L'AI";
			
			break;
		}
		case LANG_RU:{
			//RUSSIAN
			TEXT_SCORE = "ОБЩИЙ СЧЁТ";
			TEXT_BONUS_TIME = "БОНУСНОЕ ВРЕМЯ";
			TEXT_BONUS_WIN = "БОНУСНЫЙ ВЫИГРЫШ";
			TEXT_YOU_LOSE = "ВЫ ПРОИГРАЛИ";
			TEXT_CONGRATS = "ПОЗДРАВЛЯЕМ";
			TEXT_WINS = "%s ПОБЕЖДАЕТ!";
			TEXT_TIE = "НИЧЬЯ!!";
			TEXT_YELLOW = "ЖЁЛТЫЙ";
			TEXT_RED = "КРАСНЫЙ";
			TEXT_AI = "AI";
			
			TEXT_LOCAL_PLAY = "ИГРАТЬ ЛОКАЛЬНО";
			TEXT_LOCAL_PLAY_EXPL = "НА ОДНОМ УСТРОЙСТВЕ";
			TEXT_MULTIPLAYER = "МУЛЬТИПЛЕЕР";
			TEXT_MULTIPLAYER_EXPL = "ИГРАТЬ ОНЛАЙН";
			TEXT_TRAINING = "ТРЕНИРОВКА";
			TEXT_TRAINING_EXPL = "ИГРАТЬ ПРОТИВ AI";
			
			break;
		}
		case LANG_TR:{
			//TURKISH
			TEXT_SCORE = "TOPLAM SKOR";
			TEXT_BONUS_TIME = "BONUS SÜRESİ";
			TEXT_BONUS_WIN = "BONUS KAZANÇ";
			TEXT_YOU_LOSE = "KAYBETTİN";
			TEXT_CONGRATS = "TEBRİKLER";
			TEXT_WINS = "%s KAZANDI!";
			TEXT_TIE = "BERABERE!!";
			TEXT_YELLOW = "SARI";
			TEXT_RED = "KIRMIZI";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "YEREL OYNA";
			TEXT_LOCAL_PLAY_EXPL = "AYNI CİHAZDA";
			TEXT_MULTIPLAYER = "ÇOK OYUNCULU";
			TEXT_MULTIPLAYER_EXPL = "ÇEVRİMİÇİ OYNA";
			TEXT_TRAINING = "EĞİTİM";
			TEXT_TRAINING_EXPL = "AI'YE KARŞI OYNA";
			
			break;
		}
		case LANG_AR:{
			//ARABIAN
			TEXT_SCORE = "إجمالي النقاط";
			TEXT_BONUS_TIME = "وقت إضافي";
			TEXT_BONUS_WIN = "مكافأة الفوز";
			TEXT_YOU_LOSE = "لقد خسرت";
			TEXT_CONGRATS = "مبروك";
			TEXT_WINS = "%s فاز!";
			TEXT_TIE = "تعادل!!";
			TEXT_YELLOW = "أصفر";
			TEXT_RED = "أحمر";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "اللعب المحلي";
			TEXT_LOCAL_PLAY_EXPL = "على نفس الجهاز";
			TEXT_MULTIPLAYER = "متعدد اللاعبين";
			TEXT_MULTIPLAYER_EXPL = "اللعب عبر الإنترنت";
			TEXT_TRAINING = "تدريب";
			TEXT_TRAINING_EXPL = "العب ضد AI";
	
			break;
		}
		case LANG_HI:{
			//HINDI 
			TEXT_SCORE = "कुल अंक";
			TEXT_BONUS_TIME = "बोनस समय";
			TEXT_BONUS_WIN = "बोनस जीत";
			TEXT_YOU_LOSE = "आप हार गए";
			TEXT_CONGRATS = "बधाई हो";
			TEXT_WINS = "%s जीता!";
			TEXT_TIE = "मैच टाई!!";
			TEXT_YELLOW = "पीला";
			TEXT_RED = "लाल";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "स्थानीय खेल";
			TEXT_LOCAL_PLAY_EXPL = "एक ही डिवाइस पर";
			TEXT_MULTIPLAYER = "मल्टीप्लेयर";
			TEXT_MULTIPLAYER_EXPL = "ऑनलाइन खेलें";
			TEXT_TRAINING = "प्रशिक्षण";
			TEXT_TRAINING_EXPL = "AI के खिलाफ खेलें";
			
			break;
		}
		case LANG_ID:{
			//INDONESIAN
			TEXT_SCORE = "SKOR TOTAL";
			TEXT_BONUS_TIME = "WAKTU BONUS";
			TEXT_BONUS_WIN = "KEMENANGAN BONUS";
			TEXT_YOU_LOSE = "ANDA KALAH";
			TEXT_CONGRATS = "SELAMAT";
			TEXT_WINS = "%s MENANG!";
			TEXT_TIE = "HASIL SERI!!";
			TEXT_YELLOW = "KUNING";
			TEXT_RED = "MERAH";
			TEXT_AI = "AI";

			
			TEXT_LOCAL_PLAY = "MAIN LOKAL";
			TEXT_LOCAL_PLAY_EXPL = "DI PERANGKAT YANG SAMA";
			TEXT_MULTIPLAYER = "MULTIPEMAIN";
			TEXT_MULTIPLAYER_EXPL = "MAIN ONLINE";
			TEXT_TRAINING = "LATIHAN";
			TEXT_TRAINING_EXPL = "BERMAIN MELAWAN AI";
			
			break;
		}
		case LANG_JA:{
			//JAPANESE
			TEXT_SCORE = "合計スコア";
			TEXT_BONUS_TIME = "ボーナスタイム";
			TEXT_BONUS_WIN = "ボーナス勝利";
			TEXT_YOU_LOSE = "あなたの負け";
			TEXT_CONGRATS = "おめでとう";
			TEXT_WINS = "%s の勝ち!";
			TEXT_TIE = "引き分け!!";
			TEXT_YELLOW = "黄色";
			TEXT_RED = "赤";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "ローカルプレイ";
			TEXT_LOCAL_PLAY_EXPL = "同じデバイスで";
			TEXT_MULTIPLAYER = "マルチプレイヤー";
			TEXT_MULTIPLAYER_EXPL = "オンラインでプレイ";
			TEXT_TRAINING = "トレーニング";
			TEXT_TRAINING_EXPL = "AIと対戦する";
			
			break;
		}
		case LANG_ZH:{
			//CHINESE
			TEXT_SCORE = "总得分";
			TEXT_BONUS_TIME = "奖励时间";
			TEXT_BONUS_WIN = "奖励胜利";
			TEXT_YOU_LOSE = "你输了";
			TEXT_CONGRATS = "恭喜";
			TEXT_WINS = "%s 获胜!";
			TEXT_TIE = "平局!!";
			TEXT_YELLOW = "黄色";
			TEXT_RED = "红色";
			TEXT_AI = "AI";

			TEXT_LOCAL_PLAY = "本地游戏";
			TEXT_LOCAL_PLAY_EXPL = "在同一设备上";
			TEXT_MULTIPLAYER = "多人游戏";
			TEXT_MULTIPLAYER_EXPL = "在线游戏";
			TEXT_TRAINING = "训练";
			TEXT_TRAINING_EXPL = "与AI对战";
			
			break;
		}
	}
	
}

