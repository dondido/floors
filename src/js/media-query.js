const isDesktop = () => window.innerWidth > 1024;
const toText = response => response.text();
const insertMenu = (text) => {
    document.body.insertAdjacentHTML('afterbegin', text);
    import('./accordion.js');
};
const insertTextControl = (text) => {
    document.querySelector('.right-menu').insertAdjacentHTML('afterbegin', text);
    import('./text-panel.js');
};
const applyDesktopBreakpoint = () => {
    if (isDesktop()) {
        window.removeEventListener('resize', applyDesktopBreakpoint);
        document.body.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="css/accordion.css" />');
        fetch('text-control.html')
            .then(toText)
            .then(insertTextControl);
        fetch('menu.html')
            .then(toText)
            .then(insertMenu);
        return true;
    }
};
applyDesktopBreakpoint() || window.addEventListener('resize', applyDesktopBreakpoint);