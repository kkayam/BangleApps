{
    const storage = require("Storage");
    const locale = require('locale');
    let ENV = process.env;

    // Combine all items into a single array
    let allItems = [
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

    // Show all items in a scrollable list
    E.showScroller({
        h: 25, // height of each item
        c: allItems.length, // number of items
        draw: (idx, r) => {
            let item = allItems[idx];
            g.setBgColor(g.theme.bg).clearRect(r.x, r.y, r.x + r.w, r.y + r.h);
            g.setColor(g.theme.fg).setFontAlign(-1, -1);
            g.setFont("Vector", 16);
            g.drawString(item.name, r.x + 10, r.y + 4);
            g.drawString(item.fun(), r.x + 100, r.y + 4);
        }
    });
}