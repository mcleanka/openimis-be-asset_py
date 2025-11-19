function NavTab({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-medium text-smtransition-colors cursor-pointer disabled:cursor-not-allowed ${
        isActive
          ? " border-b-2 border-blue-500 text-blue-600"
          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

export default NavTab;
