import { createDragSystem } from '../systems/dragSystem.js';
import { getUI, getArray } from '../systems/ui.js';

export default class DragPhaseScene extends Phaser.Scene {
  constructor() { super('DragPhaseScene'); }

  init(data) {
    this.gameData = data?.gameData || null;
  }

  create() {
  // HUD
  this.score = 0;
  const dragTitle = getUI(this.gameData, 'drag.title', 'Fase de Arrastar');
  this.add.text(20, 48, dragTitle, { fontSize: '20px', color: '#4ec2f0' });

    // Área de alvos (4 alvos nomeados)
    // Layout: linha superior centralizada
  const targetNames = getArray(this.gameData, 'drag.targets', ['Evaporação', 'Condensação', 'Precipitação', 'Infiltração']);
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
  const blockLabels = getArray(this.gameData, 'drag.blocks', ['Água do solo', 'Nuvem', 'Chuva', 'Lago']);
    const yBlocks = 420;
    this.blocks = blockLabels.map((label, i) => {
      const x = startX + i * gapX;
      const rect = this.add.rectangle(x, yBlocks, 150, 60, 0x345b7d, 0.8).setStrokeStyle(2, 0xffffff);
      this.add.text(x, yBlocks, label, { fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5);
      return { label, rect };
    });

    // Mapeamento correto (exemplo) label->target
    const mapping = getUI(this.gameData, 'drag.mapping', {
      'Água do solo': 'Infiltração',
      'Nuvem': 'Condensação',
      'Chuva': 'Precipitação',
      'Lago': 'Evaporação'
    });

    // Sistema de drag
    this.dragState = createDragSystem(
      this,
      { targets: this.targets, blocks: this.blocks, map: mapping },
      {
        onAllPlaced: (state) => {
          // Pequeno feedback visual antes da transição
          const msg = getUI(this.gameData, 'drag.allPlacedMessage', 'Todos posicionados! Avançando...');
          this.add.text(20, 80, msg, { fontSize: '18px', color: '#ffffff' });
          this.time.delayedCall(1000, () => {
            this.scene.start('QuizPhaseScene', { dragAcertos: state.score, dragTotal: state.total, gameData: this.gameData });
          });
        }
      }
    );
  }
}
