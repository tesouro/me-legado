library(readxl)
library(tidyverse)
library(jsonlite)

planilha <- read_excel('tabela-conteudo.xlsx')

output <- planilha %>%
  select(
    eixo = `1_Eixo`, 
    pilar = `2_Pilar`,
    publico = `Tag_Público`,
    setor = `Tag_Setor`,
    acao = `Ação`,
    detalhe = `Medida`)

write_json(output, '../conteudo.json')
