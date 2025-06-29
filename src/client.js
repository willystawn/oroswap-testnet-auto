// src/client.js

/**
 * @file Handles the initialization of the wallet and CosmWasm client.
 */

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";

/**
 * Initializes and connects to the blockchain.
 * @param {string} mnemonic - The wallet's mnemonic phrase.
 * @param {string} rpcEndpoint - The RPC endpoint of the chain.
 * @returns {Promise<{account: object, client: SigningCosmWasmClient}>} An object containing the account and the signing client.
 */
export async function initializeClient(mnemonic, rpcEndpoint) {
    if (!mnemonic || !rpcEndpoint) {
        throw new Error("Mnemonic and RPC Endpoint must be provided.");
    }
    
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "zig" });
    const [account] = await wallet.getAccounts();
    const gasPrice = GasPrice.fromString("0.025uzig");
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet, { gasPrice });

    return { account, client };
}