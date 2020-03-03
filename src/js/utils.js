export const setTransform = ($target) => {
    const { sx = 1, sy = 1, x = 0, y = 0, z = 1, r = 0 } = $target.dataset;
    $target.style.transform = `translate(${x}px, ${y}px) scale(${sx * z}, ${sy * z}) rotate(${r}deg)`;
};