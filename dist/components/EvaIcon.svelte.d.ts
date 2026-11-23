export type EvaIconName = 'warning' | 'magi' | 'lock' | 'power' | 'radar' | 'terminal' | 'audio' | 'search';
interface Props {
    name?: EvaIconName;
    size?: number;
}
declare const EvaIcon: import("svelte").Component<Props, {}, "">;
type EvaIcon = ReturnType<typeof EvaIcon>;
export default EvaIcon;
