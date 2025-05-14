import { Server } from 'http';
import { Express, RequestHandler } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Games } from '../db/';

let io: SocketIOServer | undefined;

const bindSession = async (socket: Socket) => {
  const { request } = socket;

  // @ts-ignore
  const session = request.session;

  // @ts-ignore
  if (!session || !session.user || !session.user.id) {
    console.warn('Socket connection rejected: no valid session');
    socket.disconnect();
    return;
  }

  // @ts-ignore
  socket.join(request.session.id);

  // @ts-ignore
  const userGames = await Games.getUserGameRooms(request.session.user.id);

  userGames.forEach(({ game_id }) => {
    socket.join(`game-${game_id}`);
  });

  socket.use((_, next) => {
    // @ts-ignore
    session.reload((error) => {
      if (error) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });
};

export default function (
  server: Server,
  app: Express,
  sessionMiddleware: RequestHandler,
): SocketIOServer {
  if (io === undefined) {
    io = new SocketIOServer(server);
    app.set('io', io);
    io.engine.use(sessionMiddleware);

    io.on('connection', async (socket) => {
      await bindSession(socket);
      socket.on('disconnect', () => {});
    });
  }

  return io;
}
