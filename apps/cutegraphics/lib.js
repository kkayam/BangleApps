exports = {};

// Cache for loaded graphics
let graphicsCache = null;

// Load graphics from storage
function loadGraphics() {
  if (!graphicsCache) {
    try {
      graphicsCache = require("Storage").readJSON("graphics.json");
    } catch (e) {
      graphicsCache = {};
    }
  }
  return graphicsCache;
}

// List all available graphics
exports.listGraphics = function () {
  const graphics = loadGraphics();
  return Object.keys(graphics);
};

// Get a specific graphic by name
exports.getGraphic = function (name) {
  const graphics = loadGraphics();
  if (!name || typeof name !== "string") {
    throw new Error("Graphic name must be a non-empty string");
  }
  if (graphics[name]) {
    return require("heatshrink").decompress(atob(graphics[name]));
  }
  return null;
};

// Get total number of graphics
exports.getCount = function () {
  return Object.keys(loadGraphics()).length;
};

// Get a random graphic
exports.getRandomGraphic = function () {
  const graphics = loadGraphics();
  const names = Object.keys(graphics);
  if (names.length === 0) return null;
  const randomName = names[Math.floor(Math.random() * names.length)];
  return {
    name: randomName,
    graphic: graphics[randomName]
  };
};