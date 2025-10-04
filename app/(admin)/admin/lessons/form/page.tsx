"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

import { createLesson, getLesson, updateLesson } from "@/actions/lesson";
import { getTopics } from "@/actions/topic";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3 } from "@/components/typography";
import {
  CreateLessonFormData,
  CreateLessonSchema,
  lessonStatusLabels,
} from "@/schemas/lesson";
import { Topic } from "@/types";
import { UPLOAD_PRESET } from "@/lib/constants";

function getGradeLabel(grade: string): string {
  const gradeMap: Record<string, string> = {
    GRADE_1: "Lớp 1",
    GRADE_2: "Lớp 2",
    GRADE_3: "Lớp 3",
    GRADE_4: "Lớp 4",
    GRADE_5: "Lớp 5",
  };
  return gradeMap[grade] || grade;
}

export default function LessonFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topicComboboxOpen, setTopicComboboxOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("id");
  const isEditMode = !!lessonId;

  const form = useForm<CreateLessonFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateLessonSchema) as any,
    defaultValues: {
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

  // Type-safe control for FormField components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;

  // Fetch topics and lesson data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedTopics = await getTopics();
        setAvailableTopics(fetchedTopics);

        if (isEditMode) {
          const lesson = await getLesson(parseInt(lessonId));
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
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, isEditMode]);

  const onSubmit = async (data: CreateLessonFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updatedLesson = await updateLesson(parseInt(lessonId), data);
        if (updatedLesson) {
          toast.success("Cập nhật bài học thành công");
        } else {
          toast.error("Cập nhật bài học thất bại");
        }
      } else {
        // Remove order field when creating to let backend auto-generate it
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = data;
        const createdLesson = await createLesson(createData);
        if (createdLesson) {
          toast.success("Tạo bài học thành công");
        } else {
          toast.error("Tạo bài học thất bại");
        }
      }
      router.push("/admin/lessons");
      router.refresh();
    } catch (error) {
      console.error("Failed to save lesson:", error);

      // Handle specific error messages from backend
      const errorMessage = (
        error as { payload?: { message?: string | string[] } }
      )?.payload?.message;

      if (typeof errorMessage === "string") {
        // Check for order conflict error
        if (
          errorMessage.includes("Unique constraint") ||
          errorMessage.includes("already exists")
        ) {
          toast.error(
            "Bài học với thứ tự này đã tồn tại trong chủ đề. Vui lòng chọn thứ tự khác."
          );
          return;
        }
        // Check for topic not found
        if (
          errorMessage.includes("Topic") &&
          errorMessage.includes("not found")
        ) {
          toast.error("Không tìm thấy chủ đề. Vui lòng chọn chủ đề khác.");
          return;
        }
        // Show the backend error message
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        // Handle validation errors array
        toast.error(errorMessage.join(", "));
      } else {
        // Generic error message
        toast.error(
          isEditMode ? "Cập nhật bài học thất bại" : "Tạo bài học thất bại"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCoverImageUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue("coverImage", result.info.secure_url);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAudioUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue("audioUrl", result.info.secure_url);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
                {isEditMode ? "Chỉnh sửa" : "Thêm mới"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TypographyH3>
        {isEditMode ? "Chỉnh sửa bài luyện tập" : "Thêm bài luyện tập mới"}
      </TypographyH3>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="space-y-6"
        >
          {/* Topic Selection */}
          <FormField
            control={formControl}
            name="topicId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Chủ đề <RequiredField />
                </FormLabel>
                <Popover
                  open={topicComboboxOpen}
                  onOpenChange={setTopicComboboxOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="default"
                        role="combobox"
                        aria-expanded={topicComboboxOpen}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <>
                            {
                              availableTopics.find(
                                (topic) => topic.id === field.value
                              )?.title
                            }{" "}
                            (
                            {getGradeLabel(
                              availableTopics.find(
                                (topic) => topic.id === field.value
                              )?.grade || ""
                            )}
                            )
                          </>
                        ) : (
                          "Chọn chủ đề"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm chủ đề..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy chủ đề.</CommandEmpty>
                        <CommandGroup>
                          {availableTopics.map((topic) => (
                            <CommandItem
                              key={topic.id}
                              value={`${topic.title} ${topic.grade}`}
                              onSelect={() => {
                                field.onChange(topic.id);
                                setTopicComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === topic.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {topic.title} ({getGradeLabel(topic.grade || "")})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      onSuccess={handleCoverImageUpload}
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
                      onSuccess={handleAudioUpload}
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
              {isEditMode ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
