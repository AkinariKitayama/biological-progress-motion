let canvas = document.getElementById("bioMotion");
let ctx = canvas.getContext("2d");

let motionData;
let frameRate = 30;
let currentTime = 0;
let startTime;

let humanData, dogData;
let blendRate = 0;

Promise.all([
    fetch("./jsons/humanMotion.json").then(res => res.json()),
    fetch("./jsons/dogMotion.json").then(res => res.json())
]).then(([human, dog]) => {
    humanData = human;
    dogData = dog;
    startTime = performance.now();
    requestAnimationFrame(update);
});

function getCommonParts() {
    let humanParts = Object.keys(humanData.parts);
    let dogParts = Object.keys(dogData.parts);
    return humanParts.filter(part => dogParts.includes(part));
}

function update(timestamp) {
    let elapsed = (timestamp - startTime) / 1000;
    let lastTime = getMaxTime(humanData.parts);

    if (elapsed >= lastTime) {
        // reset loop immediately
        startTime = timestamp;
        elapsed = 0;
    }

    currentTime = elapsed;
    drawFrame(currentTime);
    requestAnimationFrame(update);
}

function drawFrame(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let parts = getCommonParts();
    for(let part of parts) {
        let hKeys = humanData.parts[part];
        let dKeys = dogData.parts[part];
        let pos = blendPosition(hKeys, dKeys, time, blendRate);
        if(pos) {
            drawCircle(pos[0], pos[1], part);
            typoMotion(blendRate);
        }
    }
}



    function blendPosition(humanKeys, dogKeys, t, blend) {
        let hPos = interpolate(humanKeys, t);
        let dPos = interpolate(dogKeys, t);

    if(!hPos || !dPos) return null;

    let x = hPos[0] * (1 - blend) + dPos[0] * blend;
    let y = hPos[1] * (1 - blend) + dPos[1] * blend;
    return [x, y];
    }


    function interpolate(keys, t) {
        if(keys.length < 2)return null;

        for(let i = 0; i < keys.length - 1; i++) {
            let k1 = keys[i];
            let k2 = keys[i+1];
            if(t >= k1.time && t <= k2.time) {
                let amt = (t - k1.time) / (k2.time - k1.time);
                let x = k1.value[0] + (k2.value[0] - k1.value[0] )* amt;
                let y = k1.value[1] + (k2.value[1] -  k1.value[1]) * amt;
                return[x, y];
            }
        } 
         if (t < keys[0].time) {
        return keys[0].value;
        }
        if (t > keys[keys.length - 1].time) {
        return keys[keys.length - 1].value;
        }

        return null;
    }

    function drawCircle(x, y, label) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    function getMaxTime(parts) {
        let max = 0;
        for(let part in parts) {
            let last = parts[part][parts[part].length -1 ].time;
            if(last > max) max = last;
        }
        return max;
    }

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("blendSlider").addEventListener("input", e => {
        blendRate = parseFloat(e.target.value);
    });
});
 function typoMotion(sliderValue) {
        const typo = document.getElementById("typo");
        // Duration = typo.duration;

        if (!typo || isNaN(typo.duration)) return;

        const clipTime = sliderValue * typo.duration;
        typo.currentTime = clipTime;
    }