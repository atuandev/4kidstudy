/** Skeleton of the practice page: topic sheets on the left, stats on the right. */
const Loading = () => {
  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8"
      aria-busy="true"
      aria-label="Đang tải bài luyện tập"
    >
      <div className="flex flex-col gap-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-white/70" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-[28px] bg-white p-4 shadow-sheet-lime"
          >
            <div className="size-20 shrink-0 animate-pulse rounded-[18px] bg-wash" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-2/3 animate-pulse rounded-lg bg-wash" />
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-wash" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 lg:mt-16">
        <div className="h-96 animate-pulse rounded-[28px] bg-white/70" />
        <div className="h-48 animate-pulse rounded-[28px] bg-white/70" />
      </div>
    </div>
  );
};

export default Loading;
