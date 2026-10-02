@echo off
if not exist "%~dp0AuroraCodexProvider.exe" powershell.exe -NoProfile -File "%~dp0scripts\build-launcher.ps1"
if exist "%~dp0AuroraCodexProvider.exe" start "" "%~dp0AuroraCodexProvider.exe"
