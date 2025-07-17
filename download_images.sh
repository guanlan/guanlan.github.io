#!/bin/bash

# Read the jpg_link.txt file and download each image
while read -r line; do
    # Skip empty lines
    if [ -z "$line" ]; then
        continue
    fi
    
    # Extract URL and destination path
    url=$(echo "$line" | awk '{print $1}')
    dest=$(echo "$line" | awk '{print $3}')
    
    # Skip if URL is empty
    if [ -z "$url" ] || [ "$url" == "" ]; then
        continue
    fi
    
    # Create directory if it doesn't exist
    dest_dir=$(dirname "$dest")
    mkdir -p "$dest_dir"
    
    # Download the file
    echo "Downloading: $url -> $dest"
    curl -s -L -o "$dest" "$url"
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully downloaded: $dest"
    else
        echo "✗ Failed to download: $url"
    fi
done < jpg_link.txt

echo "Download complete!"
