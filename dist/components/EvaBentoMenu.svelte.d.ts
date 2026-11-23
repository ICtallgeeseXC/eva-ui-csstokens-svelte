import { type EvaTransitionOption } from '../transitions';
export interface BentoItem {
    id: string;
    code: string;
    label: string;
}
interface Props {
    items?: BentoItem[];
    transition?: EvaTransitionOption;
    onSelect?: (item: BentoItem) => void;
}
declare const EvaBentoMenu: import("svelte").Component<Props, {}, "">;
type EvaBentoMenu = ReturnType<typeof EvaBentoMenu>;
export default EvaBentoMenu;
