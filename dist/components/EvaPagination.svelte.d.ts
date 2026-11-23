interface Props {
    page?: number;
    totalPages?: number;
    onChange?: (page: number) => void;
}
declare const EvaPagination: import("svelte").Component<Props, {}, "page">;
type EvaPagination = ReturnType<typeof EvaPagination>;
export default EvaPagination;
