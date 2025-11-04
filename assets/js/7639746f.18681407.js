"use strict";(self.webpackChunkweb=self.webpackChunkweb||[]).push([[2374],{6068:(e,t,n)=>{n.d(t,{vz:()=>o,A3:()=>S,if:()=>b,uc:()=>c,y:()=>C});var a=n(67294),r=n(60338);function o(e){let{seriesName:t="Count",data:n,loading:o=!1,clear:l=!1,size:i,n:c,deps:s=[],categoryIndex:u,valueIndex:d,type:m="repo"}=e;i="lang"===m?48:i;const h=(0,a.useMemo)((()=>({tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},grid:{containLabel:!0,left:(l?0:8)+("owner"===m?24:0),top:l?0:16,bottom:l?0:16},xAxis:{type:"value",position:"top"},yAxis:{type:"category",data:n.map((e=>e[u])),inverse:!0,axisLabel:{rotate:0,formatter:function(e,t){switch(m){case"repo":default:return e;case"owner":case"lang":return`${e} {${e.replace(/[+-[\]]/g,"_")}|}`}},rich:(()=>{switch(m){case"owner":return n.reduce(((e,t)=>{var n;return e[String(t[u]).replace(/[-[\]]/g,"_")]={backgroundColor:{image:(n=`${t[u]}`,n.includes("[bot]")?"https://github.com/github.png":`https://github.com/${n}.png`)},width:24,height:24},e}),{});case"lang":return n.reduce(((e,t)=>(e[String(t[u]).replace(/\+/g,"_")]={backgroundColor:{image:`/img/lang/${t[u]}.png`},width:48,height:48},e)),{})}})()}},series:[{name:t,data:n.map((e=>e[d])),type:"bar",barWidth:l?i/2:i}]})),[n,...s,u,d,i,l]),g=(0,a.useMemo)((()=>o?400:Math.max(Math.min(c,n.length),5)*(i*(l?1:1.5))),[i,o,l]),p=(0,a.useMemo)((()=>({click:e=>{("repo"===m&&"name"in e||"owner"===m&&"name"in e)&&window.open(`https://github.com/${e.name}`)}})),[]);return a.createElement(r.ZP,{height:g,showLoading:o,option:h,notMerge:!1,lazyUpdate:!0,style:{marginBottom:16,borderRadius:"var(--ifm-global-radius)"},onEvents:p})}var l=n(55673),i=n(61802);function c(e){let{seriesName:t,loading:n,data:o,compareData:c,categoryIndex:s,valueIndex:u,deps:d=[]}=e;const m=function(e){return(0,a.useMemo)((()=>({type:"pie",radius:["35%","65%"],avoidLabelOverlap:!1,itemStyle:{borderColor:e?"#1e1e1f":"#ffffff",borderWidth:0},label:{show:!1,position:"center",formatter:"{b}: {d}%"},emphasis:{label:{show:!0,fontSize:"20",fontWeight:"bold",formatter:"{b}\n\n{c}"}},labelLine:{show:!1}})),[e])}((0,l.e)()),h=(0,a.useMemo)((()=>{const e=[],n={...m,name:t,data:o.map((e=>{const t=e[s];return{value:e[u],name:t}}))};if(e.push(n),(0,i.nf)(c)){n.center=["25%","55%"];const a={...m,name:t,center:["65%","55%"],data:c.map((e=>{const t=e[s];return{value:e[u],name:t}}))};e.push(a)}return e}),[m,o,c,...d,s,u]),g=(0,a.useMemo)((()=>({tooltip:Object.assign({trigger:"item"}),legend:{type:"scroll",orient:"vertical",right:"20px",top:20,bottom:20,x:"right",formatter:"{name}"},series:h,grid:{left:16,top:16,bottom:16,right:16,containLabel:!0}})),[h]);return a.createElement(r.ZP,{aspectRatio:16/9,showLoading:n,option:g,notMerge:!1,lazyUpdate:!0})}var s=n(91262),u=n(33841),d=n(18360),m=n(2734),h=n(61730),g=n(5616),p=n(94054),E=n(18972);const f=[];for(let I=-12;I<=13;I++)f.push(I);const v=["0h","1h","2h","3h","4h","5h","6h","7h","8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h","21h","22h","23h"],y=["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];function b(e){let{loading:t,data:n,xAxisColumnName:o,yAxisColumnName:l,valueColumnName:i,deps:c}=e;const b=(0,m.Z)(),x=(0,h.Z)(b.breakpoints.down("sm")),[Z,w]=(0,a.useState)(0),S=(0,a.useCallback)((e=>{w(e.target.value)}),[w]),{data:A,min:C,max:I}=(0,a.useMemo)((()=>{let e=Number.MAX_VALUE,t=Number.MIN_VALUE;const a=n.map((n=>{const a=Number(n[i]);return a>t&&(t=a),a<e&&(e=a),[(n[o]+Z+24)%24,n[l],a]}));return{data:a,min:e,max:t}}),[n,Z,x]),k=(0,a.useMemo)((()=>({tooltip:{show:!0},grid:x?{top:"0",bottom:"0",left:"0",right:"0",containLabel:!0}:{top:"0",bottom:"16%",left:"0",right:"0",containLabel:!0},xAxis:{type:"category",data:v,splitArea:{show:!0},nameLocation:"middle",nameGap:50,nameTextStyle:{fontSize:13,fontWeight:"bold",color:"#959aa9"},axisLabel:{color:"#959aa9",fontWeight:"bold"},inverse:!1},yAxis:{type:"category",data:y,splitArea:{show:!0},nameLocation:"middle",nameGap:50,nameTextStyle:{fontSize:13,fontWeight:"bold",color:"#959aa9"},axisLabel:{color:"#959aa9",fontWeight:"bold",rotate:0,fontSize:x?8:void 0},position:"top"},visualMap:{show:!x,min:C,max:I,orient:x?void 0:"horizontal",left:"center",bottom:0},series:{type:"heatmap",data:A,label:{show:!1},emphasis:{itemStyle:{shadowBlur:10,shadowColor:"rgba(0, 0, 0, 0.5)"}}}})),[A,x,...c]);return a.createElement(s.Z,null,(()=>a.createElement(g.Z,null,a.createElement(g.Z,{sx:{minWidth:120,mb:1}},a.createElement(p.Z,{size:"small"},a.createElement(u.Z,{id:"zone-select-label"},"Timezone (UTC)"),a.createElement(d.Z,{labelId:"zone-select-label",id:"zone-select",value:Z,label:"Timezone (UTC)",onChange:S,sx:{minWidth:120},variant:"standard"},f.map((e=>a.createElement(E.Z,{key:e,value:e},e>0?`+${e}`:e)))))),a.createElement(r.ZP,{aspectRatio:2.4,showLoading:t,option:k,notMerge:!1,lazyUpdate:!0}))))}var x=n(61084),Z=n(34673),w=n(88078);function S(e){let{sql:t,children:n}=e;return a.createElement(a.Fragment,null,a.createElement(Z.Z,{summary:a.createElement("summary",null,"Click here to expand SQL")},(e=>{let t;return t=e?a.createElement(x.Z,{className:"language-sql"},e):a.createElement(g.Z,{sx:{pt:.5}},a.createElement(w.Z,{width:"80%"}),a.createElement(w.Z,{width:"50%"}),a.createElement(w.Z,{width:"70%"})),t})(t)),n)}var A=n(30454);function C(e){void 0===e&&(e=!0);const t="#E9EAEE",n="#2c2c2c",a="#3c3c3c",r=function(){return{axisLine:{lineStyle:{color:a}},axisTick:{lineStyle:{color:a}},axisLabel:{color:"#ccc"},splitLine:{lineStyle:{type:"dashed",color:"#2c2c2c",width:.5}},splitArea:{areaStyle:{color:t}},axisPointer:{label:{backgroundColor:n}},nameTextStyle:{fontStyle:"italic",color:"gray"}}},o=["#dd6b66","#759aa0","#e69d87","#8dc1a9","#ea7e53","#eedd78","#73a373","#73b9bc","#7289ab","#91ca8c","#f49f42"],l={color:o,backgroundColor:"rgba(24, 25, 26)",tooltip:{backgroundColor:n,textStyle:{color:t},borderWidth:0,shadowBlur:8,shadowColor:"rgba(0, 0, 0, 0.618)",shadowOffsetX:0,shadowOffsetY:0,axisPointer:{lineStyle:{color:t},crossStyle:{color:t}},renderMode:"html"},grid:{containLabel:!0},legend:{textStyle:{color:t}},textStyle:{color:t},title:{left:"center",top:8,textStyle:{color:t,fontSize:14,align:"center"}},toolbox:{iconStyle:{borderColor:t}},dataZoom:{textStyle:{color:t}},timeline:{lineStyle:{color:t},itemStyle:{color:o[1]},label:{color:t},controlStyle:{color:t,borderColor:t}},timeAxis:r(),logAxis:r(),valueAxis:r(),categoryAxis:r(),line:{symbol:"circle"},graph:{color:o},gauge:{title:{textStyle:{color:t}}},candlestick:{itemStyle:{color:"#FD1050",color0:"#0CF49B",borderColor:"#FD1050",borderColor0:"#0CF49B"}},visualMap:{textStyle:{color:t}}};l.categoryAxis.splitLine.show=!1,(0,A.aW)("dark",l)}},74601:(e,t,n)=>{n.d(t,{O:()=>l,S:()=>o});var a=n(61802);let r;function o(e){r=e}function l(){if((0,a.Rw)(r))throw new Error("out of analyze chart context!");return r}},37031:(e,t,n)=>{n.d(t,{dC:()=>r,gx:()=>u,pW:()=>o,up:()=>c,wN:()=>l,yv:()=>i});var a=n(26667);const r="original",o="comparing";function l(e,t){return s(r,e,t)}function i(e,t){return s(o,e,t)}function c(e){return(0,a.XK)((t=>{let{datasetId:n,data:a}=t;return[s(n,a,e)]}))}function s(e,t,n){var a;const r=(null==t||null==(a=t.data)?void 0:a.data)??[];return{id:e,source:null!=n?n(r):r}}function u(e,t,n){return void 0===e&&(e=r),void 0===n&&(n=void 0),{id:e,source:t,dimensions:n}}},75559:(e,t,n)=>{n.d(t,{pW:()=>r.pW,n4:()=>C,Kb:()=>o,rs:()=>i,AH:()=>b,yv:()=>r.yv,vy:()=>L,gx:()=>r.gx,bh:()=>w,Sd:()=>c,BZ:()=>I,CI:()=>q,j3:()=>R,jv:()=>l,JJ:()=>x,wN:()=>r.wN,e5:()=>s,up:()=>r.up,BE:()=>A,TN:()=>T,wq:()=>M,P6:()=>a,E7:()=>y,Gn:()=>F,Mm:()=>N});var a={};n.r(a),n.d(a,{adjustAxis:()=>D,aggregate:()=>k.m_,debugPrintOption:()=>k.bR,min:()=>k.VV,simple:()=>k.lC,template:()=>k.XK});var r=n(37031);function o(e,t,n){return void 0===n&&(n={}),{name:String(t),datasetId:r.dC,...n,type:"bar",encode:{x:e,y:t,...n.encode}}}function l(e,t,n){return void 0===n&&(n={}),{name:String(t),datasetId:r.dC,showSymbol:!1,...n,type:"line",encode:{x:e,y:t,...n.encode}}}function i(e,t,n){return void 0===n&&(n={}),{datasetId:r.dC,...n,type:"boxplot",encode:{x:e,y:t,tooltip:t,...n.encode}}}function c(e,t,n,a){return void 0===a&&(a={}),{datasetId:r.dC,emphasis:{itemStyle:{shadowBlur:10,shadowColor:"rgba(0, 0, 0, 0.5)"}},...a,type:"heatmap",encode:{x:e,y:t,value:n,...a.encode}}}function s(e,t,n,a){void 0===a&&(a={});const r={coordinateSystem:"geo",encode:{lng:1,lat:2,value:3,tooltip:[0,3],itemId:0},symbolSize:e=>1+64*Math.sqrt(e[3]/n),...a};return[{type:"effectScatter",datasetId:`${e}_top_${t}`,...r},{type:"scatter",datasetId:`${e}_rest`,...r}]}var u=n(9996),d=n.n(u),m=n(31486),h=n.n(m),g=n(74601);function p(){const{isSmall:e}=(0,g.O)();return e}var E=n(30120),f=n(61802);function v(e,t){return t.includes(e)?e:void 0}function y(e,t){void 0===t&&(t={});const n=p();return d()(t,{id:e,type:"value",axisLabel:{formatter:e=>h()(e),margin:8},splitNumber:n?3:void 0,axisPointer:{label:{precision:0}},nameTextStyle:{opacity:n?0:1,align:v(t.position??"left",["left","right"])}})}function b(e,t){return void 0===t&&(t={}),d()(t,{id:e,type:"category",nameTextStyle:{align:v(t.position??"left",["left","right"])}})}function x(e,t){void 0===t&&(t={});const n=p();return d()(t,{id:e,type:"log",nameTextStyle:{opacity:n?0:1,align:v(t.position??"left",["left","right"])},splitNumber:n?3:void 0,axisLabel:{margin:8}})}const Z=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],w=e=>{const t=new Date(e);return`${Z[t.getMonth()]} ${t.getFullYear()}`},S=new Date;function A(e,t,n){return void 0===t&&(t={}),void 0===n&&(n="event_month"),d()(t,{id:e,type:"time",axisPointer:{label:{formatter:e=>{let{value:t}=e;return w(t)}}},min:(0,f.N6)(n)?!0===n?void 0:E.ou.fromISO(k.VV(n)).minus({month:1}).toJSDate():new Date(2011,0,1,0,0,0,0),max:E.ou.fromJSDate(new Date(S.getFullYear(),S.getMonth(),1,0,0,0,0)).plus({month:1}).toJSDate(),minInterval:24192e5})}function C(e,t){return void 0===t&&(t={}),{...t,show:!0,trigger:"axis",axisPointer:{...t.axisPointer,type:e}}}function I(e){return void 0===e&&(e={}),{renderMode:"html",...e,show:!0,trigger:"item"}}var k=n(26667);function T(e,t){void 0===t&&(t={});const{context:n,isSmall:a,comparingRepoName:r}=(0,g.O)();if(a)return;if((0,f.N6)(n.layout)||!r)return e?[{...t,text:e}]:[];const{layout:o,layoutTop:l,layoutSubGridHeight:i,layoutGap:c}=n;return"top-bottom"===o?(0,k.XK)(((e,t)=>{let{name:n}=e;return{text:n,textStyle:{fontWeight:"normal",color:"gray"},left:"center",top:l+(i+c)*t-24}})).concat(e?[{...t,text:e}]:[]):(0,k.XK)(((e,t)=>{let{name:n}=e;return{text:n,textStyle:{fontWeight:"normal",color:"gray"},left:25+50*t+"%",top:8}})).concat(e?{...t,text:e}:[])}function L(e){return void 0===e&&(e=void 0),p()?{show:!1}:{show:!0,left:8,right:8,realtime:!0,xAxisId:(0,k.XK)((e=>{let{id:t}=e;return t})),...e}}function N(){return{roam:!1,map:"world",silent:!0,zoom:1.7,top:"35%",projection:{project:e=>[e[0]/180*Math.PI,-Math.log(Math.tan((Math.PI/2+e[1]/180*Math.PI)/2))],unproject:e=>[180*e[0]/Math.PI,360/Math.PI*Math.atan(Math.exp(e[1]))-90]},itemStyle:{color:"#ccc",borderWidth:1,borderColor:"#ccc"}}}function R(e){return void 0===e&&(e={}),p()?{left:"center",padding:[0,32],top:0,type:"scroll",...e,orient:"horizontal"}:{left:8,top:8,...e,show:!0}}function F(e,t){return{show:!p(),min:0,max:t,orient:"horizontal",left:"center",bottom:8}}function P(e,t){void 0===t&&(t={});const n=p();return{top:n?32:64,bottom:n?8:48,left:n?0:8,right:n?0:8,...t,id:e}}function M(){const{context:e,height:t,isSmall:n,comparingRepoName:a}=(0,g.O)();if(a){const a=32,r=n?32:64,o=n?8:48,l=(t-r-o-a)/2,i=o+l+a,c=r+l+a;return e.layout="top-bottom",e.layoutTop=r,e.layoutSubGridHeight=l,e.layoutGap=a,[P("main",{top:r,bottom:i}),P("vs",{top:c,bottom:o})]}return P("main")}function q(){const{context:e,comparingRepoName:t}=(0,g.O)();return t?(e.layout="left-right",[P("main",{left:"8",right:"52%",top:"64",bottom:"48"}),P("vs",{left:"52%",right:"8",top:"64",bottom:"48"})]):P("main")}var G=n(51252);function D(e,t){if(0===e.length)return t.map((()=>({min:0,max:0})));const n=t.map((t=>function(e,t){if(0!==e.length)return e.reduce(((e,n)=>{const a=[...e];for(const r of t){const e=n[r];a[0]=Math.min(e,a[0]),a[1]=Math.max(e,a[1])}return a}),[Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER])}(e,t))),a=n.reduce(((e,t)=>e||(0,f.nf)(t)&&t[1]>=0),!1),r=n.reduce(((e,t)=>e||(0,f.nf)(t)&&t[0]<=0),!1);if(!a||!r)return t.map((()=>({min:0,max:0})));let o=1/0;const l=[];for(const i of n)if((0,f.nf)(i)){const[e,t]=i;l.push(o);const n=Math.min(Math.abs(o-1));Math.max(t/-e-1)<n&&(o=t/-e)}else l.push(void 0);return n.map((e=>{if(e){const[t,n]=e;return{min:(0,G.r)(Math.min(t,-n/o)),max:(0,G.r)(Math.max(n,-t*o))}}return{min:0,max:0}}))}},26667:(e,t,n)=>{n.d(t,{VV:()=>s,XK:()=>l,bR:()=>u,lC:()=>i,m_:()=>c});var a=n(74601),r=n(37031),o=n(61802);function l(e){const{repoName:t,comparingRepoName:n,repoInfo:o,comparingRepoInfo:l,data:i,compareData:c,context:s}=(0,a.O)();let u=[];return u=u.concat(e({id:"main",datasetId:r.dC,repoInfo:o,data:i,name:t,context:s},0)),n&&(u=u.concat(e({id:"vs",datasetId:r.pW,repoInfo:l,data:c,name:n,context:s},1))),u}function i(e,t){const{comparingRepoName:n}=(0,a.O)();return n?t:e}function c(e){const{data:t,repoName:n,compareData:r,comparingRepoName:l}=(0,a.O)(),i=[],c=[];return(0,o.nf)(t)&&(i.push(t),c.push(n)),(0,o.nf)(r)&&(i.push(r),c.push(l)),e(i,c)}function s(e){const t=c((t=>t.flatMap((t=>{var n,a,r;return(null==(n=t.data)||null==(a=n.data)||null==(r=a[0])?void 0:r[e])??[]}))));return t.length>=2?t[0]<t[1]?t[0]:t[1]:1===t.length?t[0]:void 0}function u(){const{context:e}=(0,a.O)();e.DEBUG_PRINT_OPTION=!0}},51252:(e,t,n)=>{function a(e){if(0===e)return 0;const t=Math.sign(e),n=Math.abs(e);let a=1;for(;n>a;)a*=10;return a/=20,(Math.floor(n/a)+1)*a*t}n.d(t,{r:()=>a})},68971:(e,t,n)=>{n.d(t,{Pd:()=>l,RI:()=>c,nD:()=>i});var a=n(67294),r=n(22638);function o(){const e=(0,a.useRef)(!1);return(0,a.useEffect)((()=>(e.current=!0,()=>{e.current=!1})),[]),e}function l(){const e=o();return(0,a.useCallback)((t=>function(){e.current&&t.apply(this,arguments)}),[])}function i(){const e=o();return(0,a.useCallback)((t=>{e.current&&t()}),[])}function c(){const e=(0,a.useRef)(!1),t=(0,a.useRef)();return(0,a.useEffect)((()=>(e.current=!0,()=>{e.current=!1,clearTimeout(t.current)})),[]),(0,r.Z)((function(n,a){for(var r=arguments.length,o=new Array(r>2?r-2:0),l=2;l<r;l++)o[l-2]=arguments[l];clearTimeout(t.current);const i=setTimeout((function(){e.current&&n(...arguments)}),a,...o);return t.current=i,i}))}},4882:(e,t,n)=>{n.d(t,{P:()=>c,c:()=>s});var a=n(67294),r=n(68971),o=n(8100),l=n(2068),i=n(71406);function c(e){const[t,n]=(0,a.useState)(e),[r,o]=(0,a.useState)(!1),[i,c]=(0,a.useState)(),s=(0,l.Z)((function(e,t){void 0===t&&(t=!1),t&&n(void 0),o(!0),c(void 0),e.then(n,c).finally((()=>{o(!1)}))})),u=(0,l.Z)((()=>{n(void 0),o(!1),c(i)}));return{data:t,loading:r,error:i,setAsyncData:s,clearState:u}}function s(e,t,n){const c=(0,i.Gb)(),s=(0,r.Pd)(),[u,d]=(0,a.useState)(!1),[m,h]=(0,a.useState)(),[g,p]=(0,a.useState)(),E=(0,a.useRef)(e),f=(0,a.useRef)(t),v=(0,a.useRef)(!1);(0,a.useEffect)((()=>{E.current=e,f.current=t,d(!1),h(void 0),p(void 0),v.current=!1}),[t,(0,o.wE)([e])]);const y=(0,l.Z)((async()=>{let e;try{e=await c(n)}catch{return}v.current||(d(!0),p(void 0),h(void 0),v.current=!0,f.current({...E.current,accessToken:e}).then(s(p)).catch(s(h)).finally(s((()=>{d(!1),v.current=!1}))))})),b=(0,l.Z)((()=>{p(void 0),d(!1),h(void 0)})),x=(0,l.Z)((e=>{p(e),d(!1),h(void 0)}));return{data:g,loading:u,error:m,run:y,clear:b,setData:x}}},2108:(e,t,n)=>{n.d(t,{ON:()=>i,Rc:()=>c,ZP:()=>l,io:()=>s});var a=n(67294),r=n(61802),o=n(16550);const l="undefined"==typeof window?function(e,t){let{defaultValue:n}=t;return[...(0,a.useState)(n)]}:function(e,t,n){let{defaultValue:l,deserialize:i,serialize:c}=t;void 0===n&&(n=!1);const s=(0,o.k6)(),u=(0,o.TH)(),d=(0,a.useMemo)((()=>{const t=new URLSearchParams(u.search).get(e);return(0,r.nf)(t)?i(t):l}),[]),[m,h]=(0,a.useState)(d),g=(0,a.useRef)(!0),p=(0,a.useRef)(!1);return(0,a.useEffect)((()=>{g.current=!1}),[]),(0,a.useEffect)((()=>{if(p.current)return void(p.current=!1);const t=c(m),a=new URLSearchParams(u.search);if((0,r.Rw)(t)){if(!a.has(e))return;a.delete(e)}else{if(a.get(e)===t)return;a.set(e,t)}const o=a.toString(),l=o?`?${o}`:"",i=u.hash?`${u.hash}`:"",d=u.pathname+l+i;n?s.push(d):(s.replace(d),window.history.replaceState(null,"",d))}),[m]),(0,a.useEffect)((()=>{const t=new URLSearchParams(u.search).get(e);(0,r.nf)(t)?h(i(t)):h(l)}),[u]),[m,h]};function i(e){return{defaultValue:e,serialize:e=>e,deserialize:e=>e}}function c(e){return{defaultValue:e,serialize:e=>(0,r.GC)(e)?e:void 0,deserialize:e=>(0,r.GC)(e)?e:void 0}}function s(e){return void 0===e&&(e="true"),{defaultValue:()=>!1,serialize:t=>(0,r.N6)(t)?e:void 0,deserialize:t=>Boolean(t===e)}}},74446:(e,t,n)=>{n.d(t,{b:()=>i,$:()=>l});const a=JSON.parse('[{"code":"MQ","lat":14.60426,"long":-61.06697},{"code":"GH","lat":5.56454,"long":-0.22571},{"code":"HN","lat":14.97503281,"long":-86.26477051},{"code":"LB","lat":33.92541122,"long":35.89972687},{"code":"RW","lat":-1.94496,"long":30.06205},{"code":"FM","lat":6.91664,"long":158.14997},{"code":"MK","lat":41.60045624,"long":21.70089531},{"code":"TZ","lat":-6.18124,"long":35.74816},{"code":"MR","lat":20.25899506,"long":-10.3644371},{"code":"GN","lat":10.7226226,"long":-10.7083587},{"code":"BY","lat":53.89769,"long":27.54942},{"code":"IS","lat":64.92856598,"long":-18.96170044},{"code":"GF","lat":4.938,"long":-52.33505},{"code":"UZ","lat":41.31644,"long":69.29486},{"code":"GP","lat":15.99285,"long":-61.72753},{"code":"US","lat":38.89206,"long":-77.01991},{"code":"BG","lat":42.69649,"long":23.32601},{"code":"LK","lat":6.93197,"long":79.85775},{"code":"FR","lat":48.85689,"long":2.35085},{"code":"PS","lat":31.8261625,"long":35.2282841},{"code":"ML","lat":12.65225,"long":-7.9817},{"code":"WS","lat":-13.66897297,"long":-172.32202148},{"code":"FK","lat":-51.72731018,"long":-61.26863861},{"code":"LR","lat":6.31033,"long":-10.80674},{"code":"BW","lat":-22.18675232,"long":23.81494141},{"code":"TC","lat":21.44449997,"long":-71.14230347},{"code":"MM","lat":16.96751,"long":96.1631},{"code":"TJ","lat":38.57415,"long":68.78651},{"code":"MX","lat":19.43268,"long":-99.13421},{"code":"SE","lat":59.33279,"long":18.06449},{"code":"SA","lat":24.69497,"long":46.72413},{"code":"IN","lat":28.63243,"long":77.21879},{"code":"BV","lat":-54.4342041,"long":3.41025114},{"code":"TH","lat":13.75396,"long":100.50224},{"code":"EE","lat":59.44269,"long":24.7532},{"code":"HU","lat":47.49814,"long":19.04055},{"code":"GS","lat":-54.27415,"long":-36.51122},{"code":"TN","lat":36.80007,"long":10.18706},{"code":"AE","lat":24.48818,"long":54.35495},{"code":"VG","lat":18.4235363,"long":-64.62605286},{"code":"GI","lat":36.13584137,"long":-5.34924889},{"code":"NG","lat":9.06146,"long":7.50064},{"code":"GU","lat":13.42112923,"long":144.73971558},{"code":"MO","lat":22.19204,"long":113.55126},{"code":"BD","lat":23.93072701,"long":89.01164246},{"code":"TF","lat":-49.31373,"long":69.48754},{"code":"FO","lat":62.01017,"long":-6.77306},{"code":"MT","lat":35.93336487,"long":14.3810339},{"code":"PH","lat":14.58226,"long":120.9748},{"code":"XK","lat":42.66544,"long":21.16532},{"code":"KE","lat":-1.28579,"long":36.82003},{"code":"PN","lat":-24.37211418,"long":-128.31124878},{"code":"CA","lat":45.42042,"long":-75.69243},{"code":"LT","lat":55.33871841,"long":23.870924},{"code":"PF","lat":-17.53726,"long":-149.56603},{"code":"WF","lat":-13.29961205,"long":-176.17012024},{"code":"CR","lat":9.90958,"long":-84.05406},{"code":"TW","lat":25.03841,"long":121.5637},{"code":"SB","lat":-10.81599998,"long":166},{"code":"PY","lat":-25.3,"long":-57.63},{"code":"RS","lat":44.81507,"long":20.46048},{"code":"DJ","lat":11.60047,"long":43.15083},{"code":"ZW","lat":-19.00028038,"long":29.86876106},{"code":"AM","lat":40.17397,"long":44.50275},{"code":"UY","lat":-34.90556,"long":-56.18525},{"code":"SL","lat":8.61643982,"long":-13.19550037},{"code":"NF","lat":-29.0402,"long":167.95754},{"code":"OM","lat":20.56662178,"long":56.1579628},{"code":"CK","lat":-21.22330666,"long":-159.74055481},{"code":"RU","lat":55.75654,"long":37.61492},{"code":"AL","lat":41.11113358,"long":20.02745247},{"code":"TG","lat":8.51322651,"long":0.98009753},{"code":"KR","lat":37.55796,"long":127.50469},{"code":"AR","lat":-34.60903,"long":-58.37322},{"code":"VN","lat":21.02828,"long":105.85388},{"code":"BI","lat":-3.38227,"long":29.36358},{"code":"PW","lat":7.44190073,"long":134.54205322},{"code":"SM","lat":43.93813324,"long":12.46339321},{"code":"SK","lat":48.1464,"long":17.10688},{"code":"NP","lat":27.71202,"long":85.31295},{"code":"CM","lat":3.86177,"long":11.51875},{"code":"GD","lat":12.17886639,"long":-61.64693069},{"code":"AQ","lat":-80.46613,"long":21.34609},{"code":"KM","lat":-11.70379,"long":43.25519},{"code":"SR","lat":4.21692896,"long":-55.88921738},{"code":"UG","lat":0.31569,"long":32.57811},{"code":"ER","lat":15.39719963,"long":39.08718872},{"code":"BS","lat":25.04659,"long":-77.3766},{"code":"CL","lat":-33.44599,"long":-70.66706},{"code":"BZ","lat":17.22529221,"long":-88.66973877},{"code":"PG","lat":-9.46707,"long":147.19603},{"code":"NZ","lat":-46.16393,"long":169.87507},{"code":"GW","lat":12.11586285,"long":-14.74813652},{"code":"DZ","lat":28.21364594,"long":2.65472817},{"code":"LA","lat":17.96216,"long":102.61163},{"code":"CO","lat":4.60688,"long":-74.07184},{"code":"NU","lat":-19.03806496,"long":-169.83024597},{"code":"CX","lat":-10.49029064,"long":105.63275146},{"code":"VU","lat":-16.37668419,"long":167.5625},{"code":"VI","lat":17.75262451,"long":-64.73542023},{"code":"GG","lat":49.45633,"long":-2.57923},{"code":"NI","lat":12.13932,"long":-86.26096},{"code":"SX","lat":18.03039,"long":-63.04478},{"code":"ME","lat":42.43806,"long":19.26555},{"code":"BN","lat":4.88068,"long":114.92227},{"code":"GY","lat":6.8084,"long":-58.16138},{"code":"MA","lat":34.02199,"long":-6.83762},{"code":"BF","lat":12.37153,"long":-1.51992},{"code":"AO","lat":-8.81602,"long":13.23192},{"code":"TD","lat":15.36765289,"long":18.66758156},{"code":"AT","lat":47.06798,"long":15.48663},{"code":"TV","lat":-8.52047,"long":179.19958},{"code":"AX","lat":60.1785247,"long":19.9156105},{"code":"NC","lat":-21.31782341,"long":165.29858398},{"code":"JP","lat":35.68992615,"long":139.6917572},{"code":"BJ","lat":9.62411213,"long":2.33773875},{"code":"SO","lat":9.8333333,"long":49.1666667},{"code":"ET","lat":9.03314,"long":38.75008},{"code":"VC","lat":13.21725178,"long":-61.19344711},{"code":"BH","lat":26.23269,"long":50.57811},{"code":"ST","lat":0.27555528,"long":6.63162804},{"code":"ID","lat":-6.17476,"long":106.82707},{"code":"SY","lat":33.50198,"long":36.29805},{"code":"SN","lat":14.36251163,"long":-14.53164387},{"code":"MV","lat":4.18588495,"long":73.53071594},{"code":"DM","lat":15.39910603,"long":-61.33945847},{"code":"IE","lat":53.3441,"long":-6.26749},{"code":"MD","lat":47.0242,"long":28.83183},{"code":"BT","lat":27.45759,"long":89.62302},{"code":"KP","lat":39.02138,"long":125.75275},{"code":"AF","lat":34.52184,"long":69.18067},{"code":"BO","lat":-16.71305466,"long":-64.66664886},{"code":"SH","lat":-15.92763,"long":-5.71556},{"code":"SJ","lat":71.04893494,"long":-8.19574738},{"code":"AN","lat":12.18907833,"long":-68.25680542},{"code":"ZA","lat":-25.74602,"long":28.18712},{"code":"NL","lat":52.37317,"long":4.89066},{"code":"NR","lat":-0.5316065,"long":166.93640137},{"code":"RO","lat":44.43558,"long":26.10222},{"code":"KN","lat":17.2444725,"long":-62.64318466},{"code":"LV","lat":56.94625,"long":24.10425},{"code":"YT","lat":-12.79636002,"long":45.14227295},{"code":"CH","lat":46.948,"long":7.44813},{"code":"JO","lat":31.27576256,"long":36.82838821},{"code":"KH","lat":12.57042313,"long":104.81391144},{"code":"CF","lat":6.57412338,"long":20.48692322},{"code":"UA","lat":50.44773,"long":30.54272},{"code":"DK","lat":55.67576,"long":12.56902},{"code":"CN","lat":39.93084,"long":116.38634},{"code":"PE","lat":-12.05798,"long":-77.03713},{"code":"PA","lat":8.9673,"long":-79.5339},{"code":"AZ","lat":40.143105,"long":47.576927},{"code":"AS","lat":-14.30065,"long":-170.71812},{"code":"SI","lat":46.12023926,"long":14.82066441},{"code":"BQ","lat":12.14887,"long":-68.27369},{"code":"CC","lat":-12.1409,"long":96.82352},{"code":"SZ","lat":-26.32608,"long":31.14608},{"code":"JM","lat":18.14344406,"long":-77.34654999},{"code":"AU","lat":-35.28078,"long":149.1314},{"code":"SS","lat":4.84364,"long":31.60336},{"code":"GE","lat":41.69363,"long":44.80162},{"code":"BR","lat":-18.45639,"long":-44.67345},{"code":"AI","lat":18.1954947,"long":-63.0750234},{"code":"ES","lat":40.41669,"long":-3.70035},{"code":"GA","lat":-0.8999695,"long":11.6899699},{"code":"MY","lat":2.5490005,"long":102.96261597},{"code":"BL","lat":17.89502,"long":-62.84932},{"code":"KI","lat":-2.81631565,"long":-171.66738892},{"code":"SC","lat":-4.62354,"long":55.45249},{"code":"MG","lat":-18.90848,"long":47.53751},{"code":"CZ","lat":50.08781,"long":14.42046},{"code":"EC","lat":-0.21495,"long":-78.5132},{"code":"DO","lat":18.47202,"long":-69.90203},{"code":"NO","lat":59.91382,"long":10.73874},{"code":"BB","lat":13.1127,"long":-59.61357},{"code":"BM","lat":32.30266953,"long":-64.7516861},{"code":"CU","lat":23.12814,"long":-82.38972},{"code":"MW","lat":-13.99572,"long":33.75982},{"code":"CI","lat":6.82147,"long":-5.27985},{"code":"KZ","lat":51.1776,"long":71.433},{"code":"LY","lat":32.89222,"long":13.17308},{"code":"FJ","lat":-17.65816116,"long":178.14726257},{"code":"CD","lat":-4.32153,"long":15.31185},{"code":"PT","lat":38.70701,"long":-9.13564},{"code":"GM","lat":13.44026566,"long":-15.49088478},{"code":"JE","lat":49.22850418,"long":-2.12289286},{"code":"HM","lat":-53.08010864,"long":73.56218719},{"code":"GL","lat":74.34954834,"long":-41.08988953},{"code":"YE","lat":15.88838768,"long":47.48988724},{"code":"MP","lat":15.18883,"long":145.7535},{"code":"CV","lat":15.18300247,"long":-23.70345116},{"code":"GB","lat":51.50015,"long":-0.12624},{"code":"RE","lat":-21.14629936,"long":55.63124847},{"code":"TO","lat":-21.37624,"long":-174.93218},{"code":"AD","lat":42.50753,"long":1.52182},{"code":"HK","lat":22.28215,"long":114.15688},{"code":"TT","lat":10.65782,"long":-61.51671},{"code":"MF","lat":18.04222488,"long":-63.06623459},{"code":"SV","lat":13.67163658,"long":-88.8636322},{"code":"GR","lat":37.97534,"long":23.73615},{"code":"BA","lat":44.16825485,"long":17.78524971},{"code":"MN","lat":47.92287,"long":106.92327},{"code":"BE","lat":50.84554,"long":4.35571},{"code":"IT","lat":41.89056,"long":12.49427},{"code":"SD","lat":16.08578491,"long":30.0873909},{"code":"IO","lat":-7.26162,"long":72.37777},{"code":"MH","lat":7.12052,"long":171.36576},{"code":"GQ","lat":1.533126,"long":10.37258148},{"code":"HR","lat":45.81491,"long":15.97851},{"code":"LU","lat":49.77788162,"long":6.09474611},{"code":"MC","lat":43.73251,"long":7.41904},{"code":"IL","lat":31.78902,"long":35.20108},{"code":"QA","lat":25.41362572,"long":51.26026535},{"code":"TM","lat":39.2012825,"long":59.0822525},{"code":"SG","lat":1.28944,"long":103.84998},{"code":"AW","lat":12.50652313,"long":-69.96931458},{"code":"PR","lat":18.22452,"long":-66.47963},{"code":"CY","lat":35.17025,"long":33.3587},{"code":"ZM","lat":-13.45884514,"long":27.78809738},{"code":"EG","lat":26.75610352,"long":29.86229706},{"code":"LI","lat":47.14104,"long":9.52145},{"code":"VA","lat":41.90397,"long":12.45755},{"code":"NE","lat":11.96142101,"long":2.53115416},{"code":"PK","lat":33.72,"long":73.06},{"code":"KY","lat":19.30025,"long":-81.376},{"code":"LS","lat":-29.58175278,"long":28.24661255},{"code":"FI","lat":60.16981,"long":24.93813},{"code":"VE","lat":10.50278,"long":-66.91905},{"code":"DE","lat":52.52343,"long":13.41144},{"code":"AG","lat":17.09273911,"long":-61.81040955},{"code":"IM","lat":54.22814,"long":-4.53814},{"code":"NA","lat":-22.56522,"long":17.0843},{"code":"TL","lat":-8.80478668,"long":126.07902527},{"code":"LC","lat":14.01159,"long":-60.98823},{"code":"MU","lat":-20.22040939,"long":57.58937836},{"code":"GT","lat":14.64198,"long":-90.51324},{"code":"PM","lat":46.90594482,"long":-56.336586},{"code":"CW","lat":12.12161,"long":-68.94942},{"code":"TR","lat":39.89652,"long":32.86197},{"code":"KG","lat":42.88442,"long":74.57662},{"code":"IQ","lat":33.04458618,"long":43.77495575},{"code":"UM","lat":6.41093,"long":-162.46546},{"code":"TK","lat":-8.97920799,"long":-172.20170593},{"code":"MZ","lat":-25.97325,"long":32.57203},{"code":"HT","lat":18.54639,"long":-72.34279},{"code":"CG","lat":-4.2739,"long":15.28151},{"code":"MS","lat":16.70611,"long":-62.21337},{"code":"PL","lat":52.23498,"long":21.00849},{"code":"KW","lat":29.36857,"long":47.97283},{"code":"IR","lat":35.6864,"long":51.43286}]'),r=JSON.parse('{"AF":"Afghanistan","AX":"\xc5land Islands","AL":"Albania","DZ":"Algeria","AS":"American Samoa","AD":"Andorra","AO":"Angola","AI":"Anguilla","AQ":"Antarctica","AG":"Antigua and Barbuda","AR":"Argentina","AM":"Armenia","AW":"Aruba","AU":"Australia","AT":"Austria","AZ":"Azerbaijan","BS":"Bahamas","BH":"Bahrain","BD":"Bangladesh","BB":"Barbados","BY":"Belarus","BE":"Belgium","BZ":"Belize","BJ":"Benin","BM":"Bermuda","BT":"Bhutan","BO":"Bolivia (Plurinational State of)","BQ":"Bonaire, Sint Eustatius and Saba","BA":"Bosnia and Herzegovina","BW":"Botswana","BV":"Bouvet Island","BR":"Brazil","IO":"British Indian Ocean Territory","BN":"Brunei Darussalam","BG":"Bulgaria","BF":"Burkina Faso","BI":"Burundi","KH":"Cambodia","CM":"Cameroon","CA":"Canada","CV":"Cabo Verde","KY":"Cayman Islands","CF":"Central African Republic","TD":"Chad","CL":"Chile","CN":"China","CX":"Christmas Island","CC":"Cocos (Keeling) Islands","CO":"Colombia","KM":"Comoros","CG":"Congo","CD":"Congo (Democratic Republic of the)","CK":"Cook Islands","CR":"Costa Rica","CI":"C\xf4te d\'Ivoire","HR":"Croatia","CU":"Cuba","CW":"Cura\xe7ao","CY":"Cyprus","CZ":"Czech Republic","DK":"Denmark","DJ":"Djibouti","DM":"Dominica","DO":"Dominican Republic","EC":"Ecuador","EG":"Egypt","SV":"El Salvador","GQ":"Equatorial Guinea","ER":"Eritrea","EE":"Estonia","ET":"Ethiopia","FK":"Falkland Islands (Malvinas)","FO":"Faroe Islands","FJ":"Fiji","FI":"Finland","FR":"France","GF":"French Guiana","PF":"French Polynesia","TF":"French Southern Territories","GA":"Gabon","GM":"Gambia","GE":"Georgia","DE":"Germany","GH":"Ghana","GI":"Gibraltar","GR":"Greece","GL":"Greenland","GD":"Grenada","GP":"Guadeloupe","GU":"Guam","GT":"Guatemala","GG":"Guernsey","GN":"Guinea","GW":"Guinea-Bissau","GY":"Guyana","HT":"Haiti","HM":"Heard Island and McDonald Islands","VA":"Holy See","HN":"Honduras","HK":"Hong Kong (China)","HU":"Hungary","IS":"Iceland","IN":"India","ID":"Indonesia","IR":"Iran (Islamic Republic of)","IQ":"Iraq","IE":"Ireland","IM":"Isle of Man","IL":"Israel","IT":"Italy","JM":"Jamaica","JP":"Japan","JE":"Jersey","JO":"Jordan","KZ":"Kazakhstan","KE":"Kenya","KI":"Kiribati","KP":"Korea (Democratic People\'s Republic of)","KR":"Korea (Republic of)","KW":"Kuwait","KG":"Kyrgyzstan","LA":"Lao People\'s Democratic Republic","LV":"Latvia","LB":"Lebanon","LS":"Lesotho","LR":"Liberia","LY":"Libya","LI":"Liechtenstein","LT":"Lithuania","LU":"Luxembourg","MO":"Macao (China)","MK":"Macedonia (the former Yugoslav Republic of)","MG":"Madagascar","MW":"Malawi","MY":"Malaysia","MV":"Maldives","ML":"Mali","MT":"Malta","MH":"Marshall Islands","MQ":"Martinique","MR":"Mauritania","MU":"Mauritius","YT":"Mayotte","MX":"Mexico","FM":"Micronesia (Federated States of)","MD":"Moldova (Republic of)","MC":"Monaco","MN":"Mongolia","ME":"Montenegro","MS":"Montserrat","MA":"Morocco","MZ":"Mozambique","MM":"Myanmar","NA":"Namibia","NR":"Nauru","NP":"Nepal","NL":"Netherlands","NC":"New Caledonia","NZ":"New Zealand","NI":"Nicaragua","NE":"Niger","NG":"Nigeria","NU":"Niue","NF":"Norfolk Island","MP":"Northern Mariana Islands","NO":"Norway","OM":"Oman","PK":"Pakistan","PW":"Palau","PS":"Palestina, State of","PA":"Panama","PG":"Papua New Guinea","PY":"Paraguay","PE":"Peru","PH":"Philippines","PN":"Pitcairn","PL":"Poland","PT":"Portugal","PR":"Puerto Rico","QA":"Qatar","RE":"R\xe9union","RO":"Romania","RU":"Russian Federation","RW":"Rwanda","BL":"Saint Barth\xe9lemy","SH":"Saint Helena, Ascension and Tristan da Cunha","KN":"Saint Kitts and Nevis","LC":"Saint Lucia","MF":"Saint Martin (French part)","PM":"Saint Pierre and Miquelon","VC":"Saint Vincent and the Grenadines","WS":"Samoa","SM":"San Marino","ST":"Sao Tome and Principe","SA":"Saudi Arabia","SN":"Senegal","RS":"Serbia","SC":"Seychelles","SL":"Sierra Leone","SG":"Singapore","SX":"Sint Maarten (Dutch part)","SK":"Slovakia","SI":"Slovenia","SB":"Solomon Islands","SO":"Somalia","ZA":"South Africa","GS":"South Georgia and the South Sandwich Islands","SS":"South Sudan","ES":"Spain","LK":"Sri Lanka","SD":"Sudan","SR":"Suriname","SJ":"Svalbard and Jan Mayen","SZ":"Swaziland","SE":"Sweden","CH":"Switzerland","SY":"Syrian Arab Republic","TW":"Taiwan, Province of China","TJ":"Tajikistan","TZ":"Tanzania, United Republic of","TH":"Thailand","TL":"Timor-Leste","TG":"Togo","TK":"Tokelau","TO":"Tonga","TT":"Trinidad and Tobago","TN":"Tunisia","TR":"Turkey","TM":"Turkmenistan","TC":"Turks and Caicos Islands","TV":"Tuvalu","UG":"Uganda","UA":"Ukraine","AE":"United Arab Emirates","GB":"United Kingdom","US":"United States of America","UM":"United States Minor Outlying Islands","UY":"Uruguay","UZ":"Uzbekistan","VU":"Vanuatu","VE":"Venezuela (Bolivarian Republic of)","VN":"Viet Nam","VG":"Virgin Islands (British)","VI":"Virgin Islands (U.S.)","WF":"Wallis and Futuna","EH":"Western Sahara","YE":"Yemen","ZM":"Zambia","ZW":"Zimbabwe"}'),o=a.reduce(((e,t)=>{let{code:n,long:a,lat:r}=t;return e[n]={long:a,lat:r},e}),{}),l=e=>r[e],i=e=>o[e]},4854:(e,t,n)=>{n.r(t),n.d(t,{default:()=>pl});var a=n(88242),r=n(67294),o=n(84191),l=n(61802);let i,c;async function s(e,t,n){let{satisfied:a}=t;return await o.po.post(`/explorer/questions/${e}/feedback`,{satisfied:a,feedbackContent:""},{withCredentials:!0,oToken:n}),a}async function u(e,t,n){await o.po.delete(`/explorer/questions/${e}/feedback`,{params:{satisfied:t},withCredentials:!0,oToken:n})}async function d(){return await o.po.get("/explorer/tags")}!function(e){e.New="new",e.AnswerGenerating="answer_generating",e.SQLValidating="sql_validating",e.Waiting="waiting",e.Running="running",e.Success="success",e.Summarizing="summarizing",e.Error="error",e.Cancel="cancel"}(i||(i={})),function(e){e.ANSWER_GENERATE="error-answer-generate",e.ANSWER_PARSE="error-answer-parse",e.SQL_CAN_NOT_ANSWER="error-sql-can-not-answer",e.VALIDATE_SQL="error-validate-sql",e.VALIDATE_CHART="error-validate-chart",e.QUERY_TIMEOUT="error-query-timeout",e.QUERY_EXECUTE="error-query-execute",e.EMPTY_RESULT="error-empty-result",e.SUMMARY_GENERATE="error-summary-generate",e.UNKNOWN="error-unknown",e.QUESTION_IS_TOO_LONG="error-question-too-long"}(c||(c={}));var m=n(22638);async function h(e){return await new Promise((t=>setTimeout(t,e)))}var g=n(4224),p=n(47135);function E(e){return(0,l.GC)(e)?!["none","n/a"].includes(e.toLowerCase()):(0,l.N6)(e)}var f=n(68971),v=n(71406);var y=n(5616),b=n(57922),x=n(90948);const Z=(0,x.ZP)(y.Z)`
  line-height: 40px;
  font-weight: normal;
  
  &.light {
    font-size: 14px;
    font-weight: normal;
  }
`,w=((0,x.ZP)(y.Z)`
  line-height: 24px;
  font-size: 14px;
  font-weight: normal;
`,(0,x.ZP)("strong")`
`,(0,x.ZP)("div")`
`);(0,x.ZP)("span")`
  color: #ECBAAA;
`,(0,x.ZP)("span")`
  margin-left: 0.5em;
  color: #F4EFDA;
  font-weight: bold;
`,(0,x.ZP)("span")`
  margin-left: 0.5em;
  color: #ECBAAA;
  font-weight: bold;
`,(0,x.ZP)("span")`
  margin-left: 0.5em;
  display: inline;
  font-weight: bold;
  color: #BDDBFF;
  border-radius: 6px;
  border: 1px dashed #656565;
  padding: 6px;
  line-height: 1.25;
  pointer-events: auto;
  user-select: text !important;
  cursor: text;


  > i, b {
    background-color: #6B40B1;
  }
`;var S=n(70917);function A(e){let{animated:t=!0,sx:n}=e;return r.createElement(I,{className:t?"animated":"",size:16,sx:n})}const C=S.F4`
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
`,I=(0,x.ZP)("span")`
  width: ${e=>{let{size:t}=e;return t??24}}px;
  height: ${e=>{let{size:t}=e;return t??24}}px;
  display: inline-block;
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;

  &.animated {
    animation: ${C} 0.8s infinite;
  }
`;var k=n(46901),T=n(93946),L=n(5970),N=n(2068),R=n(96406),F=n(25108);function P(e){let{content:t}=e;const[n,a]=(0,r.useState)(!1),o=(0,N.Z)((()=>{a(!1)})),i=(0,N.Z)((()=>{if((0,l.N6)(t)){if(t.includes("<b>")){const e=document.createElement("div");e.innerHTML=t,t=e.innerText}navigator.clipboard.writeText(t).catch(F.error),a(!0)}}));return r.createElement(r.Fragment,null,r.createElement(T.Z,{size:"small",onClick:i,sx:{ml:.5}},r.createElement(R.Z,{fontSize:"inherit"})),r.createElement(L.Z,{anchorOrigin:{vertical:"top",horizontal:"center"},open:n,onClose:o,autoHideDuration:3e3},r.createElement(k.Z,{severity:"info",onClose:o,sx:{width:"100%"}},"Copied!")))}function M(e,t){if("undefined"==typeof localStorage)return t;const n=localStorage.getItem(`ossinsight.explore.ai-message.${e}`);return n?parseInt(n):t}M("duration",600),M("delay",1800),M("sub-extra-delay",1200),i.Error,i.Cancel,i.Success,i.Summarizing,y.Z;function q(e){return e.flatMap((e=>[", ",e])).slice(1)}function G(e){return e.replace(/^No\s*\d+(:|.)?\s*/i,"")}function D(e,t){return"number"==typeof t?t:!0===e?t.enter??0:t.exit??0}(0,x.ZP)(b.Z,{shouldForwardProp:e=>"delay"!==e})`
  transition-delay: ${e=>{let{in:t,delay:n}=e;return D(t,n)}}ms;
  transition-duration: ${e=>{let{in:t,timeout:n,delay:a}=e;return D(t,n)-D(t,a)}}ms !important;
`;var _=n(59058),$=n(6571);function O(e,t){if("undefined"==typeof localStorage)return t;const n=localStorage.getItem(`ossinsight.explore.ai-message.${e}`);return n?parseInt(n):t}const z=O("sub-delay",1e3),B=O("pace-normal",25),U=O("pace-space",40),Q=O("pace-random-range",25);function H(e){var t,n,a,o;let{question:l,onStart:i,collapsed:c,onCollapsedChange:s,onStop:u,prompts:d}=e;const[,m]=(0,r.useState)(0),h=(0,f.RI)(),g=(0,r.useRef)();return(0,r.useEffect)((()=>{}),[]),(0,r.useEffect)((()=>{const e=l.id;null==i||i(),null==s||s(!1);const t=g.current=new K(l,(()=>m((e=>e+1))));t.finishedHandlers.push(u??(()=>{})),t.finishedHandlers.push((()=>{h((()=>{e===l.id&&(null==s||s(!0))}),3600)}))}),[l.id]),(0,r.useEffect)((()=>{var e;null==(e=g.current)||e.accept(l,!1)}),[l]),r.createElement(r.Fragment,null,r.createElement(j,null,r.createElement("div",{className:"Chat-avatars"},r.createElement(A,{animated:(null==(t=g.current)?void 0:t.stage)!==V.finished})),r.createElement("div",{className:"Chat-content"},r.createElement(b.Z,{in:!c},null==(n=g.current)?void 0:n.collapsableChildren),r.createElement(W.Provider,{value:{show:(null==(a=g.current)?void 0:a.stage)===V.finished,collapsed:c,onCollapsedChange:s}},null==(o=g.current)?void 0:o.children))),r.createElement(Z,null,d))}var V;!function(e){e[e.init=0]="init",e[e.rq=1]="rq",e[e.keywords=2]="keywords",e[e.links=3]="links",e[e.sub=4]="sub",e[e.assumption=5]="assumption",e[e.cq=6]="cq",e[e.finished=7]="finished"}(V||(V={}));const W=(0,r.createContext)({show:!1,collapsed:void 0,onCollapsedChange:void 0});class K{typing=!1;waitingNext=!1;stage=V.init;children=[];collapsableChildren=[];finishedHandlers=[];constructor(e,t){this.question=e,this.update=t}next(){this.typing=!1,this.waitingNext=!1,this.stage!==V.finished?(this.stage=this.stage+1,this.accept(this.question)):this.finishedHandlers.forEach((e=>e()))}startTyping(){this.typing=!0,this.update()}renderRevisedTitle(e){return r.createElement(Z,{key:"rq"},r.createElement(_.Ee,{onFinished:()=>this.next()},"You seem curious about: ",r.createElement("span",{className:"rq"},r.createElement(_.TJ,{getPace:e=>X(e,void 0)},e))))}renderKeywords(e){return r.createElement(Z,{key:"keywords"},r.createElement(_.Ee,{onFinished:()=>this.next()},"Extracting key words: ",r.createElement(_.TJ,{getPace:e=>X(e,void 0)},q(e.map((e=>r.createElement("strong",{key:e},e)))))))}renderLinks(e){return r.createElement(Z,{key:"links"},r.createElement(_.Ee,{onFinished:()=>this.next()},"Might be the key player: ",q(e.map((e=>r.createElement("a",{key:e,href:e,target:"_blank",rel:"noreferrer"},e))))))}renderSubQuestions(e){return r.createElement(Z,{key:"subQuestions"},r.createElement(_.Ee,{onFinished:()=>this.next()},r.createElement("p",null,"Thinking about the details..."),r.createElement("ul",null,e.map(((e,t)=>r.createElement(_.TJ,{key:t,getPace:e=>X(e,void 0)},r.createElement("li",null,G(e))))))))}renderAssumption(e){return r.createElement(Z,{key:"assumption"},r.createElement(_.Ee,{onFinished:()=>this.next()},"I suppose: ",r.createElement("span",{className:"assumption"},r.createElement(_.TJ,{getPace:e=>X(e,void 0)},e))))}renderCombinedTitle(e){return r.createElement(Z,{key:"cq"},r.createElement(_.Ee,{onFinished:()=>this.next()},"And your question becomes: ",r.createElement("span",{className:"cq"},r.createElement(_.TJ,{getPace:e=>X(e,void 0)},function(e){if("undefined"==typeof document)return[e];const t=document.createElement("div");t.innerHTML=e;const n=[];return t.childNodes.forEach(((e,t)=>{e.nodeType===Node.TEXT_NODE?n.push(e.textContent??""):e.nodeType===Node.ELEMENT_NODE&&n.push((0,r.createElement)(e.tagName.toLowerCase(),{key:t},e.textContent))})),n}(e))),r.createElement(P,{content:e})),r.createElement(W.Consumer,null,(e=>{let{show:t,collapsed:n,onCollapsedChange:a}=e;return t&&r.createElement(T.Z,{disabled:(0,l.Rw)(n),size:"small",onClick:()=>null==a?void 0:a(!n)},r.createElement($.Z,{sx:{rotate:(0,l.N6)(n)?0:"180deg",transition:e=>e.transitions.create("rotate")}}))})))}renderMessage(){return r.createElement(J,{key:"message"},r.createElement(b.Z,{onEntered:()=>this.next(),timeout:z},r.createElement(Z,{className:"message light"},"You can copy and revise it based on the question above \ud83d\udc46.")))}run(e,t,n,a){void 0===a&&(a=!1);const r=e(this.question);t(r)?((a?this.collapsableChildren:this.children).push(n.call(this,r)),this.startTyping()):(0,l.nf)(r)||(0,l.yD)(r)?this.next():this.question.status===i.AnswerGenerating?this.waitingNext=!0:(this.waitingNext=!1,this.next())}accept(e,t){if(void 0===t&&(t=!0),this.question=e,!(this.typing||this.waitingNext&&t))switch(this.stage){case V.init:this.run((e=>{var t;return(null==(t=e.answer)?void 0:t.revisedTitle)??e.revisedTitle}),E,this.renderRevisedTitle,!0);break;case V.rq:this.run((e=>{var t;return Y(null==(t=e.answer)?void 0:t.keywords)}),l.uW,this.renderKeywords,!0);break;case V.keywords:this.run((e=>{var t;return Y(null==(t=e.answer)?void 0:t.links)}),l.uW,this.renderLinks,!0);break;case V.links:this.run((e=>{var t;return null==(t=e.answer)?void 0:t.subQuestions}),l.uW,this.renderSubQuestions,!0);break;case V.sub:this.run((e=>{var t;return(null==(t=e.answer)?void 0:t.assumption)??e.assumption}),E,this.renderAssumption,!0);break;case V.assumption:this.run((e=>{var t;return(null==(t=e.answer)?void 0:t.combinedTitle)??e.combinedTitle}),E,this.renderCombinedTitle);break;case V.cq:this.run((()=>!0),(()=>!0),this.renderMessage);break;case V.finished:this.next()}}}function Y(e){return(0,l.Rw)(e)?[]:"string"==typeof e?e.split(",").map((e=>e.trim())).filter((e=>E(e))):e}const j=(0,x.ZP)("div",{name:"Chat-root"})`
  font-weight: normal;
  display: flex;

  .Chat-avatars {
    width: 16px;
    max-width: 16px;
    min-width: 16px;
    line-height: 40px;
    vertical-align: text-bottom;
  }

  .Chat-content {
    flex: 1;
    margin-left: 4px;
  }

  ul, ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-left: 2em;
    line-height: 24px;
    font-size: 14px;
    font-weight: normal;
  }

  p {
    margin: 0;
  }

  .rq {
    font-weight: bold;
    color: #ECBAAA;
  }

  .assumption {
    font-weight: bold;
    color: #F4EFDA;
  }

  .cq {
    display: inline;
    font-weight: bold;
    color: #BDDBFF;
    border-radius: 6px;
    border: 1px dashed #656565;
    padding: 6px;
    line-height: 1.25;
    pointer-events: auto;
    user-select: text !important;
    cursor: text;

    > i, b {
      background-color: #6B40B1;
    }
  }
`;function X(e,t){return" "===e?U+Math.random()*Q:B+Math.random()*Q}function J(e){let{children:t}=e;const[n,a]=(0,r.useState)(!1);return(0,r.useEffect)((()=>{a(!0)}),[]),(0,r.cloneElement)(t,{in:n})}let ee;!function(e){e[e.NONE=0]="NONE",e[e.LOADING=1]="LOADING",e[e.LOAD_FAILED=2]="LOAD_FAILED",e[e.CREATING=3]="CREATING",e[e.CREATED=4]="CREATED",e[e.GENERATING_SQL=5]="GENERATING_SQL",e[e.CREATE_FAILED=6]="CREATE_FAILED",e[e.GENERATE_SQL_FAILED=7]="GENERATE_SQL_FAILED",e[e.VALIDATE_SQL_FAILED=8]="VALIDATE_SQL_FAILED",e[e.QUEUEING=9]="QUEUEING",e[e.EXECUTING=10]="EXECUTING",e[e.EXECUTE_FAILED=11]="EXECUTE_FAILED",e[e.VISUALIZE_FAILED=12]="VISUALIZE_FAILED",e[e.UNKNOWN_ERROR=13]="UNKNOWN_ERROR",e[e.SUMMARIZING=14]="SUMMARIZING",e[e.READY=15]="READY"}(ee||(ee={}));const te=new Set([ee.NONE,ee.LOADING,ee.CREATING,ee.CREATED,ee.GENERATING_SQL]),ne=new Set([ee.NONE,ee.READY,ee.SUMMARIZING,ee.UNKNOWN_ERROR,ee.GENERATE_SQL_FAILED,ee.VALIDATE_SQL_FAILED,ee.VISUALIZE_FAILED,ee.CREATE_FAILED,ee.LOAD_FAILED,ee.EXECUTE_FAILED]);function ae(e,t){switch(e.status){case i.New:return ee.CREATED;case i.AnswerGenerating:case i.SQLValidating:return ee.GENERATING_SQL;case i.Waiting:return ee.QUEUEING;case i.Running:return ee.EXECUTING;case i.Summarizing:return ee.SUMMARIZING;case i.Success:return(0,l.nf)(e.chart)?ee.READY:!1===e.sqlCanAnswer?ee.GENERATE_SQL_FAILED:ee.VISUALIZE_FAILED;case i.Error:switch((0,l.nf)(e.error)?t(e.error):t("Empty error message"),e.errorType){case c.ANSWER_GENERATE:case c.ANSWER_PARSE:case c.SQL_CAN_NOT_ANSWER:return ee.GENERATE_SQL_FAILED;case c.VALIDATE_SQL:return ee.VALIDATE_SQL_FAILED;case c.QUERY_TIMEOUT:case c.QUERY_EXECUTE:return ee.EXECUTE_FAILED}return(0,l.X0)(e.querySQL)?ee.GENERATE_SQL_FAILED:(0,l.X0)(e.result)?ee.EXECUTE_FAILED:(0,l.X0)(e.chart)?ee.VISUALIZE_FAILED:ee.UNKNOWN_ERROR;case i.Cancel:return(0,l.nf)(e.error)?t(e.error):t("Execution was cancelled"),ee.EXECUTE_FAILED;default:return(0,l.nf)(e.querySQL)?(0,l.nf)(e.result)?ee.READY:(0,l.nf)(e.error)?(t(e.error),ee.EXECUTE_FAILED):ee.EXECUTING:(0,l.nf)(e.error)?(t(e.error),ee.GENERATE_SQL_FAILED):ee.GENERATING_SQL}}function re(e){let{pollInterval:t=2e3}=e;const[n,a]=(0,r.useState)(ee.NONE),[i,c]=(0,r.useState)(),[s,u]=(0,r.useState)(!1),[d,E]=(0,r.useState)(),y=(0,r.useRef)(0),b=(0,r.useRef)(),x=(0,f.nD)(),{gtagEvent:Z}=(0,g.u)(),w=(0,v.Gb)(),S=(0,m.Z)((async function(e,t){if(b.current!==e||!t&&!s){b.current=e;try{t&&(y.current=performance.now(),E(void 0),c(void 0),a(ee.LOADING)),u(!0);const n=await async function(e){return await o.po.get(`/explorer/questions/${e}`)}(e);b.current=n.id,x((()=>{a(ae(n,E)),c(n)}))}catch(n){return x((()=>{a(ee.LOAD_FAILED),E(n)})),await Promise.reject(n)}finally{x((()=>{u(!1)}))}}})),A=(0,m.Z)((e=>{S(e,!0)})),C=(0,m.Z)(((e,t)=>{!async function(e,t){try{let n;try{n=await w("explorer-search")}catch{return}y.current=performance.now(),E(void 0),c(void 0),u(!0),a(ee.CREATING);const r=await async function(e,t){let{question:n,ignoreCache:a=!1}=e;const{accessToken:r}=t;return await o.po.post("/explorer/questions/",{question:n,ignoreCache:a},{withCredentials:!0,oToken:r})}({question:e,ignoreCache:t},{accessToken:n});await h(600),b.current=r.id,Z("create_question",{questionId:r.id,questionTitle:r.title,questionHitCache:r.hitCache,spent:(performance.now()-y.current)/1e3}),x((()=>{a(ae(r,E)),c(r)}))}catch(n){return Z("create_question_failed",{errorMessage:(0,p.e$)(n),spent:(performance.now()-y.current)/1e3}),x((()=>{a(ee.CREATE_FAILED),E(n)})),await Promise.reject(n)}finally{x((()=>{u(!1)}))}}(e,t)})),I=(0,m.Z)((async e=>{if((0,l.nf)(i)){const t=i.id;await async function(e,t,n){let{accessToken:a}=n;await o.po.post(`/explorer/questions/${e}/recommend${t?"":"/cancel"}`,{},{withCredentials:!0,oToken:a})}(i.id,e,{accessToken:await w()}),x((()=>{c((n=>(null==n?void 0:n.id)===t?{...n,recommended:e}:n))}))}})),k=(0,m.Z)((async e=>{let{ids:t,accessToken:n}=e;(0,l.nf)(i)&&await async function(e,t,n){let{accessToken:a}=n;await o.po.post(`/explorer/questions/${e}/tags`,{tagIds:t},{withCredentials:!0,oToken:a})}(i.id,t,{accessToken:n??await w()})})),T=(0,m.Z)((()=>{a(ee.NONE),c(void 0),u(!1),E(void 0),b.current=void 0})),L=(0,r.useMemo)((()=>te.has(n)),[n]),N=(0,r.useMemo)((()=>!ne.has(n)),[n]);return(0,r.useEffect)((()=>{switch((0,l.z0)(t)&&t<1e3&&(t=1e3),n){case ee.CREATED:case ee.GENERATING_SQL:case ee.EXECUTING:case ee.QUEUEING:case ee.SUMMARIZING:{const e=setTimeout((()=>{(0,l.GC)(b.current)&&S(b.current,!1)}),t);return()=>{clearTimeout(e)}}}}),[n,s,t]),(0,r.useEffect)((()=>{(0,l.nf)(i)&&ne.has(n)&&n!==ee.SUMMARIZING&&Z("explore_question",{questionId:i.id,questionTitle:i.title,questionHitCache:i.hitCache,questionRecommended:i.recommended,questionStatus:i.status,questionNotClear:ie(i.notClear),questionHasAssumption:!ie(i.assumption),questionSqlCanAnswer:i.sqlCanAnswer,spent:(performance.now()-y.current)/1e3})}),[null==i?void 0:i.id,ne.has(n)&&n!==ee.SUMMARIZING]),{phase:n,question:i,loading:s,error:d,load:A,create:C,reset:T,recommend:I,updateTags:k,isSqlPending:L,isResultPending:N}}const oe=(0,r.createContext)({phase:ee.NONE,question:void 0,loading:!1,error:void 0,isSqlPending:!0,isResultPending:!0,load(){},create(){},reset(){},recommend:async()=>{},updateTags:async()=>{}});function le(){return(0,r.useContext)(oe)}function ie(e){return!(0,l.GC)(e)||["none","n/a"].includes(e.toLowerCase())}function ce(e){var t;return(e.status===i.Success||e.status===i.Summarizing)&&0===((null==(t=e.result)?void 0:t.rows.length)??NaN)}function se(e){if(e.status===i.AnswerGenerating){let t=!1;const n=e.answer;return(0,l.nf)(n)&&(t||=(0,l.uW)(Y(n.keywords))||(0,l.uW)(Y(n.links))||(0,l.uW)(n.subQuestions)),t||=E(e.revisedTitle)||E(e.assumption)||E(e.combinedTitle),t}return E(e.revisedTitle)||E(e.combinedTitle)||E(e.assumption)}oe.displayName="QuestionManagementContext";var ue=n(2108);const de=(0,r.createContext)({search:"",handleSelect(){},handleSelectId(){}});function me(){return r.createElement(he,null,r.createElement(pe,null),r.createElement(Ee,null))}const he=(0,x.ZP)("div",{name:"Decorators-Container"})`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 200vh;
  pointer-events: none;
  overflow: hidden;
`,ge=(0,x.ZP)("div")`
  display: block;
  position: absolute;
  background-position: left top;
  background-repeat: no-repeat;
`,pe=(0,x.ZP)(ge)`
  background-image: url('/img/ellipse-2.svg');
  left: 41px;
  top: 81px;
  right: 0;
  width: 696px;
  height: 696px;
  background-size: 696px 696px;
  overflow: hidden;
`,Ee=(0,x.ZP)(ge)`
  background-image: url('/img/ellipse-2.svg');
  top: 241px;
  right: 0;
  width: 961px;
  height: 1072px;
  background-size: 961px 1072px;
  overflow: hidden;
`;var fe=n(65582),ve=n(99200),ye=n(98885),be=n(8410);const xe=400;function Ze(e){let{children:t,header:n,side:a,showSide:o,showHeader:l}=e;const i=(0,r.useRef)(null),c=(0,be.Z)(i),s=(0,r.useMemo)((()=>(null==c?void 0:c.height)??0),[null==c?void 0:c.height]);return r.createElement(we,{maxWidth:"xl"},r.createElement(ye.ZP,{in:l,timeout:xe},(e=>r.createElement(r.Fragment,null,r.createElement(Ae,{ref:i,className:`Header-${e}`,height:s},n),r.createElement(Se,{className:`Body-header-${e}`,headerHeight:s},r.createElement(ve.Z,null,r.createElement(ye.ZP,{in:o,timeout:xe},(e=>r.createElement(Ce,{className:`Main-side-${e}`},t)))),r.createElement(ye.ZP,{in:o,timeout:xe,unmountOnExit:!0},(e=>r.createElement(Ie,{className:`Side-${e}`},function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];return e instanceof Function?e(...n):e}(a,(null==c?void 0:c.height)??0)))))))))}const we=(0,x.ZP)(fe.Z,{name:"Layout-Root"})`
  padding-top: 64px;

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    padding-top: 16px;
  }

  min-height: 600px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`,Se=(0,x.ZP)("div",{name:"Layout-Body",shouldForwardProp:e=>"headerHeight"!==e})`
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
  transition: ${e=>{let{theme:t}=e;return t.transitions.create("transform",{duration:xe})}};

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    transform: translate3d(0, -${e=>{let{headerHeight:t}=e;return t+32-8}}px, 0);
  }

  ${ke("Body-header",!0)} {
    opacity: 1;
    transform: initial;
  }
`,Ae=(0,x.ZP)("div",{name:"Layout-Header",shouldForwardProp:e=>"height"!==e})`
  opacity: 0.1;
  transform: translate3d(0, -${e=>{let{height:t}=e;return t+32+40}}px, 0);
  margin-bottom: ${32}px;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["transform","opacity"],{duration:xe})}};

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    transform: translate3d(0, -${e=>{let{height:t}=e;return t+32}}px, 0);
  }

  ${ke("Header",!0)} {
    opacity: 1;
    transform: initial;
  }
`,Ce=(0,x.ZP)("div",{name:"Layout-Main"})`
  width: 100%;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["transform","opacity"],{duration:xe})}};

  ${e=>{let{theme:t}=e;return t.breakpoints.up("md")}} {
    transform: translateX(calc(var(--explore-layout-side-width) / 2));
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.up("md")}} {
    max-width: calc(100%);
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.up("xl")}} {
    max-width: ${e=>{let{theme:t}=e;return t.breakpoints.values.lg}}px;
  }

  ${ke("Main-side",!0)} {
    transform: initial;
  }
`,Ie=(0,x.ZP)("div",{name:"Layout-Side"})`
  position: absolute;
  right: 0;
  top: 0;
  width: var(--explore-layout-side-width);
  height: 100%;
  opacity: 0;
  transform: translateX(calc(var(--explore-layout-side-width) / 2));
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["transform","opacity"],{duration:xe})}};
  padding: 0 24px;
  box-sizing: border-box;

  ${ke("Side",!0)} {
    display: block;
    transform: initial;
    opacity: 1;
  }

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    display: none !important;
  }
`;function ke(e,t){return t?`&.${e}-entering, &.${e}-entered`:`&.${e}-exiting, &.${e}-exited`}var Te,Le,Ne;function Re(){return Re=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},Re.apply(this,arguments)}const Fe=e=>{let{title:t,titleId:n,...a}=e;return r.createElement("svg",Re({width:43,height:24,viewBox:"0 0 43 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-labelledby":n},a),t?r.createElement("title",{id:n},t):null,Te||(Te=r.createElement("rect",{x:.25,y:.25,width:42.5,height:23.5,rx:11.75,stroke:"url(#a)",strokeWidth:.5})),Le||(Le=r.createElement("path",{d:"M10.057 16V7.273h3.051c.608 0 1.11.105 1.504.315.395.207.69.487.882.84.194.349.29.737.29 1.163 0 .375-.067.685-.2.929-.13.244-.304.437-.52.58a2.364 2.364 0 0 1-.695.315v.085c.267.017.536.11.806.281.27.17.495.415.677.733.182.318.273.708.273 1.168 0 .437-.1.83-.298 1.18-.2.35-.513.627-.942.831-.429.205-.987.307-1.675.307h-3.153Zm1.057-.938h2.096c.69 0 1.18-.133 1.47-.4.293-.27.44-.597.44-.98 0-.296-.076-.568-.226-.818a1.635 1.635 0 0 0-.644-.606c-.278-.153-.608-.23-.989-.23h-2.147v3.034Zm0-3.954h1.96c.318 0 .605-.063.86-.188.26-.124.464-.3.614-.528.154-.227.23-.494.23-.801 0-.384-.133-.709-.4-.976-.267-.27-.69-.405-1.27-.405h-1.994v2.898Zm9.355 5.028c-.63 0-1.174-.139-1.632-.417a2.803 2.803 0 0 1-1.052-1.176c-.244-.506-.367-1.094-.367-1.765 0-.67.123-1.261.367-1.772.247-.514.59-.915 1.031-1.202.443-.29.96-.435 1.551-.435.341 0 .678.057 1.01.17.332.114.635.3.908.555.273.253.49.588.652 1.005.162.418.243.932.243 1.543v.426h-5.046v-.87h4.023c0-.369-.074-.698-.222-.988a1.67 1.67 0 0 0-.622-.686 1.742 1.742 0 0 0-.946-.251c-.4 0-.747.1-1.04.298-.29.196-.512.452-.669.767a2.253 2.253 0 0 0-.234 1.014v.58c0 .494.085.913.256 1.257.173.34.413.6.72.78a2.11 2.11 0 0 0 1.07.264c.264 0 .502-.037.715-.11.216-.077.402-.191.559-.342.156-.153.277-.344.362-.57l.971.272c-.102.33-.274.62-.515.87-.242.246-.54.44-.895.579a3.318 3.318 0 0 1-1.198.204Zm7.087-6.681v.852h-3.392v-.852h3.392Zm-2.403-1.569h1.005v6.239c0 .284.042.497.124.64a.64.64 0 0 0 .324.28c.133.046.274.069.422.069.11 0 .201-.006.272-.017l.17-.034.205.903a2.046 2.046 0 0 1-.285.077 2.102 2.102 0 0 1-.465.042c-.284 0-.562-.06-.835-.183a1.66 1.66 0 0 1-.673-.558c-.176-.25-.264-.566-.264-.946V7.886Zm5.842 8.267c-.415 0-.791-.078-1.13-.234a1.938 1.938 0 0 1-.805-.686c-.198-.301-.298-.665-.298-1.091 0-.375.074-.679.222-.912.147-.236.345-.42.592-.554.247-.133.52-.233.818-.298.301-.068.604-.122.908-.162.398-.051.72-.09.967-.115.25-.029.432-.075.546-.14.116-.066.174-.18.174-.342v-.034c0-.42-.115-.747-.345-.98-.227-.233-.572-.35-1.035-.35-.48 0-.857.106-1.13.316-.272.21-.464.435-.575.673l-.954-.34c.17-.398.397-.708.681-.93.287-.224.6-.38.938-.468.34-.091.676-.137 1.006-.137.21 0 .451.026.724.077.276.048.541.15.797.303.258.153.473.384.643.694.17.31.256.725.256 1.245V16h-1.006v-.886h-.05a1.77 1.77 0 0 1-.342.456c-.159.162-.37.3-.635.413-.264.114-.586.17-.967.17Zm.153-.903c.398 0 .733-.078 1.006-.234a1.595 1.595 0 0 0 .835-1.385v-.92c-.042.05-.136.097-.28.14-.143.04-.308.075-.495.106a22.444 22.444 0 0 1-.963.128 3.84 3.84 0 0 0-.733.166 1.263 1.263 0 0 0-.546.337c-.136.148-.204.35-.204.605 0 .35.129.614.387.793.262.176.593.264.993.264Z",fill:"url(#b)"})),Ne||(Ne=r.createElement("defs",null,r.createElement("linearGradient",{id:"a",x1:0,y1:24,x2:45.606,y2:24,gradientUnits:"userSpaceOnUse"},r.createElement("stop",{stopColor:"#5667FF"}),r.createElement("stop",{offset:1,stopColor:"#A168FF"})),r.createElement("linearGradient",{id:"b",x1:9,y1:17,x2:37.636,y2:17,gradientUnits:"userSpaceOnUse"},r.createElement("stop",{stopColor:"#5667FF"}),r.createElement("stop",{offset:1,stopColor:"#A168FF"})))))};var Pe=n(6971),Me=n(95487),qe=n(70131),Ge=n(47051);const De=(0,x.ZP)("b",{shouldForwardProp:e=>"color"!==e})`
  color: ${e=>{let{color:t}=e;return t}};
`,_e=(0,x.ZP)("img")`
  vertical-align: middle;
  position: relative;
  top: -2px;
`;function $e(){const e=(0,Me.Z)(),{inView:t,ref:n}=(0,qe.YD)(),a=(0,Pe.Ox)(t&&e);return r.createElement(Be,null,r.createElement(Ue,null,r.createElement(ze,null,r.createElement("span",{className:"nav-explore-icon"})),r.createElement(Qe,null,"GitHub Data Explorer"),r.createElement(Oe,null)),r.createElement(He,{ref:n},(e=>r.createElement(r.Fragment,null,"Explore ",r.createElement(De,{color:"#9197D0"},r.createElement(Ve,{value:e,hasComma:!0,size:18}))," GitHub data with no SQL or plotting skills. Powered by ",r.createElement(_e,{height:"18",alt:"tidb cloud logo",src:"/img/tidb-cloud-logo-o.png"})))(a)))}const Oe=(0,x.ZP)(Fe)`
  margin-left: 8px;
`,ze=(0,x.ZP)("span")`
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
`,Be=(0,x.ZP)("div",{shouldForwardProp:e=>"display"!==e})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
`,Ue=(0,x.ZP)("h1")`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
`,Qe=(0,x.ZP)("span")`
`,He=(0,x.ZP)("div")`
  color: #7C7C7C;
  margin: 0;
`,Ve=(0,x.ZP)(Ge.Z)`
  display: inline-flex;
`;var We=n(48265),Ke=n(51233),Ye=n(95537),je=n(63871),Xe=n(89022),Je=n(88100);function et(e){let{value:t,onChange:n,onAction:a,onClear:o,disableInput:l=!1,disableAction:i=!1,disableClear:c=!1,clearState:s}=e;const u=(0,r.useRef)(null),{isLoading:d,isAuthenticated:m}=(0,Je.D3)(),h=(0,N.Z)((e=>{n(e.target.value)})),g=(0,N.Z)((e=>{"Enter"===e.key&&(i||(e.preventDefault(),null==a||a(e.altKey)))})),p=(0,N.Z)((e=>{null==a||a(e.altKey)}));return r.createElement(r.Fragment,null,r.createElement(tt,{fullWidth:!0,disabled:d&&!m||l,ref:u,value:t,onChange:h,onKeyDown:g,placeholder:"Questions about GitHub repos, users, orgs, languages...",multiline:!0,endAdornment:r.createElement(Ke.Z,{direction:"row",gap:1},!i&&r.createElement(nt,{color:"inherit",onClick:p,disabled:i},r.createElement(je.Z,null)),r.createElement(nt,{color:"stop"===s?"error":"inherit",onClick:o,disabled:c},"stop"===s?r.createElement(Xe.Z,null):r.createElement(Ye.Z,null)))}))}const tt=(0,x.ZP)(We.ZP)`
  background-color: #eaeaea;
  color: #3c3c3c;
  border-radius: 6px;
  font-size: 20px;
  padding: 14px;
  line-height: 1.5;

  &.Mui-disabled {
    color: rgb(60, 60, 60, 0.7);

    & > input, & > textarea {
      -webkit-text-fill-color: unset;
    }
  }
`,nt=(0,x.ZP)(T.Z)`
  &.Mui-disabled {
    color: rgb(60, 60, 60, 0.3);
  }
`;var at=n(15861),rt=n(41796),ot=n(44472),lt=n(80463),it=n(35435),ct=n(76624),st=n(61730);function ut(e){const t=new Array(e);for(let n=0;n<e;n++)t[n]=n;return t}function dt(e,t){if(0!==e.length&&(1!==e.length||!(0,l.nf)(t)||0!==t))for(;;){const n=Math.floor((Math.random()-1e-5)*e.length);if(n!==t)return e[n]}}function mt(e){let{startColor:t="#794BC5",stopColor:n="#3D44FF",steps:a,sx:o}=e;const l=(0,st.Z)((e=>e.breakpoints.down("md"))),i=(0,r.useMemo)((()=>{const e=(0,rt.tB)(t).values,r=(0,rt.tB)(n).values;return ut(a.length+1).map((t=>function(e,t,n){let[a,r,o]=e,[l,i,c]=t;const s=1-n;return(0,rt.wy)({type:"rgb",values:[a*s+l*n,r*s+i*n,o*s+c*n]})}(e,r,t/a.length)))}),[t,n,a.length]);return r.createElement(r.Fragment,null,r.createElement("svg",{width:"0",height:"0"},r.createElement("defs",null,a.map(((e,t)=>r.createElement("linearGradient",{id:`explore-step-gradient-${t}`,key:t,x1:"0%",y1:"0%",x2:"100%",y2:"0%"},r.createElement("stop",{offset:"0%",style:{stopColor:i[t],stopOpacity:1}}),r.createElement("stop",{offset:"100%",style:{stopColor:i[t+1],stopOpacity:1}})))))),r.createElement(ct.Z,{sx:o,orientation:l?"vertical":"horizontal"},a.map(((e,t)=>r.createElement(ot.Z,{key:e,completed:!1,active:!0},r.createElement(ht,{fill:`explore-step-gradient-${t}`},e))))))}const ht=(0,x.ZP)(it.Z,{shouldForwardProp:e=>"fill"!==e})`
  .${lt.Z.root}.${lt.Z.active} {
    fill: url(#${e=>{let{fill:t}=e;return t}}); // ${e=>{let{color:t}=e;return t}};
  }
`;var gt=n(23147),pt=n(64232),Et=n(39960),ft=n(90031),vt=n(3106),yt=n(52263);function bt(e){let{as:t="a",campaign:n,trial:a,content:o,...i}=e;const{user:c}=(0,ft.g)(),{campaign:s,trial:u}=(0,r.useContext)(vt.Z),{siteConfig:{customFields:d}}=(0,yt.Z)(),{campaign:m,trial:h}=(0,r.useMemo)((()=>({campaign:(0,l.kX)(l.GC,n,s,void 0),trial:(0,l.kX)(l.nf,a,u,!1)})),[n,s,a,u]),g=(0,r.useMemo)((()=>{const e=new URL(`https://${null==d?void 0:d.tidbcloud_host}/channel`);if((0,l.GC)(m)&&(e.searchParams.set("utm_source","ossinsight"),e.searchParams.set("utm_medium","referral"),e.searchParams.set("utm_campaign",m),(0,l.GC)(o)&&e.searchParams.set("utm_content",o)),h){const t=function(e){if((0,l.nf)(e)&&(0,l.GC)(e.email)&&(0,l.GC)(e.sub)){let t;switch(e.sub.split("|")[0]){case"github":t="github";break;case"google-oauth2":t="google";break;case"windowslive":t="microsoft";break;default:return}return{email:e.email,connection:t}}return}(c);(0,l.nf)(t)&&(e.searchParams.set("email",t.email),e.searchParams.set("connection",t.connection))}return e.toString()}),[c,m,h]);return(0,r.createElement)(t,{href:g,target:"_blank",rel:"noopener",...i})}function xt(){return r.createElement(fe.Z,{component:"section",maxWidth:"md",id:"data-explorer-faq",sx:{py:8}},r.createElement(at.Z,{variant:"h2",textAlign:"center",mb:8},"FAQ"),Zt.map(((e,t)=>{let{q:n,a:a,id:o}=e;return r.createElement(wt,{key:t,id:o},r.createElement(St,null,n),r.createElement(At,null,a))})),r.createElement(at.Z,{variant:"body1",textAlign:"center",color:"#929292",fontSize:16,mt:8},"Still having trouble? Contact us, we're happy to help! ",Tt," ",Lt))}const Zt=[{q:"How it works",a:r.createElement(mt,{steps:["Input your question","Translate the question into SQL","Visualize and output results"]})},{q:"Can I use the AI-powered feature with my own dataset?",a:r.createElement(r.Fragment,null,"Yes! We integrated the capabilities of Text2SQL into ",r.createElement(bt,null,"Chat2Query"),", an AI-powered SQL generator in ",r.createElement(bt,null,"TiDB Cloud"),". If you want to explore any other dataset, Chat2Query is an excellent choice.")},{q:"What are the limitations of GitHub Data Explorer?",a:r.createElement(r.Fragment,null,r.createElement("ol",null,r.createElement("li",null,"AI is still a work in progress with limitations",r.createElement("br",null),"Its limitations include:",r.createElement("ul",null,r.createElement("li",null,"A lack of context and knowledge of the specific database structure"),r.createElement("li",null,"A lack of domain knowledgestructure"),r.createElement("li",null,"Inability to produce the most efficient SQL statement for large and complex queries"),r.createElement("li",null,"Sometimes service instability")),r.createElement("br",null),"To help AI understand your query intention, please use clear, specific phrases in your question. Check out our question optimization tips. We're constantly working on improving and optimizing it, so any feedback you have is greatly appreciated. Thanks for using!"),r.createElement("br",null),r.createElement("li",null,"The dataset itself is a limitation for our tool"),"All the data we use on this website is sourced from GH Archive, a non-profit project that records and archives all GitHub event data since 2011 (public data only). If a question falls outside of the scope of the available data, it may be difficult for our tool to provide a satisfactory answer."))},{id:"faq-failed-to-generate-sql",q:"Why did it fail to generate an SQL query?",a:r.createElement(r.Fragment,null,"Potential reasons:",r.createElement("ul",null,r.createElement("li",null,"The AI was unable to understand or misunderstood your question, resulting in an inability to generate SQL. To know more about AI's limitations, you can check out the previous question."),r.createElement("li",null,"Network issues."),r.createElement("li",null,"You had excessive requests. Note that you can ask ",r.createElement("b",null,"up to 15 questions per hour"),".")),r.createElement("br",null),"The potential solution is phrase your question which is related GitHub with short, specific words, then try again. And we strongly recommend you use our query templates near the search box to start your exploring.")},{id:"faq-optimize-sql",q:"The query result is not satisfactory. How can I optimize my question?",a:r.createElement(r.Fragment,null,"We use AI to translate your question to SQL. But it's still a work in progress with limitations.",r.createElement("br",null),"To help AI understand your query intention and get a desirable query result, you can rephrase your question using clear, specific phrases related to GitHub. We recommend:",r.createElement("ul",null,r.createElement("li",null,'Using a GitHub login account instead of a nickname. For example, change "Linus" to "torvalds." '),r.createElement("li",null,'Using a GitHub repository\'s full name. For example, change "react" to "facebook/react."'),r.createElement("li",null,'Using GitHub terms. For example, to find Python projects with the most forks in 2022, change your query "The most popular Python projects 2022" to "Python projects with the most forks in 2022."')),r.createElement("br",null),"You can also get inspiration from the suggested queries near the search box.")},{q:"Why did it fail to generate a chart?",a:r.createElement(r.Fragment,null,"Potential reasons:",r.createElement("ul",null,r.createElement("li",null,"The SQL query was incorrect or could not be generated, so the answer could not be found in the database, and the chart could not be generated."),r.createElement("li",null,"The answer was found, but the AI did not choose the correct chart template, so the chart could not be generated."),r.createElement("li",null,"The SQL query was correct, but no answer was found, so the chart could not be displayed.")))},{q:"What technology is GitHub Data Explorer built on?",a:r.createElement(r.Fragment,null,"Its major technologies include:",r.createElement("ul",null,r.createElement("li",null,"Data source: GH Archive and GitHub event API",r.createElement("br",null),"GH Archive collects and archives all GitHub data since 2011 and updates it hourly. ",r.createElement("b",null,"By combining the GH Archive data and the GitHub event API, we can gain streaming, real-time data updates.")),r.createElement("li",null,"One database for all workloads:  ",r.createElement(bt,null,"TiDB Cloud"),r.createElement("br",null),"Facing continuously growing large-volume data (currently 5+ billion GitHub events), we need a database that can:",r.createElement("ul",null,r.createElement("li",null,"Store massive data"),r.createElement("li",null,"Handle complex analytical queries"),r.createElement("li",null,"Serve online traffic")),r.createElement(Et.Z,{href:"https://docs.pingcap.com/tidb/stable/overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301",target:"_blank",rel:"noopener"}," TiDB ")," is an ideal solution. TiDB Cloud is its fully managed cloud Database as a Service. It lets users launch TiDB in seconds and offers the pay-as-you-go pricing model. Therefore, ",r.createElement("b",null,"we choose TiDB Cloud as our backend database.")),r.createElement("li",null,"AI engine: OpenAI"),"To enable users without SQL knowledge to query with this tool, ",r.createElement("b",null,"we use ChatGPT API to translate the natural language to SQL.")))}],wt=(0,x.ZP)("div")`
  scroll-margin: 100px;

  &:not(:first-of-type) {
    margin-top: 48px;
  }
`,St=(0,x.ZP)("h3")`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
`,At=(0,x.ZP)("div")`
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  color: #C1C1C1;
  margin: 0;
`,Ct=(0,x.ZP)("a")`
  display: inline-flex;
  vertical-align: text-bottom;
  width: 24px;
  height: 24px;
  text-decoration: none !important;
  align-items: center;
  justify-content: center;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["color","background-color"])}};
  margin-left: 8px;
`,It=(0,x.ZP)(Ct)`
  color: #eaeaea !important;

  &:hover {
    color: white;
  }
`,kt=(0,x.ZP)(Ct)`
  font-size: 18px;
  color: #1D9BF0 !important;
  border-radius: 50%;
  background-color: #eaeaea;

  &:hover {
    background-color: white;
  }
`,Tt=r.createElement(It,{href:"https://github.com/pingcap/ossinsight/issues",target:"_blank"},r.createElement(gt.Z,null)),Lt=r.createElement(kt,{href:"https://twitter.com/OSSInsight",target:"_blank"},r.createElement(pt.Z,{fontSize:"inherit"}));var Nt=n(86886),Rt=n(88078),Ft=n(49990);const Pt=(0,x.ZP)("div",{name:"Highlight-Background"})`
  position: relative;
  background: linear-gradient(116.45deg, #595FEC 0%, rgba(200, 182, 252, 0.2) 96.73%);
  padding: 1px;
  border-radius: 7px;
  width: 100%;
`,Mt=(0,x.ZP)(Ft.Z,{name:"Highlight-Content"})`
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
`,qt=(0,x.ZP)(Pt,{name:"HighlightButton-Background"})`
  display: inline-block;
  border-radius: 17px;
  max-width: max-content;
  color: white !important;
  text-decoration: none !important;
`;(0,x.ZP)(Mt,{name:"HighlightButton-Content"})`
  display: flex;
  border-radius: 16px;
  align-items: center;
  padding: 8px;
  max-width: max-content;
`,qt.withComponent(Ft.Z),qt.withComponent(Et.Z);function Gt(e){let{question:t,questionId:n,variant:a="card",imageUrl:o,prefix:i,tags:c,disabled:s}=e;const{gtagEvent:u}=(0,g.u)(),{handleSelect:d,handleSelectId:m}=(0,r.useContext)(de),h=(0,N.Z)((()=>{u("click_template_question",{questionId:n??"",questionTitle:zt(t)}),(0,l.GC)(n)?m(n):"string"==typeof t&&d(t)}));switch(a){case"recommended-card":return r.createElement(Pt,null,r.createElement(Mt,{onClick:h,disabled:s},t),r.createElement(_t,null,"\u2728"));case"card":return r.createElement(Mt,{onClick:h,disabled:s},t,null==c?void 0:c.map((e=>r.createElement($t,{key:e.id,color:e.color},e.label))),o&&r.createElement(Ot,{src:o,alt:"preview image"}));default:return r.createElement(Dt,{disableRipple:!0,disableTouchRipple:!0,onClick:h,disabled:s},i,t,null==c?void 0:c.map((e=>r.createElement($t,{key:e.id,color:e.color},e.label))))}}const Dt=(0,x.ZP)(Ft.Z,{name:"QuestionCard-Link"})`
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
`,_t=(0,x.ZP)("span")`
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 12px;
`,$t=(0,x.ZP)("span",{shouldForwardProp:e=>"color"!==e})`
  display: inline-block;
  color: ${e=>{let{color:t}=e;return t}};
  background-color: ${e=>{let{color:t}=e;return(0,rt.Fq)(t,.1)}};
  border: 1px solid ${e=>{let{color:t}=e;return(0,rt.Fq)(t,.3)}};
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 24px;
  font-size: 12px;
  line-height: 1;
`,Ot=(0,x.ZP)("img")`
  width: 100%;
  margin-top: 12px;
`,zt=function(e){if(null==e)return"";let t="";if("string"==typeof e)t=e;else if("number"==typeof e)t=e.toString();else if("object"==typeof e&&(n=e,Symbol.iterator in n))for(const a of e)t+=zt(a);else(0,r.isValidElement)(e)&&(t+=zt(e.props.children));var n;return t};var Bt=n(8100),Ut=n(25108);function Qt(e,t,n){const{data:a,isValidating:i,mutate:c}=(0,Bt.ZP)([e,t,n,"data-explorer-recommend-question"],{fetcher:async(e,t)=>await async function(e,t,n){const a={};return(0,l.z0)(t)&&(a.n=t),(0,l.nf)(n)&&(a.tagId=n),await o.po.get("/explorer/questions/recommend",{params:a})}(0,t,n),shouldRetryOnError:!1,revalidateIfStale:!1,revalidateOnReconnect:!1,revalidateOnFocus:!1});return{data:a,loading:i,reload:(0,r.useMemo)((()=>()=>{c(void 0,{revalidate:!0}).catch(Ut.error)}),[])}}function Ht(e){let{variant:t,disabled:n,questions:a,n:o,questionPrefix:l,showTags:i=!1}=e;const c=0===a.length?(()=>{const e=e=>r.createElement(Gt,{key:e,variant:t,question:"text"===t?r.createElement(Rt.Z,{width:"70%"}):r.createElement(r.Fragment,null,r.createElement(Rt.Z,{width:"100%"}),r.createElement(Rt.Z,{width:"61%"})),disabled:!0});return"text"===t?ut(3).map(e):ut(3).map((t=>r.createElement(Nt.ZP,{item:!0,xs:12,md:4,key:t,display:"flex",alignItems:"stretch",justifyContent:"stretch"},e(t))))})():(()=>{const e=(e,a)=>r.createElement(Gt,{key:a,variant:t,question:e.title,questionId:e.questionId,tags:i?e.tags:[],prefix:l,disabled:n});return"text"===t?a.map(e):a.map(((t,n)=>r.createElement(Nt.ZP,{item:!0,xs:12,md:4,key:t.hash,display:"flex",alignItems:"stretch",justifyContent:"stretch"},e(t,n))))})();return"text"===t?r.createElement(y.Z,null,c):r.createElement(Nt.ZP,{container:!0,spacing:2},c)}function Vt(e){let{aiGenerated:t=!1,n:n,disabled:a=!1,title:o,questionPrefix:l,variant:i}=e;const{data:c=[],reload:s,loading:u}=Qt(t,n);return r.createElement(r.Fragment,null,r.createElement(y.Z,{mb:.5},(null==o?void 0:o(s,u))??null),r.createElement(Ht,{n:n,questions:c,disabled:a,questionPrefix:l,variant:i??(t?"recommended-card":"card")}))}var Wt,Kt,Yt,jt=n(67720),Xt=n(96514),Jt=n(54566),en=n(1588);function tn(){return tn=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},tn.apply(this,arguments)}const nn=e=>{let{title:t,titleId:n,...a}=e;return r.createElement("svg",tn({width:32,height:32,viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-labelledby":n},a),t?r.createElement("title",{id:n},t):null,Wt||(Wt=r.createElement("circle",{cx:16,cy:16,r:16,fill:"#fff"})),Kt||(Kt=r.createElement("path",{d:"M8 16.876h1.621v3.938H22.59v-3.938h1.62v3.938c0 .874-.72 1.575-1.62 1.575H9.62C8.73 22.39 8 21.69 8 20.814v-3.938ZM16.105 9l-4.49 4.3 1.151 1.119 2.529-2.466v7.286h1.62v-7.286l2.538 2.466 1.15-1.127L16.106 9Z",fill:"url(#a)"})),Yt||(Yt=r.createElement("defs",null,r.createElement("linearGradient",{id:"a",x1:8,y1:22.389,x2:25.193,y2:22.389,gradientUnits:"userSpaceOnUse"},r.createElement("stop",{stopColor:"#5667FF"}),r.createElement("stop",{offset:1,stopColor:"#A168FF"})))))};var an=n(86010),rn=n(87462);const on=(0,x.ZP)("a",{name:"GradientDashedBox",slot:"root",shouldForwardProp:e=>!["stops","deg","borderRadius"].includes(e)})`
  display: block;
  background: linear-gradient(${e=>{let{deg:t}=e;return t}}deg, ${e=>{let{stops:t}=e;return t.map((e=>{let[t,n]=e;return`${t} ${n}%`})).join(", ")}});
  border-radius: ${e=>{let{borderRadius:t}=e;return t}}px;

  &, &:active, &:hover {
    text-decoration: none;
    color: initial;
  }
`,ln=(0,x.ZP)("span",{name:"GradientDashedBox",slot:"container",shouldForwardProp:e=>!["backgroundColor","borderRadius"].includes(e)})`
  display: block;
  border-radius: ${e=>{let{borderRadius:t}=e;return t}}px;
  border: dashed 1px ${e=>{let{backgroundColor:t}=e;return t}};
  box-sizing: border-box;
`,cn=(0,x.ZP)("span",{name:"GradientDashedBox",slot:"content",shouldForwardProp:e=>!["backgroundColor","borderRadius"].includes(e)})`
  display: block;
  background-color: ${e=>{let{backgroundColor:t}=e;return t}};
  border-radius: ${e=>{let{borderRadius:t}=e;return t-1}}px;
`,sn=(0,en.Z)("GradientDashedBox",["root","container","content"]),un=(0,r.forwardRef)(((e,t)=>{let{stops:n=[],backgroundColor:a="var(--ifm-background-color)",borderRadius:o=6,deg:l=90,components:i,className:c,children:s,...u}=e;const d=(0,an.Z)(c,sn.root,null==i?void 0:i.root),m=(0,an.Z)(sn.container,null==i?void 0:i.container),h=(0,an.Z)(sn.content,null==i?void 0:i.content);return r.createElement(on,(0,rn.Z)({className:d,ref:t,stops:n,deg:l,borderRadius:o},u),r.createElement(ln,{className:m,borderRadius:o,backgroundColor:a},r.createElement(cn,{className:h,borderRadius:o,backgroundColor:a},s)))})),dn=[["#FFBCA7",2.21],["#DAA3D8",30.93],["#B587FF",67.95],["#6B7AFF",103.3]],mn=e=>{let{size:t,sx:a,utmContent:o}=e;return r.createElement(r.Fragment,null,r.createElement(bt,{as:gn,sx:a,stops:dn,deg:90,content:o,components:{content:(0,an.Z)({[hn.small]:"small"===t})}},r.createElement(at.Z,{variant:"body2",fontSize:12,color:"#A0A0A0"},"GitHub data is not your focus?"),r.createElement(pn,{className:(0,an.Z)({[hn.small]:"small"===t})},r.createElement(En,{className:(0,an.Z)({[hn.small]:"small"===t})},r.createElement(nn,null)),"Import any dataset"),r.createElement(fn,{className:(0,an.Z)({[hn.small]:"small"===t}),width:"228",src:n(10744).Z,alt:"image"})))},hn=(0,en.Z)("Ads",["small"]),gn=(0,x.ZP)(un)`
  opacity: 1;
  cursor: pointer;
  user-select: none;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["box-shadow","transform"])}};

  &:hover {
    box-shadow: ${e=>{let{theme:t}=e;return t.shadows[10]}};
    transform: scale3d(1.02, 1.02, 1.02);
  }

  .${sn.content} {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;

    &.${hn.small} {
      padding: 12px;
    }
  }
`,pn=(0,x.ZP)("span")`
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

  &.${hn.small} {
    font-size: 14px;
  }
`,En=(0,x.ZP)("span")`
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

  &.${hn.small} {
    width: 24px;
    height: 24px;
    min-width: 24px;
    font-size: 16px;
    margin-right: 8px;
  }
`,fn=(0,x.ZP)("img")`
  max-width: 100%;

  &.${hn.small} {
    max-width: 90%;
  }
`;function vn(e){let{headerHeight:t=0,showAds:n}=e;return r.createElement(yn,{headerHeight:t},r.createElement(Vt,{variant:"text",n:4,title:(e,t)=>r.createElement(at.Z,{variant:"h3",mb:0,fontSize:16},"\ud83d\udca1 Popular questions",r.createElement(T.Z,{onClick:e,disabled:t},r.createElement(Jt.Z,{fontSize:"inherit"})))}),r.createElement(bn,{to:"/explore/"},"> See more"),n&&r.createElement(Xt.Z,{in:n},r.createElement("div",null,r.createElement(jt.Z,{orientation:"horizontal",sx:{my:2}}),r.createElement(mn,{size:"small",utmContent:"result_right"}))))}const yn=(0,x.ZP)("div",{shouldForwardProp:e=>"headerHeight"!==e})`
  position: sticky;
  top: ${e=>{let{headerHeight:t}=e;return 156+t}}px;
`,bn=(0,x.ZP)(Et.Z)`
  font-size: 14px;
`;var xn=n(61084);const Zn=(0,x.ZP)("section",{name:"Section",slot:"root"})`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.5) 0%, rgba(200, 182, 252, 0.1) 96.73%);
  padding: 1px;
  border-radius: 6px;
  margin-top: 12px;
`,wn=(0,x.ZP)("div",{name:"Section",slot:"container"})`
  border: none;
  background: rgb(36, 35, 43);
  border-radius: 5px !important;
  padding: 0 8px;
  overflow: hidden;
  position: relative;
`,Sn=(0,x.ZP)("div",{name:"Section",slot:"header"})`
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
`,An=(0,x.ZP)("div",{name:"Section",slot:"body"})`
  padding: 0 16px;
`;function Cn(e,t){return void 0===t&&(t=!0),()=>{var n;null==(n=document.getElementById(e))||n.scrollIntoView(t?{behavior:"smooth"}:void 0)}}var In=n(21039);const kn=(0,r.forwardRef)((function(e,t){let{createIssueUrl:n,severity:a,sx:o,children:l}=e;const i=(0,N.Z)((()=>{window.open(n(),"_blank")}));return r.createElement(r.Fragment,null,r.createElement(Tn,{sx:o,variant:"outlined",severity:a,ref:t},l,r.createElement(Ke.Z,{direction:"row",spacing:2,mt:2},r.createElement(Ln,{onClick:Cn("data-explorer-faq")},r.createElement(In.Z,{fontSize:"inherit",sx:{mr:.5}}),r.createElement("span",null,"See FAQ")),r.createElement(Ln,{onClick:i},r.createElement(gt.Z,{fontSize:"inherit",sx:{mr:.5}}),r.createElement("span",null,"Report an issue")))))})),Tn=(0,x.ZP)(k.Z)`
  background: #18191A;
  border-color: transparent;

  a {
    color: currentColor !important;
    text-decoration: underline !important;
  }
`,Ln=(0,x.ZP)("button")`
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
`;var Nn=n(36782);function Rn(e,t){return()=>function(e,t){void 0===t&&(t={});const n=new URL(`https://github.com/${e}/issues/new`);return Object.entries(t).forEach((e=>{let[t,a]=e;n.searchParams.set(t,a)})),n.toString()}("pingcap/ossinsight",{title:Fn(e,t),body:_n(e,t),labels:"area/data-explorer,type/bug"})}function Fn(e,t){switch(t??e.errorType){case c.ANSWER_GENERATE:case c.ANSWER_PARSE:case c.SQL_CAN_NOT_ANSWER:case c.VALIDATE_SQL:return(e=>{let{id:t,title:n}=e;return`[Explorer] Generate SQL failed for question ${t}: ${n}`})(e);case c.QUERY_EXECUTE:case c.QUERY_TIMEOUT:return(e=>{let{id:t,title:n}=e;return`[Explorer] Execution failed for question ${t}: ${n}`})(e);case c.EMPTY_RESULT:return(e=>{let{id:t,title:n}=e;return`[Explorer] Empty result for question ${t}: ${n}`})(e);case c.VALIDATE_CHART:return(e=>{let{id:t,title:n}=e;return`[Explorer] Visualization failed for question ${t}: ${n}`})(e);default:return(e=>{let{id:t,title:n}=e;return`[Explorer] Some problem for question ${t}: ${n}`})(e)}}function Pn(e,t){return`[${e} ${t}](https://ossinsight.io/explore/?id=${e})`}function Mn(e){return`\n## Generated SQL\n\`\`\`mysql\n${function(e){try{return(0,Nn.WU)(e,{language:"mysql"})}catch(t){return e}}(e??"")}\n\`\`\`\n`}function qn(e){return`\n## Chart:\n\`\`\`json\n${JSON.stringify(e,void 0,2)}\n\`\`\`\n`}function Gn(e){var t;return`\n## Result:\n\`\`\`json\n// Fields\n  ${JSON.stringify(null==e?void 0:e.fields,void 0,2)}\n\n// First result (Totally ${(null==e?void 0:e.rows.length)??0} rows)\n  ${JSON.stringify(null==e||null==(t=e.rows)?void 0:t[0],void 0,2)}\n\`\`\`\n`}function Dn(e){return`\n## Error message\n\`\`\`\n${(0,p.e$)(e)}\n\`\`\`\n`}function _n(e,t){switch(t??e.errorType){case c.ANSWER_GENERATE:case c.ANSWER_PARSE:case c.SQL_CAN_NOT_ANSWER:case c.VALIDATE_SQL:return(e=>{let{id:t,title:n,errorType:a,error:r}=e;return`\nHi, I have some problems with the question ${Pn(t,n)} (errorType = ${a??"none"}):\n\x3c!-- Extra info Here --\x3e\n\n${Dn(r)}\n`})(e);case c.QUERY_EXECUTE:case c.QUERY_TIMEOUT:return(e=>{let{id:t,title:n,errorType:a,error:r,querySQL:o,executedAt:l,requestedAt:i}=e;return`\nHi, It's failed to execute the question ${Pn(t,n)} (errorType = ${a??"none"}):\n\x3c!-- Extra info Here --\x3e\n\n- executedAt: ${l??"unknown"}\n- requestedAt: ${l??"unknown"}\n\n${Dn(r)}\n\n${Mn(o)}\n`})(e);case c.EMPTY_RESULT:return(e=>{let{id:t,title:n,errorType:a,error:r,querySQL:o,executedAt:l,requestedAt:i}=e;return`\nHi, The result is empty for question ${Pn(t,n)} (errorType = ${a??"none"}):\n\x3c!-- Extra info Here --\x3e\n\n- executedAt: ${l??"unknown"}\n- requestedAt: ${l??"unknown"}\n\n${Dn(r)}\n\n${Mn(o)}\n`})(e);case c.VALIDATE_CHART:return(e=>{let{id:t,title:n,chart:a,result:r,querySQL:o,errorType:l}=e;return`\nHi, Visualization failed for question ${Pn(t,n)} (errorType = ${l??"none"}):\n\x3c!-- Extra info Here --\x3e\n\n${Mn(o)}\n\n${qn(a)}\n\n${Gn(r)}\n`})(e);default:return(e=>{let{id:t,title:n,chart:a,result:r,querySQL:o,errorType:l}=e;return`\nHi, I have some problems with the question ${Pn(t,n)} (errorType = ${l??"none"}):\n\x3c!-- Describe your question --\x3e\n\n${Mn(o)}\n\n${qn(a)}\n\n${Gn(r)}\n`})(e)}}const $n=(0,r.forwardRef)((function(e,t){let{severity:n,sx:a,children:o}=e;const{question:i}=le(),c=(0,r.useMemo)((()=>(0,l.Rw)(i)?()=>"":Rn(i)),[i]);return r.createElement(kn,{severity:n,sx:a,ref:t,createIssueUrl:c},o)}));let On;!function(e){e.pending="pending",e.loading="loading",e.success="success",e.error="error"}(On||(On={}));const zn=(0,r.forwardRef)(((e,t)=>{let{className:n,style:a,header:o,error:i,errorIn:c=!0,errorMessage:s,afterErrorBlock:u,onErrorMessageStart:d,onErrorMessageReady:m,errorWithChildren:h=!1,children:g}=e;return r.createElement(Zn,{className:n,style:a,ref:t},r.createElement(wn,null,r.createElement(Sn,null,o),r.createElement(An,null,r.createElement(b.Z,{in:c,timeout:"auto",unmountOnExit:!0,onEnter:d,onEntered:m},r.createElement("div",null,r.createElement($n,{severity:"error",sx:{mb:2}},s),u)),(0,l.N6)(i)?h?g:void 0:g)))})),Bn=(0,en.Z)("RippleDot",["root","info","success","error","warning","active"]);function Un(e){let{active:t=!0,color:n="info",size:a=8,sx:o}=e;return r.createElement(Hn,{size:a,className:(0,an.Z)({[Bn.root]:!0,[Bn.active]:t,[Bn[n]]:!0}),sx:o})}const Qn=S.F4`
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
`,Hn=(0,x.ZP)("span",{name:"RippleDot",shouldForwardProp:e=>"size"!==e})`
  display: inline-block;
  position: relative;
  width: ${e=>{let{size:t}=e;return t}}px;
  height: ${e=>{let{size:t}=e;return t}}px;
  border-radius: 50%;

  &.${Bn.error} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.error.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.error.main}};
    }
  }

  &.${Bn.success} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.success.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.success.main}};
    }
  }

  &.${Bn.info} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.info.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.info.main}};
    }
  }

  &.${Bn.warning} {
    background-color: ${e=>{let{theme:t}=e;return t.palette.warning.main}};
    &:before {
      background-color: ${e=>{let{theme:t}=e;return t.palette.warning.main}};
    }
  }

  &.${Bn.active}:before {
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
    animation: ${Qn} 1.2s infinite;
    animation-play-state: paused;
  }
`;var Vn=n(70983),Wn=n(96812);function Kn(e){let{status:t}=e;switch(t){case On.loading:return r.createElement(Un,{sx:Yn,size:12});case On.success:return r.createElement(Vn.Z,{sx:Yn,color:"success",fontSize:"inherit"});case On.error:return r.createElement(Wn.Z,{sx:Yn,color:"disabled",fontSize:"inherit"});default:return r.createElement(r.Fragment,null)}}const Yn={mr:1,verticalAlign:"middle"};var jn=n(22821),Xn=n(16628),Jn=n(11057),ea=n(18629);function ta(e){let{content:t,avgInterval:n=80,maxDiff:a=50,maxContinuous:o=1}=e;const[l,i,c]=function(e){const[t,n]=(0,r.useState)(e),a=(0,r.useRef)(t);return(0,r.useEffect)((()=>{a.current=t}),[t]),[t,n,a]}(0),[s,u]=(0,r.useState)(!0);return(0,r.useEffect)((()=>{let e;i(0);const r=ut(o).map((e=>e+1));return u(!1),function o(){e=setTimeout((()=>{c.current>=t.length?(clearTimeout(e),u(!0)):(i((e=>{const n=e+(dt(r)??1);return t.substring(e,n).includes(" ")?e+1:n})),o())}),n+(.5-Math.random())*a)}(),()=>{clearTimeout(e)}}),[t]),r.createElement(r.Fragment,null,t.slice(0,l),t.length!==l,!s&&r.createElement(aa,null))}const na=S.F4`
  to {
    visibility: hidden;
  }
`,aa=(0,x.ZP)("span")`
  display: inline-block;
  width: 1px;
  height: 1em;
  vertical-align: text-bottom;
  background-color: currentColor;
  animation: ${na} 1s steps(2, start) infinite;
`;function ra(e){let{question:t,phase:n,sqlSectionStatus:a,open:o,toggleOpen:i,onMessagesStart:c,onMessagesReady:s}=e;const[u,d]=(0,r.useState)(!1),[h,g]=(0,r.useState)(!0),p=(0,r.useMemo)((()=>{switch(n){case ee.NONE:return"";case ee.LOADING:return"Loading question...";case ee.CREATING:case ee.GENERATING_SQL:return r.createElement(la,null);case ee.LOAD_FAILED:return"Question not found";case ee.GENERATE_SQL_FAILED:case ee.CREATE_FAILED:return"Failed to generate SQL";case ee.VALIDATE_SQL_FAILED:return"Invalid SQL generated";default:return"Ta-da! SQL is written,"}}),[n]),E=(0,r.useMemo)((()=>(0,l.nf)(t)&&se(t)),[t]),f=(0,r.useMemo)((()=>!te.has(n)),[n]),v=(0,m.Z)((()=>{null==s||s(),d(!0)})),y=(0,m.Z)((()=>{null==c||c(),d(!1)})),b=(e,t,n)=>r.createElement(r.Fragment,null,r.createElement(Kn,{status:t}),e,"success"===t&&r.createElement(Jn.Z,{size:"small",onClick:i,endIcon:r.createElement($.Z,{sx:{rotate:n?"180deg":0,transition:e=>e.transitions.create("rotate")}}),sx:{ml:1}},n?"Hide":"Check it out"));return(0,l.Rw)(t)||!E?r.createElement(w,null,!f&&r.createElement(Z,null,r.createElement(A,{animated:!0,sx:{mr:1,mt:.5}}),p),f&&r.createElement(Z,null,b(p,a,o))):r.createElement(w,null,r.createElement(H,{question:t,onStop:v,onStart:y,prompts:r.createElement(Z,null,u?b(p,a,o):b("Generating SQL...",On.loading,!1)),collapsed:h,onCollapsedChange:g}))}const oa=[["Great question!","Interesting question!","Awesome question!","You asked a winner!"],["Sometimes I'm not smart enough...","Sometimes it's difficult for me...","Not always generate perfect SQL...","Struggling with SQL accuracy..."],["Tough, but still trying...","Hard, but persevering.","Tough, but forging ahead...","Challenging, but still striving...","Struggling, but pushing on..."],["Mastering the art of turning words into SQL magic\u2026","Gaining knowledge from your input...","Learning from your question...","Getting smarter with your input..."],["Making every effort!","Working my hardest","Trying my best...","Striving for greatness...","Trying my best..."],["Almost there\u2026","Almost done...","Just a second!"]];function la(){const e=(0,r.useRef)({group:0}),[t,n]=(0,r.useState)((()=>dt(oa[0])));return(0,ea.Z)((()=>{let{group:t}=e.current;t<5?t+=1:t=4,n(dt(oa[t])),e.current.group=t}),3e3),(0,l.nf)(t)?r.createElement(ta,{content:t}):r.createElement(r.Fragment,null,"Generating SQL...")}function ia(e){let{anchor:t,smooth:n=!1,...a}=e;const o=(0,N.Z)((e=>{e.preventDefault(),Cn(t,n)()}));return r.createElement("a",(0,rn.Z)({href:`#${t}`},a,{onClick:o}))}function ca(e){var t,n;let{error:a}=e;const{question:o}=le(),[i,{toggle:s}]=(0,jn.Z)(!1);if("error"!==(null==o?void 0:o.status))return r.createElement(r.Fragment,null);switch(o.errorType){case c.ANSWER_GENERATE:return((null==(t=o.error)?void 0:t.indexOf("code 500"))??-1)>=0?r.createElement(at.Z,{variant:"body1"},"OpenAI failed to respond. Please try again later."):r.createElement(at.Z,{variant:"body1"},"Failed to generate SQL due to network error. Please try again later.");case c.ANSWER_PARSE:return r.createElement(at.Z,{variant:"body1"},"Failed to generate SQL. Optimize your question for effective SQL, or get ideas from ",r.createElement(Et.Z,{to:"/explore/"},"popular questions"),".");case c.SQL_CAN_NOT_ANSWER:return r.createElement(at.Z,{variant:"body1"},"Sorry, I can't generate SQL as your question is not GitHub-related or beyond our data source.");case c.QUESTION_IS_TOO_LONG:return r.createElement(at.Z,{variant:"body1"},"Sorry, your question is too long. Please simplify it to a few sentences.");case c.VALIDATE_SQL:{const e=function(e,t){if(!(0,l.Rw)(t)&&e===c.VALIDATE_SQL&&t.toLowerCase().includes("with repo_name of specified repo"))return"Maybe you need specify a repo name in your question."}(c.VALIDATE_SQL,o.error);return(0,l.nf)(e)?r.createElement(r.Fragment,null,r.createElement(at.Z,{variant:"body1"},e,r.createElement("br",null),"Optimize your question for effective SQL, or get ideas from ",r.createElement(Et.Z,{to:"/explore/"},"popular questions"),".")):r.createElement(r.Fragment,null,r.createElement(at.Z,{variant:"body1"},"SQL syntax error or invalid field. ",r.createElement(Jn.Z,{variant:"text",size:"small",onClick:s},"DETAIL"),r.createElement("br",null),r.createElement(b.Z,{in:i},r.createElement(jt.Z,{orientation:"horizontal",sx:{my:2}}),r.createElement(at.Z,{variant:"body2"},o.error??"Empty message"),r.createElement(jt.Z,{orientation:"horizontal",sx:{my:2}})),"Optimize your question for effective SQL, or get ideas from ",r.createElement(Et.Z,{to:"/explore/"},"popular questions"),"."))}}return(0,p.IZ)(a)&&429===(null==(n=a.response)?void 0:n.status)?r.createElement(r.Fragment,null,"Wow, you're a natural explorer! But it's a little tough to keep up!",r.createElement("br",null),"Take a break and try again in ",function(e){const t=(0,p.PY)(e);if((0,l.nf)(null==t?void 0:t.waitMinutes))return`${null==t?void 0:t.waitMinutes} minutes`;const n=(0,p.e$)(e).match(/please wait (.+)\./);return(0,l.nf)(n)?n[1]:"30 minutes"}(a),".",r.createElement("br",null),"Check out ",r.createElement(bt,null,"Chat2Query")," if you want to try AI-generated SQL in any other dataset ",r.createElement("b",null,"within 5 minutes"),"."):r.createElement(r.Fragment,null,"Whoops! No SQL query is generated. Check out ",r.createElement(ia,{anchor:"faq-failed-to-generate-sql"},"potential reasons")," and try again later.")}const sa=(0,r.forwardRef)(((e,t)=>{let{question:n,phase:a,error:o,onPromptsReady:c,onPromptsStart:s,...u}=e;const[d,{toggle:h}]=(0,jn.Z)(!1),[g,E]=(0,r.useState)(!1),[v,x]=(0,r.useState)(!1),Z=(0,r.useMemo)((()=>{try{if((0,l.nf)(n))return(0,Nn.WU)(n.querySQL,{language:"mysql"});var e;if(function(e){return!!((0,p.IZ)(e)&&(0,l.nf)(e.response)&&(0,l.nf)(e.response.data))&&"string"==typeof e.response.data.message&&"string"==typeof e.response.data.querySQL}(o))return(0,Nn.WU)((null==(e=o.response)?void 0:e.data.querySQL)??"",{language:"mysql"})}catch(t){return(null==n?void 0:n.querySQL)??""}}),[n,o]);(0,r.useEffect)((()=>{(0,l.nf)(n)&&(n.status===i.AnswerGenerating?x(!1):se(n)?x(!se(n)):x(!0))}),[null==n?void 0:n.id]);const w=(0,r.useMemo)((()=>{switch(a){case ee.NONE:return On.pending;case ee.LOADING:case ee.CREATING:case ee.GENERATING_SQL:return On.loading;case ee.GENERATE_SQL_FAILED:case ee.VALIDATE_SQL_FAILED:case ee.LOAD_FAILED:case ee.CREATE_FAILED:return On.error;default:return On.success}}),[a]),S=(0,r.useMemo)((()=>{if("error"===w)return a===ee.GENERATE_SQL_FAILED?"Failed to generate SQL":a===ee.VALIDATE_SQL_FAILED?"Failed to validate SQL":o}),[w,a,o]),A=(0,f.Pd)(),C=(0,m.Z)((()=>{E(!1),x(!0),setTimeout(A((()=>{null==c||c()})),400)})),I=(0,m.Z)((()=>{E(!0),null==s||s()})),k=(0,l.N6)(Z)&&(0,l.X0)(S);return(0,r.useEffect)((()=>{w===On.error&&(0,l.Rw)(null==n?void 0:n.answer)&&x(!0)}),[w,n]),r.createElement(zn,(0,rn.Z)({ref:t},u,{header:r.createElement(ra,{question:n,phase:a,sqlSectionStatus:w,open:d,toggleOpen:h,onMessagesReady:C,onMessagesStart:I}),error:v?S:void 0,errorIn:v&&(0,l.N6)(S),errorMessage:r.createElement(ca,{error:S}),afterErrorBlock:(0,l.C)(Z)&&r.createElement(xn.Z,{language:"sql"},Z),issueTemplate:(null==n?void 0:n.errorType)??void 0}),r.createElement(b.Z,{in:w!==On.loading&&!g,timeout:400},r.createElement(b.Z,{in:d,collapsedSize:52},k&&r.createElement(xn.Z,{language:"sql"},Z),r.createElement(Xn.Z,{in:!d&&k&&w===On.success&&!g,unmountOnExit:!0},r.createElement(y.Z,{position:"absolute",bottom:"-1px",left:"0",width:"100%",height:"1px",boxShadow:"0 0 15px 12px #1c1c1c"})),w===On.loading&&r.createElement(Rt.Z,null))))}));var ua=n(5299),da=n(91693),ma=n(96942),ha=n(45670),ga=n(55050),pa=n(40424),Ea=n(47120),fa=n(89911),va=n(66284);function ya(e){return/date|time|year|month/.test(e)}function ba(e){return"number"==typeof e?e>=1970&&e<2100:ba(Number(e))}function xa(e,t){return e.map((e=>{let n=e[t];return ba(n)&&(n=new Date(String(n))),{...e,[t]:n}}))}function Za(e,t,n){void 0===n&&(n=new Set);return(0,l.YN)(t,(e=>!(0,l.Rw)(e)&&(e instanceof Array?e.length>0&&(0,l.YN)(e,l.GC):(0,l.GC)(e))))?e.filter((e=>(0,l.YN)(t,(e=>t=>"string"==typeof t?(0,l.nf)(e[t]):(0,l.YN)(t,(t=>n.has(t)||(0,l.nf)(e[t]))))(e)))):[]}var wa=n(78462),Sa=n(97212),Aa=n(15663),Ca=n(98619),Ia=n(59334),ka=n(69661);function Ta(e){let{name:t}=e;const n=(0,r.useMemo)((()=>/\[bot]/i.test(t)?"/img/github-bot-icon.svg":`https://github.com/${t}.png`),[t]);return r.createElement(ka.Z,{src:n})}function La(e){let{title:t,data:n,columns:a,fields:o}=e;const i=(0,r.useMemo)((()=>(0,l.uW)(a)?a.map((e=>({name:e}))):(0,l.nf)(o)?o:n.length>0?Object.keys(n[0]).map((e=>({name:e}))):[{name:""}]),[n,a,o]);return r.createElement(Na,null,r.createElement(Ra,{className:"clearTable"},r.createElement("thead",null,(0,l.GC)(t)&&r.createElement("tr",null,r.createElement("th",{colSpan:i.length,align:"center"},t)),r.createElement("tr",null,i.map((e=>{let{name:t}=e;return r.createElement("th",{key:t},t)})))),r.createElement("tbody",null,n.map(((e,t)=>r.createElement("tr",{key:t},i.map((t=>{let{name:n}=t;return r.createElement("td",{key:n},e[n])}))))))))}const Na=(0,x.ZP)("div")`
  overflow: scroll;
`,Ra=(0,x.ZP)("table")`
  font-size: 12px;
  display: table;
  min-width: 100%;
  text-align: center;
`;var Fa=n(66242),Pa=n(44267);const Ma=(0,x.ZP)("span")`
  font-size: 16px;
  opacity: 0.3;
  margin-left: 4px;
`,qa=(0,x.ZP)("table")`
  font-size: 14px;
  margin: auto;
  width: max-content;
`;var Ga=n(74446),Da=n(75559),_a=n(40172);const $a=(0,x.ZP)("div")`
  height: 100%;
`;var Oa=n(6068);function za(){const{question:e}=le(),t=(0,r.useMemo)((()=>(0,l.Rw)(e)?()=>"":Rn(e,c.EMPTY_RESULT)),[e]);return r.createElement(kn,{severity:"info",createIssueUrl:t},r.createElement(at.Z,{variant:"body1"},"Query returned no result."),r.createElement(Ba,null,r.createElement(at.Z,{variant:"body1",component:"li"},'Click "check it out" above to verify the SQL.'),r.createElement(at.Z,{variant:"body1",component:"li"},"Or check out the ",r.createElement(Et.Z,{to:"/explore/"},"popular questions")," for inspiration.")))}const Ba=(0,x.ZP)("ul")`
  padding-left: 0;
  list-style-position: inside;
`;function Ua(e){let{title:t}=e;const{question:n}=le(),a=(0,r.useMemo)((()=>(0,l.Rw)(n)?()=>"":Rn(n,c.VALIDATE_CHART)),[n]);return r.createElement(kn,{severity:"warning",sx:{mb:2},createIssueUrl:a},t)}(0,Oa.y)();const Qa={LineChart:{Chart:function(e){let{chartName:t,title:n,x:a,y:o,data:l}=e;const i=(0,r.useMemo)((()=>{const e=ya(a);l=e?xa(l,a):l;const t=function(e){return"string"==typeof e?{type:"line",datasetId:"raw",name:e,encode:{x:a,y:e},itemStyle:{opacity:0}}:e.map(t)};return{dataset:{id:"raw",source:l},backgroundColor:"rgb(36, 35, 43)",grid:{top:64,left:8,right:8,bottom:8},tooltip:{trigger:"axis"},legend:{left:"center",top:28},series:t(o),title:{text:n},xAxis:{type:e?"time":"category"},yAxis:{type:"value"},animationDuration:2e3}}),[t,n,a,o,l]);return r.createElement(va.Z,{theme:"dark",style:{height:400},opts:{height:400},option:i})},requiredFields:["x","y"],nullableFields:["y"]},BarChart:{Chart:function(e){let{chartName:t,title:n,x:a,y:o,data:l}=e;const{options:i,height:c}=(0,r.useMemo)((()=>{const e=ya(a);l=e?xa(l,a):l;const t=!e,r=function(e){return"string"==typeof e?{type:"bar",name:e,datasetId:"raw",encode:{x:t?e:a,y:t?a:e}}:e.map(r)};return{options:{dataset:{id:"raw",source:l},backgroundColor:"rgb(36, 35, 43)",grid:{top:64,left:8,right:8,bottom:8},tooltip:{},legend:{left:"center",top:28},series:r(o),title:{text:n},[t?"yAxis":"xAxis"]:{type:e?"time":"category",inverse:t},[t?"xAxis":"yAxis"]:{type:"value",position:t?"top":void 0},animationDuration:2e3},height:Math.max(t?40*l.length:400,400)}}),[t,n,a,o,l]);return r.createElement(va.Z,{theme:"dark",style:{height:c},opts:{height:c},option:i})},requiredFields:["x","y"],nullableFields:["y"]},PieChart:{Chart:function(e){let{chartName:t,title:n,value:a,label:o,data:l}=e;const i=(0,r.useMemo)((()=>({backgroundColor:"rgb(36, 35, 43)",dataset:{id:"raw",source:l},grid:{top:64,left:8,right:8,bottom:8},tooltip:{},legend:{left:8,top:8,height:"90%",type:"scroll",orient:"vertical"},series:{type:"pie",top:36,name:o,datasetId:"raw",encode:{itemName:o,value:a}},title:{text:n}})),[t,n,a,o,l]);return r.createElement(va.Z,{theme:"dark",style:{height:400},opts:{height:400},option:i})},requiredFields:["value","label"]},PersonalCard:{Chart:function(e){let{chartName:t,title:n,user_login:a,data:o}=e;return r.createElement(wa.Z,null,o.map(((e,t)=>r.createElement(Sa.ZP,{key:t},r.createElement(Ca.Z,{component:"a",href:`https://github.com/${e[a]}`,target:"_blank"},r.createElement(Aa.Z,null,r.createElement(Ta,{name:e[a]})),r.createElement(Ia.Z,null,e[a]))))))},requiredFields:["user_login"]},RepoCard:{Chart:function(e){let{chartName:t,title:n,repo_name:a,data:o}=e;return r.createElement(wa.Z,null,o.map(((e,t)=>r.createElement(Sa.ZP,{key:t},r.createElement(Ca.Z,{component:"a",href:`https://github.com/${e[a]}`,target:"_blank"},r.createElement(Aa.Z,null,r.createElement(Ta,{name:e[a].split("/")[0]})),r.createElement(Ia.Z,null,e[a]))))))},requiredFields:["repo_name"]},Table:{Chart:La,requiredFields:[]},NumberCard:{Chart:function(e){let{chartName:t,title:n,label:a,value:o,data:i,columns:c,fields:s}=e;const u=(0,r.useMemo)((()=>(0,l.uW)(c)?c.map((e=>({name:e}))):(0,l.nf)(s)?s:i.length>0?Object.keys(i[0]).map((e=>({name:e}))):[{name:""}]),[i,c,s]),d=(0,r.useMemo)((()=>{var e;return(0,l.GC)(a)?a:(null==s||null==(e=s.find((e=>/repo.*(id|name)|user.*(?:id|login|name)/.test(e.name)&&e.name!==o)))?void 0:e.name)??""}),[u,a]);if(1===i.length){const e=i[0][d]??n;if("string"==typeof o){const t=i[0][o];return r.createElement(Fa.Z,null,r.createElement(Pa.Z,{sx:{textAlign:"center",fontSize:36}},r.createElement(at.Z,{sx:{opacity:.4},fontSize:22,mt:2,mb:0,color:"text.secondary",gutterBottom:!0,align:"center"},e),(0,l.z0)(t)?r.createElement(Ge.Z,{value:i[0][o],hasComma:!0,duration:800,size:36}):String(t),r.createElement(Ma,null,o)))}if(o instanceof Array)return r.createElement(Fa.Z,null,r.createElement(Pa.Z,{sx:{textAlign:"center",fontSize:36}},r.createElement(at.Z,{sx:{opacity:.4},fontSize:22,mt:2,mb:0,color:"text.secondary",gutterBottom:!0,align:"center"},e),r.createElement(qa,{className:"clearTable"},r.createElement("tbody",null,o.map((e=>r.createElement("tr",{key:e},r.createElement("td",null,e),r.createElement("td",null,(0,l.z0)(i[0][e])?r.createElement(Ge.Z,{value:i[0][e],hasComma:!0,duration:800,size:16}):String(i[0][e])))))))))}return(0,l.N6)(d)?r.createElement(r.Fragment,null,r.createElement(at.Z,{variant:"h4"},n),r.createElement(Nt.ZP,{container:!0,spacing:1,mt:1},i.map(((e,t)=>r.createElement(Nt.ZP,{key:t,item:!0,xs:12,sm:4,md:3,lg:2},r.createElement(Fa.Z,{sx:{p:2}},r.createElement(at.Z,{variant:"subtitle1"},e[d]),r.createElement(at.Z,{variant:"body2",color:"#7c7c7c"},e[o]))))))):r.createElement(wa.Z,null,i.map(((e,t)=>r.createElement(Sa.ZP,{key:t},r.createElement(Fa.Z,{sx:{p:4}},r.createElement(Ia.Z,{primary:n,secondary:`${e[o]}`}))))))},requiredFields:["value"],optionalFields:["label"]},MapChart:{Chart:function(e){let{chartName:t,title:n,country_code:a,value:o,data:i}=e;const[c,s]=(0,r.useState)(null),u=(0,r.useRef)(null),d=(0,r.useMemo)((()=>function(e,t,n){return e.map((e=>{const a=(0,Ga.$)(e[t]),{long:r,lat:o}=(0,Ga.b)(e[t])??{};return[a,r,o,e[n]]})).filter((e=>{let[t]=e;return(0,l.GC)(t)})).sort(((e,t)=>Math.sign(t[3]-e[3])))}(i,a,o)),[i,a,o]),m=(0,r.useMemo)((()=>{var e,t;const a=(null==(e=d[0])?void 0:e[3])??0;return{backgroundColor:"rgb(36, 35, 43)",geo:(0,Da.Mm)(),dataset:[{id:"top1",source:d.slice(0,1)},{id:"rest",source:d.slice(1)}],title:{text:n},legend:{show:!0,left:8,top:24,orient:"vertical"},series:[{type:"effectScatter",datasetId:"top1",coordinateSystem:"geo",name:`Top 1 (${null==(t=d[0])?void 0:t[0]})`,encode:{lng:1,lat:2,value:3,itemId:0},symbolSize:e=>1+64*Math.sqrt(e[3]/a)},{type:"scatter",datasetId:"rest",coordinateSystem:"geo",name:"Rest",encode:{lng:1,lat:2,value:3,itemId:0},symbolSize:e=>1+64*Math.sqrt(e[3]/a)}],tooltip:{formatter:e=>`<b>${o}</b><br/>${e.marker} <b>${e.value[0]}</b> ${e.value[3]}`},animationDuration:2e3}}),[t,n,o,d]);return(0,r.useEffect)((()=>{if((0,l.Rw)(c))return;const e=new ResizeObserver((e=>{var t,n;let[a]=e;null==(t=u.current)||null==(n=t.getEchartsInstance())||n.resize({height:a.contentRect.height})}));return e.observe(c),()=>{e.disconnect()}}),[c]),r.createElement(_a.ZP,{ratio:4/3,style:{maxWidth:600,margin:"auto"}},r.createElement($a,{ref:s},r.createElement(va.Z,{theme:"dark",opts:{height:(null==c?void 0:c.clientHeight)??"auto"},option:m,ref:u})))},requiredFields:["country_code","value"]}};function Ha(e){let{onPrepared:t,onExit:n,...a}=e;const{config:o,fields:i,nullableFields:c}=(0,r.useMemo)((()=>{const e=Qa[a.chartName],t=((null==e?void 0:e.requiredFields)??[]).map((e=>a[e])),n=((null==e?void 0:e.nullableFields)??[]).map((e=>a[e]));return{config:e,fields:t,nullableFields:new Set([].concat(...n))}}),[(0,Bt.wE)(a)]),s=Za(a.data,i,c);let u,d;return(0,l.Rw)(o)&&(u=r.createElement(Ua,{title:`AI has generated an unknown chart type '${a.chartName}'`})),0===a.data.length?u=r.createElement(za,null):s.length>0?(0,l.nf)(o)&&(d=(0,r.createElement)(o.Chart,{...a,data:s})):u=r.createElement(Ua,{title:r.createElement(r.Fragment,null,"Oh no, visualization didn't work.",r.createElement("br",null),"You can still check your results using the table.")}),(0,r.useEffect)((()=>(0!==a.data.length&&0===s.length?null==t||t(!0):null==t||t(!1),()=>{null==n||n()})),[s.length,a.data.length,t,n]),r.createElement(r.Fragment,null,u,d)}var Va=n(4316),Wa=n(95764),Ka=n(85753),Ya=n(98628),ja=n(4882);function Xa(e){let{sx:t}=e;const{question:n}=le(),{setAsyncData:a}=(0,ja.P)(void 0),i=(0,v.Gb)(),{isAuthenticated:c}=(0,Je.D3)(),{data:d,mutate:m}=(0,Bt.ZP)(c&&(0,l.nf)(n)?[n.id,"question-feedback"]:void 0,{fetcher:async e=>await i("explorer-feedback-button").then((async t=>await async function(e,t){return await o.po.get(`/explorer/questions/${e}/feedback`,{oToken:t})}(e,t))).then((e=>(0,l.uW)(e)?Boolean(e[0].satisfied):void 0)),errorRetryCount:0}),h=(0,N.Z)((()=>{(0,l.Rw)(n)||a(!0===d?i("explorer-feedback-button").then((async e=>await u(n.id,!0,e).finally((()=>{m(void 0)})))):i("explorer-feedback-button").then((async e=>await s(n.id,{satisfied:!0},e).finally((()=>{m(!0)})))))})),g=(0,N.Z)((()=>{(0,l.Rw)(n)||a(!1===d?i("explorer-feedback-button").then((async e=>await u(n.id,!1,e).finally((()=>{m(void 0)})))):i("explorer-feedback-button").then((async e=>await s(n.id,{satisfied:!1},e).finally((()=>{m(!1)})))))}));return r.createElement(Ke.Z,{sx:t,direction:"row",spacing:2},r.createElement(T.Z,{onClick:h,color:!0===d?"primary":void 0,size:"small"},!0===d?r.createElement(Ka.Z,{color:"primary",fontSize:"inherit"}):r.createElement(Ya.Z,{fontSize:"inherit"})),r.createElement(T.Z,{onClick:g,color:!1===d?"primary":void 0,size:"small"},!1===d?r.createElement(Va.Z,{color:"primary",fontSize:"inherit"}):r.createElement(Wa.Z,{fontSize:"inherit"})))}var Ja=n(36804),er=n(34386);function tr(e){let{children:t}=e;return r.createElement(er.Z,{title:r.createElement(y.Z,{p:1,fontSize:14},t)},r.createElement(T.Z,null,r.createElement(Ja.Z,{fontSize:"inherit"})))}var nr=n(89747),ar=n(76743);const rr=(0,x.ZP)("span")`
  position: relative;
  display: block;
`,or=(0,x.ZP)("span")`
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
`;function lr(){const{question:e}=le();return"error"!==(null==e?void 0:e.status)&&"cancel"!==(null==e?void 0:e.status)?r.createElement(r.Fragment,null):e.errorType===c.QUERY_TIMEOUT?r.createElement(at.Z,{variant:"body1"},"Whoops! Query timed out. SQL may be too complex or incorrect.",r.createElement("br",null),"Optimize your question for effective SQL, or get ideas from ",r.createElement(Et.Z,{to:"/explore/"},"popular questions"),"."):r.createElement(at.Z,{variant:"body1"},"Oops, something wrong with the SQL query. SQL may be too complex or incorrect.",r.createElement("br",null),"Optimize your question for effective SQL, or get ideas from ",r.createElement(Et.Z,{to:"/explore/"},"popular questions"),".")}var ir=n(50657),cr=n(40044),sr=n(73313);function ur(e){let{question:t,open:n,onOpenChange:a}=e;const[o,l]=(0,r.useState)("plan"),i=(0,N.Z)((()=>{null==a||a(!1)})),c=(0,N.Z)(((e,t)=>{l("plan"===t?"plan":"sql")})),s=(0,r.useMemo)((()=>{try{return(0,Nn.WU)((null==t?void 0:t.querySQL)??"",{language:"mysql"})}catch{return(null==t?void 0:t.querySQL)??""}}),[null==t?void 0:t.querySQL]);return r.createElement(ir.Z,{open:n,onClose:i,maxWidth:"xl",fullWidth:!0},r.createElement(sr.Z,{onChange:c,value:o,sx:{mb:2}},r.createElement(cr.Z,{label:"Execution Plan",value:"plan"}),r.createElement(cr.Z,{label:"SQL",value:"sql"})),r.createElement(y.Z,{px:2},(()=>{if("plan"===o){var e;const n=["id","estRows","task","access object","operator info"];return r.createElement(y.Z,{sx:{overflowX:"scroll",color:"rgb(248, 248, 242)",backgroundColor:"rgb(40, 42, 54)",borderRadius:2,py:2},mb:2},r.createElement(y.Z,{display:"table",fontFamily:"monospace",fontSize:16,lineHeight:1,sx:{borderSpacing:"16px 0"}},r.createElement(y.Z,{display:"table-header-group"},r.createElement(y.Z,{display:"table-row"},n.map((e=>r.createElement(y.Z,{key:e,display:"table-cell"},e))))),r.createElement(y.Z,{display:"table-footer-group"},null==t||null==(e=t.plan)?void 0:e.map(((e,t)=>r.createElement(y.Z,{key:t,display:"table-row"},n.map((t=>r.createElement(y.Z,{key:t,display:"table-cell",whiteSpace:"pre"},e[t])))))))))}return r.createElement(xn.Z,{className:"language-sql"},s)})()))}function dr(e){let{question:t,children:n}=e;const[a,o]=(0,r.useState)(!1),l=(0,N.Z)((()=>{o(!0)}));return r.createElement(r.Fragment,null,r.createElement(Jn.Z,{variant:"text",size:"small",sx:{ml:1},onClick:l},n),r.createElement(ur,{open:a,onOpenChange:o,question:t}))}(0,x.ZP)(Fa.Z)`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.25) 0%, rgba(200, 182, 252, 0.05) 96.73%);
  border: 0;
  margin-bottom: 16px;
`,(0,x.ZP)("span")`
  display: inline-block;
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;
  width: 24px;
  height: 24px;
`,(0,x.ZP)("span")`
  margin-left: 12px;
`;var mr=n(49282),hr=n(88075),gr=n(40839),pr=n(49185),Er=n(68258),fr=n(1969);function vr(e){let{url:t,title:n,summary:a,hashtags:o}=e;const l=(0,m.Z)((e=>{window.open(e,"_blank")}));return r.createElement(xr,null,r.createElement(mr.Z,{ariaLabel:"share",sx:{display:"inline-block",position:"absolute",right:0,top:0,[`.${gr.Z.actions}`]:{width:64,display:"flex",flexDirection:"column",alignItems:"flex-end"}},icon:r.createElement("span",null,"Share",r.createElement(pr.Z,{fontSize:"inherit"})),FabProps:yr},r.createElement(hr.Z,{sx:{overflow:"hidden"},icon:r.createElement(Er.Zm,null),FabProps:br,onClick:(0,N.Z)((()=>l((0,fr.PE)(t,{title:n,hashtags:o}))))}),r.createElement(hr.Z,{sx:{overflow:"hidden"},icon:r.createElement(Er.pA,null),FabProps:br,onClick:(0,N.Z)((()=>l((0,fr.BE)(t,{title:n,summary:a}))))}),r.createElement(hr.Z,{sx:{overflow:"hidden"},icon:r.createElement(Er.MP,null),FabProps:br,onClick:(0,N.Z)((()=>l((0,fr.$Z)(t,{title:n}))))}),r.createElement(hr.Z,{sx:{overflow:"hidden"},icon:r.createElement(Er.YG,null),FabProps:br,onClick:(0,N.Z)((()=>l((0,fr.OA)(t,{title:n}))))})))}const yr={color:"inherit",disableRipple:!0,sx:{fontFamily:"var(--ifm-heading-font-family)",textTransform:"unset",fontSize:16,fontWeight:"normal",width:68,height:32,minHeight:32,background:"none",boxShadow:"none !important",pr:.5,"> span":{display:"inline-flex",gap:.5,alignItems:"center"},"&:hover, &:active":{background:"none"}}},br={sx:{width:32,height:32,minHeight:32,borderRadius:16,mx:0,overflow:"hidden"}},xr=(0,x.ZP)("div")`
  display: inline-block;
  position: relative;
  width: 64px;
  height: 32px;
  line-height: 32px;
`,Zr=(0,r.forwardRef)(((e,t)=>{var n,a,o;let{question:i,phase:c,error:s,...u}=e;const{search:d}=(0,r.useContext)(de),[m,h]=(0,r.useState)(null),g=null==i||null==(n=i.result)?void 0:n.rows,p=(0,r.useMemo)((()=>{switch(c){case ee.CREATED:case ee.QUEUEING:case ee.EXECUTING:return On.loading;case ee.EXECUTE_FAILED:case ee.VISUALIZE_FAILED:case ee.UNKNOWN_ERROR:return On.error;case ee.READY:case ee.SUMMARIZING:return On.success;default:return On.pending}}),[c]),E=(0,r.useMemo)((()=>{var e;switch(c){case ee.CREATED:return"Pending...";case ee.QUEUEING:return`${(null==i?void 0:i.queuePreceding)??NaN} requests ahead`;case ee.EXECUTING:return"Running SQL...";case ee.EXECUTE_FAILED:return"cancel"===(null==i?void 0:i.status)?"Execution canceled":"Failed to execute SQL";case ee.UNKNOWN_ERROR:return"Unknown error";case ee.VISUALIZE_FAILED:case ee.READY:case ee.SUMMARIZING:return r.createElement(r.Fragment,null,`${(null==i||null==(e=i.result)?void 0:e.rows.length)??"NaN"} rows in ${(null==i?void 0:i.spent)??"NaN"} seconds`,function(e){if((0,l.nf)(e)&&!(0,l.yD)(e.engines))return r.createElement(r.Fragment,null,". Running on\xa0",r.createElement(Cr,null,r.createElement(Sr,{src:"/img/tidb-cloud-logo-o.png",alt:"TiDB"}),e.engines.map(Ar).join(", ")),r.createElement(tr,null,"TiDB's optimizer selects the engine for all queries on its single service:",r.createElement("ul",null,r.createElement("li",null,r.createElement(Et.Z,{href:"https://docs.pingcap.com/tidb/stable/tiflash-overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301",target:"_blank",rel:"noopener"}," The columnar engine "),"for complex and heavy OLAP queries."),r.createElement("li",null,r.createElement(Et.Z,{href:"https://docs.pingcap.com/tidb/stable/tikv-overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301",target:"_blank",rel:"noopener"}," The row-based engine "),"for low-latency high-concurrency OLTP queries."))));return null}(i),function(e){if((0,l.nf)(e)&&!(0,l.yD)(e.plan))return r.createElement(dr,{question:e},"Explain SQL ",r.createElement(ua.Z,null))}(i));default:return"pending"}}),[i,c]),{url:f,title:v,hashtags:b}=(0,r.useMemo)((()=>{var e;if((0,l.Rw)(i))return{url:"https://ossinsight.io/explore/",title:"GitHub Data Explorer",hashtags:[]};let t;const n=`${d} | OSSInsight GitHub Data Explorer`,a=function(){const e=new Set,t=[];for(var n=arguments.length,a=new Array(n),r=0;r<n;r++)a[r]=arguments[r];return a.forEach((n=>{for(const a of n)e.has(a)||(e.add(a),t.push(a))})),t}((null==(e=i.answerSummary)?void 0:e.hashtags)??[],["OpenSource","OpenAI","TiDBCloud"]);return t=(0,l.GC)(i.id)?`https://ossinsight.io/explore?id=${i.id}`:"https://ossinsight.io/explore/",{url:t,title:n,hashtags:a}}),[i,d]),x=(0,r.useMemo)((()=>{if("error"===p)return s}),[p,s]),Z=(0,r.useMemo)((()=>{if(c===ee.VISUALIZE_FAILED)return s}),[c,s]);(0,r.useMemo)((()=>(0,l.nf)(i)&&(0,l.nf)(i.answerSummary)?(0,l.uW)(i.answerSummary.hashtags)?`${i.answerSummary.content}\n${i.answerSummary.hashtags.map((e=>`#${e}`)).join(" ")}`:i.answerSummary.content:""),[null==i?void 0:i.answerSummary]);return(0,l.Rw)(i)?r.createElement("section",{ref:t,hidden:!0}):r.createElement(zn,(0,rn.Z)({ref:t},u,{header:r.createElement(Ke.Z,{direction:"row",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap"},r.createElement("span",null,r.createElement(Kn,{status:p}),E),p!==On.error&&r.createElement(Fr,null,r.createElement("span",{ref:h}),r.createElement(vr,{url:f,title:v,summary:null==i||null==(a=i.answerSummary)?void 0:a.content,hashtags:b}))),error:x,errorIn:(0,l.N6)(x),errorMessage:r.createElement(lr,null),issueTemplate:(null==i?void 0:i.errorType)??void 0}),false,c===ee.QUEUEING&&r.createElement(Nr,{source:0===(null==i?void 0:i.queuePreceding)?Tr:kr,interval:5e3}),c===ee.EXECUTING&&r.createElement(Nr,{source:Lr,interval:3e3}),r.createElement(Ir,{question:i,chartData:(null==i?void 0:i.chart)??void 0,chartError:Z,result:g,fields:null==i||null==(o=i.result)?void 0:o.fields,controlsContainer:m}),r.createElement(y.Z,{height:"16px"}))})),wr=Zr,Sr=(0,x.ZP)("img")`
  height: 18px;
  vertical-align: text-bottom;
  margin-right: 4px;
`;function Ar(e){switch(e){case"tiflash":return"columnar storage";case"tikv":return"row storage";default:return e}}const Cr=(0,x.ZP)("span")`
  color: #B0B8FF;
`;function Ir(e){let{question:t,chartData:n,chartError:a,fields:o,result:i,controlsContainer:c}=e;const[s,u]=(0,r.useState)("visualization"),d=(0,r.useRef)("visualization");(0,r.useEffect)((()=>{u(d.current)}),[n]);const m=(e,t)=>{(0,l.GC)(t)&&u(t)},h=(0,N.Z)((e=>{d.current=e?"raw":"visualization"})),g=(0,N.Z)((()=>{d.current="visualization"}));return(0,r.useMemo)((()=>{const e=function(e,t){return void 0===e&&(e=!1),void 0===t&&(t=!1),r.createElement($n,{severity:"warning",sx:e?{mb:2}:void 0},r.createElement(at.Z,{variant:"body1"},"Oh no, visualization didn't work.",r.createElement("br",null),"You can still check your results using the table."))};if((0,l.Rw)(t))return null;const u=Rn(t);if((0,l.Rw)(i))return(0,l.nf)(a)?e(!1,!0):null;const d=()=>r.createElement(r.Fragment,null,r.createElement(Ke.Z,{direction:"row",justifyContent:"center",alignItems:"center",flexWrap:"wrap",spacing:.5,py:1,mt:2,fontSize:"inherit",bgcolor:"#323140"},r.createElement(at.Z,{variant:"body1",mr:2},"Do you like the result?"),r.createElement(Xa,null)),r.createElement(jt.Z,{sx:{my:2}}),r.createElement(at.Z,{component:"div",variant:"body2",color:"#D1D1D1"},"\ud83e\udd14 Not exactly what you're looking for? Check out our ",r.createElement(ia,{anchor:"data-explorer-faq"},"FAQ")," for help. If the problem persists, please ",r.createElement(Et.Z,{href:u(),target:"_blank",rel:"noopener"},"report an issue")," to us.")),p=()=>r.createElement(r.Fragment,null,r.createElement(Mr,null,r.createElement(La,{chartName:"Table",title:"",data:i,fields:o})),d());if((0,l.Rw)(n))return(0,l.nf)(a)?r.createElement(r.Fragment,null,e(!0),p()):null;const E=()=>r.createElement(r.Fragment,null,r.createElement(Mr,null,r.createElement(Ha,(0,rn.Z)({},n,{data:i,fields:o,onPrepared:h,onExit:g}))),d());return(0,l.nf)(a)?r.createElement(r.Fragment,null,e(!0),p()):"Table"===n.chartName?E():r.createElement(r.Fragment,null,r.createElement(pa.Z,{container:c},r.createElement(Rr,{className:"chart-controls"},r.createElement(fa.Z,{size:"small",value:s,onChange:m,exclusive:!0,color:"primary"},r.createElement(Ea.Z,{value:"visualization",size:"small",sx:{padding:"5px"}},r.createElement(da.Z,{fontSize:"small"})),r.createElement(Ea.Z,{value:"raw",size:"small",sx:{padding:"5px"}},r.createElement(ma.Z,{fontSize:"small"}))))),r.createElement(ha.ZP,{value:s},r.createElement(Pr,{value:"visualization"},E()),r.createElement(Pr,{value:"raw"},p())))}),[s,n,a,i,o,c])}const kr=["So many people are just as curious as you are.","Do you know how many types of events on GitHub? - 17 types!","GitHub generates over 4 million new events each day. We synchronize with them in real time and insert updates in milliseconds.","In 2022, 95% of the top 20 most active developers on GitHub are bots.","Python has been the most used back-end programming language for years on GitHub."],Tr=["Almost there! Can't wait to see your result!"],Lr=[r.createElement(r.Fragment,null,"Querying ",r.createElement("b",null,"5+ billion")," rows of GitHub data..."),r.createElement(r.Fragment,null,"We stay in sync with GitHub event data for ",r.createElement("b",null,"real-time")," insights!"),r.createElement(r.Fragment,null,"We can handle ",r.createElement("b",null,"complex queries")," with a powerful database, even those generated by AI."),r.createElement(r.Fragment,null,r.createElement("b",null,"\ud83d\udc40 Tips"),": Click ",r.createElement("b",null,"Show")," in the upper right corner to check the SQL query generated by AI.")],Nr=(0,x.ZP)((e=>{let{source:t,interval:n,prefix:a=r.createElement(A,{animated:!1}),...o}=e;const[l,i]=(0,r.useState)(0);return(0,ea.Z)((()=>{i((e=>(e+1)%t.length))}),n),r.createElement(nr.Z,(0,rn.Z)({component:rr},o),a??void 0,r.createElement(ar.Z,{key:l,timeout:400,classNames:"item"},r.createElement(or,null,t[l])))}))`
  min-height: 42px;
  min-width: 1px;
`,Rr=(0,x.ZP)("div")`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0;
  transition: opacity .2s ease;
  margin-right: 12px;
  padding-right: 12px;
  border-right: 1px solid #3c3c3c;
`,Fr=(0,x.ZP)("span")`
  display: inline-flex;
  align-items: center;
`,Pr=(0,x.ZP)(ga.Z)`
  padding: 0;
`,Mr=(0,x.ZP)("div")`
  position: relative;
`;var qr=n(45989);const Gr=[["#FFBCA7",2.21],["#DAA3D8",30.93],["#B587FF",67.95],["#6B7AFF",103.3]],Dr=e=>{let{size:t,sx:a}=e;return r.createElement(r.Fragment,null,r.createElement(bt,{as:$r,sx:a,stops:Gr,deg:90,content:"result_bottom"},r.createElement(_r,null,"Try other dataset"),r.createElement(Or,null,r.createElement(zr,null,r.createElement(nn,null)),"Import NOW!"),r.createElement(Br,{width:"304",src:n(74040).Z,alt:"image"}),r.createElement(Ur,null),r.createElement(Hr,null,"Chat2Query on",r.createElement(Qr,{src:"/img/tidb-cloud-logo-o.png",alt:"TiDB Cloud Logo"}))))},_r=(0,x.ZP)("div")`
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  line-height: 150.02%;
  color: #FFFFFF;
`,$r=(0,x.ZP)(un)`
  opacity: 1;
  cursor: pointer;
  user-select: none;
  transition: ${e=>{let{theme:t}=e;return t.transitions.create(["box-shadow","transform"])}};

  &:hover {
    box-shadow: ${e=>{let{theme:t}=e;return t.shadows[10]}};
    transform: scale3d(1.02, 1.02, 1.02);
  }

  .${sn.container} {
    height: 100%;
  }

  .${sn.content} {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;
  }
`,Or=(0,x.ZP)("span")`
  background: linear-gradient(90deg, #5667FF 0%, #A168FF 106.06%);
  box-shadow: ${e=>{let{theme:t}=e;return t.shadows[4]}};
  border-radius: 48px;
  display: flex;
  align-items: center;
  color: white !important;
  text-decoration: none !important;
  margin-top: 8px;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 150.02%;
  padding: 12px 48px 12px 12px;
`,zr=(0,x.ZP)("span")`
  display: inline-flex;
  width: 42px;
  height: 42px;
  border-radius: 21px;
  align-items: center;
  justify-content: center;
  background: white;
  color: #5667FF;
  min-width: 32px;
  font-size: 26px;
  margin-right: 32px;
`,Br=(0,x.ZP)("img")`
  max-width: 100%;
`,Ur=(0,x.ZP)("span")`
  display: block;
  flex: 1;
`,Qr=(0,x.ZP)("img")`
  height: 24px;
  margin: 0 8px;
  vertical-align: text-bottom;
`,Hr=(0,x.ZP)("div")`
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 180%;
  /* or 29px */
  color: #FFFFFF;
  margin-top: 12px;
  vertical-align: middle;
`;var Vr,Wr,Kr,Yr,jr,Xr,Jr,eo,to,no,ao,ro,oo,lo,io,co,so,uo,mo,ho,go,po;function Eo(){return Eo=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},Eo.apply(this,arguments)}const fo=e=>{let{title:t,titleId:n,...a}=e;return r.createElement("svg",Eo({width:392,height:228,viewBox:"0 0 392 228",fill:"none",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-labelledby":n},a),t?r.createElement("title",{id:n},t):null,Vr||(Vr=r.createElement("path",{d:"M158 0c-1.445 0-2.875.278-4.21.82a11.018 11.018 0 0 0-3.568 2.332A10.643 10.643 0 0 0 147 10.76c0 4.756 3.157 8.791 7.524 10.222.55.086.726-.247.726-.538v-1.818c-3.047.645-3.696-1.442-3.696-1.442-.506-1.248-1.221-1.582-1.221-1.582-1.001-.667.077-.646.077-.646 1.1.076 1.683 1.109 1.683 1.109.957 1.635 2.574 1.151 3.201.893.099-.7.385-1.173.693-1.442-2.442-.27-5.005-1.194-5.005-5.294 0-1.195.418-2.152 1.133-2.917-.11-.269-.495-1.388.11-2.84 0 0 .924-.29 3.025 1.097a10.581 10.581 0 0 1 2.75-.355c.935 0 1.881.119 2.75.355 2.101-1.388 3.025-1.097 3.025-1.097.605 1.452.22 2.571.11 2.84.715.765 1.133 1.722 1.133 2.917 0 4.11-2.574 5.014-5.027 5.283.396.334.759.99.759 1.99v2.95c0 .29.176.634.737.537 4.367-1.442 7.513-5.466 7.513-10.222 0-1.413-.285-2.813-.837-4.118a10.744 10.744 0 0 0-2.385-3.491A11.018 11.018 0 0 0 162.21.819 11.215 11.215 0 0 0 158 0Z",fill:"#fff"})),Wr||(Wr=r.createElement("path",{d:"M29.666 104.818h1.541v6.697c0 .713-.167 1.344-.502 1.894a3.51 3.51 0 0 1-1.412 1.293c-.606.311-1.317.467-2.133.467-.811 0-1.52-.156-2.127-.467a3.51 3.51 0 0 1-1.412-1.293c-.335-.55-.502-1.181-.502-1.894v-6.697h1.536v6.573c0 .46.1.87.303 1.228.206.358.496.639.87.845.375.202.819.303 1.332.303.518 0 .963-.101 1.338-.303.378-.206.666-.487.865-.845.202-.358.303-.768.303-1.228v-6.573Zm9.378 4.41-1.347.239a1.597 1.597 0 0 0-.269-.493 1.33 1.33 0 0 0-.487-.382c-.206-.1-.463-.15-.77-.15-.422 0-.773.095-1.055.284-.281.185-.422.426-.422.721 0 .255.094.46.283.616.189.156.494.284.915.383l1.213.278c.703.163 1.226.413 1.571.751s.517.777.517 1.318c0 .457-.133.865-.398 1.223-.262.354-.628.633-1.098.835-.468.202-1.01.303-1.626.303-.855 0-1.553-.182-2.093-.547-.54-.368-.872-.89-.995-1.566l1.437-.219c.09.375.274.658.552.851.279.189.642.283 1.089.283.487 0 .877-.101 1.168-.303.292-.206.438-.456.438-.751a.782.782 0 0 0-.269-.602c-.175-.162-.446-.285-.81-.367l-1.293-.284c-.712-.162-1.24-.421-1.58-.775-.339-.355-.508-.804-.508-1.348 0-.45.126-.845.378-1.183.252-.338.6-.602 1.044-.79.444-.193.953-.289 1.526-.289.826 0 1.475.179 1.95.537.473.355.786.83.939 1.427Zm5.075 5.926c-.753 0-1.4-.161-1.944-.482a3.276 3.276 0 0 1-1.253-1.367c-.292-.59-.438-1.281-.438-2.073 0-.783.146-1.472.438-2.069a3.402 3.402 0 0 1 1.233-1.397c.53-.334 1.15-.502 1.86-.502.43 0 .848.071 1.252.214a3.04 3.04 0 0 1 1.089.671c.321.305.575.701.76 1.188.186.484.279 1.073.279 1.765v.527h-6.07v-1.113h4.613c0-.391-.08-.738-.238-1.039a1.8 1.8 0 0 0-.672-.721 1.873 1.873 0 0 0-1.004-.264c-.418 0-.782.103-1.094.308a2.077 2.077 0 0 0-.715.796 2.298 2.298 0 0 0-.25 1.059v.87c0 .51.09.944.27 1.302.182.358.435.632.76.821.325.185.704.278 1.139.278.281 0 .538-.04.77-.119a1.594 1.594 0 0 0 .99-.97l1.406.254a2.553 2.553 0 0 1-.606 1.089 2.951 2.951 0 0 1-1.089.721c-.434.169-.93.253-1.486.253Zm4.925-.154v-7.636h1.437v1.213h.08a1.85 1.85 0 0 1 .735-.97 2.11 2.11 0 0 1 1.203-.358 7.163 7.163 0 0 1 .632.035v1.422a2.588 2.588 0 0 0-.318-.055 3.063 3.063 0 0 0-.458-.035c-.351 0-.664.075-.94.224a1.663 1.663 0 0 0-.884 1.497V115h-1.487Zm11.096-5.772-1.348.239a1.597 1.597 0 0 0-.268-.493 1.33 1.33 0 0 0-.487-.382c-.206-.1-.463-.15-.771-.15-.42 0-.772.095-1.054.284-.282.185-.423.426-.423.721 0 .255.095.46.284.616.189.156.494.284.915.383l1.213.278c.702.163 1.226.413 1.57.751.345.338.518.777.518 1.318 0 .457-.133.865-.398 1.223-.262.354-.628.633-1.099.835-.467.202-1.009.303-1.626.303-.855 0-1.552-.182-2.092-.547-.54-.368-.872-.89-.995-1.566l1.437-.219c.09.375.273.658.552.851.278.189.641.283 1.089.283.487 0 .876-.101 1.168-.303.292-.206.437-.456.437-.751a.782.782 0 0 0-.268-.602c-.176-.162-.446-.285-.81-.367l-1.293-.284c-.713-.162-1.24-.421-1.581-.775-.338-.355-.507-.804-.507-1.348 0-.45.126-.845.378-1.183.252-.338.6-.602 1.044-.79.444-.193.953-.289 1.526-.289.825 0 1.475.179 1.949.537.474.355.787.83.94 1.427Z",fill:"#D1D1D1"})),Kr||(Kr=r.createElement("g",{clipPath:"url(#a)",fill:"#fff"},r.createElement("path",{d:"M185.978 9.418h-4.79a.22.22 0 0 0-.223.217v2.28c0 .12.099.218.223.218h1.869v2.832s-.42.139-1.58.139c-1.369 0-3.28-.487-3.28-4.577s1.991-4.629 3.86-4.629c1.617 0 2.315.277 2.758.411.139.042.267-.094.267-.214l.535-2.202a.197.197 0 0 0-.085-.17C185.351 3.6 184.253 3 181.477 3 178.281 2.998 175 4.323 175 10.686c0 6.362 3.755 7.31 6.92 7.31 2.621 0 4.21-1.09 4.21-1.09.065-.035.073-.124.073-.164V9.637a.22.22 0 0 0-.223-.217l-.002-.002ZM210.663 3.762a.219.219 0 0 0-.221-.219h-2.697a.221.221 0 0 0-.223.219v5.07h-4.203v-5.07a.22.22 0 0 0-.223-.219h-2.697a.22.22 0 0 0-.223.219v13.732c0 .122.099.22.223.22h2.697a.222.222 0 0 0 .223-.22V11.62h4.203l-.008 5.873c0 .121.1.22.223.22h2.703a.222.222 0 0 0 .223-.22V3.762ZM191.068 5.56c0-.945-.778-1.708-1.739-1.708-.961 0-1.739.763-1.739 1.709 0 .945.778 1.71 1.739 1.71.961 0 1.739-.766 1.739-1.71ZM190.875 14.594v-6.34c0-.12-.1-.219-.224-.219h-2.688c-.124 0-.234.123-.234.245v9.082c0 .267.17.347.392.347h2.423c.266 0 .331-.127.331-.351v-2.764ZM220.913 8.06h-2.676a.222.222 0 0 0-.223.22v6.734s-.68.484-1.644.484c-.964 0-1.222-.427-1.222-1.346V8.279a.221.221 0 0 0-.223-.22h-2.716a.223.223 0 0 0-.223.22v6.316c0 2.73 1.564 3.399 3.716 3.399 1.765 0 3.189-.949 3.189-.949s.068.5.098.56c.03.058.111.118.196.118l1.728-.008a.223.223 0 0 0 .224-.218V8.279a.223.223 0 0 0-.225-.22l.001.001ZM228.229 7.751c-1.521 0-2.555.661-2.555.661v-4.65a.22.22 0 0 0-.223-.219h-2.704a.222.222 0 0 0-.224.219v13.732c0 .122.1.22.224.22h1.876c.084 0 .149-.043.197-.116.046-.074.114-.633.114-.633s1.106 1.019 3.2 1.019c2.457 0 3.867-1.213 3.867-5.447 0-4.233-2.252-4.786-3.772-4.786Zm-1.056 7.737c-.929-.028-1.557-.438-1.557-.438v-4.348s.62-.371 1.383-.437c.964-.085 1.893.198 1.893 2.436 0 2.359-.42 2.824-1.717 2.787h-.002ZM198.626 8.038h-2.023l-.003-2.601c0-.099-.052-.148-.169-.148h-2.757c-.108 0-.165.046-.165.146v2.687s-1.381.325-1.475.352a.218.218 0 0 0-.161.209v1.69c0 .12.1.218.223.218h1.413v4.062c0 3.018 2.176 3.314 3.643 3.314.671 0 1.474-.21 1.607-.257.08-.03.126-.11.126-.197v-1.857a.22.22 0 0 0-.221-.22c-.119 0-.42.047-.73.047-.994 0-1.331-.45-1.331-1.032v-3.86h2.023a.221.221 0 0 0 .223-.219V8.256a.22.22 0 0 0-.223-.218Z"}))),Yr||(Yr=r.createElement("path",{d:"M310.119 115v-10.182h3.629c.789 0 1.443.136 1.964.408.523.272.914.648 1.173 1.128.258.478.388 1.03.388 1.656 0 .623-.131 1.172-.393 1.646-.259.47-.65.836-1.173 1.098-.521.262-1.175.393-1.964.393h-2.749v-1.322h2.61c.497 0 .901-.072 1.213-.214.315-.143.545-.35.691-.622.146-.271.219-.598.219-.979 0-.385-.075-.718-.224-.999a1.444 1.444 0 0 0-.691-.647c-.312-.152-.721-.228-1.228-.228h-1.929V115h-1.536Zm5.026-4.594 2.516 4.594h-1.75l-2.466-4.594h1.7Zm7.073 4.748c-.752 0-1.4-.161-1.944-.482a3.278 3.278 0 0 1-1.253-1.367c-.291-.59-.437-1.281-.437-2.073 0-.783.146-1.472.437-2.069a3.403 3.403 0 0 1 1.233-1.397c.531-.334 1.151-.502 1.86-.502.431 0 .848.071 1.253.214.404.143.767.366 1.088.671.322.305.575.701.761 1.188.186.484.278 1.073.278 1.765v.527h-6.07v-1.113h4.614c0-.391-.08-.738-.239-1.039a1.801 1.801 0 0 0-.671-.721 1.873 1.873 0 0 0-1.004-.264c-.418 0-.782.103-1.094.308a2.079 2.079 0 0 0-.716.796 2.294 2.294 0 0 0-.248 1.059v.87c0 .51.089.944.268 1.302.182.358.436.632.761.821.324.185.704.278 1.138.278.282 0 .539-.04.771-.119a1.589 1.589 0 0 0 .989-.97l1.407.254a2.562 2.562 0 0 1-.606 1.089 2.961 2.961 0 0 1-1.089.721c-.434.169-.93.253-1.487.253Zm4.926 2.71v-10.5h1.452v1.238h.124c.086-.16.21-.343.373-.552.162-.209.387-.391.676-.547.288-.159.669-.239 1.143-.239a2.98 2.98 0 0 1 1.651.468c.484.311.863.76 1.138 1.347.279.586.418 1.292.418 2.118 0 .825-.138 1.533-.413 2.123-.275.586-.653 1.039-1.133 1.357a2.935 2.935 0 0 1-1.646.472c-.464 0-.843-.078-1.138-.234a2.141 2.141 0 0 1-.686-.546 4.11 4.11 0 0 1-.383-.557h-.09v4.052h-1.486Zm1.456-6.682c0 .537.078 1.007.234 1.412.156.404.381.721.676.949.295.226.657.338 1.084.338.444 0 .815-.117 1.114-.353a2.19 2.19 0 0 0 .676-.969c.156-.408.234-.867.234-1.377 0-.504-.077-.956-.229-1.357a2.082 2.082 0 0 0-.676-.95c-.299-.232-.671-.348-1.119-.348-.431 0-.795.111-1.094.333-.295.222-.518.532-.671.93-.152.397-.229.862-.229 1.392Zm10.401 3.972c-.716 0-1.341-.164-1.874-.492a3.315 3.315 0 0 1-1.243-1.377c-.295-.59-.443-1.28-.443-2.068 0-.793.148-1.485.443-2.079a3.317 3.317 0 0 1 1.243-1.382c.533-.328 1.158-.492 1.874-.492.716 0 1.341.164 1.874.492.534.329.948.789 1.243 1.382.295.594.443 1.286.443 2.079 0 .788-.148 1.478-.443 2.068a3.315 3.315 0 0 1-1.243 1.377c-.533.328-1.158.492-1.874.492Zm.005-1.248c.464 0 .849-.122 1.153-.368.305-.245.531-.571.677-.979a3.9 3.9 0 0 0 .223-1.347c0-.488-.074-.935-.223-1.343a2.19 2.19 0 0 0-.677-.989c-.304-.249-.689-.373-1.153-.373-.467 0-.855.124-1.163.373a2.22 2.22 0 0 0-.681.989 3.958 3.958 0 0 0-.219 1.343c0 .49.073.939.219 1.347.149.408.376.734.681.979.308.246.696.368 1.163.368Zm10.936-4.678-1.347.239a1.6 1.6 0 0 0-.268-.493 1.335 1.335 0 0 0-.488-.382c-.205-.1-.462-.15-.77-.15-.421 0-.773.095-1.054.284-.282.185-.423.426-.423.721 0 .255.095.46.284.616.188.156.493.284.914.383l1.213.278c.703.163 1.227.413 1.571.751.345.338.517.777.517 1.318 0 .457-.132.865-.397 1.223-.262.354-.628.633-1.099.835-.467.202-1.009.303-1.626.303-.855 0-1.553-.182-2.093-.547-.54-.368-.871-.89-.994-1.566l1.437-.219c.089.375.273.658.552.851.278.189.641.283 1.088.283.488 0 .877-.101 1.169-.303.291-.206.437-.456.437-.751a.78.78 0 0 0-.268-.602c-.176-.162-.446-.285-.811-.367l-1.292-.284c-.713-.162-1.24-.421-1.581-.775-.338-.355-.507-.804-.507-1.348 0-.45.126-.845.377-1.183.252-.338.6-.602 1.045-.79.444-.193.952-.289 1.526-.289.825 0 1.475.179 1.949.537.474.355.787.83.939 1.427Zm1.784 5.772v-7.636h1.486V115h-1.486Zm.751-8.815a.948.948 0 0 1-.667-.258.843.843 0 0 1-.273-.627.83.83 0 0 1 .273-.626.935.935 0 0 1 .667-.263c.258 0 .478.087.661.263a.824.824 0 0 1 .278.626.837.837 0 0 1-.278.627.93.93 0 0 1-.661.258Zm6.3 1.179v1.193h-4.171v-1.193h4.171Zm-3.053-1.83h1.487v7.224c0 .288.043.505.129.651a.67.67 0 0 0 .333.293c.139.05.29.075.453.075.119 0 .223-.008.313-.025.089-.016.159-.03.209-.04l.268 1.228a2.925 2.925 0 0 1-.964.159 2.622 2.622 0 0 1-1.094-.208 1.882 1.882 0 0 1-.821-.677c-.208-.304-.313-.687-.313-1.148v-7.532Zm7.832 9.62c-.716 0-1.341-.164-1.875-.492a3.32 3.32 0 0 1-1.242-1.377c-.295-.59-.443-1.28-.443-2.068 0-.793.148-1.485.443-2.079a3.321 3.321 0 0 1 1.242-1.382c.534-.328 1.159-.492 1.875-.492s1.34.164 1.874.492c.534.329.948.789 1.243 1.382.295.594.442 1.286.442 2.079 0 .788-.147 1.478-.442 2.068a3.315 3.315 0 0 1-1.243 1.377c-.534.328-1.158.492-1.874.492Zm.005-1.248c.464 0 .848-.122 1.153-.368.305-.245.53-.571.676-.979a3.9 3.9 0 0 0 .224-1.347c0-.488-.075-.935-.224-1.343a2.188 2.188 0 0 0-.676-.989c-.305-.249-.689-.373-1.153-.373-.468 0-.855.124-1.164.373a2.22 2.22 0 0 0-.681.989 3.958 3.958 0 0 0-.218 1.343c0 .49.072.939.218 1.347.149.408.376.734.681.979.309.246.696.368 1.164.368Zm5.214 1.094v-7.636h1.436v1.213h.08c.139-.411.384-.734.736-.97a2.107 2.107 0 0 1 1.203-.358 7.15 7.15 0 0 1 .631.035v1.422a2.536 2.536 0 0 0-.318-.055 3.058 3.058 0 0 0-.457-.035 1.94 1.94 0 0 0-.94.224 1.66 1.66 0 0 0-.885 1.497V115h-1.486Zm5.373 0v-7.636h1.486V115h-1.486Zm.75-8.815a.947.947 0 0 1-.666-.258.843.843 0 0 1-.273-.627.83.83 0 0 1 .273-.626.934.934 0 0 1 .666-.263c.259 0 .479.087.662.263a.824.824 0 0 1 .278.626.837.837 0 0 1-.278.627.93.93 0 0 1-.662.258Zm6.027 8.969c-.752 0-1.4-.161-1.944-.482a3.269 3.269 0 0 1-1.252-1.367c-.292-.59-.438-1.281-.438-2.073 0-.783.146-1.472.438-2.069a3.393 3.393 0 0 1 1.232-1.397c.531-.334 1.151-.502 1.86-.502.431 0 .848.071 1.253.214.404.143.767.366 1.088.671.322.305.576.701.761 1.188.186.484.279 1.073.279 1.765v.527h-6.071v-1.113h4.614c0-.391-.08-.738-.239-1.039a1.801 1.801 0 0 0-.671-.721 1.873 1.873 0 0 0-1.004-.264c-.418 0-.782.103-1.094.308a2.079 2.079 0 0 0-.716.796 2.294 2.294 0 0 0-.248 1.059v.87c0 .51.089.944.268 1.302.182.358.436.632.761.821.324.185.704.278 1.138.278.282 0 .539-.04.771-.119a1.589 1.589 0 0 0 .989-.97l1.407.254a2.562 2.562 0 0 1-.606 1.089 2.961 2.961 0 0 1-1.089.721c-.434.169-.93.253-1.487.253Zm10.648-5.926-1.347.239a1.582 1.582 0 0 0-.269-.493 1.322 1.322 0 0 0-.487-.382c-.205-.1-.462-.15-.77-.15-.421 0-.773.095-1.054.284-.282.185-.423.426-.423.721 0 .255.094.46.283.616.189.156.494.284.915.383l1.213.278c.703.163 1.227.413 1.571.751.345.338.517.777.517 1.318 0 .457-.132.865-.397 1.223-.262.354-.629.633-1.099.835-.467.202-1.009.303-1.626.303-.855 0-1.553-.182-2.093-.547-.54-.368-.872-.89-.994-1.566l1.437-.219c.089.375.273.658.551.851.279.189.642.283 1.089.283.487 0 .877-.101 1.169-.303.291-.206.437-.456.437-.751a.78.78 0 0 0-.268-.602c-.176-.162-.446-.285-.811-.367l-1.292-.284c-.713-.162-1.24-.421-1.581-.775-.338-.355-.507-.804-.507-1.348 0-.45.125-.845.377-1.183.252-.338.6-.602 1.044-.79.445-.193.953-.289 1.527-.289.825 0 1.475.179 1.949.537a2.5 2.5 0 0 1 .939 1.427ZM175.119 95V84.818h6.383v1.323h-4.847v3.102h4.514v1.317h-4.514v3.118h4.907V95h-6.443Zm14.849-7.636L187.198 95h-1.591l-2.774-7.636h1.596l1.934 5.876h.08l1.929-5.876h1.596Zm4.428 7.79c-.752 0-1.4-.16-1.944-.482a3.273 3.273 0 0 1-1.253-1.367c-.291-.59-.437-1.281-.437-2.074 0-.782.146-1.471.437-2.068a3.398 3.398 0 0 1 1.233-1.397c.53-.334 1.15-.502 1.86-.502.43 0 .848.072 1.252.214.405.143.768.366 1.089.671.322.305.575.701.761 1.188.185.484.278 1.073.278 1.765v.527h-6.07v-1.113h4.614c0-.392-.08-.738-.239-1.04a1.805 1.805 0 0 0-.671-.72 1.876 1.876 0 0 0-1.005-.264c-.417 0-.782.103-1.093.308a2.071 2.071 0 0 0-.716.796 2.293 2.293 0 0 0-.249 1.059v.87c0 .51.09.944.269 1.302.182.358.436.632.76.82.325.186.705.28 1.139.28.282 0 .538-.04.77-.12.232-.083.433-.206.602-.368.169-.162.298-.363.388-.602l1.407.254a2.549 2.549 0 0 1-.607 1.089 2.935 2.935 0 0 1-1.089.72c-.434.17-.929.254-1.486.254Zm6.412-4.688V95h-1.486v-7.636h1.426v1.242h.095c.176-.404.451-.729.825-.974.378-.245.854-.368 1.427-.368.52 0 .976.11 1.367.328.391.216.695.537.91.965.215.427.323.956.323 1.586V95h-1.486v-4.678c0-.554-.145-.986-.433-1.298-.288-.315-.684-.472-1.188-.472-.345 0-.651.074-.92.224a1.61 1.61 0 0 0-.631.656c-.153.285-.229.63-.229 1.034Zm10.445-3.102v1.193h-4.171v-1.193h4.171Zm-3.052-1.83h1.486v7.224c0 .288.043.505.13.651.086.143.197.24.333.293.139.05.29.075.452.075.119 0 .224-.008.313-.025.09-.016.159-.03.209-.04l.269 1.228a2.916 2.916 0 0 1-.965.16 2.616 2.616 0 0 1-1.094-.21 1.877 1.877 0 0 1-.82-.675c-.209-.305-.313-.688-.313-1.149v-7.532Zm10.296 3.694-1.347.239a1.605 1.605 0 0 0-.269-.493 1.33 1.33 0 0 0-.487-.382c-.205-.1-.462-.15-.771-.15-.421 0-.772.095-1.054.284-.281.186-.422.426-.422.72 0 .256.094.461.283.617.189.156.494.284.915.383l1.213.278c.703.163 1.226.413 1.571.751s.517.777.517 1.318c0 .457-.132.865-.398 1.223-.261.354-.628.633-1.098.835-.468.202-1.01.303-1.626.303-.855 0-1.553-.182-2.093-.547-.54-.368-.872-.89-.994-1.566l1.436-.219c.09.375.274.658.552.85.279.19.642.284 1.089.284.487 0 .877-.101 1.168-.303.292-.206.438-.456.438-.751a.78.78 0 0 0-.269-.602c-.175-.162-.445-.285-.81-.367l-1.293-.284c-.712-.162-1.239-.42-1.581-.775-.338-.355-.507-.804-.507-1.348 0-.45.126-.845.378-1.183.252-.338.6-.602 1.044-.79.444-.193.953-.289 1.526-.289.826 0 1.475.18 1.949.537.474.355.788.83.94 1.427Z",fill:"#D1D1D1"})),jr||(jr=r.createElement("path",{d:"M44.021 138.852a9.877 9.877 0 0 1 7.017 2.933 10.06 10.06 0 0 1 2.906 7.081c0 2.656-1.045 5.204-2.906 7.082a9.877 9.877 0 0 1-7.017 2.933 9.877 9.877 0 0 1-7.016-2.933 10.063 10.063 0 0 1-2.907-7.082 10.06 10.06 0 0 1 2.907-7.081 9.877 9.877 0 0 1 7.016-2.933Zm-19.846 7.153c1.588 0 3.062.429 4.338 1.202a15.948 15.948 0 0 0 3.204 11.331c-1.418 2.746-4.253 4.635-7.541 4.635a8.465 8.465 0 0 1-6.015-2.514 8.624 8.624 0 0 1-2.49-6.07c0-2.277.895-4.46 2.49-6.07a8.465 8.465 0 0 1 6.014-2.514Zm39.692 0c2.256 0 4.42.904 6.014 2.514a8.625 8.625 0 0 1 2.491 6.07c0 2.277-.896 4.46-2.49 6.07a8.465 8.465 0 0 1-6.015 2.514c-3.289 0-6.124-1.889-7.541-4.635a15.948 15.948 0 0 0 3.203-11.331 8.308 8.308 0 0 1 4.338-1.202Zm-38.274 29.329c0-5.923 8.25-10.73 18.428-10.73s18.428 4.807 18.428 10.73v5.007H25.593v-5.007ZM10 180.341v-4.292c0-3.977 5.358-7.325 12.616-8.298-1.672 1.946-2.693 4.635-2.693 7.583v5.007H10Zm68.043 0H68.12v-5.007c0-2.948-1.021-5.637-2.694-7.583 7.258.973 12.617 4.321 12.617 8.298v4.292Z",fill:"#fff"})),Xr||(Xr=r.createElement("circle",{cx:67.67,cy:183.244,r:20.33,fill:"#464545"})),Jr||(Jr=r.createElement("circle",{cx:36.138,cy:200.67,r:20.33,fill:"#464545"})),eo||(eo=r.createElement("path",{d:"M68.639 184.345a2.73 2.73 0 0 0 1.058-.213 2.77 2.77 0 0 0 1.497-1.516 2.827 2.827 0 0 0-.6-3.052 2.75 2.75 0 0 0-1.955-.82 2.75 2.75 0 0 0-1.956.82 2.821 2.821 0 0 0-.6 3.052c.14.34.343.649.6.909a2.75 2.75 0 0 0 1.956.82Zm0-10.642c4.27 0 7.745 3.506 7.745 7.842 0 5.881-7.745 14.562-7.745 14.562s-7.745-8.681-7.745-14.562A7.89 7.89 0 0 1 63.163 176a7.695 7.695 0 0 1 5.476-2.297Zm-9.957 7.842c0 5.041 5.62 11.941 6.638 13.229l-1.107 1.333s-7.744-8.681-7.744-14.562c0-3.551 2.334-6.554 5.532-7.517a10.117 10.117 0 0 0-3.32 7.517ZM43.525 204.127H41.2v2.305h2.324m0-6.915H41.2v2.305h2.324m2.323 6.915h-9.294v-2.305h2.324v-2.305h-2.324v-2.305h2.324v-2.305h-2.324v-2.305h9.294m-11.617-2.305h-2.323v-2.305h2.323m0 6.915h-2.323v-2.305h2.323m0 6.915h-2.323v-2.305h2.323m0 6.915h-2.323v-2.305h2.323m-4.647-11.525h-2.323v-2.305h2.323m0 6.915h-2.323v-2.305h2.323m0 6.915h-2.323v-2.305h2.323m0 6.915h-2.323v-2.305h2.323m6.97-11.525v-4.61H24.937v20.745h23.235v-16.135H36.555ZM328.6 141h37.2c1.644 0 3.221.658 4.384 1.831A6.273 6.273 0 0 1 372 147.25v50a6.273 6.273 0 0 1-1.816 4.419 6.173 6.173 0 0 1-4.384 1.831h-37.2a6.173 6.173 0 0 1-4.384-1.831 6.273 6.273 0 0 1-1.816-4.419v-50c0-1.658.653-3.247 1.816-4.419A6.173 6.173 0 0 1 328.6 141Zm20.925 35.938c8.525 0 10.819-6.344 11.408-9.688a7.04 7.04 0 0 0 4.867-6.719c0-3.906-3.1-7.031-6.975-7.031-3.875 0-6.975 3.125-6.975 7.031 0 2.938 1.767 5.469 4.309 6.5-.682 2.094-2.759 5.219-8.959 5.219-4.278 0-7.254 1.094-9.3 2.625v-12.406a7.042 7.042 0 0 0 4.65-6.625c0-3.906-3.1-7.032-6.975-7.032-3.875 0-6.975 3.126-6.975 7.032a7.042 7.042 0 0 0 4.65 6.625v19.562a7.042 7.042 0 0 0-4.65 6.625c0 3.906 3.1 7.032 6.975 7.032 3.875 0 6.975-3.126 6.975-7.032 0-2.906-1.736-5.468-4.247-6.468.868-2.126 3.41-5.25 11.222-5.25Zm-13.95 9.374c.617 0 1.208.247 1.644.687a2.355 2.355 0 0 1 0 3.315 2.317 2.317 0 0 1-3.288 0 2.355 2.355 0 0 1 0-3.315 2.313 2.313 0 0 1 1.644-.687Zm0-32.812c.617 0 1.208.247 1.644.686a2.355 2.355 0 0 1 0 3.315 2.313 2.313 0 0 1-3.288 0 2.355 2.355 0 0 1 0-3.315 2.317 2.317 0 0 1 1.644-.686Zm23.25 4.688c.617 0 1.208.246 1.644.686a2.355 2.355 0 0 1 0 3.315 2.317 2.317 0 0 1-3.288 0 2.355 2.355 0 0 1 0-3.315 2.313 2.313 0 0 1 1.644-.686ZM353.4 209.75V216h-37.2a6.173 6.173 0 0 1-4.384-1.831A6.273 6.273 0 0 1 310 209.75v-50h6.2v50h37.2ZM166.409 125.688h50.931c1.689 0 3.308.666 4.502 1.853a6.31 6.31 0 0 1 1.864 4.476v47.468c0 1.679-.67 3.288-1.864 4.475a6.385 6.385 0 0 1-4.502 1.854h-50.931a6.385 6.385 0 0 1-4.501-1.854 6.309 6.309 0 0 1-1.865-4.475v-47.468c0-1.679.671-3.289 1.865-4.476a6.384 6.384 0 0 1 4.501-1.853Zm0 12.658v9.493h12.733v-9.493h-12.733Zm19.099 0v9.493h12.733v-9.493h-12.733Zm31.832 9.493v-9.493h-12.733v9.493h12.733Zm-50.931 6.33v9.493h12.733v-9.493h-12.733Zm0 25.316h12.733v-9.494h-12.733v9.494Zm19.099-25.316v9.493h12.733v-9.493h-12.733Zm0 25.316h12.733v-9.494h-12.733v9.494Zm31.832 0v-9.494h-12.733v9.494h12.733Zm0-25.316h-12.733v9.493h12.733v-9.493Z",fill:"#fff"})),to||(to=r.createElement("circle",{cx:163.968,cy:193.276,r:23.968,fill:"#464545"})),no||(no=r.createElement("circle",{cx:194.231,cy:199.958,r:17.684,fill:"#464545"})),ao||(ao=r.createElement("path",{d:"M194.232 194.062c2.383 0 4.415 1.073 5.933 2.246 1.527 1.179 2.63 2.534 3.172 3.267.213.288.327.626.327.972s-.114.684-.327.971c-.542.733-1.645 2.088-3.172 3.267-1.519 1.174-3.55 2.246-5.933 2.246-2.382 0-4.415-1.072-5.932-2.246-1.528-1.18-2.63-2.535-3.172-3.268a1.63 1.63 0 0 1-.327-.971c0-.346.114-.684.327-.972.542-.732 1.644-2.087 3.172-3.266 1.519-1.173 3.55-2.246 5.932-2.246Zm-7.602 6.411a.127.127 0 0 0-.025.074c0 .026.009.052.025.073.495.672 1.493 1.891 2.846 2.937 1.36 1.051 2.985 1.853 4.756 1.853 1.772 0 3.398-.802 4.757-1.853 1.352-1.046 2.35-2.266 2.845-2.937a.116.116 0 0 0 0-.147c-.495-.671-1.493-1.891-2.845-2.936-1.36-1.052-2.985-1.853-4.757-1.853-1.771 0-3.397.801-4.756 1.853-1.352 1.045-2.35 2.265-2.846 2.936Zm7.602 2.235a2.625 2.625 0 0 1-.936-.15 2.45 2.45 0 0 1-.799-.465 2.181 2.181 0 0 1-.536-.707 1.974 1.974 0 0 1 0-1.676c.124-.266.306-.506.535-.708.229-.201.5-.359.798-.465.298-.106.617-.157.937-.151a2.54 2.54 0 0 1 1.666.65c.44.404.686.946.686 1.511a2.047 2.047 0 0 1-.685 1.511 2.54 2.54 0 0 1-1.666.65ZM163.58 182.273c.223 0 .441.062.631.179.189.117.342.284.44.483l2.995 6.033 6.7.968a1.193 1.193 0 0 1 .964.807 1.182 1.182 0 0 1-.302 1.216l-4.847 4.697 1.144 6.631a1.179 1.179 0 0 1-.476 1.158 1.198 1.198 0 0 1-1.256.093l-5.993-3.132-5.993 3.132a1.206 1.206 0 0 1-1.256-.091 1.187 1.187 0 0 1-.476-1.159l1.146-6.633-4.851-4.696a1.176 1.176 0 0 1-.302-1.217 1.195 1.195 0 0 1 .965-.807l6.699-.967 2.997-6.033a1.196 1.196 0 0 1 1.071-.662Zm0 3.867-2.204 4.437a1.196 1.196 0 0 1-.898.648l-4.928.712 3.565 3.454a1.192 1.192 0 0 1 .343 1.05l-.84 4.878 4.407-2.303a1.204 1.204 0 0 1 1.111 0l4.408 2.303-.844-4.878a1.186 1.186 0 0 1 .344-1.05l3.565-3.452-4.927-.712a1.198 1.198 0 0 1-.898-.649l-2.204-4.438Z",fill:"#fff"})),ro||(ro=r.createElement("circle",{cx:231,cy:127,r:18,fill:"#464545"})),oo||(oo=r.createElement("path",{d:"M224.001 121.125a2.651 2.651 0 0 1 1.441-2.359 2.68 2.68 0 0 1 2.765.191c.399.281.713.666.907 1.113.194.447.262.938.194 1.421a2.665 2.665 0 0 1-1.752 2.139v6.206a2.661 2.661 0 0 1 1.741 2.955 2.66 2.66 0 0 1-.91 1.583 2.674 2.674 0 0 1-3.439 0 2.648 2.648 0 0 1-.581-3.377 2.661 2.661 0 0 1 1.412-1.161v-6.206a2.655 2.655 0 0 1-1.778-2.505Zm6.727-.209 2.84-2.829a.286.286 0 0 1 .152-.081.294.294 0 0 1 .354.29v1.943h1.185c.785 0 1.539.311 2.095.865.555.553.867 1.304.867 2.087v6.645a2.661 2.661 0 0 1 1.741 2.955 2.66 2.66 0 0 1-.91 1.583 2.674 2.674 0 0 1-3.439 0 2.648 2.648 0 0 1-.581-3.377 2.661 2.661 0 0 1 1.412-1.161v-6.645a1.18 1.18 0 0 0-1.185-1.181h-1.185v1.944a.293.293 0 0 1-.183.273.3.3 0 0 1-.323-.064l-2.84-2.829a.31.31 0 0 1-.087-.209.3.3 0 0 1 .087-.209Zm-4.061-.677a.888.888 0 0 0-.888.886c0 .235.093.46.26.626a.891.891 0 0 0 1.517-.626.888.888 0 0 0-.889-.886Zm0 11.217a.888.888 0 0 0-.888.886c0 .235.093.46.26.626a.891.891 0 0 0 1.517-.626.888.888 0 0 0-.889-.886Zm9.777.886c0 .235.093.46.26.626a.892.892 0 0 0 1.257 0 .881.881 0 0 0 0-1.252.888.888 0 0 0-1.517.626Z",fill:"#fff"})),lo||(lo=r.createElement("path",{d:"m92 181.5 49.5-22.5M238 158l65 26.5",stroke:"#fff"})),io||(io=r.createElement("rect",{y:216,width:43,height:12,rx:6,fill:"#696969"})),co||(co=r.createElement("rect",{x:65,y:198,width:25,height:12,rx:6,fill:"#696969"})),so||(so=r.createElement("rect",{x:140,y:211,width:25,height:12,rx:6,fill:"#696969"})),uo||(uo=r.createElement("rect",{x:189,y:214,width:32,height:12,rx:6,fill:"#696969"})),mo||(mo=r.createElement("rect",{x:166,y:115,width:55,height:12,rx:6,fill:"#696969"})),ho||(ho=r.createElement("path",{d:"M6.41 224.088c-.423 0-.787-.096-1.092-.287a1.898 1.898 0 0 1-.699-.798 2.657 2.657 0 0 1-.244-1.165c0-.443.083-.834.25-1.173a1.92 1.92 0 0 1 .705-.799c.303-.191.66-.286 1.07-.286.332 0 .627.061.887.184.26.121.469.292.628.512.16.219.256.476.287.769h-.827a.992.992 0 0 0-.313-.528c-.16-.148-.376-.222-.647-.222-.237 0-.444.063-.622.188a1.204 1.204 0 0 0-.412.528 2.024 2.024 0 0 0-.148.807c0 .318.048.593.145.824.096.231.233.41.409.537.178.127.387.19.628.19.16 0 .307-.029.437-.088a.893.893 0 0 0 .333-.258.972.972 0 0 0 .19-.404h.827a1.584 1.584 0 0 1-.892 1.279c-.256.127-.556.19-.9.19Zm4.538 0c-.409 0-.766-.094-1.07-.281a1.9 1.9 0 0 1-.711-.787c-.169-.337-.253-.731-.253-1.182 0-.453.084-.848.253-1.187a1.89 1.89 0 0 1 .71-.79 2 2 0 0 1 1.071-.281c.41 0 .766.093 1.071.281.305.187.542.451.71.79.169.339.253.734.253 1.187 0 .451-.084.845-.253 1.182a1.9 1.9 0 0 1-.71.787 2.008 2.008 0 0 1-1.07.281Zm.003-.713c.265 0 .485-.07.66-.21.173-.14.302-.327.385-.56.086-.233.128-.489.128-.77 0-.278-.042-.534-.128-.767a1.247 1.247 0 0 0-.386-.565 1.01 1.01 0 0 0-.659-.213c-.267 0-.489.071-.665.213-.174.142-.304.33-.389.565a2.264 2.264 0 0 0-.125.767c0 .281.042.537.125.77.085.233.215.42.39.56.175.14.397.21.664.21Zm2.98.625v-4.364h.815v.711h.054c.09-.241.24-.428.446-.563.206-.136.453-.204.741-.204.292 0 .536.068.733.204.199.136.346.324.44.563h.046c.104-.233.27-.419.497-.557.227-.14.498-.21.813-.21.396 0 .718.124.968.372.252.248.378.622.378 1.122V224h-.85v-2.847c0-.295-.08-.509-.24-.642a.882.882 0 0 0-.577-.199c-.277 0-.492.086-.645.256-.154.169-.23.386-.23.651V224h-.847v-2.901a.762.762 0 0 0-.222-.571.791.791 0 0 0-.576-.216.828.828 0 0 0-.446.128.942.942 0 0 0-.327.35 1.068 1.068 0 0 0-.122.52V224h-.85Zm7.07 1.636v-6h.83v.708h.07c.05-.091.12-.196.213-.316.093-.119.222-.223.387-.312.165-.091.382-.136.653-.136.352 0 .667.089.943.267.277.178.494.434.65.769.16.336.24.739.24 1.211 0 .471-.08.876-.236 1.213a1.834 1.834 0 0 1-.648.775c-.275.18-.588.27-.94.27-.265 0-.482-.044-.65-.133a1.223 1.223 0 0 1-.393-.313 2.328 2.328 0 0 1-.219-.318h-.05v2.315H21Zm.832-3.818c0 .307.045.576.134.807.089.231.217.412.386.543a.995.995 0 0 0 .62.193.993.993 0 0 0 .636-.202c.17-.136.299-.321.386-.554a2.19 2.19 0 0 0 .134-.787c0-.288-.044-.546-.131-.775a1.187 1.187 0 0 0-.387-.543 1.007 1.007 0 0 0-.639-.199c-.246 0-.454.064-.625.19a1.167 1.167 0 0 0-.383.532c-.087.227-.13.492-.13.795Zm5.375 2.279c-.276 0-.526-.052-.75-.154a1.263 1.263 0 0 1-.531-.452 1.293 1.293 0 0 1-.193-.724c0-.246.047-.449.142-.608a1.05 1.05 0 0 1 .383-.378c.161-.093.341-.163.54-.21.199-.047.402-.083.608-.108l.636-.074a.947.947 0 0 0 .355-.099c.074-.046.111-.12.111-.222v-.02c0-.248-.07-.44-.21-.576-.138-.137-.345-.205-.62-.205-.285 0-.51.063-.675.19a1.022 1.022 0 0 0-.338.418l-.799-.182c.095-.265.233-.479.415-.642a1.68 1.68 0 0 1 .634-.358c.238-.076.49-.113.752-.113.175 0 .36.02.554.062.197.04.381.114.551.222.173.108.314.262.424.463.11.199.165.457.165.775V224h-.83v-.597h-.034c-.055.11-.137.218-.247.324-.11.106-.251.194-.424.264a1.623 1.623 0 0 1-.619.106Zm.185-.682c.235 0 .435-.047.602-.139a.975.975 0 0 0 .384-.364.946.946 0 0 0 .133-.486v-.562a.454.454 0 0 1-.176.085 2.917 2.917 0 0 1-.293.065l-.32.048-.262.035c-.165.02-.315.055-.452.105a.771.771 0 0 0-.324.213.532.532 0 0 0-.119.363c0 .211.078.37.233.478.155.106.353.159.594.159Zm3.95-2.006V224h-.85v-4.364h.815v.711h.054c.1-.231.258-.417.472-.557.216-.14.488-.21.815-.21.297 0 .558.062.781.187.224.123.397.307.52.551.123.244.185.547.185.906V224h-.85v-2.673c0-.317-.082-.564-.247-.742-.164-.18-.39-.27-.679-.27-.197 0-.372.043-.525.128a.917.917 0 0 0-.361.375 1.24 1.24 0 0 0-.13.591Zm4.312 4.227a1.76 1.76 0 0 1-.58-.093l.205-.696c.155.041.293.059.415.054a.5.5 0 0 0 .32-.137c.095-.085.179-.224.25-.417l.106-.29-1.597-4.421h.91l1.104 3.387h.046l1.105-3.387h.912l-1.798 4.946c-.084.228-.19.42-.319.577a1.23 1.23 0 0 1-.46.358c-.178.08-.384.119-.62.119ZM73.577 203.02a1.774 1.774 0 0 0-.222-.463 1.409 1.409 0 0 0-.761-.577 1.752 1.752 0 0 0-.531-.077c-.328 0-.624.085-.887.253a1.727 1.727 0 0 0-.625.742c-.151.324-.227.72-.227 1.19 0 .472.077.87.23 1.196.153.326.364.573.63.742.268.168.572.252.913.252.316 0 .591-.064.826-.193.237-.129.42-.31.549-.545.13-.237.196-.515.196-.835l.227.042H72.23v-.724h2.287v.662c0 .488-.104.913-.313 1.272a2.128 2.128 0 0 1-.857.83c-.364.195-.78.293-1.25.293-.527 0-.989-.122-1.387-.364a2.469 2.469 0 0 1-.926-1.031c-.222-.447-.332-.978-.332-1.591 0-.464.064-.881.193-1.25.129-.37.31-.683.543-.941.234-.259.51-.457.826-.593a2.576 2.576 0 0 1 1.043-.208c.314 0 .607.047.878.139.272.093.515.225.727.395a2.243 2.243 0 0 1 .815 1.384h-.9Zm3.867 4.068c-.43 0-.8-.092-1.11-.276a1.866 1.866 0 0 1-.717-.781c-.166-.337-.25-.732-.25-1.184 0-.447.084-.841.25-1.182.169-.341.404-.607.705-.799a1.95 1.95 0 0 1 1.062-.286c.246 0 .485.04.716.122.231.081.439.209.622.383.184.174.329.401.435.679.106.277.16.613.16 1.009v.301h-3.47v-.636h2.637c0-.224-.046-.422-.137-.594a1.03 1.03 0 0 0-.383-.412 1.067 1.067 0 0 0-.574-.151c-.239 0-.447.059-.625.176a1.184 1.184 0 0 0-.41.455 1.312 1.312 0 0 0-.141.605v.497c0 .292.05.54.153.745.104.204.25.36.435.468.185.106.402.159.65.159.161 0 .308-.022.44-.068a.91.91 0 0 0 .565-.554l.805.145c-.064.237-.18.444-.347.622a1.676 1.676 0 0 1-.622.412 2.32 2.32 0 0 1-.85.145Zm4.653 0c-.41 0-.766-.094-1.071-.281a1.9 1.9 0 0 1-.71-.787c-.17-.337-.254-.731-.254-1.182 0-.453.085-.848.253-1.187a1.89 1.89 0 0 1 .71-.79 1.999 1.999 0 0 1 1.072-.281c.409 0 .766.093 1.07.281.305.187.542.451.71.79.17.339.254.734.254 1.187 0 .451-.085.845-.253 1.182a1.9 1.9 0 0 1-.71.787 2.008 2.008 0 0 1-1.071.281Zm.002-.713c.266 0 .485-.07.66-.21.174-.14.303-.327.386-.56.085-.233.128-.489.128-.77a2.22 2.22 0 0 0-.128-.767 1.247 1.247 0 0 0-.386-.565 1.01 1.01 0 0 0-.66-.213c-.267 0-.488.071-.664.213-.175.142-.304.33-.39.565a2.263 2.263 0 0 0-.124.767c0 .281.041.537.124.77.086.233.215.42.39.56.176.14.397.21.664.21ZM147.812 215.71a.83.83 0 0 0-.374-.625c-.22-.149-.497-.224-.83-.224-.239 0-.445.038-.619.113a.96.96 0 0 0-.407.307.73.73 0 0 0-.142.441c0 .138.033.257.097.358.066.1.152.184.258.252.108.067.224.123.347.168.123.044.242.08.355.108l.568.148c.186.045.376.107.571.184.195.078.376.18.543.307.167.127.301.284.403.472.105.187.157.412.157.673 0 .33-.086.622-.256.878a1.707 1.707 0 0 1-.736.605c-.32.148-.707.222-1.162.222-.435 0-.812-.07-1.13-.208a1.736 1.736 0 0 1-.748-.588 1.706 1.706 0 0 1-.298-.909h.881c.017.21.085.385.204.526.122.138.276.241.463.309.19.067.397.1.623.1.248 0 .468-.039.661-.117.196-.079.349-.189.461-.329a.785.785 0 0 0 .167-.497.613.613 0 0 0-.147-.424 1.086 1.086 0 0 0-.395-.272 3.891 3.891 0 0 0-.56-.191l-.687-.187c-.466-.127-.836-.314-1.108-.56-.271-.246-.407-.572-.407-.977 0-.336.091-.628.273-.878.182-.25.428-.444.739-.583.31-.14.661-.21 1.051-.21.394 0 .741.069 1.042.208.303.138.542.328.716.571.175.24.266.517.273.829h-.847Zm3.944-.074v.682h-2.383v-.682h2.383Zm-1.744-1.045h.85v4.128c0 .165.024.289.073.372.05.081.113.137.191.168a.767.767 0 0 0 .258.042c.068 0 .128-.005.179-.014l.12-.023.153.702a1.665 1.665 0 0 1-.551.091 1.495 1.495 0 0 1-.625-.119 1.08 1.08 0 0 1-.469-.387c-.119-.174-.179-.393-.179-.656v-4.304Zm3.954 5.506c-.277 0-.527-.052-.75-.154a1.255 1.255 0 0 1-.531-.452 1.29 1.29 0 0 1-.194-.724c0-.246.048-.449.143-.608.094-.159.222-.285.383-.378.161-.093.341-.163.54-.21.199-.047.401-.083.608-.108l.636-.074a.947.947 0 0 0 .355-.099c.074-.046.111-.12.111-.222v-.02c0-.248-.07-.44-.21-.576-.138-.137-.345-.205-.619-.205-.286 0-.512.063-.677.19a1.025 1.025 0 0 0-.338.418l-.798-.182c.095-.265.233-.479.415-.642.183-.165.395-.284.633-.358a2.47 2.47 0 0 1 .753-.113c.174 0 .359.02.554.062.197.04.381.114.551.222.173.108.314.262.424.463.109.199.164.457.164.775V220h-.829v-.597h-.034c-.055.11-.138.218-.247.324a1.31 1.31 0 0 1-.424.264 1.622 1.622 0 0 1-.619.106Zm.185-.682c.234 0 .435-.047.602-.139a.976.976 0 0 0 .383-.364.947.947 0 0 0 .134-.486v-.562a.452.452 0 0 1-.176.085 2.908 2.908 0 0 1-.293.065l-.321.048-.261.035a2.01 2.01 0 0 0-.452.105.778.778 0 0 0-.324.213.534.534 0 0 0-.119.363c0 .211.078.37.233.478.155.106.353.159.594.159Zm3.1.585v-4.364h.821v.694h.045c.08-.235.22-.42.421-.554.202-.137.431-.205.687-.205a3.457 3.457 0 0 1 .361.02v.812a1.826 1.826 0 0 0-.182-.031 1.765 1.765 0 0 0-.261-.02c-.201 0-.38.043-.537.128a.941.941 0 0 0-.369.35.942.942 0 0 0-.137.505V220h-.849ZM194.778 223l-1.613-5.818h.923l1.134 4.506h.054l1.179-4.506h.914l1.179 4.508h.054l1.131-4.508h.926L199.043 223h-.884l-1.224-4.358h-.046L195.665 223h-.887Zm7.454.097c-.277 0-.527-.052-.75-.154a1.264 1.264 0 0 1-.532-.452c-.129-.196-.193-.438-.193-.724 0-.246.047-.449.142-.608.095-.159.223-.285.384-.378a1.99 1.99 0 0 1 .539-.21c.199-.047.402-.083.608-.108l.637-.074a.947.947 0 0 0 .355-.099c.074-.046.111-.12.111-.222v-.02c0-.248-.07-.44-.211-.576-.138-.137-.344-.205-.619-.205-.286 0-.511.063-.676.19a1.017 1.017 0 0 0-.338.418l-.798-.182c.094-.265.233-.479.414-.642.184-.165.395-.284.634-.358a2.47 2.47 0 0 1 .753-.113c.174 0 .359.02.554.062.197.04.38.114.551.222.172.108.313.262.423.463.11.199.165.457.165.775V223h-.83v-.597h-.034c-.055.11-.137.218-.247.324-.11.106-.251.194-.423.264a1.622 1.622 0 0 1-.619.106Zm.184-.682c.235 0 .436-.047.602-.139a.972.972 0 0 0 .518-.85v-.562a.466.466 0 0 1-.177.085 2.885 2.885 0 0 1-.292.065l-.321.048-.262.035c-.164.02-.315.055-.451.105a.766.766 0 0 0-.324.213.53.53 0 0 0-.12.363c0 .211.078.37.233.478.156.106.354.159.594.159Zm5.137-3.779v.682h-2.383v-.682h2.383Zm-1.744-1.045h.849v4.128c0 .165.025.289.074.372a.39.39 0 0 0 .191.168.767.767 0 0 0 .258.042c.068 0 .128-.005.179-.014l.119-.023.154.702a1.665 1.665 0 0 1-.551.091 1.495 1.495 0 0 1-.625-.119 1.074 1.074 0 0 1-.469-.387c-.119-.174-.179-.393-.179-.656v-4.304Zm4.475 5.497c-.422 0-.786-.096-1.091-.287a1.9 1.9 0 0 1-.699-.798 2.656 2.656 0 0 1-.244-1.165c0-.443.083-.834.25-1.173.167-.341.402-.607.705-.799.303-.191.66-.286 1.071-.286.331 0 .626.061.886.184.259.121.469.292.628.512.161.219.256.476.287.769h-.827a.994.994 0 0 0-.312-.528c-.161-.148-.377-.222-.648-.222-.237 0-.444.063-.622.188a1.195 1.195 0 0 0-.412.528 2.015 2.015 0 0 0-.148.807c0 .318.048.593.145.824.096.231.233.41.409.537.178.127.387.19.628.19.161 0 .307-.029.437-.088a.892.892 0 0 0 .333-.258.97.97 0 0 0 .19-.404h.827a1.607 1.607 0 0 1-.276.756 1.584 1.584 0 0 1-.616.523c-.256.127-.556.19-.901.19Zm3.551-2.679V223h-.85v-5.818h.838v2.165h.054c.102-.235.259-.422.469-.56.21-.138.485-.207.824-.207.299 0 .56.061.784.184.225.123.399.307.523.551.125.243.187.546.187.909V223h-.849v-2.673c0-.32-.083-.568-.248-.745-.164-.178-.393-.267-.687-.267-.201 0-.381.043-.54.128a.92.92 0 0 0-.372.375c-.089.163-.133.36-.133.591ZM170.639 123v-5.818h2.074c.453 0 .828.082 1.125.247.297.165.52.39.668.676.147.284.221.604.221.96 0 .358-.075.68-.224.966-.148.284-.371.51-.671.676-.297.165-.671.248-1.122.248h-1.426v-.745h1.347c.286 0 .518-.049.696-.148a.926.926 0 0 0 .392-.409c.083-.172.125-.368.125-.588 0-.219-.042-.414-.125-.585a.898.898 0 0 0-.395-.4c-.178-.097-.413-.145-.705-.145h-1.102V123h-.878Zm7.813-1.81v-2.554h.853V123h-.836v-.756h-.045c-.1.233-.261.427-.483.583-.22.153-.493.23-.821.23-.28 0-.528-.062-.744-.185a1.3 1.3 0 0 1-.506-.554c-.121-.244-.182-.546-.182-.906v-2.776h.85v2.674c0 .297.082.534.247.71a.84.84 0 0 0 .642.264 1.046 1.046 0 0 0 .869-.48c.106-.161.158-.366.156-.614Zm2.843-4.008V123h-.849v-5.818h.849Zm1.993 0V123h-.85v-5.818h.85Zm3.26 5.818v-4.364h.821v.694h.045c.08-.235.22-.42.421-.554.202-.137.431-.205.687-.205a3.457 3.457 0 0 1 .361.02v.812a1.826 1.826 0 0 0-.182-.031 1.765 1.765 0 0 0-.261-.02c-.201 0-.38.043-.537.128a.944.944 0 0 0-.506.855V123h-.849Zm4.794.088c-.43 0-.8-.092-1.11-.276a1.861 1.861 0 0 1-.716-.781c-.167-.337-.25-.732-.25-1.184 0-.447.083-.841.25-1.182.168-.341.403-.607.704-.799a1.95 1.95 0 0 1 1.063-.286c.246 0 .485.04.716.122.231.081.438.209.622.383.183.174.328.401.434.679.106.277.159.613.159 1.009v.301h-3.468v-.636h2.636c0-.224-.045-.422-.136-.594a1.03 1.03 0 0 0-.384-.412 1.066 1.066 0 0 0-.574-.151c-.238 0-.447.059-.625.176a1.187 1.187 0 0 0-.409.455 1.321 1.321 0 0 0-.142.605v.497c0 .292.051.54.154.745.104.204.249.36.434.468.186.106.403.159.651.159.161 0 .308-.022.44-.068a.917.917 0 0 0 .566-.554l.804.145c-.065.237-.18.444-.347.622a1.677 1.677 0 0 1-.622.412 2.32 2.32 0 0 1-.85.145Zm5.761 1.548v-2.315h-.051a2.181 2.181 0 0 1-.222.318c-.094.12-.225.224-.392.313-.166.089-.382.133-.648.133-.352 0-.666-.09-.943-.27a1.836 1.836 0 0 1-.647-.775c-.156-.337-.233-.742-.233-1.213 0-.472.078-.875.235-1.211.16-.335.377-.591.654-.769.276-.178.59-.267.94-.267.271 0 .489.045.654.136.166.089.295.193.386.312.093.12.165.225.216.316h.071v-.708h.829v6h-.849Zm-1.125-2.275a.993.993 0 0 0 .619-.193c.171-.131.3-.312.387-.543.089-.231.133-.5.133-.807 0-.303-.043-.568-.13-.795a1.172 1.172 0 0 0-.384-.532 1.016 1.016 0 0 0-.625-.19c-.256 0-.469.066-.639.199a1.218 1.218 0 0 0-.387.543 2.214 2.214 0 0 0-.127.775c0 .292.043.554.13.787.087.233.216.418.387.554a.998.998 0 0 0 .636.202Zm5.881-1.171v-2.554h.852V123h-.835v-.756h-.046c-.1.233-.261.427-.483.583-.219.153-.493.23-.821.23-.28 0-.528-.062-.744-.185a1.3 1.3 0 0 1-.506-.554c-.121-.244-.182-.546-.182-.906v-2.776h.85v2.674c0 .297.082.534.247.71a.84.84 0 0 0 .642.264c.159 0 .317-.04.475-.119a1 1 0 0 0 .394-.361c.106-.161.159-.366.157-.614Zm3.874 1.898c-.43 0-.8-.092-1.111-.276a1.867 1.867 0 0 1-.716-.781c-.166-.337-.25-.732-.25-1.184 0-.447.084-.841.25-1.182.169-.341.404-.607.705-.799a1.949 1.949 0 0 1 1.062-.286c.247 0 .485.04.716.122.231.081.439.209.622.383a1.8 1.8 0 0 1 .435.679c.106.277.159.613.159 1.009v.301h-3.469v-.636h2.637c0-.224-.046-.422-.137-.594a1.028 1.028 0 0 0-.383-.412 1.066 1.066 0 0 0-.574-.151c-.239 0-.447.059-.625.176a1.18 1.18 0 0 0-.409.455 1.308 1.308 0 0 0-.142.605v.497c0 .292.051.54.153.745.104.204.249.36.435.468.186.106.402.159.65.159.161 0 .308-.022.441-.068a.915.915 0 0 0 .565-.554l.804.145c-.064.237-.18.444-.346.622a1.68 1.68 0 0 1-.623.412 2.318 2.318 0 0 1-.849.145Zm6.084-3.386-.769.136a.937.937 0 0 0-.154-.281.762.762 0 0 0-.278-.219 1.008 1.008 0 0 0-.441-.085c-.24 0-.441.054-.602.162-.161.106-.241.243-.241.412 0 .146.054.263.162.352.108.089.282.162.522.219l.694.159c.401.093.7.236.897.429.197.193.296.444.296.753 0 .261-.076.494-.228.699a1.49 1.49 0 0 1-.627.477 2.333 2.333 0 0 1-.929.173c-.489 0-.888-.104-1.196-.312a1.324 1.324 0 0 1-.569-.895l.821-.125a.786.786 0 0 0 .316.485c.159.108.366.162.622.162.278 0 .501-.057.668-.173.166-.117.25-.26.25-.429a.449.449 0 0 0-.154-.344c-.1-.092-.255-.162-.463-.21l-.739-.162c-.407-.093-.708-.24-.903-.443a1.072 1.072 0 0 1-.29-.77 1.1 1.1 0 0 1 .216-.676c.144-.193.343-.344.597-.452.254-.11.544-.164.872-.164.471 0 .843.102 1.114.306.27.203.449.475.536.816Zm3.057-1.066v.682h-2.384v-.682h2.384Zm-1.745-1.045h.85v4.128c0 .165.024.289.074.372a.389.389 0 0 0 .19.168.771.771 0 0 0 .258.042c.069 0 .128-.005.179-.014l.12-.023.153.702a1.665 1.665 0 0 1-.551.091 1.498 1.498 0 0 1-.625-.119 1.085 1.085 0 0 1-.469-.387c-.119-.174-.179-.393-.179-.656v-4.304Z",fill:"#F5F5F5"})),go||(go=r.createElement("path",{stroke:"#fff",d:"M194.5 29v46M355 58.5H43M42.5 58v37M355.5 58v37"})),po||(po=r.createElement("defs",null,r.createElement("clipPath",{id:"a"},r.createElement("path",{fill:"#fff",transform:"translate(175 3)",d:"M0 0h57v15H0z"})))))};function vo(){return r.createElement(yo,{stops:[["rgba(255, 188, 167, 0.5)",2.21],["rgba(218, 163, 216, 0.5)",30.93],["rgba(181, 135, 255, 0.5)",67.95],["rgba(107, 122, 255, 0.5)",103.3]]},r.createElement(bo,null,"Our data source"),r.createElement(xo,null),r.createElement(wo,null,r.createElement(Zo,{src:"/img/explore-logo-layer-0.png",alt:"OSSInsight Explore Logo"}),"GitHub Data Explorer for",r.createElement(Zo,{src:"/img/logo-small.png",alt:"OSSInsight Logo"}),"Open Source Software Insight"))}const yo=(0,x.ZP)(un)`
  .${sn.content} {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 12px;
  }
`,bo=(0,x.ZP)("div")`
  font-weight: 600;
  font-size: 32px;
  line-height: 150.02%;

  background: linear-gradient(90deg, #FFBCA7 2.21%, #DAA3D8 30.93%, #B587FF 67.95%, #6B7AFF 103.3%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`,xo=(0,x.ZP)(fo)`
  max-width: 90%;
  margin-top: 12px;
`,Zo=(0,x.ZP)("img")`
  height: 24px;
  margin: 0 8px;
  vertical-align: text-bottom;
`,wo=(0,x.ZP)("div")`
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 180%;
  /* or 29px */
  color: #FFFFFF;
  margin-top: 12px;
  vertical-align: middle;
`,So=(0,r.forwardRef)(((e,t)=>r.createElement(Ao,(0,rn.Z)({ref:t},e),r.createElement(jt.Z,{sx:{my:2}},"Get to know our data inside and out"),r.createElement(Co,null,r.createElement(vo,null),r.createElement(Dr,null))))),Ao=(0,x.ZP)("section")`
  margin-top: 16px;
  transform-origin: top center;
`,Co=(0,x.ZP)("div")`
  display: flex;
  align-items: stretch;
  gap: 16px;

  ${e=>{let{theme:t}=e;return t.breakpoints.down("md")}} {
    flex-direction: column;
  }

  > * {
    flex: 1;
  }
`;function Io(e){let{onResultEnter:t,onResultExit:n,onResultEntered:a,onResultExited:o}=e;const{question:i,phase:c,error:s}=le(),[u,d]=(0,r.useState)(!1),[h,g]=(0,r.useState)(!1);(0,r.useEffect)((()=>{g(!1)}),[null==i?void 0:i.id]);const p=(0,r.useMemo)((()=>{const e=ko.has(c);return!u&&e?i:void 0}),[u,c,i]),E=(0,r.useMemo)((()=>!!h&&(!!To.has(c)||(0,l.nf)(i)&&ce(i))),[h,c,i]),f=(0,m.Z)((()=>{null==t||t(null==p?void 0:p.id)})),v=(0,m.Z)((()=>{null==a||a(null==p?void 0:p.id),(0,l.nf)(p)&&g(!0)})),y=(0,m.Z)((()=>{null==n||n(null==p?void 0:p.id),(0,l.nf)(p)&&g(!1)})),b=(0,m.Z)((()=>{null==o||o(null==p?void 0:p.id)})),x=(0,m.Z)((()=>{d(!0)})),Z=(0,m.Z)((()=>{d(!1)})),w=(0,m.Z)((()=>{c!==ee.EXECUTE_FAILED&&g(!1)})),S=(0,m.Z)((()=>{c!==ee.EXECUTE_FAILED&&g(!0)}));return r.createElement(r.Fragment,null,r.createElement(sa,{question:i,phase:c,error:s,onPromptsStart:x,onPromptsReady:Z,onErrorMessageStart:w,onErrorMessageReady:S}),r.createElement(qr.Z,{mode:"out-in"},r.createElement(Xt.Z,{key:`result-${(null==p?void 0:p.id)??""}`,onEnter:f,onEntered:v,onExit:y,onExited:b},r.createElement(wr,{style:{transformOrigin:"top center"},question:p,phase:c,error:s}))),r.createElement(Xt.Z,{in:E,unmountOnExit:!0},r.createElement(So,null)))}const ko=new Set([ee.CREATED,ee.QUEUEING,ee.EXECUTING,ee.EXECUTE_FAILED,ee.VISUALIZE_FAILED,ee.UNKNOWN_ERROR,ee.READY,ee.SUMMARIZING]),To=new Set([ee.VALIDATE_SQL_FAILED,ee.GENERATE_SQL_FAILED,ee.EXECUTE_FAILED,ee.CREATE_FAILED]);function Lo(e){let{onChange:t,value:n}=e;const{data:a=[]}=(0,Bt.ZP)("explore-tags",{fetcher:d,revalidateOnFocus:!1,revalidateOnReconnect:!1});return r.createElement(Mo,null,r.createElement(Ro,null,r.createElement(Po,{color:"#ccc",className:(0,an.Z)({[No.active]:null==n}),onClick:e=>{null==t||t(e,null)}},"All"),r.createElement(Fo,{orientation:"vertical",flexItem:!0}),a.map((e=>r.createElement(Po,{key:e.id,color:e.color,className:(0,an.Z)({[No.active]:e.id===(null==n?void 0:n.id)}),onClick:n=>{null==t||t(n,e)}},e.label)))))}const No=(0,en.Z)("TagItem",["active"]),Ro=(0,x.ZP)("div")`
  display: flex;
  flex-wrap: wrap;
  margin-right: -16px;
  margin-bottom: -12px;
`,Fo=(0,x.ZP)(jt.Z)`
  margin-bottom: 12px;
  margin-right: 16px;
`,Po=(0,x.ZP)("span",{shouldForwardProp:e=>"color"!==e})`
  display: inline-block;
  color: ${e=>{let{color:t}=e;return t}};
  background-color: ${e=>{let{color:t}=e;return(0,rt.Fq)(t,.1)}};
  border: 1px solid ${e=>{let{color:t}=e;return(0,rt.Fq)(t,.3)}};
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
  margin-right: 8px;
  margin-bottom: 12px;

  &:hover {
    color: ${e=>{let{color:t}=e;return(0,rt._j)(t,.6)}};
    background-color: ${e=>{let{color:t}=e;return(0,rt.Fq)(t,.8)}};
    border-color: ${e=>{let{color:t}=e;return(0,rt.Fq)(t,.8)}};
  }

  &.${No.active} {
    color: ${e=>{let{color:t}=e;return(0,rt._j)(t,.6)}};
    background-color: ${e=>{let{color:t}=e;return t}};
    border-color: ${e=>{let{color:t}=e;return t}};
    font-weight: bold;
  }
`,Mo=(0,x.ZP)("div")`
  margin-bottom: 16px;
`;var qo=n(32440),Go=n(91680);function Do(e){let{n:t,tagId:n}=e;const{data:a=[],loading:o}=Qt(!1,t,n),[l,i]=(0,r.useState)(!1),[c,s]=(0,r.useState)(!1);(0,r.useEffect)((()=>{s(a.length>20)}),[a]);const u=(0,r.useMemo)((()=>l?a:a.slice(0,20)),[a,l]),d=(0,N.Z)((()=>{i(!0)})),m=(0,N.Z)((()=>{Cn("explore-questions-list",!1)(),i(!1)}));return r.createElement(_o,{id:"explore-questions-list"},r.createElement(Ht,{n:t,disabled:o,questions:u,variant:"text",questionPrefix:r.createElement(qo.Z,{sx:{color:"#959595",verticalAlign:"text-bottom"},color:"inherit",fontSize:"inherit"}),showTags:!0}),!l&&c&&r.createElement(jt.Z,null,r.createElement(Jn.Z,{variant:"text",color:"inherit",onClick:d},"See More")),l&&c&&r.createElement(jt.Z,null,r.createElement(T.Z,{color:"inherit",onClick:m},r.createElement(Go.Z,null))))}const _o=(0,x.ZP)("div")`
  scroll-margin: 140px;
`,$o=[{question:"How diverse is django's community (by coders' distribution)",questionId:"75404c1b-790f-421c-b530-49b6d336290d",imageUrl:n(64731).Z,tags:[{id:2,label:"Repositories",color:"#a3fcc8",sort:2,createdAt:"2023-01-19T02:36:34.000+00:00"}]},{question:"Summary of @gvanrossum's contribution by event type in 2022",questionId:"8ff46822-4637-4632-8306-81e3e28333d2",imageUrl:n(94486).Z,tags:[{id:1,label:"Developers",color:"#f2ac99",sort:1,createdAt:"2023-01-19T02:36:34.000+00:00"}]}];function Oo(){const[e,t]=(0,r.useState)(null),n=(0,N.Z)(((e,n)=>{t(n)}));return r.createElement(Nt.ZP,{container:!0,spacing:4},r.createElement(Nt.ZP,{item:!0,xs:12,md:5,lg:4},r.createElement(at.Z,{variant:"h3",fontSize:16,mb:2},"\ud83d\udca1 Popular questions"),$o.map(((e,t)=>r.createElement(Gt,(0,rn.Z)({key:t},e)))),r.createElement(mn,{sx:{mt:2},utmContent:"home_left"})),r.createElement(Nt.ZP,{item:!0,xs:12,md:7,lg:8},r.createElement(Lo,{value:e,onChange:n}),r.createElement(y.Z,null,r.createElement(Do,{n:100,tagId:(null==e?void 0:e.id)??void 0}))))}function zo(e){const{marginTop:t,marginBottom:n}=getComputedStyle(e);return e.offsetHeight+parseFloat(t)+parseFloat(n)}function Bo(e){let{state:t,transitionDelay:n=0,transitionDuration:a=400,offset:o=120,direction:i="up",revert:c=!1,children:s}=e;const u=(0,r.useRef)(null),d=(0,r.useRef)(null),[m,h]=(0,r.useState)();(0,r.useEffect)((()=>{if(2!==s.length)throw new Error("SwitchLayout should have exactly two children");if((0,l.Rw)(s[0].key)||(0,l.Rw)(s[1].key))throw new Error("SwitchLayout's children must have keys")}),[]);const g=(0,N.Z)((()=>{(0,l.nf)(u.current)&&h(zo(u.current))})),p=(0,N.Z)((()=>{(0,l.nf)(d.current)&&h(zo(d.current))})),E=(0,N.Z)((()=>{h(void 0)})),f=(0,N.Z)((()=>{(0,l.nf)(d.current)&&h(zo(d.current))})),v=(0,N.Z)((()=>{(0,l.nf)(u.current)&&h(zo(u.current))})),y=(0,N.Z)((()=>{h(void 0)})),b=n+a;return r.createElement(Uo,{offset:o,style:{height:m},duration:a,delay:n},r.createElement(ye.ZP,{key:s[0].key,in:t===s[0].key,timeout:b,unmountOnExit:!0,onExit:g,onExiting:p,onExited:E},(e=>r.createElement(Qo,{ref:u,className:`SwitchItem-${i} SwitchItem-${e}`,duration:a,delay:n,offset:o},s[0]))),r.createElement(ye.ZP,{key:s[1].key,in:t===s[1].key,timeout:b,unmountOnExit:!0,onExit:f,onExiting:v,onExited:y},(e=>r.createElement(Qo,{ref:d,className:`SwitchItem-${c?"up"===i?"down":"up":i} SwitchItem-${e}`,duration:a,delay:n,offset:o},s[1]))))}const Uo=(0,x.ZP)("div",{name:"SwitchLayoutContainer",shouldForwardProp:e=>!["duration","delay","offset"].includes(String(e))})`
  position: relative;
  transition: ${e=>{let{theme:t,duration:n,delay:a}=e;return t.transitions.create("height",{duration:n,delay:a})}};
`,Qo=(0,x.ZP)("div",{name:"SwitchItem",shouldForwardProp:e=>!["offset","duration","delay"].includes(String(e))})`
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
`;var Ho=n(67358),Vo=n(22797),Wo=n(38895),Ko=n(8976),Yo=n(6514),jo=n(37645),Xo=n(50480),Jo=n(59653),el=n(50135),tl=n(31812),nl=n(9873),al=n(234),rl=n(78046);function ol(){const[e,t]=(0,r.useState)(!1),{question:n,recommend:a,updateTags:i}=le(),{data:c=[],isValidating:s}=(0,Bt.ZP)("explore-tags",{fetcher:d,revalidateOnFocus:!1,revalidateOnReconnect:!1}),{data:u,isValidating:h,mutate:g}=(0,Bt.ZP)((0,l.nf)(n)?[n.id,"question:tags"]:void 0,{fetcher:async e=>await async function(e){return await o.po.get(`/explorer/questions/${e}/tags`)}(e)}),[p,E]=(0,r.useState)(u??[]),{run:f,loading:v}=(0,ja.c)({ids:p.map((e=>e.id))},i,"admin-settings");(0,r.useEffect)((()=>{E((u??[]).map((e=>c.find((t=>t.id===e.id))??e)))}),[u]);const y=(0,m.Z)((()=>{t(!1)}));(0,r.useEffect)((()=>{if((0,l.nf)(n)){const e=e=>{"1"===e.key&&e.ctrlKey&&t(!0)};return window.addEventListener("keypress",e,{passive:!0}),()=>{window.removeEventListener("keypress",e)}}}),[n]);const b=(0,m.Z)(((e,t)=>{a(t).then((async()=>await g()))}));return n?r.createElement(ir.Z,{open:e,onClose:y,maxWidth:"md",fullWidth:!0},r.createElement(jo.Z,null,"Question Settings"),r.createElement(Yo.Z,null,r.createElement(cl,null,r.createElement(Xo.Z,{disabled:(0,l.Rw)(n.recommended),control:r.createElement(Jo.Z,{size:"small",checked:n.recommended,onChange:b,name:"Recommend"}),label:"Recommend"})),r.createElement(cl,null,r.createElement(Ke.Z,{spacing:2,direction:"row"},r.createElement(Ko.Z,{sx:{flex:1},multiple:!0,size:"small",disabled:s||h||v,value:p,onChange:(e,t)=>E(t),options:c,getOptionLabel:e=>e.label,renderInput:e=>r.createElement(el.Z,(0,rn.Z)({},e,{label:"Tags",variant:"standard"})),loading:s||h}),r.createElement(tl.Z,{loading:v||s||h,onClick:f},"UPDATE TAGS"))),r.createElement(cl,null,r.createElement(Ho.Z,null,r.createElement(Wo.Z,null,"DEBUG INFO"),r.createElement(Vo.Z,null,r.createElement(ll,{question:n})))))):r.createElement(r.Fragment,null)}function ll(e){let{question:t}=e;return r.createElement(nl.Z,{disableSelection:!0,defaultCollapseIcon:r.createElement($.Z,null),defaultExpandIcon:r.createElement(rl.Z,null)},Object.entries(t).map((e=>{let[t,n]=e;return r.createElement(il,{key:t,label:t,value:n,path:[t]})})))}function il(e){let{label:t,value:n,path:a}=e;const o=a.join(".");return(0,l.Rw)(n)?r.createElement(al.Z,{nodeId:o,label:r.createElement(r.Fragment,null,r.createElement(sl,null,t,": "),r.createElement(ml,null,"null"))}):"object"==typeof n?n instanceof Array?r.createElement(al.Z,{nodeId:o,label:r.createElement(sl,null,t,": ")},n.map(((e,t)=>r.createElement(il,{key:t,label:`${t}`,value:e,path:a.concat(t)})))):r.createElement(al.Z,{nodeId:o,label:r.createElement(sl,null,t,": ")},Object.entries(n).map((e=>{let[t,n]=e;return r.createElement(il,{key:t,label:t,value:n,path:a.concat(t)})}))):"number"==typeof n?r.createElement(al.Z,{nodeId:o,label:r.createElement(r.Fragment,null,r.createElement(sl,null,t,": "),r.createElement(dl,null,n))}):"boolean"==typeof n?r.createElement(al.Z,{nodeId:o,label:r.createElement(r.Fragment,null,r.createElement(sl,null,t,": "),r.createElement(ml,null,String(n)))}):r.createElement(al.Z,{nodeId:o,label:r.createElement(r.Fragment,null,r.createElement(sl,null,t,": "),r.createElement(ul,null,n))})}const cl=(0,x.ZP)("div")`
  margin-top: 24px;
`,sl=(0,x.ZP)("span")`
  font-weight: bold;
  color: #9876AA;
`,ul=(0,x.ZP)("span")`
  color: #6A8759;
`,dl=(0,x.ZP)("span")`
  color: #6897BB;
`,ml=(0,x.ZP)("span")`
  color: #CC7832;
`;function hl(e){let{state:t,...n}=e;return r.createElement(Bo,{state:t,direction:"recommend"===t?"down":"up"},r.createElement(y.Z,{key:"execution",sx:{mt:1.5}},r.createElement(ve.Z,null,r.createElement(Io,n),r.createElement(ol,null))),r.createElement(y.Z,{key:"recommend",sx:{mt:4}},r.createElement(Oo,null)))}function gl(){const[e,t]=(0,r.useState)(""),{questionId:n,handleClear:a,handleAction:o,handleSelect:i,handleSelectId:c,questionValues:s}=function(e){let[t,n]=e;const a=re({pollInterval:2e3}),[o,i]=(0,ue.ZP)("id",(0,ue.Rc)(),!0),{question:c,loading:s,load:u,reset:d,create:m,isResultPending:h}=a;(0,r.useEffect)((()=>{(0,l.nf)(c)&&n(c.title)}),[null==c?void 0:c.title]),(0,r.useEffect)((()=>{(0,l.nf)(o)?u(o):p()}),[o]),(0,r.useEffect)((()=>{(0,l.nf)(null==c?void 0:c.id)&&i(null==c?void 0:c.id)}),[s,null==c?void 0:c.id]);const g=(0,N.Z)((e=>{h||m(t,e)})),p=(0,N.Z)((()=>{d(),n(""),i(void 0)})),E=(0,N.Z)((e=>{n(e),m(e,!1)})),f=(0,N.Z)(((e,t)=>{o!==e&&(n(t??""),u(e))}));return{questionValues:a,handleClear:p,handleAction:g,handleSelect:E,handleSelectId:f,questionId:o}}([e,t]),{question:u,loading:d,phase:m,isResultPending:h}=s,g=h||(0,l.oM)(e),p=""===e,E=(0,l.Rw)(null==u?void 0:u.id)&&(0,l.Rw)(n)&&!d&&m!==ee.CREATE_FAILED,f=!E,v=(0,r.useMemo)((()=>m!==ee.CREATE_FAILED&&m!==ee.EXECUTE_FAILED&&m!==ee.VALIDATE_SQL_FAILED&&m!==ee.GENERATE_SQL_FAILED&&(!(0,l.nf)(u)||!ce(u))),[m,u]);return r.createElement(oe.Provider,{value:s},r.createElement(de.Provider,{value:{search:e,handleSelect:i,handleSelectId:c}},r.createElement(me,null),r.createElement(Ze,{showSide:f,showHeader:E,header:r.createElement($e,null),side:e=>r.createElement(vn,{headerHeight:e,showAds:v})},r.createElement(et,{value:e,onChange:t,onAction:o,disableInput:h,disableClear:p,disableAction:g,onClear:a,clearState:h?"stop":void 0}),r.createElement(hl,{state:E?"recommend":"execution"})),r.createElement(xt,null)))}function pl(){return r.createElement(a.Z,{title:"GitHub Data Explorer: Discover insights in GitHub event data with AI-generated SQL",description:"Simply ask your question in natural language and Data Explore will generate SQL, query the data, and present the results visually.",keywords:"GitHub data, text to SQL, query tool, GitHub Data Explorer, GPT-3, AI-generated SQL",image:"/img/data-explorer-thumbnail.png",tidbCloudLinkCampaign:"chat2query_202301",tidbCloudLinkTrial:!0},r.createElement(gl,null))}},8106:(e,t,n)=>{n.d(t,{Z:()=>c});var a=n(67294),r=n(86010),o=n(95999),l=n(25108);const i={copyButtonCopied:"copyButtonCopied__QnY",copyButtonIcons:"copyButtonIcons_FhaS",copyButtonIcon:"copyButtonIcon_phi_",copyButtonSuccessIcon:"copyButtonSuccessIcon_FfTR"};function c(e){let{code:t,className:n}=e;const[c,s]=(0,a.useState)(!1),u=(0,a.useRef)(void 0),d=(0,a.useCallback)((()=>{var e;e=t,navigator.clipboard.writeText(e).catch(l.error),s(!0),u.current=window.setTimeout((()=>{s(!1)}),1e3)}),[t]);return(0,a.useEffect)((()=>()=>window.clearTimeout(u.current)),[]),a.createElement("button",{type:"button","aria-label":c?(0,o.I)({id:"theme.CodeBlock.copied",message:"Copied",description:"The copied button label on code blocks"}):(0,o.I)({id:"theme.CodeBlock.copyButtonAriaLabel",message:"Copy code to clipboard",description:"The ARIA label for copy code blocks button"}),title:(0,o.I)({id:"theme.CodeBlock.copy",message:"Copy",description:"The copy button label on code blocks"}),className:(0,r.Z)("clean-btn",n,i.copyButton,c&&i.copyButtonCopied),onClick:d},a.createElement("span",{className:i.copyButtonIcons,"aria-hidden":"true"},a.createElement("svg",{className:i.copyButtonIcon,viewBox:"0 0 24 24"},a.createElement("path",{d:"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"})),a.createElement("svg",{className:i.copyButtonSuccessIcon,viewBox:"0 0 24 24"},a.createElement("path",{d:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}))))}},88242:(e,t,n)=>{n.d(t,{Z:()=>c});var a=n(87462),r=n(47654),o=n(67294),l=n(61802),i=n(5616);function c(e){let{children:t,header:n,dark:c,sideWidth:s,Side:u,footer:d=!0,...m}=e;return(0,o.useLayoutEffect)((()=>{var e;const t=location.hash.replace(/^#/,"");null==(e=document.getElementById(t))||e.scrollIntoView()}),[]),o.createElement(r.Z,(0,a.Z)({},m,{customFooter:d,header:n,sideWidth:s,side:s&&(0,l.nf)(u)?o.createElement(i.Z,{component:"aside",width:s,position:"sticky",top:"calc(var(--ifm-navbar-height) + 76px)",height:0,zIndex:0},o.createElement(i.Z,{marginTop:"-76px",height:"calc(100vh - var(--ifm-navbar-height))"},o.createElement(u,null))):void 0}),o.createElement("div",{hidden:!0,style:{height:72}}),o.createElement("div",{style:{paddingLeft:s,paddingRight:s}},o.createElement("main",{style:{"--ifm-container-width-xl":"1200px"}},t)))}},1969:(e,t,n)=>{function a(e){const t=Object.entries(e).filter((e=>{let[,t]=e;return null!=t})).map((e=>{let[t,n]=e;return`${encodeURIComponent(t)}=${encodeURIComponent(String(n))}`}));return t.length>0?`?${t.join("&")}`:""}function r(e,t){let{title:n,via:r,hashtags:o=[],related:l=[]}=t;return"https://twitter.com/share"+a({url:e,text:n,via:r,hashtags:o.length>0?o.join(","):void 0,related:l.length>0?l.join(","):void 0})}function o(e,t){let{title:n,summary:r,source:o}=t;return"https://linkedin.com/shareArticle"+a({url:e,mini:"true",title:n,summary:r,source:o})}function l(e,t){let{title:n}=t;return"https://www.reddit.com/submit"+a({url:e,title:n})}function i(e,t){let{title:n}=t;return"https://telegram.me/share/url"+a({url:e,text:n})}n.d(t,{$Z:()=>l,BE:()=>o,OA:()=>i,PE:()=>r})},74040:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/ads-2-8c18bf4d4e6474bc44753df306c3b501.png"},10744:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/ads-prompts-5ada2bd55c29fafc21852128faf6e561.png"},64731:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/img1-79dc4acc44456d51dfe3db748dff5e1d.png"},94486:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/img2-eaddb15a27b813952442c1e6ef733101.png"}}]);