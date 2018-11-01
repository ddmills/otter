import UserRepository from 'repositories/UserRepository';
import LobbyRepository from 'repositories/LobbyRepository';
import NotificationService from 'services/NotificationService';
import DeckService from 'services/DeckService';
import DelayedProcessor from 'services/DelayedProcessor';
import timestamp from 'utilities/Timestamp';
import CardService from 'services/CardService';

export default class TurnService {
  static async incrementTurnCounter(lobby) {
    const updatedLobby = lobby.clone({
      currentTurn: lobby.currentTurn + 1,
      turnStartedAt: timestamp(),
    });

    await LobbyRepository.save(updatedLobby);

    NotificationService.onTurnEnded(updatedLobby);
    DelayedProcessor.scheduleTurn(updatedLobby);

    return updatedLobby;
  }

  static async endTurn(user) {
    const lobby = await LobbyRepository.get(user.lobbyId);

    if (lobby.isEnded) {
      throw new Error('Cannot end turn when the game is over');
    }

    const users = await UserRepository.getForLobby(lobby.id);
    const currentTurnUser = lobby.pickCurrentTurnUser(users);

    if (user.id !== currentTurnUser.id) {
      throw new Error('Cannot end someone elses turn');
    }

    await DeckService.refreshHand(currentTurnUser);
    await CardService.enablePlayed(currentTurnUser);

    return this.incrementTurnCounter(lobby);
  }

  static async turnTimeout(lobby) {
    const users = await UserRepository.getForLobby(lobby.id);
    const currentTurnUser = lobby.pickCurrentTurnUser(users);

    return this.endTurn(currentTurnUser);
  }

  static async isUsersTurn(user) {
    const lobby = await LobbyRepository.get(user.lobbyId);
    const users = await UserRepository.getForLobby(lobby.id);
    const currentTurnUser = lobby.pickCurrentTurnUser(users);

    return user.id !== currentTurnUser.id;
  }
}
