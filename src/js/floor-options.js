import resolvePLan from './index.js';

const setFloorOptions = (plan) => {

    console.log(123, resolvePLan, plan)
}

resolvePLan()
    .then(setFloorOptions);