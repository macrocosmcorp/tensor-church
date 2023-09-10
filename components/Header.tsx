import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  console.log(pathname);
  const active = (path: string) => clsx(pathname === path ? "bg-slate-200 p-2 rounded-lg text-gray-900" : "hover:bg-slate-200 p-2 rounded-lg text-gray-500");

  return (
    <div className="flex w-full max-w-[700px] py-4 justify-evenly items-center gap-x-2 gap-y-3 flex-wrap mb-2">
    </div >
  )
}