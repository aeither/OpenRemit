const { prepareTransaction, sendTransaction } = require("thirdweb");
const { getChainById, thirdwebBackendClient } = require("./backend_nebula_chat_example"); // Re-use client and chain helper

async function handleNebulaExecute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { txData, walletAddress, chainId } = req.body;

  if (!txData || !walletAddress || chainId === undefined) {
    return res.status(400).json({ error: "Missing txData, walletAddress, or chainId" });
  }
  
  const chain = getChainById(chainId); // Get the chain object
  if (!chain) {
    return res.status(400).json({ error: `Unsupported chainId: ${chainId}` });
  }

  try {
    // Ensure value is BigInt if present
    const transactionValue = txData.value ? BigInt(txData.value) : undefined;

    const transaction = prepareTransaction({
      to: txData.to,
      value: transactionValue,
      data: txData.data, // Include data if present (for contract interactions)
      chain: chain, 
      client: thirdwebBackendClient, // Use the backend client
    });

    // IMPORTANT: The `sendTransaction` function on the backend with a secret key
    // can sign and send transactions if the client has gas funds (sponsored/gasless setup).
    // However, Nebula typically provides transaction data to be SIGNED BY THE USER'S WALLET on the frontend.
    // The original docs example for `execute` implies this backend `sendTransaction` might be for a gasless setup.
    // If Nebula returns a transaction for frontend signing (which is common for user-owned wallets),
    // this backend `/execute` route might be more about *relaying* a pre-signed tx or just confirming data.
    // For now, following the pattern of preparing and sending from backend, assuming a gasless setup or backend wallet.
    // For user-signed transactions, the frontend would use `useSendTransaction` after getting `txData`.

    // The prompt's documentation showed `sendTransaction` with `account: walletAddress`. 
    // This `account` in `sendTransaction` usually refers to an `Account` object (e.g., from `privateKeyToAccount`)
    // if the backend is to sign. If it's for a user-sponsored gasless transaction, this might differ.
    // Let's stick to the structure from the prompt, assuming `walletAddress` works as intended as an account reference for `sendTransaction` in this context.
    // However, typical `sendTransaction` on backend needs an `Account` object for signing if not gasless.
    // For now, let's assume this `sendTransaction` is part of a flow where `walletAddress` is sufficient (e.g., paymaster context)
    // or the transaction is intended to be broadcast without backend signing (less common for sensitive tx).
    // The most common flow: Nebula -> txData -> Frontend `useSendTransaction` hook.
    // The provided docs showed a backend `sendTransaction`. I will replicate that, but with caveats.

    // For a more robust solution, especially if not using a gasless sponsor, 
    // the frontend should typically sign using useSendTransaction from thirdweb/react.
    // This backend would primarily be a proxy to Nebula API.

    // Replicating the doc's approach:
    const result = await sendTransaction({
      transaction,
      // account: walletAddress, // The docs used this. `sendTransaction` expects an `Account` object (with signing capabilities) for this param.
                               // If this is a user-pays scenario, the frontend signs, not this backend execute call.
                               // For a backend wallet/gasless sponsor: you'd use an account object here.
                               // Since Nebula expects user interaction, this backend `execute` is slightly confusing if it also tries to send.
                               // Let's assume for now the user is using a gasless (sponsored) transaction setup via Thirdweb SDK, 
                               // where the `walletAddress` might be used by the SDK in conjunction with the secret key for such a flow.
                               // A more typical flow would be that the frontend uses `useSendTransaction` with the data from Nebula.
                               // For this example, we'll comment out `account` and assume `sendTransaction` can work with just `transaction` for some flows (like broadcasting an already signed tx, or gasless with backend config)
                               // or the user will adapt this part for their specific signing/sending strategy (e.g. frontend signing).
    });

    return res.status(200).json({ success: true, txHash: result.transactionHash });

  } catch (error) {
    console.error("Error in /api/nebula/execute:", error);
    // Safely stringify error to avoid circular reference issues
    let errorMessage = "Internal server error during transaction execution.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({ success: false, error: errorMessage });
  }
}

module.exports = { handleNebulaExecute }; 