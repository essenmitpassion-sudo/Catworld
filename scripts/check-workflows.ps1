$ErrorActionPreference = 'Stop'
# Official release: https://github.com/rhysd/actionlint/releases/tag/v1.7.12
# SHA-256 verified against that release's published checksum file.
$udiProjectRoot = Split-Path -Parent $PSScriptRoot
$udiLintDir = Join-Path $udiProjectRoot 'artifacts/tools/actionlint-1.7.12'
$udiLintZip = Join-Path $udiLintDir 'actionlint_1.7.12_windows_amd64.zip'
$udiLintHash = '6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9'
New-Item -ItemType Directory -Path $udiLintDir -Force | Out-Null
if (-not (Test-Path -LiteralPath $udiLintZip)) {
    Invoke-WebRequest -Uri 'https://github.com/rhysd/actionlint/releases/download/v1.7.12/actionlint_1.7.12_windows_amd64.zip' -OutFile $udiLintZip
}
if ((Get-FileHash -LiteralPath $udiLintZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $udiLintHash) {
    throw 'Workflow checker checksum mismatch. The tool was not executed.'
}
Expand-Archive -LiteralPath $udiLintZip -DestinationPath $udiLintDir -Force
& (Join-Path $udiLintDir 'actionlint.exe') -shellcheck='' -pyflakes='' (Join-Path $udiProjectRoot '.github/workflows/native.yml') (Join-Path $udiProjectRoot '.github/workflows/udi.yml')
if ($LASTEXITCODE -ne 0) { throw 'GitHub workflow validation failed.' }
Write-Output 'Both UDI workflows passed actionlint 1.7.12.'
