// app/password/page.tsx
import ChangePasswordForm from "./_components/ChangePasswordForm";

export default function PasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <ChangePasswordForm />
      </div>
    </div>
  );
}