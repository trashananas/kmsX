
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, UploadCloud, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function NewItemListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Item Listed Successfully!",
        description: "Your item is now visible to people in your area.",
      });
      router.push('/items');
    }, 1500);
  };

  return (
    <div className="container px-4 py-8 max-w-2xl mx-auto">
      <Link href="/items" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to items
      </Link>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold mb-2">Create New Listing</h1>
          <p className="text-muted-foreground">What would you like to exchange today?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Area */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-muted/20">
                <UploadCloud className="w-8 h-8" />
                <span className="text-xs font-medium">Add Photo</span>
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-bold">Add at least 1 photo of the item.</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Item Title</Label>
              <Input id="title" placeholder="e.g. Mechanical Keyboard" required className="h-12 rounded-xl" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothes">Clothes</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select required>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Brand New</SelectItem>
                    <SelectItem value="likenew">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your item, its features, and what you're looking for in return..." 
              className="min-h-[120px] rounded-xl resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Pick-up Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
              <Input id="location" placeholder="Enter neighborhood or city" className="pl-10 h-12 rounded-xl" required />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? "Creating Listing..." : "List Item"}
          </Button>
        </form>
      </div>
    </div>
  );
}
