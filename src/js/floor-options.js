import inject from './index.js';

const floorMap = {};
const infos = [];
const $floors = document.querySelector('.floor-option-template').content.firstElementChild;
const $floorOptionItem = document.querySelector('.floor-option-item-template').content.firstElementChild;
const $floorOptionInfo = document.querySelector('.floor-option-info-template').content.firstElementChild;
const $floorList = document.querySelector('.floor-list');
const $floorListContainer = $floorList.parentElement;
const setDisabled = (acc, id) => `${acc}<li>${floorMap[id].name}</li>`;
const mapNameToId = function(acc, i) {
    return Object.assign(acc, { [i.id]: { parentId: `floor-${this.id}`, ...i } });
};
const updateY = ($target) => {
    const { top, bottom } =  $target.parentElement.getBoundingClientRect();
    $target.style.top = `${(top + bottom) / 2}px`;
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
    selectFloor({ target: document.querySelector(`[data-ref="${parentId}"]`) }, true);
    if (checked) {
        const $parent = document.getElementById(parentId);
        const $option = $pristine.querySelector(`#${id}`).cloneNode(true);
        $parent ? $parent.appendChild($option) : inject().$floor.prepend($option)
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
            if ($ref.disabled) {
                $ref.setAttribute('aria-checked', false);
            }
        }
    }
    target.setAttribute('aria-checked', checked);
    target.disabled = false;
    setTimeout(() => infos.forEach(updateY));
};
const setButtonRequiredCount = ($button, count) => {
    $button.disabled = count;
    $button.requiredCount = count;
};
const setFloor = (floor, idx) => {
    const {name, id, options} = floor;
    if (options === undefined) {
        return;
    }
    const $floor = $floors.cloneNode(true);
    const $floorBody = $floor.querySelector('.floor-item-body');
    const $summary = $floor.querySelector('.floor-item-summary');
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
            infos.push($floorInfo.firstElementChild);
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
        setButtonRequiredCount($button, required.length);
    };
    Object.assign(floorMap, options.reduce(mapNameToId.bind({ id }), { [id]: floor }));
    $summary.textContent = name;
    $summary.dataset.id = `floor-${id}`;
    idx === 0 &&$summary.classList.add('highlight-summary');
    options.forEach(setOption);
    $floorList.appendChild($floor);
    $floorListContainer.onscroll = () => infos.forEach(updateY);
    infos.forEach(updateY);
};
const removeFloorOption = $target => $target.remove();
const uncheckButton = $button => {
    const { required = [] } = floorMap[$button.dataset.id];
    $button.setAttribute('aria-checked', false);
    setButtonRequiredCount($button, required.length);
};
const setFloorOptions = ({ floors }) => {
    const { $pristine, $dirty } = inject();
    const mopFloor = ({ id }) => {
        const floorId = `#floor-${id}`;
        const $floor = document.querySelector(floorId) || $dirty.querySelector(floorId);
        if ($floor) {
            Array.from($floor.querySelectorAll('g'), removeFloorOption);
            $floor.prepend($pristine.querySelector(`#${id}`).cloneNode(true));
        }
    }
    floors.forEach(setFloor);
    document.querySelector('.floor-reset-button').onclick = () => {
        floors.forEach(mopFloor);
        Array.from($floorList.querySelectorAll('.floor-option-button'), uncheckButton);
        setTimeout(() => infos.forEach(updateY));
    };
};

inject()
    .planPromise
    .then(setFloorOptions);