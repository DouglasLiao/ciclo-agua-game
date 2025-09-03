# Ciclo da Água (Phaser 3)

Jogo educativo interativo em duas fases (arrastar/associar e quiz) para reforçar os principais processos do ciclo da água.

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

| Comando | Ação |
|---------|------|
| `make run` | Servidor Python em :8000 (PORT variável) |
| `make test` | Roda Jest |
| `make docker-build` | Build imagem Docker |
| `make docker-run` | Executa imagem na porta 8080 (DOCKER_PORT) |
| `make docker-dev` | Roda Docker montando pasta local |
| `make clean-node` | Remove node_modules e lock |
| `make ci` | Instala dependências + testes |

Variáveis: `PORT=9000 make run`, `DOCKER_PORT=9090 make docker-run`.

## Estrutura de Pastas
 
```text
raiz/
  index.html        # Entrada do jogo
  jogo.json         # Conteúdo, textos, pesos de pontuação e config
  style.css         # Estilos e alto contraste
  js/
    main.js         # Configuração Phaser + registro das cenas
    scenes/         # Boot, Menu, DragPhase, QuizPhase, Results
    systems/        # dragSystem, quizSystem, dataLoader, util de UI
  assets/           # (Opcional) imagens/áudios futuros
```

## Editando `jogo.json`
 
Principais blocos:
 
- `ui`: textos de interface (título, botões, mensagens).
- `pontuacao`: pesos (%) de cada fase (`pesoDrag`, `pesoQuiz`). Soma recomendada = 100 (internamente normalizado 0–100).
- `acessibilidade.altoContraste`: true/false adiciona classe CSS para maior contraste.
- `drag`:
  - `targets`: nomes das etapas corretas.
  - `blocks`: peças arrastáveis exibidas ao jogador.
  - `map`: mapeia cada block -> target correto.
  - `descricoes`: texto explicativo mostrado futuramente (base para expansões).
  - (Opcional) `cores`: `acerto` e `erro` (hex ou número) para bordas de feedback.
- `quiz.perguntas[]`: cada item contém `texto`, `alternativas[]` e índice `correta`.

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
 
| Critério | Implementação |
|----------|---------------|
| Separação conteúdo vs lógica | Todo texto/config em `jogo.json`; código só consome. |
| Fases distintas | DragPhase + QuizPhase + Results com fluxo encadeado. |
| Pontuação clara | Cálculo ponderado (pesos configuráveis) normalizado 0–100. |
| Feedback imediato | Borda verde no acerto, vermelha no erro (shake + retorno). |
| Acessibilidade inicial | Modo alto contraste via flag JSON + cores ajustadas. |
| Robustez de dados | `dataLoader` com cache, validação e fallback mock. |
| Reinício seguro | Botão Reiniciar recria estado mantendo JSON carregado. |
| Extensibilidade | Campos opcionais (`descricoes`, `cores`) e modularização por sistemas. |
| Configurabilidade visual | Cores de feedback via `drag.cores`. |
| Internacionalização futura | Estrutura `ui.*` centraliza strings. |

## Fluxo de Cenas
 
BootScene → MenuScene → DragPhaseScene → QuizPhaseScene → ResultsScene (reinício volta ao Menu).

## Manutenção Rápida
 
- Ajustar pesos: editar `pontuacao` em `jogo.json`.
- Adicionar pergunta: inserir objeto em `quiz.perguntas` (garantir índice `correta`).
- Alterar cores de feedback: incluir / modificar `drag.cores`.
- Ativar alto contraste: `"acessibilidade": { "altoContraste": true }`.

## Próximas Extensões Sugeridas
 
- Exibir `descricoes` ao concluir cada target.
- Suporte teclado / leitor de tela (focus ring + aria-labels).
- Persistência de melhor pontuação (localStorage).

## Licença
 
MIT (ajustar se necessário).
