import { getFloor } from './index.js';
import { setTransform } from './utils.js';

let $activeEmbed;
const $furnitureControl = document.querySelector('.furniture-control');
const $furnitureTools = document.querySelector('.menu-template').content.firstElementChild.cloneNode(true);
const $furnitureSelector = document.querySelector('.furniture-selector');
const $furnitureOptions = Array.from($furnitureSelector.children);
const $furniturePanels = Array.from(document.querySelectorAll('.furniture-panel'));
const $furnitureButtons = Array.from(document.querySelectorAll('.furniture-button'));
const addFurniture = ({ currentTarget, left, top }) => {
    const $embed = document.createElement('div');
    const $svg = currentTarget.firstElementChild.cloneNode(true);
    const $floor = getFloor();
    const $scene = $floor.parentElement;
    $furnitureControl.hidden = false;
    $activeEmbed = $embed;
    $svg.className = 'furniture-body';
    $embed.className = 'furniture-embed draggable';
    $embed.appendChild($svg);
    getFloor().querySelector('foreignObject').appendChild($embed);
    $svg.firstElementChild.setAttribute('preserveAspectRatio', 'none');
    $svg.prepend($furnitureTools);
    $embed.dataset.x = left || $scene.width.baseVal.value / 2;
    $embed.dataset.y = top || $scene.height.baseVal.value / 2;
    setTransform($embed);
};
const slotButton = async ($target) => {
    const $placeHolder = $target.firstElementChild;
    const response = await fetch(`/images/furniture/${$placeHolder.dataset.src}.svg`);
    const svg = await response.text();
    $placeHolder.innerHTML = svg;
    $target.onclick = addFurniture;
};
const selectOption = function(e) {
    const { target, currentTarget } = e;
    currentTarget.classList.toggle('expand');
    if (target.classList.contains('selected') === false) {
        this.$panel.hidden = false;
        this.$option.classList.remove('selected');
        this.$panel = $furniturePanels[$furnitureOptions.indexOf(target)];
        this.$option = target;
        this.$option.classList.add('selected');
        this.$panel.hidden = true;
    }
};
const focusEmbed = ({ detail: { $embed } }) => {
    if($embed) {
        if ($embed.firstElementChild.classList.contains('embed-menu') === false) {
            $activeEmbed = $embed;
            $embed.prepend($furnitureTools);
        }
    }
    else if($activeEmbed) {
        $activeEmbed = null;
        $furnitureTools.remove();
    }
};
document.body.addEventListener('focus-embed', focusEmbed);
$furnitureSelector.onclick = selectOption.bind({ $panel: $furniturePanels[0], $option: $furnitureOptions[0] });
$furnitureTools.querySelector('.embed-bin-button').onclick = () => {
    $activeEmbed.remove();
    $activeEmbed = null;
};
$furnitureTools.querySelector('.embed-duplicate-button').onclick = ({ target }) => {
    const $furnitureBody = target.closest('.furniture-body');
    const { src } = $furnitureBody.dataset;
    const $embed = $furnitureBody.parentElement;
    const currentTarget = document.querySelector(`.furniture-button [data-src=${src}]`).parentElement;
    addFurniture({ currentTarget, left: + $embed.dataset.x + 20, top: $embed.dataset.y });
};
$furnitureButtons.forEach(slotButton);