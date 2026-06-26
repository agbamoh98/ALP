# Load .env and start ai-service locally
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error ".env not found. Copy .env.example to .env and set OPENAI_API_KEY."
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "Env:$name" -Value $value
    }
}

if (-not $env:OPENAI_API_KEY -or $env:OPENAI_API_KEY -eq "PASTE_YOUR_KEY_HERE") {
    Write-Error "OPENAI_API_KEY is not set in .env"
}

Write-Host "Starting ai-service on http://localhost:8083/api/ai (model: $env:OPENAI_MODEL)" -ForegroundColor Cyan
& "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
