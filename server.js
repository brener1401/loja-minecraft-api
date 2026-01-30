const express = require('express')
const mineflayer = require('mineflayer')

const app = express()
app.use(express.json()) // Permite receber JSON

// ====== CONFIG BOT MINECRAFT ======
const bot = mineflayer.createBot({
  host: 'bawmc.net',
  port: 25565, // troque se o servidor usar outra
  username: 'BawSHOP',
  version: false
})

bot.on('spawn', () => {
  console.log('🤖 Bot entrou no servidor Minecraft')
})

bot.on('error', err => console.log('Erro do bot:', err))
bot.on('end', () => console.log('Bot desconectou'))

// ====== CONTROLE DE ENTREGAS DUPLICADAS ======
const entregasProcessadas = new Set()

// ====== TABELA DE PRODUTOS ======
function valorDoProduto(produto) {
  const tabela = {
    "1M": 1000000,
    "2M": 2000000,
    "3M": 3000000,
    "5M": 5000000,
    "10M": 10000000
  }

  return tabela[produto] || null
}

// ====== ROTA TESTE ======
app.get('/', (req, res) => {
  res.send('API da Loja do Brener online 🚀')
})

// ====== WEBHOOK OLIVERY ======
app.post('/webhook/olivery', (req, res) => {
  const secret = req.headers['x-api-key']

  if (secret !== process.env.SECRET_KEY) {
    console.log("⛔ Acesso negado: chave inválida")
    return res.sendStatus(403)
  }

  const data = req.body
  console.log("💰 Pagamento recebido:", data)

  const vendaID = data.id
  const player = data.player_name
  const produto = data.product_name

  if (!player || !produto || !vendaID) {
    return res.status(400).send("Dados inválidos")
  }

  if (entregasProcessadas.has(vendaID)) {
    console.log("⚠️ Venda duplicada ignorada:", vendaID)
    return res.sendStatus(200)
  }

  const valor = valorDoProduto(produto)

  if (!valor) {
    console.log("❓ Produto desconhecido:", produto)
    return res.sendStatus(200)
  }

  if (!bot.entity) {
  console.log("🤖 Bot ainda não spawnou")
  return res.sendStatus(503)
}


  entregasProcessadas.add(vendaID)

  console.log(`💸 Pagando ${valor} para ${player}`)
  bot.chat(`/pay ${player} ${valor}`)

  res.sendStatus(200)
})

// ====== PORTA AUTOMÁTICA (Render) ======
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})
