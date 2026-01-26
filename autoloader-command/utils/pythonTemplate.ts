import { VersionConfig } from '../types';

export const generatePythonScript = (config: VersionConfig): string => {
  return `import tkinter as tk
from tkinter import ttk
import requests
import subprocess
import os
import sys
import ctypes
import threading
import time

# --- CONFIGURATION ---
UPDATE_API_URL = "${config.serverUrl}"
CURRENT_VERSION_FILE = ".${config.hiddenFileName}"
TARGET_EXECUTABLE = "${config.executableName}"
TEMP_EXECUTABLE = "update_tmp.exe"
APP_NAME = "System Launcher"

class ModernUpdater:
    def __init__(self):
        self.root = tk.Tk()
        self.setup_window()
        self.setup_ui()
        
    def setup_window(self):
        self.root.title(APP_NAME)
        width = 420
        height = 180
        
        # Calculate center position
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        self.root.configure(bg="#0f172a") # Slate 900
        self.root.overrideredirect(True) # Frameless window
        self.root.attributes("-topmost", True)
        
        # Add drag capability
        self.root.bind("<ButtonPress-1>", self.start_move)
        self.root.bind("<ButtonRelease-1>", self.stop_move)
        self.root.bind("<B1-Motion>", self.do_move)
        
        self.x = None
        self.y = None

    def start_move(self, event):
        self.x = event.x
        self.y = event.y

    def stop_move(self, event):
        self.x = None
        self.y = None

    def do_move(self, event):
        if self.x is not None and self.y is not None:
            deltax = event.x - self.x
            deltay = event.y - self.y
            x = self.root.winfo_x() + deltax
            y = self.root.winfo_y() + deltay
            self.root.geometry(f"+{x}+{y}")

    def setup_ui(self):
        # Configure Styles
        style = ttk.Style()
        style.theme_use('clam')
        
        # Modern Progress Bar Style (Emerald 500)
        style.configure(
            "Modern.Horizontal.TProgressbar", 
            troughcolor="#1e293b", # Slate 800
            background="#10b981", # Emerald 500
            lightcolor="#10b981", 
            darkcolor="#10b981", 
            bordercolor="#0f172a",
            thickness=6
        )

        # Main Container
        self.main_frame = tk.Frame(self.root, bg="#0f172a")
        self.main_frame.pack(expand=True, fill="both", padx=25, pady=20)

        # Header Row
        header_frame = tk.Frame(self.main_frame, bg="#0f172a")
        header_frame.pack(fill="x", pady=(0, 20))

        # Title
        tk.Label(
            header_frame, 
            text="INITIALIZING SYSTEM", 
            font=("Segoe UI", 12, "bold"), 
            bg="#0f172a", 
            fg="#f1f5f9", # Slate 100
            tracking=2
        ).pack(side="left")

        # Close Button (X)
        self.close_btn = tk.Label(
            header_frame,
            text="×",
            font=("Arial", 18),
            bg="#0f172a",
            fg="#64748b", # Slate 500
            cursor="hand2"
        )
        self.close_btn.pack(side="right")
        self.close_btn.bind("<Button-1>", lambda e: os._exit(0))
        self.close_btn.bind("<Enter>", lambda e: self.close_btn.config(fg="#ef4444")) # Red on hover
        self.close_btn.bind("<Leave>", lambda e: self.close_btn.config(fg="#64748b"))

        # Status Text
        self.status_frame = tk.Frame(self.main_frame, bg="#0f172a")
        self.status_frame.pack(fill="x", pady=(0, 5))
        
        self.status_label = tk.Label(
            self.status_frame, 
            text="Checking integrity...", 
            font=("Segoe UI", 9), 
            bg="#0f172a", 
            fg="#94a3b8" # Slate 400
        )
        self.status_label.pack(side="left")

        # Percentage
        self.percent_label = tk.Label(
            self.status_frame, 
            text="0%", 
            font=("Segoe UI", 9, "bold"), 
            bg="#0f172a", 
            fg="#10b981" # Emerald 500
        )
        self.percent_label.pack(side="right")

        # Progress Bar
        self.progress = ttk.Progressbar(
            self.main_frame, 
            orient="horizontal", 
            length=100, 
            mode="determinate", 
            style="Modern.Horizontal.TProgressbar"
        )
        self.progress.pack(fill="x", pady=(5, 0))

    def start(self):
        # Start the logic thread
        threading.Thread(target=self.run_update_logic, daemon=True).start()
        self.root.mainloop()

    def update_ui(self, text, percent=None):
        def _update():
            self.status_label.config(text=text)
            if percent is not None:
                self.progress['value'] = percent
                self.percent_label.config(text=f"{int(percent)}%")
        self.root.after(0, _update)

    def run_update_logic(self):
        try:
            time.sleep(0.8) 
            self.update_ui("Connecting to server...", 10)
            
            local_ver = self.get_local_version()
            remote_ver, url = self.check_updates()
            
            if remote_ver and remote_ver != local_ver:
                self.update_ui(f"New version found: {remote_ver}", 25)
                time.sleep(0.5)
                success = self.download_update(url)
                if success:
                    self.update_ui("Installing update...", 95)
                    self.install_update(remote_ver)
                    time.sleep(0.5)
            else:
                self.update_ui("System up to date", 100)
                time.sleep(0.8)
                
            self.launch_game()
            
        except Exception as e:
            self.update_ui(f"Error: {str(e)[:40]}")
            time.sleep(3)
            self.launch_game()

    def get_local_version(self):
        if os.path.exists(CURRENT_VERSION_FILE):
            try:
                with open(CURRENT_VERSION_FILE, "r") as f:
                    return f.read().strip()
            except:
                pass
        return "0.0.0"

    def check_updates(self):
        try:
            if not UPDATE_API_URL or "http" not in UPDATE_API_URL:
                return None, None
            
            # Simulated check logic:
            # If the API returns JSON, parse it.
            # If not (e.g. direct file link), user might just want to download it.
            # But normally we expect an API response.
            
            r = requests.get(UPDATE_API_URL, timeout=5)
            if r.status_code == 200:
                try:
                    data = r.json()
                    return data.get("version"), data.get("url")
                except:
                    # If response isn't JSON, maybe it's just the file? 
                    # For this template we assume strict API mode.
                    return None, None
        except:
            pass
        return None, None

    def download_update(self, url):
        try:
            self.update_ui("Downloading resources...", 30)
            r = requests.get(url, stream=True, timeout=15)
            total_size = int(r.headers.get('content-length', 0))
            downloaded = 0
            
            with open(TEMP_EXECUTABLE, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            # Map download percentage (0-100) to UI range (30-90)
                            percent = 30 + (downloaded / total_size) * 60
                            self.update_ui("Downloading resources...", percent)
            return True
        except Exception as e:
            print(f"Download Error: {e}")
            return False

    def install_update(self, version):
        if os.path.exists(TARGET_EXECUTABLE):
            try:
                os.remove(TARGET_EXECUTABLE)
            except:
                try:
                    os.rename(TARGET_EXECUTABLE, TARGET_EXECUTABLE + ".old")
                except:
                    pass
        
        if os.path.exists(TEMP_EXECUTABLE):
            os.rename(TEMP_EXECUTABLE, TARGET_EXECUTABLE)
            
        with open(CURRENT_VERSION_FILE, "w") as f:
            f.write(version)
            
        if os.name == 'nt':
            try:
                ctypes.windll.kernel32.SetFileAttributesW(CURRENT_VERSION_FILE, 0x02)
            except:
                pass

    def launch_game(self):
        self.update_ui("Launching application...", 100)
        time.sleep(0.5)
        
        if os.path.exists(TARGET_EXECUTABLE):
            # Launch and Detach
            if os.name == 'nt':
                subprocess.Popen([TARGET_EXECUTABLE], creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP)
            else:
                subprocess.Popen([TARGET_EXECUTABLE])
            self.root.quit()
        else:
            self.update_ui("Executable not found!")
            time.sleep(2)
            self.root.quit()

if __name__ == "__main__":
    app = ModernUpdater()
    app.start()
`;
};