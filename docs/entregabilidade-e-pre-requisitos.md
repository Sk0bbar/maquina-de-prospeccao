# Entregabilidade e pré-requisitos

A Máquina só envia o primeiro e-mail quando os itens abaixo estão prontos. Cada item existe para proteger o domínio da agência, para cumprir a LGPD ou para não sobrecarregar o comercial.

| # | Item | Por quê |
|---|---|---|
| 1 | **E-mail comercial no domínio da agência** (Google Workspace) | Contas pessoais são bloqueadas quando enviam em sequência, e um endereço corporativo passa confiança |
| 2 | **Domínio de envio:** o principal (A) ou um separado (B) | A é mais rápido. B protege 100% o domínio principal, mas leva cerca de 2 semanas a mais de aquecimento |
| 3 | **Encaminhamento automático** do comercial@ para o e-mail que o comercial já usa | As respostas chegam primeiro ao comercial@ para a Máquina parar a sequência, e o comercial recebe na hora |
| 4 | **DMARC** no DNS (`_dmarc` TXT `v=DMARC1; p=none; rua=mailto:...`) | Completa a autenticação (SPF + DKIM + DMARC) que Gmail e Outlook exigem de remetentes em volume |
| 5 | **Autorização OAuth** da conta, feita pelo titular na tela do Google | A senha nunca passa pela Máquina, e o acesso pode ser revogado a qualquer momento |
| 6 | **Oferta de entrada por nicho** | Orienta o texto. O preço nunca aparece na mensagem; é informação só para o comercial |
| 7 | **Mercados, nichos e exclusividades** ([modelo](../modelos/mercados-e-nichos.csv)) | Nenhum concorrente de cliente atual é abordado sem autorização |
| 8 | **Volume de conversas por semana** que o comercial consegue atender | Calibra o envio para não virar gargalo do outro lado |
| 9 | **Referências autorizadas** | Nenhum cliente é citado na abordagem sem autorização própria |

## Regras de envio

- **No máximo 3 e-mails por empresa**, espaçados em dias úteis, e nunca mais de um no mesmo dia ([`sequencia.js`](../src/sequencia.js)).
- **Para na hora** quando a empresa responde ou pede para não receber mais. Toda mensagem traz essa opção.
- **Aquecimento gradual:** de 5 para 30 e-mails por dia ao longo de 6 semanas ([`aquecimento.js`](../src/aquecimento.js)).
- **Sem disparo no WhatsApp.** A Máquina gera o link `wa.me` com a mensagem pronta e o comercial envia do próprio celular ([`whatsapp.js`](../src/whatsapp.js)).
- **Contato sempre com o e-mail da empresa**, nunca o pessoal de quem trabalha nela. É o caminho mais seguro pela LGPD.

## Simulação do aquecimento (pior caso: ninguém responde)

```bash
npm run simular
```

| Semana | Teto/dia | E-mails na semana | Follow-ups | Empresas novas |
|---|---|---|---|---|
| 1 | 5 | 25 | 0 | 25 |
| 2 | 10 | 50 | 25 | 25 |
| 3 | 15 | 75 | 50 | 25 |
| 4 | 20 | 100 | 50 | 50 |
| 5 | 25 | 125 | 75 | 50 |
| 6+ | 30 | 150 | 100 | 50 |

Como os follow-ups ocupam o teto primeiro, o número de empresas novas cresce mais devagar que o de e-mails e se estabiliza em cerca de **50 por semana**. Com as taxas de referência de mercado para cold e-mail B2B (1% a 3% de resposta, 5% num cenário bom), isso dá **de 1 a 3 conversas novas por semana** no começo. Esse volume cabe no limite sugerido de até 5 conversas por semana para o comercial.
