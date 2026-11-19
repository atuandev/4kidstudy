
'use client';



import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Loader2 } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { createTopic, getTopicById, updateTopic } from '@/actions/topic';
import { RequiredField } from '@/components/form/required-field';
import { TypographyH3 } from '@/components/typography';
import {
  CreateTopicFormData,
  CreateTopicSchema,
  topicStatusLabels,
  gradeLabels,
} from '@/schemas/topic';
import { UPLOAD_PRESET } from '@/lib/constants';
import { useTopicFormStore } from '@/lib/stores/topic-form-store';
import type { GradeLevel } from '@4kidstudy/contracts';

export default function TopicFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedGrade, clearSelectedGrade } = useTopicFormStore();

  const topicId = searchParams.get('id');
  const isEditMode = !!topicId;

  const form = useForm<CreateTopicFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateTopicSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      grade: undefined,
      coverImage: '',
      isActive: true,
    },
  });

  // Type-safe control for FormField components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formControl = form.control as any;

  // Fetch topic data on mount for edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (isEditMode) {
          const topic = await getTopicById(parseInt(topicId));
          form.reset({
            title: topic.title,
            description: topic.description ?? '',
            grade: topic.grade,
            coverImage: topic.coverImage ?? '',
            order: topic.order,
            isActive: topic.isActive,
          });
        } else if (selectedGrade) {
          // If creating new topic and grade is selected from filter, pre-fill it
          form.setValue('grade', selectedGrade as GradeLevel);
          toast.success(`Đã chọn lớp: ${gradeLabels[selectedGrade as keyof typeof gradeLabels]}`);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId, isEditMode, selectedGrade, form]);

  const onSubmit = async (data: CreateTopicFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updatedTopic = await updateTopic(parseInt(topicId), data);
        if (updatedTopic) {
          toast.success('Cập nhật unit thành công');
        } else {
          toast.error('Cập nhật unit thất bại');
        }
      } else {
        // Remove order field when creating to let backend auto-generate it
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { order, ...createData } = data;
        const createdTopic = await createTopic(createData);
        if (createdTopic) {
          toast.success('Tạo unit thành công');
        } else {
          toast.error('Tạo unit thất bại');
        }
      }
      clearSelectedGrade();
      router.push('/admin/topics');
      router.refresh();
    } catch (error) {
      console.error('Failed to save topic:', error);

      // Handle specific error messages from backend
      const errorMessage = (
        error as { payload?: { message?: string | string[] } }
      )?.payload?.message;

      if (typeof errorMessage === 'string') {
        // Check for order conflict error
        if (
          errorMessage.includes('Unique constraint') ||
          errorMessage.includes('already exists')
        ) {
          toast.error(
            'Unit với thứ tự này đã tồn tại trong lớp. Vui lòng chọn thứ tự khác.'
          );
          return;
        }
        // Show the backend error message
        toast.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        // Handle validation errors array
        toast.error(errorMessage.join(', '));
      } else {
        // Generic error message
        toast.error(isEditMode ? 'Cập nhật unit thất bại' : 'Tạo unit thất bại');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageUpload = (result: any) => {
    if (result?.info?.secure_url) {
      form.setValue('coverImage', result.info.secure_url);
    }
  };

  const handleCancel = () => {
    clearSelectedGrade();
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
              <BreadcrumbLink href="/admin/topics">Units</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TypographyH3>
        {isEditMode ? 'Chỉnh sửa unit' : 'Thêm unit mới'}
      </TypographyH3>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="space-y-6"
        >
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
                  <Input {...field} placeholder="Nhập tiêu đề unit" />
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
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Nhập mô tả về unit"
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  Mô tả ngắn gọn về nội dung unit này
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grade */}
          <FormField
            control={formControl}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Lớp <RequiredField />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(gradeLabels).map(([value, label]) => (
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

          <Separator />

          {/* Cover Image */}
          <FormField
            control={formControl}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hình ảnh bìa</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} placeholder="URL hình ảnh bìa" />
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
                  Hình ảnh đại diện cho unit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Order and Status */}
          <div
            className={`grid gap-4 ${
              isEditMode ? 'md:grid-cols-2' : 'md:grid-cols-1'
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
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(topicStatusLabels).map(
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
              {isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

