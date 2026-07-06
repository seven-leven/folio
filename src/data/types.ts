/** Status of a portfolio item — controls whether a card is a live link. */
export type ItemStatus = "done" | "wip" | "planned";

/** A single portfolio entry (design, coding project, art album, etc.). */
export interface PortfolioItem {
  title: string;
  description: string;
  image: string;
  /** Internal route ("/architecture/design-1") or external URL. Empty = no link yet. */
  link?: string;
  status: ItemStatus;
}

/** A titled group of items rendered as one section on a page. */
export interface ItemGroup {
  title: string;
  items: PortfolioItem[];
}

export interface SocialLink {
  label: string;
  url: string;
}
