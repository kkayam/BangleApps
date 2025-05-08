{
    const showScroller = (options) => {
        /* options = {
          h = height
          c = # of items
          scroll = initial scroll position
          scrollMin = minimum scroll amount (can be negative)
          draw = function(idx, rect)
          remove = function()
          select = function(idx, touch)
          showScrollbar = boolean // whether to show the scroll thumb
        }
      
        returns {
          scroll: int                // current scroll amount
          draw: function()           // draw all
          drawItem : function(idx)   // draw specific item
          isActive : function()      // is this scroller still active?
        }
      
        */
        if (!options) return Bangle.setUI(); // remove existing handlers

        // Create scroll thumb overlay
        const overlayWidth = 25;
        const overlayHeight = 35;
        const overlay = Graphics.createArrayBuffer(overlayWidth, overlayHeight, 16, { msb: true });

        // Helper function for creating rounded rectangle points
        function createRoundedRectPoints(x1, y1, x2, y2, r) {
            return [
                x1 + r, y1,    // Top edge
                x2 - r, y1,
                x2 - r * 0.7, y1,
                x2 - r * 0.4, y1 + r * 0.1,
                x2 - r * 0.1, y1 + r * 0.4,  // Top right corner
                x2, y1 + r * 0.7,
                x2, y1 + r,
                x2, y2 - r,    // Right edge
                x2, y2 - r * 0.7,
                x2 - r * 0.1, y2 - r * 0.4,
                x2 - r * 0.4, y2 - r * 0.1,  // Bottom right corner
                x2 - r * 0.7, y2,
                x2 - r, y2,
                x1 + r, y2,    // Bottom edge
                x1 + r * 0.7, y2,
                x1 + r * 0.4, y2 - r * 0.1,
                x1 + r * 0.1, y2 - r * 0.4,  // Bottom left corner
                x1, y2 - r * 0.7,
                x1, y2 - r,
                x1, y1 + r,    // Left edge
                x1, y1 + r * 0.7,
                x1 + r * 0.1, y1 + r * 0.4,
                x1 + r * 0.4, y1 + r * 0.1,  // Top left corner
                x1 + r * 0.7, y1
            ];
        }

        // Initialize scroll thumb
        function initScrollThumb() {
            overlay.setBgColor(g.theme.bg).clear();
            const points = createRoundedRectPoints(0, 0, overlayWidth, overlayHeight, 10);
            overlay.setColor(g.theme.bgH).fillPoly(points);

            // Add horizontal lines for scroll thumb aesthetic with outlines
            const lineY1 = overlayHeight / 3;
            const lineY2 = overlayHeight * 2 / 3;
            const lineLeft = 9;
            const lineRight = overlayWidth - 9;

            // Draw inner lines
            overlay.setColor(g.theme.fg2);
            overlay.fillRect(lineLeft - 2, lineY1 - 1, lineRight + 2, lineY1 + 1);
            overlay.fillRect(lineLeft - 2, lineY2 - 1, lineRight + 2, lineY2 + 1);

            overlay.fillRect(lineLeft, lineY1 - 2, lineRight, lineY1 + 2);
            overlay.fillRect(lineLeft, lineY2 - 2, lineRight, lineY2 + 2);
        }
        initScrollThumb();

        // Function to update scroll thumb position
        function updateScrollThumb(idx) {
            if (!options.showScrollbar) return;
            const marginX = 1;
            const marginY = 5;
            let scrollableHeight = g.getHeight() - marginY * 2 - overlayHeight;

            // Calculate the maximum visible index
            let maxVisibleIdx = options.c - Math.ceil(R.h / options.h);
            // Ensure we don't go beyond the maximum
            idx = Math.min(idx, maxVisibleIdx);

            // Calculate scroll percentage based on the maximum visible index
            let scrollPercent = idx / maxVisibleIdx;

            let thumbY = scrollPercent * scrollableHeight + marginY;
            Bangle.setLCDOverlay(overlay, g.getWidth() - overlayWidth - marginX, thumbY, { id: "scrollThumb" });
        }

        let prev_idx = -1;
        let second_call = false;

        var draw = () => {
            g.reset().clearRect(R).setClipRect(R.x, R.y, R.x2, R.y2);
            var a = YtoIdx(R.y);
            var b = Math.min(YtoIdx(R.y2), options.c - 1);
            for (var i = a; i <= b; i++) {
                options.draw(i, { x: R.x, y: idxToY(i), w: R.w, h: options.h });
                if (i != prev_idx && !second_call && options.showScrollbar) {
                    updateScrollThumb(i);
                    if (prev_idx == -1) second_call = true;
                    prev_idx = i;
                } else if (second_call) second_call = false;
            }
            g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
        };

        Bangle.setUI({
            mode: "custom",
            back: options.back,
            remove: () => {
                // Remove button handler
                setWatch(() => { }, BTN1);
                // Remove lock handler
                Bangle.removeListener('lock');
                // Clear the scroll overlay
                Bangle.setLCDOverlay();
                if (options.remove) options.remove();
            },
            redraw: draw,
            drag: e => {
                var dy = e.dy;
                if (s.scroll - dy > menuScrollMax)
                    dy = s.scroll - menuScrollMax;
                if (s.scroll - dy < menuScrollMin)
                    dy = s.scroll - menuScrollMin;
                s.scroll -= dy;
                var oldScroll = rScroll;
                rScroll = s.scroll & ~1;
                dy = oldScroll - rScroll;
                if (!dy) return;
                g.reset().setClipRect(R.x, R.y, R.x2, R.y2).scroll(0, dy);
                var d = e.dy;
                if (d < 0) {
                    let y = Math.max(R.y2 - (1 - d), R.y);
                    g.setClipRect(R.x, y, R.x2, R.y2);
                    let i = YtoIdx(y);
                    y = idxToY(i);
                    while (y < R.y2) {
                        options.draw(i, { x: R.x, y: y, w: R.w, h: options.h });
                        i++;
                        y += options.h;
                    }
                } else { // d>0
                    let y = Math.min(R.y + d, R.y2);
                    g.setClipRect(R.x, R.y, R.x2, y);
                    let i = YtoIdx(y);
                    y = idxToY(i);
                    while (y > R.y - options.h) {
                        options.draw(i, { x: R.x, y: y, w: R.w, h: options.h });
                        y -= options.h;
                        i--;
                    }
                }
                g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
                if (options.showScrollbar) {
                    let currentIdx = YtoIdx(R.y);
                    if (currentIdx != prev_idx) {
                        updateScrollThumb(currentIdx);
                        prev_idx = currentIdx;
                    }
                }
            },
            touch: (_, e) => {
                if (e.y < R.y - 4) return;
                var i = YtoIdx(e.y);
                let yAbs = (e.y + rScroll - R.y);
                let yInElement = yAbs - i * options.h;
                if (e.y > 163 && idxToY(i) > 163) { // 12px from bottom
                    /* If the bottom-most item is only just showing and we
                    tap on it, choose the one above instead */
                    i--;
                    yInElement = options.h - 1;
                }
                if ((menuScrollMin < 0 || i >= 0) && i < options.c) {
                    options.select(i, { x: e.x, y: yInElement, type: e.type });
                }
            }
        });

        var menuShowing = false;
        var R = Bangle.appRect;
        var Y = R.y;
        var n = Math.ceil(R.h / options.h);
        var menuScrollMin = 0 | options.scrollMin;
        var menuScrollMax = options.h * options.c - R.h;
        if (menuScrollMax < menuScrollMin) menuScrollMax = menuScrollMin;

        function idxToY(i) {
            return i * options.h + R.y - rScroll;
        }
        function YtoIdx(y) {
            return Math.floor((y + rScroll - R.y) / options.h);
        }

        var s = {
            scroll: E.clip(0 | options.scroll, menuScrollMin, menuScrollMax),
            draw: draw, drawItem: i => {
                var y = idxToY(i);
                g.reset().setClipRect(R.x, Math.max(y, R.y), R.x2, Math.min(y + options.h, R.y2));
                options.draw(i, { x: R.x, y: y, w: R.w, h: options.h });
                g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
            }, isActive: () => Bangle.uiRedraw == draw
        };
        var rScroll = s.scroll & ~1; // rendered menu scroll (we only shift by 2 because of dither)
        s.draw(); // draw the full scroller
        g.flip(); // force an update now to make this snappier
        return s;
    };


    let s = require('Storage');
    let settings = Object.assign(
        {
            showClocks: false,
            scrollbar: true,
            hide: []
        },
        s.readJSON('cutelauncher.settings.json', true) || {}
    );

    // Borrowed caching from Icon Launcher, code by halemmerich.
    let launchCache = s.readJSON('launch.cache.json', true) || {};
    let launchHash = s.hash(/\.info/) + JSON.stringify(settings).length;
    if (launchCache.hash != launchHash) {
        launchCache = {
            hash: launchHash,
            apps: s
                .list(/\.info$/)
                .map((app) => {
                    var a = s.readJSON(app, 1);
                    return a && { name: a.name, type: a.type, icon: a.icon, sortorder: a.sortorder, src: a.src };
                })
                .filter((app) => app &&
                    (app.type == 'app' || (app.type == 'clock' && settings.showClocks) || !app.type) &&
                    !settings.hide.includes(app.name))
                .sort((a, b) => {
                    var n = (0 | a.sortorder) - (0 | b.sortorder);
                    if (n) return n; // do sortorder first
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                }),
        };
        s.writeJSON('launch.cache.json', launchCache);
    }
    let apps = launchCache.apps;
    apps.forEach((app) => {
        if (app.icon) app.icon = s.read(app.icon);
        else app.icon = s.read('placeholder.img');
    });

    require('Font8x16').add(Graphics);
    Bangle.drawWidgets = () => { };
    Bangle.loadWidgets = () => { };

    const ITEM_HEIGHT = 95;

    // Function to create app backdrop
    function createAppBackdrop(y) {
        return [
            58, y + 5,    // Top edge
            118, y + 5,
            133 - 15 * 0.7, y + 5,
            133 - 15 * 0.4, y + 5 + 15 * 0.1,
            133 - 15 * 0.1, y + 5 + 15 * 0.4,  // Top right corner
            133, y + 5 + 15 * 0.7,
            133, y + 20,
            133, y + 75,    // Right edge
            133, y + 90 - 15 * 0.7,
            133 - 15 * 0.1, y + 90 - 15 * 0.4,
            133 - 15 * 0.4, y + 90 - 15 * 0.1,  // Bottom right corner
            133 - 15 * 0.7, y + 90,
            118, y + 90,
            58, y + 90,    // Bottom edge
            43 + 15 * 0.7, y + 90,
            43 + 15 * 0.4, y + 90 - 15 * 0.1,
            43 + 15 * 0.1, y + 90 - 15 * 0.4,  // Bottom left corner
            43, y + 90 - 15 * 0.7,
            43, y + 75,
            43, y + 20,    // Left edge
            43, y + 5 + 15 * 0.7,
            43 + 15 * 0.1, y + 5 + 15 * 0.4,
            43 + 15 * 0.4, y + 5 + 15 * 0.1,  // Top left corner
            43 + 15 * 0.7, y + 5
        ];
    }

    showScroller({
        h: ITEM_HEIGHT,
        c: apps.length,
        showScrollbar: settings.scrollbar,
        draw: (idx, rect) => {
            g.setFontAlign(0, -1, 0).setFont('8x16');
            // Calculate icon dimensions
            let icon = apps[idx].icon;
            let iconSize = 48;
            // Define rectangle size (independent of icon size)
            const rectSize = 80;
            const rectX = 48;

            // Draw rounded rectangle background using the new function
            const points = createAppBackdrop(rect.y);
            g.setColor(g.theme.bg2).fillPoly(points);

            // Draw icon centered in the top portion
            let iconPadding = 8;
            // Center icon within the rectangle
            let iconXInRect = rectX + (rectSize - iconSize) / 2;
            g.setColor(g.theme.fg).setBgColor(g.theme.bg2).drawImage(icon, iconXInRect, rect.y + iconPadding + 8);

            // Draw app name with ellipsis if too long
            const maxWidth = rectSize - 8;
            let text = apps[idx].name;
            let textWidth = g.stringWidth(text);
            if (textWidth > maxWidth) {
                const ellipsis = "...";
                const ellipsisWidth = g.stringWidth(ellipsis);
                while (textWidth + ellipsisWidth > maxWidth && text.length > 0) {
                    text = text.slice(0, -1);
                    textWidth = g.stringWidth(text);
                }
                text = text + ellipsis;
            }
            let textY = rect.y + iconPadding + iconSize + 15;
            g.drawString(text, rectX + rectSize / 2, textY);
        },
        select: (idx) => {
            // Launch the selected app
            load(apps[idx].src);
        }
    });

    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    // Add lock handler to show clock when locked
    Bangle.on('lock', (on) => { if (on) Bangle.showClock(); });
}
