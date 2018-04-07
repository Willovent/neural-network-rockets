import { Game } from './game/game';
import { Vector } from './physics/vector';

var game = new Game();
game.init(20, 50, new Vector(400, 100), { width: 800, height: 900 }, 900, 50);