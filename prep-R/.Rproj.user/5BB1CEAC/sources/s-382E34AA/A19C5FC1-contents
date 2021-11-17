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

