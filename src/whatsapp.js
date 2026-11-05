// WhatsApp sem risco para o número da agência.
//
// O WhatsApp não permite mensagem automática para quem nunca falou com a empresa, e números
// que tentam costumam ser banidos. Por isso a Máquina NÃO dispara no WhatsApp: ela gera a
// mensagem pronta e um link "clique para conversar" (wa.me). O comercial revisa e envia do
// próprio celular, e a conversa segue normalmente a partir da resposta.

'use strict';

// Normaliza para o formato internacional brasileiro: 55 + DDD + número (8 ou 9 dígitos).
function normalizarTelefoneBR(telefone) {
  let digitos = String(telefone || '').replace(/\D/g, '');
  if (digitos.startsWith('0')) digitos = digitos.replace(/^0+/, '');
  if (!digitos.startsWith('55')) digitos = `55${digitos}`;
  const local = digitos.slice(2);
  if (local.length !== 10 && local.length !== 11) return null; // DDD + 8 ou 9 dígitos
  if (Number(local.slice(0, 2)) < 11) return null; // DDD inválido
  return digitos;
}

function linkWhatsApp(telefone, mensagem) {
  const numero = normalizarTelefoneBR(telefone);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(String(mensagem || '').trim())}`;
}

module.exports = { normalizarTelefoneBR, linkWhatsApp };
