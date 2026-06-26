# Load JWT/DB env and start flashcard-service locally
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$env:DB_URL = "jdbc:postgresql://localhost:5432/alp_flashcards"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "1234"
$env:JWT_SECRET = "alp-dev-secret-key-minimum-256-bits-long-for-hs256-algorithm-ok"

Write-Host "Starting flashcard-service on http://localhost:8085/api/flashcards" -ForegroundColor Cyan
& "C:\tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
