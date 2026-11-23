<svelte:options customElement={{ tag: 'eva-magi-node', shadow: 'none' }} />

<script lang="ts">
	import EvaChamferBox from './EvaChamferBox.svelte';

	export type MagiVote = 'approved' | 'denied' | 'pending' | 'override' | 'rejected';

	interface Props {
		name?: string;
		role?: string;
		vote?: MagiVote;
		flashPhase?: boolean;
		interactive?: boolean;
		onSelect?: () => void;
	}

	let {
		name = 'CASPER-3',
		role = 'WOMAN',
		vote = 'denied',
		flashPhase = true,
		interactive = true,
		onSelect
	}: Props = $props();

	const isDenied = $derived(vote === 'denied' || vote === 'rejected');
	const voteText = $derived(
		vote === 'pending'
			? 'COMPUTING...'
			: isDenied
				? 'DENIED // 否定'
				: vote === 'approved'
					? 'APPROVED // 可決'
					: 'OVERRIDE'
	);
	const nodeColor = $derived(
		vote === 'approved'
			? '#00c8ff'
			: isDenied
				? '#ff2222'
				: vote === 'override'
					? '#ff8c00'
					: '#ff9900'
	);
	const nodeBg = $derived(isDenied ? '#240404' : '#000000');
	const nodeFilled = $derived(
		vote === 'approved' || vote === 'override' || (isDenied && flashPhase)
	);
</script>

<EvaChamferBox
	clickable
	disabled={!interactive}
	color={nodeColor}
	bg={nodeBg}
	filled={nodeFilled}
	hatched={vote === 'pending'}
	minHeight="74px"
	padding="0.65rem 0.6rem"
	eyebrow={role}
	title={name}
	subtitle={voteText}
	onclick={() => onSelect?.()}
/>
