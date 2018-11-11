import NotificationService from 'services/NotificationService';
import CardTypeRepository from 'repositories/CardTypeRepository';
import LobbyRepository from 'repositories/LobbyRepository';
import CardRepository from 'repositories/CardRepository';
import UserRepository from 'repositories/UserRepository';
import TraitService from 'services/TraitService';
import Random from 'utilities/Random';
import { ContextInterpreter } from '@grudge/domain/interpreters';
import { TraitIds, CardLocations, HAND_CARD_COUNT } from '@grudge/data';
import ContextRepository from 'repositories/ContextRepository';

export default class CardService {
  static async enableCard(cardId) {
    return TraitService.removeTrait(cardId, TraitIds.DISABLED);
  }

  static async discardCard(user, card) {
    const discardedCard = card.clone({
      isDrawn: false,
      isDiscarded: true,
      isTrashed: false,
      slotIndex: null,
    });

    await CardRepository.save(discardedCard);

    NotificationService.onCardDiscarded(user, discardedCard);

    return discardedCard;
  }

  static async killCard(card) {
    const cardType = await CardTypeRepository.get(card.cardTypeId);

    await CardRepository.resetForCardType(card, cardType, {
      slotIndex: null,
      isTrashed: false,
      isDiscarded: true,
      isDrawn: false,
    });

    const lobby = await LobbyRepository.get(card.lobbyId);

    NotificationService.onCardKilled(lobby, card);
  }

  static async recycleCard(card) {
    const freshCard = card.clone({
      isDrawn: false,
      isDiscarded: false,
      isTrashed: false,
      slotIndex: null,
    });

    await CardRepository.save(freshCard);

    return freshCard;
  }

  static async getPlayedCardsForUser(userId) {
    const user = await UserRepository.get(userId);

    const cards = await CardRepository.where({
      userId: user.id,
      lobbyId: user.lobbyId,
      isDiscarded: false,
      isTrashed: false,
    });

    return cards.filter((card) => card.isPlayed);
  }

  static async enablePlayed(user) {
    const playedCards = await this.getPlayedCardsForUser(user.id);

    return Promise.all(playedCards.map((card) => this.enableCard(card.id)));
  }

  static async draw(context, player, count = 1) {
    const cards = ContextInterpreter.getCardsForPlayer(context, player.id);
    const deck = cards.filter((c) => c.location === CardLocations.DECK);

    if (deck.length >= count) {
      const cardsToDraw = Random.sample(deck, count);

      cardsToDraw.forEach((c) => c.set('location', CardLocations.HAND));
    } else {
      deck.forEach((c) => c.set('location', CardLocations.HAND));

      const discardPile = cards.filter((c) => c.location === CardLocations.DISCARD);

      discardPile.forEach((c) => c.set('location', CardLocations.DECK));

      const cardsToDraw = Random.sample(discardPile, count - deck.length);

      cardsToDraw.forEach((c) => c.set('location', CardLocations.HAND));
    }

    await ContextRepository.save(context);

    const hand = ContextInterpreter.getHandForPlayer(context, player.id);

    hand.forEach((c) => NotificationService.onCardDrawn(context, c));
  }

  static async drawHand(context, player) {
    return this.draw(context, player, HAND_CARD_COUNT);
  }

  static async drawHands(context) {
    for (const player of context.players) { // eslint-disable-line no-restricted-syntax
      await this.drawHand(context, player); // eslint-disable-line no-await-in-loop
    }
  }
}
