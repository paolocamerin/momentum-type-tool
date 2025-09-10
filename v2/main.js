// Main Application Coordinator - Vanilla JS port of the p5.js momentum type tool

// Application state
let words = "Start typing your title";
let userHasTyped = false;
let wdt = 0;

function setupCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const canvas = AnimationEngine.getCanvas();
    canvas.width = window.innerWidth;
    canvas.height = (window.innerWidth / 16) * 9;
    updateCanvasWidth();

    // Set canvas style
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = canvas.height + 'px';

    if (!AnimationEngine.isPlaying()) {
        AnimationEngine.draw(words, userHasTyped);
    }
}

function updateCanvasWidth() {
    const margin = UIController.getMarginValue();
    const canvas = AnimationEngine.getCanvas();
    wdt = canvas.width - margin * 2;
}

// Initialize the application
async function init() {
    try {
        // Initialize canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Initialize animation engine
        AnimationEngine.init(canvas, ctx);

        // Initialize UI controller
        UIController.init(words, userHasTyped, wdt);
        UIController.setupEventListeners();
        UIController.updateSliderValues();

        // Setup canvas
        setupCanvas();

        // Initialize font system
        await FontManager.initDB();
        await FontManager.createFontSelector();
        await FontManager.loadDefaultFont();

        // Start animation
        AnimationEngine.animate();

    } catch (err) {
        console.error('Error initializing app:', err);
        // Fallback: initialize without font system
        AnimationEngine.init(canvas, ctx);
        UIController.init(words, userHasTyped, wdt);
        UIController.setupEventListeners();
        UIController.updateSliderValues();
        setupCanvas();
        AnimationEngine.animate();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
