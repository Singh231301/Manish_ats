export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="tabs">
      {options.map((option) => (
        <button
          key={option.value}
          className={option.value === value ? "tab active" : "tab"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
