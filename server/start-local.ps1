$ErrorActionPreference = 'Stop'
try {
    $leagueRoot = Split-Path -Parent $PSScriptRoot
    Set-Location -LiteralPath $leagueRoot
    $leagueNode = (Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1).Source
    if (-not $leagueNode) {
        $leagueCandidates = @("$env:ProgramFiles\nodejs\node.exe", "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
        $leagueNode = $leagueCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    }
    if (-not $leagueNode) { throw 'Instale o Node.js 24.14 ou superior para iniciar a liga.' }
    $leagueVersion = (& $leagueNode --version).TrimStart('v')
    if ([version]$leagueVersion -lt [version]'24.14.0') { throw 'Atualize o Node.js para 24.14 ou superior.' }
    if (-not (Test-Path -LiteralPath '.env')) {
        & $leagueNode 'server/setup-local.cjs'
        if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel criar a configuracao local.' }
    }
    $leaguePort = '3000'
    $leagueHost = 'localhost'
    foreach ($leagueLine in Get-Content -LiteralPath '.env') {
        if ($leagueLine -match '^PORT=(\d+)\s*$') { $leaguePort = $Matches[1] }
        if ($leagueLine -match '^HOST=(.+?)\s*$') { $leagueHost = $Matches[1].Trim('"', "'") }
    }
    if ($leagueHost -in @('0.0.0.0','127.0.0.1','::')) { $leagueHost = 'localhost' }
    $leagueUrl = "http://${leagueHost}:$leaguePort"
    $leagueProbeHost = $leagueHost
    if ($leagueProbeHost -eq 'localhost') { $leagueProbeHost = '127.0.0.1' }
    $leagueProbeUrl = "http://${leagueProbeHost}:$leaguePort/api/health"
    function Test-LeagueServer {
        try { $leagueHealth = Invoke-RestMethod -Uri $leagueProbeUrl -TimeoutSec 3; return ($leagueHealth.app -eq 'gbl-league' -and $leagueHealth.status -eq 'ok') } catch { return $false }
    }
    Write-Host "Verificando servidor local em $leagueUrl ..."
    if (-not (Test-LeagueServer)) {
        if (-not (Test-Path -LiteralPath 'node_modules\express\package.json')) { throw 'Instale as dependencias com pnpm install --frozen-lockfile e tente novamente.' }
        if (-not (Test-Path -LiteralPath 'data')) { New-Item -ItemType Directory -Path 'data' | Out-Null }
        Write-Host 'Iniciando servidor em segundo plano...'
        & $leagueNode 'server/launch-local.cjs'
        if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel iniciar o processo do servidor.' }
        $leagueReady = $false
        for ($leagueAttempt=0; $leagueAttempt -lt 20; $leagueAttempt++) {
            if (Test-LeagueServer) { $leagueReady = $true; break }
            Start-Sleep -Milliseconds 500
        }
        if (-not $leagueReady) { throw 'O servidor nao iniciou. Consulte data\server-error.log na pasta do projeto.' }
    }
    Write-Host 'Abrindo a liga no navegador...'
    Start-Process $leagueUrl
    Write-Host "Liga disponivel em $leagueUrl. O servidor continua ativo em segundo plano."
} catch { Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }
