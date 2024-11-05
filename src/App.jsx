import React, { useState, useEffect } from "react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";
import { verifyProof } from "./utils/verifyProof";
import { submitTransaction } from "./utils/submitTransaction";
import Navbar from "./components/navbar";
import { Hourglass } from "react-loader-spinner";

function App() {
  const [reclaimProofRequest, setReclaimProofRequest] = useState(null);
  const [requestUrl, setRequestUrl] = useState("");
  const [statusUrl, setStatusUrl] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [hash, setHash] = useState("");
  const [proof, setproof] = useState("");

  useEffect(() => {
    async function initializeReclaim() {
      const APP_ID = "0x6E0338a6D8594101Ea9e13840449242015d71B19"; // This is an example App Id Replace it with your App Id.
      const APP_SECRET =
        "0x1e0d6a6548b72286d747b4ac9f2ad6b07eba8ad6a99cb1191890ea3f77fae48f"; // This is an example App Secret Replace it with your App Secret.
      const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5"; // This is GitHub Provider Id Replace it with the provider id you want to use.

      const proofRequest = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID
      );
      setReclaimProofRequest(proofRequest);
    }

    initializeReclaim();
  }, []);

  async function handleCreateClaim() {
    if (!reclaimProofRequest) {
      console.error("Reclaim Proof Request not initialized");
      return;
    }
    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);
    const status = reclaimProofRequest.getStatusUrl();
    setStatusUrl(status);
    await reclaimProofRequest.startSession({
      onSuccess: async (proof) => {
        setproof(proof);
        let result = await verifyProof(proof);
        if (result) {
          // Proof verification successful, submit transaction
          setTxLoading(true);
          const txHash = await submitTransaction(proof);
          setTxLoading(false);
          setHash(txHash);
        }
      },
      onFailure: (error) => {
        console.error("Verification failed", error);
        setTxLoading(false);
      },
    });
  }

  return (
    <div className="flex flex-col justify-center mt-24">
      <Navbar />
      <h1> Verify your Proof on XRPL with Reclaim Protocol</h1>
      <button onClick={handleCreateClaim} className="mt-8 max-w-sm self-center">
        Create Claim
      </button>
      {requestUrl && !hash && (
        <div className="flex flex-col gap-8 items-center mt-4 self-center">
          <h2>Scan this QR code to start the verification process:</h2>
          <QRCode value={requestUrl} />
        </div>
      )}
      {txLoading && (
        <div className="self-center mt-6">
          <Hourglass
            visible={true}
            height="60"
            width="60"
            ariaLabel="hourglass-loading"
            wrapperStyle={{}}
            wrapperClass=""
            colors={["#ffffff", "#ffffff"]}
          />
        </div>
      )}
      {hash && (
        <div className="self-center mt-8 text-center">
          <p className="text-white font-semibold text-2xl">
            Verification completed.
          </p>
          <a
            href={`https://testnet.xrpl.org/transactions/${hash}/detailed`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 text-md"
          >
            See Transaction on the Explorer
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
