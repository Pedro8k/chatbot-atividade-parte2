const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve a página do chat em http://localhost:3000
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Remove acentos para que "horário" e "horario" sejam tratados igual
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Lista de regras: se a mensagem contiver alguma das palavras-chave,
// o bot responde com a resposta da regra. A primeira regra que bater é usada.
const regras = [
  // Regras originais
  {
    palavras: ["login", "senha"],
    resposta: "Você pode redefinir sua senha clicando em 'Esqueci minha senha'.",
  },
  {
    palavras: ["plano"],
    resposta: "Temos planos Básico e Premium. Qual você gostaria de saber mais?",
  },
  {
    palavras: ["atendente", "humano"],
    resposta: "Ok! Encaminhando você para um atendente.",
  },

  // Novas regras
  {
    palavras: ["horario", "que horas", "abre", "fecha", "funcionamento", "aberto"],
    resposta:
      "Nosso horário de atendimento é de segunda a sexta, das 8h às 18h, e aos sábados, das 8h às 12h.",
  },
  {
    palavras: ["localizacao", "endereco", "onde fica", "onde voces ficam", "como chegar"],
    resposta:
      "Estamos na Rua Exemplo, 123 - Centro. Fica perto da estação de metrô central.",
  },
  {
    palavras: ["promoc", "desconto", "cupom", "oferta"],
    resposta:
      "Neste mês o plano Premium está com 20% de desconto usando o cupom PREMIUM20!",
  },
  {
    palavras: ["pagamento", "pagar", "pix", "cartao", "boleto"],
    resposta: "Aceitamos Pix, cartão de crédito (até 12x) e boleto bancário.",
  },
  {
    palavras: ["contato", "telefone", "whatsapp", "email"],
    resposta:
      "Você pode falar com a gente pelo telefone (11) 4000-0000 ou pelo e-mail contato@exemplo.com.",
  },
  {
    palavras: ["oi", "ola", "bom dia", "boa tarde", "boa noite"],
    resposta:
      "Olá! Posso ajudar com login, planos, horário, localização, promoções, pagamento ou contato.",
  },
];

// Verifica se a palavra-chave aparece no início de uma palavra da mensagem.
// Assim "plano" encontra "planos" e "abre" encontra "abrem",
// mas "oi" não é encontrado dentro de "noite" ou "dois".
function contem(mensagem, palavra) {
  return new RegExp(`\\b${palavra}`).test(mensagem);
}

app.post("/chat", (req, res) => {
  const message = normalizar(req.body.message || "");
  let response = "Desculpe, não entendi sua pergunta.";

  const regra = regras.find((r) => r.palavras.some((p) => contem(message, p)));
  if (regra) {
    response = regra.resposta;
  }

  res.json({ reply: response });
});

app.listen(3000, () => console.log("Chatbot rodando na porta 3000"));
