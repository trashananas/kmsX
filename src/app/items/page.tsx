
"use client";

import { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ItemCard from '@/components/items/ItemCard';
import CategoryFilter from '@/components/items/CategoryFilter';

// Mock Data
const MOCK_ITEMS = [
  { id: '1', title: 'Vintage Film Camera', category: 'Electronics', location: 'Brooklyn, NY', distance: '1.2 miles', image: 'https://picsum.photos/seed/item1/600/600', condition: 'Great' },
  { id: '2', title: 'Mid-century Modern Chair', category: 'Furniture', location: 'Queens, NY', distance: '3.5 miles', image: 'https://picsum.photos/seed/item2/600/600', condition: 'Like New' },
  { id: '3', title: 'Sapiens: A Brief History', category: 'Books', location: 'Manhattan, NY', distance: '0.8 miles', image: 'https://picsum.photos/seed/item3/600/600', condition: 'Used' },
  { id: '4', title: 'Mountain Bike 24"', category: 'Sporting Goods', location: 'Jersey City, NJ', distance: '5.1 miles', image: 'https://picsum.photos/seed/item4/600/600', condition: 'Good' },
  { id: '5', title: 'Lego Star Wars Set', category: 'Toys', location: 'Brooklyn, NY', distance: '1.5 miles', image: 'https://picsum.photos/seed/item5/600/600', condition: 'Brand New' },
  { id: '6', title: 'Wool Winter Coat', category: 'Clothes', location: 'Bronx, NY', distance: '7.2 miles', image: 'https://picsum.photos/seed/item6/600/600', condition: 'Like New' },
];

export default function BrowseItems() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        {/* Search & Location Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search for items..." 
              className="pl-10 h-12 bg-muted/30 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 h-12 bg-muted/30 rounded-xl text-sm font-medium border border-transparent hover:border-primary/20 transition-all cursor-pointer">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Brooklyn, NY (5 mi)</span>
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-lg font-bold mb-4 px-2">Categories</h2>
              <CategoryFilter 
                selected={selectedCategory} 
                onSelect={setSelectedCategory} 
              />
            </div>
          </aside>

          {/* Items Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold font-headline">
                {selectedCategory === 'All' ? 'All Items' : selectedCategory}
                <span className="text-muted-foreground font-normal text-sm ml-2">({filteredItems.length} results)</span>
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sort by:</span>
                <select className="bg-transparent font-medium text-foreground outline-none cursor-pointer">
                  <option>Proximity</option>
                  <option>Newest</option>
                  <option>Condition</option>
                </select>
              </div>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold mb-2">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
