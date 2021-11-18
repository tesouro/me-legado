const v = {

    data : {

        raw : null,

        nodes : null,
        links : null,

        read : (path) => {

            fetch(path)
              .then(response => response.json())
              .then(data => {

                v.data.nodes = data.nodes;
                v.data.links = data.links;

              })

        }

    },

    ctrl : {

        init : () => {

            v.data.read('network.json')

        }

    }

}

v.ctrl.init();