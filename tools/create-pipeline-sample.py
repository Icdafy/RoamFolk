"""Original pipeline fixture, deliberately not a formal floor or 25-floor tower."""
import bpy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*color, 1)
    mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8
    return mat

cream = material('MAT_Plaster', (0.79, 0.71, 0.55))
green = material('MAT_Sage', (0.21, 0.36, 0.28))
glass = material('MAT_GlassOpaque', (0.16, 0.28, 0.29))
wood = material('MAT_Terracotta', (0.56, 0.27, 0.13))
sand = material('MAT_Platform', (0.68, 0.65, 0.49))
leaf = material('MAT_Leaves', (0.30, 0.44, 0.18))

def cube(name, location, size, mat, bevel=0.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        modifier = obj.modifiers.new('SoftEdges', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 3
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj

cube('ENV_Platform', (0, 0, 0.18), (8.5, 7, 0.36), sand, 0.18)
for level in range(3):
    z = 0.4 + level * 1.45
    cube('ENV_SampleVolume_' + str(level), (0, 0.65, z + 0.65), (4.1, 3, 1.3), cream)
    cube('ENV_Slab_' + str(level), (0, 0.65, z), (4.45, 3.3, 0.14), wood)
    for x in [-1.35, 0, 1.35]:
        cube('ENV_FrontWindow', (x, -0.873, z + 0.71), (0.87, 0.09, 0.87), glass, 0.03)
        cube('ENV_WindowSill', (x, -0.95, z + 0.25), (1.04, 0.21, 0.08), cream, 0.02)
    for y in [-0.15, 1.42]:
        cube('ENV_SideWindow', (2.07, y, z + 0.71), (0.08, 0.91, 0.87), glass, 0.02)
cube('ENV_Roof', (0, 0.65, 4.76), (4.6, 3.5, 0.22), green, 0.08)
cube('ENV_RoofHut', (-0.65, 1.1, 5.12), (1.35, 1.35, 0.55), cream)
cube('ENV_Canopy', (0, -1.43, 1.66), (2.35, 1.14, 0.13), green)
for x in [-1.05, 1.05]:
    cube('ENV_CanopyPost', (x, -1.9, 1.04), (0.09, 0.09, 1.35), green, 0.01)
cube('ENV_Path', (0, -2.48, 0.39), (2.3, 1.3, 0.08), cream)
for x, y in [(-3, -1.6), (3, 1.8)]:
    cube('ENV_Planter', (x, y, 0.62), (1.15, 1.15, 0.5), wood, 0.12)
    cube('ENV_Trunk', (x, y, 1.35), (0.18, 0.18, 1.3), wood)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.85, location=(x, y, 2.25))
    bpy.context.object.name = 'ENV_TreeCrown'
    bpy.context.object.scale = (0.85, 0.85, 1.1)
    bpy.context.object.data.materials.append(leaf)
cube('ENV_Bench', (2.8, -1.7, 0.86), (1.6, 0.6, 0.14), wood)
for x in [2.2, 3.4]:
    cube('ENV_BenchLeg', (x, -1.7, 0.6), (0.12, 0.48, 0.4), green, 0.01)

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, -2.4, 0.45))
anchor = bpy.context.object
anchor.name = 'ANCHOR_sample_spawn'
anchor['roamfolk_id'] = 'pipeline.sample.spawn'
anchor['roamfolk_kind'] = 'spawn'
anchor['roamfolk_fixture'] = True
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(2.8, -2.2, 0.45))
anchor = bpy.context.object
anchor.name = 'ANCHOR_sample_seat'
anchor['roamfolk_id'] = 'pipeline.sample.seat'
anchor['roamfolk_kind'] = 'seat'
anchor['roamfolk_fixture'] = True

source = ROOT / 'assets/source/pipeline-sample.blend'
output = ROOT / 'public/assets/models/pipeline-sample.glb'
source.parent.mkdir(parents=True, exist_ok=True)
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source))
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', export_extras=True, export_yup=True)
manifest = {
    'schemaVersion': 1, 'id': 'pipeline-sample', 'kind': 'fixture',
    'generator': 'Blender ' + bpy.app.version_string, 'metersPerUnit': 1,
    'runtimeUpAxis': 'Y', 'sourceUpAxis': 'Z',
    'source': 'assets/source/pipeline-sample.blend',
    'model': 'public/assets/models/pipeline-sample.glb',
    'budgetBytes': 20 * 1024 * 1024,
    'requiredAnchors': ['pipeline.sample.spawn', 'pipeline.sample.seat'],
    'note': 'Original engineering fixture. Not a playable floor or the formal building.'
}
(ROOT / 'public/assets/manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print('ROAMFOLK_EXPORT_OK', output.stat().st_size)
