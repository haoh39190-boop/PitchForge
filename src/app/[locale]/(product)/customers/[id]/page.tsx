import { CustomerOverview } from '@/shared/blocks/pitchforge/customer-overview';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerOverview customerId={id} />;
}
