require('dotenv').config();
const algosdk = require('algosdk');

function normalizeMnemonic(raw) {
  return String(raw || '')
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/\s+/g, ' ');
}

async function anchorEvaluation(payload) {
  const algod = new algosdk.Algodv2({
    token: process.env.ALGOD_TOKEN || '',
    baseServer: process.env.ALGOD_URL || 'https://testnet-api.algonode.cloud'
  });
  const mnemonic = normalizeMnemonic(process.env.ALGO_MNEMONIC);
  const acct = algosdk.mnemonicToSecretKey(mnemonic);
  const addr = String(acct.addr);
  const sp = await algod.getTransactionParams().do();

  const note = new Uint8Array(Buffer.from(JSON.stringify(payload)).slice(0, 900));
  const tx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: addr,
    receiver: addr,
    amount: 1000,
    suggestedParams: sp,
    note
  });

  const signed = tx.signTxn(acct.sk);
  const { txid } = await algod.sendRawTransaction(signed).do();
  const conf = await algosdk.waitForConfirmation(algod, txid, 10);
  return {
    txid,
    round: conf['confirmed-round'] ?? conf.confirmedRound,
    explorer: `https://testnet.algoexplorer.io/tx/${txid}`
  };
}

module.exports = { anchorEvaluation };
