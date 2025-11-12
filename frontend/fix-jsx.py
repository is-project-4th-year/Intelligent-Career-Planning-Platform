#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_jsx_file(file_path):
    """Fix common syntax issues in converted JSX files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix: import *"react" -> import * as React from "react"
        content = re.sub(r'import \*"react"', 'import * as React from "react"', content)
        
        # Fix: import *"@radix -> import * as SomePrimitive from "@radix
        def fix_radix_import(match):
            pkg = match.group(1)
            # Extract component name from package
            parts = pkg.split('/')[-1].split('-')
            name = ''.join(word.capitalize() for word in parts) + 'Primitive'
            return f'import * as {name} from "{pkg}"'
        
        content = re.sub(r'import \*"(@radix-ui/[^"]+)"', fix_radix_import, content)
        
        # Fix: import *"lucide-react" -> import *from "lucide-react"
        content = re.sub(r'import \*"lucide-react"', 'import * from "lucide-react"', content)
        
        # Fix function parameters: ){ -> ) {
        content = re.sub(r'\)\{', ') {', content)
        
        # Fix: }{ -> }) {
        content = re.sub(r'\}\{', '}) {', content)
        
        # Remove leftover TypeScript syntax like ?: in parameters
        content = re.sub(r'(\w+)\?\s*:', r'\1:', content)
        
        # Clean up multiple spaces
        content = re.sub(r'  +', ' ', content)
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error fixing {file_path}: {e}")
        return False

def main():
    src_dir = Path('src')
    js_files = list(src_dir.rglob('*.jsx')) + list(src_dir.rglob('*.js'))
    js_files = [f for f in js_files if 'node_modules' not in str(f)]
    
    print(f"Fixing {len(js_files)} JavaScript files...\n")
    
    fixed_count = 0
    for js_file in js_files:
        if fix_jsx_file(js_file):
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} files")

if __name__ == '__main__':
    main()

