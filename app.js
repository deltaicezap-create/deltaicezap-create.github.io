class VisualLogger {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.progressIntervalId = null;
        this.sessionStartTime = null;
        this.sessionIntervalId = null;
        this.currentInterval = 0;
        this.selectedColor = null;
        this.cellData = [];
        this.currentProgress = 0;
        
        this.colorMap = {
            'red': '#FFB3B3',
            'yellow': '#FFFF99',
            'green': '#B3FFB3',
            'blue': '#B3D9FF',
            'grey': '#D3D3D3'
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.durationInput = document.getElementById('durationInput');
        this.decrementBtn = document.getElementById('decrementBtn');
        this.incrementBtn = document.getElementById('incrementBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseIcon = document.getElementById('playPauseIcon');
        this.sessionInfo = document.getElementById('sessionInfo');
        this.sessionStatus = document.getElementById('sessionStatus');
        this.sessionTime = document.getElementById('sessionTime');
        this.intervalProgress = document.getElementById('intervalProgress');
        this.progressBar = document.getElementById('progressBar');
        this.intervalCount = document.getElementById('intervalCount');
        this.selectedColorDisplay = document.getElementById('selectedColor');
        this.cellGrid = document.getElementById('cellGrid');
        this.tableStats = document.getElementById('tableStats');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.colorButtons = document.querySelectorAll('.color-btn');
    }
    
    bindEvents() {
        // Duration controls
        this.decrementBtn.addEventListener('click', () => this.adjustDuration(-1));
        this.incrementBtn.addEventListener('click', () => this.adjustDuration(1));
        this.durationInput.addEventListener('change', () => this.validateDuration());
        
        // Play/pause button
        this.playPauseBtn.addEventListener('click', () => this.toggleSession());
        
        // Color buttons
        this.colorButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectColor(btn.dataset.color));
        });
        
        // Table controls
        this.exportBtn.addEventListener('click', () => this.exportCSV());
        this.clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.clearTable();
        });
    }
    
    adjustDuration(delta) {
        const currentValue = parseInt(this.durationInput.value);
        const newValue = Math.max(1, Math.min(300, currentValue + delta));
        this.durationInput.value = newValue;
        
        // If running, restart with new duration
        if (this.isRunning) {
            this.stopSession();
            this.startSession();
        }
    }
    
    validateDuration() {
        const value = parseInt(this.durationInput.value);
        if (isNaN(value) || value < 1) {
            this.durationInput.value = 1;
        } else if (value > 300) {
            this.durationInput.value = 300;
        }
    }
    
    toggleSession() {
        if (this.isRunning) {
            this.stopSession();
        } else {
            this.startSession();
        }
    }
    
    startSession() {
        this.isRunning = true;
        this.sessionStartTime = new Date();
        this.currentInterval = 0;
        this.currentProgress = 0;
        
        // Update UI
        this.playPauseIcon.textContent = '⏸️';
        this.sessionStatus.textContent = 'Recording...';
        this.durationInput.disabled = true;
        this.decrementBtn.disabled = true;
        this.incrementBtn.disabled = true;
        
        // Start session timer for display
        this.sessionIntervalId = setInterval(() => this.updateSessionTime(), 1000);
        
        // Start first interval
        this.startNewInterval();
    }
    
    stopSession() {
        this.isRunning = false;
        
        // Clear intervals
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.progressIntervalId) {
            clearInterval(this.progressIntervalId);
            this.progressIntervalId = null;
        }
        if (this.sessionIntervalId) {
            clearInterval(this.sessionIntervalId);
            this.sessionIntervalId = null;
        }
        
        // Update UI
        this.playPauseIcon.textContent = '▶️';
        this.sessionStatus.textContent = this.cellData.length > 0 ? 'Session paused' : 'Ready to start';
        this.durationInput.disabled = false;
        this.decrementBtn.disabled = false;
        this.incrementBtn.disabled = false;
        this.currentProgress = 0;
        this.updateProgress();
        
        // Clear color selection
        this.clearColorSelection();
    }
    
    startNewInterval() {
        if (!this.isRunning) return;
        
        this.currentInterval++;
        this.selectedColor = null;
        this.currentProgress = 0;
        this.clearColorSelection();
        
        const duration = parseInt(this.durationInput.value) * 1000;
        const progressStep = 100 / (duration / 100); // Update every 100ms
        
        // Update interval display
        this.intervalCount.textContent = `Interval: ${this.currentInterval}`;
        this.selectedColorDisplay.textContent = 'No color selected';
        
        // Progress animation
        this.progressIntervalId = setInterval(() => {
            this.currentProgress += progressStep;
            if (this.currentProgress >= 100) {
                this.currentProgress = 100;
                clearInterval(this.progressIntervalId);
            }
            this.updateProgress();
        }, 100);
        
        // Interval completion
        this.intervalId = setTimeout(() => {
            this.completeInterval();
            if (this.isRunning) {
                this.startNewInterval();
            }
        }, duration);
    }
    
    completeInterval() {
        const color = this.selectedColor || 'grey';
        const timestamp = new Date();
        
        // Store cell data
        const cellData = {
            cellNumber: this.cellData.length + 1,
            color: color,
            timestamp: timestamp,
            intervalNumber: this.currentInterval
        };
        this.cellData.push(cellData);
        
        // Create visual cell
        this.createCell(color, this.cellData.length);
        
        // Update stats
        this.updateDisplay();
    }
    
    createCell(color, cellNumber) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.backgroundColor = this.colorMap[color];
        cell.textContent = cellNumber;
        cell.title = `Cell ${cellNumber}: ${color}`;
        
        this.cellGrid.appendChild(cell);
        
        // Scroll to show new cell
        cell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    selectColor(color) {
        if (!this.isRunning) return;
        
        this.selectedColor = color;
        
        // Update visual feedback
        this.colorButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === color);
        });
        
        // Update display
        this.selectedColorDisplay.textContent = `Selected: ${color}`;
        this.selectedColorDisplay.style.color = this.colorMap[color];
    }
    
    clearColorSelection() {
        this.colorButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        this.selectedColorDisplay.textContent = 'No color selected';
        this.selectedColorDisplay.style.color = '';
    }
    
    updateProgress() {
        this.progressBar.style.setProperty('--progress-width', `${this.currentProgress}%`);
    }
    
    updateSessionTime() {
        if (!this.sessionStartTime) return;
        
        const elapsed = Math.floor((new Date() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        // Update table stats
        const colorCounts = this.getColorCounts();
        const totalCells = this.cellData.length;
        
        this.tableStats.textContent = `Total cells: ${totalCells}`;
        
        // Show empty state if no cells
        if (totalCells === 0) {
            if (!this.cellGrid.querySelector('.empty-state')) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <div class="empty-state-icon">📊</div>
                    <p>No cells logged yet.<br>Press play to start recording!</p>
                `;
                this.cellGrid.appendChild(emptyState);
            }
        } else {
            const emptyState = this.cellGrid.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    }
    
    getColorCounts() {
        const counts = {
            red: 0,
            yellow: 0,
            green: 0,
            blue: 0,
            grey: 0
        };
        
        this.cellData.forEach(cell => {
            counts[cell.color]++;
        });
        
        return counts;
    }
    
    exportCSV() {
        if (this.cellData.length === 0) {
            alert('No data to export. Start logging to generate data.');
            return;
        }
        
        const colorCounts = this.getColorCounts();
        const sessionDuration = this.sessionStartTime ? 
            Math.floor((new Date() - this.sessionStartTime) / 60000) : 0;
        
        // Generate CSV content
        let csvContent = 'Cell Number,Color Selected,Timestamp,Interval Number\n';
        
        this.cellData.forEach(cell => {
            const timestamp = cell.timestamp.toISOString();
            csvContent += `${cell.cellNumber},${cell.color},${timestamp},${cell.intervalNumber}\n`;
        });
        
        // Add summary statistics
        csvContent += '\n--- Summary Statistics ---\n';
        csvContent += `Total cells,${this.cellData.length}\n`;
        csvContent += `Red cells,${colorCounts.red}\n`;
        csvContent += `Yellow cells,${colorCounts.yellow}\n`;
        csvContent += `Green cells,${colorCounts.green}\n`;
        csvContent += `Blue cells,${colorCounts.blue}\n`;
        csvContent += `Grey cells,${colorCounts.grey}\n`;
        csvContent += `Duration interval,${this.durationInput.value} seconds\n`;
        csvContent += `Session duration,${sessionDuration} minutes\n`;
        csvContent += `Export timestamp,${new Date().toISOString()}\n`;
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `visual-logger-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    
    clearTable() {
        console.log('Clear table called, cell data length:', this.cellData.length);
        
        if (this.cellData.length === 0) {
            alert('No data to clear. The table is already empty.');
            return;
        }
        
        // Show confirmation dialog
        const confirmed = window.confirm('Are you sure you want to clear all logged data? This action cannot be undone.');
        console.log('Confirmation result:', confirmed);
        
        if (!confirmed) {
            return;
        }
        
        // Stop session if running
        if (this.isRunning) {
            this.stopSession();
        }
        
        // Clear data
        this.cellData = [];
        this.currentInterval = 0;
        this.sessionStartTime = null;
        
        // Clear UI
        this.cellGrid.innerHTML = '';
        this.sessionStatus.textContent = 'Ready to start';
        this.sessionTime.textContent = '00:00';
        this.intervalCount.textContent = 'Interval: 0';
        this.selectedColorDisplay.textContent = 'No color selected';
        this.selectedColorDisplay.style.color = '';
        this.clearColorSelection();
        
        // Reset progress
        this.currentProgress = 0;
        this.updateProgress();
        
        // Update display
        this.updateDisplay();
        
        console.log('Table cleared successfully');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.visualLogger = new VisualLogger();
});

// Prevent zoom on double tap for mobile
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    const timeSince = now - (window.lastTouchEnd || 0);
    if (timeSince < 300 && timeSince > 0) {
        e.preventDefault();
    }
    window.lastTouchEnd = now;
});

// Add haptic feedback for mobile (if available)
function hapticFeedback() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Add haptic feedback to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', hapticFeedback);
    });
});