"""Two-level interconnected grouping: temporal sequences + visual/semantic motif clusters."""

from __future__ import annotations

from dataclasses import dataclass, field
import colorsys
import numpy as np
from sklearn.cluster import AgglomerativeClustering

from .dedup import FrameRecord


@dataclass
class TemporalSequence:
    """A contiguous run of unique frames forming a single UI scene or animation."""

    id: str
    start_time: float
    end_time: float
    frame_ids: list[str]
    representative_frame_id: str
    feature_vec: np.ndarray = field(repr=False)
    motif_id: str = ""


@dataclass
class MotifGroup:
    """A cluster of interconnected sequences sharing a recurring UI visual language."""

    id: str
    label: str
    description: str
    sequence_ids: list[str]
    frame_ids: list[str]
    representative_frame_id: str
    palette: dict[str, str | list[str]]
    css_tokens: dict[str, str]


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


def group_temporal_sequences(
    frames: list[FrameRecord],
    max_time_gap: float = 1.6,
    max_phash_dist: int = 16,
    min_cosine_sim: float = 0.72,
) -> list[TemporalSequence]:
    """Group consecutive unique frames that belong to the same continuous UI shot."""
    if not frames:
        return []

    sequences: list[TemporalSequence] = []
    current_group: list[FrameRecord] = [frames[0]]

    def flush(group: list[FrameRecord]) -> None:
        # Pick the frame with highest edge_density (most UI detail) as representative
        rep = max(group, key=lambda f: f.edge_density)
        mean_feat = np.mean([f.feature_vec for f in group], axis=0)
        seq_id = f"seq_{len(sequences) + 1:03d}"
        sequences.append(
            TemporalSequence(
                id=seq_id,
                start_time=group[0].timestamp,
                end_time=group[-1].timestamp,
                frame_ids=[f.id for f in group],
                representative_frame_id=rep.id,
                feature_vec=mean_feat,
            )
        )

    for prev, curr in zip(frames, frames[1:]):
        time_gap = curr.timestamp - prev.timestamp
        phash_dist = curr.phash - prev.phash
        cos_sim = _cosine_similarity(curr.feature_vec, prev.feature_vec)

        if time_gap <= max_time_gap and (phash_dist <= max_phash_dist or cos_sim >= min_cosine_sim):
            current_group.append(curr)
        else:
            flush(current_group)
            current_group = [curr]

    flush(current_group)
    return sequences


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"


def _luminance(rgb: tuple[int, int, int]) -> float:
    return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255.0


def _saturation_and_hue(rgb: tuple[int, int, int]) -> tuple[float, float]:
    h, s, _ = colorsys.rgb_to_hsv(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0)
    return h * 360.0, s


def build_palette_and_label(
    cluster_frames: list[FrameRecord],
    cluster_idx: int,
) -> tuple[str, str, dict[str, str | list[str]], dict[str, str]]:
    """Extract a cohesive CSS palette and semantic label for a motif cluster."""
    all_hex: list[str] = []
    for f in cluster_frames:
        all_hex.extend(f.dominant_colors)

    # Deduplicate similar colors by quantizing slightly for ranking
    color_counts: dict[str, int] = {}
    for hx in all_hex:
        color_counts[hx] = color_counts.get(hx, 0) + 1

    # Merge very close colors
    sorted_colors = sorted(color_counts.items(), key=lambda kv: -kv[1])
    swatches: list[str] = []
    for hx, _ in sorted_colors:
        rgb = _hex_to_rgb(hx)
        if all(
            sum(abs(rgb[i] - _hex_to_rgb(s)[i]) for i in range(3)) > 48
            for s in swatches
        ):
            swatches.append(hx)
        if len(swatches) >= 6:
            break

    if not swatches:
        swatches = ["#0a0a0c", "#ff9900", "#ff2a2a", "#00e5ff", "#e8e8e8"]

    # Pick bg (darkest), text (lightest), primary (most saturated vibrant), accent (second vibrant)
    sorted_by_luma = sorted(swatches, key=lambda c: _luminance(_hex_to_rgb(c)))
    bg = sorted_by_luma[0]
    if _luminance(_hex_to_rgb(bg)) > 0.22:
        bg = "#08090c"

    # Surface is slightly lifted from bg
    br, bg_g, bb = _hex_to_rgb(bg)
    surface = _rgb_to_hex(min(255, br + 14), min(255, bg_g + 16), min(255, bb + 20))

    vibrant = sorted(
        swatches,
        key=lambda c: _saturation_and_hue(_hex_to_rgb(c))[1]
        * (0.4 + _luminance(_hex_to_rgb(c))),
        reverse=True,
    )
    primary = vibrant[0]
    accent = vibrant[1] if len(vibrant) > 1 else primary

    # Ensure primary isn't near-black
    if _luminance(_hex_to_rgb(primary)) < 0.15:
        primary = "#ff8c00"
    if _luminance(_hex_to_rgb(accent)) < 0.15:
        accent = "#ff2e2e"

    text = sorted_by_luma[-1]
    if _luminance(_hex_to_rgb(text)) < 0.65:
        text = "#f0ede6"

    # Classify motif label from primary hue + edge density
    hue, sat = _saturation_and_hue(_hex_to_rgb(primary))
    avg_edges = float(np.mean([f.edge_density for f in cluster_frames]))

    if sat < 0.18:
        label = f"Monochrome Wireframe #{cluster_idx}"
        desc = "High-contrast monochrome schematics, typography cards, and structural wireframes."
    elif hue < 20 or hue >= 335:
        label = f"Crimson Emergency / Alert #{cluster_idx}"
        desc = "Red-spectrum warning banners, contamination/pattern alerts, and critical status overlays."
    elif 20 <= hue < 55:
        label = f"NERV Amber / MAGI Terminal #{cluster_idx}"
        desc = "Iconic amber/orange NERV tactical consoles, hex matrices, and MAGI decision readouts."
    elif 55 <= hue < 165:
        label = f"Sync Green / Telemetry #{cluster_idx}"
        desc = "Phosphor green waveforms, synchronization graphs, and Entry Plug biometric telemetry."
    elif 165 <= hue < 255:
        label = f"MAGI Cyan / Radar HUD #{cluster_idx}"
        desc = "Cyan/blue radar sweeps, targeting reticles, and diagnostic wireframe projections."
    else:
        label = f"Violet / AT-Field Spectrum #{cluster_idx}"
        desc = "High-contrast magenta/violet energy signatures and phase-space displays."

    if avg_edges > 0.18:
        desc += " High information density."

    palette = {
        "bg": bg,
        "surface": surface,
        "primary": primary,
        "accent": accent,
        "text": text,
        "swatches": swatches,
    }
    css_tokens = {
        "--eva-bg": bg,
        "--eva-surface": surface,
        "--eva-primary": primary,
        "--eva-accent": accent,
        "--eva-text": text,
    }
    return label, desc, palette, css_tokens


def cluster_motifs(
    frames: list[FrameRecord],
    sequences: list[TemporalSequence],
    distance_threshold: float = 0.42,
) -> list[MotifGroup]:
    """Cluster temporal sequences into recurring visual/semantic UI motif groups."""
    if not sequences:
        return []

    frame_map = {f.id: f for f in frames}

    if len(sequences) == 1:
        labels = np.array([0])
    else:
        X = np.vstack([s.feature_vec for s in sequences])
        clustering = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=distance_threshold,
            metric="cosine",
            linkage="average",
        )
        labels = clustering.fit_predict(X)

    grouped_seqs: dict[int, list[TemporalSequence]] = {}
    for seq, lbl in zip(sequences, labels):
        grouped_seqs.setdefault(int(lbl), []).append(seq)

    # Sort motif clusters by total frame count descending
    sorted_clusters = sorted(
        grouped_seqs.values(),
        key=lambda seqs: sum(len(s.frame_ids) for s in seqs),
        reverse=True,
    )

    motifs: list[MotifGroup] = []
    for idx, seqs in enumerate(sorted_clusters, start=1):
        motif_id = f"motif_{idx:02d}"
        seq_ids: list[str] = []
        frame_ids: list[str] = []
        cluster_frames: list[FrameRecord] = []

        for s in seqs:
            s.motif_id = motif_id
            seq_ids.append(s.id)
            for fid in s.frame_ids:
                frame_ids.append(fid)
                cluster_frames.append(frame_map[fid])

        rep_frame = max(cluster_frames, key=lambda f: f.edge_density)
        label, desc, palette, css_tokens = build_palette_and_label(cluster_frames, idx)

        motifs.append(
            MotifGroup(
                id=motif_id,
                label=label,
                description=desc,
                sequence_ids=seq_ids,
                frame_ids=frame_ids,
                representative_frame_id=rep_frame.id,
                palette=palette,
                css_tokens=css_tokens,
            )
        )

    return motifs
