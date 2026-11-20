import { getProfile } from "@/actions/user/profile";
import Profile from "./_components/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  return <Profile profile={profile} />;
}
