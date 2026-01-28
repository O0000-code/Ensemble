import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showHeader?: boolean;
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '640px',
  showHeader = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="modal-overlay-animate fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        ref={dialogRef}
        style={{ maxWidth }}
        className="modal-dialog-animate relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_rgba(0,0,0,0.1)]"
      >
        {/* Modal Header */}
        {showHeader && (
          <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#E5E5E5] px-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#18181B]">{title}</h2>
              {subtitle && (
                <p className="text-[13px] font-normal text-[#71717A]">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#F4F4F5]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-[#71717A]" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
