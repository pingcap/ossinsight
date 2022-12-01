"use strict";(self.webpackChunkweb=self.webpackChunkweb||[]).push([[8465],{819:(e,t,a)=>{a.r(t),a.d(t,{default:()=>u});var l=a(67294),n=a(70754),i=a(22841),r=a(81719),d=a(55118),c=a(45303),s=a(61802),o=a(84191);function u(){const{userInfo:e,validating:t,validated:a,mutate:n}=(0,c.Pc)(),[r,u]=(0,l.useState)(!1),p=(0,l.useMemo)((()=>(0,s.N6)(null==e?void 0:e.emailGetUpdates)),[null==e?void 0:e.emailGetUpdates]),b=(0,l.useCallback)(((e,t)=>{a&&!r&&(u(!0),o.po.put("/user/email-updates",{enable:t},{withCredentials:!0}).then((async e=>await n((t=>(t&&Object.assign(t,e),t)),{revalidate:!1}))).finally((()=>u(!1))))}),[a,r,e]),h=!a||r,f=t||r,g=l.createElement(m,{loading:f,disabled:h});return l.createElement(i.Z,{control:l.createElement(d.Z,{checked:p,disabled:h,icon:g,checkedIcon:g,onChange:b}),label:"Email Notification"})}const p=(0,r.ZP)("span")`
  background-color: ${e=>{let{theme:t,disabled:a}=e;return a?t.palette.grey.A700:t.palette.primary.main}};
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;function m(e){let{loading:t,disabled:a}=e;return l.createElement(p,{disabled:a},t&&l.createElement(n.Z,{size:16,color:"primary"}))}}}]);