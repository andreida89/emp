mp.events.add('updateTickerText', (text) => {
    console.log(text);
    //mp.browsers.showPage('newsticker', {text}, true, true);
    mp.events.callBrowser('NewsTicker-ShowItem', [text], false);
    
});