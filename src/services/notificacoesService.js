export function obterPermissaoNotificacoes() {
  if (!globalThis.isSecureContext || !("Notification" in globalThis)) {
    return "indisponivel";
  }
  return Notification.permission;
}

// O Frontend deve chamar esta função no clique de um botão.
export async function solicitarPermissaoNotificacoes() {
  const permissao = obterPermissaoNotificacoes();
  if (permissao !== "default") return permissao;
  return Notification.requestPermission();
}

export async function exibirNotificacao(titulo, mensagem, chamadoId) {
  if (obterPermissaoNotificacoes() !== "granted") return false;

  const url = chamadoId
    ? `/chamados/${encodeURIComponent(chamadoId)}`
    : "/chamados";
  const opcoes = {
    body: mensagem,
    icon: "/pwa-192.png",
    tag: chamadoId ? `chamado-${chamadoId}` : "helpdesk",
    data: { url },
  };

  try {
    const registro = await globalThis.navigator?.serviceWorker?.getRegistration();
    if (registro?.active) {
      await registro.showNotification(titulo, opcoes);
    } else {
      const notificacao = new Notification(titulo, opcoes);
      notificacao.onclick = () => {
        globalThis.focus();
        globalThis.location.assign(url);
        notificacao.close();
      };
    }
    return true;
  } catch {
    // Uma falha na notificação não desfaz um chamado já salvo.
    return false;
  }
}
