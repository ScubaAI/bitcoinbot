/**
 * Server-side Beacon Library
 * Provides wallet management and transaction building for the Beacon API
 */

import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Initialize ECPair with ECC library
const ECPair = ECPairFactory(ecc);

// Re-export types and functions from coinbin/beacon
export { buildAndSignBeacon, fetchUtxos, type UTXO, type BeaconTransaction } from './coinbin/beacon';

// Network configuration
const network = bitcoin.networks.bitcoin;

/**
 * Interface for server wallet
 */
export interface ServerWallet {
    wif: string;
    address: string;
    publicKey: string;
}

/**
 * Gets the server's custodial wallet from environment variables
 * Uses BEACON_WIF_KEY from .env
 */
export function getServerWallet(): ServerWallet {
    const wif = process.env.BEACON_WIF_KEY;
    
    if (!wif) {
        throw new Error('BEACON_WIF_KEY not configured in environment');
    }
    
    try {
        const keyPair = ECPair.fromWIF(wif, network);
        const { address } = bitcoin.payments.p2wpkh({ 
            pubkey: Buffer.from(keyPair.publicKey), 
            network 
        });
        
        // Try SegWit first, fallback to Legacy if needed
        const finalAddress = address || bitcoin.payments.p2pkh({ 
            pubkey: Buffer.from(keyPair.publicKey), 
            network 
        }).address;
        
        if (!finalAddress) {
            throw new Error('Could not derive address from WIF');
        }
        
        return {
            wif,
            address: finalAddress,
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        };
    } catch (error) {
        throw new Error(`Invalid BEACON_WIF_KEY: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generates a complete beacon transaction using server wallet
 * Convenience function that combines wallet loading, UTXO fetching, and tx building
 */
export async function generateBeaconTransaction(message: string): Promise<import('./coinbin/beacon').BeaconTransaction> {
    const { buildAndSignBeacon, fetchUtxos } = await import('./coinbin/beacon');
    
    // Get server wallet
    const wallet = getServerWallet();
    
    // Fetch UTXOs
    const utxos = await fetchUtxos(wallet.address);
    
    if (utxos.length === 0) {
        throw new Error(`No UTXOs found for address ${wallet.address}`);
    }
    
    // Build and sign transaction
    const result = buildAndSignBeacon(wallet.wif, utxos, message);
    
    return result;
}
