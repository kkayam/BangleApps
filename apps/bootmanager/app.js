{// Text Reader for Bangle.js 2

    // Get list of readable files
    let getFileList = () => {
        return require("Storage").list(/\.boot\./).sort();
    };

    // File browser menu
    let showFileBrowser = () => {
        const files = getFileList();
        if (files.length === 0) {
            E.showMessage("No boot files found");
            setTimeout(() => load(), 2000);
            return;
        }

        const menu = {
            "": { title: "Boot Manager" }
        };

        // Add files to menu
        files.forEach(file => {
            menu[file.replace(".off", "")] = {
                value: !file.includes("off"),
                onchange: () => {
                    toggleBootFile(file, file.includes("off"));
                },
            };
        });

        E.showMenu(menu);
    };

    // Function to rename a file by adding "off" to extension
    let toggleBootFile = (filename, on) => {
        const storage = require("Storage");
        const content = storage.read(filename);

        if (!content) return;

        let newName;
        if (on) {
            // Turn on by removing "off" from filename
            newName = filename.replace(".off", "");
        } else {
            if (!filename.includes("off")) {
                newName = filename.replace("js", "js.off");
            }
        }

        // Write content to new file and erase old one
        storage.write(newName, content);
        storage.erase(filename);

        // Refresh the file browser
        showFileBrowser();
    };


    // Start the app
    showFileBrowser();
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
}