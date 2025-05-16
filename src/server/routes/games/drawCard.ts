import { Router, Request, Response } from 'express';
import { Games } from '../../db';
import { advanceTurn } from '../../db/utils/gameFlow';

const router = Router();

router.post(
  '/:gameId/draw-card',
  async (
    req: Request<{ gameId: string }, {}, { playerId: number }>,
    res: Response,
  ): Promise<void> => {
    const { gameId } = req.params;
    const { playerId } = req.body;
    console.time(`draw-card-${gameId}`);

    try {
      console.time("getGameState");
      const state = await Games.getGameState(parseInt(gameId, 10));
      console.timeEnd("getGameState");
      const currentPlayer = state.players[state.currentTurn];

      if (currentPlayer.id !== playerId) {
        res.status(400).json({ success: false, message: "It's not your turn" });
        return;
      }

      if (state.deck.length === 0 && state.discardPile.length <= 1) {
        res.status(400).json({ success: false, message: 'No cards left to draw!' });
        return;
      }

      if (state.deck.length === 0) {
        const reshuffleCards = state.discardPile.splice(0, state.discardPile.length - 1);
        req.app.get('io').to(`game-${gameId}`).emit('deck-reshuffled', {
          reshuffledDeckSize: reshuffleCards.length,
        });
        state.deck = reshuffleCards.sort(() => Math.random() - 0.5);
      }

      const card = state.deck.pop();
      if (!card) {
        res.status(400).json({ success: false, message: 'Deck is empty' });
        return;
      }

      currentPlayer.hand.push(card);
      advanceTurn(state);
      console.log("Payload size (bytes):", JSON.stringify(state).length);
      console.time("updateGameState");
      const updatedState = await Games.updateGameState(parseInt(gameId, 10), state);
      console.timeEnd("updateGameState");
      req.app.get('io').to(`game-${gameId}`).emit('turn-updated', {
        currentTurn: state.currentTurn,
        playerId: state.players[state.currentTurn].id,
        currentPlayerUsername: state.players[state.currentTurn].username,
      });

      req.app.get('io').to(`game-${gameId}`).emit('game-state', updatedState);
      req.app
        .get('io')
        .to(`game-${gameId}`)
        .emit('game-action', { type: 'card-drawn', playerId, card });

      res.status(200).json({ success: true, card });
    } catch (error) {
      console.error('Error drawing card:', error);
      res.status(500).json({ success: false, message: 'Failed to draw card' });
    }
    console.timeEnd(`draw-card-${gameId}`);
  },
);

export default router;
