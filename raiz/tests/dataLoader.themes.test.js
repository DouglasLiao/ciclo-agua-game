import { _validateGameDataForTests, setSchemaValidationLogging } from '../js/systems/dataLoader.js'

setSchemaValidationLogging(false)

// Gera base comum ajustável
function makeData({ uiTitulo, targets, blocks, map, descricoes, perguntas, pesos = { drag: 50, quiz: 50 }, altoContraste = false, cores }) {
  return {
    ui: { titulo: uiTitulo, botoes: { iniciar: 'Iniciar' }, mensagens: { carregando: 'Carregando...' } },
    pontuacao: { pesoDrag: pesos.drag, pesoQuiz: pesos.quiz },
    acessibilidade: { altoContraste },
    drag: { targets, blocks, map, descricoes, ...(cores ? { cores } : {}) },
    quiz: { perguntas }
  }
}

const temas = [
  {
    nome: 'Sistema Solar',
    data: makeData({
      uiTitulo: 'Sistema Solar',
      targets: ['Sol', 'Terra', 'Marte', 'Júpiter'],
      blocks: ['Planeta vermelho', 'Gigante gasoso', 'Estrela', 'Planeta azul'],
      map: {
        'Planeta vermelho': 'Marte',
        'Gigante gasoso': 'Júpiter',
        'Estrela': 'Sol',
        'Planeta azul': 'Terra'
      },
      descricoes: {
        'Sol': 'Estrela central.',
        'Terra': 'Planeta com água líquida abundante.',
        'Marte': 'Conhecido como planeta vermelho.',
        'Júpiter': 'Maior planeta do sistema solar.'
      },
      perguntas: [
        { texto: 'Qual é a estrela do sistema solar?', alternativas: ['Sol', 'Terra', 'Marte'], correta: 0 },
        { texto: 'Qual planeta é azul?', alternativas: ['Terra', 'Marte', 'Júpiter'], correta: 0 }
      ],
      cores: { acerto: '#1e7d4e', erro: '#cc2222' }
    })
  },
  {
    nome: 'Cadeia Alimentar',
    data: makeData({
      uiTitulo: 'Cadeia Alimentar',
      targets: ['Produtor', 'Consumidor Primário', 'Consumidor Secundário', 'Decompositor'],
      blocks: ['Fungo', 'Capim', 'Lobo', 'Coelho'],
      map: {
        'Fungo': 'Decompositor',
        'Capim': 'Produtor',
        'Lobo': 'Consumidor Secundário',
        'Coelho': 'Consumidor Primário'
      },
      descricoes: {
        'Produtor': 'Produz matéria orgânica pela fotossíntese.',
        'Consumidor Primário': 'Alimenta-se de produtores.',
        'Consumidor Secundário': 'Predador de primários.',
        'Decompositor': 'Recicla matéria orgânica.'
      },
      perguntas: [
        { texto: 'Quem produz matéria orgânica?', alternativas: ['Consumidor', 'Produtor', 'Decompositor'], correta: 1 },
        { texto: 'Exemplo de decompositor?', alternativas: ['Fungo', 'Capim', 'Lobo'], correta: 0 },
        { texto: 'Predador do coelho?', alternativas: ['Capim', 'Lobo', 'Fungo'], correta: 1 }
      ],
      pesos: { drag: 40, quiz: 60 },
      altoContraste: true
    })
  },
  {
    nome: 'Fotossíntese',
    data: makeData({
      uiTitulo: 'Fotossíntese',
      targets: ['Luz Solar', 'Água', 'Dióxido de Carbono', 'Glicose'],
      blocks: ['CO2', 'Luz', 'H2O', 'C6H12O6'],
      map: {
        'CO2': 'Dióxido de Carbono',
        'Luz': 'Luz Solar',
        'H2O': 'Água',
        'C6H12O6': 'Glicose'
      },
      descricoes: {
        'Luz Solar': 'Fonte de energia para o processo.',
        'Água': 'Reagente absorvido pelas raízes.',
        'Dióxido de Carbono': 'Gás capturado pelas folhas.',
        'Glicose': 'Produto energético gerado.'
      },
      perguntas: [
        { texto: 'Qual a fonte de energia?', alternativas: ['Luz Solar', 'Água', 'Glicose'], correta: 0 },
        { texto: 'Produto principal?', alternativas: ['Oxigênio', 'Glicose', 'Água'], correta: 1 },
        { texto: 'Gás utilizado?', alternativas: ['CO2', 'H2O', 'N2'], correta: 0 },
        { texto: 'Molécula energética gerada?', alternativas: ['C6H12O6', 'CO2', 'Luz'], correta: 0 }
      ],
      pesos: { drag: 55, quiz: 45 },
      cores: { acerto: '#228833' }
    })
  }
]

// Tema com mapeamento incompleto (válido sob regras atuais)
const temaIncompletoMap = makeData({
  uiTitulo: 'Map Parcial',
  targets: ['A', 'B', 'C'],
  blocks: ['b1', 'b2', 'b3'],
  map: { b1: 'A', b2: 'B' }, // b3 sem entrada
  descricoes: { A: 'a', B: 'b', C: 'c' },
  perguntas: [ { texto: 'Pergunta', alternativas: ['x', 'y'], correta: 0 } ]
})


describe('validação com múltiplos temas', () => {
  test.each(temas.map(t => [t.nome, t.data]))('aceita tema: %s', (_nome, data) => {
    const filtered = _validateGameDataForTests(data)
    expect(filtered.ui.titulo).toBe(data.ui.titulo)
    expect(filtered.drag.targets.length).toBeGreaterThan(0)
    expect(filtered.quiz.perguntas.length).toBe(data.quiz.perguntas.length)
  })

  test('aceita map parcial (não é exigido map completo)', () => {
    const filtered = _validateGameDataForTests(temaIncompletoMap)
    expect(filtered.drag.blocks.length).toBe(3)
  })

  test('falha se alterar índice correta fora do range em tema existente', () => {
    const broken = JSON.parse(JSON.stringify(temas[0].data))
    broken.quiz.perguntas[0].correta = 99
    expect(() => _validateGameDataForTests(broken)).toThrow(/fora do intervalo/)
  })
})
