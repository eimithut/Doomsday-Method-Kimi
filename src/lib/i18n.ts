/**
 * Translation system for Doomsday Trainer
 * Supports: German (de), English (en), Latvian (lv)
 */

import type { Lang } from '../types';

export { type Lang };

export const DEFAULT_LANG: Lang = 'de';

export const LANG_LABELS: Record<Lang, string> = {
  de: 'DE',
  en: 'EN',
  lv: 'LV',
};

export const LANG_NAMES: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  lv: 'Latvie\u0161u',
};

// ------------------------------------------------------------------
// Translation dictionary
// ------------------------------------------------------------------
const translations = {
  // Navigation
  navHome: { de: 'Start', en: 'Home', lv: 'S\u0101kums' },
  navLearn: { de: 'Lernen', en: 'Learn', lv: 'M\u0101c\u012Bt' },
  navTrain: { de: 'Training', en: 'Train', lv: 'Tren\u0113ties' },
  navAnalytics: { de: 'Fortschritt', en: 'Progress', lv: 'Progress' },
  navDaily: { de: 'T\u00E4glich', en: 'Daily', lv: 'Ikdienas' },

  // Hero
  heroEyebrow: {
    de: 'JOHN CONWAYS MEISTERTRICK',
    en: 'JOHN CONWAY\u2019S MASTERTRICK',
    lv: 'D\u017EONA KONVEJA MEISTART\u0122IKS',
  },
  heroTitle: { de: 'Jedes Datum besiegen.', en: 'Defeat any Date.', lv: 'Uzvari jebkurai datumam.' },
  heroSubtitle: {
    de: 'Beherrsche den mentalen Algorithmus, um den Wochentag f\u00FCr jedes Datum in der Geschichte in Sekunden zu berechnen.',
    en: 'Master the mental algorithm to calculate the exact day of the week for any date in history \u2014 in seconds.',
    lv: 'Iem\u0101ci pr\u0101ta algoritmu, lai sekund\u0113s apr\u0113\u0137inu ned\u0113\u013Cas dienu jebkuram datumam v\u0113stur\u0113.',
  },
  heroCtaLesson: { de: 'Lektion starten', en: 'Start the Lesson', lv: 'S\u0101kt nodarb\u012Bbu' },
  heroCtaTrain: { de: 'Zum Training', en: 'Jump to Training', lv: 'Uz treni\u0146u' },
  heroDaily: { de: 'T\u00E4gliche Herausforderung', en: 'Daily Challenge', lv: 'Ikdienas izaicin\u0101jums' },

  // Quick stats
  qsSteps: { de: '4 Lernschritte', en: '4 Learning Steps', lv: '4 m\u0101c\u012Bbu so\u013Ci' },
  qsPractice: { de: 'Endloses \u00DCben', en: 'Infinite Practice', lv: 'Bezgal\u012Bga prakse' },
  qsTracking: { de: 'Fortschritts-Tracking', en: 'Progress Tracking', lv: 'Progresa uzskaite' },

  // Streak
  streakLabel: { de: 'Aktuelle Serie', en: 'Current Streak', lv: 'Pa\u0161reiz\u0113j\u0101 s\u0113rija' },
  streakBest: { de: 'Beste Serie', en: 'Best Streak', lv: 'Lab\u0101k\u0101 s\u0113rija' },
  streakDays: { de: 'Tage', en: 'days', lv: 'dienas' },
  streakDay: { de: 'Tag', en: 'day', lv: 'diena' },

  // Learn Section
  learnTitle: { de: 'Wie es funktioniert', en: 'How it Works', lv: 'K\u0101 tas str\u0101d\u0101' },
  learnSubtitle: {
    de: 'Conways Doomsday-Algorithmus erm\u00F6glicht dir die mentale Wochentagsberechnung. Folge diesen vier Schritten, um ihn zu beherrschen.',
    en: 'Conway\u2019s Doomsday algorithm lets you calculate any weekday mentally. Follow these four steps to master it.',
    lv: 'Konveja Doomsday algoritms \u013Cauj pr\u0101t\u0101 apr\u0117\u0137in\u0101t jebkuru ned\u0113\u013Cas dienu. Sekojiet \u0161iem 4 so\u013Ciem, lai to apg\u016Btu.',
  },
  learnPrev: { de: 'Zur\u00FCck', en: 'Previous', lv: 'Atpaka\u013C' },
  learnNext: { de: 'Weiter', en: 'Next', lv: 'T\u0101l\u0101k' },

  // Step 1: Anchor Days
  step1Title: { de: 'Die Anker-Tage', en: 'The Anchor Days', lv: 'Enkura dienas' },
  step1Desc: {
    de: 'Diese Daten fallen in jedem Jahr auf denselben Wochentag \u2013 den \u201EDoomsday\u201C. Merke dir diese Anker-Daten.',
    en: 'These dates always fall on the same weekday \u2014 the \u201CDoomsday\u201D. Memorize these anchor dates.',
    lv: '\u0160ie datumi katru gadu kr\u012Bt uz vienu un to pa\u0161u ned\u0113\u013Cas dienu \u2014 \u201CDoomsday\u201D. Iem\u0101ciet \u0161os enkura datumus.',
  },
  step1Easy: {
    de: 'Leicht zu merken (Monat/Tag gleich)',
    en: 'Easy to remember (Month/Day same)',
    lv: 'Viegli atcer\u0113ties (m\u0113nesis/diena vien\u0101ds)',
  },
  step1Work: {
    de: 'Ich arbeite 9 bis 5 im 7-11',
    en: 'I work 9 to 5 at the 7-11',
    lv: 'Es str\u0101d\u0101ju no 9 l\u012Bdz 5 7-11',
  },
  step1Leap: { de: 'Schaltjahr', en: 'Leap year', lv: 'Garais gads' },
  step1Mnemonic: {
    de: 'Eselsbr\u00FCcke: ',
    en: 'Mnemonic: ',
    lv: 'Atmi\u0146as pal\u012Bgs: ',
  },

  // Step 2: Century Anchor
  step2Title: {
    de: 'Der Jahrhundert-Anker',
    en: 'The Century Anchor',
    lv: 'Gadsimta enkurs',
  },
  step2Desc: {
    de: 'Jedes Jahrhundert hat einen Anker-Tag. Der Jahrhundert-Anker wiederholt sich alle 400 Jahre.',
    en: 'Every century has an anchor day. The century anchor repeats every 400 years.',
    lv: 'Katram gadsimtam ir sava enkura diena. Gadsimta enkurs atk\u0101rtojas ik p\u0113c 400 gadiem.',
  },
  step2Formula: { de: 'Formel', en: 'Formula', lv: 'Formula' },
  step2Result: { de: 'Doomsday f\u00FCr', en: 'Doomsday for', lv: 'Doomsday priek\u0161' },
  step2Is: { de: 'ist', en: 'is', lv: 'ir' },

  // Step 3: Year Calculation
  step3Title: {
    de: 'Die Jahresberechnung',
    en: 'Calculating the Year',
    lv: 'Gada apr\u0117\u0137ins',
  },
  step3Desc: {
    de: 'Nimm die letzten beiden Ziffern des Jahres und wende Conways Formel an.',
    en: 'Take the last two digits of the year and apply Conway\u2019s formula.',
    lv: '\u014Emiet p\u0113d\u0113jos divus gada ciparus un pielietojiet Konveja formulu.',
  },
  step3Year: { de: 'Jahr', en: 'Year', lv: 'Gads' },
  step3Quotient: { de: 'Quotient', en: 'quotient', lv: 'dal\u012Bjums' },
  step3Remainder: { de: 'Rest', en: 'remainder', lv: 'atlikums' },
  step3Div4: { de: 'Ganzzahldivision durch 4', en: 'integer division by 4', lv: 'veselo skaitli dal\u012Bjums ar 4' },
  step3Sum: { de: 'Summe', en: 'Sum', lv: 'Summa' },

  // Step 4: Final Calculation
  step4Title: {
    de: 'Alles zusammenf\u00FCgen',
    en: 'Putting It All Together',
    lv: 'Visu salikt kop\u0101',
  },
  step4Desc: {
    de: 'Finde den n\u00E4chsten Anker-Tag im Zielmonat und z\u00E4hle vor oder zur\u00FCck zum Zieldatum.',
    en: 'Find the nearest anchor date in the target month, then count forward or backward to your target date.',
    lv: 'Atrodiet tuv\u0101ko enkura datumu m\u0113r\u0137a m\u0113nes\u012B, tad skaitiet uz priek\u0161u vai atpaka\u013C.',
  },
  step4Randomize: { de: 'Zufall', en: 'Randomize', lv: ' Nejau\u0161i' },
  step4Question: {
    de: 'Auf welchen Wochentag f\u00E4llt',
    en: 'What day of the week is',
    lv: 'Kur\u0101 ned\u0113\u013Cas dien\u0101 kr\u012Bt',
  },
  step4YearDD: { de: 'Jahres-DD', en: "Year's DD", lv: 'Gada DD' },
  step4MonthDD: { de: 'Monats-Anker', en: 'Month anchor', lv: 'M\u0113ne\u0161a enkurs' },
  step4Diff: { de: 'Differenz', en: 'Difference', lv: 'At\u0161\u0137ir\u012Bba' },
  step4Days: { de: 'Tage', en: 'days', lv: 'dienas' },

  // Train Section
  trainTitle: { de: 'Teste deine F\u00E4higkeiten', en: 'Test your Skills', lv: 'P\u0101rbaudi savas prasmes' },
  trainEndless: { de: 'Endlos-Modus', en: 'Endless Mode', lv: 'Bezgal\u012Bgais re\u017E\u012Bms' },
  trainEndlessDesc: {
    de: '\u00DCbe ohne Grenzen. Verfolge deine Serie und Genauigkeit.',
    en: 'Practice without limits. Track your streak and accuracy.',
    lv: 'Praktiz\u0113 bez ierobe\u017Eojumiem. Sekojiet savai s\u0113rijai un precizit\u0101tei.',
  },
  trainTimeAttack: { de: 'Zeitangriff', en: 'Time Attack', lv: 'Laika uzbrukums' },
  trainTimeAttackDesc: {
    de: 'Beantworte so viele Fragen wie m\u00F6glich in 60 Sekunden.',
    en: 'Answer as many questions correctly as you can in 60 seconds.',
    lv: '60 sekun\u0113\u0161 atbildiet uz p\u0113c iesp\u0113jas vair\u0101k jaut\u0101jumiem.',
  },
  trainStartEndless: { de: 'Endlos starten', en: 'Start Endless', lv: 'S\u0101kt bezgal\u012Bgo' },
  trainStartTimeAttack: {
    de: 'Zeitangriff starten',
    en: 'Start Time Attack',
    lv: 'S\u0101kt laika uzbrukumu',
  },

  // Training filters
  trainFilterCenturies: {
    de: 'Jahrhunderte ausw\u00E4hlen',
    en: 'Select Centuries',
    lv: 'Izv\u0113l\u0113ties gadsimtus',
  },
  trainAll: { de: 'Alle', en: 'All', lv: 'Visi' },

  // Training gameplay
  trainStreak: { de: 'Serie', en: 'Streak', lv: 'S\u0113rija' },
  trainAccuracy: { de: 'Genauigkeit', en: 'Accuracy', lv: 'Precizit\u0101te' },
  trainAvgTime: { de: '\u00D8 Zeit', en: 'Avg Time', lv: 'Vid. laiks' },
  trainBestStreak: { de: 'Beste Serie', en: 'Best Streak', lv: 'Lab\u0101k\u0101 s\u0113rija' },
  trainCorrect: { de: 'Richtig', en: 'Correct', lv: 'Pareizi' },
  trainWrong: { de: 'Falsch', en: 'Wrong', lv: 'Nepareizi' },
  trainTheAnswerWas: {
    de: 'Falsch! Die Antwort war',
    en: 'Wrong! The answer was',
    lv: 'Nepareizi! Pareiz\u0101 atbilde bija',
  },
  trainPause: { de: 'Pause', en: 'Pause', lv: 'Pauze' },
  trainResume: { de: 'Fortsetzen', en: 'Resume', lv: 'Turpin\u0101t' },
  trainRestart: { de: 'Neustart', en: 'Restart', lv: 'Restart' },
  trainEnd: { de: 'Beenden', en: 'End Session', lv: 'Beigt sesiju' },
  trainPaused: { de: 'Pausiert', en: 'Paused', lv: 'Pauz\u0113' },

  // Cheat Sheet
  cheatSheet: { de: 'Spickzettel', en: 'Cheat Sheet', lv: 'Sp\u012B\u013Cve\u013Cla lapa' },
  cheatSheetOpen: {
    de: 'Spickzettel ge\u00F6ffnet \u2013 Antwort wird als \u201Emit Hilfe\u201C gewertet',
    en: 'Cheat sheet opened \u2013 answer will count as \u201Cwith help\u201D',
    lv: 'Sp\u012B\u013Cve\u013Cla lapa atv\u0113rta \u2013 atbilde tiks skait\u012Bta \u201Car pal\u012Bdz\u012Bbu\u201C',
  },

  // Daily Challenge
  dailyTitle: { de: 'T\u00E4gliche Herausforderung', en: 'Daily Challenge', lv: 'Ikdienas izaicin\u0101jums' },
  dailySubtitle: {
    de: '5 Daten. 1 Tag. Wie schnell bist du?',
    en: '5 dates. 1 day. How fast are you?',
    lv: '5 datumi. 1 diena. Cik \u0101tri tu esi?',
  },
  dailyProgress: { de: 'Fortschritt', en: 'Progress', lv: 'Progress' },
  dailyComplete: {
    de: 'Herausforderung abgeschlossen',
    en: 'Challenge completed',
    lv: 'Izaicin\u0101jums pabeigts',
  },
  dailyShare: { de: 'Teilen', en: 'Share', lv: 'Dal\u012Bties' },
  dailyTime: { de: 'Gesamtzeit', en: 'Total Time', lv: 'Kop\u0113jais laiks' },
  dailyNext: { de: 'N\u00E4chste t\u00E4gliche Herausforderung in', en: 'Next daily challenge in', lv: 'N\u0101kamais ikdienas izaicin\u0101jums p\u0113c' },
  dailyNew: { de: 'NEU', en: 'NEW', lv: 'JAUNS' },

  // Share
  shareTitle: {
    de: 'T\u00E4gliche Ergebnisse teilen',
    en: 'Share Daily Results',
    lv: 'Dal\u012Bties ar ikdienas rezult\u0101tiem',
  },
  shareCopied: {
    de: 'In Zwischenablage kopiert',
    en: 'Copied to clipboard',
    lv: 'Kop\u0113ts starpliktuv\u0113',
  },
  shareClose: { de: 'Schlie\u00DFen', en: 'Close', lv: 'Aizv\u0113rt' },

  // Analytics
  analyticsTitle: { de: 'Dein Fortschritt', en: 'Your Progress', lv: 'Tavs progress' },
  analyticsAccuracy: { de: 'Genauigkeit', en: 'Accuracy', lv: 'Precizit\u0101te' },
  analyticsAvgTime: { de: '\u00D8 Antwortzeit', en: 'Avg Response Time', lv: 'Vid. atbildes laiks' },
  analyticsTotalAnswers: {
    de: 'Gesamtantworten',
    en: 'Total Answers',
    lv: 'Kop\u0113j\u0101s atbildes',
  },
  analyticsByCentury: {
    de: 'Genauigkeit nach Jahrhundert',
    en: 'Accuracy by Century',
    lv: 'Precizit\u0101te pa gadsimtiem',
  },
  analyticsByMonth: {
    de: 'Genauigkeit nach Monat',
    en: 'Accuracy by Month',
    lv: 'Precizit\u0101te pa m\u0113ne\u0161iem',
  },
  analyticsOverTime: {
    de: 'Genauigkeit \u00FCber Zeit',
    en: 'Accuracy Over Time',
    lv: 'Precizit\u0101te l\u012Bdz ar laiku',
  },
  analyticsTimeTrend: {
    de: 'Antwortzeit-Trend',
    en: 'Response Time Trend',
    lv: 'Atbildes laika tendence',
  },
  analyticsWeakness: {
    de: 'Schwachstellen-Analyse',
    en: 'Weakness Analysis',
    lv: 'V\u0101j\u0101ko vietu anal\u012Bze',
  },
  analyticsNoData: {
    de: 'Noch keine Daten. Starte eine Trainingssession.',
    en: 'No data yet. Start a training session.',
    lv: 'V\u0113l nav datu. S\u0101kt treni\u0146a sesiju.',
  },
  analyticsRecentSessions: {
    de: 'Letzte Sitzungen',
    en: 'Recent Sessions',
    lv: 'P\u0113d\u0113j\u0101s sesijas',
  },
  analyticsDate: { de: 'Datum', en: 'Date', lv: 'Datums' },
  analyticsMode: { de: 'Modus', en: 'Mode', lv: 'Re\u017E\u012Bms' },
  analyticsQuestions: { de: 'Fragen', en: 'Questions', lv: 'Jaut\u0101jumi' },
  analyticsReset: { de: 'Alle Daten zur\u00FCcksetzen', en: 'Reset All Data', lv: 'Dz\u0113st visus datus' },
  analyticsResetConfirm: {
    de: 'Wirklich zur\u00FCcksetzen?',
    en: 'Are you sure?',
    lv: 'Vai tie\u0161\u0101m?',
  },
  analyticsResetCancel: { de: 'Abbrechen', en: 'Cancel', lv: 'Atcelt' },
  analyticsResetYes: { de: 'Ja, zur\u00FCcksetzen', en: 'Yes, Reset', lv: 'J\u0101, dz\u0113st' },

  // Answer states
  stateCorrect: { de: 'Richtig', en: 'Correct', lv: 'Pareizi' },
  stateIncorrect: { de: 'Falsch', en: 'Incorrect', lv: 'Nepareizi' },
  stateCorrectHelp: {
    de: 'Richtig (mit Hilfe)',
    en: 'Correct (with help)',
    lv: 'Pareizi (ar pal\u012Bdz\u012Bbu)',
  },
  stateIncorrectHelp: {
    de: 'Falsch (trotz Hilfe)',
    en: 'Incorrect (with help)',
    lv: 'Nepareizi (ar pal\u012Bdz\u012Bbu)',
  },

  // Century labels
  century1800s: { de: '1800er', en: '1800s', lv: '1800.' },
  century1900s: { de: '1900er', en: '1900s', lv: '1900.' },
  century2000s: { de: '2000er', en: '2000s', lv: '2000.' },
  century2100s: { de: '2100er', en: '2100s', lv: '2100.' },

  // Back button
  back: { de: 'Zur\u00FCck', en: 'Back', lv: 'Atpaka\u013C' },
  backToMenu: { de: 'Zum Men\u00FC', en: 'To Menu', lv: 'Uz izv\u0113lni' },

  // Weekdays
  monday: { de: 'Montag', en: 'Monday', lv: 'Pirmdiena' },
  tuesday: { de: 'Dienstag', en: 'Tuesday', lv: 'Otrdiena' },
  wednesday: { de: 'Mittwoch', en: 'Wednesday', lv: 'Tre\u0161diena' },
  thursday: { de: 'Donnerstag', en: 'Thursday', lv: 'Ceturtdiena' },
  friday: { de: 'Freitag', en: 'Friday', lv: 'Piektdiena' },
  saturday: { de: 'Samstag', en: 'Saturday', lv: 'Sestdiena' },
  sunday: { de: 'Sonntag', en: 'Sunday', lv: 'Sv\u0113tdiena' },

  // Mnemonics (language-specific)
  mnemonics: {
    '3/14': {
      de: 'Pi-Tag: 3.14',
      en: 'Pi Day: 3.14',
      lv: 'Pi diena: 3.14',
    },
    '4/4': { de: 'Einfach!', en: 'Easy!', lv: 'Viegli!' },
    '5/9': {
      de: '"Ich arbeite 9 bis 5"',
      en: '"I work 9 to 5"',
      lv: '"Es str\u0101d\u0101ju no 9 l\u012Bdz 5"',
    },
    '6/6': { de: 'Einfach!', en: 'Easy!', lv: 'Viegli!' },
    '7/11': {
      de: '"7-Eleven"',
      en: '"7-Eleven"',
      lv: '"7-Eleven"',
    },
    '8/8': { de: 'Einfach!', en: 'Easy!', lv: 'Viegli!' },
    '9/5': {
      de: '"9 bis 5" (umgekehrt)',
      en: '"9 to 5" (reversed)',
      lv: '"9 l\u012Bdz 5" (apgriezti)',
    },
    '10/10': { de: 'Einfach!', en: 'Easy!', lv: 'Viegli!' },
    '11/7': {
      de: '"7-Eleven" (umgekehrt)',
      en: '"7-Eleven" (reversed)',
      lv: '"7-Eleven" (apgriezti)',
    },
    '12/12': { de: 'Einfach!', en: 'Easy!', lv: 'Viegli!' },
  },

  // No data
  noData: {
    de: 'Noch keine Daten. Absolviere Trainingssessions, um deinen Fortschritt zu sehen.',
    en: 'No data yet. Complete training sessions to see your progress.',
    lv: 'V\u0113l nav datu. Pabeidz treni\u0146a sesijas, lai redz\u0113tu savu progresu.',
  },

  // Century select
  centurySelect: {
    de: 'Jahrhundert ausw\u00E4hlen',
    en: 'Select century',
    lv: 'Izv\u0113l\u0113ties gadsimtu',
  },
} as const;

// ------------------------------------------------------------------
// Type-safe translation helper
// ------------------------------------------------------------------
export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  const entry = (translations as any)[key];
  if (!entry) return key;
  return (entry as any)[lang] ?? (entry as any)[DEFAULT_LANG] ?? key;
}

// Helper to get localized weekday names
export function getWeekdayNames(lang: Lang): string[] {
  const map: Record<Lang, string[]> = {
    de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    lv: ['Sv\u0113tdiena', 'Pirmdiena', 'Otrdiena', 'Tre\u0161diena', 'Ceturtdiena', 'Piektdiena', 'Sestdiena'],
  };
  return map[lang];
}

export function getWeekdayShort(lang: Lang): string[] {
  const map: Record<Lang, string[]> = {
    de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    lv: ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'],
  };
  return map[lang];
}

export function getMonthNames(lang: Lang): string[] {
  const map: Record<Lang, string[]> = {
    de: ['Januar', 'Februar', 'M\u00E4rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    lv: ['Janv\u0101ris', 'Febru\u0101ris', 'Marts', 'Apr\u012Blis', 'Maijs', 'J\u016Bnijs', 'J\u016Blijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'],
  };
  return map[lang];
}

// Format date according to locale
export function formatDate(year: number, month: number, day: number, lang: Lang): string {
  const d = new Date(year, month - 1, day);
  const localeMap: Record<Lang, string> = {
    de: 'de-DE',
    en: 'en-US',
    lv: 'lv-LV',
  };
  return new Intl.DateTimeFormat(localeMap[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// Get the next language in cycle
export function nextLang(current: Lang): Lang {
  const cycle: Lang[] = ['de', 'en', 'lv'];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}
