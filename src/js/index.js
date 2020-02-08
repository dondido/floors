let plan, $pane;
const handleJson = response => response.json();
const handleText = response => response.text();
const fetchAsync = async (url) => await (await fetch(url)).json();
const $views = document.querySelector('.views');
const $floorSelector = document.querySelector('.floor-selector');
const $zoomSlider = document.querySelector('.zoom-slider');
const views = [];
const floorOptions = [];
const hideNode = node => node.hidden = true;
const selectFloor = (e) => {
    const { target } = e;
    $floorSelector.classList.toggle('expand');
    if (target.hidden) {
        floorOptions.forEach(hideNode);
        views.forEach(hideNode);
        target.hidden = false;
        $pane = document.getElementById(target.dataset.ref);
        reset();
    }
};
const zoom = () => document.body.style.setProperty('--custom-scale', $zoomSlider.value);
const wheel = ({deltaY}) => {
    $zoomSlider.value = + $zoomSlider.value + (deltaY > 0 ? -4: 4);
    zoom();
};
const init = () => {
    $pane.hidden = false;
    setScale($pane);
    dragNode($pane);
};
const reset = () => {
    $zoomSlider.value = 0;
    zoom();
    init();
};

const setScale = ($view) => {
    if($view.dataset.scaled === undefined) {
        const $svg = $view.querySelector('svg');
        const { width, height } = $svg.getBoundingClientRect();
        const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        $svg.style.setProperty('--default-scale', scale);
        $view.dataset.scaled = true;
    }
};
const setFloor = (floor) => {
    const $view = document.createElement('div');
    const $floorOption = document.createElement('li');
    const appendSvg = text => $view.innerHTML = text;
    $floorOption.textContent = floor.name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    $view.hidden = $floorOption.hidden = true;
    $floorOption.dataset.ref = $view.id = `view${views.length}`;
    $floorSelector.appendChild($floorOption);
    $view.className = 'view';
    views.push($view);
    $views.appendChild($view);

    return fetch(floor.src)
        .then(handleText)
        .then(appendSvg);
};
const dragNode = (node) => {
    let x2 = 0, y2 = 0, x1 = 0, y1 = 0, hypo = 0, initialZoom = 0;
    let pointers = [];
    const pointerup = () => {
        pointers = [];
        hypo = 0;
        document.body.onpointermove = null;
    };
    const pointerdown = e => {
        if(pointers.length === 0 && e.target.closest('.views')) {
            x1 = e.clientX - parseInt(getComputedStyle(node).getPropertyValue('--x'));
            y1 = e.clientY - parseInt(getComputedStyle(node).getPropertyValue('--y'));
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
        node.style.setProperty('--x', `${node.offsetLeft - x2}px`);
        node.style.setProperty('--y', `${node.offsetTop - y2}px`);
    };
    node.style.setProperty('--x', 0);
    node.style.setProperty('--y', 0);
    document.body.onpointerdown = pointerdown;
    document.body.onpointerup = pointerup;
    document.body.onpointercancel = pointerup;
    document.body.onpointerout = pointerup;
};
const loadPlan = async (raw) => {
    plan = { ...raw };
    await setFloor(raw.shift());
    $pane = document.querySelector('.view');
    document.querySelector('.floor-option').hidden = false;
    init();
    $floorSelector.onclick = selectFloor;
    $zoomSlider.oninput = zoom;
    $views.onwheel = wheel;
    raw.forEach(setFloor);
};
document.querySelector('.reset-button').onclick = reset;

fetch('plan.json')
    .then(handleJson)
    .then(loadPlan);
