/* esm.sh - three@0.184.0 */
import{Matrix3 as Oe,Vector2 as mt,Color as je,Vector3 as Fe,mergeUniforms as pt,CubeUVReflectionMapping as An,Mesh as wt,BoxGeometry as ii,ShaderMaterial as It,BackSide as St,cloneUniforms as zn,Matrix4 as Qt,ColorManagement as nt,SRGBTransfer as $e,PlaneGeometry as Ar,FrontSide as ln,getUnlitUniformColorSpace as Rr,IntType as br,warn as He,HalfFloatType as Gt,UnsignedByteType as Rt,FloatType as Ot,RGBAFormat as Ut,Plane as sa,CubeReflectionMapping as cn,CubeRefractionMapping as Jt,BufferGeometry as Rn,OrthographicCamera as Cr,PerspectiveCamera as gn,NoToneMapping as bt,MeshBasicMaterial as la,error as Qe,NoBlending as Dt,WebGLRenderTarget as Ct,BufferAttribute as vn,LinearSRGBColorSpace as Pr,LinearFilter as vt,CubeTexture as Lr,LinearMipmapLinearFilter as qt,CubeCamera as ca,EquirectangularReflectionMapping as Un,EquirectangularRefractionMapping as Dn,warnOnce as fa,Uint32BufferAttribute as da,Uint16BufferAttribute as ua,DataArrayTexture as Ur,Vector4 as ht,DepthTexture as fn,Float32BufferAttribute as hi,RawShaderMaterial as pa,CustomToneMapping as Dr,NeutralToneMapping as wr,AgXToneMapping as Ir,ACESFilmicToneMapping as Nr,CineonToneMapping as yr,ReinhardToneMapping as Fr,LinearToneMapping as Or,Data3DTexture as ha,GreaterEqualCompare as ri,LessEqualCompare as ai,Texture as ma,GLSL3 as mi,VSMShadowMap as on,PCFShadowMap as Sn,AddOperation as _a,MixOperation as ga,MultiplyOperation as va,LinearTransfer as Br,UniformsUtils as Sa,DoubleSide as Lt,NormalBlending as En,TangentSpaceNormalMap as _i,ObjectSpaceNormalMap as Ea,Layers as xa,RGFormat as jt,RG11_EAC_Format as Xn,RED_GREEN_RGTC2_Format as Kn,MeshDepthMaterial as Ma,MeshDistanceMaterial as Ta,PCFSoftShadowMap as Aa,DepthFormat as en,NearestFilter as kt,CubeDepthTexture as Ra,UnsignedIntType as Wt,Frustum as Gr,LessEqualDepth as gi,ReverseSubtractEquation as ba,SubtractEquation as Ca,AddEquation as nn,OneMinusConstantAlphaFactor as Pa,ConstantAlphaFactor as La,OneMinusConstantColorFactor as Ua,ConstantColorFactor as Da,OneMinusDstAlphaFactor as wa,OneMinusDstColorFactor as Ia,OneMinusSrcAlphaFactor as Na,OneMinusSrcColorFactor as ya,DstAlphaFactor as Fa,DstColorFactor as Oa,SrcAlphaSaturateFactor as Ba,SrcAlphaFactor as Ga,SrcColorFactor as Ha,OneFactor as Va,ZeroFactor as ka,NotEqualDepth as Wa,GreaterDepth as za,GreaterEqualDepth as Xa,EqualDepth as Ka,LessDepth as Ya,AlwaysDepth as qa,NeverDepth as Za,CullFaceNone as $a,CullFaceBack as vi,CullFaceFront as Qa,CustomBlending as Ja,MultiplyBlending as Si,SubtractiveBlending as Ei,AdditiveBlending as xi,ReversedDepthFuncs as ja,MinEquation as eo,MaxEquation as to,MirroredRepeatWrapping as no,ClampToEdgeWrapping as Yn,RepeatWrapping as io,LinearMipmapNearestFilter as wn,NearestMipmapLinearFilter as hn,NearestMipmapNearestFilter as ro,NotEqualCompare as ao,GreaterCompare as oo,EqualCompare as so,LessCompare as lo,AlwaysCompare as co,NeverCompare as fo,NoColorSpace as Yt,DepthStencilFormat as Zt,getByteLength as Mi,UnsignedInt248Type as dn,UnsignedShortType as xn,createElementNS as uo,UnsignedShort4444Type as Hr,UnsignedShort5551Type as Vr,UnsignedInt5999Type as po,UnsignedInt101111Type as ho,ByteType as mo,ShortType as _o,AlphaFormat as go,RGBFormat as vo,RedFormat as So,RedIntegerFormat as kr,RGIntegerFormat as Wr,RGBAIntegerFormat as zr,RGB_S3TC_DXT1_Format as In,RGBA_S3TC_DXT1_Format as Nn,RGBA_S3TC_DXT3_Format as yn,RGBA_S3TC_DXT5_Format as Fn,RGB_PVRTC_4BPPV1_Format as Ti,RGB_PVRTC_2BPPV1_Format as Ai,RGBA_PVRTC_4BPPV1_Format as Ri,RGBA_PVRTC_2BPPV1_Format as bi,RGB_ETC1_Format as Ci,RGB_ETC2_Format as Pi,RGBA_ETC2_EAC_Format as Li,R11_EAC_Format as Ui,SIGNED_R11_EAC_Format as Di,SIGNED_RG11_EAC_Format as wi,RGBA_ASTC_4x4_Format as Ii,RGBA_ASTC_5x4_Format as Ni,RGBA_ASTC_5x5_Format as yi,RGBA_ASTC_6x5_Format as Fi,RGBA_ASTC_6x6_Format as Oi,RGBA_ASTC_8x5_Format as Bi,RGBA_ASTC_8x6_Format as Gi,RGBA_ASTC_8x8_Format as Hi,RGBA_ASTC_10x5_Format as Vi,RGBA_ASTC_10x6_Format as ki,RGBA_ASTC_10x8_Format as Wi,RGBA_ASTC_10x10_Format as zi,RGBA_ASTC_12x10_Format as Xi,RGBA_ASTC_12x12_Format as Ki,RGBA_BPTC_Format as Yi,RGB_BPTC_SIGNED_Format as qi,RGB_BPTC_UNSIGNED_Format as Zi,RED_RGTC1_Format as $i,SIGNED_RED_RGTC1_Format as Qi,SIGNED_RED_GREEN_RGTC2_Format as Ji,ExternalTexture as Xr,EventDispatcher as Eo,ArrayCamera as xo,WebXRController as On,RAD2DEG as Mo,DataTexture as To,createCanvasElement as Ao,SRGBColorSpace as Ro,REVISION as bo,log as ji,WebGLCoordinateSystem as er,probeAsync as Co}from"../777388bbfc7bc409/three.core.mjs.js";import{AdditiveAnimationBlendMode as Sd,AlwaysStencilFunc as Ed,AmbientLight as xd,AnimationAction as Md,AnimationClip as Td,AnimationLoader as Ad,AnimationMixer as Rd,AnimationObjectGroup as bd,AnimationUtils as Cd,ArcCurve as Pd,ArrowHelper as Ld,AttachedBindMode as Ud,Audio as Dd,AudioAnalyser as wd,AudioContext as Id,AudioListener as Nd,AudioLoader as yd,AxesHelper as Fd,BasicDepthPacking as Od,BasicShadowMap as Bd,BatchedMesh as Gd,BezierInterpolant as Hd,Bone as Vd,BooleanKeyframeTrack as kd,Box2 as Wd,Box3 as zd,Box3Helper as Xd,BoxHelper as Kd,BufferGeometryLoader as Yd,Cache as qd,Camera as Zd,CameraHelper as $d,CanvasTexture as Qd,CapsuleGeometry as Jd,CatmullRomCurve3 as jd,CircleGeometry as eu,Clock as tu,ColorKeyframeTrack as nu,Compatibility as iu,CompressedArrayTexture as ru,CompressedCubeTexture as au,CompressedTexture as ou,CompressedTextureLoader as su,ConeGeometry as lu,Controls as cu,CubeTextureLoader as fu,CubicBezierCurve as du,CubicBezierCurve3 as uu,CubicInterpolant as pu,CullFaceFrontBack as hu,Curve as mu,CurvePath as _u,CylinderGeometry as gu,Cylindrical as vu,DataTextureLoader as Su,DataUtils as Eu,DecrementStencilOp as xu,DecrementWrapStencilOp as Mu,DefaultLoadingManager as Tu,DetachedBindMode as Au,DirectionalLight as Ru,DirectionalLightHelper as bu,DiscreteInterpolant as Cu,DodecahedronGeometry as Pu,DynamicCopyUsage as Lu,DynamicDrawUsage as Uu,DynamicReadUsage as Du,EdgesGeometry as wu,EllipseCurve as Iu,EqualStencilFunc as Nu,Euler as yu,ExtrudeGeometry as Fu,FileLoader as Ou,Float16BufferAttribute as Bu,Fog as Gu,FogExp2 as Hu,FramebufferTexture as Vu,FrustumArray as ku,GLBufferAttribute as Wu,GLSL1 as zu,GreaterEqualStencilFunc as Xu,GreaterStencilFunc as Ku,GridHelper as Yu,Group as qu,HTMLTexture as Zu,HemisphereLight as $u,HemisphereLightHelper as Qu,IcosahedronGeometry as Ju,ImageBitmapLoader as ju,ImageLoader as ep,ImageUtils as tp,IncrementStencilOp as np,IncrementWrapStencilOp as ip,InstancedBufferAttribute as rp,InstancedBufferGeometry as ap,InstancedInterleavedBuffer as op,InstancedMesh as sp,Int16BufferAttribute as lp,Int32BufferAttribute as cp,Int8BufferAttribute as fp,InterleavedBuffer as dp,InterleavedBufferAttribute as up,Interpolant as pp,InterpolateBezier as hp,InterpolateDiscrete as mp,InterpolateLinear as _p,InterpolateSmooth as gp,InterpolationSamplingMode as vp,InterpolationSamplingType as Sp,InvertStencilOp as Ep,KeepStencilOp as xp,KeyframeTrack as Mp,LOD as Tp,LatheGeometry as Ap,LessEqualStencilFunc as Rp,LessStencilFunc as bp,Light as Cp,LightProbe as Pp,Line as Lp,Line3 as Up,LineBasicMaterial as Dp,LineCurve as wp,LineCurve3 as Ip,LineDashedMaterial as Np,LineLoop as yp,LineSegments as Fp,LinearInterpolant as Op,LinearMipMapLinearFilter as Bp,LinearMipMapNearestFilter as Gp,Loader as Hp,LoaderUtils as Vp,LoadingManager as kp,LoopOnce as Wp,LoopPingPong as zp,LoopRepeat as Xp,MOUSE as Kp,Material as Yp,MaterialBlending as qp,MaterialLoader as Zp,MathUtils as $p,Matrix2 as Qp,MeshLambertMaterial as Jp,MeshMatcapMaterial as jp,MeshNormalMaterial as eh,MeshPhongMaterial as th,MeshPhysicalMaterial as nh,MeshStandardMaterial as ih,MeshToonMaterial as rh,NearestMipMapLinearFilter as ah,NearestMipMapNearestFilter as oh,NeverStencilFunc as sh,NoNormalPacking as lh,NormalAnimationBlendMode as ch,NormalGAPacking as fh,NormalRGPacking as dh,NotEqualStencilFunc as uh,NumberKeyframeTrack as ph,Object3D as hh,ObjectLoader as mh,OctahedronGeometry as _h,Path as gh,PlaneHelper as vh,PointLight as Sh,PointLightHelper as Eh,Points as xh,PointsMaterial as Mh,PolarGridHelper as Th,PolyhedronGeometry as Ah,PositionalAudio as Rh,PropertyBinding as bh,PropertyMixer as Ch,QuadraticBezierCurve as Ph,QuadraticBezierCurve3 as Lh,Quaternion as Uh,QuaternionKeyframeTrack as Dh,QuaternionLinearInterpolant as wh,RGBADepthPacking as Ih,RGBDepthPacking as Nh,RGBIntegerFormat as yh,RGDepthPacking as Fh,Ray as Oh,Raycaster as Bh,RectAreaLight as Gh,RenderTarget as Hh,RenderTarget3D as Vh,ReplaceStencilOp as kh,RingGeometry as Wh,Scene as zh,ShadowMaterial as Xh,Shape as Kh,ShapeGeometry as Yh,ShapePath as qh,ShapeUtils as Zh,Skeleton as $h,SkeletonHelper as Qh,SkinnedMesh as Jh,Source as jh,Sphere as em,SphereGeometry as tm,Spherical as nm,SphericalHarmonics3 as im,SplineCurve as rm,SpotLight as am,SpotLightHelper as om,Sprite as sm,SpriteMaterial as lm,StaticCopyUsage as cm,StaticDrawUsage as fm,StaticReadUsage as dm,StereoCamera as um,StreamCopyUsage as pm,StreamDrawUsage as hm,StreamReadUsage as mm,StringKeyframeTrack as _m,TOUCH as gm,TetrahedronGeometry as vm,TextureLoader as Sm,TextureUtils as Em,Timer as xm,TimestampQuery as Mm,TorusGeometry as Tm,TorusKnotGeometry as Am,Triangle as Rm,TriangleFanDrawMode as bm,TriangleStripDrawMode as Cm,TrianglesDrawMode as Pm,TubeGeometry as Lm,UVMapping as Um,Uint8BufferAttribute as Dm,Uint8ClampedBufferAttribute as wm,Uniform as Im,UniformsGroup as Nm,VectorKeyframeTrack as ym,VideoFrameTexture as Fm,VideoTexture as Om,WebGL3DRenderTarget as Bm,WebGLArrayRenderTarget as Gm,WebGPUCoordinateSystem as Hm,WireframeGeometry as Vm,WrapAroundEnding as km,ZeroCurvatureEnding as Wm,ZeroSlopeEnding as zm,ZeroStencilOp as Xm,getConsoleFunction as Km,setConsoleFunction as Ym}from"../777388bbfc7bc409/three.core.mjs.js";function Kr(){let e=null,n=!1,t=null,i=null;function l(a,u){t(a,u),i=e.requestAnimationFrame(l)}return{start:function(){n!==!0&&t!==null&&e!==null&&(i=e.requestAnimationFrame(l),n=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),n=!1},setAnimationLoop:function(a){t=a},setContext:function(a){e=a}}}function Po(e){let n=new WeakMap;function t(m,C){let R=m.array,k=m.usage,U=R.byteLength,p=e.createBuffer();e.bindBuffer(C,p),e.bufferData(C,R,k),m.onUploadCallback();let E;if(R instanceof Float32Array)E=e.FLOAT;else if(typeof Float16Array<"u"&&R instanceof Float16Array)E=e.HALF_FLOAT;else if(R instanceof Uint16Array)m.isFloat16BufferAttribute?E=e.HALF_FLOAT:E=e.UNSIGNED_SHORT;else if(R instanceof Int16Array)E=e.SHORT;else if(R instanceof Uint32Array)E=e.UNSIGNED_INT;else if(R instanceof Int32Array)E=e.INT;else if(R instanceof Int8Array)E=e.BYTE;else if(R instanceof Uint8Array)E=e.UNSIGNED_BYTE;else if(R instanceof Uint8ClampedArray)E=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+R);return{buffer:p,type:E,bytesPerElement:R.BYTES_PER_ELEMENT,version:m.version,size:U}}function i(m,C,R){let k=C.array,U=C.updateRanges;if(e.bindBuffer(R,m),U.length===0)e.bufferSubData(R,0,k);else{U.sort((E,D)=>E.start-D.start);let p=0;for(let E=1;E<U.length;E++){let D=U[p],G=U[E];G.start<=D.start+D.count+1?D.count=Math.max(D.count,G.start+G.count-D.start):(++p,U[p]=G)}U.length=p+1;for(let E=0,D=U.length;E<D;E++){let G=U[E];e.bufferSubData(R,G.start*k.BYTES_PER_ELEMENT,k,G.start,G.count)}C.clearUpdateRanges()}C.onUploadCallback()}function l(m){return m.isInterleavedBufferAttribute&&(m=m.data),n.get(m)}function a(m){m.isInterleavedBufferAttribute&&(m=m.data);let C=n.get(m);C&&(e.deleteBuffer(C.buffer),n.delete(m))}function u(m,C){if(m.isInterleavedBufferAttribute&&(m=m.data),m.isGLBufferAttribute){let k=n.get(m);(!k||k.version<m.version)&&n.set(m,{buffer:m.buffer,type:m.type,bytesPerElement:m.elementSize,version:m.version});return}let R=n.get(m);if(R===void 0)n.set(m,t(m,C));else if(R.version<m.version){if(R.size!==m.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(R.buffer,m,C),R.version=m.version}}return{get:l,remove:a,update:u}}var Lo=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Uo=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Do=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,wo=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Io=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,No=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yo=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Fo=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Oo=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Bo=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Go=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ho=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Vo=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ko=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Wo=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,zo=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Xo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ko=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Yo=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,qo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Zo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,$o=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Qo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Jo=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,jo=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,es=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ts=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ns=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,is=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,rs=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,as="gl_FragColor = linearToOutputTexel( gl_FragColor );",os=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ss=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,ls=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,cs=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,fs=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ds=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,us=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ps=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,hs=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ms=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_s=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,gs=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vs=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ss=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Es=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,xs=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Ms=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ts=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,As=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Rs=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bs=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Cs=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ps=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ls=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Us=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ds=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ws=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Is=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ns=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ys=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Fs=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Os=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Bs=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Gs=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hs=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Vs=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ks=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ws=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,zs=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xs=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ks=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ys=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,qs=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Zs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$s=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qs=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Js=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,js=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,el=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,tl=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,nl=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,il=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,rl=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,al=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ol=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,sl=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ll=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,cl=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,fl=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,dl=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,ul=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,pl=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,hl=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ml=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,_l=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,gl=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vl=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Sl=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,El=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xl=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ml=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Tl=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Al=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Rl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,bl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Cl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Pl=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Ll=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ul=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wl=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Il=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Nl=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Fl=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ol=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Bl=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Gl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Hl=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vl=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,kl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Wl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,zl=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kl=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,ql=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zl=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,$l=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ql=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Jl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ec=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tc=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nc=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ic=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,rc=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ac=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,oc=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sc=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lc=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ue={alphahash_fragment:Lo,alphahash_pars_fragment:Uo,alphamap_fragment:Do,alphamap_pars_fragment:wo,alphatest_fragment:Io,alphatest_pars_fragment:No,aomap_fragment:yo,aomap_pars_fragment:Fo,batching_pars_vertex:Oo,batching_vertex:Bo,begin_vertex:Go,beginnormal_vertex:Ho,bsdfs:Vo,iridescence_fragment:ko,bumpmap_pars_fragment:Wo,clipping_planes_fragment:zo,clipping_planes_pars_fragment:Xo,clipping_planes_pars_vertex:Ko,clipping_planes_vertex:Yo,color_fragment:qo,color_pars_fragment:Zo,color_pars_vertex:$o,color_vertex:Qo,common:Jo,cube_uv_reflection_fragment:jo,defaultnormal_vertex:es,displacementmap_pars_vertex:ts,displacementmap_vertex:ns,emissivemap_fragment:is,emissivemap_pars_fragment:rs,colorspace_fragment:as,colorspace_pars_fragment:os,envmap_fragment:ss,envmap_common_pars_fragment:ls,envmap_pars_fragment:cs,envmap_pars_vertex:fs,envmap_physical_pars_fragment:xs,envmap_vertex:ds,fog_vertex:us,fog_pars_vertex:ps,fog_fragment:hs,fog_pars_fragment:ms,gradientmap_pars_fragment:_s,lightmap_pars_fragment:gs,lights_lambert_fragment:vs,lights_lambert_pars_fragment:Ss,lights_pars_begin:Es,lights_toon_fragment:Ms,lights_toon_pars_fragment:Ts,lights_phong_fragment:As,lights_phong_pars_fragment:Rs,lights_physical_fragment:bs,lights_physical_pars_fragment:Cs,lights_fragment_begin:Ps,lights_fragment_maps:Ls,lights_fragment_end:Us,lightprobes_pars_fragment:Ds,logdepthbuf_fragment:ws,logdepthbuf_pars_fragment:Is,logdepthbuf_pars_vertex:Ns,logdepthbuf_vertex:ys,map_fragment:Fs,map_pars_fragment:Os,map_particle_fragment:Bs,map_particle_pars_fragment:Gs,metalnessmap_fragment:Hs,metalnessmap_pars_fragment:Vs,morphinstance_vertex:ks,morphcolor_vertex:Ws,morphnormal_vertex:zs,morphtarget_pars_vertex:Xs,morphtarget_vertex:Ks,normal_fragment_begin:Ys,normal_fragment_maps:qs,normal_pars_fragment:Zs,normal_pars_vertex:$s,normal_vertex:Qs,normalmap_pars_fragment:Js,clearcoat_normal_fragment_begin:js,clearcoat_normal_fragment_maps:el,clearcoat_pars_fragment:tl,iridescence_pars_fragment:nl,opaque_fragment:il,packing:rl,premultiplied_alpha_fragment:al,project_vertex:ol,dithering_fragment:sl,dithering_pars_fragment:ll,roughnessmap_fragment:cl,roughnessmap_pars_fragment:fl,shadowmap_pars_fragment:dl,shadowmap_pars_vertex:ul,shadowmap_vertex:pl,shadowmask_pars_fragment:hl,skinbase_vertex:ml,skinning_pars_vertex:_l,skinning_vertex:gl,skinnormal_vertex:vl,specularmap_fragment:Sl,specularmap_pars_fragment:El,tonemapping_fragment:xl,tonemapping_pars_fragment:Ml,transmission_fragment:Tl,transmission_pars_fragment:Al,uv_pars_fragment:Rl,uv_pars_vertex:bl,uv_vertex:Cl,worldpos_vertex:Pl,background_vert:Ll,background_frag:Ul,backgroundCube_vert:Dl,backgroundCube_frag:wl,cube_vert:Il,cube_frag:Nl,depth_vert:yl,depth_frag:Fl,distance_vert:Ol,distance_frag:Bl,equirect_vert:Gl,equirect_frag:Hl,linedashed_vert:Vl,linedashed_frag:kl,meshbasic_vert:Wl,meshbasic_frag:zl,meshlambert_vert:Xl,meshlambert_frag:Kl,meshmatcap_vert:Yl,meshmatcap_frag:ql,meshnormal_vert:Zl,meshnormal_frag:$l,meshphong_vert:Ql,meshphong_frag:Jl,meshphysical_vert:jl,meshphysical_frag:ec,meshtoon_vert:tc,meshtoon_frag:nc,points_vert:ic,points_frag:rc,shadow_vert:ac,shadow_frag:oc,sprite_vert:sc,sprite_frag:lc},oe={common:{diffuse:{value:new je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Oe}},envmap:{envMap:{value:null},envMapRotation:{value:new Oe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Oe},normalScale:{value:new mt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new Fe},probesMax:{value:new Fe},probesResolution:{value:new Fe}},points:{diffuse:{value:new je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0},uvTransform:{value:new Oe}},sprite:{diffuse:{value:new je(16777215)},opacity:{value:1},center:{value:new mt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}}},At={basic:{uniforms:pt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:Ue.meshbasic_vert,fragmentShader:Ue.meshbasic_frag},lambert:{uniforms:pt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new je(0)},envMapIntensity:{value:1}}]),vertexShader:Ue.meshlambert_vert,fragmentShader:Ue.meshlambert_frag},phong:{uniforms:pt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new je(0)},specular:{value:new je(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ue.meshphong_vert,fragmentShader:Ue.meshphong_frag},standard:{uniforms:pt([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag},toon:{uniforms:pt([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new je(0)}}]),vertexShader:Ue.meshtoon_vert,fragmentShader:Ue.meshtoon_frag},matcap:{uniforms:pt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:Ue.meshmatcap_vert,fragmentShader:Ue.meshmatcap_frag},points:{uniforms:pt([oe.points,oe.fog]),vertexShader:Ue.points_vert,fragmentShader:Ue.points_frag},dashed:{uniforms:pt([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ue.linedashed_vert,fragmentShader:Ue.linedashed_frag},depth:{uniforms:pt([oe.common,oe.displacementmap]),vertexShader:Ue.depth_vert,fragmentShader:Ue.depth_frag},normal:{uniforms:pt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:Ue.meshnormal_vert,fragmentShader:Ue.meshnormal_frag},sprite:{uniforms:pt([oe.sprite,oe.fog]),vertexShader:Ue.sprite_vert,fragmentShader:Ue.sprite_frag},background:{uniforms:{uvTransform:{value:new Oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ue.background_vert,fragmentShader:Ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Oe}},vertexShader:Ue.backgroundCube_vert,fragmentShader:Ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ue.cube_vert,fragmentShader:Ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ue.equirect_vert,fragmentShader:Ue.equirect_frag},distance:{uniforms:pt([oe.common,oe.displacementmap,{referencePosition:{value:new Fe},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ue.distance_vert,fragmentShader:Ue.distance_frag},shadow:{uniforms:pt([oe.lights,oe.fog,{color:{value:new je(0)},opacity:{value:1}}]),vertexShader:Ue.shadow_vert,fragmentShader:Ue.shadow_frag}};At.physical={uniforms:pt([At.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Oe},clearcoatNormalScale:{value:new mt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Oe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Oe},sheen:{value:0},sheenColor:{value:new je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Oe},transmissionSamplerSize:{value:new mt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Oe},attenuationDistance:{value:0},attenuationColor:{value:new je(0)},specularColor:{value:new je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Oe},anisotropyVector:{value:new mt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Oe}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag};var mn={r:0,b:0,g:0},cc=new Qt,Yr=new Oe;Yr.set(-1,0,0,0,1,0,0,0,1);function fc(e,n,t,i,l,a){let u=new je(0),m=l===!0?0:1,C,R,k=null,U=0,p=null;function E(h){let M=h.isScene===!0?h.background:null;if(M&&M.isTexture){let A=h.backgroundBlurriness>0;M=n.get(M,A)}return M}function D(h){let M=!1,A=E(h);A===null?c(u,m):A&&A.isColor&&(c(A,1),M=!0);let H=e.xr.getEnvironmentBlendMode();H==="additive"?t.buffers.color.setClear(0,0,0,1,a):H==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,a),(e.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function G(h,M){let A=E(M);A&&(A.isCubeTexture||A.mapping===An)?(R===void 0&&(R=new wt(new ii(1,1,1),new It({name:"BackgroundCubeMaterial",uniforms:zn(At.backgroundCube.uniforms),vertexShader:At.backgroundCube.vertexShader,fragmentShader:At.backgroundCube.fragmentShader,side:St,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),R.geometry.deleteAttribute("normal"),R.geometry.deleteAttribute("uv"),R.onBeforeRender=function(H,_,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(R.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(R)),R.material.uniforms.envMap.value=A,R.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,R.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,R.material.uniforms.backgroundRotation.value.setFromMatrix4(cc.makeRotationFromEuler(M.backgroundRotation)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&R.material.uniforms.backgroundRotation.value.premultiply(Yr),R.material.toneMapped=nt.getTransfer(A.colorSpace)!==$e,(k!==A||U!==A.version||p!==e.toneMapping)&&(R.material.needsUpdate=!0,k=A,U=A.version,p=e.toneMapping),R.layers.enableAll(),h.unshift(R,R.geometry,R.material,0,0,null)):A&&A.isTexture&&(C===void 0&&(C=new wt(new Ar(2,2),new It({name:"BackgroundMaterial",uniforms:zn(At.background.uniforms),vertexShader:At.background.vertexShader,fragmentShader:At.background.fragmentShader,side:ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),C.geometry.deleteAttribute("normal"),Object.defineProperty(C.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(C)),C.material.uniforms.t2D.value=A,C.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,C.material.toneMapped=nt.getTransfer(A.colorSpace)!==$e,A.matrixAutoUpdate===!0&&A.updateMatrix(),C.material.uniforms.uvTransform.value.copy(A.matrix),(k!==A||U!==A.version||p!==e.toneMapping)&&(C.material.needsUpdate=!0,k=A,U=A.version,p=e.toneMapping),C.layers.enableAll(),h.unshift(C,C.geometry,C.material,0,0,null))}function c(h,M){h.getRGB(mn,Rr(e)),t.buffers.color.setClear(mn.r,mn.g,mn.b,M,a)}function s(){R!==void 0&&(R.geometry.dispose(),R.material.dispose(),R=void 0),C!==void 0&&(C.geometry.dispose(),C.material.dispose(),C=void 0)}return{getClearColor:function(){return u},setClearColor:function(h,M=1){u.set(h),m=M,c(u,m)},getClearAlpha:function(){return m},setClearAlpha:function(h){m=h,c(u,m)},render:D,addToRenderList:G,dispose:s}}function dc(e,n){let t=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},l=p(null),a=l,u=!1;function m(T,B,$,Y,N){let F=!1,O=U(T,Y,$,B);a!==O&&(a=O,R(a.object)),F=E(T,Y,$,N),F&&D(T,Y,$,N),N!==null&&n.update(N,e.ELEMENT_ARRAY_BUFFER),(F||u)&&(u=!1,A(T,B,$,Y),N!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n.get(N).buffer))}function C(){return e.createVertexArray()}function R(T){return e.bindVertexArray(T)}function k(T){return e.deleteVertexArray(T)}function U(T,B,$,Y){let N=Y.wireframe===!0,F=i[B.id];F===void 0&&(F={},i[B.id]=F);let O=T.isInstancedMesh===!0?T.id:0,Q=F[O];Q===void 0&&(Q={},F[O]=Q);let de=Q[$.id];de===void 0&&(de={},Q[$.id]=de);let ve=de[N];return ve===void 0&&(ve=p(C()),de[N]=ve),ve}function p(T){let B=[],$=[],Y=[];for(let N=0;N<t;N++)B[N]=0,$[N]=0,Y[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:$,attributeDivisors:Y,object:T,attributes:{},index:null}}function E(T,B,$,Y){let N=a.attributes,F=B.attributes,O=0,Q=$.getAttributes();for(let de in Q)if(Q[de].location>=0){let Ae=N[de],xe=F[de];if(xe===void 0&&(de==="instanceMatrix"&&T.instanceMatrix&&(xe=T.instanceMatrix),de==="instanceColor"&&T.instanceColor&&(xe=T.instanceColor)),Ae===void 0||Ae.attribute!==xe||xe&&Ae.data!==xe.data)return!0;O++}return a.attributesNum!==O||a.index!==Y}function D(T,B,$,Y){let N={},F=B.attributes,O=0,Q=$.getAttributes();for(let de in Q)if(Q[de].location>=0){let Ae=F[de];Ae===void 0&&(de==="instanceMatrix"&&T.instanceMatrix&&(Ae=T.instanceMatrix),de==="instanceColor"&&T.instanceColor&&(Ae=T.instanceColor));let xe={};xe.attribute=Ae,Ae&&Ae.data&&(xe.data=Ae.data),N[de]=xe,O++}a.attributes=N,a.attributesNum=O,a.index=Y}function G(){let T=a.newAttributes;for(let B=0,$=T.length;B<$;B++)T[B]=0}function c(T){s(T,0)}function s(T,B){let $=a.newAttributes,Y=a.enabledAttributes,N=a.attributeDivisors;$[T]=1,Y[T]===0&&(e.enableVertexAttribArray(T),Y[T]=1),N[T]!==B&&(e.vertexAttribDivisor(T,B),N[T]=B)}function h(){let T=a.newAttributes,B=a.enabledAttributes;for(let $=0,Y=B.length;$<Y;$++)B[$]!==T[$]&&(e.disableVertexAttribArray($),B[$]=0)}function M(T,B,$,Y,N,F,O){O===!0?e.vertexAttribIPointer(T,B,$,N,F):e.vertexAttribPointer(T,B,$,Y,N,F)}function A(T,B,$,Y){G();let N=Y.attributes,F=$.getAttributes(),O=B.defaultAttributeValues;for(let Q in F){let de=F[Q];if(de.location>=0){let ve=N[Q];if(ve===void 0&&(Q==="instanceMatrix"&&T.instanceMatrix&&(ve=T.instanceMatrix),Q==="instanceColor"&&T.instanceColor&&(ve=T.instanceColor)),ve!==void 0){let Ae=ve.normalized,xe=ve.itemSize,Ve=n.get(ve);if(Ve===void 0)continue;let Ye=Ve.buffer,we=Ve.type,K=Ve.bytesPerElement,ce=we===e.INT||we===e.UNSIGNED_INT||ve.gpuType===br;if(ve.isInterleavedBufferAttribute){let te=ve.data,Me=te.stride,be=ve.offset;if(te.isInstancedInterleavedBuffer){for(let Te=0;Te<de.locationSize;Te++)s(de.location+Te,te.meshPerAttribute);T.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Te=0;Te<de.locationSize;Te++)c(de.location+Te);e.bindBuffer(e.ARRAY_BUFFER,Ye);for(let Te=0;Te<de.locationSize;Te++)M(de.location+Te,xe/de.locationSize,we,Ae,Me*K,(be+xe/de.locationSize*Te)*K,ce)}else{if(ve.isInstancedBufferAttribute){for(let te=0;te<de.locationSize;te++)s(de.location+te,ve.meshPerAttribute);T.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ve.meshPerAttribute*ve.count)}else for(let te=0;te<de.locationSize;te++)c(de.location+te);e.bindBuffer(e.ARRAY_BUFFER,Ye);for(let te=0;te<de.locationSize;te++)M(de.location+te,xe/de.locationSize,we,Ae,xe*K,xe/de.locationSize*te*K,ce)}}else if(O!==void 0){let Ae=O[Q];if(Ae!==void 0)switch(Ae.length){case 2:e.vertexAttrib2fv(de.location,Ae);break;case 3:e.vertexAttrib3fv(de.location,Ae);break;case 4:e.vertexAttrib4fv(de.location,Ae);break;default:e.vertexAttrib1fv(de.location,Ae)}}}}h()}function H(){v();for(let T in i){let B=i[T];for(let $ in B){let Y=B[$];for(let N in Y){let F=Y[N];for(let O in F)k(F[O].object),delete F[O];delete Y[N]}}delete i[T]}}function _(T){if(i[T.id]===void 0)return;let B=i[T.id];for(let $ in B){let Y=B[$];for(let N in Y){let F=Y[N];for(let O in F)k(F[O].object),delete F[O];delete Y[N]}}delete i[T.id]}function I(T){for(let B in i){let $=i[B];for(let Y in $){let N=$[Y];if(N[T.id]===void 0)continue;let F=N[T.id];for(let O in F)k(F[O].object),delete F[O];delete N[T.id]}}}function d(T){for(let B in i){let $=i[B],Y=T.isInstancedMesh===!0?T.id:0,N=$[Y];if(N!==void 0){for(let F in N){let O=N[F];for(let Q in O)k(O[Q].object),delete O[Q];delete N[F]}delete $[Y],Object.keys($).length===0&&delete i[B]}}}function v(){y(),u=!0,a!==l&&(a=l,R(a.object))}function y(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:m,reset:v,resetDefaultState:y,dispose:H,releaseStatesOfGeometry:_,releaseStatesOfObject:d,releaseStatesOfProgram:I,initAttributes:G,enableAttribute:c,disableUnusedAttributes:h}}function uc(e,n,t){let i;function l(C){i=C}function a(C,R){e.drawArrays(i,C,R),t.update(R,i,1)}function u(C,R,k){k!==0&&(e.drawArraysInstanced(i,C,R,k),t.update(R,i,k))}function m(C,R,k){if(k===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,C,0,R,0,k);let p=0;for(let E=0;E<k;E++)p+=R[E];t.update(p,i,1)}this.setMode=l,this.render=a,this.renderInstances=u,this.renderMultiDraw=m}function pc(e,n,t,i){let l;function a(){if(l!==void 0)return l;if(n.has("EXT_texture_filter_anisotropic")===!0){let I=n.get("EXT_texture_filter_anisotropic");l=e.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function u(I){return!(I!==Ut&&i.convert(I)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function m(I){let d=I===Gt&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(I!==Rt&&i.convert(I)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Ot&&!d)}function C(I){if(I==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let R=t.precision!==void 0?t.precision:"highp",k=C(R);k!==R&&(He("WebGLRenderer:",R,"not supported, using",k,"instead."),R=k);let U=t.logarithmicDepthBuffer===!0,p=t.reversedDepthBuffer===!0&&n.has("EXT_clip_control");t.reversedDepthBuffer===!0&&p===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let E=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),D=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),G=e.getParameter(e.MAX_TEXTURE_SIZE),c=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),s=e.getParameter(e.MAX_VERTEX_ATTRIBS),h=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),M=e.getParameter(e.MAX_VARYING_VECTORS),A=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),H=e.getParameter(e.MAX_SAMPLES),_=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:C,textureFormatReadable:u,textureTypeReadable:m,precision:R,logarithmicDepthBuffer:U,reversedDepthBuffer:p,maxTextures:E,maxVertexTextures:D,maxTextureSize:G,maxCubemapSize:c,maxAttributes:s,maxVertexUniforms:h,maxVaryings:M,maxFragmentUniforms:A,maxSamples:H,samples:_}}function hc(e){let n=this,t=null,i=0,l=!1,a=!1,u=new sa,m=new Oe,C={value:null,needsUpdate:!1};this.uniform=C,this.numPlanes=0,this.numIntersection=0,this.init=function(U,p){let E=U.length!==0||p||i!==0||l;return l=p,i=U.length,E},this.beginShadows=function(){a=!0,k(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(U,p){t=k(U,p,0)},this.setState=function(U,p,E){let D=U.clippingPlanes,G=U.clipIntersection,c=U.clipShadows,s=e.get(U);if(!l||D===null||D.length===0||a&&!c)a?k(null):R();else{let h=a?0:i,M=h*4,A=s.clippingState||null;C.value=A,A=k(D,p,M,E);for(let H=0;H!==M;++H)A[H]=t[H];s.clippingState=A,this.numIntersection=G?this.numPlanes:0,this.numPlanes+=h}};function R(){C.value!==t&&(C.value=t,C.needsUpdate=i>0),n.numPlanes=i,n.numIntersection=0}function k(U,p,E,D){let G=U!==null?U.length:0,c=null;if(G!==0){if(c=C.value,D!==!0||c===null){let s=E+G*4,h=p.matrixWorldInverse;m.getNormalMatrix(h),(c===null||c.length<s)&&(c=new Float32Array(s));for(let M=0,A=E;M!==G;++M,A+=4)u.copy(U[M]).applyMatrix4(h,m),u.normal.toArray(c,A),c[A+3]=u.constant}C.value=c,C.needsUpdate=!0}return n.numPlanes=G,n.numIntersection=0,c}}var Bt=4,tr=[.125,.215,.35,.446,.526,.582],Vt=20,mc=256,rn=new Cr,nr=new je,Bn=null,Gn=0,Hn=0,Vn=!1,_c=new Fe,Mn=class{constructor(n){this._renderer=n,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(n,t=0,i=.1,l=100,a={}){let{size:u=256,position:m=_c}=a;Bn=this._renderer.getRenderTarget(),Gn=this._renderer.getActiveCubeFace(),Hn=this._renderer.getActiveMipmapLevel(),Vn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(u);let C=this._allocateTargets();return C.depthBuffer=!0,this._sceneToCubeUV(n,i,l,C,m),t>0&&this._blur(C,0,0,t),this._applyPMREM(C),this._cleanup(C),C}fromEquirectangular(n,t=null){return this._fromTexture(n,t)}fromCubemap(n,t=null){return this._fromTexture(n,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ar(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rr(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(n){this._lodMax=Math.floor(Math.log2(n)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let n=0;n<this._lodMeshes.length;n++)this._lodMeshes[n].geometry.dispose()}_cleanup(n){this._renderer.setRenderTarget(Bn,Gn,Hn),this._renderer.xr.enabled=Vn,n.scissorTest=!1,Kt(n,0,0,n.width,n.height)}_fromTexture(n,t){n.mapping===cn||n.mapping===Jt?this._setSize(n.image.length===0?16:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4),Bn=this._renderer.getRenderTarget(),Gn=this._renderer.getActiveCubeFace(),Hn=this._renderer.getActiveMipmapLevel(),Vn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(n,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let n=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:vt,minFilter:vt,generateMipmaps:!1,type:Gt,format:Ut,colorSpace:Pr,depthBuffer:!1},l=ir(n,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==n||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ir(n,t,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=gc(a)),this._blurMaterial=Sc(a,n,t),this._ggxMaterial=vc(a,n,t)}return l}_compileMaterial(n){let t=new wt(new Rn,n);this._renderer.compile(t,rn)}_sceneToCubeUV(n,t,i,l,a){let C=new gn(90,1,t,i),R=[1,-1,1,1,1,1],k=[1,1,1,-1,-1,-1],U=this._renderer,p=U.autoClear,E=U.toneMapping;U.getClearColor(nr),U.toneMapping=bt,U.autoClear=!1,U.state.buffers.depth.getReversed()&&(U.setRenderTarget(l),U.clearDepth(),U.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new wt(new ii,new la({name:"PMREM.Background",side:St,depthWrite:!1,depthTest:!1})));let G=this._backgroundBox,c=G.material,s=!1,h=n.background;h?h.isColor&&(c.color.copy(h),n.background=null,s=!0):(c.color.copy(nr),s=!0);for(let M=0;M<6;M++){let A=M%3;A===0?(C.up.set(0,R[M],0),C.position.set(a.x,a.y,a.z),C.lookAt(a.x+k[M],a.y,a.z)):A===1?(C.up.set(0,0,R[M]),C.position.set(a.x,a.y,a.z),C.lookAt(a.x,a.y+k[M],a.z)):(C.up.set(0,R[M],0),C.position.set(a.x,a.y,a.z),C.lookAt(a.x,a.y,a.z+k[M]));let H=this._cubeSize;Kt(l,A*H,M>2?H:0,H,H),U.setRenderTarget(l),s&&U.render(G,C),U.render(n,C)}U.toneMapping=E,U.autoClear=p,n.background=h}_textureToCubeUV(n,t){let i=this._renderer,l=n.mapping===cn||n.mapping===Jt;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=ar()),this._cubemapMaterial.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rr());let a=l?this._cubemapMaterial:this._equirectMaterial,u=this._lodMeshes[0];u.material=a;let m=a.uniforms;m.envMap.value=n;let C=this._cubeSize;Kt(t,0,0,3*C,2*C),i.setRenderTarget(t),i.render(u,rn)}_applyPMREM(n){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let l=this._lodMeshes.length;for(let a=1;a<l;a++)this._applyGGXFilter(n,a-1,a);t.autoClear=i}_applyGGXFilter(n,t,i){let l=this._renderer,a=this._pingPongRenderTarget,u=this._ggxMaterial,m=this._lodMeshes[i];m.material=u;let C=u.uniforms,R=i/(this._lodMeshes.length-1),k=t/(this._lodMeshes.length-1),U=Math.sqrt(R*R-k*k),p=0+R*1.25,E=U*p,{_lodMax:D}=this,G=this._sizeLods[i],c=3*G*(i>D-Bt?i-D+Bt:0),s=4*(this._cubeSize-G);C.envMap.value=n.texture,C.roughness.value=E,C.mipInt.value=D-t,Kt(a,c,s,3*G,2*G),l.setRenderTarget(a),l.render(m,rn),C.envMap.value=a.texture,C.roughness.value=0,C.mipInt.value=D-i,Kt(n,c,s,3*G,2*G),l.setRenderTarget(n),l.render(m,rn)}_blur(n,t,i,l,a){let u=this._pingPongRenderTarget;this._halfBlur(n,u,t,i,l,"latitudinal",a),this._halfBlur(u,n,i,i,l,"longitudinal",a)}_halfBlur(n,t,i,l,a,u,m){let C=this._renderer,R=this._blurMaterial;u!=="latitudinal"&&u!=="longitudinal"&&Qe("blur direction must be either latitudinal or longitudinal!");let k=3,U=this._lodMeshes[l];U.material=R;let p=R.uniforms,E=this._sizeLods[i]-1,D=isFinite(a)?Math.PI/(2*E):2*Math.PI/(2*Vt-1),G=a/D,c=isFinite(a)?1+Math.floor(k*G):Vt;c>Vt&&He(`sigmaRadians, ${a}, is too large and will clip, as it requested ${c} samples when the maximum is set to ${Vt}`);let s=[],h=0;for(let I=0;I<Vt;++I){let d=I/G,v=Math.exp(-d*d/2);s.push(v),I===0?h+=v:I<c&&(h+=2*v)}for(let I=0;I<s.length;I++)s[I]=s[I]/h;p.envMap.value=n.texture,p.samples.value=c,p.weights.value=s,p.latitudinal.value=u==="latitudinal",m&&(p.poleAxis.value=m);let{_lodMax:M}=this;p.dTheta.value=D,p.mipInt.value=M-i;let A=this._sizeLods[l],H=3*A*(l>M-Bt?l-M+Bt:0),_=4*(this._cubeSize-A);Kt(t,H,_,3*A,2*A),C.setRenderTarget(t),C.render(U,rn)}};function gc(e){let n=[],t=[],i=[],l=e,a=e-Bt+1+tr.length;for(let u=0;u<a;u++){let m=Math.pow(2,l);n.push(m);let C=1/m;u>e-Bt?C=tr[u-e+Bt-1]:u===0&&(C=0),t.push(C);let R=1/(m-2),k=-R,U=1+R,p=[k,k,U,k,U,U,k,k,U,U,k,U],E=6,D=6,G=3,c=2,s=1,h=new Float32Array(G*D*E),M=new Float32Array(c*D*E),A=new Float32Array(s*D*E);for(let _=0;_<E;_++){let I=_%3*2/3-1,d=_>2?0:-1,v=[I,d,0,I+2/3,d,0,I+2/3,d+1,0,I,d,0,I+2/3,d+1,0,I,d+1,0];h.set(v,G*D*_),M.set(p,c*D*_);let y=[_,_,_,_,_,_];A.set(y,s*D*_)}let H=new Rn;H.setAttribute("position",new vn(h,G)),H.setAttribute("uv",new vn(M,c)),H.setAttribute("faceIndex",new vn(A,s)),i.push(new wt(H,null)),l>Bt&&l--}return{lodMeshes:i,sizeLods:n,sigmas:t}}function ir(e,n,t){let i=new Ct(e,n,t);return i.texture.mapping=An,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Kt(e,n,t,i,l){e.viewport.set(n,t,i,l),e.scissor.set(n,t,i,l)}function vc(e,n,t){return new It({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:mc,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:bn(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function Sc(e,n,t){let i=new Float32Array(Vt),l=new Fe(0,1,0);return new It({name:"SphericalGaussianBlur",defines:{n:Vt,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:l}},vertexShader:bn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function rr(){return new It({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:bn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function ar(){return new It({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:bn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function bn(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Tn=class extends Ct{constructor(n=1,t={}){super(n,n,t),this.isWebGLCubeRenderTarget=!0;let i={width:n,height:n,depth:1},l=[i,i,i,i,i,i];this.texture=new Lr(l),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(n,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},l=new ii(5,5,5),a=new It({name:"CubemapFromEquirect",uniforms:zn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:St,blending:Dt});a.uniforms.tEquirect.value=t;let u=new wt(l,a),m=t.minFilter;return t.minFilter===qt&&(t.minFilter=vt),new ca(1,10,this).update(n,u),t.minFilter=m,u.geometry.dispose(),u.material.dispose(),this}clear(n,t=!0,i=!0,l=!0){let a=n.getRenderTarget();for(let u=0;u<6;u++)n.setRenderTarget(this,u),n.clear(t,i,l);n.setRenderTarget(a)}};function Ec(e){let n=new WeakMap,t=new WeakMap,i=null;function l(p,E=!1){return p==null?null:E?u(p):a(p)}function a(p){if(p&&p.isTexture){let E=p.mapping;if(E===Un||E===Dn)if(n.has(p)){let D=n.get(p).texture;return m(D,p.mapping)}else{let D=p.image;if(D&&D.height>0){let G=new Tn(D.height);return G.fromEquirectangularTexture(e,p),n.set(p,G),p.addEventListener("dispose",R),m(G.texture,p.mapping)}else return null}}return p}function u(p){if(p&&p.isTexture){let E=p.mapping,D=E===Un||E===Dn,G=E===cn||E===Jt;if(D||G){let c=t.get(p),s=c!==void 0?c.texture.pmremVersion:0;if(p.isRenderTargetTexture&&p.pmremVersion!==s)return i===null&&(i=new Mn(e)),c=D?i.fromEquirectangular(p,c):i.fromCubemap(p,c),c.texture.pmremVersion=p.pmremVersion,t.set(p,c),c.texture;if(c!==void 0)return c.texture;{let h=p.image;return D&&h&&h.height>0||G&&h&&C(h)?(i===null&&(i=new Mn(e)),c=D?i.fromEquirectangular(p):i.fromCubemap(p),c.texture.pmremVersion=p.pmremVersion,t.set(p,c),p.addEventListener("dispose",k),c.texture):null}}}return p}function m(p,E){return E===Un?p.mapping=cn:E===Dn&&(p.mapping=Jt),p}function C(p){let E=0,D=6;for(let G=0;G<D;G++)p[G]!==void 0&&E++;return E===D}function R(p){let E=p.target;E.removeEventListener("dispose",R);let D=n.get(E);D!==void 0&&(n.delete(E),D.dispose())}function k(p){let E=p.target;E.removeEventListener("dispose",k);let D=t.get(E);D!==void 0&&(t.delete(E),D.dispose())}function U(){n=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:l,dispose:U}}function xc(e){let n={};function t(i){if(n[i]!==void 0)return n[i];let l=e.getExtension(i);return n[i]=l,l}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let l=t(i);return l===null&&fa("WebGLRenderer: "+i+" extension not supported."),l}}}function Mc(e,n,t,i){let l={},a=new WeakMap;function u(U){let p=U.target;p.index!==null&&n.remove(p.index);for(let D in p.attributes)n.remove(p.attributes[D]);p.removeEventListener("dispose",u),delete l[p.id];let E=a.get(p);E&&(n.remove(E),a.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function m(U,p){return l[p.id]===!0||(p.addEventListener("dispose",u),l[p.id]=!0,t.memory.geometries++),p}function C(U){let p=U.attributes;for(let E in p)n.update(p[E],e.ARRAY_BUFFER)}function R(U){let p=[],E=U.index,D=U.attributes.position,G=0;if(D===void 0)return;if(E!==null){let h=E.array;G=E.version;for(let M=0,A=h.length;M<A;M+=3){let H=h[M+0],_=h[M+1],I=h[M+2];p.push(H,_,_,I,I,H)}}else{let h=D.array;G=D.version;for(let M=0,A=h.length/3-1;M<A;M+=3){let H=M+0,_=M+1,I=M+2;p.push(H,_,_,I,I,H)}}let c=new(D.count>=65535?da:ua)(p,1);c.version=G;let s=a.get(U);s&&n.remove(s),a.set(U,c)}function k(U){let p=a.get(U);if(p){let E=U.index;E!==null&&p.version<E.version&&R(U)}else R(U);return a.get(U)}return{get:m,update:C,getWireframeAttribute:k}}function Tc(e,n,t){let i;function l(U){i=U}let a,u;function m(U){a=U.type,u=U.bytesPerElement}function C(U,p){e.drawElements(i,p,a,U*u),t.update(p,i,1)}function R(U,p,E){E!==0&&(e.drawElementsInstanced(i,p,a,U*u,E),t.update(p,i,E))}function k(U,p,E){if(E===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,a,U,0,E);let G=0;for(let c=0;c<E;c++)G+=p[c];t.update(G,i,1)}this.setMode=l,this.setIndex=m,this.render=C,this.renderInstances=R,this.renderMultiDraw=k}function Ac(e){let n={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,u,m){switch(t.calls++,u){case e.TRIANGLES:t.triangles+=m*(a/3);break;case e.LINES:t.lines+=m*(a/2);break;case e.LINE_STRIP:t.lines+=m*(a-1);break;case e.LINE_LOOP:t.lines+=m*a;break;case e.POINTS:t.points+=m*a;break;default:Qe("WebGLInfo: Unknown draw mode:",u);break}}function l(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:n,render:t,programs:null,autoReset:!0,reset:l,update:i}}function Rc(e,n,t){let i=new WeakMap,l=new ht;function a(u,m,C){let R=u.morphTargetInfluences,k=m.morphAttributes.position||m.morphAttributes.normal||m.morphAttributes.color,U=k!==void 0?k.length:0,p=i.get(m);if(p===void 0||p.count!==U){let v=function(){I.dispose(),i.delete(m),m.removeEventListener("dispose",v)};p!==void 0&&p.texture.dispose();let E=m.morphAttributes.position!==void 0,D=m.morphAttributes.normal!==void 0,G=m.morphAttributes.color!==void 0,c=m.morphAttributes.position||[],s=m.morphAttributes.normal||[],h=m.morphAttributes.color||[],M=0;E===!0&&(M=1),D===!0&&(M=2),G===!0&&(M=3);let A=m.attributes.position.count*M,H=1;A>n.maxTextureSize&&(H=Math.ceil(A/n.maxTextureSize),A=n.maxTextureSize);let _=new Float32Array(A*H*4*U),I=new Ur(_,A,H,U);I.type=Ot,I.needsUpdate=!0;let d=M*4;for(let y=0;y<U;y++){let T=c[y],B=s[y],$=h[y],Y=A*H*4*y;for(let N=0;N<T.count;N++){let F=N*d;E===!0&&(l.fromBufferAttribute(T,N),_[Y+F+0]=l.x,_[Y+F+1]=l.y,_[Y+F+2]=l.z,_[Y+F+3]=0),D===!0&&(l.fromBufferAttribute(B,N),_[Y+F+4]=l.x,_[Y+F+5]=l.y,_[Y+F+6]=l.z,_[Y+F+7]=0),G===!0&&(l.fromBufferAttribute($,N),_[Y+F+8]=l.x,_[Y+F+9]=l.y,_[Y+F+10]=l.z,_[Y+F+11]=$.itemSize===4?l.w:1)}}p={count:U,texture:I,size:new mt(A,H)},i.set(m,p),m.addEventListener("dispose",v)}if(u.isInstancedMesh===!0&&u.morphTexture!==null)C.getUniforms().setValue(e,"morphTexture",u.morphTexture,t);else{let E=0;for(let G=0;G<R.length;G++)E+=R[G];let D=m.morphTargetsRelative?1:1-E;C.getUniforms().setValue(e,"morphTargetBaseInfluence",D),C.getUniforms().setValue(e,"morphTargetInfluences",R)}C.getUniforms().setValue(e,"morphTargetsTexture",p.texture,t),C.getUniforms().setValue(e,"morphTargetsTextureSize",p.size)}return{update:a}}function bc(e,n,t,i,l){let a=new WeakMap;function u(R){let k=l.render.frame,U=R.geometry,p=n.get(R,U);if(a.get(p)!==k&&(n.update(p),a.set(p,k)),R.isInstancedMesh&&(R.hasEventListener("dispose",C)===!1&&R.addEventListener("dispose",C),a.get(R)!==k&&(t.update(R.instanceMatrix,e.ARRAY_BUFFER),R.instanceColor!==null&&t.update(R.instanceColor,e.ARRAY_BUFFER),a.set(R,k))),R.isSkinnedMesh){let E=R.skeleton;a.get(E)!==k&&(E.update(),a.set(E,k))}return p}function m(){a=new WeakMap}function C(R){let k=R.target;k.removeEventListener("dispose",C),i.releaseStatesOfObject(k),t.remove(k.instanceMatrix),k.instanceColor!==null&&t.remove(k.instanceColor)}return{update:u,dispose:m}}var Cc={[Or]:"LINEAR_TONE_MAPPING",[Fr]:"REINHARD_TONE_MAPPING",[yr]:"CINEON_TONE_MAPPING",[Nr]:"ACES_FILMIC_TONE_MAPPING",[Ir]:"AGX_TONE_MAPPING",[wr]:"NEUTRAL_TONE_MAPPING",[Dr]:"CUSTOM_TONE_MAPPING"};function Pc(e,n,t,i,l){let a=new Ct(n,t,{type:e,depthBuffer:i,stencilBuffer:l,depthTexture:i?new fn(n,t):void 0}),u=new Ct(n,t,{type:Gt,depthBuffer:!1,stencilBuffer:!1}),m=new Rn;m.setAttribute("position",new hi([-1,3,0,-1,-1,0,3,-1,0],3)),m.setAttribute("uv",new hi([0,2,0,0,2,0],2));let C=new pa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),R=new wt(m,C),k=new Cr(-1,1,1,-1,0,1),U=null,p=null,E=!1,D,G=null,c=[],s=!1;this.setSize=function(h,M){a.setSize(h,M),u.setSize(h,M);for(let A=0;A<c.length;A++){let H=c[A];H.setSize&&H.setSize(h,M)}},this.setEffects=function(h){c=h,s=c.length>0&&c[0].isRenderPass===!0;let M=a.width,A=a.height;for(let H=0;H<c.length;H++){let _=c[H];_.setSize&&_.setSize(M,A)}},this.begin=function(h,M){if(E||h.toneMapping===bt&&c.length===0)return!1;if(G=M,M!==null){let A=M.width,H=M.height;(a.width!==A||a.height!==H)&&this.setSize(A,H)}return s===!1&&h.setRenderTarget(a),D=h.toneMapping,h.toneMapping=bt,!0},this.hasRenderPass=function(){return s},this.end=function(h,M){h.toneMapping=D,E=!0;let A=a,H=u;for(let _=0;_<c.length;_++){let I=c[_];if(I.enabled!==!1&&(I.render(h,H,A,M),I.needsSwap!==!1)){let d=A;A=H,H=d}}if(U!==h.outputColorSpace||p!==h.toneMapping){U=h.outputColorSpace,p=h.toneMapping,C.defines={},nt.getTransfer(U)===$e&&(C.defines.SRGB_TRANSFER="");let _=Cc[p];_&&(C.defines[_]=""),C.needsUpdate=!0}C.uniforms.tDiffuse.value=A.texture,h.setRenderTarget(G),h.render(R,k),G=null,E=!1},this.isCompositing=function(){return E},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),u.dispose(),m.dispose(),C.dispose()}}var qr=new ma,qn=new fn(1,1),Zr=new Ur,$r=new ha,Qr=new Lr,or=[],sr=[],lr=new Float32Array(16),cr=new Float32Array(9),fr=new Float32Array(4);function tn(e,n,t){let i=e[0];if(i<=0||i>0)return e;let l=n*t,a=or[l];if(a===void 0&&(a=new Float32Array(l),or[l]=a),n!==0){i.toArray(a,0);for(let u=1,m=0;u!==n;++u)m+=t,e[u].toArray(a,m)}return a}function ft(e,n){if(e.length!==n.length)return!1;for(let t=0,i=e.length;t<i;t++)if(e[t]!==n[t])return!1;return!0}function dt(e,n){for(let t=0,i=n.length;t<i;t++)e[t]=n[t]}function Cn(e,n){let t=sr[n];t===void 0&&(t=new Int32Array(n),sr[n]=t);for(let i=0;i!==n;++i)t[i]=e.allocateTextureUnit();return t}function Lc(e,n){let t=this.cache;t[0]!==n&&(e.uniform1f(this.addr,n),t[0]=n)}function Uc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2f(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ft(t,n))return;e.uniform2fv(this.addr,n),dt(t,n)}}function Dc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3f(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else if(n.r!==void 0)(t[0]!==n.r||t[1]!==n.g||t[2]!==n.b)&&(e.uniform3f(this.addr,n.r,n.g,n.b),t[0]=n.r,t[1]=n.g,t[2]=n.b);else{if(ft(t,n))return;e.uniform3fv(this.addr,n),dt(t,n)}}function wc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4f(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ft(t,n))return;e.uniform4fv(this.addr,n),dt(t,n)}}function Ic(e,n){let t=this.cache,i=n.elements;if(i===void 0){if(ft(t,n))return;e.uniformMatrix2fv(this.addr,!1,n),dt(t,n)}else{if(ft(t,i))return;fr.set(i),e.uniformMatrix2fv(this.addr,!1,fr),dt(t,i)}}function Nc(e,n){let t=this.cache,i=n.elements;if(i===void 0){if(ft(t,n))return;e.uniformMatrix3fv(this.addr,!1,n),dt(t,n)}else{if(ft(t,i))return;cr.set(i),e.uniformMatrix3fv(this.addr,!1,cr),dt(t,i)}}function yc(e,n){let t=this.cache,i=n.elements;if(i===void 0){if(ft(t,n))return;e.uniformMatrix4fv(this.addr,!1,n),dt(t,n)}else{if(ft(t,i))return;lr.set(i),e.uniformMatrix4fv(this.addr,!1,lr),dt(t,i)}}function Fc(e,n){let t=this.cache;t[0]!==n&&(e.uniform1i(this.addr,n),t[0]=n)}function Oc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2i(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ft(t,n))return;e.uniform2iv(this.addr,n),dt(t,n)}}function Bc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3i(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(ft(t,n))return;e.uniform3iv(this.addr,n),dt(t,n)}}function Gc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4i(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ft(t,n))return;e.uniform4iv(this.addr,n),dt(t,n)}}function Hc(e,n){let t=this.cache;t[0]!==n&&(e.uniform1ui(this.addr,n),t[0]=n)}function Vc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2ui(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ft(t,n))return;e.uniform2uiv(this.addr,n),dt(t,n)}}function kc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3ui(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(ft(t,n))return;e.uniform3uiv(this.addr,n),dt(t,n)}}function Wc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4ui(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ft(t,n))return;e.uniform4uiv(this.addr,n),dt(t,n)}}function zc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l);let a;this.type===e.SAMPLER_2D_SHADOW?(qn.compareFunction=t.isReversedDepthBuffer()?ri:ai,a=qn):a=qr,t.setTexture2D(n||a,l)}function Xc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l),t.setTexture3D(n||$r,l)}function Kc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l),t.setTextureCube(n||Qr,l)}function Yc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l),t.setTexture2DArray(n||Zr,l)}function qc(e){switch(e){case 5126:return Lc;case 35664:return Uc;case 35665:return Dc;case 35666:return wc;case 35674:return Ic;case 35675:return Nc;case 35676:return yc;case 5124:case 35670:return Fc;case 35667:case 35671:return Oc;case 35668:case 35672:return Bc;case 35669:case 35673:return Gc;case 5125:return Hc;case 36294:return Vc;case 36295:return kc;case 36296:return Wc;case 35678:case 36198:case 36298:case 36306:case 35682:return zc;case 35679:case 36299:case 36307:return Xc;case 35680:case 36300:case 36308:case 36293:return Kc;case 36289:case 36303:case 36311:case 36292:return Yc}}function Zc(e,n){e.uniform1fv(this.addr,n)}function $c(e,n){let t=tn(n,this.size,2);e.uniform2fv(this.addr,t)}function Qc(e,n){let t=tn(n,this.size,3);e.uniform3fv(this.addr,t)}function Jc(e,n){let t=tn(n,this.size,4);e.uniform4fv(this.addr,t)}function jc(e,n){let t=tn(n,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function ef(e,n){let t=tn(n,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function tf(e,n){let t=tn(n,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function nf(e,n){e.uniform1iv(this.addr,n)}function rf(e,n){e.uniform2iv(this.addr,n)}function af(e,n){e.uniform3iv(this.addr,n)}function of(e,n){e.uniform4iv(this.addr,n)}function sf(e,n){e.uniform1uiv(this.addr,n)}function lf(e,n){e.uniform2uiv(this.addr,n)}function cf(e,n){e.uniform3uiv(this.addr,n)}function ff(e,n){e.uniform4uiv(this.addr,n)}function df(e,n,t){let i=this.cache,l=n.length,a=Cn(t,l);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));let u;this.type===e.SAMPLER_2D_SHADOW?u=qn:u=qr;for(let m=0;m!==l;++m)t.setTexture2D(n[m]||u,a[m])}function uf(e,n,t){let i=this.cache,l=n.length,a=Cn(t,l);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let u=0;u!==l;++u)t.setTexture3D(n[u]||$r,a[u])}function pf(e,n,t){let i=this.cache,l=n.length,a=Cn(t,l);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let u=0;u!==l;++u)t.setTextureCube(n[u]||Qr,a[u])}function hf(e,n,t){let i=this.cache,l=n.length,a=Cn(t,l);ft(i,a)||(e.uniform1iv(this.addr,a),dt(i,a));for(let u=0;u!==l;++u)t.setTexture2DArray(n[u]||Zr,a[u])}function mf(e){switch(e){case 5126:return Zc;case 35664:return $c;case 35665:return Qc;case 35666:return Jc;case 35674:return jc;case 35675:return ef;case 35676:return tf;case 5124:case 35670:return nf;case 35667:case 35671:return rf;case 35668:case 35672:return af;case 35669:case 35673:return of;case 5125:return sf;case 36294:return lf;case 36295:return cf;case 36296:return ff;case 35678:case 36198:case 36298:case 36306:case 35682:return df;case 35679:case 36299:case 36307:return uf;case 35680:case 36300:case 36308:case 36293:return pf;case 36289:case 36303:case 36311:case 36292:return hf}}var Zn=class{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.setValue=qc(t.type)}},$n=class{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=mf(t.type)}},Qn=class{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,t,i){let l=this.seq;for(let a=0,u=l.length;a!==u;++a){let m=l[a];m.setValue(n,t[m.id],i)}}},kn=/(\w+)(\])?(\[|\.)?/g;function dr(e,n){e.seq.push(n),e.map[n.id]=n}function _f(e,n,t){let i=e.name,l=i.length;for(kn.lastIndex=0;;){let a=kn.exec(i),u=kn.lastIndex,m=a[1],C=a[2]==="]",R=a[3];if(C&&(m=m|0),R===void 0||R==="["&&u+2===l){dr(t,R===void 0?new Zn(m,e,n):new $n(m,e,n));break}else{let U=t.map[m];U===void 0&&(U=new Qn(m),dr(t,U)),t=U}}}var $t=class{constructor(n,t){this.seq=[],this.map={};let i=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let u=0;u<i;++u){let m=n.getActiveUniform(t,u),C=n.getUniformLocation(t,m.name);_f(m,C,this)}let l=[],a=[];for(let u of this.seq)u.type===n.SAMPLER_2D_SHADOW||u.type===n.SAMPLER_CUBE_SHADOW||u.type===n.SAMPLER_2D_ARRAY_SHADOW?l.push(u):a.push(u);l.length>0&&(this.seq=l.concat(a))}setValue(n,t,i,l){let a=this.map[t];a!==void 0&&a.setValue(n,i,l)}setOptional(n,t,i){let l=t[i];l!==void 0&&this.setValue(n,i,l)}static upload(n,t,i,l){for(let a=0,u=t.length;a!==u;++a){let m=t[a],C=i[m.id];C.needsUpdate!==!1&&m.setValue(n,C.value,l)}}static seqWithValue(n,t){let i=[];for(let l=0,a=n.length;l!==a;++l){let u=n[l];u.id in t&&i.push(u)}return i}};function ur(e,n,t){let i=e.createShader(n);return e.shaderSource(i,t),e.compileShader(i),i}var gf=37297,vf=0;function Sf(e,n){let t=e.split(`
`),i=[],l=Math.max(n-6,0),a=Math.min(n+6,t.length);for(let u=l;u<a;u++){let m=u+1;i.push(`${m===n?">":" "} ${m}: ${t[u]}`)}return i.join(`
`)}var pr=new Oe;function Ef(e){nt._getMatrix(pr,nt.workingColorSpace,e);let n=`mat3( ${pr.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(e)){case Br:return[n,"LinearTransferOETF"];case $e:return[n,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",e),[n,"LinearTransferOETF"]}}function hr(e,n,t){let i=e.getShaderParameter(n,e.COMPILE_STATUS),a=(e.getShaderInfoLog(n)||"").trim();if(i&&a==="")return"";let u=/ERROR: 0:(\d+)/.exec(a);if(u){let m=parseInt(u[1]);return t.toUpperCase()+`

`+a+`

`+Sf(e.getShaderSource(n),m)}else return a}function xf(e,n){let t=Ef(n);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Mf={[Or]:"Linear",[Fr]:"Reinhard",[yr]:"Cineon",[Nr]:"ACESFilmic",[Ir]:"AgX",[wr]:"Neutral",[Dr]:"Custom"};function Tf(e,n){let t=Mf[n];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",n),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var _n=new Fe;function Af(){nt.getLuminanceCoefficients(_n);let e=_n.x.toFixed(4),n=_n.y.toFixed(4),t=_n.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${n}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Rf(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(sn).join(`
`)}function bf(e){let n=[];for(let t in e){let i=e[t];i!==!1&&n.push("#define "+t+" "+i)}return n.join(`
`)}function Cf(e,n){let t={},i=e.getProgramParameter(n,e.ACTIVE_ATTRIBUTES);for(let l=0;l<i;l++){let a=e.getActiveAttrib(n,l),u=a.name,m=1;a.type===e.FLOAT_MAT2&&(m=2),a.type===e.FLOAT_MAT3&&(m=3),a.type===e.FLOAT_MAT4&&(m=4),t[u]={type:a.type,location:e.getAttribLocation(n,u),locationSize:m}}return t}function sn(e){return e!==""}function mr(e,n){let t=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows)}function _r(e,n){return e.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}var Pf=/^[ \t]*#include +<([\w\d./]+)>/gm;function Jn(e){return e.replace(Pf,Uf)}var Lf=new Map;function Uf(e,n){let t=Ue[n];if(t===void 0){let i=Lf.get(n);if(i!==void 0)t=Ue[i],He('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',n,i);else throw new Error("Can not resolve #include <"+n+">")}return Jn(t)}var Df=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gr(e){return e.replace(Df,wf)}function wf(e,n,t,i){let l="";for(let a=parseInt(n);a<parseInt(t);a++)l+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return l}function vr(e){let n=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?n+=`
#define HIGH_PRECISION`:e.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}var If={[Sn]:"SHADOWMAP_TYPE_PCF",[on]:"SHADOWMAP_TYPE_VSM"};function Nf(e){return If[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var yf={[cn]:"ENVMAP_TYPE_CUBE",[Jt]:"ENVMAP_TYPE_CUBE",[An]:"ENVMAP_TYPE_CUBE_UV"};function Ff(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":yf[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var Of={[Jt]:"ENVMAP_MODE_REFRACTION"};function Bf(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Of[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Gf={[va]:"ENVMAP_BLENDING_MULTIPLY",[ga]:"ENVMAP_BLENDING_MIX",[_a]:"ENVMAP_BLENDING_ADD"};function Hf(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Gf[e.combine]||"ENVMAP_BLENDING_NONE"}function Vf(e){let n=e.envMapCubeUVHeight;if(n===null)return null;let t=Math.log2(n)-2,i=1/n;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function kf(e,n,t,i){let l=e.getContext(),a=t.defines,u=t.vertexShader,m=t.fragmentShader,C=Nf(t),R=Ff(t),k=Bf(t),U=Hf(t),p=Vf(t),E=Rf(t),D=bf(a),G=l.createProgram(),c,s,h=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(c=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D].filter(sn).join(`
`),c.length>0&&(c+=`
`),s=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D].filter(sn).join(`
`),s.length>0&&(s+=`
`)):(c=[vr(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+k:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+C:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(sn).join(`
`),s=[vr(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,D,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+R:"",t.envMap?"#define "+k:"",t.envMap?"#define "+U:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+C:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==bt?"#define TONE_MAPPING":"",t.toneMapping!==bt?Ue.tonemapping_pars_fragment:"",t.toneMapping!==bt?Tf("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ue.colorspace_pars_fragment,xf("linearToOutputTexel",t.outputColorSpace),Af(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(sn).join(`
`)),u=Jn(u),u=mr(u,t),u=_r(u,t),m=Jn(m),m=mr(m,t),m=_r(m,t),u=gr(u),m=gr(m),t.isRawShaderMaterial!==!0&&(h=`#version 300 es
`,c=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+c,s=["#define varying in",t.glslVersion===mi?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===mi?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+s);let M=h+c+u,A=h+s+m,H=ur(l,l.VERTEX_SHADER,M),_=ur(l,l.FRAGMENT_SHADER,A);l.attachShader(G,H),l.attachShader(G,_),t.index0AttributeName!==void 0?l.bindAttribLocation(G,0,t.index0AttributeName):t.morphTargets===!0&&l.bindAttribLocation(G,0,"position"),l.linkProgram(G);function I(T){if(e.debug.checkShaderErrors){let B=l.getProgramInfoLog(G)||"",$=l.getShaderInfoLog(H)||"",Y=l.getShaderInfoLog(_)||"",N=B.trim(),F=$.trim(),O=Y.trim(),Q=!0,de=!0;if(l.getProgramParameter(G,l.LINK_STATUS)===!1)if(Q=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(l,G,H,_);else{let ve=hr(l,H,"vertex"),Ae=hr(l,_,"fragment");Qe("THREE.WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(G,l.VALIDATE_STATUS)+`

Material Name: `+T.name+`
Material Type: `+T.type+`

Program Info Log: `+N+`
`+ve+`
`+Ae)}else N!==""?He("WebGLProgram: Program Info Log:",N):(F===""||O==="")&&(de=!1);de&&(T.diagnostics={runnable:Q,programLog:N,vertexShader:{log:F,prefix:c},fragmentShader:{log:O,prefix:s}})}l.deleteShader(H),l.deleteShader(_),d=new $t(l,G),v=Cf(l,G)}let d;this.getUniforms=function(){return d===void 0&&I(this),d};let v;this.getAttributes=function(){return v===void 0&&I(this),v};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=l.getProgramParameter(G,gf)),y},this.destroy=function(){i.releaseStatesOfProgram(this),l.deleteProgram(G),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=vf++,this.cacheKey=n,this.usedTimes=1,this.program=G,this.vertexShader=H,this.fragmentShader=_,this}var Wf=0,jn=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n){let t=n.vertexShader,i=n.fragmentShader,l=this._getShaderStage(t),a=this._getShaderStage(i),u=this._getShaderCacheForMaterial(n);return u.has(l)===!1&&(u.add(l),l.usedTimes++),u.has(a)===!1&&(u.add(a),a.usedTimes++),this}remove(n){let t=this.materialCache.get(n);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(n),this}getVertexShaderID(n){return this._getShaderStage(n.vertexShader).id}getFragmentShaderID(n){return this._getShaderStage(n.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){let t=this.materialCache,i=t.get(n);return i===void 0&&(i=new Set,t.set(n,i)),i}_getShaderStage(n){let t=this.shaderCache,i=t.get(n);return i===void 0&&(i=new ei(n),t.set(n,i)),i}},ei=class{constructor(n){this.id=Wf++,this.code=n,this.usedTimes=0}};function zf(e){return e===jt||e===Xn||e===Kn}function Xf(e,n,t,i,l,a){let u=new xa,m=new jn,C=new Set,R=[],k=new Map,U=i.logarithmicDepthBuffer,p=i.precision,E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function D(d){return C.add(d),d===0?"uv":`uv${d}`}function G(d,v,y,T,B,$){let Y=T.fog,N=B.geometry,F=d.isMeshStandardMaterial||d.isMeshLambertMaterial||d.isMeshPhongMaterial?T.environment:null,O=d.isMeshStandardMaterial||d.isMeshLambertMaterial&&!d.envMap||d.isMeshPhongMaterial&&!d.envMap,Q=n.get(d.envMap||F,O),de=Q&&Q.mapping===An?Q.image.height:null,ve=E[d.type];d.precision!==null&&(p=i.getMaxPrecision(d.precision),p!==d.precision&&He("WebGLProgram.getParameters:",d.precision,"not supported, using",p,"instead."));let Ae=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,xe=Ae!==void 0?Ae.length:0,Ve=0;N.morphAttributes.position!==void 0&&(Ve=1),N.morphAttributes.normal!==void 0&&(Ve=2),N.morphAttributes.color!==void 0&&(Ve=3);let Ye,we,K,ce;if(ve){let Ce=At[ve];Ye=Ce.vertexShader,we=Ce.fragmentShader}else Ye=d.vertexShader,we=d.fragmentShader,m.update(d),K=m.getVertexShaderID(d),ce=m.getFragmentShaderID(d);let te=e.getRenderTarget(),Me=e.state.buffers.depth.getReversed(),be=B.isInstancedMesh===!0,Te=B.isBatchedMesh===!0,et=!!d.map,Ne=!!d.matcap,ke=!!Q,Je=!!d.aoMap,Ie=!!d.lightMap,lt=!!d.bumpMap,tt=!!d.normalMap,_t=!!d.displacementMap,S=!!d.emissiveMap,ct=!!d.metalnessMap,ye=!!d.roughnessMap,qe=d.anisotropy>0,ae=d.clearcoat>0,it=d.dispersion>0,f=d.iridescence>0,r=d.sheen>0,b=d.transmission>0,z=qe&&!!d.anisotropyMap,Z=ae&&!!d.clearcoatMap,J=ae&&!!d.clearcoatNormalMap,re=ae&&!!d.clearcoatRoughnessMap,V=f&&!!d.iridescenceMap,X=f&&!!d.iridescenceThicknessMap,fe=r&&!!d.sheenColorMap,he=r&&!!d.sheenRoughnessMap,ne=!!d.specularMap,j=!!d.specularColorMap,Re=!!d.specularIntensityMap,Le=b&&!!d.transmissionMap,Ge=b&&!!d.thicknessMap,g=!!d.gradientMap,ee=!!d.alphaMap,W=d.alphaTest>0,ue=!!d.alphaHash,ie=!!d.extensions,q=bt;d.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(q=e.toneMapping);let ge={shaderID:ve,shaderType:d.type,shaderName:d.name,vertexShader:Ye,fragmentShader:we,defines:d.defines,customVertexShaderID:K,customFragmentShaderID:ce,isRawShaderMaterial:d.isRawShaderMaterial===!0,glslVersion:d.glslVersion,precision:p,batching:Te,batchingColor:Te&&B._colorsTexture!==null,instancing:be,instancingColor:be&&B.instanceColor!==null,instancingMorph:be&&B.morphTexture!==null,outputColorSpace:te===null?e.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:nt.workingColorSpace,alphaToCoverage:!!d.alphaToCoverage,map:et,matcap:Ne,envMap:ke,envMapMode:ke&&Q.mapping,envMapCubeUVHeight:de,aoMap:Je,lightMap:Ie,bumpMap:lt,normalMap:tt,displacementMap:_t,emissiveMap:S,normalMapObjectSpace:tt&&d.normalMapType===Ea,normalMapTangentSpace:tt&&d.normalMapType===_i,packedNormalMap:tt&&d.normalMapType===_i&&zf(d.normalMap.format),metalnessMap:ct,roughnessMap:ye,anisotropy:qe,anisotropyMap:z,clearcoat:ae,clearcoatMap:Z,clearcoatNormalMap:J,clearcoatRoughnessMap:re,dispersion:it,iridescence:f,iridescenceMap:V,iridescenceThicknessMap:X,sheen:r,sheenColorMap:fe,sheenRoughnessMap:he,specularMap:ne,specularColorMap:j,specularIntensityMap:Re,transmission:b,transmissionMap:Le,thicknessMap:Ge,gradientMap:g,opaque:d.transparent===!1&&d.blending===En&&d.alphaToCoverage===!1,alphaMap:ee,alphaTest:W,alphaHash:ue,combine:d.combine,mapUv:et&&D(d.map.channel),aoMapUv:Je&&D(d.aoMap.channel),lightMapUv:Ie&&D(d.lightMap.channel),bumpMapUv:lt&&D(d.bumpMap.channel),normalMapUv:tt&&D(d.normalMap.channel),displacementMapUv:_t&&D(d.displacementMap.channel),emissiveMapUv:S&&D(d.emissiveMap.channel),metalnessMapUv:ct&&D(d.metalnessMap.channel),roughnessMapUv:ye&&D(d.roughnessMap.channel),anisotropyMapUv:z&&D(d.anisotropyMap.channel),clearcoatMapUv:Z&&D(d.clearcoatMap.channel),clearcoatNormalMapUv:J&&D(d.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:re&&D(d.clearcoatRoughnessMap.channel),iridescenceMapUv:V&&D(d.iridescenceMap.channel),iridescenceThicknessMapUv:X&&D(d.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&D(d.sheenColorMap.channel),sheenRoughnessMapUv:he&&D(d.sheenRoughnessMap.channel),specularMapUv:ne&&D(d.specularMap.channel),specularColorMapUv:j&&D(d.specularColorMap.channel),specularIntensityMapUv:Re&&D(d.specularIntensityMap.channel),transmissionMapUv:Le&&D(d.transmissionMap.channel),thicknessMapUv:Ge&&D(d.thicknessMap.channel),alphaMapUv:ee&&D(d.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(tt||qe),vertexNormals:!!N.attributes.normal,vertexColors:d.vertexColors,vertexAlphas:d.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!N.attributes.uv&&(et||ee),fog:!!Y,useFog:d.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:d.wireframe===!1&&(d.flatShading===!0||N.attributes.normal===void 0&&tt===!1&&(d.isMeshLambertMaterial||d.isMeshPhongMaterial||d.isMeshStandardMaterial||d.isMeshPhysicalMaterial)),sizeAttenuation:d.sizeAttenuation===!0,logarithmicDepthBuffer:U,reversedDepthBuffer:Me,skinning:B.isSkinnedMesh===!0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:xe,morphTextureStride:Ve,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numLightProbeGrids:$.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:d.dithering,shadowMapEnabled:e.shadowMap.enabled&&y.length>0,shadowMapType:e.shadowMap.type,toneMapping:q,decodeVideoTexture:et&&d.map.isVideoTexture===!0&&nt.getTransfer(d.map.colorSpace)===$e,decodeVideoTextureEmissive:S&&d.emissiveMap.isVideoTexture===!0&&nt.getTransfer(d.emissiveMap.colorSpace)===$e,premultipliedAlpha:d.premultipliedAlpha,doubleSided:d.side===Lt,flipSided:d.side===St,useDepthPacking:d.depthPacking>=0,depthPacking:d.depthPacking||0,index0AttributeName:d.index0AttributeName,extensionClipCullDistance:ie&&d.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&d.extensions.multiDraw===!0||Te)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:d.customProgramCacheKey()};return ge.vertexUv1s=C.has(1),ge.vertexUv2s=C.has(2),ge.vertexUv3s=C.has(3),C.clear(),ge}function c(d){let v=[];if(d.shaderID?v.push(d.shaderID):(v.push(d.customVertexShaderID),v.push(d.customFragmentShaderID)),d.defines!==void 0)for(let y in d.defines)v.push(y),v.push(d.defines[y]);return d.isRawShaderMaterial===!1&&(s(v,d),h(v,d),v.push(e.outputColorSpace)),v.push(d.customProgramCacheKey),v.join()}function s(d,v){d.push(v.precision),d.push(v.outputColorSpace),d.push(v.envMapMode),d.push(v.envMapCubeUVHeight),d.push(v.mapUv),d.push(v.alphaMapUv),d.push(v.lightMapUv),d.push(v.aoMapUv),d.push(v.bumpMapUv),d.push(v.normalMapUv),d.push(v.displacementMapUv),d.push(v.emissiveMapUv),d.push(v.metalnessMapUv),d.push(v.roughnessMapUv),d.push(v.anisotropyMapUv),d.push(v.clearcoatMapUv),d.push(v.clearcoatNormalMapUv),d.push(v.clearcoatRoughnessMapUv),d.push(v.iridescenceMapUv),d.push(v.iridescenceThicknessMapUv),d.push(v.sheenColorMapUv),d.push(v.sheenRoughnessMapUv),d.push(v.specularMapUv),d.push(v.specularColorMapUv),d.push(v.specularIntensityMapUv),d.push(v.transmissionMapUv),d.push(v.thicknessMapUv),d.push(v.combine),d.push(v.fogExp2),d.push(v.sizeAttenuation),d.push(v.morphTargetsCount),d.push(v.morphAttributeCount),d.push(v.numDirLights),d.push(v.numPointLights),d.push(v.numSpotLights),d.push(v.numSpotLightMaps),d.push(v.numHemiLights),d.push(v.numRectAreaLights),d.push(v.numDirLightShadows),d.push(v.numPointLightShadows),d.push(v.numSpotLightShadows),d.push(v.numSpotLightShadowsWithMaps),d.push(v.numLightProbes),d.push(v.shadowMapType),d.push(v.toneMapping),d.push(v.numClippingPlanes),d.push(v.numClipIntersection),d.push(v.depthPacking)}function h(d,v){u.disableAll(),v.instancing&&u.enable(0),v.instancingColor&&u.enable(1),v.instancingMorph&&u.enable(2),v.matcap&&u.enable(3),v.envMap&&u.enable(4),v.normalMapObjectSpace&&u.enable(5),v.normalMapTangentSpace&&u.enable(6),v.clearcoat&&u.enable(7),v.iridescence&&u.enable(8),v.alphaTest&&u.enable(9),v.vertexColors&&u.enable(10),v.vertexAlphas&&u.enable(11),v.vertexUv1s&&u.enable(12),v.vertexUv2s&&u.enable(13),v.vertexUv3s&&u.enable(14),v.vertexTangents&&u.enable(15),v.anisotropy&&u.enable(16),v.alphaHash&&u.enable(17),v.batching&&u.enable(18),v.dispersion&&u.enable(19),v.batchingColor&&u.enable(20),v.gradientMap&&u.enable(21),v.packedNormalMap&&u.enable(22),v.vertexNormals&&u.enable(23),d.push(u.mask),u.disableAll(),v.fog&&u.enable(0),v.useFog&&u.enable(1),v.flatShading&&u.enable(2),v.logarithmicDepthBuffer&&u.enable(3),v.reversedDepthBuffer&&u.enable(4),v.skinning&&u.enable(5),v.morphTargets&&u.enable(6),v.morphNormals&&u.enable(7),v.morphColors&&u.enable(8),v.premultipliedAlpha&&u.enable(9),v.shadowMapEnabled&&u.enable(10),v.doubleSided&&u.enable(11),v.flipSided&&u.enable(12),v.useDepthPacking&&u.enable(13),v.dithering&&u.enable(14),v.transmission&&u.enable(15),v.sheen&&u.enable(16),v.opaque&&u.enable(17),v.pointsUvs&&u.enable(18),v.decodeVideoTexture&&u.enable(19),v.decodeVideoTextureEmissive&&u.enable(20),v.alphaToCoverage&&u.enable(21),v.numLightProbeGrids>0&&u.enable(22),d.push(u.mask)}function M(d){let v=E[d.type],y;if(v){let T=At[v];y=Sa.clone(T.uniforms)}else y=d.uniforms;return y}function A(d,v){let y=k.get(v);return y!==void 0?++y.usedTimes:(y=new kf(e,v,d,l),R.push(y),k.set(v,y)),y}function H(d){if(--d.usedTimes===0){let v=R.indexOf(d);R[v]=R[R.length-1],R.pop(),k.delete(d.cacheKey),d.destroy()}}function _(d){m.remove(d)}function I(){m.dispose()}return{getParameters:G,getProgramCacheKey:c,getUniforms:M,acquireProgram:A,releaseProgram:H,releaseShaderCache:_,programs:R,dispose:I}}function Kf(){let e=new WeakMap;function n(u){return e.has(u)}function t(u){let m=e.get(u);return m===void 0&&(m={},e.set(u,m)),m}function i(u){e.delete(u)}function l(u,m,C){e.get(u)[m]=C}function a(){e=new WeakMap}return{has:n,get:t,remove:i,update:l,dispose:a}}function Yf(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.material.id!==n.material.id?e.material.id-n.material.id:e.materialVariant!==n.materialVariant?e.materialVariant-n.materialVariant:e.z!==n.z?e.z-n.z:e.id-n.id}function Sr(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.z!==n.z?n.z-e.z:e.id-n.id}function Er(){let e=[],n=0,t=[],i=[],l=[];function a(){n=0,t.length=0,i.length=0,l.length=0}function u(p){let E=0;return p.isInstancedMesh&&(E+=2),p.isSkinnedMesh&&(E+=1),E}function m(p,E,D,G,c,s){let h=e[n];return h===void 0?(h={id:p.id,object:p,geometry:E,material:D,materialVariant:u(p),groupOrder:G,renderOrder:p.renderOrder,z:c,group:s},e[n]=h):(h.id=p.id,h.object=p,h.geometry=E,h.material=D,h.materialVariant=u(p),h.groupOrder=G,h.renderOrder=p.renderOrder,h.z=c,h.group=s),n++,h}function C(p,E,D,G,c,s){let h=m(p,E,D,G,c,s);D.transmission>0?i.push(h):D.transparent===!0?l.push(h):t.push(h)}function R(p,E,D,G,c,s){let h=m(p,E,D,G,c,s);D.transmission>0?i.unshift(h):D.transparent===!0?l.unshift(h):t.unshift(h)}function k(p,E){t.length>1&&t.sort(p||Yf),i.length>1&&i.sort(E||Sr),l.length>1&&l.sort(E||Sr)}function U(){for(let p=n,E=e.length;p<E;p++){let D=e[p];if(D.id===null)break;D.id=null,D.object=null,D.geometry=null,D.material=null,D.group=null}}return{opaque:t,transmissive:i,transparent:l,init:a,push:C,unshift:R,finish:U,sort:k}}function qf(){let e=new WeakMap;function n(i,l){let a=e.get(i),u;return a===void 0?(u=new Er,e.set(i,[u])):l>=a.length?(u=new Er,a.push(u)):u=a[l],u}function t(){e=new WeakMap}return{get:n,dispose:t}}function Zf(){let e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={direction:new Fe,color:new je};break;case"SpotLight":t={position:new Fe,direction:new Fe,color:new je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Fe,color:new je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Fe,skyColor:new je,groundColor:new je};break;case"RectAreaLight":t={color:new je,position:new Fe,halfWidth:new Fe,halfHeight:new Fe};break}return e[n.id]=t,t}}}function $f(){let e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new mt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new mt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new mt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[n.id]=t,t}}}var Qf=0;function Jf(e,n){return(n.castShadow?2:0)-(e.castShadow?2:0)+(n.map?1:0)-(e.map?1:0)}function jf(e){let n=new Zf,t=$f(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let R=0;R<9;R++)i.probe.push(new Fe);let l=new Fe,a=new Qt,u=new Qt;function m(R){let k=0,U=0,p=0;for(let v=0;v<9;v++)i.probe[v].set(0,0,0);let E=0,D=0,G=0,c=0,s=0,h=0,M=0,A=0,H=0,_=0,I=0;R.sort(Jf);for(let v=0,y=R.length;v<y;v++){let T=R[v],B=T.color,$=T.intensity,Y=T.distance,N=null;if(T.shadow&&T.shadow.map&&(T.shadow.map.texture.format===jt?N=T.shadow.map.texture:N=T.shadow.map.depthTexture||T.shadow.map.texture),T.isAmbientLight)k+=B.r*$,U+=B.g*$,p+=B.b*$;else if(T.isLightProbe){for(let F=0;F<9;F++)i.probe[F].addScaledVector(T.sh.coefficients[F],$);I++}else if(T.isDirectionalLight){let F=n.get(T);if(F.color.copy(T.color).multiplyScalar(T.intensity),T.castShadow){let O=T.shadow,Q=t.get(T);Q.shadowIntensity=O.intensity,Q.shadowBias=O.bias,Q.shadowNormalBias=O.normalBias,Q.shadowRadius=O.radius,Q.shadowMapSize=O.mapSize,i.directionalShadow[E]=Q,i.directionalShadowMap[E]=N,i.directionalShadowMatrix[E]=T.shadow.matrix,h++}i.directional[E]=F,E++}else if(T.isSpotLight){let F=n.get(T);F.position.setFromMatrixPosition(T.matrixWorld),F.color.copy(B).multiplyScalar($),F.distance=Y,F.coneCos=Math.cos(T.angle),F.penumbraCos=Math.cos(T.angle*(1-T.penumbra)),F.decay=T.decay,i.spot[G]=F;let O=T.shadow;if(T.map&&(i.spotLightMap[H]=T.map,H++,O.updateMatrices(T),T.castShadow&&_++),i.spotLightMatrix[G]=O.matrix,T.castShadow){let Q=t.get(T);Q.shadowIntensity=O.intensity,Q.shadowBias=O.bias,Q.shadowNormalBias=O.normalBias,Q.shadowRadius=O.radius,Q.shadowMapSize=O.mapSize,i.spotShadow[G]=Q,i.spotShadowMap[G]=N,A++}G++}else if(T.isRectAreaLight){let F=n.get(T);F.color.copy(B).multiplyScalar($),F.halfWidth.set(T.width*.5,0,0),F.halfHeight.set(0,T.height*.5,0),i.rectArea[c]=F,c++}else if(T.isPointLight){let F=n.get(T);if(F.color.copy(T.color).multiplyScalar(T.intensity),F.distance=T.distance,F.decay=T.decay,T.castShadow){let O=T.shadow,Q=t.get(T);Q.shadowIntensity=O.intensity,Q.shadowBias=O.bias,Q.shadowNormalBias=O.normalBias,Q.shadowRadius=O.radius,Q.shadowMapSize=O.mapSize,Q.shadowCameraNear=O.camera.near,Q.shadowCameraFar=O.camera.far,i.pointShadow[D]=Q,i.pointShadowMap[D]=N,i.pointShadowMatrix[D]=T.shadow.matrix,M++}i.point[D]=F,D++}else if(T.isHemisphereLight){let F=n.get(T);F.skyColor.copy(T.color).multiplyScalar($),F.groundColor.copy(T.groundColor).multiplyScalar($),i.hemi[s]=F,s++}}c>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2)),i.ambient[0]=k,i.ambient[1]=U,i.ambient[2]=p;let d=i.hash;(d.directionalLength!==E||d.pointLength!==D||d.spotLength!==G||d.rectAreaLength!==c||d.hemiLength!==s||d.numDirectionalShadows!==h||d.numPointShadows!==M||d.numSpotShadows!==A||d.numSpotMaps!==H||d.numLightProbes!==I)&&(i.directional.length=E,i.spot.length=G,i.rectArea.length=c,i.point.length=D,i.hemi.length=s,i.directionalShadow.length=h,i.directionalShadowMap.length=h,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=A,i.spotShadowMap.length=A,i.directionalShadowMatrix.length=h,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=A+H-_,i.spotLightMap.length=H,i.numSpotLightShadowsWithMaps=_,i.numLightProbes=I,d.directionalLength=E,d.pointLength=D,d.spotLength=G,d.rectAreaLength=c,d.hemiLength=s,d.numDirectionalShadows=h,d.numPointShadows=M,d.numSpotShadows=A,d.numSpotMaps=H,d.numLightProbes=I,i.version=Qf++)}function C(R,k){let U=0,p=0,E=0,D=0,G=0,c=k.matrixWorldInverse;for(let s=0,h=R.length;s<h;s++){let M=R[s];if(M.isDirectionalLight){let A=i.directional[U];A.direction.setFromMatrixPosition(M.matrixWorld),l.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(l),A.direction.transformDirection(c),U++}else if(M.isSpotLight){let A=i.spot[E];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(c),A.direction.setFromMatrixPosition(M.matrixWorld),l.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(l),A.direction.transformDirection(c),E++}else if(M.isRectAreaLight){let A=i.rectArea[D];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(c),u.identity(),a.copy(M.matrixWorld),a.premultiply(c),u.extractRotation(a),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(u),A.halfHeight.applyMatrix4(u),D++}else if(M.isPointLight){let A=i.point[p];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(c),p++}else if(M.isHemisphereLight){let A=i.hemi[G];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(c),G++}}}return{setup:m,setupView:C,state:i}}function xr(e){let n=new jf(e),t=[],i=[],l=[];function a(p){U.camera=p,t.length=0,i.length=0,l.length=0}function u(p){t.push(p)}function m(p){i.push(p)}function C(p){l.push(p)}function R(){n.setup(t)}function k(p){n.setupView(t,p)}let U={lightsArray:t,shadowsArray:i,lightProbeGridArray:l,camera:null,lights:n,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:U,setupLights:R,setupLightsView:k,pushLight:u,pushShadow:m,pushLightProbeGrid:C}}function ed(e){let n=new WeakMap;function t(l,a=0){let u=n.get(l),m;return u===void 0?(m=new xr(e),n.set(l,[m])):a>=u.length?(m=new xr(e),u.push(m)):m=u[a],m}function i(){n=new WeakMap}return{get:t,dispose:i}}var td=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nd=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,id=[new Fe(1,0,0),new Fe(-1,0,0),new Fe(0,1,0),new Fe(0,-1,0),new Fe(0,0,1),new Fe(0,0,-1)],rd=[new Fe(0,-1,0),new Fe(0,-1,0),new Fe(0,0,1),new Fe(0,0,-1),new Fe(0,-1,0),new Fe(0,-1,0)],Mr=new Qt,an=new Fe,Wn=new Fe;function ad(e,n,t){let i=new Gr,l=new mt,a=new mt,u=new ht,m=new Ma,C=new Ta,R={},k=t.maxTextureSize,U={[ln]:St,[St]:ln,[Lt]:Lt},p=new It({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new mt},radius:{value:4}},vertexShader:td,fragmentShader:nd}),E=p.clone();E.defines.HORIZONTAL_PASS=1;let D=new Rn;D.setAttribute("position",new vn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let G=new wt(D,p),c=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Sn;let s=this.type;this.render=function(_,I,d){if(c.enabled===!1||c.autoUpdate===!1&&c.needsUpdate===!1||_.length===0)return;this.type===Aa&&(He("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Sn);let v=e.getRenderTarget(),y=e.getActiveCubeFace(),T=e.getActiveMipmapLevel(),B=e.state;B.setBlending(Dt),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);let $=s!==this.type;$&&I.traverse(function(Y){Y.material&&(Array.isArray(Y.material)?Y.material.forEach(N=>N.needsUpdate=!0):Y.material.needsUpdate=!0)});for(let Y=0,N=_.length;Y<N;Y++){let F=_[Y],O=F.shadow;if(O===void 0){He("WebGLShadowMap:",F,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;l.copy(O.mapSize);let Q=O.getFrameExtents();l.multiply(Q),a.copy(O.mapSize),(l.x>k||l.y>k)&&(l.x>k&&(a.x=Math.floor(k/Q.x),l.x=a.x*Q.x,O.mapSize.x=a.x),l.y>k&&(a.y=Math.floor(k/Q.y),l.y=a.y*Q.y,O.mapSize.y=a.y));let de=e.state.buffers.depth.getReversed();if(O.camera._reversedDepth=de,O.map===null||$===!0){if(O.map!==null&&(O.map.depthTexture!==null&&(O.map.depthTexture.dispose(),O.map.depthTexture=null),O.map.dispose()),this.type===on){if(F.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}O.map=new Ct(l.x,l.y,{format:jt,type:Gt,minFilter:vt,magFilter:vt,generateMipmaps:!1}),O.map.texture.name=F.name+".shadowMap",O.map.depthTexture=new fn(l.x,l.y,Ot),O.map.depthTexture.name=F.name+".shadowMapDepth",O.map.depthTexture.format=en,O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=kt,O.map.depthTexture.magFilter=kt}else F.isPointLight?(O.map=new Tn(l.x),O.map.depthTexture=new Ra(l.x,Wt)):(O.map=new Ct(l.x,l.y),O.map.depthTexture=new fn(l.x,l.y,Wt)),O.map.depthTexture.name=F.name+".shadowMap",O.map.depthTexture.format=en,this.type===Sn?(O.map.depthTexture.compareFunction=de?ri:ai,O.map.depthTexture.minFilter=vt,O.map.depthTexture.magFilter=vt):(O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=kt,O.map.depthTexture.magFilter=kt);O.camera.updateProjectionMatrix()}let ve=O.map.isWebGLCubeRenderTarget?6:1;for(let Ae=0;Ae<ve;Ae++){if(O.map.isWebGLCubeRenderTarget)e.setRenderTarget(O.map,Ae),e.clear();else{Ae===0&&(e.setRenderTarget(O.map),e.clear());let xe=O.getViewport(Ae);u.set(a.x*xe.x,a.y*xe.y,a.x*xe.z,a.y*xe.w),B.viewport(u)}if(F.isPointLight){let xe=O.camera,Ve=O.matrix,Ye=F.distance||xe.far;Ye!==xe.far&&(xe.far=Ye,xe.updateProjectionMatrix()),an.setFromMatrixPosition(F.matrixWorld),xe.position.copy(an),Wn.copy(xe.position),Wn.add(id[Ae]),xe.up.copy(rd[Ae]),xe.lookAt(Wn),xe.updateMatrixWorld(),Ve.makeTranslation(-an.x,-an.y,-an.z),Mr.multiplyMatrices(xe.projectionMatrix,xe.matrixWorldInverse),O._frustum.setFromProjectionMatrix(Mr,xe.coordinateSystem,xe.reversedDepth)}else O.updateMatrices(F);i=O.getFrustum(),A(I,d,O.camera,F,this.type)}O.isPointLightShadow!==!0&&this.type===on&&h(O,d),O.needsUpdate=!1}s=this.type,c.needsUpdate=!1,e.setRenderTarget(v,y,T)};function h(_,I){let d=n.update(G);p.defines.VSM_SAMPLES!==_.blurSamples&&(p.defines.VSM_SAMPLES=_.blurSamples,E.defines.VSM_SAMPLES=_.blurSamples,p.needsUpdate=!0,E.needsUpdate=!0),_.mapPass===null&&(_.mapPass=new Ct(l.x,l.y,{format:jt,type:Gt})),p.uniforms.shadow_pass.value=_.map.depthTexture,p.uniforms.resolution.value=_.mapSize,p.uniforms.radius.value=_.radius,e.setRenderTarget(_.mapPass),e.clear(),e.renderBufferDirect(I,null,d,p,G,null),E.uniforms.shadow_pass.value=_.mapPass.texture,E.uniforms.resolution.value=_.mapSize,E.uniforms.radius.value=_.radius,e.setRenderTarget(_.map),e.clear(),e.renderBufferDirect(I,null,d,E,G,null)}function M(_,I,d,v){let y=null,T=d.isPointLight===!0?_.customDistanceMaterial:_.customDepthMaterial;if(T!==void 0)y=T;else if(y=d.isPointLight===!0?C:m,e.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let B=y.uuid,$=I.uuid,Y=R[B];Y===void 0&&(Y={},R[B]=Y);let N=Y[$];N===void 0&&(N=y.clone(),Y[$]=N,I.addEventListener("dispose",H)),y=N}if(y.visible=I.visible,y.wireframe=I.wireframe,v===on?y.side=I.shadowSide!==null?I.shadowSide:I.side:y.side=I.shadowSide!==null?I.shadowSide:U[I.side],y.alphaMap=I.alphaMap,y.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,y.map=I.map,y.clipShadows=I.clipShadows,y.clippingPlanes=I.clippingPlanes,y.clipIntersection=I.clipIntersection,y.displacementMap=I.displacementMap,y.displacementScale=I.displacementScale,y.displacementBias=I.displacementBias,y.wireframeLinewidth=I.wireframeLinewidth,y.linewidth=I.linewidth,d.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let B=e.properties.get(y);B.light=d}return y}function A(_,I,d,v,y){if(_.visible===!1)return;if(_.layers.test(I.layers)&&(_.isMesh||_.isLine||_.isPoints)&&(_.castShadow||_.receiveShadow&&y===on)&&(!_.frustumCulled||i.intersectsObject(_))){_.modelViewMatrix.multiplyMatrices(d.matrixWorldInverse,_.matrixWorld);let $=n.update(_),Y=_.material;if(Array.isArray(Y)){let N=$.groups;for(let F=0,O=N.length;F<O;F++){let Q=N[F],de=Y[Q.materialIndex];if(de&&de.visible){let ve=M(_,de,v,y);_.onBeforeShadow(e,_,I,d,$,ve,Q),e.renderBufferDirect(d,null,$,ve,_,Q),_.onAfterShadow(e,_,I,d,$,ve,Q)}}}else if(Y.visible){let N=M(_,Y,v,y);_.onBeforeShadow(e,_,I,d,$,N,null),e.renderBufferDirect(d,null,$,N,_,null),_.onAfterShadow(e,_,I,d,$,N,null)}}let B=_.children;for(let $=0,Y=B.length;$<Y;$++)A(B[$],I,d,v,y)}function H(_){_.target.removeEventListener("dispose",H);for(let d in R){let v=R[d],y=_.target.uuid;y in v&&(v[y].dispose(),delete v[y])}}}function od(e,n){function t(){let g=!1,ee=new ht,W=null,ue=new ht(0,0,0,0);return{setMask:function(ie){W!==ie&&!g&&(e.colorMask(ie,ie,ie,ie),W=ie)},setLocked:function(ie){g=ie},setClear:function(ie,q,ge,Ce,at){at===!0&&(ie*=Ce,q*=Ce,ge*=Ce),ee.set(ie,q,ge,Ce),ue.equals(ee)===!1&&(e.clearColor(ie,q,ge,Ce),ue.copy(ee))},reset:function(){g=!1,W=null,ue.set(-1,0,0,0)}}}function i(){let g=!1,ee=!1,W=null,ue=null,ie=null;return{setReversed:function(q){if(ee!==q){let ge=n.get("EXT_clip_control");q?ge.clipControlEXT(ge.LOWER_LEFT_EXT,ge.ZERO_TO_ONE_EXT):ge.clipControlEXT(ge.LOWER_LEFT_EXT,ge.NEGATIVE_ONE_TO_ONE_EXT),ee=q;let Ce=ie;ie=null,this.setClear(Ce)}},getReversed:function(){return ee},setTest:function(q){q?te(e.DEPTH_TEST):Me(e.DEPTH_TEST)},setMask:function(q){W!==q&&!g&&(e.depthMask(q),W=q)},setFunc:function(q){if(ee&&(q=ja[q]),ue!==q){switch(q){case Za:e.depthFunc(e.NEVER);break;case qa:e.depthFunc(e.ALWAYS);break;case Ya:e.depthFunc(e.LESS);break;case gi:e.depthFunc(e.LEQUAL);break;case Ka:e.depthFunc(e.EQUAL);break;case Xa:e.depthFunc(e.GEQUAL);break;case za:e.depthFunc(e.GREATER);break;case Wa:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ue=q}},setLocked:function(q){g=q},setClear:function(q){ie!==q&&(ie=q,ee&&(q=1-q),e.clearDepth(q))},reset:function(){g=!1,W=null,ue=null,ie=null,ee=!1}}}function l(){let g=!1,ee=null,W=null,ue=null,ie=null,q=null,ge=null,Ce=null,at=null;return{setTest:function(We){g||(We?te(e.STENCIL_TEST):Me(e.STENCIL_TEST))},setMask:function(We){ee!==We&&!g&&(e.stencilMask(We),ee=We)},setFunc:function(We,Pt,xt){(W!==We||ue!==Pt||ie!==xt)&&(e.stencilFunc(We,Pt,xt),W=We,ue=Pt,ie=xt)},setOp:function(We,Pt,xt){(q!==We||ge!==Pt||Ce!==xt)&&(e.stencilOp(We,Pt,xt),q=We,ge=Pt,Ce=xt)},setLocked:function(We){g=We},setClear:function(We){at!==We&&(e.clearStencil(We),at=We)},reset:function(){g=!1,ee=null,W=null,ue=null,ie=null,q=null,ge=null,Ce=null,at=null}}}let a=new t,u=new i,m=new l,C=new WeakMap,R=new WeakMap,k={},U={},p={},E=new WeakMap,D=[],G=null,c=!1,s=null,h=null,M=null,A=null,H=null,_=null,I=null,d=new je(0,0,0),v=0,y=!1,T=null,B=null,$=null,Y=null,N=null,F=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),O=!1,Q=0,de=e.getParameter(e.VERSION);de.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(de)[1]),O=Q>=1):de.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(de)[1]),O=Q>=2);let ve=null,Ae={},xe=e.getParameter(e.SCISSOR_BOX),Ve=e.getParameter(e.VIEWPORT),Ye=new ht().fromArray(xe),we=new ht().fromArray(Ve);function K(g,ee,W,ue){let ie=new Uint8Array(4),q=e.createTexture();e.bindTexture(g,q),e.texParameteri(g,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(g,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let ge=0;ge<W;ge++)g===e.TEXTURE_3D||g===e.TEXTURE_2D_ARRAY?e.texImage3D(ee,0,e.RGBA,1,1,ue,0,e.RGBA,e.UNSIGNED_BYTE,ie):e.texImage2D(ee+ge,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,ie);return q}let ce={};ce[e.TEXTURE_2D]=K(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=K(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=K(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=K(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),u.setClear(1),m.setClear(0),te(e.DEPTH_TEST),u.setFunc(gi),lt(!1),tt(vi),te(e.CULL_FACE),Je(Dt);function te(g){k[g]!==!0&&(e.enable(g),k[g]=!0)}function Me(g){k[g]!==!1&&(e.disable(g),k[g]=!1)}function be(g,ee){return p[g]!==ee?(e.bindFramebuffer(g,ee),p[g]=ee,g===e.DRAW_FRAMEBUFFER&&(p[e.FRAMEBUFFER]=ee),g===e.FRAMEBUFFER&&(p[e.DRAW_FRAMEBUFFER]=ee),!0):!1}function Te(g,ee){let W=D,ue=!1;if(g){W=E.get(ee),W===void 0&&(W=[],E.set(ee,W));let ie=g.textures;if(W.length!==ie.length||W[0]!==e.COLOR_ATTACHMENT0){for(let q=0,ge=ie.length;q<ge;q++)W[q]=e.COLOR_ATTACHMENT0+q;W.length=ie.length,ue=!0}}else W[0]!==e.BACK&&(W[0]=e.BACK,ue=!0);ue&&e.drawBuffers(W)}function et(g){return G!==g?(e.useProgram(g),G=g,!0):!1}let Ne={[nn]:e.FUNC_ADD,[Ca]:e.FUNC_SUBTRACT,[ba]:e.FUNC_REVERSE_SUBTRACT};Ne[eo]=e.MIN,Ne[to]=e.MAX;let ke={[ka]:e.ZERO,[Va]:e.ONE,[Ha]:e.SRC_COLOR,[Ga]:e.SRC_ALPHA,[Ba]:e.SRC_ALPHA_SATURATE,[Oa]:e.DST_COLOR,[Fa]:e.DST_ALPHA,[ya]:e.ONE_MINUS_SRC_COLOR,[Na]:e.ONE_MINUS_SRC_ALPHA,[Ia]:e.ONE_MINUS_DST_COLOR,[wa]:e.ONE_MINUS_DST_ALPHA,[Da]:e.CONSTANT_COLOR,[Ua]:e.ONE_MINUS_CONSTANT_COLOR,[La]:e.CONSTANT_ALPHA,[Pa]:e.ONE_MINUS_CONSTANT_ALPHA};function Je(g,ee,W,ue,ie,q,ge,Ce,at,We){if(g===Dt){c===!0&&(Me(e.BLEND),c=!1);return}if(c===!1&&(te(e.BLEND),c=!0),g!==Ja){if(g!==s||We!==y){if((h!==nn||H!==nn)&&(e.blendEquation(e.FUNC_ADD),h=nn,H=nn),We)switch(g){case En:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case xi:e.blendFunc(e.ONE,e.ONE);break;case Ei:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Si:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Qe("WebGLState: Invalid blending: ",g);break}else switch(g){case En:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case xi:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case Ei:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Si:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",g);break}M=null,A=null,_=null,I=null,d.set(0,0,0),v=0,s=g,y=We}return}ie=ie||ee,q=q||W,ge=ge||ue,(ee!==h||ie!==H)&&(e.blendEquationSeparate(Ne[ee],Ne[ie]),h=ee,H=ie),(W!==M||ue!==A||q!==_||ge!==I)&&(e.blendFuncSeparate(ke[W],ke[ue],ke[q],ke[ge]),M=W,A=ue,_=q,I=ge),(Ce.equals(d)===!1||at!==v)&&(e.blendColor(Ce.r,Ce.g,Ce.b,at),d.copy(Ce),v=at),s=g,y=!1}function Ie(g,ee){g.side===Lt?Me(e.CULL_FACE):te(e.CULL_FACE);let W=g.side===St;ee&&(W=!W),lt(W),g.blending===En&&g.transparent===!1?Je(Dt):Je(g.blending,g.blendEquation,g.blendSrc,g.blendDst,g.blendEquationAlpha,g.blendSrcAlpha,g.blendDstAlpha,g.blendColor,g.blendAlpha,g.premultipliedAlpha),u.setFunc(g.depthFunc),u.setTest(g.depthTest),u.setMask(g.depthWrite),a.setMask(g.colorWrite);let ue=g.stencilWrite;m.setTest(ue),ue&&(m.setMask(g.stencilWriteMask),m.setFunc(g.stencilFunc,g.stencilRef,g.stencilFuncMask),m.setOp(g.stencilFail,g.stencilZFail,g.stencilZPass)),S(g.polygonOffset,g.polygonOffsetFactor,g.polygonOffsetUnits),g.alphaToCoverage===!0?te(e.SAMPLE_ALPHA_TO_COVERAGE):Me(e.SAMPLE_ALPHA_TO_COVERAGE)}function lt(g){T!==g&&(g?e.frontFace(e.CW):e.frontFace(e.CCW),T=g)}function tt(g){g!==$a?(te(e.CULL_FACE),g!==B&&(g===vi?e.cullFace(e.BACK):g===Qa?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Me(e.CULL_FACE),B=g}function _t(g){g!==$&&(O&&e.lineWidth(g),$=g)}function S(g,ee,W){g?(te(e.POLYGON_OFFSET_FILL),(Y!==ee||N!==W)&&(Y=ee,N=W,u.getReversed()&&(ee=-ee),e.polygonOffset(ee,W))):Me(e.POLYGON_OFFSET_FILL)}function ct(g){g?te(e.SCISSOR_TEST):Me(e.SCISSOR_TEST)}function ye(g){g===void 0&&(g=e.TEXTURE0+F-1),ve!==g&&(e.activeTexture(g),ve=g)}function qe(g,ee,W){W===void 0&&(ve===null?W=e.TEXTURE0+F-1:W=ve);let ue=Ae[W];ue===void 0&&(ue={type:void 0,texture:void 0},Ae[W]=ue),(ue.type!==g||ue.texture!==ee)&&(ve!==W&&(e.activeTexture(W),ve=W),e.bindTexture(g,ee||ce[g]),ue.type=g,ue.texture=ee)}function ae(){let g=Ae[ve];g!==void 0&&g.type!==void 0&&(e.bindTexture(g.type,null),g.type=void 0,g.texture=void 0)}function it(){try{e.compressedTexImage2D(...arguments)}catch(g){Qe("WebGLState:",g)}}function f(){try{e.compressedTexImage3D(...arguments)}catch(g){Qe("WebGLState:",g)}}function r(){try{e.texSubImage2D(...arguments)}catch(g){Qe("WebGLState:",g)}}function b(){try{e.texSubImage3D(...arguments)}catch(g){Qe("WebGLState:",g)}}function z(){try{e.compressedTexSubImage2D(...arguments)}catch(g){Qe("WebGLState:",g)}}function Z(){try{e.compressedTexSubImage3D(...arguments)}catch(g){Qe("WebGLState:",g)}}function J(){try{e.texStorage2D(...arguments)}catch(g){Qe("WebGLState:",g)}}function re(){try{e.texStorage3D(...arguments)}catch(g){Qe("WebGLState:",g)}}function V(){try{e.texImage2D(...arguments)}catch(g){Qe("WebGLState:",g)}}function X(){try{e.texImage3D(...arguments)}catch(g){Qe("WebGLState:",g)}}function fe(g){return U[g]!==void 0?U[g]:e.getParameter(g)}function he(g,ee){U[g]!==ee&&(e.pixelStorei(g,ee),U[g]=ee)}function ne(g){Ye.equals(g)===!1&&(e.scissor(g.x,g.y,g.z,g.w),Ye.copy(g))}function j(g){we.equals(g)===!1&&(e.viewport(g.x,g.y,g.z,g.w),we.copy(g))}function Re(g,ee){let W=R.get(ee);W===void 0&&(W=new WeakMap,R.set(ee,W));let ue=W.get(g);ue===void 0&&(ue=e.getUniformBlockIndex(ee,g.name),W.set(g,ue))}function Le(g,ee){let ue=R.get(ee).get(g);C.get(ee)!==ue&&(e.uniformBlockBinding(ee,ue,g.__bindingPointIndex),C.set(ee,ue))}function Ge(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),u.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),k={},U={},ve=null,Ae={},p={},E=new WeakMap,D=[],G=null,c=!1,s=null,h=null,M=null,A=null,H=null,_=null,I=null,d=new je(0,0,0),v=0,y=!1,T=null,B=null,$=null,Y=null,N=null,Ye.set(0,0,e.canvas.width,e.canvas.height),we.set(0,0,e.canvas.width,e.canvas.height),a.reset(),u.reset(),m.reset()}return{buffers:{color:a,depth:u,stencil:m},enable:te,disable:Me,bindFramebuffer:be,drawBuffers:Te,useProgram:et,setBlending:Je,setMaterial:Ie,setFlipSided:lt,setCullFace:tt,setLineWidth:_t,setPolygonOffset:S,setScissorTest:ct,activeTexture:ye,bindTexture:qe,unbindTexture:ae,compressedTexImage2D:it,compressedTexImage3D:f,texImage2D:V,texImage3D:X,pixelStorei:he,getParameter:fe,updateUBOMapping:Re,uniformBlockBinding:Le,texStorage2D:J,texStorage3D:re,texSubImage2D:r,texSubImage3D:b,compressedTexSubImage2D:z,compressedTexSubImage3D:Z,scissor:ne,viewport:j,reset:Ge}}function sd(e,n,t,i,l,a,u){let m=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,C=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),R=new mt,k=new WeakMap,U=new Set,p,E=new WeakMap,D=!1;try{D=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function G(f,r){return D?new OffscreenCanvas(f,r):uo("canvas")}function c(f,r,b){let z=1,Z=it(f);if((Z.width>b||Z.height>b)&&(z=b/Math.max(Z.width,Z.height)),z<1)if(typeof HTMLImageElement<"u"&&f instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&f instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&f instanceof ImageBitmap||typeof VideoFrame<"u"&&f instanceof VideoFrame){let J=Math.floor(z*Z.width),re=Math.floor(z*Z.height);p===void 0&&(p=G(J,re));let V=r?G(J,re):p;return V.width=J,V.height=re,V.getContext("2d").drawImage(f,0,0,J,re),He("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+J+"x"+re+")."),V}else return"data"in f&&He("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),f;return f}function s(f){return f.generateMipmaps}function h(f){e.generateMipmap(f)}function M(f){return f.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:f.isWebGL3DRenderTarget?e.TEXTURE_3D:f.isWebGLArrayRenderTarget||f.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function A(f,r,b,z,Z,J=!1){if(f!==null){if(e[f]!==void 0)return e[f];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+f+"'")}let re;z&&(re=n.get("EXT_texture_norm16"),re||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let V=r;if(r===e.RED&&(b===e.FLOAT&&(V=e.R32F),b===e.HALF_FLOAT&&(V=e.R16F),b===e.UNSIGNED_BYTE&&(V=e.R8),b===e.UNSIGNED_SHORT&&re&&(V=re.R16_EXT),b===e.SHORT&&re&&(V=re.R16_SNORM_EXT)),r===e.RED_INTEGER&&(b===e.UNSIGNED_BYTE&&(V=e.R8UI),b===e.UNSIGNED_SHORT&&(V=e.R16UI),b===e.UNSIGNED_INT&&(V=e.R32UI),b===e.BYTE&&(V=e.R8I),b===e.SHORT&&(V=e.R16I),b===e.INT&&(V=e.R32I)),r===e.RG&&(b===e.FLOAT&&(V=e.RG32F),b===e.HALF_FLOAT&&(V=e.RG16F),b===e.UNSIGNED_BYTE&&(V=e.RG8),b===e.UNSIGNED_SHORT&&re&&(V=re.RG16_EXT),b===e.SHORT&&re&&(V=re.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(b===e.UNSIGNED_BYTE&&(V=e.RG8UI),b===e.UNSIGNED_SHORT&&(V=e.RG16UI),b===e.UNSIGNED_INT&&(V=e.RG32UI),b===e.BYTE&&(V=e.RG8I),b===e.SHORT&&(V=e.RG16I),b===e.INT&&(V=e.RG32I)),r===e.RGB_INTEGER&&(b===e.UNSIGNED_BYTE&&(V=e.RGB8UI),b===e.UNSIGNED_SHORT&&(V=e.RGB16UI),b===e.UNSIGNED_INT&&(V=e.RGB32UI),b===e.BYTE&&(V=e.RGB8I),b===e.SHORT&&(V=e.RGB16I),b===e.INT&&(V=e.RGB32I)),r===e.RGBA_INTEGER&&(b===e.UNSIGNED_BYTE&&(V=e.RGBA8UI),b===e.UNSIGNED_SHORT&&(V=e.RGBA16UI),b===e.UNSIGNED_INT&&(V=e.RGBA32UI),b===e.BYTE&&(V=e.RGBA8I),b===e.SHORT&&(V=e.RGBA16I),b===e.INT&&(V=e.RGBA32I)),r===e.RGB&&(b===e.UNSIGNED_SHORT&&re&&(V=re.RGB16_EXT),b===e.SHORT&&re&&(V=re.RGB16_SNORM_EXT),b===e.UNSIGNED_INT_5_9_9_9_REV&&(V=e.RGB9_E5),b===e.UNSIGNED_INT_10F_11F_11F_REV&&(V=e.R11F_G11F_B10F)),r===e.RGBA){let X=J?Br:nt.getTransfer(Z);b===e.FLOAT&&(V=e.RGBA32F),b===e.HALF_FLOAT&&(V=e.RGBA16F),b===e.UNSIGNED_BYTE&&(V=X===$e?e.SRGB8_ALPHA8:e.RGBA8),b===e.UNSIGNED_SHORT&&re&&(V=re.RGBA16_EXT),b===e.SHORT&&re&&(V=re.RGBA16_SNORM_EXT),b===e.UNSIGNED_SHORT_4_4_4_4&&(V=e.RGBA4),b===e.UNSIGNED_SHORT_5_5_5_1&&(V=e.RGB5_A1)}return(V===e.R16F||V===e.R32F||V===e.RG16F||V===e.RG32F||V===e.RGBA16F||V===e.RGBA32F)&&n.get("EXT_color_buffer_float"),V}function H(f,r){let b;return f?r===null||r===Wt||r===dn?b=e.DEPTH24_STENCIL8:r===Ot?b=e.DEPTH32F_STENCIL8:r===xn&&(b=e.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):r===null||r===Wt||r===dn?b=e.DEPTH_COMPONENT24:r===Ot?b=e.DEPTH_COMPONENT32F:r===xn&&(b=e.DEPTH_COMPONENT16),b}function _(f,r){return s(f)===!0||f.isFramebufferTexture&&f.minFilter!==kt&&f.minFilter!==vt?Math.log2(Math.max(r.width,r.height))+1:f.mipmaps!==void 0&&f.mipmaps.length>0?f.mipmaps.length:f.isCompressedTexture&&Array.isArray(f.image)?r.mipmaps.length:1}function I(f){let r=f.target;r.removeEventListener("dispose",I),v(r),r.isVideoTexture&&k.delete(r),r.isHTMLTexture&&U.delete(r)}function d(f){let r=f.target;r.removeEventListener("dispose",d),T(r)}function v(f){let r=i.get(f);if(r.__webglInit===void 0)return;let b=f.source,z=E.get(b);if(z){let Z=z[r.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&y(f),Object.keys(z).length===0&&E.delete(b)}i.remove(f)}function y(f){let r=i.get(f);e.deleteTexture(r.__webglTexture);let b=f.source,z=E.get(b);delete z[r.__cacheKey],u.memory.textures--}function T(f){let r=i.get(f);if(f.depthTexture&&(f.depthTexture.dispose(),i.remove(f.depthTexture)),f.isWebGLCubeRenderTarget)for(let z=0;z<6;z++){if(Array.isArray(r.__webglFramebuffer[z]))for(let Z=0;Z<r.__webglFramebuffer[z].length;Z++)e.deleteFramebuffer(r.__webglFramebuffer[z][Z]);else e.deleteFramebuffer(r.__webglFramebuffer[z]);r.__webglDepthbuffer&&e.deleteRenderbuffer(r.__webglDepthbuffer[z])}else{if(Array.isArray(r.__webglFramebuffer))for(let z=0;z<r.__webglFramebuffer.length;z++)e.deleteFramebuffer(r.__webglFramebuffer[z]);else e.deleteFramebuffer(r.__webglFramebuffer);if(r.__webglDepthbuffer&&e.deleteRenderbuffer(r.__webglDepthbuffer),r.__webglMultisampledFramebuffer&&e.deleteFramebuffer(r.__webglMultisampledFramebuffer),r.__webglColorRenderbuffer)for(let z=0;z<r.__webglColorRenderbuffer.length;z++)r.__webglColorRenderbuffer[z]&&e.deleteRenderbuffer(r.__webglColorRenderbuffer[z]);r.__webglDepthRenderbuffer&&e.deleteRenderbuffer(r.__webglDepthRenderbuffer)}let b=f.textures;for(let z=0,Z=b.length;z<Z;z++){let J=i.get(b[z]);J.__webglTexture&&(e.deleteTexture(J.__webglTexture),u.memory.textures--),i.remove(b[z])}i.remove(f)}let B=0;function $(){B=0}function Y(){return B}function N(f){B=f}function F(){let f=B;return f>=l.maxTextures&&He("WebGLTextures: Trying to use "+f+" texture units while this GPU supports only "+l.maxTextures),B+=1,f}function O(f){let r=[];return r.push(f.wrapS),r.push(f.wrapT),r.push(f.wrapR||0),r.push(f.magFilter),r.push(f.minFilter),r.push(f.anisotropy),r.push(f.internalFormat),r.push(f.format),r.push(f.type),r.push(f.generateMipmaps),r.push(f.premultiplyAlpha),r.push(f.flipY),r.push(f.unpackAlignment),r.push(f.colorSpace),r.join()}function Q(f,r){let b=i.get(f);if(f.isVideoTexture&&qe(f),f.isRenderTargetTexture===!1&&f.isExternalTexture!==!0&&f.version>0&&b.__version!==f.version){let z=f.image;if(z===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(z.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{Me(b,f,r);return}}else f.isExternalTexture&&(b.__webglTexture=f.sourceTexture?f.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,b.__webglTexture,e.TEXTURE0+r)}function de(f,r){let b=i.get(f);if(f.isRenderTargetTexture===!1&&f.version>0&&b.__version!==f.version){Me(b,f,r);return}else f.isExternalTexture&&(b.__webglTexture=f.sourceTexture?f.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,b.__webglTexture,e.TEXTURE0+r)}function ve(f,r){let b=i.get(f);if(f.isRenderTargetTexture===!1&&f.version>0&&b.__version!==f.version){Me(b,f,r);return}t.bindTexture(e.TEXTURE_3D,b.__webglTexture,e.TEXTURE0+r)}function Ae(f,r){let b=i.get(f);if(f.isCubeDepthTexture!==!0&&f.version>0&&b.__version!==f.version){be(b,f,r);return}t.bindTexture(e.TEXTURE_CUBE_MAP,b.__webglTexture,e.TEXTURE0+r)}let xe={[io]:e.REPEAT,[Yn]:e.CLAMP_TO_EDGE,[no]:e.MIRRORED_REPEAT},Ve={[kt]:e.NEAREST,[ro]:e.NEAREST_MIPMAP_NEAREST,[hn]:e.NEAREST_MIPMAP_LINEAR,[vt]:e.LINEAR,[wn]:e.LINEAR_MIPMAP_NEAREST,[qt]:e.LINEAR_MIPMAP_LINEAR},Ye={[fo]:e.NEVER,[co]:e.ALWAYS,[lo]:e.LESS,[ai]:e.LEQUAL,[so]:e.EQUAL,[ri]:e.GEQUAL,[oo]:e.GREATER,[ao]:e.NOTEQUAL};function we(f,r){if(r.type===Ot&&n.has("OES_texture_float_linear")===!1&&(r.magFilter===vt||r.magFilter===wn||r.magFilter===hn||r.magFilter===qt||r.minFilter===vt||r.minFilter===wn||r.minFilter===hn||r.minFilter===qt)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(f,e.TEXTURE_WRAP_S,xe[r.wrapS]),e.texParameteri(f,e.TEXTURE_WRAP_T,xe[r.wrapT]),(f===e.TEXTURE_3D||f===e.TEXTURE_2D_ARRAY)&&e.texParameteri(f,e.TEXTURE_WRAP_R,xe[r.wrapR]),e.texParameteri(f,e.TEXTURE_MAG_FILTER,Ve[r.magFilter]),e.texParameteri(f,e.TEXTURE_MIN_FILTER,Ve[r.minFilter]),r.compareFunction&&(e.texParameteri(f,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(f,e.TEXTURE_COMPARE_FUNC,Ye[r.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(r.magFilter===kt||r.minFilter!==hn&&r.minFilter!==qt||r.type===Ot&&n.has("OES_texture_float_linear")===!1)return;if(r.anisotropy>1||i.get(r).__currentAnisotropy){let b=n.get("EXT_texture_filter_anisotropic");e.texParameterf(f,b.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,l.getMaxAnisotropy())),i.get(r).__currentAnisotropy=r.anisotropy}}}function K(f,r){let b=!1;f.__webglInit===void 0&&(f.__webglInit=!0,r.addEventListener("dispose",I));let z=r.source,Z=E.get(z);Z===void 0&&(Z={},E.set(z,Z));let J=O(r);if(J!==f.__cacheKey){Z[J]===void 0&&(Z[J]={texture:e.createTexture(),usedTimes:0},u.memory.textures++,b=!0),Z[J].usedTimes++;let re=Z[f.__cacheKey];re!==void 0&&(Z[f.__cacheKey].usedTimes--,re.usedTimes===0&&y(r)),f.__cacheKey=J,f.__webglTexture=Z[J].texture}return b}function ce(f,r,b){return Math.floor(Math.floor(f/b)/r)}function te(f,r,b,z){let J=f.updateRanges;if(J.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,b,z,r.data);else{J.sort((he,ne)=>he.start-ne.start);let re=0;for(let he=1;he<J.length;he++){let ne=J[re],j=J[he],Re=ne.start+ne.count,Le=ce(j.start,r.width,4),Ge=ce(ne.start,r.width,4);j.start<=Re+1&&Le===Ge&&ce(j.start+j.count-1,r.width,4)===Le?ne.count=Math.max(ne.count,j.start+j.count-ne.start):(++re,J[re]=j)}J.length=re+1;let V=t.getParameter(e.UNPACK_ROW_LENGTH),X=t.getParameter(e.UNPACK_SKIP_PIXELS),fe=t.getParameter(e.UNPACK_SKIP_ROWS);t.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let he=0,ne=J.length;he<ne;he++){let j=J[he],Re=Math.floor(j.start/4),Le=Math.ceil(j.count/4),Ge=Re%r.width,g=Math.floor(Re/r.width),ee=Le,W=1;t.pixelStorei(e.UNPACK_SKIP_PIXELS,Ge),t.pixelStorei(e.UNPACK_SKIP_ROWS,g),t.texSubImage2D(e.TEXTURE_2D,0,Ge,g,ee,W,b,z,r.data)}f.clearUpdateRanges(),t.pixelStorei(e.UNPACK_ROW_LENGTH,V),t.pixelStorei(e.UNPACK_SKIP_PIXELS,X),t.pixelStorei(e.UNPACK_SKIP_ROWS,fe)}}function Me(f,r,b){let z=e.TEXTURE_2D;(r.isDataArrayTexture||r.isCompressedArrayTexture)&&(z=e.TEXTURE_2D_ARRAY),r.isData3DTexture&&(z=e.TEXTURE_3D);let Z=K(f,r),J=r.source;t.bindTexture(z,f.__webglTexture,e.TEXTURE0+b);let re=i.get(J);if(J.version!==re.__version||Z===!0){if(t.activeTexture(e.TEXTURE0+b),(typeof ImageBitmap<"u"&&r.image instanceof ImageBitmap)===!1){let W=nt.getPrimaries(nt.workingColorSpace),ue=r.colorSpace===Yt?null:nt.getPrimaries(r.colorSpace),ie=r.colorSpace===Yt||W===ue?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie)}t.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment);let X=c(r.image,!1,l.maxTextureSize);X=ae(r,X);let fe=a.convert(r.format,r.colorSpace),he=a.convert(r.type),ne=A(r.internalFormat,fe,he,r.normalized,r.colorSpace,r.isVideoTexture);we(z,r);let j,Re=r.mipmaps,Le=r.isVideoTexture!==!0,Ge=re.__version===void 0||Z===!0,g=J.dataReady,ee=_(r,X);if(r.isDepthTexture)ne=H(r.format===Zt,r.type),Ge&&(Le?t.texStorage2D(e.TEXTURE_2D,1,ne,X.width,X.height):t.texImage2D(e.TEXTURE_2D,0,ne,X.width,X.height,0,fe,he,null));else if(r.isDataTexture)if(Re.length>0){Le&&Ge&&t.texStorage2D(e.TEXTURE_2D,ee,ne,Re[0].width,Re[0].height);for(let W=0,ue=Re.length;W<ue;W++)j=Re[W],Le?g&&t.texSubImage2D(e.TEXTURE_2D,W,0,0,j.width,j.height,fe,he,j.data):t.texImage2D(e.TEXTURE_2D,W,ne,j.width,j.height,0,fe,he,j.data);r.generateMipmaps=!1}else Le?(Ge&&t.texStorage2D(e.TEXTURE_2D,ee,ne,X.width,X.height),g&&te(r,X,fe,he)):t.texImage2D(e.TEXTURE_2D,0,ne,X.width,X.height,0,fe,he,X.data);else if(r.isCompressedTexture)if(r.isCompressedArrayTexture){Le&&Ge&&t.texStorage3D(e.TEXTURE_2D_ARRAY,ee,ne,Re[0].width,Re[0].height,X.depth);for(let W=0,ue=Re.length;W<ue;W++)if(j=Re[W],r.format!==Ut)if(fe!==null)if(Le){if(g)if(r.layerUpdates.size>0){let ie=Mi(j.width,j.height,r.format,r.type);for(let q of r.layerUpdates){let ge=j.data.subarray(q*ie/j.data.BYTES_PER_ELEMENT,(q+1)*ie/j.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,W,0,0,q,j.width,j.height,1,fe,ge)}r.clearLayerUpdates()}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,W,0,0,0,j.width,j.height,X.depth,fe,j.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,W,ne,j.width,j.height,X.depth,0,j.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Le?g&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,W,0,0,0,j.width,j.height,X.depth,fe,he,j.data):t.texImage3D(e.TEXTURE_2D_ARRAY,W,ne,j.width,j.height,X.depth,0,fe,he,j.data)}else{Le&&Ge&&t.texStorage2D(e.TEXTURE_2D,ee,ne,Re[0].width,Re[0].height);for(let W=0,ue=Re.length;W<ue;W++)j=Re[W],r.format!==Ut?fe!==null?Le?g&&t.compressedTexSubImage2D(e.TEXTURE_2D,W,0,0,j.width,j.height,fe,j.data):t.compressedTexImage2D(e.TEXTURE_2D,W,ne,j.width,j.height,0,j.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Le?g&&t.texSubImage2D(e.TEXTURE_2D,W,0,0,j.width,j.height,fe,he,j.data):t.texImage2D(e.TEXTURE_2D,W,ne,j.width,j.height,0,fe,he,j.data)}else if(r.isDataArrayTexture)if(Le){if(Ge&&t.texStorage3D(e.TEXTURE_2D_ARRAY,ee,ne,X.width,X.height,X.depth),g)if(r.layerUpdates.size>0){let W=Mi(X.width,X.height,r.format,r.type);for(let ue of r.layerUpdates){let ie=X.data.subarray(ue*W/X.data.BYTES_PER_ELEMENT,(ue+1)*W/X.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ue,X.width,X.height,1,fe,he,ie)}r.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,X.width,X.height,X.depth,fe,he,X.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,ne,X.width,X.height,X.depth,0,fe,he,X.data);else if(r.isData3DTexture)Le?(Ge&&t.texStorage3D(e.TEXTURE_3D,ee,ne,X.width,X.height,X.depth),g&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,X.width,X.height,X.depth,fe,he,X.data)):t.texImage3D(e.TEXTURE_3D,0,ne,X.width,X.height,X.depth,0,fe,he,X.data);else if(r.isFramebufferTexture){if(Ge)if(Le)t.texStorage2D(e.TEXTURE_2D,ee,ne,X.width,X.height);else{let W=X.width,ue=X.height;for(let ie=0;ie<ee;ie++)t.texImage2D(e.TEXTURE_2D,ie,ne,W,ue,0,fe,he,null),W>>=1,ue>>=1}}else if(r.isHTMLTexture){if("texElementImage2D"in e){let W=e.canvas;if(W.hasAttribute("layoutsubtree")||W.setAttribute("layoutsubtree","true"),X.parentNode!==W){W.appendChild(X),U.add(r),W.onpaint=Ce=>{let at=Ce.changedElements;for(let We of U)at.includes(We.image)&&(We.needsUpdate=!0)},W.requestPaint();return}let ue=0,ie=e.RGBA,q=e.RGBA,ge=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,ue,ie,q,ge,X),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Re.length>0){if(Le&&Ge){let W=it(Re[0]);t.texStorage2D(e.TEXTURE_2D,ee,ne,W.width,W.height)}for(let W=0,ue=Re.length;W<ue;W++)j=Re[W],Le?g&&t.texSubImage2D(e.TEXTURE_2D,W,0,0,fe,he,j):t.texImage2D(e.TEXTURE_2D,W,ne,fe,he,j);r.generateMipmaps=!1}else if(Le){if(Ge){let W=it(X);t.texStorage2D(e.TEXTURE_2D,ee,ne,W.width,W.height)}g&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,fe,he,X)}else t.texImage2D(e.TEXTURE_2D,0,ne,fe,he,X);s(r)&&h(z),re.__version=J.version,r.onUpdate&&r.onUpdate(r)}f.__version=r.version}function be(f,r,b){if(r.image.length!==6)return;let z=K(f,r),Z=r.source;t.bindTexture(e.TEXTURE_CUBE_MAP,f.__webglTexture,e.TEXTURE0+b);let J=i.get(Z);if(Z.version!==J.__version||z===!0){t.activeTexture(e.TEXTURE0+b);let re=nt.getPrimaries(nt.workingColorSpace),V=r.colorSpace===Yt?null:nt.getPrimaries(r.colorSpace),X=r.colorSpace===Yt||re===V?e.NONE:e.BROWSER_DEFAULT_WEBGL;t.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),t.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),t.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment),t.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,X);let fe=r.isCompressedTexture||r.image[0].isCompressedTexture,he=r.image[0]&&r.image[0].isDataTexture,ne=[];for(let q=0;q<6;q++)!fe&&!he?ne[q]=c(r.image[q],!0,l.maxCubemapSize):ne[q]=he?r.image[q].image:r.image[q],ne[q]=ae(r,ne[q]);let j=ne[0],Re=a.convert(r.format,r.colorSpace),Le=a.convert(r.type),Ge=A(r.internalFormat,Re,Le,r.normalized,r.colorSpace),g=r.isVideoTexture!==!0,ee=J.__version===void 0||z===!0,W=Z.dataReady,ue=_(r,j);we(e.TEXTURE_CUBE_MAP,r);let ie;if(fe){g&&ee&&t.texStorage2D(e.TEXTURE_CUBE_MAP,ue,Ge,j.width,j.height);for(let q=0;q<6;q++){ie=ne[q].mipmaps;for(let ge=0;ge<ie.length;ge++){let Ce=ie[ge];r.format!==Ut?Re!==null?g?W&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge,0,0,Ce.width,Ce.height,Re,Ce.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge,Ge,Ce.width,Ce.height,0,Ce.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):g?W&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge,0,0,Ce.width,Ce.height,Re,Le,Ce.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge,Ge,Ce.width,Ce.height,0,Re,Le,Ce.data)}}}else{if(ie=r.mipmaps,g&&ee){ie.length>0&&ue++;let q=it(ne[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,ue,Ge,q.width,q.height)}for(let q=0;q<6;q++)if(he){g?W&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,0,0,ne[q].width,ne[q].height,Re,Le,ne[q].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,Ge,ne[q].width,ne[q].height,0,Re,Le,ne[q].data);for(let ge=0;ge<ie.length;ge++){let at=ie[ge].image[q].image;g?W&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge+1,0,0,at.width,at.height,Re,Le,at.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge+1,Ge,at.width,at.height,0,Re,Le,at.data)}}else{g?W&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,0,0,Re,Le,ne[q]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,Ge,Re,Le,ne[q]);for(let ge=0;ge<ie.length;ge++){let Ce=ie[ge];g?W&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge+1,0,0,Re,Le,Ce.image[q]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+q,ge+1,Ge,Re,Le,Ce.image[q])}}}s(r)&&h(e.TEXTURE_CUBE_MAP),J.__version=Z.version,r.onUpdate&&r.onUpdate(r)}f.__version=r.version}function Te(f,r,b,z,Z,J){let re=a.convert(b.format,b.colorSpace),V=a.convert(b.type),X=A(b.internalFormat,re,V,b.normalized,b.colorSpace),fe=i.get(r),he=i.get(b);if(he.__renderTarget=r,!fe.__hasExternalTextures){let ne=Math.max(1,r.width>>J),j=Math.max(1,r.height>>J);Z===e.TEXTURE_3D||Z===e.TEXTURE_2D_ARRAY?t.texImage3D(Z,J,X,ne,j,r.depth,0,re,V,null):t.texImage2D(Z,J,X,ne,j,0,re,V,null)}t.bindFramebuffer(e.FRAMEBUFFER,f),ye(r)?m.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,z,Z,he.__webglTexture,0,ct(r)):(Z===e.TEXTURE_2D||Z>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,z,Z,he.__webglTexture,J),t.bindFramebuffer(e.FRAMEBUFFER,null)}function et(f,r,b){if(e.bindRenderbuffer(e.RENDERBUFFER,f),r.depthBuffer){let z=r.depthTexture,Z=z&&z.isDepthTexture?z.type:null,J=H(r.stencilBuffer,Z),re=r.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;ye(r)?m.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ct(r),J,r.width,r.height):b?e.renderbufferStorageMultisample(e.RENDERBUFFER,ct(r),J,r.width,r.height):e.renderbufferStorage(e.RENDERBUFFER,J,r.width,r.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,re,e.RENDERBUFFER,f)}else{let z=r.textures;for(let Z=0;Z<z.length;Z++){let J=z[Z],re=a.convert(J.format,J.colorSpace),V=a.convert(J.type),X=A(J.internalFormat,re,V,J.normalized,J.colorSpace);ye(r)?m.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ct(r),X,r.width,r.height):b?e.renderbufferStorageMultisample(e.RENDERBUFFER,ct(r),X,r.width,r.height):e.renderbufferStorage(e.RENDERBUFFER,X,r.width,r.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ne(f,r,b){let z=r.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(e.FRAMEBUFFER,f),!(r.depthTexture&&r.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Z=i.get(r.depthTexture);if(Z.__renderTarget=r,(!Z.__webglTexture||r.depthTexture.image.width!==r.width||r.depthTexture.image.height!==r.height)&&(r.depthTexture.image.width=r.width,r.depthTexture.image.height=r.height,r.depthTexture.needsUpdate=!0),z){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,r.depthTexture.addEventListener("dispose",I)),Z.__webglTexture===void 0){Z.__webglTexture=e.createTexture(),t.bindTexture(e.TEXTURE_CUBE_MAP,Z.__webglTexture),we(e.TEXTURE_CUBE_MAP,r.depthTexture);let fe=a.convert(r.depthTexture.format),he=a.convert(r.depthTexture.type),ne;r.depthTexture.format===en?ne=e.DEPTH_COMPONENT24:r.depthTexture.format===Zt&&(ne=e.DEPTH24_STENCIL8);for(let j=0;j<6;j++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ne,r.width,r.height,0,fe,he,null)}}else Q(r.depthTexture,0);let J=Z.__webglTexture,re=ct(r),V=z?e.TEXTURE_CUBE_MAP_POSITIVE_X+b:e.TEXTURE_2D,X=r.depthTexture.format===Zt?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(r.depthTexture.format===en)ye(r)?m.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,X,V,J,0,re):e.framebufferTexture2D(e.FRAMEBUFFER,X,V,J,0);else if(r.depthTexture.format===Zt)ye(r)?m.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,X,V,J,0,re):e.framebufferTexture2D(e.FRAMEBUFFER,X,V,J,0);else throw new Error("Unknown depthTexture format")}function ke(f){let r=i.get(f),b=f.isWebGLCubeRenderTarget===!0;if(r.__boundDepthTexture!==f.depthTexture){let z=f.depthTexture;if(r.__depthDisposeCallback&&r.__depthDisposeCallback(),z){let Z=()=>{delete r.__boundDepthTexture,delete r.__depthDisposeCallback,z.removeEventListener("dispose",Z)};z.addEventListener("dispose",Z),r.__depthDisposeCallback=Z}r.__boundDepthTexture=z}if(f.depthTexture&&!r.__autoAllocateDepthBuffer)if(b)for(let z=0;z<6;z++)Ne(r.__webglFramebuffer[z],f,z);else{let z=f.texture.mipmaps;z&&z.length>0?Ne(r.__webglFramebuffer[0],f,0):Ne(r.__webglFramebuffer,f,0)}else if(b){r.__webglDepthbuffer=[];for(let z=0;z<6;z++)if(t.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[z]),r.__webglDepthbuffer[z]===void 0)r.__webglDepthbuffer[z]=e.createRenderbuffer(),et(r.__webglDepthbuffer[z],f,!1);else{let Z=f.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,J=r.__webglDepthbuffer[z];e.bindRenderbuffer(e.RENDERBUFFER,J),e.framebufferRenderbuffer(e.FRAMEBUFFER,Z,e.RENDERBUFFER,J)}}else{let z=f.texture.mipmaps;if(z&&z.length>0?t.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer),r.__webglDepthbuffer===void 0)r.__webglDepthbuffer=e.createRenderbuffer(),et(r.__webglDepthbuffer,f,!1);else{let Z=f.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,J=r.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,J),e.framebufferRenderbuffer(e.FRAMEBUFFER,Z,e.RENDERBUFFER,J)}}t.bindFramebuffer(e.FRAMEBUFFER,null)}function Je(f,r,b){let z=i.get(f);r!==void 0&&Te(z.__webglFramebuffer,f,f.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),b!==void 0&&ke(f)}function Ie(f){let r=f.texture,b=i.get(f),z=i.get(r);f.addEventListener("dispose",d);let Z=f.textures,J=f.isWebGLCubeRenderTarget===!0,re=Z.length>1;if(re||(z.__webglTexture===void 0&&(z.__webglTexture=e.createTexture()),z.__version=r.version,u.memory.textures++),J){b.__webglFramebuffer=[];for(let V=0;V<6;V++)if(r.mipmaps&&r.mipmaps.length>0){b.__webglFramebuffer[V]=[];for(let X=0;X<r.mipmaps.length;X++)b.__webglFramebuffer[V][X]=e.createFramebuffer()}else b.__webglFramebuffer[V]=e.createFramebuffer()}else{if(r.mipmaps&&r.mipmaps.length>0){b.__webglFramebuffer=[];for(let V=0;V<r.mipmaps.length;V++)b.__webglFramebuffer[V]=e.createFramebuffer()}else b.__webglFramebuffer=e.createFramebuffer();if(re)for(let V=0,X=Z.length;V<X;V++){let fe=i.get(Z[V]);fe.__webglTexture===void 0&&(fe.__webglTexture=e.createTexture(),u.memory.textures++)}if(f.samples>0&&ye(f)===!1){b.__webglMultisampledFramebuffer=e.createFramebuffer(),b.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,b.__webglMultisampledFramebuffer);for(let V=0;V<Z.length;V++){let X=Z[V];b.__webglColorRenderbuffer[V]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,b.__webglColorRenderbuffer[V]);let fe=a.convert(X.format,X.colorSpace),he=a.convert(X.type),ne=A(X.internalFormat,fe,he,X.normalized,X.colorSpace,f.isXRRenderTarget===!0),j=ct(f);e.renderbufferStorageMultisample(e.RENDERBUFFER,j,ne,f.width,f.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+V,e.RENDERBUFFER,b.__webglColorRenderbuffer[V])}e.bindRenderbuffer(e.RENDERBUFFER,null),f.depthBuffer&&(b.__webglDepthRenderbuffer=e.createRenderbuffer(),et(b.__webglDepthRenderbuffer,f,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(J){t.bindTexture(e.TEXTURE_CUBE_MAP,z.__webglTexture),we(e.TEXTURE_CUBE_MAP,r);for(let V=0;V<6;V++)if(r.mipmaps&&r.mipmaps.length>0)for(let X=0;X<r.mipmaps.length;X++)Te(b.__webglFramebuffer[V][X],f,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+V,X);else Te(b.__webglFramebuffer[V],f,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0);s(r)&&h(e.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(re){for(let V=0,X=Z.length;V<X;V++){let fe=Z[V],he=i.get(fe),ne=e.TEXTURE_2D;(f.isWebGL3DRenderTarget||f.isWebGLArrayRenderTarget)&&(ne=f.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(ne,he.__webglTexture),we(ne,fe),Te(b.__webglFramebuffer,f,fe,e.COLOR_ATTACHMENT0+V,ne,0),s(fe)&&h(ne)}t.unbindTexture()}else{let V=e.TEXTURE_2D;if((f.isWebGL3DRenderTarget||f.isWebGLArrayRenderTarget)&&(V=f.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(V,z.__webglTexture),we(V,r),r.mipmaps&&r.mipmaps.length>0)for(let X=0;X<r.mipmaps.length;X++)Te(b.__webglFramebuffer[X],f,r,e.COLOR_ATTACHMENT0,V,X);else Te(b.__webglFramebuffer,f,r,e.COLOR_ATTACHMENT0,V,0);s(r)&&h(V),t.unbindTexture()}f.depthBuffer&&ke(f)}function lt(f){let r=f.textures;for(let b=0,z=r.length;b<z;b++){let Z=r[b];if(s(Z)){let J=M(f),re=i.get(Z).__webglTexture;t.bindTexture(J,re),h(J),t.unbindTexture()}}}let tt=[],_t=[];function S(f){if(f.samples>0){if(ye(f)===!1){let r=f.textures,b=f.width,z=f.height,Z=e.COLOR_BUFFER_BIT,J=f.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,re=i.get(f),V=r.length>1;if(V)for(let fe=0;fe<r.length;fe++)t.bindFramebuffer(e.FRAMEBUFFER,re.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+fe,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,re.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+fe,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,re.__webglMultisampledFramebuffer);let X=f.texture.mipmaps;X&&X.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,re.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,re.__webglFramebuffer);for(let fe=0;fe<r.length;fe++){if(f.resolveDepthBuffer&&(f.depthBuffer&&(Z|=e.DEPTH_BUFFER_BIT),f.stencilBuffer&&f.resolveStencilBuffer&&(Z|=e.STENCIL_BUFFER_BIT)),V){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,re.__webglColorRenderbuffer[fe]);let he=i.get(r[fe]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,he,0)}e.blitFramebuffer(0,0,b,z,0,0,b,z,Z,e.NEAREST),C===!0&&(tt.length=0,_t.length=0,tt.push(e.COLOR_ATTACHMENT0+fe),f.depthBuffer&&f.resolveDepthBuffer===!1&&(tt.push(J),_t.push(J),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,_t)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,tt))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),V)for(let fe=0;fe<r.length;fe++){t.bindFramebuffer(e.FRAMEBUFFER,re.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+fe,e.RENDERBUFFER,re.__webglColorRenderbuffer[fe]);let he=i.get(r[fe]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,re.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+fe,e.TEXTURE_2D,he,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,re.__webglMultisampledFramebuffer)}else if(f.depthBuffer&&f.resolveDepthBuffer===!1&&C){let r=f.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[r])}}}function ct(f){return Math.min(l.maxSamples,f.samples)}function ye(f){let r=i.get(f);return f.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&r.__useRenderToTexture!==!1}function qe(f){let r=u.render.frame;k.get(f)!==r&&(k.set(f,r),f.update())}function ae(f,r){let b=f.colorSpace,z=f.format,Z=f.type;return f.isCompressedTexture===!0||f.isVideoTexture===!0||b!==Pr&&b!==Yt&&(nt.getTransfer(b)===$e?(z!==Ut||Z!==Rt)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",b)),r}function it(f){return typeof HTMLImageElement<"u"&&f instanceof HTMLImageElement?(R.width=f.naturalWidth||f.width,R.height=f.naturalHeight||f.height):typeof VideoFrame<"u"&&f instanceof VideoFrame?(R.width=f.displayWidth,R.height=f.displayHeight):(R.width=f.width,R.height=f.height),R}this.allocateTextureUnit=F,this.resetTextureUnits=$,this.getTextureUnits=Y,this.setTextureUnits=N,this.setTexture2D=Q,this.setTexture2DArray=de,this.setTexture3D=ve,this.setTextureCube=Ae,this.rebindTextures=Je,this.setupRenderTarget=Ie,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=S,this.setupDepthRenderbuffer=ke,this.setupFrameBufferTexture=Te,this.useMultisampledRTT=ye,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function ld(e,n){function t(i,l=Yt){let a,u=nt.getTransfer(l);if(i===Rt)return e.UNSIGNED_BYTE;if(i===Hr)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Vr)return e.UNSIGNED_SHORT_5_5_5_1;if(i===po)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===ho)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===mo)return e.BYTE;if(i===_o)return e.SHORT;if(i===xn)return e.UNSIGNED_SHORT;if(i===br)return e.INT;if(i===Wt)return e.UNSIGNED_INT;if(i===Ot)return e.FLOAT;if(i===Gt)return e.HALF_FLOAT;if(i===go)return e.ALPHA;if(i===vo)return e.RGB;if(i===Ut)return e.RGBA;if(i===en)return e.DEPTH_COMPONENT;if(i===Zt)return e.DEPTH_STENCIL;if(i===So)return e.RED;if(i===kr)return e.RED_INTEGER;if(i===jt)return e.RG;if(i===Wr)return e.RG_INTEGER;if(i===zr)return e.RGBA_INTEGER;if(i===In||i===Nn||i===yn||i===Fn)if(u===$e)if(a=n.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===In)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Nn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===yn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Fn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=n.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===In)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Nn)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===yn)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Fn)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ti||i===Ai||i===Ri||i===bi)if(a=n.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Ti)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ai)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ri)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===bi)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ci||i===Pi||i===Li||i===Ui||i===Di||i===Xn||i===wi)if(a=n.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Ci||i===Pi)return u===$e?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===Li)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===Ui)return a.COMPRESSED_R11_EAC;if(i===Di)return a.COMPRESSED_SIGNED_R11_EAC;if(i===Xn)return a.COMPRESSED_RG11_EAC;if(i===wi)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Ii||i===Ni||i===yi||i===Fi||i===Oi||i===Bi||i===Gi||i===Hi||i===Vi||i===ki||i===Wi||i===zi||i===Xi||i===Ki)if(a=n.get("WEBGL_compressed_texture_astc"),a!==null){if(i===Ii)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ni)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===yi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Fi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Oi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Bi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Gi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Hi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Vi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ki)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Wi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===zi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Xi)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ki)return u===$e?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Yi||i===qi||i===Zi)if(a=n.get("EXT_texture_compression_bptc"),a!==null){if(i===Yi)return u===$e?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===qi)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Zi)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===$i||i===Qi||i===Kn||i===Ji)if(a=n.get("EXT_texture_compression_rgtc"),a!==null){if(i===$i)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Qi)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Kn)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Ji)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===dn?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:t}}var cd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fd=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ti=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,t){if(this.texture===null){let i=new Xr(n.texture);(n.depthNear!==t.depthNear||n.depthFar!==t.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=i}}getMesh(n){if(this.texture!==null&&this.mesh===null){let t=n.cameras[0].viewport,i=new It({vertexShader:cd,fragmentShader:fd,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new wt(new Ar(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ni=class extends Eo{constructor(n,t){super();let i=this,l=null,a=1,u=null,m="local-floor",C=1,R=null,k=null,U=null,p=null,E=null,D=null,G=typeof XRWebGLBinding<"u",c=new ti,s={},h=t.getContextAttributes(),M=null,A=null,H=[],_=[],I=new mt,d=null,v=new gn;v.viewport=new ht;let y=new gn;y.viewport=new ht;let T=[v,y],B=new xo,$=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ce=H[K];return ce===void 0&&(ce=new On,H[K]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(K){let ce=H[K];return ce===void 0&&(ce=new On,H[K]=ce),ce.getGripSpace()},this.getHand=function(K){let ce=H[K];return ce===void 0&&(ce=new On,H[K]=ce),ce.getHandSpace()};function N(K){let ce=_.indexOf(K.inputSource);if(ce===-1)return;let te=H[ce];te!==void 0&&(te.update(K.inputSource,K.frame,R||u),te.dispatchEvent({type:K.type,data:K.inputSource}))}function F(){l.removeEventListener("select",N),l.removeEventListener("selectstart",N),l.removeEventListener("selectend",N),l.removeEventListener("squeeze",N),l.removeEventListener("squeezestart",N),l.removeEventListener("squeezeend",N),l.removeEventListener("end",F),l.removeEventListener("inputsourceschange",O);for(let K=0;K<H.length;K++){let ce=_[K];ce!==null&&(_[K]=null,H[K].disconnect(ce))}$=null,Y=null,c.reset();for(let K in s)delete s[K];n.setRenderTarget(M),E=null,p=null,U=null,l=null,A=null,we.stop(),i.isPresenting=!1,n.setPixelRatio(d),n.setSize(I.width,I.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){a=K,i.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){m=K,i.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return R||u},this.setReferenceSpace=function(K){R=K},this.getBaseLayer=function(){return p!==null?p:E},this.getBinding=function(){return U===null&&G&&(U=new XRWebGLBinding(l,t)),U},this.getFrame=function(){return D},this.getSession=function(){return l},this.setSession=async function(K){if(l=K,l!==null){if(M=n.getRenderTarget(),l.addEventListener("select",N),l.addEventListener("selectstart",N),l.addEventListener("selectend",N),l.addEventListener("squeeze",N),l.addEventListener("squeezestart",N),l.addEventListener("squeezeend",N),l.addEventListener("end",F),l.addEventListener("inputsourceschange",O),h.xrCompatible!==!0&&await t.makeXRCompatible(),d=n.getPixelRatio(),n.getSize(I),G&&"createProjectionLayer"in XRWebGLBinding.prototype){let te=null,Me=null,be=null;h.depth&&(be=h.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=h.stencil?Zt:en,Me=h.stencil?dn:Wt);let Te={colorFormat:t.RGBA8,depthFormat:be,scaleFactor:a};U=this.getBinding(),p=U.createProjectionLayer(Te),l.updateRenderState({layers:[p]}),n.setPixelRatio(1),n.setSize(p.textureWidth,p.textureHeight,!1),A=new Ct(p.textureWidth,p.textureHeight,{format:Ut,type:Rt,depthTexture:new fn(p.textureWidth,p.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:h.stencil,colorSpace:n.outputColorSpace,samples:h.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let te={antialias:h.antialias,alpha:!0,depth:h.depth,stencil:h.stencil,framebufferScaleFactor:a};E=new XRWebGLLayer(l,t,te),l.updateRenderState({baseLayer:E}),n.setPixelRatio(1),n.setSize(E.framebufferWidth,E.framebufferHeight,!1),A=new Ct(E.framebufferWidth,E.framebufferHeight,{format:Ut,type:Rt,colorSpace:n.outputColorSpace,stencilBuffer:h.stencil,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(C),R=null,u=await l.requestReferenceSpace(m),we.setContext(l),we.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return c.getDepthTexture()};function O(K){for(let ce=0;ce<K.removed.length;ce++){let te=K.removed[ce],Me=_.indexOf(te);Me>=0&&(_[Me]=null,H[Me].disconnect(te))}for(let ce=0;ce<K.added.length;ce++){let te=K.added[ce],Me=_.indexOf(te);if(Me===-1){for(let Te=0;Te<H.length;Te++)if(Te>=_.length){_.push(te),Me=Te;break}else if(_[Te]===null){_[Te]=te,Me=Te;break}if(Me===-1)break}let be=H[Me];be&&be.connect(te)}}let Q=new Fe,de=new Fe;function ve(K,ce,te){Q.setFromMatrixPosition(ce.matrixWorld),de.setFromMatrixPosition(te.matrixWorld);let Me=Q.distanceTo(de),be=ce.projectionMatrix.elements,Te=te.projectionMatrix.elements,et=be[14]/(be[10]-1),Ne=be[14]/(be[10]+1),ke=(be[9]+1)/be[5],Je=(be[9]-1)/be[5],Ie=(be[8]-1)/be[0],lt=(Te[8]+1)/Te[0],tt=et*Ie,_t=et*lt,S=Me/(-Ie+lt),ct=S*-Ie;if(ce.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(ct),K.translateZ(S),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),be[10]===-1)K.projectionMatrix.copy(ce.projectionMatrix),K.projectionMatrixInverse.copy(ce.projectionMatrixInverse);else{let ye=et+S,qe=Ne+S,ae=tt-ct,it=_t+(Me-ct),f=ke*Ne/qe*ye,r=Je*Ne/qe*ye;K.projectionMatrix.makePerspective(ae,it,f,r,ye,qe),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function Ae(K,ce){ce===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ce.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(l===null)return;let ce=K.near,te=K.far;c.texture!==null&&(c.depthNear>0&&(ce=c.depthNear),c.depthFar>0&&(te=c.depthFar)),B.near=y.near=v.near=ce,B.far=y.far=v.far=te,($!==B.near||Y!==B.far)&&(l.updateRenderState({depthNear:B.near,depthFar:B.far}),$=B.near,Y=B.far),B.layers.mask=K.layers.mask|6,v.layers.mask=B.layers.mask&-5,y.layers.mask=B.layers.mask&-3;let Me=K.parent,be=B.cameras;Ae(B,Me);for(let Te=0;Te<be.length;Te++)Ae(be[Te],Me);be.length===2?ve(B,v,y):B.projectionMatrix.copy(v.projectionMatrix),xe(K,B,Me)};function xe(K,ce,te){te===null?K.matrix.copy(ce.matrixWorld):(K.matrix.copy(te.matrixWorld),K.matrix.invert(),K.matrix.multiply(ce.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ce.projectionMatrix),K.projectionMatrixInverse.copy(ce.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Mo*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(p===null&&E===null))return C},this.setFoveation=function(K){C=K,p!==null&&(p.fixedFoveation=K),E!==null&&E.fixedFoveation!==void 0&&(E.fixedFoveation=K)},this.hasDepthSensing=function(){return c.texture!==null},this.getDepthSensingMesh=function(){return c.getMesh(B)},this.getCameraTexture=function(K){return s[K]};let Ve=null;function Ye(K,ce){if(k=ce.getViewerPose(R||u),D=ce,k!==null){let te=k.views;E!==null&&(n.setRenderTargetFramebuffer(A,E.framebuffer),n.setRenderTarget(A));let Me=!1;te.length!==B.cameras.length&&(B.cameras.length=0,Me=!0);for(let Ne=0;Ne<te.length;Ne++){let ke=te[Ne],Je=null;if(E!==null)Je=E.getViewport(ke);else{let lt=U.getViewSubImage(p,ke);Je=lt.viewport,Ne===0&&(n.setRenderTargetTextures(A,lt.colorTexture,lt.depthStencilTexture),n.setRenderTarget(A))}let Ie=T[Ne];Ie===void 0&&(Ie=new gn,Ie.layers.enable(Ne),Ie.viewport=new ht,T[Ne]=Ie),Ie.matrix.fromArray(ke.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(ke.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(Je.x,Je.y,Je.width,Je.height),Ne===0&&(B.matrix.copy(Ie.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Me===!0&&B.cameras.push(Ie)}let be=l.enabledFeatures;if(be&&be.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&G){U=i.getBinding();let Ne=U.getDepthInformation(te[0]);Ne&&Ne.isValid&&Ne.texture&&c.init(Ne,l.renderState)}if(be&&be.includes("camera-access")&&G){n.state.unbindTexture(),U=i.getBinding();for(let Ne=0;Ne<te.length;Ne++){let ke=te[Ne].camera;if(ke){let Je=s[ke];Je||(Je=new Xr,s[ke]=Je);let Ie=U.getCameraImage(ke);Je.sourceTexture=Ie}}}}for(let te=0;te<H.length;te++){let Me=_[te],be=H[te];Me!==null&&be!==void 0&&be.update(Me,ce,R||u)}Ve&&Ve(K,ce),ce.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ce}),D=null}let we=new Kr;we.setAnimationLoop(Ye),this.setAnimationLoop=function(K){Ve=K},this.dispose=function(){}}},dd=new Qt,Jr=new Oe;Jr.set(-1,0,0,0,1,0,0,0,1);function ud(e,n){function t(c,s){c.matrixAutoUpdate===!0&&c.updateMatrix(),s.value.copy(c.matrix)}function i(c,s){s.color.getRGB(c.fogColor.value,Rr(e)),s.isFog?(c.fogNear.value=s.near,c.fogFar.value=s.far):s.isFogExp2&&(c.fogDensity.value=s.density)}function l(c,s,h,M,A){s.isNodeMaterial?s.uniformsNeedUpdate=!1:s.isMeshBasicMaterial?a(c,s):s.isMeshLambertMaterial?(a(c,s),s.envMap&&(c.envMapIntensity.value=s.envMapIntensity)):s.isMeshToonMaterial?(a(c,s),U(c,s)):s.isMeshPhongMaterial?(a(c,s),k(c,s),s.envMap&&(c.envMapIntensity.value=s.envMapIntensity)):s.isMeshStandardMaterial?(a(c,s),p(c,s),s.isMeshPhysicalMaterial&&E(c,s,A)):s.isMeshMatcapMaterial?(a(c,s),D(c,s)):s.isMeshDepthMaterial?a(c,s):s.isMeshDistanceMaterial?(a(c,s),G(c,s)):s.isMeshNormalMaterial?a(c,s):s.isLineBasicMaterial?(u(c,s),s.isLineDashedMaterial&&m(c,s)):s.isPointsMaterial?C(c,s,h,M):s.isSpriteMaterial?R(c,s):s.isShadowMaterial?(c.color.value.copy(s.color),c.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}function a(c,s){c.opacity.value=s.opacity,s.color&&c.diffuse.value.copy(s.color),s.emissive&&c.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(c.map.value=s.map,t(s.map,c.mapTransform)),s.alphaMap&&(c.alphaMap.value=s.alphaMap,t(s.alphaMap,c.alphaMapTransform)),s.bumpMap&&(c.bumpMap.value=s.bumpMap,t(s.bumpMap,c.bumpMapTransform),c.bumpScale.value=s.bumpScale,s.side===St&&(c.bumpScale.value*=-1)),s.normalMap&&(c.normalMap.value=s.normalMap,t(s.normalMap,c.normalMapTransform),c.normalScale.value.copy(s.normalScale),s.side===St&&c.normalScale.value.negate()),s.displacementMap&&(c.displacementMap.value=s.displacementMap,t(s.displacementMap,c.displacementMapTransform),c.displacementScale.value=s.displacementScale,c.displacementBias.value=s.displacementBias),s.emissiveMap&&(c.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,c.emissiveMapTransform)),s.specularMap&&(c.specularMap.value=s.specularMap,t(s.specularMap,c.specularMapTransform)),s.alphaTest>0&&(c.alphaTest.value=s.alphaTest);let h=n.get(s),M=h.envMap,A=h.envMapRotation;M&&(c.envMap.value=M,c.envMapRotation.value.setFromMatrix4(dd.makeRotationFromEuler(A)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.envMapRotation.value.premultiply(Jr),c.reflectivity.value=s.reflectivity,c.ior.value=s.ior,c.refractionRatio.value=s.refractionRatio),s.lightMap&&(c.lightMap.value=s.lightMap,c.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,c.lightMapTransform)),s.aoMap&&(c.aoMap.value=s.aoMap,c.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,c.aoMapTransform))}function u(c,s){c.diffuse.value.copy(s.color),c.opacity.value=s.opacity,s.map&&(c.map.value=s.map,t(s.map,c.mapTransform))}function m(c,s){c.dashSize.value=s.dashSize,c.totalSize.value=s.dashSize+s.gapSize,c.scale.value=s.scale}function C(c,s,h,M){c.diffuse.value.copy(s.color),c.opacity.value=s.opacity,c.size.value=s.size*h,c.scale.value=M*.5,s.map&&(c.map.value=s.map,t(s.map,c.uvTransform)),s.alphaMap&&(c.alphaMap.value=s.alphaMap,t(s.alphaMap,c.alphaMapTransform)),s.alphaTest>0&&(c.alphaTest.value=s.alphaTest)}function R(c,s){c.diffuse.value.copy(s.color),c.opacity.value=s.opacity,c.rotation.value=s.rotation,s.map&&(c.map.value=s.map,t(s.map,c.mapTransform)),s.alphaMap&&(c.alphaMap.value=s.alphaMap,t(s.alphaMap,c.alphaMapTransform)),s.alphaTest>0&&(c.alphaTest.value=s.alphaTest)}function k(c,s){c.specular.value.copy(s.specular),c.shininess.value=Math.max(s.shininess,1e-4)}function U(c,s){s.gradientMap&&(c.gradientMap.value=s.gradientMap)}function p(c,s){c.metalness.value=s.metalness,s.metalnessMap&&(c.metalnessMap.value=s.metalnessMap,t(s.metalnessMap,c.metalnessMapTransform)),c.roughness.value=s.roughness,s.roughnessMap&&(c.roughnessMap.value=s.roughnessMap,t(s.roughnessMap,c.roughnessMapTransform)),s.envMap&&(c.envMapIntensity.value=s.envMapIntensity)}function E(c,s,h){c.ior.value=s.ior,s.sheen>0&&(c.sheenColor.value.copy(s.sheenColor).multiplyScalar(s.sheen),c.sheenRoughness.value=s.sheenRoughness,s.sheenColorMap&&(c.sheenColorMap.value=s.sheenColorMap,t(s.sheenColorMap,c.sheenColorMapTransform)),s.sheenRoughnessMap&&(c.sheenRoughnessMap.value=s.sheenRoughnessMap,t(s.sheenRoughnessMap,c.sheenRoughnessMapTransform))),s.clearcoat>0&&(c.clearcoat.value=s.clearcoat,c.clearcoatRoughness.value=s.clearcoatRoughness,s.clearcoatMap&&(c.clearcoatMap.value=s.clearcoatMap,t(s.clearcoatMap,c.clearcoatMapTransform)),s.clearcoatRoughnessMap&&(c.clearcoatRoughnessMap.value=s.clearcoatRoughnessMap,t(s.clearcoatRoughnessMap,c.clearcoatRoughnessMapTransform)),s.clearcoatNormalMap&&(c.clearcoatNormalMap.value=s.clearcoatNormalMap,t(s.clearcoatNormalMap,c.clearcoatNormalMapTransform),c.clearcoatNormalScale.value.copy(s.clearcoatNormalScale),s.side===St&&c.clearcoatNormalScale.value.negate())),s.dispersion>0&&(c.dispersion.value=s.dispersion),s.iridescence>0&&(c.iridescence.value=s.iridescence,c.iridescenceIOR.value=s.iridescenceIOR,c.iridescenceThicknessMinimum.value=s.iridescenceThicknessRange[0],c.iridescenceThicknessMaximum.value=s.iridescenceThicknessRange[1],s.iridescenceMap&&(c.iridescenceMap.value=s.iridescenceMap,t(s.iridescenceMap,c.iridescenceMapTransform)),s.iridescenceThicknessMap&&(c.iridescenceThicknessMap.value=s.iridescenceThicknessMap,t(s.iridescenceThicknessMap,c.iridescenceThicknessMapTransform))),s.transmission>0&&(c.transmission.value=s.transmission,c.transmissionSamplerMap.value=h.texture,c.transmissionSamplerSize.value.set(h.width,h.height),s.transmissionMap&&(c.transmissionMap.value=s.transmissionMap,t(s.transmissionMap,c.transmissionMapTransform)),c.thickness.value=s.thickness,s.thicknessMap&&(c.thicknessMap.value=s.thicknessMap,t(s.thicknessMap,c.thicknessMapTransform)),c.attenuationDistance.value=s.attenuationDistance,c.attenuationColor.value.copy(s.attenuationColor)),s.anisotropy>0&&(c.anisotropyVector.value.set(s.anisotropy*Math.cos(s.anisotropyRotation),s.anisotropy*Math.sin(s.anisotropyRotation)),s.anisotropyMap&&(c.anisotropyMap.value=s.anisotropyMap,t(s.anisotropyMap,c.anisotropyMapTransform))),c.specularIntensity.value=s.specularIntensity,c.specularColor.value.copy(s.specularColor),s.specularColorMap&&(c.specularColorMap.value=s.specularColorMap,t(s.specularColorMap,c.specularColorMapTransform)),s.specularIntensityMap&&(c.specularIntensityMap.value=s.specularIntensityMap,t(s.specularIntensityMap,c.specularIntensityMapTransform))}function D(c,s){s.matcap&&(c.matcap.value=s.matcap)}function G(c,s){let h=n.get(s).light;c.referencePosition.value.setFromMatrixPosition(h.matrixWorld),c.nearDistance.value=h.shadow.camera.near,c.farDistance.value=h.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:l}}function pd(e,n,t,i){let l={},a={},u=[],m=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function C(h,M){let A=M.program;i.uniformBlockBinding(h,A)}function R(h,M){let A=l[h.id];A===void 0&&(D(h),A=k(h),l[h.id]=A,h.addEventListener("dispose",c));let H=M.program;i.updateUBOMapping(h,H);let _=n.render.frame;a[h.id]!==_&&(p(h),a[h.id]=_)}function k(h){let M=U();h.__bindingPointIndex=M;let A=e.createBuffer(),H=h.__size,_=h.usage;return e.bindBuffer(e.UNIFORM_BUFFER,A),e.bufferData(e.UNIFORM_BUFFER,H,_),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,M,A),A}function U(){for(let h=0;h<m;h++)if(u.indexOf(h)===-1)return u.push(h),h;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(h){let M=l[h.id],A=h.uniforms,H=h.__cache;e.bindBuffer(e.UNIFORM_BUFFER,M);for(let _=0,I=A.length;_<I;_++){let d=Array.isArray(A[_])?A[_]:[A[_]];for(let v=0,y=d.length;v<y;v++){let T=d[v];if(E(T,_,v,H)===!0){let B=T.__offset,$=Array.isArray(T.value)?T.value:[T.value],Y=0;for(let N=0;N<$.length;N++){let F=$[N],O=G(F);typeof F=="number"||typeof F=="boolean"?(T.__data[0]=F,e.bufferSubData(e.UNIFORM_BUFFER,B+Y,T.__data)):F.isMatrix3?(T.__data[0]=F.elements[0],T.__data[1]=F.elements[1],T.__data[2]=F.elements[2],T.__data[3]=0,T.__data[4]=F.elements[3],T.__data[5]=F.elements[4],T.__data[6]=F.elements[5],T.__data[7]=0,T.__data[8]=F.elements[6],T.__data[9]=F.elements[7],T.__data[10]=F.elements[8],T.__data[11]=0):ArrayBuffer.isView(F)?T.__data.set(new F.constructor(F.buffer,F.byteOffset,T.__data.length)):(F.toArray(T.__data,Y),Y+=O.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,B,T.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function E(h,M,A,H){let _=h.value,I=M+"_"+A;if(H[I]===void 0)return typeof _=="number"||typeof _=="boolean"?H[I]=_:ArrayBuffer.isView(_)?H[I]=_.slice():H[I]=_.clone(),!0;{let d=H[I];if(typeof _=="number"||typeof _=="boolean"){if(d!==_)return H[I]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(d.equals(_)===!1)return d.copy(_),!0}}return!1}function D(h){let M=h.uniforms,A=0,H=16;for(let I=0,d=M.length;I<d;I++){let v=Array.isArray(M[I])?M[I]:[M[I]];for(let y=0,T=v.length;y<T;y++){let B=v[y],$=Array.isArray(B.value)?B.value:[B.value];for(let Y=0,N=$.length;Y<N;Y++){let F=$[Y],O=G(F),Q=A%H,de=Q%O.boundary,ve=Q+de;A+=de,ve!==0&&H-ve<O.storage&&(A+=H-ve),B.__data=new Float32Array(O.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=A,A+=O.storage}}}let _=A%H;return _>0&&(A+=H-_),h.__size=A,h.__cache={},this}function G(h){let M={boundary:0,storage:0};return typeof h=="number"||typeof h=="boolean"?(M.boundary=4,M.storage=4):h.isVector2?(M.boundary=8,M.storage=8):h.isVector3||h.isColor?(M.boundary=16,M.storage=12):h.isVector4?(M.boundary=16,M.storage=16):h.isMatrix3?(M.boundary=48,M.storage=48):h.isMatrix4?(M.boundary=64,M.storage=64):h.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(h)?(M.boundary=16,M.storage=h.byteLength):He("WebGLRenderer: Unsupported uniform value type.",h),M}function c(h){let M=h.target;M.removeEventListener("dispose",c);let A=u.indexOf(M.__bindingPointIndex);u.splice(A,1),e.deleteBuffer(l[M.id]),delete l[M.id],delete a[M.id]}function s(){for(let h in l)e.deleteBuffer(l[h]);u=[],l={},a={}}return{bind:C,update:R,dispose:s}}var hd=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Tt=null;function md(){return Tt===null&&(Tt=new To(hd,16,16,jt,Gt),Tt.name="DFG_LUT",Tt.minFilter=vt,Tt.magFilter=vt,Tt.wrapS=Yn,Tt.wrapT=Yn,Tt.generateMipmaps=!1,Tt.needsUpdate=!0),Tt}var Tr=class{constructor(n={}){let{canvas:t=Ao(),context:i=null,depth:l=!0,stencil:a=!1,alpha:u=!1,antialias:m=!1,premultipliedAlpha:C=!0,preserveDrawingBuffer:R=!1,powerPreference:k="default",failIfMajorPerformanceCaveat:U=!1,reversedDepthBuffer:p=!1,outputBufferType:E=Rt}=n;this.isWebGLRenderer=!0;let D;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");D=i.getContextAttributes().alpha}else D=u;let G=E,c=new Set([zr,Wr,kr]),s=new Set([Rt,Wt,xn,dn,Hr,Vr]),h=new Uint32Array(4),M=new Int32Array(4),A=new Fe,H=null,_=null,I=[],d=[],v=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=bt,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,T=!1,B=null;this._outputColorSpace=Ro;let $=0,Y=0,N=null,F=-1,O=null,Q=new ht,de=new ht,ve=null,Ae=new je(0),xe=0,Ve=t.width,Ye=t.height,we=1,K=null,ce=null,te=new ht(0,0,Ve,Ye),Me=new ht(0,0,Ve,Ye),be=!1,Te=new Gr,et=!1,Ne=!1,ke=new Qt,Je=new Fe,Ie=new ht,lt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},tt=!1;function _t(){return N===null?we:1}let S=i;function ct(o,x){return t.getContext(o,x)}try{let o={alpha:!0,depth:l,stencil:a,antialias:m,premultipliedAlpha:C,preserveDrawingBuffer:R,powerPreference:k,failIfMajorPerformanceCaveat:U};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${bo}`),t.addEventListener("webglcontextlost",q,!1),t.addEventListener("webglcontextrestored",ge,!1),t.addEventListener("webglcontextcreationerror",Ce,!1),S===null){let x="webgl2";if(S=ct(x,o),S===null)throw ct(x)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(o){throw Qe("WebGLRenderer: "+o.message),o}let ye,qe,ae,it,f,r,b,z,Z,J,re,V,X,fe,he,ne,j,Re,Le,Ge,g,ee,W;function ue(){ye=new xc(S),ye.init(),g=new ld(S,ye),qe=new pc(S,ye,n,g),ae=new od(S,ye),qe.reversedDepthBuffer&&p&&ae.buffers.depth.setReversed(!0),it=new Ac(S),f=new Kf,r=new sd(S,ye,ae,f,qe,g,it),b=new Ec(y),z=new Po(S),ee=new dc(S,z),Z=new Mc(S,z,it,ee),J=new bc(S,Z,z,ee,it),Re=new Rc(S,qe,r),he=new hc(f),re=new Xf(y,b,ye,qe,ee,he),V=new ud(y,f),X=new qf,fe=new ed(ye),j=new fc(y,b,ae,J,D,C),ne=new ad(y,J,qe),W=new pd(S,it,qe,ae),Le=new uc(S,ye,it),Ge=new Tc(S,ye,it),it.programs=re.programs,y.capabilities=qe,y.extensions=ye,y.properties=f,y.renderLists=X,y.shadowMap=ne,y.state=ae,y.info=it}ue(),G!==Rt&&(v=new Pc(G,t.width,t.height,l,a));let ie=new ni(y,S);this.xr=ie,this.getContext=function(){return S},this.getContextAttributes=function(){return S.getContextAttributes()},this.forceContextLoss=function(){let o=ye.get("WEBGL_lose_context");o&&o.loseContext()},this.forceContextRestore=function(){let o=ye.get("WEBGL_lose_context");o&&o.restoreContext()},this.getPixelRatio=function(){return we},this.setPixelRatio=function(o){o!==void 0&&(we=o,this.setSize(Ve,Ye,!1))},this.getSize=function(o){return o.set(Ve,Ye)},this.setSize=function(o,x,w=!0){if(ie.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}Ve=o,Ye=x,t.width=Math.floor(o*we),t.height=Math.floor(x*we),w===!0&&(t.style.width=o+"px",t.style.height=x+"px"),v!==null&&v.setSize(t.width,t.height),this.setViewport(0,0,o,x)},this.getDrawingBufferSize=function(o){return o.set(Ve*we,Ye*we).floor()},this.setDrawingBufferSize=function(o,x,w){Ve=o,Ye=x,we=w,t.width=Math.floor(o*w),t.height=Math.floor(x*w),this.setViewport(0,0,o,x)},this.setEffects=function(o){if(G===Rt){Qe("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(o){for(let x=0;x<o.length;x++)if(o[x].isOutputPass===!0){He("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}v.setEffects(o||[])},this.getCurrentViewport=function(o){return o.copy(Q)},this.getViewport=function(o){return o.copy(te)},this.setViewport=function(o,x,w,P){o.isVector4?te.set(o.x,o.y,o.z,o.w):te.set(o,x,w,P),ae.viewport(Q.copy(te).multiplyScalar(we).round())},this.getScissor=function(o){return o.copy(Me)},this.setScissor=function(o,x,w,P){o.isVector4?Me.set(o.x,o.y,o.z,o.w):Me.set(o,x,w,P),ae.scissor(de.copy(Me).multiplyScalar(we).round())},this.getScissorTest=function(){return be},this.setScissorTest=function(o){ae.setScissorTest(be=o)},this.setOpaqueSort=function(o){K=o},this.setTransparentSort=function(o){ce=o},this.getClearColor=function(o){return o.copy(j.getClearColor())},this.setClearColor=function(){j.setClearColor(...arguments)},this.getClearAlpha=function(){return j.getClearAlpha()},this.setClearAlpha=function(){j.setClearAlpha(...arguments)},this.clear=function(o=!0,x=!0,w=!0){let P=0;if(o){let L=!1;if(N!==null){let le=N.texture.format;L=c.has(le)}if(L){let le=N.texture.type,me=s.has(le),se=j.getClearColor(),_e=j.getClearAlpha(),Se=se.r,Pe=se.g,De=se.b;me?(h[0]=Se,h[1]=Pe,h[2]=De,h[3]=_e,S.clearBufferuiv(S.COLOR,0,h)):(M[0]=Se,M[1]=Pe,M[2]=De,M[3]=_e,S.clearBufferiv(S.COLOR,0,M))}else P|=S.COLOR_BUFFER_BIT}x&&(P|=S.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),w&&(P|=S.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P!==0&&S.clear(P)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(o){o.setRenderer(this),B=o},this.dispose=function(){t.removeEventListener("webglcontextlost",q,!1),t.removeEventListener("webglcontextrestored",ge,!1),t.removeEventListener("webglcontextcreationerror",Ce,!1),j.dispose(),X.dispose(),fe.dispose(),f.dispose(),b.dispose(),J.dispose(),ee.dispose(),W.dispose(),re.dispose(),ie.dispose(),ie.removeEventListener("sessionstart",oi),ie.removeEventListener("sessionend",si),Ht.stop()};function q(o){o.preventDefault(),ji("WebGLRenderer: Context Lost."),T=!0}function ge(){ji("WebGLRenderer: Context Restored."),T=!1;let o=it.autoReset,x=ne.enabled,w=ne.autoUpdate,P=ne.needsUpdate,L=ne.type;ue(),it.autoReset=o,ne.enabled=x,ne.autoUpdate=w,ne.needsUpdate=P,ne.type=L}function Ce(o){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",o.statusMessage)}function at(o){let x=o.target;x.removeEventListener("dispose",at),We(x)}function We(o){Pt(o),f.remove(o)}function Pt(o){let x=f.get(o).programs;x!==void 0&&(x.forEach(function(w){re.releaseProgram(w)}),o.isShaderMaterial&&re.releaseShaderCache(o))}this.renderBufferDirect=function(o,x,w,P,L,le){x===null&&(x=lt);let me=L.isMesh&&L.matrixWorld.determinant()<0,se=ta(o,x,w,P,L);ae.setMaterial(P,me);let _e=w.index,Se=1;if(P.wireframe===!0){if(_e=Z.getWireframeAttribute(w),_e===void 0)return;Se=2}let Pe=w.drawRange,De=w.attributes.position,Ee=Pe.start*Se,ze=(Pe.start+Pe.count)*Se;le!==null&&(Ee=Math.max(Ee,le.start*Se),ze=Math.min(ze,(le.start+le.count)*Se)),_e!==null?(Ee=Math.max(Ee,0),ze=Math.min(ze,_e.count)):De!=null&&(Ee=Math.max(Ee,0),ze=Math.min(ze,De.count));let ot=ze-Ee;if(ot<0||ot===1/0)return;ee.setup(L,P,se,w,_e);let rt,Xe=Le;if(_e!==null&&(rt=z.get(_e),Xe=Ge,Xe.setIndex(rt)),L.isMesh)P.wireframe===!0?(ae.setLineWidth(P.wireframeLinewidth*_t()),Xe.setMode(S.LINES)):Xe.setMode(S.TRIANGLES);else if(L.isLine){let ut=P.linewidth;ut===void 0&&(ut=1),ae.setLineWidth(ut*_t()),L.isLineSegments?Xe.setMode(S.LINES):L.isLineLoop?Xe.setMode(S.LINE_LOOP):Xe.setMode(S.LINE_STRIP)}else L.isPoints?Xe.setMode(S.POINTS):L.isSprite&&Xe.setMode(S.TRIANGLES);if(L.isBatchedMesh)if(ye.get("WEBGL_multi_draw"))Xe.renderMultiDraw(L._multiDrawStarts,L._multiDrawCounts,L._multiDrawCount);else{let ut=L._multiDrawStarts,pe=L._multiDrawCounts,gt=L._multiDrawCount,Be=_e?z.get(_e).bytesPerElement:1,Et=f.get(P).currentProgram.getUniforms();for(let Mt=0;Mt<gt;Mt++)Et.setValue(S,"_gl_DrawID",Mt),Xe.render(ut[Mt]/Be,pe[Mt])}else if(L.isInstancedMesh)Xe.renderInstances(Ee,ot,L.count);else if(w.isInstancedBufferGeometry){let ut=w._maxInstanceCount!==void 0?w._maxInstanceCount:1/0,pe=Math.min(w.instanceCount,ut);Xe.renderInstances(Ee,ot,pe)}else Xe.render(Ee,ot)};function xt(o,x,w){o.transparent===!0&&o.side===Lt&&o.forceSinglePass===!1?(o.side=St,o.needsUpdate=!0,pn(o,x,w),o.side=ln,o.needsUpdate=!0,pn(o,x,w),o.side=Lt):pn(o,x,w)}this.compile=function(o,x,w=null){w===null&&(w=o),_=fe.get(w),_.init(x),d.push(_),w.traverseVisible(function(L){L.isLight&&L.layers.test(x.layers)&&(_.pushLight(L),L.castShadow&&_.pushShadow(L))}),o!==w&&o.traverseVisible(function(L){L.isLight&&L.layers.test(x.layers)&&(_.pushLight(L),L.castShadow&&_.pushShadow(L))}),_.setupLights();let P=new Set;return o.traverse(function(L){if(!(L.isMesh||L.isPoints||L.isLine||L.isSprite))return;let le=L.material;if(le)if(Array.isArray(le))for(let me=0;me<le.length;me++){let se=le[me];xt(se,w,L),P.add(se)}else xt(le,w,L),P.add(le)}),_=d.pop(),P},this.compileAsync=function(o,x,w=null){let P=this.compile(o,x,w);return new Promise(L=>{function le(){if(P.forEach(function(me){f.get(me).currentProgram.isReady()&&P.delete(me)}),P.size===0){L(o);return}setTimeout(le,10)}ye.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let Pn=null;function jr(o){Pn&&Pn(o)}function oi(){Ht.stop()}function si(){Ht.start()}let Ht=new Kr;Ht.setAnimationLoop(jr),typeof self<"u"&&Ht.setContext(self),this.setAnimationLoop=function(o){Pn=o,ie.setAnimationLoop(o),o===null?Ht.stop():Ht.start()},ie.addEventListener("sessionstart",oi),ie.addEventListener("sessionend",si),this.render=function(o,x){if(x!==void 0&&x.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;B!==null&&B.renderStart(o,x);let w=ie.enabled===!0&&ie.isPresenting===!0,P=v!==null&&(N===null||w)&&v.begin(y,N);if(o.matrixWorldAutoUpdate===!0&&o.updateMatrixWorld(),x.parent===null&&x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),ie.enabled===!0&&ie.isPresenting===!0&&(v===null||v.isCompositing()===!1)&&(ie.cameraAutoUpdate===!0&&ie.updateCamera(x),x=ie.getCamera()),o.isScene===!0&&o.onBeforeRender(y,o,x,N),_=fe.get(o,d.length),_.init(x),_.state.textureUnits=r.getTextureUnits(),d.push(_),ke.multiplyMatrices(x.projectionMatrix,x.matrixWorldInverse),Te.setFromProjectionMatrix(ke,er,x.reversedDepth),Ne=this.localClippingEnabled,et=he.init(this.clippingPlanes,Ne),H=X.get(o,I.length),H.init(),I.push(H),ie.enabled===!0&&ie.isPresenting===!0){let me=y.xr.getDepthSensingMesh();me!==null&&Ln(me,x,-1/0,y.sortObjects)}Ln(o,x,0,y.sortObjects),H.finish(),y.sortObjects===!0&&H.sort(K,ce),tt=ie.enabled===!1||ie.isPresenting===!1||ie.hasDepthSensing()===!1,tt&&j.addToRenderList(H,o),this.info.render.frame++,et===!0&&he.beginShadows();let L=_.state.shadowsArray;if(ne.render(L,o,x),et===!0&&he.endShadows(),this.info.autoReset===!0&&this.info.reset(),(P&&v.hasRenderPass())===!1){let me=H.opaque,se=H.transmissive;if(_.setupLights(),x.isArrayCamera){let _e=x.cameras;if(se.length>0)for(let Se=0,Pe=_e.length;Se<Pe;Se++){let De=_e[Se];ci(me,se,o,De)}tt&&j.render(o);for(let Se=0,Pe=_e.length;Se<Pe;Se++){let De=_e[Se];li(H,o,De,De.viewport)}}else se.length>0&&ci(me,se,o,x),tt&&j.render(o),li(H,o,x)}N!==null&&Y===0&&(r.updateMultisampleRenderTarget(N),r.updateRenderTargetMipmap(N)),P&&v.end(y),o.isScene===!0&&o.onAfterRender(y,o,x),ee.resetDefaultState(),F=-1,O=null,d.pop(),d.length>0?(_=d[d.length-1],r.setTextureUnits(_.state.textureUnits),et===!0&&he.setGlobalState(y.clippingPlanes,_.state.camera)):_=null,I.pop(),I.length>0?H=I[I.length-1]:H=null,B!==null&&B.renderEnd()};function Ln(o,x,w,P){if(o.visible===!1)return;if(o.layers.test(x.layers)){if(o.isGroup)w=o.renderOrder;else if(o.isLOD)o.autoUpdate===!0&&o.update(x);else if(o.isLightProbeGrid)_.pushLightProbeGrid(o);else if(o.isLight)_.pushLight(o),o.castShadow&&_.pushShadow(o);else if(o.isSprite){if(!o.frustumCulled||Te.intersectsSprite(o)){P&&Ie.setFromMatrixPosition(o.matrixWorld).applyMatrix4(ke);let me=J.update(o),se=o.material;se.visible&&H.push(o,me,se,w,Ie.z,null)}}else if((o.isMesh||o.isLine||o.isPoints)&&(!o.frustumCulled||Te.intersectsObject(o))){let me=J.update(o),se=o.material;if(P&&(o.boundingSphere!==void 0?(o.boundingSphere===null&&o.computeBoundingSphere(),Ie.copy(o.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Ie.copy(me.boundingSphere.center)),Ie.applyMatrix4(o.matrixWorld).applyMatrix4(ke)),Array.isArray(se)){let _e=me.groups;for(let Se=0,Pe=_e.length;Se<Pe;Se++){let De=_e[Se],Ee=se[De.materialIndex];Ee&&Ee.visible&&H.push(o,me,Ee,w,Ie.z,De)}}else se.visible&&H.push(o,me,se,w,Ie.z,null)}}let le=o.children;for(let me=0,se=le.length;me<se;me++)Ln(le[me],x,w,P)}function li(o,x,w,P){let{opaque:L,transmissive:le,transparent:me}=o;_.setupLightsView(w),et===!0&&he.setGlobalState(y.clippingPlanes,w),P&&ae.viewport(Q.copy(P)),L.length>0&&un(L,x,w),le.length>0&&un(le,x,w),me.length>0&&un(me,x,w),ae.buffers.depth.setTest(!0),ae.buffers.depth.setMask(!0),ae.buffers.color.setMask(!0),ae.setPolygonOffset(!1)}function ci(o,x,w,P){if((w.isScene===!0?w.overrideMaterial:null)!==null)return;if(_.state.transmissionRenderTarget[P.id]===void 0){let Ee=ye.has("EXT_color_buffer_half_float")||ye.has("EXT_color_buffer_float");_.state.transmissionRenderTarget[P.id]=new Ct(1,1,{generateMipmaps:!0,type:Ee?Gt:Rt,minFilter:qt,samples:Math.max(4,qe.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace})}let le=_.state.transmissionRenderTarget[P.id],me=P.viewport||Q;le.setSize(me.z*y.transmissionResolutionScale,me.w*y.transmissionResolutionScale);let se=y.getRenderTarget(),_e=y.getActiveCubeFace(),Se=y.getActiveMipmapLevel();y.setRenderTarget(le),y.getClearColor(Ae),xe=y.getClearAlpha(),xe<1&&y.setClearColor(16777215,.5),y.clear(),tt&&j.render(w);let Pe=y.toneMapping;y.toneMapping=bt;let De=P.viewport;if(P.viewport!==void 0&&(P.viewport=void 0),_.setupLightsView(P),et===!0&&he.setGlobalState(y.clippingPlanes,P),un(o,w,P),r.updateMultisampleRenderTarget(le),r.updateRenderTargetMipmap(le),ye.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let ze=0,ot=x.length;ze<ot;ze++){let rt=x[ze],{object:Xe,geometry:ut,material:pe,group:gt}=rt;if(pe.side===Lt&&Xe.layers.test(P.layers)){let Be=pe.side;pe.side=St,pe.needsUpdate=!0,fi(Xe,w,P,ut,pe,gt),pe.side=Be,pe.needsUpdate=!0,Ee=!0}}Ee===!0&&(r.updateMultisampleRenderTarget(le),r.updateRenderTargetMipmap(le))}y.setRenderTarget(se,_e,Se),y.setClearColor(Ae,xe),De!==void 0&&(P.viewport=De),y.toneMapping=Pe}function un(o,x,w){let P=x.isScene===!0?x.overrideMaterial:null;for(let L=0,le=o.length;L<le;L++){let me=o[L],{object:se,geometry:_e,group:Se}=me,Pe=me.material;Pe.allowOverride===!0&&P!==null&&(Pe=P),se.layers.test(w.layers)&&fi(se,x,w,_e,Pe,Se)}}function fi(o,x,w,P,L,le){o.onBeforeRender(y,x,w,P,L,le),o.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,o.matrixWorld),o.normalMatrix.getNormalMatrix(o.modelViewMatrix),L.onBeforeRender(y,x,w,P,o,le),L.transparent===!0&&L.side===Lt&&L.forceSinglePass===!1?(L.side=St,L.needsUpdate=!0,y.renderBufferDirect(w,x,P,L,o,le),L.side=ln,L.needsUpdate=!0,y.renderBufferDirect(w,x,P,L,o,le),L.side=Lt):y.renderBufferDirect(w,x,P,L,o,le),o.onAfterRender(y,x,w,P,L,le)}function pn(o,x,w){x.isScene!==!0&&(x=lt);let P=f.get(o),L=_.state.lights,le=_.state.shadowsArray,me=L.state.version,se=re.getParameters(o,L.state,le,x,w,_.state.lightProbeGridArray),_e=re.getProgramCacheKey(se),Se=P.programs;P.environment=o.isMeshStandardMaterial||o.isMeshLambertMaterial||o.isMeshPhongMaterial?x.environment:null,P.fog=x.fog;let Pe=o.isMeshStandardMaterial||o.isMeshLambertMaterial&&!o.envMap||o.isMeshPhongMaterial&&!o.envMap;P.envMap=b.get(o.envMap||P.environment,Pe),P.envMapRotation=P.environment!==null&&o.envMap===null?x.environmentRotation:o.envMapRotation,Se===void 0&&(o.addEventListener("dispose",at),Se=new Map,P.programs=Se);let De=Se.get(_e);if(De!==void 0){if(P.currentProgram===De&&P.lightsStateVersion===me)return ui(o,se),De}else se.uniforms=re.getUniforms(o),B!==null&&o.isNodeMaterial&&B.build(o,w,se),o.onBeforeCompile(se,y),De=re.acquireProgram(se,_e),Se.set(_e,De),P.uniforms=se.uniforms;let Ee=P.uniforms;return(!o.isShaderMaterial&&!o.isRawShaderMaterial||o.clipping===!0)&&(Ee.clippingPlanes=he.uniform),ui(o,se),P.needsLights=ia(o),P.lightsStateVersion=me,P.needsLights&&(Ee.ambientLightColor.value=L.state.ambient,Ee.lightProbe.value=L.state.probe,Ee.directionalLights.value=L.state.directional,Ee.directionalLightShadows.value=L.state.directionalShadow,Ee.spotLights.value=L.state.spot,Ee.spotLightShadows.value=L.state.spotShadow,Ee.rectAreaLights.value=L.state.rectArea,Ee.ltc_1.value=L.state.rectAreaLTC1,Ee.ltc_2.value=L.state.rectAreaLTC2,Ee.pointLights.value=L.state.point,Ee.pointLightShadows.value=L.state.pointShadow,Ee.hemisphereLights.value=L.state.hemi,Ee.directionalShadowMatrix.value=L.state.directionalShadowMatrix,Ee.spotLightMatrix.value=L.state.spotLightMatrix,Ee.spotLightMap.value=L.state.spotLightMap,Ee.pointShadowMatrix.value=L.state.pointShadowMatrix),P.lightProbeGrid=_.state.lightProbeGridArray.length>0,P.currentProgram=De,P.uniformsList=null,De}function di(o){if(o.uniformsList===null){let x=o.currentProgram.getUniforms();o.uniformsList=$t.seqWithValue(x.seq,o.uniforms)}return o.uniformsList}function ui(o,x){let w=f.get(o);w.outputColorSpace=x.outputColorSpace,w.batching=x.batching,w.batchingColor=x.batchingColor,w.instancing=x.instancing,w.instancingColor=x.instancingColor,w.instancingMorph=x.instancingMorph,w.skinning=x.skinning,w.morphTargets=x.morphTargets,w.morphNormals=x.morphNormals,w.morphColors=x.morphColors,w.morphTargetsCount=x.morphTargetsCount,w.numClippingPlanes=x.numClippingPlanes,w.numIntersection=x.numClipIntersection,w.vertexAlphas=x.vertexAlphas,w.vertexTangents=x.vertexTangents,w.toneMapping=x.toneMapping}function ea(o,x){if(o.length===0)return null;if(o.length===1)return o[0].texture!==null?o[0]:null;A.setFromMatrixPosition(x.matrixWorld);for(let w=0,P=o.length;w<P;w++){let L=o[w];if(L.texture!==null&&L.boundingBox.containsPoint(A))return L}return null}function ta(o,x,w,P,L){x.isScene!==!0&&(x=lt),r.resetTextureUnits();let le=x.fog,me=P.isMeshStandardMaterial||P.isMeshLambertMaterial||P.isMeshPhongMaterial?x.environment:null,se=N===null?y.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:nt.workingColorSpace,_e=P.isMeshStandardMaterial||P.isMeshLambertMaterial&&!P.envMap||P.isMeshPhongMaterial&&!P.envMap,Se=b.get(P.envMap||me,_e),Pe=P.vertexColors===!0&&!!w.attributes.color&&w.attributes.color.itemSize===4,De=!!w.attributes.tangent&&(!!P.normalMap||P.anisotropy>0),Ee=!!w.morphAttributes.position,ze=!!w.morphAttributes.normal,ot=!!w.morphAttributes.color,rt=bt;P.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(rt=y.toneMapping);let Xe=w.morphAttributes.position||w.morphAttributes.normal||w.morphAttributes.color,ut=Xe!==void 0?Xe.length:0,pe=f.get(P),gt=_.state.lights;if(et===!0&&(Ne===!0||o!==O)){let Ze=o===O&&P.id===F;he.setState(P,o,Ze)}let Be=!1;P.version===pe.__version?(pe.needsLights&&pe.lightsStateVersion!==gt.state.version||pe.outputColorSpace!==se||L.isBatchedMesh&&pe.batching===!1||!L.isBatchedMesh&&pe.batching===!0||L.isBatchedMesh&&pe.batchingColor===!0&&L.colorTexture===null||L.isBatchedMesh&&pe.batchingColor===!1&&L.colorTexture!==null||L.isInstancedMesh&&pe.instancing===!1||!L.isInstancedMesh&&pe.instancing===!0||L.isSkinnedMesh&&pe.skinning===!1||!L.isSkinnedMesh&&pe.skinning===!0||L.isInstancedMesh&&pe.instancingColor===!0&&L.instanceColor===null||L.isInstancedMesh&&pe.instancingColor===!1&&L.instanceColor!==null||L.isInstancedMesh&&pe.instancingMorph===!0&&L.morphTexture===null||L.isInstancedMesh&&pe.instancingMorph===!1&&L.morphTexture!==null||pe.envMap!==Se||P.fog===!0&&pe.fog!==le||pe.numClippingPlanes!==void 0&&(pe.numClippingPlanes!==he.numPlanes||pe.numIntersection!==he.numIntersection)||pe.vertexAlphas!==Pe||pe.vertexTangents!==De||pe.morphTargets!==Ee||pe.morphNormals!==ze||pe.morphColors!==ot||pe.toneMapping!==rt||pe.morphTargetsCount!==ut||!!pe.lightProbeGrid!=_.state.lightProbeGridArray.length>0)&&(Be=!0):(Be=!0,pe.__version=P.version);let Et=pe.currentProgram;Be===!0&&(Et=pn(P,x,L),B&&P.isNodeMaterial&&B.onUpdateProgram(P,Et,pe));let Mt=!1,Nt=!1,zt=!1,Ke=Et.getUniforms(),st=pe.uniforms;if(ae.useProgram(Et.program)&&(Mt=!0,Nt=!0,zt=!0),P.id!==F&&(F=P.id,Nt=!0),pe.needsLights){let Ze=ea(_.state.lightProbeGridArray,L);pe.lightProbeGrid!==Ze&&(pe.lightProbeGrid=Ze,Nt=!0)}if(Mt||O!==o){ae.buffers.depth.getReversed()&&o.reversedDepth!==!0&&(o._reversedDepth=!0,o.updateProjectionMatrix()),Ke.setValue(S,"projectionMatrix",o.projectionMatrix),Ke.setValue(S,"viewMatrix",o.matrixWorldInverse);let Ft=Ke.map.cameraPosition;Ft!==void 0&&Ft.setValue(S,Je.setFromMatrixPosition(o.matrixWorld)),qe.logarithmicDepthBuffer&&Ke.setValue(S,"logDepthBufFC",2/(Math.log(o.far+1)/Math.LN2)),(P.isMeshPhongMaterial||P.isMeshToonMaterial||P.isMeshLambertMaterial||P.isMeshBasicMaterial||P.isMeshStandardMaterial||P.isShaderMaterial)&&Ke.setValue(S,"isOrthographic",o.isOrthographicCamera===!0),O!==o&&(O=o,Nt=!0,zt=!0)}if(pe.needsLights&&(gt.state.directionalShadowMap.length>0&&Ke.setValue(S,"directionalShadowMap",gt.state.directionalShadowMap,r),gt.state.spotShadowMap.length>0&&Ke.setValue(S,"spotShadowMap",gt.state.spotShadowMap,r),gt.state.pointShadowMap.length>0&&Ke.setValue(S,"pointShadowMap",gt.state.pointShadowMap,r)),L.isSkinnedMesh){Ke.setOptional(S,L,"bindMatrix"),Ke.setOptional(S,L,"bindMatrixInverse");let Ze=L.skeleton;Ze&&(Ze.boneTexture===null&&Ze.computeBoneTexture(),Ke.setValue(S,"boneTexture",Ze.boneTexture,r))}L.isBatchedMesh&&(Ke.setOptional(S,L,"batchingTexture"),Ke.setValue(S,"batchingTexture",L._matricesTexture,r),Ke.setOptional(S,L,"batchingIdTexture"),Ke.setValue(S,"batchingIdTexture",L._indirectTexture,r),Ke.setOptional(S,L,"batchingColorTexture"),L._colorsTexture!==null&&Ke.setValue(S,"batchingColorTexture",L._colorsTexture,r));let yt=w.morphAttributes;if((yt.position!==void 0||yt.normal!==void 0||yt.color!==void 0)&&Re.update(L,w,Et),(Nt||pe.receiveShadow!==L.receiveShadow)&&(pe.receiveShadow=L.receiveShadow,Ke.setValue(S,"receiveShadow",L.receiveShadow)),(P.isMeshStandardMaterial||P.isMeshLambertMaterial||P.isMeshPhongMaterial)&&P.envMap===null&&x.environment!==null&&(st.envMapIntensity.value=x.environmentIntensity),st.dfgLUT!==void 0&&(st.dfgLUT.value=md()),Nt){if(Ke.setValue(S,"toneMappingExposure",y.toneMappingExposure),pe.needsLights&&na(st,zt),le&&P.fog===!0&&V.refreshFogUniforms(st,le),V.refreshMaterialUniforms(st,P,we,Ye,_.state.transmissionRenderTarget[o.id]),pe.needsLights&&pe.lightProbeGrid){let Ze=pe.lightProbeGrid;st.probesSH.value=Ze.texture,st.probesMin.value.copy(Ze.boundingBox.min),st.probesMax.value.copy(Ze.boundingBox.max),st.probesResolution.value.copy(Ze.resolution)}$t.upload(S,di(pe),st,r)}if(P.isShaderMaterial&&P.uniformsNeedUpdate===!0&&($t.upload(S,di(pe),st,r),P.uniformsNeedUpdate=!1),P.isSpriteMaterial&&Ke.setValue(S,"center",L.center),Ke.setValue(S,"modelViewMatrix",L.modelViewMatrix),Ke.setValue(S,"normalMatrix",L.normalMatrix),Ke.setValue(S,"modelMatrix",L.matrixWorld),P.uniformsGroups!==void 0){let Ze=P.uniformsGroups;for(let Ft=0,Xt=Ze.length;Ft<Xt;Ft++){let pi=Ze[Ft];W.update(pi,Et),W.bind(pi,Et)}}return Et}function na(o,x){o.ambientLightColor.needsUpdate=x,o.lightProbe.needsUpdate=x,o.directionalLights.needsUpdate=x,o.directionalLightShadows.needsUpdate=x,o.pointLights.needsUpdate=x,o.pointLightShadows.needsUpdate=x,o.spotLights.needsUpdate=x,o.spotLightShadows.needsUpdate=x,o.rectAreaLights.needsUpdate=x,o.hemisphereLights.needsUpdate=x}function ia(o){return o.isMeshLambertMaterial||o.isMeshToonMaterial||o.isMeshPhongMaterial||o.isMeshStandardMaterial||o.isShadowMaterial||o.isShaderMaterial&&o.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(o,x,w){let P=f.get(o);P.__autoAllocateDepthBuffer=o.resolveDepthBuffer===!1,P.__autoAllocateDepthBuffer===!1&&(P.__useRenderToTexture=!1),f.get(o.texture).__webglTexture=x,f.get(o.depthTexture).__webglTexture=P.__autoAllocateDepthBuffer?void 0:w,P.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(o,x){let w=f.get(o);w.__webglFramebuffer=x,w.__useDefaultFramebuffer=x===void 0};let ra=S.createFramebuffer();this.setRenderTarget=function(o,x=0,w=0){N=o,$=x,Y=w;let P=null,L=!1,le=!1;if(o){let se=f.get(o);if(se.__useDefaultFramebuffer!==void 0){ae.bindFramebuffer(S.FRAMEBUFFER,se.__webglFramebuffer),Q.copy(o.viewport),de.copy(o.scissor),ve=o.scissorTest,ae.viewport(Q),ae.scissor(de),ae.setScissorTest(ve),F=-1;return}else if(se.__webglFramebuffer===void 0)r.setupRenderTarget(o);else if(se.__hasExternalTextures)r.rebindTextures(o,f.get(o.texture).__webglTexture,f.get(o.depthTexture).__webglTexture);else if(o.depthBuffer){let Pe=o.depthTexture;if(se.__boundDepthTexture!==Pe){if(Pe!==null&&f.has(Pe)&&(o.width!==Pe.image.width||o.height!==Pe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");r.setupDepthRenderbuffer(o)}}let _e=o.texture;(_e.isData3DTexture||_e.isDataArrayTexture||_e.isCompressedArrayTexture)&&(le=!0);let Se=f.get(o).__webglFramebuffer;o.isWebGLCubeRenderTarget?(Array.isArray(Se[x])?P=Se[x][w]:P=Se[x],L=!0):o.samples>0&&r.useMultisampledRTT(o)===!1?P=f.get(o).__webglMultisampledFramebuffer:Array.isArray(Se)?P=Se[w]:P=Se,Q.copy(o.viewport),de.copy(o.scissor),ve=o.scissorTest}else Q.copy(te).multiplyScalar(we).floor(),de.copy(Me).multiplyScalar(we).floor(),ve=be;if(w!==0&&(P=ra),ae.bindFramebuffer(S.FRAMEBUFFER,P)&&ae.drawBuffers(o,P),ae.viewport(Q),ae.scissor(de),ae.setScissorTest(ve),L){let se=f.get(o.texture);S.framebufferTexture2D(S.FRAMEBUFFER,S.COLOR_ATTACHMENT0,S.TEXTURE_CUBE_MAP_POSITIVE_X+x,se.__webglTexture,w)}else if(le){let se=x;for(let _e=0;_e<o.textures.length;_e++){let Se=f.get(o.textures[_e]);S.framebufferTextureLayer(S.FRAMEBUFFER,S.COLOR_ATTACHMENT0+_e,Se.__webglTexture,w,se)}}else if(o!==null&&w!==0){let se=f.get(o.texture);S.framebufferTexture2D(S.FRAMEBUFFER,S.COLOR_ATTACHMENT0,S.TEXTURE_2D,se.__webglTexture,w)}F=-1},this.readRenderTargetPixels=function(o,x,w,P,L,le,me,se=0){if(!(o&&o.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=f.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&me!==void 0&&(_e=_e[me]),_e){ae.bindFramebuffer(S.FRAMEBUFFER,_e);try{let Se=o.textures[se],Pe=Se.format,De=Se.type;if(o.textures.length>1&&S.readBuffer(S.COLOR_ATTACHMENT0+se),!qe.textureFormatReadable(Pe)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(De)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}x>=0&&x<=o.width-P&&w>=0&&w<=o.height-L&&S.readPixels(x,w,P,L,g.convert(Pe),g.convert(De),le)}finally{let Se=N!==null?f.get(N).__webglFramebuffer:null;ae.bindFramebuffer(S.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(o,x,w,P,L,le,me,se=0){if(!(o&&o.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=f.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&me!==void 0&&(_e=_e[me]),_e)if(x>=0&&x<=o.width-P&&w>=0&&w<=o.height-L){ae.bindFramebuffer(S.FRAMEBUFFER,_e);let Se=o.textures[se],Pe=Se.format,De=Se.type;if(o.textures.length>1&&S.readBuffer(S.COLOR_ATTACHMENT0+se),!qe.textureFormatReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ee=S.createBuffer();S.bindBuffer(S.PIXEL_PACK_BUFFER,Ee),S.bufferData(S.PIXEL_PACK_BUFFER,le.byteLength,S.STREAM_READ),S.readPixels(x,w,P,L,g.convert(Pe),g.convert(De),0);let ze=N!==null?f.get(N).__webglFramebuffer:null;ae.bindFramebuffer(S.FRAMEBUFFER,ze);let ot=S.fenceSync(S.SYNC_GPU_COMMANDS_COMPLETE,0);return S.flush(),await Co(S,ot,4),S.bindBuffer(S.PIXEL_PACK_BUFFER,Ee),S.getBufferSubData(S.PIXEL_PACK_BUFFER,0,le),S.deleteBuffer(Ee),S.deleteSync(ot),le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(o,x=null,w=0){let P=Math.pow(2,-w),L=Math.floor(o.image.width*P),le=Math.floor(o.image.height*P),me=x!==null?x.x:0,se=x!==null?x.y:0;r.setTexture2D(o,0),S.copyTexSubImage2D(S.TEXTURE_2D,w,0,0,me,se,L,le),ae.unbindTexture()};let aa=S.createFramebuffer(),oa=S.createFramebuffer();this.copyTextureToTexture=function(o,x,w=null,P=null,L=0,le=0){let me,se,_e,Se,Pe,De,Ee,ze,ot,rt=o.isCompressedTexture?o.mipmaps[le]:o.image;if(w!==null)me=w.max.x-w.min.x,se=w.max.y-w.min.y,_e=w.isBox3?w.max.z-w.min.z:1,Se=w.min.x,Pe=w.min.y,De=w.isBox3?w.min.z:0;else{let st=Math.pow(2,-L);me=Math.floor(rt.width*st),se=Math.floor(rt.height*st),o.isDataArrayTexture?_e=rt.depth:o.isData3DTexture?_e=Math.floor(rt.depth*st):_e=1,Se=0,Pe=0,De=0}P!==null?(Ee=P.x,ze=P.y,ot=P.z):(Ee=0,ze=0,ot=0);let Xe=g.convert(x.format),ut=g.convert(x.type),pe;x.isData3DTexture?(r.setTexture3D(x,0),pe=S.TEXTURE_3D):x.isDataArrayTexture||x.isCompressedArrayTexture?(r.setTexture2DArray(x,0),pe=S.TEXTURE_2D_ARRAY):(r.setTexture2D(x,0),pe=S.TEXTURE_2D),ae.activeTexture(S.TEXTURE0),ae.pixelStorei(S.UNPACK_FLIP_Y_WEBGL,x.flipY),ae.pixelStorei(S.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),ae.pixelStorei(S.UNPACK_ALIGNMENT,x.unpackAlignment);let gt=ae.getParameter(S.UNPACK_ROW_LENGTH),Be=ae.getParameter(S.UNPACK_IMAGE_HEIGHT),Et=ae.getParameter(S.UNPACK_SKIP_PIXELS),Mt=ae.getParameter(S.UNPACK_SKIP_ROWS),Nt=ae.getParameter(S.UNPACK_SKIP_IMAGES);ae.pixelStorei(S.UNPACK_ROW_LENGTH,rt.width),ae.pixelStorei(S.UNPACK_IMAGE_HEIGHT,rt.height),ae.pixelStorei(S.UNPACK_SKIP_PIXELS,Se),ae.pixelStorei(S.UNPACK_SKIP_ROWS,Pe),ae.pixelStorei(S.UNPACK_SKIP_IMAGES,De);let zt=o.isDataArrayTexture||o.isData3DTexture,Ke=x.isDataArrayTexture||x.isData3DTexture;if(o.isDepthTexture){let st=f.get(o),yt=f.get(x),Ze=f.get(st.__renderTarget),Ft=f.get(yt.__renderTarget);ae.bindFramebuffer(S.READ_FRAMEBUFFER,Ze.__webglFramebuffer),ae.bindFramebuffer(S.DRAW_FRAMEBUFFER,Ft.__webglFramebuffer);for(let Xt=0;Xt<_e;Xt++)zt&&(S.framebufferTextureLayer(S.READ_FRAMEBUFFER,S.COLOR_ATTACHMENT0,f.get(o).__webglTexture,L,De+Xt),S.framebufferTextureLayer(S.DRAW_FRAMEBUFFER,S.COLOR_ATTACHMENT0,f.get(x).__webglTexture,le,ot+Xt)),S.blitFramebuffer(Se,Pe,me,se,Ee,ze,me,se,S.DEPTH_BUFFER_BIT,S.NEAREST);ae.bindFramebuffer(S.READ_FRAMEBUFFER,null),ae.bindFramebuffer(S.DRAW_FRAMEBUFFER,null)}else if(L!==0||o.isRenderTargetTexture||f.has(o)){let st=f.get(o),yt=f.get(x);ae.bindFramebuffer(S.READ_FRAMEBUFFER,aa),ae.bindFramebuffer(S.DRAW_FRAMEBUFFER,oa);for(let Ze=0;Ze<_e;Ze++)zt?S.framebufferTextureLayer(S.READ_FRAMEBUFFER,S.COLOR_ATTACHMENT0,st.__webglTexture,L,De+Ze):S.framebufferTexture2D(S.READ_FRAMEBUFFER,S.COLOR_ATTACHMENT0,S.TEXTURE_2D,st.__webglTexture,L),Ke?S.framebufferTextureLayer(S.DRAW_FRAMEBUFFER,S.COLOR_ATTACHMENT0,yt.__webglTexture,le,ot+Ze):S.framebufferTexture2D(S.DRAW_FRAMEBUFFER,S.COLOR_ATTACHMENT0,S.TEXTURE_2D,yt.__webglTexture,le),L!==0?S.blitFramebuffer(Se,Pe,me,se,Ee,ze,me,se,S.COLOR_BUFFER_BIT,S.NEAREST):Ke?S.copyTexSubImage3D(pe,le,Ee,ze,ot+Ze,Se,Pe,me,se):S.copyTexSubImage2D(pe,le,Ee,ze,Se,Pe,me,se);ae.bindFramebuffer(S.READ_FRAMEBUFFER,null),ae.bindFramebuffer(S.DRAW_FRAMEBUFFER,null)}else Ke?o.isDataTexture||o.isData3DTexture?S.texSubImage3D(pe,le,Ee,ze,ot,me,se,_e,Xe,ut,rt.data):x.isCompressedArrayTexture?S.compressedTexSubImage3D(pe,le,Ee,ze,ot,me,se,_e,Xe,rt.data):S.texSubImage3D(pe,le,Ee,ze,ot,me,se,_e,Xe,ut,rt):o.isDataTexture?S.texSubImage2D(S.TEXTURE_2D,le,Ee,ze,me,se,Xe,ut,rt.data):o.isCompressedTexture?S.compressedTexSubImage2D(S.TEXTURE_2D,le,Ee,ze,rt.width,rt.height,Xe,rt.data):S.texSubImage2D(S.TEXTURE_2D,le,Ee,ze,me,se,Xe,ut,rt);ae.pixelStorei(S.UNPACK_ROW_LENGTH,gt),ae.pixelStorei(S.UNPACK_IMAGE_HEIGHT,Be),ae.pixelStorei(S.UNPACK_SKIP_PIXELS,Et),ae.pixelStorei(S.UNPACK_SKIP_ROWS,Mt),ae.pixelStorei(S.UNPACK_SKIP_IMAGES,Nt),le===0&&x.generateMipmaps&&S.generateMipmap(pe),ae.unbindTexture()},this.initRenderTarget=function(o){f.get(o).__webglFramebuffer===void 0&&r.setupRenderTarget(o)},this.initTexture=function(o){o.isCubeTexture?r.setTextureCube(o,0):o.isData3DTexture?r.setTexture3D(o,0):o.isDataArrayTexture||o.isCompressedArrayTexture?r.setTexture2DArray(o,0):r.setTexture2D(o,0),ae.unbindTexture()},this.resetState=function(){$=0,Y=0,N=null,ae.reset(),ee.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return er}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;let t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(n),t.unpackColorSpace=nt._getUnpackColorSpace()}};export{Nr as ACESFilmicToneMapping,nn as AddEquation,_a as AddOperation,Sd as AdditiveAnimationBlendMode,xi as AdditiveBlending,Ir as AgXToneMapping,go as AlphaFormat,co as AlwaysCompare,qa as AlwaysDepth,Ed as AlwaysStencilFunc,xd as AmbientLight,Md as AnimationAction,Td as AnimationClip,Ad as AnimationLoader,Rd as AnimationMixer,bd as AnimationObjectGroup,Cd as AnimationUtils,Pd as ArcCurve,xo as ArrayCamera,Ld as ArrowHelper,Ud as AttachedBindMode,Dd as Audio,wd as AudioAnalyser,Id as AudioContext,Nd as AudioListener,yd as AudioLoader,Fd as AxesHelper,St as BackSide,Od as BasicDepthPacking,Bd as BasicShadowMap,Gd as BatchedMesh,Hd as BezierInterpolant,Vd as Bone,kd as BooleanKeyframeTrack,Wd as Box2,zd as Box3,Xd as Box3Helper,ii as BoxGeometry,Kd as BoxHelper,vn as BufferAttribute,Rn as BufferGeometry,Yd as BufferGeometryLoader,mo as ByteType,qd as Cache,Zd as Camera,$d as CameraHelper,Qd as CanvasTexture,Jd as CapsuleGeometry,jd as CatmullRomCurve3,yr as CineonToneMapping,eu as CircleGeometry,Yn as ClampToEdgeWrapping,tu as Clock,je as Color,nu as ColorKeyframeTrack,nt as ColorManagement,iu as Compatibility,ru as CompressedArrayTexture,au as CompressedCubeTexture,ou as CompressedTexture,su as CompressedTextureLoader,lu as ConeGeometry,La as ConstantAlphaFactor,Da as ConstantColorFactor,cu as Controls,ca as CubeCamera,Ra as CubeDepthTexture,cn as CubeReflectionMapping,Jt as CubeRefractionMapping,Lr as CubeTexture,fu as CubeTextureLoader,An as CubeUVReflectionMapping,du as CubicBezierCurve,uu as CubicBezierCurve3,pu as CubicInterpolant,vi as CullFaceBack,Qa as CullFaceFront,hu as CullFaceFrontBack,$a as CullFaceNone,mu as Curve,_u as CurvePath,Ja as CustomBlending,Dr as CustomToneMapping,gu as CylinderGeometry,vu as Cylindrical,ha as Data3DTexture,Ur as DataArrayTexture,To as DataTexture,Su as DataTextureLoader,Eu as DataUtils,xu as DecrementStencilOp,Mu as DecrementWrapStencilOp,Tu as DefaultLoadingManager,en as DepthFormat,Zt as DepthStencilFormat,fn as DepthTexture,Au as DetachedBindMode,Ru as DirectionalLight,bu as DirectionalLightHelper,Cu as DiscreteInterpolant,Pu as DodecahedronGeometry,Lt as DoubleSide,Fa as DstAlphaFactor,Oa as DstColorFactor,Lu as DynamicCopyUsage,Uu as DynamicDrawUsage,Du as DynamicReadUsage,wu as EdgesGeometry,Iu as EllipseCurve,so as EqualCompare,Ka as EqualDepth,Nu as EqualStencilFunc,Un as EquirectangularReflectionMapping,Dn as EquirectangularRefractionMapping,yu as Euler,Eo as EventDispatcher,Xr as ExternalTexture,Fu as ExtrudeGeometry,Ou as FileLoader,Bu as Float16BufferAttribute,hi as Float32BufferAttribute,Ot as FloatType,Gu as Fog,Hu as FogExp2,Vu as FramebufferTexture,ln as FrontSide,Gr as Frustum,ku as FrustumArray,Wu as GLBufferAttribute,zu as GLSL1,mi as GLSL3,oo as GreaterCompare,za as GreaterDepth,ri as GreaterEqualCompare,Xa as GreaterEqualDepth,Xu as GreaterEqualStencilFunc,Ku as GreaterStencilFunc,Yu as GridHelper,qu as Group,Zu as HTMLTexture,Gt as HalfFloatType,$u as HemisphereLight,Qu as HemisphereLightHelper,Ju as IcosahedronGeometry,ju as ImageBitmapLoader,ep as ImageLoader,tp as ImageUtils,np as IncrementStencilOp,ip as IncrementWrapStencilOp,rp as InstancedBufferAttribute,ap as InstancedBufferGeometry,op as InstancedInterleavedBuffer,sp as InstancedMesh,lp as Int16BufferAttribute,cp as Int32BufferAttribute,fp as Int8BufferAttribute,br as IntType,dp as InterleavedBuffer,up as InterleavedBufferAttribute,pp as Interpolant,hp as InterpolateBezier,mp as InterpolateDiscrete,_p as InterpolateLinear,gp as InterpolateSmooth,vp as InterpolationSamplingMode,Sp as InterpolationSamplingType,Ep as InvertStencilOp,xp as KeepStencilOp,Mp as KeyframeTrack,Tp as LOD,Ap as LatheGeometry,xa as Layers,lo as LessCompare,Ya as LessDepth,ai as LessEqualCompare,gi as LessEqualDepth,Rp as LessEqualStencilFunc,bp as LessStencilFunc,Cp as Light,Pp as LightProbe,Lp as Line,Up as Line3,Dp as LineBasicMaterial,wp as LineCurve,Ip as LineCurve3,Np as LineDashedMaterial,yp as LineLoop,Fp as LineSegments,vt as LinearFilter,Op as LinearInterpolant,Bp as LinearMipMapLinearFilter,Gp as LinearMipMapNearestFilter,qt as LinearMipmapLinearFilter,wn as LinearMipmapNearestFilter,Pr as LinearSRGBColorSpace,Or as LinearToneMapping,Br as LinearTransfer,Hp as Loader,Vp as LoaderUtils,kp as LoadingManager,Wp as LoopOnce,zp as LoopPingPong,Xp as LoopRepeat,Kp as MOUSE,Yp as Material,qp as MaterialBlending,Zp as MaterialLoader,$p as MathUtils,Qp as Matrix2,Oe as Matrix3,Qt as Matrix4,to as MaxEquation,wt as Mesh,la as MeshBasicMaterial,Ma as MeshDepthMaterial,Ta as MeshDistanceMaterial,Jp as MeshLambertMaterial,jp as MeshMatcapMaterial,eh as MeshNormalMaterial,th as MeshPhongMaterial,nh as MeshPhysicalMaterial,ih as MeshStandardMaterial,rh as MeshToonMaterial,eo as MinEquation,no as MirroredRepeatWrapping,ga as MixOperation,Si as MultiplyBlending,va as MultiplyOperation,kt as NearestFilter,ah as NearestMipMapLinearFilter,oh as NearestMipMapNearestFilter,hn as NearestMipmapLinearFilter,ro as NearestMipmapNearestFilter,wr as NeutralToneMapping,fo as NeverCompare,Za as NeverDepth,sh as NeverStencilFunc,Dt as NoBlending,Yt as NoColorSpace,lh as NoNormalPacking,bt as NoToneMapping,ch as NormalAnimationBlendMode,En as NormalBlending,fh as NormalGAPacking,dh as NormalRGPacking,ao as NotEqualCompare,Wa as NotEqualDepth,uh as NotEqualStencilFunc,ph as NumberKeyframeTrack,hh as Object3D,mh as ObjectLoader,Ea as ObjectSpaceNormalMap,_h as OctahedronGeometry,Va as OneFactor,Pa as OneMinusConstantAlphaFactor,Ua as OneMinusConstantColorFactor,wa as OneMinusDstAlphaFactor,Ia as OneMinusDstColorFactor,Na as OneMinusSrcAlphaFactor,ya as OneMinusSrcColorFactor,Cr as OrthographicCamera,Sn as PCFShadowMap,Aa as PCFSoftShadowMap,Mn as PMREMGenerator,gh as Path,gn as PerspectiveCamera,sa as Plane,Ar as PlaneGeometry,vh as PlaneHelper,Sh as PointLight,Eh as PointLightHelper,xh as Points,Mh as PointsMaterial,Th as PolarGridHelper,Ah as PolyhedronGeometry,Rh as PositionalAudio,bh as PropertyBinding,Ch as PropertyMixer,Ph as QuadraticBezierCurve,Lh as QuadraticBezierCurve3,Uh as Quaternion,Dh as QuaternionKeyframeTrack,wh as QuaternionLinearInterpolant,Ui as R11_EAC_Format,Kn as RED_GREEN_RGTC2_Format,$i as RED_RGTC1_Format,bo as REVISION,Xn as RG11_EAC_Format,Ih as RGBADepthPacking,Ut as RGBAFormat,zr as RGBAIntegerFormat,zi as RGBA_ASTC_10x10_Format,Vi as RGBA_ASTC_10x5_Format,ki as RGBA_ASTC_10x6_Format,Wi as RGBA_ASTC_10x8_Format,Xi as RGBA_ASTC_12x10_Format,Ki as RGBA_ASTC_12x12_Format,Ii as RGBA_ASTC_4x4_Format,Ni as RGBA_ASTC_5x4_Format,yi as RGBA_ASTC_5x5_Format,Fi as RGBA_ASTC_6x5_Format,Oi as RGBA_ASTC_6x6_Format,Bi as RGBA_ASTC_8x5_Format,Gi as RGBA_ASTC_8x6_Format,Hi as RGBA_ASTC_8x8_Format,Yi as RGBA_BPTC_Format,Li as RGBA_ETC2_EAC_Format,bi as RGBA_PVRTC_2BPPV1_Format,Ri as RGBA_PVRTC_4BPPV1_Format,Nn as RGBA_S3TC_DXT1_Format,yn as RGBA_S3TC_DXT3_Format,Fn as RGBA_S3TC_DXT5_Format,Nh as RGBDepthPacking,vo as RGBFormat,yh as RGBIntegerFormat,qi as RGB_BPTC_SIGNED_Format,Zi as RGB_BPTC_UNSIGNED_Format,Ci as RGB_ETC1_Format,Pi as RGB_ETC2_Format,Ai as RGB_PVRTC_2BPPV1_Format,Ti as RGB_PVRTC_4BPPV1_Format,In as RGB_S3TC_DXT1_Format,Fh as RGDepthPacking,jt as RGFormat,Wr as RGIntegerFormat,pa as RawShaderMaterial,Oh as Ray,Bh as Raycaster,Gh as RectAreaLight,So as RedFormat,kr as RedIntegerFormat,Fr as ReinhardToneMapping,Hh as RenderTarget,Vh as RenderTarget3D,io as RepeatWrapping,kh as ReplaceStencilOp,ba as ReverseSubtractEquation,Wh as RingGeometry,Di as SIGNED_R11_EAC_Format,Ji as SIGNED_RED_GREEN_RGTC2_Format,Qi as SIGNED_RED_RGTC1_Format,wi as SIGNED_RG11_EAC_Format,Ro as SRGBColorSpace,$e as SRGBTransfer,zh as Scene,Ue as ShaderChunk,At as ShaderLib,It as ShaderMaterial,Xh as ShadowMaterial,Kh as Shape,Yh as ShapeGeometry,qh as ShapePath,Zh as ShapeUtils,_o as ShortType,$h as Skeleton,Qh as SkeletonHelper,Jh as SkinnedMesh,jh as Source,em as Sphere,tm as SphereGeometry,nm as Spherical,im as SphericalHarmonics3,rm as SplineCurve,am as SpotLight,om as SpotLightHelper,sm as Sprite,lm as SpriteMaterial,Ga as SrcAlphaFactor,Ba as SrcAlphaSaturateFactor,Ha as SrcColorFactor,cm as StaticCopyUsage,fm as StaticDrawUsage,dm as StaticReadUsage,um as StereoCamera,pm as StreamCopyUsage,hm as StreamDrawUsage,mm as StreamReadUsage,_m as StringKeyframeTrack,Ca as SubtractEquation,Ei as SubtractiveBlending,gm as TOUCH,_i as TangentSpaceNormalMap,vm as TetrahedronGeometry,ma as Texture,Sm as TextureLoader,Em as TextureUtils,xm as Timer,Mm as TimestampQuery,Tm as TorusGeometry,Am as TorusKnotGeometry,Rm as Triangle,bm as TriangleFanDrawMode,Cm as TriangleStripDrawMode,Pm as TrianglesDrawMode,Lm as TubeGeometry,Um as UVMapping,ua as Uint16BufferAttribute,da as Uint32BufferAttribute,Dm as Uint8BufferAttribute,wm as Uint8ClampedBufferAttribute,Im as Uniform,Nm as UniformsGroup,oe as UniformsLib,Sa as UniformsUtils,Rt as UnsignedByteType,ho as UnsignedInt101111Type,dn as UnsignedInt248Type,po as UnsignedInt5999Type,Wt as UnsignedIntType,Hr as UnsignedShort4444Type,Vr as UnsignedShort5551Type,xn as UnsignedShortType,on as VSMShadowMap,mt as Vector2,Fe as Vector3,ht as Vector4,ym as VectorKeyframeTrack,Fm as VideoFrameTexture,Om as VideoTexture,Bm as WebGL3DRenderTarget,Gm as WebGLArrayRenderTarget,er as WebGLCoordinateSystem,Tn as WebGLCubeRenderTarget,Ct as WebGLRenderTarget,Tr as WebGLRenderer,ld as WebGLUtils,Hm as WebGPUCoordinateSystem,On as WebXRController,Vm as WireframeGeometry,km as WrapAroundEnding,Wm as ZeroCurvatureEnding,ka as ZeroFactor,zm as ZeroSlopeEnding,Xm as ZeroStencilOp,Ao as createCanvasElement,Qe as error,Km as getConsoleFunction,ji as log,Ym as setConsoleFunction,He as warn,fa as warnOnce};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=three.mjs.map