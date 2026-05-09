import os

env_path = '.env'
with open(env_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('FIREBASE_SECRET='):
        # The secret is wrapped in single quotes
        start_idx = line.find("'") + 1
        end_idx = line.rfind("'")
        secret_content = line[start_idx:end_idx]
        
        # Remove any backslashes that are NOT followed by 'n'
        # Actually, let's just remove the specific one we found: \L
        # But to be safe, let's just replace all \ except \n with nothing
        import re
        # This regex finds a backslash not followed by n
        cleaned_content = re.sub(r'\\(?![n"])', '', secret_content)
        
        new_lines.append(f"FIREBASE_SECRET='{cleaned_content}'\n")
    else:
        new_lines.append(line)

with open(env_path, 'w') as f:
    f.writelines(new_lines)

print("Cleaned FIREBASE_SECRET in .env")
