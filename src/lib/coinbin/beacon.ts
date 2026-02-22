/**
 * Coinbin Beacon Library
 * Pure client-side Bitcoin signing and broadcasting
 * 
 * Compatible with: Legacy (1...) and SegWit Native (bc1...)
 */

import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Initialize ECPair with ECC library
const ECPair = ECPairFactory(ecc);

// Network configuration
const network = bitcoin.networks.bitcoin;

// ============================================================================
// Interfaces
// ============================================================================

export interface UTXO {
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
}

export interface BeaconTransaction {
    rawTx: string;
    txid: string;
    fee: number;
    opReturn: string;
}

export interface BeaconWallet {
    wif: string;
    address: string;
    publicKey: string;
}

// ============================================================================
// Wallet Functions
// ============================================================================

/**
 * Generates a new random beacon wallet
 */
export function generateBeaconWallet(): BeaconWallet {
    const keyPair = ECPair.makeRandom({ network });
    const wif = keyPair.toWIF();
    
    // Try SegWit first (bc1...)
    const { address: segwitAddress } = bitcoin.payments.p2wpkh({ 
        pubkey: Buffer.from(keyPair.publicKey), 
        network 
    });
    
    if (segwitAddress) {
        return {
            wif,
            address: segwitAddress,
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        };
    }
    
    // Fallback to Legacy (1...)
    const { address: legacyAddress } = bitcoin.payments.p2pkh({ 
        pubkey: Buffer.from(keyPair.publicKey), 
        network 
    });
    
    return {
        wif,
        address: legacyAddress!,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    };
}

/**
 * Loads a wallet from WIF
 */
export function loadWalletFromWif(wif: string): BeaconWallet {
    const keyPair = ECPair.fromWIF(wif, network);
    
    // Try SegWit first
    const { address: segwitAddress } = bitcoin.payments.p2wpkh({ 
        pubkey: Buffer.from(keyPair.publicKey), 
        network 
    });
    
    if (segwitAddress) {
        return {
            wif,
            address: segwitAddress,
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        };
    }
    
    // Fallback to Legacy
    const { address: legacyAddress } = bitcoin.payments.p2pkh({ 
        pubkey: Buffer.from(keyPair.publicKey), 
        network 
    });
    
    return {
        wif,
        address: legacyAddress!,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    };
}

// ============================================================================
// Blockchain Functions
// ============================================================================

const MEMPOOL_API = 'https://mempool.space/api';

/**
 * Fetches UTXOs for an address
 */
export async function fetchUtxos(address: string): Promise<UTXO[]> {
    try {
        const response = await fetch(`${MEMPOOL_API}/address/${address}/utxo`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch UTXOs: ${response.status}`);
        }
        
        const utxos = await response.json();
        
        // Enrich with scriptPubKey
        const enrichedUtxos = await Promise.all(
            utxos.map(async (utxo: any) => {
                try {
                    const txResponse = await fetch(`${MEMPOOL_API}/tx/${utxo.txid}`);
                    const txData = await txResponse.json();
                    const vout = txData.vout[utxo.vout];
                    
                    return {
                        txid: utxo.txid,
                        vout: utxo.vout,
                        value: utxo.value,
                        scriptPubKey: vout.scriptpubkey,
                    };
                } catch {
                    return null;
                }
            })
        );
        
        return enrichedUtxos.filter((utxo): utxo is UTXO => utxo !== null);
    } catch (error) {
        console.error('Error fetching UTXOs:', error);
        return [];
    }
}

/**
 * Fetches address balance
 */
export async function fetchBalance(address: string): Promise<number> {
    try {
        const response = await fetch(`${MEMPOOL_API}/address/${address}`);
        
        if (!response.ok) {
            return 0;
        }
        
        const data = await response.json();
        return data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum || 0;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}

/**
 * Broadcasts a transaction
 */
export async function broadcastTransaction(rawTx: string): Promise<string> {
    const response = await fetch(`${MEMPOOL_API}/tx`, {
        method: 'POST',
        body: rawTx,
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Broadcast failed: ${error}`);
    }
    
    return response.text(); // Returns txid
}

/**
 * Gets current block height
 */
export async function getBlockHeight(): Promise<number> {
    try {
        const response = await fetch(`${MEMPOOL_API}/blocks/tip/height`);
        
        if (!response.ok) {
            return 0;
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching block height:', error);
        return 0;
    }
}

// ============================================================================
// Transaction Building
// ============================================================================

/**
 * Construye y firma una transacción OP_RETURN.
 * COMPATIBLE CON: Legacy (1...) y SegWit Nativo (bc1...)
 */
export function buildAndSignBeacon(
    wif: string,
    utxos: UTXO[],
    message: string,
    feeRate: number = 10
): BeaconTransaction {
    
    const keyPair = ECPair.fromWIF(wif, network);
    const psbt = new bitcoin.Psbt({ network });

    const totalValue = utxos.reduce((sum, u) => sum + u.value, 0);

    // 1. DETECCIÓN DE TIPO DE WALLET (LEGACY vs SEGWIT)
    const { address: possibleBc1 } = bitcoin.payments.p2wpkh({ 
        pubkey: Buffer.from(keyPair.publicKey), 
        network 
    });
    const { address: possibleLegacy } = bitcoin.payments.p2pkh({ 
        pubkey: Buffer.from(keyPair.publicKey), 
        network 
    });

    // Verificamos si el scriptPubKey del UTXO coincide con SegWit o Legacy
    const isSegWit = utxos[0].scriptPubKey.startsWith('0014'); // '0014' es el prefijo estándar de P2WPKH

    // 2. AGREGAR INPUTS
    utxos.forEach(utxo => {
        if (isSegWit) {
            // INPUT SEGWIT (bc1...)
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: Buffer.from(utxo.scriptPubKey, 'hex'),
                    value: BigInt(utxo.value),
                },
            });
        } else {
            // INPUT LEGACY (1...)
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: Buffer.from(utxo.scriptPubKey, 'hex'),
                    value: BigInt(utxo.value)
                }
            });
        }
    });

    // 3. OUTPUT OP_RETURN (Igual para ambos)
    const opReturnData = Buffer.from(message, 'utf8');
    const embed = bitcoin.payments.embed({ data: [opReturnData] });
    
    psbt.addOutput({
        script: embed.output!,
        value: BigInt(0),
    });

    // 4. Cálculo de Fee
    const txSize = isSegWit 
        ? 10 + (utxos.length * 68) + (2 * 31) + opReturnData.length
        : 10 + (utxos.length * 148) + (2 * 34) + opReturnData.length;
    
    const fee = Math.ceil(txSize * feeRate);
    const change = totalValue - fee;

    if (change < 546) {
        throw new Error(`Insufficient funds. Need ~${fee + 546} sats, have ${totalValue}.`);
    }

    // 5. OUTPUT DE CAMBIO (Devolver a la misma wallet)
    const changeAddress = isSegWit ? possibleBc1 : possibleLegacy;
    
    psbt.addOutput({
        address: changeAddress!,
        value: BigInt(change),
    });

    // 6. FIRMAR
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    
    return {
        rawTx: tx.toHex(),
        txid: tx.getId(),
        fee,
        opReturn: message
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Formats a beacon message with timestamp
 */
export function formatBeaconMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message}`;
}

/**
 * Legacy function for compatibility - no-op since bitcoinjs-lib is always loaded
 */
export async function loadCoinbin(): Promise<void> {
    // No-op - bitcoinjs-lib is bundled
    return Promise.resolve();
}
