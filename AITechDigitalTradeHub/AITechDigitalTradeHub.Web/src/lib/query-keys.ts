type ProjectFilters = {
  searchText?: string;
  categoryId?: number;
  skillTagId?: number;
  projectType?: string;
  locationMode?: string;
  minBudget?: number;
  maxBudget?: number;
  sortQuery?: string;
};

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    mine: () => ["projects", "mine"] as const,
    myProposals: () => ["projects", "my-proposals"] as const,
    detail: (id: number | null) => ["projects", "detail", id] as const,
    publicList: (filters: ProjectFilters) => ["projects", "public", filters] as const,
    featured: () => ["projects", "home-featured"] as const,
    conversation: (id: number | null) => ["projects", "detail", id, "conversation"] as const,
    disputes: (id: number | null) => ["projects", "detail", id, "disputes"] as const,
    documents: (id: number | null) => ["projects", "detail", id, "documents"] as const,
    activity: (id: number | null) => ["projects", "detail", id, "activity"] as const,
    admin: (status?: string) => status ? ["projects", "admin", status] as const : ["projects", "admin"] as const,
    adminDisputes: () => ["projects", "admin", "disputes"] as const
  },
  categories: {
    all: ["categories"] as const,
    projectForm: () => ["categories", "project-form"] as const,
    publicProjects: () => ["categories", "public-projects"] as const
  },
  tags: {
    all: ["tags"] as const,
    projectForm: () => ["tags", "project-form"] as const,
    publicProjects: () => ["tags", "public-projects"] as const
  },
  finance: {
    myWallet: () => ["finance", "wallet", "me"] as const
  },
  users: {
    projectProfile: (userId: number | null) => ["users", "project-profile", userId] as const
  },
  listings: {
    publicList: () => ["listings", "public"] as const
  },
  company: {
    organizations: () => ["company", "organizations"] as const,
    projects: (organizationId: number) => ["company", "projects", organizationId] as const,
    members: (organizationId: number) => ["company", "members", organizationId] as const
  }
};
