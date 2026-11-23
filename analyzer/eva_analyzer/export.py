"""Export unique frames, thumbnails, manifest.json, and extracted CSS motif tokens."""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import cv2

from .dedup import FrameRecord
from .grouping import MotifGroup, TemporalSequence


def export_analysis(
    output_dir: Path,
    video_meta: dict,
    video_url: str,
    video_title: str,
    frames: list[FrameRecord],
    sequences: list[TemporalSequence],
    motifs: list[MotifGroup],
    thumb_width: int = 480,
    public_prefix: str = "/analysis",
    video_path: Path | None = None,
    extract_audio: bool = False,
) -> Path:
    """Write optimized WebP frame thumbnails, optional per-sequence audio clips, manifest.json, and motif-tokens.css."""
    frames_dir = output_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    audio_dir = output_dir / "audio"
    if extract_audio and video_path is not None:
        audio_dir.mkdir(parents=True, exist_ok=True)

    seq_by_frame: dict[str, str] = {}
    motif_by_frame: dict[str, str] = {}
    for seq in sequences:
        for fid in seq.frame_ids:
            seq_by_frame[fid] = seq.id
            motif_by_frame[fid] = seq.motif_id

    frame_entries: list[dict] = []
    for f in frames:
        h, w = f.image_bgr.shape[:2]
        scale = thumb_width / float(w)
        thumb_h = max(1, int(round(h * scale)))
        thumb = cv2.resize(f.image_bgr, (thumb_width, thumb_h), interpolation=cv2.INTER_AREA)

        rel_path = f"frames/{f.id}.webp"
        cv2.imwrite(
            str(output_dir / rel_path),
            thumb,
            [cv2.IMWRITE_WEBP_QUALITY, 82],
        )

        frame_entries.append(
            {
                "id": f.id,
                "frameIndex": f.frame_index,
                "timestamp": f.timestamp,
                "timecode": f.timecode,
                "path": f"{public_prefix}/{rel_path}",
                "sequenceId": seq_by_frame.get(f.id, ""),
                "motifId": motif_by_frame.get(f.id, ""),
                "phash": f.phash_hex,
                "edgeDensity": f.edge_density,
                "meanRgb": list(f.mean_rgb),
                "dominantColors": f.dominant_colors,
                "reappearances": f.reappearances,
            }
        )

    seq_entries = []
    for s in sequences:
        audio_url: str | None = None
        if extract_audio and video_path is not None:
            clip_dur = max(0.35, (s.end_time - s.start_time) + 0.15)
            clip_name = f"{s.id}.mp3"
            clip_path = audio_dir / clip_name
            res = subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-ss",
                    f"{s.start_time:.3f}",
                    "-t",
                    f"{clip_dur:.3f}",
                    "-i",
                    str(video_path),
                    "-vn",
                    "-acodec",
                    "libmp3lame",
                    "-b:a",
                    "160k",
                    str(clip_path),
                ],
                capture_output=True,
            )
            if res.returncode == 0 and clip_path.exists():
                audio_url = f"{public_prefix}/audio/{clip_name}"

        seq_entries.append(
            {
                "id": s.id,
                "motifId": s.motif_id,
                "startTime": s.start_time,
                "endTime": s.end_time,
                "frameCount": len(s.frame_ids),
                "frameIds": s.frame_ids,
                "representativeFrameId": s.representative_frame_id,
                "audioPath": audio_url,
            }
        )

    motif_entries = [
        {
            "id": m.id,
            "label": m.label,
            "description": m.description,
            "sequenceCount": len(m.sequence_ids),
            "frameCount": len(m.frame_ids),
            "sequenceIds": m.sequence_ids,
            "frameIds": m.frame_ids,
            "representativeFrameId": m.representative_frame_id,
            "palette": m.palette,
            "cssTokens": m.css_tokens,
        }
        for m in motifs
    ]

    manifest = {
        "video": {
            "title": video_title,
            "url": video_url,
            **video_meta,
            "analyzedAt": datetime.now(timezone.utc).isoformat(),
        },
        "stats": {
            "uniqueFrames": len(frame_entries),
            "temporalSequences": len(seq_entries),
            "motifGroups": len(motif_entries),
        },
        "motifs": motif_entries,
        "sequences": seq_entries,
        "frames": frame_entries,
    }

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # Also write ready-to-import CSS theme classes per discovered motif
    css_lines = [
        "/* Auto-generated Evangelion UI Motif Themes from Video Frame Analysis */",
        "",
    ]
    for m in motifs:
        css_lines.append(f"/* {m.label} ({len(m.frame_ids)} frames) */")
        css_lines.append(f'[data-eva-motif="{m.id}"] {{')
        for k, v in m.css_tokens.items():
            css_lines.append(f"  {k}: {v};")
        css_lines.append("}")
        css_lines.append("")

    (output_dir / "motif-tokens.css").write_text("\n".join(css_lines), encoding="utf-8")
    return manifest_path
