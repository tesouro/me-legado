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
  count(node)

temas <- data %>%
  rename(node = Tema) %>%
  count(node)

nodes <- bind_rows(eixos, temas) %>% 
  mutate(id = row_number())

links <- data %>%
  select(source_name = eixo, target_name = Tema) %>%
  distinct() %>%
  left_join(nodes, by = c("source_name" = "node")) %>%
  rename(source = id) %>%
  left_join(nodes, by = c("target_name" = "node")) %>%
  rename(target = id) %>%
  select(source, target)


jsonlite::write_json(
  list(nodes = nodes, links = links), '../network.json')
