<svelte:options customElement={{ tag: 'eva-comment-thread', shadow: 'none' }} />

<script lang="ts">
	import EvaAvatar from './EvaAvatar.svelte';

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

	const defaultComments: CommentEntry[] = [
		{
			id: 'c1',
			initials: 'RK',
			author: 'AKAGI, RITSUKO',
			time: '19:02:14',
			status: 'online',
			body: 'MAGI-02 Balthasar harmonic drift stabilized within 0.02%.'
		},
		{
			id: 'c2',
			initials: 'MK',
			author: 'KATSURAGI, MISATO',
			time: '19:04:08',
			status: 'alert',
			body: 'Maintain Pattern Blue perimeter until Unit-01 umbilical swap completes.'
		}
	];

	let { comments = $bindable(defaultComments) }: Props = $props();
	let draft = $state('');

	function post(e: SubmitEvent) {
		e.preventDefault();
		const text = draft.trim();
		if (!text) return;
		const now = new Date();
		const hh = String(now.getHours()).padStart(2, '0');
		const mm = String(now.getMinutes()).padStart(2, '0');
		const ss = String(now.getSeconds()).padStart(2, '0');
		comments = [
			...comments,
			{
				id: `c_${Date.now()}`,
				initials: 'OP',
				author: 'OPERATOR-01',
				time: `${hh}:${mm}:${ss}`,
				status: 'online',
				body: text
			}
		];
		draft = '';
	}
</script>

<div class="eva-cmt">
	<div class="eva-cmt__list">
		{#each comments as c (c.id)}
			<div class="eva-cmt__item">
				<div class="eva-cmt__head">
					<EvaAvatar initials={c.initials} label={c.author} status={c.status ?? 'online'} size="sm" />
					<span class="eva-cmt__time">[{c.time}]</span>
				</div>
				<p class="eva-cmt__body">{c.body}</p>
			</div>
		{/each}
	</div>

	<form class="eva-cmt__form" onsubmit={post}>
		<input
			type="text"
			class="eva-cmt__input"
			placeholder="APPEND OPERATOR ANNOTATION..."
			bind:value={draft}
		/>
		<button type="submit" class="eva-btn">POST</button>
	</form>
</div>

<style>
	.eva-cmt {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.eva-cmt__list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.eva-cmt__item {
		padding: 0.55rem 0.68rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 5px;
	}

	.eva-cmt__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.35rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid rgba(255, 148, 26, 0.25);
	}

	.eva-cmt__time {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--eva-gold, #fff275);
	}

	.eva-cmt__body {
		margin: 0;
		font-family: var(--eva-font-sans);
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--eva-text-hi);
		line-height: 1.35;
	}

	.eva-cmt__form {
		display: flex;
		gap: 0.5rem;
	}

	.eva-cmt__input {
		flex: 1;
		padding: 0.38rem 0.65rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 5px;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		outline: none;
	}
</style>
