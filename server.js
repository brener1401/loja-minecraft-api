const express = require('express')
const app = express()
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'bawmc.net',
  port: 19132, // muda se o servidor usar outra porta
  username: 'BawSHOP',
  version: false
})

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


app.post('/webhook/olivery', (req, res) => {
  const secret = req.headers['x-api-key']

  if (secret !== process.env.SECRET_KEY) {
    console.log("Acesso negado: chave inválida")
    return res.sendStatus(403)
  }

  const data = req.body
  console.log("Pagamento recebido:", data)

  const vendaID = data.id
  const player = data.player_name
  const produto = data.product_name

  if (!player || !produto || !vendaID) {
    return res.status(400).send("Dados inválidos")
  }

  if (entregasProcessadas.has(vendaID)) {
    console.log("Venda duplicada ignorada:", vendaID)
    return res.sendStatus(200)
  }

  const valor = valorDoProduto(produto)

  if (!valor) {
    console.log("Produto desconhecido:", produto)
    return res.sendStatus(200)
  }

  if (!bot.player) {
    console.log("Bot offline, não entregou")
    return res.sendStatus(500)
  }

  entregasProcessadas.add(vendaID)

  console.log(`💸 Pagando ${valor} para ${player}`)
  bot.chat(`/pay ${player} ${valor}`)

  res.sendStatus(200)
})

bot.on('spawn', () => {
  console.log('🤖 Bot entrou no servidor Minecraft')
})

bot.on('error', err => console.log('Erro do bot:', err))
bot.on('end', () => console.log('Bot desconectou'))

app.use(express.json()) // Permite receber JSON



// Rota teste
app.get('/', (req, res) => {
  res.send('API da Loja do Brener online 🚀')
})

// Rota que vai receber os pagamentos
app.post('/pagamento-confirmado', (req, res) => {
  const { player, produto, chave } = req.body

  if (chave !== "SEGREDO123") {
    return res.status(403).send('Acesso negado')
  }

  console.log(`Compra recebida:`)
  console.log(`Jogador: ${player}`)
  console.log(`Produto: ${produto}`)

  // Aqui depois vamos mandar pro bot do Minecraft

  res.send('Entrega registrada com sucesso!')
  
})

app.post('/webhook/olivery', (req, res) => {
  const data = req.body

  console.log("Pagamento recebido do Olivery:", data)

  const player = data.player_name // nome do jogador
  const produto = data.product_name // tipo "5M", "10M"

  if (!player || !produto) {
    return res.status(400).send("Dados inválidos")
  }

  // Aqui no futuro vamos mandar pro bot do Minecraft
  console.log(`Entregar ${produto} para ${player}`)

  res.sendStatus(200)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})