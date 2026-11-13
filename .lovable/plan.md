# Login e liberação de acesso para a equipe

## Situação atual
O banco já está protegido: só e-mails liberados conseguem ver e cadastrar os 12 objetos salvos. Porém o app ainda não tem tela de login, então hoje ninguém consegue ver os objetos. Já existem 2 e-mails liberados e nenhum usuário cadastrado.

## O que vou construir
1. **Tela de entrada (/auth)** com as cores KET XUP: entrar e criar conta com e-mail e senha, e botão "Entrar com Google". Só e-mails liberados conseguem criar conta; os outros veem a mensagem "Seu e-mail ainda não foi liberado".
2. **App protegido**: Buscar e Cadastrar ficam disponíveis só para quem entrou, mostrando os objetos já salvos em tempo real como antes. Botão "Sair" no topo.
3. **Painel "Equipe" (só para administrador)**: lista os e-mails liberados, campo para adicionar um e-mail e botão para remover. O primeiro usuário a criar conta vira administrador automaticamente.
4. **Esqueci a senha**: link na tela de entrada e página para definir a nova senha.

## Detalhes técnicos
- Ativar login por e-mail e Google; manter confirmação de e-mail ligada.
- Rotas: `/auth`, `/reset-password` (públicas); `/_authenticated/app` (Buscar/Cadastrar) e `/_authenticated/equipe` (admin). `/` vira página inicial que redireciona para `/app` ou `/auth`.
- Conferir que os gatilhos existentes (`check_allowed_signup`, `assign_owner_admin`) estão ligados em `auth.users`; criar se faltarem.
- `useItems` só carrega após login; listener único de sessão no root.
- Painel usa `allowed_emails` direto (RLS de admin já existe); verificação de admin via `user_roles`.
