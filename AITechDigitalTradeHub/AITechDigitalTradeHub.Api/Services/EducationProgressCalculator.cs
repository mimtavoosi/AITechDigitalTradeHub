namespace AITechDigitalTradeHub.Api.Services
{
    public static class EducationProgressCalculator
    {
        public static byte Calculate(int activeLessonCount, int completedLessonCount)
        {
            if (activeLessonCount <= 0)
            {
                return 0;
            }

            var normalizedCompletedCount = Math.Clamp(completedLessonCount, 0, activeLessonCount);
            return (byte)Math.Round(
                normalizedCompletedCount * 100m / activeLessonCount,
                MidpointRounding.AwayFromZero);
        }
    }
}
