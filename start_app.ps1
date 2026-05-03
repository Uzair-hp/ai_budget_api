Set-Location $PSScriptRoot
Write-Host 'Starting AI Financial Hub...'
$backendCmd = 'cd ' + $PSScriptRoot + '\backend; ..\venv\Scripts\python.exe main.py'
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $backendCmd
Start-Sleep -s 3
$frontendCmd = 'cd ' + $PSScriptRoot + '\frontend; npm run dev'
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $frontendCmd
Start-Sleep -s 5
Start-Process 'http://localhost:5173'
Write-Host 'Both services are launching in separate windows!'
pause
