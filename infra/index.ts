import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx"; //Pacote da aws mas com padrões pré-estabelecidos
import * as docker from "@pulumi/docker-build";

//AWS ECR = DOCKER-HUB (so que privado)

const ordersECRRepository = new awsx.ecr.Repository("orders-ecr", {
  forceDelete: true, //Esse forceDelete como TRUE significa se caso eu apagar/deletar toda essa variavel ordersECRRepository
  // e rodar o comando `pulumi up`, o repositório ECR será excluído da AWS, mesmo que contenha imagens armazenadas.
});

const ordersECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: ordersECRRepository.repository.registryId,
});

//Build da image

const ordersDockerimage = new docker.Image("orders-image", {
  //tags é usada para controle de versão da imagem
  tags: [
    pulumi.interpolate`${ordersECRRepository.repository.repositoryUrl}:latest`,
  ],
  context: {
    location: "../app-orders", //Localização do DockerFile
  },
  push: true, //faz o build e ainda envia (push) pro meu repositório

  platforms: [
    "linux/amd64",
    //plataformas na qual será criada a imagem, se não passar nada ele fará o build se baseando no processador da maquina
  ],

  registries: [
    {
      address: ordersECRRepository.repository.repositoryUrl, //endereço para onde será enviado (push) a minha imagem no ECR
      username: ordersECRToken.userName,
      password: ordersECRToken.password,
    },
  ],
});

//DEPLOY

//CLUSTER = Agrupamento de serviços ("parecido" com Docker-compose)
const cluster = new awsx.classic.ecs.Cluster("app-cluster");

//Serviço:

//Fargate pra subir a imagem automaticamente
const ordersService = new awsx.classic.ecs.FargateService("fargate-orders", {
  cluster,
  desiredCount: 1, //Define quantas intâncias eu quero deixar rodando juntas
  waitForSteadyState: false, //Quando for feito o deploy ele não ficará aguardando a aplicação ficar no ar, ele so vai subir a imagem e ja era
  taskDefinitionArgs: {
    //configurações do container
    container: {
      image: ordersDockerimage.ref,
      cpu: 256,
      memory: 512,
    },
  },
});
