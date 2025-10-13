/**
 * Cost Monitoring Dashboard CLI
 *
 * View AI usage costs and statistics
 */

import { CostTracker } from '../src/monitoring/cost-tracker.js';
import * as dotenv from 'dotenv';

dotenv.config();

const tracker = new CostTracker();

function displayDashboard() {
  console.log('\n📊 AI Cost Monitoring Dashboard');
  console.log('='.repeat(60));

  // Today's summary
  const dailySummary = tracker.calculateDailySummary();
  console.log('\n📅 Today\'s Usage:');
  console.log(`   Date: ${dailySummary.date}`);
  console.log(`   Gemini: ${dailySummary.geminiRequests} requests ($${dailySummary.costByProvider.gemini.toFixed(4)})`);
  console.log(`   GPT-5 nano: ${dailySummary.gpt5NanoRequests} requests ($${dailySummary.costByProvider['gpt-5-nano'].toFixed(4)})`);
  console.log(`   GPT-5 mini: ${dailySummary.gpt5MiniRequests} requests ($${dailySummary.costByProvider['gpt-5-mini'].toFixed(4)})`);
  console.log(`   Total Cost: $${dailySummary.totalCost.toFixed(4)}`);

  // Gemini limit check
  const geminiLimit = tracker.checkGeminiLimit();
  console.log('\n🔋 Gemini Free Tier Status:');
  console.log(`   ${geminiLimit.message}`);

  // This month's summary
  const monthlySummary = tracker.calculateMonthlySummary();
  console.log('\n📊 This Month\'s Usage:');
  console.log(`   Month: ${monthlySummary.date}`);
  console.log(`   Total Requests: ${monthlySummary.geminiRequests + monthlySummary.gpt5NanoRequests + monthlySummary.gpt5MiniRequests}`);
  console.log(`   Total Cost: $${monthlySummary.totalCost.toFixed(4)}`);
  console.log(`   By Provider:`);
  console.log(`     - Gemini: ${monthlySummary.geminiRequests} requests`);
  console.log(`     - GPT-5 nano: ${monthlySummary.gpt5NanoRequests} requests ($${monthlySummary.costByProvider['gpt-5-nano'].toFixed(4)})`);
  console.log(`     - GPT-5 mini: ${monthlySummary.gpt5MiniRequests} requests ($${monthlySummary.costByProvider['gpt-5-mini'].toFixed(4)})`);

  // Last 7 days report
  console.log('\n📈 Last 7 Days Report:');
  const report = tracker.generateReport(7);
  console.log(report);

  console.log('\n='.repeat(60));
  console.log('🌸 Miyabi Cost Monitoring System');
  console.log('Run "npm run cost:dashboard" to refresh\n');
}

displayDashboard();
