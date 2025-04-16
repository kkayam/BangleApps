{// Memento Mori - A year progress visualization app
    const GRID_SIZE = 19; // 19x19 grid to fit 365 days (361 squares)
    const SQUARE_SIZE = 9; // Size of each square in pixels

    const drawGrid = () => {
        g.setBgColor(0.2, 0.2, 0.2).clear();
        g.setFontAlign(0, 0);

        // Starting position
        const startX = 2;
        const startY = 2;

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
        g.setColor(0.7, 0.7, 0.7);
        if (currentRow > 0) {
            g.fillRect(
                startX,
                startY,
                startX + (GRID_SIZE * SQUARE_SIZE),
                startY + (currentRow * SQUARE_SIZE)
            );
        }

        // Draw current row up to today
        if (currentCol > 0) {
            g.fillRect(
                startX,
                startY + (currentRow * SQUARE_SIZE),
                startX + (currentCol * SQUARE_SIZE),
                startY + ((currentRow + 1) * SQUARE_SIZE)
            );
        }

        // Draw today's square
        g.setColor(1, 0, 0);
        g.fillRect(
            startX + (currentCol * SQUARE_SIZE),
            startY + 1 + (currentRow * SQUARE_SIZE),
            startX + ((currentCol + 1) * SQUARE_SIZE),
            startY + 1 + ((currentRow + 1) * SQUARE_SIZE)
        );

        // Draw percentage
        const percentage = Math.floor((dayOfYear / 365) * 100);
        g.setColor(1, 1, 1);
        g.setFont("6x8", 2);
        g.drawString(percentage + "%", g.getWidth() / 2, g.getHeight() - 20);
    };

    // Start the app
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    drawGrid();
}