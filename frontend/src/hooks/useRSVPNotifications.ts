import { useEffect } from 'react';
import { useNotifications } from './useNotifications';

interface RSVPNotificationProps {
  guestName: string;
  invitationName: string;
  status: 'CONFIRMED' | 'DECLINED';
  isNewResponse: boolean;
}

export const useRSVPNotifications = () => {
  const { notifyRSVPConfirmed, notifyRSVPDeclined } = useNotifications();

  const notifyRSVPResponse = ({ guestName, invitationName, status, isNewResponse }: RSVPNotificationProps) => {
    if (!isNewResponse) return; // Ne notifier que pour les nouvelles réponses

    if (status === 'CONFIRMED') {
      notifyRSVPConfirmed(guestName, invitationName);
    } else if (status === 'DECLINED') {
      notifyRSVPDeclined(guestName, invitationName);
    }
  };

  return {
    notifyRSVPResponse
  };
};
