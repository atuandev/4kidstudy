import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Headphones, ImageIcon, ListChecks, Mic, Puzzle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GradePicker } from "./_components/home/grade-picker";
import { StickerSheet } from "./_components/home/sticker-sheet";
import { WordArt } from "./_components/home/word-art";

const INK = "text-ink";

export default function Home() {
  // Server Component: rendered once per request/build, so reading the clock is fine.
  // oxlint-disable-next-line react/purity
  const year = new Date().getFullYear();

  return (
    <div
      className={`min-h-screen bg-lime ${INK} selection:bg-sun selection:text-ink`}
    >
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
        >
          <Image src="/mascot.svg" alt="" width={40} height={40} priority />
          <span className="text-2xl font-black tracking-tight text-forest">4KidStudy</span>
        </Link>
        <nav aria-label="Trang chủ" className="hidden gap-8 text-base font-extrabold md:flex">
          <NavLink href="#bai-hoc">Bài học</NavLink>
          <NavLink href="#luyen-noi">Luyện nói</NavLink>
          <NavLink href="#phu-huynh">Phụ huynh</NavLink>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="default" className="text-sky-deep">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <span className="hidden sm:block">
            <Button
              asChild
              variant="secondary"
              className="border-forest bg-leaf-deep text-white hover:bg-forest"
            >
              <Link href="/register">Đăng ký</Link>
            </Button>
          </span>
        </div>
      </header>

      <main>
        {/* Hero: the sticker sheet rises out of the page and becomes the white section below. */}
        <section className="mx-auto grid max-w-[1200px] gap-6 px-4 pt-6 sm:gap-10 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,7.5fr)] lg:gap-12">
          <div className="lg:pb-20 lg:pt-4">
            <h1 className="text-balance text-[2.25rem] font-black leading-[1.04] tracking-[-0.02em] sm:text-6xl">
              Mỗi ngày bóc thêm <span className="text-forest">một từ tiếng Anh</span> mới
            </h1>
            <p className="mt-3 text-xl font-extrabold text-sky-deep">
              Learn English one sticker at a time.
            </p>
            <p className="mt-4 max-w-[34rem] text-pretty text-base leading-relaxed sm:mt-5 sm:text-lg text-slate-600">
              Bài học, thẻ từ và luyện phát âm cho bé từ lớp 1 đến lớp 5. Từ nào cũng có nghĩa tiếng
              Việt và giọng đọc mẫu, và bé được chấm điểm khi tự đọc to.
            </p>
            <div className="mt-6 sm:mt-8">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-14 border-forest bg-leaf-deep px-8 text-lg text-white uppercase hover:bg-forest"
              >
                <Link href="/register">Bắt đầu học</Link>
              </Button>
            </div>
            <p className="mt-6 text-base font-extrabold sm:mt-8">Bé đang học lớp mấy?</p>
            <GradePicker className="mt-3" />
          </div>
          <StickerSheet />
        </section>

        <section id="bai-hoc" className="scroll-mt-6 bg-white">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <div>
              <h2 className="text-balance text-4xl font-black leading-tight tracking-[-0.02em] sm:text-5xl">
                Mỗi bài học là một chuỗi trò chơi nhỏ
              </h2>
              <p className="mt-3 text-lg font-extrabold text-sky-deep">
                Every lesson is a set of little games.
              </p>
              <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-slate-600">
                Bài học chia theo chủ đề của từng lớp. Các dạng câu hỏi xen kẽ nhau, bé trả lời đúng
                thì được cộng điểm XP.
              </p>
            </div>
            <ul className="divide-y-2 divide-slate-100 border-y-2 border-slate-100">
              <ExerciseRow
                icon={<ImageIcon />}
                color="#1CB0F6"
                shade="#0284C7"
                name="Chọn hình đúng"
                tilt={-4}
                en="Select the picture"
              >
                Đọc hoặc nghe một từ, rồi chọn hình đúng với từ đó.
              </ExerciseRow>
              <ExerciseRow
                icon={<ListChecks />}
                color="#A855F7"
                shade="#7E22CE"
                name="Trắc nghiệm"
                tilt={3}
                en="Multiple choice"
              >
                Chọn đáp án đúng cho câu hỏi về từ và câu.
              </ExerciseRow>
              <ExerciseRow
                icon={<Puzzle />}
                color="#FF9600"
                shade="#C2410C"
                name="Ghép cặp"
                tilt={-2}
                en="Matching"
              >
                Nối từ tiếng Anh với hình hoặc nghĩa của nó.
              </ExerciseRow>
              <ExerciseRow
                icon={<Headphones />}
                color="#14B8A6"
                shade="#0F766E"
                name="Nghe và chọn"
                tilt={4}
                en="Listening"
              >
                Nghe giọng đọc, rồi chọn đáp án bé nghe được.
              </ExerciseRow>
              <ExerciseRow
                icon={<Mic />}
                color="#FF4B4B"
                shade="#BE123C"
                name="Luyện phát âm"
                tilt={-3}
                en="Pronunciation"
              >
                Bé tự đọc to và được chấm điểm ngay.
              </ExerciseRow>
            </ul>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-start-2">
              <p className="text-base leading-relaxed text-slate-600">
                <span className={`block text-lg font-black ${INK}`}>Thẻ từ · Flashcards</span>
                Lật thẻ để xem nghĩa, nghe phát âm và tự ghi âm giọng đọc của bé.
              </p>
              <p className="text-base leading-relaxed text-slate-600">
                <span className={`block text-lg font-black ${INK}`}>
                  Câu theo tranh · Sentences
                </span>
                Xem một bức tranh, nghe các câu mô tả và hiểu nghĩa từng câu.
              </p>
            </div>
          </div>
        </section>

        <section id="luyen-noi" className="scroll-mt-6 bg-sun">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-2">
            <div>
              <h2 className="text-balance text-4xl font-black leading-tight tracking-[-0.02em] sm:text-5xl">
                Bé đọc to, 4KidStudy chấm điểm
              </h2>
              <p className="mt-3 text-lg font-extrabold text-sun-ink">
                Say it out loud, see the score.
              </p>
              <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-sun-body">
                Trong bài luyện phát âm, bé nghe giọng mẫu, bấm micro rồi tự đọc. Bài đọc được chấm
                theo độ chính xác, độ trôi chảy và độ đầy đủ, nên bé biết mình cần đọc lại chỗ nào.
              </p>
            </div>
            <ScoreSticker />
          </div>
        </section>

        <section id="phu-huynh" className="scroll-mt-6 bg-forest text-white">
          <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-2">
            <div>
              <h2 className="text-balance text-4xl font-black leading-tight tracking-[-0.02em] sm:text-5xl">
                Cùng bé xem lại bài đã làm
              </h2>
              <p className="mt-3 text-lg font-extrabold text-mint">
                For parents: see how practice went.
              </p>
              <p className="mt-5 max-w-[32rem] text-pretty text-lg leading-relaxed text-mint">
                Trang Luyện tập trong tài khoản của bé lưu lại từng lần làm bài: tỷ lệ đúng, số câu
                sai và những câu bé hay sai nhất để ôn lại.
              </p>
              <ul className="mt-8 space-y-3 text-base font-bold">
                <ParentPoint>
                  Nội dung chia theo lớp 1 đến lớp 5, đổi lớp bất cứ lúc nào.
                </ParentPoint>
                <ParentPoint>Từ và câu nào cũng có nghĩa tiếng Việt đi kèm.</ParentPoint>
                <ParentPoint>
                  Chuỗi ngày học, điểm XP và bảng xếp hạng giữ nhịp học mỗi ngày.
                </ParentPoint>
              </ul>
            </div>
            <HistorySticker />
          </div>
        </section>

        <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-4 py-20 sm:px-8 sm:py-28 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <Image
              src="/mascot.svg"
              alt=""
              width={88}
              height={88}
              loading="eager"
              className="shrink-0"
            />
            <div>
              <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.02em] sm:text-4xl">
                Bé đang học lớp mấy?
              </h2>
              <p className="mt-1 text-lg font-extrabold text-sky-deep">Pick a grade to start.</p>
            </div>
          </div>
          <div>
            <GradePicker size="lg" />
            <p className="mt-4 text-base text-slate-600">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-extrabold text-sky-deep underline decoration-2 underline-offset-4 hover:text-sky-ink"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-lime-rule">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {year} 4KidStudy</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-ink hover:underline underline-offset-4">
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="hover:text-ink hover:underline underline-offset-4"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md decoration-leaf decoration-[3px] underline-offset-8 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-sky/50"
    >
      {children}
    </Link>
  );
}

interface ExerciseRowProps {
  readonly icon: ReactNode;
  readonly color: string;
  readonly shade: string;
  readonly name: string;
  readonly en: string;
  /** Hand-placed tilt in degrees, like a sticker. */
  readonly tilt: number;
  readonly children: ReactNode;
}

function ExerciseRow({ icon, color, shade, name, en, tilt, children }: ExerciseRowProps) {
  return (
    <li className="flex items-start gap-5 py-5">
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-[18px] border-4 border-white text-white [&_svg]:size-6"
        style={{
          backgroundColor: color,
          rotate: `${tilt}deg`,
          boxShadow: `0 0 0 2px #E2E8F0, 0 8px 14px -6px ${shade}`,
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <p className="text-xl font-black">
          {name} <span className="ml-1 text-base font-bold text-slate-500">{en}</span>
        </p>
        <p className="mt-1 text-base leading-relaxed text-slate-600">{children}</p>
      </div>
    </li>
  );
}

function ParentPoint({ children }: { readonly children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sun text-ink"
        aria-hidden="true"
      >
        <Check className="size-4" strokeWidth={3.5} />
      </span>
      {children}
    </li>
  );
}

const HISTORY = [
  { label: "Tổng số lần", value: "3" },
  { label: "Tỷ lệ đúng", value: "86%" },
  { label: "Số câu sai", value: "4" },
] as const;

/** Mirrors the Practice page's history sheet for one lesson. The numbers are illustrative. */
function HistorySticker() {
  return (
    <figure className="relative -rotate-2 rounded-[32px] border-[6px] border-white bg-white p-6 text-ink shadow-[0_30px_50px_-24px_rgba(5,46,22,0.7)] sm:p-8 lg:ml-auto lg:max-w-[30rem]">
      <span className="absolute -top-4 right-6 rounded-full bg-sun px-3 py-1 text-xs font-black uppercase tracking-wide text-ink">
        Ví dụ minh họa
      </span>
      <p className="text-sm font-extrabold text-slate-500">Lịch sử luyện tập · Lớp 2</p>
      <p className="mt-1 text-2xl font-black">Animals · Lesson 3</p>
      <dl className="mt-6 grid grid-cols-3 gap-3">
        {HISTORY.map((item) => (
          <div key={item.label} className="rounded-2xl bg-wash px-3 py-3">
            <dt className="text-xs font-bold text-slate-500">{item.label}</dt>
            <dd className="mt-1 text-2xl font-black tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm font-extrabold text-slate-500">Các câu hỏi sai nhiều nhất</p>
      <ul className="mt-2 divide-y-2 divide-slate-100">
        <li className="flex items-center justify-between gap-4 py-2.5 text-base font-bold">
          <span>
            Đâu là “<span className="text-sky-deep">tiger</span>”?
          </span>
          <span className="rounded-full bg-cherry-wash px-2.5 py-0.5 text-sm font-black text-cherry-deep">
            Sai 2 lần
          </span>
        </li>
        <li className="flex items-center justify-between gap-4 py-2.5 text-base font-bold">
          <span>
            Ghép “<span className="text-sky-deep">rabbit</span>” với hình
          </span>
          <span className="rounded-full bg-cherry-wash px-2.5 py-0.5 text-sm font-black text-cherry-deep">
            Sai 1 lần
          </span>
        </li>
      </ul>
    </figure>
  );
}

const SCORES = [
  { label: "Chính xác", en: "Accuracy", value: 82 },
  { label: "Trôi chảy", en: "Fluency", value: 74 },
  { label: "Đầy đủ", en: "Completeness", value: 100 },
] as const;

/** A pronunciation result laid out like the in-app one. The numbers are illustrative. */
function ScoreSticker() {
  return (
    <figure className="relative rotate-[1.5deg] rounded-[32px] border-[6px] border-white bg-white p-6 shadow-[0_28px_50px_-24px_rgba(122,74,0,0.55)] sm:p-8 lg:ml-auto lg:max-w-[30rem]">
      <span className="absolute -top-4 right-6 rounded-full bg-ink px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
        Ví dụ minh họa
      </span>
      <div className="flex items-center gap-4">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-sun-wash">
          <WordArt word="banana" className="w-14" />
        </span>
        <div>
          <p className="text-3xl font-black">banana</p>
          <p className="text-base font-bold text-slate-500">/bəˈnæn.ə/ · quả chuối</p>
        </div>
        <span
          className="ml-auto flex size-14 shrink-0 items-center justify-center rounded-full bg-cherry text-white shadow-[0_5px_0_#BE123C]"
          aria-hidden="true"
        >
          <Mic className="size-7" />
        </span>
      </div>
      <dl className="mt-7 space-y-4">
        {SCORES.map((score) => (
          <div key={score.label}>
            <div className="flex items-baseline justify-between text-base">
              <dt className="font-extrabold">
                {score.label} <span className="font-bold text-slate-500">{score.en}</span>
              </dt>
              <dd className="font-black tabular-nums">{score.value}</dd>
            </div>
            <div className="mt-1.5 h-3.5 rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="h-full rounded-full bg-leaf"
                style={{ width: `${score.value}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
      <figcaption className="mt-6 text-sm font-semibold text-slate-500">
        Kết quả mẫu cho một lần đọc. Điểm thật hiện ra sau khi bé đọc trong bài học.
      </figcaption>
    </figure>
  );
}
