$providerRoot = Split-Path -Parent $PSScriptRoot
$providerCompiler = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
if (-not (Test-Path -LiteralPath $providerCompiler)) { throw 'No se encuentra el compilador de .NET Framework de Windows.' }
& $providerCompiler /nologo /target:winexe (('/out:'+ (Join-Path $providerRoot 'AuroraCodexProvider.exe'))) /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Web.Extensions.dll /reference:System.Management.dll (Join-Path $PSScriptRoot 'Launcher.cs')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo compilar el lanzador.' }
