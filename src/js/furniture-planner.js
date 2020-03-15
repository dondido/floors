import { getFloor, setEmbedDefaults } from './index.js';
import { setTransform } from './utils.js';

let $activeEmbed;
let $furnitureTools = document.querySelector('.menu-template').content.firstElementChild.cloneNode(true);
const $furnitureSelector = document.querySelector('.furniture-selector');
const $furnitureOptions = Array.from($furnitureSelector.children);
const $furniturePanels = Array.from(document.querySelectorAll('.furniture-panel'));
const $furnitureButtons = Array.from(document.querySelectorAll('.furniture-button'));
const addFurniture = ({ currentTarget }) => {
    const $embed = currentTarget.firstElementChild.cloneNode(true);
    $activeEmbed = $embed;
    $embed.className = 'furniture-embed draggable';
    getFloor().querySelector('foreignObject').appendChild($embed);
    console.log(111, $furnitureTools, $furnitureTools.firstElementChild, $furnitureTools.innerHTML);
    $embed.prepend($furnitureTools);
    console.log(112, $furnitureTools.remove);

    setEmbedDefaults($embed);
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
$furnitureButtons.forEach(slotButton);