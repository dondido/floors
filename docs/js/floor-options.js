import inject from './index.js';

let currentFloorIndex = 0;
const floorMap = {};
const infos = [];
const floorNodes = [];
const $floors = document.querySelector('.floor-option-template').content.firstElementChild;
const $floorOptionItem = document.querySelector('.floor-option-item-template').content.firstElementChild;
const $floorOptionInfo = document.querySelector('.floor-option-info-template').content.firstElementChild;
const $floorOptionsTab = document.querySelector('.floor-options-tab');
const $floorList = document.querySelector('.floor-list');
const $floorListContainer = $floorList.parentElement;
const $prev = document.querySelector('.floor-prev-button');
const $next = document.querySelector('.floor-next-button');
const listOtions = (acc, id) => `${acc}<li>${floorMap[id].name}</li>`;
const mapNameToId = function(acc, i) {
    return Object.assign(acc, { [i.id]: { parentId: `floor-${this.id}`, ...i } });
};
const updateY = ($target) => {
    if (window.innerWidth > 1024) {
        const { top, bottom } =  $target.parentElement.getBoundingClientRect();
        $target.style.top = `${(top + bottom) / 2}px`;
    }
};
const deleteElement = id => {
    const $target = document.getElementById(id);
    $target && $target.remove();
};
const updateFloorOptionsCount = (acc, $target) => {
    const count = $target.querySelectorAll('.floor-option-button[aria-checked="true"]').length;
    $target.querySelector('.floor-item-summary').dataset.count = count;
    return acc + count;
};
const updateTotalOptionsCount = () =>
    $floorOptionsTab.dataset.count = floorNodes.reduce(updateFloorOptionsCount, 0);
const enableOption = ({ target, checked = target.getAttribute('aria-checked') !== 'true' }) => {
    const count = checked ? 1 : -1;
    const $floorBody = target.closest('.floor-item-body');
    const { id } = target.dataset;
    const { disable = [], required = [], parentId } = floorMap[id];
    const { $pristine, selectFloor, mirror } = inject();
    const toggleOthers = (ref) => {
        $floorBody.querySelector(`[data-id="${ref}"]`)?.setAttribute('aria-checked', false);
        deleteElement(ref);
    };
    const enableRequired = id => {
        const $ref = $floorBody.querySelector(`[data-id="${id}"]`);
        $ref.getAttribute('aria-checked') !== 'true' && enableOption({ target: $ref });
    };
    selectFloor({ target: document.querySelector(`[data-ref="${parentId}"]`) }, true);
    const $parent = document.getElementById(parentId);
    const insertAt = () => {
        const $g = $pristine.querySelector(`#${id}`).cloneNode(true);
        const idx = $g.getAttribute('idx');
        const getNodeAfter = $n => idx < $n.getAttribute('idx');
        Array.from($parent.children).find(getNodeAfter).insertAdjacentElement('beforebegin', $g);
    };
    const uncheckRequired = ($checkedOption) => {
        if (floorMap[$checkedOption.dataset.id].required?.includes(target.dataset.id)) {
            $checkedOption.setAttribute('aria-checked', false);
        }
    };
    checked ? insertAt() : deleteElement(id);
    target.setAttribute('aria-checked', checked);
    disable.forEach(toggleOthers);
    required.forEach(enableRequired);
    $floorBody.querySelectorAll('.floor-option-button[aria-checked=true]').forEach(uncheckRequired);
    const extractDisabled =  ({ dataset }) => floorMap[dataset.id].disable;
    const disabled = [...new Set(Array.from($floorBody.querySelectorAll('.floor-option-button[aria-checked=true]'), extractDisabled).flat())];
    const setCheck = (id) => {
        if (floorMap[id].required === undefined) {
            $floorBody.querySelector(`[data-id="${id}"]`).disabled = disabled.includes(id);
        }
    };
    Array.from(new Set(Array.from($floorBody.querySelectorAll('[data-id]'), ({ dataset }) => dataset.id))).forEach(setCheck);
    if($parent.querySelectorAll('g').length === 0) {
        $parent.prepend($pristine.querySelector(`#${parentId.slice(6)}`).cloneNode(true));
    }
    mirror();
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
    updateTotalOptionsCount();
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
    floorNodes.push($floor);
    const $floorBody = $floor.querySelector('.floor-item-body');
    const $summary = $floor.querySelector('.floor-item-summary');
    const setOption = ({ name, id, disable = [], required = [] }) => {
        const $floorOption = $floorOptionItem.cloneNode(true);
        const $button = $floorOption.firstElementChild;
        $button.textContent = name;
        $button.dataset.id = id;
        $button.onclick = enableOption;
        $floorBody.appendChild($floorOption);
        if (disable || required.length) {
            const $floorInfo = $floorOptionInfo.cloneNode(true);
            const $subButton = $floorInfo.querySelector('.floor-extra-option-button');
            infos.push($floorInfo.querySelector('.floor-option-info-desc'));
            if (disable.length) {
                $floorInfo.querySelector('.floor-option-info-list').innerHTML = disable.reduce(listOtions, '');
            }
            else {
                $floorInfo.querySelector('.floor-option-info-disable').remove();
            }
            if (required.length) {
                $floorInfo.querySelector('.floor-option-info-required .floor-option-info-list').innerHTML = required.reduce(listOtions, '');
            }
            else {
                $floorInfo.querySelector('.floor-option-info-required').remove();
            }
            $subButton.dataset.id = id;
            $subButton.onclick = () => {
                enableOption({ target: $button, checked: true });
                $floorInfo.firstElementChild.setAttribute('aria-checked', false);
            };
            $floorOption.appendChild($floorInfo);
            $floorInfo.querySelector('.submenu-button').onclick = ({ target }) =>
                target.setAttribute('aria-checked', target.getAttribute('aria-checked') !== 'true')
        }
        setButtonRequiredCount($button, required.length);
    };
    Object.assign(floorMap, options.reduce(mapNameToId.bind({ id }), { [id]: floor }));
    $summary.textContent = name;
    $summary.dataset.id = `floor-${id}`;
    idx === 0 && $summary.classList.add('highlight-summary');
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
    floorNodes[0].classList.add('current-floor');
    document.querySelector('.floor-reset-button').onclick = () => {
        floors.forEach(mopFloor);
        Array.from($floorList.querySelectorAll('.floor-option-button'), uncheckButton);
        updateTotalOptionsCount();
        setTimeout(() => infos.forEach(updateY));
    };
};
const updateSliderButtons = () => {
    $prev.disabled = false;
    $next.disabled = false;
    if(currentFloorIndex === 0) {
        $prev.disabled = true;
    }
    if(currentFloorIndex === floorNodes.length - 1) {
        $next.disabled = true;
    }
};
const updateSlide = ({ target }) => {
    floorNodes[currentFloorIndex].classList.remove('current-floor');
    currentFloorIndex = + target.dataset.slide + currentFloorIndex;
    floorNodes[currentFloorIndex].classList.add('current-floor');
    updateSliderButtons();
};

$prev.onclick = updateSlide;
$next.onclick = updateSlide;
updateSliderButtons();

inject()
    .planPromise
    .then(setFloorOptions);