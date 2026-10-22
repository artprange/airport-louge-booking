import { useEffect, useId, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BookingForm } from '../BookingForm';
import type { BookingModalProps } from './types';
import { bookingModalStyles } from './styles';

function BookingModal({ lounge, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // showModal makes the background inert and contains keyboard focus.
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  function requestClose() {
    // Read mutation state synchronously, including before React re-renders.
    if (queryClient.isMutating({ mutationKey: ['create-booking', lounge.id] }) > 0) return;
    onClose();
  }

  return (
    <dialog ref={dialogRef} className={bookingModalStyles.dialog}
      aria-labelledby={titleId} aria-describedby={`${titleId}-description`}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        )).filter((element) => element.getClientRects().length > 0);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first || !last) {
          event.preventDefault();
          return;
        }
        const active = document.activeElement;
        const isFocusable = active instanceof HTMLElement && elements.includes(active);
        if (event.shiftKey && (active === first || !isFocusable)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !isFocusable)) {
          event.preventDefault();
          first.focus();
        }
      }}>
      <header className={bookingModalStyles.header}>
        <div>
          <p className={bookingModalStyles.eyebrow}>Your next stop · {lounge.airportCode}</p>
          <h2 className={bookingModalStyles.title} id={titleId}>{lounge.name}</h2>
          <p className={bookingModalStyles.description} id={`${titleId}-description`}>
            A little space to unwind before you fly.
          </p>
        </div>
        <button type="button" aria-label="Close booking" disabled={isPending}
          className={bookingModalStyles.closeButton} onClick={requestClose}>
          <span aria-hidden="true">✕</span>
        </button>
      </header>
      <div className={bookingModalStyles.body}>
        <BookingForm lounge={lounge} onClose={requestClose} onPendingChange={setIsPending} />
      </div>
    </dialog>
  );
}

export { BookingModal };
