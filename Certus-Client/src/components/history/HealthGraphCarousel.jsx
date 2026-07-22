import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HealthGraphCard from "./HealthGraphCard";
import { statusColors } from "./HealthStatusBadge";

export default function HealthGraphCarousel({ tests }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Reset to first slide if tests array changes (e.g. after search)
  useEffect(() => {
    setCurrentIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [tests]);

  const handleScroll = (e) => {
    const container = e.target;
    // Calculate current index based on scroll position
    const cardWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollToIndex = (index) => {
    if (index < 0 || index >= tests.length) return;
    setCurrentIndex(index);
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  const nextSlide = () => scrollToIndex(currentIndex + 1);
  const prevSlide = () => scrollToIndex(currentIndex - 1);

  if (!tests || tests.length === 0) return null;

  return (
    <div className="flex flex-col space-y-6 w-full relative">
      {/* Legend & Pagination Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Status Legend */}
        <div className="flex flex-wrap gap-3 items-center text-xs text-gray-300">
          <span className="font-semibold text-gray-400 mr-2 uppercase tracking-wider">Legend:</span>
          {["WORSENING", "NEEDS_ATTENTION", "IMPROVING", "RECOVERED", "STABLE_NORMAL"].map((status) => {
            const config = statusColors[status];
            if (!config) return null;
            return (
              <div key={status} className="flex items-center space-x-1.5">
                <div className={`w-2 h-2 rounded-full ${config.bg.replace('/20', '')}`} style={{ backgroundColor: config.dot === "red" ? "#ef4444" : config.dot === "orange" ? "#f97316" : "#10b981" }}></div>
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>

        {/* Desktop Controls & Pagination */}
        <div className="flex items-center space-x-4 bg-white/5 rounded-full px-4 py-1.5 border border-white/10 glass-card">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-sm font-medium text-white min-w-[60px] text-center tracking-widest">
            {currentIndex + 1} <span className="text-gray-500 mx-1">/</span> {tests.length}
          </div>
          
          <button
            onClick={nextSlide}
            disabled={currentIndex === tests.length - 1}
            className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="relative w-full overflow-hidden group">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tests.map((test, index) => (
            <div key={`${test.testName}-${index}`} className="w-full shrink-0 snap-center transition-opacity duration-300">
              <HealthGraphCard test={test} />
            </div>
          ))}
        </div>
        
        {/* Absolute positioned Desktop Arrows (appear on hover over graph area) */}
        <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-10">
           <button
             onClick={prevSlide}
             disabled={currentIndex === 0}
             className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto border border-white/10 shadow-xl hover:bg-black/70 disabled:opacity-0 transition-all transform -translate-x-6 group-hover:translate-x-0"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
        </div>
        
        <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-10">
           <button
             onClick={nextSlide}
             disabled={currentIndex === tests.length - 1}
             className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto border border-white/10 shadow-xl hover:bg-black/70 disabled:opacity-0 transition-all transform translate-x-6 group-hover:translate-x-0"
           >
             <ChevronRight className="w-6 h-6" />
           </button>
        </div>
      </div>
      
      {/* CSS to hide scrollbar explicitly for the track */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
