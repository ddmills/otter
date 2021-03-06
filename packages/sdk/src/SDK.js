import * as Events from '@grudge/api-events';
import SocketFactory from './SocketFactory';
import EventMap from './EventMap';
import EventHook from './EventHook';
import Query from './Query';

export default class SDK {
  constructor() {
    this.eventMap = EventMap.create();
    this.eventMap.forEach((handler) => handler.attach(this));

    this.onConnectingEventHook = new EventHook(Events.CONNECTING, 'onConnecting');
    this.onConnectingEventHook.attach(this);

    this.onErrorEventHook = new EventHook(Events.ERROR, 'onError');
    this.onErrorEventHook.attach(this);
  }

  configure(token) {
    this.token = token;
  }

  connect() {
    if (this.socket) {
      if (this.socket.connected) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        this.socket.once(Events.CONNECTED, () => resolve());
        this.socket.once(Events.CONNECT_ERROR, () => reject(new Error('Socket could not connect')));
        this.socket.once(Events.CONNECT_TIMEOUT, () => reject(new Error('Socket timed out while attempting to connect')));
      });
    }

    if (!this.token) {
      return Promise.reject(new Error('Socket has not been configured yet'));
    }

    return new Promise((resolve, reject) => {
      this.onConnectingEventHook.trigger();
      this.socket = SocketFactory.create(this.token);
      this.socket.once(Events.CONNECTED, () => resolve());
      this.socket.once(Events.CONNECT_ERROR, () => reject(new Error('Socket could not connect')));
      this.socket.once(Events.CONNECT_TIMEOUT, () => reject(new Error('Socket timed out while attempting to connect')));
      this.listen(this.socket);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  listen(socket) {
    this.eventMap.forEach((handler) => handler.listen(socket));
  }

  query(event, params = {}) {
    return this.connect().then(() => {
      return Query.send(this.socket, event, params).catch((error) => {
        this.onErrorEventHook.trigger(error);
        throw error;
      });
    });
  }

  getUser(userId) {
    return this.query(Events.USER_GET, { userId });
  }

  getLobbyForUser(userId) {
    return this.query(Events.USER_LOBBY_GET, { userId });
  }

  getLobby(lobbyId) {
    return this.query(Events.LOBBY_GET, { lobbyId });
  }

  getUsersInLobby(lobbyId) {
    return this.query(Events.LOBBY_USERS_GET, { lobbyId });
  }

  listLobbies() {
    return this.query(Events.LOBBY_LIST);
  }

  createLobby() {
    return this.query(Events.LOBBY_CREATE);
  }

  startLobbyCountdown() {
    return this.query(Events.LOBBY_COUNTDOWN_START);
  }

  stopLobbyCountdown() {
    return this.query(Events.LOBBY_COUNTDOWN_STOP);
  }

  joinLobby(lobbyId) {
    return this.query(Events.LOBBY_JOIN, { lobbyId });
  }

  getHand() {
    return this.query(Events.HAND_GET);
  }

  leaveLobby() {
    return this.query(Events.LOBBY_LEAVE);
  }

  listCardTypes() {
    return this.query(Events.CARDTYPE_LIST);
  }

  performAction(action) {
    return this.query(Events.ACTION_PERFORM, { action });
  }

  listPlayedCardsForUser(userId) {
    return this.query(Events.CARD_PLAYED_LIST, { userId });
  }

  getCurrentContext() {
    return this.query(Events.CONTEXT_CURRENT_GET);
  }

  listContexts() {
    return this.query(Events.CONTEXT_LIST);
  }

  createContext() {
    return this.query(Events.CONTEXT_CREATE);
  }

  joinContext(contextId) {
    return this.query(Events.CONTEXT_JOIN, { contextId });
  }

  addBotPlayer() {
    return this.query(Events.PLAYER_BOT_ADD);
  }

  leaveContext() {
    return this.query(Events.CONTEXT_LEAVE);
  }

  startContextCountdown() {
    return this.query(Events.CONTEXT_COUNTDOWN_START);
  }

  stopContextCountdown() {
    return this.query(Events.CONTEXT_COUNTDOWN_STOP);
  }

  endTurn() {
    return this.query(Events.CONTEXT_TURN_END);
  }
}
