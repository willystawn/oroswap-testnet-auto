# Oroswoap Testnet Farming Bot

An automated bot to perform daily Swap and Add Liquidity tasks on the [Oroswoap Testnet](https://testnet.oroswap.org/) for the Zigchain network. This tool is designed for airdrop farming and network testing purposes.

---

## 🚨 SECURITY WARNING 🚨

**DO NOT USE A WALLET THAT CONTAINS REAL ASSETS.**

This script requires your wallet's 12 or 24-word Mnemonic Phrase to function. Anyone with access to this phrase can steal all your funds.

- ✅ **ALWAYS** create brand new, empty **"burner" wallets** exclusively for this bot and other airdrop activities.
- ❌ **NEVER** use the mnemonic phrase from your main wallet where you store your valuable assets.

You are solely responsible for the security of your funds.

---

## 🚀 Join Our Airdrop Community!

If you find this bot helpful, stay updated on the latest airdrops, testnets, and crypto opportunities by joining our Telegram channel!

➡️ **Join [Airdrop For Everyone ID](https://t.me/airdropforeveryoneid) on Telegram!** ⬅️

Let's hunt for airdrops together!

---

## Features

-   **Multi-Account Support:** Automatically farms for multiple wallets listed in a `mnemonics.txt` file.
-   **Continuous Farming:** Runs in a 24/7 loop, cycling through all your accounts to maximize on-chain interactions.
-   **Automated Swap:** Swaps ZIG for ORO automatically.
-   **Automated Reverse Swap:** Swaps ORO back to ZIG to complete the transaction cycle.
-   **Smart Liquidity Provision:** Dynamically calculates the correct token ratio before adding liquidity to prevent errors.
-   **Intelligent Error Handling:**
    -   Detects "insufficient funds" errors and automatically skips the account until the next main loop (ideal for faucet cooldowns).
    -   Retries on temporary network errors.
-   **Configurable:** Easily change transaction amounts, contract addresses, and delays in a central config file.
-   **Interactive Setup:** Prompts the user to set the retry delay on startup.
-   **Professional Logging:** Clear, emoji-enhanced logs with direct links to transactions on the explorer.
-   **Modular Codebase:** Clean, organized, and easy-to-understand project structure.

---

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16.x or later recommended)
-   [Git](https://git-scm.com/)

---

## Installation & Setup

**1. Clone the Repository**

Open your terminal and clone this project:

```bash
git clone https://github.com/your-username/oroswap-bot.git
cd oroswap-bot
```
*(Replace `your-username` with your actual GitHub username)*

**2. Install Dependencies**

Install the required Node.js packages:

```bash
npm install
```

**3. Prepare Your Wallets**

- Create as many burner wallets as you want to farm with.
- Save each wallet's 12 or 24-word mnemonic phrase on a separate line in a file named `mnemonics.txt` in the project root.
- **Example `mnemonics.txt`:**
    ```
    word1 word2 word3 ... phrase for account 1
    brick apple table ... phrase for account 2
    another long silly ... phrase for account 3
    ```
- **Never use your main wallet!**

**4. Configure the Environment File**

Create a `.env` file in the root of the project. You can copy the example file if it exists, or create a new one.

```bash
# If .env.example exists:
cp .env.example .env

# Otherwise, create a new file:
touch .env
```

Now, open the `.env` file with a text editor and fill in your details:

```env
# The RPC endpoint for the Zigchain Testnet
RPC_ENDPOINT="https://testnet-rpc.zigchain.com"
```

> **Where to get your details:**
>
> -   **RPC_ENDPOINT:** The provided URL is usually correct. If it fails, check the official Zigchain/Oroswoap Discord or documentation for an updated one.

**5. Fund Your Burner Wallets**

Before running the bot, each burner wallet needs some ZIG tokens to pay for transactions.

-   Go to the Zigchain Testnet Faucet: **https://faucet.zigchain.com/**
-   Paste each burner wallet's address (which starts with `zig...`) and request tokens.

---

## Running the Bot

To start the bot, simply run the following command from the project's root directory:

```bash
npm start
```

OR

```bash
node index.js
```

The bot will first ask you to set the retry delay (in hours) for when an account runs out of funds. You can press Enter to use the default (12 hours) or type your own value.

```
⏰ Enter the retry delay in hours if funds are insufficient (default: 12):
```

After that, the bot will process all accounts in your `mnemonics.txt` file and begin its farming cycles. You can leave it running in a terminal window or use a process manager like `pm2` for long-term execution on a server.

---

## ❤️ Support My Work

I build open-source tools like this to help the airdrop community.

If you find this bot useful, please consider making a donation. Your support directly funds the development of more bots for future airdrops.

-   **EVM (ETH, BSC, etc.):**
    `0x547C150ad0854f53BCefdAE1B6ec4dbB97Cb8349`

-   **SOL (Solana):**
    `FCiMDNSRbidsSb63tjEFEK3xQxQyAtPdANaSuaCJcNBQ`

Thank you! 🙏

---

## Community & Support

This bot was created and is maintained by the **Airdrop For Everyone ID** community. For airdrop news, discussions, and support for our tools, please join us!

-   **Telegram Channel:** [https://t.me/airdropforeveryoneid](https://t.me/airdropforeveryoneid)
-   **GitHub Issues:** For technical problems or bug reports with the bot, please [open an issue](https://github.com/willystawn/oroswap-bot/issues) on this repository.

---

## Project Structure

```
/
├── .env              # Your private environment variables (RPC endpoint)
├── .gitignore        # Specifies files for Git to ignore
├── mnemonics.txt     # List of burner wallet mnemonics (one per line)
├── README.md         # This file
├── package.json      # Project dependencies and scripts
├── index.js          # Main application entry point
└── src/
    ├── client.js     # Handles wallet and blockchain client initialization
    ├── config.js     # Central configuration file
    ├── oroswap.js    # Core logic for Oroswoap interactions (swap, add LP)
    └── utils.js      # Helper functions (sleep, countdown, user input)
```

---

## Disclaimer

This software is provided "as is", without warranty of any kind. The author or contributors are not responsible for any losses or damages. Use at your own risk. This is a tool for interacting with a testnet and should not be used on a mainnet without extensive review and modification.