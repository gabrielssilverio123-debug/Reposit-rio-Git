# The 10X Match Secret — POV (35 s) · personagem masculino, casal gay

> A pasta se chama `10x-match-pov-gay-5s` porque o pedido começou com 5 s; a versão aprovada tem **35 s**.

## Estratégia
- **Ângulo:** POV em primeira pessoa (UGC). Ele passa perfis ruins, descobre que o problema era o próprio perfil, usa o produto, dá match com "ele" e termina em um relacionamento.
- **Público:** frio, global, inglês. A segmentação é feita no Gerenciador de Anúncios. O texto nunca fala da orientação sexual de quem assiste.
- **Objeções quebradas:**
  - "o problema é minha aparência", respondida com *Same face. Same me.*;
  - "dá trabalho", respondida com *I just copied one.*;
  - "e se não funcionar?", respondida com *Seven-day guarantee*;
  - preço, com a âncora de $49 para $9,90.

## Narração (voz HeyGen "Ewan", ~85 palavras)
Three months on the apps. Zero matches. Nope. Nope. Nope. I thought it was me. My face, my job, my luck. Turns out? My profile was killing me in three seconds. Wrong photos. A bio that said nothing. So I tried The 10X Match Secret. Twenty photo setups that actually perform. Fifty magnetic bios. I just copied one. Same face. Same me. Then… him. It's a match. And then my phone wouldn't stop. Now? We're official. Nine ninety, not forty-nine. Seven-day guarantee. Tap below.

| Tempo | Cena | Som |
|---|---|---|
| 0–1,6 s | Gancho: ele em tela cheia com o selo "POV: 0 matches in 3 months" | scratch + sub drop |
| 1,6–4,3 s | Tela dividida: 3 perfis masculinos ruins levam o carimbo NOPE | swipe + nope ×3 |
| 4,3–8,3 s | "My face? My job? My luck?" + "0 matches" piscando | boom + nopes |
| 8,3–14,3 s | O perfil antigo dele com marcações (foto escura, bio vazia) e timer de 3 s | swish + hit |
| 14,3–21,8 s | Capas: principal, 20 Photo Setups, 50 Magnetic Bios e "✓ COPIED · Bio #17" | unlock + swishes + ping |
| 21,8–26,4 s | O novo perfil dele ("Same face"), depois Daniel, LIKE e IT'S A MATCH | sparkle + swipe |
| 26,4–28,0 s | Tela de bloqueio com notificações genéricas (sem logo de app), contador 0 → 37 | cascata de pings |
| 28,0–29,7 s | Revelação do casal: "Now we're official." + selo Dramatization | flash + sparkle |
| 29,7–35 s | Capa, ~~$49~~ $9.90, garantia de 7 dias, "FIX MY PROFILE NOW" | hit + cha-ching |

## Produção
- **Personagens 100% gerados por IA** (HeyGen `create_prompt_avatar`):
  - Marcus, o apresentador, inspirado na foto de referência, mas sem o rosto real;
  - Daniel, o perfil bom;
  - 3 perfis ruins;
  - o casal, gerado com Marcus e Daniel como referência.
- **Lip-sync:** HeyGen `create_video_from_avatar` (Avatar IV, expressividade alta). A barra de status do iPhone e o selo "REC" que vieram gravados foram cortados com ffmpeg.
- **Trilha:** biblioteca HeyGen ("upbeat modern advertising track, bright synth-pop"). Os SFX foram reaproveitados dos criativos anteriores.
- **Montagem e master:**
  - montagem em Remotion (`src/Ad.tsx`);
  - master em −14 LUFS: versão com música −14,3 LUFS / pico −1,5 dBFS; versão sem música −14,3 LUFS / −1,2 dBFS.

## Entregáveis (`final/`)
- `ad-10x-match-pov-gay-35s.mp4`: com música.
- `ad-10x-match-pov-gay-35s_no-music.mp4`: sem música, para usar a biblioteca do Meta.
- `ad-10x-match-pov-gay-35s.en.srt`: legenda.
- `contact-sheet.jpg`: miniaturas do vídeo.

## Conformidade (Meta)
- Todas as pessoas são fictícias, e o selo "DRAMATIZATION · AI-GENERATED CHARACTERS" aparece na cena do casal. Nada é apresentado como depoimento de cliente.
- O texto não fala da orientação sexual nem de outros atributos pessoais de quem assiste (sem "Are you gay?", "single?" etc.).
- As notificações e a tela de match são recriadas, sem logo nem interface de aplicativos de terceiros.
- Namoro pode exigir pré-aprovação da categoria no Meta. Ao subir, marque como conteúdo gerado por IA, se o Meta pedir.

## Textos sugeridos para o Meta
- **Texto principal:** Same face. New profile. 20 proven photo setups + 50 copy-paste bios that actually get replies. One-time $9.90 (not $49) with a 7-day money-back guarantee.
- **Título:** Fix your dating profile tonight
- **Botão:** Learn More / Shop Now
