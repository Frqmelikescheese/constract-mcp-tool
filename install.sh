#!/bin/bash
# Install dependencies
npm install
# Build the project
npm run build
# Install globally (requires sudo if not using nvm)
if [ "$EUID" -ne 0 ]; then
  echo "Trying to install globally... (might ask for password)"
  sudo npm install -g .
else
  npm install -g .
fi
# Add to Gemini CLI if gemini is installed
if command -v gemini &> /dev/null; then
  echo "Adding constract to Gemini CLI..."
  gemini mcp add constract constract-mcp-tool
else
  echo "Gemini CLI not found. Please install it with: npm install -g @google/gemini-cli"
fi
echo "Installation complete! You can now use 'constract-mcp-tool' as an MCP server."
