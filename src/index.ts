import { Game } from './game/game';
import { Vector } from './physics/vector';

var game = new Game();
game.init(10, 10, new Vector(200, 100), { width: 400, height: 900 }, 900, 10);