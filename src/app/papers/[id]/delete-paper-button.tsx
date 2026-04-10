'use client';

import { useState, useEffect } from 'react';
import { IconTrash, IconLoader, IconAlertCircle } from '@tabler/icons-react';
import { deletePaper } from '@/actions/papers';
import { useRouter } from 'next/navigation';

export function DeletePaperButton({ paperId, paperTitle }: { paperId: string, paperTitle: string }) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showModal]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePaper(paperId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      // Redirect immediately upon success
      document.body.style.overflow = '';
      router.push('/library');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors"
        title="Delete Paper"
      >
        <IconTrash size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#F4F5F6] rounded-[24px] shadow-2xl p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
             
             <div className="w-16 h-16 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-200/50">
                 <IconAlertCircle size={32} strokeWidth={2} />
             </div>
             
             <h3 className="text-3xl font-serif font-bold text-[#10175b] mb-4">Delete this paper?</h3>
             <p className="text-slate-600 font-medium mb-8 text-lg leading-relaxed">
               Are you sure you want to permanently delete <strong className="text-[#10175b] font-serif font-bold italic">{paperTitle}</strong> from your library? All translated vocabulary associated with this paper will also be lost forever.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                  className="w-full sm:w-1/2 px-6 py-4 font-bold text-[#10175b] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? <IconLoader className="w-5 h-5 animate-spin" /> : <IconTrash className="w-5 h-5" />}
                  Yes, delete it
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
