import Image from "next/image";
import Link from "next/link";
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  MicrophoneIcon,
} from "@/components/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudyHeaderProps {
  readonly title: string;
  readonly kind: { readonly vi: string; readonly en: string };
  readonly backHref: string;
  readonly index: number;
  readonly total: number;
  readonly onReset: () => void;
}

export function StudyHeader({ title, kind, backHref, index, total, onReset }: StudyHeaderProps) {
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild size="icon" className="size-11" aria-label="Về danh sách chủ đề">
          <Link href={backHref}>
            <ArrowLeftIcon className="size-5" aria-hidden="true" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-2xl font-black leading-tight text-ink sm:text-3xl">
            {title}
          </h1>
          <p className="text-base font-extrabold text-sky-ink">
            {kind.vi} · {kind.en}
          </p>
        </div>
        <Button onClick={onReset} className="h-11" aria-label="Học lại từ thẻ đầu">
          <ArrowCounterClockwiseIcon aria-hidden="true" />
          <span className="hidden sm:inline">Học lại</span>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Tiến độ"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          className="relative h-4 flex-1 overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_2px_#D3EEC2]"
        >
          <div
            className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-peel motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          >
            <span className="mx-2 mt-[3px] block h-1 rounded-full bg-white/40" aria-hidden="true" />
          </div>
        </div>
        <p className="shrink-0 text-base font-black tabular-nums text-ink">
          {index + 1}
          <span className="text-ink-body">/{total}</span>
        </p>
      </div>
    </header>
  );
}

interface StudyNavProps {
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly isDone: boolean;
  readonly doneLabel: string;
  readonly todoLabel: string;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
}

export function StudyNav({
  isFirst,
  isLast,
  isDone,
  doneLabel,
  todoLabel,
  onPrevious,
  onNext,
}: StudyNavProps) {
  return (
    <nav aria-label="Chuyển thẻ" className="flex flex-col gap-3">
      <p
        aria-live="polite"
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-center text-sm font-extrabold sm:text-base",
          isDone ? "bg-leaf-wash text-forest" : "bg-sun-wash text-sun-body",
        )}
      >
        {isDone ? (
          <CheckIcon aria-hidden="true" className="size-5 shrink-0" />
        ) : (
          <MicrophoneIcon aria-hidden="true" className="size-5 shrink-0" />
        )}
        {isDone ? doneLabel : todoLabel}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={onPrevious} disabled={isFirst} className="h-14">
          <CaretLeftIcon aria-hidden="true" className="size-5" />
          Quay lại
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={onNext}
          disabled={isLast || !isDone}
          className="h-14 uppercase"
        >
          Tiếp tục
          <CaretRightIcon aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </nav>
  );
}

interface StudyEmptyProps {
  readonly title: string;
  readonly echo: string;
  readonly body?: string;
  readonly backHref?: string;
}

export function StudyEmpty({ title, echo, body, backHref = "/learn/units" }: StudyEmptyProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-[28px] bg-white px-6 py-12 text-center shadow-sheet-lime">
      <Image src="/mascot.svg" alt="" width={72} height={72} />
      <h1 className="mt-4 text-2xl font-black text-ink">{title}</h1>
      <p className="mt-1 text-base font-extrabold text-sky-ink">{echo}</p>
      {body ? <p className="mt-3 max-w-md text-base text-ink-body">{body}</p> : null}
      <Button asChild variant="secondary" size="lg" className="mt-6">
        <Link href={backHref}>Về danh sách chủ đề</Link>
      </Button>
    </div>
  );
}
