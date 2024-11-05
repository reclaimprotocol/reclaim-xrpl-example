import * as xrpl from "xrpl";
import { Buffer } from "buffer";

export async function submitTransaction(proof) {
  // Connect to the XRPL testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  // For testing purposes, we prompt the user for their wallet secret (NOT SECURE)
  // const secret = prompt(
  //   "Please enter your XRPL wallet secret (for testnet only!):"
  // );
  const secret = import.meta.env.VITE_WALLET_SECRET;

  const wallet = xrpl.Wallet.fromSeed(secret);

  const prepared = await client.autofill({
    TransactionType: "AccountSet",
    Account: wallet.classicAddress,
    Memos: [
      {
        Memo: {
          MemoData: Buffer.from(`Proof Identifier: ${proof.identifier}`)
            .toString("hex")
            .toUpperCase(),
        },
      },
    ],
  });

  // Sign the transaction
  const signed = wallet.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);
  client.disconnect();

  return tx.result.hash;
}
