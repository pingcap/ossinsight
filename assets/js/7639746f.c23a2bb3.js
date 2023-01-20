"use strict";(self.webpackChunkweb=self.webpackChunkweb||[]).push([[2374],{6068:(e,t,n)=>{n.d(t,{vz:()=>r,A3:()=>Z,if:()=>v,uc:()=>c,y:()=>C});var a=n(67294),o=n(60338);function r(e){let{seriesName:t="Count",data:n,loading:r=!1,clear:l=!1,size:i,n:c,deps:s=[],categoryIndex:u,valueIndex:d,type:m="repo"}=e;i="lang"===m?48:i;const g=(0,a.useMemo)((()=>({tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},grid:{containLabel:!0,left:(l?0:8)+("owner"===m?24:0),top:l?0:16,bottom:l?0:16},xAxis:{type:"value",position:"top"},yAxis:{type:"category",data:n.map((e=>e[u])),inverse:!0,axisLabel:{rotate:0,formatter:function(e,t){switch(m){case"repo":default:return e;case"owner":case"lang":return`${e} {${e.replace(/[+-[\]]/g,"_")}|}`}},rich:(()=>{switch(m){case"owner":return n.reduce(((e,t)=>{var n;return e[String(t[u]).replace(/[-[\]]/g,"_")]={backgroundColor:{image:(n=`${t[u]}`,n.includes("[bot]")?"https://github.com/github.png":`https://github.com/${n}.png`)},width:24,height:24},e}),{});case"lang":return n.reduce(((e,t)=>(e[String(t[u]).replace(/\+/g,"_")]={backgroundColor:{image:`/img/lang/${t[u]}.png`},width:48,height:48},e)),{})}})()}},series:[{name:t,data:n.map((e=>e[d])),type:"bar",barWidth:l?i/2:i}]})),[n,...s,u,d,i,l]),p=(0,a.useMemo)((()=>r?400:Math.max(Math.min(c,n.length),5)*(i*(l?1:1.5))),[i,r,l]),h=(0,a.useMemo)((()=>({click:e=>{("repo"===m&&"name"in e||"owner"===m&&"name"in e)&&window.open(`https://github.com/${e.name}`)}})),[]);return a.createElement(o.ZP,{height:p,showLoading:r,option:g,notMerge:!1,lazyUpdate:!0,style:{marginBottom:16,borderRadius:"var(--ifm-global-radius)"},onEvents:h})}var l=n(55673),i=n(61802);function c(e){let{seriesName:t,loading:n,data:r,compareData:c,categoryIndex:s,valueIndex:u,deps:d=[]}=e;const m=function(e){return(0,a.useMemo)((()=>({type:"pie",radius:["35%","65%"],avoidLabelOverlap:!1,itemStyle:{borderColor:e?"#1e1e1f":"#ffffff",borderWidth:0},label:{show:!1,position:"center",formatter:"{b}: {d}%"},emphasis:{label:{show:!0,fontSize:"20",fontWeight:"bold",formatter:"{b}\n\n{c}"}},labelLine:{show:!1}})),[e])}((0,l.e)()),g=(0,a.useMemo)((()=>{const e=[],n={...m,name:t,data:r.map((e=>{const t=e[s];return{value:e[u],name:t}}))};if(e.push(n),(0,i.nf)(c)){n.center=["25%","55%"];const a={...m,name:t,center:["65%","55%"],data:c.map((e=>{const t=e[s];return{value:e[u],name:t}}))};e.push(a)}return e}),[m,r,c,...d,s,u]),p=(0,a.useMemo)((()=>({tooltip:Object.assign({trigger:"item"}),legend:{type:"scroll",orient:"vertical",right:"20px",top:20,bottom:20,x:"right",formatter:"{name}"},series:g,grid:{left:16,top:16,bottom:16,right:16,containLabel:!0}})),[g]);return a.createElement(o.ZP,{aspectRatio:16/9,showLoading:n,option:p,notMerge:!1,lazyUpdate:!0})}var s=n(91262),u=n(58316),d=n(53442),m=n(62097),g=n(61225),p=n(61953),h=n(55343),f=n(31538);const E=[];for(let A=-12;A<=13;A++)E.push(A);const y=["0h","1h","2h","3h","4h","5h","6h","7h","8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h","21h","22h","23h"],b=["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];function v(e){let{loading:t,data:n,xAxisColumnName:r,yAxisColumnName:l,valueColumnName:i,deps:c}=e;const v=(0,m.Z)(),x=(0,g.Z)(v.breakpoints.down("sm")),[w,S]=(0,a.useState)(0),Z=(0,a.useCallback)((e=>{S(e.target.value)}),[S]),{data:I,min:C,max:A}=(0,a.useMemo)((()=>{let e=Number.MAX_VALUE,t=Number.MIN_VALUE;const a=n.map((n=>{const a=Number(n[i]);return a>t&&(t=a),a<e&&(e=a),[(n[r]+w+24)%24,n[l],a]}));return{data:a,min:e,max:t}}),[n,w,x]),k=(0,a.useMemo)((()=>({tooltip:{show:!0},grid:x?{top:"0",bottom:"0",left:"0",right:"0",containLabel:!0}:{top:"0",bottom:"16%",left:"0",right:"0",containLabel:!0},xAxis:{type:"category",data:y,splitArea:{show:!0},nameLocation:"middle",nameGap:50,nameTextStyle:{fontSize:13,fontWeight:"bold",color:"#959aa9"},axisLabel:{color:"#959aa9",fontWeight:"bold"},inverse:!1},yAxis:{type:"category",data:b,splitArea:{show:!0},nameLocation:"middle",nameGap:50,nameTextStyle:{fontSize:13,fontWeight:"bold",color:"#959aa9"},axisLabel:{color:"#959aa9",fontWeight:"bold",rotate:0,fontSize:x?8:void 0},position:"top"},visualMap:{show:!x,min:C,max:A,orient:x?void 0:"horizontal",left:"center",bottom:0},series:{type:"heatmap",data:I,label:{show:!1},emphasis:{itemStyle:{shadowBlur:10,shadowColor:"rgba(0, 0, 0, 0.5)"}}}})),[I,x,...c]);return a.createElement(s.Z,null,(()=>a.createElement(p.Z,null,a.createElement(p.Z,{sx:{minWidth:120,mb:1}},a.createElement(h.Z,{size:"small"},a.createElement(u.Z,{id:"zone-select-label"},"Timezone (UTC)"),a.createElement(d.Z,{labelId:"zone-select-label",id:"zone-select",value:w,label:"Timezone (UTC)",onChange:Z,sx:{minWidth:120},variant:"standard"},E.map((e=>a.createElement(f.Z,{key:e,value:e},e>0?`+${e}`:e)))))),a.createElement(o.ZP,{aspectRatio:2.4,showLoading:t,option:k,notMerge:!1,lazyUpdate:!0}))))}var x=n(14850),w=n(34673),S=n(91655);function Z(e){let{sql:t,children:n}=e;return a.createElement(a.Fragment,null,a.createElement(w.Z,{summary:a.createElement("summary",null,"Click here to expand SQL")},(e=>{let t;return t=e?a.createElement(x.Z,{className:"language-sql"},e):a.createElement(p.Z,{sx:{pt:.5}},a.createElement(S.Z,{width:"80%"}),a.createElement(S.Z,{width:"50%"}),a.createElement(S.Z,{width:"70%"})),t})(t)),n)}var I=n(30454);function C(e){void 0===e&&(e=!0);const t="#E9EAEE",n="#2c2c2c",a="#3c3c3c",o=function(){return{axisLine:{lineStyle:{color:a}},axisTick:{lineStyle:{color:a}},axisLabel:{color:"#ccc"},splitLine:{lineStyle:{type:"dashed",color:"#2c2c2c",width:.5}},splitArea:{areaStyle:{color:t}},axisPointer:{label:{backgroundColor:n}},nameTextStyle:{fontStyle:"italic",color:"gray"}}},r=["#dd6b66","#759aa0","#e69d87","#8dc1a9","#ea7e53","#eedd78","#73a373","#73b9bc","#7289ab","#91ca8c","#f49f42"],l={color:r,backgroundColor:"rgba(24, 25, 26)",tooltip:{backgroundColor:n,textStyle:{color:t},borderWidth:0,shadowBlur:8,shadowColor:"rgba(0, 0, 0, 0.618)",shadowOffsetX:0,shadowOffsetY:0,axisPointer:{lineStyle:{color:t},crossStyle:{color:t}},renderMode:"html"},grid:{containLabel:!0},legend:{textStyle:{color:t}},textStyle:{color:t},title:{left:"center",top:8,textStyle:{color:t,fontSize:14,align:"center"}},toolbox:{iconStyle:{borderColor:t}},dataZoom:{textStyle:{color:t}},timeline:{lineStyle:{color:t},itemStyle:{color:r[1]},label:{color:t},controlStyle:{color:t,borderColor:t}},timeAxis:o(),logAxis:o(),valueAxis:o(),categoryAxis:o(),line:{symbol:"circle"},graph:{color:r},gauge:{title:{textStyle:{color:t}}},candlestick:{itemStyle:{color:"#FD1050",color0:"#0CF49B",borderColor:"#FD1050",borderColor0:"#0CF49B"}},visualMap:{textStyle:{color:t}}};l.categoryAxis.splitLine.show=!1,(0,I.aW)("dark",l)}},74601:(e,t,n)=>{n.d(t,{O:()=>l,S:()=>r});var a=n(61802);let o;function r(e){o=e}function l(){if((0,a.Rw)(o))throw new Error("out of analyze chart context!");return o}},37031:(e,t,n)=>{n.d(t,{dC:()=>o,gx:()=>u,pW:()=>r,up:()=>c,wN:()=>l,yv:()=>i});var a=n(26667);const o="original",r="comparing";function l(e,t){return s(o,e,t)}function i(e,t){return s(r,e,t)}function c(e){return(0,a.XK)((t=>{let{datasetId:n,data:a}=t;return[s(n,a,e)]}))}function s(e,t,n){var a;const o=(null==t||null==(a=t.data)?void 0:a.data)??[];return{id:e,source:null!=n?n(o):o}}function u(e,t,n){return void 0===e&&(e=o),void 0===n&&(n=void 0),{id:e,source:t,dimensions:n}}},75559:(e,t,n)=>{n.d(t,{pW:()=>o.pW,n4:()=>C,Kb:()=>r,rs:()=>i,AH:()=>v,yv:()=>o.yv,vy:()=>P,gx:()=>o.gx,bh:()=>S,Sd:()=>c,BZ:()=>A,CI:()=>G,j3:()=>T,jv:()=>l,JJ:()=>x,wN:()=>o.wN,e5:()=>s,up:()=>o.up,BE:()=>I,TN:()=>N,wq:()=>R,P6:()=>a,E7:()=>b,Gn:()=>L,Mm:()=>M});var a={};n.r(a),n.d(a,{adjustAxis:()=>D,aggregate:()=>k.m_,debugPrintOption:()=>k.bR,min:()=>k.VV,simple:()=>k.lC,template:()=>k.XK});var o=n(37031);function r(e,t,n){return void 0===n&&(n={}),{name:String(t),datasetId:o.dC,...n,type:"bar",encode:{x:e,y:t,...n.encode}}}function l(e,t,n){return void 0===n&&(n={}),{name:String(t),datasetId:o.dC,showSymbol:!1,...n,type:"line",encode:{x:e,y:t,...n.encode}}}function i(e,t,n){return void 0===n&&(n={}),{datasetId:o.dC,...n,type:"boxplot",encode:{x:e,y:t,tooltip:t,...n.encode}}}function c(e,t,n,a){return void 0===a&&(a={}),{datasetId:o.dC,emphasis:{itemStyle:{shadowBlur:10,shadowColor:"rgba(0, 0, 0, 0.5)"}},...a,type:"heatmap",encode:{x:e,y:t,value:n,...a.encode}}}function s(e,t,n,a){void 0===a&&(a={});const o={coordinateSystem:"geo",encode:{lng:1,lat:2,value:3,tooltip:[0,3],itemId:0},symbolSize:e=>1+64*Math.sqrt(e[3]/n),...a};return[{type:"effectScatter",datasetId:`${e}_top_${t}`,...o},{type:"scatter",datasetId:`${e}_rest`,...o}]}var u=n(9996),d=n.n(u),m=n(31486),g=n.n(m),p=n(74601);function h(){const{isSmall:e}=(0,p.O)();return e}var f=n(30120),E=n(61802);function y(e,t){return t.includes(e)?e:void 0}function b(e,t){void 0===t&&(t={});const n=h();return d()(t,{id:e,type:"value",axisLabel:{formatter:e=>g()(e),margin:8},splitNumber:n?3:void 0,axisPointer:{label:{precision:0}},nameTextStyle:{opacity:n?0:1,align:y(t.position??"left",["left","right"])}})}function v(e,t){return void 0===t&&(t={}),d()(t,{id:e,type:"category",nameTextStyle:{align:y(t.position??"left",["left","right"])}})}function x(e,t){void 0===t&&(t={});const n=h();return d()(t,{id:e,type:"log",nameTextStyle:{opacity:n?0:1,align:y(t.position??"left",["left","right"])},splitNumber:n?3:void 0,axisLabel:{margin:8}})}const w=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],S=e=>{const t=new Date(e);return`${w[t.getMonth()]} ${t.getFullYear()}`},Z=new Date;function I(e,t,n){return void 0===t&&(t={}),void 0===n&&(n="event_month"),d()(t,{id:e,type:"time",axisPointer:{label:{formatter:e=>{let{value:t}=e;return S(t)}}},min:(0,E.N6)(n)?!0===n?void 0:f.ou.fromISO(k.VV(n)).minus({month:1}).toJSDate():new Date(2011,0,1,0,0,0,0),max:f.ou.fromJSDate(new Date(Z.getFullYear(),Z.getMonth(),1,0,0,0,0)).plus({month:1}).toJSDate(),minInterval:24192e5})}function C(e,t){return void 0===t&&(t={}),{...t,show:!0,trigger:"axis",axisPointer:{...t.axisPointer,type:e}}}function A(e){return void 0===e&&(e={}),{renderMode:"html",...e,show:!0,trigger:"item"}}var k=n(26667);function N(e,t){void 0===t&&(t={});const{context:n,isSmall:a,comparingRepoName:o}=(0,p.O)();if(a)return;if((0,E.N6)(n.layout)||!o)return e?[{...t,text:e}]:[];const{layout:r,layoutTop:l,layoutSubGridHeight:i,layoutGap:c}=n;return"top-bottom"===r?(0,k.XK)(((e,t)=>{let{name:n}=e;return{text:n,textStyle:{fontWeight:"normal",color:"gray"},left:"center",top:l+(i+c)*t-24}})).concat(e?[{...t,text:e}]:[]):(0,k.XK)(((e,t)=>{let{name:n}=e;return{text:n,textStyle:{fontWeight:"normal",color:"gray"},left:25+50*t+"%",top:8}})).concat(e?{...t,text:e}:[])}function P(e){return void 0===e&&(e=void 0),h()?{show:!1}:{show:!0,left:8,right:8,realtime:!0,xAxisId:(0,k.XK)((e=>{let{id:t}=e;return t})),...e}}function M(){return{roam:!1,map:"world",silent:!0,zoom:1.7,top:"35%",projection:{project:e=>[e[0]/180*Math.PI,-Math.log(Math.tan((Math.PI/2+e[1]/180*Math.PI)/2))],unproject:e=>[180*e[0]/Math.PI,360/Math.PI*Math.atan(Math.exp(e[1]))-90]},itemStyle:{color:"#ccc",borderWidth:1,borderColor:"#ccc"}}}function T(e){return void 0===e&&(e={}),h()?{left:"center",padding:[0,32],top:0,type:"scroll",...e,orient:"horizontal"}:{left:8,top:8,...e,show:!0}}function L(e,t){return{show:!h(),min:0,max:t,orient:"horizontal",left:"center",bottom:8}}function F(e,t){void 0===t&&(t={});const n=h();return{top:n?32:64,bottom:n?8:48,left:n?0:8,right:n?0:8,...t,id:e}}function R(){const{context:e,height:t,isSmall:n,comparingRepoName:a}=(0,p.O)();if(a){const a=32,o=n?32:64,r=n?8:48,l=(t-o-r-a)/2,i=r+l+a,c=o+l+a;return e.layout="top-bottom",e.layoutTop=o,e.layoutSubGridHeight=l,e.layoutGap=a,[F("main",{top:o,bottom:i}),F("vs",{top:c,bottom:r})]}return F("main")}function G(){const{context:e,comparingRepoName:t}=(0,p.O)();return t?(e.layout="left-right",[F("main",{left:"8",right:"52%",top:"64",bottom:"48"}),F("vs",{left:"52%",right:"8",top:"64",bottom:"48"})]):F("main")}var $=n(51252);function D(e,t){if(0===e.length)return t.map((()=>({min:0,max:0})));const n=t.map((t=>function(e,t){if(0!==e.length)return e.reduce(((e,n)=>{const a=[...e];for(const o of t){const e=n[o];a[0]=Math.min(e,a[0]),a[1]=Math.max(e,a[1])}return a}),[Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER])}(e,t))),a=n.reduce(((e,t)=>e||(0,E.nf)(t)&&t[1]>=0),!1),o=n.reduce(((e,t)=>e||(0,E.nf)(t)&&t[0]<=0),!1);if(!a||!o)return t.map((()=>({min:0,max:0})));let r=1/0;const l=[];for(const i of n)if((0,E.nf)(i)){const[e,t]=i;l.push(r);const n=Math.min(Math.abs(r-1));Math.max(t/-e-1)<n&&(r=t/-e)}else l.push(void 0);return n.map((e=>{if(e){const[t,n]=e;return{min:(0,$.r)(Math.min(t,-n/r)),max:(0,$.r)(Math.max(n,-t*r))}}return{min:0,max:0}}))}},26667:(e,t,n)=>{n.d(t,{VV:()=>s,XK:()=>l,bR:()=>u,lC:()=>i,m_:()=>c});var a=n(74601),o=n(37031),r=n(61802);function l(e){const{repoName:t,comparingRepoName:n,repoInfo:r,comparingRepoInfo:l,data:i,compareData:c,context:s}=(0,a.O)();let u=[];return u=u.concat(e({id:"main",datasetId:o.dC,repoInfo:r,data:i,name:t,context:s},0)),n&&(u=u.concat(e({id:"vs",datasetId:o.pW,repoInfo:l,data:c,name:n,context:s},1))),u}function i(e,t){const{comparingRepoName:n}=(0,a.O)();return n?t:e}function c(e){const{data:t,repoName:n,compareData:o,comparingRepoName:l}=(0,a.O)(),i=[],c=[];return(0,r.nf)(t)&&(i.push(t),c.push(n)),(0,r.nf)(o)&&(i.push(o),c.push(l)),e(i,c)}function s(e){const t=c((t=>t.flatMap((t=>{var n,a,o;return(null==(n=t.data)||null==(a=n.data)||null==(o=a[0])?void 0:o[e])??[]}))));return t.length>=2?t[0]<t[1]?t[0]:t[1]:1===t.length?t[0]:void 0}function u(){const{context:e}=(0,a.O)();e.DEBUG_PRINT_OPTION=!0}},51252:(e,t,n)=>{function a(e){if(0===e)return 0;const t=Math.sign(e),n=Math.abs(e);let a=1;for(;n>a;)a*=10;return a/=20,(Math.floor(n/a)+1)*a*t}n.d(t,{r:()=>a})},4882:(e,t,n)=>{n.d(t,{P:()=>s,c:()=>u});var a=n(67294),o=n(68971),r=n(8100),l=n(26432),i=n(90031),c=n(61802);function s(e){const[t,n]=(0,a.useState)(e),[o,r]=(0,a.useState)(!1),[i,c]=(0,a.useState)(),s=(0,l.Z)((function(e,t){void 0===t&&(t=!1),t&&n(void 0),r(!0),c(void 0),e.then(n,c).finally((()=>{r(!1)}))})),u=(0,l.Z)((()=>{n(void 0),r(!1),c(i)}));return{data:t,loading:o,error:i,setAsyncData:s,clearState:u}}function u(e,t,n){const{isAuthenticated:s,login:u,getAccessTokenSilently:d}=(0,i.g)(),m=(0,o.Pd)(),[g,p]=(0,a.useState)(!1),[h,f]=(0,a.useState)(),[E,y]=(0,a.useState)(),b=(0,a.useRef)(e),v=(0,a.useRef)(t),x=(0,a.useRef)(!1);(0,a.useEffect)((()=>{b.current=e,v.current=t,p(!1),f(void 0),y(void 0),x.current=!1}),[t,(0,r.wE)([e])]);const w=(0,l.Z)((async()=>{if((0,c.GC)(n)&&!s)return void await u({triggerBy:n});if(x.current)return;const e=await d();p(!0),y(void 0),f(void 0),x.current=!0,v.current({...b.current,accessToken:e}).then(m(y)).catch(m(f)).finally(m((()=>{p(!1),x.current=!1})))})),S=(0,l.Z)((()=>{y(void 0),p(!1),f(void 0)})),Z=(0,l.Z)((e=>{y(e),p(!1),f(void 0)}));return{data:E,loading:g,error:h,run:w,clear:S,setData:Z}}},2108:(e,t,n)=>{n.d(t,{ON:()=>i,Rc:()=>c,ZP:()=>l,io:()=>s});var a=n(67294),o=n(61802),r=n(16550);const l="undefined"==typeof window?function(e,t){let{defaultValue:n}=t;return[...(0,a.useState)(n)]}:function(e,t,n){let{defaultValue:l,deserialize:i,serialize:c}=t;void 0===n&&(n=!1);const s=(0,r.k6)(),u=(0,r.TH)(),d=(0,a.useMemo)((()=>{const t=new URLSearchParams(u.search).get(e);return(0,o.nf)(t)?i(t):l}),[]),[m,g]=(0,a.useState)(d),p=(0,a.useRef)(!0),h=(0,a.useRef)(!1);return(0,a.useEffect)((()=>{p.current=!1}),[]),(0,a.useEffect)((()=>{if(h.current)return void(h.current=!1);const t=c(m),a=new URLSearchParams(u.search);if((0,o.Rw)(t)){if(!a.has(e))return;a.delete(e)}else{if(a.get(e)===t)return;a.set(e,t)}const r=a.toString(),l=r?`?${r}`:"",i=u.hash?`${u.hash}`:"",d=u.pathname+l+i;n?s.push(d):(s.replace(d),window.history.replaceState(null,"",d))}),[m]),(0,a.useEffect)((()=>{const t=new URLSearchParams(u.search).get(e);(0,o.nf)(t)?g(i(t)):g(l)}),[u]),[m,g]};function i(e){return{defaultValue:e,serialize:e=>e,deserialize:e=>e}}function c(e){return{defaultValue:e,serialize:e=>(0,o.GC)(e)?e:void 0,deserialize:e=>(0,o.GC)(e)?e:void 0}}function s(e){return void 0===e&&(e="true"),{defaultValue:()=>!1,serialize:t=>(0,o.N6)(t)?e:void 0,deserialize:t=>Boolean(t===e)}}},74446:(e,t,n)=>{n.d(t,{b:()=>i,$:()=>l});const a=JSON.parse('[{"code":"MQ","lat":14.60426,"long":-61.06697},{"code":"GH","lat":5.56454,"long":-0.22571},{"code":"HN","lat":14.97503281,"long":-86.26477051},{"code":"LB","lat":33.92541122,"long":35.89972687},{"code":"RW","lat":-1.94496,"long":30.06205},{"code":"FM","lat":6.91664,"long":158.14997},{"code":"MK","lat":41.60045624,"long":21.70089531},{"code":"TZ","lat":-6.18124,"long":35.74816},{"code":"MR","lat":20.25899506,"long":-10.3644371},{"code":"GN","lat":10.7226226,"long":-10.7083587},{"code":"BY","lat":53.89769,"long":27.54942},{"code":"IS","lat":64.92856598,"long":-18.96170044},{"code":"GF","lat":4.938,"long":-52.33505},{"code":"UZ","lat":41.31644,"long":69.29486},{"code":"GP","lat":15.99285,"long":-61.72753},{"code":"US","lat":38.89206,"long":-77.01991},{"code":"BG","lat":42.69649,"long":23.32601},{"code":"LK","lat":6.93197,"long":79.85775},{"code":"FR","lat":48.85689,"long":2.35085},{"code":"PS","lat":31.8261625,"long":35.2282841},{"code":"ML","lat":12.65225,"long":-7.9817},{"code":"WS","lat":-13.66897297,"long":-172.32202148},{"code":"FK","lat":-51.72731018,"long":-61.26863861},{"code":"LR","lat":6.31033,"long":-10.80674},{"code":"BW","lat":-22.18675232,"long":23.81494141},{"code":"TC","lat":21.44449997,"long":-71.14230347},{"code":"MM","lat":16.96751,"long":96.1631},{"code":"TJ","lat":38.57415,"long":68.78651},{"code":"MX","lat":19.43268,"long":-99.13421},{"code":"SE","lat":59.33279,"long":18.06449},{"code":"SA","lat":24.69497,"long":46.72413},{"code":"IN","lat":28.63243,"long":77.21879},{"code":"BV","lat":-54.4342041,"long":3.41025114},{"code":"TH","lat":13.75396,"long":100.50224},{"code":"EE","lat":59.44269,"long":24.7532},{"code":"HU","lat":47.49814,"long":19.04055},{"code":"GS","lat":-54.27415,"long":-36.51122},{"code":"TN","lat":36.80007,"long":10.18706},{"code":"AE","lat":24.48818,"long":54.35495},{"code":"VG","lat":18.4235363,"long":-64.62605286},{"code":"GI","lat":36.13584137,"long":-5.34924889},{"code":"NG","lat":9.06146,"long":7.50064},{"code":"GU","lat":13.42112923,"long":144.73971558},{"code":"MO","lat":22.19204,"long":113.55126},{"code":"BD","lat":23.93072701,"long":89.01164246},{"code":"TF","lat":-49.31373,"long":69.48754},{"code":"FO","lat":62.01017,"long":-6.77306},{"code":"MT","lat":35.93336487,"long":14.3810339},{"code":"PH","lat":14.58226,"long":120.9748},{"code":"XK","lat":42.66544,"long":21.16532},{"code":"KE","lat":-1.28579,"long":36.82003},{"code":"PN","lat":-24.37211418,"long":-128.31124878},{"code":"CA","lat":45.42042,"long":-75.69243},{"code":"LT","lat":55.33871841,"long":23.870924},{"code":"PF","lat":-17.53726,"long":-149.56603},{"code":"WF","lat":-13.29961205,"long":-176.17012024},{"code":"CR","lat":9.90958,"long":-84.05406},{"code":"TW","lat":25.03841,"long":121.5637},{"code":"SB","lat":-10.81599998,"long":166},{"code":"PY","lat":-25.3,"long":-57.63},{"code":"RS","lat":44.81507,"long":20.46048},{"code":"DJ","lat":11.60047,"long":43.15083},{"code":"ZW","lat":-19.00028038,"long":29.86876106},{"code":"AM","lat":40.17397,"long":44.50275},{"code":"UY","lat":-34.90556,"long":-56.18525},{"code":"SL","lat":8.61643982,"long":-13.19550037},{"code":"NF","lat":-29.0402,"long":167.95754},{"code":"OM","lat":20.56662178,"long":56.1579628},{"code":"CK","lat":-21.22330666,"long":-159.74055481},{"code":"RU","lat":55.75654,"long":37.61492},{"code":"AL","lat":41.11113358,"long":20.02745247},{"code":"TG","lat":8.51322651,"long":0.98009753},{"code":"KR","lat":37.55796,"long":127.50469},{"code":"AR","lat":-34.60903,"long":-58.37322},{"code":"VN","lat":21.02828,"long":105.85388},{"code":"BI","lat":-3.38227,"long":29.36358},{"code":"PW","lat":7.44190073,"long":134.54205322},{"code":"SM","lat":43.93813324,"long":12.46339321},{"code":"SK","lat":48.1464,"long":17.10688},{"code":"NP","lat":27.71202,"long":85.31295},{"code":"CM","lat":3.86177,"long":11.51875},{"code":"GD","lat":12.17886639,"long":-61.64693069},{"code":"AQ","lat":-80.46613,"long":21.34609},{"code":"KM","lat":-11.70379,"long":43.25519},{"code":"SR","lat":4.21692896,"long":-55.88921738},{"code":"UG","lat":0.31569,"long":32.57811},{"code":"ER","lat":15.39719963,"long":39.08718872},{"code":"BS","lat":25.04659,"long":-77.3766},{"code":"CL","lat":-33.44599,"long":-70.66706},{"code":"BZ","lat":17.22529221,"long":-88.66973877},{"code":"PG","lat":-9.46707,"long":147.19603},{"code":"NZ","lat":-46.16393,"long":169.87507},{"code":"GW","lat":12.11586285,"long":-14.74813652},{"code":"DZ","lat":28.21364594,"long":2.65472817},{"code":"LA","lat":17.96216,"long":102.61163},{"code":"CO","lat":4.60688,"long":-74.07184},{"code":"NU","lat":-19.03806496,"long":-169.83024597},{"code":"CX","lat":-10.49029064,"long":105.63275146},{"code":"VU","lat":-16.37668419,"long":167.5625},{"code":"VI","lat":17.75262451,"long":-64.73542023},{"code":"GG","lat":49.45633,"long":-2.57923},{"code":"NI","lat":12.13932,"long":-86.26096},{"code":"SX","lat":18.03039,"long":-63.04478},{"code":"ME","lat":42.43806,"long":19.26555},{"code":"BN","lat":4.88068,"long":114.92227},{"code":"GY","lat":6.8084,"long":-58.16138},{"code":"MA","lat":34.02199,"long":-6.83762},{"code":"BF","lat":12.37153,"long":-1.51992},{"code":"AO","lat":-8.81602,"long":13.23192},{"code":"TD","lat":15.36765289,"long":18.66758156},{"code":"AT","lat":47.06798,"long":15.48663},{"code":"TV","lat":-8.52047,"long":179.19958},{"code":"AX","lat":60.1785247,"long":19.9156105},{"code":"NC","lat":-21.31782341,"long":165.29858398},{"code":"JP","lat":35.68992615,"long":139.6917572},{"code":"BJ","lat":9.62411213,"long":2.33773875},{"code":"SO","lat":9.8333333,"long":49.1666667},{"code":"ET","lat":9.03314,"long":38.75008},{"code":"VC","lat":13.21725178,"long":-61.19344711},{"code":"BH","lat":26.23269,"long":50.57811},{"code":"ST","lat":0.27555528,"long":6.63162804},{"code":"ID","lat":-6.17476,"long":106.82707},{"code":"SY","lat":33.50198,"long":36.29805},{"code":"SN","lat":14.36251163,"long":-14.53164387},{"code":"MV","lat":4.18588495,"long":73.53071594},{"code":"DM","lat":15.39910603,"long":-61.33945847},{"code":"IE","lat":53.3441,"long":-6.26749},{"code":"MD","lat":47.0242,"long":28.83183},{"code":"BT","lat":27.45759,"long":89.62302},{"code":"KP","lat":39.02138,"long":125.75275},{"code":"AF","lat":34.52184,"long":69.18067},{"code":"BO","lat":-16.71305466,"long":-64.66664886},{"code":"SH","lat":-15.92763,"long":-5.71556},{"code":"SJ","lat":71.04893494,"long":-8.19574738},{"code":"AN","lat":12.18907833,"long":-68.25680542},{"code":"ZA","lat":-25.74602,"long":28.18712},{"code":"NL","lat":52.37317,"long":4.89066},{"code":"NR","lat":-0.5316065,"long":166.93640137},{"code":"RO","lat":44.43558,"long":26.10222},{"code":"KN","lat":17.2444725,"long":-62.64318466},{"code":"LV","lat":56.94625,"long":24.10425},{"code":"YT","lat":-12.79636002,"long":45.14227295},{"code":"CH","lat":46.948,"long":7.44813},{"code":"JO","lat":31.27576256,"long":36.82838821},{"code":"KH","lat":12.57042313,"long":104.81391144},{"code":"CF","lat":6.57412338,"long":20.48692322},{"code":"UA","lat":50.44773,"long":30.54272},{"code":"DK","lat":55.67576,"long":12.56902},{"code":"CN","lat":39.93084,"long":116.38634},{"code":"PE","lat":-12.05798,"long":-77.03713},{"code":"PA","lat":8.9673,"long":-79.5339},{"code":"AZ","lat":40.143105,"long":47.576927},{"code":"AS","lat":-14.30065,"long":-170.71812},{"code":"SI","lat":46.12023926,"long":14.82066441},{"code":"BQ","lat":12.14887,"long":-68.27369},{"code":"CC","lat":-12.1409,"long":96.82352},{"code":"SZ","lat":-26.32608,"long":31.14608},{"code":"JM","lat":18.14344406,"long":-77.34654999},{"code":"AU","lat":-35.28078,"long":149.1314},{"code":"SS","lat":4.84364,"long":31.60336},{"code":"GE","lat":41.69363,"long":44.80162},{"code":"BR","lat":-18.45639,"long":-44.67345},{"code":"AI","lat":18.1954947,"long":-63.0750234},{"code":"ES","lat":40.41669,"long":-3.70035},{"code":"GA","lat":-0.8999695,"long":11.6899699},{"code":"MY","lat":2.5490005,"long":102.96261597},{"code":"BL","lat":17.89502,"long":-62.84932},{"code":"KI","lat":-2.81631565,"long":-171.66738892},{"code":"SC","lat":-4.62354,"long":55.45249},{"code":"MG","lat":-18.90848,"long":47.53751},{"code":"CZ","lat":50.08781,"long":14.42046},{"code":"EC","lat":-0.21495,"long":-78.5132},{"code":"DO","lat":18.47202,"long":-69.90203},{"code":"NO","lat":59.91382,"long":10.73874},{"code":"BB","lat":13.1127,"long":-59.61357},{"code":"BM","lat":32.30266953,"long":-64.7516861},{"code":"CU","lat":23.12814,"long":-82.38972},{"code":"MW","lat":-13.99572,"long":33.75982},{"code":"CI","lat":6.82147,"long":-5.27985},{"code":"KZ","lat":51.1776,"long":71.433},{"code":"LY","lat":32.89222,"long":13.17308},{"code":"FJ","lat":-17.65816116,"long":178.14726257},{"code":"CD","lat":-4.32153,"long":15.31185},{"code":"PT","lat":38.70701,"long":-9.13564},{"code":"GM","lat":13.44026566,"long":-15.49088478},{"code":"JE","lat":49.22850418,"long":-2.12289286},{"code":"HM","lat":-53.08010864,"long":73.56218719},{"code":"GL","lat":74.34954834,"long":-41.08988953},{"code":"YE","lat":15.88838768,"long":47.48988724},{"code":"MP","lat":15.18883,"long":145.7535},{"code":"CV","lat":15.18300247,"long":-23.70345116},{"code":"GB","lat":51.50015,"long":-0.12624},{"code":"RE","lat":-21.14629936,"long":55.63124847},{"code":"TO","lat":-21.37624,"long":-174.93218},{"code":"AD","lat":42.50753,"long":1.52182},{"code":"HK","lat":22.28215,"long":114.15688},{"code":"TT","lat":10.65782,"long":-61.51671},{"code":"MF","lat":18.04222488,"long":-63.06623459},{"code":"SV","lat":13.67163658,"long":-88.8636322},{"code":"GR","lat":37.97534,"long":23.73615},{"code":"BA","lat":44.16825485,"long":17.78524971},{"code":"MN","lat":47.92287,"long":106.92327},{"code":"BE","lat":50.84554,"long":4.35571},{"code":"IT","lat":41.89056,"long":12.49427},{"code":"SD","lat":16.08578491,"long":30.0873909},{"code":"IO","lat":-7.26162,"long":72.37777},{"code":"MH","lat":7.12052,"long":171.36576},{"code":"GQ","lat":1.533126,"long":10.37258148},{"code":"HR","lat":45.81491,"long":15.97851},{"code":"LU","lat":49.77788162,"long":6.09474611},{"code":"MC","lat":43.73251,"long":7.41904},{"code":"IL","lat":31.78902,"long":35.20108},{"code":"QA","lat":25.41362572,"long":51.26026535},{"code":"TM","lat":39.2012825,"long":59.0822525},{"code":"SG","lat":1.28944,"long":103.84998},{"code":"AW","lat":12.50652313,"long":-69.96931458},{"code":"PR","lat":18.22452,"long":-66.47963},{"code":"CY","lat":35.17025,"long":33.3587},{"code":"ZM","lat":-13.45884514,"long":27.78809738},{"code":"EG","lat":26.75610352,"long":29.86229706},{"code":"LI","lat":47.14104,"long":9.52145},{"code":"VA","lat":41.90397,"long":12.45755},{"code":"NE","lat":11.96142101,"long":2.53115416},{"code":"PK","lat":33.72,"long":73.06},{"code":"KY","lat":19.30025,"long":-81.376},{"code":"LS","lat":-29.58175278,"long":28.24661255},{"code":"FI","lat":60.16981,"long":24.93813},{"code":"VE","lat":10.50278,"long":-66.91905},{"code":"DE","lat":52.52343,"long":13.41144},{"code":"AG","lat":17.09273911,"long":-61.81040955},{"code":"IM","lat":54.22814,"long":-4.53814},{"code":"NA","lat":-22.56522,"long":17.0843},{"code":"TL","lat":-8.80478668,"long":126.07902527},{"code":"LC","lat":14.01159,"long":-60.98823},{"code":"MU","lat":-20.22040939,"long":57.58937836},{"code":"GT","lat":14.64198,"long":-90.51324},{"code":"PM","lat":46.90594482,"long":-56.336586},{"code":"CW","lat":12.12161,"long":-68.94942},{"code":"TR","lat":39.89652,"long":32.86197},{"code":"KG","lat":42.88442,"long":74.57662},{"code":"IQ","lat":33.04458618,"long":43.77495575},{"code":"UM","lat":6.41093,"long":-162.46546},{"code":"TK","lat":-8.97920799,"long":-172.20170593},{"code":"MZ","lat":-25.97325,"long":32.57203},{"code":"HT","lat":18.54639,"long":-72.34279},{"code":"CG","lat":-4.2739,"long":15.28151},{"code":"MS","lat":16.70611,"long":-62.21337},{"code":"PL","lat":52.23498,"long":21.00849},{"code":"KW","lat":29.36857,"long":47.97283},{"code":"IR","lat":35.6864,"long":51.43286}]'),o=JSON.parse('{"AF":"Afghanistan","AX":"\xc5land Islands","AL":"Albania","DZ":"Algeria","AS":"American Samoa","AD":"Andorra","AO":"Angola","AI":"Anguilla","AQ":"Antarctica","AG":"Antigua and Barbuda","AR":"Argentina","AM":"Armenia","AW":"Aruba","AU":"Australia","AT":"Austria","AZ":"Azerbaijan","BS":"Bahamas","BH":"Bahrain","BD":"Bangladesh","BB":"Barbados","BY":"Belarus","BE":"Belgium","BZ":"Belize","BJ":"Benin","BM":"Bermuda","BT":"Bhutan","BO":"Bolivia (Plurinational State of)","BQ":"Bonaire, Sint Eustatius and Saba","BA":"Bosnia and Herzegovina","BW":"Botswana","BV":"Bouvet Island","BR":"Brazil","IO":"British Indian Ocean Territory","BN":"Brunei Darussalam","BG":"Bulgaria","BF":"Burkina Faso","BI":"Burundi","KH":"Cambodia","CM":"Cameroon","CA":"Canada","CV":"Cabo Verde","KY":"Cayman Islands","CF":"Central African Republic","TD":"Chad","CL":"Chile","CN":"China","CX":"Christmas Island","CC":"Cocos (Keeling) Islands","CO":"Colombia","KM":"Comoros","CG":"Congo","CD":"Congo (Democratic Republic of the)","CK":"Cook Islands","CR":"Costa Rica","CI":"C\xf4te d\'Ivoire","HR":"Croatia","CU":"Cuba","CW":"Cura\xe7ao","CY":"Cyprus","CZ":"Czech Republic","DK":"Denmark","DJ":"Djibouti","DM":"Dominica","DO":"Dominican Republic","EC":"Ecuador","EG":"Egypt","SV":"El Salvador","GQ":"Equatorial Guinea","ER":"Eritrea","EE":"Estonia","ET":"Ethiopia","FK":"Falkland Islands (Malvinas)","FO":"Faroe Islands","FJ":"Fiji","FI":"Finland","FR":"France","GF":"French Guiana","PF":"French Polynesia","TF":"French Southern Territories","GA":"Gabon","GM":"Gambia","GE":"Georgia","DE":"Germany","GH":"Ghana","GI":"Gibraltar","GR":"Greece","GL":"Greenland","GD":"Grenada","GP":"Guadeloupe","GU":"Guam","GT":"Guatemala","GG":"Guernsey","GN":"Guinea","GW":"Guinea-Bissau","GY":"Guyana","HT":"Haiti","HM":"Heard Island and McDonald Islands","VA":"Holy See","HN":"Honduras","HK":"Hong Kong (China)","HU":"Hungary","IS":"Iceland","IN":"India","ID":"Indonesia","IR":"Iran (Islamic Republic of)","IQ":"Iraq","IE":"Ireland","IM":"Isle of Man","IL":"Israel","IT":"Italy","JM":"Jamaica","JP":"Japan","JE":"Jersey","JO":"Jordan","KZ":"Kazakhstan","KE":"Kenya","KI":"Kiribati","KP":"Korea (Democratic People\'s Republic of)","KR":"Korea (Republic of)","KW":"Kuwait","KG":"Kyrgyzstan","LA":"Lao People\'s Democratic Republic","LV":"Latvia","LB":"Lebanon","LS":"Lesotho","LR":"Liberia","LY":"Libya","LI":"Liechtenstein","LT":"Lithuania","LU":"Luxembourg","MO":"Macao (China)","MK":"Macedonia (the former Yugoslav Republic of)","MG":"Madagascar","MW":"Malawi","MY":"Malaysia","MV":"Maldives","ML":"Mali","MT":"Malta","MH":"Marshall Islands","MQ":"Martinique","MR":"Mauritania","MU":"Mauritius","YT":"Mayotte","MX":"Mexico","FM":"Micronesia (Federated States of)","MD":"Moldova (Republic of)","MC":"Monaco","MN":"Mongolia","ME":"Montenegro","MS":"Montserrat","MA":"Morocco","MZ":"Mozambique","MM":"Myanmar","NA":"Namibia","NR":"Nauru","NP":"Nepal","NL":"Netherlands","NC":"New Caledonia","NZ":"New Zealand","NI":"Nicaragua","NE":"Niger","NG":"Nigeria","NU":"Niue","NF":"Norfolk Island","MP":"Northern Mariana Islands","NO":"Norway","OM":"Oman","PK":"Pakistan","PW":"Palau","PS":"Palestina, State of","PA":"Panama","PG":"Papua New Guinea","PY":"Paraguay","PE":"Peru","PH":"Philippines","PN":"Pitcairn","PL":"Poland","PT":"Portugal","PR":"Puerto Rico","QA":"Qatar","RE":"R\xe9union","RO":"Romania","RU":"Russian Federation","RW":"Rwanda","BL":"Saint Barth\xe9lemy","SH":"Saint Helena, Ascension and Tristan da Cunha","KN":"Saint Kitts and Nevis","LC":"Saint Lucia","MF":"Saint Martin (French part)","PM":"Saint Pierre and Miquelon","VC":"Saint Vincent and the Grenadines","WS":"Samoa","SM":"San Marino","ST":"Sao Tome and Principe","SA":"Saudi Arabia","SN":"Senegal","RS":"Serbia","SC":"Seychelles","SL":"Sierra Leone","SG":"Singapore","SX":"Sint Maarten (Dutch part)","SK":"Slovakia","SI":"Slovenia","SB":"Solomon Islands","SO":"Somalia","ZA":"South Africa","GS":"South Georgia and the South Sandwich Islands","SS":"South Sudan","ES":"Spain","LK":"Sri Lanka","SD":"Sudan","SR":"Suriname","SJ":"Svalbard and Jan Mayen","SZ":"Swaziland","SE":"Sweden","CH":"Switzerland","SY":"Syrian Arab Republic","TW":"Taiwan, Province of China","TJ":"Tajikistan","TZ":"Tanzania, United Republic of","TH":"Thailand","TL":"Timor-Leste","TG":"Togo","TK":"Tokelau","TO":"Tonga","TT":"Trinidad and Tobago","TN":"Tunisia","TR":"Turkey","TM":"Turkmenistan","TC":"Turks and Caicos Islands","TV":"Tuvalu","UG":"Uganda","UA":"Ukraine","AE":"United Arab Emirates","GB":"United Kingdom","US":"United States of America","UM":"United States Minor Outlying Islands","UY":"Uruguay","UZ":"Uzbekistan","VU":"Vanuatu","VE":"Venezuela (Bolivarian Republic of)","VN":"Viet Nam","VG":"Virgin Islands (British)","VI":"Virgin Islands (U.S.)","WF":"Wallis and Futuna","EH":"Western Sahara","YE":"Yemen","ZM":"Zambia","ZW":"Zimbabwe"}'),r=a.reduce(((e,t)=>{let{code:n,long:a,lat:o}=t;return e[n]={long:a,lat:o},e}),{}),l=e=>o[e],i=e=>r[e]},72836:(e,t,n)=>{n.r(t),n.d(t,{default:()=>bo});var a=n(88242),o=n(67294),r=n(84191),l=n(61802);let i;async function c(e,t,n){let{satisfied:a}=t;return await r.po.post(`/explorer/questions/${e}/feedback`,{satisfied:a,feedbackContent:""},{withCredentials:!0,oToken:n}),a}async function s(e,t,n){await r.po.delete(`/explorer/questions/${e}/feedback`,{params:{satisfied:t},withCredentials:!0,oToken:n})}async function u(){return await r.po.get("/explorer/tags")}!function(e){e.New="new",e.AnswerGenerating="answer_generating",e.SQLValidating="sql_validating",e.Waiting="waiting",e.Running="running",e.Success="success",e.Summarizing="summarizing",e.Error="error",e.Cancel="cancel"}(i||(i={}));var d=n(22638);async function m(e){return await new Promise((t=>setTimeout(t,e)))}var g=n(90031);let p;!function(e){e[e.NONE=0]="NONE",e[e.LOADING=1]="LOADING",e[e.LOAD_FAILED=2]="LOAD_FAILED",e[e.CREATING=3]="CREATING",e[e.CREATED=4]="CREATED",e[e.GENERATING_SQL=5]="GENERATING_SQL",e[e.CREATE_FAILED=6]="CREATE_FAILED",e[e.GENERATE_SQL_FAILED=7]="GENERATE_SQL_FAILED",e[e.QUEUEING=8]="QUEUEING",e[e.EXECUTING=9]="EXECUTING",e[e.EXECUTE_FAILED=10]="EXECUTE_FAILED",e[e.VISUALIZE_FAILED=11]="VISUALIZE_FAILED",e[e.UNKNOWN_ERROR=12]="UNKNOWN_ERROR",e[e.SUMMARIZING=13]="SUMMARIZING",e[e.READY=14]="READY"}(p||(p={}));const h=new Set([p.NONE,p.READY,p.SUMMARIZING,p.UNKNOWN_ERROR,p.GENERATE_SQL_FAILED,p.VISUALIZE_FAILED,p.CREATE_FAILED,p.LOAD_FAILED,p.EXECUTE_FAILED]);function f(e,t){switch(e.status){case i.New:return p.CREATED;case i.AnswerGenerating:case i.SQLValidating:return p.GENERATING_SQL;case i.Waiting:return p.QUEUEING;case i.Running:return p.EXECUTING;case i.Summarizing:return p.SUMMARIZING;case i.Success:return(0,l.nf)(e.chart)?p.READY:p.VISUALIZE_FAILED;case i.Error:return(0,l.nf)(e.error)?t(e.error):t("Empty error message"),(0,l.X0)(e.querySQL)?p.GENERATE_SQL_FAILED:(0,l.X0)(e.result)?p.EXECUTE_FAILED:(0,l.X0)(e.chart)?p.VISUALIZE_FAILED:p.UNKNOWN_ERROR;case i.Cancel:return(0,l.nf)(e.error)?t(e.error):t("Execution was cancelled"),p.EXECUTE_FAILED;default:return(0,l.nf)(e.querySQL)?(0,l.nf)(e.result)?p.READY:(0,l.nf)(e.error)?(t(e.error),p.EXECUTE_FAILED):p.EXECUTING:(0,l.nf)(e.error)?(t(e.error),p.GENERATE_SQL_FAILED):p.GENERATING_SQL}}function E(e){let{pollInterval:t=2e3}=e;const[n,a]=(0,o.useState)(p.NONE),[i,c]=(0,o.useState)(),[s,u]=(0,o.useState)(!1),[h,E]=(0,o.useState)(),y=(0,o.useRef)(),{isLoading:b,user:v,getAccessTokenSilently:x,login:w}=(0,g.g)(),S=(0,d.Z)((async function(e,t){if(y.current!==e||!t&&!s){y.current=e;try{t&&(E(void 0),c(void 0),a(p.LOADING)),u(!0);const n=await async function(e){return await r.po.get(`/explorer/questions/${e}`)}(e);y.current=n.id,a(f(n,E)),c(n)}catch(n){return a(p.LOAD_FAILED),E(n),await Promise.reject(n)}finally{u(!1)}}})),Z=(0,d.Z)((e=>{S(e,!0)})),I=(0,d.Z)((e=>{!async function(e){try{if(!b&&!v)return await w({triggerBy:"explorer-search"});E(void 0),c(void 0),u(!0),a(p.CREATING);const t=await x(),n=await async function(e,t){const{accessToken:n}=t;return await r.po.post("/explorer/questions/",{question:e},{withCredentials:!0,oToken:n})}(e,{accessToken:t});await m(600),y.current=n.id,a(f(n,E)),c(n)}catch(t){return a(p.CREATE_FAILED),E(t),await Promise.reject(t)}finally{u(!1)}}(e)})),C=(0,d.Z)((()=>{a(p.NONE),c(void 0),u(!1),E(void 0),y.current=void 0}));return(0,o.useEffect)((()=>{switch((0,l.z0)(t)&&t<1e3&&(t=1e3),n){case p.CREATED:case p.GENERATING_SQL:case p.EXECUTING:case p.QUEUEING:case p.SUMMARIZING:{const e=setTimeout((()=>{(0,l.GC)(y.current)&&S(y.current,!1)}),t);return()=>{clearTimeout(e)}}}}),[n,s,t]),{phase:n,question:i,loading:s,error:h,load:Z,create:I,reset:C}}const y=(0,o.createContext)({phase:p.NONE,question:void 0,loading:!1,error:void 0,load(){},create(){},reset(){}});function b(){return(0,o.useContext)(y)}y.displayName="QuestionManagementContext";var v=n(2108),x=n(61953),w=n(79104),S=n(81719),Z=n(26432);const I=(0,o.createContext)({search:"",handleSelect(){},handleSelectId(){},showTips(){}});function C(){return(0,o.useContext)(I)}function A(){return o.createElement(k,null,o.createElement(P,null),o.createElement(M,null))}const k=(0,S.ZP)("div",{name:"Decorators-Container"})`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 200vh;
  pointer-events: none;
  overflow: hidden;
`,N=(0,S.ZP)("div")`
  display: block;
  position: absolute;
  background-position: left top;
  background-repeat: no-repeat;
`,P=(0,S.ZP)(N)`
  background-image: url('/img/ellipse-2.svg');
  left: 41px;
  top: 81px;
  right: 0;
  width: 696px;
  height: 696px;
  background-size: 696px 696px;
  overflow: hidden;
`,M=(0,S.ZP)(N)`
  background-image: url('/img/ellipse-2.svg');
  top: 241px;
  right: 0;
  width: 961px;
  height: 1072px;
  background-size: 961px 1072px;
  overflow: hidden;
`;var T=n(36336),L=n(98885),F=n(93580);const R=400;function G(e){let{children:t,header:n,side:a,footer:r,showFooter:l,showSide:i,showHeader:c}=e;const s=(0,o.useRef)(null),u=(0,o.useRef)(null),d=(0,o.useRef)(null),m=(0,F.Z)(s),g=(0,o.useMemo)((()=>(null==m?void 0:m.height)??0),[null==m?void 0:m.height]);return o.createElement($,{maxWidth:"xl"},o.createElement(L.ZP,{nodeRef:s,in:c,timeout:R},(e=>o.createElement(o.Fragment,null,o.createElement(q,{ref:s,className:`Header-${e}`,height:g},n),o.createElement(D,{className:`Body-header-${e}`,headerHeight:g},o.createElement(L.ZP,{nodeRef:u,in:i,timeout:R},(e=>o.createElement(B,{ref:u,className:`Main-side-${e}`},t))),o.createElement(L.ZP,{nodeRef:d,in:i,timeout:R,unmountOnExit:!0},(e=>o.createElement(z,{ref:d,className:`Side-${e}`},a))))))),o.createElement(O,null,l&&r))}const $=(0,S.ZP)(T.Z,{name:"Layout-Root"})`
  padding-top: 64px;

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    padding-top: 16px;
  }

  min-height: calc(100vh - 92px);
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`,D=(0,S.ZP)("div",{name:"Layout-Body",shouldForwardProp:e=>"headerHeight"!==e})`
  --explore-layout-side-width: ${250}px;

  ${e=>{let{theme:t}=e;return t.breakpoints.up("lg")}} {
    --explore-layout-side-width: ${275}px;
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.up("xl")}} {
    --explore-layout-side-width: ${300}px;
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.up("md")}} {
    padding-right: var(--explore-layout-side-width);
  }

  position: relative;
  margin: 0 auto;
  width: 100%;

  ${e=>{let{theme:t}=e;return t.breakpoints.up("xl")}} {
    max-width: ${e=>{let{theme:t}=e;return`calc(${t.breakpoints.values.lg}px + var(--explore-layout-side-width))`}};
  }

  transform: translate3d(0, -${e=>{let{headerHeight:t}=e;return t+32+40}}px, 0);
  transition: ${e=>{let{theme:t}=e;return t.transitions.create("transform",{duration:R})}};

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    transform: translate3d(0, -${e=>{let{headerHeight:t}=e;return t+32-8}}px, 0);
  }

  ${U("Body-header",!0)} {
    opacity: 1;
    transform: initial;
  }
`,q=(0,S.ZP)("div",{name:"Layout-Header",shouldForwardProp:e=>"height"!==e})`
  opacity: 0.1;
  transform: translate3d(0, -${e=>{let{height:t}=e;return t+32+40}}px, 0);
  margin-bottom: ${32}px;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["transform","opacity"],{duration:R})}};

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    transform: translate3d(0, -${e=>{let{height:t}=e;return t+32}}px, 0);
  }

  ${U("Header",!0)} {
    opacity: 1;
    transform: initial;
  }
`,B=(0,S.ZP)("div",{name:"Layout-Main"})`
  width: 100%;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["transform","opacity"],{duration:R})}};

  ${e=>{let{theme:t}=e;return t.breakpoints.up("md")}} {
    transform: translateX(calc(var(--explore-layout-side-width) / 2));
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.up("md")}} {
    max-width: calc(100%);
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.up("xl")}} {
    max-width: ${e=>{let{theme:t}=e;return t.breakpoints.values.lg}}px;
  }

  ${U("Main-side",!0)} {
    transform: initial;
  }
`,z=(0,S.ZP)("div",{name:"Layout-Side"})`
  position: absolute;
  right: 0;
  top: 0;
  width: var(--explore-layout-side-width);
  height: 100%;
  opacity: 0;
  transform: translateX(calc(var(--explore-layout-side-width) / 2));
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["transform","opacity"],{duration:R})}};
  padding: 0 24px;
  box-sizing: border-box;

  ${U("Side",!0)} {
    display: block;
    transform: initial;
    opacity: 1;
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    display: none !important;
  }
`,O=(0,S.ZP)("div",{name:"Layout-Footer"})`
  position: relative;
  display: flex;
  align-self: stretch;
  flex: 1;
  min-height: 160px;
  align-items: center;
  justify-content: center;
`;function U(e,t){return t?`&.${e}-entering, &.${e}-entered`:`&.${e}-exiting, &.${e}-exited`}var _,H,Q;function W(){return W=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},W.apply(this,arguments)}const V=e=>{let{title:t,titleId:n,...a}=e;return o.createElement("svg",W({width:43,height:24,viewBox:"0 0 43 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-labelledby":n},a),t?o.createElement("title",{id:n},t):null,_||(_=o.createElement("rect",{x:.25,y:.25,width:42.5,height:23.5,rx:11.75,stroke:"url(#a)",strokeWidth:.5})),H||(H=o.createElement("path",{d:"M10.057 16V7.273h3.051c.608 0 1.11.105 1.504.315.395.207.69.487.882.84.194.349.29.737.29 1.163 0 .375-.067.685-.2.929-.13.244-.304.437-.52.58a2.364 2.364 0 0 1-.695.315v.085c.267.017.536.11.806.281.27.17.495.415.677.733.182.318.273.708.273 1.168 0 .437-.1.83-.298 1.18-.2.35-.513.627-.942.831-.429.205-.987.307-1.675.307h-3.153Zm1.057-.938h2.096c.69 0 1.18-.133 1.47-.4.293-.27.44-.597.44-.98 0-.296-.076-.568-.226-.818a1.635 1.635 0 0 0-.644-.606c-.278-.153-.608-.23-.989-.23h-2.147v3.034Zm0-3.954h1.96c.318 0 .605-.063.86-.188.26-.124.464-.3.614-.528.154-.227.23-.494.23-.801 0-.384-.133-.709-.4-.976-.267-.27-.69-.405-1.27-.405h-1.994v2.898Zm9.355 5.028c-.63 0-1.174-.139-1.632-.417a2.803 2.803 0 0 1-1.052-1.176c-.244-.506-.367-1.094-.367-1.765 0-.67.123-1.261.367-1.772.247-.514.59-.915 1.031-1.202.443-.29.96-.435 1.551-.435.341 0 .678.057 1.01.17.332.114.635.3.908.555.273.253.49.588.652 1.005.162.418.243.932.243 1.543v.426h-5.046v-.87h4.023c0-.369-.074-.698-.222-.988a1.67 1.67 0 0 0-.622-.686 1.742 1.742 0 0 0-.946-.251c-.4 0-.747.1-1.04.298-.29.196-.512.452-.669.767a2.253 2.253 0 0 0-.234 1.014v.58c0 .494.085.913.256 1.257.173.34.413.6.72.78a2.11 2.11 0 0 0 1.07.264c.264 0 .502-.037.715-.11.216-.077.402-.191.559-.342.156-.153.277-.344.362-.57l.971.272c-.102.33-.274.62-.515.87-.242.246-.54.44-.895.579a3.318 3.318 0 0 1-1.198.204Zm7.087-6.681v.852h-3.392v-.852h3.392Zm-2.403-1.569h1.005v6.239c0 .284.042.497.124.64a.64.64 0 0 0 .324.28c.133.046.274.069.422.069.11 0 .201-.006.272-.017l.17-.034.205.903a2.046 2.046 0 0 1-.285.077 2.102 2.102 0 0 1-.465.042c-.284 0-.562-.06-.835-.183a1.66 1.66 0 0 1-.673-.558c-.176-.25-.264-.566-.264-.946V7.886Zm5.842 8.267c-.415 0-.791-.078-1.13-.234a1.938 1.938 0 0 1-.805-.686c-.198-.301-.298-.665-.298-1.091 0-.375.074-.679.222-.912.147-.236.345-.42.592-.554.247-.133.52-.233.818-.298.301-.068.604-.122.908-.162.398-.051.72-.09.967-.115.25-.029.432-.075.546-.14.116-.066.174-.18.174-.342v-.034c0-.42-.115-.747-.345-.98-.227-.233-.572-.35-1.035-.35-.48 0-.857.106-1.13.316-.272.21-.464.435-.575.673l-.954-.34c.17-.398.397-.708.681-.93.287-.224.6-.38.938-.468.34-.091.676-.137 1.006-.137.21 0 .451.026.724.077.276.048.541.15.797.303.258.153.473.384.643.694.17.31.256.725.256 1.245V16h-1.006v-.886h-.05a1.77 1.77 0 0 1-.342.456c-.159.162-.37.3-.635.413-.264.114-.586.17-.967.17Zm.153-.903c.398 0 .733-.078 1.006-.234a1.595 1.595 0 0 0 .835-1.385v-.92c-.042.05-.136.097-.28.14-.143.04-.308.075-.495.106a22.444 22.444 0 0 1-.963.128 3.84 3.84 0 0 0-.733.166 1.263 1.263 0 0 0-.546.337c-.136.148-.204.35-.204.605 0 .35.129.614.387.793.262.176.593.264.993.264Z",fill:"url(#b)"})),Q||(Q=o.createElement("defs",null,o.createElement("linearGradient",{id:"a",x1:0,y1:24,x2:45.606,y2:24,gradientUnits:"userSpaceOnUse"},o.createElement("stop",{stopColor:"#5667FF"}),o.createElement("stop",{offset:1,stopColor:"#A168FF"})),o.createElement("linearGradient",{id:"b",x1:9,y1:17,x2:37.636,y2:17,gradientUnits:"userSpaceOnUse"},o.createElement("stop",{stopColor:"#5667FF"}),o.createElement("stop",{offset:1,stopColor:"#A168FF"})))))},K=(0,S.ZP)("b",{shouldForwardProp:e=>"color"!==e})`
  color: ${e=>{let{color:t}=e;return t}};
`,j=o.createElement(o.Fragment,null,"Explore ",o.createElement(K,{color:"#9197D0"},"5 billion")," GitHub data with no SQL or plotting skills. Reveal fascinating discoveries ",o.createElement(K,{color:"#7D71C7"},"RIGHT NOW"),"!");function Y(){return o.createElement(ee,null,o.createElement(te,null,o.createElement(J,null,o.createElement("span",{className:"nav-explore-icon"})),o.createElement(ne,null,"Data Explorer"),o.createElement(X,null)),o.createElement(ae,null,j))}const X=(0,S.ZP)(V)`
  margin-left: 8px;
`,J=(0,S.ZP)("span")`
  display: inline-flex;
  width: 36px;
  height: 36px;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  > span {
    scale: 2;
  }
`,ee=(0,S.ZP)("div",{shouldForwardProp:e=>"display"!==e})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
`,te=(0,S.ZP)("h1")`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
`,ne=(0,S.ZP)("span")`
`,ae=(0,S.ZP)("p")`
  color: #7C7C7C;
  margin: 0;
`;var oe=n(80562),re=n(75345),le=n(9144),ie=n(95537),ce=n(63871),se=n(89022),ue=n(88100);function de(e){let{value:t,onChange:n,onAction:a,onClear:r,disableInput:l=!1,disableAction:i=!1,disableClear:c=!1,clearState:s}=e;const u=(0,o.useRef)(null),{isLoading:d,isAuthenticated:m}=(0,ue.D3)(),g=(0,Z.Z)((e=>{n(e.target.value)})),p=(0,Z.Z)((e=>{"Enter"===e.key&&(i||null==a||a())}));return o.createElement(o.Fragment,null,o.createElement(me,{fullWidth:!0,disabled:d&&!m||l,ref:u,value:t,onChange:g,onKeyDown:p,placeholder:"Questions about repos, users, orgs, languages...",endAdornment:o.createElement(le.Z,{direction:"row",gap:1},!i&&o.createElement(ge,{color:"inherit",onClick:a,disabled:i},o.createElement(ce.Z,null)),o.createElement(ge,{color:"stop"===s?"error":"inherit",onClick:r,disabled:c},"stop"===s?o.createElement(se.Z,null):o.createElement(ie.Z,null)))}))}const me=(0,S.ZP)(re.ZP)`
  background-color: #eaeaea;
  color: #3c3c3c;
  border-radius: 6px;
  font-size: 20px;
  padding: 14px;
  line-height: 1;

  &.Mui-disabled {
    color: rgb(60, 60, 60, 0.7);
    
    & > input {
      -webkit-text-fill-color: unset;
    }
  }
`,ge=(0,S.ZP)(oe.Z)`
  &.Mui-disabled {
    color: rgb(60, 60, 60, 0.3);
  }
`;function pe(e){const{marginTop:t,marginBottom:n}=getComputedStyle(e);return e.offsetHeight+parseFloat(t)+parseFloat(n)}function he(e){let{state:t,transitionDelay:n=0,transitionDuration:a=400,offset:r=120,direction:i="up",revert:c=!1,children:s}=e;const u=(0,o.useRef)(null),d=(0,o.useRef)(null),[m,g]=(0,o.useState)();(0,o.useEffect)((()=>{if(2!==s.length)throw new Error("SwitchLayout should have exactly two children");if((0,l.Rw)(s[0].key)||(0,l.Rw)(s[1].key))throw new Error("SwitchLayout's children must have keys")}),[]);const p=(0,Z.Z)((()=>{(0,l.nf)(u.current)&&g(pe(u.current))})),h=(0,Z.Z)((()=>{(0,l.nf)(d.current)&&g(pe(d.current))})),f=(0,Z.Z)((()=>{g(void 0)})),E=(0,Z.Z)((()=>{(0,l.nf)(d.current)&&g(pe(d.current))})),y=(0,Z.Z)((()=>{(0,l.nf)(u.current)&&g(pe(u.current))})),b=(0,Z.Z)((()=>{g(void 0)})),v=n+a;return o.createElement(fe,{offset:r,style:{height:m},duration:a,delay:n},o.createElement(L.ZP,{key:s[0].key,in:t===s[0].key,timeout:v,unmountOnExit:!0,onExit:p,onExiting:h,onExited:f},(e=>o.createElement(Ee,{ref:u,className:`SwitchItem-${i} SwitchItem-${e}`,duration:a,delay:n,offset:r},s[0]))),o.createElement(L.ZP,{key:s[1].key,in:t===s[1].key,timeout:v,unmountOnExit:!0,onExit:E,onExiting:y,onExited:b},(e=>o.createElement(Ee,{ref:d,className:`SwitchItem-${c?"up"===i?"down":"up":i} SwitchItem-${e}`,duration:a,delay:n,offset:r},s[1]))))}const fe=(0,S.ZP)("div",{name:"SwitchLayoutContainer",shouldForwardProp:e=>!["duration","delay","offset"].includes(String(e))})`
  position: relative;
  transition: ${e=>{let{theme:t,duration:n,delay:a}=e;return t.transitions.create("height",{duration:n,delay:a})}};
`,Ee=(0,S.ZP)("div",{name:"SwitchItem",shouldForwardProp:e=>!["offset","duration","delay"].includes(String(e))})`
  transition: ${e=>{let{theme:t,duration:n,delay:a}=e;return t.transitions.create("opacity",{duration:n,delay:a})}};
  opacity: 0;
  padding: 0.1px;

  &.SwitchItem-exiting, &.SwitchItem-entering {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  &.SwitchItem-enter, &.SwitchItem-exiting, &.SwitchItem-exited {
    opacity: 0;
  }

  &.SwitchItem-exit, &.SwitchItem-entering, &.SwitchItem-entered {
    opacity: 1;
    transform: initial;
  }
`;var ye=n(3106),be=n(52263);function ve(e){let{as:t="a",campaign:n,trial:a,...r}=e;const{user:i}=(0,g.g)(),{campaign:c,trial:s}=(0,o.useContext)(ye.Z),{siteConfig:{customFields:u}}=(0,be.Z)(),{campaign:d,trial:m}=(0,o.useMemo)((()=>({campaign:(0,l.kX)(l.GC,n,c,void 0),trial:(0,l.kX)(l.nf,a,s,!1)})),[n,c,a,s]),p=(0,o.useMemo)((()=>{const e=new URL(`https://${null==u?void 0:u.tidbcloud_host}/channel`);if((0,l.GC)(d)&&(e.searchParams.set("utm_source","ossinsight"),e.searchParams.set("utm_medium","referral"),e.searchParams.set("utm_campaign",d)),m){const t=function(e){if((0,l.nf)(e)&&(0,l.GC)(e.email)&&(0,l.GC)(e.sub)){let t;switch(e.sub.split("|")[0]){case"github":t="github";break;case"google-oauth2":t="google";break;case"windowslive":t="microsoft";break;default:return}return{email:e.email,connection:t}}return}(i);(0,l.nf)(t)&&(e.searchParams.set("email",t.email),e.searchParams.set("connection",t.connection))}return e.toString()}),[i,d,m]);return(0,o.createElement)(t,{href:p,target:"_blank",rel:"noopener",...r})}function xe(e){let{align:t="left",sx:n}=e;return o.createElement(we,{align:t,sx:n},o.createElement(ve,null,"Build with Chat2Query on TiDB Cloud"))}const we=(0,S.ZP)("div",{shouldForwardProp:e=>"align"!==e})`
  text-align: ${e=>{let{align:t}=e;return t}};
  font-size: 16px;
  color: #C1C1C1;

  > a {
    color: #C1C1C1 !important;
    text-decoration: none !important;
  }
`;var Se=n(14850),Ze=n(74065),Ie=n(47028),Ce=n(21945),Ae=n(70795),ke=n(70918),Ne=n(70983),Pe=n(96812),Me=n(6571),Te=n(47135),Le=n(19604),Fe=n(29630);function Re(e,t){void 0===t&&(t={});const n=new URL(`https://github.com/${e}/issues/new`);return Object.entries(t).forEach((e=>{let[t,a]=e;n.searchParams.set(t,a)})),n.toString()}var Ge=n(54566),$e=n(21039),De=n(23147),qe=n(79072),Be=n(91655),ze=n(41796),Oe=n(50522),Ue=n(39960);const _e=(0,S.ZP)("div",{name:"Highlight-Background"})`
  position: relative;
  background: linear-gradient(116.45deg, #595FEC 0%, rgba(200, 182, 252, 0.2) 96.73%);
  padding: 1px;
  border-radius: 7px;
  width: 100%;
`,He=(0,S.ZP)(Oe.Z,{name:"Highlight-Content"})`
  display: block;
  font-size: 14px;
  line-height: 1.5;
  color: white;
  background-color: rgba(44, 44, 44, 0.5);
  border-radius: 6px;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create("background-color")}};
  padding: 18px;
  text-align: left;
  width: 100%;
  vertical-align: top;

  &:hover {
    background-color: rgba(44, 44, 44, 0.8);
  }
  
  &:not(:first-of-type) {
    margin-top: 16px;
  }
`,Qe=(0,S.ZP)(_e,{name:"HighlightButton-Background"})`
  display: inline-block;
  border-radius: 17px;
  max-width: max-content;
  color: white !important;
  text-decoration: none !important;
`;(0,S.ZP)(He,{name:"HighlightButton-Content"})`
  display: flex;
  border-radius: 16px;
  align-items: center;
  padding: 8px;
  max-width: max-content;
`,Qe.withComponent(Oe.Z),Qe.withComponent(Ue.Z);function We(e){let{question:t,questionId:n,variant:a="card",imageUrl:r,prefix:i,tags:c,disabled:s}=e;const{handleSelect:u,handleSelectId:d}=(0,o.useContext)(I),m=(0,Z.Z)((()=>{(0,l.GC)(n)?d(n):"string"==typeof t&&u(t)}));switch(a){case"recommended-card":return o.createElement(_e,null,o.createElement(He,{onClick:m,disabled:s},t),o.createElement(Ke,null,"\u2728"));case"card":return o.createElement(He,{onClick:m,disabled:s},t,null==c?void 0:c.map((e=>o.createElement(je,{key:e.id,color:e.color},e.label))),r&&o.createElement(Ye,{src:r,alt:"preview image"}));default:return o.createElement(Ve,{disableRipple:!0,disableTouchRipple:!0,onClick:m,disabled:s},i,t,null==c?void 0:c.map((e=>o.createElement(je,{key:e.id,color:e.color},e.label))))}}const Ve=(0,S.ZP)(Oe.Z,{name:"QuestionCard-Link"})`
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #c1c1c1;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create("color")}};

  &:hover {
    color: white;
  }
`,Ke=(0,S.ZP)("span")`
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 12px;
`,je=(0,S.ZP)("span",{shouldForwardProp:e=>"color"!==e})`
  display: inline-block;
  color: ${e=>{let{color:t}=e;return t}};
  background-color: ${e=>{let{color:t}=e;return(0,ze.Fq)(t,.1)}};
  border: 1px solid ${e=>{let{color:t}=e;return(0,ze.Fq)(t,.3)}};
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 24px;
  font-size: 12px;
  line-height: 1;
`,Ye=(0,S.ZP)("img")`
  width: 100%;
  margin-top: 12px;
`;var Xe=n(8100);function Je(e){const t=new Array(e);for(let n=0;n<e;n++)t[n]=n;return t}function et(e,t){if(0!==e.length&&(1!==e.length||!(0,l.nf)(t)||0!==t))for(;;){const n=Math.floor((Math.random()-1e-5)*e.length);if(n!==t)return e[n]}}function tt(e,t,n){const{data:a,isValidating:i,mutate:c}=(0,Xe.ZP)([e,t,n,"data-explorer-recommend-question"],{fetcher:async(e,t)=>await async function(e,t,n){const a={};return(0,l.z0)(t)&&(a.n=t),(0,l.nf)(n)&&(a.tagId=n),await r.po.get("/explorer/questions/recommend",{params:a})}(0,t,n),shouldRetryOnError:!1,revalidateIfStale:!1,revalidateOnReconnect:!1,revalidateOnFocus:!1});return{data:a,loading:i,reload:(0,o.useMemo)((()=>()=>{c(void 0,{revalidate:!0}).catch(console.error)}),[])}}function nt(e){let{variant:t,disabled:n,questions:a,n:r,questionPrefix:l,showTags:i=!1}=e;const c=0===a.length?(()=>{const e=e=>o.createElement(We,{key:e,variant:t,question:"text"===t?o.createElement(Be.Z,{width:"70%"}):o.createElement(o.Fragment,null,o.createElement(Be.Z,{width:"100%"}),o.createElement(Be.Z,{width:"61%"})),disabled:!0});return"text"===t?Je(3).map(e):Je(3).map((t=>o.createElement(qe.ZP,{item:!0,xs:12,md:4,key:t,display:"flex",alignItems:"stretch",justifyContent:"stretch"},e(t))))})():(()=>{const e=(e,a)=>o.createElement(We,{key:a,variant:t,question:e.title,questionId:e.questionId,tags:i?e.tags:[],prefix:l,disabled:n});return"text"===t?a.map(e):a.map(((t,n)=>o.createElement(qe.ZP,{item:!0,xs:12,md:4,key:t.hash,display:"flex",alignItems:"stretch",justifyContent:"stretch"},e(t,n))))})();return"text"===t?o.createElement(x.Z,null,c):o.createElement(qe.ZP,{container:!0,spacing:2},c)}function at(e){let{aiGenerated:t=!1,n:n,disabled:a=!1,title:r,questionPrefix:l,variant:i}=e;const{data:c=[],reload:s,loading:u}=tt(t,n);return o.createElement(o.Fragment,null,o.createElement(x.Z,{mb:.5},(null==r?void 0:r(s,u))??null),o.createElement(nt,{n:n,questions:c,disabled:a,questionPrefix:l,variant:i??(t?"recommended-card":"card")}))}function ot(e){let{severity:t,sx:n,children:a,createIssueUrl:r=(()=>Re("pingcap/ossinsight")),showSuggestions:l}=e;const i=(0,Z.Z)((()=>{var e;null==(e=document.getElementById("data-explorer-faq"))||e.scrollIntoView({behavior:"smooth"})})),c=(0,Z.Z)((()=>{window.open(r(),"_blank")}));return o.createElement(o.Fragment,null,o.createElement(rt,{sx:n,variant:"outlined",severity:t},o.createElement(Fe.Z,{variant:"body1"},a),o.createElement(le.Z,{direction:"row",spacing:2,mt:2},o.createElement(it,{onClick:i},o.createElement($e.Z,{fontSize:"inherit",sx:{mr:.5}}),o.createElement("span",null,"See FAQ")),o.createElement(it,{onClick:c},o.createElement(De.Z,{fontSize:"inherit",sx:{mr:.5}}),o.createElement("span",null,"Report an issue")))),l&&o.createElement(lt,null,o.createElement(at,{title:(e,t)=>o.createElement(x.Z,{component:"p",m:0,mt:3,height:"40px"},"Try other questions? ",o.createElement(oe.Z,{onClick:e,disabled:t},o.createElement(Ge.Z,null))),n:4,variant:"text",questionPrefix:"> "})))}const rt=(0,S.ZP)(Le.Z)`
  background: #18191A;
  border-color: transparent;

  a {
    color: currentColor !important;
    text-decoration: underline !important;
  }
`,lt=(0,S.ZP)("div")`
  margin-top: 16px;
`,it=(0,S.ZP)("button")`
  appearance: none;
  border: 1px solid #7c7c7c;
  border-radius: 6px;
  outline: none;
  background: none;
  color: #fff;
  opacity: 0.5;
  font-size: inherit;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["opacity"])}};

  &:hover, &:focus {
    opacity: 0.7;
  }
  
  &:not(:first-of-type) {
    margin-left: 16px;
  }
`;var ct=n(36782);function st(e,t){return void 0===t&&(t=!0),()=>{var n;null==(n=document.getElementById(e))||n.scrollIntoView(t?{behavior:"smooth"}:void 0)}}function ut(e){void 0===e&&(e="");try{return(0,ct.WU)(e,{language:"mysql"})}catch{return e}}function dt(){const{question:e}=b(),t=(0,o.useMemo)((()=>()=>{var t;return Re("pingcap/ossinsight",{title:`Empty result from question ${(null==e?void 0:e.id)??""}`,labels:"area/data-explorer",body:`\nHi, The result of [question](https://ossinsight.io/explore/?id=${(null==e?void 0:e.id)??""}) is empty\nThe title is: **${(null==e||null==(t=e.title)?void 0:t.replaceAll("@",""))??""}**\n\nGenerated SQL is:\n\`\`\`mysql\n${ut(null==e?void 0:e.querySQL)}\n\`\`\` \n      `})}),[e]);return o.createElement(ot,{severity:"info",createIssueUrl:t,showSuggestions:!0},"Oops! Your query yielded no results. Try our ",o.createElement("a",{href:"javascript:void(0)",onClick:st("faq-optimize-sql")},"tips")," for crafting effective queries and give it another go.")}function mt(e){let{severity:t,title:n,prompt:a,sx:r,error:i,showSuggestions:c,children:s}=e;const{question:u}=b();return o.createElement(ot,{severity:t,sx:r,createIssueUrl:()=>{var e;return Re("pingcap/ossinsight",{title:`${n} for question ${(null==u?void 0:u.id)??""}`,body:`\n${a} [question](https://ossinsight.io/explore?id=${(null==u?void 0:u.id)??""})\n\n## Question title\n**${(null==u||null==(e=u.title)?void 0:e.replaceAll("@",""))??""}**\n\n## Error message\n${i}\n${(0,l.nf)(null==u?void 0:u.querySQL)?`\n## Generated SQL\n\`\`\`mysql\n${ut(null==u?void 0:u.querySQL)}\n\`\`\`\n`:""}\n${(0,l.nf)(null==u?void 0:u.chart)?`\n## Chart info\n\`\`\`json\n${JSON.stringify(null==u?void 0:u.chart,void 0,2)}\n\`\`\`\n`:""}\n`,labels:"area/data-explorer,type/bug"})},showSuggestions:c&&!(0,Te.X_)(i,429)},s)}var gt=n(70917);function pt(e){let{animated:t=!0}=e;return o.createElement(ft,{className:t?"animated":"",size:16})}const ht=gt.F4`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -6px, 0);
    animation-timing-function: ease-in;
  }
  100% {
    transform: translate3d(0, 0, 0);
    animation-timing-function: ease-out;
  }
`,ft=(0,S.ZP)("span")`
  width: ${e=>{let{size:t}=e;return t??24}}px;
  height: ${e=>{let{size:t}=e;return t??24}}px;
  display: inline-block;
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;

  &.animated {
    animation: ${ht} 0.8s infinite;
  }
`;var Et=n(1588);const yt=(0,Et.Z)("RippleDot",["root","info","success","error","warning","active"]);var bt=n(86010);function vt(e){let{active:t=!0,color:n="info",size:a=8}=e;return o.createElement(wt,{size:a,className:(0,bt.Z)({[yt.root]:!0,[yt.active]:t,[yt[n]]:!0})})}const xt=gt.F4`
  0% {
    opacity: 1;
    transform: initial;
  }
  100% {
    opacity: 0;
    transform: scale3d(2, 2, 0);
    transform-origin: center center;
    animation-timing-function: ease-in;
  }
`,wt=(0,S.ZP)("span",{name:"RippleDot",shouldForwardProp:e=>"size"!==e})`
  display: inline-block;
  position: relative;
  width: ${e=>{let{size:t}=e;return t}}px;
  height: ${e=>{let{size:t}=e;return t}}px;
  border-radius: 50%;

  &.${yt.error} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.error.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.error.main}};
    }
  }

  &.${yt.success} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.success.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.success.main}};
    }
  }

  &.${yt.info} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.info.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.info.main}};
    }
  }

  &.${yt.warning} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.warning.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.warning.main}};
    }
  }

  &.${yt.active}:before {
    animation-play-state: running;
  }
  
  &:before {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    content: ' ';
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: ${xt} 1.2s infinite;
    animation-play-state: paused;
  }
`;function St(e){let{status:t,title:n,defaultExpanded:a,extra:r,error:i,errorWithChildren:c=!1,errorMessage:s,children:u,errorPrompt:d,errorTitle:m,icon:g="default"}=e;const[p,h]=(0,o.useState)(!1);(0,o.useEffect)((()=>{switch(t){case"loading":h(!1);break;case"error":h(!0)}}),[t]);const f=(0,Z.Z)(((e,t)=>{E||h(t)})),E=!0===a,y=(0,l.N6)(r)&&"success"===t;return o.createElement(Zt,{className:"pending"===t?"pending":(0,l.Rw)(i)?t:"error",elevation:1},o.createElement(It,{expanded:!!E||p,defaultExpanded:a,elevation:0,onChange:f},o.createElement(Ct,{alwaysOpen:E,expandIcon:(0,l.X0)(a)&&"success"===t&&o.createElement(Me.Z,null),disabled:"loading"===t},o.createElement(At,null,"loading"===t?"bot"===g?o.createElement(pt,null):o.createElement(vt,{size:12}):"success"===t&&(0,l.Rw)(i)?o.createElement(Ne.Z,{color:"success",fontSize:"inherit"}):o.createElement(Pe.Z,{color:"disabled",fontSize:"inherit"}),o.createElement(Nt,null,n),y&&o.createElement(o.Fragment,null,o.createElement(Pt,null),o.createElement(kt,null,"auto"===r?p?"Hide":"Show":r)))),o.createElement(Ie.Z,null,c?(0,l.Rw)(i)?u:o.createElement(o.Fragment,null,o.createElement(mt,{title:m,prompt:d,error:(0,Te.e$)(i),severity:"error",sx:{mb:1},showSuggestions:!0},s),u):(0,l.Rw)(i)?u:o.createElement(mt,{title:m,prompt:d,error:(0,Te.e$)(i),severity:"error",sx:{mb:1},showSuggestions:!0},s))))}const Zt=(0,S.ZP)(ke.Z)`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.5) 0%, rgba(200, 182, 252, 0.1) 96.73%);
  padding: 1px;
  border-radius: 6px;
  margin-top: 12px;

  transform: translateY(20px);
  opacity: 0;
  transition: all .5s ease;

  &:before {
    display: none;
  }

  &.loading {
    transform: initial;
    opacity: 1;
  }

  &.success {
    transform: initial;
    opacity: 1;
  }

  &.error {
    transform: initial;
    opacity: 1;
  }

  &.pending {
    transform: translateY(20px);
    opacity: 0;
  }

`,It=(0,S.ZP)(Ze.Z)`
  border: none;
  background: rgb(36, 35, 43);
  border-radius: 5px !important;
  padding: 4px 8px;
`,Ct=(0,S.ZP)(Ce.Z,{shouldForwardProp:e=>"alwaysOpen"!==e})`
  &.${Ae.Z.content} {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  &.${Ae.Z.disabled} {
    opacity: 1;
  }

  ${e=>{let{alwaysOpen:t}=e;return t?"cursor: default !important;":""}}
`,At=(0,S.ZP)("h2")`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
`,kt=(0,S.ZP)("span")`
  color: #d7d7d7;
  font-weight: normal;
`,Nt=(0,S.ZP)("span")`
  margin-left: 8px;
`,Pt=(0,S.ZP)("span")`
  flex: 1;
`;var Mt=n(18629);function Tt(e){let{content:t,avgInterval:n=80,maxDiff:a=50,maxContinuous:r=1}=e;const[l,i,c]=function(e){const[t,n]=(0,o.useState)(e),a=(0,o.useRef)(t);return(0,o.useEffect)((()=>{a.current=t}),[t]),[t,n,a]}(0),[s,u]=(0,o.useState)(!0);return(0,o.useEffect)((()=>{let e;i(0);const o=Je(r).map((e=>e+1));return u(!1),function r(){e=setTimeout((()=>{c.current>=t.length?(clearTimeout(e),u(!0)):(i((e=>{const n=e+(et(o)??1);return t.substring(e,n).includes(" ")?e+1:n})),r())}),n+(.5-Math.random())*a)}(),()=>{clearTimeout(e)}}),[t]),o.createElement(o.Fragment,null,t.slice(0,l),t.length!==l,!s&&o.createElement(Ft,null))}const Lt=gt.F4`
  to {
    visibility: hidden;
  }
`,Ft=(0,S.ZP)("span")`
  display: inline-block;
  width: 1px;
  height: 1em;
  vertical-align: text-bottom;
  background-color: currentColor;
  animation: ${Lt} 1s steps(2, start) infinite;
`;function Rt(){var e;const{question:t,error:n,phase:a}=b(),r=(0,o.useMemo)((()=>{try{if((0,l.nf)(t))return(0,ct.WU)(t.querySQL,{language:"mysql"});var e;if(function(e){if((0,Te.IZ)(e)&&(0,l.nf)(e.response)&&(0,l.nf)(e.response.data))return"string"==typeof e.response.data.message&&"string"==typeof e.response.data.querySQL;return!1}(n))return(0,ct.WU)((null==(e=n.response)?void 0:e.data.querySQL)??"",{language:"mysql"})}catch(a){return(null==t?void 0:t.querySQL)??""}}),[t,n]),i=(0,o.useMemo)((()=>{switch(a){case p.NONE:return"pending";case p.LOADING:case p.CREATING:case p.GENERATING_SQL:return"loading";case p.GENERATE_SQL_FAILED:case p.LOAD_FAILED:case p.CREATE_FAILED:return"error";default:return"success"}}),[a]),c=(0,o.useMemo)((()=>{switch(a){case p.NONE:return"";case p.LOADING:return"Loading question...";case p.CREATING:return"Generating SQL...";case p.GENERATING_SQL:return o.createElement($t,null);case p.LOAD_FAILED:return"Question not found";case p.GENERATE_SQL_FAILED:case p.CREATE_FAILED:return"Failed to generate SQL";default:return"Generated SQL"}}),[a]),s=(0,o.useMemo)((()=>{if("error"===i)return n}),[i,n]),u=a===p.CREATED||a===p.GENERATING_SQL;return o.createElement(St,{status:i,title:c,icon:u?"bot":"default",extra:"auto",error:s,errorWithChildren:!0,errorTitle:"Failed to generate SQL",errorPrompt:"Hi, it's failed to generate SQL for",errorMessage:(0,Te.IZ)(s)&&429===(null==(e=s.response)?void 0:e.status)?o.createElement(o.Fragment,null,"Wow, you're a natural explorer! But it's a little tough to keep up!",o.createElement("br",null),"Take a break and try again in ",Dt(s),".",o.createElement("br",null),"Check out ",o.createElement(ve,null,"Chat2Query")," if you want to try AI-generated SQL in any other dataset ",o.createElement("b",null,"within 5 minutes"),"."):o.createElement(o.Fragment,null,"Whoops! No SQL query is generated. Check out ",o.createElement("a",{href:"javascript:void(0)",onClick:st("faq-failed-to-generate-sql")},"potential reasons")," and try again later.")},(0,l.N6)(r)&&o.createElement(Se.Z,{language:"sql"},r))}const Gt=[["Great question!","Interesting question!","Awesome question!","You asked a winner!"],["Sometimes I'm not smart enough...","Sometimes it's difficult for me...","Not always generate perfect SQL...","Struggling with SQL accuracy..."],["Tough, but still trying...","Hard, but persevering.","Tough, but forging ahead...","Challenging, but still striving...","Struggling, but pushing on..."],["Mastering the art of turning words into SQL magic\u2026","Gaining knowledge from your input...","Learning from your question...","Getting smarter with your input..."],["Making every effort!","Working my hardest","Trying my best...","Striving for greatness...","Trying my best..."],["Almost there\u2026","Almost done...","Just a second!"]];function $t(){const e=(0,o.useRef)({group:0}),[t,n]=(0,o.useState)((()=>et(Gt[0])));return(0,Mt.Z)((()=>{let{group:t}=e.current;t<5?t+=1:t=4,n(et(Gt[t])),e.current.group=t}),3e3),(0,l.nf)(t)?o.createElement(Tt,{content:t}):o.createElement(o.Fragment,null,"Generating SQL...")}function Dt(e){const t=(0,Te.PY)(e);if((0,l.nf)(null==t?void 0:t.waitMinutes))return`${null==t?void 0:t.waitMinutes} minutes`;const n=(0,Te.e$)(e).match(/please wait (.+)\./);return(0,l.nf)(n)?n[1]:"30 minutes"}var qt=n(87462),Bt=n(36804),zt=n(88784);function Ot(e){let{children:t}=e;return o.createElement(zt.Z,{title:o.createElement(x.Z,{p:1,fontSize:14},t)},o.createElement(oe.Z,null,o.createElement(Bt.Z,{fontSize:"inherit"})))}var Ut=n(44373),_t=n(78385),Ht=n(87054),Qt=n(85390);function Wt(e){let{title:t,data:n,columns:a,fields:r}=e;const i=(0,o.useMemo)((()=>(0,l.uW)(a)?a.map((e=>({name:e}))):(0,l.nf)(r)?r:n.length>0?Object.keys(n[0]).map((e=>({name:e}))):[{name:""}]),[n,a,r]);return o.createElement(Vt,null,o.createElement(Kt,{className:"clearTable"},o.createElement("thead",null,(0,l.GC)(t)&&o.createElement("tr",null,o.createElement("th",{colSpan:i.length,align:"center"},t)),o.createElement("tr",null,i.map((e=>{let{name:t}=e;return o.createElement("th",{key:t},t)})))),o.createElement("tbody",null,n.map(((e,t)=>o.createElement("tr",{key:t},i.map((t=>{let{name:n}=t;return o.createElement("td",{key:n},e[n])}))))))))}const Vt=(0,S.ZP)("div")`
  overflow: scroll;
`,Kt=(0,S.ZP)("table")`
  font-size: 12px;
  display: table;
  min-width: 100%;
`;var jt=n(66284);function Yt(e){return/date|time|year|month/.test(e)}function Xt(e){return"number"==typeof e?e>=1970&&e<2100:Xt(Number(e))}function Jt(e,t){return e.map((e=>{let n=e[t];return Xt(n)&&(n=new Date(String(n))),{...e,[t]:n}}))}function en(e,t){return(0,l.YN)(t,(e=>!(0,l.Rw)(e)&&(e instanceof Array?e.length>0&&(0,l.YN)(e,l.GC):(0,l.GC)(e))))?e.filter((e=>(0,l.YN)(t,(e=>t=>"string"==typeof t?(0,l.nf)(e[t]):(0,l.YN)(t,(t=>(0,l.nf)(e[t]))))(e)))):[]}var tn=n(85214),nn=n(81284),an=n(19594),on=n(95309),rn=n(61702),ln=n(44731);function cn(e){let{name:t}=e;const n=(0,o.useMemo)((()=>/\[bot]/i.test(t)?"/img/github-bot-icon.svg":`https://github.com/${t}.png`),[t]);return o.createElement(ln.Z,{src:n})}var sn=n(49837),un=n(91359),dn=n(45344);const mn=(0,S.ZP)("span")`
  font-size: 16px;
  opacity: 0.3;
  margin-left: 4px;
`;var gn=n(74446),pn=n(75559),hn=n(40172);const fn=(0,S.ZP)("div")`
  height: 100%;
`;var En=n(6068),yn=n(30120);function bn(e){let{title:t}=e;const{question:n}=b(),a=(0,o.useMemo)((()=>()=>{var e,a,o,r,l;return Re("pingcap/ossinsight",{title:`${t} in question ${(null==n?void 0:n.id)??""}`,labels:"area/data-explorer,type/bug",assignee:"Mini256",body:`\nHi, ${t} in [question](https://ossinsight.io/explore/?id=${(null==n?void 0:n.id)??""})\n\n## Question title:\n**${(null==n||null==(e=n.title)?void 0:e.replaceAll("@",""))??""}**\n\n## Chart info:\n\`\`\`json\n${JSON.stringify(null==n?void 0:n.chart,void 0,2)}\n\`\`\`\n\n## Result info:\n\`\`\`json\n// Fields\n${JSON.stringify(null==n||null==(a=n.result)?void 0:a.fields,void 0,2)}\n\n// First result (Totally ${(null==n||null==(o=n.result)?void 0:o.rows.length)??0} rows)\n${JSON.stringify(null==n||null==(r=n.result)||null==(l=r.rows)?void 0:l[0],void 0,2)}\n\`\`\`\n\n## Time info:\n| createdAt              | executedAt              | finishedAt              | requestedAt              |\n|------------------------|-------------------------|-------------------------|--------------------------|\n| ${vn(null==n?void 0:n.createdAt)} | ${vn(null==n?void 0:n.executedAt)} | ${vn(null==n?void 0:n.finishedAt)} | ${vn(null==n?void 0:n.requestedAt)} |\n\n      `})}),[n]);return o.createElement(ot,{severity:"warning",sx:{mb:2},createIssueUrl:a},t)}function vn(e){return(0,l.Rw)(e)?"-":yn.ou.fromISO(e).toFormat("yyyy-MM-dd HH:mm:ss")}(0,En.y)();const xn={LineChart:{Chart:function(e){let{chartName:t,title:n,x:a,y:r,data:l}=e;const i=(0,o.useMemo)((()=>{const e=Yt(a);l=e?Jt(l,a):l;const t=function(e){return"string"==typeof e?{type:"line",datasetId:"raw",name:e,encode:{x:a,y:e},itemStyle:{opacity:0}}:e.map(t)};return{dataset:{id:"raw",source:l},backgroundColor:"rgb(36, 35, 43)",grid:{top:64,left:8,right:8,bottom:8},tooltip:{trigger:"axis"},legend:{left:"center",top:28},series:t(r),title:{text:n},xAxis:{type:e?"time":"category"},yAxis:{type:"value"},animationDuration:2e3}}),[t,n,a,r,l]);return o.createElement(jt.Z,{theme:"dark",style:{height:400},opts:{height:400},option:i})},requiredFields:["x","y"]},BarChart:{Chart:function(e){let{chartName:t,title:n,x:a,y:r,data:l}=e;const{options:i,height:c}=(0,o.useMemo)((()=>{const e=Yt(a);l=e?Jt(l,a):l;const t=!e,o=function(e){return"string"==typeof e?{type:"bar",name:e,datasetId:"raw",encode:{x:t?e:a,y:t?a:e}}:e.map(o)};return{options:{dataset:{id:"raw",source:l},backgroundColor:"rgb(36, 35, 43)",grid:{top:64,left:8,right:8,bottom:8},tooltip:{},legend:{left:"center",top:28},series:o(r),title:{text:n},[t?"yAxis":"xAxis"]:{type:e?"time":"category",inverse:t},[t?"xAxis":"yAxis"]:{type:"value",position:t?"top":void 0},animationDuration:2e3},height:Math.max(t?40*l.length:400,400)}}),[t,n,a,r,l]);return o.createElement(jt.Z,{theme:"dark",style:{height:c},opts:{height:c},option:i})},requiredFields:["x","y"]},PieChart:{Chart:function(e){let{chartName:t,title:n,value:a,label:r,data:l}=e;const i=(0,o.useMemo)((()=>({backgroundColor:"rgb(36, 35, 43)",dataset:{id:"raw",source:l},grid:{top:64,left:8,right:8,bottom:8},tooltip:{},legend:{left:8,top:8,height:"90%",type:"scroll",orient:"vertical"},series:{type:"pie",top:36,name:r,datasetId:"raw",encode:{itemName:r,value:a}},title:{text:n}})),[t,n,a,r,l]);return o.createElement(jt.Z,{theme:"dark",style:{height:400},opts:{height:400},option:i})},requiredFields:["value","label"]},PersonalCard:{Chart:function(e){let{chartName:t,title:n,user_login:a,data:r}=e;return o.createElement(tn.Z,null,r.map(((e,t)=>o.createElement(nn.ZP,{key:t},o.createElement(on.Z,{component:"a",href:`https://github.com/${e[a]}`,target:"_blank"},o.createElement(an.Z,null,o.createElement(cn,{name:e[a]})),o.createElement(rn.Z,null,e[a]))))))},requiredFields:["user_login"]},RepoCard:{Chart:function(e){let{chartName:t,title:n,repo_name:a,data:r}=e;return o.createElement(tn.Z,null,r.map(((e,t)=>o.createElement(nn.ZP,{key:t},o.createElement(on.Z,{component:"a",href:`https://github.com/${e[a]}`,target:"_blank"},o.createElement(an.Z,null,o.createElement(cn,{name:e[a].split("/")[0]})),o.createElement(rn.Z,null,e[a]))))))},requiredFields:["repo_name"]},Table:{Chart:Wt,requiredFields:[]},NumberCard:{Chart:function(e){let{chartName:t,title:n,label:a,value:r,data:i,columns:c,fields:s}=e;const u=(0,o.useMemo)((()=>(0,l.uW)(c)?c.map((e=>({name:e}))):(0,l.nf)(s)?s:i.length>0?Object.keys(i[0]).map((e=>({name:e}))):[{name:""}]),[i,c,s]),d=(0,o.useMemo)((()=>{var e;return(0,l.GC)(a)?a:(null==s||null==(e=s.find((e=>/repo|name|user|login/.test(e.name)&&e.name!==r)))?void 0:e.name)??""}),[u,a]);if(1===i.length){const e=i[0][d]??n,t=i[0][r];return o.createElement(sn.Z,null,o.createElement(un.Z,{sx:{textAlign:"center",fontSize:36}},o.createElement(Fe.Z,{sx:{opacity:.4},fontSize:22,mt:2,mb:0,color:"text.secondary",gutterBottom:!0,align:"center"},e),(0,l.z0)(t)?o.createElement(dn.Z,{value:i[0][r],hasComma:!0,duration:800,size:36}):String(t),o.createElement(mn,null,r)))}return(0,l.N6)(d)?o.createElement(o.Fragment,null,o.createElement(Fe.Z,{variant:"h4"},n),o.createElement(qe.ZP,{container:!0,spacing:1,mt:1},i.map(((e,t)=>o.createElement(qe.ZP,{key:t,item:!0,xs:12,sm:4,md:3,lg:2},o.createElement(sn.Z,{sx:{p:2}},o.createElement(Fe.Z,{variant:"subtitle1"},e[d]),o.createElement(Fe.Z,{variant:"body2",color:"#7c7c7c"},e[r]))))))):o.createElement(tn.Z,null,i.map(((e,t)=>o.createElement(nn.ZP,{key:t},o.createElement(sn.Z,{sx:{p:4}},o.createElement(rn.Z,{primary:n,secondary:`${e[r]}`}))))))},requiredFields:["value"],optionalFields:["label"]},MapChart:{Chart:function(e){let{chartName:t,title:n,country_code:a,value:r,data:i}=e;const[c,s]=(0,o.useState)(null),u=(0,o.useRef)(null),d=(0,o.useMemo)((()=>function(e,t,n){return e.map((e=>{const a=(0,gn.$)(e[t]),{long:o,lat:r}=(0,gn.b)(e[t])??{};return[a,o,r,e[n]]})).filter((e=>{let[t]=e;return(0,l.GC)(t)})).sort(((e,t)=>Math.sign(t[3]-e[3])))}(i,a,r)),[i,a,r]),m=(0,o.useMemo)((()=>{var e,t;const a=(null==(e=d[0])?void 0:e[3])??0;return{backgroundColor:"rgb(36, 35, 43)",geo:(0,pn.Mm)(),dataset:[{id:"top1",source:d.slice(0,1)},{id:"rest",source:d.slice(1)}],title:{text:n},legend:{show:!0,left:8,top:24,orient:"vertical"},series:[{type:"effectScatter",datasetId:"top1",coordinateSystem:"geo",name:`Top 1 (${null==(t=d[0])?void 0:t[0]})`,encode:{lng:1,lat:2,value:3,itemId:0},symbolSize:e=>1+64*Math.sqrt(e[3]/a)},{type:"scatter",datasetId:"rest",coordinateSystem:"geo",name:"Rest",encode:{lng:1,lat:2,value:3,itemId:0},symbolSize:e=>1+64*Math.sqrt(e[3]/a)}],tooltip:{formatter:e=>`<b>${r}</b><br/>${e.marker} <b>${e.value[0]}</b> ${e.value[3]}`},animationDuration:2e3}}),[t,n,r,d]);return(0,o.useEffect)((()=>{if((0,l.Rw)(c))return;const e=new ResizeObserver((e=>{var t,n;let[a]=e;null==(t=u.current)||null==(n=t.getEchartsInstance())||n.resize({height:a.contentRect.height})}));return e.observe(c),()=>{e.disconnect()}}),[c]),o.createElement(hn.ZP,{ratio:4/3,style:{maxWidth:600,margin:"auto"}},o.createElement(fn,{ref:s},o.createElement(jt.Z,{theme:"dark",opts:{height:(null==c?void 0:c.clientHeight)??"auto"},option:m,ref:u})))},requiredFields:["country_code","value"]}};function wn(e){let{onPrepared:t,onExit:n,...a}=e;const{config:r,fields:i}=(0,o.useMemo)((()=>{const e=xn[a.chartName];return{config:e,fields:((null==e?void 0:e.requiredFields)??[]).map((e=>a[e]))}}),[(0,Xe.wE)(a)]),c=en(a.data,i);let s,u;return(0,l.Rw)(r)&&(s=o.createElement(bn,{title:`AI has generated an unknown chart type '${a.chartName}'`})),0===a.data.length?s=o.createElement(dt,null):c.length>0?(0,l.nf)(r)&&(u=(0,o.createElement)(r.Chart,{...a,data:c})):s=o.createElement(bn,{title:"AI has generated invalid chart info"}),(0,o.useEffect)((()=>(0!==a.data.length&&0===c.length?null==t||t(!0):null==t||t(!1),()=>{null==n||n()})),[c.length,a.data.length,t,n]),o.createElement(o.Fragment,null,s,u)}var Sn=n(91693),Zn=n(96942),In=n(45670),Cn=n(55050);function An(e){let{loading:t=!1,children:n}=e;return o.createElement(kn,{elevation:0},o.createElement(un.Z,null,o.createElement(Fe.Z,{variant:"h4",display:"flex",alignItems:"center",fontSize:16,fontFamily:"monospace"},o.createElement(Nn,null),o.createElement(Pn,null,"Insight robot:")),o.createElement(Fe.Z,{variant:"body1",fontSize:14,fontFamily:"monospace",mt:2,whiteSpace:"pre-wrap"},t?o.createElement(Be.Z,{variant:"text",width:"61%"}):n)))}const kn=(0,S.ZP)(sn.Z)`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.25) 0%, rgba(200, 182, 252, 0.05) 96.73%);
  border: 0;
  margin-bottom: 16px;
`,Nn=(0,S.ZP)("span")`
  display: inline-block;
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;
  width: 24px;
  height: 24px;
`,Pn=(0,S.ZP)("span")`
  margin-left: 12px;
`;var Mn=n(21972),Tn=n(46895),Ln=n(78667),Fn=n(49185),Rn=n(87385),Gn=n(37332),$n=n(70431),Dn=n(44276),qn=n(1969);function Bn(e){let{url:t,title:n,summary:a,hashtags:r}=e;const{showTips:l}=C(),i=(0,d.Z)((e=>{l(),window.open(e,"_blank")}));return o.createElement(Un,null,o.createElement(Mn.Z,{ariaLabel:"share",sx:{display:"inline-block",position:"absolute",right:0,top:0,[`.${Ln.Z.actions}`]:{width:64,display:"flex",flexDirection:"column",alignItems:"flex-end"}},icon:o.createElement("span",null,"Share",o.createElement(Fn.Z,{fontSize:"inherit"})),FabProps:zn},o.createElement(Tn.Z,{sx:{overflow:"hidden"},icon:o.createElement(Rn.Z,null),FabProps:On,onClick:(0,Z.Z)((()=>i((0,qn.PE)(t,{title:n,hashtags:r}))))}),o.createElement(Tn.Z,{sx:{overflow:"hidden"},icon:o.createElement(Gn.Z,null),FabProps:On,onClick:(0,Z.Z)((()=>i((0,qn.BE)(t,{title:n,summary:a}))))}),o.createElement(Tn.Z,{sx:{overflow:"hidden"},icon:o.createElement($n.Z,null),FabProps:On,onClick:(0,Z.Z)((()=>i((0,qn.$Z)(t,{title:n}))))}),o.createElement(Tn.Z,{sx:{overflow:"hidden"},icon:o.createElement(Dn.Z,null),FabProps:On,onClick:(0,Z.Z)((()=>i((0,qn.OA)(t,{title:n}))))})))}const zn={color:"inherit",disableRipple:!0,sx:{fontFamily:"var(--ifm-heading-font-family)",textTransform:"unset",fontSize:16,fontWeight:"normal",width:68,height:32,minHeight:32,background:"none",boxShadow:"none !important",pr:.5,"> span":{display:"inline-flex",gap:.5,alignItems:"center"},"&:hover, &:active":{background:"none"}}},On={sx:{width:32,height:32,minHeight:32,borderRadius:16,mx:0,overflow:"hidden"}},Un=(0,S.ZP)("div")`
  display: inline-block;
  position: relative;
  width: 64px;
  height: 32px;
  line-height: 32px;
`;var _n=n(4316),Hn=n(95764),Qn=n(85753),Wn=n(98628),Vn=n(4882),Kn=n(71406);function jn(e){let{sx:t}=e;const{showTips:n}=C(),{question:a}=b(),{setAsyncData:i}=(0,Vn.P)(void 0),u=(0,Kn.Gb)("explorer-feedback-button"),{isAuthenticated:d}=(0,ue.D3)(),{data:m,mutate:g}=(0,Xe.ZP)(d&&(0,l.nf)(a)?[a.id,"question-feedback"]:void 0,{fetcher:async e=>await u().then((async t=>await async function(e,t){return await r.po.get(`/explorer/questions/${e}/feedback`,{oToken:t})}(e,t))).then((e=>(0,l.uW)(e)?Boolean(e[0].satisfied):void 0)),errorRetryCount:0}),p=(0,Z.Z)((()=>{(0,l.Rw)(a)||(i(!0===m?u().then((async e=>await s(a.id,!0,e).finally((()=>{g(void 0)})))):u().then((async e=>await c(a.id,{satisfied:!0},e).finally((()=>{g(!0)}))))),n())})),h=(0,Z.Z)((()=>{(0,l.Rw)(a)||i(!1===m?u().then((async e=>await s(a.id,!1,e).finally((()=>{g(void 0)})))):u().then((async e=>await c(a.id,{satisfied:!1},e).finally((()=>{g(!1)})))))}));return o.createElement(le.Z,{sx:t,direction:"row",spacing:2},o.createElement(oe.Z,{onClick:p,color:!0===m?"primary":void 0,size:"small"},!0===m?o.createElement(Qn.Z,{color:"primary",fontSize:"inherit"}):o.createElement(Wn.Z,{fontSize:"inherit"})),o.createElement(oe.Z,{onClick:h,color:!1===m?"primary":void 0,size:"small"},!1===m?o.createElement(_n.Z,{color:"primary",fontSize:"inherit"}):o.createElement(Hn.Z,{fontSize:"inherit"})))}var Yn=n(89747),Xn=n(76743);const Jn=e=>{let{source:t,interval:n,prefix:a=o.createElement(pt,{animated:!1}),...r}=e;const[l,i]=(0,o.useState)(0);return(0,Mt.Z)((()=>{i((e=>(e+1)%t.length))}),n),o.createElement(Yn.Z,(0,qt.Z)({component:ea},r),a??void 0,o.createElement(Xn.Z,{key:l,timeout:400,classNames:"item"},o.createElement(ta,null,t[l])))},ea=(0,S.ZP)("span")`
  position: relative;
  display: block;
`,ta=(0,S.ZP)("span")`
  display: inline-block;
  width: max-content;
  padding-left: 8px;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["opacity","transform"],{duration:400})}};

  &.item-enter {
    opacity: 0;
    transform: translate3d(-10%, 0, 0) scale(0.85);
  }

  &.item-enter-active {
    position: absolute;
    opacity: 1;
    transform: none;
  }

  &.item-exit {
    opacity: 1;
    transform: none;
  }

  &.item-exit-active {
    position: absolute;
    opacity: 0;
    transform: translate3d(10%, 0, 0) scale(0.85);
  }
`;function na(){var e,t,n;const{question:a,error:r,phase:c}=b(),{search:s}=C(),[u,d]=(0,o.useState)(null),m=null==a||null==(e=a.result)?void 0:e.rows,g=(0,o.useMemo)((()=>{switch(c){case p.CREATED:case p.QUEUEING:case p.EXECUTING:return"loading";case p.EXECUTE_FAILED:case p.VISUALIZE_FAILED:case p.UNKNOWN_ERROR:return"error";case p.READY:case p.SUMMARIZING:return"success";default:return"pending"}}),[c]),h=(0,o.useMemo)((()=>{var e;switch(c){case p.CREATED:return"Pending...";case p.QUEUEING:return`${(null==a?void 0:a.queuePreceding)??NaN} requests ahead`;case p.EXECUTING:return"Running SQL...";case p.EXECUTE_FAILED:return"Failed to execute SQL";case p.UNKNOWN_ERROR:return"Unknown error";case p.VISUALIZE_FAILED:case p.READY:case p.SUMMARIZING:return o.createElement(o.Fragment,null,`${(null==a||null==(e=a.result)?void 0:e.rows.length)??"NaN"} rows in ${(null==a?void 0:a.spent)??"NaN"} seconds`,function(e){if((0,l.nf)(e)&&!(0,l.yD)(e.engines))return o.createElement(o.Fragment,null,". Running on ",o.createElement(oa,null,e.engines.map(aa).join(", ")),o.createElement(Ot,null,"TiDB's optimizer selects the engine for all queries on its single service:",o.createElement("ul",null,o.createElement("li",null,o.createElement(Ue.Z,{href:"https://docs.pingcap.com/tidb/stable/tiflash-overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301",target:"_blank",rel:"noopener"}," The columnar engine "),"for complex and heavy OLAP queries."),o.createElement("li",null,o.createElement(Ue.Z,{href:"https://docs.pingcap.com/tidb/stable/tikv-overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301",target:"_blank",rel:"noopener"}," The row-based engine "),"for low-latency high-concurrency OLTP queries."))));return null}(a));default:return"pending"}}),[a,c]),{url:f,title:E,hashtags:y}=(0,o.useMemo)((()=>{var e;if((0,l.Rw)(a))return{url:"https://ossinsight.io/explore/",title:"Data Explorer",hashtags:[]};let t;const n=`${s} | OSSInsight Data Explorer`,o=function(){const e=new Set,t=[];for(var n=arguments.length,a=new Array(n),o=0;o<n;o++)a[o]=arguments[o];return a.forEach((n=>{for(const a of n)e.has(a)||(e.add(a),t.push(a))})),t}((null==(e=a.answerSummary)?void 0:e.hashtags)??[],["OpenSource","OpenAI","TiDBCloud"]);return t=(0,l.GC)(a.id)?`https://ossinsight.io/explore?id=${a.id}`:"https://ossinsight.io/explore/",{url:t,title:n,hashtags:o}}),[a,s]),v=(0,o.useMemo)((()=>{if("error"===g)return r}),[g,r]),x=(0,o.useMemo)((()=>{if(c===p.VISUALIZE_FAILED)return r}),[c,r]),w=(0,o.useMemo)((()=>(0,l.nf)(a)&&(0,l.nf)(a.answerSummary)?(0,l.uW)(a.answerSummary.hashtags)?`${a.answerSummary.content}\n${a.answerSummary.hashtags.map((e=>`#${e}`)).join(" ")}`:a.answerSummary.content:""),[null==a?void 0:a.answerSummary]);return o.createElement(St,{status:g,title:h,extra:o.createElement(da,null,o.createElement("span",{ref:d}),o.createElement(Bn,{url:f,title:E,summary:null==a||null==(t=a.answerSummary)?void 0:t.content,hashtags:y})),error:v,defaultExpanded:!0,errorTitle:"Failed to execute question",errorPrompt:"Hi, it's failed to execute",errorMessage:o.createElement(o.Fragment,null,"Oops, it seems AI misunderstood your question, resulting in a wrong SQL. Try our ",o.createElement("a",{href:"javascript:void(0)",onClick:st("data-explorer-faq")},"tips")," for crafting effective SQL and give it another go.")},((0,l.nf)(null==a?void 0:a.answerSummary)||(null==a?void 0:a.status)===i.Summarizing)&&o.createElement(An,{loading:(null==a?void 0:a.status)===i.Summarizing},o.createElement(Tt,{content:w,maxContinuous:2,avgInterval:40})),c===p.QUEUEING&&o.createElement(sa,{source:0===(null==a?void 0:a.queuePreceding)?ia:la,interval:5e3}),c===p.EXECUTING&&o.createElement(sa,{source:ca,interval:3e3}),o.createElement(ra,{chartData:(null==a?void 0:a.chart)??void 0,chartError:x,result:m,fields:null==a||null==(n=a.result)?void 0:n.fields,controlsContainer:u}))}function aa(e){switch(e){case"tiflash":return"columnar storage";case"tikv":return"row storage";default:return e}}const oa=(0,S.ZP)("span")`
  color: #B0B8FF;
`;function ra(e){let{chartData:t,chartError:n,fields:a,result:r,controlsContainer:i}=e;const[c,s]=(0,o.useState)("visualization"),u=(0,o.useRef)("visualization");(0,o.useEffect)((()=>{s(u.current)}),[t]);const d=(e,t)=>{(0,l.GC)(t)&&s(t)},m=(0,Z.Z)((e=>{u.current=e?"raw":"visualization"})),g=(0,Z.Z)((()=>{u.current="visualization"}));return(0,o.useMemo)((()=>{const e=(0,Te.e$)(n),s=function(t,n){return void 0===t&&(t=!1),void 0===n&&(n=!1),o.createElement(mt,{title:"Unable to generate chart",prompt:"Hi, it's failed to generate chart for",error:e,severity:"warning",sx:t?{mb:2}:void 0,showSuggestions:n})};if((0,l.Rw)(r))return(0,l.nf)(n)?s(!1,!0):null;const u=()=>o.createElement(o.Fragment,null,o.createElement(le.Z,{direction:"row",justifyContent:"center",alignItems:"center",flexWrap:"wrap",spacing:.5,py:1,mt:2,fontSize:"inherit",bgcolor:"#323140"},o.createElement(Fe.Z,{variant:"body1",mr:2},"Do you like the result?"),o.createElement(jn,null)),o.createElement(Ut.Z,{sx:{my:2}}),o.createElement(Fe.Z,{component:"div",variant:"body2",color:"#D1D1D1"},"\ud83e\udd14 Not exactly what you're looking for? Check out our ",o.createElement("a",{href:"javascript:void(0)",onClick:st("data-explorer-faq")},"FAQ")," for help. If the problem persists, please ",o.createElement(Ue.Z,{href:"https://github.com/pingcap/ossinsight/issues/new/choose",target:"_blank",rel:"noopener"},"report an issue")," to us.")),p=()=>o.createElement(o.Fragment,null,o.createElement(ga,null,o.createElement(Wt,{chartName:"Table",title:"",data:r,fields:a})),u());if((0,l.Rw)(t))return(0,l.nf)(n)?o.createElement(o.Fragment,null,s(!0),p()):null;const h=()=>o.createElement(o.Fragment,null,o.createElement(ga,null,o.createElement(wn,(0,qt.Z)({},t,{data:r,fields:a,onPrepared:m,onExit:g}))),u());return(0,l.nf)(n)?o.createElement(o.Fragment,null,s(!0),p()):"Table"===t.chartName?h():o.createElement(o.Fragment,null,o.createElement(_t.Z,{container:i},o.createElement(ua,{className:"chart-controls"},o.createElement(Qt.Z,{size:"small",value:c,onChange:d,exclusive:!0,color:"primary"},o.createElement(Ht.Z,{value:"visualization",size:"small",sx:{padding:"5px"}},o.createElement(Sn.Z,{fontSize:"small"})),o.createElement(Ht.Z,{value:"raw",size:"small",sx:{padding:"5px"}},o.createElement(Zn.Z,{fontSize:"small"}))))),o.createElement(In.ZP,{value:c},o.createElement(ma,{value:"visualization"},h()),o.createElement(ma,{value:"raw"},p())))}),[c,t,n,r,a])}const la=["So many people are just as curious as you are.","Do you know how many types of events on GitHub? - 17 types!","GitHub generates over 4 million new events each day. We synchronize with them in real time and insert updates in milliseconds.","In 2022, 95% of the top 20 most active developers on GitHub are bots.","Python has been the most used back-end programming language for years on GitHub."],ia=["Almost there! Can't wait to see your result!"],ca=[o.createElement(o.Fragment,null,"Querying ",o.createElement("b",null,"5+ billion")," rows of GitHub data..."),o.createElement(o.Fragment,null,"We stay in sync with GitHub event data for ",o.createElement("b",null,"real-time")," insights!"),o.createElement(o.Fragment,null,"We can handle ",o.createElement("b",null,"complex queries")," with a powerful database, even those generated by AI."),o.createElement(o.Fragment,null,o.createElement("b",null,"\ud83d\udc40 Tips"),": Click ",o.createElement("b",null,"Show")," in the upper right corner to check the SQL query generated by AI.")],sa=(0,S.ZP)(Jn)`
  min-height: 42px;
  min-width: 1px;
`,ua=(0,S.ZP)("div")`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0;
  transition: opacity .2s ease;
  margin-right: 12px;
  padding-right: 12px;
  border-right: 1px solid #3c3c3c;
`,da=(0,S.ZP)("span")`
  display: inline-flex;
  align-items: center;
`,ma=(0,S.ZP)(Cn.Z)`
  padding: 0;
`,ga=(0,S.ZP)("div")`
  position: relative;
`;function pa(e){let{search:t}=e;const{phase:n}=b();return o.createElement(o.Fragment,null,o.createElement(Rt,null),o.createElement(na,null),n===p.READY&&o.createElement(xe,{sx:{mt:2}}))}var ha=n(44044),fa=n(60641),Ea=n(64421),ya=n(98948),ba=n(61225);function va(e){let{startColor:t="#794BC5",stopColor:n="#3D44FF",steps:a,sx:r}=e;const l=(0,ba.Z)((e=>e.breakpoints.down("md"))),i=(0,o.useMemo)((()=>{const e=(0,ze.tB)(t).values,o=(0,ze.tB)(n).values;return Je(a.length+1).map((t=>function(e,t,n){let[a,o,r]=e,[l,i,c]=t;const s=1-n;return(0,ze.wy)({type:"rgb",values:[a*s+l*n,o*s+i*n,r*s+c*n]})}(e,o,t/a.length)))}),[t,n,a.length]);return o.createElement(o.Fragment,null,o.createElement("svg",{width:"0",height:"0"},o.createElement("defs",null,a.map(((e,t)=>o.createElement("linearGradient",{id:`explore-step-gradient-${t}`,key:t,x1:"0%",y1:"0%",x2:"100%",y2:"0%"},o.createElement("stop",{offset:"0%",style:{stopColor:i[t],stopOpacity:1}}),o.createElement("stop",{offset:"100%",style:{stopColor:i[t+1],stopOpacity:1}})))))),o.createElement(ya.Z,{sx:r,orientation:l?"vertical":"horizontal"},a.map(((e,t)=>o.createElement(ha.Z,{key:e,completed:!1,active:!0},o.createElement(xa,{fill:`explore-step-gradient-${t}`},e))))))}const xa=(0,S.ZP)(Ea.Z,{shouldForwardProp:e=>"fill"!==e})`
  .${fa.Z.root}.${fa.Z.active} {
    fill: url(#${e=>{let{fill:t}=e;return t}}); // ${e=>{let{color:t}=e;return t}};
  }
`;var wa=n(64232);function Sa(){return o.createElement(T.Z,{component:"section",maxWidth:"md",id:"data-explorer-faq",sx:{py:8}},o.createElement(Fe.Z,{variant:"h2",textAlign:"center",mb:8},"FAQ"),Za.map(((e,t)=>{let{q:n,a:a,id:r}=e;return o.createElement(Ia,{key:t,id:r},o.createElement(Ca,null,n),o.createElement(Aa,null,a))})),o.createElement(Fe.Z,{variant:"body1",textAlign:"center",color:"#929292",fontSize:16,mt:8},"Still having trouble? Contact us, we're happy to help! ",Ma," ",Ta))}const Za=[{q:"How it works",a:o.createElement(va,{steps:["Input your question","Translate the question into SQL","Visualize and output results"]})},{q:"Can I use the AI-powered feature with my own dataset?",a:o.createElement(o.Fragment,null,"Yes! It's built with ",o.createElement(ve,null,"Chat2Query"),", an AI-powered SQL generator in ",o.createElement(ve,null,"TiDB Cloud"),". If you want to explore any other dataset, Chat2Query is an excellent choice.")},{q:"What are the limitations of Data Explorer?",a:o.createElement(o.Fragment,null,o.createElement("ol",null,o.createElement("li",null,"AI is still a work in progress with limitations",o.createElement("br",null),"Its limitations include:",o.createElement("ul",null,o.createElement("li",null,"A lack of context and knowledge of the specific database structure"),o.createElement("li",null,"A lack of domain knowledgestructure"),o.createElement("li",null,"Inability to produce the most efficient SQL statement for large and complex queries"),o.createElement("li",null,"Sometimes service instability")),o.createElement("br",null),"To help AI understand your query intention, please use clear, specific phrases in your question. Check out our question optimization tips. We're constantly working on improving and optimizing it, so any feedback you have is greatly appreciated. Thanks for using!"),o.createElement("br",null),o.createElement("li",null,"The dataset itself is a limitation for our tool"),"All the data we use on this website is sourced from GH Archive, a non-profit project that records and archives all GitHub event data since 2011 (public data only). If a question falls outside of the scope of the available data, it may be difficult for our tool to provide a satisfactory answer."))},{id:"faq-failed-to-generate-sql",q:"Why did it fail to generate an SQL query?",a:o.createElement(o.Fragment,null,"Potential reasons:",o.createElement("ul",null,o.createElement("li",null,"The AI was unable to understand or misunderstood your question, resulting in an inability to generate SQL. To know more about AI's limitations, you can check out the previous question."),o.createElement("li",null,"Network issues."),o.createElement("li",null,"You had excessive requests. Note that you can ask ",o.createElement("b",null,"up to 15 questions per hour"),".")),o.createElement("br",null),"The potential solution is phrase your question which is related GitHub with short, specific words, then try again. And we strongly recommend you use our query templates near the search box to start your exploring.")},{id:"faq-optimize-sql",q:"The query result is not satisfactory. How can I optimize my question?",a:o.createElement(o.Fragment,null,"We use AI to translate your question to SQL. But it's still a work in progress with limitations.",o.createElement("br",null),"To help AI understand your query intention and get a desirable query result, you can rephrase your question using clear, specific phrases related to GitHub. We recommend:",o.createElement("ul",null,o.createElement("li",null,'Using a GitHub login account instead of a nickname. For example, change "Linus" to "torvalds." '),o.createElement("li",null,'Using a GitHub repository\'s full name. For example, change "react" to "facebook/react."'),o.createElement("li",null,'Using GitHub terms. For example, to find Python projects with the most forks in 2022, change your query "The most popular Python projects 2022" to "Python projects with the most forks in 2022."')),o.createElement("br",null),"You can also get inspiration from the suggested queries near the search box.")},{q:"Why did it fail to generate a chart?",a:o.createElement(o.Fragment,null,"Potential reasons:",o.createElement("ul",null,o.createElement("li",null,"The SQL query was incorrect or could not be generated, so the answer could not be found in the database, and the chart could not be generated."),o.createElement("li",null,"The answer was found, but the AI did not choose the correct chart template, so the chart could not be generated."),o.createElement("li",null,"The SQL query was correct, but no answer was found, so the chart could not be displayed.")))},{q:"What technology is Data Explorer built on?",a:o.createElement(o.Fragment,null,"Its major technologies include:",o.createElement("ul",null,o.createElement("li",null,"Data source: GH Archive and GitHub event API",o.createElement("br",null),"GH Archive collects and archives all GitHub data since 2011 and updates it hourly. ",o.createElement("b",null,"By combining the GH Archive data and the GitHub event API, we can gain streaming, real-time data updates.")),o.createElement("li",null,"One database for all workloads:  ",o.createElement(ve,null,"TiDB Cloud"),o.createElement("br",null),"Facing continuously growing large-volume data (currently 5+ billion GitHub events), we need a database that can:",o.createElement("ul",null,o.createElement("li",null,"Store massive data"),o.createElement("li",null,"Handle complex analytical queries"),o.createElement("li",null,"Serve online traffic")),o.createElement(Ue.Z,{href:"https://docs.pingcap.com/tidb/stable/overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301",target:"_blank",rel:"noopener"}," TiDB ")," is an ideal solution. TiDB Cloud is its fully managed cloud Database as a Service. It lets users launch TiDB in seconds and offers the pay-as-you-go pricing model. Therefore, ",o.createElement("b",null,"we choose TiDB Cloud as our backend database.")),o.createElement("li",null,"SQL generator: Chat2Query"),o.createElement(ve,null,"Chat2Query")," is an AI-powered SQL editor in the TiDB Cloud console. We use it to generate SQL for your queries.",o.createElement("li",null,"AI engine: OpenAI"),"To enable users without SQL knowledge to query with this tool, ",o.createElement("b",null,"we use OpenAI to translate the natural language to SQL.")))}],Ia=(0,S.ZP)("div")`
  scroll-margin: 100px;

  &:not(:first-of-type) {
    margin-top: 48px;
  }
`,Ca=(0,S.ZP)("h3")`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
`,Aa=(0,S.ZP)("div")`
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  color: #C1C1C1;
  margin: 0;
`,ka=(0,S.ZP)("a")`
  display: inline-flex;
  vertical-align: text-bottom;
  width: 24px;
  height: 24px;
  text-decoration: none !important;
  align-items: center;
  justify-content: center;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["color","background-color"])}};
  margin-left: 8px;
`,Na=(0,S.ZP)(ka)`
  color: #eaeaea !important;

  &:hover {
    color: white;
  }
`,Pa=(0,S.ZP)(ka)`
  font-size: 18px;
  color: #1D9BF0 !important;
  border-radius: 50%;
  background-color: #eaeaea;

  &:hover {
    background-color: white;
  }
`,Ma=o.createElement(Na,{href:"https://github.com/pingcap/ossinsight/issues",target:"_blank"},o.createElement(De.Z,null)),Ta=o.createElement(Pa,{href:"https://twitter.com/OSSInsight",target:"_blank"},o.createElement(wa.Z,{fontSize:"inherit"}));var La,Fa,Ra;function Ga(){return Ga=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},Ga.apply(this,arguments)}const $a=e=>{let{title:t,titleId:n,...a}=e;return o.createElement("svg",Ga({width:32,height:32,viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-labelledby":n},a),t?o.createElement("title",{id:n},t):null,La||(La=o.createElement("circle",{cx:16,cy:16,r:16,fill:"#fff"})),Fa||(Fa=o.createElement("path",{d:"M8 16.876h1.621v3.938H22.59v-3.938h1.62v3.938c0 .874-.72 1.575-1.62 1.575H9.62C8.73 22.39 8 21.69 8 20.814v-3.938ZM16.105 9l-4.49 4.3 1.151 1.119 2.529-2.466v7.286h1.62v-7.286l2.538 2.466 1.15-1.127L16.106 9Z",fill:"url(#a)"})),Ra||(Ra=o.createElement("defs",null,o.createElement("linearGradient",{id:"a",x1:8,y1:22.389,x2:25.193,y2:22.389,gradientUnits:"userSpaceOnUse"},o.createElement("stop",{stopColor:"#5667FF"}),o.createElement("stop",{offset:1,stopColor:"#A168FF"})))))},Da=e=>{let{size:t}=e;return o.createElement(o.Fragment,null,o.createElement(ve,{as:Ba},o.createElement(za,null,o.createElement(Oa,{className:(0,bt.Z)({[qa.small]:"small"===t})},o.createElement(Fe.Z,{variant:"body2",fontSize:12,color:"#A0A0A0"},"GitHub data is not your focus?"),o.createElement(Ua,{className:(0,bt.Z)({[qa.small]:"small"===t})},o.createElement(_a,{className:(0,bt.Z)({[qa.small]:"small"===t})},o.createElement($a,null)),"Import any dataset"),o.createElement(Ha,{className:(0,bt.Z)({[qa.small]:"small"===t}),width:"228",src:n(10744).Z,alt:"image"})))))},qa=(0,Et.Z)("Ads",["small"]),Ba=(0,S.ZP)("a")`
  display: block;
  text-decoration: none !important;
  background: linear-gradient(90deg, #FFBCA7 2.21%, #DAA3D8 30.93%, #B587FF 67.95%, #6B7AFF 103.3%);
  border-radius: 6px;
  margin-top: 16px;

  opacity: 1;
  cursor: pointer;
  user-select: none;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["box-shadow","transform"])}};

  &:hover {
    box-shadow: ${e=>{let{theme:t}=e;return t.shadows[10]}};
    transform: scale3d(1.02, 1.02, 1.02);
  }
`,za=(0,S.ZP)("div")`
  border-radius: 6px;
  border: dashed 1px var(--ifm-background-color);
  box-sizing: border-box;
`,Oa=(0,S.ZP)("div")`
  background: var(--ifm-background-color);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;

  &.${qa.small} {
    padding: 12px;
  }
`,Ua=(0,S.ZP)("span")`
  background: linear-gradient(90deg, #5667FF 0%, #A168FF 106.06%);
  box-shadow: ${e=>{let{theme:t}=e;return t.shadows[4]}};
  border-radius: 48px;
  display: flex;
  align-items: center;
  padding: 12px !important;
  font-weight: 600;
  font-size: 16px;
  color: white !important;
  text-decoration: none !important;
  margin-top: 8px;

  &.${qa.small} {
    font-size: 14px;
  }
`,_a=(0,S.ZP)("span")`
  display: inline-flex;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background: white;
  color: #5667FF;
  margin-right: 16px;
  min-width: 32px;
  font-size: 20px;

  &.${qa.small} {
    width: 24px;
    height: 24px;
    min-width: 24px;
    font-size: 16px;
    margin-right: 8px;
  }
`,Ha=(0,S.ZP)("img")`
  max-width: 100%;

  &.${qa.small} {
    max-width: 90%;
  }
`;function Qa(){return o.createElement(Wa,null,o.createElement(at,{variant:"text",n:4,title:(e,t)=>o.createElement(Fe.Z,{variant:"h3",mb:0,fontSize:16},"\ud83d\udca1 Get inspired",o.createElement(oe.Z,{onClick:e,disabled:t},o.createElement(Ge.Z,{fontSize:"inherit"})))}),o.createElement(Va,{to:"/explore/"},"> See more"),o.createElement(Ut.Z,{orientation:"horizontal",sx:{my:2}}),o.createElement(Da,{size:"small"}))}const Wa=(0,S.ZP)("div")`
  position: sticky;
  top: 92px;
`,Va=(0,S.ZP)(Ue.Z)`
  font-size: 14px;
`;var Ka=n(63675),ja=n(25425),Ya=n(7449);const Xa=(0,o.forwardRef)((function(e,t){const[n,a]=(0,o.useState)(!1),[r,l]=(0,Ka.Z)("ossinsight.explore.tips-history",{serializer:e=>JSON.stringify(e.map((e=>e.toJSON()))),deserializer:e=>{try{const t=JSON.parse(e);return t instanceof Array?t.map((e=>yn.ou.fromISO(e))).filter((e=>e.diffNow("days").days<30)):[]}catch{return[]}},defaultValue:[]}),i=(0,d.Z)((()=>{})),c=(0,Z.Z)((()=>{a(!1)}));return(0,Ya.h)(t,{show:i}),o.createElement(_t.Z,null,o.createElement(ja.Z,{direction:"left",in:n},o.createElement(Ja,null,o.createElement(eo,null),o.createElement(to,null),o.createElement(no,null,o.createElement(un.Z,null,"Glad you enjoy the exploration \ud83d\ude03 Try ",o.createElement(ve,null,"Chat2Query")," to empower your own data exploration."),o.createElement(ao,{size:"small",onClick:c},o.createElement(ie.Z,null))))))})),Ja=(0,S.ZP)("div")`
  position: fixed;
  top: 50vh;
  right: 16px;
  display: flex;
  flex-direction: row-reverse;

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    flex-direction: column;
    align-items: flex-end;
  }
`,eo=(0,S.ZP)("div")`
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;
  width: 32px;
  height: 32px;
`,to=(0,S.ZP)("div")`
  width: 16px;
  height: 16px;
`,no=(0,S.ZP)(sn.Z)`
  background: #333333;
  max-width: 300px;
  position: relative;

  a {
    color: white;
    text-decoration: underline;
  }
`,ao=(0,S.ZP)(oe.Z)`
  position: absolute;
  right: 8px;
  top: 8px;
`;function oo(e){let{onChange:t,value:n}=e;const{data:a=[]}=(0,Xe.ZP)("explore-tags",{fetcher:u,revalidateOnFocus:!1,revalidateOnReconnect:!1});return o.createElement(io,null,o.createElement(le.Z,{direction:"row",spacing:1,flexWrap:"nowrap",width:"max-content"},o.createElement(lo,{color:"#ccc",className:(0,bt.Z)({[ro.active]:null==n}),onClick:e=>{null==t||t(e,null)}},"All"),o.createElement(Ut.Z,{orientation:"vertical",flexItem:!0}),a.map((e=>o.createElement(lo,{key:e.id,color:e.color,className:(0,bt.Z)({[ro.active]:e.id===(null==n?void 0:n.id)}),onClick:n=>{null==t||t(n,e)}},e.label)))))}const ro=(0,Et.Z)("TagItem",["active"]),lo=(0,S.ZP)("span",{shouldForwardProp:e=>"color"!==e})`
  display: inline-block;
  color: ${e=>{let{color:t}=e;return t}};
  background-color: ${e=>{let{color:t}=e;return(0,ze.Fq)(t,.1)}};
  border: 1px solid ${e=>{let{color:t}=e;return(0,ze.Fq)(t,.3)}};
  padding: 4px 12px;
  border-radius: 24px;
  font-size: 12px;
  user-select: none;
  cursor: pointer;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["color","background-color","border-color","font-weight"])}};
  min-width: 60px;
  text-align: center;
  white-space: nowrap;
  justify-self: stretch;

  &:hover {
    color: ${e=>{let{color:t}=e;return(0,ze._j)(t,.6)}};
    background-color: ${e=>{let{color:t}=e;return(0,ze.Fq)(t,.8)}};
    border-color: ${e=>{let{color:t}=e;return(0,ze.Fq)(t,.8)}};
  }

  &.${ro.active} {
    color: ${e=>{let{color:t}=e;return(0,ze._j)(t,.6)}};
    background-color: ${e=>{let{color:t}=e;return t}};
    border-color: ${e=>{let{color:t}=e;return t}};
    font-weight: bold;
  }
`,io=(0,S.ZP)("div")`
  overflow-x: auto;
  padding-bottom: 12px;
`;var co=n(32440),so=n(91680),uo=n(54225);function mo(e){let{n:t,tagId:n}=e;const{data:a=[],loading:r}=tt(!1,t,n),[l,i]=(0,o.useState)(!1),[c,s]=(0,o.useState)(!1);(0,o.useEffect)((()=>{s(a.length>20)}),[a]);const u=(0,o.useMemo)((()=>l?a:a.slice(0,20)),[a,l]),d=(0,Z.Z)((()=>{i(!0)})),m=(0,Z.Z)((()=>{st("explore-questions-list",!1)(),i(!1)}));return o.createElement(go,{id:"explore-questions-list"},o.createElement(nt,{n:t,disabled:r,questions:u,variant:"text",questionPrefix:o.createElement(co.Z,{sx:{color:"#959595",verticalAlign:"text-bottom"},color:"inherit",fontSize:"inherit"}),showTags:!0}),!l&&c&&o.createElement(Ut.Z,null,o.createElement(uo.Z,{variant:"text",color:"inherit",onClick:d},"See More")),l&&c&&o.createElement(Ut.Z,null,o.createElement(oe.Z,{color:"inherit",onClick:m},o.createElement(so.Z,null))))}const go=(0,S.ZP)("div")`
  scroll-margin: 140px;
`,po=[{question:"How diverse is django's community (by coders' distribution)",questionId:"d4ba4997-80a9-413e-bf01-ba3e513fc9e3",imageUrl:n(64731).Z,tags:[{id:2,label:"Repositories",color:"#a3fcc8",sort:2,createdAt:"2023-01-19T02:36:34.000+00:00"}]},{question:"Summary of @gvanrossum's contribution by event type in 2022",questionId:"293d799b-f480-4f8f-bf9d-20be52d95884",imageUrl:n(94486).Z,tags:[{id:1,label:"Developers",color:"#f2ac99",sort:1,createdAt:"2023-01-19T02:36:34.000+00:00"}]}];function ho(){const[e,t]=(0,o.useState)(null),n=(0,Z.Z)(((e,n)=>{t(n)}));return o.createElement(qe.ZP,{container:!0,spacing:4},o.createElement(qe.ZP,{item:!0,xs:12,md:5,lg:4},o.createElement(Fe.Z,{variant:"h3",fontSize:16,mb:2},"\ud83d\udca1 Popular questions"),po.map(((e,t)=>o.createElement(We,(0,qt.Z)({key:t},e)))),o.createElement(Da,null)),o.createElement(qe.ZP,{item:!0,xs:12,md:7,lg:8},o.createElement(oo,{value:e,onChange:n}),o.createElement(x.Z,null,o.createElement(mo,{n:100,tagId:(null==e?void 0:e.id)??void 0}))))}function fo(){var e;const{question:t,loading:n,load:a,error:r,phase:i,reset:c,create:s}=E({pollInterval:2e3}),[u,d]=(0,v.ZP)("id",(0,v.Rc)(),!0),[m,g]=(0,o.useState)(""),f=(0,o.useRef)(null),b=!h.has(i),S=b||(0,l.oM)(m),C=(0,l.Rw)(null==t?void 0:t.id)&&!n&&i!==p.CREATE_FAILED&&(0,l.Rw)(u),k=((null==t||null==(e=t.result)?void 0:e.rows.length)??0)>0;(0,o.useEffect)((()=>{(0,l.nf)(t)&&g(t.title)}),[null==t?void 0:t.title]),(0,o.useEffect)((()=>{(0,l.nf)(u)?a(u):P()}),[u]),(0,o.useEffect)((()=>{(0,l.nf)(null==t?void 0:t.id)&&d(null==t?void 0:t.id)}),[n,null==t?void 0:t.id]);const N=(0,Z.Z)((()=>{b||s(m)})),P=(0,Z.Z)((()=>{c(),g(""),d(void 0)})),M=(0,Z.Z)((e=>{g(e),s(e)})),T=(0,Z.Z)(((e,t)=>{u!==e&&(g(t??""),a(e))})),L=(0,Z.Z)((()=>{var e;null==(e=f.current)||e.show()})),F=!C&&(i===p.READY||i===p.SUMMARIZING)&&k;return o.createElement(y.Provider,{value:{phase:i,question:t,loading:n,error:r,create:s,load:a,reset:c}},o.createElement(I.Provider,{value:{search:m,handleSelect:M,handleSelectId:T,showTips:L}},o.createElement(A,null),o.createElement(G,{showSide:F,showHeader:C,showFooter:C,header:o.createElement(Y,null),side:o.createElement(Qa,null)},o.createElement(he,{state:C?"recommend":"execution",direction:C?"down":"up"},o.createElement(x.Z,{key:"recommend"}),o.createElement(yo,{key:"execution",source:Eo,interval:4e3,prefix:o.createElement("span",null,o.createElement("b",null,"\ud83d\udccc Tips:"))})),o.createElement(de,{value:m,onChange:g,onAction:N,disableInput:b,disableClear:""===m,disableAction:S,onClear:P,clearState:b?"stop":void 0}),o.createElement(he,{state:C?"recommend":"execution",direction:C?"down":"up"},o.createElement(x.Z,{key:"execution",sx:{mt:1.5}},o.createElement(w.Z,null,o.createElement(pa,{search:m}))),o.createElement(x.Z,{key:"recommend",sx:{mt:4}},o.createElement(ho,null)))),o.createElement(Sa,null),o.createElement(Xa,{ref:f})))}const Eo=["Use a GitHub username instead of a nickname.",'Use a GitHub repository\'s full name. For example, change "react" to "facebook/react."',"Use GitHub terms like fork, star, and watch.",'Use specific phrases. For example, use "by star" or "by fork" to measure repo popularity.','Add your requirement for the result. For example, "group by language."'],yo=(0,S.ZP)(Jn)`
  color: #9B9B9B;
  font-style: italic;
  font-size: 12px;
  margin-bottom: 8px;
`;function bo(){return o.createElement(a.Z,{title:"Data Explorer: Discover insights in GitHub event data with AI-generated SQL",description:"Simply ask your question in natural language and Data Explore will generate SQL, query the data, and present the results visually.",keywords:"GitHub data, text to SQL, query tool, Data Explorer, GPT-3, AI-generated SQL",image:"/img/data-explorer-thumbnail.png",tidbCloudLinkCampaign:"chat2query_202301",tidbCloudLinkTrial:!0},o.createElement(fo,null))}},8106:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(67294),o=n(86010),r=n(95999);const l={copyButtonCopied:"copyButtonCopied__QnY",copyButtonIcons:"copyButtonIcons_FhaS",copyButtonIcon:"copyButtonIcon_phi_",copyButtonSuccessIcon:"copyButtonSuccessIcon_FfTR"};function i(e){let{code:t,className:n}=e;const[i,c]=(0,a.useState)(!1),s=(0,a.useRef)(void 0),u=(0,a.useCallback)((()=>{var e;e=t,navigator.clipboard.writeText(e).catch(console.error),c(!0),s.current=window.setTimeout((()=>{c(!1)}),1e3)}),[t]);return(0,a.useEffect)((()=>()=>window.clearTimeout(s.current)),[]),a.createElement("button",{type:"button","aria-label":i?(0,r.I)({id:"theme.CodeBlock.copied",message:"Copied",description:"The copied button label on code blocks"}):(0,r.I)({id:"theme.CodeBlock.copyButtonAriaLabel",message:"Copy code to clipboard",description:"The ARIA label for copy code blocks button"}),title:(0,r.I)({id:"theme.CodeBlock.copy",message:"Copy",description:"The copy button label on code blocks"}),className:(0,o.Z)("clean-btn",n,l.copyButton,i&&l.copyButtonCopied),onClick:u},a.createElement("span",{className:l.copyButtonIcons,"aria-hidden":"true"},a.createElement("svg",{className:l.copyButtonIcon,viewBox:"0 0 24 24"},a.createElement("path",{d:"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"})),a.createElement("svg",{className:l.copyButtonSuccessIcon,viewBox:"0 0 24 24"},a.createElement("path",{d:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}))))}},88242:(e,t,n)=>{n.d(t,{Z:()=>c});var a=n(87462),o=n(35198),r=n(67294),l=n(61802),i=n(61953);function c(e){let{children:t,header:n,dark:c,sideWidth:s,Side:u,footer:d=!0,...m}=e;return(0,r.useLayoutEffect)((()=>{var e;const t=location.hash.replace(/^#/,"");null==(e=document.getElementById(t))||e.scrollIntoView()}),[]),r.createElement(o.Z,(0,a.Z)({},m,{customFooter:d,header:n,sideWidth:s,side:s&&(0,l.nf)(u)?r.createElement(i.Z,{component:"aside",width:s,position:"sticky",top:"calc(var(--ifm-navbar-height) + 76px)",height:0,zIndex:0},r.createElement(i.Z,{marginTop:"-76px",height:"calc(100vh - var(--ifm-navbar-height))"},r.createElement(u,null))):void 0}),r.createElement("div",{hidden:!0,style:{height:72}}),r.createElement("div",{style:{paddingLeft:s,paddingRight:s}},r.createElement("main",{style:{"--ifm-container-width-xl":"1200px"}},t)))}},7449:(e,t,n)=>{function a(e,t){null!=e&&("function"==typeof e?e(t):e.current=t)}n.d(t,{h:()=>a})},1969:(e,t,n)=>{n.d(t,{$Z:()=>l,BE:()=>r,OA:()=>i,PE:()=>o});var a=n(86459);function o(e,t){let{title:n,via:o,hashtags:r=[],related:l=[]}=t;return"https://twitter.com/share"+(0,a.Z)({url:e,text:n,via:o,hashtags:r.length>0?r.join(","):void 0,related:l.length>0?l.join(","):void 0})}function r(e,t){let{title:n,summary:o,source:r}=t;return"https://linkedin.com/shareArticle"+(0,a.Z)({url:e,mini:"true",title:n,summary:o,source:r})}function l(e,t){let{title:n}=t;return"https://www.reddit.com/submit"+(0,a.Z)({url:e,title:n})}function i(e,t){let{title:n}=t;return"https://telegram.me/share/url"+(0,a.Z)({url:e,text:n})}},10744:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/ads-prompts-5ada2bd55c29fafc21852128faf6e561.png"},64731:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/img1-79dc4acc44456d51dfe3db748dff5e1d.png"},94486:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/img2-eaddb15a27b813952442c1e6ef733101.png"}}]);