export type CrtMode = 'fine' | 'trinitron' | 'shadow' | 'wide';
interface Props {
    enabled?: boolean;
    level?: number;
    mode?: CrtMode;
    compact?: boolean;
    applyToRoot?: boolean;
    syncGlobal?: boolean;
    label?: string;
    onChange?: (state: {
        enabled: boolean;
        level: number;
        mode: CrtMode;
    }) => void;
}
declare const EvaCrtControl: import("svelte").Component<Props, {}, "enabled" | "level" | "mode">;
type EvaCrtControl = ReturnType<typeof EvaCrtControl>;
export default EvaCrtControl;
