import type { SectionProps } from './types';

export const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    {children}
  </section>
);
