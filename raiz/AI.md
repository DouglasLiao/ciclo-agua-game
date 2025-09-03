# Política e Uso de IA (AI.md)

Documento de governança do uso de Inteligência Artificial no projeto Ciclo da Água.

## 1. Objetivos

- Acelerar desenvolvimento (boilerplate, testes, docs) mantendo legibilidade.
- Auxiliar geração/variação de conteúdo didático revisado por humano.
- Garantir rastreabilidade das contribuições automatizadas.

## 2. Ferramentas de IA Utilizadas

| Ferramenta | Propósito | Nível de Automação | Observações |
|------------|----------|--------------------|-------------|
| GitHub Copilot (chat / inline) | Sugerir código, docs, refactors | Assistido | Sugestões sempre revisadas manualmente |
| Microsoft 365 Copilot | Suporte redacional (resumos, listas) | Assistido | Para material pedagógico / README |
| (Futuro) Modelo local (LLM pequeno) | Geração offline de perguntas | A validar | Requer curadoria e filtro |

## 3. Escopo Permitido de Geração

- Código utilitário não crítico (sistemas já modularizados).
- Documentação auxiliar (README, DATA_SCHEMA, QA, AI.md).
- Casos de teste estruturais, sem dados sensíveis.
- Esboço de novas perguntas (rótulo: "GERADO POR IA – REVISAR").

Não permitido gerar sem revisão:

- Conteúdo avaliativo final sem verificação factual.
- Dados pessoais (não aplicável ao escopo atual, manter política zero PII).
- Licenças ou termos legais sem consulta.

## 4. Registo de Contribuições de IA

Manter em commits a tag no corpo da mensagem quando significativo:

```text
AI: Copilot assistiu criação de <arquivo> (revisado)
```

Ou acrescentar co‑autor no trailer se aplicável.

### Arquivos / Trechos Gerados ou Fortemente Assistidos

| Arquivo / Pasta | Natureza da Geração | Observações de Revisão |
|-----------------|---------------------|------------------------|
| `js/systems/dataLoader.js` (export teste / logging flag) | Ajuste guiado por prompt | Revisado sintaxe + efeitos colaterais |
| `README.md` (seções Docker, Makefile) | Texto + formatação | Verificado links e blocos |
| `QA.md` | Lista estruturada | Validado cobertura necessária |
| `DATA_SCHEMA.md` | Especificação detalhada | Conferido contra implementação real |
| `tests/*.test.js` | Casos de validação | Conferido alcance + falsos positivos |
| `Dockerfile` | Boilerplate base | Verificado camadas mínimas |
| `Makefile` | Alvos comuns | Testado comandos principais |
| `js/scenes/DragPhaseScene.js` (HUD score reativada) | Inserção callback + texto dinâmico | Verificado atualização em acerto/erro |
| `js/systems/dragSystem.js` (onScoreChange meta) | Propagação meta `{ correct, error }` | Confirmado não afeta lógica principal |
| `js/systems/quizSystem.js` (shuffle perguntas + alternativas) | Embaralhamento Fisher-Yates | Validado preservação índice correto |

## 5. Fluxo de Revisão

1. Solicitar sugestão → Inserir diff mínimo.
2. Executar testes (`make test`) + lint documental (visual).
3. Validar ausência de regressões manuais no navegador.
4. Commit com mensagem clara indicando escopo.

## 6. Diretrizes de Prompt

Boas práticas para manter saídas consistentes:

- Contextualizar: incluir nomes de cenas e estrutura de dados.
- Pedir formato exato (ex: “gera tabela markdown com...” ).
- Limitar escopo (“apenas adicionar função X sem alterar Y”).

Evitar prompts vagos: “melhora tudo”, “otimiza geral”.

### Exemplos de Prompts Usados

| Objetivo | Prompt Resumido |
|----------|-----------------|
| Testes schema | "Crie testes Jest cobrindo casos válidos e inválidos de jogo.json" |
| Docker | "Gerar Dockerfile mínimo para servir diretório estático raiz/ (Node ou nginx)" |
| Documentação | "Produza DATA_SCHEMA.md com regras, exemplos e roadmap" |
| Acessibilidade | "Sugerir modo alto contraste simples via classe CSS" |

## 7. Critérios de Aceitação para Código Gerado

| Critério | Descrição | Verificação |
|----------|-----------|-------------|
| Compilação/Execução | Sem erros em navegador/Node | Rodar jogo + `npm test` |
| Clareza | Código legível e modular | Revisão humana |
| Aderência ao Schema | Não introduz chaves não documentadas | Comparar com DATA_SCHEMA.md |
| Testabilidade | Pode ser coberto por teste unitário | Casos adicionados ou existentes |
| Isolamento | Mudança não quebra fluxo de cenas | Smoke manual |

## 8. Confirmação de Entendimento Humano

Cada commit assistido foi lido e entendido quanto a:

- Responsabilidade do módulo alterado.
- Impacto em fluxo de dados (carregamento → cenas → UI).
- Possíveis efeitos colaterais em acessibilidade e pontuação.

Se alguma alteração não for totalmente compreendida → REJEITAR / REFAZER com granularidade maior.

## 9. Mitigação de Riscos

| Risco | Mitigação |
|-------|-----------|
| Alucinação de API Phaser | Conferir docs oficiais antes de aceitar |
| Introdução de dependência pesada | Limitar a zero libs extras sem justificativa |
| Conteúdo factual incorreto em perguntas | Revisão pedagógica manual |
| Vazamento de lógica central para prompt | Não colar segredos (não há no escopo) |

## 10. Evolução Prevista

- Adicionar script que marca blocos comentados com `// AI-GENERATED` para auditoria.
- Métrica de “% de linhas geradas” (heurística) em pipeline opcional.
- Avaliar modelo local para geração offline (cache de embeddings para temas novos).

## 11. Descontinuação / Rollback

Se ferramenta gerar sequência de regressões:

1. Desabilitar extensão temporariamente.
2. Reverter último commit afetado.
3. Abrir issue de análise causal.

## 12. Licenciamento e Conteúdo

Manter somente sugestões compatíveis com MIT; evitar copiar trechos externos não triviais.
Verificar que exemplos de perguntas são originais ou suficientemente genéricos.

---
Última atualização: 2025-09-03 – adicionados registros de HUD de pontuação no drag e embaralhamento de perguntas/alternativas do quiz.
