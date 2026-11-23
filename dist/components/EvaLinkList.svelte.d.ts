export interface LinkEntry {
    href: string;
    code: string;
    label: string;
    tag?: string;
}
interface Props {
    links?: LinkEntry[];
}
declare const EvaLinkList: import("svelte").Component<Props, {}, "">;
type EvaLinkList = ReturnType<typeof EvaLinkList>;
export default EvaLinkList;
