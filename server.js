const express = require('express')
const app = express()

app.use(express.json()) // Permite receber JSON

const PORT = 3000

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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
