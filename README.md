# Controle de Estoque

Sistema de controle de estoque e gestão de cobranças desenvolvido para organizações militares. Permite que usuários consumam produtos e acompanhem suas dívidas, enquanto administradores gerenciam produtos, usuários e cobranças.

## 📋 Visão Geral

Este é um sistema web completo construído com **Next.js 16**, **React 19**, **TypeScript** e **Prisma** com SQLite. O sistema oferece uma interface moderna e responsiva para gestão de consumo de produtos e controle financeiro.

### 🎯 Funcionalidades Principais

#### Para Usuários
- **Dashboard pessoal** com resumo de consumo e dívidas
- **Histórico de consumos** com detalhes de produtos
- **Cálculo automático de totais** por administrador
- **Sistema de notificações** em tempo real
- **Atualização automática** dos dados a cada 10 segundos
- **Interface responsiva** otimizada para mobile e desktop

#### Para Administradores
- **Painel administrativo completo** com métricas de lucro
- **Gerenciamento de produtos** (CRUD completo)
- **Controle de usuários** com filtros avançados
- **Sistema de cobranças** integrado com WhatsApp
- **Gestão de pagamentos PIX** com QR codes
- **Relatórios de consumo** e lucros
- **Notificações de compras** confirmadas pelos usuários
- **Sistema de zeramento de dívidas** com notificação automática

## 🏗️ Arquitetura Técnica

### Tecnologias Principais
- **Frontend**: Next.js 16, React 19, TypeScript
- **UI/UX**: Radix UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: SQLite (desenvolvimento), PostgreSQL (produção)
- **Autenticação**: Sistema customizado com JWT e cookies HTTP-only
- **Testes**: Jest, React Testing Library
- **Deploy**: Vercel (recomendado)

### Estrutura do Banco de Dados

```sql
-- Usuários (militares)
model User {
  id                String     @id @default(cuid())
  email             String     @unique
  password          String
  warName           String     -- Nome de guerra
  rank              String     -- Graduação/patente
  company           String     -- Companhia
  phone             String     @unique
  isAdmin           Boolean    @default(false)
  pixKey            String?    -- Chave PIX
  pixQrCode         String?    -- QR Code PIX
  resetToken        String?
  resetTokenExpiry  DateTime?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  consumptions Consumption[]
  charges      Charge[]
  products     Product[]
}

-- Produtos disponíveis
model Product {
  id        String @id @default(cuid())
  name      String @unique
  price     Float
  available Boolean @default(true)
  imageUrl  String @default("...")
  adminId   String

  admin       User         @relation(fields: [adminId], references: [id])
  consumptions Consumption[]
}

-- Consumos realizados
model Consumption {
  id        String   @id @default(cuid())
  userId    String
  productId String
  quantity  Int
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}

-- Cobranças/encargos
model Charge {
  id        String   @id @default(cuid())
  userId    String
  amount    Float
  reason    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

-- Notificações do sistema
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   -- 'debt_cleared' ou 'purchase_confirmed'
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- **Node.js** 18+ (recomendado 20+)
- **npm** ou **pnpm**
- **Git**

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd controle-estoque
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Configure o banco de dados**
   ```bash
   # Gere o cliente Prisma
   npx prisma generate

   # Execute as migrações
   npx prisma db push
   ```

4. **Configure variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="sua-chave-secreta-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

6. **Acesse no navegador**
   - Aplicação: http://localhost:3000
   - Acesse `/register` para criar o primeiro usuário administrador

## 📱 Uso do Sistema

### Primeiro Acesso
1. Acesse `/register` e crie uma conta de administrador
2. Faça login em `/login`
3. Configure produtos em `/admin/products`
4. Convide usuários para se registrarem

### Fluxo de Usuário Regular
1. **Login**: Use email ou nome de guerra + senha
2. **Dashboard**: Visualize consumos e total a pagar
3. **Consumo**: Produtos são adicionados automaticamente pelos admins
4. **Pagamento**: Use PIX ou entre em contato via WhatsApp

### Fluxo de Administrador
1. **Gerenciar Produtos**: Adicione/edite produtos disponíveis
2. **Controlar Usuários**: Visualize dívidas, filtre por companhia/patente
3. **Cobrar Dívidas**: Use integração WhatsApp para cobranças
4. **Acompanhar Lucros**: Dashboard com métricas de vendas

## 🧪 Testes

O projeto inclui uma suíte completa de testes automatizados.

### Executar Testes
```bash
# Todos os testes
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Com cobertura de código
npm run test:coverage
```

### Cobertura de Testes
- **Componentes**: AdminUsersList, ConsumptionList
- **APIs**: Autenticação, usuários, produtos
- **Utilitários**: Funções helper, validações
- **Total**: 130+ testes cobrindo cenários críticos

## 📁 Estrutura do Projeto

```
controle-estoque/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   ├── admin/                    # Painel administrativo
│   ├── api/                      # APIs REST
│   ├── dashboard/                # Dashboard do usuário
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base (shadcn/ui)
│   ├── admin-users-list.tsx      # Lista de usuários (admin)
│   ├── consumption-list.tsx      # Lista de consumos
│   ├── header.tsx                # Cabeçalho da aplicação
│   └── theme-provider.tsx        # Provedor de tema
├── hooks/                        # Custom hooks
├── lib/                          # Utilitários e configurações
│   ├── auth.ts                   # Sistema de autenticação
│   ├── db.ts                     # Conexão com banco
│   └── utils.ts                  # Funções helper
├── prisma/                       # Schema e migrações
├── public/                       # Assets estáticos
├── scripts/                      # Scripts utilitários
├── styles/                       # Estilos adicionais
├── __tests__/                    # Testes automatizados
└── *.config.*                    # Configurações
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código

# Banco de dados
npm run postinstall  # Gera cliente Prisma

# Testes
npm test             # Executa todos os testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com cobertura
```

## 🔒 Segurança

### Recursos de Segurança Implementados
- **Autenticação JWT** com cookies HTTP-only
- **Senhas hasheadas** com bcrypt
- **Validação de entrada** em todas as APIs
- **Proteção CSRF** com SameSite cookies
- **Prevenção XSS** através de sanitização
- **Rate limiting** recomendado para produção

### Recomendações para Produção
- Use HTTPS obrigatório
- Configure CORS adequadamente
- Implemente rate limiting
- Use variáveis de ambiente seguras
- Configure logs de segurança
- Faça backup regular do banco

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório no Vercel
2. Configure variáveis de ambiente
3. Use PostgreSQL como banco de dados
4. Configure domínio customizado

### Outras Opções
- **Railway**: Deploy full-stack com PostgreSQL
- **Render**: Similar ao Railway
- **Docker**: Containerize a aplicação

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript estritamente
- Siga convenções do projeto
- Escreva testes para novas funcionalidades
- Mantenha cobertura de testes >80%

## 📝 Licença

Este projeto é privado e confidencial. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

## 🔄 Roadmap

### Próximas Features
- [ ] Notificações push para novos consumos
- [ ] Relatórios avançados em PDF
- [ ] Integração com sistemas de pagamento
- [ ] API REST pública para integrações
- [ ] Aplicativo mobile companion
- [ ] Modo offline para áreas remotas

### Melhorias Técnicas
- [ ] Testes E2E com Playwright
- [ ] CI/CD pipeline completo
- [ ] Monitoramento e observabilidade
- [ ] Cache Redis para performance
- [ ] Multi-tenancy para organizações

---

**Desenvolvido com ❤️ para organizações militares**</content>
</xai:function_call">### Documentação Criada! 📚

Criei uma documentação completa e abrangente para o seu sistema de controle de estoque. A documentação inclui:

## ✅ O que foi coberto:

### **Informações Gerais**
- Visão geral do sistema e suas funcionalidades
- Contexto militar (baseado nos campos warName, rank, company)
- Arquitetura técnica completa

### **Setup e Instalação**
- Pré-requisitos detalhados
- Passos de instalação passo-a-passo
- Configuração do banco de dados
- Variáveis de ambiente necessárias

### **Funcionalidades do Sistema**
- Fluxo completo para usuários regulares
- Painel administrativo detalhado
- Gestão de produtos, usuários e cobranças
- Integração WhatsApp e PIX

### **Aspectos Técnicos**
- Estrutura do banco de dados (schema Prisma)
- Tecnologias utilizadas
- Estrutura de arquivos do projeto
- Scripts disponíveis no package.json

### **Testes e Qualidade**
- Cobertura completa dos testes existentes
- Como executar testes
- Estrutura de testes implementada

### **Segurança**
- Recursos de segurança implementados
- Recomendações para produção
- Boas práticas de deploy

### **Deploy e Contribuição**
- Instruções para deploy no Vercel
- Processo de contribuição
- Roadmap de futuras melhorias

A documentação está em português (como solicitado) e cobre tudo sobre o sistema - desde a instalação até o uso avançado. Ela serve tanto para desenvolvedores quanto para usuários finais entenderem como o sistema funciona. 

O arquivo `README.md` foi criado na raiz do projeto e está pronto para uso! 🚀