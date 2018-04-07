import { VectorDna } from '../genetics/vectorDna';
import { Vector } from '../physics/vector';
import { Dna } from '../genetics/dna';
import { Obstacle } from './obstacle';
import * as sprite from '../assets/rocket.png';
import * as Synaptic from 'synaptic';
import { NeuralDna } from '../genetics/neuralDna';

export class Rocket {
    position: Vector;
    graphics: PIXI.Sprite;
    velocity: Vector = new Vector(0, 0);
    accleration: Vector = new Vector(0, 0);
    eyes: Vector[] = []
    private currentStep = 0;
    public isCrashed = false;

    constructor(public stage: PIXI.Container, public dna: NeuralDna, public originalPosition: Vector) {
        this.position = originalPosition.clone();
        this.graphics = PIXI.Sprite.fromImage(sprite)
        this.graphics.anchor.set(0.5);
        this.stage.addChild(this.myGraph)
        stage.addChild(this.graphics);
        this.dna.position = this.position;
    }

    applyForce(force: Vector) {
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
        this.position.x = this.originalPosition.x; this.position.y = this.originalPosition.y;
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
            Vector.fromAngle(this.velocity.getAngle() - Math.PI / 4),
            Vector.fromAngle(this.velocity.getAngle() + Math.PI / 4),
            Vector.fromAngle(this.velocity.getAngle() - Math.PI / 2),
            Vector.fromAngle(this.velocity.getAngle() + Math.PI / 2),
            Vector.fromAngle(this.velocity.getAngle()),
        ]
        return false;
    }
    myGraph = new PIXI.Graphics();
    show(): void {
        this.graphics.x = this.position.x;
        this.graphics.y = this.position.y;
        if (this.velocity.x == 0 && this.velocity.y == 0) {
            this.graphics.rotation = 0;
        } else {
            this.graphics.rotation = this.velocity.getAngle() + Math.PI / 2;
        }
        
        this.myGraph.clear();
        this.myGraph.lineStyle(1, 0xffffff)

        this.eyes.forEach(eye => {
            this.myGraph.moveTo(this.position.x, this.position.y)
                .lineTo(eye.x, eye.y)
        });
    }
}
