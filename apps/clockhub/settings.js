(function (back) {
    var storage = require("Storage");
    var settings = storage.readJSON("clockhub.json", true) || {};
    if (!settings.apps) settings.apps = [];

    // Get list of all available apps
    var apps = storage.list(/\.info$/).map(app => {
        var a = storage.readJSON(app, 1);
        return a && {
            name: a.name,
            src: a.src
        };
    }).filter(app => app && app.src);

    // Add launcher option
    apps.push({
        "name": "Clock",
        "src": "clock"
    });
    apps.push({
        "name": "Launcher",
        "src": "launcher"
    });

    // Sort apps by name
    apps.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    function showMainMenu() {
        var mainmenu = {
            "": { "title": "Clock Hub" },
            "< Back": () => { load(); }
        };

        // Add app selection option
        mainmenu["Add App"] = () => { showAppMenu(); };

        // Show current sequence
        mainmenu["Current Sequence:"] = () => { };
        if (settings.apps.length === 0) {
            mainmenu["(No apps selected)"] = () => { };
        } else {
            settings.apps.forEach((appSrc, i) => {
                const app = apps.find(a => a.src === appSrc);
                mainmenu[`${i + 1}. ${app ? app.name : appSrc}`] = () => {
                    settings.apps.splice(i, 1);
                    storage.writeJSON("clockhub.json", settings);
                    showMainMenu();
                };
            });
        }

        return E.showMenu(mainmenu);
    }

    function showAppMenu() {
        var appmenu = {
            "": { "title": "Add App" },
            "< Back": showMainMenu
        };

        apps.forEach(app => {
            if (!settings.apps.includes(app.src)) {
                appmenu[app.name] = () => {
                    settings.apps.push(app.src);
                    storage.writeJSON("clockhub.json", settings);
                    showMainMenu();
                };
            }
        });

        return E.showMenu(appmenu);
    }

    showMainMenu();
}); 