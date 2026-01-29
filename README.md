Android Requirements:
root
kitsune mask
zgiskfrida
termux
3 brain cells.

after u have met the above go to /data/local/tmp/re.zyg.fri/
set config.json to
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

Open termux enter
this is just the terminal of my termux in my phone (same as you termux)
apt update && apt upgrade put y on eveything
apt install proot-distro
proot-distro login ubuntu
apt update && apt upgrade
apt install build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev curl git \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
curl https://pyenv.run | bash
nano ~/.bashrc
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
source ~/.bashrc
pyenv -v
pyenv install 3.9
pyenv global 3.9
mkdir -p ~/.pyenv/cache
wget -4 -O ~/.pyenv/cache/Python-3.9.25.tar.xz https://www.python.org/ftp/python/3.9.25/Python-3.9.25.tar.xz
pyenv install 3.9.25
pyenv global 3.9
mkdir frida
cd frida/
pip install frida-tools
apt install nodejs npm
npm i frida-il2cpp-bridge
rm package.json
nano package.json (ctrl + s, save) ( ctrl + x, exit)
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
nano index.ts
pate index.ts
after u have entered the game and hangar is open, wait like 10 second then run this command in temrux
frida -h 127.0.0.1 -n Gadget -l index.ts
ENJOY!
