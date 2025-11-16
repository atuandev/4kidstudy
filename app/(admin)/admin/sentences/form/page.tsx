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
  createSentenceImage,
  getSentenceImage,
  getSentenceImagesByTopicId,
  updateSentenceImage,
  bulkCreateSentences,
  updateSentence,
  deleteSentence,
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

export default function SentenceFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [existingSentencesCount, setExistingSentencesCount] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedGrade: storeGrade, selectedTopicId: storeTopicId, clearSelection } = useSentenceFormStore();

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

          // Flatten all sentences from all sentence images
          const allSentences = existingSentenceImages.flatMap((img) =>
            img.sentences.map((s) => ({
              id: s.id,
              text: s.text,
              meaningVi: s.meaningVi ?? "",
              hintVi: s.hintVi ?? "",
              audioUrl: s.audioUrl ?? "",
              order: s.order,
              isActive: s.isActive,
            }))
          );

          setExistingSentencesCount(allSentences.length);

          // If there are existing sentences, show them for editing/adding more
          if (allSentences.length > 0) {
            form.reset({
              topicId: parsedTopicId,
              imageUrl: existingSentenceImages[0]?.imageUrl || "",
              audioUrl: existingSentenceImages[0]?.audioUrl ?? "",
              order: 0,
              isActive: true,
              sentences: allSentences,
            });
          } else {
            // No existing sentences, start with empty form
            form.reset({
              topicId: parsedTopicId,
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
            });
          }
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

  const onSubmit = async (data: CreateSentenceImageFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updated = await updateSentenceImage(
          parseInt(sentenceImageId),
          data
        );
        if (updated) {
          toast.success("Cập nhật thành công");
        } else {
          toast.error("Cập nhật thất bại");
        }
        clearSelection();
        router.push("/admin/sentences");
        router.refresh();
      } else if (isTopicLocked) {
        // Bulk create/update mode
        // Split sentences into existing (with id) and new (without id)
        const existingSentences = data.sentences.filter(s => s.id);
        const newSentences = data.sentences.filter(s => !s.id);

        // Update existing sentences individually
        if (existingSentences.length > 0) {
          await Promise.all(
            existingSentences.map(sentence => 
              updateSentence(sentence.id!, {
                text: sentence.text,
                meaningVi: sentence.meaningVi,
                hintVi: sentence.hintVi,
                audioUrl: sentence.audioUrl,
                order: sentence.order,
                isActive: sentence.isActive,
              })
            )
          );
        }

        // Create new sentences if any
        if (newSentences.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const cleanedNewSentences = newSentences.map(({ id, order, ...sentence }) => sentence);
          // DO NOT send order for new sentences - let backend auto-assign
          
          const sentenceImageData = {
            imageUrl: data.imageUrl,
            audioUrl: data.audioUrl,
            isActive: data.isActive,
            sentences: cleanedNewSentences,
          };

          await bulkCreateSentences(data.topicId, [sentenceImageData]);
        }
        
        toast.success("Cập nhật thành công");
        clearSelection();
        // Reload the page to fetch updated data
        router.refresh();
        window.location.reload();
      } else {
        // Normal create mode (single sentence image)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = data;
        
        // Remove 'id' field from all sentences
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const cleanedSentences = createData.sentences.map(({ id, ...sentence }) => sentence);
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
    
    // If sentence has an id, it exists in the database and needs to be deleted
    if (sentence.id) {
      try {
        await deleteSentence(sentence.id);
        toast.success("Đã xóa câu thành công");
        remove(index);
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
          : "Thêm câu với hình ảnh mới"}
      </TypographyH3>

      {/* Form */}
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

          {/* Order and Active Status */}
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

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
              const previewText = sentenceText || `Câu ${index + 1}`;
              
              return (
              <Card key={field.id}>
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
                    </button>
                    {fields.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="dangerOutline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này sẽ xóa câu vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveSentence(index)}>Xóa</AlertDialogAction>
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
                        <FormLabel>Nghĩa tiếng Việt</FormLabel>
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

                  {/* Hint in Vietnamese */}
                  <FormField
                    control={formControl}
                    name={`sentences.${index}.hintVi`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gợi ý tiếng Việt</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nhập gợi ý" />
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
                        <FormLabel>File âm thanh</FormLabel>
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

                  {/* Order and Active Status for each sentence */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={formControl}
                      name={`sentences.${index}.order`}
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
                  </div>
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
              {/* {isEditMode ? "Cập nhật" : "Tạo mới"}
               */}
               Cập nhật
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
