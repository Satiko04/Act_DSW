# Script de inicialização da Biblioteca
# Execute no PowerShell: .\iniciar.ps1

Write-Host "Parando processos antigos..."
Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
Stop-Process -Name bun -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "Iniciando MySQL..."
Start-Process "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" `
    -ArgumentList "--datadir=""C:\ProgramData\MySQL\MySQL Server 8.4\Data"" --console" `
    -NoNewWindow
Start-Sleep 5

Write-Host "Iniciando backend..."
Start-Process "bun" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot\backend" -NoNewWindow

Start-Sleep 3
Write-Host ""
Write-Host "Sistema pronto! Acesse: http://localhost:3006"
