import { GameState, Card } from '../../../types/games';

export const applyCardEffects = (state: GameState, card: Card): boolean => {
  const skipToNext = () => {
    state.currentTurn =
      (state.currentTurn + state.direction + state.players.length) % state.players.length;
  };

  const nextPlayerIndex =
    (state.currentTurn + state.direction + state.players.length) % state.players.length;
  const nextPlayer = state.players[nextPlayerIndex];

  if (card.value === 'skip') {
    skipToNext();
    return true;
  }

  if (card.value === 'reverse') {
    state.direction *= -1;
    if (state.players.length === 2) {
      skipToNext();
      return true;
    }
    return false;
  }

  if (card.value === 'draw2') {
    nextPlayer.hand.push(...state.deck.splice(-1));
    state.currentTurn =
      (nextPlayerIndex + state.direction + state.players.length) % state.players.length;
    return true;
  }

  if (card.value === 'wild_draw4') {
    nextPlayer.hand.push(...state.deck.splice(-2));
    state.currentTurn =
      (nextPlayerIndex + state.direction + state.players.length) % state.players.length;
    state.chosenColor = card.color;
  }

  if (card.value === 'wild') {
    state.chosenColor = card.color;
  } else {
    state.chosenColor = null;
  }

  return false;
};
