import * as awsx from "@pulumi/awsx"; //Pacote da aws mas com padrões pré-estabelecidos
import { cluster } from "./cluster";

//ApplicationLoadBalancer so aceita conexões HTTP/HTTPs (pra envio de eventos do Rabbitmq ele não serve, somente para a UI do Rabbitmq)
export const appLoadBalancer = new awsx.classic.lb.ApplicationLoadBalancer(
  "app-load-balancer",
  {
    securityGroups: cluster.securityGroups, // Define quais recursos o Load Balancer pode acessar (nesse caso, o meu cluster ECS)
  }
);

//NetworkLoadBalancer usa subnets, aceitando protocolos além do HTTP, como: tcp, udp...
export const networkLoadBalancer = new awsx.classic.lb.NetworkLoadBalancer(
  "network-load-balancer",
  {
    subnets: cluster.vpc.publicSubnetIds,
  }
);
