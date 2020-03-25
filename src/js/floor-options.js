import inject from './index.js';


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
    
};



const setFloorOptions = (plan) => {
    plan.floors.forEach(setFloor);
    console.log(123, inject().$pristine)
}

inject()
    .planPromise
    .then(setFloorOptions);