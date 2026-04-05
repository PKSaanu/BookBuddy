'use client';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ 
  children, 
  className = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" 
}: { 
  children: React.ReactNode,
  className?: string
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending ? 'Processing...' : children}
    </button>
  );
}
