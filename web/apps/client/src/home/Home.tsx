import { useListMyConsultants } from '@carenest/api-client';
import { Card, PageTitle, SectionTitle, useMe } from '@carenest/ui';
import { useTranslation } from 'react-i18next';
import { ConsultantCard } from './ConsultantCard';

// Kept out of the route file so TanStack Router's code-splitting still applies to the route module.
export function Home() {
  const { t } = useTranslation();
  const me = useMe();
  const consultants = useListMyConsultants();
  const hasConsultants = (consultants.data?.length ?? 0) > 0;

  return (
    <>
      <PageTitle>{t('home:greeting', { name: me.displayName })}</PageTitle>
      {hasConsultants ? (
        consultants.data!.map((consultant) => <ConsultantCard key={consultant.userId} consultant={consultant} />)
      ) : (
        <Card className="flex flex-col gap-2">
          <SectionTitle>{t('home:emptyTitle')}</SectionTitle>
          <p className="text-muted-foreground">{t('home:emptyBody')}</p>
        </Card>
      )}
    </>
  );
}
