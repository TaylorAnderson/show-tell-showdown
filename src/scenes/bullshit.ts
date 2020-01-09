export class BugCatch extends Phaser.Scene {
  catcher:Catcher;
  objects:Array<Phaser.GameObjects.Sprite>;
  spawner:BugSpawner;
  
  constructor() {
    super({key: 'BugCatch'});
  }
  preload() {
    let slapFrames = this.anims.generateFrameNumbers('bug-catcher', {frames: [0, 2, 4, 6, 8]});
    slapFrames[slapFrames.length-1].duration = 150;
    this.anims.create({
      key: 'slap',
      frames: slapFrames,
      frameRate: 60,
    })
    this.anims.create({
      key: 'up',
      frames: slapFrames.reverse(),
      frameRate: 40
    })
    this.anims.create({
      key: 'idle',
      frames: [{key: 'bug-catcher', frame: 0}],
      frameRate: 0
    })
  }
  create() {
    this.cameras.main.setBackgroundColor(0x6cd947);
    this.add.existing(new StickBeetle(this, 30, 30))
    this.spawner = new BugSpawner(this, this.game.scale.width, this.game.scale.height);
    this.catcher = new Catcher(this, 0, 0);
    this.add.existing(this.catcher); 
  }

  update(time, delta) {
    this.spawner.update(delta);
  }
}u
class Catcher extends Phaser.GameObjects.Sprite {
  state:BugCatcherState = BugCatcherState.IDLE;
  originalPos:Point = new Point();
  chargeTimer:number = 0;
  chargeTime:number = 1;
  constructor(scene:Phaser.Scene, x:number, y:number) {
    super(scene, x, y, 'bug-catcher', 0)
    this.scene.input.on('pointerdown', this.onPointerDown)
    this.on('animationcomplete', this.onSlapComplete)
  }
  preUpdate = (time, delta) => {
    if (this.state == BugCatcherState.IDLE) {
      this.x = this.scene.input.x;
      this.y = this.scene.input.y - this.height/2 + 40 // account for the net overflow
    }
    if (this.state == BugCatcherState.CHARGING) {
      this.x = this.originalPos.x + Phaser.Math.RND.realInRange(-1, 1);
      this.y = this.originalPos.y + Phaser.Math.RND.realInRange(-1, 1);
      this.chargeTimer += delta/1000;
      if (this.chargeTimer > this.chargeTime) {
        // THIS ANIMATION DOESNT PLAY
        this.play('slap')
        this.state = BugCatcherState.SWINGING;
        this.x = this.originalPos.x;
        this.y = this.originalPos.y;
      }
    }
  }
  onPointerDown = () => {
    if (this.state != BugCatcherState.IDLE) return;
    this.state = BugCatcherState.CHARGING;
    this.originalPos.x = this.x;
    this.originalPos.y = this.y;
  }
  onSlapComplete = (data) => {
    console.log(data);
    if (data.key == 'slap') {
      this.state = BugCatcherState.IDLE;
      this.play('up');
      console.log('HELLO');
    }
  }
}