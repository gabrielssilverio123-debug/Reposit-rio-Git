# Guia de instalação: Agente Criativo e VSL

**Versão do agente:** 1.9 · **Tempo estimado:** 15 minutos

Você instala uma vez por conta (conectores) e uma vez por repositório (agente).

> **Para chamar o agente, digite sempre: `agente criativo e vsl`**

---

## 1. Onde o agente funciona

| Onde | Funciona? | Observação |
|---|---|---|
| **Claude Code na web/app** (claude.ai/code, app desktop ou celular) | ✅ Completo | Recomendado. Já vem com Node, Python, ffmpeg e Chromium. |
| **Claude Code no terminal** (seu computador) | ✅ Completo | Precisa instalar Node, Python e ffmpeg (passo 6). |
| **Chat comum do claude.ai** (fora do Claude Code) | ⚠️ Parcial | Só estratégia: roteiros (inclusive VSL de 2–20 min), ângulos, Kishu e textos. Não renderiza vídeo. |

---

## 2. Pré-requisito: um repositório Git limpo, só para os criativos

O agente salva cada criativo numa pasta própria (`ads/<nome>/`) com roteiro, imagens, áudio, código da edição e vídeos finais, e faz commit e push a cada entrega. Por isso ele precisa de **um repositório novo e vazio, dedicado a ele**:
- não misture com o código do seu site, loja ou app, porque os vídeos ocupam espaço e geram muitos commits;
- o histórico do repositório vira o seu acervo de criativos, organizado e com versões;
- se algo der errado, nada do seu projeto principal é afetado.

**Como criar:**
1. No GitHub, clique em **New repository**.
2. Preencha:
   - **Nome:** por exemplo `criativos-minhamarca`;
   - **Visibilidade:** **Private**, já que seus criativos e roteiros são material da sua empresa;
   - marque **"Add a README file"**, porque o repositório não pode ficar totalmente vazio;
   - deixe o restante como está.
3. Dê ao Claude acesso a esse repositório:
   - **Claude Code na web/app:** em claude.ai/code, conecte o GitHub e autorize o app do Claude no repositório novo (em "Only select repositories", marque o repositório).
   - **Terminal:** `git clone https://github.com/<seu-usuario>/criativos-minhamarca.git`, depois `cd criativos-minhamarca` e por fim `claude`.
4. Abra uma **sessão do Claude Code nesse repositório**. Na web, escolha o repositório ao iniciar a sessão.

> Já tem um repositório só de criativos, sem outros projetos? Pode usá-lo. O importante é não ser o repositório do seu site ou sistema.

---

## 3. Instalar o agente no repositório

### Opção A: enviando o zip no chat (recomendada)
1. Na sessão aberta no repositório limpo, envie o arquivo `agente-criativos-vsl-v1.9.zip` e cole:
   > Instale este agente no projeto: descompacte em `plugins/`, rode `bash plugins/agente-criativos-vsl/instalar-skills.sh` na raiz (ele cria os links do agente e das skills e instala as skills complementares do GitHub), crie um `.gitignore` com `node_modules`, `out/` e `assets/`, copie o conteúdo de `plugins/agente-criativos-vsl/CLAUDE-snippet.md` para o `CLAUDE.md` da raiz (crie se não existir), faça commit e push.
2. Abra uma **sessão nova** no mesmo repositório e digite **`agente criativo e vsl`**. Ele deve responder com as boas-vindas e as primeiras perguntas.

   O `CLAUDE.md` é o que faz a frase "agente criativo e vsl" chamar o agente, com as perguntas aparecendo aqui no chat.

### Opção B: para todos os projetos do seu computador (terminal)
```bash
unzip agente-criativos-vsl-v1.9.zip -d ~/claude-plugins
mkdir -p ~/.claude/agents ~/.claude/skills
cp ~/claude-plugins/agente-criativos-vsl/agents/agente-criativos-vsl.md ~/.claude/agents/
cp -r ~/claude-plugins/agente-criativos-vsl/skills/criativo-video ~/claude-plugins/agente-criativos-vsl/skills/transcrever-whisper ~/claude-plugins/agente-criativos-vsl/skills/baixar-referencia ~/.claude/skills/
cat ~/claude-plugins/agente-criativos-vsl/CLAUDE-snippet.md >> ~/.claude/CLAUDE.md
```
Mesmo assim, **trabalhe sempre dentro do repositório limpo** do passo 2.

### Opção C: como plugin para a equipe
1. Crie um repositório "marketplace" com esta pasta dentro e um `.claude-plugin/marketplace.json` listando o plugin.
2. Cada pessoa da equipe roda `/plugin marketplace add <dono>/<repositorio>` e depois `/plugin install agente-criativos-vsl@<marketplace>`.

### Opção D: só a estratégia no chat comum do claude.ai
Compacte a pasta `skills/criativo-video` em zip e envie em **Configurações → Capacidades → Skills**.

---

## 4. Skills

| Skill | Obrigatória? | O que o agente faz com ela | Como adicionar e liberar |
|---|---|---|---|
| **criativo-video** (vem no zip) | ✅ Sim | Método completo: fluxo guiado, ângulos, VSL Kishu, 15 efeitos, compliance, modelos de edição | Instalada junto com o agente (passo 3) |
| **Reelsmaker** (`it-reelsmaker`) | Opcional | Edita vídeo vertical **gravado por você**: transcrição, cortes de pausas e retakes, rosto medido, perfil de marca, legendas, cenas desenhadas | `/plugin` → buscar "reelsmaker". Na nuvem funciona sem configuração extra. Para transcrição local, libere `huggingface.co` e `*.hf.co` |
| **CoDesign** (IMG.LY) | Opcional | **Peças estáticas e animadas** da campanha: capa ou thumbnail da VSL, posts, carrossel, stories, end card, redimensionar e traduzir | `/plugin` → buscar "codesign". Libere `img.ly` e `*.img.ly` e faça login (veja abaixo) |
| **Creative Claw** | Opcional | **Trilha original, efeitos sonoros e voz sob medida** e UGC | `/plugin` → buscar "creative claw". Libere `creativeclaw.co` e `*.creativeclaw.co`. Precisa de conta |
| **transcrever-whisper** (vem no zip) | Recomendada | Transcreve referências, vídeos gravados e narrações com tempo por palavra, sem custo (Whisper local) | Instalada pelo `instalar-skills.sh`. Na nuvem, libere `huggingface.co` e `*.hf.co` para o modelo |
| **baixar-referencia** (vem no zip) | Recomendada | Baixa o criativo ou VSL de referência pelo link (YouTube, TikTok, Instagram, Facebook) com yt-dlp | Instalada pelo `instalar-skills.sh`. Na nuvem, libere os domínios da plataforma (passo 6) |
| **Remotion oficiais** (`remotion-dev/skills`, 12 skills) | Recomendada | Boas práticas oficiais de montagem, legendas e render no Remotion, que o agente usa em todo vídeo | `instalar-skills.sh`, ou `npx skills add remotion-dev/skills` |
| **Hyperframes** (`heygen-com/hyperframes`, 8 skills) | Opcional | Motion graphics em HTML para vídeo (títulos 3D, gráficos, transições), cerca de 450 blocos prontos e `reverse-any-video` para recriar a estrutura de uma referência | `instalar-skills.sh`, ou `npx skills add heygen-com/hyperframes`. Precisa de Node 22+ |
| **Taste Skill** (`design-taste-frontend`) | Opcional | Direção de arte para a página de vendas e peças desenhadas em código, com visual menos genérico | `instalar-skills.sh`, ou `npx skills add Leonxlnx/taste-skill` |
| **Web Design Guidelines** (Vercel) | Opcional | Auditoria da página de vendas (acessibilidade, interface, boas práticas) antes de escalar o anúncio | `instalar-skills.sh`, ou `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` |

**Instalação de todas de uma vez:** na raiz do repositório, rode `bash plugins/agente-criativos-vsl/instalar-skills.sh`. Ele baixa as skills das fontes oficiais no GitHub para `.agents/skills/`, cria os links em `.claude/skills/` e instala `yt-dlp` e `faster-whisper`. **Faça commit** de `.agents/` e `.claude/`: assim as skills ficam permanentes no repositório e aparecem em toda sessão.

No Claude Code na nuvem, o `yt-dlp` e o `faster-whisper` precisam ser reinstalados a cada sessão nova, porque o ambiente recomeça do zero. As duas skills fazem isso sozinhas na primeira vez que são usadas.

O agente verifica sozinho quais estão disponíveis no início de cada sessão e só oferece o que funciona. Sem elas, ele usa as alternativas próprias (Remotion, scripts e biblioteca do HeyGen).

**Login da CoDesign no Claude Code na nuvem:**
1. Peça ao agente: *"faça o login da CoDesign"*.
2. Abra o link que ele enviar e entre na sua conta IMG.LY.
3. No final, o navegador mostra um erro de página em `127.0.0.1:…/callback?code=…`. É esperado: **copie o endereço inteiro e cole no chat**.
4. O agente conclui o login. O link vale por 10 minutos.

## 5. Conectores (MCP)

Os conectores são ligados uma vez na sua conta em **https://claude.ai/customize/connectors**. Depois de conectar, **abra uma sessão nova**, porque os conectores são carregados quando a sessão começa.

### Recomendado
| Conector | O que o agente faz com ele |
|---|---|
| **HeyGen** (principal) | Narração em mais de 40 idiomas com o tempo de cada palavra, avatar com sincronia labial (a partir de foto ou de texto), avatar a partir da foto da sua persona, imagens de cena, clipes animados (image-to-video), biblioteca de músicas e efeitos sonoros |
| **ElevenLabs** (complementar) | Vozes alternativas e mais expressivas, transcrição com tempo por palavra (para "melhor tomada" de vídeo gravado), geração de imagem e vídeo, e **ponte para baixar arquivos** quando o ambiente bloqueia os domínios do HeyGen |

Os dois cobram por créditos da própria plataforma. O agente sempre mostra o custo estimado e espera o seu "ok" antes de gerar.

### Alternativas
| Necessidade | Alternativas |
|---|---|
| Voz | ElevenLabs, Creative Claw (voiceover), ou você grava a narração no celular (o agente corta pausas e sincroniza) |
| Avatar com sincronia labial | HeyGen, ElevenLabs (OmniHuman, Creatify Aurora), Higgsfield, ou você grava a si mesmo (melhor tomada, corta as pausas, tela verde) |
| Imagens de cena | HeyGen (prompt avatar), ElevenLabs (Seedream, Nano Banana, GPT Image), Higgsfield, Canva |
| Clipes animados | HeyGen (image-to-video), ElevenLabs (Kling, Veo, LTX), Higgsfield |
| Música e efeitos sonoros | Biblioteca do HeyGen (gratuita), Creative Claw, ElevenLabs Music/SFX, biblioteca de músicas do Meta (use a versão "sem música") |

**Sem nenhum conector**, o agente ainda produz com o que você enviar (vídeos gravados, fotos e áudio) usando Remotion e ffmpeg: cortes, legendas, efeitos, música e master.

---

## 6. Ambiente

### Claude Code na nuvem (web/app)
- **Ferramentas:** já vem tudo instalado.
- **Acesso de rede:** se o seu ambiente usa acesso "Limited", adicione em **Network access → Allowed domains** (menu do ambiente no título da sessão → Edit):
  - `*.heygen.ai`
  - `heygen-resources-prod.s3-accelerate.amazonaws.com`
  - `heygen-product.s3-accelerate.amazonaws.com`
  - `storage.googleapis.com`
  - `fonts.googleapis.com`
  - `fonts.gstatic.com`
  - `img.ly` e `*.img.ly` (CoDesign, opcional)
  - `creativeclaw.co` e `*.creativeclaw.co` (Creative Claw, opcional)
  - `huggingface.co` e `*.hf.co` (modelo do Whisper para `transcrever-whisper` e Reelsmaker, opcional)
  - links de referência com `baixar-referencia` (opcional):
    - YouTube: `youtube.com`, `*.youtube.com`, `*.googlevideo.com`, `*.ytimg.com`;
    - TikTok: `tiktok.com`, `*.tiktok.com`, `*.tiktokcdn.com`;
    - Instagram e Facebook: `instagram.com`, `*.instagram.com`, `*.cdninstagram.com`, `facebook.com`, `*.facebook.com`, `*.fbcdn.net`
  - `github.com` e `raw.githubusercontent.com` (instalar as skills e Web Design Guidelines)
  - `registry.npmjs.org` (Remotion e CLI do Hyperframes)

  Guia: https://code.claude.com/docs/en/cloud-environments#network-access

  Se os domínios do HeyGen continuarem bloqueados, o agente usa a ponte do ElevenLabs automaticamente.

### Claude Code no terminal
- **Node.js 18+** (22+ para o Hyperframes): `node -v`
- **Python 3:** `python3 --version`
- **ffmpeg:** `ffmpeg -version`. Instale com `brew install ffmpeg` no Mac ou `sudo apt install ffmpeg` no Linux.
- **Remotion:** o agente instala sozinho na primeira vez com `npm install`.

---

## 7. Teste rápido (2 minutos, sem gastar créditos)
Na sessão do repositório limpo, peça:
> agente criativo e vsl: quero testar a instalação. Renderize a demonstração de efeitos (composição EfeitosDemo) e me mande o vídeo.

Se o vídeo de demonstração chegar, a instalação está completa.

---

## 8. Primeiro uso
Digite:
> **agente criativo e vsl**

Você também pode já dizer o que quer (ex.: *"agente criativo e vsl, quero uma VSL de 10 min"*). O agente conduz tudo com perguntas de múltipla escolha:
1. **Configuração:**
   - o que criar, formato e idioma;
   - duração: criativo em segundos ou VSL em minutos (qualquer valor de 2 a 20 min);
   - **o seu site ou página de vendas**, ou um vídeo ou material do produto, se ainda não tiver página;
   - nicho, público e provas.
2. **Análise da página:** resumo da oferta, alertas de política do Meta e escolha do ângulo.
3. **Roteiro:** tabela com cenas e efeitos, ganchos A/B, escolha de rosto, voz e música, custo e aprovação.
4. **Produção com checkpoints:** narração, look do avatar ✅, vídeo, música e efeitos, montagem, miniaturas ✅ e render.
5. **Ajustes e entrega:** o MP4 no chat e no GitHub, mais textos para Meta Ads, cortes e versões A/B.

Para ir direto com os padrões recomendados, diga **"modo rápido"**.

📎 **Em todas as etapas você pode enviar referências**, e o agente analisa cada uma antes de usar:
- um criativo ou VSL que você gosta (para formato, ritmo e estilo);
- o kit da sua marca;
- fotos e vídeos do produto;
- um roteiro pronto;
- uma narração já gravada (dispensa a voz gerada e economiza créditos);
- uma amostra de voz ou de música de referência;
- B-roll próprio;
- prints do que quer ajustar.

---

## 9. Problemas comuns
| Sintoma | Solução |
|---|---|
| Uma skill complementar não aparece | Rode `bash plugins/agente-criativos-vsl/instalar-skills.sh`, faça commit de `.agents/` e `.claude/` e abra uma sessão nova |
| Whisper: "Não consegui carregar o modelo" | Libere `huggingface.co` e `*.hf.co` e abra uma sessão nova; enquanto isso, o agente usa os tempos da narração do HeyGen |
| Link de referência não baixa | Libere os domínios da plataforma (passo 6) ou baixe o vídeo e envie o arquivo no chat; Instagram e Facebook às vezes exigem login |
| O agente não responde a "agente criativo e vsl" | Abra uma sessão nova no repositório; confira se o `CLAUDE.md` da raiz tem o trecho do `CLAUDE-snippet.md` e se `.claude/skills/criativo-video` existe |
| "Conector não disponível" | Conecte em claude.ai/customize/connectors e abra uma sessão nova |
| O Claude não vê o repositório | Autorize o app do Claude no repositório (GitHub → Settings → Applications → Claude → Repository access) |
| Download do HeyGen falha (403) | Libere os domínios do passo 6 ou deixe o agente usar a ponte do ElevenLabs |
| Render interrompido | Vídeos longos levam cerca de 1 min de render por 10 s de vídeo. Em VSLs de 10–20 min, o agente renderiza por blocos e une no final (até ~2 h) |
| Push recusado por arquivo acima de 100 MB | O agente comprime o final (cerca de 50 MB para 2 min) e deixa os brutos grandes fora do git (`assets/` no `.gitignore`) |
