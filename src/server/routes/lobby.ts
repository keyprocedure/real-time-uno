import express from 'express';
import checkAuthentication from '../middleware/check-authentication';
import chatMiddleware from '../middleware/chat';
import { Games } from '../db';

const router = express.Router();

router.get('/', checkAuthentication, chatMiddleware, async (_request, response) => {
  const user = response.locals.user;
  const roomId = response.locals.roomId;
  const availableGames = await Games.availableGames(user.id);
  const errorCode = _request.query.error;
  let error: string | null = null;

  if (errorCode === 'game-full') error = 'This game is full';
  else if (errorCode === 'game-not-found') error = 'Game not found';
  else if (errorCode === 'unknown-error') error = 'An unknown error occurred';

  response.render('lobby', { title: 'Game Lobby', user, roomId, availableGames, error });
});

router.get('/available-games', checkAuthentication, async (req, res) => {
  const user = res.locals.user;
  const games = await Games.availableGames(user.id);
  res.json(games);
});

export default router;
