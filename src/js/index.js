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
    let x2 = 0, y2 = 0, x1 = 0, y1 = 0;
    const end = () => {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    };
    const drag = (e) => {
        e.preventDefault();
        // calculate the new cursor position:
        x2 = x1 - e.clientX;
        y2 = y1 - e.clientY;
        // set the element's new position:
        node.style.setProperty('--x', `${node.offsetLeft - x2}px`);
        node.style.setProperty('--y', `${node.offsetTop - y2}px`);
    };
    const start = (e) => {
        e.preventDefault();
        // get the mouse cursor position at startup:
        x1 = e.clientX - parseInt(getComputedStyle(node).getPropertyValue('--x'));
        y1 = e.clientY - parseInt(getComputedStyle(node).getPropertyValue('--y'));
        document.onmouseup = end;
        // call a function whenever the cursor moves:
        document.onmousemove = drag;
    };
    node.style.setProperty('--x', 0);
    node.style.setProperty('--y', 0);
    $views.onmousedown = start;
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

fetch('plan.json')
    .then(handleJson)
    .then(loadPlan);