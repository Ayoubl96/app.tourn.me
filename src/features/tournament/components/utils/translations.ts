// Utility file to import translations from the main translation files
import { useTranslations } from 'next-intl';

export const useTournamentTranslations = () => {
  return useTranslations('Dashboard');
};

export const useCommonTranslations = () => {
  return useTranslations('Common');
};

export const useErrorTranslations = () => {
  return useTranslations('Errors');
};
