import Image from "next/image";

export function generateMetadata() {
  return {
    title: `聊天室`,
    description: `聊天室`,
  };
}
export default function Page() {
  return (
    <div className="justify-center hidden transition-all sm:flex sm:items-center sm:w-full sm:h-full sm:dark:bg-neutral-800">
      <Image src="/chat.png" width={100} height={100} alt="icon" />
    </div>
  );
}
