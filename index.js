// index.js

/**
 * @file Main entry point for the Oroswoap Farming Bot.
 * This script orchestrates the entire farming process in a continuous loop.
 */

import * as config from './src/config.js';
import * as utils from './src/utils.js';
import * as oroswap from './src/oroswap.js';
import { initializeClient } from './src/client.js';

/**
 * Runs a single, complete farming cycle (swap and add liquidity).
 * @param {object} context - The application context.
 * @param {number} cycleCount - The current cycle number.
 */
async function runCycle(context, cycleCount) {
    console.log("\n-----------------------------------------------------");
    console.log(`🚀 Starting Farming Cycle #${cycleCount} | ${new Date().toLocaleString()}`);
    console.log("-----------------------------------------------------");

    console.log("  ℹ️  Checking wallet balance...");
    const zigBalance = await utils.getFormattedBalance(context.client, context.account.address, config.ZIG_DENOM, "ZIG");
    const oroBalance = await utils.getFormattedBalance(context.client, context.account.address, config.ORO_DENOM, "ORO");
    console.log(`  💰 Current Balance: ${zigBalance}, ${oroBalance}`);
    
    await oroswap.performSwap(context.client, context.account.address);
    
    // --- [MODIFIED] Wait for a random delay between steps ---
    const stepDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_STEPS, config.MAX_DELAY_BETWEEN_STEPS);
    console.log(`     ...waiting for ${stepDelay} seconds...`);
    await utils.sleep(stepDelay * 1000);
    // --------------------------------------------------------

    await oroswap.performAddLiquidity(context.client, context.account.address);
    
    console.log(`\n🎉 Cycle #${cycleCount} completed successfully!`);
}

/**
 * The main function to start and run the bot.
 */
async function main() {
    console.log("==================================================");
    console.log("      🤖 Oroswoap Farming Bot (24/7 Mode) 🤖      ");
    console.log("==================================================");
    
    if (!config.MNEMONIC) {
        console.error("❌ FATAL: MNEMONIC phrase not found in .env file. Bot is stopping.");
        return;
    }

    // --- Get user input for the retry delay ---
    let retryDelayHours;
    while (true) {
        const userInput = await utils.askQuestion('⏰ Enter the retry delay in hours if funds are insufficient (default: 12): ');
        if (userInput.trim() === '') {
            retryDelayHours = 12;
            console.log(`   👍 Using default value: 12 hours.`);
            break;
        }
        const parsedHours = parseFloat(userInput);
        if (!isNaN(parsedHours) && parsedHours > 0) {
            retryDelayHours = parsedHours;
            console.log(`   👍 Retry delay set to ${retryDelayHours} hours.`);
            break;
        } else {
            console.log('   ❌ Invalid input. Please enter a positive number (e.g., 8, 12.5).');
        }
    }

    // --- Initialize client and start the main loop ---
    try {
        const { account, client } = await initializeClient(config.MNEMONIC, config.RPC_ENDPOINT);
        console.log(`\n🔗 Connected to wallet: ${account.address}`);
        
        let cycleCount = 1;
        const context = { client, account };

        while (true) {
            try {
                await runCycle(context, cycleCount);

                // --- [MODIFIED] Wait for a random delay before the next cycle ---
                const cycleDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_CYCLES, config.MAX_DELAY_BETWEEN_CYCLES);
                const delayMinutes = (cycleDelay / 60).toFixed(1);
                console.log(`   Waiting for ~${delayMinutes} minutes (${cycleDelay}s) before the next cycle...`);
                await utils.sleep(cycleDelay * 1000);
                // -------------------------------------------------------------
                
                cycleCount++;
            } catch (error) {
                const errorMsg = error.toString();
                console.error(`\n❌ ERROR occurred during cycle #${cycleCount}:`);
                console.error(`   ➡️  Message: ${errorMsg}`);

                if (errorMsg.includes("insufficient funds")) {
                    console.log("\n🛑 Insufficient funds detected. Probably need to use the faucet.");
                    await utils.runCountdown(retryDelayHours);
                } else {
                    console.log(`\n🔴 An unexpected error occurred. Retrying in ${config.DELAY_AFTER_ERROR} seconds...`);
                    await utils.sleep(config.DELAY_AFTER_ERROR * 1000);
                }
            }
        }
    } catch (initError) {
        console.error("❌ FATAL: Failed to initialize the client. Please check your RPC endpoint and mnemonic.");
        console.error(`   ➡️  Details: ${initError.message}`);
    }
}

main();