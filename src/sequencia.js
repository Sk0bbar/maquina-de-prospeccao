// Sequência de abordagem por e-mail: no máximo 3 contatos por empresa, espaçados em dias úteis.
//
//   1º contato: apresentação curta e personalizada
//   2º contato: 3 dias úteis depois do 1º, só se não houve resposta
//   3º contato: 7 dias úteis depois do 1º, encerramento educado
//
// A sequência PARA na hora se a empresa responder ou pedir para não receber mais contato.
// Quem conduz a conversa a partir da resposta é sempre o comercial da agência.

'use strict';

const DIA_MS = 86_400_000;
const iso = (d) => d.toISOString().slice(0, 10);

const ETAPAS = [
  { numero: 1, nome: 'apresentacao', diasUteisAposPrimeiro: 0 },
  { numero: 2, nome: 'retomada', diasUteisAposPrimeiro: 3 },
  { numero: 3, nome: 'encerramento', diasUteisAposPrimeiro: 7 },
];

function somarDiasUteis(dataIso, dias, feriados = new Set()) {
  let d = new Date(`${dataIso}T12:00:00Z`);
  let restantes = dias;
  while (restantes > 0) {
    d = new Date(d.getTime() + DIA_MS);
    const semana = d.getUTCDay();
    if (semana !== 0 && semana !== 6 && !feriados.has(iso(d))) restantes--;
  }
  return iso(d);
}

// Estado de um lead na sequência -> qual é a próxima ação (se houver).
// lead: { primeiroEnvio: 'AAAA-MM-DD' | null, enviados: number, respondeu: bool, optOut: bool }
function proximaAcao(lead, hojeIso, feriados) {
  if (lead.optOut) return { acao: 'parar', motivo: 'pediu para não receber contato' };
  if (lead.respondeu) return { acao: 'passar_para_comercial', motivo: 'respondeu' };
  if (lead.enviados >= ETAPAS.length) return { acao: 'parar', motivo: 'sequência concluída' };
  if (!lead.primeiroEnvio) return { acao: 'enviar', etapa: ETAPAS[0], em: hojeIso };

  const etapa = ETAPAS[lead.enviados];
  const em = somarDiasUteis(lead.primeiroEnvio, etapa.diasUteisAposPrimeiro, feriados);
  return em <= hojeIso ? { acao: 'enviar', etapa, em } : { acao: 'aguardar', etapa, em };
}

// Detecção de resposta: qualquer e-mail recebido de um endereço (ou domínio corporativo) que está
// na sequência marca o lead como "respondeu". Respostas automáticas (férias, ausência) não contam.
const AUTO_RESPOSTA = /(resposta autom[aá]tica|fora do escrit[oó]rio|out of office|auto-?reply|ausente|f[eé]rias)/i;
const PROVEDORES_PESSOAIS = new Set(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.br', 'icloud.com', 'live.com', 'bol.com.br', 'uol.com.br']);
const OPT_OUT = /(descadastr|n[aã]o (quero|desejo) (mais )?receber|remover? (meu|o) (e-?mail|contato)|unsubscribe|pare de (me )?enviar)/i;

function classificarResposta({ de, assunto = '', corpo = '' }, leadsEmSequencia) {
  const remetente = String(de || '').toLowerCase().trim();
  const dominio = remetente.split('@')[1] || '';
  const lead = leadsEmSequencia.find((l) => {
    const email = String(l.email || '').toLowerCase();
    if (email === remetente) return true;
    return !PROVEDORES_PESSOAIS.has(dominio) && email.endsWith(`@${dominio}`);
  });
  if (!lead) return { tipo: 'nao_relacionado' };
  if (AUTO_RESPOSTA.test(`${assunto} ${corpo}`)) return { tipo: 'resposta_automatica', lead };
  if (OPT_OUT.test(`${assunto} ${corpo}`)) return { tipo: 'opt_out', lead };
  return { tipo: 'resposta', lead };
}

module.exports = { ETAPAS, somarDiasUteis, proximaAcao, classificarResposta };
