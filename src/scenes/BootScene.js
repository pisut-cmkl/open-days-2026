import Phaser from 'phaser';
import { SKINS } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const barBg = this.add.rectangle(640, 360, 320, 24, 0x1b2744).setOrigin(0.5);
    const bar = this.add.rectangle(480, 360, 0, 16, 0x7ef0c0).setOrigin(0, 0.5);
    this.add
      .text(640, 320, 'Loading Kenney assets…', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '20px',
        color: '#d7e3ff',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 312 * value;
    });

    this.load.atlasXML(
      'characters',
      'assets/Spritesheets/spritesheet-characters-default.png',
      'assets/Spritesheets/spritesheet-characters-default.xml',
    );
    this.load.atlasXML(
      'tiles',
      'assets/Spritesheets/spritesheet-tiles-default.png',
      'assets/Spritesheets/spritesheet-tiles-default.xml',
    );
    this.load.atlasXML(
      'backgrounds',
      'assets/Spritesheets/spritesheet-backgrounds-default.png',
      'assets/Spritesheets/spritesheet-backgrounds-default.xml',
    );

    this.load.audio('sfx-jump', 'assets/Sounds/sfx_jump.ogg');
    this.load.audio('sfx-jump-high', 'assets/Sounds/sfx_jump-high.ogg');
    this.load.audio('sfx-hurt', 'assets/Sounds/sfx_hurt.ogg');
    this.load.audio('sfx-select', 'assets/Sounds/sfx_select.ogg');
    this.load.audio('sfx-ko', 'assets/Sounds/sfx_disappear.ogg');
    this.load.audio('sfx-throw', 'assets/Sounds/sfx_throw.ogg');
  }

  create() {
    this.createPixelTexture();
    this.createAnimations();
    this.scene.start('MenuScene');
  }

  createPixelTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture('pixel', 8, 8);
    g.destroy();
  }

  createAnimations() {
    SKINS.forEach((skin) => {
      const idleKey = `${skin}-idle`;
      const walkKey = `${skin}-walk`;
      const jumpKey = `${skin}-jump`;
      const hitKey = `${skin}-hit`;
      const attackKey = `${skin}-attack`;

      if (!this.anims.exists(idleKey)) {
        this.anims.create({
          key: idleKey,
          frames: [{ key: 'characters', frame: `character_${skin}_idle` }],
          frameRate: 1,
        });
      }

      if (!this.anims.exists(walkKey)) {
        this.anims.create({
          key: walkKey,
          frames: [
            { key: 'characters', frame: `character_${skin}_walk_a` },
            { key: 'characters', frame: `character_${skin}_walk_b` },
          ],
          frameRate: 10,
          repeat: -1,
        });
      }

      if (!this.anims.exists(jumpKey)) {
        this.anims.create({
          key: jumpKey,
          frames: [{ key: 'characters', frame: `character_${skin}_jump` }],
          frameRate: 1,
        });
      }

      if (!this.anims.exists(hitKey)) {
        this.anims.create({
          key: hitKey,
          frames: [{ key: 'characters', frame: `character_${skin}_hit` }],
          frameRate: 1,
        });
      }

      if (!this.anims.exists(attackKey)) {
        this.anims.create({
          key: attackKey,
          frames: [
            { key: 'characters', frame: `character_${skin}_jump` },
            { key: 'characters', frame: `character_${skin}_walk_a` },
          ],
          frameRate: 12,
          repeat: 0,
        });
      }
    });
  }
}
