const $furnitureSelector = document.querySelector('.furniture-selector');
const $furnitureOptions = Array.from($furnitureSelector.children);
const $furniturePanels = Array.from(document.querySelectorAll('.furniture-panel'));
const selectOption = function(e) {
    const { target, currentTarget } = e;
    currentTarget.classList.toggle('expand');
    if (target.classList.contains('selected') === false) {
        this.$panel.hidden = false;
        this.$option.classList.remove('selected');
        this.$panel = $furniturePanels[$furnitureOptions.indexOf(target)];
        this.$option = target;
        this.$option.classList.add('selected');
        this.$panel.hidden = true;
    }
};
$furnitureSelector.onclick = selectOption.bind({ $panel: $furniturePanels[0], $option: $furnitureOptions[0] });