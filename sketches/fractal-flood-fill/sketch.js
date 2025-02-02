let omega = "F-F-F-F";
let P = {
    "F": "F-F+F+FF-F-F+F",
}
let mu;

let n;
let d;
let delta;
let x0;
let y0;
let alpha0;

let dpi;
let queue;
let iter;
let cubesize;
let slider;

function setup() {
    var canvas = createCanvas(400, 400);
    canvas.parent("p5");
    frameRate(60);
    background(255);
    slider = createSlider(0, 5, 2, 1);
    slider.parent("slider");
    slider.size(width);
    // Initialize parameters.
    n = 2;
    d = width / pow(4, n);
    delta = HALF_PI;
    x0 = 0;
    y0 = height;
    alpha0 = 0;
    dpi = pixelDensity();
    queue = [[floor(width/2 / d)*d, floor(height/2 / d)*d]];
    iter = 0;
    cubesize = 2;
    // Derive initial string to render.
    derive();
}

function draw() {
    // Flood fill.
    for (let substep = 0; substep < 20; substep++) {
        loadPixels();
        if (queue.length > 0) {
            iter++;
            let [xF, yF] = queue.pop();
            if (isClear(xF, yF)) {
                fill(0, 0, 255);
                noStroke();
                rect(xF, yF, cubesize, cubesize);
                pushIfClear(queue, xF, yF-cubesize);
                pushIfClear(queue, xF, yF+cubesize);
                pushIfClear(queue, xF-cubesize, yF);
                pushIfClear(queue, xF+cubesize, yF);
            }
        }
    }
}

function keyPressed() {
    if (keyIsDown(32) && keyIsDown(SHIFT)) { // Shift+Spacebar.
        n = constrain(n - 1, 0, 5);
        d = width / pow(4, n);
        queue = [[floor(width/2 / d)*d, floor(height/2 / d)*d]];
        derive();
    }
    else if (keyIsDown(32)) { // Spacebar.
        n = constrain(n + 1, 0, 5);
        d = width / pow(4, n);
        queue = [[floor(width/2 / d)*d, floor(height/2 / d)*d]];
        derive();
    }
}

function mousePressed() {
    if (mouseX < 0 || mouseX >= width)
        return;
    if (mouseY < 0 || mouseY >= width)
        return;
    queue = [[floor(mouseX / cubesize)*cubesize+1, floor(mouseY / cubesize)*cubesize+1]];
    derive();
}

function mouseReleased() {
    if (slider.value() == n)
        return;
    n = slider.value();
    d = width / pow(4, n);
    queue = [[floor(width/2 / d)*d, floor(height/2 / d)*d]];
    derive();
}

function derive() {
    // Apply productions.
    console.log(`deriving string with omega=${omega}, n=${n}, d=${d}`);
    mu = omega;
    for (let i = 0; i < n; i++) {
        let muP = "";
        for (let ch of mu) {
            muP += ch in P ? P[ch] : ch;
        }
        mu = muP;
    }
    // Render turtle path.
    background(0);
    stroke(255);
    strokeWeight(2);
    strokeCap(PROJECT);
    let x = x0;
    let y = y0;
    let alpha = alpha0;
    for (let ch of mu) {
        let xP = x;
        let yP = y;
        let alphaP = alpha;
        switch (ch) {
            case "F":
                xP = x + d * cos(alpha);
                yP = y + d * sin(alpha);
                line(x, y, xP, yP);
                break;
            case "+":
                alphaP = alpha + delta;
                break;
            case "-":
                alphaP = alpha - delta;
                break;
        }
        x = xP;
        y = yP;
        alpha = alphaP;
    }
}

function isClear(x, y) {
    pidx = ((y * dpi) * (width * dpi) + x * dpi) * 4;
    let rgb = pixels.slice(pidx, pidx + 3);
    return rgb.indexOf(255) == -1;
}

function pushIfClear(queue, x, y) {
    if (x < 0 || x >= width)
        return;
    if (y < 0 || y >= height)
        return;
    if (!isClear(x, y))
        return;
    queue.push([x, y]);
}
