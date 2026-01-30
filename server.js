const express = require('express')


const app = express()

app.use(express.json())



const SECRET_KEY = process.env.SECRET_KEY || "SEGREDO123"

let filaEntregas = []
let entregasProcessadas = new Set()

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

// Rota teste
app.get('/', (req, res) => {
  res.send('API da Loja do Brener online 🚀')
})


// 🔔 WEBHOOK DO OWLIVERY
app.post('/webhook/olivery', (req, res) => {
  const secret = req.headers['x-api-key']
  if (secret !== SECRET_KEY) {
    console.log("❌ Chave inválida")
    return res.sendStatus(403)
  }

  const data = req.body
  console.log("📥 Pagamento recebido:", data)

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
    console.log("❌ Produto desconhecido:", produto)
    return res.sendStatus(200)
  }


  entregasProcessadas.add(vendaID)
  filaEntregas.push({ player, valor })

  console.log(`📦 Entrega adicionada na fila: ${player} - ${valor}`)

  res.sendStatus(200)
})


// 🎯 ROTA QUE O MINECRAFT VAI CONSULTAR
app.get('/proxima-entrega', (req, res) => {
  const key = req.query.key
  if (key !== SECRET_KEY) {
    return res.status(403).send("Acesso negado")
  }

  if (filaEntregas.length === 0) {
    return res.json(null)
  }

  const entrega = filaEntregas.shift()
  console.log("🚚 Enviando entrega para o jogo:", entrega)

  res.json(entrega)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})