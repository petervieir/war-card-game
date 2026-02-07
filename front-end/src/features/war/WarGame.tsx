"use client";

import React from "react";
import styles from "./WarGame.module.css";
import { rankLabel, suitSymbol } from "./engine";
import type { Card, Phase } from "./engine";
import { useWarGame } from "./useWarGame";

function isRedSuit(suit: Card["suit"]) {
  return suit === "H" || suit === "D";
}

function phaseButtonLabel(phase: Phase) {
  switch (phase) {
    case "ready":
      return "Flip";
    case "battle_revealed":
      return "Collect";
    case "war_face_down":
      return "War: Down";
    case "war_face_up":
      return "War: Up";
    case "finished":
      return "Finished";
  }
}

function CardFace({
  card,
  label,
}: Readonly<{
  card?: Card;
  label: string;
}>) {
  if (!card) {
    return (
      <div className={`${styles.card} ${styles.cardMuted}`} aria-label={label} />
    );
  }

  const suit = suitSymbol(card.suit);
  const red = isRedSuit(card.suit);
  const rank = rankLabel(card.rank);

  return (
    <div className={styles.card} aria-label={`${label}: ${rank}${suit}`}>
      <div className={`${styles.corner} ${red ? styles.red : ""}`}>
        <div>{rank}</div>
        <div className={styles.suit}>{suit}</div>
      </div>
      <div className={`${styles.corner} ${styles.cornerBottom} ${red ? styles.red : ""}`}>
        <div>{rank}</div>
        <div className={styles.suit}>{suit}</div>
      </div>
      <div className={`${styles.centerRank} ${red ? styles.red : ""}`}>
        {rank}
      </div>
    </div>
  );
}

function CardBack({ label }: Readonly<{ label: string }>) {
  return <div className={`${styles.card} ${styles.cardBack}`} aria-label={label} />;
}

function Stack({
  children,
  "aria-label": ariaLabel,
}: React.PropsWithChildren<Readonly<{ "aria-label": string }>>) {
  return (
    <div className={styles.stack} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

function DeckPileView({
  count,
  owner,
}: Readonly<{ count: number; owner: "player" | "cpu" }>) {
  const visible = Math.min(4, Math.max(0, count));
  const label = owner === "player" ? "Your deck" : "CPU deck";

  return (
    <div className={styles.pileBlock} aria-label={`${label}: ${count} cards`}>
      <Stack aria-label={label}>
        {visible === 0 ? (
          <div className={`${styles.card} ${styles.cardMuted}`} aria-label="Empty deck" />
        ) : (
          Array.from({ length: visible }).map((_, i) => (
            <div
              key={`deck-${owner}-${i}`}
              className={styles.stackCard}
              style={{
                transform: `translate(${i * 2}px, ${-i * 2}px)`,
                zIndex: i,
              }}
            >
              <CardBack label="Face-down card" />
            </div>
          ))
        )}
      </Stack>
      <div className={styles.badge}>{count}</div>
    </div>
  );
}

function BattlePileView({
  pile,
  owner,
}: Readonly<{
  pile: Card[];
  owner: "player" | "cpu";
}>) {
  const label = owner === "player" ? "Your battle pile" : "CPU battle pile";

  if (pile.length === 0) {
    return (
      <div className={styles.pileBlock} aria-label={`${label}: empty`}>
        <Stack aria-label={label}>
          <div className={`${styles.card} ${styles.cardMuted}`} aria-label="No cards on table" />
        </Stack>
        <div className={styles.badgeMuted}>0</div>
      </div>
    );
  }

  return (
    <div className={styles.pileBlock} aria-label={`${label}: ${pile.length} cards`}>
      <Stack aria-label={label}>
        {pile.map((card, i) => {
          const isFaceDown = i % 2 === 1;
          return (
            <div
              key={`${card.rank}${card.suit}-${i}`}
              className={styles.stackCard}
              style={{
                transform: `translate(${i * 2}px, ${-i * 2}px)`,
                zIndex: i,
              }}
            >
              {isFaceDown ? (
                <CardBack label="Face-down war card" />
              ) : (
                <CardFace card={card} label="Face-up card" />
              )}
            </div>
          );
        })}
      </Stack>
      <div className={styles.badge}>{pile.length}</div>
    </div>
  );
}

export function WarGame() {
  const { state, actions, derived } = useWarGame();

  const label = phaseButtonLabel(state.phase);
  const winnerLabel = state.winner === "player" ? "You" : "CPU";
  const footerRight =
    state.phase === "finished"
      ? `Winner: ${winnerLabel}`
      : "First to win all cards.";

  const playerPile = state.tablePile.filter((_, i) => i % 2 === 0);
  const cpuPile = state.tablePile.filter((_, i) => i % 2 === 1);

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>War</div>
        </div>
      </header>

      <div className={styles.board}>
        <div className={styles.boardTop}>
          <div className={styles.boardStats} aria-label="Game stats">
            <span className={styles.pill}>
              <strong>Rounds</strong> {state.roundsPlayed}
            </span>
            <span className={styles.pill}>
              <strong>Wars</strong> {state.warsStarted}
            </span>
            <span className={styles.pill}>
              <strong>On table</strong> {state.tablePile.length}
            </span>
          </div>
        </div>

        <div className={styles.zone}>
          <div className={styles.zoneTitle}>CPU</div>
          <div className={`${styles.pileArea} ${styles.pileAreaCpu}`}>
            <DeckPileView count={state.cpuDeck.length} owner="cpu" />
            <BattlePileView pile={cpuPile} owner="cpu" />
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.message}>
            {state.phase === "finished" ? (state.message || "Game over.") : state.message}
          </div>
        </div>

        <div className={styles.zone}>
          <div className={styles.zoneTitle}>You</div>
          <div className={`${styles.pileArea} ${styles.pileAreaPlayer}`}>
            <BattlePileView pile={playerPile} owner="player" />
            <DeckPileView count={state.playerDeck.length} owner="player" />
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.button} onClick={actions.newGame} type="button">
          New game
        </button>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={actions.step}
          type="button"
          disabled={!derived.canStep}
        >
          {label}
        </button>
      </div>

      <div className={styles.settings}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={state.autoPlay}
            onChange={(e) => actions.setAutoPlay(e.target.checked)}
          />
          <span>Auto-play</span>
        </label>

        <div className={styles.rangeWrap}>
          <span className={styles.subtle}>Speed</span>
          <input
            className={styles.range}
            type="range"
            min={150}
            max={2000}
            step={50}
            value={state.autoPlayDelayMs}
            onChange={(e) => actions.setSpeedMs(Number(e.target.value))}
            disabled={!state.autoPlay}
            aria-label="Auto-play speed (ms delay)"
          />
          <span className={styles.subtle}>{state.autoPlayDelayMs}ms</span>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>Phase: {state.phase}</span>
        <span>{footerRight}</span>
      </footer>
    </section>
  );
}

