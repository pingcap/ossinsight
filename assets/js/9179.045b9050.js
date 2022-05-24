(self.webpackChunkdocus=self.webpackChunkdocus||[]).push([[9179],{95318:function(t){t.exports=function(t){return t&&t.__esModule?t:{default:t}},t.exports.__esModule=!0,t.exports.default=t.exports},64938:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return r.createSvgIcon}});var r=n(76031)},66242:function(t,e,n){"use strict";n.d(e,{Z:function(){return v}});var r=n(87462),a=n(63366),o=n(67294),i=n(86010),s=n(94780),u=n(90948),c=n(71657),l=n(55113),d=n(34867);function f(t){return(0,d.Z)("MuiCard",t)}(0,n(1588).Z)("MuiCard",["root"]);var h=n(85893);const p=["className","raised"],m=(0,u.ZP)(l.Z,{name:"MuiCard",slot:"Root",overridesResolver:(t,e)=>e.root})((()=>({overflow:"hidden"})));var v=o.forwardRef((function(t,e){const n=(0,c.Z)({props:t,name:"MuiCard"}),{className:o,raised:u=!1}=n,l=(0,a.Z)(n,p),d=(0,r.Z)({},n,{raised:u}),v=(t=>{const{classes:e}=t;return(0,s.Z)({root:["root"]},f,e)})(d);return(0,h.jsx)(m,(0,r.Z)({className:(0,i.Z)(v.root,o),elevation:u?8:void 0,ref:e,ownerState:d},l))}))},88078:function(t,e,n){"use strict";n.d(e,{Z:function(){return N}});var r=n(63366),a=n(87462),o=n(67294),i=n(86010),s=n(70917),u=n(94780);function c(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function l(t){return parseFloat(t)}var d=n(41796),f=n(90948),h=n(71657),p=n(34867);function m(t){return(0,p.Z)("MuiSkeleton",t)}(0,n(1588).Z)("MuiSkeleton",["root","text","rectangular","circular","pulse","wave","withChildren","fitContent","heightAuto"]);var v=n(85893);const g=["animation","className","component","height","style","variant","width"];let Z,b,w,y,C=t=>t;const k=(0,s.F4)(Z||(Z=C`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`)),x=(0,s.F4)(b||(b=C`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`)),M=(0,f.ZP)("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:n}=t;return[e.root,e[n.variant],!1!==n.animation&&e[n.animation],n.hasChildren&&e.withChildren,n.hasChildren&&!n.width&&e.fitContent,n.hasChildren&&!n.height&&e.heightAuto]}})((({theme:t,ownerState:e})=>{const n=c(t.shape.borderRadius)||"px",r=l(t.shape.borderRadius);return(0,a.Z)({display:"block",backgroundColor:(0,d.Fq)(t.palette.text.primary,"light"===t.palette.mode?.11:.13),height:"1.2em"},"text"===e.variant&&{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${r}${n}/${Math.round(r/.6*10)/10}${n}`,"&:empty:before":{content:'"\\00a0"'}},"circular"===e.variant&&{borderRadius:"50%"},e.hasChildren&&{"& > *":{visibility:"hidden"}},e.hasChildren&&!e.width&&{maxWidth:"fit-content"},e.hasChildren&&!e.height&&{height:"auto"})}),(({ownerState:t})=>"pulse"===t.animation&&(0,s.iv)(w||(w=C`
      animation: ${0} 1.5s ease-in-out 0.5s infinite;
    `),k)),(({ownerState:t,theme:e})=>"wave"===t.animation&&(0,s.iv)(y||(y=C`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${0} 1.6s linear 0.5s infinite;
        background: linear-gradient(90deg, transparent, ${0}, transparent);
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `),x,e.palette.action.hover)));var N=o.forwardRef((function(t,e){const n=(0,h.Z)({props:t,name:"MuiSkeleton"}),{animation:o="pulse",className:s,component:c="span",height:l,style:d,variant:f="text",width:p}=n,Z=(0,r.Z)(n,g),b=(0,a.Z)({},n,{animation:o,component:c,variant:f,hasChildren:Boolean(Z.children)}),w=(t=>{const{classes:e,variant:n,animation:r,hasChildren:a,width:o,height:i}=t,s={root:["root",n,r,a&&"withChildren",a&&!o&&"fitContent",a&&!i&&"heightAuto"]};return(0,u.Z)(s,m,e)})(b);return(0,v.jsx)(M,(0,a.Z)({as:c,ref:e,className:(0,i.Z)(w.root,s),ownerState:b},Z,{style:(0,a.Z)({width:p,height:l},d)}))}))},76031:function(t,e,n){"use strict";n.r(e),n.d(e,{capitalize:function(){return a.Z},createChainedFunction:function(){return o},createSvgIcon:function(){return i.Z},debounce:function(){return s.Z},deprecatedPropType:function(){return u},isMuiElement:function(){return c.Z},ownerDocument:function(){return l.Z},ownerWindow:function(){return d.Z},requirePropFactory:function(){return f},setRef:function(){return h},unstable_ClassNameGenerator:function(){return y},unstable_useEnhancedEffect:function(){return p.Z},unstable_useId:function(){return m.Z},unsupportedProp:function(){return v},useControlled:function(){return g.Z},useEventCallback:function(){return Z.Z},useForkRef:function(){return b.Z},useIsFocusVisible:function(){return w.Z}});var r=n(37078),a=n(98216),o=n(49064).Z,i=n(88169),s=n(57144);var u=function(t,e){return()=>null},c=n(71579),l=n(8038),d=n(5340);n(87462);var f=function(t,e){return()=>null},h=n(7960).Z,p=n(58974),m=n(27909);var v=function(t,e,n,r,a){return null},g=n(49299),Z=n(2068),b=n(51705),w=n(18791);const y={configure:t=>{console.warn(["MUI: `ClassNameGenerator` import from `@mui/material/utils` is outdated and might cause unexpected issues.","","You should use `import { unstable_ClassNameGenerator } from '@mui/material/className'` instead","","The detail of the issue: https://github.com/mui/material-ui/issues/30011#issuecomment-1024993401","","The updated documentation: https://mui.com/guides/classname-generator/"].join("\n")),r.Z.configure(t)}}},40172:function(t,e,n){"use strict";e.ZP=e.oM=void 0;var r=o(n(19777)),a=o(n(43733));function o(t){return t&&t.__esModule?t:{default:t}}var i=r.default;e.ZP=i;var s=a.default;e.oM=s},19777:function(t,e,n){"use strict";e.__esModule=!0,e.default=void 0;var r=n(67294),a=n(85893),o=["className","children","ratio","style"];function i(){return i=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},i.apply(this,arguments)}var s="--aspect-ratio";class u extends r.Component{constructor(){super(...arguments),this.node=null,this.setNode=t=>{this.node=t}}componentDidUpdate(){if(this.node){var{node:t}=this;t.style.getPropertyValue(s)||t.style.setProperty(s,"("+this.props.ratio+")")}}render(){var t=this.props,{className:e,children:n,ratio:r,style:u}=t,c=function(t,e){if(null==t)return{};var n,r,a={},o=Object.keys(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,o),l=i({},u,{[s]:"("+r+")"});return(0,a.jsx)("div",i({className:e,ref:this.setNode,style:l},c,{children:n}))}}u.defaultProps={className:"react-aspect-ratio-placeholder",ratio:1};var c=u;e.default=c},43733:function(t,e,n){"use strict";e.__esModule=!0,e.default=void 0;var r=n(85893),a=["className","children","ratio","style"];function o(){return o=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},o.apply(this,arguments)}var i="react-aspect-ratio-placeholder";var s=function(t){var{className:e=i,children:n,ratio:s=1,style:u}=t,c=function(t,e){if(null==t)return{};var n,r,a={},o=Object.keys(t);for(r=0;r<o.length;r++)n=o[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,a),l=o({},u,{"--aspect-ratio":"("+s+")"});return(0,r.jsx)("div",o({className:e,style:l},c,{children:n}))};e.default=s}}]);