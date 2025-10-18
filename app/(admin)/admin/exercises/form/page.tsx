"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
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

import { createManyExercises } from "@/actions/exercise";
import { getLessons } from "@/actions/lesson";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3, TypographyH4 } from "@/components/typography";
import {
  CreateExerciseFormData,
  CreateExerciseSchema,
  exerciseTypeLabels,
} from "@/schemas/exercise";
import { Lesson } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UPLOAD_PRESET } from "@/lib/constants";

export default function ExerciseFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseForms, setExerciseForms] = useState<CreateExerciseFormData[]>(
    []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const router = useRouter();

  const form = useForm<CreateExerciseFormData>({
    resolver: zodResolver(CreateExerciseSchema) as any,
    defaultValues: {
      lessonId: 0,
      type: "MULTIPLE_CHOICE",
      prompt: "",
      imageUrl: "",
      audioUrl: "",
      targetText: "",
      hintEn: "",
      hintVi: "",
      points: 10,
      difficulty: 1,
      options: [
        {
          text: "",
          imageUrl: "",
          audioUrl: "",
          isCorrect: false,
          order: 0,
          matchKey: "",
        },
        {
          text: "",
          imageUrl: "",
          audioUrl: "",
          isCorrect: false,
          order: 1,
          matchKey: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const exerciseType = form.watch("type");
  const formControl = form.control as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedLessons = await getLessons();
        setAvailableLessons(fetchedLessons);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateExercise = (values: CreateExerciseFormData) => {
    if (
      ["MULTIPLE_CHOICE", "SELECT_IMAGE", "LISTENING"].includes(values.type)
    ) {
      const correctAnswersCount =
        values.options?.filter((opt) => opt.isCorrect).length ?? 0;

      if (correctAnswersCount === 0) {
        toast.error("Vui lòng chọn một đáp án đúng");
        return false;
      }

      if (correctAnswersCount > 1) {
        toast.error("Chỉ được chọn một đáp án đúng");
        return false;
      }
    }
    return true;
  };

  const handleAddExerciseForm = async () => {
    const values = form.getValues();

    if (!validateExercise(values)) {
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const { order, ...createData } = values;

    if (editingIndex !== null) {
      // Update existing exercise
      setExerciseForms((prev) =>
        prev.map((ex, idx) =>
          idx === editingIndex ? (createData as CreateExerciseFormData) : ex
        )
      );
      toast.success("Đã cập nhật câu hỏi");
      setEditingIndex(null);
    } else {
      // Add new exercise
      setExerciseForms((prev) => [
        ...prev,
        createData as CreateExerciseFormData,
      ]);
      toast.success(
        `Đã thêm câu hỏi ${exerciseForms.length + 1}. Tiếp tục tạo câu hỏi mới.`
      );
    }

    const currentLessonId = form.getValues("lessonId");
    const currentType = form.getValues("type");

    form.reset({
      lessonId: currentLessonId,
      type: currentType,
      prompt: "",
      imageUrl: "",
      audioUrl: "",
      targetText: "",
      hintEn: "",
      hintVi: "",
      points: 10,
      difficulty: 1,
      options: [
        {
          text: "",
          imageUrl: "",
          audioUrl: "",
          isCorrect: false,
          order: 0,
          matchKey: "",
        },
        {
          text: "",
          imageUrl: "",
          audioUrl: "",
          isCorrect: false,
          order: 1,
          matchKey: "",
        },
      ],
    });
  };

  const handleEditExercise = (index: number) => {
    const exercise = exerciseForms[index];
    form.reset(exercise);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteExercise = (index: number) => {
    setExerciseForms((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      const currentLessonId = form.getValues("lessonId");
      const currentType = form.getValues("type");
      form.reset({
        lessonId: currentLessonId,
        type: currentType,
        prompt: "",
        imageUrl: "",
        audioUrl: "",
        targetText: "",
        hintEn: "",
        hintVi: "",
        points: 10,
        difficulty: 1,
        options: [
          {
            text: "",
            imageUrl: "",
            audioUrl: "",
            isCorrect: false,
            order: 0,
            matchKey: "",
          },
          {
            text: "",
            imageUrl: "",
            audioUrl: "",
            isCorrect: false,
            order: 1,
            matchKey: "",
          },
        ],
      });
    }
    toast.success("Đã xóa câu hỏi");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    const currentLessonId = form.getValues("lessonId");
    const currentType = form.getValues("type");
    form.reset({
      lessonId: currentLessonId,
      type: currentType,
      prompt: "",
      imageUrl: "",
      audioUrl: "",
      targetText: "",
      hintEn: "",
      hintVi: "",
      points: 10,
      difficulty: 1,
      options: [
        {
          text: "",
          imageUrl: "",
          audioUrl: "",
          isCorrect: false,
          order: 0,
          matchKey: "",
        },
        {
          text: "",
          imageUrl: "",
          audioUrl: "",
          isCorrect: false,
          order: 1,
          matchKey: "",
        },
      ],
    });
  };

  const handleSaveAll = async () => {
    if (exerciseForms.length === 0) {
      toast.error("Không có câu hỏi nào để lưu");
      return;
    }

    if (editingIndex !== null) {
      toast.error("Vui lòng hoàn thành chỉnh sửa câu hỏi hiện tại");
      return;
    }

    setIsSubmitting(true);
    try {
      const { payload, status } = await createManyExercises(exerciseForms);

      if ((status !== 201 && status !== 200) || !payload) {
        toast.error("Tạo hàng loạt câu hỏi thất bại");
        return;
      }

      toast.success(`Đã tạo thành công ${payload.length} câu hỏi`);
      setExerciseForms([]);
      router.push("/admin/exercises");
    } catch (error: any) {
      console.error("Failed to create many exercises:", error);
      const errorMessage = error?.payload?.message;

      if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else {
        toast.error("Tạo hàng loạt câu hỏi thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (exerciseForms.length > 0) {
      if (
        confirm(
          `Bạn có ${exerciseForms.length} câu hỏi chưa lưu. Bạn có chắc muốn hủy?`
        )
      ) {
        setExerciseForms([]);
        router.back();
      }
    } else {
      router.back();
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 px-4">
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
              <BreadcrumbPage>Thêm mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <TypographyH3>Thêm câu hỏi mới</TypographyH3>
      </div>

      {/* Display saved exercises */}
      {exerciseForms.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <TypographyH4>Câu hỏi đã thêm</TypographyH4>
                <p className="text-sm text-muted-foreground">
                  {exerciseForms.length} câu hỏi đang chờ lưu
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {exerciseForms.map((exercise, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                    editingIndex === index
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <span className="font-medium">
                        {exercise.prompt || "Không có prompt"}
                      </span>
                      {editingIndex === index && (
                        <Badge variant="default" className="ml-2">
                          Đang chỉnh sửa
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exerciseTypeLabels[exercise.type]} •{" "}
                      {exercise.options?.length || 0} đáp án
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExercise(index)}
                      disabled={editingIndex === index}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExercise(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <TypographyH3>
                  {editingIndex !== null
                    ? `Chỉnh sửa câu hỏi #${editingIndex + 1}`
                    : `Câu hỏi ${exerciseForms.length + 1}`}
                </TypographyH3>
                {editingIndex !== null && (
                  <Button
                    type="button"
                    variant="super"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Hủy chỉnh sửa
                  </Button>
                )}
              </div>
              <Card>
                <CardContent className="space-y-4">
                  {/* Lesson Selection */}
                  <FormField
                    control={formControl}
                    name="lessonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Bài luyện tập <RequiredField />
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            options={availableLessons.map((lesson) => ({
                              value: lesson.id.toString(),
                              label: `${lesson.id} - ${lesson.title}`,
                            }))}
                            value={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            placeholder="Chọn bài luyện tập"
                            searchPlaceholder="Tìm kiếm bài luyện tập..."
                            emptyText="Không tìm thấy bài luyện tập."
                            className="w-fit"
                          />
                        </FormControl>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                          <Input
                            {...field}
                            placeholder="Nhập câu hỏi hoặc hướng dẫn"
                          />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Points and Difficulty */}
                  <div className="grid gap-4 md:grid-cols-2">
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
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
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
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
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
                </CardContent>
              </Card>
            </div>

            <div>
              {/* Exercise Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <TypographyH3>Đáp án</TypographyH3>
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
                              type="button"
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
                                    <Input
                                      {...field}
                                      placeholder="URL hình ảnh"
                                    />
                                    <CldUploadWidget
                                      uploadPreset={UPLOAD_PRESET}
                                      onSuccess={(result) =>
                                        handleOptionImageUpload(result, index)
                                      }
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

                          <FormField
                            control={formControl}
                            name={`options.${index}.isCorrect`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        fields.forEach((_, i) => {
                                          if (i !== index) {
                                            form.setValue(
                                              `options.${i}.isCorrect`,
                                              false
                                            );
                                          }
                                        });
                                      }
                                      field.onChange(checked);
                                    }}
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
                            <Badge variant="secondary">
                              Đáp án {index + 1}
                            </Badge>
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
                                  <Input
                                    {...field}
                                    placeholder="Nội dung đáp án"
                                  />
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
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        fields.forEach((_, i) => {
                                          if (i !== index) {
                                            form.setValue(
                                              `options.${i}.isCorrect`,
                                              false
                                            );
                                          }
                                        });
                                      }
                                      field.onChange(checked);
                                    }}
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
                                  <Input
                                    {...field}
                                    placeholder="Ví dụ: pair_1"
                                  />
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
                                    <Input
                                      {...field}
                                      placeholder="URL hình ảnh"
                                    />
                                    <CldUploadWidget
                                      uploadPreset={UPLOAD_PRESET}
                                      onSuccess={(result) =>
                                        handleOptionImageUpload(result, index)
                                      }
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
                            <Badge variant="secondary">
                              Đáp án {index + 1}
                            </Badge>
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
                                  <Input
                                    {...field}
                                    placeholder="Nội dung đáp án"
                                  />
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
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        fields.forEach((_, i) => {
                                          if (i !== index) {
                                            form.setValue(
                                              `options.${i}.isCorrect`,
                                              false
                                            );
                                          }
                                        });
                                      }
                                      field.onChange(checked);
                                    }}
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
                      Bài tập phát âm không cần đáp án. Học viên sẽ đọc văn bản
                      và được đánh giá bằng AI.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="col-span-2"
              onClick={handleAddExerciseForm}
              disabled={isSubmitting}
            >
              <Plus className="mr-2 h-4 w-4" />
              {editingIndex !== null ? "Cập nhật câu hỏi" : "Thêm câu hỏi"}
            </Button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between gap-2 sticky bottom-0 bg-background pt-4 pb-2 border-t">
            <Button
              type="button"
              variant="default"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <div className="flex gap-2">
              {exerciseForms.length > 0 && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveAll}
                  disabled={isSubmitting || editingIndex !== null}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu tất cả ({exerciseForms.length})
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
