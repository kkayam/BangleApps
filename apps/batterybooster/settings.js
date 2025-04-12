(function (back) {
    const SETTINGS_FILE = "batterybooster.settings.json";

    // initialize with default settings
    const storage = require('Storage');
    let settings = {
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