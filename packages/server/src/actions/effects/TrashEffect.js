import { EffectIds } from '@grudge/data';
import CardRepository from 'repositories/CardRepository';
import LobbyRepository from 'repositories/LobbyRepository';
import NotificationService from 'services/NotificationService';
import Effect from './Effect';

export default class TrashEffect extends Effect {
  static id = EffectIds.TRASH;

  static async apply(effectParams, { card, user }) {
    const trashedCard = card.clone({
      isTrashed: true,
      slotIndex: null,
    });

    await CardRepository.save(trashedCard);

    const lobby = await LobbyRepository.get(user.lobbyId);

    NotificationService.onCardTrashed(lobby, trashedCard);
  }
}