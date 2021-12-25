class Cube {
  constructor(x, y, z, rotationOffset) {
    this.x = x;     // - cube position
    this.y = y;
    this.z = z;

    this.size = 50; // - cube size

    this.xRotation = PI/6;                      // - tilts cube forward a bit
    this.yRotation = -PI/4 + rotationOffset;    // - spins cube around

    this.hue = this.y; // - cube color depends on y position
    colorMode(HSB, 360, 100, 100)
  }

  show() {
    noStroke(); // - get rid of wireframe

    push();     // - draw a 3-sided cube with 3 planes
      translate(this.x, this.y, this.z);
      this.baseRotation(); // - see implementation below

      push();
        translate(0, 0, this.size/2);
        specularMaterial(color((this.hue) % 360, 35, 100));
        plane(this.size);
      pop();

      push();
        translate(0, -this.size/2, 0);
        rotateX(HALF_PI);
        specularMaterial(color((this.hue + 45) % 360, 35, 100));
        plane(this.size);
      pop();

      push();
        translate(this.size/2, 0, 0);
        rotateY(HALF_PI);
        specularMaterial(color((this.hue + 90) % 360, 35, 100));
        plane(this.size);
      pop();
    pop();
  }

  update() {
    this.x += 0.2;                       // - move down and right
    this.y += 0.2;

    let step = width * (1/7);            // - teleport cubes back when they
    if (this.x >= (width/2) + step) {    //   exit the screen
      this.x -= width + step * 7;
    }
    if (this.y >= (height/2) + step) {
      this.y -= height + step * 7;
    }

    this.yRotation += 0.01;              // - spinny spin

    this.hue = abs(this.y * 1.25) % 360; // - use y position to update hue
  }

  baseRotation() { // - gets the cube in the right orientation before spinning
    rotateX(this.xRotation);
    rotateY(this.yRotation);
  }
}
