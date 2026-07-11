type StoreFooterProps = {
  storeName: string;
};

export function StoreFooter({ storeName }: StoreFooterProps) {
  return (
    <footer className="mt-auto border-t border-black/[0.06] bg-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-[12px] text-[#86868b]">
          Powered by{" "}
          <a
            href="/"
            className="font-medium text-[#1d1d1f] underline-offset-2 transition-opacity hover:opacity-70 hover:underline"
          >
            CartFlow
          </a>
          {" · "}
          {storeName}
        </p>
      </div>
    </footer>
  );
}