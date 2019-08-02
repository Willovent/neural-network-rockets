import { Vector } from '../physics/vector';
import * as sprite from '../assets/meteor1.png';
import { Sprite, Container } from 'pixi.js';

export class Obstacle {
  constructor(stage: Container, public position: Vector, public radius) {
    var graphic = Sprite.from(sprite);
    graphic.position.x = position.x;
    graphic.position.y = position.y;
    graphic.width = radius * 2;
    graphic.height = radius * 2;
    graphic.anchor.set(0.5, 0.5);
    stage.addChild(graphic);
  }

  checkColision(element: Vector): boolean {
    return this.position.dist(element) < this.radius;
  }
}
