import type { Snippet } from 'svelte';
import { type EvaTransitionOption } from '../transitions';
interface Props {
    open?: boolean;
    title?: string;
    code?: string;
    variant?: 'default' | 'alert';
    transition?: EvaTransitionOption;
    children?: Snippet;
    footer?: Snippet;
}
declare const EvaModal: import("svelte").Component<Props, {}, "open">;
type EvaModal = ReturnType<typeof EvaModal>;
export default EvaModal;
