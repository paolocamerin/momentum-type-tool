// Render Pipeline - Coordinates all rendering operations

class RenderPipeline {
    constructor() {
        this.textRenderer = null;
        this.backgroundRenderer = null;
        this.isInitialized = false;
    }

    // Initialize the render pipeline
    init() {
        this.textRenderer = window.TextRenderer;
        this.backgroundRenderer = window.BackgroundRenderer;
        this.isInitialized = true;
        console.log('[RenderPipeline] Render pipeline initialized');
    }

    // Render a complete frame
    render(words, userHasTyped, animationTime, canvasWidth, canvasHeight, backgroundColor, fillColor) {
        if (!this.isInitialized) return;

        const displayCtx = window.CanvasManager.getDisplayContext();

        // Clear canvas
        displayCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Render background
        this.backgroundRenderer.render(displayCtx, canvasWidth, canvasHeight, backgroundColor, animationTime);

        // Render text
        this.textRenderer.render(displayCtx, words, userHasTyped, animationTime, canvasWidth, canvasHeight, fillColor);
    }

    // Render for export at fixed resolution (1920x1080)
    renderForExport(ctx, exportWidth, exportHeight, animationTime) {
        if (!this.isInitialized) {
            console.warn('[RenderPipeline] Not initialized for export');
            return;
        }

        console.log('[RenderPipeline] Starting renderForExport:', exportWidth, 'x', exportHeight);

        // Clear export canvas
        ctx.clearRect(0, 0, exportWidth, exportHeight);

        // Get current UI state
        const backgroundColor = window.UIController.getBackgroundColor();
        const fillColor = window.UIController.getFillColor();
        const currentText = this.getText();
        const isPlaceholder = this.getIsPlaceholder();

        console.log('[RenderPipeline] Export state - Text:', currentText, 'Placeholder:', isPlaceholder);

        // Don't export placeholder content
        if (isPlaceholder) {
            console.warn('Cannot export placeholder content');
            return;
        }

        // Render background at export resolution
        console.log('[RenderPipeline] Rendering background...');
        this.backgroundRenderer.renderForExport(ctx, exportWidth, exportHeight, backgroundColor, animationTime);

        // Render text at export resolution
        console.log('[RenderPipeline] Rendering text...');
        this.textRenderer.renderForExport(ctx, currentText, true, animationTime, exportWidth, exportHeight, fillColor);

        console.log('[RenderPipeline] Export render complete');
    }

    // Set shader mode
    setShaderMode(enabled) {
        this.backgroundRenderer.setShaderMode(enabled);
        window.ShaderManager.setMode(enabled);
    }

    // Get shader mode
    getShaderMode() {
        return this.backgroundRenderer.getShaderMode();
    }

    // Set text content and placeholder state
    setText(text, isPlaceholder = false) {
        this.currentText = text;
        this.isPlaceholder = isPlaceholder;
        if (this.textRenderer) {
            this.textRenderer.setPlaceholderState(isPlaceholder);
        }
    }

    // Get current text
    getText() {
        return this.currentText || '';
    }

    // Check if current text is placeholder
    getIsPlaceholder() {
        return this.isPlaceholder || false;
    }

    // Set text alignment
    setTextAlignment(isLeftAligned) {
        this.textRenderer.setAlignment(isLeftAligned);
    }

    // Get text alignment
    getTextAlignment() {
        return this.textRenderer.getAlignment();
    }

    // Get render pipeline status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            shaderMode: this.getShaderMode(),
            textAlignment: this.getTextAlignment()
        };
    }
}

// Export singleton instance
window.RenderPipeline = new RenderPipeline();
