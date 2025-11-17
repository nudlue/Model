let model, audio;
let isListening = false;

const classes = ["Doorbell", "Fire Alarm", "Baby Crying", "Background Noise"];

function emojiForClass(c) {
  switch (c) {
    case "Doorbell": return "🚪🔔";
    case "Fire Alarm": return "🔥🚨";
    case "Baby Crying": return "👶😭";
    default: return "🔉";
  }
}

async function loadModel() {
  model = await tf.loadLayersModel("model/model.json");
  console.log("Model loaded");
}

async function startListening() {
  isListening = true;

  audio = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const streamSource = audioContext.createMediaStreamSource(audio);

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  streamSource.connect(analyser);
  const data = new Float32Array(analyser.fftSize);

  async function loop() {
    if (!isListening) return;

    analyser.getFloatTimeDomainData(data);

    // 1초마다 예측하도록 setTimeout
    const input = tf.tensor(data).reshape([1, data.length, 1]);

    const prediction = model.predict(input);
    const probs = await prediction.data();

    updateDisplay(probs);

    prediction.dispose();
    input.dispose();

    setTimeout(loop, 1000);
  }

  loop();
}

function updateDisplay(probabilities) {
  // 확률이 가장 높은 클래스 선택
  let maxIndex = probabilities.indexOf(Math.max(...probabilities));
  let predictedClass = classes[maxIndex];

  // 이모지 표시
  document.getElementById("emoji").textContent = emojiForClass(predictedClass);

  // 테이블 업데이트
  let tbody = document.getElementById("prob-body");
  tbody.innerHTML = "";

  classes.forEach((c, i) => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${c}</td>
      <td>${(probabilities[i] * 100).toFixed(2)}%</td>
    `;
    tbody.appendChild(row);
  });
}

document.getElementById("start-btn").addEventListener("click", () => {
  loadModel().then(startListening);
});
