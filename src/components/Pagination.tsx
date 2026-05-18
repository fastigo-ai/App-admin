import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to show (Google style: current +/- 2)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const left = currentPage - delta;
    const right = currentPage + delta;
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all active:scale-95"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-gray-400 font-bold">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[42px] h-[42px] flex items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all active:scale-95"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Info text */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        Showing Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span>
      </p>
    </div>
  );
};

export default Pagination;
