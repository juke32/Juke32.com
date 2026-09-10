#!/usr/bin/env python3
"""
build-sitemap.py

Standalone sitemap generator. Scans for HTML files and generates sitemap.xml.
(build-html.py also generates a sitemap — this script exists as a standalone tool.)

Usage:
  python build-sitemap.py
"""

import os
import glob
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent if SCRIPT_DIR.name == "scripts" else SCRIPT_DIR

DOMAIN = "https://juke32.com"
OUTPUT = str(REPO_ROOT / "sitemap.xml")


def main():
    print(f"build-sitemap.py — generating {OUTPUT}\n")

    urls = []

    # Change working directory to REPO_ROOT for globbing
    orig_cwd = os.getcwd()
    os.chdir(REPO_ROOT)
    try:
        # Find all .html files
        for html_file in glob.glob("**/*.html", recursive=True):
            # Skip hidden dirs, templates, generated build artifacts we don't want
            if html_file.startswith(".") or "/_" in html_file:
                continue

            if html_file == "index.html":
                urls.append(f"{DOMAIN}/")
            else:
                urls.append(f"{DOMAIN}/{html_file}")
    finally:
        os.chdir(orig_cwd)

    urls.sort()

    # Write sitemap
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for url in urls:
            f.write(f"   <url>\n")
            f.write(f"      <loc>{url}</loc>\n")
            f.write(f"   </url>\n")
        f.write("</urlset>\n")

    print(f"  ✓ {OUTPUT} ({len(urls)} URLs)")
    for url in urls:
        print(f"    {url}")


if __name__ == "__main__":
    main()
