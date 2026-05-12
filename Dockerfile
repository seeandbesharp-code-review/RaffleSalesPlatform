# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["TrickyTrayAPI/TrickyTrayAPI/TrickyTrayAPI.csproj", "TrickyTrayAPI/TrickyTrayAPI/"]
RUN dotnet restore "TrickyTrayAPI/TrickyTrayAPI/TrickyTrayAPI.csproj"

# Copy source code
COPY . .

# Build and publish
RUN dotnet build "TrickyTrayAPI/TrickyTrayAPI/TrickyTrayAPI.csproj" -c Release -o /app/build
RUN dotnet publish "TrickyTrayAPI/TrickyTrayAPI/TrickyTrayAPI.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published application from build stage
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Start application
ENTRYPOINT ["dotnet", "TrickyTrayAPI.dll"]
