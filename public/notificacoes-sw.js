self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = new URL(evento.notification.data?.url || "/chamados", self.location.origin);
  if (url.origin !== self.location.origin) return;

  evento.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const janela = janelas.find((cliente) => new URL(cliente.url).origin === url.origin);
    if (janela) {
      await janela.navigate(url.href);
      await janela.focus();
    } else {
      await self.clients.openWindow(url.href);
    }
  })());
});
