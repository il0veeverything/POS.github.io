let currentWordIndex = 0;
let words = [];
let correctAnswers = 0; // 正解数をカウントする変数を追加
let gameStartTime; // ゲームが開始された時点のタイムスタンプ
let score = 0;
let startTime; // ゲームの開始時間
let timerInterval; // タイマーのインターバルID
let elapsedTime = 0; // 経過時間

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-button').addEventListener('click', startGame);
});


function startGame() {
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('word-container').style.display = 'block';
    loadWords();
    currentWordIndex = 0;
    gameStartTime = Date.now(); // ゲームが開始された時点のタイムスタンプを取得
}

function loadWords() {
    fetch('words.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            words = parseCSV(data);
            shuffleArray(words); // 単語リストをシャッフル
            displayNextWord(); // 最初の問題を表示
            initializeDragAndDrop();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function displayNextWord() {
    const wordDisplay = document.getElementById('word-display');
    const optionsContainer = document.getElementById('options');
    const resultMessage = document.getElementById('result-message');
    const nextButton = document.getElementById('next-button');
    const remainingQuestions = document.getElementById('remaining-questions');
    const accuracyDisplay = document.getElementById('accuracy');

    resultMessage.textContent = '';
    resultMessage.style.display = 'none';
    nextButton.style.display = 'none';
    optionsContainer.innerHTML = '';
    remainingQuestions.textContent = `Remaining questions: ${10 - currentWordIndex}`;
    

    if (currentWordIndex >= 10) {
        displayCompletionMessage();
        currentWordIndex = 0; // 問題が終了したら currentWordIndex をリセットする
        nextButton.style.display = 'none';
        return;
    }

    const wordObj = words[currentWordIndex];
    const word = wordObj.word;
    const partOfSpeech = wordObj.part_of_speech;
    const verbType = wordObj.verbType;

    wordDisplay.textContent = word;

    const options = [
        'Verb', 'Noun', 'Adjective', 'Adverb', 'Pronoun', 
        'Auxiliary Verb', 'Preposition', 'Article', 
        'Interjection', 'Conjunction'
    ];

    options.forEach(option => {
        const optionElement = document.createElement('button');
        optionElement.classList.add('option');
        optionElement.classList.add(partOfSpeech); 
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => checkAnswer(option, partOfSpeech, verbType));
        optionsContainer.appendChild(optionElement);
    });
    
    remainingQuestions.textContent = `Remaining questions: ${10 - currentWordIndex }`; // 現在の問題も含める

    const accuracy = (correctAnswers / currentWordIndex) * 100 || 0;
    accuracyDisplay.textContent = `Accuracy: ${accuracy.toFixed(2)}%`;

    currentWordIndex++; // 問題が表示された後にインデックスを増やす
}

function searchTranslation() {
            const wordToTranslate = document.getElementById('word-display').textContent;
            const searchQuery = encodeURIComponent(wordToTranslate+' translate');
            const searchURL = `https://www.google.com/search?q=${searchQuery}`;
            window.open(searchURL, '_blank');
        }



function checkAnswer(selectedOption, partOfSpeech, verbType) {
    const resultMessage = document.getElementById('result-message');
    const nextButton = document.getElementById('next-button');
    const correctOption = getCorrectOption(partOfSpeech, verbType);
    const options = document.querySelectorAll('.option');

    options.forEach(option => {
        if (option.textContent === correctOption) {
            option.classList.add('correct-answer');
        } else if (option.textContent === selectedOption) {
            option.classList.add('wrong-answer');
        } else {
            option.style.backgroundColor = '#ccc';
            option.disabled = true;
        }
        option.disabled = true;
    });

    if (selectedOption === correctOption) {
        resultMessage.textContent = 'Correct!';
        correctAnswers++; // 正解時に正解数をインクリメント
    } else {
        resultMessage.textContent = 'Incorrect! The correct answer is: ' + correctOption;
    }
    resultMessage.style.display = 'block';
    nextButton.style.display = 'block';
}

function displayCompletionMessage() {
    const gameContainer = document.querySelector('.game-container');
    const completionMessage = document.createElement('div');
    completionMessage.textContent = 'Congratulations! You have completed the game.';
    completionMessage.classList.add('completion-message');
    gameContainer.appendChild(completionMessage);

    // ゲームが終了した時点のタイムスタンプを取得
    const gameEndTime = Date.now();
    // ゲームの終了までにかかった時間を計算し、秒単位に変換して小数第2位まで表示
    const elapsedTimeSeconds = ((gameEndTime - gameStartTime) / 1000).toFixed(2);
    const timeMessage = document.createElement('div');
    timeMessage.textContent = `Time taken: ${elapsedTimeSeconds} seconds`;
    gameContainer.appendChild(timeMessage);

    const accuracyDisplay = document.createElement('div');
    const accuracy = (correctAnswers / 50) * 100 || 0;
    accuracyDisplay.textContent = `Accuracy: ${accuracy.toFixed(2)}%`;
    gameContainer.appendChild(accuracyDisplay);

    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    playAgainButton.classList.add('big-button');
    playAgainButton.addEventListener('click', () => {
        resetGame();
    });
    gameContainer.appendChild(playAgainButton);

    const mistakesButton = document.createElement('button');
    mistakesButton.textContent = 'View Mistakes';
    mistakesButton.classList.add('big-button');
    mistakesButton.addEventListener('click', () => {
        displayMistakes();
    });
    gameContainer.appendChild(mistakesButton);
}

function resetGame() {
    currentWordIndex = 0;
    correctAnswers = 0;
    loadWords();
}

function displayMistakes() {
    const gameContainer = document.querySelector('.game-container');
    const mistakesContainer = document.createElement('div');
    mistakesContainer.classList.add('mistakes-container');

    words.forEach((wordObj, index) => {
        if (!checkAnswer(wordObj.part_of_speech, wordObj.verbType)) {
            const mistakeItem = document.createElement('div');
            mistakeItem.textContent = `${index + 1}. ${wordObj.word}`;
            mistakesContainer.appendChild(mistakeItem);
        }
    });

    if (mistakesContainer.children.length === 0) {
        const noMistakesMessage = document.createElement('div');
        noMistakesMessage.textContent = 'No mistakes made!';
        mistakesContainer.appendChild(noMistakesMessage);
    }

    gameContainer.appendChild(mistakesContainer);
}

// その他の関数や変数は同じままです


function parseCSV(data) {
    const rows = data.trim().split('\n'); // 改行文字を除去してから行を分割
    return rows.map(row => {
        const [word, partOfSpeech] = row.split(',').map(item => item.trim());
        return { word, part_of_speech: partOfSpeech };
    });
}

function getAllOptions(partOfSpeech, verbType) {
    let options = [
        'Verb', 'Noun', 'Adjective', 'Adverb', 'Pronoun', 
        'Auxiliary Verb', 'Preposition', 'Article', 
        'Interjection', 'Conjunction'
    ];
    return options;
}





function getCorrectOption(partOfSpeech, verbType) {
    if (partOfSpeech === 'noun') {
        return 'Noun';
    } else if (partOfSpeech === 'verb') {
        return 'Verb';
    } else if (partOfSpeech === 'adjective') {
        return 'Adjective';
    } else if (partOfSpeech === 'adverb') {
        return 'Adverb';
    } else if (partOfSpeech === 'pronoun') {
        return 'Pronoun';
    } else if (partOfSpeech === 'auxiliaryverb') {
        return 'Auxiliary Verb';
    } else if (partOfSpeech === 'preposition') {
        return 'Preposition';
    } else if (partOfSpeech === 'article') {
        return 'Article';
    } else if (partOfSpeech === 'interjection') {
        return 'Interjection';
    } else if (partOfSpeech === 'conjunction') {
        return 'Conjunction';
    }
}

function initializeDragAndDrop() {
    const words = document.querySelectorAll('.word');
    const dropZones = document.querySelectorAll('.drop-zone');
    const nextButton = document.getElementById('next-button');

    words.forEach(word => {
        word.addEventListener('dragstart', dragStart);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('dragleave', dragLeave);
        zone.addEventListener('drop', drop);
    });

    nextButton.addEventListener('click', () => {
        if (currentWordIndex < 50) {
            displayNextWord();
        } else {
            displayCompletionMessage();
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function calculateScore(accuracy, timeTaken) {
    // スコアの計算方法を任意の方法で定義することができます。
    // この例では、正答率と時間からスコアを計算します。
    // 例えば、正答率が高いほどスコアが上がり、時間が短いほどスコアが上がるようにしています。
    const baseScore = accuracy * 10; // 正答率に応じて基本スコアを設定
    const timeMultiplier = 10000 / timeTaken; // 10,000を時間で割って時間の影響度を計算
    score = Math.floor(baseScore * timeMultiplier); // 基本スコアと時間の影響度を掛け合わせる
}

function displayScore() {
    const gameContainer = document.querySelector('.game-container');
    const scoreDisplay = document.createElement('div');
    
    scoreDisplay.textContent = `Score: ${score}`;
    scoreDisplay.classList.add('score');
    gameContainer.appendChild(scoreDisplay);
}

function displayCompletionMessage() {
    const gameContainer = document.querySelector('.game-container');
    const completionMessage = document.createElement('div');
    const restartButton = document.createElement('button');
    const wrongAnswersList = document.createElement('ul');

    completionMessage.textContent = `Congratulations! You have completed the game. Accuracy: ${(correctAnswers / 10 * 100).toFixed(2)}%`;
    restartButton.textContent = 'Play Again';
    restartButton.addEventListener('click', () => {
        gameContainer.removeChild(completionMessage);
        gameContainer.removeChild(restartButton);
        gameContainer.removeChild(wrongAnswersList);
        gameContainer.removeChild(scoreDisplay); // スコア表示を削除
        startGame();
    });

    // Display wrong answers list
    wrongAnswersList.textContent = 'Wrong Answers:';
    wrongAnswersList.style.listStyleType = 'none';
    words.forEach((word, index) => {
        if (index >= 10) return; // Only consider first 10 questions
        if (!checkAnswer(word.part_of_speech, word.verbType)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${word.word} (${word.part_of_speech})`;
            wrongAnswersList.appendChild(listItem);
        }
    });

    gameContainer.appendChild(completionMessage);
    gameContainer.appendChild(restartButton);
    gameContainer.appendChild(wrongAnswersList);
    displayScore(); // スコアを表示
}
function startTimer() {
    startTime = Date.now(); // 現在の時刻を開始時間として設定

    // タイマーを開始して、経過時間を更新する
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        displayElapsedTime();
    }, 100); // 0.1秒ごとに経過時間を更新
}

function displayElapsedTime() {
    const elapsedTimeDisplay = document.getElementById('elapsed-time');
    const seconds = Math.floor(elapsedTime / 1000); // ミリ秒を秒に変換
    const formattedTime = seconds.toFixed(2); // フォーマットされた時間を取得

    // 経過時間を表示
    elapsedTimeDisplay.textContent = `Elapsed Time: ${formattedTime} seconds`;
}

function stopTimer() {
    clearInterval(timerInterval); // タイマーを停止
}

function resetTimer() {
    clearInterval(timerInterval); // タイマーを停止
    elapsedTime = 0; // 経過時間をリセット
    displayElapsedTime(); // 経過時間を表示
}


