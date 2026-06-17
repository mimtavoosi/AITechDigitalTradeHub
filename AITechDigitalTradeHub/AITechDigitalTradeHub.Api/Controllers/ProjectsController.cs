using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels;
using AITechDigitalTradeHub.Api.ViewModels.Projects;
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
    public partial class ProjectsController : ControllerBase
    {
        private readonly IProjectRep _projectRep;
        private readonly IFinanceRep _financeRep;
        private readonly TheAppContext _context;

        public ProjectsController(IProjectRep projectRep, IFinanceRep financeRep, TheAppContext context)
        {
            _projectRep = projectRep;
            _financeRep = financeRep;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] ProjectStatus? status,
            [FromQuery] long categoryId = 0,
            [FromQuery] decimal? minBudget = null,
            [FromQuery] decimal? maxBudget = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "",
            [FromQuery] string sortQuery = "")
        {
            var result = await _projectRep.GetAllProjectsAsync(
                status,
                categoryId,
                minBudget,
                maxBudget,
                pageIndex,
                pageSize,
                searchText,
                sortQuery);

            return result.Status ? Ok(result.Map(ProjectListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.GetUserProjectsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(ProjectListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("my-proposals")]
        public async Task<IActionResult> GetMyProposals([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.GetUserProposalsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(ProposalResponse.FromEntity)) : BadRequest(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _projectRep.GetProjectByIdAsync(id);
            return result.Status && result.Result != null ? Ok(result.Map(ProjectDetailResponse.FromEntity)) : NotFound(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.CreateProject)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var project = request.ToEntity(userId);
            var result = await _projectRep.AddProjectAsync(project);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] ProjectUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var project = request.ToEntity(userId);
            project.ID = id;
            var result = await _projectRep.EditProjectAsync(project, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpPost("{id:long}/publish")]
        public async Task<IActionResult> Publish(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.PublishProjectAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.RemoveProjectAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:long}/proposals")]
        public async Task<IActionResult> GetProposals(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _projectRep.GetProjectProposalsAsync(id, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(ProposalResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.SubmitProposal)]
        [HttpPost("{id:long}/proposals")]
        public async Task<IActionResult> CreateProposal(long id, [FromBody] CreateProposalRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var proposal = request.ToEntity(id, userId);
            var result = await _projectRep.AddProposalAsync(proposal);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageProjectProposal)]
        [HttpPatch("proposals/{proposalId:long}/status")]
        public async Task<IActionResult> UpdateProposalStatus(long proposalId, [FromBody] UpdateProposalStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.UpdateProposalStatusAsync(proposalId, request.Status, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageProjectProposal)]
        [HttpPost("proposals/{proposalId:long}/accept")]
        public async Task<IActionResult> AcceptProposal(long proposalId, [FromBody] AcceptProposalRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestones = request.Milestones.Select(x => x.ToEntity()).ToList();
            var result = await _projectRep.AcceptProposalAsync(proposalId, userId, milestones);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("contracts/{contractId:long}/milestones")]
        public async Task<IActionResult> GetMilestones(long contractId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.GetContractMilestonesAsync(contractId, userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(MilestoneResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpPost("contracts/{contractId:long}/milestones")]
        public async Task<IActionResult> AddMilestone(long contractId, [FromBody] CreateContractMilestoneRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.AddMilestoneAsync(contractId, userId, request.ToEntity());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpPatch("milestones/{milestoneId:long}/status")]
        public async Task<IActionResult> UpdateMilestoneStatus(long milestoneId, [FromBody] UpdateMilestoneStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.UpdateMilestoneStatusAsync(milestoneId, userId, request.Status);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("milestones/{milestoneId:long}/escrow/hold")]
        public async Task<IActionResult> HoldMilestoneEscrow(long milestoneId, [FromBody] HoldProjectMilestoneEscrowRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await GetMilestoneForEmployerAsync(milestoneId, userId);
            if (milestone == null)
            {
                return Forbid();
            }

            var result = await _financeRep.HoldEscrowAsync(
                request.PayerWalletId,
                request.PayeeWalletId,
                milestone.Amount,
                "ProjectMilestone",
                milestone.ID);

            if (result.Status)
            {
                milestone.Status = MilestoneStatus.InProgress;
                milestone.UpdateDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("milestones/{milestoneId:long}/escrow/{escrowId:long}/release")]
        public async Task<IActionResult> ReleaseMilestoneEscrow(long milestoneId, long escrowId)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await GetMilestoneForEmployerAsync(milestoneId, userId);
            if (milestone == null)
            {
                return Forbid();
            }

            var result = await _financeRep.ReleaseEscrowAsync(escrowId);
            if (result.Status)
            {
                milestone.Status = MilestoneStatus.Approved;
                milestone.UpdateDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("milestones/{milestoneId:long}/escrow/{escrowId:long}/refund")]
        public async Task<IActionResult> RefundMilestoneEscrow(long milestoneId, long escrowId)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await GetMilestoneForEmployerAsync(milestoneId, userId);
            if (milestone == null)
            {
                return Forbid();
            }

            var result = await _financeRep.RefundEscrowAsync(escrowId);
            if (result.Status)
            {
                milestone.Status = MilestoneStatus.Rejected;
                milestone.UpdateDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        private async Task<Milestone?> GetMilestoneForEmployerAsync(long milestoneId, long employerUserId)
        {
            return await _context.Milestones
                .Include(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == milestoneId && x.Contract.EmployerUserId == employerUserId);
        }
    }

    public partial class ProjectsController
    {
        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
