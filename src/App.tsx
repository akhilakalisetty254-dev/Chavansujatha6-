import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BrowseView } from './components/BrowseView';
import { RequestsView } from './components/RequestsView';
import { PostItemView } from './components/PostItemView';
import { CampusBotChat } from './components/CampusBotChat';
import { ItemDetailModal } from './components/ItemDetailModal';
import { RequestModal } from './components/RequestModal';
import { OwnerChatModal } from './components/OwnerChatModal';
import { SettingsView } from './components/SettingsView';
import { DemoBanner } from './components/DemoBanner';
import { AuthPage } from './components/auth/AuthPage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AuthService } from './services/authService';
import {
  CampusItem,
  RentalRequest,
  Category,
  RequestStatus,
  User,
  UserSession,
  AppRoute,
} from './types';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity

export default function App() {
  // CRITICAL: On every first visit, start with no active session and open on Login page.
  // Never hardcode or pre-fill default user.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [inactivityMsg, setInactivityMsg] = useState<string | null>(null);

  // Active route: 'dashboard' | 'upload' | 'preview' | 'vault' | 'settings' | 'campusbot'
  const [activeRoute, setActiveRoute] = useState<AppRoute>('dashboard');

  // Per-user isolated data stores
  const [marketplaceItems, setMarketplaceItems] = useState<CampusItem[]>([]);
  const [userRequests, setUserRequests] = useState<RentalRequest[]>([]);

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('Main Tech Campus');

  // Modals & previews
  const [previewItem, setPreviewItem] = useState<CampusItem | null>(null);
  const [requestModalItem, setRequestModalItem] = useState<CampusItem | null>(null);
  const [requestInitialDays, setRequestInitialDays] = useState<number>(3);
  const [ownerChatTarget, setOwnerChatTarget] = useState<{ name: string; item?: CampusItem | null } | null>(null);
  const [campusBotItem, setCampusBotItem] = useState<CampusItem | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Inactivity tracking timer ref
  const lastActivityTimeRef = useRef<number>(Date.now());

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load user data upon authentication
  const loadUserData = useCallback((user: User) => {
    // Marketplace items (catalog)
    const publicItems = AuthService.getPublicMarketplaceItems();
    setMarketplaceItems(publicItems);

    // Isolated requests for THIS user only (never shared)
    const userReqs = AuthService.getUserRequests(user.id);
    setUserRequests(userReqs);
  }, []);

  // Login handler: redirects to Dashboard
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setCurrentUser(newSession.user);
    setInactivityMsg(null);
    lastActivityTimeRef.current = Date.now();
    loadUserData(newSession.user);
    setActiveRoute('dashboard'); // Redirect to Dashboard after login
    addToast(`Welcome to CampusShare, ${newSession.user.name.split(' ')[0]}!`, 'success');
  };

  // Logout handler: clears session, cached user tokens, and returns to Login page
  const handleLogout = useCallback((reason?: string) => {
    AuthService.logout();
    setCurrentUser(null);
    setSession(null);
    setMarketplaceItems([]);
    setUserRequests([]);
    setPreviewItem(null);
    setRequestModalItem(null);
    setOwnerChatTarget(null);
    setCampusBotItem(null);
    setActiveRoute('dashboard');
    if (reason) {
      setInactivityMsg(reason);
    }
  }, []);

  // 30-minute inactivity auto-logout detector
  useEffect(() => {
    if (!currentUser) return;

    const handleUserActivity = () => {
      lastActivityTimeRef.current = Date.now();
      AuthService.touchSession();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Check inactivity every 30 seconds
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityTimeRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        handleLogout('You were automatically signed out after 30 minutes of inactivity for your security.');
      }
    }, 30000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [currentUser, handleLogout]);

  // Handle open request modal
  const handleOpenRequest = (item: CampusItem, days = 3) => {
    setPreviewItem(null);
    setRequestInitialDays(days);
    setRequestModalItem(item);
  };

  // Handle submit rental request (saved under current user's ID)
  const handleSubmitRequest = (requestData: Omit<RentalRequest, 'id' | 'createdAt'>) => {
    if (!currentUser) return;

    const newReq: RentalRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      userId: currentUser.id, // Strictly tied to current logged-in user
      borrower: `${currentUser.name} (${currentUser.year.split('•')[0].trim() || 'Student'})`,
      createdAt: 'Just now',
    };

    const updated = [newReq, ...userRequests];
    setUserRequests(updated);
    AuthService.saveUserRequests(currentUser.id, updated);
    setRequestModalItem(null);
    addToast(`Request sent to ${requestData.owner.split(' ')[0]} ✓ View in Info Vault`, 'success');
  };

  // Handle update request status (Approve, Mark Active, Return)
  const handleUpdateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    if (!currentUser) return;

    const updated = userRequests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    });

    setUserRequests(updated);
    AuthService.saveUserRequests(currentUser.id, updated);

    if (newStatus === 'Approved') {
      addToast('Rental request approved! Ready for campus handover.', 'success');
    } else if (newStatus === 'Active') {
      addToast('Item marked as handed over and currently active!', 'info');
    } else if (newStatus === 'Returned') {
      addToast('Item returned! Security deposit refunded.', 'success');
    } else if (newStatus === 'Declined') {
      addToast('Request declined.', 'info');
    }
  };

  // Handle publish new item (Upload route)
  const handleItemPublished = (newItem: CampusItem) => {
    if (!currentUser) return;

    const userTaggedItem: CampusItem = {
      ...newItem,
      userId: currentUser.id,
      owner: currentUser.name,
      ownerYear: currentUser.year,
      ownerRating: currentUser.rating,
    };

    // Update public marketplace
    const updatedMarketplace = [userTaggedItem, ...marketplaceItems];
    setMarketplaceItems(updatedMarketplace);
    AuthService.savePublicMarketplaceItems(updatedMarketplace);

    // Save into user's own items
    const myItems = AuthService.getUserItems(currentUser.id);
    AuthService.saveUserItems(currentUser.id, [userTaggedItem, ...myItems]);

    setActiveRoute('dashboard');
    addToast(`"${newItem.name}" published to campus marketplace!`, 'success');
  };

  // Handle ask AI with item context
  const handleAskAiAboutItem = (item: CampusItem) => {
    setPreviewItem(null);
    setCampusBotItem(item);
    setActiveRoute('campusbot');
  };

  // Handle open chat with owner
  const handleContactOwner = (ownerName: string, item?: CampusItem) => {
    setPreviewItem(null);
    setOwnerChatTarget({ name: ownerName, item });
  };

  // ================= AUTH GUARD =================
  // If there is no active session, ALWAYS render the Login/Auth page.
  // Never auto-login, never open inside any account, never show another person's data.
  if (!currentUser || !session) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        inactivityMessage={inactivityMsg}
      />
    );
  }

  // Count pending requests for Info Vault badge
  const pendingCount = userRequests.filter((r) => r.status === 'Pending' && !r.isBorrowerMe).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Demo Mode Banner (Visible ONLY when Demo Login is explicitly active) */}
      {currentUser.isDemo && (
        <DemoBanner onExitDemo={() => handleLogout()} />
      )}

      {/* Navigation Header */}
      <Navbar
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        pendingRequestsCount={pendingCount}
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        currentUser={currentUser}
        onLogout={() => handleLogout()}
      />

      {/* Protected Routes Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ROUTE 1: DASHBOARD */}
        {activeRoute === 'dashboard' && (
          <div>
            {!searchQuery && (
              <HeroBanner
                onFindClick={() => {
                  const el = document.getElementById('browse-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onShareClick={() => setActiveRoute('upload')}
                onAskAiClick={() => {
                  setCampusBotItem(null);
                  setActiveRoute('campusbot');
                }}
              />
            )}

            <div id="browse-grid">
              <BrowseView
                items={marketplaceItems}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectItem={(item) => {
                  setPreviewItem(item);
                  setActiveRoute('preview');
                }}
                onRequestItem={(item) => handleOpenRequest(item)}
                onAskAiItem={handleAskAiAboutItem}
                onPostClick={() => setActiveRoute('upload')}
              />
            </div>
          </div>
        )}

        {/* ROUTE 2: UPLOAD (Post Item + AI Photo Studio) */}
        {activeRoute === 'upload' && (
          <PostItemView
            onItemPublished={handleItemPublished}
            onCancel={() => setActiveRoute('dashboard')}
            onOpenAiPricing={() => {
              setActiveRoute('campusbot');
            }}
          />
        )}

        {/* ROUTE 3: PREVIEW (Detailed Item Preview) */}
        {activeRoute === 'preview' && (
          <div>
            {previewItem ? (
              <ItemDetailModal
                item={previewItem}
                onClose={() => {
                  setPreviewItem(null);
                  setActiveRoute('dashboard');
                }}
                onRequest={(item, days) => handleOpenRequest(item, days)}
                onContactOwner={(ownerName, item) => handleContactOwner(ownerName, item)}
                onAskAi={handleAskAiAboutItem}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto">
                <div className="text-4xl mb-3">🔍</div>
                <h2 className="font-bold text-lg text-gray-900 mb-1">No Item Selected for Preview</h2>
                <p className="text-xs text-gray-500 mb-4">Choose an item from the dashboard catalog to inspect.</p>
                <button
                  onClick={() => setActiveRoute('dashboard')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* ROUTE 4: INFO VAULT (My Requests & Lending History) */}
        {activeRoute === 'vault' && (
          <RequestsView
            requests={userRequests}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onOpenChat={(personName, itemName) => {
              const matchedItem = marketplaceItems.find((i) => i.name === itemName) || null;
              handleContactOwner(personName, matchedItem || undefined);
            }}
            onBrowseClick={() => setActiveRoute('dashboard')}
          />
        )}

        {/* ROUTE 5: SETTINGS */}
        {activeRoute === 'settings' && (
          <SettingsView
            user={currentUser}
            onLogout={() => handleLogout()}
            onUserUpdated={(updated) => {
              setCurrentUser(updated);
              addToast('Profile updated!', 'success');
            }}
          />
        )}

        {/* CAMPUSBOT AI ROUTE */}
        {activeRoute === 'campusbot' && (
          <CampusBotChat
            initialItemContext={campusBotItem}
            onClearItemContext={() => setCampusBotItem(null)}
            onNavigateToItem={(item) => {
              setPreviewItem(item);
              setActiveRoute('preview');
            }}
          />
        )}
      </main>

      {/* Item Detail Modal (when opened overlay from dashboard) */}
      {previewItem && activeRoute !== 'preview' && (
        <ItemDetailModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onRequest={(item, days) => handleOpenRequest(item, days)}
          onContactOwner={(ownerName, item) => handleContactOwner(ownerName, item)}
          onAskAi={handleAskAiAboutItem}
        />
      )}

      {/* Request Rental Modal */}
      {requestModalItem && (
        <RequestModal
          item={requestModalItem}
          initialDays={requestInitialDays}
          onClose={() => setRequestModalItem(null)}
          onSubmit={handleSubmitRequest}
        />
      )}

      {/* Direct Peer Chat Modal */}
      {ownerChatTarget && (
        <OwnerChatModal
          ownerName={ownerChatTarget.name}
          item={ownerChatTarget.item}
          onClose={() => setOwnerChatTarget(null)}
        />
      )}

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-200 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-800">CampusShare</span>
            <span>• Verified Student Ring</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span>🛡️ ID Verified Access</span>
            <span>⏱️ 30m Auto-Logout Active</span>
            <span>🔒 Session Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
