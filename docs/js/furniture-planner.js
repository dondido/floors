import inject from"./index.js";import{setTransform}from"./utils.js";let $activeEmbed;const $furnitureControl=document.querySelector(".furniture-control"),$furnitureControlBody=$furnitureControl.querySelector(".furniture-control-body"),$furnitureHorizontalInput=$furnitureControl.querySelector(".furniture-control-horizontal-input"),$furnitureVerticalInput=$furnitureControl.querySelector(".furniture-control-vertical-input"),$furnitureRotateInput=$furnitureControl.querySelector(".furniture-control-rotate-input"),$furnitureTools=document.querySelector(".menu-template").content.firstElementChild.cloneNode(!0),$furnitureSelector=document.querySelector(".furniture-selector"),$furnitureOptions=Array.from($furnitureSelector.children),$furniturePanels=Array.from(document.querySelectorAll(".furniture-control ~ .tab-content")),$furnitureButtons=Array.from(document.querySelectorAll(".furniture-button")),updateFuntitureControl=()=>{const t=$activeEmbed.querySelector("svg"),[e]=t.transform.baseVal;$furnitureHorizontalInput.value=Math.round(1.678*t.width.baseVal.value),$furnitureVerticalInput.value=Math.round(1.678*t.height.baseVal.value),$furnitureRotateInput.value=e?e.angle:0},addFurniture=({currentTarget:t,left:e,top:r})=>{const u=document.createElement("div"),n=t.firstElementChild.cloneNode(!0),{$floor:o}=inject(),i=o.parentElement;$furnitureControl.hidden=!1,$activeEmbed=u,n.className="furniture-body",u.className="furniture-embed draggable",u.appendChild(n),o.querySelector("foreignObject").appendChild(u),n.firstElementChild.setAttribute("preserveAspectRatio","none"),n.prepend($furnitureTools),u.dataset.x=e||i.width.baseVal.value/2,u.dataset.y=r||i.height.baseVal.value/2,setTransform(u),updateFuntitureControl()},slotButton=async t=>{const e=t.firstElementChild,r=await fetch(`images/furniture/${e.dataset.src}.svg`),u=await r.text();e.innerHTML=u,t.onclick=addFurniture},selectOption=function(t){const{target:e,currentTarget:r}=t;r.classList.toggle("expand"),!1===e.classList.contains("selected")&&!1===e.isSameNode(r)&&(this.$panel.hidden=!0,this.$option.classList.remove("selected"),this.$panel=$furniturePanels[$furnitureOptions.indexOf(e)],this.$option=e,this.$option.classList.add("selected"),this.$panel.hidden=!1)},blurEmbed=()=>{$activeEmbed=null,$furnitureControl.hidden=!0,$furnitureTools.remove()},focusEmbed=({detail:{$embed:t}})=>{t?!1===t.firstElementChild.classList.contains("embed-menu")&&($activeEmbed=t,$furnitureControl.hidden=!1,t.prepend($furnitureTools),updateFuntitureControl()):$activeEmbed&&blurEmbed()},flipEmbed=({target:t})=>{const e=$activeEmbed.querySelector("svg"),r=e.getAttribute("transform"),[u,n]=t.dataset.s.split(" ");if(r){const t=/scale\(([^)]*)\)/,o=r.match(t),i=o&&o.pop();if(i){const[o,l]=i.split(" ");return e.setAttribute("transform",r.replace(t,`scale(${o*u} ${l*n})`))}return e.setAttribute("transform",`${r} scale(${u} ${n})`)}e.setAttribute("transform",`scale(${u} ${n})`)},handleRotation=()=>{const t=$furnitureRotateInput;t.value<0?t.value=359:t.value>359&&(t.value=0);const{value:e}=t,r=$activeEmbed.querySelector("svg"),u=r.getAttribute("transform");if(u){const t=/rotate\(([^)]*)\)/,n=u.match(t);return n&&n.pop()?r.setAttribute("transform",u.replace(t,`rotate(${e})`)):r.setAttribute("transform",`rotate(${e})`)}r.setAttribute("transform",`rotate(${e})`)},rotateEmbed=({detail:{deg:t}})=>{$furnitureRotateInput.value=Math.round(t+180),handleRotation()},resizeEmbed=({detail:{width:t,height:e}})=>{$furnitureHorizontalInput.value=t?Math.round(1.678*t):$furnitureHorizontalInput.value,$furnitureVerticalInput.value=e?Math.round(1.678*e):$furnitureVerticalInput.value,updateEmbedWidth(),updateEmbedHeight()},updateSide=t=>Math.min(Math.max(t,0),240),updateEmbedWidth=()=>{$furnitureHorizontalInput.value=updateSide($furnitureHorizontalInput.value),$activeEmbed.querySelector("svg").setAttribute("width",$furnitureHorizontalInput.value/1.678)},updateEmbedHeight=()=>{$furnitureVerticalInput.value=updateSide($furnitureVerticalInput.value),$activeEmbed.querySelector("svg").setAttribute("height",$furnitureVerticalInput.value/1.678)},deleteFurnitureEmbed=t=>t.remove();document.body.addEventListener("focus-embed",focusEmbed),document.body.addEventListener("rotate-embed",rotateEmbed),document.body.addEventListener("resize-embed",resizeEmbed),$furnitureSelector.onclick=selectOption.bind({$panel:$furniturePanels[0],$option:$furnitureOptions[0]}),$furnitureTools.querySelector(".embed-bin-button").onclick=()=>{$activeEmbed.remove(),blurEmbed()},$furnitureTools.querySelector(".embed-duplicate-button").onclick=({target:t})=>{const e=t.closest(".furniture-body"),{src:r}=e.dataset,u=e.parentElement,n=document.querySelector(`.furniture-button [data-src="${r}"]`).parentElement;addFurniture({currentTarget:n,left:+u.dataset.x+20,top:u.dataset.y})},$furnitureControl.querySelector(".furniture-control-flip-horizontal-button").onclick=flipEmbed,$furnitureControl.querySelector(".furniture-control-flip-vertical-button").onclick=flipEmbed,$furnitureControl.querySelector(".furniture-control-reset-button").onclick=()=>{const t=$activeEmbed.querySelector("svg"),[e,r,u,n]=t.getAttribute("viewBox").split(" ");t.setAttribute("width",u),t.setAttribute("height",n),t.removeAttribute("transform")},$furnitureButtons.forEach(slotButton),$furnitureRotateInput.oninput=handleRotation,$furnitureHorizontalInput.oninput=updateEmbedWidth,$furnitureVerticalInput.oninput=updateEmbedHeight,$furnitureControl.querySelector(".furniture-control-rotate-plus-button").onclick=()=>{$furnitureRotateInput.value++,handleRotation()},$furnitureControl.querySelector(".furniture-control-rotate-minus-button").onclick=()=>{$furnitureRotateInput.value--,handleRotation()},$furnitureControl.querySelector(".furniture-control-width-plus-button").onclick=()=>{$furnitureHorizontalInput.value++,updateEmbedWidth()},$furnitureControl.querySelector(".furniture-control-width-minus-button").onclick=()=>{$furnitureHorizontalInput.value--,updateEmbedWidth()},$furnitureControl.querySelector(".furniture-control-height-plus-button").onclick=()=>{$furnitureVerticalInput.value++,updateEmbedHeight()},$furnitureControl.querySelector(".furniture-control-height-minus-button").onclick=()=>{$furnitureVerticalInput.value--,updateEmbedHeight()},document.querySelector(".furniture-reset-button").onclick=()=>{Array.from(document.querySelectorAll(".furniture-embed"),deleteFurnitureEmbed),blurEmbed()},$furnitureControl.querySelector(".furniture-control-x-button").onclick=blurEmbed,$furnitureControlBody.querySelector(".furniture-control-lock-button").onclick=()=>{$furnitureControlBody.disabled=!$furnitureControlBody.disabled,$activeEmbed.classList.toggle("disabled")};