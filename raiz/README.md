# Ciclo da Água (Phaser 3)

Jogo educativo interativo em múltiplas etapas (arrastar/associar, painel de resultados parciais e quiz) para reforçar os principais processos do ciclo da água.

## Objetivo Pedagógico

Facilitar a memorização e compreensão dos estágios (Evaporação, Condensação, Precipitação, Infiltração) por meio de:

1. Associação visual (fase de arrastar) — construção ativa do diagrama.
2. Avaliação formativa (quiz) — consolidação e correção imediata.
3. Feedback rápido + possibilidade de reinício — reforço e repetição espaçada.

## Como Executar

É necessário um servidor local simples (fetch de `jogo.json`). Duas opções rápidas:

Opção Python 3:

```bash
python3 -m http.server 8000
```

Acesse: <http://localhost:8000/raiz/>

Opção Node.js (npx):

```bash
npx serve .
```

Sem dependências de build: usa ES Modules direto no navegador moderno.

### Executar via Docker

Build da imagem:

```bash
docker build -t ciclo-agua-game .
```

Rodar container (porta 8080):

```bash
docker run --rm -p 8080:8080 ciclo-agua-game
```

Acesse: <http://localhost:8080/>

Customizar porta:

```bash
docker run --rm -e PORT=9090 -p 9090:9090 ciclo-agua-game
```

Atualizar código (dev rápido): montar bind local:

```bash
docker run --rm -p 8080:8080 -v "$(pwd)/raiz":/app/raiz ciclo-agua-game
```

### Makefile (atalhos)

Após clonar e (opcional) `npm install`:

| Comando             | Ação                                       |
| ------------------- | ------------------------------------------ |
| `make run`          | Servidor Python em :8000 (PORT variável)   |
| `make test`         | Roda Jest                                  |
| `make docker-build` | Build imagem Docker                        |
| `make docker-run`   | Executa imagem na porta 8080 (DOCKER_PORT) |
| `make docker-dev`   | Roda Docker montando pasta local           |
| `make clean-node`   | Remove node_modules e lock                 |
| `make ci`           | Instala dependências + testes              |

Variáveis: `PORT=9000 make run`, `DOCKER_PORT=9090 make docker-run`.

## Qualidade de Código (Lint)

O projeto utiliza **ESLint (Flat Config)** para padronizar estilo básico (ex: sem ponto e vírgula) e evitar problemas comuns (imports inválidos, variáveis não usadas, etc.).

Scripts:

```bash
npm run lint     # Analisa código
npm run lint:fix # Corrige automaticamente
```

Arquivo principal:

- `eslint.config.js`: regras (semi nunca, import/no-unresolved, jest, no-unused-vars c/ prefixo _ )

Workflow sugerido antes de commit:

```bash
npm run lint:fix && npm test
```

Possível melhoria futura: hook pre-commit (husky) rodando lint + testes.

Em CI (futuro):

```bash
npm ci
npm run lint
npm test
```

Para ignorar arquivos do lint, ajustar a chave `ignores` em `eslint.config.js`.

## Estrutura de Pastas

```text
raiz/
  index.html        # Entrada (título/ícone agora definidos dinamicamente pelo jogo.json)
  jogo.json         # Conteúdo, textos, ícone, pesos de pontuação, config de drag/quiz
  style.css         # Estilos e modo alto contraste
  js/
    main.js         # Configuração Phaser + registro das cenas
    scenes/
      BootScene.js       # Carrega dados, aplica acessibilidade, define título/ícone
      MenuScene.js       # Menu inicial + troca de dataset (tecla 'D')
      DragPhaseScene.js  # Fase de arrastar (com timer e sons)
      DragResultScene.js # Painel intermediário de resultado do drag
      QuizPhaseScene.js  # Fase de quiz (animações e feedback imediato)
      ResultsScene.js    # Resultado final consolidado
    systems/
      dragSystem.js      # Lógica de drag & drop
      quizSystem.js      # Lógica e UI do quiz
      timer.js           # Componente reutilizável de contagem regressiva
      validation.js      # Validações centralizadas (drag & quiz, cores)
      dataLoader.js      # Cache + carregamento de JSON
      ui.js              # Utilitário de leitura de paths
  assets/
    sfx/                 # Áudios (success, wrong, ui_start, quiz_complete, timer_countdown)
```

## Editando `jogo.json`

Principais blocos:

- `ui`: textos de interface (título, botões, mensagens, ícone).
- `pontuacao`: pesos (%) de cada fase (`pesoDrag`, `pesoQuiz`). Soma recomendada = 100 (internamente normalizado 0–100).
- `acessibilidade.altoContraste`: true/false adiciona classe CSS para maior contraste.
- `drag`:
  - `targets`: nomes das etapas corretas.
  - `blocks`: peças arrastáveis exibidas ao jogador.
  - `map`: mapeia cada block -> target correto.
  - `descricoes`: texto explicativo mostrado futuramente (base para expansões).
  - (Opcional) `cores`: `acerto` e `erro` (hex ou número) para bordas de feedback.
  - (Opcional) `tempoSegundos`: duração do temporizador da fase (default interno se ausente).
- `quiz.perguntas[]`: cada item contém `texto`, `alternativas[]` e índice `correta`.

Campos adicionais recentes:

```jsonc
"ui": {
  "titulo": "Ciclo da Água",
  "icone": "data:image/svg+xml,%3Csvg ...%3C/svg%3E" // (Opcional) favicon inline ou URL
}

"drag": {
  "tempoSegundos": 60,
  "cores": { "acerto": "#1e7d4e", "erro": "#b33939" }
}
```

Exemplo de customização de cores (adicione dentro de `drag`):

```jsonc
"cores": {
  "acerto": "#1e7d4e",
  "erro": "#cc2222"
}
```

## Justificativa do Uso de Phaser 3

- Simplicidade de cena/estado: transições claras Boot→Menu→Fases→Resultado.
- Input e tweens prontos (drag, animação de shake) sem reinventar.
- Ecossistema estável e leve para protótipo sem bundler.
- Escalável para adicionar sprites, áudio e responsividade depois.

## Critérios do Teste e Atendimento

| Critério                     | Implementação                                                          |
| ---------------------------- | ---------------------------------------------------------------------- |
| Separação conteúdo vs lógica | Todo texto/config em `jogo.json`; código só consome.                   |
| Fases distintas              | DragPhase + QuizPhase + Results com fluxo encadeado.                   |
| Pontuação clara              | Cálculo ponderado (pesos configuráveis) normalizado 0–100.             |
| Feedback imediato            | Borda verde no acerto, vermelha no erro (shake + retorno).             |
| Acessibilidade inicial       | Modo alto contraste via flag JSON + cores ajustadas.                   |
| Robustez de dados            | `dataLoader` com cache, validação e fallback mock.                     |
| Reinício seguro              | Botão Reiniciar recria estado mantendo JSON carregado.                 |
| Extensibilidade              | Campos opcionais (`descricoes`, `cores`) e modularização por sistemas. |
| Internacionalização futura   | Estrutura `ui.*` centraliza strings.                                   |

## Fluxo de Cenas

BootScene → MenuScene → DragPhaseScene → DragResultScene → QuizPhaseScene → ResultsScene.

Resumo rápido:

- Boot: carrega JSON, aplica alto contraste, título e ícone dinâmicos.
- Menu: exibe título e botão iniciar.
- Drag: arrastar blocos; timer opcional; sons de acerto/erro; ao completar (ou terminar tempo) vai para painel.
- DragResult: mostra pontuação parcial antes de iniciar o quiz.
- Quiz: perguntas embaralhadas (a menos de `debug`), feedback visual imediato.
- Results: pontuação final (pesos configuráveis) e opção de recomeçar.

## Manutenção Rápida

- Ajustar pesos: editar `pontuacao` em `jogo.json`.
- Adicionar pergunta: inserir objeto em `quiz.perguntas` (garantir índice `correta`).
- Ativar alto contraste: `"acessibilidade": { "altoContraste": true }`.

## Sistema de Áudio

Chaves pré-carregadas em `BootScene`:

- `success`: acerto no drag.
- `wrong`: erro no drag.
- `ui_start`: clique em Iniciar.
- `quiz_complete`: conclusão do quiz (reservado para uso futuro ou efeitos finais).
- `timer_countdown`: beep de contagem final (configurável no componente de timer).

Todos são opcionais: se o asset não existir, o jogo ignora silenciosamente.

## Timer Reutilizável

O componente (`timer.js`) permite configurar:

- `seconds` (ou usa `drag.tempoSegundos` do JSON se aplicado externamente).
- `warnThreshold`: segundos restantes para iniciar beeps/alertas visuais.
- `warningSoundKey`: chave de áudio (ex: `timer_countdown`).

Fornece métodos: `stop()`, `getRemaining()`, `isEnded()`.

## Validações Centralizadas

Arquivo `validation.js` concentra:

- Normalização de cores (`normalizeColor`).
- Validação de posicionamento de blocos (`validateBlockPlacement`).
- Cálculo de progresso do drag (`validateDragPhase`).
- Avaliação de quiz (`validateQuizAnswer`, `validationQuiz`).

Facilita testes unitários isolados e mantém `dragSystem` / `quizSystem` mais enxutos.

## Próximas Extensões Sugeridas

- Exibir `descricoes` ao concluir cada target.
- Suporte total a teclado / leitor de tela (focus ring avançado + labels ARIA).
- Persistência de melhor pontuação (localStorage).
- Chamadas de internacionalização (`i18n.js`) usando chaves em `jogo.json`.
- Botão de reinício rápido visível em todas as fases.
- Barra de progresso temporal / visual além do texto do timer.

## Licença

MIT (ajustar se necessário).
