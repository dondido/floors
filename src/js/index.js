let plan, $scene, $floor, $pristine, drag, measure, $activeText;
const handleJson = response => response.json();
const handleText = response => response.text();
const $mirror = document.querySelector('.mirror');
const $dirty = document.createDocumentFragment();
const $port = document.querySelector('.port');
const $view = document.querySelector('.view');
const $textControl = document.querySelector('.text-control');
const $textControlBody = $textControl.querySelector('.text-control-body');
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
const hideNode = node => node.classList.add('excluded');
const selectFloor = (e) => {
    const { target } = e;
    $floorSelector.classList.toggle('expand');
    if (target.classList.contains('excluded')) {
        const id = `#${target.dataset.ref}`;
        floorOptions.forEach(hideNode);
        target.classList.remove('excluded');
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
const setTransform = ($target) => {
    const { sx = 1, sy = 1, x = 0, y = 0, z = 1, r = 0 } = $target.dataset;
    $target.style.transform = `translate(${x}px, ${y}px) scale(${sx * z}, ${sy * z}) rotate(${r}deg)`;
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
        $floorOption.classList.add('excluded');
        $pristine.appendChild($target);
    }
    else {
        $floor = $target;
        $pristine.appendChild($target.cloneNode(true));
    }
    $floorOption.dataset.ref = id;
    $floorSelector.appendChild($floorOption);
    options && options.forEach(hideViewOptions);
};
const insertView = ([text, { Drag, Measure }]) => {
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    $pristine = $scene.cloneNode();
    plan.floors.forEach(setFloor);
    drag = new Drag({ $scene, $view, $zoomSlider, zoom, setTransform, linkActiveText });
    measure = new Measure({ $scene, $view, $zoomSlider, $ruler, $foots, plan });
    init();
    $floorSelector.onclick = selectFloor;
    $zoomSlider.oninput = zoom;
    $port.onwheel = wheel;
};
const handlePlan = (raw) => {
    plan = raw;
    document.querySelector('.plan-name').textContent = plan.name;
    return Promise
        .all([
            fetch(plan.src).then(handleText),
            import('./gestures.js')
        ])
        .then(insertView);
};
const setTextDefaults = ($text) => {
    $text.className = 'draggable text-field';
    $text.dataset.x = $scene.width.baseVal.value / 2;
    $text.dataset.y = $scene.height.baseVal.value / 2;
    $text.dataset.sx = Math.sign($view.dataset.sx);
};
const addText = () => {
    const $text = document.createElement('pre');
    $text.textContent = 'Add Text';
    setTextDefaults($text);
    $floor.querySelector('foreignObject').appendChild($text);
    linkActiveText($text);
    setTransform($text);
};
document.querySelector('.print-button').onclick = () => window.print();
document.querySelector('.reset-button').onclick = reset;
document.querySelector('.text-button').onclick = addText;
const linkActiveText = ($text) => {
    if($text.isSameNode($activeText)) {
        return;
    }
    $activeText = $text;
    $textControl.hidden = false;
    $textControlBody.disabled = $activeText.classList.contains('disabled');
    document.querySelector('.text-control-textarea').value = $activeText.textContent;
    document.querySelector('.font-slider').value = parseInt($activeText.style.fontSize) || 13;
    document.querySelector('.text-control-rotate-input').value = $activeText.dataset.r;
};
document.querySelector('.text-control-lock-button').onclick = () => {
    $textControlBody.disabled = !$textControlBody.disabled;
    $activeText.classList.toggle('disabled');
};
document.querySelector('.text-control-reset-button').onclick = () => {
    $activeText.dataset.r = 0;
    $activeText.style.fontSize = '13px';
    setTextDefaults($activeText);
    setTransform($activeText);
};
document.querySelector('.text-control-textarea').oninput = ({ target }) => {
    $activeText.textContent = target.value;
};
document.querySelector('.text-control-rotate-input').oninput = ({ target }) => {
    if (target.value === '-1') {
        target.value = 359;
    }
    else if (target.value === '360') {
        target.value = 0;
    }
    $activeText.dataset.r = target.value;
    setTransform($activeText);
};
document.querySelector('.text-control-bin-button').onclick = () => {
    $activeText.remove();
    $textControl.hidden = true;
};
document.querySelector('.text-control-x-button').onclick = () => {
    $textControl.hidden = true;
};
document.querySelector('.font-slider').oninput = ({ target }) => {
    $activeText.style.fontSize = `${target.value}px`;
};
$reverse.onchange = mirror;
$measure.onchange = toggleMeasure;
window.onresize = resize;

fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);
