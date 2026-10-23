# Anúncio 5 s — The 10X Match Secret (Meta Ads, 9:16)

Arquivo final: `final/ad-10x-match-5s.mp4` (1080×1920, 30 fps, 5,0 s, áudio −14 LUFS / pico −1,4 dBTP).

## Estratégia

- **Público:** homens, em inglês, que usam Tinder, Hinge ou Bumble e recebem poucos matches.
- **Ângulo:** a mesma promessa da página: *"It's not you. It's your profile."* Quem clica encontra o mesmo before/after (perfil do Ryan, 31) e o mesmo visual roxo-escuro.
- **Qualificação:** "Guys," chama só homens; o before/after mostra que o produto é **otimização de perfil**, não coaching nem app. O preço (US$ 9,90) já aparece no final para filtrar quem não compraria.
- **Gancho (0–1,8 s):** close real de um homem frustrado no sofá à noite + "0 new matches" + a voz feminina dizendo "Guys, it's not you."

## Roteiro (tempo · imagem · áudio · legenda)

| Tempo | Cena / motion | Voz (americana) | Legenda | SFX |
|---|---|---|---|---|
| 0,0–1,8 s | Vídeo realista: homem frustrado olhando o celular, push-in lento. Chip "0 new matches" sobe | "Guys, it's not you." | GUYS, → IT'S NOT YOU. | pop |
| 1,6–1,9 s | **Transição whip** (desliza para a esquerda com blur) | | | whoosh |
| 1,8–3,1 s | Cartão de perfil "Ryan 31": foto ruim + bio fraca (**BEFORE**) → cortina revela foto boa + bio magnética (**AFTER**) | "It's your profile." | IT'S YOUR → **PROFILE.** (marcador roxo) | swish na cortina |
| 2,9–3,0 s | **Transição zoom-punch** + flash roxo | | | whoosh |
| 3,0–4,3 s | Mesmo homem, agora sorrindo; 3 notificações "New match!" entram | "Fix it in 30 minutes." | FIX IT IN → 30 MINUTES. | 3 pings |
| 4,3–5,0 s | Cartão final: THE 10X MATCH SECRET™ · "Fix your *profile.*" · botão "Get it now · $9.90 →" · "20 photo setups · 50 bios · 1 secret" · "Illustration. Results vary." | — | — | impacto |

**Texto da narração:** "Guys, it's not you. It's your profile. Fix it in thirty minutes."
Voz: ElevenLabs "X – Confident, Playful, Expressive" (feminina, sotaque americano), modelo eleven_v4; as pausas foram encurtadas para 0,08 s e a velocidade ajustada para 1,05×.

## Legenda

- A legenda já está **gravada no vídeo**, palavra a palavra, porque a maioria assiste sem som.
- `final/ad-10x-match-5s.en.srt` é a versão em arquivo. **Não suba o .srt no Meta junto com esse vídeo**, senão a legenda aparece duas vezes. Ele serve para uma versão sem legenda gravada.

## Sugestão de textos para o Meta Ads

- **Texto principal:** It's not you — it's your profile. Copy the photo setups and bios the top profiles use. Fix yours in 30 minutes.
- **Título:** Fix Your Dating Profile — $9.90
- **Descrição:** 20 photo setups · 50 bios · 7-day guarantee
- **Botão:** Learn More (ou Shop Now)

## Conformidade

- Pessoas e cenas geradas por IA (ElevenLabs: Seedream 5 Pro, Nano Banana Pro, LTX 2). Nenhuma pessoa real; as notificações de match são encenação e o cartão final diz "Illustration. Results vary."
- Não usa logos nem telas do Tinder, Hinge ou Bumble. A foto "before" foi recortada para tirar o logo do carro.
- Nenhum número de matches prometido no vídeo.
- Meta: anúncios de relacionamento podem exigir aprovação prévia da conta. Se o Meta pedir, marque o selo de conteúdo feito com IA.

## Como editar

Projeto Remotion em `src/Ad.tsx` (os tempos ficam no objeto `T` e as legendas em `CAPTIONS`).

```bash
npm install
npx remotion render src/index.ts Ad out/render.mp4
```

Depois rode a masterização do áudio (loudnorm em duas passadas, −14 LUFS, pico −1,6 dBTP) como no histórico do commit.

Fluxo com as gerações na ElevenLabs: https://elevenlabs.io/app/flows/XF5MJBXA4nmjK3Hcdo8W
