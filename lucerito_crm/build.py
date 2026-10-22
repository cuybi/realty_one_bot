import os

def build_single_html():
    base_dir = r"c:\Users\etechadmin\.gemini\antigravity\scratch\lucerito_crm\frontend"
    
    with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
        html_content = f.read()
        
    with open(os.path.join(base_dir, "styles.css"), "r", encoding="utf-8") as f:
        css_content = f.read()
        
    with open(os.path.join(base_dir, "app.js"), "r", encoding="utf-8") as f:
        js_content = f.read()

    # Replace link to styles.css with inline <style>
    html_content = html_content.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css_content}\n</style>')
    
    # Replace script src with inline <script>
    html_content = html_content.replace('<script src="app.js"></script>', f'<script>\n{js_content}\n</script>')
    
    output_path = os.path.join(base_dir, "lucerito_google_sites.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"File created successfully at: {output_path}")

if __name__ == "__main__":
    build_single_html()
