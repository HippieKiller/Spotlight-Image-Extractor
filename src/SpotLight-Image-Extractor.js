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
  [assembly: AssemblyConfigurationAttribute("Release")]
  [assembly: AssemblyCompanyAttribute("BobSoft")]
  [assembly: AssemblyCopyrightAttribute("Copyright BobSoft 2019-2022")]
  [assembly: AssemblyTrademarkAttribute("")]
  [assembly: AssemblyCultureAttribute("")]
  [assembly: AssemblyFileVersionAttribute("2.0.*")]
  [assembly: AssemblyVersionAttribute("2.0.*")]
@*/


//----------------------------------------------------------------------------- <%

class Program {

  // Path and filename of this exe
  static const exePath: String = AppDomain.CurrentDomain.BaseDirectory;
  static const exeFile: String = AppDomain.CurrentDomain.FriendlyName;

  // Source path of Spotlight image assets, and destination path for extracted images
  static const srcPath: String = Path.Combine([Environment.GetEnvironmentVariable("LOCALAPPDATA"), "Packages", "Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy", "LocalState", "Assets"]);
  static const dstPath: String = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "Spotlight-Images");

  // Path and filename of where .lnk file in Startup folder will be created
  static const lnkPath: String = Path.Combine([Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Microsoft", "Windows", "Start Menu", "Programs", "Startup"]);
  static const lnkFile: String = Path.Combine(lnkPath, Path.GetFileNameWithoutExtension(exeFile) + ".lnk");
  

  //-----------------------------------------------------------------------------
  // Static Main function is the entrypoint of the program, and is passed the commandline params

  static function Main (params: String[]) {

    Console.WriteLine("\nSpotlight Image Extractor v2.00 - by Neil HippieKiller\n");

    // Ensure that the Spotlight images path exists on this system
    if (!Directory.Exists(srcPath)) {
      Console.WriteLine("Error: The Spotlight assets directory was not found!\n");
      Environment.Exit(-1); // Return Exitcode -1 for no assets directory
    }

    // Create the output directory for images, if not existing
    if (!Directory.Exists(dstPath)) {
      Directory.CreateDirectory(dstPath);
      Console.WriteLine("Created output directory for extracted images at \"{0}\"\n", dstPath);
    }

    // If any params were passed, then check the first one
    if (params.Length > 1) switch (params[1].toUpperCase()) {

      // If called with param -INSTALL then create a shortcut in the startup folder
      case "-INSTALL":
        return CreateShortcut();

      // If called with param -UNINSTALL then delete shortcut from the startup folder
      case "-UNINSTALL":
        return DeleteShortcut();

      // Display usage if anything else was passed
      default:
        return ShowUsage();
    }

    // If no params passed then just scan for Spotlight images
    ScanForImages();
  }


  //-----------------------------------------------------------------------------
  // Scan for horizontal Spotlight images in the assets directory

  static function ScanForImages () {

    // Create array of all files and their infos in the assets directory
    const
      fileInfos: FileInfo[] = new DirectoryInfo(srcPath).GetFiles(),
      fileCount: Int32      = fileInfos.Length;

    var
      extracted: Int32 = 0,
      skipped:   Int32 = 0,
      index:     Int32 = 0;

    Console.WriteLine(" Scanning for horizontal background image files...");

    // Enumerate all fileinfos
    while (index < fileCount) {

      // Get information about image as a string, if the file is an image
      const
        fileInfo:  FileInfo = fileInfos[index++],
        imageInfo: String   = GetImageInfo(fileInfo);

      // Check for matching image files
      switch (imageInfo) {

        // All horizontal Spotlight images so far (700+) are 1920x1080 Jpegs, if this changes then more cases can be added here
        case "1920x1080 Jpeg":

          // File.Copy will throw an exception if the file already exists in destination directory, so we need try/catch
          try {
            // Copy the image file to the "My Documents\Spotlight-Images" folder using hash as filename
            File.Copy(fileInfo.FullName, Path.Combine(dstPath, GetFileHash(fileInfo) + ".jpg"));

            // Display successful result
            Console.WriteLine(" + Extracted {0} image", imageInfo);
            extracted++;
            break;
          }

          // If we get IOException then the destination file exists cos the image had been extracted previously
          catch (e: IOException) {
            Console.WriteLine(" ! Skipped {0} image that had been extracted previously", imageInfo);
            skipped++;
            break;
          }

        case "Not image":
          // File is not an image
          Console.WriteLine(" ! Skipped a file that was not an image");
          skipped++;
          break;

        default:
          // Otherwise, the file is an image, but it is not a horizontal background image
          Console.WriteLine(" ! Skipped {0} image, which is not a horizontal background image", imageInfo);
          skipped++;
      }
    }

    // Display totals and exit program with exitcode 0
    Console.WriteLine("\n Scanned {0} files, skipped {1} files, and extracted {2} image files", fileCount, skipped, extracted);
  }


  //-----------------------------------------------------------------------------
  // Get image information as a simple string like "20x20 Png"

  static function GetImageInfo (fileInfo: FileInfo): String {

    var
      image: Image;

    try {
      // Image.FromFile will throw an exception if the given file is not an image, so we need try/catch to handle it
      image = Image.FromFile(fileInfo.FullName);

      // Build string from width, height, and image format, and return it
      return image.Width + "x" + image.Height + " " + new ImageFormatConverter().ConvertToString(image.RawFormat);
    }

    catch (e: Exception) {
      // Not an image
      return "Not image";
    }

    finally {
      // Free the image
      if (image) image.Dispose();
    }
  }


  //-----------------------------------------------------------------------------
  // Compute string from hash of file contents

  static function GetFileHash (fileInfo: FileInfo): String {
    const
      hasher:   SHA256     = SHA256.Create(),
      fileData: FileStream = fileInfo.OpenRead(),
      hashData: Byte[]     = hasher.ComputeHash(fileData);

    var
      result: String = "",
      index:  Int32  = 0, 
      count:  Int32  = hashData.Length;
      
    while (index < count) result = result + hashData[index++].ToString('x2');
    
    fileData.Dispose();
    hasher.Dispose();
    return result;
  }


  //-----------------------------------------------------------------------------
  // Used with -INSTALL param, creates a shortcut to this exe in the startup folder

  static function CreateShortcut () {
    const link: Object = new ActiveXObject("WScript.Shell").CreateShortcut(lnkFile);

    link.Description = "Automatically extracts the beautiful Spotlight images from Windows login screens to \"" + dstPath + "\" at startup";
    link.TargetPath  = Path.Combine(exePath, exeFile); // Shortcut points to this executable
    link.WindowStyle = 7; // WS_Minimised
    link.Save();

    Console.WriteLine("  Shortcut created at \"{0}\"\n\n  Spotlight images will be automatically extracted to \"{1}\" at startup", lnkPath, dstPath);
  }


  //-----------------------------------------------------------------------------
  // Used with -UNINSTALL param, deletes the shortcut in the startup folder

  static function DeleteShortcut () {
    File.Delete(lnkFile);

    Console.WriteLine("  Shortcut deleted!\n\n  Spotlight images will no longer be automatically extracted at startup");
  }


  //-----------------------------------------------------------------------------
  // Used with -USAGE param (or unknown params)

  static function ShowUsage () {
    Console.WriteLine("Usage:");
    Console.WriteLine("  \"{0} -install\"   : To automatically extract any images found at startup", exeFile);
    Console.WriteLine("  \"{0} -uninstall\" : To stop extracting images automatically at startup\n", exeFile);
    Console.WriteLine("  Simply run {0} without any parameters to extract image files manually\n", exeFile);
    Console.WriteLine("  All images will be extracted to \"{0}\"", dstPath);
  }

}




//-----------------------------------------------------------------------------
// Execute static Main function, passing command line

Program.Main(Environment.GetCommandLineArgs());


//-----------------------------------------------------------------------------
