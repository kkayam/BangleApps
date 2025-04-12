{// Text Reader for Bangle.js 2
    let on_switch = require("cutegraphics").getGraphic("on_slider");
    let off_switch = require("cutegraphics").getGraphic("off_slider");

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

        E.showScroller({
            h: 50,
            c: files.length,
            draw: (idx, rect) => {
                g.setFont("Vector", 18);
                let text = files[idx].split(".")[0];
                let textWidth = g.stringWidth(text);
                if (textWidth > 110) {
                    const ellipsis = "...";
                    const ellipsisWidth = g.stringWidth(ellipsis);
                    while (textWidth + ellipsisWidth > 110 && text.length > 0) {
                        text = text.slice(0, -1);
                        textWidth = g.stringWidth(text);
                    }
                    text = text + ellipsis;
                }
                g.drawString(text, 5, rect.y + 15);
                g.drawImage(files[idx].includes("off") ? off_switch : on_switch, 125, rect.y + 15, { scale: 0.85 });
            },
            select: (idx) => {
                // Launch the selected app
                toggleBootFile(files[idx], files[idx].includes("off"));
            },
            remove: () => {
                // Remove button handler
                setWatch(() => { }, BTN1);
            }
        });
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