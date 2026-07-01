import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

export interface DatePickerProps {
  value: string | Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  className = "",
  minDate,
  maxDate,
  disabled
}) => {
  const selectedDate = value ? new Date(value) : null;

  return (
    <div className={`custom-datepicker-wrapper ${className}`}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className="form-input"
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        showPopperArrow={false}
        portalId="root-portal"
      />
      <Calendar className="datepicker-icon" size={16} color="#888" />
    </div>
  );
};
