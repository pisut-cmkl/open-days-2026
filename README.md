# Smash Brawl Prototype

Local 2-player Smash-style brawler prototype built with **Phaser 3** + **Vite**.

Art/SFX: [Kenney New Platformer Pack](https://kenney.nl) (CC0).

Fighters: **GREEN** vs **PINK** character sprites with idle / walk / jump / hit anims.

## Play

GitHub Pages: https://pisut-cmkl.github.io/open-days-2026/

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## Controls

| Action | P1 (Green) | P2 (Pink) |
|--------|------------|-----------|
| Move | A / D | ← / → |
| Jump (double jump) | W | ↑ |
| Attack | F | L |
| Fast-fall | S | ↓ |
| Pause / menu | Esc | Esc |

## Rules

- **3 stocks** each
- Damage shown as **%**
- Higher % = stronger knockback
- Leave the blast zone = KO
- Last player with stocks wins

## Assets used

Kenney pack lives in `public/assets/` (served as `/assets/...`):

- `public/assets/Spritesheets/spritesheet-characters-default.*`
- `public/assets/Spritesheets/spritesheet-tiles-default.*`
- `public/assets/Spritesheets/spritesheet-backgrounds-default.*`
- `public/assets/Sounds/*.ogg`
