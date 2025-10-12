/**
 * Parallel Agent Executor
 *
 * Executes multiple AI agents in parallel to process GitHub Issues
 */

import { Octokit } from '@octokit/rest';
import { AIProviderManager } from './ai-provider.js';
import * as dotenv from 'dotenv';

dotenv.config();

interface ExecutorOptions {
  issue: number;
  concurrency?: number;
  logLevel?: 'info' | 'debug' | 'error';
}

export class ParallelExecutor {
  private octokit: Octokit;
  private aiProvider: AIProviderManager;
  private owner: string;
  private repo: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is required');
    }

    const repository = process.env.REPOSITORY || process.env.GITHUB_REPOSITORY;
    if (!repository) {
      throw new Error('REPOSITORY or GITHUB_REPOSITORY environment variable is required');
    }

    [this.owner, this.repo] = repository.split('/');

    this.octokit = new Octokit({ auth: token });
    this.aiProvider = new AIProviderManager();
  }

  async execute(options: ExecutorOptions): Promise<void> {
    const { issue: issueNumber, concurrency = 3, logLevel = 'info' } = options;

    this.log('info', `🚀 Starting agent execution for Issue #${issueNumber}`);

    try {
      // Fetch issue details
      const issue = await this.fetchIssue(issueNumber);
      this.log('info', `📄 Issue title: ${issue.title}`);

      // Analyze issue with AI
      const analysis = await this.analyzeIssue(issue);
      this.log('info', `🔍 Analysis complete. Provider: ${analysis.provider}, Cost: $${analysis.cost.toFixed(4)}`);

      // Generate code based on analysis
      const codeGeneration = await this.generateCode(issue, analysis.content);
      this.log('info', `💻 Code generated. Provider: ${codeGeneration.provider}, Cost: $${codeGeneration.cost.toFixed(4)}`);

      // Create implementation plan
      const plan = JSON.parse(codeGeneration.content || '{}');
      this.log('info', `📋 Implementation plan created`);

      // Log usage stats
      const stats = this.aiProvider.getStats();
      this.log('info', `📊 Stats: Gemini requests today: ${stats.geminiRequestsToday}, Free remaining: ${stats.geminiRemainingFree}`);

      this.log('info', `✅ Agent execution complete for Issue #${issueNumber}`);
    } catch (error) {
      this.log('error', `❌ Agent execution failed: ${error}`);
      throw error;
    }
  }

  private async fetchIssue(issueNumber: number) {
    const { data } = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber
    });
    return data;
  }

  private async analyzeIssue(issue: any) {
    const systemPrompt = `You are an AI agent analyzing GitHub issues for an autonomous development system.
Analyze the issue and create a structured implementation plan.
Focus on: task breakdown, complexity estimation, and required files.`;

    const prompt = `Issue Title: ${issue.title}

Issue Body:
${issue.body || 'No description provided'}

Analyze this issue and provide:
1. Task breakdown (list of subtasks)
2. Complexity estimation (small/medium/large)
3. Files that need to be created or modified
4. Implementation approach

Respond in JSON format.`;

    return await this.aiProvider.generate(prompt, systemPrompt);
  }

  private async generateCode(issue: any, analysis: string) {
    const systemPrompt = `You are a code generation AI agent.
Generate high-quality TypeScript code based on the issue requirements and analysis.
Follow best practices and include proper error handling.`;

    const prompt = `Based on this analysis:
${analysis}

Generate the necessary code files to implement the requested functionality.
Format your response as JSON with the following structure:
{
  "files": [
    {
      "path": "src/example.ts",
      "content": "// code here"
    }
  ],
  "tests": [
    {
      "path": "tests/example.test.ts",
      "content": "// test code here"
    }
  ]
}`;

    return await this.aiProvider.generate(prompt, systemPrompt);
  }

  private log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: ExecutorOptions = {
    issue: 0,
    concurrency: 3,
    logLevel: 'info'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--issue' && args[i + 1]) {
      options.issue = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--concurrency' && args[i + 1]) {
      options.concurrency = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--log-level' && args[i + 1]) {
      options.logLevel = args[i + 1] as any;
      i++;
    }
  }

  if (!options.issue) {
    console.error('Error: --issue parameter is required');
    console.log('Usage: npm run agents:parallel:exec -- --issue <number> [--concurrency <num>] [--log-level <level>]');
    process.exit(1);
  }

  const executor = new ParallelExecutor();
  executor.execute(options).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
