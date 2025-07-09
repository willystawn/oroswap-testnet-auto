// index.js

/**
 * @file Main entry point for the Oroswoap Farming Bot.
 * This script orchestrates the entire farming process in a continuous loop FOR MULTIPLE ACCOUNTS.
 */

import fs from 'fs';
import * as config from './src/config.js';
import * as utils from './src/utils.js';
import * as oroswap from './src/oroswap.js';
import { initializeClient } from './src/client.js';

/**
 * Runs a single, complete farming cycle (swap, reverse swap, and add liquidity).
 * @param {object} context - The application context containing client and account info.
 * @param {number} cycleNumber - The current cycle number for this account.
 */
async function runCycle(context, cycleNumber) {
    console.log("\n-----------------------------------------------------");
    console.log(`🚀 Starting Farming Cycle #${cycleNumber} for ${context.account.address}`);
    console.log("-----------------------------------------------------");

    console.log("  ℹ️  Checking wallet balance...");
    const zigBalance = await utils.getFormattedBalance(context.client, context.account.address, config.ZIG_DENOM, "ZIG");
    const oroBalance = await utils.getFormattedBalance(context.client, context.account.address, config.ORO_DENOM, "ORO");
    console.log(`  💰 Current Balance: ${zigBalance}, ${oroBalance}`);
    
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
    
    console.log(`\n🎉 Cycle #${cycleNumber} for ${context.account.address} completed successfully!`);
}

/**
 * The main function to start and run the bot.
 */
async function main() {
    console.log("==================================================");
    console.log("   🤖 Oroswoap Multi-Account Farming Bot 🤖    ");
    console.log("==================================================");

    // [MODIFIKASI] Baca semua mnemonic dari file mnemonics.txt
    let mnemonics;
    try {
        mnemonics = fs.readFileSync('mnemonics.txt', 'utf-8').split('\n').filter(Boolean);
        if (mnemonics.length === 0) {
            console.error("❌ FATAL: File 'mnemonics.txt' is empty or not found. Please create it and add your mnemonic phrases.");
            return;
        }
        console.log(`✅ Found ${mnemonics.length} account(s) in mnemonics.txt.`);
    } catch (error) {
        console.error("❌ FATAL: Could not read 'mnemonics.txt'. Make sure the file exists in the same directory as index.js.");
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

    // [MODIFIKASI] Loop utama yang berjalan selamanya
    let mainCycleCount = 1;
    while (true) {
        console.log(`\n\n<<<<<<<<<<<<< Starting Main Loop #${mainCycleCount} >>>>>>>>>>>>>>>`);
        
        // [MODIFIKASI] Loop untuk setiap akun/mnemonic
        for (let i = 0; i < mnemonics.length; i++) {
            const mnemonic = mnemonics[i];
            const accountIndex = i + 1;
            console.log(`\n=============== PROCESSING ACCOUNT ${accountIndex}/${mnemonics.length} ===============`);
            
            try {
                // Inisialisasi client untuk akun saat ini
                const { account, client } = await initializeClient(mnemonic, config.RPC_ENDPOINT);
                console.log(`🔗 Connected to wallet: ${account.address}`);
                
                const context = { client, account };
                await runCycle(context, mainCycleCount);

            } catch (error) {
                const errorMsg = error.toString();
                console.error(`\n❌ ERROR occurred on account ${accountIndex}:`);
                console.error(`   ➡️  Message: ${errorMsg}`);

                if (errorMsg.includes("insufficient funds")) {
                    console.log("   -> Insufficient funds detected for this account. It will be skipped until the next main loop.");
                    // Jika dana tidak cukup, kita lanjutkan ke akun berikutnya
                } else if (errorMsg.includes("Mnemonic and RPC Endpoint must be provided") || errorMsg.includes("Invalid mnemonic")) {
                    console.log("   -> Invalid mnemonic phrase detected. Please check your mnemonics.txt file.");
                }
                else {
                    console.log(`   -> An unexpected error occurred. Retrying this account after ${config.DELAY_AFTER_ERROR} seconds...`);
                    await utils.sleep(config.DELAY_AFTER_ERROR * 1000);
                    i--; // Coba lagi akun yang sama setelah delay
                }
            }
            // Tambahkan jeda singkat antar akun agar tidak terlalu cepat
            if (i < mnemonics.length - 1) {
                const delayBetweenAccounts = 10; // 10 detik
                console.log(`\n-- Waiting ${delayBetweenAccounts}s before processing next account --`);
                await utils.sleep(delayBetweenAccounts * 1000);
            }
        }

        mainCycleCount++;
        const cycleDelay = utils.getRandomValue(config.MIN_DELAY_BETWEEN_CYCLES, config.MAX_DELAY_BETWEEN_CYCLES);
        const delayMinutes = (cycleDelay / 60).toFixed(1);
        console.log(`\n\n<<<<<<<<<<<<< Main Loop Completed >>>>>>>>>>>>>>>`);
        console.log(`   All accounts processed. Waiting for ~${delayMinutes} minutes before starting the next main loop...`);
        await utils.sleep(cycleDelay * 1000);
    }
}

main();