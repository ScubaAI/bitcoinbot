/**
 * Coinbin-Compatible Beacon Generator
 * Creates raw Bitcoin transactions for manual broadcast
 * 
 * Philosophy: "Don't trust, verify" — you control the keys
 */

import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';

const ECPair = ECPairFactory(tinysecp);

// Beacon wallet (WIF format for Coinbin compatibility)
const BEACON_WALLET = {
    wif: process.env.BEACON_WIF_KEY,  // 5J... or L1...
    address: process.env.BEACON_ADDRESS, // 1... or bc1...
};

interface CoinbinBeacon {
    // Raw transaction hex (paste into coinb.in/#broadcast)
    rawTx: string;
    // QR code data (scan with Coinbin mobile)
    qrData: string;
    // Transaction details for verification
    details: {
        txid: string;
        fee: number;
        opReturn: string;
        inputs: Array<{ txid: string; vout: number; value: number }>;
        outputs: Array<{ type: 'op_return' | 'change'; value: number; data?: string }>;
    };
    // Coinbin deep link
    coinbinUrl: string;
}

interface UTXO {
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
}

/**
 * MAIN: Generate Coinbin-compatible beacon transaction
 */
export async function generateCoinbinBeacon(
    message: string = 'Bitcoin Agent was here'
): Promise<CoinbinBeacon | null> {

    if (!BEACON_WALLET.wif || !BEACON_WALLET.address) {
        throw new Error('Beacon wallet not configured. Set BEACON_WIF_KEY and BEACON_ADDRESS.');
    }

    try {
        // 1. Get UTXOs from mempool.space
        const utxos = await fetchUtxos(BEACON_WALLET.address);

        if (utxos.length === 0) {
            throw new Error(`No UTXOs found for ${BEACON_WALLET.address}. Please fund the beacon wallet.`);
        }

        // 2. Select UTXO (smallest sufficient)
        const utxo = selectUtxo(utxos, 1000); // 1000 sats for fee

        if (!utxo) {
            throw new Error('No UTXO large enough. Minimum: 1000 sats.');
        }

        // 3. Build OP_RETURN message
        const opReturnData = buildOpReturnData(message);

        // 4. Calculate fee (1 input, 2 outputs: OP_RETURN + change)
        const feeRate = await getFeeRate('economy'); // sats/vbyte
        const txSize = estimateTxSize(1, 2, opReturnData.length);
        const fee = txSize * feeRate;

        const change = utxo.value - fee;

        if (change < 546) { // Dust limit
            throw new Error(`Change amount (${change} sats) below dust limit. Add more funds.`);
        }

        // 5. Build transaction
        const network = bitcoin.networks.bitcoin;
        const keyPair = ECPair.fromWIF(BEACON_WALLET.wif, network);

        const psbt = new bitcoin.Psbt({ network });

        // Add input
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                script: Buffer.from(utxo.scriptPubKey, 'hex'),
                value: BigInt(utxo.value),
            },
        });

        // Add OP_RETURN output
        const embed = bitcoin.payments.embed({ data: [opReturnData] });
        psbt.addOutput({
            script: embed.output!,
            value: BigInt(0),
        });

        // Add change output
        psbt.addOutput({
            address: BEACON_WALLET.address,
            value: BigInt(change),
        });

        // Sign
        psbt.signInput(0, keyPair);
        psbt.finalizeAllInputs();

        // Extract raw TX
        const rawTx = psbt.extractTransaction().toHex();
        const txid = psbt.extractTransaction().getId();

        // 6. Build response
        const beacon: CoinbinBeacon = {
            rawTx,
            qrData: rawTx, // QR contains full raw TX
            details: {
                txid,
                fee,
                opReturn: message,
                inputs: [{ txid: utxo.txid, vout: utxo.vout, value: utxo.value }],
                outputs: [
                    { type: 'op_return', value: 0, data: message },
                    { type: 'change', value: change },
                ],
            },
            coinbinUrl: `https://coinb.in/#broadcast?tx=${rawTx}`,
        };

        return beacon;

    } catch (error) {
        console.error('Coinbin beacon generation failed:', error);
        return null;
    }
}

/**
 * Build OP_RETURN data with protocol prefix
 */
function buildOpReturnData(message: string): Buffer {
    const protocol = 'BTCBOT';
    const version = '1.0';
    const timestamp = Date.now();
    const creators = 'KimiK2.5xScubaPab';

    const fullMessage = `${protocol}|${version}|${timestamp}|${message}|${creators}`;

    // OP_RETURN limit: 80 bytes
    const truncated = fullMessage.slice(0, 80);

    return Buffer.from(truncated, 'utf8');
}

/**
 * Fetch UTXOs from mempool.space
 */
async function fetchUtxos(address: string): Promise<UTXO[]> {
    const res = await fetch(`https://mempool.space/api/address/${address}/utxo`);
    if (!res.ok) throw new Error('Failed to fetch UTXOs');

    const data = await res.json();

    return data.map((u: any) => ({
        txid: u.txid,
        vout: u.vout,
        value: u.value,
        scriptPubKey: u.scriptpubkey,
    }));
}

/**
 * Select best UTXO (smallest that covers amount + fee)
 */
function selectUtxo(utxos: UTXO[], needed: number): UTXO | null {
    // Sort by value ascending
    const sorted = utxos.sort((a, b) => a.value - b.value);

    // Find smallest sufficient
    return sorted.find(u => u.value >= needed) || null;
}

/**
 * Get recommended fee rate from mempool.space
 */
async function getFeeRate(priority: 'fastest' | 'hour' | 'economy' = 'economy'): Promise<number> {
    const res = await fetch('https://mempool.space/api/v1/fees/recommended');
    const fees = await res.json();

    const rates = {
        fastest: fees.fastestFee,
        hour: fees.hourFee,
        economy: fees.economyFee || fees.hourFee / 2,
    };

    return (rates as any)[priority] || 1;
}

/**
 * Estimate transaction size (vbytes)
 */
function estimateTxSize(inputs: number, outputs: number, opReturnSize: number): number {
    // Rough estimate: 148 per input, 34 per output, 10 overhead + OP_RETURN
    const baseSize = 10 + (inputs * 148) + (outputs * 34);
    const opReturnSizeBytes = 1 + 1 + opReturnSize; // OP_RETURN opcode + length + data

    return baseSize + opReturnSizeBytes;
}
