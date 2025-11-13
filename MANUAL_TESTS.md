# 📋 Manual de Testes - Sistema de Controle de Estoque

**Data:** [Insira a data dos testes]  
**Testador:** [Seu nome]  
**Versão do Sistema:** [Versão atual]

---

## 🎯 Instruções Gerais

### Como Usar Este Documento
- ✅ **Marque com check** quando o resultado esperado for atingido
- ❌ **Marque com X** se houver falha ou comportamento inesperado
- 📝 **Anotações:** Registre observações importantes, bugs ou comportamentos inesperados
- 🔄 **Repita testes** após correções de bugs

### Ambiente de Teste
- **Navegador:** [Chrome/Firefox/Safari/Edge]
- **Dispositivo:** [Desktop/Mobile/Tablet]
- **Resolução:** [Ex: 1920x1080]
- **Conexão:** [WiFi/4G/3G]

### Dados de Teste
**Usuário Admin:**
- Email: [seu-email-admin@teste.com]
- Nome de Guerra: [Admin Teste]
- Senha: [senha123]

**Usuário Regular:**
- Email: [usuario@teste.com]
- Nome de Guerra: [Soldado Silva]
- Senha: [senha123]

---

## 🔐 1. AUTENTICAÇÃO

### 1.1 Página Inicial (/)
- [ ] Carrega corretamente a landing page
- [ ] Exibe seções: Hero, Funcionalidades, Login
- [ ] Design responsivo (mobile/desktop)
- [ ] Botões "Começar Agora" e "Saiba Mais" funcionam

### 1.2 Login (/login)
- [ ] Formulário de login é exibido corretamente
- [ ] Campos obrigatórios: Nome de Guerra/Email e Senha
- [ ] Validação de campos vazios
- [ ] Login com **Nome de Guerra** funciona
- [ ] Login com **Email** funciona
- [ ] Senha incorreta mostra erro
- [ ] Usuário inexistente mostra erro
- [ ] Redirecionamento para `/admin` para admin
- [ ] Redirecionamento para `/dashboard` para usuário regular
- [ ] Link "Cadastre-se" leva para `/register`
- [ ] Link "Esqueceu a senha?" leva para `/forgot-password`

### 1.3 Cadastro (/register)
- [ ] Formulário de cadastro é exibido
- [ ] Campos obrigatórios: Nome de Guerra, Posto/Graduação, Telefone, Email, Senha
- [ ] Formatação automática do telefone (máscara)
- [ ] Validação de email
- [ ] Select de Posto/Graduação funciona
- [ ] Senha com mínimo 6 caracteres
- [ ] Cadastro bem-sucedido redireciona para `/dashboard`
- [ ] Email duplicado mostra erro
- [ ] Link "Já tem conta?" leva para `/login`

### 1.4 Esqueci Senha (/forgot-password)
- [ ] Formulário solicita apenas email
- [ ] Email válido redireciona para `/reset-password` com token
- [ ] Email inválido mostra erro
- [ ] Link "Voltar ao Login" funciona

### 1.5 Reset de Senha (/reset-password)
- [ ] Token na URL é reconhecido
- [ ] Campos: Nova Senha e Confirmar Senha
- [ ] Validação: senhas devem coincidir
- [ ] Validação: senha mínimo 6 caracteres
- [ ] Reset bem-sucedido mostra mensagem e redireciona para `/login`
- [ ] Token inválido mostra erro

---

## 👤 2. DASHBOARD DO USUÁRIO (/dashboard)

### 2.1 Acesso e Layout
- [ ] Usuário não autenticado é redirecionado para `/login`
- [ ] Admin tentando acessar é redirecionado para `/admin`
- [ ] Header com nome do usuário é exibido
- [ ] Data atual é mostrada corretamente
- [ ] Layout responsivo funciona

### 2.2 Card de Resumo Financeiro
- [ ] "Total a Pagar" é calculado corretamente
- [ ] Quebra por administrador é mostrada
- [ ] Formatação de moeda (R$ XX,XX) correta
- [ ] "Itens Consumidos" conta corretamente

### 2.3 Lista de Consumos
- [ ] Lista de produtos consumidos é exibida
- [ ] Cada item mostra: nome, quantidade, preço, data
- [ ] Imagem do produto é exibida
- [ ] Cálculo total por item está correto
- [ ] Dados são atualizados automaticamente a cada 10 segundos
- [ ] Sem consumos mostra estado vazio apropriado

### 2.4 Notificações
- [ ] Ícone de notificações no header
- [ ] Badge mostra quantidade não lidas
- [ ] Lista de notificações dropdown
- [ ] Tipos: dívida zerada, compra confirmada
- [ ] Marcar como lida funciona

---

## 🛡️ 3. PAINEL ADMINISTRATIVO (/admin)

### 3.1 Acesso e Layout Geral
- [ ] Apenas admin pode acessar
- [ ] Usuário regular é redirecionado
- [ ] Header com nome do admin
- [ ] Botão "Gerenciar Produtos" leva para `/admin/products`
- [ ] Data atual é mostrada

### 3.2 Resumo de Lucros
- [ ] Card mostra lucro total
- [ ] Quantidade de itens vendidos
- [ ] Formatação de moeda correta
- [ ] Cálculos são precisos

### 3.3 Produtos Vendidos
- [ ] Lista de produtos vendidos pelo admin
- [ ] Agrupamento por produto
- [ ] Totais por produto corretos
- [ ] Quantidade total vendida

### 3.4 Lista de Usuários
- [ ] Todos os usuários são listados
- [ ] Filtros por posto/graduação funcionam
- [ ] Busca por nome funciona
- [ ] Dívidas por usuário são calculadas
- [ ] Botão WhatsApp abre link correto
- [ ] Botão PIX mostra QR code
- [ ] "Zerar Dívida" funciona e envia notificação

---

## 📦 4. GERENCIAMENTO DE PRODUTOS (/admin/products)

### 4.1 Acesso e Layout
- [ ] Apenas admin pode acessar
- [ ] Botão "Voltar" retorna para `/admin`
- [ ] Título "Gerenciar Produtos" é exibido
- [ ] Botão "Novo Produto" abre modal

### 4.2 Modal Novo Produto
- [ ] Campos: Nome, Preço, Imagem
- [ ] Validação de campos obrigatórios
- [ ] Upload de imagem funciona
- [ ] Preview da imagem funciona
- [ ] Produto é criado e aparece na lista
- [ ] Modal fecha após criação

### 4.3 Modal Editar Produto
- [ ] Campos preenchidos com dados atuais
- [ ] Alterações são salvas corretamente
- [ ] Imagem pode ser alterada
- [ ] Produto atualizado na lista

### 4.4 Lista de Produtos
- [ ] Produtos são exibidos em grid responsivo
- [ ] Cada card mostra: imagem, nome, preço, status
- [ ] Toggle disponível/indisponível funciona
- [ ] Botão "Editar" abre modal de edição
- [ ] Botão "Deletar" mostra confirmação
- [ ] Produto indisponível tem opacidade reduzida

### 4.5 Exclusão de Produto
- [ ] Confirmação é solicitada
- [ ] Produto é removido da lista
- [ ] Produto não aparece mais para usuários

---

## 👤 5. PERFIL DO USUÁRIO (/profile)

### 5.1 Acesso
- [ ] Qualquer usuário autenticado pode acessar
- [ ] Header com nome do usuário

### 5.2 Formulário de Perfil
- [ ] Campos preenchidos com dados atuais
- [ ] Campos editáveis: Nome de Guerra, Posto/Graduação, Telefone, Email
- [ ] Senha não é mostrada (apenas alteração)
- [ ] Campos PIX: Chave PIX e QR Code
- [ ] Validações funcionam

### 5.3 Alteração de Dados
- [ ] Alterações são salvas no banco
- [ ] Dados atualizados no header/dashboard
- [ ] Email duplicado mostra erro

### 5.4 Alteração de Senha
- [ ] Campo separado para nova senha
- [ ] Confirmação de senha
- [ ] Senha alterada com sucesso

---

## 📱 6. RESPONSIVIDADE E UX

### 6.1 Mobile (320px - 768px)
- [ ] Todas as páginas funcionam em mobile
- [ ] Formulários são usáveis com toque
- [ ] Listas são roláveis horizontalmente se necessário
- [ ] Botões têm tamanho adequado para toque

### 6.2 Tablet (768px - 1024px)
- [ ] Layout se adapta corretamente
- [ ] Grid de produtos mostra 2 colunas
- [ ] Texto permanece legível

### 6.3 Desktop (1024px+)
- [ ] Layout completo é exibido
- [ ] Grid de produtos mostra 3+ colunas
- [ ] Sidebar ou navegação completa

### 6.4 Navegação
- [ ] Links funcionam corretamente
- [ ] Redirecionamentos ocorrem
- [ ] URLs são limpas (sem #)
- [ ] Botão voltar do navegador funciona

---

## 🔄 7. FUNCIONALIDADES DINÂMICAS

### 7.1 Atualização Automática
- [ ] Dashboard atualiza a cada 10 segundos
- [ ] Novos consumos aparecem automaticamente
- [ ] Totais são recalculados

### 7.2 Notificações em Tempo Real
- [ ] Nova notificação aparece imediatamente
- [ ] Badge é atualizado
- [ ] Som/tipo de notificação correto

### 7.3 Interações AJAX
- [ ] Formulários são enviados sem reload
- [ ] Estados de loading são mostrados
- [ ] Mensagens de erro/sucesso aparecem
- [ ] Dados são atualizados na interface

---

## 🐛 8. CENÁRIOS DE ERRO

### 8.1 Rede
- [ ] Sem internet mostra erro apropriado
- [ ] Reconexão funciona
- [ ] Dados são sincronizados após reconexão

### 8.2 Validações
- [ ] Campos obrigatórios são validados
- [ ] Formatos específicos (email, telefone) são validados
- [ ] Senhas têm requisitos mínimos
- [ ] Dados duplicados são rejeitados

### 8.3 Permissões
- [ ] Usuário regular não acessa admin
- [ ] Admin acessa tudo
- [ ] Logout remove acesso

### 8.4 Dados Inválidos
- [ ] Preços negativos são rejeitados
- [ ] Quantidades negativas são rejeitadas
- [ ] Emails malformados são rejeitados

---

## 📊 9. RELATÓRIOS E MÉTRICAS

### 9.1 Dashboard Admin
- [ ] Lucros são calculados corretamente
- [ ] Quantidades vendidas estão precisas
- [ ] Filtros funcionam

### 9.2 Lista de Usuários
- [ ] Dívidas por usuário corretas
- [ ] Filtros aplicam corretamente

### 9.3 Performance
- [ ] Páginas carregam em < 3 segundos
- [ ] Atualizações são rápidas
- [ ] Sem lag perceptível

---

## 🔒 10. SEGURANÇA

### 10.1 Autenticação
- [ ] Sessões expiram corretamente
- [ ] Cookies são seguros (HTTP-only)
- [ ] Logout limpa sessão

### 10.2 Autorização
- [ ] Rotas protegidas funcionam
- [ ] Admin-only routes bloqueiam usuários regulares
- [ ] API endpoints validam permissões

### 10.3 Dados Sensíveis
- [ ] Senhas não são exibidas em texto plano
- [ ] Dados PIX são protegidos
- [ ] Informações pessoais são privadas

---

## 📝 ANOTAÇÕES GERAIS

### Bugs Encontrados
- [Bug 1]: [Descrição]
- [Bug 2]: [Descrição]

### Sugestões de Melhoria
- [Melhoria 1]: [Descrição]
- [Melhoria 2]: [Descrição]

### Performance
- [ ] Tempo médio de carregamento: ___ segundos
- [ ] Funciona bem com ___ usuários simultâneos

### Compatibilidade
- [ ] Chrome: ✅
- [ ] Firefox: ✅
- [ ] Safari: ✅
- [ ] Edge: ✅
- [ ] Mobile Safari: ✅
- [ ] Chrome Mobile: ✅

---

**Resultado Final:** [APROVADO/REPROVADO/COM OBSERVAÇÕES]

**Observações Finais:**