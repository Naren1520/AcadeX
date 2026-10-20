"use client";

import { useId } from "react";
import * as RadixSelect from "@radix-ui/react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
}

export function Select({
  id,
  label,
  placeholder = "Select…",
  value,
  onValueChange,
  options,
  error,
  disabled,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="flex w-full cursor-pointer items-center justify-between rounded px-3 py-2 text-sm text-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
            backgroundColor: "#ffffff",
          }}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="#6b7280"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 overflow-hidden rounded bg-white shadow-md"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <RadixSelect.Viewport>
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-pointer items-center px-3 py-2 text-sm text-neutral-900 outline-none"
                  style={{ userSelect: "none" }}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
