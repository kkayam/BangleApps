(function (back) {
    const SETTINGS_FILE = "batterybooster.settings.json";

    // initialize with default settings
    const storage = require('Storage');
    let settings = {
        autoSoftOff: true,
        softOffDelay: 3, // hours
        smartLCDTimeout: true,
        autoBrightness: true
    };

    // Load saved settings
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
        settings[key] = saved_settings[key];
    }

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    const menu = {
        '': { 'title': 'Battery Booster' },
        '< Back': back,
        'Auto Soft-Off': {
            value: settings.autoSoftOff,
            onchange: () => {
                settings.autoSoftOff = !settings.autoSoftOff;
                save();
            }
        },
        'Soft-Off Delay': {
            value: settings.softOffDelay,
            min: 1,
            max: 12,
            step: 1,
            format: v => v + "h",
            onchange: v => {
                settings.softOffDelay = v;
                save();
            }
        },
        'Smart LCD Timeout': {
            value: settings.smartLCDTimeout,
            onchange: () => {
                settings.smartLCDTimeout = !settings.smartLCDTimeout;
                save();
            }
        },
        'Auto Brightness': {
            value: settings.autoBrightness,
            onchange: () => {
                settings.autoBrightness = !settings.autoBrightness;
                save();
            }
        }
    };

    E.showMenu(menu);
}); 