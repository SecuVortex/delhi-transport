/**
 * Lightweight Internationalization (i18n) Dictionary
 * Supports English ('en') and Hindi ('hi') for Delhi transit commuter and operator portals.
 */

export const TRANSLATIONS = {
  en: {
    // Navigation & Profiles
    commuter_dashboard: 'Commuter Dashboard',
    operator_dashboard: 'Operator Dashboard',
    operations_overview: 'Operations Overview',
    live_route_map: 'Live Route Map',
    live_map: 'Live Map',
    bus_routes: 'Bus Routes',
    alerts: 'Alerts',
    settings: 'Settings',
    help_guide: 'Help / Crowding Guide',
    validation_proof: 'Validation & Proof',
    everyday_commuter: 'Everyday Commuter',
    dtc_planner: 'DTC Transit Planner',
    commuter_portal: 'Commuter Portal',
    operator_portal: 'Operator Portal',

    // Commuter Journey Search & Options
    origin: 'Origin',
    destination: 'Destination',
    day_type: 'Day Type',
    departure_time: 'Departure Time',
    find_routes: 'Find Routes',
    finding_routes: 'Finding Routes...',
    swap_stops: 'Swap origin and destination',
    delhi_hubs: 'Delhi Hubs',

    // Crowding Pills & Badges
    seats_available: 'Seats Available',
    standing_room: 'Standing Room',
    crowded: 'Crowded',
    high_confidence: 'HIGH CONFIDENCE',
    med_confidence: 'MEDIUM CONFIDENCE',
    low_confidence: 'LOW CONFIDENCE',

    // Journey Cards & Sort
    fastest: 'Fastest',
    more_comfortable: 'More Comfortable',
    leave_later: 'Leave 20 min Later',
    leave_later_seats: 'Leave 20 min Later for Seats',
    duration: 'Duration',
    transfers: 'Transfers',
    direct_trip: 'Direct Trip',
    est_riders: 'Est. Riders',
    stop_crowding_breakdown: 'Stop-by-Stop Crowding Breakdown',

    // Operator Headings
    corridor_hotspots: 'Corridor Bottlenecks',
    ranked_bottlenecks: 'Ranked Bottleneck Corridors',
    peak_hour: 'Peak Hours',
    extra_buses: 'Extra Buses Needed',
    model_assumptions: 'Model Assumptions',
    pass_multiplier: 'Pass Multiplier',
    bus_capacity: 'Bus Capacity',

    // Settings Headers & Labels
    settings_title: 'Platform Preferences & Settings',
    settings_subtitle: 'Configure theme, language, notifications, time format, and legal terms.',
    appearance_section: 'Theme & Appearance',
    theme_label: 'Color Theme',
    theme_desc: 'Select preferred display appearance or follow system defaults.',
    light_mode: 'Light',
    dark_mode: 'Dark',
    system_mode: 'System',
    language_section: 'Language / भाषा',
    language_label: 'Display Language',
    language_desc: 'Choose interface language (English or हिन्दी).',
    notifications_section: 'Stop & Crowding Notifications',
    crowding_surge_title: 'Crowding Surge Alerts',
    crowding_surge_desc: 'Warn when a searched route exceeds 85% passenger capacity.',
    departure_reminder_title: 'Stop / Departure Reminders',
    departure_reminder_desc: 'Notify before a shifted +20 min departure option.',
    alert_threshold_title: 'Preferred Alert Threshold',
    alert_threshold_desc: 'Trigger warnings when crowding crosses selected threshold.',
    test_notification_btn: 'Test Notification',
    time_format_section: 'Time & Display Format',
    time_format_label: 'Time Display Format',
    time_format_desc: 'Choose between 12-hour (6:00 PM IST) and 24-hour (18:00 IST) standard.',
    time_12h: '12-Hour (e.g. 6:00 PM IST)',
    time_24h: '24-Hour (e.g. 18:00 IST)',
    about_legal_section: 'About & Legal Terms',
    terms_of_use: 'Terms of Use',
    privacy_policy: 'Privacy Policy',
    restore_defaults: 'Restore Defaults',
    save_configuration: 'Save Configuration',
    saved_success: 'Settings updated successfully.',

    // Common
    online_duckdb: 'Live: DuckDB',
    backend_offline: 'Backend Offline'
  },
  hi: {
    // Navigation & Profiles
    commuter_dashboard: 'कम्यूटर डैशबोर्ड',
    operator_dashboard: 'ऑपरेटर डैशबोर्ड',
    operations_overview: 'संचालन विवरण',
    live_route_map: 'लाइव रूट मैप',
    live_map: 'लाइव मैप',
    bus_routes: 'बस रूट्स',
    alerts: 'अलर्ट्स',
    settings: 'सेटिंग्स',
    help_guide: 'सहायता / भीड़ गाइड',
    validation_proof: 'सत्यापन और साक्ष्य',
    everyday_commuter: 'दैनिक यात्री (Commuter)',
    dtc_planner: 'डीटीसी ट्रांजिट प्लानर',
    commuter_portal: 'यात्री पोर्टल',
    operator_portal: 'ऑपरेटर पोर्टल',

    // Commuter Journey Search & Options
    origin: 'प्रस्थान स्टॉप (Origin)',
    destination: 'गंतव्य स्टॉप (Destination)',
    day_type: 'दिन का प्रकार',
    departure_time: 'प्रस्थान समय',
    find_routes: 'बस मार्ग खोजें',
    finding_routes: 'खोज जारी है...',
    swap_stops: 'प्रस्थान और गंतव्य बदलें',
    delhi_hubs: 'दिल्ली हब्स',

    // Crowding Pills & Badges
    seats_available: 'सीटें उपलब्ध',
    standing_room: 'खड़े रहने की जगह',
    crowded: 'भीड़भाड़ (Crowded)',
    high_confidence: 'उच्च सटीकता (High)',
    med_confidence: 'मध्यम सटीकता (Med)',
    low_confidence: 'निम्न सटीकता (Low)',

    // Journey Cards & Sort
    fastest: 'सबसे तेज़ (Fastest)',
    more_comfortable: 'अधिक आरामदायक (Comfortable)',
    leave_later: '20 मिनट बाद निकलें',
    leave_later_seats: 'सीटों के लिए 20 मिनट बाद निकलें',
    duration: 'यात्रा अवधि',
    transfers: 'बदलने की संख्या',
    direct_trip: 'सीधी बस यात्रा',
    est_riders: 'अनुमानित यात्री',
    stop_crowding_breakdown: 'स्टॉप-दर-स्टॉप भीड़भाड़ विवरण',

    // Operator Headings
    corridor_hotspots: 'कॉरिडोर बॉटलनेक',
    ranked_bottlenecks: 'रैंक किए गए बॉटलनेक कॉरिडोर',
    peak_hour: 'पीक आवर्स',
    extra_buses: 'अतिरिक्त बस आवश्यकता',
    model_assumptions: 'मॉडल धारणाएं',
    pass_multiplier: 'पास मल्टीप्लायर',
    bus_capacity: 'बस क्षमता',

    // Settings Headers & Labels
    settings_title: 'प्लेटफ़ॉर्म प्राथमिकताएं और सेटिंग्स',
    settings_subtitle: 'थीम, भाषा, नोटिफिकेशन, समय प्रारूप और कानूनी शर्तों को कॉन्फ़िगर करें।',
    appearance_section: 'थीम और दिखावट (Appearance)',
    theme_label: 'रंग थीम (Color Theme)',
    theme_desc: 'पसंदीदा डिस्प्ले मोड चुनें या सिस्टम डिफॉल्ट का पालन करें।',
    light_mode: 'लाइट (Light)',
    dark_mode: 'डार्क (Dark)',
    system_mode: 'सिस्टम (System)',
    language_section: 'भाषा / Language',
    language_label: 'डिस्प्ले भाषा',
    language_desc: 'इंटरफ़ेस भाषा चुनें (English या हिन्दी)।',
    notifications_section: 'स्टॉप और भीड़भाड़ नोटिफिकेशन',
    crowding_surge_title: 'भीड़भाड़ वृद्धि अलर्ट',
    crowding_surge_desc: 'जब मार्ग क्षमता 85% से अधिक हो तो चेतावनी दें।',
    departure_reminder_title: 'स्टॉप / प्रस्थान रिमाइंडर',
    departure_reminder_desc: '+20 मिनट बाद के प्रस्थान विकल्प से पहले सूचित करें।',
    alert_threshold_title: 'अलर्ट सीमा (Threshold)',
    alert_threshold_desc: 'भीड़ चयनित सीमा पार करने पर चेतावनी ट्रिगर करें।',
    test_notification_btn: 'टेस्ट नोटिफिकेशन',
    time_format_section: 'समय एवं प्रदर्शन प्रारूप',
    time_format_label: 'समय प्रदर्शन प्रारूप',
    time_format_desc: '12-घंटे (6:00 PM IST) या 24-घंटे (18:00 IST) प्रारूप चुनें।',
    time_12h: '12-घंटे (जैसे 6:00 PM IST)',
    time_24h: '24-घंटे (जैसे 18:00 IST)',
    about_legal_section: 'हमारे बारे में और कानूनी शर्तें',
    terms_of_use: 'उपयोग की शर्तें (Terms of Use)',
    privacy_policy: 'गोपनीयता नीति (Privacy Policy)',
    restore_defaults: 'डिफ़ॉल्ट पुनर्स्थापित करें',
    save_configuration: 'कॉन्फ़िगरेशन सहेजें',
    saved_success: 'सेटिंग्स सफलतापूर्वक सहेजी गईं।',

    // Common
    online_duckdb: 'लाइव: डकडीबी',
    backend_offline: 'बैकएंड ऑफलाइन'
  }
};

/**
 * Returns translation for a key, falling back to English or key itself.
 */
export function getTranslation(key, lang = 'en') {
  const currentLang = lang === 'hi' ? 'hi' : 'en';
  if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
    return TRANSLATIONS[currentLang][key];
  }
  if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
    return TRANSLATIONS.en[key];
  }
  return key;
}
