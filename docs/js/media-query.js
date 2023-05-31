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
        document.body.insertAdjacentHTML(
            'beforeend',
            '<link rel="stylesheet" href="css/accordion.css" media="(min-width: 1025px)" />'
        );
        fetch('text-control.html')
            .then(toText)
            .then(insertTextControl);
        return true;
    }
};
const applyMobileBreakpoint = () => {
    if (isDesktop() === false) {
        window.removeEventListener('resize', applyMobileBreakpoint);
        document.body.insertAdjacentHTML(
            'beforeend',
            '<link rel="stylesheet" href="/css/tabs.css" media="(max-width: 1024px)">'
        );
    }
};
fetch('menu.html')
    .then(toText)
    .then(insertMenu);
applyDesktopBreakpoint()
    ? window.addEventListener('resize', applyMobileBreakpoint)
    : window.addEventListener('resize', applyDesktopBreakpoint);