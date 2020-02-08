let plan, $pane;
const handleJson = response => response.json();
const handleText = response => response.text();
const $views = document.querySelector('.views');
const $floorSelector = document.querySelector('.floor-selector');
const $zoomSlider = document.querySelector('.zoom-slider');
const $viewFragment = document.createDocumentFragment();
const $floorFragment = document.createDocumentFragment();
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
        $pane.hidden = false;
    }
};
const zoom = () => document.body.style.setProperty('--custom-scale', $zoomSlider.value);
const setFloor = (floor, idx) => {
    const $view = document.createElement('div');
    const $floorOption = document.createElement('li');
    const appendSvg = text => {
        $view.innerHTML = text;
        const $svg = $view.querySelector('svg');
        const { width, height } = $svg.getBoundingClientRect();
        const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        $svg.style.setProperty('--default-scale', scale);
    };
    $floorOption.textContent = floor.name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    $view.hidden = $floorOption.hidden = true;
    $floorOption.dataset.ref = $view.id = `view${idx}`;
    $floorFragment.appendChild($floorOption);
    $view.className = 'view';
    views.push($view);
    $viewFragment.appendChild($view);

    fetch(floor.src)
        .then(handleText)
        .then(appendSvg)
};
const dragNode = (node) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const end = () => {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    };
    const drag = (e) => {
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        // set the element's new position:
        node.style.setProperty('--x', `${node.offsetLeft - pos1}px`);
        node.style.setProperty('--y', `${node.offsetTop - pos2}px`);
    };
    const start = (e) => {
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX - parseInt(getComputedStyle(node).getPropertyValue('--x'));
        pos4 = e.clientY - parseInt(getComputedStyle(node).getPropertyValue('--y'));
        document.onmouseup = end;
        // call a function whenever the cursor moves:
        document.onmousemove = drag;
    };
    $views.onmousedown = start;
};
const loadPlan = (raw) => {
    plan = raw;
    plan.forEach(setFloor);
    $views.appendChild($viewFragment);
    $floorSelector.appendChild($floorFragment);
    $pane = document.querySelector('.view');
    document.querySelector('.floor-option').hidden = false;
    $pane.hidden = false;
    dragNode($pane);
    $floorSelector.addEventListener('click', selectFloor)
    $zoomSlider.addEventListener('input', zoom);
};

fetch('plan.json')
    .then(handleJson)
    .then(loadPlan);