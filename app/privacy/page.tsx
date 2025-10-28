export const metadata = {
  title: "Política de Privacidade | petcheck",
  description: "Política de Privacidade do aplicativo petcheck",
};

export default function PrivacyPage() {
  const lastUpdate = new Date().toLocaleDateString("pt-BR");
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-4">Política de Privacidade</h1>
      <p><strong>Última atualização:</strong> {lastUpdate}</p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Quem somos</h2>
      <p>
        <strong>petcheck</strong> (“Aplicativo”) é mantido por <strong>Lucas de Matos</strong>.
        Contato: <a className="text-blue-600 underline" href="mailto:lucasdematos8@gmail.com">lucasdematos8@gmail.com</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Dados que coletamos</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Telefone celular</strong> (formato E.164) para autenticação via WhatsApp (OTP) e envio de notificações.</li>
        <li><strong>Dados de conta</strong> (ex.: nome e e-mail, quando informados pelo usuário).</li>
        <li><strong>Dados de uso</strong> do aplicativo para métricas agregadas e melhoria do serviço.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Finalidades e bases legais (LGPD)</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Autenticação e segurança</strong> (envio de código OTP por WhatsApp) — execução de contrato e legítimo interesse.</li>
        <li><strong>Notificações</strong> sobre consultas, vacinas e medicamentos — com <strong>consentimento</strong> (opt-in) do usuário.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Compartilhamento</h2>
      <p>
        Utilizamos a WhatsApp Business Platform (Meta) para envio de mensagens. O número de telefone e o conteúdo da notificação são
        processados de acordo com os termos e políticas da plataforma.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Retenção e segurança</h2>
      <p>
        Mantemos os dados pelo tempo necessário às finalidades informadas e adotamos medidas técnicas e administrativas para proteção contra
        acesso, alteração ou destruição não autorizados.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, portabilidade ou eliminação de dados, bem como retirar consentimentos, entrando em contato pelo e-mail
        <a className="text-blue-600 underline" href="mailto:lucasdematos8@gmail.com"> lucasdematos8@gmail.com</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Opt-out de mensagens</h2>
      <p>
        Você pode desativar o recebimento de notificações a qualquer momento nas configurações do aplicativo ou solicitando por e-mail. Em canais
        do WhatsApp, respeitamos as ferramentas de opt-out fornecidas pela plataforma.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Crianças e adolescentes</h2>
      <p>
        O Aplicativo não é destinado a menores sem a supervisão e o consentimento dos responsáveis legais.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Alterações</h2>
      <p>
        Podemos atualizar esta política periodicamente. Publicaremos a versão vigente nesta página e indicaremos a data de última atualização.
      </p>
    </main>
  );
}
