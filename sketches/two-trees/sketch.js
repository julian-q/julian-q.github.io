let e;
let T;

// monopodial trees
let monopodialOmega = "A(50,10)";
let monopodialParams0 = {
    "r1": 0.9,
    "r2": 0.6,
    "a0": 45,
    "a2": 45,
    "d": 137.5,
    "wr": 0.707,
}
let monopodialParams1 = {
    "r1": 0.9,
    "r2": 0.7,
    "a0": 30,
    "a2": -30,
    "d": 137.5,
    "wr": 0.707,
}
let monopodialProductions = {
    "A": (l, w, p) => `!(${w})F(${l})[&(${p["a0"]})B(${l*p["r2"]},${w*p["wr"]})]/(${p["d"]})A(${l*p["r1"]},${w*p["wr"]})`,
    "B": (l, w, p) => `!(${w})F(${l})[-(${p["a2"]})$C(${l*p["r2"]},${w*p["wr"]})]C(${l*p["r1"]},${w*p["wr"]})`,
    "C": (l, w, p) => `!(${w})F(${l})[+(${p["a2"]})$B(${l*p["r2"]},${w*p["wr"]})]B(${l*p["r1"]},${w*p["wr"]})`,
}
// ternary trees
let ternaryOmega = "!(1)F(10)/(45)A()";
let ternaryParams = {
    "d1": 112.5,
    "d2": 157.5,
    "a": 22.5,
    "lr": 1.0,
    "vr": 1.732,
}
let ternaryProductions = {
    "A": (p) => `!(${p["vr"]})F(50)[&(${p["a"]})F(50)A()]/(${p["d1"]})[&(${p["a"]})F(50)A()]/(${p["d2"]})[&(${p["a"]})F(50)A()]`,
    "F": (l, p) => `F(${l*p["lr"]})`,
    "!": (w, p) => `!(${w*p["vr"]})`,
}

let heightMap;
let gridHeight = 10;
let gridWidth = 10;
let gridCellSize = 100;

let cam;
let font;

function preload() {
    font = loadFont("/NotoSans.ttf");
}

function setup() {
    var canvas = createCanvas(400, 400, WEBGL);
    canvas.parent("p5");
    angleMode(DEGREES);
    heightMap = [];
    for (let i = 0; i < gridHeight; i++) {
        let row = [];
        for  (let j = 0; j < gridWidth; j++) {
            let y = -gridHeight/2 * gridCellSize + i * gridCellSize;
            let x = -gridWidth/2 * gridCellSize + j * gridCellSize;
            row.push(-6 -noise(x, y) * -0.3*sqrt(sq(x) + sq(y)));
        }
        heightMap.push(row);
    }
    cam = createCamera();
    cam.setPosition(0, -200, 800);
    cam.lookAt(0, -10, 0);
}

let N;
let monopodialMu0;
let monopodialMu1;

function sigmoid(x) {
    return 1 / (1 + exp(-x));
}
function draw() {
    let sunsetTime = sigmoid(frameCount / (60*4) * 3);
    e = 15 * sunsetTime;
    console.log(e);
    background(lerpColor(color("rgb(97, 147, 255)"), color("rgb(254, 97, 19)"), sunsetTime * 2 - 1));
    push();
    strokeWeight(10);
    strokeCap(SQUARE);
    rotateZ(180);
    N = min(floor(frameCount / 30), 11);
    if (N <= 10) {
        monopodialMu0 = derive(monopodialOmega, monopodialProductions, monopodialParams0, N);
        monopodialMu1 = derive(monopodialOmega, monopodialProductions, monopodialParams1, N);
    }
    drawTree(monopodialMu0, createVector(+50, 0, 0), createVector(+1, 0, 0));
    drawTree(monopodialMu1, createVector(-50, 0, 0), createVector(-1, 0, 0));
    pop();
    fill(0);
    push();
    translate(-gridWidth/2 * gridCellSize, 0, -gridHeight/2 * gridCellSize);
    fill(0, 255, 0);
    for (let i = 0; i < gridHeight-1; i++) {
        for (let j = 0; j < gridWidth-1; j++) {
            beginShape(QUADS);
            vertex(i * gridCellSize, heightMap[i][j], j * gridCellSize);
            vertex((i+1) * gridCellSize, heightMap[i+1][j], j * gridCellSize);
            vertex((i+1) * gridCellSize, heightMap[i+1][j+1], (j+1) * gridCellSize);
            vertex(i * gridCellSize, heightMap[i][j+1], (j+1) * gridCellSize);
            endShape(CLOSE);
        }
    }
    pop();
    push();
    fill(0);
    textFont(font);
    textSize(48);
    textStyle(BOLD);
    text("朱", -120, -50);
    text("华", +70, -50);
    pop();
    push();
    noStroke();
    fill("rgb(255, 229, 82)");
    emissiveMaterial("rgb(255, 229, 82)");
    translate(0, 70 + -500 * (1 - sunsetTime), -700);
    sphere(50);
    pop();
}

function derive(omega, P, params, N) {
    let mu = omega;
    for (let n = 0; n < N; n++) {
        let muNext = "";
        let i = 0;
        
        while (i < mu.length) {
            let ch = mu[i];
            let p0 = mu.indexOf("(", i);
            let p1 = mu.indexOf(")", i);
            if (p0 != i+1) {
                muNext += ch;
                i++;
                continue;
            }
            if (!(ch in P)) {
                muNext += mu.substring(i, p1+1);
                i = p1+1;
                continue;
            }
            let func = P[ch];
            let args = mu.substring(p0+1, p1).split(",").map(parseFloat).filter(Number.isFinite);
            muNext += func(...args, params);
            i = p1+1;
        }
        mu = muNext;
    }
    return mu;
}

function drawTree(mu, initialPos, T) {
    push();
    translate(initialPos);
    let i = 0;
    while (i < mu.length) {
        let ch = mu[i];
        switch (ch) {
            case "[":
                push();
                i++;
                continue;
            case "]":
                fill(0, 255, 0);
                noStroke();
                box((16 - N) * 1);
                pop();
                i++;
                continue;
            case "$":
                let mat4 = _renderer.uMVMatrix.copy().mat4;
                let globalHeading = createVector(
                    mat4[1],  // m10
                    mat4[5],  // m11
                    mat4[9]   // m12
                ).normalize();
                let globalLeft = createVector(
                    mat4[0],  // m00
                    mat4[4],  // m01
                    mat4[8]   // m02
                ).normalize();
                let globalUp = createVector(0, -1, 0);
                let targetLeft = p5.Vector.cross(globalUp, globalHeading).normalize();
                let angle = acos(p5.Vector.dot(globalLeft, targetLeft));
                rotateY(angle);
                i++;
                continue;
        }
        let p0 = mu.indexOf("(", i);
        let p1 = mu.indexOf(")", i);
        let args = mu.substring(p0+1, p1).split(",").map(parseFloat);
        i = p1+1;
        switch (ch) {
            case "!":
                strokeWeight(args[0]);
                break;
            case "F":
                line(0, 0, 0, 0, args[0], 0);
                translate(0, args[0], 0);
                // Apply tropism!
                let mat4 = _renderer.uMVMatrix.copy().mat4;
                let globalHeading = createVector(
                    mat4[1],  // m10
                    mat4[5],  // m11
                    mat4[9]   // m12
                ).normalize();
                let force = p5.Vector.cross(globalHeading, T);
                let axis = p5.Vector.normalize(force);
                let angle = e * force.mag();
                let localAxis = [
                    mat4[0] * axis.x + mat4[1] * axis.y, mat4[2] * axis.z,
                    mat4[4] * axis.x + mat4[5] * axis.y, mat4[6] * axis.z,
                    mat4[8] * axis.x + mat4[9] * axis.y, mat4[10] * axis.z,
                ];
                rotate(angle, axis);
                break;
            case "+":
                rotateZ(+args[0]);
                break;
            case "-":
                rotateZ(-args[0]);
                break;
            case "&":
                rotateX(+args[0]);
                break;
            case "^":
                rotateX(-args[0]);
                break;
            case "\\":
                rotateY(+args[0]);
                break;
            case "/":
                rotateY(-args[0]);
                break;
            case "|":
                rotateZ(+180);
                break;
        }       
    }
    pop();
}