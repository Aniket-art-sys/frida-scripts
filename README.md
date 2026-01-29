This looks like a solid setup for modding Mech Arena (Mech Legion). Since you are using **Zygisk-Frida** with a **Gadget** configuration, you're bypassing the need for a manual `frida-server` on the device, which is much stealthier.

Here is a clean, formatted `README.md` based on your specific workflow.

---

# Mech Legion (Plarium) Modding Setup

A complete guide to setting up a Frida development environment on Android using **Termux**, **Ubuntu (PRoot)**, and **Zygisk-Frida**.

## 📱 Android Requirements

* **Root Access**
* **Kitsune Mask** (Magisk Delta)
* **ZygiskFrida Module** (To inject the gadget into the process)
* **Termux**
* **3 Brain Cells** (Minimum requirement)

---

## ⚙️ Phase 1: Zygisk-Frida Configuration

Navigate to the Zygisk-Frida directory on your device and configure the target app.

1. **Path:** `/data/local/tmp/re.zyg.fri/`
2. **File:** `config.json`
3. **Content:**

```json
{
    "targets": [
        {
            "app_name" : "com.plarium.mechlegion",
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

## 🛠️ Phase 2: Termux & Ubuntu Environment

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

```

**Add to `~/.bashrc`:**

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

```

`source ~/.bashrc`

### 3. Build Python 3.9

```bash
mkdir -p ~/.pyenv/cache
wget -4 -O ~/.pyenv/cache/Python-3.9.25.tar.xz https://www.python.org/ftp/python/3.9.25/Python-3.9.25.tar.xz
pyenv install 3.9.25
pyenv global 3.9.25

```

---

## 🧪 Phase 3: Frida & Il2Cpp Bridge Setup

1. **Install Tools:**

```bash
pip install frida-tools
apt install nodejs npm -y
mkdir frida && cd frida
npm i frida-il2cpp-bridge

```

2. **Create `package.json`:**

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

3. **Create your script:**
`nano index.ts` (Paste your hook code here).

---

## 🚀 Execution

1. Open **Mech Legion**.
2. Wait for the game to reach the **Hangar** (Home Screen).
3. Wait **10 seconds** for the `start_up_delay` to settle.
4. Run the following in your Ubuntu terminal:

```bash
frida -h 127.0.0.1 -n Gadget -l index.ts

```

**ENJOY!**

---

Would you like me to help you write the **`index.ts`** logic for specific Mech Legion functions, like unlocking the camera or modifying weapon stats?
