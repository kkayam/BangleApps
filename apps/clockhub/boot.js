{
    const storage = require("Storage");
    let settings = storage.readJSON("clockhub.json", true) || {};

    // Function to get the current app from storage
    const getCurrentApp = () => {
        if (!global.__FILE__ || global.__FILE__ === ".bootcde") return settings.apps.indexOf("clock");
        return settings.apps.indexOf(global.__FILE__);
    };

    // Function to set the current app in storage
    const setActive = (active) => {
        settings.active = active;
        storage.writeJSON("clockhub.json", settings);
    };

    // Function to create and show app indicators using LCD overlay
    const showAppIndicators = () => {
        if (!settings.apps || settings.apps.length === 0) return;

        const currentIndex = getCurrentApp();
        const screen = 176;
        const squareHeight = 7; // Size of each square indicator
        const squareWidth = screen / settings.apps.length;

        // Create a new graphics instance for the overlay
        const overlay = Graphics.createArrayBuffer(squareWidth, squareHeight, 1).setColor("#FFF").fillRect(0, 0, squareWidth, squareHeight);

        // Set the overlay at the bottom of the screen
        Bangle.setLCDOverlay(overlay, currentIndex * squareWidth, screen - squareHeight, {
            id: "clockhub_indicators"
        });

        setTimeout(clearIndicators, 1500);
    };

    // Function to clear the overlay
    const clearIndicators = () => {
        Bangle.setLCDOverlay(undefined, 0, 0, {
            id: "clockhub_indicators"
        });
    };

    // Launch the next app in the sequence
    const launchNextApp = (direction) => {
        if (!settings.apps || settings.apps.length === 0) return;

        var currentIndex = getCurrentApp();

        if (direction === "left") {
            currentIndex = (currentIndex + 1) % settings.apps.length;
        } else {
            currentIndex = currentIndex - 1 < 0 ? settings.apps.length - 1 : currentIndex - 1;
        }

        const nextAppSrc = settings.apps[currentIndex];
        if (nextAppSrc === "clock") Bangle.showClock();
        else if (nextAppSrc === "launcher") Bangle.showLauncher();
        else load(nextAppSrc);
    };

    E.on("init", () => {
        if (settings.active) showAppIndicators();
    });



    // Handle swipe events
    Bangle.on("swipe", (lr, ud) => {
        // Show indicators when the app starts
        if (settings.active || Bangle.CLOCK == 1) {
            if (ud === 1) { // Swipe down
                clearIndicators();
                Bangle.showLauncher();
                setActive(false);
            } else if (lr !== 0) { // Left or right swipe
                if (Bangle.CLOCK == 1 && !settings.active) {
                    setActive(true);
                }
                launchNextApp(lr === -1 ? "left" : "right");
            }
        }
    });
}