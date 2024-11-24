import React from "react";
import "./LanguageSelector.css";

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => {
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
    { code: "hi-IN", name: "Hindi (India)" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "de-DE", name: "German (Germany)" },
    { code: "ta-IN", name: "Tamil (India)" },
    { code: "te-IN", name: "Telugu (India)" },
    { code: "ml-IN", name: "Malayalam (India)" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "ru-RU", name: "Russian" },
    { code: "tl-PH", name: "Tagalog (Philippines)" },
    { code: "vi-VN", name: "Vietnamese" },
    { code: "it-IT", name: "Italian (Italy)" },
    { code: "pt-PT", name: "Portuguese (Portugal)" },
    { code: "bn-IN", name: "Bengali (India)" },
    { code: "pa-IN", name: "Punjabi (India)" },
    { code: "ur-PK", name: "Urdu (Pakistan)" },
    { code: "th-TH", name: "Thai (Thailand)" },
    // Add more languages as needed
  ];

  return (
    <div className="language-selector-container">
      <select
        className="language-selector"
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;

