@echo off
if not exist "Spotlight-Image-Extractor.exe" call compile.bat
Spotlight-Image-Extractor.exe
TIMEOUT /T 3
