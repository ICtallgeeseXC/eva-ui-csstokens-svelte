import { type EvaTransitionOption } from '../transitions';
interface Props {
    label?: string;
    value?: string;
    transition?: EvaTransitionOption;
}
declare const EvaDatePicker: import("svelte").Component<Props, {}, "value">;
type EvaDatePicker = ReturnType<typeof EvaDatePicker>;
export default EvaDatePicker;
