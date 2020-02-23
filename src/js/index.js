let plan, $pristine, $scene, $floor, drag, measure;
const handleJson = response => response.json();
const handleText = response => response.text();
const $dirty = document.createDocumentFragment();
const $port = document.querySelector('.port');
const $view = document.querySelector('.view');
const $floorSelector = document.querySelector('.floor-selector');
const $zoomSlider = document.querySelector('.zoom-slider');
const $mirror = document.querySelector('.mirror');
const $ruler = document.querySelector('.ruler');
const $foots = document.querySelector('.foots');
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
        const { id } = target.dataset;
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
    document.body.style.setProperty('--zoom', $zoomSlider.value);
    $measure.checked && setDragGesture();
};
const wheel = ({deltaY}) => {
    $zoomSlider.value = + $zoomSlider.value + (deltaY > 0 ? -4: 4);
    zoom();
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
        $pristine.remove();
    }
    else if($reverse.checked === false && $floor.dataset.reversed === 'true') {
        const interpolate = $text => $text.setAttribute('transform', $text.dataset.transform);
        $floor.dataset.reversed = false;
        $floor.querySelectorAll('text').forEach(interpolate);
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
    restore();
};
const setScale = () => {
    if($view.dataset.scaled === undefined) {
        const { width, height } = $scene.getBoundingClientRect();
        const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        $view.style.setProperty('--scale-x', scale);
        $view.style.setProperty('--scale-y', scale);
        $view.dataset.scale = scale;
    }
};
const hideViewOptions = ({ id }) => document.getElementById(id).remove();
const setFloor = ({name, id, options}, idx) => {
    const $floorOption = document.createElement('li');
    const $target = document.getElementById(id);
    $floorOption.textContent = name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    if(idx){
        $floorOption.classList.add('excluded');
        $target.remove()
    }
    else {
        $floor = $target;
    }
    $floorOption.dataset.id = `#${id}`;
    $floorSelector.appendChild($floorOption);
    options && options.forEach(hideViewOptions);
};
const insertView = ([text, { Drag, Measure }]) => {
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    $pristine = $scene.cloneNode(true);
    plan.floors.forEach(setFloor);
    drag = new Drag({ $view, $zoomSlider, zoom });
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
document.querySelector('.print-button').onclick = () => window.print();
document.querySelector('.reset-button').onclick = reset;
$reverse.onchange = mirror;
$measure.onchange = toggleMeasure;
window.onresize = resize;

fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);
