// UI Controller - Handles all UI interactions and state management

// UI elements
let phaseSlider, ampSlider, verticalOffsetSlider, marginSlider;
let playPauseBtn, alignmentCheckbox, shaderModeCheckbox, textInput, fontUploadBtn, fontFile, fontSelect, exportSVGBtn;
let phaseValue, ampValue, verticalOffsetValue, marginValue;
let typingInfo;

// Color picker elements
let bgColorPicker, textColorPicker, swapColorsBtn;
let bgPickr, textPickr;

// Color state
let backgroundColor = '#ffffff';
let textColor = '#000000';

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
    shaderModeCheckbox = document.getElementById('shaderModeCheckbox');
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

    // Get color picker elements
    bgColorPicker = document.getElementById('bgColorPicker');
    textColorPicker = document.getElementById('textColorPicker');
    swapColorsBtn = document.getElementById('swapColorsBtn');

    // Initialize text input with default text
    textInput.value = words;

    // Initialize alignment state from checkbox
    window.RenderPipeline.setTextAlignment(alignmentCheckbox.checked);

    // Initialize color pickers
    initColorPickers();
}

// Setup all event listeners
function setupEventListeners() {
    // Slider events
    phaseSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    ampSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    verticalOffsetSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    marginSlider.addEventListener('input', () => {
        updateSliderValues();
    });

    // Button events
    playPauseBtn.addEventListener('click', () => {
        window.AnimationEngine.togglePlayback();
    });

    alignmentCheckbox.addEventListener('change', () => {
        window.RenderPipeline.setTextAlignment(alignmentCheckbox.checked);
    });

    shaderModeCheckbox.addEventListener('change', () => {
        window.RenderPipeline.setShaderMode(shaderModeCheckbox.checked);
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

    // Color picker events
    swapColorsBtn.addEventListener('click', swapColors);
}

// Initialize color pickers
function initColorPickers() {
    // Initialize background color picker
    bgPickr = Pickr.create({
        el: '#bgColorPicker',
        theme: 'classic',
        default: backgroundColor,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });

    // Initialize text color picker
    textPickr = Pickr.create({
        el: '#textColorPicker',
        theme: 'classic',
        default: textColor,
        components: {
            preview: true,
            hue: true,
            interaction: { input: true }
        }
    });

    // Set initial colors
    bgPickr.setColor(backgroundColor);
    textPickr.setColor(textColor);

    // Add event listeners
    bgPickr.on('change', (color) => {
        backgroundColor = color.toHEXA().toString();
    });

    textPickr.on('change', (color) => {
        textColor = color.toHEXA().toString();
    });
}

// Swap colors function
function swapColors() {
    const tempColor = backgroundColor;
    backgroundColor = textColor;
    textColor = tempColor;

    // Update pickers
    bgPickr.setColor(backgroundColor);
    textPickr.setColor(textColor);
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

    // Text changes are handled by the animation loop
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
        phase: window.AnimationEngine.getFrameCount() * 0.05,
        additionalPhase: getPhaseValue(),
        amplitude: getAmplitudeValue(),
        rowOffset: getVerticalOffsetValue(),
        margin: getMarginValue(),
        isLeftAligned: window.RenderPipeline.getTextAlignment()
    };
}

// Get background color
function getBackgroundColor() {
    return backgroundColor;
}

// Get fill color
function getFillColor() {
    return textColor;
}

// Get speed value
function getSpeedValue() {
    return 1.0;
}

// Get factor value
function getFactorValue() {
    return 1.4;
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
    getBackgroundColor,
    getFillColor,
    getSpeedValue,
    getFactorValue,
    getWords: () => words,
    getUserHasTyped: () => userHasTyped,
    getWdt: () => wdt,
    setWdt: (value) => { wdt = value; }
};
