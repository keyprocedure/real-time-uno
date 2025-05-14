import express from 'express';
import checkAuthentication from '../middleware/check-authentication';
import chatMiddleware from '../middleware/chat';
// @ts-ignore
import * as filter from 'leo-profanity';

const router = express.Router();

router.get('/:roomId', checkAuthentication, chatMiddleware, (request, response) => {
  const { roomId } = request.params;
  const message = request.body.message;
  response.status(200).send();
});

router.post('/:roomId', checkAuthentication, chatMiddleware, (request, response) => {
  const { roomId } = request.params;
  let message = request.body.message;
  // @ts-expect-error
  const { email, gravatar, username } = request.session.user;
  const io = request.app.get('io');

  if (filter.check(message)) {
    response.status(400).json({ error: 'Inappropriate language not allowed' });
    return;
  }

  io.emit(`message:${roomId}`, {
    message,
    gravatar,
    sender: email,
    username,
    timestamp: new Date(),
  });

  response.status(200).send({ status: 'ok' });
});

export default router;
