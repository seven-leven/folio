# 3D models for the project pages

A project page can show its model in the 3D viewer (`site/assets/js/model-viewer.js`, three.js). The viewer loads a
Draco-compressed `.glb`; this is how to make one from a SketchUp (`.skp`) or Rhino (`.3dm`) file.

## 1. Export glTF from Rhino

Rhino 8 opens both formats and exports glTF. From a command line (Rhino runs, converts and quits):

```
"C:\Program Files\Rhino 8\System\Rhino.exe" /nosplash /notemplate /runscript="-_ReadCommandFile C:\path\to\convert.txt"
```

with `convert.txt`:

```
-_Import "C:\path\to\model.skp" _Enter
-_SelAll
-_Export "C:\path\to\model.glb" _Enter _Enter
-_Exit _No
```

(For a `.3dm`, use `-_Open "C:\path\to\model.3dm"` instead of `-_Import`.)

## 2. Make it web-ready in Blender

```
blender -b --python tools/models/web-model.py -- C:\path\to\model.glb site\assets\projects\semN\model.glb
```

This drops the ground plane, joins and welds the mesh, centres it, shrinks the textures to WebP and compresses the
geometry. The Reading Nook went from 9.3 MB to 0.4 MB. Check the size it prints: it should be in metres.

## 3. Put it on the page

Copy the `<figure class="model-viewer">` block from `site/sem1.html` (and its import map in `<head>` and the
`model-viewer.js` script tag at the end), then change the model link, labels and the poster image. For the poster, open
the viewer, and screenshot it with the default view (then `deno task images` to make it WebP).

Glass is recognised by its material name (anything with "glass" in it becomes see-through), since the export loses
SketchUp's opacity.

three.js is vendored in `site/assets/vendor/three/` (version 0.186.1, from jsDelivr: `build/three.module.min.js`,
`build/three.core.min.js` saved as `three.core.js` because that's the name the module imports, and the addons the viewer
uses). To update it, download the same files for the new version.
