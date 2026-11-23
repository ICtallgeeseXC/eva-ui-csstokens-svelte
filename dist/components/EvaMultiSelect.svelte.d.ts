import { type EvaTransitionOption } from '../transitions';
interface Props {
    label?: string;
    options?: string[];
    selected?: string[];
    transition?: EvaTransitionOption;
}
declare const EvaMultiSelect: import("svelte").Component<Props, {}, "selected">;
type EvaMultiSelect = ReturnType<typeof EvaMultiSelect>;
export default EvaMultiSelect;
