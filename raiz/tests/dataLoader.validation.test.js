import { _validateGameDataForTests, setSchemaValidationLogging } from '../js/systems/dataLoader.js';

setSchemaValidationLogging(false);

// Helper to clone
function clone(o){ return JSON.parse(JSON.stringify(o)); }

const baseValid = {
  ui: { titulo: 'Titulo', botoes: { iniciar: 'Iniciar' }, mensagens: { carregando: 'Carregando...' } },
  pontuacao: { pesoDrag: 40, pesoQuiz: 60 },
  acessibilidade: { altoContraste: false },
  drag: {
    targets: ['A','B'],
    blocks: ['X','Y'],
    map: { X: 'A', Y: 'B' },
    descricoes: { A: 'a', B: 'b' }
  },
  quiz: {
    perguntas: [
      { texto: 'Q1', alternativas: ['a','b','c'], correta: 1 }
    ]
  }
};

describe('validate game data', () => {
  test('accepts valid schema', () => {
    const filtered = _validateGameDataForTests(baseValid);
    expect(filtered.ui.titulo).toBe('Titulo');
    expect(filtered.quiz.perguntas).toHaveLength(1);
  });

  test('rejects missing ui', () => {
    const data = clone(baseValid);
    delete data.ui;
    expect(() => _validateGameDataForTests(data)).toThrow(/ui ausente/);
  });

  test('rejects empty drag targets', () => {
    const data = clone(baseValid);
    data.drag.targets = [];
    expect(() => _validateGameDataForTests(data)).toThrow(/drag.targets/);
  });

  test('rejects invalid quiz question correct index out of range', () => {
    const data = clone(baseValid);
    data.quiz.perguntas[0].correta = 99;
    expect(() => _validateGameDataForTests(data)).toThrow(/fora do intervalo/);
  });

  test('rejects when pergunta missing texto', () => {
    const data = clone(baseValid);
    delete data.quiz.perguntas[0].texto;
    expect(() => _validateGameDataForTests(data)).toThrow(/texto deve ser string/);
  });

  test('rejects when alternativas too short', () => {
    const data = clone(baseValid);
    data.quiz.perguntas[0].alternativas = ['a'];
    expect(() => _validateGameDataForTests(data)).toThrow(/alternativas deve ter/);
  });

  test('rejects when correta not number', () => {
    const data = clone(baseValid);
    data.quiz.perguntas[0].correta = '1';
    expect(() => _validateGameDataForTests(data)).toThrow(/correta deve ser número/);
  });

  test('multiple errors aggregated', () => {
    const data = clone(baseValid);
    delete data.pontuacao; // error 1
    data.drag.blocks = []; // error 2
    data.quiz.perguntas[0].alternativas = ['x']; // error 3
    try {
      _validateGameDataForTests(data);
      throw new Error('Should have thrown');
    } catch (e) {
      const msg = e.message;
      expect(msg).toMatch(/pontuacao ausente/);
      expect(msg).toMatch(/drag.blocks/);
      expect(msg).toMatch(/alternativas deve ter/);
    }
  });
});
