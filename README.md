# constract-mcp-tool

An MCP server that allows AI models (like Gemini or Claude) to create complex file structures and populate them with code from a simple tree-like text description.

## Installation

To install `constract-mcp-tool` on a new PC, follow these steps:

### 1. Install Node.js & NPM
Go to [nodejs.org](https://nodejs.org/) and download the LTS version.
- **Windows/macOS:** Run the installer and keep the default settings.
- **Linux:** Use your package manager (e.g., `sudo apt install nodejs npm`).
- **Verify:** Open a terminal and run `node -v` and `npm -v` to confirm they work.

### 2. Install the Package Globally
Open your terminal and run:
```bash
npm install -g constract-mcp-tool
```
This puts the `constract-mcp-tool` command into your system's PATH.

### 3. Set Up the AI Client
You need an "app" to interact with your tool.

#### For Gemini CLI:
1. Install it: `npm install -g @google/gemini-cli`.
2. Add your tool:
   ```bash
   gemini mcp add constract constract-mcp-tool
   ```
   Note: This automatically updates your `~/.gemini/settings.json`.

#### For Claude Desktop:
Open your config file (typically `~/.config/Claude/claude_desktop_config.json` or `%APPDATA%\Claude\claude_desktop_config.json`) and add:
```json
{
  "mcpServers": {
    "constract": {
      "command": "constract-mcp-tool"
    }
  }
}
```

## Usage

The tool provides `create_structure` which takes:
- `base_path`: The absolute path where the structure should be created.
- `structure`: A tree-like string (e.g., produced by `tree` command or manual drawing).
- `files_content`: (Optional) A map of relative file paths to their content.

Example structure:
```
src/
  main.ts
  components/
    Header.tsx
    Footer.tsx
```

## Features
- **Intelligent Parsing:** Handles tree characters (│, ├, └, ─) and various indentation styles.
- **Directory Detection:** Automatically identifies directories vs files based on naming conventions and trailing slashes.
- **Code Generation:** When used with an AI, the AI can provide the full content for every file in the structure in a single call.
