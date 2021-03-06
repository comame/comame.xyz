set encoding=utf-8

set nocompatible

syntax on
filetype plugin indent on

set smartindent

set expandtab
set tabstop=4
set shiftwidth=4

set hlsearch
set showmatch
set showcmd

set number
set title
set ruler
set number
set laststatus=2
set hidden
set autoread

set splitright

set list
set listchars=tab:»-,trail:·,extends:»,precedes:«,nbsp:%

noremap ; :
noremap : ;
noremap <S-w> <C-w>
noremap <C-h> :wincmd<Space>h<Enter>
noremap <C-l> :wincmd<Space>l<Enter>
noremap <S-h> :bprev<Enter>
noremap <S-l> :bnext<Enter>
noremap <Esc><Esc> :noh<Enter>

" Restore cursor position
if has("autocmd")
  augroup redhat
    autocmd BufReadPost *
    \ if line("'\"") > 0 && line ("'\"") <= line("$") |
    \   exe "normal! g'\"" |
    \ endif
  augroup END
endif

" Define command DiffOrig
if !exists(":DiffOrig")
  command DiffOrig vert new | set bt=nofile | r # | 0d_ | diffthis
        \ | wincmd p | diffthis
endif
