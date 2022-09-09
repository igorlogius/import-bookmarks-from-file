/* global browser */

browser.browserAction.onClicked.addListener((tab) => {
    browser.windows.create({
        url: ["popup.html"],
        type: "popup",
        width: 300,
        height: 250
    });
});

