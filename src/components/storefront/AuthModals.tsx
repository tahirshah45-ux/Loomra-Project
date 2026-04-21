import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Info, RefreshCcw } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { toast } from 'react-toastify';
import type { UserProfile, Order, Page } from '../../types';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
  orders: Order[];
  setPage: (page: Page) => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  orders,
  setPage
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        // Login logic
        if (password === '123456' || password.length >= 6) { // Simple validation for demo
          setCurrentUser(existingUser);
          toast.success(`Welcome back, ${existingUser.name}!`);
          onClose();
        } else {
          setError('Invalid Password. Please try again.');
        }
      } else {
        // Instant Signup logic
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email: email,
          createdAt: new Date().toISOString(),
          profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
        toast.success(`Account created! Welcome to Loomra, ${newUser.name}.`);
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome to Loomra!');
      onClose();
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google login.');
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (currentUser) {
    const userOrders = orders.filter(o => o.phone === currentUser.phone || o.customerName === currentUser.name);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16 pb-16 border-b border-neutral-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-50 shadow-xl">
                  <img src={currentUser.profilePicture} className="w-full h-full object-cover" alt={currentUser.name} />
                </div>
                <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-red-600 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <div className="text-center md:text-left flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 mb-2 block">Member Since {new Date(currentUser.createdAt).getFullYear()}</span>
                <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{currentUser.name}</h1>
                <p className="text-neutral-500 font-medium">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  toast.info('Logged out successfully');
                  onClose();
                }}
                className="px-8 py-4 border-2 border-black text-black font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Logout
              </button>
            </div>

            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight uppercase">Recent Orders</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{userOrders.length} Orders Total</span>
              </div>

              {userOrders.length > 0 ? (
                <div className="grid gap-6">
                  {userOrders.map(order => (
                    <div key={order.id} className="p-8 bg-neutral-50 rounded-3xl border border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-black/20 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black uppercase tracking-tight">Order #{order.id}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                            order.status === 'Delivered' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Amount</p>
                          <p className="text-sm font-black">Rs. {order.totalAmount.toLocaleString()}</p>
                        </div>
                        <button className="p-4 bg-white rounded-2xl border border-neutral-200 group-hover:bg-black group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-neutral-100 rounded-[40px]">
                  <svg className="w-12 h-12 mx-auto mb-6 text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">No orders found yet.</p>
                  <button onClick={() => { setPage('shop'); onClose(); }} className="mt-6 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1">Start Shopping</button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Loomra Account</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Enter your details to continue</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">Email or Phone</label>
              <input
                required
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <Info size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-5 bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-600 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              {isLoading ? 'Processing...' : 'Continue to Dashboard'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 leading-relaxed">
              New here? Just enter your email and we'll create your account instantly.
            </p>
          </div>

          {/* Google Sign-In for Customers */}
          <div className="mt-8 pt-8 border-t border-neutral-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center mb-4">Or continue with</p>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 border-2 border-black text-black font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 rounded-2xl"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModals;