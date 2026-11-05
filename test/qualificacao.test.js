'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { qualificar, priorizar, pontosSinais, pontosContato, pontosMercado } = require('../src/qualificacao');

test('mercado: faixas de aderência e acentos ignorados', () => {
  assert.equal(pontosMercado('Saúde'), 25);
  assert.equal(pontosMercado('Educação'), 18);
  assert.equal(pontosMercado('Advocacia'), 10);
  assert.equal(pontosMercado('Mineração'), 5);
});

test('sinais decaem com o tempo e não passam de 30', () => {
  assert.equal(pontosSinais([{ tipo: 'presenca_digital_fraca', mesesAtras: 2 }]), 10);
  assert.equal(pontosSinais([{ tipo: 'presenca_digital_fraca', mesesAtras: 12 }]), 5);
  assert.equal(pontosSinais([{ tipo: 'presenca_digital_fraca', mesesAtras: 24 }]), 0);
  assert.equal(pontosSinais([
    { tipo: 'presenca_digital_fraca', mesesAtras: 1 },
    { tipo: 'presenca_digital_fraca', mesesAtras: 3 }, // mesmo tipo não soma duas vezes
    { tipo: 'reclamacao_de_atendimento', mesesAtras: 4 },
    { tipo: 'crescimento_sem_canal', mesesAtras: 5 },
  ]), 30);
});

test('contato: decisor > genérico > só WhatsApp > nada', () => {
  assert.equal(pontosContato({ email: 'ana@clinica.com.br', emailDoDecisor: true }), 20);
  assert.equal(pontosContato({ email: 'contato@clinica.com.br', emailDoDecisor: true }), 12);
  assert.equal(pontosContato({ whatsapp: '5585999990000' }), 8);
  assert.equal(pontosContato({}), 0);
});

test('lead completo fica quente; lead sem dados fica frio mas continua na lista', () => {
  const quente = qualificar({
    empresa: 'Clínica A', mercado: 'Saúde', categoriaPerfil: 'A',
    email: 'diretora@clinicaa.com.br', emailDoDecisor: true,
    sinais: [{ tipo: 'presenca_digital_fraca', mesesAtras: 2 }],
  });
  assert.equal(quente.score_qualificacao_inicial, 80);
  assert.equal(quente.temperatura, 'quente');
  assert.equal(quente.canal_preferido, 'email');

  const lista = priorizar([{ empresa: 'Sem dados', mercado: 'Outro' }, { empresa: 'Clínica A', mercado: 'Saúde', categoriaPerfil: 'A' }]);
  assert.equal(lista.length, 2);
  assert.equal(lista[0].empresa, 'Clínica A');
  assert.equal(lista[1].temperatura, 'frio');
  assert.equal(lista[1].canal_preferido, null);
});
