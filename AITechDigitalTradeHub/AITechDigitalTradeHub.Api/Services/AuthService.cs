using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Auth;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AiTech.Domains;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using NobatPlusDATA.Domain;

namespace AITechDigitalTradeHub.Api.Services
{
    public class AuthService : IAuthService
    {
        private const string RefreshTokenType = "Refresh";
        private const string SmsLoginMethod = "SMS";
        private readonly TheAppContext _context;
        private readonly IConfiguration _configuration;
        private readonly ISmsSender _smsSender;
        private readonly SmsSenderOptions _smsOptions;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public AuthService(
            TheAppContext context,
            IConfiguration configuration,
            ISmsSender smsSender,
            IOptions<SmsSenderOptions> smsOptions)
        {
            _context = context;
            _configuration = configuration;
            _smsSender = smsSender;
            _smsOptions = smsOptions.Value;
        }

        public async Task<AuthResult> RegisterAsync(RegisterRequest request)
        {
            var normalizedUsername = request.Username.Trim();
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var normalizedMobile = NormalizeMobileNumber(request.MobileNumber);

            if (string.IsNullOrWhiteSpace(normalizedMobile))
            {
                return AuthResult.Fail("شماره موبایل معتبر نیست");
            }

            bool exists = await _context.Users.AnyAsync(x =>
                x.Username == normalizedUsername ||
                x.Email.ToLower() == normalizedEmail ||
                (!string.IsNullOrEmpty(request.NationalCode) && x.NationalCode == request.NationalCode));

            bool mobileExists = await _context.LoginMethods.AnyAsync(x =>
                x.Method == SmsLoginMethod &&
                x.MobileNumber == normalizedMobile &&
                x.UserId != null);

            if (exists || mobileExists)
            {
                return AuthResult.Fail("کاربری با این نام کاربری، ایمیل، کد ملی یا شماره موبایل از قبل وجود دارد");
            }

            var smsResult = await _smsSender.SendVerificationCodeAsync(normalizedMobile);
            if (!smsResult.Sent)
            {
                return AuthResult.Fail(smsResult.ErrorMessage ?? "ارسال کد تایید ناموفق بود");
            }

            var role = await GetOrCreateDefaultUserRoleAsync();
            var user = new User
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = normalizedEmail,
                NationalCode = request.NationalCode?.Trim() ?? string.Empty,
                Username = normalizedUsername,
                RoleId = role.ID,
                Status = UserStatus.Active,
                IsVerified = false,
                VerificationLevel = 0,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                PaymentHistories = new List<PaymentHistory>(),
                LoginMethods = new List<LoginMethod>(),
                Notifications = new List<Notification>(),
                TicketMessages = new List<TicketMessage>()
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            await _context.UserRoles.AddAsync(new UserRole
            {
                UserId = user.ID,
                RoleId = role.ID,
                Status = UserRoleAssignmentStatus.Approved,
                RequestedAt = DateTime.UtcNow,
                ApprovedAt = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            });
            await _context.SaveChangesAsync();

            await SaveMobileVerificationCodeAsync(user.ID, normalizedMobile, smsResult.Code, smsResult.Sent);

            return new AuthResult
            {
                Status = true,
                RequiresMobileVerification = true,
                MobileNumber = normalizedMobile
            };
        }

        public async Task<AuthResult> LoginAsync(LoginRequest request)
        {
            var usernameOrEmail = request.UsernameOrEmail.Trim();
            var normalizedLookup = usernameOrEmail.ToLowerInvariant();
            var normalizedMobile = NormalizeMobileNumber(usernameOrEmail);

            var user = await _context.Users
                .Include(x => x.Role)
                .SingleOrDefaultAsync(x =>
                    x.Username.ToLower() == normalizedLookup ||
                    x.Email.ToLower() == normalizedLookup ||
                    (!string.IsNullOrEmpty(normalizedMobile) &&
                     x.LoginMethods.Any(lm => lm.Method == SmsLoginMethod && lm.MobileNumber == normalizedMobile)));

            if (user == null)
            {
                return AuthResult.Fail("نام کاربری یا رمز عبور اشتباه است");
            }

            if (user.Status != UserStatus.Active || !user.IsActive)
            {
                return AuthResult.Fail("حساب کاربری فعال نیست");
            }

            if (!user.IsVerified)
            {
                return new AuthResult
                {
                    Status = false,
                    ErrorMessage = "شماره موبایل حساب کاربری هنوز تایید نشده است",
                    RequiresMobileVerification = true,
                    MobileNumber = await GetUserMobileNumberAsync(user.ID)
                };
            }

            var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verifyResult == PasswordVerificationResult.Failed)
            {
                return AuthResult.Fail("نام کاربری یا رمز عبور اشتباه است");
            }

            if (verifyResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
                await _context.SaveChangesAsync();
            }

            return await CreateAuthResultAsync(user);
        }

        public async Task<AuthResult> VerifyMobileAsync(VerifyMobileRequest request)
        {
            var normalizedMobile = NormalizeMobileNumber(request.MobileNumber);
            if (string.IsNullOrWhiteSpace(normalizedMobile))
            {
                return AuthResult.Fail("شماره موبایل معتبر نیست");
            }

            var loginMethod = await _context.LoginMethods
                .Include(x => x.User)
                    .ThenInclude(x => x!.Role)
                .Where(x =>
                    x.Method == SmsLoginMethod &&
                    x.MobileNumber == normalizedMobile &&
                    x.UserId != null)
                .OrderByDescending(x => x.CreateDate)
                .FirstOrDefaultAsync();

            if (loginMethod?.User == null)
            {
                return AuthResult.Fail("شماره موبایل پیدا نشد");
            }

            if (loginMethod.ExpirationDate == null || loginMethod.ExpirationDate < DateTime.UtcNow)
            {
                return AuthResult.Fail("کد تایید منقضی شده است");
            }

            if (!string.Equals(loginMethod.Token, request.Code.Trim(), StringComparison.Ordinal))
            {
                return AuthResult.Fail("کد تایید صحیح نیست");
            }

            loginMethod.Token = string.Empty;
            loginMethod.ExpirationDate = null;
            loginMethod.UpdateDate = DateTime.UtcNow;
            loginMethod.User.IsVerified = true;
            loginMethod.User.VerificationLevel = Math.Max(loginMethod.User.VerificationLevel, (byte)1);
            loginMethod.User.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await CreateAuthResultAsync(loginMethod.User);
        }

        public async Task<AuthOperationResult> ResendMobileVerificationAsync(ResendMobileVerificationRequest request)
        {
            var normalizedMobile = NormalizeMobileNumber(request.MobileNumber);
            if (string.IsNullOrWhiteSpace(normalizedMobile))
            {
                return AuthOperationResult.Fail("شماره موبایل معتبر نیست");
            }

            var loginMethod = await _context.LoginMethods
                .Where(x => x.Method == SmsLoginMethod && x.MobileNumber == normalizedMobile && x.UserId != null)
                .OrderByDescending(x => x.CreateDate)
                .FirstOrDefaultAsync();

            if (loginMethod == null)
            {
                return AuthOperationResult.Fail("شماره موبایل پیدا نشد");
            }

            var smsResult = await _smsSender.SendVerificationCodeAsync(normalizedMobile);
            if (!smsResult.Sent)
            {
                return AuthOperationResult.Fail(smsResult.ErrorMessage ?? "ارسال کد تایید ناموفق بود");
            }

            loginMethod.Token = smsResult.Code;
            loginMethod.ExpirationDate = DateTime.UtcNow.AddMinutes(GetVerificationCodeMinutes());
            loginMethod.UpdateDate = DateTime.UtcNow;
            loginMethod.IsActive = true;

            await AddSmsLogAsync(loginMethod.UserId, normalizedMobile, smsResult.Sent);
            await _context.SaveChangesAsync();
            return AuthOperationResult.Ok();
        }

        public async Task<AuthResult> RefreshAsync(RefreshTokenRequest request)
        {
            var refreshTokenHash = HashToken(request.RefreshToken);
            var token = await _context.Tokens.SingleOrDefaultAsync(x =>
                x.TokenValue == refreshTokenHash &&
                x.Type == RefreshTokenType &&
                x.Status);

            if (token == null || token.ExpiryDate <= DateTime.UtcNow)
            {
                return AuthResult.Fail("نشست معتبر نیست یا منقضی شده است");
            }

            var user = await _context.Users.Include(x => x.Role).SingleOrDefaultAsync(x => x.ID == token.UserId);
            if (user == null || user.Status != UserStatus.Active || !user.IsActive)
            {
                return AuthResult.Fail("کاربر معتبر نیست");
            }

            token.Status = false;
            token.RevokedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await CreateAuthResultAsync(user);
        }

        public async Task<AuthOperationResult> LogoutAsync(string refreshToken)
        {
            var refreshTokenHash = HashToken(refreshToken);
            var token = await _context.Tokens.SingleOrDefaultAsync(x =>
                x.TokenValue == refreshTokenHash &&
                x.Type == RefreshTokenType &&
                x.Status);

            if (token == null)
            {
                return AuthOperationResult.Ok();
            }

            token.Status = false;
            token.RevokedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return AuthOperationResult.Ok();
        }

        public async Task<AuthOperationResult> RevokeSessionAsync(long tokenId, long currentUserId)
        {
            var token = await _context.Tokens.SingleOrDefaultAsync(x => x.ID == tokenId && x.UserId == currentUserId);
            if (token == null)
            {
                return AuthOperationResult.Fail("نشست پیدا نشد");
            }

            token.Status = false;
            token.RevokedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return AuthOperationResult.Ok();
        }

        public async Task<UserProfileResponse?> GetCurrentUserAsync(long userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(x => x.Role)
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                .Where(x => x.ID == userId)
                .Select(x => new UserProfileResponse
                {
                    Id = x.ID,
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    Email = x.Email,
                    Username = x.Username,
                    MobileNumber = x.LoginMethods
                        .Where(lm => lm.Method == SmsLoginMethod && lm.MobileNumber != null)
                        .OrderByDescending(lm => lm.CreateDate)
                        .Select(lm => lm.MobileNumber)
                        .FirstOrDefault(),
                    RoleId = x.RoleId,
                    RoleName = x.Role.Name,
                    Roles = x.UserRoles
                        .Where(ur => ur.IsActive)
                        .Select(ur => new UserRoleResponse
                        {
                            RoleId = ur.RoleId,
                            RoleName = ur.Role.Name,
                            Description = ur.Role.Description,
                            Status = ur.Status
                        })
                        .ToList(),
                    TrustScore = x.TrustScore,
                    IsVerified = x.IsVerified,
                    VerificationLevel = x.VerificationLevel,
                    Status = x.Status
                })
                .SingleOrDefaultAsync();

            if (user != null && !user.Roles.Any(x => x.RoleId == user.RoleId))
            {
                user.Roles.Add(new UserRoleResponse
                {
                    RoleId = user.RoleId,
                    RoleName = user.RoleName ?? string.Empty,
                    Status = UserRoleAssignmentStatus.Approved
                });
            }

            return user;
        }

        public async Task<IReadOnlyList<UserSessionResponse>> GetSessionsAsync(long userId)
        {
            return await _context.Tokens
                .AsNoTracking()
                .Where(x => x.UserId == userId && x.Type == RefreshTokenType)
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new UserSessionResponse
                {
                    Id = x.ID,
                    IsActive = x.Status && x.ExpiryDate > DateTime.UtcNow,
                    CreatedDate = x.CreatedDate,
                    ExpiryDate = x.ExpiryDate,
                    RevokedDate = x.RevokedDate
                })
                .ToListAsync();
        }

        public async Task<AuthOperationResult> ChangePasswordAsync(long userId, ChangePasswordRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == userId);
            if (user == null)
            {
                return AuthOperationResult.Fail("کاربر پیدا نشد");
            }

            var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
            if (verifyResult == PasswordVerificationResult.Failed)
            {
                return AuthOperationResult.Fail("رمز فعلی اشتباه است");
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
            user.UpdateDate = DateTime.UtcNow;

            var activeTokens = await _context.Tokens
                .Where(x => x.UserId == userId && x.Type == RefreshTokenType && x.Status)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.Status = false;
                token.RevokedDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return AuthOperationResult.Ok();
        }

        private async Task<AuthResult> CreateAuthResultAsync(User user)
        {
            if (user.Role == null)
            {
                await _context.Entry(user).Reference(x => x.Role).LoadAsync();
            }

            var approvedRoles = await GetApprovedRolesAsync(user);
            var accessToken = CreateJwt(user, approvedRoles);
            var refreshToken = CreateSecureToken();
            var refreshLifetimeDays = _configuration.GetValue<int?>("Jwt:RefreshTokenDays") ?? 30;

            await _context.Tokens.AddAsync(new Token
            {
                UserId = user.ID,
                TokenValue = HashToken(refreshToken),
                Type = RefreshTokenType,
                Status = true,
                CreatedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddDays(refreshLifetimeDays)
            });
            await _context.SaveChangesAsync();

            return new AuthResult
            {
                Status = true,
                AccessToken = accessToken.Token,
                AccessTokenExpiresAt = accessToken.ExpiresAt,
                RefreshToken = refreshToken,
                User = new UserProfileResponse
                {
                    Id = user.ID,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Username = user.Username,
                    MobileNumber = await GetUserMobileNumberAsync(user.ID),
                    RoleId = user.RoleId,
                    RoleName = user.Role?.Name,
                    Roles = approvedRoles
                        .Select(x => new UserRoleResponse
                        {
                            RoleId = x.ID,
                            RoleName = x.Name,
                            Description = x.Description,
                            Status = UserRoleAssignmentStatus.Approved
                        })
                        .ToList(),
                    TrustScore = user.TrustScore,
                    IsVerified = user.IsVerified,
                    VerificationLevel = user.VerificationLevel,
                    Status = user.Status
                }
            };
        }

        private (string Token, DateTime ExpiresAt) CreateJwt(User user, IReadOnlyList<Role> approvedRoles)
        {
            var issuer = _configuration["Jwt:Issuer"] ?? "AITechDigitalTradeHub";
            var audience = _configuration["Jwt:Audience"] ?? "AITechDigitalTradeHub";
            var secret = _configuration["Jwt:Secret"];
            if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
            {
                throw new InvalidOperationException("Jwt:Secret must be configured and at least 32 bytes long.");
            }

            var expiresAt = DateTime.UtcNow.AddMinutes(_configuration.GetValue<int?>("Jwt:AccessTokenMinutes") ?? 30);
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.ID.ToString()),
                new(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Email, user.Email),
                new("permissionsVersion", user.PermissionsVersion.ToString())
            };

            foreach (var role in approvedRoles.DistinctBy(x => x.ID))
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Name));
                claims.Add(new Claim("roleId", role.ID.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(issuer, audience, claims, expires: expiresAt, signingCredentials: credentials);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }

        private async Task<List<Role>> GetApprovedRolesAsync(User user)
        {
            var roles = await _context.UserRoles
                .AsNoTracking()
                .Include(x => x.Role)
                .Where(x =>
                    x.UserId == user.ID &&
                    x.IsActive &&
                    x.Status == UserRoleAssignmentStatus.Approved &&
                    x.Role.IsActive)
                .Select(x => x.Role)
                .ToListAsync();

            if (user.Role != null && roles.All(x => x.ID != user.RoleId))
            {
                roles.Add(user.Role);
            }

            return roles;
        }

        private async Task<Role> GetOrCreateDefaultUserRoleAsync()
        {
            var role = await _context.Roles.SingleOrDefaultAsync(x => x.Name == RoleNames.User);
            if (role != null)
            {
                return role;
            }

            role = new Role
            {
                Name = RoleNames.User,
                Description = "Default registered user",
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                Users = new List<User>()
            };

            await _context.Roles.AddAsync(role);
            await _context.SaveChangesAsync();
            return role;
        }

        private async Task SaveMobileVerificationCodeAsync(long userId, string mobileNumber, string code, bool sent)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(GetVerificationCodeMinutes());
            var loginMethod = await _context.LoginMethods
                .SingleOrDefaultAsync(x => x.UserId == userId && x.Method == SmsLoginMethod && x.MobileNumber == mobileNumber);

            if (loginMethod == null)
            {
                await _context.LoginMethods.AddAsync(new LoginMethod
                {
                    UserId = userId,
                    MobileNumber = mobileNumber,
                    Method = SmsLoginMethod,
                    Token = code,
                    ExpirationDate = expiresAt,
                    IsActive = true,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }
            else
            {
                loginMethod.Token = code;
                loginMethod.ExpirationDate = expiresAt;
                loginMethod.UpdateDate = DateTime.UtcNow;
                loginMethod.IsActive = true;
            }

            await AddSmsLogAsync(userId, mobileNumber, sent);
            await _context.SaveChangesAsync();
        }

        private async Task AddSmsLogAsync(long? userId, string mobileNumber, bool sent)
        {
            await _context.SMSMessages.AddAsync(new SMSMessage
            {
                UserID = userId,
                PhoneNumber = mobileNumber,
                Message = "کد تایید شماره موبایل",
                SentDate = DateTime.UtcNow,
                SentStatus = sent,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            });
        }

        private async Task<string?> GetUserMobileNumberAsync(long userId)
        {
            return await _context.LoginMethods
                .AsNoTracking()
                .Where(x => x.UserId == userId && x.Method == SmsLoginMethod && x.MobileNumber != null)
                .OrderByDescending(x => x.CreateDate)
                .Select(x => x.MobileNumber)
                .FirstOrDefaultAsync();
        }

        private int GetVerificationCodeMinutes()
        {
            return _smsOptions.VerificationCodeMinutes > 0 ? _smsOptions.VerificationCodeMinutes : 5;
        }

        private static string NormalizeMobileNumber(string? mobileNumber)
        {
            var value = (mobileNumber ?? string.Empty)
                .Trim()
                .Replace(" ", string.Empty)
                .Replace("-", string.Empty);

            if (value.StartsWith("+98", StringComparison.Ordinal))
            {
                value = $"0{value[3..]}";
            }
            else if (value.StartsWith("0098", StringComparison.Ordinal))
            {
                value = $"0{value[4..]}";
            }

            return value.StartsWith("09", StringComparison.Ordinal) && value.Length == 11 && value.All(char.IsDigit)
                ? value
                : string.Empty;
        }

        private static string CreateSecureToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }
    }
}
