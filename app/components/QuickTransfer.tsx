import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Import Assets
import AlexAvatar from '../assets/alex.png';
import BrotherAvatar from '../assets/brother.png';
import DadAvatar from '../assets/dad.png';
import GrandmaAvatar from '../assets/grandma.png';
import GrandpaAvatar from '../assets/grandpa.png';
import MomAvatar from '../assets/mom.png';
import SarahAvatar from '../assets/sarah.png';
import SisterAvatar from '../assets/sister.png';

interface Contact {
  name: string;
  address: string;
  image: string;
}

interface QuickTransferProps {
  contacts?: Contact[];
}

export function QuickTransfer({ contacts }: QuickTransferProps) {
  const defaultRecipients = [
    { id: 1, name: "Mom", image: MomAvatar },
    { id: 2, name: "Dad", image: DadAvatar },
    { id: 3, name: "Grandpa", image: GrandpaAvatar },
    { id: 4, name: "Grandma", image: GrandmaAvatar },
    { id: 5, name: "Sister", image: SisterAvatar },
    { id: 6, name: "Brother", image: BrotherAvatar },
    { id: 7, name: "Alex", image: AlexAvatar },
    { id: 8, name: "Sarah", image: SarahAvatar },
  ];

  // Use provided contacts or fall back to default recipients
  const recipients = contacts?.length 
    ? contacts.map((contact, index) => ({ 
        id: index + 1, 
        name: contact.name, 
        image: contact.image || `https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}` 
      }))
    : defaultRecipients;

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 p-1">
        {recipients.map((recipient) => (
          <div
            key={recipient.id}
            className="flex h-auto flex-col items-center cursor-pointer hover:opacity-80 transition-opacity text-center"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted">
              <img 
                src={recipient.image} // Now uses the imported image asset or contact image
                alt={recipient.name} 
                className="object-cover w-full h-full"
              />
            </div>
            <span className="mt-2 text-xs font-medium text-foreground">
              {recipient.name}
            </span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
} 