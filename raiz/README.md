# Ciclo da Água - Jogo (Phaser 3)

Protótipo educativo sobre o ciclo da água usando Phaser 3 e ES Modules (sem build step inicial).

## Como executar

Abra o arquivo `index.html` em um servidor local (requerido por causa de fetch de assets/JSON). Exemplos:

Python 3:

```bash
python3 -m http.server 8000
```

Acesse: <http://localhost:8000/raiz/>

Ou usando npx serve (se tiver Node.js):

```bash
npx serve .
```

## Estrutura

```text
index.html          # HTML principal
jogo.json           # Metadados do jogo
js/
  main.js           # Configuração Phaser e registro de cenas
  scenes/           # Cenas do jogo
  systems/          # Sistemas de lógica (drag, quiz, validação, dados)
assets/             # Imagens, áudio, etc.
style.css           # Estilos básicos
AI.md               # Ideias de uso de IA
README.md
```

## Fluxo de Cenas

BootScene -> MenuScene -> DragPhaseScene -> QuizPhaseScene -> ResultsScene

## Próximos Passos Sugeridos

- Adicionar assets reais (imagens do ciclo, ícones, etc.).
- Implementar lógica de arrastar com sprites e áreas-alvo.
- Definir modelo de dados das perguntas e interface de resposta.
- Persistir pontuação (localStorage).
- Adicionar acessibilidade básica (foco e alternativas de teclado).

## Licença

MIT (ajuste conforme necessário).
