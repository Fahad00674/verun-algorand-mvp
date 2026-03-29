require('dotenv').config();
const algosdk = require('algosdk');

async function anchorEvaluation(payload) {
  const algod = new algosdk.Algodv2(process.env.ALGOD_TOKEN || '', process.env.ALGOD_URL, '');
  const acct = algosdk.mnemonicToSecretKey(process.env.ALGO_MNEMONIC);
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
