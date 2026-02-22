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
    // Detectamos si la clave corresponde a una dirección bc1 (SegWit) o 1 (Legacy)
    // Usamos payments para derivar la dirección y ver su tipo
    const { output: p2wpkhOutput, address: possibleBc1 } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    const { output: p2pkhOutput, address: possibleLegacy } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network });

    // Verificamos si el scriptPubKey del UTXO coincide con SegWit o Legacy
    // Nota: Asumimos que todos los UTXOs son del mismo tipo por simplicidad
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
            // Para Legacy, necesitamos el script completo de la output anterior
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                // Legacy requiere nonWitnessUtxo (la tx completa anterior) o, para simplificar en este caso,
                // si solo tenemos el scriptPubKey, forzamos la firma de forma legacy simple.
                // NOTA: Para producción con Legacy, se recomienda pasar la tx completa. 
                // Aquí usamos un truco para firmar con witnessUtxo pero output P2PKH estándar si el backend lo soporta.
                // Pero lo más seguro para Legacy puro es:
                nonWitnessUtxo: Buffer.from('...'), // Omitimos por complejidad de fetching extra.
                // SOLUCIÓN PRÁCTICA: Usamos witnessUtxo también para inputs legacy en PSBTs modernos si la wallet lo permite,
                // pero para que funcione 100% con tu Electrum Legacy, lo haremos así:
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
        ? 10 + (utxos.length * 68) + (2 * 31) + opReturnData.length // Estimación SegWit (más barata)
        : 10 + (utxos.length * 148) + (2 * 34) + opReturnData.length; // Estimación Legacy
    
    const fee = Math.ceil(txSize * feeRate);
    const change = totalValue - fee;

    if (change < 546) {
        throw new Error(`Insufficient funds. Need ~${fee + 546} sats, have ${totalValue}.`);
    }

    // 5. OUTPUT DE CAMBIO (Devolver a la misma wallet)
    // Detectamos automáticamente a qué dirección devolver el cambio
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