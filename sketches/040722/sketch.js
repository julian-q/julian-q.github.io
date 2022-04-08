// julian

const FPS = 60;
function setup() {
    let canvas = createCanvas(400, 400, WEBGL);
    canvas.parent("p5");
    frameRate(FPS);
    colorMode(HSB, 360, 100, 100, 100);
    createLoop({duration: 8, gif: {download: true, options:{quality: 20}}, framesPerSecond: 60});
}

let meshMode = Array.from({length: 800}, (v, i) => false);
let prevLoc = Array.from({length: 800}, (v, i) => [[0,0,0], [0,0,0], [0,0,0]]);
let prevCol = Array.from({length: 800}, (v, i) => [0,0,0]);
let newCol = [];
for (let i = 0; i < faces.length; i++) {
    if (faces[i][3] == 0) {
        newCol.push("brown");
    } else {
        newCol.push("green");
    }
}
let cellWidth = 5;
let gridWidth = 20;
let gridX = -1/2 * gridWidth * cellWidth;
let gridY = 0;
let gridZ = -1/2 * gridWidth * cellWidth;;
function draw() {
    let t = (frameCount / FPS);
    background(0);
    noFill();
    translate(0, 0, 200);
    rotateX(-PI / 4);
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridWidth; j++) {
            for (let k = 0; k < 2; k++) {
                let inputs = [
                    [gridX + i * cellWidth, gridZ + j * cellWidth],
                    [gridX + (i + 1 - k) * cellWidth, gridZ + (j + k) * cellWidth],
                    [gridX + (i + 1) * cellWidth, gridZ + (j + 1) * cellWidth]
                    // [gridX + i * cellWidth, gridZ + j * cellWidth]
                ];
                

                beginShape(TRIANGLES);
                let T_pos = min(t - 3, 3) / 3;
                let faceIndex = i * gridWidth * 2 + j * 2 + k;
                if (!meshMode[faceIndex]) {
                    noFill();
                } else {
                    fill(lerpColor(color(0, 0, 0, 0), color(newCol[faceIndex]), T_pos));
                }
                for (let v = 0; v < inputs.length; v++) {
                    let x = inputs[v][0], z = inputs[v][1];
                    let y = -50 * cos(0.5 * t - 0.05 * sqrt(sq(x) + sq(z)));
                    let rainbow = color(y / 50 * 180 + 180, 50, 100, 100);
                    stroke(rainbow);
                    
                    if (t > 3) {
                        meshMode[faceIndex] = true;
                        prevLoc[faceIndex][v] = [x, y, z];
                        prevCol[faceIndex][v] = rainbow;
                    }
                    if (!meshMode[faceIndex]) {
                        vertex(x, y, z);
                    } else {
                        let meshVertex = faces[faceIndex][v];
                        let mx = meshVertex[0] * 15;
                        let my = -meshVertex[1] * 15 + 90;
                        let mz = meshVertex[2] * 15;
                        let px = prevLoc[faceIndex][v][0];
                        let py = prevLoc[faceIndex][v][1];
                        let pz = prevLoc[faceIndex][v][2];
                        stroke(lerpColor(prevCol[faceIndex][v], color(0, 0, 0, 0), T_pos));
                        vertex(lerp(px, mx, T_pos), lerp(py, my, T_pos), lerp(pz, mz, T_pos));
                    }
                }
                endShape();
            }
        }
    }
}

function osc(t, min, max, period, offset) {
    return (max - min) / 2 * (cos(TWO_PI / period * (t + offset)) + 1) + min;
}

function squareWave(t, min, max, period, offset) {
    let sum = 0;
    for (let i = 0; i < 100; i++) {
        sum += (1 / (2 * i + 1) * sin((2 * i + 1) * TWO_PI / period * (t + offset)));
    }
    sum += 1;
    sum *= (max - min) / 2;
    sum += min;
    return sum;
}

function sawtoothWave(t, min, max, period, offset) {
    let sum = 0;
    for (let i = 1; i < 100; i++) {
        sum += (1 / (2 * i) * sin((2 * i) * TWO_PI / period * (t + offset)));
    }
    sum += 1;
    sum *= (max - min) / 2;
    sum += min;
    console.log(sum);
    return sum;
}

function rampWave(t, min, max, period, offset, ratio) {
    let ramptime = period * ratio;
    let slope = (max - min) / ramptime;
    let downrampStart = (period / 2) - ramptime;
    let downrampStop = period / 2;
    let uprampStart = period - ramptime;
    if (t < downrampStart) {
        return max;
    } else if (t < downrampStop) {
        return max - slope * (t - downrampStart) + min;
    } else if (t < uprampStart) {
        return min;
    } else {
        return slope * (t - uprampStart) + min;
    }
}

function sigmoid(x) {
    return 1 / (1 + exp(-x))
}

function smoothramp(t, offset) {
    return sigmoid(-2 * t + 10 + offset);
}
