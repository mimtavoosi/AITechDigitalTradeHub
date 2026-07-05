using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class BadgeRep : IBadgeRep
    {
        private readonly TheAppContext _context;

        public BadgeRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<ListResultObject<Badge>> GetAllBadgesAsync()
        {
            var result = new ListResultObject<Badge>();
            try
            {
                var query = _context.Badges.AsNoTracking().Where(x => x.DeleteDate == null);
                result.TotalCount = await query.CountAsync();
                result.Results = await query.OrderBy(x => x.Title).ToListAsync();
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> CreateBadgeAsync(Badge badge)
        {
            var result = new BitResultObject();
            try
            {
                if (string.IsNullOrWhiteSpace(badge.Title) || string.IsNullOrWhiteSpace(badge.Code))
                {
                    return new BitResultObject { Status = false, ErrorMessage = "عنوان و کد نشان الزامی است." };
                }

                var codeExists = await _context.Badges.AnyAsync(x => x.Code == badge.Code && x.DeleteDate == null);
                if (codeExists)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "نشانی با این کد قبلاً ثبت شده است." };
                }

                badge.CreateDate = DateTime.Now;
                badge.UpdateDate = DateTime.Now;
                await _context.Badges.AddAsync(badge);
                await _context.SaveChangesAsync();
                result.ID = badge.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<ListResultObject<BadgeAssignment>> GetAssignmentsForTargetAsync(BadgeTargetType targetType, long targetId)
        {
            var result = new ListResultObject<BadgeAssignment>();
            try
            {
                var query = _context.BadgeAssignments
                    .AsNoTracking()
                    .Include(x => x.Badge)
                    .Where(x =>
                        x.TargetType == targetType &&
                        x.TargetId == targetId &&
                        x.Status == BadgeAssignmentStatus.Active &&
                        x.DeleteDate == null);

                result.TotalCount = await query.CountAsync();
                result.Results = await query.OrderByDescending(x => x.CreateDate).ToListAsync();
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<ListResultObject<BadgeAssignment>> GetAllAssignmentsAsync(int pageIndex = 1, int pageSize = 20)
        {
            var result = new ListResultObject<BadgeAssignment>();
            try
            {
                var query = _context.BadgeAssignments
                    .AsNoTracking()
                    .Include(x => x.Badge)
                    .Where(x => x.DeleteDate == null);

                result.TotalCount = await query.CountAsync();
                result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
                result.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> AssignBadgeAsync(BadgeAssignment assignment)
        {
            var result = new BitResultObject();
            try
            {
                var badgeExists = await _context.Badges.AnyAsync(x => x.ID == assignment.BadgeId && x.DeleteDate == null);
                if (!badgeExists)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "نشان مورد نظر پیدا نشد." };
                }

                var existing = await _context.BadgeAssignments.SingleOrDefaultAsync(x =>
                    x.BadgeId == assignment.BadgeId &&
                    x.TargetType == assignment.TargetType &&
                    x.TargetId == assignment.TargetId);

                if (existing != null)
                {
                    if (existing.Status == BadgeAssignmentStatus.Active)
                    {
                        return new BitResultObject { Status = false, ErrorMessage = "این نشان قبلاً به این هدف اختصاص داده شده است." };
                    }

                    existing.Status = BadgeAssignmentStatus.Active;
                    existing.AssignedByUserId = assignment.AssignedByUserId;
                    existing.Reason = assignment.Reason;
                    existing.ExpiresAt = assignment.ExpiresAt;
                    existing.UpdateDate = DateTime.Now;
                    await _context.SaveChangesAsync();
                    result.ID = existing.ID;
                    return result;
                }

                assignment.Status = BadgeAssignmentStatus.Active;
                assignment.CreateDate = DateTime.Now;
                assignment.UpdateDate = DateTime.Now;
                assignment.CreatorId = assignment.AssignedByUserId;

                await _context.BadgeAssignments.AddAsync(assignment);
                await _context.SaveChangesAsync();
                result.ID = assignment.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> RevokeBadgeAsync(long assignmentId)
        {
            var result = new BitResultObject();
            try
            {
                var assignment = await _context.BadgeAssignments.SingleOrDefaultAsync(x => x.ID == assignmentId && x.DeleteDate == null);
                if (assignment == null)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "اختصاص نشان پیدا نشد." };
                }

                assignment.Status = BadgeAssignmentStatus.Revoked;
                assignment.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = assignment.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }
    }
}
