import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const VideoModal = ({ video, onClose }) => {
  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${video.title} demo video`}
        >
          <motion.div
            className="w-full max-w-4xl"
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="font-medium">{video.title} · Demo</p>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Close video">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                title={`${video.title} demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
