export type EvaTransitionPreset = 'glitch' | 'fade' | 'slide' | 'none';
export interface EvaTransitionConfig {
    preset?: EvaTransitionPreset;
    duration?: number;
    y?: number;
}
export type EvaTransitionOption = EvaTransitionPreset | EvaTransitionConfig;
/**
 * NERV CRT signal-lock glitch enter/exit Svelte transition.
 * Falls back to a clean opacity fade when prefers-reduced-motion is enabled.
 */
export declare function evaGlitch(_node: HTMLElement, { duration }?: {
    duration?: number;
}): {
    duration: number;
    css: (t: number) => string;
};
/**
 * Configurable EVA-UI transition dispatcher. Defaults to 'glitch'.
 */
export declare function evaTransition(node: HTMLElement, option?: EvaTransitionOption): {
    duration: number;
    css: (t: number) => string;
};
