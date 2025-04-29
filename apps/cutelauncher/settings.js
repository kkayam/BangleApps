(function (back) {
    const SETTINGS_FILE = "cutelauncher.settings.json";

    // initialize with default settings...
    const storage = require('Storage');
    let settings = {
        showClocks: false,
        scrollbar: true,
        hide: [] // List of apps to hide
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
        settings[key] = saved_settings[key];
    }

    function save() {
        storage.write(SETTINGS_FILE, settings);
    }

    // Get list of all apps using .info files
    function getAllApps() {
        return storage.list(/\.info$/)
            .map(file => {
                if (file === "setting.info") return;
                const info = storage.readJSON(file, 1);
                return info.name;
            }).sort();
    }

    // Create menu object with all options
    function createMenu() {
        const menu = {
            '': { 'title': 'Cutelauncher' },
            '< Back': back,
            'Show Clocks': {
                value: settings.showClocks,
                onchange: () => {
                    settings.showClocks = !settings.showClocks;
                    save();
                }
            },
            'Scrollbar': {
                value: settings.scrollbar,
                onchange: () => {
                    settings.scrollbar = !settings.scrollbar;
                    save();
                }
            },
            'Show:': {
                onchange: () => {
                    // This is just a visual indicator
                }
            }
        };

        // Add app toggle options at root level
        const allApps = getAllApps();
        allApps.forEach(app => {
            if (!app) return;
            const appName = app.replace(/\.app\.js$/, '');
            menu[appName] = {
                value: !settings.hide.includes(appName),
                onchange: () => {
                    if (settings.hide.includes(appName)) {
                        // Remove from hide list
                        settings.hide = settings.hide.filter(item => item !== appName);
                    } else {
                        // Add to hide list
                        settings.hide.push(appName);
                    }
                    save();
                }
            };
        });

        return menu;
    }

    E.showMenu(createMenu());
})