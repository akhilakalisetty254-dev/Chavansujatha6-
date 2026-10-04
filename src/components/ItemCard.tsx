import React from 'react';
import { Star, MapPin, Sparkles, Shield, ArrowUpRight } from 'lucide-react';
import { CampusItem } from '../types';

interface ItemCardProps {
  item: CampusItem;
  onSelect: (item: CampusItem) => void;
  onRequest: (item: CampusItem) => void;
  onAskAi: (item: CampusItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  onRequest,
  onAskAi,
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-200 flex flex-col">
      {/* Image / Thumbnail Container */}
      <div
        className="relative h-48 bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 overflow-hidden cursor-pointer"
        onClick={() => onSelect(item)}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-5xl select-none group-hover:scale-110 transition-transform">
            <span>{item.icon}</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-gray-800 shadow-xs border border-white/60">
            {item.cat}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {item.condition}
          </span>
        </div>

        {/* Resolution Badge if high-quality AI photo */}
        {item.imageResolution && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-900/80 text-indigo-100 backdrop-blur-sm tracking-wider border border-white/20">
              {item.imageResolution} HD
            </span>
          </div>
        )}

        {/* Quick Ask AI button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAskAi(item);
          }}
          title="Ask CampusBot about this item"
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-purple-700 shadow-md backdrop-blur-md transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onSelect(item)}
            className="font-bold text-base text-gray-900 leading-snug line-clamp-1 hover:text-indigo-600 cursor-pointer mb-1.5"
            title={item.name}
          >
            {item.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-black text-gray-900">₹{item.price}</span>
            <span className="text-xs text-gray-500 font-medium">/ day</span>
            {item.weeklyDiscount && (
              <span className="ml-auto text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                -{item.weeklyDiscount}% week
              </span>
            )}
          </div>

          {/* Handover location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Owner info */}
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                {item.owner.charAt(0)}
              </div>
              <span className="text-gray-700 font-medium truncate">{item.owner}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.ownerRating}</span>
              <span className="text-gray-400 font-normal">({item.ownerReviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onSelect(item)}
            className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
          </button>

          <button
            onClick={() => onRequest(item)}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-indigo-100 transition-all cursor-pointer"
          >
            Borrow
          </button>
        </div>
      </div>
    </div>
  );
};
