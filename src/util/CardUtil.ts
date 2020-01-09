import { Card } from './../game-objects/Card';
import { Enemy } from './../game-objects/Enemy';
import { Player } from './../game-objects/Player';
import { MoveConfig, PropModifier, CardConfig, PropNames } from './../data/Data';
import { Prop } from './../data/Data';
export interface ICardAffected {
  properties: Map<Prop, number>;

}

export class CardUtil {
  public static IsPropModifier = (dmg: number | PropModifier): dmg is PropModifier => {
    return (dmg as PropModifier).amt !== undefined;
  }
  public static GetPropertyValue = (mod: PropModifier, player: Player, enemy: Enemy) => {
    return mod.owner == "enemy" ? enemy.properties.get(mod.type) : player.properties.get(mod.type);
  }
  public static ResolveValue = (mod: PropModifier, player: Player, enemy: Enemy): number => {
    let number = 0;
    if (mod.amt) {
      let modAmt = 0;
      if (CardUtil.IsPropModifier(mod.amt)) {
        modAmt = CardUtil.ResolveValue(mod.amt as PropModifier, player, enemy)
      }
      else modAmt = mod.amt;
      number += modAmt;
    }
    if (mod.multiplier) {
      let modMultiplier = 0;
      if (CardUtil.IsPropModifier(mod.multiplier)) {
        modMultiplier = CardUtil.ResolveValue(mod.multiplier as PropModifier, player, enemy)
      }
      else modMultiplier = mod.multiplier;

      number *= modMultiplier;
    }
    return number
  }
  public static ApplyCard = (player: Player, enemy: Enemy, propMods: Array<PropModifier>): Array<string> => {
    let notifications = [];
    for (let i = 0; i < propMods.length; i++) {
      const mod = propMods[i];
      let entityToApplyTo = mod.owner == "enemy" ? enemy : player
      let entityApplying = mod.owner == "enemy" ? player : enemy
      if (!entityToApplyTo.properties.get(mod.type)) {
        entityToApplyTo.properties.set(mod.type, 0);
      }

      let baseStat = CardUtil.GetPropertyValue(mod, player, enemy);

      let deltaNumber = CardUtil.ResolveValue(mod, player, enemy);

      if (mod.type == Prop.HEALTH && deltaNumber < 0) {
        if (entityToApplyTo.properties.get(Prop.BURN) > 0) {
          deltaNumber *= 1.5;
        }
        if (entityApplying.properties.get(Prop.FREEZE) > 0) {
          deltaNumber *= 0.5;
        }
        if (entityToApplyTo.properties.get(Prop.FLYING) > 0) {
          deltaNumber = 0;
          notifications.push("Attack dodged!");
        }
        if (entityApplying.properties.get(Prop.CONFUSE) > 0) {
          let rand = Math.random()
          if (rand > 0.6) {
            deltaNumber = 0;
            notifications.push("Attack missed!");
          }
        }
      }

      entityToApplyTo.properties.set(mod.type, Math.round(deltaNumber + baseStat));
    }
    return notifications
  }

  public static Shuffle = (arr: Array<any>) => {
    return arr.sort((a, b) => { return Math.random() - 0.5 });
  }
}