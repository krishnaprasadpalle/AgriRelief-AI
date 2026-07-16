const Button = ({ text, variant }) => {
  return (
    <button
      className="cursor-pointer bg-green-600 text-white px-6 py-3 rounded-lg"
    >
      {text}
    </button>
  );
};

export default Button;