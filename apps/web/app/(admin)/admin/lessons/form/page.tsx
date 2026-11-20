
"use client";



import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  createLesson,
  getLesson,
  getLessons,
  updateLesson,
  bulkCreateLessons,
  deleteLesson,
} from "@/actions/lesson";
import { getTopics } from "@/actions/topic";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3 } from "@/components/typography";
import {
  CreateLessonFormData,
  CreateLessonSchema,
  lessonStatusLabels,
  CreateLessonsFormData,
  CreateLessonsSchema,
  type NewLessonInput,
} from "@/schemas/lesson";
import { Topic } from "@/types";
import { UPLOAD_PRESET } from "@/lib/constants";
import { useLessonFormStore } from "@/lib/stores/lesson-form-store";

const GRADES = [
  { value: "GRADE_1", label: "Lớp 1" },
  { value: "GRADE_2", label: "Lớp 2" },
  { value: "GRADE_3", label: "Lớp 3" },
  { value: "GRADE_4", label: "Lớp 4" },
  { value: "GRADE_5", label: "Lớp 5" },
];

const GRADE_LABELS: Record<string, string> = {
  GRADE_1: "Lớp 1",
  GRADE_2: "Lớp 2",
  GRADE_3: "Lớp 3",
  GRADE_4: "Lớp 4",
  GRADE_5: "Lớp 5",
};

export default function LessonFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [existingLessonsCount, setExistingLessonsCount] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedGrade: storeGrade, selectedTopicId: storeTopicId, clearSelection } = useLessonFormStore();

  const lessonId = searchParams.get("id");
  const topicIdParam = searchParams.get("topicId");
  const isEditMode = !!lessonId;
  const isTopicLocked = !!topicIdParam;

  // Use different schemas based on mode
  const form = useForm<CreateLessonFormData | CreateLessonsFormData>({
    resolver: zodResolver(
      isTopicLocked ? CreateLessonsSchema : CreateLessonSchema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any,
    defaultValues: isTopicLocked
      ? {
          topicId: 0,
          lessons: [
            {
              title: "",
              description: "",
              status: "DRAFT",
              theoryText: "",
              phoneticsNote: "",
              grammarNote: "",
              audioUrl: "",
              coverImage: "",
            },
          ],
        }
      : {
          topicId: 0,
          title: "",
          description: "",
          status: "DRAFT",
          theoryText: "",
          phoneticsNote: "",
          grammarNote: "",
          audioUrl: "",
          coverImage: "",
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: "lessons" as any,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;

  // Fetch topics and lesson data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedTopics = await getTopics();
        setAvailableTopics(fetchedTopics);

        if (topicIdParam) {
          const parsedTopicId = parseInt(topicIdParam);
          const topic = fetchedTopics.find((t) => t.id === parsedTopicId);
          if (topic?.grade) {
            setSelectedGrade(topic.grade);
          }

          // Load existing lessons for this topic
          const existingLessons = await getLessons({ topicId: parsedTopicId });

          if (existingLessons.length > 0) {
            const allLessons = existingLessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              status: lesson.status,
              theoryText: lesson.theoryText ?? "",
              phoneticsNote: lesson.phoneticsNote ?? "",
              grammarNote: lesson.grammarNote ?? "",
              audioUrl: lesson.audioUrl ?? "",
              coverImage: lesson.coverImage ?? "",
              order: lesson.order,
            }));
            
            setExistingLessonsCount(allLessons.length);

            form.reset({
              topicId: parsedTopicId,
              lessons: allLessons,
            });
          } else {
            form.reset({
              topicId: parsedTopicId,
              lessons: [
                {
                  title: "",
                  description: "",
                  status: "DRAFT",
                  theoryText: "",
                  phoneticsNote: "",
                  grammarNote: "",
                  audioUrl: "",
                  coverImage: "",
                },
              ],
            });
          }
        } else if (isEditMode) {
          const lesson = await getLesson(parseInt(lessonId));
          const topic = fetchedTopics.find((t) => t.id === lesson.topicId);
          if (topic?.grade) {
            setSelectedGrade(topic.grade);
          }
          form.reset({
            topicId: lesson.topicId,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            status: lesson.status,
            theoryText: lesson.theoryText ?? "",
            phoneticsNote: lesson.phoneticsNote ?? "",
            grammarNote: lesson.grammarNote ?? "",
            audioUrl: lesson.audioUrl ?? "",
            coverImage: lesson.coverImage ?? "",
          });
        } else {
          // Auto-fill from store if filter was used
          if (storeGrade) {
            setSelectedGrade(storeGrade);
            toast.success(`Đã chọn lớp: ${GRADE_LABELS[storeGrade]}`);
          }
          if (storeTopicId) {
            const topic = fetchedTopics.find((t) => t.id === storeTopicId);
            if (topic) {
              form.setValue("topicId", storeTopicId);
              toast.success(`Đã chọn chủ đề: ${topic.title}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, isEditMode, topicIdParam, storeGrade, storeTopicId]);

  const onSubmit = async (data: CreateLessonFormData | CreateLessonsFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const singleData = data as CreateLessonFormData;
        const updatedLesson = await updateLesson(
          parseInt(lessonId),
          singleData
        );
        if (updatedLesson) {
          toast.success("Cập nhật bài luyện tập thành công");
          clearSelection();
        } else {
          toast.error("Cập nhật bài luyện tập thất bại");
        }
        router.push("/admin/lessons");
        router.refresh();
      } else if (isTopicLocked) {
        // Bulk create/update mode
        const bulkData = data as CreateLessonsFormData;
        
        // Split lessons into existing (with id) and new (without id)
        const existingLessons = bulkData.lessons.filter(lesson => lesson.id);
        const newLessons = bulkData.lessons.filter(lesson => !lesson.id);

        // Update existing lessons individually
        if (existingLessons.length > 0) {
          await Promise.all(
            existingLessons.map(lesson =>
              updateLesson(lesson.id!, {
                topicId: bulkData.topicId,
                title: lesson.title,
                description: lesson.description,
                status: lesson.status,
                theoryText: lesson.theoryText,
                phoneticsNote: lesson.phoneticsNote,
                grammarNote: lesson.grammarNote,
                audioUrl: lesson.audioUrl,
                coverImage: lesson.coverImage,
                order: lesson.order,
              })
            )
          );
        }

        // Create new lessons if any
        if (newLessons.length > 0) {
          const cleanedNewLessons = newLessons.map((lesson) => {
            const cleaned: NewLessonInput = {
              title: lesson.title,
              description: lesson.description,
              status: lesson.status,
            };
            
            // Only include optional fields if they have values
            if (lesson.theoryText) cleaned.theoryText = lesson.theoryText;
            if (lesson.phoneticsNote) cleaned.phoneticsNote = lesson.phoneticsNote;
            if (lesson.grammarNote) cleaned.grammarNote = lesson.grammarNote;
            if (lesson.audioUrl) cleaned.audioUrl = lesson.audioUrl;
            if (lesson.coverImage) cleaned.coverImage = lesson.coverImage;
            // DO NOT send order for new lessons - let backend auto-assign
            
            return cleaned;
          });
          await bulkCreateLessons(bulkData.topicId, cleanedNewLessons);
        }

        toast.success("Cập nhật thành công");
        clearSelection();
      } else {
        // Single create mode
        const singleData = data as CreateLessonFormData;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = singleData;
        const createdLesson = await createLesson(createData);
        if (createdLesson) {
          toast.success("Tạo bài luyện tập thành công");
          clearSelection();
        } else {
          toast.error("Tạo bài luyện tập thất bại");
        }
        router.push("/admin/lessons");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save lesson:", error);

      const errorMessage = (
        error as { payload?: { message?: string | string[] } }
      )?.payload?.message;

      if (typeof errorMessage === "string") {
        if (
          errorMessage.includes("Unique constraint") ||
          errorMessage.includes("already exists")
        ) {
          toast.error(
            "Bài luyện tập với thứ tự này đã tồn tại trong chủ đề. Vui lòng chọn thứ tự khác."
          );
          return;
        }
        if (
          errorMessage.includes("Topic") &&
          errorMessage.includes("not found")
        ) {
          toast.error("Không tìm thấy chủ đề. Vui lòng chọn chủ đề khác.");
          return;
        }
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else {
        toast.error(
          isEditMode ? "Cập nhật bài luyện tập thất bại" : "Tạo bài luyện tập thất bại"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleCoverImageUpload(index: number | undefined, result: any) {
    if (result?.info?.secure_url) {
      if (index !== undefined && isTopicLocked) {
        form.setValue(`lessons.${index}.coverImage`, result.info.secure_url);
      } else {
        form.setValue("coverImage", result.info.secure_url);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleAudioUpload(index: number | undefined, result: any) {
    if (result?.info?.secure_url) {
      if (index !== undefined && isTopicLocked) {
        form.setValue(`lessons.${index}.audioUrl`, result.info.secure_url);
      } else {
        form.setValue("audioUrl", result.info.secure_url);
      }
    }
  }

  function handleGradeChange(grade: string) {
    setSelectedGrade(grade);
    form.setValue("topicId", 0);
  }

  function handleCancel() {
    clearSelection();
    router.back();
  }

  function handleAddLesson() {
    append({
      title: "",
      description: "",
      status: "DRAFT",
      theoryText: "",
      phoneticsNote: "",
      grammarNote: "",
      audioUrl: "",
      coverImage: "",
      // Don't set order here - backend will auto-assign
    });
  }

  async function handleRemoveLesson(index: number) {
    const lesson = form.getValues(`lessons.${index}` as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    
    // If lesson has an id, it exists in the database and needs to be deleted
    if (lesson.id) {
      try {
        await deleteLesson(lesson.id);
        toast.success("Đã xóa bài luyện tập thành công");
        remove(index);
      } catch (error) {
        console.error("Failed to delete lesson:", error);
        toast.error("Xóa bài luyện tập thất bại");
      }
    } else {
      // Just remove from form array if it's a new lesson not yet saved
      remove(index);
    }
  }

  function toggleCardExpanded(fieldId: string) {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  }

  const filteredTopics = selectedGrade
    ? availableTopics.filter((topic) => topic.grade === selectedGrade)
    : [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/lessons">
                Bài luyện tập
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isEditMode ? "Chỉnh sửa" : isTopicLocked ? "Tạo/sửa nhiều bài luyện tập" : "Thêm mới"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TypographyH3>
        {isEditMode ? "Chỉnh sửa bài luyện tập" : isTopicLocked ? "Tạo/sửa nhiều bài luyện tập" : "Thêm bài luyện tập mới"}
      </TypographyH3>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="space-y-6"
        >
          {/* Grade and Topic Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormItem className="flex flex-col">
              <FormLabel>
                Khối lớp <RequiredField />
              </FormLabel>
              <FormControl>
                <Combobox
                  options={GRADES.map((g) => ({
                    value: g.value,
                    label: g.label,
                  }))}
                  value={selectedGrade}
                  onValueChange={(value) => handleGradeChange(value)}
                  placeholder="Chọn khối lớp"
                  searchPlaceholder="Tìm kiếm khối lớp..."
                  emptyText="Không tìm thấy khối lớp."
                  className={cn(!selectedGrade && "text-muted-foreground")}
                  disabled={isTopicLocked}
                />
              </FormControl>
              {isTopicLocked && (
                <FormDescription>
                  Khối lớp đã được chọn và không thể thay đổi
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>

            <FormField
              control={formControl}
              name="topicId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Chủ đề <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={filteredTopics.map((topic) => ({
                        value: topic.id.toString(),
                        label: topic.title,
                      }))}
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      placeholder={
                        selectedGrade
                          ? "Chọn chủ đề"
                          : "Vui lòng chọn khối lớp trước"
                      }
                      searchPlaceholder="Tìm kiếm chủ đề..."
                      emptyText={
                        selectedGrade
                          ? "Không tìm thấy chủ đề."
                          : "Chưa chọn khối lớp."
                      }
                      disabled={!selectedGrade || isTopicLocked}
                      className={cn(!field.value && "text-muted-foreground")}
                    />
                  </FormControl>
                  {isTopicLocked && (
                    <FormDescription>
                      Chủ đề đã được chọn và không thể thay đổi
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bulk Mode: List of Lessons */}
          {isTopicLocked ? (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Danh sách bài luyện tập</h3>
                    {existingLessonsCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Đang có {existingLessonsCount} bài luyện tập từ trước. Bạn có thể sửa hoặc thêm mới.
                      </p>
                    )}
                  </div>
                  <Button type="button" onClick={handleAddLesson} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm bài luyện tập
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const isExpanded = expandedCards.has(field.id);
                  const lesson = form.getValues(`lessons.${index}` as any); // eslint-disable-line @typescript-eslint/no-explicit-any
                  const hasContent = lesson?.title;

                  return (
                    <Card key={field.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleCardExpanded(field.id)}
                            className="flex items-center gap-2 text-left flex-1"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <CardTitle className="text-base">
                              Bài luyện tập #{index + 1}
                              {hasContent && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                  {lesson.title ? ` - ${lesson.title}` : ""}
                                </span>
                              )}
                            </CardTitle>
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này sẽ xóa bài luyện tập vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveLesson(index)}>Xóa</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="space-y-4 pt-0">
                          {/* Title */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Tiêu đề <RequiredField />
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Nhập tiêu đề bài luyện tập" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Description */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Mô tả <RequiredField />
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Nhập mô tả bài luyện tập"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Status */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Trạng thái <RequiredField />
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(lessonStatusLabels).map(
                                      ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />

                          {/* Theory Text */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.theoryText`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nội dung lý thuyết</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Nhập nội dung lý thuyết"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Phonetics Note */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.phoneticsNote`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ghi chú phát âm</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Nhập ghi chú về phát âm"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Grammar Note */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.grammarNote`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ghi chú ngữ pháp</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Nhập ghi chú về ngữ pháp"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator />

                          {/* Cover Image */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.coverImage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ảnh bìa</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} placeholder="URL ảnh bìa" />
                                    <CldUploadWidget
                                      uploadPreset={UPLOAD_PRESET}
                                      onSuccess={(result) => handleCoverImageUpload(index, result)}
                                    >
                                      {({ open }) => (
                                        <Button
                                          type="button"
                                          size="icon"
                                          onClick={() => open()}
                                        >
                                          <ImageIcon className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </CldUploadWidget>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Audio URL */}
                          <FormField
                            control={formControl}
                            name={`lessons.${index}.audioUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>File âm thanh</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} placeholder="URL âm thanh" />
                                    <CldUploadWidget
                                      uploadPreset={UPLOAD_PRESET}
                                      onSuccess={(result) => handleAudioUpload(index, result)}
                                    >
                                      {({ open }) => (
                                        <Button
                                          type="button"
                                          size="icon"
                                          onClick={() => open()}
                                        >
                                          <Upload className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </CldUploadWidget>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            /* Single Mode: Original Form Fields */
            <>
              {/* Title */}
              <FormField
                control={formControl}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiêu đề <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tiêu đề bài luyện tập" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={formControl}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mô tả <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập mô tả bài luyện tập"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order and Status */}
              <div
                className={`grid gap-4 ${
                  isEditMode ? "md:grid-cols-2" : "md:grid-cols-1"
                }`}
              >
                {isEditMode && (
                  <FormField
                    control={formControl}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thứ tự</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={formControl}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Trạng thái <RequiredField />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(lessonStatusLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Theory Text */}
              <FormField
                control={formControl}
                name="theoryText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung lý thuyết</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập nội dung lý thuyết"
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Nội dung lý thuyết sẽ được hiển thị cho học viên
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phonetics Note */}
              <FormField
                control={formControl}
                name="phoneticsNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú phát âm</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập ghi chú về phát âm"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Hướng dẫn phát âm cho học viên
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grammar Note */}
              <FormField
                control={formControl}
                name="grammarNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú ngữ pháp</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập ghi chú về ngữ pháp"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Hướng dẫn ngữ pháp cho học viên
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Cover Image */}
              <FormField
                control={formControl}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh bìa</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="URL ảnh bìa" />
                        <CldUploadWidget
                          uploadPreset={UPLOAD_PRESET}
                          onSuccess={(result) => handleCoverImageUpload(undefined, result)}
                        >
                          {({ open }) => (
                            <Button
                              type="button"
                              size="icon"
                              onClick={() => open()}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Ảnh bìa sẽ được hiển thị trong danh sách bài luyện tập
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Audio URL */}
              <FormField
                control={formControl}
                name="audioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File âm thanh</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="URL âm thanh" />
                        <CldUploadWidget
                          uploadPreset={UPLOAD_PRESET}
                          onSuccess={(result) => handleAudioUpload(undefined, result)}
                        >
                          {({ open }) => (
                            <Button
                              type="button"
                              size="icon"
                              onClick={() => open()}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </FormControl>
                    <FormDescription>
                      File âm thanh phát âm mẫu cho bài luyện tập
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4 pb-2">
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Cập nhật" : isTopicLocked ? "Lưu tất cả" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
