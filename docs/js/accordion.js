const $accordionToggles = Array.from(document.querySelectorAll('.left-menu-accordion'));
const collapse = $target => $target.setAttribute('aria-expanded', false);
const attachListener = $target => $target.onclick = ({ currentTarget }) => {
    const expanded = currentTarget.getAttribute('aria-expanded') === 'true';
    $accordionToggles.forEach(collapse);
    currentTarget.setAttribute('aria-expanded', !expanded);
};
import('./floor-options.js');
import('./furniture-planner.js');
$accordionToggles.forEach(attachListener);