import { createDragSystem } from '../systems/dragSystem.js';

export default class DragPhaseScene extends Phaser.Scene {
  constructor() { super('DragPhaseScene'); }

  init(data) {
    this.gameData = data?.gameData || null;
  }

  create() {
    // HUD
    this.score = 0;
    this.scoreText = this.add.text(20, 20, 'Pontuação: 0', { fontSize: '20px', color: '#ffffff' });
    this.add.text(20, 48, 'Fase de Arrastar', { fontSize: '20px', color: '#4ec2f0' });

    // Área de alvos (4 alvos nomeados)
    // Layout: linha superior centralizada
    const targetNames = ['Evaporação', 'Condensação', 'Precipitação', 'Infiltração'];
    const startX = 120;
    const gapX = 200;
    const yTargets = 140;
    this.targets = targetNames.map((name, i) => {
      const x = startX + i * gapX;
      const box = this.add.rectangle(x, yTargets, 160, 80, 0x123347, 0.6).setStrokeStyle(2, 0x4ec2f0);
      this.add.text(x, yTargets - 10, name, { fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 150 } }).setOrigin(0.5, 0.5);
      return { name, rect: box };
    });

    // Blocos de origem (4 blocos com texto) na parte inferior
    const blockLabels = ['Água do solo', 'Nuvem', 'Chuva', 'Lago'];
    const yBlocks = 420;
    this.blocks = blockLabels.map((label, i) => {
      const x = startX + i * gapX;
      const rect = this.add.rectangle(x, yBlocks, 150, 60, 0x345b7d, 0.8).setStrokeStyle(2, 0xffffff);
      this.add.text(x, yBlocks, label, { fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5);
      return { label, rect };
    });

    // Mapeamento correto (exemplo) label->target
    const mapping = {
      'Água do solo': 'Infiltração',
      'Nuvem': 'Condensação',
      'Chuva': 'Precipitação',
      'Lago': 'Evaporação'
    };

    // Sistema de drag
    this.dragState = createDragSystem(
      this,
      { targets: this.targets, blocks: this.blocks, map: mapping },
      {
        onScoreChange: (score) => {
          this.score = score;
          this.scoreText.setText('Pontuação: ' + score);
        },
        onAllPlaced: (state) => {
          // Pequeno feedback visual antes da transição
          this.add.text(20, 80, 'Todos posicionados! Avançando...', { fontSize: '18px', color: '#ffffff' });
          this.time.delayedCall(1000, () => {
            this.scene.start('QuizPhaseScene', { scoreParcial: state.score, gameData: this.gameData });
          });
        }
      }
    );
  }
}
