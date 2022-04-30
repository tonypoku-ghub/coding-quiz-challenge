// Element variables
var mainSection = document.querySelector("main");
var startPageHeaderDiv = document.querySelector(".start-page-header");
var startButton = document.querySelector(".start-button");
var buttonsDiv = document.querySelector(".quiz-button-list");
var resultDiv = document.querySelector(".result");
var timer = document.querySelector(".timer");
var hr = document.querySelector("hr");
var saveInitials = document.querySelector(".save-initials");
var highScoresDiv = document.querySelector(".highscores");
var viewHighScore = document.querySelector("#view_high_score");
var clearHighScore = document.querySelector(".clear-highscore");
var backToGame = document.querySelector(".back-to-game");

// Variable initialization
var gameCountdownInternal = null;
var timeLimit = 60;
var activeQuizIndex = -1;
var quizDelay = 0.5; // Time for next question to display
var score = 0;
var storedScores = [];

// Listeners
startButton.addEventListener("click", start);
saveInitials.addEventListener("click", saveResults);
viewHighScore.addEventListener("click", displayHighScores);
clearHighScore.addEventListener("click", clearHighScoreFromLocalStorage);
backToGame.addEventListener("click", initGame);

// A quiz object
quiz = {
  question: "",
  choices: ["a", "b", "c", "d"],
  answerIndex: 2,
};

// An array of quiz objects
var quiz_list = [
  {
    question: "Inside which HTML element do we put the JavaScript?",
    choices: ["<script>", "<javascript>", "<js>", "<scripting>"],
    answerIndex: 0,
  },
  {
    question:
      "What is the correct JavaScript syntax to change the content of the HTML element below?",
    choices: [
      ' document.getElementById("p").innerHTML = "Hello World!";',
      ' #demo.innerHTML = "Hello World!";',
      ' #demo.innerHTML = "Hello World!";',
      ' document.getElementByName("p").innerHTML = "Hello World!";',
    ],
    answerIndex: 0,
  },
  {
    question: "Where is the correct place to insert a JavaScript?",
    choices: [
      "The <head> section",
      " Both the <head> section and the <body> section are correct",
      "The <body> section",
      "All of the above",
    ],
    answerIndex: 2,
  },
  {
    question:
      'What is the correct syntax for referring to an external script called "xxx.js"?',
    choices: [
      ' <script href="xxx.js">',
      '<script src="xxx.js">',
      ' <script name="xxx.js">',
      "None of the above",
    ],
    answerIndex: 1,
  },
  {
    question: "The external JavaScript file must contain the <script> tag.",
    choices: ["True", "False"],
    answerIndex: 1,
  },
  {
    question: 'How do you write "Hello World" in an alert box?',
    choices: [
      'alertBox("Hello World");',
      'msgBox("Hello World");',
      'msg("Hello World");',
      'alert("Hello World");',
    ],
    answerIndex: 1,
  },
];

function initGame() {
  activeQuizIndex = -1;
  score = 0;
  timeLeft = timeLimit;
  timer.textContent = timeLeft;

  storedScores = JSON.parse(localStorage.getItem("quiz-challenge-scores"));

  storedScores = storedScores === null ? [] : storedScores;

  var introParagraph = document.createElement("p");
  introParagraph.textContent =
    "Try to answer as many questions as quickly as possible before clock runs out. You have 60 secs. There will be a 5 sec runoff after each incorrect answer. Click start to begin. Good luck!";

  var initAreaIntro = document.querySelector(".initArea .intro");

  if (!initAreaIntro.hasChildNodes()) {
    initAreaIntro.appendChild(introParagraph);
  }

  if (gameCountdownInternal) {
    clearInterval(gameCountdownInternal);
  }

  // hide all other sections
  hideAllExcept(["initArea"]);
}

function start(e) {
  e.stopPropagation();

  countdown();

  // hide all other sections
  hideAllExcept(["qandaArea"]);

  displayNextQuestion();
}

function displayNextQuestion() {
  activeQuizIndex = activeQuizIndex++ < quiz_list.length ? activeQuizIndex : 0;

  // Remove previously displayed answer choices (if any)
  while (buttonsDiv.firstChild) {
    buttonsDiv.removeChild(buttonsDiv.firstChild);
  }

  var quiz_question = fetchQuiz(activeQuizIndex);

  document.querySelector(".qandaArea .question").textContent =
    quiz_question.question;

  quiz_question.choices.forEach((quiz) => {
    buttonsDiv.appendChild(quiz);
  });
}

function fetchQuiz(quizIndex) {
  var thisQuiz = quiz_list[quizIndex];
  var quizArr = [];

  for (var i = 0; i < thisQuiz.choices.length; i++) {
    var newButton = document.createElement("button");
    newButton.setAttribute("name", "ans-" + i);
    newButton.className += " quiz-button";
    newButton.textContent = (i + 1).toString() + ". " + thisQuiz.choices[i];
    newButton.addEventListener("click", processAnswer);
    quizArr.push(newButton);
  }

  return {
    question: thisQuiz.question,
    choices: quizArr,
    answerIndex: thisQuiz.answerIndex,
  };
}

// Timer that counts down
function countdown() {
  gameCountdownInternal = setInterval(function () {
    if (timeLeft > 0) {
      timer.textContent = timeLeft;

      timeLeft--;
    } else {
      timer.textContent = "";

      clearInterval(gameCountdownInternal);

      endQuiz();
    }
  }, 1000);
}

function processAnswer(e) {
  var delayAfterAnswer = quizDelay;

  e.stopPropagation();

  var elementIndex = e.target.name.split("-")[1]; // fetch the X in ans-X

  if (parseInt(elementIndex) === quiz_list[activeQuizIndex].answerIndex) {
    console.log(e.target.innerText);

    resultDiv.textContent = "Correct!";
    resultDiv.className = "result-correct";
    score++;
  } else {
    resultDiv.textContent = "Wrong! 5 sec penalty imposed";
    resultDiv.className = "result-wrong";

    timeLeft -= 5;
  }

  hr.style.display = "block";

  var resultInternal = setInterval(function () {
    if (delayAfterAnswer > 0) {
      delayAfterAnswer--;

      buttonsDiv.setAttribute("disabled", true);
    } else {
      resultDiv.textContent = "";
      resultDiv.className = "result-hide";
      hr.style.display = "none";
      buttonsDiv.setAttribute("disabled", false);

      if (activeQuizIndex === quiz_list.length - 1) {
        endQuiz();
      } else {
        displayNextQuestion();
      }

      clearInterval(resultInternal);
    }
  }, 1000);
}

function endQuiz() {
  clearInterval(gameCountdownInternal);
  // document.querySelector(".GameOverArea .heading").textContent = "Game Over";

  // Remove previously displayed answer choices (if any)
  while (buttonsDiv.firstChild) {
    buttonsDiv.removeChild(buttonsDiv.firstChild);
  }

  var scoreParagraph = document.createElement("p");
  scoreParagraph.style.textAlign = "center";
  scoreParagraph.textContent =
    "Your score is " + score + "/" + quiz_list.length;

  var scoreDiv = document.querySelector(".GameOverArea .score");
  //scoreDiv.removeChild(scoreDiv.firstChild);
  scoreDiv.appendChild(scoreParagraph);

  timer.textContent = "";

  // hide all other sections
  hideAllExcept(["GameOverArea"]);
}

function saveResults() {
  // get current ranking from global var
  var updatedScores = storedScores;
  // get initials from input box
  var initials = document.querySelector("#initials");

  if (!/^[a-z]/gi.test(initials.value)) {
    alert("Please enter valid initials");
    return;
  }

  // add new score
  updatedScores.push({ user_initial: initials.value, user_score: score });
  // sort based on value
  updatedScores.sort(function (a, b) {
    return b.user_score - a.user_score;
  });
  // Save to local storage
  localStorage.setItem("quiz-challenge-scores", JSON.stringify(updatedScores));
  //update global var
  storedScores = updatedScores;

  displayHighScores();
}

function displayHighScores() {
  // get ul
  var ol = document.querySelector(".ranked-scores");

  //cleanup existing list
  while (ol.firstChild) {
    ol.removeChild(ol.firstChild);
  }

  // add li for each score
  for (var i = 0; i < storedScores.length; i++) {
    var li = document.createElement("li");
    li.innerHTML =
      storedScores[i].user_initial + " - " + storedScores[i].user_score;
    ol.appendChild(li);
  }

  // hide all other sections
  hideAllExcept(["highscores"]);
}

// Loops through the main section and hides all elements except those specified in the params
function hideAllExcept(exception) {
  Array.from(mainSection.children).forEach((child) => {
    if (!exception.includes(child.className)) {
      child.style.display = "none";
    } else {
      child.style.display = "flex";
    }
  });
}

function clearHighScoreFromLocalStorage() {
  localStorage.removeItem("quiz-challenge-scores");

  storedScores = [];

  displayHighScores();
}

initGame();
