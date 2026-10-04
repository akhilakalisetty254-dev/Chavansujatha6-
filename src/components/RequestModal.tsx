import React, { useState } from 'react';
import { X, Calendar, MapPin, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { CampusItem, RentalRequest } from '../types';

interface RequestModalProps {
  item: CampusItem | null;
  initialDays?: number;
  onClose: () => void;
  onSubmit: (requestData: Omit<RentalRequest, 'id' | 'createdAt'>) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  item,
  initialDays = 3,
  onClose,
  onSubmit,
}) => {
  const [durationDays, setDurationDays] = useState<number>(initialDays);
  const [pickupDate, setPickupDate] = useState<string>('Tomorrow at 10:00 AM');
  const [pickupSpot, setPickupSpot] = useState<string>(item?.location || 'Central Library Entrance');
  const [message, setMessage] = useState<string>(
    `Hi ${item?.owner.split(' ')[0]}! I'd like to borrow your ${item?.name} for college coursework. I'll take good care of it and return on time.`
  );

  if (!item) return null;

  const isWeekly = durationDays >= 7;
  const discountRate = isWeekly ? (item.weeklyDiscount || 0) / 100 : 0;
  const rawRent = item.price * durationDays;
  const discountAmount = Math.round(rawRent * discountRate);
  const totalRent = rawRent - discountAmount;
  const totalWithDeposit = totalRent + item.deposit;

  const handleQuickTemplate = (tpl: string) => {
    setMessage(tpl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestData: Omit<RentalRequest, 'id' | 'createdAt'> = {
      itemId: item.id,
      itemName: item.name,
      itemImage: item.imageUrl,
      itemIcon: item.icon,
      owner: item.owner,
      borrower: 'You (Alex Johnson)',
      durationDays,
      durationLabel:
        durationDays === 1
          ? '1 day'
          : durationDays === 7
          ? '1 week'
          : `${durationDays} days`,
      startDate: pickupDate,
      pickupLocation: pickupSpot,
      dailyPrice: item.price,
      deposit: item.deposit,
      totalRent,
      totalWithDeposit,
      status: 'Pending',
      message: message.trim(),
      isBorrowerMe: true,
    };

    onSubmit(requestData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              item.icon
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Rental Proposal
            </div>
            <h3 className="font-black text-lg text-gray-900 leading-tight">
              Request {item.name}
            </h3>
            <div className="text-xs text-gray-500">Owner: {item.owner}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Duration Selector */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Select Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 14].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDurationDays(d)}
                  className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                    durationDays === d
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {d === 1 ? '1 day' : d === 7 ? '1 week' : d === 14 ? '2 weeks' : `${d} days`}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Timing & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Pickup Date & Time
              </label>
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                placeholder="e.g. Tomorrow 10 AM"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Campus Meetup Spot
              </label>
              <input
                type="text"
                value={pickupSpot}
                onChange={(e) => setPickupSpot(e.target.value)}
                placeholder="e.g. Central Library entrance"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Note to owner with template pills */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-gray-700">Message to Owner</label>
              <span className="text-[10px] text-gray-400">Personal note</span>
            </div>

            {/* Quick Templates */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-1.5 no-scrollbar">
              <button
                type="button"
                onClick={() =>
                  handleQuickTemplate(
                    `Hi! I need this for my upcoming exams this week. I will handle it gently and return immediately after.`
                  )
                }
                className="px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium whitespace-nowrap cursor-pointer"
              >
                📝 For Exam
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickTemplate(
                    `Hey! We're shooting a college club video this weekend. Can pick it up on Friday afternoon!`
                  )
                }
                className="px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium whitespace-nowrap cursor-pointer"
              >
                🎬 Club Project
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickTemplate(
                    `Hi, looking to try this out before buying one for the semester. Available to meet at library!`
                  )
                }
                className="px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium whitespace-nowrap cursor-pointer"
              >
                🤝 Test Drive
              </button>
            </div>

            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and specify when and where you'd like to pick up..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Payment Summary */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Rental fee ({durationDays} days @ ₹{item.price}/day):</span>
              <span>₹{rawRent}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Weekly discount:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Refundable Security Deposit:</span>
              <span>₹{item.deposit}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total Payable to Owner:</span>
              <span className="text-indigo-600 font-black">₹{totalWithDeposit}</span>
            </div>
            <div className="text-[10px] text-gray-400">
              * Deposit of ₹{item.deposit} is refunded in full upon inspection & return.
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Rental Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
