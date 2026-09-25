import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib';
import { themePreferences, useThemePreference, type ThemePreference } from './theme';

const icons: Record<ThemePreference, typeof Sun> = { system: Monitor, light: Sun, dark: Moon };

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const [preference, choose] = useThemePreference();

  return (
    <div role="group" aria-label={t('common:theme.label')} className="inline-flex rounded-full border border-border p-0.5">
      {themePreferences.map((option) => {
        const Icon = icons[option];
        return (
          <button
            key={option}
            type="button"
            aria-pressed={preference === option}
            aria-label={t(`common:theme.${option}`)}
            title={t(`common:theme.${option}`)}
            onClick={() => choose(option)}
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors',
              preference === option && 'bg-soft text-strong',
            )}
          >
            <Icon aria-hidden className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
