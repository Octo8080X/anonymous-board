import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <div class="h-screen w-screen flex justify-center items-center bg-gray-100">
      <Head>
        <title>Anonymous board</title>
      </Head>
      <div class="flex flex-col">
        <a href="/topics" class="basis-1/2 block m-2 w-full">
          <img
            src="/logo.png"
            class="w-80 my-4 border-black border-black border-4 rounded-lg shadow-2xl"
            alt="Anonymous board"
          />
        </a>
      </div>
    </div>
  );
}
