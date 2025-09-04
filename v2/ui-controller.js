// UI Controller - Handles all UI interactions and state management

// UI elements
let speedSlider, phaseSlider, ampSlider, verticalOffsetSlider, fpsSlider;
let playPauseBtn, alignmentCheckbox, textInput, textHistorySelect, fontUploadBtn, fontFile, fontSelect, exportSVGBtn, exportPNGBtn, exportMP4Btn, loopExportCheckbox;
let factorInput, factorValue;
let speedValue, phaseValue, ampValue, verticalOffsetValue, fpsValue, currentFpsValue;

// Color picker elements
let fillPicker, bgPicker, swapColors;
let fillPickr, bgPickr;

// State variables (managed by main.js)
// These are initialized by main.js and passed to initUI()

// Color state
let fillColor = '#000000';
let bgColor = '#ffffff';
let isSwapped = false;

// Debounce timer for saving text history
let textHistoryDebounceId = null;

// Initialize UI elements
function initUI(initialWords, initialUserHasTyped, initialWdt) {
    // Initialize state variables
    words = initialWords;
    userHasTyped = initialUserHasTyped;
    wdt = initialWdt;

    // Get UI elements
    speedSlider = document.getElementById('speedSlider');
    phaseSlider = document.getElementById('phaseSlider');
    ampSlider = document.getElementById('ampSlider');
    verticalOffsetSlider = document.getElementById('verticalOffsetSlider');
    fpsSlider = document.getElementById('fpsSlider');
    factorInput = document.getElementById('factorInput');
    playPauseBtn = document.getElementById('playPauseBtn');
    alignmentCheckbox = document.getElementById('alignmentCheckbox');
    textInput = document.getElementById('textInput');
    fontUploadBtn = document.getElementById('fontUploadBtn');
    textHistorySelect = document.getElementById('textHistorySelect');
    fontFile = document.getElementById('fontFile');
    fontSelect = document.getElementById('fontSelect');
    exportSVGBtn = document.getElementById('exportSVGBtn');
    exportPNGBtn = document.getElementById('exportPNGBtn');
    exportMP4Btn = document.getElementById('exportMP4Btn');
    loopExportCheckbox = document.getElementById('loopExportCheckbox');

    // Get color picker elements
    fillPicker = document.getElementById('fillPicker');
    bgPicker = document.getElementById('bgPicker');
    swapColors = document.getElementById('swapColors');

    // Get value display elements
    speedValue = document.getElementById('speedValue');
    phaseValue = document.getElementById('phaseValue');
    ampValue = document.getElementById('ampValue');
    verticalOffsetValue = document.getElementById('verticalOffsetValue');
    fpsValue = document.getElementById('fpsValue');
    currentFpsValue = document.getElementById('currentFpsValue');
    factorValue = document.getElementById('factorValue');


    // Initialize text input with default text from placeholder
    words = textInput.placeholder;
    textInput.value = "";

    // Initialize alignment state from checkbox

    // Initialize color pickers
    initializeColorPickers();

    // Initialize recent texts
    loadTextHistory();
    populateTextHistory();

    // Initialize export button text
    updateExportButtonText();
}

// Setup all event listeners
function setupEventListeners() {
    // Slider events
    speedSlider.addEventListener('input', () => {
        updateSliderValues();
        // Speed now affects phase directly via AnimationEngine.getAnimationTime() * UI speed
        AnimationEngine.draw(words, userHasTyped);
    });

    phaseSlider.addEventListener('input', () => {
        updateSliderValues();
        // Always update the display when sliders change
        AnimationEngine.draw(words, userHasTyped);
    });

    ampSlider.addEventListener('input', () => {
        updateSliderValues();
        // Always update the display when sliders change
        AnimationEngine.draw(words, userHasTyped);
    });

    verticalOffsetSlider.addEventListener('input', () => {
        updateSliderValues();
        // Always update the display when sliders change
        AnimationEngine.draw(words, userHasTyped);
    });

    fpsSlider.addEventListener('input', () => {
        // Update target FPS in animation engine first
        AnimationEngine.setTargetFPS(parseInt(fpsSlider.value));
        // Then update all slider displays
        updateSliderValues();
        // Update export button text
        updateExportButtonText();
        AnimationEngine.draw(words, userHasTyped);
    });

    // Margin slider removed; margins are internal now

    // Factor input event
    factorInput.addEventListener('input', () => {
        updateSliderValues();
        // Always update the display when factor changes
        AnimationEngine.draw(words, userHasTyped);
    });

    // Color swap event
    swapColors.addEventListener('click', () => {
        isSwapped = !isSwapped;
        syncColorPickers();
        // Always update the display when colors change
        AnimationEngine.draw(words, userHasTyped);
    });

    // Button events
    playPauseBtn.addEventListener('click', () => {
        AnimationEngine.togglePlayback();
        if (AnimationEngine.isPlaying()) {
            AnimationEngine.animate();
        }
    });

    alignmentCheckbox.addEventListener('change', () => {
        AnimationEngine.setAlignment(alignmentCheckbox.checked);
        // Always update the display when alignment changes
        AnimationEngine.draw(words, userHasTyped);
    });

    fontUploadBtn.addEventListener('click', () => fontFile.click());

    // Font file upload
    fontFile.addEventListener('change', FontManager.handleFontUpload);

    // Font selection
    fontSelect.addEventListener('change', FontManager.handleFontChange);

    // Export functionality
    exportSVGBtn.addEventListener('click', () => { console.log('[UI] Export SVG clicked'); ExportManager.exportToSVG(); });
    if (exportPNGBtn) exportPNGBtn.addEventListener('click', () => { console.log('[UI] Export PNG clicked'); ExportManager.exportToPNG(); });
    if (exportMP4Btn) exportMP4Btn.addEventListener('click', () => { console.log('[UI] Export MP4 (browser) clicked'); ExportManager.exportBrowserVideo(true); });

    // Text input events
    textInput.addEventListener('input', handleTextInput);

    // Recent text selection
    if (textHistorySelect) {
        textHistorySelect.addEventListener('change', () => {
            const value = textHistorySelect.value;
            if (value) {
                textInput.value = value;
                handleTextInput();
            }
        });
    }

    // Focus text input for immediate use
    textInput.focus();
}

// Update slider value displays
function updateSliderValues() {
    speedValue.textContent = getSpeedValue().toFixed(2);
    phaseValue.textContent = getPhaseValue().toFixed(2);
    ampValue.textContent = Math.round(getAmplitudeValue());
    verticalOffsetValue.textContent = getVerticalOffsetValue().toFixed(2);
    fpsValue.textContent = fpsSlider.value;
    factorValue.textContent = getFactorValue().toFixed(2);
}

// Update export button text with current FPS
function updateExportButtonText() {
    if (exportMP4Btn) {
        exportMP4Btn.textContent = `Export MP4 (1080p/${fpsSlider.value}fps/15s)`;
    }
}

// Handle text input changes
function handleTextInput() {
    const inputText = textInput.value;

    if (inputText.trim() === '') {
        words = textInput.placeholder;
        userHasTyped = false;
    } else {
        words = inputText;
        if (!userHasTyped) {
            userHasTyped = true;
        }
    }

    // Always update the display when text changes
    AnimationEngine.draw(words, userHasTyped);

    // Debounced persist and update recent history (skip empty/placeholder)
    if (textHistoryDebounceId) {
        clearTimeout(textHistoryDebounceId);
    }
    textHistoryDebounceId = setTimeout(() => {
        const trimmed = textInput.value.trim();
        if (trimmed.length > 0) {
            saveTextToHistory(trimmed);
            populateTextHistory();
        }
    }, 1000);
}

// Canvas width management (handled by main.js)

// Helper functions to get scaled slider values
function getPhaseValue() {
    return parseFloat(phaseSlider.value) * 10;
}

function getAmplitudeValue() {
    return parseFloat(ampSlider.value) * 400;
}

function getVerticalOffsetValue() {
    return parseFloat(verticalOffsetSlider.value);
}

// Margins are now handled internally by the AnimationEngine

function getFactorValue() {
    return parseFloat(factorInput.value);
}

function getSpeedValue() {
    return parseFloat(speedSlider.value);
}

// Color picker functions
function initializeColorPickers() {
    // Initialize Pickr instances
    fillPickr = Pickr.create({
        el: '#fillPicker',
        theme: 'classic',
        default: fillColor,
        components: {
            preview: true,
            opacity: false,
            hue: true,
            interaction: {
                input: true,
                save: true
            }
        }
    });

    bgPickr = Pickr.create({
        el: '#bgPicker',
        theme: 'classic',
        default: bgColor,
        components: {
            preview: true,
            opacity: false,
            hue: true,
            interaction: {
                input: true,
                save: true
            }
        }
    });

    // Add change event listeners
    fillPickr.on('change', (color) => {
        fillColor = color.toHEXA().toString();
        // console.log('Fill color changed to:', fillColor);
        syncColorPickers();
        AnimationEngine.draw(words, userHasTyped);
    });

    bgPickr.on('change', (color) => {
        bgColor = color.toHEXA().toString();
        // console.log('Background color changed to:', bgColor);
        syncColorPickers();
        AnimationEngine.draw(words, userHasTyped);
    });
}

// Recent text history (localStorage-backed)
const TEXT_HISTORY_KEY = 'v2_text_history';
const TEXT_HISTORY_LIMIT = 10;

function loadTextHistory() {
    try {
        const raw = localStorage.getItem(TEXT_HISTORY_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) return arr;
        return [];
    } catch (_) {
        return [];
    }
}

function saveTextHistory(arr) {
    try {
        localStorage.setItem(TEXT_HISTORY_KEY, JSON.stringify(arr));
    } catch (_) {
        /* ignore */
    }
}

function saveTextToHistory(text) {
    let arr = loadTextHistory();
    // Deduplicate, most-recent-first
    arr = [text, ...arr.filter(t => t !== text)].slice(0, TEXT_HISTORY_LIMIT);
    saveTextHistory(arr);
}

function populateTextHistory() {
    if (!textHistorySelect) return;
    const arr = loadTextHistory();
    // Preserve first placeholder option, rebuild the rest
    textHistorySelect.innerHTML = '<option value="">Recent texts…</option>';
    for (const t of arr) {
        const opt = document.createElement('option');
        opt.value = t;
        opt.title = t; // show full text on hover
        opt.textContent = t.length > 50 ? t.slice(0, 50) + '…' : t;
        textHistorySelect.appendChild(opt);
    }
}

function syncColorPickers() {
    fillPickr.setColor(fillColor);
    bgPickr.setColor(bgColor);
}

function getFillColor() {
    const color = isSwapped ? bgColor : fillColor;
    // console.log('getFillColor called - isSwapped:', isSwapped, 'returning:', color);
    return color;
}

function getBackgroundColor() {
    return isSwapped ? fillColor : bgColor;
}

// Get current state for other modules
function getCurrentState() {
    return {
        words,
        userHasTyped,
        wdt,
        phase: AnimationEngine.getAnimationTime() * 0.05,
        additionalPhase: getPhaseValue(),
        amplitude: getAmplitudeValue(),
        rowOffset: getVerticalOffsetValue(),
        // margin is internal now
        isLeftAligned: AnimationEngine.getAlignment()
    };
}

// Export UI controller functions
window.UIController = {
    init: initUI,
    setupEventListeners,
    updateSliderValues,
    getCurrentState,
    getSpeedValue,
    getPhaseValue,
    getAmplitudeValue,
    getVerticalOffsetValue,
    getFactorValue,
    getFillColor,
    getBackgroundColor,
    getWords: () => words,
    getUserHasTyped: () => userHasTyped,
    getWdt: () => wdt,
    setWdt: (value) => { wdt = value; }
};
