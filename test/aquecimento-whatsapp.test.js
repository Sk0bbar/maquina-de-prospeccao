'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { tetoDiario, simular, respostasEsperadas } = require('../src/aquecimento');
const { normalizarTelefoneBR, linkWhatsApp } = require('../src/whatsapp');

test('teto diário sobe de 5 a 30 e estabiliza', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 12].map(tetoDiario), [5, 10, 15, 20, 25, 30, 30, 30]);
});

test('follow-ups ocupam o teto antes de empresas novas', () => {
  const s = simular(8);
  assert.equal(s[0].empresasNovas, 25); // semana 1 não tem follow-up pendente
  assert.ok(s[1].followups > 0);
  s.forEach((x) => assert.equal(x.followups + x.empresasNovas, x.emailsNaSemana));
  const totalNovas = s.reduce((a, x) => a + x.empresasNovas, 0);
  const totalEmails = s.reduce((a, x) => a + x.emailsNaSemana, 0);
  assert.ok(totalNovas < totalEmails); // cada empresa recebe até 3 e-mails
});

test('expectativa de respostas usa taxas de referência', () => {
  assert.deepEqual(respostasEsperadas(200), { minimo: 2, maximo: 6, cenarioBom: 10 });
});

test('telefone brasileiro normalizado e link wa.me', () => {
  assert.equal(normalizarTelefoneBR('(85) 99999-0000'), '5585999990000');
  assert.equal(normalizarTelefoneBR('+55 85 3333-0000'), '558533330000');
  assert.equal(normalizarTelefoneBR('123'), null);
  assert.equal(linkWhatsApp('85 99999-0000', 'Olá, tudo bem?'), 'https://wa.me/5585999990000?text=Ol%C3%A1%2C%20tudo%20bem%3F');
});
