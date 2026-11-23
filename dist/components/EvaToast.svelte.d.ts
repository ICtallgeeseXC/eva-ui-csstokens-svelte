import { type EvaTransitionOption } from '../transitions';
export interface ToastItem {
    id: string;
    title: string;
    message?: string;
    severity?: 'info' | 'warning' | 'emergency' | 'nominal';
    phosphor?: boolean | 'gold' | 'severity';
    duration?: number;
    transition?: EvaTransitionOption;
}
interface Props {
    toasts?: ToastItem[];
    phosphor?: boolean | 'gold' | 'severity';
    defaultDuration?: number;
    transition?: EvaTransitionOption;
    onDismiss?: (id: string) => void;
}
declare const EvaToast: import("svelte").Component<Props, {}, "toasts">;
type EvaToast = ReturnType<typeof EvaToast>;
export default EvaToast;
