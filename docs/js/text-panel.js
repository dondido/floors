import { setTransform } from './utils.js';

let $activeText;
const $textControl = document.querySelector('.text-control');
const $fontSlider = $textControl.querySelector('.font-slider');
const $textControlBody = $textControl.querySelector('.text-control-body');
const $textControlTextarea = $textControlBody.querySelector('.text-control-textarea');
const $textControlRotateInput = $textControlBody.querySelector('.text-control-rotate-input');
const rotateText = ({ target }) => {
    if (target.value < 0) {
        target.value = 359;
    }
    else if (target.value > 359) {
        target.value = 0;
    }
    $activeText.dataset.r = target.value;
    setTransform($activeText);
};
const rotateByDegree = ({ target }) => {
    target.textContent === '+' ? $textControlRotateInput.value ++ : $textControlRotateInput.value --;
    rotateText({ target: $textControlRotateInput });
};
const focusText = ({ detail: { $text } }) => {
    if($text === false) {
        $textControl.hidden = true;
        return;
    }
    $textControl.hidden = false;
    if($text.isSameNode($activeText)) {
        return;
    }
    $activeText = $text;
    $textControlBody.disabled = $activeText.classList.contains('disabled');
    $textControlTextarea.value = $activeText.textContent;
    $fontSlider.value = parseInt($activeText.style.fontSize) || 13;
    $textControlRotateInput.value = $activeText.dataset.r || 0;
};
const attachRotateControl = $button => $button.onclick = rotateByDegree;
$textControlBody.querySelector('.text-control-lock-button').onclick = () => {
    $textControlBody.disabled = !$textControlBody.disabled;
    $activeText.classList.toggle('disabled');
};
$textControlBody.querySelector('.text-control-reset-button').onclick = () => {
    $activeText.dataset.r = 0;
    $textControlRotateInput.value = 0;
    $activeText.style.fontSize = '13px';
    $fontSlider.value = 13;
    setTransform($activeText);
};
$textControlTextarea.oninput = ({ target }) => $activeText.textContent = target.value;
$textControlRotateInput.oninput = rotateText;
$textControl.querySelector('.text-control-bin-button').onclick = () => {
    $activeText.remove();
    $textControl.hidden = true;
};
$textControl.querySelector('.text-control-x-button').onclick = () => $textControl.hidden = true;
$fontSlider.oninput = ({ target }) => $activeText.style.fontSize = `${target.value}px`;
Array.from($textControlBody.querySelectorAll('.text-control-rotate-button')).forEach(attachRotateControl);
document.body.addEventListener('focus-text', focusText);
