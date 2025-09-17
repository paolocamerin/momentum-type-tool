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
    window.CanvasManager.resize();
    updateCanvasWidth();
}

function updateCanvasWidth() {
    const margin = UIController.getMarginValue();
    const dimensions = window.CanvasManager.getDimensions();
    wdt = dimensions.width - margin * 2;
}

// Initialize the application
async function init() {
    try {
        // Initialize canvas system
        console.log('[Main] CanvasManager type:', typeof window.CanvasManager);
        console.log('[Main] CanvasManager.init type:', typeof window.CanvasManager.init);
        console.log('[Main] CanvasManager object:', window.CanvasManager);
        console.log('[Main] About to call CanvasManager.init...');
        try {
            window.CanvasManager.init('canvas', 'shader-canvas');
            console.log('[Main] CanvasManager.init called successfully');
        } catch (error) {
            console.error('[Main] Error calling CanvasManager.init:', error);
            throw error;
        }

        // Initialize shader system
        const shaderInitialized = await window.ShaderManager.init();

        // Initialize render pipeline
        window.RenderPipeline.init();

        // Initialize animation engine
        window.AnimationEngine.init();

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
        window.AnimationEngine.animate();

    } catch (err) {
        console.error('Error initializing app:', err);
        // Fallback: initialize without font system
        window.CanvasManager.init('canvas', 'shader-canvas');
        window.RenderPipeline.init();
        window.AnimationEngine.init();
        UIController.init(words, userHasTyped, wdt);
        UIController.setupEventListeners();
        UIController.updateSliderValues();
        setupCanvas();
        window.AnimationEngine.animate();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
