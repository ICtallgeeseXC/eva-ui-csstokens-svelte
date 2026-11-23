interface Props {
    kicker?: string;
    line1?: string;
    line2?: string;
    subtitle?: string;
    inverted?: boolean;
    variant?: 'card' | 'banner' | 'compact';
}
declare const EvaTitleCard: import("svelte").Component<Props, {}, "">;
type EvaTitleCard = ReturnType<typeof EvaTitleCard>;
export default EvaTitleCard;
