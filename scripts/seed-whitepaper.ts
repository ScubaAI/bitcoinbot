import { addDocument } from '@/lib/vector/search';

// Bitcoin Whitepaper excerpts (simplified chunks for demonstration)
// In production, you'd parse the actual whitepaper PDF
const whitepaperChunks = [
  {
    id: 'wp-1',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 1,
    text: `ABSTRACT. A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. We propose a solution to the double-spending problem using a peer-to-peer network.`,
  },
  {
    id: 'wp-2',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 2,
    text: `Transactions. We define an electronic coin as a chain of digital signatures. Each owner transfers the coin to the next by digitally signing a hash of the previous transaction and the public key of the next owner and adding these to the end of the coin. A payee can verify the signatures to verify the chain of ownership.`,
  },
  {
    id: 'wp-3',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 3,
    text: `Timestamp Server. The solution we propose begins with a timestamp server. A timestamp server works by taking a hash of a block of items to be timestamped and widely publishing the hash, such as in a newspaper or Usenet post. The timestamp proves that the data existed at that time, obviously, in order to get into the hash. Each timestamp includes the previous timestamp in its hash, forming a chain.`,
  },
  {
    id: 'wp-4',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 4,
    text: `Proof-of-Work. To implement a distributed timestamp server on a peer-to-peer basis, we will need to use a proof-of-work system similar to Adam Back's Hashcash, rather than newspaper or Usenet posts. The proof-of-work involves scanning for a value that when hashed, such as with SHA-256, the hash begins with a number of zero bits.`,
  },
  {
    id: 'wp-5',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 5,
    text: `Network. The steps to run the network are as follows:
1) New transactions are broadcast to all nodes.
2) Each node collects new transactions into a block.
3) Each node works on finding a difficult proof-of-work for its block.
4) When a node finds a proof-of-work, it broadcasts the block to all nodes.
5) Nodes accept the block only if all transactions in it are valid and not already spent.
6) Nodes express their acceptance of the block by working on creating the next block in the chain, using the hash of the accepted block.`,
  },
  {
    id: 'wp-6',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 6,
    text: `Incentive. By convention, the first transaction in a block is a special transaction that starts a new coin owned by the creator of the block. This adds an incentive for nodes to support the network, and provides a way to initially distribute coins into circulation, since there is no central authority to issue them.`,
  },
  {
    id: 'wp-7',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 7,
    text: `Reclaiming Disk Space. Once the latest transaction in a coin is buried under enough blocks, the spent transactions before it can be discarded to save disk space. To facilitate this without breaking the block's hash, transactions are hashed in a Merkle Tree, with only the root included in the block's hash.`,
  },
  {
    id: 'wp-8',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    url: 'https://bitcoin.org/bitcoin.pdf',
    chunk: 8,
    text: `Simplified Payment Verification. It is possible to verify payments without running a full network node. A user only needs to keep a copy of the block headers of the longest proof-of-work chain, which he can get by querying network nodes until he's convinced he has the longest chain, and obtain the Merkle branch linking the transaction to the block it's timestamped in.`,
  },
];

// Lightning Network concepts
const lightningChunks = [
  {
    id: 'ln-1',
    title: 'The Lightning Network',
    url: 'https://lightning.network/lightning-network-paper.pdf',
    chunk: 1,
    text: `The Lightning Network is a second layer protocol built on top of Bitcoin that enables instant, low-cost payments across a network of bidirectional payment channels. It solves the scalability problem of Bitcoin by allowing transactions to occur off-chain while still relying on Bitcoin's underlying security.`,
  },
  {
    id: 'ln-2',
    title: 'The Lightning Network',
    url: 'https://lightning.network/lightning-network-paper.pdf',
    chunk: 2,
    text: `Payment Channels. A payment channel is a financial arrangement between two users that allows them to conduct multiple transactions without committing all of them to the Bitcoin blockchain. Only the opening and closing transactions are recorded on-chain.`,
  },
  {
    id: 'ln-3',
    title: 'The Lightning Network',
    url: 'https://lightning.network/lightning-network-paper.pdf',
    chunk: 3,
    text: `HTLC - Hash Time Locked Contracts. HTLCs are the building blocks of Lightning Network. They are conditional payments that can be claimed by providing a cryptographic proof (preimage) within a specified time window. If the proof is not provided, the funds return to the original sender.`,
  },
  {
    id: 'ln-4',
    title: 'The Lightning Network',
    url: 'https://lightning.network/lightning-network-paper.pdf',
    chunk: 4,
    text: `Onion Routing. The Lightning Network uses Sphinx onion routing to protect user privacy. Each node only knows about its immediate neighbors in a payment route, making it difficult to determine the full path of a payment.`,
  },
  {
    id: 'ln-5',
    title: 'The Lightning Network',
    url: 'https://lightning.network/lightning-network-paper.pdf',
    chunk: 5,
    text: `Watchtowers. To protect users who may go offline, watchtowers are services that monitor the blockchain for any cheating attempts (attempting to broadcast an old, revoked state). If detected, they can punish the cheater by taking the entire channel balance.`,
  },
];

// Bitcoin technical concepts
const technicalChunks = [
  {
    id: 'tech-1',
    title: 'UTXO Model',
    url: 'https://developer.bitcoin.org/devguide/block_chain.html',
    chunk: 1,
    text: `UTXO - Unspent Transaction Output. Bitcoin uses the UTXO model to track ownership of coins. Each transaction consumes previous unspent outputs and creates new ones. This model is different from account-based systems used by traditional banks.`,
  },
  {
    id: 'tech-2',
    title: 'Mining & Proof of Work',
    url: 'https://en.bitcoin.it/wiki/Mining',
    chunk: 1,
    text: `Mining is the process of adding transaction records to Bitcoin's public ledger of past transactions. Miners compete to solve a computationally difficult puzzle (proof-of-work) to earn the right to add a new block to the blockchain. Successful miners receive block rewards (newly minted bitcoins) and transaction fees.`,
  },
  {
    id: 'tech-3',
    title: 'Difficulty Adjustment',
    url: 'https://en.bitcoin.it/wiki/Difficulty',
    chunk: 1,
    text: `Bitcoin's difficulty adjusts every 2016 blocks (approximately every 2 weeks) to maintain an average block time of 10 minutes. If the hashrate increases, difficulty increases; if hashrate decreases, difficulty decreases. This ensures consistent issuance of new bitcoins.`,
  },
  {
    id: 'tech-4',
    title: 'Wallet Types',
    url: 'https://bitcoin.org/en/choose-your-wallet',
    chunk: 1,
    text: `Bitcoin wallets come in different forms: Hardware wallets (most secure, offline), Software wallets (desktop/mobile), and Paper wallets (physical document). HD (Hierarchical Deterministic) wallets generate keys from a single seed phrase, making backup easier.`,
  },
  {
    id: 'tech-5',
    title: 'Multi-Signature',
    url: 'https://en.bitcoin.it/wiki/Multisignature',
    chunk: 1,
    text: `Multi-signature (multi-sig) addresses require multiple private keys to authorize a transaction. This adds security and can be used for joint accounts, escrow services, or corporate governance. Common configurations include 2-of-3 or 3-of-5.`,
  },
  {
    id: 'tech-6',
    title: 'SegWit',
    url: 'https://en.bitcoin.it/wiki/Segregated_Witness',
    chunk: 1,
    text: `Segregated Witness (SegWit) is a soft fork that separates transaction signature data (witness) from the transaction data. This increases block capacity and solves transaction malleability, enabling second-layer solutions like Lightning Network.`,
  },
  {
    id: 'tech-7',
    title: 'Taproot',
    url: 'https://en.bitcoin.it/wiki/Taproot',
    chunk: 1,
    text: `Taproot is a Bitcoin upgrade that improves privacy, scalability, and enables complex smart contracts. It introduces Schnorr signatures, allowing multiple signature schemes to appear as a single signature on-chain. This enhances privacy for multi-sig transactions.`,
  },
];

async function seed() {
  console.log('Starting vector database seeding...');

  const allChunks = [...whitepaperChunks, ...lightningChunks, ...technicalChunks];

  for (const chunk of allChunks) {
    try {
      await addDocument({
        id: chunk.id,
        text: chunk.text,
        metadata: {
          title: chunk.title,
          url: chunk.url,
          chunk: chunk.chunk,
        },
      });
      console.log(`Added document: ${chunk.id}`);
    } catch (error) {
      console.error(`Failed to add document ${chunk.id}:`, error);
    }
  }

  console.log('Seeding completed!');
}

seed().catch(console.error);
