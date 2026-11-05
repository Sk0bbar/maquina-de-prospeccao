// "Temperatura de Entrada": pontuação 0–100 de cada empresa encontrada na busca.
//
// O score serve para priorizar o esforço do comercial, NUNCA para descartar leads:
// um lead "frio" continua na lista, só fica marcado como não prioritário.
// Nenhum dado é inferido: se um contato não foi verificado numa fonte real, ele fica null.

'use strict';

// Aderência do mercado à prospecção ativa, validada internamente cruzando três fatores:
// disponibilidade de dados públicos, acessibilidade de quem decide e dor real de captação.
const ADERENCIA_POR_MERCADO = {
  'saude': 91,
  'gastronomia': 88,
  'beleza & estetica': 79,
  'academia & fitness': 76,
  'educacao': 72,
  'veterinaria': 71,
  'imobiliarias': 68,
  'hotelaria & turismo': 65,
  'contabilidade': 58,
  'advocacia': 52,
};

const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// 1. Aderência do mercado (peso 25)
function pontosMercado(mercado) {
  const aderencia = ADERENCIA_POR_MERCADO[semAcento(mercado)];
  if (aderencia === undefined || aderencia < 50) return 5;
  if (aderencia >= 80) return 25;
  if (aderencia >= 65) return 18;
  return 10;
}

// 2. Fit de perfil (peso 25): A = PME tradicional com operação ativa; B = negócio validado
//    com captação 100% passiva; null = não dá para identificar pelos dados públicos.
function pontosPerfil(categoria) {
  return { A: 25, B: 15 }[categoria] ?? 0;
}

// 3. Sinais de dor de captação (peso 30), com decaimento por recência:
//    até 6 meses = peso cheio; 6 a 18 meses = metade; mais de 18 meses = não conta.
const PESO_SINAL = {
  presenca_digital_fraca: 10, // opera de verdade, mas sem site, perfil parado ou Google incompleto
  reclamacao_de_atendimento: 10, // avaliações reais citando demora para responder ou agendar
  crescimento_sem_canal: 10, // nova unidade, vaga aberta, expansão, sem canal de aquisição visível
};

function pontosSinais(sinais = []) {
  const melhorPorTipo = {};
  for (const { tipo, mesesAtras } of sinais) {
    const peso = PESO_SINAL[tipo];
    if (!peso || mesesAtras == null || mesesAtras < 0) continue;
    const pontos = mesesAtras <= 6 ? peso : mesesAtras <= 18 ? peso / 2 : 0;
    melhorPorTipo[tipo] = Math.max(melhorPorTipo[tipo] || 0, pontos);
  }
  return Math.min(30, Object.values(melhorPorTipo).reduce((a, b) => a + b, 0));
}

// 4. Qualidade do contato (peso 20)
const EMAIL_GENERICO = /^(contato|comercial|atendimento|vendas|info|sac|faleconosco|adm|administrativo|recepcao)@/i;

function pontosContato({ email, emailDoDecisor = false, whatsapp }) {
  if (email && emailDoDecisor && !EMAIL_GENERICO.test(email)) return 20;
  if (email) return 12;
  if (whatsapp) return 8;
  return 0;
}

function temperatura(score) {
  if (score >= 70) return 'quente';
  if (score >= 40) return 'morno';
  return 'frio';
}

function qualificar(lead) {
  const detalhe = {
    mercado: pontosMercado(lead.mercado),
    perfil: pontosPerfil(lead.categoriaPerfil),
    sinais: pontosSinais(lead.sinais),
    contato: pontosContato(lead),
  };
  const score = Math.round(detalhe.mercado + detalhe.perfil + detalhe.sinais + detalhe.contato);
  return {
    ...lead,
    canal_preferido: lead.email ? 'email' : lead.whatsapp ? 'whatsapp' : null,
    score_qualificacao_inicial: score,
    temperatura: temperatura(score),
    detalhe_score: detalhe,
  };
}

// Ordena por prioridade sem remover ninguém.
function priorizar(leads) {
  return leads.map(qualificar).sort((a, b) => b.score_qualificacao_inicial - a.score_qualificacao_inicial);
}

module.exports = { qualificar, priorizar, temperatura, pontosMercado, pontosPerfil, pontosSinais, pontosContato };
