/**
 * i18n Hook for accessing translations
 */
import { useCallback } from 'react';
import type { Lang } from '../lib/i18n';
import { t as translate, getWeekdayNames, getWeekdayShort, getMonthNames, formatDate } from '../lib/i18n';
import type { TranslationKey } from '../lib/i18n';

export function useTranslation(lang: Lang) {
  const $t = useCallback(
    (key: TranslationKey) => translate(key, lang),
    [lang]
  );

  const $weekdays = useCallback(() => getWeekdayNames(lang), [lang]);
  const $weekdaysShort = useCallback(() => getWeekdayShort(lang), [lang]);
  const $months = useCallback(() => getMonthNames(lang), [lang]);
  const $formatDate = useCallback(
    (year: number, month: number, day: number) => formatDate(year, month, day, lang),
    [lang]
  );

  return { $t, $weekdays, $weekdaysShort, $months, $formatDate, lang };
}
