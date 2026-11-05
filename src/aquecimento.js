// Aquecimento do remetente: o volume diário sobe aos poucos para os provedores (Gmail, Outlook)
// passarem a confiar no endereço novo e as mensagens chegarem na caixa de entrada, não no spam.
//
// O teto diário INCLUI os 2º e 3º contatos da sequência. Por isso o número de empresas novas
// cresce mais devagar que o de e-mails, e se estabiliza em torno de 50–55 por semana.

'use strict';

const TETO_POR_SEMANA = [5, 10, 15, 20, 25, 30]; // e-mails por dia útil; depois da 6ª semana fica em 30
const DIAS_UTEIS_POR_SEMANA = 5;

function tetoDiario(semana) {
  if (semana < 1) throw new RangeError('semana começa em 1');
  return TETO_POR_SEMANA[Math.min(semana, TETO_POR_SEMANA.length) - 1];
}

// Simula a capacidade semana a semana: os follow-ups pendentes ocupam o teto primeiro e o que
// sobra vira empresas novas. Cada empresa nova gera até 2 follow-ups (supondo que ninguém responda,
// o pior caso para o volume) nas semanas seguintes.
function simular(semanas = 8) {
  const followupsPorSemana = Array(semanas + 3).fill(0);
  const resultado = [];
  for (let s = 1; s <= semanas; s++) {
    const capacidade = tetoDiario(s) * DIAS_UTEIS_POR_SEMANA;
    const followups = Math.min(followupsPorSemana[s], capacidade);
    const novas = capacidade - followups;
    followupsPorSemana[s + 1] += novas; // 2º contato: 3 dias úteis depois (cai na semana seguinte)
    followupsPorSemana[s + 2] += novas; // 3º contato: 7 dias úteis depois (duas semanas depois)
    resultado.push({ semana: s, tetoDiario: tetoDiario(s), emailsNaSemana: capacidade, followups, empresasNovas: novas });
  }
  return resultado;
}

// Expectativa de respostas a partir das taxas de mercado para cold e-mail B2B (referência, não garantia).
function respostasEsperadas(empresasAbordadas, { min = 0.01, max = 0.03, bom = 0.05 } = {}) {
  return {
    minimo: Math.round(empresasAbordadas * min),
    maximo: Math.round(empresasAbordadas * max),
    cenarioBom: Math.round(empresasAbordadas * bom),
  };
}

module.exports = { tetoDiario, simular, respostasEsperadas, TETO_POR_SEMANA };
