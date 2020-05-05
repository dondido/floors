import { Drag, Measure } from './gestures.js';
import { setTransform } from './utils.js';

let plan, $scene, $floor, $pristine, $selectedFloorOption, drag, measure;
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
const selectFloor = ({ target }, collapse) => {
    collapse || $floorSelector.classList.toggle('expand');
    if (target.classList.contains('selected') === false && target.isSameNode($floorSelector) === false) {
        const id = `#${target.dataset.ref}`;
        const $summary = document.querySelector(`[data-id=${target.dataset.ref}]`);
        const $highlightSummary = document.querySelector('.highlight-summary');
        $selectedFloorOption.classList.remove('selected');
        $selectedFloorOption = target;
        target.classList.add('selected');
        $dirty.appendChild($floor);
        $floor = $dirty.querySelector(id) || $pristine.querySelector(id).cloneNode(true);
        $scene.appendChild($floor);
        $highlightSummary && $highlightSummary.classList.remove('highlight-summary');
        $summary && $summary.classList.add('highlight-summary');
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
const flipA = $mod => {
    if($mod.nodeName === 'g' && $mod.dataset.reversed !== 'true') {
        const $texts = $mod.querySelectorAll('text');
        const interpolate = ($text, idx) => {
            const $target = $texts[idx];
            if($target.dataset.flip === undefined) {
                const transform = $text.getAttribute('transform');
                const matrix = /\(([^)]+)\)/.exec(transform)[1].split(' ');
                $target.dataset.transform = transform;
                matrix[0] = -1;
                matrix[4] = $text.getBoundingClientRect().right;
                $target.dataset.flip = `matrix(${matrix.join()})`;
            }
            $target.setAttribute('transform', $target.dataset.flip);
        };
        $mod.dataset.reversed = true;
        $mirror.appendChild($pristine);
        $pristine.querySelectorAll(`#${$mod.id} text`).forEach(interpolate);
        $pristine.remove();
    }
};
const flipB = $mod => {
    if($mod.nodeName === 'g' && $mod.dataset.reversed === 'true') {
        const interpolate = $text => $text.setAttribute('transform', $text.dataset.transform);
        $mod.dataset.reversed = false;
        $mod.querySelectorAll('text').forEach(interpolate);
    }
};
const mirror = (e) => {
    const dir = $reverse.checked ? -1 : 1;
    const interpolateForeign = ($text) => {
        const { sx = 1, r = 0 } = $text.dataset;
        $text.dataset.sx = Math.abs(sx) * dir;
        $text.dataset.r = Math.abs(r) * dir;
        setTransform($text);
    };
    Array.from($floor.children, $reverse.checked ? flipA : flipB);
    $floor.querySelectorAll('.text-field').forEach(interpolateForeign);
    e && revertView();
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
const setFloor = ({name, id, options}, idx) => {
    const $floorOption = document.createElement('li');
    const $g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const ref = `floor-${id}`;
    const hideViewOptions = ({ id }) => $pristine.appendChild(document.getElementById(id));
    $g.setAttribute('id', ref);
    $g.appendChild(document.getElementById(id));
    options && options.forEach(hideViewOptions);
    $g.insertAdjacentHTML('beforeend', '<foreignObject data-drag-area=".view"></foreignObject>');
    $floorOption.textContent = name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    $pristine.appendChild($g);
    if(idx === 0) {
        $floor = $g.cloneNode(true);
        $floorOption.classList.add('selected');
        $scene.appendChild($floor)
    }
    $floorOption.dataset.ref = ref;
    $floorSelector.appendChild($floorOption);
};
const insertView = (text) => {
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    $pristine = $scene.cloneNode();
    plan.floors.forEach(setFloor);
    drag = new Drag({ $scene, $view, $zoomSlider, zoom });
    measure = new Measure({ $scene, $view, $zoomSlider, $ruler, $foots, plan });
    init();
    $selectedFloorOption = floorOptions[0];
    $floorSelector.onclick = selectFloor;
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

export default () => ({ planPromise, $floor, $pristine, $dirty, selectFloor, mirror });
