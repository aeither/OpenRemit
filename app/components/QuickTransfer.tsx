import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function QuickTransfer() {
  const recipients = [
    { id: 1, name: "Mom", image: "/images/placeholder_avatar.svg" }, // Placeholder image path
    { id: 2, name: "Dad", image: "/images/placeholder_avatar.svg" },
    { id: 3, name: "Grandpa", image: "/images/placeholder_avatar.svg" },
    { id: 4, name: "Grandma", image: "/images/placeholder_avatar.svg" },
    { id: 5, name: "Sister", image: "/images/placeholder_avatar.svg" },
    { id: 6, name: "Brother", image: "/images/placeholder_avatar.svg" },
  ];

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
                src={recipient.image || "/images/placeholder_avatar.svg"} 
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