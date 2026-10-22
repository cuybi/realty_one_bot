path = r"C:\Users\etechadmin\.gemini\mcp-servers\youtube-mcp\server.py"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    "from mcp.shared.exceptions import MCPError",
    "try:\n    from mcp.shared.exceptions import McpError as MCPError\nexcept ImportError:\n    from mcp.shared.exceptions import MCPError"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("Patch applied successfully to server.py")
