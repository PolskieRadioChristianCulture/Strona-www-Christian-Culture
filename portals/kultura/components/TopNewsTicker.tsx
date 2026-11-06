import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fixOrphans, REVOLUT_LINK, YOUTUBE_DAILY_MIRACLES_PLAYLIST_URL, 
  HOTLINE_NADZIEJA_NUMBER, CHRISTIAN_CULTURE_HOMEPAGE_URL, SMS_SUB_NUMBER, 
  TickerContentItem, SMS_SUB_MESSAGE_PL, SMS_SUB_MESSAGE_EN, CHRISTIAN_DATING_APP_URL
} from '../types';

interface TopNewsTickerProps {
  appLanguage: 'pl' | 'en';
  installStatus: 'install' | 'installed' | 'update';
  onInstallClick: () => void;
  onOpenSmsSubscriptionModal: () => void; 
  onOpenSupport: () => void; 
  onShareApp: () => void; 
  onIntentionsVisibilityChange?: (isVisible: boolean) => void;
}

const WHATSAPP_PRAYER_GROUP_URL = "https://chat.whatsapp.com/LGzSCB9K5Vp2jTF8dIALI6";

const MOTIVATIONAL_PHRASES = {
  pl: [
    "Bóg ma dla Ciebie plan pełen pokoju i nadziei. Zaufaj Mu dzisiaj całym sercem.",
    "Jesteś światłością świata, niech Twój blask dziś lśni przed ludźmi ku chwale Ojca.",
    "Wszystko możesz w Tym, który Cię umacnia. Nie bój się wyzwań tego dnia.",
    "Wiara góry przenosi, a Twoja miłość build bridge do serc innych ludzi.",
    "Twoja obecność tutaj to Boże błogosławieństwo. Idź i czyń dobro w imię Jezusa.",
    "Pamiętaj, że Pan jest Twoim pasterzem. Niczego Ci dzisiaj nie braknie.",
    "Dobre Słowo ma moc uzdrawiania. Podziel się nim z kimś, kto dziś tego potrzebuje."
  ],
  en: [
    "God has a plan for you full of peace and hope. Trust Him today with all your heart.",
    "You are the light of the world, let your light shine before others for the glory of the Father.",
    "You can do all things through Him who strengthens you. Do not fear today's challenges.",
    "Faith moves mountains, and your love builds bridges to the hearts of others.",
    "Your presence here is a blessing from God. Go and do good in Jesus' name.",
    "Remember that the Lord is your shepherd. You shall not want for anything today.",
    "A good word has the power to heal. Share it with someone who needs it today."
  ]
};

const PRAYER_INTENTIONS_BY_LANG = {
  pl: [
    { id: 1, text: "Zdrowie siostry Zofii - o Boży dotyk i uleczenie z nadciśnienia krwi." },
    { id: 2, text: "Błogosławieństwo dla misji Christian Culture i wszystkich odbiorców." },
    { id: 3, text: "Wioletta - o nową, Bożą pracę zgodną z jej talentami." },
    { id: 4, text: "Cezary - o Boże błogosławieństwo i opiekę dla jego dzieci." },
    { id: 5, text: "O Brata Pawła - o Boże prowadzenie w jego służbie i życiu prywatnym." },
    { id: 6, text: "O pokój w sercach i na świecie przez moc Ewangelii." }
  ],
  en: [
    { id: 1, text: "Health for Sister Zofia - for God's touch and healing from high blood pressure." },
    { id: 2, text: "Blessing for the Christian Culture mission and all recipients." },
    { id: 3, text: "Violetta - for a new, godly job in line with her talents." },
    { id: 4, text: "Cezary - for God's blessing and protection for his children." },
    { id: 5, text: "For Brother Pawel - for God's guidance in his service and private life." },
    { id: 6, text: "For peace in hearts and in the world through the power of the Gospel." }
  ]
};

export const TopNewsTicker: React.FC<TopNewsTickerProps> = ({ appLanguage, installStatus, onInstallClick, onOpenSmsSubscriptionModal, onOpenSupport, onShareApp, onIntentionsVisibilityChange }) => {
  const [now, setNow] = useState(new Date());
  const [displayContent, setDisplayContent] = useState<'news' | 'date' | 'time'>('news');
  const [blinkColon, setBlinkColon] = useState(true);
  const [isHourlySpecial, setIsHourlySpecial] = useState(false);
  const [randomPhrase, setRandomPhrase] = useState("");
  const [showIntentionsManual, setShowIntentionsManual] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    if (minutes === 0 && seconds === 0 && !isHourlySpecial) {
      const hours = now.getHours();
      const isPrayerHour = hours === 9 || hours === 15 || hours === 21;
      if (!isPrayerHour) {
        setIsHourlySpecial(true);
        const phrases = MOTIVATIONAL_PHRASES[appLanguage];
        setRandomPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
        setTimeout(() => setIsHourlySpecial(false), 150000);
      }
    }
  }, [now, isHourlySpecial, appLanguage]);

  useEffect(() => {
    const toggleInterval = setInterval(() => {
      setDisplayContent(prev => {
        if (prev === 'news') return 'date';
        if (prev === 'date') return 'time';
        return 'news';
      });
    }, 3000);
    return () => clearInterval(toggleInterval);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlinkColon(prev => !prev), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  const isLiveWindow = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours === 18 && minutes >= 0 && minutes <= 15;
  }, [now]);

  const isPrayerWindow = useMemo(() => {
    const hours = now.getHours();
    return hours === 9 || hours === 15 || hours === 21;
  }, [now]);

  const showIntentionsBar = useMemo(() => isPrayerWindow || showIntentionsManual, [isPrayerWindow, showIntentionsManual]);

  // Informowanie rodzica o widoczności paska intencji
  useEffect(() => {
    onIntentionsVisibilityChange?.(showIntentionsBar);
  }, [showIntentionsBar, onIntentionsVisibilityChange]);

  const isSosWindow = useMemo(() => {
    const minutes = now.getMinutes();
    return (minutes >= 15 && minutes < 25) || (minutes >= 45 && minutes < 55);
  }, [now]);

  const isSupportReminderActive = useMemo(() => {
    const minutes = now.getMinutes();
    return minutes >= 20 && minutes < 25;
  }, [now]);

  const isShareAppNow = useMemo(() => {
    return now.getMinutes() === 40;
  }, [now]);

  const isDatingAppPromoActive = useMemo(() => {
    return now.getMinutes() === 50;
  }, [now]);

  const dateStr = now.toLocaleDateString(appLanguage === 'pl' ? 'pl-PL' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString(appLanguage === 'pl' ? 'pl-PL' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const [hourTime, minuteTime] = timeStr.split(':');

  const handleCcNewsClick = useCallback(() => {
    window.open(CHRISTIAN_CULTURE_HOMEPAGE_URL, '_blank', 'noopener noreferrer');
  }, []);

  const baseItems: TickerContentItem[] = useMemo(() => {
    const items: TickerContentItem[] = [];

    items.push({
      type: 'button',
      id: 'toggle-intentions',
      label: showIntentionsManual ? (appLanguage === 'pl' ? 'ZAMKNIJ INTENCJE ✖' : 'CLOSE INTENTIONS ✖') : (appLanguage === 'pl' ? 'INTENCJE 🙏' : 'INTENTIONS 🙏'),
      action: () => setShowIntentionsManual(!showIntentionsManual),
      bgColor: showIntentionsManual ? 'bg-zinc-800' : 'bg-orange-500',
      textColor: 'text-white',
      borderColor: 'border-white/20',
      shadowColor: 'shadow-orange-500/30',
      separatorAfter: true,
    });

    if (isLiveWindow) {
      items.push({
        type: 'button',
        id: 'live-now-special',
        label: appLanguage === 'pl' ? '🔴 LIVE - OGLĄDAJ TERAZ: Cuda Każdego Dnia' : '🔴 LIVE - WATCH NOW: Daily Miracles',
        action: () => window.open(YOUTUBE_DAILY_MIRACLES_PLAYLIST_URL, "_blank", "noopener noreferrer"),
        bgColor: 'bg-[#F5F5DC]', 
        textColor: 'text-blue-700', 
        borderColor: 'border-blue-400/50', 
        shadowColor: 'shadow-blue-500/20',
        separatorAfter: true,
      });
    }

    if (isSosWindow && !isLiveWindow) {
      items.push({
        type: 'button',
        id: 'sos-maja',
        label: appLanguage === 'pl' ? '🆘 Pomóż Mai - Przekaż 1,5% podatku' : '🆘 Help Maja - Donate 1.5% tax',
        action: () => window.open("https://majusiaprosiopomoc.blogspot.com/", "_blank", "noopener noreferrer"),
        bgColor: 'bg-red-800', 
        textColor: 'text-white', 
        borderColor: 'border-red-400', 
        shadowColor: 'shadow-red-500/40',
        separatorAfter: true,
      });
    }

    if (isSupportReminderActive && !isLiveWindow && !isSosWindow) {
      items.push({
        type: 'button',
        id: 'support-mission-ticker',
        label: appLanguage === 'pl' ? '❤ WSPIERAJ MISJĘ CC' : '❤ SUPPORT CC MISSION',
        action: onOpenSupport,
        bgColor: 'bg-emerald-700', 
        textColor: 'text-white',
        borderColor: 'border-emerald-500/30',
        shadowColor: 'shadow-emerald-500/20',
        separatorAfter: true,
      });
    }

    if (isShareAppNow && !isLiveWindow && !isSosWindow && !isSupportReminderActive) {
      items.push({
        type: 'button',
        id: 'share-app-now',
        label: appLanguage === 'pl' ? 'HalleluYah #DobrzeŻeJesteś Udostępnij APP ✨' : 'HalleluYah #GoodToHaveYou Share APP ✨',
        action: onShareApp,
        bgColor: 'bg-indigo-600',
        textColor: 'text-white',
        borderColor: 'border-white/20',
        shadowColor: 'shadow-indigo-500/30',
        separatorAfter: true,
      });
    }

    if (isDatingAppPromoActive && !isLiveWindow && !isSosWindow && !isSupportReminderActive && !isShareAppNow) {
      items.push({
        type: 'button',
        id: 'dating-app-promo',
        label: appLanguage === 'pl' ? 'NOWOŚĆ - CHRZEŚCIJAŃSKI PORTAL RANDKOWY ✨' : 'NEW - CHRISTIAN DATING PORTAL ✨',
        action: () => window.open(CHRISTIAN_DATING_APP_URL, "_blank", "noopener noreferrer"),
        bgColor: 'bg-pink-600',
        textColor: 'text-white',
        borderColor: 'border-pink-400/50',
        shadowColor: 'shadow-pink-500/30',
        separatorAfter: true,
      });
    }

    if (installStatus !== 'installed' && !isLiveWindow && !isSosWindow && !isSupportReminderActive && !isShareAppNow && !isDatingAppPromoActive) {
      items.push({
        type: 'button',
        id: 'install-pwa-ticker',
        label: appLanguage === 'pl' ? (installStatus === 'update' ? 'AKTUALIZUJ APP 📱' : 'ZAINSTALUJ APP 📱') : (installStatus === 'update' ? 'UPDATE APP 📱' : 'INSTALL APP 📱'),
        action: onInstallClick,
        bgColor: installStatus === 'update' ? 'bg-red-600' : 'bg-[#C5A059]',
        textColor: 'text-black',
        borderColor: 'border-white/20',
        shadowColor: 'shadow-yellow-500/20',
        separatorAfter: true,
      });
    }

    if (isHourlySpecial && !isPrayerWindow && !isLiveWindow && !isSosWindow && !isSupportReminderActive && !isShareAppNow && !isDatingAppPromoActive) {
      const motivationalMsg = appLanguage === 'pl' 
        ? `#Dobrzeżejesteś, dziś jest ${dateStr} godzina ${timeStr}. ${randomPhrase}`
        : `#GoodToHaveYou, today is ${dateStr} time ${timeStr}. ${randomPhrase}`;
      items.push({ type: 'text', content: motivationalMsg });
      items.push({ type: 'text', content: " | Christian Culture | " });
    }

    items.push({
      type: 'button',
      id: 'sms-subscription-ticker',
      label: appLanguage === 'pl' ? '✉️ SUBSKRYPCJA SMS' : '✉️ SMS SUBSCRIPTION',
      action: onOpenSmsSubscriptionModal,
      bgColor: 'bg-indigo-600',
      textColor: 'text-white',
      borderColor: 'border-white/20',
      shadowColor: 'shadow-indigo-500/30',
      separatorAfter: true,
    });

    const standardContent = appLanguage === 'pl' 
      ? [
          { type: 'text', content: "Odwiedź polskieradio.cc lub cclite.pl | Kontakt: redakcjaccn@gmail.com | Infolinia Nadzieja: " },
          { type: 'button', id: 'hotline', label: HOTLINE_NADZIEJA_NUMBER, action: () => window.location.href = `tel:${HOTLINE_NADZIEJA_NUMBER.replace(/\s/g, '')}`, bgColor: 'bg-blue-700', textColor: 'text-white', borderColor: 'border-blue-500/30', shadowColor: 'shadow-blue-500/20', separatorAfter: true },
        ]
      : [
          { type: 'text', content: "Visit polskieradio.cc or cclite.pl | Hope Hotline: " },
          { type: 'button', id: 'hotline', label: HOTLINE_NADZIEJA_NUMBER, action: () => window.location.href = `tel:${HOTLINE_NADZIEJA_NUMBER.replace(/\s/g, '')}`, bgColor: 'bg-blue-700', textColor: 'text-white', borderColor: 'border-blue-500/30', shadowColor: 'shadow-blue-500/20', separatorAfter: true },
        ];
    
    return [...items, ...(standardContent as TickerContentItem[])];
  }, [appLanguage, installStatus, isLiveWindow, isSosWindow, onInstallClick, isHourlySpecial, dateStr, timeStr, randomPhrase, isPrayerWindow, showIntentionsManual, onOpenSmsSubscriptionModal, isSupportReminderActive, onOpenSupport, isShareAppNow, onShareApp, isDatingAppPromoActive]);

  const intentionItems = useMemo(() => {
    const currentIntentions = PRAYER_INTENTIONS_BY_LANG[appLanguage];
    const items: TickerContentItem[] = currentIntentions.map(intent => ({
      type: 'text',
      content: `🙏 ${intent.text}`
    }));

    items.push({
      type: 'button',
      id: 'scrolling-prayer-room',
      label: appLanguage === 'pl' ? '💬 POKÓJ MODLITWY' : '💬 PRAYER ROOM',
      action: () => window.open(WHATSAPP_PRAYER_GROUP_URL, "_blank", "noopener noreferrer"),
      bgColor: 'bg-green-600',
      textColor: 'text-white',
      borderColor: 'border-white/20',
      shadowColor: 'shadow-green-500/30',
      separatorAfter: true,
    });

    return items;
  }, [appLanguage]);

  const loopedTickerItems = useMemo(() => Array(4).fill(baseItems).flat(), [baseItems]);
  const loopedIntentionItems = useMemo(() => Array(4).fill(intentionItems).flat(), [intentionItems]);

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      
      <div className={`w-full h-8 sm:h-16 border-b sm:border-b-2 border-white/10 flex items-center overflow-hidden select-none transition-colors duration-1000 
            ${isPrayerWindow ? 'bg-orange-600' : isLiveWindow ? 'bg-red-700' : isHourlySpecial ? 'bg-emerald-600' : isSosWindow ? 'bg-red-800' : isSupportReminderActive ? 'bg-emerald-700' : isShareAppNow ? 'bg-indigo-700' : isDatingAppPromoActive ? 'bg-pink-700' : 'bg-black'}`}>
        <div 
          className={`flex-shrink-0 h-full flex items-center border-r sm:border-r-2 border-[#C5A059]/20 z-20 transition-colors duration-700 cursor-pointer hover:brightness-110 w-[110px] sm:w-[210px]
            ${isPrayerWindow ? 'bg-orange-700' : isLiveWindow ? 'bg-red-700 animate-pulse' : isHourlySpecial ? 'bg-emerald-700' : isSosWindow ? 'bg-red-800' : isSupportReminderActive ? 'bg-emerald-800' : isShareAppNow ? 'bg-indigo-800' : isDatingAppPromoActive ? 'bg-pink-800' : 'bg-zinc-900'}`}
          onClick={handleCcNewsClick}
        >
          <div className={`relative text-[8px] sm:text-lg font-black uppercase tracking-[0.2em] whitespace-nowrap drop-shadow-md text-center w-full h-full flex items-center justify-center overflow-hidden transition-all duration-700
            ${(isLiveWindow || isHourlySpecial || isSosWindow || isPrayerWindow || isSupportReminderActive || isShareAppNow || isDatingAppPromoActive) ? 'text-white' : 'text-[#C5A059]'}`}>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${displayContent === 'news' ? 'opacity-100' : 'opacity-0'}`}>
              {isPrayerWindow ? (appLanguage === 'pl' ? 'MODLITWA' : 'PRAYER') : isLiveWindow ? 'LIVE' : isHourlySpecial ? (appLanguage === 'pl' ? 'MOTYWACJA' : 'MOTIVATION') : isSosWindow ? (appLanguage === 'pl' ? 'SOS MAJA' : 'HELP MAJA') : isSupportReminderActive ? (appLanguage === 'pl' ? 'WSPIERAJ' : 'SUPPORT') : isShareAppNow ? (appLanguage === 'pl' ? 'Udostępnij APP' : 'Share APP') : isDatingAppPromoActive ? (appLanguage === 'pl' ? 'NOWOŚĆ RANDKA' : 'NEW DATING') : 'CC NEWS'}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${displayContent === 'date' ? 'opacity-100' : 'opacity-0'}`}>
              {dateStr}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${displayContent === 'time' ? 'opacity-100' : 'opacity-0'}`}>
              {hourTime}{blinkColon ? ':' : ' '}{minuteTime}
            </span>
          </div>
        </div>

        <div className="relative flex-1 h-full overflow-hidden flex items-center group cursor-default">
          <style>{`
            @keyframes majesticTickerPass { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-ticker-majestic { animation: majesticTickerPass 150s linear infinite; }
            .animate-ticker-majestic:hover { animation-play-state: paused; }
          `}</style>
          <div className="animate-ticker-majestic whitespace-nowrap flex items-center">
            {loopedTickerItems.map((item, index) => (
              <React.Fragment key={`${item.type}-${index}`}>
                {item.type === 'text' ? (
                  <span className={`text-[10px] sm:text-xl font-black uppercase tracking-widest inline-block mx-1 sm:mx-2 opacity-80 ${(isHourlySpecial || isPrayerWindow || isSupportReminderActive || isShareAppNow || isDatingAppPromoActive) ? 'text-white' : 'text-[#C5A059]'}`}>
                    {fixOrphans(item.content)}
                  </span>
                ) : (
                  <button
                    onClick={item.action}
                    className={`text-[7px] sm:text-lg font-black uppercase tracking-[0.1em] drop-shadow-md px-1.5 py-0.5 sm:px-4 sm:py-2 rounded-md transition-all duration-300 flex items-center gap-1 sm:gap-3 justify-center 
                      ${item.bgColor} ${item.textColor} border ${item.borderColor} shadow-lg hover:scale-105 active:scale-95 mx-1.5 sm:mx-4`}
                  >
                    {item.label}
                  </button>
                )}
                {item.separatorAfter && (
                  <span className={`text-[10px] sm:text-xl font-black uppercase tracking-widest mx-3 sm:mx-8 ${isPrayerWindow ? 'text-orange-200' : isHourlySpecial ? 'text-emerald-300' : isSosWindow ? 'text-red-400' : isSupportReminderActive ? 'text-emerald-400' : isShareAppNow ? 'text-indigo-400' : isDatingAppPromoActive ? 'text-pink-400' : 'text-zinc-700'}`}>|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className={`w-full bg-[#3d1300] border-b border-orange-500/30 overflow-hidden transition-all duration-700 ease-in-out ${showIntentionsBar ? 'h-7 sm:h-12 opacity-100' : 'h-0 opacity-0'}`}>
         <div className="flex h-full items-center">
            <div className="flex-shrink-0 bg-orange-600 h-full flex items-center justify-center border-r border-white/10 w-[110px] sm:w-[210px]">
               <span className="text-[7px] sm:text-[11px] font-black text-white uppercase tracking-widest text-center px-1 leading-tight">
                 {appLanguage === 'pl' ? 'TERAZ MODLIMY SIĘ O:' : 'WE ARE CURRENTLY PRAYING FOR:'}
               </span>
            </div>
            <div className="flex-1 h-full overflow-hidden flex items-center">
               <div className="animate-ticker-majestic whitespace-nowrap flex items-center">
                  {loopedIntentionItems.map((item, index) => (
                    <React.Fragment key={`${item.type}-${index}`}>
                      {item.type === 'text' ? (
                        <span className="text-[9px] sm:text-sm font-bold text-orange-100 uppercase tracking-wide mx-4 sm:mx-10 whitespace-nowrap">
                           {item.content}
                        </span>
                      ) : (
                        <button
                          onClick={item.action}
                          className={`text-[7px] sm:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${item.bgColor} ${item.textColor} ${item.borderColor} shadow-md hover:scale-105 active:scale-95 mx-3`}
                        >
                          {item.label}
                        </button>
                      )}
                      {item.separatorAfter && (
                        <span className="text-[8px] sm:text-sm font-bold text-orange-400 mx-1">|</span>
                      )}
                    </React.Fragment>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};