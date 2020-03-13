const $furnitureSelector = document.querySelector('.furniture-selector');
const $furnitureOptions = Array.from($furnitureSelector.children);
const hideNode = node => node.classList.add('excluded');
const selectOption = (e) => {
    const { target, currentTarget } = e;
    currentTarget.classList.toggle('expand');
    if (target.classList.contains('excluded')) {
        const id = `#${target.dataset.ref}`;
        $furnitureOptions.forEach(hideNode);
        target.classList.remove('excluded');
    }
};
$furnitureSelector.onclick = selectOption;