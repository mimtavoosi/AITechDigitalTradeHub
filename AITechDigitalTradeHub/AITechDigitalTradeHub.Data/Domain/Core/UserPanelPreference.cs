using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class UserPanelPreference : BaseEntity
    {
        public long UserId { get; set; }
        public User User { get; set; }

        [MaxLength(40)]
        public string PanelKey { get; set; }

        [MaxLength(40)]
        public string ThemeKey { get; set; } = "default";

        [MaxLength(24)]
        public string DensityKey { get; set; } = "comfortable";

        [MaxLength(24)]
        public string FontScale { get; set; } = "normal";

        [MaxLength(24)]
        public string FontFamily { get; set; } = "vazirmatn";

        [MaxLength(24)]
        public string SidebarMode { get; set; } = "dark";

        public string? CardOrderJson { get; set; }

        public string? HiddenItemsJson { get; set; }
    }
}
