#!/usr/bin/env bash
# Instala as skills complementares do Agente Criativo e VSL no repositório atual,
# direto das fontes oficiais no GitHub: Hyperframes (HeyGen), Remotion, Taste Skill e Web Design Guidelines (Vercel).
# Ficam em .agents/skills/<nome> com links em .claude/skills/<nome>; faça commit para ficarem permanentes.
# Também cria os links das skills que vêm no plugin (criativo-video, transcrever-whisper, baixar-referencia).
# Uso (na raiz do repositório): bash plugins/agente-criativos-vsl/instalar-skills.sh
set -euo pipefail
RAIZ="$(pwd)"
PLUGIN="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$RAIZ/.agents/skills" "$RAIZ/.claude/skills" "$RAIZ/.claude/agents"

instalar() { # <pasta de origem> <nome> [licença]
  rm -rf "$RAIZ/.agents/skills/$2"
  cp -a "$1" "$RAIZ/.agents/skills/$2"
  [ -n "${3:-}" ] && cp "$3" "$RAIZ/.agents/skills/$2/LICENSE.upstream"
  ln -sfn "../../.agents/skills/$2" "$RAIZ/.claude/skills/$2"
  echo "  ✓ $2"
}
baixar() { git clone -q --depth 1 "https://github.com/$1" "$TMP/$2"; }

echo "Hyperframes (heygen-com/hyperframes)"
baixar heygen-com/hyperframes hf
for s in hyperframes hyperframes-cli hyperframes-registry media-use remotion-to-hyperframes reverse-any-video slideshow figma; do
  instalar "$TMP/hf/skills/$s" "$s" "$TMP/hf/LICENSE"
done

echo "Remotion (remotion-dev/skills)"
baixar remotion-dev/skills rm
for d in "$TMP"/rm/skills/*/; do instalar "$d" "$(basename "$d")"; done

echo "Taste Skill (Leonxlnx/taste-skill)"
baixar Leonxlnx/taste-skill ts
instalar "$TMP/ts/skills/taste-skill" design-taste-frontend "$TMP/ts/LICENSE"

echo "Web Design Guidelines (vercel-labs/agent-skills)"
baixar vercel-labs/agent-skills vc
instalar "$TMP/vc/skills/web-design-guidelines" web-design-guidelines

echo "Skills do plugin"
REL="${PLUGIN#"$RAIZ"/}"
for s in criativo-video transcrever-whisper baixar-referencia; do
  ln -sfn "../../$REL/skills/$s" "$RAIZ/.claude/skills/$s"; echo "  ✓ $s"
done
ln -sfn "../../$REL/agents/agente-criativos-vsl.md" "$RAIZ/.claude/agents/agente-criativos-vsl.md"

echo "Ferramentas: yt-dlp e faster-whisper (as skills também instalam na primeira vez)"
python3 -m pip install -q yt-dlp faster-whisper 2>/dev/null || echo "  (pule: instale depois com: python3 -m pip install yt-dlp faster-whisper)"
echo "Pronto. Faça commit de .agents/ e .claude/ e abra uma sessão nova."
