
"use client";



import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronDown, ChevronUp, Edit2, HelpCircle, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<FileList | null>(null);
  const [importPreview, setImportPreview] = useState<{
    neededFiles: string[];
    matchedFiles: string[];
  } | null>(null);
  const [exerciseErrors, setExerciseErrors] = useState<Map<number, string[]>>(new Map());
  const [isImporting, setIsImporting] = useState(false);
  const [showImportHelpDialog, setShowImportHelpDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedLessonId: storeLessonId, clearSelection } = useExerciseFormStore();
  const hasInitializedFromLesson = useRef(false);

  // Get lessonId from URL if available, otherwise use store
  const lessonIdParam = searchParams.get("lessonId");
  const lessonId = lessonIdParam ? parseInt(lessonIdParam) : storeLessonId;

  // Check if in import mode
  const importMode = searchParams.get("importMode");

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
        if (lessonId) {
          const existingExercises = await getExerciseByLessonId(lessonId);

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
  }, [lessonId]);

  useEffect(() => {
    if (
      lessonId &&
      !hasInitializedFromLesson.current &&
      availableLessons.length > 0 &&
      !isLoading
    ) {
      const lesson = availableLessons.find((l) => l.id === lessonId);

      if (lesson) {
        hasInitializedFromLesson.current = true;
        form.setValue("lessonId", lesson.id);
        toast.success(`Đã chọn bài luyện tập: ${lesson.title}`);

        // Update URL to preserve lessonId on refresh (if not already there)
        if (!lessonIdParam) {
          router.push(`/admin/exercises/form?lessonId=${lesson.id}`);
        }
      }
    }
  }, [lessonId, availableLessons, isLoading, form, lessonIdParam, router]);

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
      const updatedExercises = exerciseForms.map((ex, idx) =>
        idx === editingIndex ? (createData as CreateExerciseFormData) : ex
      );
      setExerciseForms(updatedExercises);

      // Re-validate after update
      const validationErrors = validateExercises(updatedExercises);
      setExerciseErrors(validationErrors);

      toast.success("Đã cập nhật câu hỏi");
      setEditingIndex(null);
    } else {
      // Add new exercise
      const newExercises = [...exerciseForms, createData as CreateExerciseFormData];
      setExerciseForms(newExercises);

      // Re-validate after add
      const validationErrors = validateExercises(newExercises);
      setExerciseErrors(validationErrors);

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

    // Re-validate after deletion
    const validationErrors = validateExercises(updatedExercises);
    setExerciseErrors(validationErrors);

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

  const handleImportExcel = () => {
    setShowImportDialog(true);
    setSelectedExcelFile(null);
    setSelectedFolderFiles(null);
    setImportPreview(null);
  };

  const handleExcelFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedExcelFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
        defval: '',
      });

      const neededFiles = new Set<string>();

      jsonData.forEach((row: Record<string, string>) => {
        const extractFilename = (path: string | undefined) => {
          if (!path || typeof path !== 'string') return null;
          const trimmed = path.trim();
          if (trimmed === '\\n' || trimmed === '\n' || !trimmed) return null;
          return trimmed.split('\\').pop()?.split('/').pop() || null;
        };

        // Scan for main exercise assets
        ['img', 'audio'].forEach((key) => {
          const filename = extractFilename(row[key]);
          if (filename) neededFiles.add(filename);
        });

        // Scan for SELECT_IMAGE options (optT, optF1-3 contain image paths)
        ['optT', 'optF1', 'optF2', 'optF3'].forEach((key) => {
          const filename = extractFilename(row[key]);
          if (filename) neededFiles.add(filename);
        });
      });

      setImportPreview({
        neededFiles: Array.from(neededFiles),
        matchedFiles: [],
      });
    } catch (error) {
      console.error('Failed to read Excel:', error);
      toast.error('Không thể đọc file Excel');
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setSelectedFolderFiles(files);

    if (files && importPreview) {
      const matchedFiles = Array.from(files)
        .map((f) => f.name)
        .filter((name) => importPreview.neededFiles.includes(name));

      setImportPreview({
        ...importPreview,
        matchedFiles,
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedExcelFile) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }

    const currentLessonId = lessonId;
    if (!currentLessonId) {
      toast.error('Vui lòng chọn bài luyện tập');
      return;
    }

    setIsImporting(true);

    try {
      // Step 1: Upload assets to Cloudinary first
      const assetMap = new Map<string, string>();

      if (selectedFolderFiles && importPreview) {
        const matchedFiles = Array.from(selectedFolderFiles).filter((f) =>
          importPreview.matchedFiles.includes(f.name)
        );

        if (matchedFiles.length > 0) {
          const uploadPromises: Promise<void>[] = [];

          matchedFiles.forEach((file) => {
            const uploadPromise = new Promise<void>((resolve) => {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('upload_preset', UPLOAD_PRESET);

              fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
                method: 'POST',
                body: formData,
              })
                .then(res => res.json())
                .then(data => {
                  if (data.secure_url) {
                    assetMap.set(file.name, data.secure_url);
                  }
                  resolve();
                })
                .catch(() => resolve());
            });

            uploadPromises.push(uploadPromise);
          });

          await Promise.all(uploadPromises);
          console.log('✅ Asset upload complete:', {
            uploaded: assetMap.size,
            total: uploadPromises.length,
            assetMapKeys: Array.from(assetMap.keys()),
            assetMapEntries: Array.from(assetMap.entries()),
          });
          toast.success(`✅ Đã upload ${assetMap.size}/${uploadPromises.length} file assets`);
        }
      }

      // Step 2: Parse Excel client-side with duplicate column renaming
      const arrayBuffer = await selectedExcelFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Parse with header array to handle duplicate column names
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      }) as unknown[][];

      if (!rawData || rawData.length < 2) {
        throw new Error('No data found in Excel file');
      }

      // Rename duplicate "optF" columns to optF1, optF2, optF3 (like backend)
      const headerRow = rawData[0] as string[];
      const columnCounts = new Map<string, number>();
      const renamedHeaders = headerRow.map((col) => {
        const colStr = String(col || '').trim();
        if (!colStr) return colStr;
        if (colStr === 'optF') {
          const count = columnCounts.get(colStr) || 0;
          columnCounts.set(colStr, count + 1);
          return `optF${count + 1}`;
        }
        return colStr;
      });

      // Convert to JSON with renamed headers
      const data: any[] = [];
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i] as unknown[];
        const obj: any = {};
        renamedHeaders.forEach((header, index) => {
          if (header) {
            obj[header] = row[index];
          }
        });
        data.push(obj);
      }

      // Helpers
      const normalizeValue = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined) return '';
        const str = String(val).trim();
        if (str === '\\n' || str === '\n') return '';
        return str;
      };

      const extractFileName = (path: string | undefined) => {
        if (!path) return null;
        const trimmed = path.trim();
        if (!trimmed || trimmed === "\\n" || trimmed === "\n") return null;
        return trimmed.split("\\").pop()?.split("/").pop() || null;
      };

      // Map asset filenames to URLs
      const mapAssetUrl = (filename: string | null): string => {
        if (!filename) return '';
        const url = assetMap.get(filename);
        if (url) return url;

        // Try case-insensitive
        for (const [key, value] of assetMap.entries()) {
          if (key.toLowerCase() === filename.toLowerCase()) {
            return value;
          }
        }
        return '';
      };

      // Parse exercises
      const parsedExercises: CreateExerciseFormData[] = data.map((row) => {
        const type = (normalizeValue(row.Type || row.type)) as CreateExerciseFormData['type'];
        const imgFileName = extractFileName(normalizeValue(row.img));
        const audioFileName = extractFileName(normalizeValue(row.audio));

        const exercise: CreateExerciseFormData = {
          lessonId: currentLessonId,
          type: type || 'MULTIPLE_CHOICE',
          prompt: normalizeValue(row.prompt),
          imageUrl: mapAssetUrl(imgFileName),
          audioUrl: mapAssetUrl(audioFileName),
          targetText: normalizeValue(row.targetText),
          hintEn: normalizeValue(row.hintEn),
          hintVi: normalizeValue(row.hintVi),
          points: parseInt(normalizeValue(row.points)) || 10,
          difficulty: parseInt(normalizeValue(row.difficulty)) || 1,
          options: [],
        };

        // Parse options based on exercise type (matching backend)
        if (type === 'SELECT_IMAGE') {
          const correctImg = mapAssetUrl(extractFileName(normalizeValue(row.optT)));
          const incorrectImgs = [
            mapAssetUrl(extractFileName(normalizeValue(row.optF1))),
            mapAssetUrl(extractFileName(normalizeValue(row.optF2))),
            mapAssetUrl(extractFileName(normalizeValue(row.optF3))),
          ];

          console.log('SELECT_IMAGE debug:', {
            optT: normalizeValue(row.optT),
            optF1: normalizeValue(row.optF1),
            optF2: normalizeValue(row.optF2),
            optF3: normalizeValue(row.optF3),
            correctImg,
            incorrectImgs,
          });

          if (correctImg) {
            exercise.options.push({ text: '', imageUrl: correctImg, audioUrl: '', isCorrect: true, order: 0, matchKey: '' });
          }
          incorrectImgs.forEach((imgUrl, idx) => {
            if (imgUrl) {
              console.log(`Adding incorrect option ${idx + 1}:`, imgUrl);
              exercise.options.push({ text: '', imageUrl: imgUrl, audioUrl: '', isCorrect: false, order: idx + 1, matchKey: '' });
            } else {
              console.warn(`optF${idx + 1} is empty, skipping`);
            }
          });
        } else if (type === 'MULTIPLE_CHOICE' || type === 'LISTENING') {
          const correctText = normalizeValue(row.optT);
          const incorrectTexts = [normalizeValue(row.optF1), normalizeValue(row.optF2), normalizeValue(row.optF3)];
          if (correctText) {
            exercise.options.push({ text: correctText, imageUrl: '', audioUrl: '', isCorrect: true, order: 0, matchKey: '' });
          }
          incorrectTexts.forEach((text, idx) => {
            if (text) exercise.options.push({ text: text, imageUrl: '', audioUrl: '', isCorrect: false, order: idx + 1, matchKey: '' });
          });
        } else if (type === 'MATCHING') {
          const pairs = [normalizeValue(row.optT), normalizeValue(row.optF1), normalizeValue(row.optF2), normalizeValue(row.optF3)];
          let optionOrder = 0;
          pairs.forEach((pairStr, pairIdx) => {
            if (pairStr && pairStr.includes('|')) {
              const [left, right] = pairStr.split('|').map(s => s.trim());
              const matchKey = `pair_${pairIdx + 1}`;
              const isImagePath = (val: string) => val.match(/\.(jpg|jpeg|png|gif|webp|mp3|mp4)$/i) !== null || val.includes('g1-') || val.includes('/');
              const leftIsImage = isImagePath(left);
              const rightIsImage = isImagePath(right);
              exercise.options.push({ text: leftIsImage ? '' : left, imageUrl: leftIsImage ? mapAssetUrl(extractFileName(left)) : '', audioUrl: '', isCorrect: false, order: optionOrder++, matchKey });
              exercise.options.push({ text: rightIsImage ? '' : right, imageUrl: rightIsImage ? mapAssetUrl(extractFileName(right)) : '', audioUrl: '', isCorrect: false, order: optionOrder++, matchKey });
            }
          });
        }

        return exercise;
      });

      // Add to state for PREVIEW
      const allExercises = [...exerciseForms, ...parsedExercises];
      setExerciseForms(allExercises);

      // Validate exercises
      const validationErrors = validateExercises(allExercises);
      setExerciseErrors(validationErrors);

      if (validationErrors.size > 0) {
        toast.warning(`⚠️ Đã load ${parsedExercises.length} câu hỏi nhưng có ${validationErrors.size} câu có lỗi. Vui lòng kiểm tra!`);
      } else {
        toast.success(`📋 Đã load ${parsedExercises.length} câu hỏi. Kiểm tra và bấm 'Lưu tất cả' để lưu!`);
      }

      // Close dialog
      setShowImportDialog(false);
      setSelectedExcelFile(null);
      setSelectedFolderFiles(null);
      setImportPreview(null);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Import thất bại");
    } finally {
      setIsImporting(false);
    }
  };

  // Validation function
  const validateExercises = (exercises: CreateExerciseFormData[]) => {
    const errors = new Map<number, string[]>();
    const seenPrompts = new Map<string, number>();

    exercises.forEach((exercise, idx) => {
      const exerciseErrors: string[] = [];

      // Required field: type
      if (!exercise.type) {
        exerciseErrors.push('Thiếu loại bài tập (type)');
      }

      // Required field: prompt (for most types)
      if (!exercise.prompt && !['FILL_BLANK', 'PRONUNCIATION'].includes(exercise.type)) {
        exerciseErrors.push('Thiếu câu hỏi (prompt)');
      }

      // Duplicate detection - check both prompt and options
      if (exercise.prompt) {
        // Create composite key: prompt + sorted options content
        const optionsKey = exercise.options
          .map(opt => {
            if (exercise.type === 'SELECT_IMAGE') {
              return opt.imageUrl || '';
            } else if (exercise.type === 'MATCHING') {
              return `${opt.text}:${opt.matchKey}`;
            } else {
              return opt.text || '';
            }
          })
          .sort()
          .join('|');

        const compositeKey = `${exercise.prompt.toLowerCase().trim()}::${optionsKey}`;

        if (seenPrompts.has(compositeKey)) {
          exerciseErrors.push(`Trùng với câu #${seenPrompts.get(compositeKey)! + 1}`);
        } else {
          seenPrompts.set(compositeKey, idx);
        }
      }

      // Option validation
      if (['MULTIPLE_CHOICE', 'SELECT_IMAGE', 'LISTENING'].includes(exercise.type)) {
        if (exercise.options.length === 0) {
          exerciseErrors.push('Thiếu đáp án');
        } else if (exercise.options.length < 2) {
          exerciseErrors.push('Cần ít nhất 2 đáp án');
        }

        const hasCorrect = exercise.options.some(opt => opt.isCorrect);
        if (!hasCorrect && exercise.options.length > 0) {
          exerciseErrors.push('Thiếu đáp án đúng (optT)');
        }
      }

      if (exercise.type === 'MATCHING') {
        if (exercise.options.length < 4) {
          exerciseErrors.push('MATCHING cần ít nhất 2 cặp (4 options)');
        }

        // Check each option has either text or imageUrl
        const emptyOptions = exercise.options.filter(
          (opt) => !opt.text?.trim() && !opt.imageUrl?.trim()
        );

        if (emptyOptions.length > 0) {
          exerciseErrors.push('Mỗi đáp án MATCHING phải có văn bản hoặc hình ảnh');
        }

        // Check for missing or incomplete matchKey pairs
        const matchKeyCounts = new Map<string, number>();
        let hasEmptyMatchKey = false;

        exercise.options.forEach((option) => {
          const key = option.matchKey?.trim();
          if (!key) {
            hasEmptyMatchKey = true;
          } else {
            matchKeyCounts.set(key, (matchKeyCounts.get(key) || 0) + 1);
          }
        });

        if (hasEmptyMatchKey) {
          exerciseErrors.push('Có option thiếu matchKey');
        }

        // Check if any matchKey has less than 2 options
        const incompletePairs = Array.from(matchKeyCounts.entries()).filter(
          ([, count]) => count < 2
        );

        if (incompletePairs.length > 0) {
          incompletePairs.forEach(([key]) => {
            exerciseErrors.push(`Cặp "${key}" thiếu đáp án (cần 2 đáp án)`);
          });
        }
      }

      if (exerciseErrors.length > 0) {
        errors.set(idx, exerciseErrors);
      }
    });

    return errors;
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
        <Button
          type="button"
          variant="secondaryOutline"
          onClick={handleImportExcel}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import từ Excel
        </Button>
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
                    className={`${editingIndex === index
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
                            {exerciseErrors.has(index) && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {exerciseErrors.get(index)!.length} lỗi
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
                                    className={`p-2 rounded border ${option.isCorrect
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

              {/* ERROR ALERTS when editing */}
              {editingIndex !== null && exerciseErrors.has(editingIndex) && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Lỗi validation:</p>
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                        {exerciseErrors.get(editingIndex)!.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

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

      {/* Import Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between">
              <span>Import câu hỏi từ Excel</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowImportHelpDialog(true)}
                className="h-8 w-8 p-0"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Chọn file Excel và thư mục chứa hình ảnh/âm thanh để import.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* Excel File Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Chọn file Excel <RequiredField />
              </label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelFileSelect}
                disabled={isImporting}
              />
              {selectedExcelFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Đã chọn: {selectedExcelFile.name}
                </p>
              )}
            </div>

            {/* Folder Input */}
            {importPreview && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chọn thư mục chứa assets (tùy chọn)
                </label>
                <Input
                  type="file"
                  // @ts-expect-error webkitdirectory attribute
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  disabled={isImporting}
                />
                {selectedFolderFiles && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Đã chọn {selectedFolderFiles.length} files
                  </p>
                )}
              </div>
            )}

            {/* Preview */}
            {importPreview && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Tổng quan Import</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Files cần thiết từ Excel:</span>
                    <Badge variant="secondary">
                      {importPreview.neededFiles.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Files đã khớp trong thư mục:</span>
                    <Badge
                      variant={
                        importPreview.matchedFiles.length ===
                          importPreview.neededFiles.length
                          ? "default"
                          : "outline"
                      }
                    >
                      {importPreview.matchedFiles.length}
                    </Badge>
                  </div>
                  {importPreview.matchedFiles.length < importPreview.neededFiles.length && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Một số files chưa được tìm thấy. Các trường tương ứng sẽ để trống.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              disabled={!selectedExcelFile || isImporting}
            >
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bắt đầu Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Help Dialog */}
      <Dialog open={showImportHelpDialog} onOpenChange={setShowImportHelpDialog}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          style={{ maxWidth: '1400px', width: '90vw' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Hướng dẫn Import Excel - Bài tập
            </DialogTitle>
            <DialogDescription>
              Hướng dẫn chi tiết cách chuẩn bị và import file Excel bài tập (exercises)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section 1: Excel Format */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">1. Định dạng file Excel</h3>
              <p className="text-sm text-muted-foreground">
                File Excel cần có các cột theo thứ tự sau:
              </p>

              {/* Example Table */}
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">type</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">prompt</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">img</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">audio</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">targetText</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">hintEn</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">hintVi</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">optT</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">optF1</th>
                      <th className="border-r p-2 font-medium text-left whitespace-nowrap">optF2</th>
                      <th className="p-2 font-medium text-left whitespace-nowrap">optF3</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="border-r p-2 whitespace-nowrap">SELECT_IMAGE</td>
                      <td className="border-r p-2 whitespace-nowrap">Look and match: 'hi'</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap">g3-u1-hi.png</td>
                      <td className="border-r p-2 whitespace-nowrap">g3-u1-bye.png</td>
                      <td className="border-r p-2 whitespace-nowrap">g1-u2-car.png</td>
                      <td className="p-2 whitespace-nowrap">g1-u2-car.png</td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="border-r p-2 whitespace-nowrap">MULTIPLE_CHOICE</td>
                      <td className="border-r p-2 whitespace-nowrap">Listen and choose</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2  whitespace-nowrap">g3-u1-hi.mp3</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap">Xin chào</td>
                      <td className="border-r p-2 whitespace-nowrap">Xin chào</td>
                      <td className="border-r p-2 whitespace-nowrap">Hi</td>
                      <td className="border-r p-2 whitespace-nowrap">Bye</td>
                      <td className="border-r p-2 whitespace-nowrap">c</td>
                      <td className="p-2 whitespace-nowrap">d</td>
                    </tr>
                    <tr className="border-t">
                      <td className="border-r p-2 whitespace-nowrap">LISTENING</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap">b</td>
                      <td className="border-r p-2 whitespace-nowrap">c</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="p-2 whitespace-nowrap"></td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="border-r p-2 whitespace-nowrap">PRONUNCIATION</td>
                      <td className="border-r p-2 whitespace-nowrap">Listen and pronunciation</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap">g3-u1-hi.mp3</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="p-2 whitespace-nowrap"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="border-r p-2 whitespace-nowrap">MATCHING</td>
                      <td className="border-r p-2 whitespace-nowrap">Matching</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap">Hi | xin chào</td>
                      <td className="border-r p-2 whitespace-nowrap">Hi | image: g3-u1-hi.png</td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="border-r p-2 whitespace-nowrap"></td>
                      <td className="p-2 whitespace-nowrap"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Column Descriptions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">2. Mô tả các cột</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">type:</span>
                  <span className="text-muted-foreground">Loại bài tập: MULTIPLE_CHOICE, SELECT_IMAGE, LISTENING, PRONUNCIATION, MATCHING (được yêu cầu)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">prompt:</span>
                  <span className="text-muted-foreground">Câu hỏi/Yêu cầu của bài tập (được yêu cầu)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">img:</span>
                  <span className="text-muted-foreground">Tên file ảnh minh họa (tùy chọn)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">audio:</span>
                  <span className="text-muted-foreground">Tên file audio (tùy chọn)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">targetText:</span>
                  <span className="text-muted-foreground">Văn bản mục tiêu (dùng cho PRONUNCIATION)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">hintEn:</span>
                  <span className="text-muted-foreground">Gợi ý tiếng Anh (tùy chọn)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">hintVi:</span>
                  <span className="text-muted-foreground">Gợi ý tiếng Việt (tùy chọn)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">optT:</span>
                  <span className="text-muted-foreground">Đáp án đúng (text hoặc tên file ảnh)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">optF1-3:</span>
                  <span className="text-muted-foreground">Các đáp án sai (tùy chọn, tối đa 3)</span>
                </div>
              </div>
            </div>

            {/* Section 3: Asset Preparation */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">3. Chuẩn bị file assets (Ảnh/Audio)</h3>
              <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                <li>Tạo thư mục chứa tất cả file ảnh và audio</li>
                <li>
                  Tên file phải <strong className="text-foreground">KHỚP CHÍNH XÁC</strong> với tên trong Excel (phân biệt hoa/thường)
                </li>
                <li>Ảnh: hỗ trợ .png, .jpg, .jpeg, .gif, .webp</li>
                <li>Audio: hỗ trợ .mp3, .wav, .m4a</li>
                <li>
                  <strong className="text-foreground">Nếu không có assets</strong>, bỏ qua bước 2 trong dialog import
                </li>
              </ul>
            </div>

            {/* Section 4: Important Notes */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">4. Lưu ý quan trọng</h3>
              <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                <li>
                  <strong className="text-foreground">MULTIPLE_CHOICE</strong>: Cần ít nhất 2 đáp án (optT và optF1)
                </li>
                <li>
                  <strong className="text-foreground">SELECT_IMAGE</strong>: optT, optF1-3 chứa tên file ảnh
                </li>
                <li>
                  <strong className="text-foreground">LISTENING</strong>: optT, optF1-3 chứa text đáp án
                </li>
                <li>
                  <strong className="text-foreground">PRONUNCIATION</strong>: Không cần đáp án, chỉ cần prompt và audio
                </li>
                <li>
                  <strong className="text-foreground">MATCHING</strong>: Cột hintEn và hintVi chứa các cặp ghép nối theo format: "text1 | text2" hoặc "text1 | image: filename.png"
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
