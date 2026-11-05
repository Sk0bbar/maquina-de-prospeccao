'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { somarDiasUteis, proximaAcao, classificarResposta } = require('../src/sequencia');

test('soma dias úteis pulando fim de semana e feriado', () => {
  assert.equal(somarDiasUteis('2026-10-09', 3), '2026-10-14'); // sex + 3 úteis = qua
  assert.equal(somarDiasUteis('2026-10-09', 3, new Set(['2026-10-12'])), '2026-10-15');
});

test('sequência: 1º hoje, 2º após 3 dias úteis, 3º após 7, depois para', () => {
  const novo = { primeiroEnvio: null, enviados: 0 };
  assert.equal(proximaAcao(novo, '2026-10-13').etapa.numero, 1);

  const um = { primeiroEnvio: '2026-10-13', enviados: 1 };
  assert.deepEqual(
    [proximaAcao(um, '2026-10-15').acao, proximaAcao(um, '2026-10-15').em],
    ['aguardar', '2026-10-16'],
  );
  assert.equal(proximaAcao(um, '2026-10-16').acao, 'enviar');

  const dois = { primeiroEnvio: '2026-10-13', enviados: 2 };
  assert.equal(proximaAcao(dois, '2026-10-22').em, '2026-10-22');

  assert.equal(proximaAcao({ primeiroEnvio: '2026-10-13', enviados: 3 }, '2026-11-01').acao, 'parar');
});

test('resposta ou opt-out interrompem a sequência na hora', () => {
  assert.equal(proximaAcao({ primeiroEnvio: '2026-10-13', enviados: 1, respondeu: true }, '2026-10-20').acao, 'passar_para_comercial');
  assert.equal(proximaAcao({ primeiroEnvio: '2026-10-13', enviados: 1, optOut: true }, '2026-10-20').acao, 'parar');
});

test('detector de respostas', () => {
  const leads = [{ id: 1, email: 'contato@construtora.com.br' }, { id: 2, email: 'joao.silva@gmail.com' }];
  assert.equal(classificarResposta({ de: 'diretor@construtora.com.br', corpo: 'Tenho interesse' }, leads).tipo, 'resposta');
  assert.equal(classificarResposta({ de: 'outro@gmail.com', corpo: 'oi' }, leads).tipo, 'nao_relacionado');
  assert.equal(classificarResposta({ de: 'contato@construtora.com.br', assunto: 'Resposta automática: férias' }, leads).tipo, 'resposta_automatica');
  assert.equal(classificarResposta({ de: 'joao.silva@gmail.com', corpo: 'Não quero mais receber' }, leads).tipo, 'opt_out');
});
