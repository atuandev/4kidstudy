'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CopyIcon, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { DataTableColumnHeader } from '../_components/data-table-column-header';

const roleMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'purple';
  }
> = {
  ADMIN: { label: 'Quản trị viên', variant: 'destructive' },
  LEARNER: { label: 'Học viên', variant: 'default' },
};

const genderMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'purple';
  }
> = {
  MALE: { label: 'Nam', variant: 'default' },
  FEMALE: { label: 'Nữ', variant: 'purple' },
  UNSET: { label: 'Chưa xác định', variant: 'outline' },
};

function DeleteUserDialog({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleDelete() {
    // TODO: Implement delete user action
    // console.log('Delete user:', user.id);
    setIsOpen(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        className="text-red-600"
        onSelect={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <Trash className="mr-2 h-4 w-4" />
        Xóa
      </DropdownMenuItem>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Người dùng này sẽ bị xóa vĩnh viễn
            khỏi hệ thống cùng với tất cả dữ liệu liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[60px]">{row.getValue('id')}</div>,
    filterFn: (row, id, value) => {
      const rowId = String(row.getValue(id));
      return rowId.includes(value);
    },
  },
  {
    accessorKey: 'avatarUrl',
    header: 'Ảnh đại diện',
    cell: ({ row }) => {
      const avatarUrl = row.getValue('avatarUrl') as string | undefined;
      const name = row.getValue('name') as string;
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className="max-w-[200px] truncate font-medium" title={name}>
          {name}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return (
        <div className="max-w-[250px] truncate" title={email}>
          {email}
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const roleInfo = roleMap[role] || {
        label: role,
        variant: 'outline' as const,
      };
      return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giới tính" />
    ),
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string;
      const genderInfo = genderMap[gender] || {
        label: gender,
        variant: 'outline' as const,
      };
      return <Badge variant={genderInfo.variant}>{genderInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'xp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="XP" />
    ),
    cell: ({ row }) => {
      const xp = row.getValue('xp') as number;
      return <div className="text-center font-medium">{xp.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'streakDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Streak" />
    ),
    cell: ({ row }) => {
      const streak = row.getValue('streakDays') as number;
      return (
        <div className="text-center">
          {streak > 0 ? (
            <span className="font-medium text-orange-600">{streak} ngày</span>
          ) : (
            <span className="text-muted-foreground">0 ngày</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div>{date.toLocaleDateString('vi-VN')}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function ActionsCell({ row }) {
      const user = row.original;
      const router = useRouter();

      function handleEdit() {
        router.push(`/admin/users/form?id=${user.id}`);
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(user.id.toString())
              }
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DeleteUserDialog user={user} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

