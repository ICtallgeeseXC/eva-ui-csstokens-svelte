import { type EvaTransitionOption } from '../transitions';
interface Props {
    variant?: 'hamburger' | 'kebab' | 'meatballs';
    items?: string[];
    transition?: EvaTransitionOption;
    onSelect?: (item: string) => void;
}
declare const EvaActionMenu: import("svelte").Component<Props, {}, "">;
type EvaActionMenu = ReturnType<typeof EvaActionMenu>;
export default EvaActionMenu;
