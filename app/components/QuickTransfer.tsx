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
      <div className="flex space-x-6 p-2">
        {recipients.map((recipient) => (
          <div
            key={recipient.id}
            className="flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105"
          >
            <div className="relative mb-3">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 p-0.5 shadow-lg group-hover:shadow-xl transition-all duration-200">
                <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-slate-800">
                  <img 
                    src={recipient.image}
                    alt={recipient.name} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800 shadow-sm"></div>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center max-w-[70px] truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
              {recipient.name}
            </span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
} 