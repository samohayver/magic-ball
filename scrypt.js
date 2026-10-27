"use strict";
const ANSWERS = [
  "Так",
  "Ні",
  "Безперечно",
  "Дуже сумнівно",
  "Без жодних сумнівів",
  "Перспективи хороші"
];

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }

    html, body { height: 100%; margin: 0; }

    body {
      background: #050a1e;
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
    }

    .app {
      position: relative;
      width: min(100%, 640px);
      min-height: min(100%, 720px);
      padding: clamp(14px, 4vw, 32px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(10px, 2.5vh, 22px);
      border: 2px solid transparent;
      border-radius: 6px;
      background:
        linear-gradient(#050a1e, #050a1e) padding-box,
        linear-gradient(135deg, #00c8ff 0%, #050a1e 45%, #7dff00 100%) border-box;
    }

    .question-wrap { width: 100%; max-width: 460px; text-align: center; }

    .question {
      width: 100%;
      padding: 12px 18px;
      font-size: clamp(15px, 4vw, 20px);
      text-align: center;
      color: #111;
      background: #efe0ff;
      border: 2px solid transparent;
      border-radius: 22px;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    .question:focus { box-shadow: 0 0 0 3px rgba(200, 120, 255, .5); }
    .question.invalid { border-color: #ff4d6d; box-shadow: 0 0 0 3px rgba(255, 77, 109, .35); }

    .error {
      min-height: 1.4em;
      margin-top: 6px;
      font-size: clamp(12px, 3.2vw, 14px);
      color: #ff7a90;
    }

    .ball-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ball {
      position: relative;
      width: min(78vw, 56vh, 440px);
      aspect-ratio: 1;
      border-radius: 50%;
      border: 4px solid #0a0a22;
      cursor: pointer;
      overflow: hidden;
      background:
        radial-gradient(circle at 30% 70%, rgba(255, 190, 90, .9), transparent 30%),
        radial-gradient(circle at 70% 55%, rgba(255, 120, 200, .85), transparent 32%),
        radial-gradient(circle at 50% 30%, rgba(255, 150, 120, .8), transparent 28%),
        radial-gradient(circle at 45% 75%, rgba(80, 230, 210, .8), transparent 30%),
        radial-gradient(circle at 25% 35%, rgba(150, 110, 255, .8), transparent 35%),
        radial-gradient(circle, #6a3bb0 0%, #2b1a5e 80%);
      box-shadow:
        0 0 30px 6px rgba(220, 120, 255, .55),
        inset 0 0 40px rgba(0, 0, 0, .65);
      transition: transform .2s;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .ball:hover { transform: scale(1.015); }
    .ball:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }

    /* блик на кулі */
    .ball::before {
      content: "";
      position: absolute;
      top: 4%; left: 8%;
      width: 40%; height: 28%;
      border-radius: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,0));
      transform: rotate(-25deg);
      pointer-events: none;
    }
    .ball::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%);
      pointer-events: none;
    }

    .answer {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18%;
      text-align: center;
      z-index: 2;
      font-size: clamp(20px, 6vw, 38px);
      font-weight: 600;
      line-height: 1.15;
      color: #fff;
      -webkit-text-stroke: 1px #5a2a9a;
      text-shadow: 0 0 8px rgba(120, 60, 220, .9);
      opacity: 0;
      transition: opacity .6s;
      pointer-events: none;
    }
    .answer.show { opacity: 1; }

    .hint {
      color: #9aa3c7;
      font-size: clamp(12px, 3.2vw, 14px);
      text-align: center;
    }

    .shake { animation: shake .7s cubic-bezier(.36,.07,.19,.97); }
    @keyframes shake {
      10%, 90% { transform: translate(-2px, 0) rotate(-1deg); }
      20%, 80% { transform: translate(4px, 2px) rotate(2deg); }
      30%, 50%, 70% { transform: translate(-8px, -2px) rotate(-3deg); }
      40%, 60% { transform: translate(8px, 2px) rotate(3deg); }
    }

    @media (max-width: 480px) {
      body { padding: 6px; }
      .ball { width: min(86vw, 52vh); }
    }
    @media (max-height: 520px) and (orientation: landscape) {
      .app { flex-direction: row; flex-wrap: wrap; justify-content: center; }
      .question-wrap { flex: 1 1 100%; }
      .ball { width: min(50vh, 60vw); }
    }
    @media (prefers-reduced-motion: reduce) {
      .shake { animation: none; }
      .ball, .answer { transition: none; }
    }
  `;
  document.head.appendChild(style);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function buildPage() {
  const app = el("main", "app");

  const questionWrap = el("div", "question-wrap");
  const input = el("input", "question");
  input.type = "text";
  input.placeholder = "Постав своє запитання...";
  input.maxLength = 120;
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Ваше запитання");
  const error = el("div", "error");
  error.setAttribute("role", "alert");
  questionWrap.append(input, error);

  const ballWrap = el("div", "ball-wrap");
  const ball = el("div", "ball");
  ball.tabIndex = 0;
  ball.setAttribute("role", "button");
  ball.setAttribute("aria-label", "Магічна куля — натисни, щоб отримати відповідь");
  const answer = el("div", "answer");
  answer.setAttribute("aria-live", "polite");
  ball.appendChild(answer);
  ballWrap.appendChild(ball);

  const hint = el("p", "hint", "Введи запитання та натисни на кулю (або Enter)");

  app.append(questionWrap, ballWrap, hint);
  document.body.appendChild(app);

  return { input, error, ball, answer };
}

function validate(value) {
  const text = value.trim();

  if (text.length === 0) {
    return "Спочатку введи запитання!";
  }
  if (text.length < 3) {
    return "Запитання занадто коротке (мінімум 3 символи).";
  }
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(text)) {
    return "Запитання має містити літери.";
  }
  if (!text.endsWith("?")) {
    return "Запитання має закінчуватися знаком «?».";
  }
  return null;
}

function init() {
  injectStyles();
  const { input, error, ball, answer } = buildPage();

  let busy = false;
  let lastIndex = -1;

  function showError(message) {
    error.textContent = message;
    input.classList.add("invalid");
    input.focus();
  }

  function clearError() {
    error.textContent = "";
    input.classList.remove("invalid");
  }

  function randomAnswer() {
    let i;
    do {
      i = Math.floor(Math.random() * ANSWERS.length);
    } while (i === lastIndex);
    lastIndex = i;
    return ANSWERS[i];
  }

  function ask() {
    if (busy) return;

    const message = validate(input.value);
    if (message) {
      showError(message);
      return;
    }
    clearError();

    busy = true;
    answer.classList.remove("show");
    ball.classList.remove("shake");
    void ball.offsetWidth;
    ball.classList.add("shake");

    setTimeout(() => {
      answer.textContent = randomAnswer();
      answer.classList.add("show");
      ball.classList.remove("shake");
      busy = false;
    }, 700);
  }

  ball.addEventListener("click", ask);
  ball.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ask();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });
  input.addEventListener("input", () => {
    clearError();
    answer.classList.remove("show");
  });
}

document.addEventListener("DOMContentLoaded", init);