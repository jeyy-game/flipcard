// ==================================
// FLIP & MATCH v2.1
// AUTO SAVE PROGRESS
// ==================================

// GAME SETTINGS

const allEmojis = [
  "🍓", "🍰", "🐰", "🌷", "🧸",
  "🍒", "🐸", "🌈", "🍄", "🦋",
  "🐱", "🍉", "⭐", "🎀", "🐻",
  "🌻", "🍩", "🦄", "🍪", "🐼"
];

const difficultyStart = {
  easy: 3,
  normal: 6,
  hard: 10
};

const STORAGE_KEY = "flipGameSaveV21";

// ==================================
// LOAD SAVED DATA
// ==================================

function loadSave() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (!saved || typeof saved !== "object") {
      throw new Error("Invalid save");
    }

    return {
      progress: {
        easy: Math.max(1, Number(saved.progress?.easy) || 1),
        normal: Math.max(1, Number(saved.progress?.normal) || 1),
        hard: Math.max(1, Number(saved.progress?.hard) || 1)
      },
      mode: ["easy", "normal", "hard"].includes(saved.mode)
        ? saved.mode
        : "easy"
    };

  } catch {
    return {
      progress: {
        easy: 1,
        normal: 1,
        hard: 1
      },
      mode: "easy"
    };
  }
}

let savedData = loadSave();

let progress = savedData.progress;
let currentLevel = savedData.mode;
let currentLevelNumber = progress[currentLevel];
let emojis = [];

function saveGame() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      progress,
      mode: currentLevel
    })
  );
}

// ==================================
// HTML ELEMENTS
// ==================================

const board = document.getElementById("gameBoard");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
const levelDisplay = document.getElementById("levelDisplay");

const retryBtn = document.getElementById("retryBtn");
const winScreen = document.getElementById("winScreen");
const finalTime = document.getElementById("finalTime");
const finalMoves = document.getElementById("finalMoves");
const nextLevelBtn = document.getElementById("nextLevelBtn");

const levelButtons = document.querySelectorAll(".level-btn");

const musicBtn = document.getElementById("musicBtn");
const backgroundMusic = document.getElementById("backgroundMusic");

// ==================================
// GAME VARIABLES
// ==================================

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matches = 0;
let seconds = 0;

let timerInterval = null;
let started = false;

// ==================================
// SHUFFLE
// ==================================

function shuffle(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] =
      [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// ==================================
// TIMER
// ==================================

function startTimer() {
  if (started) return;

  started = true;

  timerInterval = setInterval(() => {
    seconds++;

    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    timerDisplay.textContent =
      String(minutes).padStart(2, "0") + ":" +
      String(remaining).padStart(2, "0");

  }, 1000);
}

// ==================================
// CREATE CARDS
// ==================================

function createCards() {
  board.innerHTML = "";

  const cards = shuffle([...emojis, ...emojis]);

  cards.forEach(emoji => {
    const card = document.createElement("div");

    card.classList.add("card");

    card.innerHTML = `
      <div class="card-face card-front">✿</div>
      <div class="card-face card-back">${emoji}</div>
    `;

    card.addEventListener("click", () => flipCard(card));

    board.appendChild(card);
  });
}

// ==================================
// FLIP CARDS
// ==================================

function flipCard(card) {
  if (
    lockBoard ||
    card.classList.contains("matched")
  ) return;

  if (card === firstCard) {
    card.classList.remove("flipped");
    firstCard = null;
    return;
  }

  if (card === secondCard) {
    card.classList.remove("flipped");
    secondCard = null;
    return;
  }

  if (card.classList.contains("flipped")) return;

  startTimer();

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;

  moves++;
  movesDisplay.textContent = moves;

  checkMatch();
}

// ==================================
// CHECK MATCH
// ==================================

function checkMatch() {
  const firstEmoji =
    firstCard.querySelector(".card-back").textContent;

  const secondEmoji =
    secondCard.querySelector(".card-back").textContent;

  if (firstEmoji === secondEmoji) {

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matches++;

    matchesDisplay.textContent =
      `${matches}/${emojis.length}`;

    resetTurn();

    if (matches === emojis.length) {
      lockBoard = true;

      setTimeout(showWinScreen, 500);
    }

  } else {

    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");

      resetTurn();

    }, 900);
  }
}

// ==================================
// RESET TURN
// ==================================

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// ==================================
// WIN SCREEN
// ==================================

function showWinScreen() {
  clearInterval(timerInterval);

  finalTime.textContent = timerDisplay.textContent;
  finalMoves.textContent = moves;

  winScreen.classList.add("show");
}

// ==================================
// DIFFICULTY BUTTONS
// ==================================

levelButtons.forEach(button => {
  button.addEventListener("click", () => {

    currentLevel = button.dataset.level;

    currentLevelNumber = progress[currentLevel];

    saveGame();

    updateDifficultyButtons();

    restartGame();
  });
});

function updateDifficultyButtons() {
  levelButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.level === currentLevel
    );
  });
}

// ==================================
// RESTART GAME
// ==================================

function restartGame() {
  clearInterval(timerInterval);

  firstCard = null;
  secondCard = null;
  lockBoard = false;

  moves = 0;
  matches = 0;
  seconds = 0;
  started = false;

  currentLevelNumber = progress[currentLevel];

  const pairCount = Math.min(
    difficultyStart[currentLevel] +
    currentLevelNumber - 1,
    allEmojis.length
  );

  emojis = allEmojis.slice(0, pairCount);

  timerDisplay.textContent = "00:00";
  movesDisplay.textContent = "0";
  matchesDisplay.textContent = `0/${emojis.length}`;

  levelDisplay.textContent =
    `${currentLevel.toUpperCase()} · Level ${currentLevelNumber}`;

  winScreen.classList.remove("show");

  updateDifficultyButtons();

  createCards();
}

// ==================================
// NEXT LEVEL
// ==================================

nextLevelBtn.addEventListener("click", () => {

  progress[currentLevel]++;

  saveGame();

  restartGame();
});

// ==================================
// RETRY
// ==================================

retryBtn.addEventListener("click", () => {
  restartGame();
});

// ==================================
// MUSIC
// ==================================

musicBtn.addEventListener("click", async () => {

  if (backgroundMusic.paused) {

    try {
      await backgroundMusic.play();

      musicBtn.textContent = "♫ Music: ON";

    } catch {
      musicBtn.textContent = "♫ Add music.mp3";
    }

  } else {

    backgroundMusic.pause();

    musicBtn.textContent = "♫ Music: OFF";
  }
});

// ==================================
// START GAME
// ==================================

updateDifficultyButtons();
restartGame();