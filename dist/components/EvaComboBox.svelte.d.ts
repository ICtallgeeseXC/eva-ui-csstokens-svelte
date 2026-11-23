import { type EvaTransitionOption } from '../transitions';
interface Props {
    label?: string;
    options?: string[];
    value?: string;
    placeholder?: string;
    transition?: EvaTransitionOption;
}
declare const EvaComboBox: import("svelte").Component<Props, {}, "value">;
type EvaComboBox = ReturnType<typeof EvaComboBox>;
export default EvaComboBox;
