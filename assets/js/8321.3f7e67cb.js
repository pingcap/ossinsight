"use strict";(self.webpackChunkweb=self.webpackChunkweb||[]).push([[8321],{50480:(e,t,a)=>{a.d(t,{Z:()=>$});var r=a(63366),o=a(87462),l=a(67294),i=a(63961),s=a(94780),n=a(74423),c=a(51233),d=a(15861),p=a(98216),u=a(90948),h=a(28628),m=a(1588),b=a(34867);function g(e){return(0,b.ZP)("MuiFormControlLabel",e)}const v=(0,m.Z)("MuiFormControlLabel",["root","labelPlacementStart","labelPlacementTop","labelPlacementBottom","disabled","label","error","required","asterisk"]);var k=a(15704),Z=a(85893);const w=["checked","className","componentsProps","control","disabled","disableTypography","inputRef","label","labelPlacement","name","onChange","required","slotProps","value"],f=(0,u.ZP)("label",{name:"MuiFormControlLabel",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:a}=e;return[{[`& .${v.label}`]:t.label},t.root,t[`labelPlacement${(0,p.Z)(a.labelPlacement)}`]]}})((({theme:e,ownerState:t})=>(0,o.Z)({display:"inline-flex",alignItems:"center",cursor:"pointer",verticalAlign:"middle",WebkitTapHighlightColor:"transparent",marginLeft:-11,marginRight:16,[`&.${v.disabled}`]:{cursor:"default"}},"start"===t.labelPlacement&&{flexDirection:"row-reverse",marginLeft:16,marginRight:-11},"top"===t.labelPlacement&&{flexDirection:"column-reverse",marginLeft:16},"bottom"===t.labelPlacement&&{flexDirection:"column",marginLeft:16},{[`& .${v.label}`]:{[`&.${v.disabled}`]:{color:(e.vars||e).palette.text.disabled}}}))),y=(0,u.ZP)("span",{name:"MuiFormControlLabel",slot:"Asterisk",overridesResolver:(e,t)=>t.asterisk})((({theme:e})=>({[`&.${v.error}`]:{color:(e.vars||e).palette.error.main}}))),$=l.forwardRef((function(e,t){var a,u;const m=(0,h.i)({props:e,name:"MuiFormControlLabel"}),{className:b,componentsProps:v={},control:$,disabled:x,disableTypography:P,label:S,labelPlacement:C="end",required:R,slotProps:F={}}=m,B=(0,r.Z)(m,w),z=(0,n.Z)(),N=null!=(a=null!=x?x:$.props.disabled)?a:null==z?void 0:z.disabled,j=null!=R?R:$.props.required,q={disabled:N,required:j};["checked","name","onChange","value","inputRef"].forEach((e=>{void 0===$.props[e]&&void 0!==m[e]&&(q[e]=m[e])}));const M=(0,k.Z)({props:m,muiFormControl:z,states:["error"]}),I=(0,o.Z)({},m,{disabled:N,labelPlacement:C,required:j,error:M.error}),L=(e=>{const{classes:t,disabled:a,labelPlacement:r,error:o,required:l}=e,i={root:["root",a&&"disabled",`labelPlacement${(0,p.Z)(r)}`,o&&"error",l&&"required"],label:["label",a&&"disabled"],asterisk:["asterisk",o&&"error"]};return(0,s.Z)(i,g,t)})(I),O=null!=(u=F.typography)?u:v.typography;let T=S;return null==T||T.type===d.Z||P||(T=(0,Z.jsx)(d.Z,(0,o.Z)({component:"span"},O,{className:(0,i.Z)(L.label,null==O?void 0:O.className),children:T}))),(0,Z.jsxs)(f,(0,o.Z)({className:(0,i.Z)(L.root,b),ownerState:I,ref:t},B,{children:[l.cloneElement($,q),j?(0,Z.jsxs)(c.Z,{display:"block",children:[T,(0,Z.jsxs)(y,{ownerState:I,"aria-hidden":!0,className:L.asterisk,children:["\u2009","*"]})]}):T]}))}))},45843:(e,t,a)=>{a.d(t,{Z:()=>$});var r=a(63366),o=a(87462),l=a(67294),i=a(63961),s=a(94780),n=a(2101),c=a(98216),d=a(21964),p=a(90948),u=a(28628),h=a(1588),m=a(34867);function b(e){return(0,m.ZP)("MuiSwitch",e)}const g=(0,h.Z)("MuiSwitch",["root","edgeStart","edgeEnd","switchBase","colorPrimary","colorSecondary","sizeSmall","sizeMedium","checked","disabled","input","thumb","track"]);var v=a(85893);const k=["className","color","edge","size","sx"],Z=(0,p.ZP)("span",{name:"MuiSwitch",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:a}=e;return[t.root,a.edge&&t[`edge${(0,c.Z)(a.edge)}`],t[`size${(0,c.Z)(a.size)}`]]}})({display:"inline-flex",width:58,height:38,overflow:"hidden",padding:12,boxSizing:"border-box",position:"relative",flexShrink:0,zIndex:0,verticalAlign:"middle","@media print":{colorAdjust:"exact"},variants:[{props:{edge:"start"},style:{marginLeft:-8}},{props:{edge:"end"},style:{marginRight:-8}},{props:{size:"small"},style:{width:40,height:24,padding:7,[`& .${g.thumb}`]:{width:16,height:16},[`& .${g.switchBase}`]:{padding:4,[`&.${g.checked}`]:{transform:"translateX(16px)"}}}}]}),w=(0,p.ZP)(d.Z,{name:"MuiSwitch",slot:"SwitchBase",overridesResolver:(e,t)=>{const{ownerState:a}=e;return[t.switchBase,{[`& .${g.input}`]:t.input},"default"!==a.color&&t[`color${(0,c.Z)(a.color)}`]]}})((({theme:e})=>({position:"absolute",top:0,left:0,zIndex:1,color:e.vars?e.vars.palette.Switch.defaultColor:`${"light"===e.palette.mode?e.palette.common.white:e.palette.grey[300]}`,transition:e.transitions.create(["left","transform"],{duration:e.transitions.duration.shortest}),[`&.${g.checked}`]:{transform:"translateX(20px)"},[`&.${g.disabled}`]:{color:e.vars?e.vars.palette.Switch.defaultDisabledColor:`${"light"===e.palette.mode?e.palette.grey[100]:e.palette.grey[600]}`},[`&.${g.checked} + .${g.track}`]:{opacity:.5},[`&.${g.disabled} + .${g.track}`]:{opacity:e.vars?e.vars.opacity.switchTrackDisabled:""+("light"===e.palette.mode?.12:.2)},[`& .${g.input}`]:{left:"-100%",width:"300%"}})),(({theme:e})=>({"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette.action.activeChannel} / ${e.vars.palette.action.hoverOpacity})`:(0,n.Fq)(e.palette.action.active,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},variants:[...Object.entries(e.palette).filter((([,e])=>e.main&&e.light)).map((([t])=>({props:{color:t},style:{[`&.${g.checked}`]:{color:(e.vars||e).palette[t].main,"&:hover":{backgroundColor:e.vars?`rgba(${e.vars.palette[t].mainChannel} / ${e.vars.palette.action.hoverOpacity})`:(0,n.Fq)(e.palette[t].main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},[`&.${g.disabled}`]:{color:e.vars?e.vars.palette.Switch[`${t}DisabledColor`]:`${"light"===e.palette.mode?(0,n.$n)(e.palette[t].main,.62):(0,n._j)(e.palette[t].main,.55)}`}},[`&.${g.checked} + .${g.track}`]:{backgroundColor:(e.vars||e).palette[t].main}}})))]}))),f=(0,p.ZP)("span",{name:"MuiSwitch",slot:"Track",overridesResolver:(e,t)=>t.track})((({theme:e})=>({height:"100%",width:"100%",borderRadius:7,zIndex:-1,transition:e.transitions.create(["opacity","background-color"],{duration:e.transitions.duration.shortest}),backgroundColor:e.vars?e.vars.palette.common.onBackground:`${"light"===e.palette.mode?e.palette.common.black:e.palette.common.white}`,opacity:e.vars?e.vars.opacity.switchTrack:""+("light"===e.palette.mode?.38:.3)}))),y=(0,p.ZP)("span",{name:"MuiSwitch",slot:"Thumb",overridesResolver:(e,t)=>t.thumb})((({theme:e})=>({boxShadow:(e.vars||e).shadows[1],backgroundColor:"currentColor",width:20,height:20,borderRadius:"50%"}))),$=l.forwardRef((function(e,t){const a=(0,u.i)({props:e,name:"MuiSwitch"}),{className:l,color:n="primary",edge:d=!1,size:p="medium",sx:h}=a,m=(0,r.Z)(a,k),g=(0,o.Z)({},a,{color:n,edge:d,size:p}),$=(e=>{const{classes:t,edge:a,size:r,color:l,checked:i,disabled:n}=e,d={root:["root",a&&`edge${(0,c.Z)(a)}`,`size${(0,c.Z)(r)}`],switchBase:["switchBase",`color${(0,c.Z)(l)}`,i&&"checked",n&&"disabled"],thumb:["thumb"],track:["track"],input:["input"]},p=(0,s.Z)(d,b,t);return(0,o.Z)({},t,p)})(g),x=(0,v.jsx)(y,{className:$.thumb,ownerState:g});return(0,v.jsxs)(Z,{className:(0,i.Z)($.root,l),sx:h,ownerState:g,children:[(0,v.jsx)(w,(0,o.Z)({type:"checkbox",icon:x,checkedIcon:x,ref:t,ownerState:g},m,{classes:(0,o.Z)({},$,{root:$.switchBase})})),(0,v.jsx)(f,{className:$.track,ownerState:g})]})}))},21964:(e,t,a)=>{a.d(t,{Z:()=>f});var r=a(63366),o=a(87462),l=a(67294),i=a(63961),s=a(94780),n=a(98216),c=a(90948),d=a(14136),p=a(49299),u=a(74423),h=a(49990),m=a(1588),b=a(34867);function g(e){return(0,b.ZP)("PrivateSwitchBase",e)}(0,m.Z)("PrivateSwitchBase",["root","checked","disabled","input","edgeStart","edgeEnd"]);var v=a(85893);const k=["autoFocus","checked","checkedIcon","className","defaultChecked","disabled","disableFocusRipple","edge","icon","id","inputProps","inputRef","name","onBlur","onChange","onFocus","readOnly","required","tabIndex","type","value"],Z=(0,c.ZP)(h.Z)((({ownerState:e})=>(0,o.Z)({padding:9,borderRadius:"50%"},"start"===e.edge&&{marginLeft:"small"===e.size?-3:-12},"end"===e.edge&&{marginRight:"small"===e.size?-3:-12}))),w=(0,c.ZP)("input",{shouldForwardProp:d.Z})({cursor:"inherit",position:"absolute",opacity:0,width:"100%",height:"100%",top:0,left:0,margin:0,padding:0,zIndex:1}),f=l.forwardRef((function(e,t){const{autoFocus:a,checked:l,checkedIcon:c,className:d,defaultChecked:h,disabled:m,disableFocusRipple:b=!1,edge:f=!1,icon:y,id:$,inputProps:x,inputRef:P,name:S,onBlur:C,onChange:R,onFocus:F,readOnly:B,required:z=!1,tabIndex:N,type:j,value:q}=e,M=(0,r.Z)(e,k),[I,L]=(0,p.Z)({controlled:l,default:Boolean(h),name:"SwitchBase",state:"checked"}),O=(0,u.Z)();let T=m;O&&void 0===T&&(T=O.disabled);const D="checkbox"===j||"radio"===j,E=(0,o.Z)({},e,{checked:I,disabled:T,disableFocusRipple:b,edge:f}),A=(e=>{const{classes:t,checked:a,disabled:r,edge:o}=e,l={root:["root",a&&"checked",r&&"disabled",o&&`edge${(0,n.Z)(o)}`],input:["input"]};return(0,s.Z)(l,g,t)})(E);return(0,v.jsxs)(Z,(0,o.Z)({component:"span",className:(0,i.Z)(A.root,d),centerRipple:!0,focusRipple:!b,disabled:T,tabIndex:null,role:void 0,onFocus:e=>{F&&F(e),O&&O.onFocus&&O.onFocus(e)},onBlur:e=>{C&&C(e),O&&O.onBlur&&O.onBlur(e)},ownerState:E,ref:t},M,{children:[(0,v.jsx)(w,(0,o.Z)({autoFocus:a,checked:l,defaultChecked:h,className:A.input,disabled:T,id:D?$:void 0,name:S,onChange:e=>{if(e.nativeEvent.defaultPrevented)return;const t=e.target.checked;L(t),R&&R(e,t)},readOnly:B,ref:P,required:z,ownerState:E,tabIndex:N,type:j},"checkbox"===j&&void 0===q?{}:{value:q},x)),I?c:y]}))}))}}]);