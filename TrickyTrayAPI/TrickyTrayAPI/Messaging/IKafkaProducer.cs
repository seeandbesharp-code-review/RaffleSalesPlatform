
namespace TrickyTrayAPI.Messaging
{
    public interface IKafkaProducer
    {
        Task ProduceAsync<TMessage>(
            string topic,
            string key,
            TMessage message,
            CancellationToken cancellationToken = default);
    }
}



