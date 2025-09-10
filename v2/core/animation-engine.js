// Animation Engine - Handles animation timing and frame management

class AnimationEngine {
    constructor() {
        this.frameCount = 0;
        this.isPlaying = true;
        this.animationStartTime = 0;
        this.pausedTime = 0;
        this.isInitialized = false;
    }

    // Initialize animation engine
    init() {
        this.animationStartTime = performance.now();
        this.isInitialized = true;
        console.log('[AnimationEngine] Animation engine initialized');
    }

    // Get current animation time in seconds
    getAnimationTime() {
        if (!this.isPlaying) {
            return this.pausedTime;
        }
        return (performance.now() - this.animationStartTime) / 1000;
    }

    // Start animation loop
    animate() {
        if (!this.isPlaying) return;

        this.frameCount++;

        // Get current state from UI
        const currentWords = UIController.getWords();
        const currentUserHasTyped = UIController.getUserHasTyped();
        const animationTime = this.getAnimationTime();

        // Get canvas dimensions
        const dimensions = window.CanvasManager.getDimensions();

        // Get colors from UI
        const backgroundColor = UIController.getBackgroundColor();
        const fillColor = UIController.getFillColor();

        // Render frame using render pipeline
        //console.log('Rendering frame:', { currentWords, animationTime, dimensions, backgroundColor, fillColor });
        window.RenderPipeline.render(
            currentWords,
            currentUserHasTyped,
            animationTime,
            dimensions.width,
            dimensions.height,
            backgroundColor,
            fillColor
        );

        requestAnimationFrame(() => this.animate());
    }

    // Toggle playback
    togglePlayback() {
        if (this.isPlaying) {
            // Pausing: save current time
            this.pausedTime = this.getAnimationTime();
            this.isPlaying = false;
        } else {
            // Resuming: adjust start time to account for paused duration
            this.animationStartTime = performance.now() - (this.pausedTime * 1000);
            this.isPlaying = true;
            this.animate();
        }
    }

    // Get playback status
    getIsPlaying() {
        return this.isPlaying;
    }

    // Get frame count
    getFrameCount() {
        return this.frameCount;
    }

    // Get animation status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isPlaying: this.isPlaying,
            frameCount: this.frameCount,
            animationTime: this.getAnimationTime()
        };
    }
}

// Export singleton instance
window.AnimationEngine = new AnimationEngine();
