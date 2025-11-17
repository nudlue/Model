const URL = "model/"; 

let model, audio, maxPredictions;

async function loadModel() {
    // Teachable Machine Audio Library Load
    model = await tmAudio.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();

    document.getElementById("start-btn").disabled = true;

    // Start Listening
    model.listen(resultHandler, {
        overlapFactor: 0.5,
        probabilityThreshold: 0.0
    });

    console.log("Listening started");
}

function emojiForClass(c) {
    switch (c) {
        case "Doorbell": return "🚪🔔";
        case "Fire Alarm": return "🔥🚨";
        case "Baby Crying": return "👶😭";
        default: return "🔉";
    }
}

function resultHandler(predictions) {
    let tbody = document.getElementById("prob-body");
    tbody.innerHTML = "";

    let maxClass = "";
    let maxProb = -1;

    predictions.forEach(p => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.className}</td>
            <td>${(p.probability * 100).toFixed(2)}%</td>
        `;
        tbody.appendChild(row);

        if (p.probability > maxProb) {
            maxProb = p.probability;
            maxClass = p.className;
        }
    });

    document.getElementById("emoji").textContent = emojiForClass(maxClass);
}

document.getElementById("start-btn").addEventListener("click", loadModel);
