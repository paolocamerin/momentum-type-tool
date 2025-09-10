// UI Controller - Handles all UI interactions and state management

// UI elements
let phaseSlider, ampSlider, verticalOffsetSlider, marginSlider;
let playPauseBtn, alignmentCheckbox, textInput, fontUploadBtn, fontFile, fontSelect, exportSVGBtn;
let phaseValue, ampValue, verticalOffsetValue, marginValue;
let typingInfo;

// State variables (managed by main.js)
// These are initialized by main.js and passed to initUI()

// Initialize UI elements
function initUI(initialWords, initialUserHasTyped, initialWdt) {
    // Initialize state variables
    words = initialWords;
    userHasTyped = initialUserHasTyped;
    wdt = initialWdt;

    // Get UI elements
    phaseSlider = document.getElementById('phaseSlider');
    ampSlider = document.getElementById('ampSlider');
    verticalOffsetSlider = document.getElementById('verticalOffsetSlider');
    marginSlider = document.getElementById('marginSlider');
    playPauseBtn = document.getElementById('playPauseBtn');
    alignmentCheckbox = document.getElementById('alignmentCheckbox');
    textInput = document.getElementById('textInput');
    fontUploadBtn = document.getElementById('fontUploadBtn');
    fontFile = document.getElementById('fontFile');
    fontSelect = document.getElementById('fontSelect');
    exportSVGBtn = document.getElementById('exportSVGBtn');

    // Get value display elements
    phaseValue = document.getElementById('phaseValue');
    ampValue = document.getElementById('ampValue');
    verticalOffsetValue = document.getElementById('verticalOffsetValue');
    marginValue = document.getElementById('marginValue');

    // Get typing info element
    typingInfo = document.querySelector('.typing-info');

    // Initialize text input with default text
    textInput.value = words;

    // Initialize alignment state from checkbox
    AnimationEngine.setAlignment(alignmentCheckbox.checked);
}

// Setup all event listeners
function setupEventListeners() {
    // Slider events
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

    marginSlider.addEventListener('input', () => {
        updateSliderValues();
        // Canvas width update is handled by main.js
        // Always update the display when sliders change
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
    exportSVGBtn.addEventListener('click', ExportManager.exportToSVG);

    // Text input events
    textInput.addEventListener('input', handleTextInput);

    // Focus text input for immediate use
    textInput.focus();
}

// Update slider value displays
function updateSliderValues() {
    phaseValue.textContent = getPhaseValue().toFixed(2);
    ampValue.textContent = Math.round(getAmplitudeValue());
    verticalOffsetValue.textContent = getVerticalOffsetValue().toFixed(2);
    marginValue.textContent = Math.round(getMarginValue());
}

// Handle text input changes
function handleTextInput() {
    const inputText = textInput.value;

    if (inputText.trim() === '') {
        words = "Start typing your title";
        userHasTyped = false;
        typingInfo.classList.remove('fade-out');
    } else {
        words = inputText;
        if (!userHasTyped) {
            userHasTyped = true;
            typingInfo.classList.add('fade-out');
        }
    }

    // Always update the display when text changes
    AnimationEngine.draw(words, userHasTyped);
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

function getMarginValue() {
    return 50 + parseFloat(marginSlider.value) * 350;
}

// Get current state for other modules
function getCurrentState() {
    return {
        words,
        userHasTyped,
        wdt,
        phase: AnimationEngine.getFrameCount() * 0.05,
        additionalPhase: getPhaseValue(),
        amplitude: getAmplitudeValue(),
        rowOffset: getVerticalOffsetValue(),
        margin: getMarginValue(),
        isLeftAligned: AnimationEngine.getAlignment()
    };
}

// Export UI controller functions
window.UIController = {
    init: initUI,
    setupEventListeners,
    updateSliderValues,
    getCurrentState,
    getPhaseValue,
    getAmplitudeValue,
    getVerticalOffsetValue,
    getMarginValue,
    getWords: () => words,
    getUserHasTyped: () => userHasTyped,
    getWdt: () => wdt,
    setWdt: (value) => { wdt = value; }
};
