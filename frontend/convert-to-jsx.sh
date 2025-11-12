#!/bin/bash

# Convert all .tsx and .ts files to .jsx and .js
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
    # Determine new extension
    if [[ "$file" == *.tsx ]]; then
        newfile="${file%.tsx}.jsx"
    else
        newfile="${file%.ts}.js"
    fi
    
    # Convert TypeScript to JavaScript
    cat "$file" | \
        # Remove type imports
        sed -E 's/import[[:space:]]+\{[[:space:]]*type[[:space:]]+[^}]+\}[[:space:]]+from[[:space:]]+[^;]+;//g' | \
        sed -E 's/,[[:space:]]*type[[:space:]]+[^,}]+//g' | \
        # Remove function return type annotations
        sed -E 's/\):([[:space:]]*)React\.[^{]+\{/)\1{/g' | \
        sed -E 's/\):([[:space:]]*)JSX\.[^{]+\{/)\1{/g' | \
        # Remove parameter type annotations (simple cases)
        sed -E 's/([a-zA-Z_][a-zA-Z0-9_]*)[[:space:]]*:[[:space:]]*React\.[^,)]+/\1/g' | \
        sed -E 's/([a-zA-Z_][a-zA-Z0-9_]*)[[:space:]]*:[[:space:]]*[a-zA-Z_][a-zA-Z0-9_.<>|&\[\]]+([,)])/\1\2/g' | \
        # Remove generic type parameters
        sed -E 's/<[^>]*>//g' | \
        # Remove type assertions
        sed -E 's/ as [a-zA-Z_][a-zA-Z0-9_.<>|&\[\]]+ /\1/g' | \
        # Remove interface and type definitions
        sed -E '/^(interface|type)[[:space:]]+[^=]+=?/d' \
        > "$newfile"
    
    echo "Converted: $file -> $newfile"
done

# Update all imports from .tsx to .jsx and .ts to .js
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' -E 's/(from[[:space:]]+"[^"]+)\.tsx"/\1.jsx"/g' {} \;
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' -E 's/(from[[:space:]]+"[^"]+)\.ts"/\1.js"/g' {} \;

# Remove original TypeScript files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -delete

echo "Conversion complete!"

