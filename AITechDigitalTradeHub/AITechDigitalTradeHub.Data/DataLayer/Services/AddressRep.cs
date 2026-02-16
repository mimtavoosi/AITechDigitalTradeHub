using Microsoft.EntityFrameworkCore;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class AddressRep : IAddressRep
    {
        private TheAppContext _context;

        public AddressRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddAddressAsync(Address address)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Addresses.AddAsync(address);
                await _context.SaveChangesAsync();
                result.ID = address.ID;
                _context.Entry(address).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditAddressAsync(Address address)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Addresses.Update(address);
                await _context.SaveChangesAsync();
                _context.Entry(address).State = EntityState.Detached;
                result.ID = address.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistAddressAsync(long addressId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.Addresses.AsNoTracking().AnyAsync(x => x.ID == addressId);
                result.ID = addressId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Address>> GetAllAddressesAsync(long CityId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="")
        {
            ListResultObject<Address> results = new ListResultObject<Address>();
            try
            {
                var query = _context.Addresses.Include(x => x.City).AsNoTracking();

                if (CityId > 0)
                {
                    query = query.Where(x=> x.CityID == CityId);
                }
    
         query = query.Where(x =>
        (!string.IsNullOrEmpty(x.City.CityName.ToString()) && x.City.CityName.ToString().Contains(searchText)) ||
        (!string.IsNullOrEmpty(x.AddressLocationHorizentalPoint.ToString()) && x.AddressLocationHorizentalPoint.ToString().Contains(searchText)) ||
        (!string.IsNullOrEmpty(x.AddressLocationVerticalPoint.ToString()) && x.AddressLocationVerticalPoint.ToString().Contains(searchText)) ||
        (!string.IsNullOrEmpty(x.AddressPostalCode.ToString()) && x.AddressPostalCode.ToString().Contains(searchText)) ||
        //(!string.IsNullOrEmpty(x.State.ToString()) && x.State.ToString().Contains(searchText)) ||
        (!string.IsNullOrEmpty(x.AddressStreet.ToString()) && x.AddressStreet.ToString().Contains(searchText)) ||
        (x.CreateDate.HasValue && x.CreateDate.Value.ToString().Contains(searchText)) ||
        (x.UpdateDate.HasValue && x.UpdateDate.Value.ToString().Contains(searchText))
    );
                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate)
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

        public async Task<RowResultObject<Address>> GetAddressByIdAsync(long addressId)
        {
            RowResultObject<Address> result = new RowResultObject<Address>();
            try
            {
                result.Result = await _context.Addresses.Include(x => x.City).AsNoTracking().SingleOrDefaultAsync(x => x.ID == addressId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<Address>> GetAddressByUserIdAsync(long UserId)
        {
            RowResultObject<Address> result = new RowResultObject<Address>();
            try
            {
                var User = await _context.Users
                .Include(x => x.Address)
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == UserId);
                result.Result = User?.Address ?? new Address();
                result.Status = result.Result.ID > 0;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveAddressAsync(Address address)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Addresses.Remove(address);
                await _context.SaveChangesAsync();
                result.ID = address.ID;
                _context.Entry(address).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveAddressAsync(long addressId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var address = await GetAddressByIdAsync(addressId);
                result = await RemoveAddressAsync(address.Result);
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