"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload, Plus, Trash2 } from "lucide-react";
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
  createSentenceImage,
  getSentenceImage,
  updateSentenceImage,
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

const GRADES = [
  { value: "GRADE_1", label: "Lớp 1" },
  { value: "GRADE_2", label: "Lớp 2" },
  { value: "GRADE_3", label: "Lớp 3" },
  { value: "GRADE_4", label: "Lớp 4" },
  { value: "GRADE_5", label: "Lớp 5" },
];

export default function SentenceFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const sentenceImageId = searchParams.get("id");
  const isEditMode = !!sentenceImageId;

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

        if (isEditMode) {
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
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sentenceImageId, isEditMode]);

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
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = data;
        const created = await createSentenceImage(createData);
        if (created) {
          toast.success("Tạo mới thành công");
        } else {
          toast.error("Tạo mới thất bại");
        }
      }
      router.push("/admin/sentences");
      router.refresh();
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
        toast.error(isEditMode ? "Cập nhật thất bại" : "Tạo mới thất bại");
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
    router.back();
  }

  function handleAddSentence() {
    const currentSentences = form.getValues("sentences");
    const nextOrder = currentSentences.length;
    append({
      text: "",
      meaningVi: "",
      hintVi: "",
      audioUrl: "",
      order: nextOrder,
      isActive: true,
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
                />
              </FormControl>
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
                    />
                  </FormControl>
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
                <FormDescription>Hình ảnh minh họa cho các câu</FormDescription>
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
                  Thêm các câu liên quan đến hình ảnh (tối thiểu 1 câu)
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

            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Câu {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="dangerOutline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
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
              </Card>
            ))}
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
