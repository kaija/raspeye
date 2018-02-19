IMG="raspeye"
TAG="latest"
REG="docker.io"

.PHONY: build tag push compose run

all: build

tag:
	docker tag ${IMG}:${TAG} ${REG}/${IMG}:${TAG}

push:
	docker push ${REG}/${IMG}:${TAG}

build:
	docker build -t ${IMG}:${TAG} .

compose:
	docker-compose up -d

run:
	docker run -it -p 5487:5487 ${IMG}:${TAG}
