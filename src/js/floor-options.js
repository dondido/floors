import inject from './index.js';

const floorMap = {};
const $floors = document.querySelector('.floor-option-template').content.firstElementChild;
const $floorOptionItem = document.querySelector('.floor-option-item-template').content.firstElementChild;
const $floorOptionInfo = document.querySelector('.floor-option-info-template').content.firstElementChild;
const $floorList = document.querySelector('.floor-list');
const setDisabled = (acc, id) => `${acc}<li>${floorMap[id]}</li>`;
const mapNameToId = (acc, i) => Object.assign(acc, { [i.id]: i });

const enableOption = ({ target }) => {
    const checked = target.getAttribute('aria-checked') !== 'true';
    const $floorBody = target.closest('.floor-item-body');
    const { id } = target.dataset;
    console.log(123, id, floorMap[id])
    const { disable = [] } = floorMap[id];
    const disableOthers = (ref) => {
        console.log(112, ref)
        const $target = $floorBody.querySelector(`[data-id="${ref}"]`);
        $target.dataset.disabled ++;
    };
    target.setAttribute('aria-checked', checked);
    document.getElementById(id).setAttribute('display', checked ? 'inline' : 'none');
    disable.forEach(disableOthers);
};

const setFloor = (floor) => {
    const {name, id, options} = floor;
    if (options === undefined) {
        return;
    }
    const $floor = $floors.cloneNode(true);
    const $floorBody = $floor.querySelector('.floor-item-body');
    const setOption = ({ name, id, disable, disabled = 0 }) => {
        const $floorOption = $floorOptionItem.cloneNode(true);
        const $button = $floorOption.firstElementChild;
        $button.textContent = name;
        $button.dataset.id = id;
        $button.dataset.disabled = disabled;
        $button.onclick = enableOption;
        $floorBody.appendChild($floorOption);
        if (disable) {
            const $floorInfo = $floorOptionInfo.cloneNode(true);
            const $subButton = $floorInfo.querySelector('.floor-extra-option-button');
            $floorInfo.querySelector('.floor-option-info-list').innerHTML = disable.reduce(setDisabled, '');
            $subButton.dataset.id = id;
            $subButton.onclick = () => enableOption({ target: $button });
            $floorOption.appendChild($floorInfo);
        }
    };
    Object.assign(floorMap, options.reduce(mapNameToId, { [floor.id]: floor }));
    $floor.querySelector('.floor-item-summary').textContent = name;
    options.forEach(setOption);
    $floorList.appendChild($floor);
};

const setFloorOptions = (plan) => {
    plan.floors.forEach(setFloor);
}

inject()
    .planPromise
    .then(setFloorOptions);