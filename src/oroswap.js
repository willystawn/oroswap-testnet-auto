// src/oroswap.js

/**
 * @file Contains core functions for interacting with the Oroswoap smart contract.
 */

import * as config from './config.js';

/**
 * Executes a swap from ZIG to ORO.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} senderAddress - The address of the wallet performing the swap.
 */
export async function performSwap(client, senderAddress) {
    console.log("  ⏳ [1/2] Executing SWAP...");
    const fundsToSend = [{ denom: config.ZIG_DENOM, amount: config.AMOUNT_TO_SWAP }];
    const swapMsg = {
        swap: {
            offer_asset: { info: { native_token: { denom: config.ZIG_DENOM } }, amount: config.AMOUNT_TO_SWAP },
            max_spread: "0.1",
        },
    };

    const result = await client.execute(senderAddress, config.ROUTER_CONTRACT_ADDRESS, swapMsg, "auto", "Auto Farming by Pro Bot", fundsToSend);
    console.log("  ✅ SWAP successful!");
    console.log(`     ➡️  Explorer: ${config.EXPLORER_URL}${result.transactionHash}`);
}

/**
 * Adds ZIG and a dynamically calculated amount of ORO to the liquidity pool.
 * @param {import('@cosmjs/cosmwasm-stargate').SigningCosmWasmClient} client - The signing client.
 * @param {string} senderAddress - The address of the wallet providing liquidity.
 */
export async function performAddLiquidity(client, senderAddress) {
    console.log("  ⏳ [2/2] Adding LIQUIDITY...");
    
    // --- Smart Step: Calculate the required ORO amount based on the current pool ratio ---
    console.log(`     - Simulating pool ratio for ${parseInt(config.ZIG_AMOUNT_FOR_LP) / 1000000} ZIG...`);
    const simulationQuery = { simulation: { offer_asset: { amount: config.ZIG_AMOUNT_FOR_LP, info: { native_token: { denom: config.ZIG_DENOM } } } } };
    const simulationResult = await client.queryContractSmart(config.ROUTER_CONTRACT_ADDRESS, simulationQuery);
    const requiredOroAmount = simulationResult.return_amount;
    console.log(`     - Required: ${(parseInt(requiredOroAmount) / 1000000).toFixed(4)} ORO`);
    // -------------------------------------------------------------------------------------

    const assets = [
        { info: { native_token: { denom: config.ORO_DENOM } }, amount: requiredOroAmount },
        { info: { native_token: { denom: config.ZIG_DENOM } }, amount: config.ZIG_AMOUNT_FOR_LP }
    ];
    const fundsForLiq = [
        { denom: config.ORO_DENOM, amount: requiredOroAmount },
        { denom: config.ZIG_DENOM, amount: config.ZIG_AMOUNT_FOR_LP }
    ];
    const liquidityMsg = { provide_liquidity: { assets: assets, slippage_tolerance: "0.1" } };
    
    const result = await client.execute(senderAddress, config.ROUTER_CONTRACT_ADDRESS, liquidityMsg, "auto", "Auto Farming by Pro Bot", fundsForLiq);
    console.log("  ✅ ADD LIQUIDITY successful!");
    console.log(`     ➡️  Explorer: ${config.EXPLORER_URL}${result.transactionHash}`);
}