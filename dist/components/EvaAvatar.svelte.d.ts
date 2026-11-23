interface Props {
    initials?: string;
    label?: string;
    status?: 'online' | 'alert' | 'offline';
    size?: 'sm' | 'md' | 'lg';
}
declare const EvaAvatar: import("svelte").Component<Props, {}, "">;
type EvaAvatar = ReturnType<typeof EvaAvatar>;
export default EvaAvatar;
