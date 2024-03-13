import Image from "next/image";
import {HomeBox} from "@/app/components/atoms/HomeBox/HomeBox";
import {ThemeCard} from "@/app/components/molecules/ThemeCard/ThemeCard";
import {themes} from "@/config/constants";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-around p-24 size-full bg-sete">
        <HomeBox>
            <div className={'flex justify-between'}>
                { themes.map((theme, index) => (
                    <ThemeCard {...theme} key={index} />
                ))}
            </div>
        </HomeBox>
    </main>
  );
}
