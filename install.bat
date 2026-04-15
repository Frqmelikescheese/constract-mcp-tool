@echo off
echo Installing dependencies...
npm install
echo Building the project...
npm run build
echo Installing globally...
npm install -g .
echo Adding to Gemini CLI...
where gemini >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  gemini mcp add constract constract-mcp-tool
) else (
  echo Gemini CLI not found. Please install it with: npm install -g @google/gemini-cli
)
echo Installation complete! You can now use 'constract-mcp-tool' as an MCP server.
pause
