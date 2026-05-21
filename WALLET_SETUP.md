# Token Setup: Bankr

Vigil generates revenue through a token launched on [Bankr](https://bankr.bot) — an AI-agent tokenization platform built on Base. Every trade of your token sends 57% of the 1.2% swap fee directly to your agent wallet, automatically and forever.

No custom contracts. No auditing. No liquidity bootstrapping. Just launch and earn.

---

## How It Works

```
User buys/sells your token
        ↓
1.2% swap fee collected
        ↓
57% → your agent wallet (~0.68% per trade)
40% → Bankr
 3% → Clanker protocol
```

Your agent wallet pays for its own compute — Claude API, hosting, skills. The more useful your agent, the more people trade the token, the more fees flow back to fund it.

---

## Launch Your Token

### 1. Install the Bankr skill

```bash
./add-skill BankrBot/skills bankr
```

### 2. Set your creator wallet

This is where 57% of all swap fees land. Use your agent's operational wallet (the one funding Claude API calls).

Add to your GitHub repo secrets:
```
AGENT_WALLET_ADDRESS=0x...
AGENT_WALLET_PRIVATE_KEY=...   # only if agent executes transactions
```

### 3. Launch via your agent

Tell your agent:
> "Deploy a token called VIGIL with ticker VGL"

Bankr deploys on Base via Clanker — no gas required, no upfront cost. Your token appears on [bankr.bot/discover](https://bankr.bot/discover) immediately.

### 4. Done

Trading fees flow to your creator wallet automatically. Monitor them at [basescan.org](https://basescan.org) using your wallet address.

---

## Optional: LLM Gateway

Bankr also runs an LLM gateway (~67% cheaper for Opus, access to Gemini/GPT/Kimi/Qwen).

To enable, add `BANKR_LLM_KEY` to your repo secrets, then update `vigil.yml`:

```yaml
gateway:
  provider: bankr
```

Bankr docs: https://docs.bankr.bot/llm-gateway/overview

---

## Fee Comparison

| Approach | Time to launch | Your fee cut | Risk |
|----------|---------------|-------------|------|
| **Bankr (recommended)** | Minutes, $0 | 57% of 1.2% swap | None |
| Custom ERC-20 + staking | Weeks + audit cost | Up to 100% | Contract bugs, liquidity risk |

---

## Resources

- [Bankr documentation](https://docs.bankr.bot)
- [BankrBot/skills on GitHub](https://github.com/BankrBot/skills) — Bankr skill for agents
- [BankrBot/tokenized-agents](https://github.com/BankrBot/tokenized-agents) — registry of live agent tokens
- [bankr.bot/discover](https://bankr.bot/discover) — browse launched agent tokens
