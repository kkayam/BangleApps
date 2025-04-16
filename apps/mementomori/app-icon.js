require("Font7x11Numeric7Seg").add(Graphics);

function draw() {
    var g = Graphics.createImage(24, 24);
    g.setColor(1, 1, 1);
    g.fillRect(0, 0, 23, 23);
    g.setColor(0, 0, 0);
    g.fillRect(2, 2, 19, 19);
    g.setColor(1, 0, 0);
    g.fillRect(4, 4, 15, 15);
    return g;
} 