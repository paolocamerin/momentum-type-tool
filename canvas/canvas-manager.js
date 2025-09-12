// Canvas Manager - Handles display and shader canvas management

class CanvasManager {
    constructor() {
        this.displayCanvas = null;
        this.displayCtx = null;
        this.shaderCanvas = null;
        this.shaderCtx = null;
        this.isInitialized = false;
    }

    // Initialize both canvases
    init(displayCanvasId, shaderCanvasId) {
        this.displayCanvas = document.getElementById(displayCanvasId);
        this.shaderCanvas = document.getElementById(shaderCanvasId);

        if (!this.displayCanvas || !this.shaderCanvas) {
            throw new Error('Canvas elements not found');
        }

        // Get contexts
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.shaderCtx = this.shaderCanvas.getContext('webgl') || this.shaderCanvas.getContext('experimental-webgl');

        if (!this.displayCtx) {
            throw new Error('2D context not supported');
        }

        // Set up canvas positioning
        this.setupCanvasPositioning();

        // Initial resize
        this.resize();

        this.isInitialized = true;
        console.log('[CanvasManager] Canvas system initialized');
    }

    // Set up canvas positioning and layering
    setupCanvasPositioning() {
        // Position shader canvas behind display canvas
        this.shaderCanvas.style.position = 'absolute';
        this.shaderCanvas.style.top = '0';
        this.shaderCanvas.style.left = '0';
        this.shaderCanvas.style.zIndex = '-1';
        this.shaderCanvas.style.pointerEvents = 'none';

        // Display canvas on top
        this.displayCanvas.style.position = 'relative';
        this.displayCanvas.style.zIndex = '1';
    }

    // Resize both canvases
    resize() {
        if (!this.isInitialized) return;

        const width = window.innerWidth;
        const height = (width / 16) * 9;

        // Resize display canvas
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.displayCanvas.style.width = width + 'px';
        this.displayCanvas.style.height = height + 'px';

        // Resize shader canvas to match
        this.shaderCanvas.width = width;
        this.shaderCanvas.height = height;
        this.shaderCanvas.style.width = width + 'px';
        this.shaderCanvas.style.height = height + 'px';

        console.log(`[CanvasManager] Canvas resized: ${width}x${height}`);
    }

    // Get display canvas and context
    getDisplayCanvas() {
        return this.displayCanvas;
    }

    getDisplayContext() {
        return this.displayCtx;
    }

    // Get shader canvas and context
    getShaderCanvas() {
        return this.shaderCanvas;
    }

    getShaderContext() {
        return this.shaderCtx;
    }

    // Get canvas dimensions
    getDimensions() {
        return {
            width: this.displayCanvas.width,
            height: this.displayCanvas.height
        };
    }

    // Check if WebGL is available
    hasWebGL() {
        return !!this.shaderCtx;
    }

    // Get initialization status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasDisplayCanvas: !!this.displayCanvas,
            hasShaderCanvas: !!this.shaderCanvas,
            hasWebGL: this.hasWebGL()
        };
    }
}

// Export singleton instance
console.log('[CanvasManager] Creating instance...');
window.CanvasManager = new CanvasManager();
console.log('[CanvasManager] Instance created:', window.CanvasManager);
console.log('[CanvasManager] init method:', typeof window.CanvasManager.init);
