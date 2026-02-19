console.log("game.js loaded successfully for Level 2 version");

// --- Game State Variables ---
let david = {};
let giants = []; // Can hold 1 or 4 giants
let swords = [];
let spears = [];
let specialPowerUp = {
    active: false,
    x: 0, y: 0,
    width: 0, height: 0,
    visible: false,
    timer: 0,
    onTime: 1000, // 1 second visible
    offTime: 8000, // 8 seconds hidden
    spawnTime: 0,
    needsSpawning: false // Flag to indicate power-up should be triggered
};
let helperSequence = {
    active: false,
    phase: 0, // 0: inactive, 1: helper appears, 2: sword flies, 3: giant hit, 4: cleanup
    timer: 0,
    helper: null, // { x, y, width, height, targetX }
    flyingSword: null // { x, y, width, height, targetX, targetY, speed, angle }
};
let particles = [];
let gameOver = false;
let gameStarted = false;
let gameWon = false; // Tracks if the current level is won
let isTransitioning = false; // Prevent actions during screen transitions
let currentLevel = 1;
const maxLevels = 2; // Only 2 levels in this game version
let isProcessingClick = false; // Prevent double clicks on buttons
let shakeTime = 0;
let shakeIntensity = 0;
let lowHealthBlinkActive = false;

// Debounce state for throw action
let lastThrowInput = 0;
const throwDebounceTime = 2500; // ms debounce for throwing sword (2.5 seconds)

// DOM Elements (initialized in initializeGame)
let canvas, ctx, scoreDisplay, levelCompleteScreen, gameOverScreen, backgroundMusic, startScreen, startBtn, restartBtn, playAgainBtn, controls, controlInstructions, gameContainer, mobileControlsSection, instructionsContainer, nextLevelBtn, startOverBtn, levelCompleteMusic, gameOverSound, throwSwordSound, hitGiantSound, hitDavidSound;

// --- Level Configurations ---
const levelConfigs = {
    1: { // David vs Ishbi-benob
        davidHealth: 10, // Start David with more health for Level 1
        davidMaxHealth: 10,
        davidSpeed: 5,
        giantName: "Ishbi-benob",
        giants: [{
            id: 0,
            name: "Ishbi-benob",
            health: 5, // Start health
            maxHealth: 5,
            speed: 1, // Ishbi-benob moves
            x: 0, y: 50,
            width: 0, height: 0,
            directionX: 1,
            throwsSpears: true,
            hitEffect: 0,
            lastThrow: 0
        }],
        specialPowerUpTriggerHealth: 1, // Giant health <= 1 triggers power-up need
        spearInterval: 1000,
        winCondition: 'helperSequenceComplete', // Defeated by helper
        loseCondition: 'davidHealthZero', // David's health reaches 0
        scoreText: (d, g) => `Level 1 | David: ${d.health}/${d.maxHealth} | Ishbi-benob: ${g.length > 0 ? g[0].health : '0'}/${g.length > 0 ? g[0].maxHealth : '5'}`
    },
    2: { // David vs 4 Giants
        davidHealth: 10,
        davidMaxHealth: 10,
        davidSpeed: 6,
        giants: [
            { id: 0, name: "Giant 1", health: 5, maxHealth: 5, speed: 0.8, x: 0, y: 30, width: 0, height: 0, directionX: 1, throwsSpears: true, lastThrow: 0, hitEffect: 0 },
            { id: 1, name: "Giant 2", health: 5, maxHealth: 5, speed: 1.0, x: 0, y: 30, width: 0, height: 0, directionX: -1, throwsSpears: true, lastThrow: 0, hitEffect: 0 },
            { id: 2, name: "Giant 3", health: 5, maxHealth: 5, speed: 0.7, x: 0, y: 30, width: 0, height: 0, directionX: 1, throwsSpears: true, lastThrow: 0, hitEffect: 0 },
            { id: 3, name: "Giant 4", health: 5, maxHealth: 5, speed: 0.9, x: 0, y: 30, width: 0, height: 0, directionX: -1, throwsSpears: true, lastThrow: 0, hitEffect: 0 }
        ],
        specialPowerUpTriggerHealth: -1, // No special power-up needed
        spearInterval: 2000, // Interval per giant throwing attempt
        winCondition: 'allGiantsDefeated',
        loseCondition: 'davidHealthZero',
        scoreText: (d, g) => `Level 2 | David: ${d.health}/${d.maxHealth} | Giants Remaining: ${g.length}`
    }
};

// Asset Loading (initialized in initializeGame)
let davidImg, goliathImg, powerUpImg, davidAnimationElement;

// --- Initialization ---
function initializeGame() {
    console.log("Initializing David vs Giants: Successors...");

    // DOM elements
    canvas = document.getElementById('game-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    scoreDisplay = document.getElementById('score');
    levelCompleteScreen = document.getElementById('level-complete-screen');
    levelCompleteMusic = document.getElementById('level-complete-music');
    gameOverScreen = document.getElementById('game-over');
    gameOverSound = document.getElementById('game-over-sound');
    backgroundMusic = document.getElementById('background-music');
    startScreen = document.getElementById('start-screen');
    startBtn = document.getElementById('start-btn');
    restartBtn = document.getElementById('restart-btn');
    startOverBtn = document.getElementById('start-over-btn');
    nextLevelBtn = document.getElementById('next-level-btn');
    controls = document.getElementById('controls');
    controlInstructions = document.getElementById('control-instructions');
    gameContainer = document.getElementById('game-container');
    mobileControlsSection = document.getElementById('mobile-controls-section');
    instructionsContainer = document.getElementById('instructions-container');

    // Audio elements
    throwSwordSound = document.getElementById('throw-sword-sound');
    hitGiantSound = document.getElementById('hit-giant-sound');
    hitDavidSound = document.getElementById('hit-david-sound');

    if (!canvas || !ctx || !scoreDisplay || !levelCompleteScreen || !gameOverScreen || !startScreen || !startBtn || !gameContainer || !restartBtn || !startOverBtn || !nextLevelBtn) {
        console.error("Essential DOM element missing. Aborting initialization.");
        document.body.innerHTML = "Error: Could not load game resources. Please refresh or check the console.";
        return;
    }

    const canvasContainer = document.getElementById('canvas-container');
     if (!canvasContainer) {
        console.error("canvasContainer not found in the DOM");
        return;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load images
    davidImg = new Image();
    davidImg.src = '../icons/david-icon.png';
    davidImg.onerror = () => console.error("Failed to load David image");
    davidImg.onload = () => console.log("David image loaded successfully");

    davidAnimationElement = document.createElement('img');
    davidAnimationElement.src = '../icons/david-animation.gif';
    davidAnimationElement.style.position = 'absolute';
    davidAnimationElement.style.left = '-9999px'; // Hide it off-screen
    document.body.appendChild(davidAnimationElement); // Add to DOM to ensure loading/caching
    davidAnimationElement.onerror = () => console.error("Failed to load David animation");
    davidAnimationElement.onload = () => console.log("David animation loaded successfully");

    goliathImg = new Image();
    goliathImg.src = '../icons/goliath-icon.png';
    goliathImg.onerror = () => console.error("Failed to load Goliath/Giant image");
    goliathImg.onload = () => console.log("Goliath/Giant image loaded successfully");

    powerUpImg = new Image();
    powerUpImg.src = '../icons/power-up-lightning.png';
    powerUpImg.onerror = () => console.error("Failed to load Power-up image");
    powerUpImg.onload = () => console.log("Power-up image loaded successfully");

    setupMobileControls();
    setupEventListeners();
    showStartScreen();
    gameLoop();
}

function resizeCanvas() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer || !canvas) return;
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    console.log(`Canvas resized to: ${canvas.width} x ${canvas.height}`);
     if (gameStarted && !gameOver) {
         // Reposition elements if needed after resize during gameplay
         console.log("Game running, resize occurred. Elements might need repositioning.");
         // Example: recenterDavid(); repositionsGiants(); etc.
     }
}

function setupMobileControls() {
     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // Ensure containers exist or create them
    if (!mobileControlsSection) {
         mobileControlsSection = document.createElement('div');
         mobileControlsSection.id = 'mobile-controls-section';
         const canvasCont = document.getElementById('canvas-container');
         if (canvasCont && canvasCont.parentNode) {
             canvasCont.parentNode.insertBefore(mobileControlsSection, controlInstructions);
         } else { gameContainer.appendChild(mobileControlsSection); }
    }
     if (!instructionsContainer) {
        instructionsContainer = document.createElement('div');
        instructionsContainer.id = 'instructions-container';
         if (mobileControlsSection && mobileControlsSection.parentNode) {
             mobileControlsSection.parentNode.insertBefore(instructionsContainer, mobileControlsSection.nextSibling);
         } else { gameContainer.appendChild(instructionsContainer); }
    }

    if (isMobile) {
        if (controls) controls.style.display = 'none'; // Hide desktop buttons if they exist
        mobileControlsSection.innerHTML = `
            <div id="joystick-container"><div id="joystick"></div></div>
            <button id="mobile-throw-btn" class="control-btn throw-btn">Throw Sword</button>`;
        mobileControlsSection.style.display = 'flex';
        if (controlInstructions && instructionsContainer) {
             instructionsContainer.innerHTML = ''; // Clear previous content
             instructionsContainer.appendChild(controlInstructions);
             controlInstructions.style.display = 'block';
             instructionsContainer.style.display = 'block';
        } else if (controlInstructions) { controlInstructions.style.display = 'none'; }
        setupJoystickListeners();
        const mobileThrowBtn = document.getElementById('mobile-throw-btn');
        if (mobileThrowBtn) {
            mobileThrowBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleThrowInput(); }, { passive: false }); // Use passive: false if preventing default
            mobileThrowBtn.addEventListener('touchend', (e) => { e.preventDefault(); });
        }
    } else {
        if (mobileControlsSection) mobileControlsSection.style.display = 'none';
        if (instructionsContainer) instructionsContainer.style.display = 'none';
        if (controls) controls.style.display = 'none'; // Start hidden
        if (controlInstructions) controlInstructions.style.display = 'none'; // Start hidden
        setupDesktopButtonListeners(); // Set up listeners for desktop buttons if they exist
    }
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (!gameStarted || gameOver || helperSequence.active) return;
        if (e.key === 'ArrowLeft') keys.left = true;
        else if (e.key === 'ArrowRight') keys.right = true;
        else if (e.key === 'ArrowUp') keys.up = true;
        else if (e.key === 'ArrowDown') keys.down = true;
        else if (e.key === ' ') { e.preventDefault(); handleThrowInput(); }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keys.left = false;
        else if (e.key === 'ArrowRight') keys.right = false;
        else if (e.key === 'ArrowUp') keys.up = false;
        else if (e.key === 'ArrowDown') keys.down = false;
    });

    // Button click listeners with debounce protection
    startBtn.addEventListener('click', handleStart);
    startBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(e); }); // Pass event for debounce check

    restartBtn.addEventListener('click', () => { currentLevel = 1; handleStart(); });
    restartBtn.addEventListener('touchstart', (e) => { e.preventDefault(); currentLevel = 1; handleStart(e); });

    startOverBtn.addEventListener('click', () => { currentLevel = 1; handleStart(); });
    startOverBtn.addEventListener('touchstart', (e) => { e.preventDefault(); currentLevel = 1; handleStart(e); });

    nextLevelBtn.addEventListener('click', handleNextLevel);
    nextLevelBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleNextLevel(); });
}

function setupDesktopButtonListeners() {
     // Find desktop control buttons if they exist
     const leftBtn = document.getElementById('left-btn');
     const rightBtn = document.getElementById('right-btn');
     const upBtn = document.getElementById('up-btn');
     const downBtn = document.getElementById('down-btn');
     const throwBtn = document.getElementById('throw-btn');

     // Add listeners if elements are found
     if (leftBtn) {
         leftBtn.addEventListener('mousedown', () => { if (gameStarted && !gameOver && !helperSequence.active) keys.left = true; });
         leftBtn.addEventListener('mouseup', () => keys.left = false); leftBtn.addEventListener('mouseleave', () => keys.left = false);
         leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (gameStarted && !gameOver && !helperSequence.active) keys.left = true; });
         leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });
     }
     if (rightBtn) {
         rightBtn.addEventListener('mousedown', () => { if (gameStarted && !gameOver && !helperSequence.active) keys.right = true; });
         rightBtn.addEventListener('mouseup', () => keys.right = false); rightBtn.addEventListener('mouseleave', () => keys.right = false);
         rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (gameStarted && !gameOver && !helperSequence.active) keys.right = true; });
         rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.right = false; });
     }
      if (upBtn) {
         upBtn.addEventListener('mousedown', () => { if (gameStarted && !gameOver && !helperSequence.active) keys.up = true; });
         upBtn.addEventListener('mouseup', () => keys.up = false); upBtn.addEventListener('mouseleave', () => keys.up = false);
         upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (gameStarted && !gameOver && !helperSequence.active) keys.up = true; });
         upBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.up = false; });
     }
      if (downBtn) {
         downBtn.addEventListener('mousedown', () => { if (gameStarted && !gameOver && !helperSequence.active) keys.down = true; });
         downBtn.addEventListener('mouseup', () => keys.down = false); downBtn.addEventListener('mouseleave', () => keys.down = false);
         downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (gameStarted && !gameOver && !helperSequence.active) keys.down = true; });
         downBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.down = false; });
     }
      if (throwBtn) {
         throwBtn.addEventListener('click', () => { handleThrowInput(); });
         throwBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleThrowInput(); });
     }
}

function setupJoystickListeners() {
    const joystickContainer = document.getElementById('joystick-container');
    const joystick = document.getElementById('joystick');
    if (!joystickContainer || !joystick) { console.warn("Joystick elements not found."); return; }
    let joystickActive = false; let joystickOriginX = 0; let joystickOriginY = 0;
    const joystickStartX = joystick.offsetLeft; const joystickStartY = joystick.offsetTop;
    const maxDistance = joystickContainer.offsetWidth / 2 - joystick.offsetWidth / 4;
    joystickContainer.addEventListener('touchstart', (e) => {
        e.preventDefault(); if (gameStarted && !gameOver && !helperSequence.active) { const touch = e.touches[0]; const currentRect = joystickContainer.getBoundingClientRect(); joystickOriginX = touch.clientX - currentRect.left; joystickOriginY = touch.clientY - currentRect.top; joystickActive = true; joystickContainer.style.background = 'rgba(255, 255, 255, 0.3)'; } }, { passive: false });
    joystickContainer.addEventListener('touchmove', (e) => {
        e.preventDefault(); if (joystickActive && gameStarted && !gameOver && !helperSequence.active) { const touch = e.touches[0]; const currentRect = joystickContainer.getBoundingClientRect(); const touchX = touch.clientX - currentRect.left; const touchY = touch.clientY - currentRect.top; const containerCenterX = joystickContainer.offsetWidth / 2; const containerCenterY = joystickContainer.offsetHeight / 2; const dx = touchX - containerCenterX; const dy = touchY - containerCenterY; const distance = Math.sqrt(dx * dx + dy * dy); let moveX = dx; let moveY = dy; if (distance > maxDistance) { moveX = (dx / distance) * maxDistance; moveY = (dy / distance) * maxDistance; } joystick.style.left = `${containerCenterX + moveX - joystick.offsetWidth / 2}px`; joystick.style.top = `${containerCenterY + moveY - joystick.offsetHeight / 2}px`; const threshold = maxDistance * 0.3; keys.left = moveX < -threshold; keys.right = moveX > threshold; keys.up = moveY < -threshold; keys.down = moveY > threshold; } }, { passive: false });
    joystickContainer.addEventListener('touchend', (e) => {
        e.preventDefault(); if (joystickActive) { joystickActive = false; joystick.style.left = `${joystickStartX}px`; joystick.style.top = `${joystickStartY}px`; keys.left = keys.right = keys.up = keys.down = false; joystickContainer.style.background = 'rgba(255, 255, 255, 0.1)'; } }, { passive: false });
    joystickContainer.addEventListener('touchcancel', (e) => { if (joystickActive) { joystickActive = false; joystick.style.left = `${joystickStartX}px`; joystick.style.top = `${joystickStartY}px`; keys.left = keys.right = keys.up = keys.down = false; joystickContainer.style.background = 'rgba(255, 255, 255, 0.1)'; } }, { passive: false });
}

// --- Input Handling ---
let keys = { left: false, right: false, up: false, down: false };

function handleThrowInput() {
    if (!gameStarted || gameOver || helperSequence.active) return;
    const now = Date.now();
    if (now - lastThrowInput >= throwDebounceTime) {
        lastThrowInput = now;
        throwSword();
    }
}

// --- Game Flow ---
function handleStart(e) {
     if (e) e.preventDefault(); if (isProcessingClick) return; isProcessingClick = true;
     setTimeout(() => { isProcessingClick = false; }, 300); // Prevent rapid clicks
     startGame();
 }
function handleNextLevel() {
    if (isProcessingClick) return; isProcessingClick = true; setTimeout(() => { isProcessingClick = false; }, 300);
    if (currentLevel < maxLevels) { currentLevel++; startGame(); }
    else { console.log("Attempted next level beyond maxLevels. Restarting at level 1."); currentLevel = 1; startGame(); }
}
function startGame() {
    console.log(`Starting Level ${currentLevel}`);
    try {
        resetGameState();
        const config = levelConfigs[currentLevel];
        if (!config) throw new Error(`Level config missing: ${currentLevel}`);

        hideAllOverlays();
        if (canvas) canvas.classList.remove('hidden');
        if (scoreDisplay) scoreDisplay.classList.remove('hidden');

        // Show appropriate controls based on device type
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
             if(mobileControlsSection) mobileControlsSection.style.display = 'flex';
             if(instructionsContainer) instructionsContainer.style.display = 'block';
             if(controls) controls.style.display = 'none'; // Hide desktop controls if they exist
        } else {
             if(controls) controls.style.display = 'flex'; // Show desktop controls
             if(controlInstructions) controlInstructions.style.display = 'block';
             if(mobileControlsSection) mobileControlsSection.style.display = 'none';
             if(instructionsContainer) instructionsContainer.style.display = 'none';
        }

        // Calculate sizes based on current canvas dimensions
        const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800);
        const davidBaseWidth = 80;
        const davidBaseHeight = 80;
        const davidWidth = davidBaseWidth * scaleFactor;
        const davidHeight = davidBaseHeight * scaleFactor;
        const giantBaseWidth = davidBaseWidth * 1.5; // Giants are bigger
        const giantBaseHeight = davidBaseHeight * 1.5;
        const giantWidth = giantBaseWidth * scaleFactor;
        const giantHeight = giantBaseHeight * scaleFactor;

        // Initialize David
        david = {
            x: canvas.width / 2 - davidWidth / 2,
            y: canvas.height - davidHeight - 20 * scaleFactor, // Position near bottom
            width: davidWidth,
            height: davidHeight,
            speed: config.davidSpeed * scaleFactor,
            health: config.davidHealth,
            maxHealth: config.davidMaxHealth,
            lastThrow: 0,
            invulnerable: false,
            invulnerableTime: 0,
            hitEffect: 0,
            isThrowing: false
        };
        lowHealthBlinkActive = (currentLevel === 1 && david.health <= 1);
        if(lowHealthBlinkActive && canvas) canvas.classList.add('low-health-blinking');

        // Initialize Giants
        giants = [];
        config.giants.forEach((giantConf, index) => {
            let giantX, giantY;
            if (currentLevel === 1) {
                // Center the single giant
                giantX = canvas.width / 2 - giantWidth / 2;
                giantY = 50 * scaleFactor; // Position near top
            } else { // Level 2: Position 4 giants
                const totalGiantWidth = 4 * giantWidth;
                const totalSpacing = canvas.width - totalGiantWidth;
                const spacing = totalSpacing / 5; // Space between giants and edges
                giantX = spacing * (index + 1) + giantWidth * index;
                giantY = 30 * scaleFactor; // Slightly higher position for multiple giants
            }
            giants.push({
                ...giantConf,
                x: giantX,
                y: giantY,
                width: giantWidth,
                height: giantHeight,
                directionX: giantConf.directionX || 1,
                lastThrow: Date.now() + Math.random() * (config.spearInterval || 2000) // Stagger initial throws
            });
        });

        // Initialize Power-up
        specialPowerUp.width = 40 * scaleFactor;
        specialPowerUp.height = 40 * scaleFactor;
        specialPowerUp.active = false; // Ensure inactive at start
        specialPowerUp.needsSpawning = false;
        specialPowerUp.visible = false;

        // Reset other game elements
        swords = []; spears = []; particles = [];
        helperSequence.active = false; helperSequence.phase = 0;
        shakeTime = 0; gameWon = false;

        resetAudio(); // Stop previous sounds
        if (backgroundMusic) {
            backgroundMusic.volume = 0.3;
            backgroundMusic.play().catch(error => console.error("BGM Error:", error));
        }
        updateScoreDisplay();
        isTransitioning = false; // Allow game logic to run
    } catch (error) {
        console.error("Error in startGame:", error);
        gameOver = true; gameStarted = false; isTransitioning = false;
        if (scoreDisplay) scoreDisplay.textContent = "Error starting game.";
        showGameOverScreen("Error starting game.");
    }
}
function resetGameState() {
    gameOver = false; gameStarted = true; isTransitioning = false; david = {}; giants = []; swords = []; spears = []; particles = [];
    specialPowerUp = { ...specialPowerUp, active: false, visible: false, timer: 0, needsSpawning: false };
    helperSequence = { ...helperSequence, active: false, phase: 0, timer: 0, helper: null, flyingSword: null };
    keys = { left: false, right: false, up: false, down: false }; lastThrowInput = 0; lowHealthBlinkActive = false; gameWon = false;
    if(canvas) { canvas.classList.remove('low-health-blinking'); }
}
function resetAudio() {
    try { if (levelCompleteMusic) { levelCompleteMusic.pause(); levelCompleteMusic.currentTime = 0; } if (gameOverSound) { gameOverSound.pause(); gameOverSound.currentTime = 0; } if (backgroundMusic) { backgroundMusic.pause(); backgroundMusic.currentTime = 0; } if (throwSwordSound) { throwSwordSound.pause(); throwSwordSound.currentTime = 0; } if (hitGiantSound) { hitGiantSound.pause(); hitGiantSound.currentTime = 0; } if (hitDavidSound) { hitDavidSound.pause(); hitDavidSound.currentTime = 0; } }
    catch (error) { console.error("Error resetting audio:", error); }
}
function hideAllOverlays() {
    if (startScreen) startScreen.classList.add('hidden'); if (levelCompleteScreen) levelCompleteScreen.classList.add('hidden'); if (gameOverScreen) gameOverScreen.classList.add('hidden');
    const level1Win = document.getElementById('level1-complete'); const level2Win = document.getElementById('level2-complete');
    if (level1Win) level1Win.classList.add('hidden'); if (level2Win) level2Win.classList.add('hidden');
}
function showStartScreen() { hideAllOverlays(); if (startScreen) startScreen.classList.remove('hidden'); gameStarted = false; gameOver = true; } // Set gameOver true to prevent loop running logic
function showLevelCompleteScreen() {
    if (gameWon || isTransitioning) return; console.log("Showing Level Complete Screen for Level:", currentLevel); isTransitioning = true; hideAllOverlays(); gameStarted = false; gameOver = true; gameWon = true; resetAudio(); if (levelCompleteMusic) levelCompleteMusic.play().catch(e => console.error("Lvl Complete Music Error:", e));
    const levelWinDivId = `level${currentLevel}-complete`; const levelWinDiv = document.getElementById(levelWinDivId); if (levelWinDiv) levelWinDiv.classList.remove('hidden'); else console.warn(`Win div missing: ${levelWinDivId}`);
    if (levelCompleteScreen) levelCompleteScreen.classList.remove('hidden');
    if (nextLevelBtn) { if (currentLevel < maxLevels) { nextLevelBtn.textContent = "Next Level"; nextLevelBtn.style.display = 'inline-block'; } else { nextLevelBtn.style.display = 'none'; } } if (startOverBtn) startOverBtn.textContent = "Play Again (Lvl 1)";
    setTimeout(() => { isTransitioning = false; }, 500);
}
function showGameOverScreen(message = "The giants were too strong this time!") {
    if (gameOver && !gameStarted && !isTransitioning) { /* Already showing game over */ return; } if (isTransitioning) return;
    console.log("Showing Game Over Screen"); isTransitioning = true; hideAllOverlays(); gameStarted = false; gameOver = true; helperSequence.active = false; helperSequence.phase = 0; resetAudio(); if (gameOverSound) gameOverSound.play().catch(e => console.error("Game Over Sound Error:", e));
    const gameOverText = gameOverScreen ? gameOverScreen.querySelector('p') : null; if (gameOverText) gameOverText.textContent = message;
    if (gameOverScreen) gameOverScreen.classList.remove('hidden'); setTimeout(() => { isTransitioning = false; }, 500);
}

// --- Gameplay Mechanics ---
function throwSword() {
    if (!david || !gameStarted || gameOver || helperSequence.active) return;
    try { const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); const swordWidth = 8 * scaleFactor; const swordHeight = 25 * scaleFactor; swords.push({ x: david.x + david.width / 2 - swordWidth / 2, y: david.y, width: swordWidth, height: swordHeight, speed: 8 * scaleFactor, damage: 1 }); david.isThrowing = true; setTimeout(() => { if(david) david.isThrowing = false; }, 300); playSound(throwSwordSound); }
    catch (error) { console.error("Error in throwSword:", error); }
}
function giantThrowSpear(giant) {
    if (!giant || !gameStarted || gameOver || !giant.throwsSpears || helperSequence.active) return;
    try { const now = Date.now(); const config = levelConfigs[currentLevel]; const interval = config?.spearInterval || 2000; if (now - giant.lastThrow >= interval) { const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); const spearWidth = 5 * scaleFactor; const spearHeight = 20 * scaleFactor; spears.push({ x: giant.x + giant.width / 2 - spearWidth / 2, y: giant.y + giant.height, width: spearWidth, height: spearHeight, speed: 5 * scaleFactor, damage: 1 }); giant.lastThrow = now + Math.random() * 500 - 250; } }
    catch (error) { console.error("Error in giantThrowSpear:", error); }
}
function triggerSpecialPowerUp() {
    console.log(`Activating special power-up spawn timer. Giant health is ${giants[0]?.health}`);
    specialPowerUp.needsSpawning = false; // Acknowledge the need flag
    specialPowerUp.active = true; // Activate the power-up system
    specialPowerUp.visible = false; // Start hidden
    specialPowerUp.spawnTime = Date.now(); // Set the reference time for the *start* of the hidden phase
}
function updateSpecialPowerUp() {
    if (!specialPowerUp.active || helperSequence.active || gameOver || gameWon) return;
    const now = Date.now();
    const elapsed = now - specialPowerUp.spawnTime;

    if (specialPowerUp.visible) { // Currently visible
        if (elapsed >= specialPowerUp.onTime) {
            console.log("PowerUp hiding (OnTime elapsed)");
            specialPowerUp.visible = false;
            specialPowerUp.spawnTime = now; // Reset timer start for 'off' phase
        }
    } else { // Currently hidden
        if (elapsed >= specialPowerUp.offTime) {
            console.log("PowerUp appearing (OffTime elapsed)");
            specialPowerUp.visible = true;
            specialPowerUp.spawnTime = now; // Reset timer start for 'on' phase
             const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800);
             const padding = 50 * scaleFactor;
             specialPowerUp.x = padding + Math.random() * (canvas.width - 2 * padding - specialPowerUp.width);
             const lowerHalfY = canvas.height * 0.6;
             const upperLimit = canvas.height * 0.85 - specialPowerUp.height;
             specialPowerUp.y = lowerHalfY + Math.random() * (upperLimit - lowerHalfY);
             console.log(`PowerUp appeared at ${Math.round(specialPowerUp.x)}, ${Math.round(specialPowerUp.y)}`);
        }
    }

    // Collision Check: David <-> PowerUp
    if (specialPowerUp.visible && checkCollision(david, specialPowerUp)) {
        console.log("Power-up collected!");
        specialPowerUp.active = false;
        specialPowerUp.visible = false;
        startHelperSequence();
    }
}
function checkCollision(rect1, rect2) { if (!rect1 || !rect2) return false; return ( rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y ); }
function spawnParticles(x, y, color, count) {
    try { const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); for (let i = 0; i < count; i++) { particles.push({ x: x, y: y, radius: (Math.random() * 2 + 1) * scaleFactor, speedX: (Math.random() * 4 - 2) * scaleFactor, speedY: (Math.random() * 4 - 2) * scaleFactor, life: 40, color: color, alpha: 1.0 }); } }
    catch (error) { console.error("Error in spawnParticles:", error); }
}
function playSound(soundElement) { if (soundElement && soundElement.readyState >= 2) { soundElement.currentTime = 0; soundElement.play().catch(error => console.warn("Sound play error:", error)); } }

// --- Helper Sequence (Level 1 Final Blow) ---
function startHelperSequence() {
    if (helperSequence.active || gameOver) return; console.log("Starting Helper Sequence!"); helperSequence.active = true; helperSequence.phase = 1; helperSequence.timer = 1000; // Time for helper to appear
    const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); const helperWidth = david.width; const helperHeight = david.height; helperSequence.helper = { x: -helperWidth, y: david.y, width: helperWidth, height: helperHeight, targetX: david.x - helperWidth - 10 * scaleFactor }; david.invulnerable = true; // David safe during sequence
}
function updateHelperSequence(deltaTime) {
     if (!helperSequence.active || gameOver || gameWon) { helperSequence.active = false; return; };
     helperSequence.timer -= deltaTime; const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); const targetGiant = giants.length > 0 ? giants[0] : null;

     // Prevent accidental game over during sequence if giant collides (shouldn't happen if helper is positioned well)
     if (currentLevel === 1 && targetGiant && !david.invulnerable && checkCollision(david, targetGiant)) { david.health = 0; playSound(hitDavidSound); showGameOverScreen("Ishbi-benob caught you during rescue!"); return; }

     switch (helperSequence.phase) {
         case 1: // Helper enters
             if (!helperSequence.helper) break;
             const moveSpeed = 300 * scaleFactor * (deltaTime / 1000);
             if (helperSequence.helper.x < helperSequence.helper.targetX) {
                 helperSequence.helper.x += moveSpeed;
                 if (helperSequence.helper.x >= helperSequence.helper.targetX) { helperSequence.helper.x = helperSequence.helper.targetX; } // Snap to position
             } else { helperSequence.helper.x = helperSequence.helper.targetX; } // Already there or passed
             if (helperSequence.timer <= 0 && helperSequence.helper.x === helperSequence.helper.targetX) { // Wait until in position AND timer done
                 helperSequence.phase = 2; helperSequence.timer = 500; // Short delay before throw
                 if (targetGiant) {
                     const swordW = 15 * scaleFactor; const swordH = 40 * scaleFactor;
                     helperSequence.flyingSword = { x: helperSequence.helper.x + helperSequence.helper.width / 2 - swordW / 2, y: helperSequence.helper.y + helperSequence.helper.height / 2 - swordH / 2, width: swordW, height: swordH, targetX: targetGiant.x + targetGiant.width / 2, targetY: targetGiant.y + targetGiant.height / 2, speed: 12 * scaleFactor, angle: 0 };
                 } else { console.warn("Target giant missing in helper seq phase 1->2"); helperSequence.active = false; helperSequence.phase = 0; showLevelCompleteScreen(); }
             } break;
         case 2: // Sword flies
             if (helperSequence.timer <= 0 && helperSequence.flyingSword && targetGiant) {
                 const dx = helperSequence.flyingSword.targetX - helperSequence.flyingSword.x;
                 const dy = helperSequence.flyingSword.targetY - helperSequence.flyingSword.y;
                 const distance = Math.sqrt(dx * dx + dy * dy);
                 helperSequence.flyingSword.angle = Math.atan2(dy, dx) + Math.PI / 2; // Rotate to face target
                 if (distance > helperSequence.flyingSword.speed) { // Move towards target
                     helperSequence.flyingSword.x += (dx / distance) * helperSequence.flyingSword.speed;
                     helperSequence.flyingSword.y += (dy / distance) * helperSequence.flyingSword.speed;
                 } else { // Reached target
                     helperSequence.flyingSword.x = helperSequence.flyingSword.targetX; helperSequence.flyingSword.y = helperSequence.flyingSword.targetY;
                     helperSequence.phase = 3; helperSequence.timer = 800; // Time for giant reaction/fade
                     console.log("Flying sword hit!"); playSound(hitGiantSound);
                     targetGiant.health = 0; // Defeat giant
                     targetGiant.hitEffect = 30; // Strong hit effect
                     shakeTime = 20; shakeIntensity = 8 * scaleFactor; // Big shake
                     spawnParticles(helperSequence.flyingSword.x, helperSequence.flyingSword.y, '#ff0000', 50); // Big particle burst
                     updateScoreDisplay();
                 }
             } else if (helperSequence.timer <= 0 && !targetGiant) { console.warn("Target giant missing helper seq phase 2"); helperSequence.active = false; helperSequence.phase = 0; showLevelCompleteScreen(); } break;
         case 3: // Giant defeated, pause/cleanup start
             if (helperSequence.timer <= 0) {
                 helperSequence.phase = 4; helperSequence.timer = 500; // Time for helper to exit
                 console.log("Giant defeated via helper.");
                 giants = []; // Remove giant from game state
                 showLevelCompleteScreen(); // Show win screen AFTER giant removal
             } break;
         case 4: // Helper exits
             if (!helperSequence.helper) break;
             const exitSpeed = 300 * scaleFactor * (deltaTime / 1000);
             helperSequence.helper.x -= exitSpeed; // Move left off screen
             if (helperSequence.timer <= 0 || helperSequence.helper.x < -helperSequence.helper.width) {
                 helperSequence.active = false; helperSequence.phase = 0; helperSequence.helper = null; helperSequence.flyingSword = null;
                 if (david) david.invulnerable = false; // Restore David
                 console.log("Helper sequence cleanup finished.");
             } break;
     }
 }

// --- Update Loop ---
function update(deltaTime) {
    if (!gameStarted || isTransitioning) { // Simplified check: if not started or transitioning, pause logic
        if (helperSequence.active && currentLevel === 1 && !gameOver) {
            updateHelperSequence(deltaTime || 16.67); // Still update helper if active during win transition
            updateParticles(); // Keep particles fading
        }
        return; // Don't run game logic if paused/over/transitioning
    }
    // Make sure gameOver check happens AFTER transitions potentially set gameStarted=false
     if (gameOver || gameWon) {
        if (helperSequence.active && currentLevel === 1) {
            updateHelperSequence(deltaTime || 16.67);
            updateParticles();
        }
        return;
    }


    deltaTime = deltaTime > 0 ? Math.min(deltaTime, 50) : 16.67; // Clamp delta time
     // If helper sequence is active (Level 1 end), only run that and particles
     if (helperSequence.active && currentLevel === 1) {
         updateHelperSequence(deltaTime);
         updateParticles();
         return; // Skip normal game logic during helper sequence
     }


    const config = levelConfigs[currentLevel];
    const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800);

    // David Movement
    const currentSpeed = david.speed;
    if (keys.left && david.x > 0) david.x -= currentSpeed;
    if (keys.right && david.x < canvas.width - david.width) david.x += currentSpeed;
    // Allow full Y movement in Level 1, restrict to lower half in Level 2
    if (currentLevel === 1) {
        if (keys.up && david.y > 0) david.y -= currentSpeed;
        if (keys.down && david.y < canvas.height - david.height) david.y += currentSpeed;
    } else { // Level 2 Y movement restriction
        if (keys.up && david.y > canvas.height * 0.55) david.y -= currentSpeed; // Don't go above midline
        if (keys.down && david.y < canvas.height - david.height) david.y += currentSpeed;
    }

    // Giant Movement & Actions
    giants.forEach((giant, gIndex) => {
        if (giant.speed > 0) { // Only move if speed is defined and positive
            giant.x += giant.speed * giant.directionX * scaleFactor;
            // Boundary checks and direction reversal
            if (giant.x <= 0) { giant.x = 0; giant.directionX = 1; }
            else if (giant.x >= canvas.width - giant.width) { giant.x = canvas.width - giant.width; giant.directionX = -1; }
        }
        if (giant.throwsSpears) {
            giantThrowSpear(giant); // Attempt to throw spear based on interval
        }
        if (giant.hitEffect > 0) giant.hitEffect--; // Decrement visual hit effect timer
    });

    // Level 2 Giant Collision (to prevent overlap)
    if (currentLevel === 2) {
        for (let i = 0; i < giants.length; i++) {
            for (let j = i + 1; j < giants.length; j++) {
                const g1 = giants[i]; const g2 = giants[j];
                if (checkCollision(g1, g2)) {
                    const overlap = (g1.x < g2.x) ? (g1.x + g1.width) - g2.x : (g2.x + g2.width) - g1.x;
                    const pushAmount = (overlap / 2) + 1; // Push slightly more than half
                    if (g1.x < g2.x) { g1.x -= pushAmount; g2.x += pushAmount; } else { g1.x += pushAmount; g2.x -= pushAmount; }
                    // Clamp positions to canvas boundaries
                    g1.x = Math.max(0, Math.min(g1.x, canvas.width - g1.width));
                    g2.x = Math.max(0, Math.min(g2.x, canvas.width - g2.width));
                    // Reverse direction on collision
                    g1.directionX *= -1; g2.directionX *= -1;
                }
            }
        }
    }

    // Update Swords
    swords = swords.filter((sword) => {
        sword.y -= sword.speed;
        if (sword.y + sword.height < 0) {
            return false; // Sword out of bounds
        }

        let hit = false;
        for (let gIndex = giants.length - 1; gIndex >= 0; gIndex--) {
            const giant = giants[gIndex];
            if (checkCollision(sword, giant)) {
                // --- START: Modified Level 1 Sword Hit Logic ---
                if (currentLevel === 1) {
                    if (giant.health > 1) { // Only damage if health is above 1
                        const healthBeforeHit = giant.health; // Store health before damage
                        giant.health -= sword.damage;
                        giant.hitEffect = 15; // Show hit effect
                        playSound(hitGiantSound);
                        spawnParticles(sword.x + sword.width / 2, sword.y, '#00ff99', 10);

                        // Clamp health to 1 if it dropped below
                        if (giant.health <= 1) {
                            giant.health = 1;
                             console.log("Giant health clamped to 1.");
                            // Set flag to trigger power-up ONLY if health JUST reached 1
                            if (healthBeforeHit > 1 && !specialPowerUp.active && !specialPowerUp.needsSpawning) {
                                console.log("Health reached 1, setting needsSpawning flag.");
                                specialPowerUp.needsSpawning = true; // Set flag for main loop to handle
                            }
                        }
                        updateScoreDisplay();
                    } else {
                        // Giant health is already 1, sword has no health effect
                        giant.hitEffect = 5; // Minor visual effect maybe
                        // playSound(hitGiantSound); // Optional: Play sound even if no damage?
                        spawnParticles(sword.x + sword.width / 2, sword.y, '#cccccc', 5); // Different particles?
                        console.log("Sword hit giant at 1 health, no damage dealt.");
                    }
                    hit = true; // Sword hit something, should be removed
                }
                // --- END: Modified Level 1 Sword Hit Logic ---

                // --- START: Level 2 Sword Hit Logic (Unchanged) ---
                else if (currentLevel === 2) {
                    giant.health -= sword.damage;
                    giant.hitEffect = 15;
                    shakeTime = 8;
                    shakeIntensity = 4 * scaleFactor;
                    spawnParticles(sword.x + sword.width / 2, sword.y, '#00ff99', 10);
                    playSound(hitGiantSound);
                    hit = true;
                    updateScoreDisplay();
                    if (giant.health <= 0) {
                        console.log(`Giant ${giant.name || giant.id} defeated!`);
                        spawnParticles(giant.x + giant.width/2, giant.y + giant.height/2, '#ff00cc', 30);
                        giants.splice(gIndex, 1);
                        if (giants.length === 0) {
                            console.log("All Lvl 2 giants defeated!");
                            showLevelCompleteScreen(); // Check win condition here
                            // Important: Need to break or handle loop carefully after splice
                            break; // Exit inner loop once level 2 is won
                        }
                    }
                }
                // --- END: Level 2 Sword Hit Logic ---

                if (hit) break; // Stop checking other giants if sword hit one
            } // End checkCollision
        } // End giant loop
         // Check win condition again in case splice happened inside loop
         if (currentLevel === 2 && giants.length === 0 && !gameWon) {
             showLevelCompleteScreen();
         }
        return !hit; // Keep sword if it didn't hit anything
    }); // End swords.filter

    // --- Power-up Spawning Logic ---
    if (currentLevel === 1 && specialPowerUp.needsSpawning && !specialPowerUp.active) {
        triggerSpecialPowerUp(); // Activate the power-up process
    }

    // Update Spears
    spears = spears.filter((spear) => {
        spear.y += spear.speed;
        if (spear.y > canvas.height) {
            return false; // Spear out of bounds
        }
        if (!david.invulnerable && checkCollision(spear, david)) {
            david.health -= spear.damage;
            david.hitEffect = 15;
            david.invulnerable = true;
            david.invulnerableTime = Date.now();
            playSound(hitDavidSound);

            // Update low health blink status
            lowHealthBlinkActive = (currentLevel === 1 && david.health <= 1);
             if (lowHealthBlinkActive && canvas) canvas.classList.add('low-health-blinking');
             else if (canvas) canvas.classList.remove('low-health-blinking');

            if (david.health <= 0) {
                const message = currentLevel === 1 ? "Ishbi-benob's spear found its mark!" : "A spear found its mark!";
                showGameOverScreen(message);
                return false; // Remove spear after hit and game over check
            }
            updateScoreDisplay();
            return false; // Remove spear after hitting David
        }
        return true; // Keep spear if no hit
    });


    // Other Updates
    // Invulnerability timer
    if (david.invulnerable && Date.now() - david.invulnerableTime > 1000) {
        david.invulnerable = false;
        // Re-check blinking status when invulnerability ends
        lowHealthBlinkActive = (currentLevel === 1 && david.health <= 1);
         if (!lowHealthBlinkActive && canvas) canvas.classList.remove('low-health-blinking');
    }
    if (david.hitEffect > 0) david.hitEffect--; // Decrement David's visual hit effect

    // Update active special power-up (Level 1 only)
    if (currentLevel === 1 && specialPowerUp.active) {
        updateSpecialPowerUp();
    }

    updateParticles(); // Update all particles
    if (shakeTime > 0) shakeTime--; // Decrement screen shake timer
}

function updateParticles() { particles.forEach((p, i) => { p.x += p.speedX; p.y += p.speedY; p.life--; p.alpha = p.life / 40; if (p.life <= 0) { particles.splice(i, 1); } }); }
function updateScoreDisplay() {
     if (!scoreDisplay) return; const config = levelConfigs[currentLevel]; if (config && config.scoreText) { const currentDavid = david || { health: 0, maxHealth: 0 }; const currentGiants = giants || []; scoreDisplay.innerHTML = config.scoreText(currentDavid, currentGiants); }
     else { scoreDisplay.textContent = `Level ${currentLevel} | David: ${david?.health || 0}/${david?.maxHealth || 0} | Giants: ${giants?.length || 0}`; }
}

// --- Drawing ---
function draw() {
    if (!ctx || !canvas) { console.error("Canvas context missing."); return; }
    try {
        ctx.save(); let offsetX = 0, offsetY = 0; if (shakeTime > 0 && shakeIntensity > 0) { offsetX = (Math.random() * 2 - 1) * shakeIntensity; offsetY = (Math.random() * 2 - 1) * shakeIntensity; ctx.translate(offsetX, offsetY); }
        ctx.fillStyle = '#0a0a1f'; ctx.fillRect(-offsetX, -offsetY, canvas.width, canvas.height); drawGrid();
        if (currentLevel === 2) { ctx.strokeStyle = '#00ff99'; ctx.lineWidth = 3 * (canvas.width / 600); ctx.shadowBlur = 15 * (canvas.width / 600); ctx.shadowColor = '#00ff99'; ctx.beginPath(); const lineY = canvas.height * 0.55; ctx.moveTo(0, lineY); ctx.lineTo(canvas.width, lineY); ctx.stroke(); ctx.shadowBlur = 0; }

        // Only draw game elements if the game is considered running
        if (gameStarted && !gameOver && !gameWon && !isTransitioning) {
            if (david) drawDavid();
            giants.forEach(drawGiant);
            swords.forEach(drawSword);
            spears.forEach(drawSpear);
            drawSpecialPowerUp(); // Handles its own visibility check
            drawHelperSequence(); // Handles its own active check
        }

        // Always draw particles if any exist (even during transitions)
        if (particles.length > 0) { drawParticles(); }

        ctx.restore();
    } catch (error) { console.error("Draw Error:", error); gameOver = true; } // Set gameOver to prevent further draw errors
}
function drawGrid() { const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); ctx.strokeStyle = 'rgba(0, 255, 153, 0.1)'; ctx.lineWidth = 1 * scaleFactor; const gridSize = 30 * scaleFactor; for (let x = 0; x < canvas.width; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); } for (let y = 0; y < canvas.height; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); } }
function drawDavid() {
     if (!david || !ctx) return; let isBlinking = lowHealthBlinkActive; let currentOpacity = 1.0;
     // Apply blinking or invulnerability opacity
     if (isBlinking) { currentOpacity = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 150)); ctx.globalAlpha = currentOpacity; }
     else if (david.invulnerable || david.hitEffect > 0) { currentOpacity = 0.5 + 0.5 * Math.abs(Math.sin(Date.now() / 100)); ctx.globalAlpha = currentOpacity; }

     // Draw David image or animation
     if (david.isThrowing && davidAnimationElement?.complete && davidAnimationElement.naturalWidth > 0) { ctx.drawImage(davidAnimationElement, david.x, david.y, david.width, david.height); }
     else if (davidImg?.complete && davidImg.naturalWidth > 0) { ctx.drawImage(davidImg, david.x, david.y, david.width, david.height); }
     else { ctx.fillStyle = '#00ccff'; ctx.fillRect(david.x, david.y, david.width, david.height); } // Fallback rectangle

     ctx.globalAlpha = 1.0; // Reset alpha for health bar
     // Draw Health Bar
     const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); // Recalculate if needed
     const healthBarHeight = 8 * scaleFactor; const healthBarY = david.y - healthBarHeight - 5 * scaleFactor;
     ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(david.x, healthBarY, david.width, healthBarHeight);
     const healthPercentage = david.maxHealth > 0 ? Math.max(0, david.health) / david.maxHealth : 0; const currentHealthWidth = david.width * healthPercentage; ctx.fillStyle = isBlinking ? '#ff0066' : '#00ccff'; // Use different color when blinking low health
     ctx.fillRect(david.x, healthBarY, currentHealthWidth, healthBarHeight);
     ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1 * scaleFactor; ctx.strokeRect(david.x, healthBarY, david.width, healthBarHeight);
}
function drawGiant(giant) {
     if (!giant || !ctx) return; const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800);
     if (giant.hitEffect > 0) { const glowIntensity = giant.hitEffect / 15; ctx.shadowBlur = (15 + 10 * glowIntensity) * scaleFactor; ctx.shadowColor = '#ff00cc'; } // Pink glow on hit
     if (goliathImg?.complete && goliathImg.naturalWidth > 0) { ctx.drawImage(goliathImg, giant.x, giant.y, giant.width, giant.height); }
     else { ctx.fillStyle = '#ff00cc'; ctx.fillRect(giant.x, giant.y, giant.width, giant.height); } // Fallback
     ctx.shadowBlur = 0; // Reset shadow

     // Draw Health Bar if giant has health
     if (giant.maxHealth > 0) {
         const healthBarHeight = 8 * scaleFactor; const healthBarY = giant.y - healthBarHeight - 5 * scaleFactor;
         ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(giant.x, healthBarY, giant.width, healthBarHeight);
         const healthPercentage = Math.max(0, giant.health) / giant.maxHealth; const currentHealthWidth = giant.width * healthPercentage; ctx.fillStyle = '#ff00cc'; // Pink health bar
         ctx.fillRect(giant.x, healthBarY, currentHealthWidth, healthBarHeight);
         ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1 * scaleFactor; ctx.strokeRect(giant.x, healthBarY, giant.width, healthBarHeight);
     }
}
function drawSword(sword) {
    if (!sword || !ctx) return; const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800);
    ctx.fillStyle = '#00ff99'; ctx.shadowBlur = 10 * scaleFactor; ctx.shadowColor = '#FFFFFF';
    const totalWidth = sword.width; const totalHeight = sword.height; const bladeWidth = totalWidth * 0.5; const bladeHeight = totalHeight * 0.75; const bladeX = sword.x + (totalWidth - bladeWidth) / 2; const bladeY = sword.y; const hiltWidth = totalWidth; const hiltHeight = totalHeight * 0.25; const hiltX = sword.x; const hiltY = sword.y + bladeHeight;
    ctx.fillRect(bladeX, bladeY, bladeWidth, bladeHeight); ctx.fillRect(hiltX, hiltY, hiltWidth, hiltHeight);
    ctx.shadowBlur = 0;
}
function drawSpear(spear) { if (!spear || !ctx) return; const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); ctx.fillStyle = '#ffcc00'; ctx.shadowBlur = 10 * scaleFactor; ctx.shadowColor = '#ffcc00'; ctx.fillRect(spear.x, spear.y, spear.width, spear.height); ctx.globalAlpha = 0.5; ctx.fillRect(spear.x, spear.y - spear.height * 0.8, spear.width, spear.height * 0.5); ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; }
function drawSpecialPowerUp() {
    if (!specialPowerUp.active || !specialPowerUp.visible || helperSequence.active) return; const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800); const baseGlow = 15 * scaleFactor; const pulseAmount = 10 * scaleFactor; const glow = baseGlow + pulseAmount * Math.abs(Math.sin(Date.now() / 200)); ctx.shadowBlur = glow; ctx.shadowColor = '#ffcc00';
    if (powerUpImg?.complete && powerUpImg.naturalWidth > 0) { ctx.drawImage(powerUpImg, specialPowerUp.x, specialPowerUp.y, specialPowerUp.width, specialPowerUp.height); } else { ctx.fillStyle = '#ffcc00'; ctx.fillRect(specialPowerUp.x, specialPowerUp.y, specialPowerUp.width, specialPowerUp.height); } ctx.shadowBlur = 0;
}
function drawParticles() { particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill(); }); ctx.globalAlpha = 1.0; }
function drawHelperSequence() {
     if (!helperSequence.active || gameOver || gameWon) return; const scaleFactor = Math.min(canvas.width / 600, canvas.height / 800);
     // Draw Helper (using David's image temporarily)
     if (helperSequence.helper && helperSequence.phase < 4) { ctx.shadowBlur = 15 * scaleFactor; ctx.shadowColor = '#00ccff'; if (davidImg?.complete && davidImg.naturalWidth > 0) { ctx.drawImage(davidImg, helperSequence.helper.x, helperSequence.helper.y, helperSequence.helper.width, helperSequence.helper.height); } else { ctx.fillStyle = '#00ccff'; ctx.fillRect(helperSequence.helper.x, helperSequence.helper.y, helperSequence.helper.width, helperSequence.helper.height); } ctx.shadowBlur = 0; }
     // Draw Flying Sword
     if (helperSequence.flyingSword && helperSequence.phase >= 2 && helperSequence.phase < 4) { ctx.save(); ctx.translate(helperSequence.flyingSword.x + helperSequence.flyingSword.width / 2, helperSequence.flyingSword.y + helperSequence.flyingSword.height / 2); ctx.rotate(helperSequence.flyingSword.angle); ctx.fillStyle = '#FFFFFF'; ctx.shadowBlur = 20 * scaleFactor; ctx.shadowColor = '#FFFF00'; ctx.fillRect(-helperSequence.flyingSword.width / 2, -helperSequence.flyingSword.height / 2, helperSequence.flyingSword.width, helperSequence.flyingSword.height); ctx.shadowBlur = 0; ctx.restore(); }
}

// --- Game Loop ---
let lastTime = 0;
function gameLoop(timestamp) {
     const deltaTime = timestamp - lastTime;
     lastTime = timestamp;
     update(deltaTime); // Pass actual delta time
     draw();
     requestAnimationFrame(gameLoop); // Continue the loop
 }

// --- Start ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game...");
    initializeGame();
});