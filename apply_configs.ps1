$ErrorActionPreference = 'Stop'

# Ensure required scratch/data directories exist
$scratchDbDir = "C:\Users\etechadmin\.gemini\antigravity-ide\scratch\templefit-admin"
New-Item -ItemType Directory -Force -Path $scratchDbDir | Out-Null

# 1. Prepare adapted mcp_config.json
$mcpConfig = @{
  mcpServers = [ordered]@{
    "local-crm-db" = @{
      command = "npx"
      args = @("-y", "mcp-server-sqlite", "--db-path", "C:/Users/etechadmin/.gemini/antigravity-ide/scratch/templefit-admin/templefit_crm.db")
    }
    "web-search" = @{
      command = "npx"
      args = @("-y", "duckduckgo-mcp-server")
    }
    "ui-ux-pro" = @{
      command = "npx"
      args = @("-y", "ui-ux-pro-mcp")
    }
    "icons" = @{
      command = "npx"
      args = @("-y", "mcp-universal-icons")
    }
    "shadcn-ui" = @{
      command = "npx"
      args = @("shadcn-ui-mcp-server")
    }
    "tailwindcss" = @{
      command = "npx"
      args = @("tailwindcss-mcp-server")
    }
    "memory" = @{
      command = "npx"
      args = @("-y", "@modelcontextprotocol/server-memory")
    }
    "google-fonts" = @{
      command = "uvx"
      args = @("google-fonts-mcp")
    }
    "lighthouse" = @{
      command = "npx"
      args = @("lighthouse-mcp-server")
    }
    "playwright" = @{
      command = "npx"
      args = @("@playwright/mcp")
    }
    "notebooklm" = @{
      command = "npx"
      args = @("-y", "notebooklm-mcp")
    }
    "calculator" = @{
      command = "uvx"
      args = @("--from", "calculator-mcp-server@git+https://github.com/huhabla/calculator-mcp-server.git", "--", "calculator-mcp-server", "--stdio")
    }
    "github-mcp-server" = @{
      command = "npx"
      args = @("-y", "@modelcontextprotocol/server-github")
    }
    "gitmcp" = @{
      command = "npx"
      args = @("-y", "gitmcp")
    }
    "mathematics" = @{
      command = "uvx"
      args = @("mcp-mathematics")
    }
    "mcp-pandoc" = @{
      command = "uvx"
      args = @("mcp-pandoc")
    }
    "pdf-reader" = @{
      command = "npx"
      args = @("-y", "@sylphx/pdf-reader-mcp")
    }
    "github" = @{
      command = "npx"
      args = @("-y", "@modelcontextprotocol/server-github")
    }
    "firebase-mcp-server" = @{
      command = "npx"
      args = @("-y", "firebase-tools@latest", "mcp")
    }
    "vertex-ai-search" = @{
      serverUrl = "https://discoveryengine.googleapis.com/mcp"
      authProviderType = "google_credentials"
    }
    "filesystem" = @{
      command = "npx"
      args = @("-y", "@modelcontextprotocol/server-filesystem", "C:/Users/etechadmin/.gemini/antigravity-ide/scratch")
    }
    "fetch" = @{
      command = "uvx"
      args = @("--from", "mcp-server-fetch", "--with", "mcp==1.9.0", "mcp-server-fetch")
    }
    "context7" = @{
      command = "npx"
      args = @("-y", "@upstash/context7-mcp")
    }
    "science-mcp" = @{
      command = "node"
      args = @("C:/Users/etechadmin/.gemini/mcp-servers/science-mcp/index.js")
    }
    "medical-mcp" = @{
      command = "node"
      args = @("C:/Users/etechadmin/.gemini/mcp-servers/medical-mcp/build/index.js")
    }
    "youtube-mcp" = @{
      command = "uv"
      args = @("run", "--project", "C:/Users/etechadmin/.gemini/mcp-servers/youtube-mcp", "python", "C:/Users/etechadmin/.gemini/mcp-servers/youtube-mcp/server.py")
    }
    "google-patents-mcp" = @{
      command = "node"
      args = @("C:/Users/etechadmin/.gemini/mcp-servers/google-patents-mcp/build/index.js")
      env = @{
        SERPAPI_API_KEY = "49b4ac8ae96433b68d8d2a00cf280283c1a334015fc110114cdc6ba19e9091f3"
      }
    }
  }
}

$mcpJson = $mcpConfig | ConvertTo-Json -Depth 10
$geminiConfigDir = "C:\Users\etechadmin\.gemini\config"
New-Item -ItemType Directory -Force -Path $geminiConfigDir | Out-Null
$mcpJson | Set-Content -Path (Join-Path $geminiConfigDir "mcp_config.json") -Encoding UTF8
Write-Host "Written mcp_config.json to $geminiConfigDir"

# 2. Prepare cline_mcp_settings.json
$clineSettingsDir = "$env:APPDATA\Antigravity\User\globalStorage\saoudrizwan.claude-dev\settings"
New-Item -ItemType Directory -Force -Path $clineSettingsDir | Out-Null
$mcpJson | Set-Content -Path (Join-Path $clineSettingsDir "cline_mcp_settings.json") -Encoding UTF8
Write-Host "Written cline_mcp_settings.json to $clineSettingsDir"

# 3. Fix skills.json in skills directory and config root
$skillsJsonObj = @{
  entries = @(
    @{ path = "C:/Users/etechadmin/.gemini/config/skills" }
  )
}
$skillsJson = $skillsJsonObj | ConvertTo-Json -Depth 5
$skillsJson | Set-Content -Path "C:\Users\etechadmin\.gemini\config\skills\skills.json" -Encoding UTF8
$skillsJson | Set-Content -Path "C:\Users\etechadmin\.gemini\config\skills.json" -Encoding UTF8
Write-Host "Updated skills.json files"
