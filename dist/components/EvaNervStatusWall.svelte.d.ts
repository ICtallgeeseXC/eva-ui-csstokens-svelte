export interface StatusCell {
    code: string;
    label: string;
    state: 'normal' | 'caution' | 'lock' | 'open';
}
interface Props {
    title?: string;
    cells?: StatusCell[];
    interactive?: boolean;
}
declare const EvaNervStatusWall: import("svelte").Component<Props, {}, "cells">;
type EvaNervStatusWall = ReturnType<typeof EvaNervStatusWall>;
export default EvaNervStatusWall;
