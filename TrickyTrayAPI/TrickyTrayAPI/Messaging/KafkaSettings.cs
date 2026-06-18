namespace TrickyTrayAPI.Messaging
{
    public sealed class KafkaSettings
    {
        public const string SectionName = "Kafka";

        public string BootstrapServers { get; set; } = string.Empty;

        public string Topic { get; set; } = string.Empty;

        public string ClientId { get; set; } = string.Empty;

        public string ConsumerGroupId { get; set; } = string.Empty;
    }
}
