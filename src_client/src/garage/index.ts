
mp.events.subscribe({
    'Garage-ShowMenu': (payload: any) => {
        mp.browsers.showPage('garage', payload, true, true);
    }
});

export {};
