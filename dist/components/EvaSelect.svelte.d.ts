import { type EvaTransitionOption } from '../transitions';
interface Props {
    label?: string;
    options?: {
        value: string;
        label: string;
    }[];
    value?: string;
    transition?: EvaTransitionOption;
}
declare const EvaSelect: import("svelte").Component<Props, {}, "value">;
type EvaSelect = ReturnType<typeof EvaSelect>;
export default EvaSelect;
