import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", ...props }, ref) => {
    const baseClass = "btn";
    const variantClass = `btn-${variant}`;
    const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
    
    const combinedClassName = [baseClass, variantClass, sizeClass, className]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };