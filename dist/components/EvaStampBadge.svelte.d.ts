interface Props {
    label?: string;
    sublabel?: string;
    variant?: 'alert' | 'amber' | 'cyan' | 'mono';
    filled?: boolean;
    tilt?: number;
}
declare const EvaStampBadge: import("svelte").Component<Props, {}, "">;
type EvaStampBadge = ReturnType<typeof EvaStampBadge>;
export default EvaStampBadge;
