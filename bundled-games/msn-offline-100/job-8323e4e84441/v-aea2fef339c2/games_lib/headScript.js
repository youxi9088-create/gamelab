// move ad state form ima3 sdk
var AdsState = {
    NONE: 0,
    LOADING: 1,
    LOADED: 2,
    STARTED: 3,
    COMPLETE: 4,
};
if(window.game_frame && window.game_frame.contentWindow){
	window.game_frame.contentWindow.AdsState = AdsState;
}
var _setAdsState = function(state) {
		if(state == AdsState.COMPLETE && window.game_frame && window.game_frame.contentWindow.refreshSticky){
			window.game_frame.contentWindow.refreshSticky();
		}
    var oldState = adsCurrentState;
    adsCurrentState = state;
    window.dispatchEvent(new CustomEvent('gl_ads_state_change', { detail: { oldState: oldState, newState: adsCurrentState } }));
		if(adsCurrentState == AdsState.COMPLETE){
			window.focus();
		}
		if(window.game_frame){
			window.game_frame.contentWindow.dispatchEvent(new CustomEvent('gl_ads_state_change', { detail: { oldState: oldState, newState: adsCurrentState } }));
			window.game_frame.contentWindow.adsCurrentState = adsCurrentState;
			if(adsCurrentState == AdsState.COMPLETE){
				window.game_frame.contentWindow.displayAdBG(false);
				window.game_frame.contentWindow.focus();
				console.log("ads IMA3 done");
			}
		}
}
window.playAds = function() {
	if (window.game_frame) {
		window.game_frame.contentWindow.adDone();
	}
}
window.isAdsComplete = function () {
	return adsCurrentState == AdsState.COMPLETE
}
window.adsContainer;

////////////
//#region Google Signal for ID5
window.ID5EspConfig = {
  partnerId: 1397,
};
//#endregion
//#region as.com
window.ASObj = {
  is: false,
  domain: "gamingclub.as",
  post: {
    Main_Menu: {
      action: "ga-action-Main-Menu",
      id: -1,
    },
    Start: {
      action: "ga-action-Start",
      id: -1,
    },
    AdsCompletion: {
      action: "ad-action-Completion",
      id: -1,
    },
    Completion: {
      action: "as-action-Completion",
      id: -1,
      coin: -1, // dd
      distance: -1, // mm: dd,ninjaup,bbbgr
      score: -1, // dd, ttef,ninjaup,bbbgr
      bridge: -1, // sb
      perfect: -1, // sb, mpc
      item: -1, // collected: sb, pf, bbbgr, bbb, mpc(SoSt)
      duration: -1, // s played: pf
      kill: -1, // bbbgr, bbb(PPGGBBYY)
      use: -1, // bbbgr
    },
    Leaderboard: {
      action: "as-action-Leaderboard",
      id: -1,
    },
    Spend: {
      action: "as-action-Spend",
      id: -1,
    },
  },
  game: {
    // use in game src
    dangerDashFree: {
      // full-portal: default must be 0
      language: 4,
      age: 20,
      remove_facebook: 1,
    },
  },
};
window.ASObj.is = window.location.href.indexOf(window.ASObj.domain) >= 0;
//#endregion
//#region v3
window.v3Obj = {
  is: false,
  domain: "ludigames.com",
  post: {
    Main_Menu: {
      action: "ga-action-Main-Menu",
      id: -1,
    },
    Start: {
      action: "ga-action-Start",
      id: -1,
    },
    AdsStart: {
      action: "ad-action-Start",
      id: -1,
    },
    AdsCompletion: {
      action: "ad-action-Completion",
      id: -1,
    },
		// msstart: for submit score
    Completion: {
      action: "as-action-Completion",
      id: -1,
      coin: -1, // dd
      distance: -1, // mm: dd,ninjaup,bbbgr
      score: -1, // dd,ninjaup,bbbgr
      bridge: -1, // sb
      perfect: -1, // sb
      item: -1, // collected: sb, pf, bbbgr, bbb, fsd(FFRRSS)
      duration: -1, // s played: pf
      kill: -1, // bbbgr, bbb(PPGGBBYY), fsd(SSMMSSPP)
      use: -1, // bbbgr
    },
    Leaderboard: {
      action: "as-action-Leaderboard",
      id: -1,
    },
    Spend: {
      action: "as-action-Spend",
      id: -1,
    },
  },
};
window.v3Obj.is = window.location.href.indexOf(window.v3Obj.domain) >= 0;
//#endregion
//#region blockAds and whiteListDomain
var whiteListDomain = [
  "trueid",
  "ludigames.com",
  "googly.gg",
  "paidiagaming.com",
  "paidia-dev.dynasty-dev.com",
  "paidia-stg.dynasty-staging.com",
  "localhost",
  "gameloft.digiplay.vn",
  "gp.mana.vn",
];
function isWhiteListDomain() {
  try {
    if (
      window.location.ancestorOrigins &&
      window.location.ancestorOrigins.length > 0
    ) {
      for (var i = 0; i < whiteListDomain.length; i++) {
        if (
          window.location.ancestorOrigins[0].indexOf(whiteListDomain[i]) >= 0
        ) {
          return true;
        }
      }
    } else {
      return true;
    }
  } catch (e) {}
  return false;
}
var blockAds = true;
try {
  if (window.ASObj.is || isWhiteListDomain()) {
    blockAds = !true;
  } else {
    window.parent.testOrigin = true;
    blockAds = !true;
  }
} catch (e) {
  window.open(
    window.location.href.split("?")[0] +
      "?utm_source=gameloft&utm_medium=bookmark&utm_campaign=IFRAME",
    "_top",
    "",
    true
  );
  //window.location.href = "https://play.ludigames.com/?utm_campaign=IFRAME";

  window.addEventListener(
    "mouseover",
    function () {
      window.open(
        window.location.href.split("?")[0] +
          "?utm_source=gameloft&utm_medium=bookmark&utm_campaign=IFRAME",
        "_top",
        "",
        true
      );
      //window.location.href = "https://play.ludigames.com/?utm_campaign=IFRAME";
      //window.removeEventListener('mouseover', function(){}, false);
    },
    false
  );
}
//#endregion
//#region declare ga_channel_name, urlParams, abt
window.ga_channel_name =
  window.ga_channel_name ||
  (location.search.split("utm_campaign=")[1]
    ? location.search.split("utm_campaign=")[1].split("&")[0]
    : "undefined");
if (window.ASObj.is) {
  window.ga_channel_name = "PA021";
}
window.isHeadScriptLoaded = true;
var URLSearchParams =
  URLSearchParams ||
  (function () {
    "use strict";
    function URLSearchParams(query) {
      var index,
        key,
        value,
        pairs,
        i,
        length,
        dict = Object.create(null);
      this[secret] = dict;
      if (!query) return;
      if (typeof query === "string") {
        if (query.charAt(0) === "?") {
          query = query.slice(1);
        }
        for (
          pairs = query.split("&"), i = 0, length = pairs.length;
          i < length;
          i++
        ) {
          value = pairs[i];
          index = value.indexOf("=");
          if (-1 < index) {
            appendTo(
              dict,
              decode(value.slice(0, index)),
              decode(value.slice(index + 1))
            );
          } else if (value.length) {
            appendTo(dict, decode(value), "");
          }
        }
      } else {
        if (isArray(query)) {
          for (i = 0, length = query.length; i < length; i++) {
            value = query[i];
            appendTo(dict, value[0], value[1]);
          }
        } else if (query.forEach) {
          query.forEach(addEach, dict);
        } else {
          for (key in query) {
            appendTo(dict, key, query[key]);
          }
        }
      }
    }
    var isArray = Array.isArray,
      URLSearchParamsProto = URLSearchParams.prototype,
      find = /[!'\(\)~]|%20|%00/g,
      plus = /\+/g,
      replace = {
        "!": "%21",
        "'": "%27",
        "(": "%28",
        ")": "%29",
        "~": "%7E",
        "%20": "+",
        "%00": "\0",
      },
      replacer = function (match) {
        return replace[match];
      },
      secret = "__URLSearchParams__:" + Math.random();
    function addEach(value, key) {
      appendTo(this, key, value);
    }
    function appendTo(dict, name, value) {
      var res = isArray(value) ? value.join(",") : value;
      if (name in dict) dict[name].push(res);
      else dict[name] = [res];
    }
    function decode(str) {
      return decodeURIComponent(str.replace(plus, " "));
    }
    function encode(str) {
      return encodeURIComponent(str).replace(find, replacer);
    }
    URLSearchParamsProto.append = function append(name, value) {
      appendTo(this[secret], name, value);
    };
    URLSearchParamsProto["delete"] = function del(name) {
      delete this[secret][name];
    };
    URLSearchParamsProto.get = function get(name) {
      var dict = this[secret];
      return name in dict ? dict[name][0] : null;
    };
    URLSearchParamsProto.getAll = function getAll(name) {
      var dict = this[secret];
      return name in dict ? dict[name].slice(0) : [];
    };
    URLSearchParamsProto.has = function has(name) {
      return name in this[secret];
    };
    URLSearchParamsProto.set = function set(name, value) {
      this[secret][name] = ["" + value];
    };
    URLSearchParamsProto.forEach = function forEach(callback, thisArg) {
      var dict = this[secret];
      Object.getOwnPropertyNames(dict).forEach(function (name) {
        dict[name].forEach(function (value) {
          callback.call(thisArg, value, name, this);
        }, this);
      }, this);
    };
    URLSearchParamsProto.toJSON = function toJSON() {
      return {};
    };
    URLSearchParamsProto.toString = function toString() {
      var dict = this[secret],
        query = [],
        i,
        key,
        name,
        value;
      for (key in dict) {
        name = encode(key);
        for (i = 0, value = dict[key]; i < value.length; i++) {
          query.push(name + "=" + encode(value[i]));
        }
      }
      return query.join("&");
    };
    var dP = Object.defineProperty,
      gOPD = Object.getOwnPropertyDescriptor,
      createSearchParamsPollute = function (search) {
        function append(name, value) {
          URLSearchParamsProto.append.call(this, name, value);
          name = this.toString();
          search.set.call(this._usp, name ? "?" + name : "");
        }
        function del(name) {
          URLSearchParamsProto["delete"].call(this, name);
          name = this.toString();
          search.set.call(this._usp, name ? "?" + name : "");
        }
        function set(name, value) {
          URLSearchParamsProto.set.call(this, name, value);
          name = this.toString();
          search.set.call(this._usp, name ? "?" + name : "");
        }
        return function (sp, value) {
          sp.append = append;
          sp["delete"] = del;
          sp.set = set;
          return dP(sp, "_usp", {
            configurable: true,
            writable: true,
            value: value,
          });
        };
      },
      createSearchParamsCreate = function (polluteSearchParams) {
        return function (obj, sp) {
          dP(obj, "_searchParams", {
            configurable: true,
            writable: true,
            value: polluteSearchParams(sp, obj),
          });
          return sp;
        };
      },
      updateSearchParams = function (sp) {
        var append = sp.append;
        sp.append = URLSearchParamsProto.append;
        URLSearchParams.call(sp, sp._usp.search.slice(1));
        sp.append = append;
      },
      verifySearchParams = function (obj, Class) {
        if (!(obj instanceof Class))
          throw new TypeError(
            "'searchParams' accessed on an object that " +
              "does not implement interface " +
              Class.name
          );
      },
      upgradeClass = function (Class) {
        var ClassProto = Class.prototype,
          searchParams = gOPD(ClassProto, "searchParams"),
          href = gOPD(ClassProto, "href"),
          search = gOPD(ClassProto, "search"),
          createSearchParams;
        if (!searchParams && search && search.set) {
          createSearchParams = createSearchParamsCreate(
            createSearchParamsPollute(search)
          );
          Object.defineProperties(ClassProto, {
            href: {
              get: function () {
                return href.get.call(this);
              },
              set: function (value) {
                var sp = this._searchParams;
                href.set.call(this, value);
                if (sp) updateSearchParams(sp);
              },
            },
            search: {
              get: function () {
                return search.get.call(this);
              },
              set: function (value) {
                var sp = this._searchParams;
                search.set.call(this, value);
                if (sp) updateSearchParams(sp);
              },
            },
            searchParams: {
              get: function () {
                verifySearchParams(this, Class);
                return (
                  this._searchParams ||
                  createSearchParams(
                    this,
                    new URLSearchParams(this.search.slice(1))
                  )
                );
              },
              set: function (sp) {
                verifySearchParams(this, Class);
                createSearchParams(this, sp);
              },
            },
          });
        }
      };
    upgradeClass(HTMLAnchorElement);
    if (/^function|object$/.test(typeof URL) && URL.prototype)
      upgradeClass(URL);
    return URLSearchParams;
  })();
(function (URLSearchParamsProto) {
  var iterable = (function () {
    try {
      return !!Symbol.iterator;
    } catch (error) {
      return false;
    }
  })();
  if (!("forEach" in URLSearchParamsProto)) {
    URLSearchParamsProto.forEach = function forEach(callback, thisArg) {
      var names = Object.create(null);
      this.toString()
        .replace(/=[\s\S]*?(?:&|$)/g, "=")
        .split("=")
        .forEach(function (name) {
          if (!name.length || name in names) return;
          (names[name] = this.getAll(name)).forEach(function (value) {
            callback.call(thisArg, value, name, this);
          }, this);
        }, this);
    };
  }
  if (!("keys" in URLSearchParamsProto)) {
    URLSearchParamsProto.keys = function keys() {
      var items = [];
      this.forEach(function (value, name) {
        items.push(name);
      });
      var iterator = {
        next: function () {
          var value = items.shift();
          return { done: value === undefined, value: value };
        },
      };
      if (iterable) {
        iterator[Symbol.iterator] = function () {
          return iterator;
        };
      }
      return iterator;
    };
  }
  if (!("values" in URLSearchParamsProto)) {
    URLSearchParamsProto.values = function values() {
      var items = [];
      this.forEach(function (value) {
        items.push(value);
      });
      var iterator = {
        next: function () {
          var value = items.shift();
          return { done: value === undefined, value: value };
        },
      };
      if (iterable) {
        iterator[Symbol.iterator] = function () {
          return iterator;
        };
      }
      return iterator;
    };
  }
  if (!("entries" in URLSearchParamsProto)) {
    URLSearchParamsProto.entries = function entries() {
      var items = [];
      this.forEach(function (value, name) {
        items.push([name, value]);
      });
      var iterator = {
        next: function () {
          var value = items.shift();
          return { done: value === undefined, value: value };
        },
      };
      if (iterable) {
        iterator[Symbol.iterator] = function () {
          return iterator;
        };
      }
      return iterator;
    };
  }
  if (iterable && !(Symbol.iterator in URLSearchParamsProto)) {
    URLSearchParamsProto[Symbol.iterator] = URLSearchParamsProto.entries;
  }
  if (!("sort" in URLSearchParamsProto)) {
    URLSearchParamsProto.sort = function sort() {
      var entries = this.entries(),
        entry = entries.next(),
        done = entry.done,
        keys = [],
        values = Object.create(null),
        i,
        key,
        value;
      while (!done) {
        value = entry.value;
        key = value[0];
        keys.push(key);
        if (!(key in values)) {
          values[key] = [];
        }
        values[key].push(value[1]);
        entry = entries.next();
        done = entry.done;
      }
      keys.sort();
      for (i = 0; i < keys.length; i++) {
        this["delete"](keys[i]);
      }
      for (i = 0; i < keys.length; i++) {
        key = keys[i];
        this.append(key, values[key].shift());
      }
    };
  }
})(URLSearchParams.prototype);
var urlQueryString = window.location.search;
var urlParams = new URLSearchParams(urlQueryString);

// abt
window.portal = "";
urlParams.forEach(function test(val, name) {
  if (name.indexOf("abt") >= 0) {
    portal += (!!portal?"_":"") + name + "-" + val;
  }
});
//#endregion
//#region window common var
window.getCookies = function (cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

window.enableAnchorAds = false;
//window.disableAds = urlParams.has("nonads");
window.disableAds = false;
window.preloadAd = false;
window.AD_LOAD_TIMEOUT = 4000;
window.isAdxPlaying = false;
window.premiumGameCKName = "lgpl";
window.countryCKName = "lgcc";
window.premiumCountries = ["TT"];
try {
  var premiumGameCKVal = window.getCookies(window.premiumGameCKName);
  if (urlParams.has("pID") && premiumGameCKVal != "") {
    if (
      JSON.parse(premiumGameCKVal)[urlParams.get("pID")] &&
      window.location.pathname.indexOf(
        JSON.parse(premiumGameCKVal)[urlParams.get("pID")]
      ) >= 0
    ) {
      window.disableAds = !false;
    }
  }
  if (window.getCookies(window.countryCKName) != "") {
    if (
      window.premiumCountries.indexOf(
        window.getCookies(window.countryCKName)
      ) >= 0
    ) {
      window.disableAds = !false;
    }
  }
} catch (e) {}

if (
  !/mobile|android|iphone|ipad/.test(window.navigator.userAgent.toLowerCase())
) {
  window.isDesktop = true;
} else {
  window.isDesktop = !true;
}

window.landscapeGames = [
  "castleofIntenseDismayFree",
  "midnightPoolClassicFree",
  "kiteFree",
  "novaCoveredOpsFree",
  "supercapeOfJusticeFree",
  "nitroTukTukFree",
  "pocketDessertChefFree",
  "piratesPathOfTheBuccaneerFree",
  "realFootballFree",
  "subwayRunnerFree",
  "pizzaNinja3Free",
  "hiddenObjectsSuperthiefFree",
  "kidsZooFunFree",
  "zombieMassacreFree",
  "kidsAnimalFunFree",
  "kidsFarmFunFree",
  "tomAndJerryDeluxeFree",
  "zombiesVsHalloweenFree",
  "scoobyDooWeLoveYouFree",
  "kidsCutePairsFree",
  "kidsZooFarmFree",
  "spongebobRunFree",
  "donutsFree",
  "powerpuffGirlsMojoMadnessFree",
  "dragRacingClubFree",
  "lasVegasRouletteFree",
  "woodventureFree",
  "happyFishingFree",
  "braveKnightFree",
  "paintTheWayFree",
  "alienEscapeFree",
  "zombieHunterFree",
  "playfulKittyFree",
  "ringsChallengeFree",
  "kingdomOfHeroesFree",
  "defenseBattleFree",
  "heLikesTheDarknessFree",
  "shadowAdventureFree",
  "rightShotFree",
  "pirateKidFree",
  "jungleJonesFree",
  "tankHeroFree",
  "findDiamondsFree",
  "footballHeadsFree",
  "pandaLoveFree",
  "crossyChickenRunFree",
  "queensGambitPuzzlesFree",
  "twoAliensEscapeFree",
  "retroNeonInvadersFree",
  "cutThePuzzleFree",
  "goblinRunFree",
  "airportControlFree",
  "egyptStoneWarFree",
  "castleDefenderFree",
  "tangramFree",
  "footballPenaltyKicksFree",
  "fingerSoccerFree",
  "santaRushFree",
  "mindGames6In1Free",
  "realGoalkeeperFree",
  "mahjongQuestFree",
  "realTennisFree",
  "airStrikeWarFree",
  "spotTheDifferenceFree",
  "blackThronesFree",
  "dungeonAndPuzzlesSokobanFree",
  "spotTheDifferenceSeasonsFree",
  "fashionDressUpFree",
  "squadTowerFree",
  "sharkEvolutionFree",
  "mathMagicKidsFree",
  "retroKingdomFree",
  "trafficControlFree",
  "mrSuperfireFree",
  "boxingStarsFree",
  "jigsawPuzzleFree",
  "towerDefenseClashFree",
  "kartRacingProFree",
  "idleZooFree",
  "lasVegasPokerFree",
  "zombieKillerFree",
  "cookingManiaFree",
  "batmanCapedCrusaderChaseFree",
  "superHexbeeMergerFree",
  "realLudoFree",
  "realMiniGolfFree",
  "demonKillerFree",
  "zombieApocalypseFree",
  "angrySharksFree",
  "rightShot2ChristmasFree",
  //"monster4096Free",
  "wildHuntingClashFree",
  "thomasRunnerFree",
  "zombieDefenseWarFree",
  "feedMeMonstersFree",
  "foosballCupWorldFree",
  "chessPuzzlesCollectionFree",
  "armoredAssaultStrikeFree",
  "luckyVegasSlotsFree",
];
/////////////// disable first ad
// games:
		// 	empty => apply all game
		//  [a,b] => apply for a,b only
// must have campaign or domain or both properties
// campaign:
		// 	empty => apply all campaign
		//  [a,b] => apply for a,b only
		//  rem if don't apply campaign
// doamin: same as campaign
window.diableFirstAdGames = [
  // games, empty => apply all games
  {
    enable: true,
    games: [
      "subwaySurfersSeoulFree",
      "fashionHolicFree",
      "zombieSplashFree",
      "touchTheEvenFiguresFree",
      "cricketLegendsFree",
      "dragRacingClubFree",
      "spiderSolitaireFree",
      "ludoLegendFree",
      "shadowAdventureFree",
      "spongebobRunFree",
      "puzzlePetsPairsFree",
      "unparkFree",
    ],
    // campaign, empty => apply all
    campaign: ["PA041"],
  },
  {
    enable: true,
    games: [],
    campaign: ["PA047", "PA007", "PA077", "PA089"],
		domain: ["telcel.ludigames.com"],
  },
  {
    enable: true,
    games: ["pokerHouseFree"],
    // campaign, empty => apply all
    campaign: [],
  },
];
window.diableSecondAdGames = [
  // games, empty => apply all games
  {
    enable: true,
    games: ["unparkFree"],
    // campaign, empty => apply all
    campaign: ["PA041"],
  },
];
//////////////////// mid ad rule
var NUMBER_OF_PLAY_PER_AD = 0;
// enable: don't set this property if auto set base on games,campaign,domain conditions
// rule: [rule type, config rule]
// games:
		// 	empty => apply all game
		//  [a,b] => apply for a,b only
// must have campaign or domain or both properties
// campaign:
		// 	empty => apply all campaign
		//  [a,b] => apply for a,b only
		//  rem if don't apply campaign
// doamin: same as campaign
window.midAdRule = [
  {
    enable: false,// don't set this property
		rule: [NUMBER_OF_PLAY_PER_AD,3],
    games: [],
    campaign: ["PA077"],
		//domain: ["telcel.ludigames.com"],
  },
];
//////////////////// adx only
// games:
		// 	empty => apply all game
		//  [a,b] => apply for a,b only
// must have campaign or domain or both properties
// campaign:
		// 	empty => apply all campaign
		//  [a,b] => apply for a,b only
		//  rem if don't apply campaign
// doamin: same as campaign
window.useADXOnly = [
  {
    enable: true,
    games: [],
    campaign: ["PA047", "PA007", "PA077", "PA089"],
		domain: ["telcel.ludigames.com"],
  },
];
window.disableLeftRightAdGames = [
  "santaRunFree",
  "cricketLegendsFree",
  "adventureTimeFaceSmashFree",
  "bingoRoyalFree",
  "santaSlideFree",
  "brickCrush2In1Free",
  "heroSurvivorFree",
  "pixelBrickBreakerFree",
  "colorBlastFree",
  "minigolfClashFree",
  "jigsawPuzzlesFree",
  "secretAgentFree",
  "idleHotelEmpireFree",
  "skyWarplaneFree",
  "mahjongWorldTourFree",
  "brawlHeroFree",
  "atlanticSkyHunterXtremeFree",
  "spaceBricksFree",
  "towerDefenseZombiesFree",
  "whatIsGrandmaHidingFree",
  "stickmanBrawlerFree",
  "diceMergePuzzleFree",
  "h2OPuzzlesFree",
  "pinballVortexFree",
  "hunterHitmanFree",
  "coffeeBreakPuzzleFree",
  "magicalArcherFree",
  "bunnyHopPuzzleFree",
  "towerDefendersFree",
  "monster4096Free",
  "towerOfFallFree",
  "lineOnHoleFree",
  "trainBanditFree",
];
window.autoAdsGames = ["ludoLegendFree"];
window.isAutoAds = false;
window.isUseCombineAd = true;
window.flowADXH5Ima3 = !false;
window.isUseADXOnly = !false;
window.isLandscapeGames = false;
window.isDiableFirstAd = false;
window.isDiableSecondAd = false;
window.isEnableSideSticky = false;
window.isDisableLeftRightAdGames = false;

for (var i = 0; i < autoAdsGames.length; i++) {
  if (window.location.href.indexOf("/" + autoAdsGames[i]) >= 0) {
    window.isAutoAds = !false;
    break;
  }
}

for (var i = 0; i < landscapeGames.length; i++) {
  if (window.location.href.indexOf(landscapeGames[i]) >= 0) {
    window.isLandscapeGames = !false;
    window.sa_ads_unit = "";
  }
}

for (var i = 0; i < window.disableLeftRightAdGames.length; i++) {
  if (window.location.href.indexOf(window.disableLeftRightAdGames[i]) >= 0) {
    window.isDisableLeftRightAdGames = !false;
  }
}

for (var i = 0; i < window.midAdRule.length; i++) {
  
    if (
			// if campaign apply
      (window.midAdRule[i].campaign &&
				(
					window.midAdRule[i].campaign.length == 0 ||
					window.midAdRule[i].campaign.indexOf(window.ga_channel_name) >= 0
				)
			)
			||
			// if domain apply
			(window.midAdRule[i].domain && 
				(
					window.midAdRule[i].domain.indexOf(window.location.hostname) >= 0 ||
					window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 && window.location.ancestorOrigins[0].indexOf(window.midAdRule[i].domain) >= 0
				)
			)
    ) {
      if (window.midAdRule[i].games.length == 0) {
        window.midAdRule[i].enable = true;
      } else {
        for (var j = 0; j < window.midAdRule[i].games.length; j++) {
          if (
            window.location.href.indexOf(
              window.midAdRule[i].games[j]
            ) >= 0
          ) {
            window.midAdRule[i].enable = true;
          }
        }
      }
    }

}

for (var i = 0; i < window.diableFirstAdGames.length; i++) {
  if (window.diableFirstAdGames[i].enable) {
    if (
			// if campaign apply
      (window.diableFirstAdGames[i].campaign &&
				(
					window.diableFirstAdGames[i].campaign.length == 0 ||
					window.diableFirstAdGames[i].campaign.indexOf(window.ga_channel_name) >= 0
				)
			)
			||
			// if domain apply
			(window.diableFirstAdGames[i].domain && 
				(
					window.diableFirstAdGames[i].domain.indexOf(window.location.hostname) >= 0 ||
					window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 && window.location.ancestorOrigins[0].indexOf(window.diableFirstAdGames[i].domain) >= 0
				)
			)
    ) {
      if (window.diableFirstAdGames[i].games.length == 0) {
        window.isDiableFirstAd = !false;
        window.preloadAd = false;
      } else {
        for (var j = 0; j < window.diableFirstAdGames[i].games.length; j++) {
          if (
            window.location.href.indexOf(
              window.diableFirstAdGames[i].games[j]
            ) >= 0
          ) {
            window.isDiableFirstAd = !false;
            window.preloadAd = false;
          }
        }
      }
    }
  }
}

for (var i = 0; i < window.useADXOnly.length; i++) {
  if (window.useADXOnly[i].enable) {
    if (
			// if campaign apply
      (window.useADXOnly[i].campaign &&
				(
					window.useADXOnly[i].campaign.length == 0 ||
					window.useADXOnly[i].campaign.indexOf(window.ga_channel_name) >= 0
				)
			)
			||
			// if domain apply
			(window.useADXOnly[i].domain && 
				(
					window.useADXOnly[i].domain.indexOf(window.location.hostname) >= 0 ||
					window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0 && window.location.ancestorOrigins[0].indexOf(window.useADXOnly[i].domain) >= 0
				)
			)
    ) {
      if (window.useADXOnly[i].games.length == 0) {
        window.isUseADXOnly = true;
      } else {
        for (var j = 0; j < window.useADXOnly[i].games.length; j++) {
          if (
            window.location.href.indexOf(
              window.useADXOnly[i].games[j]
            ) >= 0
          ) {
            window.isUseADXOnly = true;
          }
        }
      }
    }
  }
}

for (var i = 0; i < window.diableSecondAdGames.length; i++) {
  if (window.diableSecondAdGames[i].enable) {
    if (
      window.diableSecondAdGames[i].campaign.length == 0 ||
      window.diableSecondAdGames[i].campaign.indexOf(window.ga_channel_name) >=
        0
    ) {
      if (window.diableSecondAdGames[i].games.length == 0) {
        window.isDiableSecondAd = !false;
      } else {
        for (var j = 0; j < window.diableSecondAdGames[i].games.length; j++) {
          if (
            window.location.href.indexOf(
              window.diableSecondAdGames[i].games[j]
            ) >= 0
          ) {
            window.isDiableSecondAd = !false;
          }
        }
      }
    }
  }
}

window.originPath = function () {
  var result = "";
  if (!window.cdn_path) {
    result =
      window.location.origin +
      window.location.pathname.replace(/\/[\w\-]*\.\w*/gi, "/"); // remove xxx.html
  } else {
    result = window.cdn_path;
  }
  return result;
};
window.myConsoleLog = function (
  arg1 = null,
  arg2 = null,
  arg3 = null,
  arg4 = null
) {
  var isDebug = urlParams.has("debug");
  if (isDebug) {
    console.log("hs", arg1, arg2, arg3, arg4);
  }
};
window.myAlert = function (arg1, arg2) {
  var isAlert = urlParams.has("alert");
  if (isAlert) {
    alert(arg1 + ", " + arg2);
  }
  myConsoleLog(arg1, arg2);
};
window.myConsole = {
  time: function (name) {
    var isTime = urlParams.has("time");
    if (isTime) {
      console.time(name);
    }
  },
  timeEnd: function (name) {
    var isTime = urlParams.has("time");
    if (isTime) {
      console.timeEnd(name);
    }
  },
};
window.loadEruda = function () {
  var script = document.createElement("script");
  script.src = "//cdn.jsdelivr.net/npm/eruda";
  document.body.appendChild(script);
  script.onload = function () {
    eruda.init();
  };

  if (localStorage.getItem("eruda") != "true") {
    localStorage.setItem("eruda", "true");
  }
};
window.getDefault = function (key) {
  if (window.ASObj.is) {
    myConsoleLog("getDefault: " + key, window.ASObj.game[productKey][key]);
    return window.ASObj.game[productKey][key];
  } else return 0;
};
var pageLoadedTime = Date.now();
//#endregion
//#region sticky ads, didomi, md5, ppid, Game Manual Interstitial
//// global var
window.sa_aSize_mapping = [
  [
    [960, 0],
    [[728, 90], [950, 90],[960, 90],[970, 66],[970, 90],[980, 90]],
  ],
  [
    [640, 0],
    [[468, 60],[728, 90], [950, 90],[320, 50],[300, 50],[300, 75]],
  ],
  [
    [300, 0],
    [[300, 50],[300, 75],[320, 50],[120, 20],[120, 30],[168, 28],[168, 42],[216, 36],[216, 54]],
  ],
  [[0, 0], []],
];
window.o_sa_l_aSize_mapping = [
  [
    [640, 0],
    [
      [120, 600],
      [160, 600],
    ],
  ],
  [[0, 0], []],
];
window.sa_aSize_noMapping = [
  [300, 50],[300, 75],[320, 50],[120, 20],[120, 30],[168, 28],[168, 42],[216, 36],[216, 54]
];
window.o_sa_l_aSize_noMapping = [
  [120, 600],
  [160, 600],
];

window.sa_targeting = {
  source: window.ga_channel_name,
};

window.ads_game_zIndex = 14000;

window.sa_div_id = "div-gpt-ad-1601541737948-0";
window.sa_div_zIndex = 11000;
if (!window.sa_ads_unit) {
  window.sa_ads_unit = "";
}

window.o_sa_l_div_id = "div-gpt-ad-1601541737950-0";
window.o_sa_r_div_id = "div-gpt-ad-1601541737951-0";
window.o_sa_l_ads_unit = "";
window.o_sa_r_ads_unit = "";
window.sticky_bootom_slot;
window.game_sticky_interval = 0;
window.game_sticky_max_request = 30;
window.game_sticky_request_count = 0;
window.game_sticky_last_request = 0;

// didomi: load script
window.hasConsentOrNotRequired = false;
window.hasDidomiCheck = false;
if (window.v3Obj.is) {
  hasDidomiCheck = true;
}
if (hasDidomiCheck) {
  var noticeID = "iiJPw7Wd";
  window.gdprAppliesGlobally = false;
  if (urlParams.has("didomi")) {
    if (urlParams.get("didomi") != "true") {
      noticeID = urlParams.get("didomi");
    }
    window.gdprAppliesGlobally = true;
  }
  myConsoleLog("load didomi", noticeID, window.gdprAppliesGlobally);

  window.didomiEventListeners = window.didomiEventListeners || [];
  window.didomiEventListeners.push({
    event: "consent.changed",
    listener: function (context) {
      // The user consent status has changed
      myConsoleLog("consent.changed", context);
      hasConsentOrNotRequired = true;
    },
  });
  window.didomiEventListeners.push({
    event: "integrations.consentpassedtodfp",
    listener: function (data) {
      myConsoleLog("integrations.consentpassedtodfp", data);
      // Consent has been passed to Google
      // Load or refresh ads as needed with Ad Manager, Prebid, etc.
      // `data.consentStatus` contains the current consent status of the user (true/false/undefined)
      // `data.index` contains the index of the event (integer)
      if (data.index === 0) {
        // This is the very first event on the page that gets triggered on page load
      } else {
        // This is an event that happens later on the page, after a user action (user giving consent or changing their preferences)
      }
    },
  });
  window.didomiEventListeners.push({
    event: "preferences.clickpurposedisagree",
    listener: function (data) {
      // The user has enabled a specific purpose
      // `data.purposeId` contains the ID of the purpose
      myConsoleLog("preferences.clickpurposedisagree", data);
    },
  });
  window.didomiEventListeners.push({
    event: "preferences.clickcategorydisagree",
    listener: function (data) {
      // The user has enabled a specific category
      // `data.categoryId` contains the ID of the category
      myConsoleLog("preferences.clickcategorydisagree", data);
    },
  });
  window.didomiEventListeners.push({
    event: "notice.clickdisagree",
    listener: function () {
      // The user has clicked on the "Decline" button
      myConsoleLog("notice.clickdisagree");
    },
  });
  window.didomiEventListeners.push({
    event: "notice.clickclose",
    listener: function () {
      // The user has clicked on the Close button
      myConsoleLog("notice.clickclose");
    },
  });

  window.didomiOnReady = window.didomiOnReady || [];
  window.didomiOnReady.push(function (Didomi) {
    // Call other functions on the SDK
    window.didomiObject = Didomi;
    var userStatusObj = Didomi.getUserStatus();
    var {
      purposes: { consent },
    } = userStatusObj;
    var { disabled, enabled } = consent;
    myConsoleLog("didomiOnReady", "consent", consent);
    if (disabled.length || enabled.length) {
      hasConsentOrNotRequired = true;
    }
    var isConsentRequired = didomiObject.isConsentRequired();
    myConsoleLog("didomiOnReady", "Is the consent required", isConsentRequired);
    if (!isConsentRequired) {
      hasConsentOrNotRequired = true;
    }
    myConsoleLog(
      "didomiOnReady",
      "window.didomiCountry : ",
      window.didomiCountry
    );
    setPPID();
  });

  (function () {
    function a(e) {
      if (!window.frames[e]) {
        if (document.body && document.body.firstChild) {
          var t = document.body;
          var n = document.createElement("iframe");
          n.style.display = "none";
          n.name = e;
          n.title = e;
          t.insertBefore(n, t.firstChild);
        } else {
          setTimeout(function () {
            a(e);
          }, 5);
        }
      }
    }
    function e(n, r, o, c, s) {
      function e(e, t, n, a) {
        if (typeof n !== "function") {
          return;
        }
        if (!window[r]) {
          window[r] = [];
        }
        var i = false;
        if (s) {
          i = s(e, t, n);
        }
        if (!i) {
          window[r].push({
            command: e,
            parameter: t,
            callback: n,
            version: a,
          });
        }
      }
      e.stub = true;
      function t(a) {
        if (!window[n] || window[n].stub !== true) {
          return;
        }
        if (!a.data) {
          return;
        }
        var i = typeof a.data === "string";
        var e;
        try {
          e = i ? JSON.parse(a.data) : a.data;
        } catch (t) {
          return;
        }
        if (e[o]) {
          var r = e[o];
          window[n](
            r.command,
            r.parameter,
            function (e, t) {
              var n = {};
              n[c] = { returnValue: e, success: t, callId: r.callId };
              a.source.postMessage(i ? JSON.stringify(n) : n, "*");
            },
            r.version
          );
        }
      }
      if (typeof window[n] !== "function") {
        window[n] = e;
        if (window.addEventListener) {
          window.addEventListener("message", t, false);
        } else {
          window.attachEvent("onmessage", t);
        }
      }
    }
    e("__tcfapi", "__tcfapiBuffer", "__tcfapiCall", "__tcfapiReturn");
    a("__tcfapiLocator");
    (function (e, tgt) {
      var t = document.createElement("script");
      t.id = "spcloader";
      t.type = "text/javascript";
      t.async = true;
      t.src =
        "https://sdk.privacy-center.org/" +
        e +
        "/loader.js?target_type=notice&target=" +
        tgt;
      t.charset = "utf-8";
      var n = document.getElementsByTagName("script")[0];
      n.parentNode.insertBefore(t, n);
    })("4ddf68ae-5211-4fb3-9350-c14ce85ace44", noticeID);
  })();
}

// ppid
window.googletag = window.googletag || { cmd: [] };
window.ppid = window.getCookies("lgppid");
if (!window.ppid && !window.md5) {
  var script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/js-md5@0.8.3/src/md5.min.js";
  script.onload = function () {
    console.log("md5.min.js loaded");
  };
  document.head.appendChild(script);
}
function setPPID() {
  var _ga = window.getCookies("_ga") || Math.random().toString();
  if (window.md5) {
    window.ppid = window.md5(_ga);
    var hostName = window.location.hostname.replace(/.*(\..*\..*)/gm, "$1");
    document.cookie =
      "lgppid=" +
      window.ppid +
      ";path=/;max-age=" +
      365 * 24 * 60 * 60 +
      ";domain=" +
      hostName;
  } else {
    setTimeout(setPPID, 200);
  }
}
if (!window.ppid) {
  setPPID();
}

if (!!window.ppid) {
  googletag.cmd.push(function () {
    googletag.pubads().setPublisherProvidedId(window.ppid);
  });
}
// ppid end

var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

window.my_pbjs_available_units = {};
window.displayGameSticky = function (show) {
  if (window.sticky_div) {
    window.sticky_div.style.display = show ? "flex" : "none";
  }
  if (window.o_sticky_l_div) {
    window.o_sticky_l_div.style.display = show ? "flex" : "none";
  }
  if (window.o_sticky_r_div) {
    window.o_sticky_r_div.style.display = show ? "flex" : "none";
  }
};
window.get_ads_unit = function () {
  // ads unit
  if (window.location.href.indexOf("jurassicRunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/sticky-game-advertising";
  else if (window.location.href.indexOf("templeQuestFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/temple-quest-sticky-advertising";
  else if (window.location.href.indexOf("powerWallFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/power-wall-sticky-advertising";
  else if (window.location.href.indexOf("yummySlotMachineFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/yummy-slot-machine-sticky-advertising";
  else if (window.location.href.indexOf("nitroTukTukFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/nitro-tuk-tuk-sticky-advertising";
  else if (window.location.href.indexOf("zombieSplashFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/zombie-splash-sticky-advertising";
  else if (window.location.href.indexOf("meowMeowLifeFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/meow-meow-life-sticky-advertising";
  else if (window.location.href.indexOf("dotsManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/dots-mania-ticky-advertising";
  else if (window.location.href.indexOf("basketballSmashFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/basket-ball-smash-sticky-advertising";
  else if (window.location.href.indexOf("castleDefenseFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/castle-defense-sticky-advertising";
  else if (window.location.href.indexOf("birdyRushFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/birdy-rush-sticky-advertising";
  else if (window.location.href.indexOf("crazySwitchColorFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/crazy-switch-color-sticky-advertising";
  else if (window.location.href.indexOf("mahjongMaster2Free") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/mahjong-master-2-sticky-advertising";
  else if (window.location.href.indexOf("jewelExplodeFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-explode-sticky-advertising";
  else if (window.location.href.indexOf("jewelBubbles3Free") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-bubbles-3-sticky-advertising";
  else if (window.location.href.indexOf("beaverRiverRaveFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/beaver-river-rave-sticky-advertising";
  else if (window.location.href.indexOf("ninjaUpFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/ninja-up-sticky-advertising";
  else if (window.location.href.indexOf("urbanStackFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/urban-stack-sticky-advertising";
  else if (window.location.href.indexOf("puzzlePetsPairsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/puzzle-pets-pairs-sticky-advertising";
  else if (window.location.href.indexOf("ludibubblesFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/ludibubbles-sticky-advertising";
  else if (window.location.href.indexOf("realFootballChallengeFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/real-football-challenge-sticky-advertising";
  else if (window.location.href.indexOf("nitroStreetRunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/nitro-street-run-sticky-advertising";
  else if (window.location.href.indexOf("gameloftSolitaireFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/gameloft-solitaire-sticky-advertising";
  else if (window.location.href.indexOf("bubbleBlockBreakerFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/bubble-block-breaker-sticky-advertising";
  //else if (window.location.href.indexOf("castleOfMagicFree") >= 0) sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/castle-of-magic-sticky-advertising";
  else if (window.location.href.indexOf("puzzlePetsMemoryFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/puzzle-pets-memory-sticky-advertising";
  else if (window.location.href.indexOf("bubbleBashFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/bubble-bash-sticky-advertising";
  else if (window.location.href.indexOf("match3OfTheWestFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/match-3-f-the-west-sticky-advertising";
  else if (window.location.href.indexOf("touchTheEvenFiguresFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/touch-the-even-figures-sticky-advertising";
  else if (window.location.href.indexOf("castleofIntenseDismayFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/castle-of-intense-dismay-sticky-advertising";
  else if (window.location.href.indexOf("fantasySkydiverFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/fantasy-sky-diver-sticky-advertising";
  //else if (window.location.href.indexOf("kiteFree") >= 0) sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/kite-sticky-advertising";
  else if (window.location.href.indexOf("infiniteHeightsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/infinite-heights-sticky-advertising";
  else if (window.location.href.indexOf("fantasySushiDiverFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/fantasy-sushi-diver-sticky-advertising";
  //else if (window.location.href.indexOf("supercapeOfJusticeFree") >= 0) sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/supercape-of-justice-sticky-advertising";
  else if (window.location.href.indexOf("rapunzelTowerFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/rapunzel-tower-sticky-advertising";
  else if (window.location.href.indexOf("sheepStackingFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/sheep-stacking-sticky-advertising";
  else if (window.location.href.indexOf("fashionHolicFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/fashion-holic-sticky-advertising";
  else if (window.location.href.indexOf("subwayRunnerFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/subway-runner-sticky-advertising";
  else if (window.location.href.indexOf("subwaySurfersSeoulFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/subway-surfers-seoul-sticky-advertising";
    window.enableAnchorAds = !true;
  } else if (window.location.href.indexOf("dragRacingClubFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/drag-racing-club-sticky-advertising";
  else if (window.location.href.indexOf("powerpuffGirlsMojoMadnessFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/powerpuff-girls-mojo-madness-sticky-advertising";
  else if (window.location.href.indexOf("checkersLegendFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/checkers-legend-sticky-advertising";
  else if (window.location.href.indexOf("spiderSolitaireFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/spider-solitaire-sticky-advertising";
  else if (window.location.href.indexOf("roadFuryFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/road-fury-sticky-advertising";
  else if (window.location.href.indexOf("basketballMasterFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/basketball-master-sticky-advertising";
  else if (window.location.href.indexOf("unparkMeFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/unpark-me-sticky-advertising";
  else if (window.location.href.indexOf("rollThisBallFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/roll-this-ball-sticky-advertising";
  else if (window.location.href.indexOf("cookieTapFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/cookie-tap-sticky-advertising";
  else if (window.location.href.indexOf("piratesFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pirates-sticky-advertising";
  else if (window.location.href.indexOf("ludoLegendFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/ludo-legend-sticky-advertising";
    window.game_sticky_max_request = 1000;
  } else if (window.location.href.indexOf("jewelPetsMatchFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-pets-match-sticky-advertising";
  else if (window.location.href.indexOf("donutsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/donuts-sticky-advertising";
  else if (window.location.href.indexOf("2048LegendFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/2048-legend-sticky-advertising";
  else if (window.location.href.indexOf("pharaohSlotsCasinoFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pharaoh-slots-casino-sticky-advertising";
  else if (window.location.href.indexOf("pizzaNinjaManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pizza-ninja-mania-sticky-advertising";
  else if (window.location.href.indexOf("zooTriviaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/zoo-trivia-sticky-advertising";
  else if (window.location.href.indexOf("bunnyQuestFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/bunny-quest-sticky-advertising";
  else if (window.location.href.indexOf("mahjongFlowersFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/mahjong-flowers-sticky-advertising";
  else if (window.location.href.indexOf("solitaireGrandeFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/solitaire-grande-sticky-advertising";
  else if (window.location.href.indexOf("jewelAquariumFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-aquarium-sticky-advertising";
  else if (window.location.href.indexOf("freecellSolitaireFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/freecell-solitaire-sticky-advertising";
  else if (window.location.href.indexOf("tomAndJerryDeluxeFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/tom-and-jerry-deluxe-sticky-advertising";
  else if (window.location.href.indexOf("asphaltRetroFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/asphalt-retro-sticky-advertising";
  else if (window.location.href.indexOf("boBoiBoyRunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/boboiboy-galaxy-run-sticky-advertising";
  else if (window.location.href.indexOf("klondikeSolitaireFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/klondike-solitaire-sticky-advertising";
  else if (window.location.href.indexOf("cricketLegendsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/cricket-legends-sticky-advertising";
  else if (window.location.href.indexOf("kidsZooFarmFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kids-zoo-farm-sticky-advertising";
  else if (window.location.href.indexOf("jewelChristmasFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-christmas-sticky-advertising";
  else if (window.location.href.indexOf("zombiesVsHalloweenFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/zombies-vs-halloween-sticky-advertising";
  else if (window.location.href.indexOf("halloweenHorrorMassacreFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/halloween-horror-massacre-sticky-advertising";
  else if (window.location.href.indexOf("motoFuryFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/moto-fury-sticky-advertising";
  else if (window.location.href.indexOf("frogRushFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/frog-rush-sticky-advertising";
  else if (window.location.href.indexOf("jewelDuelFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-duel-sticky-advertising";
  else if (window.location.href.indexOf("monsterGoFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/monster-go-sticky-advertising";
  else if (window.location.href.indexOf("fidgetSpinnerManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/fidget-spinner-mania-sticky-advertising";
  else if (window.location.href.indexOf("zombieRoadFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/zombie-road-sticky-advertising";
  else if (window.location.href.indexOf("4InRowManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/4-in-row-mania-sticky-advertising";
  else if (window.location.href.indexOf("galaxyWarriorsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/galaxy-warriors-sticky-advertising";
  else if (window.location.href.indexOf("dontTouchTheRedFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/dont-touch-the-red-sticky-advertising";
  else if (window.location.href.indexOf("jumpWithJustinFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jump-with-justin-sticky-advertising";
  else if (window.location.href.indexOf("worldTriviaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/world-trivia-sticky-advertising";
  else if (window.location.href.indexOf("kidsFarmFunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kids-farm-fun-sticky-advertising";
  else if (window.location.href.indexOf("novaCoveredOpsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/nova-covered-ops-sticky-advertising";
  else if (window.location.href.indexOf("kidsAnimalFunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kids-animal-fun-sticky-advertising";
  else if (window.location.href.indexOf("tastyJewelFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/tasty-jewel-sticky-advertising";
  else if (window.location.href.indexOf("dominoLegendFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/domino-legend-sticky-advertising";
  else if (window.location.href.indexOf("blackjackMasterFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/blackjack-master-sticky-advertising";
  else if (window.location.href.indexOf("7x7UltimateFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/7x7-ultimate-sticky-advertising";
  else if (window.location.href.indexOf("arcticPongFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/arctic-pong-sticky-advertising";
  else if (window.location.href.indexOf("zombieMassacreFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/zombie-massacre-sticky-advertising";
  else if (window.location.href.indexOf("santaRunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/santa-run-sticky-advertising";
  else if (window.location.href.indexOf("kidsZooFunFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kids-zoo-fun-sticky-advertising";
  else if (window.location.href.indexOf("chubbyBirdsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/chubby-birds-sticky-advertising";
  else if (window.location.href.indexOf("colorPinFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/color-pin-sticky-advertising";
  else if (window.location.href.indexOf("redemptionSlotMachineFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/redemption-slot-machine-sticky-advertising";
  else if (window.location.href.indexOf("hiddenObjectsSuperthiefFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/hidden-objects-superthief-sticky-advertising";
  else if (window.location.href.indexOf("get10PlusFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/get-10-plus-sticky-advertising";
  else if (window.location.href.indexOf("jewelLegendFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jewel-legend-sticky-advertising";
  else if (window.location.href.indexOf("pickALockFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pick-a-lock-sticky-advertising";
  else if (window.location.href.indexOf("solitaireMasterFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/solitaire-master-sticky-advertising";
  else if (window.location.href.indexOf("flowManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/flow-mania-sticky-advertising";
  else if (window.location.href.indexOf("wordsDetectiveFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/words-detective-bank-heist-sticky-advertising";
  else if (window.location.href.indexOf("streetDriverFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/street-driver-sticky-advertising";
  else if (window.location.href.indexOf("get10Free") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/get-10-sticky-advertising";
  else if (window.location.href.indexOf("pizzaNinja3Free") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pizza-ninja-3-sticky-advertising";
  else if (window.location.href.indexOf("kitchenBazarFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kitchen-bazar-sticky-advertising";
  else if (window.location.href.indexOf("mahjongManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/mahjong-mania-sticky-advertising";
  else if (window.location.href.indexOf("stickFreakFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/stick-freak-sticky-advertising";
  else if (window.location.href.indexOf("towerManiaFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/tower-mania-sticky-advertising";
  else if (window.location.href.indexOf("timberGuyFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/timber-guy-sticky-advertising";
  else if (window.location.href.indexOf("twoCarsFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/two-cars-sticky-advertising";
  else if (window.location.href.indexOf("jellyBombFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jelly-bomb-sticky-advertising";
  else if (window.location.href.indexOf("dripDropFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/drip-drop-sticky-advertising";
  else if (window.location.href.indexOf("fierceShotFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/fierce-shot-sticky-advertising";
  else if (window.location.href.indexOf("midnightPoolClassicFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/midnight-pool-classic-sticky-advertising";
  else if (window.location.href.indexOf("paddingtonFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/paddington-sticky-advertising";
  else if (window.location.href.indexOf("paperFlightFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/paper-flight-sticky-advertising";
  else if (window.location.href.indexOf("pocketDessertChefFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pocket-dessert-chef-sticky-advertising";
  else if (window.location.href.indexOf("tastyDropFree") >= 0)
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/tasty-drop-sticky-advertising";
  // delay sticky
  else if (window.location.href.indexOf("piratesPathOfTheBuccaneerFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pirates-path-of-the-buccaneer-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("dangerDash") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/danger-dash-sticky-advertising";
    isDelaySticky = !true;
  }
  //else if (window.location.href.indexOf("subwaySurfersSeoulFree") >= 0) {sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/subway-surfers-seoul-sticky-advertising";isDelaySticky = true;}
  else if (window.location.href.indexOf("fastLaneRacingFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/fast-lane-racing-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("spongebobRunFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/sponge-bob-run-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("doodleGodFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/doodle-god-sticky-advertising";
    isDelaySticky = !true;
    isGameStickyPlaceTop = true;
  }
  //else if (window.location.href.indexOf("twoCarsFree") >= 0) {sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/two-cars-sticky-advertising";isDelaySticky = true;}
  //else if (window.location.href.indexOf("solitaireMasterFree") >= 0) {sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/solitaire-master-sticky-advertising";isDelaySticky = true;}
  //else if (window.location.href.indexOf("arcticPongFree") >= 0) {sa_ads_unit = "/29838709/ca-games-pub-4052078165537812-tag/arctic-pong-sticky-advertising";isDelaySticky = true;}
  else if (window.location.href.indexOf("kidsCutePairsFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kids-cute-pairs-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("sweetCandyManiaFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/sweet-candy-mania-sticky-advertising";
  } else if (window.location.href.indexOf("nitroStreetRun2Free") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/nitro-street-run-2-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("siberianStrikeFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/siberian-strike-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("jellimonFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/jellimon-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("skyBridgeFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/sky-bridge-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("ludiBingoFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/ludi-bingo-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("hexAquaticFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/hex-aquatic-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("realFootballRunnerFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/real-football-runner-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("pastryParadiseFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/pastry-paradise-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("gameloftSlotMachineFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/gameloft-slot-machine-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("kiteFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/kite-sticky-advertising";
    isDelaySticky = !true;
  } else if (
    window.location.href.indexOf("gameloftSportsMinigameCollectionFree") >= 0
  ) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/gameloft-sports-minigame-collection-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("supercapeOfJusticeFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/supercape-of-justice-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("hexAquaticKrakenFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/hexaquatic-kraken-sticky-advertising";
    isDelaySticky = !true;
  } else if (window.location.href.indexOf("nitroStreetDragModeFree") >= 0) {
    sa_ads_unit =
      "/29838709/ca-games-pub-4052078165537812-tag/nitro-street-run-drag-mode-sticky-advertising";
    isDelaySticky = !true;
  }
};
window.isDelaySticky = false;
window.isGameStickyPlaceTop = false;
//window.isPrebidScriptAvailable = false;
//window.isAPSScriptAvailable = false;
window.isGPTScriptAvailable = false;
window.loadGPTScript = function () {
  if (blockAds || window.disableAds) return;
  if (!window.isGPTScriptAvailable) {
    window.isGPTScriptAvailable = !false;
    var bodyEle = document.getElementsByTagName("body")[0];
    // load gpt.js
    var script = document.createElement("script");
    script.onload = function () {
      console.log("gpt.js loaded");
    };
    script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    bodyEle.appendChild(script);
  }
};
window.loadPrebidScript = function () {
};
window.isRewardSDKScriptAvailable = false;
window.loadRewardSDKScript = function () {
  if (blockAds || window.disableAds) return;
  if (!window.isRewardSDKScriptAvailable) {
    window.isRewardSDKScriptAvailable = !false;
    var bodyEle = document.getElementsByTagName("body")[0];
    // load adsRewardSDK.js
    var script = document.createElement("script");
    script.onload = function () {
      myConsoleLog("adsRewardSDK.js loaded");
    };
    script.src = "../js/games_lib/adsSDK/adsRewardSDK.js";
    bodyEle.appendChild(script);
  }
};

// Game Manual Interstitial, adx
window.gameManualInterstitialSlotUnit = "";
window.gameManualInterstitialSlotEvent = null;
window.gameManualInterstitialShowPreroll = false;
window.defineGameManualInterstitialSlot = function (time = 0) {
  window.gameManualInterstitialSlotEvent = null;
  if (window.gameManualInterstitialSlotUnit != "") {
    // Define a game manual interstitial ad slot.
    window.gameManualInterstitialSlot = googletag.defineOutOfPageSlot(
      window.gameManualInterstitialSlotUnit,
      googletag.enums.OutOfPageFormat.GAME_MANUAL_INTERSTITIAL
    );

    // Slot returns null if the page or device does not support interstitials.
    if (window.gameManualInterstitialSlot) {
      window.gameManualInterstitialSlot.addService(googletag.pubads());
      googletag.pubads().addEventListener(
        "gameManualInterstitialSlotReady",
        function (slotReadyEvent) {
          if (window.gameManualInterstitialSlot === slotReadyEvent.slot) {
            console.log("game manual interstitialSlot loaded");
            //slotReadyEvent.makeGameManualInterstitialVisible();
            window.gameManualInterstitialSlotEvent = slotReadyEvent;
            if (time == 0) {
              //window.showAdxPreroll();
            } else {
              if (Date.now() - time <= window.AD_LOAD_TIMEOUT) {
                window.isAdxPlaying = true;
                window.showGameManualInterstitial("next");
              }
            }
          }
        },
        { once: true }
      );
      googletag
        .pubads()
        .addEventListener("gameManualInterstitialSlotClosed", resumeGame);
    }
  }
};
window.showAdxPreroll = function () {
  if (
    !window.isDiableFirstAd &&
    window.flowADXH5Ima3 &&
    window.gameManualInterstitialShowPreroll == false &&
    window.game_frame &&
    window.gameManualInterstitialSlotEvent != null
  ) {
    window.gameManualInterstitialShowPreroll = true;
    window.showGameManualInterstitial("preroll");
  }
};
window.showAdx = function (pos) {
  if (window.gameManualInterstitialSlotEvent != null/* || window.preloadAd*/) {
    window.showGameManualInterstitial(pos);
  } else {
    window.isAdxPlaying = false;

    googletag.cmd.push(function () {
      window.defineGameManualInterstitialSlot(Date.now());
      googletag.pubads().refresh([window.gameManualInterstitialSlot]);
    });
    window.setTimeout(function () {
      if (!window.isAdxPlaying) {
        console.log("adx timeout, continue waterfall");
        window.showGameManualInterstitial(pos);
      }
    }, window.AD_LOAD_TIMEOUT + 100);
  }
};
window.showGameManualInterstitial = function (pos) {
  if (window.gameManualInterstitialSlotEvent != null) {
    console.log("show ads adx");
    window.gameManualInterstitialSlotEvent.makeGameManualInterstitialVisible();
  } else {
    {
      if (window.isUseADXOnly) {
				if (window.game_frame) {
					console.log("msstart: backfill ads adx done");
					window.game_frame.contentWindow.adDone();
				}
			} else {
				console.log("msstart: backfill ads adx done, continue waterfall");
				if (window.flowADXH5Ima3) {
					if (window.game_frame) {
						window.game_frame.contentWindow.showAd2(pos, true);
						//window.refreshADX();
					}
				} else {
					playAds();
					//window.refreshADX();
				}
			}
    }
  }
};
window.refreshADX = function () {
  if (window.gameManualInterstitialSlot != null) {
    googletag.destroySlots([window.gameManualInterstitialSlot]);
  }
  //window.googletag.pubads().clear([window.gameManualInterstitialSlot]);
  window.defineGameManualInterstitialSlot();
  //googletag.display(gameManualInterstitialSlot);
  googletag.cmd.push(function () {
    googletag.pubads().refresh([window.gameManualInterstitialSlot]);
  });
};
window.resumeGame = function () {
  myConsoleLog("resumeGame");
  if (window.game_frame) {
    console.log("msstart: backfill ads adx played");
		window.game_frame.contentWindow.lastShowAds = Date.now();
    window.game_frame.contentWindow.adDone();
  }
  if (window.preloadAd) {
    window.refreshADX();
  } else {
    if (window.gameManualInterstitialSlot != null) {
      googletag.destroySlots([window.gameManualInterstitialSlot]);
      window.gameManualInterstitialSlotEvent = null;
    }
  }
};

// end Game Manual Interstitia

get_ads_unit();

window.sa_init = function () {
  if (blockAds) return;
  //if (sa_ads_unit == "" && o_sa_l_ads_unit == "") return; // fix bug: lost adx ad in game disable sticky ad

  var bodyEle = document.getElementsByTagName("body")[0];
  // load gpt.js
  window.loadGPTScript();

  var adPlace =
    document.getElementById("adsContainer") ||
    document.getElementById("freeBG");
  var adFrame = document.getElementById("freeFrame");
  if (adPlace) {
    adPlace.style.zIndex = ads_game_zIndex;
  }
  if (adFrame) {
    adFrame.style.zIndex = ads_game_zIndex + 1;
  }

  // add div
  if (sa_ads_unit != "") {
    window.sticky_div = document.createElement("div");
    sticky_div.id = "sticky-ad";
    sticky_div.style.position = "fixed";
    if (isDelaySticky) {
      sticky_div.style.display = "none";
    }
    if (isGameStickyPlaceTop) {
      sticky_div.style.top = "0";
    } else {
      sticky_div.style.bottom = "0";
    }
    sticky_div.style.textAlign = "center";
    sticky_div.style.width = "100%";
    sticky_div.style.zIndex = sa_div_zIndex;
    sticky_div.innerHTML =
      "<div id=" +
      sa_div_id +
      ' style="align-items: center; display: flex; justify-content: center; font-size: 0;"></div>';
    sticky_div.style.display = "flex";
    sticky_div.style.alignItems = "center";
    sticky_div.style.justifyContent = "center";
    sticky_div.style.overflow = "hidden";
    sticky_div.style.maxHeight = "75px";
    bodyEle.appendChild(sticky_div);
  }
  if (o_sa_l_ads_unit != "") {
    window.o_sticky_l_div = document.createElement("div");
    o_sticky_l_div.id = "o-sticky-l-ad";
    o_sticky_l_div.style.position = "fixed";
    o_sticky_l_div.style.display = "none";
    o_sticky_l_div.style.top = "0";
    o_sticky_l_div.style.textAlign = "center";
    o_sticky_l_div.style.width = "160px";
    o_sticky_l_div.style.maxWidth = "160px";
    o_sticky_l_div.style.height = "100%";
    o_sticky_l_div.style.flexFlow = "column";
    o_sticky_l_div.style.justifyContent = "center";
    o_sticky_l_div.style.alignItems = "center";
    o_sticky_l_div.style.zIndex = 13000;
    o_sticky_l_div.innerHTML =
      "<div id=" +
      o_sa_l_div_id +
      ' style="align-items: center; display: flex; justify-content: center;"></div>';
    o_sticky_l_div.style.display = "flex";
    o_sticky_l_div.style.alignItems = "center";
    o_sticky_l_div.style.justifyContent = "center";
    o_sticky_l_div.style.overflow = "hidden";
    bodyEle.appendChild(o_sticky_l_div);
    o_sticky_l_div.style.display = "none";

    window.o_sticky_r_div = document.createElement("div");
    o_sticky_r_div.id = "o-sticky-r-ad";
    o_sticky_r_div.style.position = "fixed";
    o_sticky_r_div.style.display = "none";
    o_sticky_r_div.style.top = "0";
    o_sticky_r_div.style.right = "0";
    o_sticky_r_div.style.textAlign = "center";
    o_sticky_r_div.style.width = "160px";
    o_sticky_r_div.style.maxWidth = "160px";
    o_sticky_r_div.style.height = "100%";
    o_sticky_r_div.style.flexFlow = "column";
    o_sticky_r_div.style.justifyContent = "center";
    o_sticky_r_div.style.alignItems = "center";
    o_sticky_r_div.style.zIndex = 13000;
    o_sticky_r_div.innerHTML =
      "<div id=" +
      o_sa_r_div_id +
      ' style="align-items: center; display: flex; justify-content: center;"></div>';
    o_sticky_r_div.style.display = "flex";
    o_sticky_r_div.style.alignItems = "center";
    o_sticky_r_div.style.justifyContent = "center";
    o_sticky_r_div.style.overflow = "hidden";
    bodyEle.appendChild(o_sticky_r_div);
    o_sticky_r_div.style.display = "none";
  }
  // init ads
  googletag.cmd.push(function () {
    googletag.pubads().setForceSafeFrame(false);
    // build size mapping bottom sticky
    if (sa_ads_unit != "") {
      var sizeMappingBuilder = googletag.sizeMapping();
      sa_aSize_mapping.forEach(function (size) {
        sizeMappingBuilder.addSize(size[0], size[1]);
      });
      var sizeMapping = sizeMappingBuilder.build();

      window.sticky_bootom_slot = googletag
        .defineSlot(sa_ads_unit, sa_aSize_noMapping, sa_div_id)
        .defineSizeMapping(sizeMapping)
        .addService(googletag.pubads());
    }
    if (o_sa_l_ads_unit != "") {
      var o_sizeMappingBuilder = googletag.sizeMapping();
      o_sa_l_aSize_mapping.forEach(function (size) {
        o_sizeMappingBuilder.addSize(size[0], size[1]);
      });
      var o_sizeMapping = o_sizeMappingBuilder.build();

      window.sticky_overlay_l_slot = googletag
        .defineSlot(o_sa_l_ads_unit, o_sa_l_aSize_noMapping, o_sa_l_div_id)
        //.defineSizeMapping(o_sizeMapping)
        .addService(googletag.pubads());

      var o_sizeMappingBuilder_r = googletag.sizeMapping();
      o_sa_l_aSize_mapping.forEach(function (size) {
        o_sizeMappingBuilder_r.addSize(size[0], size[1]);
      });
      var o_sizeMapping_r = o_sizeMappingBuilder_r.build();

      window.sticky_overlay_r_slot = googletag
        .defineSlot(o_sa_r_ads_unit, o_sa_l_aSize_noMapping, o_sa_r_div_id)
        //.defineSizeMapping(o_sizeMapping_r)
        .addService(googletag.pubads());
    }
		if (window.preloadAd) {
			window.defineGameManualInterstitialSlot();
		}

    googletag.pubads().disableInitialLoad();
    googletag.pubads().enableSingleRequest();
    googletag
      .pubads()
      .setTargeting(Object.keys(sa_targeting)[0], sa_targeting.source); /// assign the value of utm_campaign to

    // for portal
    googletag.pubads().setTargeting("portal", window.portal);

    googletag.enableServices();
    //googletag.display(sa_div_id);
    if (
      window.gameManualInterstitialSlot != null &&
      (window.preloadAd || (!window.isDiableFirstAd && (window.isUseADXOnly || window.flowADXH5Ima3)))
    ) {
      googletag.pubads().refresh([window.gameManualInterstitialSlot]);
    }
  });
	window.displaySticky = function(){
		googletag.cmd.push(function () {
			var refresh_slots = [];
			if (sa_ads_unit != "") {
				refresh_slots.push(window.sticky_bootom_slot);
			}
			if (window.isEnableSideSticky) {
				refresh_slots.push(window.sticky_overlay_l_slot);
				refresh_slots.push(window.sticky_overlay_r_slot);
			}
			if(refresh_slots.length > 0)
				googletag.pubads().refresh(refresh_slots);
		});
	}

};
//#endregion
window.addEventListener("load", function (event) {
  if (blockAds) return;
	// move from adsdk
	window.adsContainer = document.getElementById('adsContainer');
	window.adsContainer.style.display = "none";
	// end

  pageLoadedTime = Date.now();
  if (!window.enableADS) {
    window.disableAds = true;
  }

  if (window.isLandscapeGame !== undefined) {
    window.isLandscapeGames = window.isLandscapeGame;
  }
  if (window.forceDisableSideAd) {
    window.isDisableLeftRightAdGames = window.forceDisableSideAd;
  }

  if (
    window.isDesktop &&
    !window.isLandscapeGames &&
    !window.isDisableLeftRightAdGames
  ) {
    window.isEnableSideSticky = true;
    window.o_sa_l_ads_unit = window.sa_ads_unit;
    window.o_sa_r_ads_unit = window.sa_ads_unit;
  }

  if (window.disableAds) {
    window.sa_ads_unit = "";
    window.o_sa_l_ads_unit = "";
    window.o_sa_r_ads_unit = "";
  }
	window.sa_ads_unit = "";
  window.gameManualInterstitialSlotUnit =
    "/29838709/ca-games-pub-4052078165537812-tag/afg-" + window.productKey;
  // sticky ads
  window.sa_init();
  var initIframe = function () {
    // iframe mode script
    window.game_frame = document.getElementById("game_frame");
    if (window.game_frame) {
      // setAttribute
      game_frame.allowFullscreen = "fullscreen 'none'";
      game_frame.allow = "autoplay *; fullscreen 'none'";
      //game_frame.sandbox="allow-same-origin allow-scripts allow-top-navigation allow-popups-to-escape-sandbox allow-popups allow-pointer-lock allow-orientation-lock allow-modals allow-forms";
      window.sticky_height =
        window.isLandscapeGames ||
        window.enableAnchorAds ||
        window.sa_ads_unit == ""
          ? 0
          : 90;
      game_frame.src = "play.html";

      game_frame.addEventListener("contextmenu", function (e) {
        e.preventDefault();
      });

      var gameframediv = document.getElementById("gameframediv");
      gameframediv.addEventListener("contextmenu", function (e) {
        e.preventDefault();
      });

      var _FrameWidth = document.documentElement.clientWidth;
      var _FrameHeight = document.documentElement.clientHeight - sticky_height;
      game_frame.style.width = _FrameWidth + "px";
      game_frame.style.height = _FrameHeight + "px";
      gameframediv.style.height = _FrameHeight + "px";

      window.addEventListener("resize", function () {
        var _FrameWidth = document.documentElement.clientWidth;
        var _FrameHeight =
          document.documentElement.clientHeight - sticky_height;
        game_frame.style.width = _FrameWidth + "px";
        game_frame.style.height = _FrameHeight + "px";
        gameframediv.style.height = _FrameHeight + "px";
      });
    }
    window.gameStickyStart = setInterval(function () {
      try {
        if (!window.isDiableFirstAd && !isAdsComplete() /*&& Date.now() - pageLoadedTime <= 30000*/) {
          // delay sticky max 30s
          return;
        }
      } catch (e) {
        if (Date.now() - pageLoadedTime <= 15000) {
          return;
        }
      }
      if (sa_ads_unit != "" && !window.isLandscapeGames) {
        if (!window.enableAnchorAds) {
          displayGameSticky(true);
					displaySticky()
					
        } else {
          window.anchorSlot = googletag.defineOutOfPageSlot(
            sa_ads_unit,
            googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR
          );
          if (window.anchorSlot) {
            window.anchorSlot.addService(googletag.pubads());
          }
          if (window.anchorSlot) {
            window.googletag.cmd.push(function () {
              window.googletag.pubads().refresh([window.anchorSlot]);
            });
          }
        }
        window.game_sticky_request_count++;
        //if (window.location.href.indexOf("zombieSplashFree") < 0){
        window.addEventListener("gl_ads_state_change", function (event) {
          if (event.detail.newState == AdsState.COMPLETE) {
            if (!window.enableAnchorAds) {
              //window.gameStickyRefresh = setInterval(
              //function() {
              if (
                sa_ads_unit != "" &&
                !window.isLandscapeGames &&
                window.sticky_div.style.display != "none"
              ) {
                displayGameSticky(true);
								displaySticky();
                window.game_sticky_request_count++;
                if (
                  window.game_sticky_request_count >=
                  window.game_sticky_max_request
                ) {
                  //clearInterval(window.gameStickyRefresh);
                }
              }
              //}, game_sticky_interval);
            } else {
              if (window.anchorSlot) {
                window.googletag.cmd.push(function () {
                  window.googletag.pubads().refresh([window.anchorSlot]);
                });
              }
            }
            window.parent.postMessage(window.v3Obj.post.AdsCompletion, "*");
          } else if (
            event.detail.newState == AdsState.LOADING ||
            event.detail.newState == AdsState.STARTED
          ) {
            if (window.anchorSlot) {
              window.googletag.cmd.push(function () {
                window.googletag.pubads().clear([window.anchorSlot]);
              });
            }
            window.parent.postMessage(window.v3Obj.post.AdsStart, "*");
          }
        });
        //}
      }

      clearInterval(window.gameStickyStart);
    }, 1000);

    var moveCookieToTop = setInterval(function () {
      var cookiePopup = document.getElementsByClassName("cc_container");
      if (cookiePopup.length > 0) {
        cookiePopup[0].style.top = 0;
        cookiePopup[0].style.height = "70px";
        //cookiePopup[0].style.display = "none"
        clearInterval(moveCookieToTop);
      }
    }, 200);
  };

  if (window.enableRewardAds) {
    if (!window.isGPTScriptAvailable) {
      loadOrderScript(
        "//securepubads.g.doubleclick.net/tag/js/gpt.js",
        "../js/games_lib/adsSDK/adsRewardSDK.js"
      );
    } else {
      loadOrderScript("../js/games_lib/adsSDK/adsRewardSDK.js");
    }
  }

  //#region eruda
  window.hasEruda =
    urlParams.get("eruda") === "true" ||
    localStorage.getItem("eruda") == "true";
  if (hasEruda) {
    loadEruda();
  }
  //#endregion
  initIframe();

  //#region as: postMessage
  if (window.ASObj.is) {
    // console.log("No Start: ", document.querySelector("#game_frame"));
    var reviewGALayer = setInterval(function () {
      for (
        i = window.dataLayer.length - 1 - 5;
        i >= 0 && i < window.dataLayer.length;
        i++
      ) {
        if (window.dataLayer[i].ga_action === "Main Menu") {
          var MainMenu = window.ASObj.post.Main_Menu;
          if (MainMenu.id < i) {
            MainMenu.id = i;
            window.parent.postMessage(MainMenu, "*");
          }
        }
        if (window.dataLayer[i].ga_action === "Start") {
          var Start = window.ASObj.post.Start;
          if (Start.id < i) {
            Start.id = i;
            window.parent.postMessage(Start, "*");
          }
        }
        if (window.dataLayer[i].ga_action === "Completion") {
          var AdsCompletion = window.ASObj.post.AdsCompletion;
          if (AdsCompletion.id < i) {
            AdsCompletion.id = i;
            var waitAds = setInterval(function () {
              if (isAdsComplete()) {
                clearInterval(waitAds);
                window.parent.postMessage(AdsCompletion, "*");
              }
            }, 1000);
          }
        }
        if (window.dataLayer[i].as_action === "Completion") {
          var Completion = window.ASObj.post.Completion;
          if (Completion.id < i) {
            Completion.id = i;
            Completion.coin = window.dataLayer[i]["coin"];
            Completion.distance = window.dataLayer[i]["distance"];
            Completion.score = window.dataLayer[i]["score"];
            Completion.bridge = window.dataLayer[i]["bridge"];
            Completion.perfect = window.dataLayer[i]["perfect"];
            Completion.item = window.dataLayer[i]["item"];
            Completion.duration = window.dataLayer[i]["duration"];
            Completion.kill = window.dataLayer[i]["kill"];
            Completion.use = window.dataLayer[i]["use"];
            window.parent.postMessage(Completion, "*");
          }
        }
        if (window.dataLayer[i].as_action === "Leaderboard") {
          var Leaderboard = window.ASObj.post.Leaderboard;
          if (Leaderboard.id < i) {
            Leaderboard.id = i;
            window.parent.postMessage(Leaderboard, "*");
          }
        }
        if (window.dataLayer[i].as_action === "Spend") {
          var Spend = window.ASObj.post.Spend;
          if (Spend.id < i) {
            Spend.id = i;
            Spend.item = window.dataLayer[i]["item"];
            window.parent.postMessage(Spend, "*");
          }
        }
      }
    }, 1000);
  }
  //#endregion
  //#region v3: postMessage
  if (window.v3Obj.is) {
    var reviewGALayer = setInterval(function () {
      for (
        i = window.dataLayer.length - 1 - 5;
        i >= 0 && i < window.dataLayer.length;
        i++
      ) {
        if (window.dataLayer[i].ga_action === "Main Menu") {
          var MainMenu = window.v3Obj.post.Main_Menu;
          if (MainMenu.id < i) {
            MainMenu.id = i;
            window.parent.postMessage(MainMenu, "*");
          }
        }
        if (window.dataLayer[i].ga_action === "Start") {
          var Start = window.v3Obj.post.Start;
          if (Start.id < i) {
            Start.id = i;
            window.parent.postMessage(Start, "*");
          }
        }
        if (window.dataLayer[i].ga_action === "Completion") {
          var AdsCompletion = window.v3Obj.post.AdsCompletion;
          if (AdsCompletion.id < i) {
            AdsCompletion.id = i;
            var waitAds = setInterval(function () {
              if (isAdsComplete()) {
                clearInterval(waitAds);
                window.top.postMessage(AdsCompletion, "*");
              }
            }, 1000);
          }
        }
				// msstart submit score
        if (window.dataLayer[i].as_action === "Completion") {
          var Completion = window.v3Obj.post.Completion;
          if (Completion.id < i) {
            Completion.id = i;
            Completion.coin = window.dataLayer[i]["coin"];
            Completion.distance = window.dataLayer[i]["distance"];
            Completion.score = window.dataLayer[i]["score"];
            Completion.bridge = window.dataLayer[i]["bridge"];
            Completion.perfect = window.dataLayer[i]["perfect"];
            Completion.item = window.dataLayer[i]["item"];
            Completion.duration = window.dataLayer[i]["duration"];
            Completion.kill = window.dataLayer[i]["kill"];
            Completion.use = window.dataLayer[i]["use"];
            window.parent.postMessage(Completion, "*");
          }
        }
      }
    }, 1000);
  }
});
  //#endregion
/* MS Start*/
window.addEventListener("ms_ads_state_change",  function onAdsStateChange(event) {
		if(event.detail.newState === window.parent.mssw.AdsState.COMPLETE
		|| event.detail.newState === window.parent.mssw.AdsState.ERROR
		|| event.detail.newState === window.parent.mssw.AdsState.CLOSE
		|| event.detail.newState === window.parent.mssw.AdsState.SKIP
		) {  
			if(event.detail.newState === window.parent.mssw.AdsState.COMPLETE){
				window.game_frame.contentWindow.lastShowAds = Date.now();
			}
			window.game_frame.contentWindow.adDone();
		}else if(event.detail.newState === window.parent.mssw.AdsState.ERROR_loadAds || event.detail.newState === window.parent.mssw.AdsState.ERROR_showAds){
			console.log("msstart: do backfill");
			window.game_frame.contentWindow.showAd("next");
		}
});
/* MS End*/
