import { ScriptPage } from '@/shared/blocks/pitchforge/script-page';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ savedScript?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <ScriptPage customerId={id} savedScriptId={query.savedScript} />;
}
