import{Q as m,R as d,T,e as v,V as p,W as w,k as u,u as i,l as y,m as N}from"./Cgf1Ro7r.js";function h(r){var t=document.createElement("template");return t.innerHTML=r,t.content}function n(r,t){var e=v;e.nodes_start===null&&(e.nodes_start=r,e.nodes_end=t)}function M(r,t){var e=(t&p)!==0,l=(t&w)!==0,s,_=!r.startsWith("<!>");return()=>{if(u)return n(i,null),i;s===void 0&&(s=h(_?r:"<!>"+r),e||(s=d(s)));var a=l||T?document.importNode(s,!0):s.cloneNode(!0);if(e){var c=d(a),o=a.lastChild;n(c,o)}else n(a,a);return a}}function L(r,t,e="svg"){var l=!r.startsWith("<!>"),s=(t&p)!==0,_=`<${e}>${l?r:"<!>"+r}</${e}>`,a;return()=>{if(u)return n(i,null),i;if(!a){var c=h(_),o=d(c);if(s)for(a=document.createDocumentFragment();d(o);)a.appendChild(d(o));else a=d(o)}var f=a.cloneNode(!0);if(s){var g=d(f),E=f.lastChild;n(g,E)}else n(f,f);return f}}function P(r=""){if(!u){var t=m(r+"");return n(t,t),t}var e=i;return e.nodeType!==3&&(e.before(e=m()),N(e)),n(e,e),e}function R(){if(u)return n(i,null),i;var r=document.createDocumentFragment(),t=document.createComment(""),e=m();return r.append(t,e),n(t,e),r}function b(r,t){if(u){v.nodes_end=i,y();return}r!==null&&r.before(t)}const x="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(x);export{b as a,n as b,R as c,h as d,P as e,L as n,M as t};
