import os

directory = 'src'
for root, _, files in os.walk(directory):
    for filename in files:
        if filename.endswith('.ts') or filename.endswith('.tsx') and filename != 'auth.ts':
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if "import { auth } from '@clerk/nextjs/server'" in content:
                content = content.replace("import { auth } from '@clerk/nextjs/server'", "import { auth } from '@/lib/auth'")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {filepath}')
