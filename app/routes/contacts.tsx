import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react'; // Import useState
import { trpc } from '../trpc/react'; 

// Placeholder user address - replace with actual user context/wallet later
const HARDCODED_USER_ADDRESS = "0x1234567890123456789012345678901234567890";


function ContactsPage() {
  const [contactName, setContactName] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  const { 
    data: contacts, 
    isLoading, 
    error,
    refetch: refetchContacts // Get refetch function
  } = trpc.user.listContacts.useQuery(
    { userAddress: HARDCODED_USER_ADDRESS },
    // { enabled: !!HARDCODED_USER_ADDRESS } // Optionally enable query only when address is available
  );

  const createContactMutation = trpc.user.createContact.useMutation();
  const deleteContactMutation = trpc.user.deleteContact.useMutation(); // Initialize delete mutation

  const handleAddContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactName.trim() || !contactAddress.trim()) {
      alert("Name and address cannot be empty.");
      return;
    }
    // Basic regex for Ethereum address validation (can be more robust)
    if (!/^0x[a-fA-F0-9]{40}$/.test(contactAddress.trim())) {
        alert("Invalid Ethereum address format.");
        return;
    }

    try {
      await createContactMutation.mutateAsync({
        userAddress: HARDCODED_USER_ADDRESS,
        contactName: contactName.trim(),
        contactAddress: contactAddress.trim(),
      });
      alert("Contact added successfully!");
      setContactName('');
      setContactAddress('');
      refetchContacts(); // Refetch the list of contacts
    } catch (err: any) {
      console.error("Failed to add contact:", err);
      alert(`Failed to add contact: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (window.confirm(`Are you sure you want to delete ${contactName}?`)) {
      try {
        await deleteContactMutation.mutateAsync({
          userAddress: HARDCODED_USER_ADDRESS,
          contactId: contactId,
        });
        alert("Contact deleted successfully!");
        refetchContacts(); // Refetch the list of contacts
      } catch (err: any) {
        console.error("Failed to delete contact:", err);
        alert(`Failed to delete contact: ${err.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Manage Contacts</h1>
      </header>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#555', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Add New Contact</h2>
        <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              title="Enter a valid Ethereum address (e.g., 0x...)"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button 
            type="submit"
            style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            disabled={createContactMutation.isPending} // Disable button while mutation is in progress
          >
            {createContactMutation.isPending ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ color: '#555', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>My Contacts</h2>
        {isLoading && <p style={{ textAlign: 'center', color: '#007bff' }}>Loading contacts...</p>}
        {error && <p style={{ textAlign: 'center', color: 'red' }}>Error loading contacts: {error.message}</p>}
        {!isLoading && !error && contacts && contacts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#777' }}>You have no contacts yet.</p>
        )}
        {!isLoading && !error && contacts && contacts.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {contacts.map((contact) => (
              <li
                key={contact.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #eee',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div>
                  <strong style={{ color: '#333' }}>{contact.name}</strong>
                  <p style={{ margin: '5px 0 0', color: '#666', fontSize: '0.9em' }}>{contact.address}</p>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id, contact.name)} 
                  style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  disabled={deleteContactMutation.isPending} // Disable button while mutation is in progress
                >
                  {deleteContactMutation.isPending && deleteContactMutation.variables?.contactId === contact.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export const Route = createFileRoute('/contacts')({
  component: ContactsPage,
});
