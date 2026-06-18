using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Options;

namespace TrickyTrayAPI.Messaging
{
    public sealed class KafkaProducer : IKafkaProducer, IDisposable
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<KafkaProducer> _logger;
        private readonly JsonSerializerOptions _jsonOptions;
        private bool _disposed;

        public KafkaProducer(
            IOptions<KafkaSettings> kafkaOptions,
            ILogger<KafkaProducer> logger)
        {
            ArgumentNullException.ThrowIfNull(kafkaOptions);
            ArgumentNullException.ThrowIfNull(logger);

            var settings = kafkaOptions.Value;

            if (string.IsNullOrWhiteSpace(settings.BootstrapServers))
            {
                throw new InvalidOperationException(
                    "Kafka BootstrapServers is missing from configuration.");
            }

            if (string.IsNullOrWhiteSpace(settings.ClientId))
            {
                throw new InvalidOperationException(
                    "Kafka ClientId is missing from configuration.");
            }

            _logger = logger;

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            var producerConfig = new ProducerConfig
            {
                BootstrapServers = settings.BootstrapServers,
                ClientId = settings.ClientId,
                Acks = Acks.All,
                EnableIdempotence = true,
                MessageSendMaxRetries = 3,
                RetryBackoffMs = 500
            };

            _producer = new ProducerBuilder<string, string>(producerConfig)
                .SetErrorHandler((_, error) =>
                {
                    _logger.LogError(
                        "Kafka producer error. Code: {ErrorCode}, Reason: {Reason}",
                        error.Code,
                        error.Reason);
                })
                .SetLogHandler((_, logMessage) =>
                {
                    _logger.LogDebug(
                        "Kafka log. Facility: {Facility}, Message: {Message}",
                        logMessage.Facility,
                        logMessage.Message);
                })
                .Build();
        }

        public async Task ProduceAsync<TMessage>(
            string topic,
            string key,
            TMessage message,
            CancellationToken cancellationToken = default)
        {
            ObjectDisposedException.ThrowIf(_disposed, this);

            if (string.IsNullOrWhiteSpace(topic))
            {
                throw new ArgumentException(
                    "Kafka topic cannot be empty.",
                    nameof(topic));
            }

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException(
                    "Kafka message key cannot be empty.",
                    nameof(key));
            }

            ArgumentNullException.ThrowIfNull(message);

            var json = JsonSerializer.Serialize(message, _jsonOptions);

            var kafkaMessage = new Message<string, string>
            {
                Key = key,
                Value = json,
                Timestamp = new Timestamp(DateTime.UtcNow)
            };

            try
            {
                var deliveryResult = await _producer.ProduceAsync(
                    topic,
                    kafkaMessage,
                    cancellationToken);

                _logger.LogInformation(
                    "Kafka message sent successfully. Topic: {Topic}, " +
                    "Partition: {Partition}, Offset: {Offset}, Key: {Key}",
                    deliveryResult.Topic,
                    deliveryResult.Partition.Value,
                    deliveryResult.Offset.Value,
                    key);
            }
            catch (ProduceException<string, string> exception)
            {
                _logger.LogError(
                    exception,
                    "Failed to send Kafka message. Topic: {Topic}, " +
                    "Key: {Key}, Reason: {Reason}",
                    topic,
                    key,
                    exception.Error.Reason);

                throw;
            }
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            try
            {
                _producer.Flush(TimeSpan.FromSeconds(10));
            }
            catch (KafkaException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Kafka producer could not flush all pending messages.");
            }
            finally
            {
                _producer.Dispose();
                _disposed = true;
            }
        }
    }
}
