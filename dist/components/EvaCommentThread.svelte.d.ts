export interface CommentEntry {
    id: string;
    initials: string;
    author: string;
    time: string;
    body: string;
    status?: 'online' | 'alert' | 'offline';
}
interface Props {
    comments?: CommentEntry[];
}
declare const EvaCommentThread: import("svelte").Component<Props, {}, "comments">;
type EvaCommentThread = ReturnType<typeof EvaCommentThread>;
export default EvaCommentThread;
