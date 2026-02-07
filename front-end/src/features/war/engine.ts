export type Suit = "S" | "H" | "D" | "C";
export type PlayerId = "player" | "cpu";

export type Card = {
  rank: number; // 2..14 (Ace=14)
  suit: Suit;
};

export type Phase =
  | "ready"
  | "battle_revealed"
  | "war_face_down"
  | "war_face_up"
  | "finished";

export type WarGameState = {
  playerDeck: Card[];
  cpuDeck: Card[];
  tablePile: Card[];
  lastBattle: { player?: Card; cpu?: Card };
  phase: Phase;
  pendingWinner?: PlayerId;
  winner?: PlayerId;
  message: string;
  roundsPlayed: number;
  warsStarted: number;
};

const SUITS: Suit[] = ["S", "H", "D", "C"];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 2; rank <= 14; rank += 1) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function deal(deck: Card[]): { playerDeck: Card[]; cpuDeck: Card[] } {
  const playerDeck: Card[] = [];
  const cpuDeck: Card[] = [];
  for (let i = 0; i < deck.length; i += 1) {
    (i % 2 === 0 ? playerDeck : cpuDeck).push(deck[i]);
  }
  return { playerDeck, cpuDeck };
}

export function compareRanks(a: Card, b: Card): -1 | 0 | 1 {
  if (a.rank === b.rank) return 0;
  return a.rank > b.rank ? 1 : -1;
}

export function rankLabel(rank: number): string {
  if (rank === 14) return "A";
  if (rank === 13) return "K";
  if (rank === 12) return "Q";
  if (rank === 11) return "J";
  return String(rank);
}

export function suitSymbol(suit: Suit): string {
  switch (suit) {
    case "S":
      return "♠";
    case "H":
      return "♥";
    case "D":
      return "♦";
    case "C":
      return "♣";
  }
}

function drawTop(deck: Card[]): { card?: Card; deck: Card[] } {
  if (deck.length === 0) return { card: undefined, deck };
  return { card: deck[0], deck: deck.slice(1) };
}

function finishWithWinner(
  state: WarGameState,
  winner: PlayerId,
  message: string
): WarGameState {
  return {
    ...state,
    winner,
    pendingWinner: undefined,
    phase: "finished",
    message,
  };
}

function checkEmptyDecks(state: WarGameState): WarGameState {
  if (state.playerDeck.length === 0 && state.cpuDeck.length === 0) {
    return finishWithWinner(state, "cpu", "Draw? Both players ran out of cards.");
  }
  if (state.playerDeck.length === 0) {
    return finishWithWinner(state, "cpu", "CPU wins — you ran out of cards.");
  }
  if (state.cpuDeck.length === 0) {
    return finishWithWinner(state, "player", "You win — CPU ran out of cards.");
  }
  return state;
}

export function newGameState(rng: () => number = Math.random): WarGameState {
  const deck = shuffle(createDeck(), rng);
  const { playerDeck, cpuDeck } = deal(deck);

  return {
    playerDeck,
    cpuDeck,
    tablePile: [],
    lastBattle: {},
    phase: "ready",
    message: "Tap Flip to start a battle.",
    roundsPlayed: 0,
    warsStarted: 0,
  };
}

function stepCollect(state: WarGameState): WarGameState {
  const winner = state.pendingWinner;
  if (!winner) {
    return { ...state, phase: "ready", message: "Ready." };
  }

  const wonCards = state.tablePile;
  const nextPlayerDeck =
    winner === "player" ? [...state.playerDeck, ...wonCards] : state.playerDeck;
  const nextCpuDeck =
    winner === "cpu" ? [...state.cpuDeck, ...wonCards] : state.cpuDeck;

  return checkEmptyDecks({
    ...state,
    playerDeck: nextPlayerDeck,
    cpuDeck: nextCpuDeck,
    tablePile: [],
    pendingWinner: undefined,
    phase: "ready",
    roundsPlayed: state.roundsPlayed + 1,
    message: `${winner === "player" ? "You" : "CPU"} take${
      wonCards.length === 1 ? "s" : ""
    } ${wonCards.length} card${wonCards.length === 1 ? "" : "s"}.`,
  });
}

function stepReady(state: WarGameState): WarGameState {
  const p = drawTop(state.playerDeck);
  const c = drawTop(state.cpuDeck);
  if (!p.card) return finishWithWinner(state, "cpu", "CPU wins — you ran out of cards.");
  if (!c.card) return finishWithWinner(state, "player", "You win — CPU ran out of cards.");

  const tablePile = [...state.tablePile, p.card, c.card];
  const cmp = compareRanks(p.card, c.card);

  if (cmp === 0) {
    return {
      ...state,
      playerDeck: p.deck,
      cpuDeck: c.deck,
      tablePile,
      lastBattle: { player: p.card, cpu: c.card },
      phase: "war_face_down",
      warsStarted: state.warsStarted + 1,
      message: "War! Each player must place a face-down card.",
    };
  }

  const pendingWinner: PlayerId = cmp === 1 ? "player" : "cpu";
  return {
    ...state,
    playerDeck: p.deck,
    cpuDeck: c.deck,
    tablePile,
    lastBattle: { player: p.card, cpu: c.card },
    pendingWinner,
    phase: "battle_revealed",
    message: `${pendingWinner === "player" ? "You" : "CPU"} win the battle. Collect?`,
  };
}

function stepWarFaceDown(state: WarGameState): WarGameState {
  // Variant choice: if a player can't complete the war cycle (down+up),
  // they immediately lose. So each player must have at least 2 cards here.
  if (state.playerDeck.length < 2) {
    return finishWithWinner(
      state,
      "cpu",
      "CPU wins — you don't have enough cards to continue the war."
    );
  }
  if (state.cpuDeck.length < 2) {
    return finishWithWinner(
      state,
      "player",
      "You win — CPU doesn't have enough cards to continue the war."
    );
  }

  const pDown = drawTop(state.playerDeck);
  const cDown = drawTop(state.cpuDeck);
  if (!pDown.card) return finishWithWinner(state, "cpu", "CPU wins — you ran out of cards.");
  if (!cDown.card) return finishWithWinner(state, "player", "You win — CPU ran out of cards.");

  return {
    ...state,
    playerDeck: pDown.deck,
    cpuDeck: cDown.deck,
    tablePile: [...state.tablePile, pDown.card, cDown.card],
    phase: "war_face_up",
    message: "War: now flip a face-up card.",
  };
}

function stepWarFaceUp(state: WarGameState): WarGameState {
  const pUp = drawTop(state.playerDeck);
  const cUp = drawTop(state.cpuDeck);
  if (!pUp.card) return finishWithWinner(state, "cpu", "CPU wins — you ran out of cards.");
  if (!cUp.card) return finishWithWinner(state, "player", "You win — CPU ran out of cards.");

  const tablePile = [...state.tablePile, pUp.card, cUp.card];
  const cmp = compareRanks(pUp.card, cUp.card);

  if (cmp === 0) {
    return {
      ...state,
      playerDeck: pUp.deck,
      cpuDeck: cUp.deck,
      tablePile,
      lastBattle: { player: pUp.card, cpu: cUp.card },
      phase: "war_face_down",
      warsStarted: state.warsStarted + 1,
      message: "War continues! Each player places another face-down card.",
    };
  }

  const pendingWinner: PlayerId = cmp === 1 ? "player" : "cpu";
  return {
    ...state,
    playerDeck: pUp.deck,
    cpuDeck: cUp.deck,
    tablePile,
    lastBattle: { player: pUp.card, cpu: cUp.card },
    pendingWinner,
    phase: "battle_revealed",
    message: `${pendingWinner === "player" ? "You" : "CPU"} win the war. Collect?`,
  };
}

export function step(state: WarGameState): WarGameState {
  if (state.phase === "finished") return state;

  // Important: when cards are on the table and a winner is pending, we must
  // collect them first. Otherwise a player who just played their last card
  // could be incorrectly marked as "out of cards" before collecting.
  if (state.phase === "battle_revealed") {
    return stepCollect(state);
  }

  // If a deck is empty at any time, game ends.
  const afterEmptyCheck = checkEmptyDecks(state);
  if (afterEmptyCheck.phase === "finished") return afterEmptyCheck;

  switch (state.phase) {
    case "ready":
      return stepReady(state);
    case "war_face_down":
      return stepWarFaceDown(state);
    case "war_face_up":
      return stepWarFaceUp(state);
  }
}

