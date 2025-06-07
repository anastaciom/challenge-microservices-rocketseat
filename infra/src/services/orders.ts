import * as awsx from "@pulumi/awsx"; //Pacote da aws mas com padrões pré-estabelecidos
import { cluster } from "../cluster";
import { ordersDockerimage } from "../images/orders";
import * as pulumi from "@pulumi/pulumi";
import { amqpListener, rabbitmqAdminHttpListener } from "./rabbitmq";
import { appLoadBalancer } from "../load-balancer";

// Define o grupo de destino (Target Group) que o Load Balancer usará para encaminhar tráfego ao RabbitMQ.

const ordersTargetGroup = appLoadBalancer.createTargetGroup("orders-admin", {
  port: 3333,
  protocol: "HTTP", // Não precisa ser HTTPS, pois não será exposto diretamente à internet.
  // A exposição externa será feita via API Gateway, que já fornece HTTPS
  healthCheck: { path: "/health", protocol: "HTTP" },
});

// Cria um listener que escuta na porta 3333 e encaminha o tráfego para o Target Group acima.
// O listener basicamente "ouve" conexões e repassa para os destinos registrados
export const ordersHttpListener = appLoadBalancer.createListener(
  "orders-listener",
  {
    port: 3333,
    protocol: "HTTP", // Não precisa ser HTTPS, pois não será exposto diretamente à internet.
    // A exposição externa será feita via API Gateway, que já fornece HTTPS
    targetGroup: ordersTargetGroup,
  }
);

//Fargate pra subir a imagem automaticamente
export const ordersService = new awsx.classic.ecs.FargateService(
  "fargate-orders",
  {
    cluster,
    desiredCount: 1, //Define quantas intâncias eu quero criar
    waitForSteadyState: false, //Quando for feito o deploy ele não ficará aguardando a aplicação ficar no ar, ele so vai subir a imagem e ja era
    taskDefinitionArgs: {
      //configurações do container
      container: {
        image: ordersDockerimage.ref,
        cpu: 256,
        memory: 512,
        portMappings: [ordersHttpListener],
        environment: [
          {
            name: "BROKER_URL",
            value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`,
          },
          {
            name: "DATABASE_URL",
            value: "postgresql://...", //TODO: URL DO BANCO
          },
          { name: "OTEL_TRACES_EXPORTER", value: "otlp" },
          {
            name: "OTEL_EXPORTER_OTLP_ENDPOINT",
            value: "....", //TODO: GRAFANA
          },
          {
            name: "OTEL_SERVICE_NAME",
            value: "...", //TODO: GRAFANA
          },
          {
            name: "OTEL_EXPORTER_OTLP_HEADERS",
            value: "...", //TODO: GRAFANA
          },
          {
            name: "OTEL_RESOURCE_ATTRIBUTES",
            value: "", //TODO: GRAFANA
          },
          {
            name: "OTEL_NODE_RESOURCE_DETECTORS",
            value: "env,host,os",
          },
          {
            name: "OTEL_NODE_ENABLED_INSTRUMENTATIONS",
            value: "http,fastify,pg,amqplib",
          },
        ],
      },
    },
  }
);
