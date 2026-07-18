const Button = ({ text, variant = "primary", onClick }) => {
  const baseClasses =
    "cursor-pointer px-6 py-3 rounded-lg font-semibold transition-all duration-300";

  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    secondary:
      "border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {text}
    </button>
  );
};

export default Button;