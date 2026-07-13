#!/bin/bash

DOMAIN="https://juke32.com"
FILE="sitemap.xml"

echo '<?xml version="1.0" encoding="UTF-8"?>' > "$FILE"
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> "$FILE"

for html_file in *.html; do
  # Skip if no html files match
  [ -e "$html_file" ] || continue
  
  if [ "$html_file" = "index.html" ]; then
    echo "   <url>" >> "$FILE"
    echo "      <loc>${DOMAIN}/</loc>" >> "$FILE"
    echo "   </url>" >> "$FILE"
  else
    echo "   <url>" >> "$FILE"
    echo "      <loc>${DOMAIN}/${html_file}</loc>" >> "$FILE"
    echo "   </url>" >> "$FILE"
  fi
done

echo "</urlset>" >> "$FILE"

echo "Successfully updated $FILE"
