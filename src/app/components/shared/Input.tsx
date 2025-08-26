import type { ChangeEvent, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
export default function Input({
  value,
  onChange,
  disabled,
  ...props
}: {
  value?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
} & InputProps) {
  return (
    <input
      className="w-full p-2 border rounded-md dark:bg-stone-800 disabled:text-stone-400 dark:disabled:bg-stone-600 disabled:bg-stone-900/10 dark:disabled:text-white/50 outline-2 outline-offset-2 dark:border-white/30 outline-blue-500 focus:outline"
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...props}
    />
  );
}
