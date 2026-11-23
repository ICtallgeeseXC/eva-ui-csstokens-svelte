import { type Snippet } from 'svelte';
interface Props {
    title?: string;
    code?: string;
    status?: string;
    variant?: 'default' | 'alert' | 'elevated';
    scanlines?: boolean;
    hazardTop?: boolean;
    children?: Snippet;
    actions?: Snippet;
}
declare const EvaPanel: import("svelte").Component<Props, {}, "">;
type EvaPanel = ReturnType<typeof EvaPanel>;
export default EvaPanel;
