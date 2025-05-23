"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface Contact {
  name: string;
  address: string;
  image: string;
}

interface AddContactModalProps {
  onAddContact: (contact: Contact) => void;
  trigger?: React.ReactNode;
}

export function AddContactModal({ onAddContact, trigger }: AddContactModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Contact>({
    name: "",
    address: "",
    image: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }

    onAddContact({
      name: formData.name.trim(),
      address: formData.address.trim(),
      image: formData.image.trim() || "", // Optional image
    });

    // Reset form and close modal
    setFormData({ name: "", address: "", image: "" });
    setOpen(false);
  };

  const handleInputChange = (field: keyof Contact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your list. Enter their name and wallet address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.image} alt={formData.name} />
                <AvatarFallback className="text-lg">
                  {formData.name ? getInitials(formData.name) : <UserPlus className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter contact name"
                required
              />
            </div>

            {/* Address Field */}
            <div className="grid gap-2">
              <Label htmlFor="address">Wallet Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="0x..."
                required
              />
            </div>

            {/* Image URL Field */}
            <div className="grid gap-2">
              <Label htmlFor="image">Profile Image URL (optional)</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || !formData.address.trim()}>
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 