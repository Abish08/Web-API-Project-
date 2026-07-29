import { handleGetAllUsers } from "@/lib/actions/admin/user-action";
import UserTable from "./_components/UserTable"; 
import { User } from "@/lib/api/types";

type Pagination = {
  page?: number;
  limit?: number;
  totalPages?: number;
  total?: number;
};
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
  const search = query.search ? (query.search as string) : "";

  const result = await handleGetAllUsers({ page, limit, search });

  if (!result.success) {
    throw new Error("Failed to load users");
  }

  return (
    <div>
      <UserTable 
        data={(result.data || []) as User[]} 
        pagination={(result.pagination || {}) as Pagination} 
        search={search} 
      />
    </div>
  );
}
