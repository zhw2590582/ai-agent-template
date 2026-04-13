import { Input } from '@/components/ui/input';

interface SidebarSearchProps {
  ariaLabel?: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export function SidebarSearch({ ariaLabel, onChange, placeholder, value }: SidebarSearchProps) {
  return (
    <div className="relative px-3 pt-3">
      <Input
        aria-label={ariaLabel ?? placeholder}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}
