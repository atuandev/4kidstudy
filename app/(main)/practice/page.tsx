import { getProfile } from "@/actions/user/profile";
import { getPracticeStatistics } from "@/actions/attempt";
import Units from "./_components/units";

export default async function PracticePage() {
  const profile = await getProfile();
  const stats = await getPracticeStatistics();
  return <Units profile={profile} stats={stats} />;
}
