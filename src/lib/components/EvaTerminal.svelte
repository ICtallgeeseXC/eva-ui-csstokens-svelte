<svelte:options customElement={{ tag: 'eva-terminal', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';

	export interface TerminalLog {
		time: string;
		level?: 'info' | 'warn' | 'crit';
		message: string;
	}

	interface Props {
		logs?: TerminalLog[];
		streaming?: boolean;
		intervalMs?: number;
		visibleLines?: number;
	}

	const seedLines = [
		'rdnperfect=@perfect[LEVELK001ZB1]LeftGauge=170404233463RightGauge=3395616445',
		'3395616445LevelToys=1AEFLgauge=art\\wuk.ar[LEVELX711]name=WelcomeLeftToyBox',
		'tToyBox=21390131456RightToyBox=508393623450gauge=art\\wug.arK56n1=0193842',
		'8n7=1364131K58n8=0251149K74n1=153353K74n2=1330123K74n3=0534155K74n4=918273',
		'476name=Level11bg=bgb1w01a.zltsong=gkc\\bss_mus1.midfriction=5Puppgauge=art',
		'2241476RightGauge=397392479476name=Level23bg=bgb1w01a.zltsong=gkc\\gdn_low',
		'035TB7]LeftGauge=159392241476RightGauge=397392479476name=Level35K58n1=991',
		'170322K74n2=180112K74n3=0355145K74n4=0450154K74n5=0261192K74n6=1928374K74',
		'e=372403450478Name=G.7bg=bgg1w01a.zltsong=4;gkc\\gdn_low.mid;gkc\\wuk_hi.mid',
		'6K58n2=0110295K58n3=1574189K58n4=022995K58n5=1320293K58n6=034323K58n7=88412',
		'08]LeftGauge=196403273478RightGauge=372403450478Name=G.8bg=bgg1w01a.zltsong',
		'HIJKLgauge=art\\wus.ar[LEVELE050XX9]LeftGauge=159392241476RightGauge=882910',
		'=0ABCDEFGHIJKL1ABCDEFGHIJKLgauge=art\\wus.arWindStart=100[LEVELK002XC8]K91',
		'olor=1LeftToyBox=4395127454RightToyBox=513395616445leveltoys=1AEFLfriction=3'
	];

	let {
		logs,
		streaming = true,
		intervalMs = 110,
		visibleLines = 28
	}: Props = $props();

	let offset = $state(0);
	let counter = $state(100);

	onMount(() => {
		if (!streaming || logs) return;
		const id = setInterval(() => {
			offset = (offset + 1) % seedLines.length;
			counter = (counter + 17) % 999999;
		}, intervalMs);
		return () => clearInterval(id);
	});

	const displayLines = $derived.by(() => {
		if (logs) return logs.map((l) => l.message);
		return Array.from({ length: visibleLines }, (_, i) => {
			const idx = (offset + i) % seedLines.length;
			const nextIdx = (idx + 3) % seedLines.length;
			const suffix = i >= visibleLines - 2 ? String(counter + i * 31).padStart(6, '0') : '';
			return `${seedLines[idx]}${suffix}${seedLines[nextIdx]}`;
		});
	});
</script>

<div class="eva-term" aria-label="Raw Telemetry Data Stream">
	<div class="eva-term__wall">
		{#each displayLines as line}
			<div class="eva-term__line">{line}</div>
		{/each}
	</div>
</div>

<style>
	.eva-term {
		position: relative;
		flex: 1;
		min-height: 220px;
		height: 100%;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-term__wall {
		position: absolute;
		inset: 0.25rem 0.2rem;
		display: flex;
		flex-direction: column;
		font-family: var(--eva-font-mono);
		font-size: 0.78rem;
		font-weight: 500;
		line-height: 1.26;
		letter-spacing: -0.02em;
		color: #f3d2a8;
		text-shadow: 0 0 4px rgba(243, 210, 168, 0.35);
	}

	.eva-term__line {
		flex-shrink: 0;
		white-space: nowrap;
		overflow: hidden;
	}
</style>
