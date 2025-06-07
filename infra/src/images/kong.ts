import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx"; //Pacote da aws mas com padrões pré-estabelecidos
import * as docker from "@pulumi/docker-build";

//DEVE SER CRIADA A IMAGEM DO KONG, POIS NO PROJETO A IMAGEM ORIGINAL PRECISA SER PERSONALIZADA PARA RECEBER AS VARIAVEIS DE AMBIENTE

//AWS ECR = DOCKER-HUB (so que privado)

const kongECRRepository = new awsx.ecr.Repository("kong-ecr", {
  forceDelete: true, //Esse forceDelete como TRUE significa se caso eu apagar/deletar toda essa variavel kongECRRepository
  // e rodar o comando `pulumi up`, o repositório ECR será excluído da AWS, mesmo que contenha imagens armazenadas.
});

const kongECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: kongECRRepository.repository.registryId,
});

//Build da image

export const kongDockerimage = new docker.Image("kong-image", {
  //tags é usada para controle de versão da imagem
  tags: [
    pulumi.interpolate`${kongECRRepository.repository.repositoryUrl}:latest`,
  ],
  context: {
    location: "../docker/kong", //Localização do DockerFile
  },
  push: true, //faz o build e ainda envia (push) pro meu repositório

  platforms: [
    "linux/amd64",
    //plataformas na qual será criada a imagem, se não passar nada ele fará o build se baseando no processador da maquina
  ],

  registries: [
    {
      address: kongECRRepository.repository.repositoryUrl, //endereço para onde será enviado (push) a minha imagem no ECR
      username: kongECRToken.userName,
      password: kongECRToken.password,
    },
  ],
});
