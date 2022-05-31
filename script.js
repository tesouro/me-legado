function read_data(caminho) {
    fetch(caminho)
      .then(response => response.json())
      .then(data => {

        console.log(data);

        make_cards(data);

      })
}

read_data('conteudo.json');

function make_cards(data) {

    const container = document.querySelector('.card-container');

    data.forEach(d => {

        const acao = d.acao;
        const detalhe = d.detalhe;

        const card = document.createElement('div');
        card.classList.add('card');

        const titulo = document.createElement('p');
        titulo.classList.add('card-titulo');
        titulo.innerText = acao;

        const texto = document.createElement('p');
        texto.classList.add('card-texto');
        texto.innerText = detalhe;

        const btn = document.createElement('button');
        btn.classList.add('card-btn-expandir');
        btn.innerText = '+';

        card.appendChild(titulo);
        card.appendChild(btn);
        card.appendChild(texto);

        container.appendChild(card);

    })

}