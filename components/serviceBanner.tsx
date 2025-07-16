// components/ServiceBannerModal.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchActiveBanner } from '@/store/slices/serviceBannerSlice';
import { RootState } from '@/store/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function ServiceBannerModal() {
  const dispatch = useAppDispatch();
  const { activeBanner, isLoading, error } = useAppSelector((state: RootState) => state.serviceBanner);
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Use a ref to track if the fetch has been attempted for the current component mount/route.
  const fetchAttemptedForSession = useRef(false); 

  // Define routes where the banner should appear
  const allowedRoutes = ['/', '/booking'];
  const sessionDismissedKey = 'bannerDismissedThisSession'; // Key for sessionStorage

  useEffect(() => {
    // This effect runs once on mount and when pathname changes.
    // It's the primary gate for dispatching the fetch.
    
    // Reset fetchAttemptedForSession if navigating to a new route that's allowed,
    // or if the component remounts. This ensures it can fetch again if necessary.
    if (!pathname || !allowedRoutes.includes(pathname)) {
        fetchAttemptedForSession.current = false; // Reset if not on an allowed route
        setIsModalOpen(false); // Ensure modal closes if navigating away
        return; // Exit early if not on an allowed route
    }

    // If the banner has already been dismissed in this session,
    // or if a fetch has already been attempted for this component's current lifecycle,
    // we do NOT dispatch the fetch again.
    if (sessionStorage.getItem(sessionDismissedKey) || fetchAttemptedForSession.current) {
      return; 
    }
    
    // Mark fetch as attempted for this component's current lifecycle
    fetchAttemptedForSession.current = true; 

    // Dispatch the fetch.
    dispatch(fetchActiveBanner())
      .finally(() => {
        // IMPORTANT: Set the session storage flag ONLY when the fetch operation completes.
        // This ensures that even if the component re-renders quickly,
        // the sessionStorage flag is set after the API call, preventing subsequent fetches.
        sessionStorage.setItem(sessionDismissedKey, 'true');
      });

    // Dependencies: dispatch, pathname, allowedRoutes
    // `dispatch` is stable. `pathname` changes on route navigation.
    // This ensures the fetch is attempted once per relevant route visit,
    // unless explicitly dismissed.
  }, [dispatch, pathname, allowedRoutes]);

  useEffect(() => {
    // This effect controls the modal's open state based on fetched data.
    // It also respects the dismissal flag.
    if (!isLoading && activeBanner && activeBanner.image_url) {
      if (
        pathname &&
        allowedRoutes.includes(pathname) &&
        !sessionStorage.getItem(sessionDismissedKey) // Only open if not dismissed
      ) {
        setIsModalOpen(true);
      } else {
        // If banner exists but has been dismissed or not on allowed route, ensure it's closed
        setIsModalOpen(false);
      }
    } else if (!isLoading && !activeBanner) {
      // If no active banner (or image_url is missing), ensure modal is closed.
      setIsModalOpen(false);
    }
  }, [activeBanner, isLoading, pathname, allowedRoutes]); // Dependencies: activeBanner, isLoading, pathname, allowedRoutes

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // When the modal is explicitly closed, mark it as dismissed for this session
    sessionStorage.setItem(sessionDismissedKey, 'true');
  };

  if (isLoading) {
    return null;
  }

  // Final render condition: only render Dialog if there's an active banner with an image_url
  // AND we are on an allowed route AND it has NOT been dismissed this session.
  if (!activeBanner || !activeBanner.image_url || !pathname || !allowedRoutes.includes(pathname) || sessionStorage.getItem(sessionDismissedKey)) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      {/* Explicitly add DialogOverlay to ensure it covers the background and captures clicks */}
      <DialogOverlay className="fixed inset-0 bg-black/50 z-40" /> 
      {/* Adjusted max-width classes for a smaller size */}
      <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl p-0 overflow-hidden rounded-lg shadow-2xl z-50">
        <div className="relative w-full h-full">
          {/* Close Button */}
          <Button
            variant="ghost"
            onClick={handleCloseModal}
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 p-2 rounded-full"
            aria-label="Close banner"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Banner Image */}
          <img
            src={activeBanner.image_url}
            alt={activeBanner.title || 'Promotional Banner'}
            className="w-full h-auto object-cover"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x400/cccccc/333333?text=Banner+Image+Error'; }}
          />

          {/* Optional: Overlay for title/description if needed, or if image is purely decorative */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-6 text-white">
            <DialogTitle className="text-3xl font-bold mb-2">{activeBanner.title}</DialogTitle>
            {activeBanner.description && (
              <DialogDescription className="text-lg">{activeBanner.description}</DialogDescription>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
