Here is the complete `README.md` file content in a single block.

```markdown
# Mech Legion (com.plarium.mechlegion) Modding Setup

A complete guide to setting up a Frida/TypeScript development environment on Android using **Termux**, **Ubuntu (PRoot)**, and **Zygisk-Frida**.

---

## 📱 Android Requirements
* **Root Access**
* **Kitsune Mask** (Magisk Delta)
* **ZygiskFrida Module** (For Gadget injection)
* **Termux**
* **3 Brain Cells** (Essential)

---

## ⚙️ Phase 1: Zygisk-Frida Configuration
Configure the Zygisk-Frida gadget to target the game. Use a file explorer with root access (like MT Manager or MiXplorer).

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

### 1. Install Ubuntu PRoot

Open Termux and run:

```bash
apt update && apt upgrade -y
apt install proot-distro -y
proot-distro install ubuntu
proot-distro login ubuntu

```

### 2. Setup Python Environment (Inside Ubuntu)

Install build dependencies first:

```bash
apt update && apt upgrade -y
apt install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl git libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev wget -y

# Install pyenv
curl [https://pyenv.run](https://pyenv.run) | bash

```

Add the following to your `~/.bashrc`:

```bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

```

Apply changes: `source ~/.bashrc`

### 3. Build Python 3.9 (Optimized for Speed)

To avoid slow downloads and build errors:

```bash
mkdir -p ~/.pyenv/cache
wget -4 -O ~/.pyenv/cache/Python-3.9.25.tar.xz [https://www.python.org/ftp/python/3.9.25/Python-3.9.25.tar.xz](https://www.python.org/ftp/python/3.9.25/Python-3.9.25.tar.xz)
pyenv install 3.9.25
pyenv global 3.9.25

```

---

## 🧪 Phase 3: Frida & Il2Cpp Bridge Setup

Setup the workspace for TypeScript-based hooking.

```bash
# Install tools
pip install frida-tools
apt install nodejs npm -y

# Create project
mkdir frida && cd frida
npm i frida-il2cpp-bridge

```

### Create `package.json`

`nano package.json` and paste:

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

### Create `index.ts`

`nano index.ts` and paste your Il2Cpp scripts.

---

## 🚀 Execution

1. Launch **Mech Legion**.
2. Wait until you are in the **Hangar**.
3. Wait approximately **10 seconds** for the Zygisk-Frida delay to settle.
4. Run the following command in your Ubuntu terminal:

```bash
frida -h 127.0.0.1 -n Gadget -l index.ts

```

**ENJOY!**

```

```
