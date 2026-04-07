'use client';

import { useState, useTransition, useEffect } from 'react';
import { deleteTranslation } from '@/actions/paperTranslations';
import { IconTrash, IconAlertCircle, IconLoader } from '@tabler/icons-react';

export function DeleteTranslationButton({ id, paperId }: { id: string, paperId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      try {
        await deleteTranslation(id, paperId);
        setShowModal(false);
      } catch (error) {
        console.error('Failed to delete:', error);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending || isDeleting}
        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 focus:outline-none"
        title="Delete"
      >
        <IconTrash className="w-5 h-5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => !isDeleting && setShowModal(false)}
          />
          
          <div className="relative z-10 w-full max-w-md bg-[#F4F5F6] rounded-[24px] shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="w-14 h-14 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-200/50">
                 <IconAlertCircle size={28} strokeWidth={2} />
             </div>
             
             <h3 className="text-2xl font-serif font-bold text-[#10175b] mb-3">Delete this curation?</h3>
             <p className="text-slate-600 font-medium mb-8 text-base leading-relaxed">
               Are you sure you want to remove this saved translation? This action cannot be undone.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                  className="w-full sm:w-1/2 px-6 py-3.5 font-bold text-[#10175b] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconTrash className="w-4 h-4" />}
                  Delete
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
