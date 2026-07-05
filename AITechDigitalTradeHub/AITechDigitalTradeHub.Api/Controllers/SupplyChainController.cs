using System.Security.Claims;
using System.Text.Json;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.ViewModels.SupplyChain;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SupplyChainController : ControllerBase
    {
        private static readonly ResourceAllocationStatus[] BlockingAllocationStatuses =
        {
            ResourceAllocationStatus.Planned,
            ResourceAllocationStatus.Reserved,
            ResourceAllocationStatus.Active
        };

        private static readonly ResourceReservationStatus[] BlockingReservationStatuses =
        {
            ResourceReservationStatus.Requested,
            ResourceReservationStatus.Confirmed,
            ResourceReservationStatus.InUse
        };

        private readonly TheAppContext _context;
        private readonly IProjectAccessService _projectAccessService;

        public SupplyChainController(TheAppContext context, IProjectAccessService projectAccessService)
        {
            _context = context;
            _projectAccessService = projectAccessService;
        }

        [HttpGet("allocations")]
        public async Task<IActionResult> GetAllocations(
            [FromQuery] long? projectId = null,
            [FromQuery] ResourceAllocationStatus? status = null,
            [FromQuery] ResourceType? resourceType = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized();

            if (projectId.HasValue && !await CanAccessProjectAsync(projectId.Value, userId))
            {
                return Forbid();
            }

            var query = BuildAllocationQuery(userId);
            if (projectId.HasValue) query = query.Where(x => x.ProjectId == projectId.Value);
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (resourceType.HasValue) query = query.Where(x => x.ResourceType == resourceType.Value);

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.StartsAt ?? x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<ResourceAllocationResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = items.Select(ResourceAllocationResponse.FromEntity).ToList()
            });
        }

        [HttpPost("allocations")]
        public async Task<IActionResult> CreateAllocation([FromBody] CreateResourceAllocationRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized();

            var validation = await ValidateAllocationScopeAsync(request.ProjectId, request.ContractId, request.OrderId, userId);
            if (!validation.Status) return BadRequest(validation);

            if (!IsValidTimeWindow(request.StartsAt, request.EndsAt))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "بازه زمانی تخصیص معتبر نیست" });
            }

            var allocation = new ResourceAllocation
            {
                ResourceType = request.ResourceType,
                Status = ResourceAllocationStatus.Planned,
                ProjectId = request.ProjectId,
                ContractId = request.ContractId,
                OrderId = request.OrderId,
                ListingId = request.ListingId,
                AssignedUserId = request.AssignedUserId,
                OrganizationId = request.OrganizationId,
                Title = request.Title.Trim(),
                Description = request.Description,
                EstimatedCost = request.EstimatedCost,
                StartsAt = request.StartsAt,
                EndsAt = request.EndsAt,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };

            if (request.StartsAt.HasValue && request.EndsAt.HasValue && await HasResourceConflictAsync(allocation, request.StartsAt.Value, request.EndsAt.Value))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این منبع در بازه زمانی انتخاب‌شده قبلا تخصیص یا رزرو شده است" });
            }

            await _context.ResourceAllocations.AddAsync(allocation);
            await _context.SaveChangesAsync();

            await AddValueFlowEventAsync(
                allocation.ID,
                ValueFlowEventType.Planned,
                "ثبت برنامه تخصیص منبع",
                request.EstimatedCost,
                userId,
                new { request.ProjectId, request.ContractId, request.OrderId, request.ListingId, request.StartsAt, request.EndsAt });
            await _context.SaveChangesAsync();

            return Ok(new BitResultObject { ID = allocation.ID });
        }

        [HttpPost("allocations/{id:long}/reservations")]
        public async Task<IActionResult> CreateReservation(long id, [FromBody] CreateResourceReservationRequest request)
        {
            var userId = GetCurrentUserId();
            var allocation = await LoadAllocationForWriteAsync(id);
            if (allocation == null) return NotFound();
            if (!await HasAllocationAccessAsync(allocation, userId)) return Forbid();

            if (request.StartsAt >= request.EndsAt)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "بازه زمانی رزرو معتبر نیست" });
            }

            if (await HasResourceConflictAsync(allocation, request.StartsAt, request.EndsAt, excludeAllocationId: allocation.ID))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این منبع در بازه زمانی انتخاب‌شده با رزرو یا تخصیص دیگری تداخل دارد" });
            }

            var reservation = new ResourceReservation
            {
                ResourceAllocationId = allocation.ID,
                StartsAt = request.StartsAt,
                EndsAt = request.EndsAt,
                ReservedCost = request.ReservedCost,
                Status = request.Confirm ? ResourceReservationStatus.Confirmed : ResourceReservationStatus.Requested,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };

            allocation.Status = request.Confirm ? ResourceAllocationStatus.Reserved : allocation.Status;
            allocation.StartsAt ??= request.StartsAt;
            allocation.EndsAt ??= request.EndsAt;
            allocation.UpdateDate = DateTime.UtcNow;

            await _context.ResourceReservations.AddAsync(reservation);
            await AddValueFlowEventAsync(
                allocation.ID,
                ValueFlowEventType.Reserved,
                request.Confirm ? "رزرو منبع تایید شد" : "درخواست رزرو منبع ثبت شد",
                request.ReservedCost,
                userId,
                new { request.StartsAt, request.EndsAt, request.Confirm });
            await _context.SaveChangesAsync();

            return Ok(new BitResultObject { ID = reservation.ID });
        }

        [HttpPatch("allocations/{id:long}/status")]
        public async Task<IActionResult> UpdateAllocationStatus(long id, [FromBody] UpdateResourceAllocationStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var allocation = await LoadAllocationForWriteAsync(id);
            if (allocation == null) return NotFound();
            if (!await HasAllocationAccessAsync(allocation, userId)) return Forbid();

            allocation.Status = request.Status;
            allocation.ActualCost = request.ActualCost ?? allocation.ActualCost;
            allocation.UpdateDate = DateTime.UtcNow;

            var eventType = MapStatusToEventType(request.Status, request.ActualCost);
            await AddValueFlowEventAsync(
                allocation.ID,
                eventType,
                GetStatusEventTitle(request.Status, request.ActualCost),
                request.ActualCost,
                userId,
                new { request.Status, request.ActualCost, request.Note });

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = allocation.ID });
        }

        [HttpGet("capacity")]
        public async Task<IActionResult> GetCapacity(
            [FromQuery] long? assignedUserId = null,
            [FromQuery] long? organizationId = null,
            [FromQuery] long? listingId = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized();

            var from = dateFrom ?? DateTime.UtcNow;
            var to = dateTo ?? from.AddDays(30);
            if (from >= to)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "بازه زمانی گزارش ظرفیت معتبر نیست" });
            }

            var allocationQuery = BuildAllocationQuery(userId)
                .Where(x => BlockingAllocationStatuses.Contains(x.Status));

            allocationQuery = ApplyResourceIdentityFilters(allocationQuery, assignedUserId, organizationId, listingId);
            allocationQuery = allocationQuery.Where(x =>
                (!x.StartsAt.HasValue || x.StartsAt < to) &&
                (!x.EndsAt.HasValue || x.EndsAt > from));

            var allocations = await allocationQuery.ToListAsync();
            var allocationIds = allocations.Select(x => x.ID).ToList();
            var reservations = await _context.ResourceReservations
                .AsNoTracking()
                .Where(x =>
                    allocationIds.Contains(x.ResourceAllocationId) &&
                    BlockingReservationStatuses.Contains(x.Status) &&
                    x.StartsAt < to &&
                    x.EndsAt > from)
                .ToListAsync();

            var starts = allocations
                .Select(x => x.StartsAt)
                .Concat(reservations.Select(x => (DateTime?)x.StartsAt))
                .Where(x => x.HasValue)
                .ToList();
            var ends = allocations
                .Select(x => x.EndsAt)
                .Concat(reservations.Select(x => (DateTime?)x.EndsAt))
                .Where(x => x.HasValue)
                .ToList();

            var response = new SupplyCapacityResponse
            {
                AssignedUserId = assignedUserId,
                OrganizationId = organizationId,
                ListingId = listingId,
                ActiveAllocations = allocations.Count,
                UpcomingReservations = reservations.Count,
                EstimatedCostLoad = allocations.Sum(x => x.EstimatedCost ?? 0) + reservations.Sum(x => x.ReservedCost ?? 0),
                NextStartsAt = starts.Count == 0 ? null : starts.Min(),
                LastEndsAt = ends.Count == 0 ? null : ends.Max()
            };

            return Ok(new RowResultObject<SupplyCapacityResponse> { Result = response });
        }

        [HttpGet("value-flow-dashboard")]
        public async Task<IActionResult> GetValueFlowDashboard([FromQuery] long? projectId = null)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized();

            if (projectId.HasValue && !await CanAccessProjectAsync(projectId.Value, userId))
            {
                return Forbid();
            }

            var query = BuildAllocationQuery(userId);
            if (projectId.HasValue)
            {
                query = query.Where(x => x.ProjectId == projectId.Value);
            }

            var allocations = await query.ToListAsync();
            var allocationIds = allocations.Select(x => x.ID).ToList();
            var recentEvents = await _context.ValueFlowEvents
                .AsNoTracking()
                .Where(x => allocationIds.Contains(x.ResourceAllocationId))
                .OrderByDescending(x => x.CreateDate)
                .ThenByDescending(x => x.ID)
                .Take(20)
                .ToListAsync();

            var response = new ValueFlowDashboardResponse
            {
                TotalAllocations = allocations.Count,
                ActiveAllocations = allocations.Count(x => x.Status == ResourceAllocationStatus.Active),
                ReservedAllocations = allocations.Count(x => x.Status == ResourceAllocationStatus.Reserved),
                CompletedAllocations = allocations.Count(x => x.Status == ResourceAllocationStatus.Completed),
                EstimatedCost = allocations.Sum(x => x.EstimatedCost ?? 0),
                ActualCost = allocations.Sum(x => x.ActualCost ?? 0),
                RecordedValueFlowAmount = recentEvents.Sum(x => x.Amount ?? 0),
                RecentEvents = recentEvents.Select(ValueFlowEventResponse.FromEntity).ToList()
            };

            return Ok(new RowResultObject<ValueFlowDashboardResponse> { Result = response });
        }

        private IQueryable<ResourceAllocation> BuildAllocationQuery(long userId)
        {
            var query = _context.ResourceAllocations
                .AsNoTracking()
                .Include(x => x.Project)
                .Include(x => x.Contract)
                .Include(x => x.Order)
                .Include(x => x.Listing)
                .Include(x => x.ValueFlowEvents)
                .Where(x => x.DeleteDate == null);

            if (IsAdministrator())
            {
                return query;
            }

            return query.Where(x =>
                x.AssignedUserId == userId ||
                (x.Project != null && x.Project.EmployerUserId == userId) ||
                (x.Contract != null && (x.Contract.EmployerUserId == userId || x.Contract.ContractorUserId == userId)) ||
                (x.Order != null && (x.Order.BuyerUserId == userId || x.Order.SellerUserId == userId)) ||
                (x.Listing != null && x.Listing.OwnerUserId == userId) ||
                (x.OrganizationId.HasValue && _context.OrganizationMembers.Any(member =>
                    member.OrganizationId == x.OrganizationId.Value &&
                    member.UserId == userId &&
                    member.IsActive &&
                    member.DeleteDate == null)));
        }

        private async Task<ResourceAllocation?> LoadAllocationForWriteAsync(long id)
        {
            return await _context.ResourceAllocations
                .Include(x => x.Project)
                .Include(x => x.Contract)
                .Include(x => x.Order)
                .Include(x => x.Listing)
                .SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
        }

        private async Task<BitResultObject> ValidateAllocationScopeAsync(long? projectId, long? contractId, long? orderId, long userId)
        {
            if (projectId.HasValue && !await CanAccessProjectAsync(projectId.Value, userId))
            {
                return new BitResultObject { Status = false, ErrorMessage = "به پروژه انتخاب‌شده دسترسی ندارید" };
            }

            if (contractId.HasValue)
            {
                var contract = await _context.Contracts
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.ID == contractId.Value && x.DeleteDate == null);
                if (contract == null)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "قرارداد انتخاب‌شده پیدا نشد" };
                }

                if (!IsAdministrator() && contract.EmployerUserId != userId && contract.ContractorUserId != userId)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "به قرارداد انتخاب‌شده دسترسی ندارید" };
                }
            }

            if (orderId.HasValue)
            {
                var isAdmin = IsAdministrator();
                var orderAllowed = await _context.Orders
                    .AsNoTracking()
                    .AnyAsync(x =>
                        x.ID == orderId.Value &&
                        x.DeleteDate == null &&
                        (isAdmin || x.BuyerUserId == userId || x.SellerUserId == userId));
                if (!orderAllowed)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "به سفارش انتخاب‌شده دسترسی ندارید" };
                }
            }

            return new BitResultObject();
        }

        private async Task<bool> HasAllocationAccessAsync(ResourceAllocation allocation, long userId)
        {
            if (IsAdministrator()) return true;
            if (allocation.AssignedUserId == userId) return true;
            if (allocation.ProjectId.HasValue && await _projectAccessService.CanAccessAsync(allocation.ProjectId.Value, userId)) return true;
            if (allocation.Contract != null && (allocation.Contract.EmployerUserId == userId || allocation.Contract.ContractorUserId == userId)) return true;
            if (allocation.Order != null && (allocation.Order.BuyerUserId == userId || allocation.Order.SellerUserId == userId)) return true;
            if (allocation.Listing != null && allocation.Listing.OwnerUserId == userId) return true;

            return allocation.OrganizationId.HasValue && await _context.OrganizationMembers.AnyAsync(member =>
                member.OrganizationId == allocation.OrganizationId.Value &&
                member.UserId == userId &&
                member.IsActive &&
                member.DeleteDate == null);
        }

        private async Task<bool> CanAccessProjectAsync(long projectId, long userId)
        {
            return await _projectAccessService.CanAccessAsync(projectId, userId, IsAdministrator());
        }

        private async Task<bool> HasResourceConflictAsync(ResourceAllocation allocation, DateTime startsAt, DateTime endsAt, long? excludeAllocationId = null)
        {
            var allocationConflicts = _context.ResourceAllocations
                .AsNoTracking()
                .Where(x =>
                    x.DeleteDate == null &&
                    BlockingAllocationStatuses.Contains(x.Status) &&
                    x.ResourceType == allocation.ResourceType &&
                    x.StartsAt.HasValue &&
                    x.EndsAt.HasValue &&
                    x.StartsAt < endsAt &&
                    x.EndsAt > startsAt);

            if (excludeAllocationId.HasValue)
            {
                allocationConflicts = allocationConflicts.Where(x => x.ID != excludeAllocationId.Value);
            }

            allocationConflicts = ApplyMatchingResourceIdentity(allocationConflicts, allocation);
            if (await allocationConflicts.AnyAsync()) return true;

            var reservationConflicts = _context.ResourceReservations
                .AsNoTracking()
                .Include(x => x.ResourceAllocation)
                .Where(x =>
                    x.DeleteDate == null &&
                    BlockingReservationStatuses.Contains(x.Status) &&
                    x.StartsAt < endsAt &&
                    x.EndsAt > startsAt &&
                    x.ResourceAllocation.DeleteDate == null &&
                    x.ResourceAllocation.ResourceType == allocation.ResourceType);

            reservationConflicts = ApplyMatchingReservationIdentity(reservationConflicts, allocation);
            return await reservationConflicts.AnyAsync();
        }

        private static IQueryable<ResourceAllocation> ApplyMatchingResourceIdentity(IQueryable<ResourceAllocation> query, ResourceAllocation allocation)
        {
            if (!allocation.AssignedUserId.HasValue && !allocation.OrganizationId.HasValue && !allocation.ListingId.HasValue)
            {
                return query.Where(x => false);
            }

            return query.Where(x =>
                (allocation.AssignedUserId.HasValue && x.AssignedUserId == allocation.AssignedUserId.Value) ||
                (allocation.OrganizationId.HasValue && x.OrganizationId == allocation.OrganizationId.Value) ||
                (allocation.ListingId.HasValue && x.ListingId == allocation.ListingId.Value));
        }

        private static IQueryable<ResourceReservation> ApplyMatchingReservationIdentity(IQueryable<ResourceReservation> query, ResourceAllocation allocation)
        {
            if (!allocation.AssignedUserId.HasValue && !allocation.OrganizationId.HasValue && !allocation.ListingId.HasValue)
            {
                return query.Where(x => false);
            }

            return query.Where(x =>
                (allocation.AssignedUserId.HasValue && x.ResourceAllocation.AssignedUserId == allocation.AssignedUserId.Value) ||
                (allocation.OrganizationId.HasValue && x.ResourceAllocation.OrganizationId == allocation.OrganizationId.Value) ||
                (allocation.ListingId.HasValue && x.ResourceAllocation.ListingId == allocation.ListingId.Value));
        }

        private static IQueryable<ResourceAllocation> ApplyResourceIdentityFilters(
            IQueryable<ResourceAllocation> query,
            long? assignedUserId,
            long? organizationId,
            long? listingId)
        {
            if (assignedUserId.HasValue) query = query.Where(x => x.AssignedUserId == assignedUserId.Value);
            if (organizationId.HasValue) query = query.Where(x => x.OrganizationId == organizationId.Value);
            if (listingId.HasValue) query = query.Where(x => x.ListingId == listingId.Value);
            return query;
        }

        private async Task AddValueFlowEventAsync(
            long allocationId,
            ValueFlowEventType eventType,
            string title,
            decimal? amount,
            long userId,
            object? payload = null)
        {
            var valueFlowEvent = new ValueFlowEvent
            {
                ResourceAllocationId = allocationId,
                EventType = eventType,
                Title = title,
                Amount = amount,
                CreatedByUserId = userId,
                PayloadJson = payload == null ? null : JsonSerializer.Serialize(payload),
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };

            await _context.ValueFlowEvents.AddAsync(valueFlowEvent);
        }

        private static bool IsValidTimeWindow(DateTime? startsAt, DateTime? endsAt)
        {
            return !startsAt.HasValue || !endsAt.HasValue || startsAt.Value < endsAt.Value;
        }

        private static ValueFlowEventType MapStatusToEventType(ResourceAllocationStatus status, decimal? actualCost)
        {
            if (actualCost.HasValue) return ValueFlowEventType.CostRecorded;
            return status switch
            {
                ResourceAllocationStatus.Reserved => ValueFlowEventType.Reserved,
                ResourceAllocationStatus.Active => ValueFlowEventType.Started,
                ResourceAllocationStatus.Completed => ValueFlowEventType.Delivered,
                ResourceAllocationStatus.Cancelled => ValueFlowEventType.Cancelled,
                _ => ValueFlowEventType.Planned
            };
        }

        private static string GetStatusEventTitle(ResourceAllocationStatus status, decimal? actualCost)
        {
            if (actualCost.HasValue) return "هزینه واقعی منبع ثبت شد";
            return status switch
            {
                ResourceAllocationStatus.Reserved => "تخصیص منبع رزرو شد",
                ResourceAllocationStatus.Active => "استفاده از منبع شروع شد",
                ResourceAllocationStatus.Completed => "تحویل منبع تکمیل شد",
                ResourceAllocationStatus.Cancelled => "تخصیص منبع لغو شد",
                _ => "وضعیت تخصیص منبع به‌روزرسانی شد"
            };
        }

        private bool IsAdministrator()
        {
            return User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
