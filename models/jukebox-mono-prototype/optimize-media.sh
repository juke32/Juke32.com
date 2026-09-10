#!/usr/bin/env bash
# ==============================================================================
# optimize-media.sh
#
# Strips ALL metadata (GPS, EXIF, camera, container tags), center-crops
# images and videos to a 1:1 square, and compresses hard for the smallest
# file size at a quality that still looks clean.
#
# Run in any folder:
#   ./optimize-media.sh
#   ./optimize-media.sh /path/to/media_folder
#   ./optimize-media.sh photo.jpg
# ==============================================================================

set -e

TARGET="${1:-.}"

# --- THE ONLY LINE YOU LIKELY NEED TO TOUCH ---
# 2400 is sharp on any screen, even retina, and far smaller than 4000.
# Only raise this if the images get zoomed in, printed, or downloaded full-size.
MAX_SIZE=2400
# ------------------------------------------------

JPG_QUALITY=78          # 75-80 is the sweet spot: small, no visible loss
WEBP_QUALITY=78
CRF_VIDEO=28             # Higher CRF = smaller file. 26-30 stays clean at "veryslow"

echo "======================================================================"
echo "      Media Metadata Stripper, 1:1 Squasher & Ultra Compressor        "
echo "======================================================================"
echo "Target Path: $TARGET"
echo "Max 1:1 Resolution: ${MAX_SIZE}x${MAX_SIZE} px"
echo "======================================================================"

HAS_EXIFTOOL=$(command -v exiftool || true)
HAS_FFMPEG=$(command -v ffmpeg || true)

if [ -n "$HAS_EXIFTOOL" ]; then
    echo "✓ Exiftool found: metadata stripping active."
else
    echo "• Exiftool missing: relying on Pillow/ffmpeg to strip metadata instead."
fi

if [ -n "$HAS_FFMPEG" ]; then
    echo "✓ FFmpeg found: video processing active."
else
    echo "• FFmpeg missing: videos will be skipped."
fi

echo "----------------------------------------------------------------------"

python3 -c "
import os, sys, shutil, subprocess
from pathlib import Path

target = Path('$TARGET')
max_size = $MAX_SIZE
quality = $JPG_QUALITY
webp_quality = $WEBP_QUALITY
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
                        # progressive + optimize squeeze extra size out at no quality cost
                        cropped.save(tmp_out, 'JPEG', quality=quality, optimize=True, progressive=True)
                    elif ext == '.webp':
                        # method=6 is the slowest, smallest WebP encode setting
                        cropped.save(tmp_out, 'WEBP', quality=webp_quality, method=6, lossless=False)
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
                    print(f'  • [IMAGE 1:1] {file_p.name}: already smaller as-is ({format_size(orig_s)})')
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
            # cpu-used 0 is the slowest, strongest VP9 setting for size
            cmd = ['ffmpeg', '-y', '-i', str(file_p), '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', str(crf), '-b:v', '0', '-cpu-used', '0', '-c:a', 'libopus', '-b:a', '96k', '-map_metadata', '-1', '-map_chapters', '-1', '-fflags', '+bitexact', str(tmp_out)]
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
                print(f'  • [VIDEO 1:1] {file_p.name}: original already smaller ({format_size(orig_s)})')
                orig_total += orig_s
                new_total += orig_s
            count += 1
        else:
            if tmp_out.exists(): tmp_out.unlink()
            print(f'  ✗ [VIDEO ERROR] {file_p.name}: ffmpeg failed')

print('======================================================================')
if orig_total > 0:
    saved = orig_total - new_total
    pct = (saved / orig_total) * 100
    print(f'DONE. Processed {count} files.')
    print(f'Total saved: {format_size(saved)} ({pct:.1f}% smaller)')
else:
    print('Finished scanning. Nothing to do.')
print('======================================================================')
"

if [ -n "$HAS_EXIFTOOL" ]; then
    echo "Running final deep metadata sweep (GPS, EXIF, camera data removal)..."
    exiftool -overwrite_original -recurse -all= -GPS:all= -exif:all= -xmp:all= -iptc:all= "$TARGET" 2>/dev/null || true
    echo "Metadata clean complete ✓"
fi
