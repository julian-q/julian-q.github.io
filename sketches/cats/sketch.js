let catImages = {
    "small": [],
    "big": [],
}
let handImages = [];
let pixelFont;
let zhFont;
let purrSounds = {};
let textBlobs = [];
let mousePressedStartFrame = 0;
let catSelection;
let catSound;
let catMusic;
let currentScreen;
let score = 0;


function preload() {
    // Load cats.
    catImages["small"].push(loadImage("xiaomao1.png"))
    catImages["small"].push(loadImage("xiaomao2.png"))
    catImages["big"].push(loadImage("damao1.png"))
    catImages["big"].push(loadImage("damao2.png"))
    // Load cursors.
    handImages.push(loadImage("hand.png"));
    handImages.push(loadImage("grab.png"));
    // Load fonts.
    pixelFont = loadFont("Micro5-Regular.ttf");
    zhFont = loadFont("fusion-pixel.otf");
    // Load sounds.
    purrSounds["small"] = loadSound("purr.wav");
    purrSounds["small"].setVolume(0.2);
    purrSounds["small"].setLoop(true);
    purrSounds["big"] = loadSound("purr2.wav");
    purrSounds["big"].setVolume(0.2);
    purrSounds["big"].setLoop(true);
    catSound = purrSounds["small"];
    // Load music.
    catMusic = loadSound("neko.mp3");
    catMusic.setLoop(true);
    catMusic.setVolume(0.3);
}

function setup() {
    var canvas = createCanvas(400, 400);
    canvas.parent("p5");
    currentScreen = menuScreen;
}

function draw() {
    currentScreen();

    // Draw hand.
    let handImg = handImages[mouseIsPressed ? 1 : 0];
    let handScale = 0.06;
    push();
    translate(mouseX, mouseY);
    rotate(-QUARTER_PI);
    image(handImg, 0, 0, handImg.width * handScale, handImg.height * handScale);
    pop();

    // Animate text blobs.
    textFont(zhFont);
    textSize(36);
    textStyle(BOLD);
    noStroke();
    for (let blob of textBlobs) {
        fill(blob.color);
        text(blob.txt, blob.x, blob.y);
        blob.y -= 2;
    }
}

function mousePressed() {
    mousePressedStartFrame = frameCount;
}

function mouseReleased() {
    catSound.pause();
    catMusic.pause();
}

function menuScreen() {
    background(100);

    // Draw cats.
    let isClick;
    for (let [name, imgList] of Object.entries(catImages)) {
        let catImg = imgList[0];
        let catImgScale = 0.7;
        let catX = name == "big" ? width * 0.27 : width * 0.71;
        let catY = name == "big" ? height * 0.525 : height * 0.50;
        let clickX = mouseX > (catX - catImg.width/2) && mouseX < (catX + catImg.width/2);
        let clickY = mouseY > (catY - catImg.height/2) && mouseY < (catY + catImg.height/2);
        isClick = mouseIsPressed && clickX && clickY;
        if (isClick) {
            let message = name == "big" ? "大" : "小";
            textBlobs.push({"x": mouseX + randomGaussian(0, 10), "y": mouseY, "txt": message, "color": "black"});
            catSelection = name;
            catSound = purrSounds[catSelection];
            currentScreen = petScreen;
            score = 0;
            return;
        }
        imageMode(CENTER);
        push();
        translate(catX, catY);
        scale(name == "big" ? -1 : 1, 1);
        image(catImg, 0, 0, catImg.width * catImgScale, catImg.height * catImgScale);
        pop();
    }

    // Draw text.
    textFont(pixelFont);
    textSize(36);
    textStyle(NORMAL);
    let message = "Choose Your Cat.";
    let tx = 20;
    let ty = 40;
    noStroke();
    fill("black");
    text(message, tx+2, ty+2);
    fill("yellow");
    text(message, tx, ty);
}

function petScreen() {
    background(100);

    // Draw cat.
    let imgList = catImages[catSelection];
    let catImg = imgList[0];
    let catImgScaleX = 1.0;
    let catImgScaleY = 1.0;
    let petX = mouseX > (width/2 - catImg.width/2) && mouseX < (width/2 + catImg.width/2);
    let petY = mouseY > (height/2 - catImg.height/2) && mouseY < (height/2);
    let isPet = mouseIsPressed && petX && petY;
    if (isPet)
        catImg = imgList[1];
    // Handle pets.
    if (isPet && (frameCount - mousePressedStartFrame) % 15 == 0) {
        score++;
        textBlobs.push({"x": mouseX + randomGaussian(0, 30), "y": mouseY, "txt": "摸", "color": "black"});
    }
    let isPurr = isPet && score > 12;
    if (isPurr)
        catImgScaleX = 1.0 + sin(frameCount) * 0.015;
    imageMode(CENTER);
    image(catImg, width/2, height/2, catImg.width * catImgScaleX, catImg.height * catImgScaleY);

    // Play sounds.
    if (isPurr) {
        if (!catSound.isPlaying())
            catSound.play();
    }
    else {
        catSound.pause();
    }
    // Handle music.
    if (isPurr && score > 50) {
        if ((frameCount - mousePressedStartFrame) % 35 == 0) {
            let colorSelection = color(`hsb(${Math.floor(Math.random() * 360)}, 100%, 100%)`);
            textBlobs.push({"x": mouseX + randomGaussian(0, 30), "y": mouseY, "txt": "♫", "color": colorSelection});
        }
        if (!catMusic.isPlaying())
            catMusic.play();
    } else {
        catMusic.pause();
    }

    // Draw text.
    textFont(pixelFont);
    textSize(36);
    textStyle(NORMAL);
    let message = "Pet The Cat.";
    let tx = 20;
    let ty = 40;
    noStroke();
    fill("black");
    text(message, tx+2, ty+2);
    fill("yellow");
    text(message, tx, ty);


    // Draw score.
    if (mouseIsPressed && score > 0) {
        textFont(pixelFont);
        textSize(36);
        textStyle(NORMAL);
        let message = `${score} pets so far`;
        let tx = mouseX + 50;
        let ty = mouseY + 20;
        noStroke();
        fill("black");
        text(message, tx+2, ty+2);
        fill("pink");
        text(message, tx, ty);
    }
}
