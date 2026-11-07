// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
/**
 * Shared motion values for every component. Strong ease-out for things that
 * enter or leave, ease-in-out for movement on screen, and a bounce-free spring
 * for layout and morphs. Exits run faster than entrances.
 */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** CSS versions of the curves, for transitions and inline styles. */
export const CSS_EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
export const CSS_EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

export const spring = { type: "spring", duration: 0.3, bounce: 0 } as const;

export const enter = { duration: 0.2, ease: EASE_OUT } as const;
export const exit = { duration: 0.14, ease: EASE_OUT } as const;

/** Instant transition for keyboard-initiated changes and reduced motion. */
export const instant = { duration: 0 } as const;
