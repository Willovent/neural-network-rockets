import { VectorDna } from '../genetics/vectorDna';
import { Vector } from '../physics/vector';
import { Dna } from '../genetics/dna';
import { Obstacle } from './obstacle';
import * as sprite from '../assets/rocket.png';

export class Rocket {
    position: Vector;
    graphics: PIXI.Sprite;
    velocity: Vector = new Vector(0, 0);
    accleration: Vector = new Vector(0, 0);
    private currentStep = 0;
    public isCrashed = false;

    constructor(public stage: PIXI.Container, public dna: VectorDna, public originalPosition: Vector) {
        this.position = originalPosition.clone();
        this.graphics = PIXI.Sprite.fromImage(sprite)
        this.graphics.anchor.set(0.5);
        stage.addChild(this.graphics);
        this.dna.position = this.position;
    }

    private applyForce(force: Vector) {
        this.accleration.add(force);
        this.velocity.add(this.accleration);
        this.position.add(this.velocity);
        this.accleration.mult(0);
        this.velocity.limit(4);
    }

    resetRocket(dna: VectorDna) {
        this.resetPosition();
        this.dna = dna;
        this.currentStep = 0;
        this.dna.position = this.position;
        this.isCrashed = false;
    }

    resetPosition() {
        this.position.x = this.originalPosition.x; this.position.y = this.originalPosition.y;
        this.graphics.x = this.position.x;
        this.graphics.y = this.position.y;
        this.velocity.mult(0);
        this.graphics.visible = true;
        this.isCrashed = false;
    }

    evaluate(target: Vector, obstacles: Obstacle[], width: number, height: number) {
        this.graphics.visible = false;
        let i = 0;
        for (var gene of this.dna.genes) {
            i++;
            if (this.isCrashed || this.dna.succeed > 1) break;
            this.applyForce(gene);
            if (this.position.dist(target) < 30) {
                this.dna.succeed = (1 / i) * this.dna.genes.length * 5;
                break;
            }
            if (obstacles.some(obs => obs.checkColision(this.position))) {
                this.isCrashed = true;
                break;
            }

            if (this.position.x > width || this.position.x < 0 || this.position.y > height || this.position.y < 0) {
                this.isCrashed = true;
                break;
            }
        }
        this.dna.position = this.position;
        this.dna.evaluate();
    }

    update(target: Vector): boolean {
        if (!(this.currentStep > this.dna.genes.length - 1 || this.isCrashed || this.dna.succeed > 1)) {
            this.applyForce(this.dna.genes[this.currentStep]);
            if (this.position.dist(target) < 30) {
                this.dna.succeed = (1 / this.currentStep) * this.dna.genes.length * 5;
            }
        }
        return ++this.currentStep > this.dna.genes.length - 1;
    }

    show(): void {
        this.graphics.x = this.position.x;
        this.graphics.y = this.position.y;
        this.graphics.rotation = this.velocity.getAngle() + Math.PI / 2;
    }
}
