"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

import {
  createExercise,
  getExercise,
  updateExercise,
} from "@/actions/exercise";
import { getLessons } from "@/actions/lesson";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3 } from "@/components/typography";
import {
  CreateExerciseFormData,
  CreateExerciseSchema,
  exerciseTypeLabels,
} from "@/schemas/exercise";
import { Lesson } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ExerciseFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const exerciseId = searchParams.get("id");
  const isEditMode = !!exerciseId;

  const form = useForm<CreateExerciseFormData>({
    resolver: zodResolver(CreateExerciseSchema) as any,
    defaultValues: {
      lessonId: 0,
      type: "MULTIPLE_CHOICE",
      order: 0,
      prompt: "",
      imageUrl: "",
      audioUrl: "",
      targetText: "",
      hintEn: "",
      hintVi: "",
      points: 10,
      difficulty: 1,
      options: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const exerciseType = form.watch("type");

  // Type-safe control for FormField components
  const formControl = form.control as any;

  // Fetch lessons and exercise data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedLessons = await getLessons();
        setAvailableLessons(fetchedLessons);

        if (isEditMode) {
          const exercise = await getExercise(parseInt(exerciseId));
          form.reset({
            lessonId: exercise.lessonId,
            type: exercise.type,
            order: exercise.order,
            prompt: exercise.prompt,
            imageUrl: exercise.imageUrl || "",
            audioUrl: exercise.audioUrl || "",
            targetText: exercise.targetText || "",
            hintEn: exercise.hintEn || "",
            hintVi: exercise.hintVi || "",
            points: exercise.points,
            difficulty: exercise.difficulty,
            options: exercise.options || [],
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
  }, [exerciseId, isEditMode]);

  const onSubmit = async (data: CreateExerciseFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updatedExercise = await updateExercise(
          parseInt(exerciseId),
          data
        );
        if (updatedExercise) {
          toast.success("Cập nhật câu hỏi thành công");
        } else {
          toast.error("Cập nhật câu hỏi thất bại");
        }
      } else {
        const createdExercise = await createExercise(data);
        if (createdExercise) {
          toast.success("Tạo câu hỏi thành công");
        } else {
          toast.error("Tạo câu hỏi thất bại");
        }
      }
      router.push("/admin/exercises");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to save exercise:", error);

      // Handle specific error messages from backend
      const errorMessage = error?.payload?.message;

      if (typeof errorMessage === "string") {
        // Check for order conflict error
        if (
          errorMessage.includes("option with order") &&
          errorMessage.includes("already exists")
        ) {
          toast.error("Thứ tự đáp án đã tồn tại. Vui lòng chọn thứ tự khác.");
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
          isEditMode ? "Cập nhật câu hỏi thất bại" : "Tạo câu hỏi thất bại"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue("imageUrl", result.info.secure_url);
    }
  };

  const handleAudioUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue("audioUrl", result.info.secure_url);
    }
  };

  const handleOptionImageUpload = (result: any, index: number) => {
    if (result?.info?.secure_url) {
      form.setValue(`options.${index}.imageUrl`, result.info.secure_url);
    }
  };

  const handleOptionAudioUpload = (result: any, index: number) => {
    if (result?.info?.secure_url) {
      form.setValue(`options.${index}.audioUrl`, result.info.secure_url);
    }
  };

  const addOption = () => {
    append({
      text: "",
      imageUrl: "",
      audioUrl: "",
      isCorrect: false,
      order: fields.length,
      matchKey: "",
    });
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
              <BreadcrumbLink href="/admin/exercises">Câu hỏi</BreadcrumbLink>
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
        {isEditMode ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
      </TypographyH3>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-6"
        >
          {/* Lesson Selection */}
          <FormField
            control={formControl}
            name="lessonId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  ID bài luyện tập <RequiredField />
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ID bài luyện tập" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableLessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Exercise Type */}
          <FormField
            control={formControl}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Loại câu hỏi <RequiredField />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại câu hỏi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(exerciseTypeLabels).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {exerciseType === "SELECT_IMAGE" &&
                    "Học viên sẽ chọn hình ảnh đúng với câu hỏi"}
                  {exerciseType === "MULTIPLE_CHOICE" &&
                    "Học viên sẽ chọn câu trả lời đúng"}
                  {exerciseType === "MATCHING" &&
                    "Học viên sẽ nối các cặp với nhau"}
                  {exerciseType === "LISTENING" &&
                    "Học viên sẽ nghe và chọn đáp án"}
                  {exerciseType === "PRONUNCIATION" &&
                    "Học viên sẽ phát âm và được AI đánh giá"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prompt */}
          <FormField
            control={formControl}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Câu hỏi</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập câu hỏi hoặc hướng dẫn" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Text - Only for PRONUNCIATION */}
          {exerciseType === "PRONUNCIATION" && (
            <>
              <FormField
                control={formControl}
                name="targetText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Văn bản cần đọc <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập văn bản học viên cần phát âm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formControl}
                name="audioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      File âm thanh <RequiredField />
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="URL âm thanh" />
                        <CldUploadWidget
                          uploadPreset="dz1x6r3cl"
                          onSuccess={handleAudioUpload}
                        >
                          {({ open }) => (
                            <Button size="icon" onClick={() => open()}>
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
            </>
          )}

          {/* Main Image URL */}
          {exerciseType === "MULTIPLE_CHOICE" && (
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
                        uploadPreset="dz1x6r3cl"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Audio URL - Required for LISTENING */}
          {exerciseType === "LISTENING" && (
            <FormField
              control={formControl}
              name="audioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    File âm thanh <RequiredField />
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} placeholder="URL âm thanh" />
                      <CldUploadWidget
                        uploadPreset="dz1x6r3cl"
                        onSuccess={handleAudioUpload}
                      >
                        {({ open }) => (
                          <Button size="icon" onClick={() => open()}>
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
          )}

          {/* Points and Difficulty */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={formControl}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thứ tự câu hỏi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formControl}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điểm</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="100"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formControl}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ khó</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn độ khó" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Dễ (1)</SelectItem>
                      <SelectItem value="2">Trung bình (2)</SelectItem>
                      <SelectItem value="3">Khó (3)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Exercise Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <TypographyH3>Đáp án</TypographyH3>
                <p className="text-sm text-muted-foreground">
                  {exerciseType === "SELECT_IMAGE" &&
                    "Thêm các hình ảnh để học viên lựa chọn"}
                  {exerciseType === "MULTIPLE_CHOICE" &&
                    "Thêm các đáp án văn bản cho câu hỏi trắc nghiệm"}
                  {exerciseType === "MATCHING" &&
                    "Thêm các cặp nội dung cần ghép nối"}
                  {exerciseType === "LISTENING" &&
                    "Thêm các đáp án cho bài nghe"}
                  {exerciseType === "PRONUNCIATION" &&
                    "Không cần thêm đáp án - AI sẽ đánh giá phát âm"}
                </p>
              </div>
              {exerciseType !== "PRONUNCIATION" && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm đáp án
                </Button>
              )}
            </div>

            {/* Display options validation errors */}
            {form.formState.errors.options?.message && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.options.message}
              </p>
            )}

            {/* Render option fields based on exercise type */}
            {exerciseType === "SELECT_IMAGE" &&
              fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          Đáp án {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={formControl}
                        name={`options.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Hình ảnh <RequiredField />
                            </FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input {...field} placeholder="URL hình ảnh" />
                                <CldUploadWidget
                                  uploadPreset="dz1x6r3cl"
                                  onSuccess={(result) =>
                                    handleOptionImageUpload(result, index)
                                  }
                                >
                                  {({ open }) => (
                                    <Button size="icon" onClick={() => open()}>
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

                      <FormField
                        control={formControl}
                        name={`options.${index}.isCorrect`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Đáp án đúng
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

            {exerciseType === "MULTIPLE_CHOICE" &&
              fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Đáp án {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={formControl}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nội dung <RequiredField />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nội dung đáp án" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={formControl}
                        name={`options.${index}.isCorrect`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Đáp án đúng
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

            {exerciseType === "MATCHING" &&
              fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Mục {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={formControl}
                        name={`options.${index}.matchKey`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Khóa ghép nối <RequiredField />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ví dụ: pair_1" />
                            </FormControl>
                            <FormDescription>
                              Các mục có cùng matchKey sẽ được ghép với nhau
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={formControl}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Văn bản</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nội dung văn bản"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={formControl}
                        name={`options.${index}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hình ảnh</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input {...field} placeholder="URL hình ảnh" />
                                <CldUploadWidget
                                  uploadPreset="dz1x6r3cl"
                                  onSuccess={(result) =>
                                    handleOptionImageUpload(result, index)
                                  }
                                >
                                  {({ open }) => (
                                    <Button size="icon" onClick={() => open()}>
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
                    </div>
                  </CardContent>
                </Card>
              ))}

            {exerciseType === "LISTENING" &&
              fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Đáp án {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={formControl}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nội dung <RequiredField />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nội dung đáp án" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={formControl}
                        name={`options.${index}.isCorrect`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Đáp án đúng
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

            {exerciseType === "PRONUNCIATION" && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Bài tập phát âm không cần đáp án. Học viên sẽ đọc văn bản và
                  được đánh giá bằng AI.
                </p>
              </div>
            )}
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
