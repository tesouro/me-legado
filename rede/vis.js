const v = {

    data : {

        raw : null,

        nodes : null,
        links : null,

        root : null,

        read : (path) => {

            fetch(path)
              .then(response => response.json())
              .then(data => {
                //   const nodes = data.nodes;
                //   const links = data.links;

                //   v.data.root = d3.stratify()
                //     .id(function(d) { return d.name; })
                //     .parentId(function(d) { return d.parent; })
                //     (links);

                //   console.log(v.data.root);

                  // inicializa posições
                  const h = v.vis.sizings.h;
                  const w = v.vis.sizings.w;

                  data.nodes.forEach(d => {

                    d.x = Math.random() * w;
                    d.x0 = Math.random() * w;

                    d.y = Math.random() * h;
                    d.y0 = Math.random() * h;

                  })

                  v.data.nodes = data.nodes;
                  v.data.links = data.links;

                  v.ctrl.data_is_loaded();

              })

        }

    },

    utils : {

        unique : (data, coluna) => data.map(d => d[coluna]).filter((d,i,a) => a.indexOf(d) >= i)

    },

    sim : {

        obj : null,

        init : () => {

            const nodes = v.data.nodes;
            const links = v.data.links;

            const h = v.vis.sizings.h;
            const w = v.vis.sizings.w;

            v.sim.obj = d3.forceSimulation(nodes)
              .force(
                  "link", 
                  d3.forceLink(links)
                    .id(d => d.id)
                    .distance(20)
                    .strength(.5)
                )
              .force("charge", d3.forceManyBody().strength(
                function(d) {
                    return -Math.pow(v.vis.scales.r(d.n), 2.0) * 1.1;
                })) //-10
              .force("x", d3.forceX(w/2))
              .force("y", d3.forceY(h/2))
              //.alphaMin(0.25);

            v.sim.obj.stop();

        },

        drag : (simulation) => {
  
                function dragstarted(event, d) {
                  if (!event.active) simulation.alphaTarget(0.3).restart();
                  d.fx = d.x;
                  d.fy = d.y;
                }
                
                function dragged(event, d) {
                  d.fx = event.x;
                  d.fy = event.y;
                }
                
                function dragended(event, d) {
                  if (!event.active) simulation.alphaTarget(0);
                  d.fx = null;
                  d.fy = null;
                }
                
                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);

        }

    },

    vis : {

        svg : 'svg.vis',
        container : 'div.vis-container',

        nodes : null,
        links : null,
        labels: null,

        sizings : {

            w : null,
            h : null,

            get : () => {

                const svg = document.querySelector(v.vis.svg);

                v.vis.sizings.w = +window.getComputedStyle(svg).width.slice(0,-2);
                v.vis.sizings.h = +window.getComputedStyle(svg).height.slice(0,-2);

            }

        },

        scales : {

            r : d3.scaleSqrt(),

            color : d3.scaleOrdinal(),

            set : () => {

                v.vis.scales.r
                  .domain(d3.extent(v.data.nodes, d => d.n))
                  .range([2,30])

                v.vis.scales.color
                  .domain(v.utils.unique(v.data.nodes, 'type'))
                  .range(['tomato', 'dodgerblue', 'green'])

            }

        },

        draw : () => {

            const svg = d3.select(v.vis.svg);
            const cont = d3.select(v.vis.container);

            const links = v.data.links;
            const nodes = v.data.nodes;
            const sim = v.sim.obj;

            v.vis.links = svg.append("g")
              .attr("stroke", "black")
              .attr("stroke-width", 0.4)
              .attr("stroke-opacity", 0.8)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke", "#f20666")
                .attr("stroke-width", 0.2);
                //.attr("stroke", d => d.target.children ? null : "#f20666")
                //.attr("stroke-width", d => d.target.children ? null : 0.12);

            v.vis.nodes = svg.append("g")
              .selectAll("circle")
              .data(nodes)
              .join("circle")
              .attr("fill", d => v.vis.scales.color(d.type) )
              .attr("r", d => v.vis.scales.r(d.n) )
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)
              .call(v.sim.drag(sim));

            v.vis.nodes.append("title")
            .text(d => `${d.node} (${d.type})`);

            v.vis.labels = cont
              .selectAll('p.label.label-eixo')
              .data(nodes.filter(d => d.type == "eixo"))
              .join('p')
              .classed('label', true)
              .classed('label-eixo', true)
              .style('left', d => d.x + 'px')
              .style('top', d => d.y + 'px')
              .text(d => d.node);


            sim.on("tick", () => {
                v.vis.links
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            
                v.vis.nodes
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                v.vis.labels
                    .style("left", d => d.x + 'px')
                    .style("top", d => d.y + 'px');
            });

        },

        legenda : {

            el : 'div.legenda-cores',

            draw : () => {

                const categorias = v.utils.unique(v.data.nodes, 'type');

                const legenda = document.querySelector(v.vis.legenda.el);

                categorias.forEach(categoria => {

                    const wrapper = document.createElement('div');
                    wrapper.classList.add('legenda-key-wrapper');

                    const key = document.createElement('span');
                    const text = document.createElement('span');

                    key.style.backgroundColor = v.vis.scales.color(categoria);
                    key.classList.add('legenda-key');

                    text.classList.add('legenda-texto');
                    text.innerHTML = categoria;

                    wrapper.appendChild(key);
                    wrapper.appendChild(text);

                    legenda.appendChild(wrapper);

                })

            }

        }

    },

    interactions : {

        inicio : {

            el : 'button.inicio',

            monitora : () => {
                
                const btn = document.querySelector(v.interactions.inicio.el);
                
                btn.addEventListener('click', v.interactions.inicio.handle)

            },

            handle : (e) => {

                v.vis.links.attr('opacity', 1);
                
                v.sim.obj
                  .velocityDecay(.7)
                  .alpha(.75)
                  .restart();

            }

        },

        reset : {

            el : 'button.reset',

            monitora : () => {
                
                const btn = document.querySelector(v.interactions.reset.el);
                
                btn.addEventListener('click', v.interactions.reset.handle)

            },

            handle : (e) => {
                
                v.sim.obj
                  .stop();

                v.vis.nodes
                  .transition()
                  .duration(1000)
                  .attr('cx', d => d.x0)
                  .attr('cy', d => d.y0);

                v.vis.labels
                  .transition()
                  .duration(1000)
                  .style('left', d => d.x0 + 'px')
                  .style('top', d => d.y0 + 'px');

                // reseta posicoes no objeto nodes
                v.data.nodes.forEach(node => {
                    node.x = node.x0;
                    node.y = node.y0
                })

                v.vis.links.attr('opacity', 0);

            }

        },



    },


    ctrl : {

        init : () => {

            v.vis.sizings.get();
            v.data.read('network.json');

        },

        data_is_loaded : () => {

            v.vis.scales.set();
            v.sim.init();
            v.vis.draw();

            v.vis.legenda.draw();

            v.interactions.inicio.monitora();
            v.interactions.reset.monitora();




        }

    }

}

v.ctrl.init();