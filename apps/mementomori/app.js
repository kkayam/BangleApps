{// Memento Mori - A month progress visualization app
    const DAYS_IN_WEEK = 7;
    const SQUARE_SIZE = 20; // Size of each square in pixels

    const drawGrid = () => {
        g.setBgColor(g.theme.bg).clear();
        g.setFontAlign(0, 0);

        // Get current date info
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(now.getFullYear(), currentMonth, 1).getDay();

        // Calculate grid dimensions
        const gridWidth = DAYS_IN_WEEK * SQUARE_SIZE;
        const gridHeight = Math.ceil((daysInMonth + firstDayOfMonth) / DAYS_IN_WEEK) * SQUARE_SIZE;

        // Center the grid
        const startX = (g.getWidth() - gridWidth) / 2;
        const startY = (g.getHeight() - gridHeight) / 2;

        // Draw month name
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        g.setColor(g.theme.fg);
        g.setFont("6x8", 2);
        g.drawString(monthNames[currentMonth], g.getWidth() / 2, startY - 20);

        // Draw weekday headers
        const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
        g.setColor(g.theme.fg2);
        g.setFont("6x8", 1);
        for (let i = 0; i < DAYS_IN_WEEK; i++) {
            g.drawString(weekDays[i], startX + (i * SQUARE_SIZE) + SQUARE_SIZE / 2, startY - 5);
        }

        // Draw the grid
        let dayCount = 1;
        for (let row = 0; row < Math.ceil((daysInMonth + firstDayOfMonth) / DAYS_IN_WEEK); row++) {
            for (let col = 0; col < DAYS_IN_WEEK; col++) {
                const x = startX + (col * SQUARE_SIZE);
                const y = startY + (row * SQUARE_SIZE);

                // Skip drawing before the first day of the month
                if (row === 0 && col < firstDayOfMonth) continue;

                // Stop if we've drawn all days
                if (dayCount > daysInMonth) break;

                // Draw the day block
                if (dayCount < currentDate) {
                    // Past days
                    g.setColor(g.theme.fg2);
                    g.fillRect(x + 1, y + 1, x + SQUARE_SIZE - 1, y + SQUARE_SIZE - 1);
                } else if (dayCount === currentDate) {
                    // Today
                    g.setColor(g.theme.fgH);
                    g.fillRect(x + 1, y + 1, x + SQUARE_SIZE - 1, y + SQUARE_SIZE - 1);
                } else {
                    // Future days
                    g.setColor(g.theme.bg2);
                    g.fillRect(x + 1, y + 1, x + SQUARE_SIZE - 1, y + SQUARE_SIZE - 1);
                }

                dayCount++;
            }
        }

        // Draw percentage
        const percentage = Math.floor((currentDate / daysInMonth) * 100);
        g.setColor(g.theme.fg);
        g.setFont("6x8", 2);
        g.drawString(percentage + "%", g.getWidth() / 2, g.getHeight() - 20);
    };

    // Start the app
    setWatch(Bangle.showClock, BTN1, { debounce: 100 });
    drawGrid();
}