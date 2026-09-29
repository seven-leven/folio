"""Turn a glTF exported from Rhino into a small, web-ready .glb for the 3D viewer
(site/assets/js/model-viewer.js). Runs inside Blender:

    blender -b --python tools/models/web-model.py -- in.glb out.glb [--ground 5]

- Drops the site/ground plane: horizontal faces at the model's lowest level larger than
  --ground square metres (default 5). SketchUp models often sit on one.
- SketchUp's default material comes through pure black; it becomes a dark grey.
- Joins everything into one object, welds duplicate vertices, and puts the model's centre
  on the origin with its lowest point at 0 (the viewer frames from that).
- Scales textures down to 1024 px, saves them as WebP, and Draco-compresses the mesh.

See tools/models/README.md for the whole route from a .skp or .3dm file.
"""
import sys

import bmesh
import bpy
import mathutils

args = sys.argv[sys.argv.index("--") + 1:]
src, out = args[0], args[1]
ground = float(args[args.index("--ground") + 1]) if "--ground" in args else 5.0

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
scene = bpy.context.scene
objs = [o for o in scene.objects if o.type == "MESH"]

# Lowest point of the whole model, in world space
low = min((o.matrix_world @ v.co).z for o in objs for v in o.data.vertices)

# Drop the ground plane
for o in objs:
    bm = bmesh.new()
    bm.from_mesh(o.data)
    scale = max(o.matrix_world.to_scale())
    world_normal = o.matrix_world.to_3x3()
    drop = [f for f in bm.faces
            if abs((world_normal @ f.normal).normalized().z) > 0.99
            and abs((o.matrix_world @ f.calc_center_median()).z - low) < 0.01
            and f.calc_area() * scale ** 2 > ground]
    if drop:
        print(f"Dropped {len(drop)} ground face(s) from {o.name}")
        bmesh.ops.delete(bm, geom=drop, context="FACES")
        bm.to_mesh(o.data)
    bm.free()
objs = [o for o in objs if len(o.data.polygons)]

# Pure black materials (SketchUp's default) become dark grey
for m in bpy.data.materials:
    bsdf = m.node_tree and next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf and not bsdf.inputs["Base Color"].is_linked and tuple(bsdf.inputs["Base Color"].default_value)[:3] == (0, 0, 0):
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.05, 1)

# One object, transforms applied, duplicate vertices welded
bpy.ops.object.select_all(action="DESELECT")
for o in objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.make_single_user(object=True, obdata=True)
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.join()
model = bpy.context.view_layer.objects.active
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.remove_doubles(threshold=0.0005)
bpy.ops.object.mode_set(mode="OBJECT")
for o in [o for o in scene.objects if o != model]:
    bpy.data.objects.remove(o)

# Centre on the origin, lowest point at zero
co = [v.co for v in model.data.vertices]
lo = mathutils.Vector([min(c[i] for c in co) for i in range(3)])
hi = mathutils.Vector([max(c[i] for c in co) for i in range(3)])
offset = mathutils.Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
for v in model.data.vertices:
    v.co -= offset

for img in bpy.data.images:
    if max(img.size) > 1024:
        img.scale(*(int(s * 1024 / max(img.size)) for s in img.size))

size = hi - lo
tris = sum(len(p.vertices) - 2 for p in model.data.polygons)
print(f"{size.x:.2f} x {size.y:.2f} x {size.z:.2f} m, {tris} triangles, {len(bpy.data.materials)} materials")

bpy.ops.export_scene.gltf(
    filepath=out, export_format="GLB", export_image_format="WEBP", export_image_quality=80,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12, export_apply=True, export_yup=True,
    export_cameras=False, export_lights=False)
