import * as React from "react"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={`border border-gray-300 p-2 rounded-md ${className}`}
            {...props}
        />
    )
);

Input.displayName = 'Input';

export default Input;