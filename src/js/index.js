let plan, $pristine, $scene, $floor;
const handleJson = response => response.json();
const handleText = response => response.text();
const $dirty = document.createDocumentFragment();
const $port = document.querySelector('.port');
const $view = document.querySelector('.view');
const $floorSelector = document.querySelector('.floor-selector');
const $zoomSlider = document.querySelector('.zoom-slider');
const $mirror = document.querySelector('.mirror');
const $reverse = document.getElementById('reverse');
const floorOptions = [];
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
const zoom = () => document.body.style.setProperty('--zoom', $zoomSlider.value);
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
    dragNode();
};
const restore = () => {
    $zoomSlider.value = 0;
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
        $view.dataset.scaled = true;
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
const dragNode = () => {
    let x2 = 0, y2 = 0, x1 = 0, y1 = 0, hypo = 0, initialZoom = 0;
    let pointers = [];
    const pointerup = () => {
        pointers = [];
        hypo = 0;
        document.body.onpointermove = null;
    };
    const pointerdown = e => {
        if(pointers.length === 0 && e.target.closest('.port')) {
            x1 = e.clientX - parseInt(getComputedStyle($view).getPropertyValue('--x'));
            y1 = e.clientY - parseInt(getComputedStyle($view).getPropertyValue('--y'));
            initialZoom = + $zoomSlider.value;
            document.body.onpointermove = pointermove;
        }
        pointers.push(e);
    };
    const pointermove = (e) => {
        const [ e1, e2, e3 ] = pointers;
        if(e3) {
            return;
        }
        if(e2) {
            let e4;
            if (e.pointerId === e1.pointerId) {
                e4 = e2;
                pointers[0] = e;
            }
            else {
                e4 = e1;
                pointers[1] = e;
            }
            const hypo1 = Math.hypot(e4.clientX - e.clientX, e4.clientY - e.clientY);
            hypo = hypo || hypo1;
            $zoomSlider.value = initialZoom + Math.min(1, hypo1/hypo - 1) * 100;
            return zoom();
        }
        x2 = x1 - e.clientX;
        y2 = y1 - e.clientY;
        $view.style.setProperty('--x', `${$view.offsetLeft - x2}px`);
        $view.style.setProperty('--y', `${$view.offsetTop - y2}px`);
    };
    $view.style.setProperty('--x', 0);
    $view.style.setProperty('--y', 0);
    document.body.onpointerdown = pointerdown;
    document.body.onpointerup = pointerup;
    document.body.onpointercancel = pointerup;
    document.body.onpointerout = pointerup;
};
const insertView = (text) => {
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    $pristine = $scene.cloneNode(true);
    plan.floors.forEach(setFloor);
    init();
    $floorSelector.onclick = selectFloor;
    $zoomSlider.oninput = zoom;
    $port.onwheel = wheel;
};
const handlePlan = (raw) => {
    plan = raw;
    return fetch(plan.src)
        .then(handleText)
        .then(insertView);
};
document.querySelector('.reset-button').onclick = reset;
$reverse.onchange = mirror;

fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);
