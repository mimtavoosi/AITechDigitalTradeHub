using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
    public class FinanceController : ControllerBase
    {
        private readonly IFinanceRep _financeRep;
        private readonly TheAppContext _context;
        private readonly IUserNotificationService _userNotificationService;

        public FinanceController(IFinanceRep financeRep, TheAppContext context, IUserNotificationService userNotificationService)
        {
            _financeRep = financeRep;
            _context = context;
            _userNotificationService = userNotificationService;
        }

        [HttpGet("wallets/{id:long}")]
        public async Task<IActionResult> GetWallet(long id)
        {
            var result = await _financeRep.GetWalletByIdAsync(id);
            if (!result.Status || result.Result == null)
            {
                return NotFound(result);
            }

            return IsOwnWallet(result.Result) ? Ok(result) : Forbid();
        }

        [HttpGet("wallets/by-owner")]
        public async Task<IActionResult> GetWalletByOwner(
            [FromQuery] string currency = "IRR")
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _financeRep.GetWalletByOwnerAsync(WalletOwnerType.User, userId, currency);
            return result.Status ? Ok(result) : NotFound(result);
        }

        [HttpGet("wallets/me")]
        public async Task<IActionResult> GetOrCreateMyWallet([FromQuery] string currency = "IRR")
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var current = await _financeRep.GetWalletByOwnerAsync(WalletOwnerType.User, userId, currency);
            if (current.Status && current.Result != null)
            {
                return Ok(current);
            }

            var wallet = new Wallet
            {
                OwnerType = WalletOwnerType.User,
                OwnerUserId = userId,
                Currency = currency,
                Status = WalletStatus.Active,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };

            var createResult = await _financeRep.CreateWalletAsync(wallet);
            if (!createResult.Status)
            {
                return BadRequest(createResult);
            }

            return Ok(await _financeRep.GetWalletByIdAsync(createResult.ID));
        }

        [HttpPost("wallets")]
        public async Task<IActionResult> CreateWallet([FromBody] CreateWalletRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var wallet = new Wallet
            {
                OwnerType = WalletOwnerType.User,
                OwnerUserId = userId,
                Currency = request.Currency,
                Status = WalletStatus.Active
            };

            var result = await _financeRep.CreateWalletAsync(wallet);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("wallets/{id:long}/transactions")]
        public async Task<IActionResult> GetTransactions(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            if (!await OwnsWalletAsync(id))
            {
                return Forbid();
            }

            var result = await _financeRep.GetWalletTransactionsAsync(id, pageIndex, pageSize);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("wallets/{id:long}/deposit")]
        public async Task<IActionResult> Deposit(long id, [FromBody] DepositRequest request)
        {
            if (!await OwnsWalletAsync(id))
            {
                return Forbid();
            }

            var result = await _financeRep.DepositAsync(id, request.Amount, request.GatewayRef, request.ReferenceType, request.ReferenceId);
            if (result.Status)
            {
                var wallet = await _context.Wallets.AsNoTracking().SingleOrDefaultAsync(x => x.ID == id);
                if (wallet?.OwnerUserId.HasValue == true)
                {
                    await _userNotificationService.AddInAppAsync(
                        wallet.OwnerUserId.Value,
                        $"واریز مبلغ {request.Amount:N0} {wallet.Currency} به کیف پول شما ثبت شد.",
                        NotificationCategory.Financial,
                        GetCurrentUserId());
                    await _context.SaveChangesAsync();
                }
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("escrows")]
        public async Task<IActionResult> HoldEscrow([FromBody] HoldEscrowRequest request)
        {
            if (!await OwnsWalletAsync(request.PayerWalletId))
            {
                return Forbid();
            }

            var result = await _financeRep.HoldEscrowAsync(
                request.PayerWalletId,
                request.PayeeWalletId,
                request.Amount,
                request.ContextType,
                request.ContextId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("escrows/{id:long}/release")]
        public async Task<IActionResult> ReleaseEscrow(long id)
        {
            if (!await OwnsEscrowParticipantWalletAsync(id))
            {
                return Forbid();
            }

            var escrow = await _financeRep.GetEscrowByIdAsync(id);
            var result = await _financeRep.ReleaseEscrowAsync(id);
            if (result.Status && escrow.Result?.PayeeWallet?.OwnerUserId.HasValue == true)
            {
                await _userNotificationService.AddInAppAsync(
                    escrow.Result.PayeeWallet.OwnerUserId.Value,
                    $"مبلغ Escrow به ارزش {escrow.Result.Amount:N0} {escrow.Result.PayeeWallet.Currency} آزاد شد.",
                    NotificationCategory.Financial,
                    GetCurrentUserId());
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("escrows/{id:long}/refund")]
        public async Task<IActionResult> RefundEscrow(long id)
        {
            if (!await OwnsEscrowParticipantWalletAsync(id))
            {
                return Forbid();
            }

            var escrow = await _financeRep.GetEscrowByIdAsync(id);
            var result = await _financeRep.RefundEscrowAsync(id);
            if (result.Status && escrow.Result?.PayerWallet?.OwnerUserId.HasValue == true)
            {
                await _userNotificationService.AddInAppAsync(
                    escrow.Result.PayerWallet.OwnerUserId.Value,
                    $"مبلغ Escrow به ارزش {escrow.Result.Amount:N0} {escrow.Result.PayerWallet.Currency} به کیف پول شما برگشت داده شد.",
                    NotificationCategory.Financial,
                    GetCurrentUserId());
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("payout-requests")]
        public async Task<IActionResult> RequestPayout([FromBody] PayoutRequest payoutRequest)
        {
            if (!await OwnsWalletAsync(payoutRequest.WalletId))
            {
                return Forbid();
            }

            var result = await _financeRep.RequestPayoutAsync(payoutRequest);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("course-enrollments/{courseId:long}/pay")]
        public async Task<IActionResult> PayCourseEnrollment(long courseId, [FromBody] WalletPaymentRequest request)
        {
            if (!await OwnsWalletAsync(request.WalletId))
            {
                return Forbid();
            }

            var userId = GetCurrentUserId();
            var result = await PayCourseEnrollmentAsync(courseId, userId, request.WalletId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("teacher-bookings/{bookingId:long}/pay")]
        public async Task<IActionResult> PayTeacherBooking(long bookingId, [FromBody] WalletPaymentRequest request)
        {
            if (!await OwnsWalletAsync(request.WalletId))
            {
                return Forbid();
            }

            var userId = GetCurrentUserId();
            var result = await PayTeacherBookingAsync(bookingId, userId, request.WalletId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private async Task<AITechDigitalTradeHub.Data.ResultObjects.BitResultObject> PayCourseEnrollmentAsync(long courseId, long studentUserId, long payerWalletId)
        {
            var result = new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var course = await _context.Courses.SingleOrDefaultAsync(x => x.ID == courseId && x.Status == CourseStatus.Published);
                if (course == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "دوره منتشرشده پیدا نشد";
                    return result;
                }

                if (course.InstructorUserId == studentUserId)
                {
                    result.Status = false;
                    result.ErrorMessage = "مدرس نمی‌تواند دوره خودش را خریداری کند";
                    return result;
                }

                var enrollment = await _context.CourseEnrollments.SingleOrDefaultAsync(x => x.CourseId == courseId && x.StudentUserId == studentUserId);
                if (enrollment?.Status == EnrollmentStatus.Active)
                {
                    result.ID = enrollment.ID;
                    return result;
                }

                enrollment ??= new CourseEnrollment
                {
                    CourseId = courseId,
                    StudentUserId = studentUserId,
                    Status = EnrollmentStatus.PendingPayment,
                    ProgressPercent = 0,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };

                if (enrollment.ID == 0)
                {
                    await _context.CourseEnrollments.AddAsync(enrollment);
                    await _context.SaveChangesAsync();
                }

                if (course.PriceAmount <= 0)
                {
                    enrollment.Status = EnrollmentStatus.Active;
                    enrollment.PaidAmount = 0;
                    enrollment.UpdateDate = DateTime.UtcNow;
                    await _userNotificationService.AddInAppAsync(
                        studentUserId,
                        $"ثبت‌نام شما در دوره «{course.Title}» فعال شد.",
                        NotificationCategory.Education,
                        studentUserId);
                    await _userNotificationService.AddInAppAsync(
                        course.InstructorUserId,
                        $"یک دانشجو در دوره رایگان «{course.Title}» ثبت‌نام کرد.",
                        NotificationCategory.Education,
                        studentUserId);
                    await _context.SaveChangesAsync();
                    await tx.CommitAsync();
                    result.ID = enrollment.ID;
                    return result;
                }

                var paymentResult = await TransferWalletPaymentAsync(
                    payerWalletId,
                    course.InstructorUserId,
                    course.PriceAmount,
                    "CourseEnrollment",
                    enrollment.ID);

                if (!paymentResult.Status)
                {
                    await tx.RollbackAsync();
                    return paymentResult;
                }

                enrollment.TransactionId = paymentResult.ID;
                enrollment.PaidAmount = course.PriceAmount;
                enrollment.Status = EnrollmentStatus.Active;
                enrollment.UpdateDate = DateTime.UtcNow;
                await _userNotificationService.AddInAppAsync(
                    studentUserId,
                    $"پرداخت و ثبت‌نام شما در دوره «{course.Title}» تکمیل شد.",
                    NotificationCategory.Education,
                    studentUserId);
                await _userNotificationService.AddInAppAsync(
                    course.InstructorUserId,
                    $"خرید جدید برای دوره «{course.Title}» ثبت شد.",
                    NotificationCategory.Education,
                    studentUserId);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                result.ID = enrollment.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        private async Task<AITechDigitalTradeHub.Data.ResultObjects.BitResultObject> PayTeacherBookingAsync(long bookingId, long studentUserId, long payerWalletId)
        {
            var result = new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var booking = await _context.TeacherBookings.SingleOrDefaultAsync(x => x.ID == bookingId && x.StudentUserId == studentUserId);
                if (booking == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "رزرو پیدا نشد";
                    return result;
                }

                if (booking.Status == TeacherBookingStatus.Confirmed)
                {
                    result.ID = booking.ID;
                    return result;
                }

                if (booking.Status != TeacherBookingStatus.PendingPayment)
                {
                    result.Status = false;
                    result.ErrorMessage = "وضعیت رزرو برای پرداخت معتبر نیست";
                    return result;
                }

                if (booking.PriceAmount <= 0)
                {
                    booking.Status = TeacherBookingStatus.Confirmed;
                    booking.ConfirmedAt = DateTime.UtcNow;
                    booking.UpdateDate = DateTime.UtcNow;
                    await _userNotificationService.AddInAppAsync(
                        studentUserId,
                        "رزرو جلسه آموزشی شما تایید شد.",
                        NotificationCategory.Education,
                        studentUserId);
                    await _userNotificationService.AddInAppAsync(
                        booking.InstructorUserId,
                        "یک رزرو جلسه آموزشی جدید تایید شد.",
                        NotificationCategory.Education,
                        studentUserId);
                    await _context.SaveChangesAsync();
                    await tx.CommitAsync();
                    result.ID = booking.ID;
                    return result;
                }

                var paymentResult = await TransferWalletPaymentAsync(
                    payerWalletId,
                    booking.InstructorUserId,
                    booking.PriceAmount,
                    "TeacherBooking",
                    booking.ID);

                if (!paymentResult.Status)
                {
                    await tx.RollbackAsync();
                    return paymentResult;
                }

                booking.TransactionId = paymentResult.ID;
                booking.Status = TeacherBookingStatus.Confirmed;
                booking.ConfirmedAt = DateTime.UtcNow;
                booking.UpdateDate = DateTime.UtcNow;
                await _userNotificationService.AddInAppAsync(
                    studentUserId,
                    "پرداخت و رزرو جلسه آموزشی شما تکمیل شد.",
                    NotificationCategory.Education,
                    studentUserId);
                await _userNotificationService.AddInAppAsync(
                    booking.InstructorUserId,
                    "پرداخت یک رزرو جلسه آموزشی تکمیل شد.",
                    NotificationCategory.Education,
                    studentUserId);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                result.ID = booking.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        private async Task<AITechDigitalTradeHub.Data.ResultObjects.BitResultObject> TransferWalletPaymentAsync(
            long payerWalletId,
            long payeeUserId,
            decimal amount,
            string referenceType,
            long referenceId)
        {
            var result = new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject();
            if (amount <= 0)
            {
                result.Status = false;
                result.ErrorMessage = "مبلغ باید بزرگتر از صفر باشد";
                return result;
            }

            var payer = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == payerWalletId);
            if (payer == null || payer.Status != WalletStatus.Active)
            {
                result.Status = false;
                result.ErrorMessage = "کیف پول پرداخت‌کننده فعال نیست";
                return result;
            }

            if (payer.Balance < amount)
            {
                result.Status = false;
                result.ErrorMessage = "موجودی کیف پول کافی نیست";
                return result;
            }

            var payee = await GetOrCreateUserWalletAsync(payeeUserId, payer.Currency);
            var fee = await _financeRep.CalculateFeeForReferenceTypeAsync(referenceType, amount);

            payer.Balance -= amount;
            payer.UpdateDate = DateTime.UtcNow;
            payee.Balance += amount - fee;
            payee.UpdateDate = DateTime.UtcNow;

            var payerTx = new Transaction
            {
                WalletId = payer.ID,
                TxType = TransactionType.Payment,
                Amount = -amount,
                ReferenceType = referenceType,
                ReferenceId = referenceId,
                Status = TransactionStatus.Success,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };

            var payeeTx = new Transaction
            {
                WalletId = payee.ID,
                TxType = TransactionType.Payment,
                Amount = amount,
                ReferenceType = referenceType,
                ReferenceId = referenceId,
                Status = TransactionStatus.Success,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };

            await _context.Transactions.AddRangeAsync(payerTx, payeeTx);

            if (fee > 0)
            {
                await _context.Transactions.AddAsync(new Transaction
                {
                    WalletId = payee.ID,
                    TxType = TransactionType.Fee,
                    Amount = -fee,
                    ReferenceType = referenceType,
                    ReferenceId = referenceId,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });
            }

            await _context.SaveChangesAsync();
            result.ID = payerTx.ID;
            return result;
        }

        private async Task<Wallet> GetOrCreateUserWalletAsync(long userId, string currency)
        {
            var wallet = await _context.Wallets.SingleOrDefaultAsync(x =>
                x.OwnerType == WalletOwnerType.User &&
                x.OwnerUserId == userId &&
                x.Currency == currency);

            if (wallet != null)
            {
                return wallet;
            }

            wallet = new Wallet
            {
                OwnerType = WalletOwnerType.User,
                OwnerUserId = userId,
                Currency = currency,
                Status = WalletStatus.Active,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };

            await _context.Wallets.AddAsync(wallet);
            await _context.SaveChangesAsync();
            return wallet;
        }

        private async Task<bool> OwnsWalletAsync(long walletId)
        {
            var wallet = await _financeRep.GetWalletByIdAsync(walletId);
            return wallet.Status && wallet.Result != null && IsOwnWallet(wallet.Result);
        }

        private async Task<bool> OwnsEscrowParticipantWalletAsync(long escrowId)
        {
            var escrow = await _financeRep.GetEscrowByIdAsync(escrowId);
            return escrow.Status &&
                   escrow.Result != null &&
                   (IsOwnWallet(escrow.Result.PayerWallet) || IsOwnWallet(escrow.Result.PayeeWallet));
        }

        private bool IsOwnWallet(Wallet wallet)
        {
            var userId = GetCurrentUserId();
            return wallet.OwnerType == WalletOwnerType.User && wallet.OwnerUserId == userId;
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }

    public class CreateWalletRequest
    {
        public string Currency { get; set; } = "IRR";
    }

    public class DepositRequest
    {
        public decimal Amount { get; set; }
        public string? GatewayRef { get; set; }
        public string? ReferenceType { get; set; }
        public long? ReferenceId { get; set; }
    }

    public class HoldEscrowRequest
    {
        public long PayerWalletId { get; set; }
        public long PayeeWalletId { get; set; }
        public decimal Amount { get; set; }
        public string ContextType { get; set; } = "Order";
        public long ContextId { get; set; }
    }

    public class WalletPaymentRequest
    {
        public long WalletId { get; set; }
    }
}
