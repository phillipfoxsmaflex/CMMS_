#!/bin/bash

echo "🚀 Starting documentation watcher..."
echo "📁 Watching directory: /root/CMMS/docs"
echo "🔄 Auto-regenerating documentation on file changes..."
echo "🛑 Press Ctrl+C to stop the watcher"
echo ""

# Run the watcher in the background
python3 /root/CMMS/docs/generator/watch_docs.py