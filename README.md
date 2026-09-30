# Devak Mehta — the desk

My portfolio as a rendered desk. Scroll and the camera moves across the desk from object to object:
the puck, the laptop, the pyramid, the notebook, the hooks card. Each stop is a build.

Built on [sen-3d-resume](https://github.com/dayinji/sen-3d-resume) by Sen Zheng (MIT), a
scroll-driven React Three Fiber scene where the camera path is an animation baked into the glb and
the scrollbar scrubs its timeline. The code is theirs under MIT (see `LICENSE`); the model, the
content and the assets here are mine (see `NOTICE.md`).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + bundle to dist/
node --test tests  # the model's naming contract
```

## The model

`public/models/me.glb` is generated, not downloaded: `node scripts/build-desk-glb.mjs` builds the
desk from primitive shapes (the puck's dimensions are the real enclosure, ring and button), adds the
camera with its `CameraAction` clip and the `focus-*` anchors the scene reads by name, and writes the
file. `tests/desk-glb.test.mjs` checks that contract.

## Nothing leaves the browser

No analytics, no third-party scripts, no runtime CDN. Fonts are bundled (SIL OFL, licences in
`public/fonts/`). The environment map is CC0 (Poly Haven). The DRACO decoder is switched off because
the model is uncompressed.
