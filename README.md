# OpenRemit

**One-liner:** Your family's friendly AI assistant for easy and safe digital money management.

**Brief description:** OpenRemit takes the headache out of digital payments. Imagine effortlessly sending money to your kids or family members just by talking or typing, like chatting with a helpful assistant. It’s designed for busy parents who want a secure and super-simple way to handle digital funds, even if you're new to web3.

# DEMO

https://openremit.netlify.app/

## Overview

Managing digital money for your family can feel complicated. OpenRemit changes that by introducing a friendly AI assistant that understands your everyday language. Want to send allowance to your daughter, Sarah, or pay for your son Alex's online course? Just tell OpenRemit, for example, "send 10 MNT to Sarah."

Here’s how OpenRemit makes your life easier:

*   **Simple Wallet Connection:** Securely link your digital wallet in a few clicks.
*   **AI Chat & Voice Assistant:** Our smart assistant (powered by Thirdweb Nebula AI) is ready for your typed or voice commands. No more confusing addresses!
*   **Clear Balance View:** Always know how much digital money you have available.
*   **Quick Family Transfers:** Easily send funds to your saved family contacts.
*   **Transaction History:** Keep track of all your family payments in one place.
*   *(Coming Soon) Recurring Payments:* Set up regular allowances or payments effortlessly.
*   *(Coming Soon) Smart Suggestions:* Get helpful reminders for upcoming family expenses.
*   *(Coming Soon) Easy On/Off Ramps:* Seamlessly move money between your bank and digital wallet.

Behind the scenes, OpenRemit securely manages a contact list where you can save family members' details. When you ask the AI to send money to "Dad," it intelligently finds Dad's saved digital address, making the process safe and error-free.

## Problem It Solves

For parents, managing digital money—whether it's for allowances, gifts, or helping family members—can bring new worries and complexities:

1.  **Fear of Mistakes:** Those long, cryptic digital addresses are confusing! It's easy to worry about sending money to the wrong place. OpenRemit’s AI and contact list drastically reduce this risk. You can use familiar names like "Mom" or "Alex," and our AI helps ensure it goes to the right person.
2.  **Complexity of Web3:** The world of digital currencies can seem like it's only for tech experts. OpenRemit provides an easy-to-use interface that feels as natural as sending a text message, making digital finance accessible to everyone in the family.
3.  **Time-Consuming Processes:** Traditional international remittances can be slow and costly. While OpenRemit starts with on-chain crypto, its AI-driven approach simplifies the steps involved in any digital transfer.
4.  **Teaching Financial Responsibility:** As kids grow, teaching them about digital money is important. OpenRemit’s clear interface and transaction history can be a helpful tool for families navigating digital finance together.
5.  **Bridging Digital and Traditional Money:** (Looking ahead) Moving money between your bank account and digital wallet shouldn’t be a chore. OpenRemit aims to make this seamless.

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
    *   The UI is built with React, TypeScript, and Shadcn/UI components, focusing on ease of use.
    *   TanStack Router handles client-side navigation and route definitions (`app/routes/`).
    *   The `NebulaIntegration.tsx` component interfaces directly with Thirdweb's `Nebula.chat()` SDK for AI-driven transaction flows, after an initial intent parsing step.
    *   Wallet connectivity is managed by Thirdweb's React hooks.
    *   Client-side state and API calls to the tRPC backend are managed using TanStack Query and a tRPC client.
    *   Voice command processing and synthesis for hands-free operation.

2.  **API Layer (`app/trpc/` directory):**
    *   tRPC is used to create a type-safe API between the frontend and backend logic.
    *   `userRouter.ts`: Manages user creation/updates and CRUD operations for user-specific contacts (e.g., family member name-to-address mappings).
    *   `aiRouter.ts`: Contains procedures for advanced AI processing. For example, `parseUserIntentForNebula` takes raw user chat input or voice commands, uses an LLM (via Vercel AI SDK and Groq) to understand the intent and extract entities. If a contact name is mentioned (e.g., "send to Dad"), it calls the `userRouter` to resolve "Dad" to a blockchain address before the information is passed to the client-side Nebula AI.

3.  **Database (`app/db/` directory):**
    *   Drizzle ORM is used to define the schema (`schema.ts`) and interact with the PostgreSQL database.
    *   Key tables include `users` (stores user addresses and IDs) and `contacts` (stores user-specific name-address mappings).

4.  **External Services:**
    *   **Thirdweb:** Provides client IDs, wallet connection UI, and the Nebula AI service for understanding and preparing blockchain transactions from natural language.
    *   **Groq:** Serves as the LLM provider for the `aiRouter` to perform initial intent parsing and entity extraction before interacting with Nebula or other services.
    *   **Fiat Gateways:** (Future) Integration with payment processors for onramp and offramp capabilities.

**Flow Example (Sending money to a family member):**

1.  Mom wants to send some digital pocket money. She opens OpenRemit and tells the AI assistant, "Send Alex 10 MNT for his game."
2.  The app securely sends this request (and Mom's user identifier) to OpenRemit's `aiRouter`.
3.  The `aiRouter` (using Groq) understands: Mom wants to send 10 MNT to someone named "Alex".
4.  The `aiRouter` then asks the `userRouter`: "Who is 'Alex' in Mom's contact list?"
5.  The `userRouter` checks the database and finds Alex's saved digital address (e.g., `0xXYZ...`).
6.  The `aiRouter` tells the app: "Okay, you want to send 10 MNT to `0xXYZ...` (Alex)."
7.  The app now clearly instructs Nebula AI: "Prepare a transaction to send 10 MNT to `0xXYZ...`."
8.  Nebula AI prepares the transaction details.
9.  Mom sees a simple confirmation on her screen and approves the payment with a secure click in her connected wallet.

## Getting Started

(To be filled in: Instructions on cloning, .env setup, installing dependencies, running the dev server, database setup, etc.)

## Contributing

(To be filled in: Guidelines for contributors.)

## License

(To be filled in: e.g., MIT License.)
