import type { FilterOption, FilterTabsProps } from './types';

const OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'issues', label: 'With issues' },
];

export const FilterTabs = ({ value, issueCount, onChange }: FilterTabsProps) => (
  <div
    role="group"
    aria-label="Filter services"
    className="inline-flex rounded-md bg-zinc-200/60 p-0.5"
  >
    {OPTIONS.map(({ value: optionValue, label }) => {
      const selected = optionValue === value;
      return (
        <button
          key={optionValue}
          type="button"
          aria-pressed={selected}
          onClick={() => {
            onChange(optionValue);
          }}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            selected ? 'bg-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {label}
          {optionValue === 'issues' && issueCount > 0 && (
            <span className="ml-1.5 rounded-full bg-zinc-900 px-1.5 text-xs text-white">
              {issueCount}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
