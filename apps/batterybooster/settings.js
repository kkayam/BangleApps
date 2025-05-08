(function (back) {
    const SETTINGS_FILE = "batterybooster.settings.json";

    // initialize with default settings
    const storage = require('Storage');
    let settings = {
        smartLCDTimeout: true,
        autoBrightness: true,
        enableSoftOff: true,
        softOffHours: 3  // Default to 3 hours
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
        },
        'Enable Soft Off': {
            value: settings.enableSoftOff,
            onchange: () => {
                settings.enableSoftOff = !settings.enableSoftOff;
                save();
            }
        },
        'Soft Off Hours': {
            value: settings.softOffHours,
            min: 1,
            max: 12,
            step: 1,
            onchange: (v) => {
                settings.softOffHours = v;
                save();
            }
        }
    };

    E.showMenu(menu);
}); 