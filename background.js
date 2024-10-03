console.log("Background script loaded!");


var targetTabId = -1;
var soundfile = "";
// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    targetTabId = sender.tab.id;
    if (message.action === "setAlarm") {
        // Create an alarm to trigger once after the specified delay
        soundfile = message.soundfile;
        // Create an alarm to trigger every minute (or any desired time)
        browser.alarms.create('alarmNotification', {
            delayInMinutes: message.delayInSeconds / 60.0
        });

        sendResponse({ status: "Alarm set" });
    }else if(message.action === "restartBrowser"){
        
        restartBrowser(message.url, message.incognito);
        sendResponse({ status: "Browser restarted." });
    }
});



// Listener for the alarm
browser.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'alarmNotification') {
        console.log("Ring the alarm!");
        ring(soundfile);
    }
});


function restartBrowser(url, incognito){
    browser.tabs.get(targetTabId)
        .then(tab => {
            // Close the current window
            return browser.windows.remove(tab.windowId);
        })
        .then(() => {
            // Open a new incognito window with the specified URL
            return browser.windows.create({
                url: url,  // Replace with your desired URL
                incognito: incognito               // Open in incognito mode
            });
        })
        .catch(error => {
            console.error("Error:", error);
        });

}

// Function to show a notification with sound
function ring(soundfile) {
    // Show a notification
    browser.notifications.create({
        type: "basic",
        iconUrl: "icons/contract.jpg", // Use an appropriate icon for your extension
        title: "Time to visit the site!",
        message: "Click here to open the site.",
    });

    console.log("Play sound: ", soundfile);
    // Play the sound
    let audio = new Audio(browser.runtime.getURL("sounds/"+soundfile));
    audio.play().catch((error) => {
        console.error("Error playing audio:", error);
    });
}

// Optional: Handle notification click to open a website
browser.notifications.onClicked.addListener(function (notificationId) {
    browser.tabs.update(targetTabId, {active: true});
});
