param([string]$BlenderPath = $env:BLENDER_PATH)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
if (!$BlenderPath) {
  $BlenderPath = Join-Path $PSScriptRoot 'blender/blender-4.5.13-windows-x64/blender.exe'
}
if (!(Test-Path -LiteralPath $BlenderPath)) { throw 'Blender missing. See docs/工程与资源规范.md or set BLENDER_PATH.' }
& $BlenderPath --background --factory-startup --python-exit-code 1 --python (Join-Path $PSScriptRoot 'create-pipeline-sample.py')
if ($LASTEXITCODE -ne 0) { throw 'Blender export failed' }
Push-Location $projectRoot
try { node tools/check-assets.mjs; if ($LASTEXITCODE -ne 0) { throw 'Asset checks failed' } } finally { Pop-Location }
