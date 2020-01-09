import * as Phaser from "phaser"

export class LoadScene extends Phaser.Scene {
  /**
   *
   */
  constructor() {
    super({ key: "Load" });
  }
  preload = () => {
    this.load.spritesheet('bug-catcher', 'assets/img/bugnet.png', { frameWidth: 31, frameHeight: 70 })
    this.load.spritesheet('bugs', 'assets/img/bugs.png', {frameWidth: 8, frameHeight: 8})
  }
  create = () => {
    console.log('starting scene');
    this.scene.start("BugCatch");
  }
}