import resolvePLan from './index.js';

const $floors = document.querySelector('.floor-option-template').content.firstElementChild.cloneNode(true);
const $floorList = document.querySelector('.floor-list');

const setFloor = ({name, id, options}, idx) => {
    if (options === undefined) {
        return;
    }
    const $floor = $floors.cloneNode(true);
    const $floorBody = $floor.querySelector('.floor-item-body');
    const setOption = option => {
        const $floorOption = document.createElement('li');
        $floorOption.textContent = option.name;
        $floorBody.appendChild($floorOption);
    };
    
   
    $floor.querySelector('.floor-item-summary').textContent = name;
    options.forEach(setOption);
    $floorList.appendChild($floor);
    
    /* const $target = document.getElementById(id);
    $target.insertAdjacentHTML('beforeend', '<foreignObject data-drag-area=".view"></foreignObject>');
    $floorOption.textContent = name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    if(idx){
        $pristine.appendChild($target);
    }
    else {
        $floor = $target;
        $floorOption.classList.add('selected');
        $pristine.appendChild($target.cloneNode(true));
    }
    $floorOption.dataset.ref = id;
    $floorSelector.appendChild($floorOption);
    options && options.forEach(hideViewOptions); */
};



const setFloorOptions = (plan) => {
    plan.floors.forEach(setFloor);
    console.log(123, resolvePLan, plan)
}

resolvePLan()
    .then(setFloorOptions);