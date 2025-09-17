// Canvas Manager - Handles display and shader canvas management

class CanvasManager {
    constructor() {
        this.displayCanvas = null;
        this.displayCtx = null;
        this.shaderCanvas = null;
        this.shaderCtx = null;

        // Internal fixed resolution canvases
        this.internalCanvas = null;
        this.internalCtx = null;
        this.internalShaderCanvas = null;
        this.internalShaderCtx = null;

        // Fixed resolution
        this.FIXED_WIDTH = 1920;
        this.FIXED_HEIGHT = 1080;

        this.isInitialized = false;
    }

    // Initialize both canvases
    init(displayCanvasId, shaderCanvasId) {
        this.displayCanvas = document.getElementById(displayCanvasId);
        this.shaderCanvas = document.getElementById(shaderCanvasId);

        if (!this.displayCanvas || !this.shaderCanvas) {
            throw new Error('Canvas elements not found');
        }

        // Get display contexts
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.shaderCtx = this.shaderCanvas.getContext('webgl') || this.shaderCanvas.getContext('experimental-webgl');

        if (!this.displayCtx) {
            throw new Error('2D context not supported');
        }

        // Create internal fixed resolution canvases
        this.createInternalCanvases();

        // Set up canvas positioning
        this.setupCanvasPositioning();

        // Initial resize
        this.resize();

        this.isInitialized = true;
        console.log('[CanvasManager] Canvas system initialized with fixed resolution:', this.FIXED_WIDTH, 'x', this.FIXED_HEIGHT);
    }

    // Create internal fixed resolution canvases
    createInternalCanvases() {
        // Create internal 2D canvas for text rendering
        this.internalCanvas = document.createElement('canvas');
        this.internalCanvas.width = this.FIXED_WIDTH;
        this.internalCanvas.height = this.FIXED_HEIGHT;
        this.internalCtx = this.internalCanvas.getContext('2d');

        // Create internal shader canvas for WebGL rendering
        this.internalShaderCanvas = document.createElement('canvas');
        this.internalShaderCanvas.width = this.FIXED_WIDTH;
        this.internalShaderCanvas.height = this.FIXED_HEIGHT;
        this.internalShaderCtx = this.internalShaderCanvas.getContext('webgl') || this.internalShaderCanvas.getContext('experimental-webgl');

        console.log('[CanvasManager] Internal canvases created at', this.FIXED_WIDTH, 'x', this.FIXED_HEIGHT);
    }

    // Set up canvas positioning and layering
    setupCanvasPositioning() {
        // Both canvases should be positioned absolutely within the container
        // and centered using the same logic

        // Shader canvas (background layer)
        this.shaderCanvas.style.position = 'absolute';
        this.shaderCanvas.style.zIndex = '1';
        this.shaderCanvas.style.pointerEvents = 'none';

        // Display canvas (text layer on top)
        this.displayCanvas.style.position = 'absolute';
        this.displayCanvas.style.zIndex = '2';
        this.displayCanvas.style.pointerEvents = 'none';
    }

    // Resize display canvases to fit within the 70% allocated space
    resize() {
        if (!this.isInitialized) return;

        // Get the canvas container dimensions (70% of viewport height)
        const container = document.querySelector('.canvas-container');
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate display canvas size maintaining 16:9 aspect ratio
        const aspectRatio = 16 / 9;
        let displayWidth, displayHeight;

        // Fit by width or height, whichever is more restrictive
        if (containerWidth / containerHeight > aspectRatio) {
            // Container is wider than 16:9, fit by height
            displayHeight = containerHeight;
            displayWidth = displayHeight * aspectRatio;
        } else {
            // Container is taller than 16:9, fit by width
            displayWidth = containerWidth;
            displayHeight = displayWidth / aspectRatio;
        }

        // Ensure we don't exceed container bounds
        displayWidth = Math.min(displayWidth, containerWidth);
        displayHeight = Math.min(displayHeight, containerHeight);

        // Calculate centered position within container
        const leftOffset = (containerWidth - displayWidth) / 2;
        const topOffset = (containerHeight - displayHeight) / 2;

        // Set display canvas size and position (these are just for display)
        this.displayCanvas.width = displayWidth;
        this.displayCanvas.height = displayHeight;
        this.displayCanvas.style.width = displayWidth + 'px';
        this.displayCanvas.style.height = displayHeight + 'px';
        this.displayCanvas.style.left = leftOffset + 'px';
        this.displayCanvas.style.top = topOffset + 'px';

        // Set shader canvas to match exactly (same size and position)
        this.shaderCanvas.width = displayWidth;
        this.shaderCanvas.height = displayHeight;
        this.shaderCanvas.style.width = displayWidth + 'px';
        this.shaderCanvas.style.height = displayHeight + 'px';
        this.shaderCanvas.style.left = leftOffset + 'px';
        this.shaderCanvas.style.top = topOffset + 'px';

        // Store scale factor for rendering
        this.scaleX = displayWidth / this.FIXED_WIDTH;
        this.scaleY = displayHeight / this.FIXED_HEIGHT;

        console.log(`[CanvasManager] Display canvas resized: ${displayWidth}x${displayHeight} (16:9 aspect ratio within ${containerWidth}x${containerHeight} container)`);
        console.log(`[CanvasManager] Scale factor: ${this.scaleX.toFixed(3)}x${this.scaleY.toFixed(3)}`);
        console.log(`[CanvasManager] Internal resolution: ${this.FIXED_WIDTH}x${this.FIXED_HEIGHT}`);
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

    // Get internal canvas and context (for rendering)
    getInternalCanvas() {
        return this.internalCanvas;
    }

    getInternalContext() {
        return this.internalCtx;
    }

    getInternalShaderCanvas() {
        return this.internalShaderCanvas;
    }

    getInternalShaderContext() {
        return this.internalShaderCtx;
    }

    // Get fixed resolution dimensions
    getFixedDimensions() {
        return {
            width: this.FIXED_WIDTH,
            height: this.FIXED_HEIGHT
        };
    }

    // Get display canvas dimensions
    getDimensions() {
        return {
            width: this.displayCanvas.width,
            height: this.displayCanvas.height
        };
    }

    // Get scale factors
    getScaleFactors() {
        return {
            scaleX: this.scaleX || 1,
            scaleY: this.scaleY || 1
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
