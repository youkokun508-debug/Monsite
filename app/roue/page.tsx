import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WheelGame, type WheelPrize } from '@/components/roue/WheelGame';

export const dynamic = 'force-dynamic';

interface WheelInfo {
  prizes: WheelPrize[];
  validity_days: number;
  review_url: string | null;
}

// Accessible uniquement avec la clé du QR code : /roue?k=...
// Sans clé (ou mauvaise clé), la page n'existe pas (404).
export default async function RouePage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string | string[] }>;
}) {
  const { k } = await searchParams;
  const key = Array.isArray(k) ? k[0] : k;
  if (!key) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('wheel_public_info', { p_key: key });
  if (error || !data) notFound();

  const info = data as WheelInfo;

  return (
    <WheelGame
      accessKey={key}
      prizes={info.prizes}
      validityDays={info.validity_days}
      reviewUrl={info.review_url}
    />
  );
}
