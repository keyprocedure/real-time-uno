import { Router, Request, Response } from 'express';
import { Games } from '../../db';
import { Card } from '../../../types/games';
import { advanceTurn } from '../../db/utils/gameFlow';
import { validateCardPlay } from '../../db/utils/cardValidation';
import { applyCardEffects } from '../../db/utils/cardEffects';

const router = Router();

router.post(
  '/:gameId/play-card',
  async (
    req: Request<{ gameId: string }, {}, { playerId: number; card: Card }>,
    res: Response,
  ): Promise<void> => {
    const { gameId } = req.params;
    const { playerId, card } = req.body;

    try {
      const state = await Games.getGameState(parseInt(gameId, 10));
      const currentPlayer = state.players[state.currentTurn];

      if (currentPlayer.id !== playerId) {
        res.status(400).json({ success: false, message: "It's not your turn" });
        return;
      }

      if (!validateCardPlay(state, card)) {
        res.status(400).json({ success: false, message: 'Card doesn\'t match color or number' });
        return;
      }

      if (
        (card.value === 'wild' || card.value === 'wild_draw4') &&
        (!card.color || card.color === 'null')
      ) {
        res
          .status(400)
          .json({ success: false, message: 'You must choose a color for the wild card' });
        return;
      }

      const turnWasAdvanced = applyCardEffects(state, card);

      req.app
        .get('io')
        .to(`game-${gameId}`)
        .emit('special-action', {
          type: card.value,
          playedBy: playerId,
          ...(card.color ? { chosenColor: card.color } : {}),
        });

      state.discardPile.push(card);

      currentPlayer.hand = currentPlayer.hand.filter((c) => {
        if (c.value === 'wild' || c.value === 'wild_draw4') {
          return c.value !== card.value || (c.color !== null && c.color !== 'null');
        }
        return c.color !== card.color || c.value !== card.value;
      });

      if (currentPlayer.hand.length === 0) {
        req.app.get('io').to(`game-${gameId}`).emit('game-over', {
          winnerId: playerId,
          winnerUsername: currentPlayer.username,
        });
        await Games.finishGame(parseInt(gameId, 10));
        res.status(200).json({ success: true, message: 'Player won!' });
        return;
      }

      if (!turnWasAdvanced) {
        advanceTurn(state);
      }

      const updatedState = await Games.updateGameState(parseInt(gameId, 10), state);

      req.app.get('io').to(`game-${gameId}`).emit('turn-updated', {
        currentTurn: state.currentTurn,
        playerId: state.players[state.currentTurn].id,
        currentPlayerUsername: state.players[state.currentTurn].username,
      });

      req.app.get('io').to(`game-${gameId}`).emit('game-state', updatedState);

      res.status(200).json({ success: true, card });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to play card.' });
    }
  },
);

export default router;
