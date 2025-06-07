# Desafio de Microsserviços Escaláveis 🇧🇷

Projeto desenvolvido para fins de estudo durante a semana do Desafio de Microsserviços Escaláveis da @Rocketseat, onde foi construída uma aplicação com arquitetura de microsserviços do zero.

## Principais Tecnologias Utilizadas:

- **Drizzle ORM**

- **PostgreSQL**

- **RabbitMq** - Message Broker

- **Kong** – Api Gateway. Centraliza o acesso externo e roteia as requisições entre os microsserviços

- **Nodejs (v22.14.0) com fastify e Typescript**

- **ZOD** - Validação dos bodies das requisições

- **OpenTelemetry** – Coleta de dados para observabilidade

- **Jaeger** – Visualização de traces

- **Grafana** – Painéis de métricas e observabilidade

- **Pulumi (IAC)** – Infraestrutura como Código. Utilizado para provisionar as imagens dos serviços no ECR, configurar o Load Balancer, o API Gateway e o Cluster na AWS.

---

# Scalable Microservices Challenge 🇺🇸

Project developed for study purposes during the Scalable Microservices Challenge week by @Rocketseat, where an application using microservices architecture was built from scratch.

## Main Technologies Used:

- **Drizzle ORM**

- **PostgreSQL**

- **RabbitMQ** – Message Broker

- **Kong** – API Gateway, centralizes external access and routes requests between microservices.

- **Node.js (v22.14.0) with Fastify and TypeScript**

- **Zod** – Request body validation

- **OpenTelemetry** – Observability data collection

- **Jaeger** – Trace visualization

- **Grafana** – Metrics and observability dashboards

- **Pulumi (IaC)** – Infrastructure as Code. Used to provision service images in ECR, configure the Load Balancer, API Gateway, and the Cluster on AWS.
