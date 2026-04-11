using Microsoft.EntityFrameworkCore;
using TrickyTrayAPI.Data;
using TrickyTrayAPI.DTOs;
using TrickyTrayAPI.Models;
using TrickyTrayAPI.Repositories;

public class SystemStateService
{
    private readonly SystemStateRepository _repository;
    private readonly IGiftRepository _giftRepository;
    private readonly TrickyTrayDbContext _context;

    public SystemStateService(SystemStateRepository repository, IGiftRepository giftRepository, TrickyTrayDbContext context)
    {
        _repository = repository;
        _giftRepository = giftRepository;
        _context = context;
    }

    public SystemState GetState() => _repository.Get();

    public void StartSale()
    {
        var state = GetState();
        if (state.Status != SystemState.SaleStatus.Draft)
            throw new InvalidOperationException("המכירה כבר התחילה.");

        state.Status = SystemState.SaleStatus.Active;
        state.StartTime = DateTime.Now;
        _repository.Update(state);
    }

    public async Task<List<RaffleReportDto>> FinishSaleAsync()
    {
        var state = GetState();
        if (state.Status != SystemState.SaleStatus.Active)
            throw new InvalidOperationException("המכירה אינה פעילה.");

        state.Status = SystemState.SaleStatus.Finished;
        state.EndTime = DateTime.Now;
        _repository.Update(state);

        var report = new List<RaffleReportDto>();
        var gifts = await _giftRepository.GetAllAsync();
        var random = new Random();

        foreach (var gift in gifts)
        {
            var tickets = await _context.OrderGift
                .Include(og => og.Order.Buyer)
                .Where(og => og.GiftId == gift.Id)
                .ToListAsync();

            if (tickets.Any())
            {
                var winningTicket = tickets[random.Next(tickets.Count)];

                winningTicket.IsWinner = true;

                report.Add(new RaffleReportDto
                {
                    GiftName = gift.Name,
                    WinnerName = winningTicket.Order.Buyer.Name,
                    WinnerEmail = winningTicket.Order.Buyer.Email
                });
            }
        }

        await _context.SaveChangesAsync();

        return report;
    }

    public void Reset()
    {
        var state = GetState();
        state.Status = SystemState.SaleStatus.Draft;
        state.StartTime = null;
        state.EndTime = null;
        _repository.Update(state);
    }
    public async Task<List<RaffleReportDto>> GetWinnersAsync()
    {
        return await _context.OrderGift
            .Include(og => og.Gift)
            .Include(og => og.Order.Buyer)
            .Where(og => og.IsWinner)
            .Select(og => new RaffleReportDto
            {
                GiftName = og.Gift.Name,
                WinnerName = og.Order.Buyer.Name,
                WinnerEmail = og.Order.Buyer.Email
            })
            .ToListAsync();
    }
}