import type {
  PresentationAction,
  PresentationDefinition,
  PresentationState,
} from "./types.js";

export type { PresentationAction, PresentationState } from "./types.js";

function requireText(value: unknown, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function requirePositiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive safe integer.`);
  }
}

/**
 * Validate cue bounds before mounting a Player. Cue order is authored order:
 * intervals may overlap, repeat or jump backwards within the source film.
 * Returns the original definition so callers can retain stable references.
 */
export function definePresentation<T extends PresentationDefinition>(
  definition: T,
): T {
  if (!definition || typeof definition !== "object") {
    throw new Error("Presentation definition must be an object.");
  }
  requireText(definition.title, "Presentation title");
  if (!Number.isFinite(definition.fps) || definition.fps <= 0) {
    throw new Error("Presentation fps must be a positive finite number.");
  }
  requirePositiveInteger(
    definition.durationInFrames,
    "Presentation durationInFrames",
  );
  requirePositiveInteger(
    definition.compositionWidth,
    "Presentation compositionWidth",
  );
  requirePositiveInteger(
    definition.compositionHeight,
    "Presentation compositionHeight",
  );
  if (!Array.isArray(definition.cues) || definition.cues.length === 0) {
    throw new Error("Presentation must contain at least one cue.");
  }

  const ids = new Set<string>();
  for (const [index, cue] of definition.cues.entries()) {
    const label = `Cue ${index + 1}`;
    if (!cue || typeof cue !== "object") {
      throw new Error(`${label} must be an object.`);
    }
    requireText(cue.id, `${label} id`);
    requireText(cue.title, `${label} title`);
    if (ids.has(cue.id)) {
      throw new Error(`Duplicate cue id: ${cue.id}.`);
    }
    ids.add(cue.id);
    if (
      !Number.isSafeInteger(cue.fromFrame) ||
      !Number.isSafeInteger(cue.holdFrame) ||
      cue.fromFrame < 0 ||
      cue.fromFrame >= cue.holdFrame ||
      cue.holdFrame >= definition.durationInFrames
    ) {
      throw new Error(
        `${label} (${cue.id}) must use integer frames satisfying 0 <= fromFrame < holdFrame < durationInFrames.`,
      );
    }
    if (cue.chapter !== undefined) requireText(cue.chapter, `${label} chapter`);
    if (cue.notes !== undefined && typeof cue.notes !== "string") {
      throw new Error(`${label} notes must be a string.`);
    }
  }
  return definition;
}

/** The first cue opens at its holdFrame; playback always requires an action. */
export const initialPresentationState: PresentationState = {
  index: 0,
  status: "holding",
  run: 0,
};

/**
 * Pure navigation reducer. The host seeks to holdFrame when holding and starts
 * at fromFrame when entering playing with a new run. A paused run resumes at
 * its existing frame. Repeated next actions during playback are ignored.
 */
export function transitionPresentation(
  state: PresentationState,
  action: PresentationAction,
  cueCount: number,
): PresentationState {
  requirePositiveInteger(cueCount, "cueCount");
  if (
    !Number.isSafeInteger(state.index) ||
    state.index < 0 ||
    state.index >= cueCount
  ) {
    throw new Error("Presentation state index is outside the cue list.");
  }
  if (!Number.isSafeInteger(state.run) || state.run < 0) {
    throw new Error(
      "Presentation state run must be a non-negative safe integer.",
    );
  }
  if (!["holding", "playing", "paused"].includes(state.status)) {
    throw new Error("Unknown presentation status.");
  }

  switch (action.type) {
    case "next":
      if (state.status === "playing" || state.index === cueCount - 1)
        return state;
      return { index: state.index + 1, status: "playing", run: state.run + 1 };
    case "previous":
      return {
        index: Math.max(0, state.index - 1),
        status: "holding",
        run: state.run + 1,
      };
    case "replay":
      return { ...state, status: "playing", run: state.run + 1 };
    case "toggle":
      if (state.status === "playing") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "playing" };
      return { ...state, status: "playing", run: state.run + 1 };
    case "finish":
      return state.status === "holding"
        ? state
        : { ...state, status: "holding" };
    case "goto":
      if (
        !Number.isSafeInteger(action.index) ||
        action.index < 0 ||
        action.index >= cueCount
      ) {
        throw new Error(
          "Requested presentation index is outside the cue list.",
        );
      }
      return { index: action.index, status: "holding", run: state.run + 1 };
  }
}
