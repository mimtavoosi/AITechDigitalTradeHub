using AITechDigitalTradeHub.Api.Services;
using Xunit;

namespace AITechDigitalTradeHub.Tests;

public class EducationProgressCalculatorTests
{
    [Theory]
    [InlineData(0, 0, 0)]
    [InlineData(4, 0, 0)]
    [InlineData(4, 1, 25)]
    [InlineData(3, 2, 67)]
    [InlineData(4, 4, 100)]
    [InlineData(4, 10, 100)]
    [InlineData(4, -1, 0)]
    public void Calculate_UsesOnlyCompletedLessons(int lessonCount, int completedCount, byte expected)
    {
        Assert.Equal(expected, EducationProgressCalculator.Calculate(lessonCount, completedCount));
    }
}
