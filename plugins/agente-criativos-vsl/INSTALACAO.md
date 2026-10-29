# Guia de instalação: Agente de Criação de Criativos e VSL

Tempo estimado: de 10 a 15 minutos. Você só faz uma vez por conta (conectores) e uma vez por projeto ou computador (agente).

---

## 1. Onde o agente funciona

| Onde | Funciona? | Observação |
|---|---|---|
| **Claude Code na web/app** (claude.ai/code, app desktop ou celular) | ✅ Completo | Recomendado. Já vem com Node, Python, ffmpeg e Chromium. |
| **Claude Code no terminal** (seu computador) | ✅ Completo | Precisa instalar Node, Python e ffmpeg (passo 5). |
| **Chat comum do claude.ai** (fora do Claude Code) | ⚠️ Parcial | Só a parte de estratégia: roteiros, ângulos, VSL Kishu e textos. Não renderiza vídeo. |

---

## 2. Instalar o agente

### Opção A: num repositório (recomendada)
1. Abra uma sessão do Claude Code no repositório onde vai criar os vídeos.
2. Envie o arquivo `agente-criativos-vsl-v1.x.zip` no chat e cole:
   > Instale este agente no projeto: descompacte em `plugins/`, crie os links `.claude/agents/agente-criativos-vsl.md` e `.claude/skills/criativo-video` apontando para `plugins/agente-criativos-vsl/…`, adicione `node_modules` e `out/` ao `.gitignore`, faça commit e push.
3. Confirme pedindo: *"Quais agentes você tem disponíveis?"*. O `agente-criativos-vsl` deve aparecer. Se não aparecer, abra uma sessão nova no mesmo repositório.

### Opção B: para todos os projetos do seu computador (terminal)
```bash
unzip agente-criativos-vsl-v1.x.zip -d ~/claude-plugins
mkdir -p ~/.claude/agents ~/.claude/skills
cp ~/claude-plugins/agente-criativos-vsl/agents/agente-criativos-vsl.md ~/.claude/agents/
cp -r ~/claude-plugins/agente-criativos-vsl/skills/criativo-video ~/.claude/skills/
```

### Opção C: como plugin para a equipe
1. Crie um repositório "marketplace" com esta pasta dentro e um `.claude-plugin/marketplace.json` listando o plugin.
2. Cada pessoa da equipe roda `/plugin marketplace add <dono>/<repositorio>` e depois `/plugin install agente-criativos-vsl@<marketplace>`.

### Opção D: só a estratégia no chat comum do claude.ai
Compacte a pasta `skills/criativo-video` em zip e envie em **Configurações → Capacidades → Skills**. Ela passa a funcionar para roteiros, ângulos, VSL e textos de anúncio.

---

## 3. Skills

| Skill | Obrigatória? | Para quê | Como adicionar |
|---|---|---|---|
| **criativo-video** (vem no zip) | ✅ Sim | É o método completo: fluxo guiado, ângulos, VSL Kishu, efeitos, compliance, pipeline, scripts e modelos | Instalada junto com o agente (passo 2) |
| CoDesign (IMG.LY) | Opcional | Thumbnails, posts e banners estáticos com a mesma identidade | Diretório de plugins do Claude: `/plugin` → buscar "codesign" |
| Creative Claw | Opcional | Gerar trilhas e efeitos sonoros sob medida | `/plugin` → buscar "creative claw" (precisa de conta) |
| Reelsmaker (it-reelsmaker) | Opcional | Editar vídeos gravados por você (cortes, legendas, layout de rosto) | `/plugin` → buscar "reelsmaker" |

O agente funciona só com a `criativo-video`. As opcionais ampliam o que ele faz.

---

## 4. Conectores (MCP)

Os conectores são ligados uma vez na sua conta em **https://claude.ai/customize/connectors**. Depois de conectar, **abra uma sessão nova**, porque os conectores são carregados quando a sessão começa.

### Recomendado
| Conector | O que o agente faz com ele |
|---|---|
| **HeyGen** (principal) | Narração em mais de 40 idiomas com tempo de cada palavra, avatar com sincronia labial a partir de foto ou de texto, avatar gerado a partir da foto da sua persona, imagens de cena, clipes animados (image-to-video), biblioteca de músicas e efeitos sonoros |
| **ElevenLabs** (complementar) | Vozes alternativas e mais expressivas, transcrição com tempo por palavra (para "melhor tomada" de vídeo gravado), geração de imagem e vídeo, e **ponte para baixar arquivos** quando o ambiente bloqueia os domínios do HeyGen |

### Alternativas (se você não tiver HeyGen ou ElevenLabs)
| Necessidade | Alternativas |
|---|---|
| Voz | ElevenLabs, Creative Claw (voiceover), ou você grava a narração no celular (o agente corta pausas e sincroniza) |
| Avatar com sincronia labial | HeyGen, ElevenLabs (OmniHuman, Creatify Aurora), Higgsfield, ou você grava a si mesmo (melhor tomada + corta pausas + tela verde) |
| Imagens de cena | HeyGen (prompt avatar), ElevenLabs (Seedream, Nano Banana, GPT Image), Higgsfield, Canva |
| Clipes animados | HeyGen (image-to-video), ElevenLabs (Kling, Veo, LTX), Higgsfield |
| Música e efeitos sonoros | Biblioteca do HeyGen (gratuita), Creative Claw, ElevenLabs Music/SFX, biblioteca de músicas do Meta (use a versão "sem música") |

**Sem nenhum conector**, o agente ainda produz com o que você enviar (vídeos gravados, fotos e áudio) usando Remotion e ffmpeg: cortes, legendas, efeitos, música e master.

---

## 5. Ambiente

### Claude Code na nuvem (web/app)
- **Ferramentas:** já vem tudo instalado.
- **Acesso de rede:** se o seu ambiente usa acesso "Limited", adicione em **Network access → Allowed domains** (menu do ambiente no título da sessão → Edit):
  - `*.heygen.ai`
  - `heygen-resources-prod.s3-accelerate.amazonaws.com`
  - `heygen-product.s3-accelerate.amazonaws.com`
  - `storage.googleapis.com`
  - `fonts.googleapis.com`
  - `fonts.gstatic.com`

  Guia: https://code.claude.com/docs/en/cloud-environments#network-access

  Se os domínios do HeyGen continuarem bloqueados, o agente usa a ponte do ElevenLabs automaticamente.

### Claude Code no terminal
- **Node.js 18+:** `node -v`
- **Python 3:** `python3 --version`
- **ffmpeg:** `ffmpeg -version`. Instale com `brew install ffmpeg` no Mac ou `sudo apt install ffmpeg` no Linux.
- **Remotion** (o agente roda na primeira vez): `npm install` dentro da pasta do criativo. O navegador de render é baixado sozinho.

---

## 6. Teste rápido (2 minutos, sem gastar créditos)
Peça ao Claude:
> Use o agente-criativos-vsl. Quero testar a instalação: renderize a demonstração de efeitos (composição EfeitosDemo) e me mande o vídeo.

Se o vídeo de demonstração chegar, a instalação está completa. Depois peça:
> Use o agente-criativos-vsl para criar um criativo.

O fluxo guiado começa com as perguntas de configuração.

---

## 7. Problemas comuns
| Sintoma | Solução |
|---|---|
| O agente não aparece | Abra uma sessão nova no repositório; confira se `.claude/agents/agente-criativos-vsl.md` existe |
| "Conector não disponível" | Conecte em claude.ai/customize/connectors e abra uma sessão nova |
| Download do HeyGen falha (403) | Libere os domínios do passo 5 ou deixe o agente usar a ponte do ElevenLabs |
| Render interrompido | Vídeos longos levam cerca de 1 min de render por 10 s de vídeo; o agente roda em segundo plano com limite de 30 min ou mais |
| Arquivo acima de 100 MB no GitHub | O agente comprime o final (cerca de 50 MB para 2 min) e deixa os brutos grandes fora do git |
