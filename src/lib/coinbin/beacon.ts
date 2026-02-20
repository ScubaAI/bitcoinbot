/**
 * Beacon Library (Client-Side Only)
 * Powered by bitcoinjs-lib and mempool.space
 * 
 * Philosophy: Sovereignty starts in the browser. 
 * No private keys ever leave the client.
 */

// Types only - no imports at top level
type BitcoinLib = typeof import('bitcoinjs-lib');
type ECPairType = typeof import('ecpair');
type TinySecpType = typeof import('tiny-secp256k1');

// Module cache
let modules: {
    bitcoin: BitcoinLib;
    ECPair: any;
} | null = null;

/**
 * Loads Bitcoin modules dynamically (client-side only)
 */
async function loadModules() {
    if (typeof window === 'undefined') {
        throw new Error('Bitcoin modules can only be loaded in browser');
    }

    if (modules) return modules;

    // Dynamic imports to avoid SSR issues
    const [bitcoin, ecpair, tinysecp] = await Promise.all([
        import('bitcoinjs-lib'),
        import('ecpair'),
        import('tiny-secp256k1'),
    ]);

    const ECPair = ecpair.ECPairFactory(tinysecp);

    modules = { bitcoin, ECPair };
    return modules;
}

/**
 * Ensures Coinbin logic is ready (client-side only)
 */
export async function loadCoinbin() {
    if (typeof window === 'undefined') return;
    await loadModules();
}

/**
 * Generates a fresh Bitcoin wallet for beacon purposes
 */
export async function generateBeaconWallet() {
    const { bitcoin, ECPair } = await loadModules();

    const keyPair = ECPair.makeRandom();
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

    return {
        wif: keyPair.toWIF(),
        address: address!,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex')
    };
}

/**
 * Formats a standardized beacon message
 */
export function formatBeaconMessage(blockHeight: number, userMessage: string) {
    const protocol = 'BTCBOT';
    const version = '1.0';
    const msg = userMessage || 'Bitcoin Agent was here';
    const creators = 'KimiK2.5xScubaPab';

    return `${protocol}|${version}|${blockHeight}|${msg}|${creators}`.slice(0, 80);
}

/**
 * Fetches unspent transaction outputs from mempool.space
 */
export async function fetchUtxos(address: string) {
    const res = await fetch(`https://mempool.space/api/address/${address}/utxo`);
    if (!res.ok) throw new Error('Failed to fetch UTXOs from mempool.space');

    const data = await res.json();
    return data.map((u: any) => ({
        txid: u.txid,
        vout: u.vout,
        value: u.value,
        scriptPubKey: u.scriptpubkey,
    }));
}

/**
 * Creates and signs a Bitcoin transaction with OP_RETURN
 */
export async function createBeaconTransaction(
    wif: string,
    utxos: any[],
    message: string,
    feeRate: number = 10
) {
    const { bitcoin, ECPair } = await loadModules();
    const network = bitcoin.networks.bitcoin;
    const keyPair = ECPair.fromWIF(wif, network);
    const psbt = new bitcoin.Psbt({ network });

    const totalValue = utxos.reduce((sum, u) => sum + u.value, 0);

    // Add all inputs
    utxos.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                script: Buffer.from(utxo.scriptPubKey, 'hex'),
                value: BigInt(utxo.value),
            },
        });
    });

    // OP_RETURN Output
    const opReturnData = Buffer.from(message, 'utf8');
    const embed = bitcoin.payments.embed({ data: [opReturnData] });

    psbt.addOutput({
        script: embed.output!,
        value: BigInt(0),
    });

    // Estimate size and fee
    const txSize = 10 + (utxos.length * 148) + (2 * 34) + opReturnData.length;
    const fee = Math.ceil(txSize * feeRate);
    const change = totalValue - fee;

    if (change < 546) {
        throw new Error(`Insufficient funds. Need at least ${fee + 546} sats, but have ${totalValue}.`);
    }

    // Change Output
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    psbt.addOutput({
        address: address!,
        value: BigInt(change),
    });

    // Sign and Finalize
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    const rawTx = tx.toHex();
    const txid = tx.getId();

    return {
        rawTx,
        fee,
        details: {
            txid,
            opReturn: message,
            change
        }
    };
}

/**
 * Broadcasts a raw transaction to the network
 */
export async function broadcastTransaction(rawTx: string) {
    const res = await fetch('https://mempool.space/api/tx', {
        method: 'POST',
        body: rawTx
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Broadcast failed: ${errorText}`);
    }

    return res.text();
}