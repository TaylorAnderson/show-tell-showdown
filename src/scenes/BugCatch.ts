import * as Phaser from "phaser"
import { Point } from "pixi.js";

enum BugType {
  FLY, 
  BEETLE,
  SPIDER,
  STICK 
}
enum BugCatcherState {
  CHARGING, 
  SWINGING, 
  IDLE
}
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
      frameRate: 30,
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
}

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
        this.anims.play('slap')
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
    if (data.key == 'slap') {
      this.state = BugCatcherState.IDLE;
      // this.play('up');
    }
  }
}

//base class. don't use this directly
class Bug extends Phaser.GameObjects.Sprite {
  bugType : BugType = BugType.BEETLE;
  velocity: Phaser.Math.Vector3 = new Phaser.Math.Vector3(0, 0, 0);
  sWidth:number;
  sHeight:number;
  initialVel:Phaser.Math.Vector3 = new Phaser.Math.Vector3;
  debug: Phaser.GameObjects.Graphics;
  shadow: Phaser.GameObjects.Sprite;
  actualY:number = 0; //we use this because in topdown, y represents BOTH actual  y value AND z.
  usingZ:boolean = false;
  constructor(scene:Phaser.Scene, x:number, y:number, frame:number) {
    super(scene, x, y, 'bugs', frame);


    this.actualY = y; 
    
    this.shadow = scene.add.sprite(x, y, 'bugs', frame);
    this.shadow.alpha = 0.5;

    this.sWidth = scene.game.scale.width;
    this.sHeight = scene.game.scale.height;
    this.debug = scene.add.graphics({fillStyle: {color: 0}, lineStyle: {color: 0}});

    let center = {x: scene.game.scale.width/2, y: scene.game.scale.height/2};
    this.initialVel.set(center.x - this.x, center.y - this.y, 0); 
  }
  getVectorInsideCircle = (diameter:number) => {
    let randAngle = Phaser.Math.RND.realInRange(0, 360);
    randAngle *= Phaser.Math.DEG_TO_RAD;
    let v = new Phaser.Math.Vector3(Math.cos(randAngle), Math.sin(randAngle), 0);
    return v.normalize().scale(diameter);
  }
  /**
   * Gets a vector facing a similar direction than the passed vector
   */
  getSimilarVector = (v:Phaser.Math.Vector3, dist:number) => {
    let velAngle = Math.atan2(v.y, v.x) * Phaser.Math.RAD_TO_DEG;
    let velLength = v.length();
    velAngle += Phaser.Math.RND.realInRange(-dist, dist);
    velAngle = velAngle * Phaser.Math.DEG_TO_RAD;
    v.x = Math.cos(velAngle);
    v.y = Math.sin(velAngle);
    v.z = 0;
    v.normalize().scale(velLength);
    return v;
  }

  preUpdate(time, delta) {
    this.updateVelocity.call(this, time, delta);
    if (this.velocity.length() > 0.1) this.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI/2
    if (this.usingZ) this.velocity.z += 0.1;
    
    this.x += this.velocity.x;
    
    if (this.z + this.velocity.z < 0) this.z += this.velocity.z;
    
    this.actualY += this.velocity.y;

    this.y = this.actualY + this.z;
    

    this.shadow.x = this.x;
    this.shadow.y = this.actualY;
    this.shadow.rotation = this.rotation;
  }
  updateVelocity(time, delta) {
    //gets overridden
  } 

}
class Fly extends Bug {
  private delay:number = 0;
  private firstJump:boolean = true;
  constructor(scene:Phaser.Scene, x:number, y:number) {
    super(scene, x, y, 0)
    this.bugType = BugType.FLY;
    this.usingZ = true;
    this.delay = Phaser.Math.RND.realInRange(0, 1);
  }
  updateVelocity(time:number, delta:number) {
    this.delay += delta/1000;
    if (this.delay > 1) {
      this.delay = 0;
      let velAngle = Phaser.Math.RND.angle();
      velAngle = Math.floor(velAngle / 90) * 90;
      if (!this.firstJump) {
        this.velocity.x = Math.cos(velAngle);
        this.velocity.y = Math.sin(velAngle);
      }
      else {
        this.velocity.x = this.initialVel.x;
        this.velocity.y = this.initialVel.y;
      }

      this.velocity.normalize().scale(5);
      this.velocity.z = -3;
      
      this.angle = velAngle + 90;
      
    }
    this.velocity.scale(0.9);
  }
}
class Beetle extends Bug {
  constructor(scene, x, y) {
    super(scene, x, y, 2);
    this.bugType = BugType.BEETLE;

  }
  updateVelocity(time:number, delta:number) {
    
  }
}
class Spider extends Bug {
  
  velAdjustTimer:number = 0;
  velAdjustTime:number = 0.2;
  constructor(scene:Phaser.Scene, x:number, y:number) {
    super(scene, x, y, 1);
    this.bugType = BugType.SPIDER;
    this.velocity = new Phaser.Math.Vector3(this.initialVel.x, this.initialVel.y, 0);
    this.velocity.normalize().scale(2);
  }
  updateVelocity(time:number, delta:number) {
    this.velAdjustTimer += delta;
    if (this.velAdjustTimer > this.velAdjustTime) {
      this.velocity = this.getSimilarVector(this.velocity, 20);
      this.velAdjustTimer = 0;
    }
  }
}
enum StickBeetleState {
  IDLE,
  MOVING
}
class StickBeetle extends Bug {
  starting:boolean = true;
  state:StickBeetleState = StickBeetleState.MOVING;
  timer:number = 0;
  velChangeTimer = 0;
  velChangeTime = 0.1;
  chillTime:number = 0.5;
  moveTime:number = 1;
  constructor(scene, x, y) {
    super(scene, x, y, 3)
    this.bugType = BugType.STICK;
    this.velocity.x = this.initialVel.x;
    this.velocity.y = this.initialVel.y;
    this.velocity.z = 0;
    this.velocity.normalize().scale(1);
  }
  updateVelocity(time:number, delta:number) {
    this.timer += delta/1000;
    if (this.state == StickBeetleState.MOVING) {
      if (this.starting) {
        this.starting = false;
      }
     
      this.velChangeTimer += delta;
      if (this.velChangeTimer > this.velChangeTime) {
        this.velocity = this.getSimilarVector(this.velocity, 50); 
        this.velocity.normalize().scale(1);
        this.velChangeTimer = 0;
      }
      if (this.timer > this.moveTime) {
        this.timer = 0;
        this.state = StickBeetleState.IDLE;
      }
    }
    if (this.state == StickBeetleState.IDLE) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      
      if (this.timer > this.chillTime) {
        this.timer = 0;
        this.state = StickBeetleState.MOVING;
        this.velocity = this.getVectorInsideCircle(1);
      }
    }
  }
}

interface WeightedItem {
  item:any, 
  weight:number
}
class BugSpawner {
  spawnPositions:Array<{x: number, y:number}> = [];
  spawnDelay:number = 1;
  spawnTimer:number = 0;
  bugProbabilities: Array<WeightedItem> = [
    {item: BugType.FLY,     weight: 0.5},
    {item: BugType.STICK,   weight: 0.4},
    {item: BugType.SPIDER,  weight: 0.1},
  ]
  weightedBugList:Array<BugType> = [];
  constructor(private scene:Phaser.Scene, gameWidth:number, gameHeight:number) {
    for (let i = 0; i < gameWidth; i += 5) {
      this.spawnPositions.push({x: i, y: 0});
      this.spawnPositions.push({x: i, y: gameHeight})
    }
    for (let j = 0; j < gameHeight; j+=5) {
      this.spawnPositions.push({x: 0, y: j})
      this.spawnPositions.push({x: gameWidth, y: j})
    }

    this.weightedBugList = this.generateWeighedList(this.bugProbabilities);
  }
  update = (delta:number) => {
    this.spawnTimer += delta/1000;
    if (this.spawnTimer > this.spawnDelay) {
      this.spawnTimer = 0;
      let pos = Phaser.Math.RND.pick(this.spawnPositions);
      let bugType = Phaser.Math.RND.pick(this.weightedBugList);
      let bug:Bug;
      switch (bugType) {
        case BugType.FLY:
          bug = new Fly(this.scene, pos.x, pos.y);
          break;
        case BugType.BEETLE: 
          bug = new Beetle(this.scene, pos.x, pos.y);
          break;
        case BugType.SPIDER:
          bug = new Spider(this.scene, pos.x, pos.y);
          break;
        case BugType.STICK: 
          bug = new StickBeetle(this.scene, pos.x, pos.y);
          break;
      }
      this.scene.add.existing(bug);
    }
  }

  generateWeighedList = (list:Array<WeightedItem>) => {
    let weightedList = [];

    // Loop over weights
    for (let i = 0; i < list.length; i++) {
      let multiples = list[i].weight * 100;

      // Loop over the list of items
      for (let j = 0; j < multiples; j++) {
        weightedList.push(list[i].item);
      }
    }
    return weightedList;
  };
 
}