import { useTranslation } from 'react-i18next';
import { Alert } from '../components/layout';
import { problemMessage } from './problem';

export function ErrorAlert({ error }: { error: unknown }) {
  const { i18n } = useTranslation();
  if (!error) {
    return null;
  }

  return <Alert tone="error">{problemMessage(i18n, error)}</Alert>;
}
