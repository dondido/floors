import inject from './index.js';

const floorMap = {};
const $floors = document.querySelector('.floor-option-template').content.firstElementChild;
const $floorOptionItem = document.querySelector('.floor-option-item-template').content.firstElementChild;
const $floorOptionInfo = document.querySelector('.floor-option-info-template').content.firstElementChild;
const $floorList = document.querySelector('.floor-list');
const setDisabled = (acc, id) => `${acc}<li>${floorMap[id].name}</li>`;
const mapNameToId = function(acc, i) {
    return Object.assign(acc, { [i.id]: { parentId: `floor-${this.id}`, ...i } });
};
const deleteElement = id => {
    const $target = document.getElementById(id);
    $target && $target.remove();
};
const enableOption = ({ target, checked = target.getAttribute('aria-checked') !== 'true' }) => {
    const count = checked ? 1 : -1;
    const $floorBody = target.closest('.floor-item-body');
    const { id } = target.dataset;
    const { disable = [], required = [], parentId } = floorMap[id];
    const { $pristine, selectFloor } = inject();
    const toggleOthers = (ref) => {
        const $target = $floorBody.querySelector(`[data-id="${ref}"]`);
        if ($target) {
            $target.disabled = checked;
            $target.setAttribute('aria-checked', false);
        }
        deleteElement(ref);
    };
    const enableRequired = id => {
        const $ref = $floorBody.querySelector(`[data-id="${id}"]`);
        $ref.getAttribute('aria-checked') !== 'true' && enableOption({ target: $ref });
    };
    target.disabled = false;
    target.setAttribute('aria-checked', checked);
    if (checked) {
        const $parent = document.getElementById(parentId);
        const $option = $pristine.querySelector(`#${id}`).cloneNode(true);
        if ($parent) {
            $parent.appendChild($option);
        }
        else {
            selectFloor({ target: document.querySelector(`[data-ref="${parentId}"]`) })
            inject().$floor.prepend($option);
        }
    }
    else {
        deleteElement(id);
    }
    disable.forEach(toggleOthers);
    required.forEach(enableRequired)
    for (const i in floorMap) {
        const { required } = floorMap[i];
        if (required && required.includes(id)) {
            const $ref = $floorBody.querySelector(`[data-id="${i}"]`);
            $ref.requiredCount = Math.max($ref.requiredCount - count, 0);
            $ref.disabled = $ref.requiredCount;
        }
    }
};
const setFloor = (floor) => {
    const {name, id, options} = floor;
    if (options === undefined) {
        return;
    }
    const $floor = $floors.cloneNode(true);
    const $floorBody = $floor.querySelector('.floor-item-body');
    const setOption = ({ name, id, disable, required = [] }) => {
        const $floorOption = $floorOptionItem.cloneNode(true);
        const $button = $floorOption.firstElementChild;
        $button.textContent = name;
        $button.dataset.id = id;
        $button.onclick = enableOption;
        $floorBody.appendChild($floorOption);
        if (disable || required.length) {
            const $floorInfo = $floorOptionInfo.cloneNode(true);
            const $subButton = $floorInfo.querySelector('.floor-extra-option-button');
            if (disable) {
                $floorInfo.querySelector('.floor-option-info-list').innerHTML = disable.reduce(setDisabled, '');
            }
            else {
                $floorInfo.classList.add('hide-content');
            }
            $subButton.dataset.id = id;
            $subButton.onclick = () => enableOption({ target: $button, checked: true });
            $floorOption.appendChild($floorInfo);
        }
        $button.disabled = required.length;
        $button.requiredCount = required.length;
    };
    Object.assign(floorMap, options.reduce(mapNameToId.bind({ id }), { [id]: floor }));
    $floor.querySelector('.floor-item-summary').textContent = name;
    options.forEach(setOption);
    $floorList.appendChild($floor);
};
const setFloorOptions = (plan) => plan.floors.forEach(setFloor);

inject()
    .planPromise
    .then(setFloorOptions);