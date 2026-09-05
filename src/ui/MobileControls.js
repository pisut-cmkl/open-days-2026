import Phaser from 'phaser';
import { GAME } from '../config.js';

/**
 * Dual on-screen pads for local 2P on phones/tablets.
 * P1 = left cluster, P2 = right cluster.
 * Multi-touch safe; state is polled by Fighter.
 */
export class MobileControls {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.depth = 60;
    this.container = scene.add.container(0, 0).setDepth(this.depth).setScrollFactor(0);

    /** @type {Record<'p1'|'p2', ReturnType<MobileControls['freshState']>>} */
    this.state = {
      p1: this.freshState(),
      p2: this.freshState(),
    };

    this.buttons = [];

    this.buildPlayerPad('p1', {
      side: 'left',
      accent: 0x4caf50,
      labelColor: '#7CFC98',
    });
    this.buildPlayerPad('p2', {
      side: 'right',
      accent: 0xff6b9d,
      labelColor: '#FF8FBF',
    });

    this.buildMenuButton();

    scene.input.on('pointerup', (pointer) => this.releasePointer(pointer.id));
    scene.input.on('pointerupoutside', (pointer) => this.releasePointer(pointer.id));
    scene.input.on('gameout', () => this.releaseAll());
  }

  freshState() {
    return {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      attack: false,
      attackPressed: false,
      down: false,
    };
  }

  buildPlayerPad(playerId, { side, accent, labelColor }) {
    const isLeft = side === 'left';
    const baseX = isLeft ? 110 : GAME.width - 110;
    const baseY = GAME.height - 118;
    const moveY = baseY;
    const actionX = isLeft ? baseX + 150 : baseX - 150;

    const tag = this.scene.add
      .text(baseX, baseY - 118, playerId.toUpperCase(), {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: labelColor,
        backgroundColor: '#00000066',
        padding: { x: 8, y: 3 },
      })
      .setOrigin(0.5);
    this.container.add(tag);

    this.makeHoldButton({
      playerId,
      action: 'left',
      x: baseX - 58,
      y: moveY,
      label: '◀',
      radius: 42,
      accent,
    });
    this.makeHoldButton({
      playerId,
      action: 'right',
      x: baseX + 58,
      y: moveY,
      label: '▶',
      radius: 42,
      accent,
    });
    this.makeHoldButton({
      playerId,
      action: 'down',
      x: baseX,
      y: moveY + 64,
      label: '▼',
      radius: 34,
      accent,
      alpha: 0.4,
    });

    this.makePulseButton({
      playerId,
      action: 'jump',
      x: actionX,
      y: moveY - 52,
      label: 'JUMP',
      radius: 46,
      accent,
    });
    this.makePulseButton({
      playerId,
      action: 'attack',
      x: actionX,
      y: moveY + 42,
      label: 'ATK',
      radius: 46,
      accent: 0xffdd55,
      textColor: '#1a1a1a',
    });
  }

  buildMenuButton() {
    const btn = this.makeSimpleButton({
      x: GAME.width / 2,
      y: 56,
      w: 96,
      h: 40,
      label: 'MENU',
      fill: 0x1a2740,
      onPress: () => {
        this.releaseAll();
        this.scene.scene.start('MenuScene');
      },
    });
    this.container.add(btn);
  }

  makeHoldButton({ playerId, action, x, y, label, radius, accent, alpha = 0.45 }) {
    const hit = this.scene.add.circle(x, y, radius, accent, alpha).setStrokeStyle(3, 0xffffff, 0.55);
    const text = this.scene.add
      .text(x, y, label, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: radius > 40 ? '28px' : '22px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Hit area in local top-left space (circle display size = 2*radius)
        const hitR = radius + 12;
        hit.setInteractive(
          new Phaser.Geom.Circle(radius, radius, hitR),
          Phaser.Geom.Circle.Contains,
        );

    const bind = (pressed) => {
      this.state[playerId][action] = pressed;
      hit.setAlpha(pressed ? 0.85 : alpha);
      hit.setScale(pressed ? 0.94 : 1);
    };

    hit.on('pointerdown', (pointer) => {
      pointer.event?.preventDefault?.();
      hit.setData('pointerId', pointer.id);
      bind(true);
    });
    hit.on('pointerup', (pointer) => {
      if (hit.getData('pointerId') === pointer.id) {
        hit.setData('pointerId', null);
        bind(false);
      }
    });

    this.buttons.push({ hit, text, playerId, action, mode: 'hold', baseAlpha: alpha });
    this.container.add([hit, text]);
  }

  makePulseButton({
    playerId,
    action,
    x,
    y,
    label,
    radius,
    accent,
    textColor = '#ffffff',
    alpha = 0.5,
  }) {
    const hit = this.scene.add.circle(x, y, radius, accent, alpha).setStrokeStyle(3, 0xffffff, 0.6);
    const text = this.scene.add
      .text(x, y, label, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: textColor,
      })
      .setOrigin(0.5);

    const hitR = radius + 14;
        hit.setInteractive(
          new Phaser.Geom.Circle(radius, radius, hitR),
          Phaser.Geom.Circle.Contains,
        );

    const pressedKey = `${action}Pressed`;

    hit.on('pointerdown', (pointer) => {
      pointer.event?.preventDefault?.();
      hit.setData('pointerId', pointer.id);
      this.state[playerId][action] = true;
      this.state[playerId][pressedKey] = true;
      hit.setAlpha(0.9);
      hit.setScale(0.92);
    });

    const release = (pointer) => {
      if (pointer && hit.getData('pointerId') !== pointer.id) return;
      hit.setData('pointerId', null);
      this.state[playerId][action] = false;
      hit.setAlpha(alpha);
      hit.setScale(1);
    };

    hit.on('pointerup', release);
    hit.on('pointerupoutside', release);

    this.buttons.push({ hit, text, playerId, action, mode: 'pulse', baseAlpha: alpha });
    this.container.add([hit, text]);
  }

  makeSimpleButton({ x, y, w, h, label, fill, onPress }) {
    const wrap = this.scene.add.container(x, y);
    const bg = this.scene.add
      .rectangle(0, 0, w, h, fill, 0.75)
      .setStrokeStyle(2, 0xffffff, 0.45)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
      .text(0, 0, label, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#d7e3ff',
      })
      .setOrigin(0.5);
    wrap.add([bg, text]);

    bg.on('pointerdown', (pointer) => {
      pointer.event?.preventDefault?.();
      bg.setFillStyle(fill, 1);
      bg.setScale(0.96);
    });
    bg.on('pointerup', (pointer) => {
      bg.setFillStyle(fill, 0.75);
      bg.setScale(1);
      onPress?.(pointer);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(fill, 0.75);
      bg.setScale(1);
    });
    return wrap;
  }

  releasePointer(pointerId) {
    this.buttons.forEach((b) => {
      if (b.hit.getData('pointerId') === pointerId) {
        b.hit.setData('pointerId', null);
        this.state[b.playerId][b.action] = false;
        b.hit.setAlpha(b.baseAlpha);
        b.hit.setScale(1);
      }
    });
  }

  releaseAll() {
    ['p1', 'p2'].forEach((id) => {
      this.state[id] = this.freshState();
    });
    this.buttons.forEach((b) => {
      b.hit.setData('pointerId', null);
      b.hit.setAlpha(b.baseAlpha);
      b.hit.setScale(1);
    });
  }

  /**
   * Snapshot for a player. Edge flags (jumpPressed / attackPressed) are
   * consumed on read so they stay true across the frame they were set.
   */
  getPlayerState(playerId) {
    const s = this.state[playerId] ?? this.freshState();
    const snapshot = {
      left: s.left,
      right: s.right,
      down: s.down,
      jump: s.jump,
      jumpPressed: s.jumpPressed,
      attack: s.attack,
      attackPressed: s.attackPressed,
    };
    s.jumpPressed = false;
    s.attackPressed = false;
    return snapshot;
  }

  destroy() {
    this.releaseAll();
    this.container.destroy(true);
  }
}

/**
 * Large tap target for menu / result screens.
 */
export function addTouchButton(scene, x, y, label, onClick, opts = {}) {
  const w = opts.w ?? 280;
  const h = opts.h ?? 64;
  const fill = opts.fill ?? 0x146c43;
  const container = scene.add.container(x, y).setDepth(opts.depth ?? 50);

  const bg = scene.add
    .rectangle(0, 0, w, h, fill, 0.92)
    .setStrokeStyle(3, 0xffffff, 0.7)
    .setInteractive({ useHandCursor: true });
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: opts.fontSize ?? '26px',
      fontStyle: 'bold',
      color: opts.color ?? '#ffffff',
    })
    .setOrigin(0.5);

  container.add([bg, text]);

  bg.on('pointerover', () => bg.setFillStyle(fill, 1));
  bg.on('pointerout', () => {
    bg.setFillStyle(fill, 0.92);
    bg.setScale(1);
  });
  bg.on('pointerdown', (pointer) => {
    pointer.event?.preventDefault?.();
    bg.setScale(0.96);
  });
  bg.on('pointerup', (pointer) => {
    bg.setScale(1);
    onClick?.(pointer);
  });

  return container;
}
