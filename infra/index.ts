import * as pulumi from "@pulumi/pulumi";
import { ordersService } from "./src/services/orders";
import { rabbitmqService } from "./src/services/rabbitmq";
import { kongService } from "./src/services/kong";
import { appLoadBalancer } from "./src/load-balancer";

export const ordersId = ordersService.service.id;
export const rabbitmqId = rabbitmqService.service.id;
export const kongId = kongService.service.id;
export const rabbitmqAdminUrl = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`;
