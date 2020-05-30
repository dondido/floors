import inject from './index.js';
import { setTransform } from './utils.js';

let $activeEmbed;
const $furnitureControl = document.querySelector('.furniture-control');
const $furnitureControlBody = $furnitureControl.querySelector('.furniture-control-body');
const $furnitureHorizontalInput = $furnitureControl.querySelector('.furniture-control-horizontal-input');
const $furnitureVerticalInput = $furnitureControl.querySelector('.furniture-control-vertical-input');
const $furnitureRotateInput = $furnitureControl.querySelector('.furniture-control-rotate-input');
const $furnitureTools = document.querySelector('.menu-template').content.firstElementChild.cloneNode(true);
const $furnitureSelector = document.querySelector('.furniture-selector');
const $furnitureOptions = Array.from($furnitureSelector.children);
const $furniturePanels = Array.from(document.querySelectorAll('.furniture-control ~ .tab-content'));
const $furnitureButtons = Array.from(document.querySelectorAll('.furniture-button'));
const updateFuntitureControl = () => {
    const $svg = $activeEmbed.querySelector('svg');
    const [ val ] = $svg.transform.baseVal;
    $furnitureHorizontalInput.value = Math.round($svg.width.baseVal.value * 1.678);
    $furnitureVerticalInput.value = Math.round($svg.height.baseVal.value * 1.678);
    $furnitureRotateInput.value = val ? val.angle : 0;
};
const addFurniture = ({ currentTarget, left, top }) => {
    const $embed = document.createElement('div');
    const $svg = currentTarget.firstElementChild.cloneNode(true);
    const { $floor } = inject();
    const $scene = $floor.parentElement;
    $furnitureControl.hidden = false;
    $activeEmbed = $embed;
    $svg.className = 'furniture-body';
    $embed.className = 'furniture-embed draggable';
    $embed.appendChild($svg);
    $floor.querySelector('foreignObject').appendChild($embed);
    $svg.firstElementChild.setAttribute('preserveAspectRatio', 'none');
    $svg.prepend($furnitureTools);
    $embed.dataset.x = left || $scene.width.baseVal.value / 2;
    $embed.dataset.y = top || $scene.height.baseVal.value / 2;
    setTransform($embed);
    updateFuntitureControl();
};
const slotButton = async ($target) => {
    const $placeHolder = $target.firstElementChild;
    const response = await fetch(`images/furniture/${$placeHolder.dataset.src}.svg`);
    const svg = await response.text();
    $placeHolder.innerHTML = svg;
    $target.onclick = addFurniture;
};
const selectOption = function(e) {
    const { target, currentTarget } = e;
    currentTarget.classList.toggle('expand');
    if (target.classList.contains('selected') === false && target.isSameNode(currentTarget) === false) {
        this.$panel.hidden = true;
        this.$option.classList.remove('selected');
        this.$panel = $furniturePanels[$furnitureOptions.indexOf(target)];
        this.$option = target;
        this.$option.classList.add('selected');
        this.$panel.hidden = false;
    }
};
const blurEmbed = () => {
    $activeEmbed = null;
    $furnitureControl.hidden = true;
    $furnitureTools.remove();
};
const focusEmbed = ({ detail: { $embed } }) => {
    if($embed) {
        if ($embed.firstElementChild.classList.contains('embed-menu') === false) {
            $activeEmbed = $embed;
            $furnitureControl.hidden = false;
            $embed.prepend($furnitureTools);
            updateFuntitureControl();
        }
    }
    else if($activeEmbed) {
        blurEmbed();
    }
};
const flipEmbed = ({ target }) => {
    const $svg = $activeEmbed.querySelector('svg');
    const transform = $svg.getAttribute('transform');
    const [sx, sy] = target.dataset.s.split(' ');
    if (transform) {
        const regex = /scale\(([^)]*)\)/;
        const match = transform.match(regex);
        const s = match && match.pop();
        if(s) {
            const [sx1, sy1] = s.split(' ');
            return $svg.setAttribute('transform', transform.replace(regex, `scale(${sx1 * sx} ${sy1 * sy})`));
        }
        return $svg.setAttribute('transform', `${transform} scale(${sx} ${sy})`);
    }
    $svg.setAttribute('transform', `scale(${sx} ${sy})`);
};
const handleRotation = () => {
    const $target = $furnitureRotateInput;
    if ($target.value < 0) {
        $target.value = 359;
    }
    else if ($target.value > 359) {
        $target.value = 0;
    }
    const { value } = $target;
    const $svg = $activeEmbed.querySelector('svg');
    const transform = $svg.getAttribute('transform');
    if (transform) {
        const regex = /rotate\(([^)]*)\)/;
        const match = transform.match(regex);
        const s = match && match.pop();
        if(s) {
            return $svg.setAttribute('transform', transform.replace(regex, `rotate(${value})`));
        }
        return $svg.setAttribute('transform', `rotate(${value})`);
    }
    $svg.setAttribute('transform', `rotate(${value})`);
};
const rotateEmbed = ({ detail: { deg } }) => {
    $furnitureRotateInput.value = Math.round(deg + 180);
    handleRotation();
};
const resizeEmbed = ({ detail: { width, height } }) => {
    $furnitureHorizontalInput.value = width ? Math.round(width * 1.678) : $furnitureHorizontalInput.value;
    $furnitureVerticalInput.value = height ? Math.round(height * 1.678) : $furnitureVerticalInput.value;
    updateEmbedWidth();
    updateEmbedHeight();
};
const updateSide = (val) => {
    // furniture size must be between 0 and 240 inches, so: max = 240 / 1.678
    const max = 240;
    const min = 0;
    return Math.min(Math.max(val, min), max);
};
const updateEmbedWidth = () => {
    $furnitureHorizontalInput.value = updateSide($furnitureHorizontalInput.value);
    $activeEmbed.querySelector('svg').setAttribute('width', $furnitureHorizontalInput.value / 1.678);
};
const updateEmbedHeight = () => {
    $furnitureVerticalInput.value = updateSide($furnitureVerticalInput.value);
    $activeEmbed.querySelector('svg').setAttribute('height', $furnitureVerticalInput.value / 1.678);
};
const deleteFurnitureEmbed = $target => $target.remove();
document.body.addEventListener('focus-embed', focusEmbed);
document.body.addEventListener('rotate-embed', rotateEmbed);
document.body.addEventListener('resize-embed', resizeEmbed);
$furnitureSelector.onclick = selectOption.bind({ $panel: $furniturePanels[0], $option: $furnitureOptions[0] });
$furnitureTools.querySelector('.embed-bin-button').onclick = () => {
    $activeEmbed.remove();
    blurEmbed();
};
$furnitureTools.querySelector('.embed-duplicate-button').onclick = ({ target }) => {
    const $furnitureBody = target.closest('.furniture-body');
    const { src } = $furnitureBody.dataset;
    const $embed = $furnitureBody.parentElement;
    const currentTarget = document.querySelector(`.furniture-button [data-src="${src}"]`).parentElement;
    addFurniture({ currentTarget, left: + $embed.dataset.x + 20, top: $embed.dataset.y });
};
$furnitureControl.querySelector('.furniture-control-flip-horizontal-button').onclick = flipEmbed;
$furnitureControl.querySelector('.furniture-control-flip-vertical-button').onclick = flipEmbed;
$furnitureControl.querySelector('.furniture-control-reset-button').onclick = () => {
    const $svg = $activeEmbed.querySelector('svg');
    const [x, y, w, h] = $svg.getAttribute('viewBox').split(' ');
    $svg.setAttribute('width', w);
    $svg.setAttribute('height', h);
    $svg.removeAttribute('transform');
};
$furnitureButtons.forEach(slotButton);
$furnitureRotateInput.oninput = handleRotation;
$furnitureHorizontalInput.oninput = updateEmbedWidth;
$furnitureVerticalInput.oninput = updateEmbedHeight;
$furnitureControl.querySelector('.furniture-control-rotate-plus-button').onclick = () => {
    $furnitureRotateInput.value ++;
    handleRotation();
};
$furnitureControl.querySelector('.furniture-control-rotate-minus-button').onclick = () => {
    $furnitureRotateInput.value --;
    handleRotation();
};
$furnitureControl.querySelector('.furniture-control-width-plus-button').onclick = () => {
    $furnitureHorizontalInput.value ++;
    updateEmbedWidth();
};
$furnitureControl.querySelector('.furniture-control-width-minus-button').onclick = () => {
    $furnitureHorizontalInput.value --;
    updateEmbedWidth();
};
$furnitureControl.querySelector('.furniture-control-height-plus-button').onclick = () => {
    $furnitureVerticalInput.value ++;
    updateEmbedHeight();
};
$furnitureControl.querySelector('.furniture-control-height-minus-button').onclick = () => {
    $furnitureVerticalInput.value --;
    updateEmbedHeight();
};
document.querySelector('.furniture-reset-button').onclick = () => {
    Array.from(document.querySelectorAll('.furniture-embed'), deleteFurnitureEmbed);
    blurEmbed();
};
$furnitureControl.querySelector('.furniture-control-x-button').onclick = blurEmbed;
$furnitureControlBody.querySelector('.furniture-control-lock-button').onclick = () => {
    $furnitureControlBody.disabled = !$furnitureControlBody.disabled;
    $activeEmbed.classList.toggle('disabled');
};