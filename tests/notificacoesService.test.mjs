import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import {
  obterPermissaoNotificacoes,
  solicitarPermissaoNotificacoes,
  exibirNotificacao,
} from '../src/services/notificacoesService.js';

const nomes = ['Notification', 'navigator', 'isSecureContext', 'focus', 'location'];
const originais = new Map(nomes.map(nome => [nome, Object.getOwnPropertyDescriptor(globalThis, nome)]));
const definir = (nome, valor) => Object.defineProperty(globalThis, nome, { value: valor, configurable: true });
let avisos;

beforeEach(() => {
  avisos = [];
  class Notificacao {
    static permission = 'default';
    static requestPermission = mock.fn(async () => {
      Notificacao.permission = 'granted';
      return 'granted';
    });
    constructor(titulo, opcoes) {
      this.titulo = titulo;
      this.opcoes = opcoes;
      this.close = mock.fn();
      avisos.push(this);
    }
  }
  definir('Notification', Notificacao);
  definir('isSecureContext', true);
  definir('navigator', {});
});

afterEach(() => {
  for (const [nome, descritor] of originais) {
    if (descritor) Object.defineProperty(globalThis, nome, descritor);
    else delete globalThis[nome];
  }
});

test('não solicita nem envia em contexto inseguro', async () => {
  definir('isSecureContext', false);
  assert.equal(obterPermissaoNotificacoes(), 'indisponivel');
  assert.equal(await solicitarPermissaoNotificacoes(), 'indisponivel');
  assert.equal(Notification.requestPermission.mock.callCount(), 0);
  assert.equal(await exibirNotificacao('Teste', 'Mensagem'), false);
});

test('não falha quando Notification não está disponível', async () => {
  delete globalThis.Notification;
  assert.equal(await solicitarPermissaoNotificacoes(), 'indisponivel');
  assert.equal(await exibirNotificacao('Teste', 'Mensagem'), false);
});

test('solicita permissão apenas quando ainda não foi definida', async () => {
  assert.equal(await solicitarPermissaoNotificacoes(), 'granted');
  assert.equal(await solicitarPermissaoNotificacoes(), 'granted');
  assert.equal(Notification.requestPermission.mock.callCount(), 1);
});

test('respeita permissão negada e não tenta enviar aviso', async () => {
  Notification.permission = 'denied';
  assert.equal(await solicitarPermissaoNotificacoes(), 'denied');
  assert.equal(await exibirNotificacao('Teste', 'Mensagem'), false);
  assert.equal(Notification.requestPermission.mock.callCount(), 0);
  assert.equal(avisos.length, 0);
});

test('falha ao solicitar permissão não rejeita o clique e permite nova tentativa', async () => {
  const solicitar = Notification.requestPermission;
  Notification.requestPermission = async () => { throw new Error('Navegador indisponível'); };
  assert.equal(await solicitarPermissaoNotificacoes(), 'default');
  Notification.requestPermission = solicitar;
  assert.equal(await solicitarPermissaoNotificacoes(), 'granted');
});

test('não solicita permissão automaticamente ao exibir', async () => {
  assert.equal(await exibirNotificacao('Teste', 'Mensagem'), false);
  assert.equal(Notification.requestPermission.mock.callCount(), 0);
});

test('usa Service Worker ativo e envia o destino do chamado codificado', async () => {
  Notification.permission = 'granted';
  const enviar = mock.fn(async () => {});
  definir('navigator', { serviceWorker: { getRegistration: async () => ({ active: {}, showNotification: enviar }) } });
  assert.equal(await exibirNotificacao('Chamado criado', 'Mensagem', 'id com espaço'), true);
  const [titulo, opcoes] = enviar.mock.calls[0].arguments;
  assert.equal(titulo, 'Chamado criado');
  assert.equal(opcoes.body, 'Mensagem');
  assert.equal(opcoes.icon, '/pwa-192.png');
  assert.equal(opcoes.data.url, '/chamados/id%20com%20espa%C3%A7o');
  assert.equal(avisos.length, 0);
});

test('usa Notification sem worker ativo e abre a listagem ao clicar', async () => {
  Notification.permission = 'granted';
  const focar = mock.fn();
  const navegar = mock.fn();
  definir('focus', focar);
  definir('location', { assign: navegar });
  assert.equal(await exibirNotificacao('Teste', 'Mensagem'), true);
  avisos[0].onclick();
  assert.equal(avisos[0].opcoes.data.url, '/chamados');
  assert.equal(focar.mock.callCount(), 1);
  assert.equal(navegar.mock.calls[0].arguments[0], '/chamados');
  assert.equal(avisos[0].close.mock.callCount(), 1);
});

test('falha no envio retorna false sem lançar erro', async () => {
  Notification.permission = 'granted';
  definir('navigator', { serviceWorker: { getRegistration: async () => ({ active: {}, showNotification: async () => { throw new Error('Falha'); } }) } });
  assert.equal(await exibirNotificacao('Teste', 'Mensagem'), false);
});
