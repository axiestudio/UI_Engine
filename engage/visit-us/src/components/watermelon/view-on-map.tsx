/**
 * Vendored from Watermelon UI registry: https://registry.watermelon.sh/r/view-on-map.json
 * Item: view-on-map (type registry:ui). Fetched 2026-08-29. Do not edit unless intentionally adopting upstream changes.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, MapPin } from 'lucide-react';

interface ViewOnMapProps {
  locationName?: string;
  address?: string;
  mapImageUrl?: string;
  className?: string;
}

export const ViewOnMap: React.FC<ViewOnMapProps> = ({
  address = 'Boston Public Garden',
  mapImageUrl = 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDark] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) setIsMapLoaded(false);
  };

  const springConfig = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  };

  const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`transition-colors duration-500`}>
      <div
        className={`flex min-h-full w-full flex-col items-center justify-center bg-transparent px-4`}
      >
        <div
          className={`relative flex w-full items-center justify-center ${className}`}
        >
          <AnimatePresence mode="popLayout">
            {!isOpen ? (
              /* --- PILL BUTTON --- */
              <motion.div
                key="button"
                layoutId="map-container"
                onClick={toggleOpen}
                className="group relative flex cursor-pointer items-center justify-center overflow-hidden bg-muted shadow-sm transition-colors duration-300 dark:bg-card"
                style={{ width: 180, height: 52, borderRadius: 26 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={springConfig}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  layoutId="map-bg"
                  className="absolute inset-0 opacity-20 brightness-110 grayscale transition-opacity dark:opacity-10 dark:brightness-50"
                  style={{
                    backgroundImage: `url(${mapImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                <motion.div className="relative z-10 flex items-center space-x-3 px-4 py-4">
                  <MapPin className="h-5 w-5 text-muted-foreground transition-colors dark:text-white/60" />
                  <span className="text-[18px] font-semibold tracking-tight text-foreground transition-colors dark:text-white">
                    View on Map
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              /* --- EXPANDED MAP --- */
              <motion.div
                key="map"
                layoutId="map-container"
                className="relative aspect-square w-[calc(w-full-64px)] overflow-hidden bg-muted shadow-lg transition-colors duration-300 sm:w-[380px] dark:bg-card"
                style={{ borderRadius: 32 }}
                transition={springConfig}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="absolute inset-0 h-full w-full brightness-[1.02] contrast-[1.05] grayscale-[0.9] saturate-[0.8] sepia-[0.1]"
                >
                  <iframe
                    title="Google Map"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: isDark
                        ? 'invert(90%) hue-rotate(180deg)'
                        : 'invert(15%) hue-rotate(180deg)',
                    }}
                    src={publicMapUrl}
                    allowFullScreen
                    onLoad={() => setIsMapLoaded(true)}
                    className={`transition-opacity duration-700 ${isMapLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </motion.div>

                {!isMapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted transition-colors dark:bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}

                {/* CLOSE BUTTON  */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={toggleOpen}
                  className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground active:scale-90 sm:top-6 sm:right-6 sm:h-11 sm:w-11"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
