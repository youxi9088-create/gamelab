// constants.js
//@ts-nocheck
var Constants = pc.createScript('constants');

Constants.GROUP_BALL = pc.BODYGROUP_USER_1;
Constants.GROUP_GLASS = pc.BODYGROUP_USER_2;

Constants.GAME_VERSION = 'v1.0.0';

Constants.STAGES_PER_LEVEL_MIN = 5;
Constants.STAGES_PER_LEVEL_MAX = 7;

Constants.TWEENS_LIST = [
            { 'Linear': 'Linear' },
            { 'QuadraticIn': 'QuadraticIn' },
            { 'QuadraticOut': 'QuadraticOut' },
            { 'QuadraticInOut': 'QuadraticInOut' },
            { 'CubicIn': 'CubicIn' },
            { 'CubicOut': 'CubicOut' },
            { 'CubicInOut': 'CubicInOut' },
            { 'QuarticIn': 'QuarticIn' },
            { 'QuarticOut': 'QuarticOut' },
            { 'QuarticInOut': 'QuarticInOut' },
            { 'QuinticIn': 'QuinticIn' },
            { 'QuinticOut': 'QuinticOut' },
            { 'QuinticInOut': 'QuinticInOut' },
            { 'SineIn': 'SineIn' },
            { 'SineOut': 'SineOut' },
            { 'SineInOut': 'SineInOut' },
            { 'ExponentialIn': 'ExponentialIn' },
            { 'ExponentialOut': 'ExponentialOut' },
            { 'ExponentialInOut': 'ExponentialInOut' },
            { 'CircularIn': 'CircularIn' },
            { 'CircularOut': 'CircularOut' },
            { 'CircularInOut': 'CircularInOut' },
            { 'BackIn': 'BackIn' },
            { 'BackOut': 'BackOut' },
            { 'BackInOut': 'BackInOut' },
            { 'BounceIn': 'BounceIn' },
            { 'BounceOut': 'BounceOut' },
            { 'BounceInOut': 'BounceInOut' },
            { 'ElasticIn': 'ElasticIn' },
            { 'ElasticOut': 'ElasticOut' },
            { 'ElasticInOut': 'ElasticInOut' }
    ];

Constants.SKUType = {
    LITE_PACKAGE: 'lite_package',
    MEDIUM_PACKAGE: 'medium_package',
    PRO_PACKAGE: 'pro_package',
    PRO_PACKAGE_WITH_NO_ADS: 'pro_package_with_no_ads',
    NO_ADS_PACKAGE_DISCOUNTED: 'no_ads_package_discounted',
    NO_ADS_PACKAGE: 'no_ads_package'
};

Constants.prototype.initialize = function() {

};

// gameConfig.js
//@ts-nocheck
var GameConfig = pc.createScript('gameConfig');

GameConfig.attributes.add('gameVersion', {
    type: 'string',
    default: '2.35.0'
});

GameConfig.attributes.add('debugLog', {
    type: 'boolean',
    default: false
});

GameConfig.attributes.add('showMinistats', {
    type: 'boolean',
    default: false
});

GameConfig.attributes.add('drawMeshVertices', {
    type: 'boolean',
    default: false
});

GameConfig.attributes.add('physicsRenderMode', {
    type: 'number',
    enum: [
        { 'Disable': 0 },
        { 'Wireframe': 1 },
        { 'Bounding Boxes': 2 },
        { 'Wireframe + AABB': 3 },
        { 'Contact Points': 4 }
    ],
    default: 1
});

GameConfig.attributes.add('enableTint', {
    type: 'boolean',
    description: 'Enable tint effect for items on the level, making bottom of them darker',
    default: true
});

GameConfig.attributes.add('allowOverridingTimeStep', {
    type: 'boolean',
    description: 'Allow overriding the time step and max sub steps',
    default: false
});

GameConfig.attributes.add('fixedTimeStep', {
    type: 'number',
    default: 1 / 60,
    min: 0,
    max: 1,
    precision: 4
});

GameConfig.attributes.add('maxSubSteps', {
    type: 'number',
    default: 10,
    min: 1,
    max: 25,
    step: 1,
    precision: 0
});

GameConfig.attributes.add('useModernConvexHullPhysics', {
    type: 'boolean',
    default: true
});

GameConfig.attributes.add('convexHullShapeMargin', {
    type: 'number',
    default: 0.04
});

GameConfig.attributes.add('meshPhysicsScaleFactor', {
    type: 'number',
    default: 0.92
});

GameConfig.attributes.add('itemLinearDamping', {
    type: 'number',
    default: 0,
    min: 0,
    max: 1
});

GameConfig.attributes.add('itemAngularDamping', {
    type: 'number',
    default: 0,
    min: 0,
    max: 1
});

GameConfig.attributes.add('itemAngularVelocityLimit', {
    type: 'vec3',
    default: [10, 10, 10]
});

GameConfig.attributes.add('itemLowestYPositionThreshold', {
    type: 'number',
    description: 'object will be destroyed if its y-position will be below that value',
    default: -5,
    min: -10,
    max: 0
});


GameConfig.attributes.add('itemHighestYPositionThreshold', {
    type: 'number',
    description: 'object will be destroyed if its y-position will be above that value',
    default: 25,
    min: 0,
    max: 100
});


GameConfig.attributes.add('explosionRadius', {
    type: 'number',
    default: 3,
    min: 0.01,
    max: 25
});

GameConfig.attributes.add('explosionForce', {
    type: 'number',
    default: 10
});

GameConfig.attributes.add('explosionDampingFactor', {
    type: 'number',
    default: 1.5,
    min: 1,
    max: 3
});

GameConfig.attributes.add('bombExplosionTNTDetonationRadius', {
    type: 'number',
    default: 2.75,
});

GameConfig.attributes.add('bombExplosionTNTDetonationDelay', {
    type: 'vec2',
    default: [0.2, 0.35]
});

GameConfig.attributes.add('movingStandFriction', {
    type: 'number',
    default: 0.999,
    min: 0,
    max: 2000
});

GameConfig.attributes.add('movingStandRestitution', {
    type: 'number',
    default: 0.1,
    min: 0,
    max: 1
});

GameConfig.attributes.add('breakItemNumParticles', {
    type: 'number',
    array: true,
    description: 'how many particles will be created after destroying of a block, for low/medium/high quality',
    default: [4, 6, 8]
});

GameConfig.attributes.add('levelNameKeyword', {
    type: 'string',
    default: 'STAGE'
});

GameConfig.attributes.add('stageNameKeyword', {
    type: 'string',
    default: 'DONE'
});

GameConfig.attributes.add('scoresPerItem', {
    type: 'number',
    default: 1
});

GameConfig.attributes.add('defeatTimer', {
    type: 'number',
    default: 1.0,
    min: 0,
    max: 10
});

GameConfig.attributes.add('victoryTimer', {
    type: 'number',
    default: 0.5,
    min: 0,
    max: 3
});

GameConfig.attributes.add('powerupProgressPerItem', {
    type: 'number',
    default: 0.004
});

GameConfig.attributes.add('powerupProgressPerStage', {
    type: 'number',
    default: 0.03
});

GameConfig.attributes.add('bombsAmount', {
    type: 'number',
    default: 3
});

GameConfig.attributes.add('reviveBallsAmount', {
    type: 'number',
    default: 4
});

GameConfig.attributes.add('freePackageRewardType', {
    title: 'Free package reward type',
    type: 'string',
    enum: [
        {'regular': 'regular'},
        {'golden': 'golden'}
    ],
    default: 'golden'
});

GameConfig.attributes.add('showShopInsteadOfRevive', {
    title: 'Show shop instead of revive?',
    type: 'boolean',
    default: false,
    description: 'Show shop instead of revive when the player is out of balls'
});

GameConfig.attributes.add('shopDiscountDuration', {
    type: 'number',
    default: 3600,
    min: 1,
    precision: 0,
    description: 'Duration of the no-ads limited time discount offer in seconds'
});

GameConfig.attributes.add('shopDiscountRepeatHours', {
    type: 'number',
    default: 72,
    min: 0.01,
    precision: 2,
    description: 'How many hours between each no-ads discount offer cycle (default 72 = 3 days)'
});

GameConfig.prototype.initialize = function () {
    GameConfig.app = this.app;
    GameConfig.instance = this;

    if (this.showMinistats) {
        this.miniStats = new pc.MiniStats(this.app);
        this.app.root.children[0].script.fps.enabled = true;
    }

    this.on('attr:fixedTimeStep', this.onFixedTimeStepChanged, this);
    this.on('attr:maxSubSteps', this.onMaxSubStepsChanged, this);
    this.app.on(EventTypes.RESET_PHYSICS_CONFIGURATION, this.onResetPhysicsConfiguration, this);
};

GameConfig.prototype.onFixedTimeStepChanged = function (value) {
    this.app.systems.rigidbody.fixedTimeStep = value;
};

GameConfig.prototype.onMaxSubStepsChanged = function (value) {
    this.app.systems.rigidbody.maxSubSteps = value;
};

GameConfig.prototype.onResetPhysicsConfiguration = function () {
    this.app.systems.rigidbody.fixedTimeStep = GameConfig.getAttribute('fixedTimeStep');
    this.app.systems.rigidbody.maxSubSteps = GameConfig.getAttribute('maxSubSteps');
};

GameConfig.getAttribute = function (key) {
    if (GameConfig.instance[key] === undefined) {
        console.warn('GameConfig doesnt have attribute ' + key);
        return null;
    } else {
        return GameConfig.instance[key];
    }
};

// fps.js
if (typeof(document) !== "undefined") {
    /*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
    (function(m,j){function s(a,e){for(var g in e)try{a.style[g]=e[g]}catch(j){}return a}function H(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof a}function R(a,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(a);for(var g=0,j=e.length;g<j;g++)if(e[g]===a)return g;return-1}function I(){var a=arguments,e;for(e in a[1])if(a[1].hasOwnProperty(e))switch(H(a[1][e])){case "object":a[0][e]=
    I({},a[0][e],a[1][e]);break;case "array":a[0][e]=a[1][e].slice(0);break;default:a[0][e]=a[1][e]}return 2<a.length?I.apply(null,[a[0]].concat(Array.prototype.slice.call(a,2))):a[0]}function N(a){a=Math.round(255*a).toString(16);return 1===a.length?"0"+a:a}function S(a,e,g,j){if(a.addEventListener)a[j?"removeEventListener":"addEventListener"](e,g,!1);else if(a.attachEvent)a[j?"detachEvent":"attachEvent"]("on"+e,g)}function D(a,e){function g(a,b,d,c){return y[0|a][Math.round(Math.min((b-d)/(c-d)*J,J))]}
    function r(){f.legend.fps!==q&&(f.legend.fps=q,f.legend[T]=q?"FPS":"ms");K=q?b.fps:b.duration;f.count[T]=999<K?"999+":K.toFixed(99<K?0:d.decimals)}function m(){z=A();L<z-d.threshold&&(b.fps-=b.fps/Math.max(1,60*d.smoothing/d.interval),b.duration=1E3/b.fps);for(c=d.history;c--;)E[c]=0===c?b.fps:E[c-1],F[c]=0===c?b.duration:F[c-1];r();if(d.heat){if(w.length)for(c=w.length;c--;)w[c].el.style[h[w[c].name].heatOn]=q?g(h[w[c].name].heatmap,b.fps,0,d.maxFps):g(h[w[c].name].heatmap,b.duration,d.threshold,
    0);if(f.graph&&h.column.heatOn)for(c=u.length;c--;)u[c].style[h.column.heatOn]=q?g(h.column.heatmap,E[c],0,d.maxFps):g(h.column.heatmap,F[c],d.threshold,0)}if(f.graph)for(p=0;p<d.history;p++)u[p].style.height=(q?E[p]?Math.round(O/d.maxFps*Math.min(E[p],d.maxFps)):0:F[p]?Math.round(O/d.threshold*Math.min(F[p],d.threshold)):0)+"px"}function k(){20>d.interval?(x=M(k),m()):(x=setTimeout(k,d.interval),P=M(m))}function G(a){a=a||window.event;a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=
    !1,a.cancelBubble=!0);b.toggle()}function U(){d.toggleOn&&S(f.container,d.toggleOn,G,1);a.removeChild(f.container)}function V(){f.container&&U();h=D.theme[d.theme];y=h.compiledHeatmaps||[];if(!y.length&&h.heatmaps.length){for(p=0;p<h.heatmaps.length;p++){y[p]=[];for(c=0;c<=J;c++){var b=y[p],e=c,g;g=0.33/J*c;var j=h.heatmaps[p].saturation,m=h.heatmaps[p].lightness,n=void 0,k=void 0,l=void 0,t=l=void 0,v=n=k=void 0,v=void 0,l=0.5>=m?m*(1+j):m+j-m*j;0===l?g="#000":(t=2*m-l,k=(l-t)/l,g*=6,n=Math.floor(g),
    v=g-n,v*=l*k,0===n||6===n?(n=l,k=t+v,l=t):1===n?(n=l-v,k=l,l=t):2===n?(n=t,k=l,l=t+v):3===n?(n=t,k=l-v):4===n?(n=t+v,k=t):(n=l,k=t,l-=v),g="#"+N(n)+N(k)+N(l));b[e]=g}}h.compiledHeatmaps=y}f.container=s(document.createElement("div"),h.container);f.count=f.container.appendChild(s(document.createElement("div"),h.count));f.legend=f.container.appendChild(s(document.createElement("div"),h.legend));f.graph=d.graph?f.container.appendChild(s(document.createElement("div"),h.graph)):0;w.length=0;for(var q in f)f[q]&&
    h[q].heatOn&&w.push({name:q,el:f[q]});u.length=0;if(f.graph){f.graph.style.width=d.history*h.column.width+(d.history-1)*h.column.spacing+"px";for(c=0;c<d.history;c++)u[c]=f.graph.appendChild(s(document.createElement("div"),h.column)),u[c].style.position="absolute",u[c].style.bottom=0,u[c].style.right=c*h.column.width+c*h.column.spacing+"px",u[c].style.width=h.column.width+"px",u[c].style.height="0px"}s(f.container,d);r();a.appendChild(f.container);f.graph&&(O=f.graph.clientHeight);d.toggleOn&&("click"===
    d.toggleOn&&(f.container.style.cursor="pointer"),S(f.container,d.toggleOn,G))}"object"===H(a)&&a.nodeType===j&&(e=a,a=document.body);a||(a=document.body);var b=this,d=I({},D.defaults,e||{}),f={},u=[],h,y,J=100,w=[],W=0,B=d.threshold,Q=0,L=A()-B,z,E=[],F=[],x,P,q="fps"===d.show,O,K,c,p;b.options=d;b.fps=0;b.duration=0;b.isPaused=0;b.tickStart=function(){Q=A()};b.tick=function(){z=A();W=z-L;B+=(W-B)/d.smoothing;b.fps=1E3/B;b.duration=Q<L?B:z-Q;L=z};b.pause=function(){x&&(b.isPaused=1,clearTimeout(x),
    C(x),C(P),x=P=0);return b};b.resume=function(){x||(b.isPaused=0,k());return b};b.set=function(a,c){d[a]=c;q="fps"===d.show;-1!==R(a,X)&&V();-1!==R(a,Y)&&s(f.container,d);return b};b.showDuration=function(){b.set("show","ms");return b};b.showFps=function(){b.set("show","fps");return b};b.toggle=function(){b.set("show",q?"ms":"fps");return b};b.hide=function(){b.pause();f.container.style.display="none";return b};b.show=function(){b.resume();f.container.style.display="block";return b};b.destroy=function(){b.pause();
    U();b.tick=b.tickStart=function(){}};V();k()}var A,r=m.performance;A=r&&(r.now||r.webkitNow)?r[r.now?"now":"webkitNow"].bind(r):function(){return+new Date};for(var C=m.cancelAnimationFrame||m.cancelRequestAnimationFrame,M=m.requestAnimationFrame,r=["moz","webkit","o"],G=0,k=0,Z=r.length;k<Z&&!C;++k)M=(C=m[r[k]+"CancelAnimationFrame"]||m[r[k]+"CancelRequestAnimationFrame"])&&m[r[k]+"RequestAnimationFrame"];C||(M=function(a){var e=A(),g=Math.max(0,16-(e-G));G=e+g;return m.setTimeout(function(){a(e+
    g)},g)},C=function(a){clearTimeout(a)});var T="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I;window.FPSMeter=D;D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var X=["toggleOn","theme","heat","graph","history"],Y="position zIndex left top right bottom margin".split(" ")})(window);(function(m,j){j.theme={};var s=j.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",
    textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};j.theme.dark=j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}});j.theme.light=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.5}],
    container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}});j.theme.colorful=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}});j.theme.transparent=
    j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:0.5}})})(window,FPSMeter);    
}

var Fps = pc.createScript('fps');

Fps.prototype.initialize = function () {
    this.fps = new FPSMeter({heat: true, graph: true});
};

Fps.prototype.update = function (dt) {
    this.fps.tick();
};


// utils.js
//@ts-nocheck
/* jshint esversion: 6 */
var Utils = pc.createScript('utils');

Utils.prototype.initialize = function() {
    Utils.app = this.app;
    
    this.app.on(EventTypes.INJECT_CUSTOM_PHYSICS, this.injectMeshCollisionSystem, this);
    // this.injectMeshCollisionSystem();
};

Utils.prototype.update = function(dt) {
    
};


Utils.prototype.injectMeshCollisionSystem = function() { 
    if(this.customPhysicsInjected) {
        return;
    }
    console.log("Injecting advanced mesh physics ....");    
    this.customPhysicsInjected = true;

    if(GameConfig.getAttribute('useModernConvexHullPhysics')) {
        this._injectModernConvexHullPhysics();
        return;
    };
    
    this.app.systems.collision.implementations.mesh.createPhysicalShape = function(entity, data) {       
        const tempGraphNode = new pc.GraphNode();

          if(entity.rigidbody && entity.rigidbody.type === pc.BODYTYPE_DYNAMIC) {
              
                if (typeof Ammo !== 'undefined' && (data.model || data.render)) {
                    
                    var shape = new Ammo.btConvexHullShape();
                    var i, j;

                    var addPointIfUnique = function(array, a, b, c) {
                        for(var up = 0; up < array.length; up++) {
                            if(array[up][0] === a && array[up][1] === b && array[up][2] === c) {
                                return;
                            }
                        }
                        array.push([a, b, c]);
                    };

                    const meshesArray = data.model ? data.model.meshInstances.map(mi => mi.mesh) : data.render.meshes;
                    for (i = 0; i < meshesArray.length; i++) {
                        var mesh = meshesArray[i];
                        var ib = mesh.indexBuffer[pc.RENDERSTYLE_SOLID];
                        var vb = mesh.vertexBuffer;
                        var uniquePoints = [];

                        var format = vb.getFormat();
                        var stride = format.size / 4;
                        var positions;
                        for (j = 0; j < format.elements.length; j++) {
                            var element = format.elements[j];
                            if (element.name === pc.SEMANTIC_POSITION) {
                                positions = new Float32Array(vb.lock(), element.offset);
                            }
                        }

                        var indices = new Uint16Array(ib.lock());
                        var numTriangles = mesh.primitive[0].count / 3;
                        var i1, i2, i3;

                        var base = mesh.primitive[0].base;
                        for (j = 0; j < numTriangles; j++) {
                            i1 = indices[base + j * 3] * stride;
                            i2 = indices[base + j * 3 + 1] * stride;
                            i3 = indices[base + j * 3 + 2] * stride;

                            addPointIfUnique(uniquePoints, positions[i1], positions[i1 + 1], positions[i1 + 2]);
                            addPointIfUnique(uniquePoints, positions[i2], positions[i2 + 1], positions[i2 + 2]);
                            addPointIfUnique(uniquePoints, positions[i3], positions[i3 + 1], positions[i3 + 2]);
                        }

                        var ammoVec = new Ammo.btVector3();
                        for(var u = 0; u < uniquePoints.length; u++) {
                            var point = uniquePoints[u];
                            ammoVec.setValue(point[0], point[1], point[2]);
                            shape.addPoint(ammoVec, true);
                        }
                        Ammo.destroy(ammoVec);

                        if(GameConfig.getAttribute('drawMeshVertices')) {
                            console.group(entity.name + ' has ' + uniquePoints.length + ' vertices:');
                            uniquePoints.forEach(point => {
                                var vertex1 = pc.app.root.findByName("ObjectsPrefabs").findByName("VertexModel").clone();
                                vertex1.setLocalPosition(point[0], point[1], point[2]);
                                entity.addChild(vertex1);
                            });
                            console.groupEnd();
                        }           
                    }

                    var entityTransform = entity.getWorldTransform();
                    var scale = entityTransform.getScale();
                    var vec = new Ammo.btVector3();
                    vec.setValue(scale.x * (GameConfig.getAttribute('meshPhysicsScaleFactor') || 1), scale.y * (GameConfig.getAttribute('meshPhysicsScaleFactor') || 1), scale.z * (GameConfig.getAttribute('meshPhysicsScaleFactor') || 1));
                    shape.setLocalScaling(vec);
                    Ammo.destroy(vec);


                    return shape;
                }
                return undefined;
            } else {
               
                if (typeof Ammo === 'undefined') return undefined;
                if (data.model || data.render) {
                    var shape = new Ammo.btCompoundShape();
                    if (data.model) {
                        var meshInstances = data.model.meshInstances;
                        for (var i = 0; i < meshInstances.length; i++) {
                            this.createAmmoMesh(meshInstances[i].mesh, meshInstances[i].node, shape);
                        }
                    } else if (data.render) {
                        var meshes = data.render.meshes;
                        for (var _i2 = 0; _i2 < meshes.length; _i2++) {
                            this.createAmmoMesh(meshes[_i2], tempGraphNode, shape);
                        }
                    }
                    var entityTransform = entity.getWorldTransform();
                    var scale = entityTransform.getScale();
                    var vec = new Ammo.btVector3(scale.x, scale.y, scale.z);
                    shape.setLocalScaling(vec);
                    Ammo.destroy(vec);
                    return shape;
                }
                return undefined;
            }
     };
    
    this.app.systems.collision.implementations.mesh.remove = function(entity, data) {
           if (data.shape && data.shape.getNumChildShapes) {
                var numShapes = data.shape.getNumChildShapes();
                for (var i = 0; i < numShapes; i++) {
                    var shape = data.shape.getChildShape(i);
                    Ammo.destroy(shape);
                }
            }
        
            var app = this.system.app;
            if (entity.rigidbody && entity.rigidbody.body) {
                app.systems.rigidbody.removeBody(entity.rigidbody.body);
                entity.rigidbody.disableSimulation();
            }

            if (data.shape)
                Ammo.destroy(data.shape);

            if (entity.trigger) {
                entity.trigger.destroy();
                delete entity.trigger;
            }

            if (app.scene.containsModel(data.model)) {
                app.root.removeChild(data.model.graph);
                app.scene.removeModel(data.model);
            }
    };

    
    this.app.systems.collision.implementations.mesh.destroyShape = function (data) {
        if (!data.shape)
            return;

        if (data.shape.getNumChildShapes) {
            const numShapes = data.shape.getNumChildShapes();
            for (let i = 0; i < numShapes; i++) {
                const shape = data.shape.getChildShape(i);
                Ammo.destroy(shape);
            }
        }

        Ammo.destroy(data.shape);
        data.shape = null;
    };
};

/**
 * Injects modern convex hull physics utilities into the mesh collision implementations.
 * The main difference from the original playcanvas implementation is following: it compines all renders' meshes into a single convex hull shape. Playcanvas implementation creates a convex hull shape for each render.
 */
Utils.prototype._injectModernConvexHullPhysics = function() {
    /** Provides access to the convex hull shape margin, as read from GameConfig. */
    const convexHullShapeMargin = {
        get value() {
            return GameConfig.getAttribute('convexHullShapeMargin') || 0.04;
        }
    };

    this.app.systems.collision.implementations.mesh.__proto__._addHullPoints = function(mesh, hull, scale, vertexCache) {
        const point = new Ammo.btVector3();
        const positions = [];
        const marginCompensationFactor = 1 - 2 * convexHullShapeMargin.value;

        mesh.getPositions(positions);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i] * scale.x * marginCompensationFactor;
            const y = positions[i + 1] * scale.y * marginCompensationFactor;
            const z = positions[i + 2] * scale.z * marginCompensationFactor;

            if (vertexCache) {
                const key = `${x}:${y}:${z}`;
                if (vertexCache.has(key)) continue;
                vertexCache.add(key);
            }

            point.setValue(x, y, z);

            // No need to calculate the aabb here. We'll do it after all points are added.
            hull.addPoint(point, false);
        }

        Ammo.destroy(point);
    };

    /**
     * Creates an Ammo.js convex hull shape from a mesh and adds it as a child shape to the provided compound shape.
     */
    this.app.systems.collision.implementations.mesh.__proto__.createAmmoHull = function (mesh, node, shape, scale, checkDupes = true) {
        const hull = new Ammo.btConvexHullShape();
        const vertexCache = checkDupes ? new Set() : null;

        this._addHullPoints(mesh, hull, scale, vertexCache);

        hull.setMargin(convexHullShapeMargin.value);   // Note: default margin is 0.04
        hull.recalcLocalAabb();

        const transform = this.system._getNodeTransform(node);
        shape.addChildShape(transform, hull);
        Ammo.destroy(transform);
    };

    const tempGraphNode = new pc.GraphNode();

    /**
     * Creates a physical Ammo.js collision shape for the given entity and mesh/model data.
     * Supports both convex hull and regular mesh colliders.
     */
    this.app.systems.collision.implementations.mesh.__proto__.createPhysicalShape = function (entity, data) {
        if (typeof Ammo === 'undefined') return undefined;

        if (data.model || data.render) {

            const shape = new Ammo.btCompoundShape();
            const entityTransform = entity.getWorldTransform();
            const scale = entityTransform.getScale();

            if (data.render) {
                const meshes = data.render.meshes;
                if (data.convexHull) {
                    const hull = new Ammo.btConvexHullShape();
                    const vertexCache = new Set();
                    for (let i = 0; i < meshes.length; i++) {
                        this._addHullPoints(meshes[i], hull, scale, vertexCache);
                    }
                    hull.setMargin(convexHullShapeMargin.value);   // Note: default margin is 0.04
                    hull.recalcLocalAabb();
                    const transform = this.system._getNodeTransform(tempGraphNode);
                    shape.addChildShape(transform, hull);
                    Ammo.destroy(transform);
                } else {
                    for (let i = 0; i < meshes.length; i++) {
                        this.createAmmoMesh(meshes[i], tempGraphNode, shape, scale, data.checkVertexDuplicates);
                    }
                }
            } else if (data.model) {
                const meshInstances = data.model.meshInstances;
                for (let i = 0; i < meshInstances.length; i++) {
                    this.createAmmoMesh(meshInstances[i].mesh, meshInstances[i].node, shape, null, data.checkVertexDuplicates);
                }
                const vec = new Ammo.btVector3(scale.x, scale.y, scale.z);
                shape.setLocalScaling(vec);
                Ammo.destroy(vec);
            }

            return shape;
        }

        return undefined;
    };
};

pc.Entity.prototype.delayedCall = function (durationMS, f, scope) {
    var n = 0;
    while(this["delayedExecuteTween" + n]) {
        n++;
    }
    var id = "delayedExecuteTween" + n;
    var m;
    this[id] = this.tween(m)
        .to(1, durationMS / 1000, pc.Linear)
    ;
    this[id].start();
    
    this[id].once("complete", function() {
        f.call(scope);
        this[id] = null;
    }, this);
    
    return this[id];
};

Utils.raycastAll = function(from, to, results) {
    results = results || [];
    lastResult = this.app.systems.rigidbody.raycastFirst(from, to);
    if (lastResult) {
        if(lastResult.entity){  
            // this prevents rays from bouncing off the same entities
            // in a loop causing ammojs to crash
            for(var i = 0; i < results.length; i++){
                if(results[i] === lastResult.entity){
                    return results;
                }
            }
           results.push(lastResult.entity);
           Utils.raycastAll(lastResult.point.sub(lastResult.normal.scale(0.01)), to, results);
        }
    }
    return results;
};

/**
 *  Raycast through multiple entities returning RaycastResult instances (entity, point, normal) instead of entities. 
 **/
Utils.raycastAllAdvanced = function(from, to, results) {
    results = results || [];
    lastResult = this.app.systems.rigidbody.raycastFirst(from, to);
    if (lastResult) {
        if(lastResult.entity){  
            // this prevents rays from bouncing off the same entities
            // in a loop causing ammojs to crash
            for(var i = 0; i < results.length; i++){
                if(results[i].entity === lastResult.entity){
                    return results;
                }
            }
           results.push(lastResult);
           Utils.raycastAllAdvanced(lastResult.point.sub(lastResult.normal.scale(0.01)), to, results);
        }
    }
    return results;
};

pc.Entity.prototype.childrenAlphaAppear = function(initialAlpha, duration, sine, delay) {
    for(var i = this.children.length - 1; i > -1; i--) {
        var child = this.children[i];
        if(child instanceof pc.Entity) {
           child.childrenAlphaAppear(initialAlpha, duration, sine, delay);
        }
        if(child.element) {
            var targetAlpha = child.element.opacity;
            child.element.opacity = initialAlpha;
            child.tween(child.element)
                .to({opacity: targetAlpha}, duration, sine)
                .delay(delay)
                .start();
        }
    }
};

pc.GraphicsDevice.prototype.updateClientRect = function() {    
    if(window.visualViewport) {
        this.clientRect = this.canvas.getBoundingClientRect();
        this.clientRect.x = window.visualViewport.offsetLeft;
        this.clientRect.y = window.visualViewport.offsetTop;
        this.clientRect.width = window.visualViewport.width;        
        this.clientRect.height = window.visualViewport.height;
    } else {
        this.clientRect = this.canvas.getBoundingClientRect();
    }    
};

Utils.lerpColor = function(colorA, colorB, progress, targetColor) {
    return targetColor.set(colorA.r + (colorB.r - colorA.r) * progress, colorA.g + (colorB.g - colorA.g) * progress, colorA.b + (colorB.b - colorA.b) * progress, 1);
};

Utils.distanceBetween = function(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

Utils.checkContact = function(entityA, entityB) {
    var pos1 = entityA.getPosition();
    var pos2 = entityB.getPosition();
    return Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.z - pos2.z) * (pos1.z - pos2.z)) <=  (entityA.script.item.collisionDiameter * entityA.collisionScale / 2 + entityB.script.item.collisionDiameter * entityB.collisionScale / 2) && 
        Math.abs(pos1.y - pos2.y) <= (entityA.script.item.collisionHeight * entityA.collisionScale / 2 + entityB.script.item.collisionHeight * entityB.collisionScale / 2);
};


Utils.checkContactRough = function(entityA, entityB) {
    var scaleFactor = 1.1;
    var pos1 = entityA.getPosition();
    var pos2 = entityB.getPosition();
    return Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.z - pos2.z) * (pos1.z - pos2.z)) <=  (entityA.script.item.collisionDiameter * entityA.collisionScale * scaleFactor / 2 + entityB.script.item.collisionDiameter * entityB.collisionScale * scaleFactor / 2) && 
        Math.abs(pos1.y - pos2.y) <= (entityA.script.item.collisionHeight * entityA.collisionScale * scaleFactor / 2 + entityB.script.item.collisionHeight * entityB.collisionScale * scaleFactor / 2);
};

Utils.contactTestInternal = function(entityA, entityB, callback) {
  
    var resultCallback = new Ammo.ConcreteContactResultCallback();
        resultCallback.addSingleResult = function(
            manifoldPoint,
            collisionObjectA,
            id0,
            index0,
            collisionObjectB,
            id1,
            index1
        ) {
            if(callback) {
                callback(entityA, entityB);
            }
        };
    
    Utils.app.systems.rigidbody.dynamicsWorld.contactPairTest(entityA.rigidbody.body, entityB.rigidbody.body, resultCallback);
};

Utils.distanceXZ = function(pos1, pos2) {
    return Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.z - pos2.z) * (pos1.z - pos2.z));
};

Utils.distanceBetweenEntities = function(posA, posB) {
    return Math.sqrt((posA.x - posB.x) * (posA.x - posB.x) + (posA.y - posB.y) * (posA.y - posB.y) + (posA.z - posB.z) * (posA.z - posB.z));
};

Utils.tweenText = function(textElement, initialValue, targetValue, duration, delay, easing, playCountingSound) {
      textElement.element.textValue = initialValue;
      textElement.element.text = '' + Math.round(initialValue);  
      textElement.tween(textElement.element)
            .to({textValue: targetValue}, duration, easing)
            .delay(delay)
            .onUpdate(function() {textElement.element.text = '' + Math.round(textElement.element.textValue);})
            .start();
};

Utils.tweenTextWithPrefix = function(textElement, prefix, initialValue, targetValue, duration, delay, easing, playCountingSound) {
    textElement.element.textValue = initialValue;
    textElement.element.text = prefix + Math.round(initialValue);  
    textElement.tween(textElement.element)
          .to({textValue: targetValue}, duration, easing)
          .delay(delay)
          .onUpdate(function() {textElement.element.text = prefix + Math.round(textElement.element.textValue);})
          .start();
};

Utils.getRandomItem = function (objects, startIndex, length) {

        if (objects === null) { return null; }
        if (startIndex === undefined) { startIndex = 0; }
        if (length === undefined) { length = objects.length; }

        var randomIndex = startIndex + Math.floor(Math.random() * length);

        return objects[randomIndex] === undefined ? null : objects[randomIndex];

};

Utils.removeRandomItem = function (objects, startIndex, length) {

    if (objects === null) { // undefined or null
        return null;
    }

    if (startIndex === undefined) { startIndex = 0; }
    if (length === undefined) { length = objects.length; }

    var randomIndex = startIndex + Math.floor(Math.random() * length);
    if (randomIndex < objects.length)
    {
        var removed = objects.splice(randomIndex, 1);
        return removed[0] === undefined ? null : removed[0];
    }
    else
    {
        return null;
    }

};

Utils.shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;  
};

Utils.humanizeTime = function(seconds) {
    var restSeconds = seconds;
    var hours = Math.floor(restSeconds / 3600);
    restSeconds %= 3600;
    var minutes = Math.floor(restSeconds / 60);
    restSeconds %= 60;

    return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (restSeconds < 10 ? "0" : "") + Math.floor(restSeconds);  
};

Utils.randomInRangeSigned = function(a,b) {
    if(Math.random() <= 0.5) {
        return pc.math.random(Math.min(-a, -b), Math.max(-a, -b));
    } else {
         return pc.math.random(Math.min(a, b), Math.max(a, b)) ;
    }   
};

Utils.vibrate = function(pattern) {
    if(GameplayController.enableVibration && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern); 
    }
};

Utils.wait = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

Utils.log = function(...args) {
    if(GameConfig.getAttribute('debugLog')) {
        console.log(...args);
    } else {
        console.log(...args);
    }
};

Utils.warn = function(...args) {
    if(GameConfig.getAttribute('debugLog')) {
        console.warn(...args);
    } else {
        console.log('[WARN]', ...args);
    }
};

Utils.error = function(...args) {
    if(GameConfig.getAttribute('debugLog')) {
        console.error(...args);
    } else {
        console.log('[ERROR]', ...args);
    }
};

Utils.showAlert = function(message, icon = 'info') {
    if(typeof Swal !== 'undefined') {
        Swal.fire({
            position: "top-end",
            icon: icon || 'info',
            title: message,
            showConfirmButton: false,
            backdrop: 'none',
            timer: 1500
          });
    } else {
        console.error(message);
    }
};
Utils.worldToLocalPosition = function (entity, worldPosition) {
    if (!entity.parent) {
        console.warn('worldToLocalPosition: entity is not parented!');
        return pc.Vec3.ZERO;
    }
    this._transformMatrix = this._transformMatrix || new pc.Mat4();
    this._transformMatrix.copy(entity.parent.getWorldTransform());
    return this._transformMatrix.invert().transformPoint(worldPosition)
};

Utils.localToWorldPosition = function (entity, localPosition) {
    this._transformMatrix = this._transformMatrix || new pc.Mat4();
    this._transformMatrix.copy(entity.getWorldTransform());
    return this._transformMatrix.transformPoint(localPosition)
};


Utils.worldToLocalEulerAngles = function(entity, targetEulerAngles) {
    const initialLocalAngles = entity.getLocalEulerAngles().clone();
    entity.setEulerAngles(targetEulerAngles);    
    const targetLocalAngles = entity.getLocalEulerAngles().clone();
    entity.setLocalEulerAngles(initialLocalAngles);
    return targetLocalAngles;
};


Utils.tweenOpacity = function(entity, opacity, duration, ease = pc.Linear, delay = 0, ignoreTimeScale = false) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.element)
            .to({opacity: opacity}, duration, ease)
            .delay(delay)
            .setIgnoreTimeScale(ignoreTimeScale)
            .onComplete(() => resolve())
            .start();
    });
};

Utils.tweenPosition = function(entity, localPosition, duration, ease = pc.Linear, delay = 0, ignoreTimeScale = false) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.getLocalPosition())
            .to(localPosition, duration, ease)
            .delay(delay)
            .setIgnoreTimeScale(ignoreTimeScale)
            .onComplete(() => resolve())
            .start();
    });
};

Utils.tweenScale = function(entity, localScale, duration, ease = pc.Linear, delay = 0, ignoreTimeScale = false) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.getLocalScale())
            .to(localScale, duration, ease)
            .delay(delay)
            .setIgnoreTimeScale(ignoreTimeScale)
            .onComplete(() => resolve())
            .start();
    });
};

Utils.tweenAngles = function(entity, localAngles, duration, ease = pc.Linear, delay = 0, ignoreTimeScale = false) {
    return new Promise((resolve, reject) => {
        entity.tween(entity.getLocalEulerAngles())
            .rotate(localAngles, duration, ease)
            .delay(delay)
            .setIgnoreTimeScale(ignoreTimeScale)
            .onComplete(() => resolve())
            .start();
    });
};

Utils.setSpriteElement = function (elementImage, spriteAsset) {
    const app = pc.AppBase.getApplication();
    if(!spriteAsset) {
        console.warn('can not instantiate sprite for ' + elementImage.path);
    }
    const atlasFrameKey = spriteAsset.data.frameKeys[0];
    const textureAtlas = app.assets.get(spriteAsset.data.textureAtlasAsset);
    const rect = textureAtlas.resource.frames[atlasFrameKey].rect;
    elementImage.element.spriteAsset = spriteAsset.id;
    elementImage.element.width = rect.z;
    elementImage.element.height = rect.w;
};

// transitionScreen.js
//@ts-nocheck
var TransitionScreen = pc.createScript('transitionScreen');

TransitionScreen.prototype.initialize = function () {
    const scriptingContext = this;

    TransitionScreen.app = this.app;
    TransitionScreen.instance = this.entity;

    this.entity.transitionTo = function (callback, callbackContext, completeCallback, completeCallbackContext) {

        this.element.opacity = 0;
        this.element.useInput = true;
        this.tween(this.element)
            .to({ opacity: 1.0 }, 0.25, pc.SineOut)
            .onComplete(() => {

                if (callback) {
                    if (callbackContext) {
                        callback.apply(callbackContext);
                    } else {
                        callback();
                    }
                }

                this.element.opacity = 1.0;
                this.tween(this.element)
                    .to({ opacity: 0.0 }, 0.4, pc.SineIn)
                    .onComplete( () => {
                        if (completeCallback) {
                            if (completeCallbackContext) {
                                completeCallback.apply(completeCallbackContext);
                            } else {
                                completeCallback();
                            }
                        }
                        this.element.useInput = false;
                    })
                    .start();

            })
            .setIgnoreTimeScale(true)
            .start();


    }.bind(this.entity);


    this.entity.hidePreloader = function (callback, callbackContext) {
        scriptingContext.app.fire(EventTypes.PRELOADER_FINISHED);
    }.bind(this.entity);

    /* Initial opacity, while preloader is visible */
    this.entity.element.opacity = 0;
};

TransitionScreen.prototype.update = function (dt) {

};

// soundController.js
//@ts-nocheck
/* jshint esversion: 6 */
var SoundController = pc.createScript('soundController');

SoundController.attributes.add('soundStorage', {
    title: "Sound storage entity",
    type: 'entity'
});

SoundController.attributes.add('preloadSfx', {
    title: "Preload SFX",
    type: 'boolean',
    default: false
});

SoundController.attributes.add('sfxPreloadDelay', {
    title: "SFX preload delay (ms)",
    type: 'number',
    default: 0
});

SoundController.attributes.add('sfxPreloadConcurrency', {
    title: "SFX max simultaneous loads (0 = unlimited)",
    type: 'number',
    min: 0,
    max: 20,
    step: 1,
    precision: 0,
    default: 0
});

SoundController.attributes.add('preloadMusic', {
    title: "Preload music",
    type: 'boolean',
    default: false
});

SoundController.attributes.add('autoPlayMelodyKey', {
    title: "Auto play melody key",
    type: 'string',
    default: ''
});


SoundController.attributes.add('musicAssets', {
    title: "Music assets",
    type: 'json',
    schema: [{
        name: 'key',
        type: 'string',
        default: ''
    },
    {
        name: 'asset',
        type: 'asset',
        assetType: 'audio'
    },
    {
        name: 'overlap',
        type: 'boolean',
        default: false
    },
    {
        name: 'volume',
        type: 'number',
        default: 1.0
    },
    {
        name: 'pitch',
        type: 'number',
        default: 1.0
    },
    {
        name: 'loop',
        type: 'boolean',
        default: true
    }],
    array: true
});

SoundController.attributes.add('soundAssets', {
    title: "Sound assets",
    type: 'json',
    schema: [{
        name: 'key',
        type: 'string',
        default: ''
    },
    {
        name: 'asset',
        type: 'asset',
        assetType: 'audio'
    },
    {
        name: 'overlap',
        type: 'boolean',
        default: false
    },
    {
        name: 'volume',
        type: 'number',
        default: 1.0
    },
    {
        name: 'pitch',
        type: 'number',
        default: 1.0
    },
    {
        name: 'autoPlay',
        type: 'boolean',
        default: false
    },
    {
        name: 'loop',
        type: 'boolean',
        default: false
    }],
    array: true
});

SoundController.attributes.add('soundSeries', {
    title: "Sound series",
    type: 'json',
    schema: [{
        name: 'key',
        type: 'string',
        default: ''
    },
    {
        name: 'startPitch',
        type: 'number',
        default: 1.0
    },
    {
        name: 'endPitch',
        type: 'number',
        default: 1.5
    },
    {
        name: 'steps',
        type: 'number',
        default: 10,
        min: 2,
        max: 25
    }, {
        name: 'timeout',
        type: 'number',
        default: 1000
    }],
    array: true
});


SoundController.sfxStateLoaded = false;
SoundController.sfxVolume = 0.5;
SoundController.musicStateLoaded = false;
SoundController.musicVolume = 0.5;

Object.defineProperty(SoundController, "musicEnabled", {
    get() {
        return SoundController.musicVolume > 0;
    },
    set(value) {
        if (!value) {
            SoundController._prevMusicVolume = SoundController.musicVolume;
            SoundController.musicVolume = 0;
        } else {
            SoundController.musicVolume = SoundController._prevMusicVolume || 0.5;
        }
        pc.AppBase.getApplication().fire(EventTypes.SET_MUSIC_VOLUME, SoundController.musicVolume);
    }
});


Object.defineProperty(SoundController, "sfxEnabled", {
    get() {
        return SoundController.sfxVolume > 0;
    },
    set(value) {
        if (!value) {
            SoundController._prevSFXVolume = SoundController.sfxVolume;
            SoundController.sfxVolume = 0;
        } else {
            SoundController.sfxVolume = SoundController._prevSFXVolume || 0.5;
        }
        pc.AppBase.getApplication().fire(EventTypes.SET_SFX_VOLUME, SoundController.sfxVolume);
    }
});

SoundController.masterVolume = 1.0;
SoundController.apiVolumeMultiplier = 1.0;

SoundController.prototype.initialize = function () {
    /* music assets */
    this.musicSlotKeys = new Set();
    this.sfxSlotKeys = new Set();


    /* events handlung */
    this.app.on(EventTypes.PLAY_SFX, this.playSfx, this);
    this.app.on(EventTypes.PLAY_EXTERNAL_SFX, this.playExternalSfx, this);
    this.app.on(EventTypes.STOP_SFX, this.stopSfx, this);

    this.app.on(EventTypes.MUTE_SOUND, this.muteSound, this);
    this.app.on(EventTypes.UNMUTE_SOUND, this.unmuteSound, this);
    this.app.on(EventTypes.ENABLE_SFX, this.enableSfx, this);
    this.app.on(EventTypes.DISABLE_SFX, this.disableSfx, this);
    this.app.on(EventTypes.ENABLE_MUSIC, this.enableMusic, this);
    this.app.on(EventTypes.DISABLE_MUSIC, this.disableMusic, this);
    this.app.on(EventTypes.CHOKE_MUSIC, this.chokeMusic, this);
    this.app.on(EventTypes.UNCHOKE_MUSIC, this.unchokeMusic, this);
    this.app.on(EventTypes.SET_MUSIC_VOLUME, this.setMusicVolume, this);
    this.app.on(EventTypes.SET_SFX_VOLUME, this.setSFXVolume, this);
    this.app.on(EventTypes.APP_LOADED, this.onAppLoaded, this);



    /** ios suspended context fix */
    this._applyIOSAudioContextFix();

    /* fetch and apply master volume */
    this.setMasterVolume(1.0);
    

    /* API Events */
    

    const savedSFXVolume = LocalStorageController._loadedSfxVolume;
    if (savedSFXVolume != undefined) {
        SoundController.sfxStateLoaded = true;
        this.setSFXVolume(savedSFXVolume);
    } else {
        SoundController.sfxStateLoaded = true;
        this.setSFXVolume(0.5);
    }

    const savedMusicVolume = LocalStorageController._loadedMusicVolume;
    if (savedMusicVolume != undefined) {
        SoundController.musicStateLoaded = true;
        this.setMusicVolume(savedMusicVolume);
    } else {
        SoundController.musicStateLoaded = true;
        this.setMusicVolume(0.5);
    }

    /* init sound series params */
    this.soundSeriesMap = new Map();
    this.soundSeries.forEach(soundConfig => {
        const keys = soundConfig.key.split(',');
        keys.forEach(key => this.soundSeriesMap.set(key, soundConfig));
    });

    this.fireSoundStateChangedEvent();
    this.fireMusicStateChangedEvent();
};

SoundController.prototype.update = function (dt) {

};

SoundController.prototype._applyIOSAudioContextFix = function () {
    if (pc.platform.ios) {
        this.app.touch.on(pc.EVENT_TOUCHEND, () => {
            if (this.app.soundManager.context.state === 'interrupted' || this.app.soundManager.context.state === 'suspended') {
                this.app.soundManager.context.resume().then(() => {
                    console.log('[iOS audio] Audio context restored')
                }).catch(e => {
                    console.log('[iOS audio] Can not resume audio context')
                });
            }
        });
    }
}

SoundController.prototype._loadSlot = function (slot) {
    return new Promise((resolve, reject) => {
        if (slot.isLoaded) {
            resolve();
            return;
        }
        slot.once('load', resolve);
        slot.once('error', (err) => {
            console.error('[SoundController] Failed to load slot:', err);
            reject(err);
        });
        slot.load();
    });
};

SoundController.prototype.playSfx = async function (key, debounceDelay, volumeMultiplier) {
    if (Array.isArray(key)) key = Utils.getRandomItem(key);

    if (!this._audioInitialized) {
        console.log('audio not initialized, skipping sfx: ' + key);
        return;
    }

    const slot = this.soundStorage.sound.slot(key);
    if (!slot) {
        console.error('no sound slot found for key: ' + key);
        return;
    }

    if (!slot.isLoaded) {
        try {
            await this._loadSlot(slot);
        } catch (err) {
            return;
        }
    }

    const currentTimestamp = new Date().getTime();

    if (debounceDelay) {
        if (slot.lastTimeStamp && currentTimestamp - slot.lastTimeStamp < debounceDelay) {
            return;
        }
    }

    if (this.soundSeriesMap.has(key)) {
        const seriesConfig = this.soundSeriesMap.get(key);
        const seriesIndex = seriesConfig._lastSeriesIndex || 0;
        const lastSeriesTimestamp = seriesConfig.lastTimeStamp || 0;
        if (currentTimestamp - lastSeriesTimestamp <= seriesConfig.timeout) {
            slot.pitch = pc.math.clamp(seriesConfig.startPitch + seriesIndex * (seriesConfig.endPitch - seriesConfig.startPitch) / (seriesConfig.steps - 1), seriesConfig.startPitch, seriesConfig.endPitch);
            seriesConfig._lastSeriesIndex += 1;
        } else {
            slot.pitch = seriesConfig.startPitch;
            seriesConfig._lastSeriesIndex = 0;
        }
        seriesConfig.lastTimeStamp = currentTimestamp;
    }

    slot.lastTimeStamp = currentTimestamp;
    const calculatedVolume = (typeof volumeMultiplier === 'number') ? (slot._initialVolume * volumeMultiplier) : slot._initialVolume;
    slot.volume = calculatedVolume * SoundController.sfxVolume;

    this.soundStorage.sound.play(key);
};

SoundController.prototype.playMusic = async function (key) {
    if (!this._audioInitialized) {
        console.log('audio not initialized, skipping music: ' + key);
        return;
    }

    const slot = this.soundStorage.sound.slot(key);
    if (!slot) {
        console.error('no music slot found for key: ' + key);
        return;
    }

    if (!slot.isLoaded) {
        try {
            await this._loadSlot(slot);
        } catch (err) {
            return;
        }
    }

    this.soundStorage.sound.play(key);
};


SoundController.prototype.playExternalSfx = function (key, targetEntity, debounceDelay) {
    if (!targetEntity || !targetEntity.sound || !targetEntity.sound.slot(key)) {
        return;
    }

    if (SoundController.sfxEnabled) {
        targetEntity.sound.play(key);
    }
};

SoundController.prototype.stopSfx = function (key) {
    this.soundStorage.sound.stop(key);
};

SoundController.prototype.muteSound = function (key) {
    this.soundStorage.sound.slot(key)._initialVolume = 0;
    this.soundStorage.sound.slot(key).volume = 0;
};

SoundController.prototype.unmuteSound = function (key, volume) {
    this.soundStorage.sound.slot(key)._initialVolume = volume;
    this.soundStorage.sound.slot(key).volume = volume;
};

SoundController.prototype.enableSfx = function (saveApp = true) {
    SoundController.sfxEnabled = true;
};

SoundController.prototype.disableSfx = function (saveApp = true) {
    SoundController.sfxEnabled = false;
};



SoundController.prototype.enableMusic = function (saveApp = true) {
    SoundController.musicEnabled = true;
};

SoundController.prototype.disableMusic = function (saveApp = true) {
    SoundController.musicEnabled = false;
};

SoundController.prototype.chokeMusic = function () {
    this.musicSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.musicVolume * 0.2;
    });
};

SoundController.prototype.unchokeMusic = function () {
    this.musicSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.musicVolume * 1.0;
    });
};


SoundController.prototype.fireSoundStateChangedEvent = function () {
    this.app.fire(EventTypes.SOUND_STATE_CHANGED, SoundController.sfxEnabled, SoundController.sfxVolume);
    
};

SoundController.prototype.fireMusicStateChangedEvent = function () {
    this.app.fire(EventTypes.MUSIC_STATE_CHANGED, SoundController.musicEnabled, SoundController.musicVolume);
    
};

SoundController.prototype.setMusicVolume = function (volume) {
    SoundController.musicVolume = volume;
    this.musicSlotKeys.forEach(key => {
        const slot = this.soundStorage.sound.slot(key);
        if (slot) slot.volume = slot._initialVolume * SoundController.musicVolume;
    });
    this.fireMusicStateChangedEvent();
    this.app.fire(EventTypes.SAVE_APP);
};

SoundController.prototype.setSFXVolume = function (volume) {
    SoundController.sfxVolume = volume;
    /* update volume of all playing slots */
    const playingSlots = this.sfxSlotKeys.forEach(slotKey => {
        const slot = this.soundStorage.sound.slot(slotKey);
        if (slot && slot.isPlaying) {
            slot.volume = slot._initialVolume * SoundController.sfxVolume;
        }
    });
    this.fireSoundStateChangedEvent();
    this.app.fire(EventTypes.SAVE_APP);
};



SoundController.prototype.onAppLoaded = function () {
    this.createSoundsSlots();
    this.createMusicSlots();
    this._audioInitialized = true;

    this.autoPlayMusic();
};



SoundController.prototype.createSoundsSlots = async function () {
    const slots = this.soundAssets.map(asset => {
        const slot = this.entity.sound.addSlot(asset.key, asset);
        slot._initialVolume = slot.volume;
        this.sfxSlotKeys.add(asset.key);
        return slot;
    });

    this.setSFXVolume(SoundController.sfxVolume);

    if (!this.preloadSfx) return;

    const unloaded = slots.filter(slot => !slot.isLoaded);
    if (!unloaded.length) return;

    if (this.sfxPreloadDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.sfxPreloadDelay));
    }

    const concurrency = this.sfxPreloadConcurrency > 0 ? this.sfxPreloadConcurrency : unloaded.length;
    let index = 0;

    const runNext = async () => {
        while (index < unloaded.length) {
            const slot = unloaded[index++];
            try {
                await this._loadSlot(slot);
            } catch (err) {
                // error already logged in _loadSlot; continue with remaining slots
            }
        }
    };

    const workers = Array.from({ length: concurrency }, runNext);
    await Promise.all(workers);
};

SoundController.prototype.createMusicSlots = async function () {
    for (const asset of this.musicAssets) {
        const slot = this.entity.sound.addSlot(asset.key, asset);
        slot._initialVolume = slot.volume;
        this.musicSlotKeys.add(asset.key);

        if (this.preloadMusic) {
            try {
                await this._loadSlot(slot);
            } catch (err) {
                continue;
            }
        }
    }

    this.setMusicVolume(SoundController.musicVolume);
};

SoundController.prototype.autoPlayMusic = function () {
    if (this.autoPlayMelodyKey) {
        this.playMusic(this.autoPlayMelodyKey);
    }
};

/* volume control */

SoundController.prototype.updateVolume = function () {
    this.app.systems.sound.volume = SoundController.masterVolume * SoundController.apiVolumeMultiplier;
};

SoundController.prototype.setMasterVolume = function (volume) {
    SoundController.masterVolume = volume;
    this.updateVolume();
};

SoundController.prototype.setVolumeMultiplier = function (volume) {
    SoundController.apiVolumeMultiplier = volume;
    this.updateVolume();
};


// tween.js
pc.extend(pc, function () {

    /**
     * @name pc.TweenManager
     * @description Handles updating tweens
     * @param {pc.AppBase} app - The AppBase instance.
     */
    var TweenManager = function (app) {
        this._app = app;
        this._tweens = [];
        this._add = []; // to be added
    };

    TweenManager.prototype = {
        add: function (tween) {
            this._add.push(tween);
            return tween;
        },

        update: function (dt) {
            var i = 0;
            var n = this._tweens.length;
            while (i < n) {
                if (this._tweens[i].update(dt)) {
                    i++;
                } else {
                    this._tweens.splice(i, 1);
                    n--;
                }
            }

            // add any tweens that were added mid-update
            if (this._add.length) {
                for (let i = 0; i < this._add.length; i++) {
                    if (this._tweens.indexOf(this._add[i]) > -1) continue;
                    this._tweens.push(this._add[i]);
                }
                this._add.length = 0;
            }
        }
    };

    /**
     * @name  pc.Tween
     * @param {object} target - The target property that will be tweened
     * @param {pc.TweenManager} manager - The tween manager
     * @param {pc.Entity} entity - The pc.Entity whose property we are tweening
     */
    var Tween = function (target, manager, entity) {
        pc.events.attach(this);

        this.manager = manager;

        if (entity) {
            this.entity = null; // if present the tween will dirty the transforms after modify the target
        }

        this.time = 0;

        this.complete = false;
        this.playing = false;
        this.stopped = true;
        this.pending = false;

        this.target = target;

        this.ignoreTimeScale = false;

        this.duration = 0;
        this._currentDelay = 0;
        this.timeScale = 1;
        this._reverse = false;

        this._delay = 0;
        this._yoyo = false;

        this._count = 0;
        this._numRepeats = 0;
        this._repeatDelay = 0;

        this._from = false; // indicates a "from" tween

        // for rotation tween
        this._slerp = false; // indicates a rotation tween
        this._fromQuat = new pc.Quat();
        this._toQuat = new pc.Quat();
        this._quat = new pc.Quat();

        this.easing = pc.Linear;

        this._sv = {}; // start values
        this._ev = {}; // end values
    };

    var _parseProperties = function (properties) {
        var _properties;
        if (properties instanceof pc.Vec2) {
            _properties = {
                x: properties.x,
                y: properties.y
            };
        } else if (properties instanceof pc.Vec3) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z
            };
        } else if (properties instanceof pc.Vec4) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Quat) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Color) {
            _properties = {
                r: properties.r,
                g: properties.g,
                b: properties.b
            };
            if (properties.a !== undefined) {
                _properties.a = properties.a;
            }
        } else {
            _properties = properties;
        }
        return _properties;
    };
    Tween.prototype = {
        
        setIgnoreTimeScale: function (value) {
            this.ignoreTimeScale = value;
            return this;
        },

        // properties - js obj of values to update in target
        to: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            return this;
        },

        from: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._from = true;

            return this;
        },

        rotate: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);

            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._slerp = true;

            return this;
        },

        start: function () {
            var prop, _x, _y, _z;

            this.playing = true;
            this.complete = false;
            this.stopped = false;
            this._count = 0;
            this.pending = (this._delay > 0);

            if (this._reverse && !this.pending) {
                this.time = this.duration;
            } else {
                this.time = 0;
            }

            if (this._from) {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this._properties[prop];
                        this._ev[prop] = this.target[prop];
                    }
                }

                if (this._slerp) {
                    this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._fromQuat.setFromEulerAngles(_x, _y, _z);
                }
            } else {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this.target[prop];
                        this._ev[prop] = this._properties[prop];
                    }
                }

                if (this._slerp) {
                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;

                    if (this._properties.w !== undefined) {
                        this._fromQuat.copy(this.target);
                        this._toQuat.set(_x, _y, _z, this._properties.w);
                    } else {
                        this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);
                        this._toQuat.setFromEulerAngles(_x, _y, _z);
                    }
                }
            }

            // set delay
            this._currentDelay = this._delay;

            // add to manager when started
            this.manager.add(this);

            this.fire("start");

            return this;
        },

        pause: function () {
            this.playing = false;
        },

        resume: function () {
            this.playing = true;
        },

        stop: function () {
            this.playing = false;
            this.stopped = true;
        },

        delay: function (delay) {
            this._delay = delay;
            this.pending = true;

            return this;
        },

        repeat: function (num, delay) {
            this._count = 0;
            this._numRepeats = num;
            if (delay) {
                this._repeatDelay = delay;
            } else {
                this._repeatDelay = 0;
            }

            return this;
        },

        loop: function (loop) {
            if (loop) {
                this._count = 0;
                this._numRepeats = Infinity;
            } else {
                this._numRepeats = 0;
            }

            return this;
        },

        yoyo: function (yoyo) {
            this._yoyo = yoyo;
            return this;
        },

        reverse: function () {
            this._reverse = !this._reverse;

            return this;
        },

        chain: function () {
            var n = arguments.length;

            while (n--) {
                if (n > 0) {
                    arguments[n - 1]._chained = arguments[n];
                } else {
                    this._chained = arguments[n];
                }
            }

            return this;
        },

        onStart: function (callback) {
            this.on('start', callback);
            return this;
        },

        onUpdate: function (callback) {
            this.on('update', callback);
            return this;
        },

        onComplete: function (callback) {
            this.on('complete', callback);
            return this;
        },

        onLoop: function (callback) {
            this.on('loop', callback);
            return this;
        },

        update: function (dt) {
            if (this.stopped) return false;

            if (!this.playing) return true;
            
            const realDt = this.ignoreTimeScale ? (this.manager._app.timeScale > 0 ? dt / this.manager._app.timeScale : (Math.min(1 / 60, this.manager._app.stats.frame.ms / 1000))) : dt;

            if (!this._reverse || this.pending) {
                this.time += realDt * this.timeScale;
            } else {
                this.time -= realDt * this.timeScale;
            }

            // delay start if required
            if (this.pending) {
                if (this.time > this._currentDelay) {
                    if (this._reverse) {
                        this.time = this.duration - (this.time - this._currentDelay);
                    } else {
                        this.time -= this._currentDelay;
                    }
                    this.pending = false;
                } else {
                    return true;
                }
            }

            var _extra = 0;
            if ((!this._reverse && this.time > this.duration) || (this._reverse && this.time < 0)) {
                this._count++;
                this.complete = true;
                this.playing = false;
                if (this._reverse) {
                    _extra = this.duration - this.time;
                    this.time = 0;
                } else {
                    _extra = this.time - this.duration;
                    this.time = this.duration;
                }
            }

            var elapsed = (this.duration === 0) ? 1 : (this.time / this.duration);

            // run easing
            var a = this.easing(elapsed);

            // increment property
            var s, e;
            for (var prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    s = this._sv[prop];
                    e = this._ev[prop];
                    this.target[prop] = s + (e - s) * a;
                }
            }

            if (this._slerp) {
                this._quat.slerp(this._fromQuat, this._toQuat, a);
            }

            // if this is a entity property then we should dirty the transform
            if (this.entity) {
                this.entity._dirtifyLocal();

                // apply element property changes
                if (this.element && this.entity.element) {
                    this.entity.element[this.element] = this.target;
                }

                if (this._slerp) {
                    this.entity.setLocalRotation(this._quat);
                }
            }

            this.fire("update", dt);

            if (this.complete) {
                var repeat = this._repeat(_extra);
                if (!repeat) {
                    this.fire("complete", _extra);
                    if (this.entity)
                        this.entity.off('destroy', this.stop, this);
                    if (this._chained) this._chained.start();
                } else {
                    this.fire("loop");
                }

                return repeat;
            }

            return true;
        },

        _repeat: function (extra) {
            // test for repeat conditions
            if (this._count < this._numRepeats) {
                // do a repeat
                if (this._reverse) {
                    this.time = this.duration - extra;
                } else {
                    this.time = extra; // include overspill time
                }
                this.complete = false;
                this.playing = true;

                this._currentDelay = this._repeatDelay;
                this.pending = true;

                if (this._yoyo) {
                    // swap start/end properties
                    for (var prop in this._properties) {
                        var tmp = this._sv[prop];
                        this._sv[prop] = this._ev[prop];
                        this._ev[prop] = tmp;
                    }

                    if (this._slerp) {
                        this._quat.copy(this._fromQuat);
                        this._fromQuat.copy(this._toQuat);
                        this._toQuat.copy(this._quat);
                    }
                }

                return true;
            }
            return false;
        }

    };


    /**
     * Easing methods
     */

    var Linear = function (k) {
        return k;
    };

    var QuadraticIn = function (k) {
        return k * k;
    };

    var QuadraticOut = function (k) {
        return k * (2 - k);
    };

    var QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };

    var CubicIn = function (k) {
        return k * k * k;
    };

    var CubicOut = function (k) {
        return --k * k * k + 1;
    };

    var CubicInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k;
        return 0.5 * ((k -= 2) * k * k + 2);
    };

    var QuarticIn = function (k) {
        return k * k * k * k;
    };

    var QuarticOut = function (k) {
        return 1 - (--k * k * k * k);
    };

    var QuarticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k;
        return -0.5 * ((k -= 2) * k * k * k - 2);
    };

    var QuinticIn = function (k) {
        return k * k * k * k * k;
    };

    var QuinticOut = function (k) {
        return --k * k * k * k * k + 1;
    };

    var QuinticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    };

    var SineIn = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos(k * Math.PI / 2);
    };

    var SineOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin(k * Math.PI / 2);
    };

    var SineInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };

    var ExponentialIn = function (k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    };

    var ExponentialOut = function (k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    };

    var ExponentialInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    };

    var CircularIn = function (k) {
        return 1 - Math.sqrt(1 - k * k);
    };

    var CircularOut = function (k) {
        return Math.sqrt(1 - (--k * k));
    };

    var CircularInOut = function (k) {
        if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    };

    var ElasticIn = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    };

    var ElasticOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
    };

    var ElasticInOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    };

    var BackIn = function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    };

    var BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    };

    var BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    };

    var BounceOut = function (k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        } else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        } else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;

    };

    var BounceIn = function (k) {
        return 1 - BounceOut(1 - k);
    };

    var BounceInOut = function (k) {
        if (k < 0.5) return BounceIn(k * 2) * 0.5;
        return BounceOut(k * 2 - 1) * 0.5 + 0.5;
    };

    return {
        TweenManager: TweenManager,
        Tween: Tween,
        Linear: Linear,
        QuadraticIn: QuadraticIn,
        QuadraticOut: QuadraticOut,
        QuadraticInOut: QuadraticInOut,
        CubicIn: CubicIn,
        CubicOut: CubicOut,
        CubicInOut: CubicInOut,
        QuarticIn: QuarticIn,
        QuarticOut: QuarticOut,
        QuarticInOut: QuarticInOut,
        QuinticIn: QuinticIn,
        QuinticOut: QuinticOut,
        QuinticInOut: QuinticInOut,
        SineIn: SineIn,
        SineOut: SineOut,
        SineInOut: SineInOut,
        ExponentialIn: ExponentialIn,
        ExponentialOut: ExponentialOut,
        ExponentialInOut: ExponentialInOut,
        CircularIn: CircularIn,
        CircularOut: CircularOut,
        CircularInOut: CircularInOut,
        BackIn: BackIn,
        BackOut: BackOut,
        BackInOut: BackInOut,
        BounceIn: BounceIn,
        BounceOut: BounceOut,
        BounceInOut: BounceInOut,
        ElasticIn: ElasticIn,
        ElasticOut: ElasticOut,
        ElasticInOut: ElasticInOut
    };
}());

// Expose prototype methods and create a default tween manager on the AppBase
(function () {
    // Add pc.AppBase#addTweenManager method
    pc.AppBase.prototype.addTweenManager = function () {
        this._tweenManager = new pc.TweenManager(this);

        this.on("update", function (dt) {
            this._tweenManager.update(dt);
        });
    };

    pc.AppBase.prototype.stopAllTweens = function (target) {
        for (var i = this._tweenManager._tweens.length - 1; i > -1; i--) {
            if (this._tweenManager._tweens[i].entity === target) {
                this._tweenManager._tweens[i].stop();
            }
        }
    };

    // Add pc.AppBase#tween method
    pc.AppBase.prototype.tween = function (target) {
        return new pc.Tween(target, this._tweenManager);
    };

    // Add pc.Entity#tween method
    pc.Entity.prototype.tween = function (target, options) {
        var tween = this._app.tween(target);
        tween.entity = this;

        this.once('destroy', tween.stop, tween);

        if (options && options.element) {
            // specifiy a element property to be updated
            tween.element = options.element;
        }
        return tween;
    };

    // Create a default tween manager on the AppBase
    var AppBase = pc.AppBase.getApplication();
    if (AppBase) {
        AppBase.addTweenManager();
    }
})();   

// cannon.js
//@ts-nocheck
/* jshint esversion: 6 */
var Cannon = pc.createScript('cannon');

const tweensList = [
    { 'Linear': 'Linear' },
    { 'QuadraticIn': 'QuadraticIn' },
    { 'QuadraticOut': 'QuadraticOut' },
    { 'QuadraticInOut': 'QuadraticInOut' },
    { 'CubicIn': 'CubicIn' },
    { 'CubicOut': 'CubicOut' },
    { 'CubicInOut': 'CubicInOut' },
    { 'QuarticIn': 'QuarticIn' },
    { 'QuarticOut': 'QuarticOut' },
    { 'QuarticInOut': 'QuarticInOut' },
    { 'QuinticIn': 'QuinticIn' },
    { 'QuinticOut': 'QuinticOut' },
    { 'QuinticInOut': 'QuinticInOut' },
    { 'SineIn': 'SineIn' },
    { 'SineOut': 'SineOut' },
    { 'SineInOut': 'SineInOut' },
    { 'ExponentialIn': 'ExponentialIn' },
    { 'ExponentialOut': 'ExponentialOut' },
    { 'ExponentialInOut': 'ExponentialInOut' },
    { 'CircularIn': 'CircularIn' },
    { 'CircularOut': 'CircularOut' },
    { 'CircularInOut': 'CircularInOut' },
    { 'BackIn': 'BackIn' },
    { 'BackOut': 'BackOut' },
    { 'BackInOut': 'BackInOut' },
    { 'BounceIn': 'BounceIn' },
    { 'BounceOut': 'BounceOut' },
    { 'BounceInOut': 'BounceInOut' },
    { 'ElasticIn': 'ElasticIn' },
    { 'ElasticOut': 'ElasticOut' },
    { 'ElasticInOut': 'ElasticInOut' }
];

Cannon.attributes.add('ballSpeed', {
    title: "Ball speed",
    type: 'number',
    default: 40,
    min: 1,
    max: 120
});

Cannon.attributes.add('pitchMin', {
    title: "Pitch min (X)",
    type: 'number',
    default: -60,
    min: -89,
    max: 89
});

Cannon.attributes.add('pitchMax', {
    title: "Pitch max (X)",
    type: 'number',
    default: 45,
    min: -89,
    max: 89
});

Cannon.attributes.add('yawMin', {
    title: "Yaw min (Y)",
    type: 'number',
    default: -90,
    min: -180,
    max: 180
});

Cannon.attributes.add('yawMax', {
    title: "Yaw max (Y)",
    type: 'number',
    default: 90,
    min: -180,
    max: 180
});

Cannon.attributes.add('reboundTween', {
    title: "Rebound tween",
    type: 'string',
    default: 'Linear',
    enum: tweensList
});


Cannon.attributes.add('reboundTweenDuration', {
    title: "Rebound duration",
    type: 'number',
    default: 0.1
});

Cannon.attributes.add('returnTween', {
    title: "Return tween",
    type: 'string',
    default: 'Linear',
    enum: tweensList
});


Cannon.attributes.add('returnTweenDuration', {
    title: "Return duration",
    type: 'number',
    default: 0.15
});

Cannon.attributes.add('mainCamera', {
    type: 'entity'
});

Cannon.attributes.add('shootingPoint', {
    type: 'entity'
});

Cannon.attributes.add('regularBallTemplate', {
    type: 'asset',
    assetType: 'template'
});

Cannon.attributes.add('premiumBallTemplate', {
    type: 'asset',
    assetType: 'template'
});

Cannon.attributes.add('bombTemplate', {
    type: 'asset',
    assetType: 'template'
});


Cannon.prototype.initialize = function () {
    this.mortair = this.entity.findByName('Mortair');
    this.skipTargettingEntityNames = ['Cannon', 'CannonBall'];
    this.denyTargettingEntityNames = ['CannonBallDecoration', 'BallsBoxWall', 'BallsBoxTriggerVolume'];
    this.shootingPoint = this.app.root.findByName("ShootingPoint");
    this.ballsContainer = this.app.root.findByName("BallsContainer");

    this.app.on(EventTypes.INPUT_DOWN, this.handleInputDown, this);
    this.app.on(EventTypes.STAGE_LOADED, this.enableShooting, this);
    this.app.on(EventTypes.REVIVE_EARNED, this.enableShooting, this);
    this.app.on(EventTypes.PREMIUM_PACKAGE_PURCHASED, this.enableShooting, this);
    this.app.on(EventTypes.POWERUP_ACTIVATED, this.onPowerupActivated, this);
    this.app.on(EventTypes.POWERUP_DEACTIVATED, this.onPowerupDeactivated, this);
    this.app.on(EventTypes.STAGE_LOADING_STARTED, this.disableShooting, this);
    this.app.on(EventTypes.OUT_OF_BALLS, this.disableShooting, this);
    this.app.on(EventTypes.LEVEL_RESET, this.reset, this);

    this.entity.enabled = false;
};

Cannon.prototype.reset = function () {
    while(this.ballsContainer.children.length > 0) {
        this.ballsContainer.children[0].destroy();
    }
};

Cannon.prototype.update = function (dt) {
    if (PauseManager.getInstance().isPaused()) {
        return;
    }

    const screenPosition = InputController.getInstance().getMousePosition();

    if (pc.platform.desktop && !pc.platform.touch && screenPosition) {
        const camera = this.mainCamera;
        var from = camera.camera.screenToWorld(screenPosition.x, screenPosition.y, camera.camera.nearClip);
        var to = camera.camera.screenToWorld(screenPosition.x, screenPosition.y, camera.camera.farClip);

        var raycastResults = Utils.raycastAllAdvanced(from, to).filter(result => this.skipTargettingEntityNames.indexOf(result.entity.name) === -1);
        var result = raycastResults.length > 0 ? raycastResults[0] : this.app.systems.rigidbody.raycastFirst(from, to);

        if (result && result.entity) {
            var targetPoint = result.point.clone();
            this.entity.setLocalEulerAngles(this.getCannonEulerAngles(this.shootingPoint.getPosition(), targetPoint));
        }
    }
};

Cannon.prototype.handleInputDown = function (x, y) {
    if (PauseManager.getInstance().isPaused()) {
        return;
    }

    const camera = this.mainCamera;
    var from = camera.camera.screenToWorld(x, y, camera.camera.nearClip);
    var to = camera.camera.screenToWorld(x, y, camera.camera.farClip);

    var raycastResults = Utils.raycastAllAdvanced(from, to).filter(result => this.skipTargettingEntityNames.indexOf(result.entity.name) === -1);
    var result = raycastResults.length > 0 ? raycastResults[0] : this.app.systems.rigidbody.raycastFirst(from, to);
    if (raycastResults.find(r => this.denyTargettingEntityNames.indexOf(r.entity.name) != -1)) {
        result = null;
    }

    if (result && result.entity) {
        var targetPoint = result.point.clone();
        this.entity.setLocalEulerAngles(this.getCannonEulerAngles(this.shootingPoint.getPosition(), targetPoint));
        this.shoot(targetPoint);
    }
};

Cannon.prototype.onPowerupActivated = function () {
    this.enableShooting();
    this.app.fire(EventTypes.PLAY_AUDIO, 'fire');
    this.app.fire('bombPowerup:startFireVFX');
};

Cannon.prototype.onPowerupDeactivated = function () {
    this.app.fire('bombPowerup:stopFireVFX');
};

Cannon.prototype.enableShooting = function () {
    this.shootingEnabled = true;
};

Cannon.prototype.disableShooting = function () {
    this.shootingEnabled = false;
};


Cannon.prototype.shoot = function (targetPoint) {
    if (!GameplayController.gameStarted || !this.shootingEnabled || WindowManager.hasOpenedWindows()) {
        return;
    }

    const bombsActive = BallsManager.getInstance().bombsActive();
    const useRegularBall = BallsManager.getInstance().getRegularBallsAmount() > 0;
    const shootingPointPosition = this.shootingPoint.getPosition();
    const ball = bombsActive ? this.bombTemplate.resource.instantiate() : useRegularBall ? this.regularBallTemplate.resource.instantiate() : this.premiumBallTemplate.resource.instantiate();
    ball.enabled = false;
    this.ballsContainer.addChild(ball);

    this.app.fire(bombsActive ? EventTypes.BOMB_SHOT : EventTypes.BALL_SHOT);
    this.app.fire(EventTypes.PLAY_AUDIO, bombsActive ? 'bombShoot' : 'cannonShoot');

    const impulse = this.getRequiredImpulse(shootingPointPosition, targetPoint);
    ball.setPosition(shootingPointPosition.x, shootingPointPosition.y, shootingPointPosition.z);
    ball.script.ball.shoot(impulse.impulse, bombsActive ? impulse.time : null);

    this.rebound();
};

Cannon.prototype.rebound = function () {
    if (this.mortairReboundTween && this.mortairReboundTween.playing) {
        this.mortairReboundTween.stop();
    }

    if (this.mortairReturnTween && this.mortairReturnTween.playing) {
        this.mortairReturnTween.stop();
    }

    this.mortairReboundTween = this.mortair.tween(this.mortair.getLocalPosition())
        .to(new pc.Vec3(0, 0, 0.8), this.reboundTweenDuration, pc[this.reboundTween]);

    this.mortairReturnTween = this.mortair.tween(this.mortair.getLocalPosition())
        .to(new pc.Vec3(0, 0, 0), this.returnTweenDuration, pc[this.returnTween]);

    this.mortairReboundTween.chain(this.mortairReturnTween).start();

    this.app.fire(EventTypes.REBOUND_CAMERA);
};

Cannon.prototype.getFiringSolution = function (initialPosition, targetPosition) {
    const speed = this.ballSpeed;
    const gravity = -this.app.systems.rigidbody.gravity.y;
    const dx = targetPosition.x - initialPosition.x;
    const dy = targetPosition.y - initialPosition.y;
    const dz = targetPosition.z - initialPosition.z;
    const x = Math.sqrt(dx * dx + dz * dz);
    const y = dy;
    let angleXZ = Math.atan2(dx, dz);

    const EPSILON = 1e-4;
    let pitch;

    if (x < EPSILON) {
        /* Target is (nearly) directly above/below the cannon - avoid divide-by-zero by shooting straight up or down,
        depending on vertical displacement */
        pitch = y >= 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
        const speedSq = speed * speed;
        let discriminant = speedSq * speedSq - gravity * (gravity * x * x + 2 * speedSq * y);

        /* Target is out of reach for this speed/elevation - clamp to 0 */
        if (discriminant < 0 || !isFinite(discriminant)) {
            discriminant = 0;
        }

        pitch = Math.atan((speedSq - Math.sqrt(discriminant)) / (gravity * x));
    }

    if (!isFinite(pitch)) pitch = 0;

    /* apply configurable rotation limits */
    const pitchMin = Math.min(this.pitchMin, this.pitchMax);
    const pitchMax = Math.max(this.pitchMin, this.pitchMax);
    const yawMin = Math.min(this.yawMin, this.yawMax);
    const yawMax = Math.max(this.yawMin, this.yawMax);

    pitch = pc.math.clamp(pitch, pitchMin * pc.math.DEG_TO_RAD, pitchMax * pc.math.DEG_TO_RAD);

    let yawDeg = (angleXZ + Math.PI) * pc.math.RAD_TO_DEG;
    if (yawDeg > 180) yawDeg -= 360;
    yawDeg = pc.math.clamp(yawDeg, yawMin, yawMax);
    angleXZ = yawDeg * pc.math.DEG_TO_RAD - Math.PI;

    const vy = speed * Math.sin(pitch);
    const vx = speed * Math.cos(pitch) * Math.sin(angleXZ);
    const vz = speed * Math.cos(pitch) * Math.cos(angleXZ);

    return { pitch, angleXZ, yawDeg, vx, vy, vz, displacementXZ: x };
};

Cannon.prototype.getCannonEulerAngles = function (initialPosition, targetPosition) {
    const { pitch, yawDeg } = this.getFiringSolution(initialPosition, targetPosition);
    return new pc.Vec3(pitch * pc.math.RAD_TO_DEG, yawDeg, 0);
};


Cannon.prototype.getRequiredImpulse = function (initialPosition, targetPosition) {
    const { vx, vy, vz, displacementXZ } = this.getFiringSolution(initialPosition, targetPosition);
    const horizontalSpeed = Math.sqrt(vx * vx + vz * vz);
    const time = horizontalSpeed > 1e-6 ? displacementXZ / horizontalSpeed : 0;

    return { impulse: new pc.Vec3(vx, vy, vz), time: time };
};

// inputController.js
//@ts-nocheck
/* jshint esversion: 6 */
var InputController = pc.createScript('inputController');

InputController.tapDistanceTolerance = 1;
InputController.clickDistanceTolerance = 1;
InputController.inputPosition = null;

InputController.attributes.add('listenToSwipes', {
    type: 'boolean',
    default: true
});

InputController.attributes.add('minSwipeDistance', {
    type: 'number',
    default: 75
});


InputController.getInstance = function () {
    if (!InputController._instance) console.error('InputController is not initialized yet');
    return InputController._instance;
};


InputController.prototype.initialize = function () {
    InputController._app = this.app;
    if (!InputController._instance) {
        InputController._instance = this;
    }

    this._mousePosition = new pc.Vec2();

    const mouseSupported = !!this.app.mouse;
    const touchSupported = !!this.app.touch;

    if (touchSupported) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);

        this.app.touch.on(pc.EVENT_TOUCHEND, function (event) {
            // This prevents that a mouse click event will be executed after a touch event.
            event.event.preventDefault();
        });
    }

    if (mouseSupported) {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }

    if (this.app.keyboard) {
        this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
    }

    if (this.app.mouse) {
        this.app.mouse.disableContextMenu();
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
    }

    this.on("destroy", this.destroy, this);
};

InputController.prototype.update = function (dt) {

};

InputController.prototype.postUpdate = function (dt) {
   
};

InputController.prototype.getMousePosition = function () {
    if(this._mousePosition) {
        return this._mousePosition;
    }
    return null;
};

InputController.prototype.onTouchStart = function (event) {
    if (event.touches.length >= 1) {
        this.touchDownPosition = { id: event.touches[0].id, x: event.touches[0].x, y: event.touches[0].y };
        InputController.inputPosition = { x: event.touches[0].x, y: event.touches[0].y, traveledDistance: 0 };
        this.app.fire(EventTypes.INPUT_DOWN, event.touches[0].x, event.touches[0].y, event.touches[0].x /  this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), event.touches[0].y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
    }
};

InputController.prototype.onTouchMove = function (event) {
    if (event.changedTouches && event.changedTouches[0]) {
        if (InputController.inputPosition) {
            InputController.inputPosition.traveledDistance += Utils.distanceBetween(InputController.inputPosition.x || 0, InputController.inputPosition.y || 0, event.changedTouches[0].x, event.changedTouches[0].y);
            InputController.inputPosition.x = event.changedTouches[0].x;
            InputController.inputPosition.y = event.changedTouches[0].y;
        } else {
            InputController.inputPosition = { x: event.changedTouches[0].x, y: event.changedTouches[0].y, traveledDistance: 0 };
        }

        if(this.touchDownPosition) {
            const touchDistance =  Utils.distanceBetween(this.touchDownPosition.x, this.touchDownPosition.y, event.changedTouches[0].x, event.changedTouches[0].y) * (window.devicePixelRatio || 1) * 1.25;
            if(this.listenToSwipes && touchDistance >= this.minSwipeDistance) {
                let dx = event.changedTouches[0].x - this.touchDownPosition.x;
                let dy =  event.changedTouches[0].y - this.touchDownPosition.y;

                if(Math.abs(dx) / Math.abs(dy || 1) > 1.8) {
                    this.app.fire((dx > 0) ? EventTypes.SWIPE_RIGHT : EventTypes.SWIPE_LEFT);
                    this.touchDownPosition = null;
                    InputController.inputPosition = null;
                } else if(Math.abs(dy) / Math.abs(dx || 1) > 1.8) {
                    this.app.fire((dy > 0) ? EventTypes.SWIPE_DOWN : EventTypes.SWIPE_UP);
                    this.touchDownPosition = null;
                    InputController.inputPosition = null;
                }
            }
        }

        this.app.fire(EventTypes.GameInput.TOUCH_MOVE, event.changedTouches[0].x, event.changedTouches[0].y);
        this.app.fire(EventTypes.INPUT_MOVE, event.changedTouches[0].x, event.changedTouches[0].y,  event.changedTouches[0].x / this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), event.changedTouches[0].y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
    }
};


InputController.prototype.onTouchEnd = function (event) {
    if (event.changedTouches.length >= 1) {
        if (this.touchDownPosition && InputController.inputPosition && InputController.inputPosition.traveledDistance < InputController.tapDistanceTolerance) {
            if (this.touchDownPosition.id === event.changedTouches[0].id) {
                this.handleTouch(event.changedTouches[0].x, event.changedTouches[0].y);
            }
        }
        this.app.fire(EventTypes.INPUT_UP, event.changedTouches[0].x, event.changedTouches[0].y, event.changedTouches[0].x /  this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), event.changedTouches[0].y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
    }
};


InputController.prototype.onTouchCancel = function (event) {
    this.touchDownPosition = null;
};


InputController.prototype.onKeyDown = function (event) {
    if (pc.platform.desktop) {
        switch (event.key) {
            case pc.KEY_A:
                //do something...
                break;
        }
    }
};


InputController.prototype.onMouseWheel = function (event) {
    event.event.preventDefault();
};


InputController.prototype.onMouseDown = function (event) {
    InputController.inputPosition = { x: event.x, y: event.y, traveledDistance: 0 };
    this.mouseDownPosition = { x: event.x, y: event.y };
    this.app.fire(EventTypes.INPUT_DOWN, event.x, event.y, event.x /  this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), event.y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
    this.app.fire(EventTypes.GameInput.MOUSE_DOWN, event.x, event.y);
};


InputController.prototype.onMouseUp = function (event) {
    this.app.fire(EventTypes.INPUT_UP, event.x, event.y, event.x /  this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), event.y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
    this.app.fire(EventTypes.GameInput.MOUSE_UP, event.x, event.y);

    if (InputController.inputPosition && InputController.inputPosition.traveledDistance < InputController.clickDistanceTolerance) {
        this.handleTouch(event.x, event.y);
    }

    this.mouseDownPosition = null;
    InputController.inputPosition = null;
};


InputController.prototype.onMouseMove = function (event) {
    this.lastMouseX = event.x;
    this.lastMouseY = event.y;
    this._mousePosition.x = event.x;
    this._mousePosition.y = event.y;
    if (InputController.inputPosition) {
        InputController.inputPosition.traveledDistance += Utils.distanceBetween(InputController.inputPosition.x || 0, InputController.inputPosition.y || 0, event.x, event.y);
        InputController.inputPosition.x = event.x;
        InputController.inputPosition.y = event.y;
        this.app.fire(EventTypes.GameInput.MOUSE_MOVE, event.x, event.y);
        this.app.fire(EventTypes.INPUT_MOVE, event.x, event.y, event.x /  this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), event.y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
    }

    if(this.mouseDownPosition) {
        const mouseDistance =  Utils.distanceBetween(this.mouseDownPosition.x, this.mouseDownPosition.y, event.x, event.y) * (window.devicePixelRatio || 1);

        if(this.listenToSwipes && mouseDistance >= this.minSwipeDistance) {
            let dx = event.x - this.mouseDownPosition.x;
            let dy = event.y - this.mouseDownPosition.y;

            if(Math.abs(dx) / Math.abs(dy || 1) > 1.8) {
                this.app.fire((dx > 0) ? EventTypes.SWIPE_RIGHT : EventTypes.SWIPE_LEFT);
                this.mouseDownPosition = null;
                InputController.inputPosition = null;
            } else if(Math.abs(dy) / Math.abs(dx || 1) > 1.8) {
                this.app.fire((dy > 0) ? EventTypes.SWIPE_DOWN : EventTypes.SWIPE_UP);
                this.mouseDownPosition = null;
                InputController.inputPosition = null;
            }
        }
    }
};


InputController.prototype.handleTouch = function (x, y) {
    this.app.fire(EventTypes.TAP_AT, x, y, x /  this.app.graphicsDevice.canvas.width * (window.devicePixelRatio || 1), y /  this.app.graphicsDevice.canvas.height* (window.devicePixelRatio || 1));
};


InputController.prototype.destroy = function () {
    this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
    this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
    this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    if (this.app.mouse) {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }
    if (this.app.keyboard) {
        this.app.keyboard.off(pc.EVENT_KEYDOWN, this.onKeyDown, this);
    }
};

// item.js
// @ts-nocheck
var Item = pc.createScript('item');

Item.TYPE_WOOD = 'wood';
Item.TYPE_METAL = 'metal';
Item.TYPE_GLASS = 'glass';
Item.TYPE_EXPLOSIVE = 'explosive';
Item.TYPE_CONCRETE = 'concrete';

Item.attributes.add('type', {
    type: 'string',
    default: Item.TYPE_WOOD,
    enum: [
        { 'wood': Item.TYPE_WOOD },
        { 'metal': Item.TYPE_METAL },
        { 'glass': Item.TYPE_GLASS },
        { 'explosive': Item.TYPE_EXPLOSIVE },
        { 'concrete': Item.TYPE_CONCRETE }
    ]
});

Item.attributes.add('volume', {
    type: 'number',
    default: 1
});


Item.prototype.initialize = function() {
    if(GameConfig.getAttribute('useModernConvexHullPhysics')) {
        if(this.entity.collision && this.entity.collision.type === 'mesh' && !this.entity.collision.convexHull) {
            console.error('Item ' + this.entity.name + ' is using mesh collision but does not have convexHull set to true');
            this.entity.collision.convexHull = true;
        }
    }

    this.entity.itemType = this.type;
    this.entity.rigidbody.type = pc.BODYTYPE_DYNAMIC;
    this.entity.rigidbody.restitution = Item.TYPE_SETTINGS[this.entity.itemType].restitution;
    this.entity.rigidbody.friction = Item.TYPE_SETTINGS[this.entity.itemType].friction;
    this.entity.rigidbody.mass = this.volume * Item.TYPE_SETTINGS[this.entity.itemType].massMultiplier;
    this.entity.rigidbody.linearDamping = GameConfig.getAttribute('itemLinearDamping');
    this.entity.rigidbody.angularDamping = GameConfig.getAttribute('itemAngularDamping');   
    this.explosionCountdownActive = false;
    this.explosionCountdown = 0;

    /* listeners */
    this.entity.rigidbody.on('collisionstart', this.onCollisionStart, this);
    this.app.on(EventTypes.BOMB_EXPLODED_AT, this.onBombExplodedAt, this);

    this.on('destroy', this.onDestroy, this);
};

Item.prototype.update = function(dt) {
    this.restrictAngularVelocity();

    if(this.entity.itemType === Item.TYPE_EXPLOSIVE && this.explosionCountdownActive) {
        this.explosionCountdown -= dt;
        if(this.explosionCountdown <= 0) {
            this.explosionCountdownActive = false;
            this.explodeBlock();
        }
    }

    if(this.entity.getPosition().y < GameConfig.getAttribute('itemLowestYPositionThreshold') || this.entity.getPosition().y > GameConfig.getAttribute('itemHighestYPositionThreshold') ) {
        this.breakBlock(true);
    }
};

Item.prototype.onBombExplodedAt = function(worldPosition) {
    if(this.entity.itemType === Item.TYPE_EXPLOSIVE) {
        const distance = this.entity.getPosition().distance(worldPosition);
        if(distance <= GameConfig.getAttribute('bombExplosionTNTDetonationRadius')) {
            this.explosionCountdownActive = true;
            this.explosionCountdown = pc.math.random(GameConfig.getAttribute('bombExplosionTNTDetonationDelay').x, GameConfig.getAttribute('bombExplosionTNTDetonationDelay').y);
        }
    }
};

Item.prototype.paint = function(darknessFactor) {
    if([Item.TYPE_METAL, Item.TYPE_WOOD, Item.TYPE_CONCRETE].indexOf(this.entity.itemType) != -1) {
        const visuealComponent = this.entity.model ? this.entity.model : this.entity.render;
        visuealComponent.meshInstances.forEach(meshInstance => {
            meshInstance.material = meshInstance.material.clone();
            meshInstance.material.diffuseMapTint = true;
            darknessFactor = Number.isNaN(darknessFactor) ? 1 : darknessFactor;
            var tintValue = 1;
            switch(this.entity.itemType) {
                case Item.TYPE_WOOD:
                    tintValue = pc.math.lerp(0.8, 1, darknessFactor);
                    break;
                case Item.TYPE_METAL:
                    tintValue = pc.math.lerp(0.75, 1, darknessFactor);
                    break;
                case Item.TYPE_CONCRETE:
                    tintValue = pc.math.lerp(0.65, 1, darknessFactor);
                    break;
            }
            
            meshInstance.material.diffuse.set(tintValue, tintValue, tintValue);
            meshInstance.material.update();
        });
    }
};

Item.prototype.breakBlock = function(skipDestroyingAnimation) {
    if(this.destroyed) {
        return;
    }         
    const pos = this.entity.getPosition();
    if(!skipDestroyingAnimation) {
        switch(this.entity.itemType) {
            case Item.TYPE_GLASS:
                this.app.fire(EventTypes.PLAY_AUDIO, Utils.getRandomItem(['glassHit01', 'glassHit02']), 50);
                break;
            case Item.TYPE_CONCRETE:
                this.app.fire(EventTypes.PLAY_AUDIO, 'concreteDestroyed', 120);
                break;      
            case Item.TYPE_METAL:
                this.app.fire(EventTypes.PLAY_AUDIO, Utils.getRandomItem(['metalDestroyed01', 'metalDestroyed02']), 100);
                break;  
            case Item.TYPE_WOOD:
                this.app.fire(EventTypes.PLAY_AUDIO, 'woodDestroyed', 100);
                break;  
        }
        if(this.entity.model) {
            this.app.fire(EventTypes.BURST_PARTICLES, pos.x, pos.y, pos.z, GameConfig.getAttribute('breakItemNumParticles')[ScaleManager.getInstance().getRelativeQualityIndex()], this.entity.model.meshInstances[0].material);
        } else if (this.entity.render) {
            this.app.fire(EventTypes.BURST_PARTICLES, pos.x, pos.y, pos.z, GameConfig.getAttribute('breakItemNumParticles')[ScaleManager.getInstance().getRelativeQualityIndex()], this.entity.render.meshInstances[0].material);
        }
    }

    this.destroyed = true;
    this.entity.destroy();
    this.app.fire(EventTypes.ITEM_DESTROYED, pos);
};

Item.prototype.explodeBlock = function() {
    if(!this.exploded) {
        this.exploded = true;
        this.app.fire(EventTypes.PLAY_AUDIO, 'tnt');
        this.app.fire(EventTypes.EXPLOSION, this.entity.getPosition().clone());
        this.breakBlock(true);
    }
};

Item.prototype.restrictAngularVelocity = function() {
    const angularVelocity = this.entity.rigidbody.angularVelocity;
    
    /* method one */
    let velocityModified = false;
    if(Math.abs(angularVelocity.x) > GameConfig.getAttribute('itemAngularVelocityLimit').x) {
       velocityModified = true;
       angularVelocity.x = Math.sign(angularVelocity.x) * GameConfig.getAttribute('itemAngularVelocityLimit').x;       
    }
     if(Math.abs(angularVelocity.y) > GameConfig.getAttribute('itemAngularVelocityLimit').y) {
       velocityModified = true;
       angularVelocity.y = Math.sign(angularVelocity.y) * GameConfig.getAttribute('itemAngularVelocityLimit').y;       
    }
     if(Math.abs(angularVelocity.z) > GameConfig.getAttribute('itemAngularVelocityLimit').z) {
       velocityModified = true;
       angularVelocity.z = Math.sign(angularVelocity.z) * GameConfig.getAttribute('itemAngularVelocityLimit').z;       
    }
       
    if(velocityModified) {        
        this.entity.rigidbody.angularVelocity = angularVelocity.clone();//this.entity.rigidbody.angularVelocity.clone().normalize().scale(GameConfig.getAttribute('itemAngularVelocityLimit'));
    }
    
    /* method two */
    // if(angularVelocity.length() > 10) {
    //     this.entity.rigidbody.angularVelocity = this.entity.rigidbody.angularVelocity.clone().normalize().scale(10);
    // }
};

Item.prototype.onCollisionStart = function (result) {
    if (result.other.rigidbody) {
        
        if(result.other.rigidbody.group === Constants.GROUP_BALL) {
            this.restrictAngularVelocity();
            
            if(this.entity.itemType === Item.TYPE_CONCRETE) {
                this.app.fire(EventTypes.PLAY_AUDIO, 'concreteImpact', 50);
            }
            if(this.entity.itemType === Item.TYPE_WOOD) {
                this.app.fire(EventTypes.PLAY_AUDIO, 'woodImpact', 50);
            }
              if(this.entity.itemType === Item.TYPE_METAL) {
                this.app.fire(EventTypes.PLAY_AUDIO, 'metalImpact', 75);
            }
        }
        
        if(this.entity.itemType === Item.TYPE_EXPLOSIVE && result.other.rigidbody.group === Constants.GROUP_BALL) {
            this.explodeBlock();
        }
        
        const hasGroundName = result.other.name.indexOf("Ground") != -1 || result.other.name.indexOf("Terrain") != -1;
        const hasGroundTag = result.other.tags.has("ground") || result.other.tags.has("terrain");
        if(hasGroundName || hasGroundTag) {
           this.breakBlock();
        }
    }
};

Item.prototype.onDestroy = function() {
    this.app.off(EventTypes.BOMB_EXPLODED_AT, this.onBombExplodedAt, this);
};



// ball.js
//@ts-nocheck
var Ball = pc.createScript('ball');

Ball.attributes.add('lifeTime', {
    description: 'seconds',
    type: 'number',
    default: 3
});

Ball.attributes.add('mass', {
    type: 'number',
    default: 0.25
});

Ball.attributes.add('friction', {
    type: 'number',
    default: 0.1,
    min: 0,
    max: 1
});

Ball.attributes.add('restitution', {
    type: 'number',
    default: 0.05,
    min: 0,
    max: 1
});

Ball.attributes.add('explosive', {
    type: 'boolean',
    default: false
});

Ball.prototype.initialize = function () {
    this.destroying = false;
    this.entity.rigidbody.on('collisionstart', this.onCollisionStart, this);

    if (this.entity.particlesystem) {
        this.entity.particlesystem.enabled = ScaleManager.getInstance().isHighQuality();
    }
};

Ball.prototype.update = function (dt) {
    if (!this.destroying && this.entity.launched) {
        /* raycast and destroy all the glass blocks on the way */
        this.raycastAlongThePath(dt);

        this.justDestroyedGlassBlock = false;
        this.prevFrameVelocity = this.entity.rigidbody.linearVelocity.clone();

        this.lifeTime -= dt;
        if (this.lifeTime <= 0) {
            this.startDestroyingAnimation();
        }

        if (this.autoDestroyTime > 0) {
            this.autoDestroyTime -= dt;
            if (this.autoDestroyTime <= 0) {
                this.app.fire(EventTypes.PLAY_AUDIO, 'tnt');
                this.app.fire(EventTypes.EXPLOSION, this.entity.getPosition().clone());
                this.app.fire(EventTypes.BOMB_EXPLODED_AT, this.entity.getPosition().clone());
                this.entity.destroy();
            }
        }
    }
};

Ball.prototype.startDestroyingAnimation = function () {
    this.destroying = true;
    this.entity.tween(this.entity.getLocalScale())
        .to(new pc.Vec3(0, 0, 0), 0.25, pc.BackIn)
        .onComplete(() => this.entity.destroy())
        .start();
};

Ball.prototype.onCollisionStart = function (result) {
    if (result.other.rigidbody) {

        if (result.other.itemType) {
            if (this.entity.particlesystem && this.entity.particlesystem.isPlaying) {
                this.entity.particlesystem.stop();
            }
            this.app.fire(EventTypes.BALL_ITEM_HIT, result.other);
        }
        if (result.other.itemType === Item.TYPE_GLASS) {
            this.justDestroyedGlassBlock = true;
            result.other.script.item.breakBlock();
            if (this.prevFrameVelocity) {
                this.entity.rigidbody.linearVelocity = this.prevFrameVelocity;
            }
        }

        if (this.explosive && !this.destroying) {
            this.destroying = true;
            this.app.fire(EventTypes.PLAY_AUDIO, 'tnt');
            this.app.fire(EventTypes.EXPLOSION, this.entity.getPosition().clone());
            this.app.fire(EventTypes.BOMB_EXPLODED_AT, this.entity.getPosition().clone());
            this.entity.destroy();
            return;
        }
    }
};

Ball.prototype.shoot = function (impulse, autoDestroyTime) {
    this.initialImpulse = impulse.clone();

    this.entity.enabled = true;
    this.entity.rigidbody.type = pc.BODYTYPE_DYNAMIC;
    this.entity.rigidbody.mass = this.mass;
    this.entity.rigidbody.restitution = this.restitution;
    this.entity.rigidbody.friction = this.friction;
    this.entity.rigidbody.body.setCcdMotionThreshold(0.1);
    this.entity.rigidbody.body.setCcdSweptSphereRadius(0.01);
    this.entity.rigidbody.applyImpulse(impulse.scale(this.entity.rigidbody.mass), new pc.Vec3(0, 0, 0));
    if (this.explosive) {
        this.entity.rigidbody.applyTorqueImpulse(new pc.Vec3(pc.math.random(-5, 5), pc.math.random(-5, 5), pc.math.random(-5, 5)));
        if (autoDestroyTime) {
            this.autoDestroyTime = autoDestroyTime + 0.15;
        }
    }

    this.entity.rigidbody.group = Constants.GROUP_BALL;
    this.entity.rigidbody.mask = pc.BODYMASK_ALL ^ Constants.GROUP_GLASS;

    /* launch */
    this.entity.launched = true;

    /* enabled particle system */
    if (this.entity.particlesystem && this.entity.particlesystem.enabled) {
        this.entity.particlesystem.play();
    }
};

Ball.prototype.raycastAlongThePath = function (dt) {
    const frameShift = this.entity.rigidbody.linearVelocity.clone().normalize().scale(this.initialImpulse.length() * dt * 1.5).add(this.entity.rigidbody.linearVelocity.clone().normalize().scale(this.entity.collision.radius));
    const currentPosition = this.entity.getPosition().clone();
    const nextPosition = currentPosition.clone().add(frameShift);
    var raycastResults = Utils.raycastAll(currentPosition, nextPosition);
    for (let i = 0; i < raycastResults.length; i++) {
        if (raycastResults[i] === this.entity) {
            continue;
        } else if (raycastResults[i].itemType === Item.TYPE_GLASS && this.justDestroyedGlassBlock && raycastResults[i].script && raycastResults[i].script.item) {
            raycastResults[i].script.item.breakBlock();
        } else if (raycastResults[i].itemType === Item.TYPE_EXPLOSIVE && raycastResults[i].script && raycastResults[i].script.item) {
            raycastResults[i].script.item.explodeBlock();
        } else {
            break;
        }
    }
};


// levelBuilder.js
 //@ts-nocheck
/* jshint esversion: 6 */
var LevelBuilder = pc.createScript('levelBuilder');

LevelBuilder.getInstance = function () {
    if (!LevelBuilder._instance) console.error('LevelBuilder is not initialized yet');
    return LevelBuilder._instance;
};

LevelBuilder.prototype.initialize = function () {
    LevelBuilder._instance = this;

    this.objectsContainer = this.entity.findByName('ObjectsContainer');
    this.standsContainer = this.entity.findByName('StandsContainer');
    this.charactersContainer = this.entity.findByName('CharactersContainer');
    this.gameObjectsContainer = this.entity.findByName('GameObjectsContainer');
    this.levelTemplatesContainer = this.app.root.findByName('LevelsPrefabs');

    this.app.on(EventTypes.LOAD_STAGE, this.loadStage, this);
    this.app.on(EventTypes.BALLS_AMOUNT_UPDATED, this.onBallsAmountUpdated, this);
    this.app.on(EventTypes.LEVEL_RESET, this.reset, this);
    this.app.on(EventTypes.CLEAR_SCENE, this.clearScene, this);
};

LevelBuilder.prototype.update = function (dt) {

};

LevelBuilder.prototype.clearScene = function () {
    this.reset();
};

LevelBuilder.prototype.reset = function () {
    for (let i = this.objectsContainer.children.length - 1; i > -1; i--) {
        this.objectsContainer.children[i].destroy();
    }
    for (let i = this.standsContainer.children.length - 1; i > -1; i--) {
        this.standsContainer.children[i].destroy();
    }
    for (let i = this.charactersContainer.children.length - 1; i > -1; i--) {
        this.charactersContainer.children[i].destroy();
    }    
    for (let i = this.gameObjectsContainer.children.length - 1; i > -1; i--) {
        this.gameObjectsContainer.children[i].destroy();
    }
};

LevelBuilder.prototype.loadStage = async function (levelIndex, stageIndex) {
    let stagePrefab = LevelManager.getInstance().getStagePrefab(levelIndex, stageIndex);
    let destroyAfterClone = false;
    const customLevel = LevelManager.getInstance().isCustomGeneratedLevel();
    if (!stagePrefab) {
        console.error('stage prefab not found');
        return;
    }

    if(stagePrefab.type === 'template') {
        stagePrefab = stagePrefab.resource.instantiate();
        stagePrefab.reparent(this.levelTemplatesContainer);
        destroyAfterClone = true;
    }

    let applyRotation = customLevel && LevelManager.getInstance().applyLevelRotation && !stagePrefab.script.stageConfig.disableRandomRotation;
    if(LevelManager.getInstance().isTestingMode()) {
        applyRotation = LevelManager.getInstance().shouldRotateTestLevel();
        if(applyRotation) {
            Utils.showAlert('Test level is rotated: ' + stagePrefab.name, 'warning');
        }
    }
    Utils.warn('[PROGRESSION] Loading stage '+ levelIndex + '/' + stageIndex + ' - ' + stagePrefab.name + ', rotation: ' + applyRotation + `${LevelManager.getInstance().isTestingMode() ? '(test mode)' : ''}`);

    /* override physics configuration */
    if (stagePrefab.script.stageConfig.overridePhysicsConfiguration) {
        if(!GameConfig.getAttribute('allowOverridingTimeStep')) {
            console.log('[INFO] Physics configuration is not allowed to be overridden, using default values');
            this.app.fire(EventTypes.RESET_PHYSICS_CONFIGURATION);
        } else {
            this.app.systems.rigidbody.fixedTimeStep = stagePrefab.script.stageConfig.fixedTimeStep;
            this.app.systems.rigidbody.maxSubSteps = stagePrefab.script.stageConfig.maxSubSteps;
        }       
    } else {
        this.app.fire(EventTypes.RESET_PHYSICS_CONFIGURATION);
    }

    /* load balls amount */
    const isOriginalLevel = GameplayController.currentLevel <= LevelManager.getInstance().levels.length;
    let numBalls = stagePrefab.script.stageConfig.numBalls;
    if(applyRotation) {
        numBalls = stagePrefab.script.stageConfig.rotatedBalls > 0 ? stagePrefab.script.stageConfig.rotatedBalls : numBalls;
    }

    if(isOriginalLevel) {
        numBalls += stagePrefab.script.stageConfig.additionalBalls;
    } else {
        numBalls -= 1;
    }
    // console.log('Loading level ' + levelIndex + '/' + stageIndex + ' (level ' + GameplayController.currentLevel + ') with ' + numBalls + ' balls');
    let bossLevel = stagePrefab.script.stageConfig.bossLevel;
    this.app.fire(EventTypes.CREATE_BALLS, numBalls, bossLevel);


    /* cloning children only */
    const cloneChildren = entity => {
        if (entity.model || entity.render || entity.tags.has('character') || entity.tags.has('gameobject')) {
            var originTransform = entity.getWorldTransform();
            // console.log('cloning entity ' + entity.path);
            var cloned = entity.clone();
            cloned.setPosition(entity.getPosition().clone());
            cloned.setLocalEulerAngles(originTransform.getEulerAngles());
            cloned.setLocalScale(originTransform.getScale());
            if (cloned.script && cloned.script.item) {
                this.objectsContainer.addChild(cloned);
            } else if (entity.tags.has('character')) {
                this.charactersContainer.addChild(cloned);
            } else if (entity.tags.has('gameobject')) {
                this.gameObjectsContainer.addChild(cloned);
            } else {
                this.standsContainer.addChild(cloned);
            }
        }  else {
            const originalAngles = (applyRotation && entity.script && entity.script.groupConfig) ? entity.getLocalEulerAngles().clone() : null;
            if (originalAngles) {
                entity.setLocalEulerAngles(originalAngles.x, entity.script.groupConfig.rotation, originalAngles.z);
            }
            for (let i = entity.children.length - 1; i > - 1; i--) {
                cloneChildren(entity.children[i]);
            }
            if (originalAngles) {
                entity.setLocalEulerAngles(originalAngles.x, originalAngles.y, originalAngles.z);
            }
        }
    };
    cloneChildren(stagePrefab);
 
    this.app.fire('level:loaded');

    this.paintItems();
    this.animateAppearing();

    if(destroyAfterClone) {
        stagePrefab.destroy();
    }
};

LevelBuilder.prototype.onBallsAmountUpdated = function (numBalls) {

};

LevelBuilder.prototype.paintItems = function () {
    if (GameConfig.getAttribute('enableTint')) {
        const minHeight = this.objectsContainer.children.reduce((min, currentItem) => Math.min(min, currentItem.getPosition().y), 1000);
        const maxHeight = this.objectsContainer.children.reduce((max, currentItem) => Math.max(max, currentItem.getPosition().y), -1000);
        this.objectsContainer.children.forEach(child => child.script.item.paint((child.getPosition().y - minHeight) / (maxHeight - minHeight)));
    }
};

LevelBuilder.prototype.animateAppearing = function () {
    this.objectsContainer.children.forEach(c => c.rigidbody.enabled = false);
    this.standsContainer.children.forEach(c => c.rigidbody.enabled = false);
    this.charactersContainer.children.forEach(c => c.rigidbody && (c.rigidbody.enabled = false));
    this.disablePhysics(this.gameObjectsContainer);

    this.app.fire(EventTypes.STAGE_LOADING_STARTED);

    this.entity.setLocalScale(0.6, 0.6, 0.6);
    this.entity.tween(this.entity.getLocalScale())
        .to(new pc.Vec3(1, 1, 1), 0.14, pc.Linear)
        .start();

    this.entity.setLocalPosition(0, -2, 0);
    this.entity.tween(this.entity.getLocalPosition())
        .to(new pc.Vec3(0, 0, 0), 0.14, pc.Linear)
        .onComplete( () => {
            this.objectsContainer.children.forEach(c => c.rigidbody.enabled = true);
            this.standsContainer.children.forEach(c => c.rigidbody.enabled = true);
            this.charactersContainer.children.forEach(c => c.rigidbody && (c.rigidbody.enabled = true));
            this.enablePhysics(this.gameObjectsContainer);
            this.app.fire(EventTypes.STAGE_LOADED);
        })
        .start();

    this.app.fire(EventTypes.PLAY_AUDIO, Utils.getRandomItem(['levelAppear02', 'levelAppear01']));

};

LevelBuilder.prototype.disablePhysics = function (entity) {
    if (entity.rigidbody) {
        entity.rigidbody.enabled = false;
    }
    entity.children.forEach(child => this.disablePhysics(child));
};

LevelBuilder.prototype.enablePhysics = function (entity) {
    if (entity.rigidbody) {
        entity.rigidbody.enabled = true;
    }
    entity.children.forEach(child => this.enablePhysics(child));
};


// particlesController.js
//@ts-nocheck
var ParticlesController = pc.createScript('particlesController');

ParticlesController.attributes.add('cacheSize', {
    description: 'num particles in cache',
    type: 'number',
    default: 150
});

ParticlesController.attributes.add('particlePrefab', {
    type: 'entity'
});

ParticlesController.prototype.initialize = function() {
    this.particleCache = [];
    this.activeParticles = [];
    this.prepareCache();
    this.app.on(EventTypes.BURST_PARTICLES, this.createExplosion, this);
    this.app.on(EventTypes.LEVEL_RESET, this.reset, this);
    this.on("destroy", this.destroy, this);
};

ParticlesController.prototype.reset = function() {
    for(let i = this.activeParticles.length - 1; i > -1; i--) {
        this.resetPaticle(this.activeParticles[i]);
    }
};

ParticlesController.prototype.destroy = function() {
    this.app.off(EventTypes.EXPLOSION, this.createExplosion, this);
};

ParticlesController.prototype.update = function(dt) {
    this.activeParticles.forEach(child => this.updateChild(child, dt));
};

ParticlesController.prototype.createExplosion = function(x, y, z, numParticles, material) {
    numParticles = numParticles || 6;
    if(this.particleCache && this.particleCache.length < this.cacheSize * 0.6) {
        numParticles = Math.floor(pc.math.random(2, Math.max(2, Math.floor(numParticles / 2))));
    }
    for(let i = 0; i < numParticles; i++) {
        this.addParticle(x, y, z, material);
    }
};

ParticlesController.prototype.updateChild = function(child, dt) {
   //position
   const pos = child.getPosition();
   pos.x += child.speedX * dt;
   pos.y += child.speedY * dt;
   pos.z += child.speedZ * dt;
   child.setPosition(pos);
   child.speedY += child.gravity * dt;

   //scale
   child.currentScale += child.scaleSpeed * dt;
   child.scaleSpeed += child.scaleAcceleration * dt;
   if(child.currentScale <= 0) {
       child.currentScale = 0;
       child.completed = true;
   }
   child.setLocalScale(child.currentScale, child.currentScale, child.currentScale);

    if(child.completed) {
       this.resetPaticle(child);
   }
};


ParticlesController.prototype.addParticle = function(x, y, z, material) {
    let particle;

    if(this.particleCache.length > 0) {
        particle = this.particleCache.splice(this.particleCache.length - 1, 1)[0];
    } else {
        particle = this.particlePrefab.clone();
        this.entity.addChild(particle);
    }

    particle.enabled = true;
    particle.render.meshInstances[0].material = material;
    particle.setPosition(x, y, z);
    particle.setLocalEulerAngles(pc.math.random(-180, 180), pc.math.random(-180, 180), pc.math.random(-180, 180));
    particle.speedX = pc.math.random(-6, 6);
    particle.speedY = pc.math.random(-2, 10);
    particle.speedZ = pc.math.random(-6, 6);
    particle.gravity = pc.math.random(-25, -15);        
    particle.currentScale = pc.math.random(0.1, 0.3);
    particle.setLocalScale(particle.currentScale, particle.currentScale, particle.currentScale);
    particle.scaleSpeed = pc.math.random(1.0, 1.4);
    particle.scaleAcceleration = pc.math.random(-10, -5);
    particle.completed = false;

    this.activeParticles.push(particle);
};


ParticlesController.prototype.resetPaticle = function(particle) {
    const index = this.activeParticles.indexOf(particle);
    if(index != -1) {
        this.activeParticles.splice(index, 1);
    }
    particle.enabled = false;
    particle.setPosition(0, -50, 0);
    this.particleCache.push(particle);
};


ParticlesController.prototype.prepareCache = function() {
    this.particleCache = [];
    const basicParticle = this.particlePrefab;
    for(let i = 0; i < this.cacheSize; i++) {
        const particle = basicParticle.clone();
        particle.enabled = false;
        particle.setPosition(0, -50, 0);
        particle.completed = true;
        this.entity.addChild(particle);
        this.particleCache.push(particle);
    }
};

// eventTypes.js
//@ts-nocheck
var EventTypes = pc.createScript('eventTypes');

/* Preloader */
EventTypes.PRELOADER_FINISHED = 'preloader:finished';

/* Physics */
EventTypes.INJECT_CUSTOM_PHYSICS = 'physics:injectCollision';
EventTypes.RESET_PHYSICS_CONFIGURATION = 'physics:resetConfiguration';

/* General */
EventTypes.APP_LOADED = 'app:onLoaded';
EventTypes.SAVE_APP = 'app:save';
EventTypes.SAVE_LEVELS = 'levels:save';
EventTypes.SAVE_LEVEL_SCORES = 'levelScores:save';
EventTypes.POSTINITIALIZE = 'postinitialize';

/* Screen size/scale */
EventTypes.Screen = {
    RESIZED: 'app:screen:resized',
    SET_SCALE_BLEND: 'app:screen:setScaleBlend',
    SET_SHADOWS_ENABLED: 'app:screen:shadowsEnabled',
    SET_CUSTOM_SCALE_BLEND: 'app:screen:setCustomScaleBlend',
    RESTORE_DEFAULT_SCALE_BLEND: 'app:screen:restoreDefaultScaleBlend'
};

/* Game input */
EventTypes.TAP_AT = 'input:tapAt';
EventTypes.INPUT_DOWN = 'input:down';
EventTypes.INPUT_UP = 'input:up';
EventTypes.INPUT_MOVE = 'input:move';
EventTypes.SWIPE_LEFT = 'input:swipeLeft';
EventTypes.SWIPE_RIGHT = 'input:swipeRight';
EventTypes.SWIPE_UP = 'input:swipeUp';
EventTypes.SWIPE_DOWN = 'input:swipeDown';

EventTypes.GameInput = {
    MOUSE_DOWN: "gameInput:mouse_down",
    MOUSE_UP: "gameInput:mouse_up",
    MOUSE_MOVE: "gameInput:mouse_move",
    TOUCH_STARTED: "gameInput:touch_started",
    TOUCH_ENDED: "gameInput:touch_ended",
    TOUCH_UPDATED: "gameInput:touch_updated",
    TOUCH_MOVE: "gameInput:touch_move",
    KEYBOARD_STARTED: "gameInput:keyboard_started",
    KEYBOARD_ENDED: "gameInput:keyboard_ended",
    KEYBOARD_UPDATED: "gameInput:keyboard_updated",
};


/* Levels */
EventTypes.LOAD_NEXT_LEVEL = 'level:next';
EventTypes.LOAD_CUSTOM_LEVEL = 'level:custom';
EventTypes.RESTART_CURRENT_LEVEL = 'level:restart';
EventTypes.LEVEL_START = 'level:start';
EventTypes.LEVEL_RESET = 'level:reset';
EventTypes.LEVEL_COMPLETED = 'level:completed';
EventTypes.STAGE_COMPLETED = 'stage:completed';
EventTypes.STAGE_FAILED = 'stage:failed';
EventTypes.LOAD_STAGE = 'stage:load';
EventTypes.STAGE_LOADED = 'stage:loaded';
EventTypes.STAGE_LOADING_STARTED =  'stage:loadingStarted';
EventTypes.EXIT_TO_MAIN_MENU = 'game:exitToMainMenu';
EventTypes.FORCE_GAME_OVER = 'game:forceGameOver';
EventTypes.DEBUG_LOAD_NEXT_STAGE = 'debug:loadNextStage';
EventTypes.DEBUG_LOAD_PREVIOUS_STAGE = 'debug:loadPreviousStage';
EventTypes.CLEAR_SCENE = 'scene:clear';

/* balls */
EventTypes.SET_INFINITE_BALLS_MODE = 'balls:setInfiniteBallsMode';
EventTypes.SET_BALLS_AMOUNT_TEXT = 'balls:setBallsAmountText';
EventTypes.SET_PREMIUM_BALLS_AMOUNT_TEXT = 'balls:setPremiumBallsAmountText';

/* Requests */
EventTypes.RESTART_REQUESTED = 'request:restart';


/* Worlds */
EventTypes.CHANGE_WORLD = 'world:change';
EventTypes.WORLD_CHANGED = 'world:changed';
EventTypes.WORLD_CONFIG_CHANGED = 'world:configChanged';

/* Scores */
EventTypes.ADD_SCORES = 'scores:add';
EventTypes.RESET_SCORES = 'scores:reset';
EventTypes.SCORES_CHANGED = 'scores:changed';
EventTypes.MAX_SCORES_CHANGED = 'maxscores:changed';
EventTypes.SHOW_SCORES_EFFECT = 'scores:showEffect';

/* Powerups */
EventTypes.UPDATE_POWERUP_PROGRESS = 'powerup:updateProgress';
EventTypes.RESET_POWERUP_PROGRESS = 'powerup:resetProgress';
EventTypes.POWERUP_ACTIVATED = 'powerup:activated';
EventTypes.POWERUP_DEACTIVATED = 'powerup:deactivated';
EventTypes.POWERUP_GET_FOR_FREE = 'powerup:getForFree';

/* Balls */
EventTypes.SHOW_BALLS_BOX = 'ballsBox:show';
EventTypes.HIDE_BALLS_BOX = 'ballsBox:hide';

EventTypes.CREATE_BALLS = 'ball:createBalls';
EventTypes.ADD_BALLS = 'ball:addBalls';
EventTypes.BALL_SHOT = 'ball:shot';
EventTypes.BOMB_SHOT = 'ball:shotBomb';
EventTypes.BALLS_AMOUNT_UPDATED = 'ball:amountUpdated';
EventTypes.ADD_PREMIUM_BALLS = 'ball:addPremiumBalls';
EventTypes.OUT_OF_BALLS = 'ball:outOfBalls';
EventTypes.BALL_ITEM_HIT = 'ball:hititem';
EventTypes.BOMB_EXPLODED_AT = 'bomb:explodedAt';

/* IAP */
EventTypes.PURCHASE_EVENT = 'iap:purchase';
EventTypes.CONSUME_IAP_PRODUCT = 'iap:consumeProduct';
EventTypes.LOCK_SCREEN = 'iap:lockScreen';
EventTypes.UNLOCK_SCREEN = 'iap:unlockScreen';
EventTypes.PRODUCT_DATA_LOADED = 'iap:productDataLoaded';

/* No ads offer */
EventTypes.NO_ADS_OFFER_EXITED = 'noAdsOffer:exited';
EventTypes.NO_ADS_ACTIVATED = 'noAds:activated';
EventTypes.PLAY_WITH_ADS_CHOSEN = 'noAdsOffer:playWithAdsChosen';
EventTypes.DISCOUNT_EXPIRED = 'noAdsOffer:discountExpired';
EventTypes.DISCOUNT_BECOME_AVAILABLE = 'noAdsOffer:discountBecomeAvailable';

/* revive */
EventTypes.REVIVE_EARNED = 'revive:earned';
EventTypes.REVIVE_CANCELED = 'revive:canceled';
EventTypes.PREMIUM_PACKAGE_PURCHASED = 'premiumPackage:purchased';

/* Items */
EventTypes.ITEM_DESTROYED = 'item:destroyed';


/* Effects */
EventTypes.BURST_PARTICLES = 'particles:burst';
EventTypes.EXPLOSION = 'explosion';

/* Camera */
EventTypes.PLAY_PRESSED = 'game:playPressed';
EventTypes.SHAKE_CAMERA = 'camera:shake';
EventTypes.REBOUND_CAMERA = 'camera:rebound';


/* Audio - new */
EventTypes.ENABLE_MUSIC = 'music:enable';
EventTypes.DISABLE_MUSIC = 'music:disable';
EventTypes.ENABLE_SFX = 'sfx:enable';
EventTypes.DISABLE_SFX = 'sfx:disable';
EventTypes.SET_SFX_VOLUME = 'sfx:setVolume';
EventTypes.SET_MUSIC_VOLUME = 'music:setVolume';
EventTypes.PLAY_MUSIC = 'music:play';
EventTypes.STOP_MUSIC = 'music:stop';
EventTypes.CHOKE_MUSIC = 'music:choke';
EventTypes.UNCHOKE_MUSIC = 'music:unchoke';
EventTypes.PLAY_EXTERNAL_SFX = 'sfx:playExternal';
EventTypes.PLAY_SFX = 'sfx:play';
EventTypes.STOP_SFX = 'sfx:stop';
EventTypes.MUTE_SOUND = 'audio:mute';
EventTypes.UNMUTE_SOUND = 'audio:unmute';
EventTypes.SOUND_STATE_CHANGED = 'sound:stateChanged';
EventTypes.MUSIC_STATE_CHANGED = 'music:stateChanged';

/* Audio - legacy */
EventTypes.PLAY_AUDIO = EventTypes.PLAY_SFX; /* compatibility */
EventTypes.STOP_AUDIO = EventTypes.STOP_SFX; /* compatibility */

/* Worlds - ambient */
EventTypes.STOP_AMBIENT_AUDIO = 'world:stopAmbientAudio';
EventTypes.RESUME_AMBIENT_AUDIO = 'world:resumeAmbientAudio';

/* Quality */
EventTypes.QUALITY_CHANGED = 'quality:changed';
EventTypes.QUALITY_NEXT = 'quality:next';


// gameplayController.js
 //@ts-nocheck
var GameplayController = pc.createScript('gameplayController');

GameplayController.getInstance = function () {
    if (!GameplayController.instance) console.error('GameplayController is not initialized yet');
    return GameplayController.instance;
};

GameplayController.prototype.initialize = function () {
    GameplayController.instance = this;
    GameplayController.app = this.app;

    this.initGameProperties();

    this.app.on(EventTypes.STAGE_COMPLETED, this.handleStageCompleted, this);
    this.app.on(EventTypes.STAGE_FAILED, this.handleStageFailed, this);
    this.app.on(EventTypes.DEBUG_LOAD_NEXT_STAGE, this.debugLoadNextStage, this);
    this.app.on(EventTypes.DEBUG_LOAD_PREVIOUS_STAGE, this.debugLoadPreviousStage, this);
    this.app.on(EventTypes.LOAD_NEXT_LEVEL, this.loadNextLevel, this);
    this.app.on(EventTypes.LOAD_CUSTOM_LEVEL, this.loadCustomLevel, this);
    this.app.on(EventTypes.RESTART_CURRENT_LEVEL, this.restartCurrentLevel, this);
    this.app.on(EventTypes.EXIT_TO_MAIN_MENU, this.exitToMainMenu, this);
    this.app.on(EventTypes.FORCE_GAME_OVER, this.forceGameOver, this);
    this.app.on(EventTypes.POSTINITIALIZE, this.gameLoaded, this);   
};

GameplayController.prototype.update = function (dt) {

};

GameplayController.prototype.initGameProperties = function () {
    //State variables
    GameplayController.currentLevel = 1;
    GameplayController.currentStage = 1;

    /* IAP */
    GameplayController.premiumBalls = 0;
    GameplayController.noAdsPurchased = false;

    //Activity
    GameplayController.gameStarted = false;

    //Session vars
    GameplayController.totalStages = 0;

    /* load saved data from storage */
    LocalStorageController.loadData();
    
    /* send no-ad event if needed */
    if(GameplayController.noAdsPurchased) {
        
    }
};

GameplayController.prototype.gameLoaded = function () {
    this.app.systems.rigidbody.fixedTimeStep = GameConfig.getAttribute('fixedTimeStep');
    this.app.systems.rigidbody.maxSubSteps = GameConfig.getAttribute('maxSubSteps');
    
    this.app.fire(EventTypes.CHANGE_WORLD);
    this.startLevel(GameplayController.currentLevel, true);
};



GameplayController.prototype.isNoAdsActive = function () {
    return GameplayController.noAdsPurchased;
};

GameplayController.prototype.resetLevel = function () {
    this.app.fire(EventTypes.CLEAR_SCENE);
    this.app.fire(EventTypes.RESET_SCORES);
    GameplayController.currentScores = 0;
    GameplayController.currentStage = 1;
    GameplayController.currentSession = {
        reviveUsed: false,
        reviveCanceled: false,
        usedPowerups: []
    };
};

GameplayController.prototype.loadNextLevel = function () {
    this.app.fire(EventTypes.CHANGE_WORLD);
    this.startLevel(GameplayController.currentLevel + 1);
    this.app.fire(EventTypes.SAVE_APP);
};

GameplayController.prototype.loadCustomLevel = function (levelIndex) {
    GameplayController.currentLevel = levelIndex;
    this.startLevel(levelIndex);
    this.app.fire(EventTypes.SAVE_APP);
};


GameplayController.prototype.startLevel = async function (levelIndex, skipGameStartRequest = false) {
    if(!skipGameStartRequest) {
        
    }

    this.resetLevel();

    this.app.fire(EventTypes.INJECT_CUSTOM_PHYSICS);

    GameplayController.currentLevel = levelIndex;
    const level = LevelManager.getInstance().getLevel(GameplayController.currentLevel);
    GameplayController.totalStages = level.length;
    if(!skipGameStartRequest) {
        
    }
    await this.loadStage(1);
    this.app.fire(EventTypes.LEVEL_START);
};

GameplayController.prototype.restartCurrentLevel = function () {
    this.startLevel(GameplayController.currentLevel);
};

GameplayController.prototype.startFromMainMenu = async function () {
    
    
    
    
    WindowManager.startGameplay();
    this.app.fire(EventTypes.PLAY_PRESSED);
};

GameplayController.prototype.exitToMainMenu = async function () {
    if(!GameplayController.gameStarted) {
        console.warn('Level is not started -> there is nothing to quit!');
        return;
    }
    
    
    GameplayController.gameStarted = false;

    TransitionScreen.instance.transitionTo(() => {
        this.startLevel(GameplayController.currentLevel, true);
        WindowManager.exitToMainMenu();
    });
};

GameplayController.prototype.loadStage = async function (stageIndex) {
    if(GameplayController.gameStarted) {
        
    }
    GameplayController.currentStage = stageIndex;
    this.app.fire(EventTypes.LEVEL_RESET);
    this.app.fire(EventTypes.LOAD_STAGE, GameplayController.currentLevel, GameplayController.currentStage, GameplayController.totalStages);
};

GameplayController.prototype.loadNextStage = function () {
    if (this.isLastStage()) {
        this.startLevel(GameplayController.currentLevel + 1);
    } else {
        this.loadStage(GameplayController.currentStage + 1);
    }
};

GameplayController.prototype.debugLoadNextStage = function () {
    const levels = LevelManager.getInstance().levels;
    if (!levels || levels.length === 0) return;

    let levelIndex = ((GameplayController.currentLevel - 1) % levels.length) + 1;
    let stageIndex = GameplayController.currentStage + 1;

    if (stageIndex > levels[levelIndex - 1].length) {
        levelIndex = (levelIndex % levels.length) + 1;
        stageIndex = 1;
    }

    if (levelIndex !== GameplayController.currentLevel) {
        GameplayController.currentLevel = levelIndex;
        GameplayController.totalStages = levels[levelIndex - 1].length;
    }

    this.loadStage(stageIndex);
};

GameplayController.prototype.debugLoadPreviousStage = function () {
    const levels = LevelManager.getInstance().levels;
    if (!levels || levels.length === 0) return;

    let levelIndex = ((GameplayController.currentLevel - 1) % levels.length) + 1;
    let stageIndex = GameplayController.currentStage - 1;

    if (stageIndex < 1) {
        levelIndex = ((levelIndex - 2 + levels.length) % levels.length) + 1;
        stageIndex = levels[levelIndex - 1].length;
    }

    if (levelIndex !== GameplayController.currentLevel) {
        GameplayController.currentLevel = levelIndex;
        GameplayController.totalStages = levels[levelIndex - 1].length;
    }

    this.loadStage(stageIndex);
};

GameplayController.prototype.handleStageCompleted = async function () {
    
    if (this.isLastStage()) {
        
        this.app.fire(EventTypes.LEVEL_COMPLETED);
        
        
        WindowManager.showResults();
    } else {
        this.loadNextStage();
    }
};

GameplayController.prototype.handleStageFailed = async function () {await this.proceedToDefeat();};

GameplayController.prototype.proceedToDefeat = async function () {
    

    
    
    
    WindowManager.showDefeat();
};

GameplayController.prototype.forceGameOver = async function () {
    await this.proceedToDefeat();
};

/* progression */
GameplayController.prototype.isLastStage = function () {
    return GameplayController.currentStage >= GameplayController.totalStages;
};

// levelController.js
//@ts-nocheck
var LevelController = pc.createScript('levelController');

LevelController.getInstance = function () {
    if (!LevelController._instance) console.error('LevelController is not initialized yet');
    return LevelController._instance;
};

LevelController.prototype.initialize = function () {
    LevelController._instance = this;

    this.objectsContainer = this.entity.findByName('ObjectsContainer');
    this.standsContainer = this.entity.findByName('StandsContainer');
    this.charactersContainer = this.entity.findByName('CharactersContainer');
    
    this.defeatCountdownText = this.app.root.findByName('UIContainer').findByName('DefeatCountdownText');
    this.explosionPrefab = this.app.root.findByName('ObjectsPrefabs').findByName('Explosion');
    this.effectsContainer = this.app.root.findByName('EffectsContainer');

    this.defeatTimer = { value: 0, active: false };
    this.victoryTimer = { value: 0, active: false };
    this.comboCounter = 0;
    this.powerupProgress = 0;
    this.levelProgress = 0;
    this.stageProgress = 0;
    this.totalObjectsOnStage = 0;

    this.app.on(EventTypes.STAGE_COMPLETED, this.handleStageCompleted, this);
    this.app.on(EventTypes.LEVEL_RESET, this.reset, this);
    this.app.on(EventTypes.BALL_SHOT, this.handleBallShot, this);
    this.app.on(EventTypes.BOMB_SHOT, this.handleBallShot, this);
    this.app.on(EventTypes.BALL_ITEM_HIT, this.handleBallItemHit, this);
    this.app.on(EventTypes.ITEM_DESTROYED, this.handleItemDestroyed, this);
    this.app.on(EventTypes.EXPLOSION, this.createExplosion, this);
    this.app.on(EventTypes.OUT_OF_BALLS, this.handleOutOfBalls, this);
    this.app.on(EventTypes.RESET_POWERUP_PROGRESS, this.resetPowerupProgress, this);
    this.app.on(EventTypes.POWERUP_ACTIVATED, this.handlePowerupActivated, this);
    this.app.on(EventTypes.POWERUP_GET_FOR_FREE, this.handlePowerupGetForFree, this);
    this.app.on(EventTypes.STAGE_LOADED, this.onStageLoaded, this);

    this.app.on(EventTypes.REVIVE_EARNED, this.handleReviveEarned, this);
    this.app.on(EventTypes.REVIVE_CANCELED, this.handleReviveCanceled, this);
    this.app.on(EventTypes.PREMIUM_PACKAGE_PURCHASED, this.handlePremiumPackagePurchased, this);

    this.app.on(EventTypes.RESTART_REQUESTED, this.onRestartRequested, this);
};


LevelController.prototype.onRestartRequested = function () {
    this.reset();
};

LevelController.prototype.update = function (dt) {
    if(WindowManager.hasOpenedWindows()) {
        return;
    }

    if (this.victoryTimer.active) {
        this.victoryTimer.value -= dt;
        if (this.victoryTimer.value <= 0) {
            this.victoryTimer.active = false;
            this.app.fire(EventTypes.STAGE_COMPLETED);
        }
    } else if (this.defeatTimer.active) {
        this.defeatTimer.value -= dt;
        if (this.defeatTimer.value <= 0) {
            this.defeatTimer.active = false;
            this.app.fire(EventTypes.STAGE_FAILED);
        }
    }

    /* Countdown text */
    if (this.defeatTimer.active) {
        // this.defeatCountdownText.enabled = true;

        if (this.lastDefeatTimer != Math.ceil(this.defeatTimer.value)) {
            this.defeatCountdownText.enabled = true;
            this.lastDefeatTimer = Math.ceil(this.defeatTimer.value);
            this.defeatCountdownText.element.text = '' + this.lastDefeatTimer;

            this.app.fire(EventTypes.PLAY_AUDIO, this.lastDefeatTimer % 2 === 0 ? "tic" : "tac");

            this.defeatCountdownText.element.opacity = 1;
            this.defeatCountdownText.tween(this.defeatCountdownText.element)
                .to({ opacity: 0 }, 0.95, pc.SineIn)
                .onComplete(() => {
                    this.defeatCountdownText.enabled = false;
                })
                .start();

            this.defeatCountdownText.setLocalScale(1, 1, 1);
            this.defeatCountdownText.tween(this.defeatCountdownText.getLocalScale())
                .to(new pc.Vec3(2.2, 2.2, 2.2), 0.95, pc.SineOut)
                .start();
        }
    } else {
        this.defeatCountdownText.enabled = false;
    }

};

LevelController.prototype.reset = function () {
    this.defeatTimer = { value: 0, active: false };
    this.victoryTimer = { value: 0, active: false };
    this.comboCounter = 0;
    this.levelProgress = 0;
    this.stageProgress = 0;
    this.totalObjectsOnStage = 0;
};

LevelController.prototype.getActiveObjectsList = function () {
    return this.objectsContainer.children.filter(child => child.rigidbody && child.rigidbody.enabled && child.script && child.script.item);
};

LevelController.prototype.onStageLoaded = function () {
    this.stageProgress = 0;
    this.totalObjectsOnStage = this.objectsContainer.children.length;
};

LevelController.prototype.resetPowerupProgress = function () {
    this.powerupProgress = 0;
};

LevelController.prototype.handlePowerupGetForFree = function () {
    this.powerupProgress = 1;
    this.app.fire(EventTypes.UPDATE_POWERUP_PROGRESS, this.powerupProgress);

    if(this.defeatTimer.active) {
        this.app.fire(EventTypes.POWERUP_ACTIVATED);
    }
    this.cancelDefeatTimer();
};

LevelController.prototype.startDefeatTimer = function (value) {
    if(this.victoryTimer.active || this.defeatTimer.active) {
        return;
    }
    this.defeatTimer.active = true;
    this.defeatTimer.value = value;
};

LevelController.prototype.cancelDefeatTimer = function () {
    if(this.defeatTimer.active) {
        this.defeatTimer.active = false;
        this.defeatTimer.value = 0;
    }
};

LevelController.prototype.handleBallShot = function () {
    this.comboCounter = 0;
};

LevelController.prototype.handleStageCompleted = function () {
    this.powerupProgress = pc.math.clamp(this.powerupProgress + GameConfig.getAttribute('powerupProgressPerStage'), 0, 1);
    this.app.fire(EventTypes.UPDATE_POWERUP_PROGRESS, this.powerupProgress);
};

LevelController.prototype.handleBallItemHit = function (item) {
    const itemPosition = item.getPosition();
    this.objectsContainer.children.forEach(child => {
        if (child.getPosition().y >= itemPosition.y) {
            child.rigidbody.activate();
        }
    });
};

LevelController.prototype.handleItemDestroyed = function (position) {
    const scores = GameConfig.getAttribute('scoresPerItem') * (++this.comboCounter);
    this.app.fire(EventTypes.ADD_SCORES, scores, position);
    
    this.updateLevelProgress();

    this.powerupProgress = pc.math.clamp(this.powerupProgress + GameConfig.getAttribute('powerupProgressPerItem'), 0, 1);
    this.app.fire(EventTypes.UPDATE_POWERUP_PROGRESS, this.powerupProgress);

    if (this.objectsContainer.children.length === 0) {
        if (!this.victoryTimer.active) {
            if (this.defeatTimer.active) {
                this.defeatTimer.active = false;
            }
            this.victoryTimer.active = true;
            this.victoryTimer.value = GameConfig.getAttribute('victoryTimer');
        }
    }
};

LevelController.prototype.handleOutOfBalls = function () {
    if (!this.victoryTimer.active) {
        this.startDefeatTimer(GameConfig.getAttribute('defeatTimer'));
    }
};

LevelController.prototype.handlePowerupActivated = function () {
    this.powerupProgress = 0;
    this.app.fire(EventTypes.RESET_POWERUP_PROGRESS, this.powerupProgress);
    this.cancelDefeatTimer();
};

LevelController.prototype.handleReviveEarned = function (numBalls) {
    this.cancelDefeatTimer();
    
    GameplayController.currentSession.reviveUsed = true;
    this.app.fire(EventTypes.ADD_BALLS, numBalls);
};

LevelController.prototype.handleReviveCanceled = function () {
    GameplayController.currentSession.reviveCanceled = true;
    if (!this.victoryTimer.active) {
        this.startDefeatTimer(0.5);
    }
};

LevelController.prototype.handlePremiumPackagePurchased = function (premiumBallsAmount) {
    this.cancelDefeatTimer();
    this.app.fire(EventTypes.ADD_PREMIUM_BALLS, premiumBallsAmount);
};

LevelController.prototype.createExplosion = function (worldPosition) {
    const explosionRadius = GameConfig.getAttribute('explosionRadius');
    const explosionForce = GameConfig.getAttribute('explosionForce');


    const explosionVFX = this.explosionPrefab.clone();
    this.effectsContainer.addChild(explosionVFX);
    explosionVFX.setPosition(worldPosition.clone().add(new pc.Vec3(0, 0, 0.5)));
    explosionVFX.setLocalScale(3, 3, 3);
    explosionVFX.enabled = true;
    explosionVFX.script.explosionVfx.explode();

    for (let i = this.objectsContainer.children.length - 1; i > -1; i--) {
        const child = this.objectsContainer.children[i];
        const childPosition = child.getPosition();
        const distance = childPosition.distance(worldPosition);
        if (distance <= explosionRadius) {
            child.rigidbody.applyImpulse(childPosition.clone().sub(worldPosition).normalize().scale(explosionForce / Math.pow(Math.max(distance, 1), GameConfig.getAttribute('explosionDampingFactor')) * child.rigidbody.mass), new pc.Vec3(pc.math.random(-0.05, 0.05), pc.math.random(-0.05, 0.05), pc.math.random(-0.05, 0.05)));
            if (child.itemType === Item.TYPE_GLASS) {
                child.script.item.breakBlock();
            }
        }
    }

    this.objectsContainer.children.forEach(child => child.rigidbody.activate());
};

LevelController.prototype.updateLevelProgress = function () {
    this.stageProgress = (this.totalObjectsOnStage - this.objectsContainer.children.length) / this.totalObjectsOnStage;
    this.levelProgress = (GameplayController.currentStage - 1) / GameplayController.totalStages + this.stageProgress / GameplayController.totalStages;
    
};

// materialConfig.js
/* jshint esversion: 6 */
var MaterialConfig = pc.createScript('materialConfig');

/* WOOD */
MaterialConfig.attributes.add('woodMass', {
    type: 'number',
    default: 1
});

MaterialConfig.attributes.add('woodFriction', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.8
});

MaterialConfig.attributes.add('woodRestitution', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.05
});

/* METAL */
MaterialConfig.attributes.add('metalMass', {
    type: 'number',
    default: 1
});

MaterialConfig.attributes.add('metalFriction', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.25
});

MaterialConfig.attributes.add('metalRestitution', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.65
});

/* GLASS */
MaterialConfig.attributes.add('glassMass', {
    type: 'number',
    default: 1
});

MaterialConfig.attributes.add('glassFriction', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.1
});

MaterialConfig.attributes.add('glassRestitution', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.1
});

/* EXPLOSIVE */
MaterialConfig.attributes.add('explosiveMass', {
    type: 'number',
    default: 1
});

MaterialConfig.attributes.add('explosiveFriction', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.5
});

MaterialConfig.attributes.add('explosiveRestitution', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.5
});

/* CONCRETE */
MaterialConfig.attributes.add('concreteMass', {
    type: 'number',
    default: 1
});

MaterialConfig.attributes.add('concreteFriction', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.5
});

MaterialConfig.attributes.add('concreteRestitution', {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.2
});


MaterialConfig.prototype.initialize = function() {
    MaterialConfig.app = this.app;
    MaterialConfig.instance = this;       
    
    Item.TYPE_SETTINGS = {};   
    Item.TYPE_SETTINGS[Item.TYPE_WOOD] = {friction: this.woodFriction, restitution: this.woodRestitution, massMultiplier: this.woodMass};
    Item.TYPE_SETTINGS[Item.TYPE_METAL] = {friction: this.metalFriction, restitution: this.metalRestitution, massMultiplier: this.metalMass};
    Item.TYPE_SETTINGS[Item.TYPE_GLASS] = {friction: this.glassFriction, restitution: this.glassRestitution, massMultiplier: this.glassMass};
    Item.TYPE_SETTINGS[Item.TYPE_EXPLOSIVE] = {friction: this.explosiveFriction, restitution: this.explosiveRestitution, massMultiplier: this.explosiveMass};
    Item.TYPE_SETTINGS[Item.TYPE_CONCRETE] = {friction: this.concreteFriction, restitution: this.concreteRestitution, massMultiplier: this.concreteMass};
};


// scoreManager.js
//@ts-nocheck
var ScoreManager = pc.createScript('scoreManager');

ScoreManager.prototype.initialize = function() {
    ScoreManager.instance = this;

    this.currentScores = 0;
    this.maxScores = 0;
    this.prevMaxScores = 0;
    this.prevTotalScore = 0;
    this.levelScores = {};
    
    this.app.on(EventTypes.ADD_SCORES, this.addScores, this);
    this.app.on(EventTypes.RESET_SCORES, this.resetScores, this);
    this.app.on(EventTypes.LEVEL_COMPLETED, this.onLevelCompleted, this);
};

ScoreManager.prototype.addScores = function(value, position) {
    this.currentScores += value;
    this.app.fire(EventTypes.SCORES_CHANGED, this.currentScores);
    
    if(this.maxScores < this.currentScores) {
        this.maxScores = this.currentScores;
        this.app.fire(EventTypes.MAX_SCORES_CHANGED, this.maxScores);
    }
    
    this.app.fire(EventTypes.SHOW_SCORES_EFFECT, value, position);
    
    
};

ScoreManager.prototype.resetScores = function() {
    this.currentScores = 0;
    this.app.fire(EventTypes.SCORES_CHANGED, this.currentScores);
    this.app.fire(EventTypes.MAX_SCORES_CHANGED, this.maxScores);
};

ScoreManager.prototype.getScores = function() {
    return this.currentScores;
};

ScoreManager.prototype.getMaxScores = function() {
    return this.maxScores;
};

ScoreManager.prototype.getPrevMaxScores = function() {
    return this.prevMaxScores;
};

ScoreManager.prototype.setScores = function(value) {
    this.currentScores = value;
    this.app.fire(EventTypes.SCORES_CHANGED, this.currentScores);
};

ScoreManager.prototype.setPrevMaxScores = function(value) {
    this.prevMaxScores = value;
};

ScoreManager.prototype.setMaxScores = function(value) {
    this.maxScores = value;
    this.prevMaxScores = value;
    this.app.fire(EventTypes.MAX_SCORES_CHANGED, this.maxScores);
};

ScoreManager.prototype.getPrevTotalScore = function() {
    return this.prevTotalScore || 0;
};


ScoreManager.prototype.onLevelCompleted = function() {
    const levelIndex = GameplayController.currentLevel;
    const score = this.currentScores;
    const prevBest = this.getBestLevelScore(levelIndex);
    if (score > prevBest) {
        this.prevTotalScore = this.getTotalScore();
        this.levelScores[levelIndex] = score;
        this.app.fire(EventTypes.SAVE_LEVEL_SCORES);
    }

    
    
};

ScoreManager.prototype.getLevelScores = function() {
    return this.levelScores;
};

ScoreManager.prototype.getBestLevelScore = function(levelIndex) {
    return this.levelScores[levelIndex] || 0;
};

ScoreManager.prototype.setLevelScores = function(scores) {
    this.levelScores = scores || {};
    this.prevTotalScore = this.getTotalScore();
};

ScoreManager.prototype.getTotalScore = function() {
    return Object.values(this.levelScores).reduce((sum, s) => sum + s, 0);
};

ScoreManager.prototype.update = function(dt) {
    
};



// terrain.js
//@ts-nocheck
var Terrain = pc.createScript('terrain');

Terrain.attributes.add('heightMap', {
    type: 'asset',
    assetType: 'texture'
});

Terrain.attributes.add('minHeight', {
    type: 'number',
    default: 0
});

Terrain.attributes.add('maxHeight', {
    type: 'number',
    default: 10
});

Terrain.attributes.add('width', {
    type: 'number',
    default: 100
});

Terrain.attributes.add('depth', {
    type: 'number',
    default: 100
});

Terrain.attributes.add('subdivisions', {
    type: 'number',
    default: 250
});

Terrain.attributes.add('randomAngle', {
    type: 'boolean',
    default: false
});


Terrain.attributes.add('material', {
    type: 'asset',
    assetType: 'material'
});


// initialize code called once per entity
Terrain.prototype.initialize = function () {
    this.createDynamicTerrain();
};

Terrain.prototype.createDynamicTerrain = function () {
    if(!this.heightMap || !this.heightMap.resource) return;
    const img = this.heightMap.resource.getSource();
    const renderModel = this.createTerrainFromHeightMap(img, this.subdivisions);
    const collisionModel = this.createTerrainFromHeightMap(img, this.subdivisions / 2);

    this.entity.addComponent('model');
    this.entity.model.model = renderModel;

    this.entity.addComponent('collision', {
        type: 'mesh'
    });
    this.entity.collision.model = collisionModel;

    this.entity.addComponent('rigidbody', {
        friction: 0.5,
        type: 'static'
    });

    if (this.randomAngle) {
        this.entity.setLocalEulerAngles(0, pc.math.random(0, 360), 0);
    }
};

Terrain.prototype.createTerrainVertexData = function (options) {
    var positions = [];
    var uvs = [];
    var indices = [];
    var row, col;

    for (row = 0; row <= options.subdivisions; row++) {
        for (col = 0; col <= options.subdivisions; col++) {
            var position = new pc.Vec3((col * options.width) / options.subdivisions - (options.width / 2.0), 0, ((options.subdivisions - row) * options.height) / options.subdivisions - (options.height / 2.0));

            var heightMapX = (((position.x + options.width / 2) / options.width) * (options.bufferWidth - 1)) | 0;
            var heightMapY = ((1.0 - (position.z + options.height / 2) / options.height) * (options.bufferHeight - 1)) | 0;

            var pos = (heightMapX + heightMapY * options.bufferWidth) * 4;
            var r = options.buffer[pos] / 255.0;
            var g = options.buffer[pos + 1] / 255.0;
            var b = options.buffer[pos + 2] / 255.0;

            var gradient = r * 0.3 + g * 0.59 + b * 0.11;

            position.y = options.minHeight + (options.maxHeight - options.minHeight) * gradient;

            positions.push(position.x, position.y, position.z);
            uvs.push(col / options.subdivisions, 1.0 - row / options.subdivisions);
        }
    }

    for (row = 0; row < options.subdivisions; row++) {
        for (col = 0; col < options.subdivisions; col++) {
            indices.push(col + row * (options.subdivisions + 1));
            indices.push(col + 1 + row * (options.subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (options.subdivisions + 1));

            indices.push(col + row * (options.subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (options.subdivisions + 1));
            indices.push(col + (row + 1) * (options.subdivisions + 1));
        }
    }

    var normals = pc.calculateNormals(positions, indices);

    return {
        indices: indices,
        positions: positions,
        normals: normals,
        uvs: uvs
    };
};

Terrain.prototype.createTerrainFromHeightMap = function (img, subdivisions) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var bufferWidth = img.width;
    var bufferHeight = img.height;
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;

    context.drawImage(img, 0, 0);

    var buffer = context.getImageData(0, 0, bufferWidth, bufferHeight).data;
    var vertexData = this.createTerrainVertexData({
        width: this.width,
        height: this.depth,
        subdivisions: subdivisions,
        minHeight: this.minHeight,
        maxHeight: this.maxHeight,
        buffer: buffer,
        bufferWidth: bufferWidth,
        bufferHeight: bufferHeight
    });

    var node = new pc.GraphNode();
    var material = this.material.resource;

    var geometry = new pc.Geometry();
    geometry.positions = vertexData.positions;
    geometry.normals = vertexData.normals;
    geometry.uvs = vertexData.uvs;
    geometry.indices = vertexData.indices;

    var mesh = pc.Mesh.fromGeometry(this.app.graphicsDevice, geometry);

    var meshInstance = new pc.MeshInstance(node, mesh, material);

    var model = new pc.Model();
    model.graph = node;
    model.meshInstances.push(meshInstance);

    return model;
};


// cameraController.js
//@ts-nocheck
var CameraController = pc.createScript('cameraController');

const TWEENS_LIST = [
    { 'Linear': 'Linear' },
    { 'QuadraticIn': 'QuadraticIn' },
    { 'QuadraticOut': 'QuadraticOut' },
    { 'QuadraticInOut': 'QuadraticInOut' },
    { 'CubicIn': 'CubicIn' },
    { 'CubicOut': 'CubicOut' },
    { 'CubicInOut': 'CubicInOut' },
    { 'QuarticIn': 'QuarticIn' },
    { 'QuarticOut': 'QuarticOut' },
    { 'QuarticInOut': 'QuarticInOut' },
    { 'QuinticIn': 'QuinticIn' },
    { 'QuinticOut': 'QuinticOut' },
    { 'QuinticInOut': 'QuinticInOut' },
    { 'SineIn': 'SineIn' },
    { 'SineOut': 'SineOut' },
    { 'SineInOut': 'SineInOut' },
    { 'ExponentialIn': 'ExponentialIn' },
    { 'ExponentialOut': 'ExponentialOut' },
    { 'ExponentialInOut': 'ExponentialInOut' },
    { 'CircularIn': 'CircularIn' },
    { 'CircularOut': 'CircularOut' },
    { 'CircularInOut': 'CircularInOut' },
    { 'BackIn': 'BackIn' },
    { 'BackOut': 'BackOut' },
    { 'BackInOut': 'BackInOut' },
    { 'BounceIn': 'BounceIn' },
    { 'BounceOut': 'BounceOut' },
    { 'BounceInOut': 'BounceInOut' },
    { 'ElasticIn': 'ElasticIn' },
    { 'ElasticOut': 'ElasticOut' },
    { 'ElasticInOut': 'ElasticInOut' }
];

CameraController.attributes.add('reboundDistance', {
    title: "Rebound distance",
    type: 'number',
    default: 0.5
});

CameraController.attributes.add('reboundTween', {
    title: "Rebound tween",
    type: 'string',
    default: 'Linear',
    enum: TWEENS_LIST
});

CameraController.attributes.add('reboundTweenDuration', {
    title: "Rebound duration",
    type: 'number',
    default: 0.1
});

CameraController.attributes.add('returnTween', {
    title: "Return tween",
    type: 'string',
    default: 'Linear',
    enum: TWEENS_LIST
});

CameraController.attributes.add('returnTweenDuration', {
    title: "Return duration",
    type: 'number',
    default: 0.15
});

CameraController.attributes.add('cameraPositionOnGameStart', {
    type: 'vec3',
    default: [0, 7.5, 45]
});

CameraController.attributes.add('cameraPositionDefault', {
    type: 'vec3',
    default: [0, 5.5, 28]
});

CameraController.attributes.add('cameraRotationDefault', {
    type: 'vec3',
    default: [2, 0, 0]
});

CameraController.attributes.add('cameraFOVDefault', {
    type: 'number',
    default: 45
});

CameraController.attributes.add('cannonPositionDefault', {
    type: 'vec3',
    default: [0, -1.8, -5]
});

CameraController.attributes.add('cameraPositionMobileLandscape', {
    type: 'vec3',
    default: [0, 5.5, 28]
});

CameraController.attributes.add('cameraRotationMobileLandscape', {
    type: 'vec3',
    default: [2, 0, 0]
});

CameraController.attributes.add('cameraFOVMobileLandscape', {
    type: 'number',
    default: 25
});

CameraController.attributes.add('cannonPositionMobileLandscape', {
    type: 'vec3',
    default: [0, -2.5, -8]
});


CameraController.getInstance = function () {
    if (!CameraController._instance) console.error('CameraController is not initialized yet');
    return CameraController._instance;
};


CameraController.prototype.initialize = function () {
    CameraController._app = this.app;
    if (!CameraController._instance) {
        CameraController._instance = this;
    }

    /* force active camera to be the main camera */
    this.activeCamera = this.entity;

    this.initialPosition = ScaleManager.getInstance().isMobileLandscape() ? this.cameraPositionMobileLandscape : this.cameraPositionDefault;
    this.initialAngles = ScaleManager.getInstance().isMobileLandscape() ? this.cameraRotationMobileLandscape : this.cameraRotationDefault;
    this.shakeTimer = 0;
    this.shakeIntencity = 0;
    this.cannon = this.entity.findByName('Cannon');

    this.on('attr', () => this.handleViewportResized());
    this.handleViewportResized();

    this.app.on(EventTypes.PLAY_PRESSED, this.flyCameraToItsTargetPosition, this);
    this.app.on(EventTypes.REBOUND_CAMERA, this.rebound, this);
    this.app.on(EventTypes.SHAKE_CAMERA, this.shakeCamera, this);
    this.app.on(EventTypes.Screen.RESIZED, this.handleViewportResized, this);
    this.app.on(EventTypes.EXIT_TO_MAIN_MENU, this.exitToMainMenu, this);
};

CameraController.prototype.getActiveCamera = function () {
    return this.activeCamera;
};


CameraController.prototype.exitToMainMenu = function () {
    Utils.tweenPosition(this.entity, this.cameraPositionOnGameStart, 0.5, pc.SineOut);
    Utils.tweenAngles(this.entity, this.cameraRotationDefault, 0.5, pc.SineOut);
    this.hideCannon();
};

CameraController.prototype.update = function (dt) {
    if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        if (this.shakeTimer <= 0) {
            this.shakeTimer = 0;
            this.entity.setLocalPosition(this.initialPosition.clone());
            this.entity.setLocalEulerAngles(this.initialAngles.clone());
        } else {
            this.entity.setLocalPosition(this.initialPosition.x + pc.math.random(-this.shakeIntencity, this.shakeIntencity), this.initialPosition.y + pc.math.random(-this.shakeIntencity, this.shakeIntencity), this.initialPosition.z + pc.math.random(-this.shakeIntencity, this.shakeIntencity));
            this.entity.setLocalEulerAngles(this.initialAngles.x + pc.math.random(-this.shakeIntencity, this.shakeIntencity) * 4, this.initialAngles.y + pc.math.random(-this.shakeIntencity, this.shakeIntencity) * 4, this.initialAngles.z + pc.math.random(-this.shakeIntencity, this.shakeIntencity) * 4);
        }
    }
};

CameraController.prototype.flyCameraToItsTargetPosition = function () {
    this.entity.tween(this.entity.getLocalPosition())
        .to(ScaleManager.getInstance().isMobileLandscape() ? this.cameraPositionMobileLandscape : this.cameraPositionDefault, 0.5, pc.SineOut)
        .onComplete(() => {
            this.showCannon();
        })
        .start();
};

CameraController.prototype.showCannon = function () {
    this.cannon.enabled = true;

    const cannonTargetPosition = ScaleManager.getInstance().isMobileLandscape() ? this.cannonPositionMobileLandscape : this.cannonPositionDefault;
    this.cannon.setLocalPosition(cannonTargetPosition.x, cannonTargetPosition.y - 1.2, cannonTargetPosition.z);
    this.cannon.tween(this.cannon.getLocalPosition())
        .to(new pc.Vec3(cannonTargetPosition.x, cannonTargetPosition.y, cannonTargetPosition.z), 0.25, pc.BackOut)
        .onComplete(() => {
        })
        .start();

    GameplayController.gameStarted = true;
    this.app.fire(EventTypes.SHOW_BALLS_BOX);
};

CameraController.prototype.hideCannon = function () {
    this.cannon.enabled = false;
    this.app.fire(EventTypes.HIDE_BALLS_BOX);
};

CameraController.prototype.shakeCamera = function (duration, intencity) {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeIntencity = intencity || 0.1;
};

CameraController.prototype.rebound = function () {
    if (this.reboundDistance === 0) {
        return;
    }

    if (this.cameraReboundTween && this.cameraReboundTween.playing) {
        this.cameraReboundTween.stop();
    }

    if (this.cameraReturnTween && this.cameraReturnTween.playing) {
        this.cameraReturnTween.stop();
    }

    this.cameraReboundTween = this.entity.tween(this.entity.getLocalPosition())
        .to(this.initialPosition.clone().add(new pc.Vec3(0, 0, this.reboundDistance)), this.reboundTweenDuration, pc[this.reboundTween]);

    this.cameraReturnTween = this.entity.tween(this.entity.getLocalPosition())
        .to(this.initialPosition.clone(), this.returnTweenDuration, pc[this.returnTween]);

    this.cameraReboundTween.chain(this.cameraReturnTween).start();
};

CameraController.prototype.handleViewportResized = function () {

    this.cannonEntity = this.cannonEntity || this.entity.findByName('Cannon');

    if (ScaleManager.getInstance().isMobileLandscape()) {
        this.entity.setPosition(GameplayController.gameStarted ? this.cameraPositionMobileLandscape : this.cameraPositionOnGameStart);
        this.entity.setEulerAngles(this.cameraRotationMobileLandscape);
        this.entity.camera.fov = this.cameraFOVMobileLandscape;
        this.cannonEntity.setLocalPosition(this.cannonPositionMobileLandscape);
    } else {
        this.entity.setPosition(GameplayController.gameStarted ? this.cameraPositionDefault : this.cameraPositionOnGameStart);
        this.entity.setEulerAngles(this.cameraRotationDefault);
        this.entity.camera.fov = this.cameraFOVDefault;
        this.cannonEntity.setLocalPosition(this.cannonPositionDefault);
    }
    if (GameplayController.gameStarted) {
        this.initialPosition = this.entity.getLocalPosition().clone();
        this.initialAngles = this.entity.getLocalEulerAngles().clone();
    }
};

// levelManager.js
//@ts-nocheck
var LevelManager = pc.createScript('levelManager');

LevelManager.attributes.add('loadTestStage', {
    title: "Load test stage/prefab",
    type: 'boolean',
    default: false
});

LevelManager.attributes.add('testStage', {
    type: 'entity',
    title: 'Test stage (child of LevelsPrefabs)'
});

LevelManager.attributes.add('testPrefab', {
    type: 'asset',
    assetType: 'template',
    title: 'Test prefab'
});

LevelManager.attributes.add('forceRotationTest', {
    type: 'boolean',
    default: false,
    title: 'Force level rotation?'
});

LevelManager.attributes.add('enableStageTestMode', {
    type: 'boolean',
    default: false,
    title: 'Continuous stage test mode (N,P keys)'
});

LevelManager.attributes.add('displayTestLevelInfo', {
    type: 'boolean',
    default: true,
    title: 'Display test level info?'
});

LevelManager.getInstance = function () {
    if (!LevelManager._instance) console.error('LevelManager is not initialized yet');
    return LevelManager._instance;
};

LevelManager.prototype.initialize = function () {
    LevelManager._instance = this;

    this.levelsSamplesContainer = this.app.root.findByName("LevelsPrefabs");

    this.regularLevelsTemplates = [];
    this.bossLevelTemplates = [];

    this.levelsList = [];
    this.levelsMap = new Map();
    this.stages = [];

    this.regularLevelTemplates = [];
    this.bossLevelTemplates = [];
    this.applyLevelRotation = false;

    window.levelManager = this;
};

LevelManager.prototype.postInitialize = function () {
    this.findLevels();
    this.disableDebugStages();

    if(this.enableStageTestMode) {
        Utils.showAlert('Continuous stage test mode enabled, use N/P keys to switch stages');
    }

    this.on('attr:testStage', this.onTestStageChanged, this);
    this.on('attr:testPrefab', this.onTestPrefabChanged, this);
    this.on('attr:forceRotationTest', this.onForceRotationTestChanged, this);

    this.app.on(EventTypes.RESTART_REQUESTED, this.onRestartGameRequest, this);
};

LevelManager.prototype.onTestStageChanged = function () {
    this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
};

LevelManager.prototype.onTestPrefabChanged = function () {
    this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
};

LevelManager.prototype.onForceRotationTestChanged = function() {
    this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
};

LevelManager.prototype.onRestartGameRequest = async function () {
    if (PauseManager.getInstance().isPaused()) {
        await PauseManager.getInstance().resumeGame();
    }

    TransitionScreen.instance.transitionTo(() => {
        WindowManager.hideAll();
        WindowManager.settingsPanel.show();
        this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
    });
};

LevelManager.prototype.disableDebugStages = function () {
    this.levelsSamplesContainer.children.forEach(prefab => prefab.enabled = false);
    this.levelsSamplesContainer.enabled = false;
};

LevelManager.prototype.update = function (dt) {
    if(this.enableStageTestMode) {
        if(this.app.keyboard.wasPressed(pc.KEY_N)) {
            this.app.fire(EventTypes.DEBUG_LOAD_NEXT_STAGE);
        }
        if(this.app.keyboard.wasPressed(pc.KEY_P)) {
            this.app.fire(EventTypes.DEBUG_LOAD_PREVIOUS_STAGE);
        }
    }
    if (this.loadTestStage || this.enableStageTestMode) {
        if (this.app.keyboard && this.app.keyboard.wasPressed(pc.KEY_R)) {
            this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
        }
    }
};

LevelManager.prototype.isCustomGeneratedLevel = function () {
    return this.lastLevelIsCustom;
};

LevelManager.prototype.findLevels = function () {
    this.stagesData = LevelStorage.getInstance().getStagesList();
    this.levels = [];
    this.levelsList = [];
    this.levelsMap = new Map();
    this.stagesData.forEach(stageData => {
        const { stageNumber, levels, bossLevel } = stageData;
        const levelStages = [];
        this.levels.push(levelStages);
        levels.forEach(level => {
            if (level && level.resource) {
                levelStages.push(level);
                this.regularLevelTemplates.push(level);
            }
        });
        if (bossLevel && bossLevel.resource) {
            levelStages.push(bossLevel);
            this.bossLevelTemplates.push(bossLevel);
        }
        this.levelsList.push(...levelStages);
        levelStages.forEach(stage => {
            this.levelsMap.set(stage.name, stage);
        });
    });

    // console.log('Regular levels templates: ', this.regularLevelsTemplates);
    // console.log('Boss level templates: ', this.bossLevelTemplates);
    // console.log('Levels data: ', this.levels);
};

LevelManager.prototype.getLevelPrefabByName = function (levelName) {
    let levelPrefab = this.levelsMap.get(levelName);
    if (!levelPrefab) {
        console.error('Level prefab not found: ', levelName);
        levelPrefab = this.getRandomLevelPrefab();
    }
    return levelPrefab;
};

LevelManager.prototype.getRandomLevelPrefab = function () {
    return Utils.getRandomItem(this.levelsList);
};

LevelManager.prototype.getGeneratedLevel = function (levelNumber) {
    const legacyLevelData = LocalStorageController.legacyLevelData;
    if(legacyLevelData && legacyLevelData.levelNumber === levelNumber) {
        return this.restoreLegacyLevel(legacyLevelData, levelNumber);
    }
    return this.generateRandomLevel(levelNumber);
};

LevelManager.prototype.restoreLegacyLevel = function (legacyLevelData, levelNumber) {
    try {
        this.applyLevelRotation = legacyLevelData.applyRotation ?? this.applyLevelRotation;
        const level = { levelNumber: legacyLevelData.levelNumber, stages: [], applyRotation: legacyLevelData.applyRotation ?? this.applyLevelRotation };
        legacyLevelData.stageNames.forEach(stageName => {
            level.stages.push(this.getLevelPrefabByName(stageName));
        });
        return level.stages;
    } catch (e) {
        console.error('Error restoring legacy level: ', e);
        return this.generateRandomLevel(levelNumber);
    } 
};

// Mulberry32 seeded PRNG - returns a function that yields floats in [0, 1).
// Seeding with levelNumber guarantees level X is identical for every user.
LevelManager.prototype._makeRng = function (seed) {
    return () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// Fisher-Yates shuffle using the provided rng; returns a new array.
LevelManager.prototype._seededShuffle = function (array, rng) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
};

LevelManager.prototype.generateRandomLevel = function (levelNumber) {
    const rng = this._makeRng(levelNumber);

    this.applyLevelRotation = (Math.floor((levelNumber - 1) / this.stagesData.length) % 2) === 1;

    const range = Constants.STAGES_PER_LEVEL_MAX - Constants.STAGES_PER_LEVEL_MIN + 1;
    const numStages = Constants.STAGES_PER_LEVEL_MIN + Math.floor(rng() * range);

    const shuffledRegular = this._seededShuffle(this.regularLevelTemplates, rng);
    const shuffledBoss = this._seededShuffle(this.bossLevelTemplates, rng);

    const level = { levelNumber, stages: [], applyRotation: this.applyLevelRotation };
    for (let i = 0; i < numStages - 1; i++) {
        level.stages.push(shuffledRegular[i % shuffledRegular.length]);
    }
    level.stages.push(shuffledBoss[0]);
    return level.stages;
};

LevelManager.prototype.getLevel = function (levelIndex) {
    if (this.levels[levelIndex - 1]) {
        this.lastLevelIsCustom = false;
        return this.levels[levelIndex - 1];
    } else {
        this.lastLevelIsCustom = true;
        const generatedLevel = this.getGeneratedLevel(levelIndex);
        return generatedLevel;
    }
};

LevelManager.prototype.getStagePrefab = function (topIndex, subIndex) {
    if (this.loadTestStage) {
        if (this.testStage) {
            const message = 'Loading test stage: ' + this.testStage.name;
            if(this.displayTestLevelInfo) {
                Utils.showAlert(message);
            } else {
                console.warn(message);
            }
            return this.testStage;
        } else if(this.testPrefab) {
            const message = 'Loading test prefab: ' + this.testPrefab.name;
            if(this.displayTestLevelInfo) {
                Utils.showAlert(message);
            } else {
                console.warn(message);
            }
            return this.testPrefab;
        } else {
            Utils.showAlert("Uncheck 'load test stage' mark or select test stage!");
            return null;
        }
    } else {
        const levelData = this.getLevel(topIndex);
        const stageData = levelData[subIndex - 1];
        if (!stageData) {
            return Utils.getRandomItem(this.regularLevelTemplates);
        }
        return stageData;
    }
    return null;
};


LevelManager.prototype.isTestingMode = function () {
    return this.loadTestStage || this.shouldRotateTestLevel();
};

LevelManager.prototype.shouldRotateTestLevel = function () {
    return this.forceRotationTest;
};


// explosionVFX.js
var ExplosionVfx = pc.createScript('explosionVfx');

ExplosionVfx.prototype.initialize = function() {
    this.mainVfx = this.entity.particlesystem;
    this.smokeVfx = this.entity.findByName("ExplosionSmoke").particlesystem;
};


ExplosionVfx.prototype.update = function(dt) {
    if(this.exploded) {
        this.timeSinceEnabled += dt;
        if (this.timeSinceEnabled > 2.5) {
            this.entity.destroy();
        }    
    }
   
};

ExplosionVfx.prototype.explode = function() {
    this.exploded = true;
    this.timeSinceEnabled = 0;
    
    this.mainVfx.reset();
    this.mainVfx.play();

    this.smokeVfx.reset();
    this.smokeVfx.play();
    
    this.app.fire(EventTypes.SHAKE_CAMERA, 0.25, 0.15);
};


// motionLinear.js
/* jshint esversion: 6 */
var MotionLinear = pc.createScript('motionLinear');

MotionLinear.TWEENS_LIST = [
            { 'Linear': 'Linear' },
            { 'QuadraticIn': 'QuadraticIn' },
            { 'QuadraticOut': 'QuadraticOut' },
            { 'QuadraticInOut': 'QuadraticInOut' },
            { 'CubicIn': 'CubicIn' },
            { 'CubicOut': 'CubicOut' },
            { 'CubicInOut': 'CubicInOut' },
            { 'QuarticIn': 'QuarticIn' },
            { 'QuarticOut': 'QuarticOut' },
            { 'QuarticInOut': 'QuarticInOut' },
            { 'QuinticIn': 'QuinticIn' },
            { 'QuinticOut': 'QuinticOut' },
            { 'QuinticInOut': 'QuinticInOut' },
            { 'SineIn': 'SineIn' },
            { 'SineOut': 'SineOut' },
            { 'SineInOut': 'SineInOut' },
            { 'ExponentialIn': 'ExponentialIn' },
            { 'ExponentialOut': 'ExponentialOut' },
            { 'ExponentialInOut': 'ExponentialInOut' },
            { 'CircularIn': 'CircularIn' },
            { 'CircularOut': 'CircularOut' },
            { 'CircularInOut': 'CircularInOut' },
            { 'BackIn': 'BackIn' },
            { 'BackOut': 'BackOut' },
            { 'BackInOut': 'BackInOut' },
            { 'BounceIn': 'BounceIn' },
            { 'BounceOut': 'BounceOut' },
            { 'BounceInOut': 'BounceInOut' },
            { 'ElasticIn': 'ElasticIn' },
            { 'ElasticOut': 'ElasticOut' },
            { 'ElasticInOut': 'ElasticInOut' }
    ];


MotionLinear.attributes.add('axis', {
    type: 'string',
    default: 'x',
    enum: [
        {'x' : 'x'},
        {'y' : 'y'},
        {'z' : 'z'}
    ]
});

MotionLinear.attributes.add('min', {
    type: 'number',
    default: -2
});

MotionLinear.attributes.add('max', {
    type: 'number',
    default: 2
});

MotionLinear.attributes.add('speed', {
    type: 'number',
    default: 1,
    min: 0,
    max: 20
});

MotionLinear.attributes.add('direction', {
    type: 'number',
    default: 1,
    enum: [
        {'+' : 1},
        {'-' : -1}
    ]
});

MotionLinear.attributes.add('motionTween', {
    title: "Motion tween",
    type: 'string',
    default: 'Linear',
    enum: MotionLinear.TWEENS_LIST
});

MotionLinear.prototype.initialize = function() {
    this.initialLocalEulerAngles = this.entity.getLocalEulerAngles().clone();
    const position = this.entity.getLocalPosition()[this.axis];
    this.currentDirection = this.direction;
    this.minBound = position + this.min;
    this.maxBound = position + this.max;
    this.totalDistance = Math.abs(this.maxBound - this.minBound);
    this.currentProgress = (position - this.minBound) / this.totalDistance;
    this.lapTime = this.totalDistance / this.speed;
    this.makeChildrenKinematic(this.entity);
};

MotionLinear.prototype.update = function(dt) {
    
    this.currentProgress = this.currentProgress + (dt / this.lapTime) * this.currentDirection;
    if(this.currentProgress < 0) {
        this.currentProgress = 0;
        this.currentDirection = 1;
    } else if(this.currentProgress > 1) {
        this.currentProgress = 1;
        this.currentDirection = -1;
    }
        
    const position = this.entity.getLocalPosition();
    if(this.currentDirection > 0) {
        position[this.axis] = this.minBound + pc[this.motionTween](this.currentProgress) * this.totalDistance;
    } else {
        position[this.axis] = this.minBound + (1 - pc[this.motionTween](1 - this.currentProgress)) * this.totalDistance;
    }
    
    this.entity.setLocalPosition(position);
    
    if(!this.entity.script.motionRotating) {
        this.entity.setLocalEulerAngles(this.initialLocalEulerAngles);
    }
};

MotionLinear.prototype.makeChildrenKinematic = function(entity) {
    if(entity.rigidbody) {
        if(entity.rigidbody.type != pc.BODYTYPE_KINEMATIC) {
            entity.rigidbody.type = pc.BODYTYPE_KINEMATIC;
        }
        entity.rigidbody.friction = GameConfig.getAttribute('movingStandFriction');
        entity.rigidbody.restitution = GameConfig.getAttribute('movingStandRestitution');
    }
    entity.children.forEach(child => this.makeChildrenKinematic(child));
};

// motionRotating.js
/* jshint esversion: 6 */
var MotionRotating = pc.createScript('motionRotating');

MotionRotating.attributes.add('axis', {
    type: 'string',
    default: 'y',
    enum: [
        {'x' : 'x'},
        {'y' : 'y'},
        {'z' : 'z'}
    ]
});

MotionRotating.attributes.add('speed', {
    type: 'number',
    title: 'speed (deg per sec.)',
    default: 90,
});

MotionRotating.attributes.add('direction', {
    type: 'number',
    default: 1,
    enum: [
        {'+' : 1},
        {'-' : -1}
    ]
});


MotionRotating.prototype.initialize = function() {
    this.makeChildrenKinematic(this.entity);
};


MotionRotating.prototype.update = function(dt) {
    
    const frameRotation = this.speed * dt * this.direction;
    if(this.axis === 'x') {
        this.entity.rotateLocal(frameRotation, 0, 0);       
    } else if(this.axis === 'y') {
        this.entity.rotateLocal(0, frameRotation, 0);       
    } else {
        this.entity.rotateLocal(0, 0, frameRotation);      
    }
};


MotionRotating.prototype.makeChildrenKinematic = function(entity) {
    if(entity.rigidbody) {
        if(entity.rigidbody.type != pc.BODYTYPE_KINEMATIC) {
            entity.rigidbody.type = pc.BODYTYPE_KINEMATIC;
        }
        entity.rigidbody.friction = GameConfig.getAttribute('movingStandFriction');
        entity.rigidbody.restitution = GameConfig.getAttribute('movingStandRestitution');
    }
    entity.children.forEach(child => this.makeChildrenKinematic(child));
};



// stageConfig.js
// @ts-nocheck
var StageConfig = pc.createScript('stageConfig');

StageConfig.attributes.add('numBalls', {
    title: 'Balls',
    type: 'number',
    default: 25
});

StageConfig.attributes.add('additionalBalls', {
    title: 'Additional balls (not for randomly generated levels)',
    type: 'number',
    default: 0,
    description: 'Additional balls will be added when the level is played first time'
});

StageConfig.attributes.add('rotatedBalls', {
    title: 'Rotated mode balls (0 to keep original amount)',
    type: 'number',
    default: 0
});

StageConfig.attributes.add('bossLevel', {
    title: 'Boss level',
    type: 'boolean',
    default: false
});

StageConfig.attributes.add('disableRandomRotation', {
    title: 'Disable rotation',
    type: 'boolean',
    default: false
});

StageConfig.attributes.add('overridePhysicsConfiguration', {
    title: 'Override physics configuration',
    type: 'boolean',
    default: false
});

StageConfig.attributes.add('fixedTimeStep', {
    type: 'number',
    default: 1/30,
    min: 0,
    max: 1,
    precision: 4
});

StageConfig.attributes.add('maxSubSteps', {
    type: 'number',
    default: 10,
    min: 1,
    max: 25,
    step: 1,
    precision: 0
});


StageConfig.prototype.initialize = function() {
    
};

StageConfig.prototype.update = function(dt) {
    
};



// levelProgressContainer.js
//@ts-nocheck
var LevelProgressContainer = pc.createScript('levelProgressContainer');

LevelProgressContainer.LANDSCAPE = 'landscape';
LevelProgressContainer.PORTRAIT = 'portrait';

LevelProgressContainer.attributes.add('orientation', {
    type: 'string',
    default: LevelProgressContainer.PORTRAIT,
    enum: [
        {'portrait' : LevelProgressContainer.PORTRAIT},
        {'landscape' : LevelProgressContainer.LANDSCAPE}
    ]
});

LevelProgressContainer.attributes.add('bestScoresEnabled', {
    type: 'boolean',
    default: true
});

LevelProgressContainer.attributes.add('LEVEL_PLATE_INITIAL_X', {
    type: 'number',
    default: 38
});

LevelProgressContainer.attributes.add('LEVEL_PLATE_INITIAL_Y', {
    type: 'number',
    default: 38
});

LevelProgressContainer.attributes.add('STAGE_PLATE_WIDTH', {
    type: 'number',
    default: 58
});

LevelProgressContainer.attributes.add('STAGE_PLATE_HEIGHT', {
    type: 'number',
    default: 58
});

LevelProgressContainer.attributes.add('completedStagePrefab', {
    type: 'entity'
});

LevelProgressContainer.attributes.add('currentStagePrefab', {
    type: 'entity'
});

LevelProgressContainer.attributes.add('nextStagePrefab', {
    type: 'entity'
});

LevelProgressContainer.prototype.initialize = function() {
    this.barContainer = this.entity.findByName('BarContainer');
    this.stages = this.entity.findByName('Stages');
    this.currentLevelPlate = this.entity.findByName('CurrentLevel');
    this.currentLevelText = this.currentLevelPlate.findByName('LevelText');
    this.nextLevelPlate = this.entity.findByName('NextLevel');
    this.nextLevelText = this.nextLevelPlate.findByName('LevelText');
    this.currentScoresText = this.entity.findByName('ScoresText');
    this.bestScoreGroup = this.entity.findByName("BestScoresGroup"); 
    this.bestScoreText = this.entity.findByName("BestScoresText"); 
    this.bestScoreIcon = this.entity.findByName("BestScoresIcon"); 
    
    this.app.on(EventTypes.LOAD_STAGE, this.rebuildInterface, this);
    this.app.on(EventTypes.Screen.RESIZED, this.rebuildInterface, this);
    this.app.on(EventTypes.SCORES_CHANGED, (value) => this.currentScoresText.element.text = '' + value);
    this.app.on(EventTypes.MAX_SCORES_CHANGED, (value) => this.bestScoreText.element.text = '' + value);
       
    const scriptContext = this;
    
    this.entity.show = function() {
        this.enabled = true;
        
        if(scriptContext.orientation === LevelProgressContainer.PORTRAIT) {
            this.setLocalPosition(0, 30, 0);
            this.tween(this.getLocalPosition())
                .to(new pc.Vec3(0, -160, 0), 0.4, pc.BackOut)
                .delay(0.2)
                .start();
        } else {
            this.setLocalPosition(-250, 0, 0);
            this.tween(this.getLocalPosition())
                .to(new pc.Vec3(0, 0, 0), 0.4, pc.BackOut)
                .delay(0.2)
                .start();
        }
        
    }.bind(this.entity);
    
    this.entity.hide = function() {
         this.enabled = false;
    }.bind(this.entity);
    
    
    this.entity.enabled = false; 
};

LevelProgressContainer.prototype.update = function(dt) {
    
    
    
    

    this.bestScoreGroup.enabled = this.bestScoreGroup.enabled && this.bestScoresEnabled;
    
    let pos = this.bestScoreIcon.getLocalPosition();
    pos.x = this.bestScoreText.getLocalPosition().x - this.bestScoreText.element.width / 2 - 2;
    this.bestScoreIcon.setLocalPosition(pos);
};

LevelProgressContainer.prototype.rebuildInterface = function() {   
    /* clear stages */
    for(let i = this.stages.children.length - 1; i > -1; i--) {
        this.stages.children[i].destroy();        
    }
    
    const levelIndex = GameplayController.currentLevel;
    const stageIndex = GameplayController.currentStage;
    const totalStages = GameplayController.totalStages;
   
    /* build new ones */
    for(let i = totalStages; i >= 1; i--) {
        const stagePlate = i < stageIndex ? this.completedStagePrefab.clone() : i > stageIndex ? this.nextStagePrefab.clone() : this.currentStagePrefab.clone();
        if(this.orientation === LevelProgressContainer.PORTRAIT) {
            stagePlate.setLocalPosition(this.STAGE_PLATE_WIDTH * (i - totalStages / 2 - 0.5), 0, 0);
        } else {
            stagePlate.setLocalPosition(0, this.STAGE_PLATE_HEIGHT * (i - totalStages / 2 - 0.5), 0);
        }
        this.stages.addChild(stagePlate);
    }
    
    /* reposition current & next level plates */
    if(this.orientation === LevelProgressContainer.PORTRAIT) {
        this.currentLevelPlate.setLocalPosition(-this.LEVEL_PLATE_INITIAL_X - totalStages * this.STAGE_PLATE_WIDTH / 2, 0, 0);
        this.nextLevelPlate.setLocalPosition(this.LEVEL_PLATE_INITIAL_X + totalStages * this.STAGE_PLATE_WIDTH / 2, 0, 0);
    } else {
        this.currentLevelPlate.setLocalPosition(1, -this.LEVEL_PLATE_INITIAL_Y - totalStages * this.STAGE_PLATE_HEIGHT / 2, 0);
        this.nextLevelPlate.setLocalPosition(1, this.LEVEL_PLATE_INITIAL_Y + totalStages * this.STAGE_PLATE_HEIGHT / 2, 0);
        this.bestScoreGroup.setLocalPosition(0, this.LEVEL_PLATE_INITIAL_Y + totalStages * this.STAGE_PLATE_HEIGHT / 2 + 125, 0);
        this.currentScoresText.setLocalPosition(0, this.LEVEL_PLATE_INITIAL_Y + totalStages * this.STAGE_PLATE_HEIGHT / 2 + 75, 0);
    }
    
    /* scale to fint width in portrait mode */
     if(this.orientation === LevelProgressContainer.PORTRAIT) {
         let targetBarScale = pc.math.clamp(ScaleManager.getInstance().getScreenRatio() / ScaleManager.getInstance().getMinPortraitScreenRatio(), 0.5, 1);
         const barClampedScale = pc.math.clamp(500 / ((totalStages + 3) * this.STAGE_PLATE_WIDTH), 0.75, 1);
         if(barClampedScale < 1) targetBarScale = Math.min(targetBarScale, barClampedScale)
         this.barContainer.setLocalScale(targetBarScale, targetBarScale, targetBarScale);
     }
    
    /* update current & next level texts */
    this.currentLevelText.element.text = '' + levelIndex;
    this.nextLevelText.element.text = '' + (levelIndex + 1);
        
    /* switch between landscape and portrait modes */
    if((ScaleManager.getInstance().isMobileLandscape() && this.orientation != LevelProgressContainer.LANDSCAPE) || (!ScaleManager.getInstance().isMobileLandscape() && this.orientation != LevelProgressContainer.PORTRAIT)) {
        this.disableChildren();
    } else {
        this.enableChildren();
    }
};

LevelProgressContainer.prototype.disableChildren = function() {
    this.entity.children.forEach(c => c.enabled = false);
};

LevelProgressContainer.prototype.enableChildren = function() {
    this.entity.children.forEach(c => c.enabled = true);
};

// localStorageController.js
//@ts-nocheck
var LocalStorageController = pc.createScript('localStorageController');

LocalStorageController.prototype.initialize = function() {
    LocalStorageController.app = this.app;
    LocalStorageController.currentLocalStorage = window.localStorage;
    
    this.app.on(EventTypes.SAVE_APP, () => LocalStorageController.saveData(), this);
    this.app.on(EventTypes.SAVE_LEVEL_SCORES, () => LocalStorageController.saveLevelScores(), this);
};

LocalStorageController.prototype.update = function(dt) {
    
};

LocalStorageController.getSaveData = function() {    
    const saveData = {
        currentLevel: GameplayController.currentLevel,
        maxScores: ScoreManager.instance.getMaxScores(),
        qualityIndex: 2,
        audioEnabled: true, /* legacy */
        sfxVolume: SoundController.sfxStateLoaded ? SoundController.sfxVolume : 0.5,
        musicVolume: SoundController.musicStateLoaded ? SoundController.musicVolume : 0.5,
        premiumBalls: GameplayController.premiumBalls || 0,
        noAdsPurchased: GameplayController.noAdsPurchased || false,
    };     
    return saveData;
};

LocalStorageController.getSlotKey = function() {
    return "CannonBalls3D_" + Constants.GAME_VERSION;
};

LocalStorageController.getLevelsSlotKey = function() {
    return "CannonBalls3D_" + Constants.GAME_VERSION + '_levels';
};

LocalStorageController.getLevelScoresSlotKey = function() {
    return "CannonBalls3D_" + Constants.GAME_VERSION + '_levelScores';
};

LocalStorageController.saveData = function(immediately) {
    if(immediately) {
        var data = LocalStorageController.getSaveData();
        LocalStorageController.currentLocalStorage.setItem(LocalStorageController.getSlotKey(), JSON.stringify(data));    
    } else {
        setTimeout(() => {
            var data = LocalStorageController.getSaveData();
            LocalStorageController.currentLocalStorage.setItem(LocalStorageController.getSlotKey(), JSON.stringify(data));
        }, 50);
    }
};

LocalStorageController.loadData = function() {
    var data = LocalStorageController.currentLocalStorage.getItem(LocalStorageController.getSlotKey());
    var dataLoaded = false;
       
    if(data) {
        try {
            data = JSON.parse(data);
            dataLoaded = true;
        } catch (e) {
            data = LocalStorageController.getSaveData();
            LocalStorageController.saveData(true);
        }
    } else {
        data = LocalStorageController.getSaveData();
        LocalStorageController.saveData(true);
    }
    
    GameplayController.currentLevel = data.currentLevel;
    GameplayController.premiumBalls = data.premiumBalls || 0;
    GameplayController.noAdsPurchased = data.noAdsPurchased || false;
    ScoreManager.instance.setMaxScores(data.maxScores || 0);
    LocalStorageController._loadedSfxVolume = data.sfxVolume ?? 0.5;
    LocalStorageController._loadedMusicVolume = data.musicVolume ?? 0.5;

    LocalStorageController.loadLegacyLevelData();
    LocalStorageController.loadLevelScores();
};

LocalStorageController.saveLevelScores = function() {
    const data = ScoreManager.instance.getLevelScores();
    LocalStorageController.currentLocalStorage.setItem(
        LocalStorageController.getLevelScoresSlotKey(),
        JSON.stringify(data)
    );
};

LocalStorageController.loadLevelScores = function() {
    const raw = LocalStorageController.currentLocalStorage.getItem(LocalStorageController.getLevelScoresSlotKey());
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        ScoreManager.instance.setLevelScores(data);
    } catch (e) {
        ScoreManager.instance.setLevelScores({});
    }
};


LocalStorageController.loadLegacyLevelData = function() {
    const raw = LocalStorageController.currentLocalStorage.getItem(LocalStorageController.getLevelsSlotKey());
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        LocalStorageController.legacyLevelData = data;
    } catch (e) {
        LocalStorageController.legacyLevelData = null;
    }
};


LocalStorageController.getNoAdDiscountKey = function() {
    return "CannonBalls3D_noAdDiscount";
};

LocalStorageController.loadNoAdDiscountState = function() {
    const raw = LocalStorageController.currentLocalStorage.getItem(LocalStorageController.getNoAdDiscountKey());
    if (!raw) return { startedAt: null, activated: false };
    try {
        return JSON.parse(raw);
    } catch (e) {
        return { startedAt: null, activated: false };
    }
};

LocalStorageController.saveNoAdDiscountState = function(state) {
    LocalStorageController.currentLocalStorage.setItem(
        LocalStorageController.getNoAdDiscountKey(),
        JSON.stringify(state)
    );
};

// ballsManager.js
//@ts-nocheck
var BallsManager = pc.createScript('ballsManager');

BallsManager.attributes.add('positionBeforeLevelStart', {
    type: 'vec3',
    default: [-1.5, 0, 25]
});

BallsManager.attributes.add('cameraPositionDefault', {
    type: 'vec3',
    default: [-1.8, 0, 14.4]
});

BallsManager.attributes.add('cameraPositionMobileLandscape', {
    type: 'vec3',
    default: [-1.8, 0, 9]
});

BallsManager.attributes.add('signDefault', {
    type: 'entity',
});

BallsManager.attributes.add('signPremium', {
    type: 'entity',
});

BallsManager.attributes.add('ballsBoxEntity', {
    type: 'entity',
});

BallsManager.attributes.add('bombsBoxEntity', {
    type: 'entity',
});


BallsManager.getInstance = function () {
    if (!BallsManager._instance) console.error('BallsManager is not initialized yet');
    return BallsManager._instance;
};

BallsManager.prototype.initialize = function () {
    BallsManager._app = this.app;
    if (!BallsManager._instance) {
        BallsManager._instance = this;
    }

    if (!this.ballsBoxEntity) console.error('ballsBoxEntity not set on ' + this.entity.name);
    if (!this.bombsBoxEntity) console.error('bombsBoxEntity not set on ' + this.entity.name);

    this.infiniteBalls = false;
    this.bombPowerupActive = false;

    this.visibleSign = undefined;

    this.app.on(EventTypes.POWERUP_ACTIVATED, this.switchToBombs, this);
    this.app.on(EventTypes.BALL_SHOT, this.handleBallShot, this);
    this.app.on(EventTypes.BOMB_SHOT, this.handleBombShot, this);
    this.app.on(EventTypes.CREATE_BALLS, this.resetAndCreateBalls, this);
    this.app.on(EventTypes.ADD_BALLS, this.addBalls, this);
    this.app.on(EventTypes.ADD_PREMIUM_BALLS, this.addPremiumBalls, this);
    this.app.on(EventTypes.BALLS_AMOUNT_UPDATED, this.updateVisibleBallsAmount, this);
    this.app.on(EventTypes.Screen.RESIZED, this.handleViewportResized, this);
    this.app.on(EventTypes.SHOW_BALLS_BOX, this.showBallsBox, this);
    this.app.on(EventTypes.HIDE_BALLS_BOX, this.hideBallsBox, this);
    this.app.on(EventTypes.SET_PREMIUM_BALLS_AMOUNT_TEXT, this.onPremiumBallsAmountUpdated, this);

    this.initializeSigns();
    this.handleViewportResized();
};


BallsManager.prototype.postInitialize = function () {
    this.updatePremiumBallsAmount();
    this.updateSignsVisibility();   
    this.entity.enabled = false;
};


BallsManager.prototype.initializeSigns = function () {
    if (this.signDefault) {
        this.signDefault.enabled = true;
    } else {
        console.error('Sign/Default not set on ' + this.entity.name);
    }

    if (this.signPremium) {
        this.signPremium.enabled = true;
    } else {
        console.error('Sign/Premium not set on ' + this.entity.name);
    }
};



BallsManager.prototype.bombsActive = function () {
    return this.bombPowerupActive;
};


BallsManager.prototype.updateSignsVisibility = function () {
    const hasPremiumBalls = GameplayController.premiumBalls > 0;
    if (hasPremiumBalls) {   
        this._setVisibleSign(this.signPremium, this.signDefault);    
    } else {
        this._setVisibleSign(this.signDefault, this.signPremium);
    }
};

BallsManager.prototype._setVisibleSign = function (visibleSign, hiddenSign) {
    if (this.visibleSign != visibleSign) {
        this.visibleSign = visibleSign;
        visibleSign.show();
        hiddenSign.hide();
    }
};

BallsManager.prototype.onPremiumBallsAmountUpdated = function (amount) {
    this.updateSignsVisibility();
};


/* --- Bomb mode --- */

BallsManager.prototype.switchToBombs = function () {
    this.bombPowerupActive = true;
    const bombsAmount = GameConfig.getAttribute('bombsAmount');
    this.bombsBoxEntity.show();
    this.bombsBoxEntity.setBombsAmount(bombsAmount);
    this.app.fire(EventTypes.BALLS_AMOUNT_UPDATED, bombsAmount);
};

BallsManager.prototype.switchToBalls = function () {
    this.bombsBoxEntity.hide();

    if (this.bombPowerupActive) {
        this.bombPowerupActive = false;
        this.app.fire(EventTypes.POWERUP_DEACTIVATED);
    }

    this.app.fire(EventTypes.BALLS_AMOUNT_UPDATED, this.ballsBoxEntity.getRegularBallsAmount());
};


/* --- BallsBox show / hide (animated) --- */

BallsManager.prototype.showBallsBox = async function () {
    this.updateSignsVisibility();

    this.ballsBoxEntity.spawnBalls();
    await Utils.wait(0);

    this.entity.setLocalPosition(this.positionBeforeLevelStart);
    this.disableBodies(this.entity);
    this.disableBodies(this.ballsBoxEntity);

    this.entity.enabled = true;    
    await Utils.wait(100);

    this.ballsBoxEntity.disablePhysics();
    this.entity.tween(this.entity.getLocalPosition())
        .to(ScaleManager.getInstance().isMobileLandscape() ? this.cameraPositionMobileLandscape : this.cameraPositionDefault, 0.25, pc.SineOut)
        .onComplete(() => {
            this.enableBodies(this.entity);
            this.enableBodies(this.ballsBoxEntity);
            this.ballsBoxEntity.spawnBalls();
            this.ballsBoxEntity.enablePhysics();
        })
        .start();
};

BallsManager.prototype.hideBallsBox = function () {
    this.ballsBoxEntity.clearAll();
    this.entity.enabled = false;
};


/* --- Ball events --- */

BallsManager.prototype.resetAndCreateBalls = function (amount, infinite) {
    this.infiniteBalls = infinite;
    this.app.fire(EventTypes.SET_INFINITE_BALLS_MODE, this.infiniteBalls);
    const premiumLeft = Math.max((GameplayController.premiumBalls || 0), 0);
    this.ballsBoxEntity.createBalls(amount, premiumLeft);
    this.switchToBalls();
};

BallsManager.prototype.addBalls = function (amount) {
    this.app.fire('balls:refill:vfx');
    this.app.fire(EventTypes.PLAY_AUDIO, 'ballsRefill');

    this.ballsBoxEntity.addRegularBalls(amount);
    this.app.fire(EventTypes.BALLS_AMOUNT_UPDATED, this.ballsBoxEntity.getRegularBallsAmount(), true);
};

BallsManager.prototype.handleBallShot = function () {
    if (!this.infiniteBalls) {
        this.ballsBoxEntity.popBall();
    }

    const regularLeft = this.ballsBoxEntity.getRegularBallsAmount();
    const premiumLeft = this.ballsBoxEntity.getPremiumBallsAmount();
    const premiumChanged = GameplayController.premiumBalls !== premiumLeft;
    GameplayController.premiumBalls = premiumLeft;

    this.app.fire(EventTypes.BALLS_AMOUNT_UPDATED, regularLeft);
    this.app.fire(EventTypes.SET_PREMIUM_BALLS_AMOUNT_TEXT, premiumLeft);

    if (premiumChanged) {
        this.app.fire(EventTypes.SAVE_APP);
    }

    if (regularLeft <= 0 && premiumLeft <= 0) {
        this.app.fire(EventTypes.OUT_OF_BALLS);
    }
};

BallsManager.prototype.addPremiumBalls = function (amount) {
    const premiumToAdd = Math.max(Math.floor(amount || 0), 0);
    if (premiumToAdd <= 0) return;

    this.app.fire('balls:refill:vfx');
    this.app.fire(EventTypes.PLAY_AUDIO, 'ballsRefill');

    this.ballsBoxEntity.addPremiumBalls(premiumToAdd);

    const premiumLeft = this.ballsBoxEntity.getPremiumBallsAmount();
    GameplayController.premiumBalls = premiumLeft;
    this.app.fire(EventTypes.SET_PREMIUM_BALLS_AMOUNT_TEXT, premiumLeft, true);
    this.app.fire(EventTypes.SAVE_APP);
};

BallsManager.prototype.updateVisibleBallsAmount = function () {
    this.updateBallsAmountText();
    this.updatePremiumBallsAmount();
};

BallsManager.prototype.updateBallsAmountText = function () {
    this.app.fire(EventTypes.SET_BALLS_AMOUNT_TEXT, this.ballsBoxEntity.getRegularBallsAmount());
};

BallsManager.prototype.updatePremiumBallsAmount = function () {
    const premiumLeft = this.ballsBoxEntity ? this.ballsBoxEntity.getPremiumBallsAmount() : Math.max((GameplayController.premiumBalls || 0), 0);
    this.app.fire(EventTypes.SET_PREMIUM_BALLS_AMOUNT_TEXT, premiumLeft);
};


/* --- Bomb events --- */

BallsManager.prototype.handleBombShot = function () {
    this.bombsBoxEntity.popBomb();
    const bombsLeft = this.bombsBoxEntity.getBombsAmount();

    this.app.fire(EventTypes.BALLS_AMOUNT_UPDATED, bombsLeft);

    if (bombsLeft <= 0) {
        this.switchToBalls();
    }
};


/* --- Misc --- */

BallsManager.prototype.getRegularBallsAmount = function () {
    return this.ballsBoxEntity.getRegularBallsAmount();
};

BallsManager.prototype.getPremiumBallsAmount = function () {
    return this.ballsBoxEntity.getPremiumBallsAmount();
};

BallsManager.prototype.handleViewportResized = function () {
    this.entity.delayedCall(0, () => {
        this.disableBodies(this.entity);
        const position = ScaleManager.getInstance().isMobileLandscape() ? this.cameraPositionMobileLandscape : this.cameraPositionDefault;
        this.entity.setPosition(
            position.x,
            GameplayController.gameStarted ? position.y : position.y - 0.01,
            GameplayController.gameStarted ? position.z : position.z + 7.5
        );
        this.enableBodies(this.entity);
    });
};


BallsManager.prototype.disableBodies = function (entity) {
    if (entity.rigidbody) {
        entity.rigidbody.enabled = false;
    }
    entity.children.forEach(child => this.disableBodies(child));
};

BallsManager.prototype.enableBodies = function (entity) {
    if (entity.rigidbody) {
        const worldPosition = entity.getPosition().clone();
        const worldRotation = entity.getRotation().clone();
        entity.rigidbody.enabled = true;
        entity.rigidbody.teleport(worldPosition, worldRotation);
    }
    entity.children.forEach(child => this.enableBodies(child));
};


// basicButton.js
//@ts-nocheck
var BasicButton = pc.createScript('basicButton');

BasicButton.attributes.add('triggerEvent', {
    title: "Trigger event",
    type: 'string',
    enum: [
        {'up' : 'up'},
        {'down' : 'down'}
    ],
    default: 'up'
});

BasicButton.attributes.add('applyScalingTween', {
    title: "Apply scaling tween",
    type: 'boolean',
    default: true
});

BasicButton.attributes.add('defaultScale', {
    title: "Default scale",
    type: 'number',
    default: 1,
    min: 0.5,
    max: 1.5
});

BasicButton.attributes.add('hoverScale', {
    title: "Hover scale",
    type: 'number',
    default: 1.03,
    min: 0.5,
    max: 1.5
});

BasicButton.attributes.add('pressedScale', {
    title: "Pressed scale",
    type: 'number',
    default: 0.97,
    min: 0.5,
    max: 1.5
});

BasicButton.attributes.add('upScaleDuration', {
    title: "Tween duration",
    type: 'number',
    default: 0.085,
    min: 0.005,
    max: 1
});

BasicButton.attributes.add('clickSound', {
    title: "Play sound",
    type: 'boolean',
    default: true
});

BasicButton.prototype.initialize = function() {

    // Whether the element is currently hovered or not
    this.hovered = false;

    if(pc.platform.mobile && this.app.touch) {
        this.entity.element.on('touchstart', this.onPress, this);
        this.entity.element.on('touchend', this.onRelease, this);
    } else {
        this.entity.element.on('mouseenter', this.onEnter, this);
        this.entity.element.on('mousedown', this.onPress, this);
        this.entity.element.on('mouseup', this.onRelease, this);
        this.entity.element.on('mouseleave', this.onLeave, this);
    }
};


// When the cursor enters the element assign the hovered texture
BasicButton.prototype.onEnter = function (event) {
    this.hovered = true;
    
    if(this.applyScalingTween) {
        event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale), this.upScaleDuration, pc.Linear)
            .setIgnoreTimeScale(true)
            .start();
    }
    document.body.style.cursor = 'pointer';
};

BasicButton.prototype.onLeave = function (event) {
    this.hovered = false;
    
    if(this.applyScalingTween) {
         event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale, this.defaultScale, this.defaultScale), this.upScaleDuration, pc.Linear)
            .setIgnoreTimeScale(true)
            .start();
    }
   

    document.body.style.cursor = 'default';
};

// When we press the element assign the active texture
BasicButton.prototype.onPress = function (event) {
    event.stopPropagation();
    if(this.clickSound) {
        this.app.fire(EventTypes.PLAY_AUDIO, "click");
    }
    
    if(this.applyScalingTween) {
        event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale * this.pressedScale, this.defaultScale * this.pressedScale, this.defaultScale * this.pressedScale), this.upScaleDuration * 0.5, pc.SineOut)
            .setIgnoreTimeScale(true)
            .start();
    }
 };

BasicButton.prototype.onRelease = function (event) {
    if(this.applyScalingTween) {
         if(this.hovered) {
         event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale), this.upScaleDuration * 0.5, pc.Linear)
            .setIgnoreTimeScale(true)
            .start();
        } else {
            event.element.entity.tween(event.element.entity.getLocalScale())
                .to(new pc.Vec3(this.defaultScale, this.defaultScale, this.defaultScale), this.upScaleDuration * 0.5, pc.Linear)
                .setIgnoreTimeScale(true)
                .start();
        }
    }
};


BasicButton.assignAction = BasicButton.assignTapAction = function (button, handler, handlerContext) {
    const triggerOnDown = button.script && button.script.basicButton && button.script.basicButton.triggerEvent === 'down';

    if (pc.app.touch) {
        button.element.on('touchstart', (event) => {
            if(triggerOnDown) {
                handler.call(handlerContext, event);
            } else {
                button.inputDownParams = { x: event.touch.clientX, y: event.touch.clientY };
            }
        });
        button.element.on('touchend', (event) => {
            if(triggerOnDown) {
                return;
            }
            if (button.inputDownParams && Utils.distanceBetween(event.touch.clientX, event.touch.clientY, button.inputDownParams.x, button.inputDownParams.y) < 10) {
                handler.call(handlerContext, event);
            }
            button.inputDownParams = null;
        });
    }

    if (pc.app.mouse) {
        button.element.on('mousedown', (event) => {
            if(triggerOnDown) {
                handler.call(handlerContext, event);
            } else {
                button.inputDownParams = { x: event.x, y: event.y };
            }
        });
        button.element.on('mouseup', (event) => {
            if(triggerOnDown) {
                return;
            }
            if (button.inputDownParams && Utils.distanceBetween(event.x, event.y, button.inputDownParams.x, button.inputDownParams.y) < 10) {
                handler.call(handlerContext, event);
            }
            button.inputDownParams = null;
        });
    }
};

// resultsWindow.js
//@ts-nocheck
var ResultsWindow = pc.createScript('resultsWindow');

ResultsWindow.prototype.initialize = function () {

    this.entity.headingIcon = this.entity.findByName("HeadingIcon");
    this.entity.buttonNext = this.entity.findByName("ButtonNext");
    this.entity.background = this.entity.findByName("Background");
    this.entity.textsContainer = this.entity.findByName("TextsContainer");
    this.entity.scoreGroup = this.entity.findByName("ScoreGroup");
    this.entity.maxScoreGroup = this.entity.findByName("MaxScoreGroup");
    this.entity.newBestScoreIcon = this.entity.maxScoreGroup.findByName("NewBestScoreIcon");
    this.entity.scoreText = this.entity.scoreGroup.findByName("Text");
    this.entity.maxScoreText = this.entity.maxScoreGroup.findByName("Text");

    BasicButton.assignAction(this.entity.buttonNext, this.nextPressed, this);

    const scriptContext = this;

    /* show method */
    this.entity.show = function () {
        this.enabled = true;

        scriptContext.app.fire(EventTypes.SAVE_APP);
        scriptContext.app.fire(EventTypes.PLAY_AUDIO, "victory");

        if (scriptContext.buttonNextTween && scriptContext.buttonNextTween.playing) {
            scriptContext.buttonNextTween.stop();
        }

        this.buttonNext.setLocalScale(0, 0, 0);

        const showButtons = (delay) => {
            /* tween buttons */
            scriptContext.buttonNextTween = this.buttonNext
                .tween(this.buttonNext.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.5, pc.BackOut)
                .delay(delay)
                .start();
        };

        showButtons(1.4);

        /* tween background */
        this.background.element.opacity = 0.0;
        this.background.tween(this.background.element)
            .to({ opacity: 0.94 }, 0.25, pc.Linear)
            .start();

        /* tween heading icon */
        this.headingIcon.element.opacity = 0.0;
        var headingAppearingTween =
            this.headingIcon.tween(this.headingIcon.element)
                .to({ opacity: 0.9 }, 0.5, pc.Linear)
                .delay(0.25);

        this.headingIcon.setLocalPosition(0, -360, 0);
        var headingMovingTween =
            this.headingIcon.tween(this.headingIcon.getLocalPosition())
                .to(new pc.Vec3(0, 0, 0), 0.9, pc.SineOut)
                .delay(0.2);

        headingAppearingTween.chain(headingMovingTween).start();

        this.headingIcon.setLocalScale(0.5, 0.5, 0.5);
        var headingAppearingScaleTween =
            this.headingIcon.tween(this.headingIcon.getLocalScale())
                .to(new pc.Vec3(1.5, 1.5, 1.5), 0.55, pc.BackOut)
                .delay(0.25);

        var headingMovingScaleTween =
            this.headingIcon.tween(this.headingIcon.getLocalScale())
                .to(new pc.Vec3(1.0, 1.0, 1.0), 0.9, pc.SineOut)
                .delay(0.1);

        headingAppearingScaleTween.chain(headingMovingScaleTween).start();

        {
            this.textsContainer.enabled = true;

            /* tween text groups */
            this.scoreGroup.setLocalScale(0, 0, 0);
            this.scoreGroup.tween(this.scoreGroup.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.45, pc.BackOut)
                .delay(1.35)
                .start();

            this.maxScoreGroup.setLocalScale(0, 0, 0);
            this.maxScoreGroup.tween(this.maxScoreGroup.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.45, pc.BackOut)
                .delay(1.5)
                .start();

            /* tween texts */

            const prevTotalScore = ScoreManager.instance.getPrevTotalScore();
            const totalScore = ScoreManager.instance.getTotalScore();
            const duration = totalScore > prevTotalScore ? 1.25 : 0.75;

            const textTweenDelay = 1.75;
            if (ScoreManager.instance.getScores() > 0) {
                this.delayedCall(textTweenDelay * 1000, () => scriptContext.app.fire(EventTypes.PLAY_AUDIO, "counting", 0.9));
                this.delayedCall((textTweenDelay + duration) * 1000, () => scriptContext.app.fire(EventTypes.STOP_AUDIO, "counting"));
            }

            
            Utils.tweenText(this.scoreText, 0, ScoreManager.instance.getScores(), 0.75, textTweenDelay, pc.SineOut, true);
            Utils.tweenText(this.maxScoreText, prevTotalScore, totalScore, 1.0, textTweenDelay + 0.25, pc.SineOut, true);
            ScoreManager.instance.setPrevMaxScores(ScoreManager.instance.getMaxScores());

            this.newBestScoreIcon.element.opacity = 0;
            this.newBestScoreIcon.setLocalScale(2, 2, 2);
            if (totalScore > prevTotalScore) {
                this.newBestScoreIcon.tween(this.newBestScoreIcon.element)
                    .to({ opacity: 1 }, 0.3, pc.Linear)
                    .delay(textTweenDelay + duration)
                    .onComplete(() => {
                        if (this.enabled) {
                            scriptContext.app.fire(EventTypes.PLAY_AUDIO, 'newBest');
                        }
                    })
                    .onUpdate(() => {
                        this.newBestScoreIcon.setLocalPosition(this.maxScoreText.element.width + 66, 0, 0);
                    })
                    .start();

                this.newBestScoreIcon.tween(this.newBestScoreIcon.getLocalScale())
                    .to(new pc.Vec3(1, 1, 1), 0.42, pc.BackOut)
                    .delay(textTweenDelay + duration)
                    .start();
            }
        }

    }.bind(this.entity);


    /* hide method */
    this.entity.hide = function () {
        this.enabled = false;
    }.bind(this.entity);

    this.entity.hide();
};

ResultsWindow.prototype.update = function (dt) {

};

ResultsWindow.prototype.nextPressed = async function () {
    

    TransitionScreen.instance.transitionTo(() => {
        this.entity.hide();
        this.app.fire(EventTypes.LOAD_NEXT_LEVEL);
    });
};

// windowManager.js
///@ts-nocheck
var WindowManager = pc.createScript('windowManager');

WindowManager.prototype.initialize = function() {
    WindowManager.app = this.app;
    this.uiContainer = this.app.root.findByName("UIContainer");
    
    WindowManager.settingsWindow = this.app.root.findByName("UIContainer").findByName("SettingsWindow");
    WindowManager.resultsWindow = this.uiContainer.findByName("ResultsWindow");
    WindowManager.defeatWindow = this.uiContainer.findByName("DefeatWindow");
    
    WindowManager.levelUI = this.uiContainer.findByName("LevelUI");
    WindowManager.settingsPanel = this.uiContainer.findByName("SettingsPanel");
    WindowManager.mainMenu = this.uiContainer.findByName("MainMenu");
    
    
    
    // WindowManager.gameplayUI = this.uiContainer.findByName("GamePlayUI");
    
    this.app.on(EventTypes.APP_LOADED, this.onAppLoaded, this);
};


WindowManager.prototype.onAppLoaded = function() {
    WindowManager.mainMenu.show();
};

WindowManager.prototype.update = function(dt) {
    
};

WindowManager.hideAll = function() {  
    WindowManager.resultsWindow.hide();  
    WindowManager.defeatWindow.hide();
    
    WindowManager.settingsPanel.hide();  
    WindowManager.mainMenu.hide();
    WindowManager.settingsWindow.hide();
    
    
    
    // WindowManager.gameplayUI.hide();  
};









WindowManager.showResults = function() {    
    WindowManager.resultsWindow.show();  
};

WindowManager.showDefeat = function() {    
    WindowManager.defeatWindow.show();  
};

WindowManager.showSettings = function() {
    WindowManager.settingsWindow.show();  
};





WindowManager.startGameplay = function() {   
    WindowManager.mainMenu.hide();
    WindowManager.levelUI.show();
    WindowManager.settingsPanel.show();
};

WindowManager.exitToMainMenu = function() { 
    /* hide level UI */
    WindowManager.levelUI.hide();
    WindowManager.hideAll();

    /* show main menu */
    WindowManager.mainMenu.show(); 
    WindowManager.settingsPanel.show();
};


WindowManager.hasOpenedWindows = function (){return WindowManager.resultsWindow.enabled || WindowManager.defeatWindow.enabled || WindowManager.settingsWindow.enabled;}; 

// defeatWindow.js
//@ts-nocheck
var DefeatWindow = pc.createScript('defeatWindow');

DefeatWindow.prototype.initialize = function () {

    this.entity.headingIcon = this.entity.findByName("HeadingIcon");
    this.entity.buttonRestart = this.entity.findByName("ButtonRestart");
    this.entity.background = this.entity.findByName("Background");
    this.entity.textsContainer = this.entity.findByName("TextsContainer");
    this.entity.scoreGroup = this.entity.findByName("ScoreGroup");
    this.entity.maxScoreGroup = this.entity.findByName("MaxScoreGroup");
    this.entity.newBestScoreIcon = this.entity.maxScoreGroup.findByName("NewBestScoreIcon");
    this.entity.scoreText = this.entity.scoreGroup.findByName("Text");
    this.entity.maxScoreText = this.entity.maxScoreGroup.findByName("Text");

    BasicButton.assignAction(this.entity.buttonRestart, this.restartPressed, this);

    const scriptContext = this;

    /* show method */
    this.entity.show = function () {
        this.enabled = true;

        scriptContext.app.fire(EventTypes.SAVE_APP);
        scriptContext.app.fire(EventTypes.PLAY_AUDIO, "defeat");

        if (scriptContext.buttonRestartTween && scriptContext.buttonRestartTween.playing) {
            scriptContext.buttonRestartTween.stop();
        }

        this.buttonRestart.setLocalScale(0, 0, 0);

        const showButtons = (delay) => {
            /* tween buttons */
            scriptContext.buttonRestartTween = this.buttonRestart
                .tween(this.buttonRestart.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.5, pc.BackOut)
                .delay(delay)
                .start();
        };

        showButtons(1.4);

        /* tween background */
        this.background.element.opacity = 0.0;
        this.background.tween(this.background.element)
            .to({ opacity: 0.96 }, 0.25, pc.Linear)
            .start();

        /* tween heading icon */
        this.headingIcon.element.opacity = 0.0;
        var headingAppearingTween =
            this.headingIcon.tween(this.headingIcon.element)
                .to({ opacity: 0.9 }, 0.5, pc.Linear)
                .delay(0.25);

        this.headingIcon.setLocalPosition(0, -360, 0);
        var headingMovingTween =
            this.headingIcon.tween(this.headingIcon.getLocalPosition())
                .to(new pc.Vec3(0, 0, 0), 0.9, pc.SineOut)
                .delay(0.2);

        headingAppearingTween.chain(headingMovingTween).start();

        this.headingIcon.setLocalScale(0.5, 0.5, 0.5);
        var headingAppearingScaleTween =
            this.headingIcon.tween(this.headingIcon.getLocalScale())
                .to(new pc.Vec3(1.5, 1.5, 1.5), 0.55, pc.BackOut)
                .delay(0.25);

        var headingMovingScaleTween =
            this.headingIcon.tween(this.headingIcon.getLocalScale())
                .to(new pc.Vec3(1.0, 1.0, 1.0), 0.9, pc.SineOut)
                .delay(0.1);

        headingAppearingScaleTween.chain(headingMovingScaleTween).start();


        {
            this.textsContainer.enabled = true;

            /* tween text groups */
            this.scoreGroup.setLocalScale(0, 0, 0);
            this.scoreGroup.tween(this.scoreGroup.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.45, pc.BackOut)
                .delay(1.35)
                .start();

            this.maxScoreGroup.setLocalScale(0, 0, 0);
            this.maxScoreGroup.tween(this.maxScoreGroup.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.45, pc.BackOut)
                .delay(1.5)
                .start();

            /* tween texts */
            const textTweenDelay = 1.75;
            if (ScoreManager.instance.getScores() > 0) {
                this.delayedCall(textTweenDelay * 1000, () => scriptContext.app.fire(EventTypes.PLAY_AUDIO, "counting", 0.9));
                this.delayedCall((textTweenDelay + 1.0) * 1000, () => scriptContext.app.fire(EventTypes.STOP_AUDIO, "counting"));
            }

            Utils.tweenText(this.scoreText, 0, ScoreManager.instance.getScores(), 0.75, textTweenDelay, pc.SineOut, true);
            Utils.tweenText(this.maxScoreText, ScoreManager.instance.getPrevMaxScores(), ScoreManager.instance.getMaxScores(), 0.75, textTweenDelay + 0.25, pc.SineOut, true);
            ScoreManager.instance.setPrevMaxScores(ScoreManager.instance.getMaxScores());

            this.newBestScoreIcon.element.opacity = 0;
            this.newBestScoreIcon.setLocalScale(2, 2, 2);
            if (ScoreManager.instance.getScores() === ScoreManager.instance.getMaxScores()) {

                this.newBestScoreIcon.tween(this.newBestScoreIcon.element)
                    .to({ opacity: 1 }, 0.3, pc.Linear)
                    .delay(textTweenDelay + 1)
                    .onComplete(() => {
                        if (this.enabled) {
                            scriptContext.app.fire(EventTypes.PLAY_AUDIO, 'newBest');
                        }
                    })
                    .onUpdate(() => {
                        this.newBestScoreIcon.setLocalPosition(this.maxScoreText.element.width + 66, 0, 0);
                    })
                    .start();

                this.newBestScoreIcon.tween(this.newBestScoreIcon.getLocalScale())
                    .to(new pc.Vec3(1, 1, 1), 0.42, pc.BackOut)
                    .delay(textTweenDelay + 1)
                    .start();
            }
        }

    }.bind(this.entity);


    /* hide method */
    this.entity.hide = function () {
        this.enabled = false;
    }.bind(this.entity);

    this.entity.hide();
};

DefeatWindow.prototype.update = function (dt) {

};

DefeatWindow.prototype.restartPressed = async function () {
    

    TransitionScreen.instance.transitionTo(() => {
        this.entity.hide();
        this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
    });
};

// worldController.js
//@ts-nocheck
var WorldController = pc.createScript('worldController');

WorldController.attributes.add('clearOnStart', {
    title: 'Clear on start',
    description: 'Clear all the children on start? If set to false, just disables the children.',
    type: 'boolean',
    default: true
});

WorldController.attributes.add('testWorldTemplate', {
    title: 'Test world template',
    type: 'asset',
    assetType: 'template'
});

WorldController.attributes.add('testWorldEntity', {
    title: 'Test world entity',
    type: 'entity'
});

WorldController.attributes.add('worldTemplates', {
    title: 'World templates',
    type: 'asset',
    assetType: 'template',
    array: true
});

WorldController.prototype.initialize = function () {
    this._currentWorldInstance = null;
    this._currentTemplateIndex = -1;
    this._currentAmbientKey = null;
    this._lastAmbientKey = null;
    this.app.on(EventTypes.CHANGE_WORLD, this.changeWorld, this);
    this.app.on(EventTypes.WORLD_CONFIG_CHANGED, this.onWorldConfigChanged, this);
    this.app.on(EventTypes.STOP_AMBIENT_AUDIO, this.stopAmbientAudio, this);
    this.app.on(EventTypes.RESUME_AMBIENT_AUDIO, this.resumeAmbientAudio, this);
    this.app.on(EventTypes.LEVEL_COMPLETED, this._onLevelEnded, this);
    this.app.on(EventTypes.STAGE_FAILED, this._onLevelEnded, this);
    this.app.on(EventTypes.LEVEL_START, this._onLevelStarted, this);
    this.on('attr:testWorldTemplate', this._onTestWorldAttrChanged, this);
    this.on('attr:testWorldEntity', this._onTestWorldAttrChanged, this);
};



WorldController.prototype.postInitialize = function () {
    for (let i = this.entity.children.length - 1; i > -1; i--) {
        if (this.entity.children[i] === this.testWorldEntity) continue;
        if (!this.clearOnStart) {
            this.entity.children[i].destroy();
        } else {
            this.entity.children[i].enabled = false;
        }
    }
};

WorldController.prototype._onTestWorldAttrChanged = function () {
    if (this.isTestMode()) {
        this.changeWorld();
    }
};

WorldController.prototype.isTestMode = function () {
    return !!(this.testWorldTemplate || this.testWorldEntity);
};

WorldController.prototype.onWorldConfigChanged = function (worldConfig) {
    if (!this._currentWorldInstance) return;
    const currentConfig = this._currentWorldInstance.script && this._currentWorldInstance.script.worldConfig;
    if (worldConfig === currentConfig) {
        this.applyWorldConfig(worldConfig);
    }
};

WorldController._skyTypeMap = [
    pc.SKYTYPE_INFINITE,
    pc.SKYTYPE_BOX,
    pc.SKYTYPE_DOME
];

WorldController.prototype.applyWorldConfig = function (worldConfig) {
    if (!worldConfig) return;

    this._lastAmbientKey = null;

    const scene = this.app.scene;
    const sky = scene.sky;

    scene.fogColor.copy(worldConfig.fogColor);
    scene.fogStart = worldConfig.fogStart;
    scene.fogEnd = worldConfig.fogEnd;

    if (worldConfig.skyCubeMap && worldConfig.skyCubeMap.resource) {
        scene.skybox = worldConfig.skyCubeMap.resource;
    } else {
        console.warn('WorldController: no skybox');
    }
    scene.skyboxIntensity = worldConfig.skyboxIntensity;
    scene.sky.type = WorldController._skyTypeMap[worldConfig.skyboxType] ?? pc.SKYTYPE_INFINITE;

    const rotation = worldConfig.cubemapRotation;
    if (rotation) {
        scene.skyboxRotation = new pc.Quat().setFromEulerAngles(rotation.x, rotation.y, rotation.z);
    }

    const center = worldConfig.skyboxCenter;
    if (center) {
        scene.sky.center.set(center.x, center.y, center.z);
    }

    // sky mesh transform
    if (sky && sky.node) {
        const mp = worldConfig.skyboxMeshPosition;
        const mr = worldConfig.skyboxMeshRotation;
        const ms = worldConfig.skyboxMeshScale;
        if (mp) sky.node.setPosition(mp.x, mp.y, mp.z);
        if (mr) sky.node.setEulerAngles(mr.x, mr.y, mr.z);
        if (ms) sky.node.setLocalScale(ms.x, ms.y, ms.z);
    }

    this._playAmbientAudio(worldConfig.ambientSFXKey);
};

WorldController.prototype._playAmbientAudio = async function (key) {
    await Utils.wait(50);

    if (this._currentAmbientKey && this._currentAmbientKey !== key) {
        this.app.fire(EventTypes.STOP_AUDIO, this._currentAmbientKey);
    }
    if (key && key !== this._currentAmbientKey) {
        this.app.fire(EventTypes.PLAY_AUDIO, key);
    }
    this._currentAmbientKey = key;
};

WorldController.prototype._onLevelEnded = function () {
    this.app.fire(EventTypes.STOP_AMBIENT_AUDIO);
};

WorldController.prototype._onLevelStarted = function () {
    this.app.fire(EventTypes.RESUME_AMBIENT_AUDIO);
};

WorldController.prototype.stopAmbientAudio = function () {
    if (this._currentAmbientKey) {
        this._lastAmbientKey = this._currentAmbientKey;
        this.app.fire(EventTypes.STOP_AUDIO, this._currentAmbientKey);
        this._currentAmbientKey = null;
    }
};

WorldController.prototype.resumeAmbientAudio = function () {
    if (this._lastAmbientKey) {
        this.app.fire(EventTypes.PLAY_AUDIO, this._lastAmbientKey);
        this._currentAmbientKey = this._lastAmbientKey;
        this._lastAmbientKey = null;
    }
};

WorldController.prototype.pickNextTemplate = function () {
    if (this.testWorldTemplate) {
        Utils.showAlert('Loading test world: ' + this.testWorldTemplate?.name);
        return this.testWorldTemplate;
    }
    const templates = this.worldTemplates;
    if (!templates || templates.length === 0) return null;

    const available = templates.filter((_, i) => i !== this._currentTemplateIndex);
    const chosen = available.length > 0
        ? Utils.getRandomItem(available)
        : templates[0];

    this._currentTemplateIndex = templates.indexOf(chosen);
    return chosen;
};

WorldController.prototype.reportWorldChange = function () {
    if (this._currentWorldInstance) {
        this.app.fire(EventTypes.WORLD_CHANGED, this._currentWorldInstance.name);
    }
};

WorldController.prototype.changeWorld = function () {
    // In test entity mode, use the entity directly without destroying/recreating
    if (this.testWorldEntity) {
        Utils.showAlert('Loading test world: ' + this.testWorldEntity?.name);
        this._currentWorldInstance = this.testWorldEntity;
        this.applyWorldConfig(this._currentWorldInstance.script && this._currentWorldInstance.script.worldConfig);
        this.reportWorldChange();
        return;
    }

    if (this._currentWorldInstance) {
        this._currentWorldInstance.destroy();
        this._currentWorldInstance = null;
    }

    const template = this.pickNextTemplate();
    if (!template || !template.resource) {
        console.warn('WorldController: no valid template to instantiate');
        return;
    }

    this._currentWorldInstance = template.resource.instantiate();
    this.entity.addChild(this._currentWorldInstance);

    this.applyWorldConfig(this._currentWorldInstance.script && this._currentWorldInstance.script.worldConfig);
    this.reportWorldChange();
};


// worldConfig.js
//@ts-nocheck
var WorldConfig = pc.createScript('worldConfig');

WorldConfig.attributes.add('fogColor', {
    type: 'rgb'
});

WorldConfig.attributes.add('fogStart', {
    type: 'number',
    default: 40
});

WorldConfig.attributes.add('fogEnd', {
    type: 'number',
    default: 85
});

WorldConfig.attributes.add('skyCubeMap', {
    title: 'Sky cube map',
    type: 'asset',
    assetType: 'cubemap'
});

WorldConfig.attributes.add('cubemapRotation', {
    title: 'Cubemap rotation',
    type: 'vec3',
    default: [0, 0, 0]
});

WorldConfig.attributes.add('skyboxIntensity', {
    title: 'Skybox intensity',
    type: 'number',
    default: 1
});

WorldConfig.attributes.add('skyboxType', {
    title: 'Skybox type',
    type: 'number',
    enum: [
        { 'Infinite': 0 },
        { 'Box': 1 },
        { 'Dome': 2 }
    ],
    default: 0
});

WorldConfig.attributes.add('skyboxCenter', {
    title: 'Skybox center',
    type: 'vec3',
    default: [0, 0, 0]
});

WorldConfig.attributes.add('skyboxMeshPosition', {
    title: 'Skybox mesh position',
    type: 'vec3',
    default: [0, 0, 0]
});

WorldConfig.attributes.add('skyboxMeshRotation', {
    title: 'Skybox mesh rotation',
    type: 'vec3',
    default: [0, 0, 0]
});

WorldConfig.attributes.add('skyboxMeshScale', {
    title: 'Skybox mesh scale',
    type: 'vec3',
    default: [1, 1, 1]
});

WorldConfig.attributes.add('ambientSFXKey', {
    title: 'Ambient SFX key',
    type: 'string',
    default: ''
});

WorldConfig.prototype.initialize = function() {
    this.on('attr', this.onAttrChanged, this);    
};

WorldConfig.prototype.onAttrChanged = function(attr) {
    this.app.fire(EventTypes.WORLD_CONFIG_CHANGED, this);
};

WorldConfig.prototype.update = function(dt) {
    
};


// snowFlakesManager.js
//@ts-nocheck
var SnowFlakesManager = pc.createScript('snowFlakesManager');

SnowFlakesManager.attributes.add('cacheSize', {
    description: 'num snowflakes in cache',
    type: 'number',
    default: 150
});

SnowFlakesManager.attributes.add('frequency', {
    type: 'number',
    default: 40
});

SnowFlakesManager.attributes.add('positionX', {
    type: 'vec2',
    default: [-5, 25]
});

SnowFlakesManager.attributes.add('positionY', {
    type: 'vec2',
    default: [15, 16]
});

SnowFlakesManager.attributes.add('positionZ', {
    type: 'vec2',
    default: [8, 12]
});

SnowFlakesManager.attributes.add('speedX', {
    type: 'vec2',
    default: [-3, -2.8]
});

SnowFlakesManager.attributes.add('speedY', {
    type: 'vec2',
    default: [-1, -0.5]
});

SnowFlakesManager.attributes.add('speedZ', {
    type: 'vec2',
    default: [-0.1, 0.1]
});

SnowFlakesManager.attributes.add('gravity', {
    type: 'vec2',
    default: [-1.2, -0.8]
});

SnowFlakesManager.prototype.initialize = function() {
    this.elapsedSinceLastParticle = 0;
    this.snowFlakePrefabs = this.app.root.findByName('ObjectsPrefabs').findByName('SnowFlakes').children;
    this.snowFlakesCache = [];
    this.activeSnowflakes = [];
    this.prepareCache();
    // this.app.on(EventTypes.LEVEL_RESET, this.reset, this);
    
    this.screenWidthFactor = 1;
    
    this.app.on(EventTypes.Screen.RESIZED, (width, height) => {
        this.screenWidthFactor = (this.app.graphicsDevice.width / this.app.graphicsDevice.height) / (720 / 1280);
    });
    
    this.app.on(EventTypes.QUALITY_CHANGED, (quality) => {
        if(ScaleManager.getInstance().isHighQuality()) {
            this.activeSnowflakes.forEach(p => p.enabled = true);
        } else {
            this.activeSnowflakes.forEach(p => p.enabled = false);
        }
    });
};

SnowFlakesManager.prototype.reset = function() {
    for(let i = this.activeSnowflakes.length - 1; i > -1; i--) {
        this.resetSnowflake(this.activeSnowflakes[i]);
    }
};

SnowFlakesManager.prototype.update = function(dt) {
    if(!ScaleManager.getInstance().isHighQuality()) {
        return;
    }
    this.generateSnowFlakes(dt);
    this.activeSnowflakes.forEach(child => this.updateChild(child, dt));    
};

SnowFlakesManager.prototype.generateSnowFlakes = function(dt) {
    if (this.elapsedSinceLastParticle >= 1 / this.frequency) {   
        for(let i = 0; i < Math.floor(this.elapsedSinceLastParticle * this.frequency); i++) {
            const posX = pc.math.random(this.positionX.x * this.screenWidthFactor, this.positionX.y * this.screenWidthFactor + Math.sqrt(Math.abs(this.positionY.x / this.speedY.y * 2 * this.gravity.x)) * 1.41);
            const posZ = pc.math.random(this.positionZ.x, this.positionZ.y);
            const posY = pc.math.random(this.positionY.x, this.positionY.y) - Math.min(posZ, 0);
            this.addSnowflake(posX, posY, posZ);
        }
        this.elapsedSinceLastParticle = 0;        
    } else {
        this.elapsedSinceLastParticle += dt;
    }
};

SnowFlakesManager.prototype.updateChild = function(child, dt) {
   child.translateLocal(child.speedX * dt, child.speedY * dt, child.speedZ * dt); 
   child.speedY += child.gravity * dt;
   if(child.getPosition().y <= 0) {
       child.completed = true;
       this.resetSnowflake(child);
   }
};

SnowFlakesManager.prototype.addSnowflake = function(x, y, z) {
    let particle;

    if(this.snowFlakesCache.length > 0) {
        particle = this.snowFlakesCache.splice(this.snowFlakesCache.length - 1, 1)[0];
    } else {
        particle = Utils.getRandomItem(this.snowFlakePrefabs).clone();
        this.entity.addChild(particle);
    }

    particle.enabled = true;
    particle.setPosition(x, y, z);
    particle.speedX = pc.math.random(this.speedX.x, this.speedX.y);
    particle.speedY = pc.math.random(this.speedY.x, this.speedY.y);
    particle.speedZ = pc.math.random(this.speedZ.x, this.speedZ.y);
    particle.gravity = pc.math.random(this.gravity.x, this.gravity.y);
    particle.completed = false;

    this.activeSnowflakes.push(particle);
};

SnowFlakesManager.prototype.resetSnowflake = function(snowflake) {
    const index = this.activeSnowflakes.indexOf(snowflake);
    if(index != -1) {
        this.activeSnowflakes.splice(index, 1);
    }
    snowflake.enabled = false;
    snowflake.setPosition(0, -50, 0);
    this.snowFlakesCache.push(snowflake);
};


SnowFlakesManager.prototype.prepareCache = function() {
    for (let i = 0; i < this.cacheSize; i++) {
        const snowFlakeParticle = Utils.getRandomItem(this.snowFlakePrefabs).clone();
        snowFlakeParticle.enabled = false;
        snowFlakeParticle.setPosition(0, -50, 0);
        const randomScale = pc.math.random(0.35, 0.75);
        snowFlakeParticle.setLocalScale(randomScale, randomScale, randomScale);
        this.entity.addChild(snowFlakeParticle);
        this.snowFlakesCache.push(snowFlakeParticle);
    }
};

// scaleManager.js
// @ts-nocheck
var ScaleManager = pc.createScript('scaleManager');


ScaleManager.attributes.add('minPortraitScreenRatio', {
    type: 'number',
    default: 0.5625
});

ScaleManager.attributes.add('portraitFixedScreenRatio', {
    type: 'number',
    default: 0.5625
});


ScaleManager.attributes.add('landscapeBlend', {
    type: 'number',
    default: 0.75
});

ScaleManager.attributes.add('portraitBlend', {
    type: 'number',
    default: 0
});

ScaleManager.attributes.add('portraitFixedBlend', {
    type: 'number',
    default: 0
});

ScaleManager.getInstance = function () {
    if (!ScaleManager._instance) console.error('ScaleManager is not initialized yet');
    return ScaleManager._instance;
};

ScaleManager.prototype.initialize = function () {
    ScaleManager._app = this.app;
    if (!ScaleManager._instance) {
        ScaleManager._instance = this;
    }

    this.app.graphicsDevice.on('resizecanvas', this.onCanvasResized, this);
    this.on('attr:landscapeBlend', this.refresh, this);
    this.on('attr:portraitBlend', this.refresh, this);
    this.on('attr:mainLight', this.refresh, this);

    this.onCanvasResized(this.app.graphicsDevice.canvas.width, this.app.graphicsDevice.canvas.height);
};

ScaleManager.prototype.update = function (dt) {

};

ScaleManager.prototype.refresh = function () {
    this.onCanvasResized(this.app.graphicsDevice.canvas.width, this.app.graphicsDevice.canvas.height);
};


ScaleManager.prototype.onCanvasResized = function (width, height) {
    const fireResizedEvent = () => {
        const isLandscape = this.isLandscape();
        const scaleBlend = this.getCurrentScaleBlend();
        this.app.fire(EventTypes.Screen.RESIZED, this.app.graphicsDevice.canvas.width, this.app.graphicsDevice.canvas.height, isLandscape);
        this.app.fire(EventTypes.Screen.SET_SCALE_BLEND, scaleBlend);
    };

    this.resizeTimeouts = this.resizeTimeouts || [];
    while (this.resizeTimeouts.length > 0) {
        const timeout = this.resizeTimeouts.pop();
        clearTimeout(timeout);
    }

    this.resizeTimeouts.push(setTimeout(() => fireResizedEvent(), 0));
    this.resizeTimeouts.push(setTimeout(() => fireResizedEvent(), 125));
    this.resizeTimeouts.push(setTimeout(() => fireResizedEvent(), 400));
    if (pc.platform.ios) {
        this.resizeTimeouts.push(setTimeout(() => fireResizedEvent(), 800));
    }
};

ScaleManager.prototype.getCurrentScaleBlend = function () {
    const isLandscape = this.isLandscape();
    const screenRatio = this.app.graphicsDevice.canvas.width / this.app.graphicsDevice.canvas.height;
    const scaleBlend = isLandscape ? this.landscapeBlend : (screenRatio <= this.portraitFixedScreenRatio ? this.portraitFixedBlend : this.portraitBlend);
    return scaleBlend;
};

ScaleManager.prototype.isLandscape = function () {
    return (this.app.graphicsDevice.canvas.width / this.app.graphicsDevice.canvas.height) >= this.minPortraitScreenRatio;
};

ScaleManager.prototype.isMobileLandscape = function () {
    return pc.platform.mobile && this.isLandscape();
};

ScaleManager.prototype.getMinPortraitScreenRatio = function () {
    return this.portraitFixedScreenRatio;
};

ScaleManager.prototype.getRelativeQualityIndex = function () {
    const dprDiapason = PerformanceMonitor.getInstance().getMaxDPR() - PerformanceMonitor.getInstance().getMinDPR();
    if(dprDiapason === 0) {
        return 1;
    }
    const relativeQuality = pc.math.clamp((this.app.graphicsDevice.maxPixelRatio - PerformanceMonitor.getInstance().getMinDPR()) / dprDiapason, 0, 1);
    return relativeQuality;
};

ScaleManager.prototype.isHighQuality = function () {
    return this.getRelativeQualityIndex() >= 2 / 3;
};

ScaleManager.prototype.isMediumQuality = function () {
    return this.getRelativeQualityIndex() >= 1 / 3 && this.getRelativeQualityIndex() < 2 / 3;
};

ScaleManager.prototype.isLowQuality = function () {
    return this.getRelativeQualityIndex() < 1 / 3;
};

ScaleManager.prototype.getScreenRatio = function () {
    return this.app.graphicsDevice.canvas.width / this.app.graphicsDevice.canvas.height;
};

ScaleManager.prototype.isPortrait = function () {
    return !this.isLandscape();
};

ScaleManager.prototype.getWidth = function () {
    return this.app.graphicsDevice.canvas.width * this.app.graphicsDevice.maxPixelRatio;
};


ScaleManager.prototype.getHeight = function () {
    return this.app.graphicsDevice.canvas.height * this.app.graphicsDevice.maxPixelRatio;
};


// fogConfig.js
/* jshint esversion: 6 */
var FogConfig = pc.createScript('fogConfig');

FogConfig.attributes.add('speed', {
    type: 'number',
    default: 0.8
});

FogConfig.attributes.add('spriteWidth', {
    type: 'number',
    default: 100
});

FogConfig.prototype.initialize = function() {
    
};

FogConfig.prototype.update = function(dt) {
    this.entity.children.forEach(child => {
        child.translateLocal(this.speed * dt, 0, 0);
        const position = child.getLocalPosition();
        if(this.speed > 0 && position.x > this.spriteWidth) {
            child.setLocalPosition(-this.spriteWidth, position.y, position.z);
        } else if(this.speed < 0 && position.x < -this.spriteWidth) {
             child.setLocalPosition(this.spriteWidth, position.y, position.z);
        }
    });
};

// settingsPanel.js
///@ts-nocheck
var SettingsPanel = pc.createScript('settingsPanel');

SettingsPanel.prototype.initialize = function () {

    this.entity.buttonSettings = this.entity.findByName("ButtonSettings");
    this.entity.buttonRestart = this.entity.findByName("ButtonRestart");
    this.entity.settingsPanelContainer = this.entity.findByName("SettingsPanelContainer");
    this.entity.soundButtonsContainer = this.entity.findByName("SoundButtonsContainer");
    this.entity.buttonSoundOn = this.entity.findByName("ButtonSoundOn");
    this.entity.buttonSoundOff = this.entity.findByName("ButtonSoundOff");

    /* init state */
     
    
    this.entity.soundButtonsContainer.enabled = false;

    
    this.app.on(EventTypes.SOUND_STATE_CHANGED, this.updateSoundButtons, this);
    this.app.on(EventTypes.MUSIC_STATE_CHANGED, this.updateSoundButtons, this);

    BasicButton.assignAction(this.entity.buttonSettings, this.openSettingsWindow, this);
    BasicButton.assignAction(this.entity.buttonSoundOn, this.onSoundOnClicked, this);
    BasicButton.assignAction(this.entity.buttonSoundOff, this.onSoundOffClicked, this);

    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);

    this.entity.enabled = true;
};

SettingsPanel.prototype.show = function () {
    this.entity.enabled = true;
};

SettingsPanel.prototype.hide = function () {
    this.entity.enabled = false;
};

SettingsPanel.prototype.openSettingsWindow = async function () {
    
    await PauseManager.getInstance().pauseGame();
    WindowManager.showSettings();
};

SettingsPanel.prototype.onSoundOnClicked = function () {
    SoundController.musicEnabled = false;
    SoundController.sfxEnabled = false;{}
    this.updateSoundButtons();
    this.app.fire(EventTypes.SAVE_APP);
};

SettingsPanel.prototype.onSoundOffClicked = function () {
    SoundController.musicEnabled = true;
    SoundController.sfxEnabled = true;
    this.updateSoundButtons();
    this.app.fire(EventTypes.SAVE_APP);
};

SettingsPanel.prototype.updateSoundButtons = function () {
    this.entity.buttonSoundOn.enabled = SoundController.sfxEnabled;
    this.entity.buttonSoundOff.enabled = !SoundController.sfxEnabled;
};



SettingsPanel.prototype.update = function (dt) {

};

// mainMenu.js
///@ts-nocheck
var MainMenu = pc.createScript('mainMenu');

MainMenu.prototype.initialize = function () {
    this.headingContainer = this.entity.findByName("HeadingContainer");
    this.handContainer = this.entity.findByName("HandContainer");
    this.tutorialHand = this.handContainer.findByName('TutorialHand');
    this.clickZone = this.handContainer.findByName('ClickZone');
    this.headingIconEn = this.entity.findByName("HeadingIcon");
    this.headingIconRu = this.entity.findByName("HeadingIcon_ru");
    this.headingIcon = (navigator.language || 'en') === 'ru' ? this.headingIconRu : this.headingIconEn;
    [this.headingIconEn, this.headingIconRu].forEach(icon => {
        icon.enabled = this.headingIcon === icon;
    });
    this._headingIconPosition = this.headingIcon.getLocalPosition().clone();

    BasicButton.assignAction(this.clickZone, this.playPressed, this);

    this.app.on(EventTypes.EXIT_TO_MAIN_MENU, this.onExitToMainMenu, this);
    this.app.on(EventTypes.PRELOADER_FINISHED, () => {
        if (!this.preloaderFinsihed) {
            this.preloaderFinsihed = true;
            this.clickZone.enabled = true;
        }
    });

    /* show method */
    this.entity.show = () => {
        this.entity.enabled = true;
        
        

        this.resetActiveTweens();

        /* tween heading icon */
        this.headingIcon.setLocalPosition(this._headingIconPosition);
        this.headingIcon.element.opacity = 0.0;
        this._headingAppearingTween = this.headingIcon.tween(this.headingIcon.element)
                .to({ opacity: 1.0 }, 0.5, pc.SineIn)
                .delay(0.1).start();

        this.headingContainer.setLocalScale(0.7, 0.7, 0.7);
        this._headingAppearingScaleTween = this.headingContainer.tween(this.headingContainer.getLocalScale())
                .to(new pc.Vec3(1.2, 1.2, 1.2), 0.5, pc.BackOut)
                .delay(0.1).start();

        /* hand */
        this.tutorialHand.enabled = true /* && APIMediator.isTutorialEnabled() */;

        /* tween hand */
        this.tutorialHand.element.opacity = 0.0;
        this._tutorialHandOpacityTween = this.tutorialHand.tween(this.tutorialHand.element)
            .to({ opacity: 1.0 }, 0.5, pc.SineIn)
            .delay(0.5)
            .start();

        this.tutorialHand.setLocalScale(pc.Vec3.ONE);
        this._tutorialHandScaleTween = this.tutorialHand.tween(this.tutorialHand.getLocalScale())
            .to(new pc.Vec3(1.25, 1.25, 1.25), 0.55, pc.SineInOut)
            .yoyo(true)
            .repeat(100000)
            .start();
            
    };


    /* hide method */
    this.entity.hide = (immediately = false) => {
        if(immediately) {
            this.entity.enabled = false;
            return;
        }

        this.resetActiveTweens();

        /* tween heading icon */
        this._headingDisappearingTween =
            this.headingIcon.tween(this.headingIcon.element)
                .to({ opacity: 0.0 }, 0.35, pc.SineOut)
                .start();

        const position = this.headingIcon.getLocalPosition();
        this._headingDisappearingPositionTween = this.headingIcon.tween(this.headingIcon.getLocalPosition())
            .to(new pc.Vec3(position.x, position.y + 50, position.z), 0.35, pc.SineIn)
            .start();

        this._tutorialHandOpacityTween = this.tutorialHand.tween(this.tutorialHand.element)
            .to({ opacity: 0.0 }, 0.25, pc.Linear)
            .onComplete( () => {
                this.entity.enabled = false;
            })
            .start();

    };
};

MainMenu.prototype.resetActiveTweens = function () {
    if (this._headingAppearingTween && this._headingAppearingTween.playing) {
        this._headingAppearingTween.stop();
    }
    if (this._headingAppearingScaleTween && this._headingAppearingScaleTween.playing) {
        this._headingAppearingScaleTween.stop();
    }
    if (this._tutorialHandScaleTween && this._tutorialHandScaleTween.playing) {
        this._tutorialHandScaleTween.stop();
    }
    if (this._tutorialHandOpacityTween && this._tutorialHandOpacityTween.playing) {
        this._tutorialHandOpacityTween.stop();
    }
    if (this._headingDisappearingTween && this._headingDisappearingTween.playing) {
        this._headingDisappearingTween.stop();
    }
    if (this._headingDisappearingPositionTween && this._headingDisappearingPositionTween.playing) {
        this._headingDisappearingPositionTween.stop();
    }
};

MainMenu.prototype.onExitToMainMenu = function () {
    this.clickZone.enabled = true;

};

MainMenu.prototype.update = function (dt) {

};

MainMenu.prototype.playPressed = async function () {
    this.clickZone.enabled = false;

    GameplayController.getInstance().startFromMainMenu();
};


// levelUI.js
//@ts-nocheck
var LevelUi = pc.createScript('levelUi');

LevelUi.prototype.initialize = function() {
    this._tutorialReady = false;
    this.entity.tutorialHand = this.entity.findByName('TutorialHand');
    
    
    this.entity.progressVertical = this.entity.findByName('LevelProgressVertical');
    this.entity.progressHorizontal = this.entity.findByName('LevelProgressHorizontal');
    this.entity.powerupContainer = this.entity.findByName('PowerupContainer');
    this.entity.shopButtonContainer = this.entity.findByName('ShopButtonContainer');
    
    this.entity.show = function() {
        this.progressVertical.show();
        this.progressHorizontal.show();
        this.powerupContainer.show();
        
    }.bind(this.entity);
    
    this.entity.hide = function() {
        this.progressVertical.hide();
        this.progressHorizontal.hide();
        this.powerupContainer.hide();
        
    }.bind(this.entity);

    this.app.once(EventTypes.PLAY_PRESSED, this.onPlayPressed, this);
    this.app.on(EventTypes.STAGE_LOADED, this.onStageLoaded, this);
    this.app.on(EventTypes.EXIT_TO_MAIN_MENU, this.onExitToMainMenu, this);
};

LevelUi.prototype.onPlayPressed = function() {
    this._tutorialReady = true;
    this.showTutorialHand(1000); 
};

LevelUi.prototype.onStageLoaded = function() {
    this.showTutorialHand(250);
};

LevelUi.prototype.onExitToMainMenu = function() {
    this.entity.tutorialHand.enabled = false;
};

LevelUi.prototype.showTutorialHand = function(delay = 0) {
    

    setTimeout(() => {
        if(!this._tutorialReady) return;

        const currentLevel = GameplayController.currentLevel;
        const currentStage = GameplayController.currentStage;
        const totalStages = GameplayController.totalStages;
    
        if(currentLevel === 1 && (currentStage === 1 || currentStage === 2)) {
            const randomLevelObject = Utils.getRandomItem(LevelController.getInstance().getActiveObjectsList());
            if(randomLevelObject) {
                const screenPosition = UIController.getInstance().worldToScreen(randomLevelObject.getPosition());
                this.entity.tutorialHand.showClickingTutorial(screenPosition, 0, 200);
                this.app.on(EventTypes.TAP_AT, this.handleTapAt, this);
            } else {
                console.warn('Tutorial: mo active level objects found');
            }          
        } else {
            this.entity.tutorialHand.enabled = false;
        }
    }, delay);   
};

LevelUi.prototype.handleTapAt = function(event) {
    this.app.off(EventTypes.TAP_AT, this.handleTapAt, this);
    this.entity.tutorialHand.hide();
};

LevelUi.prototype.update = function(dt) {
    
};



// scoresEffectManager.js
//@ts-nocheck
var ScoresEffectManager = pc.createScript('scoresEffectManager');

ScoresEffectManager.attributes.add('cacheSize', {
    description: 'num scores in cache',
    type: 'number',
    default: 15
});

ScoresEffectManager.attributes.add('maxScoresOnScreen', {
    description: 'max scores on screen',
    type: 'number',
    default: 15
});

ScoresEffectManager.attributes.add('scoresEarnedText', {
    type: 'entity'
});

ScoresEffectManager.prototype.initialize = function () {
    this.mainCamera = this.app.root.findByName('Camera');
    this.particleCache = [];
    this.activeParticles = [];
    this.prepareCache();
    this.app.on(EventTypes.SHOW_SCORES_EFFECT, this.addScoresEffect, this);
    this.app.on(EventTypes.LEVEL_RESET, this.reset, this);
};

ScoresEffectManager.prototype.reset = function () {
    for (let i = this.activeParticles.length - 1; i > -1; i--) {
        this.resetParticle(this.activeParticles[i]);
    }
};

ScoresEffectManager.prototype.update = function (dt) {
    this.activeParticles.forEach(particle => this.updateParticle(particle, dt));
};

ScoresEffectManager.prototype.updateParticle = function (particle, dt) {
    particle.lifeTime += dt;
    if (particle.lifeTime >= particle.duration) {
        this.resetParticle(particle);
    }
};

ScoresEffectManager.prototype.addScoresEffect = function (value, position) {
    if (position.z > this.mainCamera.getPosition().z - 5) {
        return;
    }
    if (this.activeParticles.length > this.maxScoresOnScreen) {
        this.resetParticle(this.activeParticles[0]);
    }
    this.addParticle(value, position);
};

ScoresEffectManager.prototype.addParticle = function (value, position) {
    

    let particle;

    if (this.particleCache.length > 0) {
        particle = this.particleCache.splice(this.particleCache.length - 1, 1)[0];
    } else {
        particle = this.scoresEarnedText.clone();
        this.entity.addChild(particle);
    }


    if (particle.scaleTween && particle.scaleTween.playing) {
        particle.scaleTween.stop();
    }

    if (particle.positionTween && particle.positionTween.playing) {
        particle.positionTween.stop();
    }

    if (particle.opacityTween && particle.opacityTween.playing) {
        particle.opacityTween.stop();
    }

    particle.enabled = true;
    particle.completed = false;
    particle.element.text = '+' + value;
    particle.element.opacity = 0.9;
    particle.setPosition(position.x, position.y + 0.4, position.z + 1);
    particle.setLocalScale(0.02 + pc.math.clamp(value, 1, 20) * 0.0004, 0.02 + pc.math.clamp(value, 1, 20) * 0.0004, 0.02 + pc.math.clamp(value, 1, 20) * 0.0004);
    particle.duration = 0.85;
    particle.lifeTime = 0;

    particle.positionTween = particle.tween(particle.getLocalPosition())
        .to(new pc.Vec3(position.x, position.y + 2.0, position.z + 2), particle.duration - 0.15, pc.SineIn)
        .delay(0.15)
        .start();

    particle.scaleTween = particle.tween(particle.getLocalScale())
        .from(new pc.Vec3(0, 0, 0), 0.35, pc.BackOut)
        .start();

    particle.opacityTween = particle.tween(particle.element)
        .to({ opacity: 0 }, particle.duration * 0.98, pc.SineIn)
        .start();

    this.activeParticles.push(particle);
};


ScoresEffectManager.prototype.resetParticle = function (particle) {
    const index = this.activeParticles.indexOf(particle);
    if (index != -1) {
        this.activeParticles.splice(index, 1);
    }
    particle.enabled = false;
    particle.setPosition(0, -50, 0);
    this.particleCache.push(particle);
};


ScoresEffectManager.prototype.prepareCache = function () {
    this.particleCache = [];
    const basicParticle = this.scoresEarnedText;
    for (let i = 0; i < this.cacheSize; i++) {
        const particle = basicParticle.clone();
        particle.enabled = false;
        particle.setPosition(0, -50, 0);
        particle.completed = true;
        this.entity.addChild(particle);
        this.particleCache.push(particle);
    }
};

// groupConfig.js
var GroupConfig = pc.createScript('groupConfig');

GroupConfig.attributes.add('rotation', {
    type: 'number',
    default: 0,
    min: -180,
    max: 180
});


GroupConfig.prototype.initialize = function() {
    
};


GroupConfig.prototype.update = function(dt) {
    
};

// powerupContainer.js
//@ts-nocheck
var PowerupContainer = pc.createScript('powerupContainer');

PowerupContainer.attributes.add('buttonMaxHeight', { type: 'number', default: 145 });

PowerupContainer.prototype.initialize = function () {

    /* powerup activation via MonkeyGames App */
    // window.famobi.activatePowerUp = (pPowerUp) => {
    //     return new Promise((resolve, reject) => {
    //         if (pPowerUp != 'bomb') {
    //             reject();
    //         } else {
    //             this.app.fire(EventTypes.POWERUP_ACTIVATED);
    //             resolve(pPowerUp);
    //         }
    //     });
    // };

    this.entity.powerupGreyed = this.entity.findByName('PowerupGreyed');
    this.entity.powerupActive = this.entity.findByName('PowerupActive');
    this.entity.powerupProgress = this.entity.findByName('PowerupProgress');
    this.entity.powerupHighlighted = this.entity.findByName('PowerupHighlighted');
    this.entity.buttonGetForFree = this.entity.findByName('ButtonGetForFree');

    this.app.on(EventTypes.UPDATE_POWERUP_PROGRESS, this.updateProgress, this);
    this.app.on(EventTypes.RESET_POWERUP_PROGRESS, this.reset, this);
    this.app.on(EventTypes.STAGE_LOADED, this.updateRewardedVideoButton, this);
    this.app.on(EventTypes.POWERUP_ACTIVATED, this.onPowerupActivated, this);
    this.app.on(EventTypes.Screen.RESIZED, this.onViewportResized, this);
    this.assignAction(this.entity.powerupHighlighted, this.usePowerupPressed, this);
    

    this.entity.buttonGetForFree.enabled = false;
    this.lastRewardedVideoTimestamp = 0;
    this._lastRewardedVideoCheckTimestamp = 0;

    const scriptContext = this;

    this.entity.powerupHighlighted.setLocalScale(1.175, 1.175, 1.175);
    this.entity.powerupHighlighted.tween(this.entity.powerupHighlighted.getLocalScale())
        .to(new pc.Vec3(1.3, 1.3, 1.3), 0.22, pc.Linear)
        .yoyo(true)
        .repeat(1000000)
        .start();


    this.entity.show = function () {
        this.enabled = true;
        this.setLocalScale(0, 0, 0);
        this.tween(this.getLocalScale())
            .to(scriptContext.getScale(), 0.4, pc.BackOut)
            .delay(0.5)
            .start();
    }.bind(this.entity);

    this.entity.hide = function () {
        this.enabled = false;
    }.bind(this.entity);

    this.reset();

    this.entity.enabled = false;
};

PowerupContainer.prototype.onViewportResized = function (width, height) {
    this.entity.setLocalScale(this.getScale());
};

PowerupContainer.prototype.getScale = function () {
    if (ScaleManager.getInstance().getScreenRatio() < 1) {
        return new pc.Vec3(1.3, 1.3, 1.3);
    } else {
        return new pc.Vec3(1.15, 1.15, 1.15);
    }
}

PowerupContainer.prototype.reset = function () {
    this.entity.currentProgressValue = 0;
    if (this.progressTween && this.progressTween.playing) {
        this.progressTween.stop();
    }
    this.progressTween = this.entity.tween(this.entity)
        .to({ currentProgressValue: pc.math.clamp(0, 0, 1) }, 0.25, pc.SineOut)
        .start();
};

PowerupContainer.prototype.updateProgress = function (value) {
    
    if (value > this.entity.currentProgressValue) {
        this.progressTween = this.entity.tween(this.entity)
            .to({ currentProgressValue: pc.math.clamp(value, 0, 1) }, 0.15, pc.SineOut)
            .onComplete( () => {
                if (this.entity.currentProgressValue === 1) {
                    this.app.fire(EventTypes.PLAY_AUDIO, 'powerUpLoaded');
                }
            })
            .start();
    }
};

PowerupContainer.prototype.update = function (dt) {
    

    if (this.entity.currentProgressValue < 1) {
        this.entity.powerupHighlighted.enabled = false;
        this.entity.powerupGreyed.enabled = true;
        this.entity.powerupActive.enabled = true;
        this.entity.powerupProgress.enabled = true;

        var height = pc.math.lerp(0, this.buttonMaxHeight, this.entity.currentProgressValue * 0.75);
        this.entity.powerupActive.element.rect.w = this.entity.currentProgressValue * 0.75;
        this.entity.powerupActive.element.height = height;

        this.entity.powerupProgress.element.text = '' + Math.floor(pc.math.clamp(this.entity.currentProgressValue, 0, 1) * 100) + '%';

    } else {
        this.entity.powerupHighlighted.enabled = true;
        this.entity.powerupGreyed.enabled = false;
        this.entity.powerupActive.enabled = false;
        this.entity.powerupProgress.enabled = false;
    }

    if(this.app._time - this._lastRewardedVideoCheckTimestamp > 500) {
        this._lastRewardedVideoCheckTimestamp = this.app._time;
        this.updateRewardedVideoButton();
    }
};


PowerupContainer.prototype.assignAction = function (button, handler, handlerContext) {
    if (this.app.touch) {
        button.element.on('touchstart', handler, handlerContext);
    }
    if (this.app.mouse) {
        button.element.on('mousedown', handler, handlerContext);
    }
};

PowerupContainer.prototype.updateRewardedVideoButton = function () {this.entity.buttonGetForFree.enabled = false;};



PowerupContainer.prototype.usePowerupPressed = function () {
    if (PauseManager.getInstance().isPaused()) {
        return;
    }

    if (this.entity.currentProgressValue >= 1) {
        this.lastRewardedVideoTimestamp = new Date().getTime();
        this.app.fire(EventTypes.POWERUP_ACTIVATED);
        GameplayController.currentSession.usedPowerups.push('Bomb');
        this.entity.currentProgressValue = 0;
    }
    this.updateRewardedVideoButton();
};

PowerupContainer.prototype.onPowerupActivated = function () {
    this.entity.currentProgressValue = 0;
    this.updateRewardedVideoButton();
};


// tumbleweed.js
var Tumbleweed = pc.createScript('tumbleweed');


Tumbleweed.attributes.add('speed', {
    type: 'number',
    default: 1,
    min: 0,
    max: 20
});

Tumbleweed.attributes.add('cutoffX', {
    type: 'number',
    default: 25
});

Tumbleweed.attributes.add('radius', {
    type: 'number',
    default: 1.65
});

Tumbleweed.attributes.add('swingSpeed', {
    type: 'vec2',
    default: [4, 6]
});

Tumbleweed.attributes.add('swingHeight', {
    type: 'number',
    default: 0.75
});

Tumbleweed.prototype.initialize = function() {
    this.elapsedTime = pc.math.random(0, 2 * Math.PI);
    this.initialY = this.entity.getLocalPosition().y;
    this.sineSpeed = pc.math.random(this.swingSpeed.x, this.swingSpeed.y);
};

Tumbleweed.prototype.update = function(dt) {
    this.elapsedTime += dt;
    
    const localPosition = this.entity.getLocalPosition();
    localPosition.x += this.speed * dt;
    if(localPosition.x > this.cutoffX) {
        localPosition.x -= 2 * this.cutoffX;
    }

    localPosition.y = this.initialY + (Math.sin(this.elapsedTime * this.sineSpeed) + 0.5) * this.swingHeight;

    this.entity.setLocalPosition(localPosition);

    this.entity.rotateLocal(0, 0, -this.speed * dt * 360 / (2 * Math.PI * this.radius));
};

// textureTiling.js
var TextureTiling = pc.createScript('textureTiling');

TextureTiling.attributes.add('setNonUniformTiling', {
    type: 'boolean',
    title: 'Reset tiling (1 -> 1.001)',
    default: true
});


TextureTiling.attributes.add('tilingFactors', {
    type: 'vec3',
    title: 'Adjust tiling by axis',
    default: [1, 1, 1]
});

TextureTiling.attributes.add('affectedMaps', {
    type: 'json',
    title: 'Affected maps',
    schema: [{
        name: "diffuse",
        type: 'boolean',
        default: true
    }, {
        name: "emissive",
        type: 'boolean',
        default: true
    }, {
        name: "opacity",
        type: 'boolean',
        default: true
    }, {
        name: "normal",
        type: 'boolean',
        default: true
    }, {
        name: "light",
        type: 'boolean',
        default: true
    },
    ]
});


TextureTiling.prototype.initialize = function () {

    if (this.setNonUniformTiling) {
        this.resetMaterialTiling();
    }

    this.on('attr', this.setTiling, this);
    this.setTiling();
};

TextureTiling.prototype.resetMaterialTiling = function () {
    const mapNames = Object.keys(this.affectedMaps);
    this.entity.render.meshInstances.forEach(mi => {
        mapNames.forEach(mapName => {
            if (mi.material[`${mapName}MapTiling`].x === 1 && mi.material[`${mapName}MapTiling`].y === 1) {
                // console.error('Please set custom offset and tiling values for "' + mapName + '" property on material ' + mi.material.name + '  assingned to ' + this.entity.path);
                mi.material[`${mapName}MapTiling`].x += 0.001;
                mi.material[`${mapName}MapTiling`].y += 0.001;
                mi.material.update();
            }
        })
    });
}


TextureTiling.prototype.setTiling = function () {
    const localScale = this.entity.getLocalScale();

    this.xTiling = localScale.x * this.tilingFactors.x;
    this.yTIling = localScale.y * this.tilingFactors.y;
    this.zTiling = localScale.z * this.tilingFactors.z;

    for (let meshIndex = 0; meshIndex < this.entity.render.meshInstances.length; meshIndex++) {   
        const mapNames = Object.keys(this.affectedMaps);
        mapNames.forEach(mapName => {
            if(this.affectedMaps[mapName]) {


                const materialOffset =  this.entity.render.meshInstances[meshIndex].material[`${mapName}MapOffset`];
                const materialTiling =  this.entity.render.meshInstances[meshIndex].material[`${mapName}MapTiling`];
                const parameterValue0 =  this.entity.render.meshInstances[meshIndex].getParameter("texture_" + mapName + "MapTransform0")?.data;
                const parameterValue1 =  this.entity.render.meshInstances[meshIndex].getParameter("texture_" + mapName + "MapTransform1")?.data;

                let uniform0 =  parameterValue0 || [materialTiling.x, 0, materialOffset.x];
                let uniform1 = parameterValue1 || [0, materialTiling.y, materialOffset.y];

                if (meshIndex == 1) {  //left-right
                    uniform0[0] = this.zTiling;
                    uniform1[1] = this.yTIling;
                    // uniform0 = [this.zTiling, 0, 0];
                    // uniform1 = [0, this.yTIling, 0];
                } else if (meshIndex == 2) { //front-back
                   uniform0[0] = this.xTiling;
                    uniform1[1] = this.yTIling;
                    // uniform0 = [this.xTiling, 0, 0];
                    // uniform1 = [0, this.yTIling, 0];
                } else if (meshIndex == 0) {  //up-down
                    uniform0[0] = this.xTiling;
                    uniform1[1] = this.zTiling;
                    // uniform0 = [this.xTiling, 0, 0];
                    // uniform1 = [0, this.zTiling, 0];
                }
      
                this.entity.render.meshInstances[meshIndex].setParameter("texture_" + mapName + "MapTransform0", uniform0);
                this.entity.render.meshInstances[meshIndex].setParameter("texture_" + mapName + "MapTransform1", uniform1);
            }
        })

        // if (changeDiffuseColor && diffuseColor) {
        //     this.entity.render.meshInstances[meshIndex].setParameter("material_diffuse", [diffuseColor.r, diffuseColor.g, diffuseColor.b]);
        // }

    }
};

TextureTiling.prototype.update = function (dt) {

};


// textureOffset.js
var TextureOffset = pc.createScript('textureOffset');

TextureOffset.attributes.add('resetMaterialOffset', {
    type: 'boolean',
    title: 'Reset offset (0 -> 0.001)',
    default: true
});



TextureOffset.attributes.add('affectedMaps', {
    type: 'json',
    title: 'Affected maps',
    schema: [{
        name: "diffuse",
        type: 'boolean',
        default: true
    }, {
        name: "emissive",
        type: 'boolean',
        default: true
    }, {
        name: "opacity",
        type: 'boolean',
        default: true
    }, {
        name: "normal",
        type: 'boolean',
        default: true
    }, {
        name: "light",
        type: 'boolean',
        default: true
    },
    ]
});



TextureOffset.prototype.initialize = function() {
    if(this.resetMaterialOffset) {
        this.setNonUniformOffset();
    }

    this.offsetValueX = Math.random();
    this.offsetValueY = Math.random();

    // this.entity.render.meshInstances.forEach(mi => {
    //     mi.material = mi.material.clone();
    //     mi.material.diffuseMapOffset = new pc.Vec2(this.offsetValueX, this.offsetValueY);
    // })

    this.setRandomOffset();
};

TextureOffset.prototype.setNonUniformOffset = function () {
    const mapNames = Object.keys(this.affectedMaps);
    this.entity.render.meshInstances.forEach(mi => {
        mapNames.forEach(mapName => {
            if (mi.material[`${mapName}MapOffset`].x === 0 && mi.material[`${mapName}MapOffset`].y === 0) {
                mi.material[`${mapName}MapOffset`].x += 0.001;
                mi.material[`${mapName}MapOffset`].y += 0.001;
                mi.material.update();
            }
        })
    });
}

TextureOffset.prototype.setRandomOffset = function() {
    for (let meshIndex = 0; meshIndex < this.entity.render.meshInstances.length; meshIndex++) {

        const mapNames = Object.keys(this.affectedMaps);
        mapNames.forEach(mapName => {
            if(this.affectedMaps[mapName]) {
                const materialOffset =  this.entity.render.meshInstances[meshIndex].material[`${mapName}MapOffset`];
                const materialTiling =  this.entity.render.meshInstances[meshIndex].material[`${mapName}MapTiling`];
                const parameterValue0 =  this.entity.render.meshInstances[meshIndex].getParameter("texture_" + mapName + "MapTransform0")?.data;
                const parameterValue1 =  this.entity.render.meshInstances[meshIndex].getParameter("texture_" + mapName + "MapTransform1")?.data;

                let uniform0 = parameterValue0 || [materialTiling.x, 0, materialOffset.x];
                let uniform1 = parameterValue1 || [0, materialTiling.y, materialOffset.y];

                uniform0[2] = this.offsetValueX;
                uniform1[2] = this.offsetValueY;

                this.entity.render.meshInstances[meshIndex].setParameter("texture_" + mapName + "MapTransform0", uniform0);
                this.entity.render.meshInstances[meshIndex].setParameter("texture_" + mapName + "MapTransform1", uniform1);
            }
        });
    }
};


TextureOffset.prototype.update = function(dt) {

};


// HierarchyManager.js
var HierarchyManager = pc.createScript('hierarchyManager');


HierarchyManager.getInstance = function () {
    if (!HierarchyManager._instance) console.error('HierarchyManager is not initialized yet');
    return HierarchyManager._instance;
};

HierarchyManager.prototype.initialize = function () {
    HierarchyManager._app = this.app;
    if (!HierarchyManager._instance) {
        HierarchyManager._instance = this;
    }

    this.hierarchyNameMap = new Map();
    this.hierarchyPathMap = new Map();
};

HierarchyManager.prototype.getByName = function (name) {
    const result = this.hierarchyNameMap.get(name);
    if (result) {
        return result;
    } else {
        const foundResult = this.app.root.findByName(name);
        if (foundResult) {
            this.hierarchyNameMap.set(name, foundResult);
            return foundResult;
        } else {
            console.error(`Entity [ ${name} ] not found in hierarchy!`);
        }
    }
};


HierarchyManager.prototype.getByPath = function (path) {
    if (!path.startsWith("Root")) path = "Root/" + path;
    const result = this.hierarchyPathMap.get(path);
    if (result) {
        return result;
    } else {
        const foundResult = this.app.root.findByPath(path);
        if (foundResult) {
            this.hierarchyPathMap.set(path, foundResult);
            return foundResult;
        } else {
            console.error(`Entity path ${path} not found in hierarchy!`);
        }
    }
};



HierarchyManager.prototype.update = function (dt) {

};


// famobiSafeArea.js
//@ts-nocheck
/**
 * A script that automatically adds required gaps & resizes game canvas to fit Famobi interstitial banner.
 * 
 * How to use: just attach that script to the Root component of your Playcanvas app.
 * To test how it works, please use 'Debug / Testing Mode' attribute of the script. Don't forget to disable debug mode before publising a build! :)
 * 
 *  If you are using Window Resize API (window.onresize(...) or window.addEventListener('resize', ....)),
 *  please get rid of these. Instead , please listen to 'famobi:resizeCanvas' in-app event. For example: 
 * 
 *      this.app.on('famobi:resizeCanvas', function(canvasWidth, canvasHeight) {
 *          console.log('Adjusted canvas size is ', canvasWidth, canvasHeight);
 *      })
 * 
 * 
 * @author Igor Parada / ©Famobi 2023
 */

var FamobiSafeArea = pc.createScript('famobiSafeArea');

FamobiSafeArea.attributes.add('resizeOnInput', {
    type: 'boolean',
    title: 'Resize when input received',
    description: "Resize the canvas every time an input event is received? This may help if the game reports incorrect input positions due to Famobi offsets but may cause slight CPU overhead in some games.",
    default: true
});

FamobiSafeArea.attributes.add('forceBodyBackgroundColor', {
    type: 'boolean',
    default: true,
    title: 'Change <body> background',
    default: true
});

FamobiSafeArea.attributes.add('bodyBackgroundColor', {
    type: 'rgba',
    title: 'Body Background Color',
    description: "Background color of body element (where the banner should be displayed). Make sure the checkbox above is checked!",
    default: [0, 0, 0, 1.0]
})

FamobiSafeArea.attributes.add('debugConfig', {
    type: 'json',
    title: 'Debug / Testing Mode',
    description: 'Force safe areas to be applied to the UI. Useful testing layouts without a device.',
    schema: [{
        name: 'active',
        type: 'boolean',
        default: false
    }, {
        name: 'top',
        type: 'number',
        default: 0
    }, {
        name: 'bottom',
        type: 'number',
        default: 0
    }, {
        name: 'left',
        type: 'number',
        default: 0
    }, {
        name: 'right',
        type: 'number',
        default: 0
    }]
});



FamobiSafeArea.prototype.initialize = function () {
    this.app.graphicsDevice.on('resizecanvas', this._onCanvasResize, this);

    this.on('attr:debugConfig', function (value, prev) {
        this._updateCanvasSizeAndPosition();
    }, this);

    this.on('attr:bodyBackgroundColor', function (value, prev) {
        this._backgroundColorUpdate();
    }, this);

    this.on('destroy', function () {
        this.app.graphicsDevice.off('resizecanvas', this._onCanvasResize, this);
    }, this);


    


    /** viewport resize handling **/
    if (window.visualViewport) {
        this.useVisualViewport = true;
        window.visualViewport.addEventListener('resize', this._onCanvasResize.bind(this));
    } else {
        this.useVisualViewport = false;
        window.addEventListener('resize', this._onCanvasResize.bind(this), true);
    }

    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this._dispatchInputEvent, this);
    } 
    if (this.app.mouse) {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this._dispatchInputEvent, this);
    } 

    this._onCanvasResize();

    this.app.getFamobiAdjustedCanvasSize = () => {
        return {
            width: this._currentCanvasWidth,
            height: this._currentCanvasHeight
        }
    }

};

FamobiSafeArea.prototype._dispatchInputEvent = function() {
    if(this.resizeOnInput) {
        this._updateCanvasSizeAndPosition();
    } else {
        if(!this._firstInputEventReceived) {
            this._firstInputEventReceived = true;
            this._onCanvasResize();
        }
    }
}

FamobiSafeArea.prototype._onCanvasResize = function () {
    this._updateCanvasSizeAndPosition();

    /* known issue on iOS - window.resize may report incorrect window size, so we slightly delay the resize logic */
    if (pc.platform.ios || pc.platform.mobile) {
        setTimeout(() => this._updateCanvasSizeAndPosition(), 1500);
    }
};


FamobiSafeArea.prototype._updateCanvasSizeAndPosition = function () {

    let topPixels = 0;
    let bottomPixels = 0;
    let leftPixels = 0;
    let rightPixels = 0;

    if (this.debugConfig.active) {
        topPixels = this.debugConfig.top;
        bottomPixels = this.debugConfig.bottom;
        leftPixels = this.debugConfig.left;
        rightPixels = this.debugConfig.right;
    } else {
        let famobiOffsets = { left: 0, top: 0, right: 0, bottom: 0 };
        

        topPixels = famobiOffsets.top;
        bottomPixels = famobiOffsets.bottom;
        leftPixels = famobiOffsets.left;
        rightPixels = famobiOffsets.right;
    }


    const screenResHeight = this.useVisualViewport ? window.visualViewport.height : window.innerHeight;
    const screenResWidth = this.useVisualViewport ? window.visualViewport.width : window.innerWidth;

    leftPixels = Math.min(screenResWidth * 0.9, leftPixels);
    rightPixels = Math.min(screenResWidth * 0.9, rightPixels);
    topPixels = Math.min(screenResHeight * 0.9, topPixels);
    bottomPixels = Math.min(screenResHeight * 0.9, bottomPixels);

    const availableWidth = screenResWidth - leftPixels - rightPixels;
    const availableHeight = screenResHeight - topPixels - bottomPixels;

    this._currentCanvasWidth = availableWidth;
    this._currentCanvasHeight = availableHeight;

    this.app.setCanvasResolution(pc.RESOLUTION_FIXED, availableWidth, availableHeight);
    this.app.graphicsDevice.canvas.style.width = availableWidth + 'px';
    this.app.graphicsDevice.canvas.style.height = availableHeight + 'px';

    this.app.graphicsDevice.canvas.style.left = leftPixels + 'px';
    this.app.graphicsDevice.canvas.style.right = rightPixels + 'px';
    this.app.graphicsDevice.canvas.style.top = topPixels + 'px';
    this.app.graphicsDevice.canvas.style.bottom = bottomPixels + 'px';

    if (this.debugConfig.active) {
        console.log(`Canvas size set to ${availableWidth}x${availableHeight} (window ${window.innerWidth}x${window.innerHeight})`);
    }

    this.app.fire('famobi:resizeCanvas', availableWidth, availableHeight);

    this._backgroundColorUpdate();
};

FamobiSafeArea.prototype._backgroundColorUpdate = function () {
    if (!this.forceBodyBackgroundColor) return;
    const parentElement = this.app.graphicsDevice.canvas.parentElement;
    if (parentElement) {
        parentElement.style.background = this.bodyBackgroundColor.toString();
    }
}


FamobiSafeArea.prototype.update = function (dt) {

};


/** Fix for camera/input **/

pc.CameraComponent.prototype.screenToWorld = function (screenx, screeny, cameraz, worldCoord) {
    const device = this.system.app.graphicsDevice;
    const w = device.width / device.maxPixelRatio;
    const h = device.height / device.maxPixelRatio;
    return this._camera.screenToWorld(screenx, screeny, cameraz, w, h, worldCoord);
}


pc.CameraComponent.prototype.worldToScreen = function (worldCoord, screenCoord) {
    const device = this.system.app.graphicsDevice;
    const w = device.width / device.maxPixelRatio;
    const h = device.height / device.maxPixelRatio;
    return this._camera.worldToScreen(worldCoord, w, h, screenCoord);
}

// physics-constraints.js
//@ts-nocheck
//
// UTILS
//
function getOrthogonalVectors(n, p, q) {
    // From the Bullet sourcebase. See btPlaneSpace1.
    // Generate two suitable orthogonal vectors to n.
    var a, k;
    if (Math.abs(n.z) > 0.7071067811865475244008443621048490) {
        // choose p in y-z plane
        a = n.y * n.y + n.z * n.z;
        k = 1 / Math.sqrt(a);
        p.x = 0;
        p.y = -n.z * k;
        p.z = n.y * k;
        // set q = n x p
        q.x = a * k;
        q.y = -n.x * p.z;
        q.z = n.x * p.y;
    } else {
        // choose p in x-y plane
        a = n.x * n.x + n.y * n.y;
        k = 1 / Math.sqrt(a);
        p.x = -n.y * k;
        p.y = n.x * k;
        p.z = 0;
        // set q = n x p
        q.x = -n.z * p.y;
        q.y = n.z * p.x;
        q.z = a * k;
    }
}


//
// PointToPointConstraint
//
var PointToPointConstraint = pc.createScript('pointToPointConstraint');

PointToPointConstraint.attributes.add('pivotA', {
    title: 'Pivot',
    description: 'Position of the constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
PointToPointConstraint.attributes.add('entityB', {
    title: 'Connected Entity',
    description: 'Optional second entity',
    type: 'entity'
});
PointToPointConstraint.attributes.add('pivotB', {
    title: 'Connected Pivot',
    description: 'Position of the constraint in the local space of entity B (if specified).',
    type: 'vec3',
    default: [0, 0, 0]
});
PointToPointConstraint.attributes.add('breakingThreshold', {
    title: 'Break Threshold',
    description: 'Maximum breaking impulse threshold required to break the constraint.',
    type: 'number',
    default: 3.4e+38
});
PointToPointConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});
PointToPointConstraint.attributes.add('debugRender', {
    title: 'Debug Render',
    description: 'Enable to render a representation of the constraint.',
    type: 'boolean',
    default: false
});
PointToPointConstraint.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

// initialize code called once per entity
PointToPointConstraint.prototype.initialize = function() {
    this.on('attr', function(name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'pivotA' || name === 'entityB' || name === 'pivotB') {
            this.createConstraint();
        } else if (name === 'breakingThreshold') {
            this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
            this.activate();
        }
    });
    this.on('destroy', function () {
        this.destroyConstraint();
    });
};

PointToPointConstraint.prototype.createConstraint = function() {
    if (this.constraint) {
        this.destroyConstraint();
    }

    if (!this.entity.rigidbody || !this.entity.rigidbody.body) {
        return;
    }
    if (this.entityB && this.entityB.rigidbody && !this.entityB.rigidbody.body) {
        return;
    }

    var bodyA = this.entity.rigidbody.body;
    var pivotA = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    if (this.entityB && this.entityB.rigidbody) {
        var bodyB = this.entityB.rigidbody.body;
        var pivotB = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        this.constraint = new Ammo.btPoint2PointConstraint(bodyA, bodyB, pivotA, pivotB);
    } else {
        this.constraint = new Ammo.btPoint2PointConstraint(bodyA, pivotA);
    }

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);
    
    this.activate();
};

PointToPointConstraint.prototype.destroyConstraint = function() {
    if (this.constraint) {
        var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
        dynamicsWorld.removeConstraint(this.constraint);
        Ammo.destroy(this.constraint);
        this.constraint = null;
    }
};

PointToPointConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate();
    if (this.entityB) {
        this.entityB.rigidbody.activate();
    }
};

// update code called every frame
PointToPointConstraint.prototype.update = function(dt) {
    const bodyA = this.entity.rigidbody && this.entity.rigidbody.body;
    const bodyBReady = !this.entityB || !this.entityB.rigidbody || !!this.entityB.rigidbody.body;
    const bodiesReady = !!bodyA && bodyBReady;

    if (bodiesReady && !this.constraint) {
        this.createConstraint();
    } else if (!bodiesReady && this.constraint) {
        this.destroyConstraint();
    }

    if (this.debugRender) {
        // Note that it's generally bad to allocate new objects in an update function
        // but this is just for debug rendering and will normally be disabled
        var tempVecA = new pc.Vec3();
        this.entity.getWorldTransform().transformPoint(this.pivotA, tempVecA);
        this.app.renderLine(this.entity.getPosition(), tempVecA, this.debugColor);
        if (this.entityB) {
            this.app.renderLine(this.entityB.getPosition(), tempVecA, this.debugColor);
        }
    }
};


//
// HingeConstraint
//
var HingeConstraint = pc.createScript('hingeConstraint');

HingeConstraint.attributes.add('pivotA', {
    title: 'Pivot',
    description: 'Position of the constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
HingeConstraint.attributes.add('axisA', {
    title: 'Axis',
    description: 'Axis of rotation of the constraint in the local space this entity.',
    type: 'vec3',
    default: [0, 1, 0]
});
HingeConstraint.attributes.add('entityB', {
    title: 'Connected Entity',
    description: 'Optional second connected entity.',
    type: 'entity'
});
HingeConstraint.attributes.add('pivotB', {
    title: 'Connected Pivot',
    description: 'Position of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 0, 0]
});
HingeConstraint.attributes.add('axisB', {
    title: 'Connected Axis',
    description: 'Axis of rotation of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 1, 0]
});
HingeConstraint.attributes.add('limits', {
    title: 'Limits',
    description: 'Low and high angular limits for the constraint in degrees. By default, low is greater than high meaning no limits.',
    type: 'vec2',
    default: [1, -1]
});
HingeConstraint.attributes.add('softness', {
    title: 'Softness',
    description: 'Softness of the constraint. Recommend 0.8 to 1. Describes the percentage of limits where movement is free. Beyond this softness percentage, the limit is gradually enforced until the "hard" (1.0) limit is reached.',
    type: 'number',
    min: 0,
    max: 1,
    default: 0.9
});
HingeConstraint.attributes.add('biasFactor', {
    title: 'Bias Factor',
    description: 'Bias factor of the constraint. Recommend 0.3 +/- approximately 0.3. Strength with which constraint resists zeroth order (angular, not angular velocity) limit violation.',
    type: 'number',
    min: 0,
    max: 1,
    default: 0.3
});
HingeConstraint.attributes.add('relaxationFactor', {
    title: 'Relaxation Factor',
    description: 'Relaxation factor of the constraint. Recommend to keep this near 1. The lower the value, the less the constraint will fight velocities which violate the angular limits.',
    type: 'number',
    min: 0,
    max: 1,
    default: 1
});
HingeConstraint.attributes.add('enableMotor', {
    title: 'Use Motor',
    description: 'Enable a motor to power the automatic rotation around the hinge axis.',
    type: 'boolean',
    default: false
});
HingeConstraint.attributes.add('motorTargetVelocity', {
    title: 'Target Velocity',
    description: 'Target motor angular velocity.',
    type: 'number',
    default: 0
});
HingeConstraint.attributes.add('maxMotorImpulse', {
    title: 'Max Motor Impulse',
    description: 'Maximum motor impulse.',
    type: 'number',
    default: 0
});
HingeConstraint.attributes.add('breakingThreshold', {
    title: 'Break Threshold',
    description: 'Maximum breaking impulse threshold required to break the constraint.',
    type: 'number',
    default: 3.4e+38
});
HingeConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});
HingeConstraint.attributes.add('debugRender', {
    title: 'Debug Render',
    description: 'Enable to render a representation of the constraint.',
    type: 'boolean',
    default: false
});
HingeConstraint.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

// initialize code called once per entity
HingeConstraint.prototype.initialize = function() {
    this.on('attr', function(name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'pivotA' || name === 'axisA' || name === 'entityB' || name === 'pivotB' || name === 'axisB') {
            this.createConstraint();
        } else if (name === 'limits' || name === 'softness' || name === 'biasFactor' || name === 'relaxationFactor') {
            // setLimit takes angles in radians
            var low = this.limits.x * Math.PI / 180;
            var high = this.limits.y * Math.PI / 180;
            this.constraint.setLimit(low, high, this.softness, this.biasFactor, this.relaxationFactor);
        } else if (name === 'enableMotor' || name === 'motorTargetVelocity' || name === 'maxMotorImpulse') {
            this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse);
            this.activate();
        } else if (name === 'breakingThreshold') {
            this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
            this.activate();
        }
    });
    // this.on('enable', function () {
    //     this.createConstraint();
    // });
    // this.on('disable', function () {
    //     this.destroyConstraint();
    // });
    this.on('destroy', function () {
        this.destroyConstraint();
    });

    // this.createConstraint();
};

HingeConstraint.prototype.createConstraint = function() {
    if (this.constraint) {
        this.destroyConstraint();
    }

    if (!this.entity.rigidbody || !this.entity.rigidbody.body) {
        return;
    }
    if (this.entityB && this.entityB.rigidbody && !this.entityB.rigidbody.body) {
        return;
    }

    var v1 = new pc.Vec3();
    var v2 = new pc.Vec3();
    var q = new pc.Quat();
    var m = new pc.Mat4();

    var bodyA = this.entity.rigidbody.body;
    var pivotA = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);

    getOrthogonalVectors(this.axisA, v1, v2);
    m.set([
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        this.axisA.x, this.axisA.y, this.axisA.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);

    if (this.entityB && this.entityB.rigidbody) {
        var bodyB = this.entityB.rigidbody.body;
        var pivotB = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);

        getOrthogonalVectors(this.axisB, v1, v2);
        m.set([
            v1.x, v1.y, v1.z, 0,
            v2.x, v2.y, v2.z, 0,
            this.axisB.x, this.axisB.y, this.axisB.z, 0,
            0, 0, 0, 1
        ]);
        q.setFromMat4(m);

        var quatB = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
        var frameB = new Ammo.btTransform(quatB, pivotB);

        this.constraint = new Ammo.btHingeConstraint(bodyA, bodyB, frameA, frameB, false);

        Ammo.destroy(frameB);
        Ammo.destroy(quatB);
        Ammo.destroy(pivotB);
    } else {
        this.constraint = new Ammo.btHingeConstraint(bodyA, frameA, false);
    }

    var low = this.limits.x * Math.PI / 180;
    var high = this.limits.y * Math.PI / 180;
    this.constraint.setLimit(low, high, this.softness, this.biasFactor, this.relaxationFactor);
    this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
    this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse);

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.activate();
};

HingeConstraint.prototype.destroyConstraint = function() {
    if (this.constraint) {
        var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
        dynamicsWorld.removeConstraint(this.constraint);
        Ammo.destroy(this.constraint);
        this.constraint = null;
    }
};

HingeConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate();
    if (this.entityB) {
        this.entityB.rigidbody.activate();
    }
};

// update code called every frame
HingeConstraint.prototype.update = function(dt) {
    const bodyA = this.entity.rigidbody && this.entity.rigidbody.body;
    const bodyBReady = !this.entityB || !this.entityB.rigidbody || !!this.entityB.rigidbody.body;
    const bodiesReady = !!bodyA && bodyBReady;

    if (bodiesReady && !this.constraint) {
        this.createConstraint();
    } else if (!bodiesReady && this.constraint) {
        this.destroyConstraint();
    }

    if (this.debugRender) {
        // Note that it's generally bad to allocate new objects in an update function
        // but this is just for debug rendering and will normally be disabled
        var tempVecA = new pc.Vec3();
        var tempVecB = new pc.Vec3();
        var tempVecC = new pc.Vec3();
        var tempVecD = new pc.Vec3();
        var worldTransform = this.entity.getWorldTransform();
        worldTransform.transformPoint(this.pivotA, tempVecA);
        worldTransform.transformVector(this.axisA, tempVecB);

        tempVecB.normalize().scale(0.5);
        tempVecC.add2(tempVecA, tempVecB);
        tempVecD.sub2(tempVecA, tempVecB);

        this.app.drawLine(this.entity.getPosition(), tempVecA, this.debugColor, false, this.app.scene.layers.getLayerById(pc.LAYERID_UI));
        this.app.drawLine(tempVecC, tempVecD, this.debugColor, false, this.app.scene.layers.getLayerById(pc.LAYERID_UI));

        if (this.entityB) {
            this.app.drawLine(this.entityB.getPosition(), tempVecA, this.debugColor, false, this.app.scene.layers.getLayerById(pc.LAYERID_UI));
        }
    }
};


//
// ConeTwistConstraint
//
/*
Overview:

btConeTwistConstraint can be used to simulate ragdoll joints (upper arm, leg etc).
It is a fixed translation, 3 degree-of-freedom (DOF) rotational "joint".
It divides the 3 rotational DOFs into swing (movement within a cone) and twist.
Swing is divided into swing1 and swing2 which can have different limits, giving an elliptical shape.
(Note: the cone's base isn't flat, so this ellipse is "embedded" on the surface of a sphere.)

In the contraint's frame of reference:
twist is along the x-axis,
and swing 1 and 2 are along the z and y axes respectively.
*/
var ConeTwistConstraint = pc.createScript('coneTwistConstraint');

ConeTwistConstraint.attributes.add('pivotA', {
    title: 'Pivot',
    description: 'Position of the constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
ConeTwistConstraint.attributes.add('axisA', {
    title: 'Axis',
    description: 'Axis of rotation of the constraint in the local space this entity.',
    type: 'vec3',
    default: [0, 1, 0]
});
ConeTwistConstraint.attributes.add('entityB', {
    title: 'Connected Entity',
    description: 'Optional second connected entity.',
    type: 'entity'
});
ConeTwistConstraint.attributes.add('pivotB', {
    title: 'Connected Pivot',
    description: 'Position of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 0, 0]
});
ConeTwistConstraint.attributes.add('axisB', {
    title: 'Connected Axis',
    description: 'Axis of rotation of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 1, 0]
});
ConeTwistConstraint.attributes.add('swingSpan1', {
    title: 'Swing 1 Limit',
    description: 'The Swing 1 Limit limits the rotation around the swing axis. Swing 1 Limit limits an axis of rotation orthogonal to the twist axis and Swing Limit 2. The limit angle is symmetric. Therefore, a value of 20 will limit the rotation between -20 and 20 degrees.',
    type: 'number',
    default: 1e+30
});
ConeTwistConstraint.attributes.add('swingSpan2', {
    title: 'Swing 2 Limit',
    description: 'The Swing 2 Limit limits the rotation around the swing axis. Swing 2 Limit limits an axis of rotation orthogonal to the twist axis and Swing Limit 1. The limit angle is symmetric. Therefore, a value of 20 will limit the rotation between -20 and 20 degrees.',
    type: 'number',
    default: 1e+30
});
ConeTwistConstraint.attributes.add('twistSpan', {
    title: 'Twist Limit',
    description: 'The Twist Limit limits the rotation around the twist axis. The limit angle is symmetric. Therefore, a value of 20 will limit the twist rotation between -20 and 20 degrees.',
    type: 'number',
    default: 1e+30
});
ConeTwistConstraint.attributes.add('breakingThreshold', {
    title: 'Break Threshold',
    description: 'Maximum breaking impulse threshold required to break the constraint.',
    type: 'number',
    default: 1e+30
});
ConeTwistConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});
ConeTwistConstraint.attributes.add('debugRender', {
    title: 'Debug Render',
    description: 'Enable to render a representation of the constraint.',
    type: 'boolean',
    default: false
});
ConeTwistConstraint.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

// initialize code called once per entity
ConeTwistConstraint.prototype.initialize = function() {
    this.on('attr', function(name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'pivotA' || name === 'axisA' || name === 'entityB' || name === 'pivotB' || name === 'axisB') {
            this.createConstraint();
        } else if (name === 'swingSpan1') {
            this.constraint.setLimit(5, this.swingSpan1 * Math.PI / 180);
            this.activate();
        } else if (name === 'swingSpan2') {
            this.constraint.setLimit(4, this.swingSpan2 * Math.PI / 180);
            this.activate();
        } else if (name === 'twistSpan') {
            this.constraint.setLimit(3, this.twistSpan * Math.PI / 180);
            this.activate();
        } else if (name === 'breakingThreshold') {
            this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
            this.activate();
        }
    });
    this.on('destroy', function () {
        this.destroyConstraint();
    });
};

ConeTwistConstraint.prototype.createConstraint = function() {
    if (this.constraint) {
        this.destroyConstraint();
    }

    if (!this.entity.rigidbody || !this.entity.rigidbody.body) {
        return;
    }
    if (this.entityB && this.entityB.rigidbody && !this.entityB.rigidbody.body) {
        return;
    }

    var v1 = new pc.Vec3();
    var v2 = new pc.Vec3();
    var q = new pc.Quat();
    var m = new pc.Mat4();

    var bodyA = this.entity.rigidbody.body;
    var pivotA = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);

    getOrthogonalVectors(this.axisA, v1, v2);
    m.set([
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        this.axisA.x, this.axisA.y, this.axisA.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);

    if (this.entityB && this.entityB.rigidbody) {
        var bodyB = this.entityB.rigidbody.body;
        var pivotB = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);

        getOrthogonalVectors(this.axisB, v1, v2);
        m.set([
            v1.x, v1.y, v1.z, 0,
            v2.x, v2.y, v2.z, 0,
            this.axisB.x, this.axisB.y, this.axisB.z, 0,
            0, 0, 0, 1
        ]);
        q.setFromMat4(m);

        var quatB = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
        var frameB = new Ammo.btTransform(quatB, pivotB);

        this.constraint = new Ammo.btConeTwistConstraint(bodyA, bodyB, frameA, frameB);

        Ammo.destroy(frameB);
        Ammo.destroy(quatB);
        Ammo.destroy(pivotB);
    } else {
        this.constraint = new Ammo.btConeTwistConstraint(bodyA, frameA);
    }

    this.constraint.setLimit(3, this.twistSpan * Math.PI / 180);
    this.constraint.setLimit(4, this.swingSpan2 * Math.PI / 180);
    this.constraint.setLimit(5, this.swingSpan1 * Math.PI / 180);
    this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.activate();
};

ConeTwistConstraint.prototype.destroyConstraint = function() {
    if (this.constraint) {
        var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
        dynamicsWorld.removeConstraint(this.constraint);
        Ammo.destroy(this.constraint);
        this.constraint = null;
    }
};

ConeTwistConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate();
    if (this.entityB) {
        this.entityB.rigidbody.activate();
    }
};

// update code called every frame
ConeTwistConstraint.prototype.update = function(dt) {
    const bodyA = this.entity.rigidbody && this.entity.rigidbody.body;
    const bodyBReady = !this.entityB || !this.entityB.rigidbody || !!this.entityB.rigidbody.body;
    const bodiesReady = !!bodyA && bodyBReady;

    if (bodiesReady && !this.constraint) {
        this.createConstraint();
    } else if (!bodiesReady && this.constraint) {
        this.destroyConstraint();
    }

    if (this.debugRender) {
        this.app.renderLine(this.entity.getPosition(), pc.Vec3.ZERO, this.debugColor);
    }
};


//
// SliderConstraint
//
var SliderConstraint = pc.createScript('sliderConstraint');

SliderConstraint.attributes.add('pivotA', {
    title: 'Pivot',
    description: 'Position of the constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
SliderConstraint.attributes.add('axisA', {
    title: 'Axis',
    description: 'Axis of rotation of the constraint in the local space this entity.',
    type: 'vec3',
    default: [0, 1, 0]
});
SliderConstraint.attributes.add('entityB', {
    title: 'Connected Entity',
    description: 'Optional second connected entity.',
    type: 'entity'
});
SliderConstraint.attributes.add('pivotB', {
    title: 'Connected Pivot',
    description: 'Position of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 0, 0]
});
SliderConstraint.attributes.add('axisB', {
    title: 'Connected Axis',
    description: 'Axis of rotation of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 1, 0]
});
SliderConstraint.attributes.add('linearLimits', {
    title: 'Linear Limits',
    description: 'Linear limits of the constraint.',
    type: 'vec2',
    default: [1, -1]
});
SliderConstraint.attributes.add('angularLimits', {
    title: 'Angular Limits',
    description: 'Angular limits of the constraint.',
    type: 'vec2',
    default: [0, 0]
});
SliderConstraint.attributes.add('breakingThreshold', {
    title: 'Break Threshold',
    description: 'Maximum breaking impulse threshold required to break the constraint.',
    type: 'number',
    default: 1e+30
});
SliderConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});
SliderConstraint.attributes.add('debugRender', {
    title: 'Debug Render',
    description: 'Enable to render a representation of the constraint.',
    type: 'boolean',
    default: false
});
SliderConstraint.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

// initialize code called once per entity
SliderConstraint.prototype.initialize = function() {
    this.on('attr', function(name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'pivotA' || name === 'axisA' || name === 'entityB' || name === 'pivotB' || name === 'axisB') {
            this.createConstraint();
        } else if (name === 'linearLimits') {
            this.constraint.setLowerLinLimit(this.linearLimits.x);
            this.constraint.setUpperLinLimit(this.linearLimits.y);
            this.activate();
        } else if (name === 'angularLimits') {
            this.constraint.setLowerAngLimit(this.angularLimits.x);
            this.constraint.setUpperAngLimit(this.angularLimits.y);
            this.activate();
        } else if (name === 'breakingThreshold') {
            this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
            this.activate();
        }
    });
    this.on('destroy', function () {
        this.destroyConstraint();
    });
};

SliderConstraint.prototype.createConstraint = function() {
    if (this.constraint) {
        this.destroyConstraint();
    }

    if (!this.entity.rigidbody || !this.entity.rigidbody.body) {
        return;
    }
    if (this.entityB && this.entityB.rigidbody && !this.entityB.rigidbody.body) {
        return;
    }

    var v1 = new pc.Vec3();
    var v2 = new pc.Vec3();
    var q = new pc.Quat();
    var m = new pc.Mat4();

    var bodyA = this.entity.rigidbody.body;
    var pivotA = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);

    getOrthogonalVectors(this.axisA, v1, v2);
    m.set([
        this.axisA.x, this.axisA.y, this.axisA.z, 0,
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);
    frameA.setOrigin(pivotA);

    if (this.entityB && this.entityB.rigidbody) {
        var bodyB = this.entityB.rigidbody.body;
        var pivotB = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);

        getOrthogonalVectors(this.axisB, v1, v2);
        m.set([
            v1.x, v1.y, v1.z, 0,
            v2.x, v2.y, v2.z, 0,
            this.axisB.x, this.axisB.y, this.axisB.z, 0,
            0, 0, 0, 1
        ]);
        q.setFromMat4(m);

        var quatB = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
        var frameB = new Ammo.btTransform(quatB, pivotB);

        this.constraint = new Ammo.btSliderConstraint(bodyA, bodyB, frameA, frameB);

        Ammo.destroy(frameB);
        Ammo.destroy(quatB);
        Ammo.destroy(pivotB);
    } else {
        this.constraint = new Ammo.btSliderConstraint(bodyA, frameA);
    }

    this.constraint.setLowerLinLimit(this.linearLimits.x);
    this.constraint.setUpperLinLimit(this.linearLimits.y);
    this.constraint.setLowerAngLimit(this.angularLimits.x);
    this.constraint.setUpperAngLimit(this.angularLimits.y);
    this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.activate();
};

SliderConstraint.prototype.destroyConstraint = function() {
    if (this.constraint) {
        var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
        dynamicsWorld.removeConstraint(this.constraint);
        Ammo.destroy(this.constraint);
        this.constraint = null;
    }
};

SliderConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate();
    if (this.entityB) {
        this.entityB.rigidbody.activate();
    }
};

// update code called every frame
SliderConstraint.prototype.update = function(dt) {
    const bodyA = this.entity.rigidbody && this.entity.rigidbody.body;
    const bodyBReady = !this.entityB || !this.entityB.rigidbody || !!this.entityB.rigidbody.body;
    const bodiesReady = !!bodyA && bodyBReady;

    if (bodiesReady && !this.constraint) {
        this.createConstraint();
    } else if (!bodiesReady && this.constraint) {
        this.destroyConstraint();
    }
};

//
// Generic6DofConstraint
//
var Generic6DofConstraint = pc.createScript('generic6DofConstraint');

Generic6DofConstraint.attributes.add('pivotA', {
    title: 'Pivot',
    description: 'Position of the constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
Generic6DofConstraint.attributes.add('axisA', {
    title: 'Axis',
    description: 'Axis of rotation of the constraint in the local space this entity.',
    type: 'vec3',
    default: [0, 1, 0]
});
Generic6DofConstraint.attributes.add('entityB', {
    title: 'Connected Entity',
    description: 'Optional second connected entity.',
    type: 'entity'
});
Generic6DofConstraint.attributes.add('pivotB', {
    title: 'Connected Pivot',
    description: 'Position of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 0, 0]
});
Generic6DofConstraint.attributes.add('axisB', {
    title: 'Connected Axis',
    description: 'Axis of rotation of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 1, 0]
});
Generic6DofConstraint.attributes.add('linearLimits', {
    title: 'Linear Limits',
    description: 'Linear limits of the constraint.',
    type: 'vec2',
    default: [1, -1]
});
Generic6DofConstraint.attributes.add('angularLimits', {
    title: 'Angular Limits',
    description: 'Angular limits of the constraint.',
    type: 'vec2',
    default: [0, 0]
});
Generic6DofConstraint.attributes.add('breakingThreshold', {
    title: 'Break Threshold',
    description: 'Maximum breaking impulse threshold required to break the constraint.',
    type: 'number',
    default: 1e+30
});
Generic6DofConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});
Generic6DofConstraint.attributes.add('debugRender', {
    title: 'Debug Render',
    description: 'Enable to render a representation of the constraint.',
    type: 'boolean',
    default: false
});
Generic6DofConstraint.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

// initialize code called once per entity
Generic6DofConstraint.prototype.initialize = function() {
    this.on('attr', function(name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'pivotA' || name === 'axisA' || name === 'entityB' || name === 'pivotB' || name === 'axisB') {
            this.createConstraint();
        } else if (name === 'linearLimits') {
            this.constraint.setLowerLinLimit(this.linearLimits.x);
            this.constraint.setUpperLinLimit(this.linearLimits.y);
            this.activate();
        } else if (name === 'angularLimits') {
            this.constraint.setLowerAngLimit(this.angularLimits.x);
            this.constraint.setUpperAngLimit(this.angularLimits.y);
            this.activate();
        } else if (name === 'breakingThreshold') {
            this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
            this.activate();
        }
    });
    this.on('destroy', function () {
        this.destroyConstraint();
    });
};

Generic6DofConstraint.prototype.createConstraint = function() {
    if (this.constraint) {
        this.destroyConstraint();
    }

    if (!this.entity.rigidbody || !this.entity.rigidbody.body) {
        return;
    }
    if (this.entityB && this.entityB.rigidbody && !this.entityB.rigidbody.body) {
        return;
    }

    var v1 = new pc.Vec3();
    var v2 = new pc.Vec3();
    var q = new pc.Quat();
    var m = new pc.Mat4();

    var bodyA = this.entity.rigidbody.body;
    var pivotA = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);

    getOrthogonalVectors(this.axisA, v1, v2);
    m.set([
        this.axisA.x, this.axisA.y, this.axisA.z, 0,
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);
    frameA.setOrigin(pivotA);

    if (this.entityB && this.entityB.rigidbody) {
        var bodyB = this.entityB.rigidbody.body;
        var pivotB = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);

        getOrthogonalVectors(this.axisB, v1, v2);
        m.set([
            v1.x, v1.y, v1.z, 0,
            v2.x, v2.y, v2.z, 0,
            this.axisB.x, this.axisB.y, this.axisB.z, 0,
            0, 0, 0, 1
        ]);
        q.setFromMat4(m);

        var quatB = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
        var frameB = new Ammo.btTransform(quatB, pivotB);

        this.constraint = new Ammo.btSliderConstraint(bodyA, bodyB, frameA, frameB);

        Ammo.destroy(frameB);
        Ammo.destroy(quatB);
        Ammo.destroy(pivotB);
    } else {
        this.constraint = new Ammo.btSliderConstraint(bodyA, frameA);
    }

    this.constraint.setLowerLinLimit(this.linearLimits.x);
    this.constraint.setUpperLinLimit(this.linearLimits.y);
    this.constraint.setLowerAngLimit(this.angularLimits.x);
    this.constraint.setUpperAngLimit(this.angularLimits.y);
    this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.activate();
};

Generic6DofConstraint.prototype.destroyConstraint = function() {
    if (this.constraint) {
        var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
        dynamicsWorld.removeConstraint(this.constraint);
        Ammo.destroy(this.constraint);
        this.constraint = null;
    }
};

Generic6DofConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate();
    if (this.entityB) {
        this.entityB.rigidbody.activate();
    }
};

// update code called every frame
Generic6DofConstraint.prototype.update = function(dt) {
    const bodyA = this.entity.rigidbody && this.entity.rigidbody.body;
    const bodyBReady = !this.entityB || !this.entityB.rigidbody || !!this.entityB.rigidbody.body;
    const bodiesReady = !!bodyA && bodyBReady;

    if (bodiesReady && !this.constraint) {
        this.createConstraint();
    } else if (!bodiesReady && this.constraint) {
        this.destroyConstraint();
    }
};


// character.js
var Character = pc.createScript('character');

// initialize code called once per entity
Character.prototype.initialize = function() {

};

// update code called every frame
Character.prototype.update = function(dt) {

};

// uncomment the swap method to enable hot-reloading for this script
// update the method body to copy state from the old instance
// Character.prototype.swap = function(old) { };

// learn more about scripting here:
// https://developer.playcanvas.com/user-manual/scripting/

// ProgressRepaint.js
var ProgressRepaint = pc.createScript('progressRepaint');

ProgressRepaint.attributes.add('progress', {
    type: 'number', default: 0, min: 0, max: 1, precision: 3, title: 'Progress (0..1)'
});

ProgressRepaint.attributes.add('paintColor', {
    type: 'rgb', default: [0, 0, 0], title: 'Paint Color'
});

ProgressRepaint.attributes.add('feather', {
    type: 'number', default: 0.01, min: 0, max: 0.25, precision: 3, title: 'Edge Feather'
});

ProgressRepaint.attributes.add('includeChildren', {
    type: 'boolean', default: false, title: 'Include Children'
});

ProgressRepaint.attributes.add('useWorldY', {
    type: 'boolean', default: true, title: 'Use World Y (recommended)'
});

ProgressRepaint.attributes.add('testTween', {
    type: 'boolean', default: false, title: 'Test tween'
});


// --- lifecycle --------------------------------------------------------------

ProgressRepaint.prototype.initialize = function () {
    // gather meshInstances from model/render (+ optional children)
    this._meshInstances = this._collectMeshInstances(this.entity, this.includeChildren);

    if (!this._meshInstances.length) {
        console.warn('[ProgressRepaint] No meshInstances found on entity (model/render):', this.entity.name);
        return;
    }

    // keep original materials so we can restore them on destroy
    this._origMats = new Array(this._meshInstances.length);

    // patch each meshInstance material (clone -> override diffusePS chunk)
    for (var i = 0; i < this._meshInstances.length; i++) {
        var mi = this._meshInstances[i];
        var srcMat = mi.material;
        this._origMats[i] = srcMat;

        // If material isn't cloneable or isn't a StandardMaterial-like with chunks, we can't patch it safely.
        // (In practice, StandardMaterial clone() exists.)
        if (!srcMat || typeof srcMat.clone !== 'function') {
            console.warn('[ProgressRepaint] Material not cloneable; skipping meshInstance', i, mi);
            continue;
        }

        var mat = srcMat.clone();
        mat.chunks = mat.chunks || {};

        // Avoid double patching if the clone already got patched somehow
        if (!mat._progressRepaintPatched) {
            mat.chunks.diffusePS = this._patchDiffusePS(mat.chunks.diffusePS || pc.shaderChunks.diffusePS);
            mat._progressRepaintPatched = true;
        }

        mi.material = mat;
        mat.update();
    }


    if(this.testTween) {
        console.error('test tween')
        this.entity.tween(this)
            .to({progress: 1}, 0.75, pc.Linear)
            .repeat(10000)
            .yoyo(true)
            .start();
    }

    this._applyParams();
};

ProgressRepaint.prototype.update = function () {
    // If you animate progress or the object moves, keep updating uniforms
    this._applyParams();
};

ProgressRepaint.prototype.destroy = function () {
    // restore original materials to avoid leaving modified clones behind
    if (!this._meshInstances || !this._origMats) return;

    for (var i = 0; i < this._meshInstances.length; i++) {
        if (this._meshInstances[i]) {
            this._meshInstances[i].material = this._origMats[i];
        }
    }

    this._meshInstances = null;
    this._origMats = null;
};

// --- public helpers ---------------------------------------------------------

ProgressRepaint.prototype.setProgress = function (p) {
    this.progress = pc.math.clamp(p, 0, 1);
    this._applyParams();
};

// --- internals --------------------------------------------------------------

ProgressRepaint.prototype._collectMeshInstances = function (root, includeChildren) {
    var out = [];

    var walk = function (e) {
        // Model component
        if (e.model && e.model.meshInstances && e.model.meshInstances.length) {
            for (var i = 0; i < e.model.meshInstances.length; i++) out.push(e.model.meshInstances[i]);
        }

        // Render component
        if (e.render && e.render.meshInstances && e.render.meshInstances.length) {
            for (var j = 0; j < e.render.meshInstances.length; j++) out.push(e.render.meshInstances[j]);
        }

        if (includeChildren && e.children) {
            for (var k = 0; k < e.children.length; k++) walk(e.children[k]);
        }
    };

    walk(root);
    return out;
};

ProgressRepaint.prototype._patchDiffusePS = function (baseDiffusePS) {
    // Add uniforms at global scope
    var header =
        'uniform float uProgress;\n' +
        'uniform vec3  uPaintColor;\n' +
        'uniform float uMinY;\n' +
        'uniform float uInvHeight;\n' +
        'uniform float uFeather;\n' +
        'uniform float uUseWorldY;\n';

    // Inject into getAlbedo(), after dAlbedo is computed by original chunk
    var inject =
        '\n    // --- Progress repaint (bottom -> top) ---\n' +
        '    // Uses vPositionW.y (world position) by default. If you ever want local-Y, we can switch to vPosition.y.\n' +
        '    float y = vPositionW.y; // world\n' +
        '    float h = clamp((y - uMinY) * uInvHeight, 0.0, 1.0);\n' +
        '    float t = smoothstep(uProgress - uFeather, uProgress + uFeather, h);\n' +
        '    float mask = 1.0 - t; // 1 = painted at bottom\n' +
        '    dAlbedo = mix(dAlbedo, uPaintColor, mask);\n';

    // Replace the last closing brace of getAlbedo() (common format in StandardMaterial chunks)
    var patched = (header + baseDiffusePS).replace(
        /void\s+getAlbedo\s*\(\s*\)\s*\{([\s\S]*?)\}\s*$/m,
        function (_, body) {
            return 'void getAlbedo() {\n' + body + inject + '}\n';
        }
    );

    if (patched === header + baseDiffusePS) {
        console.warn('[ProgressRepaint] Could not patch diffusePS/getAlbedo(). Material chunk format unexpected.');
    }

    return patched;
};

ProgressRepaint.prototype._applyParams = function () {
    if (!this._meshInstances) return;

    var p = pc.math.clamp(this.progress, 0, 1);
    var c = this.paintColor; // pc.Color
    var feather = Math.max(0, this.feather);

    for (var i = 0; i < this._meshInstances.length; i++) {
        var mi = this._meshInstances[i];
        if (!mi || !mi.material) continue;

        // Choose bounds source:
        // - If useWorldY: mi.aabb (world)
        // - Else: mesh aabb (local) but then you ALSO need local position varying; leaving world mode as default.
        var aabb = mi.aabb;
        if (!aabb) continue;

        var minY = aabb.getMin().y;
        var maxY = aabb.getMax().y;
        var height = Math.max(1e-6, (maxY - minY));

        var mat = mi.material;
        mat.setParameter('uProgress', p);
        mat.setParameter('uPaintColor', [c.r, c.g, c.b]);
        mat.setParameter('uMinY', minY);
        mat.setParameter('uInvHeight', 1.0 / height);
        mat.setParameter('uFeather', feather);
        mat.setParameter('uUseWorldY', this.useWorldY ? 1.0 : 0.0);
    }
};


// performanceMonitor.js
//@ts-nocheck
var PerformanceMonitor = pc.createScript('performanceMonitor');

PerformanceMonitor.attributes.add('autoAdjustQuality', {
    type: 'boolean',
    default: true
});

PerformanceMonitor.attributes.add('autoShadows', {
    title: "Auto shadows",
    type: 'boolean',
    deafult: false
});

PerformanceMonitor.attributes.add('shadowLights', {
    title: "Shadow lights",
    type: 'entity',
    array: true
});


PerformanceMonitor.attributes.add('debugOutput', {
    type: 'boolean',
    default: false
});


PerformanceMonitor.attributes.add('maxDevicePixelRatio', {
    type: 'number',
    default: 3
});

PerformanceMonitor.attributes.add('minDevicePixelRatio', {
    type: 'number',
    default: 1.0
});


PerformanceMonitor.attributes.add('pixelRatioStep', {
    type: 'number',
    default: 0.25,
    min: 0,
    max: 1
});

PerformanceMonitor.attributes.add('targetFPS', {
    type: 'number',
    default: 60
});

PerformanceMonitor.attributes.add('acceptableFPS', {
    type: 'number',
    default: 45
});

PerformanceMonitor.attributes.add('minAcceptableFPS', {
    type: 'number',
    default: 30
});

PerformanceMonitor.attributes.add('fpsCheckInterval', {
    type: 'number',
    default: 1.5
});

PerformanceMonitor.attributes.add('sampleFrames', {
    type: 'number',
    default: 100
});

PerformanceMonitor.attributes.add('confidenceInterval', {
    type: 'number',
    default: 0.8,
    min: 0.4,
    max: 1
});


PerformanceMonitor.getInstance = function () {
    if (!PerformanceMonitor._instance) console.error('PerformanceMonitor is not initialized yet');
    return PerformanceMonitor._instance;
};

PerformanceMonitor.prototype.initialize = function () {
    PerformanceMonitor._app = this.app;
    if (!PerformanceMonitor._instance) {
        PerformanceMonitor._instance = this;
    }

    this._shadowsTurnOffCounter = 0;
    this.maxSupportedPixelRatio = window.devicePixelRatio || 1;

    /* set initial pixel ratio */
    this.setPixelRatio(this.getDeviceOptimalDPR());

    this.startPerformanceMonitoring(2000);
};


PerformanceMonitor.prototype.update = function (dt) {
    if (document.hidden) {
        return;
    }
    this.updatePerformanceMonitor(dt);
};

PerformanceMonitor.prototype.swap = function (old) {
    this.initialize();
};



PerformanceMonitor.prototype.updateShadowsSettings = function(shadowsEnabled, forced = false) {
    if(this.shadowLights.length > 0 && (this.autoShadows || forced)) {
        this.shadowLights.forEach(light => {
            if(!shadowsEnabled) {
                this._shadowsTurnOffCounter += 1;
            } else if(this._shadowsTurnOffCounter > 1) return;
            if(light.enabled && light.light.castShadows !== shadowsEnabled) {
                light.light.castShadows = shadowsEnabled;
            }
        });
    }
};

PerformanceMonitor.prototype.startPerformanceMonitoring = function (delay) {
    this.app.root.delayedCall(delay, () => {
        this.performanceMonitoringStarted = true;
        this.performanceMonitoringCounter = 0;
        this.elapsedTime = 0;
        this.frameTimes = [];
        this.lastFPSMeasurements = [];
    });
};


PerformanceMonitor.prototype.updatePerformanceMonitor = function (dt) {
    if (this.performanceMonitoringStarted) {
        /* increase the counter */
        this.performanceMonitoringCounter += 1;
        this.elapsedTime += dt;

        const frameTime = dt;

        if (this.autoAdjustQuality) {
            this.frameTimes.push(frameTime);
            if (this.frameTimes.length >= this.sampleFrames || this.elapsedTime >= this.fpsCheckInterval) {
                this.elapsedTime = 0;
                this.calculateAverageFPS();
            }
        }

    }
};


PerformanceMonitor.prototype.calculateAverageFPS = function () {
    if (this.frameTimes.length < 12) return;
    // console.log('Calculating average FPS based of ' + this.frameTimes.length + ' frames...');
    const sortedTimes = this.frameTimes.slice().sort((a, b) => a - b);
    const lowerBoundFrames = Math.floor(sortedTimes.length * (1 - this.confidenceInterval) / 2);
    const upperBoundFrames = Math.floor(sortedTimes.length * (0.5 + this.confidenceInterval / 2));
    const effectiveFrameTimes = sortedTimes.slice(lowerBoundFrames, upperBoundFrames);
    const totalTime = effectiveFrameTimes.reduce((sum, current) => sum + current, 0);

    const averageFPS = (effectiveFrameTimes.length / totalTime);

    this.lastFPSMeasurements.push(averageFPS);
    while (this.lastFPSMeasurements.length > 20) {
        this.lastFPSMeasurements.shift();
    }

    this.adjustRendererScale(averageFPS);

    this.frameTimes.splice(0, this.frameTimes.length);
};



PerformanceMonitor.prototype.adjustRendererScale = function (averageFPS) {
    if (averageFPS < this.minAcceptableFPS) {
        this.decreaseQuality();
    } else if (averageFPS <= this.acceptableFPS) {
        this.setMediumQuality();
    } else if (averageFPS > this.targetFPS * 0.95) {
        this.increaseQuality();
    }

    this.calculateShadowSettings();
};


PerformanceMonitor.prototype.calculateShadowSettings = function () {
    const currentPixelRatio = this.app.graphicsDevice.maxPixelRatio;
    if (/*currentPixelRatio <= this.minDevicePixelRatio && */this.lastFPSMeasurements.length > 3 && this.lastFPSMeasurements.slice(this.lastFPSMeasurements.length - 3).every(fpsValue => fpsValue < this.minAcceptableFPS)) {
        this.updateShadowsSettings(false);
    } else if (currentPixelRatio >= this.getDeviceOptimalDPR() && this.lastFPSMeasurements.length > 3 && this.lastFPSMeasurements.slice(this.lastFPSMeasurements.length - 3).every(fpsValue => fpsValue >= this.acceptableFPS)) {
        this.updateShadowsSettings(true);
    }
};


PerformanceMonitor.prototype.decreaseQuality = function () {
    const targetRatio = pc.math.clamp(this.app.graphicsDevice.maxPixelRatio - this.pixelRatioStep, this.getMinDPR(), this.getMaxDPR());
    this.setPixelRatio(targetRatio);
};

PerformanceMonitor.prototype.increaseQuality = function () {
    const targetRatio = pc.math.clamp(this.app.graphicsDevice.maxPixelRatio + this.pixelRatioStep, this.getMinDPR(), this.getMaxDPR());
    this.setPixelRatio(targetRatio);
};

PerformanceMonitor.prototype.setMediumQuality = function () {
    this.setPixelRatio(this.getDeviceOptimalDPR());
};

/* private */

PerformanceMonitor.prototype.setPixelRatio = function (value) {
    if (value !== this.app.graphicsDevice.maxPixelRatio) {       
        this.app.graphicsDevice.maxPixelRatio = value;
        this.reportQualityChange();
        if(this.debugOutput) {
            console.log('Pixel ratio set to ', value);
        }
    }
};

PerformanceMonitor.prototype.reportQualityChange = function () {
    const qualityQuartileSize = (this.getMaxDPR() - this.getMinDPR()) / 3;
    let quality = 1;
    if(this.app.graphicsDevice.maxPixelRatio <= this.getMinDPR() + qualityQuartileSize) {
        quality = 0;
    } else if(this.app.graphicsDevice.maxPixelRatio >= this.getMaxDPR() - qualityQuartileSize) {
        quality = 2;
    } else {
        quality = 1;
    }

    this.app.fire(EventTypes.QUALITY_CHANGED, quality);
};


PerformanceMonitor.prototype.getDeviceOptimalDPR = function () {
    const minDPR = this.getMinDPR();
    const maxDPR = this.getMaxDPR();
    return pc.math.clamp(minDPR + (maxDPR - minDPR) / 2, minDPR, maxDPR);
};

PerformanceMonitor.prototype.getMinDPR = function () {
    return Math.min(window.devicePixelRatio || 1, this.minDevicePixelRatio);
};

PerformanceMonitor.prototype.getMaxDPR = function () {
    return Math.min(this.maxSupportedPixelRatio, this.maxDevicePixelRatio);
};

// uvBorderWorld.js
//@ts-nocheck
var UvBorderWorld = pc.createScript('uvBorderWorld');

UvBorderWorld.attributes.add('edgeWidth', {
    type: 'number',
    default: 0.05, 
    min: 0.001,
    max: 1.0,
    title: 'Width (World Units)'
});

UvBorderWorld.attributes.add('borderColor', {
    type: 'rgb',
    default: [0, 0, 0],
    title: 'Border Color'
});

UvBorderWorld.attributes.add('intensity', {
    type: 'number',
    default: 0.5,
    min: 0.0,
    max: 1.0,
    title: 'Intensity'
});

UvBorderWorld.attributes.add('fadePower', {
    type: 'number',
    default: 0.0,
    min: 0.0,
    max: 5.0,
    title: 'Fade Power (0 = disabled)'
});

UvBorderWorld.attributes.add('showUBorder', {
    type: 'boolean',
    default: true,
    title: 'Show U Border (Horizontal)'
});

UvBorderWorld.attributes.add('showVBorder', {
    type: 'boolean',
    default: true,
    title: 'Show V Border (Vertical)'
});

UvBorderWorld.attributes.add('textureScale', {
    type: 'vec2',
    default: [1, 1],
    title: 'Texture Tiling (U, V)'
});

// --- Lifecycle ---

UvBorderWorld.prototype.initialize = function() {
    const component = this.entity.render || this.entity.model;
    if (!component || !component.meshInstances) return;

    this.meshInstances = component.meshInstances;
    
    // Allocate vectors once to prevent Garbage Collection issues
    this.vecScale = new pc.Vec3();
    this.vecRight = new pc.Vec3();
    this.vecUp = new pc.Vec3();
    this.vecFwd = new pc.Vec3();

    for (let i = 0; i < this.meshInstances.length; i++) {
        const mi = this.meshInstances[i];
        
        // Clone material for uniqueness
        const newMat = mi.material.clone();
        newMat.name = mi.material.name + "_BorderWorld";
        mi.material = newMat;

        this.setupShader(mi.material);
    }
};

UvBorderWorld.prototype.update = function(dt) {
    // 1. Get the World Matrix
    const matrix = this.entity.getWorldTransform();
    
    // 2. Extract Scale
    matrix.getScale(this.vecScale);

    // 3. Extract Axes (Direction Vectors)
    // getX/Y/Z fills the vector with the axis data from the matrix.
    // We normalize them because the matrix axes include the scale (length),
    // but the Dot Product in the shader expects Unit vectors (length 1).
    matrix.getX(this.vecRight).normalize();
    matrix.getY(this.vecUp).normalize();
    matrix.getZ(this.vecFwd).normalize();

    // 4. Update Uniforms
    for (let i = 0; i < this.meshInstances.length; i++) {
        const mat = this.meshInstances[i].material;
        
        mat.setParameter('uBorderWidth', this.edgeWidth);
        mat.setParameter('uBorderColor', [this.borderColor.r, this.borderColor.g, this.borderColor.b]);
        mat.setParameter('uBorderIntensity', this.intensity);
        mat.setParameter('uFadePower', this.fadePower);
        mat.setParameter('uShowUBorder', this.showUBorder ? 1.0 : 0.0);
        mat.setParameter('uShowVBorder', this.showVBorder ? 1.0 : 0.0);
        
        // Pass scale
        mat.setParameter('uScale', [this.vecScale.x, this.vecScale.y, this.vecScale.z]);
        
        // Pass normalized directional vectors
        mat.setParameter('uObjRight', [this.vecRight.x, this.vecRight.y, this.vecRight.z]);
        mat.setParameter('uObjUp', [this.vecUp.x, this.vecUp.y, this.vecUp.z]);
        mat.setParameter('uObjFwd', [this.vecFwd.x, this.vecFwd.y, this.vecFwd.z]);
        
        // Pass texture tiling for U and V
        mat.setParameter('uTextureScale', [this.textureScale.x, this.textureScale.y]);
    }
};

UvBorderWorld.prototype.setupShader = function(material) {
    
    // --- PART 1: Define Uniforms (Global Scope) ---
    const uniformsChunk = `
        uniform float uBorderWidth;
        uniform float uBorderIntensity;
        uniform vec3 uBorderColor;
        uniform float uFadePower;
        uniform float uShowUBorder;
        uniform float uShowVBorder;
        uniform vec3 uScale;
        uniform vec2 uTextureScale;
        
        uniform vec3 uObjRight;
        uniform vec3 uObjUp;
        uniform vec3 uObjFwd;
    `;

    const currentBasePS = pc.shaderChunks.basePS || "";
    material.chunks.basePS = uniformsChunk + currentBasePS;
    
    // Add uniforms to vertex shader as well
    const currentBaseVS = pc.shaderChunks.baseVS || "";
    material.chunks.baseVS = uniformsChunk + currentBaseVS;
    
    // Add custom varying to pass original UV for border detection
    const varyingDeclaration = `
        varying vec2 vOriginalUv;
    `;
    
    material.chunks.baseVS = uniformsChunk + varyingDeclaration + currentBaseVS;
    material.chunks.basePS = uniformsChunk + varyingDeclaration + currentBasePS;
    
    // --- VERTEX SHADER: Override getUv0() to repeat texture based on scale ---
    const vertexUVChunk = `
vec2 getUv0() {
    vec2 uv = vertex_texCoord0;
    
    // Store original UV (0-1 range) for border detection
    vOriginalUv = uv;
    
    // Calculate which face we're on based on the vertex normal (in world space)
    vec3 worldNormal = mat3(matrix_model) * vertex_normal;
    worldNormal = normalize(worldNormal);
    
    float dotX = dot(worldNormal, uObjRight);
    float dotY = dot(worldNormal, uObjUp);
    float dotZ = dot(worldNormal, uObjFwd);
    
    // Determine face scale for UV correction
    vec2 faceScale = vec2(1.0, 1.0);
    
    if (abs(dotX) > 0.5) {
        // X-facing: UVs map to Z and Y
        faceScale = vec2(uScale.z, uScale.y);
    } 
    else if (abs(dotY) > 0.5) {
        // Y-facing: UVs map to X and Z
        faceScale = vec2(uScale.x, uScale.z);
    } 
    else {
        // Z-facing: UVs map to X and Y
        faceScale = vec2(uScale.x, uScale.y);
    }
    
    // Multiply UVs by scale to repeat texture, maintaining consistent texture density
    // This makes larger faces show more texture repetitions
    // Apply texture tiling (U and V separately) for additional control
    uv = uv * faceScale * uTextureScale;
    
    return uv;
}
    `;
    
    material.chunks.uv0VS = vertexUVChunk;


    // --- PART 2: Logic (Inside Main) ---
    const logicChunk = `
        gl_FragColor.rgb = combineColor(litArgs_albedo, litArgs_sheen_specularity, litArgs_clearcoat_specularity);
        gl_FragColor.rgb += litArgs_emission;
        gl_FragColor.rgb = addFog(gl_FragColor.rgb);

        // --- START SCALE-AWARE BORDER ---

        // 1. Identify which face this pixel belongs to.
        // We use dot product to see if the Normal aligns with Local X, Y, or Z.
        float dotX = dot(vNormalW, uObjRight);
        float dotY = dot(vNormalW, uObjUp);
        float dotZ = dot(vNormalW, uObjFwd);

        // Default dimensions
        vec2 faceScale = vec2(1.0, 1.0);

        // Check alignment (0.5 is a safe threshold for 90-degree box sides)
        if (abs(dotX) > 0.5) {
            // Facing X (Side): UVs usually map to Z (width) and Y (height)
            faceScale = vec2(uScale.z, uScale.y);
        } 
        else if (abs(dotY) > 0.5) {
            // Facing Y (Top/Bottom): UVs usually map to X (width) and Z (height)
            faceScale = vec2(uScale.x, uScale.z);
        } 
        else {
            // Facing Z (Front/Back): UVs usually map to X (width) and Y (height)
            faceScale = vec2(uScale.x, uScale.y);
        }

        // 2. Calculate UV thickness required to match World Unit width
        // prevent divide by zero just in case scale is 0
        vec2 targetUVWidth = vec2(uBorderWidth) / max(faceScale, 0.001);

        // 3. Draw the border using original UVs (0-1 range)
        // Use vOriginalUv instead of vUv0 since vUv0 is now tiled
        vec2 centered = abs(vOriginalUv - 0.5);
        
        // Smoothstep for anti-aliased edge - calculate U and V borders separately
        float isBorderU = smoothstep(0.5 - targetUVWidth.x, 0.5 - targetUVWidth.x + 0.005, centered.x);
        float isBorderV = smoothstep(0.5 - targetUVWidth.y, 0.5 - targetUVWidth.y + 0.005, centered.y);

        // Apply fade effect if enabled (fadePower > 0)
        if (uFadePower > 0.0) {
            // Calculate fade based on distance from edge (1 at edge, 0 toward interior)
            float fadeU = smoothstep(0.5 - targetUVWidth.x, 0.5, centered.x);
            float fadeV = smoothstep(0.5 - targetUVWidth.y, 0.5, centered.y);
            
            // Apply power to control fade curve
            fadeU = pow(fadeU, uFadePower);
            fadeV = pow(fadeV, uFadePower);
            
            // Apply fade to border intensity
            isBorderU *= fadeU;
            isBorderV *= fadeV;
        }

        // Apply show/hide flags for U and V borders separately
        isBorderU *= uShowUBorder;
        isBorderV *= uShowVBorder;

        // Combine U and V borders
        float borderMask = max(isBorderU, isBorderV);
        borderMask *= uBorderIntensity;

        // 4. Mix Color
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uBorderColor, borderMask);

        // --- END ---

        #ifndef HDR
        gl_FragColor.rgb = toneMap(gl_FragColor.rgb);
        gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);
        #endif
    `;

    material.chunks.endPS = logicChunk;
    material.chunks.APIVersion = '1.70';
    material.update();
};

// UIController.js
//@ts-nocheck
var UIController = pc.createScript('uicontroller');


UIController.getInstance = function () {
    if (!UIController._instance) console.error('UIController is not initialized yet');
    return UIController._instance;
};

UIController.prototype.initialize = function () {
    UIController._app = this.app;
    if (!UIController._instance) {
        UIController._instance = this;
    }

    /* scale blend listener */
    this.app.on(EventTypes.Screen.SET_SCALE_BLEND, this.setScaleBlend, this);
    this.app.on(EventTypes.Screen.SET_CUSTOM_SCALE_BLEND, this.setCustomScaleBlend, this);
    this.app.on(EventTypes.Screen.RESTORE_DEFAULT_SCALE_BLEND, this.restoreDefaultScaleBlend, this);
};


UIController.prototype.update = function (dt) {

};


UIController.prototype.getWindow = function (windowName) {
    return this.entity.children.find(window => window.name === windowName);
};


UIController.prototype.getScreenResolution = function () {
    return this.entity.screen.resolution;
};

UIController.prototype.getScreenReferenceResolution = function () {
    return this.entity.screen.referenceResolution;
};

UIController.prototype.getScreenScale = function () {
    return this.entity.screen.scale;
};

UIController.prototype.getScreenWidth = function () {
    return this.entity.screen.resolution.x / this.entity.screen.scale;
};

UIController.prototype.getScreenHeight = function () {
    return this.entity.screen.resolution.y / this.entity.screen.scale;
};

UIController.prototype.getScaleBlend = function () {
    return this.entity.screen.scaleBlend;
};

UIController.prototype.setScaleBlend = function (scaleBlend) {
    if(this.usingCustomScaleBlend) {
        this.entity.screen.scaleBlend = this.customScaleBlend ?? scaleBlend;
    } else {
        this.entity.screen.scaleBlend = scaleBlend;
    }
};

UIController.prototype.setCustomScaleBlend = function (scaleBlend) {
    this.usingCustomScaleBlend = true;
    this.customScaleBlend = scaleBlend;
    this.entity.screen.scaleBlend = scaleBlend;
};

UIController.prototype.restoreDefaultScaleBlend = function () {
    this.usingCustomScaleBlend = false;
    this.entity.screen.scaleBlend = ScaleManager.getInstance().getCurrentScaleBlend();
};


UIController.prototype.worldToScreen = function (worldPosition) {
    this._screenPos = this._screenPos || new pc.Vec3();
    CameraController.getInstance().getActiveCamera().camera.worldToScreen(worldPosition, this._screenPos);

    // Take into account of pixel ratio
    const pixelRatio = this.app.graphicsDevice.maxPixelRatio;
    this._screenPos.x *= pixelRatio;
    this._screenPos.y *= pixelRatio;

    const device = this.app.graphicsDevice;

    // Global position of elements is normalised between -1 and 1 on both axis
    return new pc.Vec3(
        ((this._screenPos.x / device.width) * 2) - 1,
        ((1 - (this._screenPos.y / device.height)) * 2) - 1,
        0);
};

UIController.prototype.screenToWorld = function (screenPosition, depth) {
    // screenPosition is expected to be in normalized coordinates (-1 to 1)
    // depth is the distance from the camera (defaults to 1)
    const device = this.app.graphicsDevice;
    const pixelRatio = this.app.graphicsDevice.maxPixelRatio;
    
    // Convert from normalized coordinates (-1 to 1) back to pixel coordinates
    const pixelX = ((screenPosition.x + 1) / 2) * device.width;
    const pixelY = (1 - ((screenPosition.y + 1) / 2)) * device.height;
    
    // Divide by pixel ratio to get screen coordinates
    const screenX = pixelX / pixelRatio;
    const screenY = pixelY / pixelRatio;
    
    // Use camera's screenToWorld method
    this._worldPos = this._worldPos || new pc.Vec3();
    const camera = CameraController.getInstance().getActiveCamera().camera;
    camera.screenToWorld(screenX, screenY, depth || 1, this._worldPos);
    
    return this._worldPos.clone();
};

// LevelStorage.js
//@ts-nocheck
var LevelStorage = pc.createScript('levelStorage');

LevelStorage.attributes.add('stages', {
    type: 'json',
    title: 'Levels',
    schema: [{
        name: "stageNumber",
        type: 'number',
        title: 'Stage number'
    }, {
        name: "levels",
        type: 'asset',
        title: 'Regular levels',
        assetType: 'template',
        array: true
    }, {
        name: "bossLevel",
        type: 'asset',
        title: 'Boss level',
        assetType: 'template'
    }],
    array: true
});

LevelStorage.getInstance = function () {
    if (!LevelStorage._instance) console.error('LevelStorage is not initialized yet');
    return LevelStorage._instance;
};

LevelStorage.prototype.initialize = function () {
    LevelStorage._instance = this;
};

LevelStorage.prototype.update = function(dt) {

};

LevelStorage.prototype.getStagesList = function () {
    return this.stages;
};

LevelStorage.prototype.getTotalStagesCount = function () {
    return this.stages.length;
};

LevelStorage.prototype.getStageDataByNumber = function (stageNumber) {
    return this.stages.find(level => level.levelNumber === levelNumber);
};



// FamobiCopyright.js
//@ts-nocheck
var FamobiCopyright = pc.createScript('famobiCopyright');

FamobiCopyright.prototype.initialize = function () {
    {
        this.entity.element.opacity = 0;
        const textureAsset = new pc.Asset('famobiLogoTexture', 'texture', { url: "_assets_/copyright-dark-128.png" }, undefined, { crossOrigin: 'anonymous' });

        // Load the asset
        this.app.assets.add(textureAsset);
        textureAsset.once('load', (asset) => {
            const imageElement = this.entity.element;
            if (imageElement) {
                imageElement.texture = asset.resource;
                this.updateColorAndOpacity(this.app.currentWorld || 'Snow');
            }
        });
        textureAsset.on('error', (error) => {
            console.warn('[FamobiCopyright] Failed to load famobi logo: ', error);
            this.entity.enabled = false;
        });

        this.app.assets.load(textureAsset);

        this.app.on(EventTypes.WORLD_CHANGED, (worldName) => {
            this.updateColorAndOpacity(worldName);
        })
    }
};

FamobiCopyright.prototype.updateColorAndOpacity = function (worldName) {
    try {
        if (worldName === 'Snow') {
            this.entity.element.color = pc.Color.BLACK;
            this.entity.element.opacity = 0.333;
        } else {
            this.entity.element.color = pc.Color.WHITE;
            this.entity.element.opacity = 0.666;
        }
    } catch (error) {
        console.log('Error changing copyright logo color: ' + error);
        this.entity.enabled = false;
    }
}

FamobiCopyright.prototype.update = function (dt) {

};



// VolumeSlider.js
//@ts-nocheck
var VolumeSlider = pc.createScript('volumeSlider');

VolumeSlider.attributes.add('maxMaskWidth', {
    type: 'number',
    default: 400
});


VolumeSlider.prototype.initialize = function () {

    this._sliderHolding = false;

    this.uiContainer = this.app.root.findByName('UIContainer');

    this.entity.bar = this.entity.findByName('Bar');
    this.entity.barMask = this.entity.findByName('BarMask');
    this.entity.slider = this.slider = this.entity.findByName('Slider');


    if (this.app.touch) {
        this.slider.element.on('touchstart', this.onTap, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onRelease, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onRelease, this);
        this.app.on(EventTypes.GameInput.TOUCH_MOVE, this.onTouchMove, this);
    }
    if (this.app.mouse) {
        this.slider.element.on('mousedown', this.onPress, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onRelease, this);
        this.app.on(EventTypes.GameInput.MOUSE_MOVE, this.onMouseMove, this);
    }

    this.entity.on('setSliderValue', percentage => this.updateView(percentage, true), this);
};


VolumeSlider.prototype.onPress = function (event) {
    this._sliderHolding = true;
    this.inputDownPosition = new pc.Vec2(event.x, event.y);
};

VolumeSlider.prototype.onTap = function (event) {
    if (event.changedTouches && event.changedTouches[0]) {
        this._sliderHolding = true;
        this.inputDownPosition = new pc.Vec2(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
};


VolumeSlider.prototype.onRelease = function (event) {
    this._sliderHolding = false;
    this.inputDownPosition = null;
};


VolumeSlider.prototype.onMouseMove = function (x, y) {
    if (this._sliderHolding && this.inputDownPosition) {
        const sliderPosition = this.slider.getLocalPosition();
        const dx = x - this.inputDownPosition.x;
        sliderPosition.x = pc.math.clamp(sliderPosition.x + dx, 0, this.maxMaskWidth);
        this.slider.setLocalPosition(sliderPosition);
        this.inputDownPosition.set(x, y);
        this.updateView(sliderPosition.x / this.maxMaskWidth);
    }
};


VolumeSlider.prototype.onTouchMove = function (x, y) {
    if (this._sliderHolding && this.inputDownPosition) {
        const sliderPosition = this.slider.getLocalPosition();
        const dx = (x - this.inputDownPosition.x) / Math.max(this.uiContainer.screen.scaleBlend, 0.5);
        sliderPosition.x = pc.math.clamp(sliderPosition.x + dx, 0, this.maxMaskWidth);
        this.slider.setLocalPosition(sliderPosition);
        this.inputDownPosition.set(x, y);
        this.updateView(sliderPosition.x / this.maxMaskWidth);
    }
};

VolumeSlider.prototype.onTouchDrag = function (event) {
    this._sliderHolding = false;
};



VolumeSlider.prototype.updateView = function (percentage, skipEventFiring) {
    const sliderX = pc.math.clamp(percentage * this.maxMaskWidth, 0, this.maxMaskWidth);
    this.slider.setLocalPosition(new pc.Vec3(sliderX, 0, 0));
    this.entity.barMask.element.width = sliderX;

    if (!skipEventFiring) {
        this.entity.fire('sliderValueChanged', percentage);
    }
};


VolumeSlider.prototype.update = function (dt) {
    if (this._sliderHolding) {

    }
};


VolumeSlider.prototype.swap = function (old) {

};



// scalePulseTween.js
//@ts-nocheck
/* jshint esversion: 6 */
var ScalePulseTween = pc.createScript('scalePulseTween');

ScalePulseTween.attributes.add('targetScale', {
    type: 'vec3',
    default: [1.1, 0.925, 1]
});

ScalePulseTween.attributes.add('duration', {
    type: 'number',
    default: 0.9
});

ScalePulseTween.attributes.add('yoyo', {
    type: 'boolean',
    default: true
});

ScalePulseTween.attributes.add('loop', {
    type: 'boolean',
    default: true
});

ScalePulseTween.attributes.add('repeatDelay', {
    type: 'number',
    default: 0
});

ScalePulseTween.attributes.add('easing', {
    type: 'string',
    enum: [
        { "Linear": "Linear" },
        { "QuadraticIn": "QuadraticIn" },
        { "QuadraticOut": "QuadraticOut" },
        { "QuadraticInOut": "QuadraticInOut" },
        { "CubicIn": "CubicIn" },
        { "CubicOut": "CubicOut" },
        { "CubicInOut": "CubicInOut" },
        { "QuarticIn": "QuarticIn" },
        { "QuarticOut": "QuarticOut" },
        { "QuarticInOut": "QuarticInOut" },
        { "QuinticIn": "QuinticIn" },
        { "QuinticOut": "QuinticOut" },
        { "QuinticInOut": "QuinticInOut" },
        { "SineIn": "SineIn" },
        { "SineOut": "SineOut" },
        { "SineInOut": "SineInOut" },
        { "ExponentialIn": "ExponentialIn" },
        { "ExponentialOut": "ExponentialOut" },
        { "ExponentialInOut": "ExponentialInOut" },
        { "CircularIn": "CircularIn" },
        { "CircularOut": "CircularOut" },
        { "CircularInOut": "CircularInOut" },
        { "BackIn": "BackIn" },
        { "BackOut": "BackOut" },
        { "BackInOut": "BackInOut" },
        { "BounceIn": "BounceIn" },
        { "BounceOut": "BounceOut" },
        { "BounceInOut": "BounceInOut" },
        { "ElasticIn": "ElasticIn" },
        { "ElasticOut": "ElasticOut" },
        { "ElasticInOut": "ElasticInOut" }
    ],
    default: "Linear"
});

ScalePulseTween.prototype.initialize = function () {
    this.initialScale = this.entity.getLocalScale().clone();

    this._restartTween();
    this.on('attr', this._restartTween, this);
};


ScalePulseTween.prototype.update = function (dt) {

};


ScalePulseTween.prototype._restartTween = function () {
    // this.app.stopAllTweens(this.entity);
    this.entity.setLocalScale(this.initialScale);

    this.entity.tween(this.entity.getLocalScale())
        .to(this.targetScale, this.duration, pc[this.easing])
        .yoyo(this.yoyo)
        .repeat(this.loop ? Infinity : 0, this.repeatDelay)
        .start();
};


// settingsWindow.js
//@ts-nocheck
var SettingsWindow = pc.createScript('settingsWindow');

SettingsWindow.attributes.add('lockLandscapeScaleBlend', {
    type: 'boolean',
    default: true
});

SettingsWindow.attributes.add('landscapeScaleBlendValue', {
    type: 'number',
    default: 1
});


SettingsWindow.prototype.initialize = function () {

    this.background = this.entity.findByName("Background");
    this.contentGroup = this.entity.findByName("ContentGroup");
    this.musicGroup = this.entity.findByName("MusicGroup");
    this.sfxGroup = this.entity.findByName("SfxGroup");
    this.gdprGroup = this.entity.findByName("GDPRGroup");
    this.restartContainer = this.entity.findByName("RestartContainer");

    this.buttonsContainer = this.entity.findByName("ButtonsContainer");
    this.buttonRestart = this.entity.findByName("ButtonRestart");

    this.buttonClose = this.entity.findByName("CloseButton");

    this.musicButton = this.entity.findByName('ButtonMusic');
    this.musicMutedIcon = this.musicButton.findByName('IconMuted');
    this.sfxButton = this.entity.findByName('ButtonSfx');
    this.sfxMutedIcon = this.sfxButton.findByName('IconMuted');
    this.musicVolumeBar = this.entity.findByName('MusicVolumeBar');
    this.sfxVolumeBar = this.entity.findByName('SfxVolumeBar');
    this.musicVolumeBar.on('sliderValueChanged', this.onMusicVolumeChanged, this);
    this.sfxVolumeBar.on('sliderValueChanged', this.onSFXVolumeChanged, this);


    /* show method */
    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);

    /* event listeners */
    this.app.on(EventTypes.SOUND_STATE_CHANGED, this.updateSoundButtons, this);
    this.app.on(EventTypes.MUSIC_STATE_CHANGED, this.updateMusicButtons, this);
    this.app.on(EventTypes.Screen.RESIZED, this.handleViewportResized, this);

    BasicButton.assignAction(this.buttonRestart, this.restartPressed, this);
    BasicButton.assignAction(this.buttonClose, this.closePressed, this);
    BasicButton.assignAction(this.musicButton, this.onMusicClicked, this);
    BasicButton.assignAction(this.sfxButton, this.onSFXClicked, this);
    this.entity.hide();
};


SettingsWindow.prototype.handleViewportResized = function (width, height, isLandscape) {
    const screenRatio = width / height;
    const needsScaleAdjustment = screenRatio > 0.75;
    if(needsScaleAdjustment) {
        const scaleRatio = pc.math.clamp(Math.pow(height / width, 0.625), 0.6, 1);
        this.contentGroup.setLocalScale(scaleRatio, scaleRatio, scaleRatio);
        this.buttonsContainer.setLocalScale(scaleRatio, scaleRatio, scaleRatio);
    } else {
        this.contentGroup.setLocalScale(pc.Vec3.ONE);
        this.buttonsContainer.setLocalScale(pc.Vec3.ONE);
    }
}

SettingsWindow.prototype.show = function () {
    this.entity.enabled = true;
    if (this.lockLandscapeScaleBlend) {
        this.app.fire(EventTypes.Screen.SET_CUSTOM_SCALE_BLEND, this.landscapeScaleBlendValue);
    }

    this.updateSoundButtons();
    this.updateMusicButtons();

    /* animate background appearing */
    this.background.element.opacity = 0.0;
    Utils.tweenOpacity(this.background, 0.9, 0.375, pc.SineOut, 0, true);

    /* animate content groups appearing */
    [this.musicGroup, this.sfxGroup, this.gdprGroup].forEach((group, index) => {
        group.setLocalScale(0.0, 0.0, 0.0);
        Utils.tweenScale(group, pc.Vec3.ONE, 0.375, pc.BackOut, 0.05 * index, true);
    });

    /* buttons container appearing */
    this.restartContainer.setLocalScale(0.0, 0.0, 0.0);
    Utils.tweenScale(this.restartContainer, pc.Vec3.ONE, 0.375, pc.BackOut, 0.15, true);

    /* button close appearing */
    this.buttonClose.setLocalScale(0.0, 0.0, 0.0);
    Utils.tweenScale(this.buttonClose, pc.Vec3.ONE, 0.375, pc.BackOut, 0.3, true);
};

SettingsWindow.prototype.hide = function () {
    if (this.entity.enabled && this.lockLandscapeScaleBlend) {
        this.app.fire(EventTypes.Screen.RESTORE_DEFAULT_SCALE_BLEND);
    }
    this.entity.enabled = false;
};

SettingsWindow.prototype.update = function (dt) {

};

SettingsWindow.prototype.restartPressed = async function () {
    await PauseManager.getInstance().resumeGame();
    

    TransitionScreen.instance.transitionTo(() => {
        this.entity.hide();
        this.app.fire(EventTypes.RESTART_CURRENT_LEVEL);
    });
};

SettingsWindow.prototype.closePressed = function () {
    PauseManager.getInstance().resumeGame().then(() => {
        this.entity.hide();
    });
};

/* audio listeners */
SettingsWindow.prototype.updateSoundButtons = function () {
    this.sfxMutedIcon.enabled = !SoundController.sfxEnabled;
    this.sfxVolumeBar.fire('setSliderValue', SoundController.sfxVolume);
}

SettingsWindow.prototype.updateMusicButtons = function () {
    this.musicMutedIcon.enabled = !SoundController.musicEnabled;
    this.musicVolumeBar.fire('setSliderValue', SoundController.musicVolume);
}


SettingsWindow.prototype.onMusicClicked = function () {
    if (SoundController.musicEnabled) {
        this.app.fire(EventTypes.DISABLE_MUSIC);
    } else {
        this.app.fire(EventTypes.ENABLE_MUSIC);
    }
    this.updateMusicButtons();
    this.app.fire(EventTypes.SAVE_APP);
}

SettingsWindow.prototype.onSFXClicked = function () {
    if (SoundController.sfxEnabled) {
        this.app.fire(EventTypes.DISABLE_SFX);
    } else {
        this.app.fire(EventTypes.ENABLE_SFX);
    }
    this.updateSoundButtons();
    this.app.fire(EventTypes.SAVE_APP);
}

SettingsWindow.prototype.onMusicVolumeChanged = function (value) {
    this.app.fire(EventTypes.SET_MUSIC_VOLUME, value);
}


SettingsWindow.prototype.onSFXVolumeChanged = function (value) {
    this.app.fire(EventTypes.SET_SFX_VOLUME, value);
}

// rotationTween.js
//@ts-nocheck
var RotationTween = pc.createScript('rotationTween');


RotationTween.attributes.add('targetAngle', {
    type: 'vec3',
    default: [0, 0, 0]
});

RotationTween.attributes.add('duration', {
    type: 'number',
    default: 0.9
});

RotationTween.attributes.add('yoyo', {
    type: 'boolean',
    default: true
});

RotationTween.attributes.add('loop', {
    type: 'boolean',
    default: true
});

RotationTween.attributes.add('easing', {
    type: 'string',
    enum: [
        { "Linear": "Linear" },
        { "QuadraticIn": "QuadraticIn" },
        { "QuadraticOut": "QuadraticOut" },
        { "QuadraticInOut": "QuadraticInOut" },
        { "CubicIn": "CubicIn" },
        { "CubicOut": "CubicOut" },
        { "CubicInOut": "CubicInOut" },
        { "QuarticIn": "QuarticIn" },
        { "QuarticOut": "QuarticOut" },
        { "QuarticInOut": "QuarticInOut" },
        { "QuinticIn": "QuinticIn" },
        { "QuinticOut": "QuinticOut" },
        { "QuinticInOut": "QuinticInOut" },
        { "SineIn": "SineIn" },
        { "SineOut": "SineOut" },
        { "SineInOut": "SineInOut" },
        { "ExponentialIn": "ExponentialIn" },
        { "ExponentialOut": "ExponentialOut" },
        { "ExponentialInOut": "ExponentialInOut" },
        { "CircularIn": "CircularIn" },
        { "CircularOut": "CircularOut" },
        { "CircularInOut": "CircularInOut" },
        { "BackIn": "BackIn" },
        { "BackOut": "BackOut" },
        { "BackInOut": "BackInOut" },
        { "BounceIn": "BounceIn" },
        { "BounceOut": "BounceOut" },
        { "BounceInOut": "BounceInOut" },
        { "ElasticIn": "ElasticIn" },
        { "ElasticOut": "ElasticOut" },
        { "ElasticInOut": "ElasticInOut" }
    ],
    default: "Linear"
});

RotationTween.prototype.initialize = function () {
    this.initialEulerAngles = this.entity.getLocalEulerAngles().clone();

    this._restartTween();
    this.on('attr', this._restartTween, this);
};


RotationTween.prototype.update = function (dt) {

};


RotationTween.prototype._restartTween = function () {
    // this.app.stopAllTweens(this.entity);
    this.entity.setLocalEulerAngles(this.initialEulerAngles);

    this.entity.tween(this.entity.getLocalEulerAngles())
        .rotate(this.targetAngle, this.duration, pc[this.easing])
        .yoyo(this.yoyo)
        .loop(this.loop)
        .start();
};


// rotateLocal.js
var RotateLocal = pc.createScript('rotateLocal');

RotateLocal.attributes.add('angularSpeed', {
    type: 'vec3',
    default: [0, 180, 0]
});

RotateLocal.prototype.initialize = function() {

};

RotateLocal.prototype.update = function(dt) {
    this.entity.rotateLocal(this.angularSpeed.x * dt, this.angularSpeed.y * dt, this.angularSpeed.z * dt)
};

// TutorialHand.js
//@ts-nocheck

var TutorialHand = pc.createScript('tutorialHand');

TutorialHand.prototype.initialize = function () {
    this.entity.showClickingTutorial = this.showClickingTutorial.bind(this);
    this.entity.showSwipingTutorial = this.showSwipingTutorial.bind(this);
    this.entity.showSpinningTutotial = this.showSpinningTutotial.bind(this);
    this.entity.showSwipingAndDraggingTutorial = this.showSwipingAndDraggingTutorial.bind(this);
    this.entity.showAlternateSelectionTutorial = this.showAlternateSelectionTutorial.bind(this);
    this.entity.hide = this.hide.bind(this);
    this.entity.reset = this.reset.bind(this);

    this.hand = this.entity.findByName('Hand');
    this.hand.enabled = false;
};

TutorialHand.prototype.reset = function () {
    this.hidden = false;
    this.app.stopAllTweens(this.hand);
    this.hand.enabled = false;
    this.hand.opacity = 0;
    this.hand.setLocalPosition(pc.Vec3.ZERO);
    this.hand.setLocalScale(pc.Vec3.ONE);
};

TutorialHand.prototype.hide = async function (forced = false) {
    if (this.hidden && !forced) return;
    this.hidden = true;
    this._alternateSelectionTutorialActive = false;
    this._swipingTutorialActive = false;
    await this._animateHandDisappearing();
}


TutorialHand.prototype._animateHandAppearing = async function (duration = 0.15, delay = 0) {
    this.hand.enabled = true;
    this.hand.element.opacity = 0;
    if (this._handAppearingTween && this._handAppearingTween.playing) this._handAppearingTween.stop();
    this._handAppearingTween = this.hand.tween(this.hand.element)
        .to({ opacity: 1 }, duration, pc.SineIn)
        .delay(delay)
        .start();

    await Utils.wait((duration + delay) * 1000);
};


TutorialHand.prototype._animateHandDisappearing = async function (duration = 0.1) {
    if (this._handAppearingTween && this._handAppearingTween.playing) this._handAppearingTween.stop();
    this._handAppearingTween = this.hand.tween(this.hand.element)
        .to({ opacity: 0 }, duration, pc.SineIn)
        .onComplete(() => this.hand.enabled = false)
        .start();

    await Utils.wait(duration * 1000);
};

TutorialHand.prototype.showClickingTutorial = async function (worldPosition, delay = 100, duration = 200) {
    this.entity.setPosition(worldPosition);
    this.reset();

    await Utils.wait(delay);

    this._animateHandAppearing(duration / 1000);

    if (this._handMovementTween && this._handMovementTween.playing) this._handMovementTween.stop();
    this._handMovementTween = this.hand.tween(this.hand.getLocalPosition())
        .to({ x: -3, y: 3, z: 0 }, 0.18, pc.Linear)
        .repeat(10000)
        .yoyo(true)
        .start();

    if (this._handScaleTween && this._handScaleTween.playing) this._handScaleTween.stop();
    this._handScaleTween = this.hand.tween(this.hand.getLocalScale())
        .to({ x: 0.97, y: 0.97, z: 0.97 }, 0.18, pc.Linear)
        .repeat(10000)
        .yoyo(true)
        .start();
};

TutorialHand.prototype.showSpinningTutotial = async function (worldPosition, radiusX = 150, radiusY = 100, duration = 1000, delay = 100) {
    this.entity.setPosition(worldPosition);
    this.reset();

    await Utils.wait(delay);

    this._animateHandAppearing(0.15);

    const ellipseData = { progressX: 0, progressY: 0 };
    if (this._spinningXTween && this._spinningXTween.playing) this._spinningXTween.stop();
    this._spinningXTween = this.hand.tween(ellipseData)
        .to({ progressX: 1, progressY: 1 }, duration / 1000, pc.Linear)
        .repeat(10000)
        .onUpdate(() => {
            this.hand.setLocalPosition(-Math.sin(2 * Math.PI * ellipseData.progressX) * radiusX, Math.cos(2 * Math.PI * ellipseData.progressY) * radiusY, 0);
        })
        .start();
};

TutorialHand.prototype.showSwipingTutorial = async function (worldPositionFrom, worldPositionTo, duration = 750, repeatDelay = 100) {
    this._swipingTutorialActive = true;

    this.entity.setPosition(worldPositionFrom);
    this.reset();
    await Utils.wait(repeatDelay);

    await this._animateHandAppearing(0.1);

    if (this._handMovementTween && this._handMovementTween.playing) this._handMovementTween.stop();
    const targetLocalPosition = Utils.worldToLocalPosition(this.hand, worldPositionTo);
    this._handMovementTween = this.hand.tween(this.hand.getLocalPosition())
        .to(targetLocalPosition, duration / 1000, pc.SineInOut)
        .onComplete(async () => {
            await this._animateHandDisappearing(0.1);
            if (this._swipingTutorialActive) {
                this.showSwipingTutorial(worldPositionFrom, worldPositionTo, duration, repeatDelay);
            }
        })
        .start();
};


TutorialHand.prototype.showSwipingAndDraggingTutorial = async function (worldPositionFrom, worldPositionTo, duration = 750, repeatDelay = 100) {
    this._swipingTutorialActive = true;

    this.entity.setPosition(worldPositionFrom);
    this.reset();
    await Utils.wait(repeatDelay);

    await this._animateHandAppearing(0.1);

    if (this._handMovementTween && this._handMovementTween.playing) this._handMovementTween.stop();
    const targetLocalPosition = Utils.worldToLocalPosition(this.hand, worldPositionTo);
    this._handMovementTween = this.hand.tween(this.hand.getLocalPosition())
        .to(targetLocalPosition, duration / 1000, pc.SineInOut)
        .onComplete(async () => {

            if (this._handMovementTween && this._handMovementTween.playing) this._handMovementTween.stop();
            const startingPosition = this.hand.getLocalPosition();
            this._handMovementTween = this.hand.tween(this.hand.getLocalPosition())
                .to({ x: startingPosition.x - 70, y: startingPosition.y + 45, z: startingPosition.z }, 0.25, pc.Linear)
                .repeat(8)
                .yoyo(true)
                .onComplete(async () => {
                    await this._animateHandDisappearing(0.1);
                    if (this._swipingTutorialActive) {
                        this.showSwipingAndDraggingTutorial(worldPositionFrom, worldPositionTo, duration, repeatDelay);
                    }
                })
                .start();

        })
        .start();
};

TutorialHand.prototype.showAlternateSelectionTutorial = async function (worldPositionsArray, timePerItem = 600) {
    this._alternateSelectionTutorialActive = true;
    let i = 0;
    while (this._alternateSelectionTutorialActive) {
        this.showClickingTutorial(worldPositionsArray[i++ % worldPositionsArray.length], 50, 150);
        await Utils.wait(timePerItem);
        await this._animateHandDisappearing(0.05);
    }
};

TutorialHand.prototype.update = function (dt) {

};


// PauseManager.js
  //@ts-nocheck
var PauseManager = pc.createScript('pauseManager');

PauseManager.getInstance = function() {
    if(!PauseManager.instance) {
        PauseManager.instance = new PauseManager();
    }
    return PauseManager.instance;
};

PauseManager.prototype.initialize = function() {
    PauseManager.instance = this;
    this._isGamePaused = false;
    this._loaded = false;
    
    this.app.on(EventTypes.APP_LOADED, this.onAppLoaded, this);
};

PauseManager.prototype.update = function(dt) {

};

PauseManager.prototype.onAppLoaded = function() {
    this._loaded = true;
};

PauseManager.prototype.pauseGame = async function() {
    if(this._loaded) {
        
    }
    this.app.timeScale = 0;
    this._isGamePaused = true;
};

PauseManager.prototype.resumeGame = async function() {
    if(this._loaded) {
        
    }
    this.app.timeScale = 1;
    this._isGamePaused = false;
};

PauseManager.prototype.isPaused = function() {
    return this._isGamePaused;
};

// grassAnimationShader.js
//@ts-nocheck
var GrassAnimationShader = pc.createScript('grassAnimationShader');

GrassAnimationShader.attributes.add('windStrength', {
    type: 'number',
    default: 0.12,
    min: 0,
    max: 1,
    title: 'Wind Strength'
});

GrassAnimationShader.attributes.add('windSpeed', {
    type: 'number',
    default: 1.4,
    min: 0,
    max: 10,
    title: 'Wind Speed'
});

GrassAnimationShader.attributes.add('windFrequency', {
    type: 'number',
    default: 0.8,
    min: 0,
    max: 10,
    title: 'Wind Frequency (Spatial)'
});

GrassAnimationShader.attributes.add('swayMaskFlip', {
    type: 'boolean',
    default: false,
    title: 'Flip Sway Mask',
    description: 'Enable if grass roots are at UV.y = 1 (tip at UV.y = 0).'
});

GrassAnimationShader.attributes.add('useWorldCoords', {
    type: 'boolean',
    default: false,
    title: 'Use World Coordinates',
    description: 'When enabled, sway axes follow the entity\'s world-space rotation instead of always blowing along global X/Z.'
});


GrassAnimationShader.prototype.initialize = function () {
    this._time = 0;
    this._matSwap = [];    // [{ mi, originalMat, clonedMat }]
    this._clonedMaterials = [];

    this._applyWindShader();

    this.on('destroy', this._cleanup, this);
};

GrassAnimationShader.prototype.update = function (dt) {
    this._time += dt;

    const flip = this.swayMaskFlip ? 1.0 : 0.0;

    for (let i = 0; i < this._clonedMaterials.length; i++) {
        const mat = this._clonedMaterials[i];
        mat.setParameter('uGrassTime', this._time);
        mat.setParameter('uWindStrength', this.windStrength);
        mat.setParameter('uWindSpeed', this.windSpeed);
        mat.setParameter('uWindFrequency', this.windFrequency);
        mat.setParameter('uSwayMaskFlip', flip);
        mat.setParameter('uUseWorldCoords', this.useWorldCoords ? 1.0 : 0.0);
    }
};


GrassAnimationShader.prototype._getMeshInstances = function () {
    const component = this.entity.render || this.entity.model;
    return (component && component.meshInstances) ? component.meshInstances : [];
};

GrassAnimationShader.prototype._applyWindShader = function () {
    const meshInstances = this._getMeshInstances();
    if (!meshInstances.length) {
        console.warn('GrassAnimationShader: no mesh instances found on entity "' + this.entity.name + '"');
        return;
    }

    const origToClone = new Map();

    for (let i = 0; i < meshInstances.length; i++) {
        const mi = meshInstances[i];
        const orig = mi.material;

        if (!origToClone.has(orig)) {
            const cloned = orig.clone();
            cloned.name = orig.name + '_GrassWind';
            this._setupShader(cloned);
            origToClone.set(orig, cloned);
            this._clonedMaterials.push(cloned);
        }

        this._matSwap.push({ mi, originalMat: orig, clonedMat: origToClone.get(orig) });
        mi.material = origToClone.get(orig);
    }
};

GrassAnimationShader.prototype._setupShader = function (material) {

    const uniformsVS = `
        uniform float uGrassTime;
        uniform float uWindStrength;
        uniform float uWindSpeed;
        uniform float uWindFrequency;
        uniform float uSwayMaskFlip;
        uniform float uUseWorldCoords;
    `;

    const currentBaseVS = pc.shaderChunks.baseVS || '';
    material.chunks.baseVS = uniformsVS + currentBaseVS;

    material.chunks.transformVS = `
        mat4 getModelMatrix() {
            #ifdef DYNAMICBATCH
            return getBatchingMatrix(vertex_batchId);
            #elif defined(SKIN)
            return getSkinMatrix(vertex_boneIndices, vertex_boneWeights);
            #elif defined(INSTANCING)
            return getInstanceMatrix();
            #else
            return matrix_model;
            #endif
        }

        vec4 getPosition() {
            dModelMatrix = getModelMatrix();

            vec3 localPos = vertex_position;
            vec3 worldPos = (dModelMatrix * vec4(localPos, 1.0)).xyz;

            // Sway mask: 0 at root, 1 at tip; squared for natural flex curve
            float rawMask = mix(vertex_texCoord0.y, 1.0 - vertex_texCoord0.y, uSwayMaskFlip);
            float swayMask = rawMask * rawMask;

            // Spatial phase varies per blade position so neighbours stay out of sync
            float spatialPhase = worldPos.x * uWindFrequency + worldPos.z * uWindFrequency * 0.73;

            // Primary flutter (main wind direction, X axis)
            float t = uGrassTime * uWindSpeed;
            float swayX = sin(t + spatialPhase) * 0.65
                        + sin(t * 2.1 + spatialPhase * 1.3 + 1.7) * 0.35;

            // Secondary flutter (cross-wind, Z axis) – subtler
            float swayZ = cos(t * 0.85 + spatialPhase * 0.9 + 0.9) * 0.45
                        + cos(t * 1.7 + spatialPhase * 1.1 + 2.4) * 0.25;

            // When uUseWorldCoords is 1, sway follows the entity's local axes so
            // world-space rotation is respected; otherwise sway is always along global X/Z.
            vec3 entityAxisX = normalize(dModelMatrix[0].xyz);
            vec3 entityAxisZ = normalize(dModelMatrix[2].xyz);
            vec3 windAxisX = mix(vec3(1.0, 0.0, 0.0), entityAxisX, uUseWorldCoords);
            vec3 windAxisZ = mix(vec3(0.0, 0.0, 1.0), entityAxisZ, uUseWorldCoords);

            worldPos += windAxisX * swayX * uWindStrength * swayMask;
            worldPos += windAxisZ * swayZ * uWindStrength * 0.4 * swayMask;

            dPositionW = worldPos;
            return matrix_viewProjection * vec4(worldPos, 1.0);
        }

        vec3 getWorldPosition() {
            return dPositionW;
        }
    `;

    material.chunks.APIVersion = '1.70';
    material.update();
};

GrassAnimationShader.prototype._cleanup = function () {
    for (let i = 0; i < this._matSwap.length; i++) {
        const { mi, originalMat } = this._matSwap[i];
        mi.material = originalMat;
    }
    for (let i = 0; i < this._clonedMaterials.length; i++) {
        this._clonedMaterials[i].destroy();
    }
    this._matSwap = [];
    this._clonedMaterials = [];
};


// VersionInfo.js
///@ts-nocheck
var VersionInfo = pc.createScript('versionInfo');

VersionInfo.prototype.initialize = function() {
    this.entity.element.text = GameConfig.getAttribute('gameVersion');
    this.entity.element.enabled = true;
};

VersionInfo.prototype.update = function(dt) {

};



// screenBlocker.js
//@ts-nocheck
var ScreenBlocker = pc.createScript('screenBlocker');

ScreenBlocker.prototype.initialize = function() {
    this.app.on(EventTypes.LOCK_SCREEN, this.lockScreen, this);
    this.app.on(EventTypes.UNLOCK_SCREEN, this.unlockScreen, this);
};

ScreenBlocker.prototype.update = function(dt) {

};

ScreenBlocker.prototype.lockScreen = function() {
    this.entity.element.enabled = true;
};

ScreenBlocker.prototype.unlockScreen = function() {
    this.entity.element.enabled = false;
};



// localizationManager.js
//@ts-nocheck
var LocalizationManager = pc.createScript('localizationManager');

LocalizationManager.attributes.add('autoDetectLanguage', {
    type: 'boolean',
    default: true
});

LocalizationManager._currentLocale = "en-US";

LocalizationManager.getInstance = function () {
    if (!LocalizationManager._instance) throw new Error('LocalizationManager is not initialized yet');
    return LocalizationManager._instance;
};


LocalizationManager.prototype.initialize = function () {
    LocalizationManager._app = this.app;
    if (!LocalizationManager._instance) {
        LocalizationManager._instance = this;
    }

    this._applySavedLocale();
};

LocalizationManager.prototype.postInitialize = function () {

};

LocalizationManager.prototype._applySavedLocale = function () {
    // const savedLocale = LocalStorageController.getSavedValue(Constants.Storage.LANGUAGE);
    // if (savedLocale) {
    //     this.changeLocale(savedLocale);
    // } else {
    //     this.detectAndSetBrowserLanguage();
    // }

    this.detectAndSetBrowserLanguage();
};


LocalizationManager.prototype.addJSON = function (json) {
    if (json) {
        this.app.i18n.addData(json);
    }
};

LocalizationManager.prototype.detectAndSetBrowserLanguage = function () {
    if (this.autoDetectLanguage) {
        const apiLocale = LocalizationManager.getClientLanguage();    
        this._setCurrentLocale(this.app.i18n.findAvailableLocale(apiLocale));
    }
};


LocalizationManager.prototype.update = function (dt) {

};

LocalizationManager.prototype.changeLocale = function (locale) {
    const closestLocale = this.app.i18n.findAvailableLocale(locale);
    if (closestLocale !== this.app.i18n.locale) {
        this._setCurrentLocale(closestLocale, true);
    }
}


LocalizationManager.prototype._setCurrentLocale = async function (locale, showLoadingOverlay = false) {
    LocalizationManager._currentLocale = locale;
    this.app.i18n.locale = LocalizationManager._currentLocale;
    this.app.fire('app:changeLocale', this.app.i18n.locale);
};

LocalizationManager.prototype.getCurrentLocale = function () {
    return LocalizationManager._currentLocale;
};


LocalizationManager.prototype.getCountryCode = function () {
    return this.getCurrentLocale().substr(0, 2);
};

LocalizationManager.prototype.getLocalizedText = function (textKey, ...replaceParams) {
    let text = this.app.i18n.getText(textKey, this.getCurrentLocale());
    for (let i = 0; i < replaceParams.length; i++) {
        text = text.replace(`{${i}}`, replaceParams[i]);
    }
    return text;
};

LocalizationManager.prototype.getCharactersList = function (...locales) {
    const baseChars = `!"#\$%&'()*+,-0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_\`abcdefghijklmnopqrstuvwxyz{|}`;
    const allCharacters = new Set(baseChars.split(''));
    locales.forEach(locale => {
        const localeFileName = this.app.i18n.findAvailableLocale(locale);
        const localeFile = this.app.assets.find(localeFileName, 'json');
        if (!localeFile) {
            Utils.warn('No locale file for ' + locale);
            return;
        }

        localeFile.resource.data.forEach(item => {
            console.log('parsing item ' + item.info.locale);
            Object.keys(item.messages).forEach(key => {
                const string = item.messages[key];
                string.split('').forEach(char => allCharacters.add(char));
            });
        });

        Utils.log('File for ' + localeFileName + ': ', localeFile);
    });

    return Array.from(allCharacters).sort().join('');
};

/* Static */

LocalizationManager.getClientLanguage = function () {
    return (navigator.language || 'en');
};



// CanvasFontHelper.js
// @ts-nocheck
var CanvasFontHelper = pc.createScript('canvasFontHelper');

CanvasFontHelper.attributes.add('fontAssets', {
    type: 'json',
    array: true,
    schema: [{
        name: 'name',
        type: 'string',
        description: 'Name for the font face for the canvas font to reference'
    }, {
        name: 'asset',
        type: 'asset',
        assetType: 'binary',
        description: 'Font asset'
    }]
});



CanvasFontHelper.attributes.add('canvasFonts', {
    type: 'json', 
    array: true,
    schema: [{
        name: 'assetName',
        type: 'string',
        default: 'Arial Canvas Font White',
        description: 'If possible, keep this unique to make this easy to find in the assets registry!'
    }, {
        name: 'fontFaces',
        type: 'string',
        default: 'Arial',
        description: 'This has to be written as though it was in a CSS file (https://www.w3schools.com/cssref/pr_font_font-family.asp)'      
    }, {
        name: 'textureSize', 
        type: 'vec2', 
        default: [2048, 2048],
        description: 'The larger the size, the more VRAM is used. More textures are created to fit the glyphs as the canvas font is updated'
    }, {
        name: 'fontSize', 
        type: 'number',
        default: 64,
        description: 'The larger the size, the sharper the glyph but the more space it takes up on the texture'
    }, {
        name: 'padding', 
        type: 'number',
        default: 0,
        description: 'Glyph padding, try to keep it reasonably small (~1/4 of font size)'
    },  {
        name: 'color',
        type: 'rgb',
        default: [1, 1, 1]
    }]
});

// initialize code called once per entity
CanvasFontHelper.prototype.initialize = function() {
    var self = this;
    var app = this.app;
    var i;
    
    // Create the canvas font assets
    for (i = 0; i < this.canvasFonts.length; ++i) {
        var canvasFont = this.canvasFonts[i];
        canvasFont.asset = new pc.Asset(canvasFont.assetName, 'font', {});
        app.assets.add(canvasFont.asset);
        canvasFont.asset.loaded = false;
    }

    // Load the font files
    var fontsLoadedCount = 0;
    var fontsFacesAdded = [];
    
    for (i = 0; i < this.fontAssets.length; ++i) {
        // Fontface API not supported in IE 11
        var fontAsset = this.fontAssets[i];
        var font = new FontFace(fontAsset.name, 'url(' + fontAsset.asset.getFileUrl() + ')');  
        font.load().then((loadedFace) => {
            document.fonts.add(loadedFace);    
            fontsFacesAdded.push(loadedFace);
            fontsLoadedCount += 1;
            
            if (fontsLoadedCount == self.fontAssets.length) {
                self._onFontFacesLoaded();
            }
        }).catch((error) => {
            console.error(error);
        });
    }
    
    // Remove the fonts and canvas fonts when this script is destroyed
       
    // Cleanup if destroyed
    this.on('destroy', function () {
        var i;
        
        for (i = 0; i < fontsFacesAdded.length; ++i) {
            document.fonts.delete(fontsFacesAdded[i]);
        }
        
        for (i = 0; i < this.canvasFonts.length; ++i) {
            var canvasFont = this.canvasFonts[i];
            canvasFont.asset.resource.destroy();
            app.assets.remove(canvasFont.asset);
        }
    }, this);
};


CanvasFontHelper.prototype._onFontFacesLoaded = function () {
    for (var i = 0; i < this.canvasFonts.length; ++i) {
        var canvasFont = this.canvasFonts[i];
        
        var cf = new pc.CanvasFont(this.app, {
            color: canvasFont.color,
            fontName: canvasFont.fontFaces, // Font has to be added as a font face or exist already on the user's PC
            fontSize: canvasFont.fontSize,
            width: canvasFont.textureSize.x,
            height: canvasFont.textureSize.y,
            padding: canvasFont.padding,
            getCharScale: function (code) {
                // Finger pointing up and rainbow
                if (code === 0x261D || code === 0x1F308) {
                    return 0.8;
                }

                return -1; // use default scale
            }
        });

        canvasFont.asset.resource = cf;

        // Create the textures first
        cf.createTextures(' ');
        canvasFont.asset.loaded = true;
        canvasFont.asset.fire('load', canvasFont.asset);
    }
};


/** Inject Text Element helpers */
const _setTextOriginal = pc.TextElement.prototype._setText;

pc.TextElement.prototype._setText = function() {
    this._entity.fire('bitmaptext:render',  ...arguments);
    _setTextOriginal.call(this, ...arguments);
};

// BitmapText.js
// @ts-nocheck
var BitmapText = pc.createScript('bitmapText');

BitmapText.attributes.add('fontAssetName', { 
    type: 'string',
    default: 'Lalezar'
});

BitmapText.prototype.initialize = function () {
    this.entity.__useBitmapFontRenderer__ = true;
    this.initialString = this.entity.element.key || this.entity.element.text;
    this.initialKey = this.entity.element.key;

    if(this.entity.element) {
        this.entity.element.rtlReorder = false;
        this.entity.element.unicodeConverter = false;
    }
};


BitmapText.prototype.postInitialize = function () {
    this._canvasFontAsset = this.app.assets.find(this.fontAssetName);
    
    if (this._canvasFontAsset == null) {
        console.warn("Can't find font asset: " + this.fontAssetName + ' on ' + this.entity.path);
    } else {
        if (this._canvasFontAsset.loaded) {
            this._onCanvasFontAssetLoaded(this._canvasFontAsset);
        } else {
            this._canvasFontAsset.ready(this._onCanvasFontAssetLoaded, this);
        }
    }
};


BitmapText.prototype._onCanvasFontAssetLoaded = function (asset) {
    this.entity.element.fontAsset = this._canvasFontAsset;
    this.entity.on('bitmaptext:render', this._renderText, this);
    this._updateText(this.entity.element.text);
};


BitmapText.prototype._updateText = function (text) {
    if(!this._canvasFontAsset) return console.error('Asset not loaded: ', this.entity.path);
    if (this._canvasFontAsset.loaded) {
        this._canvasFontAsset.resource.updateTextures(text);
        this.entity.element.text = text;
    } else {
        this.initialString = text;
    }
};

BitmapText.prototype._renderText = function (text) {
    if (this._canvasFontAsset.loaded) {
        this._lastLocale = this.app.i18n.locale;
        this._canvasFontAsset.resource.updateTextures(text);
    }
};



BitmapText.prototype.update = function (dt) {
    if(this.entity.element.key || this.initialKey) {
        if(this.app.i18n.locale !== this._lastLocale) {
            this._updateText(this.app.i18n.getText(this.entity.element.key || this.initialKey));   
        }
    }
};




// BallsSign.js
//@ts-nocheck
var BallsSign = pc.createScript('ballsSign');

BallsSign.attributes.add('ballsAmountText', {
    type: 'entity',
    title: 'Balls Amount Text'
});

BallsSign.attributes.add('premiumBallsAmountText', {
    type: 'entity',
    title: 'Premium Balls Amount Text'
});

BallsSign.attributes.add('infinitySymbol', {
    type: 'entity',
    title: 'Infinity Symbol'
});

BallsSign.prototype.initialize = function () {
    this.infiniteBalls = false;

    this.app.on(EventTypes.SET_BALLS_AMOUNT_TEXT, this.setBallsAmountText, this);
    this.app.on(EventTypes.SET_PREMIUM_BALLS_AMOUNT_TEXT, this.setPremiumBallsAmountText, this);
    this.app.on(EventTypes.SET_INFINITE_BALLS_MODE, this.setInfiniteBalls, this);

    /* entity methods */
    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);
};

BallsSign.prototype.show = async function (tween = true) {
    if(this._appearingTween && this._appearingTween.playing) this._appearingTween.stop();
    this.entity.enabled = true;
    this.entity.setLocalScale(pc.Vec3.ZERO);
    if(tween) {
        this._appearingTween = this.entity.tween(this.entity.getLocalScale())
            .to(pc.Vec3.ONE, 0.2, pc.SineOut)
            .onComplete(() => {
            })
            .start();
    } else {
        this.entity.setLocalScale(pc.Vec3.ONE);
    }
};

BallsSign.prototype.hide = async function (tween = true) {
    if(this._appearingTween && this._appearingTween.playing) this._appearingTween.stop();
    if(tween) {
        this._appearingTween = this.entity.tween(this.entity.getLocalScale())
            .to(pc.Vec3.ZERO, 0.15, pc.SineIn)
            .onComplete(() => {
                this.entity.enabled = false;
            })
            .start();
    } else {
        this.entity.enabled = false;
    }
};

BallsSign.prototype.setBallsAmountText = function (amount, useTween) {
    if(this.ballsAmountText){
        if(useTween) {
            const currentValue = +this.ballsAmountText.element.text || 0;
            const delta = amount - currentValue;
            const duration = pc.math.clamp(Math.abs(delta) * 0.05, 0.1, 0.75);
            Utils.tweenText(this.ballsAmountText, currentValue, amount, duration, 0.0, pc.Linear);
        } else {
            this.ballsAmountText.element.text = `${amount}`;
        }
    }
};

BallsSign.prototype.setPremiumBallsAmountText = function (amount, useTween) {
    if(this.premiumBallsAmountText){
        if(useTween) {
            const currentValue = +this.premiumBallsAmountText.element.text || 0;
            const delta = amount - currentValue;
            const duration = pc.math.clamp(Math.abs(delta) * 0.05, 0.1, 0.75);
            Utils.tweenTextWithPrefix(this.premiumBallsAmountText, '+', currentValue, amount, duration, 0.0, pc.Linear);
        } else {
            this.premiumBallsAmountText.element.text = `+${amount}`;
        }
    }
};

BallsSign.prototype.setInfiniteBalls = function (infiniteBalls) {
    this.infiniteBalls = infiniteBalls;
    if(this.infinitySymbol) this.infinitySymbol.enabled = infiniteBalls;
    if(this.ballsAmountText && this.infinitySymbol) this.ballsAmountText.enabled = !infiniteBalls;
};

BallsSign.prototype.update = function (dt) {

};


// particleSystemTrigger.js
//@ts-nocheck
var ParticleSystemTrigger = pc.createScript('particleSystemTrigger');

ParticleSystemTrigger.attributes.add('eventName', {
    type: 'string',
    description: 'The event name to trigger'
});

ParticleSystemTrigger.attributes.add('offEventName', {
    type: 'string',
    description: 'The event name to trigger when the particle system is off'
});

ParticleSystemTrigger.prototype.initialize = function() {
    if(this.eventName) {
        this.app.on(this.eventName, this.onEvent, this);
    }
    if(this.offEventName) {
        this.app.on(this.offEventName, this.onOffEvent, this);
    }
    this.on('destroy', this.destroy, this);
};

ParticleSystemTrigger.prototype.onEvent = function() {
    this.entity.particlesystem.reset();
    this.entity.particlesystem.play();
};

ParticleSystemTrigger.prototype.onOffEvent = function() {
    this.entity.particlesystem.stop();
};

ParticleSystemTrigger.prototype.destroy = function() {
    this.app.off(this.eventName, this.onEvent, this);
    this.app.off(this.offEventName, this.onOffEvent, this);
};


// ballsBox.js
//@ts-nocheck
var BallsBox = pc.createScript('ballsBox');

BallsBox.attributes.add('ballsContainer', {
    type: 'entity',
});

BallsBox.attributes.add('regularBallTemplate', {
    type: 'asset',
    assetType: 'template',
});

BallsBox.attributes.add('premiumBallTemplate', {
    type: 'asset',
    assetType: 'template',
});

BallsBox.attributes.add('maxBalls', {
    type: 'number',
    default: 12,
});

BallsBox.attributes.add('minRegularBalls', {
    type: 'number',
    default: 3,
});

BallsBox.attributes.add('spawnPoint', {
    type: 'entity',
});

/* Spawn point used when adding extra balls mid-game (addRegularBalls / addPremiumBalls) */
BallsBox.attributes.add('addSpawnPoint', {
    type: 'entity',
});

BallsBox.attributes.add('spawnBounds', {
    type: 'vec3',
    default: [1, 1, 1],
});

BallsBox.attributes.add('addSpawnBounds', {
    type: 'vec3',
    default: [1, 1, 1],
});

/* Delay in seconds between each ball spawned during createBalls */
BallsBox.attributes.add('spawnDelay', {
    type: 'number',
    default: 0.05,
});

/* Delay in seconds between each ball spawned during addRegularBalls / addPremiumBalls */
BallsBox.attributes.add('addSpawnDelay', {
    type: 'number',
    default: 0.05,
});


BallsBox.prototype.initialize = function () {
    if (!this.ballsContainer) console.error('BallsContainer not set on ' + this.entity.name);
    if (!this.regularBallTemplate) console.error('regularBallTemplate not set on ' + this.entity.name);
    if (!this.spawnPoint) console.error('spawnPoint not set on ' + this.entity.name);
    if (!this.addSpawnPoint) console.error('addSpawnPoint not set on ' + this.entity.name);

    this._regularBallsLeft = 0;
    this._premiumBallsLeft = 0;
    this._visualRegular = 0;
    this._visualPremium = 0;

    this.entity.setCounts = this.setCounts.bind(this);
    this.entity.createBalls = this.createBalls.bind(this);
    this.entity.addRegularBalls = this.addRegularBalls.bind(this);
    this.entity.addPremiumBalls = this.addPremiumBalls.bind(this);
    this.entity.popBall = this.popBall.bind(this);
    this.entity.popRegularBall = this.popRegularBall.bind(this);
    this.entity.popPremiumBall = this.popPremiumBall.bind(this);
    this.entity.getRegularBallsAmount = this.getRegularBallsAmount.bind(this);
    this.entity.getPremiumBallsAmount = this.getPremiumBallsAmount.bind(this);
    this.entity.spawnBalls = this.spawnBalls.bind(this);
    this.entity.clearAll = this.clearAll.bind(this);
    this.entity.shakeRandom = this.shakeRandom.bind(this);
    this.entity.disablePhysics = this.disablePhysics.bind(this);
    this.entity.enablePhysics = this.enablePhysics.bind(this);
    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);
};


/* Store counts and clear visuals without spawning */
BallsBox.prototype.setCounts = function (regularAmount, premiumAmount) {
    this._regularBallsLeft = Math.max(regularAmount || 0, 0);
    this._premiumBallsLeft = Math.max(premiumAmount || 0, 0);
    this.clearAll();
};

/* Set counts, clear all existing balls, and spawn fresh */
BallsBox.prototype.createBalls = function (regularAmount, premiumAmount) {
    this._regularBallsLeft = Math.max(regularAmount || 0, 0);
    this._premiumBallsLeft = Math.max(premiumAmount || 0, 0);
    this.clearAll();
    const { targetRegular, targetPremium } = this._computeTargets();
    this._spawnBalls(targetRegular, targetPremium, this.spawnDelay, this.spawnPoint, this.spawnBounds);
};

BallsBox.prototype.addRegularBalls = function (amount) {
    this._regularBallsLeft += Math.max(amount || 0, 0);
    const { targetRegular, targetPremium } = this._computeTargets();
    if (targetPremium !== this._visualPremium) {
        this.clearAll();
    }
    this._spawnBalls(targetRegular, targetPremium, this.addSpawnDelay, this.addSpawnPoint, this.addSpawnBounds);
};

BallsBox.prototype.addPremiumBalls = function (amount) {
    this._premiumBallsLeft += Math.max(amount || 0, 0);
    const { targetRegular, targetPremium } = this._computeTargets();
    if (targetPremium !== this._visualPremium) {
        this.clearAll();
    }
    this._spawnBalls(targetRegular, targetPremium, this.addSpawnDelay, this.addSpawnPoint, this.addSpawnBounds);
};

/* Decrement regular first, then premium */
BallsBox.prototype.popBall = function () {
    if (this._regularBallsLeft > 0) {
        this.popRegularBall();
    } else {
        this.popPremiumBall();
    }
};

BallsBox.prototype.popRegularBall = function () {
    this._regularBallsLeft = Math.max(this._regularBallsLeft - 1, 0);
    this._removeOneBall(false);
};

BallsBox.prototype.popPremiumBall = function () {
    this._premiumBallsLeft = Math.max(this._premiumBallsLeft - 1, 0);
    this._removeOneBall(true);
};

BallsBox.prototype.getRegularBallsAmount = function () {
    return this._regularBallsLeft;
};

BallsBox.prototype.getPremiumBallsAmount = function () {
    return this._premiumBallsLeft;
};

BallsBox.prototype.getTotalBallsAmount = function () {
    return this._regularBallsLeft + this._premiumBallsLeft;
};

/* Spawn visual balls to match current logical counts without changing those counts */
BallsBox.prototype.spawnBalls = function (delay, spawnPoint, bounds) {
    const { targetRegular, targetPremium } = this._computeTargets();
    this._spawnBalls(
        targetRegular, targetPremium,
        delay !== undefined ? delay : this.spawnDelay,
        spawnPoint || this.spawnPoint,
        bounds || this.spawnBounds
    );
};

/* Compute how many regular and premium balls should be visible given current logical counts */
BallsBox.prototype._computeTargets = function () {
    const totalLeft = this._regularBallsLeft + this._premiumBallsLeft;
    const targetTotal = Math.min(totalLeft, this.maxBalls);
    const guaranteedRegular = Math.min(this.minRegularBalls, this._regularBallsLeft);
    const targetPremium = Math.min(this._premiumBallsLeft, targetTotal - guaranteedRegular);
    const targetRegular = targetTotal - targetPremium;
    return { targetTotal, targetRegular, targetPremium };
};

/* Spawn balls until visual counts reach the given targets */
BallsBox.prototype._spawnBalls = function (targetRegular, targetPremium, delay, spawnPoint, bounds) {
    let delayIndex = 0;
    for (let i = this._visualRegular; i < targetRegular; i++) {
        this._addBall(false, delayIndex++ * (delay || 0), spawnPoint, bounds);
    }
    for (let i = this._visualPremium; i < targetPremium; i++) {
        this._addBall(true, delayIndex++ * (delay || 0), spawnPoint, bounds);
    }
};

/* Remove entities from the end until total entity count equals targetTotal */
BallsBox.prototype._removeExcess = function (targetTotal) {
    let toRemove = (this._visualRegular + this._visualPremium) - targetTotal;
    for (let i = this.ballsContainer.children.length - 1; i >= 0 && toRemove > 0; i--) {
        const child = this.ballsContainer.children[i];
        if (child._isPremiumBall) this._visualPremium--;
        else this._visualRegular--;
        child.destroy();
        toRemove--;
    }
};

/* Remove the last entity of the given type */
BallsBox.prototype._removeOneBall = function (isPremium) {
    const { targetRegular, targetPremium } = this._computeTargets();
    const targetVisual = isPremium ? targetPremium : targetRegular;
    const currentVisual = isPremium ? this._visualPremium : this._visualRegular;
    if (currentVisual <= targetVisual) {
        this.shakeRandom();
        return;
    }

    const children = this.ballsContainer.children;
    for (let i = children.length - 1; i >= 0; i--) {
        if (!!children[i]._isPremiumBall === isPremium) {
            children[i].destroy();
            if (isPremium) this._visualPremium--;
            else this._visualRegular--;
            return;
        }
    }
};

BallsBox.prototype._addBall = function (isPremium, delay, spawnPoint, bounds) {
    const spawnPos = (spawnPoint || this.spawnPoint).getPosition();
    const b = bounds || this.spawnBounds;

    const doSpawn = () => {
        if (this.ballsContainer.children.length >= this.maxBalls) return;

        this.app.fire(EventTypes.PLAY_AUDIO, 'pop', 60);

        const template = (isPremium && this.premiumBallTemplate) ? this.premiumBallTemplate : this.regularBallTemplate;
        const ball = template.resource.instantiate();
        ball._isPremiumBall = isPremium;
        this.ballsContainer.addChild(ball);

        if (isPremium) this._visualPremium++;
        else this._visualRegular++;

        if (ball.rigidbody) {
            ball.rigidbody.teleport(new pc.Vec3(
                spawnPos.x + pc.math.random(-b.x / 2, b.x / 2),
                spawnPos.y + pc.math.random(-b.y / 2, b.y / 2),
                spawnPos.z + pc.math.random(-b.z / 2, b.z / 2)
            ));
            ball.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0);
        }
    };

    if (delay > 0) {
        Utils.wait(delay * 1000).then(doSpawn);
    } else {
        doSpawn();
    }
};


BallsBox.prototype.clearAll = function () {
    for (let i = this.ballsContainer.children.length - 1; i >= 0; i--) {
        this.ballsContainer.children[i].destroy();
    }
    this._visualRegular = 0;
    this._visualPremium = 0;
};

BallsBox.prototype.shakeRandom = function () {
    const balls = this.ballsContainer.children;
    if (balls.length === 0) return;
    const ball = Utils.getRandomItem(balls);
    if (ball && ball.rigidbody) {
        ball.rigidbody.applyImpulse(
            new pc.Vec3(pc.math.random(-1, 1), pc.math.random(-0.1, 0.1), pc.math.random(-1, 1)).scale(5),
            new pc.Vec3(0, 0, 0)
        );
    }
};

BallsBox.prototype.disablePhysics = function () {
    this.ballsContainer.forEach(child => {
        if (child.rigidbody) {
            child.rigidbody.enabled = false;
        }
    });
};


BallsBox.prototype.enablePhysics = function () {
    this.ballsContainer.forEach(child => {
        if (child.rigidbody) {
            child.rigidbody.enabled = true;
        }
    });
};

BallsBox.prototype.show = function () {
    this.entity.enabled = true;
};

BallsBox.prototype.hide = function () {
    this.entity.enabled = false;
};


// bombsBox.js
//@ts-nocheck
var BombsBox = pc.createScript('bombsBox');

BombsBox.attributes.add('bombsContainer', {
    type: 'entity',
});


BombsBox.prototype.initialize = function () {
    if (!this.bombsContainer) console.error('BombsContainer not set on ' + this.entity.name);

    this.entity.setBombsAmount = this.setBombsAmount.bind(this);
    this.entity.popBomb = this.popBomb.bind(this);
    this.entity.getBombsAmount = this.getBombsAmount.bind(this);
    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);

    this.entity.enabled = false;
};


/*
 * Show exactly `amount` bombs (enable the first N children, hide the rest).
 * Bombs are static pre-placed children of bombsContainer - no physics, no spawning.
 */
BombsBox.prototype.setBombsAmount = function (amount) {
    const bombs = this.bombsContainer.children;
    for (let i = 0; i < bombs.length; i++) {
        bombs[i].enabled = i < amount;
    }
};

/* Hide the last currently-visible bomb */
BombsBox.prototype.popBomb = function () {
    const bombs = this.bombsContainer.children;
    for (let i = bombs.length - 1; i >= 0; i--) {
        if (bombs[i].enabled) {
            bombs[i].enabled = false;
            return;
        }
    }
};

BombsBox.prototype.getBombsAmount = function () {
    return this.bombsContainer.children.filter(b => b.enabled).length;
};


BombsBox.prototype.show = function () {
    this.entity.enabled = true;
};

BombsBox.prototype.hide = function () {
    this.entity.enabled = false;
};


// BallsBoxDestroyTrigger.js
//@ts-nocheck
var BallsBoxDestroyTrigger = pc.createScript('ballsBoxDestroyTrigger');


BallsBoxDestroyTrigger.prototype.initialize = function() {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);

    this.on('destroy', this.onDestroy, this);
};

BallsBoxDestroyTrigger.prototype.onTriggerEnter = function(entity) {
    if(entity && entity.tags.has('ball_decoration')) {
        entity.enabled = false;
    }
};

BallsBoxDestroyTrigger.prototype.onDestroy = function() {
    if(this.entity && this.entity.collision) {
        this.entity.collision.off('triggerenter', this.onTriggerEnter, this);
    }
};



// ccd.js
//@ts-nocheck
var Ccd = pc.createScript('ccd');

Ccd.attributes.add('motionThreshold', {
    type: 'number',
    default: 0.01
});

Ccd.attributes.add('sweptSphereRadius', {
    type: 'number',
    default: 0.01
});

Ccd.prototype.initialize = function() {
    
    this._applyCcdAttributes();

    this.on('attr', this._applyCcdAttributes, this);
};

Ccd.prototype._applyCcdAttributes = function() {
    const rigidbody = this.entity.rigidbody;
    if (rigidbody && rigidbody.body) {
        rigidbody.body.setCcdMotionThreshold(this.motionThreshold);
        rigidbody.body.setCcdSweptSphereRadius(this.sweptSphereRadius);
    }
};


// PhysicsDebugger.js
//@ts-nocheck
var PhysicsDebugger = pc.createScript('physicsDebugger');

PhysicsDebugger.prototype.initialize = function() {
  
};

PhysicsDebugger.prototype.update = function(dt) {
    const physicsDebugMode = GameConfig.getAttribute('physicsRenderMode');
    if(!physicsDebugMode) return;
    if (!this.renderer) {
        this.createDebugDrawer();
    }

    if(this.renderer.getDebugMode() !== physicsDebugMode) {
        this.renderer.setMode(physicsDebugMode);
    }
    
    this.renderer.update(); 
};

PhysicsDebugger.prototype.createDebugDrawer = function() {
    this.renderer = new AmmoDebugDrawer();
    this.renderer.enable();
};



// debug-drawer.js
/*
 * https://github.com/LeXXik/ammo-debug-drawer
 * */
class AmmoDebugDrawer {
    
    constructor(layer) {
        const drawer = new Ammo.DebugDrawer();
        drawer.drawLine = this.drawLine.bind(this);
        drawer.drawContactPoint = this.drawContactPoint.bind(this);
        drawer.reportErrorWarning = this.reportErrorWarning.bind(this);
        drawer.draw3dText = this.draw3dText.bind(this);
        drawer.setDebugMode = this.setDebugMode.bind(this);
        drawer.getDebugMode = this.getDebugMode.bind(this);
        drawer.enable = this.enable.bind(this);
        drawer.disable = this.disable.bind(this);
        drawer.update = this.update.bind(this);
        
        this.app = pc.AppBase.getApplication();
        
        const world = this.app.systems.rigidbody.dynamicsWorld;
        world.setDebugDrawer(drawer);
        this.world = world;
        
        this._v1 = new pc.Vec3();
        this._v2 = new pc.Vec3();
        this._v3 = new pc.Vec3();
        this.color = new pc.Color(1, 1, 0, 1);
        
        this._debugDrawMode = 1;
        this._enabled = false;
        
        this.layer = layer || this.app.scene.layers.getLayerByName('AmmoDebugDraw') || this.app.scene.layers.getLayerById(pc.LAYERID_UI);
        this.setDebugMode(this._debugDrawMode);
    }
        
    // 0: Disable
    // 1: Wireframe
    // 2: Bounding Boxes
    // 3: Wireframe + AABB
    // 8: Contact Points
    setMode(mode) {
        this.setDebugMode(mode);
    }
    
    enable() {
        this._enabled = true;
    }
    
    disable() {
        this._enabled = false;
    }
    
    drawContactPoint(pointOnB, normalOnB, distance, lifeTime, color) {
        const p = Ammo.wrapPointer(pointOnB, Ammo.btVector3);
        const n = Ammo.wrapPointer(normalOnB, Ammo.btVector3);
        const c = Ammo.wrapPointer(color, Ammo.btVector3);
        this.color.set(c.x(), c.y(), c.z(), 1);
        
        const from = this._v1;
        const to = this._v2;
        const dir = this._v3;
        
        from.set(p.x(), p.y(), p.z());
        dir.set(n.x(), n.y(), n.z()).scale(0.5);
        to.copy(from).add(dir);
        
        this.app.renderLine(from, to, this.color, {
            layer: this.layer,
            depthTest: false
        });
    }
    
    reportErrorWarning(warningString) {}
    
    draw3dText(location, textString) {}
    
    update() {
        if (this._enabled)
            this.world.debugDrawWorld();
    }
    
    setDebugMode(debugMode) {
        this._debugDrawMode = debugMode;
    }
    
    getDebugMode() {
        return this._debugDrawMode;
    }
    
    drawLine(from, to, color) {
        const f = Ammo.wrapPointer(from, Ammo.btVector3);
        const t = Ammo.wrapPointer(to, Ammo.btVector3);
        const c = Ammo.wrapPointer(color, Ammo.btVector3);
        this.color.set(c.x(), c.y(), c.z(), 1);
        
        this._v1.set(f.x(), f.y(), f.z());
        this._v2.set(t.x(), t.y(), t.z());
        
        this.app.drawLine(this._v1, this._v2, this.color, false, this.layer);
    }
    
}

// Water.js
//@ts-nocheck
var Water = pc.createScript('water');


Water.attributes.add('customMaterial', {
    type: 'asset',
    assetType: 'material',
    title: 'Custom Material',
    description: 'Required: material to apply to the water mesh'
});


// Grid dimensions
Water.attributes.add('gridWidth', {
    type: 'number',
    default: 50,
    min: 2,
    max: 200,
    title: 'Grid Width',
    description: 'Number of vertices along X axis'
});

Water.attributes.add('gridHeight', {
    type: 'number',
    default: 50,
    min: 2,
    max: 200,
    title: 'Grid Height',
    description: 'Number of vertices along Z axis'
});

// Physical dimensions
Water.attributes.add('planeWidth', {
    type: 'number',
    default: 10,
    min: 0.1,
    title: 'Plane Width',
    description: 'Physical width of the water plane'
});

Water.attributes.add('planeHeight', {
    type: 'number',
    default: 10,
    min: 0.1,
    title: 'Plane Height',
    description: 'Physical height of the water plane'
});

// Wave parameters
Water.attributes.add('waveAmplitude', {
    type: 'number',
    default: 0.5,
    min: 0,
    max: 5,
    title: 'Wave Amplitude',
    description: 'Maximum height of waves'
});

Water.attributes.add('waveFrequency', {
    type: 'number',
    default: 1.0,
    min: 0.1,
    max: 10,
    title: 'Wave Frequency',
    description: 'Frequency of wave oscillation'
});

Water.attributes.add('waveSpeed', {
    type: 'number',
    default: 2.0,
    min: 0,
    max: 10,
    title: 'Wave Speed',
    description: 'Speed of wave propagation'
});

Water.attributes.add('waveDirectionX', {
    type: 'number',
    default: 1.0,
    min: -1,
    max: 1,
    title: 'Wave Direction X',
    description: 'Wave direction along X axis'
});

Water.attributes.add('waveDirectionZ', {
    type: 'number',
    default: 0.5,
    min: -1,
    max: 1,
    title: 'Wave Direction Z',
    description: 'Wave direction along Z axis'
});

// Secondary wave for more complex motion
Water.attributes.add('enableSecondaryWave', {
    type: 'boolean',
    default: true,
    title: 'Enable Secondary Wave',
    description: 'Add a second wave for more complex motion'
});

Water.attributes.add('secondaryAmplitude', {
    type: 'number',
    default: 0.3,
    min: 0,
    max: 5,
    title: 'Secondary Wave Amplitude'
});

Water.attributes.add('secondaryFrequency', {
    type: 'number',
    default: 1.5,
    min: 0.1,
    max: 10,
    title: 'Secondary Wave Frequency'
});

Water.attributes.add('secondarySpeed', {
    type: 'number',
    default: 1.5,
    min: 0,
    max: 10,
    title: 'Secondary Wave Speed'
});

Water.attributes.add('secondaryDirectionX', {
    type: 'number',
    default: -0.7,
    min: -1,
    max: 1,
    title: 'Secondary Wave Direction X'
});

Water.attributes.add('secondaryDirectionZ', {
    type: 'number',
    default: 0.8,
    min: -1,
    max: 1,
    title: 'Secondary Wave Direction Z'
});

// Texture scrolling
Water.attributes.add('textureScrollSpeed', {
    type: 'vec2',
    default: [0.1, 0.0],
    title: 'Texture Scroll Speed',
    description: 'UV scroll speed per second (U, V)'
});

Water.attributes.add('scrollDiffuseTexture', {
    type: 'boolean',
    default: true,
    title: 'Scroll Diffuse Texture',
    description: 'Apply UV scrolling to the diffuse texture'
});

Water.attributes.add('scrollOpacityTexture', {
    type: 'boolean',
    default: false,
    title: 'Scroll Opacity Texture',
    description: 'Apply UV scrolling to the opacity texture'
});

// Animation settings
Water.attributes.add('enableAnimation', {
    type: 'boolean',
    default: true,
    title: 'Enable Animation',
    description: 'Enable wave animation'
});

Water.attributes.add('animationSpeed', {
    type: 'number',
    default: 1.0,
    min: 0,
    max: 5,
    title: 'Animation Speed Multiplier'
});

// Performance settings
Water.attributes.add('updateNormals', {
    type: 'boolean',
    default: true,
    title: 'Update Normals',
    description: 'Recalculate normals for lighting (performance impact)'
});

Water.attributes.add('wireframe', {
    type: 'boolean',
    default: false,
    title: 'Wireframe Mode',
    description: 'Show wireframe for debugging'
});

Water.prototype.initialize = function () {
    if (!this.customMaterial) {
        console.warn('Water: customMaterial is required but not assigned on entity "' + this.entity.name + '".');
    }

    this.time = 0;
    this.scrollOffset = new pc.Vec2(0, 0);
    this.vertices = [];
    this.originalVertices = [];
    this.indices = [];

    this.createWaterPlane();
    this.createMaterial();
    this.setupMeshInstance();
};

Water.prototype.createWaterPlane = function () {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    // Generate vertices
    for (let z = 0; z < this.gridHeight; z++) {
        for (let x = 0; x < this.gridWidth; x++) {
            // Position
            const posX = (x / (this.gridWidth - 1) - 0.5) * this.planeWidth;
            const posZ = (z / (this.gridHeight - 1) - 0.5) * this.planeHeight;
            const posY = 0;

            positions.push(posX, posY, posZ);
            this.originalVertices.push(new pc.Vec3(posX, posY, posZ));

            // Normal (initially pointing up)
            normals.push(0, 1, 0);

            // UV coordinates
            uvs.push(x / (this.gridWidth - 1), z / (this.gridHeight - 1));
        }
    }

    // Generate indices for triangles
    for (let z = 0; z < this.gridHeight - 1; z++) {
        for (let x = 0; x < this.gridWidth - 1; x++) {
            const topLeft = z * this.gridWidth + x;
            const topRight = topLeft + 1;
            const bottomLeft = (z + 1) * this.gridWidth + x;
            const bottomRight = bottomLeft + 1;

            // First triangle
            indices.push(topLeft, bottomLeft, topRight);
            // Second triangle
            indices.push(topRight, bottomLeft, bottomRight);
        }
    }

    // Store indices locally for normal calculation
    this.indices = indices;

    // Create mesh
    this.mesh = new pc.Mesh(this.app.graphicsDevice);
    this.mesh.clear(true, false);

    // Set vertex data
    this.mesh.setPositions(positions);
    this.mesh.setNormals(normals);
    this.mesh.setUvs(0, uvs);
    this.mesh.setIndices(indices);
    this.mesh.update(pc.PRIMITIVE_TRIANGLES);

    // Store reference to positions for animation
    this.positions = positions;
    this.normals = normals;
};

Water.prototype.createMaterial = function() {
    if (!this.customMaterial) {
        this.material = null;
        return;
    }
    this.material = this.customMaterial.resource;
    this.scrollOffset.set(0, 0);
};


Water.prototype.setupMeshInstance = function () {
    // Add render component if it doesn't exist
    if (!this.entity.render) {
        this.entity.addComponent('render', {
            type: 'asset'
        });
    }

    // Create mesh instance
    this.meshInstance = new pc.MeshInstance(this.mesh, this.material);
    this.entity.render.meshInstances = [this.meshInstance];

    // Set wireframe if enabled
    if (this.wireframe) {
        this.material.cull = pc.CULLFACE_NONE;
        this.meshInstance.renderStyle = pc.RENDERSTYLE_WIREFRAME;
    }
};

Water.prototype.updateWaves = function (dt) {
    if (!this.enableAnimation) return;

    this.time += dt * this.animationSpeed;

    // Update vertex positions
    for (let i = 0; i < this.originalVertices.length; i++) {
        const vertex = this.originalVertices[i];
        let height = 0;

        // Primary wave
        const wave1 = this.waveDirectionX * vertex.x + this.waveDirectionZ * vertex.z;
        height += Math.sin(wave1 * this.waveFrequency + this.time * this.waveSpeed) * this.waveAmplitude;

        // Secondary wave (if enabled)
        if (this.enableSecondaryWave) {
            const wave2 = this.secondaryDirectionX * vertex.x + this.secondaryDirectionZ * vertex.z;
            height += Math.sin(wave2 * this.secondaryFrequency + this.time * this.secondarySpeed) * this.secondaryAmplitude;
        }

        // Update position
        this.positions[i * 3 + 1] = height; // Y coordinate
    }

    // Update mesh
    this.mesh.setPositions(this.positions);

    // Update normals for proper lighting (optional, performance impact)
    if (this.updateNormals) {
        this.calculateNormals();
    }

    this.mesh.update(pc.PRIMITIVE_TRIANGLES);
};

Water.prototype.calculateNormals = function () {
    // Reset normals
    for (let i = 0; i < this.normals.length; i++) {
        this.normals[i] = 0;
    }

    // Use stored indices instead of trying to get them from mesh
    const indices = this.indices;

    // Calculate face normals and accumulate vertex normals
    for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i] * 3;
        const i2 = indices[i + 1] * 3;
        const i3 = indices[i + 2] * 3;

        // Get vertices
        const v1 = new pc.Vec3(this.positions[i1], this.positions[i1 + 1], this.positions[i1 + 2]);
        const v2 = new pc.Vec3(this.positions[i2], this.positions[i2 + 1], this.positions[i2 + 2]);
        const v3 = new pc.Vec3(this.positions[i3], this.positions[i3 + 1], this.positions[i3 + 2]);

        // Calculate face normal
        const edge1 = new pc.Vec3().sub2(v2, v1);
        const edge2 = new pc.Vec3().sub2(v3, v1);
        const normal = new pc.Vec3().cross(edge1, edge2).normalize();

        // Accumulate normals for each vertex
        this.normals[i1] += normal.x;
        this.normals[i1 + 1] += normal.y;
        this.normals[i1 + 2] += normal.z;
        this.normals[i2] += normal.x;
        this.normals[i2 + 1] += normal.y;
        this.normals[i2 + 2] += normal.z;
        this.normals[i3] += normal.x;
        this.normals[i3 + 1] += normal.y;
        this.normals[i3 + 2] += normal.z;
    }

    // Normalize accumulated normals
    for (let i = 0; i < this.normals.length; i += 3) {
        const normal = new pc.Vec3(this.normals[i], this.normals[i + 1], this.normals[i + 2]).normalize();
        this.normals[i] = normal.x;
        this.normals[i + 1] = normal.y;
        this.normals[i + 2] = normal.z;
    }

    this.mesh.setNormals(this.normals);
};

Water.prototype.updateTextureScroll = function(dt) {
    if (!this.material) return;
    if (!this.scrollDiffuseTexture && !this.scrollOpacityTexture) return;

    this.scrollOffset.x = (this.scrollOffset.x + this.textureScrollSpeed.x * dt) % 1;
    this.scrollOffset.y = (this.scrollOffset.y + this.textureScrollSpeed.y * dt) % 1;

    if (this.scrollDiffuseTexture) {
        this.material.diffuseMapOffset = new pc.Vec2(this.scrollOffset.x, this.scrollOffset.y);
    }
    if (this.scrollOpacityTexture) {
        this.material.opacityMapOffset = new pc.Vec2(this.scrollOffset.x, this.scrollOffset.y);
    }

    this.material.update();
};

Water.prototype.update = function (dt) {
    this.updateWaves(dt);
    this.updateTextureScroll(dt);
};
Water.prototype.onAttributeChanged = function(name, oldValue, newValue) {
    if (name === 'gridWidth' || name === 'gridHeight' || name === 'planeWidth' || name === 'planeHeight') {
        this.createWaterPlane();
        this.setupMeshInstance();
    } else if (name === 'customMaterial') {
        this.createMaterial();
        this.setupMeshInstance();
    } else if (name === 'wireframe') {
        if (this.meshInstance) {
            this.meshInstance.renderStyle = newValue ? pc.RENDERSTYLE_WIREFRAME : pc.RENDERSTYLE_SOLID;
        }
    } else if (name === 'scrollDiffuseTexture' || name === 'scrollOpacityTexture') {
        // Reset scroll offset when toggling textures to avoid visual jump
        this.scrollOffset.set(0, 0);
    }
};


Water.prototype.destroy = function () {
    if (this.mesh) {
        this.mesh.destroy();
    }
};

// WaterSplashesTrigger.js
//@ts-nocheck
var WaterSplashesTrigger = pc.createScript('waterSplashesTrigger');

WaterSplashesTrigger.attributes.add('waterSplashesParticleSystem', {
    type: 'entity',
    description: 'The water splashes particle system entity'
});

WaterSplashesTrigger.attributes.add('triggerEntityTag', {
    type: 'string',
    description: 'The tag of the entity that will trigger the water splashes'
});

WaterSplashesTrigger.attributes.add('ballVelocityMultiplierOnContact', {
    type: 'vec3',
    description: 'The speed multiplier of the ball on contact with the water splashes',
    default: [0.7, 1, 0.7]
});

WaterSplashesTrigger.attributes.add('ballMinVelocity', {
    type: 'number',
    description: 'The minimum velocity of the ball on contact with the water splashes',
    default: 3
});

WaterSplashesTrigger.attributes.add('maxAudioDistance', {
    type: 'number',
    description: 'The maximum distance to the splash to play the audio',
    default: 25
});

WaterSplashesTrigger.prototype.initialize = function () {
    this.mainCamera = CameraController.getInstance().getActiveCamera();
    if (!this.mainCamera) {
        return console.error('WaterSplashes: Main camera not set');
    }
    if (!this.waterSplashesParticleSystem) {
        return console.error('WaterSplashes: Water splashes particle system not set');
    }

    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.on('destroy', this.onDestroy, this);
};

WaterSplashesTrigger.prototype.onTriggerEnter = function (entity) {
    if (entity && entity.tags && entity.tags.has(this.triggerEntityTag) && entity.rigidbody && !entity.waterSplashesTriggered) {
        this.handleBallContact(entity);
    } else if (entity && entity.script && entity.script.item) {
        this.handleItemContact(entity);
    }
};

WaterSplashesTrigger.prototype.handleBallContact = function (ball) {
    const velocity = ball.rigidbody.linearVelocity.clone();

    /* mark it so it can't be triggered again */
    ball.waterSplashesTriggered = true;

    velocity.x *= this.ballVelocityMultiplierOnContact.x;
    velocity.y *= this.ballVelocityMultiplierOnContact.y;
    velocity.z *= this.ballVelocityMultiplierOnContact.z;
    ball.rigidbody.linearVelocity = velocity;

    if (velocity.length() >= this.ballMinVelocity) {
        const distanceToAudio = this.mainCamera.getPosition().distance(ball.getPosition());
        const volume = pc.math.clamp(1 - Math.pow(distanceToAudio / this.maxAudioDistance, 2), 0, 1.0);
        if (volume > 0) {
            this.app.fire(EventTypes.PLAY_AUDIO, Utils.getRandomItem(['waterSplash1', 'waterSplash2']), 150, volume);
        }
        this.waterSplashesParticleSystem.setPosition(ball.getPosition());
        this.waterSplashesParticleSystem.particlesystem.reset();
        this.waterSplashesParticleSystem.particlesystem.play();
    }
};

WaterSplashesTrigger.prototype.handleItemContact = function(item) {
    const distanceToAudio = this.mainCamera.getPosition().distance(item.getPosition());
    const volume = pc.math.clamp(1 - Math.pow(distanceToAudio / this.maxAudioDistance, 2), 0, 1.0);
    if (volume > 0) {
        this.app.fire(EventTypes.PLAY_AUDIO,  Utils.getRandomItem(['waterSplash1', 'waterSplash2']), 150, volume);
    }
    this.waterSplashesParticleSystem.setPosition(item.getPosition());
    this.waterSplashesParticleSystem.particlesystem.reset();
    this.waterSplashesParticleSystem.particlesystem.play();

    item.script.item.breakBlock(true);
};

WaterSplashesTrigger.prototype.update = function (dt) {

};

WaterSplashesTrigger.prototype.onDestroy = function () {
    if (this.entity.collision) {
        this.entity.collision.off('triggerenter', this.onTriggerEnter, this);
    }
};


// PlayWithAdsPackage.js
//@ts-nocheck   
var PlayWithAdsPackage = pc.createScript('playWithAdsPackage');

PlayWithAdsPackage.prototype.initialize = function() {
    this.playWithAdsButton = this.entity.findByName('PlayWithAdsButton');

    BasicButton.assignAction(this.playWithAdsButton, this.playWithAdsPressed, this);

    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);
    this.entity.checkAvailability = this.checkAvailability.bind(this);
};

PlayWithAdsPackage.prototype.show = function (delay = 0) {
    this.entity.enabled = true;
    if (this._appearingTween && this._appearingTween.playing) {
        this._appearingTween.stop();
    }
    this.entity.setLocalScale(0.0, 0.0, 0.0);
    this._appearingTween = this.entity.tween(this.entity.getLocalScale())
        .to(new pc.Vec3(1.0, 1.0, 1.0), 0.5, pc.BackOut)
        .delay(delay)
        .start();
};

PlayWithAdsPackage.prototype.hide = function () {
    this.entity.enabled = false;
};

PlayWithAdsPackage.prototype.checkAvailability = function () {
    //dummy method
    return true;
};

PlayWithAdsPackage.prototype.update = function (dt) {

};



PlayWithAdsPackage.prototype.playWithAdsPressed = function () {
    this.app.fire(EventTypes.PLAY_WITH_ADS_CHOSEN);
};


// PackagesSeparator.js
//@ts-nocheck
var PackagesSeparator = pc.createScript('packagesSeparator');

PackagesSeparator.prototype.initialize = function() {
    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);
};

PackagesSeparator.prototype.show = function (delay = 0) {
    this.entity.enabled = true;
    this.entity.setLocalScale(0.5, 0.5, 0.5);
    this._appearingTween = this.entity.tween(this.entity.getLocalScale())
        .to(new pc.Vec3(1.0, 1.0, 1.0), 0.5, pc.SineOut)
        .delay(delay)
        .start();

    this.entity.children.forEach(child => {
        child.element.opacity = 0.0;
        Utils.tweenOpacity(child, 1.0, 0.5, pc.BackOut, delay);
    });
};

PackagesSeparator.prototype.hide = function () {
    this.entity.enabled = false;
};

PackagesSeparator.prototype.update = function(dt) {

};


// ShopSectionElement.js
//@ts-nocheck
var ShopSectionElement = pc.createScript('shopSectionElement');

ShopSectionElement.prototype.initialize = function() {
    this.entity.show = this.show.bind(this);
    this.entity.hide = this.hide.bind(this);

    this.entity.enabled = false;
};

ShopSectionElement.prototype.show = function (delay = 0) {
    this.entity.enabled = true;
    this.entity.element.opacity = 0.0;
    Utils.tweenOpacity(this.entity, 1.0, 0.15, pc.SineOut, delay);
    if (this._appearingTween && this._appearingTween.playing) {
        this._appearingTween.stop();
    }
    this.entity.setLocalScale(0.0, 0.0, 0.0);
    this._appearingTween = this.entity.tween(this.entity.getLocalScale())
        .to(new pc.Vec3(1.0, 1.0, 1.0), 0.35, pc.SineOut)
        .delay(delay)
        .start();
};
ShopSectionElement.prototype.hide = function() {
    this.entity.enabled = false;
};

ShopSectionElement.prototype.update = function(dt) {

};


