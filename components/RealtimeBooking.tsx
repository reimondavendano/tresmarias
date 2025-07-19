// components/RealtimeBookingListener.tsx (or integrate into an existing component)
'use client'; // Important for Next.js App Router if this is a client component

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks'; // Assuming this hook gives you dispatch
import { supabaseBrowser } from '@/utils/supabase/client/supabaseBrowser'; // Your client-side Supabase instance
import { addRealtimeBooking, updateRealtimeBooking } from '@/store/slices/bookingSlice'; // Adjust path as needed
import { Booking } from '@/types'; // Import your Booking type

const BOOKING_CHANNEL_NAME = 'booking_broadcast_channel'; // This MUST match the channel name in your API route (pages/api/bookings/index.ts)

export function RealtimeBookingListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('Subscribing to bookings real-time channel...');

    // 1. Subscribe to the channel for 'broadcast' events
    const channel = supabaseBrowser
      .channel(BOOKING_CHANNEL_NAME)
      .on('broadcast', { event: 'new_booking' }, (payload) => {
        // This fires when your API route (pages/api/bookings/index.ts) broadcasts a 'new_booking'
        // console.log('Realtime new_booking event received:', payload.payload);
        // Dispatch the Redux action to add the new booking to your global state
        dispatch(addRealtimeBooking(payload.payload as Booking));
      })
      .on('broadcast', { event: 'booking_updated' }, (payload) => {
        // OPTIONAL: If you decide to broadcast updates from your PUT /api/bookings/[id] route
        // This would fire if an existing booking's status or other details are updated.
        // console.log('Realtime booking_updated event received:', payload.payload);
        // Dispatch the Redux action to update an existing booking in your global state
        dispatch(updateRealtimeBooking(payload.payload as Booking));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to', BOOKING_CHANNEL_NAME);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Supabase Realtime Channel Error:', status);
        }
      });

    // 2. Cleanup function: Unsubscribe when the component unmounts or re-renders
    // This is CRUCIAL to prevent memory leaks and multiple listeners causing duplicate events.
    return () => {
      console.log('Unsubscribing from bookings real-time channel...');
      supabaseBrowser.removeChannel(channel);
    };
  }, [dispatch]); // Dependency array: Effect runs once on mount, cleans up on unmount

  // This component typically doesn't render anything visible itself.
  // It's a "listener" component.
  return null;
}