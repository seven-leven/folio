"""Turn a glTF or FBX exported from Rhino into a small, web-ready .glb for the 3D viewer
(site/assets/js/model-viewer.js). Runs inside Blender:

    blender -b --python tools/models/web-model.py -- in.glb out.glb [--ground 5] [--max-tris 400000]

- Drops stray objects far from the rest of the model (a leftover line of geometry 200 m away
  would otherwise set the framing).
- Drops the site/ground plane: horizontal faces at the model's lowest level larger than
  --ground square metres (default 5). SketchUp models often sit on one.
- SketchUp's default material comes through pure black; it becomes a dark grey. Materials
  that aren't metal are made matte (FBX brings them in glossy).
- Joins everything into one object, welds duplicate vertices, and puts the model's centre
  on the origin with its lowest point at 0 (the viewer frames from that).
- Keeps the triangle count under --max-tris: first merges flat faces, then, if still over,
  simplifies the densest parts (detailed rails and meshes) the most.
- Keeps only colour textures (roughness, normal and displacement maps add weight the web
  view doesn't show), scales them down to 1024 px as WebP, and Draco-compresses the mesh.

See tools/models/README.md for the whole route from a .skp or .3dm file.
"""
import re
import sys

import bmesh
import bpy
import mathutils

args = sys.argv[sys.argv.index("--") + 1:]
src, out = args[0], args[1]
ground = float(args[args.index("--ground") + 1]) if "--ground" in args else 5.0
max_tris = int(args[args.index("--max-tris") + 1]) if "--max-tris" in args else 400_000

bpy.ops.wm.read_factory_settings(use_empty=True)
if src.lower().endswith(".fbx"):
    bpy.ops.import_scene.fbx(filepath=src)  # FBX carries its units; Blender scales to metres
else:
    bpy.ops.import_scene.gltf(filepath=src)
scene = bpy.context.scene
objs = [o for o in scene.objects if o.type == "MESH"]


def triangles(meshes):
    return sum(len(p.vertices) - 2 for o in meshes for p in o.data.polygons)


# Stray objects: centres over 30 m (or 3x the model's spread) outside the box that holds the
# middle 90% of object centres
centres = {o: o.matrix_world @ (sum((mathutils.Vector(c) for c in o.bound_box), mathutils.Vector()) / 8)
           for o in objs}
keep = []
for o in objs:
    far = False
    for i in range(3):
        values = sorted(c[i] for c in centres.values())
        p5, p95 = values[len(values) // 20], values[-1 - len(values) // 20]
        margin = max(3 * (p95 - p5), 30.0)  # metres
        far |= not (p5 - margin <= centres[o][i] <= p95 + margin)
    if far:
        print(f"Dropped stray object {o.name} at {tuple(round(v, 1) for v in centres[o])}")
        bpy.data.objects.remove(o)
    else:
        keep.append(o)
objs = keep

# Only colour textures: drop image nodes that don't feed a Base Color, and data maps whatever
# they're wired to (exporters sometimes put a roughness map in the colour slot)
DATA_MAP = re.compile(r"rough|normal|nrm|bump|disp|height|metal|spec|gloss|_ao|occlusion", re.I)

def feeds_base_colour(node, depth=0):
    for out in node.outputs:
        for link in out.links:
            if link.to_socket.name == "Base Color" or (depth < 3 and feeds_base_colour(link.to_node, depth + 1)):
                return True
    return False


for m in bpy.data.materials:
    if m.node_tree:
        for n in [n for n in m.node_tree.nodes if n.type == "TEX_IMAGE"
                  and (not feeds_base_colour(n) or (n.image and DATA_MAP.search(n.image.filepath)))]:
            m.node_tree.nodes.remove(n)

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

# FBX materials come in glossy; only metals should shine
METAL = re.compile(r"metal|iron|steel|alumin|chrome|brass|copper|zinc", re.I)
for m in bpy.data.materials:
    bsdf = m.node_tree and next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf and not METAL.search(m.name):
        for socket, value in (("Metallic", 0.0), ("Roughness", 0.75)):
            if not bsdf.inputs[socket].is_linked:
                bsdf.inputs[socket].default_value = max(bsdf.inputs[socket].default_value, value) if socket == "Roughness" else value

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

# Triangle budget
tris = triangles([model])
if tris > max_tris:
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.dissolve_limited(angle_limit=0.0175)  # merge faces that are flat to within 1 degree
    bpy.ops.mesh.quads_convert_to_tris()
    bpy.ops.object.mode_set(mode="OBJECT")
    flat = triangles([model])
    print(f"Merged flat faces: {tris} -> {flat} triangles")
    if flat > max_tris:
        dec = model.modifiers.new("budget", "DECIMATE")
        dec.ratio = max_tris / flat
        bpy.ops.object.modifier_apply(modifier=dec.name)
        print(f"Simplified: {flat} -> {triangles([model])} triangles (budget {max_tris})")
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
tris = triangles([model])
print(f"{size.x:.2f} x {size.y:.2f} x {size.z:.2f} m, {tris} triangles, {len(bpy.data.materials)} materials")

bpy.ops.export_scene.gltf(
    filepath=out, export_format="GLB", export_image_format="WEBP", export_image_quality=80,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12, export_apply=True, export_yup=True,
    export_cameras=False, export_lights=False)
