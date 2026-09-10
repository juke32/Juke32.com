#!/usr/bin/env python3
"""
optimize-media.py

Strips metadata, crops/squashes images & videos to 1:1 square aspect ratio (up to max 4000x4000),
and applies ultra-high efficiency compression (JPEG/PNG/WebP/MP4/WebM) to achieve maximum size reduction
with minimal perceptual quality loss.

Requirements:
  - Python 3 with Pillow (PIL)
  - ffmpeg (for video processing)
  - exiftool (optional, for extra metadata stripping)

Usage:
  python3 optimize-media.py path/to/file_or_dir [options]

Examples:
  python3 optimize-media.py models/
  python3 optimize-media.py photo.jpg --max-size 4000 --quality 80
  python3 optimize-media.py video.mp4 --convert-webp
"""

import os
import sys
import argparse
import subprocess
import shutil
from pathlib import Path
from PIL import Image, ImageOps

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"}

def check_dependencies():
    """Verify required CLI tools."""
    ffmpeg_available = shutil.which("ffmpeg") is not None
    exiftool_available = shutil.which("exiftool") is not None
    return ffmpeg_available, exiftool_available

def format_size(bytes_size):
    """Format bytes into readable string."""
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.1f} KB"
    else:
        return f"{bytes_size / (1024 * 1024):.2f} MB"

def squash_crop_image(img, max_size=4000):
    """Center-crop image to 1:1 square and downscale if dimensions exceed max_size."""
    width, height = img.size
    side = min(width, height)

    # Center crop to 1:1 square
    left = (width - side) // 2
    top = (height - side) // 2
    right = left + side
    bottom = top + side

    img_cropped = img.crop((left, top, right, bottom))

    # Resize if larger than max_size
    if side > max_size:
        img_cropped = img_cropped.resize((max_size, max_size), Image.Resampling.LANCZOS)

    return img_cropped

def process_image(file_path, max_size=4000, quality=80, convert_webp=False, exiftool_available=False):
    """Strip metadata, center-crop to 1:1 square, and ultra-compress an image file."""
    src_path = Path(file_path)
    orig_size = src_path.stat().st_size

    try:
        with Image.open(src_path) as img:
            # Fix EXIF orientation before stripping
            img = ImageOps.exif_transpose(img)
            
            # Convert RGBA/P to RGB if JPEG output
            dest_ext = ".webp" if convert_webp else src_path.suffix.lower()
            if dest_ext in [".jpg", ".jpeg"] and img.mode in ("RGBA", "P", "LA"):
                img = img.convert("RGB")

            # Crop to 1:1 square
            squared_img = squash_crop_image(img, max_size=max_size)

            # Temp output file
            tmp_out = src_path.with_name(f"{src_path.stem}_tmp_opt{dest_ext}")

            # Compression settings based on format
            if dest_ext == ".webp":
                squared_img.save(
                    tmp_out,
                    "WEBP",
                    quality=quality,
                    method=6,  # Highest compression effort
                    exact=False,
                    lossless=False
                )
            elif dest_ext in [".jpg", ".jpeg"]:
                squared_img.save(
                    tmp_out,
                    "JPEG",
                    quality=quality,
                    optimize=True,
                    progressive=True
                )
            elif dest_ext == ".png":
                squared_img.save(
                    tmp_out,
                    "PNG",
                    optimize=True,
                    compress_level=9
                )
            else:
                squared_img.save(tmp_out, quality=quality, optimize=True)

        # Extra metadata stripping with exiftool if installed
        if exiftool_available:
            subprocess.run(
                ["exiftool", "-overwrite_original", "-all=", str(tmp_out)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

        new_size = tmp_out.stat().st_size

        # Replace target file if output is smaller or format changed
        final_dest = src_path.with_suffix(dest_ext) if convert_webp else src_path
        if new_size < orig_size or convert_webp:
            if final_dest != src_path and src_path.exists():
                src_path.unlink()
            shutil.move(tmp_out, final_dest)
            saved = orig_size - new_size
            pct = (saved / orig_size) * 100 if orig_size > 0 else 0
            print(f"  ✓ [IMAGE 1:1] {src_path.name} -> {final_dest.name}: {format_size(orig_size)} => {format_size(new_size)} (Saved {pct:.1f}%)")
            return orig_size, new_size
        else:
            if tmp_out.exists():
                tmp_out.unlink()
            print(f"  • [IMAGE 1:1] {src_path.name}: Already optimal ({format_size(orig_size)})")
            return orig_size, orig_size

    except Exception as e:
        print(f"  ✗ [IMAGE ERROR] Failed to process {src_path.name}: {e}")
        return orig_size, orig_size

def process_video(file_path, max_size=4000, crf=26, convert_webm=False):
    """Strip metadata, center-crop to 1:1 square, and ultra-compress a video file using ffmpeg."""
    src_path = Path(file_path)
    orig_size = src_path.stat().st_size

    dest_ext = ".webm" if convert_webm else src_path.suffix.lower()
    tmp_out = src_path.with_name(f"{src_path.stem}_tmp_opt{dest_ext}")

    # FFmpeg 1:1 center-crop filter: crop='min(iw,ih)':'min(iw,ih)', scale down to max_size if larger
    vf_filter = f"crop='min(iw,ih)':'min(iw,ih)',scale='min(iw,{max_size})':'min(ih,{max_size})':force_original_aspect_ratio=decrease"

    if dest_ext == ".webm":
        # VP9 ultra-compression setting
        cmd = [
            "ffmpeg", "-y", "-i", str(src_path),
            "-vf", vf_filter,
            "-c:v", "libvpx-vp9",
            "-crf", str(crf),
            "-b:v", "0",
            "-deadline", "good",
            "-cpu-used", "2",
            "-c:a", "libopus",
            "-b:a", "96k",
            "-map_metadata", "-1",
            "-map_chapters", "-1",
            "-fflags", "+bitexact",
            str(tmp_out)
        ]
    else:
        # H.264 veryslow ultra-compression setting
        cmd = [
            "ffmpeg", "-y", "-i", str(src_path),
            "-vf", vf_filter,
            "-c:v", "libx264",
            "-preset", "veryslow",
            "-crf", str(crf),
            "-c:a", "aac",
            "-b:a", "96k",
            "-movflags", "+faststart",
            "-map_metadata", "-1",
            "-map_chapters", "-1",
            "-fflags", "+bitexact",
            str(tmp_out)
        ]

    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if proc.returncode != 0 or not tmp_out.exists():
            print(f"  ✗ [VIDEO ERROR] FFmpeg encoding failed for {src_path.name}: {proc.stderr[-200:]}")
            if tmp_out.exists():
                tmp_out.unlink()
            return orig_size, orig_size

        new_size = tmp_out.stat().st_size
        final_dest = src_path.with_suffix(dest_ext) if convert_webm else src_path

        if new_size < orig_size or convert_webm:
            if final_dest != src_path and src_path.exists():
                src_path.unlink()
            shutil.move(tmp_out, final_dest)
            saved = orig_size - new_size
            pct = (saved / orig_size) * 100 if orig_size > 0 else 0
            print(f"  ✓ [VIDEO 1:1] {src_path.name} -> {final_dest.name}: {format_size(orig_size)} => {format_size(new_size)} (Saved {pct:.1f}%)")
            return orig_size, new_size
        else:
            if tmp_out.exists():
                tmp_out.unlink()
            print(f"  • [VIDEO 1:1] {src_path.name}: Original smaller ({format_size(orig_size)})")
            return orig_size, orig_size

    except Exception as e:
        print(f"  ✗ [VIDEO ERROR] Failed {src_path.name}: {e}")
        return orig_size, orig_size

def main():
    parser = argparse.ArgumentParser(description="Strip metadata, crop to 1:1 square (up to 4000x4000), and ultra-compress images & videos.")
    parser.add_argument("target", nargs="?", default="models", help="Path to image, video, or directory to compress (default: models/)")
    parser.add_argument("--max-size", type=int, default=4000, help="Maximum 1:1 square dimension in pixels (default: 4000)")
    parser.add_argument("--quality", type=int, default=80, help="Image compression quality 1-100 (default: 80)")
    parser.add_argument("--crf", type=int, default=26, help="Video CRF quality factor 0-51 (default: 26 for ultra compression)")
    parser.add_argument("--convert-webp", action="store_true", help="Convert images to WebP format")
    parser.add_argument("--convert-webm", action="store_true", help="Convert videos to WebM format")

    args = parser.parse_args()

    ffmpeg_available, exiftool_available = check_dependencies()
    print("=" * 60)
    print("Media Optimizer & 1:1 Squasher")
    print("=" * 60)
    print(f"  FFmpeg:   {'Available ✓' if ffmpeg_available else 'Missing ✗ (videos skipped)'}")
    print(f"  Exiftool: {'Available ✓' if exiftool_available else 'Not installed (Pillow metadata strip active)'}")
    print(f"  Max Size: {args.max_size}x{args.max_size} px (1:1 Square Crop)")
    print(f"  Quality:  {args.quality} (Images) | CRF: {args.crf} (Videos)")
    print("-" * 60)

    target_path = Path(args.target)
    if not target_path.exists():
        print(f"Error: Target path '{args.target}' does not exist.")
        sys.exit(1)

    files_to_process = []
    if target_path.is_file():
        files_to_process.append(target_path)
    else:
        for root, _, files in os.walk(target_path):
            for file in files:
                files_to_process.append(Path(root) / file)

    total_orig = 0
    total_new = 0
    processed_count = 0

    for file_p in files_to_process:
        ext = file_p.suffix.lower()
        if ext in IMAGE_EXTS:
            orig, new = process_image(
                file_p,
                max_size=args.max_size,
                quality=args.quality,
                convert_webp=args.convert_webp,
                exiftool_available=exiftool_available
            )
            total_orig += orig
            total_new += new
            processed_count += 1
        elif ext in VIDEO_EXTS:
            if not ffmpeg_available:
                print(f"  • [SKIP VIDEO] {file_p.name} (FFmpeg not installed)")
                continue
            orig, new = process_video(
                file_p,
                max_size=args.max_size,
                crf=args.crf,
                convert_webm=args.convert_webm
            )
            total_orig += orig
            total_new += new
            processed_count += 1

    print("=" * 60)
    if total_orig > 0:
        total_saved = total_orig - total_new
        total_pct = (total_saved / total_orig) * 100
        print(f"COMPLETE! Processed {processed_count} files.")
        print(f"Total Original:   {format_size(total_orig)}")
        print(f"Total Compressed: {format_size(total_new)}")
        print(f"Total Saved:      {format_size(total_saved)} ({total_pct:.1f}% reduction)")
    else:
        print("No image or video files found to process.")
    print("=" * 60)

if __name__ == "__main__":
    main()
