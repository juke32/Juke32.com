#!/usr/bin/env python3
"""
purge-old-images-history.py

Uses git-filter-repo to purge all image files (.jpg, .jpeg, .png, .webp, .bmp, .tiff)
from all historical commits prior to the current HEAD commit.
"""

import sys
import subprocess
import shutil

def main():
    if not shutil.which("git-filter-repo"):
        print("Error: git-filter-repo is required.")
        sys.exit(1)

    # Get current HEAD commit SHA
    res = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True)
    if res.returncode != 0:
        print("Error getting current HEAD commit.")
        sys.exit(1)
    
    current_head_sha = res.stdout.strip().encode("utf-8")
    print(f"Current HEAD commit: {current_head_sha.decode('utf-8')}")

    # Commit callback python snippet for git-filter-repo
    commit_code = f"""
current_head = b"{current_head_sha.decode('utf-8')}"
image_exts = [b'.jpg', b'.jpeg', b'.png', b'.webp', b'.tiff', b'.bmp']

# If commit is NOT the current HEAD commit, purge all image file entries from the commit
if commit.original_id != current_head:
    new_changes = []
    for change in commit.file_changes:
        filename_lower = change.filename.lower()
        if not any(filename_lower.endswith(ext) for ext in image_exts):
            new_changes.append(change)
    commit.file_changes = new_changes
"""

    print("Running git-filter-repo to purge all images from past commits...")
    cmd = [
        "git-filter-repo",
        "--force",
        "--commit-callback",
        commit_code
    ]

    res_run = subprocess.run(cmd)
    if res_run.returncode == 0:
        print("\nSuccessfully purged all image files from old historical commits!")
        # Restore remote origin
        subprocess.run(["git", "remote", "add", "origin", "https://github.com/juke32/Juke32.com.git"])
        print("Restored origin remote: https://github.com/juke32/Juke32.com.git")
    else:
        print("\ngit-filter-repo encountered an error.")
        sys.exit(res_run.returncode)

if __name__ == "__main__":
    main()
