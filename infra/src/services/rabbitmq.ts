import * as awsx from "@pulumi/awsx"; //Pacote da aws mas com padrões pré-estabelecidos
import { cluster } from "../cluster";
import { appLoadBalancer, networkLoadBalancer } from "../load-balancer";

// Define o grupo de destino (Target Group) que o Load Balancer usará para encaminhar tráfego ao RabbitMQ.
// As instâncias associadas a esse grupo receberão as requisições na porta 15672 (interface de administração)
const rabbitmqAdminTargetGroup = appLoadBalancer.createTargetGroup(
  "rabbitmq-admin-target",
  {
    port: 15672,
    protocol: "HTTP", // Não precisa ser HTTPS, pois não será exposto diretamente à internet.
    // A exposição externa será feita via API Gateway, que já fornece HTTPS
    healthCheck: { path: "/", protocol: "HTTP" },
  }
);

// Cria um listener que escuta na porta 15672 e encaminha o tráfego para o Target Group acima.
// O listener basicamente "ouve" conexões e repassa para os destinos registrados
export const rabbitmqAdminHttpListener = appLoadBalancer.createListener(
  "rabbitmq-admin-listener",
  {
    port: 15672,
    protocol: "HTTP", // Não precisa ser HTTPS, pois não será exposto diretamente à internet.
    // A exposição externa será feita via API Gateway, que já fornece HTTPS
    targetGroup: rabbitmqAdminTargetGroup,
  }
);

export const amqpTargetGroup = networkLoadBalancer.createTargetGroup(
  "amqp-target",
  {
    port: 5672,
    protocol: "TCP",
    targetType: "ip",
    healthCheck: {
      protocol: "TCP",
      port: "5672",
    },
  }
);

export const amqpListener = networkLoadBalancer.createListener(
  "amqp-listener",
  {
    port: 5672,
    protocol: "TCP",
    targetGroup: amqpTargetGroup,
  }
);

//Fargate pra subir a imagem automaticamente
export const rabbitmqService = new awsx.classic.ecs.FargateService(
  "fargate-rabbitmq",
  {
    cluster,
    desiredCount: 1, //Define quantas intâncias eu quero criar
    waitForSteadyState: false, //Quando for feito o deploy ele não ficará aguardando a aplicação ficar no ar, ele so vai subir a imagem e ja era
    taskDefinitionArgs: {
      //configurações do container
      container: {
        image: "rabbitmq:3-management",
        cpu: 256,
        memory: 512,
        portMappings: [rabbitmqAdminHttpListener, amqpListener],
        environment: [
          { name: "RABBITMQ_DEFAULT_USER", value: "admin" },
          { name: "RABBITMQ_DEFAULT_PASS", value: "admin" },
        ],
      },
    },
  }
);
