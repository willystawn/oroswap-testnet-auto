/**
 * @file Contains utility functions for the bot, such as delays and user input.
 */

import readline from 'readline';

/**
 * Generates a random integer between a min and max value (inclusive).
 * This is the core function for making the bot's behavior random.
 * @param {number|string} min - The minimum value.
 * @param {number|string} max - The maximum value.
 * @returns {number} A random integer within the range.
 */
export function getRandomValue(min, max) {
    const minVal = parseInt(min);
    const maxVal = parseInt(max);
    if (minVal > maxVal) {
        throw new Error(`Min value ${minVal} cannot be greater than Max value ${maxVal}.`);
    }
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

/**
 * Pauses execution for a specified duration.
 * @param {number} ms - The duration to sleep in milliseconds.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Prompts the user with a question in the console and waits for their input.
 * @param {string} query - The question to display to the user.
 * @returns {Promise<string>} The user's answer.
 */
export function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

/**
 * Gets the raw integer balance of a specific token.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} address - The wallet address.
 * @param {string} denom - The token denomination.
 * @returns {Promise<number>} The raw integer balance. Returns 0 on error.
 */
export async function getRawBalance(client, address, denom) {
    try {
        const balance = await client.getBalance(address, denom);
        return parseInt(balance?.amount || '0');
    } catch (e) {
        // This error often occurs if an account has never held the token, so returning 0 is safe.
        return 0;
    }
}

/**
 * Fetches and formats the balance of a specific token for an address.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} address - The wallet address.
 * @param {string} denom - The token denomination.
 * @param {string} symbol - The token's symbol (e.g., "ZIG").
 * @returns {Promise<string>} The formatted balance string.
 */
export async function getFormattedBalance(client, address, denom, symbol) {
    try {
        const balance = await client.getBalance(address, denom);
        return `${(parseInt(balance?.amount || '0') / 1000000).toFixed(4)} ${symbol}`;
    } catch (e) {
        return `0.0000 ${symbol}`;
    }
}