import { BugCatch } from './scenes/BugCatch';
import { LoadScene } from './scenes/LoadScene';
export class Game extends Phaser.Game {
  /**
   *
   */
  constructor(gameConfig: Phaser.Types.Core.GameConfig) {
    super(gameConfig);
    this.scene.start("Load");
  }
}
let game = new Game({
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  backgroundColor: 0,
  zoom: 4,
  physics: {
    default: "arcade",
    arcade: {
      debug: true
    }
  },
  scene: [
    LoadScene,
    BugCatch,
  ],
  render: {
    pixelArt: true
  }
});



