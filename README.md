## BugSense - AI-Powered Code Assistant

BugSense is a powerful VS Code extension that provides AI-powered code assistance using Google's Gemini Pro API. It offers intelligent code suggestions, automatic documentation generation, real-time bug detection, and advanced code analysis features.

## Features

- 🤖 **AI-Powered Code Suggestions**: Get intelligent code completion suggestions based on your current context
- 📝 **Documentation Generation**: Automatically generate comprehensive documentation for your code
- 🐛 **Bug Detection**: Real-time analysis of potential bugs, security issues, and performance problems
- 💡 **Smart Completions**: Context-aware code completions that understand your codebase
- 🔄 **Code Refactoring**: Get suggestions for improving code structure and applying design patterns
- ⚡ **Performance Optimization**: Identify and fix performance bottlenecks
- 📋 **Code Snippet Generation**: Generate code snippets for common programming tasks
- 🔒 **Security Scanner**: Detect potential security vulnerabilities with customizable scan levels

## Installation

1. Install the extension from the VS Code marketplace
2. Set your Google API key in VS Code settings:
   - Open Command Palette (Ctrl+Shift+P)
   - Search for "Preferences: Open Settings (JSON)"
   - Add the following line:
   ```json
   {
     "bugsense.apiKey": "your-google-api-key"
   }
   ```

## Usage

### Generate Documentation
1. Select the code you want to document
2. Open Command Palette (Ctrl+Shift+P)
3. Run "BugSense: Generate Documentation"

### Analyze Code for Bugs
1. Open the file you want to analyze
2. Open Command Palette (Ctrl+Shift+P)
3. Run "BugSense: Analyze Code for Bugs"

### Get Code Suggestions
- Type normally and the extension will provide AI-powered suggestions
- Or use the command palette and run "BugSense: Get Code Suggestions"

### Refactor Code
1. Open the file you want to refactor
2. Open Command Palette (Ctrl+Shift+P)
3. Run "BugSense: Suggest Code Refactoring"
4. Review the suggestions in the webview panel

### Optimize Performance
1. Open the file you want to optimize
2. Open Command Palette (Ctrl+Shift+P)
3. Run "BugSense: Optimize Performance"
4. Review the optimization suggestions

### Generate Code Snippets
1. Open Command Palette (Ctrl+Shift+P)
2. Run "BugSense: Generate Code Snippet"
3. Select the programming language
4. Describe the code snippet you want to generate
5. The generated snippet will open in a new editor

### Security Vulnerability Scan
1. Open the file you want to scan
2. Open Command Palette (Ctrl+Shift+P)
3. Run "BugSense: Scan for Security Vulnerabilities"
4. Review the security analysis results

## Configuration

You can customize BugSense through VS Code settings:

```json
{
  "bugsense.apiKey": "your-google-api-key",
  "bugsense.snippetLanguages": ["javascript", "typescript", "python"],
  "bugsense.securityScanLevel": "intermediate"
}
```

- `snippetLanguages`: Array of languages supported for code snippet generation
- `securityScanLevel`: Security scan depth level (basic, intermediate, advanced)

## Supported Languages
- JavaScript
- TypeScript
- Python

## Requirements
- VS Code 1.85.0 or higher
- Google API key with access to Gemini Pro API

## Privacy & Security
- Your code is sent to Google's Gemini API for analysis
- No code or data is stored permanently
- API key is stored securely in VS Code settings

## License
MIT
#   B u g S e n s e 
 
 
