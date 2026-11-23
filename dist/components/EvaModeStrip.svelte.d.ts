interface Props {
    modes?: string[];
    active?: string;
    dangerMode?: string;
    critical?: boolean;
    interactive?: boolean;
    onSelect?: (mode: string) => void;
}
declare const EvaModeStrip: import("svelte").Component<Props, {}, "active">;
type EvaModeStrip = ReturnType<typeof EvaModeStrip>;
export default EvaModeStrip;
