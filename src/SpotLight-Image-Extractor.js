/*@cc_on // This just stops VSCODE from complaining about JScript.NET style Import xx.yy when it expects ES6 Import "xx.yy" style :)
  import System;
  import System.IO;
  import System.Drawing;
  import System.Reflection;
  import System.Security.Cryptography;

  // Resource entries
  [assembly: AssemblyTitleAttribute("Spotlight-Image-Extractor")]
  [assembly: AssemblyProductAttribute("Spotlight-Image-Extractor by Neil HippieKiller")]
  [assembly: AssemblyDescriptionAttribute("Extracts Spotlight images from Windows login screen backgrounds")]
  [assembly: AssemblyConfigurationAttribute("")]
  [assembly: AssemblyCompanyAttribute("BobSoft")]
  [assembly: AssemblyCopyrightAttribute("Copyright BobSoft 2022")]
  [assembly: AssemblyTrademarkAttribute("")]
  [assembly: AssemblyCultureAttribute("")]
  [assembly: AssemblyFileVersionAttribute("2.0.*")]
  [assembly: AssemblyVersionAttribute("2.0.*")]
@*/


//-----------------------------------------------------------------------------

class Program {

  static const
    outputPath: String     = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + "\\Spotlight-Images",
    startPath:  String     = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + "\\Microsoft\\Windows\\Start Menu\\Programs\\Startup",
    assetsPath: String     = Environment.GetEnvironmentVariable("LOCALAPPDATA") + "\\Packages\\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets",
    exeParams:  String[]   = Environment.GetCommandLineArgs(),
    exeFile:    String     = Path.GetFileName(exeParams[0]),
    linkFile:   String     = Path.Combine(startPath, Path.GetFileNameWithoutExtension(exeFile) + ".lnk"),
    fileInfos:  FileInfo[] = new DirectoryInfo(assetsPath).GetFiles();


  //-----------------------------------------------------------------------------

  static function Main (): int {

    var
      extracted: int = 0,
      skipped:   int = 0;

    Console.WriteLine("\nSpotlight Image Extractor v2.00 - by Neil HippieKiller\n");

    // If called with param -INSTALL then create a shortcut in the startup folder
    if (exeParams.Length === 2 && exeParams[1].toUpperCase() === "-INSTALL") return CreateShortcut();
    // If called with param -UNINSTALL then delete shortcut from the startup folder
    if (exeParams.Length === 2 && exeParams[1].toUpperCase() === "-UNINSTALL") return DeleteShortcut();
    // Display usage if any unknown params are passed
    if (exeParams.Length >= 2) return ShowUsage();

    Console.WriteLine(" Scanning for horizontal background image files...");
    if (!Directory.Exists(outputPath)) Directory.CreateDirectory(outputPath);

    // Enumerate all files in assets directory - Image.FromStream will throw an exception if the given file is not an image, so we need try/catch to handle it
    for (var index: int = 0; index < fileInfos.Length; index++) try {
      var
        image: Image  = Image.FromFile(fileInfos[index].FullName),
        info:  String = image.Width + "x" + image.Height + " " + new ImageFormatConverter().ConvertToString(image.RawFormat);

      // If width at least 1920, and height at least 1080, and it's horizontal, then it's definitely a background image
      if (image.Width >= 1920 && image.Height >= 1080 && image.Width > image.Height) {

        // Check if a Jpeg file with hash as name already exists in destination folder
        var destFile: String = Path.Combine(outputPath, GetFileHash(fileInfos[index]) + ".jpg");
        if (!File.Exists(destFile)) {
          // Extract image file to destination folder using hash as name
          File.Copy(fileInfos[index].FullName, destFile);
          extracted++;
          Console.WriteLine(" + Extracted " + info + " image");
        } else {
          // Image was already existing
          skipped++;
          Console.WriteLine(" ! Skipped " + info + " image that had been extracted previously");
        }

      } else {
        // File is an image, but it is not a horizontal background image
        skipped++;
        Console.WriteLine(" ! Skipped " + info + " image, which is not a horizontal backgroumd image");
      }

      image.Dispose();
    }
    catch (e: Exception) {
      // Do nothing
      skipped++;
      Console.WriteLine(" ! Skipped a file that was not an image");
    }

    Console.WriteLine("\n Scanned " + fileInfos.Length + " files, skipped " + skipped + " files, and extracted " + extracted + " image files");
    return 0;
  }


  //-----------------------------------------------------------------------------
  // Compute string from hash of file data

  static function GetFileHash (fileInfo: FileInfo): String {
    const
      hasher:   SHA256     = SHA256.Create(),
      fileData: FileStream = fileInfo.OpenRead(),
      hashData: Byte[]     = hasher.ComputeHash(fileData);

    var result: String = "";
    for (var i: int = 0; i < hashData.Length; i++) result = result + hashData[i].ToString('x2');

    fileData.Dispose();
    hasher.Dispose();
    return result;
  }


  //-----------------------------------------------------------------------------
  // Used with -INSTALL param, creates a shortcut to this exe in the startup folder

  static function CreateShortcut (): int {
    const link: Object = new ActiveXObject("WScript.Shell").CreateShortcut(linkFile);

    link.Description = "Automatically extracts the beautiful Spotlight images from Windows login screens to \"" + outputPath + "\" at startup";
    link.TargetPath  = AppDomain.CurrentDomain.BaseDirectory + "\\" + exeFile; // Shortcut points to this executable
    link.WindowStyle = 7; // WS_Minimised
    link.Save();

    Console.WriteLine("  Shortcut created at \"" + startPath + "\"\n\n  Spotlight images will be automatically extracted to \"" + outputPath + "\" at startup");
    return 1;
  }


  //-----------------------------------------------------------------------------
  // Used with -UNINSTALL param, deletes the shortcut in the startup folder

  static function DeleteShortcut (): int {
    File.Delete(linkFile);

    Console.WriteLine("  Shortcut deleted!\n\n  Spotlight images will no longer be automatically extracted at startup");
    return 1;
  }


  //-----------------------------------------------------------------------------
  // Used with -USAGE param (or unknown params)

  static function ShowUsage (): int {
    Console.WriteLine("Usage:");
    Console.WriteLine("  \"" + exeFile + " -install\"   : To automatically extract any images found at startup");
    Console.WriteLine("  \"" + exeFile + " -uninstall\" : To stop extracting images automatically at startup\n");
    Console.WriteLine("  Simply run " + exeFile + " without any parameters to extract image files manually\n");
    Console.WriteLine("  All images will be extracted to \"" + outputPath + "\"");
    return 1;
  }

}




//-----------------------------------------------------------------------------
// Execute static Main function, using return value as exitcode for app

Environment.Exit(Program.Main());


//-----------------------------------------------------------------------------
