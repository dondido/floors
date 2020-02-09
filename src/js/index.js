let plan, $pane;
const handleJson = response => response.json();
const handleText = response => response.text();
const fetchAsync = async (url) => await (await fetch(url)).json();
const $views = document.querySelector('.views');
const $floorSelector = document.querySelector('.floor-selector');
const $zoomSlider = document.querySelector('.zoom-slider');
const $mirror = document.querySelector('.mirror');
const $reverse = document.getElementById('reverse');
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
        $reverse.checked = false;
        mirror();
        $pane = $views.querySelector(target.dataset.ref);
        restore();
    }
};
const zoom = () => document.body.style.setProperty('--zoom', $zoomSlider.value);
const wheel = ({deltaY}) => {
    $zoomSlider.value = + $zoomSlider.value + (deltaY > 0 ? -4: 4);
    zoom();
};
const mirror = () => {
    if ($reverse.checked) {
        const $clone = $pane.cloneNode(true);
        const $texts = $clone.querySelectorAll('[id^=te]');
        const interpolate = ($text, idx) => {
            const { left, right } = $texts[idx].getBoundingClientRect();
            $text.dataset.class = $text.getAttribute('class') || '';
            $text.style.setProperty('--translate-x', `${left + right}px`);
            $text.setAttribute('class', `${$text.dataset.class} text-flip`);
        };
        $clone.classList.remove('view');
        $mirror.appendChild($clone);
        $pane.querySelectorAll('[id^=te]').forEach(interpolate);
        return $clone.remove();
    }
    const interpolate = $text => $text.setAttribute('class', $text.dataset.class);
    $pane.querySelectorAll('[id^=te]').forEach(interpolate);
};
const init = () => {
    $pane.hidden = false;
    setScale($pane);
    dragNode($pane);
};
const restore = () => {
    $zoomSlider.value = 0;
    zoom();
    init();
};
const reset = () => {
    $reverse.checked = false;
    mirror();
    restore();
};
const setScale = ($view) => {
    if($view.dataset.scaled === undefined) {
        const { width, height } = $view.querySelector('svg').getBoundingClientRect();
        const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        $view.style.setProperty('--scale-x', scale);
        $view.style.setProperty('--scale-y', scale);
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
    $floorOption.dataset.ref = `.view${views.length}`;
    $view.className = `view view${views.length}`;
    $floorSelector.appendChild($floorOption);
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
    $pane = $views.firstElementChild;
    document.querySelector('.floor-option').hidden = false;
    init();
    $floorSelector.onclick = selectFloor;
    $zoomSlider.oninput = zoom;
    $views.onwheel = wheel;
    raw.forEach(setFloor);
};
document.querySelector('.reset-button').onclick = reset;
$reverse.onchange = mirror;

fetch('plan.json')
    .then(handleJson)
    .then(loadPlan);
