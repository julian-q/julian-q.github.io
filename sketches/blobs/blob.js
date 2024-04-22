class Blob {
    static mode = 'bounce';
    static sun = null;
    static sunMass = 5;

    constructor() {
        var theta = random(TWO_PI);
        var dist = 100;
        this.pos = createVector(
            Blob.sun.x + dist * cos(theta),
            Blob.sun.y + dist * sin(theta)
        );
        this.r = random(10, 20);
        this.color = color(random(360), 100, 100);
        this.acc = createVector(0, 0);
        var u = p5.Vector.sub(Blob.sun, this.pos).normalize();
        var uPerp = createVector(-u.y, u.x);
        this.vel = uPerp.mult(3);
        this.positions = [];
    }

    update() {
        switch (Blob.mode) {
            case 'gravity':
                var dist = this.pos.dist(Blob.sun);
                var u = p5.Vector.sub(Blob.sun, this.pos).normalize();
                var mag = Blob.sunMass * this.r * this.r / (dist * dist);
                this.acc = u.mult(mag);
                break;
            case 'circle':
                this.acc = createVector(0, 0);
                var u = p5.Vector.sub(Blob.sun, this.pos).normalize();
                var uPerp = createVector(-u.y, u.x);
                var mag = this.vel.dot(uPerp);
                this.vel = uPerp.mult(mag); 
                break;
            case 'bounce':
                this.acc = createVector(0, 0);
                if (this.pos.x > width - this.r || this.pos.x < this.r) {
                    this.vel.x *= -1;
                }
                if (this.pos.y > height - this.r || this.pos.y < this.r) {
                    this.vel.y *= -1;
                }
                break;
        }
        this.vel.add(this.acc)
        // this.vel.mult(0.99);
        this.positions.push(this.pos.copy());
        this.pos.add(this.vel);
        if (this.positions.length > 50) {
            this.positions.shift();
        }
    }

    show() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        for (var i = 0; i < this.positions.length; i++) {
            var p = this.positions[i];
            var r = lerp(0, this.r, i / this.positions.length);
            ellipse(p.x, p.y, r * 2, r * 2);
        }
    }
}