import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.result = data;
  }

  create() {
    const { width, height } = this.scale;
    const color = Phaser.Display.Color.IntegerToColor(this.result.winnerColor).rgba;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1426, 0.88);

    for (let x = 0; x < width; x += 256) {
      this.add
        .image(x, 0, 'backgrounds', 'background_solid_sky')
        .setOrigin(0, 0)
        .setScale(height / 256)
        .setAlpha(0.35);
    }

    this.add
      .text(width / 2, 140, 'MATCH OVER', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '28px',
        color: '#8fa3c8',
      })
      .setOrigin(0.5);

    const winner = this.add
      .sprite(width / 2, 280, 'characters', `character_${this.result.winnerSkin}_jump`)
      .setScale(1.6);
    winner.play(`${this.result.winnerSkin}-idle`);

    this.add
      .text(width / 2, 390, `${this.result.winnerName} WINS`, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '56px',
        fontStyle: 'bold',
        color,
        stroke: '#ffffff',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        460,
        `Stocks left — GREEN ${this.result.p1Stocks}  ·  PINK ${this.result.p2Stocks}`,
        {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '22px',
          color: '#d7e3ff',
        },
      )
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, 560, 'SPACE / ENTER  rematch    ESC  menu', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '24px',
        color: '#7ef0c0',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.sound.play('sfx-select', { volume: 0.35 });

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
