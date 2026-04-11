namespace TrickyTrayAPI.DTOs
{
    public class OrderGiftDto
    {
        public int GiftId { get; set; }
        public string GiftName { get; set; }
        public decimal Price { get; set; }
        public int PurchaseCount { get; set; }
        public List<BuyerDetailDto> Purchasers { get; set; }
    }

    public class BuyerDetailDto
    {
        public int OrderId { get; set; }
        public string FullName { get; set; }
        public DateTime Date { get; set; }
        public int TicketsCount { get; set; }
    }
}