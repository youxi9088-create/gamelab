var TEXT_PLAYER_COLOUR = "SELECT P{0} COLOUR";

var TEXT_HELP_1 = "REACH THE END OF THE BOARD LAUNCHING THE DICE. ROLLING A 6 WILL GIVE THE PLAYER AN EXTRA DICE";
var TEXT_HELP2_PT1 = "LADDER: YOU GO UP!";
var TEXT_HELP2_PT2 = ": YOU GO DOWN!";
var TEXT_MODE0 = "SNAKE";
var TEXT_MODE1 = "CHUTE";

var TEXT_EXTRA_DICE = "EXTRA DICE!";
var TEXT_SELECT_MODE = "SELECT GAME MODE";
var TEXT_SELECT_OPPONENTS = "SELECT OPPONENTS";
var TEXT_SELECT_PLAYERS = "SELECT PLAYERS";
var TEXT_SELECT_COLOUR = "SELECT YOUR COLOUR";
var TEXT_GAMES_PLAYED = "GAMES PLAYED";
var TEXT_GAMES_WON = "GAMES WON";
var TEXT_WIN = "YOU WON";
var TEXT_LOSE = "YOU LOSE";
var TEXT_PAUSE = "PAUSE";
var TEXT_ARE_SURE = "ARE YOU SURE?";

var TEXT_MOTIVATIONAL0 = "GREAT!";
var TEXT_MOTIVATIONAL1 = "COOL!";
var TEXT_MOTIVATIONAL2 = "NICE!";
var TEXT_MOTIVATIONAL3 = "SUPER!";
var TEXT_MOTIVATIONAL4 = "GOOD!";
var TEXT_DEMOTIVATIONAL0 = "BAD ROLL!";
var TEXT_DEMOTIVATIONAL1 = "NOOOO!";
var TEXT_DEMOTIVATIONAL2 = "SORRY...";
var TEXT_DEMOTIVATIONAL3 = "UNLUCKY!";
var TEXT_DEMOTIVATIONAL4 = "BAD RESULT!";

var TEXT_PRELOADER_CONTINUE = "START";
var TEXT_CREDITS_DEVELOPED = "Developed by";
var TEXT_LINK = "www.codethislab.com";

var TEXT_ERR_LS = "YOUR WEB BROWSER DOES NOT SUPPORT LOCAL STORAGE. IF YOU'RE USING SAFARI, IT MAY BE RELATED TO PRIVATE BROWSING. AS A RESULT, SOME INFO MAY NOT BE SAVED OR SOME FEATURES MAY NOT BE AVAILABLE.";


var TEXT_THINKING = "WAITING OPPONENT";

///////////// GAME MULTIPLAYER TEXT
var TEXT_WAIT_OPPONENT = "WAITING OPPONENT...";
var TEXT_OPPONENT_LEFT = "OPPONENT LEFT!";
var TEXT_PLAYER_DISCONNECTED = "YOU LEFT!";
var TEXT_REMATCH = "do you want the re-match?";

///////////// LOGIN ROOM SYSTEM TEXT
var TEXT_SYS_CHOOSENICK = "Choose nickname";
var TEXT_SYS_UPDATE = "update";
var TEXT_SYS_MATCH_LIST = "Match list";
var TEXT_SYS_QUICKMATCH = "quick match";
var TEXT_SYS_CREATEMATCH = "create match";
var TEXT_SYS_BACK = "back";
var TEXT_SYS_OK = "ok";
var TEXT_SYS_CREATE = "create";
var TEXT_SYS_CLOSE = "close";
var TEXT_SYS_LOADING = "Loading...";
var TEXT_SYS_NAMEROOM = "Name Room";
var TEXT_SYS_CREATEROOM = "Create Room";
var TEXT_SYS_PASSWORD = "Password";
var TEXT_SYS_INFOPASS = "If you don\'t set a password this room will be public.";
var TEXT_SYS_TYPEROOMPASS = "Type Room Password";
var TEXT_WRONG_PASSWORD = "Wrong Password!";
var TEXT_NETWORK_CONNECTING = "connecting...";
var TEXT_ROOM_IS_FULL = "Room is full!";
var TEXT_FIND_OPPONENT = "finding opponent...";
var TEXT_CONNECT_TO_LOBBY = "Connect to lobby...";
var TEXT_ROOM_DOESNT_EXIST = "Room doesn't exist!";
var TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "waiting for opponent in room: ";
var TEXT_NO_CONNECTION = "NO CONNECTION<br/>(Connect to find someone to play online)";

function refreshLanguage(){
	switch(s_iCurLang){
		case LANG_EN:{
			TEXT_PLAYER_COLOUR = "SELECT P{0} COLOUR";

			TEXT_HELP_1 = "REACH THE END OF THE BOARD LAUNCHING THE DICE. ROLLING A 6 WILL GIVE THE PLAYER AN EXTRA DICE";
			TEXT_HELP2_PT1 = "LADDER: YOU GO UP!";
			TEXT_HELP2_PT2 = ": YOU GO DOWN!";
			TEXT_MODE0 = "SNAKE";
			TEXT_MODE1 = "CHUTE";

			TEXT_EXTRA_DICE = "EXTRA DICE!";
			TEXT_SELECT_MODE = "SELECT GAME MODE";
			TEXT_SELECT_OPPONENTS = "SELECT OPPONENTS";
			TEXT_SELECT_PLAYERS = "SELECT PLAYERS";
			TEXT_SELECT_COLOUR = "SELECT YOUR COLOUR";
			TEXT_GAMES_PLAYED = "GAMES PLAYED";
			TEXT_GAMES_WON = "GAMES WON";
			TEXT_WIN = "YOU WON";
			TEXT_LOSE = "YOU LOSE";
			TEXT_PAUSE = "PAUSE";
			TEXT_ARE_SURE = "ARE YOU SURE?";

			TEXT_MOTIVATIONAL0 = "GREAT!";
			TEXT_MOTIVATIONAL1 = "COOL!";
			TEXT_MOTIVATIONAL2 = "NICE!";
			TEXT_MOTIVATIONAL3 = "SUPER!";
			TEXT_MOTIVATIONAL4 = "GOOD!";
			TEXT_DEMOTIVATIONAL0 = "BAD ROLL!";
			TEXT_DEMOTIVATIONAL1 = "NOOOO!";
			TEXT_DEMOTIVATIONAL2 = "SORRY...";
			TEXT_DEMOTIVATIONAL3 = "UNLUCKY!";
			TEXT_DEMOTIVATIONAL4 = "BAD RESULT!";

			TEXT_PRELOADER_CONTINUE = "START";
			TEXT_CREDITS_DEVELOPED = "Developed by";
			TEXT_LINK = "www.codethislab.com";

			TEXT_ERR_LS = "YOUR WEB BROWSER DOES NOT SUPPORT LOCAL STORAGE. IF YOU'RE USING SAFARI, IT MAY BE RELATED TO PRIVATE BROWSING. AS A RESULT, SOME INFO MAY NOT BE SAVED OR SOME FEATURES MAY NOT BE AVAILABLE.";


			TEXT_THINKING = "WAITING OPPONENT";

			///////////// GAME MULTIPLAYER TEXT
			TEXT_WAIT_OPPONENT = "WAITING OPPONENT...";
			TEXT_OPPONENT_LEFT = "OPPONENT LEFT!";
			TEXT_PLAYER_DISCONNECTED = "YOU LEFT!";
			TEXT_REMATCH = "do you want the re-match?";

			///////////// LOGIN ROOM SYSTEM TEXT
			TEXT_SYS_CHOOSENICK = "Choose nickname";
			TEXT_SYS_UPDATE = "update";
			TEXT_SYS_MATCH_LIST = "Match list";
			TEXT_SYS_QUICKMATCH = "quick match";
			TEXT_SYS_CREATEMATCH = "create match";
			TEXT_SYS_BACK = "back";
			TEXT_SYS_OK = "ok";
			TEXT_SYS_CREATE = "create";
			TEXT_SYS_CLOSE = "close";
			TEXT_SYS_LOADING = "Loading...";
			TEXT_SYS_NAMEROOM = "Name Room";
			TEXT_SYS_CREATEROOM = "Create Room";
			TEXT_SYS_PASSWORD = "Password";
			TEXT_SYS_INFOPASS = "If you don\'t set a password this room will be public.";
			TEXT_SYS_TYPEROOMPASS = "Type Room Password";
			TEXT_WRONG_PASSWORD = "Wrong Password!";
			TEXT_NETWORK_CONNECTING = "connecting...";
			TEXT_ROOM_IS_FULL = "Room is full!";
			TEXT_FIND_OPPONENT = "finding opponent...";
			TEXT_CONNECT_TO_LOBBY = "Connect to lobby...";
			TEXT_ROOM_DOESNT_EXIST = "Room doesn't exist!";
			TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "waiting for opponent in room: ";
			TEXT_NO_CONNECTION = "NO CONNECTION<br/>(Connect to find someone to play online)";
			break;
		}
		case LANG_RU:{
			TEXT_PLAYER_COLOUR = "ВЫБЕРИТЕ ЦВЕТ: P{0}";

			TEXT_HELP_1 = "ДОБЕРИТЕСЬ ДО КОНЦА ПОЛЯ, БРОСАЯ КУБИКИ. ВЫПАЛО 6 — ПЛЮС ОДИН ХОД!";
			TEXT_HELP2_PT1 = "ЛЕСТНИЦА: ИДИТЕ ВВЕРХ!";
			TEXT_HELP2_PT2 = ": СПУСКАЙТЕСЬ";
			TEXT_MODE0 = "ЗМЕЙКА";
			TEXT_MODE1 = "ГОРКА";

			TEXT_EXTRA_DICE = "ДОП. ХОД!";
			TEXT_SELECT_MODE = "ВЫБЕРИТЕ РЕЖИМ ИГРЫ";
			TEXT_SELECT_OPPONENTS = "ВЫБЕРИТЕ ПРОТИВНИКОВ";
			TEXT_SELECT_PLAYERS = "ВЫБЕРИТЕ ИГРОКОВ";
			TEXT_SELECT_COLOUR = "ВЫБЕРИТЕ ЦВЕТ";
			TEXT_GAMES_PLAYED = "КОЛ-ВО ИГР";
			TEXT_GAMES_WON = "ПОБЕДЫ";
			TEXT_WIN = "ПОБЕДА";
			TEXT_LOSE = "ПРОИГРЫШ";
			TEXT_PAUSE = "ПАУЗА";
			TEXT_ARE_SURE = "УВЕРЕНЫ?";

			TEXT_MOTIVATIONAL0 = "ХОРОШО!";
			TEXT_MOTIVATIONAL1 = "КРУТО!";
			TEXT_MOTIVATIONAL2 = "КЛАСС!";
			TEXT_MOTIVATIONAL3 = "СУПЕР!";
			TEXT_MOTIVATIONAL4 = "НЕПЛОХО!";
			TEXT_DEMOTIVATIONAL0 = "НЕУДАЧА!";
			TEXT_DEMOTIVATIONAL1 = "НЕЕЕТ";
			TEXT_DEMOTIVATIONAL2 = "ЖАЛКО...";
			TEXT_DEMOTIVATIONAL3 = "НЕВЕЗУХА!";
			
			TEXT_PRELOADER_CONTINUE = "ИГРАТЬ";
			TEXT_CREDITS_DEVELOPED = "Разработчик";
			TEXT_LINK = "www.codethislab.com";

			TEXT_ERR_LS = "ВАШ БРАУЗЕР НЕ ПОДДЕРЖИВАЕТ ЛОКАЛЬНОЕ ХРАНЕНИЕ НАСТРОЕК. ЕСЛИ ВЫ ПОЛЬЗУЕТЕСЬ SAFARI, ПРИЧИНА МОЖЕТ БЫТЬ В ЧАСТНОМ ДОСТУПЕ. ДАННЫЕ МОГУТ НЕ СОХРАНЯТЬСЯ ИЛИ НЕКОТОРЫЕ ФУНКЦИИ МОГУТ БЫТЬ НЕДОСТУПНЫ.";


			TEXT_THINKING = "ОЖИДАНИЕ ПРОТИВНИКА";

			///////////// GAME MULTIPLAYER TEXT
			TEXT_WAIT_OPPONENT = "ОЖИДАНИЕ ПРОТИВНИКА...";
			TEXT_OPPONENT_LEFT = "ПРОТИВНИК ВЫШЕЛ!";
			TEXT_PLAYER_DISCONNECTED = "ВЫ ВЫШЛИ!";
			TEXT_REMATCH = "Сыграть заново?";
			
			///////////// LOGIN ROOM SYSTEM TEXT
			TEXT_SYS_CHOOSENICK = "Выберите никнейм";
			TEXT_SYS_UPDATE = "обновлять";
			TEXT_SYS_MATCH_LIST = "игру список";
			TEXT_SYS_QUICKMATCH = "быстрая игра";
			TEXT_SYS_CREATEMATCH = "создать игру";
			TEXT_SYS_BACK = "назад";
			TEXT_SYS_OK = "ok";
			TEXT_SYS_CREATE = "создать";
			TEXT_SYS_CLOSE = "закрыть";
			TEXT_SYS_LOADING = "Загрузка...";
			TEXT_SYS_NAMEROOM = "Назовите игру";
			TEXT_SYS_CREATEROOM = "Создать игру";
			TEXT_SYS_PASSWORD = "Пароль";
			TEXT_SYS_INFOPASS = "Если вы не установите пароль, эта игра будет общедоступной.";
			TEXT_SYS_TYPEROOMPASS = "Введите пароль для игры";
			TEXT_WRONG_PASSWORD = "Неверный пароль!";
			TEXT_NETWORK_CONNECTING = "подключение";
			TEXT_ROOM_IS_FULL = "Нет места!";
			TEXT_FIND_OPPONENT = "Поиск противника...";
			TEXT_CONNECT_TO_LOBBY = "Подключение...";
			TEXT_ROOM_DOESNT_EXIST = "Такой комнаты нет!";
			TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "Ожидание противника в комнате: ";
			TEXT_NO_CONNECTION = "НЕТ СОЕДИНЕНИЯ.<br/>Подключитесь, чтобы найти других игроков и начать игру.";
			break;
		}
	}
}