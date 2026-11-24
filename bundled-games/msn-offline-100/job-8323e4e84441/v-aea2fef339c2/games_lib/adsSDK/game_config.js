if (typeof(adsConfigLoaded) == 'undefined'){
window.adsConfigLoaded = true;
var gameConfig = 
{//removeTextAds = 0: no remove, 1: remove, 2:no remove and cheat to show text ads	
	"globalConfig":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	
	"boBoiBoyRunFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":1,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"dangerDashFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"fashionHolicFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"kitchenBazarFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"realFootballFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"realFootballChallengeFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"realFootballRunnerFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"nitroStreetRun2Free":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"skyBridgeFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},
	"urbanStackFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20},	
	"zombieSplashFree":{"adsInterval":0,"adsEnableBG":true,"adsBGFadeDuration":0.001,"adsPreventClick":true,"adsPreventClickDuration":2,"removeTextAds":2,"maxShowAdsPerRequest":1,"maxErrorWaitTime":20}	
};
var setFullBG = setInterval(
						function(){
							var bg = document.getElementById('freeBG');
							var newAds = document.getElementById('adsContainer');
							if(bg){
								bg.style.backgroundColor = "#000";
								clearInterval(setFullBG);
							}
							if(newAds){
								clearInterval(setFullBG);
							}
						}
					,50);

var pidUrls = {
	"PH72": "samsung.ludigames.com",
	"PH86": "samsung.ludigames.com",
	"PI11": "samsung.ludigames.com",
	"PI13": "samsung.ludigames.com",
	"PI24": "samsung.ludigames.com",
	"PI30": "samsung.ludigames.com",
	"PI37": "samsung.ludigames.com",
	"PI40": "samsung.ludigames.com",
	"PI43": "samsung.ludigames.com",
	"PI57": "samsung.ludigames.com",

	"PI15": "vivo.ludigames.com",

	"PI07": "xiaomi.ludigames.com",	
	
	// "PI50": "",	
};
	function getReferrerCustom(autoRedirect){ // also save to cookie		
		// window.referrer = "http://samsung.ludigames.com/?utm_source=gameloft&utm_medium=bookmark&utm_campaign=PI43";		
		var defaultUrl = "https://play.ludigames.com";
		if(window.location.href.indexOf("gamingclub.as") >=0){
			defaultUrl = "https://gamingclub.as.com";
		}
		var homeUrl = "";
		var url = new URL(window.location);
		var queryString = url ? window.location.href.split('?')[1] : window.location.search.slice(1);
		var pidValue = window.ga_channel_name || (location.search.split("utm_campaign=")[1] ? location.search.split("utm_campaign=")[1].split("&")[0]: "undefined");//url.searchParams.get("utm_campaign");
		if(queryString)
		{
			if(pidValue !== "undefined")
			{
				//for samsung, vivo, xiaomi and more available in dictionary
				if( pidUrls.hasOwnProperty(pidValue) )
				{
					homeUrl = window.location.protocol + "//" + pidUrls[pidValue] + "/?" + queryString;
					
				}else
				{
					if(pidValue == "PI50" || pidValue == "PI44" || pidValue == "PI52" || pidValue == "PI53" || pidValue == "PI59" || pidValue == "PI60")	//for motorola
					{
						if(document.referrer)
						{
							homeUrl = document.referrer;	
						}else
						{
							homeUrl = defaultUrl + "/?" + queryString;
						}						
					}else
					{
						homeUrl = defaultUrl + "/?" + queryString;
					}
				}				
			}else
			{
				homeUrl = defaultUrl + "/?" + queryString;
			}
		}else
		{
			homeUrl = defaultUrl;
		}
		try{
			if(!isWhiteListDomain()){
				parent.testOrigin = true;
			}
			if(autoRedirect)
				window.location.href = homeUrl;
		}catch(e){
			window.open(defaultUrl + "?utm_source=gameloft&utm_medium=bookmark&utm_campaign=IFRAME","_top","",true);
			return defaultUrl + "?utm_source=gameloft&utm_medium=bookmark&utm_campaign=IFRAME";
		}	
		return homeUrl;
	}
	function getReferrer(){
		if(window.game_frame){
			getReferrerCustom(true);
		}else{
			return getReferrerCustom(false);
		}
	}
}