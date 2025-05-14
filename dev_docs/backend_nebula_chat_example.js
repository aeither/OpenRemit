const { createThirdwebClient } = require("thirdweb");
const { sepolia, mantle } = require("thirdweb/chains"); // Assuming you might want to define mantle here too if not passed explicitly

// Function to get chain object by ID, add more chains as needed
function getChainById(chainId) {
  if (chainId === sepolia.id) return sepolia;
  // Define Mantle mainnet similarly to how you did on the frontend if needed
  if (chainId === 5000) return {
    id: 5000, 
    name: "Mantle", 
    rpc: "https://rpc.mantle.xyz",
    // ... other mantle properties if required by prepareTransaction later
  }; 
  // Add other supported chains here
  console.warn(`Chain with ID ${chainId} not explicitly defined in backend getChainById. Using generic object.`);
  return { id: chainId }; // Fallback for prepareTransaction
}

// This client is for backend use with a secret key
const thirdwebBackendClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

async function handleNebulaChat(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, sessionId, chainId } = req.body;

  if (!process.env.THIRDWEB_SECRET_KEY) {
    console.error("THIRDWEB_SECRET_KEY is not set in the backend environment.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  if (!message || !sessionId || chainId === undefined) {
    return res.status(400).json({ error: "Missing message, sessionId, or chainId" });
  }

  try {
    const nebulaAPIResponse = await fetch("https://nebula-api.thirdweb.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": process.env.THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        message,
        sessionId,
        context: {
          chainIds: [chainId], // Nebula can use this for context
          walletAddress: sessionId, // sessionId is the user's wallet address
        },
        stream: false,
      }),
    });

    const responseData = await nebulaAPIResponse.json();

    if (!nebulaAPIResponse.ok) {
      console.error("Nebula API error:", responseData);
      return res.status(nebulaAPIResponse.status).json({ error: responseData.error || "Nebula API request failed" });
    }
    
    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Error in /api/nebula/chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { handleNebulaChat, getChainById, thirdwebBackendClient }; 