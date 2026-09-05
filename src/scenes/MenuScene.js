import Phaser from 'phaser';
import { PLAYERS } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x7ec8ff);

    for (let x = 0; x < width; x += 256) {
      this.add
        .image(x, 0, 'backgrounds', 'background_solid_sky')
        .setOrigin(0, 0)
        .setScale(height / 256);
    }
    this.add
      .image(width / 2 - 200, 360, 'backgrounds', 'background_color_hills')
      .setScale(1.4)
      .setOrigin(0.5, 0);
    this.add
      .image(width / 2 + 220, 380, 'backgrounds', 'background_color_hills')
      .setScale(1.2)
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 90, 'SMASH BRAWL', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#1a3358',
        stroke: '#ffffff',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 155, 'Kenney sprites · Phaser 3 · Local 2P', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '18px',
        color: '#2b4a6f',
      })
      .setOrigin(0.5);

    this.createFighterCard(width / 2 - 220, 360, PLAYERS.p1, [
      'Move  A / D',
      'Jump  W',
      'Attack  F',
      'Fast-fall  S',
    ]);
    this.createFighterCard(width / 2 + 220, 360, PLAYERS.p2, [
      'Move  ← / →',
      'Jump  ↑',
      'Attack  L',
      'Fast-fall  ↓',
    ]);

    this.add
      .text(width / 2, 560, '3 stocks · % damage · knockback KO', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '18px',
        color: '#2b4a6f',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, 620, 'Press SPACE or ENTER to start', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#146c43',
        backgroundColor: '#ffffffcc',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.45,
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
  }

  createFighterCard(x, y, player, lines) {
    this.add.rectangle(x, y, 300, 280, 0xffffff, 0.82).setStrokeStyle(3, player.color);

    const sprite = this.add
      .sprite(x, y - 50, 'characters', `character_${player.skin}_idle`)
      .setScale(1.15);
    sprite.play(`${player.skin}-walk`);

    this.add
      .text(x, y + 40, `P${player.id === 'p1' ? '1' : '2'}  ${player.name}`, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#1a3358',
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + 95, lines.join('\n'), {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#2b4a6f',
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5);
  }

  startGame() {
    this.sound.play('sfx-select', { volume: 0.4 });
    this.scene.start('GameScene');
  }
}
