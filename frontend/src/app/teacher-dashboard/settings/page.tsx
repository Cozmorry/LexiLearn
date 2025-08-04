"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '../components/NavigationBar';
import { authAPI, tokenUtils, userAPI } from '../../../services/api';

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

const TeacherSettingsPage: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    gradeLevel: '',
    subject: ''
  });
  const [settings, setSettings] = useState({
    theme: 'light' as 'light' | 'dark' | 'auto',
    notifications: {
      email: true,
      push: false
    },
    accessibility: {
      highContrast: false
    }
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await userAPI.getProfile();
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        school: userData.school || '',
        gradeLevel: userData.gradeLevel || '',
        subject: userData.subject || ''
      });
      const fallbackSettings = {
        theme: 'light',
        notifications: { email: true, push: false },
        accessibility: { highContrast: false }
      };
      const s = userData.settings || userData.preferences || fallbackSettings;
      setSettings({
        theme: s.theme || 'light',
        notifications: {
          email: s.notifications?.email ?? true,
          push: s.notifications?.push ?? false
        },
        accessibility: {
          highContrast: s.accessibility?.highContrast ?? false
        }
      });
    } catch (error: unknown) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (
    category: string,
    key: string,
    value: unknown
  ) => {
    setSettings(prev => {
      const cat = (prev as Record<string, unknown>)[category];
      const catObj = isObject(cat) ? cat : {};
      return {
        ...prev,
        [category]: {
          ...catObj,
          [key]: value
        }
      };
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await userAPI.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await userAPI.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      setSaving(true);
      await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authAPI.logout();
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  // Toggle Component
  const Toggle = ({ enabled, onChange, disabled = false, label }: { enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean; label?: string }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:ring-offset-2 ${
        enabled ? 'bg-[#4798ea]' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={label || (enabled ? 'Disable' : 'Enable')}
      title={label || (enabled ? 'Disable' : 'Enable')}
      type="button"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-sans">
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <NavigationBar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading settings...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar />

          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Settings</p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mx-4 mb-4 p-4 rounded-xl ${
                message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-[#dce0e5] mx-4 mb-6">
              <div className="px-6 py-4 border-b border-[#dce0e5]">
                <h2 className="text-[#111418] text-lg font-semibold">Profile Information</h2>
                <p className="text-[#637588] text-sm">Update your personal information</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">School</label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                      placeholder="Your school name"
                    />
                  </div>
                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">Grade Level</label>
                                         <select
                       name="gradeLevel"
                       value={formData.gradeLevel}
                       onChange={handleInputChange}
                       className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                       aria-label="Select grade level"
                     >
                      <option value="">Select grade level</option>
                      <option value="Elementary">Elementary</option>
                      <option value="Middle School">Middle School</option>
                      <option value="High School">High School</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#111418] text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                    placeholder="Your teaching subject"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-6 py-2 border border-[#dce0e5] text-[#111418] rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-xl border border-[#dce0e5] mx-4 mb-6">
              <div className="px-6 py-4 border-b border-[#dce0e5]">
                <h2 className="text-[#111418] text-lg font-semibold">Preferences</h2>
                <p className="text-[#637588] text-sm">Customize your experience</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-[#111418] text-sm font-medium mb-3">Theme</label>
                  <div className="flex gap-3">
                                         {(['light', 'dark', 'auto'] as const).map((theme) => (
                       <button
                         key={theme}
                         onClick={() => handleSettingsChange('theme', 'theme', theme)}
                         className={`px-4 py-2 rounded-lg border transition-colors ${
                           settings.theme === theme
                             ? 'border-[#4798ea] bg-[#4798ea] text-white'
                             : 'border-[#dce0e5] text-[#111418] hover:bg-gray-50'
                         }`}
                         aria-label={`Select ${theme} theme`}
                       >
                         {theme.charAt(0).toUpperCase() + theme.slice(1)}
                       </button>
                     ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="text-[#111418] text-sm font-medium">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#111418] text-sm font-medium">Email Notifications</p>
                        <p className="text-[#637588] text-xs">Receive updates via email</p>
                      </div>
                      <Toggle
                        enabled={settings.notifications.email}
                        onChange={(enabled) => handleSettingsChange('notifications', 'email', enabled)}
                        label="Email Notifications"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#111418] text-sm font-medium">Push Notifications</p>
                        <p className="text-[#637588] text-xs">Receive browser notifications</p>
                      </div>
                      <Toggle
                        enabled={settings.notifications.push}
                        onChange={(enabled) => handleSettingsChange('notifications', 'push', enabled)}
                        label="Push Notifications"
                      />
                    </div>
                  </div>
                </div>

                {/* Accessibility */}
                <div className="space-y-4">
                  <h3 className="text-[#111418] text-sm font-medium">Accessibility</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#111418] text-sm font-medium">High Contrast Mode</p>
                      <p className="text-[#637588] text-xs">Increase contrast for better visibility</p>
                    </div>
                    <Toggle
                      enabled={settings.accessibility.highContrast}
                      onChange={(enabled) => handleSettingsChange('accessibility', 'highContrast', enabled)}
                      label="High Contrast Mode"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>

            {/* Session Management */}
            <div className="bg-white rounded-xl border border-[#dce0e5] mx-4 mb-6">
              <div className="px-6 py-4 border-b border-[#dce0e5]">
                <h2 className="text-[#111418] text-lg font-semibold">Session</h2>
                <p className="text-[#637588] text-sm">Manage your account session</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between p-4 border border-[#dde0e4] rounded-xl">
                  <div>
                    <p className="text-[#111418] text-sm font-medium">Sign Out</p>
                    <p className="text-[#637588] text-xs">Sign out of your account on this device</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        Signing out...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-xl border border-[#dce0e5] mx-4 mb-6">
              <div className="px-6 py-4 border-b border-[#dce0e5]">
                <h2 className="text-[#111418] text-lg font-semibold">Help & Support</h2>
                <p className="text-[#637588] text-sm">Get help and contact support</p>
              </div>
              <div className="p-6 space-y-3">
                <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-[#111418] text-sm font-medium">Help Center</p>
                    <p className="text-[#637588] text-xs">Browse help articles and tutorials</p>
                  </div>
                  <svg className="w-4 h-4 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-[#111418] text-sm font-medium">Contact Support</p>
                    <p className="text-[#637588] text-xs">Get in touch with our support team</p>
                  </div>
                  <svg className="w-4 h-4 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-[#111418] text-sm font-medium">Feedback</p>
                    <p className="text-[#637588] text-xs">Share your thoughts and suggestions</p>
                  </div>
                  <svg className="w-4 h-4 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#111418]">Change Password</h2>
                             <button
                 onClick={() => setShowPasswordModal(false)}
                 className="text-[#637588] hover:text-[#111418]"
                 aria-label="Close password change modal"
               >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full border border-[#dce0e5] rounded-xl px-4 py-3 text-[#111418] focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-[#dce0e5] text-[#111418] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSettingsPage;