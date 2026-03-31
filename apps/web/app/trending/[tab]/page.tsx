import { redirect } from 'next/navigation';

const TAB_TO_PERIOD: Record<string, string> = {
  overall: 'past_week',
  new: 'past_24_hours',
  rising: 'past_month',
};

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function TrendingTabPage({ params }: PageProps) {
  const { tab } = await params;
  const period = TAB_TO_PERIOD[tab];

  if (period) {
    redirect(`/trending?period=${period}`);
  }

  redirect('/trending');
}
