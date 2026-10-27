# Efeitos de edição (criativos e VSL)

O agente de criativos deve dominar os 15 efeitos abaixo. Nos criativos curtos, use vários por vídeo (um a cada 1,5–4 s, sempre com som). Na VSL, use quando servirem à história (ver `vsl-kishu.md`).

Os componentes estão em `templates/remotion/src/Efeitos.tsx` (importe com `import { GanchoAnimado, … } from './Efeitos'`). Cada componente usa o frame local: coloque-o dentro de `<Sequence from={at('palavra')}>`. Para ver todos em ação: `npx remotion render src/index.ts EfeitosDemo out/efeitos.mp4`.

| # | Efeito | O que é | Quando usar | Como fazer | SFX |
|---|---|---|---|---|---|
| 01 | **Gancho animado** | Título do gancho entrando palavra por palavra, com marca-texto na palavra-chave | Sempre nos 0–3 s | `<GanchoAnimado text="…" highlight={['palavra']} />` | impacto grave + whoosh |
| 02 | **Palavra que bate** | Uma palavra sozinha "batendo" na tela com flash e tremida | Na palavra mais forte da frase ou no beat da música | `<PalavraQueBate word="NOPE." color={C.red} />` | hit / boom |
| 03 | **Legenda gigante** | 1–2 palavras por vez, enormes, com contorno | Trechos de impacto; Reels sem apresentador; VSL em momentos-chave | `<LegendaGigante words={…} />` (tempos relativos à Sequence) | — |
| 04 | **Barra de comando** | Barra de busca/prompt digitando uma pergunta e mostrando a resposta | A "descoberta", a dúvida do público, comparar com IA/pesquisa | `<BarraDeComando text="…" result="…" />` | teclado + "enter" |
| 05 | **Melhor tomada** | Mantém só a melhor (última completa) tomada de cada frase | Quando o vídeo foi gravado com repetições | `scripts/takes.py --video bruto.mp4 --words transcricao.json --script roteiro.txt …` | — |
| 06 | **Lista riscada** | Itens entrando e sendo riscados um a um, com o item certo no final | "Tudo o que eu tentei", mitos, erros, inimigo comum | `<ListaRiscada items={[…]} strikeAt={[…]} keep="…" />` | risco de caneta / nope |
| 07 | **Solta o arquivo** | Arquivo (PDF, planilha, guia) caindo na tela e "baixado ✓" | Mostrar entregáveis, bônus, "o que você recebe" | `<SoltaOArquivo name="50 Magnetic Bios" cover={<Img …/>} />` | queda + ding |
| 08 | **Corta as pausas** | Remove silêncios e respirações, deixando o ritmo rápido | Sempre: narração, avatar e vídeo gravado | Áudio: `scripts/tighten.py`; vídeo gravado: `tighten.py … --video bruto.mp4 --video-out corte.mp4` | — |
| 09 | **Carimbo** | Selo carimbado com tremida (NOPE, APPROVED, FAKE, SOLD OUT) | Veredito, julgamento, quebra de mito | `<Carimbo text="APPROVED" color={C.green} />` | stamp / impacto |
| 10 | **Antes e depois** | Cortina que revela o "depois" sobre o "antes" | Transformação (respeitando a categoria — sem corpo em saúde/peso) | `<AntesDepois before={…} after={…} />` | swoosh |
| 11 | **Tela verde** | Apresentador recortado sobre um print, página, gráfico ou produto | Comentar uma prova, a página de vendas, um dado | HeyGen `create_video_from_avatar` com `outputFormat: "webm"` ou `scripts/chroma.sh bruto.mp4 recorte.webm`; depois `<TelaVerde background={…} presenterSrc={staticFile('recorte.webm')} />` | — |
| 12 | **Zoom no rosto** | Punch-in rápido no rosto | Ênfase numa frase, reação, piada | `<ZoomNoRosto at={frame}>{vídeo}</ZoomNoRosto>` | whoosh curto |
| 13 | **Tela dividida** | Dois conteúdos empilhados (reação + objeto) | POV/reação, comparação | `<TelaDividida top={…} bottom={…} />` | — |
| 14 | **Notificação** | Banners de celular descendo do topo, empilhados | Prova de resultado, urgência, "o celular não parou" | `<Notificacao title="…" body="…" index={i} delay={i*8} />` (app genérico) | ping |
| 15 | **Pede comentário** | Balão digitando a palavra-chave + seta para os comentários | Conteúdo orgânico/Reels, captação por palavra-chave | `<PedeComentario keyword="SECRET" />` | pop |

## Regras
- **Um efeito por vez em destaque.** Não empilhe 3 animações no mesmo segundo; o olho precisa saber para onde olhar.
- **Zonas seguras:** nada importante em 0–220 px (topo), 1500–1920 px (base) e 960–1080 px (direita). A seta do "Pede comentário" fica na lateral direita de propósito, apontando para o botão de comentários.
- **Som em toda transição e em todo efeito** (biblioteca HeyGen `search_audio_sounds type: sound_effects`), volume 0,2–0,5, voz sempre na frente.
- **Cores:** troque o objeto `C` de `Efeitos.tsx` pela paleta da marca.
- **Notificação e barra de comando:** sempre genéricas — nunca logo, nome ou interface de app de terceiros.
- **Pede comentário em anúncio pago:** o Meta reduz a entrega de "engagement bait" ("comente SIM se…"). Em anúncio, use só quando o comentário tiver um motivo real (ex.: receber o link/material); em orgânico, pode usar à vontade.
- **Antes e depois:** em saúde, emagrecimento e estética, mostre o processo (prato, rotina, planilha), nunca o corpo.
