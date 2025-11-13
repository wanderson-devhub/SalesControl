import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso do Controle de Estoque",
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Termos de Uso</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Estes Termos de Uso estabelecem as regras e condições para o uso do Sistema de Controle de Estoque. Ao acessar ou utilizar nossos serviços, você concorda em cumprir estes Termos. Se você não concordar com estes Termos, não utilize o Sistema.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Definições</h2>
          <p className="text-muted-foreground mb-4">
            Para os fins destes Termos:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li><strong>"Sistema"</strong> refere-se ao Sistema de Controle de Estoque e suas funcionalidades associadas</li>
            <li><strong>"Usuário"</strong> refere-se a qualquer pessoa que acessa ou utiliza o Sistema</li>
            <li><strong>"Conteúdo"</strong> refere-se a qualquer informação, dado ou material fornecido pelo Usuário no Sistema</li>
            <li><strong>"Serviços"</strong> refere-se aos serviços de controle de estoque, cobranças e funcionalidades relacionadas oferecidos pelo Sistema</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Aceitação dos Termos</h2>
          <p className="text-muted-foreground mb-4">
            Ao se registrar, acessar ou utilizar o Sistema, você declara que:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Leu, compreendeu e concorda em cumprir estes Termos</li>
            <li>Concorda com nossa Política de Privacidade</li>
            <li>É um militar em serviço ativo ou autorizado a utilizar o Sistema</li>
            <li>Tem pelo menos 18 anos de idade</li>
            <li>Fornecerá informações verdadeiras, precisas e atualizadas durante o registro</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Descrição dos Serviços</h2>
          <p className="text-muted-foreground mb-4">
            O Sistema oferece as seguintes funcionalidades principais:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Controle e gerenciamento de estoque de produtos</li>
            <li>Processamento de vendas e transações</li>
            <li>Geração de relatórios e análises</li>
            <li>Gestão de usuários e permissões</li>
            <li>Sistema de notificações e alertas</li>
            <li>Integração com sistemas de pagamento (PIX)</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Elegibilidade e Registro</h2>
          <p className="text-muted-foreground mb-4">
            O uso do Sistema é restrito a militares em serviço ativo devidamente autorizados. Durante o registro, você deve fornecer:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Informações pessoais precisas e atualizadas</li>
            <li>Credenciais válidas de identificação militar</li>
            <li>Endereço de email válido para comunicações oficiais</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Uso Aceitável</h2>
          <p className="text-muted-foreground mb-4">
            Você concorda em utilizar o Sistema apenas para fins autorizados e legais. É proibido:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Utilizar o Sistema para atividades ilegais ou não autorizadas</li>
            <li>Tentar acessar áreas restritas ou dados de outros usuários sem permissão</li>
            <li>Carregar vírus, malware ou código malicioso</li>
            <li>Interferir no funcionamento normal do Sistema</li>
            <li>Utilizar o Sistema para fins comerciais não autorizados</li>
            <li>Compartilhar credenciais de acesso com terceiros</li>
            <li>Fazer engenharia reversa ou tentar descompilar o Sistema</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Propriedade Intelectual</h2>
          <p className="text-muted-foreground mb-4">
            Todo o conteúdo, funcionalidades, design, código fonte e propriedade intelectual do Sistema são de nossa propriedade exclusiva ou de nossos licenciadores. Estes Termos não concedem a você nenhum direito de propriedade intelectual sobre o Sistema.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Conteúdo do Usuário</h2>
          <p className="text-muted-foreground mb-4">
            Ao fornecer Conteúdo ao Sistema, você declara que:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Possui todos os direitos necessários sobre o Conteúdo</li>
            <li>O Conteúdo é preciso e não viola direitos de terceiros</li>
            <li>Concede a nós uma licença não-exclusiva para usar o Conteúdo conforme necessário para fornecer os Serviços</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Privacidade e Proteção de Dados</h2>
          <p className="text-muted-foreground mb-4">
            Sua privacidade é importante para nós. Nossa Política de Privacidade, incorporada a estes Termos por referência, explica como coletamos, usamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Segurança</h2>
          <p className="text-muted-foreground mb-4">
            Embora implementemos medidas de segurança robustas, você reconhece que nenhum sistema é completamente seguro. Você é responsável por:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Manter suas credenciais seguras</li>
            <li>Reportar imediatamente qualquer suspeita de uso não autorizado</li>
            <li>Utilizar conexões seguras ao acessar o Sistema</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground mb-4">
            Na máxima extensão permitida por lei, não nos responsabilizamos por:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Danos econômicos, indiretos, incidentais ou consequenciais</li>
            <li>Perda de dados, lucros ou oportunidades de negócio</li>
            <li>Interrupções de serviço ou indisponibilidade temporária</li>
            <li>Erros ou omissões no Conteúdo fornecido por usuários</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Indenização</h2>
          <p className="text-muted-foreground mb-4">
            Você concorda em indenizar e isentar-nos de qualquer responsabilidade por reclamações, perdas, danos ou despesas decorrentes de:
          </p>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li>Seu uso indevido do Sistema</li>
            <li>Violação destes Termos</li>
            <li>Conteúdo que você fornece ao Sistema</li>
            <li>Qualquer atividade realizada em sua conta</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. Suspensão e Encerramento</h2>
          <p className="text-muted-foreground mb-4">
            Reservamo-nos o direito de suspender ou encerrar seu acesso ao Sistema a qualquer momento, com ou sem aviso prévio, por violação destes Termos ou por outras razões consideradas necessárias para a segurança e integridade do Sistema.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">13. Modificações aos Termos</h2>
          <p className="text-muted-foreground mb-4">
            Podemos modificar estes Termos a qualquer momento. Notificaremos você sobre mudanças significativas através do Sistema ou por email. O uso continuado do Sistema após as modificações constitui aceitação dos Termos atualizados.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">14. Lei Aplicável e Jurisdição</h2>
          <p className="text-muted-foreground mb-4">
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa decorrente destes Termos será submetida ao foro da Comarca de [Cidade/Estado], renunciando a qualquer outro, por mais privilegiado que seja.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">15. Disposições Gerais</h2>
          <ul className="text-muted-foreground mb-4 list-disc list-inside">
            <li><strong>Integralidade:</strong> Estes Termos constituem o acordo completo entre você e nós</li>
            <li><strong>Divisibilidade:</strong> Se qualquer disposição for considerada inválida, as demais permanecerão em vigor</li>
            <li><strong>Renúncia:</strong> A falha em exercer qualquer direito não constitui renúncia</li>
            <li><strong>Cessão:</strong> Você não pode ceder seus direitos sob estes Termos sem nosso consentimento prévio</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">16. Contato</h2>
          <p className="text-muted-foreground mb-4">
            Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do sistema de suporte ou envie um email para o administrador responsável.
          </p>

          <p className="text-muted-foreground mt-6 text-sm">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}
