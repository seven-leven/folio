# 3D models for the project pages

Each project page can show its model in the 3D viewer (`site/assets/js/model-viewer.js`, three.js). Adding one takes
three steps.

**1. Give the project a `model` entry** in `site/_data/projects.json`:

```json
"model": {
  "file": "assets/projects/sem4/model.glb",
  "poster": "assets/projects/sem4/model-poster.webp",
  "alt": "What the model shows, for screen readers",
  "caption": "The final Rhino model.",
  "clay": false
}
```

`clay: true` starts the viewer as a white card model. Use it when the model's colours are only Rhino layer colours.
Visitors can switch it either way with the Clay button.

**2. Put the viewer on the page**, inside a section with the page's own heading:

```html
<section id="model" class="animate-on-scroll-target">
  <h2>The Model</h2>
  <!-- @include model -->
</section>
```

The build stamps in `site/_partials/model.html`: the viewer, its poster, the download link with the model's size, and
the three.js import map.

**3. Make the model and its poster** from the SketchUp or Rhino file:

```
deno task model sem4 "C:\path\to\model.3dm"
```

It runs Rhino 8 (import, export FBX, quit; FBX because Rhino's glTF writer fails on some Enscape materials), then
Blender with `web-model.py`, then opens the page in headless Chrome and saves the viewer's first view as the poster. To
retake only the poster (after changing the views in `model-viewer.js`), run `deno task model sem4 --poster`.

## What `web-model.py` does

- Drops stray objects more than 30 m from the rest (Semester 3 had one 180 m away).
- Drops the ground plane: flat faces at the lowest level larger than 5 m² (`--ground` changes that). SketchUp models
  often sit on one.
- Turns pure black materials (SketchUp's default) dark grey.
- Joins everything into one mesh and welds duplicate vertices.
- Centres the model with its lowest point at 0, which is what the viewer frames from.
- Keeps it under 400,000 triangles (`--max-tris`). It first merges faces that are flat to within 1°: that took Semester
  3 from 3.2 million to 159,000 with no visible change. If it's still over, it simplifies the densest parts.
- Makes materials that aren't metal matte, since FBX brings them in glossy.
- Keeps only colour textures: roughness, normal and displacement maps are dropped.
- Shrinks textures to 1024 px WebP and Draco-compresses the geometry.

The Reading Nook went from 9.3 MB to 0.4 MB. Check that the size it prints is in metres.

Glass is recognised by its material name ("glass" anywhere in it) or by being transparent, since the export can lose
SketchUp's opacity.

## three.js

three.js is vendored in `site/assets/vendor/three/`: version 0.186.1, from jsDelivr. It's `build/three.module.min.js`,
plus `build/three.core.min.js` saved as `three.core.js` (the name the module imports), plus the addons the viewer uses.
To update it, download the same files for the new version.

Rhino and Blender are looked up in their default Windows install folders. Set `RHINO_PATH` or `BLENDER_PATH` if they're
somewhere else.
