# Entrada só com e-mail liberado

## Situação atual
O banco já está protegido: só e-mails liberados veem e cadastram os 12 objetos salvos. Mas o app não tem tela de entrada, então hoje ninguém vê os objetos. Já existem 2 e-mails liberados.

## Como vai funcionar
1. **Tela de entrada**, nas cores KET XUP, com um único campo: e-mail.
   - E-mail **não liberado** → mensagem "Seu e-mail não tem acesso. Fale com o administrador." e não entra.
   - E-mail **liberado** → recebe no e-mail um link para entrar (sem senha). Clicou, entrou. O celular fica conectado, não precisa repetir em toda gincana.
   - O link no e-mail impede que alguém entre só sabendo o e-mail de um colega.
2. **App protegido**: Buscar e Cadastrar só para quem entrou, com os objetos já salvos aparecendo em tempo real. Botão "Sair" no topo.
3. **Painel "Equipe" (só administrador)**: lista os e-mails liberados, campo para adicionar e botão para remover. O primeiro a entrar vira administrador.

## Detalhes técnicos
- Ativar login por e-mail (link mágico, `signInWithOtp` com `shouldCreateUser: true`); sem senha, sem Google.
- Checagem prévia: função `is_email_allowed(email)` (security definer, só retorna true/false) chamada antes de enviar o link; o gatilho `check_allowed_signup` em `auth.users` continua bloqueando no servidor. Conferir/criar gatilhos `check_allowed_signup` e `assign_owner_admin`.
- Rotas: `/auth` (pública), `/_authenticated/app` e `/_authenticated/equipe`; `/` redireciona.
- `useItems` só carrega após login; um único listener de sessão no root.
- Painel usa `allowed_emails` (RLS de admin já existe); admin verificado via `user_roles`.
