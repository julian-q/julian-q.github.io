let view;   // - camera controller (user input disabled)   see View.js
let cubes;  // - array of cube objects                     see Cube.js

function setup() {
  var canvas = createCanvas(600, 600, WEBGL);
  canvas.parent('p5-sketch')
  pixelDensity(2.0);
  frameRate(24);
  view = new View();
  cubes = [];

  let step = width * (1 / 7);          // - distance between each cube
  let start = -step * 10;            // - starting location of first cube
  for (let i = 0; i < 14; i++) {     // - use a loop to populate cube array
    for (let j = 0; j < 14; j++) {
      cubes.push(new Cube(start + step * i, start + step * j, 0, PI/7 * i));
    }
  }
}

function draw() {
  background(255);                           // - white background
  ambientLight(255);                         // - white ambient light
  pointLight(255, width/2, -height/2, 0)     // - white spotlight @ top right

  view.update();                             // - basically does nothing
                                             //   because I disabled
                                             //   user input

  for (let i = 0; i < cubes.length; i++) {   // - update & display each cube
    cubes[i].update();
    cubes[i].show();
  }
}
