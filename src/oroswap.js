/**
 * @file Contains core functions for interacting with the Oroswoap smart contract.
 */

import * as config from './config.js';
import { getRandomValue } from './utils.js';

/**
 * Executes a swap from ZIG to ORO using a random amount.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} senderAddress - The address of the wallet performing the swap.
 */
export async function performSwap(client, senderAddress) {
    console.log("  ⏳ [1/3] Executing SWAP (ZIG -> ORO)...");
    
    const amountToSwap = getRandomValue(config.MIN_AMOUNT_TO_SWAP_ZIG, config.MAX_AMOUNT_TO_SWAP_ZIG).toString();
    const formattedAmount = (parseInt(amountToSwap) / 1000000).toFixed(4);
    console.log(`     - Preparing to swap ${formattedAmount} ZIG...`);

    const fundsToSend = [{ denom: config.ZIG_DENOM, amount: amountToSwap }];
    const swapMsg = {
        swap: {
            offer_asset: { info: { native_token: { denom: config.ZIG_DENOM } }, amount: amountToSwap },
            max_spread: "0.1",
        },
    };

    const result = await client.execute(senderAddress, config.ROUTER_CONTRACT_ADDRESS, swapMsg, "auto", "Auto Farming by willystawn", fundsToSend);
    console.log("  ✅ SWAP successful!");
    console.log(`     ➡️  Explorer: ${config.EXPLORER_URL}${result.transactionHash}`);
}

/**
 * Executes a reverse swap from ORO to ZIG using a random amount.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} senderAddress - The address of the wallet performing the swap.
 */
export async function performReverseSwap(client, senderAddress) {
    console.log("  ⏳ [2/3] Executing REVERSE SWAP (ORO -> ZIG)...");
    
    const amountToSwap = getRandomValue(config.MIN_AMOUNT_TO_SWAP_ORO, config.MAX_AMOUNT_TO_SWAP_ORO).toString();
    const formattedAmount = (parseInt(amountToSwap) / 1000000).toFixed(4);
    console.log(`     - Preparing to swap ${formattedAmount} ORO...`);

    const fundsToSend = [{ denom: config.ORO_DENOM, amount: amountToSwap }];
    const swapMsg = {
        swap: {
            offer_asset: { info: { native_token: { denom: config.ORO_DENOM } }, amount: amountToSwap },
            max_spread: "0.1",
        },
    };

    const result = await client.execute(senderAddress, config.ROUTER_CONTRACT_ADDRESS, swapMsg, "auto", "Auto Farming by willystawn", fundsToSend);
    console.log("  ✅ REVERSE SWAP successful!");
    console.log(`     ➡️  Explorer: ${config.EXPLORER_URL}${result.transactionHash}`);
}


/**
 * Adds ZIG and a dynamically calculated amount of ORO to the liquidity pool.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} senderAddress - The address of the wallet providing liquidity.
 */
export async function performAddLiquidity(client, senderAddress) {
    console.log("  ⏳ [3/3] Adding LIQUIDITY...");
    
    const zigAmountForLp = getRandomValue(config.MIN_ZIG_AMOUNT_FOR_LP, config.MAX_ZIG_AMOUNT_FOR_LP).toString();
    const formattedZigAmount = (parseInt(zigAmountForLp) / 1000000).toFixed(4);

    // --- Smart Step: Calculate the required ORO amount based on the current pool ratio ---
    console.log(`     - Simulating pool ratio for ${formattedZigAmount} ZIG...`);
    const simulationQuery = { simulation: { offer_asset: { amount: zigAmountForLp, info: { native_token: { denom: config.ZIG_DENOM } } } } };
    const simulationResult = await client.queryContractSmart(config.ROUTER_CONTRACT_ADDRESS, simulationQuery);
    const requiredOroAmount = simulationResult.return_amount;
    console.log(`     - Required: ${(parseInt(requiredOroAmount) / 1000000).toFixed(4)} ORO`);
    // -------------------------------------------------------------------------------------

    const assets = [
        { info: { native_token: { denom: config.ORO_DENOM } }, amount: requiredOroAmount },
        { info: { native_token: { denom: config.ZIG_DENOM } }, amount: zigAmountForLp }
    ];
    const fundsForLiq = [
        { denom: config.ORO_DENOM, amount: requiredOroAmount },
        { denom: config.ZIG_DENOM, amount: zigAmountForLp }
    ];
    const liquidityMsg = { provide_liquidity: { assets: assets, slippage_tolerance: "0.1" } };
    
    const result = await client.execute(senderAddress, config.ROUTER_CONTRACT_ADDRESS, liquidityMsg, "auto", "Auto Farming by willystawn", fundsForLiq);
    console.log("  ✅ ADD LIQUIDITY successful!");
    console.log(`     ➡️  Explorer: ${config.EXPLORER_URL}${result.transactionHash}`);
}


/**
 * Removes all liquidity from the pool for the sender's account.
 * This is triggered when ZIG or ORO balance is too low to continue a cycle.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} senderAddress - The wallet address removing liquidity.
 * @returns {Promise<boolean>} True if liquidity was removed, false otherwise.
 */
export async function performRemoveLiquidity(client, senderAddress) {
    console.log("  ⏳ [ACTION] Checking for liquidity to remove...");

    try {
        const lpTokenBalance = await client.getBalance(senderAddress, config.LP_TOKEN_DENOM);
        const lpAmount = parseInt(lpTokenBalance?.amount || '0');

        if (lpAmount <= 0) {
            console.log("     - No LP tokens found. Nothing to remove.");
            return false;
        }

        console.log(`     - Found ${lpAmount} LP tokens. Preparing to remove liquidity...`);

        const removeLiqMsg = {
            withdraw_liquidity: {},
        };
        const fundsToSend = [
            {
                denom: config.LP_TOKEN_DENOM,
                amount: lpAmount.toString(),
            },
        ];

        const result = await client.execute(
            senderAddress,
            config.ROUTER_CONTRACT_ADDRESS,
            removeLiqMsg,
            "auto",
            "Removing pool Liquidity",
            fundsToSend
        );

        console.log("  ✅ REMOVE LIQUIDITY successful!");
        console.log(`     ➡️  Explorer: ${config.EXPLORER_URL}${result.transactionHash}`);
        return true;
    } catch (error) {
        console.error("  ❌ FAILED to remove liquidity.");
        console.error(`     - Reason: ${error.message}`);
        return false;
    }
}