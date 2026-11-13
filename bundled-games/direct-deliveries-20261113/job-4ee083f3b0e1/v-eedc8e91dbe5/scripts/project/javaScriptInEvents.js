

const scriptsInEvents = {

	async ["E-Level01_Event1_Act2"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("intro", "1");
	},

	async ["E-Music_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.bindRuntime(runtime);
	},

	async ["E-Hud_Event13_Act13"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event14_Act1"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_BUTTON";
	},

	async ["E-Hud_Event15_Act2"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_BUTTON";
	},

	async ["E-Hud_Event16_Act17"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event16_Act33"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_BUTTON";
	},

	async ["E-Hud_Event19_Act16"](runtime, localVars)
	{
		window.AidanLocalRewardContext = "gameover";
	},

	async ["E-Hud_Event22_Act2"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_FAILED_RESTART";
	},

	async ["E-Hud_Event23_Act2"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_FAILED_RESTART";
	},

	async ["E-Hud_Event26_Act9"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_COMPLETE_NEXT";
	},

	async ["E-Hud_Event29_Act11"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_COMPLETE_NEXT";
	},

	async ["E-Hud_Event31_Act2"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_FAILED_RESTART";
	},

	async ["E-Hud_Event32_Act2"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_FAILED_RESTART";
	},

	async ["E-Hud_Event37_Act14"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event38_Act1"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_BUTTON";
	},

	async ["E-Hud_Event39_Act2"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_BUTTON";
	},

	async ["E-Hud_Event41_Act17"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event41_Act33"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_BUTTON";
	},

	async ["E-Hud_Event44_Act16"](runtime, localVars)
	{
		window.AidanLocalRewardContext = "gameover";
	},

	async ["E-Hud_Event58_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
	},

	async ["E-Hud_Event60_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStart();
	},

	async ["E-Hud_Event83_Act3"](runtime, localVars)
	{
		await window.AidanLocalLifecycle.resumeLocalTransition(true, "PAUSE_RESTART");
	},

	async ["E-Hud_Event84_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event85_Act9"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event87_Act11"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", "5");
	},

	async ["E-Hud_Event87_Act12"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async ["E-Hud_Event87_Act13"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Heart", "3");
	},

	async ["E-Hud_Event91_Act10"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
	},

	async ["E-Hud_Event91_Act17"](runtime, localVars)
	{
		window.AidanLocalRewardContext = "skip";
	},

	async ["E-Hud_Event92_Act14"](runtime, localVars)
	{
		if (runtime.globalVars.currentLevel === 1 && runtime.globalVars.Type_Skill === 0) {
		    runtime.globalVars.Type_Skill = 1;
		    window.AidanLocalStorage.setItem("Type_Skill", "1");
		}
		if (runtime.globalVars.currentLevel === 15 && runtime.globalVars.Type_Skill === 1) {
		    runtime.globalVars.Type_Skill = 2;
		    window.AidanLocalStorage.setItem("Type_Skill", "2");
		}
		if (runtime.globalVars.currentLevel > runtime.globalVars.levelCleared) {
		    runtime.globalVars.levelCleared = runtime.globalVars.currentLevel;
		    window.AidanLocalStorage.setItem("levelCleared", runtime.globalVars.levelCleared.toString());
		}
		window.AidanLocalStorage.setItem("Heart", "3");
	},

	async ["E-Hud_Event93_Act7"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStart();
	},

	async ["E-Level06_Event55_Act9"](runtime, localVars)
	{
		window.AidanLocalLifecycle.happytime();
	},

	async ["E-Level12_Event67_Act9"](runtime, localVars)
	{
		window.AidanLocalLifecycle.happytime();
	},

	async ["E-Level18_Event54_Act9"](runtime, localVars)
	{
		window.AidanLocalLifecycle.happytime();
	},

	async ["E-Level24_Event82_Act2"](runtime, localVars)
	{
		window.AidanLocalLifecycle.happytime();
	},

	async ["E-Level30_Event73_Act10"](runtime, localVars)
	{
		window.AidanLocalLifecycle.happytime();
	},

	async ["E-Level30_Event94_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
	},

	async ["E-Level30_Event94_Act6"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Level30_Event94_Act12"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("levelCleared", runtime.globalVars.levelCleared.toString());
	},

	async ["E-Level30_Event95_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
	},

	async ["E-Level30_Event95_Act6"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Level30_Event95_Act11"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("levelCleared", runtime.globalVars.levelCleared.toString());
	},

	async ["E-Level30_Event97_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal30", runtime.globalVars.crystal30.toString());
	},

	async ["E-Level30_Event99_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("ExtraLevel", runtime.globalVars.ExtraLevel.toString());
	},

	async ["E-Menu_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Menu_Event1_Act9"](runtime, localVars)
	{
		void window.AidanLocalLifecycle.showMenuBanner(false, true);
	},

	async ["E-Credits_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Credits_Event1_Act7"](runtime, localVars)
	{
		void window.AidanLocalLifecycle.showMenuBanner();
	},

	async Loadingsavedata_Event6_Act2(runtime, localVars)
	{
		window.AidanLocalStorage.setItem("ChooseLanguage", runtime.globalVars.ChooseLanguage.toString());
	},

	async Loadingsavedata_Event6_Act4(runtime, localVars)
	{
		window.AidanLocalStorage.setItem("MusicControl", runtime.globalVars.MusicControl.toString());
	},

	async Loadingsavedata_Event6_Act6(runtime, localVars)
	{
		window.AidanLocalStorage.setItem("SoundControl", runtime.globalVars.SoundControl.toString());
	},

	async Loadingsavedata_Event6_Act8(runtime, localVars)
	{
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
	},

	async Loadingsavedata_Event7_Act2(runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Skip_menu", runtime.globalVars.Skip_menu.toString());
	},

	async Loadingsavedata_Event8_Act1(runtime, localVars)
	{
		// Carrega todas as variáveis do Data Module.
		// O idioma salvo manualmente sempre tem prioridade.
		// No primeiro acesso: CrazyGames countryCode -> fallback para idioma do navegador.
		// 0 = English, 1 = Spanish, 2 = Portuguese.
		const storedChooseLanguage = window.AidanLocalStorage.getItem("ChooseLanguage");
		let initialChooseLanguage;
		
		if (storedChooseLanguage !== null) {
		    const parsedLanguage = parseInt(storedChooseLanguage, 10);
		    initialChooseLanguage = Number.isFinite(parsedLanguage) ? parsedLanguage : 0;
		} else {
		    initialChooseLanguage = window.AidanLocalLifecycle.getPreferredLanguage();
		    window.AidanLocalStorage.setItem("ChooseLanguage", initialChooseLanguage.toString());
		}
		
		const loadedData = {
		    coins: window.AidanLocalStorage.getItem("coins") !== null ? parseInt(window.AidanLocalStorage.getItem("coins")) : 0,
		    Life: window.AidanLocalStorage.getItem("Life") !== null ? parseInt(window.AidanLocalStorage.getItem("Life")) : 7,
		    Crystal: window.AidanLocalStorage.getItem("Crystal") !== null ? parseInt(window.AidanLocalStorage.getItem("Crystal")) : 0,
		    Type_Skill: window.AidanLocalStorage.getItem("Type_Skill") !== null ? parseInt(window.AidanLocalStorage.getItem("Type_Skill")) : 0,
		    ChooseLanguage: initialChooseLanguage,
		    intro: window.AidanLocalStorage.getItem("intro") !== null ? parseInt(window.AidanLocalStorage.getItem("intro")) : 0,
		    MusicControl: window.AidanLocalStorage.getItem("MusicControl") !== null ? parseInt(window.AidanLocalStorage.getItem("MusicControl")) : 1,
		    SoundControl: window.AidanLocalStorage.getItem("SoundControl") !== null ? parseInt(window.AidanLocalStorage.getItem("SoundControl")) : 1,
		    Skip_menu: window.AidanLocalStorage.getItem("Skip_menu") !== null ? parseInt(window.AidanLocalStorage.getItem("Skip_menu")) : 0,
		    ExtraLevel: window.AidanLocalStorage.getItem("ExtraLevel") !== null ? parseInt(window.AidanLocalStorage.getItem("ExtraLevel")) : 0,
		    CheckPoint_Ads: 0,
		    coins_Checkpoint: window.AidanLocalStorage.getItem("coins_Checkpoint") !== null ? parseInt(window.AidanLocalStorage.getItem("coins_Checkpoint")) : 0,
		    crystal01: window.AidanLocalStorage.getItem("crystal01") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal01")) : 0,
		    crystal02: window.AidanLocalStorage.getItem("crystal02") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal02")) : 0,
		    crystal03: window.AidanLocalStorage.getItem("crystal03") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal03")) : 0,
		    crystal04: window.AidanLocalStorage.getItem("crystal04") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal04")) : 0,
		    crystal05: window.AidanLocalStorage.getItem("crystal05") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal05")) : 0,
		    crystal06: window.AidanLocalStorage.getItem("crystal06") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal06")) : 0,
		    crystal07: window.AidanLocalStorage.getItem("crystal07") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal07")) : 0,
		    crystal08: window.AidanLocalStorage.getItem("crystal08") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal08")) : 0,
		    crystal09: window.AidanLocalStorage.getItem("crystal09") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal09")) : 0,
		    crystal10: window.AidanLocalStorage.getItem("crystal10") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal10")) : 0,
		    crystal11: window.AidanLocalStorage.getItem("crystal11") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal11")) : 0,
		    crystal12: window.AidanLocalStorage.getItem("crystal12") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal12")) : 0,
		    crystal13: window.AidanLocalStorage.getItem("crystal13") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal13")) : 0,
		    crystal14: window.AidanLocalStorage.getItem("crystal14") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal14")) : 0,
		    crystal15: window.AidanLocalStorage.getItem("crystal15") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal15")) : 0,
		    crystal16: window.AidanLocalStorage.getItem("crystal16") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal16")) : 0,
		    crystal17: window.AidanLocalStorage.getItem("crystal17") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal17")) : 0,
		    crystal18: window.AidanLocalStorage.getItem("crystal18") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal18")) : 0,
		    crystal19: window.AidanLocalStorage.getItem("crystal19") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal19")) : 0,
		    crystal20: window.AidanLocalStorage.getItem("crystal20") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal20")) : 0,
		    crystal21: window.AidanLocalStorage.getItem("crystal21") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal21")) : 0,
		    crystal22: window.AidanLocalStorage.getItem("crystal22") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal22")) : 0,
		    crystal23: window.AidanLocalStorage.getItem("crystal23") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal23")) : 0,
		    crystal24: window.AidanLocalStorage.getItem("crystal24") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal24")) : 0,
		    crystal25: window.AidanLocalStorage.getItem("crystal25") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal25")) : 0,
		    crystal26: window.AidanLocalStorage.getItem("crystal26") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal26")) : 0,
		    crystal27: window.AidanLocalStorage.getItem("crystal27") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal27")) : 0,
		    crystal28: window.AidanLocalStorage.getItem("crystal28") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal28")) : 0,
		    crystal29: window.AidanLocalStorage.getItem("crystal29") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal29")) : 0,
		    crystal30: window.AidanLocalStorage.getItem("crystal30") !== null ? parseInt(window.AidanLocalStorage.getItem("crystal30")) : 0,
		    levelCleared: window.AidanLocalStorage.getItem("levelCleared") !== null ? parseInt(window.AidanLocalStorage.getItem("levelCleared")) : 0
		};
		
		// Define uma função global para o Construct acessar os valores carregados
		window.getLoadedData = function() {
		    return loadedData;
		};
		
		console.log("Dados carregados localmente, coins: " + loadedData.coins);
	},

	async Loadingsavedata_Event9_Act1(runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
		window.AidanLocalStorage.setItem("Crystal", runtime.globalVars.Crystal.toString());
		window.AidanLocalStorage.setItem("Type_Skill", runtime.globalVars.Type_Skill.toString());
		window.AidanLocalStorage.setItem("ChooseLanguage", runtime.globalVars.ChooseLanguage.toString());
		window.AidanLocalStorage.setItem("intro", runtime.globalVars.intro.toString());
		window.AidanLocalStorage.setItem("MusicControl", runtime.globalVars.MusicControl.toString());
		window.AidanLocalStorage.setItem("SoundControl", runtime.globalVars.SoundControl.toString());
		window.AidanLocalStorage.setItem("Skip_menu", runtime.globalVars.Skip_menu.toString());
		window.AidanLocalStorage.setItem("ExtraLevel", runtime.globalVars.ExtraLevel.toString());
		window.AidanLocalStorage.setItem("CheckPoint_Ads", runtime.globalVars.CheckPoint_Ads.toString());
		window.AidanLocalStorage.setItem("coins_Checkpoint", runtime.globalVars.coins_Checkpoint.toString());
		window.AidanLocalStorage.setItem("crystal01", runtime.globalVars.crystal01.toString());
		window.AidanLocalStorage.setItem("crystal02", runtime.globalVars.crystal02.toString());
		window.AidanLocalStorage.setItem("crystal03", runtime.globalVars.crystal03.toString());
		window.AidanLocalStorage.setItem("crystal04", runtime.globalVars.crystal04.toString());
		window.AidanLocalStorage.setItem("crystal05", runtime.globalVars.crystal05.toString());
		window.AidanLocalStorage.setItem("crystal06", runtime.globalVars.crystal06.toString());
		window.AidanLocalStorage.setItem("crystal07", runtime.globalVars.crystal07.toString());
		window.AidanLocalStorage.setItem("crystal08", runtime.globalVars.crystal08.toString());
		window.AidanLocalStorage.setItem("crystal09", runtime.globalVars.crystal09.toString());
		window.AidanLocalStorage.setItem("crystal10", runtime.globalVars.crystal10.toString());
		window.AidanLocalStorage.setItem("crystal11", runtime.globalVars.crystal11.toString());
		window.AidanLocalStorage.setItem("crystal12", runtime.globalVars.crystal12.toString());
		window.AidanLocalStorage.setItem("crystal13", runtime.globalVars.crystal13.toString());
		window.AidanLocalStorage.setItem("crystal14", runtime.globalVars.crystal14.toString());
		window.AidanLocalStorage.setItem("crystal15", runtime.globalVars.crystal15.toString());
		window.AidanLocalStorage.setItem("crystal16", runtime.globalVars.crystal16.toString());
		window.AidanLocalStorage.setItem("crystal17", runtime.globalVars.crystal17.toString());
		window.AidanLocalStorage.setItem("crystal18", runtime.globalVars.crystal18.toString());
		window.AidanLocalStorage.setItem("crystal19", runtime.globalVars.crystal19.toString());
		window.AidanLocalStorage.setItem("crystal20", runtime.globalVars.crystal20.toString());
		window.AidanLocalStorage.setItem("crystal21", runtime.globalVars.crystal21.toString());
		window.AidanLocalStorage.setItem("crystal22", runtime.globalVars.crystal22.toString());
		window.AidanLocalStorage.setItem("crystal23", runtime.globalVars.crystal23.toString());
		window.AidanLocalStorage.setItem("crystal24", runtime.globalVars.crystal24.toString());
		window.AidanLocalStorage.setItem("crystal25", runtime.globalVars.crystal25.toString());
		window.AidanLocalStorage.setItem("crystal26", runtime.globalVars.crystal26.toString());
		window.AidanLocalStorage.setItem("crystal27", runtime.globalVars.crystal27.toString());
		window.AidanLocalStorage.setItem("crystal28", runtime.globalVars.crystal28.toString());
		window.AidanLocalStorage.setItem("crystal29", runtime.globalVars.crystal29.toString());
		window.AidanLocalStorage.setItem("crystal30", runtime.globalVars.crystal30.toString());
		window.AidanLocalStorage.setItem("levelCleared", runtime.globalVars.levelCleared.toString());
	},

	async ["E-Intro_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Intro_Event56_Act10"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("intro", runtime.globalVars.intro.toString());
	},

	async ["E-Intro_Event100_Act7"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("intro", runtime.globalVars.intro.toString());
	},

	async ["E-Options_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Options_Event1_Act5"](runtime, localVars)
	{
		void window.AidanLocalLifecycle.showMenuBanner();
	},

	async ["E-Options_Event197_Act42"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", "0");
		window.AidanLocalStorage.setItem("Life", "7");
		window.AidanLocalStorage.setItem("Crystal", "0");
		window.AidanLocalStorage.setItem("Type_Skill", "0");
		window.AidanLocalStorage.setItem("ChooseLanguage", "0");
		window.AidanLocalStorage.setItem("intro", "0");
		window.AidanLocalStorage.setItem("MusicControl", "1");
		window.AidanLocalStorage.setItem("SoundControl", "1");
		window.AidanLocalStorage.setItem("Skip_menu", "0");
		window.AidanLocalStorage.setItem("ExtraLevel", "0");
		window.AidanLocalStorage.setItem("CheckPoint_Ads", "0");
		window.AidanLocalStorage.setItem("coins_Checkpoint", "0");
		window.AidanLocalStorage.setItem("crystal01", "0");
		window.AidanLocalStorage.setItem("crystal02", "0");
		window.AidanLocalStorage.setItem("crystal03", "0");
		window.AidanLocalStorage.setItem("crystal04", "0");
		window.AidanLocalStorage.setItem("crystal05", "0");
		window.AidanLocalStorage.setItem("crystal06", "0");
		window.AidanLocalStorage.setItem("crystal07", "0");
		window.AidanLocalStorage.setItem("crystal08", "0");
		window.AidanLocalStorage.setItem("crystal09", "0");
		window.AidanLocalStorage.setItem("crystal10", "0");
		window.AidanLocalStorage.setItem("crystal11", "0");
		window.AidanLocalStorage.setItem("crystal12", "0");
		window.AidanLocalStorage.setItem("crystal13", "0");
		window.AidanLocalStorage.setItem("crystal14", "0");
		window.AidanLocalStorage.setItem("crystal15", "0");
		window.AidanLocalStorage.setItem("crystal16", "0");
		window.AidanLocalStorage.setItem("crystal17", "0");
		window.AidanLocalStorage.setItem("crystal18", "0");
		window.AidanLocalStorage.setItem("crystal19", "0");
		window.AidanLocalStorage.setItem("crystal20", "0");
		window.AidanLocalStorage.setItem("crystal21", "0");
		window.AidanLocalStorage.setItem("crystal22", "0");
		window.AidanLocalStorage.setItem("crystal23", "0");
		window.AidanLocalStorage.setItem("crystal24", "0");
		window.AidanLocalStorage.setItem("crystal25", "0");
		window.AidanLocalStorage.setItem("crystal26", "0");
		window.AidanLocalStorage.setItem("crystal27", "0");
		window.AidanLocalStorage.setItem("crystal28", "0");
		window.AidanLocalStorage.setItem("crystal29", "0");
		window.AidanLocalStorage.setItem("crystal30", "0");
		window.AidanLocalStorage.setItem("levelCleared", "0");
		
	},

	async ["E-Final01_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Final01_Event1_Act12"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
	},

	async ["E-Final01_Event1_Act14"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Final01_Event2_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal30", runtime.globalVars.crystal30.toString());
	},

	async ["E-Final01_Event32_Act12"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("intro", runtime.globalVars.intro.toString());
	},

	async ["E-Levelselect_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Levelselect_Event1_Act16"](runtime, localVars)
	{
		void window.AidanLocalLifecycle.showMenuBanner();
	},

	async ["E-Levelselect_Event27_Act8"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event45_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event46_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event47_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event48_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event49_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event50_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event51_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event52_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event53_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event54_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event55_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event56_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event57_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event58_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event59_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event60_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event61_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event62_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event63_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event64_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event65_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event66_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event67_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event68_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event69_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event70_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event71_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event72_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event73_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event74_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Levelselect_Event75_Act3"](runtime, localVars)
	{
		window.AidanLocalBreakContext = "LEVEL_SELECT_START";
	},

	async ["E-Final02_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Level31_Event95_Act17"](runtime, localVars)
	{
		window.AidanLocalLifecycle.happytime();
	},

	async ["E-Level31_Event103_Act2"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
	},

	async ["E-Level31_Event103_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Level31_Event105_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("levelCleared", runtime.globalVars.levelCleared.toString());
	},

	async ["E-Extrafinal_Event1_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Loading_Event2_Act2"](runtime, localVars)
	{
		window.AidanLocalLifecycle.finishLoading();
		window.AidanLocalLifecycle.enterNonGameplay();
	},

	async ["E-Ads_Event1_Act2"](runtime, localVars)
	{
		const context = window.AidanLocalBreakContext || "MIDGAME_GENERIC";
		window.AidanLocalBreakContext = "";
		await window.AidanLocalLifecycle.resumeLocalTransition(false, context);
	},

	async ["E-Ads_Event2_Act2"](runtime, localVars)
	{
		await window.AidanLocalLifecycle.resumeLocalTransition(false, "CHECKPOINT");
	},

	async ["E-Ads_Event3_Act2"](runtime, localVars)
	{
		const context = window.AidanLocalRewardContext || "REWARDED_GENERIC";
		window.AidanLocalRewardGranted = (await window.AidanLocalLifecycle.requestCurrentLocalReward(context)) ? 1 : 0;
		await new Promise(resolve => setTimeout(resolve, 75));
	},

	async ["E-Ads_Event3_Act5"](runtime, localVars)
	{
		const rewardContext = window.AidanLocalRewardContext || "";
		const rewardSucceeded = window.AidanLocalRewardGranted === 1;
		window.AidanLocalRewardContext = "";
		if (rewardContext === "checkpoint") {
		    runtime.callFunction(rewardSucceeded ? "CrazyCheckpointRewardSuccess" : "CrazyCheckpointRewardFail");
		} else if (rewardContext === "gameover") {
		    runtime.callFunction(rewardSucceeded ? "CrazyGameOverRewardSuccess" : "CrazyGameOverRewardFail");
		} else if (rewardContext === "skip") {
		    runtime.callFunction(rewardSucceeded ? "CrazySkipRewardSuccess" : "CrazySkipRewardFail");
		} else if (rewardContext === "chest_ad") {
		    runtime.callFunction(rewardSucceeded ? "CrazyChestRewardSuccess" : "CrazyChestRewardFail");
		}
	},

	async ["E-Loading_crazy_Event1_Act1"](runtime, localVars)
	{
		const nextLayoutName = "Loading";
		window.AidanLocalLifecycle.bindRuntime(runtime);
		await window.AidanLocalLifecycle.init();
		runtime.goToLayout(nextLayoutName);
	},

	async ["E-Game_Event1_Act1"](runtime, localVars)
	{
		void window.AidanLocalLifecycle.hideBanners();
	},

	async ["E-Game_Event1_Act24"](runtime, localVars)
	{
		window.AidanLocalLifecycle.armGameplay();
	},

	async ["E-Game_Event6_Act11"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem('Crystal', '0');
	},

	async ["E-Game_Event218_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Type_Skill", runtime.globalVars.Type_Skill.toString());
	},

	async ["E-Game_Event219_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal01", runtime.globalVars.crystal01.toString());
	},

	async ["E-Game_Event220_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal02", runtime.globalVars.crystal02.toString());
	},

	async ["E-Game_Event221_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal03", runtime.globalVars.crystal03.toString());
	},

	async ["E-Game_Event222_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal04", runtime.globalVars.crystal04.toString());
	},

	async ["E-Game_Event223_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal05", runtime.globalVars.crystal05.toString());
	},

	async ["E-Game_Event224_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal06", runtime.globalVars.crystal06.toString());
	},

	async ["E-Game_Event225_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal07", runtime.globalVars.crystal07.toString());
	},

	async ["E-Game_Event226_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal08", runtime.globalVars.crystal08.toString());
	},

	async ["E-Game_Event227_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal09", runtime.globalVars.crystal09.toString());
	},

	async ["E-Game_Event228_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal10", runtime.globalVars.crystal10.toString());
	},

	async ["E-Game_Event229_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal11", runtime.globalVars.crystal11.toString());
	},

	async ["E-Game_Event230_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal12", runtime.globalVars.crystal12.toString());
	},

	async ["E-Game_Event231_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal13", runtime.globalVars.crystal13.toString());
	},

	async ["E-Game_Event232_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal14", runtime.globalVars.crystal14.toString());
	},

	async ["E-Game_Event233_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal15", runtime.globalVars.crystal15.toString());
	},

	async ["E-Game_Event234_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Type_Skill", runtime.globalVars.Type_Skill.toString());
	},

	async ["E-Game_Event235_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal16", runtime.globalVars.crystal16.toString());
	},

	async ["E-Game_Event236_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal17", runtime.globalVars.crystal17.toString());
	},

	async ["E-Game_Event237_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal18", runtime.globalVars.crystal18.toString());
	},

	async ["E-Game_Event238_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal19", runtime.globalVars.crystal19.toString());
	},

	async ["E-Game_Event239_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal20", runtime.globalVars.crystal20.toString());
	},

	async ["E-Game_Event240_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal21", runtime.globalVars.crystal21.toString());
	},

	async ["E-Game_Event241_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal22", runtime.globalVars.crystal22.toString());
	},

	async ["E-Game_Event242_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal23", runtime.globalVars.crystal23.toString());
	},

	async ["E-Game_Event243_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal24", runtime.globalVars.crystal24.toString());
	},

	async ["E-Game_Event244_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal25", runtime.globalVars.crystal25.toString());
	},

	async ["E-Game_Event245_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal26", runtime.globalVars.crystal26.toString());
	},

	async ["E-Game_Event246_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal27", runtime.globalVars.crystal27.toString());
	},

	async ["E-Game_Event247_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal28", runtime.globalVars.crystal28.toString());
	},

	async ["E-Game_Event248_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal29", runtime.globalVars.crystal29.toString());
	},

	async ["E-Game_Event249_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("crystal30", runtime.globalVars.crystal30.toString());
	},

	async ["E-Game_Event250_Act4"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("levelCleared", runtime.globalVars.levelCleared.toString());
	},

	async ["E-Game_Event251_Act12"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
	},

	async ["E-Game_Event251_Act14"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Game_Event254_Act3"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("ExtraLevel", runtime.globalVars.ExtraLevel.toString());
	},

	async ["E-Game_Event256_Act17"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
	},

	async ["E-Game_Event261_Act3"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins_Checkpoint", runtime.globalVars.coins_Checkpoint.toString());
	},

	async ["E-Game_Event261_Act5"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Game_Event261_Act7"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Crystal", runtime.globalVars.Crystal.toString()); 
	},

	async ["E-Game_Event271_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
	},

	async ["E-Game_Event271_Act19"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", runtime.globalVars.coins.toString());
	},

	async ["E-Game_Event271_Act20"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", runtime.globalVars.Life.toString());
	},

	async ["E-Game_Event281_Act1"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
	},

	async ["E-Game_Event281_Act23"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins", "0");
	},

	async ["E-Game_Event281_Act26"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("Life", "1");
	},

	async ["E-Game_Event281_Act29"](runtime, localVars)
	{
		window.AidanLocalStorage.setItem("coins_Checkpoint", "0");
	},

	async ["E-Game_Event381_Act13"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event382_Act13"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event383_Act13"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event386_Act15"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event387_Act15"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event388_Act15"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event397_Act16"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event398_Act16"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event399_Act16"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event430_Act15"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event431_Act15"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event432_Act15"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStop();
		window.AidanLocalRewardContext = "chest_ad";
	},

	async ["E-Game_Event932_Act8"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStart();
	},

	async ["E-Game_Event942_Act8"](runtime, localVars)
	{
		window.AidanLocalLifecycle.gameplayStart();
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
