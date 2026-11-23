const GLITCH_X = [18, -14, 11, -8, 6, -5, 3, -2, 0];
const GLITCH_CLIP = [
    'inset(42% 0 42% 0)',
    'inset(18% 0 34% 0)',
    'inset(0% 0 22% 0)',
    'inset(24% 0 0% 0)',
    'inset(0% 0 12% 0)',
    'inset(8% 0 0% 0)',
    'inset(0% 0 4% 0)',
    'inset(0% 0 0% 0)',
    'inset(0% 0 0% 0)'
];
/**
 * NERV CRT signal-lock glitch enter/exit Svelte transition.
 * Falls back to a clean opacity fade when prefers-reduced-motion is enabled.
 */
export function evaGlitch(_node, { duration = 260 } = {}) {
    const reduced = typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        return {
            duration: Math.min(duration, 140),
            css: (t) => `opacity: ${t};`
        };
    }
    return {
        duration,
        css: (t) => {
            if (t >= 0.999)
                return '';
            const idx = Math.min(GLITCH_X.length - 1, Math.floor(t * GLITCH_X.length));
            const dx = GLITCH_X[idx];
            const sy = t < 0.25 ? 0.22 + t * 2.8 : 1;
            const opacity = t < 0.12 ? t * 4 : Math.min(1, 0.55 + t * 0.5);
            const bright = t < 0.35 ? 1.85 : t < 0.7 ? 1.35 : 1;
            return `opacity: ${opacity.toFixed(2)}; transform: translate3d(${dx}px, 0, 0) scaleY(${sy.toFixed(3)}); clip-path: ${GLITCH_CLIP[idx]}; filter: brightness(${bright}) contrast(${bright > 1 ? 1.2 : 1});`;
        }
    };
}
/**
 * Configurable EVA-UI transition dispatcher. Defaults to 'glitch'.
 */
export function evaTransition(node, option = 'glitch') {
    const cfg = typeof option === 'string' ? { preset: option } : (option ?? {});
    const preset = cfg.preset ?? 'glitch';
    const duration = cfg.duration ?? (preset === 'glitch' ? 260 : preset === 'none' ? 0 : 180);
    if (preset === 'none' || duration <= 0) {
        return { duration: 0, css: () => '' };
    }
    const reduced = typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || preset === 'fade') {
        return {
            duration: reduced ? Math.min(duration, 140) : duration,
            css: (t) => `opacity: ${t};`
        };
    }
    if (preset === 'slide') {
        const y = cfg.y ?? -8;
        return {
            duration,
            css: (t) => `opacity: ${t}; transform: translate3d(0, ${((1 - t) * y).toFixed(2)}px, 0);`
        };
    }
    return evaGlitch(node, { duration });
}
