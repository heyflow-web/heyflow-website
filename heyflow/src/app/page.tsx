import HomeClient from "@/components/HomeClient";
import { getProjects } from "@/lib/notion";

export const revalidate = 60;

export default async function Home() {
  const data = await getProjects();
  const featuredProjects = data.slice(0, 6);

  return <HomeClient projects={featuredProjects} />;
}
