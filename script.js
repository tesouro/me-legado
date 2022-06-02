const classificadores = {};

function read_data(caminho) {
    fetch(caminho)
      .then(response => response.json())
      .then(data => {

        console.log(data);

        console.log(data.map(d => d.eixo).filter((d, i, a) => a.indexOf(d) == i));

        init(data);

      })
}

function init(data) {

    get_unique_values(data);
    make_cards(data);
    buttons.monitora();
    wheel.monitora();

}

read_data('conteudo.json');

function trataDadosAninhados(array, separador) {

    let lista = [];

    array.forEach(el => {

        const mini_array = el.split(separador);

        lista.push(...mini_array)

    })

    return lista.filter((d, i, a) => a.indexOf(d) == i)

}

function get_unique_values(data) {

    function unique(data, column) {

        //console.log(column, data[0][column], data.map(d => d[column]).filter(d => d).filter((d, i, a) => a.indexOf(d) == i));
        return data.map(d => d[column]).filter(d => d).filter((d, i, a) => a.indexOf(d) == i);
    }

    const columns = ['pilar', 'publico', 'setor'];

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

       classificadores[column] = lista

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

        container.appendChild(card);

    })

}

function filtra_cards(eixo) {

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        if (card.dataset.eixo == eixo) card.classList.remove('escondido')
        else card.classList.add('escondido');
    })

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

    pilar : {

        popula : () => {

            const pilares = classificadores.pilar;

            

        }

    }

}

const wheel = {

    monitora : () => {

        const pols = document.querySelectorAll('[data-eixo-roda]');

        pols.forEach(pol => pol.addEventListener('click', wheel.atua))

    },

    atua : (e) => {

        const eixo = e.target.dataset.eixoRoda;

        const roda = document.querySelector('[data-eixo-atual]');
        roda.dataset.eixoAtual = eixo;

        filtra_cards(eixo);

    }

}

