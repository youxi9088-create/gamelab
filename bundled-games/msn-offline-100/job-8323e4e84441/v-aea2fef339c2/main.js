(function () {

    'use strict';
	var load_bg = document.getElementById('load_bg');
	var splash = document.getElementById('splash');
	var truck = document.getElementById('truck');
	load_bg.style.width = (100 - (10 + truck.clientWidth/splash.clientWidth*90).toFixed(2)) + '%';
	load_bg.style.left = (10 + truck.clientWidth/splash.clientWidth*90).toFixed(2) + '%';
	window.loadingPercent = 0;
	window.updateLoading = function(){
		truck.style.left = (10 + loadingPercent*((80 - truck.clientWidth/splash.clientWidth*100)/100)).toFixed(2) + '%';
		var l = (10 + loadingPercent*((80 - truck.clientWidth/splash.clientWidth*100)/100) + truck.clientWidth/splash.clientWidth*90).toFixed(2);
		load_bg.style.width = (100 - l) + "%";
		load_bg.style.left = l + '%';
	}
    function boot () {

        var settings = window._CCSettings;
        window._CCSettings = undefined;

        if ( !settings.debug ) {
            var uuids = settings.uuids;

            var rawAssets = settings.rawAssets;
            var assetTypes = settings.assetTypes;
            var realRawAssets = settings.rawAssets = {};
            for (var mount in rawAssets) {
                var entries = rawAssets[mount];
                var realEntries = realRawAssets[mount] = {};
                for (var id in entries) {
                    var entry = entries[id];
                    var type = entry[1];
                    // retrieve minified raw asset
                    if (typeof type === 'number') {
                        entry[1] = assetTypes[type];
                    }
                    // retrieve uuid
                    realEntries[uuids[id] || id] = entry;
                }
            }

            var scenes = settings.scenes;
            for (var i = 0; i < scenes.length; ++i) {
                var scene = scenes[i];
                if (typeof scene.uuid === 'number') {
                    scene.uuid = uuids[scene.uuid];
                }
            }

            var packedAssets = settings.packedAssets;
            for (var packId in packedAssets) {
                var packedIds = packedAssets[packId];
                for (var j = 0; j < packedIds.length; ++j) {
                    if (typeof packedIds[j] === 'number') {
                        packedIds[j] = uuids[packedIds[j]];
                    }
                }
            }
        }

        // init engine
        var canvas;
		var progress = 0;
		var skipLaunchScene = 0;
		var usePreload = !true;
		var preloadSound = 1;
        if (cc.sys.isBrowser) {
            canvas = document.getElementById('GameCanvas');
        }
		
        function setLoadingDisplay () {
            // Loading splash scene
            //var splash = document.getElementById('splash');
            //var progressBar = splash.querySelector('.progress-bar span');
			//var truck = document.getElementById('truck');
			//var load_bg = document.getElementById('load_bg');
            cc.loader.onProgress = function (completedCount, totalCount, item) {
				if(usePreload)
				{
					var percent = 100 * completedCount / totalCount / (settings.scenes.length + preloadSound) + (progress - skipLaunchScene + preloadSound)/ (settings.scenes.length + preloadSound) * 100;
					if (truck) {
						//console.log(percent);
						if(totalCount > 1){
							//progressBar.style.width = percent.toFixed(2) + '%';
							loadingPercent = percent;
							updateLoading();
							//truck.style.left = (10 + percent.toFixed(2)*((80 - truck.clientWidth/splash.clientWidth*100)/100)).toString() + '%';
							//load_bg.style.left = (10 + percent.toFixed(2)*((80 - truck.clientWidth/splash.clientWidth*100)/100) + truck.clientWidth/splash.clientWidth*90).toString() + '%';
						}
					}
				}
				else
				{
					var percent = 100 * completedCount / totalCount;
					if (truck) {
						//progressBar.style.width = percent.toFixed(2) + '%';
						loadingPercent = percent;
						updateLoading();
						//truck.style.left = (10 + percent.toFixed(2)*((80 - truck.clientWidth/splash.clientWidth*100)/100)).toString() + '%';
						//load_bg.style.left = (10 + percent.toFixed(2)*((80 - truck.clientWidth/splash.clientWidth*100)/100) + truck.clientWidth/splash.clientWidth*90).toString() + '%';
					}
				}
            };
            splash.style.display = 'block';
            //progressBar.style.width = '0%';

            cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
				splash.style.backgroundImage  = 'none';
                splash.style.display = 'none';
            });
        }
		function preload(){
			if(settings.scenes[progress].url == settings.launchScene)
			{
				progress ++;
				skipLaunchScene = 1;
			}
			cc.director.preloadScene(settings.scenes[progress].url, function () {
						console.log('loaded scene: ' + settings.scenes[progress].url);
						progress ++;
						if(progress == settings.scenes.length)
						{
							cc.director.loadScene(settings.launchScene, null,
								function () {
									if (cc.sys.isBrowser) {
										// show canvas
										canvas.style.visibility = '';
										var div = document.getElementById('GameDiv');
										if (div) {
											div.style.backgroundImage = '';
										}
									}
									cc.loader.onProgress = null;
								}
							);
						}else
						{
							preload();
						}
					}
				);
            
		}
        var onStart = function () {
            cc.view.resizeWithBrowserSize(true);

            if (true) {
                // UC browser on many android devices have performance issue with retina display
                if (cc.sys.os !== cc.sys.OS_ANDROID || cc.sys.browserType !== cc.sys.BROWSER_TYPE_UC) {
                    cc.view.enableRetina(true);
                }
                if (cc.sys.isBrowser) {
                    setLoadingDisplay();
                }

                if (cc.sys.isMobile) {
                    if (settings.orientation === 'landscape') {
                        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
                    }
                    else if (settings.orientation === 'portrait') {
                        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
                    }
                    // qq, wechat, baidu
                    cc.view.enableAutoFullScreen(
                        cc.sys.browserType !== cc.sys.BROWSER_TYPE_BAIDU &&
                        cc.sys.browserType !== cc.sys.BROWSER_TYPE_WECHAT &&
                        cc.sys.browserType !== cc.sys.BROWSER_TYPE_MOBILE_QQ
                    );
                }
                
                // Limit downloading max concurrent task to 2,
                // more tasks simultaneously may cause performance draw back on some android system / brwosers.
                // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
                if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
                    cc.macro.DOWNLOAD_MAX_CONCURRENT = 2;
                }
            }

            // init assets
            cc.AssetLibrary.init({
                libraryPath: 'res/import',
                rawAssetsBase: 'res/raw-',
                rawAssets: settings.rawAssets,
                packedAssets: settings.packedAssets,
                md5AssetsMap: settings.md5AssetsMap
            });

            
			
            // load scene
			if(usePreload)
			{
				if(preloadSound == 1)
				{
					cc.loader.loadResDir('sounds',function (completedCount, totalCount, item) {
						//console.log(completedCount + "=" + totalCount);
						//var splash = document.getElementById('splash');
						//var truck = document.getElementById('truck');
						//var load_bg = document.getElementById('load_bg');
						//var progressBar = splash.querySelector('.progress-bar span');
								var percent = 100 * completedCount / totalCount / (settings.scenes.length + preloadSound);
								if (truck) {
									//progressBar.style.width = percent.toFixed(2) + '%';
									loadingPercent = percent;
									updateLoading();
									//truck.style.left = (10 + percent.toFixed(2)*((80 - truck.clientWidth/splash.clientWidth*100)/100)).toString() + '%';
									//load_bg.style.left = (10 + percent.toFixed(2)*((80 - truck.clientWidth/splash.clientWidth*100)/100) + truck.clientWidth/splash.clientWidth*90).toString() + '%';
								}
						
					},null);
				}
				preload();
			}
			else
			{
				preloadSound = 0;
				var launchScene = settings.launchScene;
				cc.director.loadScene(launchScene, null,
					function () {
						if (cc.sys.isBrowser) {
							// show canvas
							canvas.style.visibility = '';
							var div = document.getElementById('GameDiv');
							if (div) {
								div.style.backgroundImage = '';
							}
						}
						cc.loader.onProgress = null;
						console.log('Success to load scene: ' + launchScene);
					}
				);
			}
            
        };

        // jsList
        var jsList = settings.jsList;
        var bundledScript = settings.debug ? 'src/project.dev.js' : 'src/project.js';
        if (jsList) {
            jsList = jsList.map(function (x) { return 'src/' + x; });
            jsList.push(bundledScript);
        }
        else {
            jsList = [bundledScript];
        }

        // anysdk scripts
        // Native-only service SDK retired from this browser build.


        var option = {
            //width: width,
            //height: height,
            id: 'GameCanvas',
            scenes: settings.scenes,
            debugMode: settings.debug ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
            showFPS: settings.debug,
            frameRate: 60,
            jsList: jsList,
            groupList: settings.groupList,
            collisionMatrix: settings.collisionMatrix,
            renderMode: 0
        };

        cc.game.run(option, onStart);
    }

    if (window.document) {
        var splash = document.getElementById('splash');
        splash.style.display = 'block';

        var cocos2d = document.createElement('script');
        cocos2d.async = true;
        cocos2d.src = window._CCSettings.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js';

        var engineLoaded = function () {
            document.body.removeChild(cocos2d);
            cocos2d.removeEventListener('load', engineLoaded, false);
            window.eruda && eruda.init() && eruda.get('console').config.set('displayUnenumerable', false);
            boot();
        };
        cocos2d.addEventListener('load', engineLoaded, false);
        document.body.appendChild(cocos2d);
    }

})();
