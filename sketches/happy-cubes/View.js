class View {
  constructor() {
    this.position = createVector(0, 0, 300);   // - camera position
    this.input = createVector(0, 0, 0);        // - keyboard input vector
    this.speed = 5;                            // - movement speed
    this.velocity = createVector(0, 0, 0);     // - camera velocity

    this.sensitivity = 0.004;                  // - mouse sensitivity
    this.viewAngle = createVector(0, 0);       // - camera rotation (horizontal, vertical)
    this.viewDirection = createVector(0, 0, -1); // - camera direction (initially looking towards -z)
    this.target = p5.Vector.add(this.position, this.viewDirection); // - position camera aims at
    this.orientation = createVector(0, 1, 0);  // - which way is up?
  }

  update() {
    this.detectInput(false); // - checks for keyboard input if true (see below)

    this.input.normalize();  // - make sure input direction is length 1
    this.velocity = p5.Vector.mult(this.input, this.speed); // - calculate velocity
    this.position.add(this.velocity); // - update position

    this.updatePOV(false);   // - updates camera POV using mouse if true (see below)

    ortho(); // - makes everything look nice and flat, might wanna switch to perspective for other uses
    camera(this.position.x, this.position.y, this.position.z,           // - position & aim the camera
           this.target.x, this.target.y, this.target.z,
           this.orientation.x, this.orientation.y, this.orientation.z);
  }

  detectInput(keyboardEnabled) { // - use keyboard to move the camera around!
    if (keyboardEnabled) {
      this.input.set(0, 0, 0);

      if (keyIsDown(87)) { // w
        this.input.z = -1;
      }
      if (keyIsDown(83)) { // s
        this.input.z = 1;
      }
      if (keyIsDown(87) && keyIsDown(83)) { // w & s
        this.input.z = 0;
      }

      if (keyIsDown(65)) { // a
        this.input.x = -1;
      }
      if (keyIsDown(68)) { // d
        this.input.x = 1;
      }
      if (keyIsDown(65) && keyIsDown(68)) { // a & d
        this.input.x = 0;
      }
    }
  }

  updatePOV(mouseEnabled) { // - turn the view around FPS-style
    if (mouseEnabled) {     //   TODO: use PointerLock to keep mouse inside the window
      let dx =  movedX;
      let dy = -movedY;
      let angularDisplacement = createVector(dx, dy).mult(this.sensitivity);
      this.viewAngle.add(angularDisplacement);

      this.viewDirection = createVector(sin(this.viewAngle.x), 0, -cos(this.viewAngle.x))
      this.target = p5.Vector.add(this.position, this.viewDirection);
    } else {
      this.target.set(this.position.x, this.position.y, this.position.z - 1);
    }
  }
}
