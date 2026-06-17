# AGENTS.md

## Cursor Cloud specific instructions

ZombieRun is a single-product repository: a Vite + TypeScript PWA (currently the default Vite starter scaffold; product spec in `docs/ZombieRun-Specification.md`). There is no backend, database, or Docker — it is fully client-side.

### Layout
- `/` (root): tooling only (`eslint`, `prettier`, `vitest` in devDependencies). No real `test` script and no ESLint config file present, so `npx eslint .` fails until a config is added — this is expected, not an environment problem.
- `zombierun/`: the actual web app. All dev/build/run commands live in `zombierun/package.json`.

### Running / building (run inside `zombierun/`)
- Dev server: `npm run dev` (Vite, serves on `http://localhost:5173`).
- Build: `npm run build` (runs `tsc && vite build`).
- Preview production build: `npm run preview`.

### Notes
- Dependencies are installed in two places: root (`/`) and `zombierun/`. The startup update script handles both.
- No tests are written yet; the root `test` script is a placeholder that exits 1.
