function read_data(caminho) {
    fetch(caminho)
      .then(response => response.json())
      .then(data => {

        console.log(data);

        console.log(data.map(d => d.eixo).filter((d, i, a) => a.indexOf(d) == i));

        make_cards(data);

      })
}

read_data('conteudo.json');

function make_cards(data) {

    const container = document.querySelector('.card-container');

    data.forEach(d => {

        const acao = d.acao;
        const detalhe = d.detalhe;
        const eixo = d.eixo;

        const card = document.createElement('div');
        card.classList.add('card');

        const cont_titulo = document.createElement('div');
        cont_titulo.classList.add('card-container-titulo');

        const titulo = document.createElement('p');
        titulo.classList.add('card-titulo');
        titulo.innerText = acao;

        const btn = document.createElement('button');
        btn.classList.add('card-btn-expandir');
        btn.innerText = '+';

        const texto = document.createElement('p');
        texto.classList.add('card-texto');
        texto.innerText = detalhe;

        cont_titulo.appendChild(titulo);
        cont_titulo.appendChild(btn);

        card.appendChild(cont_titulo);
        card.appendChild(texto);
        card.dataset.eixo = eixo;

        container.appendChild(card);

    })

}