library(readxl)
library(tidyverse)

planilhas <- readxl::excel_sheets('Projeto Caminho da Prosperidade.xlsx')
eixos <- planilhas[!(planilhas %in% c('Controle', 'Promessas', 'Investimento'))]

data_raw <- list()

for (eixo in eixos) {
  
  df <- read_excel('Projeto Caminho da Prosperidade.xlsx', sheet = eixo)
  df$eixo <- eixo
  
  data_raw[[eixo]] <- df
  
}

data_pre <- bind_rows(data_raw)

data <- data_pre %>%
  tidyr::fill(Tema) %>%
  filter(!is.na(`Ação`)) %>%
  mutate(Tema = ifelse(Tema == 'ESTADOS E MUNICÍPIOS', 'Estados e Municípios', Tema))


# preparacao do grafo -----------------------------------------------------

eixos <- data %>%
  rename(node = eixo) %>%
  count(node) %>% 
  mutate(type = 'eixo')

temas <- data %>%
  rename(node = Tema) %>%
  count(node) %>%
  mutate(type = 'tema')

acoes <- data %>%
  rename(node = `Ação`) %>%
  count(node) %>%
  mutate(type = 'acao') %>%
  filter(n >= 1)

nodes <- bind_rows(eixos, temas, acoes) %>% 
  mutate(id = row_number())

links_eixo_tema <- data %>%
  select(source_name = eixo, target_name = Tema) %>%
  distinct() %>%
  left_join(nodes, by = c("source_name" = "node")) %>%
  rename(source = id) %>%
  left_join(nodes, by = c("target_name" = "node")) %>%
  rename(target = id) %>%
  select(source, target)

links_tema_acao <- data %>%
  select(source_name = Tema, target_name = `Ação`) %>%
  distinct() %>%
  left_join(nodes, by = c("source_name" = "node")) %>%
  rename(source = id) %>%
  left_join(nodes, by = c("target_name" = "node")) %>%
  rename(target = id) %>%
  select(source, target)

links = bind_rows(links_eixo_tema, links_tema_acao)

jsonlite::write_json(
  list(nodes = nodes, links = links), '../network.json')
