import React from "react";
import { FormField } from "./index";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...rest
}) => {
  return (
    <FormField label={label} error={error}>
      <input
        className={`form-input ${error ? "input-error" : ""} ${className}`.trim()}
        {...rest}
      />
    </FormField>
  );
};

export default Input;
