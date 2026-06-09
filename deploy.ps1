# PrepDuel → GitHub Pages (ShekharDan/prep-duel)
# Run once: gh auth login
# Then: .\deploy.ps1

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Pehle login karo: gh auth login" -ForegroundColor Yellow
  exit 1
}

$repo = "ShekharDan/prep-duel"
$exists = gh repo view $repo 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create prep-duel --public --description "CIL + corporate prep tracker with duel sync" --source=. --remote=origin --push
} else {
  git push -u origin main
}

gh api repos/ShekharDan/prep-duel/pages -X POST -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
  gh api repos/ShekharDan/prep-duel/pages -X PUT -f "build_type=legacy" -f "source[branch]=main" -f "source[path]=/" 2>$null
}

Write-Host ""
Write-Host "Live URL: https://shekhardan.github.io/prep-duel/" -ForegroundColor Green
Write-Host "GF ko yeh link + same room code bhejo." -ForegroundColor Cyan
