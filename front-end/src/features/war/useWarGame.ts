import { useEffect, useMemo, useReducer, useRef } from "react";
import type { WarGameState } from "./engine";
import { newGameState, step } from "./engine";

type Action =
  | { type: "NEW_GAME" }
  | { type: "STEP" }
  | { type: "SET_AUTOPLAY"; value: boolean }
  | { type: "SET_SPEED"; value: number };

export type WarUiState = WarGameState & {
  autoPlay: boolean;
  autoPlayDelayMs: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function reducer(state: WarUiState, action: Action): WarUiState {
  switch (action.type) {
    case "NEW_GAME": {
      return {
        ...newGameState(),
        autoPlay: state.autoPlay,
        autoPlayDelayMs: state.autoPlayDelayMs,
      };
    }
    case "STEP": {
      return { ...state, ...step(state) };
    }
    case "SET_AUTOPLAY": {
      return { ...state, autoPlay: action.value };
    }
    case "SET_SPEED": {
      return { ...state, autoPlayDelayMs: clamp(action.value, 150, 2000) };
    }
  }
}

export function useWarGame() {
  const initial = useMemo<WarUiState>(() => {
    return {
      ...newGameState(),
      autoPlay: false,
      autoPlayDelayMs: 550,
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canStep = state.phase !== "finished";

  useEffect(() => {
    if (!state.autoPlay) return;
    if (!canStep) return;

    // Avoid accumulating timers.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch({ type: "STEP" });
    }, state.autoPlayDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [state.autoPlay, state.autoPlayDelayMs, state.phase, canStep]);

  // Auto-stop when finished.
  useEffect(() => {
    if (state.phase !== "finished") return;
    if (!state.autoPlay) return;
    dispatch({ type: "SET_AUTOPLAY", value: false });
  }, [state.phase, state.autoPlay]);

  return {
    state,
    actions: {
      newGame: () => dispatch({ type: "NEW_GAME" }),
      step: () => dispatch({ type: "STEP" }),
      setAutoPlay: (value: boolean) =>
        dispatch({ type: "SET_AUTOPLAY", value }),
      setSpeedMs: (value: number) => dispatch({ type: "SET_SPEED", value }),
    },
    derived: {
      canStep,
    },
  };
}

