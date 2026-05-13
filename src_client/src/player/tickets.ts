import browser from '../helpers/browser';

mp.events.subscribeToDefault({
    'Tickets-ShowMenu': () => {
        browser.showPage('player/tickets');
    }
});
