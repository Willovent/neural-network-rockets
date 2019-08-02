import { Vector } from '../physics/vector';
import * as sprite from '../assets/rocket.png';
import { NeuralDna } from '../genetics/neuralDna';
import { Container, Sprite, Graphics } from 'pixi.js';

export class Rocket {
  position: Vector;
  graphics: Sprite;
  velocity: Vector = new Vector(0, 0);
  accleration: Vector = new Vector(0, 0);
  eyes = [
    Vector.fromAngle(Math.PI / 4),
    Vector.fromAngle(-Math.PI / 4),
    Vector.fromAngle(Math.PI / 2),
    Vector.fromAngle(-Math.PI / 2),
    Vector.fromAngle(Math.PI),
    Vector.fromAngle(0),
    Vector.fromAngle(3*Math.PI/4),
    Vector.fromAngle(-3*Math.PI/4)
  ];
  private currentStep = 0;
  public isCrashed = false;

  constructor(public stage: Container, public dna: NeuralDna, public originalPosition: Vector) {
    this.position = originalPosition.clone();
    this.graphics = Sprite.from(sprite);
    this.graphics.anchor.set(0.5);
    this.stage.addChild(this.myGraph);
    stage.addChild(this.graphics);
    this.dna.position = this.position;
  }

  applyForce(force: Vector) {
    // var localForce = Vector.fromAngle(force.getAngle() + this.velocity.getAngle() + Math.PI / 2).mult(force.dist(new Vector(0, 0)));
    this.accleration.add(force);
    this.velocity.add(this.accleration);
    this.position.add(this.velocity);
    this.accleration.mult(0);
    this.velocity.mult(0.7);
  }

  resetRocket(dna: NeuralDna) {
    this.resetPosition();
    this.dna = dna;
    this.currentStep = 0;
    this.dna.position = this.position;
    this.isCrashed = false;
  }

  resetPosition() {
    this.position.x = this.originalPosition.x;
    this.position.y = this.originalPosition.y;
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
    this.velocity.mult(0);
    this.graphics.visible = true;
    this.graphics.rotation = 0;
    this.isCrashed = false;
  }

  evaluate() {
    // this.graphics.visible = false;
    // let i = 0;
    // for (var gene of this.dna.genes) {
    //     i++;
    //     if (this.isCrashed || this.dna.succeed > 1) break;
    //     this.applyForce(gene);
    //     if (this.position.dist(target) < 30) {
    //         this.dna.succeed = (1 / i) * this.dna.genes.length * 5;
    //         break;
    //     }
    //     if (obstacles.some(obs => obs.checkColision(this.position))) {
    //         this.isCrashed = true;
    //         break;
    //     }

    //     if (this.position.x > width || this.position.x < 0 || this.position.y > height || this.position.y < 0) {
    //         this.isCrashed = true;
    //         break;
    //     }
    // }
    this.dna.position = this.position;
    this.dna.evaluate();
  }

  update(target: Vector): boolean {
    // if (!(this.currentStep > this.dna.genes.length - 1 || this.isCrashed || this.dna.succeed > 1)) {
    //     this.applyForce(this.dna.genes[this.currentStep]);
    if (this.position.dist(target) < 30) {
      this.dna.succeed = 100;
    }
    // }
    // return ++this.currentStep > this.dna.genes.length - 1;
    this.applyForce(new Vector(0, 0));

    this.eyes = [
      Vector.fromAngle(Math.PI / 4),
      Vector.fromAngle(-Math.PI / 4),
      Vector.fromAngle(Math.PI / 2),
      Vector.fromAngle(-Math.PI / 2),
      Vector.fromAngle(Math.PI),
      Vector.fromAngle(0),
      Vector.fromAngle(3*Math.PI/4),
      Vector.fromAngle(-3*Math.PI/4)
    ];
    return false;
  }

  myGraph = new Graphics();

  show(drawEyes = false): void {
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
    if (this.velocity.x == 0 && this.velocity.y == 0) {
      this.graphics.rotation = 0;
    } else {
      this.graphics.rotation = this.velocity.getAngle() + Math.PI / 2;
    }
    if (drawEyes) {
      this.myGraph.clear();
      this.myGraph.lineStyle(1, 0xffffff);

      this.eyes.forEach(eye => {
        this.myGraph.moveTo(this.position.x, this.position.y).lineTo(eye.x, eye.y);
      });
    }
  }
}
