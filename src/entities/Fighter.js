import Phaser from 'phaser';
import { FIGHTER } from '../config.js';

export class Fighter extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    const frame = `character_${config.skin}_idle`;
    super(scene, config.spawnX, FIGHTER.respawnY, 'characters', frame);

    this.fighterConfig = config;
    this.playerId = config.id;
    this.displayName = config.name;
    this.skin = config.skin;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.setBounce(0);
    this.setDragX(1800);
    this.setMaxVelocity(900, 1600);
    this.setScale(FIGHTER.displayScale);
    this.setDepth(10);

    this.body.setSize(FIGHTER.bodyWidth, FIGHTER.bodyHeight);
    this.body.setOffset(FIGHTER.bodyOffsetX, FIGHTER.bodyOffsetY);

    this.percent = 0;
    this.stocks = scene.registry.get('stocks') ?? 3;
    this.facing = config.id === 'p1' ? 1 : -1;
    this.jumpsLeft = FIGHTER.maxJumps;
    this.canAttack = true;
    this.isAttacking = false;
    this.isHitstunned = false;
    this.isInvulnerable = false;
    this.isDead = false;
    this.hitstunUntil = 0;
    this.attackUntil = 0;
    this.wasOnFloor = false;

    this.setFlipX(this.facing < 0);
    this.playAnim('idle');

    this.nameLabel = scene.add
      .text(this.x, this.y - 58, config.name, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#e8eefc',
        backgroundColor: '#00000088',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.percentLabel = scene.add
      .text(this.x, this.y + 52, '0%', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.hitbox = scene.add.rectangle(
      this.x,
      this.y,
      FIGHTER.attackHitboxW,
      FIGHTER.attackHitboxH,
      0xffffff,
      0.25,
    );
    scene.physics.add.existing(this.hitbox);
    this.hitbox.body.allowGravity = false;
    this.hitbox.body.enable = false;
    this.hitbox.setVisible(false);
    this.hitbox.setDepth(11);
    this.hitbox.owner = this;
    this.alreadyHit = new Set();

    this.cursors = this.bindKeys(scene, config.keys);
        /** Optional mobile pad state provider: () => ({left,right,jump,jumpPressed,attack,attackPressed,down}) */
        this.virtualInput = null;
      }

      setVirtualInput(provider) {
        this.virtualInput = provider;
      }

      readInput() {
        const pad = this.virtualInput?.() ?? {};
        return {
          left: !!(this.cursors.left.isDown || pad.left),
          right: !!(this.cursors.right.isDown || pad.right),
          down: !!(this.cursors.down.isDown || pad.down),
          jumpPressed:
            Phaser.Input.Keyboard.JustDown(this.cursors.jump) || !!pad.jumpPressed,
          attackPressed:
            Phaser.Input.Keyboard.JustDown(this.cursors.attack) || !!pad.attackPressed,
        };
      }

  bindKeys(scene, keys) {
    return {
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.left]),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.right]),
      jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.jump]),
      attack: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.attack]),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys.down]),
    };
  }

  animKey(action) {
    return `${this.skin}-${action}`;
  }

  playAnim(action, ignoreIfPlaying = true) {
    const key = this.animKey(action);
    if (!this.anims.animationManager.exists(key)) return;
    if (ignoreIfPlaying && this.anims.isPlaying && this.anims.currentAnim?.key === key) return;
    this.play(key, ignoreIfPlaying);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.isDead) return;

    this.updateState(time);
    this.handleInput(time);
    this.updateAnimation();
    this.updateHitbox();
    this.updateLabels();
  }

  updateState(time) {
    const onFloor = this.body.blocked.down || this.body.touching.down;
    if (onFloor && !this.wasOnFloor) {
      this.jumpsLeft = FIGHTER.maxJumps;
    }
    this.wasOnFloor = onFloor;

    if (this.isHitstunned && time >= this.hitstunUntil) {
      this.isHitstunned = false;
      this.clearTint();
    }

    if (this.isAttacking && time >= this.attackUntil) {
      this.endAttack();
    }
  }

  handleInput(time) {
      if (this.isHitstunned || this.isDead) return;

      const onFloor = this.body.blocked.down || this.body.touching.down;
      const input = this.readInput();
      const speed = onFloor ? FIGHTER.moveSpeed : FIGHTER.airSpeed;

      if (input.left && !input.right) {
        this.setVelocityX(-speed);
        this.facing = -1;
        this.setFlipX(true);
      } else if (input.right && !input.left) {
        this.setVelocityX(speed);
        this.facing = 1;
        this.setFlipX(false);
      }

      if (input.jumpPressed && this.jumpsLeft > 0) {
        const isDouble = this.jumpsLeft < FIGHTER.maxJumps || !onFloor;
        this.setVelocityY(isDouble ? FIGHTER.doubleJumpVelocity : FIGHTER.jumpVelocity);
        this.jumpsLeft -= 1;
        this.scene.sound.play(isDouble ? 'sfx-jump-high' : 'sfx-jump', { volume: 0.35 });
      }

      if (input.down && !onFloor && this.body.velocity.y > -50) {
        this.setVelocityY(Math.max(this.body.velocity.y, 900));
      }

      if (input.attackPressed && this.canAttack && !this.isAttacking) {
        this.startAttack(time);
      }
    }

  updateAnimation() {
    if (this.isHitstunned) {
      this.playAnim('hit');
      return;
    }
    if (this.isAttacking) {
      this.playAnim('attack', false);
      return;
    }

    const onFloor = this.body.blocked.down || this.body.touching.down;
    if (!onFloor) {
      this.playAnim('jump');
      return;
    }

    if (Math.abs(this.body.velocity.x) > 40) {
      this.playAnim('walk');
    } else {
      this.playAnim('idle');
    }
  }

  startAttack(time) {
    this.isAttacking = true;
    this.canAttack = false;
    this.attackUntil = time + FIGHTER.attackDuration;
    this.alreadyHit.clear();
    this.hitbox.setVisible(true);
    this.hitbox.body.enable = true;
    this.playAnim('attack', false);
    this.scene.sound.play('sfx-throw', { volume: 0.3 });

    this.scene.time.delayedCall(FIGHTER.attackCooldown, () => {
      if (!this.isDead) this.canAttack = true;
    });
  }

  endAttack() {
    this.isAttacking = false;
    this.hitbox.setVisible(false);
    this.hitbox.body.enable = false;
    this.alreadyHit.clear();
  }

  updateHitbox() {
    if (!this.isAttacking) return;
    const offsetX = this.facing * FIGHTER.attackRange;
    this.hitbox.setPosition(this.x + offsetX, this.y + 4);
    this.hitbox.body.reset(this.x + offsetX, this.y + 4);
  }

  updateLabels() {
    this.nameLabel.setPosition(this.x, this.y - 58);
    this.percentLabel.setPosition(this.x, this.y + 52);
    this.percentLabel.setText(`${Math.floor(this.percent)}%`);
    const danger = Phaser.Math.Clamp(this.percent / 150, 0, 1);
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      new Phaser.Display.Color(255, 255, 255),
      new Phaser.Display.Color(255, 70, 70),
      100,
      Math.floor(danger * 100),
    );
    this.percentLabel.setColor(
      `rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`,
    );
  }

  applyHit(attacker, time) {
    if (this.isDead || this.isInvulnerable) return false;
    if (attacker.alreadyHit.has(this.playerId)) return false;
    attacker.alreadyHit.add(this.playerId);

    const damage = 10 + Math.random() * 4;
    this.percent += damage;

    const kb = FIGHTER.baseKnockback + this.percent * FIGHTER.knockbackGrowth;
    const dir = attacker.facing >= 0 ? 1 : -1;
    const vx = dir * kb;
    const vy = -kb * FIGHTER.upKnockbackBias;

    this.isHitstunned = true;
    this.hitstunUntil = time + FIGHTER.hitstunBase + this.percent * FIGHTER.hitstunGrowth;
    this.setVelocity(vx, vy);
    this.setTint(0xffffff);
    this.playAnim('hit');

    this.scene.sound.play('sfx-hurt', { volume: 0.4 });
    this.scene.cameras.main.shake(80, 0.004 + this.percent * 0.00002);
    this.flashHit();
    return true;
  }

  flashHit() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        if (!this.isDead && !this.isInvulnerable) this.setAlpha(1);
      },
    });
  }

  kill() {
    if (this.isDead) return;
    this.isDead = true;
    this.stocks -= 1;
    this.endAttack();
    this.body.enable = false;
    this.setVisible(false);
    this.nameLabel.setVisible(false);
    this.percentLabel.setVisible(false);
    this.scene.sound.play('sfx-ko', { volume: 0.45 });
    this.spawnBurst();
  }

  spawnBurst() {
    const particles = this.scene.add.particles(this.x, this.y, 'pixel', {
      speed: { min: 120, max: 420 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 450,
      quantity: 18,
      tint: this.fighterConfig.color,
      emitting: false,
    });
    particles.explode(24);
    this.scene.time.delayedCall(500, () => particles.destroy());
  }

  respawn(x) {
    this.isDead = false;
    this.percent = 0;
    this.jumpsLeft = FIGHTER.maxJumps;
    this.canAttack = true;
    this.isAttacking = false;
    this.isHitstunned = false;
    this.body.enable = true;
    this.setVisible(true);
    this.nameLabel.setVisible(true);
    this.percentLabel.setVisible(true);
    this.setAlpha(1);
    this.clearTint();
    this.setVelocity(0, 0);
    this.setPosition(x, FIGHTER.respawnY);
    this.body.reset(x, FIGHTER.respawnY);
    this.playAnim('idle');
    this.grantInvulnerability();
  }

  grantInvulnerability() {
    this.isInvulnerable = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: Math.floor(FIGHTER.invulnMs / 240),
      onComplete: () => {
        this.isInvulnerable = false;
        if (!this.isDead) this.setAlpha(1);
      },
    });
  }

  destroyLabels() {
    this.nameLabel?.destroy();
    this.percentLabel?.destroy();
    this.hitbox?.destroy();
  }
}
