# Makefile para facilitar execução e build do projeto Ciclo da Água
# Uso comum: `make run` ou `make docker-run`

# Variáveis configuráveis
PORT ?= 8000
DOCKER_PORT ?= 8080
IMAGE ?= ciclo-agua-game
PYTHON ?= python3

.DEFAULT_GOAL := help

.PHONY: help
help: ## Lista comandos disponíveis
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | sed 's/: .*##/\t-/'

.PHONY: install
install: ## Instala dependências npm (testes / ferramentas)
	npm install

.PHONY: run
run: ## Sobe servidor local simples com Python (porta $(PORT))
	@echo "Servindo ./raiz em http://localhost:$(PORT)/raiz/";
	$(PYTHON) -m http.server $(PORT)

.PHONY: serve
serve: ## Usa npx serve (Node) para servir raiz/ (porta inferida ou 3000)
	npx serve raiz

.PHONY: test
test: ## Executa suíte de testes Jest
	npm test

.PHONY: test-watch
test-watch: ## Executa testes em watch mode
	npx jest --watch

.PHONY: docker-build
docker-build: ## Build da imagem Docker (IMAGE=$(IMAGE))
	docker build -t $(IMAGE) .

.PHONY: docker-run
docker-run: ## Roda container na porta $(DOCKER_PORT)
	docker run --rm -p $(DOCKER_PORT):8080 $(IMAGE)

.PHONY: docker-dev
docker-dev: ## Roda container montando código local para hot reload estático
	docker run --rm -p $(DOCKER_PORT):8080 -v $(PWD)/raiz:/app/raiz $(IMAGE)

.PHONY: clean-node
clean-node: ## Remove node_modules e lock
	rm -rf node_modules package-lock.json

.PHONY: clean-cache
clean-cache: ## Limpa caches temporários
	rm -rf .cache .parcel-cache .vite coverage

.PHONY: format
format: ## Placeholder para formatação (não configurado)
	@echo "Nenhuma ferramenta de formatação configurada."

.PHONY: ci
ci: install test ## Pipeline simples local (instala e testa)
	@echo "CI local OK"
