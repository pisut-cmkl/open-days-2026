export const GAME = {
  width: 1280,
  height: 720,
  stocks: 3,
};

export const BLAST = {
  left: -140,
  right: GAME.width + 140,
  top: -180,
  bottom: GAME.height + 200,
};

export const TILE = 64;

export const STAGE = {
  groundY: 560,
  groundTiles: 14,
  platforms: [
    { x: 280, y: 400, tiles: 4 },
    { x: 1000, y: 400, tiles: 4 },
    { x: 640, y: 260, tiles: 3 },
  ],
};

export const FIGHTER = {
  // Kenney character frames are 128x128 with transparent padding
  displayScale: 0.72,
  bodyWidth: 44,
  bodyHeight: 62,
  bodyOffsetX: 42,
  bodyOffsetY: 48,
  moveSpeed: 420,
  airSpeed: 360,
  jumpVelocity: -820,
  doubleJumpVelocity: -720,
  maxJumps: 2,
  attackCooldown: 300,
  attackDuration: 160,
  attackRange: 54,
  attackHitboxW: 46,
  attackHitboxH: 40,
  baseKnockback: 320,
  knockbackGrowth: 9.5,
  upKnockbackBias: 0.55,
  hitstunBase: 120,
  hitstunGrowth: 2.2,
  invulnMs: 1500,
  respawnY: 160,
};

export const PLAYERS = {
  p1: {
    id: 'p1',
    name: 'GREEN',
    skin: 'green',
    color: 0x4caf50,
    hudColor: '#7CFC98',
    spawnX: 420,
    keys: {
      left: 'A',
      right: 'D',
      jump: 'W',
      attack: 'F',
      down: 'S',
    },
  },
  p2: {
    id: 'p2',
    name: 'PINK',
    skin: 'pink',
    color: 0xff6b9d,
    hudColor: '#FF8FBF',
    spawnX: 860,
    keys: {
      left: 'LEFT',
      right: 'RIGHT',
      jump: 'UP',
      attack: 'L',
      down: 'DOWN',
    },
  },
};

export const SKINS = ['beige', 'green', 'pink', 'purple', 'yellow'];
