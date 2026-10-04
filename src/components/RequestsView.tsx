import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { RentalRequest, RequestStatus } from '../types';

interface RequestsViewProps {
  requests: RentalRequest[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
  onOpenChat: (personName: string, itemName: string) => void;
  onBrowseClick: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onUpdateRequestStatus,
  onOpenChat,
  onBrowseClick,
}) => {
  const [tab, setTab] = useState<'borrowing' | 'lending'>('borrowing');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (tab === 'borrowing' && !r.isBorrowerMe) return false;
    if (tab === 'lending' && r.isBorrowerMe) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending Owner Confirmation</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved • Ready for Handover</span>
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <RefreshCw className="w-3 h-3" />
            <span>Currently Active / Borrowed</span>
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Returned & Deposit Refunded</span>
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" />
            <span>Declined</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Campus Requests & Rentals</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Track your borrowing timeline, handover spot, and deposit status.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-gray-100 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setTab('borrowing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              tab === 'borrowing'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Borrowing ({requests.filter((r) => r.isBorrowerMe).length})
          </button>
          <button
            onClick={() => setTab('lending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              tab === 'lending'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lending Requests ({requests.filter((r) => !r.isBorrowerMe).length})
          </button>
        </div>
      </div>

      {/* Filter by status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'Pending', 'Approved', 'Active', 'Returned'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === s
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s === 'all' ? 'All Statuses' : s}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Item Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {req.itemImage ? (
                      <img
                        src={req.itemImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      req.itemIcon
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-extrabold text-base text-gray-900">
                        {req.itemName}
                      </h3>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>
                        {tab === 'borrowing' ? (
                          <span>
                            Owner: <b className="text-gray-700">{req.owner}</b>
                          </span>
                        ) : (
                          <span>
                            Borrower: <b className="text-gray-700">{req.borrower}</b>
                          </span>
                        )}
                        {' • '}
                        <span>{req.durationLabel}</span>
                        {' • '}
                        <span>₹{req.dailyPrice}/day</span>
                      </div>

                      <div className="text-gray-600">
                        📍 Meetup: <span className="font-medium text-gray-800">{req.pickupLocation}</span> ({req.startDate})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Payment badge */}
                <div className="sm:text-right shrink-0">
                  <div className="text-lg font-black text-gray-900">
                    ₹{req.totalWithDeposit}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Rent: ₹{req.totalRent} + Deposit: ₹{req.deposit}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{req.createdAt}</div>
                </div>
              </div>

              {/* Message from borrower */}
              {req.message && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border-l-2 border-indigo-400">
                  "{req.message}"
                </div>
              )}

              {/* Action buttons depending on role & status */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onOpenChat(
                        tab === 'borrowing' ? req.owner : req.borrower,
                        req.itemName
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Message {tab === 'borrowing' ? 'Owner' : 'Student'}</span>
                  </button>
                </div>

                {/* Status Transitions */}
                <div className="flex items-center gap-2">
                  {/* As Borrower actions */}
                  {tab === 'borrowing' && req.status === 'Approved' && (
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Active')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Item Picked Up</span>
                    </button>
                  )}

                  {tab === 'borrowing' && req.status === 'Active' && (
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Returned')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                    >
                      Mark Item Returned to Owner
                    </button>
                  )}

                  {/* As Lender actions */}
                  {tab === 'lending' && req.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onUpdateRequestStatus(req.id, 'Declined')}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onUpdateRequestStatus(req.id, 'Approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                    </>
                  )}

                  {tab === 'lending' && req.status === 'Approved' && (
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Active')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      Mark Handed Over to Borrower
                    </button>
                  )}

                  {tab === 'lending' && req.status === 'Active' && (
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Returned')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Inspect & Refund Deposit (₹{req.deposit})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-3">📬</div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No {tab === 'borrowing' ? 'borrowing' : 'lending'} requests found
          </h3>
          <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
            {tab === 'borrowing'
              ? 'Find what you need around campus instead of buying it. Request gear from verified batchmates.'
              : 'Items you list for sharing will show borrow requests from other students right here.'}
          </p>
          <button
            onClick={onBrowseClick}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
          >
            Browse Available Gear
          </button>
        </div>
      )}
    </div>
  );
};
