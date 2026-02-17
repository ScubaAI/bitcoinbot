import { PrismaClient } from '@prisma/client'
import { Index } from '@upstash/vector'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + size, text.length)
    const chunk = text.slice(start, end)
    chunks.push(chunk)
    start = end - overlap
    if (start >= text.length - overlap) break
  }
  
  return chunks
}

async function seedVectorDatabase() {
  console.log('🚀 Starting vector database seeding...')
  
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    throw new Error('❌ Upstash Vector credentials missing in environment')
  }

  const vectorClient = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  })

  // Verificar conexión
  try {
    const info = await vectorClient.info()
    console.log('✅ Upstash Vector connected:', info)
  } catch (error) {
    console.error('❌ Failed to connect to Upstash Vector:', error)
    throw error
  }

  const whitepaperPath = path.join(process.cwd(), 'public', 'whitepaper', 'bitcoin.txt')
  
  if (!fs.existsSync(whitepaperPath)) {
    console.log('⚠️  Whitepaper not found at:', whitepaperPath)
    console.log('📥 Downloading from bitcoin.org...')
    
    try {
      const response = await fetch('https://bitcoin.org/bitcoin.pdf')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const buffer = await response.arrayBuffer()
      fs.mkdirSync(path.dirname(whitepaperPath), { recursive: true })
      fs.writeFileSync(
        path.join(process.cwd(), 'public', 'whitepaper', 'bitcoin.pdf'), 
        Buffer.from(buffer)
      )
      console.log('✅ Whitepaper PDF downloaded')
      console.log('⚠️  Please convert PDF to text manually (use pdftotext or similar)')
      console.log('   Expected path:', whitepaperPath)
      return
    } catch (error) {
      console.error('❌ Failed to download whitepaper:', error)
      throw error
    }
  }

  console.log('📄 Reading whitepaper...')
  const text = fs.readFileSync(whitepaperPath, 'utf-8')
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP)

  console.log(`🔄 Processing ${chunks.length} chunks...`)

  // Limpiar índice existente (opcional - descomenta si necesitas reset)
  // console.log('🧹 Cleaning existing index...')
  // await vectorClient.reset()

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    
    try {
      await vectorClient.upsert({
        id: `whitepaper-chunk-${i}`,
        data: chunk, // Upstash genera embedding automáticamente con BGE_SMALL
        metadata: {
          text: chunk,
          chunkIndex: i,
          source: 'bitcoin-whitepaper',
          totalChunks: chunks.length,
        },
      })
      
      process.stdout.write(`\r📊 Progress: ${i + 1}/${chunks.length} chunks indexed`)
      
      // Rate limiting amigable (Upstash free: 10K ops/day)
      if (i % 100 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(`\n❌ Error indexing chunk ${i}:`, error)
      throw error
    }
  }

  console.log('\n✅ Vector database seeded successfully!')
  console.log(`📈 Total chunks indexed: ${chunks.length}`)
}

async function seedDatabase() {
  try {
    // 1. Seed Vector DB (Upstash)
    await seedVectorDatabase()
    
    // 2. Opcional: Crear datos de prueba en PostgreSQL
    // Descomenta si necesitas datos iniciales en Prisma
    
    /*
    console.log('🌱 Seeding PostgreSQL database...')
    
    const testSession = await prisma.visitorSession.create({
      data: {
        visitorId: 'test-visitor-123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      }
    })
    
    await prisma.message.createMany({
      data: [
        {
          sessionId: testSession.id,
          content: 'What is Bitcoin?',
          role: 'user',
        },
        {
          sessionId: testSession.id,
          content: 'Bitcoin is a peer-to-peer electronic cash system...',
          role: 'assistant',
          tokensUsed: 150,
        }
      ]
    })
    
    console.log('✅ Test data created in PostgreSQL')
    */
    
    console.log('🎉 Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase()
}

export { seedDatabase }