/**
 * Video Export using Mediabunny
 * Simple canvas-to-MP4 export with Mediabunny library
 */

// Import Mediabunny from CDN
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH, QUALITY_MEDIUM, QUALITY_LOW } from 'https://cdn.skypack.dev/mediabunny@1.14.4';

// Ensure VideoExport is available immediately
window.VideoExport = window.VideoExport || {};

// Test Mediabunny import
console.log('🔧 Mediabunny import test:', {
    Output: typeof Output,
    Mp4OutputFormat: typeof Mp4OutputFormat,
    BufferTarget: typeof BufferTarget,
    CanvasSource: typeof CanvasSource,
    QUALITY_HIGH: typeof QUALITY_HIGH
});

// Global state for recording
let currentRecording = null;
let isExporting = false;

/**
 * Export canvas as MP4 video using Mediabunny
 * @param {Object} options - Export options
 * @param {HTMLCanvasElement} options.canvas - Canvas to export
 * @param {number} [options.durationSec=5] - Duration in seconds
 * @param {string} [options.quality='high'] - Quality: 'low', 'medium', 'high'
 * @param {Function} [options.onProgress] - Progress callback: (progress) => void
 */
async function exportCanvasToMP4({ canvas, durationSec = 5, quality = 'high', onProgress }) {
    console.log('🎬 Starting video export using MediaRecorder approach...');

    if (!canvas) {
        throw new Error('Canvas element is required');
    }

    if (isExporting) {
        throw new Error('Export already in progress');
    }

    isExporting = true;

    // Show progress UI
    const progressDiv = createProgressUI();
    document.body.appendChild(progressDiv);

    try {
        console.log('📊 Canvas info:', {
            width: canvas.width,
            height: canvas.height,
            hasContent: canvas.width > 0 && canvas.height > 0
        });

        // Check if canvas has content
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasContent = imageData.data.some(pixel => pixel !== 0);
        console.log('🎨 Canvas has content:', hasContent);

        // Determine quality settings
        const qualitySettings = {
            low: 1000000,
            medium: 4000000,
            high: 8000000
        };

        const bitrate = qualitySettings[quality] || qualitySettings.high;
        console.log('⚙️ Quality settings:', { quality, bitrate });

        // Create a temporary canvas for recording at fixed 1920x1080 resolution
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 1920;
        tempCanvas.height = 1080;
        const tempCtx = tempCanvas.getContext('2d');

        // Get canvas stream
        console.log('🎥 Getting canvas stream...');
        const stream = tempCanvas.captureStream(30);
        console.log('✅ Canvas stream created');

        // Set up MediaRecorder - MP4 ONLY
        const mp4MimeTypes = [
            'video/mp4;codecs=avc1.42E01E',
            'video/mp4;codecs=avc1.4D001E',
            'video/mp4'
        ];

        let selectedMime = null;
        for (const mime of mp4MimeTypes) {
            if (MediaRecorder.isTypeSupported(mime)) {
                selectedMime = mime;
                break;
            }
        }

        if (!selectedMime) {
            throw new Error('MP4 export not supported in this browser. MP4 is required - no other formats accepted.');
        }

        console.log('🎬 Selected MIME type:', selectedMime);

        const recorder = new MediaRecorder(stream, {
            mimeType: selectedMime,
            videoBitsPerSecond: bitrate
        });

        const chunks = [];
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
                console.log(`📦 Chunk received: ${event.data.size} bytes`);
            }
        };

        // Start recording
        console.log('🚀 Starting recording...');
        recorder.start(100); // Collect data every 100ms

        // Render animation frames
        const fps = 30;
        const totalFrames = Math.floor(durationSec * fps);
        const frameInterval = 1000 / fps;

        console.log(`🎬 Rendering ${totalFrames} frames at ${fps} FPS...`);

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const tSec = frameIndex / fps;

            console.log(`📸 Rendering frame ${frameIndex + 1}/${totalFrames} at ${tSec.toFixed(2)}s`);

            // Render the animation at this specific time
            const state = UIController.getCurrentState();
            const dimensions = window.CanvasManager.getDimensions();
            const backgroundColor = UIController.getBackgroundColor();
            const fillColor = UIController.getFillColor();

            // Render frame at export resolution using RenderPipeline
            window.RenderPipeline.renderForExport(tempCtx, tempCanvas.width, tempCanvas.height, tSec);

            const progress = (frameIndex + 1) / totalFrames;
            updateProgress(progressDiv, progress);

            if (onProgress) {
                onProgress(progress);
            }

            console.log(`📈 Progress: ${Math.round(progress * 100)}%`);

            // Wait for next frame
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }

        // Stop recording
        console.log('🏁 Stopping recording...');
        await new Promise((resolve) => {
            recorder.onstop = resolve;
            recorder.stop();
        });

        console.log('✅ Recording stopped');

        // Create final blob
        const blob = new Blob(chunks, { type: selectedMime });
        console.log('📦 Final blob created:', {
            size: blob.size,
            type: blob.type,
            chunks: chunks.length
        });

        if (blob.size === 0) {
            throw new Error('Generated video blob is empty');
        }

        // Download the file
        console.log('💾 Downloading file...');
        downloadVideo(blob, `momentum-type-${Date.now()}.mp4`);

        console.log('✅ MP4 export complete');
        showSuccess('MP4 exported successfully!');

    } catch (error) {
        console.error('❌ Video export failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        showError(`Video export failed: ${error.message}`);
    } finally {
        isExporting = false;
        if (progressDiv.parentNode) {
            progressDiv.parentNode.removeChild(progressDiv);
        }
    }
}

/**
 * Start live recording using canvas stream
 * @param {Object} options - Recording options
 * @param {HTMLCanvasElement} options.canvas - Canvas to record
 * @param {number} [options.fps=30] - Frame rate
 * @param {string} [options.quality='high'] - Quality setting
 */
async function startLiveRecording({ canvas, fps = 30, quality = 'high' }) {
    if (!canvas) {
        throw new Error('Canvas element is required');
    }

    if (currentRecording) {
        throw new Error('Recording already in progress');
    }

    try {
        // Get canvas stream
        const stream = canvas.captureStream(fps);

        // Create MediaRecorder with MP4 support
        const mimeTypes = [
            'video/mp4;codecs=avc1.42E01E',
            'video/mp4;codecs=avc1.4D001E',
            'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];

        let selectedMime = null;
        for (const mime of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mime)) {
                selectedMime = mime;
                break;
            }
        }

        if (!selectedMime) {
            throw new Error('No supported video MIME types found');
        }

        // Quality settings
        const qualitySettings = {
            low: 1000000,
            medium: 4000000,
            high: 8000000
        };

        const bitrate = qualitySettings[quality] || qualitySettings.high;

        // Create MediaRecorder
        const recorder = new MediaRecorder(stream, {
            mimeType: selectedMime,
            videoBitsPerSecond: bitrate
        });

        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        // Start recording
        recorder.start(1000); // Collect data every second

        currentRecording = {
            recorder,
            chunks,
            mime: selectedMime,
            stop: () => new Promise((resolve, reject) => {
                if (recorder.state === 'inactive') {
                    resolve({ blob: new Blob(chunks, { type: selectedMime }), mime: selectedMime });
                    return;
                }

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: selectedMime });
                    resolve({ blob, mime: selectedMime });
                };

                recorder.onerror = (event) => {
                    reject(new Error(`MediaRecorder error: ${event.error}`));
                };

                recorder.stop();
            })
        };

        console.log(`Live recording started: ${selectedMime}`);
        return currentRecording;

    } catch (error) {
        console.error('Live recording failed:', error);
        throw error;
    }
}

/**
 * Stop live recording
 */
async function stopLiveRecording() {
    if (!currentRecording) {
        throw new Error('No recording in progress');
    }

    try {
        const { blob, mime } = await currentRecording.stop();

        // Download the file
        const extension = mime.includes('mp4') ? 'mp4' : 'webm';
        downloadVideo(blob, `momentum-type-live-${Date.now()}.${extension}`);

        console.log(`Live recording complete: ${mime}`);
        showSuccess(`Live recording exported successfully! (${mime})`);

        currentRecording = null;
        return { blob, mime };

    } catch (error) {
        console.error('Stop recording failed:', error);
        throw error;
    }
}

/**
 * Create progress UI element
 */
function createProgressUI() {
    const progressDiv = document.createElement('div');
    progressDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 30px;
        border-radius: 15px;
        z-index: 1000;
        text-align: center;
        font-family: 'Inter', sans-serif;
        min-width: 300px;
    `;
    progressDiv.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 15px;">Exporting Video...</div>
        <div id="progressText" style="font-size: 14px; margin-bottom: 10px;">0%</div>
        <div id="progressBar" style="width: 250px; height: 12px; background: #333; margin: 0 auto; border-radius: 6px; overflow: hidden;">
            <div id="progressFill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #007AFF, #00D4FF); border-radius: 6px; transition: width 0.3s ease;"></div>
        </div>
       
    `;
    return progressDiv;
}

/**
 * Update progress UI
 */
function updateProgress(progressDiv, progress) {
    const progressText = progressDiv.querySelector('#progressText');
    const progressFill = progressDiv.querySelector('#progressFill');

    if (progressText) {
        progressText.textContent = `${Math.round(progress * 100)}%`;
    }
    if (progressFill) {
        progressFill.style.width = `${progress * 100}%`;
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

/**
 * Download video blob
 */
function downloadVideo(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Check browser support
 */
function checkVideoSupport() {
    return {
        mediabunny: typeof Output !== 'undefined',
        mediaRecorder: !!window.MediaRecorder,
        canvasCapture: !!HTMLCanvasElement.prototype.captureStream,
        mp4: MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E'),
        webm: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    };
}

// Export functions for global access
window.VideoExport = {
    exportCanvasToMP4,
    startLiveRecording,
    stopLiveRecording,
    checkVideoSupport
};
