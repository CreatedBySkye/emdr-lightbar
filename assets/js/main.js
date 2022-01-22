const settings = {
  bulbCount: 20,
  background_color_on: "orange",
  background_color_off: "white",
  height: "50px",
  bulb_pause: 10,
  edge_pause: 300,
  mode: "flicker`",
  duration: 10,
  frequency: 400,
  sound_on: false,
};

let panel1 = document.querySelector("img.panel1");
let panel2 = document.querySelector("img.panel2");
let panel3 = document.querySelector("img.panel3");
const state = {
  mode: "form",
  curPos: 0,
  direction: 1,
};

function change() {
  document.body.style = "background-color:black";
  panel1.remove();
  panel2.remove();
  panel3.remove();
}

function changeBack() {
  document.body.style = "background-color:slateblue";
  document.body.append(panel1);
  document.body.append(panel2);
  document.body.append(panel3);
}
async function next() {
  setBulbState(state.curPos, false);
  if (settings.mode === "flicker") {
    state.curPos = state.curPos === 0 ? settings.bulbCount - 1 : 0;
  } else {
    state.curPos = state.curPos + state.direction;
  }
  setBulbState(state.curPos, true);
  if (state.curPos == settings.bulbCount - 1 || state.curPos == 0) {
    if (settings.sound_on) {
      playSound(state.direction, settings.duration);
    }
    state.direction = -state.direction;
    await sleep(settings.edge_pause);
  }
}

function setBulbState(position, isOn) {
  const lightbarNode = window.document.getElementById("lightbar_container");
  const bulbNode = lightbarNode.children.item(position);
  bulbNode.style.backgroundColor = isOn
    ? settings.background_color_on
    : settings.background_color_off;
}

function resize() {
  const vw = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  const vh = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  document.getElementById("lightbar_container").style.marginTop =
    Math.floor(vh / 2) - 20 + "";
}

async function setUpLightbar() {
  resize();
  window.onresize = resize;
  const count = 20;

  const lightbarNode = window.document.getElementById("lightbar_container");

  lightbarNode.innerHTML = "";
  for (let i = 0; i < settings.bulbCount; i++) {
    lightbarNode.append(createLightNode());
  }

  for (let i = 0; i < CSS_COLOR_NAMES.length; i++) {
    let opt = CSS_COLOR_NAMES[i];
    let el = document.createElement("option");
    let colorWithSpaces = opt.replace(/([A-Z])/g, " $1");
    let firstLetterRecapitalized =
      colorWithSpaces.charAt(0).toUpperCase() + colorWithSpaces.slice(1);
    el.textContent = firstLetterRecapitalized;
    el.value = opt;
    el.style.backgroundColor = opt;
    document.getElementById("color").appendChild(el);
  }
  document.getElementById("color").value = "Orange";
}

let context = null;
let panner;
let oscillator;

function initialiseSounds() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
  } catch (e) {
    alert("Web Audio API is not supported in this browser");
  }

  let audioCtx = new (AudioContext || webkitAudioContext)();
  oscillator = audioCtx.createOscillator();
  panner = audioCtx.createStereoPanner();

  oscillator.type = "square";
  oscillator.frequency.value = settings.frequency; // value in hertz
  oscillator.connect(panner);
  panner.connect(audioCtx.destination);
  oscillator.start();
}

async function playSound(dir) {
  panner.pan.value = dir;
}

function frequencyChange() {
  document.getElementById("frequency_value").innerText = parseInt(
    document.forms["settings"]["frequency"].value
  );
}

async function start() {
  settings.background_color_on = document.forms["settings"]["color"].value;
  settings.duration =
    parseInt(document.forms["settings"]["duration"].value) * 1000;
  settings.mode = document.forms["settings"]["mode"].value;
  settings.bulb_pause = parseInt(
    document.forms["settings"]["bulb_pause"].value
  );
  settings.edge_pause = parseInt(
    document.forms["settings"]["edge_pause"].value
  );
  settings.sound_on = document.forms["settings"]["sound_on"].checked == true;
  settings.frequency = parseInt(document.forms["settings"]["frequency"].value);

  if (settings.sound_on) {
    initialiseSounds();
  }
  clearInterval(state.timeout);
  state.timeout = setTimeout(() => {
    stop();
  }, settings.duration);

  document.getElementById("settings_form").style.display = "none";
  document.getElementById("lightbar_wrapper").style.display = "inherit";
  state.mode = "lightbar";
  while (state.mode === "lightbar") {
    await next();
    await sleep(settings.bulb_pause);
  }
}

async function stop() {
  if (settings.sound_on) {
    oscillator.stop();
  }
  clearInterval(state.timeout);
  state.mode = "form";
  document.getElementById("settings_form").style.display = "inherit";
  document.getElementById("lightbar_wrapper").style.display = "none";
}

function createLightNode() {
  const lightNode = window.document.createElement("div");

  lightNode.classList.add("light_bulb");
  lightNode.style.height = settings.height;
  lightNode.style.backgroundColor = settings.background_color_off;

  return lightNode;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

window.onload = setUpLightbar;
