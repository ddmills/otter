import {
  ContextAdministrator,
  ContextInterrogator,
  ReferenceResolver,
} from '@grudge/domain/interpreters';
import NotificationService from 'services/NotificationService';
import { EffectIds } from '@grudge/data';
import Effect from './Effect';

export default class CollectEffect extends Effect {
  static id = EffectIds.COLLECT;

  static execute(ctx, { value }, { cardId, playerId }) {
    const amount = ReferenceResolver.resolve(ctx, cardId, value);

    if (Number.isInteger(amount)) {
      ContextAdministrator.addMoneyToPlayer(ctx, playerId, amount);

      const money = ContextInterrogator.getMoneyForPlayer(ctx, playerId);

      NotificationService.onPlayerMoneyUpdated(ctx, playerId, money);
    }
  }
}
