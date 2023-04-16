import BLOCKS from "./blocks.js";

// UI
const play = document.querySelector(".play > ul");
const timer = document.querySelector(".timer");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let maxScore;
let duration = 500;
let downInterval;
let tempMovingItem;

let timerId;
let time = 0;
let hour, min, sec;

const movingItem = {
    type: "",
    direction: 1,
    top: 0,
    left: 0,
};

// Functions
function init() {
    startTimer();
    tempMovingItem = { ...movingItem };
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine();
    }
    generateNewBlock();
}

init();

function prependNewLine() {
    const li = document.createElement("li");
        const ul = document.createElement("ul");
        for (let j = 0; j < GAME_COLS; j++) {
            const matrix = document.createElement("li");
            ul.prepend(matrix);
        }
        li.prepend(ul);
        play.prepend(li);
}

function renderBlocks(moveType="") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=> {
        moving.classList.remove(type, "moving");
    })

    BLOCKS[type][direction].some(block=> {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = play.childNodes[y] ? play.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = { ...movingItem };
            if (moveType === "retry") {
                clearInterval(downInterval);
                showGameOverText();
            }
            setTimeout(()=> {
                renderBlocks("retry");
                if (moveType === "top") {
                    seizeBlock();
                }
            }, 0);
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=> {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
    generateNewBlock();
}

function checkMatch() {
    const childNodes = play.childNodes;

    childNodes.forEach(child=> {
        let matched = true;
        child.children[0].childNodes.forEach(li=> {
            if (!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if (matched) {
            child.remove();
            prependNewLine();

            score += 1;
            scoreDisplay.innerText = score;

            if (score > 3) {
                duration = 450;
            } else if (score > 6) {
                duration = 400;
            } else if (score > 9) {
                duration = 350;
            } else if (score > 12) {
                duration = 300;
            } else if (score > 15) {
                duration = 250;
            } else if (score > 18) {
                duration = 200;
            }
        }
    })
}

function generateNewBlock() {

    clearInterval(downInterval);
    downInterval = setInterval(()=> {
        moveBlock("top", 1);
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * (blockArray.length));

    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderBlocks();
}

function checkEmpty(target) {
    if (!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(()=> {
        moveBlock("top", 1);
    }, 10)
}

function showGameOverText() {
    gameText.style.display = "flex";
    saveRecord();
}

function printTime() {
    time++
    timer.innerText = getTimeFormatString();
}

function startTimer() {
    printTime();
    stopTimer();
    timerId = setTimeout(startTimer, 1000);
}

function stopTimer() {
    if (timerId != null) {
        clearTimeout(timerId);
    }
}

function saveRecord() {
    maxScore = localStorage.getItem("maxScore");
    if (maxScore === undefined) {
        localStorage.setItem("maxScore", score);
        return
    }
    if (score > maxScore) {
        localStorage.setItem("maxScore", score);
    }
}

function showRecord() {
    const clientRecord = document.querySelector(".best-score");

    maxScore = localStorage.getItem("maxScore");
    clientRecord.innerText = maxScore;
}

function getTimeFormatString() {
    hour = parseInt(String(time / (60*60)));
    min = parseInt(String((time - (hour * 60 * 60)) / 60));
    sec = time % 60;

    return String(hour).padStart(2, '0') + ":" + String(min).padStart(2, '0') + ":" + String(sec).padStart(2, '0');
}

document.addEventListener("keydown", e=> {
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection()
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
})

restartButton.addEventListener("click", ()=> {
    stopTimer();
    play.innerHTML = "";
    gameText.style.display = "none";
    score = 0;
    scoreDisplay.innerText = score;
    time = 0;
    timer.innerText = "00:00:00";
    duration = 500;
    init();
    showRecord();
})