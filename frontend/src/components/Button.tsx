import type { ReactElement } from "react";

interface buttonProp {
  variant: "primary" | "secondary";
  text: string;
  startIcon?: ReactElement;
  onClick?: () => void;
  fullwidth?: boolean;
  loading?: boolean;
}

const variantclass = {
  "primary": "bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold shadow-md",
  "secondary": "bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 font-medium"
};

const defaultStyle = "px-4 py-2 rounded-xl text-xs sm:text-sm transition-all flex justify-center items-center cursor-pointer";

function Button({ variant, text, startIcon, onClick, fullwidth, loading }: buttonProp) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${variantclass[variant]} ${defaultStyle} ${fullwidth ? "w-full" : ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {startIcon && <div className="pr-2">{startIcon}</div>}
      <span>{text}</span>
    </button>
  );
}

export default Button;
