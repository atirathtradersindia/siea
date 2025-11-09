import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { ref, onValue, set, off } from "firebase/database";
import { useLanguage } from "../contexts/LanguageContext";

export default function ProfilePanel({ isOpen, profile, setProfile, onClose, onLogout }) {
  const { t, setLanguage, currentLang } = useLanguage();
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAccountSection, setShowAccountSection] = useState(false);
  const [showSettingsSection, setShowSettingsSection] = useState(false);
  const [isSwitchingLanguage, setIsSwitchingLanguage] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      const userRef = ref(db, `users/${profile.uid}`);
      const listener = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setEditData({
            name: data.fullName || data.name || "", // Fallback to 'name' if 'fullName' is missing
            email: data.email || auth.currentUser?.email || "", // Fallback to auth email
            phone: data.phone || "",
            avatar: data.avatar || ""
          });
          console.log("Fetched user data:", data); // Debug log
        } else {
          setEditData({
            name: "",
            email: auth.currentUser?.email || "",
            phone: "",
            avatar: ""
          });
          console.log("No user data found, using auth email:", auth.currentUser?.email);
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
        setEditData({
          name: "",
          email: auth.currentUser?.email || "",
          phone: "",
          avatar: ""
        });
      });
      return () => off(userRef, 'value', listener);
    } else {
      setEditData({
        name: "",
        email: auth.currentUser?.email || "",
        phone: "",
        avatar: ""
      });
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  }, [profile]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditData((p) => ({ ...p, [id]: value }));
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to save profile' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userRef = ref(db, `users/${auth.currentUser.uid}`);
      await set(userRef, {
        fullName: editData.name,
        email: auth.currentUser.email || editData.email,
        phone: editData.phone,
        avatar: editData.avatar,
        uid: auth.currentUser.uid
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyAccountClick = () => {
    setShowAccountSection(!showAccountSection);
  };

  const handleSettingsClick = () => {
    setShowSettingsSection(!showSettingsSection);
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setIsSwitchingLanguage(true);
    setTimeout(() => {
      setLanguage(newLanguage);
      setIsSwitchingLanguage(false);
      console.log('Language changed to:', newLanguage);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-40 tw-z-40 tw-transition-opacity tw-duration-300"
        onClick={onClose}
        aria-hidden="true"
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      <aside
        className="tw-fixed tw-top-16 tw-right-4 tw-w-80 tw-max-h-[80vh] tw-overflow-y-auto tw-bg-gray-800 tw-text-white tw-rounded-lg tw-shadow-lg tw-z-50 tw-transform tw-transition-all tw-duration-300"
        role="dialog"
        aria-modal="true"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)', opacity: isOpen ? 1 : 0 }}
      >
        <div className="tw-flex tw-items-center tw-p-4 tw-border-b tw-border-gray-700">
          <div className="tw-w-12 tw-h-12 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-lg">
            {editData.avatar ? (
              <img src={editData.avatar} alt="Avatar" className="tw-w-full tw-h-full tw-rounded-full tw-object-cover" />
            ) : (
              editData.name.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div className="tw-ml-3">
            <div className="tw-font-semibold">{editData.name || t('guest')}</div>
            <div className="tw-text-sm tw-text-gray-400">{editData.email || t('guest_email')}</div>
          </div>
        </div>

        <div className="tw-p-2">
          <button
            onClick={handleMyAccountClick}
            className="tw-flex tw-items-center tw-w-full tw-p-2 tw-text-gray-300 hover:tw-bg-gray-700 tw-rounded tw-transition-colors tw-duration-200"
          >
            <span className="tw-mr-2">👤</span> {t('my_account')} {showAccountSection ? '▼' : '▶'}
          </button>
          <button
            onClick={() => {/* Handle My Orders click */}}
            className="tw-flex tw-items-center tw-w-full tw-p-2 tw-text-gray-300 hover:tw-bg-gray-700 tw-rounded tw-transition-colors tw-duration-200"
          >
            <span className="tw-mr-2">🛒</span> {t('my_orders')}
          </button>
          <button
            onClick={handleSettingsClick}
            className="tw-flex tw-items-center tw-w-full tw-p-2 tw-text-white tw-bg-black tw-border tw-border-yellow-400 tw-rounded tw-hover:bg-gray-700 tw-transition-colors tw-duration-200"
          >
            <span className="tw-mr-2">🌐</span> {t('settings')} {showSettingsSection ? '▼' : '▶'}
          </button>
          {showSettingsSection && (
            <div className="tw-p-2 tw-bg-black tw-border tw-border-yellow-400 tw-rounded tw-mt-1 tw-transition-opacity tw-duration-300"
                 style={{ opacity: isSwitchingLanguage ? 0 : 1 }}>
              <select
                value={currentLang}
                onChange={handleLanguageChange}
                className="tw-w-full tw-p-2 tw-bg-black tw-text-white tw-border-0 focus:tw-outline-none tw-transition-opacity tw-duration-300"
                aria-label={t('select_language')}
                style={{ opacity: isSwitchingLanguage ? 0 : 1 }}
              >
                <option value="en">{t('english')}</option>
                <option value="te">{t('telugu')}</option>
                <option value="hi">{t('hindi')}</option>
                <option value="ur">{t('urdu')}</option>
                <option value="es">{t('spanish')}</option>
                <option value="fr">{t('french')}</option>
              </select>
            </div>
          )}
          <button
            onClick={handleLogoutClick}
            className="tw-flex tw-items-center tw-w-full tw-p-2 tw-text-red-400 hover:tw-bg-red-700 tw-rounded tw-transition-colors tw-duration-200"
          >
            <span className="tw-mr-2">🚪</span> {t('sign_out')}
          </button>
        </div>

        {showAccountSection && (
          <div className="tw-border-t tw-border-gray-700 tw-p-4 tw-transition-opacity tw-duration-300"
               style={{ opacity: showAccountSection ? 1 : 0 }}>
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
              <h3 className="tw-text-lg tw-font-semibold">{t('profile_details')}</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="tw-text-sm tw-text-blue-400 hover:tw-text-blue-300 tw-transition-colors tw-duration-200"
              >
                {isEditing ? t('cancel') : t('edit')}
              </button>
            </div>
            {isEditing ? (
              <div className="tw-space-y-3">
                {['name', 'email', 'phone'].map((field) => (
                  <div key={field}>
                    <label className="tw-text-sm tw-capitalize tw-text-gray-300">{t(field)}</label>
                    <input
                      id={field}
                      type={field === 'email' ? 'email' : 'text'}
                      value={editData[field]}
                      onChange={handleChange}
                      className="tw-w-full tw-p-2 tw-mt-1 tw-bg-gray-700 tw-rounded tw-text-white tw-border tw-border-gray-600 focus:tw-outline-none focus:tw-border-blue-400 tw-transition-colors tw-duration-200"
                      placeholder={t(`enter_${field}`)}
                    />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`tw-w-full tw-py-2 tw-rounded tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 tw-transition-colors tw-duration-200 ${isLoading ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                >
                  {isLoading ? t('saving') : t('save_changes')}
                </button>
              </div>
            ) : (
              <div className="tw-space-y-2 tw-text-sm">
                <p><span className="tw-font-medium">{t('name')}:</span> {editData.name || t('not_set')}</p>
                <p><span className="tw-font-medium">{t('email')}:</span> {editData.email || t('not_set')}</p>
                <p><span className="tw-font-medium">{t('phone')}:</span> {editData.phone || t('not_set')}</p>
              </div>
            )}
            {message.type && (
              <div className={`tw-mt-2 tw-p-2 tw-rounded tw-text-center ${message.type === 'error' ? 'tw-bg-red-600/20' : 'tw-bg-green-600/20'} tw-transition-opacity tw-duration-300`}
                   style={{ opacity: message.type ? 1 : 0 }}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}