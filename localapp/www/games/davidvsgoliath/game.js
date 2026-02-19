// game.js for David's Triumph - v213: Fixed glioma typo in drawBarbedWireNet, fixed powerUp.yuter_width typo, flipped spear with tip at base, adjusted spear rotation, changed David's hit explosion to blue shades, Goliath's to red shades, removed duplicated scripture on winner screen

// --- Global Constants ---
const DPR = window.devicePixelRatio || 1;

// --- Game State ---
let david = {};
let goliath = {};
let stones = [];
let spears = [];
let powerUps = [];
let particles = [];
let spearSmoke = [];
let gameOver = true;
let gameStarted = false;
let lastPowerUpSpawn = 0;
let nextPowerUpInterval = 0;
let isTransitioning = false;
let currentLevel = 1;
let completedLevel = 0;
const maxLevels = 20;
let shakeTime = 0;
let shakeIntensity = 0;
let davidThrowing = false;
let gameWon = false;
let keys = { left: false, right: false, up: false, down: false };
let isHighScoreEntryActive = false;
let hasSubmittedScore = false;
let powerUpGlow = 0;
let glowTimer = 0;
let goliathBlinkTimer = 0;

// NEW Animation State Variables
let animationFrame = 0;
let frameTimer = 0;
const FRAME_DURATION = 80; // Milliseconds per frame. Lower is faster.
const TOTAL_FRAMES = 4; // !!! IMPORTANT: Change this to the number of frames in your spritesheet !!!
// --- ADD THIS CONSTANT ---
// Manual pixel offsets to correct character drift in the animation frames.
const ANIMATION_OFFSETS = [
    [0, 0],   // Frame 0: No shift, reference position
    [-5, 0],  // Frame 1: Pull back 5px if arm drifts right
    [-10, 0], // Frame 2: Pull back 10px
    [-15, 0]  // Frame 3: Pull back 15px
];
let speedPowerUpActive = false;
let speedPowerUpDuration = 0;
let tripleDamagePowerUpActive = false;
let tripleDamageHits = 0;
const SPEED_POWER_UP_DURATION = 7000;
const TRIPLE_DAMAGE_HITS = 3;
let goliathSpearPauseTimer = 0;
const SPEAR_PAUSE_DURATION = 250;
let enrageShakeTimer = 0;
let enrageShakeIntensity = 10;
let finalHitDelayTimer = 0;
let isFinalHit = false;
let isGoliathDefeated = false;
// Temporary wind lines for Goliath's dodge effect
let dodgeWindLines = [];
// Animated wind effect state
let windLines = [];
const WIND_LINE_COUNT = 5;
// Spear aura intensity for red glow effect
let spearAuraIntensity = 0;
// Stone glow intensity for blue and white glow effect
let stoneGlowIntensity = 0;
let powerUpGlowTimer = 0; // Timer for power-up glow animation

// Bones on Goliath's side
let bones = [];
const BONE_COUNT = 5;

// --- High Score State ---
let highScores = [];
const MAX_HIGH_SCORES = 10;
const badWords = [
    "fuck", "shit", "asshole", "bitch", "cunt", "nigger", "nigga", "fag", "faggot",
    "dick", "pussy", "damn", "hell", "cock", "slut", "whore", "retard",
    "anal", "sex", "porno", "rape", "racist", "nazi"
].map(w => w.toLowerCase());

// --- Level Configurations ---
const levelConfigs = {
    1: { gH: 1, gS: 2, dH: 10, sI: Infinity, pU: false, dodge: 0 },
    2: { gH: 10, gS: 2.5, dH: 9, sI: 2800, pU: false, dodge: 0.1 },
    3: { gH: 15, gS: 3, dH: 9, sI: 2600, pU: true, dodge: 0.15 },
    4: { gH: 20, gS: 3.5, dH: 9, sI: 2400, pU: true, dodge: 0.2 },
    5: { gH: 25, gS: 4, dH: 8, sI: 2200, pU: true, dodge: 0.25 },
    6: { gH: 30, gS: 4.5, dH: 8, sI: 2000, pU: true, dodge: 0.3 },
    7: { gH: 35, gS: 5, dH: 7, sI: 1800, pU: true, dodge: 0.35 },
    8: { gH: 40, gS: 5.5, dH: 7, sI: 1600, pU: true, dodge: 0.4 },
    9: { gH: 45, gS: 6, dH: 6, sI: 1400, pU: true, dodge: 0.45 },
    10: { gH: 50, gS: 6.5, dH: 6, sI: 1200, pU: true, dodge: 0.5 },
    11: { gH: 55, gS: 7, dH: 5, sI: 1100, pU: true, dodge: 0.55 },
    12: { gH: 60, gS: 7.5, dH: 5, sI: 1000, pU: true, dodge: 0.6 },
    13: { gH: 65, gS: 8, dH: 4, sI: 900, pU: true, dodge: 0.65 },
    14: { gH: 70, gS: 8.5, dH: 4, sI: 850, pU: true, dodge: 0.7 },
    15: { gH: 75, gS: 9, dH: 3, sI: 800, pU: true, dodge: 0.75 },
    16: { gH: 80, gS: 9.5, dH: 3, sI: 800, pU: true, dodge: 0.8 },
    17: { gH: 85, gS: 10, dH: 2, sI: 800, pU: true, dodge: 0.85 },
    18: { gH: 90, gS: 10.5, dH: 2, sI: 800, pU: true, dodge: 0.9 },
    19: { gH: 95, gS: 11, dH: 1, sI: 750, pU: true, dodge: 0.9 },
    20: { gH: 100, gS: 12, dH: 1, sI: 750, pU: true, dodge: 0.95 }
};

// Normalize levelConfigs
Object.keys(levelConfigs).forEach(lvl => {
    const config = levelConfigs[lvl];
    const dodgeBase = 0.05;
    const dodgeIncrement = 0.045;
    const calculatedDodge = Math.min(0.95, dodgeBase + (lvl - 1) * dodgeIncrement);
    levelConfigs[lvl] = {
        goliathHealth: config.gH,
        goliathSpeed: config.gS,
        davidHealth: config.dH,
        spearInterval: config.sI,
        powerUps: config.pU,
        dodgeChance: calculatedDodge
    };
});

      
// --- DOM Elements ---
let canvas, ctx, scoreDisplay, weddingScreen, gameOverScreen, highScoreScreen,
    startScreen, startBtn, restartBtn, playAgainBtn, startOverBtn, nextLevelBtn,
    highScoreSubmitBtn, highScoreCancelBtn, highScoreInput, highScoreMessage,
    highScoreTitle, highScoreList, gameOverMessage, controls,
    mobileControls, joystickContainer, joystick, mobileThrowBtn,
    instructionsContainer, controlInstructions, leftBtn, rightBtn, upBtn,
    downBtn, throwBtn, backgroundMusic, throwStoneSound, hitGoliathSound,
hitDavidSound, prayerAuthorityBtn, fightMoreGiantsBtn, desktopInstructionsBox;

// --- Asset Loading ---
const DAVID_BASE_WIDTH = 80;
const DAVID_BASE_HEIGHT = 80;
const GOLIATH_BASE_WIDTH = 120;
const GOLIATH_BASE_HEIGHT = 160;
const GOLIATH_SCALE_FACTOR = 1.2;

const davidImg = new Image();
davidImg.src = "icons/david-icon.png";
davidImg.onerror = () => console.error("Failed to load icons/david-icon.png");

const davidSpriteSheet = new Image();
davidSpriteSheet.src = "icons/david-animation.png"; // This should be your SPRITESHEET file now
davidSpriteSheet.onerror = () => console.error("Failed to load icons/david-animation.png");

const goliathImg = new Image();
goliathImg.src = "icons/goliath-icon.png";
goliathImg.onerror = () => console.error("Failed to load icons/goliath-icon.png");

const powerUpImg = new Image();
powerUpImg.src = "icons/power-up-lightning.png";
powerUpImg.onerror = () => console.error("Failed to load icons/power-up-lightning.png");

// --- Firestore REST API Configuration ---
const FIRESTORE_REST_API = "https://firestore.googleapis.com/v1/projects/high-score-1f686/databases/(default)/documents";

// --- High Score Management ---
async function loadHighScores() {
    highScoreList.innerHTML = "";
    highScores = [];

    try {
        const response = await fetch(
            `${FIRESTORE_REST_API}/highscores?orderBy=level%20desc&pageSize=${MAX_HIGH_SCORES}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        highScores = data.documents ? data.documents.map(doc => {
            const fields = doc.fields;
            return {
                name: fields.name.stringValue,
                level: parseInt(fields.level.integerValue),
                goliathHealth: parseInt(fields.goliathHealth.integerValue),
                timestamp: fields.timestamp ? parseInt(fields.timestamp.integerValue) : 0
            };
        }) : [];

        highScores.forEach(score => {
            const date = new Date(score.timestamp);
            const hstTime = date.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' });
            const li = document.createElement("li");
            li.textContent = `${score.name}: Level ${score.level}, Goliath: ${score.goliathHealth} - ${hstTime}`;
            highScoreList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading high scores:", error);
        const li = document.createElement("li");
        li.textContent = "Failed to load high scores.";
        highScoreList.appendChild(li);
    }
}

async function handleHighScoreSubmit() {
    const name = highScoreInput.value.trim();
    if (!name || hasSubmittedScore) return;

    if (badWords.some(word => name.toLowerCase().includes(word))) {
        alert("Please use appropriate language for your name.");
        return;
    }

    hasSubmittedScore = true;
    try {
        const response = await fetch(`${FIRESTORE_REST_API}/highscores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fields: {
                    name: { stringValue: name },
                    level: { integerValue: completedLevel },
                    goliathHealth: { integerValue: Math.round(goliath.health) },
                    timestamp: { integerValue: Date.now() }
                }
            })
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        await loadHighScores();
        highScoreScreen.classList.add("hidden");
        isHighScoreEntryActive = false;
        showGameOverScreen(); // Show game-over screen after high score submission
    } catch (error) {
        console.error("Error submitting high score:", error);
        alert("Failed to submit high score. Please try again later.");
        hasSubmittedScore = false;
    }
}

function handleHighScoreCancel() {
    highScoreScreen.classList.add("hidden");
    isHighScoreEntryActive = false;
    hasSubmittedScore = true; // Prevent re-entry
    showGameOverScreen(); // Show game-over screen on cancel
}

// --- Initialization ---
async function initializeGame() {
    if (!assignAndVerifyDOMElements()) {
        console.error("Initialization failed: Essential DOM elements missing.");
        return;
    }

    ctx.imageSmoothingEnabled = false;
    resizeCanvas();
    window.addEventListener("resize", () => {
        resizeCanvas();
        // Only call setupMobileControlsVisibility if necessary, handled by initial setup
    });
    window.addEventListener("orientationchange", () => {
        resizeCanvas();
        setupMobileControlsVisibility(); // Reapply visibility on orientation change
    });

    initializeWindLines();
    initializeBones();
    initializeAudio();
    await loadHighScores();
    setupMobileControlsVisibility(); // Ensure visibility is set after DOM setup
    setupCoreEventListeners();
    setupGlobalTouchListeners();
    applyPopupStyles();
    showStartScreen();
    requestAnimationFrame(gameLoop);
}

function assignAndVerifyDOMElements() {
    canvas = document.getElementById("game-canvas");
    ctx = canvas ? canvas.getContext("2d") : null;
    scoreDisplay = document.getElementById("score");
    weddingScreen = document.getElementById("wedding");
    gameOverScreen = document.getElementById("game-over");
    highScoreScreen = document.getElementById("high-score-entry");
    startScreen = document.getElementById("start-screen");
    startBtn = document.getElementById("start-btn");
    restartBtn = document.getElementById("restart-btn");
    playAgainBtn = document.getElementById("play-again-btn");
    startOverBtn = document.getElementById("start-over-btn");
    nextLevelBtn = document.getElementById("next-level-btn");
    highScoreSubmitBtn = document.getElementById("high-score-submit-btn");
    highScoreCancelBtn = document.getElementById("high-score-cancel-btn");
    highScoreInput = document.getElementById("high-score-input");
    highScoreMessage = document.getElementById("high-score-message");
    highScoreTitle = document.getElementById("high-score-title");
    highScoreList = document.getElementById("high-score-list");
    gameOverMessage = document.getElementById("game-over-message");
    controls = document.getElementById("controls");
    mobileControls = document.getElementById("mobile-controls-section");
    joystickContainer = document.getElementById("joystick-container");
    joystick = document.getElementById("joystick");
    mobileThrowBtn = document.getElementById("mobile-throw-btn");
    instructionsContainer = document.getElementById("instructions-container");
    controlInstructions = document.getElementById("control-instructions");
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile && controlInstructions) {
        controlInstructions.classList.add("hidden");
    }
    leftBtn = document.getElementById("left-btn");
    rightBtn = document.getElementById("right-btn");
    upBtn = document.getElementById("up-btn");
    downBtn = document.getElementById("down-btn");
    throwBtn = document.getElementById("throw-btn");
    backgroundMusic = document.getElementById("background-music");
    throwStoneSound = document.getElementById("throw-stone-sound");
    hitGoliathSound = document.getElementById("hit-goliath-sound");
    hitDavidSound = document.getElementById("hit-david-sound");
    prayerAuthorityBtn = document.getElementById("prayer-authority-btn");
    fightMoreGiantsBtn = document.getElementById("fight-more-giants-btn");

    // Create desktop instructions box dynamically
    desktopInstructionsBox = document.createElement("div");
    desktopInstructionsBox.id = "desktop-instructions-box";
    desktopInstructionsBox.classList.add("hidden");
    const instructionsText = document.createElement("p");
    instructionsText.textContent = "Move with D-pad, WASD, or arrow keys. Throw with spacebar or throw button. Button is grey while reloading, red when ready.";
    desktopInstructionsBox.appendChild(instructionsText);
    const closeButton = document.createElement("span");
    closeButton.classList.add("close-btn");
    closeButton.textContent = "X";
    closeButton.onclick = () => {
        desktopInstructionsBox.classList.add("hidden");
        isInstructionsClosed = true;
    };
    desktopInstructionsBox.appendChild(closeButton);
    desktopInstructionsBox.style.position = "fixed";
    desktopInstructionsBox.style.top = "50%";
    desktopInstructionsBox.style.right = "15px";
    desktopInstructionsBox.style.transform = "translateY(-50%)";
    desktopInstructionsBox.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    desktopInstructionsBox.style.color = "white";
    desktopInstructionsBox.style.padding = "15px";
    desktopInstructionsBox.style.borderRadius = "5px";
    desktopInstructionsBox.style.zIndex = "1000";
    desktopInstructionsBox.style.maxWidth = "200px";
    desktopInstructionsBox.style.fontSize = "14px";
    document.body.appendChild(desktopInstructionsBox);

    const essentialElements = {
        canvas, ctx, scoreDisplay, startScreen, startBtn, highScoreScreen,
        highScoreTitle, highScoreMessage, highScoreInput, highScoreSubmitBtn,
        highScoreCancelBtn, prayerAuthorityBtn, fightMoreGiantsBtn, mobileThrowBtn,
        gameOverMessage, weddingScreen
    };
    for (const [key, element] of Object.entries(essentialElements)) {
        if (!element) {
            console.error(`Essential DOM element missing: ${key}`);
            displayInitializationError(`Missing required DOM element: ${key}`);
            return false;
        }
    }
    return true;
}

function displayInitializationError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "color:red;background:black;padding:20px;font-size:18px;position:fixed;top:0;left:0;width:100%;z-index:1000;border-bottom:2px solid red;text-align:center;";
    errorDiv.textContent = `Initialization Error: ${message}`;
    document.body.prepend(errorDiv);
}

function applyPopupStyles() {
    if (startScreen) {
        startScreen.style.overflow = "hidden";
        startScreen.style.boxSizing = "border-box";
        startScreen.style.textAlign = "center";
        const innerDiv = startScreen.querySelector("div");
        if (innerDiv) {
            innerDiv.style.overflow = "hidden";
            innerDiv.style.whiteSpace = "normal";
            innerDiv.style.wordWrap = "break-word";
        }
    }
}

function updateDpadGlow() {
    // Reset all D-pad buttons to inactive
    [leftBtn, rightBtn, upBtn, downBtn].forEach(btn => {
        if (btn) btn.classList.remove("active");
    });

    // Check David's movement direction based on keys and apply the active class to D-pad
    if (keys.left && leftBtn) leftBtn.classList.add("active");
    if (keys.right && rightBtn) rightBtn.classList.add("active");
    if (keys.up && upBtn) upBtn.classList.add("active");
    if (keys.down && downBtn) downBtn.classList.add("active");

    // Joystick glow logic
    if (joystick) { // Check if joystick element exists
        if (keys.left || keys.right || keys.up || keys.down) {
            joystick.classList.add("active");
        } else {
            joystick.classList.remove("active");
        }
    }
}

function updateScoreDisplay() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `David: ${david.health}/${david.maxHealth} | Goliath: ${goliath.health}/${goliath.maxHealth}`;
    }
}

function initializeAudio() {
    const audios = [backgroundMusic, throwStoneSound, hitGoliathSound, hitDavidSound];
    audios.forEach(audio => {
        if (audio && typeof audio.load === "function") {
            try {
                audio.load();
                if (audio === backgroundMusic) {
                    audio.volume = 0.25;
                } else {
                    audio.volume = 0.5;
                }
            } catch (e) {
                console.warn(`Audio load error for ${audio?.id || "unknown"}: ${e}`);
            }
        } else {
            console.warn(`Audio element ${audio?.id || "unknown"} not found or invalid`);
        }
    });
}

function initializeWindLines() {
    const canvasWidth = canvas.width / DPR;
    const canvasHeight = canvas.height / DPR;
    windLines = [];
    for (let i = 0; i < WIND_LINE_COUNT; i++) {
        windLines.push({
            startX: Math.random() * canvasWidth,
            startY: (canvasHeight / 2) + (Math.random() * ((canvasHeight / 2) - 20)),
            length: Math.random() * 20 + 10,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.2
        });
    }
}

function initializeBones() {
    const canvasWidth = canvas.width / DPR;
    const canvasHeight = canvas.height / DPR;
    bones = [];

    const positions = [
        { x: canvasWidth * 0.1, y: canvasHeight * 0.1, rotation: Math.PI / 4, size: 15 },
        { x: canvasWidth * 0.3, y: canvasHeight * 0.3, rotation: -Math.PI / 6, size: 12 },
        { x: canvasWidth * 0.5, y: canvasHeight * 0.15, rotation: Math.PI / 3, size: 18 },
        { x: canvasWidth * 0.7, y: canvasHeight * 0.35, rotation: 0, size: 14 },
        { x: canvasWidth * 0.9, y: canvasHeight * 0.2, rotation: Math.PI / 2, size: 16 }
    ];

    for (let i = 0; i < BONE_COUNT; i++) {
        bones.push({
            x: positions[i].x,
            y: positions[i].y,
            rotation: positions[i].rotation,
            size: positions[i].size
        });
    }
}

function resizeCanvas() {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer || !canvas) return;

    requestAnimationFrame(() => {
        if (canvasContainer.offsetWidth === 0 || canvasContainer.offsetHeight === 0) {
            canvasContainer.style.display = "block";
            canvasContainer.style.width = "90%";
        }

        let canvasWidth = canvasContainer.clientWidth * DPR;
        let canvasHeight = canvasContainer.clientHeight * DPR;

        // Adjust minimum dimensions for smaller screens
        const isSmallScreen = window.innerHeight <= 667; // iPhone 7 and similar
        const minWidth = isSmallScreen ? 280 * DPR : 300 * DPR;
        const minHeight = isSmallScreen ? 320 * DPR : 360 * DPR;

        if (canvasWidth < minWidth) {
            canvasWidth = minWidth;
            canvasHeight = canvasWidth / (3 / 3.6);
        }
        if (canvasHeight < minHeight) {
            canvasHeight = minHeight;
            canvasWidth = canvasHeight * (3 / 3.6);
        }

        const targetAspectRatio = 3 / 3.6;
        let newWidth = canvasWidth;
        let newHeight = newWidth / targetAspectRatio;

        // Ensure canvas fits within viewport height
        const maxHeight = (window.innerHeight * DPR * 0.75); // Reserve 25% for controls
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * targetAspectRatio;
        }

        if (newHeight > canvasHeight && canvasHeight > 0) {
            newHeight = canvasHeight;
            newWidth = newHeight * targetAspectRatio;
        }
        if (newWidth > canvasWidth && canvasWidth > 0) {
            newWidth = canvasWidth;
            newHeight = newWidth / targetAspectRatio;
        }

        canvas.width = Math.max(1, Math.floor(newWidth));
        canvas.height = Math.max(1, Math.floor(newHeight));
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        ctx.scale(DPR, DPR);
        ctx.imageSmoothingEnabled = false;

        initializeWindLines();
        initializeBones();
    });
}

function setupMobileControlsVisibility() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // On mobile, hide desktop controls and show the mobile ones.
        if (controls) controls.style.display = 'none';
        if (mobileControls) mobileControls.style.display = 'flex';
        if (instructionsContainer) instructionsContainer.style.display = 'block';

    } else {
        // On desktop, hide mobile controls and show the desktop ones.
        if (mobileControls) mobileControls.style.display = 'none';
        if (instructionsContainer) instructionsContainer.style.display = 'none';
        if (controls) controls.style.display = 'flex';
    }
}

function setupGlobalTouchListeners() {
    document.addEventListener("touchmove", e => {
        if (gameStarted && !gameOver && !isHighScoreEntryActive) {
            const target = e.target;
            const isPlayableElement = target.closest("#playable-area") ||
                                     target === mobileThrowBtn ||
                                     target === joystickContainer ||
                                     target.closest("#joystick-container");
            if (isPlayableElement) {
                e.preventDefault();
            }
            // Allow scrolling for non-playable areas
        }
    }, { passive: false });
}

// --- Event Listeners Setup ---
function setupCoreEventListeners() {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    function setupButtonListener(btn, handler, btnId) {
        if (btn) {
            btn.onclick = null;
            btn.ontouchstart = null;
            btn.onmousedown = null;
            btn.onpointerdown = null;
            btn.addEventListener("click", e => handler(e));
            btn.addEventListener("touchstart", e => {
                e.preventDefault();
                handler(e);
            }, { passive: false });
        } else {
            console.error(`Button not found for listener: ${btnId}`);
        }
    }

    setupButtonListener(startBtn, handleStart, "start-btn");
    setupButtonListener(restartBtn, e => {
        currentLevel = 1;
        hasSubmittedScore = false;
        handleStart(e);
    }, "restart-btn");
    // Make the "Start Over" button use the same simple and reliable logic as "Play Again".
    setupButtonListener(startOverBtn, handlePlayAgain, "start-over-btn");
    setupButtonListener(nextLevelBtn, handleNextLevel, "next-level-btn");
    setupButtonListener(playAgainBtn, handlePlayAgain, "play-again-btn");
    setupButtonListener(highScoreSubmitBtn, handleHighScoreSubmit, "high-score-submit-btn");
    setupButtonListener(highScoreCancelBtn, handleHighScoreCancel, "high-score-cancel-btn");

    if (highScoreInput) {
        highScoreInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleHighScoreSubmit();
            }
        });
    }

    if (prayerAuthorityBtn) {
        prayerAuthorityBtn.href = "https://www.PrayerAuthority.com";
        prayerAuthorityBtn.textContent = "PRAY";
    }

    if (fightMoreGiantsBtn) {
        fightMoreGiantsBtn.href = "https://prayerauthority.com/prayers/games/davidvsgoliath/level2/index.html";
        fightMoreGiantsBtn.textContent = "SEQUEL";
    }

    setupJoystickListeners();
    setupButtonControls();
}

function handleKeyDown(e) {
    if (!gameStarted || gameOver || isTransitioning || isHighScoreEntryActive) return;
    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keys.left = true;
    else if (key === "arrowright" || key === "d") keys.right = true;
    else if (key === "arrowup" || key === "w") {
        keys.up = true;
        e.preventDefault();
    }
    else if (key === "arrowdown" || key === "s") {
        keys.down = true;
        e.preventDefault();
    }
    else if (key === " ") {
        handleThrowInput();
        e.preventDefault();
    }
    updateDpadGlow(); // Update glow on keydown
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keys.left = false;
    else if (key === "arrowright" || key === "d") keys.right = false;
    else if (key === "arrowup" || key === "w") keys.up = false;
    else if (key === "arrowdown" || key === "s") keys.down = false;
    updateDpadGlow(); // Update glow on keyup
}

function setupJoystickListeners() {
    if (!joystickContainer || !joystick) {
        console.error("Joystick elements missing. Cannot initialize joystick listeners.");
        return;
    }

    let isDragging = false;
    let containerRect; // To store container dimensions and position
    let centerX, centerY, maxDistance; // Relative to the container
    let activeTouchId = null;

    // This function calculates dimensions and resets the knob to the center.
    // It should be called on initial setup and on window resize.
    function resetJoystickVisuals() {
        if (!joystickContainer || !joystick) {
            console.error("resetJoystickVisuals: joystickContainer or joystick not found.");
            return;
        }

        containerRect = joystickContainer.getBoundingClientRect();
        if (!containerRect || containerRect.width === 0 || containerRect.height === 0) {
            // console.warn("resetJoystickVisuals: joystickContainer has no dimensions. Retrying shortly.");
            // setTimeout(resetJoystickVisuals, 100); // Optional: retry if not immediately available
            return;
        }

        centerX = containerRect.width / 2;
        centerY = containerRect.height / 2;
        // Use a consistent maxDistance calculation, e.g., based on the smaller dimension or width
        maxDistance = Math.min(centerX, centerY) / 2; // Knob can move half the radius of the inner circle
                                                     // Or a fixed fraction of width: containerRect.width / 4;

        // Reset knob position to center via transform.
        // Assumes joystick's initial CSS might be `position: absolute; left: 50%; top: 50%;`
        // and `transform: translate(-50%, -50%);` to truly center it.
        // We are just resetting the transform part that handles the drag offset.
        joystick.style.transform = `translate(-50%, -50%)`;
    }

    // Call it once to set initial state.
    // It's important that joystickContainer is visible and has dimensions here.
    // If it's initially hidden, getBoundingClientRect might return zeros.
    // Consider calling this after joystickContainer is made visible if that's an issue.
    resetJoystickVisuals();
    window.addEventListener('resize', resetJoystickVisuals); // Re-calculate on resize

    function getEventCoordinates(e) {
        if (!containerRect || containerRect.width === 0) { // Ensure containerRect is valid
            // console.warn("getEventCoordinates: containerRect not valid. Attempting to refresh.");
            resetJoystickVisuals(); // Try to refresh it
            if (!containerRect || containerRect.width === 0) {
                // console.error("getEventCoordinates: Failed to get valid containerRect.");
                return null;
            }
        }

        let clientX, clientY;
        if (e.type.startsWith('touch')) {
            const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouchId);
            // If the specific active touch isn't in changedTouches (e.g., for touchmove it might be in e.touches)
            // A more robust way for touchmove:
            // const touch = Array.from(e.touches).find(t => t.identifier === activeTouchId);
            if (!touch && e.touches && e.touches.length > 0 && activeTouchId !== null) {
                 // Fallback for touchmove if changedTouches doesn't have the active one
                const activeEventTouch = Array.from(e.touches).find(t => t.identifier === activeTouchId);
                if (activeEventTouch) {
                    clientX = activeEventTouch.clientX;
                    clientY = activeEventTouch.clientY;
                } else { return null; }
            } else if (touch) {
                clientX = touch.clientX;
                clientY = touch.clientY;
            }
            else {
                return null;
            }
        } else { // Mouse event
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - containerRect.left,
            y: clientY - containerRect.top
        };
    }

    function handleJoystickStart(e) {
        // Prevent default only if the event target is the joystick or its container
        if (e.target === joystick || e.target === joystickContainer) {
            if (e.cancelable) e.preventDefault();
        } else if (isDragging) { // If already dragging, allow event to propagate if not on joystick
            return;
        }


        if (isDragging || isHighScoreEntryActive) { // Used global isHighScoreEntryActive
            return;
        }

        isDragging = true;
        resetJoystickVisuals(); // CRITICAL: Refresh containerRect here before any coordinate calculations

        if (e.type === 'touchstart') {
            // Use the first touch that starts on the container
             for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.target === joystick || t.target === joystickContainer) {
                    activeTouchId = t.identifier;
                    break;
                }
            }
            if (activeTouchId === null && e.changedTouches.length > 0) { // Fallback if target check fails but touch is on container
                 activeTouchId = e.changedTouches[0].identifier;
            }
        }
        // Initial move on start to register direction immediately if held
        const coords = getEventCoordinates(e);
        if (coords) { // Process initial move if coords are available
            handleJoystickMove(e); // Call handleJoystickMove with the start event
        }
    }

    function handleJoystickMove(e) {
        if (!isDragging || isHighScoreEntryActive) {
            return;
        }

        if (e.cancelable) e.preventDefault(); // Prevent scrolling

        const coords = getEventCoordinates(e);
        if (!coords) return;

        let deltaX = coords.x - centerX;
        let deltaY = coords.y - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = maxDistance * Math.cos(angle);
            deltaY = maxDistance * Math.sin(angle);
        } else if (distance < 0.1) { // Snap to center if very close
            deltaX = 0;
            deltaY = 0;
        }

        joystick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

        // Use a small portion of maxDistance as threshold to activate direction
        const threshold = maxDistance * 0.15; // 15% of movement range to activate
        keys.left = deltaX < -threshold;
        keys.right = deltaX > threshold;
        keys.up = deltaY < -threshold;
        keys.down = deltaY > threshold;

        updateDpadGlow();
    }

     function handleJoystickEnd(e) {
        // If not currently dragging with an active touch ID,
        // this touchend/mouseup is not relevant to an active joystick drag,
        // unless it's a mouseup that's ending a current drag.
        if (!isDragging || (e.type.startsWith('touch') && activeTouchId === null)) {
            // If it's a mouseup, but we weren't dragging, also ignore.
            if (e.type === 'mouseup' && !isDragging) {
                return;
            }
            // If it's a touch event, and there's no activeTouchId or not dragging, ignore.
            if (e.type.startsWith('touch') && (activeTouchId === null || !isDragging)) {
                return;
            }
        }

        let joystickFingerLifted = false;

        if (e.type.startsWith('touch') && activeTouchId !== null) {
            // Check if the active joystick touch is among the changed touches (lifted fingers)
            if (e.changedTouches && e.changedTouches.length > 0) {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === activeTouchId) {
                        joystickFingerLifted = true;
                        break;
                    }
                }
            }
        } else if (e.type === 'mouseup' && isDragging) {
            // For mouse events, any mouseup while dragging ends the joystick drag.
            joystickFingerLifted = true;
        }

        if (joystickFingerLifted) {
            // The specific finger on the joystick was lifted, or it was a mouseup ending the drag.
            
            // Prevent default if the event target is relevant or if a drag was active.
            if (e.target === joystick || e.target === joystickContainer || isDragging) {
                if (e.cancelable) e.preventDefault();
            }

            isDragging = false;
            activeTouchId = null; 
            
            resetJoystickVisuals(); 

            keys.left = false;
            keys.right = false;
            keys.up = false;
            keys.down = false;
            updateDpadGlow();

        } else if (e.type.startsWith('touch')) {
            // A different touch ended (e.g., from the throw button), 
            // but the joystick finger (activeTouchId) is still presumed to be active.
            // We don't reset joystick state.
            // Only prevent default if this *other* touch happened on the joystick elements themselves.
            if (e.target === joystick || e.target === joystickContainer) {
                if (e.cancelable) e.preventDefault();
            }
        }
        // If it's a mouseup but joystickFingerLifted is false (which shouldn't happen if isDragging was true),
        // or any other unhandled case, we do nothing to the joystick state.
    }

    // Attach Listeners
    joystickContainer.addEventListener('mousedown', handleJoystickStart);
    joystickContainer.addEventListener('touchstart', handleJoystickStart, { passive: false });

    document.addEventListener('mousemove', handleJoystickMove);
    document.addEventListener('touchmove', handleJoystickMove, { passive: false });

    document.addEventListener('mouseup', handleJoystickEnd);
    document.addEventListener('touchend', handleJoystickEnd, { passive: false }); // passive: false if we call preventDefault
    document.addEventListener('touchcancel', handleJoystickEnd, { passive: false });

    // REMOVED the erroneous call to initializeJoystick();
    // resetJoystickVisuals(); was already called at the beginning of this function.
}

function setupButtonControls() {
    function setupControlButton(btn, key, value) {
        if (btn) {
            btn.classList.add("arrow-btn");
            btn.addEventListener("mousedown", () => {
                if (gameStarted && !gameOver && !isTransitioning) keys[key] = value;
                updateDpadGlow();
            });
            btn.addEventListener("mouseup", () => {
                keys[key] = false;
                updateDpadGlow();
            });
            btn.addEventListener("touchstart", e => {
                e.preventDefault();
                if (gameStarted && !gameOver && !isTransitioning) keys[key] = value;
                updateDpadGlow();
            }, { passive: false });
            btn.addEventListener("touchend", e => {
                e.preventDefault();
                keys[key] = false;
                updateDpadGlow();
            }, { passive: false });
        }
    }

    setupControlButton(leftBtn, "left", true);
    setupControlButton(rightBtn, "right", true);
    setupControlButton(upBtn, "up", true);
    setupControlButton(downBtn, "down", true);

    if (throwBtn) {
        throwBtn.addEventListener("click", handleThrowInput);
        throwBtn.addEventListener("touchstart", e => {
            e.preventDefault();
            handleThrowInput();
        }, { passive: false });
    }

    if (mobileThrowBtn) {
        mobileThrowBtn.addEventListener("click", handleThrowInput);
        mobileThrowBtn.addEventListener("touchstart", e => {
            e.preventDefault();
            handleThrowInput();
        }, { passive: false });
    }
}

// --- Game Logic ---
function numberToWord(num) {
    const words = [
        "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
        "Eighteen", "Nineteen", "Twenty"
    ];
    return num >= 0 && num <= 20 ? words[num] : num.toString();
}

function handleStart(e) {
    e.preventDefault();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ("ontouchstart" in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 600;
    if (!isMobile && controlInstructions) {
        controlInstructions.classList.add("hidden");
    }
    hideAllOverlays();
    gameStarted = true;
    gameOver = false;
    isTransitioning = false;
    gameWon = false;
    completedLevel = 0;
    hasSubmittedScore = false;
    canvas.style.display = "block"; // Added to restore canvas visibility
    resetGameState();
    startLevel(currentLevel);
    canvas.style.opacity = "1";

    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.loop = true;
        backgroundMusic.play().catch(err => console.warn("Background music play failed:", err));
    }
}

function handleNextLevel(e) {
    e.preventDefault();
    if (currentLevel >= maxLevels) {
        console.warn("Maximum level reached, cannot proceed to next level");
        showWeddingScreen();
        return;
    }
    hideAllOverlays();
    currentLevel++;
    gameOver = false;
    isTransitioning = false;
    resetGameState();
    startLevel(currentLevel);
    canvas.style.display = "block"; // Restore canvas visibility
    canvas.style.opacity = "1"; // Ensure full visibility
    resizeCanvas(); // Ensure canvas dimensions are valid
    console.log(`Transitioning to level ${currentLevel}`);

    if (throwBtn) throwBtn.disabled = false;
    if (mobileThrowBtn) mobileThrowBtn.disabled = false;

    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.loop = true;
        backgroundMusic.play().catch(err => console.warn("Background music play failed:", err));
    }
}

function handlePlayAgain(e) {
    e.preventDefault();
    hideAllOverlays();
    currentLevel = 1;
    hasSubmittedScore = false;
    completedLevel = 0;
    gameStarted = true;
    gameOver = false;
    isTransitioning = false;
    gameWon = false;
    
    // Add this line to make the canvas visible again
    canvas.style.display = "block"; 

    resetGameState();
    startLevel(currentLevel);
    canvas.style.opacity = "1";

    if (throwBtn) throwBtn.disabled = false;
    if (mobileThrowBtn) mobileThrowBtn.disabled = false;

    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.loop = true;
        backgroundMusic.play().catch(err => console.warn("Background music play failed:", err));
    }
}

function resetGameState() {
    stones = [];
    spears = [];
    powerUps = [];
    particles = [];
    spearSmoke = [];
    dodgeWindLines = [];
    lastPowerUpSpawn = 0;
    nextPowerUpInterval = 0;
    shakeTime = 0;
    shakeIntensity = 0;
    davidThrowing = false;
    powerUpGlow = 0;
    glowTimer = 0;
    powerUpGlowTimer = 0;
    goliathBlinkTimer = 0;
    goliathSpearPauseTimer = 0;
    enrageShakeTimer = 0;
    isGoliathDefeated = false;
    isFinalHit = false;
    finalHitDelayTimer = 0;
    spearAuraIntensity = 0;
    stoneGlowIntensity = 0;

    // Only reset power-up state if game is fully over or won, not during level transitions
    if (gameOver || gameWon) {
        speedPowerUpActive = false;
        speedPowerUpDuration = 0;
        tripleDamagePowerUpActive = false;
        tripleDamageHits = 0;
    }

    if (throwBtn) throwBtn.disabled = false;
    if (mobileThrowBtn) mobileThrowBtn.disabled = false;

    console.log("Game state reset: gameOver =", gameOver, "isTransitioning =", isTransitioning, "isFinalHit =", isFinalHit, "isGoliathDefeated =", isGoliathDefeated, "speedPowerUpActive =", speedPowerUpActive, "tripleDamagePowerUpActive =", tripleDamagePowerUpActive);
}

function startLevel(level) {
    const config = levelConfigs[level];
    if (!config) {
        console.error(`Level configuration missing for level ${level}`);
        gameOver = true;
        return;
    }

    david = {
        x: (canvas.width / 4) / DPR,
        y: ((canvas.height * 3) / 4) / DPR,
        width: (DAVID_BASE_WIDTH * (canvas.width / 600)) / DPR,
        height: (DAVID_BASE_HEIGHT * (canvas.height / 720)) / DPR,
        speed: speedPowerUpActive ? 3.75 * 1.5 : 3.75,
        baseSpeed: 3.75,
        health: config.davidHealth,
        maxHealth: config.davidHealth,
        throwCooldown: 0,
        throwCooldownMax: 2500,
        baseThrowCooldownMax: 2500,
        speedPowerUpActive: speedPowerUpActive,
        tripleDamagePowerUpActive: tripleDamagePowerUpActive,
        speedPowerUpDuration: speedPowerUpDuration,
        tripleDamageHits: tripleDamageHits
    };

    goliath = {
        x: ((canvas.width * 3) / 4) / DPR,
        y: (canvas.height / 4) / DPR,
        width: (GOLIATH_BASE_WIDTH * GOLIATH_SCALE_FACTOR * (canvas.width / 600)) / DPR,
        height: (GOLIATH_BASE_HEIGHT * GOLIATH_SCALE_FACTOR * (canvas.height / 720)) / DPR,
        speed: (level === 1 ? config.goliathSpeed * 0.5 : config.goliathSpeed) * 1.2,
        baseSpeed: config.goliathSpeed * 1.2,
        health: config.goliathHealth,
        maxHealth: config.goliathHealth,
        spearTimer: 0,
        spearInterval: config.spearInterval,
        baseSpearInterval: config.spearInterval,
        dodgeChance: config.dodgeChance,
        targetX: 0,
        targetY: 0,
        isEnraged: false,
        lastTargetChange: 0,
        targetChangeInterval: 2000,
        visitedQuadrants: new Array(4).fill(0)
    };

    console.log(`Level ${level} started: Goliath health = ${goliath.health}, maxHealth = ${goliath.maxHealth}, speedPowerUpActive = ${speedPowerUpActive}, speedPowerUpDuration = ${speedPowerUpDuration}, tripleDamagePowerUpActive = ${tripleDamagePowerUpActive}, tripleDamageHits = ${tripleDamageHits}, david.tripleDamageHits = ${david.tripleDamageHits}`);

    if (david.y < (canvas.height / 2) / DPR) {
        david.y = (canvas.height / 2) / DPR;
    }

    if (goliath.y + goliath.height > (canvas.height / 2) / DPR) {
        goliath.y = (canvas.height / 2) / DPR - goliath.height;
    }

    updateGoliathTarget();

    if (throwBtn) throwBtn.disabled = false; // Desktop throw button
    if (mobileThrowBtn) mobileThrowBtn.disabled = false; // Ensure mobile throw button is enabled

    updateScoreDisplay();

    // Show desktop instructions only on Level 1
    if (desktopInstructionsBox) {
        if (level === 1) {
            desktopInstructionsBox.classList.remove("hidden");
        } else {
            desktopInstructionsBox.classList.add("hidden");
        }
    }
}

function handleThrowInput() {
    if (!gameStarted || gameOver || isTransitioning || davidThrowing || isHighScoreEntryActive) return;
    if (david.throwCooldown > 0) return;

    // Reset animation to the beginning every time we throw
    animationFrame = 0;
    frameTimer = 0;
    
    davidThrowing = true;
    david.throwCooldown = david.throwCooldownMax;

    let stoneSpeed = 10;
    let damage = 1;
    let isTripleDamage = false;
    let hasDualPowerUps = false;

    // Validate power-up states
    if (david.tripleDamagePowerUpActive && david.tripleDamageHits > 0) {
        damage = 3;
        isTripleDamage = true;
        console.log(`Preparing triple damage stone: damage = ${damage}, tripleDamageHits = ${david.tripleDamageHits}, david.tripleDamagePowerUpActive = ${david.tripleDamagePowerUpActive}, timestamp = ${Date.now()}`);
    } else if (david.tripleDamagePowerUpActive && david.tripleDamageHits <= 0) {
        console.warn(`Triple damage power-up active but no hits remaining: tripleDamageHits = ${david.tripleDamageHits}, timestamp = ${Date.now()}`);
    }

    if (david.speedPowerUpActive) {
        stoneSpeed *= 1.5;
        console.log(`Preparing speed power-up stone: speed = ${stoneSpeed}, speedPowerUpDuration = ${david.speedPowerUpDuration}, timestamp = ${Date.now()}`);
    }

    if (david.tripleDamagePowerUpActive && david.speedPowerUpActive && david.tripleDamageHits > 0) {
        hasDualPowerUps = true;
        console.log(`Dual power-ups active: stone will have green glow, tripleDamageHits = ${david.tripleDamageHits}, speedPowerUpDuration = ${david.speedPowerUpDuration}, timestamp = ${Date.now()}`);
    } else if (david.tripleDamagePowerUpActive && david.speedPowerUpActive && david.tripleDamageHits <= 0) {
        console.warn(`Dual power-ups attempted but no triple damage hits: tripleDamageHits = ${david.tripleDamageHits}, speedPowerUpDuration = ${david.speedPowerUpDuration}, timestamp = ${Date.now()}`);
    }

    const stone = {
        x: david.x + (david.width / 2),
        y: david.y,
        radius: (15 * (canvas.width / 600)) / (2 * DPR),
        speed: stoneSpeed,
        damage: damage,
        velocityX: 0,
        velocityY: -stoneSpeed,
        isTripleDamage: isTripleDamage,
        hasDualPowerUps: hasDualPowerUps,
        frameCount: 0,
        dodgeAttempted: false
    };

    stones.push(stone);

    // Decrement tripleDamageHits after creating the stone
    if (isTripleDamage) {
        tripleDamageHits--;
        david.tripleDamageHits = tripleDamageHits;
        if (tripleDamageHits <= 0) {
            tripleDamagePowerUpActive = false;
            david.tripleDamagePowerUpActive = false;
            tripleDamageHits = 0;
            david.tripleDamageHits = 0;
            console.log(`Triple damage power-up depleted: tripleDamageHits = ${tripleDamageHits}, timestamp = ${Date.now()}`);
        }
    }

    console.log(`Stone created: x = ${stone.x}, y = ${stone.y}, isTripleDamage = ${stone.isTripleDamage}, hasDualPowerUps = ${stone.hasDualPowerUps}, damage = ${stone.damage}, speed = ${stone.speed}, tripleDamagePowerUpActive = ${david.tripleDamagePowerUpActive}, tripleDamageHits = ${david.tripleDamageHits}, timestamp = ${Date.now()}`);

    if (throwStoneSound) {
        throwStoneSound.currentTime = 0;
        throwStoneSound.play().catch(err => console.warn("Throw stone sound play failed:", err));
    }

    if (throwBtn) throwBtn.disabled = true;
    if (mobileThrowBtn) mobileThrowBtn.disabled = true; // <<< ADD THIS LINE

    shakeTime = 200;
    shakeIntensity = 5;
}

function updateGoliathTarget() {
    const boundaryMargin = 20;
    const maxX = (canvas.width / DPR) - goliath.width - boundaryMargin;
    const minX = boundaryMargin;
    const maxY = (canvas.height / 2) / DPR - goliath.height - boundaryMargin;
    const minY = boundaryMargin;

    const quadrantWidth = (maxX - minX) / 2;
    const quadrantHeight = (maxY - minY) / 2;
    const quadrants = [
        { xMin: minX, xMax: minX + quadrantWidth, yMin: minY, yMax: minY + quadrantHeight },
        { xMin: minX + quadrantWidth, xMax: maxX, yMin: minY, yMax: minY + quadrantHeight },
        { xMin: minX, xMax: minX + quadrantWidth, yMin: minY + quadrantHeight, yMax: maxY },
        { xMin: minX + quadrantWidth, xMax: maxX, yMin: minY + quadrantHeight, yMax: maxY }
    ];

    let leastVisited = 0;
    let minVisits = goliath.visitedQuadrants[0];
    for (let i = 1; i < 4; i++) {
        if (goliath.visitedQuadrants[i] < minVisits) {
            minVisits = goliath.visitedQuadrants[i];
            leastVisited = i;
        }
    }

    let newTargetX, newTargetY;
    const strategy = Math.random();

    if (strategy < 0.4) {
        newTargetX = david.x + (david.width / 2) - (goliath.width / 2);
        newTargetY = Math.random() * (maxY - minY) + minY;
    } else if (strategy < 0.7) {
        const targetQuadrant = quadrants[leastVisited];
        newTargetX = Math.random() * (targetQuadrant.xMax - targetQuadrant.xMin) + targetQuadrant.xMin;
        newTargetY = Math.random() * (targetQuadrant.yMax - targetQuadrant.yMin) + targetQuadrant.yMin;
    } else {
        newTargetX = Math.random() * (maxX - minX) + minX;
        newTargetY = minY + Math.random() * (maxY - minY) * 0.3;
    }

    newTargetX = Math.max(minX, Math.min(maxX, newTargetX));
    newTargetY = Math.max(minY, Math.min(maxY, newTargetY));

    const dx = newTargetX - goliath.x;
    const dy = newTargetY - goliath.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = 100;

    if (distance < minDistance) {
        const angle = Math.atan2(dy, dx);
        newTargetX = goliath.x + Math.cos(angle) * minDistance;
        newTargetY = goliath.y + Math.sin(angle) * minDistance;
        newTargetX = Math.max(minX, Math.min(maxX, newTargetX));
        newTargetY = Math.max(minY, Math.min(maxY, newTargetY));
    }

    goliath.targetX = newTargetX;
    goliath.targetY = newTargetY;
    goliath.lastTargetChange = Date.now();

    for (let i = 0; i < quadrants.length; i++) {
        const q = quadrants[i];
        if (newTargetX >= q.xMin && newTargetX <= q.xMax && newTargetY >= q.yMin && newTargetY <= q.yMax) {
            goliath.visitedQuadrants[i]++;
            break;
        }
    }
}

function update() {
    console.log("Update start: gameStarted =", gameStarted, "gameOver =", gameOver, "isTransitioning =", isTransitioning, "isGoliathDefeated =", isGoliathDefeated);
    if (!gameStarted || gameOver || isTransitioning) return;

    powerUpGlowTimer += 16; // Increment power-up glow timer for power-up glow animation

        if (david.throwCooldown > 0) {
        david.throwCooldown -= 16;
        if (david.throwCooldown <= 0) {
            david.throwCooldown = 0;
            if (throwBtn) throwBtn.disabled = false;
            if (mobileThrowBtn) mobileThrowBtn.disabled = false;
        }
    }

        // NEW: Logic to advance the animation frame
    if (davidThrowing) {
        frameTimer += 16; // Add milliseconds passed
        if (frameTimer >= FRAME_DURATION) {
            frameTimer = 0;
            // Check if we are on the last frame BEFORE incrementing
            if (animationFrame < TOTAL_FRAMES - 1) {
                animationFrame++;
            } else {
                // If we are on the last frame, the animation is over.
                davidThrowing = false;
            }
        }
    }

    if (speedPowerUpActive) {
    speedPowerUpDuration -= 16;
    if (speedPowerUpDuration <= 0) {
        speedPowerUpActive = false;
        speedPowerUpDuration = 0;
        david.speed = david.baseSpeed;
        console.log("Speed power-up expired: speed reset to", david.speed);
    }
}

    if (keys.left && david.x > 0) david.x -= david.speed;
if (keys.right && david.x < (canvas.width / DPR) - david.width) david.x += david.speed;
if (keys.up && david.y > (canvas.height / 2) / DPR) david.y -= david.speed;
if (keys.down && david.y < (canvas.height / DPR) - david.height) david.y += david.speed;
    updateDpadGlow();

    // Track if a stone was thrown this frame
    let stoneThrown = davidThrowing;

    if (!isGoliathDefeated) {
        // Update Goliath's target less frequently
        if (Date.now() - goliath.lastTargetChange > goliath.targetChangeInterval) {
            updateGoliathTarget();
            goliath.targetChangeInterval = 1500 + Math.random() * 1000; // Increased to 1.5–2.5 seconds
        }

        if (goliathSpearPauseTimer > 0) {
            goliathSpearPauseTimer -= 16;
            if (goliathSpearPauseTimer <= 0) {
                goliathSpearPauseTimer = 0;
            }
        }

        // Smooth movement with interpolation
        const dx = goliath.targetX - goliath.x;
        const dy = goliath.targetY - goliath.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const threshold = 2;

        if (distance > threshold && (goliathSpearPauseTimer <= 0 || stoneThrown)) {
            const moveSpeed = goliath.speed * 0.05; // Damping factor for smoother movement
            goliath.x += dx * moveSpeed;
            goliath.y += dy * moveSpeed;

            const boundaryMargin = 20;
            const maxX = (canvas.width / DPR) - goliath.width - boundaryMargin;
            const minX = boundaryMargin;
            const maxY = (canvas.height / 2) / DPR - goliath.height - boundaryMargin;
            const minY = boundaryMargin;

            goliath.x = Math.max(minX, Math.min(maxX, goliath.x));
            goliath.y = Math.max(minY, Math.min(maxY, goliath.y));
        }
    }

    goliath.spearTimer += 16;
    if (goliath.spearTimer >= goliath.spearInterval && goliathSpearPauseTimer <= 0) {
        goliath.spearTimer = 0;
        goliathSpearPauseTimer = SPEAR_PAUSE_DURATION;
        const baseSpeed = 7;
        const speedMultipliers = [0.8, 1.0, 1.2];
        const speedMultiplier = speedMultipliers[Math.floor(Math.random() * speedMultipliers.length)];
        const spear = {
            x: goliath.x + (goliath.width / 2),
            y: goliath.y + goliath.height,
            width: (12 * (canvas.width / 600)) / DPR,
            height: (50 * (canvas.height / 720)) / DPR,
            speed: baseSpeed * speedMultiplier,
            targetX: david.x + (david.width / 2),
            targetY: david.y + (david.height / 2),
            velocityX: 0,
            velocityY: 0,
            trackingFactor: 0.05,
            spawnTime: Date.now()
        };

        const dxSpear = spear.targetX - spear.x;
        const dySpear = spear.targetY - spear.y;
        const distanceSpear = Math.sqrt(dxSpear * dxSpear + dySpear * dySpear);

        const angle = Math.atan2(dySpear, dxSpear);
        const deviation = (Math.random() * Math.PI / 6) - (Math.PI / 12);
        const adjustedAngle = angle + deviation;

        spear.velocityX = Math.cos(adjustedAngle) * spear.speed;
        spear.velocityY = Math.sin(adjustedAngle) * spear.speed;

        spears.push(spear);
        console.log(`Spear created: speed = ${spear.speed} (multiplier = ${speedMultiplier})`);
    }

    spears.forEach((spear, index) => {
        const dxSpear = (david.x + (david.width / 2)) - spear.x;
        const dySpear = (david.y + (david.height / 2)) - spear.y;
        const distanceSpear = Math.sqrt(dxSpear * dxSpear + dySpear * dySpear);

        if (distanceSpear > 0) {
            const desiredVelocityX = (dxSpear / distanceSpear) * spear.speed;
            const desiredVelocityY = (dySpear / distanceSpear) * spear.speed;

            spear.velocityX += (desiredVelocityX - spear.velocityX) * spear.trackingFactor;
            spear.velocityY += (desiredVelocityY - spear.velocityY) * spear.trackingFactor;

            const currentSpeed = Math.sqrt(spear.velocityX * spear.velocityX + spear.velocityY * spear.velocityY);
            if (currentSpeed > 0) {
                spear.velocityX = (spear.velocityX / currentSpeed) * spear.speed;
                spear.velocityY = (spear.velocityY / currentSpeed) * spear.speed;
            }
        }

        spear.x += spear.velocityX;
        spear.y += spear.velocityY;

        // Generate smoke particles
        const smokeChance = 0.8;
        if (Math.random() < smokeChance) {
            const smoke = {
                x: spear.x + (spear.width / 2) - spear.velocityX * 0.5,
                y: spear.y + (spear.height / 2) - spear.velocityY * 0.5,
                radius: (Math.random() * 7 + 5) * (canvas.width / 600) / DPR,
                color: Math.random() < 0.5 ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 0, 0, 0.8)",
                velocityX: -spear.velocityX * 0.3 + (Math.random() - 0.5) * 2,
                velocityY: -spear.velocityY * 0.3 + (Math.random() - 0.5) * 2,
                life: 600,
                maxLife: 600
            };
            spearSmoke.push(smoke);
            console.log("Smoke particle added: x =", smoke.x, "y =", smoke.y, "color =", smoke.color);
        }

        // Check if spear has been active for more than 10 seconds
        const currentTime = Date.now();
        if (currentTime - spear.spawnTime > 10000) {
            // Create explosion effect
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: spear.x + (spear.width / 2),
                    y: spear.y + (spear.height / 2),
                    radius: Math.random() * 2 + 1,
                    color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`, // Blue shades
                    velocityX: (Math.random() - 0.5) * 3,
                    velocityY: (Math.random() - 0.5) * 3,
                    life: 500
                });
            }
            spears.splice(index, 1);
            console.log("Spear expired after 10 seconds: x =", spear.x, "y =", spear.y);
            return;
        }

        if (spear.y > (canvas.height / DPR) || spear.x < 0 || spear.x > (canvas.width / DPR)) {
            spears.splice(index, 1);
            return;
        }

        if (checkCollision(spear, david, true)) {
            david.health--;
            shakeTime = 200;
            shakeIntensity = 5;
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: spear.x + (spear.width / 2),
                    y: spear.y + (spear.height / 2),
                    radius: Math.random() * 2 + 1,
                    color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
                    velocityX: (Math.random() - 0.5) * 3,
                    velocityY: (Math.random() - 0.5) * 3,
                    life: 500
                });
            }
            if (hitDavidSound) {
                hitDavidSound.currentTime = 0;
                hitDavidSound.play().catch(err => console.warn("Hit David sound play failed:", err));
            }
            spears.splice(index, 1);
        }
    });

    stones.forEach((stone, index) => {
        if (!stone.hasOwnProperty("frameCount")) {
            stone.frameCount = 0;
        }
        stone.frameCount++;

        // Calculate distance to Goliath for dodge triggering
        const goliathCenterX = goliath.x + goliath.width / 2;
        const goliathCenterY = goliath.y + goliath.height / 2;
        const distanceToGoliath = Math.sqrt((stone.x - goliathCenterX) ** 2 + (stone.y - goliathCenterY) ** 2);
        const dodgeProximity = 150; // Distance at which Goliath attempts to dodge (pixels)

        // Flag to track if Goliath is attempting to dodge this stone
        if (distanceToGoliath < dodgeProximity && !stone.dodgeAttempted && !isGoliathDefeated) {
            stone.dodgeAttempted = true;

            // Calculate direction to move away from the stone
            const dx = goliathCenterX - stone.x;
            const dy = goliathCenterY - stone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const dodgeDistance = 150 * (1 + goliath.dodgeChance); // Further dodge

            // Normalize direction and move Goliath away from the stone
            const moveX = distance > 0 ? (dx / distance) * dodgeDistance : 0;
            const moveY = distance > 0 ? (dy / distance) * dodgeDistance : 0;

            // Update Goliath's target position
            const boundaryMargin = 20;
            const maxX = (canvas.width / DPR) - goliath.width - boundaryMargin;
            const minX = boundaryMargin;
            const maxY = (canvas.height / 2) / DPR - goliath.height - boundaryMargin;
            const minY = boundaryMargin;

            goliath.targetX = Math.max(minX, Math.min(maxX, goliath.targetX + moveX));
            goliath.targetY = Math.max(minY, Math.min(maxY, goliath.targetY + moveY));

            // Speed up Goliath's movement during dodge
            goliath.speed = goliath.baseSpeed * (1 + goliath.dodgeChance * 3); // Faster dodge

            // Create a single dust cloud with multiple patches
            const dodgeAngle = Math.atan2(moveY, moveX);
            const cloudOffset = 20; // Start slightly behind Goliath
            const cloudCenterX = goliath.x + (goliath.width / 2) + Math.cos(dodgeAngle + Math.PI) * cloudOffset;
            const cloudCenterY = goliath.y + (goliath.height / 2) + Math.sin(dodgeAngle + Math.PI) * cloudOffset;
            const patchCount = 10; // Number of patches in the cloud
            const patches = [];
            for (let i = 0; i < patchCount; i++) {
                const offsetX = (Math.random() - 0.5) * 30; // Wide spread for cloud shape
                const offsetY = (Math.random() - 0.5) * 30;
                const size = 10 + Math.random() * 15; // Patch size 10–25 pixels
                const angleVariation = (Math.random() - 0.5) * Math.PI / 4;
                patches.push({
                    offsetX: offsetX,
                    offsetY: offsetY,
                    size: size,
                    controlOffset1X: (Math.random() - 0.5) * size * 1.5,
                    controlOffset1Y: (Math.random() - 0.5) * size * 1.5,
                    controlOffset2X: (Math.random() - 0.5) * size * 1.5,
                    controlOffset2Y: (Math.random() - 0.5) * size * 1.5,
                    opacity: 0.4 + Math.random() * 0.3 // 0.4–0.7 for translucency
                });
            }
            dodgeWindLines.push({
                centerX: cloudCenterX,
                centerY: cloudCenterY,
                patches: patches,
                progress: 0, // Expansion animation (0 to 1)
                maxProgressTime: 150, // Fast expansion
                life: 400, // Quick fade for dust
                maxLife: 400,
                rotation: (Math.random() - 0.5) * Math.PI / 8 // Slight rotation for dynamism
            });
            console.log("Goliath attempting to dodge: stone x =", stone.x, "y =", stone.y, "new targetX =", goliath.targetX, "targetY =", goliath.targetY, "dust cloud created at x =", cloudCenterX, "y =", cloudCenterY);
        }

        if (stone.hasHit) {
            // Continue moving the stone towards Goliath's center after a hit
            stone.x += stone.velocityX;
            stone.y += stone.velocityY;

            const distanceToCenter = Math.sqrt((stone.x - goliathCenterX) ** 2 + (stone.y - goliathCenterY) ** 2);

            // Remove the stone once it reaches Goliath's center or passes it
            if (distanceToCenter < stone.radius || stone.y <= goliathCenterY) {
                stones.splice(index, 1);
                console.log("Stone reached Goliath's center and removed: x =", stone.x, "y =", stone.y, "Goliath center: x =", goliathCenterX, "y =", goliathCenterY);
                // Reset Goliath's speed after dodge attempt
                goliath.speed = goliath.baseSpeed;
                return;
            }
        } else {
            const prevX = stone.x;
            const prevY = stone.y;

            stone.x += stone.velocityX;
            stone.y += stone.velocityY;

            const collisionStone = { x: stone.x, y: stone.y, radius: stone.radius };
            let collisionDetected = false;

            if (checkCollision(collisionStone, goliath)) {
                collisionDetected = true;
                console.log("Primary collision detected: stone x =", stone.x, "y =", stone.y);
            } else {
                const steps = Math.ceil(Math.sqrt((stone.x - prevX) ** 2 + (stone.y - prevY) ** 2) / stone.radius);
                for (let i = 1; i <= steps; i++) {
                    const t = i / steps;
                    const interpX = prevX + (stone.x - prevX) * t;
                    const interpY = prevY + (stone.y - prevY) * t;
                    const interpStone = { x: interpX, y: interpY, radius: stone.radius };
                    if (checkCollision(interpStone, goliath)) {
                        collisionDetected = true;
                        stone.x = interpX;
                        stone.y = interpY;
                        console.log("Interpolated collision detected: stone x =", stone.x, "y =", stone.y);
                        break;
                    }
                }
            }

            if (collisionDetected) {
                // Apply damage since the stone hit Goliath
                const previousHealth = goliath.health;
                if (previousHealth > 0) {
                    goliath.health -= stone.damage;
                    if (goliath.health < 0) {
                        goliath.health = 0;
                    }
                    console.log("Goliath hit: previousHealth =", previousHealth, "damage =", stone.damage, "newHealth =", goliath.health);

                    // Trigger the red explosion at the point of collision
                    for (let i = 0; i < 20; i++) {
                        particles.push({
                            x: stone.x, // Explosion at the stone's position at collision
                            y: stone.y,
                            radius: Math.random() * 3 + 1,
                            color: `hsl(${Math.random() * 30}, 100%, 50%)`, // Red shades for Goliath's hit
                            velocityX: (Math.random() - 0.5) * 5,
                            velocityY: (Math.random() - 0.5) * 5,
                            life: 1000
                        });
                    }
                    if (hitGoliathSound) {
                        hitGoliathSound.currentTime = 0;
                        hitGoliathSound.play().catch(err => console.warn("Hit Goliath sound play failed:", err));
                    }
                }

                stone.hasHit = true;
                goliathBlinkTimer = 500;
                shakeTime = 200;
                shakeIntensity = 5;
                // Reset Goliath's speed after a hit
                goliath.speed = goliath.baseSpeed;
                console.log("Stone marked as hit: x =", stone.x, "y =", stone.y);
                return;
            }

            if (stone.frameCount > 9600) {
                console.log("Stone timed out: x =", stone.x, "y =", stone.y);
                stones.splice(index, 1);
                // Reset Goliath's speed if the stone times out
                goliath.speed = goliath.baseSpeed;
                return;
            }
        }

        console.log("Stone position: x =", stone.x, "y =", stone.y, "Goliath hitbox: x =", goliath.x, "to", goliath.x + goliath.width, "y =", goliath.y, "to", goliath.y + goliath.height, "frameCount =", stone.frameCount);
    });

    console.log("Checking game-over: david.health =", david.health, "goliath.health =", goliath.health, "isFinalHit =", isFinalHit, "finalHitDelayTimer =", finalHitDelayTimer, "isGoliathDefeated =", isGoliathDefeated);
if (goliath.health <= 0 && !isGoliathDefeated) {
    console.log("Goliath defeated: health =", goliath.health, "maxHealth =", goliath.maxHealth, "isFinalHit =", isFinalHit, "finalHitDelayTimer =", finalHitDelayTimer);
    isGoliathDefeated = true;
    isFinalHit = true;
    finalHitDelayTimer = 1000;
}

if (isFinalHit && finalHitDelayTimer > 0) {
    finalHitDelayTimer -= 16;
    console.log("Final hit delay: finalHitDelayTimer =", finalHitDelayTimer);
    if (finalHitDelayTimer <= 0) {
        console.log("Game over triggered: Goliath defeated");
        gameOver = true;
        gameWon = true;
        completedLevel = currentLevel;
        isTransitioning = true;
        showWeddingScreen();
        return;
    }
}

if (!isGoliathDefeated && david.health <= 0 && !isTransitioning) {
    console.log("David defeated: health =", david.health);
    gameOver = true;
    gameWon = false;
    completedLevel = currentLevel;
    isTransitioning = true;
    // Show high score entry screen first
    hideAllOverlays();
    highScoreScreen.classList.remove("hidden");
    isHighScoreEntryActive = true;
    highScoreTitle.textContent = "Enter Your Name for the Wall of Champions";
    highScoreMessage.textContent = `Level ${completedLevel}, Goliath: ${Math.round(goliath.health)}`;
    highScoreInput.value = "";
    highScoreInput.focus();
    return;
}

    const currentTime = Date.now();
if (levelConfigs[currentLevel].powerUps && powerUps.length === 0 && currentTime - lastPowerUpSpawn > nextPowerUpInterval) {
    lastPowerUpSpawn = currentTime;
    nextPowerUpInterval = Math.random() * 5000 + 5000;
    const powerUp = {
        x: Math.random() * ((canvas.width / DPR) - 40),
        y: ((canvas.height / 2) / DPR) + Math.random() * (((canvas.height / 2) / DPR) - 40),
        width: (40 * (canvas.width / 600)) / DPR,
        height: (40 * (canvas.height / 720)) / DPR,
        type: ["speed", "tripleDamage"][Math.floor(Math.random() * 2)],
        lifetime: 5000,
        lastFrameCollided: false // Initialize collision buffer
    };
    powerUps.push(powerUp);
    console.log(`Power-up spawned: type = ${powerUp.type}, x = ${powerUp.x}, y = ${powerUp.y}, width = ${powerUp.width}, height = ${powerUp.height}, lifetime = ${powerUp.lifetime}`);
}

   powerUps.forEach((powerUp, index) => {
    powerUp.lifetime -= 16;
    if (powerUp.lifetime <= 0) {
        powerUps.splice(index, 1);
        console.log(`Power-up expired: type = ${powerUp.type}, x = ${powerUp.x}, y = ${powerUp.y}, lifetime = ${powerUp.lifetime}, timestamp = ${Date.now()}`);
        return;
    }
    const extendedPowerUp = {
        x: powerUp.x - powerUp.width * 0.75,
        y: powerUp.y - powerUp.height * 0.75,
        width: powerUp.width * 2.5,
        height: powerUp.height * 2.5
    };
    if (checkCollision(extendedPowerUp, david, true) && !powerUp.isCollected) {
        powerUp.isCollected = true; // Prevent duplicate collection
        if (powerUp.type === "speed") {
            speedPowerUpActive = true;
            david.speed = david.baseSpeed * 1.5;
            speedPowerUpDuration = Math.max(speedPowerUpDuration, 0) + SPEED_POWER_UP_DURATION;
            console.log(`Speed power-up collected: speed = ${david.speed}, duration = ${speedPowerUpDuration}, x = ${powerUp.x}, y = ${powerUp.y}, timestamp = ${Date.now()}`);
        } else if (powerUp.type === "tripleDamage") {
            tripleDamagePowerUpActive = true;
            tripleDamageHits = Math.max(tripleDamageHits, 0) + TRIPLE_DAMAGE_HITS;
            console.log("Triple damage power-up collected:", {
                tripleDamagePowerUpActive,
                tripleDamageHits,
                x: powerUp.x,
                y: powerUp.y,
                timestamp: Date.now()
            });
        }
        // Update David's power-up state before removing power-up
        david.speedPowerUpActive = speedPowerUpActive;
        david.tripleDamagePowerUpActive = tripleDamagePowerUpActive;
        david.speedPowerUpDuration = speedPowerUpDuration;
        david.tripleDamageHits = tripleDamageHits;
        console.log(`David state updated: speedPowerUpActive = ${david.speedPowerUpActive}, tripleDamagePowerUpActive = ${david.tripleDamagePowerUpActive}, tripleDamageHits = ${david.tripleDamageHits}, timestamp = ${Date.now()}`);
        powerUps.splice(index, 1);
    } else {
        powerUp.lastFrameCollided = false;
        const dx = (powerUp.x + powerUp.width / 2) - (david.x + david.width / 2);
        const dy = (powerUp.y + powerUp.height / 2) - (david.y + david.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
            console.log(`Power-up near-miss: type = ${powerUp.type}, distance = ${distance.toFixed(2)}, powerUp.x = ${powerUp.x}, powerUp.y = ${powerUp.y}, david.x = ${david.x}, david.y = ${david.y}, timestamp = ${Date.now()}`);
        }
    }
});

    // Update and remove expired dodge wind lines
    dodgeWindLines = dodgeWindLines.filter(cloud => {
        cloud.life -= 16;
        if (cloud.progress < 1) {
            cloud.progress += 16 / cloud.maxProgressTime; // Progress increases over maxProgressTime
            if (cloud.progress > 1) cloud.progress = 1;
        }
        return cloud.life > 0;
    });

    windLines.forEach(line => {
        line.startX += line.speed;
        if (line.startX > (canvas.width / DPR)) {
            line.startX = -line.length;
            line.startY = (canvas.height / 2) / DPR + (Math.random() * ((canvas.height / 2) / DPR - 20));
            line.opacity = Math.random() * 0.3 + 0.2;
        }
    });

    particles.forEach((particle, index) => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.life -= 16;

        const canvasHeight = canvas.height / DPR;
        const canvasWidth = canvas.width / DPR;
        const topEdgeThreshold = 5;

        if (
            particle.x < 0 ||
            particle.x > canvasWidth ||
            particle.y > canvasHeight ||
            particle.y < topEdgeThreshold
        ) {
            particles.splice(index, 1);
            return;
        }

        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    spearSmoke.forEach((smoke, index) => {
        smoke.x += smoke.velocityX;
        smoke.y += smoke.velocityY;
        smoke.life -= 16;

        if (smoke.life <= 0 || smoke.x < 0 || smoke.x > canvas.width / DPR || smoke.y < 0 || smoke.y > canvas.height / DPR) {
            spearSmoke.splice(index, 1);
        }
    });

    // Update spear aura intensity
    spearAuraIntensity = Math.sin(Date.now() / 200) * 0.5 + 0.5; // Oscillates between 0 and 1
    // Update stone glow intensity
    stoneGlowIntensity = Math.sin(Date.now() / 250) * 0.5 + 0.5; // Oscillates between 0 and 1, slightly slower

    if (!isGoliathDefeated) {
        const healthPercentage = goliath.health / goliath.maxHealth;
        if (healthPercentage <= 0.2 && !goliath.isEnraged) {
            goliath.isEnraged = true;
            goliath.speed = goliath.baseSpeed * 2.5;
            goliath.spearInterval = goliath.baseSpearInterval * 0.5;
            enrageShakeTimer = 1000;
            enrageShakeIntensity = 8; // Reduced from 10
        }

        if (goliath.isEnraged) {
            enrageShakeTimer += 16;
        }

        if (enrageShakeTimer > 0) {
            enrageShakeTimer -= 16;
            if (enrageShakeTimer <= 0) {
                enrageShakeTimer = 0;
                enrageShakeIntensity = 0;
            }
        }

        if (goliathBlinkTimer > 0) {
            goliathBlinkTimer -= 16;
            if (goliathBlinkTimer < 0) goliathBlinkTimer = 0;
        }
    }

    if (david.health <= 2) {
        canvas.classList.add("low-health-blinking");
    } else {
        canvas.classList.remove("low-health-blinking");
    }

    updateScoreDisplay();
}

function checkCollision(obj1, obj2, isRectToRect = false) {
    if (isRectToRect) {
        const collision = (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
        if (!collision && obj1.type) { // Log power-up misses
            const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
            const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log(`Power-up collision check: type = ${obj1.type}, distance = ${distance.toFixed(2)}, obj1.x = ${obj1.x}, obj1.y = ${obj1.y}, obj2.x = ${obj2.x}, obj2.y = ${obj2.y}, collision = ${collision}`);
        }
        return collision;
    } else {
        const circleX = obj1.x;
        const circleY = obj1.y;
        const circleRadius = obj1.radius;

        const rectX = obj2.x;
        const rectY = obj2.y;
        const rectWidth = obj2.width;
        const rectHeight = obj2.height;

        const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;
        const collision = (distanceX ** 2 + distanceY ** 2) <= (circleRadius ** 2);
        if (!collision && obj1.type) { // Log power-up misses
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
            console.log(`Power-up collision check (circle): type = ${obj1.type}, distance = ${distance.toFixed(2)}, circleX = ${circleX}, circleY = ${circleY}, rectX = ${rectX}, rectY = ${rectY}, collision = ${collision}`);
        }
        return collision;
    }
}

// --- Rendering ---
function drawStarOfDavid(x, y, size, fillColor = null, strokeColor = "#1E90FF", lineWidth = 1, whiteOutlineWidth = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Draw white outline first, if specified
    if (whiteOutlineWidth > 0) {
        ctx.beginPath();
        const innerRadius = size / 2;
        const outerRadius = innerRadius * (2 / Math.sqrt(3));

        ctx.moveTo(0, -outerRadius);
        ctx.lineTo(-innerRadius, outerRadius / 2);
        ctx.lineTo(innerRadius, outerRadius / 2);
        ctx.closePath();

        ctx.moveTo(0, outerRadius);
        ctx.lineTo(-innerRadius, -outerRadius / 2);
        ctx.lineTo(innerRadius, -outerRadius / 2);
        ctx.closePath();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = whiteOutlineWidth;
        ctx.stroke();
    }

    // Draw the main Star of David
    ctx.beginPath();
    const innerRadius = size / 2;
    const outerRadius = innerRadius * (2 / Math.sqrt(3));

    ctx.moveTo(0, -outerRadius);
    ctx.lineTo(-innerRadius, outerRadius / 2);
    ctx.lineTo(innerRadius, outerRadius / 2);
    ctx.closePath();

    ctx.moveTo(0, outerRadius);
    ctx.lineTo(-innerRadius, -outerRadius / 2);
    ctx.lineTo(innerRadius, -outerRadius / 2);
    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
}

function drawBone(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const boneLength = size;
    const boneWidth = size / 5;
    const endWidth = boneWidth * 2;
    const endLength = boneWidth * 1.5;

    const gradient = ctx.createLinearGradient(-boneLength / 2, -boneWidth / 2, -boneLength / 2, boneWidth / 2);
    gradient.addColorStop(0, "#EDE4E0");
    gradient.addColorStop(1, "#D3CBBE");

    ctx.beginPath();
    ctx.moveTo(-boneLength / 2 + endLength, -boneWidth / 2);
    ctx.lineTo(boneLength / 2 - endLength, -boneWidth / 1.5);
    ctx.lineTo(boneLength / 2 - endLength, boneWidth / 1.5);
    ctx.lineTo(-boneLength / 2 + endLength, boneWidth / 2);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#A9A9A9";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-boneLength / 2 + endLength / 2, 0, endLength / 2, endWidth / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(boneLength / 2 - endLength / 2, 0, endLength / 2, endWidth / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(169, 169, 169, 0.5)";
    ctx.lineWidth = 0.3;
    for (let i = 0; i < 3; i++) {
        const crackX = -boneLength / 2 + endLength + Math.random() * (boneLength - 2 * endLength);
        const crackYStart = -boneWidth / 2 + Math.random() * boneWidth;
        const crackYEnd = -boneWidth / 2 + Math.random() * boneWidth;
        ctx.beginPath();
        ctx.moveTo(crackX, crackYStart);
        ctx.lineTo(crackX + Math.random() * 5 - 2.5, crackYEnd);
        ctx.stroke();
    }

    ctx.restore();
}

function drawBattlefieldBackground() {
    const canvasWidth = canvas.width / DPR;
    const canvasHeight = canvas.height / DPR;
    const grassHeight = canvasHeight / 2;

    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "#556B2F";
    ctx.fillRect(0, grassHeight, canvasWidth, canvasHeight - grassHeight);

    ctx.fillStyle = "#808080";
    const rockPositions = [
        { x: canvasWidth * 0.1, y: grassHeight + 20, radius: 5 },
        { x: canvasWidth * 0.3, y: grassHeight + 50, radius: 8 },
        { x: canvasWidth * 0.6, y: grassHeight + 30, radius: 6 },
        { x: canvasWidth * 0.8, y: grassHeight + 70, radius: 7 },
        { x: canvasWidth * 0.2, y: canvasHeight - 20, radius: 4 },
        { x: canvasWidth * 0.5, y: canvasHeight - 40, radius: 6 }
    ];
    rockPositions.forEach(rock => {
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    const staticWindLines = [
        { startX: canvasWidth * 0.15, startY: grassHeight + 60, endX: canvasWidth * 0.25, endY: grassHeight + 60 },
        { startX: canvasWidth * 0.35, startY: grassHeight + 80, endX: canvasWidth * 0.45, endY: grassHeight + 80 },
        { startX: canvasWidth * 0.55, startY: canvasHeight - 60, endX: canvasWidth * 0.65, endY: canvasHeight - 60 }
    ];
    staticWindLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();
        ctx.closePath();
    });

    ctx.strokeStyle = "#4A2C2A";
    ctx.lineWidth = 2;
    const brokenSpears = [
        { x: canvasWidth * 0.7, y: grassHeight + 40, angle: Math.PI / 4 },
        { x: canvasWidth * 0.4, y: canvasHeight - 30, angle: -Math.PI / 6 }
    ];
    brokenSpears.forEach(spear => {
        ctx.save();
        ctx.translate(spear.x, spear.y);
        ctx.rotate(spear.angle);
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.moveTo(5, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(0, 0);
        ctx.lineTo(5, 5);
        ctx.stroke();
        ctx.restore();
    });

    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 1;
    const tumbleweed = { x: canvasWidth * 0.2, y: canvasHeight - 50, radius: 10 };
    ctx.beginPath();
    ctx.arc(tumbleweed.x, tumbleweed.y, tumbleweed.radius, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const spikeLength = 5;
        ctx.moveTo(tumbleweed.x + Math.cos(angle) * tumbleweed.radius, tumbleweed.y + Math.sin(angle) * tumbleweed.radius);
        ctx.lineTo(
            tumbleweed.x + Math.cos(angle) * (tumbleweed.radius + spikeLength),
            tumbleweed.y + Math.sin(angle) * (tumbleweed.radius + spikeLength)
        );
    }
    ctx.stroke();
    ctx.closePath();

    bones.forEach(bone => {
        drawBone(bone.x, bone.y, bone.size, bone.rotation);
    });
}

function drawForegroundStars() {
    const canvasWidth = canvas.width / DPR;
    const canvasHeight = canvas.height / DPR;
    const grassHeight = canvasHeight / 2; // Start of David's playable area

    // Define corner positions with offsets to avoid edges and ensure visibility
    const offset = 30; // Pixels from canvas edges for aesthetic spacing
    const starSize = 10; // Consistent size for stars
    const starPositions = [
        { x: offset, y: grassHeight + offset }, // Top-left corner
        { x: canvasWidth - offset, y: grassHeight + offset }, // Top-right corner
        { x: offset, y: canvasHeight - offset }, // Bottom-left corner
        { x: canvasWidth - offset, y: canvasHeight - offset } // Bottom-right corner
    ];

    starPositions.forEach(star => {
        drawStarOfDavid(star.x, star.y, starSize, null, "#1E90FF", 1, 3);
    });
}

function drawBarbedWireNet() {
    const canvasWidth = canvas.width / DPR;
    const canvasHeight = canvas.height / DPR;
    const netY = canvasHeight / 2;

    ctx.strokeStyle = "#4A2C2A";
    ctx.lineWidth = 3;
    const wireSpacing = 20;
    for (let x = 0; x < canvasWidth; x += wireSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, netY - 5);
        ctx.lineTo(x + wireSpacing / 2, netY + 5);
        ctx.lineTo(x + wireSpacing, netY - 5);
        ctx.stroke();
        ctx.closePath();
    }

    ctx.fillStyle = "#C0C0C0";
    for (let x = wireSpacing / 2; x < canvasWidth; x += wireSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, netY - 8); // Fixed typo: replaced 'glioma' with 8
        ctx.lineTo(x - 4, netY);
        ctx.lineTo(x + 4, netY);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, netY + 8);
        ctx.lineTo(x - 4, netY);
        ctx.lineTo(x + 4, netY);
        ctx.closePath();
        ctx.fill();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBattlefieldBackground();
    drawBarbedWireNet();

    ctx.save();
    let shakeX = 0;
    let shakeY = 0;

    if (shakeTime > 0) {
        shakeX = (Math.random() - 0.5) * shakeIntensity;
        shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
        shakeTime -= 16;
        if (shakeTime < 0) shakeTime = 0;
    }

    ctx.lineWidth = 1;
    windLines.forEach(line => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`;
        ctx.beginPath();
        ctx.moveTo(Math.max(0, line.startX), Math.max(canvas.height / 2 / DPR, line.startY));
        ctx.lineTo(Math.min(canvas.width / DPR, line.startX + line.length), Math.max(canvas.height / 2 / DPR, line.startY));
        ctx.stroke();
        ctx.closePath();
    });

    // Apply shake to spears, stones, power-ups, particles, dodge wind lines, spear smoke
    stones.forEach(stone => {
    ctx.save();
    // Apply blue and white glow to stone
    const glowOpacity = 0.6 * stoneGlowIntensity;
    ctx.shadowColor = `rgba(30, 144, 255, ${glowOpacity})`;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = `rgba(255, 255, 255, ${glowOpacity * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(stone.x, stone.y, stone.radius * 1.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    // Draw stone
    ctx.beginPath();
    ctx.arc(stone.x, stone.y, stone.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#808080";
    ctx.fill();
    ctx.closePath();

    // Apply dramatic white aura to Star of David
    ctx.shadowColor = `rgba(255, 255, 255, ${1.0 * stoneGlowIntensity})`;
    ctx.shadowBlur = 30;

    // Draw blue Star of David with slow rotation and thick white outline
    ctx.save();
    ctx.translate(stone.x, stone.y);
    ctx.rotate((stone.frameCount % 360) * (Math.PI / 180) * 0.05);
    drawStarOfDavid(0, 0, stone.radius * 2.5, null, "#1E90FF", 1, 3);
    ctx.restore();

    // Reset shadow for power-up glow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Apply power-up glow based on stone's properties
    const opacity = Math.sin(powerUpGlowTimer / 200) * 0.5 + 0.5;
    if (stone.hasDualPowerUps) {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, stone.radius * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 0, ${opacity})`; // Green for dual power-ups
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        console.log(`Drawing green glow (dual power-ups): x = ${stone.x}, y = ${stone.y}, isTripleDamage = ${stone.isTripleDamage}, hasDualPowerUps = ${stone.hasDualPowerUps}, damage = ${stone.damage}, opacity = ${opacity}, timestamp = ${Date.now()}`);
    } else if (stone.isTripleDamage) {
        ctx.beginPath();
        ctx.arc(stone.x, stone.y, stone.radius * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 0, ${opacity})`; // Yellow for triple damage
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        console.log(`Drawing yellow glow: x = ${stone.x}, y = ${stone.y}, isTripleDamage = ${stone.isTripleDamage}, hasDualPowerUps = ${stone.hasDualPowerUps}, damage = ${stone.damage}, opacity = ${opacity}, timestamp = ${Date.now()}`);
    } else {
        console.log(`No power-up glow applied: x = ${stone.x}, y = ${stone.y}, isTripleDamage = ${stone.isTripleDamage}, hasDualPowerUps = ${stone.hasDualPowerUps}, damage = ${stone.damage}, timestamp = ${Date.now()}`);
        if (stone.damage === 3) {
            console.warn(`Expected power-up glow but none applied: isTripleDamage = ${stone.isTripleDamage}, hasDualPowerUps = ${stone.hasDualPowerUps}, damage = ${stone.damage}, timestamp = ${Date.now()}`);
        }
    }

    ctx.restore();
});

    spears.forEach(spear => {
        ctx.save();
        ctx.translate(spear.x + (spear.width / 2), spear.y + (spear.height / 2));
        const angle = Math.atan2(spear.velocityY, spear.velocityX);
        ctx.rotate(angle - Math.PI / 2);

        // Apply red aura
        ctx.shadowColor = `rgba(255, 0, 0, ${0.5 * spearAuraIntensity})`;
        ctx.shadowBlur = 15;

        // Draw spear
        ctx.fillStyle = "#4A2C2A";
        ctx.fillRect(-spear.width / 2, -spear.height / 2, spear.width, spear.height);

        const tipHeight = spear.height * 0.3;
        ctx.beginPath();
        ctx.moveTo(-spear.width / 2, spear.height / 2);
        ctx.lineTo(0, spear.height / 2 + tipHeight);
        ctx.lineTo(spear.width / 2, spear.height / 2);
        ctx.closePath();
        ctx.fillStyle = "#C0C0C0";
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        ctx.restore();
    });

    spearSmoke.forEach(smoke => {
        ctx.save();
        const lifeRatio = smoke.life / smoke.maxLife;
        const gradient = ctx.createRadialGradient(smoke.x, smoke.y, 0, smoke.x, smoke.y, smoke.radius);
        gradient.addColorStop(0, smoke.color.replace("0.8", `${0.8 * lifeRatio}`));
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(smoke.x, smoke.y, smoke.radius * (1 + Math.random() * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    });

    powerUps.forEach(powerUp => {
        ctx.drawImage(powerUpImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);

        // Draw colored circle around power-up
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = powerUp.type === "speed" ?
                         `rgba(0, 191, 255, ${Math.sin(powerUpGlowTimer / 200) * 0.5 + 0.5})` :
                         `rgba(255, 255, 0, ${Math.sin(powerUpGlowTimer / 200) * 0.5 + 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.closePath();
    });

    dodgeWindLines.forEach(cloud => {
        const lifeRatio = cloud.life / cloud.maxLife;
        const progress = Math.min(cloud.progress, 1);
        ctx.save();
        ctx.translate(cloud.centerX, cloud.centerY);
        ctx.rotate(cloud.rotation * progress);

        cloud.patches.forEach(patch => {
            const scale = 1 + progress * 0.5;
            const scaledSize = patch.size * scale;
            const scaledOffsetX = patch.offsetX * scale;
            const scaledOffsetY = patch.offsetY * scale;

            const gradient = ctx.createRadialGradient(
                scaledOffsetX, scaledOffsetY, 0,
                scaledOffsetX, scaledOffsetY, scaledSize
            );
            gradient.addColorStop(0, `rgba(245, 245, 220, ${patch.opacity * lifeRatio})`);
            gradient.addColorStop(1, `rgba(245, 245, 220, 0)`);

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(255, 255, 255, ${0.5 * lifeRatio})`;

            ctx.beginPath();
            ctx.moveTo(scaledOffsetX, scaledOffsetY);
            ctx.bezierCurveTo(
                scaledOffsetX + patch.controlOffset1X, scaledOffsetY + patch.controlOffset1Y,
                scaledOffsetX + patch.controlOffset2X, scaledOffsetY + patch.controlOffset2Y,
                scaledOffsetX + scaledSize * (Math.random() - 0.5), scaledOffsetY + scaledSize * (Math.random() - 0.5)
            );
            ctx.closePath();
            ctx.fill();
        });

        ctx.shadowBlur = 0;
        ctx.restore();
    });

    ctx.restore();

    // Draw Stars of David after shake restore to prevent shaking, but before David
    drawForegroundStars();

    // Draw David after Stars to ensure he appears on top
if (david.speedPowerUpActive || david.tripleDamagePowerUpActive) {
    glowTimer += 16;
    powerUpGlow = Math.sin(glowTimer / 200) * 0.5 + 0.5;
    let glowColor;
    if (david.speedPowerUpActive && david.tripleDamagePowerUpActive && david.tripleDamageHits > 0) {
        glowColor = `rgba(0, 255, 0, ${powerUpGlow})`;
    } else if (david.tripleDamagePowerUpActive && david.tripleDamageHits > 0) {
        glowColor = `rgba(255, 255, 0, ${powerUpGlow})`;
    } else if (david.speedPowerUpActive) {
        glowColor = `rgba(0, 191, 255, ${powerUpGlow})`;
    }
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
}

// FINAL SPRITESHEET DRAWING LOGIC
if (davidThrowing) {
    // This logic is now safe because the update() function prevents animationFrame
    // from ever going out of bounds.
    const frameWidth = davidSpriteSheet.width / TOTAL_FRAMES;
    const frameHeight = davidSpriteSheet.height;
    const frameAspectRatio = frameWidth / frameHeight;
    const animationDrawWidth = david.height * frameAspectRatio;

    // Use the manual offsets to correct drift
    const offsetX = ANIMATION_OFFSETS[animationFrame][0];
    const offsetY = ANIMATION_OFFSETS[animationFrame][1];

    // Center the animation and apply the offset
    const baseDrawX = david.x + (david.width - animationDrawWidth) / 2;
    const finalDrawX = baseDrawX + offsetX;
    const finalDrawY = david.y + offsetY;

    ctx.drawImage(
        davidSpriteSheet,
        animationFrame * frameWidth, 0, frameWidth, frameHeight,
        finalDrawX, finalDrawY, animationDrawWidth, david.height
    );
} else {
    // If not throwing, draw the normal static image.
    ctx.drawImage(davidImg, david.x, david.y, david.width, david.height);
}

// Reset shadow effects after drawing
ctx.shadowColor = "transparent";
ctx.shadowBlur = 0;

    let goliathYShake = 0;
if (!isGoliathDefeated) {
    if (goliath.isEnraged && enrageShakeTimer > 0) {
        ctx.shadowColor = "rgba(255, 0, 0, 0.9)";
        ctx.shadowBlur = 25;
        goliathYShake = Math.sin(enrageShakeTimer / 300) * 8; // Slower shake, reduced intensity
    }

    if (goliathBlinkTimer > 0 && Math.floor(goliathBlinkTimer / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(goliathImg, goliath.x, goliath.y + goliathYShake, goliath.width, goliath.height);
    ctx.globalAlpha = 1.0;
}

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
}

function gameLoop() {
    if (gameStarted && !gameOver && !isTransitioning) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Screen Management ---
function hideAllOverlays() {
    const overlays = [
        startScreen, gameOverScreen, weddingScreen, highScoreScreen,
        startBtn, restartBtn, playAgainBtn, startOverBtn, nextLevelBtn
    ];
    overlays.forEach(element => {
        if (element) element.classList.add("hidden");
    });
}

function showStartScreen() {
    hideAllOverlays();
    startScreen.classList.remove("hidden");
    startBtn.classList.remove("hidden");
    canvas.style.opacity = "1";
}

function showGameOverScreen() {
    hideAllOverlays();
    gameOverScreen.classList.remove("hidden");
    playAgainBtn.classList.remove("hidden");
    startOverBtn.classList.remove("hidden");
    canvas.style.opacity = "0.3";

    if (backgroundMusic) backgroundMusic.pause();

    const levelText = numberToWord(completedLevel);
    if (gameOverMessage) {
        gameOverMessage.textContent = `Level ${levelText} Defeat! Goliath Stands Tall!\n\n"The Philistine [Goliath] came out morning and evening, and took his stand for forty days."\n— 1 Samuel 17:16 (AMP)`;
    } else {
        console.warn("Game over message element not found.");
    }
}

function showWeddingScreen() {
    hideAllOverlays();
    weddingScreen.classList.remove("hidden");
    canvas.style.display = "none"; // Hide canvas completely

    if (backgroundMusic) backgroundMusic.pause();

    const levelText = numberToWord(completedLevel);
    let weddingMessage = `With a single stone, David struck Goliath, proving that faith and courage can topple even the mightiest foes. A new challenge awaits!`;

    const levelUpElement = weddingScreen.querySelector(".level-up");
    if (levelUpElement) {
        levelUpElement.textContent = `LEVEL ${levelText.toUpperCase()} COMPLETE!`;
    } else {
        console.warn("Level up element not found.");
    }

    for (let i = 1; i <= maxLevels; i++) {
        const levelDiv = document.getElementById(`wedding-level-${i}`);
        if (levelDiv) {
            if (i === completedLevel) {
                levelDiv.classList.remove("hidden");
            } else {
                levelDiv.classList.add("hidden");
            }
        } else {
            console.warn(`Level div wedding-level-${i} not found.`);
        }
    }

    if (currentLevel === maxLevels) {
        weddingMessage = `Congratulations! You've Conquered All ${maxLevels} Levels! Goliath is Defeated!`;
        if (levelUpElement) {
            levelUpElement.textContent = "ALL LEVELS CONQUERED!";
        }
        if (!hasSubmittedScore) {
            highScoreScreen.classList.remove("hidden");
            isHighScoreEntryActive = true;
            highScoreTitle.textContent = "New High Score!";
            highScoreMessage.textContent = `Level ${completedLevel}, Goliath: ${goliath.health}`;
            highScoreInput.value = "";
            highScoreInput.focus();
        }
        startOverBtn.classList.remove("hidden");
    } else {
        nextLevelBtn.classList.remove("hidden");
        playAgainBtn.classList.remove("hidden");
        startOverBtn.classList.remove("hidden");
    }

    const weddingMessageElement = weddingScreen.querySelector("p");
    if (weddingMessageElement) {
        weddingMessageElement.textContent = weddingMessage;
    } else {
        console.warn("Wedding screen message element not found.");
    }
}

// --- Initialize the Game on Load ---
document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
});

// --- Export for Testing (if needed) ---
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        initializeGame,
        handleStart,
        handleNextLevel,
        handlePlayAgain,
        resetGameState,
        startLevel,
        updateScoreDisplay,
        handleThrowInput,
        updateGoliathTarget,
        update,
        checkCollision,
        drawStarOfDavid,
        drawBone,
        drawBattlefieldBackground,
        drawBarbedWireNet,
        draw,
        gameLoop,
        hideAllOverlays,
        showStartScreen,
        showGameOverScreen,
        showWeddingScreen,
        numberToWord
    };
}