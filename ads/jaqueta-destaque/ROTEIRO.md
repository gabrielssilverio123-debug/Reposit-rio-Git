# Vídeo "Destaques" da jaqueta azul-marinho · Shopify · 1:1 · 1080×1080 · 15 s (1,20x) · sem áudio

**Status:** aprovado e produzido. Puxador do bolso: prateado e liso (foto 4). Sem vídeo de motion control: cada cena foi gerada a partir das fotos reais.

**Mãos (iguais em todos os planos):**
- só aparecem as mãos e os antebraços;
- inspiradas no homem do vídeo de referência: cerca de 40 anos, pele clara-oliva levemente bronzeada, pelos finos no antebraço, unhas curtas e limpas, sem anel nem relógio;
- manga de tricô canelado marrom-escuro, como a do vídeo de referência;
- o rosto não aparece e não é recriado.

**Ambiente:**
- armário de madeira (foto 1) e mesa de madeira junto à janela, com luz natural suave;
- os closes partem das fotos de detalhe.

## Cenas
| # | Tempo final | Cena | Movimento (sentido correto) | Base |
|---|---|---|---|---|
| 1 | 0,0–2,3 s | Armário | A mão entra, segura a haste do cabide e tira a jaqueta da arara, puxando-a para fora e para baixo | foto 1 |
| 2 | 2,3–4,4 s | Mesa | A jaqueta é deitada aberta e reta sobre a mesa; as duas mãos alisam o peito, de cima para baixo | quadro novo gerado a partir das fotos 1 e 2 |
| 3 | 4,4–6,3 s | Gola | Dois dedos dobram a gola alta para fora e mostram o forro estampado por dentro, depois devolvem | foto 6 |
| 4 | 6,3–8,2 s | Zíper principal | Os dedos pegam o puxador «FASHION» no topo e **descem** o zíper cerca de 10 cm (abrindo), depois **sobem** (fechando) | foto 6 |
| 5 | 8,2–10,0 s | Bolso lateral | Os dedos pegam o puxador no topo do bolso e o **deslizam para baixo** ao longo do zíper, abrindo o bolso | foto 4 |
| 6 | 10,0–11,9 s | Celular no bolso | Com o bolso aberto, a mão coloca o celular para dentro até a metade, mostrando que cabe | foto 3 |
| 7 | 11,9–13,5 s | Punho | Os dedos esticam o punho canelado preto e soltam; ele volta justo | foto 5 |
| 8 | 13,5–15,0 s | Final | A jaqueta inteira na mesa, aproximação lenta, fade | quadro da cena 2 |

**Ritmo:**
- cortes secos com um leve zoom de impacto (sem efeitos chamativos);
- velocidade 1,20x;
- fade de entrada e de saída.

## Como os movimentos ficam realistas
- **Image-to-video com quadro inicial e quadro final** (HeyGen): cada cena tem a foto real como início e, quando dá, uma imagem do estado final (zíper aberto, celular no bolso). Isso trava o sentido do movimento e evita a peça se deformar.
- **Motion control** (Kling no ElevenLabs ou Higgsfield): copia o movimento de um vídeo real para a cena. O vídeo de referência enviado mostra um modelo vestindo um suéter, não alguém tirando a jaqueta do cabide nem mexendo nela em cima da mesa. Por isso ele serve como referência de mãos e de estilo, mas não como guia de movimento dessas cenas.
  - Para usar motion control de verdade, o ideal é um vídeo de celular de 5 a 10 s com mãos fazendo a ação da cena 1 ou 2, ou abrindo um zíper.

## Pontos a confirmar
- **Puxador do bolso:** na foto 4 o puxador do bolso é prateado e liso; na foto 3 (celular) é preto, com «FASHION». Qual vale para o bolso lateral?

## Custo estimado
- 1 imagem (a jaqueta deitada na mesa);
- 8 a 9 gerações de vídeo HeyGen em 1080p.

## Produção (feita)
- **Quadros gerados:**
  - a jaqueta deitada na mesa (GPT Image 2.6, a partir das fotos 1 e da caixa);
  - o bolso meio aberto, usado como quadro final para travar o sentido do zíper.
- **Foto 3 (celular):** recortada para tirar o puxador preto «FASHION» e manter o prateado.
- **Vídeos:** HeyGen image-to-video, 1080p, 5 s, "ultraquality".
  - 8 cenas, mais a cena do bolso refeita: na primeira tentativa o puxador ficou preto e o sentido saiu confuso;
  - a refeita usa quadro inicial e quadro final.
- **Montagem (ffmpeg):**
  - trechos de 1,7 a 2,8 s, somando 18 s, acelerados em 1,20x até 15 s;
  - zoom suave em cada corte e fade;
  - sem áudio nem texto.
- **Entrega:** `final/jaqueta-destaques-1080x1080.mp4` e `final/contact-sheet.jpg`.
