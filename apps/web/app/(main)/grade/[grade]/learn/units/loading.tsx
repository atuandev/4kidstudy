/** Skeleton of the topic grid, so the page keeps its shape while topics load. */
const Loading = () => {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-label="Đang tải chủ đề">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-white/70" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[28px] bg-white p-5 shadow-sheet-lime">
            <div className="aspect-[16/9] animate-pulse rounded-[22px] bg-wash" />
            <div className="mt-5 h-6 w-2/3 animate-pulse rounded-lg bg-wash" />
            <div className="mt-5 h-14 animate-pulse rounded-md bg-wash" />
            <div className="mt-2.5 h-14 animate-pulse rounded-md bg-wash" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
