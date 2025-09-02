import { createDragSystem } from '../systems/dragSystem.js';
import { validateDragPhase } from '../systems/validation.js';

export default class DragPhaseScene extends Phaser.Scene {
  constructor() { super('DragPhaseScene'); }

  create() {
    this.add.text(20, 20, 'Fase de Arrastar (protótipo)', { fontSize: '20px', color: '#ffffff' });

    this.dragItems = createDragSystem(this, []); // TODO: passar dados reais

    this.input.keyboard.once('keydown-SPACE', () => {
      const result = validateDragPhase(this.dragItems);
      console.log('Resultado validação drag:', result);
      this.scene.start('QuizPhaseScene', { dragResult: result });
    });
  }
}
