import UserRepository from 'repositories/UserRepository';
import CardRepository from 'repositories/CardRepository';
import LobbyRepository from 'repositories/LobbyRepository';
import NotificationService from 'services/NotificationService';

export default class CardService {
  static async playCard(user, cardId) {
    const card = await CardRepository.get(cardId);

    if (card.userId !== user.id) {
      throw new Error(`User (${user.id}) cannot play card (${card.id}) that isn't owned`);
    }

    if (card.isPlayed) {
      throw new Error(`User (${user.id}) cannot play card (${card.id}) that is already played`);
    }

    // TODO: extract isTurn logic somewhere
    const lobby = await LobbyRepository.get(user.lobbyId);
    const users = await UserRepository.getForLobby(lobby.id);
    const currentTurnUser = lobby.pickCurrentTurnUser(users);

    if (user.id !== currentTurnUser.id) {
      throw new Error('Cannot play card on someone elses turn');
    }

    const playedCard = card.clone({
      isPlayed: true,
    });

    await CardRepository.save(playedCard);

    NotificationService.onCardPlayed(lobby, card);

    return playedCard;
  }

  static async discardCard(user, card) {
    const discardedCard = card.clone({
      isDrawn: false,
      isDiscarded: true,
      isPlayed: false,
    });

    await CardRepository.save(discardedCard);

    NotificationService.onCardDiscarded(user, card);

    return discardedCard;
  }

  static async drawCard(user, card) {
    const drawnCard = card.clone({
      isDrawn: true,
      isDiscarded: false,
    });

    NotificationService.onCardDrawn(user, drawnCard);

    return CardRepository.save(drawnCard);
  }

  static async recycleCard(card) {
    const freshCard = card.clone({
      isDrawn: false,
      isDiscarded: false,
      isPlayed: false,
    });

    await CardRepository.save(freshCard);

    return freshCard;
  }

  static async getPlayedCardsForUser(userId) {
    return CardRepository.where({
      userId,
      isPlayed: true,
      isDiscarded: false,
    });
  }
}