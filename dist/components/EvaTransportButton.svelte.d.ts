interface Props {
    playing?: boolean;
    label?: string;
    showLabel?: boolean;
    minWidth?: string;
    onToggle?: (next: boolean) => void;
}
declare const EvaTransportButton: import("svelte").Component<Props, {}, "playing">;
type EvaTransportButton = ReturnType<typeof EvaTransportButton>;
export default EvaTransportButton;
