import { Input } from '@/components/ui/input';

interface SidebarSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export function SidebarSearch({ ariaLabel, onChange, placeholder, value }: SidebarSearchProps) {
  return (
    <div className="relative px-3 pt-3">
      <Input
        type="search"
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
