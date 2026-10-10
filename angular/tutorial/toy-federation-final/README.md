# Toy Federation (finished)

The finished workspace for [Chapter 32: Micro-frontends](../32-micro-frontends.md) of the Angular tutorial. It uses [Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation).

| Project | Role | Port |
|---------|------|------|
| `shell` | The **host**. It reads `public/federation.manifest.json` and loads the remote's `ToyShelf` when you open `/toys` | 4200 |
| `toys-remote` | The **remote**. It exposes `./ToyShelf` (see `federation.config.mjs`) | 4201 |

## Run it

Open two terminals in this folder:

```bash
npm ci
ng serve toys-remote     # http://localhost:4201 (look at /remoteEntry.json)
ng serve shell           # http://localhost:4200
```

Open <http://localhost:4200/>, then click **Toys (from another app)**.

The name must be exactly the same in three places: the key in `projects/shell/public/federation.manifest.json`, the first argument of `loadRemoteModule(...)` in `app.routes.ts`, and `name` in `projects/toys-remote/federation.config.mjs` (`toys-remote`).
