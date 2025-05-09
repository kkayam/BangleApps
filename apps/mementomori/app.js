{// Memento Mori - A year progress visualization app
    const GRID_SIZE = 19; // 19x19 grid to fit 365 days (361 squares)
    const SQUARE_SIZE = 9; // Size of each square in pixels

    const drawGrid = () => {
        g.setBgColor(g.theme.bg).clear();
        g.setFontAlign(0, 0);

        // Starting position
        const startX = 0;
        const startY = 0;

        // Get current day of year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Calculate row and column for current day
        const currentRow = Math.floor(dayOfYear / GRID_SIZE);
        const currentCol = dayOfYear % GRID_SIZE;

        // Draw completed rows (past days)
        g.setColor(g.theme.bg2);
        if (currentRow > 0) {
            g.fillRect(
                startX,
                startY,
                176,
                currentRow == 18 ? 176 - SQUARE_SIZE : startY + (currentRow * SQUARE_SIZE)
            );
        }

        // Draw current row up to today
        if (currentCol > 0) {
            g.fillRect(
                startX,
                currentRow == 18 ? 176 - SQUARE_SIZE : startY + (currentRow * SQUARE_SIZE),
                startX + (currentCol * SQUARE_SIZE),
                currentRow == 18 ? 176 : startY + ((currentRow + 1) * SQUARE_SIZE)
            );
        }

        // Draw today's square
        g.setColor(g.theme.fg);
        g.fillRect(
            startX + (currentCol * SQUARE_SIZE),
            currentRow == 18 ? 176 - SQUARE_SIZE + 1 : startY + 1 + (currentRow * SQUARE_SIZE),
            startX + ((currentCol + 1) * SQUARE_SIZE),
            currentRow == 18 ? 176 : startY + 1 + ((currentRow + 1) * SQUARE_SIZE)
        );

        // Draw percentage
        const percentage = Math.floor((dayOfYear / 365) * 100);
        g.setColor(g.theme.fg);
        g.setFont("6x8", 2);
        g.drawString(percentage + "%", g.getWidth() / 2, g.getHeight() - 20);
    };

    // Start the app
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    drawGrid();
}