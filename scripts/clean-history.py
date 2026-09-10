#!/usr/bin/env python3
"""
clean-history.py

Uses git-filter-repo to scan every commit blob in the Git repository history.
Identifies image data (JPEG, PNG, WebP) by file magic bytes and strips all EXIF,
GPS, camera, location, and device metadata across all past Git commits.
"""

import sys
import subprocess
import shutil
import os
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR

def main():
    os.chdir(REPO_ROOT)
    if not shutil.which("git-filter-repo"):
        print("Error: git-filter-repo is required.")
        sys.exit(1)

    # Magic-byte detection blob callback code for git-filter-repo
    blob_code = """
import io
from PIL import Image, ImageOps

d = blob.data
if d:
    is_jpeg = d.startswith(b'\\xff\\xd8')
    is_png = d.startswith(b'\\x89PNG')
    is_webp = len(d) > 12 and d[:4] == b'RIFF' and d[8:12] == b'WEBP'

    if is_jpeg or is_png or is_webp:
        try:
            with Image.open(io.BytesIO(d)) as img:
                try:
                    img = ImageOps.exif_transpose(img)
                except Exception:
                    pass

                out_buf = io.BytesIO()
                fmt = img.format if img.format else ('JPEG' if is_jpeg else ('PNG' if is_png else 'WEBP'))

                if fmt.upper() in ['JPEG', 'JPG']:
                    if img.mode in ('RGBA', 'P', 'LA'):
                        img = img.convert('RGB')
                    img.save(out_buf, format='JPEG', quality=85, optimize=True)
                elif fmt.upper() == 'PNG':
                    img.save(out_buf, format='PNG', optimize=True)
                elif fmt.upper() == 'WEBP':
                    img.save(out_buf, format='WEBP', quality=85, method=6)
                else:
                    img.save(out_buf, format=fmt)

                blob.data = out_buf.getvalue()
        except Exception:
            pass
"""

    print("Running git-filter-repo to clean EXIF/GPS metadata across all historical commits...")
    cmd = [
        "git-filter-repo",
        "--force",
        "--blob-callback",
        blob_code
    ]

    res = subprocess.run(cmd)
    if res.returncode == 0:
        print("\nSuccessfully cleaned EXIF/GPS metadata from all images across Git history!")
        # Restore remote origin
        subprocess.run(["git", "remote", "add", "origin", "https://github.com/juke32/Juke32.com.git"])
        print("Restored origin remote: https://github.com/juke32/Juke32.com.git")
    else:
        print("\ngit-filter-repo encountered an error.")
        sys.exit(res.returncode)

if __name__ == "__main__":
    main()
