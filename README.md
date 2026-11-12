# Atividade ChatBot I - Parte 2

Aluno: Pedro Silva Martins
Curso: Desenvolvimento de Software Multiplataforma

Projeto base: https://github.com/jylaila/chat

## Como executar

Requisito: Node.js instalado.

```bash
# Chatbot baseado em regras
cd RulesBased/chatbot-node
npm install
node server.js
```

```bash
# Chatbot baseado em PLN
cd PLNBased/chatbot-pln
npm install
node server.js
```

Os dois usam a porta 3000, então rode um de cada vez. Depois de iniciar, abra
http://localhost:3000 no navegador (adicionei uma rota `/` no servidor que entrega o `index.html`).

---

## 1. Chatbot baseado em regras (`RulesBased/chatbot-node`)

### O que foi feito
- As regras saíram de uma sequência de `if/else` e foram para uma lista (`regras`), onde cada regra tem palavras-chave e uma resposta. Para criar uma regra nova basta adicionar um item na lista.
- A mensagem é normalizada (minúsculas e sem acentos), então "horário" e "horario" funcionam igual.
- A palavra-chave precisa estar no início de uma palavra: "plano" encontra "planos", mas "oi" não é encontrado dentro de "noite".
- Regras originais mantidas: login, plano e atendente.
- **Novas regras:** horário, localização, promoções, pagamento, contato e saudação.

### Testes no navegador

| Mensagem | Resposta do bot |
|---|---|
| Esqueci meu login | Você pode redefinir sua senha clicando em 'Esqueci minha senha'. |
| quais planos vocês têm? | Temos planos Básico e Premium... |
| quero falar com um atendente | Ok! Encaminhando você para um atendente. |
| Qual o horário de funcionamento? | Nosso horário de atendimento é de segunda a sexta, das 8h às 18h... |
| que horas vocês abrem? | (mesma resposta de horário) |
| Onde fica a loja? | Estamos na Rua Exemplo, 123 - Centro... |
| Tem alguma promoção? | Neste mês o plano Premium está com 20% de desconto... |
| Aceita Pix? | Aceitamos Pix, cartão de crédito (até 12x) e boleto bancário. |
| qual o telefone de contato | Você pode falar com a gente pelo telefone... |
| Boa noite | Olá! Posso ajudar com login, planos, horário... |
| quero comprar um carro | Desculpe, não entendi sua pergunta. |

Observação: na primeira versão eu usei palavra inteira (`\bpalavra\b`) e isso quebrou a regra
original, porque "planos" não batia com "plano". Troquei para comparar só o início da palavra.

---

## 2. Chatbot baseado em PLN (`PLNBased/chatbot-pln`)

### Testes antes das alterações (classificador original)

| Mensagem | Intenção identificada | Correto? |
|---|---|---|
| oi | saudacao | sim |
| bom dia, tudo bem? | saudacao | sim |
| cadê meu pedido | pedido_status | sim |
| obrigado pela ajuda | agradecimento | sim |
| quanto custa o plano | saudacao | não |
| quero cancelar minha assinatura | pedido_status | não |
| preciso de ajuda | saudacao | não |
| qual o horário de funcionamento | saudacao | não |

O classificador Bayesiano sempre escolhe uma das intenções que conhece. Como ele só tinha
saudação, pedido e agradecimento, perguntas sobre preço ou cancelamento caíam em uma intenção errada.

### O que foi feito
- Uso do stemmer em português (`natural.PorterStemmerPt`), que reduz palavras ao radical
  ("cancelar", "cancelo", "cancelamento" ficam parecidas).
- Frases de treino organizadas em um objeto `treino` e respostas em um objeto `respostas`.
- Mais exemplos nas intenções originais.
- **Novas intenções:** `preco`, `ajuda`, `cancelamento` e `horario`.
- Re-treinamento com `classifier.train()` ao iniciar o servidor.

### Testes depois do re-treinamento
Frases que **não** estão nos dados de treino:

| Mensagem | Intenção identificada | Correto? |
|---|---|---|
| oi, tudo bem? | saudacao | sim |
| cadê meu pedido | pedido_status | sim |
| obrigado pela ajuda | agradecimento | sim |
| quanto custa o plano premium? | preco | sim |
| qual o valor? | preco | sim |
| quero cancelar minha assinatura | cancelamento | sim |
| como cancelo? | cancelamento | sim |
| preciso de ajuda | ajuda | sim |
| estou com dúvida no app | ajuda | sim |
| qual o horário de funcionamento? | horario | sim |
| vocês abrem domingo? | horario | sim |

### Limitação observada
O classificador continua escolhendo sempre alguma intenção, mesmo quando a frase não tem relação
com nenhuma. Exemplo: "quero comprar um carro" foi classificada como `cancelamento`, provavelmente
por causa da palavra "quero", que aparece no treino dessa intenção. Para melhorar, seria possível
usar a probabilidade retornada por `classifier.getClassifications()` e responder "não entendi"
quando ela for baixa, ou adicionar mais frases de treino e uma intenção de "fora do escopo".

## Comparação rápida
- **Regras:** previsível e fácil de entender, mas só responde quando encontra exatamente as palavras-chave.
- **PLN:** entende frases diferentes das cadastradas, mas pode errar com segurança quando a frase foge do que foi treinado.
