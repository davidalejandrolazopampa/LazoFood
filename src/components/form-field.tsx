export function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  defaultValue,
  required,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-foreground/80">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 focus:border-brand-sage focus:outline-none"
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
