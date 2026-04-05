'use client';
import { deleteTranslation } from '@/actions/translations';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

export function DeleteTranslationButton({ id, bookId }: { id: string, bookId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this translation?')) {
      startTransition(() => {
        deleteTranslation(id, bookId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 focus:outline-none"
      title="Delete"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
