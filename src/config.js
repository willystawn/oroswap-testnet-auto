// src/config.js

/**
 * @file Centralized configuration for the Oroswoap Farming Bot.
 */

// Load environment variables from .env file
import 'dotenv/config';

// --- Core Configuration ---
export const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
// export const MNEMONIC = process.env.MNEMONIC;

// --- Contract & Explorer ---
export const ROUTER_CONTRACT_ADDRESS = "zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg";
export const EXPLORER_URL = "https://explorer.testnet.zigchain.com/transactions/";

// --- Token Denominations ---
export const ZIG_DENOM = "uzig";
export const ORO_DENOM = "coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro";

// --- [MODIFIED] Randomized Transaction Amounts (in smallest unit) ---
// Example: "250000" means 0.25 ZIG. Bot will pick a random value between MIN and MAX.

// Amounts for ZIG -> ORO Swap
export const MIN_AMOUNT_TO_SWAP_ZIG = "200000";       // 0.20 ZIG
export const MAX_AMOUNT_TO_SWAP_ZIG = "450000";       // 0.45 ZIG

// [NEW] Amounts for ORO -> ZIG Reverse Swap
export const MIN_AMOUNT_TO_SWAP_ORO = "100000";       // 0.10 ORO
export const MAX_AMOUNT_TO_SWAP_ORO = "250000";       // 0.25 ORO

// Amounts for Adding Liquidity
export const MIN_ZIG_AMOUNT_FOR_LP = "150000";    // 0.15 ZIG
export const MAX_ZIG_AMOUNT_FOR_LP = "300000";    // 0.30 ZIG

// --- [MODIFIED] Randomized Delays (in seconds) ---
// Bot will wait for a random duration within these ranges to appear more human.
export const MIN_DELAY_BETWEEN_STEPS = 20;      // Min delay between swap and add liquidity
export const MAX_DELAY_BETWEEN_STEPS = 60;      // Max delay between swap and add liquidity

export const MIN_DELAY_BETWEEN_CYCLES = 300;    // Min delay after a successful cycle (e.g., 5 minutes)
export const MAX_DELAY_BETWEEN_CYCLES = 900;    // Max delay after a successful cycle (e.g., 15 minutes)

export const DELAY_AFTER_ERROR = 60;            // Fixed delay after an unexpected error