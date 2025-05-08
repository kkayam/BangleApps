(function () {
    // Load settings
    let settings = require('Storage').readJSON('batterybooster.settings.json', 1) || {
        smartLCDTimeout: true,
        autoBrightness: true,
        enableSoftOff: true,
        softOffHours: 3
    };

    let softOffTimeout;

    let setBrightness = () => {
        const d = new Date();
        let hour = d.getHours();
        let radians = (Math.PI / 12) * (hour - 6);
        let brightness = Math.sin(radians) / 2 + 0.5;
        Bangle.setLCDBrightness(brightness);
    }

    Bangle.on("lock", (on) => {
        if (on) {
            if (settings.autoBrightness) {
                setBrightness();
            }
            if (settings.smartLCDTimeout) {
                Bangle.setLCDTimeout(2);
            }

            if (settings.enableSoftOff) {
                softOffTimeout = setTimeout(() => Bangle.softOff(), settings.softOffHours * 3600000);
            }
        } else {
            if (softOffTimeout) clearTimeout(softOffTimeout);
        }
    });

    if (settings.smartLCDTimeout) {
        Bangle.on("touch", () => {
            Bangle.setLCDTimeout(10);
        });
        Bangle.on("swipe", () => {
            Bangle.setLCDTimeout(10);
        });
    }
})()