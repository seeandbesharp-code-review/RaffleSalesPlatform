namespace TrickyTray.KafkaConsumer
{
    public sealed class KafkaConsumerSettings
    {
        public const string SectionName = "Kafka";

        public string BootstrapServers { get; set; } = string.Empty;

        public string Topic { get; set; } = string.Empty;

        public string GroupId { get; set; } = string.Empty;

        public string ClientId { get; set; } = string.Empty;
    }
}