import 'pixi.js';
import { Vector } from '../physics/vector';
import { VectorDna } from '../genetics/vectorDna';
import { Rocket } from './rocket';
import { Population } from '../genetics/population';
import { Obstacle } from './obstacle';
import * as moon from '../assets/moon.png';
import * as bg from '../assets/background.jpg';
import { IKeyListener, keyboard } from '../helpers/keyboad';
import { NeuralDna } from '../genetics/neuralDna';
import * as Synaptic from 'synaptic';
export class Game {
    renderer: PIXI.WebGLRenderer;
    stage = new PIXI.Container();
    obstacles: Obstacle[];
    target: Vector;
    rockets: Rocket[];
    bestRocket: Rocket[];
    population: Population<Synaptic.Architect.Perceptron>;
    rocketsToShow: number;
    stopped: boolean = false;
    inialized: boolean = false;
    keyListeners: { listner: IKeyListener, vector: Vector }[];

    public init(obstacleNumber: number, rocketNumber: number, targetPositon: Vector, rendererSize: { height: number, width: number }, rocketLifeSpan: number, rocketsToShow: number) {
        this.stop();
        setTimeout(() => {
            this.renderer && this.renderer.destroy(true);
            this.renderer = new PIXI.WebGLRenderer(rendererSize.width, rendererSize.height, { antialias: false, transparent: false });
            document.body.appendChild(this.renderer.view);
            this.generateBackground(this.stage);
            this.obstacles = this.generateObstacles(obstacleNumber);
            this.rocketsToShow = rocketsToShow;
            this.target = targetPositon;
            this.generateTargetSprite();
            this.rockets = this.generateRockets(rocketNumber, rocketLifeSpan);
            this.population = new Population<Synaptic.Architect.Perceptron>(this.rockets.map(x => x.dna));
            this.keyListeners = [];
            this.keyListeners.push(
                {
                    listner: keyboard(38),
                    vector: new Vector(0, -1)
                }, {
                    listner: keyboard(40),
                    vector: new Vector(0, 1)
                }
                , {
                    listner: keyboard(37),
                    vector: new Vector(-1, 0)
                }, {
                    listner: keyboard(39),
                    vector: new Vector(1, 0)
                });
            this.keyListeners.forEach(x => {
                x.listner.press = () => this.bestRocket.forEach(r => r.applyForce(x.vector));
            })

            this.start();
        }, 100);

    }

    public stop() {
        this.stopped = true;
    }

    public start() {
        this.stopped = false;
        this.gameLoop();
    }

    private resetRocket() {
        let maxFit = Math.max(...this.rockets.map(x => x.dna.fitness));
        console.log(maxFit);
        let newDnas = this.population.nextGeneration();
        let i = 0;
        this.rockets.forEach(rocket => {
            rocket.resetRocket(<NeuralDna>newDnas[i++]);
        });
    }

    private generateTargetSprite = (): Vector => {
        let targetGraph = PIXI.Sprite.fromImage(moon);
        targetGraph.anchor.set(0.5, 0.5);
        targetGraph.x = this.target.x; targetGraph.y = this.target.y;
        this.stage.addChild(targetGraph);
        return this.target;
    }

    private getBestRocket(size: number) {
        // this.rockets.forEach(x => x.evaluate(this.target, this.obstacles, this.renderer.width, this.renderer.height));
        // this.bestRocket = this.rockets.sort((x, y) => y.dna.fitness - x.dna.fitness).slice(0, size);
        this.bestRocket = this.rockets.slice(0, size);
        this.bestRocket.forEach(x => x.resetPosition());
        this.bestRocket.forEach(x => x.dna.succeed = 1);
    }

    private generateRockets = (popSize: number, lifeSpan: number): Rocket[] => {
        let rockets: Rocket[] = []
        for (let i = 0; i < popSize; i++) {
            let network = new Synaptic.Architect.Perceptron(7, 10, 10, 1);
            this.trainNetwork(network);
            let dna = new NeuralDna(network, this.target);
            let rocket = new Rocket(this.stage, dna, new Vector(this.renderer.width / 2, this.renderer.height));
            rockets.push(rocket);
        }
        this.rockets = rockets;
        this.getBestRocket(this.rocketsToShow);
        return rockets
    }

    private trainNetwork(network){
        let set = new Array(20).fill(0).map(x => {
            let inputs = new Array(7).fill(0).map(x => Math.random());
            let output = inputs[6];
            return {
                input: inputs,
                output: [output]
            }
        });
        let trainer = new Synaptic.Trainer(network);
        trainer.train(set);
    }

    private generateDnaGenes = (lifeSpan: number) => {
        let genes = [];
        for (let i = 0; i < lifeSpan; i++) {
            genes[i] = Vector.random().mult(.2);
        }
        return genes;
    }


    private generateBackground = (stage: PIXI.Container) => {
        let landscapeTexture = PIXI.Texture.fromImage(bg);
        let texture2 = new PIXI.Texture(<any>landscapeTexture, new PIXI.Rectangle(0, 0, this.renderer.width, this.renderer.height));
        let background = new PIXI.Sprite(texture2);
        background.anchor.x = 0;
        background.anchor.y = 0;
        background.position.x = 0;
        background.position.y = 0;
        background.interactive = true;
        background.buttonMode = true;
        background.on('pointerdown', (coucou: PIXI.interaction.InteractionEvent) => {
            var pos = coucou.data.getLocalPosition(this.stage);
            var radius = Math.floor(Math.random() * 40) + 20;
            this.obstacles.push(new Obstacle(this.stage, new Vector(pos.x, pos.y), radius));
        });
        stage.addChild(background);
    }

    private generateObstacles = (size: number): Obstacle[] => {
        let obstacles = [];
        for (let i = 0; i < size; i++) {
            var x = Math.floor(Math.random() * this.renderer.width);
            var y = Math.floor(Math.random() * this.renderer.height);
            var radius = Math.floor(Math.random() * 40) + 20;
            obstacles.push(new Obstacle(this.stage, new Vector(x, y), radius));
        }
        return obstacles;
    }

    private gameLoop() {
        let needReset = false;
        let max = Math.max(this.renderer.height, this.renderer.height);
        this.bestRocket.filter(x => !x.isCrashed).forEach(rocket => {
            let inputs = []
            let rocketnegate = rocket.position.clone().mult(-1);
            rocket.eyes.forEach(e => {
                let collision = this.obstacles.map(o => ({ o, dist: e.dot(o.position.clone().add(rocketnegate)) })).filter(o => {
                    return o.o.checkColision(e.clone().mult(o.dist).add(rocket.position));
                });
                let min = 1;
                if (collision.length) {
                    min = collision.reduce((o, min) => o.dist < min.dist ? o : min).dist;
                } else {
                    let walls = [
                        Vector.interception(rocket.position, e, new Vector(0, 0), new Vector(0, this.renderer.height)),
                        Vector.interception(rocket.position, e, new Vector(0, 0), new Vector(this.renderer.width, 0)),
                        Vector.interception(rocket.position, e, new Vector(this.renderer.width, this.renderer.height), new Vector(-this.renderer.width, 0)),
                        Vector.interception(rocket.position, e, new Vector(this.renderer.width, this.renderer.height), new Vector(0, -this.renderer.height))
                    ].filter(x => x);
                    if (walls.length) {
                        min = walls[0].dist(rocket.position);
                    }
                }
                inputs.push(min / max);
                e.mult(min).add(rocket.position);        
            });
            inputs.push((rocket.velocity.getAngle() + Math.PI) / (Math.PI * 2));
            inputs.push((this.target.clone().add(rocketnegate).getAngle() + Math.PI) / (Math.PI * 2));
            let result = rocket.dna.genes.activate(inputs)[0];
            if (result) {
                rocket.applyForce(Vector.fromAngle((result * Math.PI * 2) - Math.PI));
            }
            rocket.show();

            if (this.obstacles.some(obs => obs.checkColision(rocket.position))) {
                rocket.isCrashed = true;
            }

            if (rocket.position.x > this.renderer.width || rocket.position.x < 0 || rocket.position.y > this.renderer.height + 10 || rocket.position.y < 0) {
                rocket.isCrashed = true;
            }

            if (rocket.update(this.target)) {
                needReset = true;
            }
        });
        if (needReset || this.bestRocket.every(x => x.isCrashed || x.dna.succeed > 1)) {
            this.resetRocket();
            this.getBestRocket(this.rocketsToShow);
        }

        this.renderer.render(this.stage);
        requestAnimationFrame(() => !this.stopped && this.gameLoop());
    }
}
