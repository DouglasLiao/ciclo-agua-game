# QA Checklist

Guia rápido de verificação de qualidade para o jogo Ciclo da Água.

| #   | Área                             | Objetivo                                                        | Procedimento                                                                           | Esperado                                                         | Status |
| --- | -------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| 1   | Touch / Pointer                  | Confirmar suporte a toque em dispositivos móveis                | Em tela touch (devtools mobile ou dispositivo), arrastar cada bloco até o alvo correto | Drag funciona sem travar; eventos idênticos ao mouse             | ☐      |
| 2   | Teclado Básico                   | Garantir não haver bloqueio de foco / travamento                | Pressionar Tab várias vezes durante as fases; usar Enter/Espaço em botões              | Foco navega pelos botões; jogo não congela; sem erros no console | ☐      |
| 3   | Resize / Responsividade          | Manter elementos dentro da viewport ao redimensionar            | Reduzir janela para ~50% largura e voltar ao tamanho original durante drag             | Blocos e alvos permanecem visíveis; sem offsets irreversíveis    | ☐      |
| 4   | Performance / FPS                | Verificar ausência de quedas perceptíveis                       | Abrir DevTools > Performance (Chrome) durante uma rodada completa                      | FPS estável (≈60) sem picos de memória ou GC excessivo           | ☐      |
| 5   | Randomização do Quiz             | Checar variação na ordem das perguntas/opções (se implementado) | Recarregar a página 3–5 vezes e observar ordem                                         | Ordem altera (ou justificar se ordem fixa intencional)           | ☐      |
| 6   | Ausência de Hardcode de Texto    | Assegurar que textos vêm do `jogo.json`                         | Alterar um rótulo em `ui.mensagens` e recarregar                                       | Texto atualizado aparece no jogo                                 | ☐      |
| 7   | Reinício Limpa Estado            | Evitar acúmulo de listeners / pontuação antiga                  | Jogar até resultados, clicar Reiniciar e jogar novamente                               | Pontuação inicia em 0; sem eventos duplicados; GC normal         | ☐      |
| 8   | Z-Order / Sobreposição           | Garantir blocos não ficam atrás de alvos ou UI                  | Durante drag, mover bloco sobre cada alvo e bordas                                     | Bloco sempre visível e clicável; sem clipping                    | ☐      |
| 9   | Cross-Browser (Chrome / Firefox) | Compatibilidade básica ES Modules + Phaser                      | Executar fluxo completo em Chrome e Firefox atuais                                     | Comportamento idêntico; sem warnings críticos                    | ☐      |
| 10  | Acessibilidade / Alto Contraste  | Validar aplicação da classe e contraste mínimo                  | Definir `acessibilidade.altoContraste=true` e recarregar                               | Classe aplicada ao `body`; contraste perceptível em feedback     | ☐      |

## Notas de Teste

- Preencher coluna Status com: ✅ (OK), ⚠️ (inconsistência), ❌ (falha).
- Registrar detalhes adicionais abaixo.

## Observações

Nenhuma observação adicional
