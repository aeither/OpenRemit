import { groq } from '@ai-sdk/groq';
import { TRPCError } from '@trpc/server';
import { generateObject } from "ai";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { userRouter } from "./userRouter"; // Import userRouter for creating a caller

// Define a schema for transaction intent parsing
const transactionIntentSchema = z.object({
  isTransaction: z.boolean().describe("Is the user trying to initiate a blockchain transaction like sending tokens?"),
  recipientName: z.string().optional().describe("The name of the recipient if a name is mentioned (e.g., 'Dad', 'Alex')."),
  recipientAddress: z.string().optional().describe("The direct blockchain address if mentioned by the user."),
  amount: z.string().optional().describe("The amount of tokens to send (e.g., '0.1', '100')."),
  tokenSymbol: z.string().optional().describe("The symbol of the token (e.g., 'MNT', 'ETH', 'USDC')."),
  actionVerb: z.string().optional().describe("The verb indicating the transaction (e.g., 'send', 'transfer', 'give')."),
  fullUserQuery: z.string().describe("The original, unmodified user query.")
});

export const aiRouter = createTRPCRouter({
  evaluateMessage: publicProcedure
    .input(z.object({ 
      chatId: z.string(), // This might be userAddress or a session ID depending on context
      message: z.string() 
    }))
    .mutation(async ({ input }) => {
      try {
        const { object } = await generateObject({
          model: groq('qwen-qwq-32b'), // Updated model, ensure it's available/suitable
          // output: 'object', // No longer needed for generateObject in newer Vercel AI SDK versions
          schema: z.object({
            intent: z.enum(['quiz_scheduling', 'quiz_now', 'general']).describe("Categorize user message for educational quiz intent."),
            content: z.string().optional().describe('Educational content for the quiz.'),
            days: z.number().optional().describe('Number of days for scheduled quizzes.'),
          }),
          prompt: input.message,
          system: `You are an AI assistant that categorizes user messages for an educational app into intents: quiz_scheduling, quiz_now, or general. Extract content and days if applicable.`,
        });

        return {
          intent: object.intent,
          content: object.content,
          days: object.days
        };
      } catch (error) {
        console.error('Error evaluating message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to evaluate message',
        });
      }
    }),

  // New procedure to parse user input for Nebula, potentially resolving contact names
  parseUserIntentForNebula: publicProcedure
    .input(z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      userMessage: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { object: parsedIntent } = await generateObject({
          model: groq('qwen-qwq-32b'), // Using a capable model
          schema: transactionIntentSchema,
          prompt: input.userMessage,
          system: `You are an AI that analyzes user messages to identify if they intend to make a blockchain transaction. 
          Extract details like recipient (name or address), amount, and token. 
          If a name is mentioned as a recipient, set recipientName. 
          If an address (e.g. 0x...) is mentioned, set recipientAddress. 
          Capture the original user query in fullUserQuery. 
          Prioritize recipientName if both name and address seem present for the same entity. 
          For example, 'send 0.1 MNT to Dad (0x123...)' -> recipientName: 'Dad'. 'send 0.1 MNT to 0x123...' -> recipientAddress: '0x123...'.`,
        });

        if (parsedIntent.isTransaction && parsedIntent.recipientName && !parsedIntent.recipientAddress) {
          // Create a caller for the userRouter
          const userOp = userRouter.createCaller(ctx);
          const contactInfo = await userOp.findContactAddressByName({
            userAddress: input.userAddress,
            contactName: parsedIntent.recipientName,
          });

          if (contactInfo && contactInfo.address) {
            // Construct the modified message for Nebula
            // This is a simple replacement; more sophisticated templating could be used.
            const modifiedMessage = input.userMessage.replace(
              new RegExp(parsedIntent.recipientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), // Escape regex special chars in name
              contactInfo.address
            );
            return {
              success: true,
              originalMessage: input.userMessage,
              modifiedMessage: modifiedMessage,
              parsedIntent,
              contactFound: true,
              resolvedAddress: contactInfo.address,
              messageForNebula: modifiedMessage,
            };
          } else {
            return {
              success: false,
              originalMessage: input.userMessage,
              parsedIntent,
              contactFound: false,
              error: `Contact '${parsedIntent.recipientName}' not found. Please add them to your contacts or provide their address.`,
              messageForNebula: input.userMessage, // Fallback to original message
            };
          }
        } else if (parsedIntent.isTransaction && parsedIntent.recipientAddress) {
           return {
            success: true,
            originalMessage: input.userMessage,
            parsedIntent,
            contactFound: true, // Assuming direct address is valid
            resolvedAddress: parsedIntent.recipientAddress,
            messageForNebula: input.userMessage, // No modification needed if address is already there
          };
        }
        
        // If not a transaction, or if it's a transaction but no specific action needed here (e.g. already has address)
        return {
          success: true, 
          originalMessage: input.userMessage,
          parsedIntent,
          messageForNebula: input.userMessage, // Default to original message
        };

      } catch (error) {
        console.error('Error parsing user intent for Nebula:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to parse user intent',
        });
      }
    }),
});
