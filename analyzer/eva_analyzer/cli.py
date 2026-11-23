"""CLI entrypoint for the Evangelion UI frame analyzer."""

from __future__ import annotations

import argparse
from pathlib import Path

from .dedup import extract_unique_frames
from .export import export_analysis
from .grouping import cluster_motifs, group_temporal_sequences


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Analyze a video for unique UI frames and interconnected motif groups."
    )
    parser.add_argument("video", type=Path, help="Path to input video file")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("../static/analysis"),
        help="Output directory for manifest, frames, and motif CSS tokens",
    )
    parser.add_argument(
        "--url",
        type=str,
        default="https://www.youtube.com/watch?v=k0oQr7ZVtBQ",
        help="Source video URL for manifest metadata",
    )
    parser.add_argument(
        "--title",
        type=str,
        default="All Evangelion UI / GUI Scenes (+EOE) : [Breakcore EDITION] v.2",
        help="Source video title for manifest metadata",
    )
    parser.add_argument("--sample-fps", type=float, default=8.0, help="Sampling rate in FPS")
    parser.add_argument(
        "--phash-threshold",
        type=int,
        default=3,
        help="Minimum pHash Hamming distance between consecutive unique frames",
    )
    parser.add_argument(
        "--cluster-threshold",
        type=float,
        default=0.50,
        help="Cosine distance threshold for Agglomerative Clustering of motifs",
    )
    parser.add_argument(
        "--public-prefix",
        type=str,
        default="/analysis",
        help="Public URL prefix for exported frames/audio in manifest.json",
    )
    parser.add_argument(
        "--extract-audio",
        action="store_true",
        help="Extract per-sequence MP3 audio clips using ffmpeg",
    )
    args = parser.parse_args()

    print(f"[1/4] Extracting unique frames from {args.video} @ {args.sample_fps} fps...")
    frames, meta = extract_unique_frames(
        str(args.video),
        sample_fps=args.sample_fps,
        phash_threshold=args.phash_threshold,
    )
    print(
        f"      Sampled {meta['sampled_frames']} frames -> {len(frames)} unique frames "
        f"(skipped {meta['skipped_black_frames']} black frames)."
    )

    print("[2/4] Grouping consecutive frames into temporal sequences...")
    sequences = group_temporal_sequences(frames)
    print(f"      Formed {len(sequences)} temporal sequences.")

    print("[3/4] Clustering interconnected sequences into visual/semantic UI motifs...")
    motifs = cluster_motifs(frames, sequences, distance_threshold=args.cluster_threshold)
    print(f"      Discovered {len(motifs)} motif groups:")
    for m in motifs:
        print(
            f"        - {m.id}: {m.label} | {len(m.sequence_ids)} seqs, "
            f"{len(m.frame_ids)} frames | primary={m.palette['primary']}"
        )

    print(f"[4/4] Exporting thumbnails, manifest.json, and motif-tokens.css to {args.out}...")
    manifest_path = export_analysis(
        output_dir=args.out,
        video_meta=meta,
        video_url=args.url,
        video_title=args.title,
        frames=frames,
        sequences=sequences,
        motifs=motifs,
        public_prefix=args.public_prefix,
        video_path=args.video,
        extract_audio=args.extract_audio,
    )
    print(f"Done! Manifest written to {manifest_path}")


if __name__ == "__main__":
    main()
