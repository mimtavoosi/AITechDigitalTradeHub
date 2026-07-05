import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/features/categories/api/categories-api";
import { getMyWallet } from "@/features/finance/api/finance-api";
import {
  getMyProjects,
  getMyProposals,
  getProject,
  getProjectActivity,
  getProjectConversation,
  getProjectDisputes,
  getProjectDocuments
} from "@/features/projects/api/projects-api";
import { getTags } from "@/features/tags/api/tags-api";
import { queryKeys } from "@/lib/query-keys";

export function useProjectWorkspaceQueries(selectedProjectId: number | null) {
  const queryClient = useQueryClient();
  const enabled = selectedProjectId !== null;

  const projectsQuery = useQuery({ queryKey: queryKeys.projects.mine(), queryFn: getMyProjects });
  const myProposalsQuery = useQuery({ queryKey: queryKeys.projects.myProposals(), queryFn: getMyProposals });
  const walletQuery = useQuery({ queryKey: queryKeys.finance.myWallet(), queryFn: getMyWallet });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.projectForm(),
    queryFn: () => getCategories({ pageSize: 200 })
  });
  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.projectForm(),
    queryFn: () => getTags({ pageSize: 300 })
  });
  const selectedProjectQuery = useQuery({
    queryKey: queryKeys.projects.detail(selectedProjectId),
    queryFn: () => getProject(selectedProjectId ?? 0),
    enabled
  });
  const conversationQuery = useQuery({
    queryKey: queryKeys.projects.conversation(selectedProjectId),
    queryFn: () => getProjectConversation(selectedProjectId ?? 0),
    enabled
  });
  const disputesQuery = useQuery({
    queryKey: queryKeys.projects.disputes(selectedProjectId),
    queryFn: () => getProjectDisputes(selectedProjectId ?? 0),
    enabled
  });
  const documentsQuery = useQuery({
    queryKey: queryKeys.projects.documents(selectedProjectId),
    queryFn: () => getProjectDocuments(selectedProjectId ?? 0),
    enabled
  });
  const activityQuery = useQuery({
    queryKey: queryKeys.projects.activity(selectedProjectId),
    queryFn: () => getProjectActivity(selectedProjectId ?? 0),
    enabled
  });

  function refreshSelected() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(selectedProjectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.conversation(selectedProjectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.disputes(selectedProjectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(selectedProjectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.activity(selectedProjectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.finance.myWallet() });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects.myProposals() });
  }

  return {
    projectsQuery,
    myProposalsQuery,
    selectedProjectQuery,
    walletQuery,
    categoriesQuery,
    tagsQuery,
    conversationQuery,
    disputesQuery,
    documentsQuery,
    activityQuery,
    refreshSelected
  };
}
