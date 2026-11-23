"""Perceptual frame sampling, deduplication, and visual feature extraction."""

from __future__ import annotations

from dataclasses import dataclass, field
import cv2
import imagehash
import numpy as np
from PIL import Image


@dataclass
class FrameRecord:
    """A unique frame extracted from the video with perceptual and visual features."""

    id: str
    frame_index: int
    timestamp: float
    timecode: str
    phash: imagehash.ImageHash
    phash_hex: str
    feature_vec: np.ndarray
    edge_density: float
    mean_rgb: tuple[int, int, int]
    dominant_colors: list[str]
    image_bgr: np.ndarray = field(repr=False)
    reappearances: list[float] = field(default_factory=list)


def format_timecode(seconds: float) -> str:
    """Format seconds as MM:SS.ms."""
    mins = int(seconds // 60)
    secs = seconds % 60
    return f"{mins:02d}:{secs:05.2f}"


def compute_visual_features(frame_bgr: np.ndarray) -> tuple[np.ndarray, float, tuple[int, int, int]]:
    """Compute HSV color histogram + 4x4 spatial edge & luminance descriptor."""
    small = cv2.resize(frame_bgr, (160, 90), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)

    # 3D HSV histogram (8x4x4 = 128 dims), normalized
    hist = cv2.calcHist([hsv], [0, 1, 2], None, [8, 4, 4], [0, 180, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()

    # Spatial 4x4 edge density + luminance grid (32 dims)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    edge_density = float(np.mean(edges > 0))

    grid_edges: list[float] = []
    grid_luma: list[float] = []
    h, w = gray.shape
    for r in range(4):
        for c in range(4):
            y0, y1 = (r * h) // 4, ((r + 1) * h) // 4
            x0, x1 = (c * w) // 4, ((c + 1) * w) // 4
            grid_edges.append(float(np.mean(edges[y0:y1, x0:x1] > 0)))
            grid_luma.append(float(np.mean(gray[y0:y1, x0:x1]) / 255.0))

    spatial = np.array(grid_edges + grid_luma, dtype=np.float32)
    spatial_norm = np.linalg.norm(spatial)
    if spatial_norm > 0:
        spatial = spatial / spatial_norm

    # Weighted concatenation: color (0.65) + spatial layout (0.35)
    feature_vec = np.concatenate([hist.astype(np.float32) * 0.65, spatial * 0.35])
    rgb_mean = cv2.cvtColor(small, cv2.COLOR_BGR2RGB).mean(axis=(0, 1))
    mean_rgb = (int(rgb_mean[0]), int(rgb_mean[1]), int(rgb_mean[2]))
    return feature_vec, edge_density, mean_rgb


def extract_dominant_colors(frame_bgr: np.ndarray, k: int = 5) -> list[str]:
    """Extract top-k dominant hex colors from a frame using fast k-means."""
    tiny = cv2.resize(frame_bgr, (64, 36), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(tiny, cv2.COLOR_BGR2RGB).reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 12, 1.0)
    _, labels, centers = cv2.kmeans(rgb, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS)

    counts = np.bincount(labels.flatten(), minlength=k)
    order = np.argsort(-counts)
    hex_colors: list[str] = []
    for idx in order:
        r, g, b = [int(np.clip(c, 0, 255)) for c in centers[idx]]
        hex_colors.append(f"#{r:02x}{g:02x}{b:02x}")
    return hex_colors


def extract_unique_frames(
    video_path: str,
    sample_fps: float = 8.0,
    phash_threshold: int = 3,
    global_dedup_threshold: int = 2,
    min_brightness: float = 4.0,
) -> tuple[list[FrameRecord], dict]:
    """Sample video and deduplicate frames perceptually (sequential + global)."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    native_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    duration = total_frames / native_fps if native_fps > 0 else 0.0

    step = max(1, int(round(native_fps / sample_fps)))

    unique_frames: list[FrameRecord] = []
    seen_hashes: list[tuple[int, FrameRecord]] = []
    last_kept_hash_int: int | None = None
    sampled_count = 0
    skipped_black = 0

    def hash_to_int(ph: imagehash.ImageHash) -> int:
        return int(str(ph), 16)

    frame_idx = 0
    while True:
        if frame_idx % step != 0:
            if not cap.grab():
                break
            frame_idx += 1
            continue

        ret, frame_bgr = cap.read()
        if not ret:
            break

        sampled_count += 1
        # Skip near-black transition frames
        if float(np.mean(frame_bgr)) < min_brightness:
            skipped_black += 1
            frame_idx += 1
            continue

        pil_img = Image.fromarray(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
        ph = imagehash.phash(pil_img, hash_size=8)
        ph_int = hash_to_int(ph)

        # Sequential deduplication against last kept frame
        if last_kept_hash_int is not None and (ph_int ^ last_kept_hash_int).bit_count() < phash_threshold:
            frame_idx += 1
            continue

        # Global deduplication against all previously seen unique frames
        matched_existing: FrameRecord | None = None
        for prev_int, prev_rec in seen_hashes:
            if (ph_int ^ prev_int).bit_count() <= global_dedup_threshold:
                matched_existing = prev_rec
                break

        timestamp = frame_idx / native_fps
        if matched_existing is not None:
            matched_existing.reappearances.append(round(timestamp, 2))
            last_kept_hash_int = ph_int
            frame_idx += 1
            continue

        feat, edge_density, mean_rgb = compute_visual_features(frame_bgr)
        dom_colors = extract_dominant_colors(frame_bgr, k=5)

        # Downscale stored image immediately to save memory
        h, w = frame_bgr.shape[:2]
        thumb_h = max(1, int(round(h * (480.0 / float(w)))))
        thumb_bgr = cv2.resize(frame_bgr, (480, thumb_h), interpolation=cv2.INTER_AREA)

        rec = FrameRecord(
            id=f"f_{len(unique_frames) + 1:04d}",
            frame_index=frame_idx,
            timestamp=round(timestamp, 2),
            timecode=format_timecode(timestamp),
            phash=ph,
            phash_hex=str(ph),
            feature_vec=feat,
            edge_density=round(edge_density, 4),
            mean_rgb=mean_rgb,
            dominant_colors=dom_colors,
            image_bgr=thumb_bgr,
        )
        unique_frames.append(rec)
        seen_hashes.append((ph_int, rec))
        last_kept_hash_int = ph_int

        frame_idx += 1

    cap.release()

    meta = {
        "native_fps": round(native_fps, 2),
        "total_frames": total_frames,
        "sampled_frames": sampled_count,
        "skipped_black_frames": skipped_black,
        "unique_frames": len(unique_frames),
        "duration": round(duration, 2),
        "width": width,
        "height": height,
        "sample_fps": sample_fps,
        "phash_threshold": phash_threshold,
    }
    return unique_frames, meta
