import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, User, ShieldCheck, Calendar, Clock, Info } from 'lucide-react';

export default function TeacherProfile() {
  const { user } = useAuth();
  
  // Create initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const fullName = user?.name || user?.fullName || 'Dr. Priya Mehta';
  
  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your account information.</p>
      </div>

      {/* Hero Banner (Matching the Teacher Dashboard aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 border-2 border-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner flex-shrink-0">
            <span className="text-4xl font-black tracking-tighter text-white">{getInitials(fullName)}</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-3 text-white">{fullName}</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-900/30 border border-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider text-white">Faculty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">View-Only Access</h4>
          <p className="text-sm text-blue-800/80 font-medium leading-relaxed">
            Account information is securely managed by the Administrator. If you need any changes to your profile credentials, password, or contact details, please contact the Admin panel.
          </p>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800">Personal Information</h3>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Field: Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold shadow-sm cursor-not-allowed opacity-90">
                {fullName}
              </div>
            </div>



            {/* Field: Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold shadow-sm cursor-not-allowed opacity-90">
                {user?.email || 'priya.mehta@cdac.in'}
              </div>
            </div>

            {/* Field: Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold shadow-sm cursor-not-allowed opacity-90">
                +91 9123456789
              </div>
            </div>

            {/* Field: Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                <ShieldCheck className="w-4 h-4" /> Role
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold shadow-sm cursor-not-allowed opacity-90 capitalize">
                {user?.role || 'Teacher'}
              </div>
            </div>

            {/* Field: Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                <ShieldCheck className="w-4 h-4" /> Account Status
              </label>
              <div className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 text-emerald-700 font-bold shadow-sm cursor-not-allowed flex items-center justify-between">
                Active Account
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              </div>
            </div>

            {/* Field: Created Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                <Calendar className="w-4 h-4" /> Account Created On
              </label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold shadow-sm cursor-not-allowed opacity-90">
                August 12, 2024
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
