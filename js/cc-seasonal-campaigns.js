/**
 * CC Seasonal Campaigns — Menedżer Akcji Sezonowych
 * Wersja: 2026-11-01
 *
 * Automatycznie pokazuje/ukrywa akcje cykliczne na stronie głównej
 * polskieradio.cc na podstawie bieżącej daty.
 *
 * Każda kampania definiuje:
 *   - id:         unikalny identyfikator (odpowiada id elementu w HTML)
 *   - month:      miesiąc końca (1–12)
 *   - day:        dzień końca kampanii (ostatni dzień wyświetlania włącznie)
 *   - leadDays:   ile dni PRZED końcem kampania zaczyna się pokazywać
 *                 (np. 17 → pojawia się 17 dni przed 31 października = 14 października)
 *
 * Kampanie są czysto datowe – nie wymagają zmian w HTML po zakończeniu sezonu.
 * Dowódca może dodawać nowe kampanie bez edycji index.html.
 */

(function () {
  'use strict';

  /** Rejestr kampanii sezonowych (rok-niezależny, cykliczny). */
  const SEASONAL_CAMPAIGNS = [
    {
      id: 'homepageLightCampaign',   // div z akcją #AntyHALLOWEEN
      name: 'AntyHALLOWEEN',
      month: 10,   // Koniec: 31 października
      day: 31,
      leadDays: 17  // Aktywna: 14 paź – 31 paź (17 dni okna)
    }
    // Dodaj kolejne kampanie poniżej, np.:
    // {
    //   id: 'homepageAdventCampaign',
    //   name: 'Adwent',
    //   month: 12,
    //   day: 24,
    //   leadDays: 28   // aktywna: ~26 listopada – 24 grudnia
    // },
    // {
    //   id: 'homepageWielkanocCampaign',
    //   name: 'Wielkanoc',
    //   month: 4,
    //   day: 1,
    //   leadDays: 14   // aktywna 14 dni przed Wielkanocą (dynamiczna data — ustaw przybliżoną)
    // }
  ];

  /**
   * Zwraca true, jeśli bieżąca data (rok-niezależna logika) mieści się
   * w oknie aktywności kampanii:
   *   [endDate - leadDays, endDate] — włącznie po obu stronach.
   */
  function isCampaignActive(campaign) {
    var now = new Date();
    var year = now.getFullYear();

    // Data końca kampanii w bieżącym roku
    var end = new Date(year, campaign.month - 1, campaign.day, 23, 59, 59);
    // Jeżeli termin minął w tym roku, spróbuj przyszłoroczny (kampanie roczne)
    if (now > end) {
      end = new Date(year + 1, campaign.month - 1, campaign.day, 23, 59, 59);
    }

    // Data startu = koniec minus leadDays
    var start = new Date(end.getTime() - campaign.leadDays * 24 * 60 * 60 * 1000);

    return now >= start && now <= end;
  }

  function applySeasonalVisibility() {
    SEASONAL_CAMPAIGNS.forEach(function (campaign) {
      var el = document.getElementById(campaign.id);
      if (!el) return;

      if (isCampaignActive(campaign)) {
        el.style.display = '';               // Pokaż (przywróć domyślne display)
        el.removeAttribute('aria-hidden');
      } else {
        el.style.display = 'none';           // Ukryj
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Uruchom od razu po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySeasonalVisibility);
  } else {
    applySeasonalVisibility();
  }
})();
