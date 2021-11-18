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

eixo_tema <- data %>%
  select(eixo, Tema) %>%
  distinct()

eixos <- data %>%
  rename(node = eixo) %>%
  count(node)

temas <- data %>%
  rename(node = Tema) %>%
  count(node)

nodes <- bind_rows(eixos, temas)

jsonlite::write_json(
  list(nodes = nodes, links = eixo_tema), '../network.json')
