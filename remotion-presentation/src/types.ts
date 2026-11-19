/** A finite animation interval followed by an indefinite presentation hold. */
export type PresentationCue = {
  readonly id: string;
  readonly title: string;
  readonly fromFrame: number;
  readonly holdFrame: number;
  readonly chapter?: string;
  readonly notes?: string;
};

/** The shared shell only needs playback metadata, never target scene internals. */
export type PresentationDefinition = {
  readonly title: string;
  readonly fps: number;
  readonly durationInFrames: number;
  readonly compositionWidth: number;
  readonly compositionHeight: number;
  readonly cues: readonly PresentationCue[];
};

export type PresentationStatus = "holding" | "playing" | "paused";

export type PresentationState = {
  readonly index: number;
  readonly status: PresentationStatus;
  /** Changes when playback must seek or restart; pause/resume preserves it. */
  readonly run: number;
};

export type PresentationAction =
  | { readonly type: "next" }
  | { readonly type: "previous" }
  | { readonly type: "replay" }
  | { readonly type: "toggle" }
  | { readonly type: "finish" }
  | { readonly type: "goto"; readonly index: number };
