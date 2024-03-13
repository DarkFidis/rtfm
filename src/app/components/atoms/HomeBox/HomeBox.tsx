import React from "react";
import {HomeBoxProps} from "@/app/components/atoms/HomeBox/HomeBox.types";

export const HomeBox: React.FC<HomeBoxProps> = ({ children }) => (
    <div className={'h-full w-full bg-gray-950/70 p-16'}>{ children }</div>
)