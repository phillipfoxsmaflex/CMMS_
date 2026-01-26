# 📚 MMS Documentation System

This directory contains the documentation generation system that automatically converts Markdown files to HTML and provides a popup interface within the MMS application.

## 🗂️ Features

- **Automatic Conversion**: Converts all `.md` files in `/docs` to a single HTML documentation page
- **Auto-Update**: Watches for file changes and regenerates documentation automatically
- **Popup Integration**: Opens documentation in a modal popup within the application
- **Navigation**: Automatic sidebar navigation based on directory structure
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Files

- `generate_docs_simple_final.py`: Main documentation generator script
- `watch_docs.py`: File watcher for auto-updating documentation
- `start_watcher.sh`: Shell script to start the watcher
- `README.md`: This file

## 🚀 Usage

### Generate Documentation Manually

```bash
python3 /root/CMMS/docs/generator/generate_docs_simple_final.py
```

### Start Auto-Update Watcher

```bash
# Start the watcher in the background
bash /root/CMMS/docs/generator/start_watcher.sh

# Or run directly
python3 /root/CMMS/docs/generator/watch_docs.py
```

### Access Documentation in App

1. Click the "Documentation" button in the sidebar navigation
2. The documentation will open in a popup window
3. Navigate using the sidebar on the left
4. Click the close button (X) to return to the app

## 🔧 Technical Details

### Output Location

Generated documentation is stored at:
```
/root/CMMS/frontend/public/docs/index.html
```

### Markdown Support

The system supports basic Markdown syntax:

- Headers: `#`, `##`, `###`, `####`
- Bold: `**text**` or `__text__`
- Italic: `*text*` or `_text_`
- Links: `[text](url)`
- Images: `![alt](url)`
- Lists: `*`, `+`, `-` for unordered; `1.` for ordered
- Blockquotes: `> text`
- Horizontal rules: `---` or `***`
- Code: `` `code` `` for inline, ``` ``` for blocks

### Navigation Structure

The sidebar navigation is automatically generated based on:

1. **Top-level files**: Appear under "General" section
2. **Subdirectory files**: Grouped by their parent directory name

Example structure:
```
docs/
├── DOKUMENTATIONSINDEX.md      # Main index (excluded from nav)
├── BENUTZERHANDBUCH.md         # General > Benutzerhandbuch
├── admin-guide/
│   ├── Backup.md              # Admin Guide > Backup
│   └── Factory_Reset.md       # Admin Guide > Factory Reset
└── user-guide/
    ├── DATENBANK_STRUKTUR.md   # User Guide > Datenbank Struktur
    └── QUICK_START_DOCUMENTS.md # User Guide > Quick Start Documents
```

## 🔄 Auto-Update Mechanism

The watcher monitors the `/root/CMMS/docs` directory for:

- **File modifications**: Triggers regeneration when any `.md` file is changed
- **New files**: Automatically includes newly added `.md` files
- **Deleted files**: Removes deleted files from the documentation

The watcher has a 2-second cooldown to prevent rapid regeneration during bulk edits.

## 🎯 Integration with MMS

### Frontend Components

- **DocumentationPopup**: `/frontend/src/components/DocumentationPopup/index.tsx`
- **DocumentationMenuItem**: `/frontend/src/layouts/ExtendedSidebarLayout/Sidebar/SidebarMenu/DocumentationMenuItem.tsx`
- **Modified SidebarMenu**: `/frontend/src/layouts/ExtendedSidebarLayout/Sidebar/SidebarMenu/index.tsx`

### How It Works

1. User clicks "Documentation" in sidebar
2. `DocumentationMenuItem` triggers `handleDocsClick()`
3. `SidebarMenu` sets `docsOpen` state to `true`
4. `DocumentationPopup` component renders with iframe
5. Iframe loads `/docs/index.html` (generated documentation)
6. User can navigate documentation and close popup

## 📋 Development Notes

### Adding New Documentation

1. Create a new `.md` file in the appropriate directory
2. The system automatically:
   - Detects the new file
   - Regenerates the HTML documentation
   - Updates the navigation sidebar
   - Makes it available in the popup

### Updating Existing Documentation

1. Edit any `.md` file
2. The watcher detects changes and regenerates documentation
3. Changes are immediately available in the popup (refresh may be needed)

### Troubleshooting

**Issue**: Documentation not updating
- **Solution**: Check if watcher is running: `ps aux | grep watch_docs.py`
- **Solution**: Run generator manually: `python3 generate_docs_simple_final.py`

**Issue**: Popup not opening
- **Solution**: Check browser console for errors
- **Solution**: Verify `/docs/index.html` exists and is accessible

**Issue**: Navigation not showing new files
- **Solution**: Check file naming (should end with `.md`)
- **Solution**: Verify file is in correct directory structure

## 🎨 Customization

### Styling

Edit the CSS in `generate_docs_simple_final.py` to customize:
- Colors
- Fonts
- Layout
- Responsive behavior

### Behavior

Modify `watch_docs.py` to adjust:
- Watcher cooldown time
- Directories to monitor
- File extensions to watch

## 🔒 Dependencies

- Python 3.x
- Standard library modules: `os`, `re`, `datetime`
- No external dependencies required

## 📝 License

This documentation system is part of the MMS project and follows the same licensing terms.