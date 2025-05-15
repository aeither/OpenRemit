# OpenRemit

**One-liner:** AI-powered, user-friendly web3 remittance and payment application.

**Brief description:** OpenRemit simplifies crypto payments using an AI assistant. Users can interact via natural language and voice commands to send tokens to contacts or addresses on supported chains like Mantle. It's designed for anyone looking for an easier way to manage and send digital assets, with seamless onramp and offramp capabilities.

## Overview

OpenRemit aims to make web3 payments and remittances intuitive and accessible. The core of the application is an AI-powered chat interface (powered by Thirdweb Nebula AI) that allows users to perform actions using natural language commands. For instance, a user can say, "send 0.1 MNT to Dad," and the system will parse this intent, look up "Dad" in the user's saved contacts to find the corresponding blockchain address, and then prepare the transaction for the user to sign with their connected wallet.

The application features a modern UI with components for:

*   Connecting a web3 wallet (via Thirdweb)
*   An AI assistant button that opens the Nebula chat interface
*   Voice command support for hands-free operation
*   Displaying available balance
*   Quick transfers to saved contacts
*   Viewing recent transactions
*   Managing recurring payments (future)
*   Smart suggestions for payments (future)
*   Fiat onramp and offramp integration (future)

The backend uses tRPC to manage user data, including a contact list where users can associate names with blockchain addresses. This contact list is crucial for the AI to resolve recipient names to addresses.

## Problem It Solves

Sending cryptocurrencies can be intimidating for many users due to long, complex wallet addresses and the technical nature of blockchain transactions. OpenRemit addresses this by:

1.  **Simplifying Transactions:** Allowing users to initiate payments using natural language and voice commands through an AI assistant.
2.  **User-Friendly Contact Management:** Enabling users to save contacts with familiar names, abstracting away raw blockchain addresses for common transactions.
3.  **Reducing Errors:** Minimizing the risk of sending funds to the wrong address by using a contact list and AI-assisted parsing.
4.  **Improving Accessibility:** Making web3 payments more approachable for a broader audience, not just crypto-savvy individuals.
5.  **Seamless Fiat Integration:** Providing easy onramp and offramp capabilities to bridge traditional and digital finance.

## Tech Stack

*   **Frontend:**
    *   React
    *   TypeScript
    *   TanStack Router (for routing)
    *   TanStack Query (for server state management)
    *   Tailwind CSS (for styling)
    *   Shadcn/UI (for UI components)
    *   Vite (build tool, via TanStack Start template)
*   **Web3 Integration:**
    *   Thirdweb SDK (Wallet Connection, Nebula AI client-side integration, smart contracts interaction)
*   **Backend (API Layer):**
    *   tRPC
*   **Database:**
    *   PostgreSQL (assumed, based on Drizzle `pgTable` usage)
    *   Drizzle ORM (for database access and schema management)
*   **AI & NLP:**
    *   Vercel AI SDK
    *   Groq (as the LLM provider for intent parsing and other AI tasks)
    *   Thirdweb Nebula AI (for core transaction understanding and execution proposal)
    *   Speech-to-Text and Text-to-Speech APIs (for voice command support)
*   **Package Manager:** pnpm

## Architecture

OpenRemit follows a modern full-stack TypeScript architecture:

1.  **Client (Browser - `app/` directory):**
    *   The UI is built with React, TypeScript, and Shadcn/UI components.
    *   TanStack Router handles client-side navigation and route definitions (`app/routes/`).
    *   The `NebulaIntegration.tsx` component interfaces directly with Thirdweb's `Nebula.chat()` SDK for AI-driven transaction flows, after an initial intent parsing step.
    *   Wallet connectivity is managed by Thirdweb's React hooks.
    *   Client-side state and API calls to the tRPC backend are managed using TanStack Query and a tRPC client.
    *   Voice command processing and synthesis for hands-free operation.

2.  **API Layer (`app/trpc/` directory):**
    *   tRPC is used to create a type-safe API between the frontend and backend logic.
    *   `userRouter.ts`: Manages user creation/updates and CRUD operations for user-specific contacts (name-to-address mappings).
    *   `aiRouter.ts`: Contains procedures for advanced AI processing. For example, `parseUserIntentForNebula` takes raw user chat input or voice commands, uses an LLM (via Vercel AI SDK and Groq) to understand the intent and extract entities. If a contact name is mentioned (e.g., "send to Dad"), it calls the `userRouter` to resolve "Dad" to a blockchain address before the information is passed to the client-side Nebula AI.

3.  **Database (`app/db/` directory):**
    *   Drizzle ORM is used to define the schema (`schema.ts`) and interact with the PostgreSQL database.
    *   Key tables include `users` (stores user addresses and IDs) and `contacts` (stores user-specific name-address mappings).

4.  **External Services:**
    *   **Thirdweb:** Provides client IDs, wallet connection UI, and the Nebula AI service for understanding and preparing blockchain transactions from natural language.
    *   **Groq:** Serves as the LLM provider for the `aiRouter` to perform initial intent parsing and entity extraction before interacting with Nebula or other services.
    *   **Fiat Gateways:** Integration with payment processors for onramp and offramp capabilities.

**Flow Example (Sending a payment via AI):**

1.  User says "send 0.1 MNT to Mom" or types it in the `NebulaIntegration` chat.
2.  The client calls the `parseUserIntentForNebula` tRPC procedure in `aiRouter.ts` with the message and current user's address.
3.  `aiRouter` uses an LLM (Groq) to parse the intent: `isTransaction: true`, `recipientName: "Mom"`, `amount: "0.1"`, `token: "MNT"`.
4.  `aiRouter` calls `findContactAddressByName` in `userRouter.ts` to look up "Mom" for the current user.
5.  `userRouter` queries the database via Drizzle to find Mom's address (e.g., `0xABC...`).
6.  `aiRouter` returns the resolved address and a potentially modified message (e.g., "send 0.1 MNT to 0xABC...") to the client.
7.  If successful, `NebulaIntegration.tsx` then calls `Nebula.chat()` with this resolved message.
8.  Nebula AI processes this specific instruction and proposes a transaction.
9.  The user signs the transaction in their wallet via Thirdweb components.

## Getting Started

(To be filled in: Instructions on cloning, .env setup, installing dependencies, running the dev server, database setup, etc.)

## Contributing

(To be filled in: Guidelines for contributors.)

## License

(To be filled in: e.g., MIT License.)
