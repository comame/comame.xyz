# Return if not interactive
if [[ $- != *i* ]]; then return; fi


function echo_red_string(){
    echo -e '\033[0;31m'$1'\033[0;39m'
}
function break_line(){
    echo ''
}
function watchFile() {
    last=`openssl sha256 -r $1 | awk '{print $1}'`
    while true; do
        sleep 3
        current=`openssl sha256 -r $1 | awk '{print $1}'`
        if [ "$last" != "$current" ]; then
            eval $2
            last=$current
        fi  
    done
}


# Aliases

alias l='ls -G'
alias la='ls -aG'
alias ll='ls -lG'
alias lla='ls -laG'

alias dc='docker-compose'

export EDITOR=vim


# Disable default Ctrl-S behavior

stty stop undef


# Echo

function help_keybind() {
    break_line
    echo 'C-p Previous commands'
    echo 'C-r Search'
    echo 'C-u Clear line'
    echo 'C-a C-e Line start / end'
    echo 'C-h Backspace'
    echo 'C-m Enter'
    break_line
}


cd
pwd
ls
function c() {
    code $1 && exit
}
echo
