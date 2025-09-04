// Main Application Coordinator - Vanilla JS port of the p5.js momentum type tool

// Application state
let words = ""; // Will be initialized from placeholder text
let userHasTyped = false;
let wdt = 0;

function setupCanvas() {
    // Initialize canvas manager
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    CanvasManager.initCanvas(canvas);

    // Setup resize listener
    window.addEventListener('resize', () => {
        CanvasManager.resizeCanvas();
        updateCanvasWidth();
        if (!AnimationEngine.isPlaying()) {
            AnimationEngine.draw(words, userHasTyped);
        }
    });

    // Initial canvas width update
    updateCanvasWidth();
}

function updateCanvasWidth() {
    const targetRes = CanvasManager.getTargetResolution();
    const margin = AnimationEngine.getHorizontalMargin ? AnimationEngine.getHorizontalMargin() : 120;
    wdt = targetRes.width - margin * 2;
}

// Initialize the application
async function init() {
    try {
        // Initialize UI controller first (needed for canvas width calculation)
        UIController.init(words, userHasTyped, wdt);
        UIController.setupEventListeners();
        UIController.updateSliderValues();

        // Initialize canvas system after UI is ready
        setupCanvas();

        // Get canvas references from Canvas Manager
        const displayCanvas = CanvasManager.getDisplayCanvas();
        const renderCanvas = CanvasManager.getRenderCanvas();
        const renderCtx = CanvasManager.getRenderContext();

        // Initialize animation engine with render canvas
        AnimationEngine.init(renderCanvas, renderCtx);

        // Set initial FPS from UI slider
        const fpsSlider = document.getElementById('fpsSlider');
        if (fpsSlider) {
            AnimationEngine.setTargetFPS(parseInt(fpsSlider.value));
        }

        // Initialize font system
        await FontManager.initDB();
        await FontManager.createFontSelector();
        await FontManager.loadDefaultFont();

        // Start animation
        AnimationEngine.animate();

    } catch (err) {
        console.error('Error initializing app:', err);
        // Fallback: initialize without font system
        UIController.init(words, userHasTyped, wdt);
        UIController.setupEventListeners();
        UIController.updateSliderValues();
        setupCanvas();
        const renderCanvas = CanvasManager.getRenderCanvas();
        const renderCtx = CanvasManager.getRenderContext();
        AnimationEngine.init(renderCanvas, renderCtx);

        // Set initial FPS from UI slider
        const fpsSlider = document.getElementById('fpsSlider');
        if (fpsSlider) {
            AnimationEngine.setTargetFPS(parseInt(fpsSlider.value));
        }

        AnimationEngine.animate();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
