import { Vector } from '../physics/vector';
import { Rocket } from './rocket';
import { Population } from '../genetics/population';
import { Obstacle } from './obstacle';
import * as moon from '../assets/moon.png';
import * as bg from '../assets/background.jpg';
import { IKeyListener, keyboard } from '../helpers/keyboad';
import { NeuralDna, createModel } from '../genetics/neuralDna';
import { Sequential, sequential, layers, tensor2d } from '@tensorflow/tfjs';
import { Sprite, Texture, Application, Container, Rectangle, interaction } from 'pixi.js';

export class Game {
  app: Application;
  stage = new Container();
  obstacles: Obstacle[];
  target: Vector;
  rockets: Rocket[];
  bestRocket: Rocket[];
  rocketsToShow: number;
  stopped: boolean = false;
  inialized: boolean = false;
  keyListeners: { listner: IKeyListener; vector: Vector }[];
  population: Population<Sequential>;

  public init(
    obstacleNumber: number,
    rocketNumber: number,
    targetPositon: Vector,
    rendererSize: { height: number; width: number },
    rocketLifeSpan: number,
    rocketsToShow: number
  ) {
    this.stop();
    setTimeout(() => {
      this.app && this.app.destroy(true);
      this.app = new Application({
        width: rendererSize.width,
        height: rendererSize.height,
        antialias: false,
        transparent: false,
        resolution: 1
      });
      document.body.appendChild(this.app.view);
      this.generateBackground(this.stage);
      this.obstacles = this.generateObstacles(obstacleNumber);
      this.rocketsToShow = rocketsToShow;
      this.target = targetPositon;
      this.generateTargetSprite();
      this.rockets = this.generateRockets(rocketNumber, rocketLifeSpan);
      this.population = new Population<Sequential>(this.rockets.map(x => x.dna));
      this.keyListeners = [];
      this.keyListeners.push(
        {
          listner: keyboard(38),
          vector: new Vector(0, -1)
        },
        {
          listner: keyboard(40),
          vector: new Vector(0, 1)
        },
        {
          listner: keyboard(37),
          vector: new Vector(-1, 0)
        },
        {
          listner: keyboard(39),
          vector: new Vector(1, 0)
        }
      );
      this.keyListeners.forEach(x => {
        x.listner.press = () => this.bestRocket.forEach(r => r.applyForce(x.vector));
      });

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
    let targetGraph = Sprite.from(moon);
    targetGraph.anchor.set(0.5, 0.5);
    targetGraph.x = this.target.x;
    targetGraph.y = this.target.y;
    this.stage.addChild(targetGraph);
    return this.target;
  };

  private getBestRocket(size: number) {
    // this.rockets.forEach(x => x.evaluate(this.target, this.obstacles, this.renderer.width, this.renderer.height));
    // this.bestRocket = this.rockets.sort((x, y) => y.dna.fitness - x.dna.fitness).slice(0, size);
    this.bestRocket = this.rockets.slice(0, size);
    this.bestRocket.forEach(x => x.resetPosition());
    this.bestRocket.forEach(x => (x.dna.succeed = 1));
  }

  private generateRockets = (popSize: number, lifeSpan: number): Rocket[] => {
    let rockets: Rocket[] = [];
    for (let i = 0; i < popSize; i++) {
      let network = createModel();
      let dna = new NeuralDna(network, this.target);
      let rocket = new Rocket(this.stage, dna, new Vector(this.app.renderer.width / 2, this.app.renderer.height));
      rockets.push(rocket);
    }
    this.rockets = rockets;
    this.getBestRocket(this.rocketsToShow);
    return rockets;
  };

  private generateDnaGenes = (lifeSpan: number) => {
    let genes = [];
    for (let i = 0; i < lifeSpan; i++) {
      genes[i] = Vector.random().mult(0.2);
    }
    return genes;
  };

  private generateBackground = (stage: Container) => {
    let landscapeTexture = Sprite.from(bg);
    let texture2 = new Texture(<any>landscapeTexture, new Rectangle(0, 0, this.app.renderer.width, this.app.renderer.height));
    let background = new Sprite(texture2);
    background.anchor.x = 0;
    background.anchor.y = 0;
    background.position.x = 0;
    background.position.y = 0;
    background.interactive = true;
    background.buttonMode = true;
    background.on('pointerdown', (coucou: interaction.InteractionEvent) => {
      var pos = coucou.data.getLocalPosition(this.stage);
      var radius = Math.floor(Math.random() * 40) + 20;
      this.obstacles.push(new Obstacle(this.stage, new Vector(pos.x, pos.y), radius));
    });
    stage.addChild(background);
  };

  private generateObstacles = (size: number): Obstacle[] => {
    let obstacles = [];
    for (let i = 0; i < size; i++) {
      var x = Math.floor(Math.random() * this.app.renderer.width);
      var y = Math.floor(Math.random() * this.app.renderer.height);
      var radius = Math.floor(Math.random() * 40) + 20;
      obstacles.push(new Obstacle(this.stage, new Vector(x, y), radius));
    }
    return obstacles;
  };

  private gameLoop() {
    let needReset = false;
    let max = 200;
    this.bestRocket
      .filter(x => !x.isCrashed)
      .forEach(rocket => {
        let inputs = [];
        let rocketnegate = rocket.position.clone().mult(-1);
        rocket.eyes.forEach(eye => {
          let collision = this.obstacles
            .map(o => ({ o, dist: eye.dot(o.position.clone().add(rocketnegate)) }))
            .filter(o => {
              return o.o.checkColision(
                eye
                  .clone()
                  .mult(o.dist)
                  .add(rocket.position)
              );
            });
          let min = 1;
          if (collision.length) {
            min = Math.max(Math.min(...collision.map(o => o.dist - o.o.radius)), 10);
          } else {
            let walls = [
              Vector.interception(rocket.position, eye, new Vector(0, 0), new Vector(0, this.app.renderer.height)),
              Vector.interception(rocket.position, eye, new Vector(0, 0), new Vector(this.app.renderer.width, 0)),
              Vector.interception(
                rocket.position,
                eye,
                new Vector(this.app.renderer.width, this.app.renderer.height),
                new Vector(-this.app.renderer.width, 0)
              ),
              Vector.interception(
                rocket.position,
                eye,
                new Vector(this.app.renderer.width, this.app.renderer.height),
                new Vector(0, -this.app.renderer.height)
              )
            ].filter(x => x);
            if (walls.length) {
              min = Math.min(...walls.map(x => x.dist(rocket.position)));
            }
          }
          min = Math.min(min, 200);
          inputs.push(min);
          eye.mult(min).add(rocket.position);
        });
        inputs.push((rocket.velocity.getAngle() + Math.PI) / (Math.PI * 2));
        inputs.push(
          (this.target
            .clone()
            .add(rocketnegate)
            .getAngle() +
            Math.PI) /
            (Math.PI * 2)
        );
        inputs.push(this.target.dist(rocket.position));
        let result = (rocket.dna.genes.predict(tensor2d([inputs])) as any).dataSync()[0];
        if (result) {
          rocket.applyForce(Vector.fromAngle(result * Math.PI * 2));
        }
        rocket.show(true);

        if (this.obstacles.some(obs => obs.checkColision(rocket.position))) {
          rocket.isCrashed = true;
        }

        if (
          rocket.position.x > this.app.renderer.width ||
          rocket.position.x < 0 ||
          rocket.position.y > this.app.renderer.height + 10 ||
          rocket.position.y < 0
        ) {
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

    this.app.renderer.render(this.stage);
    requestAnimationFrame(() => !this.stopped && this.gameLoop());
  }
}
