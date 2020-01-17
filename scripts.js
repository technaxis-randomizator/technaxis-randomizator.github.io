let players = [];
let initPlayers = [];

const timers = [null, null, null];

// размер барабана (в пикселях)
let size;

// сколько будет крутиться барабан (в секундах)
let speedSecondRevert = 10;
let speedSecond = 20;

let fontSize;
let fontPaddingLeft;

let activeSettings = true;

let canvas;
let isGameBegan = false;

let transitionRevert;
let transition;

let buttonInitElem;
let settingsElem;
let containerWrapperElem;
let containerElem;
let playersElem;
let playElem;

let inputSizeElem;
let inputFontSizeElem;
let inputFontPaddingLeft;

let audioFight = new Audio();
audioFight.preload = 'auto';
audioFight.src = './fight.mp3';
audioFight.volume = 0.5;

let audioMusic = new Audio();
audioMusic.preload = 'auto';
audioMusic.src = './music.mp3';
// audioMusic.volume = 0.5;

window.onload = function () {
  buttonInitElem = document.getElementById("button-init");
  settingsElem = document.getElementById("settings");
  containerElem = document.getElementById("container");
  containerWrapperElem = document.getElementById("container-wrapper");
  playersElem = document.getElementById("players");
  playElem = document.getElementById("play");

  inputSizeElem = document.querySelector('[data-size]');
  inputFontSizeElem = document.querySelector('[data-font-size]');
  inputFontPaddingLeft = document.querySelector('[data-font-padding-left]');

  document.getElementById('btm-reset-local-storage').onclick = () => {
    localStorage.clear();
    location.reload();
  };

  const storageSettings = JSON.parse(localStorage.getItem('settings'));

  if (storageSettings) {
    playersElem.innerHTML = '';
    storageSettings.players.forEach(player => addPlayer(player.name, player.count, player.color));

    inputSizeElem.value = storageSettings.size;
    inputFontSizeElem.value = storageSettings.fontSize;
    inputFontPaddingLeft.value = storageSettings.fontPaddingLeft;
  } else {
    playersElem.innerHTML =
        `<div class="setting-field player">
        <label>Имя <input type="text" value="Айнур" data-name></label>
        <label>Количество <input type="number" class="input-count" value="1" data-count></label>
        <label>Цвет <input type="color" value="#ff4545" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>

      <div class="setting-field player">
        <label>Имя <input type="text" value="Дима" data-name></label>
        <label>Количество <input type="number" class="input-count" value="1" data-count></label>
        <label>Цвет <input type="color" value="#6145ff" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>

      <div class="setting-field player">
        <label>Имя <input type="text" value="Булат" data-name></label>
        <label>Количество <input type="number" class="input-count" value="1" data-count></label>
        <label>Цвет <input type="color" value="#2295c7" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>

      <div class="setting-field player">
        <label>Имя <input type="text" value="Динар" data-name></label>
        <label>Количество <input type="number" class="input-count" value="1" data-count></label>
        <label>Цвет <input type="color" value="#22c76c" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>

      <div class="setting-field player">
        <label>Имя <input type="text" value="Лиза" data-name></label>
        <label>Количество <input type="number" class="input-count" value="1" data-count></label>
        <label>Цвет <input type="color" value="#da7de3" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>

      <div class="setting-field player">
        <label>Имя <input type="text" value="Никита" data-name></label>
        <label>Количество <input type="number" class="input-count" value="1" data-count></label>
        <label>Цвет <input type="color" value="#c7c722" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>`
  }

  playElem.onclick = game;

  document.addEventListener('click', event => {
    if (event.target.className === 'btn-remove-player') {
      removePlayer(event.target);
    }
  });

  document.getElementById('btn-add-player').onclick = () => addPlayer();

  buttonInitElem.onclick = () => {
    if (activeSettings) {
      saveSettings();
      init();
      activeSettings = false;
      buttonInitElem.innerHTML = 'SETTINGS';
      buttonInitElem.classList.add('settings-close');
      settingsElem.classList.add('close');
      containerElem.classList.add('open');
      containerWrapperElem.classList.add('open');
    } else {
      timers.forEach(timer => clearTimeout(timer));
      isGameBegan = false;
      canvas.style.transition = 'none';
      canvas.style.transform = 'rotate(0deg)';

      audioFight.pause();
      audioFight.currentTime = 0;

      audioMusic.pause();
      audioMusic.currentTime = 0;

      activeSettings = true;
      buttonInitElem.innerHTML = 'SAVE and INIT';
      buttonInitElem.classList.remove('settings-close');
      settingsElem.classList.remove('close');
      containerElem.classList.remove('open');
      containerWrapperElem.classList.remove('open');
      containerElem.style.height = 0;
      containerWrapperElem.classList.remove('game');
    }
  }
};

function removePlayer(btn) {
  btn.parentNode.remove();
}

function addPlayer(name, count, color) {
  playersElem.innerHTML +=
      `<div class="setting-field player">
        <label>Имя <input type="text" value="${ name || 'Введите имя' }" data-name></label>
        <label>Количество <input type="number" class="input-count" value="${ count || 0 }" data-count></label>
        <label>Цвет <input type="color" value="${ color || '#000000' }" data-color></label>
        <button class="btn-remove-player">-</button>
      </div>`
}

function saveSettings() {
  players = [];
  initPlayers = [];
  const playersElems = document.getElementsByClassName('player');
  [].forEach.call(playersElems, row => {
    const name = row.querySelectorAll('[data-name]')[0].value || 'Unnamed';
    const count = +row.querySelectorAll('[data-count]')[0].value || 0;
    const color = row.querySelectorAll('[data-color]')[0].value || '#000000';

    players.push({ name, count, color });
  });

  size = inputSizeElem.value;
  fontSize = inputFontSizeElem.value;
  fontPaddingLeft = inputFontPaddingLeft.value;

  transitionRevert = speedSecondRevert + 's all cubic-bezier(.8,0,.6,1)';
  transition = speedSecond + 's all cubic-bezier(.1,.11,0,1)';

  localStorage.setItem('settings', JSON.stringify({ players, size, fontSize, fontPaddingLeft }));
}

function init() {
  canvas = document.getElementById("canvas");

  containerElem.style.width = size + 'px';
  containerElem.style.height = size + 'px';
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  let totalCounts = 0;

  players.filter(player => player.count).forEach(player => {
    totalCounts += player.count;
  });

  const oneSize = (Math.PI * 2) / totalCounts;
  const oneCell = 360 / totalCounts;

  while (totalCounts > 0) {
    players = players.filter(player => player.count > 0).sort((a, b) => {
      if (a.count < b.count) {
        return 1;
      } else if (a.count > b.count) {
        return -1;
      } else {
        return 0;
      }
    });

    for (let i = 0; i < 2; i++) {
      if (players[i]) {
        initPlayers.push({
          name: players[i].name,
          count: 1,
          color: players[i].color,
        });

        players[i].count--;

        totalCounts--;
      }
    }
  }

  let begin = 0;
  initPlayers.forEach(player => {
    if (player.count) {
      const startItem = begin * oneSize - (Math.PI * 2) / 4;

      const startAngle = startItem;
      const endAngle = oneSize * player.count + startItem;
      player.degs = { from: begin * oneCell, to: begin * oneCell + player.count * oneCell };
      ctx.beginPath();
      ctx.fillStyle = player.color;
      ctx.moveTo(size / 2, size / 2);
      ctx.arc(size / 2, size / 2, size / 2, startItem, endAngle, false);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font = `bold ${ fontSize || 45 }px sans-serif`;
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(startAngle + (endAngle - startAngle) / 2);
      ctx.fillText(player.name, fontPaddingLeft || 110, 15);
      ctx.restore();

      begin += player.count;
    }
  });
}

function random(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function game() {
  if (!isGameBegan) {
    isGameBegan = true;
    containerWrapperElem.classList.add('game');

    audioFight.play();

    audioMusic.pause();
    audioMusic.currentTime = 0;

    timers.forEach(timer => clearTimeout(timer));

    timers[0] = setTimeout(() => {
      audioMusic.play();
    }, 800);

    timers[1] = setTimeout(() => {
      const randAngle = random(0, 360);
      let currentPlayer;
      for (let i = 0; i < initPlayers.length; i++) {
        const player = initPlayers[i];
        if (player.count) {
          currentPlayer = player;
          if (currentPlayer.degs.from <= randAngle && currentPlayer.degs.to >= randAngle) {
            break;
          }
        }
      }

      canvas = document.getElementById("canvas");
      canvas.style.transition = transitionRevert;
      canvas.style.transform = 'rotate(' + (random(0, 360) + 360 * speedSecondRevert) + 'deg)';

      timers[2] = setTimeout(() => {
        canvas.style.transition = transition;
        canvas.style.transform = 'rotate(' + -(randAngle + 360 * (speedSecond * 2)) + 'deg)';
      }, 1000 * speedSecondRevert);

      timers[3] = setTimeout(() => {
        alert('Поздравляем, ' + currentPlayer.name);
        canvas.style.transition = 'none';
        canvas.style.transform = 'rotate(0deg)';

        timers[4] = setTimeout(() => {
          isGameBegan = false;
          containerWrapperElem.classList.remove('game');
        });
      }, (speedSecondRevert + speedSecond) * 1000 - 200)
    }, 1000);
  }
}
