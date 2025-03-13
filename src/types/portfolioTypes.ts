export interface ProjectCardProps {
  title: string;
  description: string;
  link: string;
  image: string;
  side: "left" | "right";
  bgColor: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export interface ProjectGroupProps {
  title: string;
  projects: ProjectCardProps[]; // You can replace 'any' with your project type
}

export interface HorizontalScrollSectionProps {
  title: string;
  projects: Array<{
    title: string;
    description: string;
    link: string;
    image: string;
  }>;
}
