<svelte:options customElement={{ tag: 'eva-magi-resolution', shadow: 'none' }} />

<script lang="ts">
	import EvaStatusTag from './EvaStatusTag.svelte';

	export type MagiResolutionStatus = 'APPROVED' | 'DENIED' | 'DELIBERATING';

	interface Props {
		status?: MagiResolutionStatus;
		label?: string;
		flashPhase?: boolean;
	}

	let {
		status = 'DENIED',
		label = 'UNANIMOUS RESOLUTION',
		flashPhase = true
	}: Props = $props();

	const jpStatus = $derived(
		status === 'APPROVED' ? '可決' : status === 'DENIED' ? '否定' : '審議中'
	);
	const resColor = $derived(
		status === 'APPROVED'
			? '#00c8ff'
			: status === 'DENIED'
				? '#ff2222'
				: 'var(--eva-border-strong, #ff941a)'
	);
</script>

<EvaStatusTag
	variant="stacked"
	jpLabel={label}
	label={`${status} · ${jpStatus}`}
	color={resColor}
	inverted={status === 'DENIED' && !flashPhase}
	align="center"
	outlined
	glow
	size="md"
	minWidth="176px"
/>
