"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

import {
  createFlashcard,
  getFlashcard,
  updateFlashcard,
  getFlashcardsByTopic,
  bulkCreateFlashcards,
  deleteFlashcard,
} from "@/actions/flashcard";
import { getTopics } from "@/actions/topic";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3 } from "@/components/typography";
import {
  CreateFlashcardFormData,
  CreateFlashcardSchema,
  flashcardStatusLabels,
  CreateFlashcardsFormData,
  CreateFlashcardsSchema,
  type NewFlashcardInput,
} from "@/schemas/flashcard";
import { Topic } from "@/types";
import { UPLOAD_PRESET } from "@/lib/constants";
import { useFlashcardFormStore } from "@/lib/stores/flashcard-form-store";

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

export default function FlashcardFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [existingFlashcardsCount, setExistingFlashcardsCount] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<FileList | null>(null);
  const [importPreview, setImportPreview] = useState<{
    neededFiles: Set<string>;
    matchedFiles: number;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedGrade: storeGrade,
    selectedTopicId: storeTopicId,
    clearSelection,
  } = useFlashcardFormStore();

  const flashcardId = searchParams.get("id");
  const topicIdParam = searchParams.get("topicId");
  const isEditMode = !!flashcardId;
  const isTopicLocked = !!topicIdParam;

  // Use different schemas based on mode
  const form = useForm<CreateFlashcardFormData | CreateFlashcardsFormData>({
    resolver: zodResolver(
      isTopicLocked ? CreateFlashcardsSchema : CreateFlashcardSchema,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any,
    defaultValues: isTopicLocked
      ? {
          topicId: 0,
          flashcards: [
            {
              term: "",
              phonetic: "",
              meaningVi: "",
              exampleEn: "",
              exampleVi: "",
              imageUrl: "",
              audioUrl: "",
              isActive: true,
            },
          ],
        }
      : {
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: "flashcards" as any,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;
  // Typed view of the form for bulk (topic-locked) mode.
  const bulkForm = form as unknown as UseFormReturn<CreateFlashcardsFormData>;

  // Fetch topics and flashcard data on mount
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

          // Load existing flashcards for this topic
          const existingFlashcardsResponse = await getFlashcardsByTopic(parsedTopicId);
          const existingFlashcards = existingFlashcardsResponse.payload || [];

          if (existingFlashcards.length > 0) {
            const allFlashcards = existingFlashcards.map((fc) => ({
              id: fc.id,
              term: fc.term,
              phonetic: fc.phonetic,
              meaningVi: fc.meaningVi,
              exampleEn: fc.exampleEn ?? "",
              exampleVi: fc.exampleVi ?? "",
              imageUrl: fc.imageUrl ?? "",
              audioUrl: fc.audioUrl ?? "",
              order: fc.order,
              isActive: fc.isActive,
            }));

            setExistingFlashcardsCount(allFlashcards.length);

            form.reset({
              topicId: parsedTopicId,
              flashcards: allFlashcards,
            });
          } else {
            form.reset({
              topicId: parsedTopicId,
              flashcards: [
                {
                  term: "",
                  phonetic: "",
                  meaningVi: "",
                  exampleEn: "",
                  exampleVi: "",
                  imageUrl: "",
                  audioUrl: "",
                  isActive: true,
                },
              ],
            });
          }
        } else if (isEditMode) {
          const flashcard = await getFlashcard(parseInt(flashcardId));
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
        } else {
          // New flashcard mode - check if there are filters from store
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
  }, [flashcardId, isEditMode, topicIdParam, storeGrade, storeTopicId]);

  const onSubmit = async (data: CreateFlashcardFormData | CreateFlashcardsFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const singleData = data as CreateFlashcardFormData;
        const updatedFlashcard = await updateFlashcard(parseInt(flashcardId), singleData);
        if (updatedFlashcard) {
          toast.success("Cập nhật flashcard thành công");
        } else {
          toast.error("Cập nhật flashcard thất bại");
        }
        clearSelection();
        router.push("/admin/flashcards");
        router.refresh();
      } else if (isTopicLocked) {
        // Bulk create/update mode
        const bulkData = data as CreateFlashcardsFormData;

        // Split flashcards into existing (with id) and new (without id)
        const existingFlashcards = bulkData.flashcards.filter((fc) => fc.id);
        const newFlashcards = bulkData.flashcards.filter((fc) => !fc.id);

        // Update existing flashcards individually
        if (existingFlashcards.length > 0) {
          await Promise.all(
            existingFlashcards.map((flashcard) =>
              updateFlashcard(flashcard.id!, {
                topicId: bulkData.topicId,
                term: flashcard.term,
                phonetic: flashcard.phonetic,
                meaningVi: flashcard.meaningVi,
                exampleEn: flashcard.exampleEn,
                exampleVi: flashcard.exampleVi,
                imageUrl: flashcard.imageUrl,
                audioUrl: flashcard.audioUrl,
                order: flashcard.order,
                isActive: flashcard.isActive,
              }),
            ),
          );
        }

        // Create new flashcards if any
        if (newFlashcards.length > 0) {
          const cleanedNewFlashcards = newFlashcards.map((flashcard) => {
            const cleaned: NewFlashcardInput = {
              term: flashcard.term,
              phonetic: flashcard.phonetic,
              meaningVi: flashcard.meaningVi,
              isActive: flashcard.isActive ?? true,
            };

            // Only include optional fields if they have values
            if (flashcard.exampleEn) cleaned.exampleEn = flashcard.exampleEn;
            if (flashcard.exampleVi) cleaned.exampleVi = flashcard.exampleVi;
            if (flashcard.imageUrl) cleaned.imageUrl = flashcard.imageUrl;
            if (flashcard.audioUrl) cleaned.audioUrl = flashcard.audioUrl;
            // DO NOT send order for new flashcards - let backend auto-assign

            return cleaned;
          });
          await bulkCreateFlashcards(bulkData.topicId, cleanedNewFlashcards);
        }

        toast.success("Cập nhật thành công");
        clearSelection();
        router.push("/admin/flashcards");
        router.refresh();
      } else {
        // Single create mode
        const singleData = data as CreateFlashcardFormData;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = singleData;
        const createdFlashcard = await createFlashcard(createData);
        if (createdFlashcard) {
          toast.success("Tạo flashcard thành công");
        } else {
          toast.error("Tạo flashcard thất bại");
        }
        clearSelection();
        router.push("/admin/flashcards");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save flashcard:", error);

      const errorMessage = (error as { payload?: { message?: string | string[] } })?.payload
        ?.message;

      if (typeof errorMessage === "string") {
        if (errorMessage.includes("Unique constraint") || errorMessage.includes("already exists")) {
          toast.error(
            "Flashcard với thứ tự này đã tồn tại trong chủ đề. Vui lòng chọn thứ tự khác.",
          );
          return;
        }
        if (errorMessage.includes("Topic") && errorMessage.includes("not found")) {
          toast.error("Không tìm thấy chủ đề. Vui lòng chọn chủ đề khác.");
          return;
        }
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else {
        toast.error(isEditMode ? "Cập nhật flashcard thất bại" : "Tạo flashcard thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleImageUpload(index: number | undefined, result: any) {
    if (result?.info?.secure_url) {
      if (index !== undefined && isTopicLocked) {
        form.setValue(`flashcards.${index}.imageUrl`, result.info.secure_url);
      } else {
        form.setValue("imageUrl", result.info.secure_url);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleAudioUpload(index: number | undefined, result: any) {
    if (result?.info?.secure_url) {
      if (index !== undefined && isTopicLocked) {
        form.setValue(`flashcards.${index}.audioUrl`, result.info.secure_url);
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

  function handleAddFlashcard() {
    append({
      term: "",
      phonetic: "",
      meaningVi: "",
      exampleEn: "",
      exampleVi: "",
      imageUrl: "",
      audioUrl: "",
      // Don't set order here - backend will auto-assign
      isActive: true,
    });
  }

  function handleImportExcel() {
    const topicId = form.getValues("topicId");
    if (!topicId) {
      toast.error("Vui lòng chọn chủ đề trước");
      return;
    }
    setShowImportDialog(true);
  }

  async function handleExcelFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedExcelFile(file);

    // Read Excel to get needed files
    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        const extractFileName = (path: string): string | null => {
          if (!path || typeof path !== "string") return null;
          const normalized = path.trim();
          if (normalized === "\\n" || normalized === "\n") return null;
          return normalized.split("\\").pop()?.split("/").pop() || null;
        };

        const neededFileNames = new Set<string>();
        data.forEach((row) => {
          ["img", "audio"].forEach((col) => {
            if (row[col]) {
              const fileName = extractFileName(String(row[col]));
              if (fileName && fileName.match(/\.(png|jpg|jpeg|mp3|mp4|wav)$/i)) {
                neededFileNames.add(fileName);
              }
            }
          });
        });

        // Update preview if folder already selected
        if (selectedFolderFiles) {
          const matchedCount = Array.from(selectedFolderFiles).filter((f) =>
            neededFileNames.has(f.name),
          ).length;
          setImportPreview({ neededFiles: neededFileNames, matchedFiles: matchedCount });
        } else {
          setImportPreview({ neededFiles: neededFileNames, matchedFiles: 0 });
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Failed to read Excel:", error);
      toast.error("Không thể đọc file Excel");
    }
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSelectedFolderFiles(files);

    // Update preview if Excel already selected
    if (importPreview) {
      const matchedCount = Array.from(files).filter((f) =>
        importPreview.neededFiles.has(f.name),
      ).length;
      setImportPreview({ ...importPreview, matchedFiles: matchedCount });
    }
  }

  async function handleConfirmImport() {
    if (!selectedExcelFile || !selectedFolderFiles) {
      toast.error("Vui lòng chọn đủ file Excel và thư mục tài nguyên");
      return;
    }

    const topicId = form.getValues("topicId");
    if (!topicId) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("excelFile", selectedExcelFile);

      // Filter and add only needed files
      let matchedCount = 0;
      if (importPreview) {
        Array.from(selectedFolderFiles).forEach((file) => {
          if (importPreview.neededFiles.has(file.name)) {
            formData.append("assets", file);
            matchedCount++;
          }
        });
      }

      toast.info(`📦 Đang upload: 1 Excel + ${matchedCount} file assets...`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/flashcards/import/${topicId}`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import thất bại");
      }

      const result = await response.json();
      toast.success(`🎉 Đã import ${result.imported} flashcard thành công!`);

      // Reload flashcards
      const existingFlashcardsResponse = await getFlashcardsByTopic(topicId);
      const existingFlashcards = existingFlashcardsResponse.payload || [];

      if (existingFlashcards.length > 0) {
        const allFlashcards = existingFlashcards.map((fc) => ({
          id: fc.id,
          term: fc.term,
          phonetic: fc.phonetic,
          meaningVi: fc.meaningVi,
          exampleEn: fc.exampleEn ?? "",
          exampleVi: fc.exampleVi ?? "",
          imageUrl: fc.imageUrl ?? "",
          audioUrl: fc.audioUrl ?? "",
          order: fc.order,
          isActive: fc.isActive,
        }));

        setExistingFlashcardsCount(allFlashcards.length);
        bulkForm.setValue("flashcards", allFlashcards);
      }

      // Close dialog and reset
      setShowImportDialog(false);
      setSelectedExcelFile(null);
      setSelectedFolderFiles(null);
      setImportPreview(null);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(error instanceof Error ? error.message : "Import Excel thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveFlashcard(index: number) {
    const flashcard = form.getValues(`flashcards.${index}` as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    // If flashcard has an id, it exists in the database and needs to be deleted
    if (flashcard.id) {
      try {
        await deleteFlashcard(flashcard.id);
        toast.success("Đã xóa flashcard thành công");
        remove(index);
      } catch (error) {
        console.error("Failed to delete flashcard:", error);
        toast.error("Xóa flashcard thất bại");
      }
    } else {
      // Just remove from form array if it's a new flashcard not yet saved
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
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/flashcards">Flashcards</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isEditMode ? "Chỉnh sửa" : isTopicLocked ? "Tạo/sửa nhiều flashcard" : "Thêm mới"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TypographyH3>
        {isEditMode
          ? "Chỉnh sửa flashcard"
          : isTopicLocked
            ? "Tạo/sửa nhiều flashcard"
            : "Thêm flashcard mới"}
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
                <FormDescription>Khối lớp đã được chọn và không thể thay đổi</FormDescription>
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
                      placeholder={selectedGrade ? "Chọn chủ đề" : "Vui lòng chọn khối lớp trước"}
                      searchPlaceholder="Tìm kiếm chủ đề..."
                      emptyText={selectedGrade ? "Không tìm thấy chủ đề." : "Chưa chọn khối lớp."}
                      disabled={!selectedGrade || isTopicLocked}
                      className={cn(!field.value && "text-muted-foreground")}
                    />
                  </FormControl>
                  {isTopicLocked && (
                    <FormDescription>Chủ đề đã được chọn và không thể thay đổi</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bulk Mode: List of Flashcards */}
          {isTopicLocked ? (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Danh sách flashcard</h3>
                    {existingFlashcardsCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Đang có {existingFlashcardsCount} flashcard từ trước. Bạn có thể sửa hoặc
                        thêm mới.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleImportExcel} size="sm" variant="secondary">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Excel
                    </Button>
                    <Button type="button" onClick={handleAddFlashcard} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm flashcard
                    </Button>
                  </div>
                </div>

                {fields.map((field, index) => {
                  const isExpanded = expandedCards.has(field.id);
                  const flashcard = bulkForm.getValues(`flashcards.${index}`);
                  const hasContent = flashcard?.term || flashcard?.meaningVi;

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
                              Flashcard #{index + 1}
                              {hasContent && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                  {flashcard.term ? ` - ${flashcard.term}` : ""}
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
                                  Hành động này sẽ xóa flashcard vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveFlashcard(index)}>
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={formControl}
                              name={`flashcards.${index}.term`}
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

                            <FormField
                              control={formControl}
                              name={`flashcards.${index}.phonetic`}
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

                          <FormField
                            control={formControl}
                            name={`flashcards.${index}.meaningVi`}
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

                          <FormField
                            control={formControl}
                            name={`flashcards.${index}.imageUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Hình ảnh minh họa <RequiredField />
                                </FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} placeholder="URL hình ảnh" />
                                    <CldUploadWidget
                                      uploadPreset={UPLOAD_PRESET}
                                      onSuccess={(result) => handleImageUpload(index, result)}
                                    >
                                      {({ open }) => (
                                        <Button type="button" size="icon" onClick={() => open()}>
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

                          <FormField
                            control={formControl}
                            name={`flashcards.${index}.audioUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  File âm thanh phát âm <RequiredField />
                                </FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} placeholder="URL âm thanh" />
                                    <CldUploadWidget
                                      uploadPreset={UPLOAD_PRESET}
                                      onSuccess={(result) => handleAudioUpload(index, result)}
                                    >
                                      {({ open }) => (
                                        <Button type="button" size="icon" onClick={() => open()}>
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
                            name={`flashcards.${index}.exampleEn`}
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={formControl}
                            name={`flashcards.${index}.exampleVi`}
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={formControl}
                            name={`flashcards.${index}.isActive`}
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
                                    {Object.entries(flashcardStatusLabels).map(([value, label]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
              <div className="grid gap-4 md:grid-cols-2">
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

              <FormField
                control={formControl}
                name="exampleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ví dụ tiếng Anh</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Nhập câu ví dụ tiếng Anh" rows={2} />
                    </FormControl>
                    <FormDescription>Câu ví dụ sử dụng từ vựng trong ngữ cảnh</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formControl}
                name="exampleVi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nghĩa ví dụ tiếng Việt</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Nhập nghĩa ví dụ tiếng Việt" rows={2} />
                    </FormControl>
                    <FormDescription>Dịch nghĩa của câu ví dụ tiếng Anh</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

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
                          onSuccess={(result) => handleImageUpload(undefined, result)}
                        >
                          {({ open }) => (
                            <Button type="button" size="icon" onClick={() => open()}>
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </FormControl>
                    <FormDescription>Hình ảnh giúp học viên dễ nhớ từ vựng hơn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          onSuccess={(result) => handleAudioUpload(undefined, result)}
                        >
                          {({ open }) => (
                            <Button type="button" size="icon" onClick={() => open()}>
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </FormControl>
                    <FormDescription>File âm thanh phát âm chuẩn của từ vựng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className={`grid gap-4 ${isEditMode ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
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
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                          {Object.entries(flashcardStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4 pb-2">
            <Button type="button" onClick={handleCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Cập nhật" : isTopicLocked ? "Lưu tất cả" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Import Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Flashcards từ Excel
            </AlertDialogTitle>
            <AlertDialogDescription>
              Chọn file Excel và thư mục chứa hình ảnh/âm thanh để import flashcard
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Excel File Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">1. File Excel (.xlsx, .xls)</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFileSelect}
                  className="cursor-pointer"
                />
              </div>
              {selectedExcelFile && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Đã chọn: {selectedExcelFile.name}
                </p>
              )}
            </div>

            {/* Folder Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">2. Thư mục chứa tài nguyên (ảnh/audio)</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  // @ts-expect-error - webkitdirectory is not in TypeScript types but works in browsers
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  className="cursor-pointer"
                />
              </div>
              {selectedFolderFiles && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Đã chọn thư mục với {selectedFolderFiles.length} file
                </p>
              )}
            </div>

            {/* Preview */}
            {importPreview && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium text-sm">Thông tin import:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    📋 File cần thiết: <strong>{importPreview.neededFiles.size}</strong> file
                  </p>
                  <p>
                    ✅ File khớp:{" "}
                    <strong className="text-green-600">{importPreview.matchedFiles}</strong> file
                  </p>
                  {importPreview.matchedFiles < importPreview.neededFiles.size && (
                    <p className="text-amber-600">
                      ⚠️ Thiếu {importPreview.neededFiles.size - importPreview.matchedFiles} file
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              disabled={!selectedExcelFile || !selectedFolderFiles || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bắt đầu Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
