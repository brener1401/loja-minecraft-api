const express = require('express')
const mineflayer = require('mineflayer')

const app = express()
app.use(express.json())

/* ========= CONFIG ========= */

const SECRET_KEY = process.env.SECRET_KEY || "SEGREDO123"

/* ========= BOT MINECRAFT ========= */

let botPronto = false

const bot = mineflayer.createBot({
  host: 'bawmc.net',
  port: 25565,
  username: 'brener',
  version: false
})

bot.on('spawn', () => {
  console.log('🤖 Bot entrou no servidor')
  botPronto = true
})

bot.on('end', () => {
  console.log('⚠️ Bot desconectou')
  botPronto = false
})

bot.on('error', (err) => {
  console.log('❌ Erro do bot:', err.message)
  botPronto = false
})

/* ========= CONTROLE DE ENTREGAS ========= */

const entregasProcessadas = new Set()


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

/* ========= WEBHOOK OWLIVERY ========= */


app.post('/webhook/olivery', (req, res) => {
  const secret = req.headers['x-api-key']

  if (secret !== SECRET_KEY) {
    console.log("🔒 Acesso negado: chave inválida")
    return res.sendStatus(403)
  }

  const data = req.body
  console.log("💰 Pagamento recebido:", data)

  const vendaID = data.id
  const player = data.player_name
  const produto = data.product_name

  if (!player || !produto || !vendaID) {
    console.log("❌ Dados inválidos")
    return res.status(400).send("Dados inválidos")
  }

  if (entregasProcessadas.has(vendaID)) {
    console.log("♻️ Venda duplicada ignorada:", vendaID)
    return res.sendStatus(200)
  }

  const valor = valorDoProduto(produto)

  if (!valor) {
    console.log("❓ Produto desconhecido:", produto)
    return res.sendStatus(200)
  }

  if (!botPronto) {
    console.log("🤖 Bot ainda não está pronto")
    return res.sendStatus(503)
  }

  entregasProcessadas.add(vendaID)

  const comando = `/pay ${player} ${valor}`
  console.log("🚀 Executando comando:", comando)

  bot.chat(comando)

  res.sendStatus(200)
})

/* ========= ROTA TESTE ========= */

app.get('/', (req, res) => {
  res.send('API da Loja do Brener online 🚀')
})

/* ========= SERVIDOR ========= */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🌍 Servidor rodando na porta ${PORT}`)
})
