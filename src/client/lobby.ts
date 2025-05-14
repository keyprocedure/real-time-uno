import { io } from 'socket.io-client';

const socket = io();

type Game = {
  id: number;
  players: number;
  player_count: number;
  user_in_game: boolean;
};

socket.on('lobby-update', () => {
  fetch('/lobby/available-games')
    .then((res) => res.json())
    .then((games: Game[]) => updateGameList(games))
    .catch(console.error);
});

function updateGameList(games: Game[]): void {
  const tbody = document.getElementById('available-games-list') as HTMLTableSectionElement;
  if (!tbody) return;

  tbody.innerHTML = '';

  games.forEach((room) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b last:border-b-0';
    tr.id = `game-row-${room.id}`;

    tr.innerHTML = `
      <td class="py-2 px-4">Game ${room.id}</td>
      <td class="py-2 px-4">(${room.players} / ${room.player_count})</td>
      <td class="py-2 px-4 text-center">
        ${
          room.user_in_game
            ? `<form action="/games/join/${room.id}" method="post">
                <button class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                  Rejoin
                </button>
              </form>`
            : room.players < room.player_count
              ? `<form action="/games/join/${room.id}" method="post">
                <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                  Join
                </button>
              </form>`
              : `<button class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
                Full
              </button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}
