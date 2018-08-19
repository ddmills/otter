import { CONNECTION, DISCONNECT } from 'socket/SocketEvents';
import SocketAuthMiddleware from 'socket/middleware/SocketAuthMiddleware';
import UserMiddleware from 'socket/middleware/UserMiddleware';
import Logger from 'utilities/Logger';

export default function createApp(io) {
  io.use(SocketAuthMiddleware());
  io.use(UserMiddleware());

  io.on(CONNECTION, (socket) => {
    Logger.info('Authenticated Socket Connected', socket.user.name);

    socket.on(DISCONNECT, () => Logger.info('Socket disconnected', socket.userId));
  });
}
