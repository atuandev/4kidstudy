"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Edit2, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

import { createManyExercises, getExerciseByLessonId, updateExercise, deleteExercise } from "@/actions/exercise";
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
import { useExerciseFormStore } from "@/lib/stores/exercise-form-store";

export default function ExerciseFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseForms, setExerciseForms] = useState<CreateExerciseFormData[]>(
    []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [existingExercisesCount, setExistingExercisesCount] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const router = useRouter();
  const { selectedLessonId: storeLessonId, clearSelection } = useExerciseFormStore();
  const hasInitializedFromLesson = useRef(false);

  const form = useForm<CreateExerciseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedLessons = await getLessons();
        setAvailableLessons(fetchedLessons);

        // Load existing exercises if lesson is selected
        if (storeLessonId) {
          const existingExercises = await getExerciseByLessonId(storeLessonId);
          
          if (existingExercises && existingExercises.length > 0) {
            setExistingExercisesCount(existingExercises.length);
            
            // Convert existing exercises to form format
            const convertedExercises = existingExercises.map((ex) => ({
              id: ex.id,
              lessonId: ex.lessonId,
              type: ex.type,
              prompt: ex.prompt,
              imageUrl: ex.imageUrl || "",
              audioUrl: ex.audioUrl || "",
              targetText: ex.targetText || "",
              hintEn: ex.hintEn || "",
              hintVi: ex.hintVi || "",
              points: ex.points,
              difficulty: ex.difficulty || 1,
              options: ex.options?.map((opt) => ({
                id: opt.id,
                text: opt.text,
                imageUrl: opt.imageUrl || "",
                audioUrl: opt.audioUrl || "",
                isCorrect: opt.isCorrect,
                order: opt.order,
                matchKey: opt.matchKey || "",
              })) || [],
            })) as CreateExerciseFormData[];
            
            setExerciseForms(convertedExercises);
            toast.success(`Đã tải ${existingExercises.length} câu hỏi có sẵn`);
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
  }, [storeLessonId]);

  useEffect(() => {
    if (
      storeLessonId &&
      !hasInitializedFromLesson.current &&
      availableLessons.length > 0 &&
      !isLoading
    ) {
      const lesson = availableLessons.find((l) => l.id === storeLessonId);

      if (lesson) {
        hasInitializedFromLesson.current = true;
        form.setValue("lessonId", lesson.id);
        toast.success(`Đã chọn bài luyện tập: ${lesson.title}`);
      }
    }
  }, [storeLessonId, availableLessons, isLoading, form]);

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

    // Check for duplicate options
    if (values.options && values.options.length > 0) {
      const optionIdentifiers = values.options
        .map((opt) => {
          if (values.type === "SELECT_IMAGE") {
            return opt.imageUrl?.trim();
          }
          return opt.text?.trim();
        })
        .filter((identifier) => identifier && identifier.length > 0);

      const uniqueIdentifiers = new Set(optionIdentifiers);

      if (optionIdentifiers.length !== uniqueIdentifiers.size) {
        toast.error("Các đáp án không được trùng nhau");
        return false;
      }
    }

    if (values.type === "MATCHING" && values.options && values.options.length > 0) {
      const matchKeyCounts = values.options.reduce<Map<string, number>>(
        (counts, option) => {
          const key = option.matchKey?.trim();
          if (!key) {
            return counts;
          }
          const currentCount = counts.get(key) ?? 0;
          counts.set(key, currentCount + 1);
          return counts;
        },
        new Map<string, number>()
      );

      const invalidMatchKey = Array.from(matchKeyCounts.entries()).find(
        ([, count]) => count < 2
      );

      if (invalidMatchKey) {
        toast.error(`Match Key "${invalidMatchKey[0]}" cần hai đáp án`);
        return false;
      }

      const excessiveMatchKey = Array.from(matchKeyCounts.entries()).find(
        ([, count]) => count > 2
      );

      if (excessiveMatchKey) {
        toast.error(`Match Key "${excessiveMatchKey[0]}" chỉ được tối đa hai đáp án`);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const toggleCardExpanded = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleDeleteExercise = async (index: number) => {
    const exercise = exerciseForms[index];
    
    // If exercise has an id, it's an existing exercise - need to delete from backend
    if (exercise.id) {
      try {
        await deleteExercise(exercise.id);
        toast.success("Đã xóa câu hỏi khỏi hệ thống");
        setExistingExercisesCount(prev => prev - 1);
      } catch {
        toast.error("Không thể xóa câu hỏi");
        return;
      }
    }
    
    // Remove from local array
    const updatedExercises = exerciseForms.filter((_, i) => i !== index);
    setExerciseForms(updatedExercises);

    if (editingIndex === index) {
      setEditingIndex(null);

      if (updatedExercises.length > 0) {
        const lastExercise = updatedExercises[updatedExercises.length - 1];
        form.reset({
          lessonId: lastExercise.lessonId,
          type: lastExercise.type,
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
      } else {
        form.reset({
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
        });
      }
    }
    toast.success("Đã xóa câu hỏi");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);

    if (exerciseForms.length > 0) {
      const lastExercise = exerciseForms[exerciseForms.length - 1];
      form.reset({
        lessonId: lastExercise.lessonId,
        type: lastExercise.type,
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
    } else {
      form.reset({
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
      });
    }
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
      // Separate existing exercises (with id) from new exercises (without id)
      const existingExercises = exerciseForms.filter(ex => ex.id);
      const newExercises = exerciseForms.filter(ex => !ex.id);
      
      let updatedCount = 0;
      let createdCount = 0;
      
      // Update existing exercises
      if (existingExercises.length > 0) {
        const updatePromises = existingExercises.map(async (exercise) => {
          const { id, ...updateData } = exercise;
          return updateExercise(id!, updateData);
        });
        
        const updateResults = await Promise.all(updatePromises);
        updatedCount = updateResults.filter(result => result.status === 200).length;
        
        if (updatedCount < existingExercises.length) {
          toast.warning(`Chỉ cập nhật được ${updatedCount}/${existingExercises.length} câu hỏi`);
        }
      }
      
      // Create new exercises
      if (newExercises.length > 0) {
        const { payload, status } = await createManyExercises(newExercises);

        if ((status !== 201 && status !== 200) || !payload) {
          toast.error("Tạo hàng loạt câu hỏi thất bại");
          return;
        }
        
        createdCount = payload.length;
      }
      
      // Show success message
      const messages = [];
      if (updatedCount > 0) messages.push(`Cập nhật ${updatedCount} câu`);
      if (createdCount > 0) messages.push(`Tạo mới ${createdCount} câu`);
      
      toast.success(messages.join(" và "));
      setExerciseForms([]);
      setExistingExercisesCount(0);
      clearSelection();
      router.push("/admin/exercises");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to save exercises:", error);
      const errorMessage = error?.payload?.message;

      if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else {
        toast.error("Lưu câu hỏi thất bại");
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
        clearSelection();
        router.back();
      }
    } else {
      clearSelection();
      router.back();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOptionImageUpload = (result: any, index: number) => {
    if (result?.info?.secure_url) {
      form.setValue(`options.${index}.imageUrl`, result.info.secure_url);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <TypographyH4>Câu hỏi đã thêm</TypographyH4>
                <p className="text-sm text-muted-foreground">
                  {exerciseForms.length} câu hỏi đang chờ lưu
                  {existingExercisesCount > 0 && ` (${existingExercisesCount} câu đã có sẵn)`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {exerciseForms.map((exercise, index) => {
                const isExpanded = expandedCards.has(index);
                const isExisting = !!exercise.id;
                
                return (
                  <Card 
                    key={index}
                    className={`${
                      editingIndex === index
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : isExisting ? "border-green-300" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Header - Always visible */}
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer" 
                          onClick={() => toggleCardExpanded(index)}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            {isExisting && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                Đã lưu
                              </Badge>
                            )}
                            <span className="font-medium line-clamp-1">
                              {exercise.prompt || "Không có prompt"}
                            </span>
                            {editingIndex === index && (
                              <Badge variant="default" className="ml-2">
                                Đang chỉnh sửa
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{exerciseTypeLabels[exercise.type]}</span>
                            <span>•</span>
                            <span>{exercise.options?.length || 0} đáp án</span>
                            <span>•</span>
                            <span>{exercise.points} điểm</span>
                            <span>•</span>
                            <span>Độ khó: {exercise.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardExpanded(index)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {exercise.imageUrl && (
                            <div>
                              <p className="text-sm font-medium mb-1">Hình ảnh câu hỏi:</p>
                              <img 
                                src={exercise.imageUrl} 
                                alt="Exercise" 
                                className="w-32 h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                          
                          {exercise.audioUrl && (
                            <div>
                              <p className="text-sm font-medium mb-1">Âm thanh:</p>
                              <audio controls className="w-full max-w-md">
                                <source src={exercise.audioUrl} type="audio/mpeg" />
                              </audio>
                            </div>
                          )}
                          
                          {exercise.targetText && (
                            <div>
                              <p className="text-sm font-medium">Văn bản cần đọc:</p>
                              <p className="text-sm text-muted-foreground">{exercise.targetText}</p>
                            </div>
                          )}
                          
                          {exercise.hintEn && (
                            <div>
                              <p className="text-sm font-medium">Gợi ý (EN):</p>
                              <p className="text-sm text-muted-foreground">{exercise.hintEn}</p>
                            </div>
                          )}
                          
                          {exercise.hintVi && (
                            <div>
                              <p className="text-sm font-medium">Gợi ý (VI):</p>
                              <p className="text-sm text-muted-foreground">{exercise.hintVi}</p>
                            </div>
                          )}
                          
                          {exercise.options && exercise.options.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Đáp án:</p>
                              <div className="space-y-2">
                                {exercise.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex}
                                    className={`p-2 rounded border ${
                                      option.isCorrect 
                                        ? "bg-green-50 border-green-300" 
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <Badge variant={option.isCorrect ? "default" : "secondary"} className="shrink-0">
                                        {optIndex + 1}
                                      </Badge>
                                      <div className="flex-1 space-y-1">
                                        {option.text && (
                                          <p className="text-sm">{option.text}</p>
                                        )}
                                        {option.imageUrl && (
                                          <img 
                                            src={option.imageUrl} 
                                            alt={`Option ${optIndex + 1}`} 
                                            className="w-20 h-20 object-cover rounded"
                                          />
                                        )}
                                        {option.matchKey && (
                                          <p className="text-xs text-muted-foreground">
                                            Match Key: {option.matchKey}
                                          </p>
                                        )}
                                        {option.isCorrect && (
                                          <Badge variant="default" className="text-xs">
                                            ✓ Đáp án đúng
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
                            key={`lesson-${field.value || "empty"}`}
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
                        <FormLabel>
                          Câu hỏi <RequiredField />
                        </FormLabel>
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

                  {/* Hint English */}
                  <FormField
                    control={formControl}
                    name="hintEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đáp án (Tiếng Anh)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nhập đáp án bằng tiếng Anh"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Hint Vietnamese */}
                  <FormField
                    control={formControl}
                    name="hintVi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đáp án (Tiếng Việt)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nhập đáp án bằng tiếng Việt"
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
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value || "0");
                                const clamped = Math.max(
                                  1,
                                  Math.min(100, isNaN(parsed) ? 1 : parsed)
                                );
                                field.onChange(clamped);
                              }}
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
