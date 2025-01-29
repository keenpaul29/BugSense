import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI;
let model: any;

export function activate(context: vscode.ExtensionContext) {
    const apiKey = vscode.workspace.getConfiguration().get('bugsense.apiKey') as string;
    
    if (!apiKey) {
        vscode.window.showErrorMessage('Please set your Google API key in settings (bugsense.apiKey)');
        return;
    }

    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Register commands
    let generateDocs = vscode.commands.registerCommand('bugsense.generateDocs', generateDocumentation);
    let analyzeBugs = vscode.commands.registerCommand('bugsense.analyzeBugs', analyzeCodeForBugs);
    let getSuggestions = vscode.commands.registerCommand('bugsense.getSuggestions', getCodeSuggestions);
    let refactorCode = vscode.commands.registerCommand('bugsense.refactorCode', suggestCodeRefactoring);
    let optimizePerformance = vscode.commands.registerCommand('bugsense.optimizePerformance', optimizeCodePerformance);
    let generateSnippet = vscode.commands.registerCommand('bugsense.generateSnippet', generateCodeSnippet);
    let scanSecurity = vscode.commands.registerCommand('bugsense.scanSecurity', scanSecurityVulnerabilities);

    // Register providers
    const provider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'typescript', 'python'],
        new AICompletionProvider(),
        '.' // Trigger completion when user types a dot
    );

    context.subscriptions.push(
        generateDocs, 
        analyzeBugs, 
        getSuggestions, 
        refactorCode,
        optimizePerformance,
        generateSnippet,
        scanSecurity,
        provider
    );

    // Setup real-time diagnostics
    setupDiagnostics(context);
}

class AICompletionProvider implements vscode.CompletionItemProvider {
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        
        if (!linePrefix.endsWith('.')) {
            return [];
        }

        try {
            const codeContext = getCodeContext(document, position);
            const suggestions = await getAISuggestions(codeContext);
            
            return suggestions.map(suggestion => {
                const item = new vscode.CompletionItem(suggestion, vscode.CompletionItemKind.Method);
                item.detail = 'AI Suggestion';
                return item;
            });
        } catch (error) {
            console.error('Error providing completions:', error);
            return [];
        }
    }
}

async function generateDocumentation() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const text = document.getText(selection);

    try {
        const result = await model.generateContent(`Generate comprehensive documentation for the following code:\n\n${text}`);
        const documentation = result.response.text();
        
        if (documentation) {
            editor.edit(editBuilder => {
                editBuilder.insert(selection.start, `/**\n * ${documentation.split('\n').join('\n * ')}\n */\n`);
            });
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to generate documentation');
        console.error(error);
    }
}

async function analyzeCodeForBugs() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const text = document.getText();

    try {
        const result = await model.generateContent(`Analyze this code for potential bugs, security issues, and performance problems:\n\n${text}`);
        const analysis = result.response.text();
        
        if (analysis) {
            const panel = vscode.window.createWebviewPanel(
                'bugAnalysis',
                'Bug Analysis',
                vscode.ViewColumn.Two,
                {}
            );
            panel.webview.html = getWebviewContent(analysis);
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to analyze code');
        console.error(error);
    }
}

async function getCodeSuggestions() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const codeContext = getCodeContext(document, position);

    try {
        const result = await model.generateContent(`Provide code suggestions based on the following context:\n\n${codeContext}`);
        const suggestions = result.response.text();
        
        if (suggestions) {
            vscode.window.showInformationMessage(suggestions);
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to get code suggestions');
        console.error(error);
    }
}

async function getAISuggestions(context: string): Promise<string[]> {
    try {
        const result = await model.generateContent(`Given this code context, suggest possible method completions:\n\n${context}`);
        const suggestions = result.response.text();
        return suggestions.split('\n').filter((s: string) => s.trim().length > 0);
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        return [];
    }
}

function getCodeContext(document: vscode.TextDocument, position: vscode.Position): string {
    const range = new vscode.Range(
        Math.max(0, position.line - 10),
        0,
        position.line,
        position.character
    );
    return document.getText(range);
}

function setupDiagnostics(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('bugsense');
    context.subscriptions.push(diagnosticCollection);

    let timeout: NodeJS.Timer | undefined = undefined;

    function updateDiagnostics(document: vscode.TextDocument) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(async () => {
            const text = document.getText();
            try {
                const result = await model.generateContent(`Analyze this code for potential issues and return them in a structured format:\n\n${text}`);
                const analysis = result.response.text();
                
                if (analysis) {
                    const diagnostics: vscode.Diagnostic[] = [];
                    // Parse analysis and create diagnostics
                    // This is a simplified version - you would need to parse the AI response appropriately
                    diagnosticCollection.set(document.uri, diagnostics);
                }
            } catch (error) {
                console.error('Error updating diagnostics:', error);
            }
        }, 1500);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === vscode.window.activeTextEditor?.document) {
                updateDiagnostics(e.document);
            }
        })
    );
}

function getWebviewContent(analysis: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bug Analysis</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .issue { margin-bottom: 20px; padding: 10px; border-left: 4px solid #f44336; }
                .issue h3 { margin-top: 0; }
            </style>
        </head>
        <body>
            <h2>Code Analysis Results</h2>
            <div class="analysis">
                ${analysis.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
            </div>
        </body>
        </html>
    `;
}

async function suggestCodeRefactoring() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const document = editor.document;
    const text = document.getText();

    try {
        const result = await model.generateContent(
            `Analyze this code and suggest refactoring improvements. Focus on:
            1. Code organization and structure
            2. Design patterns that could be applied
            3. Reducing code duplication
            4. Improving readability and maintainability
            5. Better naming conventions
            
            Code to analyze:
            ${text}`
        );
        
        const analysis = result.response.text();
        if (analysis) {
            const panel = vscode.window.createWebviewPanel(
                'refactoringSuggestions',
                'Refactoring Suggestions',
                vscode.ViewColumn.Two,
                {}
            );
            panel.webview.html = getWebviewContent(analysis);
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to generate refactoring suggestions');
        console.error(error);
    }
}

async function optimizeCodePerformance() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const document = editor.document;
    const text = document.getText();

    try {
        const result = await model.generateContent(
            `Analyze this code for performance optimization opportunities. Focus on:
            1. Time complexity improvements
            2. Memory usage optimization
            3. Resource management
            4. Caching opportunities
            5. Async/await usage optimization
            
            Code to analyze:
            ${text}`
        );
        
        const analysis = result.response.text();
        if (analysis) {
            const panel = vscode.window.createWebviewPanel(
                'performanceOptimization',
                'Performance Optimization Suggestions',
                vscode.ViewColumn.Two,
                {}
            );
            panel.webview.html = getWebviewContent(analysis);
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to generate performance optimization suggestions');
        console.error(error);
    }
}

async function generateCodeSnippet() {
    const languages = vscode.workspace.getConfiguration().get('bugsense.snippetLanguages') as string[];
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = languages.map(lang => ({ label: lang }));
    quickPick.placeholder = 'Select a programming language';
    
    quickPick.onDidChangeSelection(async selection => {
        if (selection[0]) {
            const language = selection[0].label;
            const description = await vscode.window.showInputBox({
                prompt: 'Describe the code snippet you want to generate',
                placeHolder: 'E.g., "A function that sorts an array using quicksort"'
            });

            if (description) {
                try {
                    const result = await model.generateContent(
                        `Generate a code snippet in ${language} that does the following:
                        ${description}
                        
                        Please provide:
                        1. The code implementation
                        2. Brief explanation of how it works
                        3. Example usage`
                    );
                    
                    const snippet = result.response.text();
                    if (snippet) {
                        const doc = await vscode.workspace.openTextDocument({
                            content: snippet,
                            language: language
                        });
                        await vscode.window.showTextDocument(doc);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to generate code snippet');
                    console.error(error);
                }
            }
        }
        quickPick.dispose();
    });
    
    quickPick.show();
}

async function scanSecurityVulnerabilities() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor');
        return;
    }

    const document = editor.document;
    const text = document.getText();
    const scanLevel = vscode.workspace.getConfiguration().get('bugsense.securityScanLevel') as string;

    try {
        const result = await model.generateContent(
            `Perform a ${scanLevel}-level security vulnerability scan on this code. Focus on:
            1. Common security vulnerabilities (XSS, SQL injection, etc.)
            2. Input validation issues
            3. Authentication and authorization concerns
            4. Data exposure risks
            5. Secure coding practices
            6. Dependencies with known vulnerabilities
            
            Code to analyze:
            ${text}`
        );
        
        const analysis = result.response.text();
        if (analysis) {
            const panel = vscode.window.createWebviewPanel(
                'securityScan',
                'Security Vulnerability Scan Results',
                vscode.ViewColumn.Two,
                {}
            );
            
            // Create a more detailed HTML template for security results
            const securityHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Security Scan Results</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px;
                            line-height: 1.6;
                        }
                        .vulnerability {
                            margin-bottom: 20px;
                            padding: 15px;
                            border-left: 4px solid #ff4444;
                            background-color: #fff5f5;
                        }
                        .high { border-color: #ff4444; }
                        .medium { border-color: #ffbb33; }
                        .low { border-color: #00C851; }
                        .severity {
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-bottom: 10px;
                        }
                        .recommendation {
                            margin-top: 10px;
                            padding: 10px;
                            background-color: #f8f9fa;
                        }
                    </style>
                </head>
                <body>
                    <h2>Security Vulnerability Scan Results</h2>
                    <p>Scan Level: ${scanLevel}</p>
                    <div class="analysis">
                        ${analysis.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
                    </div>
                </body>
                </html>
            `;
            panel.webview.html = securityHtml;
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to perform security scan');
        console.error(error);
    }
}

export function deactivate() {}
