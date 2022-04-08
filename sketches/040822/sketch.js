// julian

const FPS = 60;
function setup() {
    let canvas = createCanvas(400, 400, WEBGL);
    canvas.parent("p5");
    frameRate(FPS);
    // createLoop({duration: 9, gif: {download: true, options:{quality: 20}}, framesPerSecond: 60});
}

let gridX = -200;
let gridY = 0;
let gridZ = 150;
let gridWidth = 10;
let cellWidth = 200;
let cellsPerLevel = 100;
let ceilingHeight = 400;
function draw() {
    background(0);
    push();
    fill(0);
    stroke(255);
    translate(0, 0.35 * height, 0);
    rotateY(PI / 4);
    beginShape();
    endShape();
    beginShape(TRIANGLES);
    let t = (frameCount / FPS) % 9;
    let T = squareWave(t, -0.13, 1.135, 4.5, 0);
    for (let i = 0; i < faces.length; i++) {
        for (let j = 0; j < faces[i].length; j++) {
            let v = faces[i][j];
            let x0 = [0, cellWidth, cellWidth, 0, 0, cellWidth][j + (i % 2) * 3];
            let y0 = 0
            let z0 = [0, 0, cellWidth, 0, cellWidth, cellWidth][j + (i % 2) * 3];
            x0 += gridX + (Math.floor(i / 2) % gridWidth) * cellWidth;
            y0 += gridY - Math.floor(Math.floor(i / 2) / cellsPerLevel) * ceilingHeight;
            z0 += gridZ - Math.floor((Math.floor(i / 2) % cellsPerLevel) / gridWidth) * cellWidth;
            let x1 = v[0] * 50;
            let y1 = -v[1] * 50;
            let z1 = v[2] * 50;
            let x = lerp(x0, x1, T);
            let y = lerp(y0, y1, T);
            let z = lerp(z0, z1, T);
            vertex(x, y, z);
        }
    }
    endShape();
    pop();
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
