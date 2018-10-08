import TraitService from 'services/TraitService';
import TriggerService from 'services/TriggerService';
import { EffectIds, TraitIds } from '@grudge/data';
import Effect from './Effect';

export default class DamageEffect extends Effect {
  static id = EffectIds.DAMAGE;

  static async apply(effect, card, actionData) {
    const damage = card.getTrait(TraitIds.ATTACK).value;
    const health = actionData.targetCard.getTrait(TraitIds.HEALTH);
    const remaining = health.value - damage;
    const value = remaining <= 0 ? 0 : remaining;

    const updatedCard = await TraitService.addTrait(actionData.targetCardId, {
      id: TraitIds.HEALTH,
      max: health.max,
      value,
    });

    if (value <= 0) {
      await TriggerService.onDestroyed(updatedCard);
    }
  }
}
