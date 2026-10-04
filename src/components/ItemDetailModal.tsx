import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  MessageCircle,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CampusItem } from '../types';

interface ItemDetailModalProps {
  item: CampusItem | null;
  onClose: () => void;
  onRequest: (item: CampusItem, selectedDays: number) => void;
  onContactOwner: (ownerName: string, item: CampusItem) => void;
  onAskAi: (item: CampusItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onRequest,
  onContactOwner,
  onAskAi,
}) => {
  const [durationDays, setDurationDays] = useState<number>(3);

  if (!item) return null;

  // Rental calculator
  const isWeekly = durationDays >= 7;
  const discountRate = isWeekly ? (item.weeklyDiscount || 0) / 100 : 0;
  const rawRent = item.price * durationDays;
  const discountAmount = Math.round(rawRent * discountRate);
  const totalRent = rawRent - discountAmount;
  const totalUpfront = totalRent + item.deposit;

  // Rough estimation of retail value to show student savings
  const estimatedRetail = Math.max(item.price * 25, item.deposit * 2);
  const estimatedSavings = Math.max(0, estimatedRetail - totalRent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Image & Specs */}
        <div className="md:w-1/2 p-6 bg-gray-50/70 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
          <div>
            {/* Main Showcase Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-100 to-purple-100 h-64 sm:h-72 shadow-inner border border-gray-200/80 mb-4">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {item.icon}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/95 text-gray-800 shadow-xs">
                  {item.cat}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {item.condition}
                </span>
              </div>

              {item.imageResolution && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-900/90 text-white tracking-widest">
                    {item.imageResolution} ULTRA HD
                  </span>
                </div>
              )}
            </div>

            {/* Handover location banner */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 flex items-start gap-2.5 text-xs text-gray-700 mb-4">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-gray-900">Campus Handover Spot:</div>
                <div>{item.location}</div>
              </div>
            </div>

            {/* Item Rules / Checklist */}
            {item.rules && item.rules.length > 0 && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs">
                <div className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Owner's Borrowing Guidelines</span>
                </div>
                <ul className="space-y-1 text-amber-800">
                  {item.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Environmental note */}
          <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-500">
            <span>♻️ Verified Circular Listing</span>
            <span className="text-emerald-700 font-semibold">Zero-Waste Verified</span>
          </div>
        </div>

        {/* Right: Info & Rental Calculator */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-2">
              {item.name}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              {item.desc}
            </p>

            {/* Owner Profile Card */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {item.owner.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <span>{item.owner}</span>
                    <span title="Verified Campus Student">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">{item.ownerYear}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-amber-500 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{item.ownerRating}</span>
                </div>
                <div className="text-[10px] text-gray-400">{item.ownerReviewsCount} reviews</div>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 mb-5">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950 mb-2">
                <span>Rental Duration Calculator</span>
                <span className="text-indigo-600 font-extrabold">₹{item.price} / day</span>
              </div>

              {/* Duration buttons */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 text-xs">
                {[1, 3, 7, 14].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDurationDays(d)}
                    className={`py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                      durationDays === d
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {d === 1 ? '1 day' : d === 7 ? '1 week' : d === 14 ? '2 weeks' : `${d} days`}
                  </button>
                ))}
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-indigo-100/80">
                <div className="flex justify-between text-gray-600">
                  <span>Rent ({durationDays} days × ₹{item.price}):</span>
                  <span>₹{rawRent}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Weekly Discount ({item.weeklyDiscount}%):</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>Refundable Deposit:</span>
                    <span title="Returned immediately upon item return">
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                  </span>
                  <span>₹{item.deposit}</span>
                </div>

                <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-indigo-200">
                  <span>Total Pay (Rent + Deposit):</span>
                  <span className="text-indigo-700">₹{totalUpfront}</span>
                </div>
              </div>

              {/* Student Savings estimate */}
              {estimatedSavings > 0 && (
                <div className="mt-2.5 py-1 px-2.5 bg-emerald-100/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>You save ~₹{estimatedSavings} compared to buying new!</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onRequest(item, durationDays)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Request to Borrow</span>
              </button>

              <button
                onClick={() => onContactOwner(item.owner, item)}
                className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-indigo-600" />
                <span>Chat with Owner</span>
              </button>
            </div>

            <button
              onClick={() => onAskAi(item)}
              className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-purple-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Ask CampusBot (Fair Price, Verification & Negotiation)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
