<svelte:options customElement={{ tag: 'eva-magi-panel', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import EvaBilingualHeader from './EvaBilingualHeader.svelte';
	import EvaFrame from './EvaFrame.svelte';
	import EvaMagiNode, { type MagiVote } from './EvaMagiNode.svelte';
	import EvaMagiResolution, { type MagiResolutionStatus } from './EvaMagiResolution.svelte';
	import EvaTriadGrid from './EvaTriadGrid.svelte';

	export interface MagiNode {
		id: string;
		name: string;
		role?: string;
		vote: MagiVote;
	}

	interface Props {
		title?: string;
		issue?: string;
		nodes?: MagiNode[];
		interactive?: boolean;
		onNodeClick?: (node: MagiNode, index: number) => void;
	}

	const defaultNodes: MagiNode[] = [
		{ id: 'balthasar', name: 'BALTHASAR-2', role: 'MOTHER', vote: 'approved' },
		{ id: 'casper', name: 'CASPER-3', role: 'WOMAN', vote: 'denied' },
		{ id: 'melchior', name: 'MELCHIOR-1', role: 'SCIENTIST', vote: 'approved' }
	];

	let {
		title = 'MAGI // 決議',
		issue = 'MULTI ARTIFICIAL GENERAL INTELLIGENCE',
		nodes = $bindable(defaultNodes),
		interactive = true,
		onNodeClick
	}: Props = $props();

	const cycleOrder: MagiVote[] = ['approved', 'denied', 'pending', 'override'];

	let flashPhase = $state(true);

	onMount(() => {
		const id = setInterval(() => {
			flashPhase = !flashPhase;
		}, 425);
		return () => clearInterval(id);
	});

	function handleSelect(node: MagiNode, idx: number) {
		if (interactive) {
			const normalized: MagiVote = node.vote === 'rejected' ? 'denied' : node.vote;
			const nextVote = cycleOrder[(cycleOrder.indexOf(normalized) + 1) % cycleOrder.length];
			nodes = nodes.map((n, i) => (i === idx ? { ...n, vote: nextVote } : n));
		}
		onNodeClick?.(nodes[idx], idx);
	}

	// Unanimity rule (Episode 13: "Lilliputian Hitcher"): a single DENIED vote vetoes the directive
	const consensus = $derived.by<MagiResolutionStatus>(() => {
		if (nodes.some((n) => n.vote === 'denied' || n.vote === 'rejected')) return 'DENIED';
		if (nodes.length > 0 && nodes.every((n) => n.vote === 'approved' || n.vote === 'override')) {
			return 'APPROVED';
		}
		return 'DELIBERATING';
	});
</script>

<EvaFrame variant="double" padding="0.75rem" gap="0.75rem">
	<EvaBilingualHeader jp={title} title={issue}>
		{#snippet right()}
			<EvaMagiResolution status={consensus} {flashPhase} />
		{/snippet}
	</EvaBilingualHeader>

	<!-- Classic Evangelion MAGI Pyramid: all 3 units identical exact width & height -->
	<EvaTriadGrid>
		{#each nodes as node, idx (node.id)}
			<EvaMagiNode
				name={node.name}
				role={node.role}
				vote={node.vote}
				{flashPhase}
				{interactive}
				onSelect={() => handleSelect(node, idx)}
			/>
		{/each}
	</EvaTriadGrid>
</EvaFrame>
