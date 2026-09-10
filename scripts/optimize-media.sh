#!/usr/bin/env bash
# ==============================================================================
# optimize-media.sh
# 
# Standalone bash script to:
#  1. Strip ALL GPS, location, EXIF, camera, and container metadata.
#  2. Center-crop images & videos to a 1:1 square aspect ratio (max 4000x4000).
#  3. Apply ultra-high efficiency compression for smallest file sizes.
#
# Can be copied & run in ANY folder:
#   ./optimize-media.sh
#   ./optimize-media.sh /path/to/media_folder
#   ./optimize-media.sh photo.jpg
# ==============================================================================

set -e

TARGET="${1:-.}"
MAX_SIZE=4000
JPG_QUALITY=80
CRF_VIDEO=26

echo "======================================================================"
echo "      Media Metadata Stripper, 1:1 Squasher & Ultra Compressor        "
echo "======================================================================"
echo "Target Path: $TARGET"
echo "Max 1:1 Resolution: ${MAX_SIZE}x${MAX_SIZE} px"
echo "======================================================================"

# Check available tools
HAS_EXIFTOOL=$(command -v exiftool || true)
HAS_FFMPEG=$(command -v ffmpeg || true)
HAS_PYTHON=$(command -v python3 || true)

if [ -n "$HAS_EXIFTOOL" ]; then
    echo "✓ Exiftool detected: Metadata stripping active."
else
    echo "• Exiftool not found: Falling back to ffmpeg/python for metadata removal."
fi

if [ -n "$HAS_FFMPEG" ]; then
    echo "✓ FFmpeg detected: Video & Image 1:1 processing active."
else
    echo "• FFmpeg not found: Video processing will be skipped."
fi

echo "----------------------------------------------------------------------"

# Use python helper if python3 + PIL is available
python3 -c "
import os, sys, shutil, subprocess
from pathlib import Path

target = Path('$TARGET')
max_size = $MAX_SIZE
quality = $JPG_QUALITY
crf = $CRF_VIDEO

has_exiftool = '$HAS_EXIFTOOL' != ''
has_ffmpeg = '$HAS_FFMPEG' != ''

image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'}
video_exts = {'.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'}

def format_size(b):
    if b < 1024: return f'{b} B'
    if b < 1024*1024: return f'{b/1024:.1f} KB'
    return f'{b/(1024*1024):.2f} MB'

try:
    from PIL import Image, ImageOps
    has_pil = True
except ImportError:
    has_pil = False

files = []
if target.is_file():
    files.append(target)
elif target.is_dir():
    for root, _, filenames in os.walk(target):
        for f in filenames:
            files.append(Path(root) / f)

orig_total = 0
new_total = 0
count = 0

for file_p in files:
    ext = file_p.suffix.lower()
    if ext in image_exts:
        orig_s = file_p.stat().st_size
        tmp_out = file_p.with_name(f'{file_p.stem}_tmp_opt{ext}')

        try:
            if has_pil:
                with Image.open(file_p) as img:
                    img = ImageOps.exif_transpose(img)
                    w, h = img.size
                    side = min(w, h)
                    left = (w - side) // 2
                    top = (h - side) // 2
                    cropped = img.crop((left, top, left + side, top + side))

                    if side > max_size:
                        cropped = cropped.resize((max_size, max_size), Image.Resampling.LANCZOS)

                    if ext in ['.jpg', '.jpeg']:
                        if cropped.mode in ('RGBA', 'P', 'LA'):
                            cropped = cropped.convert('RGB')
                        cropped.save(tmp_out, 'JPEG', quality=quality, optimize=True, progressive=True)
                    elif ext == '.webp':
                        cropped.save(tmp_out, 'WEBP', quality=quality, method=6, lossless=False)
                    elif ext == '.png':
                        cropped.save(tmp_out, 'PNG', optimize=True, compress_level=9)
                    else:
                        cropped.save(tmp_out, quality=quality)

                if has_exiftool:
                    subprocess.run(['exiftool', '-overwrite_original', '-all=', '-GPS:all=', str(tmp_out)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

                new_s = tmp_out.stat().st_size
                if new_s < orig_s:
                    shutil.move(tmp_out, file_p)
                    pct = ((orig_s - new_s) / orig_s) * 100
                    print(f'  ✓ [IMAGE 1:1] {file_p.name}: {format_size(orig_s)} => {format_size(new_s)} (-{pct:.1f}%)')
                    orig_total += orig_s
                    new_total += new_s
                else:
                    if tmp_out.exists(): tmp_out.unlink()
                    print(f'  • [IMAGE 1:1] {file_p.name}: Already optimized ({format_size(orig_s)})')
                    orig_total += orig_s
                    new_total += orig_s
                count += 1

        except Exception as e:
            if tmp_out.exists(): tmp_out.unlink()
            print(f'  ✗ [ERROR] {file_p.name}: {e}')

    elif ext in video_exts and has_ffmpeg:
        orig_s = file_p.stat().st_size
        tmp_out = file_p.with_name(f'{file_p.stem}_tmp_opt{ext}')
        vf = f\"crop='min(iw,ih)':'min(iw,ih)',scale='min(iw,{max_size})':'min(ih,{max_size})':force_original_aspect_ratio=decrease\"

        if ext == '.webm':
            cmd = ['ffmpeg', '-y', '-i', str(file_p), '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', str(crf), '-b:v', '0', '-cpu-used', '2', '-c:a', 'libopus', '-b:a', '96k', '-map_metadata', '-1', '-map_chapters', '-1', '-fflags', '+bitexact', str(tmp_out)]
        else:
            cmd = ['ffmpeg', '-y', '-i', str(file_p), '-vf', vf, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', str(crf), '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', '-map_metadata', '-1', '-map_chapters', '-1', '-fflags', '+bitexact', str(tmp_out)]

        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and tmp_out.exists():
            new_s = tmp_out.stat().st_size
            if new_s < orig_s:
                shutil.move(tmp_out, file_p)
                pct = ((orig_s - new_s) / orig_s) * 100
                print(f'  ✓ [VIDEO 1:1] {file_p.name}: {format_size(orig_s)} => {format_size(new_s)} (-{pct:.1f}%)')
                orig_total += orig_s
                new_total += new_s
            else:
                if tmp_out.exists(): tmp_out.unlink()
                print(f'  • [VIDEO 1:1] {file_p.name}: Original smaller ({format_size(orig_s)})')
                orig_total += orig_s
                new_total += orig_s
            count += 1
        else:
            if tmp_out.exists(): tmp_out.unlink()
            print(f'  ✗ [VIDEO ERROR] {file_p.name}: FFmpeg failed')

print('======================================================================')
if orig_total > 0:
    saved = orig_total - new_total
    pct = (saved / orig_total) * 100
    print(f'COMPLETE! Processed {count} media files.')
    print(f'Total Saved: {format_size(saved)} ({pct:.1f}% reduction)')
else:
    print('Finished scanning.')
print('======================================================================')
"

# Final extra metadata sweep with exiftool if installed
if [ -n "$HAS_EXIFTOOL" ]; then
    echo "Running final deep metadata sweep (GPS, EXIF, Camera data removal)..."
    exiftool -overwrite_original -recurse -all= -GPS:all= -exif:all= -xmp:all= -iptc:all= "$TARGET" 2>/dev/null || true
    echo "Metadata clean complete ✓"
fi
