import ShareIcon from "../../icons/ShareIcon";
interface CardProp {
    title :String,
    link :String,
    Tags :Array<string>,
    text :String,
    type:"youtube" |"twitter"
}


export function Card({title,text,Tags,link,type}:CardProp) {
    return (
        <div className="bg-white rounded-md shadow-md p-4 outline-slate-200  border-gray-200 min-w-47 max-w-72">
            <div className="flex justify-between items-center  ">
                <div className="flex items-center text-"  >
                    <div className="text-gray-500 pr-2 "><ShareIcon /></div>
                    {title}
                </div>
                <div className="flex items-center  ">
                   <div className="text-gray-500 pr-2" > <a href={link} target="_blank">
                    <ShareIcon />
                    </a>
                    </div>
                   <div className="text-gray-500 "> <ShareIcon /></div>
                
                </div>
            </div>
            <div className="p-2 text-gray-500 ">
                {text}
            </div>
            <div className="pt-4 ">
                {type=="youtube"&&<iframe  className=" w-full rounded-lg"src={link.replace("watch","embed").replace("?v=","/")} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                }
                {type=="twitter" &&
                 <blockquote className="twitter-tweet">
            <a href={link.replace("x.com","twitter.com")}>
                 </a></blockquote>
                }
            </div>
            <div className="flex-col-3">
                {Tags}
            </div>
        </div>
    )
}
