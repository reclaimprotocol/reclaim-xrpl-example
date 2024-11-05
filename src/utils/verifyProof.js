import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { ethers } from "ethers";

// Function to create and structure claim info data
function createClaimInfoData(claimInfo) {
  let claimInfoData = `${claimInfo.provider}\n`;
  claimInfoData += `${claimInfo.parameters}\n`;
  claimInfoData += `${claimInfo.context}`;

  return claimInfoData;
}

// Function to process identifier
function processIdentifier(identifier) {
  // Remove '0x' if present and convert to Uint8Array using ethers
  return ethers.utils.arrayify(identifier);
}

// Function to recover signers of the signed claim
function recoverSignersOfSignedClaim(proof) {
  const messageHash = ethers.utils.hashMessage(JSON.stringify(proof.claimData));
  const signedWitnesses = proof.signatures.map((signature) =>
    ethers.utils.recoverPublicKey(messageHash, signature)
  );
  return signedWitnesses;
}

// Function to check for duplicate signatures
function containsDuplicates(array) {
  return new Set(array).size !== array.length;
}

// Function to validate that all signed witnesses are expected
function areAllSignedWitnessesValid(signedWitnesses, expectedWitnesses) {
  return expectedWitnesses.every((witness) =>
    signedWitnesses.includes(witness.id)
  );
}

// Main function to verify proof
export async function verifyProof(proof) {
  try {
    // Ensure proof has signatures
    if (!proof.signatures || proof.signatures.length === 0) {
      throw new Error("No signatures in the proof");
    }

    // Create and hash the structured claim info data
    const claimInfoData = createClaimInfoData(proof.claimData);
    const hash = keccak256(toUtf8Bytes(claimInfoData));

    // Format the identifier
    const formattedIdentifier = processIdentifier(proof.claimData.identifier);

    // Ensure the hashed claim data matches the identifier
    if (
      ethers.utils.hexlify(hash) !== ethers.utils.hexlify(formattedIdentifier)
    ) {
      throw new Error("Hashed Claim info doesn't match the Identifier");
    }

    // Fetch expected witnesses (mocked for now)
    const expectedWitnesses = await fetchWitnessesForClaim(
      proof.claimData.identifier,
      proof.claimData.epoch
    );

    // Recover the signers from the signed claim
    const signedWitnesses = recoverSignersOfSignedClaim(proof);

    // Check for duplicate signatures
    if (containsDuplicates(signedWitnesses)) {
      throw new Error("Duplicate signatures found");
    }

    // Validate the signed witnesses against expected witnesses
    if (signedWitnesses.length !== expectedWitnesses.length) {
      throw new Error("Invalid witness found in signed witnesses");
    }

    return true;
  } catch (error) {
    console.error("Verification failed: ", error);
    throw error;
  }
}

async function fetchWitnessesForClaim() {
  return [{ id: "0x244897572368eadf65bfbc5aec98d8e5443a9072" }];
}
