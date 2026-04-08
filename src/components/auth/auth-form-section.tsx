import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import type { AuthMode } from './auth-page';

interface AuthFormSectionProps {
  mode: AuthMode;
  onToggleMode: () => void;
}

export function AuthFormSection({ mode, onToggleMode }: AuthFormSectionProps) {
  return (
    <div className="w-full flex flex-col">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-serif font-black text-[#10175b] tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          {mode === 'login' 
            ? 'Enter your details to access your library'
            : 'Start your scholarly journey today'}
        </p>
      </div>

      {mode === 'login' ? <LoginForm /> : <SignupForm />}

      <div className="mt-8 text-center">
        <p className="text-[15px] font-medium text-slate-500">
          {mode === 'login' ? 'New to BookBudddy?' : 'Already a member?'}
          {' '}
          <button 
            onClick={onToggleMode}
            type="button"
            className="font-bold text-[#283593] hover:text-[#10175b] transition-colors hover:underline underline-offset-4 decoration-2"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
