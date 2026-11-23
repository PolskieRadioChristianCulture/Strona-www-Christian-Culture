Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Clicker {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;

    public static void Click(int x, int y) {
        SetCursorPos(x, y);
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
        System.Threading.Thread.Sleep(50);
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    }
}
"@

$hwnd = [Clicker]::FindWindow($null, "Wykryto awarię OBS Studio")
if ($hwnd -ne [IntPtr]::Zero) {
    Write-Output "Found window, focusing and clicking 'Uruchom w trybie normalnym'..."
    [Clicker]::SetForegroundWindow($hwnd)
    Start-Sleep -Milliseconds 200
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Start-Sleep -Milliseconds 300
    # Also click at coordinates (x=590, y=520) in 1920x1080
    [Clicker]::Click(590, 520)
    Write-Output "Clicked!"
} else {
    Write-Output "Window not found by exact title, trying generic SendKeys..."
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
}
