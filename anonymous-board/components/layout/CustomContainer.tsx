import { Head } from "$fresh/runtime.ts";
import Header from "../header.tsx";
type Props = {
  publicId?: string;
  title: string;
  children: ComponentChildren;
};

export default function CustomContainer({ publicId, title, children }: Props) {
  return (
    <div className="w-full mx-auto h-screen bg-gray-100">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="container mx-auto h-screen md:w-9/12 p-4 bg-gray-50">
        <Header publicId={publicId} />
        {children}
      </div>
    </div>
  );
}
