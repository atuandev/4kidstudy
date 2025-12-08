
"use client";



import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImageIcon,
  Loader2,
  Upload,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  createSentenceImage,
  getSentenceImage,
  getSentenceImagesByTopicId,
  updateSentenceImage,
  bulkCreateSentences,
  deleteSentenceImage,
  deleteSentence,
  checkSentenceProgress,
  updateSentence,
  checkSentenceProgressForDelete,
  checkSentenceImageProgressForDelete,
} from "@/actions/sentence";
import { getTopics } from "@/actions/topic";
import { RequiredField } from "@/components/form/required-field";
import { TypographyH3 } from "@/components/typography";
import {
  CreateSentenceImageFormData,
  CreateSentenceImageSchema,
} from "@/schemas/sentence";
import { Topic } from "@/types";
import { UPLOAD_PRESET } from "@/lib/constants";
import { useSentenceFormStore } from "@/lib/stores/sentence-form-store";

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

// Type for SentenceImage with sentences (for bulk mode)
type SentenceImageGroup = {
  id?: number;
  imageUrl: string;
  audioUrl: string;
  order: number;
  isActive: boolean;
  sentences: Array<{
    id?: number;
    text: string;
    meaningVi: string;
    hintVi: string;
    audioUrl: string;
    order: number;
    isActive: boolean;
  }>;
};

export default function SentenceFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [sentenceImageGroups, setSentenceImageGroups] = useState<SentenceImageGroup[]>([]);
  const existingSentencesCount: number = sentenceImageGroups.reduce(
    (total: number, group: SentenceImageGroup) => total + group.sentences.length,
    0
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<FileList | null>(null);
  const [importPreview, setImportPreview] = useState<{
    neededFiles: string[];
    matchedFiles: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportHelpDialog, setShowImportHelpDialog] = useState(false);
  const [sentenceGroupErrors, setSentenceGroupErrors] = useState<Map<number, string[]>>(new Map());
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [sentencesWithProgress, setSentencesWithProgress] = useState<Array<{
    id: number;
    text: string;
    hasProgress: boolean;
    progressCount: number;
    masteredCount: number;
  }>>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Map<number, any>>(new Map());
  const [pendingBulkContext, setPendingBulkContext] = useState<{
    topicId: number;
    groups: SentenceImageGroup[];
  } | null>(null);
  const [resetProgress, setResetProgress] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedGrade: storeGrade,
    selectedTopicId: storeTopicId,
    clearSelection,
  } = useSentenceFormStore();

  const sentenceImageId = searchParams.get("id");
  const topicIdParam = searchParams.get("topicId");
  const isEditMode = !!sentenceImageId;
  const isTopicLocked = !!topicIdParam; // Lock topic if passed via query param

  const form = useForm<CreateSentenceImageFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateSentenceImageSchema) as any,
    defaultValues: {
      topicId: 0,
      imageUrl: "",
      audioUrl: "",
      order: 0,
      isActive: true,
      sentences: [
        {
          text: "",
          meaningVi: "",
          hintVi: "",
          audioUrl: "",
          order: 0,
          isActive: true,
        },
      ],
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;

  const { fields, append, remove } = useFieldArray({
    control: formControl,
    name: "sentences",
  });

  // Fetch topics and sentence image data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedTopics = await getTopics();
        setAvailableTopics(fetchedTopics);

        // If topicId is passed via query param (bulk create mode)
        if (topicIdParam) {
          const parsedTopicId = parseInt(topicIdParam);
          const topic = fetchedTopics.find((t) => t.id === parsedTopicId);
          if (topic?.grade) {
            setSelectedGrade(topic.grade);
          }

          // Fetch existing sentence images for this topic
          const existingSentenceImages = await getSentenceImagesByTopicId(
            parsedTopicId
          );

          // Map to SentenceImageGroup structure
          const groups: SentenceImageGroup[] = existingSentenceImages.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            audioUrl: img.audioUrl ?? "",
            order: img.order,
            isActive: img.isActive,
            sentences: img.sentences.map((s) => ({
              id: s.id,
              text: s.text,
              meaningVi: s.meaningVi ?? "",
              hintVi: s.hintVi ?? "",
              audioUrl: s.audioUrl ?? "",
              order: s.order,
              isActive: s.isActive,
            })),
          }));

          setSentenceImageGroups(groups);

          // Set topic in form for submission
          form.setValue("topicId", parsedTopicId);
        } else if (isEditMode) {
          const sentenceImage = await getSentenceImage(
            parseInt(sentenceImageId)
          );
          const topic = fetchedTopics.find(
            (t) => t.id === sentenceImage.topicId
          );
          if (topic?.grade) {
            setSelectedGrade(topic.grade);
          }
          form.reset({
            topicId: sentenceImage.topicId,
            imageUrl: sentenceImage.imageUrl,
            audioUrl: sentenceImage.audioUrl ?? "",
            order: sentenceImage.order,
            isActive: sentenceImage.isActive,
            sentences: sentenceImage.sentences.map((s) => ({
              id: s.id,
              text: s.text,
              meaningVi: s.meaningVi ?? "",
              hintVi: s.hintVi ?? "",
              audioUrl: s.audioUrl ?? "",
              order: s.order,
              isActive: s.isActive,
            })),
          });
        } else {
          // New sentence mode - check if there are filters from store
          if (storeGrade) {
            setSelectedGrade(storeGrade);
            toast.success(`Đã chọn lớp: ${GRADE_LABELS[storeGrade]}`);
          }

          if (storeTopicId) {
            const topic = fetchedTopics.find((t) => t.id === storeTopicId);
            if (topic) {
              form.setValue("topicId", storeTopicId);
              toast.success(`Đã chọn chủ đề: ${topic.title}`);

              // Update URL to preserve topicId on refresh
              router.push(`/admin/sentences/form?topicId=${storeTopicId}`);
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
  }, [sentenceImageId, isEditMode, topicIdParam, storeGrade, storeTopicId]);

  // Re-validate sentence groups when they change
  useEffect(() => {
    if (!isTopicLocked) return;

    if (sentenceImageGroups.length > 0) {
      const errorMap = new Map<number, string[]>();
      sentenceImageGroups.forEach((group, index) => {
        const errors = validateSentenceGroup(group, sentenceImageGroups, index);
        if (errors.length > 0) {
          errorMap.set(index, errors);
        }
      });
      setSentenceGroupErrors(errorMap);
    } else {
      setSentenceGroupErrors(new Map());
    }
  }, [sentenceImageGroups, isTopicLocked]);

  // Validation helper
  function validateSentenceGroup(group: any, allGroups: any[] = [], currentIndex: number = -1): string[] { // eslint-disable-line @typescript-eslint/no-explicit-any
    const errors: string[] = [];

    // Helper to normalize and check if value is empty (including \n)
    const isEmpty = (value: string | null | undefined): boolean => {
      if (value === null || value === undefined) return true;
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '\\n' || trimmed === '\n') return true;
      return false;
    };

    // Check for required imageUrl
    if (isEmpty(group.imageUrl)) {
      errors.push("Thiếu hình ảnh");
    }

    // Check for duplicate imageUrl (same Cloudinary URL)
    if (group.imageUrl && !isEmpty(group.imageUrl)) {
      const duplicates = allGroups.filter((g, idx) =>
        idx !== currentIndex &&
        g.imageUrl === group.imageUrl &&
        !isEmpty(g.imageUrl)
      );
      if (duplicates.length > 0) {
        errors.push("Trùng hình ảnh với thẻ câu khác");
      }
    }

    // Check for duplicate sentence text within this topic
    if (group.sentences && group.sentences.length > 0) {
      const allSentenceTexts = new Map<string, number[]>(); // text -> [group indices]

      allGroups.forEach((g, groupIdx) => {
        if (g.sentences) {
          g.sentences.forEach((s: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (s.text && !isEmpty(s.text)) {
              const normalized = s.text.trim().toLowerCase();
              if (!allSentenceTexts.has(normalized)) {
                allSentenceTexts.set(normalized, []);
              }
              allSentenceTexts.get(normalized)!.push(groupIdx);
            }
          });
        }
      });

      // Check if any sentences in current group are duplicated
      group.sentences.forEach((sentence: any, idx: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (sentence.text && !isEmpty(sentence.text)) {
          const normalized = sentence.text.trim().toLowerCase();
          const duplicateGroups = allSentenceTexts.get(normalized) || [];
          if (duplicateGroups.length > 1 || (duplicateGroups.length === 1 && duplicateGroups[0] !== currentIndex)) {
            errors.push(`Câu ${idx + 1}: Trùng nội dung với câu khác`);
          }
        }
      });
    }

    // Check for at least 1 sentence
    if (!group.sentences || group.sentences.length === 0) {
      errors.push("Cần ít nhất 1 câu");
    } else {
      // Validate each sentence
      group.sentences.forEach((sentence: any, idx: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (isEmpty(sentence.text)) {
          errors.push(`Câu ${idx + 1}: Thiếu nội dung`);
        }
        if (isEmpty(sentence.meaningVi)) {
          errors.push(`Câu ${idx + 1}: Thiếu nghĩa`);
        }
        if (isEmpty(sentence.audioUrl)) {
          errors.push(`Câu ${idx + 1}: Thiếu audio`);
        }
      });
    }

    return errors;
  }

  // Bulk mode submit handler
  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    try {
      const topicId = form.getValues("topicId");

      // Step 1: Collect all sentences that will be updated (have ID)
      const sentencesToUpdate: Array<{ id: number; updateData: any }> = []; // eslint-disable-line @typescript-eslint/no-explicit-any

      for (const group of sentenceImageGroups) {
        if (group.id) {
          // Existing group - check for sentence updates
          for (const sentence of group.sentences) {
            if (sentence.id) {
              sentencesToUpdate.push({
                id: sentence.id,
                updateData: {
                  text: sentence.text,
                  meaningVi: sentence.meaningVi,
                  hintVi: sentence.hintVi,
                  audioUrl: sentence.audioUrl,
                  order: sentence.order,
                  isActive: sentence.isActive,
                },
              });
            }
          }
        }
      }

      // Step 2: Check if any sentences have progress
      if (sentencesToUpdate.length > 0) {
        const sentenceIds = sentencesToUpdate.map((s) => s.id);
        const progressInfo = await checkSentenceProgress(sentenceIds);
        const withProgress = progressInfo.filter((s) => s.hasProgress);

        if (withProgress.length > 0) {
          // Store pending updates, bulk context, and show dialog
          const updates = new Map();
          sentencesToUpdate.forEach((s) => {
            updates.set(s.id, s.updateData);
          });
          setPendingUpdates(updates);
          setPendingBulkContext({ topicId, groups: sentenceImageGroups });
          setSentencesWithProgress(withProgress);
          setShowProgressDialog(true);
          setIsSubmitting(false);
          return; // Stop here, let dialog handlers complete the update
        }
      }

      // Step 3: No progress or no updates needed, proceed normally
      for (const group of sentenceImageGroups) {
        if (group.id) {
          // Update existing SentenceImage
          await updateSentenceImage(group.id, {
            topicId,
            imageUrl: group.imageUrl,
            audioUrl: group.audioUrl,
            order: group.order,
            isActive: group.isActive,
          });

          // Update individual sentences
          for (const sentence of group.sentences) {
            if (sentence.id) {
              await updateSentence(sentence.id, {
                text: sentence.text,
                meaningVi: sentence.meaningVi,
                hintVi: sentence.hintVi,
                audioUrl: sentence.audioUrl,
                order: sentence.order,
                isActive: sentence.isActive,
              });
            }
          }
        } else if (group.sentences.length > 0) {
          // Create new SentenceImage with sentences
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const cleanedSentences = group.sentences.map(({ id, ...s }) => s);
          await bulkCreateSentences(topicId, [
            {
              imageUrl: group.imageUrl,
              audioUrl: group.audioUrl,
              isActive: group.isActive,
              sentences: cleanedSentences,
            },
          ]);
        }
      }

      toast.success("Lưu thành công");
      clearSelection();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Lưu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: CreateSentenceImageFormData) => {
    setIsSubmitting(true);

    try {
      // Check if editing and any sentences have progress
      if (isEditMode) {
        const sentenceIds = data.sentences
          .filter((s) => s.id)
          .map((s) => s.id!);

        if (sentenceIds.length > 0) {
          console.log("🔍 Checking progress for sentence IDs:", sentenceIds);
          const progressInfo = await checkSentenceProgress(sentenceIds);
          console.log("📊 Progress check result:", progressInfo);
          const withProgress = progressInfo.filter((s) => s.hasProgress);
          console.log("⚠️ Sentences with progress:", withProgress);

          if (withProgress.length > 0) {
            console.log("🔔 Showing progress dialog");

            // Store pending data and show dialog
            setSentencesWithProgress(withProgress);
            setPendingBulkContext({
              topicId: data.topicId,
              groups: [{
                id: parseInt(sentenceImageId),
                imageUrl: data.imageUrl,
                audioUrl: data.audioUrl || "",
                order: data.order || 0,
                isActive: data.isActive,
                sentences: data.sentences.map(s => ({
                  id: s.id,
                  text: s.text,
                  meaningVi: s.meaningVi,
                  hintVi: s.hintVi || "",
                  audioUrl: s.audioUrl || "",
                  order: s.order || 0,
                  isActive: s.isActive,
                })),
              }],
            });
            const updates = new Map();
            data.sentences.forEach((s) => {
              if (s.id) {
                updates.set(s.id, {
                  text: s.text,
                  meaningVi: s.meaningVi,
                  hintVi: s.hintVi,
                  audioUrl: s.audioUrl,
                  order: s.order,
                  isActive: s.isActive,
                });
              }
            });
            setPendingUpdates(updates);
            setShowProgressDialog(true);
            setIsSubmitting(false);
            return; // Stop here, let dialog handler complete
          }
        }
      }

      // Proceed with update
      if (isEditMode) {
        // Update SentenceImage
        await updateSentenceImage(parseInt(sentenceImageId), {
          topicId: data.topicId,
          imageUrl: data.imageUrl,
          audioUrl: data.audioUrl,
          order: data.order,
          isActive: data.isActive,
        });

        // Update individual sentences
        for (const sentence of data.sentences) {
          if (sentence.id) {
            await updateSentence(sentence.id, {
              text: sentence.text,
              meaningVi: sentence.meaningVi,
              hintVi: sentence.hintVi,
              audioUrl: sentence.audioUrl,
              order: sentence.order,
              isActive: sentence.isActive,
            });
          }
        }

        toast.success("Cập nhật thành công");
        clearSelection();
        router.push("/admin/sentences");
        router.refresh();
      } else {
        // Normal create mode (single sentence image)
        const { order: _order, ...createData } = data;

        // Remove 'id' field from all sentences
        const cleanedSentences = createData.sentences.map(
          ({ id: _id, ...sentence }) => sentence
        );
        const finalData = {
          ...createData,
          sentences: cleanedSentences,
        };

        const created = await createSentenceImage(finalData);
        if (created) {
          toast.success("Tạo mới thành công");
          clearSelection();
          router.push("/admin/sentences");
          router.refresh();
        } else {
          toast.error("Tạo mới thất bại");
        }
      }
    } catch (error) {
      console.error("Failed to save sentence image:", error);

      const errorMessage = (
        error as { payload?: { message?: string | string[] } }
      )?.payload?.message;

      if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else {
        toast.error(isEditMode ? "Cập nhật thất bại" : "Lưu thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleImageUpload(result: any) {
    if (result?.info?.secure_url) {
      form.setValue("imageUrl", result.info.secure_url);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleMainAudioUpload(result: any) {
    if (result?.info?.secure_url) {
      form.setValue("audioUrl", result.info.secure_url);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleSentenceAudioUpload(index: number, result: any) {
    if (result?.info?.secure_url) {
      form.setValue(`sentences.${index}.audioUrl`, result.info.secure_url);
    }
  }

  function handleCancel() {
    clearSelection();
    router.back();
  }

  function handleAddSentence() {
    append({
      text: "",
      meaningVi: "",
      hintVi: "",
      audioUrl: "",
      // Don't set order here - backend will auto-assign
      isActive: true,
    });
  }

  async function handleRemoveSentence(index: number) {
    const sentence = form.getValues(`sentences.${index}`);

    // If sentence has an id, check progress before deleting
    if (sentence.id) {
      try {
        const progressInfo = await checkSentenceProgressForDelete(sentence.id);

        const confirmMessage = progressInfo.hasProgress
          ? `⚠️ Câu "${progressInfo.text}" đã có ${progressInfo.progressCount} lượt học${progressInfo.masteredCount > 0 ? ` (${progressInfo.masteredCount} đã thuộc)` : ''}. Câu sẽ được ẩn đi (soft delete) thay vì xóa vĩnh viễn. Bạn có chắc chắn?`
          : `Xóa câu "${progressInfo.text}"?`;

        if (!window.confirm(confirmMessage)) {
          return;
        }

        await deleteSentence(sentence.id);
        toast.success(progressInfo.hasProgress ? "Đã ẩn câu thành công" : "Đã xóa câu thành công");
        // Update form value to mark as inactive instead of removing
        form.setValue(`sentences.${index}.isActive`, false);
      } catch (error) {
        console.error("Failed to delete sentence:", error);
        toast.error("Xóa câu thất bại");
      }
    } else {
      // Just remove from form array if it's a new sentence not yet saved
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

  // === Bulk Mode Handlers ===
  function toggleGroupExpanded(groupIndex: number) {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupIndex)) {
        newSet.delete(groupIndex);
      } else {
        newSet.add(groupIndex);
      }
      return newSet;
    });
  }

  function handleAddSentenceImageGroup() {
    setSentenceImageGroups((prev) => [
      ...prev,
      {
        imageUrl: "",
        audioUrl: "",
        order: prev.length,
        isActive: true,
        sentences: [
          {
            text: "",
            meaningVi: "",
            hintVi: "",
            audioUrl: "",
            order: 0,
            isActive: true,
          },
        ],
      },
    ]);
  }

  function handleAddSentenceToGroup(groupIndex: number) {
    setSentenceImageGroups((prev) => {
      const updated = [...prev];
      updated[groupIndex] = {
        ...updated[groupIndex],
        sentences: [
          ...updated[groupIndex].sentences,
          {
            text: "",
            meaningVi: "",
            hintVi: "",
            audioUrl: "",
            order: updated[groupIndex].sentences.length,
            isActive: true,
          },
        ],
      };
      return updated;
    });
  }

  async function handleRemoveSentenceFromGroup(
    groupIndex: number,
    sentenceIndex: number
  ) {
    const sentence = sentenceImageGroups[groupIndex].sentences[sentenceIndex];

    if (sentence.id) {
      try {
        const progressInfo = await checkSentenceProgressForDelete(sentence.id);

        const confirmMessage = progressInfo.hasProgress
          ? `⚠️ Câu "${progressInfo.text}" đã có ${progressInfo.progressCount} lượt học${progressInfo.masteredCount > 0 ? ` (${progressInfo.masteredCount} đã thuộc)` : ''}. Câu sẽ được ẩn đi (soft delete) thay vì xóa vĩnh viễn. Bạn có chắc chắn?`
          : `Xóa câu "${progressInfo.text}"?`;

        if (!window.confirm(confirmMessage)) {
          return;
        }

        await deleteSentence(sentence.id);
        toast.success(progressInfo.hasProgress ? "Đã ẩn câu thành công" : "Đã xóa câu thành công");
        // Update sentence to mark as inactive instead of removing
        setSentenceImageGroups((prev) => {
          const updated = [...prev];
          updated[groupIndex] = {
            ...updated[groupIndex],
            sentences: updated[groupIndex].sentences.map((s, i) =>
              i === sentenceIndex ? { ...s, isActive: false } : s
            ),
          };
          return updated;
        });
      } catch (error) {
        console.error("Failed to delete sentence:", error);
        toast.error("Xóa câu thất bại");
      }
    } else {
      setSentenceImageGroups((prev) => {
        const updated = [...prev];
        updated[groupIndex] = {
          ...updated[groupIndex],
          sentences: updated[groupIndex].sentences.filter(
            (_, i) => i !== sentenceIndex
          ),
        };
        return updated;
      });
    }
  }

  function handleUpdateSentenceImageGroup(
    groupIndex: number,
    field: keyof Pick<SentenceImageGroup, "imageUrl" | "audioUrl" | "isActive">,
    value: string | boolean
  ) {
    setSentenceImageGroups((prev) => {
      const updated = [...prev];
      updated[groupIndex] = {
        ...updated[groupIndex],
        [field]: value,
      };
      return updated;
    });
  }

  function handleUpdateSentenceInGroup(
    groupIndex: number,
    sentenceIndex: number,
    field: keyof SentenceImageGroup["sentences"][0],
    value: string | boolean | number
  ) {
    setSentenceImageGroups((prev) => {
      const updated = [...prev];
      const sentences = [...updated[groupIndex].sentences];
      sentences[sentenceIndex] = {
        ...sentences[sentenceIndex],
        [field]: value,
      };
      updated[groupIndex] = {
        ...updated[groupIndex],
        sentences,
      };
      return updated;
    });
  }

  const filteredTopics = selectedGrade
    ? availableTopics.filter((topic) => topic.grade === selectedGrade)
    : [];

  const handleExcelFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedExcelFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worksheet = workbook.Sheets[sheetName as any];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

      const neededFiles = new Set<string>();

      jsonData.forEach((row) => {
        const extractFilename = (path: string | undefined) => {
          if (!path || typeof path !== "string") return null;
          const trimmed = path.trim();
          if (trimmed === "\\n" || trimmed === "\n" || !trimmed) return null;
          return trimmed.split("\\").pop()?.split("/").pop() || null;
        };

        ["imgSentence", "audioImg", "sen01audio", "sen02audio", "sen03audio", "sen04audio"].forEach((key) => {
          const filename = extractFilename(row[key]);
          if (filename) neededFiles.add(filename);
        });
      });

      setImportPreview({
        neededFiles: Array.from(neededFiles),
        matchedFiles: [],
      });
    } catch (error) {
      console.error("Failed to read Excel:", error);
      toast.error("Không thể đọc file Excel");
    }
  };

  const handleFolderSelect = (e: ChangeEvent<HTMLInputElement>) => {
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
    const topicId = topicIdParam ? parseInt(topicIdParam) : storeTopicId;
    if (!topicId) {
      toast.error("Vui lòng chọn chủ đề");
      return;
    }

    if (!selectedExcelFile) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    setIsImporting(true);

    try {
      // Step 1: Upload assets to Cloudinary first
      const assetMap = new Map<string, string>();

      if (selectedFolderFiles && importPreview) {
        const matchedFiles = Array.from(selectedFolderFiles).filter(file =>
          importPreview.matchedFiles.includes(file.name)
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
          toast.success(`✅ Đã upload ${assetMap.size}/${uploadPromises.length} file assets`);
        }
      }

      // Step 2: Parse Excel client-side
      const arrayBuffer = await selectedExcelFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worksheet = workbook.Sheets[sheetName as any];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

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
      const mapAssetUrl = (cellValue: string | null): string => {
        if (!cellValue) return '';

        const normalized = cellValue.trim();
        if (!normalized) return '';

        // If it's already a URL (http/https), use it directly
        if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
          return normalized;
        }

        // Otherwise, extract filename and lookup in assetMap
        const filename = extractFileName(normalized);
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

      // Parse sentence groups
      const parsedGroups: SentenceImageGroup[] = data.map((row, index) => {
        const sentences: SentenceImageGroup["sentences"] = [];

        for (let i = 1; i <= 4; i++) {
          const text = normalizeValue(row[`sen0${i}`]);
          if (!text) continue;

          // Pass raw value to mapAssetUrl, it will handle URL detection
          const audioValue = normalizeValue(row[`sen0${i}audio`]);

          sentences.push({
            text,
            meaningVi: normalizeValue(row[`sen0${i}Vi`]),
            hintVi: "",
            audioUrl: mapAssetUrl(audioValue),
            order: i - 1,
            isActive: true,
          });
        }

        // Pass raw values to mapAssetUrl
        const imgValue = normalizeValue(row.imgSentence);
        const audioImgValue = normalizeValue(row.audioImg);

        return {
          imageUrl: mapAssetUrl(imgValue),
          audioUrl: mapAssetUrl(audioImgValue),
          order: index,
          isActive: true,
          sentences,
        };
      });

      // Add to state for PREVIEW
      const allGroups = [...sentenceImageGroups, ...parsedGroups];
      setSentenceImageGroups(allGroups);

      // Validate
      const errorMap = new Map<number, string[]>();
      allGroups.forEach((group, index) => {
        const errors = validateSentenceGroup(group, allGroups, index);
        if (errors.length > 0) {
          errorMap.set(index, errors);
        }
      });
      setSentenceGroupErrors(errorMap);

      toast.success(`📋 Đã load ${parsedGroups.length} nhóm câu với assets. Kiểm tra lỗi trước khi lưu!`);

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

  // Progress dialog handlers
  const handleConfirmProgressReset = async () => {
    if (!pendingBulkContext) return;

    setShowProgressDialog(false);
    setIsSubmitting(true);
    try {
      const { topicId, groups } = pendingBulkContext;

      // Step 1: Update individual sentences with resetProgress flag if checked
      for (const [sentenceId, updateData] of pendingUpdates.entries()) {
        await updateSentence(sentenceId, {
          ...updateData,
          resetProgress: resetProgress,
        });
      }

      // Step 2: Update SentenceImages (in case other fields like imageUrl, order changed)
      for (const group of groups) {
        if (group.id) {
          await updateSentenceImage(group.id, {
            topicId,
            imageUrl: group.imageUrl,
            audioUrl: group.audioUrl,
            order: group.order,
            isActive: group.isActive,
          });
        }
      }

      toast.success(
        resetProgress
          ? "Đã cập nhật và reset tiến trình học"
          : "Đã cập nhật thành công"
      );
      setSentencesWithProgress([]);
      setPendingUpdates(new Map());
      setPendingBulkContext(null);
      setResetProgress(false);

      // Redirect or reload based on mode
      if (topicIdParam) {
        // Bulk mode - reload groups
        const topicId = parseInt(topicIdParam);
        const existingSentenceImages = await getSentenceImagesByTopicId(topicId);
        const groups: SentenceImageGroup[] = existingSentenceImages.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          audioUrl: img.audioUrl ?? "",
          order: img.order,
          isActive: img.isActive,
          sentences: img.sentences.map((s) => ({
            id: s.id,
            text: s.text,
            meaningVi: s.meaningVi ?? "",
            hintVi: s.hintVi ?? "",
            audioUrl: s.audioUrl ?? "",
            order: s.order,
            isActive: s.isActive,
          })),
        }));
        setSentenceImageGroups(groups);
      } else if (sentenceImageId) {
        // Single edit mode - redirect back to list
        clearSelection();
        router.push("/admin/sentences");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update with reset:", error);
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 py-6 px-4">
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
              <BreadcrumbLink href="/admin/sentences">
                Câu với hình ảnh
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
        {isEditMode
          ? "Chỉnh sửa câu với hình ảnh"
          : isTopicLocked
            ? "Quản lý nhiều thẻ câu"
            : "Thêm câu với hình ảnh mới"}
      </TypographyH3>

      {/* Bulk Mode - Manage Multiple SentenceImage Groups */}
      {isTopicLocked ? (
        <div className="space-y-6">
          {/* Topic Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chủ đề</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Lớp: </span>
                  <span>{GRADE_LABELS[selectedGrade] || selectedGrade}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Chủ đề: </span>
                  <span>
                    {availableTopics.find(
                      (t) => t.id === form.getValues("topicId")
                    )?.title || "Chưa chọn"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SentenceImage Groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Danh sách thẻ câu</h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowImportDialog(true);
                    setSelectedExcelFile(null);
                    setSelectedFolderFiles(null);
                    setImportPreview(null);
                  }}
                  variant="secondary"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Import Excel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddSentenceImageGroup}
                  variant="secondaryOutline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm thẻ mới
                </Button>
              </div>
            </div>

            {sentenceImageGroups.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Chưa có thẻ câu nào trong chủ đề này.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nhấn &quot;Thêm thẻ mới&quot; để bắt đầu tạo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {sentenceImageGroups.map((group, groupIndex) => (
              <Card
                key={groupIndex}
                className={`overflow-hidden ${group.id ? "border-green-300" : ""
                  }`}
              >
                <CardHeader className={`${group.id ? "bg-green-50" : "bg-muted/50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupExpanded(groupIndex)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedGroups.has(groupIndex) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {groupIndex + 1}
                        </span>
                        <CardTitle className="text-base flex items-center gap-2">
                          Thẻ câu với hình ảnh
                          {group.id && (
                            <span className="ml-2 text-xs text-green-600 font-normal">
                              (Đã lưu - ID: {group.id})
                            </span>
                          )}
                          {!group.id && (
                            <span className="ml-2 text-xs text-amber-600 font-normal">
                              (Mới)
                            </span>
                          )}
                          {sentenceGroupErrors.has(groupIndex) && (
                            <Badge variant="destructive">
                              {sentenceGroupErrors.get(groupIndex)!.length} lỗi
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {group.sentences.length} câu
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa thẻ câu này?
                              {group.id && " Thẻ này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                // If group has ID, check progress and delete from database
                                if (group.id) {
                                  try {
                                    const progressInfo = await checkSentenceImageProgressForDelete(group.id);

                                    const extraConfirm = progressInfo.hasProgress
                                      ? `⚠️ Thẻ câu này có ${progressInfo.sentenceCount} câu và ${progressInfo.progressCount} lượt học${progressInfo.masteredCount > 0 ? ` (${progressInfo.masteredCount} đã thuộc)` : ''}. Thẻ sẽ được ẩn đi (soft delete). Tiếp tục?`
                                      : null;

                                    if (extraConfirm && !window.confirm(extraConfirm)) {
                                      return;
                                    }

                                    await deleteSentenceImage(group.id);
                                    toast.success(progressInfo.hasProgress ? "Đã ẩn thẻ câu thành công" : "Đã xóa thẻ câu thành công");
                                  } catch (error) {
                                    console.error("Failed to delete sentence image:", error);
                                    toast.error("Xóa thẻ câu thất bại");
                                    return; // Don't update state if API call failed
                                  }
                                }
                                // Mark as inactive instead of removing
                                setSentenceImageGroups((prev) =>
                                  prev.map((g, i) =>
                                    i === groupIndex ? { ...g, isActive: false } : g
                                  )
                                );
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                {expandedGroups.has(groupIndex) && (
                  <CardContent className="space-y-4 pt-6">
                    {sentenceGroupErrors.has(groupIndex) && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">Cần sửa các lỗi sau:</p>
                            <ul className="list-disc list-inside text-sm text-destructive/80 mt-1">
                              {sentenceGroupErrors.get(groupIndex)!.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* SentenceImage Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Image URL */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Hình ảnh <RequiredField />
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={group.imageUrl}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleUpdateSentenceImageGroup(
                                groupIndex,
                                "imageUrl",
                                e.target.value
                              )
                            }
                            placeholder="URL hình ảnh"
                          />
                          <CldUploadWidget
                            uploadPreset={UPLOAD_PRESET}
                            onSuccess={(result) => {
                              if (
                                result?.info &&
                                typeof result.info === "object" &&
                                "secure_url" in result.info
                              ) {
                                handleUpdateSentenceImageGroup(
                                  groupIndex,
                                  "imageUrl",
                                  result.info.secure_url as string
                                );
                              }
                            }}
                          >
                            {({ open }) => (
                              <Button
                                type="button"
                                variant="secondaryOutline"
                                onClick={() => open()}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                          </CldUploadWidget>
                        </div>
                        {/* image preview removed per request */}
                      </div>

                      {/* Audio URL */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Audio (không bắt buộc)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={group.audioUrl}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleUpdateSentenceImageGroup(
                                groupIndex,
                                "audioUrl",
                                e.target.value
                              )
                            }
                            placeholder="URL audio"
                          />
                          <CldUploadWidget
                            uploadPreset={UPLOAD_PRESET}
                            onSuccess={(result) => {
                              if (
                                result?.info &&
                                typeof result.info === "object" &&
                                "secure_url" in result.info
                              ) {
                                handleUpdateSentenceImageGroup(
                                  groupIndex,
                                  "audioUrl",
                                  result.info.secure_url as string
                                );
                              }
                            }}
                          >
                            {({ open }) => (
                              <Button
                                type="button"
                                variant="secondaryOutline"
                                onClick={() => open()}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                          </CldUploadWidget>
                        </div>
                        {/* audio preview removed per request */}
                      </div>
                    </div>

                    <Separator />

                    {/* Sentences in this group */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Các câu</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddSentenceToGroup(groupIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm câu
                        </Button>
                      </div>

                      {group.sentences.map((sentence, sentenceIndex) => (
                        <Card
                          key={sentenceIndex}
                          className={`border-dashed ${sentence.isActive === false
                            ? "opacity-50 bg-gray-100 border-gray-300"
                            : sentence.id
                              ? "border-green-200 bg-green-50/30"
                              : ""
                            }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                  {sentenceIndex + 1}
                                </span>
                                {sentence.text ? (
                                  <span className="truncate max-w-[300px]">
                                    {sentence.text}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground italic">
                                    Câu mới chưa có nội dung
                                  </span>
                                )}
                                {sentence.id && (
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (ID: {sentence.id})
                                  </span>
                                )}
                                {sentence.isActive === false && (
                                  <Badge variant="secondary" className="ml-2">
                                    Đã ẩn
                                  </Badge>
                                )}
                              </CardTitle>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Xác nhận xóa
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa câu này?
                                      {sentence.id &&
                                        " Câu này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveSentenceFromGroup(
                                          groupIndex,
                                          sentenceIndex
                                        )
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Câu tiếng Anh <RequiredField />
                                </label>
                                <Textarea
                                  value={sentence.text}
                                  onChange={(e) =>
                                    handleUpdateSentenceInGroup(
                                      groupIndex,
                                      sentenceIndex,
                                      "text",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nhập câu tiếng Anh"
                                  rows={2}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Nghĩa tiếng Việt <RequiredField />
                                </label>
                                <Textarea
                                  value={sentence.meaningVi}
                                  onChange={(e) =>
                                    handleUpdateSentenceInGroup(
                                      groupIndex,
                                      sentenceIndex,
                                      "meaningVi",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nhập nghĩa tiếng Việt"
                                  rows={2}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Gợi ý tiếng Việt
                                </label>
                                <Input
                                  value={sentence.hintVi}
                                  onChange={(e) =>
                                    handleUpdateSentenceInGroup(
                                      groupIndex,
                                      sentenceIndex,
                                      "hintVi",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nhập gợi ý"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Audio câu
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    value={sentence.audioUrl}
                                    onChange={(e) =>
                                      handleUpdateSentenceInGroup(
                                        groupIndex,
                                        sentenceIndex,
                                        "audioUrl",
                                        e.target.value
                                      )
                                    }
                                    placeholder="URL audio"
                                  />
                                  <CldUploadWidget
                                    uploadPreset={UPLOAD_PRESET}
                                    onSuccess={(result) => {
                                      if (
                                        result?.info &&
                                        typeof result.info === "object" &&
                                        "secure_url" in result.info
                                      ) {
                                        handleUpdateSentenceInGroup(
                                          groupIndex,
                                          sentenceIndex,
                                          "audioUrl",
                                          result.info.secure_url as string
                                        );
                                      }
                                    }}
                                  >
                                    {({ open }) => (
                                      <Button
                                        type="button"
                                        variant="secondaryOutline"
                                        onClick={() => open()}
                                      >
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </CldUploadWidget>
                                </div>
                                {/* sentence audio preview removed per request */}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Bulk Mode Actions */}
          <div className="flex justify-between items-center sticky bottom-0 bg-background pt-4 pb-2 border-t">
            <Button
              type="button"
              variant="secondaryOutline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleBulkSubmit}
              disabled={isSubmitting || sentenceImageGroups.length === 0 || sentenceGroupErrors.size > 0}
              variant="primary"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  {sentenceGroupErrors.size > 0 && "⚠️ "}
                  Lưu tất cả ({sentenceImageGroups.length} thẻ)
                </>
              )}
            </Button>
          </div>

          {/* Import Dialog */}
          <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <AlertDialogContent className="max-w-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-between">
                  <span>Import câu từ Excel</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowImportHelpDialog(true)}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Chọn file Excel và thư mục chứa ảnh/audio để import
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                {/* Excel File Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    File Excel <RequiredField />
                  </label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelFileSelect}
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
                      Thư mục ảnh/audio (tùy chọn)
                    </label>
                    <Input
                      type="file"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({ webkitdirectory: "", directory: "" } as any)}
                      multiple
                      onChange={handleFolderSelect}
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
                  <div className="rounded-md border p-4 space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        Files cần thiết: {importPreview.neededFiles.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {importPreview.neededFiles.join(", ")}
                      </p>
                    </div>
                    {selectedFolderFiles && (
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          Files tìm thấy: {importPreview.matchedFiles.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {importPreview.matchedFiles.join(", ")}
                        </p>
                      </div>
                    )}
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
                  Import
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
                  Hướng dẫn Import Excel - Câu
                </DialogTitle>
                <DialogDescription>
                  Hướng dẫn chi tiết cách chuẩn bị và import file Excel câu (sentences)
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
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">imgSentence</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">audioImg</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen01</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen1Vi</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen1Audio</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen02</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen2Vi</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen2Audio</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen03</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen3Vi</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen3Audio</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen04</th>
                          <th className="border-r p-2 font-medium text-left whitespace-nowrap">sen4Vi</th>
                          <th className="p-2 font-medium text-left whitespace-nowrap">sen4Audio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-Sentence.png</td>
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-Sentence-a.mp3</td>
                          <td className="border-r p-2 whitespace-nowrap">Hi. How are you?</td>
                          <td className="border-r p-2 whitespace-nowrap">Xin chào. Bạn khỏe không?</td>
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-Sentence1.mp3</td>
                          <td className="border-r p-2 whitespace-nowrap">Hi. I'm Fine, thank you.</td>
                          <td className="border-r p-2 whitespace-nowrap">Xin chào. Tôi ổn, cảm ơn.</td>
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-Sentence2.mp3</td>
                          <td className="border-r p-2 whitespace-nowrap">Goodbye.</td>
                          <td className="border-r p-2 whitespace-nowrap">Tạm biệt.</td>
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-Sentence3.mp3</td>
                          <td className="border-r p-2 whitespace-nowrap">Bye.</td>
                          <td className="border-r p-2 whitespace-nowrap">Tạm biệt.</td>
                          <td className="p-2 whitespace-nowrap">g3-u1-Sentence4.mp3</td>
                        </tr>
                        <tr className="border-t bg-muted/30">
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-u2-Sentence.png</td>
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-u2-Sentence-a.mp3</td>
                          <td className="border-r p-2 whitespace-nowrap">Hi.</td>
                          <td className="border-r p-2 whitespace-nowrap">Xin chào.</td>
                          <td className="border-r p-2 whitespace-nowrap">g3-u1-u2-Sentence1.mp3</td>
                          <td className="border-r p-2 whitespace-nowrap"></td>
                          <td className="border-r p-2 whitespace-nowrap"></td>
                          <td className="border-r p-2 whitespace-nowrap"></td>
                          <td className="border-r p-2 whitespace-nowrap"></td>
                          <td className="border-r p-2 whitespace-nowrap"></td>
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
                      <span className="font-medium min-w-[120px]">imgSentence:</span>
                      <span className="text-muted-foreground">Tên file ảnh thẻ câu (được yêu cầu)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium min-w-[120px]">audioImg:</span>
                      <span className="text-muted-foreground">Tên file audio của ảnh thẻ (tùy chọn)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium min-w-[120px]">sen01, sen02...:</span>
                      <span className="text-muted-foreground">Câu tiếng Anh (tối thiểu 1 câu, tối đa 4 câu)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium min-w-[120px]">sen1Vi, sen2Vi...:</span>
                      <span className="text-muted-foreground">Nghĩa tiếng Việt của câu (tùy theo câu tiếng Anh)</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium min-w-[120px]">sen1Audio, sen2Audio...:</span>
                      <span className="text-muted-foreground">File audio phát âm câu (tùy chọn)</span>
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
                      <strong className="text-foreground">Nếu không có assets</strong>, bỏ qua bước chọn thư mục trong dialog import
                    </li>
                  </ul>
                </div>

                {/* Section 4: Important Notes */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">4. Lưu ý quan trọng</h3>
                  <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                    <li>
                      Mỗi dòng trong Excel = 1 <strong className="text-foreground">Thẻ câu (Sentence Image)</strong>
                    </li>
                    <li>
                      Mỗi thẻ câu có thể chứa từ <strong className="text-foreground">1 đến 4 câu</strong> con
                    </li>
                    <li>
                      Nếu một câu không có nghĩa tiếng Việt hoặc audio, để trống ô tương ứng
                    </li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        /* Single Mode Form */
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
            className="space-y-6"
          >
            {/* Grade and Topic Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Grade Selection */}
              <FormItem>
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
                    onValueChange={(value) => {
                      setSelectedGrade(value);
                      form.setValue("topicId", 0);
                    }}
                    placeholder="Chọn khối lớp"
                    searchPlaceholder="Tìm kiếm khối lớp..."
                    emptyText="Không tìm thấy khối lớp."
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

              {/* Topic Selection */}
              <FormField
                control={formControl}
                name="topicId"
                render={({ field }) => (
                  <FormItem>
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
                        disabled={isTopicLocked}
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

            {/* Image URL */}
            <FormField
              control={formControl}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hình ảnh <RequiredField />
                  </FormLabel>
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

            {/* Audio URL */}
            <FormField
              control={formControl}
              name="audioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File âm thanh chính (tùy chọn)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} placeholder="URL âm thanh" />
                      <CldUploadWidget
                        uploadPreset={UPLOAD_PRESET}
                        onSuccess={handleMainAudioUpload}
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
                    File âm thanh phát âm mẫu cho toàn bộ hình ảnh
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={formControl}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Trạng thái hoạt động</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            {/* Sentences Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <TypographyH3>Danh sách câu</TypographyH3>
                  <p className="text-sm text-muted-foreground">
                    {isTopicLocked && existingSentencesCount > 0
                      ? `Đang hiển thị ${existingSentencesCount} câu có sẵn của chủ đề này. Bạn có thể chỉnh sửa hoặc thêm câu mới.`
                      : isTopicLocked
                        ? "Chủ đề này chưa có câu nào. Hãy thêm các câu mới."
                        : "Thêm các câu liên quan đến hình ảnh (tối thiểu 1 câu)"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSentence}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm câu
                </Button>
              </div>

              {fields.map((field, index) => {
                const isExpanded = expandedCards.has(field.id);
                const sentenceText = form.watch(`sentences.${index}.text`);
                const isActive = form.watch(`sentences.${index}.isActive`);
                const previewText = sentenceText || `Câu ${index + 1}`;

                return (
                  <Card
                    key={field.id}
                    className={isActive === false ? "opacity-50 bg-gray-100 border-gray-300" : ""}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <button
                          type="button"
                          onClick={() => toggleCardExpanded(field.id)}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="truncate max-w-md">{previewText}</span>
                          {isActive === false && (
                            <Badge variant="secondary" className="ml-2">
                              Đã ẩn
                            </Badge>
                          )}
                        </button>
                        {fields.length > 1 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="dangerOutline"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Bạn có chắc chắn muốn xóa?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này sẽ xóa câu vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveSentence(index)}
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </CardTitle>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="space-y-4">
                        {/* Sentence Text */}
                        <FormField
                          control={formControl}
                          name={`sentences.${index}.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Câu tiếng Anh <RequiredField />
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Nhập câu tiếng Anh"
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Meaning in Vietnamese */}
                        <FormField
                          control={formControl}
                          name={`sentences.${index}.meaningVi`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Nghĩa tiếng Việt <RequiredField />
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Nhập nghĩa tiếng Việt"
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Audio URL */}
                        <FormField
                          control={formControl}
                          name={`sentences.${index}.audioUrl`}
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
                                    onSuccess={(result) =>
                                      handleSentenceAudioUpload(index, result)
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

                        {/* Hint in Vietnamese */}
                        <FormField
                          control={formControl}
                          name={`sentences.${index}.hintVi`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gợi ý</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Nhập gợi ý" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Active Status for each sentence */}
                        <FormField
                          control={formControl}
                          name={`sentences.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Trạng thái hoạt động</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    )}
                  </Card>
                );
              })}
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
      )}

      {/* Progress Reset Dialog - Shared for both modes */}
      <AlertDialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Cảnh báo: Câu đã có tiến trình học</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Các câu sau đã có người dùng học và ghi nhận tiến trình.
                  Việc cập nhật có thể ảnh hưởng đến trải nghiệm học tập của họ.
                </p>

                <div className="rounded-lg border bg-muted p-4 space-y-2">
                  {sentencesWithProgress.map((s) => (
                    <div key={s.id} className="flex justify-between items-center">
                      <span className="font-medium">{s.text}</span>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{s.progressCount} lượt học</span>
                        {s.masteredCount > 0 && (
                          <span className="text-green-600">✓ {s.masteredCount} đã thuộc</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Bạn muốn làm gì với tiến trình học?</p>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="resetProgress"
                      checked={resetProgress}
                      onChange={(e) => setResetProgress(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="resetProgress" className="text-sm">
                      <span className="font-medium">Reset tiến trình học</span>
                      <p className="text-muted-foreground">
                        Xóa toàn bộ tiến trình học của câu này (reviewCount, isMastered).
                        Người dùng sẽ phải học lại từ đầu.
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowProgressDialog(false);
              setPendingBulkContext(null);
              setSentencesWithProgress([]);
              setPendingUpdates(new Map());
              setResetProgress(false);
              setIsSubmitting(false);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmProgressReset}
              className={resetProgress ? "bg-destructive hover:bg-destructive/90" : ""}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetProgress ? "Cập nhật & Reset" : "Chỉ cập nhật"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
