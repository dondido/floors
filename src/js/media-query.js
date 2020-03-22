const isDesktop = () => window.innerWidth > 1024;
const toText = response => response.text();
const insertMenu = (text) => {
    document.body.insertAdjacentHTML('afterbegin', text);
    import('./accordion.js');
};
const shouldLoadMenu = () => {
    if (isDesktop()) {
        window.removeEventListener('resize', shouldLoadMenu);
        document.body.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="css/accordion.css" />');
        return fetch('menu.html')
            .then(toText)
            .then(insertMenu);
    }
};
shouldLoadMenu() || window.addEventListener('resize', shouldLoadMenu);