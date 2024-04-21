var freq = 0.01;
function f(x, y) {
    return 0.001 * (x*x + y*y) + 300 * (Math.cos(freq * x) + Math.cos(freq * y));
}
function dfdx(x, y) {
    return 0.001 * 2*x + 300 * -Math.sin(freq * x) * freq;
}
function dfdy(x, y) {
    return 0.001 * 2*y + 300 * -Math.sin(freq * y) * freq;
}

class Adam {
    constructor(x, y, a, mx, my) {
        this.points = [[x, y], [x, y]];
        this.t = 0;
        this.a = a;
        this.b1 = 0.9, this.b2 = 0.999;
        this.mx = mx, this.my = my;
        this.vx = 0, this.vy = 0;
        this.size = 20;
    }

    update() {
        this.t++;
        var x1, y1;
        var xn, yn;
        [x1, y1] = this.points[this.points.length - 1];
        // this is momentum!
        this.mx = this.b1 * this.mx + (1 - this.b1) * dfdx(x1, y1);
        this.my = this.b1 * this.my + (1 - this.b1) * dfdy(x1, y1);
        this.vx = this.b2 * this.vx + (1 - this.b2) * Math.pow(dfdx(x1, y1), 2);
        this.vy = this.b2 * this.vy + (1 - this.b2) * Math.pow(dfdy(x1, y1), 2);
        var mxHat = this.mx / (1 - Math.pow(this.b1, this.t));
        var myHat = this.my / (1 - Math.pow(this.b1, this.t));
        var vxHat = this.vx / (1 - Math.pow(this.b2, this.t));
        var vyHat = this.vy / (1 - Math.pow(this.b2, this.t));
        xn = x1 - this.a * mxHat / (Math.sqrt(vxHat) + 1e-8);
        yn = y1 - this.a * myHat / (Math.sqrt(vyHat) + 1e-8);
        this.points.push([xn, yn]);
    }

    draw(dt) {
        push();
        strokeWeight(this.size);
        stroke(255);
        for (var i = 0; i < this.points.length - 1; i++) {
            var x0, y0;
            var x1, y1;
            [x0, y0] = this.points[i];
            [x1, y1] = this.points[i + 1];
            if (i < this.points.length - 2) {
                line(x0, y0, f(x0, y0) + this.size,
                     x1, y1, f(x1, y1) + this.size);
            } else {
                var xt = lerp(x0, x1, (frameCount % dt) / dt);
                var yt = lerp(y0, y1, (frameCount % dt) / dt);
                line(x0, y0, f(x0, y0) + this.size,
                     xt, yt, f(xt, yt) + this.size);
                translate(xt, yt, f(xt, yt) + this.size);
                sphere(this.size);
                rotateX(PI / 2);
                rotateZ(-PI);
                translate(0, -100, 0);
                textSize(100);
                text("Adam", 100, -100);
                textSize(50);
                text(`η=${this.a} β1=${this.b1} β2=${this.b2}`, 400, -150);
            }
        }
        pop();
    }
}

class Weee {
    constructor() {
        this.points = [[-8000, -600], [-8000, -600]];
        this.r = 0; // = Math.sqrt(x*x + y*y);
        this.t = 0; // Math.atan(-x, y) * 10;
        this.theta = 0;
        this.mode = "fly";
        this.size = 20;
        this.vx = 50;
        this.vy = 0;
    }

    update() {
        this.t++;
        var x1, y1;
        var xn, yn;
        [x1, y1] = this.points[this.points.length - 1];
        if (this.mode == "fly") {
            xn = x1 + this.vx;
            yn = y1 + this.vy;
        }
        if (x1 == 0) {
            this.mode = "spin";
            this.theta = Math.atan(y1, x1);
            this.r = Math.sqrt(x1*x1 + y1*y1);
        }
        if (this.mode == "spin") {
            this.theta += 0.1;
            xn = Math.cos(this.theta) * this.r;
            yn = Math.sin(this.theta) * this.r;
            this.r *= 0.998;
        }
        if (this.t >= 245) {
            this.mode = "fly";
            this.vx = -Math.sin(this.theta) * 100;
            this.vy =  Math.cos(this.theta) * 100;
        }
        this.points.push([xn, yn]);
    }

    draw(dt) {
        push();
        strokeWeight(this.size);
        stroke(255);
        for (var i = 0; i < this.points.length - 1; i++) {
            var x0, y0;
            var x1, y1;
            [x0, y0] = this.points[i];
            [x1, y1] = this.points[i + 1];
            if (i < this.points.length - 2) {
                line(x0, y0, f(x0, y0) + this.size,
                     x1, y1, f(x1, y1) + this.size);
            } else {
                var xt = lerp(x0, x1, (frameCount % dt) / dt);
                var yt = lerp(y0, y1, (frameCount % dt) / dt);
                line(x0, y0, f(x0, y0) + this.size,
                     xt, yt, f(xt, yt) + this.size);
                translate(xt, yt, f(xt, yt) + this.size);
                sphere(this.size);
                rotateX(PI / 2);
                rotateZ(-PI);
                textSize(100);
                text(`weeeeee`, 100, -100);
            }
        }
        pop();
    }
}

var myFont;
function preload() {
  myFont = loadFont('assets/OpenSans.ttf');
}


var paths = [new Adam(1000, 600, 0.5, 60, 10), new Weee()];
var rz = 0, rx = 0.6;
var cx = 0, cy = 1500, cz = -2000;


var etaInput;
var beta1Input;
var beta2Input;
var start;
function loadParams() {
    console.log('hello!');
    delete paths[0];
    delete paths[1];
    paths = [new Adam(1000, 600, 0.5, 60, 10), new Weee()];
    paths[0].a = parseFloat(etaInput.value());
    paths[0].b1 = parseFloat(beta1Input.value());
    paths[0].b2 = parseFloat(beta2Input.value());
    console.log(etaInput.value(), beta1Input.value(), beta2Input.value());
    console.log(paths[0].a, paths[0].b1, paths[0].b2);
    setup();
}

function setup() {
    var canvas = createCanvas(600, 600, WEBGL);

    background(0);
    frameRate(60);
    textFont(myFont);
    var p1 = createP('η');
    p1.style('color', 'white');
    p1.position(20, -5);
    etaInput = createInput(paths[0].a.toString());
    etaInput.position(40, 10);
    etaInput.size(40, 20);
    var p2 = createP('β1');
    p2.style('color', 'white');
    p2.position(90, -5);
    beta1Input = createInput(paths[0].b1.toString());
    beta1Input.position(110, 10);
    beta1Input.size(40, 20);
    var p3 = createP('β2');
    p3.style('color', 'white');
    p3.position(160, -5);
    beta2Input = createInput(paths[0].b2.toString());
    beta2Input.position(180, 10);
    beta2Input.size(40, 20);
    start = createButton('start');
    start.position(230, 10);
    start.size(40, 22);
    start.mouseClicked(loadParams);
    
    // createLoop();
}


function draw() {
    background(0);
    rotateX(PI / 2);
    rotateZ(PI);
    if (mouseIsPressed) {
        var dx = mouseX - pmouseX;
        var dy = mouseY - pmouseY;
        rz += dx / 100;
        rx += -dy / 100;
    }
    rotateZ(rz);
    rotateX(rx);
    if (keyIsPressed) {
        var d = 10;
        switch (keyCode) {
            case LEFT_ARROW:
                cx -= d;
                break;
            case RIGHT_ARROW:
                cx += d;
                break;
            case UP_ARROW:
                cy -= d;
                break;
            case DOWN_ARROW:
                cy += d;
                break;
        }
    }
    translate(cx, cy, cz);

    var cool = color(100, 0, 255);
    var hot = color(255, 90, 100);
    var minX = -1000, maxX = +1000;
    var minY = -1000, maxY = +1000;
    var minZ = -0, maxZ = +1000;
    var step = 50;

    push();
    stroke(0);
    for (var x = minX; x < maxX; x += step) {
        beginShape(TRIANGLE_STRIP);
        for (var y = minY; y < maxY; y += step) {
            var lerpT = constrain((f(x, y) - minZ) / (maxZ - minZ), 0, 1);
            fill(lerpColor(cool, hot, lerpT));
            vertex(x, y, f(x, y));
            vertex(x + step, y, f(x + step, y));
        }
        endShape();
    }
    pop();

    var dt = 1;
    for (var i = 0; i < paths.length; i++) {
        if (frameCount % dt == 0) {
            paths[i].update();
        }
        paths[i].draw(dt);
    }
}
