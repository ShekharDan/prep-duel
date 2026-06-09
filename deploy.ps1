# PrepDuel → GitHub Pages (ShekharDan/prep-duel)
# Run once: gh auth login
# Then: .\deploy.ps1

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $gh) { $gh = "C:\Program Files\GitHub CLI\gh.exe" }

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Pehle login karo: gh auth login" -ForegroundColor Yellow
  exit 1
}

$repo = "ShekharDan/prep-duel"
$repoExists = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
& $gh repo view $repo *> $null
if ($LASTEXITCODE -eq 0) { $repoExists = $true }
$ErrorActionPreference = $prevEap

if (-not $repoExists) {
  Write-Host "Creating repo $repo ..." -ForegroundColor Cyan
  if (git remote get-url origin 2>$null) {
    & $gh repo create prep-duel --public --description "CIL + corporate prep tracker with duel sync" --push --source=.
  } else {
    & $gh repo create prep-duel --public --description "CIL + corporate prep tracker with duel sync" --source=. --remote=origin --push
  }
} else {
  Write-Host "Pushing to $repo ..." -ForegroundColor Cyan
  git push -u origin main
}

$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
& $gh api repos/ShekharDan/prep-duel/pages -X POST -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" *> $null
if ($LASTEXITCODE -ne 0) {
  & $gh api repos/ShekharDan/prep-duel/pages -X PUT -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" *> $null
}
$ErrorActionPreference = $prevEap

Write-Host ""
Write-Host "Live URL: https://shekhardan.github.io/prep-duel/" -ForegroundColor Green
Write-Host "GF ko yeh link + same room code bhejo." -ForegroundColor Cyan
