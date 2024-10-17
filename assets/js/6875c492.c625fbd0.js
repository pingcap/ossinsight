"use strict";(self.webpackChunkweb=self.webpackChunkweb||[]).push([[8610],{99703:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(67294),l=a(95999),o=a(32244);function r(e){const{metadata:t}=e,{previousPage:a,nextPage:r}=t;return n.createElement("nav",{className:"pagination-nav","aria-label":(0,l.I)({id:"theme.blog.paginator.navAriaLabel",message:"Blog list page navigation",description:"The ARIA label for the blog pagination"})},a&&n.createElement(o.Z,{permalink:a,title:n.createElement(l.Z,{id:"theme.blog.paginator.newerEntries",description:"The label used to navigate to the newer blog posts page (previous page)"},"Newer Entries")}),r&&n.createElement(o.Z,{permalink:r,title:n.createElement(l.Z,{id:"theme.blog.paginator.olderEntries",description:"The label used to navigate to the older blog posts page (next page)"},"Older Entries"),isNext:!0}))}},79985:(e,t,a)=>{a.d(t,{Z:()=>r});var n=a(67294),l=a(9460),o=a(95683);function r(e){let{items:t,component:a=o.Z}=e;return n.createElement(n.Fragment,null,t.map((e=>{let{content:t}=e;return n.createElement(l.n,{key:t.metadata.permalink,content:t},n.createElement(a,null,n.createElement(t,null)))})))}},41714:(e,t,a)=>{a.r(t),a.d(t,{default:()=>b});var n=a(67294),l=a(86010),o=a(95999),r=a(88824),c=a(10833),s=a(35281),i=a(39960),u=a(39058),m=a(99703),p=a(90197),g=a(79985);function d(e){const t=function(){const{selectMessage:e}=(0,r.c)();return t=>e(t,(0,o.I)({id:"theme.blog.post.plurals",description:'Pluralized label for "{count} posts". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',message:"One post|{count} posts"},{count:t}))}();return(0,o.I)({id:"theme.blog.tagTitle",description:"The title of the page for a blog tag",message:'{nPosts} tagged with "{tagName}"'},{nPosts:t(e.count),tagName:e.label})}function h(e){let{tag:t}=e;const a=d(t);return n.createElement(n.Fragment,null,n.createElement(c.d,{title:a}),n.createElement(p.Z,{tag:"blog_tags_posts"}))}function E(e){let{tag:t,items:a,sidebar:l,listMetadata:r}=e;const c=d(t);return n.createElement(u.Z,{sidebar:l},n.createElement("header",{className:"margin-bottom--xl"},n.createElement("h1",null,c),n.createElement(i.Z,{href:t.allTagsPath},n.createElement(o.Z,{id:"theme.tags.tagsPageLink",description:"The label of the link targeting the tag list page"},"View All Tags"))),n.createElement(g.Z,{items:a}),n.createElement(m.Z,{metadata:r}))}function b(e){return n.createElement(c.FG,{className:(0,l.Z)(s.k.wrapper.blogPages,s.k.page.blogTagPostListPage)},n.createElement(h,e),n.createElement(E,e))}},95683:(e,t,a)=>{a.d(t,{Z:()=>h});var n=a(67294),l=a(86010),o=a(9460),r=a(15289),c=a(79224),s=a(99714),i=a(12046),u=a(68258);const m="shareButtons_axSt";var p=a(52263),g=a(16550);const d=e=>{let{shareUrl:t,disabled:a=!1,title:l,hashtags:o,style:r}=e;const{siteConfig:c}=(0,p.Z)(),{location:s,createHref:i}=(0,g.k6)(),d=(0,n.useMemo)((()=>t??c.url+i(s)),[t,s]);return n.createElement("div",{className:m,style:r},n.createElement(u.B,{url:d,title:l,hashtags:o},n.createElement(u.Zm,{round:!0,size:32})),n.createElement(u.r2,{url:d,title:l},n.createElement(u.pA,{round:!0,size:32})),n.createElement(u.tq,{url:d,title:l},n.createElement(u.YG,{round:!0,size:32})),n.createElement(u.iR,{url:d,title:l},n.createElement(u.MP,{round:!0,size:32})))};function h(e){let{children:t,className:a}=e;const u=function(){const{isBlogPostPage:e}=(0,o.C)();return e?void 0:"margin-bottom--xl"}(),{metadata:{title:m},isBlogPostPage:p}=(0,o.C)();return n.createElement(r.Z,{className:(0,l.Z)(u,a)},p&&n.createElement(d,{title:`${m} | OSSInsight`}),n.createElement(c.Z,null),n.createElement(s.Z,null,t),p&&n.createElement(d,{title:`${m} | OSSInsight`}),n.createElement(i.Z,null))}},8106:(e,t,a)=>{a.d(t,{Z:()=>s});var n=a(67294),l=a(86010),o=a(95999),r=a(25108);const c={copyButtonCopied:"copyButtonCopied__QnY",copyButtonIcons:"copyButtonIcons_FhaS",copyButtonIcon:"copyButtonIcon_phi_",copyButtonSuccessIcon:"copyButtonSuccessIcon_FfTR"};function s(e){let{code:t,className:a}=e;const[s,i]=(0,n.useState)(!1),u=(0,n.useRef)(void 0),m=(0,n.useCallback)((()=>{var e;e=t,navigator.clipboard.writeText(e).catch(r.error),i(!0),u.current=window.setTimeout((()=>{i(!1)}),1e3)}),[t]);return(0,n.useEffect)((()=>()=>window.clearTimeout(u.current)),[]),n.createElement("button",{type:"button","aria-label":s?(0,o.I)({id:"theme.CodeBlock.copied",message:"Copied",description:"The copied button label on code blocks"}):(0,o.I)({id:"theme.CodeBlock.copyButtonAriaLabel",message:"Copy code to clipboard",description:"The ARIA label for copy code blocks button"}),title:(0,o.I)({id:"theme.CodeBlock.copy",message:"Copy",description:"The copy button label on code blocks"}),className:(0,l.Z)("clean-btn",a,c.copyButton,s&&c.copyButtonCopied),onClick:m},n.createElement("span",{className:c.copyButtonIcons,"aria-hidden":"true"},n.createElement("svg",{className:c.copyButtonIcon,viewBox:"0 0 24 24"},n.createElement("path",{d:"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"})),n.createElement("svg",{className:c.copyButtonSuccessIcon,viewBox:"0 0 24 24"},n.createElement("path",{d:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}))))}}}]);