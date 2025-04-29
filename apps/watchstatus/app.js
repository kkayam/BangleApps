{
    const storage = require("Storage");
    const locale = require('locale');
    let ENV = process.env;

    // Battery visualization settings
    const ITEM_HEIGHT = 25; // Fixed height for all items

    // Combine all items into a single array
    let allItems = [
        // Empty rows at top
        { name: "", fun: () => "" },
        // Battery visualization (spans two rows)
        { name: "BATTERY_TOP", fun: () => "" },
        { name: "BATTERY_BOTTOM", fun: () => "" },
        { name: "", fun: () => "" }, // Spacer
        // General section
        { name: "Steps", fun: () => getSteps() },
        { name: "HRM", fun: () => getBpm() },
        { name: "", fun: () => "" },
        { name: "Temp.", fun: () => getWeatherTemp() },
        { name: "Humidity", fun: () => getWeatherHumidity() },
        { name: "Wind", fun: () => getWeatherWind() },
        { name: "", fun: () => "" },
        // Hardware section
        { name: "Battery", fun: () => E.getBattery() + "%" },
        { name: "Charge?", fun: () => Bangle.isCharging() ? /*LANG*/"Yes" : /*LANG*/"No" },
        { name: "TempInt.", fun: () => locale.temp(parseInt(E.getTemperature())) },
        { name: "Bluetooth", fun: () => NRF.getSecurityStatus().connected ? /*LANG*/"Conn" : /*LANG*/"NoConn" },
        { name: "GPS", fun: () => Bangle.isGPSOn() ? /*LANG*/"On" : /*LANG*/"Off" },
        { name: "Compass", fun: () => Bangle.isCompassOn() ? /*LANG*/"On" : /*LANG*/"Off" },
        { name: "", fun: () => "" },
        // Software section
        { name: "Firmw.", fun: () => ENV.VERSION },
        { name: "Git", fun: () => ENV.GIT_COMMIT },
        { name: "Boot.", fun: () => getVersion("boot.info") },
        { name: "Settings.", fun: () => getVersion("setting.info") },
        { name: "", fun: () => "" },
        // Storage section
        { name: "Total", fun: () => storage.getStats().totalBytes >> 10 },
        { name: "Free", fun: () => storage.getStats().freeBytes >> 10 },
        { name: "Trash", fun: () => storage.getStats().trashBytes >> 10 },
        { name: "", fun: () => "" },
        { name: "#File", fun: () => storage.getStats().fileCount },
        { name: "#Trash", fun: () => storage.getStats().trashCount },
    ];

    const getWeatherTemp = () => {
        try {
            let weather = storage.readJSON('weather.json').weather;
            return locale.temp(weather.temp - 273.15);
        } catch (ex) { }

        return "?";
    };

    const getWeatherHumidity = () => {
        try {
            let weather = storage.readJSON('weather.json').weather;
            return weather.hum = weather.hum + "%";
        } catch (ex) { }

        return "?";
    };

    const getWeatherWind = () => {
        try {
            let weather = storage.readJSON('weather.json').weather;
            let speed = locale.speed(weather.wind).replace("mph", "");
            return Math.round(speed * 1.609344) + "kph";
        } catch (ex) { }

        return "?";
    };

    const getVersion = (file) => {
        let j = storage.readJSON(file, 1);
        let v = ("object" == typeof j) ? j.version : false;
        return v ? ((v ? "v" + v : "Unknown")) : "NO ";
    };

    const getSteps = () => {
        try {
            return Bangle.getHealthStatus("day").steps;
        } catch (e) {
            return ">2v12";
        }
    };

    const getBpm = () => {
        try {
            return Math.round(Bangle.getHealthStatus("day").bpm) + "bpm";
        } catch (e) {
            return ">2v12";
        }
    };

    // Draw battery visualization
    const drawBattery = (r, isTop) => {
        const batteryLevel = E.getBattery();
        const width = r.w;
        const height = r.h;
        const verticalPadding = 2;
        const horizontalPadding = 30; // Increased horizontal padding to 30px
        const batteryWidth = width - horizontalPadding * 2; // Leave space for the battery tip

        // Battery outline
        g.setColor(g.theme.fg);

        if (isTop) {
            // Draw top part of battery
            g.drawLine(r.x + horizontalPadding, r.y + verticalPadding, r.x + horizontalPadding + batteryWidth, r.y + verticalPadding); // top
            g.drawLine(r.x + horizontalPadding, r.y + verticalPadding, r.x + horizontalPadding, r.y + height); // left
            g.drawLine(r.x + horizontalPadding + batteryWidth, r.y + verticalPadding, r.x + horizontalPadding + batteryWidth, r.y + height); // right
        } else {
            // Draw bottom part of battery
            g.drawLine(r.x + horizontalPadding, r.y, r.x + horizontalPadding, r.y + height - verticalPadding);
            g.drawLine(r.x + horizontalPadding + batteryWidth, r.y, r.x + horizontalPadding + batteryWidth, r.y + height - verticalPadding);
            g.drawLine(r.x + horizontalPadding, r.y + height - verticalPadding, r.x + horizontalPadding + batteryWidth, r.y + height - verticalPadding);
        }

        // Battery level
        const fillWidth = Math.floor((batteryWidth - 2) * (batteryLevel / 100));
        if (fillWidth > 0) {
            // Color based on battery level
            if (batteryLevel <= 20) {
                g.setColor("#FF0000"); // Red for low battery
            } else if (batteryLevel <= 50) {
                g.setColor("#FFFF00"); // Yellow for medium battery
            } else {
                g.setColor("#00FF00"); // Green for good battery
            }

            if (isTop) {
                // Fill top part
                g.fillRect(r.x + horizontalPadding + 1, r.y + verticalPadding + 1,
                    r.x + horizontalPadding + 1 + fillWidth, r.y + height - 1);
            } else {
                // Fill bottom part
                g.fillRect(r.x + horizontalPadding + 1, r.y,
                    r.x + horizontalPadding + 1 + fillWidth, r.y + height - verticalPadding - 1);
            }
        }

        // Battery percentage text (only on top row)
        if (isTop) {
            g.setColor(g.theme.fg);
            g.setFontAlign(0, 0);
            g.setFont("Vector", 16);
            g.drawString(batteryLevel + "%", r.x + width / 2, r.y + height / 2);
        }
    };

    // Show all items in a scrollable list
    E.showScroller({
        h: ITEM_HEIGHT, // Fixed height for all items
        c: allItems.length, // number of items
        draw: (idx, r) => {
            let item = allItems[idx];
            g.setBgColor(g.theme.bg).clearRect(r.x, r.y, r.x + r.w, r.y + r.h);

            if (item.name === "BATTERY_TOP") {
                drawBattery(r, true);
            } else if (item.name === "BATTERY_BOTTOM") {
                drawBattery(r, false);
            } else if (item.name !== "") {
                g.setColor(g.theme.fg).setFontAlign(-1, -1);
                g.setFont("Vector", 16);
                g.drawString(item.name, r.x + 10, r.y + 4);
                g.drawString(item.fun(), r.x + 100, r.y + 4);
            }
        }
    });

    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
}