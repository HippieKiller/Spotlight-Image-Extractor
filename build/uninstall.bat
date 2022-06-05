@echo off
if not exist "Spotlight-Image-Extractor.exe" call compile.bat
set "cmdline=Spotlight-Image-Extractor.exe -UNINSTALL"
title %cmdline%
%cmdline%
TIMEOUT /T 3
title Command Prompt
