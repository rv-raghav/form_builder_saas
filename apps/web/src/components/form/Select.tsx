import { useState } from 'react';
import SelectField from './input/SelectField';

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    options: Option[];
    placeholder?: string;
    onChange: (value: string) => void;
    className?: string;
    defaultValue?: string;
}

/**
 * Uncontrolled Select component that manages its own state.
 * For controlled usage, prefer SelectField from './input/SelectField'.
 */
const Select: React.FC<SelectProps> = ({
    options,
    placeholder = 'Select an option',
    onChange,
    className = '',
    defaultValue = '',
}) => {
    const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedValue(value);
        onChange(value);
    };

    return (
        <SelectField
            value={selectedValue}
            onChange={handleChange}
            options={options}
            placeholder={placeholder}
            className={className}
        />
    );
};

export default Select;
