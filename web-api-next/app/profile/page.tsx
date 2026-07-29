import { getUserData, getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { apiUrl } from "@/lib/api/server";

export default async function ProfilePage() {
  // 1. Get the secure token and user data on the server
  const token = await getTokenCookie();
  const userData = await getUserData();

  // 2. If not logged in, redirect to login
  if (!userData || !token) {
    redirect("/login");
  }

  // 3. Fetch health profile from backend using the server-side token
  let healthProfile = null;
  try {
    const response = await fetch(apiUrl("/api/v1/health-profile"), {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const data = await response.json();
    if (data.success) {
      healthProfile = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch health profile:", error);
  }

  // 4. Pass everything to the Client Component
  return <ProfileClient userData={userData} healthProfile={healthProfile} token={token} />;
}



