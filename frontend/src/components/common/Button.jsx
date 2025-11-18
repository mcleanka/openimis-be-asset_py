function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const baseStyles = "font-medium py-2 px-4 rounded-lg transition-colors";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-400",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    link: "text-blue-600 hover:text-blue-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
