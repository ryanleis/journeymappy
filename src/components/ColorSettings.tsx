import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';
import type { ThemePreset } from '../context/ColorContext';

export default function ColorSettings() {
  const { 
    colors, 
    setColors, 
    currentTheme,
    setCurrentTheme,
    availableThemes,
    saveCustomTheme,
    deleteCustomTheme,
    resetToTheme 
  } = useColors();
  
  const [isOpen, setIsOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [showSaveTheme, setShowSaveTheme] = useState(false);

  const colorFields = [
    { key: 'timelineColor', label: 'Timeline Color' },
    { key: 'activityBoxBackground', label: 'Activity Box Background' },
    { key: 'activityBoxText', label: 'Activity Box Text' },
    { key: 'pageBackground', label: 'Page Background' },
    { key: 'modalBackground', label: 'Modal Background' },
    { key: 'formBackground', label: 'Form Background' },
  ] as const;

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors({ ...colors, [key]: value });
  };

  const handleThemeChange = (theme: ThemePreset) => {
    setCurrentTheme(theme.name);
    resetToTheme(theme.name);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (newThemeName.trim()) {
      saveCustomTheme(newThemeName.trim());
      setNewThemeName('');
      setShowSaveTheme(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText 
        }}
        title="Color Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 rounded-xl shadow-2xl p-6 w-96 animate-slideUp"
          style={{ backgroundColor: colors.modalBackground }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Color Settings</h3>
            <button
              onClick={() => resetToTheme()}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: colors.activityBoxBackground,
                color: colors.activityBoxText,
                border: `1px solid ${colors.activityBoxText}`
              }}
              title="Reset to Current Theme"
            >
              ↺
            </button>
          </div>

          {/* Theme Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>Choose Theme</h4>
            <div className="grid grid-cols-3 gap-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  className="p-2 rounded-lg flex items-center justify-center gap-1 transition-all"
                  style={{ 
                    backgroundColor: currentTheme === theme.name ? theme.colors.activityBoxText : theme.colors.activityBoxBackground,
                    color: currentTheme === theme.name ? theme.colors.activityBoxBackground : theme.colors.activityBoxText,
                    border: `1px solid ${theme.colors.activityBoxText}`,
                    transform: currentTheme === theme.name ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <span>{theme.icon}</span>
                  <span className="text-sm">{theme.name}</span>
                  {!['Light', 'Dark', 'Nature', 'Ocean', 'Sunset'].includes(theme.name) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomTheme(theme.name);
                      }}
                      className="ml-1 opacity-60 hover:opacity-100"
                      title="Delete Custom Theme"
                    >
                      ×
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium" style={{ color: colors.activityBoxText }}>Customize Colors</h4>
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm" style={{ color: colors.activityBoxText }}>{label}</label>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Save Theme Button */}
          {!showSaveTheme ? (
            <button
              onClick={() => setShowSaveTheme(true)}
              className="w-full p-2 rounded-lg transition-colors text-sm"
              style={{ 
                backgroundColor: colors.activityBoxBackground,
                color: colors.activityBoxText,
                border: `1px solid ${colors.activityBoxText}`
              }}
            >
              Save as Custom Theme
            </button>
          ) : (
            <form onSubmit={handleSaveTheme} className="space-y-2">
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Enter theme name"
                className="w-full p-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: colors.activityBoxBackground,
                  color: colors.activityBoxText,
                  border: `1px solid ${colors.activityBoxText}`
                }}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 p-2 rounded-lg transition-colors text-sm"
                  style={{ 
                    backgroundColor: colors.activityBoxText,
                    color: colors.activityBoxBackground
                  }}
                >
                  Save Theme
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveTheme(false)}
                  className="p-2 rounded-lg transition-colors text-sm"
                  style={{ 
                    backgroundColor: colors.activityBoxBackground,
                    color: colors.activityBoxText,
                    border: `1px solid ${colors.activityBoxText}`
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <style jsx>{`
            @keyframes slideUp {
              from { transform: translateY(10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slideUp {
              animation: slideUp 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
} 