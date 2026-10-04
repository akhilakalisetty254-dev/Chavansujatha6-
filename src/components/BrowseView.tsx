import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { CampusItem, Category } from '../types';
import { ItemCard } from './ItemCard';

interface BrowseViewProps {
  items: CampusItem[];
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectItem: (item: CampusItem) => void;
  onRequestItem: (item: CampusItem) => void;
  onAskAiItem: (item: CampusItem) => void;
  onPostClick: () => void;
}

const CATEGORIES: { label: Category; icon: string }[] = [
  { label: 'All', icon: '✨' },
  { label: 'Study', icon: '🧮' },
  { label: 'Electronics', icon: '📷' },
  { label: 'Sports', icon: '🏏' },
  { label: 'Hostel', icon: '🏠' },
  { label: 'Books', icon: '📚' },
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  items,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectItem,
  onRequestItem,
  onAskAiItem,
  onPostClick,
}) => {
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category match
        if (selectedCategory !== 'All' && item.cat !== selectedCategory) {
          return false;
        }

        // Search match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.desc.toLowerCase().includes(q);
          const matchOwner = item.owner.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchOwner && !matchLoc) {
            return false;
          }
        }

        // Price filter
        if (item.price > maxPrice) {
          return false;
        }

        // Condition filter
        if (conditionFilter !== 'all' && item.condition !== conditionFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.ownerRating - a.ownerRating;
        return 0; // recommended order
      });
  }, [items, selectedCategory, searchQuery, maxPrice, conditionFilter, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMaxPrice(300);
    setConditionFilter('all');
    setSortBy('recommended');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '' ||
    maxPrice < 300 ||
    conditionFilter !== 'all' ||
    sortBy !== 'recommended';

  return (
    <div className="space-y-6">
      {/* Category Pills & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-102'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter toggle & Sort */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showFiltersPanel || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated Owners</option>
          </select>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFiltersPanel && (
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in duration-150">
          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between font-bold text-gray-700 mb-1.5">
              <span>Max Rent:</span>
              <span className="text-indigo-600 font-extrabold">₹{maxPrice}/day</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹20</span>
              <span>₹150</span>
              <span>₹300+</span>
            </div>
          </div>

          {/* Condition selector */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Condition</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['all', 'Like new', 'Good', 'Fair / Used'].map((c) => (
                <button
                  key={c}
                  onClick={() => setConditionFilter(c)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize cursor-pointer ${
                    conditionFilter === c
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c === 'all' ? 'All Conditions' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="flex items-end justify-start sm:justify-end">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-indigo-600 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-gray-900">
            {selectedCategory === 'All' ? 'All Campus Listings' : `${selectedCategory} Gear`}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
            {filteredItems.length} available
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              onRequest={onRequestItem}
              onAskAi={onAskAiItem}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No items found</h3>
          <p className="text-xs text-gray-500 mb-6">
            We couldn't find any gear matching your search or filters. Try clearing filters or be the first to list it!
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
            >
              Reset Filters
            </button>
            <button
              onClick={onPostClick}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              + Post This Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
