"use client";

import { signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";

// Shared Login Handler
const handleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login failed:", error);
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

interface  AuthProps {
    user: User | null;
}

export function UserSessionHeader({ user }: AuthProps) {
  if (!user) return null;

  return (
    <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
      {user.photoURL ? (
        <img 
          src={user.photoURL} 
          alt={user.displayName || "User"} 
          className="w-8 h-8 rounded-full border border-white/20"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center font-bold text-white text-xs">
            {user.displayName?.charAt(0) || "U"}
        </div>
      )}
      
      <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-white text-xs font-bold leading-none">{user.displayName}</span>
          <span className="text-white/40 text-[10px] uppercase tracking-wider">Member</span>
      </div>

      <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

      <button 
        onClick={handleLogout}
        className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

export function HeroLoginButton({ user }: AuthProps) {
    if (user) return null;

    return (
        <button 
            onClick={handleLogin}
            className="mt-4 flex items-center gap-3 px-6 py-3 bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 group"
        >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span>Đăng nhập</span>
        </button>
    );
}
