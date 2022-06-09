const classificadores = {};

let data_raw;

const eixos_pilares = {};

let setores_presentes = [];
let publicos_presentes = [];

function read_data(caminho) {
    fetch(caminho)
      .then(response => response.json())
      .then(data => {

        data = data.filter(d => d.acao != "Ação");

        data_raw = data;

        init(data);

      })
}

function init(data) {

    get_unique_values(data);
    levanta_relacao_eixos_pilares(data);
    filtros.setor.popula();
    filtros.publico.popula();
    filtros.pilares.popula();
    make_cards(data);
    buttons.monitora();
    //wheel.monitora();
    filtros.eixo.monitora();
    filtros.pilares.monitora();
    filtros.publico.monitora();
    filtros.setor.monitora();

}

read_data('conteudo.json');

function trataDadosAninhados(array, separador) {

    let lista = [];

    array.forEach(el => {

        const mini_array = el.split(separador).map(d => d.trim());

        lista.push(...mini_array)

    })

    return lista.filter((d, i, a) => a.indexOf(d) == i)

}

function get_unique_values(data) {

    function unique(data, column) {

        //console.log(column, data[0][column], data.map(d => d[column]).filter(d => d).filter((d, i, a) => a.indexOf(d) == i));
        return data.map(d => d[column]).filter(d => d).filter((d, i, a) => a.indexOf(d) == i);
    }

    const columns = ['eixo', 'pilar', 'publico', 'setor'];

    columns.forEach(column => {

        const lista_pre = unique(data, column);
        let lista;

        if (column == 'pilar') {

            lista = trataDadosAninhados(lista_pre, ',');

        } else {

            if (column == 'publico') {

                lista = trataDadosAninhados(lista_pre, '/');

            } else {

                lista = lista_pre;

            }
        }

        if (column == 'eixo') {

            lista = data.map(d => d.eixo).filter((d, i, a) => a.indexOf(d) == i);

        }

       classificadores[column] = lista

    })

}

function levanta_relacao_eixos_pilares(data) {

    const eixos = classificadores.eixo;

    eixos.forEach(eixo => {

        const pilares_raw = data.filter(d => d.eixo == eixo).map(d => d.pilar);

        const pilares = trataDadosAninhados(pilares_raw, ',');

        //console.log(pilares);

        eixos_pilares[eixo] = pilares;

    })

}

function make_cards(data) {

    const container = document.querySelector('.card-container');

    data.forEach(d => {

        const acao = d.acao;
        const detalhe = d.detalhe;
        const eixo = d.eixo;
        const pilar = d.pilar;

        const card = document.createElement('div');
        card.classList.add('card');

        const cont_titulo = document.createElement('div');
        cont_titulo.classList.add('card-container-titulo');

        const titulo = document.createElement('p');
        titulo.classList.add('card-titulo');
        titulo.innerText = acao;

        const btn = document.createElement('button');
        btn.classList.add('card-btn-expandir');
        //btn.innerText = '+';

        const texto = document.createElement('p');
        texto.classList.add('card-texto');
        texto.innerText = detalhe;
        texto.style.display = 'none';

        cont_titulo.appendChild(titulo);
        cont_titulo.appendChild(btn);

        card.appendChild(cont_titulo);
        card.appendChild(texto);
        card.dataset.eixo = eixo;
        card.dataset.pilar = pilar;
        card.dataset.setor = d.setor;
        card.dataset.publico = d.publico;

        container.appendChild(card);

    })

}

function filtra_cards_eixo(eixo) {

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        if (card.dataset.eixo == eixo) card.classList.remove('escondido-eixo')
        else card.classList.add('escondido-eixo');
    })

}

function atualiza_setores_publicos_presentes() {

    const cards = document.querySelectorAll('.card');

    publicos_presentes = [];
    setores_presentes = [];

    cards.forEach(card => {

        if ( card.className.indexOf('escondido') == -1 ) {

            const publico_string = card.dataset.publico;
            const publicos = publico_string.split('/').map(d => d.trim());

            const setor = card.dataset.setor;

            publicos_presentes.push(...publicos);
            setores_presentes.push(setor);

        }

    });

    publicos_presentes = publicos_presentes.filter((d, i, a) => a.indexOf(d) == i).filter(d => d != 'undefined');
    setores_presentes = setores_presentes.filter((d, i, a) => a.indexOf(d) == i).filter(d => d != 'undefined');

    document.querySelectorAll('option').forEach(option => {
        if (option.value != "") option.disabled = true
    });

    console.log(publicos_presentes, setores_presentes);

    publicos_presentes.forEach(publico => {
        document.querySelector(`select#filtro-publico option[value='${publico}']`).disabled = false;
    })

    setores_presentes.forEach(setor => {
        document.querySelector(`select#filtro-setor option[value='${setor}']`).disabled = false;
    })


    console.log('terminou');


}

const buttons = {

    monitora : () => {

        document.querySelector('.card-container').addEventListener('click', buttons.atua);

    },

    atua : (e) => {

        console.log(e.target, e.target.className, e.target.parentElement.parentElement);

        if ( e.target.classList.contains('card-btn-expandir') ) {

            e.target.classList.toggle('btn-expandido');
            const card = e.target.parentElement.parentElement;
            const texto = card.querySelector('.card-texto');
            console.log(texto.style.display);
            texto.style.display = texto.style.display == 'none' ? 'block' : 'none';

        }

    }

}

const filtros = {

    setor : {

        popula : () => {

            const setores = classificadores.setor;

            const seletor = document.querySelector('select#filtro-setor');

            setores.forEach(setor => {

                const new_option = document.createElement('option');
                new_option.value = setor;
                new_option.innerText = setor;

                seletor.appendChild(new_option);

            })

        },

        monitora : () => {

            const seletor = document.querySelector('select#filtro-setor');

            seletor.addEventListener('change', filtros.setor.atua);

        },

        atua : (e) => {

            const setor = e.target.value;

            if (setor != "") {

                const cards = document.querySelectorAll('.card');

                cards.forEach(card => {

                    const setor_atual = card.dataset.setor;

                    if ( setor_atual == setor ) {

                        card.classList.remove('escondido-setor');

                    } else card.classList.add('escondido-setor');
                })

            } else {

                const cards = document.querySelectorAll('.card');

                cards.forEach(card => card.classList.remove('escondido-setor'));
                
            }

            //atualiza_setores_publicos_presentes();

        },

        reseta : () => {

            const cards = document.querySelectorAll('.card');

            cards.forEach( card => card.classList.remove('escondido-setor') );

            const seletor = document.querySelector('select#filtro-setor');

            seletor.value = "";

        }

    },

    publico : {

        popula : () => {

            const publicos = classificadores.publico;

            const seletor = document.querySelector('select#filtro-publico');

            publicos.forEach(pub => {

                const new_option = document.createElement('option');
                new_option.value = pub;
                new_option.innerText = pub;

                seletor.appendChild(new_option);

            })

        },

        monitora : () => {

            const seletor = document.querySelector('select#filtro-publico');

            seletor.addEventListener('change', filtros.publico.atua);

        },

        filtra_opcoes : () => {

        },

        atua : (e) => {

            const publico = e.target.value;

            if (publico != "") {

                const cards = document.querySelectorAll('.card');

                cards.forEach(card => {

                    const publico_atual = card.dataset.publico;

                    if ( publico_atual.indexOf(publico) > -1 ) { // como a string do data-publico pode conter mais do que um publico, não estou procurando um exact match, mas só se a string contem o publico atual

                        card.classList.remove('escondido-publico');

                    } else card.classList.add('escondido-publico');
                })

            } else {

                const cards = document.querySelectorAll('.card');

                cards.forEach(card => card.classList.remove('escondido-publico'));
                
            }

            //atualiza_setores_publicos_presentes();

        },

        reseta : () => {

            const cards = document.querySelectorAll('.card');

            cards.forEach( card => card.classList.remove('escondido-publico') );

            const seletor = document.querySelector('select#filtro-publico');

            seletor.value = "";

        }




    },

    eixo : {

        monitora : () => {

            const cont = document.querySelector('.container-eixo');
    
            cont.addEventListener('click', filtros.eixo.atua);
    
        },
    
        atua : (e) => {
    
            if (e.target.dataset.eixo) {

                const eixo = e.target.dataset.eixo;
    
                filtros.eixo.ativa(eixo);

                filtros.pilares.prepara_novo_eixo(eixo);

                filtros.publico.reseta();

                filtros.setor.reseta();
        
                filtra_cards_eixo(eixo);

                atualiza_setores_publicos_presentes();

            }
    
        },

        ativa : (eixo) => {

            document.querySelectorAll('[data-eixo]').forEach(div => div.classList.remove('ativo'));

            if (eixo) document.querySelector(`[data-eixo='${eixo}']`).classList.add('ativo');

        },

    },
    
    pilares : {

        filtro_atual : [],

        popula : () => {

            const pilares = classificadores.pilar;

            const container = document.querySelector('.container-pilares');

            pilares.forEach(pilar => {

                const new_span = document.createElement('span');

                new_span.innerText = pilar;
                new_span.dataset.filtroPilar = pilar;

                container.appendChild(new_span);

            })

        },

        prepara_novo_eixo : (eixo) => {

            const pilares = eixos_pilares[eixo];

            document.querySelectorAll(`[data-filtro-pilar]`).forEach(span => {
                
                span.classList.add('disabled');
                span.classList.remove('selected');
                
            });

            document.querySelectorAll(`[data-filtro-pilar]`).forEach(span => {

                const pilar_atual = span.dataset.filtroPilar;

                if ( pilares.indexOf(pilar_atual) > -1 ) {

                    span.classList.remove('disabled');
                    span.classList.add('selected');
                    filtros.pilares.filtro_atual.push(pilar_atual);

                } 

            })

            filtros.pilares.filtra_cards_pilares();

        },

        monitora : () => {

            const cont = document.querySelector('.outer-container-pilares');

            cont.addEventListener('click', filtros.pilares.atua);

        },

        atua : (e) => {

            if (e.target.tagName == 'SPAN') {

                // * * * * faz o efeito visual de estar selecionado ou não
                e.target.classList.toggle('selected');

                // * * * * manipula a lista de filtros atuais em relação a pilares

                const pilar = e.target.dataset.filtroPilar;

                if (filtros.pilares.filtro_atual.indexOf(pilar) == -1) {

                    filtros.pilares.filtro_atual.push(pilar);

                } else {

                    filtros.pilares.filtro_atual = filtros.pilares.filtro_atual.filter(d => d != pilar)

                }

                filtros.pilares.filtra_cards_pilares();

                //atualiza_setores_publicos_presentes();

                //console.log(filtros.pilares.filtro_atual);

                // * * * * lógica para saber se o card deve sumir ou aparecer

            }

        },

        filtra_cards_pilares : () => {

            const cards = document.querySelectorAll('.card');

            cards.forEach(card => {

                let pilar_presente;

                // o caso em que nenhum filtro foi selecionado
                if (filtros.pilares.filtro_atual.length == 0) {

                    // comentando para mudar o comportamento. antes, se não havia pilar selecionado, não se filtrava nada. agora, se não há pilar selecionado, não há resultado.
                    //pilar_presente = true;

                } else {

                    const pilar_card_string = card.dataset.pilar;

                    const pilares_card = pilar_card_string.split(','); // para o caso de ter mais de um

                    pilar_presente = false;

                    pilares_card.forEach(pilar_card => {

                        if ( filtros.pilares.filtro_atual.indexOf(pilar_card) > -1 ) { // ou seja, se o pilar atual está na lista de filtros

                            pilar_presente = pilar_presente | true;

                        } else {

                            pilar_presente = pilar_presente | false;

                        }

                    })

                }

                // agora, só depois de verificar se PELO MENOS um dos pilares está presente, é que eu vou adicionar ou remover a classe "escondido";

                if (pilar_presente) {
                    card.classList.remove('escondido-pilar');
                } else {
                    card.classList.add('escondido-pilar');
                }

            })


        }

    }

}

/*
const wheel = {

    monitora : () => {

        const pols = document.querySelectorAll('[data-eixo-roda]');

        pols.forEach(pol => pol.addEventListener('click', wheel.atua))

    },

    atua : (e) => {

        const eixo = e.target.dataset.eixoRoda;

        const roda = document.querySelector('[data-eixo-atual]');
        roda.dataset.eixoAtual = eixo;

        filtra_cards_eixo(eixo);

    }

}
*/

