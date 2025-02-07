#!/bin/bash

IS_GREEN=$(sudo docker ps | grep spring-green) # 현재 실행중인 App이 blue인지 확인

if [ -z $IS_GREEN  ];then # blue라면

  echo "### BLUE => GREEN ###"

  echo "1. get green image"
  sudo docker-compose pull spring-green # green으로 이미지 내려받기

  echo "2. green container up"
  sudo docker-compose up -d spring-green # green 컨테이너 실행

  while [ 1 = 1 ]; do
    echo "3. green health check..."
    sleep 3

    REQUEST=$(curl http://127.0.0.1:8080) # green으로 request
     if [ -n "$REQUEST" ]; then # 서비스 가능하면 health check 중지
        echo "health check success"
        break ;
     fi
  done;

  echo "4. reload nginx"
  cd ~/nginx-certbot/data/nginx
  cp ./app.green.conf ./app.conf  # 설정파일 교체
  cd ~/nginx-certbot
  sudo docker-compose restart nginx

  echo "5. blue container down"
  cd ~/myapp
  sudo docker-compose stop spring-blue
else
  echo "### GREEN => BLUE ###"

  echo "1. get blue image"
  sudo docker-compose pull spring-blue

  echo "2. blue container up"
  sudo docker-compose up -d spring-blue

  while [ 1 = 1 ]; do
    echo "3. blue health check..."
    sleep 3
    REQUEST=$(curl http://127.0.0.1:8081) # blue로 request

    if [ -n "$REQUEST" ]; then # 서비스 가능하면 health check 중지
      echo "health check success"
      break ;
    fi
  done;

  echo "4. reload nginx"
  cd ~/nginx-certbot/data/nginx
  cp ./app.blue.conf ./app.conf  # 설정파일 교체
  cd ~/nginx-certbot
  sudo docker compose restart nginx

  echo "5. green container down"
  cd ~/myapp
  sudo docker-compose stop spring-green
fi