// src/config.js

/**
 * @file Centralized configuration for the Oroswoap Farming Bot.
 */

// Load environment variables from .env file
import 'dotenv/config';

// --- Core Configuration ---
export const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
export const MNEMONIC = process.env.MNEMONIC;

// --- Contract & Explorer ---
export const ROUTER_CONTRACT_ADDRESS = "zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg";
export const EXPLORER_URL = "https://explorer.testnet.zigchain.com/transactions/";

// --- Token Denominations ---
export const ZIG_DENOM = "uzig";
export const ORO_DENOM = "coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro";

// --- Transaction Amounts (in smallest unit) ---
export const AMOUNT_TO_SWAP = "250000";       // 0.25 ZIG
export const ZIG_AMOUNT_FOR_LP = "150000";    // 0.15 ZIG (as a base for LP calculation)

// --- Delays (in seconds) ---
export const DELAY_BETWEEN_STEPS = 15;      // Delay between swap and add liquidity
export const DELAY_BETWEEN_CYCLES = 45;     // Delay after a successful cycle
export const DELAY_AFTER_ERROR = 60;        // Delay after an unexpected error