
---

## Android Requirements

* **Root Access**
* **Kitsune Mask** (Magisk Delta)
* **ZygiskFrida Module** (To inject the gadget into the process)
* **Termux**
* **3 Brain Cells** (Minimum requirement)

---

## Phase 1: Zygisk-Frida Configuration

Navigate to the Zygisk-Frida directory on your device and configure the target app.

1. **Path:** `/data/local/tmp/re.zyg.fri/`
2. **File:** `config.json`
3. **Content:**

```json
{
    "targets": [
        {
            "app_name" : "game's pakage name uk what game :)",
            "enabled": true,
            "start_up_delay_ms": 30000,
            "injected_libraries": [
                {
                    "path": "/data/local/tmp/re.zyg.fri/libgadget.so"
                }
            ],
            "child_gating": {
                "enabled": false,
                "mode": "freeze",
                "injected_libraries" : [
                    {
                        "path": "/data/local/tmp/re.zyg.fri/libgadget-child.so"
                    }
                ]
            }
        }
    ]
}

```

---

## Phase 2: Termux & Ubuntu Environment (Android Only)

*Skip this if you are using the Windows method.*

Run these commands within Termux to set up the Ubuntu PRoot and Python environment.

### 1. Install Ubuntu PRoot

```bash
apt update && apt upgrade -y
apt install proot-distro -y
proot-distro install ubuntu
proot-distro login ubuntu

```

### 2. Install Python via Pyenv (Inside Ubuntu)

```bash
apt update && apt upgrade -y
apt install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl git libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev wget -y

curl https://pyenv.run | bash
nano ~/.bashrc ( ctrl + s to save, ctrl + x to close )

```

**Scroll to the end and paste this into `~/.bashrc`:**

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

```

Then run: `source ~/.bashrc`

### 3. Build Python 3.9

*Note: The install part will take some time, dw about it.*

```bash
mkdir -p ~/.pyenv/cache
wget -4 -O ~/.pyenv/cache/Python-3.9.25.tar.xz https://www.python.org/ftp/python/3.9.25/Python-3.9.25.tar.xz
pyenv install 3.9.25
pyenv global 3.9.25

```

---

## Phase 3: Frida & Il2Cpp Bridge Setup (Android Only)

1. **Install Tools:**

```bash
pip install frida-tools
apt install nodejs npm -y
mkdir frida && cd frida
npm i frida-il2cpp-bridge
rm package.json
nano package.json ( ctrl + s to save, ctrl + x to close )

```

2. **Paste this to `package.json`:**

```json
{
  "main": "index.ts",
  "scripts": {
    "prepare": "npm run build",
    "watch": "frida-compile index.ts -w -o hook.js"
  },
  "dependencies": {
    "frida-il2cpp-bridge": "^0.9.1"
  }
}

```

3. **Putting the script:**
`nano index.ts` (copy the index.ts from here).

---

## Android Execution

1. Open **The Game**.
2. Wait for the game to reach the **Hangar** (Home Screen).
3. Wait **10 seconds** for the `start_up_delay` to settle.
4. Run the following in your Ubuntu terminal:

```bash
frida -h 127.0.0.1 -n Gadget -l index.ts

```

---

## Phase 4: Windows + VS Code Method

If you prefer using your PC instead of typing on your phone, follow this.

### **Windows Requirements**

1. **Visual Studio Code (VS Code)** installed.
2. **Node.js** (LTS version) installed.
3. **Python** installed (Check "Add to PATH" during install).
4. **ADB** installed and added to system path. (if you wanna use pc to hack on andoird, not needed for windows game)

### **1. Setup Project in VS Code**

1. Create a new folder on your Desktop named `FridaHack`.
2. Open **VS Code** → File → **Open Folder** → Select `FridaHack`.
3. Open the **Terminal** in VS Code (`Ctrl + ~`).

### **2. Install Dependencies**

Paste these commands into the VS Code terminal one by one:

```powershell
pip install frida-tools
npm init -y
npm install frida-il2cpp-bridge
npm install watch

```

### **3. Configure `package.json**`

Click on `package.json` in the file explorer (left sidebar) and replace the content with this:

```json
{
  "main": "index.ts",
  "scripts": {
    "prepare": "npm run build",
    "watch": "frida-compile index.ts -w -o hook.js"
  },
  "dependencies": {
    "frida-il2cpp-bridge": "^0.9.1"
  }
}

```
Run this,

```powershell
npm run watch

```
 then click on + button to start a new terminal
 
### **4. Create the Script**

1. Right-click in the file explorer → **New File** → Name it `index.ts`.
2. Paste index.ts script code into `index.ts`.

### **5. Execution (Andorid hack via windows)**

1. Connect your phone to PC via USB (Ensure USB Debugging is ON).
2. Open **The Game** on your phone.
3. Wait for the **Hangar** and the 10-30s delay.
4. Connect to your phone with adb
5. check with adb devices

```powershell
frida -U -n Gadget -l index.ts

```


### **6. Windows game**:
open task manager, copy the name of your game ( right click -> properties -> name, eg- Taskmgr.exe )
In the VS Code terminal, run:
```powershell

frida -n gameproccessname -l index.js

```




**ENJOY!**
any doubts msg me on discord user: p20192728

---
