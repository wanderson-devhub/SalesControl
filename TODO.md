# TODO: Implementar funcionalidade de 'Esqueceu a Senha'

## Passos a serem completados:

- [x] Atualizar schema Prisma: adicionar campos resetToken e resetTokenExpiry ao modelo User
- [x] Criar API /api/auth/forgot-password/route.ts para gerar e enviar token de reset
- [x] Criar API /api/auth/reset-password/route.ts para validar token e atualizar senha
- [x] Criar página app/(auth)/forgot-password/page.tsx com formulário para inserir email
- [x] Criar página app/(auth)/reset-password/page.tsx com formulário para nova senha
- [x] Atualizar app/(auth)/login/page.tsx para adicionar link 'Esqueceu a senha?'
- [x] Executar migração do Prisma para aplicar mudanças no schema
- [ ] Testar o fluxo completo de reset de senha
