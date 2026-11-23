<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/base.css';
	import { page } from '$app/state';
	import { EVA_THEMES, EvaCrtControl, EvaHudBox, EvaTitleCard, type EvaTheme } from '$lib';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	let activeTheme = $state<EvaTheme>('nerv');
	let headerHidden = $state(false);

	function setTheme(theme: EvaTheme) {
		activeTheme = theme;
		if (typeof document !== 'undefined') {
			document.documentElement.removeAttribute('data-eva-motif');
			document.documentElement.setAttribute('data-eva-theme', theme);
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="/analysis/motif-tokens.css" />
</svelte:head>

<div class="app-shell eva-root eva-grid-bg">
	{#if !headerHidden}
		<header class="topbar">
			<div class="topbar__inner">
				<div class="brand">
					<EvaTitleCard
						variant="compact"
						kicker="NERV // UI-LIB"
						line1="EVA-UI"
						line2=""
						subtitle="NERV INTERFACE SYSTEM"
					/>
				</div>

				<nav class="nav" aria-label="Primary">
					<a href="/" class="nav__link" class:is-active={page.url.pathname === '/'}>
						00 // UI LIBRARY
					</a>
					<a
						href="/explorer"
						class="nav__link"
						class:is-active={page.url.pathname.startsWith('/explorer')}
					>
						01 // FRAME & MOTIF EXPLORER
					</a>
					<a
						href="/philosophies"
						class="nav__link"
						class:is-active={page.url.pathname.startsWith('/philosophies')}
					>
						02 // CORE PHILOSOPHIES
					</a>
					<a
						href="/visualizer"
						class="nav__link"
						class:is-active={page.url.pathname.startsWith('/visualizer')}
					>
						03 // AUDIO VISUALIZER
					</a>
					<a
						href="/command"
						class="nav__link"
						class:is-active={page.url.pathname.startsWith('/command')}
					>
						04 // COMMAND CONSOLE
					</a>
				</nav>

				<div class="theme-bar" role="group" aria-label="Theme Switcher">
					{#each EVA_THEMES as t}
						<button
							type="button"
							class="theme-pill"
							class:is-active={activeTheme === t.id}
							style="--pill-color: {t.primary}"
							onclick={() => setTheme(t.id)}
							title={t.label}
						>
							<span class="theme-pill__dot"></span>
							<span class="theme-pill__label">{t.label}</span>
						</button>
					{/each}
					<EvaCrtControl compact />
					<button
						type="button"
						class="hdr-toggle"
						onclick={() => (headerHidden = true)}
						aria-pressed={false}
						title="Hide top header bar"
					>
						<EvaHudBox size="sm" color="#46f76a">
							<span class="hdr-dual">
								<span>HDR</span>
								<span class="hdr-dual__opt is-lit">ON</span>
								<span class="hdr-dual__sep">/</span>
								<span class="hdr-dual__opt">OFF</span>
							</span>
						</EvaHudBox>
					</button>
				</div>
			</div>
		</header>
	{:else}
		<button
			type="button"
			class="hdr-toggle hdr-toggle--floating"
			onclick={() => (headerHidden = false)}
			aria-pressed={true}
			title="Show top header bar"
		>
			<EvaHudBox size="sm" color="#ff941a">
				<span class="hdr-dual">
					<span>HDR</span>
					<span class="hdr-dual__opt">ON</span>
					<span class="hdr-dual__sep">/</span>
					<span class="hdr-dual__opt is-lit">OFF</span>
				</span>
			</EvaHudBox>
		</button>
	{/if}

	<main class="main-content">
		{#if children}
			{@render children()}
		{/if}
	</main>
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		overflow-x: clip;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 40;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
		box-shadow: 0 2px 14px var(--eva-primary-dim);
	}

	.topbar__inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.6rem 1.25rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.brand {
		display: flex;
		align-items: center;
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	@media (max-width: 640px) {
		.topbar__inner {
			padding: 0.5rem 0.75rem;
			gap: 0.65rem;
		}

		.nav__link {
			padding: 0.28rem 0.55rem;
			font-size: 0.76rem;
		}

		.main-content {
			padding: 1rem 0.75rem 2.5rem;
		}
	}

	.nav__link {
		text-decoration: none;
		padding: 0.34rem 0.85rem;
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.04em;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		background: #000000;
		transition: all 120ms ease;
	}

	.nav__link:hover,
	.nav__link.is-active {
		color: #000000;
		background: var(--eva-primary);
		border-color: var(--eva-border-strong);
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.theme-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}

	.hdr-toggle {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
	}

	.hdr-toggle--floating {
		position: fixed;
		top: 0.5rem;
		right: 0.85rem;
		z-index: 45;
		background: rgba(0, 0, 0, 0.88);
		border-radius: 3px;
		box-shadow: 0 2px 14px rgba(0, 0, 0, 0.9);
	}

	.hdr-dual {
		display: inline-flex;
		align-items: center;
		gap: 0.24rem;
		font-family: var(--eva-font-display);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.hdr-dual__opt {
		opacity: 0.35;
	}

	.hdr-dual__opt.is-lit {
		opacity: 1;
	}

	.hdr-dual__sep {
		opacity: 0.45;
	}

	.theme-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.22rem 0.6rem;
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		cursor: pointer;
	}

	.theme-pill.is-active {
		color: var(--pill-color);
		border-color: var(--pill-color);
		outline: 1px solid color-mix(in srgb, var(--pill-color) 50%, transparent);
		outline-offset: 1px;
		background: #000000;
		box-shadow: 0 0 10px color-mix(in srgb, var(--pill-color) 35%, transparent);
	}

	.theme-pill__dot {
		width: 5px;
		height: 11px;
		border-radius: 999px;
		background: var(--pill-color);
	}

	.main-content {
		flex: 1;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 3rem;
		box-sizing: border-box;
	}
</style>
