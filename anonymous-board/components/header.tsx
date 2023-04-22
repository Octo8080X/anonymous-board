type Props = {
  publicId?: string;
};

export default function Header({ publicId }: Props) {
  return (
    <div class="bg-white w-full py-6 px-8 flex flex-col md:flex-row gap-4 bg-transparent">
      <div class="flex items-center flex-1">
        <a href="/topics">
          <div class="text-2xl  ml-1 font-bold">Anonymous Board</div>
        </a>
      </div>
      <ul class="flex items-center gap-6">
        {publicId
          ? (
            <li>
              <span>ID: {publicId}</span>
            </li>
          )
          : (
            ""
          )}
        <li>
          {publicId
            ? (
              <a
                href="/auth/logout"
                class="bg-indigo-400 w-full rounded p-2 text-white"
              >
                ログアウト
              </a>
            )
            : (
              <a
                href="/auth/twitter/login"
                class="bg-indigo-400 w-full rounded p-2 text-white"
              >
                ログイン
              </a>
            )}
        </li>
      </ul>
    </div>
  );
}
