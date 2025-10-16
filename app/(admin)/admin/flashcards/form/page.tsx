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

import {
  createFlashcard,
  getFlashcard,
  updateFlashcard,
} from "@/actions/flashcard";
import { getTopics } from "@/actions/topic";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3 } from "@/components/typography";
import {
  CreateFlashcardFormData,
  CreateFlashcardSchema,
  flashcardStatusLabels,
} from "@/schemas/flashcard";
import { Topic } from "@/types";
import { UPLOAD_PRESET } from "@/lib/constants";

const GRADES = [
  { value: "GRADE_1", label: "Lớp 1" },
  { value: "GRADE_2", label: "Lớp 2" },
  { value: "GRADE_3", label: "Lớp 3" },
  { value: "GRADE_4", label: "Lớp 4" },
  { value: "GRADE_5", label: "Lớp 5" },
];

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

export default function FlashcardFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [gradeComboboxOpen, setGradeComboboxOpen] = useState(false);
  const [topicComboboxOpen, setTopicComboboxOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const flashcardId = searchParams.get("id");
  const isEditMode = !!flashcardId;

  const form = useForm<CreateFlashcardFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateFlashcardSchema) as any,
    defaultValues: {
      topicId: 0,
      term: "",
      phonetic: "",
      meaningVi: "",
      exampleEn: "",
      exampleVi: "",
      imageUrl: "",
      audioUrl: "",
      isActive: true,
    },
  });

  // Type-safe control for FormField components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;

  // Fetch topics and flashcard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedTopics = await getTopics();
        setAvailableTopics(fetchedTopics);

        if (isEditMode) {
          const flashcard = await getFlashcard(parseInt(flashcardId));
          // Find the topic to get its grade
          const topic = fetchedTopics.find((t) => t.id === flashcard.topicId);
          if (topic?.grade) {
            setSelectedGrade(topic.grade);
          }
          form.reset({
            topicId: flashcard.topicId,
            term: flashcard.term,
            phonetic: flashcard.phonetic,
            meaningVi: flashcard.meaningVi,
            exampleEn: flashcard.exampleEn ?? "",
            exampleVi: flashcard.exampleVi ?? "",
            imageUrl: flashcard.imageUrl ?? "",
            audioUrl: flashcard.audioUrl ?? "",
            order: flashcard.order,
            isActive: flashcard.isActive,
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
  }, [flashcardId, isEditMode]);

  const onSubmit = async (data: CreateFlashcardFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updatedFlashcard = await updateFlashcard(
          parseInt(flashcardId),
          data
        );
        if (updatedFlashcard) {
          toast.success("Cập nhật flashcard thành công");
        } else {
          toast.error("Cập nhật flashcard thất bại");
        }
      } else {
        // Remove order field when creating to let backend auto-generate it
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = data;
        const createdFlashcard = await createFlashcard(createData);
        if (createdFlashcard) {
          toast.success("Tạo flashcard thành công");
        } else {
          toast.error("Tạo flashcard thất bại");
        }
      }
      router.push("/admin/flashcards");
      router.refresh();
    } catch (error) {
      console.error("Failed to save flashcard:", error);

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
            "Flashcard với thứ tự này đã tồn tại trong chủ đề. Vui lòng chọn thứ tự khác."
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
          isEditMode ? "Cập nhật flashcard thất bại" : "Tạo flashcard thất bại"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue("imageUrl", result.info.secure_url);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAudioUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue("audioUrl", result.info.secure_url);
    }
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    // Reset topic selection when grade changes
    form.setValue("topicId", 0);
  };

  const handleCancel = () => {
    router.back();
  };

  // Filter topics by selected grade
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
              <BreadcrumbLink href="/admin/flashcards">
                Flashcards
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
        {isEditMode ? "Chỉnh sửa flashcard" : "Thêm flashcard mới"}
      </TypographyH3>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="space-y-6"
        >
          {/* Grade and Topic Selection - 2 Column Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Grade Selection */}
            <div className="flex flex-col space-y-2">
              <FormLabel>
                Khối lớp <RequiredField />
              </FormLabel>
              <Popover
                open={gradeComboboxOpen}
                onOpenChange={setGradeComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    role="combobox"
                    aria-expanded={gradeComboboxOpen}
                    className={cn(
                      "w-full justify-between",
                      !selectedGrade && "text-muted-foreground"
                    )}
                  >
                    {selectedGrade
                      ? GRADES.find((grade) => grade.value === selectedGrade)
                          ?.label
                      : "Chọn khối lớp"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm khối lớp..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy khối lớp.</CommandEmpty>
                      <CommandGroup>
                        {GRADES.map((grade) => (
                          <CommandItem
                            key={grade.value}
                            value={grade.label}
                            onSelect={() => {
                              handleGradeChange(grade.value);
                              setGradeComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedGrade === grade.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {grade.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

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
                          disabled={!selectedGrade}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            <>
                              {
                                filteredTopics.find(
                                  (topic) => topic.id === field.value
                                )?.title
                              }
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
                            {filteredTopics.map((topic) => (
                              <CommandItem
                                key={topic.id}
                                value={topic.title}
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
                                {topic.title}
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Term */}
            <FormField
              control={formControl}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Từ vựng <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập từ vựng" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phonetic */}
            <FormField
              control={formControl}
              name="phonetic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phiên âm <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ví dụ: /həˈloʊ/" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Meaning Vietnamese */}
          <FormField
            control={formControl}
            name="meaningVi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nghĩa tiếng Việt <RequiredField />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập nghĩa tiếng Việt" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Example English */}
          <FormField
            control={formControl}
            name="exampleEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ví dụ tiếng Anh</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Nhập câu ví dụ tiếng Anh"
                    rows={2}
                  />
                </FormControl>
                <FormDescription>
                  Câu ví dụ sử dụng từ vựng trong ngữ cảnh
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Example Vietnamese */}
          <FormField
            control={formControl}
            name="exampleVi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nghĩa ví dụ tiếng Việt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Nhập nghĩa ví dụ tiếng Việt"
                    rows={2}
                  />
                </FormControl>
                <FormDescription>
                  Dịch nghĩa của câu ví dụ tiếng Anh
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Image URL */}
          <FormField
            control={formControl}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hình ảnh minh họa</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} placeholder="URL hình ảnh" />
                    <CldUploadWidget
                      uploadPreset={UPLOAD_PRESET}
                      onSuccess={handleImageUpload}
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
                  Hình ảnh giúp học viên dễ nhớ từ vựng hơn
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
                <FormLabel>File âm thanh phát âm</FormLabel>
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
                  File âm thanh phát âm chuẩn của từ vựng
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

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
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Trạng thái <RequiredField />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(flashcardStatusLabels).map(
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
