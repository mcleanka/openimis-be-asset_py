function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const baseStyles =
    "font-medium py-2.5 px-4 rounded-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "border border-blue-600 bg-white hover:bg-blue-50 text-blue-600 disabled:border-gray-400 disabled:text-gray-400",
    secondary:
      "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 disabled:border-gray-200 disabled:text-gray-300",
    danger: "border border-red-600 bg-white hover:bg-red-50 text-red-600",
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
