import inject from"./index.js";let currentFloorIndex=0;const floorMap={},infos=[],floorNodes=[],$floors=document.querySelector(".floor-option-template").content.firstElementChild,$floorOptionItem=document.querySelector(".floor-option-item-template").content.firstElementChild,$floorOptionInfo=document.querySelector(".floor-option-info-template").content.firstElementChild,$floorOptionsTab=document.querySelector(".floor-options-tab"),$floorList=document.querySelector(".floor-list"),$floorListContainer=$floorList.parentElement,$prev=document.querySelector(".floor-prev-button"),$next=document.querySelector(".floor-next-button"),setDisabled=(e,t)=>`${e}<li>${floorMap[t].name}</li>`,mapNameToId=function(e,t){return Object.assign(e,{[t.id]:{parentId:`floor-${this.id}`,...t}})},updateY=e=>{if(window.innerWidth>1024){const{top:t,bottom:o}=e.parentElement.getBoundingClientRect();e.style.top=`${(t+o)/2}px`}},deleteElement=e=>{const t=document.getElementById(e);t&&t.remove()},updateFloorOptionsCount=(e,t)=>{const o=t.querySelectorAll('.floor-option-button[aria-checked="true"]').length;return t.querySelector(".floor-item-summary").dataset.count=o,e+o},updateTotalOptionsCount=()=>$floorOptionsTab.dataset.count=floorNodes.reduce(updateFloorOptionsCount,0),enableOption=({target:e,checked:t="true"!==e.getAttribute("aria-checked")})=>{const o=t?1:-1,r=e.closest(".floor-item-body"),{id:n}=e.dataset,{disable:l=[],required:i=[],parentId:d}=floorMap[n],{$pristine:c,selectFloor:a,mirror:s}=inject();a({target:document.querySelector(`[data-ref="${d}"]`)},!0);const u=document.getElementById(d);t?u.prepend(c.querySelector(`#${n}`).cloneNode(!0)):deleteElement(n),l.forEach(e=>{const o=r.querySelector(`[data-id="${e}"]`);o&&(o.disabled=t,o.setAttribute("aria-checked",!1)),deleteElement(e)}),i.forEach(e=>{const t=r.querySelector(`[data-id="${e}"]`);"true"!==t.getAttribute("aria-checked")&&enableOption({target:t})}),0===u.querySelectorAll("g").length&&u.prepend(c.querySelector(`#${d.slice(6)}`).cloneNode(!0)),s();for(const e in floorMap){const{required:t}=floorMap[e];if(t&&t.includes(n)){const t=r.querySelector(`[data-id="${e}"]`);t.requiredCount=Math.max(t.requiredCount-o,0),t.disabled=t.requiredCount,t.disabled&&t.setAttribute("aria-checked",!1)}}e.setAttribute("aria-checked",t),e.disabled=!1,updateTotalOptionsCount(),setTimeout(()=>infos.forEach(updateY))},setButtonRequiredCount=(e,t)=>{e.disabled=t,e.requiredCount=t},setFloor=(e,t)=>{const{name:o,id:r,options:n}=e;if(void 0===n)return;const l=$floors.cloneNode(!0);floorNodes.push(l);const i=l.querySelector(".floor-item-body"),d=l.querySelector(".floor-item-summary");Object.assign(floorMap,n.reduce(mapNameToId.bind({id:r}),{[r]:e})),d.textContent=o,d.dataset.id=`floor-${r}`,0===t&&d.classList.add("highlight-summary"),n.forEach(({name:e,id:t,disable:o,required:r=[]})=>{const n=$floorOptionItem.cloneNode(!0),l=n.firstElementChild;if(l.textContent=e,l.dataset.id=t,l.onclick=enableOption,i.appendChild(n),o||r.length){const e=$floorOptionInfo.cloneNode(!0),r=e.querySelector(".floor-extra-option-button");infos.push(e.querySelector(".floor-option-info-desc")),o?e.querySelector(".floor-option-info-list").innerHTML=o.reduce(setDisabled,""):e.classList.add("hide-content"),r.dataset.id=t,r.onclick=()=>{enableOption({target:l,checked:!0}),e.firstElementChild.setAttribute("aria-checked",!1)},n.appendChild(e),e.querySelector(".submenu-button").onclick=({target:e})=>e.setAttribute("aria-checked","true"!==e.getAttribute("aria-checked"))}setButtonRequiredCount(l,r.length)}),$floorList.appendChild(l),$floorListContainer.onscroll=()=>infos.forEach(updateY),infos.forEach(updateY)},removeFloorOption=e=>e.remove(),uncheckButton=e=>{const{required:t=[]}=floorMap[e.dataset.id];e.setAttribute("aria-checked",!1),setButtonRequiredCount(e,t.length)},setFloorOptions=({floors:e})=>{const{$pristine:t,$dirty:o}=inject(),r=({id:e})=>{const r=`#floor-${e}`,n=document.querySelector(r)||o.querySelector(r);n&&(Array.from(n.querySelectorAll("g"),removeFloorOption),n.prepend(t.querySelector(`#${e}`).cloneNode(!0)))};e.forEach(setFloor),floorNodes[0].classList.add("current-floor"),document.querySelector(".floor-reset-button").onclick=()=>{e.forEach(r),Array.from($floorList.querySelectorAll(".floor-option-button"),uncheckButton),updateTotalOptionsCount(),setTimeout(()=>infos.forEach(updateY))}},updateSliderButtons=()=>{$prev.disabled=!1,$next.disabled=!1,0===currentFloorIndex&&($prev.disabled=!0),currentFloorIndex===floorNodes.length-1&&($next.disabled=!0)},updateSlide=({target:e})=>{floorNodes[currentFloorIndex].classList.remove("current-floor"),currentFloorIndex=+e.dataset.slide+currentFloorIndex,floorNodes[currentFloorIndex].classList.add("current-floor"),updateSliderButtons()};$prev.onclick=updateSlide,$next.onclick=updateSlide,updateSliderButtons(),inject().planPromise.then(setFloorOptions);