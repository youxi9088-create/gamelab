/* esm.sh - three@0.185.1/examples/jsm/objects/Lensflare */
import{AdditiveBlending as X,Box2 as Y,BufferGeometry as k,Color as R,FramebufferTexture as I,InterleavedBuffer as q,InterleavedBufferAttribute as _,Mesh as V,MeshBasicMaterial as J,RawShaderMaterial as D,UnsignedByteType as G,Vector2 as S,Vector3 as B,Vector4 as K}from"./002-three.js";var z=class n extends V{constructor(){super(n.Geometry,new J({opacity:0,transparent:!0})),this.isLensflare=!0,this.type="Lensflare",this.frustumCulled=!1,this.renderOrder=1/0;let i=new B,o=new B,s=new I(16,16),r=new I(16,16),T=G,l=n.Geometry,d=new D({uniforms:{scale:{value:null},screenPosition:{value:null}},vertexShader:`

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;

				void main() {

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`,fragmentShader:`

				precision highp float;

				void main() {

					gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );

				}`,depthTest:!0,depthWrite:!1,transparent:!1}),x=new D({uniforms:{map:{value:s},scale:{value:null},screenPosition:{value:null}},vertexShader:`

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;
				attribute vec2 uv;

				varying vec2 vUV;

				void main() {

					vUV = uv;

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`,fragmentShader:`

				precision highp float;

				uniform sampler2D map;

				varying vec2 vUV;

				void main() {

					gl_FragColor = texture2D( map, vUV );

				}`,depthTest:!1,depthWrite:!1,transparent:!1}),U=new V(l,d),a=[],g=h.Shader,c=new D({name:g.name,uniforms:{map:{value:null},occlusionMap:{value:r},color:{value:new R(16777215)},scale:{value:new S},screenPosition:{value:new B}},vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,blending:X,transparent:!0,depthWrite:!1}),j=new V(l,c);this.addElement=function(t){a.push(t)};let w=new S,u=new S,b=new Y,e=new K;this.onBeforeRender=function(t,A,v){t.getCurrentViewport(e);let F=t.getRenderTarget(),P=F!==null?F.texture.type:G;T!==P&&(s.dispose(),r.dispose(),s.type=r.type=P,T=P);let E=e.w/e.z,C=e.z/2,W=e.w/2,p=16/e.w;if(w.set(p*E,p),b.min.set(e.x,e.y),b.max.set(e.x+(e.z-16),e.y+(e.w-16)),o.setFromMatrixPosition(this.matrixWorld),o.applyMatrix4(v.matrixWorldInverse),!(o.z>0)&&(i.copy(o).applyMatrix4(v.projectionMatrix),u.x=e.x+i.x*C+C-8,u.y=e.y+i.y*W+W-8,b.containsPoint(u))){t.copyFramebufferToTexture(s,u);let f=d.uniforms;f.scale.value=w,f.screenPosition.value=i,t.renderBufferDirect(v,null,l,d,U,null),t.copyFramebufferToTexture(r,u),f=x.uniforms,f.scale.value=w,f.screenPosition.value=i,t.renderBufferDirect(v,null,l,x,U,null);let H=-i.x*2,L=-i.y*2;for(let M=0,N=a.length;M<N;M++){let m=a[M],y=c.uniforms;y.color.value.copy(m.color),y.map.value=m.texture,y.screenPosition.value.x=i.x+H*m.distance,y.screenPosition.value.y=i.y+L*m.distance,p=m.size/e.w;let O=e.w/e.z;y.scale.value.set(p*O,p),c.uniformsNeedUpdate=!0,t.renderBufferDirect(v,null,l,c,j,null)}}},this.dispose=function(){d.dispose(),x.dispose(),c.dispose(),s.dispose(),r.dispose();for(let t=0,A=a.length;t<A;t++)a[t].texture.dispose()}}},h=class{constructor(i,o=1,s=0,r=new R(16777215)){this.texture=i,this.size=o,this.distance=s,this.color=r}};h.Shader={name:"LensflareElementShader",uniforms:{map:{value:null},occlusionMap:{value:null},color:{value:null},scale:{value:null},screenPosition:{value:null}},vertexShader:`

		precision highp float;

		uniform vec3 screenPosition;
		uniform vec2 scale;

		uniform sampler2D occlusionMap;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUV;
		varying float vVisibility;

		void main() {

			vUV = uv;

			vec2 pos = position.xy;

			vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );

			vVisibility =        visibility.r / 9.0;
			vVisibility *= 1.0 - visibility.g / 9.0;
			vVisibility *=       visibility.b / 9.0;

			gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D map;
		uniform vec3 color;

		varying vec2 vUV;
		varying float vVisibility;

		void main() {

			vec4 texture = texture2D( map, vUV );
			texture.a *= vVisibility;
			gl_FragColor = texture;
			gl_FragColor.rgb *= color;

		}`};z.Geometry=(function(){let n=new k,i=new Float32Array([-1,-1,0,0,0,1,-1,0,1,0,1,1,0,1,1,-1,1,0,0,1]),o=new q(i,5);return n.setIndex([0,1,2,0,2,3]),n.setAttribute("position",new _(o,3,0,!1)),n.setAttribute("uv",new _(o,2,3,!1)),n})();export{z as Lensflare,h as LensflareElement};
//# sourceMappingURL=Lensflare.mjs.map