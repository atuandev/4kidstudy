import type * as C from "@4kidstudy/contracts";
import type {
  Attempt,
  AttemptDetail,
  Exercise,
  ExerciseOption,
  Flashcard,
  LearningProgress,
  Lesson,
  Sentence,
  SentenceImage,
  Topic,
  User,
} from "./index";

type Extra<Local, Model, Allowed extends PropertyKey> = Exclude<
  keyof Local,
  keyof Model | Allowed | "_count"
>;
type Assert<T extends true> = T;
type NoDrift<K> = [K] extends [never] ? true : { notOnBackendModel: K };

export type ContractDriftChecks = [
  Assert<NoDrift<Extra<Topic, C.Topic, C.TopicRelation>>>,
  Assert<NoDrift<Extra<Lesson, C.Lesson, C.LessonRelation>>>,
  Assert<NoDrift<Extra<Exercise, C.Exercise, C.ExerciseRelation>>>,
  Assert<NoDrift<Extra<ExerciseOption, C.ExerciseOption, C.ExerciseOptionRelation>>>,
  Assert<NoDrift<Extra<Flashcard, C.Flashcard, C.FlashcardRelation>>>,
  Assert<NoDrift<Extra<SentenceImage, C.SentenceImage, C.SentenceImageRelation>>>,
  Assert<NoDrift<Extra<Sentence, C.Sentence, C.SentenceRelation>>>,
  Assert<NoDrift<Extra<Attempt, C.Attempt, C.AttemptRelation>>>,
  Assert<NoDrift<Extra<AttemptDetail, C.AttemptDetail, C.AttemptDetailRelation>>>,
  Assert<NoDrift<Extra<LearningProgress, C.LearningProgress, C.LearningProgressRelation>>>,
  Assert<NoDrift<Extra<User, C.User, C.UserRelation>>>,
];
