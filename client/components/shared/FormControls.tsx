'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { HTMLInputTypeAttribute } from 'react';

// --- Base Props ---
interface BaseFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

// --- Input Field ---
interface FormInputProps extends BaseFieldProps {
  type?: HTMLInputTypeAttribute;
}

export function FormInput({ name, label, type = 'text', className, ...props }: FormInputProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className={error ? "text-red-500" : ""}>
          {label}
        </Label>
      )}
      <Input
        id={name}
        type={type}
        className={cn(error && "border-red-500 hover:border-red-500 focus-visible:ring-red-200")}
        {...register(name)}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

// --- Textarea Field ---
interface FormTextareaProps extends BaseFieldProps {
  rows?: number;
}

export function FormTextarea({ name, label, rows = 3, className, ...props }: FormTextareaProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className={error ? "text-red-500" : ""}>
          {label}
        </Label>
      )}
      <Textarea
        id={name}
        rows={rows}
        className={cn(error && "border-red-500 hover:border-red-500 focus-visible:ring-red-200")}
        {...register(name)}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

// --- Checkbox Field ---
export function FormCheckbox({ name, label, className, ...props }: BaseFieldProps) {
  const { register } = useFormContext();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="checkbox"
        id={name}
        className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
        {...register(name)}
        {...props}
      />
      {label && (
        <Label htmlFor={name} className="font-normal cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  );
}

// --- Select Field ---
interface FormSelectProps extends BaseFieldProps {
  options: { value: string | number; label: string }[];
}

export function FormSelect({ name, label, options, placeholder, className, disabled }: FormSelectProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={error ? "text-red-500" : ""}>
          {label}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value ? String(field.value) : undefined}
          >
            <SelectTrigger className={cn(error && "border-red-500 ring-red-200")}>
              <SelectValue placeholder={placeholder || "Chọn..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
