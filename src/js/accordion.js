const $accordionToggles = Array.from(document.querySelectorAll('.left-menu-accordion'));
const collapse = $target => $target.setAttribute('aria-expanded', false);
const attachListener = $target => $target.onclick = ({ target }) => {
    const expanded = target.getAttribute('aria-expanded') === 'true';
    $accordionToggles.forEach(collapse);
    target.setAttribute('aria-expanded', !expanded);
}
import('./furniture-planner.js');
$accordionToggles.forEach(attachListener);