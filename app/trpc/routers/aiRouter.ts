import { groq } from '@ai-sdk/groq';
import { TRPCError } from '@trpc/server';
import { generateObject } from "ai";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { userRouter } from "./userRouter"; // Import userRouter for creating a caller

// Simple schema to just extract recipient name
const recipientNameSchema = z.object({
  recipientName: z.string().nullable().describe("The name of the recipient if a name is mentioned (e.g., 'Dad', 'Alex', 'mom'). Return null if no name is found or if it's already an address."),
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
          model: groq('meta-llama/llama-4-scout-17b-16e-instruct'), // Updated model, ensure it's available/suitable
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

  // Simple procedure to extract recipient name and replace with address
  parseUserIntentForNebula: publicProcedure
    .input(z.object({
      userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      userMessage: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Extract recipient name using AI
        const { object } = await generateObject({
          model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
          schema: recipientNameSchema,
          prompt: input.userMessage,
          system: `Extract the recipient name from the user message. Look for names like 'dad', 'mom', 'Alex', 'John', etc. 
          Return null if no name is found or if it's already a blockchain address (starts with 0x).
          Examples: 
          "send 2 MNT to dad" -> recipientName: "dad"
          "send 5 ETH to Alex" -> recipientName: "Alex" 
          "send 1 USDC to 0x123..." -> recipientName: null`,
        });

        // If no recipient name found, return original message
        if (!object.recipientName) {
          return {
            success: true,
            messageForNebula: input.userMessage,
          };
        }

        // Create a caller for the userRouter to look up contact address
        const userCaller = userRouter.createCaller(ctx);
        const contactInfo = await userCaller.findContactAddressByName({
          userAddress: input.userAddress,
          contactName: object.recipientName,
        });

        if (!contactInfo?.address) {
          return {
            success: false,
            error: `Contact '${object.recipientName}' not found. Please add them to your contacts first.`,
            messageForNebula: input.userMessage,
          };
        }

        // Replace the name with the address using regex
        const modifiedMessage = input.userMessage.replace(
          new RegExp(object.recipientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          contactInfo.address
        );

        return {
          success: true,
          messageForNebula: modifiedMessage,
          contactName: object.recipientName,
          resolvedAddress: contactInfo.address,
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
