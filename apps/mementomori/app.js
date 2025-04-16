{// Memento Mori - A year progress visualization app
    const GRID_SIZE = 19; // 19x19 grid to fit 365 days (361 squares)
    const SQUARE_SIZE = 9; // Size of each square in pixels
    const GRID_PADDING = 0; // Padding between squares
    let mementoInterval;

    const drawGrid = () => {
        g.clear();
        g.setFontAlign(0, 0);

        // Calculate total grid size
        const startX = 2;
        const startY = 2;

        // Get current day of year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Draw grid
        let dayCount = 0;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const x = startX + (col * (SQUARE_SIZE + GRID_PADDING));
                const y = startY + (row * (SQUARE_SIZE + GRID_PADDING));

                if (dayCount < 365) {
                    if (dayCount < dayOfYear) {
                        // Past days
                        g.setColor(0.7, 0.7, 0.7);
                    } else if (dayCount === dayOfYear) {
                        // Current day
                        g.setColor(1, 0, 0);
                    } else {
                        // Future days
                        g.setColor(0.2, 0.2, 0.2);
                    }

                    // Use fillRect to draw solid squares without outlines
                    g.fillRect(x, y, x + SQUARE_SIZE, y + SQUARE_SIZE);
                    dayCount++;
                }
            }
        }

        // Draw percentage
        const percentage = Math.floor((dayOfYear / 365) * 100);
        g.setColor(1, 1, 1);
        g.setFont("6x8", 2);
        g.drawString(percentage + "%", g.getWidth() / 2, g.getHeight() - 20);
    };

    // Main app
    const main = () => {
        // Clear any existing interval
        if (mementoInterval) clearInterval(mementoInterval);

        // Initial draw
        drawGrid();

        // Update every minute
        mementoInterval = setInterval(drawGrid, 60000);

        // Handle touch events to exit
        Bangle.on('touch', (button) => {
            if (button === 1) { // Middle button
                if (mementoInterval) clearInterval(mementoInterval);
                load();
            }
        });
    };

    // Start the app
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    main();
}