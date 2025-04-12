exports = {};

// Cache for loaded icons
let iconsCache = null;

// Load icons from storage
function loadIcons() {
  if (!iconsCache) {
    try {
      iconsCache = require("Storage").readJSON("icons.json");
    } catch (e) {
      iconsCache = {};
    }
  }
  return iconsCache;
}

// List all available icons
exports.listIcons = function () {
  const icons = loadIcons();
  return Object.keys(icons);
};

// Get a specific icon by name
exports.getIcon = function (name) {
  const icons = loadIcons();
  if (!name || typeof name !== "string") {
    throw new Error("Icon name must be a non-empty string");
  }
  if (icons[name]) {
    return require("heatshrink").decompress(atob(icons[name]));
  }
  return null;
};

// Get total number of icons
exports.getCount = function () {
  return Object.keys(loadIcons()).length;
};

// Get a random icon
exports.getRandomIcon = function () {
  const icons = loadIcons();
  const names = Object.keys(icons);
  if (names.length === 0) return null;
  const randomName = names[Math.floor(Math.random() * names.length)];
  return {
    name: randomName,
    icon: icons[randomName]
  };
};