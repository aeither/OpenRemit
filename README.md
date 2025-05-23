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
*   **Quick Family Transfers:** Easily send funds to your saved family contacts with an intuitive contact selection interface.
*   **Real-Time Transaction History:** All your family payments are automatically stored and displayed with smart date formatting ("Just now", "2 hours ago", etc.).
*   **Instant Feedback:** Get immediate success or error notifications for every transaction.
*   **Smart Contact Management:** Save family members once, then simply select them from an easy dropdown when sending money.
*   **Database-Backed Storage:** All transactions are securely stored with full details including amounts, notes, and recipient information.
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
    *   tRPC (with transaction management and user procedures)
*   **Database:**
    *   PostgreSQL (for persistent data storage)
    *   Drizzle ORM (for database access and schema management)
    *   Full transaction history with user relations
    *   Contact management with address mapping
*   **AI & NLP:**
    *   Vercel AI SDK
    *   Groq (as the LLM provider for intent parsing and other AI tasks)
    *   Thirdweb Nebula AI (for core transaction understanding and execution proposal)
    *   Speech-to-Text and Text-to-Speech APIs (for voice command support)
*   **UI/UX:**
    *   Sonner (for toast notifications)
    *   Skeleton loading states
    *   Responsive design with dark mode support
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
    *   `userRouter.ts`: Manages user creation/updates, CRUD operations for user-specific contacts (e.g., family member name-to-address mappings), transaction creation, and transaction history retrieval with real-time cache invalidation.
    *   `aiRouter.ts`: Contains procedures for advanced AI processing. For example, `parseUserIntentForNebula` takes raw user chat input or voice commands, uses an LLM (via Vercel AI SDK and Groq) to understand the intent and extract entities. If a contact name is mentioned (e.g., "send to Dad"), it calls the `userRouter` to resolve "Dad" to a blockchain address before the information is passed to the client-side Nebula AI.

3.  **Database (`app/db/` directory):**
    *   Drizzle ORM is used to define the schema (`schema.ts`) and interact with the PostgreSQL database.
    *   Key tables include:
        *   `users` (stores user addresses and IDs)
        *   `contacts` (stores user-specific name-address mappings)
        *   `transactions` (stores complete transaction history with amounts, notes, status, timestamps, and user relations)

4.  **External Services:**
    *   **Thirdweb:** Provides client IDs, wallet connection UI, and the Nebula AI service for understanding and preparing blockchain transactions from natural language.
    *   **Groq:** Serves as the LLM provider for the `aiRouter` to perform initial intent parsing and entity extraction before interacting with Nebula or other services.
    *   **Fiat Gateways:** (Future) Integration with payment processors for onramp and offramp capabilities.

**Flow Example (Sending money to a family member):**

1.  Mom wants to send some digital pocket money. She opens OpenRemit and either tells the AI assistant "Send Alex 10 MNT for his game" or uses the Send Money modal to select Alex from her contacts.
2.  **AI Route**: The app securely sends this request (and Mom's user identifier) to OpenRemit's `aiRouter`, which uses Groq to understand the intent and resolve "Alex" to his blockchain address via the `userRouter`.
3.  **Manual Route**: Mom selects Alex from an easy dropdown in the Send Money modal, enters the amount and optional note.
4.  Either way, the transaction details are prepared and Mom sees a clear confirmation showing Alex's name, amount ($10), and any note.
5.  When Mom confirms, the transaction is immediately saved to the database with all details (amount, recipient, note, timestamp, status).
6.  Mom gets an instant success notification: "Transaction recorded successfully! 💰"
7.  The transaction appears immediately in her transaction history with smart formatting ("Just now") and Alex's avatar.
8.  The transaction list auto-refreshes to show the new payment alongside previous family transactions.

## Getting Started

(To be filled in: Instructions on cloning, .env setup, installing dependencies, running the dev server, database setup, etc.)

## Contributing

(To be filled in: Guidelines for contributors.)

## License

(To be filled in: e.g., MIT License.)
