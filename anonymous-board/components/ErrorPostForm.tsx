interface ErrorPostFormProps {
  errorMessage?: string;
}

export default function ErrorPostForm({ errorMessage }: ErrorPostFormProps) {
  return (
    <div class="flex justify-between w-full mb-2 border-rl-4 border-red-500 text-red-400 bg-red-100 p-2 font-large text-center rounded">
      <div class="w-full">
        {errorMessage}
      </div>
    </div>
  );
}
