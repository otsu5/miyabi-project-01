#!/bin/bash
echo "🔐 Opening GitHub Secrets configuration page..."
echo ""
echo "Please add the following secrets:"
echo ""
echo "1. GEMINI_API_KEY"
echo "2. OPENAI_API_KEY" 
echo "3. ANTHROPIC_API_KEY (optional)"
echo ""
echo "Values are in your .env file"
echo ""

# Open browser
if command -v cmd.exe &> /dev/null; then
    cmd.exe /c start https://github.com/otsu5/miyabi-project-01/settings/secrets/actions
elif command -v xdg-open &> /dev/null; then
    xdg-open https://github.com/otsu5/miyabi-project-01/settings/secrets/actions
elif command -v open &> /dev/null; then
    open https://github.com/otsu5/miyabi-project-01/settings/secrets/actions
else
    echo "Please manually open: https://github.com/otsu5/miyabi-project-01/settings/secrets/actions"
fi
