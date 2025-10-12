/**
 * State Transition Manager
 *
 * Manages Issue state transitions based on labels
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

interface TransitionOptions {
  issue: number;
  to: string;
  reason?: string;
}

const STATE_LABELS = {
  pending: '📥 state:pending',
  analyzing: '🔍 state:analyzing',
  implementing: '🏗️ state:implementing',
  reviewing: '👀 state:reviewing',
  done: '✅ state:done',
  blocked: '🚫 state:blocked',
  paused: '⏸️ state:paused'
};

export class StateTransition {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is required');
    }

    const repository = process.env.REPOSITORY || process.env.GITHUB_REPOSITORY || process.env.GITHUB_REPO;
    if (!repository) {
      throw new Error('REPOSITORY environment variable is required');
    }

    [this.owner, this.repo] = repository.split('/');

    this.octokit = new Octokit({ auth: token });
  }

  async transition(options: TransitionOptions): Promise<void> {
    const { issue: issueNumber, to, reason } = options;

    console.log(`🔄 Transitioning Issue #${issueNumber} to state: ${to}`);

    try {
      // Get current labels
      const { data: issue } = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber
      });

      const currentLabels = issue.labels.map((label: any) =>
        typeof label === 'string' ? label : label.name
      );

      // Remove all state labels
      const labelsToKeep = currentLabels.filter((label: string) =>
        !Object.values(STATE_LABELS).includes(label)
      );

      // Add new state label
      const newStateLabel = STATE_LABELS[to as keyof typeof STATE_LABELS];
      if (!newStateLabel) {
        throw new Error(`Invalid state: ${to}`);
      }

      const newLabels = [...labelsToKeep, newStateLabel];

      // Update labels
      await this.octokit.issues.setLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        labels: newLabels
      });

      // Add comment if reason provided
      if (reason) {
        await this.octokit.issues.createComment({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
          body: `🔄 **State Transition**: ${to}\n\n${reason}`
        });
      }

      console.log(`✅ Successfully transitioned to: ${to}`);
    } catch (error) {
      console.error(`❌ Transition failed:`, error);
      throw error;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: TransitionOptions = {
    issue: 0,
    to: '',
    reason: undefined
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--issue' && args[i + 1]) {
      options.issue = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--to' && args[i + 1]) {
      options.to = args[i + 1];
      i++;
    } else if (args[i] === '--reason' && args[i + 1]) {
      options.reason = args[i + 1];
      i++;
    }
  }

  if (!options.issue || !options.to) {
    console.error('Error: --issue and --to parameters are required');
    console.log('Usage: npm run state:transition -- --issue <number> --to <state> [--reason <text>]');
    console.log(`Available states: ${Object.keys(STATE_LABELS).join(', ')}`);
    process.exit(1);
  }

  const manager = new StateTransition();
  manager.transition(options).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
