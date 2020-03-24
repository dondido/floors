import { Drag, Measure } from './gestures.js';
import { setTransform } from './utils.js';

let plan, $scene, $floor, $pristine, drag, measure;
const handleJson = response => response.json();
const handleText = response => response.text();
const $mirror = document.querySelector('.mirror');
const $dirty = document.createDocumentFragment();
const $port = document.querySelector('.port');
const $view = document.querySelector('.view');
const $floorSelector = document.querySelector('.floor-selector');
const $zoomSlider = document.querySelector('.zoom-slider');
const $ruler = document.querySelector('.ruler');
const $foots = document.querySelector('.foots');
const $zoomControl = document.querySelector('.zoom-control');
const $reverse = document.getElementById('reverse');
const $measure = document.getElementById('measure');

const floorOptions = [];
const resize = () => {
    setDragGesture();
};
const selectFloor = function(e) {
    const { target, currentTarget } = e;
    currentTarget.classList.toggle('expand');
    if (target.classList.contains('selected') === false && target.isSameNode(currentTarget) === false) {
        const id = `#${target.dataset.ref}`;
        this.$option.classList.remove('selected');
        this.$option = target;
        target.classList.add('selected');
        $dirty.appendChild($floor);
        $floor = $dirty.querySelector(id) || $pristine.querySelector(id).cloneNode(true);
        $scene.appendChild($floor);
        restore();
    }
};
const setDragGesture = () => {
    $measure.checked = false;
    drag.attach();
    $ruler.classList.remove('apply');
};
const toggleMeasure = () => {
    if($measure.checked) {
        measure.attach();
    }
    else {
        setDragGesture();
    }
};
const zoom = () => {
    $view.dataset.z = 1 + $zoomSlider.value / plan.zoomRatio;
    $zoomControl.dataset.z = + $zoomSlider.value + 100;
    $view.style.setProperty('--rz', $view.dataset.sx / $view.dataset.z);
    setTransform($view);
    $measure.checked && setDragGesture();
};
const wheel = ({deltaY}) => {
    $zoomSlider.value = + $zoomSlider.value + (deltaY > 0 ? -4 : 4);
    zoom();
};
const revertView = () => {
    $view.dataset.sx *= -1;
    setTransform($view);
};
const interpolateForeign = ($text) => {
    const { sx = 1, r = 0 } = $text.dataset;
    $text.dataset.sx = sx * -1;
    $text.dataset.r = r * -1;
    setTransform($text);
};
const mirror = () => {
    if ($reverse.checked && $floor.dataset.reversed !== 'true') {
        const $texts = $floor.querySelectorAll('text');
        const interpolate = ($text, idx) => {
            const $target = $texts[idx];
            if($text.dataset.flip === undefined) {
                const transform = $text.getAttribute('transform');
                const matrix = /\(([^)]+)\)/.exec(transform)[1].split(' ');
                $target.dataset.transform = transform;
                matrix[0] = -1;
                matrix[4] = $text.getBoundingClientRect().right;
                $target.dataset.flip = `matrix(${matrix.join()})`;  
            }
            $target.setAttribute('transform', $target.dataset.flip);
        };
        $floor.dataset.reversed = true;
        $mirror.appendChild($pristine);
        $pristine.querySelectorAll(`#${$floor.id} text`).forEach(interpolate);
        $floor.querySelectorAll('.text-field').forEach(interpolateForeign);
        $pristine.remove();
        revertView();
    }
    else if($reverse.checked === false && $floor.dataset.reversed === 'true') {
        const interpolate = $text => $text.setAttribute('transform', $text.dataset.transform);
        $floor.dataset.reversed = false;
        $floor.querySelectorAll('text').forEach(interpolate);
        $floor.querySelectorAll('.text-field').forEach(interpolateForeign);
        revertView();
    }
};
const init = () => {
    setScale();
    drag.attach();
};
const restore = () => {
    $zoomSlider.value = 0;
    setDragGesture();
    mirror();
    zoom();
    init();
};
const reset = () => {
    $reverse.checked = false;
    $floor.querySelector('foreignObject').innerHTML = '';
    restore();
};
const setScale = () => {
    if($view.dataset.sx === undefined) {
        const { width, height } = $scene.getBoundingClientRect();
        const s = Math.min(window.innerWidth / width, window.innerHeight / height);
        $view.dataset.sy = s;
        $view.dataset.sx = s;
        setTransform($view);
    }
};
const hideViewOptions = ({ id }) => document.getElementById(id).remove();
const setFloor = ({name, id, options}, idx) => {
    const $floorOption = document.createElement('li');
    const $target = document.getElementById(id);
    $target.insertAdjacentHTML('beforeend', '<foreignObject data-drag-area=".view"></foreignObject>');
    $floorOption.textContent = name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    if(idx){
        $pristine.appendChild($target);
    }
    else {
        $floor = $target;
        $floorOption.classList.add('selected');
        $pristine.appendChild($target.cloneNode(true));
    }
    $floorOption.dataset.ref = id;
    $floorSelector.appendChild($floorOption);
    options && options.forEach(hideViewOptions);
};
const insertView = (text) => {
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    $pristine = $scene.cloneNode();
    plan.floors.forEach(setFloor);
    drag = new Drag({ $scene, $view, $zoomSlider, zoom });
    measure = new Measure({ $scene, $view, $zoomSlider, $ruler, $foots, plan });
    init();
    $floorSelector.onclick = selectFloor.bind({ $option: floorOptions[0] });
    $zoomSlider.oninput = zoom;
    $port.onwheel = wheel;
};
const handlePlan = (raw) => {
    plan = raw;
    document.querySelector('.plan-name').textContent = plan.name;
    fetch(plan.src)
        .then(handleText)
        .then(insertView);
    return raw;
};
const addText = () => {
    const $text = document.createElement('pre');
    $text.textContent = 'Add Text';
    $text.className = 'draggable text-field';
    $text.dataset.x = $scene.width.baseVal.value / 2;
    $text.dataset.y = $scene.height.baseVal.value / 2;
    $text.dataset.sx = Math.sign($view.dataset.sx);
    $floor.querySelector('foreignObject').appendChild($text);
    document.body.dispatchEvent(new CustomEvent('focus-text', { detail: { $text } }));
    setTransform($text);
};
const planPromise = fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);
document.querySelector('.print-button').onclick = () => window.print();
document.querySelector('.reset-button').onclick = reset;
document.querySelector('.text-button').onclick = addText;

$reverse.onchange = mirror;
$measure.onchange = toggleMeasure;
window.onresize = resize;

export const getFloor = () => $floor;
export default () => planPromise;
