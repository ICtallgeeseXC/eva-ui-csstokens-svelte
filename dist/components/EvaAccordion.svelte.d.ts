import { type EvaTransitionOption } from '../transitions';
export interface AccordionItem {
    id: string;
    code?: string;
    title: string;
    content: string;
}
interface Props {
    items?: AccordionItem[];
    openId?: string;
    transition?: EvaTransitionOption;
}
declare const EvaAccordion: import("svelte").Component<Props, {}, "openId">;
type EvaAccordion = ReturnType<typeof EvaAccordion>;
export default EvaAccordion;
