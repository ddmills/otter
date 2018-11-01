import { Player } from '@grudge/domain';
import ContextRepository from 'repositories/ContextRepository';
import UserRepository from 'repositories/UserRepository';
import NotificationService from 'services/NotificationService';
import DelayedProcessor from 'services/DelayedProcessor';
import timestamp from 'utilities/Timestamp';
import Logger from 'utilities/Logger';

export default class ContextService {
  static async list() {
    return ContextRepository.browse();
  }

  static async create(user) {
    if (user.contextId) {
      throw new Error('User is already in a game');
    }

    const context = await ContextRepository.create({
      ownerId: user.id,
    });

    return this.join(user, context.id);
  }

  static async join(user, contextId) {
    if (user.contextId) {
      if (user.contextId === contextId) {
        return ContextRepository.get(contextId);
      }

      throw new Error('User is already in a game');
    }

    const context = await ContextRepository.get(contextId);

    if (context.isCountingDown) {
      throw new Error('Game is already starting');
    }

    if (context.isEnded) {
      throw new Error('Game is already over');
    }

    if (context.isStarted) {
      throw new Error('Game is already started');
    }

    if (context.isFull) {
      throw new Error('Game doesn\'t have enough room for additional player');
    }

    const player = Player.createForUser(user);

    context.addPlayer(player);

    await ContextRepository.save(context);
    await UserRepository.updateForId(user.id, {
      contextId: context.id,
    });

    NotificationService.onPlayerJoined(context, player);

    return context;
  }

  static async leave(user, context) {
    const player = context.getPlayer(user.id);

    context.removePlayer(player.id);

    await ContextRepository.save(context);
    await UserRepository.updateForId(user.id, {
      contextId: null,
    });

    NotificationService.onPlayerLeft(context, player);

    return context;
  }

  static async startCountdown(user, context) {
    if (context.countdownStartedAt) {
      throw new Error('Countdown has already started');
    }

    if (context.ownerId !== user.id) {
      throw new Error('User does not have permission to start the game');
    }

    context.set('countdownStartedAt', timestamp());

    await ContextRepository.save(context);

    NotificationService.onCountdownStarted(context);
    DelayedProcessor.scheduleCountdown(context);
  }

  static async stopCountdown(user, context) {
    if (context.isStarted) {
      throw new Error('Game has already started');
    }

    if (!context.isCountdownStarted) {
      return context;
    }

    context.set('countdownStartedAt', null);

    await DelayedProcessor.cancelCountdown(context);
    await ContextRepository.save(context);

    NotificationService.onCountdownStopped(context);
  }

  static async start(contextId) {
    Logger.info('START CONTEXT', contextId);
  }
}
