import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  console.log(pathname);
  const active = (path: string) => clsx(pathname === path ? "bg-slate-200 p-2 rounded-lg text-gray-900" : "hover:bg-slate-200 p-2 rounded-lg text-gray-500");

  return (
    <div className="flex w-full max-w-[700px] py-4 justify-evenly items-center gap-x-2 gap-y-3 flex-wrap mb-2">
      <Link href="/">
        <h2 className={clsx("text-sm font-medium text-center rounded-lg", active('/'))}>All Beliefs</h2>
      </Link>
      <Link href="/christian">
        <h2 className={clsx("text-sm font-medium text-center rounded-lg", active('/christian'))}>Christianity</h2>
      </Link>
      <Link href="/mormon">
        <h2 className={clsx("text-sm font-medium text-center rounded-lg", active('/mormon'))}>Mormonism</h2>
      </Link>
      <Link href="/islam">
        <h2 className={clsx("text-sm font-medium text-center rounded-lg", active('/islam'))}>Islam</h2>
      </Link>
      <Link href="/hindu">
        < h2 className={clsx("text-sm font-medium text-center rounded-lg", active('/hindu'))}>Hinduism</h2>
      </Link>
      <Link href="/ruism">
        < h2 className={clsx("text-sm font-medium text-center rounded-lg", active('/ruism'))}>Confucianism</h2>
      </Link>
      <Link href="https://alex.macrocosm.so/religion">
        < h2 className={clsx("text-sm font-medium text-center rounded-lg", active(''))}>About Us</h2>
      </Link>
    </div >
  )
}