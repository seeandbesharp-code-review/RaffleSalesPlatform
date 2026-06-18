using TrickyTray.KafkaConsumer;

var builder = Host.CreateApplicationBuilder(args);

builder.Services
    .AddOptions<KafkaConsumerSettings>()
    .Bind(
        builder.Configuration.GetSection(
            KafkaConsumerSettings.SectionName))
    .Validate(
        settings =>
            !string.IsNullOrWhiteSpace(settings.BootstrapServers),
        "Kafka BootstrapServers is required.")
    .Validate(
        settings =>
            !string.IsNullOrWhiteSpace(settings.Topic),
        "Kafka Topic is required.")
    .Validate(
        settings =>
            !string.IsNullOrWhiteSpace(settings.GroupId),
        "Kafka GroupId is required.")
    .Validate(
        settings =>
            !string.IsNullOrWhiteSpace(settings.ClientId),
        "Kafka ClientId is required.")
    .ValidateOnStart();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();

await host.RunAsync();