import inject from './index.js';

const floorMap = {};
const $floors = document.querySelector('.floor-option-template').content.firstElementChild;
const $floorOptionItem = document.querySelector('.floor-option-item-template').content.firstElementChild;
const $floorOptionInfo = document.querySelector('.floor-option-info-template').content.firstElementChild;
const $floorList = document.querySelector('.floor-list');
const setDisabled = (acc, id) => `${acc}<li>${floorMap[id]}</li>`;
const mapNameToId = (acc, { id, name }) => Object.assign(acc, { [id]: name });;

const setFloor = ({name, id, options}) => {
    if (options === undefined) {
        return;
    }
    const $floor = $floors.cloneNode(true);
    const $floorBody = $floor.querySelector('.floor-item-body');
    const setOption = ({ name, disable }) => {
        const $floorOption = $floorOptionItem.cloneNode(true);
        $floorOption.firstElementChild.textContent = name;
        $floorBody.appendChild($floorOption);
        if (disable) {
            const $floorInfo = $floorOptionInfo.cloneNode(true);
            $floorInfo.querySelector('.floor-option-info-list').innerHTML = disable.reduce(setDisabled, '');
            $floorBody.appendChild($floorInfo);
        }
    };
    Object.assign(floorMap, options.reduce(mapNameToId, { [id]: name }));
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