{
    // Load settings
    const storage = require('Storage');
    let settings = storage.readJSON('batterybooster.settings.json', 1) || {
        autoSoftOff: true,
        softOffDelay: 3,
        smartLCDTimeout: true,
        autoBrightness: true
    };

    let softOffTimeout;

    if (settings.autoSoftOff) {
        Bangle.on("lock", (on) => {
            if (on) {
                softOffTimeout = setTimeout(() => Bangle.softOff(), settings.softOffDelay * 3600000);
                if (settings.smartLCDTimeout) {
                    Bangle.setLCDTimeout(2);
                }
            }
            else {
                if (softOffTimeout) clearTimeout(softOffTimeout);
            }
        });
    }

    if (settings.smartLCDTimeout) {
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
}