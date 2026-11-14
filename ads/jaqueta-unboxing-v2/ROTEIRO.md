# Vídeo de produto v2: jaqueta acolchoada azul-marinho · 1:1 · 1080×1080 · 15 s · 1,20x · sem áudio

**O que mudou desde a v1:**
- 8 planos;
- texto de geração focado em mãos reais (textura de pele, poros, pelos, nós dos dedos, unhas naturais, anatomia correta) e em movimento natural em tempo real (prompt enhancement "ultraquality");
- closes a partir das fotos de detalhe enviadas;
- montagem acelerada em 1,20x.

| # | Plano | Imagem de partida | Trecho usado (s) |
|---|---|---|---|
| 1 | Mãos afastam o papel de seda na caixa | foto da caixa | 0,8–3,4 |
| 2 | Mãos tiram a jaqueta da caixa | foto da caixa | 0,6–3,1 |
| 3 | Dedos sobem o zíper principal (puxador cinza) | foto do zíper | 0,9–3,2 |
| 4 | Mão dobra a gola e mostra o forro | foto da gola | 0,7–3,1 |
| 5 | Dedos abrem o zíper do bolso (puxador prateado) | foto do bolso | 2,5–4,5 |
| 6 | Mão segura o punho canelado | foto do punho | 0,6–2,6 |
| 7 | Mão no forro de pelúcia | foto do forro | 0,4–1,6 |
| 8 | Mão ajeita a jaqueta no cabide, aproximação final | foto do armário | 1,8–4,8 |

**Trechos descartados:**
- **Plano 2:** o final, depois de 3,1 s. A jaqueta perde as mangas e parece um colete, o que deixaria o produto diferente do real.
- **Plano 7:** usado só por 1 s. Nos nós dos dedos a mão parece artificial.
- **Foto do bolso com celular:** a jaqueta dessa foto é preta, e o produto do vídeo é azul-marinho.

**Produção:**
- HeyGen image-to-video (heygen-video-1, 1080p, 5 s por plano, 8 gerações);
- montagem em ffmpeg: 1,20x, zoom suave em cada corte, fade de entrada e de saída.
