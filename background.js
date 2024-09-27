console.log("Background script loaded!");


var targetTabId = -1;
var soundfile = "";
// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setAlarm") {
        // Create an alarm to trigger once after the specified delay
        targetTabId = sender.tab.id;
        soundfile = message.soundfile;
        // Create an alarm to trigger every minute (or any desired time)
        browser.alarms.create('alarmNotification', {
            delayInMinutes: message.delayInSeconds / 60.0
        });

        sendResponse({ status: "Alarm set" });
    }
});



// Listener for the alarm
browser.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'alarmNotification') {
        console.log("Ring the alarm!");
        ring(soundfile);
    }
});


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
