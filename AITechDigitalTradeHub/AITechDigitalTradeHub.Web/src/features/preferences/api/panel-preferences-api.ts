import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import type { PanelKey, PanelPreference } from "@/store/panel-preferences-store";

export const panelPreferencesApi = {
  get(panelKey: PanelKey) {
    return apiRequest<PanelPreference>(apiEndpoints.users.panelPreference(panelKey));
  },
  update(panelKey: PanelKey, preference: PanelPreference) {
    return apiRequest<PanelPreference>(apiEndpoints.users.panelPreference(panelKey), {
      method: "PUT",
      body: JSON.stringify(preference)
    });
  }
};
