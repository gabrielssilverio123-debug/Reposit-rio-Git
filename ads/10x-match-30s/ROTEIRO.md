# Anúncio 30 s — The 10X Match Secret (Meta Ads, 9:16, público frio)

Arquivo final: `final/ad-10x-match-30s.mp4` (1080×1920, 30 fps, 30,0 s, áudio −14 LUFS / pico −1,6 dBTP).
Legenda em arquivo: `final/ad-10x-match-30s.en.srt`. A legenda já está gravada no vídeo, então não suba o .srt junto.

## Referências de formatos de alta conversão aplicadas

1. **Gancho visual + texto nos 3 primeiros segundos:** antes e depois em tela dividida, "Same guy. Same face." (padrão de "transformation hook").
2. **Estrutura problema → mecanismo → demonstração → prova → oferta**, que é a mais usada em infoprodutos de ticket baixo.
3. **Mecanismo único** nomeado e visual: "1M+ profiles analyzed / top ones do 3 things", espelhando a seção LIVE ANALYSIS da página.
4. **Demonstração do antes e depois no mesmo personagem**, quebrando a objeção "isso funciona?". Depois, prova social com print de cliente.
5. **Oferta com ancoragem de preço** ($49 → $9.90), garantia de 7 dias e CTA com seta para baixo, apontando para o botão do Meta.
6. **Legendas palavra a palavra** (assistir sem som), troca de cena a cada 1,5–4 s e efeito sonoro em cada transição.
7. **Mesmo visual da página** (preto-violeta, Inter + serifa itálica, cartão do "Ryan 31", selos BEFORE/AFTER, TOP), para quem clica reconhecer a continuidade.

## Roteiro

| Tempo | Cena | Narração (voz masculina americana: HeyGen "Jackson – Smooth & Warm") |
|---|---|---|
| 0–3 s | Tela dividida BEFORE / AFTER (mesmo homem), "0 matches" × "New matches" | Same guy. Same face. Completely different results. |
| 3–6,5 s | Cartão do perfil "Ryan 31": foto marcada, bio sublinhada, selo "0 matches" | Before: dark selfie, forgettable bio, zero matches. |
| 6,5–8,2 s | Vídeo real do homem frustrado (close) | It wasn't him. It was his profile. |
| 8,2–12,1 s | Contador 0 → 1,000,000+, grade de perfis, 3 marcados como TOP, selos 01/02/03 | We analyzed over a million dating profiles. The top ones all do three things. |
| 12,1–16,5 s | Mesmo cartão sendo corrigido: foto → bio → visibilidade, selo "30 MIN" | He copied them — better photos, a magnetic bio, the right settings — in thirty minutes. |
| 16,5–18 s | Vídeo real do homem rindo + notificações "New match!" | Then the matches started coming in. |
| 18–21 s | Print da mensagem do cliente com destaque em "almost 10X more matches" | One customer told us: "I'm getting almost 10X more matches." |
| 21–30 s | Capa do produto, 20 PHOTO SETUPS / 50 MAGNETIC BIOS, ~~$49~~ $9.90, garantia de 7 dias, botão GET INSTANT ACCESS | The 10X Match Secret. Twenty photo setups, fifty magnetic bios. Just nine-ninety, with a seven-day money-back guarantee. Tap below. |

## Conformidade

- Cenas com o personagem são encenação, com o aviso "Dramatization" ou "Illustration of the method. Results vary." na tela.
- Avaliação: usar **somente se for mensagem real de cliente, com autorização**. Aviso "Individual result. Results vary." na tela. O logo do Tinder e o único rosto nítido foram desfocados.
- Narração em terceira pessoa ("he") para evitar a regra do Meta sobre atributos pessoais.
- Sem música gravada (direitos autorais). Adicione uma música licenciada no Gerenciador de Anúncios se quiser.

## Sugestão de textos para o Meta Ads

- **Texto principal:** Same guy, same face — different profile. We analyzed 1M+ dating profiles and turned what the top ones do into 20 photo setups, 50 magnetic bios and a step-by-step optimization. Fix yours in 30 minutes. 7-day money-back guarantee.
- **Título:** Fix Your Dating Profile — $9.90
- **Botão:** Learn More ou Shop Now

## Editar e renderizar

```bash
npm install            # ou use o node_modules do projeto de 5 s
npx remotion render src/index.ts Ad out/render.mp4
```

Os tempos das cenas vêm das palavras da narração (`public/words.json`) e são definidos no objeto `S` de `src/Ad.tsx`.
