export type MagiResolutionStatus = 'APPROVED' | 'DENIED' | 'DELIBERATING';
interface Props {
    status?: MagiResolutionStatus;
    label?: string;
    flashPhase?: boolean;
}
declare const EvaMagiResolution: import("svelte").Component<Props, {}, "">;
type EvaMagiResolution = ReturnType<typeof EvaMagiResolution>;
export default EvaMagiResolution;
