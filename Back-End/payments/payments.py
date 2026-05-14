const stripe = require('stripe')('sk_test_SUA_CHAVE_SECRETA'); // sempre sk_test_...

const account = await stripe.accounts.create({
  type: 'express', // ou 'standard' ou 'custom'
  country: 'AO',
  email: 'arquiteto@exemplo.com',
  capabilities: {
    transfers: { requested: true },
  },
});

console.log(account.id); // acct_XXXXXXX — guarda este ID no teu banco de dados



const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // em centavos → $100.00
  currency: 'usd',
  // Define para qual arquiteto vai o dinheiro (após taxa da plataforma)
  transfer_data: {
    destination: 'acct_ARQUITETO_ID', // ID do arquiteto guardado no DB
  },
  // Comissão da Duria (ex: 15%)
  application_fee_amount: 1500, // $15.00 fica na Duria
});

const transfer = await stripe.transfers.create({
  amount: 8500, // valor a transferir
  currency: 'usd',
  destination: 'acct_ARQUITETO_ID',
  transfer_group: 'VENDA_123', // opcional, para rastrear
});