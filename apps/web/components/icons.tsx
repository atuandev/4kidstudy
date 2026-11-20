/**
 * The app's one icon set: Phosphor, defaulting to the bold weight so strokes sit with
 * Nunito 900. Import icons from here, never from `@phosphor-icons/react` directly.
 *
 * The SSR entry has no React context, so these work in server and client components alike.
 * Pass `weight="fill"` or `weight="duotone"` for sticker-style badges and section icons.
 * Add new icons to the import list and the exports below.
 */
import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  ArrowCounterClockwiseIcon as ArrowCounterClockwiseGlyph,
  ArrowDownIcon as ArrowDownGlyph,
  ArrowLeftIcon as ArrowLeftGlyph,
  ArrowUpIcon as ArrowUpGlyph,
  BarbellIcon as BarbellGlyph,
  BookIcon as BookGlyph,
  BookOpenIcon as BookOpenGlyph,
  BookOpenTextIcon as BookOpenTextGlyph,
  CardsIcon as CardsGlyph,
  CaretDoubleLeftIcon as CaretDoubleLeftGlyph,
  CaretDoubleRightIcon as CaretDoubleRightGlyph,
  CaretDownIcon as CaretDownGlyph,
  CaretLeftIcon as CaretLeftGlyph,
  CaretRightIcon as CaretRightGlyph,
  CaretUpIcon as CaretUpGlyph,
  CaretUpDownIcon as CaretUpDownGlyph,
  ChartLineUpIcon as ChartLineUpGlyph,
  ChatTextIcon as ChatTextGlyph,
  CheckIcon as CheckGlyph,
  CheckCircleIcon as CheckCircleGlyph,
  CircleIcon as CircleGlyph,
  ClockIcon as ClockGlyph,
  ClockCounterClockwiseIcon as ClockCounterClockwiseGlyph,
  CopyIcon as CopyGlyph,
  DotsThreeIcon as DotsThreeGlyph,
  EyeIcon as EyeGlyph,
  EyeSlashIcon as EyeSlashGlyph,
  FileArrowUpIcon as FileArrowUpGlyph,
  FireIcon as FireGlyph,
  GearIcon as GearGlyph,
  GraduationCapIcon as GraduationCapGlyph,
  HeadphonesIcon as HeadphonesGlyph,
  ImageIcon as ImageGlyph,
  InfinityIcon as InfinityGlyph,
  KeyIcon as KeyGlyph,
  LightbulbIcon as LightbulbGlyph,
  ListIcon as ListGlyph,
  ListChecksIcon as ListChecksGlyph,
  MagnifyingGlassIcon as MagnifyingGlassGlyph,
  MicrophoneIcon as MicrophoneGlyph,
  NotebookIcon as NotebookGlyph,
  NotepadIcon as NotepadGlyph,
  PencilSimpleIcon as PencilSimpleGlyph,
  PlusIcon as PlusGlyph,
  PlusCircleIcon as PlusCircleGlyph,
  PuzzlePieceIcon as PuzzlePieceGlyph,
  RankingIcon as RankingGlyph,
  SidebarSimpleIcon as SidebarSimpleGlyph,
  SignOutIcon as SignOutGlyph,
  SkipForwardIcon as SkipForwardGlyph,
  SlidersHorizontalIcon as SlidersHorizontalGlyph,
  SpeakerHighIcon as SpeakerHighGlyph,
  SpinnerGapIcon as SpinnerGapGlyph,
  SquareIcon as SquareGlyph,
  TargetIcon as TargetGlyph,
  TrashIcon as TrashGlyph,
  TrophyIcon as TrophyGlyph,
  UploadSimpleIcon as UploadSimpleGlyph,
  UserIcon as UserGlyph,
  UserCircleIcon as UserCircleGlyph,
  UsersIcon as UsersGlyph,
  WarningCircleIcon as WarningCircleGlyph,
  WaveformIcon as WaveformGlyph,
  XIcon as XGlyph,
  XCircleIcon as XCircleGlyph,
} from "@phosphor-icons/react/ssr";

export type { Icon, IconProps, IconWeight } from "@phosphor-icons/react";

function bold(Glyph: Icon): Icon {
  function BoldIcon({ weight = "bold", ...props }: IconProps) {
    return <Glyph weight={weight} {...props} />;
  }
  BoldIcon.displayName = Glyph.displayName;
  return BoldIcon as Icon;
}

export const ArrowCounterClockwiseIcon = bold(ArrowCounterClockwiseGlyph);
export const ArrowDownIcon = bold(ArrowDownGlyph);
export const ArrowLeftIcon = bold(ArrowLeftGlyph);
export const ArrowUpIcon = bold(ArrowUpGlyph);
export const BarbellIcon = bold(BarbellGlyph);
export const BookIcon = bold(BookGlyph);
export const BookOpenIcon = bold(BookOpenGlyph);
export const BookOpenTextIcon = bold(BookOpenTextGlyph);
export const CardsIcon = bold(CardsGlyph);
export const CaretDoubleLeftIcon = bold(CaretDoubleLeftGlyph);
export const CaretDoubleRightIcon = bold(CaretDoubleRightGlyph);
export const CaretDownIcon = bold(CaretDownGlyph);
export const CaretLeftIcon = bold(CaretLeftGlyph);
export const CaretRightIcon = bold(CaretRightGlyph);
export const CaretUpIcon = bold(CaretUpGlyph);
export const CaretUpDownIcon = bold(CaretUpDownGlyph);
export const ChartLineUpIcon = bold(ChartLineUpGlyph);
export const ChatTextIcon = bold(ChatTextGlyph);
export const CheckIcon = bold(CheckGlyph);
export const CheckCircleIcon = bold(CheckCircleGlyph);
export const CircleIcon = bold(CircleGlyph);
export const ClockIcon = bold(ClockGlyph);
export const ClockCounterClockwiseIcon = bold(ClockCounterClockwiseGlyph);
export const CopyIcon = bold(CopyGlyph);
export const DotsThreeIcon = bold(DotsThreeGlyph);
export const EyeIcon = bold(EyeGlyph);
export const EyeSlashIcon = bold(EyeSlashGlyph);
export const FileArrowUpIcon = bold(FileArrowUpGlyph);
export const FireIcon = bold(FireGlyph);
export const GearIcon = bold(GearGlyph);
export const GraduationCapIcon = bold(GraduationCapGlyph);
export const HeadphonesIcon = bold(HeadphonesGlyph);
export const ImageIcon = bold(ImageGlyph);
export const InfinityIcon = bold(InfinityGlyph);
export const KeyIcon = bold(KeyGlyph);
export const LightbulbIcon = bold(LightbulbGlyph);
export const ListIcon = bold(ListGlyph);
export const ListChecksIcon = bold(ListChecksGlyph);
export const MagnifyingGlassIcon = bold(MagnifyingGlassGlyph);
export const MicrophoneIcon = bold(MicrophoneGlyph);
export const NotebookIcon = bold(NotebookGlyph);
export const NotepadIcon = bold(NotepadGlyph);
export const PencilSimpleIcon = bold(PencilSimpleGlyph);
export const PlusIcon = bold(PlusGlyph);
export const PlusCircleIcon = bold(PlusCircleGlyph);
export const PuzzlePieceIcon = bold(PuzzlePieceGlyph);
export const RankingIcon = bold(RankingGlyph);
export const SidebarSimpleIcon = bold(SidebarSimpleGlyph);
export const SignOutIcon = bold(SignOutGlyph);
export const SkipForwardIcon = bold(SkipForwardGlyph);
export const SlidersHorizontalIcon = bold(SlidersHorizontalGlyph);
export const SpeakerHighIcon = bold(SpeakerHighGlyph);
export const SpinnerGapIcon = bold(SpinnerGapGlyph);
export const SquareIcon = bold(SquareGlyph);
export const TargetIcon = bold(TargetGlyph);
export const TrashIcon = bold(TrashGlyph);
export const TrophyIcon = bold(TrophyGlyph);
export const UploadSimpleIcon = bold(UploadSimpleGlyph);
export const UserIcon = bold(UserGlyph);
export const UserCircleIcon = bold(UserCircleGlyph);
export const UsersIcon = bold(UsersGlyph);
export const WarningCircleIcon = bold(WarningCircleGlyph);
export const WaveformIcon = bold(WaveformGlyph);
export const XIcon = bold(XGlyph);
export const XCircleIcon = bold(XCircleGlyph);
