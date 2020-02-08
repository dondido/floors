let plan;
const handleJson = response => response.json();
const handleText = response => response.text();
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
        document.getElementById(target.dataset.ref).hidden = false;
    }
};
const zoom = () => document.body.style.setProperty('--custom-scale', $zoomSlider.value);
const loadPlan = (raw) => {
    const $viewFragment = document.createDocumentFragment();
    const $floorFragment = document.createDocumentFragment();
    plan = raw;
    plan.forEach((floor, idx) => {
        const $view = document.createElement('div');
        const $floorOption = document.createElement('li');
        const appendSvg = text => {
            $view.innerHTML = text;
            const $svg = $view.querySelector('svg');
            const { width, height } = $svg.getBoundingClientRect();
            const scale = Math.min(window.innerWidth/width, window.innerHeight/height);
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
    });
    $views.appendChild($viewFragment);
    $floorSelector.appendChild($floorFragment);
    document.querySelector('.floor-option').hidden = false;
    document.querySelector('.view').hidden = false;
    $floorSelector.addEventListener('click', selectFloor)
    $zoomSlider.addEventListener('input', zoom);
};

fetch('plan.json')
  .then(handleJson)
  .then(loadPlan);