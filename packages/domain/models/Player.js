import Model from './Model';

export default class Player extends Model {
  static get properties() {
    return {
      id: {
        defaultValue: undefined,
      },
      userId: {
        defaultValue: undefined,
      },
      displayName: {
        defaultValue: '',
      },
      turnOrder: {
        defaultValue: undefined,
      },
      money: {
        defaultValue: 0,
      },
      health: {
        defaultValue: 0,
      },
    };
  }

  static createForUser(user) {
    return new Player({
      id: user.id,
      userId: user.id,
      displayName: user.displayName,
    });
  }
}
