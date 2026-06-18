using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Options;

namespace TrickyTray.KafkaConsumer
{
    public sealed class Worker : BackgroundService
    {
        private readonly KafkaConsumerSettings _settings;
        private readonly ILogger<Worker> _logger;

        public Worker(
            IOptions<KafkaConsumerSettings> kafkaOptions,
            ILogger<Worker> logger)
        {
            ArgumentNullException.ThrowIfNull(kafkaOptions);
            ArgumentNullException.ThrowIfNull(logger);

            _settings = kafkaOptions.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            await Task.Yield();

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = _settings.BootstrapServers,
                GroupId = _settings.GroupId,
                ClientId = _settings.ClientId,

                AutoOffsetReset = AutoOffsetReset.Earliest,

                EnableAutoCommit = false,
                EnableAutoOffsetStore = false,

                AllowAutoCreateTopics = false,

                SessionTimeoutMs = 10000,
                MaxPollIntervalMs = 300000
            };

            using var consumer =
                new ConsumerBuilder<string, string>(consumerConfig)
                    .SetErrorHandler((_, error) =>
                    {
                        _logger.LogError(
                            "Kafka consumer error. Code: {ErrorCode}, " +
                            "Reason: {Reason}, Fatal: {IsFatal}",
                            error.Code,
                            error.Reason,
                            error.IsFatal);
                    })
                    .SetLogHandler((_, message) =>
                    {
                        _logger.LogDebug(
                            "Kafka consumer log. Facility: {Facility}, " +
                            "Message: {Message}",
                            message.Facility,
                            message.Message);
                    })
                    .Build();

            consumer.Subscribe(_settings.Topic);

            _logger.LogInformation(
                "Kafka consumer started. Topic: {Topic}, " +
                "GroupId: {GroupId}, BootstrapServers: {BootstrapServers}",
                _settings.Topic,
                _settings.GroupId,
                _settings.BootstrapServers);

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult =
                            consumer.Consume(stoppingToken);

                        var formattedMessage =
                            FormatJson(consumeResult.Message.Value);

                        _logger.LogInformation(
                            """
                            Kafka message received successfully.

                            Topic: {Topic}
                            Partition: {Partition}
                            Offset: {Offset}
                            Key: {Key}
                            Timestamp: {Timestamp}

                            Message:
                            {Message}
                            """,
                            consumeResult.Topic,
                            consumeResult.Partition.Value,
                            consumeResult.Offset.Value,
                            consumeResult.Message.Key,
                            consumeResult.Message.Timestamp.UtcDateTime,
                            formattedMessage);

                        consumer.Commit(consumeResult);

                        _logger.LogInformation(
                            "Kafka offset committed. " +
                            "Topic: {Topic}, Partition: {Partition}, " +
                            "Offset: {Offset}",
                            consumeResult.Topic,
                            consumeResult.Partition.Value,
                            consumeResult.Offset.Value);
                    }
                    catch (ConsumeException exception)
                    {
                        _logger.LogError(
                            exception,
                            "Failed to consume Kafka message. " +
                            "Code: {ErrorCode}, Reason: {Reason}",
                            exception.Error.Code,
                            exception.Error.Reason);

                        await Task.Delay(
                            TimeSpan.FromSeconds(2),
                            stoppingToken);
                    }
                    catch (KafkaException exception)
                    {
                        _logger.LogError(
                            exception,
                            "Kafka operation failed: {Reason}",
                            exception.Error.Reason);

                        await Task.Delay(
                            TimeSpan.FromSeconds(2),
                            stoppingToken);
                    }
                }
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation(
                    "Kafka consumer cancellation was requested.");
            }
            finally
            {
                consumer.Close();

                _logger.LogInformation(
                    "Kafka consumer stopped.");
            }
        }

        private static string FormatJson(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            try
            {
                using var document = JsonDocument.Parse(value);

                return JsonSerializer.Serialize(
                    document.RootElement,
                    new JsonSerializerOptions
                    {
                        WriteIndented = true
                    });
            }
            catch (JsonException)
            {
                return value;
            }
        }
    }
}