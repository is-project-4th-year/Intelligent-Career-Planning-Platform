#!/usr/bin/env python3
import os
import re
from pathlib import Path

def remove_typescript_syntax(content):
    """Remove TypeScript-specific syntax from the content."""
    
    # Remove type imports (import type { ... })
    content = re.sub(r'import\s+type\s+\{[^}]+\}\s+from\s+[^;]+;?\n?', '', content)
    content = re.sub(r',\s*type\s+\w+', '', content)
    
    # Remove type-only imports from regular imports
    content = re.sub(r'(import\s+\{[^}]*),\s*type\s+\w+', r'\1', content)
    
    # Remove function return types: ): Type {
    content = re.sub(r'\):\s*[A-Za-z_][\w.<>|\[\]\s&]+\s*\{', ') {', content)
    
    # Remove parameter types in function signatures
    # Match patterns like: param: Type or param?: Type
    content = re.sub(r'(\w+)\??:\s*[A-Za-z_][\w.<>|\[\]\s&\'"()]+([,\)])', r'\1\2', content)
    
    # Remove generic type parameters: <Type>
    content = re.sub(r'<[A-Za-z_][\w.<>|\[\]\s&,]+>', '', content)
    
    # Remove type assertions: as Type
    content = re.sub(r'\s+as\s+[A-Za-z_][\w.<>|\[\]\s&]+', '', content)
    
    # Remove interface declarations
    content = re.sub(r'interface\s+\w+\s*\{[^}]*\}\s*\n?', '', content, flags=re.MULTILINE | re.DOTALL)
    
    # Remove type alias declarations
    content = re.sub(r'type\s+\w+\s*=\s*[^;\n]+;?\s*\n?', '', content, flags=re.MULTILINE)
    
    # Remove React.FC, React.ComponentProps type annotations
    content = re.sub(r':\s*React\.(FC|FunctionComponent|ComponentProps)[^{]*', '', content)
    
    # Clean up multiple empty lines
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    return content

def convert_file(ts_path):
    """Convert a single TypeScript file to JavaScript."""
    # Determine output path
    if ts_path.suffix == '.tsx':
        js_path = ts_path.with_suffix('.jsx')
    else:
        js_path = ts_path.with_suffix('.js')
    
    # Read TypeScript file
    try:
        with open(ts_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {ts_path}: {e}")
        return None
    
    # Convert to JavaScript
    js_content = remove_typescript_syntax(content)
    
    # Write JavaScript file
    try:
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        print(f"✓ Converted: {ts_path} → {js_path}")
        return js_path
    except Exception as e:
        print(f"Error writing {js_path}: {e}")
        return None

def update_imports_in_file(file_path):
    """Update imports from .tsx/.ts to .jsx/.js in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update imports
        content = re.sub(r'(from\s+["\'][^"\']+)\.tsx(["\'])', r'\1.jsx\2', content)
        content = re.sub(r'(from\s+["\'][^"\']+)\.ts(["\'])', r'\1.js\2', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"Error updating imports in {file_path}: {e}")

def main():
    src_dir = Path('src')
    
    # Find all TypeScript files
    ts_files = list(src_dir.rglob('*.tsx')) + list(src_dir.rglob('*.ts'))
    ts_files = [f for f in ts_files if 'node_modules' not in str(f)]
    
    print(f"Found {len(ts_files)} TypeScript files to convert\n")
    
    converted_files = []
    
    # Convert each file
    for ts_file in ts_files:
        js_file = convert_file(ts_file)
        if js_file:
            converted_files.append(js_file)
    
    print(f"\n✓ Converted {len(converted_files)} files")
    
    # Update imports in all JavaScript files
    print("\nUpdating imports...")
    for js_file in converted_files:
        update_imports_in_file(js_file)
    
    # Delete original TypeScript files
    print("\nRemoving original TypeScript files...")
    for ts_file in ts_files:
        try:
            ts_file.unlink()
            print(f"✓ Deleted: {ts_file}")
        except Exception as e:
            print(f"Error deleting {ts_file}: {e}")
    
    print(f"\n✅ Conversion complete! {len(converted_files)} files converted.")

if __name__ == '__main__':
    main()

