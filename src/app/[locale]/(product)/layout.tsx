import { ProductShell } from '@/shared/blocks/pitchforge/product-shell';
import { PitchForgeProvider } from '@/shared/contexts/pitchforge';

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PitchForgeProvider>
      <ProductShell>{children}</ProductShell>
    </PitchForgeProvider>
  );
}
