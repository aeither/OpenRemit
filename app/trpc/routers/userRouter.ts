import { db } from "@/db/drizzle";
import { contacts, transactions, users } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

export const userRouter = createTRPCRouter({
    me: publicProcedure.query(() => ({ name: "John Doe (Placeholder)" })), // Updated placeholder
    
    // Upserts a user based on their address
    upsertUser: publicProcedure // Renamed from createUser for clarity
        .input(z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"), // Added address validation
            // name: z.string().optional(), // Optionally allow setting name on upsert
        }))
        .mutation(async ({ input }) => {
            try {
                await db
                    .insert(users)
                    .values({
                        address: input.userAddress,
                        // name: input.name, // If name is passed
                        lastActive: new Date(),
                        // id, totalCredits, xp have defaults or are auto-generated
                    })
                    .onConflictDoUpdate({ // Changed to onConflictDoUpdate to update lastActive
                        target: users.address,
                        set: { lastActive: new Date() },
                    });

                const user = await db.query.users.findFirst({
                    where: eq(users.address, input.userAddress),
                });

                return {
                    success: true,
                    message: "User upserted successfully",
                    user: user, // Return the user data
                };
            } catch (error: any) {
                console.error("Failed to upsert user:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to upsert user: " + error.message,
                });
            }
        }),

    // Creates a new contact for a user
    createContact: publicProcedure
        .input(z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
            contactName: z.string().min(1, "Contact name cannot be empty"),
            contactAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
        }))
        .mutation(async ({ input }) => {
            const user = await db.query.users.findFirst({
                where: eq(users.address, input.userAddress),
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found. Cannot add contact.",
                });
            }

            try {
                const result = await db
                    .insert(contacts)
                    .values({
                        userId: user.id, // Use the user's UUID id
                        contactName: input.contactName,
                        contactAddress: input.contactAddress,
                        // createdAt and updatedAt have defaults
                    })
                    .onConflictDoNothing({ target: [contacts.userId, contacts.contactName] })
                    .returning(); // Get the inserted row or empty if conflict
                
                if (result.length === 0) {
                    // This means onConflictDoNothing was triggered
                    const existingContact = await db.query.contacts.findFirst({
                        where: and(eq(contacts.userId, user.id), eq(contacts.contactName, input.contactName))
                    });
                    return {
                        success: true,
                        message: "Contact with this name already exists for the user.",
                        contact: existingContact,
                    };
                }

                return {
                    success: true,
                    message: "Contact created successfully",
                    contact: result[0],
                };
            } catch (error: any) {
                console.error("Failed to create contact:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create contact: " + error.message,
                });
            }
        }),

    // Finds a contact's address by name for a given user
    findContactAddressByName: publicProcedure
        .input(z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
            contactName: z.string().min(1),
        }))
        .query(async ({ input }) => {
            const user = await db.query.users.findFirst({
                where: eq(users.address, input.userAddress),
            });

            if (!user) {
                // Depending on desired behavior, could return null or throw error
                // Returning null for queries is often preferred if "not found" is a valid state.
                return null;
            }

            const contact = await db.query.contacts.findFirst({
                where: and(eq(contacts.userId, user.id), eq(contacts.contactName, input.contactName)),
                columns: {
                    contactAddress: true,
                    contactName: true, // also returning name for context
                },
            });

            return contact ? { name: contact.contactName, address: contact.contactAddress } : null;
        }),

    // Lists all contacts for a given user
    listContacts: publicProcedure
        .input(z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
        }))
        .query(async ({ input }) => {
            const user = await db.query.users.findFirst({
                where: eq(users.address, input.userAddress),
                columns: { id: true }, // Only need user id
            });

            if (!user) {
                return []; // Return empty array if user not found
            }

            const userContacts = await db.query.contacts.findMany({
                where: eq(contacts.userId, user.id),
                columns: {
                    contactName: true,
                    contactAddress: true,
                    id: true, // Return id for potential keying on frontend
                },
                orderBy: (contacts, { asc }) => [asc(contacts.contactName)], // Order alphabetically
            });

            return userContacts.map(c => ({ id: c.id, name: c.contactName, address: c.contactAddress }));
        }),

    // Creates a new transaction
    createTransaction: publicProcedure
        .input(z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
            type: z.enum(["sent", "received"]),
            contactName: z.string().min(1),
            contactAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
            contactImage: z.string().optional(),
            amount: z.string().min(1, "Amount is required"),
            note: z.string().optional(),
            status: z.enum(["pending", "completed", "failed"]).default("completed"),
            txHash: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            const user = await db.query.users.findFirst({
                where: eq(users.address, input.userAddress),
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found. Cannot create transaction.",
                });
            }

            try {
                const result = await db
                    .insert(transactions)
                    .values({
                        userId: user.id,
                        type: input.type,
                        contactName: input.contactName,
                        contactAddress: input.contactAddress,
                        contactImage: input.contactImage,
                        amount: input.amount,
                        note: input.note,
                        status: input.status,
                        txHash: input.txHash,
                    })
                    .returning();

                return {
                    success: true,
                    message: "Transaction created successfully",
                    transaction: result[0],
                };
            } catch (error: any) {
                console.error("Failed to create transaction:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create transaction: " + error.message,
                });
            }
        }),

    // Lists recent transactions for a user
    listTransactions: publicProcedure
        .input(z.object({
            userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
            limit: z.number().min(1).max(100).default(20),
        }))
        .query(async ({ input }) => {
            const user = await db.query.users.findFirst({
                where: eq(users.address, input.userAddress),
                columns: { id: true },
            });

            if (!user) {
                return []; // Return empty array if user not found
            }

            const userTransactions = await db.query.transactions.findMany({
                where: eq(transactions.userId, user.id),
                orderBy: desc(transactions.createdAt),
                limit: input.limit,
            });

            return userTransactions.map(tx => ({
                id: tx.id,
                type: tx.type,
                contactName: tx.contactName,
                contactAddress: tx.contactAddress,
                contactImage: tx.contactImage,
                amount: tx.amount,
                note: tx.note,
                status: tx.status,
                txHash: tx.txHash,
                createdAt: tx.createdAt,
            }));
        }),
});
