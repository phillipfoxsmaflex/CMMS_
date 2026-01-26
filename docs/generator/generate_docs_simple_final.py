#!/usr/bin/env python3

import os
import re
from datetime import datetime

def get_doc_files(root_dir):
    """Recursively find all .md files in the documentation directory"""
    doc_files = []
    
    for root, dirs, files in os.walk(root_dir):
        # Skip the generator directory itself
        if 'generator' in root:
            continue
            
        for file in files:
            if file.endswith('.md'):
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, root_dir)
                doc_files.append({
                    'path': full_path,
                    'relative_path': relative_path,
                    'title': os.path.splitext(file)[0].replace('_', ' ').title()
                })
    
    return sorted(doc_files, key=lambda x: x['relative_path'])

def basic_markdown_to_html(markdown_text):
    """Basic markdown to HTML conversion"""
    # Convert headers
    html = re.sub(r'^#\s+(.*$)', r'<h1>\1</h1>', markdown_text, flags=re.MULTILINE)
    html = re.sub(r'^##\s+(.*$)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^###\s+(.*$)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^####\s+(.*$)', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Convert bold and italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = re.sub(r'_(.*?)_', r'<em>\1</em>', html)
    
    # Convert links
    html = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', html)
    
    # Convert images
    html = re.sub(r'!\[(.*?)\]\((.*?)\)', r'<img src="\2" alt="\1">', html)
    
    # Convert unordered lists
    html = re.sub(r'^\*\s+(.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^\+\s+(.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^-\s+(.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)
    
    # Convert ordered lists
    html = re.sub(r'^\d+\.\s+(.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*</li>)', r'<ol>\1</ol>', html, flags=re.DOTALL)
    
    # Convert blockquotes
    html = re.sub(r'^>\s+(.*$)', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)
    
    # Convert horizontal rules
    html = re.sub(r'^---$', r'<hr>', html, flags=re.MULTILINE)
    html = re.sub(r'^\*\*\*$', r'<hr>', html, flags=re.MULTILINE)
    
    # Convert inline code
    html = re.sub(r'`(.*?)`', r'<code>\1</code>', html)
    
    # Convert paragraphs (text not in other tags)
    html = re.sub(r'^([^<].*[^>])$', r'<p>\1</p>', html, flags=re.MULTILINE)
    
    # Fix multiple newlines
    html = re.sub(r'\n{2,}', r'</p><p>', html)
    
    return html

def parse_markdown_file(file_path):
    """Parse a markdown file and extract content and metadata with basic markdown support"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Basic markdown to HTML conversion
    html_content = basic_markdown_to_html(content)
    
    return {
        'html': html_content,
        'raw': content
    }

def generate_navigation(doc_files, base_path):
    """Generate navigation structure from documentation files"""
    nav = []
    
    for doc in doc_files:
        # Skip the main index file
        if doc['relative_path'] == 'DOKUMENTATIONSINDEX.md':
            continue
            
        # Determine the section based on directory structure
        parts = doc['relative_path'].split(os.sep)
        
        if len(parts) == 1:
            # Top-level document
            section = 'General'
        else:
            # Subdirectory document
            section = parts[0].replace('-', ' ').title()
        
        # Create navigation entry
        nav_entry = {
            'title': doc['title'],
            'path': doc['relative_path'],
            'section': section
        }
        
        nav.append(nav_entry)
    
    # Group by section
    nav_by_section = {}
    for entry in nav:
        if entry['section'] not in nav_by_section:
            nav_by_section[entry['section']] = []
        nav_by_section[entry['section']].append(entry)
    
    return nav_by_section

def generate_html_template(nav_by_section, docs_content, index_content):
    """Generate the complete HTML template for documentation"""
    
    # Generate navigation HTML
    nav_html = ''
    for section, items in nav_by_section.items():
        nav_html += '<div class="nav-section">'
        nav_html += f'<h3 class="nav-section-title">{section}</h3>'
        nav_html += '<ul class="nav-list">'
        
        for item in items:
            file_path = item['path']
            nav_html += f'<li class="nav-item"><a href="#" data-doc="{file_path}" class="nav-link">{item["title"]}</a></li>'
        
        nav_html += '</ul></div>'
    
    # Generate content HTML
    content_html = ''
    for file_path, content in docs_content.items():
        content_html += f'<div id="doc-{file_path}" class="doc-content" style="display:none;">'
        content_html += content['html']
        content_html += '</div>'
    
    # Generate index content
    index_html = f'<div id="doc-index" class="doc-content">'
    index_html += index_content['html']
    index_html += '</div>'
    
    # Combine everything into a complete HTML template
    html_template = f'''<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MMS Dokumentation</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }}
        
        .docs-container {{
            display: flex;
            height: 100vh;
            overflow: hidden;
        }}
        
        .docs-sidebar {{
            width: 300px;
            background-color: #2c3e50;
            color: white;
            overflow-y: auto;
            padding: 20px;
            border-right: 1px solid #ddd;
        }}
        
        .nav-section {{
            margin-bottom: 30px;
        }}
        
        .nav-section-title {{
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            color: #ecf0f1;
        }}
        
        .nav-list {{
            list-style: none;
        }}
        
        .nav-item {{
            margin-bottom: 8px;
        }}
        
        .nav-link {{
            color: #bdc3c7;
            text-decoration: none;
            display: block;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.2s;
        }}
        
        .nav-link:hover {{
            background-color: rgba(255,255,255,0.1);
            color: white;
        }}
        
        .nav-link.active {{
            background-color: #3498db;
            color: white;
            font-weight: 500;
        }}
        
        .docs-main {{
            flex: 1;
            overflow-y: auto;
            padding: 30px;
            background-color: white;
        }}
        
        .doc-header {{
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }}
        
        .doc-header h1 {{
            font-size: 28px;
            color: #2c3e50;
            margin-bottom: 10px;
        }}
        
        .doc-header .last-updated {{
            font-size: 14px;
            color: #7f8c8d;
        }}
        
        .doc-content {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        .doc-content h1 {{
            font-size: 24px;
            margin: 24px 0 16px 0;
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }}
        
        .doc-content h2 {{
            font-size: 20px;
            margin: 22px 0 14px 0;
            color: #34495e;
        }}
        
        .doc-content h3 {{
            font-size: 18px;
            margin: 20px 0 12px 0;
            color: #34495e;
        }}
        
        .doc-content p {{
            margin-bottom: 16px;
            line-height: 1.6;
        }}
        
        .doc-content ul, .doc-content ol {{
            margin-bottom: 16px;
            padding-left: 24px;
        }}
        
        .doc-content li {{
            margin-bottom: 8px;
        }}
        
        .doc-content table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }}
        
        .doc-content th, .doc-content td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        
        .doc-content th {{
            background-color: #f8f9fa;
            font-weight: 600;
        }}
        
        .doc-content pre {{
            background-color: #f8f9fa;
            padding: 16px;
            border-radius: 4px;
            overflow-x: auto;
            margin-bottom: 20px;
        }}
        
        .doc-content code {{
            font-family: 'Courier New', Courier, monospace;
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
        }}
        
        .doc-content pre code {{
            background-color: transparent;
            padding: 0;
        }}
        
        .doc-content blockquote {{
            border-left: 4px solid #3498db;
            padding-left: 16px;
            margin-left: 0;
            color: #555;
            font-style: italic;
            margin-bottom: 16px;
        }}
        
        .doc-content a {{
            color: #3498db;
            text-decoration: none;
        }}
        
        .doc-content a:hover {{
            text-decoration: underline;
        }}
        
        .loading {{
            text-align: center;
            padding: 40px;
            color: #7f8c8d;
        }}
        
        @media (max-width: 768px) {{
            .docs-container {{
                flex-direction: column;
            }}
            
            .docs-sidebar {{
                width: 100%;
                height: auto;
            }}
            
            .docs-main {{
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="docs-container">
        <div class="docs-sidebar">
            <div class="doc-header">
                <h1>📚 MMS Dokumentation</h1>
                <p class="last-updated">Aktualisiert: {datetime.now().strftime("%d.%m.%Y %H:%M")}</p>
            </div>
            {nav_html}
        </div>
        <div class="docs-main">
            {index_html}
            {content_html}
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            const navLinks = document.querySelectorAll('.nav-link');
            const docContents = document.querySelectorAll('.doc-content');
            
            // Show index by default
            document.getElementById('doc-index').style.display = 'block';
            
            // Add click handlers to navigation links
            navLinks.forEach(link => {{
                link.addEventListener('click', function(e) {{
                    e.preventDefault();
                    
                    const docPath = this.getAttribute('data-doc');
                    
                    // Hide all content
                    docContents.forEach(content => {{
                        content.style.display = 'none';
                    }});
                    
                    // Remove active class from all links
                    navLinks.forEach(navLink => {{
                        navLink.classList.remove('active');
                    }});
                    
                    // Show selected content
                    const targetContent = document.getElementById('doc-' + docPath);
                    if (targetContent) {{
                        targetContent.style.display = 'block';
                    }} else {{
                        // Fallback to index
                        document.getElementById('doc-index').style.display = 'block';
                    }}
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                }});
            }});
            
            // Highlight the index link by default
            const indexLink = document.querySelector('.nav-link[data-doc="DOKUMENTATIONSINDEX.md"]');
            if (indexLink) {{
                indexLink.classList.add('active');
            }}
        }});
    </script>
</body>
</html>'''
    
    return html_template

def main():
    docs_dir = '/root/CMMS/docs'
    output_dir = '/root/CMMS/frontend/public/docs'
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print("📚 Generating MMS Documentation...")
    
    # Get all documentation files
    doc_files = get_doc_files(docs_dir)
    print(f"📄 Found {len(doc_files)} documentation files")
    
    # Parse all markdown files
    docs_content = {}
    index_content = None
    
    for doc in doc_files:
        content = parse_markdown_file(doc['path'])
        docs_content[doc['relative_path']] = content
        
        # Store index content separately
        if doc['relative_path'] == 'DOKUMENTATIONSINDEX.md':
            index_content = content
    
    # Generate navigation structure
    nav_by_section = generate_navigation(doc_files, docs_dir)
    
    # Generate HTML template
    html_content = generate_html_template(nav_by_section, docs_content, index_content)
    
    # Write output file
    output_file = os.path.join(output_dir, 'index.html')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Documentation generated successfully: {output_file}")
    print(f"📁 Output directory: {output_dir}")

if __name__ == '__main__':
    main()