{
    const storage = require("Storage");
    let settings = storage.readJSON("swipelaunch.json", true) || {};

    // Function to get the current app from storage
    const getCurrentApp = () => {
        if (Bangle.CLOCK == 1) return 0;
        return settings.apps.indexOf(global.__FILE__);
    };

    // Function to set the current app in storage
    const setActive = (active) => {
        settings.active = active;
        storage.writeJSON("swipelaunch.json", settings);
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

    // Handle swipe events
    Bangle.on("swipe", (lr, ud) => {
        console.log("current app: ", getCurrentApp());
        if (Bangle.CLOCK == 1 && lr !== 0) {
            setActive(true);
            launchNextApp(lr === -1 ? "left" : "right");
        }
        else if (settings.active) {
            if (ud === 1) { // Swipe down
                Bangle.showLauncher();
                setActive(false);
            } else if (lr !== 0) { // Left or right swipe
                launchNextApp(lr === -1 ? "left" : "right");
            }
        }
    });
}