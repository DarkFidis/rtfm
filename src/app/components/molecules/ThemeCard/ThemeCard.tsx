import React from "react";
import {ThemeCardProps} from "./ThemeCard.types";
import "./ThemeCard.css"
import Link from "next/link";
import Image from "next/image";

export const ThemeCard: React.FC<ThemeCardProps> = ({ href, iconLink, title}) => (
    <Link href={href}>
       <div className={'bg-sky-50 size-40 p-5 relative overflow-hidden card-body'}>
           <Image src={iconLink} alt={title} width={150} height={150} />
           <div className="absolute card-title bg-emerald-800/80 z-10 w-full text-xl text-sky-200 font-semibold">
               <p className={'p-4'}>{ title }</p>
           </div>
       </div>
    </Link>
)