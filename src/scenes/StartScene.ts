import * as Phaser from "phaser"
export class StartScene extends Phaser.Scene {
  /**
   *
   */

  private space: Phaser.Input.Keyboard.Key;
  constructor() {
    super({ key: "Start" });
  }
  create = () => {
    this.space = this.input.keyboard.addKey("SPACE")
    let title = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, "title")
    title.scale = 4;
  }
  update = () => {
    if (this.space.isDown) {
      this.scene.start("BugCatch")
    }
  }
}