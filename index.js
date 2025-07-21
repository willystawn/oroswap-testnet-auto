/**
 * @file Main entry point for the Oroswoap Farming Bot.
 * This script orchestrates the entire farming process in a continuous loop.
 */

import * as config from './src/config.js';
import * as utils from './src/utils.js';
import * as oroswap from './src/oroswap.js';
import { initializeClient } from './src/client.js';

/**
 * Runs a single, complete farming cycle for the account.
 * It checks balances first and decides whether to farm or remove liquidity.
 * @param {object} context - The application context containing client and account info.
 * @param {number} cycleNumber - The current cycle number for this account.
 */
async function runCycle(context, cycleNumber) {
    console.log("\n-----------------------------------------------------");
    console.log(`🚀 Starting Farming Cycle #${cycleNumber} for ${context.account.address}`);
    console.log("-----------------------------------------------------");

    // Check balances BEFORE starting the cycle to determine the action.
    console.log("  ℹ️  Checking wallet balance to determine action...");
    const rawZigBalance = await utils.getRawBalance(context.client, context.account.address, config.ZIG_DENOM);
    const rawOroBalance = await utils.getRawBalance(context.client, context.account.address, config.ORO_DENOM);
    const formattedZig = (rawZigBalance / 1000000).toFixed(4);
    const formattedOro = (rawOroBalance / 1000000).toFixed(4);
    console.log(`  💰 Current Balance: ${formattedZig} ZIG, ${formattedOro} ORO`);

    // If balance is too low, attempt to remove liquidity instead of swapping.
    if (rawZigBalance < parseInt(config.MIN_ZIG_BALANCE_FOR_CYCLE) || rawOroBalance < parseInt(config.MIN_ORO_BALANCE_FOR_CYCLE)) {
        console.log("  ⚠️  Low balance detected. Attempting to remove liquidity to refill funds.");
        const wasLiquidityRemoved = await oroswap.performRemoveLiquidity(context.client, context.account.address);
        
        if (wasLiquidityRemoved) {
            console.log("  ✅ Liquidity successfully removed. Balances will be updated for the next cycle.");
            let stepDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_STEPS, config.MAX_DELAY_BETWEEN_STEPS);
            console.log(`     ...waiting for ${stepDelay} seconds before continuing...`);
            await utils.sleep(stepDelay * 1000);
        } else {
             console.log("  ℹ️  No available liquidity to remove, or an error occurred. Will retry in the next cycle.");
        }
        // End the cycle for this account, whether liquidity was removed or not.
        return; 
    }

    // If balances are sufficient, proceed with the normal cycle.
    console.log("  ✅ Balance is sufficient. Proceeding with standard farming cycle.");

    // Step 1: Perform the original ZIG -> ORO swap
    await oroswap.performSwap(context.client, context.account.address);
    
    let stepDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_STEPS, config.MAX_DELAY_BETWEEN_STEPS);
    console.log(`     ...waiting for ${stepDelay} seconds...`);
    await utils.sleep(stepDelay * 1000);
    
    // Step 2: Perform the new ORO -> ZIG reverse swap
    await oroswap.performReverseSwap(context.client, context.account.address);

    stepDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_STEPS, config.MAX_DELAY_BETWEEN_STEPS);
    console.log(`     ...waiting for ${stepDelay} seconds...`);
    await utils.sleep(stepDelay * 1000);

    // Step 3: Perform Add Liquidity
    await oroswap.performAddLiquidity(context.client, context.account.address);
    
    console.log(`\n🎉 Cycle #${cycleNumber} completed successfully!`);
}

/**
 * The main function to start and run the bot.
 */
async function main() {
    console.log("==================================================");
    console.log("        🤖 Oroswoap Farming Bot 🤖           ");
    console.log("==================================================");

    if (!config.MNEMONIC || !config.RPC_ENDPOINT) {
        console.error("❌ FATAL: MNEMONIC or RPC_ENDPOINT is not set in your .env file. Please create and configure it.");
        return;
    }

    let mainCycleCount = 1;
    while (true) {
        try {
            console.log(`\n\n<<<<<<<<<<<<< Starting Main Loop #${mainCycleCount} >>>>>>>>>>>>>>>`);
            
            // Initialize the client for the single account from .env
            const { account, client } = await initializeClient(config.MNEMONIC, config.RPC_ENDPOINT);
            console.log(`🔗 Connected to wallet: ${account.address}`);
            
            const context = { client, account };
            await runCycle(context, mainCycleCount);

            // Wait for the next cycle after a successful run
            const cycleDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_CYCLES, config.MAX_DELAY_BETWEEN_CYCLES);
            const delayMinutes = (cycleDelay / 60).toFixed(1);
            console.log(`\n\n<<<<<<<<<<<<< Main Loop Completed >>>>>>>>>>>>>>>`);
            console.log(`   Waiting for ~${delayMinutes} minutes before starting the next loop...`);
            await utils.sleep(cycleDelay * 1000);

        } catch (error) {
            const errorMsg = error.toString();
            console.error(`\n❌ An ERROR occurred:`);
            console.error(`   ➡️  Message: ${errorMsg}`);

            let errorDelay = config.DELAY_AFTER_ERROR;

            if (errorMsg.includes("insufficient funds")) {
                console.log("   -> Insufficient funds detected. Waiting for 1 hour before retrying...");
                errorDelay = 3600; // 1 hour
            } else if (errorMsg.includes("Invalid mnemonic")) {
                console.log("   -> FATAL: The mnemonic in your .env file is invalid. Please check it. Bot will exit.");
                return;
            } else {
                 console.log(`   -> An unexpected error occurred. Retrying after ${errorDelay} seconds...`);
            }
            await utils.sleep(errorDelay * 1000);
        }
        
        mainCycleCount++;
    }
}

main();