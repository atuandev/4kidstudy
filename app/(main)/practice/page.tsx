import { getProfile } from "@/actions/user/profile";
import Units from "./_components/units";

export default async function PracticePage() {
  const profile = await getProfile();
  return <Units profile={profile} />;
}
