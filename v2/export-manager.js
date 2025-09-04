// Export Manager - Handles export functionality (SVG, PNG; MP4 planned)

function exportToSVG() {
    console.log('[Export][SVG] start');
    if (!FontManager.hasFont()) {
        console.warn('[Export][SVG] No font loaded for SVG export');
        return;
    }

    const font = FontManager.getFont();
    const state = UIController.getCurrentState();
    const targetRes = CanvasManager.getTargetResolution();

    // Create SVG element
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', targetRes.width);
    svg.setAttribute('height', targetRes.height);
    svg.setAttribute('viewBox', `0 0 ${targetRes.width} ${targetRes.height}`);

    // Set background color
    const backgroundRect = document.createElementNS(svgNS, 'rect');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');
    backgroundRect.setAttribute('fill', UIController.getBackgroundColor());
    svg.appendChild(backgroundRect);

    // Create main group for all text
    const group = document.createElementNS(svgNS, 'g');
    svg.appendChild(group);

    // Get character positions from centralized animation engine
    const characters = AnimationEngine.calculateCharacterPositions(
        state.words,
        state.userHasTyped,
        AnimationEngine.getAnimationTime(),
        targetRes.width,
        targetRes.height
    );

    // Convert each character to SVG path
    for (const char of characters) {
        const path = font.getPath(char.character, char.x, char.y, char.fontSize);
        const svgPath = document.createElementNS(svgNS, 'path');

        // Convert path commands to SVG path data
        const pathData = path.commands.map(cmd => {
            switch (cmd.type) {
                case 'M': return `M ${cmd.x} ${cmd.y}`;
                case 'L': return `L ${cmd.x} ${cmd.y}`;
                case 'C': return `C ${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`;
                case 'Q': return `Q ${cmd.x1} ${cmd.y1} ${cmd.x} ${cmd.y}`;
                case 'Z': return 'Z';
                default: return '';
            }
        }).join(' ');

        svgPath.setAttribute('d', pathData);
        svgPath.setAttribute('fill', char.userHasTyped ? UIController.getFillColor() : '#e6e6e6');
        group.appendChild(svgPath);
    }

    // Create and download the SVG file
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'momentum-type-animation.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[Export][SVG] done');
}

function exportToPNG() {
    console.log('[Export][PNG] start');
    // Render at full resolution to the hidden render canvas, then export a PNG
    const renderCanvas = CanvasManager.getRenderCanvas();
    const renderCtx = CanvasManager.getRenderContext();
    const state = UIController.getCurrentState();

    // Draw current frame to render canvas at target resolution
    AnimationEngine.draw(UIController.getWords(), UIController.getUserHasTyped());

    // Create PNG blob
    renderCanvas.toBlob((blob) => {
        if (!blob) { console.error('[Export][PNG] toBlob returned null'); return; }
        console.log('[Export][PNG] blob created, bytes=', blob.size);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'momentum-type-frame.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('[Export][PNG] download triggered');
    }, 'image/png');
}


// Export export manager functions
window.ExportManager = {
    exportToSVG,
    exportToPNG,
    exportBrowserVideo
};

// Browser MediaRecorder fallback (preview). Uses captureStream(30), exports WebM/MP4 based on support.
async function exportBrowserVideo(forceLoop) {
    try {
        const displayCanvas = CanvasManager.getDisplayCanvas();
        console.log('[Export][BrowserVideo] start. loop=', !!forceLoop);
        // Progress UI
        const overlay = document.getElementById('exportProgress');
        const textEl = document.getElementById('exportProgressText');
        const barEl = document.getElementById('exportProgressBar');
        if (overlay) overlay.style.display = 'flex';
        if (textEl) textEl.textContent = 'Recording… 0%';
        if (barEl) barEl.style.width = '0%';
        const targetFPS = AnimationEngine.getTargetFPS();
        const stream = displayCanvas.captureStream(targetFPS);
        console.log('[Export][BrowserVideo] captureStream created @', targetFPS, 'fps. tracks=', stream.getTracks().length);
        const preferredTypes = [
            'video/mp4;codecs=avc1',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        let mimeType = '';
        for (const t of preferredTypes) {
            const ok = window.MediaRecorder && MediaRecorder.isTypeSupported(t);
            console.log('[Export][BrowserVideo] MediaRecorder.isTypeSupported', t, '=>', !!ok);
            if (ok) { mimeType = t; break; }
        }
        console.log('[Export][BrowserVideo] using mimeType=', mimeType || '(default)');
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        const chunks = [];
        recorder.onstart = () => console.log('[Export][BrowserVideo] recorder started');
        recorder.onpause = () => console.log('[Export][BrowserVideo] recorder paused');
        recorder.onresume = () => console.log('[Export][BrowserVideo] recorder resumed');
        recorder.onerror = (e) => console.error('[Export][BrowserVideo] recorder error', e);
        recorder.ondataavailable = e => {
            if (e.data && e.data.size) {
                chunks.push(e.data);
                console.log('[Export][BrowserVideo] dataavailable chunk bytes=', e.data.size, 'totalChunks=', chunks.length);
            }
        };
        recorder.onstop = () => {
            console.log('[Export][BrowserVideo] recorder stopped. chunks=', chunks.length);
            const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
            console.log('[Export][BrowserVideo] final blob bytes=', blob.size);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `momentum-type-browser.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            const overlay = document.getElementById('exportProgress');
            if (overlay) overlay.style.display = 'none';
        };

        // Override to a deterministic loop if requested: step phase per frame with frame-accurate timing
        if (forceLoop) {
            const fps = targetFPS, seconds = 15, totalFrames = fps * seconds;
            const frameInterval = 1000 / fps; // milliseconds per frame
            recorder.start();
            let f = 0;
            let lastFrameTime = performance.now();

            const renderFrame = () => {
                if (f >= totalFrames) {
                    recorder.stop();
                    if (textEl) textEl.textContent = 'Finalizing…';
                    console.log('[Export][BrowserVideo] finalize');
                    return;
                }

                const now = performance.now();
                const deltaTime = now - lastFrameTime;

                // Only render when enough time has passed for the next frame
                if (deltaTime >= frameInterval) {
                    const t = f / totalFrames;
                    const phase = 2 * Math.PI * t + UIController.getPhaseValue();
                    AnimationEngine.drawForPhase(UIController.getWords(), UIController.getUserHasTyped(), phase);
                    f++;
                    lastFrameTime = now;

                    const pct = Math.floor((f / totalFrames) * 100);
                    if (barEl) barEl.style.width = `${pct}%`;
                    if (textEl) textEl.textContent = `Recording… ${pct}%`;
                    if (pct % 10 === 0) console.log('[Export][BrowserVideo] progress', pct, '%');
                }

                requestAnimationFrame(renderFrame);
            };
            renderFrame();
        } else {
            recorder.start();
            const start = performance.now();
            const tick = () => {
                const elapsed = performance.now() - start;
                const pct = Math.min(100, (elapsed / 15000) * 100);
                if (barEl) barEl.style.width = `${pct}%`;
                if (textEl) textEl.textContent = `Recording… ${Math.floor(pct)}%`;
                if (elapsed >= 15000) { recorder.stop(); if (textEl) textEl.textContent = 'Finalizing…'; console.log('[Export][BrowserVideo] finalize'); } else { requestAnimationFrame(tick); }
            };
            tick();
        }
    } catch (e) {
        console.error('[Export][BrowserVideo] recording failed', e);
        alert('Browser recording failed. See console for details.');
        const overlay = document.getElementById('exportProgress');
        if (overlay) overlay.style.display = 'none';
    }
} ``
