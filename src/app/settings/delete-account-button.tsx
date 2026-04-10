'use client';

import { useState, useEffect } from 'react';
import { IconTrash, IconLoader, IconAlertCircle } from '@tabler/icons-react';
import { deleteAccount } from '@/actions/user';
import { useRouter } from 'next/navigation';

export function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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
    const result = await deleteAccount();
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      document.body.style.overflow = '';
      router.push('/login');
    }
  };

  return (
    <>
      <div className="mt-8 border border-red-200/50 bg-red-50/30 rounded-[32px] p-10 hover:bg-red-50 transition-colors group">
          <h3 className="text-sm font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Danger Zone
          </h3>
          <p className="text-sm text-red-900/60 leading-relaxed font-medium mb-10">
              Deleting your account will permanently erase your library, progress, and custom curations. This action cannot be undone.
          </p>
          
          <button 
            onClick={() => setShowModal(true)}
            className="w-full font-black text-[12px] uppercase tracking-widest text-red-600 py-4 px-6 border border-red-200 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm hover:shadow-xl hover:shadow-red-600/20 active:scale-[0.98]"
          >
              Deactivate Account
          </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#F4F5F6] rounded-[24px] shadow-2xl p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
             
             <div className="w-16 h-16 bg-red-100/50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-200/50">
                 <IconAlertCircle size={32} strokeWidth={2} />
             </div>
             
             <h3 className="text-3xl font-serif font-bold text-[#10175b] mb-4">Deactivate Account?</h3>
             <p className="text-slate-600 font-medium mb-8 text-lg leading-relaxed">
               Are you sure you want to permanently delete your account? All your books, curated vocabulary, and progress will be lost forever.
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
                  Deactivate
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
