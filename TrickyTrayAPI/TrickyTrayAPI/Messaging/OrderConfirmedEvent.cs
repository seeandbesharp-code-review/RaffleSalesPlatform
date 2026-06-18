namespace TrickyTrayAPI.Messaging
{
    public sealed class OrderConfirmedEvent
    {
        public Guid EventId { get; init; } = Guid.NewGuid();

        public string EventType { get; init; } = "OrderConfirmed";

        public DateTime OccurredAtUtc { get; init; } = DateTime.UtcNow;

        public int OrderId { get; init; }

        public DateTime OrderDate { get; init; }

        public string Status { get; init; } = string.Empty;

        public int BuyerId { get; init; }

        public string BuyerName { get; init; } = string.Empty;

        public string BuyerEmail { get; init; } = string.Empty;

        public string BuyerPhone { get; init; } = string.Empty;

        public int ItemsCount { get; init; }

        public int TotalPrice { get; init; }

        public List<OrderConfirmedItemEvent> Items { get; init; } = new();
    }

    public sealed class OrderConfirmedItemEvent
    {
        public int OrderGiftId { get; init; }

        public int GiftId { get; init; }

        public string GiftName { get; init; } = string.Empty;

        public string Category { get; init; } = string.Empty;

        public int Price { get; init; }
    }
}
