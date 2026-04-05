'use client';
import { useState, useEffect } from 'react';
import { CreateBookModal } from './create-book-modal';

export function AddBookHeaderButton() {
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showAddModal]);

  return (
    <>
      <button 
        onClick={() => setShowAddModal(true)}
        className="bg-[#10175b] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a2066] transition-colors shadow-sm whitespace-nowrap"
      >
        Add New Book
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
             <CreateBookModal onSuccess={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
    </>
  );
}
