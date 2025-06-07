import * as awsx from "@pulumi/awsx"; //Pacote da aws mas com padrões pré-estabelecidos

//CLUSTER = Agrupamento de serviços ("parecido" com Docker-compose)
export const cluster = new awsx.classic.ecs.Cluster("app-cluster");
