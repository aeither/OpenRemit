import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRouter } from './userRouter'; // Assuming the compiled router is exported
import { TRPCError } from '@trpc/server';
import { type DrizzleDb } from '@/db/drizzle'; // Assuming DrizzleDb type is exported

// Mock the db module
const mockDb: DrizzleDb = {
  query: {
    users: {
      findFirst: vi.fn(),
    },
    contacts: {
      findFirst: vi.fn(), // Though not directly used by deleteContact, good to have for consistency
      findMany: vi.fn(),  // Though not directly used by deleteContact
    },
  },
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockReturnThis(),
  onConflictDoNothing: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  delete: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  // Add other methods if needed by other router functions being tested
} as unknown as DrizzleDb; // Cast to DrizzleDb, acknowledging it's a partial mock

vi.mock('@/db/drizzle', () => ({
  db: mockDb,
}));

// Helper to directly call the mutation
const caller = userRouter.createCaller({ db: mockDb } as any); // Context for the caller

describe('userRouter - deleteContact', () => {
  const mockUser = {
    id: 'user_uuid_1',
    address: '0xUserAddress1',
    name: 'Test User 1',
    lastActive: new Date(),
    totalCredits: 10,
    xp: 100,
  };

  const mockContact = {
    id: 'contact_uuid_1',
    userId: mockUser.id,
    contactName: 'Test Contact 1',
    contactAddress: '0xContactAddress1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Default successful mock for db.delete().where().returning()
    // This can be overridden in specific tests if a different behavior is needed.
    // Ensure 'returning' itself is a function that can be called.
    const mockReturningChain = { returning: vi.fn() };
    const mockWhereChain = { where: vi.fn().mockReturnValue(mockReturningChain) };
    mockDb.delete = vi.fn().mockReturnValue(mockWhereChain as any);

    // Assign the mock for returning specifically
    // @ts-ignore
    mockDb.delete().where().returning = mockReturningChain.returning;

  });

  it('should successfully delete a contact', async () => {
    // Mock db.query.users.findFirst to return the user
    vi.spyOn(mockDb.query.users, 'findFirst').mockResolvedValue(mockUser);
    
    // Mock db.delete().where().returning() to indicate successful deletion
    // @ts-ignore
    vi.spyOn(mockDb.delete().where(), 'returning').mockResolvedValue([{ id: mockContact.id }]);


    const input = {
      userAddress: mockUser.address,
      contactId: mockContact.id,
    };

    const result = await caller.deleteContact(input);

    expect(mockDb.query.users.findFirst).toHaveBeenCalledWith({
      where: expect.any(Function), // eq(users.address, input.userAddress)
      columns: { id: true },
    });
    expect(mockDb.delete).toHaveBeenCalledWith(expect.anything()); // expect.anything() for the schema table
    // @ts-ignore
    expect(mockDb.delete().where().returning).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'Contact deleted successfully',
      deletedContactId: mockContact.id,
    });
  });

  it('should throw NOT_FOUND if the contact does not exist for the user', async () => {
    // Mock db.query.users.findFirst to return the user
    vi.spyOn(mockDb.query.users, 'findFirst').mockResolvedValue(mockUser);

    // Mock db.delete().where().returning() to return an empty array (contact not found)
    // @ts-ignore
    vi.spyOn(mockDb.delete().where(), 'returning').mockResolvedValue([]);

    const input = {
      userAddress: mockUser.address,
      contactId: 'non_existent_contact_uuid',
    };

    await expect(caller.deleteContact(input)).rejects.toThrowError(
      new TRPCError({
        code: 'NOT_FOUND',
        message: 'Contact not found or does not belong to this user.',
      })
    );
    expect(mockDb.query.users.findFirst).toHaveBeenCalledTimes(1);
    // @ts-ignore
    expect(mockDb.delete().where().returning).toHaveBeenCalledTimes(1);
  });

  it('should throw NOT_FOUND if the user does not exist', async () => {
    // Mock db.query.users.findFirst to return undefined (user not found)
    vi.spyOn(mockDb.query.users, 'findFirst').mockResolvedValue(undefined);

    const input = {
      userAddress: '0xNonExistentUserAddress',
      contactId: mockContact.id,
    };

    await expect(caller.deleteContact(input)).rejects.toThrowError(
      new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found. Cannot delete contact.',
      })
    );
    expect(mockDb.query.users.findFirst).toHaveBeenCalledTimes(1);
    expect(mockDb.delete).not.toHaveBeenCalled(); // Delete should not be called if user is not found
  });
  
  it('should throw NOT_FOUND when attempting to delete a contact that belongs to a different user', async () => {
    // This scenario is functionally identical to "contact does not exist for the user"
    // because the delete operation includes `eq(contacts.userId, user.id)`.
    // So, if contactId is valid but for another user, it won't be found for *this* user.

    const anotherUser = { ...mockUser, id: 'user_uuid_2', address: '0xAnotherUserAddress' };
    // mockContact.userId still belongs to mockUser.id

    // Mock db.query.users.findFirst to return the *attempting* user (anotherUser)
    vi.spyOn(mockDb.query.users, 'findFirst').mockResolvedValue(anotherUser);

    // Mock db.delete().where().returning() to return an empty array,
    // as contact_uuid_1 does not belong to user_uuid_2
    // @ts-ignore
    vi.spyOn(mockDb.delete().where(), 'returning').mockResolvedValue([]);
    
    const input = {
      userAddress: anotherUser.address, // The user attempting the delete
      contactId: mockContact.id,      // Contact ID belonging to mockUser
    };

    await expect(caller.deleteContact(input)).rejects.toThrowError(
      new TRPCError({
        code: 'NOT_FOUND',
        message: 'Contact not found or does not belong to this user.',
      })
    );
    expect(mockDb.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function), // eq(users.address, anotherUser.address)
        columns: { id: true },
    });
    // @ts-ignore
    expect(mockDb.delete().where().returning).toHaveBeenCalledTimes(1);
  });

  it('should throw INTERNAL_SERVER_ERROR if database operation fails unexpectedly', async () => {
    vi.spyOn(mockDb.query.users, 'findFirst').mockResolvedValue(mockUser);
    
    // @ts-ignore
    vi.spyOn(mockDb.delete().where(), 'returning').mockRejectedValue(new Error("DB connection lost"));

    const input = {
      userAddress: mockUser.address,
      contactId: mockContact.id,
    };

    await expect(caller.deleteContact(input)).rejects.toThrowError(
        new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete contact: DB connection lost',
        })
    );
  });

});

/*
To run these tests:
1. Ensure you have Vitest installed (e.g., `npm install -D vitest` or `yarn add -D vitest`).
2. Add a test script to your `package.json`:
   "scripts": {
     "test": "vitest",
     "test:ui": "vitest --ui"
   }
3. Configure Vitest if needed (e.g., `vitest.config.ts`), especially for path aliases like `@/`.
   Example `vitest.config.ts`:
   import { defineConfig } from 'vitest/config';
   import path from 'path';

   export default defineConfig({
     test: {
       globals: true,
       environment: 'node', // or 'jsdom' if testing components
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, '.'), // Adjust if your tsconfig paths are different
       },
     },
   });
4. Run the tests using `npm test` or `yarn test`.
*/
