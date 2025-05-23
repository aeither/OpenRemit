"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, UserPlus } from "lucide-react";
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
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-md bg-black/10" />
        <DialogContent className="sm:max-w-[480px] bg-white/95 dark:bg-slate-900/95 border border-gray-200/20 dark:border-gray-700/20 shadow-2xl backdrop-blur-sm">
        {/* Header with gradient */}
        <DialogHeader className="text-center space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Add New Contact
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Add a trusted contact to your network for quick and easy transfers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-purple-100 dark:border-purple-900/30 shadow-lg">
                <AvatarImage src={formData.image} alt={formData.name} />
                <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-600 dark:text-purple-400">
                  {formData.name ? getInitials(formData.name) : <UserPlus className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              {formData.image && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {formData.image ? "Profile picture loaded!" : "Add an image URL to see their photo"}
            </p>
          </div>

          <div className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contact Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter their name (e.g., Mom, Dad, Alex)"
                className="h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                required
              />
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Wallet Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="0x..."
                className="h-12 font-mono text-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Their blockchain wallet address for receiving payments
              </p>
            </div>

            {/* Image URL Field */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Profile Image URL
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                  Optional
                </span>
              </Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="h-12 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || !formData.address.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 