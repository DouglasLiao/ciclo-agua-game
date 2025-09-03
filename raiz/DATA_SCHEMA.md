# DATA_SCHEMA

Especificação formal do arquivo `jogo.json` utilizado pelo jogo "Ciclo da Água".

## 1. Visão Geral

O arquivo define TODO o conteúdo dinâmico: textos de UI, pesos de pontuação, modo de acessibilidade, configuração da fase de arrastar e perguntas do quiz. O jogo nunca deve conter textos hardcoded além de mensagens técnicas de fallback.

Estrutura raiz obrigatória:

```jsonc
{
  "ui": { ... },
  "pontuacao": { ... },
  "acessibilidade": { ... },
  "drag": { ... },
  "quiz": { ... }
}
```

Todos os blocos acima são OBRIGATÓRIOS. Campos adicionais são ignorados (forward-compatible).

## 2. ui

Textos de interface.

```jsonc
"ui": {
  "titulo": "Ciclo da Água",
  "botoes": {
    "iniciar": "Iniciar",
    "reiniciar": "Reiniciar",
    "voltarMenu": "Menu",
    "tentarNovamente": "Tentar Novamente"
  },
  "mensagens": {
    "carregando": "Carregando...",
    "iniciando": "Iniciando...",
    "falhaCarregar": "Erro ao carregar dados",
    "pontuacao": "Pontuação",
    "faseDrag": "Fase de Arrastar",
    "faseQuiz": "Fase de Quiz",
    "todosColocados": "Todos posicionados! Avançando...",
    "resultadoTitulo": "Resultados"
  }
}
```

Regras:

- `titulo`: string obrigatória.
- `botoes`: objeto opcional; chaves livres (cada valor string).
- `mensagens`: objeto opcional; chaves livres (cada valor string).

## 3. pontuacao

Define pesos relativos para composição da nota final (0–100 após normalização interna).

```jsonc
"pontuacao": {
  "pesoDrag": 50,
  "pesoQuiz": 50
}
```

Regras:

- Ambos obrigatórios e numéricos.
- Recomenda-se soma ≈ 100 (não é estritamente exigido; o código normaliza proporcionalmente).

## 4. acessibilidade

```jsonc
"acessibilidade": {
  "altoContraste": false
}
```

- `altoContraste`: boolean obrigatório. Ativa classe CSS que ajusta cores para maior legibilidade.

## 5. drag (Fase de Arrastar)

```jsonc
"drag": {
  "targets": ["Evaporação", "Condensação", "Precipitação", "Infiltração"],
  "blocks": ["Água do solo", "Nuvem", "Chuva", "Lago"],
  "map": {
    "Água do solo": "Infiltração",
    "Nuvem": "Condensação",
    "Chuva": "Precipitação",
    "Lago": "Evaporação"
  },
  "descricoes": {
    "Evaporação": "...",
    "Condensação": "..."
  },
  "cores": {               // OPCIONAL (pode não existir)
    "acerto": "#1e7d4e",  // hex ou número; cor da borda ao acertar
    "erro": "#cc2222"     // hex ou número; cor temporária ao errar
  }
}
```

Regras:

- `targets`: array não vazio de strings (nomes de etapas).
- `blocks`: array não vazio de strings (rótulos arrastáveis).
- `map`: objeto (cada chave = um item de `blocks`, valor = nome de target correto) — _não validamos se todos os blocks possuem entry mas recomendado_.
- `descricoes`: objeto (chave = nome de target, valor = string explicativa). Pode conter subset.
- `cores` (opcional): se presente, cada chave deve ser string (#hex) ou número inteiro (0xRRGGBB). Valores inválidos são ignorados e defaults aplicados.

## 6. quiz

```jsonc
"quiz": {
  "perguntas": [
    {
      "texto": "Qual é a etapa em que a água se transforma em vapor?",
      "alternativas": ["Condensação", "Precipitação", "Evaporação", "Infiltração"],
      "correta": 2
    }
  ]
}
```

Regras para cada item em `perguntas`:

- É objeto obrigatório.
- `texto`: string obrigatória.
- `alternativas`: array de >= 2 strings.
- `correta`: índice numérico dentro do intervalo `[0, alternativas.length - 1]`.

## 7. Validação Implementada

A função interna `validateAndFilter` (exposta em testes como `_validateGameDataForTests`) executa verificações e agrega todas as mensagens de erro antes de lançar uma exceção.

| Campo / Regra               | Erro Gatilho (trecho da mensagem)                   |
| --------------------------- | --------------------------------------------------- |
| Objeto raiz não objeto      | `Objeto raiz inválido`                              |
| `ui` ausente                | `ui ausente`                                        |
| `ui.titulo` não string      | `ui.titulo ausente`                                 |
| `pontuacao` ausente         | `pontuacao ausente`                                 |
| `pesoDrag` não número       | `pontuacao.pesoDrag deve ser número`                |
| `pesoQuiz` não número       | `pontuacao.pesoQuiz deve ser número`                |
| `acessibilidade` ausente    | `acessibilidade ausente`                            |
| `altoContraste` não boolean | `acessibilidade.altoContraste deve ser boolean`     |
| `drag` ausente              | `drag ausente`                                      |
| `drag.targets` vazio        | `drag.targets deve ser array não vazio`             |
| `drag.blocks` vazio         | `drag.blocks deve ser array não vazio`              |
| `drag.map` ausente          | `drag.map ausente`                                  |
| `drag.descricoes` ausente   | `drag.descricoes ausente`                           |
| `quiz` ausente              | `quiz ausente`                                      |
| `quiz.perguntas` vazio      | `quiz.perguntas deve ser array não vazio`           |
| Pergunta não objeto         | `quiz.perguntas[i] não é objeto`                    |
| `texto` ausente             | `quiz.perguntas[i].texto deve ser string`           |
| `alternativas` inválido     | `quiz.perguntas[i].alternativas deve ter >=2 itens` |
| `correta` não numérico      | `quiz.perguntas[i].correta deve ser número`         |
| `correta` fora do intervalo | `quiz.perguntas[i].correta fora do intervalo`       |

Observação: erros de `cores` não interrompem a carga — fallback padrão é aplicado silenciosamente.

## 8. Estratégia de Fallback

1. Tenta `fetch(url)`.
2. Em falha de rede → usa `mockGameData()`.
3. Valida. Se schema inválido → loga erro e valida novamente o mock.
4. Resultado final cacheado em memória até `invalidateGameDataCache()`.

## 9. Extensão Segura do Schema

- Pode-se adicionar novos campos no topo ou dentro de objetos existentes: serão ignorados se não referenciados.
- Ao introduzir novo bloco obrigatório, planejar: (1) versão do schema, (2) fallback no mock, (3) cobertura de testes.
- Sugestão: adicionar `schemaVersion` futuro para migrações automáticas.

## 10. Boas Práticas de Edição

- Validar JSON (lint/formatter) antes de deploy.
- Manter pesos coerentes (ex: 40 / 60, 50 / 50). Pesos negativos ou >100 são aceitos mas semânticamente incorretos — pode-se adicionar regra extra se necessário.
- Reaproveitar rótulos entre `map` e `targets` para consistência; divergências geram associações impossíveis.

## 11. Exemplos de Erros Comuns

| Erro                   | Consequência           | Correção                       |
| ---------------------- | ---------------------- | ------------------------------ |
| Remover `ui.titulo`    | Falha de schema → mock | Repor `ui.titulo` string       |
| `correta`: string      | Falha de schema        | Converter para índice numérico |
| `alternativas`: 1 item | Falha de schema        | Adicionar mais opções          |
| `drag.blocks` vazio    | Falha de schema        | Inserir mínimo 1 bloco e alvo  |

## 12. Fluxo de Atualização de Conteúdo

1. Editar `jogo.json`.
2. (Opcional) Invocar função de invalidação (se adicionada a UI futura) para recarregar sem F5.
3. Reiniciar a partida para refletir novas perguntas.

## 13. Testes

Arquivo de teste: `raiz/tests/dataLoader.validation.test.js` cobre:

- Caso válido.
- Ausência de blocos essenciais.
- Arrays vazios.
- Índices fora do intervalo.
- Agregação de múltiplos erros.

## 14. Roadmap de Evolução do Schema

| Proposta                 | Descrição                                | Impacto                     |
| ------------------------ | ---------------------------------------- | --------------------------- |
| `i18n` blocos por idioma | `{ "ui": { "pt": {...}, "en": {...} } }` | Adaptar resolutor de idioma |
| `tempoLimite` no quiz    | Campo numérico opcional                  | Ajustar lógica de contagem  |
| `hints` por pergunta     | Array de dicas                           | UI adicional                |
| `versao`                 | Inteiro para migrações                   | Permitir upgrade automático |
| `drag.layout`            | Posições sugeridas                       | Menos cálculo na cena       |

## 15. Licença

Segue a licença geral do projeto (MIT) — esse documento pode ser reutilizado com crédito.

---

_Última atualização: sincronizado com regras de `dataLoader.js` na branch master._
