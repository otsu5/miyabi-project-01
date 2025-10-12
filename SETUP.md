# Miyabi Project Setup Guide

## ✅ Completed Setup

The following has been configured:

- ✅ AI Provider Manager (Gemini + GPT-5 nano fallback)
- ✅ Parallel Agent Executor
- ✅ State Transition Manager
- ✅ GitHub Actions Workflows (14 workflows)
- ✅ Project structure and dependencies

## 🔑 Required: GitHub Secrets Configuration

To enable AI agents in GitHub Actions, configure these secrets:

### Step 1: Navigate to GitHub Settings

1. Go to: https://github.com/otsu5/miyabi-project-01/settings/secrets/actions
2. Click **"New repository secret"**

### Step 2: Add Required Secrets

Add the following secrets (copy from `.env` file):

#### GEMINI_API_KEY
```
Name: GEMINI_API_KEY
Value: [Copy from your .env file]
```

#### OPENAI_API_KEY
```
Name: OPENAI_API_KEY
Value: [Copy from your .env file]
```

#### ANTHROPIC_API_KEY (Optional)
```
Name: ANTHROPIC_API_KEY
Value: [Copy from your .env file]
```

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions, no manual setup needed.

## 🚀 Usage

### Method 1: Create Issue with Label

1. Create an Issue on GitHub
2. Add label `🤖agent-execute`
3. AI agents will automatically process the issue

### Method 2: Comment Command

1. Create an Issue on GitHub
2. Comment `/agent` on the issue
3. AI agents will start working

### Method 3: Manual Workflow Trigger

1. Go to Actions tab
2. Select "Autonomous Agent Execution" workflow
3. Click "Run workflow"
4. Enter issue number

## 💰 Cost Optimization

**Current Configuration:**
- **Primary**: Gemini 1.5 Flash (Free tier: 1,500 requests/day)
- **Fallback 1**: GPT-5 nano ($0.0005 per issue)
- **Fallback 2**: GPT-5 mini ($0.0025 per issue)

**Estimated Monthly Costs:**
- 100 issues/month: **$0** (within free tier)
- 1,000 issues/month: **$0** (within free tier)
- 10,000 issues/month: **$0** (within free tier)
- 50,000 issues/month: **~$15** (30,000 × $0.0005)

## 📊 Workflow

```
Issue Created
  ↓
GitHub Actions Triggered
  ↓
IssueAgent: Auto-label (type, priority, state)
  ↓
CoordinatorAgent: Analyze and create task plan
  ↓
CodeGenAgent: Generate code (using Gemini/GPT-5)
  ↓
ReviewAgent: Quality check
  ↓
TestAgent: Run tests
  ↓
PRAgent: Create Draft PR
  ↓
Human Review → Approve → Merge
  ↓
DeploymentAgent: Auto-deploy (optional)
```

## 🔍 Verify Setup

After adding secrets, test the system:

1. Create a simple issue:
   ```
   Title: Test: Add hello world function
   Body: Create a simple hello world function in src/hello.ts
   ```

2. Add label `🤖agent-execute`

3. Check Actions tab for workflow execution

4. Review the generated Draft PR

## 📝 Local Development

```bash
# Run type check
npm run typecheck

# Build project
npm run build

# Run tests
npm test

# Check project status
npx miyabi status
```

## 🛠️ Troubleshooting

### Issue: Workflow not triggering
- Verify secrets are correctly set
- Check that label name matches exactly: `🤖agent-execute`
- Review Actions tab for error logs

### Issue: AI generation fails
- Check API key validity
- Verify API quota not exceeded
- Review workflow logs for specific errors

### Issue: Secrets not working
- Ensure no trailing spaces in secret values
- Verify secret names match exactly (case-sensitive)
- Re-create secrets if needed

## 📚 Additional Resources

- [Miyabi Framework Documentation](https://github.com/ShunsukeHayashi/Autonomous-Operations)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

🌸 **Miyabi** - Beauty in Autonomous Development
