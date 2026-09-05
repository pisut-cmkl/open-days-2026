import Phaser from 'phaser';
import { BLAST, GAME, PLAYERS, STAGE, TILE } from '../config.js';
import { Fighter } from '../entities/Fighter.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.registry.set('stocks', GAME.stocks);
    this.matchOver = false;

    this.createBackground();
    this.createStage();
    this.createDecor();
    this.createFighters();
    this.createHud();
    this.createCollisions();

    this.add
      .text(GAME.width / 2, 28, 'KO if you leave the blast zone', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#2b4a6f',
        backgroundColor: '#ffffff55',
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  createBackground() {
    this.add.rectangle(GAME.width / 2, GAME.height / 2, GAME.width, GAME.height, 0x8fd3ff);

    const bgScale = GAME.height / 256;
    for (let x = 0; x < GAME.width; x += 256 * bgScale) {
      this.add
        .image(x, 0, 'backgrounds', 'background_solid_sky')
        .setOrigin(0, 0)
        .setScale(bgScale)
        .setScrollFactor(0.15)
        .setDepth(0);
    }

    const hillScale = 1.15;
    const hillY = STAGE.groundY - 210;
    for (let x = -40; x < GAME.width + 40; x += 240) {
      this.add
        .image(x, hillY, 'backgrounds', 'background_color_hills')
        .setOrigin(0, 0)
        .setScale(hillScale)
        .setScrollFactor(0.35)
        .setDepth(1)
        .setAlpha(0.95);
    }

    for (let i = 0; i < 5; i += 1) {
      const cloud = this.add
        .image(
          Phaser.Math.Between(80, GAME.width - 80),
          Phaser.Math.Between(60, 220),
          'backgrounds',
          'background_clouds',
        )
        .setScale(Phaser.Math.FloatBetween(0.55, 0.9))
        .setAlpha(0.55)
        .setDepth(2);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + Phaser.Math.Between(30, 80),
        duration: Phaser.Math.Between(8000, 14000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  createStage() {
    this.platforms = this.physics.add.staticGroup();

    const groundCount = STAGE.groundTiles;
    const groundWidth = groundCount * TILE;
    const startX = GAME.width / 2 - groundWidth / 2 + TILE / 2;

    for (let i = 0; i < groundCount; i += 1) {
      const x = startX + i * TILE;
      let frame = 'terrain_grass_block_top';
      if (i === 0) frame = 'terrain_grass_block_top_left';
      if (i === groundCount - 1) frame = 'terrain_grass_block_top_right';

      this.platforms.create(x, STAGE.groundY, 'tiles', frame).setDepth(5).refreshBody();

      this.add
        .image(x, STAGE.groundY + TILE, 'tiles', 'terrain_grass_block_center')
        .setDepth(4);
    }

    STAGE.platforms.forEach((p) => {
      const width = p.tiles * TILE;
      const left = p.x - width / 2 + TILE / 2;
      for (let i = 0; i < p.tiles; i += 1) {
        const x = left + i * TILE;
        let frame = 'terrain_grass_cloud_middle';
        if (p.tiles === 1) frame = 'terrain_grass_cloud';
        else if (i === 0) frame = 'terrain_grass_cloud_left';
        else if (i === p.tiles - 1) frame = 'terrain_grass_cloud_right';

        this.platforms.create(x, p.y, 'tiles', frame).setDepth(5).refreshBody();
      }
    });
  }

  createDecor() {
    const groundLeft = GAME.width / 2 - (STAGE.groundTiles * TILE) / 2;
    const groundRight = GAME.width / 2 + (STAGE.groundTiles * TILE) / 2;

    this.add.image(groundLeft + 90, STAGE.groundY - 40, 'tiles', 'bush').setDepth(6);
    this.add.image(groundRight - 100, STAGE.groundY - 40, 'tiles', 'bush').setDepth(6);
    this.add.image(GAME.width / 2, STAGE.groundY - 40, 'tiles', 'sign').setDepth(6);
    this.add.image(groundLeft + 24, STAGE.groundY - 40, 'tiles', 'flag_green_a').setDepth(6);
    this.add.image(groundRight - 24, STAGE.groundY - 40, 'tiles', 'flag_red_a').setDepth(6);
  }

  createFighters() {
    this.fighters = this.add.group();
    this.p1 = new Fighter(this, PLAYERS.p1);
    this.p2 = new Fighter(this, PLAYERS.p2);
    this.fighters.add(this.p1);
    this.fighters.add(this.p2);
  }

  createHud() {
    this.add.rectangle(GAME.width / 2, 670, GAME.width, 110, 0x0d1a2c, 0.72).setDepth(40);

    this.hud = {
      p1Portrait: this.add
        .image(54, 655, 'tiles', 'hud_player_green')
        .setScale(1.1)
        .setDepth(41),
      p1Stock: this.add
        .text(110, 640, this.stockText(this.p1), {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '24px',
          fontStyle: 'bold',
          color: PLAYERS.p1.hudColor,
        })
        .setOrigin(0, 0.5)
        .setDepth(41),
      p1Pct: this.add
        .text(110, 678, '0%', {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '34px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0, 0.5)
        .setDepth(41),
      p2Portrait: this.add
        .image(GAME.width - 54, 655, 'tiles', 'hud_player_pink')
        .setScale(1.1)
        .setDepth(41),
      p2Stock: this.add
        .text(GAME.width - 110, 640, this.stockText(this.p2), {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '24px',
          fontStyle: 'bold',
          color: PLAYERS.p2.hudColor,
        })
        .setOrigin(1, 0.5)
        .setDepth(41),
      p2Pct: this.add
        .text(GAME.width - 110, 678, '0%', {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '34px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(1, 0.5)
        .setDepth(41),
    };

    this.add
      .text(GAME.width / 2, 680, 'ESC menu', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px',
        color: '#8fa3c8',
      })
      .setOrigin(0.5)
      .setDepth(41);
  }

  stockText(fighter) {
    const filled = Math.max(fighter.stocks, 0);
    const empty = Math.max(GAME.stocks - fighter.stocks, 0);
    return `${fighter.displayName}  ${'♥'.repeat(filled)}${'♡'.repeat(empty)}`;
  }

  createCollisions() {
    this.physics.add.collider(this.p1, this.platforms);
    this.physics.add.collider(this.p2, this.platforms);

    this.physics.add.overlap(this.p1.hitbox, this.p2, (hitbox, target) => {
      this.resolveHit(hitbox.owner, target);
    });
    this.physics.add.overlap(this.p2.hitbox, this.p1, (hitbox, target) => {
      this.resolveHit(hitbox.owner, target);
    });
  }

  resolveHit(attacker, target) {
    if (!attacker?.isAttacking || target.isDead) return;
    const time = this.time.now;
    const landed = target.applyHit(attacker, time);
    if (landed) {
      this.spawnHitSpark(target.x, target.y - 10, attacker.fighterConfig.color);
      this.updateHud();
    }
  }

  spawnHitSpark(x, y, tint) {
    const spark = this.add.image(x, y, 'tiles', 'star').setDepth(15).setScale(0.7);
    spark.setTint(tint);
    this.tweens.add({
      targets: spark,
      scale: 1.4,
      alpha: 0,
      angle: 40,
      duration: 180,
      onComplete: () => spark.destroy(),
    });
  }

  update() {
    if (this.matchOver) return;
    this.updateHud();
    this.checkBlastZones();
  }

  updateHud() {
    this.hud.p1Stock.setText(this.stockText(this.p1));
    this.hud.p2Stock.setText(this.stockText(this.p2));
    this.hud.p1Pct.setText(`${Math.floor(this.p1.percent)}%`);
    this.hud.p2Pct.setText(`${Math.floor(this.p2.percent)}%`);
  }

  checkBlastZones() {
    [this.p1, this.p2].forEach((f) => {
      if (f.isDead) return;
      if (f.x < BLAST.left || f.x > BLAST.right || f.y < BLAST.top || f.y > BLAST.bottom) {
        this.koFighter(f);
      }
    });
  }

  koFighter(fighter) {
    fighter.kill();
    this.cameras.main.flash(120, 255, 255, 255, false);
    this.updateHud();

    if (fighter.stocks <= 0) {
      this.endMatch(fighter.playerId === 'p1' ? this.p2 : this.p1);
      return;
    }

    const spawnX = fighter.playerId === 'p1' ? PLAYERS.p1.spawnX : PLAYERS.p2.spawnX;
    this.time.delayedCall(900, () => {
      if (!this.matchOver) fighter.respawn(spawnX);
    });
  }

  endMatch(winner) {
    this.matchOver = true;
    this.p1.body.enable = false;
    this.p2.body.enable = false;
    this.p1.endAttack();
    this.p2.endAttack();

    this.time.delayedCall(600, () => {
      this.scene.start('ResultScene', {
        winnerId: winner.playerId,
        winnerName: winner.displayName,
        winnerSkin: winner.skin,
        winnerColor: winner.fighterConfig.color,
        p1Stocks: this.p1.stocks,
        p2Stocks: this.p2.stocks,
      });
    });
  }
}
