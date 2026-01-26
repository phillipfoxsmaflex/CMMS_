#!/usr/bin/env python3

import os
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class DocChangeHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_run = 0
        self.cooldown = 2  # seconds
    
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            current_time = time.time()
            if current_time - self.last_run > self.cooldown:
                print(f"📝 Detected change in: {event.src_path}")
                self.regenerate_docs()
                self.last_run = current_time
    
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            current_time = time.time()
            if current_time - self.last_run > self.cooldown:
                print(f"🆕 New file detected: {event.src_path}")
                self.regenerate_docs()
                self.last_run = current_time
    
    def on_deleted(self, event):
        if not event.is_directory and event.src_path.endswith('.md'):
            current_time = time.time()
            if current_time - self.last_run > self.cooldown:
                print(f"🗑️ File deleted: {event.src_path}")
                self.regenerate_docs()
                self.last_run = current_time
    
    def regenerate_docs(self):
        print("🔄 Regenerating documentation...")
        try:
            result = subprocess.run(['python3', '/root/CMMS/docs/generator/generate_docs_simple_final.py'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Documentation regenerated successfully")
            else:
                print(f"❌ Error regenerating documentation: {result.stderr}")
        except Exception as e:
            print(f"❌ Exception during regeneration: {e}")

def main():
    docs_dir = '/root/CMMS/docs'
    
    print("👀 Watching documentation directory for changes...")
    print(f"📁 Watching: {docs_dir}")
    print("🚀 Press Ctrl+C to stop")
    
    event_handler = DocChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, docs_dir, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n🛑 Watcher stopped")
    
    observer.join()

if __name__ == '__main__':
    main()