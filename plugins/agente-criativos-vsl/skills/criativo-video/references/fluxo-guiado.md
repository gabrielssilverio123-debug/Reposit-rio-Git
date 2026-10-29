# Fluxo guiado (como o agente conduz a conversa)

Objetivo: qualquer pessoa, sem conhecer edição, sai com um criativo ou VSL profissional, em qualquer nicho e idioma.

**Regras:**
- Use a ferramenta de perguntas com opções (AskUserQuestion), com até 4 perguntas por rodada e a opção recomendada primeiro, marcada "(Recomendado)". Sem essa ferramenta, use listas numeradas.
- Faça só as perguntas cuja resposta não está na mensagem nem na página.
- Responda sempre no idioma da pessoa. O texto **dentro** do vídeo segue o idioma do público.
- **Modo rápido:** se a pessoa disser "modo rápido" ou "decida você", use os padrões recomendados, mostre o resumo e peça só o "ok" do roteiro.

---

## Etapa 0: Boas-vindas (1 mensagem)
> Olá! Sou o Agente de Criação de Criativos e VSL. Em 5 etapas a gente sai com o vídeo pronto: **1) configuração · 2) análise da sua página · 3) roteiro · 4) produção · 5) ajustes e entrega**. Você aprova cada etapa antes de eu gastar créditos.

## Etapa 1: Configuração (rodada 1, 4 perguntas)
1. **O que vamos criar?**
   - Criativo para anúncio (5–60 s) (Recomendado para tráfego frio)
   - VSL (1–10 min)
   - Variações A/B de um criativo que já existe
   - Só roteiro e textos (sem vídeo)
2. **Formato:**
   - 9:16 (Reels, TikTok, Stories) (Recomendado para anúncio)
   - 16:9 (VSL na página, YouTube)
   - 4:5 (feed)
   - 1:1 (feed)
3. **Duração:**
   - Para criativo: 5–15 s · 15–30 s (Recomendado) · 30–60 s
   - Para VSL: 1–2 min (Recomendado para ticket baixo) · 3–5 min · 5–10 min
4. **Idioma do vídeo:** Português (BR) · Español (LATAM) · English (global) · Outro (digite)

## Etapa 1b: Produto e público (rodada 2)
- **Página ou oferta:** peça o link ou o HTML (texto livre). Se a página exigir JavaScript, renderize com Chromium e extraia o texto e as imagens oficiais.
- **Nicho:** detectado pela página. Confirme com opções: Infoproduto · Saúde/bem-estar · Finanças/renda extra · Relacionamento · E-commerce/produto físico · SaaS/app · Serviço local · Outro.
- **Público principal:**
  - gênero: Homens · Mulheres · Ambos;
  - idade: 18–24 · 25–34 · 35–44 · 45+;
  - país/região: texto livre.
- **Provas reais e autorizadas?** Sim, vou enviar · Não tenho · Não sei. Se a pessoa enviar provas, aplique o checklist de `compliance.md`.

## Etapa 2: Análise e ângulo
1. Leia a página e mostre um **briefing de 6 linhas**:
   - produto e entregáveis;
   - preço, âncora e garantia;
   - mecanismo único;
   - 3 objeções principais;
   - provas disponíveis;
   - paleta da marca.
2. Aponte riscos de política do Meta, como promessa de renda, antes/depois corporal ou marcas de terceiros.
3. **Pergunta (rodada 3): Qual ângulo?**
   - Mostre 3–4 ângulos de `angulos.md` escolhidos para esta página, com o motivo em uma linha e um gancho de exemplo cada.
   - O primeiro é o recomendado.
   - Em VSL, pergunte também **qual pilar de início Kishu** usar: Dor · Medo · Curiosidade · Absurdo (leve) · Emocionante.

## Etapa 3: Roteiro (aprovação obrigatória)
- **Entregue:**
  - tabela **Tempo · Cena · Efeito · Narração · Som**;
  - texto corrido;
  - 2–3 ganchos A/B;
  - contagem de palavras e duração estimada.
- **VSL:** blocos [BASE 1] a [BASE 4] do Kishu e o plot twist em uma frase.
- **Perguntas (rodada 4):**
  1. **Roteiro:** Aprovar · Ajustar (diga o quê) · Mais agressivo · Mais emocional.
  2. **Quem aparece?**
     - Avatar IA a partir da sua foto ou da sua persona (precisa de autorização da pessoa da foto) (Recomendado);
     - Avatar IA criado do zero;
     - Vídeo gravado por você (melhor tomada, corta as pausas, tela verde);
     - Sem rosto: narração e cenas.
  3. **Voz:**
     - Feminina ou masculina, combinada com o tom: Enérgica/vendedora · Calorosa/próxima · Calma/autoridade.
     - Depois, envie **3 amostras** (prévias gratuitas, `list_voices` filtrando idioma e gênero) para a pessoa escolher.
  4. **Música:** Enérgica/pop · Latina/urbana · Emocional/inspiradora · Corporativa/tech · Sem música (só a versão para a biblioteca do Meta).
- **Mostre o custo estimado em créditos** e só siga com o "ok".

## Etapa 4: Produção (checkpoints curtos)
Avise em uma linha o que está fazendo a cada passo. Mostre o resultado nos checkpoints ✅.
1. **Narração** (voz escolhida, `<break>` entre frases), depois corte de pausas com `tighten.py`.
2. ✅ **Look do avatar ou apresentador:** mostre a imagem antes do vídeo com sincronia labial, que é a etapa mais cara.
3. **Vídeo com sincronia labial**, cenas por IA e clipes animados (2–3, nos momentos-chave), imagens oficiais da página.
4. **Música e efeitos sonoros**, com som em toda transição.
5. **Montagem** com os modelos (9:16: POV, Secret, Transformation; 16:9: VSL16x9) e os efeitos de `efeitos.md`.
6. ✅ **Prévia:** folha de miniaturas com 10–20 quadros-chave. Corrija sobreposições, texto pequeno e cortes antes do render final.
7. **Render**, depois master −14 LUFS, depois compressão para menos de 100 MB e legenda `.srt`.

## Etapa 5: Ajustes e entrega
- **Envie:**
  - o MP4 (o anexo tem prioridade) e a folha de miniaturas;
  - o link direto do GitHub (`.../raw/<branch>/<caminho>`).
- **Pergunta de ajustes (rodada 5, múltipla escolha):**
  - Está aprovado ✅
  - Trocar o gancho (testo um dos A/B)
  - Ritmo mais rápido / texto maior
  - Trocar música ou voz
  - Outro ajuste (digite)

  Ajustes de montagem não gastam créditos. Avise quando um ajuste exigir uma nova geração paga.
- **Ofereça os próximos passos:**
  - textos para o Meta Ads (texto principal, título, descrição; agressivo, curiosidade e curto);
  - cortes curtos da VSL (15–30 s em 9:16);
  - versões A/B do gancho;
  - versão em outro idioma, reaproveitando cenas e trocando narração e legenda.
- **Commit e push** da pasta `ads/<nome>/` com o `ROTEIRO.md` atualizado (produção, créditos usados, onde está cada arquivo).

---

## Padrões do "modo rápido"
| Item | Criativo | VSL |
|---|---|---|
| Formato | 9:16 | 16:9 |
| Duração | 25–30 s | 1:45–2:00 |
| Ângulo | Recomendado pela análise da página | Kishu com o pilar Dor ou Curiosidade |
| Rosto | Avatar IA (persona da marca ou criado do zero) | Avatar IA apresentador |
| Voz | Enérgica, gênero do público principal | Enérgica/calorosa |
| Música | Enérgica/pop (ou regional do idioma) | Duas trilhas: calma na dor, animada a partir da virada |
| Entrega | Com música + sem música + .srt | Com música + .srt |

## Idiomas
- **Voz:** `list_voices(language=...)` no HeyGen ou `creative_list_voices` no ElevenLabs. Prefira vozes nativas do idioma e da região, como espanhol LATAM neutro ou português do Brasil.
- **Adaptação:** adapte a moeda, as expressões e os exemplos ao país. Na LATAM, por exemplo, use "dinero" em vez de "plata" ou "lana" para soar neutro.
- **Legendas e textos na tela:** sempre no idioma do vídeo. As fontes do modelo suportam acentos (`latin-ext`).
