Spotlight Image Extractor v2.00
=

This program extracts the beautiful lockscreen images from Windows 10/11 to a folder so you can use them as background images for Windows desktop.

Usage:
  Simply run the exe at any time to extract the current lockscreen background images

  Or, if you would prefer the images to be extracted automatically, use this (once):

    Spotlight-Image-Extractor.exe -INSTALL

  And, to stop it extracting images automatically, use:

    Spotlight-Image-Extractor.exe -UNINSTALL



All extracted images are saved to a folder named Spotlight-Images which is located in your **My Documents** folder

All image files are hashed with SHA256 when extacting to avoid duplicates

_________

  Double-click **".\build\compile.bat"** to compile the exe into the build directory
  
  > Note: Nothing needs to be installed to compile this program, the compiler used comes installed with Windows 10/11!

  Double-click **".\build\execute.bat"** to (compile if needed and) execute the program, and pause for 3 seconds to see the output
  
  ![image](https://user-images.githubusercontent.com/5307563/170537217-43b96ea8-680e-403c-9187-00b6717ca5d3.png)
  
  Double-click **".\build\install.bat"** to (compile if needed and) execute the program with the -INSTALL param, and pauses for 3 seconds
  
  ![image](https://user-images.githubusercontent.com/5307563/170590202-c9c18e6c-8076-4210-bb74-a9ee1b0cb8ec.png)
  
  Double-click **".\build\uninstall.bat"** to (compile if needed and) execute the program with the -UNINSTALL param, and pauses for 3 seconds
  
  ![image](https://user-images.githubusercontent.com/5307563/170590296-b3075621-7522-4c44-a2aa-fac2436551bd.png)
  

