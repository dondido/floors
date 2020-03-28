import inject from './index.js';

const floorMap = {};
const $floors = document.querySelector('.floor-option-template').content.firstElementChild;
const $floorOptionItem = document.querySelector('.floor-option-item-template').content.firstElementChild;
const $floorOptionInfo = document.querySelector('.floor-option-info-template').content.firstElementChild;
const $floorList = document.querySelector('.floor-list');
const setDisabled = (acc, id) => `${acc}<li>${floorMap[id].name}</li>`;
const mapNameToId = (acc, i) => Object.assign(acc, { [i.id]: i });

const enableOption = ({ target }) => {
    const checked = target.getAttribute('aria-checked') !== 'true';
    const $floorBody = target.closest('.floor-item-body');
    const { id } = target.dataset;
    const { disable = [] } = floorMap[id];
    const toggleOthers = (ref) => {
        const $target = $floorBody.querySelector(`[data-id="${ref}"]`);
        $target.disabled = checked;
        $target.setAttribute('aria-checked', false);
    };
    target.disabled = false;
    target.setAttribute('aria-checked', checked);
    document.getElementById(id).setAttribute('display', checked ? 'inline' : 'none');
    disable.forEach(toggleOthers);
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