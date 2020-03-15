const isDesktop = () => window.innerWidth > 1024;
const toText = response => response.text();
const insertMenu = (text) => {
    document.body.insertAdjacentHTML('afterbegin', text);
    document.body.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="css/accordion.css" />');
    import('./accordion.js');
};
const shouldLoadMenu = () => {
    if (isDesktop()) {
        document.body.removeEventListener('resize', shouldLoadMenu);
        return fetch('menu.html')
            .then(toText)
            .then(insertMenu);
    }
};
shouldLoadMenu() || document.body.addEventListener('resize', shouldLoadMenu);