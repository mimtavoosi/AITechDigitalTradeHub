using Microsoft.EntityFrameworkCore;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.ResultObjects;
using Azure.Core;
using AITechDigitalTradeHub.Data.Tools;

namespace Services
{
    public class TokenRep : ITokenRep
    {
        private TheAppContext _context;

        public TokenRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddTokenAsync(Token Token)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Tokens.AddAsync(Token);
                await _context.SaveChangesAsync();
                result.ID = Token.ID;
                _context.Entry(Token).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditTokenAsync(Token Token)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Tokens.Update(Token);
                await _context.SaveChangesAsync();
                result.ID = Token.ID;
                _context.Entry(Token).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistTokenAsync(long TokenId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.Tokens
                .AsNoTracking()
                .AnyAsync(x => x.ID == TokenId);
                result.ID = TokenId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<Token>> FindTokenAsync(string Token, string type, bool status = true)
        {
            RowResultObject<Token> result = new RowResultObject<Token>();
            var nowDate = DateTime.Now.ToShamsi();

            try
            {
                var tokenrow = await _context.Tokens
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.TokenValue == Token && x.Type.ToLower() == type.ToLower() && x.Status == status);

                var timeDiddrence = tokenrow.ExpiryDate - nowDate;

                if (timeDiddrence.TotalMinutes > 0)
                {
                    result.Result = tokenrow;
                }
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Token>> GetAllTokensAsync(long UserId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "")
        {
            ListResultObject<Token> results = new ListResultObject<Token>();
            try
            {
                var query = _context.Tokens.AsNoTracking();

                if (UserId > 0)
                {
                    query = query.Where(x => x.UserId == UserId);
                }


                query = query.Where(x =>
                    (!string.IsNullOrEmpty(x.TokenValue.ToString()) && x.TokenValue.ToString().Contains(searchText)) ||
                    (!string.IsNullOrEmpty(x.Type.ToString()) && x.Type.ToString().Contains(searchText)) ||
                    (x.ExpiryDate.ToString().Contains(searchText)) ||
                    (x.CreatedDate.ToString().Contains(searchText)) ||
                    (x.RevokedDate.HasValue && x.RevokedDate.Value.ToString().Contains(searchText))
                );

                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreatedDate)
                 .SortBy(sortQuery).ToPaging(pageIndex, pageSize)
                .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<Token>> GetTokenByIdAsync(long TokenId)
        {
            RowResultObject<Token> result = new RowResultObject<Token>();
            try
            {
                result.Result = await _context.Tokens
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == TokenId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> MakeTokenExpireAsync(long TokenId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var Token = await GetTokenByIdAsync(TokenId);
                Token.Result.Status = false;
                Token.Result.RevokedDate = DateTime.Now.ToShamsi();
                result = await EditTokenAsync(Token.Result);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveTokenAsync(Token Token)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Tokens.Remove(Token);
                await _context.SaveChangesAsync();
                result.ID = Token.ID;
                _context.Entry(Token).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveTokenAsync(long TokenId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var Token = await GetTokenByIdAsync(TokenId);
                result = await RemoveTokenAsync(Token.Result);
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