(function () {
    // Load settings
    let settings = require('Storage').readJSON('batterybooster.settings.json', 1) || {
        smartLCDTimeout: true,
        autoBrightness: true
    };

    let softOffTimeout;

    Bangle.on("lock", (on) => {
        if (on) {
            softOffTimeout = setTimeout(() => Bangle.softOff(), 10800000);
        } else {
            if (softOffTimeout) clearTimeout(softOffTimeout);
        }
    });

    if (settings.smartLCDTimeout) {
        Bangle.on("lock", (on) => {
            if (on) {
                Bangle.setLCDTimeout(2);
            }
        });
        Bangle.on("touch", () => {
            Bangle.setLCDTimeout(10);
        });
    }

    if (settings.autoBrightness) {
        setInterval(() => {
            let getBrightness = (hour) => {
                let radians = (Math.PI / 12) * (hour - 6);
                let brightness = Math.sin(radians) / 2 + 0.5;
                return brightness;
            };

            const d = new Date();
            let hour = d.getHours();
            Bangle.setLCDBrightness(getBrightness(hour));
        }, 3600000);
    }
})()