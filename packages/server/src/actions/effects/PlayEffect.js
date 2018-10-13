import { EffectIds } from '@grudge/data';
import CardRepository from 'repositories/CardRepository';
import LobbyRepository from 'repositories/LobbyRepository';
import NotificationService from 'services/NotificationService';
import Effect from './Effect';

export default class PlayEffect extends Effect {
  static id = EffectIds.PLAY;

  static async apply(effectParams, { card, user, targetSlotIndex }) {
    const playedCard = card.clone({
      slotIndex: targetSlotIndex,
    });

    await CardRepository.save(playedCard);

    const lobby = await LobbyRepository.get(user.lobbyId);

    NotificationService.onCardPlayed(lobby, playedCard);
  }
}