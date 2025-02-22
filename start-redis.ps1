# Redis Setup and Start Script for Windows
$ErrorActionPreference = "Stop"

$redisVersion = "3.0.504"
$downloadUrl = "https://github.com/microsoftarchive/redis/releases/download/win-$redisVersion/Redis-x64-$redisVersion.msi"
$redisPath = "$env:ProgramFiles\Redis"

function Install-Redis {
    if (!(Test-Path $redisPath)) {
        Write-Host "Downloading Redis..."
        $msiPath = "$env:TEMP\Redis-x64.msi"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $msiPath
        
        Write-Host "Installing Redis..."
        Start-Process msiexec.exe -Wait -ArgumentList "/i $msiPath /quiet"
        Remove-Item $msiPath
    }
}

function Start-RedisServer {
    $service = Get-Service -Name Redis -ErrorAction SilentlyContinue
    
    if ($service -eq $null) {
        Write-Host "Installing Redis as a Windows Service..."
        Start-Process "$redisPath\redis-server.exe" -ArgumentList "--service-install" -Wait
        Start-Process "$redisPath\redis-server.exe" -ArgumentList "--service-start" -Wait
        Write-Host "Redis service installed and started!"
    }
    elseif ($service.Status -ne "Running") {
        Write-Host "Starting Redis service..."
        Start-Service Redis
        Write-Host "Redis service started!"
    }
    else {
        Write-Host "Redis service is already running!"
    }
}

try {
    Install-Redis
    Start-RedisServer
    Write-Host "`nRedis is now running on port 6379"
    Write-Host "To stop Redis, run: Stop-Service Redis"
}
catch {
    Write-Host "Error: $_"
    Write-Host "`nPlease try running this script as Administrator"
    exit 1
} 