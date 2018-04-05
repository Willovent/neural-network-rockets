import { Game } from './game/game';
import { Vector } from './physics/vector';

var game = new Game();
game.init(20, 3000, new Vector(200, 70), { width: 400, height: 900 }, 900, 3);