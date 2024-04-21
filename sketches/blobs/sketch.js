blobs = [];

function setup() {
    createCanvas(400, 400);
    ellipseMode(CENTER);
    colorMode(HSB);
    Blob.mode = 'circle';
    Blob.sun = createVector(width / 2, height / 2);
    for (var i = 0; i < 10; i++) {
        blobs.push(new Blob());
    }
}

var T = 240;

function draw() {
    switch (frameCount % T) {
        case 0: 
            Blob.mode = 'circle'; break;
        case T / 2: 
            Blob.mode = 'gravity'; break;
    }
    background('black');
    for (var i = 0; i < blobs.length; i++) {
        blobs[i].update();
        blobs[i].show();
    }
}

function mousePressed() {
    Blob.mode = Blob.mode == 'circle' ? 'gravity' : 'circle';
}
