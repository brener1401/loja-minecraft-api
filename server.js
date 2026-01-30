const express = require('express')
const app = express()

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