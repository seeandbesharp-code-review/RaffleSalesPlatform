FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["TrickyTray.KafkaConsumer/TrickyTray.KafkaConsumer.csproj", "TrickyTray.KafkaConsumer/"]

RUN dotnet restore "TrickyTray.KafkaConsumer/TrickyTray.KafkaConsumer.csproj"

COPY . .

WORKDIR "/src/TrickyTray.KafkaConsumer"

RUN dotnet publish "TrickyTray.KafkaConsumer.csproj" \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TrickyTray.KafkaConsumer.dll"]
