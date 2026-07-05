using AITechDigitalTradeHub.Api.ViewModels.Auth;
using AITechDigitalTradeHub.Api.ViewModels.Marketplace;
using AITechDigitalTradeHub.Api.ViewModels.Projects;
using AITechDigitalTradeHub.Api.ViewModels.Reviews;
using AITechDigitalTradeHub.Api.ViewModels.Support;
using FluentValidation;

namespace AITechDigitalTradeHub.Api.Validation;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(80);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(160);
        RuleFor(x => x.MobileNumber).NotEmpty().Matches(@"^\+?[0-9]{10,15}$");
        RuleFor(x => x.Username).NotEmpty().Length(3, 80).Matches(@"^[\p{L}\p{N}._-]+$");
        RuleFor(x => x.Password).NotEmpty().Length(8, 128)
            .Matches("[A-Z]").WithMessage("رمز عبور باید حداقل یک حرف بزرگ داشته باشد")
            .Matches("[a-z]").WithMessage("رمز عبور باید حداقل یک حرف کوچک داشته باشد")
            .Matches("[0-9]").WithMessage("رمز عبور باید حداقل یک عدد داشته باشد");
    }
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.UsernameOrEmail).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(128);
    }
}

public sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().MaximumLength(128);
        RuleFor(x => x.NewPassword).NotEmpty().Length(8, 128)
            .NotEqual(x => x.CurrentPassword).WithMessage("رمز عبور جدید باید با رمز فعلی متفاوت باشد");
    }
}

public sealed class ProjectUpsertRequestValidator : AbstractValidator<ProjectUpsertRequest>
{
    public ProjectUpsertRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(20_000);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.ProjectType).IsInEnum();
        RuleFor(x => x.LocationMode).IsInEnum();
        RuleFor(x => x.Currency).NotEmpty().Length(3).Matches("^[A-Z]{3}$");
        RuleFor(x => x.BudgetMin).GreaterThanOrEqualTo(0).When(x => x.BudgetMin.HasValue);
        RuleFor(x => x.BudgetMax).GreaterThanOrEqualTo(0).When(x => x.BudgetMax.HasValue);
        RuleFor(x => x.BudgetMax).GreaterThanOrEqualTo(x => x.BudgetMin!.Value)
            .When(x => x.BudgetMin.HasValue && x.BudgetMax.HasValue);
        RuleFor(x => x.TimelineDays).InclusiveBetween(1, 3650).When(x => x.TimelineDays.HasValue);
        RuleForEach(x => x.SkillTagIds).GreaterThan(0);
    }
}

public sealed class CreateProposalRequestValidator : AbstractValidator<CreateProposalRequest>
{
    public CreateProposalRequestValidator()
    {
        RuleFor(x => x.ProposedPrice).GreaterThan(0);
        RuleFor(x => x.ProposedDays).InclusiveBetween(1, 3650);
        RuleFor(x => x.CoverLetter).MaximumLength(10_000);
        RuleFor(x => x.ResumeFileUploadId).GreaterThan(0).When(x => x.ResumeFileUploadId.HasValue);
    }
}

public sealed class ListingUpsertRequestValidator : AbstractValidator<ListingUpsertRequest>
{
    public ListingUpsertRequestValidator()
    {
        RuleFor(x => x.ListingType).IsInEnum();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(20_000);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.PriceType).IsInEnum();
        RuleFor(x => x.Currency).NotEmpty().Length(3).Matches("^[A-Z]{3}$");
        RuleFor(x => x.PriceAmount).GreaterThanOrEqualTo(0).When(x => x.PriceAmount.HasValue);
        RuleFor(x => x.PriceMin).GreaterThanOrEqualTo(0).When(x => x.PriceMin.HasValue);
        RuleFor(x => x.PriceMax).GreaterThanOrEqualTo(x => x.PriceMin!.Value)
            .When(x => x.PriceMin.HasValue && x.PriceMax.HasValue);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
    }
}

public sealed class CreateTicketRequestValidator : AbstractValidator<CreateTicketRequest>
{
    public CreateTicketRequestValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(10_000);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.ReferenceType).MaximumLength(100);
        RuleFor(x => x.ReferenceId).GreaterThan(0).When(x => x.ReferenceId.HasValue);
    }
}

public sealed class CreateTicketMessageRequestValidator : AbstractValidator<CreateTicketMessageRequest>
{
    public CreateTicketMessageRequestValidator()
    {
        RuleFor(x => x.MessageContent).NotEmpty().MaximumLength(10_000);
    }
}

public sealed class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.TargetType).IsInEnum();
        RuleFor(x => x.TargetId).GreaterThan(0);
        RuleFor(x => x.ContextType).IsInEnum();
        RuleFor(x => x.ContextId).GreaterThan(0);
        RuleFor(x => x.Rating).InclusiveBetween((byte)1, (byte)5);
        RuleFor(x => x.Comment).MaximumLength(2_000);
    }
}
