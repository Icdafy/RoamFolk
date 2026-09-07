$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
  if (!(Test-Path 'dist/server/index.js') -or !(Test-Path 'dist/server/wrangler.json')) { throw 'Run npm run build first.' }
  $gitState = git status --porcelain
  if ($LASTEXITCODE -ne 0 -or $gitState) { throw 'Commit the validated source before packaging.' }
  $version = (Get-Content package.json -Raw | ConvertFrom-Json).version
  $commit = git rev-parse --verify HEAD
  if ($LASTEXITCODE -ne 0) { throw 'Unable to determine commit' }
  $stage = Join-Path $projectRoot ('.work/release-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force $stage | Out-Null
  Copy-Item -LiteralPath 'dist' -Destination (Join-Path $stage 'dist') -Recurse
  Copy-Item -LiteralPath 'package.json','package-lock.json' -Destination $stage
  Copy-Item -LiteralPath 'docs/启动说明.md' -Destination (Join-Path $stage 'START.md')
  $releasePackage = Get-Content (Join-Path $stage 'package.json') -Raw | ConvertFrom-Json
  $releasePackage.scripts = @{ start = 'wrangler dev --config dist/server/wrangler.json' }
  $releasePackage | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $stage 'package.json') -Encoding utf8
  $entries = Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object {
    @{ path = $_.FullName.Substring($stage.Length + 1).Replace('\','/'); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower() }
  }
  @{ version=$version; commit=$commit; files=@($entries) } | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $stage 'release-manifest.json') -Encoding utf8
  $archive = Join-Path $projectRoot ('.work/RoamFolk-v' + $version + '-build.zip')
  if (Test-Path -LiteralPath $archive) { throw 'Release archive already exists; preserve it or choose a new version.' }
  tar.exe -a -cf $archive -C $stage .
  if ($LASTEXITCODE -ne 0) { throw 'Archive failed' }
  $checksum = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLower()
  ($checksum + '  ' + (Split-Path $archive -Leaf)) | Set-Content ($archive + '.sha256') -Encoding ascii
  Write-Output $archive
  Write-Output ('SHA256 ' + $checksum)
} finally { Pop-Location }
