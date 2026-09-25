import { useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/button';
import { PageTitle } from '../components/layout';
import { problemMessage } from '../errors/problem';

// The router's own fallback is English prose outside the i18n dictionaries; this keeps a failed load in the app's language and design.
export function RouteError({ error }: ErrorComponentProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <PageTitle>{t('common:routeError.title')}</PageTitle>
      <p className="text-muted-foreground">{problemMessage(i18n, error)}</p>
      <Button onClick={() => void router.invalidate()}>{t('common:routeError.retry')}</Button>
    </div>
  );
}
