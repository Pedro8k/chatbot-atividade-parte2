const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const natural = require("natural");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve a página do chat em http://localhost:3000
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Classificador Bayesiano usando o stemmer em português
// (reduz "cancelar", "cancelamento" e "cancelei" para o mesmo radical)
const classifier = new natural.BayesClassifier(natural.PorterStemmerPt);

// Frases de treino de cada intenção
const treino = {
  // Intenções originais
  saudacao: ["oi", "olá", "bom dia", "boa tarde", "boa noite", "e aí, tudo bem"],
  pedido_status: [
    "quero saber meu pedido",
    "meu pedido chegou",
    "acompanhar pedido",
    "onde está minha encomenda",
    "rastrear minha entrega",
  ],
  agradecimento: ["obrigado", "valeu", "muito obrigada", "agradeço"],

  // Novas intenções
  preco: [
    "qual o preço",
    "quanto custa",
    "qual o valor do plano",
    "quanto é a mensalidade",
    "está caro",
    "tabela de preços",
  ],
  ajuda: [
    "preciso de ajuda",
    "me ajuda",
    "não estou conseguindo usar",
    "estou com um problema",
    "como funciona",
    "tenho uma dúvida",
  ],
  cancelamento: [
    "quero cancelar",
    "cancelar minha assinatura",
    "como faço o cancelamento",
    "não quero mais o serviço",
    "encerrar minha conta",
    "desistir da compra",
  ],
  horario: [
    "qual o horário de funcionamento",
    "que horas vocês abrem",
    "até que horas fica aberto",
    "vocês abrem no sábado",
  ],
};

for (const [intencao, frases] of Object.entries(treino)) {
  frases.forEach((frase) => classifier.addDocument(frase, intencao));
}

classifier.train();

const respostas = {
  saudacao: "Olá! Em que posso te ajudar hoje?",
  pedido_status: "Para consultar seu pedido, informe o número ou e-mail da compra.",
  agradecimento: "De nada! Estou sempre à disposição",
  preco: "O plano Básico custa R$ 29,90/mês e o Premium R$ 59,90/mês.",
  ajuda:
    "Claro! Me conte qual é o problema ou dúvida, ou digite 'atendente' para falar com uma pessoa.",
  cancelamento:
    "Que pena! Para cancelar, acesse Minha Conta > Assinatura > Cancelar. Se quiser, posso te passar para um atendente.",
  horario: "Atendemos de segunda a sexta, das 8h às 18h, e aos sábados, das 8h às 12h.",
};

app.post("/chat", (req, res) => {
  const { message } = req.body;
  const intent = classifier.classify(message.toLowerCase());
  const reply = respostas[intent] || "Desculpe, não entendi.";

  res.json({ reply, intent });
});

app.listen(3000, () => console.log("Chatbot PLN rodando na porta 3000"));
