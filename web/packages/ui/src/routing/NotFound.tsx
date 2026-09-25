import { useTranslation } from 'react-i18next';
import { PageTitle } from '../components/layout';

// The router's own fallback is English prose outside the i18n dictionaries; a plain link keeps this component route-tree agnostic.
export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <PageTitle>{t('common:notFound.title')}</PageTitle>
      <p className="text-muted-foreground">{t('common:notFound.body')}</p>
      <a className="inline-flex min-h-11 items-center font-semibold text-accent underline" href="/">
        {t('common:notFound.home')}
      </a>
    </div>
  );
}
