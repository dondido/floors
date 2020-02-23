let plan, $pristine, $scene, $floor;
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
    new Drag();
    $ruler.classList.remove('apply');
};
const toggleMeasure = () => {
    if($measure.checked) {
        new Measure();
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
    new Drag();
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
        console.log('width, height', width, height)
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
class Gesture {
    attach() {
        document.body.onpointerdown = this.pointerdown;
        document.body.onpointerup = this.pointerup;
        document.body.onpointercancel =this.pointerup;
        document.body.onpointerout = this.pointerup;
    }
}
class Measure extends Gesture {
    constructor() {
        super();
        this.attach();
    }
    pointerdown = (e) => {
        if(e.target.closest('.port')) {
            if(Number.isInteger(this.x1) === false) {
                this.x1 = e.clientX;
                this.y1 = e.clientY;
                $ruler.classList.add('apply');
                document.body.onpointermove = this.pointermove;
            }
            else {
                this.pointermove(e);
                this.pointerup();
            }
        }
    }
    toFt(value) {
        const widthRatio = $scene.clientWidth / $scene.width.baseVal.value;
        const ratio = widthRatio === 1 ? $scene.clientHeight / $scene.height.baseVal.value : widthRatio;
        const [feet, inches = '0'] = String(value / (ratio * plan.footRatio * $view.dataset.scale * (1 + $zoomSlider.value / 50))).split('.');
        return `${feet}' ${Math.round(inches[0] * 1.2)}''`;
    }
    pointermove = ({ clientX, clientY }) => {
        const width = Math.abs(this.x1 - clientX);
        const height = Math.abs(this.y1 - clientY);
        $ruler.classList.remove('width', 'height');
        if(width > height) {
            $ruler.style.top = `${this.y1}px`;
            $ruler.style.left = `${Math.min(this.x1, clientX)}px`;
            $ruler.style.width = `${width}px`;
            $ruler.classList.add('width');
            $foots.textContent = this.toFt(width);
        }
        else {
            $ruler.style.top = `${Math.min(this.y1, clientY)}px`;
            $ruler.style.left = `${this.x1}px`;
            $ruler.style.height = `${height}px`;
            $ruler.classList.add('height');
            $foots.textContent = this.toFt (height);
        }
    }
    pointerup = () => {
        this.x1 = null;
        this.y1 = null;
        document.body.onpointermove = null;
    }
}
class Drag extends Gesture {
    constructor() {
        super();
        this.attach();
        $view.style.setProperty('--x', 0);
        $view.style.setProperty('--y', 0);
    }
    pointers = []
    initialZoom = 0
    pointerup = () => {
        this.pointers = [];
        this.hypo = 0;
        document.body.onpointermove = null;
    }
    pointerdown = (e) => {
        if(this.pointers.length === 0 && e.target.closest('.port')) {
            this.x1 = e.clientX - parseInt(getComputedStyle($view).getPropertyValue('--x'));
            this.y1 = e.clientY - parseInt(getComputedStyle($view).getPropertyValue('--y'));
            this.initialZoom = + $zoomSlider.value;
            document.body.onpointermove = this.pointermove;
        }
        this.pointers.push(e);
    }
    pointermove = (e) => {
        const [ e1, e2, e3 ] = this.pointers;
        if(e3) {
            return;
        }
        if(e2) {
            let e4;
            if (e.pointerId === e1.pointerId) {
                e4 = e2;
                this.pointers[0] = e;
            }
            else {
                e4 = e1;
                this.pointers[1] = e;
            }
            const hypo1 = Math.hypot(e4.clientX - e.clientX, e4.clientY - e.clientY);
            this.hypo = this.hypo || hypo1;
            $zoomSlider.value = this.initialZoom + Math.min(1, hypo1/this.hypo - 1) * 100;
            return zoom();
        }
        this.x2 = this.x1 - e.clientX;
        this.y2 = this.y1 - e.clientY;
        $view.style.setProperty('--x', `${$view.offsetLeft - this.x2}px`);
        $view.style.setProperty('--y', `${$view.offsetTop - this.y2}px`);
    }
}
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
$measure.onchange = toggleMeasure;
window.onresize = resize;

fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);
