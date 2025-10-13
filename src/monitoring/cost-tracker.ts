/**
 * Cost Tracking and Monitoring System
 *
 * Tracks AI API usage and costs across Gemini and GPT-5 providers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UsageRecord {
  timestamp: string;
  provider: 'gemini' | 'gpt-5-nano' | 'gpt-5-mini';
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  issueNumber?: number;
  operation: string;
}

export interface DailySummary {
  date: string;
  geminiRequests: number;
  gpt5NanoRequests: number;
  gpt5MiniRequests: number;
  totalCost: number;
  costByProvider: {
    gemini: number;
    'gpt-5-nano': number;
    'gpt-5-mini': number;
  };
}

export class CostTracker {
  private logFilePath: string;
  private summaryFilePath: string;

  constructor(logDir: string = path.join(__dirname, '../../.cost-logs')) {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logFilePath = path.join(logDir, 'usage.jsonl');
    this.summaryFilePath = path.join(logDir, 'daily-summary.json');
  }

  /**
   * Record API usage
   */
  recordUsage(record: Omit<UsageRecord, 'timestamp'>): void {
    const fullRecord: UsageRecord = {
      ...record,
      timestamp: new Date().toISOString()
    };

    // Append to JSONL log file
    const line = JSON.stringify(fullRecord) + '\n';
    fs.appendFileSync(this.logFilePath, line);
  }

  /**
   * Get usage records for a specific date range
   */
  getUsageRecords(startDate?: Date, endDate?: Date): UsageRecord[] {
    if (!fs.existsSync(this.logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(this.logFilePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);

    let records = lines.map(line => JSON.parse(line) as UsageRecord);

    if (startDate) {
      records = records.filter(r => new Date(r.timestamp) >= startDate);
    }

    if (endDate) {
      records = records.filter(r => new Date(r.timestamp) <= endDate);
    }

    return records;
  }

  /**
   * Calculate daily summary
   */
  calculateDailySummary(date: Date = new Date()): DailySummary {
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr + 'T00:00:00Z');
    const endOfDay = new Date(dateStr + 'T23:59:59Z');

    const records = this.getUsageRecords(startOfDay, endOfDay);

    const summary: DailySummary = {
      date: dateStr,
      geminiRequests: 0,
      gpt5NanoRequests: 0,
      gpt5MiniRequests: 0,
      totalCost: 0,
      costByProvider: {
        gemini: 0,
        'gpt-5-nano': 0,
        'gpt-5-mini': 0
      }
    };

    for (const record of records) {
      summary.totalCost += record.cost;
      summary.costByProvider[record.provider] += record.cost;

      if (record.provider === 'gemini') {
        summary.geminiRequests++;
      } else if (record.provider === 'gpt-5-nano') {
        summary.gpt5NanoRequests++;
      } else if (record.provider === 'gpt-5-mini') {
        summary.gpt5MiniRequests++;
      }
    }

    return summary;
  }

  /**
   * Calculate monthly summary
   */
  calculateMonthlySummary(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): DailySummary {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const records = this.getUsageRecords(startOfMonth, endOfMonth);

    const summary: DailySummary = {
      date: `${year}-${String(month).padStart(2, '0')}`,
      geminiRequests: 0,
      gpt5NanoRequests: 0,
      gpt5MiniRequests: 0,
      totalCost: 0,
      costByProvider: {
        gemini: 0,
        'gpt-5-nano': 0,
        'gpt-5-mini': 0
      }
    };

    for (const record of records) {
      summary.totalCost += record.cost;
      summary.costByProvider[record.provider] += record.cost;

      if (record.provider === 'gemini') {
        summary.geminiRequests++;
      } else if (record.provider === 'gpt-5-nano') {
        summary.gpt5NanoRequests++;
      } else if (record.provider === 'gpt-5-mini') {
        summary.gpt5MiniRequests++;
      }
    }

    return summary;
  }

  /**
   * Save daily summary to file
   */
  saveDailySummary(): void {
    const today = this.calculateDailySummary();

    let summaries: DailySummary[] = [];
    if (fs.existsSync(this.summaryFilePath)) {
      const content = fs.readFileSync(this.summaryFilePath, 'utf-8');
      summaries = JSON.parse(content);
    }

    // Update or add today's summary
    const existingIndex = summaries.findIndex(s => s.date === today.date);
    if (existingIndex >= 0) {
      summaries[existingIndex] = today;
    } else {
      summaries.push(today);
    }

    fs.writeFileSync(this.summaryFilePath, JSON.stringify(summaries, null, 2));
  }

  /**
   * Get all saved daily summaries
   */
  getDailySummaries(): DailySummary[] {
    if (!fs.existsSync(this.summaryFilePath)) {
      return [];
    }

    const content = fs.readFileSync(this.summaryFilePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Generate cost report
   */
  generateReport(days: number = 7): string {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = this.getUsageRecords(startDate, endDate);

    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const geminiCount = records.filter(r => r.provider === 'gemini').length;
    const gpt5NanoCount = records.filter(r => r.provider === 'gpt-5-nano').length;
    const gpt5MiniCount = records.filter(r => r.provider === 'gpt-5-mini').length;

    const costByProvider = {
      gemini: records.filter(r => r.provider === 'gemini').reduce((sum, r) => sum + r.cost, 0),
      'gpt-5-nano': records.filter(r => r.provider === 'gpt-5-nano').reduce((sum, r) => sum + r.cost, 0),
      'gpt-5-mini': records.filter(r => r.provider === 'gpt-5-mini').reduce((sum, r) => sum + r.cost, 0)
    };

    return `
📊 Cost Report (Last ${days} Days)
==================================

Total Requests: ${records.length}
Total Cost: $${totalCost.toFixed(4)}

By Provider:
- Gemini: ${geminiCount} requests ($${costByProvider.gemini.toFixed(4)})
- GPT-5 nano: ${gpt5NanoCount} requests ($${costByProvider['gpt-5-nano'].toFixed(4)})
- GPT-5 mini: ${gpt5MiniCount} requests ($${costByProvider['gpt-5-mini'].toFixed(4)})

Average Cost per Request: $${(totalCost / records.length || 0).toFixed(6)}

Date Range: ${startDate.toLocaleDateString('ja-JP')} - ${endDate.toLocaleDateString('ja-JP')}
`.trim();
  }

  /**
   * Check if Gemini free tier limit is approaching
   */
  checkGeminiLimit(): { warning: boolean; remaining: number; message: string } {
    const today = this.calculateDailySummary();
    const remaining = 1500 - today.geminiRequests;
    const warning = remaining < 300; // Warn when less than 300 requests remaining

    let message = `Gemini: ${today.geminiRequests}/1500 requests used today (${remaining} remaining)`;
    if (warning) {
      message += ' ⚠️ Approaching daily limit!';
    }

    return { warning, remaining, message };
  }

  /**
   * Get recent usage records (most recent first)
   */
  getRecentUsage(limit: number = 100): UsageRecord[] {
    if (!fs.existsSync(this.logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(this.logFilePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);

    const records = lines.map(line => JSON.parse(line) as UsageRecord);

    // Return most recent records first
    return records.reverse().slice(0, limit);
  }
}
