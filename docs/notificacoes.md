# Notificações locais

O serviço já está em `src/services/notificacoesService.js` e exporta:

- `obterPermissaoNotificacoes()`: retorna `default`, `granted`, `denied` ou `indisponivel`.
- `solicitarPermissaoNotificacoes()`: solicita autorização quando a permissão é `default`. Se o pedido falhar, retorna a permissão atual.
- `exibirNotificacao(titulo, mensagem, chamadoId)`: retorna `true` quando o navegador aceita o envio e `false` quando não pode enviar. O ID é opcional.

No frontend, solicite a permissão no clique de um botão:

```jsx
import { solicitarPermissaoNotificacoes } from "../services/notificacoesService.js";

<button type="button" onClick={async () => {
  const permissao = await solicitarPermissaoNotificacoes();
  // Use permissao para mostrar o resultado na interface.
}}>
  Ativar notificações
</button>
```

Os serviços de chamados já enviam avisos depois de cadastrar, atualizar e fechar. Não repita esses envios nas telas. Para outro aviso local:

```js
import { exibirNotificacao } from "../services/notificacoesService.js";

const enviado = await exibirNotificacao("HelpDesk", "Aviso de teste");
```

O aviso usa o Service Worker quando está ativo e, nos demais casos, tenta a API Notification. O clique abre o chamado pelo UUID ou a listagem quando não há ID. Falhas no aviso não desfazem o salvamento do chamado.

É necessário um navegador compatível, HTTPS ou localhost e permissão concedida. O sistema operacional pode ocultar o aviso mesmo quando o envio retorna `true`. São notificações locais, sem servidor de push.

Testes automatizados: `node --test tests/notificacoesService.test.mjs`.
Para confirmar a exibição real, execute o build e o preview, permita notificações no Chrome ou Edge e cadastre um chamado. Clique no aviso para conferir a navegação.
