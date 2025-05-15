import { db } from "./drizzle"; // Adjust import to your setup
import { contacts, schedulers, users } from "./schema"; // Adjust import to your schema

// Function to generate a random Ethereum address
function randomEthAddress(): string {
  const addr = "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  return addr;
}

const seedContacts = [
  { name: "Mom", address: randomEthAddress() },
  { name: "Dad", address: randomEthAddress() },
  { name: "Grandpa", address: randomEthAddress() },
  { name: "Grandma", address: randomEthAddress() },
  { name: "Sister", address: randomEthAddress() },
  { name: "Brother", address: randomEthAddress() },
  { name: "Alex", address: randomEthAddress() },
  { name: "Sarah", address: randomEthAddress() },
];

async function main() {
  console.log("Starting seeding process...");

  // Clear existing data in order: contacts, schedulers, then users due to foreign keys
  console.log("Clearing existing contacts...");
  await db.delete(contacts).execute();
  console.log("Clearing existing schedulers...");
  await db.delete(schedulers).execute(); 
  // Removed tasks and campaigns as they are not in the current schema used by userRouter
  console.log("Clearing existing users...");
  await db.delete(users).execute();
  
  console.log("Creating test users and their contacts...");
  const userAddresses = Array(2).fill(0).map(() => randomEthAddress()); // Create 2 test users for brevity
  
  for (const address of userAddresses) {
    const insertedUser = await db.insert(users).values({
      address,
      name: `User ${address.substring(0, 6)}`, // Give a generic name
      lastActive: new Date(),
    }).onConflictDoNothing().returning({ id: users.id });
    
    console.log(`Upserted user: ${address}`);

    if (insertedUser && insertedUser.length > 0 && insertedUser[0].id) {
      const userId = insertedUser[0].id;
      console.log(`User ID for ${address} is ${userId}. Adding contacts...`);
      for (const contact of seedContacts) {
        await db.insert(contacts).values({
          userId: userId,
          contactName: contact.name,
          contactAddress: contact.address, // Using pre-generated random addresses for seed contacts
        }).onConflictDoNothing(); // Assuming unique constraint on (userId, contactName)
        console.log(` -> Added contact: ${contact.name} for user ${userId}`);
      }
    } else {
      // This might happen if onConflictDoNothing was triggered and we didn't get ID back
      // Or if user wasn't inserted. For robust seeding, might fetch user ID if conflict.
      console.log(`User ${address} might have already existed. Skipping contact seeding for this iteration or fetch ID manually.`);
      // To make it more robust, you could query the user ID here if `insertedUser` is empty
      const existingUser = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.address, address) });
      if (existingUser) {
        console.log(`Found existing user ID ${existingUser.id} for ${address}. Adding contacts...`);
        for (const contact of seedContacts) {
          await db.insert(contacts).values({
            userId: existingUser.id,
            contactName: contact.name,
            contactAddress: randomEthAddress(), // Assign new random address for each contact for this user
          }).onConflictDoNothing();
          console.log(` -> Added contact: ${contact.name} for user ${existingUser.id}`);
        }
      }
    }
  }

  console.log("Seeding completed.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
