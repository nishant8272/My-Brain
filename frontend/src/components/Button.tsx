import type { ReactElement } from "react"

interface buttonProp{
    variant : "primary"|"secondary",
    text:string,
    startIcon :ReactElement
}
const variantclass ={
    "primary" :"bg-purple-600 text-white",
    "secondary" :"bg-purple-200 text-purple-600"
}

const defaultStyle="px-4 py-2 rounded-md font- normal flex justify-center items-center";

function Button({variant,text,startIcon}:buttonProp) {

  return (
    <button className={variantclass[variant]+" " +defaultStyle}>
        <div className="pr-2">
   {startIcon}
        </div>
   {text}
    </button>
  )
}

export default Button
